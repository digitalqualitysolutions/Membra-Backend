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
  ClubTeamSeasonIdParamSchema,
  CreateTeamSeasonSchema,
  UpdateTeamSeasonSchema,
  type CreateTeamSeasonInput,
  type UpdateTeamSeasonInput,
} from "../schemas/team-seasons.schema";
import {
  CreateTeamSeason,
  ListTeamSeasons,
  UpdateTeamSeason,
} from "../use-cases/team-seasons";

@Controller("clubs")
@UseGuards(SessionAuthGuard)
export class TeamSeasonsController {
  constructor(
    @Inject(CreateTeamSeason)
    private readonly createTeamSeason: CreateTeamSeason,
    @Inject(UpdateTeamSeason)
    private readonly updateTeamSeason: UpdateTeamSeason,
    @Inject(ListTeamSeasons)
    private readonly listTeamSeasons: ListTeamSeasons,
  ) {}

  @Get(":clubId/team-seasons")
  async list(
    @AuthSession() session: AuthSessionContext,
    @Param(new ZodValidationPipe(ClubIdParamSchema))
    params: { clubId: number },
  ) {
    return this.listTeamSeasons.execute(params.clubId, session.userId);
  }

  @Post(":clubId/team-seasons")
  @HttpCode(201)
  async create(
    @AuthSession() session: AuthSessionContext,
    @Param(new ZodValidationPipe(ClubIdParamSchema))
    params: { clubId: number },
    @Body(new ZodValidationPipe(CreateTeamSeasonSchema))
    body: CreateTeamSeasonInput,
  ) {
    return this.createTeamSeason.execute(params.clubId, session.userId, body);
  }

  @Patch(":clubId/team-seasons/:teamSeasonId")
  async patch(
    @AuthSession() session: AuthSessionContext,
    @Param(new ZodValidationPipe(ClubTeamSeasonIdParamSchema))
    params: { clubId: number; teamSeasonId: number },
    @Body(new ZodValidationPipe(UpdateTeamSeasonSchema))
    body: UpdateTeamSeasonInput,
  ) {
    return this.updateTeamSeason.execute(
      params.clubId,
      params.teamSeasonId,
      session.userId,
      body,
    );
  }
}
