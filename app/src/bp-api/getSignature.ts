
import { eddsa } from 'elliptic';
import { encode as base64Encode, decode as base64Decode } from 'js-base64';

const ed25519 = new eddsa('ed25519');

export const getSignature = (method: string, secretKey: string, timestamp: string, requestBody: Record<string, unknown>) => {
    const message = {
        instruction: method,
        ...requestBody,
        timestamp,
        window: '5000',
    }

    const messageString = new URLSearchParams(message).toString()

    console.log(messageString)
    const messageBuffer = new TextEncoder().encode(messageString);

    const decodedKey = base64Decode(secretKey);
    console.log(decodedKey.length)

    const keyPair = ed25519.keyFromSecret(decodedKey);
    const signature = keyPair.sign(Array.from(messageBuffer) as unknown as Buffer).toHex();

    // const signature = ed.sign(messageBuffer, Uint8Array.from(decodedKey, c => c.charCodeAt(0)));
    const signatureBase64 = base64Encode(signature);

    return signatureBase64
}