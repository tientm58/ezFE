ezCloud.controller('WalkinGeneralNewReservationRoomCtrl', ['$scope', '$mdBottomSheet', '$rootScope', '$log', 'commonFactory', 'loginFactory', '$stateParams', 'roomListFactory', 'dialogService', '$state', '$mdDialog', '$locale', '$filter', '$localStorage', 'configFactory', '$mdMedia', 'smartCardFactory', '$timeout', '$location', 'reservationFactory', 'walkInFactory',
    function($scope, $mdBottomSheet, $rootScope, $log, commonFactory, loginFactory, $stateParams, roomListFactory, dialogService, $state, $mdDialog, $locale, $filter, $localStorage, configFactory, $mdMedia, smartCardFactory, $timeout, $location, reservationFactory, walkInFactory) {
        var roomId_TL = 0;
        var vm = this;
        vm.nextStatuses = {
            BOOKED: {
                CANCELLED: 1,
                CHECKIN: 1,
            },
            CANCEL: {},
            CHECKIN: {
                CHECKOUT: 1,
            },
            CHECKOUT: {
                DIRTY: 1
            },
            AVAILABLE: {
                CHECKIN: 1,
                BOOKED: 1
            },
            DIRTY: {}
        };
        function InitWalkin_NewReservationRoom() {
            $scope.$mdMedia = $mdMedia;
            vm.DateTimePickerOption = {
                format: 'dd/MM/yyyy HH:mm'
            };
            vm.DatePickerOption = {
                format: 'dd/MM/yyyy'
            };
            vm.decimal = $rootScope.decimals;
            vm.showCheckIn = true;
            walkInFactory.getReservationRoomResolved($stateParams.reservationRoomId).then(function(data) {
                var arrivalDateTemp = new Date();
                var departureDateTemp = new Date();
                var roomIdTemp = 0;
                var walkInDate = walkInFactory.setWalkinDateBasedOnTimeInOutAndTimeLine();
                if (walkInDate != null){
                    arrivalDateTemp   = walkInDate.ArrivalDate;
                    departureDateTemp = walkInDate.DepartureDate;
                    roomIdTemp = walkInDate.RoomId;
                    vm.str            = arrivalDateTemp.format('dd/mm/yyyy HH:MM');
                    vm.str2           = departureDateTemp.format('dd/mm/yyyy HH:MM');
                }

                vm.room = {
                    count: 1,
                    ArrivalDate: arrivalDateTemp,
                    DepartureDate: departureDateTemp,
                    Adults: 1,
                    Child: 0,
                    Total: 0,
                    RoomPriceId: 0,
                    RoomTypeId: 0,
                    RoomId: roomIdTemp,
                    FOC: false,
                    DiscountPercentage: 0,
                    DiscountFlat: 0,
                    Price: 0
                };
                vm.minDate         = vm.room.ArrivalDate;
                vm.isCheckout      = false;
                vm.isEditMarketing = false;
                vm.isAddMarketing  = true;

                if (data != null && data.RoomStatus != null){
                    vm.roomTypes = data.RoomStatus.roomTypes;
                    vm.planList = data.RoomStatus.planList;
                    vm.roomList = data.RoomStatus;
                    // New Walkin Room
                    if ($stateParams.roomId) {
                        vm.room.RoomId = $stateParams.roomId;
                        var roomTemp;
                        for (var index in vm.roomList) {
                            if (vm.roomList[index].RoomId == $stateParams.roomId) {
                                roomTemp = vm.roomList[index];
                                vm.room.RoomTypeId = roomTemp.RoomTypeId;
                                break;
                            }
                        }

                        vm.RoomName = roomTemp.RoomName;

                    }
                    else{
                        if (roomIdTemp != 0){
                            var roomTemp;
                            for (var index in vm.roomList) {
                                if (vm.roomList[index].RoomId == roomIdTemp) {
                                    roomTemp = vm.roomList[index];
                                    vm.room.RoomTypeId = roomTemp.RoomTypeId;
                                    break;
                                }
                            }
                            vm.RoomName = roomTemp.RoomName;
                        }
                    }
                }

                var availableRooms = [];
                walkInFactory.getAvailableRooms(data.RoomStatus, vm.room.ArrivalDate, vm.room.DepartureDate, availableRooms);
                vm.availableRoom = availableRooms;
                // New Walk-in
                /*if (!$stateParams.reservationRoomId && !$stateParams.roomId) {
                    checkReservationTL();
                    checkReservationGroup();
                    setRoomTL(roomId_TL);
                }*/
                $timeout(function() {
                    walkInFactory.setRoomForSaved(vm.room);
                },0);
            });

        }

        $scope.$on('InitWalkin_NewReservationRoom', function(e) {
            InitWalkin_NewReservationRoom();
        });

       /* var newReservation = $rootScope.$on("InitWalkin_NewReservationRoom", function() {
            InitWalkin_NewReservationRoom();
        });

        $scope.$on('$destroy', function() {
            newReservation();
        });*/



        $scope.$watchCollection('newRRCtrl.room', function(newValues, oldValues) {
            if (_.size(newValues) != 0 && _.size(oldValues) != 0 && !angular.equals(newValues, oldValues) && newValues.ArrivalDate && oldValues.ArrivalDate) {
                if (newValues.ArrivalDate != oldValues.ArrivalDate && newValues.ArrivalDate >= oldValues.DepartureDate && oldValues.BookingStatus != 'CHECKIN') {
                    var newDepartureDate = walkInFactory.addDays(newValues.ArrivalDate, 1);
                    newDepartureDate.setHours(oldValues.DepartureDate.getHours());
                    newDepartureDate.setMinutes(oldValues.DepartureDate.getMinutes());
                    newValues.DepartureDate = newDepartureDate;
                    newValues.BookingStatus = "AVAILABLE";
                    vm.showCheckIn = false;
                    //$scope.$broadcast('showCheckIn');
                    //$scope.$emit("showCheckIn");
                    //walkInFactory.setShowCheckIn(vm.showCheckIn);
                    //vm.nextStatuses[newValues.BookingStatus].CHECKIN = 0;
                }

                //AVAILABLE ROOM
                var availableRoom = [];
                vm.availableRoom = reservationFactory.getAvailableRoom(vm.roomList, newValues.ArrivalDate, newValues.DepartureDate, availableRoom);
                if ((oldValues.BookingStatus == 'BOOKED' || oldValues.BookingStatus == 'NOSHOW') && newValues.BookingStatus == 'CHECKIN') {
                    vm.room.ArrivalDate = new Date();
                    if (vm.room.ArrivalDate.getTime() >= oldValues.DepartureDate.getTime()) {
                        vm.room.DepartureDate = addDays(vm.room.ArrivalDate, 1);
                    } else {
                        vm.room.DepartureDate = oldValues.DepartureDate;
                    }
                }

                if (newValues.RoomId != 0 && newValues.RoomId != null && !newValues.HouseStatus) {
                    for (var index in vm.roomList) {
                        if (newValues.RoomId == vm.roomList[index].RoomId) {
                            newValues.HouseStatus = vm.roomList[index].HouseStatus;
                            break;
                        }
                    }
                }
                //AVAILABLE PLAN LIST
                vm.availablePlanList = _.filter(vm.planList, function(item) {
                    return (item.IsActive && item.RoomTypeId && newValues.RoomTypeId && item.RoomTypeId == newValues.RoomTypeId);
                }).sort(function(a, b) {
                    return parseInt(a.Priority) - parseInt(b.Priority);
                });

                if (newValues.RoomId != 0 && newValues.RoomId != null && newValues.RoomId != oldValues.RoomId) {
                    vm.RoomName = _.filter(vm.availableRoom, function(item) {
                        return (item.RoomId == newValues.RoomId);
                    })[0].RoomName;
                }

                if (newValues.RoomPriceId != 0 && newValues.RoomPriceId != null && newValues.RoomPriceId != oldValues.RoomPriceId) {
                    for (var index in vm.planList) {
                        if (vm.planList[index].RoomPriceId == newValues.RoomPriceId) {
                            vm.room.Price = vm.planList[index].FullDayPrice;
                            break;
                        }
                    }
                }
            }

            vm.availablePlanList = _.filter(vm.planList, function(item) {
                return (item.IsActive && item.RoomTypeId && newValues.RoomTypeId && item.RoomTypeId == newValues.RoomTypeId);
            }).sort(function(a, b) {
                return parseInt(a.Priority) - parseInt(b.Priority);
            });
        });



        function checkReservationGroup() {
            var reservationGroupTmp = walkInFactory.getReservationGroup();
            if (reservationGroupTmp != undefined && reservationGroupTmp != null) {
                walkInFactory.setReservationGroup(null);
                reservationGroup = reservationGroupTmp;
            };
        };

        function setRoomTL(roomId_TL) {
            if (roomId_TL != 0) {
                for (i = 0; i < vm.availableRoom.length; i++) {
                    if (vm.availableRoom[i].RoomId == roomId_TL) {
                        vm.room.RoomId = roomId_TL;
                        vm.room.RoomTypeId = vm.availableRoom[i].RoomTypeId;
                        break;
                    }
                }
                walkInFactory.setReservationTimeline(null);
            }
        }

        vm.updateRoomType = function() {
            var roomTemp;
            if (vm.room.RoomId > 0) {
                for (var index in vm.roomList) {
                    if (vm.roomList[index].RoomId == vm.room.RoomId) {
                        roomTemp = vm.roomList[index];
                        vm.room.RoomTypeId = roomTemp.RoomTypeId;
                        break;
                    }
                }

            }
        };
    }
]);
