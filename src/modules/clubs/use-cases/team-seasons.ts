import { Inject, Injectable } from "@nestjs/common";

import { DRIZZLE } from "@/db/drizzle.token";
import type { Database } from "@/db/types";
import { isUniqueViolation } from "@/shared/db/pg-errors";
import { ConflictError, NotFoundError, ValidationError } from "@/shared/errors";

import { ClubAccess } from "../lib/club-access";
import {
  TeamSeasonsRepository,
  type TeamSeasonRow,
} from "../repositories/team-seasons.repository";
import type {
  CreateTeamSeasonInput,
  UpdateTeamSeasonInput,
} from "../schemas/team-seasons.schema";

function mapTeamSeason(row: TeamSeasonRow) {
  return {
    id: row.id,
    teamId: row.teamId,
    seasonId: row.seasonId,
    minSignup: row.minSignup,
    maxSignup: row.maxSignup,
    active: row.active,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

@Injectable()
export class CreateTeamSeason {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    @Inject(ClubAccess) private readonly access: ClubAccess,
    @Inject(TeamSeasonsRepository)
    private readonly teamSeasons: TeamSeasonsRepository,
  ) {}

  async execute(clubId: number, userId: string, input: CreateTeamSeasonInput) {
    await this.access.requireAdmin(clubId, userId);
    await this.assertTeamAndSeasonInClub(clubId, input.teamId, input.seasonId);

    try {
      const row = await this.teamSeasons.insert(this.db, {
        teamId: input.teamId,
        seasonId: input.seasonId,
        minSignup: input.minSignup ?? null,
        maxSignup: input.maxSignup ?? null,
        active: input.active ?? true,
      });
      return mapTeamSeason(row);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictError(
          "This team is already assigned to this season",
        );
      }
      throw error;
    }
  }

  private async assertTeamAndSeasonInClub(
    clubId: number,
    teamId: number,
    seasonId: number,
  ): Promise<void> {
    const [teamClubId, seasonClubId] = await Promise.all([
      this.teamSeasons.findTeamClubId(this.db, teamId),
      this.teamSeasons.findSeasonClubId(this.db, seasonId),
    ]);
    if (teamClubId == null) {
      throw new ValidationError("teamId must reference an existing team");
    }
    if (teamClubId !== clubId) {
      throw new ValidationError("teamId must reference a team in this club");
    }
    if (seasonClubId == null) {
      throw new ValidationError("seasonId must reference an existing season");
    }
    if (seasonClubId !== clubId) {
      throw new ValidationError(
        "seasonId must reference a season in this club",
      );
    }
  }
}

@Injectable()
export class UpdateTeamSeason {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    @Inject(ClubAccess) private readonly access: ClubAccess,
    @Inject(TeamSeasonsRepository)
    private readonly teamSeasons: TeamSeasonsRepository,
  ) {}

  async execute(
    clubId: number,
    teamSeasonId: number,
    userId: string,
    input: UpdateTeamSeasonInput,
  ) {
    await this.access.requireAdmin(clubId, userId);

    const existing = await this.teamSeasons.findByIdForClub(
      this.db,
      clubId,
      teamSeasonId,
    );
    if (!existing) {
      throw new NotFoundError("Team season assignment not found");
    }

    const nextMin =
      input.minSignup !== undefined ? input.minSignup : existing.minSignup;
    const nextMax =
      input.maxSignup !== undefined ? input.maxSignup : existing.maxSignup;
    if (nextMin != null && nextMax != null && nextMax < nextMin) {
      throw new ValidationError(
        "maxSignup must be greater than or equal to minSignup",
      );
    }

    const patch: Partial<{
      minSignup: number | null;
      maxSignup: number | null;
      active: boolean;
    }> = {};
    if (input.minSignup !== undefined) patch.minSignup = input.minSignup;
    if (input.maxSignup !== undefined) patch.maxSignup = input.maxSignup;
    if (input.active !== undefined) patch.active = input.active;

    const row = await this.teamSeasons.update(this.db, teamSeasonId, patch);
    if (!row) {
      throw new NotFoundError("Team season assignment not found");
    }
    return mapTeamSeason(row);
  }
}

@Injectable()
export class ListTeamSeasons {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    @Inject(ClubAccess) private readonly access: ClubAccess,
    @Inject(TeamSeasonsRepository)
    private readonly teamSeasons: TeamSeasonsRepository,
  ) {}

  async execute(clubId: number, userId: string) {
    await this.access.requireMember(clubId, userId);
    const rows = await this.teamSeasons.listByClubId(this.db, clubId);
    return { teamSeasons: rows.map(mapTeamSeason) };
  }
}
