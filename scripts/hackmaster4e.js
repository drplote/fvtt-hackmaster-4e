import { ARSActorOverrides } from './Overrides/actor-overrides.js';
import { HackmasterCharacterSheet } from "./hackmaster-character-sheet.js";
import { HackmasterItemSheet } from './hackmaster-item-sheet.js';
import { Hackmaster } from './config.js';
import { AlwaysHpSupport } from './always-hp-support.js';
import { ARSCombatTrackerOverrides } from './Overrides/combat-tracker-overrides.js';
import { ARSCombatOverrides } from './Overrides/combat-overrides.js';
import { HackmasterChatCommands } from './Modules/hackmaster-chat-commands.js';
import { Utilities } from './utilities.js';
import { HackmasterSettings } from './Modules/hackmaster-settings.js';

const MODULE_NAME = "Hackmaster 4th Edition";

function loadHackmasterTemplates(){
  console.log("pre-loading HM4 templates - start");
  loadTemplates([
    'modules/hackmaster-4e/templates/actor-armor-damage-section.hbs',
    'modules/hackmaster-4e/templates/armor-damage.hbs',
    'modules/hackmaster-4e/templates/item-armor-damage-fields.hbs',
    'modules/hackmaster-4e/templates/always-hp-armor-section.hbs',
    'modules/hackmaster-4e/templates/pc-honor-section.hbs',
    'modules/hackmaster-4e/templates/npc-honor-section.hbs',
    'modules/hackmaster-4e/templates/crit-chat-card.hbs',
    'modules/hackmaster-4e/templates/armor-damage-card.hbs',
    'modules/hackmaster-4e/templates/top-check-card.hbs',
    'modules/hackmaster-4e/templates/weapon-damage-section.hbs',
    'modules/hackmaster-4e/templates/comeliness-section.hbs',
    'modules/hackmaster-4e/templates/fumble-chat-card.hbs',
    'modules/hackmaster-4e/templates/mishap-chat-card.hbs',
    'modules/hackmaster-4e/templates/quirk-flaw-chat-card.hbs'
  ]);
  console.log("pre-loading HM4 templates - finish");
}

function listenForGmCommands(){
  game.socket.on('module.hackmaster-4e', (data) => {
    Utilities.processGMCommand(data);
  });
}

function updateARSConfig(){
  CONFIG.ARS.icons.general.actors['npc'] = 'icons/svg/mystery-man-black.svg';
}

Hooks.once('ready', function(){
  loadHackmasterTemplates();
  if (game.user.isGM){
    listenForGmCommands();
  }
});

Hooks.once('init', function() {
  console.log(`Initializing "${MODULE_NAME}"`);

  CONFIG.Hackmaster = Hackmaster;

  updateARSConfig();
  ARSActorOverrides.initialize();
  HackmasterCharacterSheet.initialize();
  ARSCombatTrackerOverrides.initialize();
  AlwaysHpSupport.initialize();
  ARSCombatOverrides.initialize();
  HackmasterChatCommands.initialize();
  HackmasterItemSheet.initialize();
  HackmasterSettings.initialize();
  console.log(`Finished initializing "${MODULE_NAME}`);
});

// Hooks.on("aipSetup", (packageConfig) => {
//   const api = game.modules.get("autocomplete-inline-properties").API;
//   const DATA_MODE = api.CONST.DATA_MODE;

//   // Define the config for our package
//   const config = {
//       packageName: "ARS",
//       sheetClasses: [
//           {
//               name: "ARSItemSheet", // this _must_ be the class name of the `Application` you want it to apply to
//               fieldConfigs: [
//                   {
//                       selector: `input[type="text"]`, // this targets all text input fields on the "details" tab. Any css selector should work here.
//                       showButton: true,
//                       allowHotkey: true,
//                       dataMode: DATA_MODE.OWNING_ACTOR_DATA,
//                   },
//                   // Add more field configs if necessary
//               ]
//           },
//           {
//             name: "ARSCharacterSheet", // this _must_ be the class name of the `Application` you want it to apply to
//             fieldConfigs: [
//                 {
//                     selector: `input[type="text"]`, // this targets all text input fields on the "details" tab. Any css selector should work here.
//                     showButton: true,
//                     allowHotkey: true,
//                     dataMode: DATA_MODE.OWNING_ACTOR_DATA,
//                 },
//                 // Add more field configs if necessary
//             ]
//           },
//           {
//             name: "ARSNPCSheet", // this _must_ be the class name of the `Application` you want it to apply to
//             fieldConfigs: [
//                 {
//                     selector: `input[type="text"]`, // this targets all text input fields on the "details" tab. Any css selector should work here.
//                     showButton: true,
//                     allowHotkey: true,
//                     dataMode: DATA_MODE.OWNING_ACTOR_DATA,
//                 },
//                 // Add more field configs if necessary
//             ]
//           },
//           // Add more sheet classes if necessary
//       ]
//   };

//   // Add our config
//   packageConfig.push(config);
// });
