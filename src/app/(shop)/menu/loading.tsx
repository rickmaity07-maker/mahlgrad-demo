/** Shown while the menu streams in; shaped like the real page so nothing jumps. */
export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6" aria-busy="true">
      <div className="skeleton h-16 w-64 md:h-24 md:w-96" />
      <div className="mt-8 flex gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="skeleton h-9 w-28" />
        ))}
      </div>
      <div className="mt-12 grid gap-x-10 gap-y-6 sm:grid-cols-2">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="skeleton size-20 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-5 w-2/3" />
              <div className="skeleton h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
