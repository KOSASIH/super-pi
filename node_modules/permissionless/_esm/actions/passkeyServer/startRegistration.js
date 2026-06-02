import { Base64 } from "ox";
const validateAttestation = (attestation) => {
    return (!!attestation &&
        ["direct", "enterprise", "indirect", "none"].includes(attestation));
};
const validateAuthenticatorSelection = (
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
authenticatorSelection) => {
    if (!authenticatorSelection)
        return false;
    const validAttachments = ["platform", "cross-platform"];
    const validKeyOptions = ["required", "preferred", "discouraged"];
    return (validAttachments.includes(authenticatorSelection.authenticatorAttachment) &&
        typeof authenticatorSelection.requireResidentKey === "boolean" &&
        validKeyOptions.includes(authenticatorSelection.residentKey) &&
        validKeyOptions.includes(authenticatorSelection.userVerification));
};
const validateChallenge = (challenge) => {
    return !!challenge && typeof challenge === "string";
};
const validateExtensions = (extensions) => {
    if (!extensions)
        return true;
    if (typeof extensions !== "object")
        return false;
    const ext = extensions;
    // Optional appid must be string if present
    if ("appid" in ext && typeof ext.appid !== "string")
        return false;
    // Optional credProps must be boolean if present
    if ("credProps" in ext && typeof ext.credProps !== "boolean")
        return false;
    // Optional hmacCreateSecret must be boolean if present
    if ("hmacCreateSecret" in ext && typeof ext.hmacCreateSecret !== "boolean")
        return false;
    // Optional minPinLength must be boolean if present
    if ("minPinLength" in ext && typeof ext.minPinLength !== "boolean")
        return false;
    return true;
};
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const validateRp = (rp) => {
    return !!rp && typeof rp.id === "string" && typeof rp.name === "string";
};
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const validateUser = (user) => {
    return (!!user &&
        typeof user.id === "string" &&
        typeof user.name === "string" &&
        typeof user.displayName === "string");
};
export const startRegistration = async (client, args) => {
    const response = await client.request({
        method: "pks_startRegistration",
        params: [args?.context]
    });
    // Validate the response matches expected schema
    if (!validateAttestation(response.attestation) ||
        !validateAuthenticatorSelection(response.authenticatorSelection) ||
        !validateChallenge(response.challenge) ||
        !validateExtensions(response.extensions) ||
        !validateRp(response.rp) ||
        !validateUser(response.user)) {
        throw new Error("Invalid response format from passkey server");
    }
    const credentialOptions = {
        attestation: response.attestation,
        authenticatorSelection: response.authenticatorSelection,
        challenge: Base64.toBytes(response.challenge),
        extensions: response.extensions
            ? {
                ...response.extensions
            }
            : undefined,
        rp: response.rp,
        timeout: response.timeout,
        user: {
            id: Base64.toBytes(response.user.id),
            name: response.user.name,
            displayName: response.user.displayName
        }
    };
    return credentialOptions;
};
//# sourceMappingURL=startRegistration.js.map