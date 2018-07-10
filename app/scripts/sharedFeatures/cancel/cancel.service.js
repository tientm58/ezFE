ezCloud.factory("CancelService", ['$http', 'loginFactory', 'walkInFactory', '$rootScope', '$sessionStorage', '$location', 'dialogService', '$q', '$interval', '$timeout', '$filter', '$log', '$localStorage', '$stateParams', '$timeout', '$state', 'ConflictReservationService',
    function($http, loginFactory, walkInFactory, $rootScope, $sessionStorage, $location, dialogService, $q, $interval, $timeout, $filter, $log, $localStorage, $stateParams, $timeout, $state, ConflictReservationService) {
        var cancelModel = null;
        var CancelService = {
            setCancelModel: function(_cancelModel){
                cancelModel = _cancelModel;
            },
            getCancelModel: function(){
                return cancelModel;
            },
            buildCancelModel: function(selectRoom) {
                console.info("selectRoom before", selectRoom);
                var selectedRR = {};
                var selectedRoom = selectRoom == null ? walkInFactory.getCurrentRR() : selectRoom;
                if (selectedRoom != null) {
                    var keys = ["CANCEL_FEE", "PAYMENT_FOR_CANCELLATION_OF_RESERVATION", "REFUND_ALL_DEPOSITS_OF_RESERVATION", "RES_NO", "ROOM", "NOTIFICATION_NEWPAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER", "THIS_ROOM_EXTRA_SERVICE_WAS_DELETED_AUTOMATICALLY_BY_THE_CANCEL_PROCESS", "NOTIFICATION_BOOKED_CONTENT", "NOTIFICATION_BOOKED_NAN_CONTENT", "NOTIFICATION_CANCELED_NAN_CONTENT", "NOTIFICATION_CANCELED_CONTENT"];
                    var languageKeys = {};
                    for (var idx in keys) {
                        languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
                    }

                    selectedRR = {
                        ReservationRoomId: selectedRoom.ReservationRoomId,
                        ReservationNumber: selectedRoom.ReservationNumber,
                        RoomName: selectedRoom.RoomName,
                        RoomType: selectedRoom.RoomType,
                        ArrivalDate: selectedRoom.ArrivalDate,
                        DepartureDate: selectedRoom.DepartureDate,
                        Adults: selectedRoom.Adults,
                        Child: selectedRoom.Child,
                        PaymentsList: selectedRoom.PaymentsList,
                        Travellers: selectedRoom.Travellers,
                        RoomExtraServicesList: selectedRoom.RoomExtraServicesList,
                        RoomExtraServiceItemsList: selectedRoom.RoomExtraServiceItemsList,
                        TotalDeposit: 0,
                        languageKeys: languageKeys
                    }

                    if ($stateParams.reservationRoomId){
                        selectedRR.PaymentsList = walkInFactory.getPaymentList();
                        selectedRR.Travellers = walkInFactory.getCurrentCustomer();
                        selectedRR.RoomExtraServicesList = walkInFactory.getRoomExtraServices();
                    }
                    else{

                    }
                }
                console.info("CANCEL SELECTEDRR", selectedRR);
                return selectedRR;
            },
            processCancel: function(callback) {
                var cancelModel = this.getCancelModel();
                var processCancel = loginFactory.securedPostJSON("api/Room/ProcessCancel", cancelModel);
                $rootScope.dataLoadingPromise = processCancel;
                processCancel.success(function(data) {
                    var result = { status: true, object: data };
                    if (callback) callback(result);
                }).error(function(err) {
                    var result = { status: false, object: err };
                    if (callback) callback(result);
                })
            },
            checkValidBeforeCancel: function(RoomExtraServiceItemsList, RoomExtraServicesList) {
                var isValid = true;
                if (RoomExtraServiceItemsList != null && RoomExtraServiceItemsList.length > 0) {
                    var extraServiceItemTemp = _.filter(RoomExtraServiceItemsList, function (item) {
                        return item.IsDeleted == false;
                    });
                    if (extraServiceItemTemp && extraServiceItemTemp.length > 0) {
                        isValid = false;
                        dialogService.messageBox("WARNING", "YOU_HAVE_TO_PROCESS_ALL_EXTRA_SERVICES_IN_THIS_ROOM_BEFORE_CANCEL");
                        return;
                    }
                }
                if (RoomExtraServicesList != null && RoomExtraServicesList.length > 0) {
                    var extraServiceTemp = _.filter(RoomExtraServicesList, function (item) {
                        return item.RoomExtraServiceName == "EXTRA_SERVICES" && item.IsDeleted === false;
                    });
                    if (extraServiceTemp && extraServiceTemp.length > 0) {
                        isValid = false;
                        dialogService.messageBox("WARNING", "YOU_HAVE_TO_PROCESS_ALL_EXTRA_SERVICES_IN_THIS_ROOM_BEFORE_CANCEL");
                        return;
                    }

                }
                return isValid;
            }
        };
        return CancelService;
    }
]);
