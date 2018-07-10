ezCloud.factory("BookService", ['loginFactory', 'walkInFactory', 'dialogService', '$stateParams', '$rootScope', '$state', function(loginFactory, walkInFactory, dialogService, $stateParams, $rootScope, $state) {
    var BookService = {
        checkValidBeforeBook: function(saveReservationModel) {
            if (saveReservationModel != null){
                if (saveReservationModel.room != null){
                    if (typeof(saveReservationModel.room.DiscountFlat) == 'undefined' || typeof(saveReservationModel.room.DiscountPercentage) == 'undefined') {
                        dialogService.messageBox("DISCOUNT_INVALID", "THE_TOTAL_OF_DISCOUNT_INVALID");
                        saveReservationModel.room.DiscountFlat = 0;
                        return;
                    }

                    if (!saveReservationModel.room.RoomTypeId) {
                        dialogService.messageBox("MISSING_ROOM_TYPE", "PLEASE_SELECT_A_ROOM_TYPE_TO_PERFORM_RESERVE_ACTION");
                        return;
                    }
                    if (!saveReservationModel.room.RoomPriceId) {
                        dialogService.messageBox("MISSING_ROOM_PRICE", "PLEASE_SELECT_A_ROOM_PRICE_TYPE_TO_PERFORM_RESERVE_ACTION");
                        return;
                    }
                    if (saveReservationModel.room.ArrivalDate > saveReservationModel.room.DepartureDate) {
                        dialogService.messageBox("INVALID_ARRIVAL/DEPARTURE_DATE", "PLEASE_SELECT_A_VALID_DATE_TO_PERFORM_RESERVE_ACTION");
                        return;
                    }
                }

                if (saveReservationModel.customer != null){
                    if (!saveReservationModel.customer.Fullname) {
                        dialogService.messageBox("MISSING_CUSTOMER", "PLEASE_CREATE_NEW_OR_CHOOSE_AT_LEAST_ONE_CUSTOMER_TO_PERFORM_RESERVE_ACTION");
                        return;
                    }
                    if (saveReservationModel.customer.Fullname.length > 50) {
                        dialogService.messageBox("WARNING", "FULLNAME_LENGTH_MUST_NOT_BIGGER_(50)_CHARACTERS_TO_PERFORM_RESERVE_ACTION");
                        return;
                    }
                }
            }
            return true;
        },
        processBook: function(saveReservationModel) {

            saveReservationModel.room.BookingStatus = "BOOKED"
            var save = loginFactory.securedPostJSON("api/Room/Save", saveReservationModel);
            $rootScope.dataLoadingPromise = save;
            save.success(function(id) {
                dialogService.toast("RESERVE_ROOM_SUCCESSFUL");
                $state.go("reservation", {
                    reservationRoomId: id
                }, {
                    reload: true
                });

            }).error(function(err) {
                if (err.Message) {
                    dialogService.messageBox("Error", err.Message).then(function() {
                        $state.go($state.current, {}, {
                            reload: true
                        });
                    });
                } else {
                    conflictReservationProcess(err);
                } //End Else

            });
        }
    };
    return BookService;

}]);
