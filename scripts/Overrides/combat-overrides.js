import { HackmasterCombatManager } from '../Modules/hackmaster-combat-manager.js';
import { libWrapper } from '../shim.js';
//import * from '../dice/dice.js'

export class ARSCombatOverrides {
    static initialize(){
        ARSCombatOverrides.overrideDamageRoll();
		ARSCombatOverrides.overrideAttackRoll();
		ARSCombatOverrides.overrideApplyDamageAdjustments();
		ARSCombatOverrides.overrideSendHealthAdjustChatCard();
		ARSCombatOverrides.overrideGetDamageFormulas();
	}

	static overrideGetDamageFormulas(){
		libWrapper.register(CONFIG.Hackmaster.MODULE_ID, 'game.ars.diceManager.adjustHPRoll', async function(wrapped, ...args) {
			let dd = args[0];
			let targetToken = args.length > 1 ? args[1] : null;
			HackmasterCombatManager.replaceDamageForCorrectSize(dd, targetToken);
			return await wrapped(dd, targetToken)
		}, 'WRAPPER');
	}

	static overrideSendHealthAdjustChatCard(){
		libWrapper.register(CONFIG.Hackmaster.MODULE_ID, 'game.ars.combatManager.sendHealthAdjustChatCard', async function(wrapped, ...args) {
			await wrapped(...args);

			let targetToken = args[1];
			let bDamage = args[2];
			let totalDamageDone = args[4];
			if (bDamage){
				await HackmasterCombatManager.recordDamageForThresholdOfPain(targetToken, totalDamageDone);
			}

		}, 'WRAPPER');
	}

	static overrideAttackRoll(){
		Hooks.on('addAttackRollBonuses', (dd, targetToken, bonusFormula, additionalRollData) =>{
			HackmasterCombatManager.applyHonorToAttackRoll(dd, bonusFormula, additionalRollData);
		});

		libWrapper.register(CONFIG.Hackmaster.MODULE_ID, 'game.ars.diceManager.systemAttackRoll', async function(wrapped, ...args) {
			let roll = await wrapped(...args);
			let dd = args[0];
			let targetToken = args[1];

			HackmasterCombatManager.handleCritCheck(roll, dd, targetToken);
			return roll;

		}, 'WRAPPER');
	}

    static overrideDamageRoll(){
		libWrapper.register(CONFIG.Hackmaster.MODULE_ID, 'game.ars.combatManager.getRolledDamage', async function(wrapped, ...args) {
			await wrapped(...args);
			HackmasterCombatManager.applyHonorToDamageRoll(args[0]);			
		}, 'WRAPPER');
	}

	static overrideApplyDamageAdjustments(){
		libWrapper.register(CONFIG.Hackmaster.MODULE_ID, 'game.ars.combatManager.applyDamageAdjustments', async function(wrapped, ...args) {
			let result = await wrapped(...args);
			return await HackmasterCombatManager.applyArmorSoak(result, ...args);			
		}, 'WRAPPER');
	}
}
