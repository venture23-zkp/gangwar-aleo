// Basic Implementation of Digital Signature Algorithm based on Schnorr Signature
program dsa.aleo {


    // Payload can be arbitrary as per the requirement
    struct Payload {
        m1: field,
        m2: field,
        m3: field
    }

    struct Signature {
        r: group,
        s: group,
    }

    struct HashStruct {
        m: Payload,
        r: group
    }

    // sk must be in between 0 and the order of the curve
    // Order of the curve (n): 2111115437357092606062206234695386632838870926408408195193685246394721360383
    // Reference: https://developer.aleo.org/advanced/the_aleo_curves/edwards_bls12

    /// Gets the public key provided the secret key
    /// sk: scalar - secret key
    /// 2500 constraints
    transition get_public_key(sk: scalar) -> group {
        return sk.mul(group::GEN);
    }

    /// Signs a users arbitray message
    /// m: Struct - Arbitrary message to be signed by a user
    /// sk: scalar - Secret Key of the Signer
    /// k: scalar - A random number sampled between 0 and n


    /// Warning: k should never be used twice
    /// 18,321 constraints
    transition sign(m: Payload, sk: scalar, k: scalar) -> Signature {
        let r: group = k * group::GEN;
        let h: HashStruct = HashStruct {
            m,
            r
        };
        let e: scalar = BHP256::hash_to_scalar(h);

        let s: group = k*group::GEN + e.mul(group::GEN).mul(sk); 

        let signature: Signature = Signature{
            r,
            s,
        };
        
        return signature;
    }

    /// Verifies if a message m is signed by a particular sk based on signature
    /// m: Struct - Arbitrary message signed by a user
    /// pk: group - Public Key of the signer
    /// signature: Signature of the signer

    // 10,318 constraints
    transition verify(m: Payload, pk: group, signature: Signature) -> bool {
        let h: HashStruct = HashStruct {
            m,
            r: signature.r
        };
        let e: scalar = BHP256::hash_to_scalar(h);

        let right: group = signature.r + pk.mul(e);
        let verified:bool = right.eq(signature.s);

        return verified;
    }
}
