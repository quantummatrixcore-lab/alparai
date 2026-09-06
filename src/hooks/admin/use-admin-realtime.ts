"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
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
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const channel: RealtimeChannel = (supabase as any).channel(channelId);

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
        "postgres_changes" as any,
        subscriptionConfig,
        (payload: RealtimePostgresChangesPayload<T>) => {
          onChangeRef.current?.(payload);
          if (payload.eventType === "INSERT") {
            onInsertRef.current?.(payload);
          } else if (payload.eventType === "UPDATE") {
            onUpdateRef.current?.(payload);
          } else if (payload.eventType === "DELETE") {
            onDeleteRef.current?.(payload);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, schema, event, filter, enabled]);
}
