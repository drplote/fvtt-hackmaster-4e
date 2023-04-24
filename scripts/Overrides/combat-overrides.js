import { HackmasterCombatManager } from '../Modules/hackmaster-combat-manager.js';
import { libWrapper } from '../shim.js';

export class OsricCombatOverrides {
    static initialize(){
        OsricCombatOverrides.overrideDamageRoll();
		OsricCombatOverrides.overrideAttackRoll();
		OsricCombatOverrides.overrideApplyDamageAdjustments();
		OsricCombatOverrides.overrideSendHealthAdjustChatCard();
		OsricCombatOverrides.overrideGetDamageFormulas();
		OsricCombatOverrides.hookInitiativeModifiers();
	}

	static hookInitiativeModifiers(){
		Hooks.on('addAdditionalInitiativeModifiers', (data) => {
			if (data && data.formula && data.combatant){
				let modifiers = HackmasterCombatManager.getAdditionalInitiativeModifiers(data.combatant);
				modifiers.forEach(modifier => {
					data.formula += ` + ${modifier.value}`;
				});
			}
		});
	}

	static overrideGetDamageFormulas(){
		libWrapper.register(CONFIG.Hackmaster.MODULE_ID, 'game.osric.diceManager.adjustHPRoll', async function(wrapped, ...args) {
			let dd = args[0];
			let targetToken = args.length > 1 ? args[1] : null;
			HackmasterCombatManager.replaceDamageForCorrectSize(dd, targetToken);
			return await wrapped(dd, targetToken)
		}, 'WRAPPER');
	}

	static overrideSendHealthAdjustChatCard(){
		libWrapper.register(CONFIG.Hackmaster.MODULE_ID, 'game.osric.combatManager.sendHealthAdjustChatCard', async function(wrapped, ...args) {
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

		libWrapper.register(CONFIG.Hackmaster.MODULE_ID, 'game.osric.diceManager.osricAttackRoll', async function(wrapped, ...args) {
			let roll = await wrapped(...args);
			let dd = args[0];
			let targetToken = args[1];

			HackmasterCombatManager.handleCritCheck(roll, dd, targetToken);
			return roll;

		}, 'WRAPPER');
	}

    static overrideDamageRoll(){
		libWrapper.register(CONFIG.Hackmaster.MODULE_ID, 'game.osric.combatManager.getRolledDamage', async function(wrapped, ...args) {
			await wrapped(...args);
			HackmasterCombatManager.applyHonorToDamageRoll(args[0]);			
		}, 'WRAPPER');
	}

	static overrideApplyDamageAdjustments(){
		libWrapper.register(CONFIG.Hackmaster.MODULE_ID, 'game.osric.combatManager.applyDamageAdjustments', async function(wrapped, ...args) {
			let result = await wrapped(...args);
			return await HackmasterCombatManager.applyArmorSoak(result, ...args);			
		}, 'WRAPPER');
	}
}