ezCloud.controller('configPOSController', ['$scope', '$rootScope', '$state', 'dialogService', '$localStorage', '$http', '$sessionStorage', 'loginFactory', '$mdDialog', 'flowFactory', '$filter', '$log', '$mdSidenav', '$mdMedia', 'configFactory', '$q', '$location', function ($scope, $rootScope, $state, dialogService, $localStorage, $http, $sessionStorage, loginFactory, $mdDialog, flowFactory, $filter, $log, $mdSidenav, $mdMedia, configFactory, $q, $location) {
    $scope.invoicePageSize = ["A4", "A5","A6"];
    $scope.numberOfDays = [7, 15, 30];
    function Init() {
            $scope.invoiceOn = true;
            $scope.POSConfigModel = {
                POSConfigId: null,
                InvoiceType: null,
                NumberOfDateToRemoveDrafBill: null
            };
            var getPOSConfig = loginFactory.securedGet("api/POS/GetPOSConfig");
            $rootScope.dataLoadingPromise = getPOSConfig;
            getPOSConfig.success(function (data) {
                if (data != null){
                    $scope.POSConfigModel.POSConfigId = data.POSConfigId;
                    $scope.POSConfigModel.InvoiceType = data.InvoiceType;
                    $scope.POSConfigModel.NumberOfDateToRemoveDrafBill = data.NumberOfDateToRemoveDrafBill;
                }
            }).error(function (err) {
                console.log(err);
            });

    }
    Init();

    $scope.savePOSConfig = function(){
        var savePOSConfig = loginFactory.securedPostJSON("api/POS/SavePOSConfig", $scope.POSConfigModel);
        $rootScope.dataLoadingPromise = savePOSConfig;
        savePOSConfig.success(function(data){
            dialogService.toast("SAVE_POS_CONFIG_SUCCESSFUL");
        }).error(function(err){
            console.log(err);
        })
    };


}]);