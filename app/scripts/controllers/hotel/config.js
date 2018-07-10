ezCloud.controller('configController', ['$scope', '$rootScope', '$state', 'dialogService', '$localStorage', '$http', '$sessionStorage', 'loginFactory', '$mdDialog', 'flowFactory', '$filter', '$log', '$mdSidenav', '$mdMedia', 'configFactory', '$q', '$location', 'currentHotelSettings', function ($scope, $rootScope, $state, dialogService, $localStorage, $http, $sessionStorage, loginFactory, $mdDialog, flowFactory, $filter, $log, $mdSidenav, $mdMedia, configFactory, $q, $location, currentHotelSettings) {
    function Init() {
        jQuery(document).unbind('keydown');
        console.info("hotelsetting", $rootScope.HotelSettings);
        $scope.isPOSModuleActive = false;
        if ($rootScope.HotelSettings != null && $rootScope.HotelSettings.EzHotelModulesList != null) {
            var posModule = _.filter($rootScope.HotelSettings.EzHotelModulesList, function (module) {
                return module.EzModules && module.EzModules.ModuleCode == "POS" && module.EzModules.Status == true && module.Status == true;
            });
            if (posModule != null && posModule.length > 0) {
                $scope.isPOSModuleActive = true;
            }
        }

        $scope.isHotelUsingSmartCardModule = false;
        if (currentHotelSettings != null && currentHotelSettings.EzHotelModulesList != null) {
            for (var index in currentHotelSettings.EzHotelModulesList) {
                var hotelModuleTemp = currentHotelSettings.EzHotelModulesList[index];
                if (hotelModuleTemp.EzModules != null && hotelModuleTemp.EzModules.ModuleCode == "SMARTCARD") {
                    $scope.isHotelUsingSmartCardModule = true;
                    break;
                }
            }
            if ($rootScope.previousState == "modulePaymentManagement") {
                location.reload();
            }
        }
        $scope.isHotelUsingThuChiModule = false;
        if ($rootScope.HotelSettings != null && $rootScope.HotelSettings.EzHotelModulesList != null) {
            var thuchiModule = _.filter($rootScope.HotelSettings.EzHotelModulesList, function (module) {
                return module.EzModules && module.EzModules.ModuleCode == "THUCHI" && module.EzModules.Status == true && module.Status == true;
            });
            if (thuchiModule != null && thuchiModule.length > 0) {
                $scope.isHotelUsingThuChiModule = true;
            }
        }

        $scope.isHotelUsingMInvoiceModule = false;
        if ($rootScope.HotelSettings != null && $rootScope.HotelSettings.EzHotelModulesList != null) {
            var thuchiModule = _.filter($rootScope.HotelSettings.EzHotelModulesList, function (module) {
                return module.EzModules && module.EzModules.ModuleCode == "M_INVOICE" && module.EzModules.Status == true && module.Status == true;
            });
            if (thuchiModule != null && thuchiModule.length > 0) {
                $scope.isHotelUsingMInvoiceModule = true;
            }
        }
    }
    Init();

    $scope.$watch('selectedIndex', function (current, old) {
        switch ($state.current.name) {
            case "configHotelOwnerInfo":
                $scope.selectedIndex = 0;
                break;
            case "configHotelInfo":
                $scope.selectedIndex = 1;
                break;
            case "configRoomType":
                $scope.selectedIndex = 2;
                break;
            case "configFloorList":
                $scope.selectedIndex = 3;
                break;
            case "configRoomList":
                $scope.selectedIndex = 4;
                break;
            case "configExtraServices":
                $scope.selectedIndex = 5;
                break;
            case "configStaff":
                $scope.selectedIndex = 6;
                break;
            case "configSystem":
                $scope.selectedIndex = 7;
                break;
            case "configBusiness":
                $scope.selectedIndex = 8;
                break;
            case "configPOS":
                $scope.selectedIndex = 9;
                break;
            // case "configExpenditure":
            //     $scope.selectedIndex = 10;
            //     break;           
        }       
    });

}]);
