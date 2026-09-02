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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900">Task Board</h1>
      <p className="mt-4 max-w-md text-lg text-gray-600">
        A simple, real-time collaborative task board. Organize your work into boards, lists, and cards.
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/signup" className="rounded-md bg-gray-900 px-6 py-3 text-sm font-medium text-white">
          Get Started
        </Link>
        <Link href="/login" className="rounded-md border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700">
          Log In
        </Link>
      </div>
    </div>
  );
}
