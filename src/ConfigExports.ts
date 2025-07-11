import path from "node:path";
import { DependencyContainer } from "tsyringe";
import { FileSystemSync } from "@spt/utils/FileSystemSync";
import json5 from "json5";
import { eventNames } from "node:process";

export interface IHealthPerLevelConfig
{
    enabled: boolean,
    splitScavAndPmcHealth: boolean;
    keepBleedingChanceConsistant:boolean;
    increaseThresholdEveryIncrement: boolean;
    showRealismWarning: boolean;
    ALT: {
        alt_enabled:boolean;
        head_boost:number;
        alt_base_health:{ [key: string]: number };
        levels_per_partial_inc:{ [key: string]: number };
        partial_inc_per_level:{ [key: string]: number };
        partial_mul_per_skill:{ [key: string]: number };
    }
    PMC: {
        levelsPerIncrement:number;
        levelCap:boolean;
        levelCapValue:number;
        healthSkillLevelsPerIncrement:number;
        levelHealthSkillCap:boolean;
        levelHealthSkillCapValue:number;
        healthPerHealthSkillLevel:boolean;
        baseHealth: { [key: string]: number };
        increasePerLevel: { [key: string]: number };
        increasePerHealthSkillLevel: { [key: string]: number };
    }
    SCAV: {
        levelsPerIncrement:number;
        levelCap:boolean;
        levelCapValue:number;
        healthSkillLevelsPerIncrement:number;
        levelHealthSkillCap:boolean;
        levelHealthSkillCapValue:number;
        healthPerHealthSkillLevel:boolean;
        baseHealth: { [key: string]: number };
        increasePerLevel: { [key: string]: number };
        increasePerHealthSkillLevel: { [key: string]: number };
    }
    AI: {
        enabled:boolean;
        pmcBotHealth:boolean;
        scavBotHealth:boolean;
        raiderBotHealth:boolean;
        bossBotHealth:boolean;
        followerBotHealth:boolean;
    }
}

export class ConfigExports
{
    private configJson: any;

    constructor(container: DependencyContainer)
    {
        const fss = container.resolve<FileSystemSync>("FileSystemSync");
        this.configJson = json5.parse(fss.read(path.resolve(__dirname, "../config/config.json5")));
    }

    public getConfig(): IHealthPerLevelConfig
    {
        return this.mapConfig();
    }

    private mapConfig()
    {
        return {
            enabled: this.configJson.enabled,
            splitScavAndPmcHealth: this.configJson.split_scav_and_PMC_health,
            keepBleedingChanceConsistant: this.configJson.keep_bleeding_chance_consistant,
            increaseThresholdEveryIncrement: this.configJson.increase_threshold_every_increment,
            showRealismWarning: this.configJson.show_realism_warning,
            ALT:
            {
                alt_enabled: this.configJson.ALT.alt_enabled,
                head_boost: this.configJson.ALT.head_boost,
                alt_base_health:
                {
                    Chest: this.configJson.ALT.alt_base_health.thorax,
                    Stomach: this.configJson.ALT.alt_base_health.stomach,
                    Head: this.configJson.ALT.alt_base_health.head,
                    LeftArm: this.configJson.ALT.alt_base_health.l_arm,
                    LeftLeg: this.configJson.ALT.alt_base_health.l_leg,
                    RightArm: this.configJson.ALT.alt_base_health.r_arm,
                    RightLeg: this.configJson.ALT.alt_base_health.r_leg,
                },
                levels_per_partial_inc:
                {
                    Chest: this.configJson.ALT.levels_per_partial_inc.thorax,
                    Stomach: this.configJson.ALT.levels_per_partial_inc.stomach,
                    Head: this.configJson.ALT.levels_per_partial_inc.head,
                    LeftArm: this.configJson.ALT.levels_per_partial_inc.l_arm,
                    LeftLeg: this.configJson.ALT.levels_per_partial_inc.l_leg,
                    RightArm: this.configJson.ALT.levels_per_partial_inc.r_arm,
                    RightLeg: this.configJson.ALT.levels_per_partial_inc.r_leg,
                },
                partial_inc_per_level:
                {
                    Chest: this.configJson.ALT.partial_inc_per_level.thorax,
                    Stomach: this.configJson.ALT.partial_inc_per_level.stomach,
                    Head: this.configJson.ALT.partial_inc_per_level.head,
                    LeftArm: this.configJson.ALT.partial_inc_per_level.l_arm,
                    LeftLeg: this.configJson.ALT.partial_inc_per_level.l_leg,
                    RightArm: this.configJson.ALT.partial_inc_per_level.r_arm,
                    RightLeg: this.configJson.ALT.partial_inc_per_level.r_leg,
                },
                partial_mul_per_skill:
                {
                    Chest: this.configJson.ALT.partial_mul_per_skill.thorax,
                    Stomach: this.configJson.ALT.partial_mul_per_skill.stomach,
                    Head: this.configJson.ALT.partial_mul_per_skill.head,
                    LeftArm: this.configJson.ALT.partial_mul_per_skill.l_arm,
                    LeftLeg: this.configJson.ALT.partial_mul_per_skill.l_leg,
                    RightArm: this.configJson.ALT.partial_mul_per_skill.r_arm,
                    RightLeg: this.configJson.ALT.partial_mul_per_skill.r_leg,
                }
            },
            PMC:
            {
                levelsPerIncrement: this.configJson.PMC.levels_per_increment,
                levelCap: this.configJson.PMC.level_cap,
                levelCapValue: this.configJson.PMC.level_cap_value,
                healthSkillLevelsPerIncrement: this.configJson.PMC.health_skill_levels_per_increment,
                levelHealthSkillCap: this.configJson.PMC.level_health_skill_cap,
                levelHealthSkillCapValue: this.configJson.PMC.level_health_skill_cap_value,
                healthPerHealthSkillLevel: this.configJson.PMC.health_per_health_skill_level,
                baseHealth:
                {
                    //Amount of base health per body part, based on the config.
                    Chest: this.configJson.PMC.base_health.thorax_base_health,
                    Stomach: this.configJson.PMC.base_health.stomach_base_health,
                    Head: this.configJson.PMC.base_health.head_base_health,
                    LeftArm: this.configJson.PMC.base_health.left_arm_base_health,
                    LeftLeg: this.configJson.PMC.base_health.left_leg_base_health,
                    RightArm: this.configJson.PMC.base_health.right_arm_base_health,
                    RightLeg: this.configJson.PMC.base_health.right_leg_base_health
                },
                increasePerLevel:
                {
                    //Amount of health that is added per level, broken down per body part from the config.
                    Chest: this.configJson.PMC.increase_per_level.thorax_health_per_level,
                    Stomach: this.configJson.PMC.increase_per_level.stomach_health_per_level,
                    Head: this.configJson.PMC.increase_per_level.head_health_per_level,
                    LeftArm: this.configJson.PMC.increase_per_level.left_arm_per_level,
                    LeftLeg: this.configJson.PMC.increase_per_level.left_leg_per_level,
                    RightArm: this.configJson.PMC.increase_per_level.right_arm_per_level,
                    RightLeg: this.configJson.PMC.increase_per_level.right_leg_per_level
                },
                increasePerHealthSkillLevel:
                {
                    //Amount of health that is added per Health Skill level, broken down per body part from the config.
                    Chest: this.configJson.PMC.increase_per_health_skill_level.health_skill_thorax_health_per_level,
                    Stomach: this.configJson.PMC.increase_per_health_skill_level.health_skill_stomach_health_per_level,
                    Head: this.configJson.PMC.increase_per_health_skill_level.health_skill_head_health_per_level,
                    LeftArm: this.configJson.PMC.increase_per_health_skill_level.health_skill_left_arm_per_level,
                    LeftLeg: this.configJson.PMC.increase_per_health_skill_level.health_skill_left_leg_per_level,
                    RightArm: this.configJson.PMC.increase_per_health_skill_level.health_skill_right_arm_per_level,
                    RightLeg: this.configJson.PMC.increase_per_health_skill_level.health_skill_right_leg_per_level
                }
            },
            SCAV:
            {
                levelsPerIncrement: this.configJson.SCAV.levels_per_increment,
                levelCap: this.configJson.SCAV.level_cap,
                levelCapValue: this.configJson.SCAV.level_cap_value,
                healthSkillLevelsPerIncrement: this.configJson.SCAV.health_skill_levels_per_increment,
                levelHealthSkillCap: this.configJson.SCAV.level_health_skill_cap,
                levelHealthSkillCapValue: this.configJson.SCAV.level_health_skill_cap_value,
                healthPerHealthSkillLevel: this.configJson.SCAV.health_per_health_skill_level,
                baseHealth:
                {
                    //Amount of base health per body part, based on the config.
                    Chest: this.configJson.SCAV.base_health.thorax_base_health,
                    Stomach: this.configJson.SCAV.base_health.stomach_base_health,
                    Head: this.configJson.SCAV.base_health.head_base_health,
                    LeftArm: this.configJson.SCAV.base_health.left_arm_base_health,
                    LeftLeg: this.configJson.SCAV.base_health.left_leg_base_health,
                    RightArm: this.configJson.SCAV.base_health.right_arm_base_health,
                    RightLeg: this.configJson.SCAV.base_health.right_leg_base_health
                },
                increasePerLevel:
                {
                    //Amount of health that is added per level, broken down per body part from the config.
                    Chest: this.configJson.SCAV.increase_per_level.thorax_health_per_level,
                    Stomach: this.configJson.SCAV.increase_per_level.stomach_health_per_level,
                    Head: this.configJson.SCAV.increase_per_level.head_health_per_level,
                    LeftArm: this.configJson.SCAV.increase_per_level.left_arm_per_level,
                    LeftLeg: this.configJson.SCAV.increase_per_level.left_leg_per_level,
                    RightArm: this.configJson.SCAV.increase_per_level.right_arm_per_level,
                    RightLeg: this.configJson.SCAV.increase_per_level.right_leg_per_level
                },
                increasePerHealthSkillLevel:
                {
                    //Amount of health that is added per Health Skill level, broken down per body part from the config.
                    Chest: this.configJson.SCAV.increase_per_health_skill_level.health_skill_thorax_health_per_level,
                    Stomach: this.configJson.SCAV.increase_per_health_skill_level.health_skill_stomach_health_per_level,
                    Head: this.configJson.SCAV.increase_per_health_skill_level.health_skill_head_health_per_level,
                    LeftArm: this.configJson.SCAV.increase_per_health_skill_level.health_skill_left_arm_per_level,
                    LeftLeg: this.configJson.SCAV.increase_per_health_skill_level.health_skill_left_leg_per_level,
                    RightArm: this.configJson.SCAV.increase_per_health_skill_level.health_skill_right_arm_per_level,
                    RightLeg: this.configJson.SCAV.increase_per_health_skill_level.health_skill_right_leg_per_level
                }
            },
            AI:
            {
                enabled: this.configJson.AI.enabled,
                pmcBotHealth: this.configJson.AI.pmc_bot_health,
                scavBotHealth: this.configJson.AI.scav_bot_health,
                raiderBotHealth: this.configJson.AI.raider_bot_health,
                bossBotHealth: this.configJson.AI.boss_bot_health,
                followerBotHealth: this.configJson.AI.follower_bot_health
            }
        };
    }
}
