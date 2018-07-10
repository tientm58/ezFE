ezCloud.factory("UndoCheckInService", ['loginFactory', 'ConflictReservationService', 'dialogService', '$stateParams', '$rootScope', '$state','$filter',
    function(loginFactory, ConflictReservationService, dialogService, $stateParams, $rootScope, $state, $filter) {
        var undoCheckInModel = null;
        var UndoCheckInService = {
            getUndoCheckInModel: function(){
                return undoCheckInModel;
            },
            setUndoCheckInModel: function(_undoCheckInModel){
                undoCheckInModel = _undoCheckInModel;
            },
            processUndoCheckIn: function(callback){
                var undoCheckInModel = this.getUndoCheckInModel();
				var preCheckInProcess = loginFactory.securedPostJSON("api/Room/ProcessChangeReservationStatus", undoCheckInModel);
				$rootScope.dataLoadingPromise = preCheckInProcess;
				preCheckInProcess.success(function (data) {
                    var result = { status: true, object: data };
					if (callback) callback(result);
				}).error(function (err) {
                    var result = { status: false, object: err };
					if (callback) callback(result);
				})
            },
            processUndoCheckInDB: function(callback){
                var undoCheckInModel = this.getUndoCheckInModel();
				var preCheckInProcess = loginFactory.securedPostJSON("api/Room/ProcessChangeReservationStatus", undoCheckInModel);
				$rootScope.dataLoadingPromise = preCheckInProcess;
				preCheckInProcess.success(function (data) {
                    var result = { status: true, object: data };
					if (callback) callback(result);
				}).error(function (err) {
                    var result = { status: false, object: err };
					if (callback) callback(result);
				})
            }
        }
        return UndoCheckInService;
    }
]);
