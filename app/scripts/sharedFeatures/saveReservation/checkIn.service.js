ezCloud.factory("CheckInService", ['loginFactory', 'walkInFactory', 'dialogService', '$stateParams', '$rootScope', '$state', 'ConflictReservationService', function(loginFactory, walkInFactory, dialogService, $stateParams, $rootScope, $state, ConflictReservationService) {
    var CheckInService = {
        checkValidBeforeCheckIn: function(saveReservationModel) {
            //var valid = false;
            if (saveReservationModel != null){
                if (saveReservationModel.room != null){
                    if (saveReservationModel.room.DepartureDate < new Date()) {
                        dialogService.messageBox("CAN_NOT_CHECK_IN_DUE_TO_THE_DEPARTURE_DATE_WAS_IN_THE_PAST");
                        return;
                    }

                    if (typeof(saveReservationModel.room.DiscountFlat) == undefined || typeof(saveReservationModel.room.DiscountPercentage) == undefined) {

                        dialogService.messageBox("DISCOUNT_INVALID", "THE_TOTAL_OF_DISCOUNT_INVALID");
                        saveReservationModel.room.DiscountFlat = 0;
                        return;
                    }


                    if (!saveReservationModel.room.RoomId || parseInt(saveReservationModel.room.RoomId) == 0) {
                        dialogService.messageBox("MISSING_ROOM", "PLEASE_SELECT_A_ROOM_TO_PERFORM_CHECKIN_ACTION");
                        return;
                    }

                    if (!saveReservationModel.room.RoomPriceId) {
                        dialogService.messageBox("MISSING_ROOM_PRICE", "PLEASE_SELECT_A_ROOM_PRICE_TYPE_TO_PERFORM_RESERVE_ACTION");
                        return;
                    }
                    if (!saveReservationModel.room.RoomPriceId) {
                        dialogService.messageBox("MISSING_RATE", "PLEASE_SELECT_A_PRICE_RATE_TO_PERFORM_CHECKIN_ACTION");
                        return;
                    }

                    if (saveReservationModel.room.ArrivalDate > saveReservationModel.room.DepartureDate) {
                        dialogService.messageBox("INVALID_ARRIVAL/DEPARTURE_DATE", "PLEASE_SELECT_A_VALID_DATE_TO_PERFORM_CHECKIN_ACTION");
                        return;
                    }
                }
                if (saveReservationModel.customer != null){
                    if (!saveReservationModel.customer.Fullname) {
                        dialogService.messageBox("MISSING_CUSTOMER", "PLEASE_CREATE_NEW_OR_CHOOSE_AT_LEAST_ONE_CUSTOMER_TO_PERFORM_CHECKIN_ACTION");
                        return;
                    }
                    if (saveReservationModel.customer.Fullname.length > 50) {
                        dialogService.messageBox("WARNING", "FULLNAME_LENGTH_MUST_NOT_BIGGER_(50)_CHARACTERS_TO_PERFORM_CHECKIN_ACTION");
                        return;
                    }
                }
            }

            return true;
        },
        checkInTemplate: function(saveReservationModel){
            checkInTemplateFunction(saveReservationModel);
        }

    };
    return CheckInService;

    function checkInTemplateFunction(saveReservationModel) {
        var data                   = angular.copy(saveReservationModel);
        var currentStatus          = angular.copy(data.room.BookingStatus);
        data.room.ArrivalDate      = new Date();
        data.room.BookingStatus    = "CHECKIN";
        currentHotelConnectivities = walkInFactory.getCurrentHotelConnectivities();

        if (currentHotelConnectivities.isUsed) {
            $mdDialog.show({
                    controller: CheckInDialogController,
                    resolve: {
                        data: function() {
                            return data;
                        },
                        currentHotelConnectivities: function() {
                            return vm.currentHotelConnectivities;
                        }
                    },
                    templateUrl: 'views/templates/checkInDialog.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: null,
                    clickOutsideToClose: false, //fullscreen: useFullScreen
                })
                .then(function(checkInModel) {
                    if (checkInModel.isCreateCard == true) {
                        dialogService.confirm("PLEASE_BE_SURE_THE_VALID_CARD_IS_BEING_INSERTED").then(function() {
                            var writeCardModel = {
                                RoomName: vm.RoomName,
                                TravellerName: data.customer.Fullname,
                                ArrivalDate: data.room.ArrivalDate,
                                DepartureDate: data.room.DepartureDate,
                                OverrideOldCards: true
                            };
                            if (currentHotelConnectivities.IsAutomaticalAddHourCheckout == true) {
                                writeCardModel = smartCardFactory.addHourCheckOutCard(writeCardModel, vm.currentHotelConnectivities.HourAddToCheckout);
                            }
                            var save = loginFactory.securedPostJSON("api/Room/Save", data);
                            $rootScope.dataLoadingPromise = save;
                            save.success(function(id) {
                                var createCard = smartCardFactory.writeCard(writeCardModel, id, checkInModel.reason);
                                createCard.then(function(dataCard) {
                                    if (dataCard.Result != null && dataCard.Result == 0) {
                                        dialogService.toast("CHECKIN_AND_CREATE_CARD_SUCCESSFUL");
                                        $state.go("reservation", {
                                            reservationRoomId: id
                                        }, {
                                            reload: true
                                        });

                                    } else {
                                        $state.go("reservation", {
                                            reservationRoomId: id
                                        }, {
                                            reload: true
                                        });
                                    }
                                }, function() {
                                    if ($rootScope.writeCardError == true) {
                                        $state.go("reservation", {
                                            reservationRoomId: id
                                        }, {
                                            reload: true
                                        });

                                    }
                                });
                            }).error(function(err) {
                                if (err.Message) {
                                    dialogService.messageBox("ERROR", err.Message);
                                } else {
                                    ConflictReservationService.processConflictReservation(err);
                                } //End Else

                            });
                        });
                    } else {
                        var save = loginFactory.securedPostJSON("api/Room/Save", data);
                        $rootScope.dataLoadingPromise = save;
                        save.success(function(id) {
                            dialogService.toast("CHECKIN_SUCCESSFUL");
                            $state.go("reservation", {
                                reservationRoomId: id
                            }, {
                                reload: true
                            });
                        }).error(function(err) {
                            if (err.Message) {
                                dialogService.messageBox("ERROR", err.Message);
                            } else {
                                conflictReservationProcess(err);
                            } //End Else

                        });
                    }
                });

            function CheckInDialogController($scope, $mdDialog, data, currentHotelConnectivities, loginFactory, dialogService) {
                $scope.isCreateCard = true;

                function Init() {
                    $scope.roomRemarks = data.roomRemarks;
                    $scope.room = data.room;
                    $scope.currentHotelConnectivities = currentHotelConnectivities;
                    if ($scope.room.ReservationRoomId) {
                        var getCardInfo = loginFactory.securedGet("api/Connectivities/GetCardInfomation", "RRID=" + $scope.room.ReservationRoomId + "&roomName=" + $scope.room.RoomName);
                        $rootScope.dataLoadingPromise = getCardInfo;
                        getCardInfo.success(function(data) {
                            if (data != null && data.length > 0) {
                                $scope.isCreateCard = false;
                                $scope.isCardExist = true;
                                $scope.cardInfo = data;
                                for (var index in $scope.cardInfo) {
                                    if ($scope.cardInfo[index].CreatedDate) {
                                        $scope.cardInfo[index].CreatedDate = new Date(vm.cardInfo[index].CreatedDate);
                                    }
                                }
                                $scope.cardInfo.sort(function(a, b) {
                                    return a.CreatedDate - b.CreatedDate;
                                });
                            }
                        }).error(function(err) {
                            console.log(err);
                        });
                    } else {}
                    $scope.reason = null;
                }
                Init();
                $scope.hide = function() {
                    $mdDialog.hide();
                };
                $scope.cancel = function() {
                    $mdDialog.cancel();
                };

                $scope.processCheckIn = function() {
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
        } else { // NOT USING SMART CARD
            var save = loginFactory.securedPostJSON("api/Room/Save", data);
            $rootScope.dataLoadingPromise = save;
            save.success(function(id) {
                dialogService.toast("CHECKIN_SUCCESSFUL");
                $state.go("reservation", {
                    reservationRoomId: id
                }, {
                    reload: true
                });

            }).error(function(err) {
                if (err.Message) {
                    dialogService.messageBox("ERROR", err.Message).then(function() {
                        $state.go($state.current, {}, {
                            reload: true
                        });

                    });
                } else {
                    ConflictReservationService.processConflictReservation(err);
                } //End Else
            });
        }

    }
}]);
