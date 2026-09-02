"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form action={action} className="w-full max-w-sm space-y-4 rounded-lg border bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Log in</h1>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          {state?.errors?.email && <p className="mt-1 text-sm text-red-600">{state.errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          {state?.errors?.password && <p className="mt-1 text-sm text-red-600">{state.errors.password}</p>}
        </div>

        {state?.message && <p className="text-sm text-red-600">{state.message}</p>}

        <button
          disabled={pending}
          type="submit"
          className="w-full rounded-md bg-gray-900 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Logging in..." : "Log In"}
        </button>

        <p className="text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-gray-900 underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
