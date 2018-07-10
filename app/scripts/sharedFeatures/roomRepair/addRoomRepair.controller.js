ezCloud.controller('AddRoomRepairController', ['$mdDialog', '$filter','$mdMedia','SharedFeaturesFactory','RoomRepairService',
function($mdDialog, $filter, $mdMedia,SharedFeaturesFactory, RoomRepairService) {
    var vm = this;        
    function Init(){
        vm.DateTimePickerOption = {
            format: 'dd/MM/yyyy HH:mm'
        };
        currentDate = new Date();
        // vm.currentRoom = RoomRepairService.getRoomRepairModel();
        vm.roomRepairs = RoomRepairService.getRoomRepairsModel();
        vm.currentRoom = RoomRepairService.getCurrentRoom();
        vm.newRoomRepair = {};
        vm.newRoomRepair.RoomId = vm.currentRoom.RoomId;
        
        vm.newRoomRepair.RepairEndDate=vm.currentRoom.RepairEndDate;
        vm.newRoomRepair.RepairStartDate=vm.currentRoom.RepairStartDate;

        if(vm.currentRoom.RepairStartDate < currentDate ){
            vm.newRoomRepair.RepairStartDate=currentDate;
        }
        if(vm.currentRoom.RepairStartDate>vm.currentRoom.RepairEndDate){
            vm.newRoomRepair.RepairEndDate=null;
        }
        vm.str = vm.newRoomRepair.RepairStartDate.format('dd/mm/yyyy HH:MM');
        
        if(vm.newRoomRepair.RepairEndDate==null){
            vm.str2 = null;
        }else{
            vm.str2 = vm.newRoomRepair.RepairEndDate.format('dd/mm/yyyy HH:MM');
        }
    };
    Init();

    vm.addRoomRepair = function(){
        RoomRepairService.setRoomRepairModel(vm.newRoomRepair);
        var result = RoomRepairService.checkValidBeforeAddRoomRepair(vm.roomRepairs);
        if(result && result.IsValid == true){
            RoomRepairService.processAddRoomRepairService(function(){
                $mdDialog.hide();
            });
        }else{
            vm.warning = result.Warning;
        };
    };
    vm.hide = function () {
        $mdDialog.hide();
    };
    vm.cancel = function () {
        $mdDialog.cancel();
    };
}]);