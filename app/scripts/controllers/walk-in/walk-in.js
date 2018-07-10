ezCloud.controller('WalkinController', ['$scope', '$mdBottomSheet', '$rootScope', '$log', 'commonFactory', 'loginFactory', '$stateParams', 'roomListFactory', 'dialogService', '$state', '$mdDialog', '$locale', '$filter', '$localStorage', 'configFactory', 'currentHotelConnectivities', '$mdMedia', 'smartCardFactory', '$timeout', '$location', 'reservationFactory', 'walkInFactory', '$q', 'CancelService','SharedFeaturesFactory', 'SaveReservationService',
    function($scope, $mdBottomSheet, $rootScope, $log, commonFactory, loginFactory, $stateParams, roomListFactory, dialogService, $state, $mdDialog, $locale, $filter, $localStorage, configFactory, currentHotelConnectivities, $mdMedia, smartCardFactory, $timeout, $location, reservationFactory, walkInFactory, $q, CancelService, SharedFeaturesFactory, SaveReservationService) {
        var vm = this;
        vm.$mdMedia = $mdMedia;
        vm.rooms = [];
        vm.page = {
            searchES: ''
        }
        var reservationTimeline = false;
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
        vm.viewType             = "detailGroup";
        vm.hotelFormRoomInvoice = [];
        vm.hotelFormRoomReceipt = [];
        vm.isCheckOut           = false;

        function Init() {

            walkInFactory.getReservationRoomResolved($stateParams.reservationRoomId)
                .then(function(data) {
                    console.info("walkinInit", data);
                    vm.hasRRIDParam         = ($stateParams.reservationRoomId) ? true : false;
                    vm.decimal              = $rootScope.decimals;
                    var Invoice             = data.RoomStatus.RoomInvoice.hotelFormRoomInvoice;
                    var Receipt             = data.RoomStatus.RoomInvoice.hotelFormRoomReceipt;
                    vm.hotelFormRoomInvoice = Invoice.FormType + Invoice.Value + '.trdx';
                    vm.hotelFormRoomReceipt = Receipt.FormType + Receipt.Value + '.trdx';
                    // New Walkin
                    // Chỉ Init Controllers cần thiết
                    if (!vm.hasRRIDParam) {
                        $scope.$broadcast('InitWalkin_NewReservationRoom');
                        $scope.$broadcast('InitWalkin_NewCustomer');
                    }
                    // Reserved Room
                    // Chỉ Init Controllers cần thiết
                    else {
                        vm.reservationNumber = data.reservationInfo.reservationNumber;
                        vm.applyPastCheckOut = data.reservationInfo.applyPastCheckOut;
                        vm.roomInfo          = data.reservationInfo.roomInfo;
                        vm.room              = data.reservationInfo.room;
                        console.log('loinq',vm.room.BookingStatus);
                        if (vm.room.BookingStatus == "CHECKIN" || vm.room.BookingStatus == "OVERDUE"){
                            if (data.CalculateRoomPrice != null){
                                walkInFactory.setRoomTotal(data.CalculateRoomPrice.totalPrice);
                            }
                        }
                        if (vm.room.BookingStatus == "BOOKED" || vm.room.BookingStatus == "NOSHOW"){
                            walkInFactory.setRoomTotal(0);
                        }
                        if(vm.room.BookingStatus == "CHECKOUT"){
                            vm.isCheckOut = true;
                        }
                        
                        $scope.$broadcast('InitWalkin_ReservationRoomDetail');
                        $scope.$broadcast('InitWalkin_CustomerDetail');
                        $scope.$broadcast('InitWalkin_ExtraService');

                    }
                    $scope.$broadcast('InitWalkin_Option');
                    $scope.$broadcast('InitWalkin_Payment');

                    $timeout(function(){
                        $scope.$broadcast('InitWalkin_PriceList');
                        if (vm.hasRRIDParam && vm.room.BookingStatus != "CHECKOUT" && vm.room.BookingStatus != "CANCELLED"){
                            vm.Amount = walkInFactory.remainingAmount();
                        }
                        else{
                            vm.Amount = 0;
                        }
                        walkInFactory.setStaticContent(data.RoomStatus);
                        walkInFactory.setReservationRoomInfo(data.reservationInfo);
                        walkInFactory.setCurrentHotelConnectivities(currentHotelConnectivities);
                        walkInFactory.setPromise(null);
                    },0);
                });
        };
        vm.Init = Init;
        vm.Init();

        var walkinInit = $rootScope.$on("WalkinInit", function() {
            Init();
        });

        $scope.$on('$destroy', function() {
            walkinInit();
        });


        //SAVE RESERVATION
        vm.Save = function(status) {
            var saveReservationModel = SaveReservationService.buildSaveReservationModel();
            if (status == 'CHECKIN') {
                SaveReservationService.processCheckIn(saveReservationModel);
            }
            if (status == 'BOOKED') {
                SaveReservationService.processBook(saveReservationModel);
            }
            if (status == 'CHECKOUT' || status == 'PAYMENT_AND_CHECKOUT') {
                SaveReservationService.processCheckOut(saveReservationModel);
            }
        }

        vm.processCancel = function (event) {
            if (CancelService.checkValidBeforeCancel()){
                var selectedRR = CancelService.buildCancelModel();
                if (selectedRR != null){
                    SharedFeaturesFactory.processCancel(selectedRR);
                }
            }
        };

        vm.showInvoice = function (ev) {
            walkInFactory.processShowInvoice(ev, vm.hotelFormRoomInvoice);
        };

    }


]);
