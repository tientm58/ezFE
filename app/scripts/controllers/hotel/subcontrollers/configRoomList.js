ezCloud.controller('configRoomListController', ['$scope', '$rootScope', '$state', 'dialogService', '$localStorage', '$http', '$sessionStorage', 'loginFactory', '$mdDialog', 'flowFactory', '$filter', '$log', '$mdSidenav', '$mdMedia', 'configFactory', '$q', '$location', function ($scope, $rootScope, $state, dialogService, $localStorage, $http, $sessionStorage, loginFactory, $mdDialog, flowFactory, $filter, $log, $mdSidenav, $mdMedia, configFactory, $q, $location) {

	$scope.rooms = [];
	$scope.roomTypes = {};
	$scope.showFilter = false;
	$scope.groupByCheckBox = {};
	$scope.viewSortRoom = false;

	$scope.currentHotelConnectivities = true;

	var listRoom = [];

	$scope.floors = [];
	$scope.menu = [
		{
			name: 'EDIT',
			icon: 'ic_edit_24px.svg'
		},
		{
			name: 'MAINTENANCE_BLOCK',
			icon: 'ic_format_paint_24px.svg'
		},
		{
			name: 'DELETE_ROOM',
			icon: 'ic_delete_24px.svg'
		}
	]
	function configRoomListInit() {
		configFactory.getAllRooms(function (data) {
			angular.forEach(data, function (arr) {
				if (arr.room.FloorId == null) {
					arr.room.FloorId = 0;
				};
				if (arr.room.OrderNumber == null) {
					arr.room.OrderNumber = 0;
				}
			});
			console.log("room data", data);
			$scope.rooms = data;
			listRoom = angular.copy($scope.rooms);
			$scope.roomTypes = data.roomTypes;
			console.log("ROOMS", $scope.rooms[0]);

			for (var index in $scope.roomTypes) {
				$scope.groupByCheckBox[$scope.roomTypes[index].RoomTypeId] = true;
			}
			//
			configFactory.getAllFloor(function (data) {
				$scope.floors = data;
			});
		});

		var currentHotelConnectivities = loginFactory.securedGet("api/Hotel/GetCurrentHotelConnectivities");
		$rootScope.dataLoadingPromise = currentHotelConnectivities;
		currentHotelConnectivities.success(function (data) {
			$scope.currentHotelConnectivities = data.isUsed;
		}).error(function (err) {
			console.log(err);
		});

	}
	configRoomListInit();

	$scope.useGroupBy = function () {
		var result = false;
		for (var index in $scope.groupByCheckBox) {
			if ($scope.groupByCheckBox[index] === true) {
				result = true;
				break;
			}
		}
		return result;
	}
	$scope.changeRoomStatus = function (room) {
		if (room.IsHidden === true) {
			var confirm = dialogService.confirm("CONFIRM",
				"WOULD_YOU_LIKE_TO_CHANGE_ROOM_STATUS?");
			confirm.then(function () {
				room.IsHidden = (room.IsHidden === true) ? false : true;
				configFactory.changeRoomStatus(room.RoomId);
			});
		}
		if (room.IsHidden === false) {
			var warning = false;
			var GetAllRoomReservations = loginFactory.securedGet("api/Config/Rooms/GetAllRoomReservations", "roomId=" + room.RoomId);
			GetAllRoomReservations.success(function (data) {
				console.log("ALREADY RR", data);
				if (data.length > 0) {
					warning = true;
				}
				if (warning) {
					dialogService.messageBox("ERROR", "CAN_NOT_INACTIVE_THIS_ROOM" + "." + "PLEASE_PROCESS_ALL_RESERVATION");
				} else {
					var confirm = dialogService.confirm("CONFIRM",
						"WOULD_YOU_LIKE_TO_CHANGE_ROOM_STATUS_TO_INACTIVE ");
					confirm.then(function () {
						room.IsHidden = (room.IsHidden === true) ? false : true;
						configFactory.changeRoomStatus(room.RoomId);
					});
				}
			}).error(function (err) {
				console.log(err);
			});

		}
	};
	$scope.changeRoomUseLock = function (room) {
		if (room.UseLock === true) {
			var confirm = dialogService.confirm("CONFIRM",
				"DO_YOU_WANT_TO_DISABLE_SMART_LOCK_FOR_THIS_ROOM?");
			confirm.then(function () {
				room.UseLock = false;
				configFactory.changeRoomUseLock(room.RoomId);
			});
		}
		else {
			var confirm = dialogService.confirm("CONFIRM",
				"DO_YOU_WANT_TO_ENABLE_SMART_LOCK_FOR_THIS_ROOM?");
			confirm.then(function () {
				room.UseLock = true;
				configFactory.changeRoomUseLock(room.RoomId);
			});
		}
	};
	$scope.showRoomHistories = function (room, ev) {
		var roomTemp = angular.copy(room);
		$mdDialog.show({
			controller: ShowRoomHistoriesDialogController,
			resolve: {
				currentRoom: function () {
					return roomTemp;
				}
			},
			templateUrl: 'views/templates/showRoomHistories.tmpl.html',
			parent: angular.element(document.body),
			targetEvent: event,
		}).then(function () { }, function () {

		});

		function ShowRoomHistoriesDialogController($scope, $rootScope, $mdDialog, currentRoom, loginFactory) {
			function Init() {
				$scope.currentRoom = currentRoom;
				var getAllRoomHistories = loginFactory.securedPostJSON("api/Config/Rooms/AllRoomHistory?roomId=" + $scope.currentRoom.RoomId, "");
				$rootScope.dataLoadingPromise = getAllRoomHistories;
				getAllRoomHistories.success(function (data) {
					$scope.roomHistories = data;
					if ($scope.roomHistories && $scope.roomHistories.length > 0) {

						for (var index in $scope.roomHistories) {
							if ($scope.roomHistories[index].roomHistory.Date != null) {
								$scope.roomHistories[index].roomHistory.Date = new Date($scope.roomHistories[index].roomHistory.Date);
							}
						}

						$scope.roomHistories = $scope.roomHistories.sort(function (a, b) {
							return b.roomHistory.Date - a.roomHistory.Date;
						});
					}
				}).error(function (err) {
					console.log(err);
				})
			}
			Init();
			$scope.hide = function () {
				$mdDialog.hide();
			};
			$scope.cancel = function () {
				$mdDialog.cancel();
			};

		};

	}
	$scope.roomRepair = function (room, ev) {
		console.log("ROOM", room);
		var roomTemp = angular.copy(room);
		$scope.editRoomRepairDialog = $mdDialog;
		$scope.editRoomRepairDialog.show({
			templateUrl: 'views/templates/repairRoom.tmpl.html',
			clickOutsideToClose: false,
			locals: {
				local: [roomTemp, $scope.editRoomRepairDialog, $scope]
			},
			controller: ['$scope', '$rootScope', '$mdDialog', 'loginFactory', 'dialogService', 'local', RoomRepairController]
		}).then(function () {

		}, function () {

		});


		function RoomRepairController($scope, $rootScope, $mdDialog, loginFactory, dialogService, local) {

			function conflictReservationProcess(err) {
				console.log("ERROR", err);
				if (err.ReservationRoomId) {
					$mdDialog.show({
						controller: ['$scope', '$mdDialog', 'conflictReservation', 'loginFactory', 'dialogService', ShowReservationConflictController],
						resolve: {
							conflictReservation: function () {
								return err;
							},
						},
						templateUrl: 'views/templates/conflictReservationDialog.tmpl.html',
						parent: angular.element(document.body),
						targetEvent: null,
						clickOutsideToClose: false,
						/*fullscreen: useFullScreen*/
					})
						.then(function (answer) { }, function () { });

					function ShowReservationConflictController($scope, $mdDialog, conflictReservation, loginFactory, dialogService) {
						$scope.conflictReservationDialog = {};

						function Init() {
							$scope.conflictReservationDialog = conflictReservation;
							if ($scope.conflictReservationDialog.ArrivalDate) {
								$scope.conflictReservationDialog.ArrivalDate = new Date($scope.conflictReservationDialog.ArrivalDate);
							}
							if ($scope.conflictReservationDialog.DepartureDate) {
								$scope.conflictReservationDialog.DepartureDate = new Date($scope.conflictReservationDialog.DepartureDate);
							}
						}
						Init();
						$scope.hide = function () {
							$mdDialog.hide();
						};
						$scope.cancelDialog = function () {
							$mdDialog.cancel();
						};
						/*$scope.goToReservation() = function(){
	
						}*/
					};
				}
			}

			function Init() {
				$scope.minDate = new Date().getDate();
				$scope.currentRoom = local[0];
				console.log("LOCAL 0", local[0]);
				var getAllRoomRepair = loginFactory.securedPostJSON("api/Config/Rooms/AllRoomRepair?roomId=" + $scope.currentRoom.room.RoomId);
				$rootScope.dataLoadingPromise = getAllRoomRepair;
				getAllRoomRepair.success(function (data) {
					$scope.roomRepairs = data;
					if ($scope.roomRepairs && $scope.roomRepairs.length > 0) {
						for (var index in $scope.roomRepairs) {
							$scope.roomRepairs[index].roomRepair.showEdit = true;
							if ($scope.roomRepairs[index].roomRepair.RepairStartDate != null) {
								$scope.roomRepairs[index].roomRepair.RepairStartDate = new Date($scope.roomRepairs[index].roomRepair.RepairStartDate);
							}
							if ($scope.roomRepairs[index].roomRepair.RepairEndDate != null) {
								$scope.roomRepairs[index].roomRepair.RepairEndDate = new Date($scope.roomRepairs[index].roomRepair.RepairEndDate);
							}

							if ($scope.roomRepairs[index].LastModifyDate != null) {
								$scope.roomRepairs[index].LastModifyDate = new Date($scope.roomRepairs[index].LastModifyDate);
							}

							var RepairStartDateTemp = new Date($scope.roomRepairs[index].roomRepair.RepairStartDate.getFullYear(), $scope.roomRepairs[index].roomRepair.RepairStartDate.getMonth(), $scope.roomRepairs[index].roomRepair.RepairStartDate.getDate());
							var RepairEndDateTemp = new Date($scope.roomRepairs[index].roomRepair.RepairEndDate.getFullYear(), $scope.roomRepairs[index].roomRepair.RepairEndDate.getMonth(), $scope.roomRepairs[index].roomRepair.RepairEndDate.getDate());
							var newDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
							if (RepairEndDateTemp < newDate) {
								$scope.roomRepairs[index].roomRepair.showEdit = false;
							}
						}
					}
				}).error(function (err) {
					console.log(err);
				});

				$scope.roomRepairDialog = local[2].editRoomRepairDialog;
			}
			Init();

			function CheckTimeRangeConflict(start_1, end_1, start_2, end_2) {
				return (start_1 < end_2 && start_2 <= end_1);
			}

			$scope.hide = function () {
				$mdDialog.hide();
			};
			$scope.cancel = function () {
				$mdDialog.cancel();
			};

			$scope.editRoomRepair = function (repair, $event) {

				var roomRepair = angular.copy(repair);
				var currentRoomTemp = angular.copy($scope.currentRoom);
				console.log("TEST", repair, currentRoomTemp);
				$mdDialog.show({
					controller: ['$scope', '$rootScope', '$mdDialog', 'loginFactory', 'dialogService', 'roomRepair', 'roomRepairs', 'currentRoom', EditRoomRepairController],
					resolve: {
						roomRepair: function () {
							return roomRepair;
						},
						roomRepairs: function () {
							return $scope.roomRepairs;
						},
						currentRoom: function () {
							return currentRoomTemp
						}
					},
					templateUrl: 'views/templates/editRoomRepair.tmpl.html',
					parent: angular.element(document.body),
					targetEvent: event,
				}).then(function (data) {
					if (data !== null) {
						var repairedRoom = angular.copy(local[0]);
						Init();
						local[2].roomRepair(repairedRoom, null);
					}
				}, function () {
					var repairedRoom = angular.copy(local[0]);
					Init();
					local[2].roomRepair(repairedRoom, null);
				});

				function EditRoomRepairController($scope, $rootScope, $mdDialog, loginFactory, dialogService, roomRepair, roomRepairs, currentRoom) {
					function Init() {
						$scope.DateTimePickerOption = {
							format: 'dd/MM/yyyy HH:mm'
						};
						$scope.roomRepair = roomRepair;
						$scope.originalRoomRepair = angular.copy($scope.roomRepair);
						$scope.roomRepairs = roomRepairs;
						$scope.currentRoom = currentRoom;
						var RepairStartDateTemp = new Date($scope.roomRepair.RepairStartDate.getFullYear(), $scope.roomRepair.RepairStartDate.getMonth(), $scope.roomRepair.RepairStartDate.getDate());
						var newDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
						if (RepairStartDateTemp < newDate) {
							$scope.roomRepair.disableStartDate = true;
						}
						$scope.str = new Date($scope.roomRepair.RepairStartDate).format('dd/mm/yyyy HH:MM');
						$scope.str2 = new Date($scope.roomRepair.RepairEndDate).format('dd/mm/yyyy HH:MM');
						$scope.warningDateNull = false;
						$scope.warningDateInvalid = false;
						$scope.warningDateCurrentTime = false;
						$scope.warningReason = false;
						$scope.warningConflict = false;
					}
					Init();

					function CheckTimeRangeConflict(start_1, end_1, start_2, end_2) {
						return (start_1 < end_2 && start_2 <= end_1);
					}
					$scope.hide = function () {
						$mdDialog.hide();
					};
					$scope.cancel = function () {
						$mdDialog.cancel();
					};

					$scope.unblockRoomRepair = function () {
						var roomRepairTemp = angular.copy($scope.roomRepair);
						console.log("ROOM REPAIR TEMP", roomRepairTemp);
						var removeRoomRepair = loginFactory.securedPostJSON("api/Config/Rooms/RemoveRoomRepair", roomRepairTemp);
						$rootScope.dataLoadingPromise = removeRoomRepair;
						removeRoomRepair.success(function (data) {
							dialogService.toast("UNBLOCK_SUCCESSFUL");
							$mdDialog.hide(data);
						}).error(function (err) {
							console.log(err);
						});
					};

					$scope.saveEditRoomPrice = function () {
						console.log("REPAIR START END", $scope.roomRepair.RepairStartDate, $scope.roomRepair.RepairEndDate);


						if ($scope.roomRepair.RepairStartDate == null || $scope.roomRepair.RepairEndDate == null) {
							$scope.warningDateNull = true;
							$scope.warningDateInvalid = false;
							$scope.warningDateCurrentTime = false;
							$scope.warningReason = false;
							$scope.warningConflict = false;
							return;
						}

						var originalRepairStartDate = new Date($scope.originalRoomRepair.RepairStartDate.getFullYear(), $scope.originalRoomRepair.RepairStartDate.getMonth(), $scope.originalRoomRepair.RepairStartDate.getDate());
						var RepairStartDateTemp = new Date($scope.roomRepair.RepairStartDate.getFullYear(), $scope.roomRepair.RepairStartDate.getMonth(), $scope.roomRepair.RepairStartDate.getDate());
						var RepairEndDateTemp = new Date($scope.roomRepair.RepairEndDate.getFullYear(), $scope.roomRepair.RepairEndDate.getMonth(), $scope.roomRepair.RepairEndDate.getDate());
						var newDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
						console.log("REPAIR TEMP", RepairStartDateTemp, RepairEndDateTemp, newDate);

						if (originalRepairStartDate < newDate) {
							if (RepairEndDateTemp < newDate) {
								$scope.warningDateCurrentTime = true;
								$scope.warningDateNull = false;
								$scope.warningDateInvalid = false;
								$scope.warningReason = false;
								$scope.warningConflict = false;
								return;
							}
						}
						else {
							if (RepairStartDateTemp < newDate || RepairEndDateTemp < newDate) {
								$scope.warningDateCurrentTime = true;
								$scope.warningDateNull = false;
								$scope.warningDateInvalid = false;
								$scope.warningReason = false;
								$scope.warningConflict = false;
								return;
							}
						}




						if ($scope.roomRepair.RepairStartDate > $scope.roomRepair.RepairEndDate) {
							console.log("THERE THERE");
							$scope.warningDateInvalid = true;
							$scope.warningDateNull = false;

							$scope.warningDateCurrentTime = false;
							$scope.warningReason = false;
							$scope.warningConflict = false;
							return;
						}

						if (!$scope.roomRepair.RepairReason || $scope.roomRepair.RepairReason.trim() == '') {
							$scope.warningReason = true;
							$scope.warningDateNull = false;
							$scope.warningDateInvalid = false;
							$scope.warningDateCurrentTime = false;

							$scope.warningConflict = false;
							return;
						}
						console.log('roomRepair', $scope.roomRepair);
						for (var index in $scope.roomRepairs) {

							if (CheckTimeRangeConflict($scope.roomRepairs[index].roomRepair.RepairStartDate, $scope.roomRepairs[index].roomRepair.RepairEndDate, $scope.roomRepair.RepairStartDate, $scope.roomRepair.RepairEndDate) && $scope.roomRepairs[index].roomRepair.RoomRepairId != $scope.roomRepair.RoomRepairId && $scope.roomRepairs[index].roomRepair.IsDeleted === false) {
								$scope.warningConflict = true;
								$scope.warningDateNull = false;
								$scope.warningDateInvalid = false;
								$scope.warningDateCurrentTime = false;
								$scope.warningReason = false;

								return;
							}
						}

						//if (CheckTimeRangeConflict($scope.roomRepair.RepairStartDate, ))

						var editRoomPrice = loginFactory.securedPostJSON("api/Config/Rooms/EditRoomRepair", $scope.roomRepair);
						$rootScope.dataLoadingPromise = editRoomPrice;
						editRoomPrice.success(function (data) {
							if (data !== null) {
								dialogService.toast("EDIT_ROOM_REPAIR_SUCCESSFUL");
								$mdDialog.hide(data);
							}
						}).error(function (err) {
							if (err.Meassage) {
								$mdDialog.hide(null);
								dialogService.messageBox("ERROR", err.Meassage);
							}
							else {
								$mdDialog.hide(null);
								conflictReservationProcess(err);
							}
						});
					}
				}
			};

			$scope.removeRoomRepair = function (roomRepair, ev) {
				var roomRepairTemp = angular.copy(roomRepair);
				dialogService.confirm("DO_YOU_WANT_TO_UNBLOCK_ROOM_IN_THIS_BLOCK_TIME?").then(function () {
					var removeRoomRepair = loginFactory.securedPostJSON("api/Config/Rooms/RemoveRoomRepair", roomRepairTemp);
					$rootScope.dataLoadingPromise = removeRoomRepair;
					removeRoomRepair.success(function (data) {
						dialogService.toast("UNBLOCK_SUCCESSFUL");
						var repairedRoom = angular.copy(local[0]);
						Init();
						local[2].roomRepair(repairedRoom, null);
						//$mdDialog.hide(data);
					}).error(function (err) {
						console.log(err);
					})
				}, function () {
					var repairedRoom = angular.copy(local[0]);
					Init();
					local[2].roomRepair(repairedRoom, null);
				});
			};


			$scope.addRoomRepair = function (ev) {
				var room = angular.copy(local[0]);
				$mdDialog.show({
					controller: ['$scope', '$rootScope', '$mdDialog', 'loginFactory', 'dialogService', 'currentRoom', 'roomRepairs', AddRoomRepairController],
					templateUrl: 'views/templates/addRoomRepair.tmpl.html',
					resolve: {
						currentRoom: function () {
							return room.room;
						},
						roomRepairs: function () {
							return $scope.roomRepairs;
						}
					},
					parent: angular.element(document.body),
					targetEvent: event,
				}).then(function (data) {
					if (data !== null) {
						var repairedRoom = angular.copy(local[0]);
						Init();
						local[2].roomRepair(repairedRoom, null);
					}

				}, function () {
					var repairedRoom = angular.copy(local[0]);
					Init();
					local[2].roomRepair(repairedRoom, null);
				});

				function AddRoomRepairController($scope, $rootScope, $mdDialog, loginFactory, dialogService, currentRoom, roomRepairs) {
					$scope.newRoomRepair = {};

					function Init() {
						$scope.DateTimePickerOption = {
							format: 'dd/MM/yyyy HH:mm'
						};

						$scope.currentRoom = currentRoom;
						$scope.roomRepairs = roomRepairs;
						$scope.newRoomRepair.RoomId = $scope.currentRoom.RoomId;
						$scope.newRoomRepair.RepairStartDate = new Date();
						$scope.str = $scope.newRoomRepair.RepairStartDate.format('dd/mm/yyyy HH:MM');
						$scope.str2 = null;
						$scope.warningDateNull = false;
						$scope.warningDateInvalid = false;
						$scope.warningDateCurrentTime = false;
						$scope.warningReason = false;
						$scope.warningConflict = false;
					}
					Init();

					function CheckTimeRangeConflict(start_1, end_1, start_2, end_2) {
						return (start_1 < end_2 && start_2 <= end_1);
					}
					$scope.hide = function () {
						$mdDialog.hide();
					};
					$scope.cancel = function () {
						$mdDialog.cancel();
					};

					$scope.addRoomRepair = function () {
						if ($scope.newRoomRepair.RepairStartDate == null || $scope.newRoomRepair.RepairEndDate == null) {
							$scope.warningDateNull = true;
							$scope.warningDateInvalid = false;
							$scope.warningDateCurrentTime = false;
							$scope.warningReason = false;
							$scope.warningConflict = false;
							return;
						}
						var RepairStartDateTemp = new Date($scope.newRoomRepair.RepairStartDate.getFullYear(), $scope.newRoomRepair.RepairStartDate.getMonth(), $scope.newRoomRepair.RepairStartDate.getDate());
						var RepairEndDateTemp = new Date($scope.newRoomRepair.RepairEndDate.getFullYear(), $scope.newRoomRepair.RepairEndDate.getMonth(), $scope.newRoomRepair.RepairEndDate.getDate());
						var newDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
						console.log("REPAIR TEMP", RepairStartDateTemp, RepairEndDateTemp, newDate);
						if (RepairStartDateTemp < newDate || RepairEndDateTemp < newDate) {
							console.log("GET VALID CURRENT TIME");
							$scope.warningDateCurrentTime = true;
							$scope.warningDateNull = false;
							$scope.warningDateInvalid = false;
							$scope.warningReason = false;
							$scope.warningConflict = false;
							return;
						}

						if ($scope.newRoomRepair.RepairStartDate > $scope.newRoomRepair.RepairEndDate) {
							$scope.warningDateInvalid = true;
							$scope.warningDateNull = false;
							$scope.warningDateCurrentTime = false;
							$scope.warningReason = false;
							$scope.warningConflict = false;
							return;
						}

						if (!$scope.newRoomRepair.RepairReason || $scope.newRoomRepair.RepairReason.trim() == '') {
							$scope.warningReason = true;
							$scope.warningDateNull = false;
							$scope.warningDateInvalid = false;
							$scope.warningDateCurrentTime = false;
							$scope.warningConflict = false;
							return;
						}
						for (var index in $scope.roomRepairs) {
							if (CheckTimeRangeConflict($scope.roomRepairs[index].roomRepair.RepairStartDate, $scope.roomRepairs[index].roomRepair.RepairEndDate, $scope.newRoomRepair.RepairStartDate, $scope.newRoomRepair.RepairEndDate) && $scope.roomRepairs[index].roomRepair.IsDeleted === false) {
								$scope.warningConflict = true;
								$scope.warningDateNull = false;
								$scope.warningDateInvalid = false;
								$scope.warningDateCurrentTime = false;
								$scope.warningReason = false;
								return;
							}
						}
						var addRoomRepair = loginFactory.securedPostJSON("api/Config/Rooms/AddRoomRepair", $scope.newRoomRepair);
						$rootScope.dataLoadingPromise = addRoomRepair;
						addRoomRepair.success(function (data) {
							dialogService.toast("ADD_ROOM_REPAIR_SUCCESSFUL");
							$mdDialog.hide(data);
						}).error(function (err) {
							if (err.Meassage) {
								$mdDialog.hide(null);
								dialogService.messageBox("ERROR", err.Meassage);
							} else {
								$mdDialog.hide(null);
								conflictReservationProcess(err);
							};
						});
					};
				}
			};

		};

	}
	EditRoomDialogController.$inject = ['$scope', '$mdDialog', 'roomEditing', 'allRoomTypes', 'loginFactory'];

	function EditRoomDialogController($scope, $mdDialog, roomEditing, allRoomTypes, loginFactory) {
		var initial = angular.copy(roomEditing);
		$scope.warning = false;
		$scope.IsFloorDisabled = false;
		var GetAllRoomReservations = loginFactory.securedGet("api/Config/Rooms/GetAllRoomReservations", "roomId=" + roomEditing.RoomId);
		GetAllRoomReservations.success(function (data) {
			console.log("ALREADY RR", data);
			if (data.length > 0) {
				$scope.warning = true;
			};
		});

		var getAllRoomTypes = loginFactory.securedPostJSON("api/Config/RoomTypes/AllRoomType");
		getAllRoomTypes.success(function (data) {
			$scope.allRoomTypes = data;
		}).error(function (err) {
			console.log(err);
		});
		//
		var getAllFloor = loginFactory.securedGet("api/Config/getAllFloor");
		getAllFloor.success(function (data) {
			$scope.floors = data;
			for (var idx in data) {
				if (data[idx].FloorId == roomEditing.FloorId && data[idx].IsActive == false) {
					$scope.IsFloorDisabled = true;
				}
			}
		}).error(function (err) {
			console.log(err);
		});
		//
		$scope.hide = function () {
			$mdDialog.hide();
		};
		$scope.cancel = function () {
			angular.copy(initial, $scope.roomEditing);
			$mdDialog.cancel();
		};
		$scope.saveEdited = function (roomEdited) {

			$mdDialog.hide(roomEdited);
		};

		$scope.roomEditing = roomEditing;
	}

	$scope.goToRoom = function (room, event) {
		var roomTemp = angular.copy(room);
		console.log("ROOM TEMP", roomTemp);
		$mdDialog.show({
			controller: EditRoomDialogController,
			resolve: {
				roomEditing: function () {
					return roomTemp;
				},
				allRoomTypes: function () {
					return roomTemp.roomTypes;
				}
			},
			templateUrl: 'views/templates/editRoom.tmpl.html',
			parent: angular.element(document.body),
			targetEvent: event,
		}).then(function (roomEdited) {
			var saveRoom = loginFactory.securedPostJSON("api/Config/Rooms/SaveRoom", roomEdited);
			$rootScope.dataLoadingPromise = saveRoom;
			saveRoom.success(function (data) {
				dialogService.toast("ROOM_EDIT_SUCCESSFUL");
				configRoomListInit();
			}).error(function (err) {
				dialogService.messageBox(err.Message);
			});

		}, function () {
			$scope.alert = 'You cancelled the dialog.';
		});
	};



	$scope.createRoom = function () {
		$mdDialog.show({
			controller: CreateRoomDialogController,
			templateUrl: 'views/templates/createRoom.tmpl.html',
			parent: angular.element(document.body),
			targetEvent: event,
		}).then(function (newRoom) {
			configFactory.createRoom(newRoom, function () {
				//$scope.rooms.push(newRoom);
				configRoomListInit();
			});
		}, function () { });
	};
	CreateRoomDialogController.$inject = ['$scope', '$mdDialog', 'loginFactory', '$rootScope'];

	function CreateRoomDialogController($scope, $mdDialog, loginFactory, $rootScope) {
		function Init() {
			$scope.newRoom = {
				RoomName: "",
				RoomLocation: "",
				RoomDescription: "",
				RoomTypeId: "",
				Price: "",
				FloorId: 0,
				IsHidden: false
			};

			var getAllRoomTypes = loginFactory.securedPostJSON("api/Config/RoomTypes/AllRoomType");
			$rootScope.dataLoadingPromise = getAllRoomTypes;
			getAllRoomTypes.success(function (data) {
				$scope.roomTypes = data;
			}).error(function (err) {
				console.log(err);
			});
			var getAllFloor = loginFactory.securedGet("api/Config/getAllFloor");
			getAllFloor.success(function (data) {
				$scope.floors = data;
			}).error(function (err) {
				console.log(err);
			});
		}
		Init();

		$scope.cancel = function () {
			$mdDialog.cancel();
		};
		$scope.saveNewRoom = function (newRoomType) {

			$mdDialog.hide(newRoomType);
		};

		//$scope.roomTypes = allRoomTypes;

	}
	$scope.ViewArrangeRoom = function () {
		if ($scope.floors.length > 0) {
			var list = {
				selected: null,
				listFloor: []
			};
			angular.forEach($scope.floors, function (floor, f_Index) {
				list.listFloor.push({
					FloorId: floor.FloorId,
					FloorName: floor.FloorName,
					OrderNumber: floor.OrderNumber,
					IsActive: floor.IsActive,
					ListRoom: []
				});
				angular.forEach($scope.rooms, function (room, r_index) {
					if (f_Index == 0 && list.listFloor[0] != null && (room.room.FloorId == 0 || room.room.FloorId == null)) {
						list.listFloor[0].ListRoom.push(room);
					};
					if (list.listFloor[f_Index] != null && (room.room.FloorId == floor.FloorId)) {
						list.listFloor[f_Index].ListRoom.push(room);
					};
				});
				list.listFloor[f_Index].ListRoom.sort(function (a, b) {
					return a.room.OrderNumber - b.room.OrderNumber;
				});
			});
			list.listFloor.sort(function (a, b) {
				return a.OrderNumber - b.OrderNumber;
			})
			$scope.list = list;
		};
		$scope.viewSortRoom = !$scope.viewSortRoom;
	};
	$scope.SaveArrangeRoom = function () {
		var listRoom = [];
		var orderNumber = 0;
		angular.forEach($scope.list.listFloor, function (floor, index) {
			angular.forEach(floor.ListRoom, function (room, r_index) {
				var roomTemp = room.room;
				roomTemp.OrderNumber = orderNumber;
				roomTemp.FloorId = floor.FloorId;
				listRoom.push(roomTemp);
				orderNumber += 1;
			});
		});
		configFactory.ArrangeRoom(listRoom, function (data) {
			configRoomListInit();
			$scope.ViewArrangeRoom();
			dialogService.toast("ARRANGE_ROOM_SUCCES");
		});
	};
	$scope.openMenu = function ($mdOpenMenu, ev) {
		$mdOpenMenu(ev);
	};
	$scope.menuItemClick = function (item, result, event) {
		if (item.name == "EDIT") {
			$scope.goToRoom(result.room, event)
		} else if (item.name == "MAINTENANCE_BLOCK") {
			$scope.roomRepair(result, event)
		} else if (item.name == "DELETE_ROOM") {
			deleteRoom(result.room.RoomId);
		}
	};
	function deleteRoom(roomId) {
		dialogService.confirm("DELETE_ROOM_CONFIRM").then(function () {
			configFactory.deleteRoom(roomId, function (data) {
				dialogService.toast("DELETE_ROOM_SUCCESS");
				configRoomListInit();
			});
		});
	}

	$scope.filter_Rooms = function (keyS) {

		if (keyS == null || keyS == "") {
			$scope.rooms = listRoom;
		}
		else {
			var temp = [];
			temp = _.filter(listRoom, function (item) {
				return item.room.RoomName.includes(keyS);
			});

			$scope.rooms = temp;
		}
	}
}]);