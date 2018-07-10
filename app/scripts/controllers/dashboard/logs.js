ezCloud.controller('logsController', ['$filter', '$scope', '$rootScope', '$mdBottomSheet', 'roomListFactory', 'selectedRoomFactory', '$location', '$state', 'reservationFactory', 'dialogService', 'loginFactory', '$mdDialog', '$localStorage', function ($filter, $scope, $rootScope, $mdBottomSheet, roomListFactory, selectedRoomFactory, $location, $state, reservationFactory, dialogService, loginFactory, $mdDialog, $localStorage) {


	$scope.allOperation = [
									'NOTIFICATION_WHEN_POST_PAYMENT',
									'NOTIFICATION_CHECKEDIN',
									'NOTIFICATION_CHANGE_PRICE',
									'NOTIFICATION_WHEN_DELETE_PAYMENT',
									'NOTIFICATION_WHEN_POST_EXTRASERVICE',
									'NOTIFICATION_WHEN_DELETE_EXTRASERVICE',
									'NOTIFICATION_WHEN_DISCOUNT_ROOM_PRICE',
									'NOTIFICATION_WHEN_CHANGE_ROOM',
									'NOTIFICATION_WHEN_PRE_CHECKOUT',
									'NOTIFICATION_WHEN_PRE_CHECKIN',
									'NOTIFICATION_CHECKOUT',
									'NOTIFICATION_PAST_CHECKOUT',
									'NOTIFICATION_BOOKED',
									'NOTIFICATION_CANCELED',
									'POS_NOTIFICATION_DELETE_INVOICE',
									'POS_NOTIFICATION_ADDNEW_INVOICE',
									'NOTIFICATION_CHANGE_DATE',
									'NOTIFICATION_WHEN_POST_EXTRASERVICE_TRANFERSROOM'
							];


	function Init() {
		var now = new Date();
		now.setHours(0);
		now.setMilliseconds(0);
		now.setMinutes(0);

		$scope.DatePickerOption = {
			format: 'dd/MM/yyyy'
		};
		$scope.str = now.format('dd/mm/yyyy');
		$scope.str2 = new Date(now.setDate(now.getDate() + 1)).format('dd/mm/yyyy');
		var allDataPromise = loginFactory.securedGet("api/AuditTrail/GetAllSearchData");
		$rootScope.dataLoadingPromise = allDataPromise;
		allDataPromise.success(function (data) {
			$scope.allUser = data.allUser;
			$scope.allRoom = data.allRoom;
		}).error(function (err) {
			console.log(err);
		});
		var now2 = new Date();
		var now3 = new Date();
		$scope.search = {
			From: now2,
			To: new Date(now3.setDate(now3.getDate() + 1)),
			UserId: null,
			Operation: "ALL",
			ReservationNumber: null,
			ReservationRoomNumber: null,
			RoomId: 0,
		};
		console.log($scope.search, "leo nguyen");
		var startD = new Date($scope.search.From);
		startD.setHours(0);
		startD.setMilliseconds(0);
		startD.setMinutes(0);
		startD.setSeconds(0);

		var departureD = new Date($scope.search.To);
		departureD.setHours(0);
		departureD.setMilliseconds(0);
		departureD.setMinutes(0);
		departureD.setSeconds(0);

		var request = angular.copy($scope.search);
		request.From = startD.toISOString();
		request.To = departureD.toISOString();

		var searchPromise = loginFactory.securedPostJSON("api/AuditTrail/ProcessSearch", request);
		$rootScope.dataLoadingPromise = searchPromise;
		searchPromise.success(function (data) {
			console.log("SEARCH DATA", data);
		}).error(function (err) {
			console.log("ERR", err);
		})
	}
	Init();
	
	function getValueByName(obj,name){
		for (var index in obj){
			if (obj.hasOwnProperty(index)){
				if (index.toString().indexOf(name) >= 0){
					return obj[index];
					break;
				}
			}
		}
	}
	
	function resolveLogData(data){
		console.log("HERE 2");
		var dataTemp = angular.copy(data);
		var resultList = [];
		for (var key in data){
			if (data.hasOwnProperty(key)){
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
				
				for (var prop in value){
					if (value.hasOwnProperty(prop)){
						if (prop.toString().indexOf("Number") >=0){
							result.Id = value[prop];
							break;
						}
					}
				}
				
				switch(value.Operation){
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
	
	function processSearchAuditLog(){
		console.log("SEARCH", $scope.search);
		if ($scope.search.UserId === ""){
			$scope.search.UserId = null;
		}

		var startD = new Date($scope.search.From);
		startD.setHours(0);
		startD.setMilliseconds(0);
		startD.setMinutes(0);

		var departureD = new Date($scope.search.To);
		departureD.setHours(0);
		departureD.setMilliseconds(0);
		departureD.setMinutes(0);
		departureD.setSeconds(0);

		var request = angular.copy($scope.search);
		request.From = startD.toISOString();
		request.To = departureD.toISOString();


		var searchPromise = loginFactory.securedPostJSON("api/AuditTrail/LogsSearchResult", request);
		$rootScope.dataLoadingPromise = searchPromise;
		searchPromise.success(function(data){
			console.log("SEARCH DATA", data);
			//if (data && data.length > 0){
				console.log("HERE");
				//$scope.logResults = resolveLogData(data);
				$scope.logResults = data.hits;
			//}
			console.log("LOG DATA", $scope.logResults);
			
		}).error(function(err){
			console.log("ERR",err);
		})
	}
	
	$scope.processSearchAuditLog = processSearchAuditLog;
	
}])