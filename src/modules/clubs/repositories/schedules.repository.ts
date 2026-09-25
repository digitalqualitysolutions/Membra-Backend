import { and, asc, eq, sql } from "drizzle-orm";
import { Injectable } from "@nestjs/common";

import type { DbOrTx } from "@/db";
import {
  locationGroupsInApp,
  locationsInApp,
  schedulesInApp,
  teamsInApp,
  teamSeasonsInApp,
} from "@/db/schema";

export type ScheduleRow = typeof schedulesInApp.$inferSelect;

export type ScheduleInsert = {
  teamSeasonId: number;
  startTime: string;
  rrule: string;
  durationMinutes: number;
  startDate: string | null;
  endDate: string | null;
  locationId: number | null;
  locationGroupId: number | null;
  active: boolean;
};

@Injectable()
export class SchedulesRepository {
  async insert(dbOrTx: DbOrTx, values: ScheduleInsert): Promise<ScheduleRow> {
    const [row] = await dbOrTx.insert(schedulesInApp).values(values).returning();
    if (!row) {
      throw new Error("Failed to insert schedule");
    }
    return row;
  }

  async findByIdForClub(
    dbOrTx: DbOrTx,
    clubId: number,
    scheduleId: number,
  ): Promise<ScheduleRow | null> {
    const [row] = await dbOrTx
      .select({
        id: schedulesInApp.id,
        teamSeasonId: schedulesInApp.teamSeasonId,
        startTime: schedulesInApp.startTime,
        rrule: schedulesInApp.rrule,
        durationMinutes: schedulesInApp.durationMinutes,
        startDate: schedulesInApp.startDate,
        endDate: schedulesInApp.endDate,
        locationId: schedulesInApp.locationId,
        locationGroupId: schedulesInApp.locationGroupId,
        active: schedulesInApp.active,
        createdAt: schedulesInApp.createdAt,
        updatedAt: schedulesInApp.updatedAt,
      })
      .from(schedulesInApp)
      .innerJoin(
        teamSeasonsInApp,
        eq(schedulesInApp.teamSeasonId, teamSeasonsInApp.id),
      )
      .innerJoin(teamsInApp, eq(teamSeasonsInApp.teamId, teamsInApp.id))
      .where(
        and(eq(schedulesInApp.id, scheduleId), eq(teamsInApp.clubId, clubId)),
      )
      .limit(1);
    return row ?? null;
  }

  async listByClubId(dbOrTx: DbOrTx, clubId: number): Promise<ScheduleRow[]> {
    return dbOrTx
      .select({
        id: schedulesInApp.id,
        teamSeasonId: schedulesInApp.teamSeasonId,
        startTime: schedulesInApp.startTime,
        rrule: schedulesInApp.rrule,
        durationMinutes: schedulesInApp.durationMinutes,
        startDate: schedulesInApp.startDate,
        endDate: schedulesInApp.endDate,
        locationId: schedulesInApp.locationId,
        locationGroupId: schedulesInApp.locationGroupId,
        active: schedulesInApp.active,
        createdAt: schedulesInApp.createdAt,
        updatedAt: schedulesInApp.updatedAt,
      })
      .from(schedulesInApp)
      .innerJoin(
        teamSeasonsInApp,
        eq(schedulesInApp.teamSeasonId, teamSeasonsInApp.id),
      )
      .innerJoin(teamsInApp, eq(teamSeasonsInApp.teamId, teamsInApp.id))
      .where(eq(teamsInApp.clubId, clubId))
      .orderBy(asc(schedulesInApp.id));
  }

  async update(
    dbOrTx: DbOrTx,
    scheduleId: number,
    values: Partial<Omit<ScheduleInsert, "teamSeasonId">>,
  ): Promise<ScheduleRow | null> {
    const [row] = await dbOrTx
      .update(schedulesInApp)
      .set({
        ...values,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(schedulesInApp.id, scheduleId))
      .returning();
    return row ?? null;
  }

  async findTeamSeasonClubId(
    dbOrTx: DbOrTx,
    teamSeasonId: number,
  ): Promise<number | null> {
    const [row] = await dbOrTx
      .select({ clubId: teamsInApp.clubId })
      .from(teamSeasonsInApp)
      .innerJoin(teamsInApp, eq(teamSeasonsInApp.teamId, teamsInApp.id))
      .where(eq(teamSeasonsInApp.id, teamSeasonId))
      .limit(1);
    return row?.clubId ?? null;
  }

  async findLocationClubId(
    dbOrTx: DbOrTx,
    locationId: number,
  ): Promise<number | null> {
    const [row] = await dbOrTx
      .select({ clubId: locationsInApp.clubId })
      .from(locationsInApp)
      .where(eq(locationsInApp.id, locationId))
      .limit(1);
    return row?.clubId ?? null;
  }

  async findLocationGroupClubId(
    dbOrTx: DbOrTx,
    locationGroupId: number,
  ): Promise<number | null> {
    const [row] = await dbOrTx
      .select({ clubId: locationGroupsInApp.clubId })
      .from(locationGroupsInApp)
      .where(eq(locationGroupsInApp.id, locationGroupId))
      .limit(1);
    return row?.clubId ?? null;
  }
}
