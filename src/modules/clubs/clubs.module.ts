import { Module } from "@nestjs/common";

import { AuthModule } from "@/modules/auth/auth.module";

import { ClubsController } from "./controllers/clubs.controller";
import { SchedulesController } from "./controllers/schedules.controller";
import { SeasonsController } from "./controllers/seasons.controller";
import { TeamSeasonsController } from "./controllers/team-seasons.controller";
import { TeamsController } from "./controllers/teams.controller";
import { ClubAccess } from "./lib/club-access";
import { CatalogRepository } from "./repositories/catalog.repository";
import { ClubAddressesRepository } from "./repositories/club-addresses.repository";
import { ClubAvatarsRepository } from "./repositories/club-avatars.repository";
import { ClubsRepository } from "./repositories/clubs.repository";
import { LocationsRepository } from "./repositories/locations.repository";
import { SchedulesRepository } from "./repositories/schedules.repository";
import { SeasonsRepository } from "./repositories/seasons.repository";
import { TeamSeasonsRepository } from "./repositories/team-seasons.repository";
import { TeamsRepository } from "./repositories/teams.repository";
import {
  AddClubAddress,
  ListClubAddresses,
  MakeClubAddressPrimary,
  UpdateClubAddress,
} from "./use-cases/club-addresses";
import { GetClubAvatars, UpdateClubAvatars } from "./use-cases/club-avatars";
import { ClubDetailAssembler, CreateClub } from "./use-cases/create-club";
import { GetClub } from "./use-cases/get-club";
import { ListAdminClubs } from "./use-cases/list-admin-clubs";
import { ListLanguages } from "./use-cases/list-catalogs";
import {
  CreateLocation,
  DeleteLocation,
  GetLocation,
  ListLocations,
  UpdateLocation,
} from "./use-cases/locations";
import {
  CreateSeason,
  GetSeason,
  ListSeasons,
  UpdateSeason,
} from "./use-cases/seasons";
import {
  CreateTeam,
  GetTeam,
  ListTeams,
  UpdateTeam,
} from "./use-cases/teams";
import {
  CreateSchedule,
  ListSchedules,
  UpdateSchedule,
} from "./use-cases/schedules";
import {
  CreateTeamSeason,
  ListTeamSeasons,
  UpdateTeamSeason,
} from "./use-cases/team-seasons";
import { UpdateClub } from "./use-cases/update-club";

@Module({
  imports: [AuthModule],
  controllers: [
    ClubsController,
    SeasonsController,
    TeamsController,
    TeamSeasonsController,
    SchedulesController,
  ],
  providers: [
    ClubsRepository,
    ClubAddressesRepository,
    ClubAvatarsRepository,
    LocationsRepository,
    SeasonsRepository,
    TeamsRepository,
    TeamSeasonsRepository,
    SchedulesRepository,
    CatalogRepository,
    ClubAccess,
    ClubDetailAssembler,
    CreateClub,
    ListAdminClubs,
    GetClub,
    UpdateClub,
    AddClubAddress,
    UpdateClubAddress,
    MakeClubAddressPrimary,
    ListClubAddresses,
    UpdateClubAvatars,
    GetClubAvatars,
    ListLanguages,
    CreateLocation,
    UpdateLocation,
    GetLocation,
    ListLocations,
    DeleteLocation,
    CreateSeason,
    UpdateSeason,
    GetSeason,
    ListSeasons,
    CreateTeam,
    UpdateTeam,
    GetTeam,
    ListTeams,
    CreateTeamSeason,
    UpdateTeamSeason,
    ListTeamSeasons,
    CreateSchedule,
    UpdateSchedule,
    ListSchedules,
  ],
})
export class ClubsModule {}
