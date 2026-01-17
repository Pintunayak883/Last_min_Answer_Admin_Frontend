"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="p-6 text-center">
      <h2 className="text-lg font-semibold">Failed to load resources</h2>
      <p className="text-sm text-slate-500">{error.message}</p>
      <button onClick={reset} className="mt-4 underline">
        Try again
      </button>
    </div>
  );
}
