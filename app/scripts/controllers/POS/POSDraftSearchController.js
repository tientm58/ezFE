ezCloud.controller('POSDraftSearchController', ['$scope', '$rootScope', '$state', 'dialogService', '$localStorage', '$http', '$sessionStorage', 'loginFactory', '$mdDialog', 'flowFactory', '$filter', '$mdSidenav', '$mdMedia', 'configFactory', '$q', '$location', '$log', 'roomListFactory', 'frontOfficeFactory', '$timeout', '$route', 'POSFactory',
    function($scope, $rootScope, $state, dialogService, $localStorage, $http, $sessionStorage, loginFactory, $mdDialog, flowFactory, $filter, $mdSidenav, $mdMedia, configFactory, $q, $location, $log, roomListFactory, frontOfficeFactory, $timeout, $route, POSFactory) {
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
                    InvoiceType: 2,
                    //InvoiceCreatedDateFrom: new Date().toLocaleDateString(),
                    //InvoiceCreatedDateTo: addDays(new Date(), 1).toLocaleDateString(),
                    InvoiceCreatedDateFrom: new Date(),
                    InvoiceCreatedDateTo: addDays(new Date(), 1),
                    InvoiceTitle: null
                };
                console.info("SEARCH", $scope.search);
                $scope.searchResult = [];
            }
        }
        Init();

        $scope.processSearch = function() {
            /*if ($scope.search.InvoiceCreatedDateFrom && $scope.search.InvoiceCreatedDateTo && new Date($scope.search.InvoiceCreatedDateFrom).getTime() > new Date($scope.search.InvoiceCreatedDateTo).getTime()) {
                dialogService.messageBox("INVALID_INVOICE_CREATED_FROM/TO_DATE", "PLEASE_SELECT_A_VALID_DATE_TO_PERFORM_SEARCH_ACTION");
                return;
            }*/
            /*if ($scope.search.InvoiceCreatedDateFrom){
                $scope.search.InvoiceCreatedDateFrom = new Date($scope.search.InvoiceCreatedDateFrom);
            }
            if ($scope.search.InvoiceCreatedDateTo){
                $scope.search.InvoiceCreatedDateTo = new Date($scope.search.InvoiceCreatedDateTo);
            }*/
            if ($scope.search.InvoiceCreatedDateFrom && $scope.search.InvoiceCreatedDateTo && new Date($scope.search.InvoiceCreatedDateFrom.getFullYear(), $scope.search.InvoiceCreatedDateFrom.getMonth(), $scope.search.InvoiceCreatedDateFrom.getDate(), 0, 0, 0, 0) > $scope.search.InvoiceCreatedDateTo) {
                dialogService.messageBox("INVALID_INVOICE_CREATED_FROM/TO_DATE", "PLEASE_SELECT_A_VALID_DATE_TO_PERFORM_SEARCH_ACTION");
                return;
            }

            var processSearchInvoice = loginFactory.securedPostJSON("api/POS/SearchInvoiceProcess", $scope.search);
            $rootScope.dataLoadingPromise = processSearchInvoice;
            processSearchInvoice.success(function(data) {
                $scope.searchResult = data.result;
                $scope.listUser = data.listUser;
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


        $scope.copyAndCreateNewInvoice = function(result){
            if (result.DrafPOSPaymentTravellerId != null){
                POSFactory.setDraftId(result.DrafPOSPaymentTravellerId);
                $location.path("POSInvoice");
            }
        };

        $scope.deleteInvoice = function(result){
            var el = document.getElementById('search');
            POSFactory.processDeleteInvoiceOrDraft(result, el);
        }
    }
]);
