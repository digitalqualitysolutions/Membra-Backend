import { Inject, Injectable } from "@nestjs/common";

import { DRIZZLE } from "@/db/drizzle.token";
import type { Database } from "@/db/types";
import { NotFoundError, ValidationError } from "@/shared/errors";

import { ClubAccess } from "../lib/club-access";
import {
  SchedulesRepository,
  type ScheduleRow,
} from "../repositories/schedules.repository";
import type {
  CreateScheduleInput,
  UpdateScheduleInput,
} from "../schemas/schedules.schema";

function mapSchedule(row: ScheduleRow) {
  return {
    id: row.id,
    teamSeasonId: row.teamSeasonId,
    startTime: row.startTime,
    rrule: row.rrule,
    durationMinutes: row.durationMinutes,
    startDate: row.startDate,
    endDate: row.endDate,
    locationId: row.locationId,
    locationGroupId: row.locationGroupId,
    active: row.active,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

@Injectable()
export class CreateSchedule {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    @Inject(ClubAccess) private readonly access: ClubAccess,
    @Inject(SchedulesRepository)
    private readonly schedules: SchedulesRepository,
  ) {}

  async execute(clubId: number, userId: string, input: CreateScheduleInput) {
    await this.access.requireAdmin(clubId, userId);
    await this.assertTeamSeasonInClub(clubId, input.teamSeasonId);
    await this.assertLocationsInClub(
      clubId,
      input.locationId ?? null,
      input.locationGroupId ?? null,
    );

    const row = await this.schedules.insert(this.db, {
      teamSeasonId: input.teamSeasonId,
      startTime: input.startTime,
      rrule: input.rrule,
      durationMinutes: input.durationMinutes,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      locationId: input.locationId ?? null,
      locationGroupId: input.locationGroupId ?? null,
      active: input.active ?? true,
    });
    return mapSchedule(row);
  }

  private async assertTeamSeasonInClub(
    clubId: number,
    teamSeasonId: number,
  ): Promise<void> {
    const teamSeasonClubId = await this.schedules.findTeamSeasonClubId(
      this.db,
      teamSeasonId,
    );
    if (teamSeasonClubId == null) {
      throw new ValidationError(
        "teamSeasonId must reference an existing team–season assignment",
      );
    }
    if (teamSeasonClubId !== clubId) {
      throw new ValidationError(
        "teamSeasonId must reference a team–season in this club",
      );
    }
  }

  private async assertLocationsInClub(
    clubId: number,
    locationId: number | null,
    locationGroupId: number | null,
  ): Promise<void> {
    if (locationId != null && locationGroupId != null) {
      throw new ValidationError(
        "Provide either locationId or locationGroupId, not both",
      );
    }
    if (locationId != null) {
      const locationClubId = await this.schedules.findLocationClubId(
        this.db,
        locationId,
      );
      if (locationClubId == null) {
        throw new ValidationError(
          "locationId must reference an existing location",
        );
      }
      if (locationClubId !== clubId) {
        throw new ValidationError(
          "locationId must reference a location in this club",
        );
      }
    }
    if (locationGroupId != null) {
      const groupClubId = await this.schedules.findLocationGroupClubId(
        this.db,
        locationGroupId,
      );
      if (groupClubId == null) {
        throw new ValidationError(
          "locationGroupId must reference an existing location group",
        );
      }
      if (groupClubId !== clubId) {
        throw new ValidationError(
          "locationGroupId must reference a location group in this club",
        );
      }
    }
  }
}

@Injectable()
export class UpdateSchedule {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    @Inject(ClubAccess) private readonly access: ClubAccess,
    @Inject(SchedulesRepository)
    private readonly schedules: SchedulesRepository,
  ) {}

  async execute(
    clubId: number,
    scheduleId: number,
    userId: string,
    input: UpdateScheduleInput,
  ) {
    await this.access.requireAdmin(clubId, userId);

    const existing = await this.schedules.findByIdForClub(
      this.db,
      clubId,
      scheduleId,
    );
    if (!existing) {
      throw new NotFoundError("Schedule not found");
    }

    const nextStart =
      input.startDate !== undefined ? input.startDate : existing.startDate;
    const nextEnd =
      input.endDate !== undefined ? input.endDate : existing.endDate;
    if (nextStart != null && nextEnd != null && nextEnd < nextStart) {
      throw new ValidationError("endDate must be on or after startDate");
    }

    const nextLocationId =
      input.locationId !== undefined ? input.locationId : existing.locationId;
    const nextLocationGroupId =
      input.locationGroupId !== undefined
        ? input.locationGroupId
        : existing.locationGroupId;
    if (nextLocationId != null && nextLocationGroupId != null) {
      throw new ValidationError(
        "Provide either locationId or locationGroupId, not both",
      );
    }

    if (input.locationId !== undefined || input.locationGroupId !== undefined) {
      await this.assertLocationsInClub(
        clubId,
        nextLocationId,
        nextLocationGroupId,
      );
    }

    const patch: Partial<{
      startTime: string;
      rrule: string;
      durationMinutes: number;
      startDate: string | null;
      endDate: string | null;
      locationId: number | null;
      locationGroupId: number | null;
      active: boolean;
    }> = {};

    if (input.startTime !== undefined) patch.startTime = input.startTime;
    if (input.rrule !== undefined) patch.rrule = input.rrule;
    if (input.durationMinutes !== undefined) {
      patch.durationMinutes = input.durationMinutes;
    }
    if (input.startDate !== undefined) patch.startDate = input.startDate;
    if (input.endDate !== undefined) patch.endDate = input.endDate;
    if (input.locationId !== undefined) patch.locationId = input.locationId;
    if (input.locationGroupId !== undefined) {
      patch.locationGroupId = input.locationGroupId;
    }
    if (input.active !== undefined) patch.active = input.active;

    const row = await this.schedules.update(this.db, scheduleId, patch);
    if (!row) {
      throw new NotFoundError("Schedule not found");
    }
    return mapSchedule(row);
  }

  private async assertLocationsInClub(
    clubId: number,
    locationId: number | null,
    locationGroupId: number | null,
  ): Promise<void> {
    if (locationId != null) {
      const locationClubId = await this.schedules.findLocationClubId(
        this.db,
        locationId,
      );
      if (locationClubId == null) {
        throw new ValidationError(
          "locationId must reference an existing location",
        );
      }
      if (locationClubId !== clubId) {
        throw new ValidationError(
          "locationId must reference a location in this club",
        );
      }
    }
    if (locationGroupId != null) {
      const groupClubId = await this.schedules.findLocationGroupClubId(
        this.db,
        locationGroupId,
      );
      if (groupClubId == null) {
        throw new ValidationError(
          "locationGroupId must reference an existing location group",
        );
      }
      if (groupClubId !== clubId) {
        throw new ValidationError(
          "locationGroupId must reference a location group in this club",
        );
      }
    }
  }
}

@Injectable()
export class ListSchedules {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    @Inject(ClubAccess) private readonly access: ClubAccess,
    @Inject(SchedulesRepository)
    private readonly schedules: SchedulesRepository,
  ) {}

  async execute(clubId: number, userId: string) {
    await this.access.requireMember(clubId, userId);
    const rows = await this.schedules.listByClubId(this.db, clubId);
    return { schedules: rows.map(mapSchedule) };
  }
}
