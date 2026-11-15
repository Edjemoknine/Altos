import { AcceptInvitation } from "./accept-invitation";

export default async function AcceptInvitationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <AcceptInvitation invitationId={id} />;
}
