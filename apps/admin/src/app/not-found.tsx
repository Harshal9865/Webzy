import Link from 'next/link';

export default function AdminNotFoundPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12 text-center">
      <div className="rounded-3xl border border-webzy-tint bg-webzy-surface p-7">
        <h1 className="font-heading text-2xl font-bold text-webzy-ink">Admin Route Not Found</h1>
        <div className="mt-5">
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center rounded-full bg-webzy-primary px-5 text-xs font-bold text-white"
          >
            Back to Admin Home
          </Link>
        </div>
      </div>
    </main>
  );
}
