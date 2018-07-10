ezCloud.controller('AmendStayController', ['$scope', '$mdDialog', '$state', 'dialogService', 'AmendStayService', 'EditPastCheckOutTimeService', 'SharedFeaturesFactory', 'loginFactory', '$rootScope', '$filter', 'ConflictReservationService',
    function ($scope, $mdDialog, $state, dialogService, AmendStayService, EditPastCheckOutTimeService, SharedFeaturesFactory, loginFactory, $rootScope, $filter, ConflictReservationService) {
        var nq = this;
        //Nguyen Ngoc Quan - nq
        function Init() {
            nq.user = $rootScope.user;
            nq.currentRoom = SharedFeaturesFactory.getFeatureModel();
            nq.DateTimePickerOption = {
                format: 'dd/MM/yyyy HH:mm',
            };
            nq.DatePickerOption = {
                format: 'dd/MM/yyyy'
            };
            
            nq.PastCheckOutReason = "";
            if (!_.isEmpty(nq.currentRoom.PastCheckOutList)) {
                nq.PastCheckOutReason = nq.currentRoom.PastCheckOutList[0].PastCheckOutReason;
            }
            nq.isShowApplyCheckOutInThePast = true;
            if(nq.currentRoom.BookingStatus == "BOOKED" || nq.currentRoom.BookingStatus == "NOSHOW") nq.isShowApplyCheckOutInThePast = false;
            nq.applyCheckOutInThePast = false;
            nq.CurrentArrivalDate = nq.currentRoom.ArrivalDate;
            nq.newDepartureDate = nq.currentRoom.DepartureDate;
            nq.maxDate = new Date();
            nq.warningMissingReason = false;
            nq.warningInvalidDepartureDate = false;
            nq.warningNumberCustomer = false;
            nq.invalidDate = false;
            nq.adults = 1;
            nq.childs = 0;
            if(nq.currentRoom.calculateAdults) nq.adults = nq.currentRoom.calculateAdults;
            if(nq.currentRoom.calculateChildren) nq.childs = nq.currentRoom.calculateChildren;

            nq.str = new Date(nq.currentRoom.ArrivalDate).format('dd/mm/yyyy HH:MM');
            nq.str2 = new Date(nq.currentRoom.DepartureDate).format('dd/mm/yyyy HH:MM');
            nq.warning = false;
            nq.warningDate = false;
            nq.warningDepartureDate = false;
            nq.arrival = angular.copy(nq.currentRoom.ArrivalDate);
            nq.IsDashboard = nq.currentRoom.IsDashboard || 0;

            var amendStayReservationModel = {
                reservationRoomId: nq.currentRoom.ReservationRoomId,
                arrivalDate: nq.currentRoom.ArrivalDate,
                departureDate: nq.currentRoom.DepartureDate
            };
            var getAmendStayReservations = loginFactory.securedPostJSON("api/Reservation/AmendStayReservations", amendStayReservationModel);
            $rootScope.dataLoadingPromise = getAmendStayReservations;
            getAmendStayReservations.success(function (data) {
                if (data != null) {
                    if (!_.isNull(data.PreviousReservation) && !_.isUndefined(data.PreviousReservation)) nq.previousReservation = data.PreviousReservation;
                    if (!_.isNull(data.NextReservation) && !_.isUndefined(data.NextReservation)) nq.nextReservation = data.NextReservation;
                    if (nq.previousReservation != null) {
                        nq.previousReservation.ArrivalDate = new Date(nq.previousReservation.ArrivalDate);
                        nq.previousReservation.DepartureDate = new Date(nq.previousReservation.DepartureDate);
                    }
                    if (nq.nextReservation != null) {
                        nq.nextReservation.ArrivalDate = new Date(nq.nextReservation.ArrivalDate);
                        nq.nextReservation.DepartureDate = new Date(nq.nextReservation.DepartureDate);
                    }
                }
            }).error(function (err) {
                console.log(err);
            })
            document.getElementById('AmendStayDialog').style.width = "80%";
        }
        Init();

        nq.hide = function () {
            $mdDialog.hide();
        };
        nq.cancel = function () {
            $mdDialog.cancel();
        };
        nq.isCheckChange = function () {
            if (nq.applyCheckOutInThePast == false)
                document.getElementById('AmendStayDialog').style.width = "80%";
            else
                document.getElementById('AmendStayDialog').style.width = "50%";
        }
        nq.editCheckInTime = function () {
            var selectedRoom = angular.copy(nq.currentRoom);
            SharedFeaturesFactory.processEditCheckInTime(selectedRoom);
        }
        nq.saveAmendStay = function () {
            if(nq.currentRoom.ArrivalDate == null||nq.currentRoom.DepartureDate == null){
                nq.invalidDate = true;
                return;
            }
            if (nq.applyCheckOutInThePast == false) {
                if (nq.currentRoom.Adults > 0) {
                    var validAmendment = true;
                    if (nq.currentRoom.ArrivalDate <= nq.currentRoom.DepartureDate) {
                        nq.warningDate = false;
                        var keys = ["NOTIFICATION_WHEN_CHANGE_DATE", "NOTIFICATION_CHANGE_DATE"];
                        var languageKeys = {};
                        for (var idx in keys) {
                            languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
                        }
                        if (nq.currentRoom.DepartureDate < new Date()) {
                            nq.warningDepartureDate = true;
                        } else {
                            var arrivalDateTemp = new Date(nq.currentRoom.ArrivalDate);
                            var departureDateTemp = new Date(nq.currentRoom.DepartureDate);
                            var AmendStayModel = {
                                reservationRoomId: nq.currentRoom.ReservationRoomId,
                                departureDate: nq.currentRoom.DepartureDate,
                                arrivalDate: nq.currentRoom.ArrivalDate,
                                traveller: nq.currentRoom.Travellers.Fullname,
                                roomname: nq.currentRoom.Rooms != null ? nq.currentRoom.Rooms.RoomName : "",
                                roomtype: nq.currentRoom.RoomTypes.RoomTypeCode,
                                adults: nq.currentRoom.Adults,
                                child: nq.currentRoom.Child,
                                languageKeys: languageKeys
                            }

                            AmendStayService.setAmendStayModel(AmendStayModel);
                            AmendStayService.processAmendStay(function (data) {
                                $mdDialog.hide();
                                var result = data;
                                if (result.status == true) {
                                    dialogService.toast("AMEND_STAY_SAVED_SUCCESSFUL");
                                    $state.go($state.current, {}, {
                                        reload: true
                                    });
                                } else {
                                    // if (result.object.message) {
                                    //     dialogService.messageBox("ERROR", result.object.message);
                                    // }
                                    // else conflictReservationProcess(result.object);
                                    // else ConflictReservationService.processConflictReservation(result.object);
                                    // if (result.object.room != null && result.object.room != undefined)
                                    //     ConflictReservationService.processConflictReservation(result.object.room);
                                    // else ConflictReservationService.processConflictReservation(result.object);         
                                    SharedFeaturesFactory.processConflictReservation(result.object,nq.currentRoom,"");
                                }
                            })
                        }
                    } else {
                        nq.warningDate = true;
                    }
                } else if (nq.currentRoom.Adults <= 0 || nq.currentRoom.Adults == undefined) {
                    nq.warningNumberCustomer = true;
                    return;
                }
            } else {
                if (!nq.PastCheckOutReason) {
                    nq.warningMissingReason = true;
                    return;
                }
                if (!nq.newDepartureDate || nq.newDepartureDate.getTime() < nq.CurrentArrivalDate.getTime() || nq.newDepartureDate.getTime() > nq.maxDate.getTime()) {
                    nq.warningInvalidDepartureDate = true;
                    nq.warningMissingReason = false;
                    return;
                }
                var keys = ["ALREADY_APPLY_PAST_CHECKOUT"];
                var languageKeys = {};
                for (var idx in keys) {
                    languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
                }
                nq.languageKeys = languageKeys;
                var checkOutInThePastModel = {
                    ReservationRoomId: nq.currentRoom.ReservationRoomId,
                    ApplyCheckOutInThePast: nq.applyCheckOutInThePast,
                    NewDepartureDate: nq.newDepartureDate,
                    PastCheckOutReason: nq.PastCheckOutReason,
                    languageKeys: nq.languageKeys
                }

                EditPastCheckOutTimeService.setEditPastCheckOutTimeModel(checkOutInThePastModel);
                EditPastCheckOutTimeService.processEditPastCheckOutTime(function (data) {
                    $mdDialog.hide();
                    var result = data;
                    if (result.status == true) {
                        dialogService.toast("EDIT_CHECKIN_TIME_SUCCESSFUL");
                        $state.go($state.current, {}, {
                            reload: true
                        });
                    } else {
                        // if (result.object.message) {
                        //     dialogService.messageBox("ERROR", result.object.message);
                        // }
                        // else conflictReservationProcess(result.object);
                        // else ConflictReservationService.processConflictReservation(result.object);
                        SharedFeaturesFactory.processConflictReservation(result.object,nq.currentRoom,"");
                    }
                });
            }
        }

        nq.saveAmendStayFO = function () {
            if(nq.currentRoom.ArrivalDate == null||nq.currentRoom.DepartureDate == null){
                nq.invalidDate = true;
                return;
            }
            if (nq.applyCheckOutInThePast == false) {
                if (nq.currentRoom.Adults > 0) {
                    var validAmendment = true;
                    if (nq.currentRoom.ArrivalDate <= nq.currentRoom.DepartureDate) {
                        nq.warningDate = false;
                        var keys = ["NOTIFICATION_WHEN_CHANGE_DATE", "NOTIFICATION_CHANGE_DATE"];
                        var languageKeys = {};
                        for (var idx in keys) {
                            languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
                        }
                        if (nq.currentRoom.DepartureDate < new Date()) {
                            nq.warningDepartureDate = true;
                        } else {
                            var arrivalDateTemp = new Date(nq.currentRoom.ArrivalDate);
                            var departureDateTemp = new Date(nq.currentRoom.DepartureDate);
                            var AmendStayModel = {
                                reservationRoomId: nq.currentRoom.ReservationRoomId,
                                departureDate: nq.currentRoom.DepartureDate,
                                arrivalDate: nq.currentRoom.ArrivalDate,
                                traveller: nq.currentRoom.Travellers.Fullname,
                                roomname: nq.currentRoom.Rooms != null ? nq.currentRoom.Rooms.RoomName : "",
                                roomtype: nq.currentRoom.RoomTypes.RoomTypeCode,
                                adults: nq.currentRoom.Adults,
                                child: nq.currentRoom.Child,
                                languageKeys: languageKeys
                            }

                            AmendStayService.setAmendStayModel(AmendStayModel);
                            AmendStayService.processAmendStayFO(function (data) {
                                $mdDialog.hide();
                                var result = data;
                                if (result.status == true) {
                                    dialogService.toast("AMEND_STAY_SAVED_SUCCESSFUL");
                                    // $state.go($state.current, {}, {
                                    //     reload: true
                                    // });
                                } else {
                                    // if (result.object.message) {
                                    //     dialogService.messageBox("ERROR", result.object.message);
                                    // }
                                    // else conflictReservationProcess(result.object);
                                    // else ConflictReservationService.processConflictReservation(result.object);
                                    // if (result.object.room != null && result.object.room != undefined)
                                    //     ConflictReservationService.processConflictReservation(result.object.room);
                                    // else ConflictReservationService.processConflictReservation(result.object);         
                                    SharedFeaturesFactory.processConflictReservation(result.object,nq.currentRoom,"");
                                }
                            })
                        }
                    } else {
                        nq.warningDate = true;
                    }
                } else if (nq.currentRoom.Adults <= 0 || nq.currentRoom.Adults == undefined) {
                    nq.warningNumberCustomer = true;
                    return;
                }
            } else {
                if (!nq.PastCheckOutReason) {
                    nq.warningMissingReason = true;
                    return;
                }
                if (!nq.newDepartureDate || nq.newDepartureDate.getTime() < nq.CurrentArrivalDate.getTime() || nq.newDepartureDate.getTime() > nq.maxDate.getTime()) {
                    nq.warningInvalidDepartureDate = true;
                    nq.warningMissingReason = false;
                    return;
                }
                var keys = ["ALREADY_APPLY_PAST_CHECKOUT"];
                var languageKeys = {};
                for (var idx in keys) {
                    languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
                }
                nq.languageKeys = languageKeys;
                var checkOutInThePastModel = {
                    ReservationRoomId: nq.currentRoom.ReservationRoomId,
                    ApplyCheckOutInThePast: nq.applyCheckOutInThePast,
                    NewDepartureDate: nq.newDepartureDate,
                    PastCheckOutReason: nq.PastCheckOutReason,
                    languageKeys: nq.languageKeys
                }

                EditPastCheckOutTimeService.setEditPastCheckOutTimeModel(checkOutInThePastModel);
                EditPastCheckOutTimeService.processEditPastCheckOutTime(function (data) {
                    $mdDialog.hide();
                    var result = data;
                    if (result.status == true) {
                        dialogService.toast("EDIT_CHECKIN_TIME_SUCCESSFUL");
                        // $state.go($state.current, {}, {
                        //     reload: true
                        // });
                    } else {
                        // if (result.object.message) {
                        //     dialogService.messageBox("ERROR", result.object.message);
                        // }
                        // else conflictReservationProcess(result.object);
                        // else ConflictReservationService.processConflictReservation(result.object);
                        SharedFeaturesFactory.processConflictReservation(result.object,nq.currentRoom,"");
                    }
                });
            }
        }
    }
]);