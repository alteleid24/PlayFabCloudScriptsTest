handlers.grantGarageToUser = function (args, context) {
	
	server.GrantCharacterToUser(
	{
		PlayFabId: currentPlayerId,
		CharacterName: "Garage_1",
		CharacterType: "Garage"
	}
	);
}

handlers.deleteUser = function (args, context) {
    
    var deleteUsersResult = server.DeleteUsers (
        {
        	PlayFabIds: args.PlayFabId,
		TitleId: args.TitleId
        }
    );
}

// args.ItemInstanceId
handlers.makeSparePartActive = function (args, context) {
	
	var activeCharacterId = server.GetUserData({
		PlayFabId: currentPlayerId,
		Keys: ["activeCharacter"]
	}).Data["activeCharacter"].Value;
	
	log.info("activeCharacter = "+activeCharacterId);
	
	var activePartsData = server.GetCharacterData({
		PlayFabId: currentPlayerId,
		CharacterId: activeCharacterId,
		Keys: ["activeParts"]
	}).Data["activeParts"].Value;
	
	var characterInventory = server.GetCharacterInventory({
		PlayFabId: currentPlayerId,
		CharacterId: activeCharacterId
	}).Inventory;
	
	log.info("activePartsData = "+activePartsData);
	var parsedActiveParts = JSON.parse(activePartsData);
	
	log.info("parsedActiveParts = "+parsedActiveParts);
	
	var partItem = characterInventory.find((pi) => { return pi.ItemInstanceId == args.ItemInstanceId; });
	
	parsedActiveParts[partItem.ItemClass] = args.ItemInstanceId;
	
	// Write
	server.UpdateCharacterData({
        PlayFabId: currentPlayerId,
		CharacterId: activeCharacterId,
        Data: {
            activeParts: JSON.stringify(parsedActiveParts)
        }
    });
}
