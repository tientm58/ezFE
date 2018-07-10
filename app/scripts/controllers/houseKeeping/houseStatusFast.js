ezCloud.controller('houseStatusFastController', ['$scope', '$rootScope', '$state', 'dialogService', '$localStorage', '$http', '$sessionStorage', 'loginFactory', '$mdDialog', 'flowFactory', '$filter',  '$mdSidenav', '$mdMedia', 'configFactory', '$q', '$location', '$log', 'roomListFactory', 'houseKeepingFactory', '$timeout', 
function ($scope, $rootScope, $state, dialogService, $localStorage, $http, $sessionStorage, loginFactory, $mdDialog, flowFactory, $filter, $mdSidenav, $mdMedia, configFactory, $q, $location, $log, roomListFactory, houseKeepingFactory, $timeout) {
    $scope.rooms = [];
    $scope.status = [
        {
            key: 1,
            value: "CLEAN"
        }
        /*{
            key: 2,
            value: "REPAIR"
        }*/
    ];
    
    function Init() {
        jQuery(document).unbind('keydown');
        $scope.roomFilter = "showAll";
        $scope.selectedRoomFilter = null;
        houseKeepingFactory.getHouseStatus(function (data) {
            console.log("DATA", data);
            $scope.rooms = data;
            for (var index in $scope.rooms) {
                $scope.rooms[index].isSelected = false;
            }
            $scope.selectedStatus = 0;
            $scope.isSelectAll = false;
        });
    }
    Init();
    
    $scope.selectAll = function(isSelectedAll){
        console.log("SELECT ALL");
        
        if (isSelectedAll === true){
            console.log("TRUE");
            for (var index in $scope.rooms){
                $scope.rooms[index].isSelected = true;
            }
        }
        else{
            console.log("FALSE");
          for (var index in $scope.rooms){
                $scope.rooms[index].isSelected = false;
            }  
        }
    };

    $scope.processHouseStatus = function (status) {
        var roomList = _.filter($scope.rooms, function (item) {
            return (item.isSelected === true);
        });
        if(roomList.length > 0){
            for (var index in roomList){
                //delete roomList[index].RoomTypes;
                roomList[index].RoomTypeId = roomList[index].RoomTypes.RoomTypeId;
                delete roomList[index].RoomTypes;
                delete roomList[index].isSelected;
                delete roomList[index].$$hashKey;
                //
                if(status=="CLEAN"){
                    roomList[index].HouseStatus=null;
                }else{
                    roomList[index].HouseStatus="DIRTY";
                }
            }
            console.log("ROOM LIST", roomList);
            //roomList = JSON.stringify(roomList);
            console.log("ROOM LIST JSON", roomList);
            var processHouseStatus = loginFactory.securedPostJSON("api/HouseKeeping/ProcessHouseStatus", roomList);
            $rootScope.dataLoadingPromise = processHouseStatus;
            processHouseStatus.success(function(){
                dialogService.toast("ACTION_REPAIR_ROOM_SUCCESS");
                $state.go($state.current, {}, {
                    reload: true
                });
                $scope.isSelectAll = false;
            }).error(function(err){
                console.log(err);
            });    
        }
    };
}]);