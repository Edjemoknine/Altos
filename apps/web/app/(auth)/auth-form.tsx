"use client";

import { useState, type FormEvent } from "react";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
};

export function AuthForm({ mode }: AuthFormProps) {
  const [notice, setNotice] = useState("");
  const isSignUp = mode === "sign-up";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(
      "Authentication is not connected yet. Your details have not been sent.",
    );
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      {isSignUp && (
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-[#303a32]"
          >
            Full name
          </label>
          <input
            autoComplete="name"
            className="h-12 w-full rounded-xl border border-[#dfe5d9] bg-white px-4 text-sm outline-none transition placeholder:text-[#a0a89f] focus:border-[#7c9d50] focus:ring-4 focus:ring-[#c5ef70]/20"
            id="name"
            name="name"
            placeholder="Your name"
            required
          />
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-[#303a32]"
        >
          Work email
        </label>
        <input
          autoComplete="email"
          className="h-12 w-full rounded-xl border border-[#dfe5d9] bg-white px-4 text-sm outline-none transition placeholder:text-[#a0a89f] focus:border-[#7c9d50] focus:ring-4 focus:ring-[#c5ef70]/20"
          id="email"
          name="email"
          placeholder="you@company.com"
          required
          type="email"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-[#303a32]"
        >
          Password
        </label>
        <input
          autoComplete={isSignUp ? "new-password" : "current-password"}
          className="h-12 w-full rounded-xl border border-[#dfe5d9] bg-white px-4 text-sm outline-none transition placeholder:text-[#a0a89f] focus:border-[#7c9d50] focus:ring-4 focus:ring-[#c5ef70]/20"
          id="password"
          minLength={8}
          name="password"
          placeholder="At least 8 characters"
          required
          type="password"
        />
        {isSignUp && (
          <p className="mt-2 text-xs text-[#879087]">
            Use at least 8 characters.
          </p>
        )}
      </div>

      <button
        className="flex h-12 w-full items-center justify-center rounded-xl bg-[#17221b] px-5 text-sm font-semibold text-white transition hover:bg-[#304536] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#547833]"
        type="submit"
      >
        {isSignUp ? "Create account" : "Sign in"}
        <span aria-hidden="true" className="ml-2 text-[#c5ef70]">
          →
        </span>
      </button>

      <p aria-live="polite" className="min-h-5 text-center text-sm text-[#657067]">
        {notice}
      </p>
    </form>
  );
}
