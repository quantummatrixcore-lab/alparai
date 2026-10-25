"use client";

import { useEffect, useRef } from "react";
import { dehost } from "@/lib/dehost/client";
export type RealtimeChannel = ReturnType<typeof dehost.channel>;
export interface RealtimePostgresChangesPayload<T> {
  eventType?: "INSERT" | "UPDATE" | "DELETE" | "*";
  new: T;
  old?: Partial<T>;
  schema?: string;
  table?: string;
  commit_timestamp?: string;
  errors?: unknown[] | null;
}
import type { Database } from "@/types/database";

export type TableName = keyof Database["public"]["Tables"];
export type PostgresChangeEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

export interface UseAdminRealtimeOptions<T extends { [key: string]: unknown }> {
  table: TableName;
  schema?: string;
  event?: PostgresChangeEvent;
  filter?: string;
  enabled?: boolean;
  onInsert?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onUpdate?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onDelete?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onChange?: (payload: RealtimePostgresChangesPayload<T>) => void;
}

export function useAdminRealtime<T extends { [key: string]: unknown } = Record<string, unknown>>({
  table,
  schema = "public",
  event = "*",
  filter,
  enabled = true,
  onInsert,
  onUpdate,
  onDelete,
  onChange,
}: UseAdminRealtimeOptions<T>): void {
  const onInsertRef = useRef(onInsert);
  const onUpdateRef = useRef(onUpdate);
  const onDeleteRef = useRef(onDelete);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onInsertRef.current = onInsert;
    onUpdateRef.current = onUpdate;
    onDeleteRef.current = onDelete;
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    if (!enabled) return;

    const channelId = "admin-rt-" + String(table) + "-" + event + "-" + (filter || "all") + "-" + Math.random().toString(36).substring(2, 8);
    
    const channel: RealtimeChannel = dehost.channel(channelId);

    const subscriptionConfig: {
      event: PostgresChangeEvent;
      schema: string;
      table: string;
      filter?: string;
    } = {
      event,
      schema,
      table,
    };

    if (filter) {
      subscriptionConfig.filter = filter;
    }

    channel
      .on(
        "postgres_changes",
        subscriptionConfig,
        (payload: unknown) => {
          const typedPayload = payload as RealtimePostgresChangesPayload<T>;
          onChangeRef.current?.(typedPayload);
          if (typedPayload.eventType === "INSERT") {
            onInsertRef.current?.(typedPayload);
          } else if (typedPayload.eventType === "UPDATE") {
            onUpdateRef.current?.(typedPayload);
          } else if (typedPayload.eventType === "DELETE") {
            onDeleteRef.current?.(typedPayload);
          }
        }
      )
            .subscribe();

    return () => {
      dehost.removeChannel(channel);
    };
  }, [table, schema, event, filter, enabled]);
}
