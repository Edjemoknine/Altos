"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  AudioLines,
  Bot,
  Check,
  Copy,
  FileText,
  Globe2,
  KeyRound,
  Mic,
  MessageSquareText,
  Play,
  Plus,
  Save,
  Trash2,
  Upload,
  Volume2,
} from "lucide-react";
import {
  Field,
  inputClassName,
  PageHeading,
  Panel,
  PrimaryButton,
  SecondaryButton,
  textareaClassName,
} from "../../../_components/dashboard-ui";
import { seedAgents, type AgentTone } from "../../../_components/mock-data";

type AgentTab = "configuration" | "knowledge" | "api-key" | "embed" | "test";

const tabs: { id: AgentTab; label: string }[] = [
  { id: "configuration", label: "Configuration" },
  { id: "knowledge", label: "Knowledge base" },
  { id: "api-key", label: "API key" },
  { id: "embed", label: "Embed widget" },
  { id: "test", label: "Test agent" },
];

type ChatMessage = { id: number; role: "assistant" | "user"; text: string };

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const initialAgent = seedAgents.find((agent) => agent.id === id) ?? seedAgents[0];
  const [activeTab, setActiveTab] = useState<AgentTab>("configuration");
  const [tone, setTone] = useState<AgentTone>(initialAgent.tone);
  const [savedNotice, setSavedNotice] = useState("");
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [scrapeStatus, setScrapeStatus] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileStatus, setFileStatus] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [keyNotice, setKeyNotice] = useState("");
  const [copyNotice, setCopyNotice] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, role: "assistant", text: `Hi! I’m ${initialAgent.name}. What can I help you with?` },
  ]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("test")) setActiveTab("test");
  }, []);

  async function copyText(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyNotice(`${label} copied to clipboard.`);
      setTimeout(() => setCopyNotice(""), 2500);
    } catch {
      setCopyNotice("Clipboard access was denied. Select and copy the text manually.");
    }
  }

  function saveConfiguration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavedNotice("Agent configuration saved in this demo.");
  }

  function startScraping(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!scrapeUrl.trim()) {
      setScrapeStatus("Enter a website URL before starting.");
      return;
    }
    setScrapeStatus("Scraping started — pages will appear here when processing completes.");
  }

  function addDocument(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".txt")) {
      setFileName("");
      setFileStatus("Only .txt files are supported.");
      event.target.value = "";
      return;
    }
    setFileName(file.name);
    setFileStatus("Processing document…");
    window.setTimeout(() => setFileStatus("Ready · document processed in this demo."), 900);
    event.target.value = "";
  }

  function generateKey() {
    const bytes = new Uint8Array(18);
    window.crypto.getRandomValues(bytes);
    const suffix = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    setApiKey(`ai_key_${suffix}`);
    setShowKey(false);
    setKeyNotice("A demo key has been generated. Connect your backend before using it in production.");
  }

  function deleteKey() {
    if (!window.confirm("Delete this API key? Any integrations using it will stop working.")) return;
    setApiKey("");
    setKeyNotice("The demo API key was deleted.");
  }

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = chatInput.trim();
    if (!text) return;
    const nextId = Date.now();
    setMessages((current) => [
      ...current,
      { id: nextId, role: "user", text },
      {
        id: nextId + 1,
        role: "assistant",
        text: "This is a local preview. Connect your agent runtime to receive a live response.",
      },
    ]);
    setChatInput("");
  }

  function toggleRecording() {
    setIsRecording((recording) => {
      if (recording) {
        setMessages((current) => [
          ...current,
          {
            id: Date.now(),
            role: "assistant",
            text: "Voice test captured in this preview. Connect a speech service to process audio.",
          },
        ]);
      }
      return !recording;
    });
  }

  const widgetSnippet = `<script src="https://yourdomain.com/widget.js" data-api-key="${apiKey || "YOUR_KEY"}"></script>`;

  return (
    <>
      <Link className="mb-5 inline-flex items-center gap-1.5 text-xs font-medium text-[#788579] transition hover:text-[#405b35]" href="/dashboard/agents">
        <ArrowLeft aria-hidden="true" className="size-3.5" /> Back to agents
      </Link>
      <PageHeading
        eyebrow="Agent settings"
        title={initialAgent.name}
        description={`${initialAgent.description} · ${initialAgent.website}`}
        action={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eff5e9] px-2.5 py-1.5 text-[10px] font-semibold text-[#67834d]">
            <span className="size-1.5 rounded-full bg-[#8ab45e]" /> {initialAgent.status}
          </span>
        }
      />

      <div className="mb-5 overflow-x-auto border-b border-[#e3e8df]">
        <div aria-label="Agent settings" className="flex min-w-max gap-6" role="tablist">
          {tabs.map((tab) => (
            <button
              aria-selected={activeTab === tab.id}
              className={`border-b-2 px-0.5 pb-3 text-xs font-semibold transition ${
                activeTab === tab.id
                  ? "border-[#6e914c] text-[#456337]"
                  : "border-transparent text-[#849084] hover:text-[#4f5e51]"
              }`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "configuration" && (
        <Panel className="max-w-3xl overflow-hidden">
          <div className="border-b border-[#eff1ec] px-5 py-4 sm:px-6">
            <h2 className="text-sm font-semibold text-[#27342b]">Agent configuration</h2>
            <p className="mt-1 text-xs text-[#879087]">Tune how this agent introduces itself and responds to customers.</p>
          </div>
          <form className="space-y-5 p-5 sm:p-6" onSubmit={saveConfiguration}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="detail-name" label="Agent name">
                <input className={inputClassName} defaultValue={initialAgent.name} id="detail-name" required />
              </Field>
              <Field id="detail-tone" label="Conversation tone">
                <select className={inputClassName} id="detail-tone" onChange={(event) => setTone(event.target.value as AgentTone)} value={tone}>
                  <option>Professional</option><option>Friendly</option><option>Casual</option><option>Empathic</option>
                </select>
              </Field>
            </div>
            <Field id="detail-description" label="Description">
              <input className={inputClassName} defaultValue={initialAgent.description} id="detail-description" />
            </Field>
            <Field id="detail-website" label="Website" hint="Changing your website does not automatically refresh the knowledge base.">
              <input className={inputClassName} defaultValue={`https://${initialAgent.website}`} id="detail-website" type="url" />
            </Field>
            <Field id="system-prompt" label="Base system prompt" hint="Describe the role, voice, and boundaries for your assistant.">
              <textarea className={`${textareaClassName} min-h-40 resize-y`} defaultValue={`You are ${initialAgent.name}, a ${tone.toLowerCase()} customer support assistant for Acme. Use the provided knowledge base to answer clearly and accurately. If you don't know an answer, say so and offer to connect the customer with a person.`} id="system-prompt" rows={6} />
            </Field>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eff1ec] pt-4">
              <p aria-live="polite" className="text-xs text-[#5f7e49]">{savedNotice}</p>
              <PrimaryButton type="submit"><Save aria-hidden="true" className="size-3.5" /> Save changes</PrimaryButton>
            </div>
          </form>
        </Panel>
      )}

      {activeTab === "knowledge" && (
        <div className="grid max-w-5xl gap-5 lg:grid-cols-2">
          <Panel className="overflow-hidden">
            <div className="border-b border-[#eff1ec] px-5 py-4 sm:px-6">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#f1f5ed] text-[#64804b]"><Globe2 className="size-4" /></span>
              <h2 className="mt-3 text-sm font-semibold text-[#27342b]">Import from website</h2>
              <p className="mt-1 text-xs leading-5 text-[#879087]">Crawl your website and use its content to ground agent responses.</p>
            </div>
            <form className="space-y-4 p-5 sm:p-6" onSubmit={startScraping}>
              <Field id="scrape-url" label="Website URL">
                <input className={inputClassName} id="scrape-url" onChange={(event) => setScrapeUrl(event.target.value)} placeholder="https://docs.yourcompany.com" type="url" value={scrapeUrl} />
              </Field>
              <PrimaryButton type="submit"><Play aria-hidden="true" className="size-3.5" /> Start scraping</PrimaryButton>
              {scrapeStatus && <p aria-live="polite" className="text-xs text-[#63804b]">{scrapeStatus}</p>}
            </form>
          </Panel>
          <Panel className="overflow-hidden">
            <div className="border-b border-[#eff1ec] px-5 py-4 sm:px-6">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#f2eef8] text-[#806d9a]"><FileText className="size-4" /></span>
              <h2 className="mt-3 text-sm font-semibold text-[#27342b]">Upload a text document</h2>
              <p className="mt-1 text-xs leading-5 text-[#879087]">Add a plain-text document to your agent’s knowledge base.</p>
            </div>
            <div className="p-5 sm:p-6">
              <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#dce3d7] bg-[#fbfcfa] px-4 text-center transition hover:border-[#a8be91] hover:bg-[#f8faf5]">
                <input accept=".txt,text/plain" className="sr-only" onChange={addDocument} type="file" />
                <span className="flex size-9 items-center justify-center rounded-xl bg-white text-[#7c8c73] shadow-sm"><Upload className="size-4" /></span>
                <span className="mt-2 text-xs font-semibold text-[#536052]">Choose a .txt file</span>
                <span className="mt-1 text-[10px] text-[#9aa398]">Plain text documents only</span>
              </label>
              {fileName && (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#edf0e9] px-3 py-2.5">
                  <FileText className="size-4 text-[#7b896f]" />
                  <span className="min-w-0 flex-1 truncate text-xs font-medium text-[#4d5b4e]">{fileName}</span>
                  {fileStatus.startsWith("Ready") ? <Check className="size-4 text-[#78a050]" /> : <span className="size-3 animate-spin rounded-full border-2 border-[#dbe4d1] border-t-[#7c9f57]" />}
                </div>
              )}
              {fileStatus && <p aria-live="polite" className={`mt-2 text-[11px] ${fileStatus.startsWith("Only") ? "text-[#b75d47]" : "text-[#63804b]"}`}>{fileStatus}</p>}
            </div>
          </Panel>
          <Panel className="overflow-hidden lg:col-span-2">
            <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#f1f5ed] text-[#64804b]"><Bot className="size-4" /></span>
              <div><h2 className="text-sm font-semibold text-[#27342b]">Indexed sources</h2><p className="mt-1 text-xs text-[#879087]">Sources currently attached to this agent.</p></div>
            </div>
            <div className="border-t border-[#eff1ec] px-5 py-4 text-xs text-[#929b90] sm:px-6">No sources have been indexed yet.</div>
          </Panel>
        </div>
      )}

      {activeTab === "api-key" && (
        <Panel className="max-w-3xl overflow-hidden">
          <div className="border-b border-[#eff1ec] px-5 py-4 sm:px-6">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#f1f5ed] text-[#64804b]"><KeyRound className="size-4" /></span>
            <h2 className="mt-3 text-sm font-semibold text-[#27342b]">Agent API key</h2>
            <p className="mt-1 text-xs leading-5 text-[#879087]">Use a private key to connect your applications with this agent. Keep it secret.</p>
          </div>
          <div className="space-y-4 p-5 sm:p-6">
            {apiKey ? (
              <>
                <Field id="generated-key" label="Generated key" hint="This demo key is generated in your browser and is not connected to a live API.">
                  <div className="flex gap-2">
                    <input className={`${inputClassName} font-mono text-xs`} id="generated-key" readOnly value={showKey ? apiKey : `${apiKey.slice(0, 11)}${"•".repeat(20)}`} />
                    <SecondaryButton onClick={() => setShowKey(!showKey)} type="button">{showKey ? "Hide" : "Reveal"}</SecondaryButton>
                    <SecondaryButton aria-label="Copy API key" onClick={() => copyText(apiKey, "API key")} type="button"><Copy className="size-3.5" /></SecondaryButton>
                  </div>
                </Field>
                <SecondaryButton className="text-[#9a6257] hover:border-[#e7cfc9] hover:bg-[#fff8f6]" onClick={deleteKey} type="button"><Trash2 className="size-3.5" /> Delete key</SecondaryButton>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-[#dfe5da] bg-[#fbfcfa] px-5 py-8 text-center">
                <KeyRound aria-hidden="true" className="mx-auto size-6 text-[#879881]" />
                <p className="mt-3 text-xs font-semibold text-[#49574b]">No API key yet</p>
                <p className="mt-1 text-[11px] text-[#929b90]">Generate a key to use this agent in your app.</p>
                <PrimaryButton className="mt-4" onClick={generateKey} type="button"><Plus className="size-3.5" /> Generate API key</PrimaryButton>
              </div>
            )}
            {keyNotice && <p aria-live="polite" className="text-xs text-[#63804b]">{keyNotice}</p>}
            {copyNotice && <p aria-live="polite" className="text-xs text-[#63804b]">{copyNotice}</p>}
          </div>
        </Panel>
      )}

      {activeTab === "embed" && (
        <Panel className="max-w-3xl overflow-hidden">
          <div className="border-b border-[#eff1ec] px-5 py-4 sm:px-6">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#f1f5ed] text-[#64804b]"><MessageSquareText className="size-4" /></span>
            <h2 className="mt-3 text-sm font-semibold text-[#27342b]">Embed your support widget</h2>
            <p className="mt-1 text-xs leading-5 text-[#879087]">Add this script before the closing <code className="rounded bg-[#f4f5f2] px-1">&lt;/body&gt;</code> tag on your website.</p>
          </div>
          <div className="space-y-4 p-5 sm:p-6">
            {!apiKey && (
              <div className="rounded-xl border border-[#efe5cf] bg-[#fcf8ed] px-4 py-3 text-xs leading-5 text-[#8f774a]">
                Generate an API key first to personalize this snippet with your agent key.
              </div>
            )}
            <div className="overflow-x-auto rounded-xl bg-[#16221a] p-4">
              <code className="whitespace-nowrap font-mono text-xs leading-6 text-[#d4e8bd]">{widgetSnippet}</code>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <PrimaryButton onClick={() => copyText(widgetSnippet, "Widget snippet")} type="button"><Copy className="size-3.5" /> Copy code snippet</PrimaryButton>
              {copyNotice && <p aria-live="polite" className="text-xs text-[#63804b]">{copyNotice}</p>}
            </div>
          </div>
        </Panel>
      )}

      {activeTab === "test" && (
        <Panel className="max-w-3xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#eff1ec] px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#f1f5ed] text-[#64804b]"><Bot className="size-4" /></span>
              <div><h2 className="text-sm font-semibold text-[#27342b]">Test {initialAgent.name}</h2><p className="mt-1 text-xs text-[#879087]">Preview text and voice interactions.</p></div>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] font-medium text-[#6f8958]"><span className="size-1.5 rounded-full bg-[#8ab45e]" /> Preview</span>
          </div>
          <div aria-live="polite" className="flex max-h-[360px] min-h-[250px] flex-col gap-4 overflow-y-auto bg-[#fbfcfa] px-5 py-5 sm:px-6">
            {messages.map((message) => (
              <div className={`flex items-end gap-2.5 ${message.role === "user" ? "justify-end" : ""}`} key={message.id}>
                {message.role === "assistant" && <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#eaf1e1] text-[#66834e]"><Bot className="size-3.5" /></span>}
                <p className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-5 ${
                  message.role === "user" ? "rounded-br-sm bg-[#17221b] text-white" : "rounded-bl-sm border border-[#ebeee8] bg-white text-[#536052]"
                }`}>{message.text}</p>
              </div>
            ))}
          </div>
          {isRecording && (
            <p aria-live="polite" className="flex items-center gap-2 border-t border-[#f0e3e0] bg-[#fff8f6] px-5 py-2.5 text-[11px] text-[#a75e50] sm:px-6">
              <span className="size-2 animate-pulse rounded-full bg-[#d76e5c]" /> Listening… click the microphone again to finish your voice test.
            </p>
          )}
          <div className="border-t border-[#eff1ec] p-4 sm:p-5">
            <form className="flex gap-2" onSubmit={sendMessage}>
              <input aria-label="Message your agent" className={`${inputClassName} flex-1`} onChange={(event) => setChatInput(event.target.value)} placeholder="Ask your agent a question…" value={chatInput} />
              <button aria-label={isRecording ? "Stop voice test" : "Start voice test"} className={`flex size-10 shrink-0 items-center justify-center rounded-xl border transition ${
                isRecording ? "border-[#f0d4cd] bg-[#fff3f0] text-[#b65e50]" : "border-[#e2e7de] bg-white text-[#63775b] hover:bg-[#f5f8f1]"
              }`} onClick={toggleRecording} type="button">
                {isRecording ? <AudioLines className="size-4" /> : <Mic className="size-4" />}
              </button>
              <PrimaryButton aria-label="Send message" className="size-10 px-0" disabled={!chatInput.trim()} type="submit"><span aria-hidden="true">↑</span></PrimaryButton>
            </form>
            <div className="mt-3 flex items-center justify-between text-[10px] text-[#a0a89e]">
              <span className="flex items-center gap-1"><Volume2 className="size-3" /> Text + voice test preview</span>
              <span>Responses are simulated</span>
            </div>
          </div>
        </Panel>
      )}
    </>
  );
}
