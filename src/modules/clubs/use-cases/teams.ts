import { Inject, Injectable } from "@nestjs/common";

import { DRIZZLE } from "@/db/drizzle.token";
import type { Database } from "@/db/types";
import { isForeignKeyViolation } from "@/shared/db/pg-errors";
import { NotFoundError, ValidationError } from "@/shared/errors";

import { ClubAccess } from "../lib/club-access";
import {
  TeamsRepository,
  type TeamRow,
} from "../repositories/teams.repository";
import type {
  CreateTeamInput,
  UpdateTeamInput,
} from "../schemas/teams.schema";

function mapTeam(row: TeamRow) {
  return {
    id: row.id,
    clubId: row.clubId,
    name: row.name,
    shortName: row.shortName,
    seasonal: row.seasonal,
    hasWaitlistMembers: row.hasWaitlistMembers,
    hasWaitlistPublic: row.hasWaitlistPublic,
    onlyTeamMembers: row.onlyTeamMembers,
    areEventsPublic: row.areEventsPublic,
    genderId: row.genderId,
    ageGroupId: row.ageGroupId,
    rankGroupId: row.rankGroupId,
    teamRankInGroup: row.teamRankInGroup,
    rankPublic: row.rankPublic,
    colorId: row.colorId,
    textWhite: row.textWhite,
    active: row.active,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

@Injectable()
export class CreateTeam {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    @Inject(ClubAccess) private readonly access: ClubAccess,
    @Inject(TeamsRepository) private readonly teams: TeamsRepository,
  ) {}

  async execute(clubId: number, userId: string, input: CreateTeamInput) {
    await this.access.requireAdmin(clubId, userId);
    await this.assertAgeGroupBelongsToClub(clubId, input.ageGroupId ?? null);

    try {
      const row = await this.teams.insert(this.db, {
        clubId,
        name: input.name,
        shortName: input.shortName,
        seasonal: input.seasonal ?? true,
        hasWaitlistMembers: input.hasWaitlistMembers ?? false,
        hasWaitlistPublic: input.hasWaitlistPublic ?? false,
        onlyTeamMembers: input.onlyTeamMembers ?? true,
        areEventsPublic: input.areEventsPublic ?? false,
        genderId: input.genderId ?? null,
        ageGroupId: input.ageGroupId ?? null,
        rankGroupId: input.rankGroupId ?? null,
        teamRankInGroup: input.teamRankInGroup ?? null,
        rankPublic: input.rankPublic ?? null,
        colorId: input.colorId ?? null,
        textWhite: input.textWhite ?? null,
        active: input.active ?? true,
      });
      return mapTeam(row);
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new ValidationError(
          "genderId, ageGroupId, or colorId references an unknown row",
        );
      }
      throw error;
    }
  }

  private async assertAgeGroupBelongsToClub(
    clubId: number,
    ageGroupId: number | null,
  ): Promise<void> {
    if (ageGroupId == null) {
      return;
    }
    const ageGroupClubId = await this.teams.findAgeGroupClubId(
      this.db,
      ageGroupId,
    );
    if (ageGroupClubId == null) {
      throw new ValidationError("ageGroupId must reference an existing age group");
    }
    if (ageGroupClubId !== clubId) {
      throw new ValidationError(
        "ageGroupId must reference an age group in this club",
      );
    }
  }
}

@Injectable()
export class UpdateTeam {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    @Inject(ClubAccess) private readonly access: ClubAccess,
    @Inject(TeamsRepository) private readonly teams: TeamsRepository,
  ) {}

  async execute(
    clubId: number,
    teamId: number,
    userId: string,
    input: UpdateTeamInput,
  ) {
    await this.access.requireAdmin(clubId, userId);

    const existing = await this.teams.findByIdForClub(this.db, clubId, teamId);
    if (!existing) {
      throw new NotFoundError("Team not found");
    }

    if (input.ageGroupId !== undefined) {
      await this.assertAgeGroupBelongsToClub(clubId, input.ageGroupId);
    }

    try {
      const patch: Partial<{
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
      }> = {};

      if (input.name !== undefined) patch.name = input.name;
      if (input.shortName !== undefined) patch.shortName = input.shortName;
      if (input.seasonal !== undefined) patch.seasonal = input.seasonal;
      if (input.hasWaitlistMembers !== undefined) {
        patch.hasWaitlistMembers = input.hasWaitlistMembers;
      }
      if (input.hasWaitlistPublic !== undefined) {
        patch.hasWaitlistPublic = input.hasWaitlistPublic;
      }
      if (input.onlyTeamMembers !== undefined) {
        patch.onlyTeamMembers = input.onlyTeamMembers;
      }
      if (input.areEventsPublic !== undefined) {
        patch.areEventsPublic = input.areEventsPublic;
      }
      if (input.genderId !== undefined) patch.genderId = input.genderId;
      if (input.ageGroupId !== undefined) patch.ageGroupId = input.ageGroupId;
      if (input.rankGroupId !== undefined) patch.rankGroupId = input.rankGroupId;
      if (input.teamRankInGroup !== undefined) {
        patch.teamRankInGroup = input.teamRankInGroup;
      }
      if (input.rankPublic !== undefined) patch.rankPublic = input.rankPublic;
      if (input.colorId !== undefined) patch.colorId = input.colorId;
      if (input.textWhite !== undefined) patch.textWhite = input.textWhite;
      if (input.active !== undefined) patch.active = input.active;

      const row = await this.teams.update(this.db, clubId, teamId, patch);
      if (!row) {
        throw new NotFoundError("Team not found");
      }
      return mapTeam(row);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      if (isForeignKeyViolation(error)) {
        throw new ValidationError(
          "genderId, ageGroupId, or colorId references an unknown row",
        );
      }
      throw error;
    }
  }

  private async assertAgeGroupBelongsToClub(
    clubId: number,
    ageGroupId: number | null,
  ): Promise<void> {
    if (ageGroupId == null) {
      return;
    }
    const ageGroupClubId = await this.teams.findAgeGroupClubId(
      this.db,
      ageGroupId,
    );
    if (ageGroupClubId == null) {
      throw new ValidationError("ageGroupId must reference an existing age group");
    }
    if (ageGroupClubId !== clubId) {
      throw new ValidationError(
        "ageGroupId must reference an age group in this club",
      );
    }
  }
}

@Injectable()
export class GetTeam {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    @Inject(ClubAccess) private readonly access: ClubAccess,
    @Inject(TeamsRepository) private readonly teams: TeamsRepository,
  ) {}

  async execute(clubId: number, teamId: number, userId: string) {
    await this.access.requireMember(clubId, userId);
    const row = await this.teams.findByIdForClub(this.db, clubId, teamId);
    if (!row) {
      throw new NotFoundError("Team not found");
    }
    return mapTeam(row);
  }
}

@Injectable()
export class ListTeams {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    @Inject(ClubAccess) private readonly access: ClubAccess,
    @Inject(TeamsRepository) private readonly teams: TeamsRepository,
  ) {}

  async execute(clubId: number, userId: string) {
    await this.access.requireMember(clubId, userId);
    const rows = await this.teams.listByClubId(this.db, clubId);
    return { teams: rows.map(mapTeam) };
  }
}
