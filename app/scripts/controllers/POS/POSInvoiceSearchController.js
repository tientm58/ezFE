var globalInvoiceId = 0;
ezCloud.controller('POSInvoiceSearchController', ['$scope', '$rootScope', '$state', 'dialogService', '$localStorage', '$http', '$sessionStorage', 'loginFactory', '$mdDialog', 'flowFactory', '$filter', '$mdSidenav', '$mdMedia', 'configFactory', '$q', '$location', '$log', 'roomListFactory', 'frontOfficeFactory', '$timeout', '$route', 'POSFactory',
    function($scope, $rootScope, $state, dialogService, $localStorage, $http, $sessionStorage, loginFactory, $mdDialog, flowFactory, $filter, $mdSidenav, $mdMedia, configFactory, $q, $location, $log, roomListFactory, frontOfficeFactory, $timeout, $route, POSFactory) {

        var hotelFormPOSInvoiceReportFile="POSInvoiceA4.trdx";

        $scope.minDate = new Date();

        function Init() {
            jQuery(document).unbind('keydown');
            if (POSFactory.checkIfPOSModuleActive()) {
               $scope.DatePickerOption = {
                    format: 'dd/MM/yyyy'
                };
                $scope.createdDateFromString = new Date().format('dd/mm/yyyy');
                $scope.createdDateToString = addDays(new Date(), 1).format('dd/mm/yyyy');


                $scope.search = {
                    InvoiceNumber: null,
                    InvoiceType: 1,
                    InvoiceCustomerName: null,
                   // InvoiceCreatedDateFrom: new Date().toLocaleDateString(),
                    //InvoiceCreatedDateTo: addDays(new Date(), 1).toLocaleDateString(),
                    InvoiceCreatedDateFrom: new Date(),
                    InvoiceCreatedDateTo: addDays(new Date(), 1),
                    InvoiceTitle: null
                };
                console.info("SEARCH", $scope.search);
                $scope.searchResult = [];
                $scope.processSearch();            
            }
        }
       

        $scope.processSearch = function() {
           /* if ($scope.search.InvoiceCreatedDateFrom && $scope.search.InvoiceCreatedDateTo && new Date($scope.search.InvoiceCreatedDateFrom).getTime() > new Date($scope.search.InvoiceCreatedDateTo).getTime()) {
                dialogService.messageBox("INVALID_INVOICE_CREATED_FROM/TO_DATE", "PLEASE_SELECT_A_VALID_DATE_TO_PERFORM_SEARCH_ACTION");
                return;
            }
*/

            if ($scope.search.InvoiceCreatedDateFrom && $scope.search.InvoiceCreatedDateTo && new Date($scope.search.InvoiceCreatedDateFrom.getFullYear(), $scope.search.InvoiceCreatedDateFrom.getMonth(), $scope.search.InvoiceCreatedDateFrom.getDate(), 0, 0, 0, 0) > $scope.search.InvoiceCreatedDateTo) {
                dialogService.messageBox("INVALID_INVOICE_CREATED_FROM/TO_DATE", "PLEASE_SELECT_A_VALID_DATE_TO_PERFORM_SEARCH_ACTION");
                return;
            }

          /*  if ($scope.search.InvoiceCreatedDateFrom && $scope.search.InvoiceCreatedDateTo) {
                dialogService.messageBox("INVALID_INVOICE_CREATED_FROM/TO_DATE", "PLEASE_SELECT_A_VALID_DATE_TO_PERFORM_SEARCH_ACTION");
                return;
            }*/

            /*if ($scope.search.InvoiceCreatedDateFrom && $scope.search.InvoiceCreatedDateTo && $scope.search.InvoiceCreatedDateFrom > $scope.search.InvoiceCreatedDateTo) {
                dialogService.messageBox("INVALID_INVOICE_CREATED_FROM/TO_DATE", "PLEASE_SELECT_A_VALID_DATE_TO_PERFORM_SEARCH_ACTION");
                return;
            }*/

           /* if ($scope.search.InvoiceCreatedDateFrom){
                $scope.search.InvoiceCreatedDateFrom = new Date($scope.search.InvoiceCreatedDateFrom);
            }
            if ($scope.search.InvoiceCreatedDateTo){
                $scope.search.InvoiceCreatedDateTo = new Date($scope.search.InvoiceCreatedDateTo);
            }*/
            var processSearchInvoice = loginFactory.securedPostJSON("api/POS/SearchInvoiceProcess", $scope.search);
            $rootScope.dataLoadingPromise = processSearchInvoice;
            processSearchInvoice.success(function(data) {
                $scope.listUser = data.listUser;
                $scope.searchResult = data.result;
                for(var index in $scope.searchResult){
                    var result = $scope.searchResult[index];
                    if (result.CreatedDate){
                        result.CreatedDate = new Date(result.CreatedDate);
                    }
                    if($scope.listUser && $scope.listUser.length>0){
                        for(var idx in $scope.listUser) {
                            var user=$scope.listUser[idx];
                            if(user.UserId==result.CreatedUserId){
                                if (user.Email)
                                    result.UserName=user.Email;
                                else
                                    result.UserName=user.StaffName;
                            }

                        }
                    }

                }
            }).error(function(err) {
                console.log("ERROR", err);
            });
        };

        Init();

        $scope.$watchCollection('search', function(newValues, oldValues) {
            if (newValues.InvoiceCreatedDateFrom > oldValues.InvoiceCreatedDateTo) {
                newValues.InvoiceCreatedDateTo = addDays(newValues.InvoiceCreatedDateFrom, 1).toDateString();
            }
        });

        function addDays(date, days) {
            var result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        }

        $scope.openMenu = function($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        };

        $scope.viewInvoiceDetail = function(result){
            $location.path("POSInvoiceDetail/" + result.POSPaymentTravellerId);
        };

        $scope.showInvoice = function (result) {

            if (result.POSPaymentTravellerId)
            {
                var getPOSConfig = loginFactory.securedGet("api/POS/GetPOSConfig");
                $rootScope.dataLoadingPromise = getPOSConfig;
                getPOSConfig.success(function (data) {
                    if (data != null){
                       $scope.hotelFormPOSInvoiceReport      ="POSInvoice"+data.InvoiceType+".trdx";
                       $mdDialog.show({
                            controller: POSPaymentTravellerController,
                            locals: {
                                reservationRoomId: result.POSPaymentTravellerId,
                                hotelFormPOSInvoiceReport:$scope.hotelFormPOSInvoiceReport
                            },
                            templateUrl: 'views/templates/invoicePOSPayment.tmpl.html',
                            parent: angular.element(document.body),
                            targetEvent: null,
                            clickOutsideToClose: false
                        })
                        .then(function (answer) {}, function () {

                        });
                    }
                }).error(function (err) {
                    console.log(err);
                });

            }
        };

        function POSPaymentTravellerController($scope, $mdDialog, reservationRoomId, hotelFormPOSInvoiceReport) {

            globalInvoiceId = reservationRoomId;
            hotelFormPOSInvoiceReportFile=hotelFormPOSInvoiceReport;
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
        }

        $scope.copyAndCreateNewInvoice = function(result){
            if (result.DrafPOSPaymentTravellerId != null){
                POSFactory.setDraftId(result.DrafPOSPaymentTravellerId);
            }
            if (result.POSPaymentTravellerId != null){
                POSFactory.setInvoiceId(result.POSPaymentTravellerId);
            }
            $location.path("POSInvoice");
        };

        $scope.deleteInvoice = function(result){
            $mdDialog.show({
                    controller: DeleteInvoiceController,
                    templateUrl: 'views/templates/deleteInvoice.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: null,
                    clickOutsideToClose: false, //fullscreen: useFullScreen
                })
                .then(function(deleteReason) {
                    var DeleteInvoiceModel = {
                        DeleteReason: deleteReason
                    };
                    var keys = ["POS_NOTIFICATION_DELETE_INVOICE_MESSAGE"];
                    var languageKeys = {};
                    for (var idx in keys) {
                        languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
                    }

                    DeleteInvoiceModel.languageKeys=languageKeys;
                    
                    var deleteInvoicePromise = null;
                    if (result.DrafPOSPaymentTravellerId != null){
                        DeleteInvoiceModel.Id = result.DrafPOSPaymentTravellerId;
                        DeleteInvoiceModel.isInvoice = false;
                    }
                    if (result.POSPaymentTravellerId != null){
                        DeleteInvoiceModel.Id = result.POSPaymentTravellerId;
                        DeleteInvoiceModel.isInvoice = true;
                    }
                    

                    deleteInvoicePromise = loginFactory.securedPostJSON("api/POS/ProcessDeletePOSInvoice", DeleteInvoiceModel);
                    $rootScope.dataLoadingPromise = deleteInvoicePromise;
                    deleteInvoicePromise.success(function(data) {
                        dialogService.toast("DELETE_INVOICE_SUCCESS");
                        var el = document.getElementById('search');
                        $timeout(function () {
                            angular.element(el).triggerHandler('click');
                        }, 0);
                    }).error(function(err) {
                        console.log(err);
                    });

                }, function() {

                });

            function DeleteInvoiceController($scope, $mdDialog) {
                function Init() {
                    $scope.warning = false;
                    $scope.deleteReason = null;
                }
                Init();
                $scope.hide = function() {
                    $mdDialog.hide();
                };
                $scope.cancel = function() {
                    $mdDialog.cancel();
                };
                $scope.save = function() {
                    if ($scope.deleteReason == null || $scope.deleteReason.trim() == '') {
                        $scope.warning = true;
                        return;
                    } else {
                        $mdDialog.hide($scope.deleteReason);
                    }
                }
            }
        }
    }
]);
