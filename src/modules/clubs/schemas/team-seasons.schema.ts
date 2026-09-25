import { z } from "@/shared/validation/zod";

function refineSignupRange(
  value: { minSignup?: number | null; maxSignup?: number | null },
  ctx: z.RefinementCtx,
): void {
  if (
    value.minSignup != null &&
    value.maxSignup != null &&
    value.maxSignup < value.minSignup
  ) {
    ctx.addIssue({
      code: "custom",
      message: "maxSignup must be greater than or equal to minSignup",
      path: ["maxSignup"],
    });
  }
}

export const CreateTeamSeasonSchema = z
  .object({
    teamId: z.number().int().positive().openapi({ example: 1 }),
    seasonId: z.number().int().positive().openapi({ example: 1 }),
    minSignup: z.number().int().positive().nullable().optional(),
    maxSignup: z.number().int().positive().nullable().optional(),
    active: z.boolean().optional().default(true).openapi({ example: true }),
  })
  .superRefine(refineSignupRange)
  .openapi("CreateTeamSeasonRequest");

export const UpdateTeamSeasonSchema = z
  .object({
    minSignup: z.number().int().positive().nullable().optional(),
    maxSignup: z.number().int().positive().nullable().optional(),
    active: z.boolean().optional(),
  })
  .superRefine(refineSignupRange)
  .openapi("UpdateTeamSeasonRequest");

export const TeamSeasonResponseSchema = z
  .object({
    id: z.number().int(),
    teamId: z.number().int(),
    seasonId: z.number().int(),
    minSignup: z.number().int().nullable(),
    maxSignup: z.number().int().nullable(),
    active: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi("TeamSeasonResponse");

export const TeamSeasonsListResponseSchema = z
  .object({
    teamSeasons: z.array(TeamSeasonResponseSchema),
  })
  .openapi("TeamSeasonsListResponse");

export const ClubTeamSeasonIdParamSchema = z
  .object({
    clubId: z.coerce.number().int().positive(),
    teamSeasonId: z.coerce.number().int().positive(),
  })
  .openapi("ClubTeamSeasonIdParam");

export type CreateTeamSeasonInput = z.infer<typeof CreateTeamSeasonSchema>;
export type UpdateTeamSeasonInput = z.infer<typeof UpdateTeamSeasonSchema>;
