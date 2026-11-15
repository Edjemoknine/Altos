"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/button";
import {
  acceptOrganizationInvitation,
  getOrganizationInvitation,
  rejectOrganizationInvitation,
} from "@/services/organization.service";
import { authClient } from "@/auth/auth-client";

type Invitation = NonNullable<
  Awaited<ReturnType<typeof getOrganizationInvitation>>
>;

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function AcceptInvitation({ invitationId }: { invitationId: string }) {
  const router = useRouter();
  const {
    data: session,
    isPending: sessionPending,
    error: sessionError,
  } = authClient.useSession();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (sessionPending) return;

    if (sessionError) {
      setIsLoading(false);
      setError("We couldn’t verify your account. Please try signing in again.");
      return;
    }

    if (!session) {
      const callbackURL = `/accept-invitation/${encodeURIComponent(invitationId)}`;
      router.replace(`/sign-in?callbackURL=${encodeURIComponent(callbackURL)}`);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError("");

    void getOrganizationInvitation(invitationId)
      .then((result) => {
        if (!cancelled) setInvitation(result);
      })
      .catch((invitationError: unknown) => {
        if (!cancelled) {
          setError(
            invitationError instanceof Error
              ? invitationError.message
              : "Unable to load this invitation.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [invitationId, router, session, sessionError, sessionPending]);

  console.log("invitation", invitation);
  console.log({ invitationId });

  async function respond(action: "accept" | "decline") {
    setIsSubmitting(true);
    setError("");
    setNotice("");

    try {
      if (action === "accept") {
        await acceptOrganizationInvitation(invitationId);
        router.replace("/dashboard");
        router.refresh();
      } else {
        await rejectOrganizationInvitation(invitationId);
        setInvitation(null);
        setNotice("You declined this organization invitation.");
      }
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : `Unable to ${action} this invitation.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const isSignedOut = !sessionPending && !session && !sessionError;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8f4] px-5 py-10 text-[#17221b]">
      <section
        aria-labelledby="accept-invitation-heading"
        className="w-full max-w-md rounded-2xl border border-[#e7eae3] bg-white p-7 shadow-[0_8px_32px_rgba(23,34,27,0.06)] sm:p-9"
      >
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#eff5e9] text-[#64804b]">
          <span aria-hidden="true" className="text-xl font-semibold">
            A
          </span>
        </span>
        <h1
          className="mt-5 text-center font-heading text-xl font-semibold text-[#202c23]"
          id="accept-invitation-heading"
        >
          Organization invitation
        </h1>

        {sessionPending || isSignedOut ? (
          <p
            aria-live="polite"
            className="mt-3 text-center text-sm text-[#788278]"
          >
            {isSignedOut
              ? "Redirecting you to sign in..."
              : "Checking your sign-in status..."}
          </p>
        ) : sessionError ? (
          <>
            <p
              className="mt-3 text-center text-sm leading-6 text-[#a95140]"
              role="alert"
            >
              {error}
            </p>
            <div className="mt-6 flex justify-center">
              <Button
                className="rounded-xl bg-[#17221b] px-4 text-white hover:bg-[#304536]"
                onClick={() => router.replace("/sign-in")}
                type="button"
              >
                Sign in
              </Button>
            </div>
          </>
        ) : isLoading ? (
          <p
            aria-live="polite"
            className="mt-3 text-center text-sm text-[#788278]"
          >
            Loading invitation details...
          </p>
        ) : error ? (
          <>
            <p
              className="mt-3 text-center text-sm leading-6 text-[#a95140]"
              role="alert"
            >
              {error}
            </p>
            <div className="mt-6 flex justify-center">
              <Button
                className="rounded-xl border-[#e3e8df] bg-white px-4 text-[#455047]"
                onClick={() => router.replace("/dashboard")}
                type="button"
                variant="outline"
              >
                Go to dashboard
              </Button>
            </div>
          </>
        ) : notice ? (
          <>
            <p
              aria-live="polite"
              className="mt-3 text-center text-sm text-[#5f7e49]"
            >
              {notice}
            </p>
            <div className="mt-6 flex justify-center">
              <Button
                className="rounded-xl bg-[#17221b] px-4 text-white hover:bg-[#304536]"
                onClick={() => router.replace("/dashboard")}
                type="button"
              >
                Go to dashboard
              </Button>
            </div>
          </>
        ) : invitation ? (
          <>
            <p className="mt-3 text-center text-sm leading-6 text-[#788278]">
              You’ve been invited to join{" "}
              <span className="font-semibold text-[#344137]">
                {invitation.organizationName}
              </span>
              .
            </p>
            <dl className="mt-6 space-y-3 rounded-xl bg-[#f8faf6] p-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[#879087]">Invited email</dt>
                <dd className="truncate font-medium text-[#344137]">
                  {invitation.email}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#879087]">Role</dt>
                <dd className="font-medium capitalize text-[#344137]">
                  {invitation.role}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#879087]">Expires</dt>
                <dd className="font-medium text-[#344137]">
                  {formatDate(invitation.expiresAt)}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-center text-xs text-[#879087]">
              Signed in as {session?.user.email}
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                className="rounded-xl border-[#e3e8df] bg-white px-4 text-[#455047]"
                disabled={isSubmitting}
                onClick={() => void respond("decline")}
                type="button"
                variant="outline"
              >
                Decline
              </Button>
              <Button
                className="rounded-xl bg-[#17221b] px-4 text-white hover:bg-[#304536]"
                disabled={isSubmitting}
                onClick={() => void respond("accept")}
                type="button"
              >
                {isSubmitting ? "Please wait..." : "Accept invitation"}
              </Button>
            </div>
            {error && (
              <p
                aria-live="assertive"
                className="mt-4 text-center text-sm text-[#a95140]"
                role="alert"
              >
                {error}
              </p>
            )}
          </>
        ) : null}
      </section>
    </main>
  );
}
