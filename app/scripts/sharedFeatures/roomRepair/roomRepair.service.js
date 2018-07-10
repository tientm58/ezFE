ezCloud.factory("RoomRepairService", ['loginFactory', 'dialogService', '$stateParams', '$rootScope', '$state','$mdDialog','ConflictReservationService','ConflictFeaturesFactory', function(loginFactory, dialogService, $stateParams, $rootScope, $state,$mdDialog,ConflictReservationService,ConflictFeaturesFactory) {
    var roomRepairModel = null;
    var originalRoomRepair = null;
    var currentRoom = null;
    var roomRepairsModel = [];
    var result = null;
    function buildResultModel(){
        result = {
            IsValid:true,
            Warning:{
                DateNull:false,
                DateInvalid:false,
                DateCurrentTime:false,
                Reason:false,
                Conflic:false,
                DataNull:false
            }
        };
    };
    function checkTimeRangeConflict(start_1, end_1, start_2, end_2) {
        return (start_1 < end_2 && start_2 <= end_1);
    };
    var roomRepairService = {
        setOriginalRoomRepair: function(_originalRoomRepair){
            originalRoomRepair = angular.copy(_originalRoomRepair);
        },
        setCurrentRoom : function(_currentRoom){
            currentRoom = _currentRoom;
        },
        getCurrentRoom: function(){
            return currentRoom;
        },
        setRoomRepairModel : function(_roomRepairModel){
            roomRepairModel = _roomRepairModel;
        },
        getRoomRepairModel: function(){
            return roomRepairModel;
        },
        setRoomRepairsModel:function(_roomRepairsModel){
           roomRepairsModel = _roomRepairsModel;
        },
        getRoomRepairsModel: function(){
            return roomRepairsModel;
        },
        checkValidBeforeAddRoomRepair:function(roomRepairs){
            buildResultModel();
            if(!roomRepairModel){
                result.IsValid = false;
                result.Warning.DataNull = false;
                return result;
            };

            if (roomRepairModel.RepairStartDate == null || roomRepairModel.RepairEndDate == null) {
                result.IsValid = false;
                result.Warning.DateNull = true;
                return result;
            }
            var RepairStartDateTemp = new Date(roomRepairModel.RepairStartDate.getFullYear(), roomRepairModel.RepairStartDate.getMonth(), roomRepairModel.RepairStartDate.getDate());
            var RepairEndDateTemp = new Date(roomRepairModel.RepairEndDate.getFullYear(), roomRepairModel.RepairEndDate.getMonth(), roomRepairModel.RepairEndDate.getDate());
            var newDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
            if (RepairStartDateTemp < newDate || RepairEndDateTemp < newDate) {
                result.IsValid = false;
                result.Warning.DateCurrentTime = true;
                return result;
            }

            if (roomRepairModel.RepairStartDate > roomRepairModel.RepairEndDate) {
                result.IsValid = false;
                result.Warning.DateInvalid = true;
                return result;
            }

            if (!roomRepairModel.RepairReason || roomRepairModel.RepairReason.trim() == '') {
                result.IsValid = false;
                result.Warning.Reason = true;
                return result;
            }
            for (var index in roomRepairs) {
                if (checkTimeRangeConflict(roomRepairs[index].RepairStartDate, roomRepairs[index].RepairEndDate, roomRepairModel.RepairStartDate, roomRepairModel.RepairEndDate) && roomRepairs[index].IsDeleted === false) {
                    result.IsValid = false;
                    result.Warning.Conflict = true;
                    return result;
                }
            }

            return result;
        },
        checkValidBeforeEditRoomRepair:function(roomRepairs){
            buildResultModel();
            if(!roomRepairModel){
                result.IsValid = false;
                result.Warning.DataNull = true;
                return result;
            }
            if (roomRepairModel.RepairStartDate == null || roomRepairModel.RepairEndDate == null) {
                result.IsValid = false;
                result.Warning.DateNull = true;
                return result;
            }
            var originalRepairStartDate = new Date(originalRoomRepair.RepairStartDate.getFullYear(), originalRoomRepair.RepairStartDate.getMonth(), originalRoomRepair.RepairStartDate.getDate());
            var RepairStartDateTemp = new Date(roomRepairModel.RepairStartDate.getFullYear(), roomRepairModel.RepairStartDate.getMonth(), roomRepairModel.RepairStartDate.getDate());
            var RepairEndDateTemp = new Date(roomRepairModel.RepairEndDate.getFullYear(), roomRepairModel.RepairEndDate.getMonth(), roomRepairModel.RepairEndDate.getDate());
            var newDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
            //
            if (originalRepairStartDate < newDate){
                if (RepairEndDateTemp < newDate) {
                    result.IsValid = false;
                    result.Warning.DateCurrentTime = true;
                    return result;
                }
            }
            else{
                if (RepairStartDateTemp < newDate || RepairEndDateTemp < newDate) {
                    result.IsValid = false;
                    result.Warning.DateCurrentTime = true;
                    return result;
                }
            }
            //
            if (roomRepairModel.RepairStartDate > roomRepairModel.RepairEndDate) {
                result.IsValid = false;
                result.Warning.DateInvalid = true;
                return result;
            }
            if (!roomRepairModel.RepairReason || roomRepairModel.RepairReason.trim() == '') {
                result.IsValid = false;
                result.Warning.Reason = true;
                return result;
            }
            
            for (var index in roomRepairs) {
                if (checkTimeRangeConflict(roomRepairs[index].RepairStartDate, roomRepairs[index].RepairEndDate, roomRepairModel.RepairStartDate, roomRepairModel.RepairEndDate) && roomRepairs[index].RoomRepairId != roomRepairModel.RoomRepairId && roomRepairs[index].IsDeleted === false) {
                    result.IsValid = false;
                    result.Warning.Conflict = true;
                    return result;
                }
            }
            return result;
        },
        processAddRoomRepairService: function(callback){
            if(roomRepairModel){
                var addRoomRepair = loginFactory.securedPostJSON("api/Config/Rooms/AddRoomRepair", roomRepairModel);
                $rootScope.dataLoadingPromise = addRoomRepair;
                addRoomRepair.success(function (data) {
                    if(data){
                        dialogService.toast("ADD_ROOM_REPAIR_SUCCESSFUL");
                        if(callback) callback();
                    }
                }).error(function (err) {
                    if (err.Meassage) {
                        dialogService.messageBox("result", err.Message).then(function () {
                            $state.go($state.current, {}, {
                                reload: true
                            });
                        });
                    }else {
                        ConflictReservationService.processConflictReservation(err);          
                    };
                });
            }
        },
        processEditRoomRepairService: function(callback){
            if(roomRepairModel){
                var editRoomPrice = loginFactory.securedPostJSON("api/Config/Rooms/EditRoomRepair", roomRepairModel);
                $rootScope.dataLoadingPromise = editRoomPrice;
                editRoomPrice.success(function (data) {
                    if (data) {
                        dialogService.toast("EDIT_ROOM_REPAIR_SUCCESSFUL");
                        if(callback) callback();
                    }
                }).error(function (err) {
                     if (err.Meassage) {
                        dialogService.messageBox("result", err.Message).then(function () {
                            $state.go($state.current, {}, {
                                reload: true
                            });
                        });
                    }else {
                        //ConflictReservationService.processConflictReservation(err);
                        ConflictFeaturesFactory.processConflictReservation(err,roomRepairModel, "REPAIR");
                    };
                });
            }   
        },
        processUnlockRoomRepair: function(callback){
            if(roomRepairModel){
                var removeRoomRepair = loginFactory.securedPostJSON("api/Config/Rooms/RemoveRoomRepair",roomRepairModel);
                $rootScope.dataLoadingPromise = removeRoomRepair;
                removeRoomRepair.success(function(data) {
                    dialogService.toast("UNBLOCK_SUCCESSFUL");
                    if(callback) callback();
                }).error(function(err) {
                    dialogService.messageBox("result", err.Message).then(function () {
                        $state.go($state.current, {}, {
                            reload: true
                        });
                    });
                });
            };
        }
    };
    return roomRepairService;
}]);