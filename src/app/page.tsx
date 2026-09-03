import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt } from "@/lib/session";

export default async function Home() {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  if (session?.userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fafafa] px-6 text-center">
      <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-sm font-semibold text-white">
        T
      </div>
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">Task Board</h1>
      <p className="mt-3 max-w-sm text-base text-zinc-500">
        A simple, focused way to organize your work into boards, lists, and cards.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/signup"
          className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          Get Started
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          Log In
        </Link>
      </div>
    </div>
  );
}
