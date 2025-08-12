export default function Loading() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
      <div className="mb-12 text-left max-w-4xl mr-auto">
        <div className="h-6 w-2/3 bg-gray-200 rounded-xs mb-3" />
        <div className="h-4 w-5/6 bg-gray-200 rounded-xs" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 md:gap-8 lg:gap-12 min-h-[60vh] md:min-h-[70vh]">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={`skeleton-${idx}`} className="space-y-4">
            <div className="aspect-[4/5] bg-gray-200 rounded-xs" />
            <div className="space-y-3">
              <div className="h-5 w-2/3 bg-gray-200 rounded-xs" />
              <div className="h-3 w-1/3 bg-gray-200 rounded-xs" />
              <div className="h-3 w-full bg-gray-200 rounded-xs" />
              <div className="h-3 w-5/6 bg-gray-200 rounded-xs" />
              <div className="h-8 w-32 bg-gray-200 rounded-xs" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
