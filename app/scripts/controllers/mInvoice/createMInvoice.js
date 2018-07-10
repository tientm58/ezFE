ezCloud.controller('createMInvoiceController', ['$scope', '$mdBottomSheet', '$rootScope', '$log', 'commonFactory', 'loginFactory', '$stateParams', 'roomListFactory', 'dialogService', '$state', '$mdDialog', '$locale', '$filter', '$localStorage', 'configFactory', '$mdMedia', 'smartCardFactory', '$timeout', '$location', 'mInvoiceFactory',
    function ($scope, $mdBottomSheet, $rootScope, $log, commonFactory, loginFactory, $stateParams, roomListFactory, dialogService, $state, $mdDialog, $locale, $filter, $localStorage, configFactory, $mdMedia, smartCardFactory, $timeout, $location, mInvoiceFactory) {
        function init(){
            if (mInvoiceFactory.checkIfMInvoiceModuleActive()) {
                // to do somethings
            }
        }
        init();
    }
])
