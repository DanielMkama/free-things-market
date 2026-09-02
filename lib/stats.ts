import "server-only";
import { createClient } from "@/lib/supabase/server";

const num = (v: unknown) => Number(v ?? 0);

export type ImpactStats = {
  peopleParticipating: number;
  peopleGiving: number;
  offers: number;
  requests: number;
  requestsFulfilled: number;
  connectionsMade: number;
  actsCompleted: number;
  thingsGiven: number;
  skillsShared: number;
  hoursGiven: number;
  giveForwardCommitments: number;
  giveForwardCompleted: number;
  giveForwardRate: number; // 0..1
  chains: number;
  longestChain: number;
};

const EMPTY: ImpactStats = {
  peopleParticipating: 0,
  peopleGiving: 0,
  offers: 0,
  requests: 0,
  requestsFulfilled: 0,
  connectionsMade: 0,
  actsCompleted: 0,
  thingsGiven: 0,
  skillsShared: 0,
  hoursGiven: 0,
  giveForwardCommitments: 0,
  giveForwardCompleted: 0,
  giveForwardRate: 0,
  chains: 0,
  longestChain: 0,
};

export async function getImpactStats(): Promise<ImpactStats> {
  const supabase = await createClient();
  const { data } = await supabase.from("impact_stats").select("*").single();
  if (!data) return EMPTY;

  const commitments = num(data.give_forward_commitments);
  const completed = num(data.give_forward_completed);

  return {
    peopleParticipating: num(data.people_participating),
    peopleGiving: num(data.people_giving),
    offers: num(data.offers),
    requests: num(data.requests),
    requestsFulfilled: num(data.requests_fulfilled),
    connectionsMade: num(data.connections_made),
    actsCompleted: num(data.acts_completed),
    thingsGiven: num(data.things_given),
    skillsShared: num(data.skills_shared),
    hoursGiven: Math.round(num(data.hours_given) * 10) / 10,
    giveForwardCommitments: commitments,
    giveForwardCompleted: completed,
    giveForwardRate: commitments ? completed / commitments : 0,
    chains: num(data.chains),
    longestChain: num(data.longest_chain),
  };
}

export type UserGenerosity = {
  actsGiven: number;
  actsReceived: number;
  peopleHelped: number;
  giveForwardActs: number;
  chains: number;
};

export async function getUserGenerosity(
  userId: string,
): Promise<UserGenerosity> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("user_generosity", { uid: userId });
  const row = Array.isArray(data) ? data[0] : data;

  return {
    actsGiven: num(row?.acts_given),
    actsReceived: num(row?.acts_received),
    peopleHelped: num(row?.people_helped),
    giveForwardActs: num(row?.give_forward_acts),
    chains: num(row?.chains),
  };
}
