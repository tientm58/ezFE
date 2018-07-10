var $windowScope;
ezCloud.controller('PaymentCompletedController', ['$scope', '$rootScope', '$state', 'dialogService', 'loginFactory', '$localStorage', '$http', '$sessionStorage', '$location', '$stateParams', 'commonFactory', '$translate', 'reportFactory', function($scope, $rootScope, $state, dialogService, loginFactory, $localStorage, $http, $sessionStorage, $location, $stateParams, commonFactory, $translate, reportFactory) {
    function Init() {
        //$windowScope = $scope;
        //$scope.message = null;
        console.log("localStorage", localStorage, localStorage.onepayPaymentCompletedUrlString);
        if (localStorage.onepayPaymentCompletedUrlString != null){
            if (localStorage.onepayPaymentCompletedUrlString && localStorage.onepayPaymentCompletedUrlString[0] == "?"){
                localStorage.onepayPaymentCompletedUrlString = localStorage.onepayPaymentCompletedUrlString.substring(1);
            }

            var paymentCompleted = loginFactory.securedGet("api/BackendPayment/ProcessReturnUrl", localStorage.onepayPaymentCompletedUrlString+"&isDomestic="+localStorage.isDomestic);
            $rootScope.dataLoadingPromise = paymentCompleted;
            paymentCompleted.success(function(data) {
                switch (data.status) {
                    case 0:
                        $scope.message = data.statusCode;
                        $scope.title= "PAYMENT_SUCCESSFUL";
                        break;
                    case 1:
                        $scope.message = data.statusCode;
                        $scope.title= "PAYMENT_PENDING";
                        break;
                    case 2:
                        $scope.message = data.statusCode;
                        $scope.title= "PAYMENT_FAILED";
                        break;
                    case 3:
                        $scope.message = data.statusCode;
                        $scope.title= "PAYMENT_NOT_PROCESSED";
                        break;
                }
                dialogService.messageBox($scope.title,$scope.message).then(function(data){
                    if (window.location.hostname !== 'localhost') {
                        var parts = location.hostname.split('.');
                        var upperleveldomain = parts.join('.');
                        if (parts.length > 1) {
                            if (window.location.hostname.toLowerCase().indexOf("ezcloudhotel.com") >= 0) {
                                window.location.href = "http://" + upperleveldomain + "/#/modulePaymentManagement";
                            } else {
                                window.location.href = "http://" + window.location.hostname + "/#/modulePaymentManagement";
                            }
                        } else {
                            if (window.location.protocol !== "http:") {}
                        }
                    } else {
                        window.location.href = "http://localhost:1980/#/modulePaymentManagement";
                    }

                });
            });
            paymentCompleted.error(function(err) {
                console.log(err);
            });
        }
        else{
            dialogService.messageBox("ERROR","SOME_ERROR_HAS_OCCURRED._PLEASE_TRY_AGAIN").then(function(data){
                if (window.location.hostname !== 'localhost') {
                    var parts = location.hostname.split('.');
                    var upperleveldomain = parts.join('.');
                    if (parts.length > 1) {
                        if (window.location.hostname.toLowerCase().indexOf("ezcloudhotel.com") >= 0) {
                            window.location.href = "http://" + upperleveldomain + "/#/modulePaymentManagement";
                        } else {
                            window.location.href = "http://" + window.location.hostname + "/#/modulePaymentManagement";
                        }
                    } else {
                        if (window.location.protocol !== "http:") {}
                    }
                } else {
                    window.location.href = "http://localhost:1980/#/modulePaymentManagement";
                }
            });
        }
    }
    Init();
    $scope.paymentCompleted = function(queryString) {
        var paymentCompleted = loginFactory.securedGet("api/BackendPayment/ProcessReturnUrl" + queryString);
        $rootScope.dataLoadingPromise = paymentCompleted;
        paymentCompleted.success(function(data) {
            switch (data) {
                case 0:
                    $scope.message = "PAYMENT_SUCCESSFUL";
                    break;
                case 1:
                    $scope.message = "PAYMENT_PENDING";
                    break;
                case 2:
                    $scope.message = "PAYMENT_FAILED";
                    break;
                case 3:
                    $scope.message = "PAYMENT_NOT_PROCESSED";
                    break;
            }
        });
        paymentCompleted.error(function(err) {
            console.log(err);
        })
    }
}]);
