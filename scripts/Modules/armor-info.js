import { Utilities } from "../utilities.js";

export class ArmorInfo{
    constructor(itemData) {
		this._itemData = itemData;
	}

    getFlag(flag){
        return this._itemData.getFlag("ars", flag);
    }

    setFlag(flag, value){
        return this._itemData.setFlag("ars", flag, value);
    }

    toggleFlag(flag){
        this.setFlag(flag, !this.getFlag(flag));
    }

    get isMagic() {
        return this._itemData?.isMagic ?? false;
    }

    get id(){
        return this._itemData?.id;
    }

    get belongsToNpc(){
        var parent = this._itemData?.parent;
        if (Utilities.isObjectOfType(parent, "ARSActor")){
            return this._itemData.actor.type === 'npc';
        }
        return true;
    }

    get owningActorId(){
        var parent = this._itemData?.parent;
        if (Utilities.isObjectOfType(parent, "ARSActor")){
            return this._itemData?.actor?.id;
        }
        return null;
    }

    get owningTokenId(){
        var parent = this._itemData?.parent;
        if (Utilities.isObjectOfType(parent, "ARSActor")){
            return this._itemData?.actor?.token?.id;
        }
        return null;
    }

    get image(){
        return this._itemData?.img;
    }

    get protectionData(){
        return this._itemData?.system?.protection;
    }

    get armorDamageData(){
        return this.protectionData?.armorDamage;
    }

    get soakPerDie(){
        return this.protectionData?.armorDamage?.soak ?? 1;
    }

    get isShield(){
        return this.protectionData?.type === "shield";
    }

    get damageProgressionString(){
        return this.armorDamageData?.progression;
    }

    get baseAc(){
        return this.protectionData?.ac ?? 10;
    }

    get acModifier(){
        return this.protectionData?.modifier;
    }

    get acModifierUndamaged(){
        return this.acModifier + this.calcLevelsLostForDamageAmount(this.damageTaken);
    }

    get effectiveAc(){
        return this.baseAc + (this.isShield ? 1 : -1) * this.acModifier;
    }

    get undamagedAc(){
        return this.baseAc + (this.isShield ? 1 : -1) * this.acModifierUndamaged;
    }

    get armorHpArray(){
        if (this.damageProgressionString){
            return this.damageProgressionString.split(',').map(s => Number(s));
        }
        return [];
    }

    get isEquipped(){
        const locationState = game.ars.library.const.location;
        return this._itemData?.system?.location?.state == locationState.EQUIPPED;
    }

    get damageTaken(){
        return this.armorDamageData?.damageTaken ?? 0;
    }

    get hpRemaining(){
        return this.maxArmorHp - this.damageTaken;
    }

    get maxArmorHp(){
        return this.armorHpArray.reduce((a, b) => a + b, 0);
    }

    get name(){
        return this._itemData?.name;
    }

    get aliasedName(){
        return this._itemData?.alias ?? this.name;
    }

    async repairArmor(amount){
        await this.damageArmor(-1 * amount);
    }

    async damageArmor(amount){
        let oldDamage = this.damageTaken ?? 0;
        let newDamage = Math.max(0, Math.min(this.maxArmorHp, this.damageTaken + amount));
        let actualChange = newDamage - oldDamage;

        if (actualChange !== 0){
            let modifierChange = this.calcModifierChangeFromDamage(oldDamage, newDamage);
            await Utilities.runAsGM({
                operation: 'updateItem',
                targetItemId: this.id, 
                targetTokenId: this.belongsToNpc ? this.owningTokenId : null,
                targetActorId: this.belongsToNpc ? null : this.owningActorId,
                update:{
                    "system.protection.armorDamage.damageTaken": newDamage,
                    "system.protection.modifier": this.acModifier + modifierChange
                }
            })
        }

        return actualChange;
    }

    calcModifierChangeFromDamage(oldDamage, newDamage){
        if (oldDamage === newDamage){
            return 0;
        }

        let oldLevelsLost = this.calcLevelsLostForDamageAmount(oldDamage);
        let newLevelsLost = this.calcLevelsLostForDamageAmount(newDamage);
        return oldLevelsLost - newLevelsLost;
    }

    calcLevelsLostForDamageAmount(damageAmount){
        let levelsLost = 0;
        for(let i = 0; i < this.armorHpArray.length && damageAmount > 0; i++){
            if (damageAmount >= this.armorHpArray[i]){
                levelsLost += 1;
            }
            damageAmount -= this.armorHpArray[i];
        }
        return levelsLost;
    }
}
