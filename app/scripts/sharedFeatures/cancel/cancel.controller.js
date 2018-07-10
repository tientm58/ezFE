ezCloud.controller('CancelController', ['$scope', 'CancelService', '$mdBottomSheet', '$rootScope', '$log', 'commonFactory', 'loginFactory', '$stateParams', 'roomListFactory', 'dialogService', '$state', '$mdDialog', '$locale', '$filter', '$localStorage', 'configFactory', '$mdMedia', 'smartCardFactory', '$timeout', '$location', 'reservationFactory', 'walkInFactory', 'SharedFeaturesFactory', 'ConflictReservationService',
    function ($scope, CancelService, $mdBottomSheet, $rootScope, $log, commonFactory, loginFactory, $stateParams, roomListFactory, dialogService, $state, $mdDialog, $locale, $filter, $localStorage, configFactory, $mdMedia, smartCardFactory, $timeout, $location, reservationFactory, walkInFactory, SharedFeaturesFactory, ConflictReservationService) {
        var nq = this;

        function Init() {
            nq.currentRoom = SharedFeaturesFactory.getFeatureModel();
            var keys = ["CANCEL_FEE", "PAYMENT_FOR_CANCELLATION_OF_RESERVATION", "REFUND_ALL_DEPOSITS_OF_RESERVATION", "RES_NO", "ROOM", "NOTIFICATION_NEWPAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER", "THIS_ROOM_EXTRA_SERVICE_WAS_DELETED_AUTOMATICALLY_BY_THE_CANCEL_PROCESS", "NOTIFICATION_CANCELED_NAN_CONTENT", "NOTIFICATION_CANCELED_CONTENT"];
            var languageKeys = {};
            for (var idx in keys) {
                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
            }
            nq.currentRoom.languageKeys = languageKeys;
            nq.SendEmail = true;
            nq.ReservationRoomId = nq.currentRoom.reservationRoom.ReservationRoomId;
            nq.ReservationNumber = nq.currentRoom.reservationRoom.Reservations.ReservationNumber;
            console.log("CANCEL SELECTED ROOM", nq.currentRoom);
            nq.decimal = $rootScope.decimals;
            nq.currentRoom.TotalDeposit = 0;
            if (nq.currentRoom.reservationRoom && nq.currentRoom.reservationRoom.PaymentsList && nq.currentRoom.reservationRoom.PaymentsList.length > 0) {
                for (var index in nq.currentRoom.reservationRoom.PaymentsList) {
                    if (nq.currentRoom.reservationRoom.PaymentsList[index].Amount != undefined) {
                        nq.currentRoom.TotalDeposit = nq.currentRoom.TotalDeposit + nq.currentRoom.reservationRoom.PaymentsList[index].Amount;
                    }
                    console.log("CANCEL SELECTED ROOM", nq.currentRoom.reservationRoom.PaymentsList[index].Amount != undefined);
                }
            }

            if (nq.currentRoom.reservationRoom && nq.currentRoom.reservationRoom.RoomExtraServicesList && nq.currentRoom.reservationRoom.RoomExtraServicesList.length > 0) {
                for (var index in nq.currentRoom.reservationRoom.RoomExtraServicesList) {
                    if (!nq.currentRoom.reservationRoom.RoomExtraServicesList[index].IsDeleted) {
                        nq.currentRoom.TotalDeposit = nq.currentRoom.TotalDeposit - nq.currentRoom.reservationRoom.RoomExtraServicesList[index].Amount;
                    }
                }
            }

            if (nq.currentRoom.reservationRoom.ArrivalDate) {
                nq.currentRoom.reservationRoom.ArrivalDate = new Date(nq.currentRoom.reservationRoom.ArrivalDate);
            }
            if (nq.currentRoom.reservationRoom.DepartureDate) {
                nq.currentRoom.reservationRoom.DepartureDate = new Date(nq.currentRoom.reservationRoom.DepartureDate);
            }
            nq.applyCancellationFees = false;
            nq.cancelReason = null;
            nq.cancelFlat = 0;
            nq.cancelPercentage = 0;
            nq.warningCancellationFeeInvalid = false;
            nq.warningMissingReason = false;
            nq.IsDashboard = nq.currentRoom.IsDashboard || 0;
        }
        Init();

        nq.processCancel = function () {
            if (!nq.cancelReason || nq.cancelReason.trim() == '') {
                nq.warningMissingReason = true;
            } else if (nq.currentRoom.TotalDeposit > 0 && nq.currentRoom.TotalDeposit * nq.cancelPercentage / 100 + nq.cancelFlat > nq.currentRoom.TotalDeposit) {
                nq.warningCancellationFeeInvalid = true;
                nq.warningMissingReason = false;
            } else if (nq.applyCancellationFees && (nq.cancelFlat + nq.cancelPercentage == 0)) {
                nq.warningMissingFees = true;
                nq.warningCancellationFeeInvalid = false;
                nq.warningMissingReason = false;
            } else {
                var cancelModel = {
                    ReservationRoomId: nq.ReservationRoomId,
                    ApplyCancellationFees: nq.applyCancellationFees,
                    CancelReason: nq.cancelReason,
                    CancelFlat: nq.cancelFlat,
                    CancelPercentage: nq.cancelPercentage,
                    TotalDeposit: nq.currentRoom.TotalDeposit,
                    languageKeys: nq.currentRoom.languageKeys
                };
                CancelService.setCancelModel(cancelModel);
                CancelService.processCancel(function (data) {
                    $mdDialog.hide();
                    var result = data;
                    if (result.status == true) {
                        dialogService.toast("CANCEL_BOOKING_SUCCESSFUL");
                        $state.go($state.current, {}, {
                            reload: true
                        });
                        // if( viewType == "TIMELINE" ){
                        // 	$rootScope.$emit("UpdateTimeLine", { "action" : "CANCEL","data":cancelModel });
                        // }else{
                        // 	$rootScope.$emit("HomeInit", {});
                        // }
                    } else {
                        dialogService.toastWarn("CANCEL_GROUP_MASTER");
                        //ConflictReservationService.processConflictReservation(result.object);
                    }
                });
            }
        }

        nq.processCancelDB = function () {
            if (!nq.cancelReason || nq.cancelReason.trim() == '') {
                nq.warningMissingReason = true;
            } else if (nq.currentRoom.TotalDeposit > 0 && nq.currentRoom.TotalDeposit * nq.cancelPercentage / 100 + nq.cancelFlat > nq.currentRoom.TotalDeposit) {
                nq.warningCancellationFeeInvalid = true;
                nq.warningMissingReason = false;
            } else if (nq.applyCancellationFees && (nq.cancelFlat + nq.cancelPercentage == 0)) {
                nq.warningMissingFees = true;
                nq.warningCancellationFeeInvalid = false;
                nq.warningMissingReason = false;
            } else {
                var cancelModel = {
                    ReservationRoomId: nq.ReservationRoomId,
                    ApplyCancellationFees: nq.applyCancellationFees,
                    CancelReason: nq.cancelReason,
                    CancelFlat: nq.cancelFlat,
                    CancelPercentage: nq.cancelPercentage,
                    TotalDeposit: nq.currentRoom.TotalDeposit,
                    languageKeys: nq.currentRoom.languageKeys
                };
                CancelService.setCancelModel(cancelModel);
                CancelService.processCancel(function (data) {
                    $mdDialog.hide();
                    var result = data;
                    if (result.status == true) {
                        dialogService.toast("CANCEL_BOOKING_SUCCESSFUL");
                        // $state.go($state.current, {}, {
                        //     reload: true
                        // });
                        // if( viewType == "TIMELINE" ){
                        // 	$rootScope.$emit("UpdateTimeLine", { "action" : "CANCEL","data":cancelModel });
                        // }else{
                        // 	$rootScope.$emit("HomeInit", {});
                        // }
                    } else {
                        dialogService.toastWarn("CANCEL_GROUP_MASTER");
                        //ConflictReservationService.processConflictReservation(result.object);
                    }
                });
            }
        }

        nq.cancel = function () {
            $mdDialog.cancel();
        }
    }
]);