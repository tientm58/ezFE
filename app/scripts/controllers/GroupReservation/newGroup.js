ezCloud.controller('NewGroupController', ['$scope', '$rootScope', '$state', 'dialogService', '$localStorage', 'loginFactory', '$mdDialog', '$mdStepper', 'groupReservationFactory', '$timeout', '$filter', '$mdMedia', 'SharedFeaturesFactory', function ($scope, $rootScope, $state, dialogService, $localStorage, loginFactory, $mdDialog, $mdStepper, groupReservationFactory, $timeout, $filter, $mdMedia, SharedFeaturesFactory) {
    function InitGroup() {
        jQuery(document).unbind('keydown');
        $scope.alternative = $mdMedia('xs');
        $scope.IsAllBreakfast = true;
        $scope.nights = 0;
        $scope.decimal = $rootScope.decimals;
        $scope.ListAvailability = [];
        $scope.RoomSelected = [];
        $scope.RoomSelectedView = [];
        $scope.DirectRoomNote = false;
        $scope.RoomSelectedRemain = [];
        $scope.DateTimePickerOption = {
            format: 'dd/MM/yyyy HH:mm'
        };
        $scope.DatePickerOption = {
            format: 'dd/MM/yyyy'
        };

        var EzModulesActive = $rootScope.EzModulesActive;
        $scope.isUsePassport = function isUsePassport() {
            var PassportModule = _.find(EzModulesActive, function (item) {
                return item.ModuleCode === "PASSPORT";
            })
            return PassportModule != null ? true : false;
        }

        function IsUseTimeInOutPrivate(arrivalDate, departureDate) {
            if ($localStorage.TimeInOutPrivate != null && $localStorage.TimeInOutPrivate != undefined) {
                if ($localStorage.TimeInOutPrivate.UseTimeInOutPrivate) {
                    var timeIn = angular.copy($localStorage.TimeInOutPrivate.TimeInPrivate);
                    timeIn = timeIn.split(':');
                    var timeOut = angular.copy($localStorage.TimeInOutPrivate.TimeOutPrivate);
                    timeOut = timeOut.split(':');
                    //
                    arrivalDate.setHours(timeIn[0]);
                    arrivalDate.setMinutes(timeIn[1]);
                    arrivalDate.setSeconds(0);
                    arrivalDate.setMilliseconds(0);
                    departureDate.setHours(timeOut[0]);
                    departureDate.setMinutes(timeOut[1]);
                    departureDate.setSeconds(0);
                    departureDate.setMilliseconds(0);
                    console.log('UseTimeInOutPrivate', arrivalDate, departureDate);
                }
            }
            return [arrivalDate, departureDate];
        };
        var startTmp = new Date();
        startTmp.setSeconds(0);
        startTmp.setMilliseconds(0);
        var endTmp = addDays(new Date(), 1);
        endTmp.setSeconds(0);
        endTmp.setMilliseconds(0);
        var DateTmp = IsUseTimeInOutPrivate(new Date(), addDays(new Date(), 1));
        $scope.currentDay = DateTmp[0];
        $scope.fromString = DateTmp[0].format('dd/mm/yyyy HH:MM');
        $scope.toString = DateTmp[1].format('dd/mm/yyyy HH:MM');
        //
        $scope.search = {
            RoomTypeId: 0,
            From: DateTmp[0],
            To: DateTmp[1]
        };
        $scope.$watch('search.From', function (newValues, oldValues) {
            if (newValues != null && oldValues != null) {
                if (newValues.getTime() >= $scope.search.To.getTime()) {
                    var newDepartureDate = addDays(newValues, 1);
                    newDepartureDate.setHours($scope.search.To.getHours());
                    newDepartureDate.setMinutes($scope.search.To.getMinutes());
                    $scope.search.To = newDepartureDate;
                }
            }
        });
        $scope.Reservation = {
            Color: '#43A047',
            Note: null,
            ReservationCode: ''
        };
        $scope.Leader = {
            TravellerId: 0,
            Gender: 0
        };
        $scope.paymentList = [];
        $scope.deposit = [];
        $scope.Payments = [];
        groupReservationFactory.getGroupInformation(function (data) {
            console.log('Group', data);
            $scope.roomTypes = data.roomTypes;
            $scope.countries = data.countries;
            var defaultCountry = _.filter($scope.countries, function (item) {
                return item.CountryCode.toLowerCase() == "vn";
            });

            if ($scope.countries !== null && defaultCountry !== null && defaultCountry[0] !== null && defaultCountry[0].CountryId !== null && $scope.countries.length > 0)

                $scope.selectedCountries = _.filter($scope.countries, function (item) {
                    return item.CountryId == defaultCountry[0].CountryId;
                })[0];

            $scope.queryCountriesSearch = queryCountriesSearch;
            $scope.selectedCountriesChange = selectedCountriesChange;
            $scope.searchCountriesTextChange = searchCountriesTextChange;
            //Companies
            $scope.companyList = data.companys;
            //Sources + filter default WALKIN
            $scope.sourceList = data.source;
            $scope.selectedSource = _.isArray($scope.sourceList) && !_.isEmpty($scope.sourceList) ? _.find($scope.sourceList, function (source) {
                return source['ShortCode'] === 'WALKIN'
            }) : null;
            //Markets + filter default ASIA
            $scope.marketList = data.markets;
            $scope.selectedMarket = _.isArray($scope.marketList) && !_.isEmpty($scope.marketList) ? _.find($scope.marketList, function (source) {
                return source['MarketCode'] === 'ASIA'
            }) : null;;
            $scope.customerList = data.travellers;
            $scope.paymentMethods = data.paymentMethods;
            $scope.defaultCurrency = data.defaultCurrency;
            $scope.currencies = data.currencies;
            $scope.currenciesISO = data.currenciesISO;
            for (var index in $scope.paymentMethods) {
                if ($scope.paymentMethods[index].PaymentMethodName.toLowerCase() === "cash") {
                    $scope.defaultPaymentMethod = $scope.paymentMethods[index];
                    break;
                }
            };
            $scope.deposit = {
                PaymentMethodId: $scope.defaultPaymentMethod.PaymentMethodId,
                MoneyId: $scope.defaultCurrency.MoneyId,
                PaymentTypeName: "DEPOSIT"
            };
            $scope.$watchCollection('deposit.MoneyId', function (newValues, oldValues) {
                if (newValues == oldValues) return;
                if (newValues && oldValues) {
                    var amountTemp = angular.copy($scope.deposit.Amount);
                    var oldMoney = _.find($scope.currencies, function (item) {
                        return item.MoneyId == oldValues;
                    });
                    var currentMoney = _.find($scope.currencies, function (item) {
                        return item.MoneyId == newValues;
                    });
                    var currentCurrency = _.filter($scope.currenciesISO, function (item) {
                        return item.CurrencyId == currentMoney.CurrencyId;
                    })[0];
                    $scope.decimal = currentCurrency.MinorUnit;
                    $timeout(function () {
                        $scope.deposit.Amount = amountTemp * oldMoney.ExchangeRate / currentMoney.ExchangeRate;

                        // var amount = $scope.deposit.Amount;
                        // if (amount.toFixed(2) == 0) {
                        //     $scope.deposit.Amount = amountTemp;
                        //     $scope.deposit.MoneyId = $scope.defaultCurrency.MoneyId;
                        // } else {
                        //     $scope.deposit.AmountInSpecificMoney = (newValues != $scope.defaultCurrency.MoneyId) ? angular.copy($scope.payment.Amount) : null;

                        //     $scope.deposit.DefaultAmount = newValues != $scope.defaultCurrency.MoneyId ? amountTemp : 0;
                        //     if (newValues != $scope.defaultCurrency.MoneyId) {
                        //         $scope.deposit.AmountInSpecificMoney = angular.copy($scope.deposit.Amount);
                        //         $scope.deposit.SignOfSpecificMoney = currentCurrency.AlphabeticCode;
                        //     }
                        // }
                    }, 0);
                }
            }, true);
        });
        //
        $scope.selectedItem = null;
        $scope.searchText = "";

        $scope.selectedCompany = null;
        $scope.queryCompanySearch = queryCompanySearch;
        $scope.selectedCompanyChange = selectedCompanyChange;
        $scope.searchCompanyTextChange = searchCompanyTextChange;

        $scope.querySourceSearch = querySourceSearch;
        $scope.selectedSourceChange = selectedSourceChange;
        $scope.searchSourceTextChange = searchSourceTextChange;

        $scope.queryMarketSearch = queryMarketSearch;
        $scope.selectedMarketChange = selectedMarketChange;
        $scope.searchMarketTextChange = searchMarketTextChange;
        //
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
        }

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
        }

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
        }

        function searchCompanyTextChange(text) {
            $scope.searchCompanyText = text;
        }

        function selectedCompanyChange(item) {
            console.log("ITEM", item);
            if (item !== undefined) {
                $scope.selectedCompany = item;
                var selectedSourceTemp = _.filter($scope.sourceList, function (item) {
                    return item.SourceId && item.SourceId == $scope.selectedCompany.SourceId;
                });
                if (selectedSourceTemp.length > 0)
                    $scope.selectedSource = selectedSourceTemp[0];
                console.log("SOURCE LIST", item, $scope.selectedSource, $scope.sourceList);
            } else {
                $scope.selectedCompany = null;
            }
        }

        function searchSourceTextChange(text) {}

        function selectedSourceChange(item) {
            $scope.selectedSource = item;
        }

        function searchMarketTextChange(text) {}

        function selectedMarketChange(item) {
            $scope.selectedMarket = item;
        }

        function createCompanyFilterFor(query) {
            var lowercaseQuery = change_alias(query);
            return function filterFn(item) {
                return (change_alias(item.CompanyName.toLowerCase()).indexOf(lowercaseQuery) >= 0 || change_alias(item.CompanyCode.toLowerCase()).indexOf(lowercaseQuery) >= 0);
            };
        }

        function createSourceFilterFor(query) {
            var lowercaseQuery = change_alias(query);
            return function filterFn(item) {
                return (change_alias(item.SourceName).indexOf(lowercaseQuery) >= 0 || change_alias(item.ShortCode.toLowerCase()).indexOf(lowercaseQuery) >= 0);
            };
        }

        function createMarketFilterFor(query) {
            var lowercaseQuery = change_alias(query);
            return function filterFn(item) {
                return (change_alias(item.MarketName).indexOf(lowercaseQuery) >= 0 || change_alias(item.MarketCode.toLowerCase()).indexOf(lowercaseQuery) >= 0);
            };
        }

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
        $scope.inProgressDeposit = false;
    };
    InitGroup();

    function searchTextChange(text) {
        console.log("GET THERE", text);
        $scope.customer.Fullname = text;
    };
    $scope.selectedItemChange = function (item, room) {
        console.log(item, room);
        console.log('Item changed to ' + JSON.stringify(item));
        console.log('Search Text', $scope.searchText);
        if (item != undefined) {
            room.Travellers.Fullname = item.Fullname;
            room.Travellers.TravellerId = item.TravellerId == null ? 0 : item.TravellerId;
            room.Travellers.IdentityNumber = item.IdentityNumber == null ? null : item.IdentityNumber;
        };
    };
    $scope.CheckAllBreakfast = function (IsAllBreakfast) {
        if (IsAllBreakfast == true && $scope.RoomSelected.length > 0) {
            angular.forEach($scope.RoomSelected, function (arr) {
                arr.IsBreakfast = true;
            });
        } else if (IsAllBreakfast == false && $scope.RoomSelected.length > 0) {
            angular.forEach($scope.RoomSelected, function (arr) {
                arr.IsBreakfast = false;
            });
        }
    };
    $scope.SetLeader = function (index) {
        if (index >= 0) {
            angular.forEach($scope.RoomSelected, function (arr, current_index) {
                if (current_index != index) {
                    arr.IsGroupMaster = false;
                    arr.Travellers = null;
                } else if (current_index == index) {
                    arr.Fullname = $scope.Leader.Fullname;
                    arr.Travellers = {
                        Fullname: $scope.Leader.Fullname,
                        IdentityNumber: $scope.Leader.IdentityNumber == null ? null : $scope.Leader.IdentityNumber,
                        TravellerId: $scope.Leader.TravellerId == null ? 0 : $scope.Leader.TravellerId,
                        CountryId: $scope.Leader.CountryId == null ? 0 : $scope.Leader.CountryId,
                        Address: $scope.Leader.Address == null ? null : $scope.Leader.Address,
                        Birthday: $scope.Leader.Birthday == null ? null : $scope.Leader.Birthday,
                        Email: $scope.Leader.Email == null ? null : $scope.Leader.Email,
                        Gender: $scope.Leader.Gender == null ? 0 : $scope.Leader.Gender,
                        Mobile: $scope.Leader.Mobile == null ? null : $scope.Leader.Mobile,
                        Note: $scope.Leader.Note == null ? null : $scope.Leader.Note
                    };
                }
            });
        }
        RebuildSelectedRoom();
    };
    $scope.searchCustomerLeader = function () {
        if ($scope.Leader.Fullname == null || $scope.Leader.Fullname.length < 2) {
            dialogService.messageBox("WARNING", "FULL_NAME_MUST_LESS_TWO_WORD");
            return;
        }
        $mdDialog.show({
            controller: SearchSharerLeaderController,
            resolve: {
                countries: function () {
                    return $scope.countries
                },
                fullname: function () {
                    return $scope.Leader.Fullname
                }
            },
            templateUrl: 'views/templates/SearchSharer.tmpl.html',
            parent: angular.element(document.body),
            // targetEvent: ev,
        }).then(function (SharerModel) {
            if (SharerModel) {
                console.log('search sharer', SharerModel);
                if ($scope.countries !== null && $scope.countries.length > 0 && SharerModel.CountryId !== null)
                    $scope.selectedCountries = _.filter($scope.countries, function (citem) {
                        return citem.CountryId == SharerModel.CountryId;
                    })[0];
                $scope.Leader = SharerModel;
            }
        });

        function SearchSharerLeaderController($scope, $mdDialog, loginFactory, frontOfficeFactory, countries, fullname) {
            $scope.sharer = {};
            $scope.Countries = countries;
            $scope.processSearch = function () {
                if ($scope.selectedCountries == null) {
                    $scope.search.CountryId = 0;
                } else {
                    $scope.search.CountryId = $scope.selectedCountries.CountryId;
                }
                console.log('scope.search:', $scope.search);
                frontOfficeFactory.processSearchGuestDatabase($scope.search, function (data) {
                    console.log("SEARCH RESULT", data);
                    $scope.searchResult = data;
                });
            }

            function Init() {
                $scope.createDateFromString = new Date().format('dd/mm/yyyy');
                $scope.createDateToString = addDays(new Date(), 1).format('dd/mm/yyyy');
                $scope.search = {
                    ReservationRoomId: null,
                    SearchType: "GUEST_DATABASE",
                    GuestName: fullname,
                    CountryId: 0,
                    Phone: null,
                    IdentityNumber: null,
                    CreateDateIncluded: true,
                    createDateFrom: new Date(),
                    createDateTo: addDays(new Date(), 1),
                };
                $scope.DatePickerOption = {
                    format: 'dd/MM/yyyy'
                };
                $scope.countries = countries;
                $scope.queryCountriesSearch = queryCountriesSearch;
                $scope.selectedCountriesChange = selectedCountriesChange;
                $scope.searchCountriesTextChange = searchCountriesTextChange;
                $scope.processSearch();
            }
            Init();

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
                /*console.log("TEXT", text);
                if (!text || text.trim() ===''){
                    console.log("TEXT", text);
                    $scope.selectedCompany = null;
                }*/
            }
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
            $scope.SelectGuest = function (Guest) {
                $mdDialog.hide(Guest);
            }
        };
    }
    $scope.searchCustomer = function (room) {
        $mdDialog.show({
            controller: SearchSharerController,
            resolve: {
                countries: function () {
                    return $scope.countries
                }
            },
            templateUrl: 'views/templates/SearchSharer.tmpl.html',
            parent: angular.element(document.body),
            // targetEvent: ev,
        }).then(function (SharerModel) {
            if (SharerModel) {
                console.log('search sharer', SharerModel);
                room.Travellers = SharerModel;
            }
        })

        function SearchSharerController($scope, $mdDialog, loginFactory, frontOfficeFactory, countries) {
            $scope.sharer = {};

            function Init() {
                $scope.createDateFromString = new Date().format('dd/mm/yyyy');
                $scope.createDateToString = addDays(new Date(), 1).format('dd/mm/yyyy');
                $scope.search = {
                    ReservationRoomId: null,
                    SearchType: "GUEST_DATABASE",
                    GuestName: null,
                    Phone: null,
                    CountryId: 0,
                    IdentityNumber: null,
                    CreateDateIncluded: true,
                    createDateFrom: new Date(),
                    createDateTo: addDays(new Date(), 1),
                };
                $scope.DatePickerOption = {
                    format: 'dd/MM/yyyy'
                };
                $scope.countries = countries;

                $scope.queryCountriesSearch = queryCountriesSearch;
                $scope.selectedCountriesChange = selectedCountriesChange;
                $scope.searchCountriesTextChange = searchCountriesTextChange;
            }
            Init();

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
                /*console.log("TEXT", text);
                if (!text || text.trim() ===''){
                    console.log("TEXT", text);
                    $scope.selectedCompany = null;
                }*/
            }
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
            $scope.processSearch = function () {
                if ($scope.selectedCountries == null) {
                    $scope.search.CountryId = 0;
                } else {
                    $scope.search.CountryId = $scope.selectedCountries.CountryId;
                }
                console.log('scope.search:', $scope.search);
                frontOfficeFactory.processSearchGuestDatabase($scope.search, function (data) {
                    console.log("SEARCH RESULT", data);
                    $scope.searchResult = data;
                });
            }
            $scope.SelectGuest = function (Guest) {
                $mdDialog.hide(Guest);
            }
        };
    };

    //Step 1: Create new group reservation
    function resolveListAvailability(ListAvailability) {
        angular.forEach(ListAvailability, function (value, key) {
            angular.forEach($scope.RoomSelected, function (value2, key) {
                if (value.RoomTypeId == value2.RoomTypeId &&
                    CheckTimeRangeConflict(value2.ArrivalDate, value2.DepartureDate, value.ArrivalDate, value.DepartureDate))
                    value.RoomAvailability -= 1;
            })
        });
    }

    function CheckTimeRangeConflict(start_1, end_1, start_2, end_2) {
        return (start_1 < end_2 && start_2 <= end_1);
    }
    $scope.SearchAvailability = function () {
        if (_.isNull($scope.search.From) || _.isNull($scope.search.To)) {
            var Message = $filter("translate")("PLEASE_SELECT_ARRIVAL_OR_DEPARTURE_DATE");
            dialogService.messageBox("WARNING", Message);
            return;
        };
        if ($scope.search.From > $scope.search.To) {
            var Message = $filter("translate")("PLEASE_SELECT_A_VALID_DATE_TO_PEFORM_RESERVATION_ACTION");
            dialogService.messageBox("WARNING", Message);
            return;
        }
        var ListAvailabilityTmp = groupReservationFactory.GetAvailabilityGroupData($scope.search);
        ListAvailabilityTmp.then(function (data) {
            if (data != -1) {
                console.log('ListAvailability', data);
                resolveListAvailability(data);
                $scope.ListAvailability = data;
                for(var i in $scope.ListAvailability){
                    if(!$scope.ListAvailability[i].DirectRooms)
                        $scope.ListAvailability[i].DirectRooms = $scope.ListAvailability[i].RoomAvailability - $scope.ListAvailability[i].BreakRooms;
                }
            } else {
                dialogService.messageBox("ERROR_ROOMS_AVAILABILITY");
            }
        });
    };
    $scope.addRoom = function (roomType) {
        var roomSelected = angular.copy($scope.RoomSelected);
        if (roomType.RoomAvailability > 0) {
            var markIndex = 0;
            for (var i = 0; i < roomType.Quantity; i++) {
                markIndex = i + 1;
                var nights = CalculateDayBetween(roomType.ArrivalDate, roomType.DepartureDate);
                var avaiNow = roomType.RoomAvailability - i - 1;
                if (avaiNow < 0) {
                    markIndex--;
                    break;
                }
                //var breakRoom = roomType.BreakRooms > avaiNow ? (roomType.BreakRooms - avaiNow) : 0;
                var roomTemp = {
                    ArrivalDate: roomType.ArrivalDate,
                    DepartureDate: roomType.DepartureDate,
                    Price: roomType.Price,
                    RoomPriceId: roomType.RoomPriceId,
                    RoomTypeCode: roomType.RoomTypeCode,
                    RoomTypeName: roomType.RoomTypeName,
                    RoomTypeId: roomType.RoomTypeId,
                    Adults: parseInt(roomType.DefaultAdults),
                    Child: parseInt(roomType.DefaultChilds),
                    Travellers: null,
                    IsBreakfast: true,
                    IsGroupMaster: false,
                    Nights: nights,
                    RoomRemain: roomType.RoomAvailability - markIndex,
                    BreakRoomsDefault: roomType.BreakRooms,
                    BreakRooms: 0
                };
                roomSelected.push(roomTemp);
            };
            roomType.RoomAvailability -= markIndex;
        }
        $scope.RoomSelected = roomSelected;
        RebuildSelectedRoom();
    };
    $scope.removeRoom = function (room, type) {
        var isDeleteMaster = false;
        var listRoomTypeCount = new Array;
        var isRemoveSingle = false;
        var listAvaiRoom = angular.copy($scope.ListAvailability);
        var roomSelected = angular.copy($scope.RoomSelected);
        if (type == 'PAYMENT') {
            for (var i = 0; i < roomSelected.length; i++) {
                if (!_.contains(listRoomTypeCount, roomSelected[i].RoomTypeId)) listRoomTypeCount.push(roomSelected[i].RoomTypeId);
            }
            if (listRoomTypeCount.length <= 1 && $scope.RoomSelectedView.length == 1) {
                dialogService.messageBox("ERROR", "CANNOT_DELETE_ROOM_GROUP");
                return;
            }
        } else if (type == 'SINGLE') {
            isRemoveSingle = true;
        }
        if (roomSelected.length > 0) {
            confirm = dialogService.confirm("CONFIRM", "DO_YOU_REALLY_WANT_TO_DELETE_ROOM");
            confirm.then(function () {
                if (room.IsGroupMaster == true) {
                    var Message = $filter("translate")("CANNOT_REMOVE_RESERVATION_HAVE_GUEST_IS_LEADER_PLEASE_SELECT_ANOTHER_RESERVATION");
                    dialogService.messageBox("WARNING", Message);
                    return;
                }
                var count = 0;
                for (var i = roomSelected.length - 1; i >= 0; i--) {
                    if (roomSelected[i].RoomTypeId == room.RoomTypeId &&
                        roomSelected[i].ArrivalDate.getTime() == room.ArrivalDate.getTime() &&
                        roomSelected[i].DepartureDate.getTime() == room.DepartureDate.getTime() &&
                        roomSelected[i].Adults == room.Adults && roomSelected[i].Child == room.Child) {
                        if (!isDeleteMaster && roomSelected[i].IsGroupMaster) {
                            isDeleteMaster = true;
                        } else {
                            roomSelected.splice(i, 1);
                            count++;
                        }
                        if (isRemoveSingle) break;
                    }
                }
                for (var idx in listAvaiRoom) {
                    if (listAvaiRoom[idx].RoomTypeId == room.RoomTypeId &&
                        listAvaiRoom[idx].ArrivalDate.getTime() == room.ArrivalDate.getTime() &&
                        listAvaiRoom[idx].DepartureDate.getTime() == room.DepartureDate.getTime()) {
                        listAvaiRoom[idx].RoomAvailability += count;
                        break;
                    }
                }
                $scope.RoomSelected = roomSelected;
                $scope.ListAvailability = listAvaiRoom;
                RebuildSelectedRoom();
                if (isDeleteMaster) {
                    var Message = $filter("translate")("CANNOT_REMOVE_RESERVATION_HAVE_GUEST_IS_LEADER_PLEASE_SELECT_ANOTHER_RESERVATION");
                    dialogService.messageBox("WARNING", Message);
                }
            });
        }
    };
    $scope.addRoomList = function (room) {
        if (room.RoomRemain > 0) {
            var listAvaiRoom = angular.copy($scope.ListAvailability);
            var roomTemp = {
                ArrivalDate: room.ArrivalDate,
                DepartureDate: room.DepartureDate,
                Price: room.Price,
                RoomPriceId: room.RoomPriceId,
                RoomTypeCode: room.RoomTypeCode,
                RoomTypeName: room.RoomTypeName,
                RoomTypeId: room.RoomTypeId,
                Adults: room.Adults,
                Child: room.Child,
                Travellers: null,
                IsBreakfast: room.IsBreakfast,
                IsGroupMaster: false,
                Nights: room.Nights,
                RoomRemain: room.RoomRemain - 1
            };
            $scope.RoomSelected.push(roomTemp);
            var obj = _.find(listAvaiRoom, function (roomTmp) {
                return roomTmp['RoomTypeId'] === room.RoomTypeId &&
                    roomTmp['ArrivalDate'].getTime() === room.ArrivalDate.getTime() &&
                    roomTmp['DepartureDate'].getTime() === room.DepartureDate.getTime()
            });
            if (!_.isUndefined(obj) && !_.isNull(obj)) obj.RoomAvailability--;
            $scope.ListAvailability = listAvaiRoom;
            var isAdd = true;
            RebuildSelectedRoom(isAdd);
        }
    }
    $scope.subRoomList = function (room) {
        if (room.Quantity > 1) {
            var roomDeleted = {};
            var roomSelected = angular.copy($scope.RoomSelected);
            var listAvaiRoom = angular.copy($scope.ListAvailability);
            for (var i = roomSelected.length - 1; i >= 0; i--) {
                if (roomSelected[i].RoomTypeId == room.RoomTypeId &&
                    roomSelected[i].ArrivalDate.getTime() == room.ArrivalDate.getTime() &&
                    roomSelected[i].DepartureDate.getTime() == room.DepartureDate.getTime() &&
                    roomSelected[i].Adults == room.Adults && roomSelected[i].Child == room.Child) {
                    roomDeleted = roomSelected[i];
                    roomSelected.splice(i, 1);
                    break;
                }
            }

            var listSame = _.filter(roomSelected, function (room) {
                return room.RoomTypeId === roomDeleted.RoomTypeId &&
                    room.Nights === roomDeleted.Nights &&
                    room.ArrivalDate.getTime() === roomDeleted.ArrivalDate.getTime() &&
                    room.DepartureDate.getTime() === roomDeleted.DepartureDate.getTime();
            });

            minRemainRoom = _.min(listSame, function (room) {
                return room.RoomRemain;
            });
            var minRemain = minRemainRoom.RoomRemain;
            if (minRemain <= roomDeleted.RoomRemain) minRemain += 1;
            for (var j in listSame) {
                listSame[j].RoomRemain = minRemain;
            }

            for (var idx in listAvaiRoom) {
                if (listAvaiRoom[idx].RoomTypeId == room.RoomTypeId &&
                    listAvaiRoom[idx].ArrivalDate.getTime() == room.ArrivalDate.getTime() &&
                    listAvaiRoom[idx].DepartureDate.getTime() == room.DepartureDate.getTime()) {
                    listAvaiRoom[idx].RoomAvailability++;
                    break;
                }
            }
            $scope.RoomSelected = roomSelected;
            $scope.ListAvailability = listAvaiRoom;
            var isAdd = false;
            RebuildSelectedRoom(isAdd);
        }
    }
    $scope.openEditAdultChidren = function ($mdOpenMenu, ev, number) {
        $rootScope.ValueTemp = number;
        $mdOpenMenu(ev);
        $timeout(function () {
            angular.element(".autoFocus").select();
        }, 100);
    };
    $scope.saveAdultChidren = function (roomType, action) {
        if ($rootScope.ValueTemp == undefined)
            $rootScope.ValueTemp = 0;
        //
        if (action == 'SAVE_DEFAULT_ADULT') {
            roomType.DefaultAdults = $rootScope.ValueTemp;

        } else if (action == 'SAVE_DEFAULT_CHILDREN') {
            roomType.DefaultChilds = $rootScope.ValueTemp;

        } else if (action == 'SAVE_ADULT') {
            roomType.Adults = $rootScope.ValueTemp;

        } else if (action == 'SAVE_CHILDREN') {
            roomType.Child = $rootScope.ValueTemp;
        }
        RebuildSelectedRoom();
    };
    $scope.openEditPrice = function ($mdOpenMenu, ev, roomType) {
        $rootScope.PriceTmp = roomType.Price;
        $mdOpenMenu(ev);
        $timeout(function () {
            angular.element(".autoFocus").select();
        }, 100);
    };
    $scope.savePrice = function (roomType) {
        if ($rootScope.PriceTmp == undefined)
            $rootScope.PriceTmp = 0;
        roomType.Price = $rootScope.PriceTmp;
        //
    };
    $scope.openEditIdentity = function ($mdOpenMenu, ev, room) {
        if (room.Travellers.IdentityNumber) {
            $rootScope.ValueTemp = room.Travellers.IdentityNumber;
        } else {
            $rootScope.ValueTemp = null;
        }
        $mdOpenMenu(ev);
        $timeout(function () {
            angular.element(".autoFocus").select();
        }, 100);
    };
    $scope.saveIdentity = function (room) {
        if ($rootScope.ValueTemp == undefined)
            $rootScope.ValueTemp = null;
        room.Travellers.IdentityNumber = $rootScope.ValueTemp;
        //
    };
    $scope.changePrice = function (roomType) {
        if (roomType.RoomPriceId != null) {
            roomType.RoomPriceId = parseInt(roomType.RoomPriceId);
            for (var idx in roomType.RoomPricesList) {
                var roomPrice = roomType.RoomPricesList[idx];
                if (roomPrice.RoomPriceId == roomType.RoomPriceId) {
                    roomType.Price = roomPrice.FullDayPrice;
                }
            }
        }
    };
    $scope.getDefaultPrice = function (priceList) {
        var f = priceList.find(function (a) {
            if (a.Priority == 0) {
                return a;
            }
        });
        return f.RoomPriceId.toString();
    }
    $scope.showBreakRoom = function (RoomTypeAvaility) {
        var Model = RoomTypeAvaility;
        SharedFeaturesFactory.processShowBreak(Model, function () {

        });
    }

    //Step 2: Group information
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
            //console.log("HERE 1", newCompany, $scope.hasRRIDParam, $stateParams.roomId);
            if (newCompany !== null) {
                console.log("HERE 2");
                var ReservationCompany = {
                    Company: newCompany,
                    RRID: 0
                };
                console.log("ReservationCompany", ReservationCompany);
                var addNewCompany = loginFactory.securedPostJSON("api/Room/AddNewCompanyToReservation", ReservationCompany);
                $rootScope.dataLoadingPromise = addNewCompany;
                addNewCompany.success(function (data) {
                    dialogService.toast("ADD_NEW_COMPANY_SUCCESSFUL");
                    $scope.selectedCompany = data;
                }).error(function (err) {
                    dialogService.messageBox("ERROR", err.Message);
                });

            }
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
            if (newSource !== null) {
                var ReservationSource = {
                    Source: newSource,
                    RRID: 0
                };
                newSource.Priority = $scope.sourceList.length;
                var addNewSource = loginFactory.securedPostJSON("api/Room/AddNewSourceToReservation", ReservationSource);
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
                    RRID: 0
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
    $scope.GroupReservationChange = function () {
        var roomSelected = $scope.RoomSelected;
        var fullName = $scope.Leader.Fullname;
        var identityNumber = $scope.Leader.IdentityNumber;
        for (var i in roomSelected) {
            if (roomSelected[i].IsGroupMaster == true) {
                if (fullName != null && fullName != '') roomSelected[i].Travellers.Fullname = fullName;
                else roomSelected[i].Travellers.Fullname = "Anonymus";
                if (identityNumber != null && identityNumber != '') roomSelected[i].Travellers.IdentityNumber = identityNumber;
                break;
            }
        }
        $scope.RoomSelected = roomSelected;
    }

    //Step 3: Confirm information
    $scope.ComfirmReservation = function () {
        var payment = angular.copy($scope.payment);
        var keys = ["RES_NO", "ROOM", "NOTIFICATION_NEWPAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER", "NOTIFICATION_BOOKED_GROUP_CONTENT"];
        var languageKeys = {};
        for (var idx in keys) {
            languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
        }
        if ($scope.RoomSelected && $scope.RoomSelected.length > 0) {
            angular.forEach($scope.RoomSelected, function (arr) {
                if (arr.IsBreakfast == true) {
                    arr.RoomBreakfastList = [{
                        IsBreakfast: true
                    }]
                } else {
                    arr.RoomBreakfastList = [{
                        IsBreakfast: false
                    }]
                }
            });
        };
        var newGroup = {
            Reservation: $scope.Reservation,
            ReservationRooms: $scope.RoomSelected,
            Payments: $scope.paymentList,
            Market: $scope.selectedMarket,
            Company: $scope.selectedCompany,
            Source: $scope.selectedSource,
            languageKeys: languageKeys
        };
        var processAddNewGroup = loginFactory.securedPostJSON("api/GroupReservation/ProcessAddNewGroup", newGroup);
        $rootScope.dataLoadingPromise = processAddNewGroup;
        processAddNewGroup.success(function (data) {
            dialogService.toast("ADD_NEW_GROUP_SUCCESSFUL");
            $state.go("groupReservationDetail", {
                reservationId: data
            });
        }).error(function (err) {
            console.log(err);
        });
    };
    $scope.addDeposit = function (e) {
        if ($scope.inProgressDeposit) e.preventDefault();
        else $scope.inProgressDeposit = true;
        var deposit = angular.copy($scope.deposit);
        if (!deposit.Amount) {
            dialogService.messageBox("INVALID_DEPOSIT", "DEPOSIT_AMOUNT_CAN_NOT_BE_NULL");
            $scope.inProgressDeposit = false;
            return;
        }
        if (deposit.Amount <= 0) {
            dialogService.messageBox("INVALID_DEPOSIT", "DEPOSIT_AMOUNT_CAN_NOT_LESS_THAN_OR_EQUAL_TO_0");
            $scope.inProgressDeposit = false;
            return;
        }
        if (deposit.PaymentDescription != null) {
            if (deposit.PaymentDescription.length > 250) {
                dialogService.messageBox("INVALID_DEPOSIT", "DEPOSIT_DESCRIPTION_CAN_NOT_OVER_THAN_250");
                $scope.inProgressDeposit = false;
                return;
            }
        }
        console.log(deposit);
        var confirm;
        
        if (deposit.MoneyId !== $scope.defaultCurrency.MoneyId) {
            for (var index in $scope.currencies) {
                if ($scope.currencies[index].MoneyId.toString() === deposit.MoneyId.toString()) {
                    var decimal = _.filter($scope.currenciesISO, function (item) {
                        return item.CurrencyId == $scope.currencies[index].CurrencyId;
                    })[0].MinorUnit;
                    deposit.AmountInSpecificMoney = deposit.Amount;
                    deposit.Amount = deposit.Amount * $scope.currencies[index].ExchangeRate;
                    deposit.MinorUnitInSpecificMoney = decimal;
                    deposit.MoneyName = $scope.currencies[index].MoneyName;
                    confirm = dialogService.confirm("NEW_PAYMENT_CONFIRM", $filter("currency")(deposit.Amount) + "(" + $scope.currencies[index].MoneyName + " " + +deposit.AmountInSpecificMoney.toFixed(decimal) + ")");
                    //
                    break;
                }
            }
        } else {
            confirm = dialogService.confirm("NEW_PAYMENT_CONFIRM", $filter("currency")($scope.deposit.Amount));
        }
        if (deposit.PaymentTypeName === "REFUND") {
            deposit.Amount = -deposit.Amount;
            deposit.AmountInSpecificMoney = -deposit.AmountInSpecificMoney;
        }
        confirm.then(function () {
            deposit.CreatedDate = new Date();
            $scope.paymentList.push(deposit);
            console.info('payment', $scope.paymentList);
            dialogService.toast("ADD_PAYMENT_SUCCESSFUL");
            $scope.deposit.PaymentDescription = null;
            $scope.deposit.Amount = null;
            $scope.inProgressDeposit = false;
        }, function () {
            $scope.inProgressDeposit = false;
        });
    };
    $scope.deleteDeposit = function (payment) {
        var message;
        if (payment.MinorUnitInSpecificMoney != null) {
            message = $filter("currency")(payment.Amount) + "(" + payment.MoneyName + " " + +payment.AmountInSpecificMoney.toFixed(payment.MinorUnitInSpecificMoney) + ")"
        } else {
            message = $filter('currency')(payment.Amount);
        }
        dialogService.confirm("DELETE_PAYMENT_CONFIRM", message).then(function () {
            $scope.paymentList.splice($scope.paymentList.indexOf(payment), 1);
        });
    };

    // Helper js
    $scope.currentStep = 0;
    $scope.nextStep = function () {
        var steppers = $mdStepper('Stepper-Group');
        console.log('Guest Information:', steppers);
        if (steppers.currentStep == 1) {
            console.log($scope.Leader, "Leader information");
            var fullName = angular.copy($scope.Leader.Fullname);
            var bookingCode = angular.copy($scope.Reservation.ReservationCode);
            if ($scope.selectedCountries == null) {
                dialogService.messageBox("MISSING_COUNTRY", "COUNTRY_VALUE_FIELD_CAN_NOT_BE_BLANK");
                return;
            }
            if (fullName == null || fullName == '') {
                var Message = $filter("translate")("MISSING_CUSTOMER._PLEASE_CREATE_NEW_OR_CHOOSE_AT_LEAST_ONE_CUSTOMER_TO_GO_NEXT_STEP");
                dialogService.messageBox("ERROR", Message);
                return;
            }
            if (bookingCode == null || bookingCode == '') {
                var Message = $filter("translate")("MISSING_BOOKING_CODE_PLEASE_TYPE_BOOKING_CODE");
                dialogService.messageBox("ERROR", Message);
                return;
            }
        }
        $scope.currentStep = $scope.currentStep + 1;

        render(steppers.currentStep);
        steppers.clearError();
        steppers.next();
    };

    function render(currentStep) {
        if (currentStep <= 1) {
            setDefaultLeader();
        };
        if ($scope.Leader.Birthday != null && $scope.dateString == null) {
            $scope.dateString = new Date($scope.Leader.Birthday).format('dd/mm/yyyy');
        };
        var tempSearch = angular.copy($scope.search);
        $scope.fromString = tempSearch.From.format('dd/mm/yyyy HH:MM');
        $scope.toString = tempSearch.To.format('dd/mm/yyyy HH:MM');
        $scope.search = tempSearch;
    }
    $scope.backStep = function () {
        var steppers = $mdStepper('Stepper-Group');
        render(steppers.currentStep);
        steppers.back();
        $scope.currentStep = $scope.currentStep - 1;
    };
    $scope.saveGroupInformation = function () {
        $scope.nextStep();
    };

    function RebuildSelectedRoom(isAdd) {
        var roomSelected = angular.copy($scope.RoomSelected);
        var roomSelectedView = [];
        for (var i in roomSelected) {
            if (_.isEmpty(roomSelectedView)) {
                roomSelected[i].Quantity = 1;
                roomSelectedView.push(roomSelected[i]);
            } else {
                var isExist = false;
                var obj = _.find(roomSelectedView, function (room) {
                    return room['RoomTypeId'] === roomSelected[i].RoomTypeId &&
                        room['Nights'] === roomSelected[i].Nights &&
                        room['ArrivalDate'].getTime() === roomSelected[i].ArrivalDate.getTime() &&
                        room['DepartureDate'].getTime() === roomSelected[i].DepartureDate.getTime() &&
                        room['Adults'] === roomSelected[i].Adults &&
                        room['Child'] === roomSelected[i].Child
                });
                if (!_.isUndefined(obj) && !_.isNull(obj)) isExist = true;
                if (!isExist) {
                    roomSelected[i].Quantity = 1;
                    roomSelectedView.push(roomSelected[i]);
                } else {
                    obj.Quantity++;
                    obj.RoomRemain = roomSelected[i].RoomRemain;
                    // obj.BreakRooms = obj.BreakRooms < roomSelected[i].BreakRooms ? roomSelected[i].BreakRooms : obj.BreakRooms;
                }
            }
        }

        for (var i in roomSelectedView) {
            var listSame = _.filter(roomSelectedView, function (room) {
                return room.RoomTypeId === roomSelectedView[i].RoomTypeId &&
                    room.Nights === roomSelectedView[i].Nights &&
                    room.ArrivalDate.getTime() === roomSelectedView[i].ArrivalDate.getTime() &&
                    room.DepartureDate.getTime() === roomSelectedView[i].DepartureDate.getTime();
            });
            minRemainRoom = _.min(listSame, function (room) {
                return room.RoomRemain;
            });
            var minRemain = minRemainRoom.RoomRemain;
            var breakRoom = minRemainRoom.BreakRoomsDefault > minRemain ? (minRemainRoom.BreakRoomsDefault - minRemain) : 0;
            var totalRooms = minRemainRoom.Quantity;
            for (var j in listSame) {
                listSame[j].RoomRemain = minRemain;
                listSame[j].BreakRooms = breakRoom;
                listSame[j].DirectRooms = totalRooms - breakRoom;
            }
        }
        $scope.DirectRoomNote = _.filter(roomSelectedView, function (item) {
            return item.BreakRooms > 0;
        }).length > 0 ? true : false;
        $scope.RoomSelectedView = roomSelectedView;
    }

    function CalculateDay(from, to) {
        var isOk = false;
        var firstDate = new Date(from);
        var curDate1 = firstDate.getDate();
        var curMonth1 = firstDate.getMonth() + 1;
        var curYear1 = firstDate.getFullYear();
        var secondDate = new Date(to);
        var curDate2 = secondDate.getDate();
        var curMonth2 = secondDate.getMonth() + 1;
        var curYear2 = secondDate.getFullYear();
        if (curDate1 == curDate2 && curMonth1 == curMonth2 && curYear1 == curYear2) {
            isOk = true;
        }
        return isOk;
    }

    function CalculateDayBetween(from, to) {
        var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
        var firstDate = new Date(from);
        var secondDate = new Date(to);
        var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
        return diffDays;
    };

    function setDefaultLeader() {
        if ($scope.selectedCountries != null) {
            $scope.Leader.CountryId = $scope.selectedCountries.CountryId;
        };
        console.log('scope.RoomSelected, scope.Leader:', $scope.RoomSelected, $scope.Leader);
        var leader = _.filter($scope.RoomSelected, function (item) {
            return (item.IsGroupMaster == true);
        });
        if ((leader == null || leader.length == 0) && $scope.RoomSelected.length > 0) {
            $scope.RoomSelected[0].IsGroupMaster = true;
            $scope.RoomSelected[0].Travellers = {
                Fullname: $scope.Leader.Fullname,
                IdentityNumber: $scope.Leader.IdentityNumber == null ? null : $scope.Leader.IdentityNumber,
                TravellerId: $scope.Leader.TravellerId == null ? 0 : $scope.Leader.TravellerId,
                CountryId: $scope.Leader.CountryId == null ? 0 : $scope.Leader.CountryId,
                Address: $scope.Leader.Address == null ? null : $scope.Leader.Address,
                Birthday: $scope.Leader.Birthday == null ? null : $scope.Leader.Birthday,
                Email: $scope.Leader.Email == null ? null : $scope.Leader.Email,
                Gender: $scope.Leader.Gender == null ? 0 : $scope.Leader.Gender,
                Mobile: $scope.Leader.Mobile == null ? null : $scope.Leader.Mobile,
                Note: $scope.Leader.Note == null ? null : $scope.Leader.Note
            };
        } else if (leader.length > 0) {
            leader[0].Travellers = null;
            leader[0].Travellers = {
                Fullname: $scope.Leader.Fullname,
                IdentityNumber: $scope.Leader.IdentityNumber == null ? null : $scope.Leader.IdentityNumber,
                TravellerId: $scope.Leader.TravellerId == null ? 0 : $scope.Leader.TravellerId,
                CountryId: $scope.Leader.CountryId == null ? 0 : $scope.Leader.CountryId,
                Address: $scope.Leader.Address == null ? null : $scope.Leader.Address,
                Birthday: $scope.Leader.Birthday == null ? null : $scope.Leader.Birthday,
                Email: $scope.Leader.Email == null ? null : $scope.Leader.Email,
                Gender: $scope.Leader.Gender == null ? 0 : $scope.Leader.Gender,
                Mobile: $scope.Leader.Mobile == null ? null : $scope.Leader.Mobile,
                Note: $scope.Leader.Note == null ? null : $scope.Leader.Note
            };
        }

        console.log('leader:', $scope.RoomSelected);
    };

    function addDays(date, days) {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
    $scope.openMenu = function ($mdOpenMenu, ev) {
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
    }
    $scope.isValidKeyPress = function (evt) {
        if (evt.keyCode != 8 && (evt.keyCode < 47 || evt.keyCode > 57)) {
            if (evt.keyCode != 46)
                evt.preventDefault();
        }
    }

    // passport
    $scope.saveInfoPassport = function () {
        $scope.Leader.Fullname = FullnameCustomer;
        $scope.Leader.Gender = Gender === "M" ? 0 : 1;
        $scope.Leader.IdentityNumber = IdentityNumber;
        if (Birthday) {
            $scope.Leader.Birthday = new Date(Birthday);
            $scope.dateString = $scope.Leader.Birthday.format('dd/mm/yyyy');
        }

        $scope.Leader.ImageLocation = ImageLocation;
        $scope.Leader.ValidUntil = new Date(ValidUntil);

        if ($scope.countries !== null && $scope.Leader !== null && $scope.countries.length > 0)

            $scope.selectedCountries = _.filter($scope.countries, function (item) {
                return item.CountryCode == CountryCode;
            })[0];
        console.log("country passport:", $scope.selectedCountries);
        console.log("customer passport:", $scope.Leader);

        var roomSelected = $scope.RoomSelected;
        for (var i in roomSelected) {
            if (roomSelected[i].IsGroupMaster == true) {
                roomSelected[i].Travellers.Fullname = FullnameCustomer != null || FullnameCustomer != "" ? FullnameCustomer : "Anonymus";
                roomSelected[i].Travellers.IdentityNumber = IdentityNumber;
                break;
            }
        }
        $scope.RoomSelected = roomSelected;
    }
}]);