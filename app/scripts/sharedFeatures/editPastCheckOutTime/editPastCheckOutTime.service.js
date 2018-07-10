ezCloud.factory("EditPastCheckOutTimeService", ['loginFactory', 'ConflictReservationService', 'dialogService', '$stateParams', '$rootScope', '$state','$filter',
    function(loginFactory, ConflictReservationService, dialogService, $stateParams, $rootScope, $state, $filter) {
        var editPastCheckOutTimeModel = null;
        var EditPastCheckOutTimeService = {
            getEditPastCheckOutTimeModel: function(){
                return editPastCheckOutTimeModel;
            },
            setEditPastCheckOutTimeModel: function(_editPastCheckOutTimeModel){
                editPastCheckOutTimeModel = _editPastCheckOutTimeModel;
            },
            processEditPastCheckOutTime: function(callback){
                var editPastCheckOutTimeModel = this.getEditPastCheckOutTimeModel();
				var pastCheckOutPromise = loginFactory.securedPostJSON("api/Room/ProcessPastCheckOut", editPastCheckOutTimeModel);
				$rootScope.dataLoadingPromise = pastCheckOutPromise;
				pastCheckOutPromise.success(function (data) {
                    var result = { status: true, object: data };
					if (callback) callback(result);
				}).error(function (err) {
					var result = { status: false, object: err };
                    if (callback) callback(result);
				})
            }
        }
        return EditPastCheckOutTimeService;
    }
]);
