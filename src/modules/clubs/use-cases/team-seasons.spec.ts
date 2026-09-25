import { beforeEach, describe, expect, it, vi } from "vitest";

import { ConflictError, ValidationError } from "@/shared/errors";

import { CreateTeamSeason, UpdateTeamSeason } from "./team-seasons";

const baseCreate = {
  teamId: 1,
  seasonId: 1,
  minSignup: null,
  maxSignup: null,
  active: true,
};

describe("CreateTeamSeason", () => {
  const access = { requireAdmin: vi.fn() };
  const teamSeasons = {
    insert: vi.fn(),
    findTeamClubId: vi.fn(),
    findSeasonClubId: vi.fn(),
  };
  const db = {} as never;

  const useCase = new CreateTeamSeason(
    db,
    access as never,
    teamSeasons as never,
  );

  beforeEach(() => {
    vi.clearAllMocks();
    access.requireAdmin.mockResolvedValue(undefined);
    teamSeasons.findTeamClubId.mockResolvedValue(12);
    teamSeasons.findSeasonClubId.mockResolvedValue(12);
    teamSeasons.insert.mockImplementation(
      async (_db: unknown, values: Record<string, unknown>) => ({
        id: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        ...values,
      }),
    );
  });

  it("assigns a team to a season for an admin", async () => {
    const result = await useCase.execute(12, "user-1", baseCreate);

    expect(access.requireAdmin).toHaveBeenCalledWith(12, "user-1");
    expect(teamSeasons.insert).toHaveBeenCalledWith(
      db,
      expect.objectContaining({ teamId: 1, seasonId: 1, active: true }),
    );
    expect(result.teamId).toBe(1);
    expect(result.seasonId).toBe(1);
  });

  it("rejects team from another club", async () => {
    teamSeasons.findTeamClubId.mockResolvedValue(99);
    await expect(
      useCase.execute(12, "user-1", baseCreate),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(teamSeasons.insert).not.toHaveBeenCalled();
  });

  it("maps unique conflicts", async () => {
    teamSeasons.insert.mockRejectedValue({ code: "23505" });
    await expect(
      useCase.execute(12, "user-1", baseCreate),
    ).rejects.toBeInstanceOf(ConflictError);
  });
});

describe("UpdateTeamSeason", () => {
  const access = { requireAdmin: vi.fn() };
  const teamSeasons = {
    findByIdForClub: vi.fn(),
    update: vi.fn(),
  };
  const db = {} as never;

  const useCase = new UpdateTeamSeason(
    db,
    access as never,
    teamSeasons as never,
  );

  beforeEach(() => {
    vi.clearAllMocks();
    access.requireAdmin.mockResolvedValue(undefined);
    teamSeasons.findByIdForClub.mockResolvedValue({
      id: 1,
      teamId: 1,
      seasonId: 1,
      minSignup: 2,
      maxSignup: 10,
      active: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    teamSeasons.update.mockImplementation(
      async (
        _db: unknown,
        _id: number,
        patch: Record<string, unknown>,
      ) => ({
        id: 1,
        teamId: 1,
        seasonId: 1,
        minSignup: 2,
        maxSignup: 10,
        active: true,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-02T00:00:00.000Z",
        ...patch,
      }),
    );
  });

  it("soft-offs via active", async () => {
    const result = await useCase.execute(12, 1, "user-1", { active: false });
    expect(result.active).toBe(false);
  });

  it("rejects maxSignup below minSignup", async () => {
    await expect(
      useCase.execute(12, 1, "user-1", { maxSignup: 1 }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(teamSeasons.update).not.toHaveBeenCalled();
  });
});
