from algopy import ARC4Contract, BoxMap, Txn, UInt64, arc4, Account, op


class Dx(ARC4Contract):
    def __init__(self) -> None:
        self.owner = Txn.sender
        self.org_count = UInt64(0)
        self.whitelisted = BoxMap(Account, UInt64, key_prefix=b"wl_")

    @arc4.abimethod()
    def whitelist_organisation(self, address: Account) -> None:
        assert Txn.sender == self.owner, "Only the owner can whitelist"
        assert address not in self.whitelisted, "Already whitelisted"
        self.org_count += 1
        self.whitelisted[address] = self.org_count

    @arc4.abimethod()
    def remove_organisation(self, address: Account) -> None:
        assert Txn.sender == self.owner, "Only the owner can remove"
        assert address in self.whitelisted, "Not whitelisted"
        del self.whitelisted[address]

    @arc4.abimethod(readonly=True)
    def is_whitelisted(self, address: Account) -> bool:
        return address in self.whitelisted

    @arc4.abimethod(readonly=True)
    def get_org_count(self) -> UInt64:
        return self.org_count

    @arc4.abimethod()
    def register_encryption_key(self, key: arc4.DynamicBytes) -> None:
        assert Txn.sender in self.whitelisted, "Not whitelisted"
        assert key.native.length == 32, "Invalid key length"
        pk_box = b"pk_" + Txn.sender.bytes
        _length, exists = op.Box.length(pk_box)
        assert not exists, "Key already registered"
        op.Box.put(pk_box, key.native)

    @arc4.abimethod()
    def update_encryption_key(self, key: arc4.DynamicBytes) -> None:
        assert Txn.sender in self.whitelisted, "Not whitelisted"
        assert key.native.length == 32, "Invalid key length"
        pk_box = b"pk_" + Txn.sender.bytes
        _length, exists = op.Box.length(pk_box)
        assert exists, "Key not registered"
        op.Box.replace(pk_box, 0, key.native)
