ezCloud.controller('arrivalListController', ['$scope', '$rootScope', '$state', 'SharedFeaturesFactory', 'dialogService', '$localStorage', '$http', '$sessionStorage', 'loginFactory', '$mdDialog', 'flowFactory', '$filter', '$log', '$mdSidenav', '$mdMedia', 'configFactory', '$q', '$location', 'roomListFactory', 'frontOfficeFactory', '$timeout','$window',
function ($scope, $rootScope, $state, SharedFeaturesFactory, dialogService, $localStorage, $http, $sessionStorage, loginFactory, $mdDialog, flowFactory, $filter, $log, $mdSidenav, $mdMedia, configFactory, $q, $location, roomListFactory, frontOfficeFactory, $timeout,$window) {
		
		$scope.bookingStatusMapping = {
			BOOKED: "ic_event_available_24px.svg",
			CHECKIN: "ic_local_hotel_24px.svg",
			OVERDUE: "ic_restore_24px.svg",
			AVAILABLE: "ic_check_circle_24px.svg",
			NOSHOW: "ic_event_busy_24px.svg"
		};

		$scope.houseStatusMapping = {
			DIRTY: "ic_report_problem_24px.svg",
			REPAIR: "ic_format_paint_24px.svg",
		}
		$scope.minDate = new Date();

		$scope.currentPage = 0;
		$scope.pageSize = 10;
		$scope.totalRecord = 0;

		$scope.numberOfPages = function () {
			return Math.ceil($scope.totalRecord / $scope.pageSize);
		}

		$scope.resetCurrentPage = function () {
			$scope.currentPage = 0;
		}

		function addDays(date, days) {
			var result = new Date(date);
			result.setDate(result.getDate() + days);
			return result;
		}

		function Init() {
			jQuery(document).unbind('keydown');
			$scope.DatePickerOption = {
				format: 'dd/MM/yyyy'
			};
			//$scope.fromString = kendo.toString(new Date(), "MM/dd/yyyy");
			$scope.fromString = new Date().format('dd/mm/yyyy');
			$scope.toString = addDays(new Date(), 1).format('dd/mm/yyyy');
			//$scope.toString = kendo.toString(new Date(), "MM/dd/yyyy");
			$scope.search = {
				ReservationRoomId: null,
				SearchType: "ARRIVAL_LIST",
				RoomTypeId: 0,
				RoomId: 0,
				From: new Date(),
				To: addDays(new Date(), 1),
				SkipRecord: 0
			}

			frontOfficeFactory.getSearchInformation(function (data) {
				$scope.roomTypes = data.roomTypes;
				for (var index in $scope.roomTypes) {
					if ($scope.roomTypes[index] !== null && $scope.roomTypes[index].RoomTypeName === "STANDARD_ROOM") {
						$scope.roomTypes[index].RoomTypeName = $filter("translate")($scope.roomTypes[index].RoomTypeName)
					}
				}

				$scope.rooms = data.rooms;
				console.log($scope.roomTypes);
			});

			$scope.searchResult = [];

			frontOfficeFactory.processSearch($scope.search, function (data) {
				console.log("SEARCH RESULT", data);
				$scope.searchResult = null;
				$scope.searchResult = data;
				$scope.totalRecord = data.totalRecord;
			});
		}
		Init();



		$scope.$watchCollection('search', function (newValues, oldValues) {

			if (newValues.From !== oldValues.From && newValues.From > oldValues.To) {
				console.log("GET THERE 2");
				newValues.To = addDays(newValues.From, 1);
			}
		});

		$scope.openMenu = function ($mdOpenMenu, ev) {
			originatorEv = ev;
			$mdOpenMenu(ev);
		};

		$scope.updateRoom = function () {
			$scope.search.RoomId = 0;
		}

		$scope.updateRoomType = function () {
			//$scope.search.RoomId = 0;
			console.log("GET THERE");
			var roomTemp;
			if ($scope.search.RoomId > 0) {
				for (var index in $scope.rooms) {
					if ($scope.rooms[index].RoomId.toString() === $scope.search.RoomId.toString()) {
						roomTemp = $scope.rooms[index];
						$scope.search.RoomTypeId = roomTemp.RoomTypeId;
						break;
					}
				}
			}
		}

		var Search = function () {
			/*if ($scope.search.From > $scope.search.To) {
			    dialogService.messageBox("INVALID_FROM/TO_DATE", "PLEASE_SELECT_A_VALID_DATE_TO_PERFORM_SEARCH_ACTION");
			    return;
			}*/
			if ($scope.search.From && $scope.search.To && $scope.search.From > $scope.search.To) {
				dialogService.messageBox("INVALID_FROM/TO_DATE", "PLEASE_SELECT_A_VALID_DATE_TO_PERFORM_SEARCH_ACTION");
				return;
			}

			if (($scope.search.From === null && $scope.fromString !== '') || ($scope.search.To === null && $scope.toString !== '')) {
				dialogService.messageBox("INVALID_FROM/TO_DATE", "PLEASE_SELECT_A_VALID_DATE_TO_PERFORM_SEARCH_ACTION");
				return;
			}

			$scope.search.SkipRecord = 0;
			$scope.currentPage = 0;
			frontOfficeFactory.processSearch($scope.search, function (data) {
				console.log("SEARCH RESULT", data);
				$scope.searchResult = null;
				$scope.searchResult = data;
				$scope.totalRecord = data.totalRecord;
			});
		}


		$scope.processSearch = Search;

		//Menu Items Process
		$scope.menuItemClick = function (item, result) {
			if (item.url) {
				$location.path(item.url);
			}
			if (item.name === 'CLEAN') {
				var el = document.getElementById('search');
				frontOfficeFactory.processClean(result, el);
			}
			
			if (item.name === 'SET_ROOM_DIRTY') {
				var el = document.getElementById('search');
				frontOfficeFactory.processDirty(result, el);
			}
			
			if (item.name === 'CANCEL') {
				var el = document.getElementById('search');
				frontOfficeFactory.processCancel($scope.searchResult, result, el);
			}
			
			if (item.name === 'AMEND_STAY') {
				var reservationRoom = result;
				if (reservationRoom) {                
					reservationRoom.ArrivalDate = new Date(reservationRoom.ArrivalDate);
					reservationRoom.DepartureDate = new Date(reservationRoom.DepartureDate);
					SharedFeaturesFactory.processAmendStay(reservationRoom);
				}
			}
			
			if (item.name === 'CHECKIN') {
				var el = document.getElementById('search');
				frontOfficeFactory.processCheckIn(item, result, el);
			}
			
			if (item.name === 'ROOM_MOVE') {
				var el = document.getElementById('search');
				frontOfficeFactory.processRoomMove(item, result, el);
			}
			
			if (item.name === 'ASSIGN_ROOM') {
				var el = document.getElementById('search');
				frontOfficeFactory.processAssignRoom(item, result, el);
			}
			
			if (item.name === 'UNASSIGN_ROOM') {
				var el = document.getElementById('search');
				frontOfficeFactory.processUnassignRoom(item, result, el);
			}
			
			if (item.name === 'COPY') {
				var el = document.getElementById('search');
				frontOfficeFactory.processCopyRR(item, result, el);
			}
			// //done
			// if (item.name === 'CLEAN') {
			// 	var reservationRoom = result;
			// 	if (reservationRoom) {           
			// 		SharedFeaturesFactory.processClean(reservationRoom, function(){
			// 			$state.go($state.current, {}, {
			// 				reload: true
			// 			});
			// 		});
			// 	}
			// }
			// //done
			// if (item.name === 'SET_ROOM_DIRTY') {
			// 	var reservationRoom = result;
			// 	if (reservationRoom) {           
			// 		SharedFeaturesFactory.processSetDirtyRoom(reservationRoom, function(){
			// 			$state.go($state.current, {}, {
			// 				reload: true
			// 			});
			// 		});
			// 	}
			// }
			// //done
			// if (item.name === 'CANCEL') {
			// 	var reservationRoom = result;
			// 	if (reservationRoom) {           
			// 		if(!reservationRoom.reservationRoom) reservationRoom.reservationRoom = reservationRoom;
			// 		SharedFeaturesFactory.processCancel(reservationRoom);
			// 	}
			// }
			// //done
			// if (item.name === 'AMEND_STAY') {
			// 	var reservationRoom = result;
			// 	if (reservationRoom) {                
			// 		reservationRoom.ArrivalDate = new Date(reservationRoom.ArrivalDate);
			// 		reservationRoom.DepartureDate = new Date(reservationRoom.DepartureDate);
			// 		SharedFeaturesFactory.processAmendStay(reservationRoom);
			// 	}
			// }
			// //in-progress
			// if (item.name === 'CHECKIN') {
			// 	var el = document.getElementById('search');
			// 	frontOfficeFactory.processCheckIn($scope.searchResult, item, result, el);
			// }
			// //done
			// if (item.name === 'ROOM_MOVE') {
			// 	var reservationRoom = result;
			// 	if (reservationRoom) {
			// 		reservationRoom.ArrivalDate = new Date(reservationRoom.ArrivalDate);
			// 		reservationRoom.DepartureDate = new Date(reservationRoom.DepartureDate);
			// 		if(!reservationRoom.roomType) reservationRoom.roomType = reservationRoom.RoomTypes;
			// 		if(!reservationRoom.reservationRoom) reservationRoom.reservationRoom = reservationRoom;
			// 		SharedFeaturesFactory.processRoomMove(reservationRoom);
			// 	};
			// }
			// //done
			// if (item.name === 'ASSIGN_ROOM') {
			// 	var reservationRoom = result;
			// 	if (reservationRoom) {
			// 		SharedFeaturesFactory.processAssignRoom(reservationRoom);
			// 	};
			// }
			// //done
			// if (item.name === 'UNASSIGN_ROOM') {
			// 	var reservationRoom = result;
			// 	if (reservationRoom) {
			// 		SharedFeaturesFactory.processUnassignRoom(reservationRoom);
			// 	};
			// }
			// //done
			// if (item.name === 'COPY'){
			// 	var reservationRoom = result;
			// 	if (reservationRoom) {                
			// 		reservationRoom.ArrivalDate = new Date(reservationRoom.ArrivalDate);
			// 		reservationRoom.DepartureDate = new Date(reservationRoom.DepartureDate);
			// 		if(!reservationRoom.roomType) reservationRoom.roomType = reservationRoom.RoomTypes;
			// 		if(!reservationRoom.reservationRoom) reservationRoom.reservationRoom = reservationRoom;
			// 		SharedFeaturesFactory.processCopyReservation(reservationRoom);
			// 	}
			// }
		}

		function ShowArrivalDetailDialogController($scope, $mdDialog, arrivalDetail) {

			$scope.cancel = function () {
				//angular.copy(initial, $scope.roomTypeEditing);
				$mdDialog.cancel();
			};

			$scope.arrivalDetail = arrivalDetail;
			console.log("ROOM DETAIL", $scope.arrivalDetail);
		}

		$scope.showArrivalDetail = function (result, event) {
			var resultTemp = angular.copy(result);
			 var useFullScreen = $mdMedia('xs');
			console.log("RESULT_TEMP", resultTemp);
			$mdDialog.show({
				controller: ShowArrivalDetailDialogController,
				resolve: {
					arrivalDetail: function () {
						return resultTemp;
					}
				},
				templateUrl: 'views/templates/showArrivalDetail.tmpl.html',
				parent: angular.element(document.body),
				targetEvent: event,
			 	fullscreen: useFullScreen
			})
		}

		$scope.moreCustomer = function(status){
			if(status == 1){
				$scope.currentPage=$scope.currentPage+1;
				$scope.search.SkipRecord += 10;				
			}
			if(status == 2){
				$scope.currentPage=$scope.currentPage-1;
				$scope.search.SkipRecord += -10;				
			}
			console.log('tuyendao', $scope.search);
			frontOfficeFactory.processSearch($scope.search, function (data) {
				console.log("SEARCH RESULT", data);				
				$scope.searchResult = data;				
			});
		}
}]);