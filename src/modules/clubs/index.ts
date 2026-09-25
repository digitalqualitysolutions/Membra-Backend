export { ClubsController } from "./controllers/clubs.controller";
export { SchedulesController } from "./controllers/schedules.controller";
export { SeasonsController } from "./controllers/seasons.controller";
export { TeamsController } from "./controllers/teams.controller";
export { TeamSeasonsController } from "./controllers/team-seasons.controller";
export { registerClubsDocs } from "./docs/paths";
export { registerSchedulesDocs } from "./docs/schedules-paths";
export { registerSeasonsDocs } from "./docs/seasons-paths";
export { registerTeamsDocs } from "./docs/teams-paths";
export { registerTeamSeasonsDocs } from "./docs/team-seasons-paths";
export {
  CreateClubSchema,
  UpdateClubSchema,
  ClubAddressBodySchema,
} from "./schemas/clubs.schema";
