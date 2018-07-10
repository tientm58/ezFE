ezCloud.factory("AmendStayService", ['loginFactory', 'ConflictReservationService', 'dialogService', '$stateParams', '$rootScope', '$state','$filter',
    function(loginFactory, ConflictReservationService, dialogService, $stateParams, $rootScope, $state, $filter){
        var amendStayModel = null;
        var AmendStayService = {
            getAmendStayModel: function(){
                return amendStayModel;
            },
            setAmendStayModel: function(_amendStayModel){
                amendStayModel = _amendStayModel;
            },
            processAmendStay: function(callback) {
                var amendStayModel = this.getAmendStayModel();
                if (amendStayModel != null){
                    var saveAmendStay = loginFactory.securedPostJSON("api/Room/SaveAmendStay", amendStayModel);
                    $rootScope.dataLoadingPromise = saveAmendStay;
                    saveAmendStay.success(function(data) {
                        var result = { status: true, object: data };
                        if (callback) callback(result);
                    }).error(function(err) {
                        var result = { status: false, object: err };
                        if (callback) callback(result);
                    });
                }
            },
            processAmendStayFO: function(callback) {
                var amendStayModel = this.getAmendStayModel();
                if (amendStayModel != null){
                    var saveAmendStay = loginFactory.securedPostJSON("api/Room/SaveAmendStay", amendStayModel);
                    $rootScope.dataLoadingPromise = saveAmendStay;
                    saveAmendStay.success(function(data) {
                        var result = { status: true, object: data };
                        if (callback) callback(result);
                    }).error(function(err) {
                        var result = { status: false, object: err };
                        if (callback) callback(result);
                    });
                }
            }
        };
        return AmendStayService;
    }
]);
