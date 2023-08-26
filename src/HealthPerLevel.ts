import { DependencyContainer } from "@spt-aki/models/external/tsyringe";
import { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { StaticRouterModService } from "@spt-aki/services/mod/staticRouter/StaticRouterModService";
import { ProfileHelper } from "@spt-aki/helpers/ProfileHelper";
import {
  BodyPartsSettings,
  Effects,
} from "@spt-aki/models/eft/common/IGlobals";
import { BodyPartsHealth } from "@spt-aki/models/eft/common/tables/IBotBase";
import { VFS } from "@spt-aki/utils/VFS";
import { JsonUtil } from "@spt-aki/utils/JsonUtil";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { LogTextColor } from "@spt-aki/models/spt/logging/LogTextColor";
import { LogBackgroundColor } from "@spt-aki/models/spt/logging/LogBackgroundColor";
import https from "https";

class HealthPerLevel implements IPreAkiLoadMod, IPostDBLoadMod {
  private multiplierPmc: number = 12; //Amount of health per bodypart on level up for pmc's
  private multiplierScav: number = 20; //Amount of health per bodypart on level up for scav's

  private GlobalBodyParts: BodyPartsSettings;
  private PMCBodyParts: BodyPartsHealth;
  private SCAVBodyParts: BodyPartsHealth;
  private PMCLevel: number;
  private SCAVLevel: number;
  private logger: ILogger;

  postDBLoad(container: DependencyContainer): void {
    const dbServer = container
      .resolve<DatabaseServer>("DatabaseServer")
      .getTables().globals;
    this.GlobalBodyParts =
      dbServer.config.Health.ProfileHealthSettings.BodyPartsSettings;
  }

  preAkiLoad(container: DependencyContainer): void {
    const staticRMS = container.resolve<StaticRouterModService>(
      "StaticRouterModService"
    );
    const pHelp = container.resolve<ProfileHelper>("ProfileHelper");
    this.logger = container.resolve<ILogger>("WinstonLogger");
    staticRMS.registerStaticRouter(
      "HealthPerLevel",
      [
        {
          url: "/client/game/start",
          action: (url: any, info: any, sessionID: any, output: any) => {
            try {
              this.PMCBodyParts =
                pHelp.getPmcProfile(sessionID).Health.BodyParts;
              this.PMCLevel = pHelp.getPmcProfile(sessionID).Info.Level;

              this.SCAVBodyParts =
                pHelp.getScavProfile(sessionID).Health.BodyParts;
              this.SCAVLevel = pHelp.getScavProfile(sessionID).Info.Level;

              this.calcPMCHealth(this.PMCBodyParts, this.PMCLevel);
              this.calcSCAVHealth(this.SCAVBodyParts, this.SCAVLevel);
            } catch (error) {
              this.logger.error(error.message);
            }
            return output;
          },
        },
        {
          url: "/client/items",
          action: (url: any, info: any, sessionID: any, output: any) => {
            try {
              this.PMCBodyParts =
                pHelp.getPmcProfile(sessionID).Health.BodyParts;
              this.PMCLevel = pHelp.getPmcProfile(sessionID).Info.Level;

              this.SCAVBodyParts =
                pHelp.getScavProfile(sessionID).Health.BodyParts;
              this.SCAVLevel = pHelp.getScavProfile(sessionID).Info.Level;

              this.calcPMCHealth(this.PMCBodyParts, this.PMCLevel);
              this.calcSCAVHealth(this.SCAVBodyParts, this.SCAVLevel);
            } catch (error) {
              this.logger.error(error.message);
            }
            return output;
          },
        },
      ],
      "aki"
    );
  }

  private calcPMCHealth(bodyPart: BodyPartsHealth, accountLevel: number) {
    for (let eachPart in bodyPart) {
      bodyPart[eachPart].Health.Maximum =
        this.GlobalBodyParts[eachPart].Default +
        (accountLevel - 1) * this.multiplierPmc;
    }
  }

  private calcSCAVHealth(bodyPart: BodyPartsHealth, accountLevel: number) {
    for (let eachPart in bodyPart) {
      bodyPart[eachPart].Health.Maximum =
        this.GlobalBodyParts[eachPart].Default +
        (accountLevel - 1) * this.multiplierScav;
      bodyPart[eachPart].Health.Current =
        this.GlobalBodyParts[eachPart].Default +
        (accountLevel - 1) * this.multiplierScav;
    }
  }
}
module.exports = { mod: new HealthPerLevel() };
