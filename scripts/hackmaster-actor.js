import { libWrapper } from './shim.js';
import { Hackmaster } from './config.js';

export class HackmasterActor {

	static initialize(){
		this.addAcFieldsToActorDefinitions();
		this.overrideStatBonuses();
		this.overridePrepareArmorClass();
	}

	static overridePrepareArmorClass(){
		libWrapper.register(CONFIG.Hackmaster.MODULE_ID, 'CONFIG.Actor.documentClass.prototype._prepareArmorClass', function(wrapped, ...args) {
			// This is a fix for armor damage causing touch AC to be bad. We just don't add in armor modifier to touch AC now.
			wrapped(...args);
			let data = args[0];
			data.armorClass.touch =
			data.attributes.ac.value +
			data.armorClass.shield +
			data.armorClass.ring +
			data.armorClass.cloak +
			data.armorClass.modEffects +
			data.armorClass.other +
			data.armorClass.dex;
		}, 'WRAPPER');
	}

	static overrideStatBonuses(){
	  CONFIG.OSRIC.constitutionTable = Hackmaster.ConstitutionTable;
	  
	  libWrapper.register(CONFIG.Hackmaster.MODULE_ID, 'CONFIG.Actor.documentClass.prototype._buildAbilityFields', (function() {
	    return function(data) {
	      HackmasterActor._buildAbilityFields(data);
	    };
	  })(), 'OVERRIDE');
	}

	// This exists primarily for Token Mold support.
	static addAcFieldsToActorDefinitions(){
	  let armorClass = {
	     "normal": 10,
	     "rear": 10,
	     "touch": 10,
	     "shieldless": 10,
	     "nodex": 10,
	     "acranged": 10,
	     "acrangedfront": 10,
	     "acrangedrear": 10,
	     "armormelee": 10,
	     "armormeleefront": 10,
	     "armormeleerear": 10
	  };

	  game.system.model.Actor.character.armorClass = armorClass;
	  game.system.model.Actor.npc.armorClass = armorClass;
	}

	static _buildAbilityFields(data) {
		for (let [key, abl] of Object.entries(data.abilities)) {
		  // sanity checks.
		  if (abl.value > 25) abl.value = 25;
		  if (abl.value < 1) abl.value = 1;

		  switch (key) {
		    case "str":
		      let strIndex  = abl.value * 2 - 1;
		      if (abl.percent > 50){
		      	strIndex = strIndex + 1;
		      }
		      abl.fields = {
		        hit: {
		          value: CONFIG.Hackmaster.StrengthTable[strIndex][0],
		          label: CONFIG.Hackmaster.StrengthTable[0][0]
		        },
		        dmg: {
		          value: CONFIG.Hackmaster.StrengthTable[strIndex][1],
		          label: CONFIG.Hackmaster.StrengthTable[0][1]
		        }
		        ,
		        allow: {
		          value: CONFIG.Hackmaster.StrengthTable[strIndex][2],
		          label: CONFIG.Hackmaster.StrengthTable[0][2]
		        }
		        ,
		        press: {
		          value: CONFIG.Hackmaster.StrengthTable[strIndex][3],
		          label: CONFIG.Hackmaster.StrengthTable[0][3]
		        }
		        ,
		        open: {
		          value: CONFIG.Hackmaster.StrengthTable[strIndex][4],
		          label: CONFIG.Hackmaster.StrengthTable[0][4]
		        },
		        bendbars: {
		          value: CONFIG.Hackmaster.StrengthTable[strIndex][5],
		          label: CONFIG.Hackmaster.StrengthTable[0][5]
		        }
		      };
		      abl.hit = CONFIG.Hackmaster.StrengthTable[strIndex][0];
		      abl.dmg = CONFIG.Hackmaster.StrengthTable[strIndex][1];
		      abl.allow = CONFIG.Hackmaster.StrengthTable[strIndex][2];
		      abl.press = CONFIG.Hackmaster.StrengthTable[strIndex][3];
		      abl.open = CONFIG.Hackmaster.StrengthTable[strIndex][4];
		      abl.bendbars = CONFIG.Hackmaster.StrengthTable[strIndex][5];
		      break;

		    case "dex":
				let dexIndex  = abl.value * 2 - 1;
				if (abl.percent > 50){
					dexIndex = dexIndex + 1;
				}

		      abl.fields = {
		        reaction: {
		          value: CONFIG.Hackmaster.DexterityTable[dexIndex][0],
		          label: CONFIG.Hackmaster.DexterityTable[0][0]
		        },
		        missile: {
		          value: CONFIG.Hackmaster.DexterityTable[dexIndex][1],
		          label: CONFIG.Hackmaster.DexterityTable[0][1]
		        },
		        defensive: {
		          value: CONFIG.Hackmaster.DexterityTable[dexIndex][2],
		          label: CONFIG.Hackmaster.DexterityTable[0][2]
		        }
		      };
		      abl.reaction = CONFIG.Hackmaster.DexterityTable[dexIndex][0],
		        abl.missile = CONFIG.Hackmaster.DexterityTable[dexIndex][1];
		      abl.defensive = CONFIG.Hackmaster.DexterityTable[dexIndex][2];
		      break;

		    case "con":
		      abl.fields = {
		        hp: {
		          value: CONFIG.Hackmaster.ConstitutionTable[abl.value][0].join('/'),
		          label: CONFIG.Hackmaster.ConstitutionTable[0][0]
		        },
		        shock: {
		          value: CONFIG.Hackmaster.ConstitutionTable[abl.value][1],
		          label: CONFIG.Hackmaster.ConstitutionTable[0][1]
		        },
		        survival: {
		          value: CONFIG.Hackmaster.ConstitutionTable[abl.value][2],
		          label: CONFIG.Hackmaster.ConstitutionTable[0][2]
		        },
		        poison: {
		          value: CONFIG.Hackmaster.ConstitutionTable[abl.value][3],
		          label: CONFIG.Hackmaster.ConstitutionTable[0][3]
		        },
		        regen: {
		          value: CONFIG.Hackmaster.ConstitutionTable[abl.value][4],
		          label: CONFIG.Hackmaster.ConstitutionTable[0][4]
		        }
		      };
		      abl.hp = CONFIG.Hackmaster.ConstitutionTable[abl.value][0];
		      abl.shock = CONFIG.Hackmaster.ConstitutionTable[abl.value][1];
		      abl.survival = CONFIG.Hackmaster.ConstitutionTable[abl.value][2];
		      abl.poison = CONFIG.Hackmaster.ConstitutionTable[abl.value][3];
		      abl.regen = CONFIG.Hackmaster.ConstitutionTable[abl.value][4];
		      break;

		    case "int":
		      abl.fields = {
		        languages: {
		          value: CONFIG.Hackmaster.IntelligenceTable[abl.value][0],
		          label: CONFIG.Hackmaster.IntelligenceTable[0][0]
		        },
		        level: {
		          value: CONFIG.Hackmaster.IntelligenceTable[abl.value][1],
		          label: CONFIG.Hackmaster.IntelligenceTable[0][1]
		        },
		        chance: {
		          value: CONFIG.Hackmaster.IntelligenceTable[abl.value][2],
		          label: CONFIG.Hackmaster.IntelligenceTable[0][2]
		        },
		        max: {
		          value: CONFIG.Hackmaster.IntelligenceTable[abl.value][3],
		          label: CONFIG.Hackmaster.IntelligenceTable[0][3]
		        },
		        imm: {
		          value: CONFIG.Hackmaster.IntelligenceTable[abl.value][4],
		          label: CONFIG.Hackmaster.IntelligenceTable[0][4]
		        }
		      };
		      abl.languages = CONFIG.Hackmaster.IntelligenceTable[abl.value][0];
		      abl.level = CONFIG.Hackmaster.IntelligenceTable[abl.value][1];
		      abl.chance = CONFIG.Hackmaster.IntelligenceTable[abl.value][2];
		      abl.max = CONFIG.Hackmaster.IntelligenceTable[abl.value][3];
		      abl.imm = CONFIG.Hackmaster.IntelligenceTable[abl.value][4];
		      break;

		    case "wis":
		      abl.fields = {
		        magic: {
		          value: CONFIG.Hackmaster.WisdomTable[abl.value][0],
		          label: CONFIG.Hackmaster.WisdomTable[0][0]
		        },
		        bonus: {
		          value: CONFIG.Hackmaster.WisdomTable[abl.value][1],
		          label: CONFIG.Hackmaster.WisdomTable[0][1],
		          tip: abl.value > 18 ? CONFIG.Hackmaster.WisdomTable[(abl.value + 100)][1] : '',
		        },
		        failure: {
		          value: CONFIG.Hackmaster.WisdomTable[abl.value][2],
		          label: CONFIG.Hackmaster.WisdomTable[0][2]
		        },
		        imm: {
		          value: CONFIG.Hackmaster.WisdomTable[abl.value][3],
		          label: CONFIG.Hackmaster.WisdomTable[0][3],
		          tip: abl.value > 18 ? CONFIG.Hackmaster.WisdomTable[(abl.value + 100)][3] : '',
		        }
		      };
		      abl.magic = CONFIG.Hackmaster.WisdomTable[abl.value][0];
		      abl.bonus = CONFIG.Hackmaster.WisdomTable[abl.value][1];
		      abl.failure = CONFIG.Hackmaster.WisdomTable[abl.value][2];
		      abl.imm = CONFIG.Hackmaster.WisdomTable[abl.value][3];
		      break;

		    case "cha":
		      abl.fields = {
		        max: {
		          value: CONFIG.Hackmaster.CharismaTable[abl.value][0],
		          label: CONFIG.Hackmaster.CharismaTable[0][0]
		        },
		        loyalty: {
		          value: CONFIG.Hackmaster.CharismaTable[abl.value][1],
		          label: CONFIG.Hackmaster.CharismaTable[0][1]
		        },
		        reaction: {
		          value: CONFIG.Hackmaster.CharismaTable[abl.value][2],
		          label: CONFIG.Hackmaster.CharismaTable[0][2]
		        }
		      };
		      abl.max = CONFIG.Hackmaster.CharismaTable[abl.value][0];
		      abl.loyalty = CONFIG.Hackmaster.CharismaTable[abl.value][1];
		      abl.reaction = CONFIG.Hackmaster.CharismaTable[abl.value][2];
		      break;

		    default:
		      break;
		  }
		}
	}
};