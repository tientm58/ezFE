ezCloud.factory("EditCheckInTimeService", ['loginFactory', 'ConflictReservationService', 'dialogService', '$stateParams', '$rootScope', '$state','$filter',
    function(loginFactory, ConflictReservationService, dialogService, $stateParams, $rootScope, $state, $filter) {
        var editCheckInTimeModel = null;
        var EditCheckInTimeService = {
            getEditCheckInTimeModel: function(){
                return editCheckInTimeModel;
            },
            setEditCheckInTimeModel: function(_editCheckInTimeModel){
                editCheckInTimeModel = _editCheckInTimeModel;
            },
            processEditArrivalDate: function(callback){
                var editCheckInTimeModel = this.getEditCheckInTimeModel();
				var processEditCheckInTime = loginFactory.securedPostJSON("api/Room/ProcessEditCheckInTime", editCheckInTimeModel);
				$rootScope.dataLoadingPromise = processEditCheckInTime;
				processEditCheckInTime.success(function (data) {
                    var result = { status: true, object: data };
                    if (callback) callback(result);
				}).error(function (err) {
                    var result = { status: false, object: err };
                    if (callback) callback(result);
                })
            }
        }
        return EditCheckInTimeService;
    }
]);
