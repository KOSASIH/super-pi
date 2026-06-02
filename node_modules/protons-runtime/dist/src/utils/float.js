const f32 = new Float32Array([-0]);
const f8b = new Uint8Array(f32.buffer);
/**
 * Writes a 32 bit float to a buffer using little endian byte order
 */
export function writeFloatLE(val, buf, pos) {
    f32[0] = val;
    buf[pos] = f8b[0];
    buf[pos + 1] = f8b[1];
    buf[pos + 2] = f8b[2];
    buf[pos + 3] = f8b[3];
}
/**
 * Writes a 32 bit float to a buffer using big endian byte order
 */
export function writeFloatBE(val, buf, pos) {
    f32[0] = val;
    buf[pos] = f8b[3];
    buf[pos + 1] = f8b[2];
    buf[pos + 2] = f8b[1];
    buf[pos + 3] = f8b[0];
}
/**
 * Reads a 32 bit float from a buffer using little endian byte order
 */
export function readFloatLE(buf, pos) {
    f8b[0] = buf[pos];
    f8b[1] = buf[pos + 1];
    f8b[2] = buf[pos + 2];
    f8b[3] = buf[pos + 3];
    return f32[0];
}
/**
 * Reads a 32 bit float from a buffer using big endian byte order
 */
export function readFloatBE(buf, pos) {
    f8b[3] = buf[pos];
    f8b[2] = buf[pos + 1];
    f8b[1] = buf[pos + 2];
    f8b[0] = buf[pos + 3];
    return f32[0];
}
const f64 = new Float64Array([-0]);
const d8b = new Uint8Array(f64.buffer);
/**
 * Writes a 64 bit double to a buffer using little endian byte order
 */
export function writeDoubleLE(val, buf, pos) {
    f64[0] = val;
    buf[pos] = d8b[0];
    buf[pos + 1] = d8b[1];
    buf[pos + 2] = d8b[2];
    buf[pos + 3] = d8b[3];
    buf[pos + 4] = d8b[4];
    buf[pos + 5] = d8b[5];
    buf[pos + 6] = d8b[6];
    buf[pos + 7] = d8b[7];
}
/**
 * Writes a 64 bit double to a buffer using big endian byte order
 */
export function writeDoubleBE(val, buf, pos) {
    f64[0] = val;
    buf[pos] = d8b[7];
    buf[pos + 1] = d8b[6];
    buf[pos + 2] = d8b[5];
    buf[pos + 3] = d8b[4];
    buf[pos + 4] = d8b[3];
    buf[pos + 5] = d8b[2];
    buf[pos + 6] = d8b[1];
    buf[pos + 7] = d8b[0];
}
/**
 * Reads a 64 bit double from a buffer using little endian byte order
 */
export function readDoubleLE(buf, pos) {
    d8b[0] = buf[pos];
    d8b[1] = buf[pos + 1];
    d8b[2] = buf[pos + 2];
    d8b[3] = buf[pos + 3];
    d8b[4] = buf[pos + 4];
    d8b[5] = buf[pos + 5];
    d8b[6] = buf[pos + 6];
    d8b[7] = buf[pos + 7];
    return f64[0];
}
/**
 * Reads a 64 bit double from a buffer using big endian byte order
 */
export function readDoubleBE(buf, pos) {
    d8b[7] = buf[pos];
    d8b[6] = buf[pos + 1];
    d8b[5] = buf[pos + 2];
    d8b[4] = buf[pos + 3];
    d8b[3] = buf[pos + 4];
    d8b[2] = buf[pos + 5];
    d8b[1] = buf[pos + 6];
    d8b[0] = buf[pos + 7];
    return f64[0];
}
//# sourceMappingURL=float.js.map