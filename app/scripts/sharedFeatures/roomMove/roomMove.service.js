ezCloud.factory("RoomMoveService", ['loginFactory', 'dialogService', '$stateParams', '$rootScope', '$state','$filter', 
    function(loginFactory, dialogService, $stateParams, $rootScope, $state,$filter) {
    var roomMoveModel = null;
    var newRoomId = null;
    var result = null;
    function buildResultModel(){
        result = {
            IsValid:true,
            Warning:{
                MissingRoom:false,
                MissingReason:false,
                DepartureDate:false,
                Date:false,
            }
        };
    };
    var RoomMoveService = {
        setNewRoomId: function(_newRoomId){
            newRoomId = _newRoomId;
        },
        getNewRoomId: function(){
            return newRoomId;
        },
        setRoomMoveModel: function(_roomMoveModel){
            roomMoveModel =_roomMoveModel;
        },
        getRoomMoveModel: function(){
            return roomMoveModel;
        },
        buildRoomMoveModel: function(tempRoomMove){
            var keys = ["ROOM_MONTHLY", "ROOM_WEEKLY", "ROOM_FULL_DAY", "ROOM_DAY_NIGHT", "ROOM_HOURLY", "MINIBAR", "LAUNDRY", "EXTRA_ROOM_CHARGE", "COMPENSATION", "EXTRA_SERVICES", "FULL_DAY_EARLY_CHECKIN", "FULL_DAY_LATE_CHECKOUT", "DAY_NIGHT_EARLY_CHECKIN", "DAY_NIGHT_LATE_CHECKOUT", "EXTRA_ADULTS", "EXTRA_CHILDREN", "ROOM_MOVE_EXTRA_SERVICES", "NOTIFICATION_CHANGE_ROOM"];
            var _languageKeys = {};
            for (var idx in keys) {
                _languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
            };
            if(tempRoomMove){
                if (!tempRoomMove.newRoom.RoomMoveFee || tempRoomMove.newRoom.RoomMoveFee === undefined) {
                     tempRoomMove.newRoom.RoomMoveFee = 0;
                }
                //
                var RoomMoveModel = {
                    ReservationRoomId: tempRoomMove.currentRoom.reservationRoom.ReservationRoomId,
                    NewRoomTypeId: tempRoomMove.newRoom.RoomTypeId,
                    NewRoomId: tempRoomMove.newRoom.RoomId,
                    NewRoomPriceId: tempRoomMove.newRoom.RoomPriceId,
                    IsDirty: tempRoomMove.isDirty,
                    UsePriceRateType: tempRoomMove.UsePriceRateType,
                    RoomMoveFee: tempRoomMove.newRoom.RoomMoveFee,
                    Description: tempRoomMove.newRoom.Description,
                    ArrivalDate: tempRoomMove.currentRoom.reservationRoom.ArrivalDate,
                    DepartureDate: tempRoomMove.currentRoom.reservationRoom.DepartureDate,
                    OldRoomId:tempRoomMove.currentRoom.RoomId,
                    // UsePriceRateType: (tempRoomMove.IsOverridePriceRate == true) ? 1 : 0,
                    languageKeys: _languageKeys
                }
                roomMoveModel = RoomMoveModel;
                return RoomMoveModel
            }
        },
        checkValidBeforeRoomMove: function(currentRoom,newRoom){
            buildResultModel();
            if(currentRoom && newRoom){
                 if (!newRoom.RoomId || parseInt(newRoom.RoomId) === 0 || newRoom.RoomId.toString() === currentRoom.RoomId.toString()) {
                    result.IsValid = false;
                    result.Warning.MissingRoom = true;
                    return result;
                }

                if ((currentRoom.BookingStatus == 'CHECKIN' || currentRoom.BookingStatus == 'OVERDUE') && (!newRoom.Description || newRoom.Description.trim() == '')) {
                    result.IsValid = false;
                    result.Warning.MissingReason = true;
                    return result;
                }

                if (currentRoom.reservationRoom.ArrivalDate > currentRoom.reservationRoom.DepartureDate) {
                    result.IsValid = false;
                    result.Warning.Date = true;
                    return result;
                }

                if ((currentRoom.BookingStatus === 'BOOKED' || currentRoom.BookingStatus === 'NOSHOW') && (new Date(currentRoom.reservationRoom.DepartureDate) < new Date() || new Date(currentRoom.reservationRoom.ArrivalDate) < new Date())) {
                    result.IsValid = false;
                    result.Warning.DepartureDate = true;
                    return result;
                }
                return result;
            }
        },
        processRoomMove: function(callback){
            if(roomMoveModel){
                var processRoomMove = loginFactory.securedPostJSON("api/Room/ProcessRoomMove", roomMoveModel);
                $rootScope.dataLoadingPromise = processRoomMove;
                processRoomMove.success(function (data) {
                    var result = { status: true, object: data };
					if (callback) callback(result);
                }).error(function (err) {
                    var result = { status: false, object: err };
                    console.log(result,"2222");
					if (callback) callback(result);
                });
            };
        },
        processRoomMoveDB: function(callback){
            if(roomMoveModel){
                var processRoomMove = loginFactory.securedPostJSON("api/Room/ProcessRoomMove", roomMoveModel);
                $rootScope.dataLoadingPromise = processRoomMove;
                processRoomMove.success(function (data) {
                    var result = { status: true, object: data };
					if (callback) callback(result);
                }).error(function (err) {
                    var result = { status: false, object: err };
                    console.log(result,"2222");
					if (callback) callback(result);
                });
            };
        }
    };
    return RoomMoveService;
}]);