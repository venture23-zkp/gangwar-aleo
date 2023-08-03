program creditsb.aleo{
    record credits{
        owner: address,
        microcredits: u64
    }

    record credits_with_additional_param{
        owner: address,
        microcrediwts: u64,
        additional_param: u16
    }

    struct AB {
        a: u8,
        b: u8
    }

    record credits_with_struct {
        owner: address,
        amount: u64,
        ab: AB
    }

    transition join(a: credits, b:credits) -> credits{
        return credits{
            owner: a.owner,
            microcredits: a.microcredits + b.microcredits
        };
    }

    transition split(a: credits, amount: u64) -> (credits, credits) {
        let b: credits = credits{
            owner: a.owner,
            microcredits: amount
        };
        let c: credits = credits{
            owner: a.owner,
            microcredits: a.microcredits - amount
        };
        return (b, c);
    }

    transition transfer_private(a: credits, receiver: address, amount: u64) -> (credits, credits) {
        let b: credits = credits{
            owner: receiver,
            microcredits: amount
        };
        let c: credits = credits{
            owner: a.owner,
            microcredits: a.microcredits - amount
        };
        return (b, c);
    }

    transition transfer_private_with_struct(a: credits_with_struct, receiver: address, amount: u64) -> (credits_with_struct, credits_with_struct) {
        let b: credits_with_struct = credits_with_struct{
            owner: receiver,
            amount,
            ab: a.ab
        };
        let c: credits_with_struct = credits_with_struct{
            owner: a.owner,
            amount: a.amount - amount,
            ab: a.ab
        };
        return (b, c);
    }

    transition mint_with_struct(owner: address, amount: u64, a: u8, b:u8) -> credits_with_struct {
        return credits_with_struct{
            owner,
            amount,
            ab: AB {
                a,
                b
            }
        };
    }

    transition mint_here(owner: address, amount: u64) -> credits {
        return credits{
            owner,
            microcredits: amount
        };
    }


}
