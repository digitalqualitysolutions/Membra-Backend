import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";

import { ZodValidationPipe } from "@/shared/validation/zod-pipe";

import { AuthSession, SessionAuthGuard } from "@/modules/auth";
import type { AuthSessionContext } from "@/modules/auth";

import { ClubIdParamSchema } from "../schemas/clubs.schema";
import {
  ClubTeamIdParamSchema,
  CreateTeamSchema,
  UpdateTeamSchema,
  type CreateTeamInput,
  type UpdateTeamInput,
} from "../schemas/teams.schema";
import {
  CreateTeam,
  GetTeam,
  ListTeams,
  UpdateTeam,
} from "../use-cases/teams";

@Controller("clubs")
@UseGuards(SessionAuthGuard)
export class TeamsController {
  constructor(
    @Inject(CreateTeam) private readonly createTeam: CreateTeam,
    @Inject(UpdateTeam) private readonly updateTeam: UpdateTeam,
    @Inject(GetTeam) private readonly getTeam: GetTeam,
    @Inject(ListTeams) private readonly listTeams: ListTeams,
  ) {}

  @Get(":clubId/teams")
  async list(
    @AuthSession() session: AuthSessionContext,
    @Param(new ZodValidationPipe(ClubIdParamSchema))
    params: { clubId: number },
  ) {
    return this.listTeams.execute(params.clubId, session.userId);
  }

  @Post(":clubId/teams")
  @HttpCode(201)
  async create(
    @AuthSession() session: AuthSessionContext,
    @Param(new ZodValidationPipe(ClubIdParamSchema))
    params: { clubId: number },
    @Body(new ZodValidationPipe(CreateTeamSchema))
    body: CreateTeamInput,
  ) {
    return this.createTeam.execute(params.clubId, session.userId, body);
  }

  @Get(":clubId/teams/:teamId")
  async get(
    @AuthSession() session: AuthSessionContext,
    @Param(new ZodValidationPipe(ClubTeamIdParamSchema))
    params: { clubId: number; teamId: number },
  ) {
    return this.getTeam.execute(params.clubId, params.teamId, session.userId);
  }

  @Patch(":clubId/teams/:teamId")
  async patch(
    @AuthSession() session: AuthSessionContext,
    @Param(new ZodValidationPipe(ClubTeamIdParamSchema))
    params: { clubId: number; teamId: number },
    @Body(new ZodValidationPipe(UpdateTeamSchema))
    body: UpdateTeamInput,
  ) {
    return this.updateTeam.execute(
      params.clubId,
      params.teamId,
      session.userId,
      body,
    );
  }
}
