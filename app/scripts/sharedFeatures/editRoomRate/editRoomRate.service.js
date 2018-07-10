ezCloud.factory("EditRoomRateService", ['loginFactory', 'ConflictReservationService', 'dialogService', '$stateParams', '$rootScope', '$state','$filter',
    function(loginFactory, ConflictReservationService, dialogService, $stateParams, $rootScope, $state, $filter) {
        var editRoomRateModel = null;
        var EditRoomRateService = {
            getEditRoomRateModel: function(){
                return editRoomRateModel;
            },
            setEditRoomRateModel: function(_editRoomRateModel){
                editRoomRateModel = _editRoomRateModel;
            },
            processEditRoomRate: function(callback){
                var editRoomRateModel = this.getEditRoomRateModel();

            }
        }
        return EditRoomRateService;
    }
]);
