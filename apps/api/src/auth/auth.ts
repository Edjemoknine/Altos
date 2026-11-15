import "dotenv/config";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { authSchema, db } from "../db/index.ts";
import { organization } from "better-auth/plugins";
import { sendEmail } from "../services/email.service.ts";
import { invitationTemplate } from "../templates/invitation.template.ts";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),

  baseURL: process.env.BETTER_AUTH_URL!,

  secret: process.env.BETTER_AUTH_SECRET!,

  trustedOrigins: [process.env.FRONTEND_URL!],

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Refresh once per day
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
  plugins: [
    organization({
      creatorRole: "owner",
      async sendInvitationEmail(data) {
        const inviteUrl = `${process.env.FRONTEND_URL}/accept-invitation/${data.id}`;

        await sendEmail({
          to: data.email,
          subject: `You're invited to join ${data.organization.name} on Altos`,
          html: invitationTemplate({
            organizationName: data.organization.name,
            inviterName: data.inviter.user.name,
            inviteUrl,
          }),
        });
      },
    }),
  ],
});

export type Auth = typeof auth;

export type Session = typeof auth.$Infer.Session;
