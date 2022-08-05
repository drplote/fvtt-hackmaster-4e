import { HackmasterActor } from './hackmaster-actor.js';
import { HackmasterCharacterSheet } from "./hackmaster-character-sheet.js";
import { Hackmaster } from './config.js';
import { HackmasterItem } from "./hackmaster-item.js";
import { ArmorDamageTracker } from './armor-damage-tracker.js';
import { AlwaysHpSupport } from './always-hp-support.js';
import { HackmasterCombatTracker } from './hackmaster-combat-tracker.js';

const MODULE_NAME = "Hackmaster 4th Edition";

function loadHackmasterTemplates(){
  loadTemplates([
    'modules/hackmaster-4e/templates/actor-armor-damage-section.hbs',
    'modules/hackmaster-4e/templates/armor-damage.hbs',
    'modules/hackmaster-4e/templates/item-armor-damage-fields.hbs',
    'modules/hackmaster-4e/templates/always-hp-armor-section.hbs'
  ]);
}

function updateOsricConfig(){
  CONFIG.OSRIC.icons.general.actors['npc'] = 'icons/svg/mystery-man-black.svg';
}

Hooks.once('init', function() {
  console.log(`Initializing "${MODULE_NAME}"`);

  CONFIG.Hackmaster = Hackmaster;

  updateOsricConfig();
  loadHackmasterTemplates();
  HackmasterActor.initialize();
  HackmasterCharacterSheet.initialize();
  HackmasterItem.initialize();
  HackmasterCombatTracker.initialize();
  AlwaysHpSupport.initialize();
});

Hooks.on("aipSetup", (packageConfig) => {
  const api = game.modules.get("autocomplete-inline-properties").API;
  const DATA_MODE = api.CONST.DATA_MODE;

  // Define the config for our package
  const config = {
      packageName: "osric",
      sheetClasses: [
          {
              name: "OSRICItemSheet", // this _must_ be the class name of the `Application` you want it to apply to
              fieldConfigs: [
                  {
                      selector: `input[type="text"]`, // this targets all text input fields on the "details" tab. Any css selector should work here.
                      showButton: true,
                      allowHotkey: true,
                      dataMode: DATA_MODE.OWNING_ACTOR_DATA,
                  },
                  // Add more field configs if necessary
              ]
          },
          {
            name: "OSRICCharacterSheet", // this _must_ be the class name of the `Application` you want it to apply to
            fieldConfigs: [
                {
                    selector: `input[type="text"]`, // this targets all text input fields on the "details" tab. Any css selector should work here.
                    showButton: true,
                    allowHotkey: true,
                    dataMode: DATA_MODE.OWNING_ACTOR_DATA,
                },
                // Add more field configs if necessary
            ]
          },
          {
            name: "OSRICNPCSheet", // this _must_ be the class name of the `Application` you want it to apply to
            fieldConfigs: [
                {
                    selector: `input[type="text"]`, // this targets all text input fields on the "details" tab. Any css selector should work here.
                    showButton: true,
                    allowHotkey: true,
                    dataMode: DATA_MODE.OWNING_ACTOR_DATA,
                },
                // Add more field configs if necessary
            ]
          },
          // Add more sheet classes if necessary
      ]
  };

  // Add our config
  packageConfig.push(config);
});