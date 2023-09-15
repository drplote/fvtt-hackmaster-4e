import { Utilities } from "../utilities.js";
import { HackmasterItem } from "./hackmaster-item.js";
import { HonorCalculator } from "./honor-calculator.js";

export class HackmasterActor {

    constructor(ARSActor) {
        this._ARSActor = ARSActor;
    }

    getItems(){
        let items = this._ARSActor?.items ?? [];
        return items.map(i => new HackmasterItem(i));
    }

    getEquippedArmors(){
        return this.getItems()
            .filter(i => i.isArmor && i.isEquipped)
            .map(a => a.getArmorInfo());
    }

    getEquippedShields(){
        return this.getItems()
            .filter(i => i.isShield && i.isEquipped)
            .map(a => a.getArmorInfo());
    }

    get isProtegee(){
        return this._ARSActor?.system?.isProtegee ?? false;
    }

    get temporaryHonor(){
        return this._ARSActor?.system?.honor?.temp ?? 0;
    }

    get honor() {
        return this._ARSActor?.system?.honor?.value ?? 0;
    }

    
    get comeliness(){
        return this._ARSActor?.system?.comeliness?.value ?? 10;
    }

    get comelinessPercent(){
        return this._ARSActor?.system?.comeliness?.percent ?? 0;
    }

    get comelinessDescription(){
        let boundedComeliness = Math.min(Math.max(1, this.comeliness), 25);
        return CONFIG.Hackmaster.ComelinessTable[boundedComeliness];
    }

    get effectiveLevel() {
        return this._ARSActor?.effectiveLevel ?? 0;
    }

    get isNpc() {
        return this._ARSActor?.type == 'npc';
    }

    get thac0(){
        return this._ARSActor?.system?.attributes?.thaco?.value ?? 20;
    }

    get armorClass(){
        return this._ARSActor?.system?.armorClass ?? [];
    }

    getArmorClass(type){
        return this.armorClass[type] ?? 10;
    }

    get normalAc(){
        return this.armorClass['normal'] ?? 10;
    }

   
    get size(){
        return this._ARSActor?.system?.attributes?.size ?? 'medium';
    }

    get sizeCategory(){
        let sizeChar = this.size.toLowerCase()[0];

        switch(sizeChar){
            case 't':
                return 1;
            case 's':
                return 2;
            case 'm':
                return 3;
            case 'l':
                return 4;
            case 'h':
                return 5;
            case 'g':
                return 6;
            default:
                return 3;
        }
    }

    get rawHonorState(){
        return this._ARSActor?.system?.honorState ?? 0
    }

    getHonorState() {
        if (this.isNpc){
            return this.rawHonorState;
        }

        return HonorCalculator.getHonorState(this.effectiveLevel, this.honor);
    }

    getHonorStateDescription() {
        return HonorCalculator.HonorStateDescriptions[this.getHonorState()];
    }

    isInGreatHonor() {
        return this.getHonorState() == HonorCalculator.HonorStates.GreatHonor;
    }

    isInDishonor() {
        return this.getHonorState() == HonorCalculator.HonorStates.Dishonor;
    }

    getHonorDie(){
        if (this.isNpc){
            return "";
        }
        return HonorCalculator.getHonorDie(this.effectiveLevel, this.honor);
    }

    get thresholdOfPain(){
        return Math.floor((this._ARSActor?.system?.attributes?.hp?.max ?? 0) / 2);
    }

    get recentDamageTaken(){
        return this._ARSActor?.system?.recentDamage ?? 0;
    }

    async setRecentDamageTaken(amount){
        if (this._ARSActor){
            await Utilities.runAsGM({
                operation: 'updateActor',
                targetActorId: this.isNpc ? null : this.actorId,
                targetTokenId: this.isNpc ? this.tokenId : null,
                update: {
                    "system.recentDamage": amount
                }
            });
        }
    }

    get isDead(){
        return this._ARSActor?.isDead ?? false;
    }

    async recordDamageTaken(amount){
        await this.setRecentDamageTaken(this.recentDamageTaken + amount);
    }

    async resetDamageTaken(){
        await this.setRecentDamageTaken(0);
    }

    get needsThresholdOfPainCheck(){
        return !this.isDead && this.recentDamageTaken >= this.thresholdOfPain;
    }

    get name() {
        return this._ARSActor?.getName() ?? '';
    }

    get actorId(){
        return this._ARSActor?.id;
    }

    get tokenId(){
        return this._ARSActor?.token?.id;
    }
}
