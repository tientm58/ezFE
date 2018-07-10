ezCloud.factory("roomMenuFactory", ['$http', 'loginFactory', '$rootScope', '$mdDialog', 'dialogService', '$q','$filter','$mdMedia','smartCardFactory','reservationFactory', function($http, loginFactory, $rootScope, $mdDialog, dialogService, $q,$filter,$mdMedia,smartCardFactory,reservationFactory) {

    var roomMenuFactory = {
        processPreCheckOut: function(item,selectedRoom,event,actionCode){
            processPreCheckOut(item,selectedRoom,event,actionCode);
        },
        getBookingList:function(selectedRoom){
            getBookingList(selectedRoom);
        },
        processAmendStay:function(item,selectedRoom){
            var selectedRoomTemp = angular.copy(selectedRoom);
            processAmendStay(item,selectedRoomTemp);
        },
        processCancel:function(selectedRoom){
            processCancel(selectedRoom);
        },
        processCleanRoom:function(selectedRoom){
            processClean(selectedRoom);
        },
        processSetDirtyRoom:function(selectedRoom){
            processSetDirtyRoom(selectedRoom);
        },
        processUnassignRoom:function(selectedRoom){
            processUnassignRoom(selectedRoom);
        },
        processCopy:function(item,selectRoom){
            processCopy(item,selectRoom);
        },
        processRoomMove:function(item,selectRoom){
            processRoomMove(item,selectRoom);
        },
        processCreateCard:function(currentHotelConnectivities,selectRoom){
            processCreateCard(currentHotelConnectivities,selectRoom);
        },
        processPreCheckIn:function(selectedRoom){
            processPreCheckIn(selectedRoom);
        },
        processListExtraService:function(item,selectRoom){
            processListExtraService(item,selectRoom);
        }

    };


    function processPreCheckOut(scope, result, el, actionCode){
        // $rootScope.pageInit = true;
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
				$rootScope.pageInit = true;

			}).error(function (err) {
				if (err.Message) {
					dialogService.messageBox("ERROR", err.Message)
				} else {
                    //conflictReservationProcess(err);
                    data.room.BookingStatus = "CHECKIN";
                        SharedFeaturesFactory.processConflictReservation(err,data.room, "CHECKOUT");
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
    function getBookingList(selectedRoom){
        $mdDialog.show({
            controller: ShowReservationListController,
            resolve: {
                selectedRoom: function () {
                    return selectedRoom;
                },
            },
            templateUrl: 'views/templates/reservationList.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
        }).then(function () {

        }, function () {

        });
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
    }
    function processAmendStay(item,selectedRoom){
        var useFullScreen = ($mdMedia('xs') || $mdMedia('sm'));
        $mdDialog.show({
            controller: AmendStayDialogController,
            resolve: {
                item: function () {
                    return item;
                },
                currentRoom: function () {
                    return selectedRoom;
                }
            },
            templateUrl: 'views/templates/amendStay.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
            fullscreen: useFullScreen
        }).then(function (AmendStayModel) {
            console.log("AMEND STAY MODEL", AmendStayModel);
            var saveAmendStay = loginFactory.securedPostJSON("api/Room/SaveAmendStay", AmendStayModel);
            $rootScope.dataLoadingPromise = saveAmendStay;
            saveAmendStay.success(function (data) {
                dialogService.toast("AMEND_STAY_SAVED_SUCCESSFUL");
                $rootScope.pageInit = true;
            }).error(function (err) {
                if (err.Message) {
                    dialogService.messageBox("ERROR", err.Message)
                };

            });

        }, function () {

        });
        //
        function AmendStayDialogController($scope, $mdDialog, item, currentRoom) {
            $scope.departureTime;
            $scope.warning;
            $scope.warningDate;
            $scope.warningDepartureDate;
            $scope.minDate = new Date();

            function Init() {
                console.log('currentRoom', currentRoom);
                $scope.DateTimePickerOption = {
                    format: 'dd/MM/yyyy HH:mm',
                    min: $scope.minDepartureDate
                };
                $scope.currentRoom = currentRoom;
                $scope.str = new Date($scope.currentRoom.reservationRoom.ArrivalDate).format('dd/mm/yyyy HH:MM');
                $scope.str2 = new Date($scope.currentRoom.reservationRoom.DepartureDate).format('dd/mm/yyyy HH:MM');
                $scope.warning = false;
                $scope.warningDate = false;
                $scope.warningDepartureDate = false;
            }
            Init();
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
            $scope.saveAmendStay = function () {
                var validAmendment = true;

                if ($scope.currentRoom.reservationRoom.ArrivalDate <= $scope.currentRoom.reservationRoom.DepartureDate) {
                    $scope.warningDate = false;
                    if ($scope.currentRoom.reservationRoom.DepartureDate < new Date()) {
                        $scope.warningDepartureDate = true;
                        return;
                    } else if ($scope.currentRoom.reservationRoom.ArrivalDate <= new Date() && ($scope.currentRoom.BookingStatus == "BOOKED" || $scope.currentRoom.BookingStatus == "NOSHOW")) {
                        $scope.warningArrivalDate = true;
                        return;
                    } else {
                        var arrivalDateTemp = new Date($scope.currentRoom.reservationRoom.ArrivalDate);
                        var departureDateTemp = new Date($scope.currentRoom.reservationRoom.DepartureDate);
                        var AmendStayModel = {
                            reservationRoomId: $scope.currentRoom.reservationRoom.ReservationRoomId,
                            departureDate: $scope.currentRoom.reservationRoom.DepartureDate,
                            arrivalDate: $scope.currentRoom.reservationRoom.ArrivalDate,
                            adults: $scope.currentRoom.reservationRoom.Adults,
                            child: $scope.currentRoom.reservationRoom.Child
                        }
                        // if ($scope.currentRoom.roomBookingList.length > 0) {
                        if ($scope.currentRoom.roomBookingList != null) {
                            if ($scope.currentRoom.roomBookingList.length > 0) {
                                for (var index in $scope.currentRoom.roomBookingList) {
                                    var bookingTemp = $scope.currentRoom.roomBookingList[index];
                                    if (bookingTemp.ArrivalDate != undefined && bookingTemp.DepartureDate != undefined) {
                                        if (bookingTemp.ArrivalDate.getTime() <= departureDateTemp.getTime() && departureDateTemp.getTime() <= bookingTemp.DepartureDate.getTime() ||
                                            departureDateTemp.getTime() >= bookingTemp.DepartureDate.getTime()) {
                                            validAmendment = false;
                                            break;
                                        }
                                    }
                                }
                            }
                            //
                            if ($scope.currentRoom.roomBookingList && $scope.currentRoom.roomBookingList.NextReservation && $scope.currentRoom.roomBookingList.NextReservation.length > 0) {
                                for (var index in $scope.currentRoom.roomBookingList.NextReservation) {
                                    var bookingTemp = $scope.currentRoom.roomBookingList.NextReservation[index];
                                    if (bookingTemp.BookingStatus != undefined && bookingTemp.BookingStatus != null) {
                                        bookingTemp.ArrivalDate = new Date(bookingTemp.ArrivalDate);
                                        bookingTemp.DepartureDate = new Date(bookingTemp.DepartureDate);
                                        if (bookingTemp.ArrivalDate) {
                                            bookingTemp.ArrivalDate = new Date(bookingTemp.ArrivalDate);
                                        }
                                        if (bookingTemp.DepartureDate) {
                                            bookingTemp.DepartureDate = new Date(bookingTemp.DepartureDate);
                                        }
                                        if (bookingTemp.ArrivalDate.getTime() <= departureDateTemp.getTime() && departureDateTemp.getTime() <= bookingTemp.DepartureDate.getTime() ||
                                            departureDateTemp.getTime() >= bookingTemp.DepartureDate.getTime()
                                        ) {
                                            validAmendment = false;
                                            break;
                                        }
                                    }
                                }
                            }
                            if ($scope.currentRoom.roomBookingList && $scope.currentRoom.roomBookingList.PreviousReservation && $scope.currentRoom.roomBookingList.PreviousReservation.length > 0) {
                                for (var index in $scope.currentRoom.roomBookingList.PreviousReservation) {
                                    var bookingTemp = $scope.currentRoom.roomBookingList.PreviousReservation[index];
                                    if (bookingTemp.BookingStatus != undefined && bookingTemp.BookingStatus != null) {
                                        if (bookingTemp.ArrivalDate) {
                                            bookingTemp.ArrivalDate = new Date(bookingTemp.ArrivalDate);
                                        }
                                        if (bookingTemp.DepartureDate) {
                                            bookingTemp.DepartureDate = new Date(bookingTemp.DepartureDate);
                                        }
                                        if (bookingTemp.ArrivalDate.getTime() <= arrivalDateTemp.getTime() && arrivalDateTemp.getTime() <= bookingTemp.DepartureDate.getTime() || arrivalDateTemp.getTime() <= bookingTemp.ArrivalDate.getTime()) {
                                            validAmendment = false;
                                            break;
                                        }
                                    }
                                }
                            }
                            if (validAmendment === true) {
                                $mdDialog.hide(AmendStayModel);
                            } else {
                                $scope.warning = true;
                            }
                        } else {
                            $mdDialog.hide(AmendStayModel);
                        }
                    }

                } else {
                    $scope.warningDate = true;
                }

            }
        }
    }
    function processCancel(selectedRoom){
        if (selectedRoom.reservationRoom && selectedRoom.reservationRoom.RoomExtraServiceItemsList && selectedRoom.reservationRoom.RoomExtraServiceItemsList.length > 0) {
            var extraServiceItemTemp = _.filter(selectedRoom.reservationRoom.RoomExtraServiceItemsList, function (item) {
                return item.IsDeleted === false;
            });
            if (extraServiceItemTemp && extraServiceItemTemp.length > 0) {
                dialogService.messageBox("WARNING", "YOU_HAVE_TO_PROCESS_ALL_EXTRA_SERVICES_IN_THIS_ROOM_BEFORE_CANCEL");
                return;
            }
        }
        if (selectedRoom.reservationRoom && selectedRoom.reservationRoom.RoomExtraServicesList && selectedRoom.reservationRoom.RoomExtraServicesList.length > 0) {
            var extraServiceTemp = _.filter(selectedRoom.reservationRoom.RoomExtraServicesList, function (item) {
                return item.RoomExtraServiceName == "EXTRA_SERVICES" && item.IsDeleted === false;
            });
            if (extraServiceTemp && extraServiceTemp.length > 0) {
                dialogService.messageBox("WARNING", "YOU_HAVE_TO_PROCESS_ALL_EXTRA_SERVICES_IN_THIS_ROOM_BEFORE_CANCEL");
                return;
            }

        }
        //
        var keys = ["CANCEL_FEE", "PAYMENT_FOR_CANCELLATION_OF_RESERVATION", "REFUND_ALL_DEPOSITS_OF_RESERVATION", "RES_NO", "ROOM", "NOTIFICATION_NEWPAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER", "THIS_ROOM_EXTRA_SERVICE_WAS_DELETED_AUTOMATICALLY_BY_THE_CANCEL_PROCESS"];
        var languageKeys = {};
        for (var idx in keys) {
            languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
        }
        var selectedRoomTemp = angular.copy(selectedRoom);
        selectedRoomTemp.languageKeys = languageKeys;
        $mdDialog.show({
            controller: CancelDialogController,
            resolve: {
                ReservationRoomId: function () {
                    return selectedRoomTemp.reservationRoom.ReservationRoomId;
                },
                ReservationNumber: function () {
                    return selectedRoomTemp.reservationRoom.Reservations.ReservationNumber;
                },
                selectedRoom: function () {
                    return selectedRoomTemp;
                }

            },
            templateUrl: 'views/templates/cancelDialog.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
        }).then(function (cancelModel) {
            console.log("CANCEL MODEL", cancelModel);
            var processCancel = loginFactory.securedPostJSON("api/Room/ProcessCancel", cancelModel);
            $rootScope.dataLoadingPromise = processCancel;
            processCancel.success(function (data) {
                selectedRoom.BookingStatus = "AVAILABLE";
                delete selectedRoom.reservationRoom;
                dialogService.toast("CANCEL_BOOKING_SUCCESSFUL");
                $rootScope.pageInit = true;
            }).error(function (err) {
                if (err.Message) {
                    dialogService.messageBox("ERROR", err.Message)
                } else {
                    conflictReservationProcess(err);
                }
            })
        }, function () {

        });
        //
        function CancelDialogController($scope, $mdDialog, ReservationRoomId, ReservationNumber, selectedRoom, loginFactory) {
            $scope.warningCancellationFeeInvalid;
            $scope.warningMissingReason;

            function Init() {
                $scope.ReservationRoomId = ReservationRoomId;
                $scope.ReservationNumber = ReservationNumber;
                $scope.selectedRoom = selectedRoom;
                console.log("CANCEL SELECTED ROOM", $scope.selectedRoom);
                $scope.decimal = $rootScope.decimals;
                $scope.selectedRoom.TotalDeposit = 0;
                if ($scope.selectedRoom.reservationRoom && $scope.selectedRoom.reservationRoom.PaymentsList && $scope.selectedRoom.reservationRoom.PaymentsList.length > 0) {
                    for (var index in $scope.selectedRoom.reservationRoom.PaymentsList) {
                        if ($scope.selectedRoom.reservationRoom.PaymentsList[index].Amount != undefined) {
                            $scope.selectedRoom.TotalDeposit = $scope.selectedRoom.TotalDeposit + $scope.selectedRoom.reservationRoom.PaymentsList[index].Amount;
                        }

                        console.log("CANCEL SELECTED ROOM", $scope.selectedRoom.reservationRoom.PaymentsList[index].Amount != undefined);
                    }
                }

                if ($scope.selectedRoom.reservationRoom && $scope.selectedRoom.reservationRoom.RoomExtraServicesList && $scope.selectedRoom.reservationRoom.RoomExtraServicesList.length > 0) {
                    for (var index in $scope.selectedRoom.reservationRoom.RoomExtraServicesList) {
                        if (!$scope.selectedRoom.reservationRoom.RoomExtraServicesList[index].IsDeleted) {
                            $scope.selectedRoom.TotalDeposit = $scope.selectedRoom.TotalDeposit - $scope.selectedRoom.reservationRoom.RoomExtraServicesList[index].Amount;
                        }
                    }
                }

                if ($scope.selectedRoom.reservationRoom.ArrivalDate) {
                    $scope.selectedRoom.reservationRoom.ArrivalDate = new Date($scope.selectedRoom.reservationRoom.ArrivalDate);
                }
                if ($scope.selectedRoom.reservationRoom.DepartureDate) {
                    $scope.selectedRoom.reservationRoom.DepartureDate = new Date($scope.selectedRoom.reservationRoom.DepartureDate);
                }
                $scope.cancelReason = null;
                $scope.cancelFlat = 0;
                $scope.cancelPercentage = 0;
                $scope.warningCancellationFeeInvalid = false;
                $scope.warningMissingReason = false;
            }
            Init();

            $scope.processCancel = function () {

                if (!$scope.cancelReason || $scope.cancelReason.trim() === '') {
                    $scope.warningMissingReason = true;
                } else if ($scope.selectedRoom.TotalDeposit > 0 && $scope.selectedRoom.TotalDeposit * $scope.cancelPercentage / 100 + $scope.cancelFlat > $scope.selectedRoom.TotalDeposit) {
                    $scope.warningCancellationFeeInvalid = true;
                    $scope.warningMissingReason = false;
                } else if ($scope.applyCancellationFees && ($scope.cancelFlat + $scope.cancelPercentage === 0)) {
                    $scope.warningMissingFees = true;
                    $scope.warningCancellationFeeInvalid = false;
                    $scope.warningMissingReason = false;
                } else {
                    var cancelModel = {
                        ReservationRoomId: $scope.ReservationRoomId,
                        ApplyCancellationFees: $scope.applyCancellationFees,
                        CancelReason: $scope.cancelReason,
                        CancelFlat: $scope.cancelFlat,
                        CancelPercentage: $scope.cancelPercentage,
                        TotalDeposit: $scope.selectedRoom.TotalDeposit,
                        languageKeys: $scope.selectedRoom.languageKeys
                    };
                    $mdDialog.hide(cancelModel);
                }


            }

            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
        }
    }
    function processClean(selectedRoom){
        dialogService.confirm("CLEAN", "DO_YOU_WANT_TO_SET_THIS_ROOM_CLEANED" + "?").then(function () {
            reservationFactory.changeRoomStatus(selectedRoom.RoomId, "CLEAN", function (data) {
                selectedRoom.HouseStatus = data;
                $rootScope.pageInit = true;
            });
        });
    }
    function processSetDirtyRoom(selectedRoom){
        dialogService.confirm("SET_ROOM_DIRTY", "DO_YOU_WANT_TO_SET_THIS_ROOM_DIRTY" + "?").then(function () {
            var processHouseStatus = loginFactory.securedPostJSON("api/HouseKeeping/ProcessHouseStatusForOnlyRoom?roomId=" + selectedRoom.RoomId, "");
            $rootScope.dataLoadingPromise = processHouseStatus;
            processHouseStatus.success(function () {
                // Init();
                $rootScope.pageInit = true;
            }).error(function (err) {
                console.log(err);
            });
        });
    }
    function processUnassignRoom(selectedRoom){
        dialogService.confirm("UNASSIGN_ROOM_CONFIRM", "DO_YOU_WANT_TO_UNASSIGN_ROOM_THIS_RESERVATION").then(function () {
            var unassignRoomPromise = loginFactory.securedPostJSON("api/Room/ProcessUnassignRoom?RRID=" + selectedRoom.reservationRoom.ReservationRoomId, "")
            $rootScope.dataLoadingPromise = unassignRoomPromise;
            unassignRoomPromise.success(function (data) {
                dialogService.toast("UNASSIGN_ROOM_SUCCESSFUL");
                $rootScope.pageInit = true;
            }).error(function (err) {
                dialogService.messageBox("ERROR", err);
            })
        }, function () { });
    }
    function processCopy(item,selectRoom){
        var useFullScreen = ($mdMedia('xs') || $mdMedia('sm'));
        $mdDialog.show({
            controller: CopyDialogController,
            resolve: {
                item: function () {
                    return item;
                },
                currentRoom: function () {
                    return selectRoom;
                }
            },
            templateUrl: 'views/templates/copyReservation.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
            fullscreen: useFullScreen
        }).then(function (copyRRModel) {
            var processCopy = loginFactory.securedPostJSON("api/Room/ProcessCopyRR", copyRRModel);
            $rootScope.dataLoadingPromise = processCopy;
            processCopy.success(function (data) {
                dialogService.toast("COPY_RESERVATION_SUCCESSFUL");
                $rootScope.pageInit = true;
            }).error(function (err) {
                if (err.Message) {
                    dialogService.messageBox("Error", err.Message).then(function () {
                        $state.go($state.current, {}, {
                            reload: true
                        });
                    });
                } else {
                    conflictReservationProcess(err);
                }
            });
        }, function () {

        });
        //
        function CopyDialogController($scope, $mdDialog, item, currentRoom, roomListFactory) {
            console.log("CURRENT ROOM", currentRoom);
            var newRoom = {};

            $scope.isSelected = false;
            $scope.priceRateList = [];
            $scope.usePriceRateType = 1;

            function Init() {

                $scope.DateTimePickerOption = {
                    format: 'dd/MM/yyyy HH:mm'
                };
                $scope.currentRoom = currentRoom;
                $scope.str = new Date($scope.currentRoom.reservationRoom.ArrivalDate).format('dd/mm/yyyy HH:MM');
                $scope.str2 = new Date($scope.currentRoom.reservationRoom.DepartureDate).format('dd/mm/yyyy HH:MM');
                $scope.decimal = $rootScope.decimals;
                $scope.warningMissingRoom = false;
                $scope.warningDepartureDate = false;
                $scope.warningDate = false;
                $scope.newRoom = newRoom;
                $scope.isSelected = false;

                roomListFactory.getPriceRateList(function (data) {
                    $scope.priceRateList = data;
                    for (var index in $scope.priceRateList) {
                        if ($scope.currentRoom.reservationRoom.RoomPriceId && $scope.currentRoom.reservationRoom.RoomPriceId.toString() === $scope.priceRateList[index].RoomPriceId.toString()) {
                            $scope.currentRoom.RoomPriceName = $scope.priceRateList[index].RoomPriceName;
                            break;
                        }
                    }
                    $scope.priceRateList = $scope.priceRateList.sort(function (a, b) {
                        return parseInt(a.Priority) - parseInt(b.Priority);
                    });

                });


                roomListFactory.getRoomList(new Date(), function (data) {
                    $scope.roomList = data;
                    $scope.planList = data.planList;
                    /*var roomTypes = [];
                    for (var idx in roomListFactory.getRoomTypes()) {
                        roomTypes.push(roomListFactory.getRoomTypes()[idx]);
                    }*/
                    $scope.roomTypes = data.roomTypes;
                    $scope.availableRoom = [];
                    var arrivalDateTemp = new Date($scope.currentRoom.reservationRoom.ArrivalDate);
                    var departureDateTemp = new Date($scope.currentRoom.reservationRoom.DepartureDate);

                    //AVAILABLE PLAN LIST
                    if ($scope.planList !== null && $scope.planList.length > 0) {
                        $scope.availablePlanList = _.filter($scope.planList, function (item) {
                            return item.RoomTypeId == $scope.currentRoom.RoomTypeId;
                        })
                    }

                    $scope.newRoom.Price = $scope.currentRoom.reservationRoom.Price;
                    //$scope.newRoom.RoomId = $scope.currentRoom.RoomId;
                    $scope.newRoom.RoomId = 0;
                    $scope.newRoom.Note = $scope.currentRoom.reservationRoom.Note;
                    $scope.newRoom.RoomTypeId = $scope.currentRoom.roomType.RoomTypeId;
                    $scope.newRoom.RoomPriceId = $scope.currentRoom.reservationRoom.RoomPriceId;

                    //AVAILABLE ROOM
                    var availableRoom = [];
                    $scope.availableRoom = reservationFactory.getAvailableRoom($scope.roomList, arrivalDateTemp, departureDateTemp, availableRoom);
                });

            }
            Init();

            function addDays(date, days) {
                var result = new Date(date);
                result.setDate(result.getDate() + days);
                return result;
            }
            $scope.$watchCollection('currentRoom.reservationRoom', function (newValues, oldValues) {
                console.log("OLD VALUE", oldValues);
                console.log("NEW VALUE", newValues);
                if (_.size(newValues) !== 0 && _.size(oldValues) !== 0 && !angular.equals(newValues, oldValues)) {
                    console.log("GET HERE");
                    if (newValues.ArrivalDate !== oldValues.ArrivalDate && newValues.ArrivalDate >= oldValues.DepartureDate) {
                        newValues.DepartureDate = addDays(newValues.ArrivalDate, 1);
                    }

                    //AVAILABLE ROOM
                    var availableRoom = [];
                    $scope.availableRoom = reservationFactory.getAvailableRoom($scope.roomList, newValues.ArrivalDate, newValues.DepartureDate, availableRoom);
                }

            });

            $scope.filterValue = function ($event) {
                if (isNaN(String.fromCharCode($event.keyCode))) {
                    $event.preventDefault();
                }
            };
            $scope.newRoomPriceRateList = [];
            $scope.showOverridePriceRate = true;

            $scope.newPriceTemp = angular.copy($scope.newRoom.Price);
            $scope.$watchCollection('newRoom', function (newValues, oldValues) {
                //					console.log("NEW ROOM", newValues, oldValues);
                if (newValues && newValues !== undefined && newValues.RoomTypeId) {
                    $scope.availablePlanList = _.filter($scope.planList, function (item) {
                        return (item.IsActive && item.RoomTypeId.toString() === newValues.RoomTypeId.toString());
                    }).sort(function (a, b) {
                        return parseInt(a.Priority) - parseInt(b.Priority);
                    });

                }

                if (newValues.RoomPriceId != oldValues.RoomPriceId || newValues.RoomTypeId != oldValues.RoomTypeId) {
                    setTimeout(function () {
                        if (newValues && newValues !== undefined && newValues.RoomPriceId) {
                            $scope.newRoom.Price = _.filter($scope.availablePlanList, function (item) {
                                console.log("ITEM", item);
                                return (item.RoomPriceId.toString() === newValues.RoomPriceId.toString());
                            })[0].FullDayPrice;

                        }
                    }, 0);
                }

                if (newValues.Price != oldValues.Price && newValues.Price != 0) {
                    console.log("VALUE PRICE", newValues.Price, oldValues.Price);
                    $scope.newPriceTemp = angular.copy(newValues.Price);
                }





            });


            $scope.processCopy = function () {
                console.log("NEW ROOM", $scope.newRoom, $scope.usePriceRateType);

                if ($scope.currentRoom.reservationRoom.ArrivalDate > $scope.currentRoom.reservationRoom.DepartureDate) {
                    $scope.warningDate = true;
                    $scope.warningMissingRoom = false;
                    $scope.warningMissingReason = false;
                    $scope.warningDepartureDate = false;
                    $scope.warningMissingPrice = false;
                    return;
                }

                if (new Date($scope.currentRoom.reservationRoom.DepartureDate) < new Date() || new Date($scope.currentRoom.reservationRoom.ArrivalDate) < new Date()) {
                    $scope.warningDepartureDate = true;
                    $scope.warningDate = false;
                    $scope.warningMissingRoom = false;
                    $scope.warningMissingReason = false;
                    $scope.warningMissingPrice = false;
                    return;
                }
                if ($scope.newRoom.Price == null || $scope.newRoom.Price == "") {
                    $scope.warningMissingPrice = true;
                    $scope.warningDepartureDate = false;
                    $scope.warningDate = false;
                    $scope.warningMissingRoom = false;
                    $scope.warningMissingReason = false;
                    return;
                }

                var isDirty = false;
                if ($scope.newRoom.RoomId) {
                    for (var index in $scope.roomList) {
                        if ($scope.roomList[index].RoomId.toString() === $scope.newRoom.RoomId.toString()) {
                            if ($scope.roomList[index].HouseStatus === "DIRTY") {
                                isDirty = true;
                            }
                            break;
                        }
                    }
                }


                if (!$scope.newRoom.RoomMoveFee || $scope.newRoom.RoomMoveFee === undefined) {
                    $scope.newRoom.RoomMoveFee = 0;
                }

                var copyRRModel = {
                    ReservationRoomId: $scope.currentRoom.reservationRoom.ReservationRoomId,
                    TravellerId: $scope.currentRoom.reservationRoom.Travellers.TravellerId,
                    RoomTypeId: $scope.newRoom.RoomTypeId,
                    RoomId: $scope.newRoom.RoomId,
                    RoomPriceId: $scope.newRoom.RoomPriceId,
                    IsDirty: isDirty,
                    Note: $scope.newRoom.Note,
                    ArrivalDate: $scope.currentRoom.reservationRoom.ArrivalDate,
                    DepartureDate: $scope.currentRoom.reservationRoom.DepartureDate,
                    Price: $scope.newPriceTemp,
                    Adults: $scope.currentRoom.reservationRoom.Adults,
                    Child: $scope.currentRoom.reservationRoom.Child
                }
                $mdDialog.hide(copyRRModel);
            };

            $scope.changeSelect = function () {
                $scope.isSelected = !$scope.isSelected;
            }

            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
        }
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
    function processRoomMove(item,selectRoom){
        var useFullScreen = ($mdMedia('xs') || $mdMedia('sm'));
        $mdDialog.show({
            controller: RoomMoveDialogController,
            resolve: {
                item: function () {
                    return item;
                },
                currentRoom: function () {
                    return selectRoom;
                }
            },
            templateUrl: 'views/templates/roomMove.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
            fullscreen: useFullScreen
        }).then(function (RoomMoveModel) {
            console.log("ROOM MOVE MODEL", RoomMoveModel);
            var keys = ["ROOM_MONTHLY", "ROOM_WEEKLY", "ROOM_FULL_DAY", "ROOM_DAY_NIGHT", "ROOM_HOURLY", "MINIBAR", "LAUNDRY", "EXTRA_ROOM_CHARGE", "COMPENSATION", "EXTRA_SERVICES", "FULL_DAY_EARLY_CHECKIN", "FULL_DAY_LATE_CHECKOUT", "DAY_NIGHT_EARLY_CHECKIN", "DAY_NIGHT_LATE_CHECKOUT", "EXTRA_ADULTS", "EXTRA_CHILDREN", "ROOM_MOVE_EXTRA_SERVICES", "NOTIFICATION_CHANGE_ROOM"];
            var languageKeys = {};
            for (var idx in keys) {
                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
            }
            RoomMoveModel.languageKeys = languageKeys;
            if (RoomMoveModel.IsDirty === true && ($scope.selectedRoom.reservationRoom.BookingStatus !== "BOOKED" && $scope.selectedRoom.reservationRoom.BookingStatus !== "NOSHOW")) {
                dialogService.confirm("ROOM_DIRTY", "DO_YOU_WANT_TO_CONTINUE" + "?").then(function () {
                    var processRoomMove = loginFactory.securedPostJSON("api/Room/ProcessRoomMove", RoomMoveModel);
                    $rootScope.dataLoadingPromise = processRoomMove;
                    processRoomMove.success(function (data) {
                        dialogService.toast("ROOM_MOVED_SUCCESSFUL");
                        $rootScope.pageInit = true;
                    }).error(function (err) {
                        /*if (err.Message) {
                            dialogService.messageBox("ERROR", err.Message).then(function () {});
                        }*/

                        if (err.Message) {
                            dialogService.messageBox("ERROR", err.Message)
                        } else {
                            conflictReservationProcess(err);
                        };
                    });
                });
            } else {
                var processRoomMove = loginFactory.securedPostJSON("api/Room/ProcessRoomMove", RoomMoveModel);
                $rootScope.dataLoadingPromise = processRoomMove;
                processRoomMove.success(function (data) {
                    dialogService.toast("ROOM_MOVED_SUCCESSFUL");
                    $rootScope.pageInit = true;
                }).error(function (err) {
                    /*if (err.Message) {
                        dialogService.messageBox("ERROR", err.Message).then(function () {});
                    }*/
                    if (err.Message) {
                        dialogService.messageBox("ERROR", err.Message)
                    } else {
                        conflictReservationProcess(err);
                    };
                });
            }
        }, function () {

        });
        function RoomMoveDialogController($scope, $mdDialog, item, currentRoom, roomListFactory) {
            var newRoom = {
                RoomTypeId: currentRoom.roomType.RoomTypeId,
                RoomId: 0,
                RoomPriceId: 0,
                RoomMoveFee: 0
            };

            $scope.isSelected = false;
            $scope.priceRateList = [];
            $scope.usePriceRateType = 1;

            function Init() {

                $scope.DateTimePickerOption = {
                    format: 'dd/MM/yyyy HH:mm'
                };
                $scope.minDate = new Date();
                $scope.currentRoom = currentRoom;
                $scope.str = new Date($scope.currentRoom.reservationRoom.ArrivalDate).format('dd/mm/yyyy HH:MM');
                $scope.str2 = new Date($scope.currentRoom.reservationRoom.DepartureDate).format('dd/mm/yyyy HH:MM');
                $scope.decimal = $rootScope.decimals;
                $scope.warningMissingRoom = false;
                $scope.warningDepartureDate = false;
                $scope.warningDate = false;

                $scope.newRoom = newRoom;
                $scope.isSelected = false;

                roomListFactory.getPriceRateList(function (data) {
                    $scope.planList = data;
                    for (var index in $scope.planList) {
                        if ($scope.currentRoom.reservationRoom.RoomPriceId && $scope.currentRoom.reservationRoom.RoomPriceId.toString() === $scope.planList[index].RoomPriceId.toString()) {
                            $scope.currentRoom.RoomPriceName = $scope.planList[index].RoomPriceName;
                            break;
                        }
                    }
                    $scope.priceRateList = $scope.planList.sort(function (a, b) {
                        return parseInt(a.Priority) - parseInt(b.Priority);
                    });
                });
                roomListFactory.getRoomList(new Date(), function (data) {
                    $scope.roomList = data;
                    $scope.roomTypes = data.roomTypes;
                    $scope.availableRoom = [];
                    var arrivalDateTemp = new Date($scope.currentRoom.reservationRoom.ArrivalDate);
                    var departureDateTemp = new Date($scope.currentRoom.reservationRoom.DepartureDate);

                    //AVAILABLE ROOM
                    var availableRoom = [];
                    $scope.availableRoom = reservationFactory.getAvailableRoomForRoomMove($scope.roomList, arrivalDateTemp, departureDateTemp, availableRoom);
                });
            }

            Init();

            function addDays(date, days) {
                var result = new Date(date);
                result.setDate(result.getDate() + days);
                return result;
            }

            $scope.$watchCollection('newRoom', function (newValues, oldValues) {
                if (_.size(newValues) !== 0 && _.size(oldValues) !== 0 && !angular.equals(newValues, oldValues)) {
                    $scope.priceRateList = _.filter($scope.planList, function (item) {
                        return (item.IsActive && item.RoomTypeId.toString() === newValues.RoomTypeId.toString());
                    }).sort(function (a, b) {
                        return parseInt(a.Priority) - parseInt(b.Priority);
                    });
                }
            });


            $scope.$watchCollection('currentRoom.reservationRoom', function (newValues, oldValues) {
                if (_.size(newValues) !== 0 && _.size(oldValues) !== 0 && !angular.equals(newValues, oldValues) && newValues.ArrivalDate && oldValues.ArrivalDate) {
                    if (newValues.ArrivalDate !== oldValues.ArrivalDate && newValues.ArrivalDate >= oldValues.DepartureDate && oldValues.BookingStatus !== 'CHECKIN') {
                        newValues.DepartureDate = addDays(newValues.ArrivalDate, 1);
                    }

                    //AVAILABLE ROOM
                    var availableRoom = [];
                    $scope.availableRoom = reservationFactory.getAvailableRoom($scope.roomList, newValues.ArrivalDate, newValues.DepartureDate, availableRoom);

                    if ((oldValues.BookingStatus === 'BOOKED' || oldValues.BookingStatus === 'NOSHOW') && newValues.BookingStatus === 'CHECKIN') {
                        $scope.room.ArrivalDate = new Date();

                        if ($scope.room.ArrivalDate.getTime() >= oldValues.DepartureDate.getTime()) {
                            $scope.room.DepartureDate = addDays($scope.room.ArrivalDate, 1);
                        } else {
                            $scope.room.DepartureDate = oldValues.DepartureDate;
                        }
                    }

                    //AVAILABLE PLAN LIST
                    $scope.priceRateList = _.filter($scope.planList, function (item) {
                        return (item.IsActive && item.RoomTypeId.toString() === newValues.RoomTypeId.toString());
                    }).sort(function (a, b) {
                        return parseInt(a.Priority) - parseInt(b.Priority);
                    });
                }

                $scope.priceRateList = _.filter($scope.priceRateList, function (item) {
                    return (item.IsActive && item.RoomTypeId.toString() === newValues.RoomTypeId.toString());
                }).sort(function (a, b) {
                    return parseInt(a.Priority) - parseInt(b.Priority);
                });
            });

            $scope.filterValue = function ($event) {
                if (isNaN(String.fromCharCode($event.keyCode))) {
                    $event.preventDefault();
                }
            };
            $scope.$watchCollection('newRoom.RoomTypeId', function (newValues, oldValues) {
                if (newValues.toString() !== oldValues.toString()) {
                    $scope.newRoom.RoomId = 0;
                }
            });
            $scope.newRoomPriceRateList = [];
            $scope.showOverridePriceRate = true;


            $scope.$watchCollection('newRoom.RoomPriceId', function (newValues, oldValues) {
                console.log("watchCollection newRoom.RoomPriceId", newValues, oldValues);
                if (newValues && newValues !== undefined) {
                    $scope.currentRatePrice = _.filter($scope.priceRateList, function (item) {
                        console.log("ITEM", item);
                        return (item.RoomPriceId.toString() === newValues.toString());
                    });
                    if ($scope.currentRatePrice[0] != undefined) {
                        $scope.currentRatePrice = $scope.currentRatePrice[0].FullDayPrice;
                    }


                }
            });


            $scope.processRoomMove = function () {
                console.log("NEW ROOM", $scope.newRoom, $scope.usePriceRateType);
                if (!$scope.newRoom.RoomId || parseInt($scope.newRoom.RoomId) === 0 || $scope.newRoom.RoomId.toString() === currentRoom.RoomId.toString()) {
                    $scope.warningMissingRoom = true;
                    $scope.warningMissingReason = false;
                    $scope.warningDepartureDate = false;
                    $scope.warningDate = false;
                    return;
                }

                if ((currentRoom.BookingStatus == 'CHECKIN' || currentRoom.BookingStatus == 'OVERDUE') && (!$scope.newRoom.Description || $scope.newRoom.Description.trim() == '')) {
                    $scope.warningMissingRoom = false;
                    $scope.warningMissingReason = true;
                    $scope.warningDepartureDate = false;
                    $scope.warningDate = false;
                    return;
                }

                if ($scope.currentRoom.reservationRoom.ArrivalDate > $scope.currentRoom.reservationRoom.DepartureDate) {
                    $scope.warningDate = true;
                    $scope.warningMissingRoom = false;
                    $scope.warningMissingReason = false;
                    $scope.warningDepartureDate = false;
                    return;
                }

                if (($scope.currentRoom.BookingStatus === 'BOOKED' || $scope.currentRoom.BookingStatus === 'NOSHOW') && (new Date($scope.currentRoom.reservationRoom.DepartureDate) < new Date() || new Date($scope.currentRoom.reservationRoom.ArrivalDate) < new Date())) {
                    console.log("FUCK");
                    $scope.warningDepartureDate = true;
                    $scope.warningDate = false;
                    $scope.warningMissingRoom = false;
                    $scope.warningMissingReason = false;
                    return;
                }

                var isDirty = false;
                for (var index in $scope.roomList) {
                    if ($scope.roomList[index].RoomId.toString() === $scope.newRoom.RoomId.toString()) {
                        if ($scope.roomList[index].HouseStatus === "DIRTY") {
                            isDirty = true;
                        }
                        break;
                    }
                }

                if (!$scope.newRoom.RoomMoveFee || $scope.newRoom.RoomMoveFee === undefined) {
                    $scope.newRoom.RoomMoveFee = 0;
                }

                var RoomMoveModel = {
                    ReservationRoomId: $scope.currentRoom.reservationRoom.ReservationRoomId,
                    NewRoomTypeId: $scope.newRoom.RoomTypeId,
                    NewRoomId: $scope.newRoom.RoomId,
                    NewRoomPriceId: $scope.newRoom.RoomPriceId,
                    IsDirty: isDirty,
                    UsePriceRateType: $scope.usePriceRateType,
                    RoomMoveFee: $scope.newRoom.RoomMoveFee,
                    Description: $scope.newRoom.Description,
                    ArrivalDate: $scope.currentRoom.reservationRoom.ArrivalDate,
                    DepartureDate: $scope.currentRoom.reservationRoom.DepartureDate
                }

                if (!$scope.isSelected) {
                    RoomMoveModel.UsePriceRateType = 0;
                } else {
                    RoomMoveModel.UsePriceRateType = 1;
                }
                $mdDialog.hide(RoomMoveModel);
            };

            $scope.changeSelect = function () {
                $scope.isSelected = !$scope.isSelected;
            }

            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
        }
    }
    function processCreateCard(currentHotelConnectivities,selectRoom){
        var hourAddToCheckOut = null;
        if (currentHotelConnectivities.IsAutomaticalAddHourCheckout == true) {
            hourAddToCheckOut = currentHotelConnectivities.HourAddToCheckout;
        };
        smartCardFactory.createCard(selectRoom, hourAddToCheckOut);
    }
    function processPreCheckIn(selectedRoom){
        var keys = ["THIS_ROOM_EXTRA_SERVICE_WAS_DELETED_AUTOMATICALLY_BY_THE_PRE_CHECKIN_PROCESS", "THIS_ROOM_EXTRA_SERVICE_ITEM_WAS_DELETED_AUTOMATICALLY_BY_THE_PRE_CHECKIN_PROCESS", "THIS_PAYMENT_WAS_DELETED_AUTOMATICALLY_BY_THE_PRE_CHECKIN_PROCESS", "NOTIFICATION_PRE_CHẸCKIN"];
        var languageKeys = {};
        for (var idx in keys) {
            languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
        }
        $mdDialog.show({
            controller: PreCheckInDialogController,
            resolve: {
                action: function () {
                    return "PRE_CHECKIN";
                }
            },
            templateUrl: 'views/templates/changeReservationStatus.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
        }).then(function (reason) {
            var PreCheckInModel = {
                RRID: selectedRoom.reservationRoom.ReservationRoomId,
                ActionCode: "PRE_CHECKIN",
                Reason: reason,
                languageKeys: languageKeys
            }
            var preCheckInProcess = loginFactory.securedPostJSON("api/Room/ProcessChangeReservationStatus", PreCheckInModel);
            $rootScope.dataLoadingPromise = preCheckInProcess;
            preCheckInProcess.success(function (data) {
                $rootScope.pageInit = true;
                dialogService.toast("PRE_CHECKIN_SUCCESSFUL");

            }).error(function (err) {
                //dialogService.messageBox("ERROR", err.Message);
                if (err.Message) {
                    dialogService.messageBox("ERROR", err.Message)
                } else {
                    conflictReservationProcess(err);
                };
            })
        }, function () {

        });

        function PreCheckInDialogController($scope, $mdDialog, action) {
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
    function processListExtraService(item,selectRoom){
        var useFullScreen = ($mdMedia('xs') || $mdMedia('sm'));
        $mdDialog.show({
			controller: AddExtraServiceController,
			resolve: {
				selectedRoom: function () {
					return selectRoom;
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
						total += extraServiceNoItem.Amount;
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
        //
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
                if ($scope.extraServiceNoItem && (!$scope.extraServiceNoItem.RoomExtraServiceDescription || !$scope.extraServiceNoItem.Amount)) {
                    dialogService.messageBox("MISSING_EXTRA_SERVICE", "PLEASE_FILL_NAME_AND_PRICE_OF_EXTRA_SERVICES");
                    return;
                }
                var postItems = {
                    ReservationRoomId: $scope.selectedRoom.reservationRoom.ReservationRoomId,
                    RoomExtraServiceName: "EXTRA_SERVICES",
                    RoomExtraServiceDescription: $scope.extraServiceNoItem.RoomExtraServiceDescription,
                    Amount: $scope.extraServiceNoItem.Amount,
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
    }


    return roomMenuFactory;


}]);