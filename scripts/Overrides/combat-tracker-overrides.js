import { HackmasterActor } from '../Modules/hackmaster-actor.js';
import { HackmasterCombatManager } from '../Modules/hackmaster-combat-manager.js';
import { HackmasterSettings } from '../Modules/hackmaster-settings.js';

export class ARSCombatTrackerOverrides {
	static initialize(){
		ARSCombatTrackerOverrides.overrideUpdateCombat();
    		ARSCombatTrackerOverrides.overrideProcessOngoingHealthAdjustments();
    		ARSCombatTrackerOverrides.overrideCombatRollInitiative();
	}

  static overrideCombatRollInitiative(){
    libWrapper.register(CONFIG.Hackmaster.MODULE_ID, 'CONFIG.Combat.documentClass.prototype.rollInitiative', async function(wrapped, ...args) {
        if (args && args.length > 0){
          let combatant = this.combatants.get(args[0][0]);
          if (combatant && args.length > 1 && args[1].formula) {
            let modifiers = HackmasterCombatManager.getAdditionalInitiativeModifiers(combatant);
            modifiers.forEach(modifier => {
              args[1].formula += ` + ${modifier.value}`;
            });
          }
        }
        await wrapped(...args); 
    }, 'WRAPPER');
  }

  static overrideUpdateCombat(){
    libWrapper.register(CONFIG.Hackmaster.MODULE_ID, 'CONFIG.Combat.documentClass.prototype.reRollInitiative', async function(wrapped, ...args) {
        if (HackmasterSettings.isUsingTenSegmentInit()){
          await HackmasterCombatManager.reRollInitiative(this);
        }
        else{
          await this.resetAll();
          await wrapped(...args);
        }
		}, 'MIXED');
  }

  static overrideProcessOngoingHealthAdjustments(){
		libWrapper.register(CONFIG.Hackmaster.MODULE_ID, 'CONFIG.Combat.documentClass.prototype.processOneRoundFlags', async function(wrapped, ...args) {
			await wrapped(...args);
      if(game.user.isGM){
          let hmActor = new HackmasterActor(args[0].actor);
          await hmActor.resetDamageTaken();
      }
		}, 'WRAPPER');
  }
}
