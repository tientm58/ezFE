ezCloud.controller('configurationLogsController', ['$filter', '$scope', '$rootScope', '$mdBottomSheet', 'roomListFactory', 'selectedRoomFactory', '$location', '$state', 'reservationFactory', 'dialogService', 'loginFactory', '$mdDialog', '$localStorage', function ($filter, $scope, $rootScope, $mdBottomSheet, roomListFactory, selectedRoomFactory, $location, $state, reservationFactory, dialogService, loginFactory, $mdDialog, $localStorage) {


	$scope.allOperation = [
		'HOTEL_OWNER_INFORMATION',
		'HOTEL_INFORMATION_CHANGE',
		'ROOM_TYPE_CHANGE',
		'ROOM_CHANGE',
		'PRICE_CHANGE',
		'ROOM_REPAIR_CHANGE',
		'EXTRA_SERVICES_CHANGE',
		'STAFF_CHANGE',
		'SYSTEM_CHANGE '
		];

	function Init() {
		$scope.DatePickerOption = {
			format: 'dd/MM/yyyy'
		};
		$scope.str = new Date().format('dd/mm/yyyy');
		$scope.str2 = new Date().format('dd/mm/yyyy');
		var allDataPromise = loginFactory.securedGet("api/AuditTrail/GetAllSearchData");
		$rootScope.dataLoadingPromise = allDataPromise;
		allDataPromise.success(function (data) {
			$scope.allUser = data.allUser;
			$scope.allRoom = data.allRoom;
		}).error(function (err) {
			console.log(err);
		});

		$scope.search = {
			From: new Date(),
			To: new Date(),
			UserId: null,
			Operation: "ALL",
			ReservationNumber: null,
			RoomId: 0

		};

		var searchPromise = loginFactory.securedPostJSON("api/AuditTrail/ProcessSearchConfiguration", $scope.search);
		$rootScope.dataLoadingPromise = searchPromise;
		searchPromise.success(function (data) {
			console.log("SEARCH DATA", data);
		}).error(function (err) {
			console.log("ERR", err);
		})
	}
	Init();

	function getValueByName(obj, name) {
		for (var index in obj) {
			if (obj.hasOwnProperty(index)) {
				if (index.toString().indexOf(name) >= 0) {
					return obj[index];
					break;
				}
			}
		}
	}

	function resolveLogData(data) {
		console.log("HERE 2");
		var dataTemp = angular.copy(data);
		var resultList = [];
		for (var key in data) {
			if (data.hasOwnProperty(key)) {
				var value = data[key];
				console.log("KEY", key);

				var result = {
					Operation: value.Operation,
					ReservationNumber: value.ReservationNumber,
					Guest: value.Guest,
					RoomNo: value.RoomNo,
					User: value.User,
					DateTime: value.DateTime
				}

				for (var prop in value) {
					if (value.hasOwnProperty(prop)) {
						if (prop.toString().indexOf("Number") >= 0) {
							result.Id = value[prop];
							break;
						}
					}
				}

				switch (value.Operation) {
				case "ADD_PAYMENT":
					result.Id = value["paymentNumber"];

				}

				console.log("RESULT", result);

				resultList.push(result);


			}
		}

		//data = resultList;
		return resultList;
	}

	function processSearchAuditLog() {
		console.log("SEARCH", $scope.search);
		if ($scope.search.UserId === "") {
			$scope.search.UserId = null;
		}
		var searchPromise = loginFactory.securedPostJSON("api/AuditTrail/ProcessSearchConfiguration", $scope.search);
		$rootScope.dataLoadingPromise = searchPromise;
		searchPromise.success(function (data) {
			console.log("SEARCH DATA", data);
			//if (data && data.length > 0){
			console.log("HERE");
			//$scope.logResults = resolveLogData(data);
			$scope.logResults = data;
			//}
			console.log("LOG DATA", $scope.logResults);

		}).error(function (err) {
			console.log("ERR", err);
		})
	}

	$scope.processSearchAuditLog = processSearchAuditLog;

}])