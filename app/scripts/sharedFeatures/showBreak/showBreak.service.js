ezCloud.factory("ShowBreakService", ['loginFactory', 'dialogService', '$stateParams', '$rootScope', '$state', '$mdDialog', 'ConflictReservationService', function (loginFactory, dialogService, $stateParams, $rootScope, $state, $mdDialog, ConflictReservationService) {
    var showBreakModel = null;
    var showBreakService = {
        setBreakModel: function (_breakModel) {
            showBreakModel = _breakModel;
        },
        getBreakModel: function () {
            return showBreakModel;
        },
        diffDate: function(startD, endD){
            if (typeof startD.getMonth != "function" || typeof endD.getMonth != "function") {
                return 0;
            }
            return (endD - startD) / (24 * 3600000);
        }
    };
    return showBreakService;
}]);