/** Universal vault reader (client + server safe, zero node deps).
 * Matrix vault + cipher ops live in ./vault-server (server-only). */
export const vault = {
  read: (key: string): string | undefined => {
    try {
      const v = (process.env as Record<string, string | undefined>)[key];
      return v ?? undefined;
    } catch { return undefined; }
  },
};

