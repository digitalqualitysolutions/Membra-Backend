import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import { standardErrorResponses } from "@/docs/openapi";
import { z } from "@/shared/validation/zod";

import {
  CreateTeamSeasonSchema,
  TeamSeasonResponseSchema,
  TeamSeasonsListResponseSchema,
  UpdateTeamSeasonSchema,
} from "../schemas/team-seasons.schema";

const CLUB_TEAM_SEASONS_TAG = "Club Team Seasons";

export function registerTeamSeasonsDocs(registry: OpenAPIRegistry): void {
  registry.register("CreateTeamSeasonRequest", CreateTeamSeasonSchema);
  registry.register("UpdateTeamSeasonRequest", UpdateTeamSeasonSchema);
  registry.register("TeamSeasonResponse", TeamSeasonResponseSchema);
  registry.register("TeamSeasonsListResponse", TeamSeasonsListResponseSchema);

  registry.registerPath({
    method: "get",
    path: "/api/clubs/{clubId}/team-seasons",
    tags: [CLUB_TEAM_SEASONS_TAG],
    summary: "List team–season assignments",
    description:
      "Returns team–season links for the club (team and season both belong to the club). Member/admin only.",
    security: [{ SessionCookie: [] }],
    request: {
      params: z.object({
        clubId: z.coerce.number().int().positive(),
      }),
    },
    responses: {
      200: {
        description: "Team–season list",
        content: {
          "application/json": { schema: TeamSeasonsListResponseSchema },
        },
      },
      ...standardErrorResponses([401, 404, 500]),
    },
  });

  registry.registerPath({
    method: "post",
    path: "/api/clubs/{clubId}/team-seasons",
    tags: [CLUB_TEAM_SEASONS_TAG],
    summary: "Assign a team to a season",
    description:
      "Creates a team–season link. teamId and seasonId must belong to this club. Unique per (teamId, seasonId). Admin only.",
    security: [{ SessionCookie: [] }],
    request: {
      params: z.object({
        clubId: z.coerce.number().int().positive(),
      }),
      body: {
        required: true,
        content: { "application/json": { schema: CreateTeamSeasonSchema } },
      },
    },
    responses: {
      201: {
        description: "Assignment created",
        content: {
          "application/json": { schema: TeamSeasonResponseSchema },
        },
      },
      ...standardErrorResponses([400, 401, 403, 404, 409, 500]),
    },
  });

  registry.registerPath({
    method: "patch",
    path: "/api/clubs/{clubId}/team-seasons/{teamSeasonId}",
    tags: [CLUB_TEAM_SEASONS_TAG],
    summary: "Update a team–season assignment",
    description:
      "Updates minSignup, maxSignup, and/or active (soft-off). Admin only.",
    security: [{ SessionCookie: [] }],
    request: {
      params: z.object({
        clubId: z.coerce.number().int().positive(),
        teamSeasonId: z.coerce.number().int().positive(),
      }),
      body: {
        required: true,
        content: { "application/json": { schema: UpdateTeamSeasonSchema } },
      },
    },
    responses: {
      200: {
        description: "Assignment updated",
        content: {
          "application/json": { schema: TeamSeasonResponseSchema },
        },
      },
      ...standardErrorResponses([400, 401, 403, 404, 500]),
    },
  });
}
