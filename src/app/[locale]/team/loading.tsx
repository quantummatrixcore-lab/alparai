export default function Loading() {
  return (
    <div className="min-h-screen bg-bg-primary animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="h-8 bg-bg-secondary rounded-lg w-1/3 mb-6" />
        <div className="h-4 bg-bg-secondary rounded w-2/3 mb-12" />
        <div className="grid gap-6">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-24 bg-bg-secondary rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
