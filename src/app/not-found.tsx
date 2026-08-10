import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-4xl font-semibold text-foreground">404</h1>
      <p className="text-sm text-muted-foreground">This page could not be found.</p>
      <Link href="/dashboard" className="text-sm font-medium text-primary underline">
        Back to Dashboard
      </Link>
    </div>
  );
}
