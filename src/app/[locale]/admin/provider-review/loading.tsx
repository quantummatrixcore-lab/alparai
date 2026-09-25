export default function Loading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-8 bg-zinc-800/60 rounded w-64"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-zinc-800/40 rounded-lg border border-zinc-800"></div>
        ))}
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-36 bg-zinc-800/30 rounded-lg border border-zinc-800/50"></div>
        ))}
      </div>
    </div>
  );
}