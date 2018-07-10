ezCloud.controller('hotelSelectController', ['$scope', '$rootScope', '$state', 'dialogService', '$localStorage', '$http', 'roomListFactory', '$sessionStorage', 'loginFactory', '$mdDialog', '$timeout', 'hotelFactory', 'configFactory', 'commonFactory', 'reportFactory', 'commonFactory', '$locale', function ($scope, $rootScope, $state, dialogService, $localStorage, $http, roomListFactory, $sessionStorage, loginFactory, $mdDialog, $timeout, hotelFactory, configFactory, commonFactory, reportFactory, commonFactory, $locale) {
	$scope.hotelList = [];

	function hotelSelectInit() {
		jQuery(document).unbind('keydown');
		console.log('root:', $rootScope, $localStorage);
		hotelFactory.getHotelList(function (data) {
			$scope.hotelList = data;
			console.log($scope.hotelList);
		});
	}

	hotelSelectInit();
	$scope.goToHome = function (hotel) {
		$localStorage.reLoadTab = true;
		$localStorage.displayGroup = null;
		$localStorage.TimeInOutPrivate = undefined;
		hotelFactory.setCurrentUserDefaultHotelId(hotel.HotelId, function () {
			configFactory.setCurrentHotel({});
			commonFactory.getHotelCommonInformation(function (data) {
				//configFactory.ezHotelBackEndPaymentProcess(data.Hotel);

				var currentHotel = configFactory.getCurrentHotel();
				if (currentHotel.HotelId != null && currentHotel.HotelId != undefined) {
					configFactory.ezHotelBackEndPaymentProcess(currentHotel);
				} else {
					currentHotel.then(function (data) {
						configFactory.ezHotelBackEndPaymentProcess(data);
					})
				}
				var frac = data.Currency !== null ? parseInt(data.Currency.MinorUnit) : 0;
				$locale.NUMBER_FORMATS.PATTERNS[1].maxFrac = frac;
				$locale.NUMBER_FORMATS.PATTERNS[1].minFrac = frac;
				$locale.NUMBER_FORMATS.CURRENCY_SYM = data.Currency !== null ? data.Currency.AlphabeticCode + " " : "VND ";
				$rootScope.decimals = frac;
			});
			$state.transitionTo("dashboard");

		});
	};

	$scope.goToConfig = function (hotel) {
		hotelFactory.setCurrentUserDefaultHotelId(hotel.HotelId, function () {
			$sessionStorage.currentDefaultHotelId = hotel.HotelId;
			configFactory.setCurrentHotel({});
			commonFactory.getHotelCommonInformation(function (data) {
				configFactory.ezHotelBackEndPaymentProcess(data.Hotel);
				var frac = data.Currency !== null ? parseInt(data.Currency.MinorUnit) : 0;
				$locale.NUMBER_FORMATS.PATTERNS[1].maxFrac = frac;
				$locale.NUMBER_FORMATS.PATTERNS[1].minFrac = frac;
				$locale.NUMBER_FORMATS.CURRENCY_SYM = data.Currency !== null ? data.Currency.AlphabeticCode + " " : "VND ";
				$rootScope.decimals = frac;
			});
			$state.transitionTo("configHotelInfo");
		});
	};

	$scope.createHotel = function () {

		dialogService.messageBox('NOT_ALLOW_CREATE_HOTEL');
		//$state.transitionTo("hotelQuickSettings");	


	};
	$scope.hotelComingDue = function (hotel) {
		var result = false;
		if (hotel.IsActive === false) {
			result = false;
		} else {
			var diffDays = $scope.diffDays(new Date(hotel.ExpireDate));
			if (diffDays <= 7) {
				result = true;
			}

		}
		return result;
	};

	$scope.diffDays = function (expireDay) {
		var oneDay = 24 * 60 * 60 * 1000;
		var today = new Date();

		var hotelExpireDate = new Date(expireDay);
		var diffDays = Math.round(Math.abs((today.getTime() - hotelExpireDate.getTime()) / (oneDay)));
		return diffDays;
	};

	$scope.resetData = function (hotel) {
		console.log("HOTEL", hotel);
		var hotelTemp = angular.copy(hotel);
		$mdDialog.show({
				controller: ResetHotelDataDialogController,
				templateUrl: 'views/templates/resetHotelData.tmpl.html',
				parent: angular.element(document.body),
				targetEvent: null,
				clickOutsideToClose: false
			})
			.then(function (resetModel) {
				var ResetHotelModel = {
					HotelId: hotel.HotelId,
					IsDeleteAllConfig: resetModel.IsDeleteAllConfig,
					IsDeleteAllCustomer: resetModel.IsDeleteAllCustomer
				};
				var resetHotelData = loginFactory.securedPostJSON("api/Hotel/ResetHotelData", ResetHotelModel);
				$rootScope.dataLoadingPromise = resetHotelData;
				resetHotelData.success(function (data) {
					dialogService.toast("RESET_HOTEL_DATA_SUCCESSFUL");
					//hotelSelectInit();
					$state.go("dashboard", {
							reload: true
						});
					
				}).error(function (err) {
					if (err.Message) {
						dialogService.messageBox("ERROR", err.Message);
					}
				})

			}, function () {

			});

		function ResetHotelDataDialogController($scope, $mdDialog) {
			function Init() {
				$scope.isDeleteAllConfig = false;
				$scope.isDeleteAllCustomer = false;
			}
			Init();
			$scope.hide = function () {
				$mdDialog.hide();
			};
			$scope.cancel = function () {
				$mdDialog.cancel();
			};

			$scope.processResetHotelData = function () {
				var resetModel = {
					IsDeleteAllConfig: $scope.isDeleteAllConfig,
					IsDeleteAllCustomer: $scope.isDeleteAllCustomer
				};
				$mdDialog.hide(resetModel);
			}

		}
	};


	// $scope.resetData = function (hotel) {
	// 	console.log("HOTEL", hotel);
	// 	var hotelTemp = angular.copy(hotel);
	// 	$mdDialog.show({
	// 			controller: ResetHotelDataDialogController, // khởi tạo
	// 			templateUrl: 'views/templates/resetHotelData.tmpl.html',
	// 			parent: angular.element(document.body),
	// 			targetEvent: null,
	// 			clickOutsideToClose: false
	// 		})
	// 		.then(function (resetModel) {
	// 			// var ResetHotelModel = {
	// 			// 	HotelId: hotel.HotelId,
	// 			// 	IsDeleteAllConfig: resetModel.IsDeleteAllConfig,
	// 			// 	IsDeleteAllCustomer: resetModel.IsDeleteAllCustomer,
	// 			// 	departureFromString: resetModel.departureFromString,
	// 			// 	departureToString: resetModel.departureToString
	// 			// };
	// 			// var resetHotelData = loginFactory.securedPostJSON("api/Hotel/ResetHotelData", ResetHotelModel);
	// 			// $rootScope.dataLoadingPromise = resetHotelData;
	// 			// resetHotelData.success(function (data) {
	// 			// 		dialogService.toast("RESET_HOTEL_DATA_SUCCESSFUL");
	// 			// 		$state.go("dashboard", {
	// 			// 			reload: true
	// 			// 		});

	// 			// 	})
	// 			// 	.error(function (err) {
	// 			// 		if (err.Message) {
	// 			// 			dialogService.messageBox("ERROR", err.Message);
	// 			// 		}
	// 			// 	})
	// 			var ResetHotelDataJobModel = {
	// 				HotelId: hotel.HotelId,
	// 				Actions: (resetModel.IsDeleteAllCustomer == true && resetModel.IsDeleteAllConfig == true) ? "ALL" :
	// 					((resetModel.IsDeleteAllCustomer == true && resetModel.IsDeleteAllConfig != true) ? "CUSTOMER" :
	// 						(resetModel.IsDeleteAllCustomer != true && resetModel.IsDeleteAllConfig == true) ? "CONFIG" : "NONE"),
	// 				Status: false,
	// 				FromDate: resetModel.From,
	// 				ToDate: resetModel.To,
	// 				Progress: 0
	// 			}
	// 			var resetHotelDataJob = loginFactory.securedPostJSON("api/Hotel/AddResetHotelDataJob", ResetHotelDataJobModel);
	// 			$rootScope.dataLoadingPromise = resetHotelDataJob;
	// 			resetHotelDataJob.success(function (data) {
	// 					dialogService.toast("RESET_HOTEL_DATA_SUCCESSFUL");
	// 					$state.go("dashboard", {
	// 						reload: true
	// 					});

	// 				})
	// 				.error(function (err) {
	// 					if (err.Message) {
	// 						dialogService.messageBox("ERROR", err.Message);
	// 					}
	// 				})
	// 		}, function () {

	// 		});

	// 	function ResetHotelDataDialogController($scope, $mdDialog) {
	// 		function Init() {
	// 			$scope.isDeleteAllConfig = false;
	// 			$scope.isDeleteAllCustomer = false;
	// 			$scope.departureFromString = new Date().format('dd/mm/yyyy');
	// 			$scope.departureToString = new Date().format('dd/mm/yyyy');
	// 		}
	// 		Init();
	// 		$scope.hide = function () {
	// 			$mdDialog.hide();
	// 		};
	// 		$scope.DatePickerOption = {
	// 			format: 'dd/mm/yyyy',
	// 		};
	// 		$scope.cancel = function () {
	// 			$mdDialog.cancel();
	// 		};

	// 		$scope.processResetHotelData = function () {
	// 			var fromArr = $scope.departureFromString.split("/");
	// 			var fromDate = new Date(fromArr[2], fromArr[1] - 1, fromArr[0]);

	// 			var toArr = $scope.departureToString.split("/");
	// 			var toDate = new Date(toArr[2], toArr[1] - 1, toArr[0]);
			
	// 			var resetModel = {
	// 				IsDeleteAllConfig: $scope.isDeleteAllConfig,
	// 				IsDeleteAllCustomer: $scope.isDeleteAllCustomer,
	// 				From: fromDate,
	// 				To: toDate
	// 			};
	// 			$mdDialog.hide(resetModel);	
	// 		}
	// 		// ************
	// 		// $scope.addNewSource = function () {
	// 		// 	$mdDialog.show({
	// 		// 		controller: AddDetailResetHotelData,
	// 		// 		templateUrl: 'views/templates/AddDetailResetHotelData.tmpl.html', // chưa tạo
	// 		// 		parent: angular.element(document.body),
	// 		// 		targetEvent: null,
	// 		// 	}).then(function (newSource) {
	// 		// 		if (newSource !== null) {
	// 		// 				var ReservationSource = {
	// 		// 					Source: newSource,
	// 		// 					RRID: $stateParams.reservationRoomId
	// 		// 				};
	// 		// 				newSource.Priority = $scope.sourceList.length;
	// 		// 				var addNewSource = loginFactory.securedPostJSON("api/Hotel/AddResetHotelDataJob", ReservationSource);
	// 		// 				$rootScope.dataLoadingPromise = addNewSource;
	// 		// 				addNewSource.success(function (data) {
	// 		// 					dialogService.toast("ADD_DETAILS_RESET_HOTEL_SUCCESSFUL");
	// 		// 					Init();
	// 		// 				}).error(function (err) {
	// 		// 					dialogService.messageBox("ERROR", err.Message);
	// 		// 				});
	// 		// 		}
	// 		// 	}, function () {});

	// 		// 	function AddDetailResetHotelData($scope, $mdDialog) {
	// 		// 		$scope.newSource = {};
	// 		// 		$scope.hide = function () {
	// 		// 			$mdDialog.hide();
	// 		// 		};
	// 		// 		$scope.cancel = function () {
	// 		// 			$mdDialog.cancel();
	// 		// 		};

	// 		// 		$scope.addNewSource = function () {
	// 		// 			$mdDialog.hide($scope.newSource);
	// 		// 		}
	// 		// 	}
	// 		// };
	// 		//********** */

	// 	}
	// };


}]);