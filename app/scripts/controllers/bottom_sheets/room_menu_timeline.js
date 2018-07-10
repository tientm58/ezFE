ezCloud.controller('roomMenuTimelineController', ['$scope', '$rootScope', '$mdBottomSheet', '$state', '$filter', 'selectedRoomFactory', '$location', '$mdDialog', 'loginFactory', 'dialogService', 'reservationFactory', '$mdMedia', 'smartCardFactory', 'roomListFactory', 'walkInFactory', function ($scope, $rootScope, $mdBottomSheet, $state, $filter, selectedRoomFactory, $location, $mdDialog, loginFactory, dialogService, reservationFactory, $mdMedia, smartCardFactory, roomListFactory, walkInFactory) {
    var item = selectedRoomFactory.getSelectedRoomTimeline();
    console.log('room_menu_timeline', item);
    var currentHotelConnectivities = selectedRoomFactory.getCurrentHotelConnectivities();
    $scope.currentHotelConnectivities = currentHotelConnectivities;
    $scope.menuTimeline = [];
    if (item.roomRepair != null && item.roomRepair != undefined) {
        $scope.menuTimeline = [{
            name: "CONFIG_REPAIR",
            icon: "ic_format_paint_24px.svg",
            url: ""
        }];
    } else {
        $scope.menuTimeline = [{
            name: "WALKIN",
            icon: "ic_add_24px.svg",
            url: "walkin/"
        },
        {
            name: "CONFIG_REPAIR",
            icon: "ic_format_paint_24px.svg",
            url: ""
        }];
    };
    $scope.listItemClick = function (menu) {
        $mdBottomSheet.hide();
        if (menu.name == "CONFIG_REPAIR") {
            console.log('ROOM_REPAIR:', item);
            if (item.roomRepair == undefined || item.roomRepair == undefined) {
                $scope.addRoomRepair(item, null);
            } else {
                $scope.editRoomRepair(item, null);
            }
        } else if (menu.name == "WALKIN") {
            var tmpStart = new Date(item.start);
            var DateNow = new Date();
            if (tmpStart < DateNow) {
                item.start = DateNow;
            }
            var items = {
                RoomId: item.roomId,
                BookingStatus: "AVAILABLE",
                ArrivalDate: item.start,
                DepartureDate: item.end,
            };

            if (menu.url) {
                console.info("menu.url", menu.url, items);
                walkInFactory.setReservationTimeline(items);
                if (items.RoomId) {
                    menu.url += items.RoomId
                }
                $location.path(menu.url);
            }
        };
    };
    $scope.editRoomRepair = function (repair, $event) {
        $mdDialog.show({
            controller: ['$scope', '$rootScope', '$mdDialog', 'loginFactory', 'dialogService', 'roomRepair', 'roomRepairs', 'currentRoom', EditRoomRepairController],
            resolve: {
                roomRepair: function () {
                    return repair.roomRepair;
                },
                roomRepairs: function () {
                    return repair.roomRepairs;
                },
                currentRoom: function () {
                    return repair.currentRoomTemp
                }
            },
            templateUrl: 'views/templates/editRoomRepair.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
        }).then(function (data) {
            if (data !== null) {
                $rootScope.pageInit = true;
            }
        }, function () {

        });

        function EditRoomRepairController($scope, $rootScope, $mdDialog, loginFactory, dialogService, roomRepair, roomRepairs, currentRoom) {
            function Init() {
                $scope.DateTimePickerOption = {
                    format: 'dd/MM/yyyy HH:mm'
                };
                $scope.roomRepair = roomRepair;
                $scope.roomRepairs = roomRepairs;
                $scope.originalRoomRepair = angular.copy($scope.roomRepair);
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
                /* if ( RepairEndDateTemp < newDate) {
                     $scope.warningDateCurrentTime = true;
                     $scope.warningDateNull = false;
                     $scope.warningDateInvalid = false;
                     $scope.warningReason = false;
                     $scope.warningConflict = false;
                     return;
                 }*/
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
                console.log('roomRepairs', $scope.roomRepairs);
                for (var index in $scope.roomRepairs) {
                    if (CheckTimeRangeConflict($scope.roomRepairs[index].RepairStartDate, $scope.roomRepairs[index].RepairEndDate, $scope.roomRepair.RepairStartDate, $scope.roomRepair.RepairEndDate) && $scope.roomRepairs[index].RoomRepairId != $scope.roomRepair.RoomRepairId && $scope.roomRepairs[index].IsDeleted === false) {
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
    $scope.addRoomRepair = function (room, ev) {
        var room = room;
        $mdDialog.show({
            controller: ['$scope', '$rootScope', '$mdDialog', 'loginFactory', 'dialogService', 'currentRoom', 'roomRepairs', AddRoomRepairController],
            templateUrl: 'views/templates/addRoomRepair.tmpl.html',
            resolve: {
                currentRoom: function () {
                    return room.repair.currentRoom;
                },
                roomRepairs: function () {
                    return room.repair.roomRepairs;
                }
            },
            parent: angular.element(document.body),
            targetEvent: event,
        }).then(function (data) {
            if (data !== null) {
                $rootScope.pageInit = true;
            }

        }, function () {

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
                //check date
                currentDate = new Date();
                $scope.newRoomRepair.RepairEndDate = $scope.currentRoom.RepairEndDate;
                $scope.newRoomRepair.RepairStartDate = $scope.currentRoom.RepairStartDate;
                if ($scope.currentRoom.RepairStartDate < currentDate) {
                    $scope.newRoomRepair.RepairStartDate = currentDate;
                }
                if ($scope.currentRoom.RepairStartDate > $scope.currentRoom.RepairEndDate) {
                    $scope.newRoomRepair.RepairEndDate = null;
                }
                $scope.str = $scope.newRoomRepair.RepairStartDate.format('dd/mm/yyyy HH:MM');

                if ($scope.newRoomRepair.RepairEndDate == null) {
                    $scope.str2 = null;
                } else {
                    $scope.str2 = $scope.newRoomRepair.RepairEndDate.format('dd/mm/yyyy HH:MM');
                }

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
                    if (CheckTimeRangeConflict($scope.roomRepairs[index].RepairStartDate, $scope.roomRepairs[index].RepairEndDate, $scope.newRoomRepair.RepairStartDate, $scope.newRoomRepair.RepairEndDate) && $scope.roomRepairs[index].IsDeleted === false) {
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
    }



    //QUICK CHECK IN
    $scope.buttonClick = function (ev, item, start, end) {
        ev.preventDefault();
        console.log('QUICK CHECKIN');
        if (item.BookingStatus === "AVAILABLE") {
            if (item.HouseStatus != null && item.HouseStatus === "DIRTY") {
                dialogService.confirm("ROOM_DIRTY", "DO_YOU_WANT_TO_CONTINUE?").then(function () {
                    $scope.dialogQuickCheckIn(ev, item, start, end)
                });
            } else {
                $scope.dialogQuickCheckIn(ev, item, start, end)
            }
        };
    };
    $scope.dialogQuickCheckIn = function (ev, item, start, end) {
        var useFullScreen = $mdMedia('xs');
        var itemTemp = angular.copy(item);
        if (start)
            itemTemp.start = start;
        if (end)
            itemTemp.end = end;
        $scope.quickCheckInDialog = $mdDialog;
        $scope.quickCheckInDialog.show({
            templateUrl: 'views/templates/quickCheckIn.tmpl.html',
            clickOutsideToClose: false,
            fullscreen: useFullScreen,
            locals: {
                local: [itemTemp, $scope.quickCheckInDialog, $scope, $scope.currentHotelConnectivities]
            },
            controller: ['$scope', '$mdDialog', '$filter', '$rootScope', 'loginFactory', 'dialogService', 'local', QuickCheckInDialogController]
        }).then(function (data) { }, function () { });


    };

    function QuickCheckInDialogController($scope, $mdDialog, $filter, $rootScope, loginFactory, dialogService, local) {
        $scope.quickCheckInModel = {};
        $scope.minDate = new Date();
        $scope.availableRoom = [];
        $scope.disableCheckIn = false;
        $scope.validCustomer = true;
        $scope.item;
        $scope.customer = {};
        $scope.room = {};
        $scope.deposit = {};
        $scope.isCancelled = false;
        $scope.filterValue = function ($event) {
            if (isNaN(String.fromCharCode($event.keyCode))) {
                $event.preventDefault();
            }
        };

        function Init() {
            console.log("LOCAL[0]", local[0]);
            $scope.RoomName = local[0].RoomName;
            $scope.DateTimePickerOption = {
                format: 'dd/MM/yyyy HH:mm'
            };
            $scope.DatePickerOption = {
                format: 'dd/MM/yyyy'
            };
            $scope.item = local[0];
            $scope.decimal = $rootScope.decimals;
            $scope.confirmDialog = $mdDialog;
            $scope.dialog = local[2].dialogQuickCheckIn;
            /*if (local[0].customerTemp || local[0].roomTemp || local[0].depositTemp) {
                $scope.isCancelled = true;
            }*/

            var customerList = loginFactory.securedGet("api/Room/AllCustomer");
            customerList.success(function (data) {
                $scope.customerList = data;
                $scope.customers = $scope.customerList;
            }).error(function (err) {
                console.log(err);
            });

            roomListFactory.getRoomList(new Date(), function (data) {
                $scope.roomList = data;
                $scope.rateList = data.planList;
                var roomTypes = [];
                for (var idx in roomListFactory.getRoomTypes()) {
                    roomTypes.push(roomListFactory.getRoomTypes()[idx]);
                }
                $scope.roomTypes = roomTypes;
                $scope.planList = data.planList;

                //Currencies
                $scope.currencies = data.currencies;
                $scope.defaultCurrency = data.defaultCurrency


                //Payment Methods
                $scope.paymentMethods = data.paymentMethods;

                for (var index in $scope.paymentMethods) {
                    if ($scope.paymentMethods[index].PaymentMethodName.toLowerCase() === "cash") {
                        $scope.defaultPaymentMethod = $scope.paymentMethods[index];
                        break;
                    }
                }

                //Remark Events
                $scope.remarkEvents = data.remarkEvents;

                $scope.paymentList = [];


                var room = {};
                $scope.roomRemarks = [];
                for (var index in $scope.roomList) {
                    if ($scope.roomList[index].RoomId.toString() === local[0].RoomId.toString()) {
                        room = $scope.roomList[index];
                        break;
                    }
                }
                var roomTemp;
                var currentRoomTypeId;
                for (var index in $scope.roomList) {
                    if ($scope.roomList[index].RoomId.toString() === local[0].RoomId.toString()) {
                        roomTemp = $scope.roomList[index];
                        currentRoomTypeId = roomTemp.RoomTypeId;
                        break;
                    }
                }

                var start = $scope.item.start != null ? $scope.item.start : new Date();
                var end = $scope.item.end != null ? $scope.item.end : addDays(new Date(), 1);
                var now = new Date();
                if (start < now)
                    start = now;
                if (end <= now) {
                    end = addDays(new Date(), 1);
                }
                var tmp = $scope.item.start;
                console.log('test', tmp);
                $scope.str = start.format('dd/mm/yyyy HH:MM');
                $scope.str2 = end.format('dd/mm/yyyy HH:MM');
                $scope.room = {
                    count: 1,
                    ArrivalDate: start,
                    DepartureDate: end,
                    Adults: 1,
                    Child: 0,
                    Total: 0,
                    RoomPriceId: 0,
                    RoomTypeId: currentRoomTypeId,
                    RoomId: local[0].RoomId,
                    FOC: false,
                    DiscountPercentage: 0,
                    DiscountFlat: 0,
                    RoomTypeId: room.RoomTypeId,
                    RoomId: room.RoomId,
                    BookingStatus: room.BookingStatus,
                    HouseStatus: room.HouseStatus,
                    Note: null,
                    Price: 0
                };

                if (local[0].roomTemp) {
                    $scope.room = local[0].roomTemp;
                }

                $scope.customer = {};
                if (local[0].customerTemp) {
                    $scope.customer = local[0].customerTemp;
                }

                if (local[0].searchTextTemp) {
                    $scope.searchText = local[0].searchTextTemp;
                }

                $scope.roomRemarks = [];
                var arrivalDateTemp = new Date($scope.room.ArrivalDate.getFullYear(), $scope.room.ArrivalDate.getMonth(), $scope.room.ArrivalDate.getDate(), $scope.room.ArrivalDate.getHours(), $scope.room.ArrivalDate.getMinutes(), 0);
                var departureDateTemp = new Date($scope.room.DepartureDate.getFullYear(), $scope.room.DepartureDate.getMonth(), $scope.room.DepartureDate.getDate(), $scope.room.DepartureDate.getHours(), $scope.room.DepartureDate.getMinutes(), 0);
                for (var index in $scope.roomList) {
                    var notThisRoom = false;
                    if ($scope.roomList[index].reservationRoom) {
                        if ((arrivalDateTemp <= $scope.roomList[index].reservationRoom.ArrivalDate && $scope.roomList[index].reservationRoom.ArrivalDate <= departureDateTemp) ||
                            (arrivalDateTemp <= $scope.roomList[index].reservationRoom.DepartureDate && $scope.roomList[index].reservationRoom.DepartureDate <= departureDateTemp) ||
                            ($scope.roomList[index].reservationRoom.ArrivalDate <= arrivalDateTemp && departureDateTemp <= $scope.roomList[index].reservationRoom.DepartureDate)
                        ) {
                            notThisRoom = true;
                        }
                    }
                    if (notThisRoom === false) {
                        $scope.availableRoom.push($scope.roomList[index]);
                    }
                }

                $scope.deposit = {
                    PaymentMethodId: $scope.defaultPaymentMethod.PaymentMethodId,
                    MoneyId: $scope.defaultCurrency.MoneyId,
                    PaymentTypeName: "DEPOSIT"
                };
                if (local[0].depositTemp) {
                    $scope.deposit = local[0].depositTemp;
                    console.log("DEPOSIT", $scope.deposit);
                }

                $scope.$watchCollection('room.RoomPriceId', function (newValues, oldValues) {
                    for (var index in $scope.planList) {
                        if ($scope.planList[index].RoomPriceId && $scope.planList[index].RoomPriceId.toString() === newValues.toString()) {
                            $scope.room.Price = $scope.planList[index].FullDayPrice;
                        }
                    }
                });
            });


            $scope.str = new Date().format('dd/mm/yyyy HH:MM');
            $scope.str2 = addDays(new Date(), 1).format('dd/mm/yyyy HH:MM');
            $scope.item = item;
            $scope.quickCheckInModel.customer = {};
            $scope.quickCheckInModel.room = {};
            $scope.warningMissingCustomer = false;
            $scope.warningMissingRoom = false;
            $scope.warningDepartureDate = false;
            $scope.test = {};
            if (local[0].end != null && local[0].start != null) {
                console.log('hihi', local[0].start);
                // var startDate=new Date(local[0].start).format('dd/mm/yyyy HH:MM');
                //  $scope.room.ArrivalDate=startDate;
                //  $scope.room.DepartureDate=null;
                //new Date(local[0].start)
                // $scope.quickCheckInModel.room.DepartureDate=;
            } else {
                $scope.quickCheckInModel.room.ArrivalDate = new Date();
                $scope.quickCheckInModel.room.DepartureDate = addDays(new Date(), 1);
            }
        }
        Init();
        $scope.$watchCollection('customer', function (newValues, oldValues) {
            if (oldValues === null) {
                if (newValues === undefined) {
                    $scope.validCustomer = false;
                }
            } else {
                $scope.validCustomer = true;
            }

        });
        $scope.$watchCollection('room', function (newValues, oldValues) {
            if (_.size(newValues) !== 0 && _.size(oldValues) !== 0 && !angular.equals(newValues, oldValues) && newValues.ArrivalDate && oldValues.ArrivalDate) {
                if (newValues.ArrivalDate !== oldValues.ArrivalDate && newValues.ArrivalDate >= oldValues.DepartureDate) {
                    newValues.DepartureDate = addDays(newValues.ArrivalDate, 1);
                }

                //AVAILABLE ROOM
                $scope.availableRoom = [];
                var arrivalDateTemp = new Date(newValues.ArrivalDate);
                var departureDateTemp = new Date(newValues.DepartureDate);
                for (var index in $scope.roomList) {
                    if ($scope.roomList[index].RoomId && !$scope.roomList[index].IsHidden) {
                        if ($scope.roomList[index].RoomId === 255) { }
                        var notThisRoom = false;
                        if ($scope.roomList[index].reservationRoom) {

                            if ((arrivalDateTemp <= $scope.roomList[index].reservationRoom.ArrivalDate && $scope.roomList[index].reservationRoom.ArrivalDate <= departureDateTemp) ||
                                (arrivalDateTemp <= $scope.roomList[index].reservationRoom.DepartureDate && $scope.roomList[index].reservationRoom.DepartureDate <= departureDateTemp) ||
                                (arrivalDateTemp <= $scope.roomList[index].reservationRoom.ArrivalDate && $scope.roomList[index].reservationRoom.DepartureDate <= departureDateTemp) ||
                                ($scope.roomList[index].reservationRoom.ArrivalDate <= arrivalDateTemp && departureDateTemp <= $scope.roomList[index].reservationRoom.DepartureDate)
                            ) {
                                notThisRoom = true;
                            }
                        }
                        for (var index2 in $scope.roomList[index].roomBookingList) {
                            var bookingTemp = $scope.roomList[index].roomBookingList[index2];
                            bookingTemp.ArrivalDate = new Date(bookingTemp.ArrivalDate);
                            bookingTemp.DepartureDate = new Date(bookingTemp.DepartureDate);
                            if ((arrivalDateTemp <= bookingTemp.ArrivalDate && bookingTemp.ArrivalDate <= departureDateTemp) ||
                                (arrivalDateTemp <= bookingTemp.DepartureDate && bookingTemp.DepartureDate <= departureDateTemp) ||
                                (arrivalDateTemp <= bookingTemp.ArrivalDate && bookingTemp.DepartureDate <= departureDateTemp) ||
                                (bookingTemp.ArrivalDate <= arrivalDateTemp && departureDateTemp <= bookingTemp.DepartureDate)) {
                                notThisRoom = true;
                            }
                        }

                        if ($scope.roomList[index].HouseStatus === "REPAIR") {
                            if ($scope.roomList[index].RepairStartDate) {
                                $scope.roomList[index].RepairStartDate = new Date($scope.roomList[index].RepairStartDate);
                            }

                            if ($scope.roomList[index].RepairEndDate) {
                                $scope.roomList[index].RepairEndDate = new Date($scope.roomList[index].RepairEndDate);
                            }

                            if ((arrivalDateTemp <= $scope.roomList[index].RepairStartDate && $scope.roomList[index].RepairStartDate <= departureDateTemp) ||
                                (arrivalDateTemp <= $scope.roomList[index].RepairEndDate && $scope.roomList[index].RepairEndDate <= departureDateTemp) ||
                                ($scope.roomList[index].RepairStartDate <= arrivalDateTemp && departureDateTemp <= $scope.roomList[index].RepairEndDate)
                            ) {
                                notThisRoom = true;
                            }
                        }

                        if (notThisRoom === false) {
                            $scope.availableRoom.push($scope.roomList[index]);
                        } else {
                            notThisRoom = null;
                        }
                    }
                }

                if ((oldValues.BookingStatus === 'BOOKED' || oldValues.BookingStatus === 'NOSHOW') && newValues.BookingStatus === 'CHECKIN') {
                    $scope.room.ArrivalDate = new Date();

                    if ($scope.room.ArrivalDate.getTime() >= oldValues.DepartureDate.getTime()) {
                        $scope.room.DepartureDate = addDays($scope.room.ArrivalDate, 1);
                    } else {
                        $scope.room.DepartureDate = oldValues.DepartureDate;
                    }
                }

                //AVAILABLE PLAN LIST
                $scope.availablePlanList = _.filter($scope.planList, function (item) {
                    return (item.IsActive && item.RoomTypeId.toString() === newValues.RoomTypeId.toString());
                }).sort(function (a, b) {
                    return parseInt(a.Priority) - parseInt(b.Priority);
                });
                if (newValues.RoomId.toString() !== oldValues.RoomId.toString()) {

                    $scope.RoomName = _.filter($scope.availableRoom, function (item) {
                        return (item.RoomId.toString() === newValues.RoomId.toString());
                    })[0].RoomName;

                }
            }

            $scope.availablePlanList = _.filter($scope.planList, function (item) {
                return (item.IsActive && item.RoomTypeId.toString() === newValues.RoomTypeId.toString());
            }).sort(function (a, b) {
                return parseInt(a.Priority) - parseInt(b.Priority);
            });
        });

        $scope.updateRoomType = function () {
            var roomTemp;
            if ($scope.room.RoomId > 0) {
                for (var index in $scope.roomList) {
                    if ($scope.roomList[index].RoomId.toString() === $scope.room.RoomId.toString()) {
                        roomTemp = $scope.roomList[index];
                        $scope.room.RoomTypeId = roomTemp.RoomTypeId;
                        break;
                    }
                }
            }
        }

        function addDays(date, days) {
            var result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        }


        $scope.simulateQuery = false;
        $scope.isDisabled = false;
        $scope.querySearch = querySearch;
        $scope.selectedItemChange = selectedItemChange;
        $scope.searchTextChange = searchTextChange;


        function querySearch(query) {
            var results = query ? $scope.customers.filter(createFilterFor(query)) : $scope.customers,
                deferred;
            if ($scope.simulateQuery) {
                deferred = $q.defer();
                $timeout(function () {
                    deferred.resolve(results);
                }, Math.random() * 1000, false);
                return deferred.promise;
            } else {
                return results;
            }
            //                  console.log("RESULT", query, results);
            //return results;
        }

        function searchTextChange(text) {
            //console.log("selected text change", text);
            //$scope.searchText = text;
        }

        function selectedItemChange(item) {
            //console.log("selected item change", item);
            //$scope.selectedItem = item;
        }

        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);
            return function filterFn(customer) {
                return (angular.lowercase(customer.Fullname).indexOf(lowercaseQuery) === 0);
            };
        }

        $scope.processCheckIn = function (event) {
            event.preventDefault();
            if (!$scope.room.RoomId || parseInt($scope.room.RoomId) === 0) {
                $scope.warningMissingRoom = true;
                $scope.warningMissingCustomer = false;
                return;
            }

            if (!$scope.customer || ($scope.customer.Fullname && $scope.customer.Fullname.trim() === "") || !$scope.searchText || ($scope.searchText && $scope.searchText.trim() === "")) {
                $scope.warningMissingCustomer = true;
                $scope.warningMissingRoom = false;
                return;
            }

            if ($scope.room.ArrivalDate > $scope.room.DepartureDate) {
                $scope.warningDepartureDate = true;
                $scope.warningMissingCustomer = false;
                $scope.warningMissingRoom = false;
                return;
            }
            if ($scope.room.ArrivalDate == null || $scope.room.DepartureDate == null) {
                $scope.warningDateIsNull = true;
                $scope.warningDepartureDate = false;
                $scope.warningMissingCustomer = false;
                $scope.warningMissingRoom = false;
                return;
            }

            var payment = angular.copy($scope.payment);
            var Paykeys = ["RES_NO", "ROOM", "NOTIFICATION_NEWPAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER"];
            var languagePayKeys = {};
            for (var idx in Paykeys) {
                languagePayKeys[Paykeys[idx]] = $filter("translate")(Paykeys[idx]);
            }
            $scope.sharerList = [];
            if ($scope.deposit && $scope.deposit.Amount) {
                $scope.deposit.CreatedDate = new Date();
                $scope.paymentList.push($scope.deposit);
                local[0].depositTemp = $scope.deposit;
            }
            var customer;
            if (!$scope.selectedItem || $scope.selectedItem === undefined) {
                customer = $scope.customer;
                console.log("CUSTOMER 1", customer);
            } else {
                console.log("SELECTED ITEM", $scope.selectedItem);
                customer = $scope.selectedItem;
                console.log("CUSTOMER 2", customer);
                local[0].selectedItemTemp = $scope.selectedItem;
            }

            if ($scope.searchText) {
                local[0].searchTextTemp = $scope.searchText;
            }

            local[0].customerTemp = customer;
            //                      local[0].customerTemp.Fullname = $scope.customer.Fullname;
            //                      local[0].customerTemp.IdentityNumber = $scope.customer.IdentityNumber;
            var data = {
                customer: customer,
                room: $scope.room,
                sharerList: $scope.sharerList,
                paymentList: $scope.paymentList,
            };


            local[0].roomTemp = $scope.room;
            //local[0].dataTemp = angular.copy(data);
            console.log("CURRENT HOTEL CONNECTIVITIES", local[3]);
            var confirm;
            if (local[3] === false) {
                confirm = $mdDialog.confirm()
                    .title($filter("translate")("CHECK_IN"))
                    .content($filter("translate")("WOULD_YOU_LIKE_TO_CHECK_IN"))
                    .ok($filter("translate")("OK"))
                    .cancel($filter("translate")("CANCEL"))
                    .targetEvent(null);
                $scope.confirmDialog.show(confirm).then(function () {
                    $scope.room.BookingStatus = "CHECKIN";
                    data.room.BookingStatus = "CHECKIN";
                    data.room.ArrivalDate = new Date();
                    data.room.DepartureDate = $scope.room.DepartureDate;
                    data.languageKeys = languagePayKeys;
                    var save = loginFactory.securedPostJSON("api/Room/Save", data);
                    $rootScope.dataLoadingPromise = save;
                    save.success(function (id) {
                        if (data.room.BookingStatus === "CHECKIN") {
                            dialogService.toast("CHECKIN_SUCCESSFUL");
                        } else {
                            dialogService.toast("RESERVE_SUCCESSFUL");
                        }
                        $rootScope.pageInit = true;
                        //local[2].Init();
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
                    $scope.confirmDialog.cancel();
                    $scope.dialog(null, local[0]);
                });
            } else {
                console.log("GET THERE SMART CARD", $scope.room, $scope.customer);
                var roomName = _.filter($scope.availableRoom, function (item) {
                    return item.RoomId == $scope.room.RoomId;
                })[0].RoomName;
                confirm = {
                    controller: ['$scope', '$mdDialog', 'selectedRoom', 'currentHotelConnectivities', 'loginFactory', 'dialogService', CheckInDialogController],
                    resolve: {
                        selectedRoom: function () {
                            return $scope.room;;
                        },
                        currentHotelConnectivities: function () {
                            return local[3];
                        },
                    },
                    templateUrl: 'views/templates/checkInDialog.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: null
                };

                $scope.confirmDialog.show(confirm).then(function (isCreateCard) {
                    if (isCreateCard === true) {
                        //use NeoLock
                        if ($rootScope.Connectivities != null && $rootScope.Connectivities.code.HotelConnectivityModuleName === "SMART_NEO_LOCK") {
                            var reason = null;
                            var writeCardModel = {
                                RoomName: roomName,
                                RoomDescription: $scope.room.RoomDescription,
                                TravellerName: $scope.customer.Fullname,
                                ArrivalDate: new Date(),
                                DepartureDate: $scope.room.DepartureDate,
                                OverrideOldCards: true
                            };

                            for (var index in $scope.roomRemarks) {
                                if ($scope.roomRemarks[index].RemarkEventCode) {
                                    delete $scope.roomRemarks[index].RemarkEventCode;
                                }
                            }
                            data.roomRemarks = $scope.roomRemarks;
                            data.room.BookingStatus = "CHECKIN"
                            data.languageKeys = languagePayKeys;
                            save = loginFactory.securedPostJSON("api/Room/Save", data);
                            $rootScope.dataLoadingPromise = save;
                            save.success(function (id) {
                                var createCard = smartCardFactory.writeCard(writeCardModel, id, null);
                                createCard.then(function (dataCard) {
                                    console.log("NeoLock quick checkin", dataCard);
                                    if (dataCard.passcode != null ) {
                                        dialogService.toastSuccess($filter("translate")("CREATE_CARD_SUCCESSFUL") + " " + dataCard.passcode);
                                    } else {
                                        dialogService.messageBox(dataCard.message).then(function (data) {

                                        });
                                    }
                                    
                                    $rootScope.pageInit = true;
                                });
                            }).error(function (err) {
                                if (err.Message) {
                                    dialogService.messageBox("Error", err.Message).then(function () {
                                        $state.go($state.current, {}, {
                                            reload: true
                                        });
                                    });
                                } else {
                                    conflictReservationProcess(err);
                                } //End Else

                            });
                            
                        }
                        else {
                            dialogService.confirm("PLEASE_BE_SURE_THE_VALID_CARD_IS_BEING_INSERTED").then(function () {
                                var writeCardModel = {
                                    RoomName: roomName,
                                    TravellerName: $scope.customer.Fullname,
                                    ArrivalDate: $scope.room.ArrivalDate,
                                    DepartureDate: $scope.room.DepartureDate,
                                    OverrideOldCards: true
                                };

                                for (var index in $scope.roomRemarks) {
                                    if ($scope.roomRemarks[index].RemarkEventCode) {
                                        delete $scope.roomRemarks[index].RemarkEventCode;
                                    }
                                }
                                data.roomRemarks = $scope.roomRemarks;
                                data.room.BookingStatus = "CHECKIN"
                                data.languageKeys = languagePayKeys;
                                save = loginFactory.securedPostJSON("api/Room/Save", data);
                                $rootScope.dataLoadingPromise = save;
                                save.success(function (id) {
                                    var createCard = smartCardFactory.writeCard(writeCardModel, id, null);
                                    createCard.then(function (dataCard) {
                                        console.log("DATA CARD", dataCard);
                                        if (dataCard.Result !== null && dataCard.Result == 0) {
                                            dialogService.toast("CHECKIN_AND_CREATE_CARD_SUCCESSFUL");
                                        } else {
                                            dialogService.messageBox("UNABLE_TO_CREATE_NEW_CARD").then(function (data) {

                                            });
                                        }
                                        $rootScope.pageInit = true;
                                    });



                                }).error(function (err) {
                                    if (err.Message) {
                                        dialogService.messageBox("Error", err.Message).then(function () {
                                            $state.go($state.current, {}, {
                                                reload: true
                                            });
                                        });
                                    } else {
                                        conflictReservationProcess(err);
                                    } //End Else

                                });



                            });
                        }

                    } else {
                        $scope.room.BookingStatus = "CHECKIN";
                        data.room.BookingStatus = "CHECKIN";
                        data.room.ArrivalDate = new Date();
                        data.room.DepartureDate = $scope.room.DepartureDate;
                        data.languageKeys = languagePayKeys;
                        var save = loginFactory.securedPostJSON("api/Room/Save", data);
                        $rootScope.dataLoadingPromise = save;
                        save.success(function (id) {
                            if (data.room.BookingStatus === "CHECKIN") {
                                dialogService.toast("CHECKIN_SUCCESSFUL");
                            } else {
                                dialogService.toast("RESERVE_SUCCESSFUL");
                            }
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
                    }
                }, function () {
                    $scope.confirmDialog.cancel();
                    $scope.dialog(null, local[0]);
                });

                function CheckInDialogController($scope, $mdDialog, selectedRoom, currentHotelConnectivities, loginFactory, dialogService) {
                    function Init() {
                        //$scope.roomRemarks = roomRemarks;
                        //$scope.room = room;
                        //console.log("data", data);
                        console.log("GET THERE")
                        $scope.currentHotelConnectivities = currentHotelConnectivities;
                        console.log("$scope.currentHotelConnectivities", $scope.currentHotelConnectivities);
                        $scope.isCreateCard = true;
                    }
                    Init();
                    $scope.hide = function () {
                        $mdDialog.hide();
                    };
                    $scope.cancel = function () {
                        $mdDialog.cancel();
                    };

                    $scope.processCheckIn = function () {
                        $mdDialog.hide($scope.isCreateCard);

                    }
                }
            }
        }

        $scope.processReserve = function (event) {
            event.preventDefault();
            var payment = angular.copy($scope.payment);
            var Paykeys = ["RES_NO", "ROOM", "NOTIFICATION_NEWPAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER"];
            var languagePayKeys = {};
            for (var idx in Paykeys) {
                languagePayKeys[Paykeys[idx]] = $filter("translate")(Paykeys[idx]);
            }
            $scope.sharerList = [];
            if ($scope.deposit && $scope.deposit.Amount) {
                $scope.deposit.CreatedDate = new Date();
                $scope.paymentList.push($scope.deposit);
            }
            var customer;
            if (!$scope.selectedItem) {
                customer = $scope.customer;
            } else {
                customer = $scope.selectedItem;
            }
            var data = {
                customer: customer,
                room: $scope.room,
                sharerList: $scope.sharerList,
                paymentList: $scope.paymentList,
            };
            if (!$scope.room.RoomTypeId) {
                dialogService.messageBox("MISSING_ROOM_TYPE", "PLEASE_SELECT_A_ROOM_TYPE_TO_PERFORM_RESERVE_ACTION");
                return;
            }
            if (!data.customer.Fullname) {
                $scope.warningMissingCustomer = true;
                return;
            }

            if ($scope.room.ArrivalDate > $scope.room.DepartureDate) {
                $scope.warningDepartureDate = true;
            }

            if (($scope.room.Adults + $scope.room.Child) > $scope.sharerList.length) {
                data.room.Adults = $scope.room.Adults;
                data.room.Child = $scope.room.Child;
            }
            if ($scope.room.ArrivalDate == null || $scope.room.DepartureDate == null) {
                $scope.warningDateIsNull = true;
                $scope.warningDepartureDate = false;
                $scope.warningMissingCustomer = false;
                $scope.warningMissingRoom = false;
                return;
            }
            console.log("NO USE", local[3]);
            data.room.BookingStatus = "BOOKED";
            data.room.ArrivalDate = $scope.room.ArrivalDate;
            data.room.DepartureDate = $scope.room.DepartureDate;
            data.languageKeys = languagePayKeys;
            var save = loginFactory.securedPostJSON("api/Room/Save", data);
            $rootScope.dataLoadingPromise = save;
            save.success(function (id) {
                if (data.room.BookingStatus === "CHECKIN") {
                    dialogService.toast("CHECKIN_SUCCESSFUL");
                } else {
                    dialogService.toast("RESERVE_SUCCESSFUL");
                }
                $rootScope.pageInit = true;
                $mdDialog.hide();

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
            //}
        } //

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
                .then(function (answer) { }, function () { });

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