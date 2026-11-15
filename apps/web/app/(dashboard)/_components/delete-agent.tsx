"use client";

import {
  AlertTriangle,
  LoaderCircle,
  Trash2,
} from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";

export function DeleteAgentDialog({
  agentName,
  open,
  isDeleting,
  error,
  onOpenChange,
  onConfirm,
}: {
  agentName: string | null;
  open: boolean;
  isDeleting: boolean;
  error?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isDeleting) onOpenChange(nextOpen);
      }}
    >
      <DialogContent
        className="gap-0 rounded-2xl border border-[#e7eae3] bg-[#fdfefc] p-0 text-[#17221b] shadow-2xl sm:max-w-md"
        showCloseButton={!isDeleting}
      >
        <DialogHeader className="border-b border-[#eff1ec] px-6 py-5">
          <div className="flex items-start gap-3 pr-7">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#fff1ee] text-[#ad5144]">
              <AlertTriangle aria-hidden="true" className="size-5" />
            </span>
            <div>
              <DialogTitle className="font-heading text-base font-semibold text-[#26332a]">
                Delete agent?
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs leading-5 text-[#788278]">
                {agentName ? (
                  <>
                    This will permanently delete{" "}
                    <span className="font-semibold text-[#455047]">
                      {agentName}
                    </span>
                    . This action cannot be undone.
                  </>
                ) : (
                  "This will permanently delete this agent. This action cannot be undone."
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          {error && (
            <p
              aria-live="assertive"
              className="mb-4 rounded-lg border border-[#f0d7d1] bg-[#fff7f5] px-3 py-2 text-xs text-[#a95140]"
              role="alert"
            >
              {error}
            </p>
          )}
          <DialogFooter className="flex-row justify-end gap-2">
            <Button
              className="rounded-xl border-[#e3e8df] bg-white px-3.5 text-xs font-semibold text-[#455047]"
              disabled={isDeleting}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl bg-[#a94336] px-3.5 text-xs font-semibold text-white hover:bg-[#8f372d]"
              disabled={isDeleting}
              onClick={onConfirm}
              type="button"
            >
              {isDeleting ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="size-3.5 animate-spin"
                />
              ) : (
                <Trash2 aria-hidden="true" className="size-3.5" />
              )}
              {isDeleting ? "Deleting..." : "Delete agent"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}