program creditsb.aleo{
    record creditsb{
        owner: address,
        microcredits: u64
    }

    struct AB {
        a: u8,
        b: u8
    }

    record credits_with_struct {
        owner: address,
        microcredits: u64,
        ab: AB
    }

    transition join(a: creditsb, b:creditsb) -> creditsb{
        return creditsb{
            owner: a.owner,
            microcredits: a.microcredits + b.microcredits
        };
    }

    transition split(a: creditsb, amount: u64) -> (creditsb, creditsb) {
        let b: creditsb = creditsb{
            owner: a.owner,
            microcredits: amount
        };
        let c: creditsb = creditsb{
            owner: a.owner,
            microcredits: a.microcredits - amount
        };
        return (b, c);
    }

    transition transfer_private(a: creditsb, receiver: address, amount: u64) -> (creditsb, creditsb) {
        let b: creditsb = creditsb{
            owner: receiver,
            microcredits: amount
        };
        let c: creditsb = creditsb{
            owner: a.owner,
            microcredits: a.microcredits - amount
        };
        return (b, c);
    }

    transition transfer_private_with_struct(a: credits_with_struct, receiver: address, amount: u64) -> (credits_with_struct, credits_with_struct) {
        let b: credits_with_struct = credits_with_struct{
            owner: receiver,
            microcredits: amount,
            ab: a.ab
        };
        let c: credits_with_struct = credits_with_struct{
            owner: a.owner,
            microcredits: a.microcredits - amount,
            ab: a.ab
        };
        return (b, c);
    }

}
