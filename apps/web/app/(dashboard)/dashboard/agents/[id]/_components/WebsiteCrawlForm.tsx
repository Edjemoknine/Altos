"use client";

import { Globe2, Play } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import {
  Field,
  inputClassName,
  Panel,
} from "../../../../_components/dashboard-ui";

export function WebsiteCrawlForm() {
  return (
    <Panel className="overflow-hidden">
      <div className="border-b border-[#eff1ec] px-5 py-4 sm:px-6">
        <span className="flex size-9 items-center justify-center rounded-xl bg-[#f1f5ed] text-[#64804b]">
          <Globe2 aria-hidden="true" className="size-4" />
        </span>
        <h2 className="mt-3 text-sm font-semibold text-[#27342b]">
          Import from website
        </h2>
        <p className="mt-1 text-xs leading-5 text-[#879087]">
          Crawl your website and use its content to ground agent responses.
        </p>
      </div>
      <div className="space-y-4 p-5 sm:p-6">
        <Field id="scrape-url" label="Website URL">
          <Input
            className={inputClassName}
            id="scrape-url"
            placeholder="https://docs.yourcompany.com"
            type="url"
          />
        </Field>
        <Button
          className="rounded-xl bg-[#17221b] px-3.5 text-xs font-semibold text-white"
          disabled
          type="button"
        >
          <Play aria-hidden="true" className="size-3.5" />
          Crawling coming soon
        </Button>
        <p
          aria-live="polite"
          className="text-xs leading-5 text-[#879087]"
          role="status"
        >
          Website crawling will be available when the backend workflow is ready.
        </p>
      </div>
    </Panel>
  );
}
