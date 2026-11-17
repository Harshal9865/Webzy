import Link from 'next/link';

export default function WebNotFoundPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="rounded-3xl border border-webzy-tint bg-webzy-surface p-8">
        <h1 className="font-heading text-3xl font-bold text-webzy-ink">Page not found</h1>
        <p className="mt-2 text-sm text-webzy-ink/75">
          The link you opened is not available right now. You can browse ready-made Webzy themes below.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/themes"
            className="inline-flex min-h-[44px] items-center rounded-full bg-webzy-primary px-6 text-sm font-bold text-white"
          >
            Browse themes
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center rounded-full border border-webzy-tint bg-white px-5 text-sm font-bold text-webzy-ink"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
