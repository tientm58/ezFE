var $windowScope;
ezCloud.controller('modulePaymentManagementController', ['$scope', '$rootScope', '$state', '$stateParams', 'dialogService', '$localStorage', '$http', 'roomListFactory', '$sessionStorage', 'loginFactory', '$mdDialog', '$timeout', 'hotelFactory', 'configFactory', 'commonFactory', 'reportFactory', '$window', '$locale', '$filter', '$route', '$location', function ($scope, $rootScope, $state, $stateParams, dialogService, $localStorage, $http, roomListFactory, $sessionStorage, loginFactory, $mdDialog, $timeout, hotelFactory, configFactory, commonFactory, reportFactory, $window, $locale, $filter, $stateParams, $route, $location) {

    $scope.ezHotelModules = [];
    $scope.ezModules = [];
    $scope.allHotelModules = [];
    $scope.CurrencyMarket = {};
    $scope.page = {
        hotel_filter: ''
    };

    // phân trang modeulePaymentManagement
    $scope.currentPage = 0;
    $scope.pageSize = 30;
    $scope.totalRecord = 0;

    $scope.numberOfPages = function () {
        return Math.ceil($scope.totalRecord / $scope.pageSize);
    }

    $scope.resetCurrentPage = function () {
        $scope.currentPage = 0;
    }
    // 

    $scope.hotelList = [];

    function Init() {
        jQuery(document).unbind('keydown');
        console.log($rootScope);
        if ($rootScope != null && $rootScope.user != null && $rootScope.user.Roles != "ROLE_HOTEL_OWNER") {
            //dialogService.messageBox("NOT_AUTHORIZED", "THE_CURRENT_USER_WERE_NOT_AUTHORIZED_TO_MANAGE_HOTEL_MODULE_AND_PAYMENT");
            //return;
            var translated_title = $filter("translate")("NOT_AUTHORIZED");
            var translated_content = $filter("translate")("THE_CURRENT_USER_WERE_NOT_AUTHORIZED_TO_MANAGE_HOTEL_MODULE_AND_PAYMENT");
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
            ).then(function () {
                //$location.path("home");
                $state.go("home");
            });
            return;
        } else {
            $windowScope = $scope;
            $scope.message = null;
            $scope.isPaymentOption = false;
            $scope.paymentOption = 0;
            $scope.paymentByTime = "3_MONTH_PAYMENT";
            $scope.totalPayment = 0;
            $scope.totalPerDay = 0;
            $scope.paymentList = [
                {
                    PaymentCode: "1_MONTH_PAYMENT",
                    PaymentUnit: 1,
                    PaymentAmount: 0,
                    PaymentDiscount: [
                        { key: "ROOM", val: 0 },
                        { key: "POS", val: 0 },
                        { key: "EMAIL_MARKETING", val: 0 },
                        { key: "THUCHI", val: 0 },
                        { key: "SMARTCARD", val: 0 },
                        { key: "CMSTAAH", val: 0 },
                        { key: "CMBOOKLOGIC", val: 0},
                        { key: "CMSITEMINDER", val: 0},
                        { key: "BE", val: 0}
                    ]
                }, {
                    PaymentCode: "3_MONTH_PAYMENT",
                    PaymentUnit: 3,
                    PaymentAmount: 0,
                    PaymentDiscount: [
                        { key: "ROOM", val: 0 },
                        { key: "POS", val: 0 },
                        { key: "EMAIL_MARKETING", val: 0 },
                        { key: "THUCHI", val: 0 },
                        { key: "SMARTCARD", val: 0 },
                        { key: "CMSTAAH", val: 0 },
                        { key: "CMBOOKLOGIC", val: 0},
                        { key: "CMSITEMINDER", val: 0},
                        { key: "BE", val: 0}
                    ]
                }, {
                    PaymentCode: "6_MONTHS_PAYMENT",
                    PaymentUnit: 6,
                    PaymentAmount: 0,
                    PaymentDiscount: [
                        { key: "ROOM", val: 0 },
                        { key: "POS", val: 0 },
                        { key: "EMAIL_MARKETING", val: 0 },
                        { key: "THUCHI", val: 0 },
                        { key: "SMARTCARD", val: 0 },
                        { key: "CMSTAAH", val: 0 },
                        { key: "CMBOOKLOGIC", val: 0},
                        { key: "CMSITEMINDER", val: 0},
                        { key: "BE", val: 0}
                    ]

                }, {
                    PaymentCode: "12_MONTHS_PAYMENT",
                    PaymentUnit: 12,
                    PaymentAmount: 0,
                    PaymentDiscount: [
                        { key: "ROOM", val: 5 },
                        { key: "POS", val: 0 },
                        { key: "EMAIL_MARKETING", val: 0 },
                        { key: "THUCHI", val: 0 },
                        { key: "SMARTCARD", val: 0 },
                        { key: "CMSTAAH", val: 0 },
                        { key: "CMBOOKLOGIC", val: 0},
                        { key: "CMSITEMINDER", val: 0},
                        { key: "BE", val: 0}
                    ]

                }, {
                    PaymentCode: "24_MONTHS_PAYMENT",
                    PaymentUnit: 24,
                    PaymentAmount: 0,
                    PaymentDiscount: [
                        { key: "ROOM", val: 10 },
                        { key: "POS", val: 0 },
                        { key: "EMAIL_MARKETING", val: 0 },
                        { key: "THUCHI", val: 0 },
                        { key: "SMARTCARD", val: 0 },
                        { key: "CMSTAAH", val: 0 },
                        { key: "CMBOOKLOGIC", val: 0},
                        { key: "CMSITEMINDER", val: 0},
                        { key: "BE", val: 0}
                    ]
                }];
            var getAllManagementData = loginFactory.securedGet("api/Management/GetAllManagementData");
            $rootScope.dataLoadingPromise = getAllManagementData;
            getAllManagementData.success(function (data) {
                $scope.allHotelModules = data.allHotelModules;
                $scope.hotelRooms = data.hotelRooms;
                $scope.remainingDays = data.remainingDays;
                $scope.CurrencyMarket = data.currencyMarket;
                var frac = data.defaultCurrency !== null ? parseInt(data.defaultCurrency.MinorUnit) : 0;
                $locale.NUMBER_FORMATS.PATTERNS[1].maxFrac = frac;
                $locale.NUMBER_FORMATS.PATTERNS[1].minFrac = frac;
                $locale.NUMBER_FORMATS.CURRENCY_SYM = data.defaultCurrency !== null ? data.defaultCurrency.AlphabeticCode + " " : "VND ";
                if ($scope.allHotelModules != null && $scope.allHotelModules.length > 0) {
                    for (var index in $scope.allHotelModules) {
                        var moduleTemp = $scope.allHotelModules[index];
                        if (moduleTemp.moduleDiscount != null){
                            moduleTemp.moduleDiscount.StartDate = new Date(moduleTemp.moduleDiscount.StartDate);
                            moduleTemp.moduleDiscount.EndDate = new Date(moduleTemp.moduleDiscount.EndDate);
                        }
                        if (moduleTemp.hotelModule && moduleTemp.hotelModule.length>0 && moduleTemp.hotelModule[0].Status == true) {
                            for (var pIndex in $scope.paymentList) {
                                var paymentTemp = $scope.paymentList[pIndex];
                                var money = 0;   
                                money = (moduleTemp.moduleRangePrice ==null)?0:moduleTemp.moduleRangePrice.AmountPerMonth;                           
                                for(var discount in paymentTemp.PaymentDiscount){
                                    if(paymentTemp.PaymentDiscount[discount].key == moduleTemp.module.ModuleCode){
                                        money = (moduleTemp.moduleRangePrice ==null)?0:moduleTemp.moduleRangePrice.AmountPerMonth * (100 - paymentTemp.PaymentDiscount[discount].val)/100;
                                    }                              
                                }   
                                // money = (moduleTemp.moduleRangePrice ==null)?0:moduleTemp.moduleRangePrice.AmountPerMonth;                         
                                paymentTemp.PaymentAmount = paymentTemp.PaymentAmount + money * paymentTemp.PaymentUnit;
                            }
                        }
                    }
                    for (var index in $scope.paymentList){
                        $scope.paymentList[index].PaymentAmount = $scope.paymentList[index].PaymentAmount;
                    }
                }
                console.info("allHotelModules", $scope.allHotelModules);

                // Payment Logs
                $scope.HotelAccounts = data.HotelAccounts;
                for (var index in $scope.HotelAccounts) {
                    $scope.hotelList.push($scope.HotelAccounts[index]);
                }

                $scope.isReferralProgramActived = data.referralProgram != null;
                $scope.isHotelFirstPayment = true;

                var newPaymentLogs = _.filter(data.PaymentLogs, function (item) {

                    return item != null && item.LogKey == "NEW_PAYMENT" && item.Status == 0
                });
                if (newPaymentLogs != null && newPaymentLogs.length > 0) {
                    $scope.isHotelFirstPayment = false;
                    console.info("item", $scope.isHotelFirstPayment);
                }

                for (var index in data.PaymentLogs) {
                    if (data.PaymentLogs[index].CreatedDate) {
                        data.PaymentLogs[index].CreatedDate = new Date(data.PaymentLogs[index].CreatedDate);
                    }
                    switch (data.PaymentLogs[index].Status) {
                        case 0:
                            data.PaymentLogs[index].message = "PAYMENT_SUCCESSFUL";
                            break;
                        case 1:
                            data.PaymentLogs[index].message = "PAYMENT_PENDING";
                            break;
                        case 2:
                            data.PaymentLogs[index].message = "PAYMENT_FAILED";
                            break;
                        case 3:
                            data.PaymentLogs[index].message = "PAYMENT_NOT_PROCESSED";
                            break;
                    }
                }

                $scope.totalPayment = $scope.paymentList[1].PaymentAmount;
                $scope.PaymentLogs = data.PaymentLogs;
                $scope.totalRecord = data.PaymentLogs.length;
                console.log('$scope.PaymentLogs', $scope.PaymentLogs);
            }).error(function (err) { });
        }
    }
    Init();

    $scope.paymentCompleted = function (queryString) {
        if (queryString && queryString[0] == "?") {
            queryString = queryString.substring(1);
        }
        var paymentCompleted = loginFactory.securedGet("api/BackendPayment/ProcessReturnUrl", queryString);
        $rootScope.dataLoadingPromise = paymentCompleted;
        paymentCompleted.success(function (data) {
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
            dialogService.messageBox("", $scope.message).then(function (data) {
                //Init();
                currentScope.Init();
            });
        });
        paymentCompleted.error(function (err) {
            console.log(err);
        })
    };

    $scope.goToPricePage = function () {
        window.open('http://ezcloudhotel.com/phi-dich-vu/');
    };

    $scope.goToReferralPage = function () {
        window.open('http://ezcloudhotel.com/phi-dich-vu/');
    };
    $scope.$watchCollection("paymentByTime", function (newValue, oldValue) {
        if (newValue != null && newValue != undefined) {
            if (newValue != "OPTION") {
                $scope.isPaymentOption = false;
                $scope.totalPayment = _.filter($scope.paymentList, function (item) {
                    return item.PaymentCode == newValue
                })[0].PaymentAmount;
            } else {
                $scope.isPaymentOption = true;
            }

        }
    });

    var cmstaahOn = 'IS_CMSTAAH_ON';
    var cmstaahOff = 'IS_CMSTAAH_OFF';

    //var cmbooklogicOn='IS_CMBOOKLOGIC_ON';
    //var cmbooklogicOff='IS_CMBOOKLOGIC_OFF';

    var cmsmartcardOn = 'IS_SMARTCARD_ON';
    var cmsmartcardOff = 'IS_SMARTCARD_OFF';

    $scope.updateModule = function (module) {


        //console.log('module', module);
        if (module.module.ModuleCode == 'CMSTAAH' && module.hotelModule[0].Status == false) {
            dialogService.confirm('CONFIRM', cmstaahOff).then(function () {
                var updateModule = loginFactory.securedPostJSON("api/Management/UpdateModule", module);
                $rootScope.dataLoadingPromise = updateModule;
                updateModule.success(function (data) {
                    //Init();
                    $window.location.reload();
                }).error(function (err) { })
            }, function () {
                module.hotelModule[0].Status = !module.hotelModule[0].Status;
            })
        }

        if (module.module.ModuleCode == 'CMSTAAH' && module.hotelModule[0].Status == true) {
            dialogService.confirm('CONFIRM', cmstaahOn).then(function () {
                var updateModule = loginFactory.securedPostJSON("api/Management/UpdateModule", module);
                $rootScope.dataLoadingPromise = updateModule;
                updateModule.success(function (data) {
                    //Init();
                    $window.location.reload();
                }).error(function (err) { })
            }, function () {
                module.hotelModule[0].Status = !module.hotelModule[0].Status;
            })
        }

        if (module.module.ModuleCode == 'CMBOOKLOGIC' && module.hotelModule[0].Status == false) {
            dialogService.confirm('CONFIRM', cmstaahOff).then(function () {
                var updateModule = loginFactory.securedPostJSON("api/Management/UpdateModule", module);
                $rootScope.dataLoadingPromise = updateModule;
                updateModule.success(function (data) {
                    //Init();
                    $window.location.reload();
                }).error(function (err) { })
            }, function () {
                module.hotelModule[0].Status = !module.hotelModule[0].Status;
            })
        }

        if (module.module.ModuleCode == 'CMBOOKLOGIC' && module.hotelModule[0].Status == true) {
            dialogService.confirm('CONFIRM', cmstaahOn).then(function () {
                var updateModule = loginFactory.securedPostJSON("api/Management/UpdateModule", module);
                $rootScope.dataLoadingPromise = updateModule;
                updateModule.success(function (data) {
                    //Init();
                    $window.location.reload();
                }).error(function (err) { })
            }, function () {
                module.hotelModule[0].Status = !module.hotelModule[0].Status;
            })
        }

        if (module.module.ModuleCode == 'CMSITEMINDER' && module.hotelModule[0].Status == false) {
            dialogService.confirm('CONFIRM', cmstaahOff).then(function () {
                var updateModule = loginFactory.securedPostJSON("api/Management/UpdateModule", module);
                $rootScope.dataLoadingPromise = updateModule;
                updateModule.success(function (data) {
                    //Init();
                    $window.location.reload();
                }).error(function (err) { })
            }, function () {
                module.hotelModule[0].Status = !module.hotelModule[0].Status;
            })
        }

        if (module.module.ModuleCode == 'CMSITEMINDER' && module.hotelModule[0].Status == true) {
            dialogService.confirm('CONFIRM', cmstaahOn).then(function () {
                var updateModule = loginFactory.securedPostJSON("api/Management/UpdateModule", module);
                $rootScope.dataLoadingPromise = updateModule;
                updateModule.success(function (data) {
                    //Init();
                    $window.location.reload();
                }).error(function (err) { })
            }, function () {
                module.hotelModule[0].Status = !module.hotelModule[0].Status;
            })
        }

        if (module.module.ModuleCode == 'BE' && module.hotelModule[0].Status == true) {
            dialogService.confirm('CONFIRM', "DO_YOU_WANT_TO_ACTIVE_BOOKINGENGINE_MODULE").then(function () {
                var updateModule = loginFactory.securedPostJSON("api/Management/UpdateModule", module);
                $rootScope.dataLoadingPromise = updateModule;
                updateModule.success(function (data) {
                    $window.location.reload();
                }).error(function (err) {})
            }, function () {
                module.hotelModule[0].Status = !module.hotelModule[0].Status;
            })
        }

        if (module.module.ModuleCode == 'BE' && module.hotelModule[0].Status == false) {
            dialogService.confirm('CONFIRM', "DO_YOU_WANT_TO_INACTIVE_BOOKINGENGINE_MODULE").then(function () {
                var updateModule = loginFactory.securedPostJSON("api/Management/UpdateModule", module);
                $rootScope.dataLoadingPromise = updateModule;
                updateModule.success(function (data) {
                    $window.location.reload();
                }).error(function (err) {})
            }, function () {
                module.hotelModule[0].Status = !module.hotelModule[0].Status;
            })
        }

        if (module.module.ModuleCode == 'SMARTCARD' && module.hotelModule[0].Status == false) {
            dialogService.confirm('CONFIRM', cmsmartcardOff).then(function () {
                var updateModule = loginFactory.securedPostJSON("api/Management/UpdateModule", module);
                $rootScope.dataLoadingPromise = updateModule;
                updateModule.success(function (data) {
                    //Init();
                }).error(function (err) { })
            }, function () {
                module.hotelModule[0].Status = !module.hotelModule[0].Status;
            })
        }

        if (module.module.ModuleCode == 'POS' && module.hotelModule[0].Status == true) {
            dialogService.confirm('CONFIRM', "DO_YOU_WANT_TO_ACTIVE_POS_MODULE").then(function () {
                var updateModule = loginFactory.securedPostJSON("api/Management/UpdateModule", module);
                $rootScope.dataLoadingPromise = updateModule;
                updateModule.success(function (data) {
                    //Init();
                    //$state.go($state.current, {}, {reload: true});
                    $window.location.reload();
                }).error(function (err) { })
            }, function () {
                module.hotelModule[0].Status = !module.hotelModule[0].Status;
            })
        }

        if (module.module.ModuleCode == 'POS' && module.hotelModule[0].Status == false) {
            dialogService.confirm('CONFIRM', "DO_YOU_WANT_TO_INACTIVE_POS_MODULE").then(function () {
                var updateModule = loginFactory.securedPostJSON("api/Management/UpdateModule", module);
                $rootScope.dataLoadingPromise = updateModule;
                updateModule.success(function (data) {
                    //Init();
                    $window.location.reload();
                }).error(function (err) { })
            }, function () {
                module.hotelModule[0].Status = !module.hotelModule[0].Status;
            })
        }

        if (module.module.ModuleCode == 'EMAIL_MARKETING' && module.hotelModule[0].Status == true) {
            dialogService.confirm('CONFIRM', "DO_YOU_WANT_TO_ACTIVE_EMAIL_MARKETING_MODULE").then(function () {
                var updateModule = loginFactory.securedPostJSON("api/Management/UpdateModule", module);
                $rootScope.dataLoadingPromise = updateModule;
                updateModule.success(function (data) {
                    //Init();
                    //$state.go($state.current, {}, {reload: true});
                    $window.location.reload();
                }).error(function (err) { })
            }, function () {
                module.hotelModule[0].Status = !module.hotelModule[0].Status;
            })
        }

        if (module.module.ModuleCode == 'EMAIL_MARKETING' && module.hotelModule[0].Status == false) {
            dialogService.confirm('CONFIRM', "DO_YOU_WANT_TO_INACTIVE_EMAIL_MARKETING_MODULE").then(function () {
                var updateModule = loginFactory.securedPostJSON("api/Management/UpdateModule", module);
                $rootScope.dataLoadingPromise = updateModule;
                updateModule.success(function (data) {
                    //Init();
                    $window.location.reload();
                }).error(function (err) { })
            }, function () {
                module.hotelModule[0].Status = !module.hotelModule[0].Status;
            })
        }

        if (module.module.ModuleCode == 'SMARTCARD' && module.hotelModule[0].Status == true) {
            dialogService.confirm('CONFIRM', cmsmartcardOn).then(function () {
                var updateModule = loginFactory.securedPostJSON("api/Management/UpdateModule", module);
                $rootScope.dataLoadingPromise = updateModule;
                updateModule.success(function (data) {
                    Init();
                }).error(function (err) { })
            }, function () {
                module.hotelModule[0].Status = !module.hotelModule[0].Status;
            })
        }

        if (module.module.ModuleCode == 'THUCHI' && module.hotelModule[0].Status == true) {
            dialogService.confirm('CONFIRM', "DO_YOU_WANT_TO_ACTIVE_THUCHI_MODULE").then(function () {
                var updateModule = loginFactory.securedPostJSON("api/Management/UpdateModule", module);
                $rootScope.dataLoadingPromise = updateModule;
                updateModule.success(function (data) {
                    $window.location.reload();
                }).error(function (err) {})
            }, function () {
                module.hotelModule[0].Status = !module.hotelModule[0].Status;
            })
        }

        if (module.module.ModuleCode == 'THUCHI' && module.hotelModule[0].Status == false) {
            dialogService.confirm('CONFIRM', "DO_YOU_WANT_TO_INACTIVE_THUCHI_MODULE").then(function () {
                var updateModule = loginFactory.securedPostJSON("api/Management/UpdateModule", module);
                $rootScope.dataLoadingPromise = updateModule;
                updateModule.success(function (data) {
                    $window.location.reload();
                }).error(function (err) {})
            }, function () {
                module.hotelModule[0].Status = !module.hotelModule[0].Status;
            })
        }

        if (module.module.ModuleCode == 'PASSPORT' && module.hotelModule[0].Status == true) {
            dialogService.confirm('CONFIRM', "DO_YOU_WANT_TO_ACTIVE_PASSPORT_MODULE").then(function () {
                var updateModule = loginFactory.securedPostJSON("api/Management/UpdateModule", module);
                $rootScope.dataLoadingPromise = updateModule;
                updateModule.success(function (data) {
                    $window.location.reload();
                }).error(function (err) {})
            }, function () {
                module.hotelModule[0].Status = !module.hotelModule[0].Status;
            })
        }

        if (module.module.ModuleCode == 'PASSPORT' && module.hotelModule[0].Status == false) {
            dialogService.confirm('CONFIRM', "DO_YOU_WANT_TO_INACTIVE_PASSPORT_MODULE").then(function () {
                var updateModule = loginFactory.securedPostJSON("api/Management/UpdateModule", module);
                $rootScope.dataLoadingPromise = updateModule;
                updateModule.success(function (data) {
                    $window.location.reload();
                }).error(function (err) {})
            }, function () {
                module.hotelModule[0].Status = !module.hotelModule[0].Status;
            })
        }
    };

    $scope.HotelAccounts = [];
    $scope.PaymentLogs = [];

    function redirectCallback() {
        window.open('redirect.html');
    }

    function pop(url, w, h) {
        n = window.open(url, '_blank');
        if (n == null) {
            return true;
        }
        return false;
    }

    $scope.processHotelBackendPayment = function () {
        var totalPaymentTemp = $scope.paymentByTime != "OPTION" ? angular.copy($scope.totalPayment) : angular.copy($scope.paymentOption);
        console.log("totalPaymentTemp", $scope.paymentOption);
        if ($scope.paymentByTime == "OPTION" && totalPaymentTemp < $scope.paymentList[1].PaymentAmount) {
            dialogService.messageBox("WARNING", "MINIMUM_AMOUNT_EQUALS_TO_THE_SUM_OF_3_MONTH_PAYMENT");
            return;
        }
        $mdDialog.show({
            controller: ProcessHotelBackendPaymentDialogController,
            templateUrl: 'views/templates/hotelBackendPayment.tmpl.html',
            resolve: {
                totalPayment: function () {
                    return totalPaymentTemp;
                },
                decimal: function () {
                    return $locale.NUMBER_FORMATS.PATTERNS[1].maxFrac;
                },
                allHotelModules: function () {
                    return $scope.allHotelModules;
                },
                currentScope: function () {
                    return $scope;
                },
                paymentByTime: function () {
                    return $scope.paymentByTime;
                },
                paymentAmountPerMonth: function () {
                    return $scope.paymentList[0].PaymentAmount;
                },
                isHotelFirstPayment: function () {
                    return $scope.isHotelFirstPayment;
                },
                isReferralProgramActived: function () {
                    return $scope.isReferralProgramActived;
                }
            },
            parent: angular.element(document.body),
            targetEvent: null,
            clickOutsideToClose: false,
        })
            .then(function (message) {
                if (message != null) {
                    dialogService.messageBox("", message).then(function (data) {
                        Init();
                    });
                } else {
                    dialogService.messageBox("", "AN_ERROR_OCCURRED_DURING_PAYMENT_PROCESS._PLEASE_TRY_AGAINT").then(function (data) {
                        Init();
                    });
                }

            }, function () { });

        function ProcessHotelBackendPaymentDialogController($scope, $rootScope, $mdDialog, $window, loginFactory, dialogService, totalPayment, decimal, allHotelModules, currentScope, paymentByTime, paymentAmountPerMonth, isHotelFirstPayment, isReferralProgramActived) {
            function Init() {
                $scope.agreed = false;
                $scope.decimal = decimal;
                $scope.selectLanguage = $rootScope.language;
                $scope.allHotelModules = allHotelModules;
                $scope.paymentByTime = paymentByTime;
                $scope.paymentAmountPerMonth = paymentAmountPerMonth;
                $scope.message = null;
                $scope.totalPayment = angular.copy(totalPayment);
                $scope.isHotelFirstPayment = isHotelFirstPayment;
                $scope.isReferralProgramActived = isReferralProgramActived;
                $scope.paymentModel = {
                    isDomestic: true,
                    Amount: totalPayment,
                    additionalAmount: 0,
                    ReferralCode: null
                };
                $scope.paymentError = null;
            }
            Init();
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.paymentCompleted = function (queryString) {
                if (queryString && queryString[0] == "?") {
                    queryString = queryString.substring(1);
                }
                var paymentCompleted = loginFactory.securedGet("api/BackendPayment/ProcessReturnUrl", queryString);
                $rootScope.dataLoadingPromise = paymentCompleted;
                paymentCompleted.success(function (data) {
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
                    $mdDialog.hide($scope.message);
                });
                paymentCompleted.error(function (err) {
                    console.log(err);
                })
            };

            $scope.processPayment = function () {
                var description = "Thanh toán mới " + $scope.paymentModel.Amount + " - Module [";
                if ($scope.allHotelModules != null && $scope.allHotelModules.length > 0) {
                    for (var index in $scope.allHotelModules) {
                        var module = $scope.allHotelModules[index];
                        if (module.hotelModule && module.hotelModule.length > 0 && module.hotelModule[0].Status == true) {
                            description = description.concat(module.module.ModuleName);
                        }
                    }
                    if (description[description.length - 1] == ",") {
                        description = description.substring(description.length - 1);
                    }
                    description = description.concat("]");
                }
                $scope.paymentModel.Description = description;
                //$scope.paymentModel.ReferralCode = $scope.referralCode;
                if ($scope.paymentByTime == "12_MONTHS_PAYMENT") {
                    var amountTemp = 12 * $scope.paymentAmountPerMonth;
                    $scope.paymentModel.additionalAmount = amountTemp - $scope.totalPayment;

                    console.log('paymentAmountPerMonth, amountTemp,totalPayment:', $scope.paymentAmountPerMonth, amountTemp, $scope.totalPayment);

                }
                if ($scope.paymentByTime == "24_MONTHS_PAYMENT") {
                    var amountTemp = 24 * $scope.paymentAmountPerMonth;
                    $scope.paymentModel.additionalAmount = amountTemp - $scope.totalPayment;
                }
                if ($rootScope.language == "") $scope.paymentModel.vpc_Locale = "vn";
                else $scope.paymentModel.vpc_Locale = $rootScope.language;

                var processHotelBackendPayment = loginFactory.securedPostJSON("api/BackendPayment/CreateBackendPayment", $scope.paymentModel);
                $rootScope.dataLoadingPromise = processHotelBackendPayment;
                processHotelBackendPayment.success(function (data) {
                    var stringResult = data.toString();
                    if (stringResult.startsWith("ERROR")) {
                        $scope.paymentError = stringResult;
                        return;
                    }
                    localStorage.scope = $scope;
                    localStorage.isDomestic = $scope.paymentModel.isDomestic;
                    location.href = data;
                }).error(function (err) {
                    console.log(err.Message);
                });
            }
        }
    };

    $scope.testAudit = function () {
        var testAudit = loginFactory.securedPostJSON("api/Management/TestAudit", "");
        testAudit.success(function (data) {
            $scope.HotelAccounts = data.HotelAccounts;
            $scope.PaymentLogs = data.PaymentLogs;
        }).error(function (err) { })
    };

    $scope.showPayment = false;
    $scope.showDetailMethodPayment = function () {
        $scope.showPayment = !$scope.showPayment;
    }

}]);
ezCloud.filter('startFrom', function () {
    return function (input, start) {
        start = +start;
        if (angular.isArray(input) && input.length > 0) {
            return input.slice(start);
        }
        return input;
    }
});