ezCloud.controller('POSInvoiceController', ['$scope', '$mdBottomSheet', '$rootScope', '$log', 'commonFactory', 'loginFactory', '$stateParams', 'roomListFactory', 'dialogService', '$state', '$mdDialog', '$locale', '$filter', '$localStorage', 'configFactory', '$mdMedia', 'smartCardFactory', '$timeout', '$location', 'reservationFactory', 'walkInFactory', 'POSFactory',
    function ($scope, $mdBottomSheet, $rootScope, $log, commonFactory, loginFactory, $stateParams, roomListFactory, dialogService, $state, $mdDialog, $locale, $filter, $localStorage, configFactory, $mdMedia, smartCardFactory, $timeout, $location, reservationFactory, walkInFactory, POSFactory) {

        function Init() {
            jQuery(document).unbind('keydown');
            if (POSFactory.checkIfPOSModuleActive()) {
                $scope.DateTimePickerOption = {
                    format: 'dd/MM/yyyy HH:mm'
                };
                $scope.DatePickerOption = {
                    format: 'dd/MM/yyyy'
                };
                $scope.txtMota = "";
                $scope.str = new Date().format('dd/mm/yyyy HH:MM');
                // $scope.decimal = $rootScope.decimals;
                $scope.defaultDecimal = angular.copy($scope.decimal);
                $scope.isDraftInvoice = $stateParams.draftId != null;
                $scope.draftTitle = null;
                $scope.enterPayments = false;

                $scope.changeAmount = function () {
                    $scope.POSModel.QuantityAllListServices = $scope.POSModel.QuantityAllListServices == 1 ? 0 : 1;
                }
                $scope.rooms = [];
                // get list rooms to transfer Invoice POS
                var getListRR = loginFactory.securedGet("api/POS/GetListRoomToTransferInvoice");
                $rootScope.dataLoadingPromise = getListRR;
                getListRR.success(function (data) {
                    $scope.rooms = data;
                }).error(function (err) {
                    console.log(err);
                });
                $scope.RoomInfo = {
                    ReservationRoomId: 0
                };
                $scope.selectRoom = function () {
                    if ($scope.RoomInfo.ReservationRoomId != 0) {
                        $scope.POSModel.DiscountPercentage = 0;
                        $scope.POSModel.DiscountFlat = 0;
                        $scope.POSModel.DiscountReason = '';
                        $scope.discount.discountNumberTemp = 0;
                        var _name = $scope.rooms.find(function (item) {
                            return item.ReservationRoomId === $scope.RoomInfo.ReservationRoomId;
                        }).Traveller.Fullname;
                        $scope.POSModel.ContactInformation.Fullname = _name;
                        $scope.totalInvoice();
                    } else {
                        $scope.POSModel.ContactInformation.Fullname = 'Anonymous';
                    }
                }
                $scope.getInfoCus = function (roomInfo) {
                    var temp = _.findWhere($scope.rooms, {
                        RoomId: roomInfo.RoomIdSelected
                    });
                    $scope.POSModel.ContactInformation.Fullname = temp.Travellers.Fullname;
                    $scope.RoomInfo.ReservationRoomId = temp.ReservationRoomId;
                }

                // Charges Total
                $scope.chargesTotal = 0;

                // Charges Total Original
                $scope.chargesTotalOriginal = 0;

                // Payments Total
                $scope.paymentsTotal = 0;

                //Invoice Total
                $scope.invoiceTotal = 0;

                // Payment
                $scope.payment = {
                    AmountTemp: 0,
                    Amount: 0,
                    AmountInSpecificMoney: null,
                    DefaultAmount: 0,
                    PaymentMethodId: 0,
                    MoneyId: null,
                    PaymentDescription: null,
                    CreatedDate: new Date(),
                    CompanyId: null
                };

                $scope.POSModel = {
                    ContactInformation: {
                        Fullname: "Anonymous"
                    },
                    Charges: [],
                    Payments: [],
                    DiscountFlat: 0,
                    DiscountPercentage: 0,
                    DiscountAmount: 0,
                    DiscountReason: '',
                    QuantityAllListServices: 0
                };

                //#region Popup DISCOUNT data
                $scope.discount = {
                    discountOptions: 0,
                    discountNumber: 0,
                    discountReason: '',
                    discountNumberTemp: 0,
                    discountAmount: 0
                }

                $scope.maxDiscountFlat = 0;// $scope.chargesTotal - $scope.paymentsTotal;

                $scope.DiscountCal = function () {
                    var newTotalAmount = $scope.chargesTotal - $scope.paymentsTotal;

                    if ($scope.discount.discountOptions == 0) {
                        $scope.discount.discountAmount = (($scope.discount.discountNumber / 100) * newTotalAmount).toFixed(2);
                        $scope.discount.discountNumberTemp = 0;
                    } else {
                        $scope.discount.discountNumber = 0;//(($scope.discount.discountNumberTemp / $scope.chargesTotal) * 100).toFixed(2);
                        $scope.discount.discountAmount = $scope.discount.discountNumberTemp;
                    }

                    $scope.POSModel.DiscountFlat = $scope.discount.discountNumberTemp;
                    $scope.POSModel.DiscountPercentage = $scope.discount.discountNumber;
                    $scope.POSModel.DiscountAmount = $scope.discount.discountAmount;

                    $scope.POSModel.DiscountReason = $scope.discount.discountReason;
                    if ($scope.POSModel.DiscountReason == null || $scope.POSModel.DiscountReason.trim() == '') {
                        dialogService.messageBox("ERROR", "MISSING_DISCOUNT_REASON");
                        return;
                    }
                    if (typeof ($scope.POSModel.DiscountFlat) == 'undefined' || typeof ($scope.POSModel.DiscountPercentage) == 'undefined') {

                        dialogService.messageBox("DISCOUNT_INVALID", "THE_TOTAL_OF_DISCOUNT_INVALID");
                        $scope.room.DiscountFlat = 0;
                        return;
                    }
                    $scope.totalInvoice();
                }
                $scope.checkValidNumber = function (evt, item1) {
                    var a = item1.Quantity != null ? item1.Quantity : 0;
                    if (evt.keyCode != 8 && (evt.keyCode < 48 || evt.keyCode > 57)) {
                        if ((a - parseInt(a) != 0) && evt.keyCode == 46)
                            evt.preventDefault();
                        else if (evt.keyCode != 46)
                            evt.preventDefault();
                    }
                }
                $scope.showDiscount = function (model) {
                    var _maxDiscountFlat = $scope.chargesTotal - $scope.paymentsTotal;
                    var discountTemp = angular.copy(model);
                    //var _payment = angular.copy(payment);
                    $mdDialog.show({
                        controller: ActiveDiscount,
                        resolve: {
                            currenDiscount: function () {
                                return discountTemp;
                            },
                            decimal: function () {
                                return $scope.decimal;
                            },
                            maxDiscountFlat: function () {
                                return _maxDiscountFlat;
                            }
                        },
                        templateUrl: 'views/POS/dlgDiscount.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: null,
                        clickOutsideToClose: false
                    }).then(function (Final) {
                        $scope.discount = Final;
                        $scope.DiscountCal();
                    });

                    function ActiveDiscount($scope, $mdDialog, currenDiscount, decimal, maxDiscountFlat) {
                        $scope.decimal = decimal;
                        //$scope._payment = payment;
                        $scope.maxDiscountFlat = maxDiscountFlat;
                        function init() {
                            $scope.discountFinal = currenDiscount;
                        }
                        init();

                        $scope.save = function () {
                            $mdDialog.hide($scope.discountFinal);
                        }
                        $scope.hide = function () {
                            $mdDialog.hide();
                        }
                        $scope.cancel = function () {
                            $mdDialog.cancel();
                        }

                    }
                }
                //#endregion
                var draftId = null;
                if ($stateParams.draftId != null) {
                    draftId = $stateParams.draftId;
                } else {
                    if (POSFactory.getDraftId() != null) {
                        draftId = POSFactory.getDraftId();
                    }
                }
                $scope.CurrencyOk = {};
                var getAllPOSData = loginFactory.securedGet("api/POS/GetAllPOSData", "draftId=" + draftId);
                $rootScope.dataLoadingPromise = getAllPOSData;
                getAllPOSData.success(function (data) {
                    // POS Config
                    $scope.posConfig = data.posConfig;

                    // Countries
                    $scope.countries = data.countries;

                    //Currencies
                    $scope.currencies = data.currencies;
                    $scope.currenciesISO = data.currenciesISO;
                    $scope.defaultCurrency = data.defaultCurrency;
                    $scope.CurrencyOk = data.currenciesISO.find(function (item) {
                        console.log(item, data.defaultCurrency, "leo nguyen")
                        return item.CurrencyId == data.defaultCurrency.CurrencyId;
                    })
                    //Company List
                    $scope.companyList = data.companyList;

                    //Payment Methods
                    $scope.paymentMethods = data.paymentMethods;
                    for (var index in $scope.paymentMethods) {
                        if ($scope.paymentMethods[index].PaymentMethodName.toLowerCase() == "cash") {
                            $scope.defaultPaymentMethod = $scope.paymentMethods[index];
                            break;
                        }
                    }

                    //ExtraServices
                    $scope.extraServices = {};
                    resolveExtraServices(data.extraServices);
                    $scope.extraServices_NoItem = [];
                    $scope.extraService_NoItem = {
                        RoomExtraServiceDescription: null,
                        Quantity: 1,
                        Amount: null
                    };
                    $scope.selectedExtraServiceCategory = 0;


                    if (data.draftData != null) {
                        var draftData = JSON.parse(data.draftData.DrafPOSData);
                        $scope.POSModel = draftData;
                        if ($scope.POSModel.Payments != null && $scope.POSModel.Payments.length > 0) {
                            for (var index in $scope.POSModel.Payments) {
                                var paymentDraft = $scope.POSModel.Payments[index];
                                if (paymentDraft.AmountInSpecificMoney != null && paymentDraft.AmountInSpecificMoney > 0) {
                                    var currentDraftMoney = _.filter($scope.currencies, function (curr) {
                                        return curr.MoneyId == paymentDraft.MoneyId;
                                    })[0];
                                    var currentDraftCurrency = _.filter($scope.currenciesISO, function (item) {
                                        return item.CurrencyId == currentDraftMoney.CurrencyId;
                                    })[0];
                                    paymentDraft.AmountInSpecificMoneyString = $filter('currency')(paymentDraft.AmountInSpecificMoney, currentDraftMoney.MoneyName, currentDraftCurrency.MinorUnit);
                                }
                            }
                        }
                        $scope.draftTitle = draftData.Title;
                    } else {

                        if (POSFactory.getInvoiceId() == null) {
                            // POS Model
                            $scope.POSModel = {
                                ContactInformation: {
                                    Fullname: "Anonymous"
                                },
                                Charges: [],
                                Payments: [],
                                DiscountFlat: 0,
                                DiscountPercentage: 0,
                                DiscountAmount: 0,
                                DiscountReason: '',
                                QuantityAllListServices: 0
                            };
                            var defaultCountry = null;
                            if ($scope.POSModel.ContactInformation.CountryId == null) {
                                defaultCountry = _.filter($scope.countries, function (item) {
                                    return item.CountryCode.toLowerCase() == "vn";
                                })[0];
                            } else {
                                defaultCountry = _.filter($scope.countries, function (item) {
                                    return item.CountryId == $scope.POSModel.ContactInformation.CountryId;
                                })[0];
                            }

                            $scope.POSModel.ContactInformation.CountryId = defaultCountry.CountryId;
                        } else {
                            var invoiceId = POSFactory.getInvoiceId();
                            var getPOSInvoiceDetail = loginFactory.securedGet("api/POS/GetPOSInvoiceDetail", "invoiceId=" + invoiceId);
                            $rootScope.dataLoadingPromise = getPOSInvoiceDetail;
                            getPOSInvoiceDetail.success(function (dataPOS) {
                                if (dataPOS != null && dataPOS.currentInvoice != null) {
                                    var data = dataPOS.currentInvoice;
                                    // Contact Information
                                    $scope.POSModel.ContactInformation = {
                                        Fullname: data.Travellers.Fullname,
                                        IdentityNumber: data.Travellers.IdentityNumber,
                                        Mobile: data.Travellers.Mobile,
                                        Email: data.Travellers.Email,
                                        Note: data.Travellers.Note,
                                        CountryId: data.Travellers.CountryId
                                    };


                                    // Charges
                                    for (var index in data.RoomExtraServicesList) {
                                        var roomES = data.RoomExtraServicesList[index];
                                        var roomESItems = _.filter(data.RoomExtraServiceItemsList, function (item) {
                                            return item.RoomExtraServiceId == roomES.RoomExtraServiceId;
                                        });
                                        if (roomESItems != null && roomESItems.length > 0) {
                                            for (var itemIdx in roomESItems) {
                                                var charge = {
                                                    Id: roomESItems[itemIdx].ExtraServiceItems.ExtraServiceItemId,
                                                    Name: roomESItems[itemIdx].ExtraServiceItems.ExtraServiceItemName,
                                                    Quantity: roomESItems[itemIdx].Quantity,
                                                    Price: roomESItems[itemIdx].Price,
                                                    Type: 'EXTRA_SERVICE_ITEM'
                                                };
                                                $scope.POSModel.Charges.push(charge);
                                            }
                                        } else {
                                            var charge = {
                                                Name: roomES.RoomExtraServiceDescription,
                                                Quantity: roomES.Quantity,
                                                Price: roomES.Amount,
                                                Type: 'EXTRA_SERVICE_NO_ITEM'
                                            }
                                            $scope.POSModel.Charges.push(charge);
                                        }
                                    }
                                }
                            }).error(function (err) {
                                console.log(err);
                            });
                        }
                    }

                    // Payment
                    $scope.payment = {
                        AmountTemp: $scope.chargesTotal - $scope.paymentsTotal,
                        Amount: $scope.chargesTotal - $scope.paymentsTotal,
                        AmountInSpecificMoney: null,
                        DefaultAmount: 0,
                        PaymentMethodId: 0,
                        MoneyId: data.defaultCurrency.MoneyId,
                        PaymentDescription: null,
                        CreatedDate: new Date(),
                        CompanyId: null
                    };
                    // Set all id null
                    POSFactory.setInvoiceId(null);
                    POSFactory.setDraftId(null);

                });
            }
        }

        commonFactory.getHotelCommonInformation(function (data) {
            $scope.decimal = data.Currency.MinorUnit;
            $rootScope.CurrencyMaster = data.Currency;
            Init();
        });

        // reset
        $scope.reset = function () {
            Init();
        }

        //#region IMPLEMENT FILTER LIST 
        $scope.selectedCompanyCityLedger = null;
        $scope.queryCompanySearchCityLedger = queryCompanySearchCityLedger;
        $scope.selectedCompanyChangeCityLedger = selectedCompanyChangeCityLedger;
        $scope.searchCompanyTextChangeCityLedger = searchCompanyTextChangeCityLedger;

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
        }

        function selectedCompanyChangeCityLedger(item) {
            if (item != undefined) {
                $scope.selectedCompanyCityLedger = item;

            } else {
                $scope.selectedCompanyCityLedger = null;
            }

        }

        function searchCompanyTextChangeCityLedger(text) {
            $scope.searchCompanyTextCityLedger = text;
        }

        function createCompanyFilterFor(query) {
            var lowercaseQuery = change_alias(query);
            return function filterFn(item) {
                return (change_alias(item.CompanyName.toLowerCase()).indexOf(lowercaseQuery) >= 0 || change_alias(item.CompanyCode.toLowerCase()).indexOf(lowercaseQuery) >= 0);
            };
        }
        //#endregion

        //#region PROCESS SAVE INVOICE 

        // Click Save Invoice
        $scope.chooseInvoice = function (options) {
            if (options == 0) {
                if ($scope.payment.Amount > 0) {
                    $scope.addPOSPayment();
                }
                $timeout(function () {
                    $scope.processSaveInvoice();
                }, 0);

            } else
                $scope.processSaveInvoiceRoom();
        }

        // map data for Save invoice to Room
        $scope.listServicesTemp = [];
        $scope.mapDataListService = function () {
            var listServicesTemp = [];
            angular.forEach($scope.POSModel.Charges, function (item) {

                var itemSelected = $scope.extraServices.ExtraServiceItems.find(function (ite) {
                    return ite.ExtraServiceItemId == item.Id;
                });
                // sửa lại giá với dịch vụ thay đổi được giá
                if (item.Type === "EXTRA_SERVICE_NO_ITEM") {
                    var _item = {
                        quantity: item.Quantity,
                        item: {
                            ExtraServiceTypeName: "EXTRA_SERVICES",
                            ExtraServiceItemDescription: item.Name,
                            Price: item.Price
                        },
                        ExtraServiceTypeName: "EXTRA_SERVICES"
                    };
                    listServicesTemp.push(_item);
                } else {
                    itemSelected.Price = item.Price;
                    listServicesTemp.push({
                        quantity: item.Quantity,
                        item: itemSelected,
                        ExtraServiceTypeName: itemSelected.ExtraServiceTypeName
                    });
                }

            });

            return listServicesTemp;
        }

        // Save invoice to Room. Move service to Room
        $scope.processSaveInvoiceRoom = function () {
            var _quantity = 0;
            var listItem = $scope.POSModel.Charges;
            for (var idx in listItem) {
                _quantity += parseInt(listItem[idx].Quantity);
            }
            if (_quantity == 0) {
                dialogService.messageBox("ERROR", "AT_LEAST_ONE_ITEM_MUST_EXIST_IN_THE_INVOICE_CHARGES");
                return false;
            }

            // $scope.POSModel.Charges = $scope.rooms.filter(function (item) {
            //     return item.Quantity !== '0';
            // });
            //.Traveller.Fullname;
            $scope.listServicesTemp = $scope.mapDataListService();
            // var itemsTemp = $scope.listServicesTemp;
            $mdDialog.show({
                controller: ProcessSaveInvoiceRoom,
                resolve: {
                    ContactInformation: function () {
                        return $scope.POSModel.ContactInformation;
                    },
                    chargesTotal: function () {
                        return $scope.chargesTotalOriginal;
                    },
                    items: function () {
                        return $scope.listServicesTemp;
                    },
                    roomName: function () {
                        return $scope.rooms.find(function (item) {
                            return item.ReservationRoomId === $scope.RoomInfo.ReservationRoomId
                        }).RoomName;
                    }
                },
                templateUrl: 'views/templates/saveInvoiceRoom.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: null,
                clickOutsideToClose: false,
            })
                .then(function () {

                    var items = $scope.listServicesTemp;
                    // var items = $scope.listServicesTemp;
                    var keys = ["RES_NO", "ROOM", "NOTIFICATION_POST_EXTRASERVICE", "EXTRA_SERVICE", "POS_NOTIFICATION_ADDNEW_INVOICE_MESSAGE", "NOTIFICATION_POST_EXTRASERVICE_TRANFERSROOM"];
                    var languageKeys = {};
                    for (var idx in keys) {
                        languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
                    }
                    if (items.length != 0) {
                        var postItems = {
                            ReservationRoomId: $scope.RoomInfo.ReservationRoomId,
                            description: "",
                            name: "",
                            items: items,
                            languageKeys: languageKeys
                        };
                        var saveItems = loginFactory.securedPostJSON("api/POS/QuickCreateExtraServicetTranfersRoom", postItems);
                        dialogService.toast("ADD_EXTRA_SERVICE_SUCCESSFUL");
                        Init();
                    }
                },
                function () {

                });

            function ProcessSaveInvoiceRoom($scope, $mdDialog, ContactInformation, chargesTotal, items, roomName) {
                $scope._name = roomName;
                $scope.ContactInformation = ContactInformation;
                $scope.chargesTotal = chargesTotal;
                $scope.items = items;
                $scope.ok = function () {
                    $mdDialog.hide();
                }
                $scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
            }

        };

        // Save invoice normal
        $scope.processSaveInvoice = function () {
            var keys = ["POS_NOTIFICATION_ADDNEW_INVOICE_MESSAGE", "NOTIFICATION_POST_EXTRASERVICE_TRANFERSROOM"];
            var languageKeys = {};
            for (var idx in keys) {
                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
            }
            $scope.POSModel.languageKeys = languageKeys;
            if ($scope.POSModel.ContactInformation.Fullname == null || $scope.POSModel.ContactInformation.Fullname.trim() == '') {
                dialogService.messageBox("ERROR", "CUSTOMER_NAME_CAN_NOT_BE_BLANK");
                return false;
            }
            if ($scope.POSModel.Charges == null || $scope.POSModel.Charges.length == 0) {
                dialogService.messageBox("ERROR", "AT_LEAST_ONE_ITEM_MUST_EXIST_IN_THE_INVOICE_CHARGES");
                return false;
            }
            var _invoiceTotal = $scope.invoiceTotal;
            if (_invoiceTotal > 0.000001) {
                dialogService.messageBox("INVALID_INVOICE", "THE_TOTAL_INVOICE_AMOUNT_MUST_BE_EQUAL_TO_ZERO");
                return;
            }
            var _quantity = 0;
            var listItem = $scope.POSModel.Charges;
            for (var idx in listItem) {
                _quantity += parseInt(listItem[idx].Quantity);
            }
            if (_quantity == 0) {
                dialogService.messageBox("ERROR", "AT_LEAST_ONE_ITEM_MUST_EXIST_IN_THE_INVOICE_CHARGES");
                return false;
            }
            $scope.POSModel.Charges = $scope.POSModel.Charges.filter(function (item) {
                return item.Quantity !== '0';
            });

            for (var index in $scope.POSModel.Payments) {
                var payment = $scope.POSModel.Payments[index];
                if (payment.DefaultAmount) {
                    delete payment.DefaultAmount;
                }
                if (payment.SignOfSpecificMoney) {
                    delete payment.SignOfSpecificMoney;
                }
                if (payment.AmountInSpecificMoneyString && payment.AmountInSpecificMoneyString == 0) {
                    delete payment.AmountInSpecificMoneyString;
                }
                if (payment.AmountInSpecificMoney && payment.AmountInSpecificMoney == 0) {
                    payment.AmountInSpecificMoney = null;
                }
            }
            $scope.POSModel.discountReason = $scope.discount.discountReason;
            $mdDialog.show({
                controller: ProcessSaveInvoice,
                resolve: {
                    ContactInformation: function () {
                        return $scope.POSModel.ContactInformation;
                    },
                    chargesTotal: function () {
                        return $scope.chargesTotalOriginal;
                    },
                    discountAmount: function () {
                        return $scope.POSModel.DiscountAmount;
                    },
                    paymentsTotal: function () {
                        return $scope.paymentsTotal;
                    },
                    invoiceTotal: function () {
                        return $scope.invoiceTotal;
                    }
                },
                templateUrl: 'views/templates/saveInvoice.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: null,
                clickOutsideToClose: false,
            })
                .then(function () {
                    var SavePOSInvoice = loginFactory.securedPostJSON("api/POS/SavePOSInvoice", $scope.POSModel);
                    $rootScope.dataLoadingPromise = SavePOSInvoice;
                    SavePOSInvoice.success(function (data) {
                        $location.path("POSInvoiceDetail/" + data);
                    }).error(function (err) {
                        console.log(err);
                    });
                }, function () {

                });

            function ProcessSaveInvoice($scope, $mdDialog, ContactInformation, chargesTotal, discountAmount, paymentsTotal, invoiceTotal) {
                function Init() {
                    $scope.ContactInformation = ContactInformation;
                    $scope.chargesTotal = chargesTotal;
                    $scope.discountAmount = discountAmount;
                    $scope.paymentsTotal = paymentsTotal;
                    $scope.invoiceTotal = invoiceTotal;
                }
                Init();
                $scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
                $scope.save = function () {
                    $mdDialog.hide($scope.title);
                }
            }
        };

        //#endregion


        //Load ExtraServices
        function resolveExtraServices(data) {
            for (var idx in data.ExtraServiceTypes) {
                data.ExtraServiceTypes[idx].IsHide = true;
                var countItem = data.ExtraServiceItems.filter(function (item) {
                    return data.ExtraServiceTypes[idx].ExtraServiceTypeId == item.ExtraServiceTypeId;
                });
                if (countItem.length > 0) {
                    data.ExtraServiceTypes[idx].IsHide = false;
                }
            }


            var arrService = angular.copy(data);
            for (var index in arrService.ExtraServiceItems) {
                if (!arrService.ExtraServiceItems[index].quantity) {
                    arrService.ExtraServiceItems[index].quantity = 0;
                    var fullName = arrService.ExtraServiceItems[index].ExtraServiceItemName.split(' ');
                    var idx = 0;
                    var specialName = "";
                    var fullName2 = "";
                    var fullName3 = "";
                    while (idx < fullName.length) {
                        specialName += fullName[idx].substring(0, 1).toLowerCase();
                        fullName2 += fullName[idx].toLowerCase();
                        fullName3 += change_alias(fullName[idx]).toLowerCase();
                        idx++;
                    }
                    arrService.ExtraServiceItems[index].specialName = change_alias(specialName);
                    var fullName1 = change_alias(arrService.ExtraServiceItems[index].ExtraServiceItemName);
                    arrService.ExtraServiceItems[index].specialName1 = fullName1;
                    arrService.ExtraServiceItems[index].specialName2 = fullName2;
                    arrService.ExtraServiceItems[index].specialName3 = fullName3;
                }
                for (var index2 in arrService.ExtraServiceTypes) {
                    if (arrService.ExtraServiceTypes[index2].ExtraServiceTypeId == arrService.ExtraServiceItems[index].ExtraServiceTypeId) {
                        arrService.ExtraServiceItems[index].ExtraServiceTypeName = arrService.ExtraServiceTypes[index2].ExtraServiceTypeName;
                        break;
                    }
                }
            }

            $scope.extraServices = arrService;

        }
        //get value search

        // Calculate money
        $scope.totalInvoice = function () {
            $timeout(function () {
                if ($scope.defaultCurrency == undefined) return 0;

                var paymentsTotal = 0;
                var chargesTotal = 0;
                var invoiceTotal = 0;
                $scope.chargesTotalOriginal = 0;
                if ($scope.POSModel.Payments != null && $scope.POSModel.Payments.length > 0) {
                    for (var index in $scope.POSModel.Payments) {
                        paymentsTotal += $scope.POSModel.Payments[index].Amount;
                    }
                }

                if ($scope.POSModel.Charges != null && $scope.POSModel.Charges.length > 0) {
                    for (var index in $scope.POSModel.Charges) {
                        chargesTotal += $scope.POSModel.Charges[index].Quantity * $scope.POSModel.Charges[index].Price;
                    }
                    $scope.chargesTotalOriginal = angular.copy(chargesTotal);
                }
                // var discountAmount = $scope.POSModel.DiscountFlat; //+ $scope.POSModel.DiscountPercentage * $scope.chargesTotal / 100;
                // $scope.POSModel.DiscountAmount = discountAmount;
                if ($scope.payment.MoneyId != $scope.defaultCurrency.MoneyId) {
                    if ($scope.oldMoney != null && $scope.currentMoney != null && $scope.oldMoney != undefined && $scope.currentMoney != undefined) {
                        invoiceTotal = chargesTotal - $scope.POSModel.DiscountAmount - paymentsTotal;
                        var amountTemp = angular.copy(invoiceTotal);
                        $timeout(function () {
                            $scope.payment.AmountTemp = amountTemp;
                            $scope.payment.Amount = amountTemp * $scope.oldMoney.ExchangeRate / $scope.currentMoney.ExchangeRate;
                            if ($scope.payment.Amount < 0.001) {
                                $scope.payment.Amount = amountTemp;
                                $scope.payment.MoneyId = $scope.defaultCurrency.MoneyId;
                            }
                            $scope.payment.AmountInSpecificMoney = $scope.payment.Amount;
                            $scope.payment.DefaultAmount = amountTemp;
                        }, 0);
                    }
                }
                invoiceTotal = $scope.chargesTotalOriginal - $scope.POSModel.DiscountAmount - paymentsTotal;
                $scope.payment.Amount = angular.copy(invoiceTotal);
                $scope.payment.AmountTemp = angular.copy(invoiceTotal);
                $scope.paymentsTotal = angular.copy(paymentsTotal);
                $scope.invoiceTotal = angular.copy(invoiceTotal);
                $scope.chargesTotal = angular.copy(chargesTotal);
            }, 0);
        };

        $scope.addExtraServices = function (item, index) {
            if (item != null && index != null) {
                if ($scope.extraServices.ExtraServiceItems != null) {
                    if (item.quantity == 0)
                        item.quantity = 1;
                    var itemAdded = item;
                    var chargeItem = {
                        Id: itemAdded.ExtraServiceItemId,
                        Name: itemAdded.ExtraServiceItemName,
                        Quantity: itemAdded.quantity,
                        Price: itemAdded.Price,
                        Type: 'EXTRA_SERVICE_ITEM',
                        IsChangeable: itemAdded.IsChangeable
                    };
                    var itemFound = _.findWhere($scope.POSModel.Charges, {
                        Id: chargeItem.Id
                    });
                    if (itemFound == null)
                        $scope.POSModel.Charges.push(chargeItem);
                    else {
                        itemFound.Quantity++;
                    }
                    $scope.changeAmount();
                }
            } else {
                if ($scope.extraService_NoItem.RoomExtraServiceDescription != null && $scope.extraService_NoItem.Amount != null) {
                    var chargeItem = {
                        Name: $scope.extraService_NoItem.RoomExtraServiceDescription,
                        Quantity: $scope.extraService_NoItem.Quantity,
                        Price: $scope.extraService_NoItem.Amount,
                        Type: 'EXTRA_SERVICE_NO_ITEM'
                    };
                    $scope.POSModel.Charges.push(chargeItem);
                    $scope.extraService_NoItem = {
                        RoomExtraServiceDescription: null,
                        Quantity: 1,
                        Amount: null
                    };
                    $scope.changeAmount();
                }
            }
        }

        // convert sang chữ không dấu
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
        }

        var timeAdd = 0;
        $scope.mouseDownAdd = function (item) {
            timeAdd = setInterval(function () {
                $scope.addServiceToList(item);
                $scope.changePrice();
            }, 150);
        }

        $scope.mouseUpAdd = function () {
            clearInterval(timeAdd);
        }

        $scope.mouseLeaveAdd = function () {
            clearInterval(timeAdd);
        }

        var timeSub = 0;
        $scope.mouseDownSub = function (item) {
            timeSub = setInterval(function () {
                $scope.subServiceToList(item);
                $scope.changePrice();
            }, 150);
        }

        $scope.mouseUpSub = function () {
            clearInterval(timeSub);
        }

        $scope.mouseLeaveSub = function () {
            clearInterval(timeSub);
        }

        $scope.changePrice = function (item) {
            $scope.totalInvoice();
        }

        $scope.addServiceToList = function (item) {
            item.Quantity++;
            $scope.changeAmount();
        }

        $scope.subServiceToList = function (item) {
            if (item.Quantity > 1) {
                item.Quantity--;
                if (item.Quantity <= 0) {
                    var index = $scope.POSModel.Charges.indexOf(item);
                    $scope.POSModel.Charges.splice(index, 1);
                }
                $scope.changeAmount();
            }
        }

        $scope.removeExtraServiceFromItemList = function (item) {
            console.log(item, $scope.listServicesTemp, "my my");
            if (item.Type == 'EXTRA_SERVICE_ITEM') {
                $scope.POSModel.Charges = _.without($scope.POSModel.Charges, _.findWhere($scope.POSModel.Charges, {
                    Id: item.Id
                }));
            } else {
                $scope.POSModel.Charges = _.without($scope.POSModel.Charges, _.findWhere($scope.POSModel.Charges, {
                    Name: item.Name,
                    Quantity: item.Quantity,
                    Price: item.Price
                }));
            }
            $scope.changeAmount();
        }

        $scope.removePOSPayment = function (payment) {
            $scope.POSModel.Payments = _.without($scope.POSModel.Payments, _.findWhere($scope.POSModel.Payments, {
                CreatedDate: payment.CreatedDate,
                Amount: payment.Amount
            }));
            if ($scope.payment.MoneyId == $scope.defaultCurrency.MoneyId) {
                $scope.totalInvoice();
            } else {
                if ($scope.oldMoney != null && $scope.currentMoney != null && $scope.oldMoney != undefined && $scope.currentMoney != undefined) {
                    $scope.payment.MoneyId = $scope.defaultCurrency.MoneyId;
                    var amountTemp = angular.copy($scope.invoiceTotal);
                    $timeout(function () {
                        $scope.payment.Amount = amountTemp * $scope.oldMoney.ExchangeRate / $scope.currentMoney.ExchangeRate;
                        $scope.payment.AmountInSpecificMoney = $scope.payment.Amount;
                        $scope.payment.DefaultAmount = amountTemp;
                        $scope.totalInvoice();
                    }, 0);
                }
            }
        }

        $scope.addPOSPayment = function () {
            var total = 0;
            if ($scope.payment.MoneyId == $scope.defaultCurrency.MoneyId) {
                total = $scope.payment.AmountTemp;
            } else {
                total = $scope.payment.AmountInSpecificMoney;
            } 
            if ($scope.payment.Amount == 0 || parseFloat(total) == 0 || isNaN(parseFloat(total))) {
                dialogService.messageBox("INVALID_PAYMENT_AMOUNT", "THE_PAYMENT_AMOUNT_MUST_BE_NUMERIC_AND_GREATER_THAN_ZERO");
                return;
            }
            if ($scope.payment.CreatedDate == null) {
                dialogService.messageBox("INVALID_PAYMENT_CREATED_DATE", "THE_PAYMENT_CREATED_DATE_CAN_NOT_BE_EMPTY");
                return;
            }

            if ($scope.payment.PaymentMethodId == 4 && ($scope.selectedCompanyCityLedger == null || $scope.selectedCompanyCityLedger.CompanyId == null)) {
                dialogService.messageBox("INVALID_CITY_LEDGER", "PLEASE_SELECT_A_CITY_LEDGER");
                return;
            }
            //thanh toán quá số tiền
            var inputPayment = $scope.payment.Amount;
            var newp = parseFloat(total.toFixed(2));
            var newp2 = parseFloat(inputPayment);
            if (newp2 - newp > (1 + $scope.decimals*10 ) ) {
                dialogService.messageBox("INVALID_PAYMENT_AMOUNT", "THE_PAYMENT_AMOUNT_IS_NOT_VALID");
                return;
            }

            var paymentTemp = angular.copy($scope.payment);

            if ($scope.POSModel.Payments.length == 0) {
                $scope.chargesTotalOriginal = angular.copy($scope.chargesTotal);
            }

            if ($scope.selectedCompanyCityLedger != null && $scope.selectedCompanyCityLedger != undefined) {
                paymentTemp.CompanyId = $scope.selectedCompanyCityLedger.CompanyId;
            }
            console.log($scope.payment.MoneyId, $scope.defaultCurrency.MoneyId, $scope.payment, "leo nguyen hello");
            if ($scope.payment.MoneyId == $scope.defaultCurrency.MoneyId) {
                paymentTemp.AmountInSpecificMoney = null;
                $scope.POSModel.Payments.push(paymentTemp);
                $scope.totalInvoice();
            } else {
                if ($scope.oldMoney != null && $scope.currentMoney != null && $scope.oldMoney != undefined && $scope.currentMoney != undefined) {
                    var paymentTempAmount = angular.copy(paymentTemp.Amount);
                    paymentTemp.Amount = paymentTempAmount * $scope.currentMoney.ExchangeRate;
                    paymentTemp.AmountInSpecificMoney = paymentTempAmount;
                    paymentTemp.AmountInSpecificMoneyString = $filter('currency')(paymentTempAmount, $scope.currentMoney.MoneyName, $scope.currentCurrency.MinorUnit);
                    console.log(paymentTemp, "leo nguyen hello222");
                    $scope.POSModel.Payments.push(paymentTemp);
                    $scope.totalInvoice();
                    sMoneyId
                    $timeout(function () {
                        var amountTemp = angular.copy($scope.invoiceTotal);

                        var money = amountTemp / $scope.currentMoney.ExchangeRate;
                        if (isNaN(money)) {
                            $scope.payment.Amount = 0;
                            $scope.payment.AmountTemp = 0
                        } else {
                            $scope.payment.Amount = money;
                        }
                        $scope.payment.AmountTemp = amountTemp;
                        $scope.payment.AmountInSpecificMoney = $scope.payment.Amount;
                        $scope.payment.DefaultAmount = amountTemp;

                        $scope.totalInvoice();
                    }, 0);
                }
            }

        }

        $scope.resetPaymentSetting = function () {
            $scope.payment.MoneyId = $scope.defaultCurrency.MoneyId;
            $scope.payment.PaymentMethodId = _.filter($scope.paymentMethods, function (method) {
                return method.PaymentMethodName.toLowerCase() == 'cash'
            })[0].PaymentMethodId;;
            $scope.decimals = $scope.defaultDecimal;
        };

        $scope.$watchCollection('POSModel.QuantityAllListServices', function (newValues, oldValues) {
            $scope.totalInvoice();
        });
        $scope.decimalEdit = $scope.defaultDecimal;
        $scope.$watchCollection("payment.MoneyId", function (newValues, oldValues) {
            if (newValues && oldValues) {
                if (newValues == $scope.defaultCurrency.MoneyId) {
                    $scope.decimalEdit = $scope.defaultDecimal;
                    $scope.totalInvoice();
                } else {
                    var amountTemp = angular.copy($scope.payment.AmountTemp);
                    var oldMoney = _.filter($scope.currencies, function (item) {
                        //return item.MoneyId == oldValues;
                        return item.MoneyId == $scope.defaultCurrency.MoneyId;
                    })[0];
                    $scope.oldMoney = oldMoney;
                    var currentMoney = _.filter($scope.currencies, function (item) {
                        return item.MoneyId == newValues;
                    })[0];
                    $scope.currentMoney = currentMoney;
                    $scope.currentCurrency = _.filter($scope.currenciesISO, function (item) {
                        return item.CurrencyId == currentMoney.CurrencyId;
                    })[0];
                    $scope.decimalEdit = $scope.currentCurrency.MinorUnit;
                    $timeout(function () {
                        $scope.payment.Amount = amountTemp * oldMoney.ExchangeRate / currentMoney.ExchangeRate;

                        var amount = $scope.payment.Amount;
                        if (amount.toFixed(2) == 0) {
                            $scope.payment.Amount = amountTemp;
                            $scope.payment.MoneyId = $scope.defaultCurrency.MoneyId;
                        } else {
                            $scope.payment.AmountInSpecificMoney = (newValues != $scope.defaultCurrency.MoneyId) ? angular.copy($scope.payment.Amount) : null;

                            $scope.payment.DefaultAmount = newValues != $scope.defaultCurrency.MoneyId ? amountTemp : 0;
                            if (newValues != $scope.defaultCurrency.MoneyId) {
                                $scope.payment.AmountInSpecificMoney = angular.copy($scope.payment.Amount);
                                $scope.payment.SignOfSpecificMoney = $scope.currentCurrency.AlphabeticCode;
                            }
                        }
                    }, 0);
                }
            }
        }, true);
    }
]);