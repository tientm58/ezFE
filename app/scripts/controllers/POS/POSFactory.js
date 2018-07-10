ezCloud.factory("POSFactory", ['$http', 'loginFactory', '$rootScope', '$sessionStorage', '$location', 'dialogService', '$q', '$interval', '$timeout', '$filter', '$log', '$localStorage', 'reportFactory', 'hotelFactory', 'ngNotify', '$mdDialog',
    function($http, loginFactory, $rootScope, $sessionStorage, $location, dialogService, $q, $interval, $timeout, $filter, $log, $localStorage, reportFactory, hotelFactory, ngNotify, $mdDialog) {
        var draftId = null;
        var invoiceId = null;
        var POSFactory = {
            getDraftId: function() {
                return draftId;
            },
            setDraftId: function(_draftId) {
                console.info("draftid", _draftId);
                draftId = _draftId;
            },
            getInvoiceId: function() {
                return invoiceId;
            },
            setInvoiceId: function(_invoiceId) {
                invoiceId = _invoiceId;
            },
            checkIfPOSModuleActive: function() {
                var ezHotelModulesList = $rootScope.HotelSettings.EzHotelModulesList;
                if (ezHotelModulesList != null && ezHotelModulesList.length > 0) {
                    var posModule = _.filter(ezHotelModulesList, function(module) {
                        return module.EzModules != null && module.EzModules.ModuleCode == "POS" && module.EzModules.Status == true && module.Status == true;
                    });
                    console.info("posModule", posModule);
                    if (posModule == null || posModule.length == 0) {
                        var translated_title = $filter("translate")("LOG_MESSAGES");
                        var translated_content = $filter("translate")("POS_SUGGEST_MESSAGE");
                        var translated_ok = $filter("translate")("OK");
                        var translated_cancel = $filter("translate")("CANCEL");

                        $mdDialog.show(
                            $mdDialog.alert()
                            .parent(angular.element(document.body))
                            .clickOutsideToClose(false)
                            .title(translated_title)
                            .textContent(translated_content)
                            //.ariaLabel('Alert Dialog POS')
                            .ok(translated_ok)
                            .targetEvent(null)
                        ).then(function() {
                            $location.path("modulePaymentManagement");
                        });
                        return false;
                    }
                    return true;
                }
            },
            processDeleteInvoiceOrDraft: function(result, el) {
                if (result.DrafPOSPaymentTravellerId != null) {
                    var DeleteInvoiceModel = {
                        DeleteReason: null,
                        Id: result.DrafPOSPaymentTravellerId,
                        isInvoice: false
                    };
                    deleteInvoicePromise = loginFactory.securedPostJSON("api/POS/ProcessDeletePOSInvoice", DeleteInvoiceModel);
                    $rootScope.dataLoadingPromise = deleteInvoicePromise;
                    deleteInvoicePromise.success(function(data) {
                        dialogService.toast("DELETE_INVOICE_DRAFT_SUCCESS");
                        $timeout(function() {
                            angular.element(el).triggerHandler('click');
                        }, 0);
                    }).error(function(err) {
                        console.log(err);
                    });

                }
                else{
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
                            var deleteInvoicePromise = null;
                            if (result.POSPaymentTravellerId != null) {
                                DeleteInvoiceModel.Id = result.POSPaymentTravellerId;
                                DeleteInvoiceModel.isInvoice = true;
                            }
                            deleteInvoicePromise = loginFactory.securedPostJSON("api/POS/ProcessDeletePOSInvoice", DeleteInvoiceModel);
                            $rootScope.dataLoadingPromise = deleteInvoicePromise;
                            deleteInvoicePromise.success(function(data) {
                                dialogService.toast("DELETE_INVOICE_SUCCESS");
                                $timeout(function() {
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
        };
        return POSFactory
    }
]);
