ezCloud.factory("UnassignRoomService", ['loginFactory', 'dialogService', '$stateParams', '$rootScope', '$state','$mdDialog','ConflictReservationService', function(loginFactory, dialogService, $stateParams, $rootScope, $state,$mdDialog,ConflictReservationService) {
    var unassignRoomsModel = null;
    var unassignRoomService = {
        setUnassignRoomsModel: function(_unassignRoomsModel){
            unassignRoomsModel = _unassignRoomsModel;
        },
        getUnassignRoomsModel: function(){
            return unassignRoomsModel;
        }
    };
    return unassignRoomService;
}]);