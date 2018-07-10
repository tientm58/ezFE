ezCloud.controller('WalkinGeneralReservationRoomCtrl', ['$scope', '$mdBottomSheet', '$rootScope', '$log', 'commonFactory', 'loginFactory', '$stateParams', 'roomListFactory', 'dialogService', '$state', '$mdDialog', '$locale', '$filter', '$localStorage', 'configFactory', '$mdMedia', 'smartCardFactory', '$timeout', '$location', 'reservationFactory', 'walkInFactory', 'AmendStayService', 'AssignRoomService', 'SharedFeaturesFactory',
    function($scope, $mdBottomSheet, $rootScope, $log, commonFactory, loginFactory, $stateParams, roomListFactory, dialogService, $state, $mdDialog, $locale, $filter, $localStorage, configFactory, $mdMedia, smartCardFactory, $timeout, $location, reservationFactory, walkInFactory, AmendStayService, AssignRoomService, SharedFeaturesFactory) {
        var vm = this;
        function InitWalkin_ReservationRoomDetail(){
            vm.isCheckOut = false;
            vm.isCancel   = false;
            walkInFactory.getReservationRoomResolved($stateParams.reservationRoomId).then(function(data) {
                if (data != null){
                    if (data.reservationInfo != null){
                        vm.applyPastCheckOut  = data.reservationInfo.applyPastCheckOut;
                        vm.pastCheckOutReason = data.reservationInfo.pastCheckOutReason;
                        vm.CMBookingId        = data.reservationInfo.CMBookingId;
                        vm.CMChannelRef       = data.reservationInfo.CMChannelRef;
                        vm.reservationNumber  = data.reservationInfo.reservationNumber;
                        vm.roomCharges        = data.reservationInfo.roomCharges;
                        vm.roomInfo           = data.reservationInfo.roomInfo;
                        vm.planInfo           = data.reservationInfo.planInfo;
                        vm.roomTypeInfo       = data.reservationInfo.roomTypeInfo;
                        vm.room               = data.reservationInfo.room;
                        if (vm.room != null){
                            vm.room.applyPastCheckOut = vm.applyPastCheckOut;
                            if (vm.room.ArrivalDate != null){
                                vm.room.ArrivalDate = new Date(vm.room.ArrivalDate);
                            }
                            if (vm.room.DepartureDate != null){
                                vm.room.DepartureDate = new Date(vm.room.DepartureDate);
                            }
                            vm.room.IsPreCheckOut = data.reservationInfo.IsPreCheckOut;
                            vm.isCheckOut                 = (vm.room.BookingStatus == "CHECKOUT") ? true : false;
                            vm.isCancel                   = (vm.room.BookingStatus == "CANCELLED") ? true : false;
                            vm.priceIfHasHourlyOrDayNight = data.reservationInfo.room.Price;
                            var calculateAdults = 0;
                            var calculateChildren = 0;
                            if (vm.room.Adults + vm.room.Child >= data.reservationInfo.sharerList.length) {
                                calculateAdults = vm.room.Adults;
                                calculateChildren = vm.room.Child;
                            } else {
                                var children = 0;
                                var adults = 0;
                                for (var index in data.reservationInfo.sharerList) {
                                    if (data.reservationInfo.sharerList[index] && data.reservationInfo.sharerList[index].travellerExtraInfo.IsChild) {
                                        children = children + 1;
                                    } else {
                                        adults = adults + 1;
                                    }
                                }
                                calculateAdults = adults;
                                calculateChildren = children;
                            }
                            vm.room.calculateAdults = calculateAdults;
                            vm.room.calculateChildren = calculateChildren;
                        }
                    }

                    if (data.CalculateRoomPrice != null && data.CalculateRoomPrice.actualPlanListDateRange != null){
                        vm.priceIfHasNoHourlyAndDayNight = data.CalculateRoomPrice.actualPlanListDateRange.totalPrice;
                    }

                    vm.roomList = data.RoomStatus;
                    if (data.RoomStatus != null && data.RoomStatus.notAssignRoomReservations != null){
                        vm.notAssignRoomReservations = data.RoomStatus.notAssignRoomReservations;
                    }
                }
                $timeout(function() {
                    var currentRR               = angular.copy(vm.room);
                    currentRR.RoomName          = vm.roomInfo.RoomId != 0 ? vm.roomInfo.RoomName : null;
                    currentRR.RoomType          = vm.roomTypeInfo;
                    currentRR.RoomPrice         = vm.planInfo;
                    currentRR.ReservationNumber = vm.reservationNumber;
                    walkInFactory.setCurrentRR(currentRR);
                },0);
            });

        }

        $scope.$on('InitWalkin_ReservationRoomDetail', function(e) {
            InitWalkin_ReservationRoomDetail();
        });

        vm.Init = function() {
            $scope.$emit("WalkinInit");
        };

        vm.processEditPrice = function() {
            walkInFactory.processEditPrice(vm.priceIfHasHourlyOrDayNight, vm.priceIfHasNoHourlyAndDayNight, vm.roomCharges, vm.planInfo, function(data){
                if (data == true){
                    vm.Init();
                }
            });
        };

        vm.processEditNote = function() {
            walkInFactory.processEditNote(vm.room.Note, function(data){
                if (data == true){
                    vm.Init();
                }
            })
        }

        vm.processEditCheckInTime = function() {
            walkInFactory.processEditCheckInTime(vm.room.ArrivalDate, function(data){
                if (data == true){
                    vm.Init();
                }
            });
        };

        vm.processCheckOutInThePast = function() {
            walkInFactory.processCheckOutInThePast(vm.applyPastCheckOut, vm.pastCheckOutReason, vm.room, function(data){
                if (data == true){
                    vm.Init();
                }
            });
        }
        vm.processAmendStay = function() {
            var selectedRR = AmendStayService.buildAmendStayModel(vm.room, vm.roomList, vm.notAssignRoomReservations);
            if (selectedRR != null){
                SharedFeaturesFactory.processAmendStay(selectedRR);
            }
        };

        vm.processAssignRoom = function() {
            AssignRoomService.buildAssignRoomModel(function(data){
                var selectedRR = data;
                if (selectedRR != null){
                    SharedFeaturesFactory.processAssignRoom(selectedRR);
                }
            });

        };
    }
]);