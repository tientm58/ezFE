ezCloud.factory("hotelFactory", ['$http', 'loginFactory', '$rootScope', '$sessionStorage', '$location', 'dialogService', 'reportFactory', '$localStorage', function ($http, loginFactory, $rootScope, $sessionStorage, $location, dialogService, reportFactory, $localStorage) {

	var hotelList = [];
	var currentUserDefaultHotelId;
	return {
		hotelList: function () {
			return hotelList;
		},

		currentUserDefaultHotelId: function () {
			return currentUserDefaultHotelId;
		},

		getHotelList: function (callback) {
			var getHotelList = loginFactory.securedGet("api/Hotel/GetHotelList");
			$rootScope.dataLoadingPromise = getHotelList;
			getHotelList.success(function (data) {
				hotelList = data;
				if (callback)
					callback(data);
			}).error(function (err) {
				dialogService.messageBox("ERROR", err);
			});
		},
        getHotelTimeInOutPrivate: function () {
			var getHotelTimeInOutPrivate = loginFactory.securedGet("api/Hotel/TimeInOutPrivate");
			$rootScope.dataLoadingPromise = getHotelTimeInOutPrivate;
			getHotelTimeInOutPrivate.success(function (data) {
				if(data.UseTimeInOutPrivate){
                   $localStorage.TimeInOutPrivate={
                       UseTimeInOutPrivate:data.UseTimeInOutPrivate,
                       TimeInPrivate:data.TimeInPrivate,
                       TimeOutPrivate:data.TimeOutPrivate
                   };
               }else{
                   $localStorage.TimeInOutPrivate={
                       UseTimeInOutPrivate:data.UseTimeInOutPrivate,
                       TimeInPrivate:data.TimeInPrivate,
                       TimeOutPrivate:data.TimeOutPrivate
                   };
               }
            }).error(function (err) {
				dialogService.messageBox("ERROR", err);
			});
		},

		setCurrentUserDefaultHotelId: function (hotelId, callback) {
			var setCurrentUserDefaultHotelId = loginFactory.securedPost("api/Hotel/SetCurrentUserDefaultHotelId?hotelId=" + hotelId);
			setCurrentUserDefaultHotelId.success(function (data) {
				currentUserDefaultHotelId = hotelId;
				$localStorage.lastLogin.hotelId = hotelId;
				reportFactory.CheckReport();
				if (callback) callback();
			});

		},

		setCurrentHotelDefaultCurrency: function (hotelId, callback) {
			commonFactory.getHotelCommonInformation(function (data) {
				console.log("DEFAULT CURRENCY", data.Currency);
				var frac = data.Currency !== null ? parseInt(data.Currency.MinorUnit) : 0;
				$locale.NUMBER_FORMATS.PATTERNS[1].maxFrac = frac;
				$locale.NUMBER_FORMATS.PATTERNS[1].minFrac = frac;
				$locale.NUMBER_FORMATS.CURRENCY_SYM = data.Currency !== null ? data.Currency.AlphabeticCode + " " : "VND ";

			});

		},


	};

}]);