
import * as ed from '@noble/ed25519';

export const getSignature = async (method: string, secretKey: string, timestamp: string, requestBody: Record<string, unknown>) => {
    const message = {
        instruction: method,
        ...requestBody,
        timestamp,
        window: "60000",
    }

    const messageString = new URLSearchParams(message).toString()
    console.log(messageString)
    const messageBuffer = new TextEncoder().encode(messageString);

    const decodedKey = Uint8Array.from(Buffer.from(secretKey, 'base64'));;

    const signature = await ed.signAsync(messageBuffer, decodedKey);

    const signatureBase64 = Buffer.from(signature).toString('base64');

    return signatureBase64
}