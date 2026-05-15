import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto";

const ALGO = "aes-256-gcm";
const IV_LEN = 12;
const KEY_LEN = 32;

function keyFromMaster(masterHex: string): Buffer {
  const key = Buffer.from(masterHex, "hex");
  if (key.length !== KEY_LEN) {
    throw new Error("Invalid master key length");
  }
  return key;
}

export type EncryptedPayload = {
  ciphertext: string;
  iv: string;
  authTag: string;
};

export function encryptSecret(plaintext: string, masterKeyHex: string): EncryptedPayload {
  const key = keyFromMaster(masterKeyHex);
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv, { authTagLength: 16 });
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    ciphertext: enc.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
  };
}

export function decryptSecret(payload: EncryptedPayload, masterKeyHex: string): string {
  const key = keyFromMaster(masterKeyHex);
  const iv = Buffer.from(payload.iv, "base64");
  const authTag = Buffer.from(payload.authTag, "base64");
  const decipher = createDecipheriv(ALGO, key, iv, { authTagLength: 16 });
  decipher.setAuthTag(authTag);
  const dec = Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, "base64")),
    decipher.final(),
  ]);
  return dec.toString("utf8");
}

export function fingerprintSecret(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}
