import { ShimmerButton } from "@/components/ui/shimmer-button";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center px-5 py-20 md:px-10">
      <div className="mx-auto max-w-xl text-center">
        <p className="u-eyebrow text-muted">Nothing here</p>
        <h1 className="mt-4 u-display text-[clamp(3rem,14vw,7rem)]">
          Gone
          <br />
          for good.
        </h1>
        <p className="mt-6 text-muted">
          This page has moved on. Maybe it was given away.
        </p>
        <div className="mt-8 flex justify-center">
          <ShimmerButton href="/">Back to the market</ShimmerButton>
        </div>
      </div>
    </main>
  );
}
