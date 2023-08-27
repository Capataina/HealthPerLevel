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
  private Parts: { [key: string] : number; } = {
    "Chest" : 2,
    "Head" : 2,
    "LeftArm" : 3,
    "LeftLeg" : 3,
    "RightArm" : 3,
    "RightLeg" : 3,
    "Stomach" : 2
  };

  private RealismPlus: { [key:string] : number; } = {
    "Chest" : 110,
    "Head" : 30,
    "LeftArm" : 50,
    "LeftLeg" : 70,
    "RightArm" : 50,
    "RightLeg" : 70,
    "Stomach" : 90,
  };
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

              this.calcPMCHealth(this.PMCBodyParts, this.PMCLevel, this.RealismPlus);
              this.calcSCAVHealth(this.SCAVBodyParts, this.SCAVLevel, this.RealismPlus);
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

              this.calcPMCHealth(this.PMCBodyParts, this.PMCLevel, this.RealismPlus);
              this.calcSCAVHealth(this.SCAVBodyParts, this.SCAVLevel, this.RealismPlus);
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

  private calcPMCHealth(bodyPart: BodyPartsHealth, accountLevel: number, preset) {
    for (let key in this.Parts) {
      bodyPart[key].Health.Maximum =
        preset[key] + (accountLevel - 1) * this.Parts[key];
    }
  }

  private calcSCAVHealth(bodyPart: BodyPartsHealth, accountLevel: number, preset) {
    for (let key in this.Parts) {
      bodyPart[key].Health.Maximum =
        preset[key] + (accountLevel - 1) * this.Parts[key];
    }
    for (let key in this.Parts) {
      bodyPart[key].Health.Current =
        preset[key] + (accountLevel - 1) * this.Parts[key];
    }
  }
}

module.exports = { mod: new HealthPerLevel() };
