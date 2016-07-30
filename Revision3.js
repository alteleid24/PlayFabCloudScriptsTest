handlers.grantGarageToUser = function (args, context) {
	server.GrantCharacterToUser({
		PlayFabId: currentPlayerId,
		CharacterName: "Garage_1",
		CharacterType: "Garage"
	});
}

handlers.deleteUser = function (args, context) {
    var deleteUsersResult = server.DeleteUsers ({
		PlayFabIds: args.PlayFabId,
		TitleId: args.TitleId
    });
}

// args.itemClass // return carParamsKey
handlers.convertToCarParamsKey = function (args, context){
	var key = args.itemClass;
	var convertedKey = key;
	switch (key)
        {
			case "bodykit":
			convertedKey = "tune";
			break
			case "spoiler":
			convertedKey = "spo";
			break
			case "exhaust":
			convertedKey = "exh";
			break
			case "disc14":
			convertedKey = "disc";
			break
			case "disc16":
			convertedKey = "disc";
			break
			case "disc19":
			convertedKey = "disc";
			break
			case "suspensions":
			convertedKey = "shock";
			break
			case "painting":
			convertedKey = "color";
			break
			case "toning":
			convertedKey = "toner";
			break
        }
    return { resultKey: convertedKey };
}

// args.ItemInstanceId
handlers.makeSparePartActive = function (args, context) {
	
	var activeCharacterId = server.GetUserData({
		PlayFabId: currentPlayerId,
		Keys: ["activeCharacter"]
	}).Data["activeCharacter"].Value;
	
	//log.info("activeCharacter = "+activeCharacterId);
	
	var activePartsData = server.GetCharacterData({
		PlayFabId: currentPlayerId,
		CharacterId: activeCharacterId,
		Keys: ["activeParts"]
	}).Data["activeParts"].Value;
	
	var characterInventory = server.GetCharacterInventory({
		PlayFabId: currentPlayerId,
		CharacterId: activeCharacterId
	}).Inventory;
	
	//log.info("activePartsData = "+activePartsData);
	var parsedActiveParts = JSON.parse(activePartsData);
	
	//log.info("parsedActiveParts = "+parsedActiveParts);
	
	var partItem = characterInventory.find((pi) => { return pi.ItemInstanceId == args.ItemInstanceId; });

	var carParamsKey = server.ExecuteCloudScript(
	{
		PlayFabId: currentPlayerId,
		FunctionName: "convertToCarParamsKey",
		FunctionParameter: { itemClass: partItem.ItemClass }
	}).FunctionResult["resultKey"];
	
	//log.info("carParamsKey = "+carParamsKey);
	
	parsedActiveParts[carParamsKey] = args.ItemInstanceId;
	
	// Write
	var updCharacterData server.UpdateCharacterData({
        PlayFabId: currentPlayerId,
		CharacterId: activeCharacterId,
        Data: {
            activeParts: JSON.stringify(parsedActiveParts)
        }
    });
}

// Купил запчасть. args.itemInstanceId
handlers.onPartPurchaseComplete = function (args, context){
	var activeCharacterId = server.GetUserData({
		PlayFabId: currentPlayerId,
		Keys: ["activeCharacter"]
	}).Data["activeCharacter"].Value;
	
	var moveItemResult = server.MoveItemToCharacterFromUser({
		PlayFabId: currentPlayerId,
		CharacterId: activeCharacterId,
		ItemInstanceId: args.itemInstanceId
	});
}

// args.itemInstanceId
handlers.onCarPurchaseComplete = function (args, context){
	var activeCharacterId = server.GetUserData({
		PlayFabId: currentPlayerId,
		Keys: ["activeCharacter"]
	}).Data["activeCharacter"].Value;
	
	var tmpData = { none: "none"};
	var updCharacterData server.UpdateCharacterData({
        PlayFabId: currentPlayerId,
		CharacterId: activeCharacterId,
        Data: { activeParts: JSON.stringify(tmpData) }
    });
	
	var moveItemResult = server.MoveItemToCharacterFromUser({
		PlayFabId: currentPlayerId,
		CharacterId: activeCharacterId,
		ItemInstanceId: args.itemInstanceId
	});
}

// args.characterId
handlers.onGarageSelected = function (args, context){
	var updateData = server.UpdateUserData({
		PlayFabId: currentPlayerId,
		Data: { activeCharacter: args.characterId }
	});
}
