import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import { standardErrorResponses } from "@/docs/openapi";
import { z } from "@/shared/validation/zod";

import {
  CreateTeamSchema,
  TeamResponseSchema,
  TeamsListResponseSchema,
  UpdateTeamSchema,
} from "../schemas/teams.schema";

const CLUB_TEAMS_TAG = "Club Teams";

export function registerTeamsDocs(registry: OpenAPIRegistry): void {
  registry.register("CreateTeamRequest", CreateTeamSchema);
  registry.register("UpdateTeamRequest", UpdateTeamSchema);
  registry.register("TeamResponse", TeamResponseSchema);
  registry.register("TeamsListResponse", TeamsListResponseSchema);

  registry.registerPath({
    method: "get",
    path: "/api/clubs/{clubId}/teams",
    tags: [CLUB_TEAMS_TAG],
    summary: "List club teams",
    description:
      "Returns teams for the club ordered by id. Member/admin only.",
    security: [{ SessionCookie: [] }],
    request: {
      params: z.object({
        clubId: z.coerce.number().int().positive(),
      }),
    },
    responses: {
      200: {
        description: "Teams list",
        content: {
          "application/json": { schema: TeamsListResponseSchema },
        },
      },
      ...standardErrorResponses([401, 404, 500]),
    },
  });

  registry.registerPath({
    method: "post",
    path: "/api/clubs/{clubId}/teams",
    tags: [CLUB_TEAMS_TAG],
    summary: "Create club team",
    description:
      "Creates a team. If ageGroupId is set, it must belong to this club. Admin only.",
    security: [{ SessionCookie: [] }],
    request: {
      params: z.object({
        clubId: z.coerce.number().int().positive(),
      }),
      body: {
        required: true,
        content: { "application/json": { schema: CreateTeamSchema } },
      },
    },
    responses: {
      201: {
        description: "Team created",
        content: {
          "application/json": { schema: TeamResponseSchema },
        },
      },
      ...standardErrorResponses([400, 401, 403, 404, 500]),
    },
  });

  registry.registerPath({
    method: "get",
    path: "/api/clubs/{clubId}/teams/{teamId}",
    tags: [CLUB_TEAMS_TAG],
    summary: "Get club team",
    security: [{ SessionCookie: [] }],
    request: {
      params: z.object({
        clubId: z.coerce.number().int().positive(),
        teamId: z.coerce.number().int().positive(),
      }),
    },
    responses: {
      200: {
        description: "Team detail",
        content: {
          "application/json": { schema: TeamResponseSchema },
        },
      },
      ...standardErrorResponses([401, 404, 500]),
    },
  });

  registry.registerPath({
    method: "patch",
    path: "/api/clubs/{clubId}/teams/{teamId}",
    tags: [CLUB_TEAMS_TAG],
    summary: "Update club team",
    description:
      "Updates a team. Soft-off via active. Admin only.",
    security: [{ SessionCookie: [] }],
    request: {
      params: z.object({
        clubId: z.coerce.number().int().positive(),
        teamId: z.coerce.number().int().positive(),
      }),
      body: {
        required: true,
        content: { "application/json": { schema: UpdateTeamSchema } },
      },
    },
    responses: {
      200: {
        description: "Team updated",
        content: {
          "application/json": { schema: TeamResponseSchema },
        },
      },
      ...standardErrorResponses([400, 401, 403, 404, 500]),
    },
  });
}
