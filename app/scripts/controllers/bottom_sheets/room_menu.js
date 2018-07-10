ezCloud.controller('roomMenuController', ['$scope', '$rootScope', '$mdBottomSheet', '$state', '$filter', 'selectedRoomFactory', '$location', '$mdDialog', 'loginFactory', 'dialogService', 'reservationFactory', '$mdMedia', 'smartCardFactory', 'SharedFeaturesFactory',
function ($scope, $rootScope, $mdBottomSheet, $state, $filter, selectedRoomFactory, $location, $mdDialog, loginFactory, dialogService, reservationFactory, $mdMedia, smartCardFactory, SharedFeaturesFactory) {
	var selectedRoom = selectedRoomFactory.getSelectedRoom();
	var extraService = selectedRoomFactory.getExtraService();
	var viewType = selectedRoomFactory.getViewType();
	var currentHotelConnectivities = selectedRoomFactory.getCurrentHotelConnectivities();
	console.log('selectedRoom', selectedRoom,extraService );
	console.log("currentHotelConnectivities", currentHotelConnectivities);
	var menus = [];
	var menuExtraService = [];
	if (!selectedRoom.reservationRoom) {
		menus = [

			{
				name: "WALKIN",
				icon: "ic_add_24px.svg",
				url: "walkin/" + selectedRoom.RoomId
		},

			{
				name: "BOOKING_LIST",
				icon: "ic_view_headline_24px.svg",
				url: ""
			}
		];

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
		//loinq
		if (selectedRoom.BookingStatus == "CHECKOUT") {
			menus.push({
				name: "VIEW_DETAIL",
				icon: "ic_pageview_24px.svg",
				url: "reservation/" + selectedRoom.reservationRoom.ReservationRoomId
			});

			if ( $rootScope.user.Roles.indexOf('ROLE_HOTEL_STAFF') < 0 ) {
				menus.push({
					name: "PRE_CHECKOUT",
					icon: "ic_reply_24px.svg",
					url: ""
				});
			}

		} else {

			if(selectedRoom.roomMove!=undefined){

				menus.push({
							name: "VIEW_DETAIL",
							icon: "ic_pageview_24px.svg",
							url: "reservation/" + selectedRoom.reservationRoom.ReservationRoomId
					});
				if (selectedRoom.reservationRoom.IsGroup)
				{
					menus.push({
							name: "EDIT_GROUP",
							icon: "ic_pageview_24px.svg",
							url: "groupReservationDetail/" + selectedRoom.reservationRoom.Reservations.ReservationId
					});
				}
				menus.push({
							name: "AMEND_STAY",
							icon: "ic_alarm_add_24px.svg",
					});

				menus.push({
							name: "ROOM_MOVE",
							icon: "ic_swap_horiz_24px.svg",
					});
				menus.push({
							name: "COPY",
							icon: "ic_content_copy_24px.svg",
					});


			}else{

				menus.push({
							name: "VIEW_DETAIL",
							icon: "ic_pageview_24px.svg",
							url: "reservation/" + selectedRoom.reservationRoom.ReservationRoomId
					});

				if (selectedRoom.reservationRoom.IsGroup)
				{
					menus.push({
							name: "EDIT_GROUP",
							icon: "ic_pageview_24px.svg",
							url: "groupReservationDetail/" + selectedRoom.reservationRoom.Reservations.ReservationId
					});
				}
				menus.push({
						name: "BOOKING_LIST",
						icon: "ic_view_headline_24px.svg",
					});
				menus.push({
					name: "AMEND_STAY",
					icon: "ic_alarm_add_24px.svg",
				});
				menus.push({
					name: "ROOM_MOVE",
					icon: "ic_swap_horiz_24px.svg",
				});
				menus.push({
					name: "COPY",
					icon: "ic_content_copy_24px.svg",
				});
				/*if (selectedRoom.reservationRoom.IsGroup)
				{
					menus = [
						{
							name: "VIEW_DETAIL",
							icon: "ic_pageview_24px.svg",
							url: "reservation/" + selectedRoom.reservationRoom.ReservationRoomId
						},
						{
								name: "EDIT_GROUP",
								icon: "ic_pageview_24px.svg",
								url: "groupReservationDetail/" + selectedRoom.reservationRoom.Reservations.ReservationId
						},
						{
								name: "BOOKING_LIST",
								icon: "ic_view_headline_24px.svg",
						},
						{
								name: "AMEND_STAY",
								icon: "ic_alarm_add_24px.svg",
						},
						{
								name: "ROOM_MOVE",
								icon: "ic_swap_horiz_24px.svg",
						},
						{
								name: "COPY",
								icon: "ic_content_copy_24px.svg",
						}

					];
				}
				else
				{
					menus = [
						{
							name: "VIEW_DETAIL",
							icon: "ic_pageview_24px.svg",
							url: "reservation/" + selectedRoom.reservationRoom.ReservationRoomId
						},
						{
								name: "BOOKING_LIST",
								icon: "ic_view_headline_24px.svg",
						},
						{
								name: "AMEND_STAY",
								icon: "ic_alarm_add_24px.svg",
						},
						{
								name: "ROOM_MOVE",
								icon: "ic_swap_horiz_24px.svg",
						},
						{
								name: "COPY",
								icon: "ic_content_copy_24px.svg",
						}

					];
				}	*/

			}
		}



		if ((selectedRoom.BookingStatus === "CHECKIN" || selectedRoom.BookingStatus === "OVERDUE") && $rootScope.user.Roles.indexOf('ROLE_HOTEL_STAFF') < 0) {
			menus.push({
				name: "PRE_CHECKIN",
				icon: "ic_reply_24px.svg",
				url: ""
			});

		}

		if (selectedRoom.BookingStatus === "BOOKED" || selectedRoom.BookingStatus === "NOSHOW") {
			menus.push({
				name: "CANCEL",
				icon: "ic_cancel_24px.svg",
			});

		}

		if (selectedRoom.HouseStatus === "DIRTY") {
			if(selectedRoom.roomMove==undefined){
				menus.push({
					name: "CLEAN",
					icon: "ic_toys_24px.svg",
				});
			}
		} else if (selectedRoom.HouseStatus !== "REPAIR") {
			//loinq
			if (selectedRoom.BookingStatus != "CHECKOUT") {
				if(selectedRoom.roomMove==undefined){
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

			if (extraService!==null && extraService.ExtraServiceTypes!==null)
			{
				for (var index in extraService.ExtraServiceTypes)
				{

					switch(extraService.ExtraServiceTypes[index].ExtraServiceTypeName) {
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

			if (currentHotelConnectivities.isUsed && selectedRoom.UseLock) {
				menus.push({
					name: "CREATE_CARD",
					icon: "ic_credit_card_24px.svg",
				});
			}
		}

		if (selectedRoom.BookingStatus === "BOOKED" || selectedRoom.BookingStatus === "NOSHOW") {
			menus.push({
				name: "UNASSIGN_ROOM",
				icon: "ic_grid_off_24px.svg",
			});
			if (currentHotelConnectivities.isUsed && selectedRoom.UseLock) {
				menus.push({
					name: "CREATE_CARD",
					icon: "ic_credit_card_24px.svg",
				});
			}
		}
	}

	$scope.menus = menus;
	$scope.menuExtraService = menuExtraService;
	$scope.selectedRoom = selectedRoom;

	$scope.listItemClick = function (item) {
		$mdBottomSheet.hide();
		console.log(item);
		//loinq
		if (item.name === 'PRE_CHECKOUT') {
			//frontOfficeFactory.processChangeReservationStatus(item, $scope.selectedRoom, null, "PRE_CHECKOUT");
			processChangeReservationStatus(item, $scope.selectedRoom, null, "PRE_CHECKOUT");
		}
		//
		if (item.name === 'BOOKING_LIST') {
			$mdDialog.show({
				controller: ShowReservationListController,
				resolve: {
					selectedRoom: function () {
						return $scope.selectedRoom;
					},
				},
				templateUrl: 'views/templates/reservationList.tmpl.html',
				parent: angular.element(document.body),
				targetEvent: event,
			}).then(function () {

			}, function () {

			});
		}
		//done-package
		if (item.name === 'AMEND_STAY') {
			var selectedRoomTemp = angular.copy($scope.selectedRoom.reservationRoom);
			if(!selectedRoomTemp.Rooms) {
				selectedRoomTemp.Rooms = {};
				selectedRoomTemp.Rooms.RoomName = angular.copy($scope.selectedRoom.RoomName);
			}
			if(!selectedRoomTemp.RoomTypes)
				selectedRoomTemp.RoomTypes = angular.copy($scope.selectedRoom.roomType);
			
			SharedFeaturesFactory.processAmendStay(selectedRoomTemp);
		}
		//done-package
		if (item.name === 'CANCEL') {
			var selectedRoom = angular.copy($scope.selectedRoom);
			SharedFeaturesFactory.processCancel(selectedRoom);
		}
		//done-package
		if (item.name === 'CLEAN') {
			var selectedRoom = angular.copy($scope.selectedRoom);
			SharedFeaturesFactory.processClean(selectedRoom, function(){
				$rootScope.$emit("HomeInit", {});
			});
		}

		if (item.name === 'CHECKOUT') {
			$mdBottomSheet.hide(selectedRoom);
		}
		//done-package
		if (item.name === 'UNASSIGN_ROOM') {
			var selectedRoom = angular.copy($scope.selectedRoom.reservationRoom);
			SharedFeaturesFactory.processUnassignRoom(selectedRoom);
		}
		//done-package
		if (item.name === 'COPY') {
			var selectedRoom = angular.copy($scope.selectedRoom);
			var itemTmp = angular.copy(item);
			SharedFeaturesFactory.processCopyReservation(selectedRoom,itemTmp);
		}
		//done-package
		if (item.name === 'ROOM_MOVE') {
			var selectedRoom = angular.copy($scope.selectedRoom);
			SharedFeaturesFactory.processRoomMove(selectedRoom);
		}
		//done-package
		if (item.name === 'SET_ROOM_DIRTY') {
			var selectedRoom = angular.copy($scope.selectedRoom);
			SharedFeaturesFactory.processSetDirtyRoom(selectedRoom, function(){
				$rootScope.$emit("HomeInit", {});
			});
		}
		
		if (item.name === 'CREATE_CARD') {
			var hourAddToCheckOut = null;
			console.log("ROOMID", $scope.selectedRoom.RoomName);
			if(currentHotelConnectivities.IsAutomaticalAddHourCheckout == true){
				hourAddToCheckOut = currentHotelConnectivities.HourAddToCheckout;
			};
			smartCardFactory.createCard($scope.selectedRoom,hourAddToCheckOut);
		}
		//done-package
		if (item.name === 'PRE_CHECKIN') {
			var selectedRoom = angular.copy($scope.selectedRoom);
			SharedFeaturesFactory.processUndoCheckIn(selectedRoom);
		}
		
		if (item.url)
			$location.path(item.url);
	};

	function processChangeReservationStatus(scope, result, el, actionCode) {
		var keys = ["RES_NO", "ROOM", "NOTIFICATION_PRE_CHẸCKOUT", "NOTIFICATION_PRE_CHẸCKIN", "THIS_ROOM_EXTRA_SERVICE_WAS_DELETED_AUTOMATICALLY_BY_THE_PRE_CHECKIN_PROCESS", "THIS_ROOM_EXTRA_SERVICE_ITEM_WAS_DELETED_AUTOMATICALLY_BY_THE_PRE_CHECKIN_PROCESS", "THIS_PAYMENT_WAS_DELETED_AUTOMATICALLY_BY_THE_PRE_CHECKIN_PROCESS"];
		var languageKeys = {};
		for (var idx in keys) {
			languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
		}
		console.log("ACTION CODE", actionCode);
		$mdDialog.show({
			controller: ChangeReservationStatusDialogController,
			resolve: {
				action: function () {
					return actionCode;
				}
			},
			templateUrl: 'views/templates/changeReservationStatus.tmpl.html',
			parent: angular.element(document.body),
			targetEvent: event,
		}).then(function (reason) {
			var ChangeReservationStatusModel = {
				RRID: result.ReservationRoomId,
				ActionCode: actionCode,
				Reason: reason,
				languageKeys: languageKeys
			}
			var changeReservationStatusProcess = loginFactory.securedPostJSON("api/Room/ProcessChangeReservationStatus", ChangeReservationStatusModel);
			$rootScope.dataLoadingPromise = changeReservationStatusProcess;
			changeReservationStatusProcess.success(function (data) {
				if (actionCode === "PRE_CHECKIN") {
					dialogService.toast("PRE_CHECKIN_SUCCESSFUL");
				}

				if (actionCode === "PRE_CHECKOUT") {
					dialogService.toast("PRE_CHECKOUT_SUCCESSFUL");
				}
				if (el != null) {
					$timeout(function () {
						angular.element(el).triggerHandler('click');
					}, 0);
				}
				//$rootScope.pageInit = true;
				$rootScope.$emit("HomeInit", {});

			}).error(function (err) {
				if (err.Message) {
					dialogService.messageBox("ERROR", err.Message)
				} else {
					conflictReservationProcess(err);
				};
			})
		}, function () {

		});

		function ChangeReservationStatusDialogController($scope, $mdDialog, action) {
			function Init() {
				$scope.action = action;
				$scope.reason = null;
			}
			Init();
			$scope.hide = function () {
				$mdDialog.hide();
			};
			$scope.cancel = function () {
				$mdDialog.cancel();
			};
			$scope.processPreCheckIn = function () {
				$mdDialog.hide($scope.reason);
			}

		}

	}

	function ShowReservationListController($scope, $mdDialog, selectedRoom, loginFactory) {
		function Init() {
			$scope.selectedRoom = selectedRoom;
		}
		Init();
		$scope.hide = function () {
			$mdDialog.hide();
		};
		$scope.cancel = function () {
			$mdDialog.cancel();
		};
	}
	//done-package
	$scope.listExtraServiceClick = function (item) {
		var selectedRoom = angular.copy($scope.selectedRoom);
		var itemTmp = angular.copy(item);
		SharedFeaturesFactory.processAddExtraService(selectedRoom,itemTmp);
	}

	$scope.showInvoice = function (ev) {
		var confirm = dialogService.confirm("CONFIRM", "WOULD_YOU_LIKE_TO_DISPLAY_THIS_ROOM_INVOICE" + "?", ev).then(function () {
				var keys = ["ROOM_MONTHLY", "ROOM_WEEKLY", "ROOM_FULL_DAY", "ROOM_DAY_NIGHT", "ROOM_HOURLY", "MINIBAR", "LAUNDRY", "EXTRA_ROOM_CHARGE", "COMPENSATION", "EXTRA_SERVICES", "FULL_DAY_EARLY_CHECKIN", "FULL_DAY_LATE_CHECKOUT", "DAY_NIGHT_EARLY_CHECKIN", "DAY_NIGHT_LATE_CHECKOUT", "EXTRA_ADULTS", "EXTRA_CHILDREN"];
				var languageKeys = {};
				for (var idx in keys) {
					languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
				}

				var CreateRoomInvoice = {
					roomId: $scope.room.RoomId,
					reservationRoomId: $stateParams.reservationRoomId,
					arrivalDate: $scope.room.ArrivalDate,
					departureDate: new Date(),
					adults: $scope.room.Adults,
					children: $scope.room.Child,
					languageKeys: languageKeys,
					RoomPriceId: $scope.room.RoomPriceId,
					Price: $scope.room.Price
				}
				var CreateRoomInvoice = loginFactory.securedPostJSON("api/Room/CreateRoomInvoice", CreateRoomInvoice);
				$rootScope.dataLoadingPromise = CreateRoomInvoice;
				CreateRoomInvoice.success(function (data) {
					$mdDialog.show({
							controller: InvoiceController,
							locals: {
								reservationRoomId: $stateParams.reservationRoomId
							},
							templateUrl: 'views/templates/invoice.tmpl.html',
							parent: angular.element(document.body),
							targetEvent: ev,
							clickOutsideToClose: false
						})
						.then(function (answer) {}, function () {

						});
				}).error(function (err) {
					console.log(err);
				});

			},
			function () {

			});

	};

	function showThisInvoice(reservationRoomId) {
		console.log("Show it");
		$("#reportViewer1").telerik_ReportViewer({
			// The URL of the service which will serve reports.
			// The URL corresponds to the name of the controller class (ReportsController).
			// For more information on how to configure the service please check http://www.telerik.com/help/reporting/telerik-reporting-rest-conception.html.
			serviceUrl: apiUrl + "api/reports/",

			// The URL for the report viewer template. The template can be edited -
			// new functionalities can be added and unneeded ones can be removed.
			// For more information please check http://www.telerik.com/help/reporting/html5-report-viewer-templates.html.
			templateUrl: 'ReportViewer/templates/telerikReportViewerTemplate-9.2.15.930.html',

			//ReportSource - report description
			reportSource: {

				// The report can be set to a report file name (trdx report definition)
				// or CLR type name (report class definition).
				report: "ezCloud.Reporting.RoomInvoice, ezCloud.Reporting",

				// Parameters name value dictionary
				parameters: {
					ReservationRoomId: reservationRoomId
				}
			},

			// Specifies whether the viewer is in interactive or print preview mode.
			// PRINT_PREVIEW - Displays the paginated report as if it is printed on paper. Interactivity is not enabled.
			// INTERACTIVE - Displays the report in its original width and height without paging. Additionally interactivity is enabled.
			viewMode: telerikReportViewer.ViewModes.PRINTPREVIEW,

			// Sets the scale mode of the viewer.
			// Three modes exist currently:
			// FIT_PAGE - The whole report will fit on the page (will zoom in or out), regardless of its width and height.
			// FIT_PAGE_WIDTH - The report will be zoomed in or out so that the width of the screen and the width of the report match.
			// SPECIFIC - Uses the scale to zoom in and out the report.
			scaleMode: telerikReportViewer.ScaleModes.SPECIFIC,

			// Zoom in and out the report using the scale
			// 1.0 is equal to 100%, i.e. the original size of the report
			scale: 1.0,

			ready: function () {
				//this.refreshReport();
			},

		});

	}

	function InvoiceController($scope, $mdDialog, reservationRoomId) {

		//showInvoice(reservationRoomId);
		globalInvoiceId = reservationRoomId;

		$scope.hide = function () {
			$mdDialog.hide();
		};
		$scope.cancel = function () {
			$mdDialog.cancel();
		};
	}

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
					//fullscreen: useFullScreen
				})
				.then(function (answer) {}, function () {});

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
}]);