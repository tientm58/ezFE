//https://github.com/angular-translate/angular-translate/wiki/Error-Handling
ezCloud.factory('languageItemMissingFactory', ['loginFactory', '$location', '$http', function (loginFactory, $location, $http) {
	var error = {};
	// has to return a function which gets a tranlation id
	return function (translationID) {
		// do something with dep1 and dep2
		//console.log('Missing Item',translationID);
		if (!error[translationID] && translationID.indexOf(" ") == -1) {

			error[translationID] = 1;
			//console.log("Language Item Missing. Code = "+ translationID);
			/*var post = $http({
				//url: "http://ezcloudhotel.com/api/Language/Notify?code=" + translationID,
				url:"http://pms.ezcloudhotel.com/api/Language/Notify?code=" + translationID,
				method: "POST",
				headers: {
					'Url': $location.url(),
					'Content-Type': 'application/json'
				},
				data: JSON.stringify("")
			});*/
		}
	};
}]);