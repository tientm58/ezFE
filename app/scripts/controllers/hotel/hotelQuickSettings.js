'use strict'
ezCloud.controller('hotelQuickSettingsController', ['$scope', '$rootScope', '$state', 'dialogService', '$localStorage', '$http', 'roomListFactory', 'WizardHandler', '$sessionStorage', 'loginFactory', 'commonFactory', '$filter', 'hotelFactory', 'configFactory', '$locale', function ($scope, $rootScope, $state, dialogService, $localStorage, $http, roomListFactory, WizardHandler, $sessionStorage, loginFactory, commonFactory, $filter, hotelFactory, configFactory, $locale) {

	$rootScope.title = "QUICK SETTINGS";

	var self = this;

	function GetUserTimeZoneID() {
		var timezone = String(new Date());
		return timezone.substring(timezone.lastIndexOf('(') + 1).replace(')', '').trim();
	}

	var timezone = GetUserTimeZoneID();

	$scope.hotelQuickSettingsData = {
		HotelName: null,
		HotelAddress: null,
		HotelEmail: null,
		HotelPhone: null,
		HotelFloorNum: null,
		HotelRoomNumPerFloor: null,
		HotelRoomDefaultPrice: null,
		ezCloudSubDomain: null,
		HotelDomain: null,
		HotelWebsite: null,
		HotelLogoUrl: null,
		HotelSizeId: null,
		isActive: true,
		TimeZoneId: "SE Asia Standard Time",
		EzMarketId: 1,
		//TimeZoneOffset: -(new Date().getTimezoneOffset()),
		CurrencyId: null,
		SalesId: null
	};

	function hotelQuickSettingsInit() {
		console.log($rootScope.decimals,"currenctyId");
		$scope.decimal = $rootScope.decimals;
		commonFactory.getHotelSizeList(function (data) {
			$scope.hotelSizeList = data;
		});
		/*commonFactory.getCurrentcyList(function (data) {
			$scope.currencyList = data;
		});
*/
		var getDemoHotelSystemInfo = loginFactory.securedPostJSON("api/Hotel/SystemInfo", "");
		getDemoHotelSystemInfo.success(function (data) {
			$scope.TimeZones = data.TimeZones;
			$scope.EzMarkets = data.EzMarket;
			$scope.currencyList = data.Currencies;
			$scope.Sales = data.Sales;
		}).error(function (err) {
			console.log(err);
		});
		$scope.imageUrl = null;
	}
	hotelQuickSettingsInit();
	$scope.filterValue = function ($event) {
		if (isNaN(String.fromCharCode($event.keyCode))) {
			$event.preventDefault();
		}
	};
	$scope.hotelLogoUrl = apiUrl + $scope.imageUrl;
	$scope.disableSaveBtn = false;
	$scope.saveHotel = function () {
		$scope.disableSaveBtn = true;
		console.log($scope.disableSaveBtn);
		var quickSettings = loginFactory.securedPostJSON("api/Hotel/HotelQuickSettings", $scope.hotelQuickSettingsData);
		$rootScope.dataLoadingPromise = quickSettings;
		quickSettings.success(function (data) {
			console.log(data);
			//$state.transitionTo("hotelSelect");
			dialogService.toast("CREATE_HOTEL_SUCCESSFUL");
			hotelFactory.setCurrentUserDefaultHotelId(data.HotelId, function () {
				//$localStorage.currentHotelId = hotel.HotelId;
				configFactory.setCurrentHotel({});
				commonFactory.getHotelCommonInformation(function (data) {
					console.log("DEFAULT CURRENCY", data.Currency);
					var frac = data.Currency !== null ? parseInt(data.Currency.MinorUnit) : 0;
					$locale.NUMBER_FORMATS.PATTERNS[1].maxFrac = frac;
					$locale.NUMBER_FORMATS.PATTERNS[1].minFrac = frac;
					$locale.NUMBER_FORMATS.CURRENCY_SYM = data.Currency !== null ? data.Currency.AlphabeticCode + " " : "VND ";
					$rootScope.decimals = frac;
				});
				$state.transitionTo("dashboard");
			});
		}).error(function (err) {
			var errors = [];
			for (var key in err.ModelState) {
				for (var i = 0; i < err.ModelState[key].length; i++) {
					errors.push(err.ModelState[key][i]);
				}
			}
			var errStr = $filter('translate')(err.ModelState["Message"].toString());
			dialogService.messageBox("ERROS", errStr);
		});

	};

	$scope.max = 30;
	$scope.selectedIndex = 0;
	$scope.hotelDefaultCurrency = null;
	$scope.hotelDefaultTimeZone = null;
	$scope.nextTab = function () {
		if ($scope.hotelQuickSettingsData.CurrencyId !== null) {
			$scope.hotelDefaultCurrency = _.filter($scope.currencyList, function (item) {
				return (item.CurrencyId == $scope.hotelQuickSettingsData.CurrencyId);
			})[0];
		}
		if ($scope.hotelQuickSettingsData.TimeZoneId !== null) {
			$scope.hotelDefaultTimeZone = _.filter($scope.TimeZones, function (item) {
				return (item.Id == $scope.hotelQuickSettingsData.TimeZoneId);
			})[0];
		}
		var index = ($scope.selectedIndex == $scope.max) ? 0 : $scope.selectedIndex + 1;
		$scope.selectedIndex = index;
	};


	$scope.headers = {
		'Authorization': 'Bearer ' + loginFactory.getSession().access_token
	};
	$scope.upload_success = function (url) {
		url = JSON.parse(url);
		console.log("Done", url.serverPath);
		console.log("Done", url);
		$scope.hotelQuickSettingsData.HotelLogoUrl = url.serverPath;
		$scope.imageUrl = url.url;
	};

	$scope.removeLogo = function (ev) {
		$scope.imageUrl = null;
		$scope.hotelQuickSettingsData.HotelLogoUrl = null;
		ev.preventDefault();
		console.log("IMAGE", $scope.imageUrl);
	}
	$scope.upload_error = function (message, flow) {
		var message = JSON.parse(message).Message;
		dialogService.toast(message);
	} 


}]);