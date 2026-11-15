type InvitationTemplateParams = {
  organizationName: string;
  inviterName: string;
  inviteUrl: string;
};

export const invitationTemplate = ({
  organizationName,
  inviterName,
  inviteUrl,
}: InvitationTemplateParams) => {
  return `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; color: #222;">
        <div style="max-width: 520px; margin: 40px auto;">
          <h2>You're invited to join ${organizationName}</h2>

          <p>
            ${inviterName} has invited you to join
            <strong>${organizationName}</strong> on Altos.
          </p>

          <a
            href="${inviteUrl}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background: #111;
              color: #fff;
              text-decoration: none;
              border-radius: 6px;
            "
          >
            Accept invitation
          </a>

          <p style="margin-top: 24px; color: #666;">
            If you weren't expecting this invitation,
            you can safely ignore this email.
          </p>
        </div>
      </body>
    </html>
  `;
};
