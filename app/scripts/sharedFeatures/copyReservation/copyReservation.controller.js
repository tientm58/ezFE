ezCloud.controller('CopyReservationController', ['SharedFeaturesFactory','$scope', '$rootScope', '$mdDialog', '$state', 'dialogService', 'roomListFactory', 'reservationFactory', 'ConflictReservationService', 'CopyReservationService', 'SharedFeaturesFactory',
    function (SharedFeaturesFactory,$scope, $rootScope, $mdDialog, $state, dialogService, roomListFactory, reservationFactory, ConflictReservationService, CopyReservationService, SharedFeaturesFactory) {
        var nq = this;
        //Nguyen Ngoc Quan - nq
        function Init() {
            nq.model = SharedFeaturesFactory.getFeatureModel();
            nq.currentRoom = nq.model.currentRoom;
            nq.item = nq.model.currentItem;

            var newRoom = {};
            nq.isSelected = false;
            nq.priceRateList = [];
            nq.usePriceRateType = 1;
            nq.DateTimePickerOption = {
                format: 'dd/MM/yyyy HH:mm'
            };

            nq.str = new Date(nq.currentRoom.reservationRoom.ArrivalDate).format('dd/mm/yyyy HH:MM');
            nq.str2 = new Date(nq.currentRoom.reservationRoom.DepartureDate).format('dd/mm/yyyy HH:MM');
            nq.decimal = $rootScope.decimals;
            nq.warningMissingRoom = false;
            nq.warningDepartureDate = false;
            nq.warningDate = false;
            nq.newRoom = newRoom;
            nq.newRoomPriceRateList = [];
            nq.showOverridePriceRate = true;
            nq.IsDashboard = nq.currentRoom.IsDashboard || 0;


            roomListFactory.getPriceRateList(function (data) {
                nq.priceRateList = data;
                for (var index in nq.priceRateList) {
                    if (nq.currentRoom.reservationRoom.RoomPriceId && nq.currentRoom.reservationRoom.RoomPriceId.toString() === nq.priceRateList[index].RoomPriceId.toString()) {
                        nq.currentRoom.RoomPriceName = nq.priceRateList[index].RoomPriceName;
                        break;
                    }
                }
                nq.priceRateList = nq.priceRateList.sort(function (a, b) {
                    return parseInt(a.Priority) - parseInt(b.Priority);
                });

            });

            roomListFactory.getRoomList(new Date(), function (data) {
                nq.roomList = data;
                nq.planList = data.planList;
                nq.roomTypes = data.roomTypes;
                nq.availableRoom = [];
                var arrivalDateTemp = new Date(nq.currentRoom.reservationRoom.ArrivalDate);
                var departureDateTemp = new Date(nq.currentRoom.reservationRoom.DepartureDate);

                //AVAILABLE PLAN LIST
                if (nq.planList !== null && nq.planList.length > 0) {
                    nq.availablePlanList = _.filter(nq.planList, function (item) {
                        return item.RoomTypeId == nq.currentRoom.RoomTypeId;
                    })
                }

                nq.newRoom.Price = nq.currentRoom.reservationRoom.Price;
                //nq.newRoom.RoomId = nq.currentRoom.RoomId;
                nq.newRoom.RoomId = 0;
                nq.newRoom.Note = nq.currentRoom.reservationRoom.Note;
                nq.newRoom.RoomTypeId = nq.currentRoom.roomType.RoomTypeId;
                nq.newRoom.RoomPriceId = nq.currentRoom.reservationRoom.RoomPriceId;

                //AVAILABLE ROOM
                var availableRoom = [];
                nq.availableRoom = reservationFactory.getAvailableRoom(nq.roomList, arrivalDateTemp, departureDateTemp, availableRoom);
            });
        }
        Init();

        function addDays(date, days) {
            var result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        }
        $scope.$watchCollection('currentRoom.reservationRoom', function (newValues, oldValues) {
            if (_.size(newValues) !== 0 && _.size(oldValues) !== 0 && !angular.equals(newValues, oldValues)) {
                if (newValues.ArrivalDate !== oldValues.ArrivalDate && newValues.ArrivalDate >= oldValues.DepartureDate) {
                    newValues.DepartureDate = addDays(newValues.ArrivalDate, 1);
                }
                var availableRoom = [];
                nq.availableRoom = reservationFactory.getAvailableRoom(nq.roomList, newValues.ArrivalDate, newValues.DepartureDate, availableRoom);
            }
        });

        nq.filterValue = function ($event) {
            if (isNaN(String.fromCharCode($event.keyCode))) {
                $event.preventDefault();
            }
        };

        nq.newPriceTemp = angular.copy(nq.newRoom.Price);

        $scope.$watchCollection('newRoom', function (newValues, oldValues) {
            if (newValues && newValues !== undefined && newValues.RoomTypeId) {
                nq.availablePlanList = _.filter(nq.planList, function (item) {
                    return (item.IsActive && item.RoomTypeId.toString() === newValues.RoomTypeId.toString());
                }).sort(function (a, b) {
                    return parseInt(a.Priority) - parseInt(b.Priority);
                });
                if (newValues.RoomPriceId != oldValues.RoomPriceId || newValues.RoomTypeId != oldValues.RoomTypeId) {
                    setTimeout(function () {
                        if (newValues && newValues !== undefined && newValues.RoomPriceId) {
                            nq.newRoom.Price = _.filter(nq.availablePlanList, function (item) {
                                return (item.RoomPriceId.toString() === newValues.RoomPriceId.toString());
                            })[0].FullDayPrice;

                        }
                    }, 0);
                }
                if (newValues.Price != oldValues.Price && newValues.Price != 0) {
                    nq.newPriceTemp = angular.copy(newValues.Price);
                }
            }
        });

        nq.processCopy = function () {
            var isDirty = false;
            if (nq.newRoom.RoomId) {
                for (var index in nq.roomList) {
                    if (nq.roomList[index].RoomId.toString() === nq.newRoom.RoomId.toString()) {
                        if (nq.roomList[index].HouseStatus === "DIRTY") {
                            isDirty = true;
                        }
                        break;
                    }
                }
            }
            var result = CopyReservationService.checkValidBeforeCopy(nq.newRoom, nq.currentRoom);
            if (result && result.IsValid == true) {
                var modelTemp = {
                    newRoom: nq.newRoom,
                    currentRoom: nq.currentRoom,
                    isDirty: isDirty,
                    newPriceTemp: nq.newRoom.Price
                };
                var model = CopyReservationService.buildCopyReservationModel(modelTemp);

                CopyReservationService.processCopyReservationService(function (data) {
                    $mdDialog.hide();
                    var result = data;
                    if (result.status == true) {
                        dialogService.toast("COPY_RESERVATION_SUCCESSFUL");
                        $state.go($state.current, {}, {
                            reload: true
                        });
                    } else {
                        //ConflictReservationService.processConflictReservation(result.object);
                        SharedFeaturesFactory.processConflictReservation(result.object,nq.currentRoom,"ROOMCOPY");
                    }

                });
            } else {
                nq.warning = result.Warning;
            };
        };

        nq.processCopyDB = function () {
            var isDirty = false;
            if (nq.newRoom.RoomId) {
                for (var index in nq.roomList) {
                    if (nq.roomList[index].RoomId.toString() === nq.newRoom.RoomId.toString()) {
                        if (nq.roomList[index].HouseStatus === "DIRTY") {
                            isDirty = true;
                        }
                        break;
                    }
                }
            }
            var result = CopyReservationService.checkValidBeforeCopy(nq.newRoom, nq.currentRoom);
            if (result && result.IsValid == true) {
                var modelTemp = {
                    newRoom: nq.newRoom,
                    currentRoom: nq.currentRoom,
                    isDirty: isDirty,
                    newPriceTemp:  nq.newRoom.Price
                };
                var model = CopyReservationService.buildCopyReservationModel(modelTemp);

                CopyReservationService.processCopyReservationService(function (data) {
                    $mdDialog.hide();
                    var result = data;
                    if (result.status == true) {
                        dialogService.toast("COPY_RESERVATION_SUCCESSFUL");
                        // $state.go($state.current, {}, {
                        //     reload: true
                        // });
                    } else {
                        //ConflictReservationService.processConflictReservation(result.object);
                        SharedFeaturesFactory.processConflictReservation(result.object,nq.currentRoom,"ROOMCOPY");
                    }

                });
            } else {
                nq.warning = result.Warning;
            };
        };

        nq.changeSelect = function () {
            nq.isSelected = !nq.isSelected;
        }

        nq.cancel = function () {
            $mdDialog.cancel();
        };
    }
]);