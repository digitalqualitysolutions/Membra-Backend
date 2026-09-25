import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import { standardErrorResponses } from "@/docs/openapi";
import { z } from "@/shared/validation/zod";

import {
  CreateScheduleSchema,
  ScheduleResponseSchema,
  SchedulesListResponseSchema,
  UpdateScheduleSchema,
} from "../schemas/schedules.schema";

const CLUB_SCHEDULES_TAG = "Club Schedules";

export function registerSchedulesDocs(registry: OpenAPIRegistry): void {
  registry.register("CreateScheduleRequest", CreateScheduleSchema);
  registry.register("UpdateScheduleRequest", UpdateScheduleSchema);
  registry.register("ScheduleResponse", ScheduleResponseSchema);
  registry.register("SchedulesListResponse", SchedulesListResponseSchema);

  registry.registerPath({
    method: "get",
    path: "/api/clubs/{clubId}/schedules",
    tags: [CLUB_SCHEDULES_TAG],
    summary: "List club schedules",
    description:
      "Returns schedules whose team–season’s team belongs to the club. Member/admin only.",
    security: [{ SessionCookie: [] }],
    request: {
      params: z.object({
        clubId: z.coerce.number().int().positive(),
      }),
    },
    responses: {
      200: {
        description: "Schedule list",
        content: {
          "application/json": { schema: SchedulesListResponseSchema },
        },
      },
      ...standardErrorResponses([401, 404, 500]),
    },
  });

  registry.registerPath({
    method: "post",
    path: "/api/clubs/{clubId}/schedules",
    tags: [CLUB_SCHEDULES_TAG],
    summary: "Create a schedule",
    description:
      "Creates a recurring schedule for a team–season. teamSeasonId must belong to this club; locationId and locationGroupId are mutually exclusive and must belong to the club when set. Admin only.",
    security: [{ SessionCookie: [] }],
    request: {
      params: z.object({
        clubId: z.coerce.number().int().positive(),
      }),
      body: {
        required: true,
        content: { "application/json": { schema: CreateScheduleSchema } },
      },
    },
    responses: {
      201: {
        description: "Schedule created",
        content: {
          "application/json": { schema: ScheduleResponseSchema },
        },
      },
      ...standardErrorResponses([400, 401, 403, 404, 500]),
    },
  });

  registry.registerPath({
    method: "patch",
    path: "/api/clubs/{clubId}/schedules/{scheduleId}",
    tags: [CLUB_SCHEDULES_TAG],
    summary: "Update a schedule",
    description:
      "Partial update of start time, rrule, duration, dates, location refs, and/or active (soft-off). Admin only.",
    security: [{ SessionCookie: [] }],
    request: {
      params: z.object({
        clubId: z.coerce.number().int().positive(),
        scheduleId: z.coerce.number().int().positive(),
      }),
      body: {
        required: true,
        content: { "application/json": { schema: UpdateScheduleSchema } },
      },
    },
    responses: {
      200: {
        description: "Schedule updated",
        content: {
          "application/json": { schema: ScheduleResponseSchema },
        },
      },
      ...standardErrorResponses([400, 401, 403, 404, 500]),
    },
  });
}
