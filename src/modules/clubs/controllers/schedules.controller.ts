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
  ClubScheduleIdParamSchema,
  CreateScheduleSchema,
  UpdateScheduleSchema,
  type CreateScheduleInput,
  type UpdateScheduleInput,
} from "../schemas/schedules.schema";
import {
  CreateSchedule,
  ListSchedules,
  UpdateSchedule,
} from "../use-cases/schedules";

@Controller("clubs")
@UseGuards(SessionAuthGuard)
export class SchedulesController {
  constructor(
    @Inject(CreateSchedule)
    private readonly createSchedule: CreateSchedule,
    @Inject(UpdateSchedule)
    private readonly updateSchedule: UpdateSchedule,
    @Inject(ListSchedules)
    private readonly listSchedules: ListSchedules,
  ) {}

  @Get(":clubId/schedules")
  async list(
    @AuthSession() session: AuthSessionContext,
    @Param(new ZodValidationPipe(ClubIdParamSchema))
    params: { clubId: number },
  ) {
    return this.listSchedules.execute(params.clubId, session.userId);
  }

  @Post(":clubId/schedules")
  @HttpCode(201)
  async create(
    @AuthSession() session: AuthSessionContext,
    @Param(new ZodValidationPipe(ClubIdParamSchema))
    params: { clubId: number },
    @Body(new ZodValidationPipe(CreateScheduleSchema))
    body: CreateScheduleInput,
  ) {
    return this.createSchedule.execute(params.clubId, session.userId, body);
  }

  @Patch(":clubId/schedules/:scheduleId")
  async patch(
    @AuthSession() session: AuthSessionContext,
    @Param(new ZodValidationPipe(ClubScheduleIdParamSchema))
    params: { clubId: number; scheduleId: number },
    @Body(new ZodValidationPipe(UpdateScheduleSchema))
    body: UpdateScheduleInput,
  ) {
    return this.updateSchedule.execute(
      params.clubId,
      params.scheduleId,
      session.userId,
      body,
    );
  }
}
