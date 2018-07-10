ezCloud.controller('UnassignRoomController', ['$mdDialog', '$filter','$mdMedia','$location','UnassignRoomService','SharedFeaturesFactory','CancelService','AssignRoomService','homeFactory','AmendStayService','AssignRoomService','walkInFactory',
function($mdDialog, $filter, $mdMedia,$location,UnassignRoomService,SharedFeaturesFactory,CancelService,AssignRoomService,homeFactory,AmendStayService,AssignRoomService,walkInFactory) {
    var vm = this;        
    function Init(){
       var urD = UnassignRoomService.getUnassignRoomsModel();
       var urListTemp = urD.unassignRoomModel;
       vm.callback = urD.callback;
       var menuItemsTemp = [{
            name: "VIEW_DETAIL",
            icon: "ic_pageview_24px.svg",
            url: "reservation/"
        },{
            name: "EDIT_GROUP",
            icon: "ic_pageview_24px.svg",
            url: "groupReservationDetail/"
        },{
            name: "AMEND_STAY",
            icon: "ic_alarm_add_24px.svg",
        }, {
            name: "ASSIGN_ROOM",
            icon: "ic_local_hotel_24px.svg",
        }, {
            name: "CANCEL_RESERVATION",
            icon: "ic_cancel_24px.svg",
        }];
        if(urListTemp && urListTemp.unassignRoomList.length > 0){
            angular.forEach(urListTemp.unassignRoomList,function(urTemp){
                urTemp.MenuItems = angular.copy(menuItemsTemp);
                if(!urTemp.IsGroup){
                    urTemp.MenuItems.splice(1,1);
                }
                urTemp.Color = urListTemp.statusColor[urTemp.BookingStatus];
            });
        }
        vm.unassignRoomList = urListTemp.unassignRoomList;
        vm.openMenu = function ($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        };
       console.log('UnassignRoom',vm.unassignRoomList,urListTemp.statusColor);
    };
    Init();
    //my blue was here
    vm.menuItemClick = function (item, result) {
        $mdDialog.cancel();
        if(item.name === 'VIEW_DETAIL'){
            $location.path(item.url + result.ReservationRoomId);
        }else if(item.name === 'EDIT_GROUP'){
            $location.path(item.url + result.Reservations.ReservationId);
        }else if (item.name === 'CANCEL_RESERVATION') {
            var reservationRoom = result;
            if (reservationRoom) {           
                if(!reservationRoom.reservationRoom) reservationRoom.reservationRoom = reservationRoom;
                SharedFeaturesFactory.processCancel(reservationRoom);
            }
        }else if (item.name === 'AMEND_STAY') {
            var selectedRoomTemp = angular.copy(result);
			if(!selectedRoomTemp.Rooms) {
				selectedRoomTemp.Rooms = {};
				selectedRoomTemp.Rooms.RoomName = "N/A";
            }
			SharedFeaturesFactory.processAmendStay(selectedRoomTemp);
        }else if (item.name === 'ASSIGN_ROOM') {
            SharedFeaturesFactory.processAssignRoom(result, vm.callback);
        }
    };
    vm.hide = function () {
        $mdDialog.hide();
    };
    vm.cancel = function () {
        $mdDialog.cancel();
    };
}]);