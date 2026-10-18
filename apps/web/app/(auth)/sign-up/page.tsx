import Link from "next/link";
import { AuthForm } from "../auth-form";

export default function SignUpPage() {
  return (
    <section aria-labelledby="sign-up-heading">
      <span className="inline-flex items-center gap-2 rounded-full bg-[#e8f0dd] px-3 py-1.5 text-xs font-semibold tracking-wide text-[#547833]">
        Start building better support
      </span>
      <h2
        id="sign-up-heading"
        className="mt-5 font-heading text-3xl font-semibold tracking-tight sm:text-4xl"
      >
        Create your account
      </h2>
      <p className="mt-3 text-sm leading-6 text-[#657067]">
        Set up your workspace and bring your AI support team to life.
      </p>

      <AuthForm mode="sign-up" />

      <p className="mt-6 text-center text-sm text-[#657067]">
        Already have an account?{" "}
        <Link
          className="font-semibold text-[#38582b] underline-offset-4 hover:underline"
          href="/sign-in"
        >
          Sign in
        </Link>
      </p>
    </section>
  );
}
