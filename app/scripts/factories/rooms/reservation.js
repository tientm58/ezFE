ezCloud.factory("reservationFactory", ['$http', 'loginFactory', '$rootScope', 'dialogService', '$mdDialog', '$state', '$timeout', '$stateParams', '$filter', function ($http, loginFactory, $rootScope, dialogService, $mdDialog, $state, $timeout, $stateParams, $filter) {

	function conflictReservationProcess(err) {
		console.log("ERROR", err);
		if (err.ReservationRoomId) {
			$mdDialog.show({
				controller: ShowReservationConflictController,
				resolve: {
					conflictReservation: function () {
						return err;
					},
				},
				templateUrl: 'views/templates/conflictReservationDialog.tmpl.html',
				parent: angular.element(document.body),
				targetEvent: null,
				clickOutsideToClose: false,
			}).then(function (answer) {
				//$rootScope.pageInit = true;
			}, function () { });

			function ShowReservationConflictController($scope, $mdDialog, conflictReservation, loginFactory, dialogService) {
				$scope.conflictReservationDialog = {};
				function Init() {
					console.log("CONFLICT RESERVATION", conflictReservation);
					$scope.conflictReservationDialog = conflictReservation;
					if ($scope.conflictReservationDialog.ArrivalDate) {
						$scope.conflictReservationDialog.ArrivalDate = new Date($scope.conflictReservationDialog.ArrivalDate);
					}
					if ($scope.conflictReservationDialog.DepartureDate) {
						$scope.conflictReservationDialog.DepartureDate = new Date($scope.conflictReservationDialog.DepartureDate);
					}
					console.log("data", $scope.conflictReservationDialog);
				}
				Init();
				$scope.hide = function () {
					$mdDialog.hide();
				};
				$scope.cancelDialog = function () {
					$mdDialog.cancel();
				};
			};
		}
	}

	function assignRoom(reservationRoom, el, type, callback) {

		var reservationRoomTemp = angular.copy(reservationRoom);
		console.log('reservationRoomTemp:', reservationRoomTemp);
		$mdDialog.show({
			controller: AssignRoomDialogController,
			resolve: {
				reservationRoom: function () {
					return reservationRoomTemp;
				}
			},
			templateUrl: 'views/templates/assignRoom.tmpl.html',
			parent: angular.element(document.body),
			targetEvent: null,
		}).then(function (newReservationRoom) {
			var assignRoom = loginFactory.securedPostJSON("api/Room/ProcessAssignRoom", newReservationRoom);
			$rootScope.dataLoadingPromise = assignRoom;
			assignRoom.success(function (data) {
				dialogService.toast("ASSIGN_ROOM_SUCCESSFUL");
				if (type == "timeline") {
					$rootScope.pageInit = true;
				} else {
					if (el !== null) {
						$timeout(function () {
							angular.element(el).triggerHandler('click');
						}, 0);
					} else {
						console.log("RELOAD AFTER ASSGIN ROOM");
						$state.go($state.current, {
							reservationRoomId: newReservationRoom.ReservationRoomId
						}, {
								reload: true
							});
					}
				}
			}).error(function (err) {
				if (err.Message) {
					dialogService.messageBox("ERROR", err.Message);
				} else {
					//conflictReservationProcess(err);
					SharedFeaturesFactory.processConflictReservation(err, reservationRoom, "CHECKIN");
				}
			})
		}, function () {
			if (type == "timeline")
				$rootScope.pageInit = true;
		});

		function AssignRoomDialogController($scope, $mdDialog, reservationRoom, loginFactory) {
			$scope.newReservationRoom = {};
			var keys = ["NOTIFICATION_ASSIGN_ROOM"];
			var languageKeys = {};
			for (var idx in keys) {
				languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
			}
			function Init() {
				$scope.decimal = $rootScope.decimals;
				$scope.reservationRoom = reservationRoom;
				$scope.newReservationRoom.ReservationRoomId = reservationRoom.ReservationRoomId;
				$scope.newReservationRoom.RoomTypeId = reservationRoom.roomTypeInfo.RoomTypeId;
				$scope.newReservationRoom.Price = $scope.reservationRoom.Price;
				$scope.newReservationRoom.RoomPriceId = reservationRoom.RoomPriceId;
				$scope.newReservationRoom.languageKeys = languageKeys;
				$scope.hasRRIDParam = ($stateParams.reservationRoomId) ? true : false;
			}
			Init();
			$scope.$watchCollection('newReservationRoom.RoomTypeId', function (newValues, oldValues) {
				$scope.reservationRoom.availableRoom = null;
				var availableRoomModel = {
					roomTypeId: $scope.newReservationRoom.RoomTypeId,
					arrivalDate: $scope.reservationRoom.ArrivalDate,
					departureDate: $scope.reservationRoom.DepartureDate
				};
				var getAvailableRoomsPromise = loginFactory.securedPostJSON("api/Reservation/AvailableRooms", availableRoomModel);
				$rootScope.dataLoadingPromise = getAvailableRoomsPromise;
				getAvailableRoomsPromise.success(function (data) {
					$scope.reservationRoom.availableRoom = data;
				}).error(function (err) {
					console.log(err);
				});
				$scope.availablePlanList = _.filter($scope.reservationRoom.planList, function (item) {
					return (item.IsActive && item.RoomTypeId.toString() === $scope.newReservationRoom.RoomTypeId.toString());
				}).sort(function (a, b) {
					return parseInt(a.Priority) - parseInt(b.Priority);
				});
			});
			/*$scope.updateRoomType = function () {
				$scope.availablePlanList = _.filter($scope.reservationRoom.planList, function (item) {
					return (item.IsActive && item.RoomTypeId.toString() === $scope.newReservationRoom.RoomTypeId.toString());
				}).sort(function (a, b) {
					return parseInt(a.Priority) - parseInt(b.Priority);
				});
				var availableRoomModel = {
					roomTypeId: reservationRoom.roomTypeInfo.RoomTypeId,
					arrivalDate: reservationRoom.ArrivalDate,
					departureDate: reservationRoom.DepartureDate
				};
				var getAvailableRoomsPromise = loginFactory.securedPostJSON("api/Reservation/AvailableRooms", availableRoomModel);
				$rootScope.dataLoadingPromise = getAvailableRoomsPromise;
				getAvailableRoomsPromise.success(function(data){
					$scope.reservationRoom.availableRoom = data;
				}).error(function(err){
					console.log(err);
				})
			};*/
			$scope.hide = function () {
				$mdDialog.hide();
			};
			$scope.cancel = function () {
				$mdDialog.cancel();
			};
			$scope.processAssignRoom = function () {
				$mdDialog.hide($scope.newReservationRoom);
			};
		}
	}

	function assignRoomFO(reservationRoom, el, type, callback) {

		var reservationRoomTemp = angular.copy(reservationRoom);
		console.log('reservationRoomTemp:', reservationRoomTemp);
		$mdDialog.show({
			controller: AssignRoomFODialogController,
			resolve: {
				reservationRoom: function () {
					return reservationRoomTemp;
				}
			},
			templateUrl: 'views/templates/assignRoom.tmpl.html',
			parent: angular.element(document.body),
			targetEvent: null,
		}).then(function (newReservationRoom) {
			var assignRoom = loginFactory.securedPostJSON("api/Room/ProcessAssignRoom", newReservationRoom);
			$rootScope.dataLoadingPromise = assignRoom;
			assignRoom.success(function (data) {
				dialogService.toast("ASSIGN_ROOM_SUCCESSFUL");
				if (type == "timeline") {
					$rootScope.pageInit = true;
				} else {
					if (el !== null) {
						$timeout(function () {
							angular.element(el).triggerHandler('click');
						}, 0);
					} else {
						console.log("RELOAD AFTER ASSGIN ROOM");
						// $state.go($state.current, {
						// 	reservationRoomId: newReservationRoom.ReservationRoomId
						// }, {
						// 		reload: true
						// 	});
					}
				}
			}).error(function (err) {
				if (err.Message) {
					dialogService.messageBox("ERROR", err.Message);
				} else {
					//conflictReservationProcess(err);
					SharedFeaturesFactory.processConflictReservation(err, reservationRoom, "CHECKIN");
				}
			})
		}, function () {
			if (type == "timeline")
				$rootScope.pageInit = true;
		});

		function AssignRoomFODialogController($scope, $mdDialog, reservationRoom, loginFactory) {
			$scope.newReservationRoom = {};
			var keys = ["NOTIFICATION_ASSIGN_ROOM"];
			var languageKeys = {};
			for (var idx in keys) {
				languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
			}
			function Init() {
				$scope.decimal = $rootScope.decimals;
				$scope.reservationRoom = reservationRoom;
				$scope.newReservationRoom.ReservationRoomId = reservationRoom.ReservationRoomId;
				$scope.newReservationRoom.RoomTypeId = reservationRoom.roomTypeInfo.RoomTypeId;
				$scope.newReservationRoom.Price = $scope.reservationRoom.Price;
				$scope.newReservationRoom.RoomPriceId = reservationRoom.RoomPriceId;
				$scope.newReservationRoom.languageKeys = languageKeys;
				$scope.hasRRIDParam = ($stateParams.reservationRoomId) ? true : false;
			}
			Init();
			$scope.$watchCollection('newReservationRoom.RoomTypeId', function (newValues, oldValues) {
				$scope.reservationRoom.availableRoom = null;
				var availableRoomModel = {
					roomTypeId: $scope.newReservationRoom.RoomTypeId,
					arrivalDate: $scope.reservationRoom.ArrivalDate,
					departureDate: $scope.reservationRoom.DepartureDate
				};
				var getAvailableRoomsPromise = loginFactory.securedPostJSON("api/Reservation/AvailableRooms", availableRoomModel);
				$rootScope.dataLoadingPromise = getAvailableRoomsPromise;
				getAvailableRoomsPromise.success(function (data) {
					$scope.reservationRoom.availableRoom = data;
				}).error(function (err) {
					console.log(err);
				});
				$scope.availablePlanList = _.filter($scope.reservationRoom.planList, function (item) {
					return (item.IsActive && item.RoomTypeId.toString() === $scope.newReservationRoom.RoomTypeId.toString());
				}).sort(function (a, b) {
					return parseInt(a.Priority) - parseInt(b.Priority);
				});
			});
			/*$scope.updateRoomType = function () {
				$scope.availablePlanList = _.filter($scope.reservationRoom.planList, function (item) {
					return (item.IsActive && item.RoomTypeId.toString() === $scope.newReservationRoom.RoomTypeId.toString());
				}).sort(function (a, b) {
					return parseInt(a.Priority) - parseInt(b.Priority);
				});
				var availableRoomModel = {
					roomTypeId: reservationRoom.roomTypeInfo.RoomTypeId,
					arrivalDate: reservationRoom.ArrivalDate,
					departureDate: reservationRoom.DepartureDate
				};
				var getAvailableRoomsPromise = loginFactory.securedPostJSON("api/Reservation/AvailableRooms", availableRoomModel);
				$rootScope.dataLoadingPromise = getAvailableRoomsPromise;
				getAvailableRoomsPromise.success(function(data){
					$scope.reservationRoom.availableRoom = data;
				}).error(function(err){
					console.log(err);
				})
			};*/
			$scope.hide = function () {
				$mdDialog.hide();
			};
			$scope.cancel = function () {
				$mdDialog.cancel();
			};
			$scope.processAssignRoom = function () {
				$mdDialog.hide($scope.newReservationRoom);
			};
		}
	}

	function assignRoomDashboard(reservationRoom, callback) {

		var reservationRoomTemp = angular.copy(reservationRoom);
		console.log('reservationRoomTemp:', reservationRoomTemp);
		$mdDialog.show({
			controller: AssignRoomDialogController,
			resolve: {
				reservationRoom: function () {
					return reservationRoomTemp;
				}
			},
			templateUrl: 'views/templates/assignRoom.tmpl.html',
			parent: angular.element(document.body),
			targetEvent: null,
		}).then(function (newReservationRoom) {
			var assignRoom = loginFactory.securedPostJSON("api/Room/ProcessAssignRoom", newReservationRoom);
			$rootScope.dataLoadingPromise = assignRoom;
			assignRoom.success(function (data) {
				callback();
				dialogService.toast("ASSIGN_ROOM_SUCCESSFUL");
			}).error(function (err) {
				if (err.Message) {
					dialogService.messageBox("ERROR", err.Message);
				} else {
					//conflictReservationProcess(err);
					SharedFeaturesFactory.processConflictReservation(err, reservationRoom, "CHECKIN");
				}
			})
		}, function () {

		});

		function AssignRoomDialogController($scope, $mdDialog, reservationRoom, loginFactory) {
			$scope.newReservationRoom = {};
			var keys = ["NOTIFICATION_ASSIGN_ROOM"];
			var languageKeys = {};
			for (var idx in keys) {
				languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
			}
			function Init() {
				$scope.decimal = $rootScope.decimals;
				$scope.reservationRoom = reservationRoom;
				$scope.newReservationRoom.ReservationRoomId = reservationRoom.ReservationRoomId;
				$scope.newReservationRoom.RoomTypeId = reservationRoom.RoomTypeId;
				$scope.newReservationRoom.Price = $scope.reservationRoom.Price;
				$scope.newReservationRoom.RoomPriceId = reservationRoom.RoomPriceId;
				$scope.newReservationRoom.languageKeys = languageKeys;
				$scope.hasRRIDParam = ($stateParams.reservationRoomId) ? true : false;
			}
			Init();
			$scope.$watchCollection('newReservationRoom.RoomTypeId', function (newValues, oldValues) {
				$scope.reservationRoom.availableRoom = null;
				var availableRoomModel = {
					roomTypeId: $scope.newReservationRoom.RoomTypeId,
					arrivalDate: $scope.reservationRoom.ArrivalDate,
					departureDate: $scope.reservationRoom.DepartureDate
				};
				var getAvailableRoomsPromise = loginFactory.securedPostJSON("api/Reservation/AvailableRooms", availableRoomModel);
				$rootScope.dataLoadingPromise = getAvailableRoomsPromise;
				getAvailableRoomsPromise.success(function (data) {
					$scope.reservationRoom.availableRoom = data;
				}).error(function (err) {
					console.log(err);
				});
				$scope.availablePlanList = _.filter($scope.reservationRoom.planList, function (item) {
					return (item.IsActive && item.RoomTypeId.toString() === $scope.newReservationRoom.RoomTypeId.toString());
				}).sort(function (a, b) {
					return parseInt(a.Priority) - parseInt(b.Priority);
				});
			});

			$scope.hide = function () {
				$mdDialog.hide();
			};
			$scope.cancel = function () {
				$mdDialog.cancel();
			};
			$scope.processAssignRoom = function () {
				$mdDialog.hide($scope.newReservationRoom);
			};
		}
	}

	function CheckTimeRangeConflict(start_1, end_1, start_2, end_2) {
		return (start_1 < end_2 && start_2 <= end_1);
	}

	function getAvailableRoomForRoomMove(roomList, arrivalDate, departureDate, availableRoom) {
		console.log("FACTORY", roomList, arrivalDate, departureDate);

		//var availableRoom = [];
		for (var index in roomList) {
			if (roomList[index].RoomTypeId && !roomList[index].IsHidden) {
				var notThisRoom = false;
				if (roomList[index].reservationRoom) {
					if (CheckTimeRangeConflict(arrivalDate, departureDate, roomList[index].reservationRoom.ArrivalDate, roomList[index].reservationRoom.DepartureDate)) {
						notThisRoom = true;
					}
				}
				// if(roomList[index].roomBookingList.length>0){
				// 	for (var index2 in roomList[index].roomBookingList) {
				// 		var bookingTemp = roomList[index].roomBookingList[index2];
				// 		bookingTemp.ArrivalDate = new Date(bookingTemp.ArrivalDate);
				// 		bookingTemp.DepartureDate = new Date(bookingTemp.DepartureDate);
				// 		if (CheckTimeRangeConflict(arrivalDate, departureDate, bookingTemp.ArrivalDate, bookingTemp.DepartureDate)) {
				// 			notThisRoom = true;
				// 		}
				// 	}
				// }
				if (roomList[index].BookingList.length > 0) {
					for (var index2 in roomList[index].BookingList) {
						var bookingTemp = roomList[index].BookingList[index2];
						if (CheckTimeRangeConflict(arrivalDate, departureDate, bookingTemp.ArrivalDate, bookingTemp.DepartureDate)) {
							notThisRoom = true;
						}
					}
				}


				if (notThisRoom === false) {
					availableRoom.push(roomList[index]);
				} else {
					notThisRoom = null;
				}
			}
		}
		console.log("AVAILABLE FACTORY", availableRoom);
		//return availableRoom;
	}

	function getAvailableRoom(roomList, arrivalDate, departureDate, availableRoom) {
		//var availableRoom = [];
		for (var index in roomList) {
			if (roomList[index] && roomList[index].RoomTypeId && !roomList[index].IsHidden) {
				var notThisRoom = false;
				if (roomList[index].reservationRoom) {
					if (CheckTimeRangeConflict(arrivalDate, departureDate, roomList[index].reservationRoom.ArrivalDate, roomList[index].reservationRoom.DepartureDate)) {
						notThisRoom = true;
					}
				}
				// for (var index2 in roomList[index].roomBookingList) {
				// 	var bookingTemp = roomList[index].roomBookingList[index2];
				// 	bookingTemp.ArrivalDate = new Date(bookingTemp.ArrivalDate);
				// 	bookingTemp.DepartureDate = new Date(bookingTemp.DepartureDate);
				// 	if (CheckTimeRangeConflict(arrivalDate, departureDate, bookingTemp.ArrivalDate, bookingTemp.DepartureDate)) {
				// 		notThisRoom = true;
				// 	}
				// }

				if (roomList[index].RoomRepairList && roomList[index].RoomRepairList.length > 0) {
					for (var repairIdx in roomList[index].RoomRepairList) {
						if (CheckTimeRangeConflict(arrivalDate, departureDate, roomList[index].RoomRepairList[repairIdx].RepairStartDate, roomList[index].RoomRepairList[repairIdx].RepairEndDate)) {
							notThisRoom = true;
						}
					}
				}
				if (roomList[index].BookingList.length > 0) {
					for (var index2 in roomList[index].BookingList) {
						var bookingTemp = roomList[index].BookingList[index2];
						if (CheckTimeRangeConflict(arrivalDate, departureDate, bookingTemp.ArrivalDate, bookingTemp.DepartureDate)) {
							notThisRoom = true;
						}
					}
				}

				if (notThisRoom === false) {
					availableRoom.push(roomList[index]);
				} else {
					notThisRoom = null;
				}
			}
		}
		//return availableRoom;
	}

	function getAvailableRoomsFromServer(availableRoomModel) {

	}

	return {

		changeStatus: function (reservationId, status, item, SharedFeaturesFactory, mcallback) {
			var promise = loginFactory.securedPostJSON("api/Room/ChangeStatus?RRID=" + reservationId + "&status=" + status, "");

			$rootScope.dataLoadingPromise = promise;
			promise.success(function (data) {
				if (mcallback)
					mcallback(data);

			}).error(function (err) {
				if (err.Message) {
					dialogService.messageBox("ERROR", err.Message);
				} else {
					//conflictReservationProcess(err);
					SharedFeaturesFactory.processConflictReservation(err, item, "CHECKIN");
				}
			});
		},

		changeRoomStatus: function (roomId, status, mcallback) {
			var promise = loginFactory.securedPostJSON("api/Room/ChangeRoomStatus?roomId=" + roomId + "&status=" + status, "");

			$rootScope.dataLoadingPromise = promise;
			promise.success(function (data) {
				if (mcallback)
					mcallback(data);

			}).error(function (data) {

			});
		},

		assignRoom: function (reservationRoom, el, type) {
			if (type == "timeline") {
				assignRoom(reservationRoom, el, type)
			} else {
				assignRoom(reservationRoom, el, type);
			}
		},

		assignRoomFO: function (reservationRoom, el, type) {		
				assignRoomFO(reservationRoom, el, type);			
		},

		assignRoomDashboard: function (reservationRoom, reset) {
			assignRoomDashboard(reservationRoom, reset);
		},

		getAvailableRoom: function (roomList, arrivalDate, departureDate, availableRoom) {
			getAvailableRoom(roomList, arrivalDate, departureDate, availableRoom);
			return availableRoom;
		},

		getAvailableRoomForRoomMove: function (roomList, arrivalDate, departureDate, availableRoom) {
			getAvailableRoomForRoomMove(roomList, arrivalDate, departureDate, availableRoom);
			return availableRoom;
		}

	};
}]);