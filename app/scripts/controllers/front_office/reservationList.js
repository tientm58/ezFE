ezCloud.controller('reservationListController', ['$scope', '$rootScope', '$state', 'SharedFeaturesFactory', 'dialogService', '$localStorage', '$http', '$sessionStorage', 'loginFactory', '$mdDialog', 'flowFactory', '$filter', '$mdSidenav', '$mdMedia', 'configFactory', '$q', '$location', '$log', 'roomListFactory', 'frontOfficeFactory', '$timeout','$route','$window',
function ($scope, $rootScope, $state, SharedFeaturesFactory, dialogService, $localStorage, $http, $sessionStorage, loginFactory, $mdDialog, flowFactory, $filter, $mdSidenav, $mdMedia, configFactory, $q, $location, $log, roomListFactory, frontOfficeFactory, $timeout,$route,$window) {

		$scope.bookingStatusMapping = {
			BOOKED: "ic_event_available_24px.svg",
			CHECKIN: "ic_local_hotel_24px.svg",
			OVERDUE: "ic_restore_24px.svg",
			AVAILABLE: "ic_check_circle_24px.svg",
			CANCELLED: "ic_cancel_24px.svg",
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

		function Init() {
			jQuery(document).unbind('keydown');
			$scope.DatePickerOption = {
				format: 'dd/MM/yyyy'
			};
			/*$scope.arrivalFromString = kendo.toString(new Date(), "MM/dd/yyyy");
			$scope.arrivalToString = kendo.toString(addDays(new Date(), 7), "MM/dd/yyyy");*/
			$scope.arrivalFromString = new Date().format('dd/mm/yyyy');
			$scope.arrivalToString = addDays(new Date(), 1).format('dd/mm/yyyy');
			$scope.resFromString = null;
			$scope.resToString = null;
			$scope.search = {
				//SearchType: "ARRIVAL_LIST",
				ReservationRoomId: null,
				GuestName: null,
				ArrivalIncluded: true,
				ArrivalFrom: new Date(),
				ArrivalTo: addDays(new Date(), 1),
				ReservatonFrom: null,
				ReservatonTo: null,
				RoomTypeId: 0,
				RoomId: 0,
				Type: 0,
				SkipRecord: 0
			};

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

			frontOfficeFactory.processSearchReservation($scope.search, function (data) {
				console.log('data:',data);
				$scope.searchResult = null;
				$scope.searchResult = data;
				$scope.totalRecord = data.totalRecord;
			});
		}
		Init();

		$scope.$watchCollection('search', function (newValues, oldValues) {

			if (newValues.ArrivalFrom !== oldValues.ArrivalFrom && newValues.ArrivalFrom > oldValues.ArrivalTo) {
				newValues.ArrivalTo = addDays(newValues.ArrivalFrom, 1);
			}

		});

		function addDays(date, days) {
			var result = new Date(date);
			result.setDate(result.getDate() + days);
			return result;
		}

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
			//$scope.search.From = new Date($scope.search.From).format("yyyy-mm-dd");
			//$scope.search.To = new Date($scope.search.To).format("yyyy-mm-dd");
			//console.log("INVALID DATE", new Date($scope.search.ArrivalFrom.getFullYear(), $scope.search.ArrivalFrom.getMonth(), $scope.search.ArrivalFrom.getDate(), 0, 0, 0, 0), $scope.search.ArrivalTo);
			if ($scope.search.ArrivalIncluded && $scope.search.ArrivalFrom && $scope.search.ArrivalTo && new Date($scope.search.ArrivalFrom.getFullYear(), $scope.search.ArrivalFrom.getMonth(), $scope.search.ArrivalFrom.getDate(), 0, 0, 0, 0) > $scope.search.ArrivalTo) {
				dialogService.messageBox("INVALID_ARRIVAL_FROM/TO_DATE", "PLEASE_SELECT_A_VALID_DATE_TO_PERFORM_SEARCH_ACTION");
				return;
			}

			console.log($scope.search.ArrivalFrom, $scope.arrivalFromString, $scope.search.ArrivalTo, $scope.arrivalToString);

			if ($scope.search.ArrivalIncluded && $scope.search.ArrivalFrom === null && $scope.arrivalFromString !== '') {
				dialogService.messageBox("INVALID_ARRIVAL_DATE", "PLEASE_SELECT_A_VALID_DATE_TO_PERFORM_SEARCH_ACTION");
				return;
			}

			if ($scope.search.ArrivalIncluded && $scope.search.ArrivalTo === null && $scope.arrivalToString !== '') {
				dialogService.messageBox("INVALID_ARRIVAL_DATE", "PLEASE_SELECT_A_VALID_DATE_TO_PERFORM_SEARCH_ACTION");
				return;
			}

			if ($scope.search.ReservationFrom && $scope.search.ReservationTo && $scope.search.ReservationFrom > $scope.search.ReservationTo) {
				dialogService.messageBox("INVALID_RESERVATION_FROM/TO_DATE", "PLEASE_SELECT_A_VALID_DATE_TO_PERFORM_SEARCH_ACTION");
				return;
			}

			console.log($scope.search.ReservationFrom, $scope.resFromString, $scope.search.ReservationTo, $scope.resToString);

			if ($scope.search.ReservationFrom === undefined && $scope.resFromString !== null) {
				dialogService.messageBox("INVALID_CREATE_DATE", "PLEASE_SELECT_A_VALID_DATE_TO_PERFORM_SEARCH_ACTION");
				return;
			}

			if ($scope.search.ReservationTo === undefined && $scope.resToString !== null) {
				dialogService.messageBox("INVALID_CREATE_DATE", "PLEASE_SELECT_A_VALID_DATE_TO_PERFORM_SEARCH_ACTION");
				return;
			}

			$scope.search.SkipRecord = 0;
			$scope.currentPage = 0;
			console.log("tìm kiếm",$scope.search);
			frontOfficeFactory.processSearchReservation($scope.search, function (data) {
				console.log("SEARCH RESULT", data);
				$scope.searchResult = null;
				$scope.searchResult = data;
				$scope.totalRecord = data.totalRecord;
			});
		}

		/*$scope.processSearch = function () {
			frontOfficeFactory.processSearch($scope.search, function (data) {
				console.log("SEARCH RESULT", data);
				$scope.searchResult = data;
			});
		}*/
		$scope.processSearch = Search;

		//Menu Items Process
		$scope.menuItemClick = function (item, result) {
			console.log(item);
			if (item.url) {
				$location.path(item.url);
				$route.reload()
				//$state.go('reservation', { reservationRoomId : true });
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
					reservationRoom.IsDashboard = 1;
					SharedFeaturesFactory.processAmendStayFO(reservationRoom);
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
				frontOfficeFactory.processAssignRoomFO(item, result, el);
			}
			
			if (item.name === 'UNASSIGN_ROOM') {
				var el = document.getElementById('search');
				frontOfficeFactory.processUnassignRoom(item, result, el);
			}
			
			if (item.name === 'PRE_CHECKIN') {
				var el = document.getElementById('search');
				frontOfficeFactory.processChangeReservationStatus(item, result, el, "PRE_CHECKIN");
			}
			
			if (item.name === 'UNDO_CANCEL_RESERVATION'){
				var el = document.getElementById('search');
				frontOfficeFactory.processUndoCancelReservation(item, result, el);
			}
			
			if (item.name === 'COPY') {
				var el = document.getElementById('search');
				frontOfficeFactory.processCopyRR(item, result, el);
			}
			// //done
			// if (item.name === 'CLEAN') {
			// 	// var el = document.getElementById('search');
			// 	// frontOfficeFactory.processClean(result, el);
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
			// //in-progress
			// if (item.name === 'UNDO_CANCEL_RESERVATION'){
			// 	var el = document.getElementById('search');
			// 	frontOfficeFactory.processUndoCancelReservation(item, result, el);
			// }
			// //done
			// if (item.name === 'PRE_CHECKIN'){
			// 	var reservationRoom = result;
			// 	if (reservationRoom) {                
			// 		if(!reservationRoom.reservationRoom) reservationRoom.reservationRoom = reservationRoom;
			// 		SharedFeaturesFactory.processUndoCheckIn(reservationRoom);
			// 	}
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

		function ShowReservationDetailDialogController($scope, $mdDialog, reservationDetail) {

			$scope.cancel = function () {
				//angular.copy(initial, $scope.roomTypeEditing);
				$mdDialog.cancel();
			};

			$scope.reservationDetail = reservationDetail;
			console.log("ROOM DETAIL", $scope.reservationDetail);
		}

		$scope.showReservationDetail = function (result, event) {
			var resultTemp = angular.copy(result);
			var useFullScreen = $mdMedia('xs');
			console.log("RESULT_TEMP", resultTemp);
			$mdDialog.show({
				controller: ShowReservationDetailDialogController,
				resolve: {
					reservationDetail: function () {
						return resultTemp;
					}
				},
				templateUrl: 'views/templates/showReservationDetail.tmpl.html',
				parent: angular.element(document.body),
				targetEvent: event,
				fullscreen: useFullScreen
			})
		}

		// status = 1 - trang kế tiếp, status = 2 - trang trước
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
			frontOfficeFactory.processSearchReservation($scope.search, function (data) {
				console.log("SEARCH RESULT", data);					
				$scope.searchResult = data;		

			});
		}

}]);