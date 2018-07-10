ezCloud.factory("CheckOutService", ['loginFactory', 'walkInFactory', 'dialogService', '$stateParams', '$rootScope', '$state', '$filter', '$mdDialog', function(loginFactory, walkInFactory, dialogService, $stateParams, $rootScope, $state, $filter, $mdDialog) {
    var CheckOutService = {
        checkValidBeforeCheckOut: function(){
            var result = true;
            var currentPayment = walkInFactory.getCurrentPayment();
            if (currentPayment != null) {
                console.info("currentPayment", currentPayment, walkInFactory.getSelectedCompanyCityLedger());
                if (currentPayment.PaymentMethodId == 4 && (walkInFactory.getSelectedCompanyCityLedger() == null || walkInFactory.getSelectedCompanyCityLedger().CompanyId == null)) {
                    result = false
                    dialogService.messageBox("INVALID_CITY_LEDGER", "PLEASE_SELECT_A_CITY_LEDGER");
                    return;
                }
                else{
                    return true;
                }
            }
            else{
                result = false;
            }
            return result;
        },
        buildCheckOutModel: function(saveReservationModel, callback) {
            var checkOutModel = {};
            var currentRR = walkInFactory.getCurrentRR();
            var staticContent = walkInFactory.getStaticContent();
            console.info("CHECKOUT STATIC CONTENT", staticContent);
            if (currentRR != null && staticContent != null){

                var keys = ["ROOM_MONTHLY", "ROOM_WEEKLY", "ROOM_FULL_DAY", "ROOM_DAY_NIGHT", "ROOM_HOURLY", "MINIBAR", "LAUNDRY", "EXTRA_ROOM_CHARGE", "COMPENSATION", "EXTRA_SERVICES", "FULL_DAY_EARLY_CHECKIN", "FULL_DAY_LATE_CHECKOUT", "DAY_NIGHT_EARLY_CHECKIN", "DAY_NIGHT_LATE_CHECKOUT", "EXTRA_ADULTS", "EXTRA_CHILDREN", "PAYMENT", "DISCOUNT_MONEY_OFF", "DISCOUNT_PERCENT_OFF", "FREE", "NOTIFICATION_BOOKED_CONTENT", "NOTIFICATION_BOOKED_NAN_CONTENT"];
                var languageKeys = {};
                for (var idx in keys) {
                    languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
                }
                saveReservationModel.languageKeys = languageKeys;
                saveReservationModel.room.BookingStatus = "CHECKOUT";
                if (saveReservationModel.room.applyPastCheckOut == false) {
                    saveReservationModel.room.DepartureDate = new Date();
                }

                var paymentAmountString = '';
                var currentPayment = walkInFactory.getCurrentPayment();
                if (currentPayment != null) {
                    currentPayment.Amount = walkInFactory.remainingAmount();
                    if (currentRR.BookingStatus == "BOOKED" || currentRR.BookingStatus == 'NOSHOW') {
                        currentPayment.PaymentTypeName = "DEPOSIT";
                        currentPayment.Amount = 0;
                    }
                    if (currentPayment.Amount < 0) {
                        //payment.Amount = -payment.Amount;
                        currentPayment.PaymentTypeName = "REFUND";
                    }
                    if (currentPayment.PaymentMethodId == 4 && currentPayment.PaymentTypeName === "NEW_PAYMENT") {
                        currentPayment.CompanyId = walkInFactory.getSelectedCompanyCityLedger().CompanyId;
                    }
                    if (staticContent.defaultCurrency && staticContent.currencies != null && currentPayment.MoneyId != staticContent.defaultCurrency.MoneyId) {
                        for (var index in staticContent.currencies) {
                            if (staticContent.currencies[index].MoneyId == currentPayment.MoneyId) {
                                var decimal = _.filter(staticContent.currenciesISO, function(item) {
                                    return item.CurrencyId == staticContent.currencies[index].CurrencyId;
                                })[0].MinorUnit;
                                currentPayment.AmountInSpecificMoney = currentPayment.Amount;
                                currentPayment.Amount = currentPayment.Amount * staticContent.currencies[index].ExchangeRate;
                                paymentAmountString = $filter("currency")(currentPayment.Amount) + "(" + staticContent.currencies[index].MoneyName + " " + currentPayment.AmountInSpecificMoney.toFixed(decimal) + ")";
                                break;
                            }
                        }
                    } else {
                        paymentAmountString = $filter("currency")(currentPayment.Amount);
                    }
                }
                var roomRemarks = currentRR.roomRemarks;
                for (var index in roomRemarks) {
                    if (roomRemarks[index].CreatedDate) {
                        roomRemarks[index].CreatedDate = new Date(roomRemarks[index].CreatedDate);
                    }
                    for (var index2 in staticContent.remarkEvents) {
                        if (staticContent.remarkEvents[index2].RemarkEventId == roomRemarks[index].RemarkEventId) {
                            roomRemarks[index].RemarkEventCode = staticContent.remarkEvents[index2].RemarkEventCode;
                            break;
                        }
                    }
                }

                checkOutModel = {
                    saveReservationModel: saveReservationModel,
                    roomRemarks: roomRemarks,
                    payment: currentPayment,
                    paymentAmountString: paymentAmountString
                };

            }

            if (callback) {
                callback(checkOutModel)
            }
        },
        processPayment: function(paymentModel) {
            var payment = angular.copy(paymentModel);
            var keys = ["RES_NO", "ROOM", "NOTIFICATION_NEWPAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER", "NOTIFICATION_BOOKED_CONTENT", "NOTIFICATION_BOOKED_NAN_CONTENT"];
            var languageKeys = {};
            for (var idx in keys) {
                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
            }

            payment.ReservationRoomId = $stateParams.reservationRoomId;
            var paymentModel = {
                payment: payment,
                languageKeys: languageKeys
            };
            var promise = loginFactory.securedPostJSON("api/Room/AddPayment", paymentModel);
            $rootScope.dataLoadingPromise = promise;
            promise.success(function(id) {
                $mdDialog.hide();
                dialogService.toast("ADD_PAYMENT_SUCCESSFUL");
                $state.go($state.current, {}, {
                    reload: true
                });
            }).error(function(err) {
                if (err.Message) {
                    dialogService.messageBox("ERROR", err.Message);
                }
            });
        }
    };
    return CheckOutService;

}]);
