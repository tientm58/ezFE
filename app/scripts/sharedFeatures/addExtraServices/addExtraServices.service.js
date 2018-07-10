ezCloud.factory("AddExtraServices", ['loginFactory', 'ConflictReservationService', 'dialogService', '$mdBottomSheet', '$stateParams', '$rootScope', '$state','$filter',
    function(loginFactory, ConflictReservationService, dialogService, $mdBottomSheet, $stateParams, $rootScope, $state, $filter){
        var addExtraServicesModel = null;
        var AddExtraServices = {
            getAddExtraServicesModel: function(){
                return addExtraServicesModel;
            },
            setAddExtraServicesModel: function(_addExtraServicesModel){
                addExtraServicesModel = _addExtraServicesModel;
            },
            processAddExtraServices: function(callback) {
                var postItems = this.getAddExtraServicesModel();
                if (postItems.items) {
                    var saveItems = loginFactory.securedPostJSON("api/Room/CreateExtraService", postItems);
                    $rootScope.dataLoadingPromise = saveItems;
                    saveItems.success(function (data) {
                        var result = { status: true, object: data };
                        if (callback) callback(result);
                    }).error(function (err) {
                        var result = { status: false, object: err };
                        if (callback) callback(result);
                    });
                } else {
                    var saveExtraServiceNoItem = loginFactory.securedPostJSON("api/Room/CreateExtraServiceNoItem", postItems);
                    $rootScope.dataLoadingPromise = saveExtraServiceNoItem;
                    saveExtraServiceNoItem.success(function (data) {
                        var result = { status: true, object: data };
                        if (callback) callback(result);
                    }).error(function (err) {
                        var result = { status: false, object: err };
                        if (callback) callback(result);
                    });
                }
            }
        };
        return AddExtraServices;
    }
]);
