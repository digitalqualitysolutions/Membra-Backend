import { z } from "@/shared/validation/zod";

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, "must be HH:MM or HH:MM:SS")
  .openapi({ example: "17:00" });

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD")
  .openapi({ example: "2026-05-01" });

function refineScheduleBounds(
  value: {
    startDate?: string | null;
    endDate?: string | null;
    locationId?: number | null;
    locationGroupId?: number | null;
  },
  ctx: z.RefinementCtx,
): void {
  if (
    value.startDate != null &&
    value.endDate != null &&
    value.endDate < value.startDate
  ) {
    ctx.addIssue({
      code: "custom",
      message: "endDate must be on or after startDate",
      path: ["endDate"],
    });
  }
  if (value.locationId != null && value.locationGroupId != null) {
    ctx.addIssue({
      code: "custom",
      message: "Provide either locationId or locationGroupId, not both",
      path: ["locationGroupId"],
    });
  }
}

export const CreateScheduleSchema = z
  .object({
    teamSeasonId: z.number().int().positive().openapi({ example: 1 }),
    startTime: timeSchema,
    rrule: z
      .string()
      .trim()
      .min(1)
      .max(255)
      .openapi({ example: "FREQ=WEEKLY;BYDAY=TU" }),
    durationMinutes: z
      .number()
      .int()
      .positive()
      .openapi({ example: 90, description: "Duration in minutes" }),
    startDate: isoDateSchema.nullable().optional(),
    endDate: isoDateSchema.nullable().optional(),
    locationId: z.number().int().positive().nullable().optional(),
    locationGroupId: z.number().int().positive().nullable().optional(),
    active: z.boolean().optional().default(true).openapi({ example: true }),
  })
  .superRefine(refineScheduleBounds)
  .openapi("CreateScheduleRequest");

export const UpdateScheduleSchema = z
  .object({
    startTime: timeSchema.optional(),
    rrule: z.string().trim().min(1).max(255).optional(),
    durationMinutes: z.number().int().positive().optional(),
    startDate: isoDateSchema.nullable().optional(),
    endDate: isoDateSchema.nullable().optional(),
    locationId: z.number().int().positive().nullable().optional(),
    locationGroupId: z.number().int().positive().nullable().optional(),
    active: z.boolean().optional(),
  })
  .superRefine(refineScheduleBounds)
  .openapi("UpdateScheduleRequest");

export const ScheduleResponseSchema = z
  .object({
    id: z.number().int(),
    teamSeasonId: z.number().int(),
    startTime: z.string(),
    rrule: z.string(),
    durationMinutes: z.number().int(),
    startDate: z.string().nullable(),
    endDate: z.string().nullable(),
    locationId: z.number().int().nullable(),
    locationGroupId: z.number().int().nullable(),
    active: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi("ScheduleResponse");

export const SchedulesListResponseSchema = z
  .object({
    schedules: z.array(ScheduleResponseSchema),
  })
  .openapi("SchedulesListResponse");

export const ClubScheduleIdParamSchema = z
  .object({
    clubId: z.coerce.number().int().positive(),
    scheduleId: z.coerce.number().int().positive(),
  })
  .openapi("ClubScheduleIdParam");

export type CreateScheduleInput = z.infer<typeof CreateScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof UpdateScheduleSchema>;
