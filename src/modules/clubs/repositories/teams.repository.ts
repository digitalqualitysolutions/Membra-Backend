import { and, asc, eq, sql } from "drizzle-orm";
import { Injectable } from "@nestjs/common";

import type { DbOrTx } from "@/db";
import { clubAgeGroupsInApp, teamsInApp } from "@/db/schema";

export type TeamRow = typeof teamsInApp.$inferSelect;

export type TeamInsert = {
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

@Injectable()
export class TeamsRepository {
  async insert(dbOrTx: DbOrTx, values: TeamInsert): Promise<TeamRow> {
    const [row] = await dbOrTx.insert(teamsInApp).values(values).returning();
    if (!row) {
      throw new Error("Failed to insert team");
    }
    return row;
  }

  async findByIdForClub(
    dbOrTx: DbOrTx,
    clubId: number,
    teamId: number,
  ): Promise<TeamRow | null> {
    const [row] = await dbOrTx
      .select()
      .from(teamsInApp)
      .where(and(eq(teamsInApp.id, teamId), eq(teamsInApp.clubId, clubId)))
      .limit(1);
    return row ?? null;
  }

  async listByClubId(dbOrTx: DbOrTx, clubId: number): Promise<TeamRow[]> {
    return dbOrTx
      .select()
      .from(teamsInApp)
      .where(eq(teamsInApp.clubId, clubId))
      .orderBy(asc(teamsInApp.id));
  }

  async update(
    dbOrTx: DbOrTx,
    clubId: number,
    teamId: number,
    values: Partial<Omit<TeamInsert, "clubId">>,
  ): Promise<TeamRow | null> {
    const [row] = await dbOrTx
      .update(teamsInApp)
      .set({
        ...values,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(and(eq(teamsInApp.id, teamId), eq(teamsInApp.clubId, clubId)))
      .returning();
    return row ?? null;
  }

  /** Returns clubId of the age group, or null if the age group does not exist. */
  async findAgeGroupClubId(
    dbOrTx: DbOrTx,
    ageGroupId: number,
  ): Promise<number | null> {
    const [row] = await dbOrTx
      .select({ clubId: clubAgeGroupsInApp.clubId })
      .from(clubAgeGroupsInApp)
      .where(eq(clubAgeGroupsInApp.id, ageGroupId))
      .limit(1);
    return row?.clubId ?? null;
  }
}
