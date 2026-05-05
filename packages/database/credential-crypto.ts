import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";

export type EncryptedCredentialData = {
    iv: string;
    authTag: string;
    ciphertext: string;
};

function getKey(): Buffer {
    const key = process.env.CREDENTIAL_ENCRYPTION_KEY;

    if (!key) {
        throw new Error("CREDENTIAL_ENCRYPTION_KEY is not set");
    }

    const buffer = Buffer.from(key, "base64");

    if (buffer.length !== 32) {
        throw new Error("CREDENTIAL_ENCRYPTION_KEY must be a base64-encoded 32-byte key");
    }

    return buffer;
}

// Encrypts a credential's data before it's written to Credential.data —
// AES-256-GCM with a random IV per credential, so a DB read/backup leak
// doesn't hand over live API keys/OAuth tokens directly.
export function encryptCredentialData(data: unknown): EncryptedCredentialData {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

    const plaintext = Buffer.from(JSON.stringify(data), "utf8");
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
        iv: iv.toString("base64"),
        authTag: authTag.toString("base64"),
        ciphertext: ciphertext.toString("base64"),
    };
}

export function decryptCredentialData<T = unknown>(encrypted: unknown): T {
    const { iv, authTag, ciphertext } = encrypted as EncryptedCredentialData;

    if (!iv || !authTag || !ciphertext) {
        throw new Error("Credential data is not in the expected encrypted shape");
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(iv, "base64"));
    decipher.setAuthTag(Buffer.from(authTag, "base64"));

    const plaintext = Buffer.concat([
        decipher.update(Buffer.from(ciphertext, "base64")),
        decipher.final(),
    ]);

    return JSON.parse(plaintext.toString("utf8")) as T;
}
