export class Utilities {

    static isObjectOfType(obj, type){
        return Utilities.getObjectType(obj) === type;
    }

    static getObjectType(obj){
        return Object.getPrototypeOf(obj)?.constructor?.name;
    }
    
    static caseInsensitiveReplace(line, word, replaceWith) {
        var regex = new RegExp('(' + word + ')', 'gi');
        return line.replace(regex, replaceWith);
    }

    static countOriginalDiceInRoll(roll){
        if (!roll || !roll.dice){
            return 0;
        }
        return Utilities.sumArray(roll.dice.map(d => d.number));
    }

    static countNumPenetrationsInRoll(roll){
        if (!roll || !roll.dice){
            return 0;
        }

        return Utilities.sumArray(roll.dice.map(d => Math.max(0, d.results.length - d.number)));
    }

    static loadCachedTemplate(path, context){
        return _templateCache[path](context || {}, {allowProtoMethodsByDefault: true, allowProtoPropertiesByDefault: true});
    }

    static displayChatMessage(content, actor, type){
        const sourceSpeaker = ChatMessage.getSpeaker({ actor: actor });
        let chatData = {
            content: content,
            user: game.user.id,
            speaker: sourceSpeaker,
            type: type ?? game.ars.const.CHAT_MESSAGE_TYPES.OTHER,
        };
        ChatMessage.create(chatData);
    }

    static getRandomNumber(min, max){
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static getDieResult(dieFace){
        return this.getRandomNumber(1, dieFace);
    }

    static rollPenetrateInBothDirection(nNumSides){
        let nValue = Utilities.getRandomNumber(1, nNumSides);
        if (nValue == nNumSides){
            nValue = nValue + (Utilities.rollPenetrateInBothDirection(nNumSides) - 1);
        }
        else if (nValue == 1){
            nValue = nValue - (Utilities.rollPenetrateInBothDirection(nNumSides) - 1);
        }
        return nValue;
    }

    static getDiceResult(numDice, dieFace){
        let total = 0;
        for(let i = 0; i < numDice; i++){
            total += Utilities.getRandomNumber(1, dieFace);
        }
        return total;
    }

    static sumArray(array){
        if (array){
            return array.reduce((partialSum, a) => partialSum + a, 0);
        }
        return 0;
    }

    static intersection(array1, array2){
        return array1.filter(value => array2.includes(value));
    }

    static async runAsGM(data = {}) {
        // if GM we skip to the command
        if (game.user.isGM) {
            await Utilities.runGMCommand(data);
        } else {
            // send data to socket and look for GM to run the command for user
            const dataPacket = {
                requestId: randomID(16),
                ...data
            }
            // Emit a socket event
            await game.socket.emit('module.hackmaster-4e', dataPacket);
        }
    }

    static async runGMCommand(data) {   
        const sourceActor = data.sourceActorId ? game.actors.get(data.sourceActorId) : undefined;
        const sourceToken = data.sourceTokenId ? canvas.tokens.get(data.sourceTokenId) : undefined;
        const targetActor = data.targetActorId ? game.actors.get(data.targetActorId) : undefined;
        const targetToken = data.targetTokenId ? canvas.tokens.get(data.targetTokenId) : undefined;
        const targetItemId = data.targetItemId ? data.targetItemId : undefined;
    
        switch (data.operation) {
    
            case 'updateActor':
                if (targetActor && data.update) {
                    await targetActor.update(data.update);
                } else if (targetToken && data.update) {
                    await targetToken.actor.update(data.update);
                }
                break;
            case 'updateItem':
                let itemToUpdate;
                if (targetActor && targetItemId && data.update) {
                    itemToUpdate = await targetActor.getEmbeddedDocument("Item", targetItemId);
                    if (itemToUpdate) itemToUpdate.update(data.update);
                } else if (targetToken && targetItemId && data.update) {
                    itemToUpdate = await targetToken.actor.getEmbeddedDocument("Item", targetItemId);
                    if (itemToUpdate) itemToUpdate.update(data.update);
                }
                break;
            default:
                console.log("utilities.js processGMCommand Unknown asGM/runGMCommand request ", data.operation, { data });
                break;
        };
    }

    static async processGMCommand(data = {}) {
        const activeGMs = game.users.filter((user) => user.isGM && user.active);
        const findGM = activeGMs.length ? activeGMs[0] : null;
        if (!findGM) {
            ui.notifications.error(`No GM connected to process requested command.`);
            console.trace("processGMCommand No GM connected to process requested command.");
        } else
            // check to see if the GM we found is the person we've emit'd to and if so run command.
            if (findGM.id === game.user.id) {
                if (!game.ars.runAsGMRequestIds[data.requestId]) {
   
                    // We do this to make sure the command is only run once if more than 
                    // one GM is on the server
                    game.ars.runAsGMRequestIds[data.requestId] = data.requestId;
    
                    /**
                     * "data" is serialized and deserialized so the type is lost.
                     * Because of that we just exchange IDs when we need protos/etc 
                     * and load them where needed
                     * 
                     */
                    // let source = data.sourceId ? canvas.tokens.get(data.sourceId) : undefined;
                    // let target = data.targetId ? canvas.tokens.get(data.targetId) : undefined;
    
                    // const sourceActor = data.sourceActorId ? game.actors.get(data.sourceActorId) : undefined;
                    // const targetActor = data.targetActorId ? game.actors.get(data.targetActorId) : undefined;
                    // const targetToken = data.targetTokenId ? canvas.tokens.get(data.targetTokenId) : undefined;
    
                    // console.log("utilities.js processGMCommand", { data });
    
                    await Utilities.runGMCommand(data);
                } else {
                    // requestId already processed
                    console.log("utilities.js", "processGMCommand", "Unknown asGM request DUPLICATE ", { data });
                    ui.notifications.error(`Duplicate asGM request command.`, { permanent: true });
                }
            }
    }
}
