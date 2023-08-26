"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HealthPerLevel {
    constructor() {
        this.multiplierPmc = 12; //Amount of health per bodypart on level up for pmc's
        this.multiplierScav = 20; //Amount of health per bodypart on level up for scav's
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
                        this.calcPMCHealth(this.PMCBodyParts, this.PMCLevel);
                        this.calcSCAVHealth(this.SCAVBodyParts, this.SCAVLevel);
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
                        this.calcPMCHealth(this.PMCBodyParts, this.PMCLevel);
                        this.calcSCAVHealth(this.SCAVBodyParts, this.SCAVLevel);
                    }
                    catch (error) {
                        this.logger.error(error.message);
                    }
                    return output;
                },
            },
        ], "aki");
    }
    calcPMCHealth(bodyPart, accountLevel) {
        for (let eachPart in bodyPart) {
            bodyPart[eachPart].Health.Maximum =
                this.GlobalBodyParts[eachPart].Default +
                    (accountLevel - 1) * this.multiplierPmc;
        }
    }
    calcSCAVHealth(bodyPart, accountLevel) {
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
