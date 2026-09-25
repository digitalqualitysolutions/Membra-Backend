import { and, asc, eq, sql } from "drizzle-orm";
import { Injectable } from "@nestjs/common";

import type { DbOrTx } from "@/db";
import { seasonsInApp, teamsInApp, teamSeasonsInApp } from "@/db/schema";

export type TeamSeasonRow = typeof teamSeasonsInApp.$inferSelect;

export type TeamSeasonInsert = {
  teamId: number;
  seasonId: number;
  minSignup: number | null;
  maxSignup: number | null;
  active: boolean;
};

@Injectable()
export class TeamSeasonsRepository {
  async insert(
    dbOrTx: DbOrTx,
    values: TeamSeasonInsert,
  ): Promise<TeamSeasonRow> {
    const [row] = await dbOrTx
      .insert(teamSeasonsInApp)
      .values(values)
      .returning();
    if (!row) {
      throw new Error("Failed to insert team season");
    }
    return row;
  }

  async findByIdForClub(
    dbOrTx: DbOrTx,
    clubId: number,
    teamSeasonId: number,
  ): Promise<TeamSeasonRow | null> {
    const [row] = await dbOrTx
      .select({
        id: teamSeasonsInApp.id,
        teamId: teamSeasonsInApp.teamId,
        seasonId: teamSeasonsInApp.seasonId,
        minSignup: teamSeasonsInApp.minSignup,
        maxSignup: teamSeasonsInApp.maxSignup,
        active: teamSeasonsInApp.active,
        createdAt: teamSeasonsInApp.createdAt,
        updatedAt: teamSeasonsInApp.updatedAt,
      })
      .from(teamSeasonsInApp)
      .innerJoin(teamsInApp, eq(teamSeasonsInApp.teamId, teamsInApp.id))
      .innerJoin(seasonsInApp, eq(teamSeasonsInApp.seasonId, seasonsInApp.id))
      .where(
        and(
          eq(teamSeasonsInApp.id, teamSeasonId),
          eq(teamsInApp.clubId, clubId),
          eq(seasonsInApp.clubId, clubId),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async listByClubId(
    dbOrTx: DbOrTx,
    clubId: number,
  ): Promise<TeamSeasonRow[]> {
    return dbOrTx
      .select({
        id: teamSeasonsInApp.id,
        teamId: teamSeasonsInApp.teamId,
        seasonId: teamSeasonsInApp.seasonId,
        minSignup: teamSeasonsInApp.minSignup,
        maxSignup: teamSeasonsInApp.maxSignup,
        active: teamSeasonsInApp.active,
        createdAt: teamSeasonsInApp.createdAt,
        updatedAt: teamSeasonsInApp.updatedAt,
      })
      .from(teamSeasonsInApp)
      .innerJoin(teamsInApp, eq(teamSeasonsInApp.teamId, teamsInApp.id))
      .innerJoin(seasonsInApp, eq(teamSeasonsInApp.seasonId, seasonsInApp.id))
      .where(
        and(eq(teamsInApp.clubId, clubId), eq(seasonsInApp.clubId, clubId)),
      )
      .orderBy(asc(teamSeasonsInApp.id));
  }

  async update(
    dbOrTx: DbOrTx,
    teamSeasonId: number,
    values: Partial<Omit<TeamSeasonInsert, "teamId" | "seasonId">>,
  ): Promise<TeamSeasonRow | null> {
    const [row] = await dbOrTx
      .update(teamSeasonsInApp)
      .set({
        ...values,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(teamSeasonsInApp.id, teamSeasonId))
      .returning();
    return row ?? null;
  }

  async findTeamClubId(
    dbOrTx: DbOrTx,
    teamId: number,
  ): Promise<number | null> {
    const [row] = await dbOrTx
      .select({ clubId: teamsInApp.clubId })
      .from(teamsInApp)
      .where(eq(teamsInApp.id, teamId))
      .limit(1);
    return row?.clubId ?? null;
  }

  async findSeasonClubId(
    dbOrTx: DbOrTx,
    seasonId: number,
  ): Promise<number | null> {
    const [row] = await dbOrTx
      .select({ clubId: seasonsInApp.clubId })
      .from(seasonsInApp)
      .where(eq(seasonsInApp.id, seasonId))
      .limit(1);
    return row?.clubId ?? null;
  }
}
