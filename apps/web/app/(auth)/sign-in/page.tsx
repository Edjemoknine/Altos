import Link from "next/link";
import { AuthForm } from "../auth-form";

export default function SignInPage() {
  return (
    <section aria-labelledby="sign-in-heading">
      <span className="inline-flex items-center gap-2 rounded-full bg-[#e8f0dd] px-3 py-1.5 text-xs font-semibold tracking-wide text-[#547833]">
        Welcome back
      </span>
      <h2
        id="sign-in-heading"
        className="mt-5 font-heading text-3xl font-semibold tracking-tight sm:text-4xl"
      >
        Sign in to Altos
      </h2>
      <p className="mt-3 text-sm leading-6 text-[#657067]">
        Pick up where you left off and keep your support moving.
      </p>

      <AuthForm mode="sign-in" />

      <p className="mt-6 text-center text-sm text-[#657067]">
        New to Altos?{" "}
        <Link
          className="font-semibold text-[#38582b] underline-offset-4 hover:underline"
          href="/sign-up"
        >
          Create an account
        </Link>
      </p>
    </section>
  );
}
