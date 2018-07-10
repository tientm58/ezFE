ezCloud.controller('listMInvoiceController', ['$scope', '$mdBottomSheet', '$rootScope', '$log', 'commonFactory', 'loginFactory', '$stateParams', 'roomListFactory', 'dialogService', '$state', '$mdDialog', '$locale', '$filter', '$localStorage', 'configFactory', '$mdMedia', 'smartCardFactory', '$timeout', '$location', 'mInvoiceFactory',
    function ($scope, $mdBottomSheet, $rootScope, $log, commonFactory, loginFactory, $stateParams, roomListFactory, dialogService, $state, $mdDialog, $locale, $filter, $localStorage, configFactory, $mdMedia, smartCardFactory, $timeout, $location, mInvoiceFactory) {
        var AccMInvoice = $rootScope.accMInvoice;
        
        function init() {
            // if (mInvoiceFactory.checkIfMInvoiceModuleActive()) {
            //     // to do somethings
            //     if(AccMInvoice != null){
            //         alert("Ok");
            //     }
            //     else{
            //         $location.path('/loginMInvoice');
            //     }
            // }
        }
        init();
    }
])
