ezCloud.factory("frontOfficeFactory", ['$http', 'loginFactory', '$rootScope', '$filter', '$mdDialog', 'dialogService', 'reservationFactory', '$timeout', '$mdMedia', 'configFactory', 'smartCardFactory', 'roomListFactory','SharedFeaturesFactory', function ($http, loginFactory, $rootScope, $filter, $mdDialog, dialogService, reservationFactory, $timeout, $mdMedia, configFactory, smartCardFactory, roomListFactory,SharedFeaturesFactory) {
    var roomList = [];
    var roomTypes = {};
    var rates = [];
    var countries = [];
    var currentHotelConnectivities = true;

    configFactory.getCurrentHotelConnectivities().then(function (data) {
        currentHotelConnectivities = data;
    });
    /*loinq*/
    function checkDateBetween(to, from, check) {
        to = new Date(to);
        from = new Date(from);
        to = new Date(to.getFullYear(), to.getMonth(), to.getDate() - 1);

        if (check <= to.format('ddmmyyyy') && check >= from.format('ddmmyyyy')) {
            return true;
        }
        return false;
    }

    function UnassignRoomController($scope, $mdDialog, frontOfficeFactory, $location, $mdMedia, $filter, $timeout, $rootScope, dialogService, ListUnassign, dateUR) {
        $scope.dateUR = dateUR;
        $scope.ListUnassign = ListUnassign;
        $scope.MenuItems = [{
            name: "VIEW_DETAIL",
            icon: "ic_pageview_24px.svg",
            url: "reservation/"
        }, {
            name: "AMEND_STAY",
            icon: "ic_alarm_add_24px.svg",
        }, {
            name: "ASSIGN_ROOM",

            icon: "ic_local_hotel_24px.svg",
        }, {
            name: "CANCEL_RESERVATION",
            icon: "ic_cancel_24px.svg",
        }];
        $scope.openMenu = function ($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        };
        $scope.menuItemClick = function (item, result) {
            console.log(item);
            if (item.url) {
                $location.path(item.url + result.ReservationRoomId);
            }
            if (item.name === 'CANCEL_RESERVATION') {
                var el = document.getElementById('search');
                frontOfficeFactory.processCancel($scope.searchResult, result, el, $scope.ListUnassign);
            }
            if (item.name === 'AMEND_STAY') {
                var el = document.getElementById('search');
                frontOfficeFactory.processAmendStay(item, result, el, $scope.ListUnassign, $scope.dateUR);
            }
            if (item.name === 'ASSIGN_ROOM') {
                var el = document.getElementById('search');
                frontOfficeFactory.processAssignRoom(item, result, el, $scope.ListUnassign, 'timeline');
            }
            $mdDialog.cancel();
        };
        $scope.hide = function () {
            $mdDialog.hide();
        };
        $scope.cancel = function (item) {
            $mdDialog.cancel();
        };
    }

    var Init = function (el) {
        $timeout(function () {
            angular.element(el).triggerHandler('click');
        }, 0);
    }

    function conflictReservationProcess(err) {
        console.log("ERROR", err);
        if (err.ReservationRoomId) {
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
                    clickOutsideToClose: false,
                    /*fullscreen: useFullScreen*/
                })
                .then(function (answer) {}, function () {});

            function ShowReservationConflictController($scope, $mdDialog, conflictReservation, loginFactory, dialogService) {
                $scope.conflictReservationDialog = {};

                function Init() {
                    $scope.conflictReservationDialog = conflictReservation;
                    if ($scope.conflictReservationDialog.ArrivalDate) {
                        $scope.conflictReservationDialog.ArrivalDate = new Date($scope.conflictReservationDialog.ArrivalDate);
                    }
                    if ($scope.conflictReservationDialog.DepartureDate) {
                        $scope.conflictReservationDialog.DepartureDate = new Date($scope.conflictReservationDialog.DepartureDate);
                    }
                }
                Init();
                $scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.cancelDialog = function () {
                    $mdDialog.cancel();
                };
                /*$scope.goToReservation() = function(){

                }*/
            };
        }
    }

    var DateTime = {
        formatDateUtc: function (date) {
            var search = angular.copy(date);
            search = new Date(search);
            search.setHours(0);
            search.setMinutes(0);
            search.setSeconds(0);
            search.setMilliseconds(0);
            return search.toISOString();
        }
    }

    var frontOfficeFactory = {
        getSearchInformation: function (callback) {
            var allRoomTypes = loginFactory.securedGet("api/FrontOffice/SearchInformation");
            $rootScope.dataLoadingPromise = allRoomTypes;
            allRoomTypes.success(function (data) {
                rates = data.rates;
                if (callback) callback(data);
            }).error(function (err) {
                console.log(err);
            });
        },

        getCountries: function (callback) {
            var allCountry = loginFactory.securedGet("api/FrontOffice/Countries");
            $rootScope.dataLoadingPromise = allCountry;
            allCountry.success(function (data) {
                if (callback) callback(data)
            });
        },

        processSearch: function (search2, callback) {
            var search = angular.copy(search2);

            if (search.From != null) {
                search.From = new Date(search.From);
                search.From = DateTime.formatDateUtc(search.From);
            }

            if (search.To != null) {
                search.To = new Date(search.To);
                search.To = DateTime.formatDateUtc(search.To);
            }

            var processSearch = loginFactory.securedPostJSON("api/FrontOffice/SearchProcess", search);
            $rootScope.dataLoadingPromise = processSearch;
            processSearch.success(function (data) {
                if (search.SearchType === "ARRIVAL_LIST") {
                    searchArrivalListDataProcess(data);
                }
                if (search.SearchType === "DEPARTURE_LIST") {
                    searchDepartureListDataProcess(data)
                }
                if (search.SearchType === "CHECKOUT_LIST") {
                    searchCheckoutListDataProcess(data);
                }
                if (callback) callback(data)
            }).error(function (err) {
                console.log(err);
            });
        },

        processSearchReservation: function (search2, callback) {

            var search = angular.copy(search2);
            search.ArrivalFrom = new Date(search.ArrivalFrom);
            search.ArrivalFrom = DateTime.formatDateUtc(search.ArrivalFrom);

            search.ArrivalTo = new Date(search.ArrivalTo);
            search.ArrivalTo = DateTime.formatDateUtc(search.ArrivalTo);

            if (search.ReservationFrom != null) {
                search.ReservationFrom = new Date(search.ReservationFrom);
                search.ReservationFrom = DateTime.formatDateUtc(search.ReservationFrom);
            }

            if (search.ReservationTo != null) {
                search.ReservationTo = new Date(search.ReservationTo);
                search.ReservationTo = DateTime.formatDateUtc(search.ReservationTo);
            }


            // api search old
            // var processSearchReservation = loginFactory.securedPostJSON("api/FrontOffice/SearchReservationProcess", search);
            // new api search by time UTC 0
            var processSearchReservation = loginFactory.securedPostJSON("api/FrontOffice/SearchReservationProcessUTC", search);
            $rootScope.dataLoadingPromise = processSearchReservation;
            processSearchReservation.success(function (data) {
                searchReservationListDataProcess(data);
                if (callback) callback(data)
            }).error(function (err) {
                console.log("ERRORRRRR", err);
            });
        },

        processSearchGuest: function (search, callback) {
            var processSearchGuest = loginFactory.securedPostJSON("api/FrontOffice/SearchGuestListProcess", search);
            $rootScope.dataLoadingPromise = processSearchGuest;
            processSearchGuest.success(function (data) {
                var dataTemp = data.guestList;
                var totalRecord = data.totalRecord;
                var reservationTravellers = [];
                for (var index in dataTemp) {
                    var rtTemp = dataTemp[index];
                    var traveller = {};
                    traveller.Traveller = rtTemp[0].Travellers;
                    traveller.Traveller.birthdayValid = true;
                    traveller.Traveller.GenderName = '';
                    traveller.ReservationRooms = [];
                    for (var index2 in rtTemp) {
                        traveller.ReservationRooms.push(rtTemp[index2]);
                    }
                    console.log('Year:', new Date(traveller.Traveller.Birthday).getFullYear());
                    if (new Date(traveller.Traveller.Birthday) === null || new Date(traveller.Traveller.Birthday).getFullYear() === 1753) {
                        traveller.Traveller.birthdayValid = false
                    }
                    if (traveller.Traveller.Gender === 0) {
                        traveller.Traveller.GenderName = 'MALE'
                    } else if (traveller.Traveller.Gender === 1) {
                        traveller.Traveller.GenderName = 'FEMALE'
                    } else {
                        traveller.Traveller.GenderName = 'OTHER'
                    }
                    reservationTravellers.push(traveller);
                }

                //delete data;
                data = {
                    guestList: reservationTravellers,
                    totalRecord: totalRecord
                }
                console.log("data", data);
                if (callback) {
                    callback(data);
                }
            }).error(function (err) {

            });
        },
        processSearchGuestDatabase: function (search, callback) {
            var processSearchGuest = loginFactory.securedPostJSON("api/FrontOffice/SearchGuestDatabaseProcess", search);
            $rootScope.dataLoadingPromise = processSearchGuest;
            processSearchGuest.success(function (data) {
                console.log('loinq', data);
                var dataTemp = data.lstTravellerNew;
                var TotalRecord = data.TotalRecord;
                var reservationTravellers = [];
                for (var index in dataTemp) {
                    var rtTemp = dataTemp[index];
                    var traveller = rtTemp._guest;
                    if (traveller != null) {
                        traveller.birthdayValid = true;
                        traveller.GenderName = '';

                        console.log('Year:', new Date(traveller.Birthday).getFullYear());
                        if (traveller.Birthday == null || new Date(traveller.Birthday) === null || new Date(traveller.Birthday).getFullYear() === 1753) {
                            traveller.birthdayValid = false
                        }
                        if (traveller.Gender === 0) {
                            traveller.GenderName = 'MALE'
                        } else if (traveller.Gender === 1) {
                            traveller.GenderName = 'FEMALE'
                        } else {
                            traveller.GenderName = 'OTHER'
                        }
                        if (rtTemp.amount == null) {
                            rtTemp.amount = 0;
                        }
                        traveller.amount = $filter('currency')(rtTemp.amount).split(' ')[1];
                        traveller.q_checkin = rtTemp.q_checkin;
                        reservationTravellers.push(traveller);
                    }
                }

                data = {
                    lstTravellerNew: reservationTravellers,
                    TotalRecord: TotalRecord
                };
                console.log("data", data);
                if (callback) {
                    callback(data);
                }
            }).error(function (err) {

            });
        },

        processCancel: function (searchResult, result, el, listUR) {
            console.log("CANCEL FRONT OFFICE", result);

            if (result && result.RoomExtraServiceItemsList && result.RoomExtraServiceItemsList.length > 0) {
                var extraServiceItemTemp = _.filter(result.RoomExtraServiceItemsList, function (item) {
                    return item.IsDeleted === false;
                });
                console.log("ESI TEMP", extraServiceItemTemp);
                if (extraServiceItemTemp && extraServiceItemTemp.length > 0) {
                    dialogService.messageBox("WARNING", "YOU_HAVE_TO_PROCESS_ALL_EXTRA_SERVICES_IN_THIS_ROOM_BEFORE_CANCEL");
                    return;
                }
            }

            if (result && result.RoomExtraServicesList && result.RoomExtraServicesList.length > 0) {
                var extraServiceTemp = _.filter(result.RoomExtraServicesList, function (item) {
                    return item.RoomExtraServiceName == "EXTRA_SERVICES" && item.IsDeleted === false;
                });
                console.log("ES TEMP", extraServiceTemp);
                if (extraServiceTemp && extraServiceTemp.length > 0) {
                    dialogService.messageBox("WARNING", "YOU_HAVE_TO_PROCESS_ALL_EXTRA_SERVICES_IN_THIS_ROOM_BEFORE_CANCEL");
                    return;
                }
            }
            var keys = ["CANCEL_FEE", "PAYMENT_FOR_CANCELLATION_OF_RESERVATION", "REFUND_ALL_DEPOSITS_OF_RESERVATION", "RES_NO", "ROOM", "NOTIFICATION_NEWPAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER", "THIS_ROOM_EXTRA_SERVICE_WAS_DELETED_AUTOMATICALLY_BY_THE_CANCEL_PROCESS", "NOTIFICATION_CANCELED_NAN_CONTENT", "NOTIFICATION_CANCELED_CONTENT"];
            var languageKeys = {};
            for (var idx in keys) {
                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
            }
            console.log('result', result);
            var selectedRoomTemp = angular.copy(result);
            if (result.Rooms === null) {
                selectedRoomTemp.RoomName = '';
            } else {
                selectedRoomTemp.RoomName = result.Rooms.RoomName;
            }

            selectedRoomTemp.languageKeys = languageKeys;
            console.log('selectedRoomTemp', selectedRoomTemp);
            var useFullScreen = $mdMedia('xs');
            $mdDialog.show({
                controller: CancelDialogController,
                resolve: {
                    ReservationRoomId: function () {
                        return selectedRoomTemp.ReservationRoomId;
                    },
                    ReservationNumber: function () {
                        return selectedRoomTemp.Reservations.ReservationNumber;
                    },
                    selectedRoom: function () {
                        return selectedRoomTemp;
                    }
                },
                templateUrl: 'views/templates/cancelDialog.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: event,
                fullscreen: useFullScreen
            }).then(function (cancelModel) {
                console.log("CANCEL MODEL", cancelModel);
                var processCancel = loginFactory.securedPostJSON("api/Room/ProcessCancel", cancelModel);
                $rootScope.dataLoadingPromise = processCancel;
                processCancel.success(function (data) {
                    dialogService.toast("CANCEL_BOOKING_SUCCESSFUL");
                    $timeout(function () {
                        angular.element(el).triggerHandler('click');
                    }, 0);

                    if (listUR != null && listUR != undefined) {
                        angular.forEach(listUR, function (arr, index) {
                            if (result.ReservationRoomId == arr.ReservationRoomId) {
                                listUR.splice(index, 1);
                            }
                        });
                        if (listUR.length > 0) {
                            var useFullScreen = ($mdMedia('xs') || $mdMedia('sm'));
                            $mdDialog.show({
                                controller: ['$scope', '$mdDialog', 'frontOfficeFactory', '$location', '$mdMedia', '$filter', '$timeout', '$rootScope', 'dialogService', 'ListUnassign', 'dateUR', UnassignRoomController],
                                templateUrl: 'views/templates/unassignRoomList.tmpl.html',
                                resolve: {
                                    ListUnassign: function () {
                                        return listUR;
                                    },
                                    dateUR: function () {
                                        return new Date();
                                    }
                                }, // targetEvent: ev,
                                parent: angular.element(document.body),
                                fullscreen: useFullScreen,
                                clickOutsideToClose: false
                            }).then(function () {

                            }, function () {
                                // $rootScope.pageInit = true;
                            });
                        } else {

                            // $rootScope.pageInit = true;
                        }
                        $rootScope.$emit("UpdateTimeLine", {
                            "action": "CANCEL_UNASSIGN",
                            "data": cancelModel
                        });
                    } else {
                        $rootScope.$emit("UpdateTimeLine", {
                            "action": "CANCEL_UNASSIGN",
                            "data": cancelModel
                        });
                        $mdDialog.cancel();
                    }

                }).error(function (err) {
                    if (err.Message) {
                        dialogService.messageBox("ERROR", err.Message)
                    } else {
                        conflictReservationProcess(err);
                    }
                })
            }, function () {
                if (listUR != null && listUR != undefined) {
                    //loinq
                    var useFullScreen = ($mdMedia('xs') || $mdMedia('sm'));
                    $mdDialog.show({
                        controller: ['$scope', '$mdDialog', 'frontOfficeFactory', '$location', '$mdMedia', '$filter', '$timeout', '$rootScope', 'dialogService', 'ListUnassign', 'dateUR', UnassignRoomController],
                        templateUrl: 'views/templates/unassignRoomList.tmpl.html',
                        resolve: {
                            ListUnassign: function () {
                                return listUR;
                            },
                            dateUR: function () {
                                return new Date();
                            }
                        }, // targetEvent: ev,
                        parent: angular.element(document.body),
                        fullscreen: useFullScreen,
                        clickOutsideToClose: false
                    }).then(function () {

                    }, function () {
                        $rootScope.pageInit = true;
                    });
                };
            });
        },

        processClean: function (result, el) {
            dialogService.confirm("CLEAN", "DO_YOU_WANT_TO_SET_THIS_ROOM_CLEANED" + "?").then(function () {
                var promise = loginFactory.securedPostJSON("api/Room/ChangeRoomStatus?roomId=" + result.Rooms.RoomId + "&status=" + "CLEAN", "");
                $rootScope.dataLoadingPromise = promise;
                promise.success(function (data) {
                    $timeout(function () {
                        angular.element(el).triggerHandler('click');
                    }, 0);
                }).error(function (data) {

                });
            });
        },
        processDirty: function (result, el) {
            dialogService.confirm("CLEAN", "DO_YOU_WANT_TO_SET_THIS_ROOM_DIRTY" + "?").then(function () {
                var promise = loginFactory.securedPostJSON("api/HouseKeeping/ProcessHouseStatusForOnlyRoom?roomId=" + result.Rooms.RoomId, "");
                $rootScope.dataLoadingPromise = promise;
                promise.success(function (data) {
                    $timeout(function () {
                        angular.element(el).triggerHandler('click');
                    }, 0);
                }).error(function (data) {

                });
            });
        },
        preProcessNoshow: function (room, reservationRoomId, callback) {
            // do checkin for new reservation
            if (reservationRoomId == null || $rootScope.HotelSettings.IsOffNoshow) {
                var response = {
                    roomCharges: []
                };
                if (typeof (callback) === 'function') callback(response);
                return 0;
            }
            var saveExtraServiceNoItem = loginFactory.securedGet("api/Reservation/GetRoomChargesList", "reservationRoomId=" + reservationRoomId, null);
            saveExtraServiceNoItem.success(function (data) {
                if (typeof (callback) === 'function') callback(data);
            }, room, reservationRoomId, callback);

        },
        processNoshow: function (room, roomCharges, reservationRoomId, callback) {
            if ($rootScope.HotelSettings.IsOffNoshow) {
                if (typeof (callback) === 'function') {
                    callback();
                }
                return 0;
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
            // AUTO POST NOSHOW
            // MUST NOSHOW 
            if (((room.BookingStatus == "BOOKED" && room.ArrivalDate <= new Date()) || room.BookingStatus == "NOSHOW")) {
                // MUST USE ONLY FULL DAY PRICE
                if (roomCharges != null && roomCharges.length > 1) {
                    var roomChargesTemp = angular.copy(roomCharges);
                    for (var index in roomChargesTemp) {
                        var charge = roomChargesTemp[index];
                        if (charge.StartDate) {
                            charge.StartDate = new Date(charge.StartDate);
                        }
                    }
                    roomChargesTemp = _.filter(roomChargesTemp, function (item) {
                        return dates.compare(dates.convert(item.StartDate.toDateString()), dates.convert(new Date().toDateString())) < 0;
                    });
                    if (roomChargesTemp != null && roomChargesTemp.length > 0) {
                        roomChargesTemp = roomChargesTemp.sort(function (a, b) {
                            return a.StartDate - b.StartDate;
                        });
                        if (roomChargesTemp.length == 1) {
                            var description = (new Date(roomChargesTemp[0].EndDate).getDate()) + "/" + (new Date(roomChargesTemp[0].EndDate).getMonth() + 1);
                        } else {
                            var tmp = [];
                            roomChargesTemp.forEach(function (a) {
                                tmp.push(new Date(a.EndDate).getDate() + "/" + (new Date(a.EndDate).getMonth() + 1));
                            }, tmp)
                            var description = tmp.join(",");
                        }

                        var postItems = {
                            ReservationRoomId: reservationRoomId,
                            RoomExtraServiceName: "EXTRA_SERVICES",
                            RoomExtraServiceDescription: $filter("translate")("NOSHOW_EXTRA_FEE") + " " + description,
                            Amount: _.reduce(roomChargesTemp, function (memoizer, value) {
                                return memoizer + value.Amount;
                            }, 0),
                            Quantity: 1,
                        };
                        var saveExtraServiceNoItem = loginFactory.securedPostJSON("api/Room/CreateExtraServiceNoItem", postItems);

                        if (!$rootScope.HotelSettings.IsOffNoshow) {
                            $mdDialog.show({
                                controller: NoShowExtraFeeController,
                                resolve: {
                                    roomChargesTemp: function () {
                                        return roomChargesTemp;
                                    },
                                },
                                templateUrl: 'views/templates/noshowExtraFee.tmpl.html',
                                parent: angular.element(document.body),
                                targetEvent: event,
                            }).then(function () {
                                saveExtraServiceNoItem.success(function () {
                                    if (typeof (callback) === 'function') {
                                        callback();
                                    }
                                });
                            }, function () {
                                if (typeof (callback) === 'function') {
                                    callback();
                                }
                            });
                        } else {
                            saveExtraServiceNoItem.success(function () {
                                if (typeof (callback) === 'function') {
                                    callback();
                                }
                            }, function () {
                                if (typeof (callback) === 'function') {
                                    callback();
                                }
                            });
                        }
                        // $mdDialog.show({
                        //     controller: NoShowExtraFeeController,
                        //     resolve: {
                        //         roomChargesTemp: function() {
                        //             return roomChargesTemp;
                        //         },
                        //     },
                        //     templateUrl: 'views/templates/noshowExtraFee.tmpl.html',
                        //     parent: angular.element(document.body),
                        //     targetEvent: event,
                        // }).then(function() { 
                        //     saveExtraServiceNoItem.success(function(){
                        //         if( typeof(callback) === 'function' ){callback();}
                        //     });
                        // }, function() {
                        //     if( typeof(callback) === 'function' ){callback();}
                        // });

                        function NoShowExtraFeeController($scope, $mdDialog, roomChargesTemp) {
                            function Init() {
                                $scope.roomCharges = roomChargesTemp;
                            }
                            Init();
                            $scope.hide = function () {
                                $mdDialog.hide();
                            };
                            $scope.cancel = function () {
                                $mdDialog.cancel();
                            };

                            $scope.save = function () {
                                $mdDialog.hide();
                            }
                        }
                    } else {
                        if (typeof (callback) === 'function') {
                            callback();
                        }
                    }
                } else {
                    if (typeof (callback) === 'function') {
                        callback();
                    }
                }
            } else {
                if (typeof (callback) === 'function') {
                    callback();
                }
            }
        },

        processAmendStay: function (item, result, el, listUR, dateUR) {
            var itemTemp = angular.copy(item);
            var resultTemp = angular.copy(result);
            var useFullScreen = $mdMedia('xs');
            $mdDialog.show({
                controller: AmendStayDialogController,
                resolve: {
                    item: function () {
                        return itemTemp;
                    },
                    currentRoom: function () {
                        return resultTemp;
                    }
                },
                templateUrl: 'views/templates/amendStay.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: event,
                fullscreen: useFullScreen
            }).then(function (request) {
                var saveAmendStay = loginFactory.securedPostJSON("api/Room/SaveAmendStay", request.AmendStayModel);
                $rootScope.dataLoadingPromise = saveAmendStay;
                saveAmendStay.success(function (data) {
                    dialogService.toast("AMEND_STAY_SAVED_SUCCESSFUL");
                    $timeout(function () {
                        angular.element(el).triggerHandler('click');
                    }, 0);
                    $rootScope.$emit("UpdateTimeLine", {
                        "action": "AMEND_UNSSIGN",
                        "data": request.currentRoom,
                        "before": result
                    });
                    /*if (listUR != null && listUR != undefined) {
                        $rootScope.pageInit = true;
                    } else {
                        $rootScope.pageInit = true;
                    }*/

                }).error(function (err) {
                    console.log("FRONT CHECK IN", err);
                    if (err.Message) {
                        dialogService.messageBox("ERROR", err.Message)
                    } else {
                        conflictReservationProcess(err);
                    };
                });
            }, function () {
                if (listUR != null && listUR != undefined) {
                    //loinq
                    var useFullScreen = ($mdMedia('xs') || $mdMedia('sm'));
                    $mdDialog.show({
                        controller: ['$scope', '$mdDialog', 'frontOfficeFactory', '$location', '$mdMedia', '$filter', '$timeout', '$rootScope', 'dialogService', 'ListUnassign', 'dateUR', UnassignRoomController],
                        templateUrl: 'views/templates/unassignRoomList.tmpl.html',
                        resolve: {
                            ListUnassign: function () {
                                return listUR;
                            },
                            dateUR: function () {
                                return dateUR;
                            }
                        }, // targetEvent: ev,
                        parent: angular.element(document.body),
                        fullscreen: useFullScreen,
                        clickOutsideToClose: false
                    }).then(function () {

                    }, function () {
                        // $rootScope.pageInit = true;
                    });
                };
            });

            function AmendStayDialogController($scope, $mdDialog, item, currentRoom) {
                console.log("CURRENT ROOM", currentRoom);
                $scope.departureTime;
                $scope.warning;
                $scope.warningDate;
                $scope.warningDepartureDate;
                $scope.minDate = new Date();

                function Init() {
                    $scope.DateTimePickerOption = {
                        format: 'dd/MM/yyyy HH:mm'
                    };
                    $scope.currentRoom = currentRoom;
                    $scope.currentRoom.ArrivalDate = new Date($scope.currentRoom.ArrivalDate);
                    $scope.currentRoom.DepartureDate = new Date($scope.currentRoom.DepartureDate);
                    $scope.str = $scope.currentRoom.ArrivalDate.format('dd/mm/yyyy HH:MM');
                    $scope.str2 = $scope.currentRoom.DepartureDate.format('dd/mm/yyyy HH:MM');
                    $scope.warning = false;
                    $scope.warningDate = false;
                    $scope.warningDepartureDate = false;
                }
                Init();
                $scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
                $scope.minDepartureDate = $scope.currentRoom.ArrivalDate;

                $scope.$watchCollection('currentRoom', function (newValues, oldValues) {
                    if (newValues !== null && oldValues !== null && !angular.equals(newValues, oldValues)) {
                        $scope.minDepartureDate = newValues.ArrivalDate;
                    }
                });

                $scope.saveAmendStay = function () {
                    var validAmendment = true;
                    if ($scope.currentRoom.reservationRoom) {
                        $scope.currentRoom.ArrivalDate = $scope.currentRoom.reservationRoom.ArrivalDate;
                        $scope.currentRoom.DepartureDate = currentRoom.reservationRoom.DepartureDate;
                    }
                    if ($scope.currentRoom.ArrivalDate <= $scope.currentRoom.DepartureDate) {
                        $scope.warningDate = false;
                        $scope.currentRoom.ArrivalDate = new Date($scope.currentRoom.ArrivalDate);
                        $scope.currentRoom.DepartureDate = new Date($scope.currentRoom.DepartureDate);
                        if ($scope.currentRoom.DepartureDate < new Date()) {
                            $scope.warningDepartureDate = true;
                            return;
                        } else if ($scope.currentRoom.ArrivalDate <= new Date() && ($scope.currentRoom.BookingStatus == "BOOKED" || $scope.currentRoom.BookingStatus == "NOSHOW")) {
                            $scope.warningArrivalDate = true;
                            return;
                        } else {
                            var keys = ["NOTIFICATION_WHEN_CHANGE_DATE"];
                            var languageKeys = {};
                            for (var idx in keys) {
                                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
                            }
                            var arrivalDateTemp = new Date($scope.currentRoom.ArrivalDate);
                            var departureDateTemp = new Date($scope.currentRoom.DepartureDate);
                            // currentRoom.reservationRoom.ArrivalDate
                            var AmendStayModel = {
                                reservationRoomId: $scope.currentRoom.ReservationRoomId,
                                departureDate: $scope.currentRoom.DepartureDate,
                                arrivalDate: $scope.currentRoom.ArrivalDate,
                                adults: $scope.currentRoom.Adults,
                                child: $scope.currentRoom.Child,
                                formatArrivalDate: new Date($scope.currentRoom.ArrivalDate).format('dd-mm-yyyy'),
                                formatDepartureDate: new Date($scope.currentRoom.DepartureDate).format('dd-mm-yyyy'),
                                languageKeys: languageKeys
                            }
                            if ($scope.currentRoom.roomBookingList && $scope.currentRoom.roomBookingList.NextReservation && $scope.currentRoom.roomBookingList.NextReservation.length > 0) {
                                for (var index in $scope.currentRoom.roomBookingList.NextReservation) {
                                    var bookingTemp = $scope.currentRoom.roomBookingList.NextReservation[index];
                                    if (bookingTemp.ArrivalDate) {
                                        bookingTemp.ArrivalDate = new Date(bookingTemp.ArrivalDate);
                                    }
                                    if (bookingTemp.DepartureDate) {
                                        bookingTemp.DepartureDate = new Date(bookingTemp.DepartureDate);
                                    }
                                    if (bookingTemp.ArrivalDate.getTime() <= departureDateTemp.getTime() && departureDateTemp.getTime() <= bookingTemp.DepartureDate.getTime() ||
                                        departureDateTemp.getTime() >= bookingTemp.DepartureDate.getTime()
                                    ) {
                                        validAmendment = false;
                                        break;
                                    }
                                }
                            }
                            if ($scope.currentRoom.roomBookingList && $scope.currentRoom.roomBookingList.PreviousReservation && $scope.currentRoom.roomBookingList.PreviousReservation.length > 0) {
                                for (var index in $scope.currentRoom.roomBookingList.PreviousReservation) {
                                    var bookingTemp = $scope.currentRoom.roomBookingList.PreviousReservation[index];
                                    if (bookingTemp.ArrivalDate) {
                                        bookingTemp.ArrivalDate = new Date(bookingTemp.ArrivalDate);
                                    }
                                    if (bookingTemp.DepartureDate) {
                                        bookingTemp.DepartureDate = new Date(bookingTemp.DepartureDate);
                                    }
                                    if (bookingTemp.ArrivalDate.getTime() <= arrivalDateTemp.getTime() && arrivalDateTemp.getTime() <= bookingTemp.DepartureDate.getTime() || arrivalDateTemp.getTime() <= bookingTemp.ArrivalDate.getTime()) {
                                        validAmendment = false;
                                        break;
                                    }
                                }

                            }
                            if (validAmendment === true) {
                                console.log("FRONT AMEND 2", $scope.currentRoom);
                                var data = {};
                                data.AmendStayModel = AmendStayModel;
                                data.currentRoom = currentRoom;
                                data.now = $scope.currentRoom;
                                $mdDialog.hide(data);
                            } else {
                                $scope.warning = true;
                            }
                        }

                    } else {
                        $scope.warningDate = true;
                    }
                }
            }
        },

        processAmendStayFO: function (item, result, el, listUR, dateUR) {
            var itemTemp = angular.copy(item);
            var resultTemp = angular.copy(result);
            var useFullScreen = $mdMedia('xs');
            $mdDialog.show({
                controller: AmendStayDialogController,
                resolve: {
                    item: function () {
                        return itemTemp;
                    },
                    currentRoom: function () {
                        return resultTemp;
                    }
                },
                templateUrl: 'views/templates/amendStay.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: event,
                fullscreen: useFullScreen
            }).then(function (request) {
                var saveAmendStay = loginFactory.securedPostJSON("api/Room/SaveAmendStay", request.AmendStayModel);
                $rootScope.dataLoadingPromise = saveAmendStay;
                saveAmendStay.success(function (data) {
                    dialogService.toast("AMEND_STAY_SAVED_SUCCESSFUL");
                    $timeout(function () {
                        angular.element(el).triggerHandler('click');
                    }, 0);
                    // $rootScope.$emit("UpdateTimeLine", {
                    //     "action": "AMEND_UNSSIGN",
                    //     "data": request.currentRoom,
                    //     "before": result
                    // });
                    /*if (listUR != null && listUR != undefined) {
                        $rootScope.pageInit = true;
                    } else {
                        $rootScope.pageInit = true;
                    }*/

                }).error(function (err) {
                    console.log("FRONT CHECK IN", err);
                    if (err.Message) {
                        dialogService.messageBox("ERROR", err.Message)
                    } else {
                        conflictReservationProcess(err);
                    };
                });
            }, function () {
                if (listUR != null && listUR != undefined) {
                    //loinq
                    var useFullScreen = ($mdMedia('xs') || $mdMedia('sm'));
                    $mdDialog.show({
                        controller: ['$scope', '$mdDialog', 'frontOfficeFactory', '$location', '$mdMedia', '$filter', '$timeout', '$rootScope', 'dialogService', 'ListUnassign', 'dateUR', UnassignRoomController],
                        templateUrl: 'views/templates/unassignRoomList.tmpl.html',
                        resolve: {
                            ListUnassign: function () {
                                return listUR;
                            },
                            dateUR: function () {
                                return dateUR;
                            }
                        }, // targetEvent: ev,
                        parent: angular.element(document.body),
                        fullscreen: useFullScreen,
                        clickOutsideToClose: false
                    }).then(function () {

                    }, function () {
                        // $rootScope.pageInit = true;
                    });
                };
            });
        },

        processCheckIn: function (item, result, el) {
            console.log("ITEM", result);
            if (result.Rooms != undefined) {
                if (result.Rooms.HouseStatus === "DIRTY") {
                    dialogService.confirm("ROOM_DIRTY", "DO_YOU_WANT_TO_CONTINUE?").then(function () {
                        templateCheckIn(item, result, el);
                    });
                } else {
                    templateCheckIn(item, result, el);
                }
            } else {
                templateCheckIn(item, result, el);
            }
        },

        processRoomMove: function (item, result, el) {
            var itemTemp = angular.copy(item);
            var resultTemp = angular.copy(result);
            var useFullScreen = $mdMedia('xs');
            $mdDialog.show({
                controller: RoomMoveDialogController,
                resolve: {
                    item: function () {
                        return itemTemp;
                    },
                    currentRoom: function () {
                        return resultTemp;
                    }
                },
                templateUrl: 'views/templates/roomMove.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: event,
                fullscreen: useFullScreen
            }).then(function (RoomMoveModel) {

                console.log("ROOM MOVE MODEL", RoomMoveModel);
                var keys = ["ROOM_MONTHLY", "ROOM_WEEKLY", "ROOM_FULL_DAY", "ROOM_DAY_NIGHT", "ROOM_HOURLY", "MINIBAR", "LAUNDRY", "EXTRA_ROOM_CHARGE", "COMPENSATION", "EXTRA_SERVICES", "FULL_DAY_EARLY_CHECKIN", "FULL_DAY_LATE_CHECKOUT", "DAY_NIGHT_EARLY_CHECKIN", "DAY_NIGHT_LATE_CHECKOUT", "EXTRA_ADULTS", "EXTRA_CHILDREN", "ROOM_MOVE_EXTRA_SERVICES", "NOTIFICATION_CHANGE_ROOM"];
                var languageKeys = {};
                for (var idx in keys) {
                    languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
                }
                RoomMoveModel.languageKeys = languageKeys;
                if (RoomMoveModel.IsDirty === true && (resultTemp.BookingStatus !== "BOOKED" && resultTemp.BookingStatus !== "NOSHOW")) {
                    dialogService.confirm("ROOM_DIRTY", "DO_YOU_WANT_TO_CONTINUE" + "?").then(function () {
                        var processRoomMove = loginFactory.securedPostJSON("api/Room/ProcessRoomMove", RoomMoveModel);
                        $rootScope.dataLoadingPromise = processRoomMove;
                        processRoomMove.success(function (data) {
                            dialogService.toast("ROOM_MOVED_SUCCESSFUL");
                            $timeout(function () {
                                angular.element(el).triggerHandler('click');
                            }, 0);
                            // $rootScope.$emit("UpdateTimeLine", { "action": "ROOM_MOVE", "data": RoomMoveModel });
                            // $rootScope.pageInit = true;
                        }).error(function (err) {
                            if (err.Message) {
                                dialogService.messageBox("ERROR", err.Message)
                            } else {
                                conflictReservationProcess(err);
                            };
                        });
                    });
                } else {
                    var processRoomMove = loginFactory.securedPostJSON("api/Room/ProcessRoomMove", RoomMoveModel);
                    $rootScope.dataLoadingPromise = processRoomMove;
                    processRoomMove.success(function (data) {
                        dialogService.toast("ROOM_MOVED_SUCCESSFUL");
                        $timeout(function () {
                            angular.element(el).triggerHandler('click');
                        }, 0);
                        // $rootScope.pageInit = true;
                        // $rootScope.$emit("UpdateTimeLine", { "action": "ROOM_MOVE", "data": RoomMoveModel });
                    }).error(function (err) {
                        if (err.Message) {
                            dialogService.messageBox("ERROR", err.Message)
                        } else {
                            //conflictReservationProcess(err);
                            SharedFeaturesFactory.processConflictReservation(err, result, "ROOMMOVE");
                        };
                    });
                }



            }, function () {

            });

            function RoomMoveDialogController($scope, $mdDialog, item, currentRoom, roomListFactory) {
                console.log("CURRENT ROOM", currentRoom);
                var newRoom = {
                    RoomTypeId: currentRoom.RoomTypes.RoomTypeId,
                    RoomId: 0,
                    RoomPriceId: 0,
                    RoomMoveFee: 0
                };
                $scope.isSelected = false;
                $scope.priceRateList = [];
                var oldRoomId = currentRoom.RoomId;

                function Init() {
                    $scope.DateTimePickerOption = {
                        format: 'dd/MM/yyyy HH:mm'
                    };
                    $scope.decimal = $rootScope.decimals;
                    $scope.warningMissingRoom = false;
                    $scope.currentRoom = currentRoom;
                    $scope.str = new Date($scope.currentRoom.ArrivalDate).format('dd/mm/yyyy HH:MM');
                    $scope.str2 = new Date($scope.currentRoom.DepartureDate).format('dd/mm/yyyy HH:MM');
                    $scope.newRoom = newRoom;
                    $scope.isSelected = false;
                    roomListFactory.getPriceRateList(function (data) {
                        $scope.planList = data;
                        for (var index in $scope.planList) {
                            if ($scope.currentRoom.RoomPriceId) {
                                if ($scope.currentRoom.RoomPriceId.toString() === $scope.planList[index].RoomPriceId.toString()) {
                                    $scope.currentRoom.RoomPriceName = $scope.planList[index].RoomPriceName;
                                    break;
                                }
                            } else {}
                        }

                        $scope.priceRateList = $scope.planList.sort(function (a, b) {
                            return parseInt(a.Priority) - parseInt(b.Priority);
                        });
                    });

                    roomListFactory.getRoomList(new Date(), function (data) {
                        $scope.roomList = data;
                        /*var roomTypes = [];
                        for (var idx in roomListFactory.getRoomTypes()) {
                        	roomTypes.push(roomListFactory.getRoomTypes()[idx]);
                        }*/
                        $scope.roomTypes = data.roomTypes;
                        $scope.availableRoom = [];
                        var availableRoom = [];
                        $scope.availableRoom = reservationFactory.getAvailableRoom($scope.roomList, $scope.currentRoom.ArrivalDate, $scope.currentRoom.DepartureDate, availableRoom);
                    });

                }
                Init();

                function addDays(date, days) {
                    var result = new Date(date);
                    result.setDate(result.getDate() + days);
                    return result;
                }

                $scope.$watchCollection('newRoom', function (newValues, oldValues) {

                    if (_.size(newValues) !== 0 && _.size(oldValues) !== 0 && !angular.equals(newValues, oldValues)) {
                        $scope.priceRateList = _.filter($scope.planList, function (item) {
                            return (item.IsActive && item.RoomTypeId.toString() === newValues.RoomTypeId.toString());
                        }).sort(function (a, b) {
                            return parseInt(a.Priority) - parseInt(b.Priority);
                        });
                    }

                });

                $scope.$watchCollection('currentRoom', function (newValues, oldValues) {
                    console.log("OLD VALUE", oldValues);
                    console.log("NEW VALUE", newValues);
                    if (_.size(newValues) !== 0 && _.size(oldValues) !== 0 && !angular.equals(newValues, oldValues) && newValues.ArrivalDate && oldValues.ArrivalDate) {
                        if (newValues.ArrivalDate !== oldValues.ArrivalDate && newValues.ArrivalDate >= oldValues.DepartureDate) {
                            console.log("HERE");
                            newValues.DepartureDate = addDays(newValues.ArrivalDate, 1);
                        }

                        //AVAILABLE ROOM
                        var availableRoom = [];
                        $scope.availableRoom = reservationFactory.getAvailableRoomForRoomMove($scope.roomList, newValues.ArrivalDate, newValues.DepartureDate, availableRoom);


                    }

                });
                $scope.filterValue = function ($event) {
                    if (isNaN(String.fromCharCode($event.keyCode))) {
                        $event.preventDefault();
                    }
                };
                $scope.$watchCollection('newRoom.RoomTypeId', function (newValues, oldValues) {
                    if (newValues.toString() !== oldValues.toString()) {
                        $scope.newRoom.RoomId = 0;
                    }
                });
                $scope.newRoomPriceRateList = [];
                $scope.showOverridePriceRate = true;


                $scope.$watchCollection('newRoom.RoomPriceId', function (newValues, oldValues) {
                    if (newValues && newValues !== undefined) {
                        $scope.currentRatePrice = _.filter($scope.priceRateList, function (item) {
                            return (item.RoomPriceId.toString() === newValues.toString());
                        })[0].FullDayPrice;

                    }
                    console.log($scope.currentRatePrice);
                });

                $scope.update = function () {}
                $scope.warning = false;
                $scope.processRoomMove = function () {
                    console.log("NEW ROOM", $scope.newRoom, $scope.usePriceRateType);

                    if (!$scope.newRoom.RoomId || parseInt($scope.newRoom.RoomId) === 0 || $scope.newRoom.RoomId.toString() === currentRoom.RoomId.toString()) {
                        $scope.warningMissingRoom = true;
                        $scope.warningMissingReason = false;
                        $scope.warningDepartureDate = false;
                        $scope.warningDate = false;
                        return;
                    }

                    if ((currentRoom.BookingStatus == 'CHECKIN' || currentRoom.BookingStatus == 'OVERDUE') && (!$scope.newRoom.Description || $scope.newRoom.Description.trim() == '')) {
                        $scope.warningMissingRoom = false;
                        $scope.warningMissingReason = true;
                        $scope.warningDepartureDate = false;
                        $scope.warningDate = false;
                        return;
                    }

                    if ($scope.currentRoom.ArrivalDate > $scope.currentRoom.DepartureDate) {
                        $scope.warningDate = true;
                        $scope.warningMissingRoom = false;
                        $scope.warningMissingReason = false;
                        $scope.warningDepartureDate = false;
                        return;
                    }

                    if (($scope.currentRoom.BookingStatus === 'BOOKED' || $scope.currentRoom.BookingStatus === 'NOSHOW') && ($scope.currentRoom.DepartureDate < new Date() || $scope.currentRoom.ArrivalDate < new Date())) {
                        console.log("FUCK");
                        $scope.warningDepartureDate = true;
                        $scope.warningDate = false;
                        $scope.warningMissingRoom = false;
                        $scope.warningMissingReason = false;
                        return;
                    }

                    var isDirty = false;
                    for (var index in $scope.roomList) {
                        if ($scope.roomList[index].RoomId.toString() === $scope.newRoom.RoomId.toString()) {
                            if ($scope.roomList[index].HouseStatus === "DIRTY") {
                                isDirty = true;
                            }
                            break;
                        }
                    }



                    if (!$scope.newRoom.RoomMoveFee || $scope.newRoom.RoomMoveFee === undefined) {
                        $scope.newRoom.RoomMoveFee = 0;
                    }

                    var RoomMoveModel = {
                        ReservationRoomId: $scope.currentRoom.ReservationRoomId,
                        NewRoomTypeId: $scope.newRoom.RoomTypeId,
                        NewRoomId: $scope.newRoom.RoomId,
                        NewRoomPriceId: $scope.newRoom.RoomPriceId,
                        IsDirty: isDirty,
                        UsePriceRateType: $scope.usePriceRateType,
                        OldRoomId: oldRoomId,
                        RoomMoveFee: $scope.newRoom.RoomMoveFee,
                        Description: $scope.newRoom.Description,
                        ArrivalDate: $scope.currentRoom.ArrivalDate,
                        DepartureDate: $scope.currentRoom.DepartureDate
                    }

                    if (!$scope.isSelected) {
                        RoomMoveModel.UsePriceRateType = 0;
                    } else {
                        RoomMoveModel.UsePriceRateType = 1;
                    }
                    $mdDialog.hide(RoomMoveModel);

                };

                $scope.changeSelect = function () {
                    $scope.isSelected = !$scope.isSelected;
                }

                $scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
            }
        },

        /*processAssignRoom: function (item, result, el) {
        	var itemTemp = angular.copy(item);
        	var resultTemp = angular.copy(result);
        	$mdDialog.show({
        		controller: AssignRoomDialogController,
        		resolve: {
        			item: function () {
        				return itemTemp;
        			},
        			currentResult: function () {
        				return resultTemp;
        			}
        		},
        		templateUrl: 'views/templates/assignRoom.tmpl.html',
        		parent: angular.element(document.body),
        		targetEvent: event,
        	}).then(function (AssignRoomModel) {
        		console.log("ASSIGN ROOM MODEL", AssignRoomModel);
        		var processAssignRoom = loginFactory.securedPostJSON("api/Room/ProcessAssignRoom", AssignRoomModel);
        		$rootScope.dataLoadingPromise = processAssignRoom;
        		processAssignRoom.success(function (data) {
        			dialogService.toast("ROOM_ASSIGNED_SUCCESSFUL");
        			$timeout(function () {
        				angular.element(el).triggerHandler('click');
        			}, 0);
        			$rootScope.pageInit = true;

        		}).error(function (err) {
        			console.log(err);
        			dialogService.messageBox("ERROR", err.Message);
        		});
        	}, function () {

        	});
        },*/
        processAssignRoom: function (item, result, el, listUR, type) {
            console.log("FRONT OFFICE", item, result);
            var roomList = [];
            var roomTypes = [];
            var planList = [];
            var reservationNumber;
            roomListFactory.getRoomList(new Date(), function (data) {
                console.log("DATA", data);
                roomList = data;
                roomTypes = data.roomTypes;
                planList = data.planList;
                reservationNumber = data.reservationNumber;

                var reservationRoom = angular.copy(result);
                var arrivalDateTemp = new Date(reservationRoom.ArrivalDate);
                var departureDateTemp = new Date(reservationRoom.DepartureDate);
                var availableRoom = [];
                availableRoom = reservationFactory.getAvailableRoom(roomList, reservationRoom.ArrivalDate, reservationRoom.DepartureDate, availableRoom);

                reservationRoom.reservationNumber = reservationNumber;
                reservationRoom.roomInfo = reservationRoom.Rooms;
                reservationRoom.planInfo = reservationRoom.RoomPrices;
                reservationRoom.customer = reservationRoom.Travellers;
                reservationRoom.roomTypeInfo = reservationRoom.RoomTypes;
                reservationRoom.roomTypes = roomTypes;
                reservationRoom.availableRoom = availableRoom;
                reservationRoom.planList = planList;
                console.log("RR 1", reservationRoom);
                if (type == "timeline") {
                    reservationFactory.assignRoom(reservationRoom, el, type);
                } else {
                    reservationFactory.assignRoom(reservationRoom, el);
                }
            });
        },

        processAssignRoomFO: function (item, result, el, listUR, type) {
            console.log("FRONT OFFICE", item, result);
            var roomList = [];
            var roomTypes = [];
            var planList = [];
            var reservationNumber;
            roomListFactory.getRoomList(new Date(), function (data) {
                console.log("DATA", data);
                roomList = data;
                roomTypes = data.roomTypes;
                planList = data.planList;
                reservationNumber = data.reservationNumber;

                var reservationRoom = angular.copy(result);
                var arrivalDateTemp = new Date(reservationRoom.ArrivalDate);
                var departureDateTemp = new Date(reservationRoom.DepartureDate);
                var availableRoom = [];
                availableRoom = reservationFactory.getAvailableRoom(roomList, reservationRoom.ArrivalDate, reservationRoom.DepartureDate, availableRoom);

                reservationRoom.reservationNumber = reservationNumber;
                reservationRoom.roomInfo = reservationRoom.Rooms;
                reservationRoom.planInfo = reservationRoom.RoomPrices;
                reservationRoom.customer = reservationRoom.Travellers;
                reservationRoom.roomTypeInfo = reservationRoom.RoomTypes;
                reservationRoom.roomTypes = roomTypes;
                reservationRoom.availableRoom = availableRoom;
                reservationRoom.planList = planList;
                console.log("RR 1", reservationRoom);               
                reservationFactory.assignRoomFO(reservationRoom, el);
                
            });
        },
        // Comment
        processUnassignRoom: function (item, result, el) {
            var itemTemp = angular.copy(item);
            var resultTemp = angular.copy(result);
            dialogService.confirm("UNASSIGN_ROOM_CONFIRM", "DO_YOU_WANT_TO_UNASSIGN_ROOM_THIS_RESERVATION").then(function () {
                var unassignRoomPromise = loginFactory.securedPostJSON("api/Room/ProcessUnassignRoom?RRID=" + result.ReservationRoomId, "")
                $rootScope.dataLoadingPromise = unassignRoomPromise;
                unassignRoomPromise.success(function (data) {
                    dialogService.toast("UNASSIGN_ROOM_SUCCESSFUL");
                    $timeout(function () {
                        angular.element(el).triggerHandler('click');
                    }, 0);
                    // $rootScope.pageInit = true;
                }).error(function (err) {
                    dialogService.messageBox("ERROR", err);
                })
            }, function () {});

        },

        processUndoCancelReservation: function (item, result, el) {
            console.log("RESULT", result);


            var itemTemp = angular.copy(item);
            var resultTemp = angular.copy(result);
            dialogService.confirm("UNDO_CANCEL_RESERVATION", "DO_YOU_WANT_TO_UNDO_CANCEL_RESERVATION?").then(function () {
                var keys = ["NOTIFICATION_UNDO_CANCEL_CONTENT", "NOTIFICATION_UNDO_CANCEL_NAN_CONTENT"];
                var languageKeys = {};
                for (var idx in keys) {
                    languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
                }
                var request = {};
                request.languageKeys = languageKeys;
                request.RRID = resultTemp.ReservationRoomId;

                var processUndoCancelReservation = loginFactory.securedPostJSON("api/Room/ProcessUndoCancelReservation?RRID=" + resultTemp.ReservationRoomId, request);
                $rootScope.dataLoadingPromise = processUndoCancelReservation;
                processUndoCancelReservation.success(function (data) {
                    dialogService.toast("UNDO_CANCEL_RESERVATION_SUCCESSFUL");
                    $timeout(function () {
                        angular.element(el).triggerHandler('click');
                    }, 0);
                    $rootScope.pageInit = true;
                }).error(function (err) {
                    if (err.Message) {
                        dialogService.messageBox("ERROR", err.Message)
                    } else {
                        conflictReservationProcess(err);
                    };
                });
            }, function () {

            });
        },

        processCheckOut: function (scope, result, el) {
            var dialogLiveCheckout = function (scope, result, el) {
                var itemTemp = angular.copy(result);
                scope.checkOutDialog = $mdDialog;
                scope.checkOutDialog.show({
                    templateUrl: 'views/templates/liveCheckOut.tmpl.html',
                    clickOutsideToClose: false,
                    locals: {
                        local: [itemTemp, scope.checkOutDialog, scope, dialogLiveCheckout, Init]
                    },
                    controller: ['$scope', '$mdDialog', '$filter', '$rootScope', 'loginFactory', 'dialogService', 'local','SharedFeaturesFactory', LiveCheckOutController]
                }).then(function (data) {}, function () {});
            }
            dialogLiveCheckout(scope, result, el);
        },

        processChangeReservationStatus: function (scope, result, el, actionCode) {
            var keys = ["RES_NO", "ROOM", "NOTIFICATION_PRE_CHẸCKOUT", "NOTIFICATION_PRE_CHẸCKIN", "THIS_ROOM_EXTRA_SERVICE_WAS_DELETED_AUTOMATICALLY_BY_THE_PRE_CHECKIN_PROCESS", "THIS_ROOM_EXTRA_SERVICE_ITEM_WAS_DELETED_AUTOMATICALLY_BY_THE_PRE_CHECKIN_PROCESS", "THIS_PAYMENT_WAS_DELETED_AUTOMATICALLY_BY_THE_PRE_CHECKIN_PROCESS"];
            var languageKeys = {};
            for (var idx in keys) {
                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
            }
            console.log("ACTION CODE", actionCode);
            $mdDialog.show({
                controller: ChangeReservationStatusDialogController,
                resolve: {
                    action: function () {
                        return actionCode;
                    }
                },
                templateUrl: 'views/templates/changeReservationStatus.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: event,
            }).then(function (reason) {
                var ChangeReservationStatusModel = {
                    RRID: result.ReservationRoomId,
                    ActionCode: actionCode,
                    Reason: reason,
                    languageKeys: languageKeys
                }
                var changeReservationStatusProcess = loginFactory.securedPostJSON("api/Room/ProcessChangeReservationStatus", ChangeReservationStatusModel);
                $rootScope.dataLoadingPromise = changeReservationStatusProcess;
                changeReservationStatusProcess.success(function (data) {
                    if (actionCode === "PRE_CHECKIN") {
                        dialogService.toast("PRE_CHECKIN_SUCCESSFUL");
                        if (el != null) {
                            $timeout(function () {
                                angular.element(el).triggerHandler('click');
                            }, 0);
                        }
                    }

                    if (actionCode === "PRE_CHECKOUT") {
                        dialogService.toast("PRE_CHECKOUT_SUCCESSFUL");
                        if (el != null) {
                            $timeout(function () {
                                angular.element(el).triggerHandler('click');
                            }, 0);
                        }
                        $rootScope.pageInit = true;
                    }
                    // if (el != null) {
                    //     $timeout(function () {
                    //         angular.element(el).triggerHandler('click');
                    //     }, 0);
                    // }
                   

                }).error(function (err) {
                    if (err.Message) {
                        dialogService.messageBox("ERROR", err.Message)
                    } else {
                        //conflictReservationProcess(err);
                        SharedFeaturesFactory.processConflictReservation(err, result, "RE_CHECKIN");
                    };
                })
            }, function () {

            });

            function ChangeReservationStatusDialogController($scope, $mdDialog, action) {
                function Init() {
                    $scope.action = action;
                    $scope.reason = null;
                }
                Init();
                $scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
                $scope.processPreCheckIn = function () {
                    $mdDialog.hide($scope.reason);
                }

            }

        },

        processCopyRR: function (item, result, el) {
            var useFullScreen = ($mdMedia('xs') || $mdMedia('sm'));
            var currentRoomTemp = angular.copy(result);
            $mdDialog.show({
                controller: CopyDialogController,
                resolve: {
                    item: function () {
                        return item;
                    },
                    currentRoom: function () {
                        return currentRoomTemp;
                    }
                },
                templateUrl: 'views/templates/copyReservation.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: event,
                fullscreen: useFullScreen
            }).then(function (copyRRModel) {
                var keys = ["NOTIFICATION_BOOKED_CONTENT", "NOTIFICATION_BOOKED_NAN_CONTENT"];
                var languageKeys = {};
                for (var idx in keys) {
                    languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
                }
                var data = {};
                data.languageKeys = languageKeys;
                data.ReservationRooms = copyRRModel;

                var processCopy = loginFactory.securedPostJSON("api/Room/ProcessCopyRR", data);
                $rootScope.dataLoadingPromise = processCopy;
                processCopy.success(function (data) {
                    dialogService.toast("COPY_RESERVATION_SUCCESSFUL");
                    $timeout(function () {
                        angular.element(el).triggerHandler('click');
                    }, 0);
                    //$rootScope.pageInit = true;
                }).error(function (err) {
                    if (err.Message) {
                        dialogService.messageBox("Error", err.Message).then(function () {
                            $state.go($state.current, {}, {
                                reload: true
                            });
                        });
                    } else {
                        conflictReservationProcess(err);
                    }
                });
            }, function () {

            });

            function CopyDialogController($scope, $mdDialog, item, currentRoom, roomListFactory) {
                console.log("CURRENT ROOM", currentRoom);
                var newRoom = {};

                $scope.isSelected = false;
                $scope.priceRateList = [];
                $scope.usePriceRateType = 1;

                function Init() {

                    $scope.DateTimePickerOption = {
                        format: 'dd/MM/yyyy HH:mm'
                    };
                    $scope.currentRoom = currentRoom;
                    $scope.str = new Date($scope.currentRoom.ArrivalDate).format('dd/mm/yyyy HH:MM');
                    $scope.str2 = new Date($scope.currentRoom.DepartureDate).format('dd/mm/yyyy HH:MM');
                    $scope.decimal = $rootScope.decimals;
                    $scope.warningMissingRoom = false;
                    $scope.warningDepartureDate = false;
                    $scope.warningDate = false;
                    $scope.newRoom = newRoom;
                    $scope.isSelected = false;

                    roomListFactory.getPriceRateList(function (data) {
                        $scope.priceRateList = data;
                        for (var index in $scope.priceRateList) {
                            if ($scope.currentRoom.RoomPriceId && $scope.currentRoom.RoomPriceId.toString() === $scope.priceRateList[index].RoomPriceId.toString()) {
                                $scope.currentRoom.RoomPriceName = $scope.priceRateList[index].RoomPriceName;
                                break;
                            }
                        }

                        /*$scope.priceRateList = $scope.priceRateList.sort(function (a, b) {
                        	return parseInt(a.Priority) - parseInt(b.Priority);
                        });*/

                        console.log("PRICE RATE LIST", $scope.priceRateList);
                    });


                    roomListFactory.getRoomList(new Date(), function (data) {
                        $scope.roomList = data;
                        $scope.planList = data.planList;
                        /*var roomTypes = [];
                        for (var idx in roomListFactory.getRoomTypes()) {
                        	roomTypes.push(roomListFactory.getRoomTypes()[idx]);
                        }*/
                        $scope.roomTypes = data.roomTypes;
                        $scope.availableRoom = [];
                        var arrivalDateTemp = new Date($scope.currentRoom.ArrivalDate);
                        var departureDateTemp = new Date($scope.currentRoom.DepartureDate);

                        //AVAILABLE PLAN LIST
                        if ($scope.planList !== null && $scope.planList.length > 0) {
                            $scope.availablePlanList = _.filter($scope.planList, function (item) {
                                return item.RoomTypeId == $scope.currentRoom.RoomTypeId;
                            })
                        }
                        $scope.newRoom.RoomTypeId = $scope.currentRoom.RoomTypeId;
                        $scope.newRoom.Price = $scope.currentRoom.Price;
                        $scope.newRoom.RoomId = 0;
                        $scope.newRoom.Note = $scope.currentRoom.Note;

                        //AVAILABLE ROOM
                        var availableRoom = [];
                        $scope.availableRoom = reservationFactory.getAvailableRoom($scope.roomList, $scope.currentRoom.ArrivalDate, $scope.currentRoom.DepartureDate, availableRoom);


                    });
                }
                Init();

                function addDays(date, days) {
                    var result = new Date(date);
                    result.setDate(result.getDate() + days);
                    return result;
                }
                $scope.$watchCollection('currentRoom', function (newValues, oldValues) {
                    console.log("OLD VALUE", oldValues);
                    console.log("NEW VALUE", newValues);
                    if (_.size(newValues) !== 0 && _.size(oldValues) !== 0 && !angular.equals(newValues, oldValues)) {
                        if (newValues.ArrivalDate !== oldValues.ArrivalDate && newValues.ArrivalDate >= oldValues.DepartureDate) {
                            newValues.DepartureDate = addDays(newValues.ArrivalDate, 1);
                        }

                        //AVAILABLE ROOM
                        var availableRoom = [];
                        $scope.availableRoom = reservationFactory.getAvailableRoom($scope.roomList, newValues.ArrivalDate, newValues.DepartureDate, availableRoom);
                    }


                    //AVAILABLE PLAN LIST
                    $scope.availablePlanList = _.filter($scope.planList, function (item) {
                        return (item.IsActive && item.RoomTypeId.toString() === newValues.RoomTypeId.toString());
                    }).sort(function (a, b) {
                        return parseInt(a.Priority) - parseInt(b.Priority);
                    });



                });

                $scope.filterValue = function ($event) {
                    if (isNaN(String.fromCharCode($event.keyCode))) {
                        $event.preventDefault();
                    }
                };
                /*$scope.$watchCollection('newRoom.RoomTypeId', function (newValues, oldValues) {
                	if (newValues.toString() !== oldValues.toString()) {
                		$scope.newRoom.RoomId = 0;
                	}
                });*/
                $scope.newPriceTemp = angular.copy($scope.newRoom.Price);

                $scope.$watchCollection('newRoom', function (newValues, oldValues) {
                    //					console.log("NEW ROOM", newValues, oldValues);
                    if (newValues && newValues !== undefined && newValues.RoomTypeId) {
                        $scope.availablePlanList = _.filter($scope.planList, function (item) {
                            return (item.IsActive && item.RoomTypeId.toString() === newValues.RoomTypeId.toString());
                        }).sort(function (a, b) {
                            return parseInt(a.Priority) - parseInt(b.Priority);
                        });

                    }
                    if (newValues.RoomPriceId != oldValues.RoomPriceId || newValues.RoomTypeId != oldValues.RoomTypeId) {
                        setTimeout(function () {
                            if (newValues && newValues !== undefined && newValues.RoomPriceId) {
                                $scope.newRoom.Price = _.filter($scope.availablePlanList, function (item) {
                                    console.log("ITEM", item);
                                    return (item.RoomPriceId.toString() === newValues.RoomPriceId.toString());
                                })[0].FullDayPrice;

                            }
                        }, 0);
                    }

                    if (newValues.Price != oldValues.Price && newValues.Price != 0) {
                        console.log("VALUE PRICE", newValues.Price, oldValues.Price);
                        $scope.newPriceTemp = angular.copy(newValues.Price);
                    }



                });
                $scope.newRoomPriceRateList = [];
                $scope.showOverridePriceRate = true;

                $scope.processCopy = function () {
                    console.log("NEW ROOM", $scope.newRoom, $scope.usePriceRateType);
                    /*if (!$scope.newRoom.RoomId || parseInt($scope.newRoom.RoomId) === 0 || $scope.newRoom.RoomId.toString() === currentRoom.RoomId.toString()) {
                    	$scope.warningMissingRoom = true;
                    	$scope.warningMissingReason = false;
                    	$scope.warningDepartureDate = false;
                    	$scope.warningDate = false;
                    	return;
                    }*/

                    /*if ((currentRoom.BookingStatus == 'CHECKIN' || currentRoom.BookingStatus == 'OVERDUE') && (!$scope.newRoom.Description || $scope.newRoom.Description.trim() == '')) {
                    	$scope.warningMissingRoom = false;
                    	$scope.warningMissingReason = true;
                    	$scope.warningDepartureDate = false;
                    	$scope.warningDate = false;
                    	return;
                    }*/

                    if ($scope.currentRoom.ArrivalDate > $scope.currentRoom.DepartureDate) {
                        $scope.warningDate = true;
                        $scope.warningMissingRoom = false;
                        $scope.warningMissingReason = false;
                        $scope.warningDepartureDate = false;
                        return;
                    }

                    if (new Date($scope.currentRoom.DepartureDate) < new Date() || new Date($scope.currentRoom.ArrivalDate) < new Date()) {
                        console.log("FUCK");
                        $scope.warningDepartureDate = true;
                        $scope.warningDate = false;
                        $scope.warningMissingRoom = false;
                        $scope.warningMissingReason = false;
                        return;
                    }

                    var isDirty = false;
                    if ($scope.newRoom.RoomId) {
                        for (var index in $scope.roomList) {
                            if ($scope.roomList[index].RoomId.toString() === $scope.newRoom.RoomId.toString()) {
                                if ($scope.roomList[index].HouseStatus === "DIRTY") {
                                    isDirty = true;
                                }
                                break;
                            }
                        }
                    }


                    if (!$scope.newRoom.RoomMoveFee || $scope.newRoom.RoomMoveFee === undefined) {
                        $scope.newRoom.RoomMoveFee = 0;
                    }

                    var copyRRModel = {
                        ReservationRoomId: $scope.currentRoom.ReservationRoomId,
                        TravellerId: $scope.currentRoom.Travellers.TravellerId,
                        RoomTypeId: $scope.newRoom.RoomTypeId,
                        RoomId: $scope.newRoom.RoomId,
                        RoomPriceId: $scope.newRoom.RoomPriceId,
                        IsDirty: isDirty,
                        Note: $scope.newRoom.Note,
                        ArrivalDate: $scope.currentRoom.ArrivalDate,
                        DepartureDate: $scope.currentRoom.DepartureDate,
                        Price: $scope.newPriceTemp,
                        Adults: $scope.currentRoom.Adults,
                        Child: $scope.currentRoom.Child
                    }
                    $mdDialog.hide(copyRRModel);
                };

                $scope.changeSelect = function () {
                    $scope.isSelected = !$scope.isSelected;
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

    return frontOfficeFactory;



    function sortByDateTimeAsc(lhs, rhs) {
        var results;
        results = lhs.getYear() > rhs.getYear() ?
            1 : lhs.getYear() < rhs.getYear() ? -1 : 0;
        if (results === 0)
            results = lhs.getMonth() > rhs.getMonth() ?
            1 : lhs.getMonth() < rhs.getMonth() ? -1 : 0;
        if (results === 0)
            results = lhs.getDate() > rhs.getDate() ?
            1 : lhs.getDate() < rhs.getDate() ? -1 : 0;
        if (results === 0)
            results = lhs.getHours() > rhs.getHours() ?
            1 : lhs.getHours() < rhs.getHours() ? -1 : 0;
        if (results === 0)
            results = lhs.getMinutes() > rhs.getMinutes() ?
            1 : lhs.getMinutes() < rhs.getMinutes() ? -1 : 0;
        if (results === 0)
            results = lhs.getSeconds() > rhs.getSeconds() ?
            1 : lhs.getSeconds() < rhs.getSeconds() ? -1 : 0;
        return results;
    }



    function resolveReferences(json) {
        if (typeof json === 'string')
            json = JSON.parse(json);

        var byid = {}, // all objects by id
            refs = []; // references to objects that could not be resolved
        json = (function recurse(obj, prop, parent) {
            if (typeof obj !== 'object' || !obj) // a primitive value
                return obj;
            if (Object.prototype.toString.call(obj) === '[object Array]') {
                for (var i = 0; i < obj.length; i++)
                    if ("$ref" in obj[i])
                        obj[i] = recurse(obj[i], i, obj);
                    else
                        obj[i] = recurse(obj[i], prop, obj);
                return obj;
            }
            if ("$ref" in obj) { // a reference
                var ref = obj.$ref;
                if (ref in byid)
                    return byid[ref];
                // else we have to make it lazy:
                refs.push([parent, prop, ref]);
                return;
            } else if ("$id" in obj) {
                var id = obj.$id;
                delete obj.$id;
                if ("$values" in obj) // an array
                    obj = obj.$values.map(recurse);
                else // a plain object
                    for (var prop in obj)
                        obj[prop] = recurse(obj[prop], prop, obj);
                byid[id] = obj;
            }
            return obj;
        })(json); // run it!

        for (var i = 0; i < refs.length; i++) { // resolve previously unknown references
            var ref = refs[i];
            ref[0][ref[1]] = byid[ref[2]];
            // Notice that this throws if you put in a reference at top-level
        }
        return json;
    }

    function searchGuestListDataProcess(data) {
        var dataTemp = data;
        console.log("GUEST LIST", dataTemp);
        var reservationTravellers = [];
        for (var index in dataTemp) {
            var rtTemp = dataTemp[index];
            var traveller = {};
            traveller.Traveller = rtTemp[0].Travellers;
            traveller.ReservationRooms = [];
            for (var index2 in rtTemp) {
                traveller.ReservationRooms.push(rtTemp[index2]);
            }
            reservationTravellers.push(traveller);
        }

        console.log("reservationTravellers", reservationTravellers);
        // delete data;
        data = reservationTravellers;
        console.log("data", data);
    }



    function searchReservationListDataProcess(data) {
        console.log("DATA GET", data)
        var dataTemp = data;
        dataTemp.reservationRooms = _.filter(dataTemp.reservationRooms, function (item) {
            return (item.BookingStatus === "BOOKED" || item.BookingStatus === "NOSHOW" || item.BookingStatus === "CANCELLED" || item.BookingStatus === "CHECKIN");
        });

        var statusColors = dataTemp.statusColors;
        for (var index in dataTemp.reservationRooms) {
            var reservationRoomTemp = dataTemp.reservationRooms[index];

            if (reservationRoomTemp.ArrivalDate) {
                reservationRoomTemp.ArrivalDate = new Date(reservationRoomTemp.ArrivalDate)
            }
            if (reservationRoomTemp.DepartureDate) {
                reservationRoomTemp.DepartureDate = new Date(reservationRoomTemp.DepartureDate)
            }

            if (reservationRoomTemp.CreatedDate) {
                reservationRoomTemp.CreatedDate = new Date(reservationRoomTemp.CreatedDate)
            }

            if (reservationRoomTemp.CheckInDate) {
                reservationRoomTemp.CheckInDate = new Date(reservationRoomTemp.CheckInDate)
            }

            if (reservationRoomTemp.CheckOutDate) {
                reservationRoomTemp.CheckOutDate = new Date(reservationRoomTemp.CheckOutDate)
            }

            console.log(reservationRoomTemp);

            for (var index2 in dataTemp.reservationInfo) {
                if (dataTemp.reservationInfo[index2].ReservationRoomId.toString() === reservationRoomTemp.ReservationRoomId.toString()) {
                    reservationRoomTemp.CheckInUserName = dataTemp.reservationInfo[index2].CheckInUserName;
                    reservationRoomTemp.CheckOutUserName = dataTemp.reservationInfo[index2].CheckOutUserName;
                    reservationRoomTemp.CreatedUserName = dataTemp.reservationInfo[index2].CreatedUserName;
                    reservationRoomTemp.CancelUserName = dataTemp.reservationInfo[index2].CancelUserName;
                    break;
                }
            }

            if (reservationRoomTemp.Reservations && reservationRoomTemp.Reservations.CreatedDate) {
                reservationRoomTemp.Reservations.CreatedDate = new Date(reservationRoomTemp.Reservations.CreatedDate);
            }

            //Calculate Booking Status
            if (reservationRoomTemp.BookingStatus === "BOOKED" && reservationRoomTemp.ArrivalDate < new Date()) {
                reservationRoomTemp.BookingStatus = "NOSHOW";
            }

            if (reservationRoomTemp.BookingStatus === "CHECKIN" && reservationRoomTemp.DepartureDate < new Date()) {
                reservationRoomTemp.BookingStatus = "OVERDUE";
            }

            if (reservationRoomTemp.Rooms && reservationRoomTemp.Rooms.HouseStatus === "REPAIR") {
                if (reservationRoomTemp.Rooms.RepairStartDate) {
                    reservationRoomTemp.Rooms.RepairStartDate = new Date(reservationRoomTemp.Rooms.RepairStartDate);
                } else {
                    reservationRoomTemp.Rooms.RepairStartDate = new Date(1970, 0, 1, 12, 0, 0);
                }
                if (reservationRoomTemp.Rooms.RepairEndDate) {
                    reservationRoomTemp.Rooms.RepairEndDate = new Date(reservationRoomTemp.Rooms.RepairEndDate);
                } else {
                    reservationRoomTemp.Rooms.RepairEndDate = new Date(9999, 0, 1, 12, 0, 0);
                }
                if (reservationRoomTemp.Rooms.RepairStartDate >= new Date() || reservationRoomTemp.Rooms.RepairEndDate <= new Date()) {
                    reservationRoomTemp.Rooms.HouseStatus = null;
                }
            }

            //Status Color
            for (var index in statusColors) {
                if (reservationRoomTemp.BookingStatus && reservationRoomTemp.BookingStatus === statusColors[index].StatusCode) {
                    reservationRoomTemp.Color = statusColors[index].ColorCode;
                    break;
                }

            }
            for (var index in statusColors) {
                if (reservationRoomTemp.Rooms && reservationRoomTemp.Rooms.HouseStatus === statusColors[index].StatusCode) {
                    reservationRoomTemp.Color = statusColors[index].ColorCode;
                    break;
                }
            }

            //Total
            var total = 0;
            if (reservationRoomTemp.PaymentsList) {
                for (var index in reservationRoomTemp.PaymentsList) {
                    total = total + reservationRoomTemp.PaymentsList[index].Amount;
                }
            }
            console.info("TOTAL", total, reservationRoomTemp);


            //Menu Items
            var menus = [{
                name: "VIEW_DETAIL",
                icon: "ic_pageview_24px.svg",
                url: "reservation/" + reservationRoomTemp.ReservationRoomId
            }];

            if (reservationRoomTemp.Reservations !== null && reservationRoomTemp.Reservations.IsGroup == true) {
                menus.push({
                    name: "EDIT_GROUP",
                    icon: "ic_pageview_24px.svg",
                    url: "groupReservationDetail/" + reservationRoomTemp.Reservations.ReservationId
                });
            }

            menus.push({
                name: "COPY",
                icon: "ic_content_copy_24px.svg"
            });


            if (reservationRoomTemp.BookingStatus !== "CANCELLED") {
                menus.push({
                    name: "AMEND_STAY",
                    icon: "ic_alarm_add_24px.svg",
                });
            }


            if (reservationRoomTemp.BookingStatus === "CANCELLED" && reservationRoomTemp.ArrivalDate.getTime() >= new Date().getTime()) {
                menus.push({
                    name: "UNDO_CANCEL_RESERVATION",
                    icon: "ic_undo_24px.svg",
                });

            }

            if (reservationRoomTemp.Rooms && reservationRoomTemp.BookingStatus !== "CANCELLED") {
                if (reservationRoomTemp.BookingStatus === "CHECKIN" || reservationRoomTemp.BookingStatus === "OVERDUE" || reservationRoomTemp.BookingStatus === "BOOKED" || reservationRoomTemp.BookingStatus === "NOSHOW") {
                    menus.push({
                        name: "ROOM_MOVE",
                        icon: "ic_swap_horiz_24px.svg",
                    });
                }
            }



            if (!reservationRoomTemp.Rooms && reservationRoomTemp.BookingStatus !== "CANCELLED") {
                menus.push({
                    name: "ASSIGN_ROOM",
                    icon: "ic_local_hotel_24px.svg",
                });
            }

            if (reservationRoomTemp.Rooms && (reservationRoomTemp.BookingStatus === "BOOKED" || reservationRoomTemp.BookingStatus === "NOSHOW")) {
                menus.push({
                    name: "UNASSIGN_ROOM",
                    icon: "ic_grid_off_24px.svg",
                });
                menus.push({
                    name: "CHECKIN",
                    icon: "ic_local_hotel_24px.svg",
                });

            }

            if (reservationRoomTemp.BookingStatus === "BOOKED" || reservationRoomTemp.BookingStatus === "NOSHOW") {
                menus.push({
                    name: "CANCEL",
                    icon: "ic_cancel_24px.svg",
                });
            }

            if (reservationRoomTemp.Rooms && reservationRoomTemp.Rooms.HouseStatus === "DIRTY") {
                menus.push({
                    name: "CLEAN",
                    icon: "ic_toys_24px.svg",
                });
            } else if (reservationRoomTemp.Rooms != null) {
                menus.push({
                    name: "SET_ROOM_DIRTY",
                    icon: "ic_report_problem_24px.svg",
                });
            }
            if (reservationRoomTemp.Rooms && $rootScope.user.Roles.indexOf('ROLE_HOTEL_STAFF') < 0 && (reservationRoomTemp.BookingStatus === "CHECKIN" || reservationRoomTemp.BookingStatus === "OVERDUE")) {
                menus.push({
                    name: "PRE_CHECKIN",
                    icon: "ic_reply_24px.svg",
                });
            }
            reservationRoomTemp.MenuItems = menus;

            //Room Booking List
            if (data.roomBookingList !== null) {
                for (var index in data.roomBookingList) {
                    if (reservationRoomTemp.Rooms && index.toString() === reservationRoomTemp.Rooms.RoomId.toString()) {
                        console.log("INDEX", data.roomBookingList[index]);
                        var roomBookingListTemp = {};
                        roomBookingListTemp.NextReservation = [];
                        roomBookingListTemp.PreviousReservation = [];
                        for (var idx2 in data.roomBookingList[index]) {
                            if (new Date(data.roomBookingList[index][idx2].ArrivalDate).getTime() > new Date(reservationRoomTemp.ArrivalDate).getTime() && data.roomBookingList[index][idx2].BookingStatus !== "CANCELLED") {
                                roomBookingListTemp.NextReservation.push(data.roomBookingList[index][idx2]);
                            }
                            if (new Date(data.roomBookingList[index][idx2].DepartureDate).getTime() < new Date(reservationRoomTemp.ArrivalDate).getTime() && data.roomBookingList[index][idx2].BookingStatus !== "CANCELLED") {
                                roomBookingListTemp.PreviousReservation.push(data.roomBookingList[index][idx2]);
                            }
                        }
                        reservationRoomTemp.roomBookingList = roomBookingListTemp;
                        break;
                    }
                }
                if (reservationRoomTemp.roomBookingList && reservationRoomTemp.roomBookingList.NextReservation.length > 0) {
                    reservationRoomTemp.roomBookingList.NextReservation.sort(function (a, b) {
                        return sortByDateTimeAsc(new Date(a.ArrivalDate), new Date(b.ArrivalDate));
                    });
                    for (var index in reservationRoomTemp.roomBookingList.NextReservation) {
                        reservationRoomTemp.roomBookingList.NextReservation[index].ArrivalDate = new Date(reservationRoomTemp.roomBookingList.NextReservation[index].ArrivalDate);
                        reservationRoomTemp.roomBookingList.NextReservation[index].DepartureDate = new Date(reservationRoomTemp.roomBookingList.NextReservation[index].DepartureDate);
                    }
                }
                if (reservationRoomTemp.roomBookingList && reservationRoomTemp.roomBookingList.PreviousReservation.length > 0) {
                    reservationRoomTemp.roomBookingList.PreviousReservation.sort(function (a, b) {
                        return sortByDateTimeAsc(new Date(a.DepartureDate), new Date(b.DepartureDate));
                    });
                    for (var index in reservationRoomTemp.roomBookingList.PreviousReservation) {
                        reservationRoomTemp.roomBookingList.PreviousReservation[index].ArrivalDate = new Date(reservationRoomTemp.roomBookingList.PreviousReservation[index].ArrivalDate);
                        reservationRoomTemp.roomBookingList.PreviousReservation[index].DepartureDate = new Date(reservationRoomTemp.roomBookingList.PreviousReservation[index].DepartureDate);
                    }
                }
            }
        }

        delete data;
        data = dataTemp;
    }

    function searchArrivalListDataProcess(data) {
        var dataTemp = data;
        dataTemp.reservationRooms = _.filter(dataTemp.reservationRooms, function (item) {
            return !(item.BookingStatus !== "BOOKED");
        });

        var statusColors = dataTemp.statusColors;
        for (var index in dataTemp.reservationRooms) {
            var reservationRoomTemp = dataTemp.reservationRooms[index];

            if (reservationRoomTemp.ArrivalDate) {
                reservationRoomTemp.ArrivalDate = new Date(reservationRoomTemp.ArrivalDate)
            }
            if (reservationRoomTemp.DepartureDate) {
                reservationRoomTemp.DepartureDate = new Date(reservationRoomTemp.DepartureDate)
            }

            if (reservationRoomTemp.CreatedDate) {
                reservationRoomTemp.CreatedDate = new Date(reservationRoomTemp.CreatedDate)
            }

            for (var index2 in dataTemp.reservationInfo) {
                if (dataTemp.reservationInfo[index2].ReservationRoomId.toString() === reservationRoomTemp.ReservationRoomId.toString()) {
                    reservationRoomTemp.CheckInUserName = dataTemp.reservationInfo[index2].CheckInUserName;
                    reservationRoomTemp.CheckOutUserName = dataTemp.reservationInfo[index2].CheckOutUserName;
                    reservationRoomTemp.CreatedUserName = dataTemp.reservationInfo[index2].CreatedUserName;
                    reservationRoomTemp.CancelUserName = dataTemp.reservationInfo[index2].CancelUserName;
                    break;
                }

            }

            //Calculate Booking Status
            if (reservationRoomTemp.BookingStatus === "BOOKED" && reservationRoomTemp.ArrivalDate < new Date()) {
                reservationRoomTemp.BookingStatus = "NOSHOW";
            }

            if (reservationRoomTemp.Rooms && reservationRoomTemp.Rooms.HouseStatus === "REPAIR") {
                if (reservationRoomTemp.Rooms.RepairStartDate) {
                    reservationRoomTemp.Rooms.RepairStartDate = new Date(reservationRoomTemp.Rooms.RepairStartDate);
                } else {
                    reservationRoomTemp.Rooms.RepairStartDate = new Date(1970, 0, 1, 12, 0, 0);
                }
                if (reservationRoomTemp.Rooms.RepairEndDate) {
                    reservationRoomTemp.Rooms.RepairEndDate = new Date(reservationRoomTemp.Rooms.RepairEndDate);
                } else {
                    reservationRoomTemp.Rooms.RepairEndDate = new Date(9999, 0, 1, 12, 0, 0);
                }
                if (reservationRoomTemp.Rooms.RepairStartDate >= new Date() || reservationRoomTemp.Rooms.RepairEndDate <= new Date()) {
                    reservationRoomTemp.Rooms.HouseStatus = null;
                }
            }

            //Status Color
            for (var index in statusColors) {
                if (reservationRoomTemp.BookingStatus && reservationRoomTemp.BookingStatus === statusColors[index].StatusCode) {
                    reservationRoomTemp.Color = statusColors[index].ColorCode;
                    break;
                }

            }
            for (var index in statusColors) {
                if (reservationRoomTemp.Rooms && reservationRoomTemp.Rooms.HouseStatus === statusColors[index].StatusCode) {
                    reservationRoomTemp.Color = statusColors[index].ColorCode;
                    break;
                }
            }


            //Menu Items
            var menus = [{
                name: "VIEW_DETAIL",
                icon: "ic_pageview_24px.svg",
                url: "reservation/" + reservationRoomTemp.ReservationRoomId
            }];

            if (reservationRoomTemp.Reservations !== null && reservationRoomTemp.Reservations.IsGroup == true) {
                menus.push({
                    name: "EDIT_GROUP",
                    icon: "ic_pageview_24px.svg",
                    url: "groupReservationDetail/" + reservationRoomTemp.Reservations.ReservationId
                });
            }

            menus.push({
                name: "AMEND_STAY",
                icon: "ic_alarm_add_24px.svg"
            });

            menus.push({
                name: "CANCEL",
                icon: "ic_cancel_24px.svg"
            });
            menus.push({
                name: "COPY",
                icon: "ic_content_copy_24px.svg"
            });

            if (reservationRoomTemp.Rooms) {
                menus.push({
                    name: "ROOM_MOVE",
                    icon: "ic_swap_horiz_24px.svg",
                });
                menus.push({
                    name: "CHECKIN",
                    icon: "ic_local_hotel_24px.svg",
                });

                if (reservationRoomTemp.Rooms.HouseStatus === "DIRTY") {
                    menus.push({
                        name: "CLEAN",
                        icon: "ic_toys_24px.svg",
                    });
                } else {
                    menus.push({
                        name: "SET_ROOM_DIRTY",
                        icon: "ic_report_problem_24px.svg",
                    });
                }
            }
            if (!reservationRoomTemp.Rooms) {
                menus.push({
                    name: "ASSIGN_ROOM",
                    icon: "ic_local_hotel_24px.svg",
                });
            }


            if (reservationRoomTemp.Rooms && (reservationRoomTemp.BookingStatus === 'BOOKED' || reservationRoomTemp.BookingStatus === 'NOSHOW')) {
                menus.push({
                    name: "UNASSIGN_ROOM",
                    icon: "ic_grid_off_24px.svg",
                });
            }

            reservationRoomTemp.MenuItems = menus;

            //Room Booking List
            if (data.roomBookingList !== null) {
                for (var index in data.roomBookingList) {
                    if (reservationRoomTemp.Rooms && index.toString() === reservationRoomTemp.Rooms.RoomId.toString()) {
                        console.log("INDEX", data.roomBookingList[index]);
                        var roomBookingListTemp = {};
                        roomBookingListTemp.NextReservation = [];
                        roomBookingListTemp.PreviousReservation = [];
                        for (var idx2 in data.roomBookingList[index]) {
                            if (new Date(data.roomBookingList[index][idx2].ArrivalDate).getTime() > new Date(reservationRoomTemp.ArrivalDate).getTime() && data.roomBookingList[index][idx2].BookingStatus !== "CANCELLED") {
                                roomBookingListTemp.NextReservation.push(data.roomBookingList[index][idx2]);
                            }
                            if (new Date(data.roomBookingList[index][idx2].DepartureDate).getTime() < new Date(reservationRoomTemp.ArrivalDate).getTime() && data.roomBookingList[index][idx2].BookingStatus !== "CANCELLED") {
                                roomBookingListTemp.PreviousReservation.push(data.roomBookingList[index][idx2]);
                            }
                        }
                        reservationRoomTemp.roomBookingList = roomBookingListTemp;
                        break;
                    }
                }
                if (reservationRoomTemp.roomBookingList && reservationRoomTemp.roomBookingList.NextReservation.length > 0) {
                    reservationRoomTemp.roomBookingList.NextReservation.sort(function (a, b) {
                        return sortByDateTimeAsc(new Date(a.ArrivalDate), new Date(b.ArrivalDate));
                    });
                    for (var index in reservationRoomTemp.roomBookingList.NextReservation) {
                        reservationRoomTemp.roomBookingList.NextReservation[index].ArrivalDate = new Date(reservationRoomTemp.roomBookingList.NextReservation[index].ArrivalDate);
                        reservationRoomTemp.roomBookingList.NextReservation[index].DepartureDate = new Date(reservationRoomTemp.roomBookingList.NextReservation[index].DepartureDate);
                    }
                }
                if (reservationRoomTemp.roomBookingList && reservationRoomTemp.roomBookingList.PreviousReservation.length > 0) {
                    reservationRoomTemp.roomBookingList.PreviousReservation.sort(function (a, b) {
                        return sortByDateTimeAsc(new Date(a.DepartureDate), new Date(b.DepartureDate));
                    });
                    for (var index in reservationRoomTemp.roomBookingList.PreviousReservation) {
                        reservationRoomTemp.roomBookingList.PreviousReservation[index].ArrivalDate = new Date(reservationRoomTemp.roomBookingList.PreviousReservation[index].ArrivalDate);
                        reservationRoomTemp.roomBookingList.PreviousReservation[index].DepartureDate = new Date(reservationRoomTemp.roomBookingList.PreviousReservation[index].DepartureDate);
                    }
                }
            }
        }
        delete data;
        data = dataTemp;
    }


    function searchDepartureListDataProcess(data) {
        console.log("DEPT LIST", data);
        var dataTemp = data;
        dataTemp.reservationRooms = _.filter(dataTemp.reservationRooms, function (item) {
            return !(item.BookingStatus !== "CHECKIN");
        });

        var statusColors = dataTemp.statusColors;
        for (var index in dataTemp.reservationRooms) {
            var reservationRoomTemp = dataTemp.reservationRooms[index];

            if (reservationRoomTemp.ArrivalDate) {
                reservationRoomTemp.ArrivalDate = new Date(reservationRoomTemp.ArrivalDate)
            }
            if (reservationRoomTemp.DepartureDate) {
                reservationRoomTemp.DepartureDate = new Date(reservationRoomTemp.DepartureDate)
            }

            if (reservationRoomTemp.CreatedDate) {
                reservationRoomTemp.CreatedDate = new Date(reservationRoomTemp.CreatedDate)
            }

            if (reservationRoomTemp.CheckInDate) {
                reservationRoomTemp.CheckInDate = new Date(reservationRoomTemp.CheckInDate)
            }

            if (reservationRoomTemp.CheckOutDate) {
                reservationRoomTemp.CheckOutDate = new Date(reservationRoomTemp.CheckOutDate)
            }

            for (var index2 in dataTemp.reservationInfo) {
                if (dataTemp.reservationInfo[index2].ReservationRoomId.toString() === reservationRoomTemp.ReservationRoomId.toString()) {
                    reservationRoomTemp.CheckInUserName = dataTemp.reservationInfo[index2].CheckInUserName;
                    reservationRoomTemp.CheckOutUserName = dataTemp.reservationInfo[index2].CheckOutUserName;
                    reservationRoomTemp.CreatedUserName = dataTemp.reservationInfo[index2].CreatedUserName;
                    reservationRoomTemp.CancelUserName = dataTemp.reservationInfo[index2].CancelUserName;
                    break;
                }

            }

            //Calculate Booking Status
            if (reservationRoomTemp.BookingStatus === "CHECKIN" && reservationRoomTemp.DepartureDate < new Date()) {
                reservationRoomTemp.BookingStatus = "OVERDUE";
            }

            if (reservationRoomTemp.Rooms && reservationRoomTemp.Rooms.HouseStatus === "REPAIR") {
                if (reservationRoomTemp.Rooms.RepairStartDate) {
                    reservationRoomTemp.Rooms.RepairStartDate = new Date(reservationRoomTemp.Rooms.RepairStartDate);
                } else {
                    reservationRoomTemp.Rooms.RepairStartDate = new Date(1970, 0, 1, 12, 0, 0);
                }
                if (reservationRoomTemp.Rooms.RepairEndDate) {
                    reservationRoomTemp.Rooms.RepairEndDate = new Date(reservationRoomTemp.Rooms.RepairEndDate);
                } else {
                    reservationRoomTemp.Rooms.RepairEndDate = new Date(9999, 0, 1, 12, 0, 0);
                }
                if (reservationRoomTemp.Rooms.RepairStartDate >= new Date() || reservationRoomTemp.Rooms.RepairEndDate <= new Date()) {
                    reservationRoomTemp.Rooms.HouseStatus = null;
                }
            }

            //Status Color
            for (var index in statusColors) {
                if (reservationRoomTemp.BookingStatus && reservationRoomTemp.BookingStatus === statusColors[index].StatusCode) {
                    reservationRoomTemp.Color = statusColors[index].ColorCode;
                    break;
                }

            }
            for (var index in statusColors) {
                if (reservationRoomTemp.Rooms && reservationRoomTemp.Rooms.HouseStatus === statusColors[index].StatusCode) {
                    reservationRoomTemp.Color = statusColors[index].ColorCode;
                    break;
                }
            }


            //Menu Items
            var menus = [{
                name: "VIEW_DETAIL",
                icon: "ic_pageview_24px.svg",
                url: "reservation/" + reservationRoomTemp.ReservationRoomId
            }];

            if (reservationRoomTemp.Reservations !== null && reservationRoomTemp.Reservations.IsGroup == true) {
                menus.push({
                    name: "EDIT_GROUP",
                    icon: "ic_pageview_24px.svg",
                    url: "groupReservationDetail/" + reservationRoomTemp.Reservations.ReservationId
                });
            }

            menus.push({
                name: "AMEND_STAY",
                icon: "ic_alarm_add_24px.svg"
            });

            menus.push({
                name: "COPY",
                icon: "ic_content_copy_24px.svg"
            });

            if (reservationRoomTemp.Rooms) {
                menus.push({
                    name: "ROOM_MOVE",
                    icon: "ic_swap_horiz_24px.svg",
                });
                //menus.push();
                if ($rootScope.user.Roles.indexOf('ROLE_HOTEL_STAFF') < 0) {
                    menus.push({
                        name: "PRE_CHECKIN",
                        icon: "ic_reply_24px.svg",
                    });
                }


                if (reservationRoomTemp.Rooms.HouseStatus === "DIRTY") {
                    menus.push({
                        name: "CLEAN",
                        icon: "ic_toys_24px.svg",
                    });
                } else {
                    menus.push({
                        name: "SET_ROOM_DIRTY",
                        icon: "ic_report_problem_24px.svg",
                    });
                }
            }

            reservationRoomTemp.MenuItems = menus;

            //Room Booking List
            if (data.roomBookingList !== null) {
                for (var index in data.roomBookingList) {
                    if (reservationRoomTemp.Rooms && index.toString() === reservationRoomTemp.Rooms.RoomId.toString()) {
                        var roomBookingListTemp = {};
                        roomBookingListTemp.NextReservation = [];
                        roomBookingListTemp.PreviousReservation = [];
                        for (var idx2 in data.roomBookingList[index]) {
                            if (new Date(data.roomBookingList[index][idx2].ArrivalDate).getTime() > new Date(reservationRoomTemp.ArrivalDate).getTime() && data.roomBookingList[index][idx2].BookingStatus !== "CANCELLED") {
                                roomBookingListTemp.NextReservation.push(data.roomBookingList[index][idx2]);
                            }
                            if (new Date(data.roomBookingList[index][idx2].DepartureDate).getTime() < new Date(reservationRoomTemp.ArrivalDate).getTime() && data.roomBookingList[index][idx2].BookingStatus !== "CANCELLED") {
                                roomBookingListTemp.PreviousReservation.push(data.roomBookingList[index][idx2]);
                            }
                        }
                        reservationRoomTemp.roomBookingList = roomBookingListTemp;
                        break;
                    }
                }
                if (reservationRoomTemp.roomBookingList && reservationRoomTemp.roomBookingList.NextReservation.length > 0) {
                    reservationRoomTemp.roomBookingList.NextReservation.sort(function (a, b) {
                        return sortByDateTimeAsc(new Date(a.ArrivalDate), new Date(b.ArrivalDate));
                    });
                    for (var index in reservationRoomTemp.roomBookingList.NextReservation) {
                        reservationRoomTemp.roomBookingList.NextReservation[index].ArrivalDate = new Date(reservationRoomTemp.roomBookingList.NextReservation[index].ArrivalDate);
                        reservationRoomTemp.roomBookingList.NextReservation[index].DepartureDate = new Date(reservationRoomTemp.roomBookingList.NextReservation[index].DepartureDate);
                    }
                }
                if (reservationRoomTemp.roomBookingList && reservationRoomTemp.roomBookingList.PreviousReservation.length > 0) {
                    reservationRoomTemp.roomBookingList.PreviousReservation.sort(function (a, b) {
                        return sortByDateTimeAsc(new Date(a.DepartureDate), new Date(b.DepartureDate));
                    });
                    for (var index in reservationRoomTemp.roomBookingList.PreviousReservation) {
                        reservationRoomTemp.roomBookingList.PreviousReservation[index].ArrivalDate = new Date(reservationRoomTemp.roomBookingList.PreviousReservation[index].ArrivalDate);
                        reservationRoomTemp.roomBookingList.PreviousReservation[index].DepartureDate = new Date(reservationRoomTemp.roomBookingList.PreviousReservation[index].DepartureDate);
                    }
                }
            }
        }

        delete data;
        data = dataTemp;
    }

    function searchCheckoutListDataProcess(data) {
        console.log("CHECKOUT LIST", data);
        var dataTemp = data;
        dataTemp.reservationRooms = _.filter(dataTemp.reservationRooms, function (item) {
            return !(item.BookingStatus !== "CHECKOUT");
        });

        var statusColors = dataTemp.statusColors;
        for (var index in dataTemp.reservationRooms) {
            var reservationRoomTemp = dataTemp.reservationRooms[index];

            if (reservationRoomTemp.ArrivalDate) {
                reservationRoomTemp.ArrivalDate = new Date(reservationRoomTemp.ArrivalDate)
            }
            if (reservationRoomTemp.DepartureDate) {
                reservationRoomTemp.DepartureDate = new Date(reservationRoomTemp.DepartureDate)
            }


            if (reservationRoomTemp.CreatedDate) {
                reservationRoomTemp.CreatedDate = new Date(reservationRoomTemp.CreatedDate)
            }

            if (reservationRoomTemp.CheckInDate) {
                reservationRoomTemp.CheckInDate = new Date(reservationRoomTemp.CheckInDate)
            }

            if (reservationRoomTemp.CheckOutDate) {
                reservationRoomTemp.CheckOutDate = new Date(reservationRoomTemp.CheckOutDate)
            }

            for (var index2 in dataTemp.reservationInfo) {
                if (dataTemp.reservationInfo[index2].ReservationRoomId.toString() === reservationRoomTemp.ReservationRoomId.toString()) {
                    reservationRoomTemp.CheckInUserName = dataTemp.reservationInfo[index2].CheckInUserName;
                    reservationRoomTemp.CheckOutUserName = dataTemp.reservationInfo[index2].CheckOutUserName;
                    reservationRoomTemp.CreatedUserName = dataTemp.reservationInfo[index2].CreatedUserName;
                    reservationRoomTemp.CancelUserName = dataTemp.reservationInfo[index2].CancelUserName;
                    break;
                }

            }

            if (reservationRoomTemp.Rooms && reservationRoomTemp.Rooms.HouseStatus === "REPAIR") {
                if (reservationRoomTemp.Rooms.RepairStartDate) {
                    reservationRoomTemp.Rooms.RepairStartDate = new Date(reservationRoomTemp.Rooms.RepairStartDate);
                } else {
                    reservationRoomTemp.Rooms.RepairStartDate = new Date(1970, 0, 1, 12, 0, 0);
                }
                if (reservationRoomTemp.Rooms.RepairEndDate) {
                    reservationRoomTemp.Rooms.RepairEndDate = new Date(reservationRoomTemp.Rooms.RepairEndDate);
                } else {
                    reservationRoomTemp.Rooms.RepairEndDate = new Date(9999, 0, 1, 12, 0, 0);
                }
                if (reservationRoomTemp.Rooms.RepairStartDate >= new Date() || reservationRoomTemp.Rooms.RepairEndDate <= new Date()) {
                    reservationRoomTemp.Rooms.HouseStatus = null;
                }
            }

            //Status Color
            for (var index in statusColors) {
                if (reservationRoomTemp.BookingStatus && reservationRoomTemp.BookingStatus === statusColors[index].StatusCode) {
                    reservationRoomTemp.Color = statusColors[index].ColorCode;
                    break;
                }

            }
            for (var index in statusColors) {
                if (reservationRoomTemp.Rooms && reservationRoomTemp.Rooms.HouseStatus === statusColors[index].StatusCode) {
                    reservationRoomTemp.Color = statusColors[index].ColorCode;
                    break;
                }
            }


            //Menu Items
            var menus = [{
                name: "VIEW_DETAIL",
                icon: "ic_pageview_24px.svg",
                url: "reservation/" + reservationRoomTemp.ReservationRoomId
            }];

            if (reservationRoomTemp.Reservations !== null && reservationRoomTemp.Reservations.IsGroup == true) {
                menus.push({
                    name: "EDIT_GROUP",
                    icon: "ic_pageview_24px.svg",
                    url: "groupReservationDetail/" + reservationRoomTemp.Reservations.ReservationId
                });
            }

            menus.push({
                name: "COPY",
                icon: "ic_content_copy_24px.svg"
            });

            if (reservationRoomTemp.Rooms) {
                if (reservationRoomTemp.BookingStatus === "CHECKOUT" && $rootScope.user.Roles.indexOf('ROLE_HOTEL_STAFF') < 0) {
                    menus.push({
                        name: "PRE_CHECKOUT",
                        icon: "ic_reply_24px.svg"
                    });
                }
                if (reservationRoomTemp.Rooms.HouseStatus === "DIRTY") {
                    menus.push({
                        name: "CLEAN",
                        icon: "ic_toys_24px.svg",
                    });
                }
            }
            reservationRoomTemp.MenuItems = menus;


        }

        delete data;
        data = dataTemp;
    }

    function AmendStayDialogController($scope, $mdDialog, item, currentRoom) {
        console.log("CURRENT ROOM", currentRoom);
        $scope.departureTime;
        $scope.warning;
        $scope.warningDate;
        $scope.warningDepartureDate;
        $scope.minDate = new Date();

        function Init() {
            $scope.DateTimePickerOption = {
                format: 'dd/MM/yyyy HH:mm'
            };
            $scope.currentRoom = currentRoom;
            $scope.currentRoom.ArrivalDate = new Date($scope.currentRoom.ArrivalDate);
            $scope.currentRoom.DepartureDate = new Date($scope.currentRoom.DepartureDate);
            $scope.str = $scope.currentRoom.ArrivalDate.format('dd/mm/yyyy HH:MM');
            $scope.str2 = $scope.currentRoom.DepartureDate.format('dd/mm/yyyy HH:MM');
            $scope.warning = false;
            $scope.warningDate = false;
            $scope.warningDepartureDate = false;
        }
        Init();
        $scope.hide = function () {
            $mdDialog.hide();
        };
        $scope.cancel = function () {
            $mdDialog.cancel();
        };
        $scope.minDepartureDate = $scope.currentRoom.ArrivalDate;

        $scope.$watchCollection('currentRoom', function (newValues, oldValues) {
            if (newValues !== null && oldValues !== null && !angular.equals(newValues, oldValues)) {
                $scope.minDepartureDate = newValues.ArrivalDate;
            }
        });

        $scope.saveAmendStay = function () {
            var validAmendment = true;

            if ($scope.currentRoom.ArrivalDate <= $scope.currentRoom.DepartureDate) {
                $scope.warningDate = false;
                $scope.currentRoom.ArrivalDate = new Date($scope.currentRoom.ArrivalDate);
                $scope.currentRoom.DepartureDate = new Date($scope.currentRoom.DepartureDate);
                if ($scope.currentRoom.DepartureDate < new Date()) {
                    $scope.warningDepartureDate = true;
                } else {
                    var arrivalDateTemp = new Date($scope.currentRoom.ArrivalDate);
                    var departureDateTemp = new Date($scope.currentRoom.DepartureDate);
                    var AmendStayModel = {
                        reservationRoomId: $scope.currentRoom.ReservationRoomId,
                        departureDate: $scope.currentRoom.DepartureDate,
                        arrivalDate: $scope.currentRoom.ArrivalDate,
                        adults: $scope.currentRoom.Adults,
                        child: $scope.currentRoom.Child,
                        formatArrivalDate: new Date($scope.currentRoom.ArrivalDate).format('dd-mm-yyyy'),
                        formatDepartureDate: new Date($scope.currentRoom.DepartureDate).format('dd-mm-yyyy')
                    }
                    if ($scope.currentRoom.roomBookingList && $scope.currentRoom.roomBookingList.NextReservation && $scope.currentRoom.roomBookingList.NextReservation.length > 0) {
                        for (var index in $scope.currentRoom.roomBookingList.NextReservation) {
                            var bookingTemp = $scope.currentRoom.roomBookingList.NextReservation[index];
                            if (bookingTemp.ArrivalDate) {
                                bookingTemp.ArrivalDate = new Date(bookingTemp.ArrivalDate);
                            }
                            if (bookingTemp.DepartureDate) {
                                bookingTemp.DepartureDate = new Date(bookingTemp.DepartureDate);
                            }
                            if (bookingTemp.ArrivalDate.getTime() <= departureDateTemp.getTime() && departureDateTemp.getTime() <= bookingTemp.DepartureDate.getTime() ||
                                departureDateTemp.getTime() >= bookingTemp.DepartureDate.getTime()
                            ) {
                                validAmendment = false;
                                break;
                            }
                        }

                    }
                    if ($scope.currentRoom.roomBookingList && $scope.currentRoom.roomBookingList.PreviousReservation && $scope.currentRoom.roomBookingList.PreviousReservation.length > 0) {
                        for (var index in $scope.currentRoom.roomBookingList.PreviousReservation) {
                            var bookingTemp = $scope.currentRoom.roomBookingList.PreviousReservation[index];
                            if (bookingTemp.ArrivalDate) {
                                bookingTemp.ArrivalDate = new Date(bookingTemp.ArrivalDate);
                            }
                            if (bookingTemp.DepartureDate) {
                                bookingTemp.DepartureDate = new Date(bookingTemp.DepartureDate);
                            }
                            if (bookingTemp.ArrivalDate.getTime() <= arrivalDateTemp.getTime() && arrivalDateTemp.getTime() <= bookingTemp.DepartureDate.getTime() ||
                                arrivalDateTemp.getTime() <= bookingTemp.ArrivalDate.getTime()
                            ) {
                                validAmendment = false;
                                break;
                            }
                        }

                    }
                    if (validAmendment === true) {
                        console.log("FRONT AMEND 2", $scope.warning);
                        $mdDialog.hide(AmendStayModel);
                    } else {
                        $scope.warning = true;
                    }
                }

            } else {
                $scope.warningDate = true;
            }
        }
    }



    function AssignRoomDialogController($scope, $mdDialog, item, currentResult, roomListFactory) {
        //		currentResult = resolveReferences(currentResult);
        console.log("CURRENT RESULT", currentResult);
        var newRoom = {};
        $scope.isSelected = false;
        $scope.priceRateList = [];

        function Init() {
            $scope.currentResult = currentResult;
            $scope.warningMissingRoom = false;
            $scope.newRoom = newRoom;
            roomListFactory.getRoomList(new Date(), function (data) {
                $scope.roomList = data;
                var roomTypes = [];
                for (var idx in roomListFactory.getRoomTypes()) {
                    roomTypes.push(roomListFactory.getRoomTypes()[idx]);
                }
                $scope.roomTypes = roomTypes;
                $scope.availableRoom = [];
                var arrivalDateTemp = new Date($scope.currentResult.ArrivalDate);
                var departureDateTemp = new Date($scope.currentResult.DepartureDate);
                for (var index in $scope.roomList) {
                    if ($scope.roomList[index].RoomId && $scope.roomList[index].HouseStatus !== "REPAIR") {
                        var notThisRoom = false;
                        if ($scope.roomList[index].reservationRoom) {
                            if ((arrivalDateTemp <= $scope.roomList[index].reservationRoom.ArrivalDate && $scope.roomList[index].reservationRoom.ArrivalDate <= departureDateTemp) ||
                                (arrivalDateTemp <= $scope.roomList[index].reservationRoom.DepartureDate && $scope.roomList[index].reservationRoom.DepartureDate <= departureDateTemp) ||
                                ($scope.roomList[index].reservationRoom.ArrivalDate <= arrivalDateTemp && departureDateTemp <= $scope.roomList[index].reservationRoom.DepartureDate)
                            ) {
                                notThisRoom = true;
                            }
                        }
                        for (var index2 in $scope.roomList[index].roomBookingList) {
                            var bookingTemp = $scope.roomList[index].roomBookingList[index2];
                            bookingTemp.ArrivalDate = new Date(bookingTemp.ArrivalDate);
                            bookingTemp.DepartureDate = new Date(bookingTemp.DepartureDate);
                            if ((arrivalDateTemp <= bookingTemp.ArrivalDate && bookingTemp.ArrivalDate <= departureDateTemp) ||
                                (arrivalDateTemp <= bookingTemp.DepartureDate && bookingTemp.DepartureDate <= departureDateTemp) ||
                                (bookingTemp.ArrivalDate <= arrivalDateTemp && departureDateTemp <= bookingTemp.DepartureDate)) {
                                notThisRoom = true;
                            }
                        }
                        if (notThisRoom === false) {
                            $scope.availableRoom.push($scope.roomList[index]);
                        } else delete notThisRoom;
                    }
                }
            });
        }
        Init();

        $scope.processAssignRoom = function () {
            /*if (!$scope.newRoom.RoomId || parseInt($scope.newRoom.RoomId) === 0){
            	$scope.warningMissingRoom = true;
            }*/
            var AssignRoomModel = {
                ReservationRoomId: $scope.currentResult.ReservationRoomId,
                RoomId: $scope.newRoom.RoomId,
                ArrivalDate: $scope.currentResult.ArrivalDate,
                DepartureDate: $scope.currentResult.DepartureDate
            }
            $mdDialog.hide(AssignRoomModel);
        };

        $scope.changeSelect = function () {
            $scope.isSelected = !$scope.isSelected;
        }

        $scope.hide = function () {
            $mdDialog.hide();
        };
        $scope.cancel = function () {
            $mdDialog.cancel();
        };
    }

    function LiveCheckOutController($scope, $mdDialog, $filter, $rootScope, loginFactory, dialogService, local, SharedFeaturesFactory) {
        function Init() {
            $scope.confirmDialog = $mdDialog;
            $scope.dialog = local[3];
            $scope.currentItem = local[0];
            console.log("CURRENT ITEM", $scope.currentItem);
            $scope.showInvoice = false;

            var getInfo = loginFactory.securedGet("api/Room/Reservation", "reservationRoomId=" + $scope.currentItem.ReservationRoomId);
            getInfo.success(function (data) {
                $scope.room = data.room;
                $scope.customer = data.customer;
                var extraservices = data.extraServiceItems;
                for (var idx in extraservices) {
                    extraservices[idx].CreatedDate = new Date(extraservices[idx].CreatedDate);
                    extraservices[idx].willPay = true;
                }
                var payments = data.Payments;
                for (var index in payments) {
                    payments[index].CreatedDate = new Date(payments[index].CreatedDate);
                }
                $scope.Payments = payments;
                //$scope.RoomExtraServices = extraservices;
                $scope.RoomExtraServices = data.roomExtraServices;

                if (data.room.ArrivalDate) {
                    data.room.ArrivalDate = new Date(data.room.ArrivalDate);
                    data.room.ArrivalTime = new Date(1970, 0, 1, data.room.ArrivalDate.getHours(), data.room.ArrivalDate.getMinutes(), 0);
                }
                if (data.room.DepartureDate) {
                    data.room.DepartureDate = new Date(data.room.DepartureDate);
                    data.room.DepartureTime = new Date(1970, 0, 1, data.room.DepartureDate.getHours(), data.room.DepartureDate.getMinutes(), 0);
                }

                // Payment
                if (data.room.BookingStatus === 'CHECKIN' || data.room.BookingStatus === 'OVERDUE') {
                    var RoomPrice = {
                        roomId: data.room.RoomId,
                        arrivalDate: data.room.ArrivalDate,
                        departureDate: new Date(),
                        adults: data.room.Adults,
                        children: data.room.Child
                    };
                    var calculateRoomPricePromise = loginFactory.securedPostJSON("api/Room/CalculateRoomPrice", RoomPrice);
                    calculateRoomPricePromise.success(function (data) {
                        $scope.Total = data.totalPrice;
                        $scope.payment = {
                            Amount: $scope.remainingAmount(),
                            Method: "CASH"
                        };

                    }).error(function (err) {
                        console.log(err);
                    });
                }

                console.log("PAYMENT.AMOUNT", $scope.remainingAmount());
                setTimeout(function () {
                    $scope.$apply()
                }, 0);

                console.log("FINAL SCOPE ROOM", $scope.Total);
            });

        }
        Init();



        $scope.remainingAmount = function () {
            var total = $scope.Total;
            for (var idx in $scope.RoomExtraServices) {

                total += $scope.RoomExtraServices[idx].Amount;

            }
            //total += $scope.RoomExtraServices.Amount;
            for (var idx in $scope.Payments) {
                total -= $scope.Payments[idx].Amount;

            }
            return total;
        }

        $scope.addPayment = function () {
            if ($scope.confirmDialog) {
                $scope.confirmDialog.destroy();
            }

            var confirm = $mdDialog.confirm()
                .title($filter("translate")("ADD_PAYMENT"))
                .content($filter("translate")("WOULD_YOU_LIKE_TO_ADD_PAYMENT") + " " + $filter("currency")($scope.payment.Amount))
                .ok($filter("translate")("OK"))
                .cancel($filter("translate")("CANCEL"))
                .targetEvent(null);

            $scope.confirmDialog.show(confirm).then(function () {

                console.log("GOT THERE");
                //$scope.dialog(null, local[0]);
                $scope.payment.ReservationRoomId = $scope.currentItem.ReservationRoomId;
                var payment = $scope.payment;
                var keys = ["NOTIFICATION_NEWPAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER"];
                var languageKeys = {};
                for (var idx in keys) {
                    languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
                }

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
                        //Init();
                        $scope.dialog(local[2], local[0], null);
                        dialogService.toast("ADD_PAYMENT_SUCCESSFUL");
                    }
                ).error(
                    function (error) {
                        dialogService.messageBox(error.Message);
                    }
                );

            }, function () {
                console.log("GOT CANCEL");
                $scope.confirmDialog.cancel();
                $scope.dialog(null, local[0]);
            });

        };
        $scope.deletePayment = function (event, payment) {
            if ($scope.confirmDialog) {
                $scope.confirmDialog.destroy();
            }

            var confirm = $mdDialog.confirm()
                .title($filter("translate")("DELETE_PAYMENT"))
                .content($filter("translate")("WOULD_YOU_LIKE_TO_DELETE_PAYMENT"))
                .ok($filter("translate")("OK"))
                .cancel($filter("translate")("CANCEL"))
                .targetEvent(null);


            $scope.confirmDialog.show(confirm).then(function () {
                var promise = loginFactory.securedPostJSON("api/Room/DeletePayment", payment);
                $rootScope.dataLoadingPromise = promise;
                promise.success(
                    function (data) {
                        $scope.Payments = data;
                        $scope.payment.Amount = $scope.remainingAmount();
                        //Init();
                        $scope.dialog(local[2], local[0], null);
                        dialogService.toast("DELETE_PAYMENT_SUCCESSFUL");

                    }
                ).error(
                    function (error) {
                        dialogService.messageBox(error.Message);
                    }
                );
            }, function () {
                $scope.confirmDialog.cancel();
                $scope.dialog(null, local[0]);
            });
        }

        $scope.liveCheckOut = function () {
            if ($scope.confirmDialog) {
                $scope.confirmDialog.destroy();
            }

            var confirm = $mdDialog.confirm()
                .title($filter("translate")("CHECK_OUT"))
                .content($filter("translate")("WOULD_YOU_LIKE_TO_CHECK_OUT?"))
                .ok($filter("translate")("OK"))
                .cancel($filter("translate")("CANCEL"))
                .targetEvent(null);


            $scope.confirmDialog.show(confirm).then(function () {
                var data = {
                    customer: $scope.customer,
                    room: $scope.room
                };

                data.room.DepartureDate = new Date();
                data.room.DepartureTime = new Date(1970, 0, 1, new Date().getHours(), new Date().getMinutes());
                var startDateTemp = ($scope.room.ArrivalDate === null) ? null : $scope.room.ArrivalDate;
                var startTimeTemp = ($scope.room.ArrivalTime === null) ? new Date(1970, 0, 1, 12, 0, 0) : $scope.room.ArrivalTime;
                var endDateTemp = ($scope.room.DepartureDate === null) ? null : $scope.room.DepartureDate;
                var endTimeTemp = ($scope.room.DepartureTime === null) ? new Date(1970, 0, 1, 12, 0, 0) : $scope.room.DepartureTime;

                if ($scope.room.ArrivalDate) {
                    $scope.room.ArrivalDate = new Date($scope.room.ArrivalDate);
                    $scope.room.ArrivalTime = new Date(1970, 0, 1, $scope.room.ArrivalDate.getHours(), $scope.room.ArrivalDate.getMinutes(), 0);
                }
                if ($scope.room.DepartureDate) {
                    $scope.room.DepartureDate = new Date();
                    $scope.room.DepartureTime = new Date(1970, 0, 1, $scope.room.DepartureDate.getHours(), $scope.room.DepartureDate.getMinutes(), 0);
                }

                var RoomPrice = {
                    roomId: $scope.room.RoomId,
                    arrivalDate: $scope.room.ArrivalDate,
                    departureDate: new Date(),
                    adults: $scope.room.Adults,
                    children: $scope.room.Child
                };

                var calculateRoomPricePromise = loginFactory.securedPostJSON("api/Room/CalculateRoomPrice", RoomPrice);
                var save = calculateRoomPricePromise.then(function (datatemp) {
                    data.room.Total = datatemp.data.totalPrice;
                    data.room.Price = datatemp.data.totalPrice;
                    data.room.BookingStatus = "CHECKOUT";
                    $scope.room.Total = datatemp.data.totalPrice;
                    $scope.room.Price = datatemp.data.totalPrice;
                    loginFactory.securedPostJSON("api/Room/Save", data).success(function (id) {
                        $mdDialog.hide(data);
                        if ($scope.showInvoice) {
                            showInvoice(null);
                        }
                        //local[4];
                        /*var button = angular.element(
	document.getElementById("search"));
$timeout(function () {
	button.triggerHandler('click');
}, 0);*/
                        //button.triggerHandler('click');
                        dialogService.toast("CHECK_OUT_SUCCESSFUL");

                        /*$state.transitionTo("walkinReservation", {
                        	reservationRoomId: id
                        });*/
                    }).error(function (data2) {
                        if (data2.Message) {
                            dialogService.messageBox("Error", data2.Message);
                        }
                    });
                });
            });
        }
        $scope.hide = function () {
            $mdDialog.hide();
        };
        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        function showInvoice(ev) {
            //var confirm = dialogService.confirm("CONFIRM", "WOULD_YOU_LIKE_TO_DISPLAY_THIS_ROOM_INVOICE" + "?", ev).then(function () {
            var keys = ["ROOM_MONTHLY", "ROOM_WEEKLY", "ROOM_FULL_DAY", "ROOM_DAY_NIGHT", "ROOM_HOURLY", "MINIBAR", "LAUNDRY", "EXTRA_ROOM_CHARGE", "COMPENSATION", "EXTRA_SERVICES", "FULL_DAY_EARLY_CHECKIN", "FULL_DAY_LATE_CHECKOUT", "DAY_NIGHT_EARLY_CHECKIN", "DAY_NIGHT_LATE_CHECKOUT", "EXTRA_ADULTS", "EXTRA_CHILDREN"];
            var languageKeys = {};
            for (var idx in keys) {
                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
            }

            var CreateRoomInvoiceModel = {
                //roomId : $scope.room.RoomId,
                //reservationRoomId: $stateParams.reservationRoomId,
                roomId: $scope.room.RoomId,
                reservationRoomId: $scope.currentItem.ReservationRoomId,
                arrivalDate: $scope.room.ArrivalDate,
                departureDate: new Date(),
                adults: $scope.room.Adults,
                children: $scope.room.Child,
                languageKeys: languageKeys
            }
            var CreateRoomInvoice = loginFactory.securedPostJSON("api/Room/CreateRoomInvoice", CreateRoomInvoiceModel);
            $rootScope.dataLoadingPromise = CreateRoomInvoice;
            CreateRoomInvoice.success(function (data) {
                $mdDialog.show({
                        controller: InvoiceController,

                        locals: {
                            reservationRoomId: $scope.currentItem.ReservationRoomId
                        },
                        templateUrl: 'views/templates/invoice.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose: false
                    })
                    .then(function (answer) {}, function () {
                        var button = angular.element(
                            document.getElementById("search"));
                        $timeout(function () {
                            button.triggerHandler('click');
                        }, 0);
                    });
            }).error(function (err) {
                console.log(err);
            });

            /*},
function () {

});*/

        };

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

        function InvoiceController($scope, $mdDialog, reservationRoomId) {

            //showInvoice(reservationRoomId);
            globalInvoiceId = reservationRoomId;

            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
        }
    }

    function CancelDialogController($scope, $mdDialog, ReservationRoomId, ReservationNumber, selectedRoom, loginFactory) {
        $scope.warningCancellationFeeInvalid;
        $scope.warningMissingReason;

        function Init() {
            $scope.SendEmail = true;
            $scope.decimal = $rootScope.decimals;
            $scope.ReservationRoomId = ReservationRoomId;
            $scope.ReservationNumber = ReservationNumber;
            $scope.selectedRoom = selectedRoom;
            if ($scope.selectedRoom.Rooms === null) {
                $scope.selectedRoom.RoomName = ''
            } else {
                $scope.selectedRoom.RoomName = $scope.selectedRoom.Rooms.RoomName;
            }
            delete $scope.selectedRoom.Rooms;
            $scope.selectedRoom.roomType = $scope.selectedRoom.RoomTypes;
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
            console.log("SELECTED ROOM 1", $scope.selectedRoom);
            $scope.selectedRoom.TotalDeposit = 0;
            if ($scope.selectedRoom.reservationRoom && $scope.selectedRoom.reservationRoom.PaymentsList && $scope.selectedRoom.reservationRoom.PaymentsList.length > 0) {
                for (var index in $scope.selectedRoom.reservationRoom.PaymentsList) {
                    $scope.selectedRoom.TotalDeposit = $scope.selectedRoom.TotalDeposit + $scope.selectedRoom.reservationRoom.PaymentsList[index].Amount;
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
            console.log("SELECTED ROOM", $scope.selectedRoom);
            $scope.cancelReason = null;
            $scope.cancelFlat = 0;
            $scope.cancelPercentage = 0;
            $scope.warningCancellationFeeInvalid = false;
            $scope.warningMissingReason = false;
        }
        Init();

        $scope.processCancel = function () {

            if (!$scope.cancelReason || $scope.cancelReason.trim() === '') {
                $scope.warningMissingReason = true;
            } else if ($scope.selectedRoom.TotalDeposit > 0 && $scope.selectedRoom.TotalDeposit * $scope.cancelPercentage / 100 + $scope.cancelFlat > $scope.selectedRoom.TotalDeposit) {
                $scope.warningCancellationFeeInvalid = true;
                $scope.warningMissingReason = false;
            } else
            if ($scope.applyCancellationFees && ($scope.cancelFlat + $scope.cancelPercentage === 0)) {
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


    function templateCheckIn(item, result, el) {

        //var currentHotelConnectivities = configFactory.getCurrentHotelConnectivities().resolve();
        //console.log("currentHotelConnectivities - FRONT OFFICE", currentHotelConnectivities);
        //var currentHotelConnectivities = true;
        console.log('currentHotelConnectivities', currentHotelConnectivities);
        if (result.DepartureDate < new Date()) {
            dialogService.messageBox("CAN_NOT_CHECK_IN_DUE_TO_THE_DEPARTURE_DATE_WAS_IN_THE_PAST");
            return;
        }
        if (currentHotelConnectivities.isUsed && result.Rooms.UseLock) {
            $mdDialog.show({
                    controller: CheckInDialogController,
                    resolve: {
                        item: function () {
                            return result;
                        },
                        currentHotelConnectivities: function () {
                            return currentHotelConnectivities;
                        }

                    },
                    templateUrl: 'views/templates/checkInDialog.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: null,
                    clickOutsideToClose: false, //fullscreen: useFullScreen
                })
                .then(function (checkInModel) {
                    // console.log("isCreateCard", checkInModel.isCreateCard);
                    if (checkInModel.isCreateCard === true) {
                        //use NeoLock
                        if ($rootScope.Connectivities != null && $rootScope.Connectivities.code.HotelConnectivityModuleName === "SMART_NEO_LOCK") {
                            var writeCardModel = {
                                RoomName: result.Rooms.RoomName,
                                TravellerName: result.Travellers.Fullname,
                                ArrivalDate: new Date(),
                                DepartureDate: result.DepartureDate,
                                RoomDescription: result.Rooms.RoomDescription,
                                OverrideOldCards: true
                            };
                            frontOfficeFactory.preProcessNoshow(result, result.ReservationRoomId, function (dataNoshow) {
                                var processCheckIn = loginFactory.securedPostJSON("api/Room/ChangeStatus?RRID=" + result.ReservationRoomId + "&status=CHECKIN", "");
                                $rootScope.dataLoadingPromise = processCheckIn;
                                processCheckIn.success(function (data) {
                                    var createCard = smartCardFactory.writeCard(writeCardModel, result.ReservationRoomId, checkInModel.reason);
                                    createCard.then(function (dataCard) {
                                        if (dataCard.passcode != null) {
                                            frontOfficeFactory.processNoshow(result, dataNoshow.roomCharges, result.ReservationRoomId, function () {
                                                dialogService.toastSuccess($filter("translate")("CREATE_CARD_SUCCESSFUL") + " " + dataCard.passcode);
                                                $timeout(function () {
                                                    angular.element(el).triggerHandler('click');
                                                }, 0);
                                            });
                                        } else {
                                            dialogService.messageBox(dataCard.message).then(function (data) {
                                                frontOfficeFactory.processNoshow(result, dataNoshow.roomCharges, result.ReservationRoomId, function () {
                                                    dialogService.toast("CHECKIN_SUCCESSFUL");
                                                    $timeout(function () {
                                                        angular.element(el).triggerHandler('click');
                                                    }, 0);
                                                    // $rootScope.pageInit = true;
                                                });
                                            });
                                        }

                                    }, function () {
                                        dialogService.messageBox(dataCard.message).then(function (data) {
                                            frontOfficeFactory.processNoshow(result, dataNoshow.roomCharges, result.ReservationRoomId, function () {
                                                dialogService.toast("CHECKIN_SUCCESSFUL");
                                                $timeout(function () {
                                                    angular.element(el).triggerHandler('click');
                                                }, 0);
                                                // $rootScope.pageInit = true;
                                            });
                                        });
                                    });
                                }).error(function (err) {
                                    if (err.Message) {
                                        dialogService.messageBox("Error", err.Message).then(function () {
                                            /*$state.go($state.current, {}, {
                                                reload: true
                                            });*/
                                            $timeout(function () {
                                                angular.element(el).triggerHandler('click');
                                            }, 0);
                                        });
                                    } else {
                                        conflictReservationProcess(err);
                                    } //End Else
                                });
                            });
                        } else {
                            dialogService.confirm("PLEASE_BE_SURE_THE_VALID_CARD_IS_BEING_INSERTED").then(function () {
                                var writeCardModel = {
                                    RoomName: result.Rooms.RoomName,
                                    TravellerName: result.Travellers.Fullname,
                                    ArrivalDate: new Date(),
                                    DepartureDate: result.DepartureDate,
                                    OverrideOldCards: true
                                };
                                frontOfficeFactory.preProcessNoshow(result, result.ReservationRoomId, function (dataNoshow) {
                                    var processCheckIn = loginFactory.securedPostJSON("api/Room/ChangeStatus?RRID=" + result.ReservationRoomId + "&status=CHECKIN", "");
                                    $rootScope.dataLoadingPromise = processCheckIn;
                                    processCheckIn.success(function (data) {
                                        var createCard = smartCardFactory.writeCardInWalkin(writeCardModel, result.ReservationRoomId, checkInModel.reason);
                                        createCard.then(function (dataCard) {
                                            if (dataCard.Result !== null && dataCard.Result == 0) {
                                                frontOfficeFactory.processNoshow(result, dataNoshow.roomCharges, result.ReservationRoomId, function () {
                                                    dialogService.toast("CHECKIN_AND_CREATE_CARD_SUCCESSFUL");
                                                    $timeout(function () {
                                                        angular.element(el).triggerHandler('click');
                                                    }, 0);
                                                });
                                            } else {
                                                dialogService.messageBox("UNABLE_TO_CREATE_NEW_CARD").then(function (data) {
                                                    frontOfficeFactory.processNoshow(result, dataNoshow.roomCharges, result.ReservationRoomId, function () {
                                                        dialogService.toast("CHECKIN_SUCCESSFUL");
                                                        $timeout(function () {
                                                            angular.element(el).triggerHandler('click');
                                                        }, 0);
                                                        // $rootScope.pageInit = true;
                                                    });
                                                });
                                            }

                                        }, function () {
                                            dialogService.messageBox("UNABLE_TO_CREATE_NEW_CARD").then(function (data) {
                                                frontOfficeFactory.processNoshow(result, dataNoshow.roomCharges, result.ReservationRoomId, function () {
                                                    dialogService.toast("CHECKIN_SUCCESSFUL");
                                                    $timeout(function () {
                                                        angular.element(el).triggerHandler('click');
                                                    }, 0);
                                                    // $rootScope.pageInit = true;
                                                });
                                            });
                                        });
                                    }).error(function (err) {
                                        if (err.Message) {
                                            dialogService.messageBox("Error", err.Message).then(function () {
                                                /*$state.go($state.current, {}, {
                                                    reload: true
                                                });*/
                                                $timeout(function () {
                                                    angular.element(el).triggerHandler('click');
                                                }, 0);
                                            });
                                        } else {
                                            conflictReservationProcess(err);
                                        } //End Else
                                    });
                                });
                            });
                        }
                    } else {
                        frontOfficeFactory.preProcessNoshow(result, result.ReservationRoomId, function (dataNoshow) {
                            var processCheckIn = loginFactory.securedPostJSON("api/Room/ChangeStatus?RRID=" + result.ReservationRoomId + "&status=CHECKIN", "");
                            $rootScope.dataLoadingPromise = processCheckIn;
                            processCheckIn.success(function (data) {
                                frontOfficeFactory.processNoshow(result, dataNoshow.roomCharges, result.ReservationRoomId, function () {
                                    dialogService.toast("CHECKIN_SUCCESSFUL");
                                    $timeout(function () {
                                        angular.element(el).triggerHandler('click');
                                    }, 0);
                                    // $rootScope.pageInit = true;
                                });
                            }).error(function (err) {
                                if (err.Message) {
                                    dialogService.messageBox("ERROR", err.Message)
                                } else {
                                    conflictReservationProcess(err);
                                };
                            });
                        });
                    }
                });

            function CheckInDialogController($scope, $mdDialog, item, currentHotelConnectivities, loginFactory, dialogService) {
                $scope.isCreateCard = true;

                function Init() {
                    console.log("ITEM CHECK IN ", item);
                    $scope.roomRemarks = item.RoomRemarks;
                    $scope.room = item.Rooms;
                    $scope.currentHotelConnectivities = currentHotelConnectivities;
                    $scope._selectedRoom = item.Rooms;

                    var getCardInfo = loginFactory.securedGet("api/Connectivities/GetCardInfomation", "RRID=" + item.ReservationRoomId + "&roomName=" + $scope.room.RoomName);
                    $rootScope.dataLoadingPromise = getCardInfo;
                    getCardInfo.success(function (data) {
                        if (data !== null && data.length > 0) {
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
                    if ($scope.currentHotelConnectivities === false) {
                        checkInModel.isCreateCard = false;
                    }
                    $mdDialog.hide(checkInModel);
                }
            }
        } else { // NOT USING SMART CARD
            dialogService.confirm("CHECK-IN", "DO_YOU_WANT_TO_CHECKIN", null).then(function () {
                frontOfficeFactory.preProcessNoshow(result, result.ReservationRoomId, function (dataNoshow) {
                    var processCheckIn = loginFactory.securedPostJSON("api/Room/ChangeStatus?RRID=" + result.ReservationRoomId + "&status=CHECKIN", "");
                    $rootScope.dataLoadingPromise = processCheckIn;
                    processCheckIn.success(function (data) {
                        // frontOfficeFactory.preProcessNoshow(result, result.ReservationRoomId, function(){
                        frontOfficeFactory.processNoshow(result, dataNoshow.roomCharges, result.ReservationRoomId, function () {
                            dialogService.toast("CHECKIN_SUCCESSFUL");
                            $timeout(function () {
                                angular.element(el).triggerHandler('click');
                            }, 0);
                            $rootScope.pageInit = true;
                        });
                    }).error(function (err) {
                        if (err.Message) {
                            dialogService.messageBox("ERROR", err.Message)
                        } else {
                            //conflictReservationProcess(err);
                            SharedFeaturesFactory.processConflictReservation(err, result, "CHECKIN");
                        };
                    });
                });
            });
        }


        /*dialogService.confirm("CHECK-IN", "DO_YOU_WANT_TO_CHECKIN", null).then(function () {
        	var processCheckIn = loginFactory.securedPostJSON("api/Room/ChangeStatus?RRID=" + result.ReservationRoomId + "&status=CHECKIN", "");
        	$rootScope.dataLoadingPromise = processCheckIn;
        	processCheckIn.success(function (data) {
        		dialogService.toast("CHECKIN_SUCCESSFUL");
        		$timeout(function () {
        			angular.element(el).triggerHandler('click');
        		}, 0);
        		$rootScope.pageInit = true;
        	}).error(function (err) {
        		if (err.Message) {
        			dialogService.messageBox("ERROR", err.Message)
        		} else {
        			conflictReservationProcess(err);
        		};
        	})
        });*/
    }


}]);