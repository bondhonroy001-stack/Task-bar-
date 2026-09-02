"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "@/app/actions/auth";

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form action={action} className="w-full max-w-sm space-y-4 rounded-lg border bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Create an account</h1>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            id="name"
            name="name"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          {state?.errors?.name && <p className="mt-1 text-sm text-red-600">{state.errors.name}</p>}
        </div>

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
          {state?.errors?.password && (
            <ul className="mt-1 text-sm text-red-600">
              {state.errors.password.map((error) => (
                <li key={error}>- {error}</li>
              ))}
            </ul>
          )}
        </div>

        {state?.message && <p className="text-sm text-red-600">{state.message}</p>}

        <button
          disabled={pending}
          type="submit"
          className="w-full rounded-md bg-gray-900 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Creating account..." : "Sign Up"}
        </button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-gray-900 underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
