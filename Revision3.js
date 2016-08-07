handlers.grantGarageToUser = function (args, context) {
	var grantGarage = server.GrantCharacterToUser({
		PlayFabId: currentPlayerId,
		CharacterName: "Garage_1",
		CharacterType: "Garage"
	});
}

// args.VirtualCurrency; args.Amount
handlers.grantSoftMoneyToPlayer = function (args, context) {
	var softMoneyGrant = server.AddUserVirtualCurrency({
		PlayFabId: currentPlayerId,
		VirtualCurrency: args.VirtualCurrency,
		Amount: args.Amount
	});
}

handlers.deleteUser = function (args, context) {
    var deleteUsersResult = server.DeleteUsers ({
		PlayFabIds: args.PlayFabId,
		TitleId: args.TitleId
    });
}

handlers.onNewPlayerCreated = function (args, context){
	var grantGarage = server.GrantCharacterToUser({
		PlayFabId: currentPlayerId,
		CharacterName: "Garage_1",
		CharacterType: "Garage"
	});
	
	var updateData = server.UpdateUserData({
		PlayFabId: currentPlayerId,
		Data: { activeCharacter: grantGarage.CharacterId }
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
	server.UpdateCharacterData({
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

// Купил запчасть. args.itemInstanceId
handlers.onCarBuyed = function (args, context){
	var activeCharacterId = server.GetUserData({
		PlayFabId: currentPlayerId,
		Keys: ["activeCharacter"]
	}).Data["activeCharacter"].Value;
	
	var moveItemResult = server.MoveItemToCharacterFromUser({
		PlayFabId: currentPlayerId,
		CharacterId: activeCharacterId,
		ItemInstanceId: args.itemInstanceId
	});
	
	var updCharData = server.UpdateCharacterData({
		PlayFabId: currentPlayerId,
		CharacterId: activeCharacterId,
		Data: {activeParts: "{\"none\": \"none\"}"}
	});
}

// args.characterId
handlers.onGarageSelected = function (args){
	var updateData = server.UpdateUserData({
		PlayFabId: currentPlayerId,
		Data: { activeCharacter: args.characterId }
	});
}

// args.characterId
handlers.onCarSale = function (args){
	var activeCharacterId = server.GetUserData({
		PlayFabId: currentPlayerId,
		Keys: ["activeCharacter"]
	}).Data["activeCharacter"].Value;
	
	var updCharData = server.UpdateCharacterData({
		PlayFabId: currentPlayerId,
		CharacterId: activeCharacterId,
		Data: {activeParts: "{\"none\": \"none\"}"}
	});
	
	var charInventory = server.GetCharacterInventory({
		PlayFabId: currentPlayerId,
		CharacterId: activeCharacterId
	}).Inventory;
	
	var car = charInventory.find((pi) => { return pi.ItemClass == "car"; });
	var cost = car.UnitPrice/2;
	var softMoneyGrant = server.AddUserVirtualCurrency({
		PlayFabId: currentPlayerId,
		VirtualCurrency: car.UnitCurrency,
		Amount: cost
	});
	
	if(charInventory.length > 0){
		for (var i = charInventory.length-1; i >= 0; i--){
		var revokeItem = server.RevokeInventoryItem({
			PlayFabId: currentPlayerId,
			CharacterId: activeCharacterId,
			ItemInstanceId: charInventory[i].ItemInstanceId
		});
	}
	}
}

// args.Distance; args.NearMiss; args.HighSpeed; args.OpposingLane;
handlers.onLevelCompleted = function (args){
	var awardDistance = args.Distance * 100;
	var awardNearMiss = args.NearMiss * 50;
	var awardHighSpeed = args.HighSpeed * 100;
	var awardOpposingLane = args.OpposingLane * 100;
	
	var awardsAll = awardDistance + awardHighSpeed + awardNearMiss + awardOpposingLane;
	
	var grantMoney = server.grantSoftMoneyToPlayer({
		VirtualCurrency: "SM",
		Amount: awardsAll
	});
}
