# src/services/crypto.py
# Provides cryptographic hashing utilities for AutoNIST Core.
# Later, this will integrate with a FIPS 140-3 validated module.

import hashlib

def fips_hash(data: bytes) -> str:
    """
    Performs a SHA-384 hash on the given data.
    This algorithm is approved under FIPS 180-4 and acceptable
    for use in FIPS 140-2/3 validated environments.
    """
    return hashlib.sha384(data).hexdigest()

if __name__ == "__main__":
    # Simple test when running standalone
    test_data = b"AutoNIST Test"
    print("Hash:", fips_hash(test_data))
