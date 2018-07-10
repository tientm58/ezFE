ezCloud.factory("CopyReservationService", ['$mdDialog', 'dialogService', 'CancelService', 'AssignRoomService', 'AmendStayService', 'reservationFactory', 'loginFactory', '$rootScope','$filter','ConflictReservationService',
    function($mdDialog, dialogService, CancelService, AssignRoomService, AmendStayService, reservationFactory, loginFactory, $rootScope,$filter,ConflictReservationService) {
        var copyReservationModel;
        var result = null;
        function buildResultModel(){
            result = {
                IsValid:true,
                Warning:{
                    MissingPrice:false,
                    DepartureDate:false,
                    Date:false,
                    DataNull:false
                }
            };
        };
        var CopyReservationService = {
            setCopyReservationModel:function(_copyReservationModel){
                copyReservationModel = _copyReservationModel;
            },
            getCopyReservationModel:function(){
                return copyReservationModel;
            },
            buildCopyReservationModel:function(model){
                var keys = ["NOTIFICATION_BOOKED_CONTENT", "NOTIFICATION_BOOKED_NAN_CONTENT"];
                var _languageKeys = {};
                for (var idx in keys) {
                    _languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
                }
                var copyRRModel = {};
                if(model){
                     var modelTemp = {
                        ReservationRoomId: model.currentRoom.reservationRoom.ReservationRoomId,
                        TravellerId: model.currentRoom.reservationRoom.Travellers.TravellerId,
                        RoomTypeId: model.newRoom.RoomTypeId,
                        RoomId: model.newRoom.RoomId,
                        RoomPriceId: model.newRoom.RoomPriceId,
                        IsDirty: model.isDirty,
                        Note: model.newRoom.Note,
                        ArrivalDate: new Date(model.currentRoom.reservationRoom.ArrivalDate),
                        DepartureDate: new Date(model.currentRoom.reservationRoom.DepartureDate),
                        Price: model.newPriceTemp,
                        Adults: model.currentRoom.reservationRoom.Adults,
                        Child: model.currentRoom.reservationRoom.Child
                    };
                    copyRRModel.languageKeys = _languageKeys;
                    copyRRModel.ReservationRooms = modelTemp;
                    copyReservationModel = copyRRModel;
                }
                return copyRRModel;
            },
            checkValidBeforeCopy: function(newRoom,currentRoom){
                buildResultModel();
                if(!newRoom || !currentRoom){
                    result.IsValid = false;
                    result.Warning.DataNull = true;
                    return result;
                };
                if (new Date(currentRoom.reservationRoom.ArrivalDate) > new Date(currentRoom.reservationRoom.DepartureDate)) {
                    result.IsValid = false;
                    result.Warning.Date = true;
                    return result;
                }
                if (new Date(currentRoom.reservationRoom.DepartureDate) < new Date() ) {
                    result.IsValid = false;
                    result.Warning.DepartureDate = true;
                    return result; 
                }
             
                if (newRoom.Price == null || newRoom.Price == "") {
                    result.IsValid = false;
                    result.Warning.MissingPrice = true;
                    return result;
                }
                return result;
            },
            processCopyReservationService: function(callback){
                if (copyReservationModel != null){
                    var processCopy = loginFactory.securedPostJSON("api/Room/ProcessCopyRR", copyReservationModel);
                    $rootScope.dataLoadingPromise = processCopy;
                    processCopy.success(function (data) {
                        var result = { status: true, object: data };
                        if (callback) callback(result);
                    }).error(function (err) {
                        var result = { status: false, object: err };
                        if (callback) callback(result);
                    });
                }
            }
        }
        return CopyReservationService;
    }
]);
