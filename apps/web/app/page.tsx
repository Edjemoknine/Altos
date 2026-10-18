const metrics = [
  { label: "Agents launched", value: "1.2K+" },
  { label: "Avg. response time", value: "< 2s" },
  { label: "Support coverage", value: "24/7" },
];

const features = [
  {
    title: "Multi-agent workspace",
    description:
      "Create, manage, and personalize multiple AI agents for different teams, products, or customer journeys.",
  },
  {
    title: "Knowledge-powered answers",
    description:
      "Upload documents or scrape site content to ground each assistant in your business context and documentation.",
  },
  {
    title: "Voice + text support",
    description:
      "Let visitors chat in real time or speak naturally with text-to-speech and speech-to-text support built in.",
  },
  {
    title: "Embedded website widget",
    description:
      "Deploy a lightweight script anywhere to help visitors instantly reach your AI support assistant.",
  },
];

const workflow = [
  "Create your account and workspace",
  "Customize the agent tone and role",
  "Train with website and document data",
  "Generate an API key and embed the widget",
  "Monitor analytics and optimize conversations",
];

const stack = [
  "Next.js",
  "TypeScript",
  "Hono API",
  "Supabase",
  "OpenAI",
  "Vector Search",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f7f8f4] text-[#17221b]">
      <header className="relative isolate overflow-hidden bg-[#101b15] text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-48 -top-56 -z-10 size-[36rem] rounded-full bg-[#b9ec61]/10 blur-3xl"
        />
        <nav
          aria-label="Main navigation"
          className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 sm:px-10 lg:px-12"
        >
          <a href="#" className="flex items-center gap-3 text-xl font-semibold tracking-tight">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#c5ef70] text-sm font-bold text-[#142016]">
              A
            </span>
            Altos
          </a>

          <div className="hidden items-center gap-9 text-sm text-white/65 md:flex">
            <a className="transition hover:text-white" href="#features">
              Features
            </a>
            <a className="transition hover:text-white" href="#workflow">
              Workflow
            </a>
            <a className="transition hover:text-white" href="#stack">
              Stack
            </a>
          </div>

          <a
            href="#contact"
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium transition hover:border-[#c5ef70]/60 hover:bg-white/5"
          >
            Book a demo
          </a>
        </nav>

        <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-6 pb-20 pt-12 sm:px-10 sm:pb-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-12 lg:pb-28 lg:pt-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#c5ef70]/20 bg-[#c5ef70]/10 px-3.5 py-1.5 text-xs font-medium tracking-wide text-[#d3f59a]">
              <span className="size-1.5 rounded-full bg-[#c5ef70]" />
              AI customer support SaaS
            </span>
            <h1 className="mt-7 max-w-2xl font-heading text-5xl leading-[1.06] font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Turn every website into a{" "}
              <span className="text-[#c5ef70]">24/7 AI support desk.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/65 sm:text-lg sm:leading-8">
              Altos helps businesses deploy conversational agents that answer
              questions, guide visitors, and resolve issues with text and voice
              support powered by their own content.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#workflow"
                className="rounded-full bg-[#c5ef70] px-6 py-3 text-sm font-semibold text-[#17221b] transition hover:bg-[#d4f596]"
              >
                Explore workflow
                <span aria-hidden="true" className="ml-2">
                  →
                </span>
              </a>
              <a
                href="#features"
                className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white transition hover:border-white/35 hover:bg-white/5"
              >
                See features
              </a>
            </div>

            <div className="mt-12 grid max-w-lg grid-cols-3 border-t border-white/10 pt-6">
              {metrics.map((metric) => (
                <div key={metric.label} className="pr-3">
                  <strong className="block text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                    {metric.value}
                  </strong>
                  <span className="mt-1.5 block text-xs leading-5 text-white/50 sm:text-sm">
                    {metric.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            aria-label="Product preview"
            className="relative mx-auto w-full max-w-xl rounded-[1.75rem] border border-white/10 bg-[#18251d] p-3 shadow-2xl shadow-black/30 sm:p-4"
          >
            <div className="flex items-center justify-between rounded-t-2xl border-b border-white/8 px-3 pb-4 pt-2 sm:px-5">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-[#c5ef70]/15 text-[#c5ef70]">
                  ✦
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Support Agent</p>
                  <p className="mt-0.5 text-xs text-white/45">Altos assistant</p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-[#c5ef70]/10 px-2.5 py-1 text-xs font-medium text-[#d3f59a]">
                <span className="size-1.5 rounded-full bg-[#c5ef70]" />
                Online
              </span>
            </div>

            <div className="space-y-5 px-2 py-6 sm:px-4 sm:py-8">
              <div className="flex items-end gap-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#c5ef70]/15 text-xs font-semibold text-[#d3f59a]">
                  A
                </span>
                <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white/8 px-4 py-3 text-sm leading-6 text-white/85">
                  Hi! I can help with pricing, onboarding, and support.
                </div>
              </div>
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-md bg-[#c5ef70] px-4 py-3 text-sm leading-6 text-[#17221b]">
                  Can you explain your refund policy?
                </div>
              </div>
              <div className="flex items-end gap-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#c5ef70]/15 text-xs font-semibold text-[#d3f59a]">
                  A
                </span>
                <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white/8 px-4 py-3 text-sm leading-6 text-white/85">
                  Sure — refunds are available within 14 days for eligible
                  plans. I can also connect you to a specialist.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/8 px-3 pt-4 text-xs text-white/45 sm:px-5">
              <span className="flex items-center gap-2">
                <span className="rounded-full bg-[#c5ef70] px-2.5 py-1 font-medium text-[#17221b]">
                  Live
                </span>
                voice + text
              </span>
              <span className="hidden sm:inline">Synced to knowledge base</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-12">
        <section id="features" className="scroll-mt-10 py-20 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold tracking-[0.16em] text-[#547833] uppercase">
              Built for modern support teams
            </span>
            <h2 className="mt-4 font-heading text-3xl leading-tight font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Everything a customer support AI platform needs.
            </h2>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
            {features.map((feature, index) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-[#e7eae2] bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-[#cad6bb] hover:shadow-lg hover:shadow-[#273a20]/5 sm:p-7"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-[#edf4e3] text-lg text-[#547833]">
                  {index === 0 ? "✦" : index === 1 ? "⌘" : index === 2 ? "◖" : "↗"}
                </span>
                <h3 className="mt-6 text-lg font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#657067]">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="workflow"
          className="scroll-mt-10 border-t border-[#e5e9e0] py-20 sm:py-28"
        >
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <span className="text-xs font-semibold tracking-[0.16em] text-[#547833] uppercase">
                Simple deployment
              </span>
              <h2 className="mt-4 font-heading text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
                From account setup to live customer interaction.
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-[#657067]">
                Everything you need to launch a helpful, on-brand assistant —
                without a complicated setup.
              </p>
            </div>

            <ol className="divide-y divide-[#e5e9e0] border-y border-[#e5e9e0]">
              {workflow.map((step, index) => (
                <li
                  key={step}
                  className="flex items-center gap-5 py-5 text-sm font-medium sm:gap-7 sm:py-6 sm:text-base"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#e8f0dd] text-sm font-semibold text-[#547833]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          id="stack"
          className="scroll-mt-10 border-t border-[#e5e9e0] py-20 text-center sm:py-24"
        >
          <span className="text-xs font-semibold tracking-[0.16em] text-[#547833] uppercase">
            Technology foundation
          </span>
          <h2 className="mt-4 font-heading text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
            Composable architecture designed for scale.
          </h2>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            {stack.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[#dfe5d9] bg-white px-5 py-2.5 text-sm font-medium text-[#465248]"
              >
                {item}
              </span>
            ))}
          </div>
        </section>
      </main>

      <footer
        id="contact"
        className="scroll-mt-10 border-t border-[#e5e9e0] bg-white"
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10 sm:px-10 md:flex-row md:items-center md:justify-between lg:px-12">
          <div>
            <a href="#" className="text-lg font-semibold tracking-tight">
              Altos
            </a>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#657067]">
              AI support experiences for businesses that want better customer
              conversations.
            </p>
          </div>
          <a
            href="mailto:hello@altos.ai"
            className="w-fit rounded-full bg-[#17221b] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#304536]"
          >
            hello@altos.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
