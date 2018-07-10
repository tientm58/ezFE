ezCloud.controller('WalkinPaymentCtrl', ['$scope', '$mdBottomSheet', '$rootScope', '$log', 'commonFactory', 'loginFactory', '$stateParams', 'roomListFactory', 'dialogService', '$state', '$mdDialog', '$locale', '$filter', '$localStorage', 'configFactory', '$mdMedia', 'smartCardFactory', '$timeout', '$location', 'reservationFactory', 'walkInFactory',
    function($scope, $mdBottomSheet, $rootScope, $log, commonFactory, loginFactory, $stateParams, roomListFactory, dialogService, $state, $mdDialog, $locale, $filter, $localStorage, configFactory, $mdMedia, smartCardFactory, $timeout, $location, reservationFactory, walkInFactory) {
        var vm = this;
        vm.paymentList = [];
        function InitWalkin_Payment() {
            $scope.$mdMedia = $mdMedia;
            vm.hasRRIDParam = ($stateParams.reservationRoomId) ? true : false;
            vm.showDiscount = false;
            vm.paymentMethods = [];
            vm.payment = null;
            walkInFactory.getReservationRoomResolved($stateParams.reservationRoomId).then(function(data) {
                //Payment Methods

                vm.paymentMethods               = data.RoomStatus.paymentMethods;
                /*vm.selectedCompany              = walkInFactory.getSelectedCompanyCityLedger();
                console.info("payment init", vm.selectedCompany);*/
                var Invoice                     = data.RoomStatus.RoomInvoice.hotelFormRoomInvoice;
                var Receipt                     = data.RoomStatus.RoomInvoice.hotelFormRoomReceipt;
                vm.hotelFormRoomInvoice         = Invoice.FormType + Invoice.Value + '.trdx';
                vm.hotelFormRoomReceipt         = Receipt.FormType + Receipt.Value + '.trdx';
                var paymentMethodsNotCityLedger = new Array();
                for (var index in vm.paymentMethods) {
                    if (vm.paymentMethods[index].PaymentMethodName.toLowerCase() == "cash") {
                        vm.defaultPaymentMethod = vm.paymentMethods[index];
                        break;
                    }
                }

                vm.currencies                = data.RoomStatus.currencies;
                vm.currenciesISO             = data.RoomStatus.currenciesISO;
                vm.defaultCurrency           = data.RoomStatus.defaultCurrency;
                vm.decimal                   = $rootScope.decimals;
                vm.selectedCompanyCityLedger = walkInFactory.getSelectedCompanyCityLedger();
                vm.companyList = data.RoomStatus.companyList.sort(function(a, b) {
                    return a.Priority - b.Priority;
                });

                if (!vm.hasRRIDParam) {
                    vm.deposit = {
                        PaymentMethodId: vm.defaultPaymentMethod.PaymentMethodId,
                        MoneyId: vm.defaultCurrency.MoneyId,
                        PaymentTypeName: "DEPOSIT"
                    };
                } else {
                    vm.room      = data.reservationInfo.room;
                    vm.listUser  = data.reservationInfo.ListUser;
                    var payments = data.reservationInfo.Payments;
                    for (var index in payments) {
                        var temp = new Date(payments[index].CreatedDate);
                        payments[index].CreatedDate = new Date(payments[index].CreatedDate);
                        if (vm.listUser && vm.listUser.length > 0) {
                            for (var idx in vm.listUser) {
                                var user = vm.listUser[idx];
                                if (user.UserId == payments[index].CreatedUserId) {
                                    if (user.Email)
                                        payments[index].UserName = user.Email;
                                    else
                                        payments[index].UserName = user.StaffName;
                                }
                            }
                        }
                    };
                    if (payments.length > 0) {
                        for (var i = 0; i < payments.length - 1; i++) {
                            if (payments[i] != null) {
                                for (var j = i + 1; j < payments.length; j++) {
                                    if (payments[j] != null && payments[j].RefPaymentId != null && payments[j].RefPaymentId == payments[i].PaymentId) {
                                        payments[i].DeletedUserName    = payments[j].UserName;
                                        payments[i].DeletedDate        = new Date(payments[j].CreatedDate);
                                        payments[i].DeletedDescription = payments[j].PaymentDescription;
                                        payments[i].isDeleted          = true;
                                        payments[j]                    = null;
                                    }
                                }
                            }
                        }
                    }
                    var newPayments = new Array();
                    for (var i = 0; i < payments.length; i++) {
                        if (payments[i]) {
                            newPayments.push(payments[i]);
                        }
                    }

                    vm.Payments = newPayments;

                    for (var index in vm.Payments) {
                        if (vm.Payments[index].AmountInSpecificMoney) {
                            vm.Payments[index].MoneyName = null;
                            for (var idx in vm.currencies) {
                                if (vm.currencies[idx].MoneyId == vm.Payments[index].MoneyId) {
                                    vm.Payments[index].MoneyName = vm.currencies[idx].MoneyName;
                                    angular.forEach(vm.currenciesISO, function(arr) {
                                        if (vm.currencies[idx].CurrencyId == arr.CurrencyId) {
                                            vm.Payments[index].MinorUnitInSpecificMoney = arr.MinorUnit;
                                        }
                                    })
                                }
                            }
                        }
                    }

                    walkInFactory.setPaymentList(vm.Payments);
                    vm.payment = {
                        Amount: walkInFactory.remainingAmount(),
                        PaymentMethodId: vm.defaultPaymentMethod.PaymentMethodId,
                        MoneyId: vm.defaultCurrency.MoneyId,
                        PaymentTypeName: "NEW_PAYMENT"
                    };
                    if (vm.room.BookingStatus == "BOOKED" || vm.room.BookingStatus == 'NOSHOW') {
                        vm.payment.PaymentTypeName = "DEPOSIT";
                        vm.payment.Amount = 0;
                    }
                    if (vm.payment.Amount < 0) {
                        vm.payment.Amount = -vm.payment.Amount;
                    }
                }
                //walkInFactory.setCurrentPayment(vm.payment);
                $timeout(function() {
                     walkInFactory.setPaymentListForSaved(vm.paymentList);
                     walkInFactory.setCurrentPayment(vm.payment);
                     //walkInFactory.setSelectedCompanyCityLedger(vm.selectedCompany);
                },0);
            });
            $timeout(function() {
                console.info("timeout");
                 walkInFactory.setSelectedCompanyCityLedger(vm.selectedCompanyCityLedger);
            },0);

        }
        $scope.$on('InitWalkin_Payment', function(e) {
            InitWalkin_Payment();
        });

        vm.Init = function() {
            if (vm.payment != null){
                vm.payment.MoneyId = vm.defaultCurrency.MoneyId;
            }

            $scope.$emit("WalkinInit");
        };

        function resultDataProcess(data) {
            if (data.planListConstantlyFormula) {
                for (var index in data.planListConstantlyFormula) {
                    var formulaTemp = data.planListConstantlyFormula[index];

                    formulaTemp.Range.Start = new Date(formulaTemp.Range.Start);
                    formulaTemp.Range.End = new Date(formulaTemp.Range.End);
                    formulaTemp.FormulaPeriodAfter = formulaTemp.FormulaPeriod;
                    if (_.size(formulaTemp.NotAvailableDays) > 0) {
                        formulaTemp.FormulaPeriodAfter = formulaTemp.FormulaPeriod - _.size(formulaTemp.NotAvailableDays);

                        for (var index2 in formulaTemp.NotAvailableDays) {
                            var dateTemp = new Date(formulaTemp.NotAvailableDays[index2]).toLocaleDateString();
                            formulaTemp.NotAvailableDays[index2] = dateTemp;
                        }
                    }
                }
            }

            if (data.planListFullDayFormula && data.day > 0 && data.planListFullDayFormula.length > 0) {
                for (var index in data.planListFullDayFormula) {
                    var formulaTemp = data.planListFullDayFormula[index];

                    formulaTemp.range.Start = new Date(formulaTemp.range.Start);
                    formulaTemp.range.End = new Date(formulaTemp.range.End);
                }
            }

            if (data.planListHourlyFormula) {
                if (data.planListHourlyFormula.availableHourlyFormula) {
                    for (var index in data.planListHourlyFormula.availableHourlyFormula) {
                        var formulaTemp = data.planListHourlyFormula.availableHourlyFormula[index];

                        formulaTemp.Range.Start = new Date(formulaTemp.Range.Start);
                        formulaTemp.Range.End = new Date(formulaTemp.Range.End);
                    }
                }
                if (data.planListHourlyFormula.finalHourlyFormula) {
                    data.planListHourlyFormula.finalHourlyFormula.Range.Start = new Date(data.planListHourlyFormula.finalHourlyFormula.Range.Start);
                    data.planListHourlyFormula.finalHourlyFormula.Range.End = new Date(data.planListHourlyFormula.finalHourlyFormula.Range.End);
                }
            }
            return data;
        }


        $scope.$watchCollection("paymentCtrl.payment.MoneyId", function(newValues, oldValues) {
            if (newValues && oldValues && newValues != oldValues) {
                var amountTemp = angular.copy(vm.payment.Amount);
                var oldMoney = _.filter(vm.currencies, function(item) {
                    return item.MoneyId == oldValues;
                })[0];
                var currentMoney = _.filter(vm.currencies, function(item) {
                    return item.MoneyId == newValues;
                })[0];
                var currentCurrency = _.filter(vm.currenciesISO, function(item) {
                    return item.CurrencyId == currentMoney.CurrencyId;
                })[0];
                vm.decimal = currentCurrency.MinorUnit;
                $timeout(function() {
                    vm.payment.Amount = amountTemp * oldMoney.ExchangeRate / currentMoney.ExchangeRate;
                }, 0);
            }
        });


        $scope.$watchCollection("paymentCtrl.deposit.MoneyId", function(newValues, oldValues) {
            if (newValues && oldValues) {
                var amountTemp = angular.copy(vm.deposit.Amount);
                var oldMoney = _.filter(vm.currencies, function(item) {
                    return item.MoneyId == oldValues;
                })[0];
                var currentMoney = _.filter(vm.currencies, function(item) {
                    return item.MoneyId == newValues;
                })[0];
                var currentCurrency = _.filter(vm.currenciesISO, function(item) {
                    return item.CurrencyId == currentMoney.CurrencyId;
                })[0];
                vm.decimal = currentCurrency.MinorUnit;
                $timeout(function() {
                    vm.deposit.Amount = amountTemp * oldMoney.ExchangeRate / currentMoney.ExchangeRate;
                }, 0);
            }
        });

        $scope.$watchCollection("paymentCtrl.payment.PaymentMethodId", function(newValues, oldValues) {
            if (newValues && newValues == 4) {
                vm.selectedCompanyCityLedger = walkInFactory.getSelectedCompanyCityLedger();
            }
        });


        $scope.$watchCollection("paymentCtrl.payment.PaymentTypeName", function(newValues, oldValues) {
            if (newValues && oldValues) {
                vm.payment.PaymentMethodId = 1;
            }
        });

        vm.fillterPaymentMethodId = function(value, index, array) {
            if (value.PaymentMethodId == 4 && vm.payment.PaymentTypeName != "NEW_PAYMENT") {
                return false;
            }
            else {
                return true;
            }
        }

        vm.changePrice = function(price) {
            var diffDays = Math.round(Math.abs((vm.room.ArrivalDate.getTime() - vm.room.DepartureDate.getTime()) / (oneDay)));
            vm.room.Total = diffDays * vm.room.Price;
        }
        vm.addPayment = function() {
            var keys = ["RES_NO", "ROOM", "NOTIFICATION_NEWPAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER"];
            var languageKeys = {};
            for (var idx in keys) {
                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
            }
            var payment = angular.copy(vm.payment);
            if (!payment.Amount) {
                dialogService.messageBox("INVALID_AMOUNT", "PAYMENT_AMOUNT_CAN_NOT_BE_NULL");
                return;
            }
            if (payment.Amount <= 0) {
                dialogService.messageBox("INVALID_AMOUNT", "PAYMENT_AMOUNT_CAN_NOT_LESS_THAN_OR_EQUAL_TO_0");
                return;
            }

            if (payment.PaymentMethodId === 4 && (vm.selectedCompanyCityLedger == null || vm.selectedCompanyCityLedger.CompanyId == null)) {
                dialogService.messageBox("INVALID_CITY_LEDGER", "PLEASE_SELECT_A_CITY_LEDGER");
                return;
            }

            if (payment.PaymentMethodId === 4) {
                payment.CompanyId = vm.selectedCompanyCityLedger.CompanyId
            }

            var confirm;
            if (payment.MoneyId != vm.defaultCurrency.MoneyId) {
                for (var index in vm.currencies) {
                    if (vm.currencies[index].MoneyId == payment.MoneyId) {
                        var decimal = _.filter(vm.currenciesISO, function(item) {
                            return item.CurrencyId == vm.currencies[index].CurrencyId;
                        })[0].MinorUnit;
                        payment.AmountInSpecificMoney = payment.Amount;
                        payment.Amount = payment.Amount * vm.currencies[index].ExchangeRate;
                        confirm = dialogService.confirm("NEW_PAYMENT_CONFIRM", $filter("currency")(payment.Amount) + "(" + vm.currencies[index].MoneyName + " " + +payment.AmountInSpecificMoney.toFixed(decimal) + ")");
                        break;
                    }
                }
            } else {
                confirm = dialogService.confirm("NEW_PAYMENT_CONFIRM", $filter("currency")(payment.Amount));
            }
            if (payment.PaymentTypeName == "REFUND") {
                payment.Amount = -payment.Amount;
                payment.AmountInSpecificMoney = -payment.AmountInSpecificMoney;
            }


            confirm.then(function() {
                payment.ReservationRoomId = $stateParams.reservationRoomId;
                var paymentModel = {
                    payment: payment,
                    languageKeys: languageKeys
                }
                var promise = loginFactory.securedPostJSON("api/Room/AddPayment", paymentModel);
                $rootScope.dataLoadingPromise = promise;
                promise.success(
                    function(data) {
                        console.info("add payment success");
                        vm.Init();
                        dialogService.toast("ADD_PAYMENT_SUCCESSFUL");
                    }
                ).error(
                    function(error) {
                        dialogService.messageBox(error.Message);
                    }
                );

            });
        };

        vm.addDeposit = function() {
            var deposit = angular.copy(vm.deposit);
            if (!deposit.Amount) {
                dialogService.messageBox("INVALID_DEPOSIT", "DEPOSIT_AMOUNT_CAN_NOT_BE_NULL");
                return;
            }
            if (deposit.Amount <= 0) {
                dialogService.messageBox("INVALID_DEPOSIT", "DEPOSIT_AMOUNT_CAN_NOT_LESS_THAN_OR_EQUAL_TO_0");
                return;
            }
            var confirm;
            if (deposit.MoneyId != vm.defaultCurrency.MoneyId) {
                for (var index in vm.currencies) {
                    if (vm.currencies[index].MoneyId == deposit.MoneyId) {
                        var decimal = _.filter(vm.currenciesISO, function(item) {
                            return item.CurrencyId == vm.currencies[index].CurrencyId;
                        })[0].MinorUnit;
                        deposit.AmountInSpecificMoney = deposit.Amount;
                        deposit.Amount = deposit.Amount * vm.currencies[index].ExchangeRate;
                        deposit.MinorUnitInSpecificMoney = decimal;
                        deposit.MoneyName = vm.currencies[index].MoneyName;
                        confirm = dialogService.confirm("NEW_PAYMENT_CONFIRM", $filter("currency")(deposit.Amount) + "(" + vm.currencies[index].MoneyName + " " + +deposit.AmountInSpecificMoney.toFixed(decimal) + ")");
                        break;
                    }
                }
            } else {
                confirm = dialogService.confirm("NEW_PAYMENT_CONFIRM", $filter("currency")(vm.deposit.Amount));
            }

            if (deposit.PaymentTypeName == "REFUND") {
                deposit.Amount = -deposit.Amount;
                deposit.AmountInSpecificMoney = -deposit.AmountInSpecificMoney;
            }

            confirm.then(function() {
                deposit.CreatedDate = new Date();
                vm.paymentList.push(deposit);
                vm.Init();
                dialogService.toast("ADD_PAYMENT_SUCCESSFUL");
                vm.deposit.PaymentDescription = null;
                vm.deposit.Amount = null;

            });
        };

        vm.deletePayment = function(event, payment) {
            var keys = ["RES_NO", "ROOM", "NOTIFICATION_WHEN_DELETE_PAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER", "NOTIFICATION_DELETED_PAYMENT"];
            var languageKeys = {};
            for (var idx in keys) {
                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
            }
            var paymentTemp = angular.copy(payment);
            paymentTemp.RefPaymentId = paymentTemp.PaymentId;
            paymentTemp.PaymentTypeName = "DELETED";
            $mdDialog.show({
                controller: DeletePaymentDialogController,
                resolve: {
                    payment: function() {
                        return paymentTemp;
                    },
                },
                templateUrl: 'views/templates/deletePayment.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: event,
            }).then(function(deleteReason) {
                paymentTemp.PaymentDescription = deleteReason;
                var paymentModel = {
                    payment: paymentTemp,
                    languageKeys: languageKeys
                }
                var promise = loginFactory.securedPostJSON("api/Room/DeletePayment", paymentModel);
                $rootScope.dataLoadingPromise = promise;
                promise.success(
                    function(data) {
                        dialogService.toast("DELETE_PAYMENT_SUCCESSFUL");
                        vm.Init();
                    }
                ).error(
                    function(error) {
                        dialogService.messageBox(error.Message);
                    }
                );
            }, function() {

            });

            function DeletePaymentDialogController($scope, $mdDialog, payment, loginFactory) {
                function Init() {
                    $scope.payment = payment;
                    $scope.deleteReason = null;
                }
                Init();

                $scope.processDelete = function() {
                    $mdDialog.hide($scope.deleteReason);
                }

                $scope.hide = function() {
                    $mdDialog.hide();
                };
                $scope.cancel = function() {
                    $mdDialog.cancel();
                };
            }
        }

        vm.deleteDeposit = function(event, payment) {
            var message;
            if (payment.MinorUnitInSpecificMoney != null) {
                message = $filter("currency")(payment.Amount) + "(" + payment.MoneyName + " " + +payment.AmountInSpecificMoney.toFixed(payment.MinorUnitInSpecificMoney) + ")"
            } else {
                message = $filter('currency')(payment.Amount);
            }
            dialogService.confirm("DELETE_PAYMENT_CONFIRM", message).then(function() {
                vm.paymentList.splice(vm.paymentList.indexOf(payment), 1);
            });
        }


        vm.applyDiscount = function() {
            var keys = ["RES_NO", "ROOM", "NOTIFICATION_DISCOUNT_ROOM_PRICE", "NOTIFICATION_FREE_OF_CHARGE"];
            var languageKeys = {};
            for (var idx in keys) {
                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
            }
            if (typeof(vm.room.DiscountFlat) == 'undefined' || typeof(vm.room.DiscountPercentage) == 'undefined') {

                dialogService.messageBox("DISCOUNT_INVALID", "THE_TOTAL_OF_DISCOUNT_INVALID");
                vm.room.DiscountFlat = 0;
                return;
            }

            dialogService.confirm("NEW_DISCOUNT_CONFIRM", "DO_YOU_WANT_TO_APPLY_NEW_DISCOUNT").then(function() {
                if (vm.room.DiscountFlat == "" || vm.room.DiscountFlat == null) {
                    vm.room.DiscountFlat = 0;
                }
                if (vm.room.DiscountPercentage == "" || vm.room.DiscountPercentage == null) {
                    vm.room.DiscountPercentage = 0;
                }
                var ApplyDiscountModel = {
                    reservationRoomId: $stateParams.reservationRoomId,
                    FOC: vm.room.Foc,
                    DiscountPercentage: vm.room.DiscountPercentage,
                    DiscountFlat: vm.room.DiscountFlat,
                    languageKeys: languageKeys
                }
                var applyDiscount = loginFactory.securedPostJSON("api/Room/ApplyDiscount", ApplyDiscountModel);
                $rootScope.dataLoadingPromise = applyDiscount;
                applyDiscount.success(function() {
                    vm.Init();
                }).error(function(err) {
                    console.log(err);
                });
            });
        }

        vm.showPayment = function (ev, payment) {
            $mdDialog.show({
                controller: PaymentController,
                locals: {
                    reservationRoomId: $stateParams.reservationRoomId,
                    paymentId: payment.PaymentId,
                    paymentTypeName: payment.PaymentTypeName,
                    hotelFormRoomReceipt: vm.hotelFormRoomReceipt
                },
                templateUrl: 'views/templates/invoicePayment.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false
            })
            .then(function () {}, function () {

            });
        };


        function PaymentController($scope, $mdDialog, reservationRoomId, paymentId, paymentTypeName,hotelFormRoomReceipt) {
            globalInvoiceId = reservationRoomId;
            PaymentId = paymentId;
            PaymentTypeName = paymentTypeName;

            HotelFormRoomReceipt=hotelFormRoomReceipt;
             _PaymentNumber = 0;
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
        }

        vm.selectedCompanyCityLedger = null;
        vm.queryCompanySearchCityLedger = queryCompanySearchCityLedger;
        vm.selectedCompanyChangeCityLedger = selectedCompanyChangeCityLedger;
        vm.searchCompanyTextChangeCityLedger = searchCompanyTextChangeCityLedger;

        function change_alias(alias) {
            var str = alias;
            str = str.toLowerCase();
            str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ  |ặ|ẳ|ẵ/g, "a");
            str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
            str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
            str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ  |ợ|ở|ỡ/g, "o");
            str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
            str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
            str = str.replace(/đ/g, "d");
            str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'| |\"|\&|\#|\[|\]|~|$|_/g, "");
            str = str.replace(/-+-/g, "");
            str = str.replace(/^\-+|\-+$/g, "");
            return str;
        }

        function createCompanyFilterFor(query) {
            var lowercaseQuery = change_alias(query);
            return function filterFn(item) {
                return (change_alias(item.CompanyName.toLowerCase()).indexOf(lowercaseQuery) >= 0 || change_alias(item.CompanyCode.toLowerCase()).indexOf(lowercaseQuery) >= 0);
            };
        }

        function queryCompanySearchCityLedger(query) {
            var results = query ? vm.companyList.filter(createCompanyFilterFor(query)) : vm.companyList,
                deferred;
            if (self.simulateQuery) {
                deferred = $q.defer();
                $timeout(function () {
                    deferred.resolve(results);
                }, Math.random() * 1000, false);
                return deferred.promise;
            } else {
                return results;
            }
        }

        function selectedCompanyChangeCityLedger(item) {
            if (item != undefined) {
                vm.selectedCompanyCityLedger = item;
                walkInFactory.setSelectedCompanyCityLedger(vm.selectedCompanyCityLedger);
            } else {
                vm.selectedCompanyCityLedger = null;
                walkInFactory.setSelectedCompanyCityLedger(null);
            }
        }

        function searchCompanyTextChangeCityLedger(text) {
            vm.searchCompanyTextCityLedger = text;
        }


    }
]);
