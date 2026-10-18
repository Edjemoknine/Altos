import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="grid min-h-screen bg-[#f7f8f4] text-[#17221b] lg:grid-cols-[minmax(0,1fr)_minmax(28rem,0.9fr)]">
      <aside className="relative isolate hidden overflow-hidden bg-[#101b15] px-10 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-16 xl:py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-52 -left-44 -z-10 size-[34rem] rounded-full bg-[#b9ec61]/10 blur-3xl"
        />
        <Link
          href="/"
          className="flex w-fit items-center gap-3 text-xl font-semibold tracking-tight"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#c5ef70] text-sm font-bold text-[#142016]">
            A
          </span>
          Altos
        </Link>

        <div className="mx-auto w-full max-w-xl py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#c5ef70]/20 bg-[#c5ef70]/10 px-3.5 py-1.5 text-xs font-medium tracking-wide text-[#d3f59a]">
            <span className="size-1.5 rounded-full bg-[#c5ef70]" />
            AI customer support, made simple
          </span>
          <h1 className="mt-7 font-heading text-5xl leading-[1.08] font-semibold tracking-tight xl:text-6xl">
            Make every customer conversation{" "}
            <span className="text-[#c5ef70]">count.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-white/60">
            Bring your support team, knowledge, and AI agents together in one
            thoughtful workspace.
          </p>

          <div className="mt-12 flex items-center gap-8 border-t border-white/10 pt-7">
            <div>
              <p className="text-2xl font-semibold tracking-tight">24/7</p>
              <p className="mt-1 text-sm text-white/50">Always-on support</p>
            </div>
            <span className="h-10 w-px bg-white/10" />
            <div>
              <p className="text-2xl font-semibold tracking-tight">&lt; 2s</p>
              <p className="mt-1 text-sm text-white/50">Average response</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-white/40">
          Helpful conversations start here.
        </p>
      </aside>

      <main className="flex min-h-screen flex-col px-6 py-8 sm:px-10 lg:justify-center lg:px-12 lg:py-12">
        <Link
          href="/"
          className="mx-auto flex w-fit items-center gap-2.5 text-lg font-semibold tracking-tight lg:hidden"
        >
          <span className="flex size-8 items-center justify-center rounded-[0.65rem] bg-[#c5ef70] text-xs font-bold text-[#142016]">
            A
          </span>
          Altos
        </Link>
        <div className="mx-auto my-auto w-full max-w-md py-10 lg:my-0 lg:py-0">
          {children}
        </div>
        <p className="mx-auto mt-8 max-w-md text-center text-xs leading-5 text-[#879087]">
          By continuing, you agree to use Altos responsibly and keep your
          account information secure.
        </p>
      </main>
    </div>
  );
}
