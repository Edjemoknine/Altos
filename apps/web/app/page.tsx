import { Button } from "@repo/ui/components/button";
import styles from "./page.module.css";

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
    <>
      <Button variant="default">Tailwind works</Button>
      <h1 className="text-2xl text-lime-400 ">Altos</h1>
    </>
    /* <div className={styles.page}>
      <header className={styles.hero}>
        <nav className={styles.nav} aria-label="Main navigation">
          <div className={styles.brand}>
            <span className={styles.brandMark}>A</span>
            Altos
          </div>

          <div className={styles.navLinks}>
            <a href="#features">Features</a>
            <a href="#workflow">Workflow</a>
            <a href="#stack">Stack</a>
          </div>

          <a href="#contact" className={styles.navCta}>
            Book a demo
          </a>
        </nav>

        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <span className={styles.badge}>AI customer support SaaS</span>
            <h1>Turn every website into a 24/7 AI support desk.</h1>
            <p>
              Altos helps businesses deploy conversational agents that answer
              questions, guide visitors, and resolve issues with text and voice
              support powered by their own content.
            </p>

            <div className={styles.ctas}>
              <a href="#workflow" className={styles.primaryCta}>
                Explore workflow
              </a>
              <a href="#features" className={styles.secondaryCta}>
                See features
              </a>
            </div>

            <div className={styles.metrics}>
              {metrics.map((metric) => (
                <div key={metric.label} className={styles.metricCard}>
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.previewCard} aria-label="Product preview">
            <div className={styles.previewHeader}>
              <div className={styles.previewDots}>
                <span />
                <span />
                <span />
              </div>
              <span>Support Agent</span>
            </div>

            <div className={styles.chatPanel}>
              <div className={styles.messageRow}>
                <div className={styles.botMessage}>
                  Hi! I can help with pricing, onboarding, and support.
                </div>
              </div>

              <div className={styles.messageRowRight}>
                <div className={styles.userMessage}>
                  Can you explain your refund policy?
                </div>
              </div>

              <div className={styles.messageRow}>
                <div className={styles.botMessage}>
                  Sure — refunds are available within 14 days for eligible
                  plans. I can also connect you to a specialist.
                </div>
              </div>
            </div>

            <div className={styles.previewFooter}>
              <span className={styles.livePill}>Live</span>
              <span>voice + text · synced to knowledge base</span>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section id="features" className={styles.section}>
          <div className={styles.sectionHeading}>
            <span className={styles.kicker}>
              Built for modern support teams
            </span>
            <h2>Everything a customer support AI platform needs.</h2>
          </div>

          <div className={styles.featureGrid}>
            {features.map((feature) => (
              <article key={feature.title} className={styles.featureCard}>
                <div className={styles.featureIcon}>✦</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="workflow" className={styles.section}>
          <div className={styles.sectionHeading}>
            <span className={styles.kicker}>Simple deployment</span>
            <h2>From account setup to live customer interaction.</h2>
          </div>

          <ol className={styles.workflowList}>
            {workflow.map((step, index) => (
              <li key={step} className={styles.workflowItem}>
                <span className={styles.stepNumber}>{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section id="stack" className={styles.section}>
          <div className={styles.sectionHeading}>
            <span className={styles.kicker}>Technology foundation</span>
            <h2>Composable architecture designed for scale.</h2>
          </div>

          <div className={styles.stackRow}>
            {stack.map((item) => (
              <span key={item} className={styles.stackPill}>
                {item}
              </span>
            ))}
          </div>
        </section>
      </main>

      <footer id="contact" className={styles.footer}>
        <div>
          <span className={styles.footerTitle}>Altos</span>
          <p>
            AI support experiences for businesses that want better customer
            conversations.
          </p>
        </div>

        <a href="mailto:hello@altos.ai" className={styles.footerCta}>
          hello@altos.ai
        </a>
      </footer>
    </div> */
  );
}
