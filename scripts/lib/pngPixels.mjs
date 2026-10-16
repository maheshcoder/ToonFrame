import { inflateSync } from 'node:zlib';
// Local asset audit only: decode non-interlaced, 8-bit RGB/RGBA PNGs.
export function pngPixels(bytes) {
  if (bytes.length < 33 || bytes.toString('hex', 0, 8) !== '89504e470d0a1a0a') throw new Error('Invalid PNG.');
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20), depth = bytes[24], color = bytes[25];
  if (!width || !height || width * height > 24_000_000) throw new Error('PNG must be between 1 pixel and 24 megapixels.');
  if (depth !== 8 || ![2,6].includes(color) || bytes[28] !== 0) throw new Error('Save built-in sheets as non-interlaced 8-bit RGB/RGBA PNG.');
  const channels = color === 6 ? 4 : 3, stride = width * channels, chunks = [];
  for (let offset = 8; offset + 12 <= bytes.length;) {
    const length = bytes.readUInt32BE(offset), end = offset + 12 + length;
    if (end > bytes.length) throw new Error('Truncated PNG chunk.');
    if (bytes.toString('ascii', offset+4, offset+8) === 'IDAT') chunks.push(bytes.subarray(offset+8, offset+8+length));
    offset = end;
  }
  const expected = (stride + 1) * height;
  const raw = inflateSync(Buffer.concat(chunks), { maxOutputLength: expected });
  if (raw.length !== expected) throw new Error('Unexpected PNG scanline length.');
  const decoded = new Uint8Array(stride * height), data = new Uint8Array(width * height * 4);
  const paeth = (a,b,c) => { const p = a+b-c, pa = Math.abs(p-a), pb = Math.abs(p-b), pc = Math.abs(p-c); return pa <= pb && pa <= pc ? a : pb <= pc ? b : c; };
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride+1)];
    if (filter > 4) throw new Error('Invalid PNG filter.');
    for (let x = 0; x < stride; x++) {
      const index = y*stride+x, a = x >= channels ? decoded[index-channels] : 0, b = y ? decoded[index-stride] : 0, c = y && x >= channels ? decoded[index-stride-channels] : 0;
      decoded[index] = raw[y*(stride+1)+1+x] + [0,a,b,Math.floor((a+b)/2),paeth(a,b,c)][filter];
    }
  }
  for (let i = 0, j = 0; i < decoded.length; i += channels, j += 4) {
    data[j] = decoded[i]; data[j+1] = decoded[i+1]; data[j+2] = decoded[i+2]; data[j+3] = channels === 4 ? decoded[i+3] : 255;
  }
  return { width, height, data };
}