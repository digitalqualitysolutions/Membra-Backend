import "dotenv/config";

import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "../src/db/schema";
import {
  clubAgeGroupsInApp,
  clubsInApp,
  teamsInApp,
} from "../src/db/schema";

/** Age groups referenced by sample club-1 teams (ids 1–5). */
const CLUB1_AGE_GROUPS = [
  {
    id: 1,
    clubId: 1,
    name: "Ramasjang",
    shortName: "Rama",
    ageMin: 4,
    ageMax: 7,
    active: true,
  },
  {
    id: 2,
    clubId: 1,
    name: "Kids",
    shortName: "Kids",
    ageMin: 8,
    ageMax: 12,
    active: true,
  },
  {
    id: 3,
    clubId: 1,
    name: "U15",
    shortName: "u15",
    ageMin: 13,
    ageMax: 15,
    active: true,
  },
  {
    id: 4,
    clubId: 1,
    name: "U19",
    shortName: "u19",
    ageMin: 16,
    ageMax: 19,
    active: true,
  },
  {
    id: 5,
    clubId: 1,
    name: "Senior",
    shortName: "Sen",
    ageMin: 20,
    ageMax: 99,
    active: true,
  },
] as const;

const SAMPLE_CLUBS = [
  { id: 1, name: "Sample Club 1", shortName: "SC1", active: true },
  { id: 3, name: "Sample Club 3", shortName: "SC3", active: true },
] as const;

type TeamSeed = {
  id: number;
  clubId: number;
  name: string;
  shortName: string;
  seasonal: boolean;
  hasWaitlistMembers: boolean;
  hasWaitlistPublic: boolean;
  onlyTeamMembers: boolean;
  areEventsPublic: boolean;
  genderId: number | null;
  ageGroupId: number | null;
  rankGroupId: number | null;
  teamRankInGroup: number | null;
  rankPublic: boolean | null;
  colorId: number | null;
  textWhite: boolean | null;
  active: boolean;
};

const TEAMS: TeamSeed[] = [
  {
    id: 1,
    clubId: 1,
    name: "Elite Herre",
    shortName: "E.H",
    seasonal: true,
    hasWaitlistMembers: false,
    hasWaitlistPublic: false,
    onlyTeamMembers: true,
    areEventsPublic: false,
    genderId: 1,
    ageGroupId: 5,
    rankGroupId: 1,
    teamRankInGroup: 1,
    rankPublic: null,
    colorId: 1,
    textWhite: null,
    active: true,
  },
  {
    id: 2,
    clubId: 1,
    name: "Elite Dame",
    shortName: "E.D",
    seasonal: true,
    hasWaitlistMembers: false,
    hasWaitlistPublic: false,
    onlyTeamMembers: true,
    areEventsPublic: false,
    genderId: 2,
    ageGroupId: 5,
    rankGroupId: 2,
    teamRankInGroup: 1,
    rankPublic: null,
    colorId: 12,
    textWhite: null,
    active: true,
  },
  {
    id: 3,
    clubId: 1,
    name: "Talent Herre",
    shortName: "T.H",
    seasonal: true,
    hasWaitlistMembers: false,
    hasWaitlistPublic: false,
    onlyTeamMembers: true,
    areEventsPublic: false,
    genderId: 1,
    ageGroupId: 5,
    rankGroupId: 1,
    teamRankInGroup: 2,
    rankPublic: null,
    colorId: 2,
    textWhite: null,
    active: true,
  },
  {
    id: 4,
    clubId: 1,
    name: "Talent Dame",
    shortName: "T.D",
    seasonal: true,
    hasWaitlistMembers: false,
    hasWaitlistPublic: false,
    onlyTeamMembers: true,
    areEventsPublic: false,
    genderId: 2,
    ageGroupId: 5,
    rankGroupId: 2,
    teamRankInGroup: 1,
    rankPublic: null,
    colorId: 17,
    textWhite: null,
    active: true,
  },
  {
    id: 5,
    clubId: 1,
    name: "Herre A",
    shortName: "H.A",
    seasonal: true,
    hasWaitlistMembers: false,
    hasWaitlistPublic: false,
    onlyTeamMembers: true,
    areEventsPublic: false,
    genderId: 1,
    ageGroupId: 5,
    rankGroupId: 1,
    teamRankInGroup: 3,
    rankPublic: null,
    colorId: 6,
    textWhite: null,
    active: true,
  },
  {
    id: 6,
    clubId: 1,
    name: "Herre B",
    shortName: "H.B",
    seasonal: true,
    hasWaitlistMembers: false,
    hasWaitlistPublic: false,
    onlyTeamMembers: true,
    areEventsPublic: false,
    genderId: 1,
    ageGroupId: 5,
    rankGroupId: 1,
    teamRankInGroup: 4,
    rankPublic: null,
    colorId: 5,
    textWhite: null,
    active: true,
  },
  {
    id: 7,
    clubId: 1,
    name: "Herre C",
    shortName: "H.C",
    seasonal: true,
    hasWaitlistMembers: false,
    hasWaitlistPublic: false,
    onlyTeamMembers: true,
    areEventsPublic: false,
    genderId: 1,
    ageGroupId: 5,
    rankGroupId: 1,
    teamRankInGroup: 5,
    rankPublic: null,
    colorId: 4,
    textWhite: null,
    active: true,
  },
  {
    id: 8,
    clubId: 1,
    name: "Herre D",
    shortName: "H.D",
    seasonal: true,
    hasWaitlistMembers: false,
    hasWaitlistPublic: false,
    onlyTeamMembers: true,
    areEventsPublic: false,
    genderId: 1,
    ageGroupId: 5,
    rankGroupId: 1,
    teamRankInGroup: 6,
    rankPublic: null,
    colorId: 19,
    textWhite: null,
    active: true,
  },
  {
    id: 9,
    clubId: 1,
    name: "Dame A",
    shortName: "D.A",
    seasonal: true,
    hasWaitlistMembers: false,
    hasWaitlistPublic: false,
    onlyTeamMembers: true,
    areEventsPublic: false,
    genderId: 2,
    ageGroupId: 5,
    rankGroupId: 2,
    teamRankInGroup: 3,
    rankPublic: null,
    colorId: 9,
    textWhite: null,
    active: true,
  },
  {
    id: 10,
    clubId: 1,
    name: "Dame B",
    shortName: "D.B",
    seasonal: true,
    hasWaitlistMembers: false,
    hasWaitlistPublic: false,
    onlyTeamMembers: true,
    areEventsPublic: false,
    genderId: 2,
    ageGroupId: 5,
    rankGroupId: 2,
    teamRankInGroup: 4,
    rankPublic: null,
    colorId: 10,
    textWhite: null,
    active: true,
  },
  {
    id: 11,
    clubId: 1,
    name: "Dame C",
    shortName: "D.C",
    seasonal: true,
    hasWaitlistMembers: false,
    hasWaitlistPublic: false,
    onlyTeamMembers: true,
    areEventsPublic: false,
    genderId: 2,
    ageGroupId: 5,
    rankGroupId: 2,
    teamRankInGroup: 5,
    rankPublic: null,
    colorId: 13,
    textWhite: null,
    active: true,
  },
  {
    id: 12,
    clubId: 1,
    name: "Dame D",
    shortName: "D.D",
    seasonal: true,
    hasWaitlistMembers: false,
    hasWaitlistPublic: false,
    onlyTeamMembers: true,
    areEventsPublic: false,
    genderId: 2,
    ageGroupId: 5,
    rankGroupId: 2,
    teamRankInGroup: 6,
    rankPublic: null,
    colorId: 14,
    textWhite: null,
    active: true,
  },
  {
    id: 13,
    clubId: 1,
    name: "u19",
    shortName: "u19",
    seasonal: true,
    hasWaitlistMembers: false,
    hasWaitlistPublic: false,
    onlyTeamMembers: true,
    areEventsPublic: false,
    genderId: null,
    ageGroupId: 4,
    rankGroupId: 3,
    teamRankInGroup: 1,
    rankPublic: null,
    colorId: 20,
    textWhite: null,
    active: true,
  },
  {
    id: 14,
    clubId: 1,
    name: "u15",
    shortName: "u15",
    seasonal: true,
    hasWaitlistMembers: false,
    hasWaitlistPublic: false,
    onlyTeamMembers: true,
    areEventsPublic: false,
    genderId: null,
    ageGroupId: 3,
    rankGroupId: 4,
    teamRankInGroup: 2,
    rankPublic: null,
    colorId: 11,
    textWhite: null,
    active: true,
  },
  {
    id: 15,
    clubId: 1,
    name: "Kids",
    shortName: "Kids",
    seasonal: true,
    hasWaitlistMembers: false,
    hasWaitlistPublic: false,
    onlyTeamMembers: true,
    areEventsPublic: false,
    genderId: null,
    ageGroupId: 2,
    rankGroupId: null,
    teamRankInGroup: null,
    rankPublic: null,
    colorId: 24,
    textWhite: null,
    active: true,
  },
  {
    id: 16,
    clubId: 1,
    name: "Ramasjang",
    shortName: "Rama",
    seasonal: true,
    hasWaitlistMembers: false,
    hasWaitlistPublic: false,
    onlyTeamMembers: true,
    areEventsPublic: false,
    genderId: null,
    ageGroupId: 1,
    rankGroupId: null,
    teamRankInGroup: null,
    rankPublic: null,
    colorId: 18,
    textWhite: null,
    active: true,
  },
  {
    id: 17,
    clubId: 1,
    name: "Mix",
    shortName: "Mix",
    seasonal: true,
    hasWaitlistMembers: false,
    hasWaitlistPublic: false,
    onlyTeamMembers: true,
    areEventsPublic: false,
    genderId: null,
    ageGroupId: 5,
    rankGroupId: null,
    teamRankInGroup: null,
    rankPublic: null,
    colorId: 23,
    textWhite: null,
    active: false,
  },
  {
    id: 18,
    clubId: 1,
    name: "Begynder Mix",
    shortName: "Mix",
    seasonal: true,
    hasWaitlistMembers: false,
    hasWaitlistPublic: false,
    onlyTeamMembers: true,
    areEventsPublic: false,
    genderId: null,
    ageGroupId: 5,
    rankGroupId: null,
    teamRankInGroup: null,
    rankPublic: null,
    colorId: 22,
    textWhite: true,
    active: true,
  },
  {
    id: 19,
    clubId: 1,
    name: "Fredagsbeach",
    shortName: "FriB",
    seasonal: true,
    hasWaitlistMembers: false,
    hasWaitlistPublic: false,
    onlyTeamMembers: false,
    areEventsPublic: false,
    genderId: null,
    ageGroupId: null,
    rankGroupId: null,
    teamRankInGroup: null,
    rankPublic: null,
    colorId: 19,
    textWhite: null,
    active: true,
  },
  {
    id: 20,
    clubId: 1,
    name: "Bestyrelsen",
    shortName: "Board",
    seasonal: false,
    hasWaitlistMembers: true,
    hasWaitlistPublic: false,
    onlyTeamMembers: true,
    areEventsPublic: false,
    genderId: null,
    ageGroupId: null,
    rankGroupId: null,
    teamRankInGroup: null,
    rankPublic: null,
    colorId: null,
    textWhite: null,
    active: true,
  },
  {
    id: 21,
    clubId: 1,
    name: "Party committee",
    shortName: "Party",
    seasonal: false,
    hasWaitlistMembers: true,
    hasWaitlistPublic: false,
    onlyTeamMembers: true,
    areEventsPublic: false,
    genderId: null,
    ageGroupId: null,
    rankGroupId: null,
    teamRankInGroup: null,
    rankPublic: null,
    colorId: null,
    textWhite: null,
    active: true,
  },
  {
    id: 22,
    clubId: 3,
    name: "Tur kajak",
    shortName: "Tur",
    seasonal: false,
    hasWaitlistMembers: false,
    hasWaitlistPublic: false,
    onlyTeamMembers: true,
    areEventsPublic: false,
    genderId: null,
    ageGroupId: null,
    rankGroupId: null,
    teamRankInGroup: null,
    rankPublic: null,
    colorId: null,
    textWhite: null,
    active: true,
  },
  {
    id: 23,
    clubId: 3,
    name: "Hav kajak",
    shortName: "Hav",
    seasonal: false,
    hasWaitlistMembers: false,
    hasWaitlistPublic: false,
    onlyTeamMembers: true,
    areEventsPublic: false,
    genderId: null,
    ageGroupId: null,
    rankGroupId: null,
    teamRankInGroup: null,
    rankPublic: null,
    colorId: null,
    textWhite: null,
    active: true,
  },
  {
    id: 24,
    clubId: 3,
    name: "Handicap ræs",
    shortName: "Handi",
    seasonal: true,
    hasWaitlistMembers: false,
    hasWaitlistPublic: false,
    onlyTeamMembers: false,
    areEventsPublic: false,
    genderId: null,
    ageGroupId: null,
    rankGroupId: null,
    teamRankInGroup: null,
    rankPublic: null,
    colorId: null,
    textWhite: null,
    active: true,
  },
  {
    id: 25,
    clubId: 3,
    name: "Bestyrelsen",
    shortName: "Board",
    seasonal: false,
    hasWaitlistMembers: true,
    hasWaitlistPublic: false,
    onlyTeamMembers: true,
    areEventsPublic: false,
    genderId: null,
    ageGroupId: null,
    rankGroupId: null,
    teamRankInGroup: null,
    rankPublic: null,
    colorId: null,
    textWhite: null,
    active: true,
  },
];

async function seedTeams(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Add it to your environment before seeding.",
    );
  }

  const client = postgres(databaseUrl, { max: 1, prepare: false });
  const db = drizzle(client, { schema });

  try {
    const clubsInserted = await db
      .insert(clubsInApp)
      .values([...SAMPLE_CLUBS])
      .onConflictDoNothing({ target: clubsInApp.id })
      .returning({ id: clubsInApp.id });

    await db.execute(
      sql`SELECT setval(pg_get_serial_sequence('app.clubs', 'id'), COALESCE((SELECT MAX(id) FROM app.clubs), 1))`,
    );

    const ageGroupsInserted = await db
      .insert(clubAgeGroupsInApp)
      .values([...CLUB1_AGE_GROUPS])
      .onConflictDoNothing({ target: clubAgeGroupsInApp.id })
      .returning({ id: clubAgeGroupsInApp.id });

    await db.execute(
      sql`SELECT setval(pg_get_serial_sequence('app.club_age_groups', 'id'), COALESCE((SELECT MAX(id) FROM app.club_age_groups), 1))`,
    );

    console.log(
      `Prerequisites: clubs inserted ${clubsInserted.length}; age groups inserted ${ageGroupsInserted.length}.`,
    );

    const inserted = await db
      .insert(teamsInApp)
      .values(TEAMS)
      .onConflictDoNothing({ target: teamsInApp.id })
      .returning({
        id: teamsInApp.id,
        name: teamsInApp.name,
      });

    await db.execute(
      sql`SELECT setval(pg_get_serial_sequence('app.teams', 'id'), COALESCE((SELECT MAX(id) FROM app.teams), 1))`,
    );

    const all = await db
      .select({
        id: teamsInApp.id,
        clubId: teamsInApp.clubId,
        name: teamsInApp.name,
        shortName: teamsInApp.shortName,
        active: teamsInApp.active,
      })
      .from(teamsInApp)
      .orderBy(teamsInApp.id);

    console.log(
      `Seeded teams: inserted ${inserted.length} new row(s); ${all.length} total.`,
    );
    for (const row of all) {
      console.log(
        `  id=${row.id} clubId=${row.clubId} name=${row.name} shortName=${row.shortName} active=${row.active}`,
      );
    }
  } finally {
    await client.end({ timeout: 5 });
  }
}

seedTeams().catch((error: unknown) => {
  console.error("Teams seed failed:", error);
  process.exit(1);
});
