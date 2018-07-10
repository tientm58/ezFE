ezCloud.factory("CheckOutService", ['loginFactory', 'walkInFactory', 'dialogService', '$stateParams', '$rootScope', '$state', '$filter', function(loginFactory, walkInFactory, dialogService, $stateParams, $rootScope, $state, $filter) {
    var CheckOutService = {
        buildCheckOutModel: function(saveReservationModel, callback){
            //var selectedRR = {};
            var checkOutModel = {};
            var reservationInfo = walkInFactory.getReservationRoomInfo();
            var staticContent = walkInFactory.getStaticContent();
            if (reservationInfo != null && staticContent != null){
                var keys = ["ROOM_MONTHLY", "ROOM_WEEKLY", "ROOM_FULL_DAY", "ROOM_DAY_NIGHT", "ROOM_HOURLY", "MINIBAR", "LAUNDRY", "EXTRA_ROOM_CHARGE", "COMPENSATION", "EXTRA_SERVICES", "FULL_DAY_EARLY_CHECKIN", "FULL_DAY_LATE_CHECKOUT", "DAY_NIGHT_EARLY_CHECKIN", "DAY_NIGHT_LATE_CHECKOUT", "EXTRA_ADULTS", "EXTRA_CHILDREN", "PAYMENT", "DISCOUNT_MONEY_OFF", "DISCOUNT_PERCENT_OFF", "FREE", "NOTIFICATION_BOOKED_CONTENT", "NOTIFICATION_BOOKED_NAN_CONTENT"];
                var languageKeys = {};
                for (var idx in keys) {
                    languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
                }
                saveReservationModel.languageKeys = languageKeys;
                saveReservationModel.room.BookingStatus = "CHECKOUT";
                if (data.reservationInfo.applyPastCheckOut) {
                    if (saveReservationModel.room.DepartureDate) {
                        saveReservationModel.room.DepartureDate = reservationInfo.room.DepartureDate;
                    }
                } else {
                    saveReservationModel.room.DepartureDate = new Date();
                }
                var calculateAdults = 0;
                var calculateChildren = 0;

                if (reservationInfo.room.Adults + reservationInfo..room.Child >= reservationInfo.sharerList.length) {
                    calculateAdults = reservationInfo.room.Adults;
                    calculateChildren = reservationInfo.room.Child;
                } else {
                    var children = 0;
                    var adults = 0;
                    for (var index in reservationInfo.sharerList) {
                        if (reservationInfo.sharerList[index] && reservationInfo.sharerList[index].travellerExtraInfo.IsChild) {
                            children = children + 1;
                        } else {
                            adults = adults + 1;
                        }
                    }
                    calculateAdults = adults;
                    calculateChildren = children;
                }
                saveReservationModel.room.Adults = calculateAdults;
                saveReservationModel.room.Child = calculateChildren;

                var paymentAmountString = ''
                var currentPayment = walkInFactory.getCurrentPayment();

                if (currentPayment != null){
                    currentPayment.Amount = walkInFactory.remainingAmount();
                    console.info("currentPayment.Amount", currentPayment.Amount);
                    if (reservationInfo.room.BookingStatus == "BOOKED" || reservationInfo.room.BookingStatus == 'NOSHOW') {
                        currentPayment.PaymentTypeName = "DEPOSIT";
                        currentPayment.Amount = 0;
                    }

                    if (currentPayment.Amount < 0) {
                        //payment.Amount = -payment.Amount;
                        payment.PaymentTypeName = "REFUND";
                    }
                    if (currentPayment.PaymentMethodId == 4 && currentPayment.PaymentTypeName == "NEW_PAYMENT") {
                        currentPayment.CompanyId = walkInFactory.getSelectedCompanyCityLedger().CompanyId
                    }
                    if (currentPayment.MoneyId != staticContent.defaultCurrency.MoneyId) {
                        for (var index in staticContent.currencies) {
                            if (staticContent.currencies[index].MoneyId == currentPayment.MoneyId) {
                                var decimal = _.filter(staticContent.currenciesISO, function(item) {
                                    return item.CurrencyId == staticContent.currencies[index].CurrencyId;
                                })[0].MinorUnit;
                                currentPayment.AmountInSpecificMoney = currentPayment.Amount;
                                currentPayment.Amount = currentPayment.Amount * staticContent.currencies[index].ExchangeRate;
                                paymentAmountString = $filter("currency")(currentPayment.Amount) + "(" + staticContent.currencies[index].MoneyName + " " + currentPayment.AmountInSpecificMoney.toFixed($rootScope.decimals) + ")";
                                break;
                            }
                        }
                    }
                    else{
                        paymentAmountString = $filter("currency")(currentPayment.Amount);
                    }
                }
                checkOutModel = {
                    saveReservationModel: saveReservationModel,
                    payment: currentPayment,
                    paymentAmountString: paymentAmountString
                };

            }

            if (callback) {
                callback(checkOutModel)
            }
        }
    };
    return CheckOutService
}]);