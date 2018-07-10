ezCloud.config(['$translateProvider',function ($translateProvider) {
	//console.log("TEST phat nua");
	// $translateProvider.useLoaderCache(true);
	$translateProvider.useUrlLoader("//pms.ezcloudhotel.com/api/Language/Get");
	$translateProvider.useLoader('customLoader', {
	  });
	//$translateProvider.use("en");
	$translateProvider.useLocalStorage();
	$translateProvider.preferredLanguage("vn").fallbackLanguage("en");
	$translateProvider.useMissingTranslationHandler('languageItemMissingFactory');

}]);
var currentLanguage;
ezCloud.controller('languageController',['$scope','$rootScope','$translate', function($scope,$rootScope,$translate) {
	$rootScope.language = $translate.use()?$translate.use():"vn";
    currentLanguage = $rootScope.language;
    
//	console.log($translate.loaderCache);
	$translate.use($rootScope.language);
	$scope.langSwitch = function() {
		if ($rootScope.language == "en"){
			$rootScope.language = "vn";
		} else {
			$rootScope.language = "en";
		}
        console.log("test");
        currentLanguage = $rootScope.language;
		$translate.use($rootScope.language);
		console.log($translate.translations);
	}
    
}]);
ezCloud.factory('customLoader', ['$http', '$q','$localStorage','dialogService',function ($http, $q,$localStorage,dialogService) {
	// return loaderFn
	return function (options) {
		var deferred = $q.defer();
		// do something with $http, $q and key to load localization files
		if ($localStorage["LOADED_LANGUAGE_" + options.key])
		{
			deferred.resolve($localStorage["LOADED_LANGUAGE_" + options.key]);
		}
		$http.get("//pms.ezcloudhotel.com/api/Language/Get?lang=" + options.key).success(
			function(data) {
				if (JSON.stringify($localStorage["LOADED_LANGUAGE_" + options.key]) !== JSON.stringify(data)) {
					$localStorage["LOADED_LANGUAGE_" + options.key] = data;
					//should refresh page
					console.log("Language changed",options.key);
					//  dialogService.toast("NEW_VERSION_IS_UPDATED_PRESS_F5_TO_RELOAD");
					deferred.resolve(data);
				}
			}).error(function() {deferred.reject(options.key)});
		return deferred.promise;
	};
}]);

