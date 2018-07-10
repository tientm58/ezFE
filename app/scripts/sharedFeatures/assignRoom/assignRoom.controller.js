ezCloud.controller('AssignRoomController', ['$scope', 'AssignRoomService', '$mdBottomSheet', '$rootScope', '$log', 'commonFactory', 'loginFactory', '$stateParams', 'roomListFactory', 'dialogService', '$state', '$mdDialog', '$locale', '$filter', '$localStorage', 'configFactory', '$mdMedia', 'smartCardFactory', '$timeout', '$location', 'reservationFactory', 'walkInFactory', 'SharedFeaturesFactory',
function($scope, AssignRoomService, $mdBottomSheet, $rootScope, $log, commonFactory, loginFactory, $stateParams, roomListFactory, dialogService, $state, $mdDialog, $locale, $filter, $localStorage, configFactory, $mdMedia, smartCardFactory, $timeout, $location, reservationFactory, walkInFactory, SharedFeaturesFactory) {
    var nq = this;
    nq.newRoom = {};
    function Init() {
        nq.decimal = $rootScope.decimals;
        nq.currentRoom = SharedFeaturesFactory.getFeatureModel();
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

            var reservationRoom = angular.copy(nq.currentRoom);
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
            nq.currentRoom = reservationRoom;

            nq.newRoom.ReservationRoomId = nq.currentRoom.ReservationRoomId;
            nq.newRoom.RoomTypeId = nq.currentRoom.RoomTypes.RoomTypeId;
            nq.newRoom.Price = nq.currentRoom.Price;
            nq.newRoom.RoomPriceId = nq.currentRoom.RoomPrices.RoomPriceId;
            nq.hasRRIDParam = ($stateParams.reservationRoomId) ? true : false;
            nq.IsDashboard = nq.currentRoom.IsDashboard || 0;
            nq.warningRoomAssign = false;
        });
    }
    Init();
    $scope.$watchCollection('assignRoomCtrl.newRoom.RoomTypeId', function (newValues, oldValues) {
        nq.currentRoom.availableRoom = null;
        var availableRoomModel = {
            roomTypeId: nq.newRoom.RoomTypeId,
            arrivalDate: nq.currentRoom.ArrivalDate,
            departureDate: nq.currentRoom.DepartureDate
        };
        var getAvailableRoomsPromise = loginFactory.securedPostJSON("api/Reservation/AvailableRooms", availableRoomModel);
        $rootScope.dataLoadingPromise = getAvailableRoomsPromise;
        getAvailableRoomsPromise.success(function(data){
            nq.currentRoom.availableRoom = data;
        }).error(function(err){
            console.log(err);
        });
        nq.availablePlanList = _.filter(nq.currentRoom.planList, function (item) {
            return (item.IsActive && item.RoomTypeId.toString() === nq.newRoom.RoomTypeId.toString());
        }).sort(function (a, b) {
            return parseInt(a.Priority) - parseInt(b.Priority);
        });
    });
    nq.updateRoomType = function () {
        nq.availablePlanList = _.filter(nq.currentRoom.RoomPriceList, function (item) {
            return (item.IsActive && item.RoomTypeId.toString() == nq.newRoom.RoomTypeId.toString());
        }).sort(function (a, b) {
            return parseInt(a.Priority) - parseInt(b.Priority);
        });
    };
    nq.processAssignRoom = function () {
        if(nq.newRoom.RoomId == '0' || nq.newRoom.RoomId == null){
            nq.warningRoomAssign = true;
            return;
        }
        AssignRoomService.setNewRoomModel(nq.newRoom);
        AssignRoomService.processAssignRoom(function(data){
            
            var result = data;
            if(result.status == true){
                $mdDialog.hide(true);
                dialogService.toast("ASSIGN_ROOM_SUCCESSFUL");
                
            }
            else {
                $mdDialog.hide();
                if(result.object.message){ dialogService.messageBox("ERROR", result.object.message); }
                // else conflictReservationProcess(result.object);
                else ConflictReservationService.processConflictReservation(result.object);
            }
        });
    };
    nq.processAssignRoomDashBoard = function () {
        if(nq.newRoom.RoomId == '0' || nq.newRoom.RoomId == null){
            nq.warningRoomAssign = true;
            return;
        }
        AssignRoomService.setNewRoomModel(nq.newRoom);
        AssignRoomService.processAssignRoomDashBoard(function(data){
            $mdDialog.hide();
            var result = data;
            if(result.status == true){
                dialogService.toast("ASSIGN_ROOM_SUCCESSFUL");
                // $state.go($state.current, {}, {
                //     reload: true
                // });
            }
            else {
                if(result.object.message){ dialogService.messageBox("ERROR", result.object.message); }
                // else conflictReservationProcess(result.object);
                else ConflictReservationService.processConflictReservation(result.object);
            }
        });
    };
    nq.cancel = function() {
        $mdDialog.cancel();
    };
}]);