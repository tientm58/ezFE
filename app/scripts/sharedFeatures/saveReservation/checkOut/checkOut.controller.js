ezCloud.controller('CheckOutController', ['$scope', 'SaveReservationService', 'ConflictReservationService', '$mdBottomSheet', '$rootScope', '$log', 'commonFactory', 'loginFactory', '$stateParams', 'roomListFactory', 'dialogService', '$state', '$mdDialog', '$locale', '$filter', '$localStorage', 'configFactory', '$mdMedia', 'smartCardFactory', '$timeout', '$location', 'reservationFactory', 'walkInFactory', 'SharedFeaturesFactory', 'CheckOutService',
    function($scope, SaveReservationService, ConflictReservationService, $mdBottomSheet, $rootScope, $log, commonFactory, loginFactory, $stateParams, roomListFactory, dialogService, $state, $mdDialog, $locale, $filter, $localStorage, configFactory, $mdMedia, smartCardFactory, $timeout, $location, reservationFactory, walkInFactory, SharedFeaturesFactory, CheckOutService) {
        var vm = this;
        var currentHotelConnectivities = walkInFactory.getCurrentHotelConnectivities();

        function Init() {

            vm.saveReservationModel = SaveReservationService.getSaveReservationModel();
            CheckOutService.buildCheckOutModel(vm.saveReservationModel, function(data) {
                console.info("check-out", data);
                vm.room = data.saveReservationModel.room;
                vm.roomRemarks = data.roomRemarks;
                vm.payment = data.payment;
                vm.paymentAmountString = data.paymentAmountString;
                vm.languageKeys = data.saveReservationModel.languageKeys;
                vm.isCheckoutAndPayment = walkInFactory.remainingAmount() != 0;
            });
        }
        Init();
        vm.hide = function() {
            $mdDialog.hide();
        };
        vm.cancel = function() {
            $mdDialog.cancel();
        };

        function processIsInputCardToCheckOut(callback) {
            //check Pre CheckOut
            if (vm.room && vm.room.IsPreCheckOut) {
                callback(true);
                return;
            }
            if (currentHotelConnectivities && currentHotelConnectivities.isUsed) {
                //use card to checkout
                if (currentHotelConnectivities.IsInputCardToCheckout) {
                    dialogService.messageBox("PLEASE_BE_SURE_THE_VALID_CARD_IS_BEING_INSERTED").then(function(arr) {
                        var readCard = smartCardFactory.readCardOnly();
                        readCard.then(function(dataCard) {
                            if (dataCard == -1) {
                                dialogService.messageBox("INVALID_CARD");
                                callback(false);
                            } else if (dataCard && dataCard.TravellerId) {
                                if (dataCard.TravellerId == vm.room.ReservationRoomId) {
                                    callback(true);
                                } else {
                                    dialogService.messageBox("CARD_IS_NOT_CORRECT_ROOM");
                                    callback(false);
                                }

                            }
                        });
                    });
                } else
                    callback(true);
            } else {
                //Not use Smart Card
                callback(true);
            }
        };

        function deleteCard() {
            if (vm.room && vm.room.IsPreCheckOut) {
                return;
            }
            if (currentHotelConnectivities && currentHotelConnectivities.isUsed) {
                if (currentHotelConnectivities.IsInputCardToCheckout) {
                    var deleteCardModel = {
                        ArrivalDate: vm.room.ArrivalDate,
                        DepartureDate: vm.room.DepartureDate,
                        RoomName: vm.room.RoomName,
                        TravellerId: vm.room.ReservationRoomId,
                    };
                    smartCardFactory.deleteCard(deleteCardModel);
                }
            }
        }
        //
        vm.processCheckOut = function() {
            $mdDialog.hide();
            var checkOutModel = {
                room: vm.room,
                languageKeys: vm.languageKeys
            }
            var processCheckOut = loginFactory.securedPostJSON("api/Room/Save", checkOutModel)
            $rootScope.dataLoadingPromise = processCheckOut;
            processCheckOut.success(function(id) {
                dialogService.toast("CHECKOUT_SUCCESSFUL");
                $state.go($state.current, {}, {
                    reload: true
                });
            }).error(function(err) {
                if (err.Message) {
                    dialogService.messageBox("ERROR", err.Message);
                } else {
                    //ConflictReservationService.processConflictReservation(err);
                    data.room.BookingStatus = "CHECKIN";
                    SharedFeaturesFactory.processConflictReservation(err,vm.room, "CHECKOUT");
                }
            });
        };

        vm.processPayment = function() {
            CheckOutService.processPayment(vm.payment);
        };
        //loinq
        vm.processQuickCheckOut = function() {
            //check smart card
            if (processIsInputCardToCheckOut(function(dataCard) {
                if (!dataCard) return;
                var paymentModel = null;
                if (vm.isCheckoutAndPayment) {
                    //Payment
                    var Paykeys = ["RES_NO", "ROOM", "NOTIFICATION_NEWPAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER", "NOTIFICATION_BOOKED_CONTENT", "NOTIFICATION_BOOKED_NAN_CONTENT"];
                    var languagePayKeys = {};
                    for (var idx in Paykeys) {
                        languagePayKeys[Paykeys[idx]] = $filter("translate")(Paykeys[idx]);
                    };
                    vm.payment.ReservationRoomId = $stateParams.reservationRoomId;

                    var paymentModel = {
                        payment: vm.payment,
                        languageKeys: languagePayKeys
                    }
                }
                //process checkout
                //data.room.BookingStatus = "CHECKOUT";
                var model = {
                    Payments: paymentModel,
                    RoomData: vm.saveReservationModel
                }
                $mdDialog.hide();
                var promise = loginFactory.securedPostJSON("api/Room/ProcessQuickCheckOut", model);
                $rootScope.dataLoadingPromise = promise;
                promise.success(function(id) {
                    deleteCard();
                    dialogService.toast("CHECKOUT_SUCCESSFUL");
                    $state.go($state.current, {}, {
                        reload: true
                    });
                }).error(function(err) {
                    //dialogService.toast("ERROR" + err.Message);
                    if (err.Message) {
                        dialogService.messageBox("ERROR", err.Message);
                    } else {
                        //ConflictReservationService.processConflictReservation(err);
                        data.room.BookingStatus = "CHECKIN";
                        SharedFeaturesFactory.processConflictReservation(err,vm.room, "CHECKOUT");
                    }
                })
            }));
        };
    }
]);
