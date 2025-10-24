"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-8">
      <h1 className="text-2xl font-semibold mb-4">
        👋 Welcome to <span className="text-blue-600">NextShield</span>
      </h1>

      <div className="flex space-x-4">
        <Link
          href="/auth/sign-in"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Sign In
        </Link>

        <Link
          href="/auth/sign-up"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Sign Up
        </Link>
      </div>
    </main>
  );
}
