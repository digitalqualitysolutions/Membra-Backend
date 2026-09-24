import { z } from "@/shared/validation/zod";

export const CreateTeamSchema = z
  .object({
    name: z.string().trim().min(1).max(60).openapi({ example: "Elite Herre" }),
    shortName: z.string().trim().min(1).max(10).openapi({ example: "E.H" }),
    seasonal: z.boolean().optional().default(true).openapi({ example: true }),
    hasWaitlistMembers: z
      .boolean()
      .optional()
      .default(false)
      .openapi({ example: false }),
    hasWaitlistPublic: z
      .boolean()
      .optional()
      .default(false)
      .openapi({ example: false }),
    onlyTeamMembers: z
      .boolean()
      .optional()
      .default(true)
      .openapi({ example: true }),
    areEventsPublic: z
      .boolean()
      .optional()
      .default(false)
      .openapi({ example: false }),
    genderId: z.number().int().positive().nullable().optional(),
    ageGroupId: z.number().int().positive().nullable().optional(),
    rankGroupId: z.number().int().positive().nullable().optional(),
    teamRankInGroup: z.number().int().positive().nullable().optional(),
    rankPublic: z.boolean().nullable().optional(),
    colorId: z.number().int().positive().nullable().optional(),
    textWhite: z.boolean().nullable().optional(),
    active: z.boolean().optional().default(true).openapi({ example: true }),
  })
  .openapi("CreateTeamRequest");

export const UpdateTeamSchema = z
  .object({
    name: z.string().trim().min(1).max(60).optional(),
    shortName: z.string().trim().min(1).max(10).optional(),
    seasonal: z.boolean().optional(),
    hasWaitlistMembers: z.boolean().optional(),
    hasWaitlistPublic: z.boolean().optional(),
    onlyTeamMembers: z.boolean().optional(),
    areEventsPublic: z.boolean().optional(),
    genderId: z.number().int().positive().nullable().optional(),
    ageGroupId: z.number().int().positive().nullable().optional(),
    rankGroupId: z.number().int().positive().nullable().optional(),
    teamRankInGroup: z.number().int().positive().nullable().optional(),
    rankPublic: z.boolean().nullable().optional(),
    colorId: z.number().int().positive().nullable().optional(),
    textWhite: z.boolean().nullable().optional(),
    active: z.boolean().optional(),
  })
  .openapi("UpdateTeamRequest");

export const TeamResponseSchema = z
  .object({
    id: z.number().int(),
    clubId: z.number().int(),
    name: z.string(),
    shortName: z.string(),
    seasonal: z.boolean(),
    hasWaitlistMembers: z.boolean(),
    hasWaitlistPublic: z.boolean(),
    onlyTeamMembers: z.boolean(),
    areEventsPublic: z.boolean(),
    genderId: z.number().int().nullable(),
    ageGroupId: z.number().int().nullable(),
    rankGroupId: z.number().int().nullable(),
    teamRankInGroup: z.number().int().nullable(),
    rankPublic: z.boolean().nullable(),
    colorId: z.number().int().nullable(),
    textWhite: z.boolean().nullable(),
    active: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi("TeamResponse");

export const TeamsListResponseSchema = z
  .object({
    teams: z.array(TeamResponseSchema),
  })
  .openapi("TeamsListResponse");

export const ClubTeamIdParamSchema = z
  .object({
    clubId: z.coerce.number().int().positive(),
    teamId: z.coerce.number().int().positive(),
  })
  .openapi("ClubTeamIdParam");

export type CreateTeamInput = z.infer<typeof CreateTeamSchema>;
export type UpdateTeamInput = z.infer<typeof UpdateTeamSchema>;
