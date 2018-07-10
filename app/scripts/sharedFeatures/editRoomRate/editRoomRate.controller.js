ezCloud.controller('EditRoomRateController', ['$scope', '$mdDialog', '$state', 'dialogService', 'EditRoomRateService', 'SharedFeaturesFactory',
function($scope, $mdDialog, $state,dialogService, EditRoomRateService, SharedFeaturesFactory) {
    var nq = this;
    //Nguyen Ngoc Quan - nq
    function Init() {
        nq.currentRoom = SharedFeaturesFactory.getFeatureModel();
    }
    Init();
    nq.cancel = function () {
        $mdDialog.cancel();
    };
    nq.processEditRoomRate = function () {
        
    };
}]);