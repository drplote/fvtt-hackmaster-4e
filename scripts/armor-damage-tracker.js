import { ArmorInfo } from './armor-info.js';

export class ArmorDamageTracker{

    static async damageArmor(itemData, amount){
		if (itemData){
			let armor = new ArmorInfo(itemData);
			await armor.damageArmor(amount);
		}
    }

    static async buildArmorReport(armor){
        return await renderTemplate("modules/hackmaster-4e/templates/armor-damage.hbs", this.getArmorDamageTemplateData(armor));
    }

    static getArmorDamageTemplateData(armor){
        if (!armor || !armor.armorHpArray){
            return null;
        }
        
        let totalAcLevels = armor.armorHpArray.length;
        let damageToDistribute = armor.damageTaken;
        let result = {
            armorLevels: [], 
            name: armor.name,
            isEquipped: armor.isEquipped,
            isShield: armor.isShield,
            maxHp: armor.maxArmorHp,
            remainingHp: armor.hpRemaining,
            acValue: armor.isShield ? totalAcLevels : (10 - totalAcLevels),
            itemId: armor.id,
            isCollapsed: armor.getFlag('display.collapsedState') ?? !armor.isEquipped
        };
        for (let i = 0; i < totalAcLevels; i++){
            let hpForLevel = armor.armorHpArray[i];
            let damageForLevel = Math.min(damageToDistribute, hpForLevel);
            damageToDistribute = damageToDistribute - damageForLevel;
            let remainingForLevel = hpForLevel - damageForLevel;
            if (remainingForLevel === 0){
                result.acValue = result.acValue + (armor.isShield ? -1 : 1);
            }
            let acBonusString = armor.isShield ? `AC +${armor.baseAc - i}: ` : `AC ${armor.baseAc + i}: `;
            result.armorLevels.push({acBonus: acBonusString, hpBoxes: this.buildArmorBoxes(damageForLevel, remainingForLevel) });
        }
        return result;
    }

    static buildArmorBoxes(damage, remaining){
        let damageString = damage ? "⯀".repeat(damage) : "";
        let remainingString = remaining ? "❒".repeat(remaining) : "";
        let combined = damageString + remainingString;
        let chunks = [];
        for (let i = 0; i < combined.length; i+=5){
            chunks.push(combined.slice(i, i+5));
        }
        
        return chunks.join(' ');
    }
}