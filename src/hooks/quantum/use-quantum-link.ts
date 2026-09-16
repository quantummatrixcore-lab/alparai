"use client";

import { useEffect, useRef, useCallback } from "react";
import { dehost } from "@/lib/dehost/client";
import { QuantumCodec } from "@/lib/quantum/binary-codec";

export interface SovereignRealtimeChannel {
  on: (event: string, filter: unknown, callback?: (payload: unknown) => void) => SovereignRealtimeChannel;
  send: (payload: unknown) => Promise<unknown>;
  subscribe: (callback?: (status: string) => void) => unknown;
}

export interface QuantumLinkOptions {
  topic: string;
  enabled?: boolean;
  onBinaryPayload?: (payload: Uint8Array) => void;
  onTelemetry?: (data: { id: number; timestamp: number; value: number }) => void;
  onString?: (payload: string) => void;
}

/**
 * useQuantumLink
 * 
 * Maximum Speed React Hook for real-time frontend communication.
 * Bypasses database disk I/O completely by using in-memory Broadcast channels via DeHost.
 * Uses Base64 wrapped binary ArrayBuffers to eliminate JSON structural parsing overhead.
 */
export function useQuantumLink({
  topic,
  enabled = true,
  onBinaryPayload,
  onTelemetry,
  onString
}: QuantumLinkOptions) {
  const channelRef = useRef<SovereignRealtimeChannel | null>(null);
  
  const handleMessage = useCallback((payload: { payload: string | { b64?: string; text?: string } }) => {
    if (!payload.payload) return;
    
    const data = payload.payload as { b64?: string; text?: string };
    
    if (data.b64) {
      const buffer = QuantumCodec.fromBase64(data.b64);
      if (onBinaryPayload) onBinaryPayload(buffer);
      
      // If it matches telemetry length (16 bytes)
      if (onTelemetry && buffer.byteLength === 16) {
        const rawAb = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
        onTelemetry(QuantumCodec.decodeTelemetry(rawAb as ArrayBuffer));
      }
    }
    
    if (data.text && onString) {
      onString(data.text);
    }
  }, [onBinaryPayload, onTelemetry, onString]);

  useEffect(() => {
    if (!enabled) return;

    const channelId = `quantum-link-${topic}`;
    const channel = dehost.channel(channelId, {
      config: {
        broadcast: { ack: false } // Fire and forget for max speed
      }
    });

    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'quantum_pulse' }, handleMessage)
      .subscribe();

    return () => {
      dehost.removeChannel(channel);
      channelRef.current = null;
    };
  }, [topic, enabled, handleMessage]);

  /**
   * Blast a binary telemetry packet to all connected clients instantly (Zero-DB latency)
   */
  const emitTelemetry = useCallback(async (id: number, value: number) => {
    if (!channelRef.current) return;
    const buffer = QuantumCodec.encodeTelemetry(id, value);
    const b64 = QuantumCodec.toBase64(buffer);
    
    await channelRef.current.send({
      type: 'broadcast',
      event: 'quantum_pulse',
      payload: { b64 }
    });
  }, []);

  return { emitTelemetry };
}
