ezCloud.factory("commonFactory", ['$http', 'loginFactory', '$rootScope', '$filter', 'roomListFactory', '$log', function ($http, loginFactory, $rootScope, $filter, roomListFactory, $log) {

	var countries = [];
	var reservationRoom = [];
	var roomTypes = {};
	var hotelSizes = [];
	var languageList = [];
	var hotelSettings = {};
	var currencyList = [];

	var common = {
		clearCache: function () {
			countries = [];
			HotelIndexData = [];
			reservationRoom = [];
			roomTypes = {};
			hotelSizes = [];
			languageList = [];
			hotelSettings = {};
			roomListFactory.clearCache();
		},
		getHotelSettings: function (callback) {
			if (hotelSettings.StatusColors) {
				callback(hotelSettings);
			} else {
				common.getHotelCommonInformation(callback);
			}
		},
		getCountryList: function () {
			console.log('vao getCountryList:');
			return countries; 
		}, 		
		getHotelSizes: function () {
			return hotelSizes;
		},
		updateCountryList: function () {
			console.log('vao updateCountryList:');
			return $http.get(loginFactory.getApiUrl() + "api/Common/CountryList");
		},
		processCountryList: function (data) {

			countries = data;
		},
		getHotelSizeList: function (callback) {
			var getHotelSizeList = loginFactory.normalGet("api/Common/HotelSizeList");
			$rootScope.dataLoadingPromise = getHotelSizeList;
			getHotelSizeList.success(function (data) {
				hotelSizes = data;
				if (callback)
					callback(data);
			});
		},
		getLanguageList: function (callback) {
			var getLanguageList = loginFactory.securedGet("api/Common/LanguageList");
			$rootScope.dataLoadingPromise = getLanguageList;
			getLanguageList.success(function (data) {
				languageList = data;
				if (callback)
					callback(data);
			});
		},
		getCurrentcyList: function (callback) {
			var getCurrentcyList = loginFactory.securedGet("api/Common/CurrencyList");
			$rootScope.dataLoadingPromise = getCurrentcyList;
			getCurrentcyList.success(function (data) {
				currencyList = data;
				if (callback)
					callback(data);
			});
		},
		getHotelCommonInformation: function (callback) {
			//call it when application starts and user signs in/switches hotel
			var settingPromise = loginFactory.securedGet("api/Hotel/Settings");
			if (settingPromise)
				settingPromise.success(function (data) { 
					if (data!=null && data.Hotel!=null)
					{
						$rootScope.Settings = data.StatusColors;
						if (data.Hotel.HotelLogoUrl)
							data.Hotel.HotelLogoUrl = apiUrl + data.Hotel.HotelLogoUrl;
						var StatusColors = {};
						for (var idx in data.StatusColors) {
							StatusColors[data.StatusColors[idx].StatusCode] = data.StatusColors[idx];
						}
						data.StatusColors = StatusColors;
						hotelSettings = data;
						if (callback)
							callback(data);

						var cms = "";
						var be = "";
						for(var i = 0; i< data.EzModulesActive.length; i++){
							var code = data.EzModulesActive[i].ModuleCode;
							switch(code){
								case 'CMSTAAH':
									cms = code;
									break;
								case 'CMBOOKLOGIC':
									cms = code;
									break;
								case 'CMSITEMINDER':
									cms = code;
									break;	
								case 'BE':
								be = 'BE';
									break;
							}
							if(cms != "" && be != "") break;
						}
						
						$rootScope.dataCMS = cms == null ? 'CMSTAAH' : cms;
						$rootScope.dataBE = be;
						$rootScope.CurrencyMaster = data.Currency;
						$rootScope.Supporter = data.EzSupport;
						$rootScope.Connectivities = _.findWhere(data.connectivities, {
							isUsed: true
						});
						$rootScope.EzModulesActive = data.EzModulesActive;

						var PassportModule = _.filter(data.EzModulesActive,function(item){
							return item.ModuleCode === "PASSPORT";
						});
						if (PassportModule != null && PassportModule.length > 0) {
							IsActivePassPortModule = true;
						}
						else{
							IsActivePassPortModule = false;
						}
						console.log("IsActivePassPortModule sau update",IsActivePassPortModule);
					}
				});
		}
	};
	return common;

}]);