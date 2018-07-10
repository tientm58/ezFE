var globalInvoiceId = 0;

ezCloud.controller('walkinController', ['SharedFeaturesFactory', 'EmailMarketingFactory', '$sce', 'frontOfficeFactory', '$scope', '$mdBottomSheet', '$rootScope', '$log', 'commonFactory', 'loginFactory', '$stateParams', 'roomListFactory', 'dialogService', '$state', '$mdDialog', '$locale', '$filter', '$localStorage', 'configFactory', 'currentHotelConnectivities', '$mdMedia', 'smartCardFactory', '$timeout', '$location', 'reservationFactory', 'walkInFactory',
    function (SharedFeaturesFactory, EmailMarketingFactory, $sce, frontOfficeFactory, $scope, $mdBottomSheet, $rootScope, $log, commonFactory, loginFactory, $stateParams, roomListFactory, dialogService, $state, $mdDialog, $locale, $filter, $localStorage, configFactory, currentHotelConnectivities, $mdMedia, smartCardFactory, $timeout, $location, reservationFactory, walkInFactory) {
        $scope.showEmail = false;
        $scope.rooms = [];
        $scope.page = {
            searchES: ''
        }

        var selectedRoom = roomListFactory.getRoomById($stateParams.roomId);
        $scope.isUsePassport = false;
      
      function isUsePassport(){
            if($rootScope.EzModulesActive == undefined || $rootScope.EzModulesActive == null){
                commonFactory.getHotelCommonInformation();
            }
            var EzModulesActive = $rootScope.EzModulesActive;
            console.log("tuyendao walkin",EzModulesActive);
            var PassportModule = _.find(EzModulesActive, function (item) {
                return item.ModuleCode === "PASSPORT";
            })
           return PassportModule != null ? true : false;
        }; 

        var reservationTimeline = false;
        var oneDay = 24 * 60 * 60 * 1000;
        $scope.nextStatuses = {
            BOOKED: {
                CANCELLED: 1,
                CHECKIN: 1,
            },
            CANCEL: {

            },
            CHECKIN: {
                CHECKOUT: 1,
            },
            CHECKOUT: {
                DIRTY: 1
            },
            AVAILABLE: {
                CHECKIN: 1,
                BOOKED: 1
            },
            DIRTY: {

            }
        };
        var room = {
            count: 1,
            ArrivalDate: new Date(),
            DepartureDate: addDays(new Date(), 1),
            Adults: 1,
            Child: 0,
            Total: 0

        };
        var reservationRoomId = 0;

        $scope.customer = {};

        $scope.searchText = "";
        $scope.selectedItem = null;
        $scope.room = {};
        $scope.availableRoom = [];
        $scope.availablePlanList = [];
        $scope.sharerList = [];
        $scope.deposit = [];
        $scope.tabsLock = false;
        $scope.viewType = "detailGroup";
        //$scope.viewType = "eachDay";
        // $scope.minDate = new Date();
        $scope.conflict = false;
        $scope.roomBookingList = [];
        $scope.payment = {};
        $scope.travellerExtraInfo = {};
        $scope.hasRRIDParam = false;
        $scope.isCheckout = false;
        $scope.isEditMarketing = false;
        $scope.isAddMarketing = false;
        $scope.Amount = 0;
        $scope.AmountBooked = 0;
        $scope.showDiscount = false;
        $scope.hotelFormRoomInvoice = [];
        $scope.hotelFormRoomReceipt = [];
        var reservationGroup = null;
        var selectedCountries;
        $scope.hotelForms = [];
        $scope.Totalprice = 0;
        $scope.ListRoomCheckInToday = [];

        $scope.RoomCheckIn = {};

        /*function Init(){
            $timeout(function(){
                $scope.$apply(InitTemp);
            }, 0)
        }*/

        function Init() {
            $scope.isUsePassport = isUsePassport();             
            $scope.isSubmitPayment = false;
            $scope.isSubmitDeposit = false;
            $scope.dataLoad = false;
            // Common data which doesn't matter it is a new reservation room or reservation room detail
            $scope.DateTimePickerOption = {
                format: 'dd/MM/yyyy HH:mm'
            };
            $scope.DatePickerOption = {
                format: 'dd/MM/yyyy'
            };
            $scope.hasRRIDParam = ($stateParams.reservationRoomId) ? true : false;
            $scope.RRIDParam = $stateParams.reservationRoomId;
            $scope.defaultDecimal = angular.copy($rootScope.decimals);
            $scope.currentHotelConnectivities = currentHotelConnectivities;
            $scope.TypeEmailM = EmailMarketingFactory.getTypes();
            $scope.TypeStatusM = EmailMarketingFactory.getTypeStatus();
            $scope.LogsEmail = [];
            // Countries 

            if (!commonFactory.getCountryList().length) {
                var promise = commonFactory.updateCountryList();
                promise.success(function (data) {
                    $scope.countries = data;

                    var defaultCountry = _.filter($scope.countries, function (item) {
                        return item.CountryCode.toLowerCase() == "vn";
                    });


                    if ($scope.countries !== null && defaultCountry !== null && defaultCountry[0] !== null && defaultCountry[0].CountryId !== null && $scope.countries.length > 0) {
                        selectedCountries = _.filter($scope.countries, function (item) {
                            return item.CountryId == defaultCountry[0].CountryId;
                        })[0];
                        $scope.selectedCountries = selectedCountries;
                    }

                    commonFactory.processCountryList(data);

                });
            } else {
                $scope.countries = commonFactory.getCountryList();
                var defaultCountry = _.filter($scope.countries, function (item) {
                    return item.CountryCode.toLowerCase() == "vn";
                });

                if ($scope.countries !== null && defaultCountry !== null && defaultCountry[0] !== null && defaultCountry[0].CountryId !== null && $scope.countries.length > 0)

                    selectedCountries = _.filter($scope.countries, function (item) {
                        return item.CountryId == defaultCountry[0].CountryId;
                    })[0];
                $scope.selectedCountries = selectedCountries;

            }

            $scope.queryCountriesSearch = queryCountriesSearch;
            $scope.selectedCountriesChange = selectedCountriesChange;
            $scope.searchCountriesTextChange = searchCountriesTextChange;

            walkInFactory.processReservation(new Date(), $stateParams.reservationRoomId, function (data) {
                //roomListFactory.getReservationRoom(new Date(),$stateParams.reservationRoomId, function (data) {
                // All Hotel Index Data no matter what BookingStatus
                if (data.HotelIndexData != null) {
                    $scope.dataLoad = true;
                    // Room Invoice
                    var Invoice = data.HotelIndexData.hotelInvoices.hotelFormRoomInvoice[0];
                    var Receipt = data.HotelIndexData.hotelInvoices.hotelFormRoomReceipt[0];
                    $scope.hotelFormRoomInvoice = Invoice.FormType + Invoice.Value + '.trdx';
                    $scope.hotelFormRoomReceipt = Receipt.FormType + Receipt.Value + '.trdx';

                    //totalprice
                    $scope.Totalprice = data.totalPrice;

                    // Plan list
                    $scope.rateList = data.HotelIndexData.planList;
                    $scope.planList = data.HotelIndexData.planList;

                    // Room Types
                    $scope.roomTypes = data.HotelIndexData.roomTypes;

                    $scope.hotelForms = data.HotelForms;

                    // Source, Company, Market
                    $scope.sourceList = data.HotelIndexData.sourceList.sort(function (a, b) {
                        return a.Priority - b.Priority;
                    }).filter(function (a) {
                        if (a.IsAvailable) return a;
                    });
                    $scope.companyList = data.HotelIndexData.companyList.sort(function (a, b) {
                        return a.Priority - b.Priority;
                    }).filter(function (a) {
                        if (a.IsAvailable) return a;
                    });
                    $scope.marketList = data.HotelIndexData.marketList.sort(function (a, b) {
                        return a.Priority - b.Priority;
                    }).filter(function (a) {
                        if (a.IsAvailable) return a;
                    });

                    //Currencies
                    $scope.payment.MoneyId = null;
                    $scope.currencies = data.HotelIndexData.currencies;
                    $scope.currenciesISO = data.HotelIndexData.currenciesISO;
                    $scope.defaultCurrency = data.HotelIndexData.defaultCurrency;
                    $scope.decimal = $rootScope.decimals;

                    //Payment Methods
                    $scope.paymentMethods = data.HotelIndexData.paymentMethods;
                    var paymentMethodsNotCityLedger = new Array();
                    for (var index in $scope.paymentMethods) {
                        if ($scope.paymentMethods[index].PaymentMethodId != 4) {
                            paymentMethodsNotCityLedger.push($scope.paymentMethods[index]);
                        }
                    }
                    for (var index in $scope.paymentMethods) {
                        if ($scope.paymentMethods[index].PaymentMethodName.toLowerCase() == "cash") {
                            $scope.defaultPaymentMethod = $scope.paymentMethods[index];
                            break;
                        }
                    }
                    $scope.paymentMethodsNotCityLedger = paymentMethodsNotCityLedger;

                    //Remark Events
                    $scope.remarkEvents = data.HotelIndexData.remarkEvents;

                    // Staff List
                    $scope.listUser = data.HotelIndexData.staffList;

                    //Extra service
                    if (!$localStorage.processExtraService) {
                        $localStorage.processExtraService = false;
                    }
                    loadExtraServices(data.HotelIndexData.extraService);
                    $scope.roomWorkOrder = data.roomWorkOrder;

                    //List Room CheckIn Today
                    // $scope.ListRoomCheckInToday = data.ListRoomCheckinToday;
                    // if ($stateParams.reservationRoomId != null) {
                    //     $scope.RoomCheckIn = data.ListRoomCheckinToday.find(function (item) {
                    //         return item.ReservationRoomId == $stateParams.reservationRoomId
                    //     });
                    // } else {
                    //     $scope.RoomCheckIn = null;
                    // }
                }

                function IsUseTimeInOutPrivate(arrivalDate, departureDate) {
                    if ($localStorage.TimeInOutPrivate != null && $localStorage.TimeInOutPrivate != undefined) {
                        if ($localStorage.TimeInOutPrivate.UseTimeInOutPrivate) {
                            var dateNow = new Date();
                            if (arrivalDate < dateNow) {
                                arrivalDate = dateNow;
                            }
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
                            departureDate.setMilliseconds(0)
                        }
                    }
                    return [arrivalDate, departureDate];
                }
                $scope.extraServiceNoItem = {
                    Quantity: 1
                };
                // New Walkin
                if (!$stateParams.reservationRoomId && !$stateParams.roomId) {
                    $scope.tabsLock = true;
                    $scope.isCheckout = false;
                    $scope.isEditMarketing = false;
                    $scope.isAddMarketing = true;
                    $scope.paymentList = [];
                    startTmp = new Date();
                    startTmp.setSeconds(0);
                    startTmp.setMilliseconds(0);
                    endTmp = addDays(new Date(), 1);
                    endTmp.setSeconds(0);
                    endTmp.setMilliseconds(0);
                    var DateTmp = IsUseTimeInOutPrivate(startTmp, endTmp);
                    $scope.room = {
                        count: 1,
                        ArrivalDate: DateTmp[0],
                        DepartureDate: DateTmp[1],
                        Adults: 1,
                        Child: 0,
                        Total: 0,
                        RoomPriceId: 0,
                        RoomTypeId: 0,
                        RoomId: 0,
                        FOC: false,
                        DiscountPercentage: 0,
                        DiscountFlat: 0,
                        Price: 0
                    };
                    $scope.str = $scope.room.ArrivalDate.format('dd/mm/yyyy HH:MM');
                    $scope.str2 = $scope.room.DepartureDate.format('dd/mm/yyyy HH:MM');
                    $scope.minDate = $scope.room.ArrivalDate;
                    $scope.customer = {};
                    $scope.roomRemarks = [];
                    var roomId_TL = 0;

                    function checkReservationTL() {
                        var reservationTL = walkInFactory.getReservationTimeline();
                        if (reservationTL != undefined && reservationTL != null) {
                            console.log("TL", reservationTL);
                            reservationTimeline = true;
                            $log.log(reservationTL.ArrivalDate);

                            $scope.room.ArrivalDate = new Date(reservationTL.ArrivalDate);
                            $scope.room.DepartureDate = new Date(reservationTL.DepartureDate);
                            $log.log($scope.room.ArrivalDate);
                            var DateTmp = IsUseTimeInOutPrivate($scope.room.ArrivalDate, $scope.room.DepartureDate);
                            $log.log($scope.room.ArrivalDate);

                            if (DateTmp[1].getTime() < DateTmp[0].getTime()) {
                                DateTmp[1] = addDays(DateTmp[1], 1);
                            }

                            $scope.str = DateTmp[0].format('dd/mm/yyyy HH:MM');
                            $scope.str2 = DateTmp[1].format('dd/mm/yyyy HH:MM');
                            $scope.room.ArrivalDate = DateTmp[0];
                            $scope.room.DepartureDate = DateTmp[1];


                            roomId_TL = reservationTL.RoomId;
                        };
                    };
                    checkReservationTL();

                    function setRoomTL(roomId_TL) {
                        if (roomId_TL != 0) {
                            for (i = 0; i < $scope.availableRoom.length; i++) {
                                if ($scope.availableRoom[i].RoomId == roomId_TL) {
                                    $scope.room.RoomId = roomId_TL;
                                    $scope.room.RoomTypeId = $scope.availableRoom[i].RoomTypeId;
                                    break;
                                }
                            }
                            walkInFactory.setReservationTimeline(null);
                        }
                    }
                    setRoomTL(roomId_TL);

                    function checkReservationGroup() {
                        var reservationGroupTmp = walkInFactory.getReservationGroup();
                        if (reservationGroupTmp != undefined && reservationGroupTmp != null) {
                            walkInFactory.setReservationGroup(null);
                            console.log('Reservation Group', reservationGroupTmp);
                            reservationGroup = reservationGroupTmp;
                        };
                    };
                    checkReservationGroup();
                    $scope.deposit = {
                        PaymentMethodId: $scope.defaultPaymentMethod.PaymentMethodId,
                        MoneyId: $scope.defaultCurrency.MoneyId,
                        PaymentTypeName: "DEPOSIT"
                    };

                    $scope.$watchCollection('room.RoomPriceId', function (newValues, oldValues) {
                        for (var index in $scope.planList) {
                            if ($scope.planList[index].RoomPriceId == newValues) {
                                $scope.room.Price = $scope.planList[index].FullDayPrice;
                            }
                        }

                    });


                }
                // New Walkin Room
                if ($stateParams.roomId) {
                    $scope.paymentList = [];
                    $scope.tabsLock = true;
                    $scope.isCheckout = false;
                    $scope.isAddMarketing = true;
                    $scope.isEditMarketing = false;
                    $scope.roomList = data.HotelIndexData.rooms;
                    var room = {};
                    $scope.roomRemarks = [];
                    for (var index in $scope.roomList) {
                        if ($scope.roomList[index].RoomId == $stateParams.roomId) {
                            room = $scope.roomList[index];
                            break;
                        }
                    }
                    var roomTemp;
                    var currentRoomTypeId;

                    for (var index in $scope.roomList) {
                        if ($scope.roomList[index].RoomId == $stateParams.roomId) {
                            roomTemp = $scope.roomList[index];
                            currentRoomTypeId = roomTemp.RoomTypeId;
                            break;
                        }
                    }
                    $scope.RoomName = roomTemp.RoomName;
                    var DateTmp = IsUseTimeInOutPrivate(new Date(), addDays(new Date(), 1));
                    $scope.str = DateTmp[0].format('dd/mm/yyyy HH:MM');
                    $scope.str2 = DateTmp[1].format('dd/mm/yyyy HH:MM');
                    $scope.room = {
                        count: 1,
                        ArrivalDate: DateTmp[0],
                        DepartureDate: DateTmp[1],
                        Adults: 1,
                        Child: 0,
                        Total: 0,
                        RoomPriceId: 0,
                        RoomTypeId: currentRoomTypeId,
                        RoomId: $stateParams.roomId,
                        FOC: false,
                        DiscountPercentage: 0,
                        DiscountFlat: 0,
                        RoomTypeId: room.RoomTypeId,
                        RoomId: room.RoomId,
                        BookingStatus: room.BookingStatus,
                        HouseStatus: room.HouseStatus,
                        Note: null,
                        Price: 0
                    };
                    $scope.minDate = $scope.room.ArrivalDate;
                    $scope.customer = {};
                    $scope.availableRoom = $scope.roomList;

                    var roomId_TL = 0;

                    function checkReservationTL() {
                        var reservationTL = walkInFactory.getReservationTimeline();
                        if (reservationTL != undefined && reservationTL != null) {
                            console.log("TL", reservationTL);
                            reservationTimeline = true;
                            $log.log(reservationTL.ArrivalDate);

                            $scope.room.ArrivalDate = new Date(reservationTL.ArrivalDate);
                            $scope.room.DepartureDate = new Date(reservationTL.DepartureDate);
                            $log.log($scope.room.ArrivalDate);
                            var DateTmp = IsUseTimeInOutPrivate($scope.room.ArrivalDate, $scope.room.DepartureDate);
                            $log.log($scope.room.ArrivalDate);

                            if (DateTmp[1].getTime() < DateTmp[0].getTime()) {
                                DateTmp[1] = addDays(DateTmp[1], 1);
                            }

                            $scope.str = DateTmp[0].format('dd/mm/yyyy HH:MM');
                            $scope.str2 = DateTmp[1].format('dd/mm/yyyy HH:MM');
                            $scope.room.ArrivalDate = DateTmp[0];
                            $scope.room.DepartureDate = DateTmp[1];


                            roomId_TL = reservationTL.RoomId;
                        };
                    };
                    checkReservationTL();

                    function setRoomTL(roomId_TL) {
                        if (roomId_TL != 0) {
                            for (i = 0; i < $scope.availableRoom.length; i++) {
                                if ($scope.availableRoom[i].RoomId == roomId_TL) {
                                    $scope.room.RoomId = roomId_TL;
                                    $scope.room.RoomTypeId = $scope.availableRoom[i].RoomTypeId;
                                    break;
                                }
                            }
                            walkInFactory.setReservationTimeline(null);
                        }
                    }
                    setRoomTL(roomId_TL);

                    $scope.deposit = {
                        PaymentMethodId: $scope.defaultPaymentMethod.PaymentMethodId,
                        MoneyId: $scope.defaultCurrency.MoneyId,
                        PaymentTypeName: "DEPOSIT"
                    };
                    $scope.$watchCollection('room.RoomPriceId', function (newValues, oldValues) {
                        for (var index in $scope.planList) {
                            if ($scope.planList[index].RoomPriceId == newValues) {
                                $scope.room.Price = $scope.planList[index].FullDayPrice;
                            }
                        }
                    });
                }
                // Reserved Room
                if ($scope.hasRRIDParam) {
                    $scope.tabsLock = false;
                    var roomType = {};
                    var payment = [];
                    var extraservices = [];
                    $scope.availableRoom = $scope.roomList;
                    if ($rootScope.selectedTabIndex === null || $rootScope.selectedTabIndex === undefined) {
                        $scope.data.selectedIndex = 0;
                    } else {
                        $scope.data.selectedIndex = $rootScope.selectedTabIndex;
                    }
                    if (data.ReservationRoomInfo != null) {
                        $scope.roomPriceTemp = angular.copy(data.ReservationRoomInfo.Price);
                        // Past Check Out
                        $scope.applyPastCheckOut = data.ReservationRoomInfo.PastCheckOutList && data.ReservationRoomInfo.PastCheckOutList.length > 0;
                        console.info("pre check out", $scope.applyPastCheckOut, data.ReservationRoomInfo.PastCheckOutList.length > 0);
                        $scope.pastCheckOutReason = $scope.applyPastCheckOut ? data.ReservationRoomInfo.PastCheckOutList[0].PastCheckOutReason : '';
                        // Pre Check Out
                        data.ReservationRoomInfo.IsPreCheckOut = (data.ReservationRoomInfo.ChangeReservationStatus != null && data.ReservationRoomInfo.ChangeReservationStatus.length > 0) ? true : false;

                        data.ReservationRoomInfo.ArrivalDate = new Date(data.ReservationRoomInfo.ArrivalDate);
                        data.ReservationRoomInfo.DepartureDate = new Date(data.ReservationRoomInfo.DepartureDate);

                        $scope.room = data.ReservationRoomInfo;

                        EmailMarketingFactory.getLogsEmailByRR($scope.room.ReservationRoomId, function (data) {
                            $scope.LogsEmail = data;
                            $scope.showEmail = true;
                        }, function () {
                            $scope.showEmail = false;
                        });

                        $scope.CMBookingId = data.ReservationRoomInfo.Reservations != null ? data.ReservationRoomInfo.Reservations.CMBookingId : null;
                        $scope.CMChannelRef = data.ReservationRoomInfo.Reservations != null ? data.ReservationRoomInfo.Reservations.CMChannelRef : null;
                        $scope.isCheckOut = ($scope.room.BookingStatus === "CHECKOUT") ? true : false;
                        $scope.isCancel = ($scope.room.BookingStatus === "CANCELLED") ? true : false;
                        $scope.isAddMarketing = ($scope.room.BookingStatus === "CHECKOUT" || ($scope.room.BookingStatus === "CANCELLED")) ? false : true;
                        $scope.isEditMarketing = ($scope.room.BookingStatus === "CHECKOUT" || ($scope.room.BookingStatus === "CANCELLED")) ? false : true;

                        // Reservation Number
                        $scope.reservationNumber = data.ReservationRoomInfo.Reservations.ReservationNumber;
                        $scope.reservation_oldNumber = angular.copy($scope.reservationNumber);

                        //Room Charges
                        $scope.roomCharges = data.ReservationRoomInfo.RoomChargesList;

                        // Info
                        $scope.roomInfo = data.ReservationRoomInfo.Rooms;
                        $scope.RoomName = $scope.roomInfo != null ? $scope.roomInfo.RoomName : null;
                        $scope.planInfo = data.ReservationRoomInfo.RoomPrices;
                        $scope.roomTypeInfo = data.ReservationRoomInfo.RoomTypes;

                        //Remark
                        $scope.roomRemarks = data.ReservationRoomInfo.RoomRemarksList;
                        for (var index in $scope.roomRemarks) {
                            if ($scope.roomRemarks[index].CreatedDate) {
                                $scope.roomRemarks[index].CreatedDate = new Date($scope.roomRemarks[index].CreatedDate);
                            }
                            for (var index2 in $scope.remarkEvents) {
                                if ($scope.remarkEvents[index2].RemarkEventId == $scope.roomRemarks[index].RemarkEventId) {
                                    $scope.roomRemarks[index].RemarkEventCode = $scope.remarkEvents[index2].RemarkEventCode;
                                    break;
                                }
                            }
                        }

                        // Room Breakfast
                        $scope.roomBreakfast = data.ReservationRoomInfo.RoomBreakfastList;
                        for (var index in $scope.roomBreakfast) {
                            if ($scope.roomBreakfast[index].UsedDate) {
                                $scope.roomBreakfast[index].UsedDate = new Date($scope.roomBreakfast[index].UsedDate);
                            }
                            if (addDays($scope.roomBreakfast[index].UsedDate, 1) < new Date()) {
                                $scope.roomBreakfast[index].IsDisabled = true;
                            } else {
                                $scope.roomBreakfast[index].IsDisabled = false;
                            }
                        }

                        //Sharer List
                        $scope.sharerList = data.Sharers;
                        for (var index in $scope.sharerList) {
                            if ($scope.sharerList[index].customer.Birthday != null) {
                                $scope.sharerList[index].customer.Birthday = new Date($scope.sharerList[index].customer.Birthday);
                            }
                        }
                        for (var index in $scope.sharerList) {

                            if ($scope.sharerList[index].customer.TravellerId == data.ReservationRoomInfo.Travellers.TravellerId) {
                                $scope.sharerList[index].isMainCustomer = true;
                                break;
                            }
                        }
                        if ($scope.room.Adults + $scope.room.Child >= $scope.sharerList.length) {
                            $scope.calculateAdults = $scope.room.Adults;
                            $scope.calculateChildren = $scope.room.Child;
                        } else {
                            var children = 0;
                            var adults = 0;
                            for (var index in $scope.sharerList) {
                                if ($scope.sharerList[index] && $scope.sharerList[index].travellerExtraInfo.IsChild) {
                                    children = children + 1;
                                } else {
                                    adults = adults + 1;
                                }
                            }
                            $scope.calculateAdults = adults;
                            $scope.calculateChildren = children;
                        }
                        $scope.SourceId = data.ReservationRoomInfo.Reservations.SourceId;
                        // Business
                        if ($scope.sourceList != null && data.ReservationRoomInfo.Reservations.Source && $scope.sourceList.length > 0)
                            $scope.selectedSource = _.filter($scope.sourceList, function (item) {
                                return item.SourceId == data.ReservationRoomInfo.Reservations.Source.SourceId;
                            })[0];

                        if ($scope.companyList != null && data.ReservationRoomInfo.Reservations.Company != null && $scope.companyList.length > 0)
                            $scope.selectedCompany = _.filter($scope.companyList, function (item) {
                                return item.CompanyId == data.ReservationRoomInfo.Reservations.Company.CompanyId;
                            })[0];

                        if ($scope.marketList !== null && data.ReservationRoomInfo.Reservations.Market && $scope.marketList.length > 0)

                            $scope.selectedMarket = _.filter($scope.marketList, function (item) {
                                return item.MarketId == data.ReservationRoomInfo.Reservations.Market.MarketId;
                            })[0];

                        // Customer
                        $scope.customer = data.ReservationRoomInfo.Travellers;
                        if ($scope.customer.Birthday !== null) {
                            $scope.customer.Birthday = new Date($scope.customer.Birthday);

                        }
                        $scope.originalCustomer = angular.copy($scope.customer);

                        // Extra Services
                        extraservices = data.ReservationRoomInfo.RoomExtraServicesList;
                        for (var idx in extraservices) {
                            extraservices[idx].CreatedDate = new Date(extraservices[idx].CreatedDate);
                            extraservices[idx].willPay = true;
                        }

                        //Payments
                        var payments = data.ReservationRoomInfo.PaymentsList;
                        $scope.paymentsTemp = angular.copy(data.ReservationRoomInfo.PaymentsList);
                        for (var index in payments) {
                            var temp = new Date(payments[index].CreatedDate);
                            payments[index].CreatedDate = new Date(payments[index].CreatedDate);

                            if ($scope.listUser && $scope.listUser.length > 0) {
                                for (var idx in $scope.listUser) {
                                    var user = $scope.listUser[idx];
                                    if (user.UserId == payments[index].CreatedUserId) {
                                        if (user.Email)
                                            payments[index].UserName = user.Email;
                                        else
                                            payments[index].UserName = user.StaffName;
                                    }

                                }
                            }
                        };
                        if (payments != null && payments.length > 0) {
                            for (var i = 0; i < payments.length - 1; i++) {
                                if (payments[i] != null) {
                                    for (var j = i + 1; j < payments.length; j++) {
                                        if (payments[j] != null && payments[j].RefPaymentId != null && payments[j].RefPaymentId == payments[i].PaymentId) {
                                            payments[i].DeletedUserName = payments[j].UserName;
                                            payments[i].DeletedDate = new Date(payments[j].CreatedDate);
                                            payments[i].DeletedDescription = payments[j].PaymentDescription;
                                            payments[i].isDeleted = true;
                                            payments[j] = null;
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

                            $scope.Payments = newPayments;
                        }


                        //Money
                        for (var index in $scope.Payments) {
                            if ($scope.Payments[index].AmountInSpecificMoney) {
                                $scope.Payments[index].MoneyName = null;
                                for (var idx in $scope.currencies) {
                                    if ($scope.currencies[idx].MoneyId == $scope.Payments[index].MoneyId) {
                                        $scope.Payments[index].MoneyName = $scope.currencies[idx].MoneyName;
                                        angular.forEach($scope.currenciesISO, function (arr) {
                                            if ($scope.currencies[idx].CurrencyId == arr.CurrencyId) {
                                                $scope.Payments[index].MinorUnitInSpecificMoney = arr.MinorUnit;
                                            }
                                        })
                                    }
                                }
                            }
                        }
                        //Room Extra Services
                        $scope.RoomExtraServices = extraservices;
                        if ($scope.listUser && $scope.listUser.length > 0) {
                            for (var index in $scope.RoomExtraServices) {
                                $scope.RoomExtraServices[index].isHide = false;
                                if ($scope.RoomExtraServices[index].DeletedDate) {
                                    $scope.RoomExtraServices[index].DeletedDate = new Date($scope.RoomExtraServices[index].DeletedDate);
                                    $scope.RoomExtraServices[index].isHide = true;
                                }

                                for (var i = 0; i < $scope.listUser.length; i++) {
                                    var user = $scope.listUser[i];
                                    if (user.UserId == $scope.RoomExtraServices[index].CreatedUserId) {
                                        if (user.Email)
                                            $scope.RoomExtraServices[index].UserName = user.Email;
                                        else
                                            $scope.RoomExtraServices[index].UserName = user.StaffName;
                                    }
                                    if ($scope.RoomExtraServices[index].IsDeleted && user.UserId == $scope.RoomExtraServices[index].DeletedBy) {
                                        if (user.Email)
                                            $scope.RoomExtraServices[index].UserNameDeleted = user.Email;
                                        else
                                            $scope.RoomExtraServices[index].UserNameDeleted = user.StaffName;

                                    }
                                }
                            }
                        }

                        $scope.RoomExtraServiceItems = data.ReservationRoomInfo.RoomExtraServiceItemsList;
                        $scope.ExtraServiceItems = data.HotelIndexData.extraService.ExtraServiceItems;
                        $scope.ExtraServices = data.HotelIndexData.extraService.ExtraServiceTypes;
                        for (var index in $scope.RoomExtraServiceItems) {
                            $scope.RoomExtraServiceItems[index].isHide = false;
                            for (var i = 0; i < $scope.ExtraServiceItems.length; i++) {
                                if ($scope.RoomExtraServiceItems[index].ExtraServiceItemId == $scope.ExtraServiceItems[i].ExtraServiceItemId) {
                                    $scope.RoomExtraServiceItems[index].ExtraServiceItemName = $scope.ExtraServiceItems[i].ExtraServiceItemName;
                                    for (var index2 in $scope.ExtraServices) {
                                        if ($scope.ExtraServices[index2].ExtraServiceTypeId == $scope.ExtraServiceItems[i].ExtraServiceTypeId) {
                                            $scope.RoomExtraServiceItems[index].ExtraServiceTypeName = $scope.ExtraServices[index2].ExtraServiceTypeName;
                                            break;
                                        }
                                    }
                                    for (var index3 in $scope.RoomExtraServices)
                                        if ($scope.RoomExtraServices[index3].RoomExtraServiceId == $scope.RoomExtraServiceItems[index].RoomExtraServiceId) {
                                            $scope.RoomExtraServiceItems[index].CreatedDate = new Date($scope.RoomExtraServices[index3].CreatedDate);
                                            console.log($scope.RoomExtraServiceItems[index].CreatedDate);
                                            break;
                                        }
                                    break;
                                }
                            }

                            if ($scope.RoomExtraServices && $scope.RoomExtraServices.length > 0) {
                                for (var i = 0; i < $scope.RoomExtraServices.length; i++) {
                                    if ($scope.RoomExtraServices[i].RoomExtraServiceId.toString() === $scope.RoomExtraServiceItems[index].RoomExtraServiceId.toString()) {
                                        $scope.RoomExtraServiceItems[index].UserName = $scope.RoomExtraServices[i].UserName;

                                        break;
                                    }
                                }
                            }

                            if ($scope.RoomExtraServiceItems[index].IsDeleted) {
                                $scope.RoomExtraServiceItems[index].DeletedDate = new Date($scope.RoomExtraServiceItems[index].DeletedDate);
                                $scope.RoomExtraServiceItems[index].isHide = true;

                                if ($scope.listUser && $scope.listUser.length > 0) {
                                    for (var i = 0; i < $scope.listUser.length; i++) {
                                        var user = $scope.listUser[i];
                                        if (user.UserId === $scope.RoomExtraServiceItems[index].DeletedBy) {
                                            if (user.Email)
                                                $scope.RoomExtraServiceItems[index].DeletedByUserName = user.Email;
                                            else
                                                $scope.RoomExtraServiceItems[index].DeletedByUserName = user.StaffName;

                                            break;
                                        }
                                    }

                                }
                            }

                        }
                        // Calculate Room Price
                        if (data.CalculateRoomPrice != null) {
                            $scope.priceList = data.CalculateRoomPrice;
                            $scope.priceList.totalPriceFullDay = 0;
                            $scope.room.Total = data.CalculateRoomPrice.totalPrice;
                            if (data.CalculateRoomPrice.actualPlanListDateRange != null)
                                $scope.totalPriceTemp = angular.copy(data.CalculateRoomPrice.actualPlanListDateRange.totalPrice);
                            $scope.priceList = resultDataProcess(data.CalculateRoomPrice);
                            $scope.Amount = $scope.remainingAmount();
                            if ($scope.priceList.planListConstantlyFormula.length > 0) {

                                for (var index in $scope.priceList.planListConstantlyFormula) {
                                    var priceTemp = $scope.priceList.planListConstantlyFormula[index];
                                    priceTemp.ConstantlyExtraServices = [];
                                    for (var index2 in $scope.RoomExtraServices) {
                                        if (priceTemp.Range.Start.getTime() <= $scope.RoomExtraServices[index2].CreatedDate.getTime() && $scope.RoomExtraServices[index2].CreatedDate.getTime() <= priceTemp.Range.End.getTime() + 60000) {
                                            priceTemp.ConstantlyExtraServices.push($scope.RoomExtraServices[index2]);
                                        }
                                    }
                                    priceTemp.ConstantlyExtraServiceItems = []
                                    for (var index2 in $scope.RoomExtraServiceItems) {
                                        if (priceTemp.Range.Start.getTime() <= $scope.RoomExtraServiceItems[index2].CreatedDate.getTime() && $scope.RoomExtraServiceItems[index2].CreatedDate.getTime() <= priceTemp.Range.End.getTime() + 60000) {
                                            priceTemp.ConstantlyExtraServiceItems.push($scope.RoomExtraServiceItems[index2]);
                                        }
                                    }
                                }
                                //trường hợp khi thêm dịch vụ ngày 15, past Check Out Departure 14 ->Thanh toán (hiện thị theo ngày)
                                if ($scope.RoomExtraServices.length > 0) {
                                    angular.forEach($scope.RoomExtraServices, function (arr) {
                                        var lastIndex = $scope.priceList.planListConstantlyFormula.length - 1;
                                        var lastPriceTemp = $scope.priceList.planListConstantlyFormula[lastIndex];
                                        var lastDate = new Date(lastPriceTemp.Range.End.getFullYear(), lastPriceTemp.Range.End.getMonth(), lastPriceTemp.Range.End.getDate());
                                        var DateES = new Date(arr.CreatedDate.getFullYear(), arr.CreatedDate.getMonth(), arr.CreatedDate.getDate());
                                        if (lastDate > DateES) {
                                            var newPlanListFullDayFormula = {
                                                Range: {
                                                    Start: angular.copy(arr.CreatedDate),
                                                    End: angular.copy(arr.CreatedDate),
                                                },
                                                ConstantlyExtraServices: [arr]
                                            };
                                            $scope.priceList.planListConstantlyFormula.push(newPlanListFullDayFormula);
                                        }
                                    })
                                }

                                if ($scope.RoomExtraServiceItems.length > 0) {
                                    angular.forEach($scope.RoomExtraServiceItems, function (arr) {
                                        var lastIndex = $scope.priceList.planListConstantlyFormula.length - 1;
                                        var lastPriceTemp = $scope.priceList.planListConstantlyFormula[lastIndex];
                                        var lastDate = new Date(lastPriceTemp.Range.End.getFullYear(), lastPriceTemp.Range.End.getMonth(), lastPriceTemp.Range.End.getDate());
                                        var DateES = new Date(arr.CreatedDate.getFullYear(), arr.CreatedDate.getMonth(), arr.CreatedDate.getDate());
                                        if (DateES > lastDate) {
                                            var newPlanListConstantlyFormula = {
                                                Range: {
                                                    Start: angular.copy(arr.CreatedDate),
                                                    End: angular.copy(arr.CreatedDate),
                                                },
                                                ConstantlyExtraServiceItems: [arr]
                                            };
                                            $scope.priceList.planListConstantlyFormula.push(newPlanListConstantlyFormula);
                                        }
                                    })
                                }
                            }
                            if ($scope.priceList.planListFullDayFormula.length > 0) {
                                for (var index in $scope.priceList.planListFullDayFormula) {
                                    var priceTemp = $scope.priceList.planListFullDayFormula[index];
                                    if ($scope.priceList.planListFullDayFormula[index].formula && $scope.priceList.planListFullDayFormula[index].formula.Range) {
                                        $scope.priceList.planListFullDayFormula[index].formula.Range.Start = new Date($scope.priceList.planListFullDayFormula[index].formula.Range.Start);
                                        $scope.priceList.planListFullDayFormula[index].formula.Range.End = new Date($scope.priceList.planListFullDayFormula[index].formula.Range.End);
                                    }
                                    priceTemp.FullDayExtraServices = [];
                                    for (var index2 in $scope.RoomExtraServices) {
                                        priceTemp.range.Start.setHours(0);
                                        priceTemp.range.Start.setMinutes(0);
                                        priceTemp.range.Start.setMilliseconds(0);
                                        priceTemp.range.End.setHours(0);
                                        priceTemp.range.End.setMinutes(0);
                                        priceTemp.range.End.setMilliseconds(0);
                                        if (priceTemp.range.Start.getTime() <= $scope.RoomExtraServices[index2].CreatedDate.getTime() && $scope.RoomExtraServices[index2].CreatedDate.getTime() <= priceTemp.range.End.getTime()) {
                                            priceTemp.FullDayExtraServices.push($scope.RoomExtraServices[index2]);
                                        }
                                    }

                                    priceTemp.FullDayExtraServiceItems = []
                                    for (var index2 in $scope.RoomExtraServiceItems) {
                                        priceTemp.range.Start.setHours(0);
                                        priceTemp.range.Start.setMinutes(0);
                                        priceTemp.range.Start.setMilliseconds(0);
                                        priceTemp.range.End.setHours(0);
                                        priceTemp.range.End.setMinutes(0);
                                        priceTemp.range.End.setMilliseconds(0);
                                        if ($scope.RoomExtraServiceItems[index2].CreatedDate == null) {
                                            // priceTemp.FullDayExtraServiceItems.push($scope.RoomExtraServiceItems[index2]);
                                        } else {
                                            if (
                                                priceTemp.range.Start.getTime() <= $scope.RoomExtraServiceItems[index2].CreatedDate.getTime() &&
                                                $scope.RoomExtraServiceItems[index2].CreatedDate.getTime() <= (priceTemp.range.End.getTime())) {
                                                priceTemp.FullDayExtraServiceItems.push($scope.RoomExtraServiceItems[index2]);
                                            }
                                        }
                                    }
                                    // calcula for totalPriceFullDay
                                    if ($scope.priceList.planListFullDayFormula[index].formula && $scope.priceList.planListFullDayFormula[index].formula.FormulaValue)
                                        $scope.priceList.totalPriceFullDay = $scope.priceList.totalPriceFullDay + $scope.priceList.planListFullDayFormula[index].formula.FormulaValue;
                                };
                                //trường hợp khi thêm dịch vụ ngày 15, past Check Out Departure 14 ->Thanh toán (hiện thị theo ngày)
                                if ($scope.RoomExtraServices != null && $scope.RoomExtraServices.length > 0) {
                                    angular.forEach($scope.RoomExtraServices, function (arr) {
                                        var lastIndex = $scope.priceList.planListFullDayFormula.length - 1;
                                        var lastPriceTemp = $scope.priceList.planListFullDayFormula[lastIndex];
                                        lastPriceTemp.range.Start.setHours(0);
                                        lastPriceTemp.range.Start.setMinutes(0);
                                        lastPriceTemp.range.Start.setMilliseconds(0);
                                        if (arr.CreatedDate.getTime() > lastPriceTemp.range.End.getTime()) {
                                            var lastDate = lastPriceTemp.range.End.format("dd-mm-yyyy");
                                            var DateES = arr.CreatedDate.format("dd-mm-yyyy");
                                            if (lastDate == DateES) {
                                                if (lastPriceTemp.FullDayExtraServices)
                                                    lastPriceTemp.FullDayExtraServices.push(arr);
                                                else {
                                                    lastPriceTemp.FullDayExtraService = [];
                                                    lastPriceTemp.FullDayExtraServices.push(arr);
                                                }
                                            } else {

                                                var newPlanListFullDayFormula = {
                                                    range: {
                                                        Start: angular.copy(arr.CreatedDate),
                                                        End: angular.copy(arr.CreatedDate),
                                                    },
                                                    FullDayExtraServices: [arr]
                                                };
                                                $scope.priceList.planListFullDayFormula.push(newPlanListFullDayFormula);
                                            }
                                        }
                                    })
                                }

                                if ($scope.RoomExtraServiceItems != null && $scope.RoomExtraServiceItems.length > 0) {
                                    angular.forEach($scope.RoomExtraServiceItems, function (arr) {
                                        var lastIndex = $scope.priceList.planListFullDayFormula.length - 1;
                                        var lastPriceTemp = $scope.priceList.planListFullDayFormula[lastIndex];
                                        lastPriceTemp.range.End.setHours(0);
                                        lastPriceTemp.range.End.setMinutes(0);
                                        lastPriceTemp.range.End.setMilliseconds(0);
                                        if (arr.CreatedDate == null) {} else {
                                            if (arr.CreatedDate.getTime() > lastPriceTemp.range.End.getTime()) {
                                                var lastDate = lastPriceTemp.range.End.format("dd-mm-yyyy");
                                                var DateES = arr.CreatedDate.format("dd-mm-yyyy");
                                                if (lastDate == DateES) {
                                                    if (lastPriceTemp.FullDayExtraServiceItems) {
                                                        lastPriceTemp.FullDayExtraServiceItems.push(arr);
                                                    } else {
                                                        lastPriceTemp.FullDayExtraServiceItems = [];
                                                        lastPriceTemp.FullDayExtraServiceItems.push(arr);
                                                    }
                                                } else {
                                                    var newPlanListFullDayFormula = {
                                                        range: {
                                                            Start: angular.copy(arr.CreatedDate),
                                                            End: angular.copy(arr.CreatedDate),
                                                        },
                                                        FullDayExtraServiceItems: [arr]
                                                    };
                                                    $scope.priceList.planListFullDayFormula.push(newPlanListFullDayFormula);
                                                }
                                            }
                                        }
                                    })
                                }
                            }
                            $scope.priceList.planListHourlyFormula.FullDayExtraServices = [];
                            $scope.priceList.planListHourlyFormula.FullDayExtraServiceItems = [];

                            if ($scope.priceList.planListHourlyFormula && $scope.priceList.planListHourlyFormula.finalHourlyFormula) {
                                for (var index in $scope.RoomExtraServices) {
                                    if ($scope.priceList.planListHourlyFormula.finalHourlyFormula.Range) {
                                        if (
                                            ($scope.priceList.planListHourlyFormula.finalHourlyFormula.Range.Start.getTime() < $scope.RoomExtraServices[index].CreatedDate.getTime()) &&
                                            $scope.RoomExtraServices[index].CreatedDate.getTime() <= $scope.priceList.planListHourlyFormula.finalHourlyFormula.Range.End.getTime() + 60000) {

                                            $scope.priceList.planListHourlyFormula.FullDayExtraServices.push($scope.RoomExtraServices[index]);
                                        }
                                    }
                                }
                            }
                            if ($scope.priceList.planListHourlyFormula && $scope.priceList.planListHourlyFormula.finalHourlyFormula) {
                                for (var index in $scope.RoomExtraServiceItems) {
                                    if ($scope.priceList.planListHourlyFormula.finalHourlyFormula.Range) {
                                        if ($scope.priceList.planListHourlyFormula.finalHourlyFormula.Range.Start.getTime() < $scope.RoomExtraServiceItems[index].CreatedDate.getTime() && $scope.RoomExtraServiceItems[index].CreatedDate.getTime() <= $scope.priceList.planListHourlyFormula.finalHourlyFormula.Range.End.getTime() + 60000) {

                                            $scope.priceList.planListHourlyFormula.FullDayExtraServiceItems.push($scope.RoomExtraServiceItems[index]);
                                        }
                                    }
                                }
                            }

                            $scope.payment = {
                                Amount: $scope.remainingAmount(),
                                PaymentMethodId: $scope.defaultPaymentMethod.PaymentMethodId,
                                MoneyId: $scope.defaultCurrency.MoneyId,
                                PaymentTypeName: "NEW_PAYMENT"
                            };
                            if ($scope.room.BookingStatus == "BOOKED" || $scope.room.BookingStatus == 'NOSHOW') {
                                $scope.payment.PaymentTypeName = "DEPOSIT";
                                $scope.payment.Amount = 0;
                                $scope.room.Total = 0;
                                $scope.Amount = $scope.remainingAmount();
                            }

                            if ($scope.payment.Amount < 0) {
                                $scope.payment.Amount = -$scope.payment.Amount;
                            }
                        }
                        if ($scope.room.BookingStatus == "CHECKOUT") {
                            $scope.Amount = 0;
                        }
                        $scope.originalRoom = angular.copy($scope.room);

                        // $scope.RoomCheckIn = _.filter($scope.ListRoomCheckInToday, function (item) {
                        //     return item.ReservationRoomId == $scope.RRIDParam;
                        // })[0];
                    } // ENd RR
                    if (data.Sharers != null) {
                        $scope.realAdults = 0;
                        $scope.realChild = 0;
                        for (var i in data.Sharers) {
                            if (data.Sharers[i].travellerExtraInfo.IsChild) $scope.realChild += 1;
                            else $scope.realAdults += 1;
                        }
                    }
                }
                // IsPreCheckInCheckOut
                if (data.IsPreCheckInCheckOut != null && data.IsPreCheckInCheckOut != undefined) {
                    $scope.PreCheckInCheckOut = data.IsPreCheckInCheckOut;
                }
                // IsGroupReservation
                $scope.isGroupReservation = false;
                if (data.ReservationRoomInfo != null && data.ReservationRoomInfo != undefined) {
                    if (data.ReservationRoomInfo.Reservations != null && data.ReservationRoomInfo.Reservations != undefined) {
                        if (data.ReservationRoomInfo.Reservations.IsGroup != null && data.ReservationRoomInfo.Reservations.IsGroup != undefined)
                            $scope.isGroupReservation = data.ReservationRoomInfo.Reservations.IsGroup;
                    }
                }
            });

        };

        // passport
        $scope.saveInfoPassport = function () {
            $scope.customer.Fullname = FullnameCustomer;
            $scope.customer.Gender = Gender === "M" ? 0 : 1;
            $scope.customer.IdentityNumber = IdentityNumber;
            if (Birthday) {
                $scope.customer.Birthday = new Date(Birthday);
                $scope.dateString = $scope.customer.Birthday.format('dd/mm/yyyy');
            }

            $scope.customer.ImageLocation = ImageLocation;
            $scope.customer.ValidUntil = new Date(ValidUntil);

            if ($scope.countries !== null && $scope.customer !== null && $scope.countries.length > 0)

                $scope.selectedCountries = _.filter($scope.countries, function (item) {
                    return item.CountryCode == CountryCode;
                })[0];

            // $scope.customer.CountryId = $scope.selectedCountries.CountryId;

            console.log("country passport:", $scope.selectedCountries);
            console.log("customer passport:", $scope.customer);
        }

        $scope.ChangeStatusNoteHousekeeping = function () {
            $scope.IsChangeNoteHousekeeping = true;
        }
      

        $scope.goToReservation = function () {
            var path = '/groupReservationDetail/' + $scope.room.ReservationId;
            $location.path(path);
        }

        $scope.isValidKeyPress = function (evt) {
            if (evt.keyCode != 8 && (evt.keyCode < 47 || evt.keyCode > 57)) {
                if (evt.keyCode != 46)
                    evt.preventDefault();
            }
        }

        $scope.getListRoomCheckin = function ($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        }

        $scope.redirectRoom = function (room) {
            $scope.RoomName = room.RoomName;
            $location.path('reservation/' + room.ReservationRoomId);
        }

        $scope.redirectRoomWithReservationNumber = function (reservationNumber) {
            var processGetReservation = loginFactory.securedGet("api/GroupReservation/GetReservationDetailFilter", "reservationNumber=" + reservationNumber);
            $rootScope.dataLoadingPromise = processGetReservation;
            processGetReservation.success(function (data) {
                if (data.reservation_isgroup == true) {
                    $location.path('groupReservationDetail/' + data.reservation_id);
                } else {
                    $location.path('reservation/' + data.reservation_rooms[0].ReservationRoomId);
                }
            }).error(function (err) {
                $scope.reservationNumber = $scope.reservation_oldNumber;
                dialogService.toastWarn("NO_BOOKING_FOUND");
            });
        }

        $scope.openMenuLogsEmail = function ($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        };

        $scope.openDetailLogEmail = function (log) {
            EmailMarketingFactory.doDetailLogsByTask({
                'Room': $scope.room.Reservations.ReservationNumber,
                'Email': log.Email,
                'Task': log.HotelEmailTask.HotelEmailTaskId,
                'Date': null
            });
        }

        function queryCountriesSearch(query) {
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
        $scope.searchCustomer = function () {
            if ($scope.customer.Fullname == null || $scope.customer.Fullname.length < 2) {
                dialogService.messageBox("WARNING", "FULL_NAME_MUST_LESS_TWO_WORD");
                return;
            }
            $scope.customer.TravellerId = null;
            $scope.customer.Gender = 0;
            $scope.customer.Birthday = null;
            $scope.customer.IdentityNumber = null;
            $scope.customer.Mobile = null;
            $scope.customer.Email = null;
            $scope.customer.Address = null;
            $scope.customer.Note = null;
            $scope.searchCountriesText = null;
            $scope.selectedCountries = selectedCountries;
            var useFullScreen = ($mdMedia('xs'));
            $mdDialog.show({
                controller: SearchSharerController,
                resolve: {
                    countries: function () {
                        return $scope.countries
                    },
                    fullname: function () {
                        return $scope.customer.Fullname
                    }
                },
                templateUrl: 'views/templates/SearchSharer.tmpl.html',
                parent: angular.element(document.body),
                fullscreen: useFullScreen
                // targetEvent: ev,
            }).then(function (SharerModel) {
                if (SharerModel) {
                    console.log('search sharer', SharerModel);
                    if ($scope.countries !== null && $scope.countries.length > 0 && SharerModel.CountryId !== null)
                        $scope.selectedCountries = _.filter($scope.countries, function (citem) {
                            return citem.CountryId == SharerModel.CountryId;
                        })[0];
                    $scope.customer = SharerModel;
                }
            });

            function SearchSharerController($scope, $mdDialog, loginFactory, frontOfficeFactory, countries, fullname) {
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
                        $scope.searchResult = data.lstTravellerNew;
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
                    if (item != undefined) {
                        $scope.selectedCountries = item;

                    } else {
                        $scope.selectedCountries = null;
                    }

                }

                function searchCountriesTextChange(text) {
                    $scope.searchCountriesText = text;
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

        $scope.changeSelectedIndex = function () {
            $rootScope.selectedTabIndex = $scope.data.selectedIndex;
        };

        $scope.remainingAmount = function () {
            var total = 0;
            if ($stateParams.reservationRoomId) {
                total = $scope.room.Total;
                for (var idx in $scope.RoomExtraServices) {
                    if ($scope.RoomExtraServices[idx].willPay && !$scope.RoomExtraServices[idx].IsDeleted && $scope.RoomExtraServices[idx].RoomExtraServiceName != 'EXTRA_SERVICES') {
                        total += $scope.RoomExtraServices[idx].Amount;
                    }
                    if ($scope.RoomExtraServices[idx].willPay && !$scope.RoomExtraServices[idx].IsDeleted && $scope.RoomExtraServices[idx].RoomExtraServiceName == 'EXTRA_SERVICES') {
                        total += ($scope.RoomExtraServices[idx].Amount * $scope.RoomExtraServices[idx].Quantity);
                    }
                };
                for (var idx in $scope.paymentsTemp) {
                    total -= $scope.paymentsTemp[idx].Amount;
                };
            } else {
                for (var index in $scope.paymentList) {
                    total -= $scope.paymentList[index].Amount;
                }
            };
            //làm tròn số thập phân sau , theo tiền tệ
            total = parseFloat(total.toFixed($rootScope.decimals));
            return total;
        };

        function allAvailableRoomUndefine(arrays) {
            return _.all(arrays, function (array) {
                return _.isUndefined(array)
            });
        }

        $scope.$watchGroup(['room.ArrivalDate', 'room.DepartureDate', 'room.RoomTypeId'], function (newValues, oldValues) {
            console.info("new old", newValues, oldValues, allAvailableRoomUndefine(newValues));
            $scope.availableRoom = null;
            if (!allAvailableRoomUndefine(newValues) && $scope.room.RoomTypeId && (!$stateParams.reservationRoomId || $stateParams.roomId)) {

                //AVAILABLE ROOM
                var availableRoomModel = {
                    roomTypeId: $scope.room.RoomTypeId,
                    arrivalDate: $scope.room.ArrivalDate,
                    departureDate: $scope.room.DepartureDate
                };
                var getAvailableRoomsPromise = loginFactory.securedPostJSON("api/Reservation/AvailableRooms", availableRoomModel);
                $rootScope.dataLoadingPromise = getAvailableRoomsPromise;
                getAvailableRoomsPromise.success(function (data) {
                    if (data != null) {
                        $scope.availableRoom = data.sort(function (a, b) {
                            return parseInt(a.OrderNumber) - parseInt(b.OrderNumber);
                        });
                        console.info("AVAILABLE ROOMS", $scope.availableRoom)
                    }
                }).error(function (err) {
                    console.log(err);
                });
            }

        });

        $scope.$watchCollection('room', function (newValues, oldValues) {
            if (_.size(newValues) != 0 && _.size(oldValues) != 0 && !angular.equals(newValues, oldValues) && newValues.ArrivalDate && oldValues.ArrivalDate) {
                if (newValues.RoomTypeId != oldValues.RoomTypeId) {
                    $scope.room.RoomId = 0;
                    $scope.room.RoomPriceId = 0;
                }
                if (newValues.ArrivalDate != oldValues.ArrivalDate && newValues.ArrivalDate >= oldValues.DepartureDate && oldValues.BookingStatus != 'CHECKIN') {
                    var newDepartureDate = addDays(newValues.ArrivalDate, 1);
                    newDepartureDate.setHours(oldValues.DepartureDate.getHours());
                    newDepartureDate.setMinutes(oldValues.DepartureDate.getMinutes());
                    newValues.DepartureDate = newDepartureDate;
                    newValues.BookingStatus = "AVAILABLE";
                    $scope.nextStatuses[newValues.BookingStatus].CHECKIN = 0;
                }


                //var availableRoom = [];
                //$scope.availableRoom = reservationFactory.getAvailableRoom($scope.roomList, newValues.ArrivalDate, newValues.DepartureDate, availableRoom);
                if ((oldValues.BookingStatus == 'BOOKED' || oldValues.BookingStatus == 'NOSHOW') && newValues.BookingStatus == 'CHECKIN') {
                    $scope.room.ArrivalDate = new Date();
                    if ($scope.room.ArrivalDate.getTime() >= oldValues.DepartureDate.getTime()) {
                        $scope.room.DepartureDate = addDays($scope.room.ArrivalDate, 1);
                    } else {
                        $scope.room.DepartureDate = oldValues.DepartureDate;
                    }
                }

                if (newValues.RoomId != 0 && newValues.RoomId != null && !newValues.HouseStatus) {
                    for (var index in $scope.roomList) {
                        if (newValues.RoomId == $scope.roomList[index].RoomId) {
                            newValues.HouseStatus = $scope.roomList[index].HouseStatus;
                            break;
                        }
                    }
                }
                //AVAILABLE PLAN LIST
                $scope.availablePlanList = _.filter($scope.planList, function (item) {
                    return (item.IsActive && item.RoomTypeId && newValues.RoomTypeId && item.RoomTypeId == newValues.RoomTypeId);
                }).sort(function (a, b) {
                    return parseInt(a.Priority) - parseInt(b.Priority);
                });

                if (newValues.RoomId != 0 && newValues.RoomId != null && newValues.RoomId != oldValues.RoomId) {
                    $scope.RoomName = _.filter($scope.availableRoom, function (item) {
                        return (item.RoomId == newValues.RoomId);
                    })[0].RoomName;
                }
            }

            $scope.availablePlanList = _.filter($scope.planList, function (item) {
                return (item.IsActive && item.RoomTypeId && newValues.RoomTypeId && item.RoomTypeId == newValues.RoomTypeId);
            }).sort(function (a, b) {
                return parseInt(a.Priority) - parseInt(b.Priority);
            });
        });

        var originalReservation = {};
        var roomList = roomListFactory.roomList();

        $scope.updateBreakfast = function (breakfast) {
            var updateBreakfastModel = {
                RoomBreakfastId: breakfast.RoomBreakfastId,
                IsBreakfast: breakfast.IsBreakfast
            };
            var updateBreakfast = loginFactory.securedPostJSON("api/Room/UpdateBreakfast", updateBreakfastModel);
            $rootScope.dataLoadingPromise = updateBreakfast;
            updateBreakfast.success(function (data) {
                console.log("Update Breakfast Success");
            }).error(function (err) {
                console.log("ERROR", err);
            })
        };

        $scope.updateRoomType = function () {
            var roomTemp;
            if ($scope.room.RoomId > 0) {
                for (var index in $scope.roomList) {
                    if ($scope.roomList[index].RoomId == $scope.room.RoomId) {
                        roomTemp = $scope.roomList[index];
                        $scope.room.RoomTypeId = roomTemp.RoomTypeId;
                        break;
                    }
                }

            }
        };

        $scope.updateRoomPrice = function () {
            var availablePlan = [];
            if ($scope.room.RoomTypeId > 0) {
                for (var index in $scope.planList) {
                    if ($scope.planList[index].RoomTypeId && $scope.planList[index].RoomTypeId == $scope.room.RoomTypeId) {
                        availablePlan.push($scope.planList[index]);
                    }
                }
                delete $scope.planList;
                $scope.planList = availablePlan;
            }
        }

        function addDays(date, days) {
            var result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        }


        $scope.addTraveller = function ($event) {
            $event.stopPropagation();
        };
        $scope.searchTraveller = function ($event) {
            $event.stopPropagation();
        };

        $scope.changeRoomType = function () {
            var reservationRoom = angular.copy($scope.room);
            var availableRoom = [];
            var arrivalDateTemp = new Date($scope.room.ArrivalDate);
            var departureDateTemp = new Date($scope.room.DepartureDate);
            reservationRoom.reservationNumber = $scope.reservationNumber;
            reservationRoom.roomInfo = $scope.roomInfo;
            reservationRoom.planInfo = $scope.planInfo;
            reservationRoom.customer = $scope.customer;
            reservationRoom.roomTypeInfo = $scope.roomTypeInfo;
            reservationRoom.roomTypes = $scope.roomTypes;
            reservationRoom.availableRoom = $scope.availableRoom;
            reservationRoom.planList = $scope.planList;
            console.log("RR 1", reservationRoom);
            reservationFactory.assignRoom(reservationRoom, null, null);
        };

        $scope.assignRoom = function () {

            var reservationRoom = angular.copy($scope.room);
            reservationRoom.reservationNumber = $scope.reservationNumber;
            reservationRoom.roomInfo = $scope.roomInfo;
            reservationRoom.planInfo = $scope.planInfo;
            reservationRoom.customer = $scope.customer;
            reservationRoom.roomTypeInfo = $scope.roomTypeInfo;
            reservationRoom.roomTypes = $scope.roomTypes;
            reservationRoom.planList = $scope.planList;
            reservationRoom.totalPriceTemp = $scope.totalPriceTemp;

            reservationFactory.assignRoom(reservationRoom, null);
        };



        $scope.editPrice = function () {
            var priceTemp = angular.copy($scope.roomPriceTemp);
            var totalPriceTemp = angular.copy($scope.totalPriceTemp);
            var roomChargesTemp = angular.copy($scope.roomCharges);
            var planInfoTemp = angular.copy($scope.planInfo);
            var priceListTemp = angular.copy($scope.priceList);

            SharedFeaturesFactory.processEditPrice(priceTemp, totalPriceTemp, roomChargesTemp, planInfoTemp, priceListTemp);
        };

        $scope.editNote = function () {
            var selectedRoom = angular.copy($scope.room);
            SharedFeaturesFactory.processEditNote(selectedRoom);
        }

        function checkInTemplateFunction(dataParam) {
            var data = angular.copy(dataParam);
            console.log("DATA PARAMS", data);
            var currentStatus = angular.copy(data.room.BookingStatus);
            data.room.ArrivalDate = new Date();
            data.room.DepartureDate = $scope.room.DepartureDate;
            data.room.BookingStatus = "CHECKIN";
            var rooms = roomListFactory.getRoomById(data.room.RoomId);
            if (reservationGroup && reservationGroup.ReservationId != null) {
                data.room.ReservationId = reservationGroup.ReservationId;
                data.room.IsGroupMaster = false;
            }
            $scope.room.UseLock = rooms.UseLock;
            // if ($scope.currentHotelConnectivities.isUsed) {
            $mdDialog.show({
                    controller: CheckInDialogController,
                    resolve: {
                        roomRemarks: function () {
                            return $scope.roomRemarks;
                        },
                        data: function () {
                            return data;
                        },
                        room: function () {
                            return $scope.room;
                        },
                        currentHotelConnectivities: function () {
                            return $scope.currentHotelConnectivities;
                        },
                        roomName: function () {
                            return $scope.RoomName;
                        }
                    },
                    templateUrl: 'views/templates/checkInDialog.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: null,
                    clickOutsideToClose: false, //fullscreen: useFullScreen
                })
                .then(function (checkInModel) {
                    console.log("isCreateCard", checkInModel.isCreateCard);
                    if ($scope.currentHotelConnectivities.isUsed && checkInModel.isCreateCard == true && rooms.UseLock) {
                        // use NeoLock
                        if ($rootScope.Connectivities != null && $rootScope.Connectivities.code.HotelConnectivityModuleName === "SMART_NEO_LOCK") {
                            var writeCardModel = {
                                RoomName: $scope.RoomName,
                                RoomDescription: rooms.RoomDescription,
                                TravellerName: data.customer.Fullname,
                                ArrivalDate: data.room.ArrivalDate,
                                DepartureDate: data.room.DepartureDate,
                                OverrideOldCards: true
                            };
                            if ($scope.currentHotelConnectivities.IsAutomaticalAddHourCheckout == true) {
                                writeCardModel = smartCardFactory.addHourCheckOutCard(writeCardModel, $scope.currentHotelConnectivities.HourAddToCheckout);
                            }
                            for (var index in $scope.roomRemarks) {
                                if ($scope.roomRemarks[index].RemarkEventCode) {
                                    delete $scope.roomRemarks[index].RemarkEventCode;
                                }
                            }
                            data.roomRemarks = $scope.roomRemarks;
                            data.room.BookingStatus = "CHECKIN";
                            save = loginFactory.securedPostJSON("api/Room/Save", data);
                            $rootScope.dataLoadingPromise = save;
                            save.success(function (id) {
                                if (fibaroProcess && fibaroProcess.server && fibaroProcess.connection.state == 1)
                                    fibaroProcess.server.turnOn(rooms.RoomName);
                                //$rootScope.detailCheckIn = true;
                                var createCard = smartCardFactory.writeCard(writeCardModel, id, checkInModel.reason);
                                createCard.then(function (dataCard) {
                                    if (dataCard.passcode != null) {

                                        frontOfficeFactory.processNoshow($scope.room, $scope.roomCharges, $stateParams.reservationRoomId, function () {
                                            dialogService.toastSuccess($filter("translate")("CREATE_CARD_SUCCESSFUL") + " " + dataCard.passcode);
                                            if (reservationTimeline) {
                                                $state.go("home", {
                                                    reload: true
                                                });
                                                reservationTimeline = false;
                                            } else if (reservationGroup && reservationGroup != null) {
                                                if (reservationGroup.From == "groupReservationDetail") {
                                                    $location.path("groupReservationDetail/" + reservationGroup.ReservationId);
                                                } else if (reservationGroup.From == "groupReservation") {
                                                    $location.path("groupReservation");
                                                } else if (reservationGroup.From == "inhouseGroup") {
                                                    $location.path("inhouseGroup");
                                                }
                                                reservationGroup = null;
                                            } else {
                                                $state.go("reservation", {
                                                    reservationRoomId: id
                                                }, {
                                                    reload: true
                                                });
                                            }
                                        });

                                    } else {
                                        dialogService.messageBox(dataCard.message).then(function (data) {
                                            frontOfficeFactory.processNoshow($scope.room, $scope.roomCharges, $stateParams.reservationRoomId, function () {
                                                if (reservationTimeline) {
                                                    $state.go("home", {
                                                        reload: true
                                                    });
                                                    reservationTimeline = false;
                                                } else if (reservationGroup && reservationGroup != null) {
                                                    if (reservationGroup.From == "groupReservationDetail") {
                                                        $location.path("groupReservationDetail/" + reservationGroup.ReservationId);
                                                    } else if (reservationGroup.From == "groupReservation") {
                                                        $location.path("groupReservation");
                                                    } else if (reservationGroup.From == "inhouseGroup") {
                                                        $location.path("inhouseGroup");
                                                    }
                                                    reservationGroup = null;
                                                } else {
                                                    $state.go("reservation", {
                                                        reservationRoomId: id
                                                    }, {
                                                        reload: true
                                                    });
                                                };
                                            });
                                        });

                                    }

                                }, function () {
                                    dialogService.messageBox(dataCard.message).then(function (data) {
                                        frontOfficeFactory.processNoshow($scope.room, $scope.roomCharges, $stateParams.reservationRoomId, function () {
                                            if (reservationTimeline) {
                                                $state.go("home", {
                                                    reload: true
                                                });
                                                reservationTimeline = false;
                                            } else if (reservationGroup && reservationGroup != null) {
                                                if (reservationGroup.From == "groupReservationDetail") {
                                                    $location.path("groupReservationDetail/" + reservationGroup.ReservationId);
                                                } else if (reservationGroup.From == "groupReservation") {
                                                    $location.path("groupReservation");
                                                } else if (reservationGroup.From == "inhouseGroup") {
                                                    $location.path("inhouseGroup");
                                                }
                                                reservationGroup = null;
                                            } else {
                                                $state.go("reservation", {
                                                    reservationRoomId: id
                                                }, {
                                                    reload: true
                                                });
                                            };
                                        });
                                    });
                                });
                            }).error(function (err) {
                                if (err.Message) {
                                    dialogService.messageBox("Error", err.Message).then(function () {
                                        if (reservationGroup && reservationGroup != null) {
                                            if (reservationGroup.From == "groupReservationDetail") {
                                                $location.path("groupReservationDetail/" + reservationGroup.ReservationId);
                                            } else if (reservationGroup.From == "groupReservation") {
                                                $location.path("groupReservation");
                                            } else if (reservationGroup.From == "inhouseGroup") {
                                                $location.path("inhouseGroup");
                                            }
                                            reservationGroup = null;
                                        } else {
                                            $state.go("reservation", {
                                                reservationRoomId: id
                                            }, {
                                                reload: true
                                            });
                                        }
                                    });
                                } else {
                                    data.room.BookingStatus = "BOOKED";
                                    SharedFeaturesFactory.processConflictReservation(err, data.room, "CHECKIN");
                                }

                            });
                        } else {

                            dialogService.confirm("PLEASE_BE_SURE_THE_VALID_CARD_IS_BEING_INSERTED").then(function () {
                                var writeCardModel = {
                                    RoomName: $scope.RoomName,
                                    TravellerName: data.customer.Fullname,
                                    ArrivalDate: data.room.ArrivalDate,
                                    DepartureDate: data.room.DepartureDate,
                                    OverrideOldCards: true
                                };
                                if ($scope.currentHotelConnectivities.IsAutomaticalAddHourCheckout == true) {
                                    writeCardModel = smartCardFactory.addHourCheckOutCard(writeCardModel, $scope.currentHotelConnectivities.HourAddToCheckout);
                                }
                                for (var index in $scope.roomRemarks) {
                                    if ($scope.roomRemarks[index].RemarkEventCode) {
                                        delete $scope.roomRemarks[index].RemarkEventCode;
                                    }
                                }
                                data.roomRemarks = $scope.roomRemarks;
                                data.room.BookingStatus = "CHECKIN";
                                save = loginFactory.securedPostJSON("api/Room/Save", data);
                                $rootScope.dataLoadingPromise = save;
                                save.success(function (id) {
                                    //$rootScope.detailCheckIn = true;
                                    var createCard = smartCardFactory.writeCardInWalkin(writeCardModel, id, checkInModel.reason);
                                    createCard.then(function (dataCard) {
                                        if (dataCard.Result != null && dataCard.Result == 0 && !$rootScope.writeCardError) {

                                            frontOfficeFactory.processNoshow($scope.room, $scope.roomCharges, $stateParams.reservationRoomId, function () {
                                                dialogService.toast("CHECKIN_AND_CREATE_CARD_SUCCESSFUL");
                                                if (reservationTimeline) {
                                                    $state.go("home", {
                                                        reload: true
                                                    });
                                                    reservationTimeline = false;
                                                } else if (reservationGroup && reservationGroup != null) {
                                                    if (reservationGroup.From == "groupReservationDetail") {
                                                        $location.path("groupReservationDetail/" + reservationGroup.ReservationId);
                                                    } else if (reservationGroup.From == "groupReservation") {
                                                        $location.path("groupReservation");
                                                    } else if (reservationGroup.From == "inhouseGroup") {
                                                        $location.path("inhouseGroup");
                                                    }
                                                    reservationGroup = null;
                                                } else {
                                                    $state.go("reservation", {
                                                        reservationRoomId: id
                                                    }, {
                                                        reload: true
                                                    });
                                                }
                                            });

                                        } else {
                                            dialogService.messageBox("UNABLE_TO_CREATE_NEW_CARD").then(function (data) {
                                                frontOfficeFactory.processNoshow($scope.room, $scope.roomCharges, $stateParams.reservationRoomId, function () {
                                                    if (reservationTimeline) {
                                                        $state.go("home", {
                                                            reload: true
                                                        });
                                                        reservationTimeline = false;
                                                    } else if (reservationGroup && reservationGroup != null) {
                                                        if (reservationGroup.From == "groupReservationDetail") {
                                                            $location.path("groupReservationDetail/" + reservationGroup.ReservationId);
                                                        } else if (reservationGroup.From == "groupReservation") {
                                                            $location.path("groupReservation");
                                                        } else if (reservationGroup.From == "inhouseGroup") {
                                                            $location.path("inhouseGroup");
                                                        }
                                                        reservationGroup = null;
                                                    } else {
                                                        $state.go("reservation", {
                                                            reservationRoomId: id
                                                        }, {
                                                            reload: true
                                                        });
                                                    };
                                                });
                                            });

                                        }

                                    }, function () {
                                        dialogService.messageBox("UNABLE_TO_CREATE_NEW_CARD").then(function (data) {
                                            frontOfficeFactory.processNoshow($scope.room, $scope.roomCharges, $stateParams.reservationRoomId, function () {
                                                if (reservationTimeline) {
                                                    $state.go("home", {
                                                        reload: true
                                                    });
                                                    reservationTimeline = false;
                                                } else if (reservationGroup && reservationGroup != null) {
                                                    if (reservationGroup.From == "groupReservationDetail") {
                                                        $location.path("groupReservationDetail/" + reservationGroup.ReservationId);
                                                    } else if (reservationGroup.From == "groupReservation") {
                                                        $location.path("groupReservation");
                                                    } else if (reservationGroup.From == "inhouseGroup") {
                                                        $location.path("inhouseGroup");
                                                    }
                                                    reservationGroup = null;
                                                } else {
                                                    $state.go("reservation", {
                                                        reservationRoomId: id
                                                    }, {
                                                        reload: true
                                                    });
                                                };
                                            });
                                        });
                                    });
                                }).error(function (err) {
                                    if (err.Message) {
                                        dialogService.messageBox("Error", err.Message).then(function () {
                                            if (reservationGroup && reservationGroup != null) {
                                                if (reservationGroup.From == "groupReservationDetail") {
                                                    $location.path("groupReservationDetail/" + reservationGroup.ReservationId);
                                                } else if (reservationGroup.From == "groupReservation") {
                                                    $location.path("groupReservation");
                                                } else if (reservationGroup.From == "inhouseGroup") {
                                                    $location.path("inhouseGroup");
                                                }
                                                reservationGroup = null;
                                            } else {
                                                $state.go("reservation", {
                                                    reservationRoomId: id
                                                }, {
                                                    reload: true
                                                });
                                            }
                                        });
                                    } else {
                                        // conflictReservationProcess(err);
                                        data.room.BookingStatus = "BOOKED";
                                        SharedFeaturesFactory.processConflictReservation(err, data.room, "CHECKIN");
                                    }

                                });
                            });

                        }
                        // });
                    } else {
                        // var processNoshow = frontOfficeFactory.processNoshow($scope.room, $scope.planInfo, $scope.roomCharges, dates, $stateParams.reservationRoomId);
                        // $rootScope.dataLoadingPromise = processNoshow;
                        // processNoshow.success(function() {
                        frontOfficeFactory.processNoshow($scope.room, $scope.roomCharges, $stateParams.reservationRoomId, function () {
                            for (var index in $scope.roomRemarks) {
                                if ($scope.roomRemarks[index].RemarkEventCode) {
                                    delete $scope.roomRemarks[index].RemarkEventCode;
                                }
                            }
                            data.roomRemarks = $scope.roomRemarks;
                            data.room.BookingStatus = "CHECKIN"
                            console.log("DATA", data);
                            save = loginFactory.securedPostJSON("api/Room/Save", data);
                            $rootScope.dataLoadingPromise = save;
                            save.success(function (id) {
                                dialogService.toast("CHECKIN_SUCCESSFUL");
                                if (reservationTimeline) {
                                    $state.go("home", {
                                        reload: true
                                    });
                                    reservationTimeline = false;
                                } else if (reservationGroup && reservationGroup != null) {
                                    if (reservationGroup.From == "groupReservationDetail") {
                                        $location.path("groupReservationDetail/" + reservationGroup.ReservationId);
                                    } else if (reservationGroup.From == "groupReservation") {
                                        $location.path("groupReservation");
                                    } else if (reservationGroup.From == "inhouseGroup") {
                                        $location.path("inhouseGroup");
                                    }
                                    reservationGroup = null;
                                } else {
                                    $state.go("reservation", {
                                        reservationRoomId: id
                                    }, {
                                        reload: true
                                    });
                                }
                            }).error(function (err) {
                                if (err.Message) {
                                    dialogService.messageBox("Error", err.Message).then(function () {
                                        if (reservationGroup && reservationGroup != null) {
                                            if (reservationGroup.From == "groupReservationDetail") {
                                                $location.path("groupReservationDetail/" + reservationGroup.ReservationId);
                                            } else if (reservationGroup.From == "groupReservation") {
                                                $location.path("groupReservation");
                                            } else if (reservationGroup.From == "inhouseGroup") {
                                                $location.path("inhouseGroup");
                                            }
                                            reservationGroup = null;
                                        } else {
                                            $state.go($state.current, {}, {
                                                reload: true
                                            });
                                        }
                                    });
                                } else {
                                    //conflictReservationProcess(err);
                                    data.room.BookingStatus = "BOOKED";
                                    SharedFeaturesFactory.processConflictReservation(err, data.room, "CHECKIN");
                                } //End Else

                            });
                        });
                    }
                });

            function CheckInDialogController($scope, $mdDialog, roomRemarks, data, room, currentHotelConnectivities, roomName, loginFactory, dialogService) {
                $scope.isCreateCard = true;

                function Init() {
                    $scope.roomRemarks = roomRemarks;
                    $scope.room = room;
                    $scope._selectedRoom = angular.copy(room.Rooms || room);
                    console.log("data", data, $scope.room);
                    $scope.currentHotelConnectivities = currentHotelConnectivities;
                    console.log("$scope.currentHotelConnectivities", $scope.currentHotelConnectivities);
                    if ($scope.room.ReservationRoomId) {
                        var getCardInfo = loginFactory.securedGet("api/Connectivities/GetCardInfomation", "RRID=" + $scope.room.ReservationRoomId + "&roomName=" + roomName);
                        $rootScope.dataLoadingPromise = getCardInfo;
                        getCardInfo.success(function (data) {
                            if (data != null && data.length > 0) {
                                $scope.isCreateCard = false;
                                $scope.isCardExist = true;
                                $scope.cardInfo = data;
                                for (var index in $scope.cardInfo) {
                                    if ($scope.cardInfo[index].CreatedDate) {
                                        $scope.cardInfo[index].CreatedDate = new Date($scope.cardInfo[index].CreatedDate);
                                    }
                                }
                                $scope.cardInfo.sort(function (a, b) {
                                    return a.CreatedDate - b.CreatedDate;
                                });
                            }
                        }).error(function (err) {
                            console.log(err);
                        });
                    } else {

                    }

                    $scope.reason = null;
                }
                Init();
                $scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };

                $scope.processCheckIn = function () {
                    //$mdDialog.hide($scope.isCreateCard);
                    var checkInModel = {
                        isCreateCard: $scope.isCreateCard,
                        reason: $scope.reason
                    }
                    if ($scope.currentHotelConnectivities == false) {
                        checkInModel.isCreateCard = false;
                    }
                    $mdDialog.hide(checkInModel);
                }
            }
            // } else { // NOT USING SMART CARD

            //     for (var index in $scope.roomRemarks) {
            //         if ($scope.roomRemarks[index].RemarkEventCode) {
            //             delete $scope.roomRemarks[index].RemarkEventCode;
            //         }
            //     }
            //     data.roomRemarks = $scope.roomRemarks;
            //     data.room.BookingStatus = "CHECKIN"
            //     console.log("DATA", data);
            //     save = loginFactory.securedPostJSON("api/Room/Save", data);
            //     $rootScope.dataLoadingPromise = save;
            //     save.success(function (id) {
            //         var processNoshow = frontOfficeFactory.processNoshow($scope.room, $scope.roomCharges, $stateParams.reservationRoomId, function () {
            //             dialogService.toast("CHECKIN_SUCCESSFUL");
            //             if (reservationTimeline) {
            //                 $state.go("home", {
            //                     reload: true
            //                 });
            //                 reservationTimeline = false;
            //             } else if (reservationGroup && reservationGroup != null) {
            //                 if (reservationGroup.From == "groupReservationDetail") {
            //                     $location.path("groupReservationDetail/" + reservationGroup.ReservationId);
            //                 } else if (reservationGroup.From == "groupReservation") {
            //                     $location.path("groupReservation");
            //                 } else if (reservationGroup.From == "inhouseGroup") {
            //                     $location.path("inhouseGroup");
            //                 }
            //                 reservationGroup = null;
            //             } else {
            //                 $state.go("reservation", {
            //                     reservationRoomId: id
            //                 }, {
            //                         reload: true
            //                     });
            //             }
            //         });
            //         // console.log(processNoshow);

            //         // $rootScope.dataLoadingPromise = processNoshow;
            //         // processNoshow.success(function() {

            //         // });
            //     }).error(function (err) {
            //         if (err.Message) {
            //             dialogService.messageBox("Error", err.Message).then(function () {
            //                 if (reservationGroup && reservationGroup != null) {
            //                     if (reservationGroup.From == "groupReservationDetail") {
            //                         $location.path("groupReservationDetail/" + reservationGroup.ReservationId);
            //                     } else if (reservationGroup.From == "groupReservation") {
            //                         $location.path("groupReservation");
            //                     } else if (reservationGroup.From == "inhouseGroup") {
            //                         $location.path("inhouseGroup");
            //                     }
            //                     reservationGroup = null;
            //                 } else {
            //                     $state.go($state.current, {}, {
            //                         reload: true
            //                     });
            //                 }
            //             });
            //         } else {
            //             //checkin sớm thì bị conflict
            //             // SharedFeaturesFactory.setFeatureModel(err);
            //             // SharedFeaturesFactory.setBaseModel(data.room);
            //             data.room.BookingStatus = "BOOKED";
            //             SharedFeaturesFactory.processConflictReservation(err, data.room, "CHECKIN");
            //             //conflictReservationProcess(err);
            //         } //End Else

            //     });
            // }

        }

        var dates = {
            convert: function (d) {
                return (
                    d.constructor === Date ? d :
                    d.constructor === Array ? new Date(d[0], d[1], d[2]) :
                    d.constructor === Number ? new Date(d) :
                    d.constructor === String ? new Date(d) :
                    typeof d === "object" ? new Date(d.year, d.month, d.date) :
                    NaN
                );
            },
            compare: function (a, b) {
                return (
                    isFinite(a = this.convert(a).valueOf()) &&
                    isFinite(b = this.convert(b).valueOf()) ?
                    (a > b) - (a < b) :
                    NaN
                );
            },
            inRange: function (d, start, end) {
                return (
                    isFinite(d = this.convert(d).valueOf()) &&
                    isFinite(start = this.convert(start).valueOf()) &&
                    isFinite(end = this.convert(end).valueOf()) ?
                    start <= d && d <= end :
                    NaN
                );
            }
        }

        $scope.getCountryItem = function (CountryId) {
            var result = $scope.countries.find(function (item) {
                if (item.CountryId === CountryId) {
                    return item;
                }
            }, CountryId);
            return result;
        }

        //WORK_ORDER
        $scope.repeatChange = function (item) {
            var nowD = new Date();
            if (item.Repeat) {
                var lastIndex = item.RoomExtraServiceItems.length - 1;
                switch (item.Repeat) {
                    case 'FIRST':
                        var tmpD = new Date(item.RoomExtraServiceItems[0].DateUsed);
                        if (nowD < tmpD) {
                            item.RoomExtraServiceItems[0].IsSelected = true;
                            angular.forEach(item.RoomExtraServiceItems.slice(1), function (roomExtraItem) {
                                roomExtraItem.IsSelected = false;
                            });
                        }
                        break;
                    case 'EVERYDAY':

                        angular.forEach(item.RoomExtraServiceItems, function (roomExtraItem) {
                            var tmpD = new Date(roomExtraItem.DateUsed);
                            if (nowD < tmpD) {
                                roomExtraItem.IsSelected = true;
                            }
                        });
                        break;
                    case 'LAST':
                        var tmpD = new Date(item.RoomExtraServiceItems[lastIndex].DateUsed);
                        if (nowD < tmpD) {
                            item.RoomExtraServiceItems[lastIndex].IsSelected = true;
                        }
                        angular.forEach(item.RoomExtraServiceItems.slice(0, lastIndex), function (roomExtraItem) {
                            roomExtraItem.IsSelected = false;
                        });
                        break;
                    case 'CUSTOM':
                        angular.forEach(item.RoomExtraServiceItems, function (roomExtraItem) {
                            var tmpD = new Date(roomExtraItem.DateUsed);
                            if (nowD < tmpD) {
                                roomExtraItem.IsSelected = false;
                            }
                        });
                        break;
                    default:
                        break;
                }
            }
        }

        $scope.roomExtraServiceItem_Click = function (roomExtraServiceItem) {
            if ($scope.checkPast(roomExtraServiceItem.DateUsed)) {
                return 0;
            }
            var isChon = !roomExtraServiceItem.IsSelected;
            roomExtraServiceItem.IsSelected = isChon;
            if (roomExtraServiceItem.RoomExtraServiceItemId > 0) {
                roomExtraServiceItem.IsDeleted = !isChon;
                if (roomExtraServiceItem.IsDeleted) {
                    var item = {
                        RoomExtraServiceItemId: roomExtraServiceItem.RoomExtraServiceItemId,
                        RoomExtraServiceId: roomExtraServiceItem.RoomExtraServiceId,
                        DeletedReason: ''
                    }
                    $scope.deleteExtraServiceItem(null, item);
                }
            }
        }

        $scope.ScrollRightWO = function (index) {
            var leftPos = jQuery("#row_wo_" + index + " .md-virtual-repeat-scroller").scrollLeft() + 2 * 50;
            jQuery("#row_wo_" + index + " .md-virtual-repeat-scroller").animate({
                scrollLeft: leftPos
            }, 100);
            if (leftPos <= 1) {
                jQuery(".btn_keyboard_arrow_left" + index).addClass("disabledBTN");
            } else {
                jQuery(".btn_keyboard_arrow_left" + index).removeClass("disabledBTN");
            }
        }

        $scope.ScrollLeftWO = function (index) {
            var leftPos = jQuery("#row_wo_" + index + " .md-virtual-repeat-scroller").scrollLeft() - 2 * 50;
            jQuery("#row_wo_" + index + " .md-virtual-repeat-scroller").animate({
                scrollLeft: leftPos
            }, 100);
            if (leftPos <= 1) {
                jQuery(".btn_keyboard_arrow_left" + index).addClass("disabledBTN");
            } else {
                jQuery(".btn_keyboard_arrow_left" + index).removeClass("disabledBTN");
            }
        }

        $scope.checkPast = function (date) {
            var tmpDate = new Date(date);
            var nowD = new Date();
            return nowD.getTime() > tmpDate.getTime();
        }

        $scope.isWeeked = function (date) {
            var tmpDate = new Date(date);
            return (tmpDate.getDay() == 0 || tmpDate.getDay() == 6);
        }

        //SAVE RESERVATION
        $scope.isClick = false;
        $scope.Save = function (status) {
            if ($scope.isClick) return;
            $scope.isClick = true;
            setTimeout(function () {
                $scope.isClick = false;
            }, 1000);
            var payment = angular.copy($scope.payment);
            var Paykeys = ["RES_NO", "ROOM", "NOTIFICATION_NEWPAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER", "NOTIFICATION_BOOKED_CONTENT", "NOTIFICATION_BOOKED_NAN_CONTENT", "NOTIFICATION_DISCOUNT_ROOM_PRICE"];
            var languagePayKeys = {};
            for (var idx in Paykeys) {
                languagePayKeys[Paykeys[idx]] = $filter("translate")(Paykeys[idx]);
            }

            var dataTemp = {
                customer: $scope.customer,
                room: $scope.room,
                sharerList: $scope.sharerList,
                paymentList: $scope.paymentList,
                company: $scope.selectedCompany,
                source: $scope.selectedSource,
                market: $scope.selectedMarket,
                //postedItems: $rootScope.postItems
            };


            if ($rootScope.postedItems && $rootScope.postItems.items) {
                dataTemp.postedItems = $rootScope.postedItems;
                dataTemp.postedNoItem = null;
            } else {
                dataTemp.postedItems = null;
                dataTemp.postedNoItem = $rootScope.postedNoItem;
            }

            if ($scope.roomPriceTemp == undefined) {
                dataTemp.room.Price = $scope.room.Price;
            } else {
                dataTemp.room.Price = $scope.roomPriceTemp;
            }

            var data = angular.copy(dataTemp);

            if (data.customer.Birthday) {
                data.customer.Birthday = new Date(data.customer.Birthday);
            }


            data.languageKeys = languagePayKeys;


            if (status == 'CHECKIN') {
                if ($scope.room.DepartureDate < new Date()) {
                    dialogService.messageBox("CAN_NOT_CHECK_IN_DUE_TO_THE_DEPARTURE_DATE_WAS_IN_THE_PAST");
                    return;
                }

                if (typeof ($scope.room.DiscountFlat) == 'undefined' || typeof ($scope.room.DiscountPercentage) == 'undefined') {

                    dialogService.messageBox("DISCOUNT_INVALID", "THE_TOTAL_OF_DISCOUNT_INVALID");
                    $scope.room.DiscountFlat = 0;
                    return;
                }


                if (!$scope.room.RoomId || parseInt($scope.room.RoomId) == 0) {
                    dialogService.messageBox("MISSING_ROOM", "PLEASE_SELECT_A_ROOM_TO_PERFORM_CHECKIN_ACTION");
                    return;
                }

                if (!$scope.room.RoomPriceId) {
                    dialogService.messageBox("MISSING_ROOM_PRICE", "PLEASE_SELECT_A_ROOM_PRICE_TYPE_TO_PERFORM_RESERVE_ACTION");
                    return;
                }

                if (!$scope.customer.Fullname) {
                    dialogService.messageBox("MISSING_CUSTOMER", "PLEASE_CREATE_NEW_OR_CHOOSE_AT_LEAST_ONE_CUSTOMER_TO_PERFORM_CHECKIN_ACTION");
                    return;
                }
                if ($scope.customer.Fullname.length > 50) {
                    dialogService.messageBox("WARNING", "FULLNAME_LENGTH_MUST_NOT_BIGGER_(50)_CHARACTERS_TO_PERFORM_CHECKIN_ACTION");
                    return;
                }
                if (!$scope.room.RoomPriceId) {
                    dialogService.messageBox("MISSING_RATE", "PLEASE_SELECT_A_PRICE_RATE_TO_PERFORM_CHECKIN_ACTION");
                    return;
                }

                if ($scope.room.ArrivalDate > $scope.room.DepartureDate) {
                    dialogService.messageBox("INVALID_ARRIVAL/DEPARTURE_DATE", "PLEASE_SELECT_A_VALID_DATE_TO_PERFORM_CHECKIN_ACTION");
                    return;
                }

                if ($scope.room.Adults <= 0 || $scope.room.Adults == undefined || $scope.room.Adults == '') {
                    dialogService.messageBox("MISSING_NUMBER_ADULTS", "PLEASE_TYPE_AT_LEAST_ONE_ADULT");
                    return;
                }

                if ($scope.customer.Email != undefined && $scope.customer.Email != "") {
                    var re = /^(([^<>()\[\]\.,;:\s@]+(\.[^<>()\[\]\.,;:\s@]+)*)|)@(([^<>()[\]\.,;:\s@]+\.)+[^<>()[\]\.,;:\s@]{2,})$/i;
                    var testEmail = re.test(String($scope.customer.Email).toLowerCase());
                    if (!testEmail) {
                        dialogService.messageBox("ERROR", "INVALID_EMAIL");
                        return;
                    }
                }

                if ($scope.selectedCountries == null) {
                    dialogService.messageBox("MISSING_COUNTRY", "COUNTRY_VALUE_FIELD_CAN_NOT_BE_BLANK");
                    return;
                } else {
                    data.customer.CountryId = $scope.selectedCountries.CountryId;
                }


                if ($scope.selectedCountries == null) {
                    var defaultCountry = _.filter($scope.countries, function (item) {
                        return item.CountryCode.toLowerCase() == "vn";
                    });

                    data.customer.CountryId = defaultCountry[0].CountryId;

                } else {
                    data.customer.CountryId = $scope.selectedCountries.CountryId;
                }


                if ($scope.room.HouseStatus == 'DIRTY' || ($scope.roomInfo && $scope.roomInfo.HouseStatus == 'DIRTY')) {
                    dialogService.confirm("ROOM_DIRTY", "DO_YOU_WANT_TO_CONTINUE?").then(function () {
                        checkInTemplateFunction(data);
                    });
                } else {
                    checkInTemplateFunction(data);
                }



            }

            if (status == 'BOOKED') {
                if (typeof ($scope.room.DiscountFlat) == 'undefined' || typeof ($scope.room.DiscountPercentage) == 'undefined') {
                    dialogService.messageBox("DISCOUNT_INVALID", "THE_TOTAL_OF_DISCOUNT_INVALID");
                    $scope.room.DiscountFlat = 0;
                    return;
                }

                if (!$scope.room.RoomTypeId) {
                    dialogService.messageBox("MISSING_ROOM_TYPE", "PLEASE_SELECT_A_ROOM_TYPE_TO_PERFORM_RESERVE_ACTION");
                    return;
                }
                if (!$scope.room.RoomPriceId) {
                    dialogService.messageBox("MISSING_ROOM_PRICE", "PLEASE_SELECT_A_ROOM_PRICE_TYPE_TO_PERFORM_RESERVE_ACTION");
                    return;
                }
                if (!$scope.customer.Fullname) {
                    dialogService.messageBox("MISSING_CUSTOMER", "PLEASE_CREATE_NEW_OR_CHOOSE_AT_LEAST_ONE_CUSTOMER_TO_PERFORM_RESERVE_ACTION");
                    return;
                }
                if ($scope.customer.Fullname.length > 50) {
                    dialogService.messageBox("WARNING", "FULLNAME_LENGTH_MUST_NOT_BIGGER_(50)_CHARACTERS_TO_PERFORM_RESERVE_ACTION");
                    return;
                }

                if ($scope.room.ArrivalDate > $scope.room.DepartureDate) {
                    dialogService.messageBox("INVALID_ARRIVAL/DEPARTURE_DATE", "PLEASE_SELECT_A_VALID_DATE_TO_PERFORM_RESERVE_ACTION");
                    return;
                }

                if ($scope.room.Adults <= 0 || $scope.room.Adults == undefined || $scope.room.Adults == '') {
                    dialogService.messageBox("MISSING_NUMBER_ADULTS", "PLEASE_TYPE_AT_LEAST_ONE_ADULT");
                    return;
                }

                if ($scope.customer.Email != undefined && $scope.customer.Email != "") {
                    var re = /^(([^<>()\[\]\.,;:\s@]+(\.[^<>()\[\]\.,;:\s@]+)*)|)@(([^<>()[\]\.,;:\s@]+\.)+[^<>()[\]\.,;:\s@]{2,})$/i;
                    var testEmail = re.test(String($scope.customer.Email).toLowerCase());
                    if (!testEmail) {
                        dialogService.messageBox("ERROR", "INVALID_EMAIL");
                        return;
                    }
                }

                if ($scope.selectedCountries == null) {
                    dialogService.messageBox("MISSING_COUNTRY", "COUNTRY_VALUE_FIELD_CAN_NOT_BE_BLANK");
                    return;
                } else {
                    data.customer.CountryId = $scope.selectedCountries.CountryId;
                }

                data.room.Adults = $scope.room.Adults;
                data.room.Child = $scope.room.Child;

                data.room.BookingStatus = "BOOKED";
                data.room.ArrivalDate = $scope.room.ArrivalDate;
                $log.log($scope.room.ArrivalDate);
                data.room.DepartureDate = $scope.room.DepartureDate;
                data.roomRemarks = $scope.roomRemarks;
                var save;

                for (var index in $scope.roomRemarks) {
                    if ($scope.roomRemarks[index].RemarkEventCode) {
                        delete $scope.roomRemarks[index].RemarkEventCode;
                    }
                }
                data.roomRemarks = $scope.roomRemarks;
                data.room.BookingStatus = "BOOKED"
                if (reservationGroup && reservationGroup.ReservationId != null) {
                    data.room.ReservationId = reservationGroup.ReservationId;
                    data.room.IsGroupMaster = false;
                }
                console.log('Save=>data:', data);
                save = loginFactory.securedPostJSON("api/Room/Save", data);
                $rootScope.dataLoadingPromise = save;
                save.success(function (id) {
                    dialogService.toast("RESERVE_ROOM_SUCCESSFUL");
                    if (reservationTimeline) {
                        $state.go("home", {
                            reload: true
                        });
                        reservationTimeline = false;
                    } else if (reservationGroup && reservationGroup != null) {
                        if (reservationGroup.From == "groupReservationDetail") {
                            $location.path("groupReservationDetail/" + reservationGroup.ReservationId);
                        } else if (reservationGroup.From == "groupReservation") {
                            $location.path("groupReservation");
                        } else if (reservationGroup.From == "inhouseGroup") {
                            $location.path("inhouseGroup");
                        }
                        reservationGroup = null;
                    } else {
                        $state.go("reservation", {
                            reservationRoomId: id
                        }, {
                            reload: true
                        });
                    }

                }).error(function (err) {
                    if (err.Message) {
                        dialogService.messageBox("Error", err.Message).then(function () {
                            $state.go($state.current, {}, {
                                reload: true
                            });
                        });
                    } else {
                        //conflictReservationProcess(err);
                        data.room.BookingStatus = "BOOKED";
                        SharedFeaturesFactory.processConflictReservation(err, data.room, "BOOKED");
                    } //End Else

                });
                //}
            }

            if (status === 'CHECKOUT' || status === 'PAYMENT_AND_CHECKOUT') {
                if (payment.PaymentMethodId === 4 && ($scope.selectedCompanyCityLedger == null || $scope.selectedCompanyCityLedger.CompanyId == null)) {
                    dialogService.messageBox("INVALID_CITY_LEDGER", "PLEASE_SELECT_A_CITY_LEDGER");
                    return;
                }

                var reservationRoomId = $scope.room.ReservationRoomId;
                var dateCheckOut = new Date().toISOString();
                var isExistFutureServices = loginFactory.securedPostJSON("api/HouseKeeping/IsExistFutureServices?reservationRoomId=" + reservationRoomId + "&dateCheckOut=" + dateCheckOut, "");
                $rootScope.dataLoadingPromise = isExistFutureServices;
                isExistFutureServices.success(function (data2) {
                    if (data2.length != 0) {
                        var confirm = $mdDialog.confirm()
                            .title($filter("translate")("WARNING") + "!")
                            .textContent($filter("translate")("THE_ROOM_IS_NOW_HAVING_SOME_WORK_ORDER_IN_THE_FUTURE"))
                            .ariaLabel('Lucky day')
                            //.targetEvent(ev)
                            .ok($filter("translate")("DELETE_BEFORE_PAY"))
                            .cancel($filter("translate")("KEEP_INTACT_AND_PAY"));

                        $mdDialog.show(confirm).then(function () {
                            var lstRoomExtraserviceDel = data2;
                            var itemDeletes = [];
                            angular.forEach(lstRoomExtraserviceDel, function (value, key) {
                                // console.log(key + ': ' + value);
                                value.DeletedReason = "Unused";
                                var itemDelete = {
                                    roomExtraServiceItems: value,
                                    languageKeys: null
                                }
                                itemDeletes.push(itemDelete);
                            });
                            var promise = loginFactory.securedPostJSON("api/Room/DeleteListExtraServiceItem", itemDeletes);
                            $rootScope.dataLoadingPromise = promise;
                            promise.success(
                                function (data) {
                                    console.log("GET THERE");
                                    dialogService.toast("DELETE_EXTRA_SERVICE_ITEM_SUCCESSFUL");
                                    $localStorage.processExtraService = true;
                                    $state.go($state.current, {}, {
                                        reload: true
                                    });
                                }
                            ).error(
                                function (error) {
                                    dialogService.messageBox(error.Message);
                                }
                            );
                        }, function () {
                            var statusPreCheckInCheckOut = '';
                            if ($scope.PreCheckInCheckOut != null && $scope.PreCheckInCheckOut != undefined) {
                                statusPreCheckInCheckOut = $scope.PreCheckInCheckOut.Status;
                            }
                            var isGroup = $scope.isGroupReservation;

                            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));
                            console.log('TEST', $scope.RoomName);

                            var keys = ["ROOM_MONTHLY", "ROOM_WEEKLY", "ROOM_FULL_DAY", "ROOM_DAY_NIGHT", "ROOM_HOURLY", "MINIBAR", "LAUNDRY", "EXTRA_ROOM_CHARGE", "COMPENSATION", "EXTRA_SERVICES", "FULL_DAY_EARLY_CHECKIN", "FULL_DAY_LATE_CHECKOUT", "DAY_NIGHT_EARLY_CHECKIN", "DAY_NIGHT_LATE_CHECKOUT", "EXTRA_ADULTS", "EXTRA_CHILDREN", "PAYMENT", "DISCOUNT_MONEY_OFF", "DISCOUNT_PERCENT_OFF", "FREE", "NOTIFICATION_BOOKED_CONTENT", "NOTIFICATION_BOOKED_NAN_CONTENT"];
                            var languageKeys = {};
                            for (var idx in keys) {
                                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
                            }
                            data.languageKeys = languageKeys;

                            if ($scope.room.ArrivalDate) {
                                data.room.ArrivalDate = $scope.room.ArrivalDate;
                            }

                            if ($scope.applyPastCheckOut) {
                                if ($scope.room.DepartureDate) {
                                    data.room.DepartureDate = $scope.room.DepartureDate;
                                }
                            } else {
                                data.room.DepartureDate = new Date();
                            }
                            $scope.room.RoomName = $scope.RoomName;
                            data.room.Price = $scope.roomPriceTemp;
                            if (status == 'PAYMENT_AND_CHECKOUT') {
                                $scope.data.selectedIndex = 4;
                            }
                            data.room.BookingStatus = "CHECKOUT";
                            data.room.Adults = $scope.calculateAdults;
                            data.room.Child = $scope.calculateChildren;
                            var reservationIdTemp = data.room.Reservations.ReservationId;
                            //if reservation is group, must back to group detail to payment or check out.
                            if (isGroup) {
                                //back to group
                                $mdDialog.show({
                                        controller: BackToGroupDetailController,
                                        resolve: {
                                            reservationId: function () {
                                                return reservationIdTemp;
                                            }
                                        },
                                        templateUrl: 'views/templates/backToGroupDetail.tmpl.html',
                                        parent: angular.element(document.body),
                                        targetEvent: null,
                                        clickOutsideToClose: false,
                                        fullscreen: useFullScreen
                                    })
                                    .then(function (reservationId) {
                                        $location.path("groupReservationDetail/" + reservationId);
                                    }, function () {

                                    });

                                function BackToGroupDetailController($scope, $mdDialog, reservationId) {
                                    function Init() {
                                        $scope.ReservationId = reservationId;
                                    }
                                    Init();
                                    $scope.hide = function () {
                                        $mdDialog.hide();
                                    };
                                    $scope.cancel = function () {
                                        $mdDialog.cancel();
                                    };
                                    $scope.goToGroup = function () {
                                        $mdDialog.hide($scope.ReservationId);
                                    };
                                }
                            } else {
                                $mdDialog.show({
                                        controller: CheckOutAndPaymentDialogController,
                                        resolve: {
                                            statusPre: function () {
                                                return statusPreCheckInCheckOut;
                                            },
                                            roomRemarks: function () {
                                                return $scope.roomRemarks;
                                            },
                                            data: function () {
                                                return data;
                                            },
                                            room: function () {
                                                return $scope.room;
                                            },
                                            isCheckoutAndPayment: function () {
                                                if (status === 'PAYMENT_AND_CHECKOUT') {
                                                    return true;
                                                } else {
                                                    return false;
                                                }
                                            },
                                            payment: function () {
                                                var paymentTemp = angular.copy($scope.payment);
                                                if (paymentTemp.PaymentMethodId === 4 && paymentTemp.PaymentTypeName === "NEW_PAYMENT") {
                                                    paymentTemp.CompanyId = $scope.selectedCompanyCityLedger.CompanyId
                                                }
                                                console.log('PaymentTemp:', paymentTemp);
                                                if ($scope.Amount < 0) {
                                                    // If amount < 0, auto set payment method to refund
                                                    paymentTemp.PaymentTypeName = "REFUND";
                                                    paymentTemp.Amount = -paymentTemp.Amount;
                                                }
                                                //
                                                if (paymentTemp.MoneyId != $scope.defaultCurrency.MoneyId) {
                                                    for (var index in $scope.currencies) {
                                                        if ($scope.currencies[index].MoneyId == paymentTemp.MoneyId) {
                                                            var decimal = _.filter($scope.currenciesISO, function (item) {
                                                                return item.CurrencyId == $scope.currencies[index].CurrencyId;
                                                            })[0].MinorUnit;
                                                            paymentTemp.AmountInSpecificMoney = paymentTemp.Amount;
                                                            paymentTemp.Amount = paymentTemp.Amount * $scope.currencies[index].ExchangeRate;
                                                            break;
                                                        }
                                                    }
                                                }
                                                return paymentTemp;
                                            },
                                            paymentAmountString: function () {
                                                var paymentAmountTmp = '';
                                                var paymentTmp = angular.copy($scope.payment);
                                                if ($scope.Amount < 0) {
                                                    paymentTmp.Amount = -paymentTmp.Amount;
                                                }
                                                if (paymentTmp.MoneyId != $scope.defaultCurrency.MoneyId) {
                                                    for (var index in $scope.currencies) {
                                                        if ($scope.currencies[index].MoneyId == paymentTmp.MoneyId) {
                                                            var decimal = _.filter($scope.currenciesISO, function (item) {
                                                                return item.CurrencyId == $scope.currencies[index].CurrencyId;
                                                            })[0].MinorUnit;
                                                            paymentTmp.AmountInSpecificMoney = paymentTmp.Amount;
                                                            paymentTmp.Amount = paymentTmp.Amount * $scope.currencies[index].ExchangeRate;
                                                            paymentAmountTmp = $filter("currency")(paymentTmp.Amount) + "(" + $scope.currencies[index].MoneyName + " " + paymentTmp.AmountInSpecificMoney.toFixed(decimal) + ")";
                                                            break;
                                                        }
                                                    }
                                                } else {
                                                    paymentAmountTmp = $filter("currency")(paymentTmp.Amount);
                                                }
                                                return paymentAmountTmp;
                                            },
                                            currentHotelConnectivities: function () {
                                                return $scope.currentHotelConnectivities;
                                            },
                                            showEmail: function () {
                                                return $scope.showEmail;
                                            }
                                        },
                                        templateUrl: 'views/templates/checkOutDialog.tmpl.html',
                                        parent: angular.element(document.body),
                                        targetEvent: null,
                                        clickOutsideToClose: false,
                                        fullscreen: useFullScreen
                                    })
                                    .then(function (answer) {

                                    }, function () {

                                    });

                                function CheckOutAndPaymentDialogController($scope, $mdDialog, smartCardFactory, statusPre, roomRemarks, data, room, isCheckoutAndPayment, payment, paymentAmountString, loginFactory, dialogService, currentHotelConnectivities, showEmail) {
                                    function Init() {
                                        $scope.statusPreCheckInCheckOut = statusPre;
                                        $scope.roomRemarks = roomRemarks;
                                        $scope.room = room;
                                        $scope.isCheckoutAndPayment = isCheckoutAndPayment;
                                        $scope.payment = payment;
                                        $scope.paymentAmountString = paymentAmountString;
                                        $scope.showEmail = showEmail;
                                        if ($scope.showEmail) {
                                            $scope.SendEmail = true;
                                        }
                                    }
                                    Init();
                                    $scope.hide = function () {
                                        $mdDialog.hide();
                                    };
                                    $scope.cancel = function () {
                                        $mdDialog.cancel();
                                    };

                                    function processIsInputCardToCheckOut(callback) {
                                        console.log('Connectivities CheckOut', currentHotelConnectivities);
                                        //check Pre CheckOut
                                        if ($scope.room && $scope.room.IsPreCheckOut) {
                                            callback(true);
                                            return;
                                        }
                                        if (currentHotelConnectivities && currentHotelConnectivities.isUsed && $scope.room.Rooms.UseLock) {
                                            //use card to checkout
                                            // use NeoLock
                                            if ($rootScope.Connectivities != null && $rootScope.Connectivities.code.HotelConnectivityModuleName === "SMART_NEO_LOCK" && currentHotelConnectivities.IsInputCardToCheckout) {
                                                var writeCardModel = {
                                                    RoomName: $scope.room.Rooms.RoomName,
                                                    RoomDescription: $scope.room.Rooms.RoomDescription,
                                                    TravellerName: $scope.room.Travellers.Fullname,
                                                    ArrivalDate: new Date(),
                                                    DepartureDate: $scope.room.DepartureDate,
                                                    OverrideOldCards: true
                                                };

                                                if ($rootScope.IsAutomaticalAddHourCheckout == true) {
                                                    writeCardModel = smartCardFactory.addHourCheckOutCard(writeCardModel, $rootScope.HourAddToCheckout);
                                                };
                                                var cardPromise = smartCardFactory.reWriteCard(writeCardModel, $scope.room.ReservationRoomId, null);
                                                cardPromise.then(function (data) {
                                                    console.log("DATA PROMISE", data.Result);
                                                    if (data.passcode != null) {
                                                        //dialogService.toastSuccess($filter("translate")("CREATE_CARD_SUCCESSFUL") + " " + data.passcode);
                                                        callback(true);
                                                    } else {
                                                        dialogService.messageBox(data.message);
                                                        callback(false);
                                                    }
                                                });
                                            } else {
                                                if (currentHotelConnectivities.IsInputCardToCheckout) {
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
                                                            /*
                                                            else if(dataCard && dataCard.RoomName){
                                                                var CurrentRoomNameLength=$scope.room.RoomName.length;
                                                                var CardRoomNameLength=dataCard.RoomName.length;
                                                                if(dataCard.RoomName.length>CurrentRoomNameLength){
                                                                    var roomTmp=angular.copy(
                                                                        //cắt chuỗi từ vị trí CardRoomNameLength-CurrentRoomNameLength, kết thúc ở CardRoomNameLength
                                                                        dataCard.RoomName.slice(CardRoomNameLength-CurrentRoomNameLength,CardRoomNameLength)
                                                                    );
                                                                    if(roomTmp==$scope.room.RoomName){
                                                                        callback(true);
                                                                    }else{
                                                                        dialogService.messageBox("CARD_IS_NOT_CORRECT_ROOM");
                                                                        callback(false);
                                                                    }
                                                                }
                                                            }*/
                                                        });
                                                    });
                                                } else
                                                    callback(true);
                                            }
                                        } else {
                                            //Not use Smart Card
                                            callback(true);
                                        }
                                    };

                                    function deleteCard() {
                                        if ($scope.room && $scope.room.IsPreCheckOut) {
                                            return;
                                        }
                                        if (currentHotelConnectivities && currentHotelConnectivities.isUsed) {
                                            if (currentHotelConnectivities.IsInputCardToCheckout) {
                                                var deleteCardModel = {
                                                    ArrivalDate: $scope.room.ArrivalDate,
                                                    DepartureDate: $scope.room.DepartureDate,
                                                    RoomName: $scope.room.RoomName,
                                                    TravellerId: $scope.room.ReservationRoomId,
                                                };
                                                smartCardFactory.deleteCard(deleteCardModel);
                                            }
                                        }
                                    }
                                    //
                                    $scope.processCheckOut = function () {
                                        $mdDialog.hide();
                                        data.room.BookingStatus = "CHECKOUT";
                                        var processCheckOut = loginFactory.securedPostJSON("api/Room/Save", data)
                                        $rootScope.dataLoadingPromise = processCheckOut;
                                        processCheckOut.success(function (id) {
                                            dialogService.toast("CHECKOUT_SUCCESSFUL");
                                            $state.go($state.current, {}, {
                                                reload: true
                                            });
                                        }).error(function (err) {
                                            if (err.Message) {
                                                dialogService.messageBox("ERROR", err.Message);
                                            } else {
                                                //conflictReservationProcess(err);
                                                data.room.BookingStatus = "CHECKIN";
                                                SharedFeaturesFactory.processConflictReservation(err, data.room, "CHECKOUT");
                                            }
                                        });
                                    };
                                    $scope.processPaymentAndCheckOut = function () {
                                        //Payment
                                        var payment = angular.copy($scope.payment);
                                        var Paykeys = ["RES_NO", "ROOM", "NOTIFICATION_NEWPAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER", "NOTIFICATION_BOOKED_CONTENT", "NOTIFICATION_BOOKED_NAN_CONTENT"];
                                        var languagePayKeys = {};
                                        for (var idx in Paykeys) {
                                            languagePayKeys[Paykeys[idx]] = $filter("translate")(Paykeys[idx]);
                                        }

                                        payment.ReservationRoomId = $stateParams.reservationRoomId;


                                        var paymentModel = {
                                            payment: payment,
                                            languageKeys: languagePayKeys
                                        }
                                        var promise = loginFactory.securedPostJSON("api/Room/AddPayment", paymentModel);
                                        $rootScope.dataLoadingPromise = promise;
                                        promise.success(function (id) {
                                            $mdDialog.hide();
                                            data.room.BookingStatus = "CHECKOUT";
                                            // neu la checkou_and_payment
                                            var processCheckOut = loginFactory.securedPostJSON("api/Room/Save", data)
                                            //$rootScope.dataLoadingPromise = processCheckOut;
                                            processCheckOut.success(function (id) {
                                                dialogService.toast("CHECKOUT_SUCCESSFUL");
                                                $state.go($state.current, {}, {
                                                    reload: true
                                                });
                                            }).error(function (err) {
                                                if (err.Message) {
                                                    dialogService.messageBox("ERROR", err.Message);
                                                } else {
                                                    //conflictReservationProcess(err);
                                                    data.room.BookingStatus = "CHECKIN";
                                                    SharedFeaturesFactory.processConflictReservation(err, data.room, "CHECKOUT");
                                                }
                                            });
                                            $state.go($state.current, {}, {
                                                reload: true
                                            });
                                        }).error(function (err) {
                                            if (err.Message) {
                                                dialogService.messageBox("ERROR", err.Message);
                                            }
                                        });
                                    };
                                    $scope.processPayment = function () {
                                        var payment = angular.copy($scope.payment);
                                        console.log('payment:', payment);
                                        var keys = ["RES_NO", "ROOM", "NOTIFICATION_NEWPAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER", "NOTIFICATION_BOOKED_CONTENT", "NOTIFICATION_BOOKED_NAN_CONTENT"];
                                        var languageKeys = {};
                                        for (var idx in keys) {
                                            languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
                                        }

                                        console.log('payment:', payment);
                                        payment.ReservationRoomId = $stateParams.reservationRoomId;
                                        var paymentModel = {
                                            payment: payment,
                                            languageKeys: languageKeys
                                        };
                                        var promise = loginFactory.securedPostJSON("api/Room/AddPayment", paymentModel);
                                        $rootScope.dataLoadingPromise = promise;
                                        promise.success(function (id) {
                                            $mdDialog.hide();
                                            dialogService.toast("ADD_PAYMENT_SUCCESSFUL");
                                            $state.go($state.current, {}, {
                                                reload: true
                                            });
                                        }).error(function (err) {
                                            if (err.Message) {
                                                dialogService.messageBox("ERROR", err.Message);
                                            }
                                        });
                                    };

                                    //loinq - edited by quannn(myblue)
                                    $scope.isClick = false;
                                    $scope.processQuickCheckOut = function () {
                                        if ($scope.isClick) return;
                                        $scope.isClick = true;
                                        setTimeout(function () {
                                            $scope.isClick = false;
                                        }, 1000);

                                        if ($scope.statusPreCheckInCheckOut == 'PRE_CHECKOUT') {
                                            var paymentModel = null;
                                            if ($scope.isCheckoutAndPayment) {
                                                //Payment
                                                var Paykeys = ["RES_NO", "ROOM", "NOTIFICATION_CHECKOUT_MES", "NOTIFICATION_NEWPAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER", "NOTIFICATION_BOOKED_CONTENT", "NOTIFICATION_BOOKED_NAN_CONTENT"];
                                                var languagePayKeys = {};
                                                for (var idx in Paykeys) {
                                                    languagePayKeys[Paykeys[idx]] = $filter("translate")(Paykeys[idx]);
                                                };
                                                payment.ReservationRoomId = $stateParams.reservationRoomId;

                                                var paymentModel = {
                                                    payment: payment,
                                                    languageKeys: languagePayKeys
                                                }
                                            } else {
                                                var Paykeys = ["RES_NO", "ROOM", "NOTIFICATION_CHECKOUT_MES", "NOTIFICATION_NEWPAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER", "NOTIFICATION_BOOKED_CONTENT", "NOTIFICATION_BOOKED_NAN_CONTENT"];
                                                var languagePayKeys = {};
                                                for (var idx in Paykeys) {
                                                    languagePayKeys[Paykeys[idx]] = $filter("translate")(Paykeys[idx]);
                                                };
                                                var paymentModel = {
                                                    payment: {},
                                                    languageKeys: languagePayKeys
                                                }
                                            }
                                            data.room.BookingStatus = "CHECKOUT";
                                            var model = {
                                                Payments: paymentModel,
                                                RoomData: data,
                                                SendEmail: $scope.SendEmail
                                            }
                                            $mdDialog.hide();
                                            var promise = loginFactory.securedPostJSON("api/Room/ProcessQuickCheckOut", model);
                                            $rootScope.dataLoadingPromise = promise;
                                            promise.success(function (id) {
                                                deleteCard();
                                                dialogService.toast("CHECKOUT_SUCCESSFUL");
                                                $state.go($state.current, {}, {
                                                    reload: true
                                                });
                                            }).error(function (err) {
                                                if (err.Message) {
                                                    dialogService.messageBox("ERROR", err.Message).then(function () {
                                                        $state.go($state.current, {}, {
                                                            reload: true
                                                        });
                                                    });

                                                } else {
                                                    //conflictReservationProcess(err);                                    
                                                    data.room.BookingStatus = "CHECKIN";
                                                    SharedFeaturesFactory.processConflictReservation(err, data.room, "CHECKOUT");
                                                }
                                            })
                                        } else {
                                            //check smart card
                                            if (processIsInputCardToCheckOut(function (dataCard) {
                                                    //
                                                    if (!dataCard) return;
                                                    var paymentModel = null;
                                                    if ($scope.isCheckoutAndPayment) {
                                                        //Payment
                                                        var Paykeys = ["RES_NO", "ROOM", "NOTIFICATION_CHECKOUT_MES", "NOTIFICATION_NEWPAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER", "NOTIFICATION_BOOKED_CONTENT", "NOTIFICATION_BOOKED_NAN_CONTENT"];
                                                        var languagePayKeys = {};
                                                        for (var idx in Paykeys) {
                                                            languagePayKeys[Paykeys[idx]] = $filter("translate")(Paykeys[idx]);
                                                        };
                                                        payment.ReservationRoomId = $stateParams.reservationRoomId;

                                                        var paymentModel = {
                                                            payment: payment,
                                                            languageKeys: languagePayKeys
                                                        }
                                                    } else {
                                                        var Paykeys = ["RES_NO", "ROOM", "NOTIFICATION_CHECKOUT_MES", "NOTIFICATION_NEWPAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER", "NOTIFICATION_BOOKED_CONTENT", "NOTIFICATION_BOOKED_NAN_CONTENT"];
                                                        var languagePayKeys = {};
                                                        for (var idx in Paykeys) {
                                                            languagePayKeys[Paykeys[idx]] = $filter("translate")(Paykeys[idx]);
                                                        };
                                                        var paymentModel = {
                                                            payment: {},
                                                            languageKeys: languagePayKeys
                                                        }
                                                    }
                                                    //process checkout
                                                    data.room.BookingStatus = "CHECKOUT";
                                                    var model = {
                                                        Payments: paymentModel,
                                                        RoomData: data,
                                                        SendEmail: $scope.SendEmail
                                                    }
                                                    $mdDialog.hide();
                                                    var promise = loginFactory.securedPostJSON("api/Room/ProcessQuickCheckOut", model);
                                                    $rootScope.dataLoadingPromise = promise;
                                                    promise.success(function (id) {
                                                        deleteCard();
                                                        dialogService.toast("CHECKOUT_SUCCESSFUL");
                                                        $state.go($state.current, {}, {
                                                            reload: true
                                                        });
                                                    }).error(function (err) {
                                                        if (err.Message) {
                                                            dialogService.messageBox("ERROR", err.Message).then(function () {
                                                                $state.go($state.current, {}, {
                                                                    reload: true
                                                                });
                                                            });

                                                        } else {
                                                            //conflictReservationProcess(err);
                                                            data.room.BookingStatus = "CHECKIN";
                                                            SharedFeaturesFactory.processConflictReservation(err, data.room, "CHECKOUT");
                                                        }
                                                    })
                                                }));
                                        }
                                    };
                                }
                            }
                        });
                    } else {
                        var statusPreCheckInCheckOut = '';
                        if ($scope.PreCheckInCheckOut != null && $scope.PreCheckInCheckOut != undefined) {
                            statusPreCheckInCheckOut = $scope.PreCheckInCheckOut.Status;
                        }
                        var isGroup = $scope.isGroupReservation;

                        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));
                        console.log('TEST', $scope.RoomName);

                        var keys = ["ROOM_MONTHLY", "ROOM_WEEKLY", "ROOM_FULL_DAY", "ROOM_DAY_NIGHT", "ROOM_HOURLY", "MINIBAR", "LAUNDRY", "EXTRA_ROOM_CHARGE", "COMPENSATION", "EXTRA_SERVICES", "FULL_DAY_EARLY_CHECKIN", "FULL_DAY_LATE_CHECKOUT", "DAY_NIGHT_EARLY_CHECKIN", "DAY_NIGHT_LATE_CHECKOUT", "EXTRA_ADULTS", "EXTRA_CHILDREN", "PAYMENT", "DISCOUNT_MONEY_OFF", "DISCOUNT_PERCENT_OFF", "FREE", "NOTIFICATION_BOOKED_CONTENT", "NOTIFICATION_BOOKED_NAN_CONTENT"];
                        var languageKeys = {};
                        for (var idx in keys) {
                            languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
                        }
                        data.languageKeys = languageKeys;

                        if ($scope.room.ArrivalDate) {
                            data.room.ArrivalDate = $scope.room.ArrivalDate;
                        }

                        if ($scope.applyPastCheckOut) {
                            if ($scope.room.DepartureDate) {
                                data.room.DepartureDate = $scope.room.DepartureDate;
                            }
                        } else {
                            data.room.DepartureDate = new Date();
                        }
                        $scope.room.RoomName = $scope.RoomName;
                        data.room.Price = $scope.roomPriceTemp;
                        if (status == 'PAYMENT_AND_CHECKOUT') {
                            $scope.data.selectedIndex = 4;
                        }
                        data.room.BookingStatus = "CHECKOUT";
                        data.room.Adults = $scope.calculateAdults;
                        data.room.Child = $scope.calculateChildren;
                        var reservationIdTemp = data.room.Reservations.ReservationId;
                        //if reservation is group, must back to group detail to payment or check out.
                        if (isGroup) {
                            //back to group
                            $mdDialog.show({
                                    controller: BackToGroupDetailController,
                                    resolve: {
                                        reservationId: function () {
                                            return reservationIdTemp;
                                        }
                                    },
                                    templateUrl: 'views/templates/backToGroupDetail.tmpl.html',
                                    parent: angular.element(document.body),
                                    targetEvent: null,
                                    clickOutsideToClose: false,
                                    fullscreen: useFullScreen
                                })
                                .then(function (reservationId) {
                                    $location.path("groupReservationDetail/" + reservationId);
                                }, function () {

                                });

                            function BackToGroupDetailController($scope, $mdDialog, reservationId) {
                                function Init() {
                                    $scope.ReservationId = reservationId;
                                }
                                Init();
                                $scope.hide = function () {
                                    $mdDialog.hide();
                                };
                                $scope.cancel = function () {
                                    $mdDialog.cancel();
                                };
                                $scope.goToGroup = function () {
                                    $mdDialog.hide($scope.ReservationId);
                                };
                            }
                        } else {
                            $mdDialog.show({
                                    controller: CheckOutAndPaymentDialogController,
                                    resolve: {
                                        statusPre: function () {
                                            return statusPreCheckInCheckOut;
                                        },
                                        roomRemarks: function () {
                                            return $scope.roomRemarks;
                                        },
                                        data: function () {
                                            return data;
                                        },
                                        room: function () {
                                            return $scope.room;
                                        },
                                        isCheckoutAndPayment: function () {
                                            if (status === 'PAYMENT_AND_CHECKOUT') {
                                                return true;
                                            } else {
                                                return false;
                                            }
                                        },
                                        payment: function () {
                                            var paymentTemp = angular.copy($scope.payment);
                                            if (paymentTemp.PaymentMethodId === 4 && paymentTemp.PaymentTypeName === "NEW_PAYMENT") {
                                                paymentTemp.CompanyId = $scope.selectedCompanyCityLedger.CompanyId
                                            }
                                            console.log('PaymentTemp:', paymentTemp);
                                            if ($scope.Amount < 0) {
                                                // If amount < 0, auto set payment method to refund
                                                paymentTemp.PaymentTypeName = "REFUND";
                                                paymentTemp.Amount = -paymentTemp.Amount;
                                            }
                                            //
                                            if (paymentTemp.MoneyId != $scope.defaultCurrency.MoneyId) {
                                                for (var index in $scope.currencies) {
                                                    if ($scope.currencies[index].MoneyId == paymentTemp.MoneyId) {
                                                        var decimal = _.filter($scope.currenciesISO, function (item) {
                                                            return item.CurrencyId == $scope.currencies[index].CurrencyId;
                                                        })[0].MinorUnit;
                                                        paymentTemp.AmountInSpecificMoney = paymentTemp.Amount;
                                                        paymentTemp.Amount = paymentTemp.Amount * $scope.currencies[index].ExchangeRate;
                                                        break;
                                                    }
                                                }
                                            }
                                            return paymentTemp;
                                        },
                                        paymentAmountString: function () {
                                            var paymentAmountTmp = '';
                                            var paymentTmp = angular.copy($scope.payment);
                                            if ($scope.Amount < 0) {
                                                paymentTmp.Amount = -paymentTmp.Amount;
                                            }
                                            if (paymentTmp.MoneyId != $scope.defaultCurrency.MoneyId) {
                                                for (var index in $scope.currencies) {
                                                    if ($scope.currencies[index].MoneyId == paymentTmp.MoneyId) {
                                                        var decimal = _.filter($scope.currenciesISO, function (item) {
                                                            return item.CurrencyId == $scope.currencies[index].CurrencyId;
                                                        })[0].MinorUnit;
                                                        paymentTmp.AmountInSpecificMoney = paymentTmp.Amount;
                                                        paymentTmp.Amount = paymentTmp.Amount * $scope.currencies[index].ExchangeRate;
                                                        paymentAmountTmp = $filter("currency")(paymentTmp.Amount) + "(" + $scope.currencies[index].MoneyName + " " + paymentTmp.AmountInSpecificMoney.toFixed(decimal) + ")";
                                                        break;
                                                    }
                                                }
                                            } else {
                                                paymentAmountTmp = $filter("currency")(paymentTmp.Amount);
                                            }
                                            return paymentAmountTmp;
                                        },
                                        currentHotelConnectivities: function () {
                                            return $scope.currentHotelConnectivities;
                                        },
                                        showEmail: function () {
                                            return $scope.showEmail;
                                        }
                                    },
                                    templateUrl: 'views/templates/checkOutDialog.tmpl.html',
                                    parent: angular.element(document.body),
                                    targetEvent: null,
                                    clickOutsideToClose: false,
                                    fullscreen: useFullScreen
                                })
                                .then(function (answer) {

                                }, function () {

                                });

                            function CheckOutAndPaymentDialogController($scope, $mdDialog, smartCardFactory, statusPre, roomRemarks, data, room, isCheckoutAndPayment, payment, paymentAmountString, loginFactory, dialogService, currentHotelConnectivities, showEmail) {
                                function Init() {
                                    $scope.statusPreCheckInCheckOut = statusPre;
                                    $scope.roomRemarks = roomRemarks;
                                    $scope.room = room;
                                    $scope.isCheckoutAndPayment = isCheckoutAndPayment;
                                    $scope.payment = payment;
                                    $scope.paymentAmountString = paymentAmountString;
                                    $scope.showEmail = showEmail;
                                    if ($scope.showEmail) {
                                        $scope.SendEmail = true;
                                    }
                                }
                                Init();
                                $scope.hide = function () {
                                    $mdDialog.hide();
                                };
                                $scope.cancel = function () {
                                    $mdDialog.cancel();
                                };

                                function processIsInputCardToCheckOut(callback) {
                                    console.log('Connectivities CheckOut', currentHotelConnectivities);
                                    //check Pre CheckOut
                                    if ($scope.room && $scope.room.IsPreCheckOut) {
                                        callback(true);
                                        return;
                                    }
                                    if (currentHotelConnectivities && currentHotelConnectivities.isUsed && $scope.room.Rooms.UseLock) {
                                        //use card to checkout
                                        // use NeoLock
                                        if ($rootScope.Connectivities != null && $rootScope.Connectivities.code.HotelConnectivityModuleName === "SMART_NEO_LOCK" && currentHotelConnectivities.IsInputCardToCheckout) {
                                            var writeCardModel = {
                                                RoomName: $scope.room.Rooms.RoomName,
                                                RoomDescription: $scope.room.Rooms.RoomDescription,
                                                TravellerName: $scope.room.Travellers.Fullname,
                                                ArrivalDate: new Date(),
                                                DepartureDate: $scope.room.DepartureDate,
                                                OverrideOldCards: true
                                            };

                                            if ($rootScope.IsAutomaticalAddHourCheckout == true) {
                                                writeCardModel = smartCardFactory.addHourCheckOutCard(writeCardModel, $rootScope.HourAddToCheckout);
                                            };
                                            var cardPromise = smartCardFactory.reWriteCard(writeCardModel, $scope.room.ReservationRoomId, null);
                                            cardPromise.then(function (data) {
                                                console.log("DATA PROMISE", data.Result);
                                                if (data.passcode != null) {
                                                    //dialogService.toastSuccess($filter("translate")("CREATE_CARD_SUCCESSFUL") + " " + data.passcode);
                                                    callback(true);
                                                } else {
                                                    dialogService.messageBox(data.message);
                                                    callback(false);
                                                }
                                            });
                                        } else {
                                            if (currentHotelConnectivities.IsInputCardToCheckout) {
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
                                                        /*
                                                        else if(dataCard && dataCard.RoomName){
                                                            var CurrentRoomNameLength=$scope.room.RoomName.length;
                                                            var CardRoomNameLength=dataCard.RoomName.length;
                                                            if(dataCard.RoomName.length>CurrentRoomNameLength){
                                                                var roomTmp=angular.copy(
                                                                    //cắt chuỗi từ vị trí CardRoomNameLength-CurrentRoomNameLength, kết thúc ở CardRoomNameLength
                                                                    dataCard.RoomName.slice(CardRoomNameLength-CurrentRoomNameLength,CardRoomNameLength)
                                                                );
                                                                if(roomTmp==$scope.room.RoomName){
                                                                    callback(true);
                                                                }else{
                                                                    dialogService.messageBox("CARD_IS_NOT_CORRECT_ROOM");
                                                                    callback(false);
                                                                }
                                                            }
                                                        }*/
                                                    });
                                                });
                                            } else
                                                callback(true);
                                        }
                                    } else {
                                        //Not use Smart Card
                                        callback(true);
                                    }
                                };

                                function deleteCard() {
                                    if ($scope.room && $scope.room.IsPreCheckOut) {
                                        return;
                                    }
                                    if (currentHotelConnectivities && currentHotelConnectivities.isUsed) {
                                        if (currentHotelConnectivities.IsInputCardToCheckout) {
                                            var deleteCardModel = {
                                                ArrivalDate: $scope.room.ArrivalDate,
                                                DepartureDate: $scope.room.DepartureDate,
                                                RoomName: $scope.room.RoomName,
                                                TravellerId: $scope.room.ReservationRoomId,
                                            };
                                            smartCardFactory.deleteCard(deleteCardModel);
                                        }
                                    }
                                }
                                //
                                $scope.processCheckOut = function () {
                                    $mdDialog.hide();
                                    data.room.BookingStatus = "CHECKOUT";
                                    var processCheckOut = loginFactory.securedPostJSON("api/Room/Save", data)
                                    $rootScope.dataLoadingPromise = processCheckOut;
                                    processCheckOut.success(function (id) {
                                        dialogService.toast("CHECKOUT_SUCCESSFUL");
                                        $state.go($state.current, {}, {
                                            reload: true
                                        });
                                    }).error(function (err) {
                                        if (err.Message) {
                                            dialogService.messageBox("ERROR", err.Message);
                                        } else {
                                            //conflictReservationProcess(err);
                                            data.room.BookingStatus = "CHECKIN";
                                            SharedFeaturesFactory.processConflictReservation(err, data.room, "CHECKOUT");
                                        }
                                    });
                                };
                                $scope.processPaymentAndCheckOut = function () {
                                    //Payment
                                    var payment = angular.copy($scope.payment);
                                    var Paykeys = ["RES_NO", "ROOM", "NOTIFICATION_NEWPAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER", "NOTIFICATION_BOOKED_CONTENT", "NOTIFICATION_BOOKED_NAN_CONTENT"];
                                    var languagePayKeys = {};
                                    for (var idx in Paykeys) {
                                        languagePayKeys[Paykeys[idx]] = $filter("translate")(Paykeys[idx]);
                                    }

                                    payment.ReservationRoomId = $stateParams.reservationRoomId;


                                    var paymentModel = {
                                        payment: payment,
                                        languageKeys: languagePayKeys
                                    }
                                    var promise = loginFactory.securedPostJSON("api/Room/AddPayment", paymentModel);
                                    $rootScope.dataLoadingPromise = promise;
                                    promise.success(function (id) {
                                        $mdDialog.hide();
                                        data.room.BookingStatus = "CHECKOUT";
                                        // neu la checkou_and_payment
                                        var processCheckOut = loginFactory.securedPostJSON("api/Room/Save", data)
                                        //$rootScope.dataLoadingPromise = processCheckOut;
                                        processCheckOut.success(function (id) {
                                            dialogService.toast("CHECKOUT_SUCCESSFUL");
                                            $state.go($state.current, {}, {
                                                reload: true
                                            });
                                        }).error(function (err) {
                                            if (err.Message) {
                                                dialogService.messageBox("ERROR", err.Message);
                                            } else {
                                                //conflictReservationProcess(err);
                                                data.room.BookingStatus = "CHECKIN";
                                                SharedFeaturesFactory.processConflictReservation(err, data.room, "CHECKOUT");
                                            }
                                        });
                                        $state.go($state.current, {}, {
                                            reload: true
                                        });
                                    }).error(function (err) {
                                        if (err.Message) {
                                            dialogService.messageBox("ERROR", err.Message);
                                        }
                                    });
                                };
                                $scope.processPayment = function () {
                                    var payment = angular.copy($scope.payment);
                                    console.log('payment:', payment);
                                    var keys = ["RES_NO", "ROOM", "NOTIFICATION_NEWPAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER", "NOTIFICATION_BOOKED_CONTENT", "NOTIFICATION_BOOKED_NAN_CONTENT"];
                                    var languageKeys = {};
                                    for (var idx in keys) {
                                        languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
                                    }

                                    console.log('payment:', payment);
                                    payment.ReservationRoomId = $stateParams.reservationRoomId;
                                    var paymentModel = {
                                        payment: payment,
                                        languageKeys: languageKeys
                                    };
                                    var promise = loginFactory.securedPostJSON("api/Room/AddPayment", paymentModel);
                                    $rootScope.dataLoadingPromise = promise;
                                    promise.success(function (id) {
                                        $mdDialog.hide();
                                        dialogService.toast("ADD_PAYMENT_SUCCESSFUL");
                                        $state.go($state.current, {}, {
                                            reload: true
                                        });
                                    }).error(function (err) {
                                        if (err.Message) {
                                            dialogService.messageBox("ERROR", err.Message);
                                        }
                                    });
                                };

                                //loinq - edited by quannn(myblue)
                                $scope.processQuickCheckOut = function () {
                                    if ($scope.isClick) return;
                                    $scope.isClick = true;
                                    setTimeout(function () {
                                        $scope.isClick = false;
                                    }, 1000);
                                    if ($scope.statusPreCheckInCheckOut == 'PRE_CHECKOUT') {
                                        var paymentModel = null;
                                        if ($scope.isCheckoutAndPayment) {
                                            //Payment
                                            var Paykeys = ["RES_NO", "ROOM", "NOTIFICATION_CHECKOUT_MES", "NOTIFICATION_NEWPAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER", "NOTIFICATION_BOOKED_CONTENT", "NOTIFICATION_BOOKED_NAN_CONTENT"];
                                            var languagePayKeys = {};
                                            for (var idx in Paykeys) {
                                                languagePayKeys[Paykeys[idx]] = $filter("translate")(Paykeys[idx]);
                                            };
                                            payment.ReservationRoomId = $stateParams.reservationRoomId;

                                            var paymentModel = {
                                                payment: payment,
                                                languageKeys: languagePayKeys
                                            }
                                        } else {
                                            var Paykeys = ["RES_NO", "ROOM", "NOTIFICATION_CHECKOUT_MES", "NOTIFICATION_NEWPAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER", "NOTIFICATION_BOOKED_CONTENT", "NOTIFICATION_BOOKED_NAN_CONTENT"];
                                            var languagePayKeys = {};
                                            for (var idx in Paykeys) {
                                                languagePayKeys[Paykeys[idx]] = $filter("translate")(Paykeys[idx]);
                                            };
                                            var paymentModel = {
                                                payment: {},
                                                languageKeys: languagePayKeys
                                            }
                                        }
                                        data.room.BookingStatus = "CHECKOUT";
                                        var model = {
                                            Payments: paymentModel,
                                            RoomData: data,
                                            SendEmail: $scope.SendEmail
                                        }
                                        $mdDialog.hide();
                                        var promise = loginFactory.securedPostJSON("api/Room/ProcessQuickCheckOut", model);
                                        $rootScope.dataLoadingPromise = promise;
                                        promise.success(function (id) {
                                            deleteCard();
                                            dialogService.toast("CHECKOUT_SUCCESSFUL");
                                            $state.go($state.current, {}, {
                                                reload: true
                                            });
                                        }).error(function (err) {
                                            if (err.Message) {
                                                dialogService.messageBox("ERROR", err.Message).then(function () {
                                                    $state.go($state.current, {}, {
                                                        reload: true
                                                    });
                                                });

                                            } else {
                                                //conflictReservationProcess(err);                                    
                                                data.room.BookingStatus = "CHECKIN";
                                                SharedFeaturesFactory.processConflictReservation(err, data.room, "CHECKOUT");
                                            }
                                        })
                                    } else {
                                        //check smart card
                                        if (processIsInputCardToCheckOut(function (dataCard) {
                                                //
                                                if (!dataCard) return;
                                                var paymentModel = null;
                                                if ($scope.isCheckoutAndPayment) {
                                                    //Payment
                                                    var Paykeys = ["RES_NO", "ROOM", "NOTIFICATION_CHECKOUT_MES", "NOTIFICATION_NEWPAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER", "NOTIFICATION_BOOKED_CONTENT", "NOTIFICATION_BOOKED_NAN_CONTENT"];
                                                    var languagePayKeys = {};
                                                    for (var idx in Paykeys) {
                                                        languagePayKeys[Paykeys[idx]] = $filter("translate")(Paykeys[idx]);
                                                    };
                                                    payment.ReservationRoomId = $stateParams.reservationRoomId;

                                                    var paymentModel = {
                                                        payment: payment,
                                                        languageKeys: languagePayKeys
                                                    }
                                                } else {
                                                    var Paykeys = ["RES_NO", "ROOM", "NOTIFICATION_CHECKOUT_MES", "NOTIFICATION_NEWPAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER", "NOTIFICATION_BOOKED_CONTENT", "NOTIFICATION_BOOKED_NAN_CONTENT"];
                                                    var languagePayKeys = {};
                                                    for (var idx in Paykeys) {
                                                        languagePayKeys[Paykeys[idx]] = $filter("translate")(Paykeys[idx]);
                                                    };
                                                    var paymentModel = {
                                                        payment: {},
                                                        languageKeys: languagePayKeys
                                                    }
                                                }
                                                //process checkout
                                                data.room.BookingStatus = "CHECKOUT";
                                                var model = {
                                                    Payments: paymentModel,
                                                    RoomData: data,
                                                    SendEmail: $scope.SendEmail
                                                }
                                                $mdDialog.hide();
                                                var promise = loginFactory.securedPostJSON("api/Room/ProcessQuickCheckOut", model);
                                                $rootScope.dataLoadingPromise = promise;
                                                promise.success(function (id) {
                                                    deleteCard();
                                                    dialogService.toast("CHECKOUT_SUCCESSFUL");
                                                    $state.go($state.current, {}, {
                                                        reload: true
                                                    });
                                                }).error(function (err) {
                                                    if (err.Message) {
                                                        dialogService.messageBox("ERROR", err.Message).then(function () {
                                                            $state.go($state.current, {}, {
                                                                reload: true
                                                            });
                                                        });

                                                    } else {
                                                        //conflictReservationProcess(err);
                                                        data.room.BookingStatus = "CHECKIN";
                                                        SharedFeaturesFactory.processConflictReservation(err, data.room, "CHECKOUT");
                                                    }
                                                })
                                            }));
                                    }
                                };
                            }
                        }
                    }
                }).error(function (err) {
                    console.log(err);
                });;
            }
        }

        function conflictReservationProcess(err) {
            console.log("ERROR", err);

            function ShowReservationConflictController($scope, $mdDialog, conflictReservation, loginFactory, dialogService) {
                $scope.conflictReservationDialog = {};

                function Init() {
                    console.log("CONFLICT RESERVATION", conflictReservation);
                    $scope.conflictReservationDialog = conflictReservation;
                    if ($scope.conflictReservationDialog.ArrivalDate) {
                        $scope.conflictReservationDialog.ArrivalDate = new Date($scope.conflictReservationDialog.ArrivalDate);
                    }
                    if ($scope.conflictReservationDialog.DepartureDate) {
                        $scope.conflictReservationDialog.DepartureDate = new Date($scope.conflictReservationDialog.DepartureDate);
                    }
                    console.log("data", $scope.conflictReservationDialog);
                }
                Init();
                $scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.cancelDialog = function () {
                    $mdDialog.cancel();
                };
            }

            if (err.room != undefined && err.room != null) {
                $mdDialog.show({
                        controller: ShowReservationConflictController,
                        resolve: {
                            conflictReservation: function () {
                                return err.room;
                            },
                        },
                        templateUrl: 'views/templates/conflictReservationDialog.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: null,
                        clickOutsideToClose: false, //fullscreen: useFullScreen
                    })
                    .then(function (answer) {}, function () {});
            } else {
                $mdDialog.show({
                        controller: ShowReservationConflictController,
                        resolve: {
                            conflictReservation: function () {
                                return err;
                            },
                        },
                        templateUrl: 'views/templates/conflictReservationDialog.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: null,
                        clickOutsideToClose: false, //fullscreen: useFullScreen
                    })
                    .then(function (answer) {}, function () {});
            }
        }

        $scope.doCancel = function () {
            console.log("CANCEL HERE", $scope.RoomExtraServices);

            if ($scope.RoomExtraServiceItems && $scope.RoomExtraServiceItems && $scope.RoomExtraServiceItems.length > 0) {


                var extraServiceItemTemp = _.filter($scope.RoomExtraServiceItems, function (item) {
                    return item.IsDeleted == false;
                });
                if (extraServiceItemTemp && extraServiceItemTemp.length > 0) {
                    dialogService.messageBox("WARNING", "YOU_HAVE_TO_PROCESS_ALL_EXTRA_SERVICES_IN_THIS_ROOM_BEFORE_CANCEL");
                    return;
                }
            }

            if ($scope.RoomExtraServices && $scope.RoomExtraServices && $scope.RoomExtraServices.length > 0) {
                var extraServiceTemp = _.filter($scope.RoomExtraServices, function (item) {
                    return item.RoomExtraServiceName == "EXTRA_SERVICES" && item.IsDeleted == false;
                });


                if (extraServiceTemp && extraServiceTemp.length > 0) {
                    dialogService.messageBox("WARNING", "YOU_HAVE_TO_PROCESS_ALL_EXTRA_SERVICES_IN_THIS_ROOM_BEFORE_CANCEL");
                    return;
                }
            }
            var keys = ["CANCEL_FEE", "PAYMENT_FOR_CANCELLATION_OF_RESERVATION", "REFUND_ALL_DEPOSITS_OF_RESERVATION", "RES_NO", "ROOM", "NOTIFICATION_NEWPAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER", "THIS_ROOM_EXTRA_SERVICE_WAS_DELETED_AUTOMATICALLY_BY_THE_CANCEL_PROCESS", "NOTIFICATION_BOOKED_CONTENT", "NOTIFICATION_BOOKED_NAN_CONTENT", "NOTIFICATION_CANCELED_NAN_CONTENT", "NOTIFICATION_CANCELED_CONTENT"];
            var languageKeys = {};
            for (var idx in keys) {
                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
            }
            console.log("SELECTED ROOM DUNNN", $scope.room);

            var selectedRoomTemp = angular.copy($scope.room);

            if (selectedRoomTemp.IsGroupMaster == true) {
                dialogService.toastWarn("CANCEL_GROUP_MASTER");
                return;
            }
            selectedRoomTemp.RoomName = $scope.roomInfo != null ? $scope.roomInfo.RoomName : null;
            selectedRoomTemp.roomType = $scope.roomTypeInfo
            selectedRoomTemp.Travellers = $scope.customer;
            selectedRoomTemp.PaymentsList = $scope.Payments;
            selectedRoomTemp.RoomExtraServicesList = $scope.RoomExtraServices;
            selectedRoomTemp.languageKeys = languageKeys;
            console.log("SELECTED ROOM TEMP", selectedRoomTemp);

            $mdDialog.show({
                controller: CancelDialogController,
                resolve: {
                    ReservationRoomId: function () {
                        return selectedRoomTemp.ReservationRoomId;
                    },
                    ReservationNumber: function () {
                        return $scope.reservationNumber;
                    },
                    selectedRoom: function () {
                        return selectedRoomTemp;
                    },
                    showEmail: function () {
                        return $scope.showEmail;
                    }

                },
                templateUrl: 'views/templates/cancelDialog.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: event,
            }).then(function (cancelModel) {
                console.log("CANCEL MODEL", cancelModel);
                var processCancel = loginFactory.securedPostJSON("api/Room/ProcessCancel", cancelModel);
                $rootScope.dataLoadingPromise = processCancel;
                processCancel.success(function (data) {
                    dialogService.toast("CANCEL_BOOKING_SUCCESSFUL");
                    //Init();
                    $state.go($state.current, {}, {
                        reload: true
                    });
                }).error(function (err) {
                    dialogService.toastWarn("CANCEL_GROUP_MASTER");
                })
            }, function () {

            });



            function CancelDialogController($scope, $mdDialog, ReservationRoomId, ReservationNumber, selectedRoom, showEmail, loginFactory) {
                $scope.warningCancellationFeeInvalid;
                $scope.warningMissingReason;
                $scope.showEmail = showEmail;
                $scope.SendEmail = false;
                if (showEmail) {
                    $scope.SendEmail = true;
                }

                function Init() {
                    $scope.decimal = $rootScope.decimals;
                    $scope.ReservationRoomId = ReservationRoomId;
                    $scope.ReservationNumber = ReservationNumber;
                    $scope.selectedRoom = selectedRoom;
                    $scope.selectedRoom.RoomName = $scope.selectedRoom.RoomName;
                    delete $scope.selectedRoom.Rooms;
                    $scope.selectedRoom.roomType = $scope.selectedRoom.roomType;
                    delete $scope.selectedRoom.RoomTypes
                    $scope.selectedRoom.reservationRoom = {
                        ArrivalDate: $scope.selectedRoom.ArrivalDate,
                        DepartureDate: $scope.selectedRoom.DepartureDate,
                        Adults: $scope.selectedRoom.Adults,
                        Child: $scope.selectedRoom.Child,
                        PaymentsList: $scope.selectedRoom.PaymentsList,
                        Travellers: $scope.selectedRoom.Travellers,
                        RoomExtraServicesList: $scope.selectedRoom.RoomExtraServicesList
                    }

                    $scope.selectedRoom.TotalDeposit = 0;
                    if ($scope.selectedRoom.reservationRoom && $scope.selectedRoom.reservationRoom.PaymentsList && $scope.selectedRoom.reservationRoom.PaymentsList.length > 0) {
                        for (var index in $scope.selectedRoom.reservationRoom.PaymentsList) {

                            if (!$scope.selectedRoom.reservationRoom.PaymentsList[index].isDeleted) {

                                $scope.selectedRoom.TotalDeposit = $scope.selectedRoom.TotalDeposit + $scope.selectedRoom.reservationRoom.PaymentsList[index].Amount;
                            }

                        }
                    }

                    if ($scope.selectedRoom.reservationRoom && $scope.selectedRoom.reservationRoom.RoomExtraServicesList && $scope.selectedRoom.reservationRoom.RoomExtraServicesList.length > 0) {
                        for (var index in $scope.selectedRoom.reservationRoom.RoomExtraServicesList) {

                            if (!$scope.selectedRoom.reservationRoom.RoomExtraServicesList[index].IsDeleted) {
                                $scope.selectedRoom.TotalDeposit = $scope.selectedRoom.TotalDeposit - $scope.selectedRoom.reservationRoom.RoomExtraServicesList[index].Amount;
                            }

                        }
                    }

                    if ($scope.selectedRoom.reservationRoom.ArrivalDate) {
                        $scope.selectedRoom.reservationRoom.ArrivalDate = new Date($scope.selectedRoom.reservationRoom.ArrivalDate);
                    }
                    if ($scope.selectedRoom.reservationRoom.DepartureDate) {
                        $scope.selectedRoom.reservationRoom.DepartureDate = new Date($scope.selectedRoom.reservationRoom.DepartureDate);
                    }
                    $scope.cancelReason = null;
                    $scope.cancelFlat = 0;
                    $scope.cancelPercentage = 0;
                    $scope.warningCancellationFeeInvalid = false;
                    $scope.warningMissingReason = false;

                }
                Init();

                $scope.processCancel = function () {

                    if (!$scope.cancelReason || $scope.cancelReason.trim() == '') {
                        $scope.warningMissingReason = true;
                    } else if ($scope.selectedRoom.TotalDeposit > 0 && $scope.selectedRoom.TotalDeposit * $scope.cancelPercentage / 100 + $scope.cancelFlat > $scope.selectedRoom.TotalDeposit) {
                        $scope.warningCancellationFeeInvalid = true;
                        $scope.warningMissingReason = false;
                    } else if ($scope.applyCancellationFees && ($scope.cancelFlat + $scope.cancelPercentage == 0)) {
                        $scope.warningMissingFees = true;
                        $scope.warningCancellationFeeInvalid = false;
                        $scope.warningMissingReason = false;
                    } else {
                        var cancelModel = {
                            ReservationRoomId: $scope.ReservationRoomId,
                            ApplyCancellationFees: $scope.applyCancellationFees,
                            CancelReason: $scope.cancelReason,
                            CancelFlat: $scope.cancelFlat,
                            CancelPercentage: $scope.cancelPercentage,
                            TotalDeposit: $scope.selectedRoom.TotalDeposit,
                            languageKeys: $scope.selectedRoom.languageKeys,
                            SendEmail: $scope.SendEmail
                        };
                        $mdDialog.hide(cancelModel);
                    }
                }


                $scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
            }
        };

        $scope.$watchCollection("payment.MoneyId", function (newValues, oldValues) {
            if (newValues && oldValues) {
                var amountTemp = angular.copy($scope.payment.Amount);
                var oldMoney = _.filter($scope.currencies, function (item) {
                    return item.MoneyId == oldValues;
                })[0];
                var currentMoney = _.filter($scope.currencies, function (item) {
                    return item.MoneyId == newValues;
                })[0];
                var currentCurrency = _.filter($scope.currenciesISO, function (item) {
                    return item.CurrencyId == currentMoney.CurrencyId;
                })[0];
                $scope.decimal = currentCurrency.MinorUnit;
                $timeout(function () {
                    $scope.payment.Amount = amountTemp * oldMoney.ExchangeRate / currentMoney.ExchangeRate;
                }, 0);
            }
        });

        $scope.$watchCollection("deposit.MoneyId", function (newValues, oldValues) {
            if (newValues && oldValues) {
                var amountTemp = angular.copy($scope.deposit.Amount);
                var oldMoney = _.filter($scope.currencies, function (item) {
                    return item.MoneyId == oldValues;
                })[0];
                var currentMoney = _.filter($scope.currencies, function (item) {
                    return item.MoneyId == newValues;
                })[0];
                var currentCurrency = _.filter($scope.currenciesISO, function (item) {
                    return item.CurrencyId == currentMoney.CurrencyId;
                })[0];
                $scope.decimal = currentCurrency.MinorUnit;
                // $scope.deposit.Amount = $scope.deposit.Amount / oldMoney.ExchangeRate * currentMoney.ExchangeRate;
                $timeout(function () {
                    $scope.deposit.Amount = amountTemp * oldMoney.ExchangeRate / currentMoney.ExchangeRate;
                }, 0);
            }
        });

        $scope.$watchCollection("payment.PaymentMethodId", function (newValues, oldValues) {
            if (newValues && oldValues) {
                $scope.selectedCompanyCityLedger = $scope.selectedCompany;
            }
        });

        $scope.$watchCollection("payment.PaymentTypeName", function (newValues, oldValues) {
            if (newValues && oldValues) {
                $scope.payment.PaymentMethodId = 1;
            }
        });

        $scope.fillterPaymentMethodId = function (value, index, array) {
            if (value.PaymentMethodId == 4 && $scope.payment.PaymentTypeName != "NEW_PAYMENT") return false;
            else return true;
        }

        $scope.changePrice = function (price) {
            var diffDays = Math.round(Math.abs(($scope.room.ArrivalDate.getTime() - $scope.room.DepartureDate.getTime()) / (oneDay)));
            $scope.room.Total = diffDays * $scope.room.Price;
        }

        $scope.$watchCollection('extraservice.selectedExtraServiceType', function (newValue, oldValue) {
            console.log("VALUE", newValue, oldValue);
            if (newValue != null && newValue != undefined && newValue.ExtraServiceTypeName != 'EXTRA_SERVICES' && newValue.quantity == 0) {
                $scope.extraservice.selectedExtraServiceType.quantity = 1;
            }
        });

        function loadExtraServices(data) {
            //$scope.extraservice.selectedExtraServiceType.quantity
            // loginFactory.securedGet("api/Room/ExtraServiceList", "").success(function (data) {
            for (var idx in data.ExtraServiceTypes) {
                data.ExtraServiceTypes[idx].IsHide = true;
                var countItem = data.ExtraServiceItems.filter(function (item) {
                    return data.ExtraServiceTypes[idx].ExtraServiceTypeId == item.ExtraServiceTypeId;
                });
                if (countItem.length > 0) {
                    data.ExtraServiceTypes[idx].IsHide = false;
                }
            }

            $scope.extraservice = angular.copy(data);

            for (var index in $scope.extraservice.ExtraServiceItems) {
                if (!$scope.extraservice.ExtraServiceItems[index].quantity) {
                    $scope.extraservice.ExtraServiceItems[index].quantity = 0;
                }
                for (var index2 in $scope.extraservice.ExtraServiceTypes) {
                    if ($scope.extraservice.ExtraServiceTypes[index2].ExtraServiceTypeId == $scope.extraservice.ExtraServiceItems[index].ExtraServiceTypeId) {
                        $scope.extraservice.ExtraServiceItems[index].ExtraServiceTypeName = $scope.extraservice.ExtraServiceTypes[index2].ExtraServiceTypeName;
                        break;
                    }
                }
            }
            var item = {
                ExtraServiceTypeName: 'EXTRA_SERVICES',
                ExtraServiceItemName: 'ADD_NEW_ITEM'
            };
            $scope.extraservice.ExtraServiceItems.push(item);
            // $scope.extraservice.ExtraServiceItems.sort(function (a, b) {
            // 	return a.Priority - b.Priority;
            // });
            // });
        }

        $scope.onSelectESType = function () {
            $scope.extraservice.selectedExtraServiceCategory = null;
        }

        $scope.onChangeESType = function () {
            if ($scope.extraservice.selectedExtraServiceType.ExtraServiceTypeName) {
                for (var idx in $scope.extraservice.ExtraServiceItems) {
                    $scope.extraservice.ExtraServiceItems[idx].quantity = 0;
                }
            }
        }



        // $scope.extraServiceNoItem = {
        // 	Quantity:1
        // };
        $scope.showDetailAvailable = false;
        $scope.addExtraService = function (ev) {
            var keys = ["RES_NO", "ROOM", "NOTIFICATION_POST_EXTRASERVICE", "EXTRA_SERVICE"];
            var languageKeys = {};
            for (var idx in keys) {
                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
            }
            var items = [];

            $scope.extraServiceItems = [];
            if ($scope.roomWorkOrder && $scope.roomWorkOrder.WorkOrderExtraServices) {
                angular.forEach($scope.roomWorkOrder.WorkOrderExtraServices, function (workOrderExtraService) {

                    angular.forEach(workOrderExtraService.RoomExtraServiceItems, function (roomExtraServiceItem) {
                        if (roomExtraServiceItem.IsSelected) {
                            var extraServiceItem = roomExtraServiceItem;

                            $scope.extraServiceItems.push(extraServiceItem);
                        }

                    });
                });
            }

            if ($scope.extraServiceNoItem != {} && ($scope.extraServiceNoItem.RoomExtraServiceDescription != undefined || $scope.extraServiceNoItem.Amount != undefined)) {
                if ($scope.extraServiceNoItem.Amount == undefined || $scope.extraServiceNoItem.RoomExtraServiceDescription == undefined || $scope.extraServiceNoItem.RoomExtraServiceDescription.length == 0) {
                    dialogService.messageBox("MISSING_EXTRA_SERVICE", "PLEASE_FILL_NAME_AND_PRICE_OF_EXTRA_SERVICES");
                    return;
                };
                if ($scope.extraServiceNoItem.Quantity == undefined || $scope.extraServiceNoItem.Quantity <= 0) {
                    dialogService.messageBox("MISSING_EXTRA_SERVICE_QUANTITY", "PLEASE_FILL_QUANTITY_OF_EXTRA_SERVICES");
                    return;
                };
            };

            //WORK_ORDER
            angular.forEach($scope.extraServiceItems, function (arr) {
                if ((arr.IsSelected) && arr.RoomExtraServiceItemId == 0) {
                    var extraServiceItem = {
                        ExtraServiceItemId: arr.ExtraServiceItemId,
                        Price: arr.Price,
                        Unit: arr.Unit,
                        ExtraServiceCategoryId: arr.ExtraServiceCategoryId,
                        ExtraServiceItemName: arr.ExtraServiceItemName,
                        RoomExtraServiceItemId: arr.RoomExtraServiceItemId,
                        ExtraServiceItemDescription: arr.ExtraServiceItemDescription,
                        ExtraServiceTypeId: arr.ExtraserviceTypeId,
                        ExtraServiceTypeName: arr.ExtraserviceTypeName,
                        HotelId: arr.HotelId,
                        IsChangeable: arr.IsChangeable,
                        IsHidden: arr.IsHidden,
                        Priority: arr.Priority,
                        RoomExtraServiceItemId: arr.RoomExtraServiceItemId
                    };
                    var item = {
                        quantity: 1,
                        item: extraServiceItem,
                        ExtraServiceTypeName: arr.ExtraServiceTypeName,
                        DateUsed: arr.IsSelected ? arr.DateUsed : null,
                        RoomExtraServiceItemId: arr.RoomExtraServiceItemId
                    };
                    items.push(item);
                };
            });

            angular.forEach($scope.extraservice.ExtraServiceItems, function (arr) {
                if (arr.quantity > 0) {
                    var item = {
                        quantity: arr.quantity,
                        item: arr,
                        ExtraServiceTypeName: arr.ExtraServiceTypeName
                    };
                    items.push(item);
                };
            });

            if (items.length == 0 && $scope.extraServiceNoItem.Amount == undefined) {
                dialogService.messageBox("MISSING_ITEM", "PLEASE_SELECT_AT_LEAST_ONE_ITEM");
                return;
            }

            // console.info('Extra Service Confirm', items, $scope.extraServiceNoItem);
            $rootScope.items = items;
            // $rootScope.extraServiceNoItem = $scope.extraServiceNoItem;
            // console.log("EXTRA_SERVICE", items, $scope.extraServiceNoItem);


            // if ($scope.extraServiceNoItem && $scope.extraservice.selectedExtraServiceType.ExtraServiceTypeName == 'EXTRA_SERVICES' && (!$scope.extraServiceNoItem.RoomExtraServiceDescription || !$scope.extraServiceNoItem.Amount)) {
            // 	dialogService.messageBox("MISSING_EXTRA_SERVICE", "PLEASE_FILL_NAME_AND_PRICE_OF_EXTRA_SERVICES");
            // 	return;
            // }

            //if (scope.extraservice.selectedExtraServiceType.ExtraServiceTypeName === 'EXTRA_SERVICES')
            AddESDialogController.$inject = ['$scope', '$mdDialog', 'extraServiceNoItem', 'items'];

            function AddESDialogController($scope, $mdDialog, extraServiceNoItem, items) {
                //$scope.decimal = $rootScope.decimals;
                $scope.items = items;
                $scope.extraServiceNoItem = extraServiceNoItem;
                if (_.size($scope.extraServiceNoItem) == 0) {
                    $scope.extraServiceNoItem = null;
                }
                $scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
                $scope.ok = function () {
                    for (var index in $scope.items) {
                        $scope.items[index].item.Price = parseFloat($scope.items[index].item.Price);
                    }
                    $mdDialog.hide($scope.items);
                };
                $scope.getTotal = function (items, extraServiceNoItem) {
                    var total = 0;
                    if (items != null && items.length > 0) {
                        for (var idx in items) {
                            total += items[idx].item.Price * items[idx].quantity;
                        }
                    }
                    if (extraServiceNoItem != null && extraServiceNoItem.Amount != null) {
                        total += (extraServiceNoItem.Amount * extraServiceNoItem.Quantity);
                    }
                    return total;
                };
            }
            $mdDialog.show({
                    controller: AddESDialogController,
                    templateUrl: 'views/reservation/subtemplates/extraserviceConfirm.html',
                    resolve: {
                        extraServiceNoItem: function () {
                            return $scope.extraServiceNoItem;
                        },
                        items: function () {
                            return items;
                        }
                    },
                    parent: angular.element(document.body),
                    targetEvent: ev,
                })
                .then(function (itemsAdded) {
                    items = itemsAdded;
                    console.info("Items Added", items);
                    $scope.showDetailAvailable = true;
                    var postItems = {};
                    if ($scope.hasRRIDParam) {
                        if (items.length != 0) {
                            var postItems = {
                                ReservationRoomId: $stateParams.reservationRoomId,
                                description: "",
                                name: "",
                                items: items,
                                languageKeys: languageKeys
                            };
                            // var saveItems = loginFactory.securedPostJSON("api/Room/CreateExtraService", postItems);
                            var saveItems = loginFactory.securedPostJSON("api/Room/QuickCreateExtraService", postItems);
                            $rootScope.dataLoadingPromise = saveItems;
                            saveItems.success(function () {
                                for (var idx in $scope.extraservice.ExtraServiceItems) {
                                    $scope.extraservice.ExtraServiceItems[idx].quantity = 0;
                                }
                                if ($scope.extraServiceNoItem != null && $scope.extraServiceNoItem.Amount != null) {
                                    var postItems = {
                                        ReservationRoomId: $stateParams.reservationRoomId,
                                        RoomExtraServiceName: "EXTRA_SERVICES",
                                        RoomExtraServiceDescription: $scope.extraServiceNoItem.RoomExtraServiceDescription,
                                        Amount: $scope.extraServiceNoItem.Amount,
                                        Quantity: $scope.extraServiceNoItem.Quantity,
                                        languageKeys: languageKeys
                                    };
                                    // if(!$rootScope.HotelSettings.IsOffNoshow){
                                    var saveExtraServiceNoItem = loginFactory.securedPostJSON("api/Room/CreateExtraServiceNoItem", postItems);
                                    $rootScope.dataLoadingPromise = saveExtraServiceNoItem;
                                    saveExtraServiceNoItem.success(function () {
                                        $scope.extraServiceNoItem = {};
                                        dialogService.toast("ADD_EXTRA_SERVICE_SUCCESSFUL");
                                        Init();
                                    }).error(function (e) {
                                        dialogService.messageBox("ERROR", e.Message, ev);
                                    });
                                    // }

                                } else {
                                    dialogService.toast("ADD_EXTRA_SERVICE_SUCCESSFUL");
                                    $localStorage.processExtraService = true;
                                }
                                /*$state.go($state.current, {}, {
                                    reload: true
                                });*/
                                Init();
                            }).error(function (e) {
                                dialogService.messageBox("ERROR", e.Message, ev);
                            });
                        } else {
                            var postItems = {
                                ReservationRoomId: $stateParams.reservationRoomId,
                                RoomExtraServiceName: "EXTRA_SERVICES",
                                RoomExtraServiceDescription: $scope.extraServiceNoItem.RoomExtraServiceDescription,
                                Amount: $scope.extraServiceNoItem.Amount,
                                Quantity: $scope.extraServiceNoItem.Quantity,
                                languageKeys: languageKeys
                            };
                            var saveExtraServiceNoItem = loginFactory.securedPostJSON("api/Room/CreateExtraServiceNoItem", postItems);
                            $rootScope.dataLoadingPromise = saveExtraServiceNoItem;
                            saveExtraServiceNoItem.success(function () {
                                $scope.extraServiceNoItem = {};
                                dialogService.toast("ADD_EXTRA_SERVICE_SUCCESSFUL");
                                Init();
                                //postItems = null;
                                /*items = null;
                                $scope.extraServiceNoItem = null;
                                $rootScope.extraServiceNoItem = null;*/
                            }).error(function (e) {
                                dialogService.messageBox("ERROR", e.Message, ev);
                            });
                        }
                    } else {
                        var postedItems = {};
                        var postedNoItem = [];
                        if ($rootScope.postedNoItem == null) {
                            $rootScope.postedNoItem = [];

                        };
                        if (items.length !== 0) {

                            postedItems = {
                                ReservationRoomId: $stateParams.reservationRoomId,
                                description: $scope.extraservice.selectedExtraServiceType.ExtraServiceTypeName + ' res:#' + $stateParams.reservationRoomId + ' room:#' + $scope.room.RoomId,
                                name: $scope.extraservice.selectedExtraServiceType.ExtraServiceTypeName,
                                items: items,
                                languageKeys: languageKeys
                            };
                            $rootScope.postedItems = postedItems;
                        } else {
                            var noItem = {
                                ReservationRoomId: $stateParams.reservationRoomId,
                                RoomExtraServiceName: "EXTRA_SERVICES",
                                RoomExtraServiceDescription: $scope.extraServiceNoItem.RoomExtraServiceDescription,
                                Amount: $scope.extraServiceNoItem.Amount,
                                languageKeys: languageKeys

                            };
                            $rootScope.postedNoItem.push(noItem);
                        }
                        console.log("ROOT_EXTRA_SERVICE", $rootScope.postedItems, $rootScope.postedNoItem);
                        //$rootScope.postedNoItem = postedNoItem;
                    }
                }, function () {
                    console.log("CANCEL");

                    // if ($scope.extraservice.selectedExtraServiceType.ExtraServiceTypeName === "EXTRA_SERVICES") {
                    // 	$scope.extraServiceNoItem = {};
                    // }

                });

        }
        $scope.deleteExtraServiceItem = function (ev, item) {
            console.log(item);
            var keys = ["RES_NO", "ROOM", "NOTIFICATION_DELETE_EXTRASERVICE", "EXTRA_SERVICE"];
            var languageKeys = {};
            for (var idx in keys) {
                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
            }
            var itemTemp = angular.copy(item);
            $mdDialog.show({
                controller: DeleteExtraServiceItemDialogController,
                resolve: {
                    item: function () {
                        return itemTemp;
                    },
                },
                templateUrl: 'views/templates/deleteESItem.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: event,
            }).then(function (deleteReason) {
                console.log(deleteReason);
                itemTemp.DeletedReason = deleteReason;
                var itemDelete = {
                    roomExtraServiceItems: itemTemp,
                    languageKeys: languageKeys
                }
                var promise = loginFactory.securedPostJSON("api/Room/DeleteExtraServiceItem", itemDelete);
                $rootScope.dataLoadingPromise = promise;
                promise.success(
                    function (data) {
                        console.log("GET THERE");
                        //$scope.Payments = data;
                        //$scope.payment.Amount = $scope.remainingAmount();
                        dialogService.toast("DELETE_EXTRA_SERVICE_ITEM_SUCCESSFUL");
                        //Init();
                        $localStorage.processExtraService = true;
                        $state.go($state.current, {}, {
                            reload: true
                        });

                    }
                ).error(
                    function (error) {
                        dialogService.messageBox(error.Message);
                    }
                );
            }, function () {

            });
        };

        $scope.changeNoteHousekeeping = function (ev, item) {
            var itemTemp = angular.copy(item);
            $mdDialog.show({
                controller: ChangeNoteHousekeepingController,
                resolve: {
                    noteHousekeeping: function () {
                        return itemTemp;
                    },
                    reservationRoomId: function () {
                        return $stateParams.reservationRoomId;
                    }
                },
                templateUrl: 'views/templates/changeNoteHousekeeping.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: event,
            }).then(function (note) {
                var saveNoteHouseKeepingModel = note;
                var promise = loginFactory.securedPostJSON("api/HouseKeeping/saveNoteHousekeeping", saveNoteHouseKeepingModel);
                $rootScope.dataLoadingPromise = promise;
                promise.success(
                    function () {
                        $scope.roomWorkOrder.Note = saveNoteHouseKeepingModel.NoteHouseKeeping;
                    }
                ).error(
                    function (error) {
                        dialogService.messageBox(error.Message);
                    }
                );
            }, function () {});
        };

        function ChangeNoteHousekeepingController($scope, $mdDialog, noteHousekeeping, reservationRoomId, loginFactory) {
            function Init() {
                $scope.NoteHouseKeeping = noteHousekeeping;
                $scope.saveNoteHouseKeepingModel = {
                    ReservationRoomId: reservationRoomId,
                    NoteHouseKeeping: noteHousekeeping
                }
            }
            Init();

            $scope.processChange = function () {
                $scope.saveNoteHouseKeepingModel = {
                    ReservationRoomId: reservationRoomId,
                    NoteHouseKeeping: $scope.NoteHouseKeeping
                }
                $mdDialog.hide($scope.saveNoteHouseKeepingModel);
            }
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel(true);
            };
        };

        $scope.deleteRoomExtraService = function (ev, item) {
            console.log(item);
            var keys = ["RES_NO", "ROOM", "NOTIFICATION_DELETE_EXTRASERVICE", "EXTRA_SERVICE"];
            var languageKeys = {};
            for (var idx in keys) {
                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
            }
            var itemTemp = angular.copy(item);
            $mdDialog.show({
                controller: DeleteExtraServiceItemDialogController,
                resolve: {
                    item: function () {
                        return itemTemp;
                    },
                },
                templateUrl: 'views/templates/deleteESItem.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: event,
            }).then(function (deleteReason) {
                console.log(deleteReason);
                itemTemp.DeletedReason = deleteReason;
                var itemDelete = {
                    roomExtraServices: itemTemp,
                    languageKeys: languageKeys
                }
                var promise = loginFactory.securedPostJSON("api/Room/DeleteExtraService", itemDelete);
                $rootScope.dataLoadingPromise = promise;
                promise.success(
                    function (data) {
                        dialogService.toast("DELETE_EXTRA_SERVICE_SUCCESSFUL");
                        Init();
                    }
                ).error(
                    function (error) {
                        dialogService.messageBox(error.Message);
                    }
                );
            }, function () {

            });
        };

        function DeleteExtraServiceItemDialogController($scope, $mdDialog, item, loginFactory) {
            function Init() {
                $scope.item = item;
                $scope.deleteReason = null;
            }
            Init();

            $scope.processDelete = function () {
                console.log($scope.deleteReason);
                $mdDialog.hide($scope.deleteReason);
            }

            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
        }

        $scope.increaseItemCount = function (esi) {
            if (esi.quantity)
                esi.quantity += 1;
            else
                esi.quantity = 1;
            //$scope.$apply();
        }

        $scope.getExtraServicePayment = function () {

            var total = 0;
            for (var idx in $scope.RoomExtraServices) {
                total += $scope.RoomExtraServices[idx].Amount;
            }
            for (var idx in $scope.Payments) {
                total -= $scope.Payments[idx].Amount;

            }
            return total;

        }

        $scope.addPayment = function (e) {
            if ($scope.isSubmitPayment) e.preventDefault();
            else $scope.isSubmitPayment = true;
            var keys = ["RES_NO", "ROOM", "NOTIFICATION_NEWPAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER"];
            var languageKeys = {};
            for (var idx in keys) {
                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
            }
            var payment = angular.copy($scope.payment);

            if (!payment.Amount) {
                dialogService.messageBox("INVALID_AMOUNT", "PAYMENT_AMOUNT_CAN_NOT_BE_NULL");
                $scope.isSubmitPayment = false;
                return;
            }
            if (payment.Amount <= 0) {
                dialogService.messageBox("INVALID_AMOUNT", "PAYMENT_AMOUNT_CAN_NOT_LESS_THAN_OR_EQUAL_TO_0");
                $scope.isSubmitPayment = false;
                return;
            }

            if (payment.PaymentMethodId === 4 && ($scope.selectedCompanyCityLedger == null || $scope.selectedCompanyCityLedger.CompanyId == null)) {
                dialogService.messageBox("INVALID_CITY_LEDGER", "PLEASE_SELECT_A_CITY_LEDGER");
                $scope.isSubmitPayment = false;
                return;
            }

            if (payment.PaymentMethodId === 4) {
                payment.CompanyId = $scope.selectedCompanyCityLedger.CompanyId
            }

            var confirm;
            if (payment.MoneyId != $scope.defaultCurrency.MoneyId) {
                for (var index in $scope.currencies) {
                    if ($scope.currencies[index].MoneyId == payment.MoneyId) {
                        var decimal = _.filter($scope.currenciesISO, function (item) {
                            return item.CurrencyId == $scope.currencies[index].CurrencyId;
                        })[0].MinorUnit;
                        //var paymentTemp = angular.copy(payment);
                        payment.AmountInSpecificMoney = payment.Amount;
                        payment.Amount = payment.Amount * $scope.currencies[index].ExchangeRate;
                        confirm = dialogService.confirm("NEW_PAYMENT_CONFIRM", $filter("currency")(payment.Amount) + "(" + $scope.currencies[index].MoneyName + " " + +payment.AmountInSpecificMoney.toFixed(decimal) + ")");
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


            confirm.then(function () {
                payment.ReservationRoomId = $stateParams.reservationRoomId;
                var paymentModel = {
                    payment: payment,
                    languageKeys: languageKeys
                }
                var promise = loginFactory.securedPostJSON("api/Room/AddPayment", paymentModel);
                $rootScope.dataLoadingPromise = promise;
                promise.success(
                    function (data) {
                        $scope.Payments = data;
                        $scope.payment.Amount = $scope.remainingAmount();
                        $scope.payment.MoneyId = null;
                        //$scope.decimal = null;
                        $scope.decimal = $rootScope.decimals;
                        $scope.isPaymentDelete = false;
                        Init();
                        dialogService.toast("ADD_PAYMENT_SUCCESSFUL");
                        // $scope.isSubmitPayment = false;
                    }
                ).error(
                    function (error) {
                        $scope.isSubmitPayment = false;
                        dialogService.messageBox(error.Message);
                    }
                );
            }, function () {
                $scope.isSubmitPayment = false;
            });
        };



        $scope.addDeposit = function (e) {
            if ($scope.isSubmitDeposit) e.preventDefault();
            else $scope.isSubmitDeposit = true;
            var deposit = angular.copy($scope.deposit);
            if (!deposit.Amount) {
                dialogService.messageBox("INVALID_DEPOSIT", "DEPOSIT_AMOUNT_CAN_NOT_BE_NULL");
                $scope.isSubmitDeposit = false;
                return;
            }
            if (deposit.Amount <= 0) {
                dialogService.messageBox("INVALID_DEPOSIT", "DEPOSIT_AMOUNT_CAN_NOT_LESS_THAN_OR_EQUAL_TO_0");
                $scope.isSubmitDeposit = false;
                return;
            }
            console.log(deposit);
            var confirm;
            //deposit.Amount = -deposit.Amount;
            if (deposit.MoneyId != $scope.defaultCurrency.MoneyId) {
                for (var index in $scope.currencies) {
                    if ($scope.currencies[index].MoneyId == deposit.MoneyId) {
                        var decimal = _.filter($scope.currenciesISO, function (item) {
                            return item.CurrencyId == $scope.currencies[index].CurrencyId;
                        })[0].MinorUnit;
                        deposit.AmountInSpecificMoney = deposit.Amount;
                        deposit.Amount = deposit.Amount * $scope.currencies[index].ExchangeRate;
                        deposit.MinorUnitInSpecificMoney = decimal;
                        deposit.MoneyName = $scope.currencies[index].MoneyName;
                        confirm = dialogService.confirm("NEW_PAYMENT_CONFIRM", $filter("currency")(deposit.Amount) + "(" + $scope.currencies[index].MoneyName + " " + +deposit.AmountInSpecificMoney.toFixed(decimal) + ")");
                        break;
                    }
                }
            } else {
                confirm = dialogService.confirm("NEW_PAYMENT_CONFIRM", $filter("currency")($scope.deposit.Amount));
            }

            if (deposit.PaymentTypeName == "REFUND") {
                deposit.Amount = -deposit.Amount;
                deposit.AmountInSpecificMoney = -deposit.AmountInSpecificMoney;
            }

            // var confirm = dialogService.confirm("ADD_NEW_PAYMENT", $scope.deposit.Amount);
            confirm.then(function () {
                deposit.CreatedDate = new Date();
                $scope.paymentList.push(deposit);
                dialogService.toast("ADD_PAYMENT_SUCCESSFUL");
                $scope.deposit.PaymentDescription = null;
                $scope.deposit.Amount = null;
                $scope.isSubmitDeposit = false;
            }, function () {
                $scope.isSubmitDeposit = false;
            });
        };

        $scope.isPaymentDelete = false;
        $scope.deletePayment = function (event, payment) {
            var keys = ["RES_NO", "NOTIFICATION_DELETED_DEPOSIT", "NOTIFICATION_DELETED_REFUND", "ROOM", "NOTIFICATION_WHEN_DELETE_PAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER", "NOTIFICATION_DELETED_PAYMENT", "DEPOSIT"];
            var languageKeys = {};
            for (var idx in keys) {
                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
            }
            //console.log(payment);
            var paymentTemp = angular.copy(payment);
            paymentTemp.RefPaymentId = paymentTemp.PaymentId;
            paymentTemp.PaymentTypeName = "DELETED";
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
                console.log(deleteReason);
                paymentTemp.PaymentDescription = deleteReason;

                var paymentModel = {
                    payment: paymentTemp,
                    languageKeys: languageKeys
                }
                var promise = loginFactory.securedPostJSON("api/Room/DeletePayment", paymentModel);
                $rootScope.dataLoadingPromise = promise;
                promise.success(
                    function (data) {
                        //$scope.Payments = data;
                        //$scope.payment.Amount = $scope.remainingAmount();
                        dialogService.toast("DELETE_PAYMENT_SUCCESSFUL");
                        Init();
                    }
                ).error(
                    function (error) {
                        dialogService.messageBox(error.Message);
                    }
                );
            }, function () {

            });
        }

        $scope.deleteDeposit = function (event, payment) {
            console.log(payment);
            var message;
            if (payment.MinorUnitInSpecificMoney != null) {
                message = $filter("currency")(payment.Amount) + "(" + payment.MoneyName + " " + +payment.AmountInSpecificMoney.toFixed(payment.MinorUnitInSpecificMoney) + ")"
            } else {
                message = $filter('currency')(payment.Amount);
            }
            dialogService.confirm("DELETE_PAYMENT_CONFIRM", message).then(function () {
                $scope.paymentList.splice($scope.paymentList.indexOf(payment), 1);
            });
        }



        function DeletePaymentDialogController($scope, $mdDialog, payment, loginFactory) {


            function Init() {
                $scope.payment = payment;
                $scope.deleteReason = null;
            }
            Init();

            $scope.processDelete = function () {
                console.log($scope.deleteReason);
                $mdDialog.hide($scope.deleteReason);
            }

            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
        }



        $scope.applyDiscount = function () {

            //console.log('dungnn', $scope.room.DiscountFlat);
            var keys = ["RES_NO", "ROOM", "NOTIFICATION_DISCOUNT_ROOM_PRICE", "NOTIFICATION_FREE_OF_CHARGE"];
            var languageKeys = {};
            for (var idx in keys) {
                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
            }
            if (typeof ($scope.room.DiscountFlat) == 'undefined' || typeof ($scope.room.DiscountPercentage) == 'undefined') {

                dialogService.messageBox("DISCOUNT_INVALID", "THE_TOTAL_OF_DISCOUNT_INVALID");
                $scope.room.DiscountFlat = 0;
                return;
            }

            /*if ($scope.Amount * $scope.room.DiscountPercentage / 100 + $scope.room.DiscountFlat > $scope.Amount) {
                dialogService.messageBox("DISCOUNT_INVALID", "THE_TOTAL_OF_DISCOUNT_CAN_NOT_EXCEED_THE_CURRENT_TOTAL_PRICE");
                return;
            }*/

            dialogService.confirm("NEW_DISCOUNT_CONFIRM", "DO_YOU_WANT_TO_APPLY_NEW_DISCOUNT").then(function () {
                if ($scope.room.DiscountFlat == "" || $scope.room.DiscountFlat == null) {
                    $scope.room.DiscountFlat = 0;
                }
                if ($scope.room.DiscountPercentage == "" || $scope.room.DiscountPercentage == null) {
                    $scope.room.DiscountPercentage = 0;
                }
                var ApplyDiscountModel = {
                    reservationRoomId: $stateParams.reservationRoomId,
                    FOC: $scope.room.Foc,
                    DiscountPercentage: $scope.room.DiscountPercentage,
                    DiscountFlat: $scope.room.DiscountFlat,
                    languageKeys: languageKeys
                }
                var applyDiscount = loginFactory.securedPostJSON("api/Room/ApplyDiscount", ApplyDiscountModel);
                $rootScope.dataLoadingPromise = applyDiscount;
                applyDiscount.success(function () {
                    Init();
                }).error(function (err) {
                    console.log(err);
                });
            });
        }


        $scope.showInvoice = function (ev) {
            var keys = ["ROOM_MONTHLY", "ROOM_WEEKLY", "ROOM_FULL_DAY", "ROOM_DAY_NIGHT", "ROOM_HOURLY", "MINIBAR", "LAUNDRY", "EXTRA_ROOM_CHARGE", "COMPENSATION", "EXTRA_SERVICES", "FULL_DAY_EARLY_CHECKIN", "FULL_DAY_LATE_CHECKOUT", "DAY_NIGHT_EARLY_CHECKIN", "DAY_NIGHT_LATE_CHECKOUT", "EXTRA_ADULTS", "EXTRA_CHILDREN", "PAYMENT", "DISCOUNT_MONEY_OFF", "DISCOUNT_PERCENT_OFF", "FREE"];
            var languageKeys = {};
            for (var idx in keys) {
                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
            }

            var CreateRoomInvoice = {
                roomId: $scope.room.RoomId,
                reservationRoomId: $stateParams.reservationRoomId,
                arrivalDate: $scope.room.ArrivalDate,
                departureDate: new Date(),
                adults: $scope.calculateAdults,
                children: $scope.calculateChildren,
                languageKeys: languageKeys,
                FOC: $scope.room.Foc,
                DiscountPercentage: $scope.room.DiscountPercentage,
                DiscountFlat: $scope.room.DiscountFlat,
                RoomPriceId: $scope.room.RoomPriceId,
                Price: $scope.roomPriceTemp
            }
            var modelRoomInvoiceFullDay = {
                roomId: $scope.room.RoomId,
                reservationRoomId: $stateParams.reservationRoomId,
                arrivalDate: $scope.room.ArrivalDate,
                departureDate: $scope.room.DepartureDate,
                adults: $scope.calculateAdults,
                children: $scope.calculateChildren,
                languageKeys: languageKeys,
                FOC: $scope.room.Foc,
                DiscountPercentage: $scope.room.DiscountPercentage,
                DiscountFlat: $scope.room.DiscountFlat,
                RoomPriceId: $scope.room.RoomPriceId,
                Price: $scope.roomPriceTemp
            }
            if ($scope.applyPastCheckOut) {
                CreateRoomInvoice.departureDate = $scope.room.DepartureDate;
            }
            var CreateRoomInvoiceResult = loginFactory.securedPostJSON("api/Room/CreateRoomInvoice", CreateRoomInvoice);
            $rootScope.dataLoadingPromise = CreateRoomInvoiceResult;
            CreateRoomInvoiceResult.success(function (data) {
                $mdDialog.show({
                        controller: ['$scope', '$mdDialog', 'loginFactory', 'reservationRoomId', 'hotelFormRoomInvoice', 'modelRoomInvoiceFullDay', '$rootScope', InvoiceController],
                        locals: {
                            reservationRoomId: $stateParams.reservationRoomId,
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



        $scope.showConfirm = function (ev, customer) {

            var keys = [
                "YOU_HAVE_NOT_HAD_THE_REPORT_FORM_PLEASE_CLICK_TO_SETUP",
                "DO_YOU_WANT_TO_DISPLAY_RATE_PER_NIGHT",
                "NOTIFICATION",
                "CLOSE",
                "YES",
                "NO",
                "MALE",
                "FEMALE"
            ];
            var languageKeys = {};
            for (var idx in keys) {
                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
            }
            var obForms = {};
            var reservationdetail = $scope.hotelForms;
            var ngonngu = $rootScope.language;
            var Len = reservationdetail.bodyRegistrationcard.length;
            // console.info(ngonngu, reservationdetail,"leo nguyen check lang")
            for (var index = 0; index < Len; index++) {
                if (reservationdetail.bodyRegistrationcard[index].LanguageCode == ngonngu) {
                    obForms = reservationdetail.bodyRegistrationcard[index];
                    index = Len;
                }
            }

            if (obForms == null || obForms.Body == null) {
                //alert('Bạn chưa có mẫu báo cáo, xin vui lòng vào cấu hình cài đặt');                
                $mdDialog.show(
                    $mdDialog.alert()
                    //.parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title($filter("translate")("NOTIFICATION"))
                    .textContent($filter("translate")("YOU_HAVE_NOT_HAD_THE_REPORT_FORM_PLEASE_CLICK_TO_SETUP"))
                    .ariaLabel('Alert Dialog Demo')
                    .ok($filter("translate")("CLOSE"))
                    //.targetEvent(ev)
                );
            } else {
                var confirm = $mdDialog.confirm()
                    .title($filter("translate")("NOTIFICATION"))
                    .textContent($filter("translate")("DO_YOU_WANT_TO_DISPLAY_RATE_PER_NIGHT"))
                    .ariaLabel('Lucky day')
                    .targetEvent(ev)
                    .ok($filter("translate")("YES"))
                    .cancel($filter("translate")("NO"));

                $mdDialog.show(confirm).then(function () {
                    $scope.status = 'Có';
                    $scope.doConfirm(ev, customer, true, obForms);
                }, function () {
                    $scope.status = 'Không';
                    $scope.doConfirm(ev, customer, false, obForms);
                });
            }
        }
        $scope.doConfirm = function (ev, customer, status, obForms) {

            // Appending dialog to document.body to cover sidenav in docs app


            //$scope.status = status;

            // console.info(obForms,"leo nguyen check lang2")

            var keys = ["ROOM_MONTHLY", "ROOM_WEEKLY", "ROOM_FULL_DAY", "ROOM_DAY_NIGHT", "ROOM_HOURLY", "MINIBAR", "LAUNDRY", "EXTRA_ROOM_CHARGE", "COMPENSATION", "EXTRA_SERVICES", "FULL_DAY_EARLY_CHECKIN", "FULL_DAY_LATE_CHECKOUT", "DAY_NIGHT_EARLY_CHECKIN", "DAY_NIGHT_LATE_CHECKOUT", "EXTRA_ADULTS", "EXTRA_CHILDREN", "PAYMENT", "DISCOUNT_MONEY_OFF", "DISCOUNT_PERCENT_OFF", "FREE", "MALE", "FEMALE"];
            var languageKeys = {};
            for (var idx in keys) {
                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
            }


            var companyname = $scope.selectedCompany != null ? ($scope.selectedCompany.CompanyName != null ? $scope.selectedCompany.CompanyName : "") : "";
            var strCompanyname = '<p style="width:310px;white-space: normal; text-align: center;margin: -15px 0 -15px 0;">' + companyname + '</p>';

            var countryname = $scope.getCountryItem(customer.CountryId);

            var _totalPrice = 0;
            if ($scope.roomCharges.length > 0) {
                angular.forEach($scope.roomCharges, function (value, key) {
                    _totalPrice += $scope.roomCharges[key].Amount;
                });
            }

            // var defaultcur = $scope.defaultCurrency.MoneyName;

            var customerDetail = {
                c_dob: customer.Birthday != null ? customer.Birthday.format('dd/mm/yyyy') : "",
                c_sex: customer.Gender != null ? (customer.Gender == 0 ? $filter("translate")('MALE') : (customer.Gender == 1 ? $filter("translate")('FEMALE') : $filter("translate")('OTHER'))) : "",
                c_name: customer.Fullname != null ? customer.Fullname : "",
                c_phone: customer.Mobile != null ? customer.Mobile : "",
                c_address: customer.Address != null ? customer.Address : "",
                c_email: customer.Email != null ? customer.Email : "",
                c_identitynumber: customer.IdentityNumber != null ? customer.IdentityNumber : "",
                c_country: countryname != null && countryname.CountryName != null ? countryname.CountryName : ""
            }

            var roomDetail = {
                arrival: $scope.room.ArrivalDate.toLocaleString() != null ? $scope.room.ArrivalDate.format('dd/mm/yyyy, HH:MM') : "",
                departure: $scope.room.DepartureDate.toLocaleString() != null ? $scope.room.DepartureDate.format('dd/mm/yyyy, HH:MM') : "",
                number_adults: $scope.room.Adults != null ? $scope.room.Adults : "",
                number_children: $scope.room.Child != null ? $scope.room.Child : "",
                source: $scope.selectedSource != null ? ($scope.selectedSource.SourceName != null ? $scope.selectedSource.SourceName : "") : "",
                room_name: $scope.RoomName != null ? $scope.RoomName : "",
                room_type: $scope.roomTypeInfo.RoomTypeName != null ? $scope.roomTypeInfo.RoomTypeName : "",
                company_name: companyname,
                company_address: $scope.selectedCompany != null ? ($scope.selectedCompany.ContactAddress != null ? $scope.selectedCompany.ContactAddress : "") : "",
                booking_no_of_channel: $scope.CMBookingId != null ? $scope.CMBookingId : "",
                price_room_per_night: $scope.roomCharges.length > 0 && status == 1 ? ($scope.roomCharges[0].Amount != null ? $filter('currency')($scope.roomCharges[0].Amount) : strCompanyname) : strCompanyname,
                note: $scope.room.Note != null ? $scope.room.Note : "",
                booking_number: $scope.reservationNumber != null ? $scope.reservationNumber : "",
                total_price: $filter('currency')(_totalPrice)
            }
            // var obForms = {};

            // var ngonngu = $rootScope.language;
            // var Len = reservationdetail.bodyRegistrationcard.length;

            // for (var index = 0; index < Len; index++) {
            //     if (reservationdetail.bodyRegistrationcard[index].LanguageCode == ngonngu) {
            //         obForms = reservationdetail.bodyRegistrationcard[index];
            //         index = Len;
            //     }
            // }


            var hotelFormRoomInvoice = obForms.Body;
            // console.info(hotelFormRoomInvoice,"leo nguyen check lang3")
            var BodyRegistration = {
                Body: hotelFormRoomInvoice.replace(/\[Full_name]/g, customerDetail.c_name)
                    .replace(/\[Customer_phone]/g, customerDetail.c_phone)
                    .replace(/\[Customer_address]/g, customerDetail.c_address)
                    .replace(/\[Customer_email]/g, customerDetail.c_email)
                    .replace(/\[Customer_identity_number]/g, customerDetail.c_identitynumber)
                    .replace(/\[Customer_country]/g, customerDetail.c_country)
                    .replace(/\[Customer_sex]/g, customerDetail.c_sex)
                    .replace(/\[Customer_birthday]/g, customerDetail.c_dob)
                    .replace(/\[Arrival]/g, roomDetail.arrival)
                    .replace(/\[Departure]/g, roomDetail.departure)
                    .replace(/\[Source]/g, roomDetail.source)
                    .replace(/\[Number_Adults]/g, roomDetail.number_adults)
                    .replace(/\[Number_Children]/g, roomDetail.number_children)
                    .replace(/\[Price_room_per_night]/g, roomDetail.price_room_per_night)
                    .replace(/\[Room_name]/g, roomDetail.room_name)
                    .replace(/\[Room_type]/g, roomDetail.room_type)
                    .replace(/\[Company_name]/g, roomDetail.company_name)
                    .replace(/\[Company_address]/g, roomDetail.company_address)
                    .replace(/\[Booking_no_of_channel]/g, roomDetail.booking_no_of_channel)
                    .replace(/\[Booking_number]/g, roomDetail.booking_number)
                    .replace(/\[Note]/g, roomDetail.note)
                    .replace(/\[Total_price]/g, roomDetail.total_price),
                LanguageCode: obForms.LanguageCode
            }

            var CreateRoomInvoice = {
                roomId: $scope.room.RoomId,
                reservationRoomId: $stateParams.reservationRoomId,
                arrivalDate: $scope.room.ArrivalDate,
                departureDate: new Date(),
                adults: $scope.calculateAdults,
                children: $scope.calculateChildren,
                languageKeys: languageKeys,
                FOC: $scope.room.Foc,
                DiscountPercentage: $scope.room.DiscountPercentage,
                DiscountFlat: $scope.room.DiscountFlat,
                RoomPriceId: $scope.room.RoomPriceId,
                Price: $scope.roomPriceTemp
            }
            var modelRoomInvoiceFullDay = {
                roomId: $scope.room.RoomId,
                reservationRoomId: $stateParams.reservationRoomId,
                arrivalDate: $scope.room.ArrivalDate,
                departureDate: $scope.room.DepartureDate,
                adults: $scope.calculateAdults,
                children: $scope.calculateChildren,
                languageKeys: languageKeys,
                FOC: $scope.room.Foc,
                DiscountPercentage: $scope.room.DiscountPercentage,
                DiscountFlat: $scope.room.DiscountFlat,
                RoomPriceId: $scope.room.RoomPriceId,
                Price: $scope.roomPriceTemp
            }
            if ($scope.applyPastCheckOut) {
                CreateRoomInvoice.departureDate = $scope.room.DepartureDate;
            }

            $mdDialog.show({
                    controller: ['$sce', '$scope', '$mdDialog', 'loginFactory', 'reservationRoomId', 'BodyRegistration', 'modelRoomInvoiceFullDay', '$rootScope', InvoiceConfirmController],
                    locals: {
                        reservationRoomId: $stateParams.reservationRoomId,
                        BodyRegistration: BodyRegistration,
                        modelRoomInvoiceFullDay: modelRoomInvoiceFullDay
                    },
                    templateUrl: 'views/reservation/subtemplates/registration_card.html',
                    parent: angular.element(document.body),
                    // targetEvent: ev,
                    clickOutsideToClose: false
                })
                .then(function (answer) {}, function () {

                });
        };


        $scope.showPayment = function (ev, payment) {
            $mdDialog.show({
                    controller: PaymentController,
                    locals: {
                        reservationRoomId: $stateParams.reservationRoomId,
                        paymentId: payment.PaymentId,
                        paymentTypeName: payment.PaymentTypeName,
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


        function showThisInvoice(reservationRoomId) {
            console.log("Show it");
            $("#reportViewer1").telerik_ReportViewer({
                // The URL of the service which will serve reports.
                // The URL corresponds to the name of the controller class (ReportsController).
                // For more information on how to configure the service please check http://www.telerik.com/help/reporting/telerik-reporting-rest-conception.html.
                serviceUrl: apiUrl + "api/reports/",

                // The URL for the report viewer template. The template can be edited -
                // new functionalities can be added and unneeded ones can be removed.
                // For more information please check http://www.telerik.com/help/reporting/html5-report-viewer-templates.html.
                templateUrl: 'ReportViewer/templates/telerikReportViewerTemplate-9.2.15.930.html',

                //ReportSource - report description
                reportSource: {

                    // The report can be set to a report file name (trdx report definition)
                    // or CLR type name (report class definition).
                    report: "ezCloud.Reporting.RoomInvoice, ezCloud.Reporting",

                    // Parameters name value dictionary
                    parameters: {
                        ReservationRoomId: reservationRoomId
                    }
                },

                // Specifies whether the viewer is in interactive or print preview mode.
                // PRINT_PREVIEW - Displays the paginated report as if it is printed on paper. Interactivity is not enabled.
                // INTERACTIVE - Displays the report in its original width and height without paging. Additionally interactivity is enabled.
                viewMode: telerikReportViewer.ViewModes.PRINTPREVIEW,

                // Sets the scale mode of the viewer.
                // Three modes exist currently:
                // FIT_PAGE - The whole report will fit on the page (will zoom in or out), regardless of its width and height.
                // FIT_PAGE_WIDTH - The report will be zoomed in or out so that the width of the screen and the width of the report match.
                // SPECIFIC - Uses the scale to zoom in and out the report.
                scaleMode: telerikReportViewer.ScaleModes.SPECIFIC,

                // Zoom in and out the report using the scale
                // 1.0 is equal to 100%, i.e. the original size of the report
                scale: 1.0,

                ready: function () {
                    //this.refreshReport();
                },
            });
        }

        function InvoiceController($scope, $mdDialog, loginFactory, reservationRoomId, hotelFormRoomInvoice, modelRoomInvoiceFullDay, $rootScope) {
            //showInvoice(reservationRoomId);
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
        }

        function InvoiceConfirmController($sce, $scope, $mdDialog, loginFactory, reservationRoomId, BodyRegistration, modelRoomInvoiceFullDay, $rootScope) {

            // console.info(BodyRegistration, "leo nguyen check lang5")
            $scope.ConditionPolicyOption = {
                language: ($rootScope.language == "vn") ? "vi" : $rootScope.language,
                toolbar: [{
                    name: 'document',
                    items: ['Print']
                }],
                toolbarCanCollapse: false,
                allowedContent: true,
                entities: true,
                disabled: true,
                contentEditable: false,
                disableAutoInline: true,
                height: 642,
                width: 723,
                autoParagraph: false,
                autoGrow_onStartup: true,
                FullPage: false,
                resize_enabled: false,
                removePlugins: 'elementspath',
                setReadOnly: false

            };

            $scope.readyCkeditor = function () {
                setTimeout(function () {
                    jQuery(".cke_button__print").click();
                    jQuery("#cancel_btn").click();
                }, 1000);
            }

            $scope.hideFullDay = false;
            $scope.isFullDay = true;
            var modelRoomInvoiceFullDayTemp = angular.copy(modelRoomInvoiceFullDay);
            globalInvoiceId = reservationRoomId;
            $scope.BodyRegistration = BodyRegistration;
            _reservationId = 0;


            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
            $scope.trustAsHtml = function (string) {
                return $sce.trustAsHtml(string);
            };

        }

        $scope.isCustomerChanged = false;
        $scope.$watchCollection('customer', function (newValue, oldValue) {
            if (_.size(newValue) != 0 && _.size(oldValue) != 0) {
                if (!angular.equals(newValue, oldValue)) {
                    $scope.isCustomerChanged = true;
                }
                if (newValue.Fullname == "") newValue.Fullname = null;
                if (angular.equals(newValue, $scope.originalCustomer)) {
                    $scope.isCustomerChanged = false;
                }
            }
        });

        $scope.saveCustomerChanges = function () {
            var data = {
                customer: $scope.customer,
                room: $scope.room
            };
            console.log("CUSTOMER DATA", data);
            var save = loginFactory.securedPostJSON("api/Room/Save", data);
            $rootScope.dataLoadingPromise = save;
            save.success(function (data2) {
                $scope.isCustomerChanged = false;
                $scope.originalCustomer = angular.copy(data.customer);
            }).error(function (err) {
                console.log(err);
            });
        }

        $scope.isRoomChanged = false;


        $scope.saveRoomChanges = function () {
            var data = {
                customer: $scope.customer,
                room: $scope.room
            };
            var save = loginFactory.securedPostJSON("api/Room/Save", data);
            $rootScope.dataLoadingPromise = save;
            save.success(function (data2) {
                $scope.isRoomChanged = false;

                if ($scope.room.BookingStatus == 'CHECKIN' || $scope.room.BookingStatus == 'OVERDUE') {
                    var RoomPrice = {
                        roomId: $scope.room.RoomId,
                        reservationRoomId: $scope.room.ReservationRoomId,
                        arrivalDate: $scope.room.ArrivalDate.toLocaleString(),
                        departureDate: new Date().toLocaleString(),
                        adults: $scope.room.Adults,
                        children: $scope.room.Child,
                        roomTypeId: $scope.room.RoomTypeId
                    };
                    if (RoomPrice.roomId == null || RoomPrice.roomId == undefined) {
                        RoomPrice.roomId = 0;
                    }
                    var calculateRoomPricePromise = loginFactory.securedPostJSON("api/Room/CalculateRoomPrice", RoomPrice);
                    calculateRoomPricePromise.success(function (data) {
                        console.log("DATA TEMP", data.totalPrice);
                        if (data != null) {
                            $scope.room.Total = data.totalPrice;
                        } else {
                            $scope.room.Total = 0;
                        }
                    }).error(function (err) {
                        console.log(err);
                    });
                }
                $scope.originalRoom = angular.copy(data.room);
            }).error(function (err) {
                console.log(err);
            });
        }


        $scope.querySearch = querySearch;

        function querySearch(query) {
            var lowercaseQuery = angular.lowercase(query);
            var result;
            for (var index in $scope.customerList) {

                if ($scope.customerList[index].Fullname) {

                    if (angular.lowercase($scope.customerList[index]['Fullname']).indexOf(lowercaseQuery) > -1) {
                        if (!result) {
                            result = [];
                        }
                        result.push($scope.customerList[index]);
                    }
                }
                if (result == undefined) {
                    result = null;
                }
            }
            console.log("RESULT", result);
            return result;

        }

        function searchTextChange(text) {
            console.log("GET THERE", text);
            $scope.customer.Fullname = text;
        }

        $scope.selectedItemChange = function (item) {
            //            $scope.customer = item;console.log(customer);
            //console.log('Item:',item, item.Fullname===null?'null':item.Fullname);
            console.log('Item changed to ' + JSON.stringify(item));
            console.log('Search Text', $scope.searchText);
            console.log('item:', item);
            if ($scope.countries !== null && $scope.countries.length > 0 && item.CountryId !== null)
                $scope.selectedCountries = _.filter($scope.countries, function (citem) {
                    return citem.CountryId == item.CountryId;
                })[0];

            console.log('selectedCountries:', $scope.selectedCountries);
            //console.log('Email:',item.Email);
            $scope.customer.Fullname = item.Fullname;
            $scope.customer.Mobile = item.Mobile;
            $scope.customer.Email = item.Email;
            $scope.customer.IdentityNumber = item.IdentityNumber;
            $scope.customer.Birthday = item.Birthday;
            $scope.customer.Address = item.Address;
            $scope.customer.Gender = item.Gender;
            $scope.customer.TravellerId = item.TravellerId;
            $scope.customer.CountryId = item.CountryId;
            $scope.customer.Note = item.Note;
        };

        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);
            return function filterFn(customer) {
                var result = null;
                if (customer.Fullname) {
                    result = customer.Fullname.indexOf(lowercaseQuery) == 0
                }
                return result;
            };
        }

        $scope.showESDetail = function (item, ev) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));
            console.log("ITEM", item);
            $mdDialog.show({
                    controller: ExtraServiceDetailController,
                    resolve: {
                        currentItem: function () {
                            return item;
                        },
                        esItems: function () {
                            return $scope.RoomExtraServiceItems;
                        }
                    },
                    templateUrl: 'views/templates/extraServiceDetail.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    fullscreen: useFullScreen
                })
                .then(function () {


                }, function () {});
        }

        function ExtraServiceDetailController($scope, $mdDialog, currentItem, esItems) {
            console.log("ES ITEM LIST", esItems);
            $scope.currentItemList = [];

            function Init() {
                $scope.esItems = esItems;
                $scope.currentExtraService = currentItem;
                console.log("ES ITEMS", esItems);
                //$scope.itemList = esItems;
                for (var index in esItems) {
                    if (esItems[index].RoomExtraServiceId == $scope.currentExtraService.RoomExtraServiceId) {
                        console.log("FOUND IT", esItems[index]);
                        $scope.currentItemList.push(esItems[index]);
                    }
                }
                console.log("CURRENT ITEM LIST", $scope.currentItemList);
            }
            Init();
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };



        }

        $scope.lookUpCustomer = function (ev) {
            var currentCustomer = angular.copy($scope.customer);
            $mdDialog.show({
                controller: LookUpCustomerController,
                resolve: {
                    currentCustomer: function () {
                        return currentCustomer;
                    }
                },
                templateUrl: 'views/templates/lookUpCustomer.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
            }).then(function (customerBinding) {
                $scope.customer.TravellerId = customerBinding.TravellerId;
                $scope.customer.Fullname = customerBinding.Fullname;
                $scope.customer.Gender = customerBinding.Gender;
                $scope.customer.IdentityNumber = customerBinding.IdentityNumber;
                $scope.customer.Birthday = customerBinding.Birthday
                $scope.customer.Mobile = customerBinding.Mobile;
                $scope.customer.Email = customerBinding.Email;
                $scope.customer.Address = customerBinding.Address;
            }, function () {});
        }

        function LookUpCustomerController($scope, $mdDialog, $filter, currentCustomer) {
            function Init() {
                $scope.customer = currentCustomer;
                var customerList = loginFactory.securedGet("api/Room/AllCustomer");
                customerList.success(function (data) {
                    $scope.customerList = data;
                }).error(function (err) {
                    console.log(err);
                });
            }
            Init();

            $scope.customerContainsSearchText = function (customer) {
                $scope.found = false;
                var fullNameQuery = (customer.Fullname != null) ? customer.Fullname.indexOf($scope.customer.Fullname) >= 0 : null;
                var identityNumberQuery = (customer.IdentityNumber != null) ? customer.IdentityNumber.indexOf($scope.customer.IdentityNumber) >= 0 : null;
                var mobileQuery = (customer.Mobile != null) ? customer.Mobile.indexOf($scope.customer.Mobile) >= 0 : null;
                var emailQuery = (customer.Email != null) ? customer.Email.indexOf($scope.customer.Email) >= 0 : null;
                var result = fullNameQuery || identityNumberQuery || mobileQuery || emailQuery;
                return result;
            };

            $scope.bindingSelectedCustomer = function (cus) {
                var customerBinding = {};
                customerBinding.TravellerId = cus.TravellerId;
                customerBinding.Fullname = cus.Fullname;
                customerBinding.Gender = cus.Gender;
                customerBinding.Birthday = cus.Birthday;
                customerBinding.IdentityNumber = cus.IdentityNumber;
                customerBinding.Mobile = cus.Mobile;
                customerBinding.Email = cus.Email;
                customerBinding.Address = cus.Address;
                $mdDialog.hide(customerBinding);
            };
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
        }

        $scope.addSharer = function (ev) {
            var currentCustomer = angular.copy($scope.customer);
            $mdDialog.show({
                controller: SharerController,
                resolve: {
                    reservationRoomId: function () {
                        return $stateParams.reservationRoomId;
                    },
                    countries: function () {
                        return $scope.countries;
                    },
                    isUsePassport: function () {
                        return $scope.isUsePassport;
                    }
                },
                templateUrl: 'views/templates/addSharer.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
            }).then(function (SharerModel) {
                console.log("SHAER MODEL 1", SharerModel);
                console.log("SHARER LIST", $scope.sharerList);
                if (!$stateParams.reservationRoomId) {
                    if ($scope.sharerList.length > 0) {

                        if (_.size(_.filter($scope.sharerList, function (item) {
                                return (item.customer.TravellerId == SharerModel.customer.TravellerId)
                            })) > 0) {
                            dialogService.messageBox("SHARER_IS_ALREADY_EXISTS");
                        } else {
                            $scope.sharerList.push(SharerModel);
                        }
                    } else {
                        $scope.sharerList.push(SharerModel);
                    }
                } else {
                    /*if (_.size(_.where($scope.sharerList, SharerModel)) > 0) {
                        dialogService.messageBox("SHARER_IS_ALREADY_EXISTS");
                    }*/
                    if (SharerModel.customer.TravellerId && _.size(_.filter($scope.sharerList, function (item) {
                            console.log("ITEM", item);
                            if (item.customer.TravellerId) {
                                return (item.customer.TravellerId == SharerModel.customer.TravellerId);
                            }

                        })) > 0) {
                        dialogService.messageBox("SHARER_IS_ALREADY_EXISTS");
                    } else {


                        if ($stateParams.reservationRoomId) {
                            var saveSharerInfor = loginFactory.securedPostJSON("api/Room/AddSharer", SharerModel);
                            $rootScope.dataLoadingPromise = saveSharerInfor;
                            saveSharerInfor.success(function (data) {
                                Init();
                                /*$state.go($state.current, {}, {
                                    reload: true
                                });*/
                            }).error(function (err) {
                                console.log(err);
                            });
                        } else {
                            $scope.sharerList.push(SharerModel);
                        }

                    }
                }
            }, function () {});
        }

        function SharerController($scope, $mdDialog, loginFactory, reservationRoomId, countries, isUsePassport) {
            $scope.sharer = {};
            $scope.warningCountry = false;

            function Init() {
                $scope.customerList = {
                    SkipRecord: 0
                };
                $scope.DateTimePickerOption = {
                    format: 'dd/MM/yyyy HH:mm'
                };
                $scope.DatePickerOption = {
                    format: 'dd/MM/yyyy'
                };
                $scope.Countries = countries;
                $scope.isUsePassport = isUsePassport;

                var defaultCountry = _.filter($scope.Countries, function (item) {
                    return item.CountryCode.toLowerCase() == "vn";
                });

                if ($scope.Countries !== null && defaultCountry !== null && defaultCountry[0] !== null && defaultCountry[0].CountryId !== null && $scope.Countries.length > 0)

                    $scope.selectedCountries = _.filter($scope.Countries, function (item) {
                        return item.CountryId == defaultCountry[0].CountryId;
                    })[0];
                $scope.queryCountriesSearch = queryCountriesSearch;
                $scope.selectedCountriesChange = selectedCountriesChange;
                $scope.searchCountriesTextChange = searchCountriesTextChange;
                $scope.isChild = false;
            }
            Init();
            $scope.searchSharer = function ($mdOpenMenu, ev) {
                if ($scope.sharer.Fullname == null || $scope.sharer.Fullname.length < 2) {
                    return;
                }
                $scope.sharer.TravellerId = null;
                $scope.sharer.Gender = 0;
                $scope.sharer.IdentityNumber = null;
                $scope.sharer.Birthday = null;
                $scope.sharer.Mobile = null;
                $scope.sharer.Email = null;
                $scope.sharer.Address = null;
                $scope.sharer.Note = null;
                $scope.searchCountriesText = null;
                $scope.selectedCountries = selectedCountries;
                $scope.sharer.ValidUntil = null;
                $scope.sharer.ImageLocation = null;
                var searchModel = {
                    CustomerName: $scope.sharer.Fullname,
                    SkipRecord: 0
                };
                var searchCustomer = loginFactory.securedPostJSON("api/Room/SearchCustomer", searchModel);
                $rootScope.dataLoadingPromise = searchCustomer;
                searchCustomer.success(function (data) {
                    if (data) {
                        $scope.customerList = null;
                        $scope.customerList = data;
                        $mdOpenMenu(ev);
                    }
                }).error(function (err) {
                    loginFactory.toast("SEARCH_CUSTOMER_ERROR");
                });
            };
            $scope.selectSharer = function (customer) {
                if (customer) {
                    $scope.sharer.TravellerId = customer.TravellerId;
                    $scope.sharer.Fullname = customer.Fullname;
                    $scope.sharer.IdentityNumber = customer.IdentityNumber;
                    $scope.sharer.Mobile = customer.Mobile;
                    $scope.sharer.Birthday = customer.Birthday;
                    $scope.sharer.Gender = customer.Gender;
                    $scope.sharer.Email = customer.Email;
                    $scope.sharer.Address = customer.Address;
                    $scope.sharer.Note = customer.Note;
                    $scope.selectedCountries = _.filter($scope.Countries, function (item) {
                        return item.CountryId == customer.CountryId;
                    })[0];
                }
            }
            $scope.moreSharer = function () {
                $scope.customerList.SkipRecord += 10;
                //
                var searchModel = {
                    CustomerName: $scope.sharer.Fullname,
                    SkipRecord: $scope.customerList.SkipRecord
                };
                var searchCustomer = loginFactory.securedPostJSON("api/Room/SearchCustomer", searchModel);
                $rootScope.dataLoadingPromise = searchCustomer;
                searchCustomer.success(function (data) {
                    if (data && data.Travellers.length > 0) {
                        for (var idx in data.Travellers) {
                            var currentTraveller = data.Travellers[idx];
                            $scope.customerList.Travellers.push(currentTraveller);
                        };
                    }
                }).error(function (err) {
                    loginFactory.toast("SEARCH_CUSTOMER_ERROR");
                });
            }
            $scope.sharerContainsSearchText = function (customer) {
                $scope.found = false;
                var fullNameQuery = (customer.Fullname != null) ? customer.Fullname.indexOf($scope.sharer.Fullname) >= 0 : null;
                var identityNumberQuery = (customer.IdentityNumber != null) ? customer.IdentityNumber.indexOf($scope.sharer.IdentityNumber) >= 0 : null;
                var mobileQuery = (customer.Mobile != null) ? customer.Mobile.indexOf($scope.sharer.Mobile) >= 0 : null;
                var emailQuery = (customer.Email != null) ? customer.Email.indexOf($scope.sharer.Email) >= 0 : null;
                var result = fullNameQuery || identityNumberQuery || mobileQuery || emailQuery;
                return result;
            };

            $scope.bindingSelectedSharer = function (cus) {
                var customerBinding = {};
                $scope.sharer.TravellerId = cus.TravellerId;
                $scope.sharer.Fullname = cus.Fullname;
                $scope.sharer.Gender = cus.Gender;
                $scope.sharer.Birthday = cus.Birthday;
                $scope.sharer.IdentityNumber = cus.IdentityNumber;
                $scope.sharer.Mobile = cus.Mobile;
                $scope.sharer.Email = cus.Email;
                $scope.sharer.Address = cus.Address;
            };

            function queryCountriesSearch(query) {
                console.log('scope.Countries:', $scope.Countries);
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

            $scope.lookUpSharer = function () {}

            $scope.saveInfoPassport = function () {
                $scope.sharer.Fullname = FullnameCustomer;
                $scope.sharer.Gender = Gender === "M" ? 0 : 1;
                $scope.sharer.IdentityNumber = IdentityNumber;
                if (Birthday) {
                    $scope.sharer.Birthday = new Date(Birthday);
                    $scope.dateString = $scope.sharer.Birthday.format('dd/mm/yyyy');
                }

                $scope.sharer.ImageLocation = ImageLocation;
                $scope.sharer.ValidUntil = new Date(ValidUntil);

                if ($scope.Countries !== null && $scope.sharer !== null && $scope.Countries.length > 0)

                    $scope.selectedCountries = _.filter($scope.Countries, function (item) {
                        return item.CountryCode == CountryCode;
                    })[0];
                console.log("country passport:", $scope.selectedCountries);
                console.log("customer passport:", $scope.sharer);
            }


            $scope.addSharerInformation = function () {

                if ($scope.selectedCountries == null) {
                    $scope.warningCountry = true;
                    return;
                } else {
                    $scope.sharer.CountryId = $scope.selectedCountries.CountryId;
                }

                var travellerExtraInfo = {
                    IsChild: $scope.isChild
                }
                var SharerModel = {
                    customer: $scope.sharer,
                    reservationRoomId: $stateParams.reservationRoomId,
                    travellerExtraInfo: travellerExtraInfo
                }
                $mdDialog.hide(SharerModel);
            }

            $scope.selectedItemChange = function (item) {
                $scope.sharer = item;
            }
        }

        $scope.editCustomer = function (ev) {
            var customerTemp = angular.copy($scope.customer);
            var customerTemp2 = angular.copy($scope.customer);
            var index;
            for (var idx in $scope.sharerList) {
                if ($scope.sharerList[idx].customer.TravellerId == $scope.customer.TravellerId) {
                    index = idx;
                    break;
                }
            }

            $mdDialog.show({
                controller: EditCustomerController,
                resolve: {
                    currentCustomer: function () {
                        return customerTemp;
                    },
                    countries: function () {
                        return $scope.countries;
                    },
                    isUsePassport: function () {
                        return $scope.isUsePassport;
                    }
                },
                templateUrl: 'views/templates/editCustomer.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
            }).then(function (SharerViewModel) {
                var save = loginFactory.securedPostJSON("api/Room/EditSharerInfo", SharerViewModel);
                $rootScope.dataLoadingPromise = save;
                save.success(function (data2) {
                    dialogService.toast("EDIT_TRAVELLER_SUCCESSFULLY");
                    Init();
                }).error(function (err) {
                    console.log(err);
                });

            }, function () {});

        };

        function EditCustomerController($scope, $mdDialog, currentCustomer, countries, isUsePassport) {
            $scope.warningCountry;

            function Init() {
                $scope.DatePickerOption = {
                    format: 'dd/MM/yyyy'
                };
                $scope.warningCountry = false;
                $scope.customer = currentCustomer;
                $scope.Countries = countries;
                $scope.isUsePassport = isUsePassport;
                console.log('scope.customer', $scope.customer);
                /*$scope.selectedCountries = _.filter($scope.Countries, function (item){
                    return item.CountryCode.toLowerCase() == "vn";
                });*/
                //$scope.selectedCountries = JSON.parse(JSON.stringify($scope.selectedCountries));

                $scope.queryCountriesSearch = queryCountriesSearch;
                $scope.selectedCountriesChange = selectedCountriesChange;
                $scope.searchCountriesTextChange = searchCountriesTextChange;

                if ($scope.Countries !== null && $scope.customer !== null && $scope.Countries.length > 0)

                    $scope.selectedCountries = _.filter($scope.Countries, function (item) {
                        return item.CountryId == $scope.customer.CountryId;
                    })[0];


                if ($scope.customer.Birthday) {
                    $scope.customer.Birthday = new Date($scope.customer.Birthday);
                    $scope.dateString = $scope.customer.Birthday.format('dd/mm/yyyy');
                }
            }

            Init();

            function queryCountriesSearch(query) {
                console.log('scope.Countries:', $scope.Countries);
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

            // // passport
            $scope.saveInfoPassport = function () {
                $scope.customer.Fullname = FullnameCustomer;
                $scope.customer.Gender = Gender === "M" ? 0 : 1;
                $scope.customer.IdentityNumber = IdentityNumber;
                if (Birthday) {
                    $scope.customer.Birthday = new Date(Birthday);
                    $scope.dateString = $scope.customer.Birthday.format('dd/mm/yyyy');
                }

                $scope.customer.ImageLocation = ImageLocation;
                $scope.customer.ValidUntil = new Date(ValidUntil);

                if ($scope.Countries !== null && $scope.customer !== null && $scope.Countries.length > 0)

                    $scope.selectedCountries = _.filter($scope.Countries, function (item) {
                        return item.CountryCode == CountryCode;
                    })[0];
                console.log("country passport:", $scope.selectedCountries);
                console.log("customer passport:", $scope.customer);
            }


            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.saveCustomer = function () {
                if ($scope.customer.Fullname == null || $scope.customer.Fullname == undefined || $scope.customer.Fullname == '') {
                    $scope.warningFullName = true;
                    return;
                } else $scope.warningFullName = false;

                if ($scope.customer.Email != undefined && $scope.customer.Email != "") {
                    var re = /^(([^<>()\[\]\.,;:\s@]+(\.[^<>()\[\]\.,;:\s@]+)*)|)@(([^<>()[\]\.,;:\s@]+\.)+[^<>()[\]\.,;:\s@]{2,})$/i;
                    var testEmail = re.test(String($scope.customer.Email).toLowerCase());
                    if (!testEmail) {
                        $scope.warningEmail = true;
                        return;
                    }
                }
                if ($scope.selectedCountries == null) {
                    $scope.warningCountry = true;
                    return;
                } else {
                    $scope.customer.CountryId = $scope.selectedCountries.CountryId;
                    $scope.warningCountry = false;
                }

                var SharerViewModel = {
                    customer: $scope.customer,
                    reservationRoomId: $stateParams.reservationRoomId,
                    travellerExtraInfo: null
                }

                $mdDialog.hide(SharerViewModel);
            }


        }

        $scope.deleteSharer = function (sharer) {
            dialogService.confirm("DELETE_CONFIRM", "DO_YOU_WANT_TO_REMOVE_THIS_SHARER").then(function () {
                var removeSharer = loginFactory.securedPostJSON("api/Room/RemoveSharer?sharerId=" + sharer.customer.TravellerId + "&reservationRoomId=" + $stateParams.reservationRoomId, "");
                $rootScope.dataLoadingPromise = removeSharer;
                removeSharer.success(function (data) {
                    dialogService.toast("SHARER_REMOVED_SUCCESSFUL");
                    /*$state.go($state.current, {}, {
                        reload: true
                    });*/
                    Init();
                }).error(function (err) {
                    console.log(err);
                })
            });
        };

        $scope.setMainCustomer = function (sharer) {
            var customerTemp = angular.copy($scope.customer);
            dialogService.confirm("CONFIRM", "DO_YOU_WANT_TO_SET_THIS_SHARER_TO_MAIN_CUSTOMER" + "?").then(function () {
                var setMainCustomer = loginFactory.securedPostJSON("api/Room/SetMainCustomer?sharerId=" + sharer.customer.TravellerId + "&reservationRoomId=" + $stateParams.reservationRoomId, "");
                $rootScope.dataLoadingPromise = setMainCustomer;
                setMainCustomer.success(function (data) {
                    $scope.customer = sharer.customer;
                    dialogService.toast("MAIN_CUSTOMER_CHANGED_SUCCESSFUL");
                    //Init();
                    $state.go($state.current, {}, {
                        reload: true
                    });
                }).error(function (err) {
                    console.log(err);
                })
            });
        };


        $scope.editSharer = function (ev, sharer) {
            var index = $scope.sharerList.indexOf(sharer);
            var sharerTemp = angular.copy($scope.sharerList[index]);
            $mdDialog.show({
                controller: EditSharerController,
                resolve: {
                    currentSharer: function () {
                        return sharerTemp;
                    },
                    countries: function () {
                        return $scope.countries;
                    },
                    isUsePassport: function () {
                        return $scope.isUsePassport;
                    }
                },
                templateUrl: 'views/templates/editSharer.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
            }).then(function (SharerModel) {
                console.log("SHARER MODEL", SharerModel);
                var SharerViewModel = {
                    customer: SharerModel.sharer,
                    reservationRoomId: $stateParams.reservationRoomId,
                    travellerExtraInfo: SharerModel.travellerExtraInfo
                }
                var saveSharerInfor = loginFactory.securedPostJSON("api/Room/EditSharerInfo", SharerViewModel);
                $rootScope.dataLoadingPromise = saveSharerInfor;
                saveSharerInfor.success(function (data) {
                    dialogService.toast("SHARER_EDITED_SUCCESSFUL");
                    Init();
                }).error(function (err) {});
            });
        }

        function EditSharerController($scope, $rootScope, $mdDialog, currentSharer, countries, isUsePassport) {
            $scope.warningCountry;

            function Init() {
                $scope.DatePickerOption = {
                    format: 'dd/MM/yyyy'
                };
                $scope.sharer = currentSharer;
                $scope.isChild = currentSharer.travellerExtraInfo.IsChild;
                $scope.Countries = countries;
                $scope.isUsePassport = isUsePassport;
                $scope.queryCountriesSearch = queryCountriesSearch;
                $scope.selectedCountriesChange = selectedCountriesChange;
                $scope.searchCountriesTextChange = searchCountriesTextChange;

                if ($scope.Countries !== null && $scope.sharer !== null && $scope.Countries.length > 0)

                    $scope.selectedCountries = _.filter($scope.Countries, function (item) {
                        return item.CountryId == $scope.sharer.customer.CountryId;
                    })[0];

                if ($scope.sharer.Birthday) {
                    $scope.sharer.Birthday = new Date($scope.sharer.Birthday);
                    $scope.dateString = $scope.sharer.Birthday.format('dd/mm/yyyy');
                }

                console.log("Current Sharer", $scope.sharer);

            }
            Init();

            $scope.saveSharer = function () {

                if ($scope.selectedCountries == null) {
                    $scope.warningCountry = true;
                    return;
                } else {
                    $scope.sharer.customer.CountryId = $scope.selectedCountries.CountryId;
                }

                var travellerExtraInfo = {
                    isChild: $scope.isChild
                };
                var SharerModel = {
                    sharer: $scope.sharer.customer,
                    travellerExtraInfo: travellerExtraInfo
                };
                $mdDialog.hide(SharerModel);
            }

            function queryCountriesSearch(query) {
                console.log('scope.Countries:', $scope.Countries);
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

            // // passport
            $scope.saveInfoPassport = function () {
                $scope.sharer.customer.Fullname = FullnameCustomer;
                $scope.sharer.customer.Gender = Gender === "M" ? 0 : 1;
                $scope.sharer.customer.IdentityNumber = IdentityNumber;
                if (Birthday) {
                    $scope.sharer.customer.Birthday = new Date(Birthday);
                    $scope.dateString = $scope.sharer.customer.Birthday.format('dd/mm/yyyy');
                }

                $scope.sharer.customer.ImageLocation = ImageLocation;
                $scope.sharer.customer.ValidUntil = new Date(ValidUntil);

                if ($scope.Countries !== null && $scope.sharer.customer !== null && $scope.Countries.length > 0)

                    $scope.selectedCountries = _.filter($scope.Countries, function (item) {
                        return item.CountryCode == CountryCode;
                    })[0];
                console.log("country passport:", $scope.selectedCountries);
                console.log("customer passport:", $scope.sharer.customer);
            }

            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
        }

        $scope.assignRate = function () {
            var itemTemp = angular.copy($scope.room);

            $mdDialog.show({
                controller: AssignRateDialogController,
                resolve: {
                    ReservationRoomId: function () {
                        return $scope.room.ReservationRoomId;
                    },
                    RoomTypeId: function () {
                        return $scope.roomTypeInfo.RoomTypeId;
                    },
                    RateList: function () {
                        return $scope.rateList;
                    }
                },
                templateUrl: 'views/templates/assignRate.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: event,
            }).then(function (assginRateModel) {
                console.log("ASSIGN RATE MODEL", assginRateModel);
                var processAssignRate = loginFactory.securedPostJSON("api/Room/ProcessAssignRate?RRID=" + assginRateModel.ReservationRoomId + "&roomPriceId=" + assginRateModel.RoomPriceId, "");
                $rootScope.dataLoadingPromise = processAssignRate;
                processAssignRate.success(function (data) {
                    dialogService.toast("ASSIGN_RATE_SUCCESSFUL");
                    Init();
                }).error(function (err) {
                    console.log(err);
                })
            }, function () {

            });
        };

        function AssignRateDialogController($scope, $mdDialog, ReservationRoomId, RoomTypeId, RateList, loginFactory) {

            function Init() {
                $scope.ReservationRoomId = ReservationRoomId;
                $scope.RoomTypeId = RoomTypeId;
                $scope.rateList = RateList;
                $scope.RoomPriceId = null;
            }
            Init();

            $scope.processAssignRate = function () {
                var assginRateModel = {
                    ReservationRoomId: $scope.ReservationRoomId,
                    RoomPriceId: $scope.RoomPriceId
                };
                $mdDialog.hide(assginRateModel);
            }

            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
        }

        $scope.addRemark = function () {
            var roomTypeTemp = angular.copy($scope.roomTypeInfo);
            var resultTemp = angular.copy($scope.room);
            $mdDialog.show({
                controller: AddRemarkDialogController,
                resolve: {
                    remarkEvents: function () {
                        return $scope.remarkEvents;
                    }

                },
                templateUrl: 'views/templates/addRemark.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: event,
            }).then(function (RemarkModel) {
                console.log("stateParams.reservationRoomId", $stateParams.reservationRoomId);
                if ($stateParams.reservationRoomId) {
                    var RoomRemarkModel = {
                        ReservationRoomId: $stateParams.reservationRoomId,
                        RemarkEventId: RemarkModel.RemarkEventId,
                        Description: RemarkModel.Description
                    }
                    console.log("RoomRemarkModel", RoomRemarkModel);
                    var processAddRemark = loginFactory.securedPostJSON("api/Room/AddRoomRemark", RoomRemarkModel);
                    $rootScope.dataLoadingPromise = processAddRemark;
                    processAddRemark.success(function (data) {
                        dialogService.toast("ADD_REMARK_SUCCESSFUL");
                        Init();
                    }).error(function (err) {
                        console.log(err);
                    });
                } else {
                    var RoomRemarkModel = {
                        // ReservationRoomId: $stateParams.reservationRoomId,
                        RemarkEventId: RemarkModel.RemarkEventId,
                        Description: RemarkModel.Description,
                        IsCompleted: false,
                        IsDeleted: false,
                        CreatedDate: new Date()
                    }
                    for (var index in $scope.remarkEvents) {
                        if ($scope.remarkEvents[index].RemarkEventId == RoomRemarkModel.RemarkEventId) {
                            RoomRemarkModel.RemarkEventCode = $scope.remarkEvents[index].RemarkEventCode;
                            break;
                        }
                    }
                    $scope.roomRemarks.push(RoomRemarkModel);
                }

            }, function () {

            });
        };

        function AddRemarkDialogController($scope, $mdDialog, remarkEvents, loginFactory) {
            $scope.roomRemark = {};

            function Init() {
                $scope.remarkEvents = remarkEvents;
                $scope.reservationRoomId = $stateParams.reservationRoomId;
                $scope.hasRRIDParam = ($stateParams.reservationRoomId) ? true : false;
            }
            Init();
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
            $scope.processAddRemark = function () {
                var RemarkModel = {
                    RemarkEventId: $scope.roomRemark.RemarkEventId,
                    Description: $scope.roomRemark.Description,
                    ReservationRoomId: $stateParams.reservationRoomId

                };
                $mdDialog.hide(RemarkModel);

            };

        }

        $scope.editRemark = function (remark, ev) {
            var remarkTemp = angular.copy(remark);
            $mdDialog.show({
                controller: EditRemarkDialogController,
                resolve: {
                    remarkEvents: function () {
                        return $scope.remarkEvents;
                    },
                    remark: function () {
                        return remarkTemp;
                    }
                },
                templateUrl: 'views/templates/editRemark.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: event,
            }).then(function (RemarkModel) {
                console.log("REMARK MODEL", RemarkModel);
                var RoomRemarkModel = {
                    ReservationRoomId: $stateParams.reservationRoomId,
                    RemarkEventId: RemarkModel.RemarkEventId,
                    Description: RemarkModel.Description,
                    RoomRemarkId: RemarkModel.RoomRemarkId
                }
                if ($stateParams.reservationRoomId) {
                    var processEditRemark = loginFactory.securedPostJSON("api/Room/EditRoomRemark", RoomRemarkModel);
                    $rootScope.dataLoadingPromise = processEditRemark;
                    processEditRemark.success(function (data) {
                        dialogService.toast("EDIT_REMARK_SUCCESSFUL");
                        Init();
                    }).error(function (err) {
                        console.log(err);
                    });
                } else {
                    console.log("RRM", $scope.roomRemarks);
                    var index = $scope.roomRemarks.indexOf(RoomRemarkModel);
                    console.log("RRM INDEX", index);
                    $scope.roomRemarks[index] = RoomRemarkModel;
                }

            }, function () {

            });

        }

        function EditRemarkDialogController($scope, $mdDialog, remarkEvents, remark, loginFactory) {
            function Init() {
                $scope.remark = remark;
                $scope.remarkEvents = remarkEvents;
            }
            Init();
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.processSaveRemark = function () {
                var RemarkModel = {
                    RemarkEventId: $scope.remark.RemarkEventId,
                    Description: $scope.remark.Description,
                    RoomRemarkId: $scope.remark.RoomRemarkId
                };
                $mdDialog.hide(RemarkModel);

            };
        }

        $scope.removeRemark = function (remark) {
            var remarkTemp = angular.copy(remark);
            var RoomRemarkModel = {
                ReservationRoomId: $stateParams.reservationRoomId,
                RemarkEventId: remarkTemp.RemarkEventId,
                Description: remarkTemp.Description,
                RoomRemarkId: remarkTemp.RoomRemarkId
            }
            if ($stateParams.reservationRoomId) {
                dialogService.confirm("DELETE_REMARK", "WOULD_YOU_LIKE_TO_DELETE_THIS_REMARK").then(function () {
                    var processDeleteRemark = loginFactory.securedPostJSON("api/Room/RemoveRoomRemark", RoomRemarkModel);
                    $rootScope.dataLoadingPromise = processDeleteRemark;
                    processDeleteRemark.success(function (data) {
                        dialogService.toast("DELETE_REMARK_SUCCESSFUL");
                        Init();
                    });
                });
            } else {
                console.log("RRM", $scope.roomRemarks);
                $scope.roomRemarks.splice($scope.roomRemarks.indexOf(RoomRemarkModel, 1));
            }
        }


        $scope.changeRemarkStatus = function (remark) {
            var remarkTemp = angular.copy(remark);
            var RoomRemarkModel = {
                RoomRemarkId: remarkTemp.RoomRemarkId,
                IsCompleted: !remark.IsCompleted
            }
            dialogService.confirm("CHANGE_REMARK_STATUS", "WOULD_YOU_LIKE_TO_CHANGE_THIS_REMARK_STATUS").then(function () {
                var processChangeRemarkStatus = loginFactory.securedPostJSON("api/Room/ChangeRoomRemarkStatus", RoomRemarkModel);
                $rootScope.dataLoadingPromise = processChangeRemarkStatus;
                processChangeRemarkStatus.success(function (data) {
                    dialogService.toast("CHANGE_REMARK_STATUS_SUCCESSFUL");
                    Init();
                })
            });
        }

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

        $scope.processAmendStay = function () {
            var selectedRoom = angular.copy($scope.room);
            if (!selectedRoom.calculateAdults) selectedRoom.calculateAdults = $scope.realAdults;
            if (!selectedRoom.calculateChildren) selectedRoom.calculateChildren = $scope.realChild;
            SharedFeaturesFactory.processAmendStay(selectedRoom);
        };

        $scope.editCheckInTime = function () {
            var selectedRoom = angular.copy($scope.room);
            SharedFeaturesFactory.processEditCheckInTime(selectedRoom);
        };

        $scope.checkOutInThePast = function () {
            var selectedRoom = angular.copy($scope.room);
            var pastCheckOutReason = angular.copy($scope.pastCheckOutReason);
            var applyPastCheckOut = angular.copy($scope.applyPastCheckOut);

            SharedFeaturesFactory.processEditPastCheckOutTime(selectedRoom, pastCheckOutReason, applyPastCheckOut);
        }

        // PAST CHECK OUT - END

        // BUSINESS MODULE - START

        $scope.simulateQuery = false;

        $scope.isBusinessChanged = false;

        $scope.$watchCollection('[selectedCompany, selectedSource, selectedMarket]', function (newValues, oldValues) {
            if (oldValues != null && !angular.equals(newValues, oldValues) && $scope.hasRRIDParam) {
                console.log("GET HERE");
                $scope.isBusinessChanged = true;
            }
        });

        $scope.saveBusiness = function () {
            console.log("BUSINESS", $scope.selectedCompany, $scope.selectedSource, $scope.selectedMarket);
            if ($scope.selectedCompany == undefined) {
                $scope.selectedCompany = null;
            }
            var businessModel = {
                RRID: $stateParams.reservationRoomId,
                Company: $scope.selectedCompany,
                Source: $scope.selectedSource,
                Market: $scope.selectedMarket,
            };
            var saveBusiness = loginFactory.securedPostJSON("api/Room/SaveBusiness", businessModel);
            $rootScope.dataLoadingPromise = saveBusiness;
            saveBusiness.success(function (data) {
                dialogService.toast("BUSINESS_SAVED_SUCCESSFUL");
                //Init();
                $state.go("reservation", {
                    reservationRoomId: $stateParams.reservationRoomId
                }, {
                    reload: true
                });
            }).error(function (err) {
                dialogService.messageBox(err.Message);
            })
        };

        var accentMap = {
            'á': 'a',
            'é': 'e',
            'í': 'i',
            'ó': 'o',
            'ú': 'u'
        };

        function accent_fold(s) {
            if (!s) {
                return '';
            }
            var ret = '';
            for (var i = 0; i < s.length; i++) {
                ret += accentMap[s.charAt(i)] || s.charAt(i);
            }
            return ret;
        };

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

        function queryMarketSearch(query) {
            var tmp = $scope.marketList.filter(function (a) {
                if (a.IsAvailable == true) {
                    return a;
                }
            });
            var results = query ? tmp.filter(createMarketFilterFor(query)) : tmp,
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
            /*console.log("TEXT", text);
            if (!text || text.trim() ===''){
                console.log("TEXT", text);
                $scope.selectedCompany = null;
            }*/
        }

        function searchCompanyTextChangeCityLedger(text) {
            $scope.searchCompanyTextCityLedger = text;
            /*console.log("TEXT", text);
            if (!text || text.trim() ===''){
                console.log("TEXT", text);
                $scope.selectedCompany = null;
            }*/
        }

        function selectedCompanyChange(item) {
            console.log("ITEM", item);
            if (item != undefined) {
                $scope.selectedCompany = item;
                var selectedSourceTemp = _.filter($scope.sourceList, function (item) {
                    return item.SourceId && item.SourceId == $scope.selectedCompany.SourceId;
                });
                if (selectedSourceTemp.length > 0 && $scope.SourceId != null)
                    $scope.selectedSource = selectedSourceTemp[0];
                console.log("SOURCE LIST", item, $scope.selectedSource, $scope.sourceList);
            } else {
                $scope.selectedCompany = null;
            }

        }

        function selectedCompanyChangeCityLedger(item) {
            console.log("ITEM", item);
            if (item != undefined) {
                $scope.selectedCompanyCityLedger = item;

            } else {
                $scope.selectedCompanyCityLedger = null;
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
            //var lowercaseQuery = angular.lowercase(query);
            var lowercaseQuery = change_alias(query);
            return function filterFn(item) {
                //return (item.MarketName.toLowerCase().indexOf(lowercaseQuery) === 0);
                return (change_alias(item.MarketName).indexOf(lowercaseQuery) >= 0 || change_alias(item.MarketCode.toLowerCase()).indexOf(lowercaseQuery) >= 0);
            };
        }

        $scope.editBusiness = function (item) {
            if (item != null) {
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
                                Init();
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
                                Init();
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
                                Init();
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
                //console.log("HERE 1", newCompany, $scope.hasRRIDParam, $stateParams.roomId);
                if (newCompany != null) {
                    if ($scope.hasRRIDParam) {
                        console.log("HERE 2");
                        var ReservationCompany = {
                            Company: newCompany,
                            RRID: $stateParams.reservationRoomId
                        };
                        console.log("ReservationCompany", ReservationCompany);
                        var addNewCompany = loginFactory.securedPostJSON("api/Room/AddNewCompanyToReservation", ReservationCompany);
                        $rootScope.dataLoadingPromise = addNewCompany;
                        addNewCompany.success(function (data) {
                            //dialogService.toast("ADD_NEW_COMPANY_SUCCESSFUL");
                            Init();
                        }).error(function (err) {
                            dialogService.messageBox("ERROR", err.Message);
                        });
                    } else {
                        $scope.selectedCompany = newCompany;
                        if (newCompany.SourceId != null && $scope.sourceList.length > 0) {
                            var sourceTemp = _.filter($scope.sourceList, function (item) {
                                return (item.SourceId == newCompany.SourceId);
                            })[0];
                            $scope.selectedSource = sourceTemp;
                        }
                    }

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
                    // console.log('Vao day',$scope.newCompany);
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
                    if ($scope.hasRRIDParam) {
                        var ReservationSource = {
                            Source: newSource,
                            RRID: $stateParams.reservationRoomId
                        };
                        newSource.Priority = $scope.sourceList.length;
                        var addNewSource = loginFactory.securedPostJSON("api/Room/AddNewSourceToReservation", ReservationSource);
                        $rootScope.dataLoadingPromise = addNewSource;
                        addNewSource.success(function (data) {
                            dialogService.toast("ADD_NEW_SOURCE_SUCCESSFUL");
                            Init();
                        }).error(function (err) {
                            dialogService.messageBox("ERROR", err.Message);
                        });
                    } else {
                        // if ($stateParams.roomId != undefined) {
                        $scope.selectedSource = newSource;
                    }
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

                    if ($scope.hasRRIDParam) {
                        var ReservationMarket = {
                            Market: newMarket,
                            RRID: $stateParams.reservationRoomId
                        };
                        newMarket.Priority = $scope.marketList.length;
                        var addNewMarket = loginFactory.securedPostJSON("api/Room/AddNewMarketToReservation", ReservationMarket);
                        $rootScope.dataLoadingPromise = addNewMarket;
                        addNewMarket.success(function (data) {
                            dialogService.toast("ADD_NEW_MARKET_SUCCESSFUL");
                            Init();
                        }).error(function (err) {
                            dialogService.messageBox("ERROR", err.Message);
                        })
                    } else {
                        // if ($stateParams.roomId != undefined) {
                        $scope.selectedMarket = newMarket;
                    }

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



        // BUSINESS MODULE - END


        $scope.viewLogReservation = function (Room) {
            walkInFactory.getLogReservation(Room);
        }

        $scope.processRoomRateTypeOperation = function (event) {
            jQuery(document).unbind('keydown');
            event.stopPropagation();

            var roomTemp = angular.copy($scope.room);
            var RoomTypeId = roomTemp.RoomTypeId;
            var planList = $scope.rateList.filter(function (val) {
                return (val.RoomTypeId == RoomTypeId);
            }, RoomTypeId);
            $mdDialog.show({
                    controller: RoomRateTypeOperationController,
                    resolve: {
                        currentRoom: function () {
                            return roomTemp;
                        },
                        planList: function () {
                            return planList;
                        }
                    },
                    templateUrl: 'views/templates/roomRateTypeOperation.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: null,
                    clickOutsideToClose: false,
                })
                .then(function (groupRateTypeModel) {
                        var keys = ["RES_NO", "ROOM", "NOTIFICATION_WHEN_CHANGE_PRICE"];
                        var languageKeys = {};
                        for (var idx in keys) {
                            languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
                        }
                        var GroupRateTypeOperationModel = {
                            ReservationId: roomTemp.ReservationId,
                            ReservationRoomId: roomTemp.ReservationRoomId,
                            NewRoomPriceId: groupRateTypeModel.NewRoomPriceId,
                            IsUpdatePrice: groupRateTypeModel.IsUpdatePrice,
                            NewPrice: roomTemp.Price,
                            languageKeys: languageKeys
                        };
                        var processGroupRateTypeOperation = loginFactory.securedPostJSON("api/Room/ProcessRoomRateTypeOperation", GroupRateTypeOperationModel);
                        $rootScope.dataLoadingPromise = processGroupRateTypeOperation;
                        processGroupRateTypeOperation.success(function (data) {
                            dialogService.toast("GROUP_RATE_TYPE_OPERATION_SUCCESSFUL");
                            $state.go($state.current, {}, {
                                reload: true
                            });
                        }).error(function (err) {
                            console.log(err);
                        });
                    }

                );
        };

        function RoomRateTypeOperationController($scope, $rootScope, $mdDialog, loginFactory, dialogService, currentRoom, planList) {
            function Init() {
                $scope.currentRoom = currentRoom;
                $scope.planList = planList;
                $scope.isApplyToSelectedRoom = true;
                console.log($scope.newRoomPrice, 'quanhihi');
            }
            Init();
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
            $scope.saveGroupRateTypeOperation = function () {
                console.log($scope.newRoomPrice, 'quanhihi');
                var groupRateTypeModel = {
                    NewRoomPriceId: $scope.newRoomPrice.RoomPriceId,
                    IsUpdatePrice: $scope.newRoomPrice.IsUpdatePrice,
                    IsApplyToSelectedRoom: $scope.isApplyToSelectedRoom
                }
                $mdDialog.hide(groupRateTypeModel);
            }
        }

        $scope.trustAsHtml = function (string) {
            return $sce.trustAsHtml(string);
        };

        // EMAIL MARKETING


        $scope.TasksEmail = {};
        $scope.emails = {};
        $scope.copyTeamplate = function (ev) {
            if ($scope.room.Travellers.Email == null || $scope.room.Travellers.Email.length < 10) {
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
                            Room: function () {
                                return $scope.room
                            },
                            emails: function () {
                                return $scope.room
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
            EmailMarketingFactory.getLogsEmail($scope.room.ReservationId, function (data) {
                $scope.LogsEmail = data;
                $scope.showEmail = true;
            }, function () {
                $scope.showEmail = false;
            });
        }


        function CopyTemplateController($scope, $mdDialog, TasksEmail, Room, emails, local) {

            $scope.TasksEmail = TasksEmail;
            $scope.emails = emails;
            $scope.SendEmail = {
                HotelEmailTaskId: 0,
                ReservationRoomId: Room.ReservationRoomId,
                ReservationRoomId: Room.ReservationRoomId
            };
            $scope.Room = Room;
            $scope.ReservationRooms = [];
            $scope.ReservationRooms.push(Room);
            $scope.Travellers = $scope.Room.ReservationTravellersList;
            $scope.init = function () {
                if (!$scope.TasksEmail.hasOwnProperty(0)) {
                    $scope.getAllTemplate();
                } else {
                    $scope.SendEmail.HotelEmailTaskId = $scope.TasksEmail[0].HotelEmailTaskId;
                    $scope.chooceItem($scope.TasksEmail[0].HotelEmailTaskId);
                }
                if (!$scope.emails.hasOwnProperty(0)) {
                    $scope.getAllConfigEmail();
                } else {}


                $scope.SendEmail.TravellerId = Room.TravellerId;
                // $scope.getAllConfigEmail();
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
                extraPlugins: 'placeholder,lineheight,tableresize',
                toolbar: [{
                        name: 'document',
                        items: ['Print', 'Source']
                    },
                    {
                        name: 'clipboard',
                        items: ['Undo', 'Redo']
                    },
                    {
                        name: 'styles',
                        items: ['Format', 'Font', 'FontSize']
                    },
                    {
                        name: 'basicstyles',
                        items: ['Bold', 'Italic', 'Underline', 'Strike', 'RemoveFormat', 'CopyFormatting', 'HorizontalRule']
                    },
                    {
                        name: 'colors',
                        items: ['TextColor', 'BGColor']
                    },
                    {
                        name: 'align',
                        items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']
                    },
                    {
                        name: 'links',
                        items: ['Link', 'Unlink', 'Anchor']
                    },
                    {
                        name: 'paragraph',
                        items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote']
                    },
                    {
                        name: 'insert',
                        items: ['Image', 'Table']
                    },
                ],
                allowedContent: true,
                entities: true,
                height: 290,
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
                    $timeout(function () {
                        $scope.chooceItem($scope.TasksEmail[0].HotelEmailTaskId);
                    }, 100);

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

            $scope.chooceItem = function (HotelEmailTaskId) {
                var HotelEmailTask = $scope.TasksEmail.find(function (item) {
                    return item.HotelEmailTaskId == HotelEmailTaskId;
                }, HotelEmailTaskId);

                if (HotelEmailTask != null) {
                    $scope.SendEmail.Body = HotelEmailTask.Body;
                    $scope.SendEmail.HotelEmailConfigId = HotelEmailTask.HotelEmailConfigId;
                    console.log(HotelEmailTask.HotelEmailConfigId, "leo nguyen lll");
                } else {
                    $scope.SendEmail.HotelEmailConfigId = 0;
                    $scope.SendEmail.Body = "";
                }
            }

            $scope.trustAsHtml = function (string) {
                return $sce.trustAsHtml(string);
            };

            $scope.init();
        }
        initHotKey = function () {
            jQuery(document).unbind('keydown');
            jQuery(document).on('keydown', function (e) {

                // Click payment
                // EVENT.run(e, "O", function () {
                //     jQuery('#btn_payment').click();
                // });

                // Click Cancel room
                // EVENT.run(e, "C", function () {
                //     jQuery('#btn_cancel').click();
                // });

                // Click RESERVE room
                EVENT.run(e, "R", function () {
                    jQuery('#btn_reserve').click();
                });

                // Click Checkin room
                EVENT.run(e, "I", function () {
                    jQuery('#btn_checkin').click();
                });

                // Click Checkout room
                EVENT.run(e, "O", function () {
                    if (jQuery('#btn_payment').length > 0) {
                        jQuery('#btn_payment').click();
                    } else {
                        jQuery('#btn_checkout').click();
                    }
                });

                // Click add share
                // EVENT.run(e, "A", function () {
                //     jQuery('#btn_add_share').click();
                // });

                // Click add share
                EVENT.run(e, "p", function () {
                    jQuery('#btn_invoice').click();
                });

                // Click add share
                EVENT.run(e, "B", function () {
                    console.log(e, "B");
                    jQuery('#btn_back_page').click();
                });


            })
        }
        initHotKey();
        $timeout(function(){Init();},100);
    }
]);