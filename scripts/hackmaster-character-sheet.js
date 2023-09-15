import { ArmorDamageTracker } from './armor-damage-tracker.js';
import { ArmorInfo } from './Modules/armor-info.js';
import { HackmasterActor } from './Modules/hackmaster-actor.js';

export class HackmasterCharacterSheet {
	static initialize(){
		Hooks.on('renderActorSheet', async (sheet) => {
			let hmSheet = new HackmasterCharacterSheet(sheet);
			await hmSheet.insertArmorTrackers();
			await hmSheet.insertComeliness();
			await hmSheet.insertHonor();
			hmSheet.restoreScrollPosition();
		});
	}

	constructor(sheet) {
		this._sheet = sheet;
	}

	get actor(){
		return this._sheet.actor;
	}

	get inventory(){
		return this._sheet.object.system.inventory;
	}

	findElement(selector){
		return this._sheet._element.find(selector);
	}

	getArmors(){
		let armors = this._sheet.object.inventory.filter(i => 
			i.type === "armor" && 
			(i.system.protection.type === "armor" || i.system.protection.type === "shield")
		).map(a => new ArmorInfo(a));
		armors.sort((a, b) => {
			if (a.isEquipped === b.isEquipped){
				return a.name > b.name;
			}
			else {
				return a.isEquipped ? -1 : 1;
			}
		});
		return armors;
	}

	async buildArmorDamageSection(){
		return await renderTemplate("modules/hackmaster-4e/templates/actor-armor-damage-section.hbs");
	}

	async buildHonorSection(){
		let hmActor = new HackmasterActor(this.actor);
		if (hmActor.isNpc){
			let result = {
				honorState: hmActor.rawHonorState, 
			};
			return await renderTemplate("modules/hackmaster-4e/templates/npc-honor-section.hbs", result );

		}
		else{
			let result = {
				honor: hmActor.honor, 
				temp: hmActor.temporaryHonor,
				die: hmActor.getHonorDie(),
				category: hmActor.getHonorStateDescription(),
				isProtegee: hmActor.isProtegee
			};
			return await renderTemplate("modules/hackmaster-4e/templates/pc-honor-section.hbs", result );
		}
	}

	async buildComelinessSection(){
		let hmActor = new HackmasterActor(this.actor);
		let result = {
			comeliness: hmActor.comeliness, 
			comelinessPercent: hmActor.comelinessPercent,
			shortDescription: hmActor.comelinessDescription[0],
			longDescription: hmActor.comelinessDescription[1]
		};
		return await renderTemplate("modules/hackmaster-4e/templates/comeliness-section.hbs", result );
	}

	restoreScrollPosition(){
		if (this._sheet.actorSheetScrollY){
			$('.actor .window-content').scrollTop(this._sheet.actorSheetScrollY);
		}
	}

	saveScrollPosition(){
		this._sheet.actorSheetScrollY = $('.actor .window-content').scrollTop();
	}

	async insertArmorTracker(armor){
		if (armor){
			let armorTrackerSection = this.findElement(".armor-tracker-section");
			let template = await ArmorDamageTracker.buildArmorReport(armor);
			armorTrackerSection.append(template);
			
			var that = this;
			$(`.armor-damage-header-btn[data-item-id=${armor.id}]`).each((i, btn) => {
				btn.addEventListener('click', function(){
					that.saveScrollPosition();
					this.classList.toggle('active-hm');
					armor.toggleFlag("display.collapsedState")
					let content = this.nextElementSibling;
					content.classList.toggle('hidden');
				});
			});

			$(`.armor-tracker[data-item-id=${armor.id}]`).each((i, div) => {
				div.addEventListener('click', async function(ev){
					ev.preventDefault();
					that.saveScrollPosition();
					await armor.damageArmor(1);
				});
				div.addEventListener('contextmenu', async function(ev){
					ev.preventDefault();
					that.saveScrollPosition();
					await armor.damageArmor(-1);
				});
			});
		}
	}

	async insertArmorTrackers(){
		let combatBox = this.findElement(".ability-save-grid");
		let section = await this.buildArmorDamageSection();
		combatBox.append(section);
		await Promise.all(this.getArmors().map(a => this.insertArmorTracker(a)));
	}

	async insertHonor(){
		let abilitySaveGrid = this.findElement(".ability-save-grid .ability-tables tbody").first();

		let section = await this.buildHonorSection();
		abilitySaveGrid.append(section);
	}

	async insertComeliness(){
		let abilitySaveGrid = this.findElement(".ability-save-grid .ability-tables tbody").first();

		let section = await this.buildComelinessSection();
		abilitySaveGrid.append(section);
	}
};
