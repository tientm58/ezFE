ezCloud.factory("SharedFeaturesFactory", ['$mdDialog', '$state', '$filter', '$mdMedia', 'dialogService', 'selectedRoomFactory', 'CancelService', 'AssignRoomService', 'AmendStayService', 'reservationFactory', 'loginFactory', '$rootScope', 'CopyReservationService', 'ConflictReservationService', 'RoomRepairService', 'smartCardFactory', 'RoomMoveService', 'homeFactory', 'UnassignRoomService', 'EditCheckInTimeService', 'ShowBreakService',
    function ($mdDialog, $state, $filter, $mdMedia, dialogService, selectedRoomFactory, CancelService, AssignRoomService, AmendStayService, reservationFactory, loginFactory, $rootScope, CopyReservationService, ConflictReservationService, RoomRepairService, smartCardFactory, RoomMoveService, homeFactory, UnassignRoomService, EditCheckInTimeService, ShowBreakService) {
        var featureModel = null;
        var baseModel = null;
        var roomMoveNewId = null;
        var roomStatus = null;

        function DialogController($scope, $mdDialog){
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
        };
        var SharedFeaturesFactory = {
            getFeatureModel: function () {
                return featureModel;
            },
            
            setFeatureModel: function (_featureModel) {
                featureModel = _featureModel;
            },

            getBaseModel: function () {
                return baseModel;
            },

            setBaseModel: function (_baseModel) {
                baseModel = _baseModel;
            },

            getRoomMoveNewId: function () {
                return roomMoveNewId;
            },

            setRoomMoveNewId: function (_roomMoveNewId) {
                roomMoveNewId = _roomMoveNewId;
            },

            getRoomStatus: function () {
                return roomStatus;
            },

            setRoomStatus: function (_status){
                roomStatus = _status;
            },

            //done
            processCancel: function (selectedRR) {
                if (selectedRR != null) {
                    var isCancelValid = CancelService.checkValidBeforeCancel();
                    if (isCancelValid == true) {
                        this.setFeatureModel(selectedRR);
                        $mdDialog.show({
                            templateUrl: 'views/sharedFeatures/cancel/cancelDialog.html',
                            targetEvent: event,
                            parent: angular.element(document.body),
                            clickOutsideToClose: false,
                            controller: DialogController
                        }).then(function () {

                        });
                    }
                }
            },
            processCancelDB: function (selectedRR, callback) {
                if (selectedRR != null) {
                    var isCancelValid = CancelService.checkValidBeforeCancel();
                    if (isCancelValid == true) {
                        this.setFeatureModel(selectedRR);
                        $mdDialog.show({
                            templateUrl: 'views/sharedFeatures/cancel/cancelDialog.html',
                            targetEvent: event,
                            parent: angular.element(document.body),
                            clickOutsideToClose: false,
                            controller: DialogController
                        }).then(function () {
                            if(callback) callback();
                        });
                    }
                }
            },
            //in-progess
            processConflictReservation: function (selectedRR, baseRR, status) {
                if (selectedRR != null && baseRR != null) {
                    this.setFeatureModel(selectedRR);
                    this.setBaseModel(baseRR);
                    this.setRoomStatus(status);
                    $mdDialog.show({
                        templateUrl: 'views/sharedFeatures/conflictReservation/conflictReservationDialog.html',
                        targetEvent: event,
                        parent: angular.element(document.body),
                        clickOutsideToClose: true,
                        controller: DialogController
                    }).then(function () {
                        SharedFeaturesFactory.setBaseModel(null);
                        SharedFeaturesFactory.setRoomStatus(null);
                    });
                }
            },
            //done
            processAmendStay: function (selectedRR) {
                if (selectedRR != null) {
                    this.setFeatureModel(selectedRR);
                    $mdDialog.show({
                        templateUrl: 'views/sharedFeatures/amendStay/amendStayDialog.html',
                        targetEvent: event,
                        parent: angular.element(document.body),
                        clickOutsideToClose: true,
                        controller: DialogController
                    }).then(function () {

                    });
                }
            },
            processAmendStayFO: function (selectedRR,callback) {
                if (selectedRR != null) {
                    this.setFeatureModel(selectedRR);
                    $mdDialog.show({
                        templateUrl: 'views/sharedFeatures/amendStay/amendStayDialog.html',
                        targetEvent: event,
                        parent: angular.element(document.body),
                        clickOutsideToClose: true,
                        controller: DialogController
                    }).then(function () {
                        if(callback) callback();
                    });
                }
            },
            //done
            processEditCheckInTime: function (selectedRR) {
                if (selectedRR != null) {
                    this.setFeatureModel(selectedRR);
                    $mdDialog.show({
                        templateUrl: 'views/sharedFeatures/editCheckInTime/editCheckInTimeDialog.html',
                        targetEvent: event,
                        parent: angular.element(document.body),
                        clickOutsideToClose: false,
                        controller: DialogController,
                    }).then(function () {
                        
                    });
                }
            },
            //done
            processEditPastCheckOutTime: function (selectedRR,pastCheckOutReason,applyPastCheckOut) {
                if (selectedRR != null) {
                    if(!selectedRR.PastCheckOutReason) selectedRR.PastCheckOutReason = pastCheckOutReason;
                    if(!selectedRR.ApplyPastCheckOut) selectedRR.ApplyPastCheckOut = applyPastCheckOut;
                    this.setFeatureModel(selectedRR);
                    $mdDialog.show({
                        templateUrl: 'views/sharedFeatures/editPastCheckOutTime/editPastCheckOutTimeDialog.html',
                        targetEvent: event,
                        parent: angular.element(document.body),
                        clickOutsideToClose: false,
                        controller: DialogController,
                    }).then(function () {
                        
                    });
                }
            },
            //done
            processEditPrice: function(priceTemp1,totalPriceTemp,roomChargesTemp,planInfoTemp,priceListTemp){
                var selectedRR = {
                    priceTemp: priceTemp1, 
                    totalPrice: totalPriceTemp,
                    roomCharges: roomChargesTemp,
                    planInfo: planInfoTemp,
                    priceList: priceListTemp
                };
                this.setFeatureModel(selectedRR);
                $mdDialog.show({
                    templateUrl: 'views/sharedFeatures/editPrice/editPriceDialog.html',
                    targetEvent: event,
                    parent: angular.element(document.body),
                    clickOutsideToClose: false,
                    controller: DialogController,
                }).then(function () {
                    
                });
            },
            //done
            processEditNote: function(selectedRR){
                if(selectedRR != null){
                    this.setFeatureModel(selectedRR);
                    $mdDialog.show({
                        templateUrl: 'views/sharedFeatures/editNote/editNoteDialog.html',
                        targetEvent: event,
                        parent: angular.element(document.body),
                        clickOutsideToClose: false,
                        controller: DialogController,
                    }).then(function () {
                        
                    });
                }
            },
            //done
            processAssignRoom: function (selectedRR,callback) {
                if (selectedRR != null) {
                    if (true) {
                        this.setFeatureModel(selectedRR, callback);
                        $mdDialog.show({
                            templateUrl: 'views/sharedFeatures/assignRoom/assignRoomDialog.html',
                            targetEvent: event,
                            parent: angular.element(document.body),
                            clickOutsideToClose: true,
                            controller: DialogController,
                        }).then(function (result) {
                            if(result){
                                if (callback){
                                    callback();
                                }else{
                                    $state.go($state.current, {}, {
                                        reload: true
                                    });
                                }
                            }
                        });
                    }
                }
            },            
            processAssignRoomDashBoard: function (selectedRR,callback) {
                if (selectedRR != null) {
                    if (true) {
                        this.setFeatureModel(selectedRR);
                        $mdDialog.show({
                            templateUrl: 'views/sharedFeatures/assignRoom/assignRoomDialog.html',
                            targetEvent: event,
                            parent: angular.element(document.body),
                            clickOutsideToClose: true,
                            controller: DialogController,
                        }).then(function () {
                            if(callback) callback();
                        });
                    }
                }
            },
            //done
            processCopyReservation: function (selectedRR,item, callback) {
                if (selectedRR != null) {
                    var model = {
                        currentRoom: selectedRR,
                        currentItem: item
                    };
                    this.setFeatureModel(model);
                    var useFullScreen = ($mdMedia('xs') || $mdMedia('sm'));
                    $mdDialog.show({
                        templateUrl: 'views/sharedFeatures/copyReservation/copyReservationDialog.html',
                        targetEvent: event,
                        parent: angular.element(document.body),
                        clickOutsideToClose: false,
                        controller: DialogController,
                        fullscreen: useFullScreen
                    }).then(function () {
                        if(callback) callback();
                    });
                }
            },           
            //done
            processAddExtraService: function (selectRoom,item) {
                if(selectRoom != null){
                    var model = {
                        currentRoom: selectRoom,
                        currentItem: item
                    };
                    this.setFeatureModel(model);
                    var useFullScreen = ($mdMedia('xs') || $mdMedia('sm'));
                    $mdDialog.show({
                        templateUrl: 'views/sharedFeatures/addExtraServices/addExtraServicesDialog.html',
                        targetEvent: event,
                        parent: angular.element(document.body),
                        clickOutsideToClose: false,
                        fullscreen: useFullScreen,
                        controller: DialogController
                    }).then(function () {

                    });
                }
            },
            //done
            processRoomMove: function (selectedRoom, new_room_id) {
                var useFullScreen = ($mdMedia('xs') || $mdMedia('sm'));
                if (new_room_id != null && new_room_id != undefined) this.setRoomMoveNewId(new_room_id);
                else this.setRoomMoveNewId(null);
                if (selectedRoom != null) {
                    this.setFeatureModel(selectedRoom);
                    $mdDialog.show({
                        templateUrl: 'views/sharedFeatures/roomMove/roomMoveDialog.html',
                        targetEvent: event,
                        parent: angular.element(document.body),
                        clickOutsideToClose: false,
                        controller: DialogController,
                        fullscreen: useFullScreen
                    }).then(function () {
                        
                    });
                }
            },
            processRoomMoveDB: function (selectedRoom, new_room_id, callback) {
                var useFullScreen = ($mdMedia('xs') || $mdMedia('sm'));
                if (new_room_id != null && new_room_id != undefined) this.setRoomMoveNewId(new_room_id);
                else this.setRoomMoveNewId(null);
                if (selectedRoom != null) {
                    this.setFeatureModel(selectedRoom);
                    $mdDialog.show({
                        templateUrl: 'views/sharedFeatures/roomMove/roomMoveDialog.html',
                        targetEvent: event,
                        parent: angular.element(document.body),
                        clickOutsideToClose: false,
                        controller: DialogController,
                        fullscreen: useFullScreen
                    }).then(function () {
                        if(callback) callback();
                    });
                }
            },
            //done
            processUndoCheckIn: function (selectedRoom) {
                if (selectedRoom != null) {
                    this.setFeatureModel(selectedRoom);
                    $mdDialog.show({
                        templateUrl: 'views/sharedFeatures/undoCheckIn/undoCheckInDialog.html',
                        targetEvent: event,
                        parent: angular.element(document.body),
                        clickOutsideToClose: false,
                        controller: DialogController,
                    }).then(function () {
                        
                    });
                }
            },
            processUndoCheckInDB: function (selectedRoom, callback) {
                if (selectedRoom != null) {
                    this.setFeatureModel(selectedRoom);
                    $mdDialog.show({
                        templateUrl: 'views/sharedFeatures/undoCheckIn/undoCheckInDialog.html',
                        targetEvent: event,
                        parent: angular.element(document.body),
                        clickOutsideToClose: false,
                        controller: DialogController,
                    }).then(function () {
                        if(callback) callback();
                    });
                }
            },
            //done
            processSetDirtyRoom: function (selectedRoom,callback) {
                var roomId = selectedRoom.RoomId;
                dialogService.confirm("SET_ROOM_DIRTY", "DO_YOU_WANT_TO_SET_THIS_ROOM_DIRTY" + "?").then(function () {
                    var processHouseStatus = loginFactory.securedPostJSON("api/HouseKeeping/ProcessHouseStatusForOnlyRoom?roomId=" + roomId, "");
                    $rootScope.dataLoadingPromise = processHouseStatus;
                    processHouseStatus.success(function () {
                        //$rootScope.$emit("HomeInit", {});
                        dialogService.toast("SET_ROOM_DIRTY_SUCCESSFUL");
                        if(callback) callback();
                    }).error(function (err) {
                        console.log(err);
                    });
                });
            },
            //done
            processClean: function (selectedRoom,callback) {
                var roomId = selectedRoom.RoomId; 
                dialogService.confirm("CLEAN", "DO_YOU_WANT_TO_SET_THIS_ROOM_CLEANED" + "?").then(function () {
                    reservationFactory.changeRoomStatus(roomId, "CLEAN", function (data) {
                        //$rootScope.$emit("HomeInit", {});
                        dialogService.toast("CLEAN_ROOM_SUCCESSFUL");
                        if(callback) callback();
                    });
                });
            },
            //done
            processUnassignRoom: function (selectedRoom, callback) {
                dialogService.confirm("UNASSIGN_ROOM_CONFIRM", "DO_YOU_WANT_TO_UNASSIGN_ROOM_THIS_RESERVATION").then(function () {
                    var unassignRoomPromise = loginFactory.securedPostJSON("api/Room/ProcessUnassignRoom?RRID=" + selectedRoom.ReservationRoomId, "")
                    $rootScope.dataLoadingPromise = unassignRoomPromise;
                    unassignRoomPromise.success(function (data) {
                        dialogService.toast("UNASSIGN_ROOM_SUCCESSFUL");
                        if (callback){
                            callback();
                        }else{
                            $state.go($state.current, {}, {
                                reload: true
                            });
                        }
                    }).error(function (err) {
                        dialogService.messageBox("ERROR", err);
                    })
                });
            },

            processUnassignRoomDB: function (selectedRoom, callback) {
                dialogService.confirm("UNASSIGN_ROOM_CONFIRM", "DO_YOU_WANT_TO_UNASSIGN_ROOM_THIS_RESERVATION").then(function () {
                    var unassignRoomPromise = loginFactory.securedPostJSON("api/Room/ProcessUnassignRoom?RRID=" + selectedRoom.ReservationRoomId, "")
                    $rootScope.dataLoadingPromise = unassignRoomPromise;
                    unassignRoomPromise.success(function (data) {
                        dialogService.toast("UNASSIGN_ROOM_SUCCESSFUL");
                        // $state.go($state.current, {}, {
                        //     reload: true
                        // });
                        if(callback) callback();
                    }).error(function (err) {
                        dialogService.messageBox("ERROR", err);
                    })
                });
            },

            processCreateCard: function (currentHotelConnectivities, selectRoom) {
                var hourAddToCheckOut = null;
                if (currentHotelConnectivities.IsAutomaticalAddHourCheckout == true) {
                    hourAddToCheckOut = currentHotelConnectivities.HourAddToCheckout;
                };
                smartCardFactory.createCard(selectRoom, hourAddToCheckOut);
            },

            processPreCheckOut: function (selectedRoom, callback) {
                var keys = ["RES_NO", "ROOM", "NOTIFICATION_PRE_CHẸCKOUT", "NOTIFICATION_PRE_CHẸCKIN", "THIS_ROOM_EXTRA_SERVICE_WAS_DELETED_AUTOMATICALLY_BY_THE_PRE_CHECKIN_PROCESS", "THIS_ROOM_EXTRA_SERVICE_ITEM_WAS_DELETED_AUTOMATICALLY_BY_THE_PRE_CHECKIN_PROCESS", "THIS_PAYMENT_WAS_DELETED_AUTOMATICALLY_BY_THE_PRE_CHECKIN_PROCESS"];
                var languageKeys = {};
                for (var idx in keys) {
                    languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
                }
                $mdDialog.show({
                    controller: ChangeReservationStatusDialogController,
                    resolve: {
                        action: function () {
                            return "PRE_CHECKOUT";
                        }
                    },
                    templateUrl: 'views/templates/changeReservationStatus.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                }).then(function (reason) {
                    var PreCheckOutModel = {
                        RRID: selectedRoom.ReservationRoomId,
                        ActionCode: "PRE_CHECKOUT",
                        Reason: reason,
                        languageKeys: languageKeys
                    }
                    var preCheckInProcess = loginFactory.securedPostJSON("api/Room/ProcessChangeReservationStatus", PreCheckOutModel);
                    $rootScope.dataLoadingPromise = preCheckInProcess;
                    preCheckInProcess.success(function (data) {
                        dialogService.toast("PRE_CHECKOUT_SUCCESSFUL");
                        if (callback) callback();
                    }).error(function (err) {
                        if (err.Message) {
                            dialogService.messageBox("ERROR", err.Message)
                        } else {
                            SharedFeaturesFactory.processConflictReservation(err,selectedRoom);
                        };
                    })
                }, function () {});


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

            processAddRoomRepair: function (model, callback) {
                // RoomRepairService.setRoomRepairModel(model.roomRepair);
                RoomRepairService.setRoomRepairsModel(model.roomRepairs);
                RoomRepairService.setCurrentRoom(model.currentRoom);
                $mdDialog.show({
                    controller: DialogController,
                    templateUrl: 'views/sharedFeatures/roomRepair/addRoomRepairDialog.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: false,
                    // targetEvent: event,
                }).then(function (data) {
                    if (callback) callback();
                }, function () {});
            },

            processEditRoomRepair: function (model, callback) {
                RoomRepairService.setRoomRepairModel(model.roomRepair);
                RoomRepairService.setRoomRepairsModel(model.roomRepairs);
                RoomRepairService.setCurrentRoom(model.currentRoom);
                $mdDialog.show({
                    controller: DialogController,
                    templateUrl: 'views/sharedFeatures/roomRepair/editRoomReapairDialog.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: false,
                    targetEvent: event,
                }).then(function (data) {
                    if (callback) callback();
                }, function () {});
            },

            getBookingList: function (selectedRoom) {
                $mdDialog.show({
                    controller: ShowReservationListController,
                    resolve: {
                        selectedRoom: function () {
                            return selectedRoom;
                        },
                    },
                    templateUrl: 'views/templates/reservationList.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                }).then(function () {

                }, function () {

                });

                function ShowReservationListController($scope, $mdDialog, selectedRoom, loginFactory) {
                    function Init() {
                        $scope.selectedRoom = selectedRoom;
                    }
                    Init();
                    $scope.hide = function () {
                        $mdDialog.hide();
                    };
                    $scope.cancel = function () {
                        $mdDialog.cancel();
                    };
                }
            },

            CheckTimeRangeConflict: function (start_1, end_1, start_2, end_2) {
                return (start_1 < end_2 && start_2 <= end_1);
            },

            processShowUnassignRoom: function(unassignRoomModel,callback){
                UnassignRoomService.setUnassignRoomsModel({
                            callback: callback,
                            unassignRoomModel: unassignRoomModel});
                $mdDialog.show({
                    controller: DialogController,
                    templateUrl: 'views/sharedFeatures/unassignRoom/unassignRoomDialog.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: false
                }).then(function () { 
                }, function () {
                    
                });
            },

            processShowBreak: function (showBreakModel, callback) {
                ShowBreakService.setBreakModel(showBreakModel);
                $mdDialog.show({
                    controller: DialogController,
                    templateUrl: 'views/sharedFeatures/showBreak/showBreakRoomDialog.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: false
                }).then(function () {
                    if (callback) callback();
                }, function () {

                });
            },

            processCancelUR:function(selectedRR, callback){
                if (selectedRR ) {
                    var isCancelValid = CancelService.checkValidBeforeCancel();
                    if (isCancelValid == true) {
                        this.setFeatureModel(selectedRR);
                        $mdDialog.show({
                            templateUrl: 'views/sharedFeatures/cancel/cancelDialog.html',
                            targetEvent: event,
                            parent: angular.element(document.body),
                            clickOutsideToClose: false,
                            controller: CancelURController
                        }).then(function () {
                            if (callback) callback();
                        }, function () {
                        });
                    }
                };
                function CancelURController($scope,$mdDialog,UnassignRoomService,SharedFeaturesFactory){
                    var unassignRoomsModel = UnassignRoomService.getUnassignRoomsModel();
                    $scope.cancelCallback = function(cancelModel){
                        if(cancelModel){
                            $scope.hide();
                            for(var i =0; i < unassignRoomsModel.unassignRoomList.length; i++){
                                var ur = unassignRoomsModel.unassignRoomList[i];
                                if(ur.ReservationRoomId == cancelModel.ReservationRoomId){
                                    unassignRoomsModel.unassignRoomList.splice(i,1);
                                    break;
                                }
                            }
                        }else{
                            $scope.cancel();
                        }
                        showUnassignRoomDialog();
                    }
                    function showUnassignRoomDialog(){
                        if(unassignRoomsModel && unassignRoomsModel.unassignRoomList.length > 0){
                            SharedFeaturesFactory.processShowUnassignRoom(unassignRoomsModel,function(){
                                ezSchedule.reload_data();
                            });
                        }else{
                            ezSchedule.reload_data();
                        }
                    }
                    $scope.hide = function () {
                        $mdDialog.hide();
                    };
                    $scope.cancel = function () {
                        $mdDialog.cancel();
                    };
                };
            },

            processAssignRoomUR:function(selectedRR,callback){
                if (selectedRR ) {
                    this.setFeatureModel(selectedRR);
                    $mdDialog.show({
                        templateUrl: 'views/sharedFeatures/assignRoom/assignRoomDialog.html',
                        targetEvent: event,
                        parent: angular.element(document.body),
                        clickOutsideToClose: false,
                        controller: AssignRoomURController,
                    }).then(function () {
                        if (callback) {
                            callback();
                        }
                    });
                }

                function AssignRoomURController($scope, $mdDialog) {
                    var unassignRoomsModel = UnassignRoomService.getUnassignRoomsModel();
                    $scope.assignRoomCallback = function(assignRoomModel){
                        if(assignRoomModel){
                            $scope.hide();
                            for(var i =0; i < unassignRoomsModel.unassignRoomList.length; i++){
                                var ur = unassignRoomsModel.unassignRoomList[i];
                                if(ur.ReservationRoomId == assignRoomModel.ReservationRoomId){
                                    unassignRoomsModel.unassignRoomList.splice(i,1);
                                    break;
                                }
                            }
                        }else{
                            $scope.cancel();
                        }
                        showUnassignRoomDialog();
                    };
                    function showUnassignRoomDialog(){
                        if(unassignRoomsModel && unassignRoomsModel.unassignRoomList.length > 0){
                            SharedFeaturesFactory.processShowUnassignRoom(unassignRoomsModel,function(){
                                ezSchedule.reload_data();
                            });
                        }else{
                            ezSchedule.reload_data();
                        }
                        
                    };
                    
                    $scope.hide = function () {
                        $mdDialog.hide();
                    };
                    $scope.cancel = function () {
                        $mdDialog.cancel();
                    };
                }
            },

            processAmendStayUR:function(selectedRR,callback){
                if (selectedRR ) {
                    this.setFeatureModel(selectedRR);
                    $mdDialog.show({
                        templateUrl: 'views/sharedFeatures/amendStay/amendStayDialog.html',
                        targetEvent: event,
                        parent: angular.element(document.body),
                        clickOutsideToClose: false,
                        controller: AmendStayURController
                    }).then(function () {
                        if (callback) {
                            callback();
                        }
                    });
                }

                function AmendStayURController($scope, $mdDialog) {
                    var unassignRoomsModel = UnassignRoomService.getUnassignRoomsModel();
                    $scope.amendStayCallback = function(amendStayModel){
                        if(amendStayModel){
                            $scope.hide();
                            for(var i =0; i < unassignRoomsModel.unassignRoomList.length; i++){
                                var ur = unassignRoomsModel.unassignRoomList[i];
                                if(ur.ReservationRoomId == amendStayModel.reservationRoomId){
                                    ur.ArrivalDate = new Date(amendStayModel.arrivalDate);
                                    ur.DepartureDate = new Date(amendStayModel.departureDate);
                                    ur.Adults = amendStayModel.adults;
                                    ur.Child = amendStayModel.child;
                                    break;
                                }
                            }
                        }else{
                            $scope.cancel();
                        }
                        showUnassignRoomDialog();
                    };
                    function showUnassignRoomDialog(){
                        SharedFeaturesFactory.processShowUnassignRoom(unassignRoomsModel,function(){
                            ezSchedule.reload_data();
                        });
                    };
                    $scope.hide = function () {
                        $mdDialog.hide();
                    };
                    $scope.cancel = function () {
                        $mdDialog.cancel();
                    };
                }
            }
            
        };
        return SharedFeaturesFactory;
    }
]);