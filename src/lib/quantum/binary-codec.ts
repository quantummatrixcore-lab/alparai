/**
 * src/lib/quantum/binary-codec.ts
 * Quantum-Speed Binary Codec for Zero-Copy Network Payloads
 * Translates standard JS objects into dense ArrayBuffers to bypass JSON.parse/stringify overhead.
 */

export class QuantumCodec {
  // Max payload size 4MB (Cloudflare limit is 4.5MB)
  private static BUFFER_SIZE = 4 * 1024 * 1024; 
  private static textEncoder = new TextEncoder();
  private static textDecoder = new TextDecoder();

  /**
   * Encodes a string payload into a raw Uint8Array
   */
  static encodeString(payload: string): Uint8Array {
    return this.textEncoder.encode(payload);
  }

  /**
   * Decodes a raw Uint8Array into a string
   */
  static decodeString(buffer: Uint8Array | ArrayBuffer): string {
    return this.textDecoder.decode(buffer);
  }

  /**
   * Encodes critical metrics (e.g., telemetry) tightly into an ArrayBuffer
   * Layout: [4 bytes: ID] [8 bytes: Timestamp] [4 bytes: Value (Float32)]
   */
  static encodeTelemetry(id: number, value: number): ArrayBuffer {
    const buffer = new ArrayBuffer(16);
    const view = new DataView(buffer);
    
    view.setUint32(0, id, true); // Little endian
    // Date.now() fits in Float64, but we use 2 Uint32s for 64-bit int precision in JS
    const now = Date.now();
    view.setUint32(4, Math.floor(now / 4294967296), true); // High
    view.setUint32(8, now % 4294967296, true); // Low
    view.setFloat32(12, value, true);
    
    return buffer;
  }

  /**
   * Decodes critical metrics back to an object
   */
  static decodeTelemetry(buffer: ArrayBuffer) {
    const view = new DataView(buffer);
    const id = view.getUint32(0, true);
    const high = view.getUint32(4, true);
    const low = view.getUint32(8, true);
    const timestamp = (high * 4294967296) + low;
    const value = view.getFloat32(12, true);

    return { id, timestamp, value };
  }

  /**
   * Base64 encode for transporting binary over JSON/WebSocket boundaries 
   * when native binary frames are unavailable.
   */
  static toBase64(buffer: ArrayBuffer | Uint8Array): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i] ?? 0);
    }
    return typeof window !== "undefined" ? window.btoa(binary) : Buffer.from(bytes).toString('base64');
  }

  /**
   * Base64 decode to binary ArrayBuffer
   */
  static fromBase64(base64: string): Uint8Array {
    if (typeof window !== "undefined") {
      const binary = window.atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    } else {
      return new Uint8Array(Buffer.from(base64, 'base64'));
    }
  }
}
