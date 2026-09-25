import { beforeEach, describe, expect, it, vi } from "vitest";

import { NotFoundError, ValidationError } from "@/shared/errors";

import { CreateSchedule, UpdateSchedule } from "./schedules";

const baseCreate = {
  teamSeasonId: 1,
  startTime: "17:00",
  rrule: "FREQ=WEEKLY;BYDAY=TU",
  durationMinutes: 90,
  startDate: "2026-05-01",
  endDate: "2026-12-01",
  locationId: null,
  locationGroupId: null,
  active: true,
};

describe("CreateSchedule", () => {
  const access = { requireAdmin: vi.fn() };
  const schedules = {
    insert: vi.fn(),
    findTeamSeasonClubId: vi.fn(),
    findLocationClubId: vi.fn(),
    findLocationGroupClubId: vi.fn(),
  };
  const db = {} as never;

  const useCase = new CreateSchedule(db, access as never, schedules as never);

  beforeEach(() => {
    vi.clearAllMocks();
    access.requireAdmin.mockResolvedValue(undefined);
    schedules.findTeamSeasonClubId.mockResolvedValue(12);
    schedules.insert.mockImplementation(
      async (_db: unknown, values: Record<string, unknown>) => ({
        id: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        ...values,
      }),
    );
  });

  it("creates a schedule for an admin", async () => {
    const result = await useCase.execute(12, "user-1", baseCreate);

    expect(access.requireAdmin).toHaveBeenCalledWith(12, "user-1");
    expect(schedules.insert).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        teamSeasonId: 1,
        startTime: "17:00",
        durationMinutes: 90,
        active: true,
      }),
    );
    expect(result.rrule).toBe("FREQ=WEEKLY;BYDAY=TU");
  });

  it("rejects team–season from another club", async () => {
    schedules.findTeamSeasonClubId.mockResolvedValue(99);
    await expect(
      useCase.execute(12, "user-1", baseCreate),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(schedules.insert).not.toHaveBeenCalled();
  });

  it("rejects both location refs", async () => {
    await expect(
      useCase.execute(12, "user-1", {
        ...baseCreate,
        locationId: 1,
        locationGroupId: 2,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(schedules.insert).not.toHaveBeenCalled();
  });

  it("rejects location from another club", async () => {
    schedules.findLocationClubId.mockResolvedValue(99);
    await expect(
      useCase.execute(12, "user-1", {
        ...baseCreate,
        locationId: 5,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(schedules.insert).not.toHaveBeenCalled();
  });
});

describe("UpdateSchedule", () => {
  const access = { requireAdmin: vi.fn() };
  const schedules = {
    findByIdForClub: vi.fn(),
    update: vi.fn(),
    findLocationClubId: vi.fn(),
    findLocationGroupClubId: vi.fn(),
  };
  const db = {} as never;

  const useCase = new UpdateSchedule(db, access as never, schedules as never);

  beforeEach(() => {
    vi.clearAllMocks();
    access.requireAdmin.mockResolvedValue(undefined);
    schedules.findByIdForClub.mockResolvedValue({
      id: 1,
      teamSeasonId: 1,
      startTime: "17:00:00",
      rrule: "FREQ=WEEKLY;BYDAY=TU",
      durationMinutes: 90,
      startDate: "2026-05-01",
      endDate: "2026-12-01",
      locationId: null,
      locationGroupId: null,
      active: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    schedules.update.mockImplementation(
      async (
        _db: unknown,
        _id: number,
        patch: Record<string, unknown>,
      ) => ({
        id: 1,
        teamSeasonId: 1,
        startTime: "17:00:00",
        rrule: "FREQ=WEEKLY;BYDAY=TU",
        durationMinutes: 90,
        startDate: "2026-05-01",
        endDate: "2026-12-01",
        locationId: null,
        locationGroupId: null,
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

  it("rejects endDate before startDate", async () => {
    await expect(
      useCase.execute(12, 1, "user-1", { endDate: "2026-01-01" }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(schedules.update).not.toHaveBeenCalled();
  });

  it("returns not found when schedule missing", async () => {
    schedules.findByIdForClub.mockResolvedValue(null);
    await expect(
      useCase.execute(12, 1, "user-1", { active: false }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
