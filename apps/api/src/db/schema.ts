import { defineRelations } from "drizzle-orm";
import { account, session, user } from "./schemas/auth.ts";
import { agents } from "./schemas/agent.ts";
import { members } from "./schemas/member.ts";
import { organizations } from "./schemas/organization.ts";

export * from "./schemas/auth.ts";
export * from "./schemas/agent.ts";
export * from "./schemas/member.ts";
export * from "./schemas/organization.ts";

export const relations = defineRelations(
  { user, session, account, organizations, members, agents },
  (r) => ({
    user: {
      sessions: r.many.session(),
      accounts: r.many.account(),
      memberships: r.many.members(),
    },
    session: {
      user: r.one.user({ from: r.session.userId, to: r.user.id }),
    },
    account: {
      user: r.one.user({ from: r.account.userId, to: r.user.id }),
    },
    organizations: {
      members: r.many.members(),
      agents: r.many.agents(),
    },
    members: {
      organization: r.one.organizations({
        from: r.members.organizationId,
        to: r.organizations.id,
      }),
      user: r.one.user({ from: r.members.userId, to: r.user.id }),
    },
    agents: {
      organization: r.one.organizations({
        from: r.agents.organizationId,
        to: r.organizations.id,
      }),
    },
  }),
);
