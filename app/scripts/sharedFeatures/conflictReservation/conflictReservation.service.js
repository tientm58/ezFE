ezCloud.factory("ConflictReservationService", ['dialogService', '$stateParams', '$state', '$mdDialog', '$filter', '$rootScope', 'loginFactory',
    function(dialogService, $stateParams, $state, $mdDialog, $filter, $rootScope, loginFactory) {
        var conflictReservationModel = null;
        var currentModel = null;
        var roomStatus = null;
        
        var ConflictReservationService = {
            getConflictReservationModel: function(){
                return conflictReservationModel;
            },
            setConflictReservationModel: function(_conflictReservationModel){
                conflictReservationModel = _conflictReservationModel;
            },
            getCurrentModel: function(){
                return currentModel;
            },
            setCurrentModel: function(_currentModel){
                currentModel = _currentModel;
            },
            getRoomStatus: function(){
                return roomStatus;
            },
            setRoomStatus: function(status){
                roomStatus = status;
            },
            processConflictReservation: function(callback) {
                var conflictReservationModel = this.getConflictReservationModel();
                var conflictModel = this.getCurrentModel();
                var reservationRoomId = null;
                if(currentModel.room)
                    reservationRoomId = currentModel.room.ReservationRoomId;
                else reservationRoomId = currentModel.ReservationRoomId;
                var keys = ["NOTIFICATION_WHEN_CHANGE_DATE", "NOTIFICATION_CHANGE_DATE"];
                var languageKeys = {};
                for (var idx in keys) {
                    languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
                }
                var AmendStayModel = {
                    reservationRoomId: reservationRoomId,
                    departureDate: new Date(conflictReservationModel.to),
                    arrivalDate: new Date(conflictReservationModel.from),
                    adults: conflictReservationModel.adults,
                    child: conflictReservationModel.child,
                    languageKeys: languageKeys
                }
                var saveAmendStay = loginFactory.securedPostJSON("api/Room/SaveAmendStay", AmendStayModel);
                $rootScope.dataLoadingPromise = saveAmendStay;
                saveAmendStay.success(function (data) {
                    var result = { status: true, object: data };
                    if (callback) callback(result);
                }).error(function (err) {
                    var result = { status: false, object: err };
                    if (callback) callback(result);
                });
            },
            calculateTimeConflict: function(_conflict,_current,roomStatus){
                var conflict = _conflict;
                var current = _current;
                var isConflictCase = false;
    
                var fromConflictTime = new Date(new Date(conflict.arrivalDate).format('mm/dd/yyyy HH:MM')).getTime();
                var toConflictTime = new Date(new Date(conflict.departureDate).format('mm/dd/yyyy HH:MM')).getTime();
                var fromCurrentTime = new Date(new Date(current.arrivalDate).format('mm/dd/yyyy HH:MM')).getTime();
                var toCurrentTime = new Date(new Date(current.departureDate).format('mm/dd/yyyy HH:MM')).getTime();
    
                var minArrival = fromConflictTime <= fromCurrentTime ? fromConflictTime : fromCurrentTime;
                var maxDeparture = toConflictTime >= toCurrentTime ? toConflictTime : toCurrentTime;
    
                var total = maxDeparture - minArrival + 1;
                var conflictPersen = (((toConflictTime - fromConflictTime + 1) / total) * 100).toFixed(2);
                var currentPersen = (((toCurrentTime - fromCurrentTime + 1) / total) * 100).toFixed(2);
    
                var leftConflict = fromConflictTime <= minArrival ? 0 : ((((fromConflictTime - minArrival + 1) / total) * 100).toFixed(2));
                var leftCurrent = fromCurrentTime <= minArrival ? 0 : ((((fromCurrentTime - minArrival + 1) / total) * 100).toFixed(2));
                
                var statusChange = 0; //0: Not change, 1: change arrival of current, 2: change departure of current
                var fromDateConflictTemp = null;
                var toDateConflictTemp = null;
                var editPersen = null;
                var editLeft = null;
                var position = null;
                var margin = null;
                var marginTemp = null;

                if((toCurrentTime >= fromConflictTime && fromCurrentTime < fromConflictTime && toCurrentTime < toConflictTime)){
                    var temp = new Date();
                    fromDateConflictTemp = new Date(temp.setHours(temp.getHours() + 1)).format('mm/dd/yyyy HH:MM'); 
                    toDateConflictTemp = new Date(conflict.departureDate).format('mm/dd/yyyy HH:MM');
                    statusChange = 1;
                    editLeft = (((toCurrentTime - minArrival + 3600000 + 1) / total) * 100).toFixed(2);
                    position = 'to';
                    //margin = (((fromConflictTime - minArrival + 1) / total) * 100).toFixed(2);
                    margin = (100 - leftConflict).toFixed(2);
                    //marginTemp = (((new Date(fromDateConflictTemp).getTime() - minArrival + 1) / total) * 100).toFixed(2);
                    marginTemp = 100 - editLeft;
                    if((toCurrentTime - fromConflictTime)/3600000 <= 2 && roomStatus == 'CHECKOUT' && toConflictTime-toCurrentTime > 3660000){
                        isConflictCase = true;
                    }
                    editPersen = (((new Date(toDateConflictTemp).getTime() - new Date(fromConflictTime).getTime() -3600000 + 1) / total) * 100).toFixed(2);
                }     
                var data = {
                    Conflict: {
                        Before : {
                            from: new Date(conflict.arrivalDate).format('dd/mm/yyyy HH:MM'),
                            to: new Date(conflict.departureDate).format('dd/mm/yyyy HH:MM'),
                            width: conflictPersen,
                            left: leftConflict,
                            margin: margin
                        },
                        After : {
                            from: new Date(fromDateConflictTemp).format('dd/mm/yyyy HH:MM'),
                            to: new Date(toDateConflictTemp).format('dd/mm/yyyy HH:MM'),
                            width: editPersen,
                            left: editLeft,
                            margin: marginTemp
                        }
                    },
                    Current: {
                        Before : {
                            from: new Date(current.arrivalDate).format('dd/mm/yyyy HH:MM'),
                            to: new Date(current.departureDate).format('dd/mm/yyyy HH:MM'),
                            width: currentPersen,
                            left: leftCurrent, 
                        }
                    },
                    StatusChange: statusChange,
                    Position: position,
                    isConflictCase:isConflictCase
                }
                
                return data;
            },
        };
        return ConflictReservationService;
    }
]);
