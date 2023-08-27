"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HealthPerLevel {
    constructor() {
        this.IncreasePerLevel = {
            //Change the numbers here to change the increase in health per level.
            Chest: 2,
            Head: 2,
            LeftArm: 3,
            LeftLeg: 3,
            RightArm: 3,
            RightLeg: 3,
            Stomach: 2,
        };
        this.BaseHealth = {
            //Change the numbers here to set the base health per body part.
            Chest: 85,
            Head: 35,
            LeftArm: 60,
            LeftLeg: 65,
            RightArm: 60,
            RightLeg: 65,
            Stomach: 70,
        };
    }
    postDBLoad(container) {
        const dbServer = container
            .resolve("DatabaseServer")
            .getTables().globals;
        this.GlobalBodyParts =
            dbServer.config.Health.ProfileHealthSettings.BodyPartsSettings;
    }
    preAkiLoad(container) {
        const staticRMS = container.resolve("StaticRouterModService");
        const pHelp = container.resolve("ProfileHelper");
        this.logger = container.resolve("WinstonLogger");
        staticRMS.registerStaticRouter("HealthPerLevel", [
            {
                url: "/client/game/start",
                action: (url, info, sessionID, output) => {
                    try {
                        this.PMCBodyParts =
                            pHelp.getPmcProfile(sessionID).Health.BodyParts;
                        this.PMCLevel = pHelp.getPmcProfile(sessionID).Info.Level;
                        this.SCAVBodyParts =
                            pHelp.getScavProfile(sessionID).Health.BodyParts;
                        this.SCAVLevel = pHelp.getScavProfile(sessionID).Info.Level;
                        this.calcPMCHealth(this.PMCBodyParts, this.PMCLevel, this.BaseHealth);
                        this.calcSCAVHealth(this.SCAVBodyParts, this.SCAVLevel, this.BaseHealth);
                    }
                    catch (error) {
                        this.logger.error(error.message);
                    }
                    return output;
                },
            },
            {
                url: "/client/items",
                action: (url, info, sessionID, output) => {
                    try {
                        this.PMCBodyParts =
                            pHelp.getPmcProfile(sessionID).Health.BodyParts;
                        this.PMCLevel = pHelp.getPmcProfile(sessionID).Info.Level;
                        this.SCAVBodyParts =
                            pHelp.getScavProfile(sessionID).Health.BodyParts;
                        this.SCAVLevel = pHelp.getScavProfile(sessionID).Info.Level;
                        this.calcPMCHealth(this.PMCBodyParts, this.PMCLevel, this.BaseHealth);
                        this.calcSCAVHealth(this.SCAVBodyParts, this.SCAVLevel, this.BaseHealth);
                    }
                    catch (error) {
                        this.logger.error(error.message);
                    }
                    return output;
                },
            },
        ], "aki");
    }
    calcPMCHealth(bodyPart, accountLevel, preset) {
        for (let key in this.IncreasePerLevel) {
            bodyPart[key].Health.Maximum =
                preset[key] + (accountLevel - 1) * this.IncreasePerLevel[key];
        }
    }
    calcSCAVHealth(bodyPart, accountLevel, preset) {
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
