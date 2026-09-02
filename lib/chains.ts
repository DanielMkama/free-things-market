import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Generosity chains (brief §19).
 *
 * When someone fulfils a Give Forward commitment, the new act is linked into the
 * chain that the *triggering* act belongs to (creating the chain, with the
 * triggering act at position 0, if it doesn't exist yet). The find-or-create +
 * append is done atomically by the `link_act_to_chain` Postgres function.
 */
export async function linkActToChain(
  newActId: string,
  triggerActId: string,
): Promise<string | null> {
  const { data, error } = await createAdminClient().rpc("link_act_to_chain", {
    new_act: newActId,
    trigger_act: triggerActId,
  });
  if (error) {
    console.error("link_act_to_chain failed", error);
    return null;
  }
  return (data as string) ?? null;
}

export type ChainStep = {
  position: number;
  actId: string;
  description: string;
  createdAt: string;
  giverName: string;
  giverHandle: string;
  receiverName: string | null;
  type: string | null;
};

export type ChainView = {
  id: string;
  createdAt: string;
  steps: ChainStep[];
};

type MemberRow = {
  position: number;
  act_id: string;
  act: {
    description: string;
    created_at: string;
    type: string | null;
    giver: { name: string; handle: string } | null;
    receiver: { name: string } | null;
  } | null;
};

export async function listChainSteps(chainId: string): Promise<ChainStep[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("generosity_chain_members")
    .select(
      `position, act_id,
       act:generosity_acts!inner(
         description, created_at, type,
         giver:users!generosity_acts_giver_id_fkey(name, handle),
         receiver:users!generosity_acts_receiver_id_fkey(name)
       )`,
    )
    .eq("chain_id", chainId)
    .order("position", { ascending: true })
    .returns<MemberRow[]>();

  return (data ?? []).map((r) => ({
    position: Number(r.position),
    actId: String(r.act_id),
    description: r.act?.description ?? "",
    createdAt: String(r.act?.created_at ?? ""),
    type: r.act?.type ?? null,
    giverName: r.act?.giver?.name ?? "Someone",
    giverHandle: r.act?.giver?.handle ?? "",
    receiverName: r.act?.receiver?.name ?? null,
  }));
}

export async function getChain(id: string): Promise<ChainView | null> {
  const supabase = await createClient();
  const { data: chain } = await supabase
    .from("generosity_chains")
    .select("id, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!chain) return null;

  return {
    id: String(chain.id),
    createdAt: String(chain.created_at),
    steps: await listChainSteps(String(chain.id)),
  };
}

export async function listChains(limit = 20): Promise<ChainView[]> {
  const supabase = await createClient();
  const { data: chains } = await supabase
    .from("generosity_chains")
    .select("id, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  const views = await Promise.all(
    (chains ?? []).map(async (c) => ({
      id: String(c.id),
      createdAt: String(c.created_at),
      steps: await listChainSteps(String(c.id)),
    })),
  );
  return views.filter((c) => c.steps.length >= 2);
}
