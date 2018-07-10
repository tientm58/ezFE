ezCloud.controller('GroupReservationDetailController', ['SharedFeaturesFactory', 'EmailMarketingFactory', '$scope', '$rootScope', '$state', 'dialogService', '$localStorage', 'loginFactory', '$mdDialog', 'groupReservationFactory', '$stateParams', '$filter', '$mdDialog', '$location', 'roomListFactory', 'walkInFactory', '$q', 'reservationFactory', '$timeout', 'currentHotelConnectivities', 'smartCardFactory', 'commonFactory',
    function (SharedFeaturesFactory, EmailMarketingFactory, $scope, $rootScope, $state, dialogService, $localStorage, loginFactory, $mdDialog, groupReservationFactory, $stateParams, $filter, $mdDialog, $location, roomListFactory, walkInFactory, $q, reservationFactory, $timeout, currentHotelConnectivities, smartCardFactory, commonFactory) {
        $scope.selectedRoom = [];
        $scope.limitOptions = [5, 10, 15];
        $scope.query = {
            // order: 'ArrivalDate',
            limit: 1000,
            page: 1
        };

        $scope.isUsePassport = false;

        function isUsePassport() {
            if ($rootScope.EzModulesActive == undefined || $rootScope.EzModulesActive == null) {
                commonFactory.getHotelCommonInformation();
            }
            var EzModulesActive = $rootScope.EzModulesActive;
            console.log("tuyendao walkin", EzModulesActive);
            var PassportModule = _.find(EzModulesActive, function (item) {
                return item.ModuleCode === "PASSPORT";
            })
            return PassportModule != null ? true : false;
        };

        $scope.currentHotelConnectivities = currentHotelConnectivities;
        $scope.hotelFormGroupInvoiceSimple = [];
        $scope.hotelFormGroupInvoiceDetail = [];
        $scope.hotelFormGroupReceipt = [];
        $scope.showEmail = false;

        function InitGroupReservationDetail() {
            jQuery(document).unbind('keydown');
            $scope.inProgressCheckOut = false;
            $scope.valueSelected = "";
            $scope.selectedRoom = [];
            $scope.payment = {
                PaymentMethodId: 1,
            };
            $scope.filterPaymentsBy = {
                ReservationRoomId: 0
            };
            $scope.selectedItem = null;
            $scope.searchText = "";

            $scope.DatePickerOption = {
                format: 'dd/MM/yyyy'
            };

            $scope.isUsePassport = isUsePassport();

            $scope.selectedCompanyCityLedger = null;
            $scope.queryCompanySearchCityLedger = queryCompanySearchCityLedger;
            $scope.selectedCompanyChangeCityLedger = selectedCompanyChangeCityLedger;
            $scope.searchCompanyTextChangeCityLedger = searchCompanyTextChangeCityLedger;

            $scope.selectedCompany = null;
            $scope.queryCompanySearch = queryCompanySearch;
            $scope.selectedCompanyChange = selectedCompanyChange;
            $scope.searchCompanyTextChange = searchCompanyTextChange;

            $scope.selectedSource = null;
            $scope.querySourceSearch = querySourceSearch;
            $scope.selectedSourceChange = selectedSourceChange;
            $scope.searchSourceTextChange = searchSourceTextChange;

            $scope.selectedMarket = null;
            $scope.queryMarketSearch = queryMarketSearch;
            $scope.selectedMarketChange = selectedMarketChange;
            $scope.searchMarketTextChange = searchMarketTextChange;
            $scope.decimal = angular.copy($rootScope.decimals);
            groupReservationFactory.getGroupReservationDetail($stateParams.reservationId, function (data) {
                $scope.groupData = data;
                //Currencies
                $scope.currencies = data.GeneralInfo.Currencies;
                $scope.currenciesISO = data.GeneralInfo.CurrenciesISO;
                $scope.payment.MoneyId = data.GeneralInfo.DefaultHotelMoneyId;
                $scope.defaultMoney = data.GeneralInfo.DefaultHotelMoneyId;
                $scope.defaultCurrency = _.find($scope.currencies, function (curr) {
                    return curr['MoneyId'] === $scope.defaultMoney
                });
                if (_.isUndefined($scope.defaultCurrency)) {
                    _.find($scope.currencies, function (curr) {
                        return curr['MoneyName'] === 'VND'
                    });
                }
                $scope.CurrencyOk = _.find($scope.currenciesISO, function (item) {
                    return item.CurrencyId == $scope.defaultCurrency.CurrencyId;
                })
                //Leader
                $scope.groupLeader = angular.copy(data.groupLeader);
                $scope.GeneralInfo = data.GeneralInfo;
                if (!_.isNull($scope.groupLeader)) {
                    if (_.isNull($scope.groupLeader.Birthday)) {
                        $scope.groupLeader.Birthday = "";
                    }
                }
                //PaymentType
                $scope.paymentType = [{
                    PaymentTypeId: 1,
                    PaymentTypeName: "NEW_PAYMENT"
                }, {
                    PaymentTypeId: 2,
                    PaymentTypeName: "REFUND"
                }];
                //Market , source , company , country
                $scope.marketList = data.Markets;
                $scope.sourceList = data.Source;
                $scope.companyList = data.Companys;
                $scope.countries = data.Countries;
                $scope.MarketingInformation = data.MarketingInformation;

                $scope.reservationCodeView = data.GeneralInfo.Reservations.ReservationCode;
                $scope.reservationCode = angular.copy(data.GeneralInfo.Reservations.ReservationCode);
                $scope.reservationId = data.GeneralInfo.Reservations.ReservationId;
                $scope.reservationNote = angular.copy(data.GeneralInfo.Reservations.Note);

                $scope.reservation_oldNumber = angular.copy($scope.GeneralInfo.Reservations.ReservationNumber);
                $scope.groupPaymentsTmp = angular.copy($scope.groupData.GroupPayments);
                $scope.paymentsListTemp = [];
                if (!_.isEmpty($scope.groupPaymentsTmp)) {
                    angular.forEach($scope.groupPaymentsTmp, function (value, key) {
                        var decimal = _.filter($scope.currenciesISO, function (item) {
                            return item.CurrencyId == value.PaymentDetail.Money.CurrencyId;
                        })[0].MinorUnit;
                        var temp = {
                            PaymentDetail: {
                                PaymentId: value.PaymentDetail.PaymentId,
                                RefPaymentId: value.PaymentDetail.RefPaymentId,
                                PaymentTypeName: value.PaymentDetail.PaymentTypeName,
                                PaymentDescription: value.PaymentDetail.PaymentDescription,
                                CreatedDate: value.PaymentDetail.CreatedDate,
                                Amount: value.PaymentDetail.Amount,
                                AmountInSpecificMoney: value.PaymentDetail.AmountInSpecificMoney,
                                Money: value.PaymentDetail.Money,
                                MinorUnitInSpecificMoney: decimal,
                                ReservationRoomId: value.PaymentDetail.ReservationRoomId,
                                PaymentMethodId: value.PaymentDetail.PaymentMethodId,
                                PaymentNumber: value.PaymentDetail.PaymentNumber
                            },
                            RoomName: _.isNull(value.RoomName) == true ? 'N/A' : value.RoomName,
                            RoomTypeCode: _.isNull(value.RoomTypeCode) == true ? 'N/A' : value.RoomTypeCode,
                            Email: value.Email,
                            CustomerName: value.CustomerName,
                            DeletedUserName: value.DeletedUserName,
                            CanDelete: value.CanDelete
                        }
                        var exist = _.find($scope.paymentsListTemp, function (pay) {
                            return pay['PaymentDetail']['PaymentId'] === temp.PaymentDetail.RefPaymentId;
                        });
                        if (!_.isUndefined(exist)) {
                            var index = _.indexOf($scope.paymentsListTemp, exist);
                            if (temp.PaymentDetail.PaymentTypeName === 'DELETED')
                                $scope.paymentsListTemp[index] = temp;
                            else $scope.paymentsListTemp.push(temp);
                        } else {
                            $scope.paymentsListTemp.push(temp);
                        }
                    });
                    $scope.paymentsListTemp = _($scope.paymentsListTemp).sortBy('PaymentDetail.PaymentNumber');
                }
                angular.forEach($scope.groupData.RoomInformation, function (value, key) {
                    var status = value.BookingStatus;
                    switch (status) {
                        case 'BOOKED':
                            if (_.isUndefined(value.Rooms.RoomId)) {
                                value.color = '#1E88E5';
                                value.icon = 'ic_event_busy_24px.svg';
                            } else {
                                value.color = '#51DFCB';
                                value.icon = 'ic_event_available_24px.svg';
                            }
                            break;
                        case 'CHECKIN':
                            value.color = '#EC1C24';
                            value.icon = 'ic_local_hotel_24px.svg';
                            break;
                        case 'CHECKOUT':
                            value.color = '#D380D8';
                            //val.icon = 'ic_check_circle_24px.svg';
                            break;
                        case 'CANCELLED':
                            value.color = '#8A9BA4';
                            //val.icon = 'ic_cancel_24px.svg';
                            break;
                    }
                });
                EmailMarketingFactory.getLogsEmail($stateParams.reservationId, function (data) {
                    $scope.LogsEmail = data;
                    $scope.showEmail = true;
                }, function () {
                    $scope.showEmail = false;
                });
                if (!_.isNull($scope.groupLeader)) {
                    if (!_.isUndefined($scope.groupLeader && $scope.groupLeader.Birthday) && $scope.groupLeader.Birthday != "") {
                        $scope.dateString = new Date($scope.groupLeader.Birthday).format('dd/mm/yyyy');
                    }
                }
                if ($scope.MarketingInformation && !_.isUndefined($scope.MarketingInformation.Company)) {
                    $scope.selectedCompany = $scope.MarketingInformation.Company;
                }
                if ($scope.MarketingInformation && !_.isUndefined($scope.MarketingInformation.Market)) {
                    $scope.selectedMarket = $scope.MarketingInformation.Market;
                }
                if ($scope.MarketingInformation && !_.isUndefined($scope.MarketingInformation.Source)) {
                    $scope.selectedSource = $scope.MarketingInformation.Source;
                }
                $scope.payment.Amount = $scope.groupData.groupSummary.Balance;
                // console.log("TEST", $scope.payment.Amount, $scope.decimal, $rootScope.decimals);
                var Invoice = data.RoomInvoice.HotelFormRoomInvoice;
                var Receipt = data.RoomInvoice.HotelFormRoomReceipt;
                $scope.hotelFormRoomReceipt = Receipt.FormType + Receipt.Value + '.trdx';

                $scope.hotelFormGroupInvoiceSimple = "GroupInvoice" + "Simple" + Invoice.Value + '.trdx';
                $scope.hotelFormGroupInvoiceDetail = "GroupInvoice" + "Detail" + Invoice.Value + '.trdx';
                $scope.hotelFormGroupReceipt = "GroupReceipt" + Receipt.Value + '.trdx';
                $scope.hotelFormRoomInvoice = Invoice.FormType + Invoice.Value + '.trdx';
                $scope.groupDataRooms = [];
                $scope.groupDataRoomsForPayment = [];
                var groupDataRoomsTmp = angular.copy($scope.groupData.RoomInformation);
                angular.forEach(groupDataRoomsTmp, function (value, key) {
                    if (value.BookingStatus != "CANCELLED") {
                        $scope.groupDataRooms.push(value);
                        $scope.groupDataRoomsForPayment.push(value);
                    }
                })
                if ($scope.isResult) {
                    if ($scope.isResult.reservationsFinal) {
                        for (var i in $scope.isResult.reservationsFinal.ReservationRoomIdList) {
                            var temp = $scope.isResult.reservationsFinal.ReservationRoomIdList;
                            var obj = $scope.groupDataRooms[temp[i].OldIndex];
                            if (!_.isNull(obj)) {
                                var errorMsg = temp[i].StatusCode;
                                if (errorMsg == 'SUCCESS') {
                                    continue;
                                } else {
                                    switch (errorMsg) {
                                        case 'ASSIGN':
                                            obj.StatusCode = 'ASSIGNED';
                                            break;
                                        case 'BOOKED':
                                            obj.StatusCode = 'NOT_ASSIGNED';
                                            break;
                                        case 'CHECKIN':
                                            obj.StatusCode = 'CHECKED_IN';
                                            break;
                                        case 'CHECKOUT':
                                            obj.StatusCode = 'CHECKED_OUT';
                                            break;
                                        case 'CANCELLED':
                                            obj.StatusCode = 'CANCELLED';
                                            break;
                                        case 'NOTCHECKIN':
                                            obj.StatusCode = 'NOT_CHECKED_IN';
                                            break;
                                        case 'NOTPAYMENTALL':
                                            obj.StatusCode = "NOT_PAYMENT_ALL";
                                            break;
                                        case 'GROUP_ISMASTER':
                                            obj.StatusCode = "GROUP_ISMASTER";
                                            break;
                                        case 'EXISTS_DEPOSIT':
                                            obj.StatusCode = "EXISTS_DEPOSIT";
                                            break;
                                        case 'INVALID_TIME':
                                            obj.StatusCode = "INVALID_TIME";
                                            break;
                                        case 'ERROR:INVALID_DEPARTURE_DATE_DUE_TO_PAST_CHECK_OUT':
                                            obj.StatusCode = "ERROR:INVALID_DEPARTURE_DATE_DUE_TO_PAST_CHECK_OUT";
                                            break;
                                        case 'CONFLICT':
                                            obj.StatusCode = "CONFLICT_ROOM";
                                            if (!obj.ConflictRoomId) obj.ConflictRoomId = temp[i].ConflictRoomId;
                                            break;
                                        case 'REPAIR':
                                            obj.StatusCode = "REPAIR_ROOM";
                                            break;
                                    }
                                }
                            }
                        }
                    };
                };
                $scope.menuItems = [{
                    name: "ALL",
                    quantity: countByStatus(""),
                    color: '#fff',
                    icon: "ic_info_24px.svg"
                }, {
                    name: "BOOKED",
                    quantity: countByStatus("BOOKED"),
                    color: '#1E88E5',
                    icon: "ic_event_busy_24px.svg"
                }, {
                    name: "ASSIGN",
                    quantity: countByStatus("ASSIGN"),
                    color: '#51DFCB',
                    icon: "ic_event_available_24px.svg"
                }, {
                    name: "CHECKIN",
                    quantity: countByStatus("CHECKIN"),
                    color: '#EC1C24',
                    icon: "ic_local_hotel_24px.svg"
                }, {
                    name: "CHECKOUT",
                    quantity: countByStatus("CHECKOUT"),
                    color: '#D380D8',
                    icon: "ic_check_circle_24px.svg"
                }, {
                    name: "CANCELLED",
                    quantity: countByStatus("CANCELLED"),
                    color: '#8A9BA4',
                    icon: "ic_cancel_24px.svg"
                }];
            });
            $scope.LogsEmail = [];
            $scope.isResult = null;
            if ($rootScope.groupReservationShowResult != null) {
                showGroupConfliction($rootScope.groupReservationShowResult);
            }
            $rootScope.groupReservationShowResult = null;
            if ($rootScope.ReInitFromOtherFunction != null) {
                switch ($rootScope.ReInitFromOtherFunction.action) {
                    case "CANCEL_GROUP":
                        cancelGroupFunction($rootScope.ReInitFromOtherFunction.reservationRoomIdList);
                        break;
                    case "REMOVE_RR":
                        removeRRFromGroup($rootScope.ReInitFromOtherFunction.reservationRoomIdList);
                        break;
                }
            }
            $rootScope.ReInitFromOtherFunction = null;
            $scope.isChangeGroupInformation = false;
            $scope.isChangeGroupLeader = false;
            $scope.isSubmitDeletePayment = false;
        }

        $scope.goToConflict = function (reservationRoomId) {
            if (reservationRoomId != null && reservationRoomId != undefined) {
                $location.path('reservation/' + reservationRoomId);
            }
        };
        $scope.viewDetail = function (event, room) {
            event.stopPropagation();
            $state.go("reservation", {
                reservationRoomId: room.ReservationRoomId
            });
        };
        $scope.showBalanceDetail = function ($mdOpenMenu, ev) {
            $mdOpenMenu(ev);
        };
        $scope.showGroupInvoice = function ($mdOpenMenu, ev) {
            $mdOpenMenu(ev);
        };
        $scope.processRoomMove = function (event, room) {
            var selectedRoom = angular.copy(room);
            if (!selectedRoom.roomType) {
                selectedRoom.roomType = selectedRoom.RoomTypes;
            }
            if (!selectedRoom.reservationRoom) {
                selectedRoom.reservationRoom = selectedRoom;
            }
            if (!selectedRoom.RoomId) {
                selectedRoom.RoomId = selectedRoom.Rooms.RoomId;
            }
            if (!selectedRoom.RoomPriceName) {
                selectedRoom.RoomPriceName = selectedRoom.RoomPrices.RoomPriceName;
            }
            if (!selectedRoom.Reservations) {
                selectedRoom.Reservations = angular.copy($scope.GeneralInfo.Reservations);
            }
            SharedFeaturesFactory.processRoomMove(selectedRoom, null);
        };
        $scope.showInvoice = function (room) {
            var keys = ["ROOM_MONTHLY", "ROOM_WEEKLY", "ROOM_FULL_DAY", "ROOM_DAY_NIGHT", "ROOM_HOURLY", "MINIBAR", "LAUNDRY", "EXTRA_ROOM_CHARGE", "COMPENSATION", "EXTRA_SERVICES", "FULL_DAY_EARLY_CHECKIN", "FULL_DAY_LATE_CHECKOUT", "DAY_NIGHT_EARLY_CHECKIN", "DAY_NIGHT_LATE_CHECKOUT", "EXTRA_ADULTS", "EXTRA_CHILDREN", "PAYMENT", "DISCOUNT_MONEY_OFF", "DISCOUNT_PERCENT_OFF", "FREE"];
            var languageKeys = {};
            for (var idx in keys) {
                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
            }

            var CreateRoomInvoice = {
                roomId: room.Rooms.RoomId,
                reservationRoomId: room.ReservationRoomId,
                arrivalDate: room.ArrivalDate,
                departureDate: new Date(),
                adults: room.Adults,
                children: room.Child,
                languageKeys: languageKeys,
                RoomPriceId: room.RoomPrices.RoomPriceId,
                Price: room.Price
            }
            var modelRoomInvoiceFullDay = {
                roomId: room.Rooms.RoomId,
                reservationRoomId: room.ReservationRoomId,
                arrivalDate: room.ArrivalDate,
                departureDate: room.DepartureDate,
                adults: room.Adults,
                children: room.Child,
                languageKeys: languageKeys,
                RoomPriceId: room.RoomPrices.RoomPriceId,
                Price: room.Price
            }
            if (room.PastCheckOut) {
                CreateRoomInvoice.departureDate = room.DepartureDate;
            }
            var CreateRoomInvoiceResult = loginFactory.securedPostJSON("api/Room/CreateRoomInvoice", CreateRoomInvoice);
            $rootScope.dataLoadingPromise = CreateRoomInvoiceResult;
            CreateRoomInvoiceResult.success(function (data) {
                $mdDialog.show({
                        controller: ['$scope', '$mdDialog', 'loginFactory', 'reservationRoomId', 'hotelFormRoomInvoice', 'modelRoomInvoiceFullDay', '$rootScope', InvoiceController],
                        locals: {
                            reservationRoomId: room.ReservationRoomId,
                            hotelFormRoomInvoice: $scope.hotelFormRoomInvoice,
                            modelRoomInvoiceFullDay: modelRoomInvoiceFullDay
                        },
                        templateUrl: 'views/templates/invoice.tmpl.html',
                        parent: angular.element(document.body),
                        // targetEvent: ev,
                        clickOutsideToClose: false
                    })
                    .then(function (answer) {}, function () {

                    });
            }).error(function (err) {
                console.log(err);
            });
        };

        function InvoiceController($scope, $mdDialog, loginFactory, reservationRoomId, hotelFormRoomInvoice, modelRoomInvoiceFullDay, $rootScope) {
            $scope.hideFullDay = false;
            $scope.isFullDay = true;
            var modelRoomInvoiceFullDayTemp = angular.copy(modelRoomInvoiceFullDay);
            globalInvoiceId = reservationRoomId;
            HotelFormRoomInvoice = hotelFormRoomInvoice;
            console.log('globalInvoiceId', globalInvoiceId, HotelFormRoomInvoice);
            _reservationId = 0;
            $scope.showInvoiceFullDay = function (isFullDay) {
                if (isFullDay == false) {
                    var CreateRoomInvoice = loginFactory.securedPostJSON("api/Room/CreateRoomInvoice", modelRoomInvoiceFullDay);
                    $rootScope.dataLoadingPromise = CreateRoomInvoice;
                    CreateRoomInvoice.success(function (data) {
                        showReport();
                    });
                } else {
                    modelRoomInvoiceFullDayTemp.departureDate = new Date();
                    var CreateRoomInvoice = loginFactory.securedPostJSON("api/Room/CreateRoomInvoice", modelRoomInvoiceFullDayTemp);
                    $rootScope.dataLoadingPromise = CreateRoomInvoice;
                    CreateRoomInvoice.success(function (data) {
                        showReport();
                    });
                }
            };

            $scope.showScreen = true;
            $scope.showExtendedScreen = function () {
                $scope.showScreen = false;
                var tab = $rootScope.ExtendedScreen;
                if (tab != null && tab.Document != null) {
                    tab.focus();
                    loginFactory.securedGet("api/Test/Message", "id=" + reservationRoomId + "&cmd=showInvoice" + "&hotelInvoice=" + hotelFormRoomInvoice);
                } else {
                    tab = window.open("#/extendedScreen", '_blank');
                    $rootScope.ExtendedScreen = tab;
                    setTimeout(function () {
                        loginFactory.securedGet("api/Test/Message", "id=" + reservationRoomId + "&cmd=showInvoice" + "&hotelInvoice=" + hotelFormRoomInvoice);
                    }, 8000)
                }
            };
            $scope.hideExtendedScreen = function () {
                $scope.showScreen = true;
                loginFactory.securedGet("api/Test/Message", "id=" + reservationRoomId + "&cmd=hideInvoice" + "&hotelInvoice=" + hotelFormRoomInvoice);
            };

            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
        };
        $scope.showInvoiceTotal = function (ev, InvoiceType) {
            var keys = ["ROOM_MONTHLY", "ROOM_WEEKLY", "ROOM_FULL_DAY", "ROOM_DAY_NIGHT", "ROOM_HOURLY", "MINIBAR", "LAUNDRY", "EXTRA_ROOM_CHARGE", "COMPENSATION", "EXTRA_SERVICES", "FULL_DAY_EARLY_CHECKIN", "FULL_DAY_LATE_CHECKOUT", "DAY_NIGHT_EARLY_CHECKIN", "DAY_NIGHT_LATE_CHECKOUT", "EXTRA_ADULTS", "EXTRA_CHILDREN", "PAYMENT", "DISCOUNT_MONEY_OFF", "DISCOUNT_PERCENT_OFF", "FREE"];
            var languageKeys = {};
            for (var idx in keys) {
                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
            }
            var hotelFormGroupInvoice;
            if (InvoiceType == 'SIMPLE') {
                hotelFormGroupInvoice = "GroupInvoiceSimpleA4.trdx"; // $scope.hotelFormGroupInvoiceSimple;
            } else {
                hotelFormGroupInvoice = "GroupInvoiceDetailA4.trdx"; //$scope.hotelFormGroupInvoiceDetail;
            }
            var CreateGroupInvoiceModel = {
                ReservationId: $stateParams.reservationId,
                languageKeys: languageKeys

            }
            var CreateGroupInvoice = loginFactory.securedPostJSON("api/GroupReservation/CreateGroupInvoice", CreateGroupInvoiceModel);
            $rootScope.dataLoadingPromise = CreateGroupInvoice;
            CreateGroupInvoice.success(function (data) {
                $mdDialog.show({
                        controller: InvoiceControllerTotal,
                        locals: {
                            reservationId: $stateParams.reservationId,
                            hotelFormGroupInvoice: hotelFormGroupInvoice
                        },
                        templateUrl: 'views/templates/invoice.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose: false
                    })
                    .then(function (answer) {}, function () {

                    });
            }).error(function (err) {
                console.log(err);
            });

            function InvoiceControllerTotal($scope, $mdDialog, reservationId, hotelFormGroupInvoice) {
                $scope.showScreen = true;
                $scope.hideFullDay = true;
                //showInvoice(reservationRoomId);
                globalInvoiceId = 0;
                _reservationId = reservationId;
                HotelFormRoomInvoice = hotelFormGroupInvoice;
                //
                $scope.showExtendedScreen = function () {
                    $scope.showScreen = false;
                    var tab = $rootScope.ExtendedScreen;
                    if (tab != null && tab.Document != null) {
                        tab.focus();
                        loginFactory.securedGet("api/Test/Message", "id=" + reservationId + "&cmd=showGroupInvoice" + "&hotelInvoice=" + hotelFormGroupInvoice);
                    } else {
                        tab = window.open("#/extendedScreen", '_blank');
                        $rootScope.ExtendedScreen = tab;
                        setTimeout(function () {
                            loginFactory.securedGet("api/Test/Message", "id=" + reservationId + "&cmd=showGroupInvoice" + "&hotelInvoice=" + hotelFormGroupInvoice);
                        }, 7000)
                    }
                };
                $scope.hideExtendedScreen = function () {
                    $scope.showScreen = true;
                    loginFactory.securedGet("api/Test/Message", "id=" + reservationId + "&cmd=hideGroupInvoice" + "&hotelInvoice=" + hotelFormGroupInvoice);
                };
                $scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
            }
        };
        $scope.checkInform = function (payment) {
            var total = payment.GroupPaymentDetail.reduce(function (sum, value) {
                var total = 0;
                if (typeof (value.DeletedDate) == "undefined") {
                    total = value.Amount;
                } else {}
                return sum + total;
            }, 0);
            if (total == payment.Amount) {
                return false;
            } else {
                return true;
            }
        };
        $scope.checkIsDeleted = function (payment) {
            var total = payment.GroupPaymentDetail.reduce(function (sum, value) {
                var total = 0;
                if (typeof (value.DeletedDate) == "undefined") {
                    total = value.Amount;
                } else {}
                return sum + total;
            }, 0);
            return (total == 0);
        };

        //Email marketing
        $scope.openMenuLogsEmail = function ($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        };
        $scope.TasksEmail = {};
        $scope.emails = {};
        $scope.copyTeamplate = function (ev) {
            if ($scope.groupData.groupLeader.Email == null) {
                dialogService.toastWarn("MAIN_CUSTOMER_REQUIRED_EMAIL");
            } else {
                $mdDialog.show({
                        controller: CopyTemplateController,
                        templateUrl: 'views/templates/ChooseEmailSend.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        resolve: {
                            TasksEmail: function () {
                                return $scope.TasksEmail
                            },
                            Groups: function () {
                                return $scope.groupData
                            },
                            emails: function () {
                                return $scope.emails
                            },
                            local: function () {
                                return $scope
                            }
                        },
                        clickOutsideToClose: true
                        // fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                    })
                    .then(function (answer) {
                        $scope.TasksEmail = answer.TasksEmail;
                        $scope.emails = answer.emails;
                        // $scope.status = 'You said the information was "' + answer + '".';
                    }, function () {
                        // $scope.status = 'You cancelled the dialog.';
                    });
            }
        };
        $scope.getLogsEmail = function () {
            EmailMarketingFactory.getLogsEmail($stateParams.reservationId, function (data) {
                $scope.LogsEmail = data;
                $scope.showEmail = true;
            }, function () {
                $scope.showEmail = false;
            });
        };
        $scope.openDetailLogEmail = function (log) {
            EmailMarketingFactory.doDetailLogsByTask({
                'Room': $scope.groupData.GeneralInfo.Reservations.ReservationNumber,
                'Email': log.Email,
                'Task': log.HotelEmailTask.HotelEmailTaskId,
                'Date': null
            });
        };

        function CopyTemplateController($scope, $mdDialog, TasksEmail, Groups, emails, local) {
            var Room = Groups.RoomInformation.find(function (val) {
                return (val.IsGroupMaster);
            });
            $scope.TasksEmail = TasksEmail;
            $scope.emails = emails;
            $scope.SendEmail = {
                HotelEmailTaskId: 0,
                ReservationRoomId: Room.ReservationRoomId,
                ReservationRoomId: Room.ReservationRoomId
            };
            $scope.Room = Room;

            $scope.ReservationRooms = Groups.RoomInformation;
            var tmpTr = [];
            Groups.groupLeader.Travellers = Groups.groupLeader;
            tmpTr.push(Groups.groupLeader);
            $scope.Travellers = tmpTr;
            $scope.init = function () {

                if (!$scope.TasksEmail.hasOwnProperty(0)) {
                    $scope.getAllTemplate();
                } else {
                    $scope.SendEmail.HotelEmailTaskId = $scope.TasksEmail[0].HotelEmailTaskId;
                    $scope.chooceItem($scope.TasksEmail[0].HotelEmailTaskId);
                }

                if (!$scope.emails.hasOwnProperty(0)) {
                    $scope.getAllConfigEmail();
                } else {
                    // $scope.chooceItem(0);
                }

                $scope.SendEmail.TravellerId = Groups.groupLeader.TravellerId;
                $scope.initHotKey();
            }
            $scope.initHotKey = function () {
                jQuery(document).unbind('keydown');
                jQuery(document).on('keydown', function (e) {

                    // Click SEND EMAIL
                    EVENT.run(e, "S", function () {
                        jQuery('#send_email').click();
                    });

                    // Click CANCEL SEND
                    EVENT.run(e, "C", function () {
                        jQuery('#btn_cancel_send').click();
                    });


                })
            }
            $scope.ConditionPolicyOption = {
                language: ($rootScope.language == "vn") ? "vi" : $rootScope.language,
                toolbarCanCollapse: false,
                allowedContent: true,
                entities: true,
                height: 400,
                autoParagraph: false,
                autoGrow_onStartup: true,
                FullPage: false,
                ProtectedTags: 'html|head|body',
                resize_enabled: false
            };
            $scope.ShowBody = "";
            $scope.getAllTemplate = function () {
                var AllEmail = loginFactory.securedGet("api/EmailMarketing/GetAllTemplateEmail");
                $rootScope.dataLoadingPromise = AllEmail;
                AllEmail.success(function (data) {
                    $scope.TasksEmail = data.listConfigEmail;
                    $scope.chooceItem($scope.TasksEmail[0].HotelEmailTaskId);
                    $scope.SendEmail.HotelEmailTaskId = $scope.TasksEmail[0].HotelEmailTaskId;
                }).error(function (err) {
                    console.log(err);
                });
            }
            $scope.getAllConfigEmail = function () {
                var getAllConfigEmail = loginFactory.securedGet('api/EmailMarketing/GetAllConfigEmail', '')
                getAllConfigEmail.success(function (data) {
                    $scope.emails = data.listConfigEmail;
                }).error(function (err) {
                    dialogService.toastWarn("ERROR");
                });
            }
            $scope.doSendEmail = function (model) {
                var getAvailableRoomsPromise = loginFactory.securedPostJSON("api/EmailMarketing/CreateTemplateEmailManual", model);
                $rootScope.dataLoadingPromise = getAvailableRoomsPromise;
                getAvailableRoomsPromise.success(function (data) {
                    // console.log(data);
                    dialogService.toast("SEND_EMAIL_SUCCESSFUL");
                    local.getLogsEmail();
                    $scope.cancel();
                }).error(function (err) {
                    // console.log(err);
                    dialogService.toastWarn("ERROR");
                });
            }
            $scope.cancel = function () {
                jQuery(document).unbind('keydown');
                var result = {};
                result.emails = $scope.emails;
                result.TasksEmail = $scope.TasksEmail;
                $mdDialog.hide(result);
            }
            $scope.answer = function (answer) {
                jQuery(document).unbind('keydown');
                $mdDialog.hide(answer);
            };
            $scope.selectId = 0;
            $scope.chooceItem = function (HotelEmailTaskId) {
                var HotelEmailTask = $scope.TasksEmail.find(function (item) {
                    return item.HotelEmailTaskId == HotelEmailTaskId;
                }, HotelEmailTaskId);

                if (HotelEmailTask != null) {
                    $scope.SendEmail.Body = HotelEmailTask.Body;
                    $scope.SendEmail.HotelEmailConfigId = HotelEmailTask.HotelEmailConfigId;
                    // $scope.SendEmail.HotelEmailTaskId = HotelEmailTask.HotelEmailTaskId;
                } else {
                    $scope.SendEmail.HotelEmailConfigId = 0;
                    $scope.SendEmail.Body = "";
                }
            }
            $scope.chooceReservation = function (ReservationRoomId) {
                var reservation = $scope.ReservationRooms.find(function (val) {
                    return val.ReservationRoomId == ReservationRoomId;
                }, ReservationRoomId);
                var tmpTr = [];
                reservation.TravellerId = reservation.Travellers.TravellerId;
                tmpTr.push(reservation);
                $scope.Travellers = tmpTr;
                console.log(reservation, tmpTr, $scope.SendEmail.TravellerId);
                $scope.SendEmail.TravellerId = reservation.Travellers.TravellerId;

            }
            $scope.trustAsHtml = function (string) {
                return $sce.trustAsHtml(string);
            };
            $scope.init();
        }

        //Step 1: Edit group information

        $scope.editLeader = function () {
            $scope.isChangeGroupLeader = true;
        };
        $scope.saveEditLeader = function () {
            var value = angular.copy($scope.groupLeader);
            if (!value || value.Fullname == undefined || value.Fullname === "" || value.Fullname.trim() === "") {
                return;
            }
            $scope.isChangeGroupLeader = false;
            var listShareViewModel = [];
            var customer = {};

            customer.Address = value.Address;
            customer.Birthday = value.Birthday;
            customer.CountryId = value.CountryId;
            customer.Email = value.Email;
            customer.Fullname = value.Fullname;
            customer.Gender = value.Gender;
            customer.HotelId = value.HotelId;
            customer.IdentityNumber = value.IdentityNumber;
            customer.Mobile = value.Mobile;
            customer.Note = value.Note;
            customer.TravellerId = value.TravellerId;

            var SharerViewModel = {
                customer: customer,
                reservationRoomId: value.ReservationRoomId,
                travellerExtraInfo: null
            }
            listShareViewModel.push(SharerViewModel);
            if (!_.isEmpty(listShareViewModel)) {
                var save = loginFactory.securedPostJSON("api/Room/EditSharerListInfo", listShareViewModel);
                $rootScope.dataLoadingPromise = save;
                save.success(function (data2) {
                    dialogService.toast($filter('translate')('EDIT_TRAVELLER_SUCCESSFULLY'));
                    InitGroupReservationDetail();
                }).error(function (err) {
                    console.log(err);
                });
            }
        };
        $scope.editGroup = function () {
            $scope.isChangeGroupInformation = true;
        }
        $scope.saveEditGroup = function () {
            if (!$scope.reservationCode || $scope.reservationCode == '' || $scope.reservationCode == undefined) {
                dialogService.messageBox("ERROR", "RESERVATION_CODE_CANNOT_BE_BLANK");
                return;
            }
            if ($scope.reservationCode.length > 50) {
                dialogService.messageBox("ERROR", "RESERVATION_CODE_NOT_OVER_THAN_50");
                return;
            }
            $scope.isChangeGroupInformation = false;
            console.log("BUSINESS", $scope.selectedCompany, $scope.selectedSource, $scope.selectedMarket);
            if (_.isUndefined($scope.selectedCompany)) {
                $scope.selectedCompany = null;
            }

            var model = {
                ReservationId: $stateParams.reservationId ? $stateParams.reservationId : 0,
                NewNote: $scope.reservationNote,
                NewReservationCode: $scope.reservationCode,
                Company: $scope.selectedCompany,
                Source: $scope.selectedSource,
                Market: $scope.selectedMarket
            }

            var editGroup = loginFactory.securedPostJSON("api/GroupReservation/EditGroupVer2", model);
            $rootScope.dataLoadingPromise = editGroup;
            editGroup.success(function (data) {
                dialogService.toast("EDIT_NOTE_SUCCESSFUL");
                InitGroupReservationDetail();
            }).error(function (err) {
                console.log(err);
            });
        };
        $scope.$watch("GeneralInfo.Reservations.Color", function handleFooChange(newValue, oldValue) {
            if (newValue && oldValue && (newValue != oldValue)) {
                //console.log("change color", newValue, oldValue);
                //var confirm = dialogService.confirm("CONFIRM", "CHANGE_COLOR_CONFIRM");
                //confirm.then(function () {
                var model = {
                    ReservationId: $stateParams.reservationId ? $stateParams.reservationId : 0,
                    NewColor: newValue
                }
                groupReservationFactory.ProcessChangeColor(model, function (data) {
                    dialogService.toast("EDIT_COLOR_SUCCESSFUL");
                    $scope.GeneralInfo.Reservations.Color = newValue;
                });
                //});
            }
        });
        $scope.step2 = function () {
            if ($scope.isChangeGroupLeader == true) {
                $scope.groupLeader = angular.copy($scope.groupData.groupLeader);
                $scope.isChangeGroupLeader = false;
            }
            if ($scope.isChangeGroupInformation == true) {
                $scope.reservationCode = angular.copy($scope.reservationCodeView);
                $scope.reservationNote = angular.copy($scope.groupData.GeneralInfo.Reservations.Note);
                $scope.isChangeGroupInformation = false;
            }
        };
        $scope.editBusiness = function (item) {
            if (item !== null) {
                console.log("ITEM", item);
                //Edit Company
                if (item.CompanyCode) {
                    var companyTemp = angular.copy(item);
                    $mdDialog.show({
                        controller: EditCompanyDialogController,
                        resolve: {
                            company: function () {
                                return companyTemp;
                            },
                            sourceList: function () {
                                return $scope.sourceList;
                            }
                        },
                        templateUrl: 'views/templates/editCompany.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: null,
                    }).then(function (company) {
                        if (company !== null) {

                            var editCompany = loginFactory.securedPostJSON("api/Business/EditCompany", company);
                            $rootScope.dataLoadingPromise = editCompany;
                            editCompany.success(function (data) {
                                dialogService.toast("EDIT_COMPANY_SUCCESSFUL");
                                InitGroupReservationDetail();
                            }).error(function (err) {
                                dialogService.messageBox("ERROR", err.Message);
                            })
                        }
                    }, function () {});

                    function EditCompanyDialogController($scope, $mdDialog, company, sourceList) {
                        $scope.company = company;
                        $scope.sourceList = sourceList;
                        $scope.hide = function () {
                            $mdDialog.hide();
                        };
                        $scope.cancel = function () {
                            $mdDialog.cancel();
                        };

                        $scope.editCompany = function () {
                            $mdDialog.hide($scope.company);
                        }
                    }
                }

                if (item.ShortCode) {
                    var sourceTemp = angular.copy(item);
                    $mdDialog.show({
                        controller: EditSourceDialogController,
                        resolve: {
                            source: function () {
                                return sourceTemp;
                            }
                        },
                        templateUrl: 'views/templates/editSource.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: null,
                    }).then(function (source) {
                        if (source !== null) {

                            var editSource = loginFactory.securedPostJSON("api/Business/EditSource", source);
                            $rootScope.dataLoadingPromise = editSource;
                            editSource.success(function (data) {
                                dialogService.toast("EDIT_SOURCE_SUCCESSFUL");
                                InitGroupReservationDetail();
                            }).error(function (err) {
                                dialogService.messageBox("ERROR", err.Message);
                            })
                        }
                    }, function () {});

                    function EditSourceDialogController($scope, $mdDialog, source) {
                        $scope.source = source;
                        $scope.hide = function () {
                            $mdDialog.hide();
                        };
                        $scope.cancel = function () {
                            $mdDialog.cancel();
                        };

                        $scope.editSource = function () {
                            $mdDialog.hide($scope.source);
                        }
                    }
                }

                if (item.MarketCode) {
                    var marketTemp = angular.copy(item);
                    $mdDialog.show({
                        controller: EditMarketDialogController,
                        resolve: {
                            market: function () {
                                return marketTemp;
                            }
                        },
                        templateUrl: 'views/templates/editMarket.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: null,
                    }).then(function (market) {
                        if (market !== null) {

                            var editMarket = loginFactory.securedPostJSON("api/Business/EditMarket", market);
                            $rootScope.dataLoadingPromise = editMarket;
                            editMarket.success(function (data) {
                                dialogService.toast("EDIT_MARKET_SUCCESSFUL");
                                InitGroupReservationDetail();
                            }).error(function (err) {
                                dialogService.messageBox("ERROR", err.Message);
                            })
                        }
                    }, function () {});

                    function EditMarketDialogController($scope, $mdDialog, market) {
                        $scope.market = market;
                        $scope.hide = function () {
                            $mdDialog.hide();
                        };
                        $scope.cancel = function () {
                            $mdDialog.cancel();
                        };

                        $scope.editMarket = function () {
                            $mdDialog.hide($scope.market);
                        }
                    }
                }
            }

        };
        $scope.addNewCompany = function () {
            $mdDialog.show({
                controller: AddNewCompanyDialogController,
                resolve: {
                    sourceList: function () {
                        return $scope.sourceList;
                    }
                },
                templateUrl: 'views/templates/addNewCompany.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: null,
            }).then(function (newCompany) {
                if (newCompany !== null) {
                    var ReservationCompany = {
                        Company: newCompany,
                        ReservationId: $stateParams.reservationId ? $stateParams.reservationId : 0
                    };
                    console.log("ReservationCompany", ReservationCompany);
                    var addNewCompany = loginFactory.securedPostJSON("api/GroupReservation/AddNewCompanyToReservation", ReservationCompany);
                    $rootScope.dataLoadingPromise = addNewCompany;
                    addNewCompany.success(function (data) {
                        dialogService.toast("ADD_NEW_COMPANY_SUCCESSFUL");
                        $scope.selectedCompany = data;
                    }).error(function (err) {
                        dialogService.messageBox("ERROR", err.Message);
                    });
                };
            }, function () {});

            function AddNewCompanyDialogController($scope, $mdDialog, sourceList) {
                $scope.newCompany = {};
                $scope.sourceList = sourceList;
                $scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };

                $scope.addNewCompany = function () {
                    console.log('Vao day', $scope.newCompany);
                    $mdDialog.hide($scope.newCompany);
                }
            }
        };
        $scope.addNewSource = function () {
            $mdDialog.show({
                controller: AddNewSourceDialogController,
                templateUrl: 'views/templates/addNewSource.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: null,
            }).then(function (newSource) {
                if (newSource != null) {
                    var ReservationSource = {
                        Source: newSource,
                        ReservationId: $stateParams.reservationId ? $stateParams.reservationId : 0
                    };
                    newSource.Priority = $scope.sourceList.length;
                    var addNewSource = loginFactory.securedPostJSON("api/GroupReservation/AddNewSourceToReservation", ReservationSource);
                    $rootScope.dataLoadingPromise = addNewSource;
                    addNewSource.success(function (data) {
                        dialogService.toast("ADD_NEW_SOURCE_SUCCESSFUL");
                        $scope.selectedSource = data;
                    }).error(function (err) {
                        dialogService.messageBox("ERROR", err.Message);
                    });
                }
            }, function () {});

            function AddNewSourceDialogController($scope, $mdDialog) {
                $scope.newSource = {};
                $scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };

                $scope.addNewSource = function () {
                    $mdDialog.hide($scope.newSource);
                }
            }
        };
        $scope.addNewMarket = function () {
            $mdDialog.show({
                controller: AddNewMarketDialogController,
                templateUrl: 'views/templates/addNewMarket.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: null,
            }).then(function (newMarket) {
                if (newMarket !== null) {
                    var ReservationMarket = {
                        Market: newMarket,
                        ReservationId: $stateParams.reservationId ? $stateParams.reservationId : 0
                    };
                    newMarket.Priority = $scope.marketList.length;
                    var addNewMarket = loginFactory.securedPostJSON("api/Room/AddNewMarketToReservation", ReservationMarket);
                    $rootScope.dataLoadingPromise = addNewMarket;
                    addNewMarket.success(function (data) {
                        dialogService.toast("ADD_NEW_MARKET_SUCCESSFUL");
                        $scope.selectedMarket = data;
                    }).error(function (err) {
                        dialogService.messageBox("ERROR", err.Message);
                    })

                }
            }, function () {});

            function AddNewMarketDialogController($scope, $mdDialog) {
                $scope.newMarket = {};
                $scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };

                $scope.addNewMarket = function () {
                    $mdDialog.hide($scope.newMarket);
                }
            }
        };

        function checkGroupLeaderRR() {
            var result = false;
            for (var index in $scope.selectedRoom) {
                if ($scope.selectedRoom[index].IsGroupMaster == true) {
                    result = true;
                    break;
                }
            }
            return result;
        }

        function checkNumberBooked(rooms) {
            var count = 0;
            for (var index in rooms) {
                if (rooms[index].BookingStatus != "CANCELLED" && rooms[index].BookingStatus != "CHECKOUT") {
                    count++;
                }
            }
            return count;
        }

        function removeRRFromGroup(reservationRoomIdList) {
            var GroupRemoveReservationRoomModel = {
                ReservationId: $stateParams.reservationId,
                ReservationRoomIdList: reservationRoomIdList
            };
            var processRemoveReservationRoomFromGroup = loginFactory.securedPostJSON("api/GroupReservation/ProcessRemoveReservationRoomFromGroup", GroupRemoveReservationRoomModel);
            $rootScope.dataLoadingPromise = processRemoveReservationRoomFromGroup;
            processRemoveReservationRoomFromGroup.success(function (data) {
                $rootScope.groupReservationShowResult = data;
                InitGroupReservationDetail();
                $scope.isResult = data;
            }).error(function (err) {
                console.log(err);
            });
        }

        //Step 2: Edit reservation rooms
        $scope.addTransaction = function () {
            $mdDialog.show({
                templateUrl: 'views/templates/addTransaction.tmpl.html',
                clickOutsideToClose: false,
                controller: ['$scope', '$mdDialog', '$filter', '$rootScope', 'loginFactory', 'dialogService', '$state', 'frontOfficeFactory', AddTransactionDialogController]
            }).then(function () {}, function () {});

            function AddTransactionDialogController($scope, $mdDialog, $filter, $rootScope, loginFactory, dialogService, $state, frontOfficeFactory) {
                function InitTransaction() {
                    $scope.warning = false;
                    $scope.minDate = new Date();
                    $scope.DatePickerOption = {
                        format: 'dd/MM/yyyy'
                    };
                    $scope.arrivalFromString = new Date().format('dd/mm/yyyy');
                    $scope.arrivalToString = addDays(new Date(), 1).format('dd/mm/yyyy');
                    $scope.resFromString = null;
                    $scope.resToString = null;
                    $scope.search = {
                        ReservationRoomId: null,
                        GuestName: null,
                        ArrivalIncluded: true,
                        ArrivalFrom: new Date(),
                        ArrivalTo: addDays(new Date(), 1),
                        ReservatonFrom: null,
                        ReservatonTo: null,
                        RoomTypeId: 0,
                        RoomId: 0,
                        Type: 0
                    };
                    $scope.bookingStatusMapping = {
                        BOOKED: "ic_event_available_24px.svg",
                        CHECKIN: "ic_local_hotel_24px.svg",
                        OVERDUE: "ic_restore_24px.svg",
                        AVAILABLE: "ic_check_circle_24px.svg",
                        CANCELLED: "ic_cancel_24px.svg",
                        NOSHOW: "ic_event_busy_24px.svg"
                    };
                    frontOfficeFactory.getSearchInformation(function (data) {
                        $scope.roomTypes = data.roomTypes;
                        for (var index in $scope.roomTypes) {
                            if ($scope.roomTypes[index] !== null && $scope.roomTypes[index].RoomTypeName === "STANDARD_ROOM") {
                                $scope.roomTypes[index].RoomTypeName = $filter("translate")($scope.roomTypes[index].RoomTypeName)
                            }
                        }

                        $scope.rooms = data.rooms;
                        console.log($scope.roomTypes);
                    });
                };
                InitTransaction();
                $scope.$watchCollection('search', function (newValues, oldValues) {
                    if (newValues.ArrivalFrom !== oldValues.ArrivalFrom && newValues.ArrivalFrom > oldValues.ArrivalTo) {
                        newValues.ArrivalTo = addDays(newValues.ArrivalFrom, 1);
                    }
                });

                function addDays(date, days) {
                    var result = new Date(date);
                    result.setDate(result.getDate() + days);
                    return result;
                }

                $scope.processSearch = function () {
                    if ($scope.search.ArrivalIncluded && $scope.search.ArrivalFrom && $scope.search.ArrivalTo && new Date($scope.search.ArrivalFrom.getFullYear(), $scope.search.ArrivalFrom.getMonth(), $scope.search.ArrivalFrom.getDate(), 0, 0, 0, 0) > $scope.search.ArrivalTo) {
                        $scope.warningCreateDateNull = false;
                        $scope.warningArrivalDate = true;
                        $scope.warning = true;
                        return;
                    }
                    if ($scope.search.ArrivalIncluded && $scope.search.ArrivalFrom === null && $scope.arrivalFromString !== '') {
                        $scope.warningCreateDateNull = false;
                        $scope.warningArrivalDate = true;
                        $scope.warning = true;
                        return;
                    }
                    if ($scope.search.ArrivalIncluded && $scope.search.ArrivalTo === null && $scope.arrivalToString !== '') {
                        $scope.warningCreateDateNull = false;
                        $scope.warningArrivalDate = true;
                        $scope.warning = true;
                        return;
                    }

                    if ($scope.search.ReservationFrom && $scope.search.ReservationTo && $scope.search.ReservationFrom > $scope.search.ReservationTo) {
                        $scope.warningCreateDateNull = true;
                        $scope.warningArrivalDate = false;
                        $scope.warning = true;
                        return;
                    }
                    if ($scope.search.ReservationFrom === undefined && $scope.resFromString !== null) {
                        $scope.warningCreateDateNull = true;
                        $scope.warningArrivalDate = false;
                        $scope.warning = true;
                        return;
                    }

                    if ($scope.search.ReservationTo === undefined && $scope.resToString !== null) {
                        $scope.warningCreateDateNull = true;
                        $scope.warningArrivalDate = false;
                        $scope.warning = true;
                        return;
                    }
                    groupReservationFactory.processSearchReservation($scope.search, function (data) {
                        $scope.warning = false;
                        $scope.warningCreateDateNull = false;
                        $scope.warningArrivalDate = false;
                        console.log("SEARCH RESULT", data);
                        $scope.searchResult = data;
                    });
                };
                $scope.addReservationToGroup = function (reservation) {
                    if (reservation == null) return;
                    var ListReservationId = [];
                    var newReservationId = $stateParams.reservationId ? $stateParams.reservationId : 0;
                    ListReservationId.push(reservation.ReservationId);
                    var model = {
                        NewReservationId: newReservationId,
                        ListReservationId: ListReservationId
                    };
                    $mdDialog.hide();
                    groupReservationFactory.processAddReservationToGroup(model, function (data) {
                        dialogService.toast("ADD_RESERVATION_TO_GROUP_SUCCESSFUL");
                        $state.go($state.current, {}, {
                            reload: true
                        });
                    });
                };
                $scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };

            };
        };

        $scope.addNewGuest = function () {
            var temp = {
                ReservationId: $stateParams.reservationId,
                From: 'groupReservationDetail'
            }
            walkInFactory.setReservationGroup(temp);
            $location.path("walkin");
        };

        $scope.groupCancel = function () {
            var reservationId = angular.copy($scope.reservationId);
            GroupCancel(reservationId);
        };

        function GroupCancel(reservationId) {
            $mdDialog.show({
                controller: CancelDialogController,
                templateUrl: 'views/templates/groupCancel.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: event,
            }).then(function (res) {
                var cancelReason = res.cancelReason
                if (cancelReason) {
                    var keys = ["NOTIFICATION_CANCELED_GROUP_CONTENT"];
                    var languageKeys = {};
                    for (var idx in keys) {
                        languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
                    }
                    var GroupCancelModel = {
                        ReservationId: reservationId,
                        CancelReason: cancelReason,
                        languageKeys: languageKeys,
                        SendEmail: res.SendEmail
                    };
                    groupReservationFactory.ProcessGroupCancel(GroupCancelModel, function (data) {
                        if (data == "SUCCESSFUL") {
                            dialogService.toast("GROUP_CANCEL_SUCCESSFUL");
                            $location.path("newGroup");
                        } else {
                            dialogService.messageBox("ERROR", data);
                        }
                    });
                }
            }, function () {

            });

            function CancelDialogController($scope, $mdDialog) {
                $scope.SendEmail = true;

                $scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
                $scope.processCancel = function () {
                    $mdDialog.hide({
                        cancelReason: $scope.cancelReason,
                        SendEmail: $scope.SendEmail
                    });
                };
            }

        };

        function countByStatus(value) {
            var rooms = angular.copy($scope.groupData.RoomInformation);
            if (!value) {
                if (rooms) {
                    var countCancelled = _.filter(rooms, function (item) {
                        return item.BookingStatus == "CANCELLED";
                    }).length;
                    return rooms.length - countCancelled;
                } else
                    return 0;
            }
            if (rooms) {
                if (value) {
                    var items = _.filter(rooms, function (item) {
                        if (value === "BOOKED")
                            return item.BookingStatus === value && item.Rooms.RoomId == null;
                        if (value === "ASSIGN")
                            return item.BookingStatus === "BOOKED" && item.Rooms.RoomId != null;
                        else if (value !== "BOOKED" && value !== "ASSIGN")
                            return item.BookingStatus === value;
                    });
                    return items.length;
                }
            } else return 0;
        };
        $scope.changeStatus = function (value) {
            $scope.valueSelected = value;
            var rooms = angular.copy($scope.groupData.RoomInformation);
            var items = [];
            if (value != 'ALL') {
                items = _.filter(rooms, function (item) {
                    if (value === "BOOKED")
                        return item.BookingStatus === value && item.Rooms.RoomId == null;
                    if (value === "ASSIGN")
                        return item.BookingStatus === "BOOKED" && item.Rooms.RoomId != null;
                    else if (value !== "BOOKED" && value !== "ASSIGN")
                        return item.BookingStatus === value;
                });
            } else {
                angular.forEach(rooms, function (value, key) {
                    if (value.BookingStatus !== 'CANCELLED') {
                        items.push(value);
                    }
                });
                $scope.valueSelected = '';
            }
            $scope.groupDataRooms = items;
            $scope.selectedRoom = [];
        };
        $scope.openEditTravellers = function (id) {
            var rooms = angular.copy($scope.groupData.RoomInformation);
            for (var index in rooms) {
                var shareListTemp = rooms[index].ShareList;
                var shareListDetailsTemp = rooms[index].ShareListDetails;
                for (var index2 in shareListTemp) {
                    var travellerId = shareListTemp[index2].TravellerId;
                    var travellerDetail = _.find(shareListDetailsTemp, function (value) {
                        return value.customer.TravellerId == travellerId;
                    });
                    if (travellerDetail != null && travellerDetail != undefined) {
                        if (!shareListTemp[index2].IsChild) {
                            shareListTemp[index2].IsChild = travellerDetail.travellerExtraInfo.IsChild;
                        }
                    }
                }
            }
            var roomsDefault = angular.copy(rooms);
            $mdDialog.show({
                controller: EditTravellersController,
                resolve: {
                    currentRooms: function () {
                        return rooms;
                    },
                    countries: function () {
                        return $scope.countries;
                    },
                    resId: function () {
                        return id;
                    },
                    isUsePassport: function () {
                        return $scope.isUsePassport;
                    }
                },
                templateUrl: 'views/templates/editTravellersGroup.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: null,
                clickOutsideToClose: false
            }).then(function (data) {
                var roomsBefore = roomsDefault;
                var roomsAfter = data;
                var listEditTraveller = [];
                var listShareViewModel = [];

                for (var i in roomsBefore) {
                    for (var j in roomsBefore[i].ShareList) {
                        // if (roomsBefore[i].ShareList[j].Birthday)
                        //     roomsBefore[i].ShareList[j].Birthday = new Date(roomsBefore[i].ShareList[j].Birthday);
                        if (!angular.equals(roomsBefore[i].ShareList[j], roomsAfter[i].ShareList[j])) {
                            if (!roomsAfter[i].ShareList[j].ReservationRoomId) roomsAfter[i].ShareList[j].ReservationRoomId = roomsAfter[i].ReservationRoomId;
                            if (roomsAfter[i].ShareList[j].IsDeleted) roomsAfter[i].ShareList[j].HotelId = -1; //Fake hotelid for delete
                            listEditTraveller.push(roomsAfter[i].ShareList[j]);
                        }
                    }
                }

                for (var i in roomsAfter) {
                    for (var j in roomsAfter[i].ShareList) {
                        if (roomsAfter[i].ShareList[j].TravellerId < 0) {
                            if (!roomsAfter[i].ShareList[j].ReservationRoomId) roomsAfter[i].ShareList[j].ReservationRoomId = roomsAfter[i].ReservationRoomId;
                            listEditTraveller.push(roomsAfter[i].ShareList[j]);
                        }
                    }
                }

                angular.forEach(listEditTraveller, function (value, key) {
                    var customer = {};
                    customer.Address = value.Address;
                    customer.Birthday = value.Birthday;
                    customer.CountryId = value.CountryId;
                    customer.Email = value.Email;
                    customer.Fullname = value.Fullname;
                    customer.Gender = value.Gender;
                    customer.HotelId = value.HotelId;
                    customer.IdentityNumber = value.IdentityNumber;
                    customer.Mobile = value.Mobile;
                    customer.Note = value.Note;
                    customer.TravellerId = value.TravellerId;

                    var travellerExtraInfoTemp = {
                        isChild: value.IsChild
                    };

                    var SharerViewModel = {
                        customer: customer,
                        reservationRoomId: value.ReservationRoomId,
                        travellerExtraInfo: travellerExtraInfoTemp
                    }
                    listShareViewModel.push(SharerViewModel);
                });

                if (!_.isEmpty(listShareViewModel)) {
                    var save = loginFactory.securedPostJSON("api/Room/EditSharerListInfo", listShareViewModel);
                    $rootScope.dataLoadingPromise = save;
                    save.success(function (data2) {
                        dialogService.toast($filter('translate')('EDIT_TRAVELLER_SUCCESSFULLY'));
                        InitGroupReservationDetail();
                    }).error(function (err) {
                        console.log(err);
                    });
                }
            });

            function EditTravellersController($scope, $mdDialog, currentRooms, countries, resId, isUsePassport) {
                function Init() {
                    var roomDefaultId = resId;
                    $scope.isUsePassport = isUsePassport;
                    $scope.rooms = currentRooms;

                    $scope.roomSelected = _.find($scope.rooms, function (room) {
                        return room['ReservationRoomId'] === roomDefaultId
                    });
                    $scope.travellers = $scope.roomSelected.ShareList;

                    for (var i in $scope.travellers) {
                        var a = {};
                        if ($scope.travellers[i].TravellerId === $scope.roomSelected.Travellers.TravellerId) {
                            if (i == 0) break;
                            else {
                                a = $scope.travellers[i];
                                $scope.travellers.splice(i, 1);
                                $scope.travellers.unshift(a);
                            }
                        }
                    }

                    $scope.travellerSelected = $scope.travellers[0];

                    $scope.isActiveRoom = $scope.roomSelected.ReservationRoomId;

                    //Countries + Format birthday
                    $scope.Countries = countries;
                    $scope.selectedCountries = null;
                    $scope.DatePickerOption = {
                        format: 'dd/MM/yyyy'
                    };
                    $scope.queryCountriesSearch = queryCountriesSearch;
                    $scope.selectedCountriesChange = selectedCountriesChange;
                    $scope.searchCountriesTextChange = searchCountriesTextChange;

                    //Fakeid for add new traveller
                    $scope.travellerIDFake = 0;

                    rebuildTravellers();
                }
                Init();

                function queryCountriesSearch(query) {
                    var results = query ? $scope.Countries.filter(createCountriesFilterFor(query)) : $scope.Countries,
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

                function createCountriesFilterFor(query) {
                    var lowercaseQuery = change_alias(query);
                    return function filterFn(item) {
                        return (change_alias(item.CountryName.toLowerCase()).indexOf(lowercaseQuery) >= 0 || change_alias(item.CountryCode.toLowerCase()).indexOf(lowercaseQuery) >= 0);
                    };
                }

                function selectedCountriesChange(item, traveller) {
                    if (!_.isUndefined(item)) {
                        $scope.travellerSelected.CountryId = item.CountryId;
                        if ($scope.travellerSelected.Countries) $scope.travellerSelected.Countries = item;
                    }
                }

                function searchCountriesTextChange(text) {
                    $scope.searchCountriesText = text;
                }

                function rebuildTravellers() {
                    $scope.isActiveTraveller = $scope.travellerSelected.TravellerId;
                    if (!_.isNull($scope.travellerSelected.Birthday)) {
                        $scope.travellerSelected.Birthday = new Date($scope.travellerSelected.Birthday);
                        $scope.dateString = $scope.travellerSelected.Birthday.format('dd/mm/yyyy');
                    }
                    if (!_.isNull($scope.travellerSelected.CountryId) && !_.isUndefined($scope.travellerSelected.CountryId)) {
                        if (!_.isNull($scope.Countries) && !_.isEmpty($scope.Countries)) {
                            $scope.travellerSelected.Countries = _.find($scope.Countries, function (item) {
                                return item['CountryId'] === $scope.travellerSelected.CountryId
                            });
                        }
                    }
                }
                $scope.selectRoom = function (resId) {
                    $scope.roomSelected = _.find($scope.rooms, function (room) {
                        return room['ReservationRoomId'] === resId
                    });
                    $scope.isActiveRoom = $scope.roomSelected.ReservationRoomId;
                    $scope.travellers = $scope.roomSelected.ShareList;

                    for (var i in $scope.travellers) {
                        var a = {};
                        if ($scope.travellers[i].TravellerId === $scope.roomSelected.Travellers.TravellerId) {
                            if (i == 0) break;
                            else {
                                a = $scope.travellers[i];
                                $scope.travellers.splice(i, 1);
                                $scope.travellers.unshift(a);
                            }
                        }
                    }

                    $scope.travellerSelected = $scope.travellers[0];
                    rebuildTravellers();
                }
                $scope.selectTraveller = function (travellerId) {
                    $scope.travellerSelected = _.find($scope.travellers, function (traveller) {
                        return traveller['TravellerId'] === travellerId
                    });
                    rebuildTravellers();
                }
                $scope.saveTraveller = function () {
                    $mdDialog.hide($scope.rooms);
                }
                $scope.addCustomer = function () {
                    $scope.travellerIDFake = $scope.travellerIDFake - 1;
                    var travellerId = $scope.travellerIDFake;
                    var newCustomer = {
                        TravellerId: travellerId,
                        Note: null,
                        Mobile: null,
                        IdentityNumber: null,
                        HotelId: null,
                        Gender: 0,
                        Fullname: 'Anonymus',
                        Email: null,
                        CountryId: null,
                        Birthday: null,
                        Address: null,
                        IsChild: false
                    };
                    $scope.roomSelected.ShareList.push(newCustomer);
                    $scope.travellerSelected = $scope.roomSelected.ShareList[$scope.roomSelected.ShareList.length - 1];
                    rebuildTravellers();
                }
                $scope.deleteCustomer = function (traveller) {
                    traveller.IsDeleted = true;
                    $scope.travellerSelected = $scope.travellers[0];
                    rebuildTravellers();
                }
                $scope.hide = function () {
                    $mdDialog.hide();
                }
                $scope.cancel = function () {
                    $mdDialog.cancel();
                }

                $scope.saveInfoPassport = function () {
                    $scope.travellerSelected.Fullname = FullnameCustomer;
                    $scope.travellerSelected.Gender = Gender === "M" ? 0 : 1;
                    $scope.travellerSelected.IdentityNumber = IdentityNumber;
                    if (Birthday) {
                        $scope.travellerSelected.Birthday = new Date(Birthday);
                        $scope.dateString = $scope.travellerSelected.Birthday.format('dd/mm/yyyy');
                    }

                    $scope.travellerSelected.ImageLocation = ImageLocation;
                    $scope.travellerSelected.ValidUntil = new Date(ValidUntil);

                    if ($scope.Countries !== null && $scope.travellerSelected !== null && $scope.Countries.length > 0)

                        $scope.selectedCountries = _.filter($scope.Countries, function (item) {
                            return item.CountryCode == CountryCode;
                        })[0];

                }
            }
        };
        $scope.processGroupAutoAssignRoom = function () {
            var dataRooms = getSelectedRoom('BOOKED')
            var reservationRoomIdList = dataRooms['ReservationRoomIdList'];
            if (!_.isEmpty(reservationRoomIdList)) {
                var count = dataRooms['CountSelected'];
                if (count > 0) {
                    var AutoAssignGroupRoomModel = {
                        ReservationId: $stateParams.reservationId,
                        ReservationRoomIdList: reservationRoomIdList
                    };
                    var processGroupAutoAssignRoom = loginFactory.securedPostJSON("api/GroupReservation/ProcessAutoAssignGroupRoom", AutoAssignGroupRoomModel);
                    $rootScope.dataLoadingPromise = processGroupAutoAssignRoom;
                    processGroupAutoAssignRoom.success(function (data) {
                        $rootScope.groupReservationShowResult = data;
                        InitGroupReservationDetail();
                        $scope.isResult = data;
                    }).error(function (err) {
                        console.log(err);
                    });
                } else {
                    dialogService.toastWarn($filter('translate')('SELECT_ASSIGN_ROOM'));
                }
            } else {
                dialogService.messageBox("MISSING_ROOM", "PLEASE_SELECT_AT_LEAST_ONE_ROOM");
                return;
            }
        };
        $scope.processAssignRoom = function (event, room) {
            event.stopPropagation();
            var reservationRoom = angular.copy(room);

            function assignRoom(reservationRoom, callback) {

                var reservationRoomTemp = angular.copy(reservationRoom);
                $mdDialog.show({
                    controller: AssignRoomDialogController,
                    resolve: {
                        reservationRoom: function () {
                            return reservationRoomTemp;
                        }
                    },
                    templateUrl: 'views/templates/assignRoom.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: null,
                }).then(function (newReservationRoom) {
                    var assignRoom = loginFactory.securedPostJSON("api/Room/ProcessAssignRoom", newReservationRoom);
                    $rootScope.dataLoadingPromise = assignRoom;
                    assignRoom.success(function (data) {
                        dialogService.toast("GROUP_ASSIGN_ROOM_SUCCESSFUL");
                        InitGroupReservationDetail();
                    }).error(function (err) {
                        dialogService.messageBox("ERROR", err.Message);
                    });
                }, function () {});

                function AssignRoomDialogController($scope, $mdDialog, reservationRoom) {
                    $scope.newReservationRoom = {};

                    function Init() {
                        $scope.decimal = $rootScope.decimals;
                        $scope.reservationRoom = reservationRoom;
                        $scope.newReservationRoom.ReservationRoomId = reservationRoom.ReservationRoomId;
                        $scope.newReservationRoom.RoomTypeId = reservationRoom.roomTypeInfo.RoomTypeId;
                        $scope.newReservationRoom.Price = $scope.reservationRoom.Price;
                        $scope.newReservationRoom.RoomPriceId = reservationRoom.RoomPriceId;
                        $scope.hasRRIDParam = ($stateParams.reservationRoomId) ? true : false;
                    }
                    Init();
                    $scope.$watchCollection('newReservationRoom.RoomTypeId', function (newValues, oldValues) {
                        $scope.reservationRoom.availableRoom = null;
                        var availableRoomModel = {
                            roomTypeId: $scope.newReservationRoom.RoomTypeId,
                            arrivalDate: $scope.reservationRoom.ArrivalDate,
                            departureDate: $scope.reservationRoom.DepartureDate
                        };
                        var getAvailableRoomsPromise = loginFactory.securedPostJSON("api/Reservation/AvailableRooms", availableRoomModel);
                        $rootScope.dataLoadingPromise = getAvailableRoomsPromise;
                        getAvailableRoomsPromise.success(function (data) {
                            $scope.reservationRoom.availableRoom = data;
                        }).error(function (err) {
                            console.log(err);
                        });
                        $scope.availablePlanList = _.filter($scope.reservationRoom.planList, function (item) {
                            return (item.IsActive && item.RoomTypeId.toString() === $scope.newReservationRoom.RoomTypeId.toString());
                        }).sort(function (a, b) {
                            return parseInt(a.Priority) - parseInt(b.Priority);
                        });
                    });
                    $scope.hide = function () {
                        $mdDialog.hide();
                    };
                    $scope.cancel = function () {
                        $mdDialog.cancel();
                    };
                    $scope.processAssignRoom = function () {
                        $mdDialog.hide($scope.newReservationRoom);
                    };
                }
            }

            roomListFactory.getRoomList(new Date(), function (data) {
                roomList = data;
                var availableRoom = [];
                availableRoom = reservationFactory.getAvailableRoom(roomList, reservationRoom.ArrivalDate, reservationRoom.DepartureDate, availableRoom);
                reservationRoom.availableRoom = availableRoom;
                reservationRoom.reservationNumber = $scope.groupData.GeneralInfo.Reservations.ReservationNumber;
                reservationRoom.roomInfo = room.Rooms;
                reservationRoom.planInfo = room.RoomPrices;
                reservationRoom.planList = $scope.groupData.GeneralInfo.PlanList;
                reservationRoom.customer = room.Travellers;
                reservationRoom.roomTypeInfo = room.RoomTypes;
                reservationRoom.roomTypes = $scope.groupData.GeneralInfo.RoomTypeList;
                reservationRoom.RoomTypeId = room.RoomTypes.RoomTypeId;
                assignRoom(reservationRoom, null);
            });

        };
        $scope.processGroupCheckIn = function () {
            var dataRooms = getSelectedRoom('ASSIGN')
            var reservationRoomIdList = dataRooms['ReservationRoomIdList'];

            if (!_.isEmpty(reservationRoomIdList)) {
                var count = dataRooms['CountSelected'];
                if (count > 0) {
                    var GroupCheckInModel = {
                        ReservationId: $stateParams.reservationId,
                        ReservationRoomIdList: reservationRoomIdList,

                    };
                    var processGroupCheckIn = loginFactory.securedPostJSON("api/GroupReservation/ProcessGroupCheckIn", GroupCheckInModel);
                    $rootScope.dataLoadingPromise = processGroupCheckIn;
                    processGroupCheckIn.success(function (data) {
                        $rootScope.groupReservationShowResult = data;
                        InitGroupReservationDetail();
                        $scope.isResult = data;
                    }).error(function (err) {
                        dialogService.toastWarn($filter('translate')('CONFLICT_RESERVATIONS'));
                    });
                } else {
                    dialogService.toastWarn($filter('translate')('SELECT_CHECKIN_ROOM'));
                }
            } else {
                dialogService.messageBox("MISSING_ROOM", "PLEASE_SELECT_AT_LEAST_ONE_ROOM");
                return;
            }
        };

        function processIsInputCardToCheckOut(callback) {
            console.log('Connectivities CheckOut', currentHotelConnectivities);
            if ($scope.currentHotelConnectivities && $scope.currentHotelConnectivities.isUsed) {
                //use card to checkout                               
                if ($rootScope.Connectivities != null && $rootScope.Connectivities.code.HotelConnectivityModuleName != "SMART_NEO_LOCK" && $scope.currentHotelConnectivities.IsInputCardToCheckout) {
                    dialogService.messageBox("PLEASE_BE_SURE_THE_VALID_CARD_IS_BEING_INSERTED").then(function (arr) {
                        var readCard = smartCardFactory.readCardOnly();
                        readCard.then(function (dataCard) {
                            console.info('read card only', dataCard);
                            if (dataCard == -1) {
                                dialogService.messageBox("INVALID_CARD");
                                callback(false);
                            } else if (dataCard && dataCard.TravellerId) {
                                console.log('Vao day');
                                if (dataCard.TravellerId == $scope.room.ReservationRoomId) {
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

        function reWriteCradNeoLock(listRoomInfo) {
            var _listRoomInfo = angular.copy(listRoomInfo);
            angular.forEach(_listRoomInfo, function (room) {
                if ($scope.currentHotelConnectivities && $scope.currentHotelConnectivities.isUsed && $rootScope.Connectivities != null && $rootScope.Connectivities.code.HotelConnectivityModuleName === "SMART_NEO_LOCK") {
                    var writeCardModel = {
                        RoomName: room.Rooms.RoomName,
                        RoomDescription: room.Rooms.RoomDescription,
                        TravellerName: room.Travellers.Fullname,
                        ArrivalDate: new Date(),
                        DepartureDate: room.DepartureDate,
                        OverrideOldCards: true
                    };

                    if ($scope.currentHotelConnectivities.IsAutomaticalAddHourCheckout == true) {
                        writeCardModel = smartCardFactory.addHourCheckOutCard(writeCardModel, $scope.currentHotelConnectivities.HourAddToCheckout);
                    };
                    var cardPromise = smartCardFactory.reWriteCardNeoLockGroup(writeCardModel, room.ReservationRoomId, null);
                    cardPromise.then(function (data) {
                        console.log("DATA PROMISE", data.Result);
                        if (data.passcode != null) {
                            // dialogService.toastSuccess($filter("translate")("CREATE_CARD_SUCCESSFUL") + " " + data.passcode);                           
                        } else {
                            // dialogService.messageBox(data.message);                           
                        }
                    });
                }
            })
        }

        $scope.processGroupCheckOut = function (e) {
            if ($scope.inProgressCheckOut) e.preventDefault();
            else $scope.inProgressCheckOut = true;
            var dataRooms = getSelectedRoom('CHECKIN')
            var reservationRoomIdList = dataRooms['ReservationRoomIdList'];

            var _groupDataRooms = angular.copy($scope.groupDataRooms);
            $scope.roomInfo = [];
            angular.forEach(reservationRoomIdList, function (item) {
                var temp = _.find(_groupDataRooms, function (it) {
                    return it.ReservationRoomId == item.ReservationRoomId;
                });
                $scope.roomInfo.push(temp);
            });

            if (!_.isEmpty(reservationRoomIdList)) {
                var roomsTmp = [];
                var count = dataRooms['CountSelected'];
                //If no room checkin has selected, return
                if (count == 0) {
                    dialogService.toastWarn($filter('translate')('SELECT_CHECKOUT_ROOM'));
                    $scope.inProgressCheckOut = false;
                    return;
                } else {
                    var rooms = angular.copy($scope.groupData.RoomInformation);
                    var checkInRemain = 0;
                    var isAcceptCheckOut = false;
                    var isPayment = false;
                    angular.forEach(rooms, function (value, key) {
                        if (value.BookingStatus == 'CHECKIN') checkInRemain++;
                    })
                    var isRemain = count < checkInRemain ? true : false;

                    groupReservationFactory.processGetRemainAmount($stateParams.reservationId, reservationRoomIdList, function (data) {
                        var dataRooms = data['ReservationRoomInfo'];
                        var dataCalculateRooms = data['CalculateRoomPrice'];
                        var dataRoomsAll = data['ReservationRoomInfoAll'];
                        var dataCalculateRoomsAll = data['CalculateRoomPriceAll'];
                        var pastCheckOutAll = data['PastCheckOutAll'];
                        var totalByRoom = [];
                        var total = 0;
                        var totalGroup = 0;
                        var isChangeTab = false;

                        for (var i in dataRooms) {
                            var amount = dataCalculateRooms[i].totalPrice;
                            var extraservices = dataRooms[i].RoomExtraServicesList;
                            var paymentsTemp = dataRooms[i].PaymentsList;

                            if (dataRooms[i].BookingStatus != "CHECKOUT") {
                                for (var idx in extraservices) {
                                    extraservices[idx].CreatedDate = new Date(extraservices[idx].CreatedDate);
                                    extraservices[idx].willPay = true;
                                }
                                for (var idx in extraservices) {
                                    if (extraservices[idx].willPay && !extraservices[idx].IsDeleted && extraservices[idx].RoomExtraServiceName != 'EXTRA_SERVICES') {
                                        amount += extraservices[idx].Amount;
                                    }
                                    if (extraservices[idx].willPay && !extraservices[idx].IsDeleted && extraservices[idx].RoomExtraServiceName == 'EXTRA_SERVICES') {
                                        amount += (extraservices[idx].Amount * extraservices[idx].Quantity);
                                    }
                                };
                                for (var idx in paymentsTemp) {
                                    amount -= paymentsTemp[idx].Amount;
                                };

                            }

                            amount = parseFloat(amount.toFixed($rootScope.decimals));
                            total += amount;
                            totalByRoom.push(amount);
                        }

                        for (var i in dataRoomsAll) {
                            var amount = dataCalculateRoomsAll[i].totalPrice;
                            var extraservices = dataRoomsAll[i].RoomExtraServicesList;
                            var paymentsTemp = dataRoomsAll[i].PaymentsList;

                            if (dataRoomsAll[i].BookingStatus != "CHECKOUT") {
                                for (var idx in extraservices) {
                                    extraservices[idx].CreatedDate = new Date(extraservices[idx].CreatedDate);
                                    extraservices[idx].willPay = true;
                                }
                                for (var idx in extraservices) {
                                    if (extraservices[idx].willPay && !extraservices[idx].IsDeleted && extraservices[idx].RoomExtraServiceName != 'EXTRA_SERVICES') {
                                        amount += extraservices[idx].Amount;
                                    }
                                    if (extraservices[idx].willPay && !extraservices[idx].IsDeleted && extraservices[idx].RoomExtraServiceName == 'EXTRA_SERVICES') {
                                        amount += (extraservices[idx].Amount * extraservices[idx].Quantity);
                                    }
                                };
                                for (var idx in paymentsTemp) {
                                    amount -= paymentsTemp[idx].Amount;
                                };
                            }

                            amount = parseFloat(amount.toFixed($rootScope.decimals));
                            totalGroup += amount;
                        }

                        if (!isRemain) {
                            if (totalGroup != 0) isChangeTab = true;
                        }
                        //total = 0 : Button tra phong ngay
                        //total > 0 : Button thanh toan & tra phong, button van tra phong
                        //total < 0 : Button van tra phong
                        $mdDialog.show({
                            controller: AcceptGroupCheckOutController,
                            resolve: {
                                currentAccept: function () {
                                    return isAcceptCheckOut;
                                },
                                currenPayment: function () {
                                    return isPayment;
                                },
                                currentTotal: function () {
                                    return total;
                                },
                                currentCurrency: function () {
                                    return $scope.defaultCurrency
                                },
                                currrentUnit: function () {
                                    return $scope.CurrencyOk;
                                },
                                currentRemain: function () {
                                    return isRemain;
                                },
                                currentTotalGroup: function () {
                                    return totalGroup;
                                },
                                currentIsChangeTab: function () {
                                    return isChangeTab;
                                },
                                currentPastCheckOutAll: function () {
                                    return pastCheckOutAll;
                                }
                            },
                            templateUrl: 'views/templates/acceptGroupCheckOut.tmpl.html',
                            parent: angular.element(document.body),
                            targetEvent: event,
                        }).then(function (result) {
                            // if ($scope.currentHotelConnectivities && $scope.currentHotelConnectivities.isUsed && $scope.roomInfo.length > 1 && $rootScope.Connectivities != null && $rootScope.Connectivities.code.HotelConnectivityModuleName != "SMART_NEO_LOCK" && $scope.currentHotelConnectivities.IsInputCardToCheckout) {
                            //     dialogService.messageBox("IS_INPUT_CARD_TO_CHECKOUT_PLEASE_CHECKOUT_EACH_ROOM");
                            //     InitGroupReservationDetail();
                            //     return;
                            // }
                            if (result != null && result != undefined) {
                                // if (processIsInputCardToCheckOut(function (dataCard) {
                                //     if (!dataCard) return;
                                isAcceptCheckOut = result['Accept'];
                                isPayment = result['Payment'];
                                if (isAcceptCheckOut) {
                                    if (!isPayment) {
                                        var keys = ["ROOM_MONTHLY", "NOTIFICATION_CHECKOUT_MES", "ROOM_WEEKLY", "ROOM_FULL_DAY", "ROOM_DAY_NIGHT", "ROOM_HOURLY", "MINIBAR", "LAUNDRY", "EXTRA_ROOM_CHARGE", "COMPENSATION", "EXTRA_SERVICES", "FULL_DAY_EARLY_CHECKIN", "FULL_DAY_LATE_CHECKOUT", "DAY_NIGHT_EARLY_CHECKIN", "DAY_NIGHT_LATE_CHECKOUT", "EXTRA_ADULTS", "EXTRA_CHILDREN", "PAYMENT", "DISCOUNT_MONEY_OFF", "DISCOUNT_PERCENT_OFF", "FREE"];
                                        var languageKeys = {};
                                        for (var idx in keys) {
                                            languageKeys[keys[idx]] = $filter("translate")(keys[idx]);

                                        }
                                        var GroupCheckOutModel = {
                                            ReservationId: $stateParams.reservationId,
                                            ReservationRoomIdList: reservationRoomIdList,
                                            languageKeys: languageKeys
                                        };
                                        var processGroupCheckOut = loginFactory.securedPostJSON("api/GroupReservation/ProcessGroupCheckOut", GroupCheckOutModel);
                                        $rootScope.dataLoadingPromise = processGroupCheckOut;
                                        processGroupCheckOut.success(function (data) {
                                            reWriteCradNeoLock($scope.roomInfo);
                                            $rootScope.groupReservationShowResult = data;
                                            InitGroupReservationDetail();
                                            $scope.isResult = data;
                                        }).error(function (err) {
                                            console.log(err);
                                            $scope.inProgressCheckOut = false;
                                        });
                                    } else {
                                        var parkeys = ["RES_NO", "ROOM", "NOTIFICATION_NEWPAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER", "ROOM_MONTHLY", "NOTIFICATION_CHECKOUT_MES", "ROOM_WEEKLY", "ROOM_FULL_DAY", "ROOM_DAY_NIGHT", "ROOM_HOURLY", "MINIBAR", "LAUNDRY", "EXTRA_ROOM_CHARGE", "COMPENSATION", "EXTRA_SERVICES", "FULL_DAY_EARLY_CHECKIN", "FULL_DAY_LATE_CHECKOUT", "DAY_NIGHT_EARLY_CHECKIN", "DAY_NIGHT_LATE_CHECKOUT", "EXTRA_ADULTS", "EXTRA_CHILDREN", "PAYMENT", "DISCOUNT_MONEY_OFF", "DISCOUNT_PERCENT_OFF", "FREE"];
                                        var languageKeys = {};
                                        for (var idx in parkeys) {
                                            languageKeys[parkeys[idx]] = $filter("translate")(parkeys[idx]);
                                        }
                                        var payments = [];

                                        angular.forEach(totalByRoom, function (value, key) {
                                            if (value != 0) {
                                                var resRId = dataRooms[key].ReservationRoomId;
                                                var payment = {
                                                    ReservationRoomId: resRId,
                                                    Amount: value,
                                                    MoneyId: $scope.defaultMoney,
                                                    PaymentMethodId: 1,
                                                    PaymentDescription: "Thanh toán và trả phòng nhanh",
                                                    PaymentTypeName: "NEW_PAYMENT"
                                                };
                                                payments.push(payment);
                                            }
                                        });
                                        var GroupPaymentModel = {
                                            ReservationId: $scope.reservationId,
                                            Payments: payments,
                                            languageKeys: languageKeys
                                        };
                                        var processGroupPayment = loginFactory.securedPostJSON("api/GroupReservation/ProcessGroupPayment", GroupPaymentModel);
                                        $rootScope.dataLoadingPromise = processGroupPayment;
                                        processGroupPayment.success(function (data) {
                                            dialogService.toast($filter('translate')('PAYMENT_AND_CHECKOUT_SUCCESSFULLY'));
                                            reWriteCradNeoLock($scope.roomInfo);
                                            InitGroupReservationDetail();
                                            $scope.groupPaymentsTmp = angular.copy($scope.groupData.GroupPayments);
                                        }).error(function (err) {
                                            console.log(err);
                                            $scope.inProgressCheckOut = false;
                                        });
                                    }
                                }
                                // }));
                            } else {
                                var keys = ["ROOM_MONTHLY", "NOTIFICATION_CHECKOUT_MES", "ROOM_WEEKLY", "ROOM_FULL_DAY", "ROOM_DAY_NIGHT", "ROOM_HOURLY", "MINIBAR", "LAUNDRY", "EXTRA_ROOM_CHARGE", "COMPENSATION", "EXTRA_SERVICES", "FULL_DAY_EARLY_CHECKIN", "FULL_DAY_LATE_CHECKOUT", "DAY_NIGHT_EARLY_CHECKIN", "DAY_NIGHT_LATE_CHECKOUT", "EXTRA_ADULTS", "EXTRA_CHILDREN", "PAYMENT", "DISCOUNT_MONEY_OFF", "DISCOUNT_PERCENT_OFF", "FREE"];
                                var languageKeys = {};
                                for (var idx in keys) {
                                    languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
                                }
                                var GroupCheckOutModel = {
                                    ReservationId: $stateParams.reservationId,
                                    ReservationRoomIdList: reservationRoomIdList,
                                    languageKeys: languageKeys
                                };
                                var processGroupCheckOut = loginFactory.securedPostJSON("api/GroupReservation/ProcessGroupCheckOut", GroupCheckOutModel);
                                $rootScope.dataLoadingPromise = processGroupCheckOut;
                                processGroupCheckOut.success(function (data) {
                                    reWriteCradNeoLock($scope.roomInfo);
                                    $rootScope.groupReservationShowResult = data;
                                    InitGroupReservationDetail();
                                    $scope.isResult = data;
                                }).error(function (err) {
                                    console.log(err);
                                    $scope.inProgressCheckOut = false;
                                });
                            }
                        }, function () {
                            $scope.inProgressCheckOut = false;
                        });

                        function AcceptGroupCheckOutController($scope, $mdDialog, currentAccept, currenPayment, currentTotal, currentCurrency, currrentUnit, currentRemain, currentTotalGroup, currentIsChangeTab, currentPastCheckOutAll) {
                            $scope.init = function () {
                                $scope.isAccept = currentAccept;
                                $scope.isPayment = currenPayment;
                                $scope.total = currentTotal;
                                $scope.defCurrency = currentCurrency;
                                $scope.minorUnit = currrentUnit;
                                $scope.isRemain = currentRemain;
                                $scope.totalGroup = currentTotalGroup;
                                $scope.isChangeTab = currentIsChangeTab;
                                $scope.pastCheckOutAll = currentPastCheckOutAll;
                            }
                            $scope.init();
                            $scope.hide = function () {
                                $mdDialog.hide();
                            };
                            $scope.cancel = function () {
                                $mdDialog.cancel();
                            };
                            $scope.quickPayment = function () {
                                $scope.isAccept = true;
                                $scope.isPayment = true;
                                var result = {
                                    Accept: $scope.isAccept,
                                    Payment: $scope.isPayment
                                };
                                $mdDialog.hide(result);
                            };
                            $scope.keepCheckOut = function () {
                                $scope.isAccept = true;
                                $scope.isPayment = false;
                                var result = {
                                    Accept: $scope.isAccept,
                                    Payment: $scope.isPayment
                                };
                                $mdDialog.hide(result);
                            };
                            $scope.quickCheckOut = function () {
                                $mdDialog.hide();
                            }
                        }
                    });

                }
            } else {
                dialogService.messageBox("MISSING_ROOM", "PLEASE_SELECT_AT_LEAST_ONE_ROOM");
                $scope.inProgressCheckOut = false;
                return;
            }
        };
        $scope.processGroupAmendStay = function () {
            var reservationRoomIdList = getSelectedRoom();
            if (!_.isEmpty(reservationRoomIdList)) {
                if ($scope.selectedRoom.length == 0)
                    return;
                var hasAnyRoomCheckIn = false;
                for (var index in $scope.selectedRoom) {
                    if ($scope.selectedRoom[index].BookingStatus == "CHECKIN" || $scope.selectedRoom[index].BookingStatus == "OVERDUE") {
                        hasAnyRoomCheckIn = true;
                    }
                }
                var stayInformationModel = {
                    Arrival: null,
                    Departure: null
                };
                angular.forEach($scope.selectedRoom, function (arr, index) {
                    if (arr.BookingStatus == "BOOKED" || arr.BookingStatus == "CHECKIN") {
                        if (stayInformationModel.Arrival == null || stayInformationModel.Departure == null) {
                            stayInformationModel.Arrival = arr.ArrivalDate;
                            stayInformationModel.Departure = arr.DepartureDate;
                        } else if (stayInformationModel.Arrival != null || stayInformationModel.Departure != null) {
                            if (arr.ArrivalDate < stayInformationModel.Arrival) {
                                stayInformationModel.Arrival = arr.ArrivalDate;
                            }
                            if (arr.DepartureDate > stayInformationModel.Departure) {
                                stayInformationModel.Departure = arr.DepartureDate;
                            }
                        }
                    }
                });

                $mdDialog.show({
                        controller: GroupAmendStayController,
                        resolve: {
                            hasAnyRoomCheckIn: function () {
                                return hasAnyRoomCheckIn;
                            },
                            stayInformation: function () {
                                return stayInformationModel;
                            }
                        },

                        templateUrl: 'views/templates/groupAmendStay.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: null,
                        clickOutsideToClose: false,
                    })
                    .then(function (object) {
                        if (object) {
                            var applyPastCheckOut = object.IsPastCheckOut;
                            var pastCheckOutReason = object.PastCheckOutReason;
                            var amendStayModel = object.Model;
                            var keys = ["ALREADY_APPLY_PAST_CHECKOUT"];
                            var languageKeys = {};
                            for (var idx in keys) {
                                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
                            }
                            var GroupAmendStayModel = {
                                ReservationId: $stateParams.reservationId,
                                ReservationRoomIdList: reservationRoomIdList,
                                NewArrivalDate: amendStayModel.NewArrivalDate,
                                NewDepartureDate: amendStayModel.NewDepartureDate,
                                ApplyCheckOutInThePast: applyPastCheckOut,
                                PastCheckOutReason: pastCheckOutReason,
                                languageKeys: languageKeys
                            };
                            var processGroupAmendStay = loginFactory.securedPostJSON("api/GroupReservation/ProcessGroupAmendStay", GroupAmendStayModel);
                            $rootScope.dataLoadingPromise = processGroupAmendStay;
                            processGroupAmendStay.success(function (data) {
                                $rootScope.groupReservationShowResult = data;
                                InitGroupReservationDetail();
                                $scope.isResult = data;
                            }).error(function (err) {
                                console.log(err);
                            });
                        }
                    }, function () {});

                function GroupAmendStayController($scope, $rootScope, $mdDialog, loginFactory, dialogService, hasAnyRoomCheckIn, stayInformation) {
                    function Init() {
                        console.log("stayInformation", stayInformation);
                        $scope.hasAnyRoomCheckIn = hasAnyRoomCheckIn;
                        $scope.stayInformation = stayInformation;
                        $scope.DateTimePickerOption = {
                            format: 'dd/MM/yyyy HH:mm'
                        };
                        $scope.amendStayModel = {
                            NewArrivalDate: $scope.stayInformation.Arrival,
                            NewDepartureDate: $scope.stayInformation.Departure
                        };
                        $scope.$watch('amendStayModel.NewArrivalDate', function (newValues, oldValues) {
                            if (newValues != null && oldValues != null) {
                                if (newValues.getTime() >= $scope.amendStayModel.NewDepartureDate.getTime()) {
                                    var newDepartureDate = addDays(newValues, 1);
                                    newDepartureDate.setHours($scope.amendStayModel.NewDepartureDate.getHours());
                                    newDepartureDate.setMinutes($scope.amendStayModel.NewDepartureDate.getMinutes());
                                    $scope.amendStayModel.NewDepartureDate = newDepartureDate;
                                }
                            }
                        });

                        $scope.originalAmendStayModel = angular.copy($scope.amendStayModel);

                        $scope.str = $scope.stayInformation.Arrival.format('dd/mm/yyyy HH:MM');
                        $scope.str2 = $scope.stayInformation.Departure.format('dd/mm/yyyy HH:MM');
                        $scope.isDepatureDateNow = false;
                        $scope.applyCheckOutInThePast = false;
                        $scope.PastCheckOutReason = "";
                        $scope.warningMissingReason = null;
                        $scope.warningInvalidDepartureDate = null;
                        $scope.maxDate = new Date();
                        $scope.user = $rootScope.user;
                    }
                    Init();

                    function addDays(date, days) {
                        var result = new Date(date);
                        result.setDate(result.getDate() + days);
                        return result;
                    }
                    $scope.hide = function () {
                        $mdDialog.hide();
                    };
                    $scope.cancel = function () {
                        $mdDialog.cancel();
                    };
                    $scope.saveGroupAmendStay = function () {
                        if ($scope.applyCheckOutInThePast) {
                            if (!$scope.PastCheckOutReason || $scope.PastCheckOutReason == '') {
                                $scope.warningMissingReason = true;
                                return;
                            }
                            if (!$scope.amendStayModel.NewDepartureDate || $scope.amendStayModel.NewDepartureDate.getTime() < $scope.amendStayModel.NewArrivalDate.getTime() || $scope.amendStayModel.NewDepartureDate.getTime() > $scope.maxDate.getTime()) {
                                $scope.warningInvalidDepartureDate = true;
                                $scope.warningMissingReason = false;
                                return;
                            }
                            var object = {
                                IsPastCheckOut: $scope.applyCheckOutInThePast,
                                PastCheckOutReason: $scope.PastCheckOutReason,
                                Model: $scope.amendStayModel
                            }
                            $mdDialog.hide(object);
                        } else {
                            if ($scope.amendStayModel.NewArrivalDate == null || $scope.amendStayModel.NewDepartureDate == null) {
                                $scope.warningDateNull = true;
                                $scope.warningDate = false;
                                $scope.warningArrivalDate = false;
                                $scope.warningDepartureDate = false;
                                return;
                            }
                            if ($scope.amendStayModel.NewArrivalDate < new Date() && $scope.hasAnyRoomCheckIn == false) {
                                $scope.warningDateNull = false;
                                $scope.warningDate = false;
                                $scope.warningArrivalDate = true;
                                $scope.warningDepartureDate = false;
                                return;
                            }
                            if ($scope.amendStayModel.NewDepartureDate <= new Date(new Date().getTime() - 2 * 60000)) {
                                $scope.warningDateNull = false;
                                $scope.warningDate = false;
                                $scope.warningArrivalDate = false;
                                $scope.warningDepartureDate = true;
                                return;
                            }
                            if ($scope.amendStayModel.NewArrivalDate > $scope.amendStayModel.NewDepartureDate) {
                                $scope.warningDateNull = false;
                                $scope.warningDate = true;
                                $scope.warningArrivalDate = false;
                                $scope.warningDepartureDate = false;
                                return;
                            }
                            if (!_.isEqual($scope.amendStayModel, $scope.originalAmendStayModel)) {
                                var object = {
                                    IsPastCheckOut: $scope.applyCheckOutInThePast,
                                    PastCheckOutReason: $scope.PastCheckOutReason,
                                    Model: $scope.amendStayModel
                                }
                                $mdDialog.hide(object);
                            } else {
                                $mdDialog.hide();
                            }
                        }
                    };
                    $scope.ChangeDepature = function () {
                        if ($scope.isDepatureDateNow) {
                            $scope.amendStayModel.NewDepartureDate = new Date();
                        } else {
                            $scope.amendStayModel.NewDepartureDate = $scope.stayInformation.Departure;
                        }
                        $scope.str2 = $scope.amendStayModel.NewDepartureDate.format('dd/mm/yyyy HH:MM');
                    };
                }
            } else {
                dialogService.messageBox("MISSING_ROOM", "PLEASE_SELECT_AT_LEAST_ONE_ROOM");
                return;
            }
        };
        $scope.processGroupRateTypeOperation = function (event, room) {
            event.stopPropagation();
            var planList = _.filter($scope.groupData.GeneralInfo.PlanList, function (item) {
                return item.RoomTypeId == room.RoomTypes.RoomTypeId;
            });
            var roomTemp = angular.copy(room);

            $mdDialog.show({
                    controller: GroupRateTypeOperationController,
                    resolve: {
                        currentRoom: function () {
                            return roomTemp;
                        },
                        planList: function () {
                            return planList;
                        }
                    },
                    templateUrl: 'views/templates/groupRateTypeOperation.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: null,
                    clickOutsideToClose: false, //fullscreen: useFullScreen
                })
                .then(function (groupRateTypeModel) {
                    var reservationRoomIdList = new Array;
                    if (groupRateTypeModel != null) {
                        if (groupRateTypeModel.IsApplyToSelectedRoom) {
                            reservationRoomIdList.push(roomTemp.ReservationRoomId);
                        } else {
                            var selectedRooms = _.filter($scope.groupData.RoomInformation, function (item) {
                                return item.RoomTypes.RoomTypeId == roomTemp.RoomTypes.RoomTypeId;
                            });
                            if (selectedRooms != null && selectedRooms.length > 0) {
                                for (var index in selectedRooms) {
                                    reservationRoomIdList.push(selectedRooms[index].ReservationRoomId);
                                }
                            }
                        }
                        var Paykeys = ["RES_NO", "ROOM", "NOTIFICATION_WHEN_CHANGE_PRICE"];
                        var languagePayKeys = {};
                        for (var idx in Paykeys) {
                            languagePayKeys[Paykeys[idx]] = $filter("translate")(Paykeys[idx]);
                        }
                        var GroupRateTypeOperationModel = {
                            ReservationId: $stateParams.reservationId,
                            ReservationRoomIdList: reservationRoomIdList,
                            NewRoomPriceId: groupRateTypeModel.NewRoomPriceId,
                            IsUpdatePrice: groupRateTypeModel.IsUpdatePrice,
                            NewPrice: roomTemp.Price,
                            languageKeys: languagePayKeys
                        };
                        var processGroupRateTypeOperation = loginFactory.securedPostJSON("api/GroupReservation/ProcessGroupRateTypeOperation", GroupRateTypeOperationModel);
                        $rootScope.dataLoadingPromise = processGroupRateTypeOperation;
                        processGroupRateTypeOperation.success(function (data) {
                            dialogService.toast("GROUP_RATE_TYPE_OPERATION_SUCCESSFUL");
                            InitGroupReservationDetail();
                        }).error(function (err) {
                            console.log(err);
                        });
                    }

                }, function () {});

            function GroupRateTypeOperationController($scope, $rootScope, $mdDialog, loginFactory, dialogService, currentRoom, planList) {
                function Init() {
                    $scope.currentRoom = currentRoom;
                    $scope.planList = planList;
                    $scope.isApplyToSelectedRoom = true;
                }
                Init();
                $scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
                $scope.saveGroupRateTypeOperation = function () {
                    var groupRateTypeModel = {
                        NewRoomPriceId: $scope.newRoomPrice.RoomPriceId,
                        IsUpdatePrice: $scope.newRoomPrice.IsUpdatePrice,
                        IsApplyToSelectedRoom: $scope.isApplyToSelectedRoom
                    }
                    $mdDialog.hide(groupRateTypeModel);
                }
            }
        };
        $scope.processGroupRateOperation = function () {
            var reservationRoomIdList = getSelectedRoom();
            if (!_.isEmpty(reservationRoomIdList)) {
                var keys = ["RES_NO", "ROOM", "NOTIFICATION_WHEN_CHANGE_PRICE"];
                var languageKeys = {};
                for (var idx in keys) {
                    languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
                }

                $mdDialog.show({
                        controller: GroupRateOperationController,
                        resolve: {

                        },
                        templateUrl: 'views/templates/groupRateOperation.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: null,
                        clickOutsideToClose: false, //fullscreen: useFullScreen
                    })
                    .then(function (newRoomChargeAmount) {
                        var GroupRateOperationModel = {
                            ReservationId: $stateParams.reservationId,
                            ReservationRoomIdList: reservationRoomIdList,
                            NewRoomChargeAmount: newRoomChargeAmount,
                            languageKeys: languageKeys
                        };
                        var processGroupRateOperation = loginFactory.securedPostJSON("api/GroupReservation/ProcessGroupRateOperation", GroupRateOperationModel);
                        $rootScope.dataLoadingPromise = processGroupRateOperation;
                        processGroupRateOperation.success(function (data) {
                            dialogService.toast("GROUP_RATE_OPERATION_SUCCESSFUL");
                            InitGroupReservationDetail();
                        }).error(function (err) {
                            console.log(err);
                        });
                    }, function () {});

                function GroupRateOperationController($scope, $rootScope, $mdDialog, loginFactory, dialogService) {
                    $scope.newRoomChargeAmount;

                    function Init() {
                        $scope.defaultDecimal = angular.copy($rootScope.decimals);
                    }
                    Init();
                    $scope.hide = function () {
                        $mdDialog.hide();
                    };
                    $scope.cancel = function () {
                        $mdDialog.cancel();
                    };
                    $scope.saveGroupRateOperation = function () {
                        $mdDialog.hide($scope.newRoomChargeAmount);
                    }
                }
            } else {
                dialogService.messageBox("MISSING_ROOM", "PLEASE_SELECT_AT_LEAST_ONE_ROOM");
                return;
            }
        };
        $scope.processGroupPaxOperation = function () {
            var reservationRoomIdList = getSelectedRoom();
            if (!_.isEmpty(reservationRoomIdList)) {
                $mdDialog.show({
                        controller: GroupPaxOperationController,
                        resolve: {

                        },
                        templateUrl: 'views/templates/groupPaxOperation.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: null,
                        clickOutsideToClose: false, //fullscreen: useFullScreen
                    })
                    .then(function (newPax) {
                        // var reservationRoomIdList = new Array;
                        // for (var index in $scope.selectedRoom) {
                        //     if ($scope.selectedRoom[index].ReservationRoomId) {
                        //         reservationRoomIdList.push($scope.selectedRoom[index].ReservationRoomId);
                        //     }
                        // }
                        var GroupPaxOperationModel = {
                            ReservationId: $stateParams.reservationId,
                            ReservationRoomIdList: reservationRoomIdList,
                            NewAdult: newPax.NewAdult,
                            NewChildren: newPax.NewChildren
                        };
                        var processGroupPaxOperation = loginFactory.securedPostJSON("api/GroupReservation/ProcessGroupPaxOperation", GroupPaxOperationModel);
                        $rootScope.dataLoadingPromise = processGroupPaxOperation;
                        processGroupPaxOperation.success(function (data) {
                            dialogService.toast("GROUP_PAX_OPERATION_SUCCESS");
                            InitGroupReservationDetail();
                        }).error(function (err) {
                            console.log(err);
                        });
                    }, function () {});

                function GroupPaxOperationController($scope, $rootScope, $mdDialog, loginFactory, dialogService) {

                    function Init() {
                        $scope.newPax = {
                            NewAdult: 1,
                            NewChildren: 0
                        };
                    }
                    Init();
                    $scope.hide = function () {
                        $mdDialog.hide();
                    };
                    $scope.cancel = function () {
                        $mdDialog.cancel();
                    };
                    $scope.saveGroupPaxOperation = function () {
                        $mdDialog.hide($scope.newPax);
                    }
                }
            } else {
                dialogService.messageBox("MISSING_ROOM", "PLEASE_SELECT_AT_LEAST_ONE_ROOM");
                return;
            }
        };
        $scope.processGroupBreakfast = function () {
            var reservationRoomIdList = getSelectedRoom();
            if (!_.isEmpty(reservationRoomIdList)) {
                $mdDialog.show({
                        controller: GroupBreakfastController,
                        resolve: {
                            isReservationBreakfast: function () {
                                return $scope.groupData.GeneralInfo.IsReservationBreakfast;
                            }
                        },
                        templateUrl: 'views/templates/groupBreakfast.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: null,
                        clickOutsideToClose: false, //fullscreen: useFullScreen
                    })
                    .then(function (isReservationBreakfast) {
                        var GroupBreakfastModel = {
                            ReservationId: $stateParams.reservationId,
                            ReservationRoomIdList: reservationRoomIdList,
                            IsReservationBreakfast: isReservationBreakfast
                        };
                        var processGroupBreakfast = loginFactory.securedPostJSON("api/GroupReservation/ProcessGroupBreakfast", GroupBreakfastModel);
                        $rootScope.dataLoadingPromise = processGroupBreakfast;
                        processGroupBreakfast.success(function (data) {
                            $rootScope.groupReservationShowResult = data;
                            InitGroupReservationDetail();
                        }).error(function (err) {
                            console.log(err);
                        });
                    }, function () {});

                function GroupBreakfastController($scope, $rootScope, $mdDialog, loginFactory, dialogService, isReservationBreakfast) {

                    function Init() {
                        $scope.isReservationBreakfast = isReservationBreakfast;
                    }
                    Init();
                    $scope.hide = function () {
                        $mdDialog.hide();
                    };
                    $scope.cancel = function () {
                        $mdDialog.cancel();
                    };
                    $scope.saveGroupPaxOperation = function () {
                        $mdDialog.hide($scope.isReservationBreakfast);
                    }
                }
            } else {
                dialogService.messageBox("MISSING_ROOM", "PLEASE_SELECT_AT_LEAST_ONE_ROOM");
                return;
            }
        };
        $scope.processCreateCard = function (room) {
            // use NeoLock
            if ($rootScope.Connectivities != null && $rootScope.Connectivities.code.HotelConnectivityModuleName === "SMART_NEO_LOCK") {
                var writeCardModel = {
                    RoomName: room.Rooms.RoomName,
                    TravellerName: room.Travellers.Fullname,
                    ArrivalDate: room.ArrivalDate,
                    DepartureDate: room.DepartureDate,
                    RoomDescription: room.Rooms.RoomDescription,
                    OverrideOldCards: true
                };
                if ($scope.currentHotelConnectivities.IsAutomaticalAddHourCheckout == true) {
                    writeCardModel = smartCardFactory.addHourCheckOutCard(writeCardModel, $scope.currentHotelConnectivities.HourAddToCheckout);
                };
                var createCard = smartCardFactory.writeCardDashboard(writeCardModel, room.ReservationRoomId, "");
                createCard.then(function (data) {
                    if (data.passcode != null) {
                        dialogService.toastSuccess($filter("translate")("CREATE_CARD_SUCCESSFUL") + " " + data.passcode);
                        InitGroupReservationDetail();
                    } else {
                        dialogService.messageBox(data.message).then(function (data) {
                            InitGroupReservationDetail();
                        });
                    }
                });
            } else {

                dialogService.confirm("PLEASE_BE_SURE_THE_VALID_CARD_IS_BEING_INSERTED").then(function () {
                    var hourAddToCheckOut = null;
                    // console.log('loinq',room);
                    if (room.IsCreateCard == false) {
                        var writeCardModel = {
                            RoomName: room.Rooms.RoomName,
                            TravellerName: room.Travellers.Fullname,
                            ArrivalDate: room.ArrivalDate,
                            DepartureDate: room.DepartureDate,
                            OverrideOldCards: true
                        };
                        if ($scope.currentHotelConnectivities.IsAutomaticalAddHourCheckout == true) {
                            writeCardModel = smartCardFactory.addHourCheckOutCard(writeCardModel, $scope.currentHotelConnectivities.HourAddToCheckout);
                        };
                        var createCard = smartCardFactory.writeCardDashboard(writeCardModel, room.ReservationRoomId, "");
                        createCard.then(function (data) {
                                if (data.Result !== null && data.Result == 0) {
                                    dialogService.toast("CHECKIN_AND_CREATE_CARD_SUCCESSFUL");
                                    InitGroupReservationDetail();
                                } else {
                                    dialogService.messageBox("INVALID_CARD").then(function (data) {
                                        InitGroupReservationDetail();
                                    });
                                }
                            }),
                            function () {
                                dialogService.messageBox("UNABLE_TO_CREATE_NEW_CARD");
                            };
                    } else {
                        room.RoomName = angular.copy(room.Rooms.RoomName);
                        room.reservationRoom = angular.copy(room);
                        var hourAddToCheckOut = null;
                        if ($scope.currentHotelConnectivities.IsAutomaticalAddHourCheckout == true) {
                            hourAddToCheckOut = $scope.currentHotelConnectivities.HourAddToCheckout;
                        };
                        smartCardFactory.createCard(room, hourAddToCheckOut);
                    };
                });

            }
        };
        $scope.processUnassignGroupRoom = function () {
            var reservationRoomIdList = getSelectedRoom();
            if (!_.isEmpty(reservationRoomIdList)) {
                var UnassignGroupRoomModel = {
                    ReservationId: $stateParams.reservationId,
                    ReservationRoomIdList: reservationRoomIdList
                };

                var processUnassignGroupRoom = loginFactory.securedPostJSON("api/GroupReservation/ProcessUnassignGroupRoom", UnassignGroupRoomModel);
                $rootScope.dataLoadingPromise = processUnassignGroupRoom;
                processUnassignGroupRoom.success(function (data) {
                    $rootScope.groupReservationShowResult = data;
                    InitGroupReservationDetail();
                    $scope.isResult = data;
                }).error(function (err) {
                    console.log(err);
                });
            } else {
                dialogService.messageBox("MISSING_ROOM", "PLEASE_SELECT_AT_LEAST_ONE_ROOM");
                return;
            }
        };
        $scope.processGroupDiscount = function () {
            var reservationRoomIdList = getSelectedRoom();
            if (!_.isEmpty(reservationRoomIdList)) {
                $mdDialog.show({
                        controller: GroupDiscountController,
                        templateUrl: 'views/templates/groupDiscount.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: null,
                        clickOutsideToClose: false, //fullscreen: useFullScreen
                    })
                    .then(function (discountModel) {

                        var keys = ["RES_NO", "ROOM", "NOTIFICATION_DISCOUNT_ROOM_PRICE", "NOTIFICATION_FREE_OF_CHARGE"];
                        var languageKeys = {};
                        for (var idx in keys) {
                            languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
                        }

                        var reservationRoomIdList = getSelectedRoom();
                        var GroupDiscountModel = {
                            ReservationId: $stateParams.reservationId,
                            ReservationRoomIdList: reservationRoomIdList,
                            Foc: discountModel.foc,
                            DiscountPercentage: discountModel.discountPercentage == null ? 0 : discountModel.discountPercentage,
                            DiscountFlat: discountModel.discountFlat == null ? 0 : discountModel.discountFlat,
                            languageKeys: languageKeys
                        };
                        var processGroupDiscount = loginFactory.securedPostJSON("api/GroupReservation/ProcessGroupDiscount", GroupDiscountModel);
                        $rootScope.dataLoadingPromise = processGroupDiscount;
                        processGroupDiscount.success(function (data) {

                            $rootScope.groupReservationShowResult = data;
                            InitGroupReservationDetail();

                        }).error(function (err) {
                            console.log(err);
                        });
                    }, function () {});

                function GroupDiscountController($scope, $rootScope, $mdDialog, loginFactory, dialogService) {
                    function Init() {
                        $scope.defaultDecimal = angular.copy($rootScope.decimals);
                        $scope.discountModel = {
                            foc: false,
                            discountPercentage: null,
                            discountFlat: null,
                        }
                    }
                    Init();
                    $scope.hide = function () {
                        $mdDialog.hide();
                    };
                    $scope.cancel = function () {
                        $mdDialog.cancel();
                    };
                    $scope.saveGroupDiscount = function () {

                        if ($scope.discountModel.foc == false) {
                            if ($scope.discountModel.discountPercentage == null && $scope.discountModel.discountFlat == null) {
                                $mdDialog.hide();
                            }
                        }

                        $mdDialog.hide($scope.discountModel);

                    }
                }
            } else {
                dialogService.messageBox("MISSING_ROOM", "PLEASE_SELECT_AT_LEAST_ONE_ROOM");
                return;
            }
        };
        $scope.processCancelGroupReservation = function () {
            var reservationRoomIdList = getSelectedRoom();
            var isChangeOwner = checkNumberBooked(reservationRoomIdList) < checkNumberBooked($scope.groupData.RoomInformation) ? true : false;
            if (checkGroupLeaderRR() == true && isChangeOwner) {
                $scope.processChangeOwnership("CANCEL_GROUP", reservationRoomIdList);
            } else {
                cancelGroupFunction(reservationRoomIdList);
            }
        };

        function cancelGroupFunction(reservationRoomIdList) {
            if (!_.isEmpty(reservationRoomIdList)) {
                $mdDialog.show({
                    controller: CancelDialogController,
                    templateUrl: 'views/templates/groupCancel.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                }).then(function (res) {
                    var cancelReason = res.cancelReason;
                    var keys = ["NOTIFICATION_CANCELED_GROUP_CONTENT", "NOTIFICATION_CANCELED_NAN_CONTENT", "NOTIFICATION_CANCELED_CONTENT"];
                    var languageKeys = {};
                    for (var idx in keys) {
                        languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
                    }
                    var CancelGroupReservationModel = {
                        ReservationId: $stateParams.reservationId,
                        ReservationRoomIdList: reservationRoomIdList,
                        cancelReason: cancelReason,
                        languageKeys: languageKeys
                    };
                    var processCancelGroupReservation = loginFactory.securedPostJSON("api/GroupReservation/ProcessCancelGroupReservation", CancelGroupReservationModel);
                    $rootScope.dataLoadingPromise = processCancelGroupReservation;
                    processCancelGroupReservation.success(function (data) {
                        $rootScope.groupReservationShowResult = data;
                        InitGroupReservationDetail();
                        $scope.isResult = data;
                    }).error(function (err) {
                        console.log(err);
                    });
                }, function () {});

                function CancelDialogController($scope, $mdDialog) {
                    $scope.hide = function () {
                        $mdDialog.hide();
                    };
                    $scope.cancel = function () {
                        $mdDialog.cancel();
                    };
                    $scope.SendEmail2 = true;
                    $scope.processCancel = function () {
                        $mdDialog.hide({
                            cancelReason: $scope.cancelReason,
                            SendEmail: $scope.SendEmail
                        });
                    };
                }
            } else {
                dialogService.messageBox("MISSING_ROOM", "PLEASE_SELECT_AT_LEAST_ONE_ROOM");
                return;
            }
        };
        $scope.processChangeOwnership = function (action, reservationRoomIdList) {
            console.log("CHANGE", action, reservationRoomIdList);
            var groupDataTemp = _.filter($scope.groupData.RoomInformation, function (item) {
                return item.IsGroupMaster == false && item.BookingStatus != 'CHECKOUT' && item.BookingStatus != 'CANCELLED';
            });

            if (reservationRoomIdList != null) {
                groupDataTemp = _.filter(groupDataTemp, function (item) {
                    return reservationRoomIdList.indexOf(item.ReservationRoomId) < 0;
                });
            }

            if (groupDataTemp.length == 0) {
                dialogService.messageBox("ERROR", "THERE_IS_NO_OTHER_ROOM_TO_CHANGE_OWNERSHIP");
                return;
            }

            $mdDialog.show({
                    controller: ChangeOwnershipController,
                    resolve: {
                        reservationRoomList: function () {
                            return groupDataTemp
                        }
                    },
                    templateUrl: 'views/templates/groupChangeOwnership.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: null,
                    clickOutsideToClose: false, //fullscreen: useFullScreen
                })
                .then(function (reservationRoomId) {
                    var ChangeOwnerShipModel = {
                        ReservationId: $stateParams.reservationId,
                        ReservationRoomId: reservationRoomId
                    };
                    var processChangeOwnership = loginFactory.securedPostJSON("api/GroupReservation/ProcessChangeOwnership", ChangeOwnerShipModel);
                    $rootScope.dataLoadingPromise = processChangeOwnership;
                    processChangeOwnership.success(function (data) {
                        if (action == null && reservationRoomIdList == null) {
                            dialogService.toast("CHANGE_OWNERSHIP_SUCCESSFUL");
                            InitGroupReservationDetail();
                        } else {
                            $rootScope.ReInitFromOtherFunction = {
                                action: action,
                                reservationRoomIdList: reservationRoomIdList
                            };
                            InitGroupReservationDetail();
                        }

                    }).error(function (err) {
                        console.log(err);
                    });
                }, function () {});

            function ChangeOwnershipController($scope, $mdDialog, loginFactory, dialogService, reservationRoomList) {
                $scope.selectedReservationRoom = null;

                function Init() {
                    $scope.reservationRoomList = reservationRoomList;
                    console.log("reservationRoomList", $scope.reservationRoomList);
                }
                Init();
                $scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
                $scope.saveChangeOwnership = function () {
                    if ($scope.selectedReservationRoom != null) {
                        $mdDialog.hide($scope.selectedReservationRoom.ReservationRoomId);
                    }
                }
            }
        };
        $scope.processRemoveReservationRoomFromGroup = function () {
            var reservationRoomIdList = getSelectedRoom();
            if (!_.isEmpty(reservationRoomIdList)) {
                if (checkGroupLeaderRR() == true) {
                    $scope.processChangeOwnership("REMOVE_RR", reservationRoomIdList);
                } else {
                    removeRRFromGroup(reservationRoomIdList);
                }
            } else {
                dialogService.messageBox("MISSING_ROOM", "PLEASE_SELECT_AT_LEAST_ONE_ROOM");
                return;
            }
        };

        //Step 3: Payments
        $scope.addGroupPayment = function (resRoomId) {
            var types = $scope.paymentType;
            var methods = angular.copy($scope.groupData.GeneralInfo.PaymentMethods);
            var moneys = angular.copy($scope.groupData.GeneralInfo.Money);
            var defMoney = angular.copy($scope.defaultMoney);
            var currenciesISO = angular.copy($scope.groupData.GeneralInfo.CurrenciesISO);
            var currencies = angular.copy($scope.groupData.GeneralInfo.Currencies);
            // var rooms = angular.copy($scope.groupDataRooms);
            var rooms = _.reject($scope.groupDataRooms, function (r) {
                return r.BookingStatus == 'CHECKOUT' || r.BookingStatus == 'CANCELLED';
            });
            var companyList = angular.copy($scope.companyList);
            var room = null;
            if (!_.isUndefined(resRoomId)) {
                room = _.find(rooms, function (room) {
                    return room['ReservationRoomId'] === resRoomId
                });
            } else {
                room = _.find(rooms, function (room) {
                    return room['IsGroupMaster'] == true
                });
                if (_.isUndefined(room) || _.isNull(room))
                    room = rooms[0];
            }
            $mdDialog.show({
                controller: AddNewPaymentController,
                resolve: {
                    currentRooms: function () {
                        return rooms;
                    },
                    roomSelected: function () {
                        return room;
                    },
                    currentTypes: function () {
                        return types;
                    },
                    currentMethods: function () {
                        return methods;
                    },
                    currentMoneys: function () {
                        return moneys;
                    },
                    currentCurrenciesISO: function () {
                        return currenciesISO;
                    },
                    currentCurrencies: function () {
                        return currencies;
                    },
                    currentCompanyList: function () {
                        return companyList;
                    },
                    currentMoney: function () {
                        return defMoney;
                    }
                },
                templateUrl: 'views/templates/addPaymentGroup.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: null,
                clickOutsideToClose: false
            }).then(function (final) {
                console.log('payment: ', final);
                var payment = final;
                dialogService.confirm("NEW_PAYMENT_CONFIRM", payment.PaymentConfirm).then(function () {
                    var Paykeys = ["RES_NO", "ROOM", "NOTIFICATION_NEWPAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER"];
                    var languagePayKeys = {};
                    angular.forEach(Paykeys, function (value, key) {
                        languagePayKeys[value] = $filter("translate")(value);
                    });
                    var paymentTypeName = "";
                    var pay = _.findWhere(types, {
                        PaymentTypeId: payment.PaymentId
                    });
                    if (pay != null && pay != undefined) paymentTypeName = pay.PaymentTypeName;
                    else paymentTypeName = "NEW_PAYMENT";
                    if (paymentTypeName == "REFUND") {
                        payment.Amount = -payment.Amount;
                        if (payment.AmountInSpecificMoney != null && payment.AmountInSpecificMoney != 0) payment.AmountInSpecificMoney = -payment.AmountInSpecificMoney;
                    }
                    var currentPayment = {
                        CompanyId: payment.CompanyId,
                        ReservationRoomId: payment.ReservationRoomId,
                        PaymentDescription: payment.PaymentDescription,
                        PaymentTypeName: paymentTypeName,
                        PaymentMethodId: payment.MethodId,
                        MoneyId: payment.MoneyId,
                        Amount: payment.Amount,
                        AmountInSpecificMoney: payment.AmountInSpecificMoney
                    };
                    var GroupPaymentModel = {
                        ReservationId: $scope.reservationId,
                        Payment: currentPayment,
                        languageKeys: languagePayKeys
                    };
                    var processGroupPayment = loginFactory.securedPostJSON("api/GroupReservation/ProcessGroupPaymentVer2", GroupPaymentModel);
                    $rootScope.dataLoadingPromise = processGroupPayment;
                    processGroupPayment.success(function (data) {
                        dialogService.toast($filter('translate')('PROCESS_GROUP_PAYMENT_SUCCESSFUL'));
                        InitGroupReservationDetail();
                        $scope.groupPaymentsTmp = angular.copy($scope.groupData.GroupPayments);
                    }).error(function (err) {
                        console.log(err);
                    });
                });
            });

            function AddNewPaymentController($scope, $mdDialog, currentRooms, roomSelected, currentMethods, currentMoneys, currentCurrenciesISO, currentCurrencies, currentCompanyList, currentMoney, currentTypes) {
                function Init() {
                    $scope.roomsTmp = currentRooms;
                    $scope.roomTmp = roomSelected;
                    $scope.methodsTmp = currentMethods;
                    $scope.typesTmp = currentTypes;
                    $scope.moneysTmp = currentMoneys;
                    $scope.defMoney = currentMoney
                    $scope.currenciesISOTmp = currentCurrenciesISO;
                    $scope.currenciesTmp = currentCurrencies;
                    $scope.companyList = currentCompanyList;
                    $scope.payment = {
                        MethodId: $scope.methodsTmp[0].PaymentMethodId,
                        PaymentId: $scope.typesTmp[0].PaymentTypeId,
                        MoneyId: $scope.moneysTmp[0].MoneyId,
                        Amount: $scope.roomTmp.Total,
                        AmountInSpecificMoney: null,
                        PaymentDescription: '',
                        CompanyId: null,
                        ReservationRoomId: null,
                        PaymentConfirm: null,
                    };
                    $scope.selectedCompanyCityLedger = null;
                    $scope.queryCompanySearchCityLedger = queryCompanySearchCityLedger;
                    $scope.selectedCompanyChangeCityLedger = selectedCompanyChangeCityLedger;
                    $scope.searchCompanyTextChangeCityLedger = searchCompanyTextChangeCityLedger;
                    $scope.decimal = $rootScope.decimals;
                    $scope.defaultCurrency = _.find($scope.currenciesTmp, function (curr) {
                        return curr['MoneyId'] === $scope.defMoney
                    });
                    $scope.decimalEdit = $scope.decimal;
                }
                Init();

                function queryCompanySearchCityLedger(query) {
                    var results = query ? $scope.companyList.filter(createCompanyFilterFor(query)) : $scope.companyList,
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
                };

                function searchCompanyTextChangeCityLedger(text) {
                    $scope.searchCompanyTextCityLedger = text;
                };

                function selectedCompanyChangeCityLedger(item) {
                    console.log("ITEM", item);
                    if (item != undefined) {
                        $scope.selectedCompanyCityLedger = item;

                    } else {
                        $scope.selectedCompanyCityLedger = null;
                    }

                };
                $scope.$watchCollection('payment.MoneyId', function (newValues, oldValues) {
                    if (newValues == oldValues) return;
                    if (newValues && oldValues) {
                        var amountTemp = angular.copy($scope.payment.Amount);
                        var oldMoney = _.find($scope.moneysTmp, function (item) {
                            return item.MoneyId == oldValues;
                        });
                        var currentMoney = _.find($scope.moneysTmp, function (item) {
                            return item.MoneyId == newValues;
                        });
                        var currentCurrency = _.filter($scope.currenciesISOTmp, function (item) {
                            return item.CurrencyId == currentMoney.CurrencyId;
                        })[0];
                        $scope.decimalEdit = currentCurrency.MinorUnit;
                        $timeout(function () {
                            $scope.payment.Amount = amountTemp * oldMoney.ExchangeRate / currentMoney.ExchangeRate;

                            // var amount = $scope.payment.Amount;
                            // if (amount.toFixed(2) == 0) {
                            //     $scope.payment.Amount = amountTemp;
                            //     $scope.payment.MoneyId = $scope.defaultCurrency.MoneyId;
                            // } else {
                            //     $scope.payment.AmountInSpecificMoney = (newValues != $scope.defaultCurrency.MoneyId) ? angular.copy($scope.payment.Amount) : null;

                            //     $scope.payment.DefaultAmount = newValues != $scope.defaultCurrency.MoneyId ? amountTemp : 0;
                            //     if (newValues != $scope.defaultCurrency.MoneyId) {
                            //         $scope.payment.AmountInSpecificMoney = angular.copy($scope.payment.Amount);
                            //         $scope.payment.SignOfSpecificMoney = currentCurrency.AlphabeticCode;
                            //     }
                            // }
                        }, 0);
                    }
                }, true);
                $scope.$watchCollection("payment.MethodId", function (newValues, oldValues) {
                    if (newValues == oldValues) return;
                    if (newValues && oldValues) {
                        $scope.selectedCompanyCityLedger = $scope.selectedCompany;
                    }
                });
                $scope.$watchCollection("roomTmp.ReservationRoomId", function (newValues, oldValues) {
                    if (newValues == oldValues) return;
                    $scope.roomTmp = _.find($scope.roomsTmp, function (room) {
                        return room['ReservationRoomId'] === $scope.roomTmp.ReservationRoomId
                    });
                    $scope.payment.ReservationRoomId = $scope.roomTmp.ReservationRoomId;
                    $scope.payment.Total = $scope.roomTmp.Total;
                });
                $scope.$watchCollection("payment.PaymentId", function (newValues, oldValues) {
                    if (newValues && oldValues) {
                        $scope.payment.MethodId = 1;
                    }
                });
                $scope.filterPaymentMethodId = function (value, index, array) {
                    if (value.PaymentMethodId == 4 && $scope.payment.PaymentId != 1) return false;
                    else return true;
                }

                $scope.hide = function () {
                    $mdDialog.hide();
                }
                $scope.cancel = function () {
                    $mdDialog.cancel();
                }
                $scope.savePayment = function () {
                    $scope.payment.ReservationRoomId = $scope.roomTmp.ReservationRoomId;
                    if ($scope.payment.Amount <= 0) {
                        return;
                    }
                    if ($scope.payment.MethodId === 4) {
                        if (!_.isNull($scope.selectedCompanyCityLedger))
                            $scope.payment.CompanyId = $scope.selectedCompanyCityLedger.CompanyId
                    }
                    if ($scope.payment.MoneyId != $scope.defMoney) {
                        for (var index in $scope.currenciesTmp) {
                            if ($scope.currenciesTmp[index].MoneyId == $scope.payment.MoneyId) {
                                var decimal = _.find($scope.currenciesISOTmp, function (item) {
                                    return item.CurrencyId == $scope.currenciesISOTmp[index].CurrencyId;
                                }).MinorUnit;
                                $scope.payment.AmountInSpecificMoney = $scope.payment.Amount;
                                $scope.payment.Amount = $scope.payment.Amount * $scope.currenciesTmp[index].ExchangeRate;
                                $scope.payment.PaymentConfirm = $filter("currency")($scope.payment.Amount) + "(" + $scope.currenciesTmp[index].MoneyName + " " + +$scope.payment.AmountInSpecificMoney.toFixed(decimal) + ")";
                                break;
                            }
                        }
                    } else $scope.payment.PaymentConfirm = $filter("currency")($scope.payment.Amount);
                    $mdDialog.hide($scope.payment);
                }
            }
        };
        $scope.processDeleteGroupPayment = function (payment, e) {
            if ($scope.isSubmitDeletePayment) e.preventDefault();
            else $scope.isSubmitDeletePayment = true;
            if (payment != null) {
                var keys = ["RES_NO", "ROOM", "NOTIFICATION_WHEN_DELETE_PAYMENT", "NOTIFICATION_DELETED_DEPOSIT", "NOTIFICATION_DELETED_REFUND", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER", "NOTIFICATION_DELETED_PAYMENT"];
                var languageKeys = {};
                for (var idx in keys) {
                    languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
                }
                var paymentTemp = angular.copy(payment);
                paymentTemp.PaymentDetail.PaymentTypeName = "DELETED";
                $mdDialog.show({
                    controller: DeletePaymentDialogController,
                    resolve: {
                        payment: function () {
                            return paymentTemp;
                        },
                    },
                    templateUrl: 'views/templates/deletePayment.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                }).then(function (deleteReason) {
                    paymentTemp.PaymentDetail.PaymentDescription = deleteReason;
                    var paymentGroupModel = {
                        payment: paymentTemp,
                        languageKeys: languageKeys
                    }
                    var processDeleteGroupPayment = loginFactory.securedPostJSON("api/GroupReservation/ProcessDeleteGroupPayment", paymentGroupModel);
                    $rootScope.dataLoadingPromise = processDeleteGroupPayment;
                    processDeleteGroupPayment.success(function (data) {
                        dialogService.toast("DELETE_GROUP_PAYMENT_SUCCESSFUL");
                        $rootScope.groupReservationShowResult = null;
                        InitGroupReservationDetail();
                    }).error(function (err) {
                        dialogService.messageBox("ERROR", err.Message);
                        $scope.isSubmitDeletePayment = false;
                    });
                }, function () {
                    $scope.isSubmitDeletePayment = false;
                });

                function DeletePaymentDialogController($scope, $mdDialog, payment, loginFactory) {
                    function Init() {
                        $scope.payment = payment;
                        $scope.deleteReason = null;
                    }
                    Init();

                    $scope.processDelete = function () {
                        $mdDialog.hide($scope.deleteReason);
                    }

                    $scope.hide = function () {
                        $mdDialog.hide();
                    };
                    $scope.cancel = function () {
                        $mdDialog.cancel();
                    };
                }
            }
        };
        $scope.goRoom = function (reservationRoomId) {
            event.stopPropagation();
            $state.go("reservation", {
                reservationRoomId: reservationRoomId
            });
        }
        $scope.showPayment = function (ev, payment) {
            $mdDialog.show({
                    controller: PaymentController,
                    locals: {
                        reservationRoomId: payment.PaymentDetail.ReservationRoomId,
                        paymentId: payment.PaymentDetail.PaymentId,
                        paymentTypeName: payment.PaymentDetail.PaymentTypeName,
                        hotelFormRoomReceipt: $scope.hotelFormRoomReceipt
                    },
                    templateUrl: 'views/templates/invoicePayment.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: false
                })
                .then(function (answer) {}, function () {

                });
        };

        function PaymentController($scope, $mdDialog, reservationRoomId, paymentId, paymentTypeName, hotelFormRoomReceipt) {

            //showInvoice(reservationRoomId);
            console.log('stateParams.reservationRoomId', reservationRoomId, paymentId, hotelFormRoomReceipt);
            globalInvoiceId = reservationRoomId;
            PaymentId = paymentId;
            PaymentTypeName = paymentTypeName;

            HotelFormRoomReceipt = hotelFormRoomReceipt;
            _PaymentNumber = 0;
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
        }

        // Helper js
        $scope.isValidKeyPress = function (evt) {
            if (evt.keyCode != 8 && (evt.keyCode < 47 || evt.keyCode > 57)) {
                if (evt.keyCode != 46)
                    evt.preventDefault();
            }
        };
        $scope.openMenu = function ($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        };

        function change_alias(alias) {
            var str = alias;
            str = str.toLowerCase();
            str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
            str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
            str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
            str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
            str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
            str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
            str = str.replace(/đ/g, "d");
            str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|$|_/g, "");
            str = str.replace(/-+-/g, "");
            str = str.replace(/^\-+|\-+$/g, "");
            return str;
        };
        $scope.getReservation = function (evt, item1) {
            var a = item1 != null ? item1 : 0;
            if (evt.keyCode != 8 && (evt.keyCode < 48 || evt.keyCode > 57)) {
                if ((a - parseInt(a) != 0) && evt.keyCode == 46)
                    evt.preventDefault();
                else if (evt.keyCode != 46)
                    evt.preventDefault();
            }
            if (evt.keyCode == 13) {
                var processGetReservation = loginFactory.securedGet("api/GroupReservation/GetReservationDetailFilter", "reservationNumber=" + item1);
                $rootScope.dataLoadingPromise = processGetReservation;
                processGetReservation.success(function (data) {
                    console.log(data);
                    if (data.reservation_isgroup == true) {
                        $location.path('groupReservationDetail/' + data.reservation_id);
                    } else {
                        $location.path('reservation/' + data.reservation_rooms[0].ReservationRoomId);
                    }
                }).error(function (err) {
                    $scope.GeneralInfo.Reservations.ReservationNumber = $scope.reservation_oldNumber;
                    dialogService.toastWarn("NO_BOOKING_FOUND");
                    console.log(err);
                });
            }

        };

        function getSelectedRoom(bookingStatus) {
            var reservationRoomIdList = new Array;
            var a = $scope.selectedRoom;
            angular.forEach($scope.selectedRoom, function (value, key) {
                if (value.ReservationRoomId) {
                    var isExist = _.find(reservationRoomIdList, function (room) {
                        return room['ReservationRoomId'] === value.ReservationRoomId
                    })
                    if (_.isUndefined(isExist)) {
                        var index = _.findIndex($scope.groupDataRooms, function (item) {
                            return item.ReservationRoomId == value.ReservationRoomId;
                        });
                        var newObj = {
                            ReservationRoomId: value.ReservationRoomId,
                            StatusCode: value.BookingStatus,
                            ConflictRoomId: 0,
                            OldIndex: index
                        };
                        reservationRoomIdList.push(newObj);
                    }
                }
            });
            if (_.isUndefined(bookingStatus) || _.isNull(bookingStatus)) {
                return reservationRoomIdList;
            } else {
                var rooms = angular.copy($scope.groupData.RoomInformation);
                var countSelected = 0;
                angular.forEach(reservationRoomIdList, function (value, key) {
                    var temp = _.find(rooms, function (room) {
                        return room['ReservationRoomId'] === value.ReservationRoomId
                    });
                    if (!_.isUndefined(temp)) {
                        switch (bookingStatus) {
                            case 'ASSIGN':
                                if (temp.BookingStatus == 'BOOKED' && temp.Rooms.RoomId != null) countSelected++;
                                break;
                            case 'BOOKED':
                                if (temp.BookingStatus === 'BOOKED' && temp.Rooms.RoomId == null) countSelected++;
                                break;
                            default:
                                if (temp.BookingStatus === bookingStatus) countSelected++;
                                break;
                        }
                    }
                })
                var data = {
                    ReservationRoomIdList: reservationRoomIdList,
                    CountSelected: countSelected
                };
                return data;
            }
        };
        $scope.getCountryItem = function (CountryId) {
            var result = $scope.countries.find(function (item) {
                if (item.CountryId === CountryId) {
                    return item;
                }
            }, CountryId);
            return result;
        }

        function showGroupConfliction(conflictData) {
            $mdDialog.show({
                    controller: ShowGroupConflictionController,
                    resolve: {
                        conflictData: function () {
                            return conflictData;
                        }
                    },
                    templateUrl: 'views/templates/groupConfliction.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: null,
                    clickOutsideToClose: false,
                })
                .then(function () {}, function () {});

            function ShowGroupConflictionController($scope, $rootScope, $mdDialog, loginFactory, dialogService, conflictData) {
                function Init() {
                    $scope.conflictData = conflictData;
                }
                Init();
                $scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
            }
        };

        function querySourceSearch(query) {
            var results = query ? $scope.sourceList.filter(createSourceFilterFor(query)) : $scope.sourceList,
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
        };

        function queryCompanySearch(query) {
            var results = query ? $scope.companyList.filter(createCompanyFilterFor(query)) : $scope.companyList,
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
        };

        function queryCompanySearchCityLedger(query) {
            var results = query ? $scope.companyList.filter(createCompanyFilterFor(query)) : $scope.companyList,
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
        };

        function searchCompanyTextChange(text) {
            $scope.searchCompanyText = text;
            $scope.isChangeGroupInformation = true;
        };

        function searchCompanyTextChangeCityLedger(text) {
            $scope.searchCompanyTextCityLedger = text;
        };

        function selectedCompanyChange(item) {
            console.log("ITEM", item);
            if (item !== undefined) {
                $scope.selectedCompany = item;
                var selectedSourceTemp = _.filter($scope.sourceList, function (item) {
                    return item.SourceId && item.SourceId == $scope.selectedCompany.SourceId;
                });
                if (selectedSourceTemp.length > 0) {
                    $scope.selectedSource = selectedSourceTemp[0];
                }
                console.log("SOURCE LIST", item, $scope.selectedSource, $scope.sourceList);
            } else {
                $scope.selectedCompany = null;
            }
        };

        function selectedCompanyChangeCityLedger(item) {
            console.log("ITEM", item);
            if (item != undefined) {
                $scope.selectedCompanyCityLedger = item;

            } else {
                $scope.selectedCompanyCityLedger = null;
            }

        };

        function searchSourceTextChange(text) {
            $scope.isChangeGroupInformation = true;
        }

        function selectedSourceChange(item) {
            $scope.selectedSource = item;
        };

        function searchMarketTextChange(text) {
            $scope.isChangeGroupInformation = true;
        }

        function selectedMarketChange(item) {
            $scope.selectedMarket = item;
        };

        function queryMarketSearch(query) {
            var results = query ? $scope.marketList.filter(createMarketFilterFor(query)) : $scope.marketList,
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
        };

        function createCompanyFilterFor(query) {
            var lowercaseQuery = change_alias(query);
            return function filterFn(item) {
                return (change_alias(item.CompanyName.toLowerCase()).indexOf(lowercaseQuery) >= 0 || change_alias(item.CompanyCode.toLowerCase()).indexOf(lowercaseQuery) >= 0);
            };
        };

        function createSourceFilterFor(query) {
            var lowercaseQuery = change_alias(query);
            return function filterFn(item) {
                return (change_alias(item.SourceName).indexOf(lowercaseQuery) >= 0 || change_alias(item.ShortCode.toLowerCase()).indexOf(lowercaseQuery) >= 0);
            };
        };

        function createMarketFilterFor(query) {
            var lowercaseQuery = change_alias(query);
            return function filterFn(item) {
                return (change_alias(item.MarketName).indexOf(lowercaseQuery) >= 0 || change_alias(item.MarketCode.toLowerCase()).indexOf(lowercaseQuery) >= 0);
            };
        };

        function queryCountriesSearch(query) {
            console.log('scope.Countries:', $scope.countries);
            var results = query ? $scope.countries.filter(createCountriesFilterFor(query)) : $scope.countries,
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

        function createCountriesFilterFor(query) {
            var lowercaseQuery = change_alias(query);
            return function filterFn(item) {
                return (change_alias(item.CountryName.toLowerCase()).indexOf(lowercaseQuery) >= 0 || change_alias(item.CountryCode.toLowerCase()).indexOf(lowercaseQuery) >= 0);
            };
        }

        function selectedCountriesChange(item) {
            console.log("ITEM", item);
            if (item != undefined) {
                $scope.selectedCountries = item;

            } else {
                $scope.selectedCountries = null;
            }

        }

        function searchCountriesTextChange(text) {
            $scope.searchCountriesText = text;
        }

        // passport
        $scope.saveInfoPassport = function () {
            $scope.groupLeader.Fullname = FullnameCustomer;
            $scope.groupLeader.Gender = Gender === "M" ? 0 : 1;
            $scope.groupLeader.IdentityNumber = IdentityNumber;
            if (Birthday) {
                $scope.groupLeader.Birthday = new Date(Birthday);
                $scope.dateString = $scope.groupLeader.Birthday.format('dd/mm/yyyy');
            }

            $scope.groupLeader.ImageLocation = ImageLocation;
            $scope.groupLeader.ValidUntil = new Date(ValidUntil);

            if ($scope.countries !== null && $scope.groupLeader !== null && $scope.countries.length > 0)

                $scope.selectedCountries = _.filter($scope.countries, function (item) {
                    return item.CountryCode == CountryCode;
                })[0];
            console.log("country passport:", $scope.selectedCountries);
            console.log("customer passport:", $scope.groupLeader);

            $scope.isChangeGroupLeader = true;
        }

        $timeout(function () {
            InitGroupReservationDetail();
        }, 100);

    }
]);