from algopy import (
    ARC4Contract,
    Account,
    Application,
    BoxMap,
    Global,
    Txn,
    UInt64,
    arc4,
)

from ..dx.contract import Dx


class ConsentRequest(arc4.Struct):
    org: arc4.Address
    user: arc4.Address
    doc_type: arc4.UInt8  # 0=Aadhaar, 1=PAN, 2=VoterID
    reason: arc4.String
    id_details: arc4.String  # link/URI to the ID document
    requested_fields: arc4.UInt16  # bitmask of fields the org wants
    shared_fields: arc4.UInt16  # bitmask of fields the user actually shared
    expiry: arc4.UInt64
    duration: arc4.UInt64  # consent duration in seconds (for display)
    created_at: arc4.UInt64
    status: arc4.UInt8  # 0=Pending, 1=Approved, 2=Rejected, 3=Revoked


class OrgConsent(ARC4Contract):
    def __init__(self) -> None:
        self.owner = Txn.sender
        self.whitelist_app = UInt64(0)
        self.request_count = UInt64(0)
        self.requests = BoxMap(UInt64, ConsentRequest, key_prefix=b"cr_")

    @arc4.abimethod()
    def set_whitelist_app(self, app: Application) -> None:
        assert Txn.sender == self.owner, "Only owner"
        self.whitelist_app = app.id

    @arc4.abimethod()
    def request_consent(
        self,
        user: Account,
        doc_type: arc4.UInt8,
        reason: arc4.String,
        id_details: arc4.String,
        requested_fields: arc4.UInt16,
        duration: UInt64,
    ) -> UInt64:
        assert self.whitelist_app != 0, "Whitelist app not set"
        assert doc_type.native <= 2, "Invalid doc type"
        assert requested_fields.native > 0, "Must request at least one field"

        # Verify caller is a whitelisted org via inner app call
        is_whitelisted, _txn = arc4.abi_call(
            Dx.is_whitelisted,
            Txn.sender,
            app_id=Application(self.whitelist_app),
        )
        assert is_whitelisted, "Organisation not whitelisted"

        self.request_count += 1
        # expiry = response deadline (24h for user to respond)
        # duration = consent window (starts counting only after approval)
        response_deadline = Global.latest_timestamp + UInt64(86400)  # 24h response window

        self.requests[self.request_count] = ConsentRequest(
            org=arc4.Address(Txn.sender),
            user=arc4.Address(user),
            doc_type=arc4.UInt8(doc_type.native),
            reason=arc4.String(reason.native),
            id_details=arc4.String(id_details.native),
            requested_fields=arc4.UInt16(requested_fields.native),
            shared_fields=arc4.UInt16(0),
            expiry=arc4.UInt64(response_deadline),
            duration=arc4.UInt64(duration),
            created_at=arc4.UInt64(Global.latest_timestamp),
            status=arc4.UInt8(0),  # Pending
        )

        return self.request_count

    @arc4.abimethod()
    def approve_consent(
        self, request_id: UInt64, id_details: arc4.String, shared_fields: arc4.UInt16
    ) -> None:
        assert request_id in self.requests, "Request not found"
        request = self.requests[request_id].copy()
        assert Txn.sender == request.user.native, "Only the user can approve"
        assert request.status.native == 0, "Request already resolved"
        assert Global.latest_timestamp <= request.expiry.native, "Request expired"
        assert shared_fields.native > 0, "Must share at least one field"
        # shared_fields must be a subset of requested_fields
        assert (
            shared_fields.native & request.requested_fields.native
        ) == shared_fields.native, "Cannot share unrequested fields"

        # Consent duration starts NOW (from approval time)
        consent_expiry = Global.latest_timestamp + request.duration.native

        self.requests[request_id] = ConsentRequest(
            org=request.org,
            user=request.user,
            doc_type=arc4.UInt8(request.doc_type.native),
            reason=arc4.String(request.reason.native),
            id_details=arc4.String(id_details.native),
            requested_fields=request.requested_fields,
            shared_fields=arc4.UInt16(shared_fields.native),
            expiry=arc4.UInt64(consent_expiry),
            duration=request.duration,
            created_at=request.created_at,
            status=arc4.UInt8(1),  # Approved
        )

    @arc4.abimethod()
    def reject_consent(self, request_id: UInt64) -> None:
        assert request_id in self.requests, "Request not found"
        request = self.requests[request_id].copy()
        assert Txn.sender == request.user.native, "Only the user can reject"
        assert request.status.native == 0, "Request already resolved"

        self.requests[request_id] = ConsentRequest(
            org=request.org,
            user=request.user,
            doc_type=arc4.UInt8(request.doc_type.native),
            reason=arc4.String(request.reason.native),
            id_details=arc4.String(request.id_details.native),
            requested_fields=request.requested_fields,
            shared_fields=arc4.UInt16(0),
            expiry=request.expiry,
            duration=request.duration,
            created_at=request.created_at,
            status=arc4.UInt8(2),  # Rejected
        )

    @arc4.abimethod()
    def revoke_consent(self, request_id: UInt64) -> None:
        assert request_id in self.requests, "Request not found"
        request = self.requests[request_id].copy()
        assert Txn.sender == request.user.native, "Only the user can revoke"
        assert request.status.native == 1, "Can only revoke approved consent"

        self.requests[request_id] = ConsentRequest(
            org=request.org,
            user=request.user,
            doc_type=arc4.UInt8(request.doc_type.native),
            reason=arc4.String(request.reason.native),
            id_details=arc4.String(""),  # Clear encrypted data
            requested_fields=request.requested_fields,
            shared_fields=request.shared_fields,  # Preserve for audit trail
            expiry=arc4.UInt64(Global.latest_timestamp),  # Immediately invalidate
            duration=request.duration,
            created_at=request.created_at,
            status=arc4.UInt8(3),  # Revoked
        )

    @arc4.abimethod(readonly=True)
    def get_request(self, request_id: UInt64) -> ConsentRequest:
        assert request_id in self.requests, "Request not found"
        return self.requests[request_id].copy()

    @arc4.abimethod(readonly=True)
    def is_consent_valid(self, request_id: UInt64) -> bool:
        assert request_id in self.requests, "Request not found"
        request = self.requests[request_id].copy()
        return bool(
            request.status.native == 1
            and Global.latest_timestamp <= request.expiry.native
        )
