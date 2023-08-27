import { DependencyContainer } from "@spt-aki/models/external/tsyringe";
import { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { StaticRouterModService } from "@spt-aki/services/mod/staticRouter/StaticRouterModService";
import { ProfileHelper } from "@spt-aki/helpers/ProfileHelper";
import { BodyPartsSettings } from "@spt-aki/models/eft/common/IGlobals";
import { BodyPartsHealth } from "@spt-aki/models/eft/common/tables/IBotBase";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";

class HealthPerLevel implements IPreAkiLoadMod, IPostDBLoadMod {
  private IncreasePerLevel: { [key: string]: number } = {
    //Change the numbers here to change the increase in health per level.
    Chest: 2,
    Head: 2,
    LeftArm: 3,
    LeftLeg: 3,
    RightArm: 3,
    RightLeg: 3,
    Stomach: 2,
  };

  private BaseHealth: { [key: string]: number } = {
    //Change the numbers here to set the base health per body part.
    Chest: 85,
    Head: 35,
    LeftArm: 60,
    LeftLeg: 65,
    RightArm: 60,
    RightLeg: 65,
    Stomach: 70,
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

              this.calcPMCHealth(
                this.PMCBodyParts,
                this.PMCLevel,
                this.BaseHealth
              );
              this.calcSCAVHealth(
                this.SCAVBodyParts,
                this.SCAVLevel,
                this.BaseHealth
              );
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

              this.calcPMCHealth(
                this.PMCBodyParts,
                this.PMCLevel,
                this.BaseHealth
              );
              this.calcSCAVHealth(
                this.SCAVBodyParts,
                this.SCAVLevel,
                this.BaseHealth
              );
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

  private calcPMCHealth(
    bodyPart: BodyPartsHealth,
    accountLevel: number,
    preset
  ) {
    for (let key in this.IncreasePerLevel) {
      bodyPart[key].Health.Maximum =
        preset[key] + (accountLevel - 1) * this.IncreasePerLevel[key];
    }
  }

  private calcSCAVHealth(
    bodyPart: BodyPartsHealth,
    accountLevel: number,
    preset
  ) {
    for (let key in this.IncreasePerLevel) {
      bodyPart[key].Health.Maximum =
        preset[key] + (accountLevel - 1) * this.IncreasePerLevel[key];
    }
    for (let key in this.IncreasePerLevel) {
      bodyPart[key].Health.Current =
        preset[key] + (accountLevel - 1) * this.IncreasePerLevel[key];
    }
  }
}

module.exports = { mod: new HealthPerLevel() };
