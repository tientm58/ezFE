ezCloud.controller('RoomMoveController', ['$scope', '$rootScope', 'loginFactory', '$stateParams', 'roomListFactory', 'dialogService', '$state', '$mdDialog', '$locale', '$filter', '$localStorage', 'configFactory', '$mdMedia', 'smartCardFactory', '$timeout', '$location', 'reservationFactory', 'walkInFactory', 'SharedFeaturesFactory', 'roomListFactory', 'homeFactory', 'ConflictReservationService', 'RoomMoveService',
    function ($scope, $rootScope, loginFactory, $stateParams, roomListFactory, dialogService, $state, $mdDialog, $locale, $filter, $localStorage, configFactory, $mdMedia, smartCardFactory, $timeout, $location, reservationFactory, walkInFactory, SharedFeaturesFactory, roomListFactory, homeFactory, ConflictReservationService, RoomMoveService) {
        var currentRoom = SharedFeaturesFactory.getFeatureModel();
        var newRoomId = SharedFeaturesFactory.getRoomMoveNewId();
        var id = (newRoomId != null && newRoomId != undefined) ? newRoomId : 0;
        var newRoom = {
            RoomTypeId: currentRoom.roomType.RoomTypeId,
            RoomId: id,
            RoomPriceId: 0,
            RoomMoveFee: 0
        };

        function Init() {
            if(!currentRoom.reservationRoom.RoomTypeId) currentRoom.reservationRoom.RoomTypeId = currentRoom.RoomTypeId;
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
            $scope.priceRateList = [];
            $scope.usePriceRateType = 1;
            $scope.IsDashboard = $scope.currentRoom.IsDashboard || 0;

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

                //newRoom
                if ($scope.newRoom.RoomId != 0)
                    RoomMoveService.setNewRoomId($scope.newRoom.RoomId);
                else RoomMoveService.setNewRoomId(null);

                //AVAILABLE ROOM
                var availableRoom = [];
                $scope.availableRoom = reservationFactory.getAvailableRoomForRoomMove($scope.roomList, arrivalDateTemp, departureDateTemp, availableRoom);
                var newRooomId = RoomMoveService.getNewRoomId();
                if (newRooomId) {
                    for (var i = 0; i < $scope.roomList.length; i++) {
                        var rt = $scope.roomList[i];
                        if (rt.RoomId == newRooomId) {
                            $scope.newRoom.RoomTypeId = rt.RoomTypeId;
                            $timeout(function () {
                                $scope.newRoom.RoomId = newRooomId;
                            }, 100);
                        }
                    }
                };
            });
            //

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
            if (newValues && newValues !== undefined) {
                $scope.currentRatePrice = _.filter($scope.priceRateList, function (item) {
                    return (item.RoomPriceId.toString() === newValues.toString());
                });
                if ($scope.currentRatePrice[0] != undefined) {
                    $scope.currentRatePrice = $scope.currentRatePrice[0].FullDayPrice;
                }


            }
        });

        $scope.processRoomMove = function () {
            var result = RoomMoveService.checkValidBeforeRoomMove($scope.currentRoom, $scope.newRoom);
            if (result && result.IsValid == true) {
                var modelTemp = buildRoomMoveModel();
                var roomMoveModel = RoomMoveService.buildRoomMoveModel(modelTemp);
                RoomMoveService.processRoomMove(function (data) {
                    $mdDialog.hide();
                    var result = data;
                    if (result.status == true) {
                        dialogService.toast("ROOM_MOVED_SUCCESSFUL");
                        $state.go($state.current, {}, {
                            reload: true
                        });
                    } else {
                        if (result.object.Message) {
                            dialogService.messageBox("ERROR", result.object.Message);
                        }
                        else {
                            SharedFeaturesFactory.processConflictReservation(result.object, $scope.currentRoom, "ROOMMOVE");
                        }
                        
                    }
                    $mdDialog.hide();
                });
            } else {
                $scope.warning = result.Warning;
            }

            function buildRoomMoveModel() {
                var isDirty = false;
                for (var index in $scope.roomList) {
                    if ($scope.roomList[index].RoomId.toString() === $scope.newRoom.RoomId.toString()) {
                        if ($scope.roomList[index].HouseStatus === "DIRTY") {
                            isDirty = true;
                        }
                        break;
                    }
                }
                var modelTemp = {};
                modelTemp.isDirty = isDirty;
                modelTemp.newRoom = $scope.newRoom;
                modelTemp.currentRoom = $scope.currentRoom;
                modelTemp.UsePriceRateType = $scope.usePriceRateType;
                //
                if (!$scope.isSelected) {
                    modelTemp.UsePriceRateType = 0;
                } else {
                    modelTemp.UsePriceRateType = 1;
                }

                return modelTemp;
            }
        };

        $scope.processRoomMoveDB = function () {
            var result = RoomMoveService.checkValidBeforeRoomMove($scope.currentRoom, $scope.newRoom);
            if (result && result.IsValid == true) {
                var modelTemp = buildRoomMoveModel();
                var roomMoveModel = RoomMoveService.buildRoomMoveModel(modelTemp);
                RoomMoveService.processRoomMoveDB(function (data) {
                    $mdDialog.hide();
                    var result = data;
                    if (result.status == true) {
                        dialogService.toast("ROOM_MOVED_SUCCESSFUL");
                        // $state.go($state.current, {}, {
                        //     reload: true
                        // });
                    } else {
                        if (result.object.Message) {
                            dialogService.messageBox("ERROR", result.object.Message);
                        }
                        else {
                            SharedFeaturesFactory.processConflictReservation(result.object, $scope.currentRoom, "ROOMMOVE");
                        }
                    }
                    $mdDialog.hide();
                });
            } else {
                $scope.warning = result.Warning;
            }

            function buildRoomMoveModel() {
                var isDirty = false;
                for (var index in $scope.roomList) {
                    if ($scope.roomList[index].RoomId.toString() === $scope.newRoom.RoomId.toString()) {
                        if ($scope.roomList[index].HouseStatus === "DIRTY") {
                            isDirty = true;
                        }
                        break;
                    }
                }
                var modelTemp = {};
                modelTemp.isDirty = isDirty;
                modelTemp.newRoom = $scope.newRoom;
                modelTemp.currentRoom = $scope.currentRoom;
                modelTemp.UsePriceRateType = $scope.usePriceRateType;
                //
                if (!$scope.isSelected) {
                    modelTemp.UsePriceRateType = 0;
                } else {
                    modelTemp.UsePriceRateType = 1;
                }

                return modelTemp;
            }
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
]);