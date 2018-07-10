ezCloud.controller('EditRoomRepairController', ['loginFactory', '$stateParams', 'roomListFactory', 'dialogService', '$state', '$mdDialog', '$locale', '$filter', '$localStorage', 'configFactory', '$mdMedia', 'smartCardFactory', '$timeout', '$location', 'reservationFactory', 'walkInFactory', 'SharedFeaturesFactory', 'roomListFactory', 'homeFactory', 'ConflictReservationService','RoomRepairService',
function(loginFactory, $stateParams, roomListFactory, dialogService, $state, $mdDialog, $locale, $filter, $localStorage, configFactory, $mdMedia, smartCardFactory, $timeout, $location, reservationFactory, walkInFactory, SharedFeaturesFactory, roomListFactory, homeFactory, ConflictReservationService,RoomRepairService) {
    var vm = this;        
    function Init(){
        vm.DateTimePickerOption = {
            format: 'dd/MM/yyyy HH:mm'
        };
        vm.roomRepair = RoomRepairService.getRoomRepairModel();
        console.info(vm.roomRepair);
        vm.roomRepairs = RoomRepairService.getRoomRepairsModel();
        vm.currentRoom = RoomRepairService.getCurrentRoom();
        vm.originalRoomRepair = angular.copy(vm.roomRepair);
        // vm.currentRoom = currentRoom;
        var RepairStartDateTemp = new Date(vm.roomRepair.RepairStartDate.getFullYear(), vm.roomRepair.RepairStartDate.getMonth(), vm.roomRepair.RepairStartDate.getDate());
        var newDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
        if (RepairStartDateTemp < newDate){
            vm.roomRepair.disableStartDate = true;
        }
        vm.str = new Date(vm.roomRepair.RepairStartDate).format('dd/mm/yyyy HH:MM');
        vm.str2 = new Date(vm.roomRepair.RepairEndDate).format('dd/mm/yyyy HH:MM');
    };
    Init();

    vm.unblockRoomRepair = function(){
        var roomRepairTemp = angular.copy(vm.roomRepair);
        RoomRepairService.setRoomRepairModel(roomRepairTemp);
        //
        RoomRepairService.processUnlockRoomRepair(function(){
            $mdDialog.hide();
        });
    };

    vm.saveEditRoomPrice = function () {
        RoomRepairService.setRoomRepairModel(vm.roomRepair);
        RoomRepairService.setOriginalRoomRepair(vm.originalRoomRepair);
        var result = RoomRepairService.checkValidBeforeEditRoomRepair(vm.roomRepairs);
        if(result && result.IsValid == true){
            RoomRepairService.processEditRoomRepairService(function(){
                $mdDialog.hide();
            });
        }else{
            vm.warning = result.Warning;
        }
        // console.log("REPAIR START END",vm.roomRepair.RepairStartDate, vm.roomRepair.RepairEndDate);
        // if (vm.roomRepair.RepairStartDate == null || vm.roomRepair.RepairEndDate == null) {
        //     vm.warningDateNull = true;
        //     vm.warningDateInvalid = false;
        //     vm.warningDateCurrentTime = false;
        //     vm.warningReason = false;
        //     vm.warningConflict = false;
        //     return;
        // }

        // var originalRepairStartDate = new Date(vm.originalRoomRepair.RepairStartDate.getFullYear(), vm.originalRoomRepair.RepairStartDate.getMonth(), vm.originalRoomRepair.RepairStartDate.getDate());
        // var RepairStartDateTemp = new Date(vm.roomRepair.RepairStartDate.getFullYear(), vm.roomRepair.RepairStartDate.getMonth(), vm.roomRepair.RepairStartDate.getDate());
        // var RepairEndDateTemp = new Date(vm.roomRepair.RepairEndDate.getFullYear(), vm.roomRepair.RepairEndDate.getMonth(), vm.roomRepair.RepairEndDate.getDate());
        // var newDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
        // console.log("REPAIR TEMP", RepairStartDateTemp, RepairEndDateTemp, newDate);
        // /* if ( RepairEndDateTemp < newDate) {
        //     vm.warningDateCurrentTime = true;
        //     vm.warningDateNull = false;
        //     vm.warningDateInvalid = false;
        //     vm.warningReason = false;
        //     vm.warningConflict = false;
        //     return;
        // }*/
        // if (originalRepairStartDate < newDate){
        //             if (RepairEndDateTemp < newDate) {
        //                 vm.warningDateCurrentTime = true;
        //                 vm.warningDateNull = false;
        //                 vm.warningDateInvalid = false;
        //                 vm.warningReason = false;
        //                 vm.warningConflict = false;
        //                 return;
        //             }
        //         }
        //         else{
        //             if (RepairStartDateTemp < newDate || RepairEndDateTemp < newDate) {
        //                 vm.warningDateCurrentTime = true;
        //                 vm.warningDateNull = false;
        //                 vm.warningDateInvalid = false;
        //                 vm.warningReason = false;
        //                 vm.warningConflict = false;
        //                 return;
        //             }
        //         }

        // if (vm.roomRepair.RepairStartDate > vm.roomRepair.RepairEndDate) {
        //     console.log("THERE THERE");
        //     vm.warningDateInvalid = true;
        //     vm.warningDateNull = false;

        //     vm.warningDateCurrentTime = false;
        //     vm.warningReason = false;
        //     vm.warningConflict = false;
        //     return;
        // }
        // if (!vm.roomRepair.RepairReason || vm.roomRepair.RepairReason.trim() == '') {
        //     vm.warningReason = true;
        //     vm.warningDateNull = false;
        //     vm.warningDateInvalid = false;
        //     vm.warningDateCurrentTime = false;
        //     vm.warningConflict = false;
        //     return;
        // }
        // console.log('roomRepairs',vm.roomRepairs);
        // for (var index in vm.roomRepairs) {
        //     if (CheckTimeRangeConflict(vm.roomRepairs[index].RepairStartDate, vm.roomRepairs[index].RepairEndDate, vm.roomRepair.RepairStartDate, vm.roomRepair.RepairEndDate) && vm.roomRepairs[index].RoomRepairId != vm.roomRepair.RoomRepairId && vm.roomRepairs[index].IsDeleted === false) {
        //         vm.warningConflict = true;
        //         vm.warningDateNull = false;
        //         vm.warningDateInvalid = false;
        //         vm.warningDateCurrentTime = false;
        //         vm.warningReason = false;
        //         return;
        //     }
        // }

        //if (CheckTimeRangeConflict(vm.roomRepair.RepairStartDate, ))

        // var editRoomPrice = loginFactory.securedPostJSON("api/Config/Rooms/EditRoomRepair", vm.roomRepair);
        // $rootScope.dataLoadingPromise = editRoomPrice;
        // editRoomPrice.success(function (data) {
        //     if (data !== null) {
        //         dialogService.toast("EDIT_ROOM_REPAIR_SUCCESSFUL");
        //         $mdDialog.hide(data);
        //     }
        // }).error(function (err) {
        //     if (err.Meassage) {
        //         $mdDialog.hide(null);
        //         dialogService.messageBox("ERROR", err.Meassage);
        //     }
        //     else{
        //         $mdDialog.hide(null);
        //         conflictReservationProcess(err);
        //     }
        // });
    };

    vm.hide = function () {
        $mdDialog.hide();
    };
    vm.cancel = function () {
        $mdDialog.cancel();
    };
}]);