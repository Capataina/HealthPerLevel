// Original mod by @Capataina
// Link to original github : https://github.com/Capataina/HealthPerLevel

import { DependencyContainer } from "@spt-aki/models/external/tsyringe";
import { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { StaticRouterModService } from "@spt-aki/services/mod/staticRouter/StaticRouterModService";
import { ProfileHelper } from "@spt-aki/helpers/ProfileHelper";
import { BodyPartsSettings } from "@spt-aki/models/eft/common/IGlobals";
import { BodyPartsHealth } from "@spt-aki/models/eft/common/tables/IBotBase";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";

class HealthPerSkills implements IPreAkiLoadMod, IPostDBLoadMod {
  private IncreasePerVitalityLevel: { [key: string]: number } = {
    //Change the numbers here to change the increase in health per Vitality skill level.
    Chest: 2,
    Head: 0.7,
    LeftArm: 0,
    LeftLeg: 0,
    RightArm: 0,
    RightLeg: 0,
    Stomach: 1.7,
  };

  private IncreasePerStrengthLevel: { [key: string]: number } = {
    //Change the numbers here to change the increase in health per Strength skill level.
    Chest: 0,
    Head: 0,
    LeftArm: 1,
    LeftLeg: 0,
    RightArm: 1,
    RightLeg: 0,
    Stomach: 0,
  };

  private IncreasePerEnduranceLevel: { [key: string]: number } = {
    //Change the numbers here to change the increase in health per Endurance skill level.
    Chest: 0,
    Head: 0,
    LeftArm: 0,
    LeftLeg: 1,
    RightArm: 0,
    RightLeg: 1,
    Stomach: 0,
  };

  private IncreasePerHealthLevel: { [key: string]: number } = {
    //Change the numbers here to change the increase in health per Health skill level.
    Chest: 0.5,
    Head: 0.1,
    LeftArm: 0.3,
    LeftLeg: 0.4,
    RightArm: 0.3,
    RightLeg: 0.4,
    Stomach: 0.5,
  };

  // With the default settings of the mod, the maximum health achievable are the following :
  // Head : 75
  // Chest : 210
  // Stomach : 180
  // Arms (each) : 125
  // Legs (each) : 135
  // Total : 985 (close to Glukhar health level)

  // Set to false if you want to disable Health Skills increase
  private UseHealthIncrease: true;

  private BaseHealth: { [key: string]: number } = {
    //Change the numbers here to set the base health of each body part.
    Chest: 85,
    Head: 35,
    LeftArm: 60,
    LeftLeg: 65,
    RightArm: 60,
    RightLeg: 65,
    Stomach: 70,
  };

  // Set to false if you want to disable all SCAV health increase
  private UseSCAVIncrease : true

  private GlobalBodyParts: BodyPartsSettings;

  private PMCBodyParts: BodyPartsHealth;
  private SCAVBodyParts: BodyPartsHealth;

  private PMCVitalityLevel: number;
  private PMCStrengthLevel: number;
  private PMCEnduranceLevel: number;
  private PMCHealthLevel: number;

  private SCAVVitalityLevel: number;
  private SCAVStrengthLevel: number;
  private SCAVEnduranceLevel: number;
  private SCAVHealthLevel: number;

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
      "HealthPerSkills",
      [
        {
          url: "/client/game/start",
          action: (url: any, info: any, sessionID: any, output: any) => {
            try {
              this.PMCBodyParts = pHelp.getPmcProfile(sessionID).Health.BodyParts;
              var PMCSkills = pHelp.getPmcProfile(sessionID).Skills.Common;

              this.logger.info(PMCSkills.find(x => x.Id == 'Vitality'));
              this.logger.info(PMCSkills.find(x => x.Id == 'Strength'));
              this.logger.info(PMCSkills.find(x => x.Id == 'Endurance'));
              this.logger.info(PMCSkills.find(x => x.Id == 'Health'));

              this.PMCVitalityLevel = Math.max(Math.floor(PMCSkills.find(x => x.Id == 'Vitality').Progress/100),1);
              this.PMCStrengthLevel = Math.max(Math.floor(PMCSkills.find(x => x.Id == 'Strength').Progress/100),1);
              this.PMCEnduranceLevel = Math.max(Math.floor(PMCSkills.find(x => x.Id == 'Endurance').Progress/100),1);
              this.PMCHealthLevel = Math.max(Math.floor(PMCSkills.find(x => x.Id == 'Health').Progress/100),1);
              
              this.logger.info("Vitality :" + this.PMCVitalityLevel);
              this.logger.info("Strength :" + this.PMCStrengthLevel);
              this.logger.info("Endurance :" + this.PMCEnduranceLevel);
              this.logger.info("Health :" + this.PMCHealthLevel);

              this.SCAVBodyParts = pHelp.getScavProfile(sessionID).Health.BodyParts;
              var SCAVSkills = pHelp.getScavProfile(sessionID).Skills.Common;

              this.SCAVVitalityLevel = Math.max(Math.floor(SCAVSkills.find(x => x.Id == 'Vitality').Progress/100),1);
              this.SCAVStrengthLevel = Math.max(Math.floor(SCAVSkills.find(x => x.Id == 'Strength').Progress/100),1);
              this.SCAVEnduranceLevel = Math.max(Math.floor(SCAVSkills.find(x => x.Id == 'Endurance').Progress/100),1);
              this.SCAVHealthLevel = Math.max(Math.floor(SCAVSkills.find(x => x.Id == 'Health').Progress/100);

              this.calcPMCHealth(
                this.PMCBodyParts,
                this.PMCVitalityLevel,
                this.PMCStrengthLevel,
                this.PMCEnduranceLevel,
                this.PMCHealthLevel
              );
              this.calcSCAVHealth(
                this.SCAVBodyParts,
                this.SCAVVitalityLevel,
                this.SCAVStrengthLevel,
                this.SCAVEnduranceLevel,
                this.SCAVHealthLevel
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
              this.PMCBodyParts = pHelp.getPmcProfile(sessionID).Health.BodyParts;
              var PMCSkills = pHelp.getPmcProfile(sessionID).Skills.Common;

              this.logger.info(PMCSkills.find(x => x.Id == 'Vitality'));
              this.logger.info(PMCSkills.find(x => x.Id == 'Strength'));
              this.logger.info(PMCSkills.find(x => x.Id == 'Endurance'));
              this.logger.info(PMCSkills.find(x => x.Id == 'Health'));

              this.PMCVitalityLevel = Math.max(Math.floor(PMCSkills.find(x => x.Id == 'Vitality').Progress/100),1);
              this.PMCStrengthLevel = Math.max(Math.floor(PMCSkills.find(x => x.Id == 'Strength').Progress/100),1);
              this.PMCEnduranceLevel = Math.max(Math.floor(PMCSkills.find(x => x.Id == 'Endurance').Progress/100),1);
              this.PMCHealthLevel = Math.max(Math.floor(PMCSkills.find(x => x.Id == 'Health').Progress/100),1);
              
              this.logger.info("Vitality :" + this.PMCVitalityLevel);
              this.logger.info("Strength :" + this.PMCStrengthLevel);
              this.logger.info("Endurance :" + this.PMCEnduranceLevel);
              this.logger.info("Health :" + this.PMCHealthLevel);

              this.SCAVBodyParts = pHelp.getScavProfile(sessionID).Health.BodyParts;
              var SCAVSkills = pHelp.getScavProfile(sessionID).Skills.Common;

              this.SCAVVitalityLevel = Math.max(Math.floor(SCAVSkills.find(x => x.Id == 'Vitality').Progress/100),1);
              this.SCAVStrengthLevel = Math.max(Math.floor(SCAVSkills.find(x => x.Id == 'Strength').Progress/100),1);
              this.SCAVEnduranceLevel = Math.max(Math.floor(SCAVSkills.find(x => x.Id == 'Endurance').Progress/100),1);
              this.SCAVHealthLevel = Math.max(Math.floor(SCAVSkills.find(x => x.Id == 'Health').Progress/100)

              this.calcPMCHealth(
                this.PMCBodyParts,
                this.PMCVitalityLevel,
                this.PMCStrengthLevel,
                this.PMCEnduranceLevel,
                this.PMCHealthLevel
              );
              this.calcSCAVHealth(
                this.SCAVBodyParts,
                this.SCAVVitalityLevel,
                this.SCAVStrengthLevel,
                this.SCAVEnduranceLevel,
                this.SCAVHealthLevel
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
    vitalityLevel: number,
    strengthLevel: number,
    enduranceLevel: number,
    healthLevel: number
  ) {
    for (let key in bodyPart) {
      var vitality = (vitalityLevel - 1) * this.IncreasePerVitalityLevel[key];
      var strength = (strengthLevel - 1) * this.IncreasePerStrengthLevel[key];
      var endurance = (enduranceLevel - 1) * this.IncreasePerEnduranceLevel[key];
      var health = (this.UseHealthIncrease ? ((healthLevel - 1) * this.IncreasePerHealthLevel) : 0);
      bodyPart[key].Health.Maximum = Math.floor(
        this.BaseHealth[key] + vitality + strength + endurance + health
      );
    }
  }

  private calcSCAVHealth(
    bodyPart: BodyPartsHealth,
    vitalityLevel: number,
    strengthLevel: number,
    enduranceLevel: number,
    healthLevel: number
  ) {
    for (let key in bodyPart) {
      var vitality = (this.UseSCAVIncrease ? ((vitalityLevel - 1) * this.IncreasePerVitalityLevel[key]) : 0);
      var strength = (this.UseSCAVIncrease ? ((strengthLevel - 1) * this.IncreasePerStrengthLevel[key]) : 0);
      var endurance = (this.UseSCAVIncrease ? ((enduranceLevel - 1) * this.IncreasePerEnduranceLevel[key]) : 0);
      var health = (this.UseSCAVIncrease ? ((this.UseHealthIncrease ? ((healthLevel - 1) * this.IncreasePerHealthLevel) : 0)) : 0);
      bodyPart[key].Health.Maximum = Math.floor(
        this.BaseHealth[key] + vitality + strength + endurance + health
      );
      bodyPart[key].Health.Current = bodyPart[key].Health.Maximum;
    }
  }
}

module.exports = { mod: new HealthPerSkills() };
