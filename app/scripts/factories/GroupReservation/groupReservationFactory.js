ezCloud.factory("groupReservationFactory", ['$http', 'loginFactory', '$rootScope', '$mdDialog', 'dialogService', '$q', function ($http, loginFactory, $rootScope, $mdDialog, dialogService, $q) {
    var groupReservationFactory = {
        // Group Reservation
        getSearchInformation: function (callback) {
            var allRoomTypes = loginFactory.securedGet("api/GroupReservation/SearchInformation");
            $rootScope.dataLoadingPromise = allRoomTypes;
            allRoomTypes.success(function (data) {
                rates = data.rates;
                if (callback) callback(data);
            }).error(function (err) {
                console.log(err);
            });
        },
        getGroupInformation: function (callback) {
            var getGroupInformation = loginFactory.securedGet("api/GroupReservation/GetGroupInformation");
            $rootScope.dataLoadingPromise = getGroupInformation;
            getGroupInformation.success(function (data) {
                if (callback) callback(data);
            }).error(function (err) {
                console.log("ERRORRRRR", err);
            });
        },
        GetAvailabilityGroupData: function (search) {
            return AvailabilityGroupDataProcess(search);
        },
        processMegerGroup: function (mergeGroupmodel) {
            return processMerge(mergeGroupmodel);
        },
        processSearchGroupReservation: function (search, callback) {
            var processSearchGroupReservation = loginFactory.securedPostJSON("api/GroupReservation/SearchGroupReservationProcess", search);
            $rootScope.dataLoadingPromise = processSearchGroupReservation;
            processSearchGroupReservation.success(function (data) {
                searchGroupReservationListDataProcess(data);
                if (callback) callback(data);
            }).error(function (err) {
                console.log("ERRORRRRR", err);
                if (callback) callback(err);
            });
        },
        processSearchInHouseGroup: function (search, callback) {
            var processSearchInHouseGroup = loginFactory.securedPostJSON("api/GroupReservation/SearchInHouseGroupProcess", search);
            $rootScope.dataLoadingPromise = processSearchInHouseGroup;
            processSearchInHouseGroup.success(function (data) {
                searchGroupInHouseListDataProcess(data);
                if (callback) callback(data);
            }).error(function (err) {
                console.log("ERRORRRRR", err);
                if (callback) callback(err);
            });
        },
        processSearchDepartedGroup: function (search, callback) {
            var processSearchDepartedGroup = loginFactory.securedPostJSON("api/GroupReservation/SearchDepartedGroupProcess", search);
            $rootScope.dataLoadingPromise = processSearchDepartedGroup;
            processSearchDepartedGroup.success(function (data) {
                searchGroupDepartedListDataProcess(data);
                if (callback) callback(data);
            }).error(function (err) {
                console.log("ERRORRRRR", err);
                if (callback) callback(err);
            });
        },
        // Group Reservation Detail
        getGroupReservationDetail: function (reservationId, callback) {
            var getGroupReservationDetail = loginFactory.securedGet("api/GroupReservation/GetGroupReservationDetailVer2", "reservationId=" + reservationId);
            $rootScope.dataLoadingPromise = getGroupReservationDetail;
            getGroupReservationDetail.success(function (data) {
                var result = resolveGroupReservationData(data);
                console.log("NgocQuan-Group reservation data", result);
                if (callback) {
                    callback(result)
                }
            }).error(function (err) {
                console.log(err);
            });
        },
        processAddReservationToGroup: function (model, callback) {
            var processAddReservationToGroup = loginFactory.securedPostJSON("api/GroupReservation/ProcessAddReservationToGroup", model);
            $rootScope.dataLoadingPromise = processAddReservationToGroup;
            processAddReservationToGroup.success(function (data) {
                // var result = resolveGroupReservationData(data);
                // console.log("result", result);
                if (callback) {
                    callback(data)
                }
            }).error(function (err) {
                console.log(err);
            });
        },
        processSearchReservation: function (search, callback) {
            var processSearchReservation = loginFactory.securedPostJSON("api/GroupReservation/SearchReservationProcess", search);
            $rootScope.dataLoadingPromise = processSearchReservation;
            processSearchReservation.success(function (data) {
                searchReservationListDataProcess(data);
                if (callback) callback(data)
            }).error(function (err) {
                console.log("ERRORRRRR", err);
            });
        },
        SearchMergeGroupProcess: function (search, callback) {
            var SearchMergeGroupProcess = loginFactory.securedPostJSON("api/GroupReservation/SearchMergeGroupProcess", search);
            $rootScope.dataLoadingPromise = SearchMergeGroupProcess;
            SearchMergeGroupProcess.success(function (data) {
                searchReservationListDataProcess(data);
                if (callback) callback(data)
            }).error(function (err) {
                console.log("ERRORRRRR", err);
            });
        },
        ProcessAddNewLeader: function (model, callback) {
            var ProcessAddNewLeader = loginFactory.securedPostJSON("api/GroupReservation/ProcessAddNewLeader", model);
            $rootScope.dataLoadingPromise = ProcessAddNewLeader;
            ProcessAddNewLeader.success(function (data) {
                if (callback) callback(data)
            }).error(function (err) {
                console.log("ERRORRRRR", err);
            });
        },
        ProcessChangeColor: function (model, callback) {
            var ProcessChangeColor = loginFactory.securedPostJSON("api/GroupReservation/EditColor", model);
            $rootScope.dataLoadingPromise = ProcessChangeColor;
            ProcessChangeColor.success(function (data) {
                if (callback) callback(data)
            }).error(function (err) {
                console.log("ERRORRRRR", err);
            });
        },
        ProcessGroupCancel: function (model, callback) {
            var ProcessGroupCancel = loginFactory.securedPostJSON("api/GroupReservation/ProcessGroupCancel", model);
            $rootScope.dataLoadingPromise = ProcessGroupCancel;
            ProcessGroupCancel.success(function (data) {
                if (callback) callback(data)
            }).error(function (err) {
                console.log("ERRORRRRR", err);
            });
        },
        processGetRemainAmount: function (reservationId, reservationRoomIdList, callback) {
            var date = new Date();
            date = date.format("yyyy-mm-dd");
            var processReservation = loginFactory.securedGet("api/GroupReservation/GetRemainAmout", "date=" + date + "&reservationId=" + reservationId + "&reservationRoomIdListJSON=" + JSON.stringify(reservationRoomIdList));
            processReservation.success(function (data) {
                if (callback) callback(data)
                console.info("NEW DATA", data);
            }).error(function (err) {
                console.info(err);
            })
        }
    };

    function resolveGroupReservationData(data) {
        var dataTemp = angular.copy(data);
        var result = {};

        // Group Leader
        result.groupLeader = data.GroupLeader;

        // Stay Information
        result.stayInformation = {};
        result.stayInformation.Arrival = new Date(Math.min.apply(null, data.ReservationRooms.map(function (rr) {
            return new Date(rr.ArrivalDate)
        })));
        result.stayInformation.Departure = new Date(Math.max.apply(null, data.ReservationRooms.map(function (rr) {
            return new Date(rr.DepartureDate)
        })));
        result.stayInformation.totalChildren = data.ReservationRooms.reduce(function (a, b) {
            return a + b.Child;
        }, 0);

        result.stayInformation.totalAdult = data.ReservationRooms.reduce(function (a, b) {
            return a + b.Adults;
        }, 0);

        // Group Summary
        result.groupSummary = {};
        result.groupSummary.totalCharges = data.GroupBalanceDueInfo.reduce(function (a, b) {
            return a + b.Total;
        }, 0);
        result.groupSummary.totalCredits = data.GroupBalanceDueInfo.reduce(function (a, b) {
            return a + b.Paid;
        }, 0);
        result.groupSummary.Balance = data.GroupBalanceDueInfo.reduce(function (a, b) {
            return a + b.Balance;
        }, 0);
        result.groupSummary.Deposit = data.GroupBalanceDueInfo.reduce(function (a, b) {
            return a + b.Deposit;
        }, 0);
        result.groupSummary.Refund = data.GroupBalanceDueInfo.reduce(function (a, b) {
            return a + b.Refund;
        }, 0);
        result.groupSummary.totalCreditsDeposit = result.groupSummary.totalCredits + result.groupSummary.Deposit;

        // Rooms Status
        result.roomsStatus = [];

        var bookedRR = {
            BookingStatus: 'BOOKED',
            Total: _.filter(data.ReservationRooms, function (item) {
                return item.BookingStatus == "BOOKED" && new Date(item.ArrivalDate) > new Date();
            }).length
        };
        result.roomsStatus.push(bookedRR);

        var noShowRR = {
            BookingStatus: 'NOSHOW',
            Total: _.filter(data.ReservationRooms, function (item) {
                return item.BookingStatus == "BOOKED" && new Date(item.ArrivalDate) <= new Date();
            }).length
        };
        result.roomsStatus.push(noShowRR);

        var checkInRR = {
            BookingStatus: 'CHECKIN',
            Total: _.filter(data.ReservationRooms, function (item) {
                return item.BookingStatus == "CHECKIN" && new Date() <= new Date(item.DepartureDate);
            }).length
        };
        result.roomsStatus.push(checkInRR);

        var overDueRR = {
            BookingStatus: 'OVERDUE',
            Total: _.filter(data.ReservationRooms, function (item) {
                return item.BookingStatus == "CHECKIN" && new Date() > new Date(item.DepartureDate);
            }).length
        };
        result.roomsStatus.push(overDueRR);

        var cancelledRR = {
            BookingStatus: 'CANCELLED',
            Total: _.filter(data.ReservationRooms, function (item) {
                return item.BookingStatus == "CANCELLED";
            }).length
        };
        result.roomsStatus.push(cancelledRR);

        var cancelledRR = {
            BookingStatus: 'CHECKOUT',
            Total: _.filter(data.ReservationRooms, function (item) {
                return item.BookingStatus == "CHECKOUT";
            }).length
        };
        result.roomsStatus.push(cancelledRR);

        //countries
        if (data.countries) {
            result.Countries = data.countries;
        }
        //companys
        if (data.companys) {
            result.Companys = data.companys;
        }
        //markets
        if (data.markets) {
            result.Markets = data.markets;
        }
        //source
        if (data.source) {
            result.Source = data.source;
        }

        // Room Information
        result.RoomInformation = data.ReservationRooms;
        for (var index in result.RoomInformation) {
            if (result.RoomInformation[index].Rooms == null) {
                result.RoomInformation[index].Rooms = {
                    RoomName: "N/A"
                };
            }
            var balanceDueInfo = _.filter(data.GroupBalanceDueInfo, function (item) {
                return item.ReservationRoomId == result.RoomInformation[index].ReservationRoomId;
            });
            if (balanceDueInfo != null && balanceDueInfo[0] != null) {
                result.RoomInformation[index].Total = balanceDueInfo[0].Total;
                result.RoomInformation[index].Paid = balanceDueInfo[0].Paid + balanceDueInfo[0].Deposit + balanceDueInfo[0].DepositDelete + balanceDueInfo[0].Refund + balanceDueInfo[0].RefundDelete;
                result.RoomInformation[index].Balance = balanceDueInfo[0].Balance;
                result.RoomInformation[index].Refund = balanceDueInfo[0].Refund;
                result.RoomInformation[index].Deposit = balanceDueInfo[0].Deposit;
            }
            result.RoomInformation[index].ArrivalDate = new Date(result.RoomInformation[index].ArrivalDate);
            result.RoomInformation[index].DepartureDate = new Date(result.RoomInformation[index].DepartureDate);
            for (var index2 in result.RoomInformation[index].ShareList) {
                if (!_.isNull(result.RoomInformation[index].ShareList[index2].CountryId) && !_.isUndefined(result.RoomInformation[index].ShareList[index2].CountryId)) {
                    if (!_.isNull(result.Countries) && !_.isEmpty(result.Countries)) {
                        result.RoomInformation[index].ShareList[index2].Countries = _.find(result.Countries, function (item) {
                            return item['CountryId'] === result.RoomInformation[index].ShareList[index2].CountryId
                        });
                    }
                }
            }
        }

        //MarketingInformation
        if (data.MarketingInformation) {
            result.MarketingInformation = data.MarketingInformation;
        }
        //invoice
        if (data.RoomInvoice) {
            result.RoomInvoice = data.RoomInvoice;
        }
        result.GeneralInfo = data.GeneralInfo;

        var groupPayments = angular.copy(data.GroupPayments);

        //Group Payments
        // var groupPayments = _(_(data.GroupPayments).groupBy('PaymentNumber')).map(function(g, key) {
        //     return {
        //         PaymentNumber: key,
        //         PaymentDescription: g[0].PaymentDetail.PaymentDescription,
        //         Amount: _.filter(g, function(item) {
        //             return item.PaymentDetail.PaymentTypeName != 'DELETED'; }).reduce(function(a, b) {
        //             return a + b.PaymentDetail.Amount;
        //         }, 0),
        //         AmountInSpecificMoney:  _.filter(g, function(item) {
        //             return item.PaymentDetail.PaymentTypeName != 'DELETED'; }).reduce(function(a, b) {
        //             return a + b.PaymentDetail.AmountInSpecificMoney;
        //         }, 0),
        //         MinorUnitInSpecificMoney: _.filter(data.GeneralInfo.CurrenciesISO, function(item){
        //             return item.CurrencyId == _.filter(data.GeneralInfo.Money, function(item2){
        //                         return item2.MoneyId == g[0].PaymentDetail.Money.MoneyId;
        //                     })[0].CurrencyId;
        //         })[0].MinorUnit,
        //         MoneyName: _.filter(data.GeneralInfo.CurrenciesISO, function(item){
        //             return item.CurrencyId == _.filter(data.GeneralInfo.Money, function(item2){
        //                         return item2.MoneyId == g[0].PaymentDetail.Money.MoneyId;
        //                     })[0].CurrencyId;
        //         })[0].AlphabeticCode,
        //         IsPaymentGroupDeleted: _.pluck(g, 'IsPaymentGroupDeleted')[0],
        //         GroupPaymentDetail: g
        //     };
        // });

        // if (groupPayments != null && groupPayments.length > 0) {
        //     for (var index in groupPayments) {
        //         var groupPaymentTemp = groupPayments[index];
        //         var newGroupPaymentDetail = [];
        //         var newPayment = _.filter(groupPaymentTemp.GroupPaymentDetail, function(item) {
        //             return item.PaymentDetail.PaymentTypeName != "DELETED";
        //         });
        //         var deletedPayment = _.filter(groupPaymentTemp.GroupPaymentDetail, function(item) {
        //             return item.PaymentDetail.PaymentTypeName == "DELETED";
        //         });
        //         if (newPayment != null && newPayment.length > 0) {
        //             for (var nIndex in newPayment) {
        //                 if (newPayment[nIndex].PaymentDetail.CreatedDate) {
        //                     newPayment[nIndex].PaymentDetail.CreatedDate = new Date(newPayment[nIndex].PaymentDetail.CreatedDate);
        //                 }
        //                 if (newPayment[nIndex].PaymentDetail.AmountInSpecificMoney != null) {
        //                     var currencyId = _.filter(data.GeneralInfo.Money, function(item){
        //                         return item.MoneyId == newPayment[nIndex].PaymentDetail.Money.MoneyId;
        //                     })[0].CurrencyId;
        //                     for (var curIndex in data.GeneralInfo.CurrenciesISO) {
        //                         if (data.GeneralInfo.CurrenciesISO[curIndex].CurrencyId == currencyId) {
        //                             newPayment[nIndex].MinorUnitInSpecificMoney = data.GeneralInfo.CurrenciesISO[curIndex].MinorUnit;
        //                             newPayment[nIndex].MoneyName = data.GeneralInfo.CurrenciesISO[curIndex].AlphabeticCode
        //                             break;
        //                         }
        //                     }
        //                 }
        //                 for (var dIndex in deletedPayment) {
        //                     if (deletedPayment[dIndex].RefPaymentId && newPayment[nIndex].PaymentId == deletedPayment[dIndex].RefPaymentId) {
        //                         newPayment[nIndex].IsDeleted = true;
        //                         newPayment[nIndex].DeletedUserName = deletedPayment[dIndex].CreatedUserAspNetUsers.Email;
        //                         newPayment[nIndex].DeletedDate = new Date(deletedPayment[dIndex].CreatedDate);
        //                         break;
        //                     }
        //                 }
        //             }
        //             groupPaymentTemp.GroupPaymentDetail = newPayment;
        //         }
        //     }
        // }

        //result.GroupPayments = groupPayments;
        result.GroupPayments = data.GroupPayments;
        return result;
    }

    function searchGroupReservationListDataProcess(data) {
        if (data.GroupReservationList.length > 0) {
            angular.forEach(data.GroupReservationList, function (arr) {
                if (arr.CustomerLeader) {
                    if (arr.CustomerLeader.ArrivalDate)
                        arr.CustomerLeader.ArrivalDate = new Date(arr.CustomerLeader.ArrivalDate);
                    if (arr.CustomerLeader.DepartureDate)
                        arr.CustomerLeader.DepartureDate = new Date(arr.CustomerLeader.DepartureDate);
                    if (arr.CustomerLeader.Reservations && arr.CustomerLeader.Reservations.CreatedDate)
                        arr.CustomerLeader.CreatedDate = new Date(arr.CustomerLeader.Reservations.CreatedDate);
                    if (arr.minArrivalDate)
                        arr.CustomerLeader.minArrivalDate = new Date(arr.minArrivalDate);
                    if (arr.maxDepartureDate)
                        arr.CustomerLeader.maxDepartureDate = new Date(arr.maxDepartureDate);
                };
                var menus = [{
                    name: "EDIT_GROUP",
                    icon: "ic_pageview_24px.svg",
                    url: "groupReservationDetail/" + arr.ReservationId
                }];
                if (arr.IsGroupCancel == false) {
                    menus.push({
                        name: "ADD_NEW_GUEST_TO_GROUP",
                        icon: "ic_add_24px.svg"
                    }, {
                        name: "PRINT_CONFIRMATION",
                        icon: "ic_print_24px.svg"
                    }, {
                        name: "SET_COLOR",
                        icon: "ic_invert_colors_24px.svg",
                        reservationId: arr.ReservationId,
                        color: arr.Color
                    }, {
                        name: "GROUP_CANCEL",
                        icon: "ic_cancel_24px.svg",
                    });
                }
                arr.MenuItems = menus;
            });

            console.log('data group', data);
        }
    }

    function searchGroupInHouseListDataProcess(data) {
        if (data.GroupInhouseList && data.GroupInhouseList.length > 0) {
            angular.forEach(data.GroupInhouseList, function (arr) {
                if (arr.CustomerLeader) {
                    if (arr.CustomerLeader.ArrivalDate)
                        arr.CustomerLeader.ArrivalDate = new Date(arr.CustomerLeader.ArrivalDate);
                    if (arr.CustomerLeader.DepartureDate)
                        arr.CustomerLeader.DepartureDate = new Date(arr.CustomerLeader.DepartureDate);
                    if (arr.CustomerLeader.Reservations && arr.CustomerLeader.Reservations.CreatedDate)
                        arr.CustomerLeader.CreatedDate = new Date(arr.CustomerLeader.Reservations.CreatedDate);
                    if (arr.minArrivalDate)
                        arr.CustomerLeader.minArrivalDate = new Date(arr.minArrivalDate);
                    if (arr.maxDepartureDate)
                        arr.CustomerLeader.maxDepartureDate = new Date(arr.maxDepartureDate);
                };
                var menus = [{
                    name: "EDIT_GROUP",
                    icon: "ic_pageview_24px.svg",
                    url: "groupReservationDetail/" + arr.ReservationId
                }, {
                    name: "ADD_NEW_GUEST_TO_GROUP",
                    icon: "ic_add_24px.svg"
                }, {
                    name: "SET_COLOR",
                    icon: "ic_invert_colors_24px.svg",
                    reservationId: arr.ReservationId,
                    color: arr.Color
                }];
                arr.MenuItems = menus;
            });
        }
    }

    function searchGroupDepartedListDataProcess(data) {
        if (data.GroupDepartedList && data.GroupDepartedList.length > 0) {
            angular.forEach(data.GroupDepartedList, function (arr) {
                if (arr.CustomerLeader) {
                    if (arr.CustomerLeader.ArrivalDate)
                        arr.CustomerLeader.ArrivalDate = new Date(arr.CustomerLeader.ArrivalDate);
                    if (arr.CustomerLeader.DepartureDate)
                        arr.CustomerLeader.DepartureDate = new Date(arr.CustomerLeader.DepartureDate);
                    if (arr.CustomerLeader.Reservations && arr.CustomerLeader.Reservations.CreatedDate)
                        arr.CustomerLeader.CreatedDate = new Date(arr.CustomerLeader.Reservations.CreatedDate);
                    if (arr.minArrivalDate)
                        arr.CustomerLeader.minArrivalDate = new Date(arr.minArrivalDate);
                    if (arr.maxDepartureDate)
                        arr.CustomerLeader.maxDepartureDate = new Date(arr.maxDepartureDate);
                };
                var menus = [{
                    name: "VIEW_DETAIL",
                    icon: "ic_pageview_24px.svg",
                    url: "groupReservationDetail/" + arr.ReservationId
                }];
                arr.MenuItems = menus;
            });
        }
    }

    function AvailabilityGroupDataProcess(search) {
        // var searchGroupModel = {
        //     from: search.From.format("yyyy-mm-dd"),
        //     to: search.To.format("yyyy-mm-dd")
        // };  

        var searchGroupModel = {
            fromDetail: new Date(search.From.getFullYear(), search.From.getMonth(), search.From.getDate(), search.From.getHours(), search.From.getMinutes(), 0, 0),
            toDetail: new Date(search.To.getFullYear(), search.To.getMonth(), search.To.getDate(), search.To.getHours(), search.To.getMinutes(), 0, 0),
            from: search.From.format("yyyy-mm-dd"),
            to: search.To.format("yyyy-mm-dd")
        };

        var deferred = $q.defer();
        var GetAvailabilityGroupData = loginFactory.securedPostJSON("api/GroupReservation/SearchAvailabilityGroup", searchGroupModel);
        $rootScope.dataLoadingPromise = GetAvailabilityGroupData;
        GetAvailabilityGroupData.success(function (data) {
            console.log('GetAvailabilityGroupData', data);
            var listRoomAvailability = [];
            //
            angular.forEach(data.RoomType, function (arr, index) {
                if (search.RoomTypeId != 0 && search.RoomTypeId == arr.RoomTypeId) {
                    listRoomAvailability.push(arr);
                } else if (search.RoomTypeId == 0) {
                    listRoomAvailability.push(arr);
                }
            });

            if (data.RoomAvailability.length > 0 && listRoomAvailability.length > 0) {
                angular.forEach(listRoomAvailability, function (arr) {
                    if (arr.RoomPricesList.length > 0) {
                        arr.RoomPriceId = arr.RoomPricesList[0].RoomPriceId;
                        arr.Price = arr.RoomPricesList[0].FullDayPrice;
                    }
                    arr.Quantity = 0;
                    arr.ArrivalDate = search.From;
                    arr.DepartureDate = search.To;

                    if (arr.DefaultAdults == 0) {
                        arr.DefaultAdults = 1;
                    }
                    arr.RoomAvailability = 0;
                    var roomAvailability = _.filter(data.RoomAvailability, function (item) {
                        return item.RoomTypeId == arr.RoomTypeId;
                    });
                    if (roomAvailability != null && roomAvailability.length > 0) {
                        var minAvailable = _.min(roomAvailability, function (o) {
                            return o.RoomAvailability;
                        });
                        arr.RoomAvailability = Math.min.apply(Math, roomAvailability.map(function (rm) {
                            return rm.AvailableRooms
                        }));
                    }
                    arr.BreakRooms = roomAvailability[0].BreakRooms;
                    /*angular.forEach(data.RoomAvailability, function(arr1, index) {
                        if (arr.RoomTypeId == arr1.RoomTypeId) {
                            if (arr.RoomAvailability == null || arr.RoomAvailability > arr1.CanBeSold) {
                                arr.RoomAvailability = arr1.CanBeSold;
                            }
                        }
                    });*/
                });
            };

            console.log('listRoomAvailability', listRoomAvailability);
            deferred.resolve(listRoomAvailability);
        }).error(function (err) {
            deferred.resolve(-1);
        });
        return deferred.promise;
    }

    function processMerge(mergeGroupmodel) {
        var deferred = $q.defer();
        var processMerge = loginFactory.securedPostJSON("api/GroupReservation/ProcessMergeGroup", mergeGroupmodel);
        $rootScope.dataLoadingPromise = processMerge;
        processMerge.success(function (data) {
            deferred.resolve(1);
        }).error(function (err) {
            deferred.resolve(-1);
            console.log('ERRORRRRR', err);
        });
        return deferred.promise;
    }

    function searchReservationListDataProcess(data) {
        console.log("DATA GET GROUP", data)
        var dataTemp = data;
        dataTemp.reservationRooms = _.filter(dataTemp.reservationRooms, function (item) {
            return (item.BookingStatus === "BOOKED" || item.BookingStatus === "NOSHOW" || item.BookingStatus === "CHECKIN");
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

            // for (var index2 in dataTemp.reservationInfo) {
            //     if (dataTemp.reservationInfo[index2].ReservationRoomId.toString() === reservationRoomTemp.ReservationRoomId.toString()) {
            //         reservationRoomTemp.CheckInUserName = dataTemp.reservationInfo[index2].CheckInUserName;
            //         reservationRoomTemp.CheckOutUserName = dataTemp.reservationInfo[index2].CheckOutUserName;
            //         reservationRoomTemp.CreatedUserName = dataTemp.reservationInfo[index2].CreatedUserName;
            //         reservationRoomTemp.CancelUserName = dataTemp.reservationInfo[index2].CancelUserName;
            //         break;
            //     }
            // }

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
            // var total = 0;
            // if (reservationRoomTemp.PaymentsList) {
            //     for (var index in reservationRoomTemp.PaymentsList) {
            //         total = total + reservationRoomTemp.PaymentsList[index].Amount;
            //     }
            // }
            // console.log("TOTAL", total);
        }

        delete data;
        data = dataTemp;
    }
    return groupReservationFactory;
}]);