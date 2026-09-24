import { beforeEach, describe, expect, it, vi } from "vitest";

import { ValidationError } from "@/shared/errors";

import { CreateTeam, UpdateTeam } from "./teams";

const baseCreate = {
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
};

describe("CreateTeam", () => {
  const access = { requireAdmin: vi.fn() };
  const teams = {
    insert: vi.fn(),
    findAgeGroupClubId: vi.fn(),
  };
  const db = {} as never;

  const useCase = new CreateTeam(db, access as never, teams as never);

  beforeEach(() => {
    vi.clearAllMocks();
    access.requireAdmin.mockResolvedValue(undefined);
    teams.findAgeGroupClubId.mockResolvedValue(12);
    teams.insert.mockImplementation(
      async (_db: unknown, values: Record<string, unknown>) => ({
        id: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        ...values,
      }),
    );
  });

  it("creates a team for an admin", async () => {
    const result = await useCase.execute(12, "user-1", baseCreate);

    expect(access.requireAdmin).toHaveBeenCalledWith(12, "user-1");
    expect(teams.findAgeGroupClubId).toHaveBeenCalledWith(db, 5);
    expect(teams.insert).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        clubId: 12,
        shortName: "E.H",
        seasonal: true,
        genderId: 1,
      }),
    );
    expect(result.shortName).toBe("E.H");
  });

  it("rejects ageGroupId from another club", async () => {
    teams.findAgeGroupClubId.mockResolvedValue(99);
    await expect(useCase.execute(12, "user-1", baseCreate)).rejects.toBeInstanceOf(
      ValidationError,
    );
    expect(teams.insert).not.toHaveBeenCalled();
  });
});

describe("UpdateTeam", () => {
  const access = { requireAdmin: vi.fn() };
  const teams = {
    findByIdForClub: vi.fn(),
    findAgeGroupClubId: vi.fn(),
    update: vi.fn(),
  };
  const db = {} as never;

  const useCase = new UpdateTeam(db, access as never, teams as never);

  beforeEach(() => {
    vi.clearAllMocks();
    access.requireAdmin.mockResolvedValue(undefined);
    teams.findByIdForClub.mockResolvedValue({
      id: 1,
      clubId: 12,
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
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    teams.update.mockImplementation(
      async (
        _db: unknown,
        _clubId: number,
        _id: number,
        patch: Record<string, unknown>,
      ) => ({
        id: 1,
        clubId: 12,
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
});
