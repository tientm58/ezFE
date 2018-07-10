ezCloud.controller('loginMInvoiceController', ['$scope', '$mdBottomSheet', '$rootScope', '$log', 'commonFactory', 'loginFactory', '$stateParams', 'roomListFactory', 'dialogService', '$state', '$mdDialog', '$locale', '$filter', '$localStorage', 'configFactory', '$mdMedia', 'smartCardFactory', '$timeout', '$location', 'mInvoiceFactory',
    function ($scope, $mdBottomSheet, $rootScope, $log, commonFactory, loginFactory, $stateParams, roomListFactory, dialogService, $state, $mdDialog, $locale, $filter, $localStorage, configFactory, $mdMedia, smartCardFactory, $timeout, $location, mInvoiceFactory) {

        $scope.Account = {
            username: '',
            password: '',
            saveAcc: function () {
                var username = $scope.Account.username;
                var password = $scope.Account.password;
                if (username == 'tuyendv' && password == '123ez123') {
                    $rootScope.accMInvoice = {
                        username: username,
                        password: password
                    };
                    dialogService.toast("CHECK_ACCOUNT_SUCCESSFUL");
                }
                else {
                    $rootScope.accMInvoice = null;
                    dialogService.toastWarn("CHECK_ACCOUNT_FAILED");
                }
            }
        }
        function init() {

            // to do somethings
            $scope.Account.username = '';
            $scope.Account.password = '';
        }

        init();
    }
])
