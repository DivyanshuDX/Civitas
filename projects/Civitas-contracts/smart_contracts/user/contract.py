from algopy import (
    ARC4Contract,
    Account,
    Box,
    Bytes,
    Global,
    String,
    Txn,
    UInt64,
    arc4,
    itxn,
    op,
)


class UserAsset(arc4.Struct):
    asset_id: arc4.UInt64
    doc_type: arc4.UInt8  # 0=Aadhaar, 1=PAN, 2=VoterID
    created_at: arc4.UInt64


class UserIdentity(ARC4Contract):
    def __init__(self) -> None:
        self.asset_count = UInt64(0)

    @arc4.abimethod()
    def create_identity_asa(self, doc_type: arc4.UInt8) -> UInt64:
        assert doc_type.native <= 2, "Invalid doc type"

        # Build box key: "ua_" + sender_bytes + doc_type_byte
        box_key = Bytes(b"ua_") + Txn.sender.bytes + op.itob(doc_type.native)
        box = Box(UserAsset, key=box_key)
        assert not box, "Identity ASA already exists for this doc type"

        asset_name = String()
        unit_name = String()

        if doc_type.native == UInt64(0):
            asset_name = String("Aadhaar Identity")
            unit_name = String("AADHAR")
        elif doc_type.native == UInt64(1):
            asset_name = String("PAN Identity")
            unit_name = String("PAN")
        else:
            asset_name = String("VoterID Identity")
            unit_name = String("VOTRID")

        # Create an NFT (total=1, decimals=0) representing the identity
        result = itxn.AssetConfig(
            total=1,
            decimals=0,
            unit_name=unit_name,
            asset_name=asset_name,
            manager=Global.current_application_address,
            reserve=Txn.sender,
            fee=0,
        ).submit()

        asset_id = result.created_asset.id
        self.asset_count += 1

        # Store the mapping
        box.value = UserAsset(
            asset_id=arc4.UInt64(asset_id),
            doc_type=arc4.UInt8(doc_type.native),
            created_at=arc4.UInt64(Global.latest_timestamp),
        )

        return asset_id

    @arc4.abimethod(readonly=True)
    def get_identity_asa(self, user: Account, doc_type: arc4.UInt8) -> UserAsset:
        box_key = Bytes(b"ua_") + user.bytes + op.itob(doc_type.native)
        box = Box(UserAsset, key=box_key)
        assert bool(box), "No identity ASA found"
        return box.value.copy()

    @arc4.abimethod(readonly=True)
    def has_identity(self, user: Account, doc_type: arc4.UInt8) -> bool:
        box_key = Bytes(b"ua_") + user.bytes + op.itob(doc_type.native)
        box = Box(UserAsset, key=box_key)
        return bool(box)
