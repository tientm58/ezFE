ezCloud.controller('houseKeeping_MenuController', ['$scope', '$rootScope', '$mdBottomSheet', '$state', '$filter', 'selectedRoomFactory', '$location', '$mdDialog', 'loginFactory', 'dialogService', 'reservationFactory', '$mdMedia', 'smartCardFactory', function ($scope, $rootScope, $mdBottomSheet, $state, $filter, selectedRoomFactory, $location, $mdDialog, loginFactory, dialogService, reservationFactory, $mdMedia, smartCardFactory) {
	var selectedRoom = selectedRoomFactory.getSelectedRoom();
	var extraService = selectedRoomFactory.getExtraService();
	var viewType = selectedRoomFactory.getViewType();
	var currentHotelConnectivities = selectedRoomFactory.getCurrentHotelConnectivities();
	console.log('selectedRoom', selectedRoom, extraService);
	console.log("currentHotelConnectivities", currentHotelConnectivities);
	var menus = [];
	var menuExtraService = [];
	if (!selectedRoom.reservationRoom) {
		// menus = [

		// 	{
		// 		name: "WALKIN",
		// 		icon: "ic_add_24px.svg",
		// 		url: "walkin/" + selectedRoom.RoomId
		// 	},

		// 	{
		// 		name: "BOOKING_LIST",
		// 		icon: "ic_view_headline_24px.svg",
		// 		url: ""
		// 	}
		// ];

		if (selectedRoom.HouseStatus === "DIRTY") {
			menus.push({
				name: "CLEAN",
				icon: "ic_toys_24px.svg",
			});
		} else if (selectedRoom.HouseStatus !== "REPAIR") {
			menus.push({
				name: "SET_ROOM_DIRTY",
				icon: "ic_report_problem_24px.svg",
			});
		}
	}

	if (selectedRoom.reservationRoom) {	

		if (selectedRoom.HouseStatus === "DIRTY") {
			if (selectedRoom.roomMove == undefined) {
				menus.push({
					name: "CLEAN",
					icon: "ic_toys_24px.svg",
				});
			}
		} else if (selectedRoom.HouseStatus !== "REPAIR") {
			//loinq
			if (selectedRoom.BookingStatus != "CHECKOUT") {
				if (selectedRoom.roomMove == undefined) {
					menus.push({
						name: "SET_ROOM_DIRTY",
						icon: "ic_report_problem_24px.svg",
					});
				}
			}
		}

		if (selectedRoom.BookingStatus === "CHECKIN" || selectedRoom.BookingStatus === "OVERDUE") {


			menuExtraService = [
				{
					name: "MINIBAR",
					icon: "ic_local_bar_24px.svg",
					url: ""

				},
				{
					name: "LAUNDRY",
					icon: "ic_local_laundry_service_24px.svg",
					url: ""
				},
				{
					name: "EXTRA_ROOM_CHARGE",
					icon: "ic_local_pizza_24px.svg",
					url: ""
				},
				{
					name: "COMPENSATION",
					icon: "ic_airline_seat_flat_angled_24px.svg",
					url: ""
				},
				{
					name: "EXTRA_SERVICES",
					icon: "ic_local_pharmacy_24px.svg",
					url: ""
				}

			];

			if (extraService !== null && extraService.ExtraServiceTypes !== null) {

				for (var index in extraService.ExtraServiceTypes) {

					switch (extraService.ExtraServiceTypes[index].ExtraServiceTypeName) {
						case "MINIBAR":
							if (extraService.ExtraServiceTypes[index].IsHide) {
								menuExtraService = _.without(menuExtraService, _.findWhere(menuExtraService, {
									name: "MINIBAR"
								}));
							}
							break;
						case "LAUNDRY":

							if (extraService.ExtraServiceTypes[index].IsHide) {
								menuExtraService = _.without(menuExtraService, _.findWhere(menuExtraService, {
									name: "LAUNDRY"
								}));
							}
							break;
						case "EXTRA_ROOM_CHARGE":

							if (extraService.ExtraServiceTypes[index].IsHide) {
								menuExtraService = _.without(menuExtraService, _.findWhere(menuExtraService, {
									name: "EXTRA_ROOM_CHARGE"
								}));
							}
							break;
						case "COMPENSATION":

							if (extraService.ExtraServiceTypes[index].IsHide) {
								menuExtraService = _.without(menuExtraService, _.findWhere(menuExtraService, {
									name: "COMPENSATION"
								}));
							}
							break;

					}
				}

			}
			
		}

	}

	$scope.menus = menus;
	$scope.menuExtraService = menuExtraService;
	$scope.selectedRoom = selectedRoom;

	$scope.listItemClick = function (item) {
		$mdBottomSheet.hide();
		console.log(item);
		
		if (item.name === 'CLEAN') {
			dialogService.confirm("CLEAN", "DO_YOU_WANT_TO_SET_THIS_ROOM_CLEANED" + "?").then(function () {
				reservationFactory.changeRoomStatus(selectedRoom.RoomId, "CLEAN", function (data) {
					
					$rootScope.$emit("HomeInit", {});

					dialogService.toast("CLEAN_ROOM_SUCCESSFUL");
					
				});
			});
		}

		if (item.name === 'SET_ROOM_DIRTY') {
			dialogService.confirm("SET_ROOM_DIRTY", "DO_YOU_WANT_TO_SET_THIS_ROOM_DIRTY" + "?").then(function () {
				var processHouseStatus = loginFactory.securedPostJSON("api/HouseKeeping/ProcessHouseStatusForOnlyRoom?roomId=" + selectedRoom.RoomId, "");
				$rootScope.dataLoadingPromise = processHouseStatus;
				processHouseStatus.success(function () {
					// Init();
					//$rootScope.pageInit = true;
					dialogService.toast("SET_ROOM_DIRTY_SUCCESSFUL");
					//$rootScope.$emit("HomeInit", {});
					//selectedRoom.HouseStatus = 'DIRTY';
					$rootScope.$emit("HomeInit", {});
				}).error(function (err) {
					console.log(err);
				});
			});
		}		

		if (item.url)
			$location.path(item.url);
	};
	
	$scope.listExtraServiceClick = function (item) {
		var useFullScreen = ($mdMedia('xs') || $mdMedia('sm'));
		$mdDialog.show({
			controller: AddExtraServiceController,
			resolve: {
				selectedRoom: function () {
					return $scope.selectedRoom;
				},
				item: function () {
					return item;
				}
			},
			templateUrl: 'views/templates/addExtraService.tmpl.html',
			parent: angular.element(document.body),
			targetEvent: event,
			fullscreen: useFullScreen
		}).then(function (postItems) {
			$mdBottomSheet.hide();
			var extraServiceNoItem;
			var items
			if (postItems && postItems.items) {
				items = postItems.items;
			} else {
				extraServiceNoItem = postItems;

			}

			AddESDialogController.$inject = ['$scope', '$mdDialog', 'extraServiceNoItem', 'items'];

			function AddESDialogController($scope, $mdDialog, extraServiceNoItem, items) {
				$scope.decimal = $rootScope.decimals;
				console.log("DECIMAL", $scope.decimal);
				$scope.items = items;
				$scope.extraServiceNoItem = extraServiceNoItem;
				console.log("ES NO ITEM", $scope.extraServiceNoItem);
				console.log("ES ITEM", $scope.items);
				$scope.hide = function () {
					$mdDialog.hide();
				};
				$scope.cancel = function () {
					$mdDialog.cancel();
				};
				$scope.ok = function () {
					$mdDialog.hide();
				};
				$scope.getTotal = function (items, extraServiceNoItem) {
					var total = 0;
					for (var idx in items) {
						total += items[idx].item.Price * items[idx].quantity;
					}

					if (extraServiceNoItem != null) {
						total += extraServiceNoItem.Amount * extraServiceNoItem.Quantity;
					}
					return total;
				};
			}
			$mdDialog.show({
				controller: AddESDialogController,
				templateUrl: 'views/reservation/subtemplates/extraserviceConfirm.html',
				resolve: {
					extraServiceNoItem: function () {
						return extraServiceNoItem;
					},
					items: function () {
						return postItems.items;
					}
				},
				parent: angular.element(document.body),
				targetEvent: null,
			}).then(function () {
				//Save the items
				console.log("POST ITEM", postItems);
				if (postItems.items) {
					var saveItems = loginFactory.securedPostJSON("api/Room/CreateExtraService", postItems);
					$rootScope.dataLoadingPromise = saveItems;
					saveItems.success(function () {
						dialogService.toast("ADD_EXTRA_SERVICE_SUCCESSFUL");
					}).error(function (e) {
						dialogService.messageBox("ERROR", e.Message, ev);
					});
				} else {
					var saveExtraServiceNoItem = loginFactory.securedPostJSON("api/Room/CreateExtraServiceNoItem", postItems);
					$rootScope.dataLoadingPromise = saveExtraServiceNoItem;
					saveExtraServiceNoItem.success(function () {
						dialogService.toast("ADD_EXTRA_SERVICE_SUCCESSFUL");
					}).error(function (e) {
						dialogService.messageBox("ERROR", e.Message, ev);
					});
				}

			}, function () { });
		}, function () {

		});
	}


	function AddExtraServiceController($scope, $mdDialog, selectedRoom, item, loginFactory) {

		$scope.extraServices = {};
		$scope.selectedExtraServiceCategory = null;
		$scope.itemsInCategory = [];
		$scope.roomItemsInRoomExtraService = [];
		$scope.extraServiceNoItem = {};

		function AddExtraServiceInit() {
			$scope.decimal = $rootScope.decimals;
			var keys = ["RES_NO", "ROOM", "NOTIFICATION_WHEN_POST_EXTRASERVICE", "EXTRA_SERVICE"];
			var languageKeys = {};
			for (var idx in keys) {
				languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
			}
			$scope.extraServiceNoItem = {
				Quantity: 1
			}
			$scope.selectedRoom = selectedRoom;
			console.log("ITEM", $scope.item);
			$scope.item = item;
			var extraServiceByName = {
				name: item.name,
				reservationRoomId: selectedRoom.reservationRoom.ReservationRoomId
			};
			loginFactory.securedGet("api/Room/ExtraServiceListByName", "name=" + item.name + "&reservationRoomId=" + selectedRoom.reservationRoom.ReservationRoomId).success(function (data) {
				console.log("EXTRA SERVICE DATA", data);
				$scope.extraServices = data;
				console.log($scope.extraServices);
				if ($scope.extraServices.ExtraServiceItems.length > 0) {

				}
				for (var index in $scope.extraServices.ExtraServiceCategories) {
					for (var index2 in $scope.extraServices.ExtraServiceItems) {
						if ($scope.extraServices.ExtraServiceItems[index2].ExtraServiceCategoryId.toString() === $scope.extraServices.ExtraServiceCategories[index].ExtraServiceCategoryId.toString()) {
							if (!$scope.itemsInCategory[$scope.extraServices.ExtraServiceCategories[index].ExtraServiceCategoryId]) {
								$scope.itemsInCategory[$scope.extraServices.ExtraServiceCategories[index].ExtraServiceCategoryId] = [];
							}
							$scope.itemsInCategory[$scope.extraServices.ExtraServiceCategories[index].ExtraServiceCategoryId].push($scope.extraServices.ExtraServiceItems[index2]);
						}
					}
				}
				for (var index in $scope.itemsInCategory) {
					for (var index2 in $scope.itemsInCategory[index]) {
						$scope.itemsInCategory[index][index2].quantity = 0;
					}
				}

				$scope.extraServices.ExtraServiceItems.sort(function (a, b) {
					return a.Priority - b.Priority;
				});


			});
		}
		AddExtraServiceInit();
		$scope.increaseItemCount = function (item) {
			console.log("ITEM", item);
			item.quantity += 1;
		};

		$scope.addExtraService = function () {
			var keys = ["RES_NO", "ROOM", "NOTIFICATION_POST_EXTRASERVICE", "EXTRA_SERVICE"];
			var languageKeys = {};
			for (var idx in keys) {
				languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
			}
			var items = [];
			for (var index in $scope.itemsInCategory) {
				for (var index2 in $scope.itemsInCategory[index]) {
					if ($scope.itemsInCategory[index][index2].quantity > 0) {
						var item = {
							quantity: $scope.itemsInCategory[index][index2].quantity,
							item: $scope.itemsInCategory[index][index2]
						};
						items.push(item);
					}
				}
			}

			if (items.length == 0) {
				dialogService.messageBox("MISSING_ITEM", "PLEASE_SELECT_AT_LEAST_ONE_ITEM");
				return;
			}
			var postItems = {
				ReservationRoomId: $scope.selectedRoom.reservationRoom.ReservationRoomId,
				description: $scope.extraServices.ExtraServiceTypes.ExtraServiceTypeName + ' res:#' + $scope.selectedRoom.reservationRoom.ReservationRoomId + ' room:#' + $scope.selectedRoom.RoomId,
				name: $scope.extraServices.ExtraServiceTypes.ExtraServiceTypeName,
				items: items,
				languageKeys: languageKeys
			};
			$mdDialog.hide(postItems);
		};

		$scope.addExtraServiceNoItem = function () {
			var keys = ["RES_NO", "ROOM", "NOTIFICATION_POST_EXTRASERVICE", "EXTRA_SERVICE"];
			var languageKeys = {};
			for (var idx in keys) {
				languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
			}
			if ($scope.extraServiceNoItem.RoomExtraServiceDescription == undefined || $scope.extraServiceNoItem.RoomExtraServiceDescription.length == 0 || $scope.extraServiceNoItem.RoomExtraServiceDescription.length > 51) {
				dialogService.messageBox("MISSING_EXTRA_SERVICE", "PLEASE_FILL_NAME_AND_PRICE_OF_EXTRA_SERVICES");
				return;
			}
			if ($scope.extraServiceNoItem.Amount == undefined) {
				dialogService.messageBox("MISSING_EXTRA_SERVICE", "PLEASE_FILL_NAME_AND_PRICE_OF_EXTRA_SERVICES");
				return;
			};
			if ($scope.extraServiceNoItem.Quantity == null || $scope.extraServiceNoItem.Quantity < 0) {
				dialogService.messageBox("MISSING_EXTRA_SERVICE_QUANTITY", "PLEASE_FILL_QUANTITY_OF_EXTRA_SERVICES");
				return;
			};
			// if ($scope.extraServiceNoItem && (!$scope.extraServiceNoItem.RoomExtraServiceDescription || !$scope.extraServiceNoItem.Amount)) {
			// 	dialogService.messageBox("MISSING_EXTRA_SERVICE", "PLEASE_FILL_NAME_AND_PRICE_OF_EXTRA_SERVICES");
			// 	return;
			// }
			var postItems = {
				ReservationRoomId: $scope.selectedRoom.reservationRoom.ReservationRoomId,
				RoomExtraServiceName: "EXTRA_SERVICES",
				RoomExtraServiceDescription: $scope.extraServiceNoItem.RoomExtraServiceDescription,
				Amount: $scope.extraServiceNoItem.Amount,
				Quantity: $scope.extraServiceNoItem.Quantity,
				languageKeys: languageKeys
			}
			$mdDialog.hide(postItems);
		};

		$scope.hide = function () {
			$mdDialog.hide();
		};
		$scope.cancel = function () {
			$mdDialog.cancel();
		};
	}
	
}]);