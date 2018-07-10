ezCloud.factory("AssignRoomService", ['loginFactory', 'walkInFactory', 'dialogService', '$stateParams', '$rootScope', '$state', 'roomListFactory', 'reservationFactory',
    function(loginFactory, walkInFactory, dialogService, $stateParams, $rootScope, $state, roomListFactory, reservationFactory) {
    var AssignRoomService = {
        buildAssignRoomModel: function(callback) {
            var selectedRR = {};
            var reservationInfo = walkInFactory.getReservationRoomInfo();
            if (reservationInfo != null && reservationInfo.room != null){
                selectedRR.ReservationNumber = reservationInfo.reservationNumber;
                selectedRR.ReservationRoomId = reservationInfo.room.ReservationRoomId;
                selectedRR.Price             = reservationInfo.room.Price;
                selectedRR.RoomTypes = {
                    RoomTypeName: reservationInfo.roomTypeInfo.RoomTypeName,
                    RoomTypeId: reservationInfo.roomTypeInfo.RoomTypeId
                };
                selectedRR.RoomPrices = {
                    RoomPriceName: reservationInfo.planInfo.RoomPriceName,
                    RoomPriceId: reservationInfo.planInfo.RoomPriceId,
                    UseHourlyPrice: reservationInfo.planInfo.UseHourlyPrice
                };
                selectedRR.TotalPrice    = walkInFactory.getRoomTotal();
                selectedRR.ArrivalDate   = new Date(reservationInfo.room.ArrivalDate);
                selectedRR.DepartureDate = new Date(reservationInfo.room.DepartureDate);
                selectedRR.Adults        = reservationInfo.room.Adults;
                selectedRR.Children      = reservationInfo.room.Child;
            }
            var staticContent = walkInFactory.getStaticContent();
            if (staticContent != null) {
                selectedRR.RoomTypeList = staticContent.roomTypes;
                selectedRR.RoomPriceList = staticContent.planList;
                if (selectedRR != null) {
                    var availableRooms = [];
                    walkInFactory.getAvailableRooms(staticContent, selectedRR.ArrivalDate, selectedRR.DepartureDate, availableRooms);
                    selectedRR.AvailableRooms = availableRooms;
                }
            }
            if (callback) {
                callback(selectedRR)
            }
        },
        getNewRoomModel: function(){
            return newRoomModel;
        },
        setNewRoomModel: function(_newRoomModel){
            console.info("_newRoomModel", _newRoomModel);
            newRoomModel = _newRoomModel
        },
        processAssignRoom: function(callback) {
            var newReservationRoom =  this.getNewRoomModel();
            var assignRoom = loginFactory.securedPostJSON("api/Room/ProcessAssignRoom", newReservationRoom);
			$rootScope.dataLoadingPromise = assignRoom;
			assignRoom.success(function (data) {
                var result = { status: true, object: data };
                if (callback) callback(result);
			}).error(function (err) {
				var result = { status: false, object: err };
                if (callback) callback(result);
            })
        },
        processAssignRoomDashBoard: function(callback) {
            var newReservationRoom =  this.getNewRoomModel();
            var assignRoomDB = loginFactory.securedPostJSON("api/Room/ProcessAssignRoom", newReservationRoom);
			$rootScope.dataLoadingPromise = assignRoomDB;
			assignRoomDB.success(function (data) {
                var result = { status: true, object: data };
                if (callback) callback(result);
			}).error(function (err) {
				var result = { status: false, object: err };
                if (callback) callback(result);
            })
        },
    }
    return AssignRoomService;
}]);
