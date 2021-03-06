export class ArmorInfo{
    constructor(itemData) {
		this._itemData = itemData;
	}

    getFlag(flag){
        return this._itemData.getFlag("osric", flag);
    }

    setFlag(flag, value){
        return this._itemData.setFlag("osric", flag, value);
    }

    toggleFlag(flag){
        this.setFlag(flag, !this.getFlag(flag));
    }

    get id(){
        return this._itemData?.id;
    }

    get image(){
        return this._itemData?.img;
    }

    get protectionData(){
        return this._itemData?.data?.data?.protection;
    }

    get armorDamageData(){
        return this.protectionData?.armorDamage;
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
        const locationState = game.osric.library.const.location;
        return this._itemData?.data?.data?.location?.state == locationState.EQUIPPED;
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
        return this._itemData?.data?.name;
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
            await this._itemData.update({
                "data.protection.armorDamage.damageTaken": newDamage,
                "data.protection.modifier": this.acModifier + modifierChange
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