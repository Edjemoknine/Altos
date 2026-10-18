"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Badge } from "@repo/ui/components/badge";
import { Input } from "@repo/ui/components/input";
import { BadgeCheck, Check, CreditCard, LockKeyhole, Mail, Upload, UserRound } from "lucide-react";
import {
  Field,
  inputClassName,
  PageHeading,
  Panel,
  PanelHeading,
  PrimaryButton,
  SecondaryButton,
} from "../../_components/dashboard-ui";

export default function SettingsPage() {
  const [profileNotice, setProfileNotice] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");
  const [avatarName, setAvatarName] = useState("");
  const avatarInput = useRef<HTMLInputElement>(null);

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileNotice("Your profile changes have been saved in this demo.");
  }

  function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("new-password") ?? "");
    if (password !== String(form.get("confirm-password") ?? "")) {
      setPasswordNotice("Your new passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setPasswordNotice("Use at least 8 characters for your new password.");
      return;
    }
    setPasswordNotice("Password reset saved for this demo account.");
    event.currentTarget.reset();
  }

  function selectAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarName("Choose an image file to update your avatar.");
      event.target.value = "";
      return;
    }
    setAvatarName(`${file.name} selected. Avatar upload is a demo preview.`);
  }

  return (
    <>
      <PageHeading
        eyebrow="Workspace preferences"
        title="Account settings"
        description="Manage your profile, security, and subscription."
      />

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(310px,0.7fr)]">
        <div className="space-y-5">
          <Panel className="overflow-hidden">
            <PanelHeading title="Profile" description="Update the personal information on your account." />
            <form className="space-y-5 p-5 sm:p-6" onSubmit={saveProfile}>
              <div className="flex items-center gap-4">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-[#dce9d0] text-sm font-semibold text-[#42613b]">
                  JD
                </span>
                <div>
                  <Input accept="image/*" className="sr-only" onChange={selectAvatar} ref={avatarInput} type="file" />
                  <SecondaryButton onClick={() => avatarInput.current?.click()} type="button">
                    <Upload aria-hidden="true" className="size-3.5" /> Upload avatar
                  </SecondaryButton>
                  <p aria-live="polite" className="mt-1.5 text-[10px] text-[#929b90]">{avatarName || "JPG, PNG or GIF. 2 MB max."}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="profile-name" label="Full name">
                  <Input autoComplete="name" className={inputClassName} defaultValue="Jordan Davis" id="profile-name" name="name" required />
                </Field>
                <Field id="profile-email" label="Email address">
                  <div className="relative">
                    <Input autoComplete="email" className={`${inputClassName} pr-28`} defaultValue="jordan@acme.com" id="profile-email" name="email" required type="email" />
                    <Badge className="absolute right-2 top-1/2 h-auto -translate-y-1/2 gap-1 rounded-full border-0 bg-[#eff5e9] px-2 py-1 text-[9px] font-semibold text-[#66834e]">
                      <BadgeCheck aria-hidden="true" className="size-3" /> Verified
                    </Badge>
                  </div>
                </Field>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eff1ec] pt-4">
                <p aria-live="polite" className="text-xs text-[#5f7e49]">{profileNotice}</p>
                <PrimaryButton type="submit">Save changes</PrimaryButton>
              </div>
            </form>
          </Panel>

          <Panel className="overflow-hidden">
            <PanelHeading title="Security" description="Choose a strong password to keep your account secure." />
            <form className="space-y-4 p-5 sm:p-6" onSubmit={changePassword}>
              <Field id="current-password" label="Current password">
                <Input autoComplete="current-password" className={inputClassName} id="current-password" name="current-password" placeholder="Enter current password" required type="password" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="new-password" label="New password" hint="At least 8 characters.">
                  <Input autoComplete="new-password" className={inputClassName} id="new-password" minLength={8} name="new-password" placeholder="New password" required type="password" />
                </Field>
                <Field id="confirm-password" label="Confirm new password">
                  <Input autoComplete="new-password" className={inputClassName} id="confirm-password" minLength={8} name="confirm-password" placeholder="Repeat new password" required type="password" />
                </Field>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eff1ec] pt-4">
                <p aria-live="polite" className={`text-xs ${passwordNotice.includes("match") || passwordNotice.includes("Use") ? "text-[#b75d47]" : "text-[#5f7e49]"}`}>{passwordNotice}</p>
                <SecondaryButton type="submit"><LockKeyhole aria-hidden="true" className="size-3.5" /> Update password</SecondaryButton>
              </div>
            </form>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel className="overflow-hidden">
            <PanelHeading title="Plan & subscription" description="Your current workspace plan." />
            <div className="p-5 sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <Badge className="h-auto gap-1.5 rounded-full border-0 bg-[#eff5e9] px-2.5 py-1 text-[10px] font-semibold text-[#64804b]">
                    <span className="size-1.5 rounded-full bg-[#8ab45e]" /> Current plan
                  </Badge>
                  <h2 className="mt-3 font-heading text-2xl font-semibold text-[#26332a]">Free</h2>
                  <p className="mt-1 text-xs text-[#849084]">For trying out Altos</p>
                </div>
                <span className="flex size-10 items-center justify-center rounded-xl bg-[#f1f5ed] text-[#64804b]">
                  <CreditCard aria-hidden="true" className="size-5" />
                </span>
              </div>
              <div className="my-5 border-t border-[#eff1ec]" />
              <ul className="space-y-3 text-xs text-[#647064]">
                {["100,000 tokens per month", "Up to 3 AI agents", "Text and voice support", "Website knowledge ingestion"].map((item) => (
                  <li className="flex items-center gap-2.5" key={item}><Check aria-hidden="true" className="size-3.5 text-[#7da354]" />{item}</li>
                ))}
              </ul>
              <PrimaryButton className="mt-6 w-full justify-center" onClick={() => window.alert("Plan upgrades will be available when billing is connected.")} type="button">
                Upgrade to Pro <span aria-hidden="true">→</span>
              </PrimaryButton>
              <p className="mt-3 text-center text-[10px] text-[#9aa398]">Unlock more agents and higher usage limits.</p>
            </div>
          </Panel>
          <Panel className="p-5 sm:p-6">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#f1f5ed] text-[#64804b]">
              <UserRound aria-hidden="true" className="size-4" />
            </span>
            <h2 className="mt-3 text-sm font-semibold text-[#344137]">Workspace owner</h2>
            <p className="mt-1 text-xs text-[#879087]">You’re managing the Acme Corporation workspace.</p>
            <div className="mt-4 flex items-center gap-2 border-t border-[#eff1ec] pt-4 text-xs text-[#667266]">
              <Mail aria-hidden="true" className="size-3.5 text-[#919a90]" />
              jordan@acme.com
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
