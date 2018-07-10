 
var IsActivePassPortModule = false;
var startTime = new Date(); 
var useTheme = "ThemeNormal";
if(localStorage.getItem("UseTheme") == null){

}else{
    useTheme = localStorage.getItem("UseTheme");
}
$('head').append('<link rel="stylesheet" type="text/css" href="lib/'+useTheme+'.css">');
var firstCallHomeJs = 1;
var scripts = document.getElementsByTagName("script");
var appFileName = scripts[scripts.length - 1].src;
var isCordovaApp = !!window.cordova;
if (!isCordovaApp) {
    appFileName = appFileName.substr(appFileName.lastIndexOf("/") + 1);
    var appVersion = appFileName.substr(appFileName.indexOf(".") + 1);
    if (appVersion == "js") {
        appVersion = "localhost";
    } else appVersion = appVersion.substring(0, appVersion.length - 3);
    var serverVersion = appVersion;
}

function onDeviceReady() {
    // Now safe to use device APIs
    // retrieve the DOM element that had the ng-app attribute
    var domElement = document.getElementById("mainWrap");
    angular.bootstrap(domElement, ["ezCloud"]);
    window.open = cordova.InAppBrowser.open;
}

// var apiUrl = "http://ezcloudi.com/";
var apiUrl = "http://localhost:21326/";
// var apiUrl = "http://branchtest.ezcloudi.com/";
if (window.location.host.indexOf("localhost") < 0) {
    if (window.location.protocol !== "file:")
        apiUrl = "/";
    // apiUrl = "http://pms.ezcloudhotel.com/";
    else //if the app is running in cordova
        apiUrl = "http://ezcloudhotel.com/";
}
hotelRedirect();

function hotelRedirect() {
    //if the app is running in cordova
    if (window.location.protocol !== "file:") return;
    if (window.location.hostname !== 'localhost') {
        var parts = location.hostname.split('.');
        var subdomain = parts.shift();
        var upperleveldomain = parts.join('.');
        var sndleveldomain = parts.slice(-2).join('.');
        if (parts.length > 1) {
            //has subdomain, redirect
            //redirect https
            if (window.location.hostname.toLowerCase().indexOf("ezcloudhotel.com") >= 0) window.location = "http://" + upperleveldomain + "/#/login/" + subdomain;
            else window.location = "http://" + upperleveldomain + "/#/login/" + subdomain;
        } else {
            if (window.location.protocol !== "http:") {
                if (window.location.hostname.toLowerCase().indexOf("ezcloudhotel.com") >= 0) window.location = "http://" + window.location.hostname + window.location.pathname + window.location.search + window.location.hash;

            }
        }
    }

    window.location.reload();
}


var ezCloud = angular.module('ezCloud', ['ckeditor', 'ngMaterial', 'ngAnimate', 'ngRoute', 'ui.router', 'pascalprecht.translate', 'ngMdIcons', 'angular.filter', 'ngMessages', 'mdDateTime', 'ngStorage', 'cgBusy', 'mgo-angular-wizard', 'ngCookies', 'flow', 'timer', 'kendo.directives', 'angulartics', 'angulartics.google.analytics', 'fcsa-number', 'ng-fastclick', 'ui.utils.masks', 'dndLists', 'angular-timeline', 'ngNotify', 'md.data.table', 'mdSteppers', 'angular-tour', 'angularInlineEdit', 'mdPickers']);


var hotelConfigResolve = ['configFactory', 'ngNotify', '$filter', '$location', function (configFactory, ngNotify, $filter, $location) {
    var currentHotel = configFactory.getCurrentHotel();
    if (currentHotel.HotelId != null && currentHotel.HotelId != undefined) {
        configFactory.ezHotelBackEndPaymentResolve(currentHotel);
    } else {
        currentHotel.then(function (data) {
            configFactory.ezHotelBackEndPaymentResolve(data);
        })
    }
    return currentHotel;
}];

var hotelConnectivitiesResolve = ['configFactory', function (configFactory) {
    return configFactory.getCurrentHotelConnectivities();
}];

var hotelPOSModuleResolve = ['$rootScope', '$mdDialog', '$location', function ($rootScope, $mdDialog, $location) {
    console.info("TEST APPJS");
    var ezHotelModulesList = $rootScope.HotelSettings.EzHotelModulesList;
    if (ezHotelModulesList != null && ezHotelModulesList.length > 0) {
        var posModule = _.filter(ezHotelModulesList, function (module) {
            return module.EzModules != null && module.EzModules.ModuleCode == "POS" && module.EzModules.Status == true && module.Status == true;
        });
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
            ).then(function () {
                $location.path("modulePaymentManagement");
            });
        }
    }

}];

var secureResolve = ['loginFactory', '$rootScope', '$q', '$location', 'dialogService', '$state', function (loginFactory, $rootScope, $q, $location, dialogService, $state) {
    var processing = $q.defer();
    loginFactory.isAuthenticated(function () {
        processing.resolve();
        $rootScope.loggedIn = true;
        $rootScope.showMenu = true;
    }, function () {
        processing.resolve();
        location.href = "/#/login";
        $rootScope.showMenu = false;
    });
    return processing.promise;
}];
ezCloud.config(['$stateProvider', '$urlRouterProvider', '$mdThemingProvider', '$logProvider', '$httpProvider', 'flowFactoryProvider', '$translateProvider', '$analyticsProvider', 'fcsaNumberConfigProvider', '$compileProvider', function ($stateProvider, $urlRouterProvider, $mdThemingProvider, $logProvider, $httpProvider, flowFactoryProvider, $translateProvider, $analyticsProvider, fcsaNumberConfigProvider, $compileProvider) {
    if (window.location.hostname !== 'localhost') $compileProvider.debugInfoEnabled(false);
    flowFactoryProvider.defaults = {
        target: apiUrl + 'api/File/Upload',
        permanentErrors: [404, 500, 501]
    };
    // You can also set default events:

    flowFactoryProvider.on('catchAll', function (event, response) {
        console.log(event, response);
    });
    var roles = {
        superUser: 0,
        hotelOwner: 1,
        hotelManager: 2,
        hotelStaff: 3
    };
    $mdThemingProvider.theme('default').accentPalette('light-blue');
    //$logProvider.debugEnabled(false);
    //format number
    fcsaNumberConfigProvider.setDefaultOptions({
        min: 0,
        preventInvalidInput: true
    });
    $stateProvider.state('login', {
            url: '/login',
            templateUrl: 'views/membership/login.html',
            controller: 'loginController'
        }).state('advancedLogin', {
            url: '/advancedLogin',
            templateUrl: 'views/membership/advancedLogin.html',
            controller: 'advancedLoginController'
        }).state('loginUrl', {
            url: '/login/:url',
            templateUrl: 'views/membership/login.html',
            controller: 'loginController'
        })
        /*.state('signup', {
            url: '/signup',
            templateUrl: 'views/membership/signup.html',
            controller: 'signUpController',
            params: {
                preAuth: null
            }
        })*/
        .state('ezcloudhotelsignup', {
            url: '/ezcloudhotelsignup',
            templateUrl: 'views/membership/signup.html',
            controller: 'signUpController',
            params: {
                preAuth: null
            }
        }).state('forgotPassword', {
            url: '/forgotPassword',
            templateUrl: 'views/membership/forgotPassword.html',
            controller: 'forgotPasswordController'
        }).state('signUpSuccess', {
            url: '/signUpSuccess',
            templateUrl: 'views/membership/signUpSuccess.html',
            controller: ''
        }).state('emailConfirm', {
            url: '/ConfirmEmail/:userId/:code',
            templateUrl: 'views/membership/emailConfirm.html',
            controller: 'emailConfirmController'
        }).state('ResetPassword', {
            url: '/ResetPassword/:userId/:email/:code',
            templateUrl: 'views/membership/resetPassword.html',
            controller: 'resetPasswordController'
        }).state('logout', {
            url: '/logout',
            template: null,
            controller: 'LogoutCtrl'
        }).state('dashboard', {
            url: '/dashboard',
            templateUrl: 'views/dashboards/home.html',
            controller: 'dashboardsController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve,
                currentHotelConnectivities: hotelConnectivitiesResolve,
            }
        }).state('home', {
            url: '/home',
            templateUrl: 'views/dashboard/home.html',
            controller: 'homeController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve,
                currentHotelConnectivities: hotelConnectivitiesResolve,
            }
        }).state('timeline', {
            url: '/timeline',
            templateUrl: 'views/dashboard/timeline.html',
            controller: 'timeLineController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve,
                currentHotelConnectivities: hotelConnectivitiesResolve,
            }
        }).state('logs', {
            url: '/logs',
            templateUrl: 'views/dashboard/logs.html',
            controller: 'logsController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('configurationLogs', {
            url: '/configurationLogs',
            templateUrl: 'views/dashboard/configurationLogs.html',
            controller: 'configurationLogsController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        })
        .state('refferralProgram', {
            url: '/refferralProgram',
            templateUrl: 'views/dashboard/refferralProgram.html',
            controller: 'refferralProgramController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('refferralProgramArticle2', {
            url: '/refferralProgramArticle2',
            templateUrl: 'views/dashboard/refferralProgramArticle2.html',
            controller: 'refferralProgramArticle2Controller',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('refferralProgramDef', {
            url: '/refferralProgramDef',
            templateUrl: 'views/dashboard/refferralProgramDef.html',
            controller: 'refferralProgramDefController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        })
        .state('stats', {
            url: '/stats',
            templateUrl: 'views/dashboard/stats.html',
            controller: 'statsController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('reports', {
            url: '/reports',
            templateUrl: 'views/reports/list.html',
            controller: 'reportListController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('reportView', {
            url: '/reports/:name',
            templateUrl: 'views/reports/report.html',
            controller: 'reportController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('walkin', {
            url: '/walkin',
            templateUrl: 'views/reservation/walkin.html',
            controller: 'walkinController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve,
                currentHotelConnectivities: hotelConnectivitiesResolve,
            }
        }).state('walkin Room', {
            url: '/walkin/:roomId',
            templateUrl: 'views/reservation/walkin.html',
            controller: 'walkinController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve,
                currentHotelConnectivities: hotelConnectivitiesResolve,
            }
        }).state('reservation', {
            url: '/reservation/:reservationRoomId',
            templateUrl: 'views/reservation/walkin.html',
            controller: 'walkinController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve,
                currentHotelConnectivities: hotelConnectivitiesResolve,
            }
        }).state('extendedScreen', {
            url: '/extendedScreen',
            templateUrl: 'views/extendedScreen/extendedScreen.html',
            controller: 'extendedScreenController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve,
                currentHotelConnectivities: hotelConnectivitiesResolve,
            }
        }).state('hotelQuickSettings', {
            url: '/ezcloudhotelhotelQuickSettings',
            templateUrl: 'views/hotel/hotelQuickSettings.html',
            controller: 'hotelQuickSettingsController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            },
            onEnter: function ($rootScope, $stateParams, $state, $mdDialog, $filter, hotelFactory, loginFactory, dialogService, configFactory, commonFactory, $locale) {

                dialogService.confirm("", "WOULD_YOU_LIKE_TO_USE_DEFAULT_DEMO_HOTEL?").then(function () {
                    $mdDialog.show({
                        controller: DemoHotelSystemInfoDialogController,
                        templateUrl: 'views/hotel/demoHotelSystemInfo.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: event,
                    }).then(function (demoHotel) {
                        var quickSettings = loginFactory.securedPostJSON("api/Hotel/CreateDemoHotel", demoHotel);
                        $rootScope.dataLoadingPromise = quickSettings;

                        quickSettings.success(function (data) {
                            dialogService.toast("CREATE_HOTEL_SUCCESSFUL");
                            hotelFactory.setCurrentUserDefaultHotelId(data.HotelId, function () {
                                configFactory.setCurrentHotel({});
                                console.log('on enter');
                                commonFactory.getHotelCommonInformation(function (data) {

                                    var frac = data.Currency !== null ? parseInt(data.Currency.MinorUnit) : 0;
                                    $locale.NUMBER_FORMATS.PATTERNS[1].maxFrac = frac;
                                    $locale.NUMBER_FORMATS.PATTERNS[1].minFrac = frac;
                                    $locale.NUMBER_FORMATS.CURRENCY_SYM = data.Currency !== null ? data.Currency.AlphabeticCode + " " : "VND ";
                                    $rootScope.decimals = frac;
                                });
                                $state.transitionTo("home");
                            });

                        }).error(function (err) {});
                    }, function () {});

                    function DemoHotelSystemInfoDialogController($scope, $mdDialog, $timeout, loginFactory) {
                        $scope.demoHotel = {};

                        function Init() {
                            var getDemoHotelSystemInfo = loginFactory.securedPostJSON("api/Hotel/SystemInfo", "");
                            getDemoHotelSystemInfo.success(function (data) {
                                $scope.TimeZones = data.TimeZones;
                                $scope.Currencies = data.Currencies;
                            });
                        }
                        Init();
                        $scope.hide = function () {
                            $mdDialog.hide();
                        };
                        $scope.cancel = function () {
                            $mdDialog.cancel();
                        };
                        $scope.createDemoHotel = function () {
                            $mdDialog.hide($scope.demoHotel);
                        }
                    }
                }, function () {
                    $state.transitionTo('hotelQuickSettings');
                });
            }
        }).state('configHotelInfo', {
            url: '/config/HotelInfo',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            },
            views: {
                '': {
                    templateUrl: 'views/hotel/config.html',
                    controller: 'configController'
                },
                'configHotelInfo@configHotelInfo': {
                    templateUrl: 'views/hotel/subtemplates/tabHotelInformation.tmpl.html',
                    controller: 'configHotelInfoController as hotelInfo'
                }
            },
        }).state('configHotelOwnerInfo', {
            url: '/config/HotelOwnerInfo',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            },
            views: {
                '': {
                    templateUrl: 'views/hotel/config.html',
                    controller: 'configController'
                },
                'configHotelOwnerInfo@configHotelOwnerInfo': {
                    templateUrl: 'views/hotel/subtemplates/tabHotelOwnerInformation.tmpl.html',
                    controller: 'configHotelOwnerInfoController'
                }
            },
        }).state('configRoomType', {
            url: '/config/RoomType',
            views: {
                '': {
                    templateUrl: 'views/hotel/config.html',
                    controller: 'configController'
                },
                'configRoomType@configRoomType': {
                    templateUrl: 'views/hotel/subtemplates/tabRoomType.tmpl.html',
                    controller: 'configRoomTypeController'
                }
            },
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('configRoomList', {
            url: '/config/RoomList',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            },
            views: {
                '': {
                    templateUrl: 'views/hotel/config.html',
                    controller: 'configController'
                },
                'configRoomList@configRoomList': {
                    templateUrl: 'views/hotel/subtemplates/tabRoomList.tmpl.html',
                    controller: 'configRoomListController'
                }
            },
        }).state('configFloorList', {
            url: '/config/configFloorList',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            },
            views: {
                '': {
                    templateUrl: 'views/hotel/config.html',
                    controller: 'configController'
                },
                'configFloorList@configFloorList': {
                    templateUrl: 'views/hotel/subtemplates/tabFloorList.tmpl.html',
                    controller: 'configFloorListController'
                }
            },
        }).state('configExtraServices', {
            url: '/config/ExtraServices',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            },
            views: {
                '': {
                    templateUrl: 'views/hotel/config.html',
                    controller: 'configController'
                },
                'configExtraServices@configExtraServices': {
                    templateUrl: 'views/hotel/subtemplates/tabExtraServices.tmpl.html',
                    controller: 'configExtraServicesController'
                }
            },
        }).state('configStaff', {
            url: '/config/Staff',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            },
            views: {
                '': {
                    templateUrl: 'views/hotel/config.html',
                    controller: 'configController'
                },
                'configStaff@configStaff': {
                    templateUrl: 'views/hotel/subtemplates/tabStaff.tmpl.html',
                    controller: 'configStaffController'
                }
            },
        }).state('configSystem', {
            url: '/config/System',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            },
            onEnter: function ($rootScope, $stateParams, $state, currentHotelSettings) {
                console.log("onEnter", document.referrer);
            },
            views: {
                '': {
                    templateUrl: 'views/hotel/config.html',
                    controller: 'configController'
                },
                'configSystem@configSystem': {
                    templateUrl: 'views/hotel/subtemplates/tabSystem.tmpl.html',
                    controller: 'configSystemController',
                },
                'configSystemCurrency@configSystem': {
                    templateUrl: 'views/templates/system_currency.tmpl.html',
                    //controller:'configSystemController'
                },
                'configSystemColor@configSystem': {
                    templateUrl: 'views/templates/system_color.tmpl.html',
                    //controller:'configSystemController'
                },
                'configSystemTime@configSystem': {
                    templateUrl: 'views/templates/system_time.tmpl.html',
                    //controller:'configSystemController'
                },
                'configForm@configSystem': {
                    templateUrl: 'views/templates/system_form.tmpl.html',
                    //controller:'configSystemController'
                },
                'configConnectivity@configSystem': {
                    templateUrl: 'views/templates/system_connectivity.tmpl.html',
                    //controller:'configSystemController'
                },
                'configHotelDisplay@configSystem': {
                    templateUrl: 'views/templates/system_hotelDisplay.tmpl.html',
                    //controller:'configSystemController'
                },
                'configExpenditure@configSystem': {
                    templateUrl: 'views/hotel/subtemplates/tabExpenditure.tmpl.html',
                    controller: 'configExpenditureController'
                },
                'configMInvoice@configSystem': {
                    templateUrl: 'views/templates/system_minvoice.tmpl.html',
                    controller: 'loginMInvoiceController'
                }
            }
        }).state('configBusiness', {
            url: '/config/Business',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            },
            views: {
                '': {
                    templateUrl: 'views/hotel/config.html',
                    controller: 'configController'
                },
                'configBusiness@configBusiness': {
                    templateUrl: 'views/hotel/subtemplates/tabBusiness.tmpl.html',
                    controller: 'configBusinessController'
                },
                'configBusinessSource@configBusiness': {
                    templateUrl: 'views/templates/business_source.tmpl.html',
                    //controller: 'configBusinessSource',
                },
                'configBusinessCompany@configBusiness': {
                    templateUrl: 'views/templates/business_company.tmpl.html',
                    //controller: 'configBusinessSource',
                },
                'configBusinessMarket@configBusiness': {
                    templateUrl: 'views/templates/business_market.tmpl.html',
                    //controller: 'configBusinessSource',
                },
            },
        }).state('configPOS', {
            url: '/config/POS',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            },
            views: {
                '': {
                    templateUrl: 'views/hotel/config.html',
                    controller: 'configController'
                },
                'configPOS@configPOS': {
                    templateUrl: 'views/hotel/subtemplates/tabPOS.tmpl.html',
                    controller: 'configPOSController'
                },
                'configPOSInvoice@configPOS': {
                    templateUrl: 'views/templates/posInvoice.tmpl.html',
                    //controller: 'configPOSController',
                }
            },
        })
        // .state('newGroup', {
        //     url: '/newGroup',
        //     templateUrl: 'views/GroupReservation/newGroup.html',
        //     controller: 'NewGroupController',
        //     resolve: {
        //         secured: secureResolve,
        //         currentHotelSettings: hotelConfigResolve
        //     }
        // })
        .state('newGroup', {
            url: '/newGroup',
            templateUrl: 'views/GroupReservation/newGroupVer2.html',
            controller: 'NewGroupController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        })
        .state('groupReservation', {
            url: '/groupReservation',
            templateUrl: 'views/GroupReservation/groupReservation.html',
            controller: 'GroupReservationController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        })
        // .state('groupReservationDetail', {
        //     url: '/groupReservationDetail/:reservationId',
        //     templateUrl: 'views/GroupReservation/groupReservationDetail.html',
        //     controller: 'GroupReservationDetailController',
        //     resolve: {
        //         secured: secureResolve,
        //         currentHotelSettings: hotelConfigResolve,
        //         currentHotelConnectivities: hotelConnectivitiesResolve
        //     }
        // })
        .state('groupReservationDetail', {
            url: '/groupReservationDetail/:reservationId',
            templateUrl: 'views/GroupReservation/groupReservationDetailVer2.html',
            controller: 'GroupReservationDetailController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve,
                currentHotelConnectivities: hotelConnectivitiesResolve
            }
        })
        .state('inhouseGroup', {
            url: '/inhouseGroup',
            templateUrl: 'views/GroupReservation/inhouseGroup.html',
            controller: 'InhouseGroupController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('mergeGroup', {
            url: '/mergeGroup',
            templateUrl: 'views/GroupReservation/mergeGroup.html',
            controller: 'MergeGroupController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('departedGroup', {
            url: '/departedGroup',
            templateUrl: 'views/GroupReservation/departedGroup.html',
            controller: 'DepartedGroupController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('modulePaymentManagement', {
            url: '/modulePaymentManagement',
            templateUrl: 'views/hotel/modulePaymentManagement.html',
            controller: 'modulePaymentManagementController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('hotelSelect', {
            url: '/hotelSelect',
            templateUrl: 'views/hotel/hotelSelect.html',
            controller: 'hotelSelectController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('dashboardConfig', {
            url: '/dashboardConfig',
            templateUrl: 'views/hotel/dashboardConfig.html',
            controller: 'dashboardConfigController',
                resolve: {
                    secured: secureResolve,
                    currentHotelSettings: hotelConfigResolve
                }
        }).state('arrivalList', {
            url: '/arrivalList',
            templateUrl: 'views/front_office/arrivalList.html',
            controller: 'arrivalListController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('departureList', {
            url: '/departureList',
            templateUrl: 'views/front_office/departureList.html',
            controller: 'departureListController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('checkoutList', {
            url: '/checkoutList',
            templateUrl: 'views/front_office/checkoutList.html',
            controller: 'checkoutListController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('reservationList', {
            url: '/reservationList',
            templateUrl: 'views/front_office/reservationList.html',
            controller: 'reservationListController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('guestList', {
            url: '/guestList',
            templateUrl: 'views/front_office/guestList.html',
            controller: 'guestListController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('guestDatabase', {
            url: '/guestDatabase',
            templateUrl: 'views/front_office/guestDatabase.html',
            controller: 'guestDatabaseController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('guestHistory', {
            url: '/guestHistory/:travellerId',
            templateUrl: 'views/front_office/guestHistory.html',
            controller: 'guestHistoryController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('newCityLedgerPayment', {
            url: '/newCityLedgerPayment',
            templateUrl: 'views/cityledger/newCityLedgerPayment.html',
            controller: 'newCityLedgerPaymentController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('CMConfiguration', {
            url: '/CMConfiguration',
            templateUrl: 'views/ChannelManager/CMConfiguration.html',
            controller: 'CMConfigurationController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('CMRoomTypeMapping', {
            url: '/CMRoomTypeMapping',
            templateUrl: 'views/ChannelManager/CMRoomTypeMapping.html',
            controller: 'CMRoomTypeMappingController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('CMAvailabilityMatrix', {
            url: '/CMAvailabilityMatrix',
            templateUrl: 'views/ChannelManager/CMAvailabilityMatrix.html',
            controller: 'CMAvailabilityMatrixController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('CMReservation', {
            url: '/CMReservation',
            templateUrl: 'views/ChannelManager/CMReservation.html',
            controller: 'CMReservationController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
            //booking engine
        }).state('BEConfiguration', {
            url: '/BEConfiguration',
            templateUrl: 'views/BookingEngine/BEConfiguration.html',
            controller: 'BEConfigurationController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('BERoomTypeMapping', {
            url: '/BERoomTypeMapping',
            templateUrl: 'views/BookingEngine/BERoomTypeMapping.html',
            controller: 'BERoomTypeMappingController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('BEAvailabilityMatrix', {
            url: '/BEAvailabilityMatrix',
            templateUrl: 'views/BookingEngine/BEAvailabilityMatrix.html',
            controller: 'BEAvailabilityMatrixController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('BEReservation', {
            url: '/BEReservation',
            templateUrl: 'views/BookingEngine/BEReservation.html',
            controller: 'BEReservationController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('houseStatus', {
            url: '/houseStatus',
            templateUrl: 'views/houseKeeping/houseStatus.html',
            controller: 'houseStatusController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve,
                currentHotelConnectivities: hotelConnectivitiesResolve,
            }
        }).state('houseStatusfast', {
            url: '/houseStatusFast',
            templateUrl: 'views/houseKeeping/houseStatusFast.html',
            controller: 'houseStatusFastController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve,
                currentHotelConnectivities: hotelConnectivitiesResolve,
            }
        }).state('houseDailyClean', {
            url: '/houseDailyClean',
            templateUrl: 'views/houseKeeping/houseDailyClean.html',
            controller: 'houseDailyCleanController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve,
                currentHotelConnectivities: hotelConnectivitiesResolve,
            }
        }).state('houseDailyClean_Detail', {
            url: '/houseDailyClean_Detail',
            templateUrl: 'views/houseKeeping/houseDailyClean_Detail.html',
            controller: 'houseDailyClean_DetailController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve,
                currentHotelConnectivities: hotelConnectivitiesResolve,
            }
        }).state('test', {
            url: '/test',
            templateUrl: 'views/test/test.html',
            controller: 'testController'
        }).state('homepage', {
            url: '/',
            templateUrl: 'views/homepage.html',
            controller: 'homepageController'
        }).state('reportMore', {
            url: '/reportsMore',
            templateUrl: 'views/reports/more.html',
            controller: 'reportConfigController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('paymentCompleted', {
            url: '/paymentCompleted',
            templateUrl: 'views/BackendPayment/paymentCompleted.html',
            controller: 'PaymentCompletedController',
            resolve: {
                secured: secureResolve,
            }
        })
        // .state('POSInvoice', {
        //     url: '/POSInvoice',
        //     templateUrl: 'views/POS/POSInvoice.html',
        //     controller: 'POSInvoiceController',
        //     resolve: {
        //         secured: secureResolve,
        //         currentHotelSettings: hotelConfigResolve,
        //     }
        // })
        .state('POSInvoice', {
            url: '/POSInvoice',
            templateUrl: 'views/POS/POSInvoiceNew.html',
            controller: 'POSInvoiceController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve,
            }
        })
        .state('POSInvoiceDraft', {
            url: '/POSInvoice/:draftId',
            templateUrl: 'views/POS/POSInvoice.html',
            controller: 'POSInvoiceController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve,
            }
        }).state('POSInvoiceDetail', {
            url: '/POSInvoiceDetail/:invoiceId',
            templateUrl: 'views/POS/POSInvoiceDetail.html',
            controller: 'POSInvoiceDetailController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('POSInvoiceSearch', {
            url: '/POSInvoiceSearch',
            templateUrl: 'views/POS/POSInvoiceSearch.html',
            controller: 'POSInvoiceSearchController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('POSDraftSearch', {
            url: '/POSDraftSearch',
            templateUrl: 'views/POS/POSDraftSearch.html',
            controller: 'POSDraftSearchController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('EmailTask', {
            url: '/emailTask',
            templateUrl: 'views/EmailMarketing/task.list.html',
            controller: 'EmailTaskController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('EmailLogs', {
            url: '/emailLogs',
            templateUrl: 'views/EmailMarketing/logs.list.html',
            controller: 'EmailLogsController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('EmailLogsDetail', {
            url: '/emailLogsDeatil/:emailTaskId/:reservationRoomId',
            templateUrl: 'views/EmailMarketing/logs.list.html',
            controller: 'EmailLogsController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('emailTaskDetail', {
            url: '/emailTask/:emailTaskId',
            templateUrl: 'views/EmailMarketing/task.detail.html',
            controller: 'EmailTaskDetailController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('emailConfigListDetail', {
            url: '/emailConfigList/:configEmailId',
            templateUrl: 'views/EmailMarketing/config.detail.html',
            controller: 'EmailConfigDetailController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('EmailConfigList', {
            url: '/emailConfigList',
            templateUrl: 'views/EmailMarketing/config.list.html',
            controller: 'EmailConfigController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('paymentTypeDetail', {
            url: '/paymentTypeDetail',
            templateUrl: 'views/PaymentTypeDetail/list.html',
            controller: 'paymentTypeDetailController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('bankAccount', {
            url: '/bankAccount',
            templateUrl: 'views/BankAccount/list.html',
            controller: 'bankAccountController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('cashFlow', {
            url: '/cashFlow',
            templateUrl: 'views/receiptPayment/list.html',
            controller: 'receiptPaymentController',
            params: {
                startDate: null,
                endDate: null
            },
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('addReceipt', {
            url: '/addReceipt',
            templateUrl: 'views/templates/addReceipt.tmpl.html',
            controller: 'addReceiptController',
            params: {
                invoiceFund: 1,
                invoiceId: null,
                isView: false
            },
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('addPayment', {
            url: '/addPayment',
            templateUrl: 'views/templates/addPayment.tmpl.html',
            controller: 'addPaymentController',
            params: {
                invoiceFund: 1,
                invoiceId: null,
                isView: false
            },
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('cashFunds', {
            url: '/cashFunds',
            templateUrl: 'views/CashFunds/list.html',
            controller: 'CashFundsController',
            params: {
                startDate: null,
                endDate: null
            },
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('invoiceReport001', {
            url: '/invoiceReport001',
            templateUrl: 'views/invoiceReports/list.html',
            controller: 'invoiceReportsController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('invoiceReport003', {
            url: '/invoiceReport003',
            templateUrl: 'views/invoiceReports/handoverList.html',
            controller: 'handoverReportsController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('addHandover', {
            url: '/addHandover',
            templateUrl: 'views/templates/addHandover.tmpl.html',
            controller: 'addHandoverController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('viewHandover', {
            url: '/viewHandover',
            templateUrl: 'views/invoiceReports/viewHandover.html',
            controller: 'viewHandoverController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('listdetails', {
            url: '/listdetails',
            templateUrl: 'views/invoiceReports/listdetails.html',
            controller: 'invoicesReportDetailsController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('receiptdetails', {
            url: '/receiptdetails',
            templateUrl: 'views/invoiceReports/receiptdetails.html',
            controller: 'receiptdetailsController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('invoiceReport004', {
            url: '/invoiceReport004',
            templateUrl: 'views/invoiceReports/balanceList.html',
            controller: 'balanceReportsController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('paymentdetails', {
            url: '/paymentdetails',
            templateUrl: 'views/invoiceReports/paymentdetails.html',
            controller: 'paymentdetailsController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('createInvoice', {
            url: '/createMInvoice',
            templateUrl: 'views/mInvoice/createMInvoice.html',
            controller: 'createMInvoiceController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('listMInvoice', {
            url: '/listMInvoice',
            templateUrl: 'views/mInvoice/listMInvoice.html',
            controller: 'listMInvoiceController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        }).state('stockList', {
            url: '/stock/list',
            templateUrl: 'views/stock/stockList.html',
            controller: 'stockController',
            resolve: {
                secured: secureResolve,
                currentHotelSettings: hotelConfigResolve
            }
        });
    $urlRouterProvider.otherwise("/");
}]);


ezCloud.run(function ($rootScope, $state, $stateParams, $location, $q, $localStorage, $mdMedia, $locale, loginFactory, commonFactory, configFactory, dialogService, $filter, ngNotify) {
    console.log("RUN ", new Date().getTime() - startTime.getTime());
    ngNotify.config({
        theme: 'pure',
        position: 'top',
        duration: 3000,
        type: 'error',
        sticky: true,
        button: true,
        //html: false
    });

    if (isCordovaApp) {
        document.addEventListener("backbutton", onBackKeyDown, false);
    }
 

    //smartsupp load
    function initSmartSupp(data) {
        _smartsupp.key = data.EzSupport.SmarsuppKey;
        window.smartsupp || (function (d) {
            var s, c, o = smartsupp = function () {
                o._.push(arguments)
            };
            o._ = [];
            s = d.getElementsByTagName('script')[0];
            c = d.createElement('script');
            c.type = 'text/javascript';
            c.charset = 'utf-8';
            c.async = true;
            c.src = '//www.smartsuppchat.com/loader.js?';
            s.parentNode.insertBefore(c, s);
        })(document);
        if (hash !== '#/extendedScreen') {
            smartsupp('recording:disable', true);
            smartsupp('translate', {
                online: { // online window
                    title: 'Hỗ trợ',
                    infoTitle: 'Chat trực tuyến',
                    infoDesc: 'Hãy hỏi chúng tôi điều bạn muốn',
                    maximize: 'Phóng to',
                    minimize: 'Thu nhỏ',
                    hideTitle: 'Ẩn cửa sổ chat',
                    closeTitle: 'Dừng chat',
                    settingsTitle: 'Thiết lập',
                    disableSounds: 'Tắt tiếng',
                    enableSounds: 'Bật tiếng',
                    visitor: 'Bạn',
                    send: 'Gửi',
                    textareaPlaceholder: 'Viết vào đây, nhấn Enter để gửi',
                    typingMsg: '{name} đang trả lời...',
                    transcriptSendingTitle: 'Đang gửi email...',
                    transcriptSendingDesc: '',
                    transcriptSendedTitle: 'Email đã được gửi thành công',
                    transcriptSendedDesc: ''
                },
                offline: { // offline window
                    title: 'Hãy gửi thông điệp cho chúng tôi',
                    notice: 'Chúng tôi hiện không online, bạn hãy gửi thông điệp cho chúng tôi. Chúng tôi sẽ trả lời ngay khi có thể.',
                    hideTitle: 'Ẩn cửa sổ chat',
                    required: '',
                    name: 'Họ và tên',
                    email: 'Email',
                    number: 'Số điện thoại',
                    message: 'Thông điệp của bạn',
                    submit: 'Gửi',
                    messageRequiredAlert: 'Bạn chưa nhập nội dung thông điệp.',
                    emailRequiredAlert: 'Bạn chưa nhập địa chỉ email.',
                    emailInvalidAlert: 'Địa chỉ email không hợp lệ',
                    sendInfo: 'Đang gửi email...',
                    successTitle: 'Cảm ơn lời nhắn của bạn',
                    successDesc: 'Lời nhắn của bạn đã được gửi thành công. Chúng tôi sẽ liên hệ với bạn sớm.',
                    failureTitle: 'Lỗi',
                    failureDesc: 'Chúng tôi xin lỗi vì lời nhắn của bạn chưa được gửi.'
                },
                login: { // pre-chat form window
                    title: 'Đăng nhập chat',
                    notice: '',
                    messageLabel: 'Câu hỏi của bạn',
                    submit: 'Bắt đầu chat'
                },
                widget: { // chat box
                    online: 'Hãy hỏi chúng tôi điều bạn muốn',
                    away: 'Hãy hỏi chúng tôi điều bạn muốn',
                    offline: 'Để lại lời nhắn cho chúng tôi',
                },
                banner: { // chat banners
                    bubble: {
                        text: 'Chúng tôi luôn lắng nghe!'
                    },
                    arrow: {
                        title: 'Bạn muốn hỗ trợ gì?',
                        desc: 'ezCloud luôn sẵn sàng.'
                    }
                },
                button: { // mobile widget
                    title: 'Chat trực tuyến'
                },
                dialogClose: {
                    title: 'Bạn có muốn dừng cuộc nói chuyện ở đây?',
                    yes: 'Có',
                    no: 'Không',
                    send: 'Có, và gửi nội dung chat vào email'
                },
                dialogSend: {
                    title: 'Gửi cuộc nói chuyện vào email',
                    email: 'Email',
                    yes: 'Gửi',
                    no: 'Hủy'
                },
                dialogRating: {
                    title: 'Bạn đánh giá chất lượng cuộc nói chuyện như thế nào?',
                    cancel: 'Tôi không muốn đánh giá',
                    submit: 'Gửi',
                    commentTitle: 'Đánh giá của bạn'
                }
            }, 'vn');
            smartsupp('theme:set', 'default');
            // smartsupp('banner:set', 'bubble');
            smartsupp('on', 'rendered', function () {
                $('#chat-application-iframe').contents().find('.brand-logo').html('');
            });
        } else {
            smartsupp("widget:hide", true);
        }

        loginFactory.isAuthenticated(function () {
            $rootScope.loggedIn = true;

            if ($localStorage.session.Fullname) {
                smartsupp("name", $localStorage.session.Fullname);
            }
            if ($localStorage.session.Email) {
                smartsupp("email", $localStorage.session.Email);
            }
        });
        smartsupp('group', '1wWbdRlN7G');
    }



    function onBackKeyDown() {
        // Handle the back button
        dialogService.confirm($filter("translate")("DO_YOU_REALLY_WANT_TO_QUIT")).then(function () {
            navigator.app.exitApp();
        });
    }
    $rootScope.decimals = 0;



    commonFactory.getHotelCommonInformation(function (data) {
        var currentHotel = configFactory.getCurrentHotel();
        if (currentHotel.HotelId != null && currentHotel.HotelId != undefined) {
            configFactory.ezHotelBackEndPaymentProcess(currentHotel);
        } else {
            currentHotel.then(function (data) {
                configFactory.ezHotelBackEndPaymentProcess(data);
            })
        }
        var frac = data.Currency !== null ? parseInt(data.Currency.MinorUnit) : 0;
        $locale.NUMBER_FORMATS.PATTERNS[1].maxFrac = frac;
        $locale.NUMBER_FORMATS.PATTERNS[1].minFrac = frac;
        $locale.NUMBER_FORMATS.CURRENCY_SYM = data.Currency !== null ? data.Currency.AlphabeticCode + " " : "VND ";
        $rootScope.decimals = frac;
        initSmartSupp(data);
    });
    if ($localStorage.session) {
        $rootScope.loggedIn = true;
        /*commonFactory.getHotelSettings(function(settings) {
            $rootScope.HotelSettings = settings;
            setTimeout(function() {
                $rootScope.$apply();
            }, 0);
        });*/
        /*var currentHotel = configFactory.getCurrentHotel();
        if (currentHotel.HotelId != null && currentHotel.HotelId != undefined){
            configFactory.ezHotelBackEndPaymentProcess(currentHotel);
        }
        else{
            currentHotel.then(function(data){
                configFactory.ezHotelBackEndPaymentProcess(data);
            })
        }*/
    }
    /*
        check session state
    */
    
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
        //assign the "from" parameter to something
        $rootScope.previousState = from.name;
        $rootScope.currentState = to.name;
        console.log('Previous state:' + $rootScope.previousState);
        console.log('Current state:' + $rootScope.currentState);
        if (from.name === 'home') {
            //$rootScope.$mdMedia = $mdMedia;
            ev.preventDefault();
        }
    });
    $rootScope.$mdMedia = $mdMedia;
    showTemporaryHiddenControls();
});

function showTemporaryHiddenControls() {
    jQuery(".md-sidenav-left").css("display", "");
    jQuery("md-autocomplete").css("display", "");
}

ezCloud.controller('topController', ['$mdSidenav', '$scope', '$state', '$window', '$filter', '$rootScope', '$translate', '$mdToast', '$http', 'ngNotify', function ($mdSidenav, $scope, $state, $window, $filter, $rootScope, $translate, $mdToast, $http, ngNotify) {
    // ngNotify.set('ngNotify default config options have been overriden.');

    if (!isCordovaApp) {
        if (appVersion == "js") {
            //running in localhost
            //appVersion = "local";
            checkVersion();
        } else {
            checkVersion();
        }
    }

    function checkVersion() {
        if (serverVersion == appVersion) {
            $http.get("version.json?" + Math.random()).success(function (data) {
                serverVersion = data.version;
                if (serverVersion != appVersion) {
                    //
                    $mdToast.show({
                        controller: 'versionUpdateCtrl',
                        templateUrl: 'views/templates/version_update_template.html',
                        hideDelay: 10000,
                        position: "top right"
                    });
                } else setTimeout(checkVersion, 100000);
            }).error(function () {
                console.log("Fail");
                setTimeout(checkVersion, 100000);
            });
        }
    }
    $scope.swipeRight = function () {
        $mdSidenav('left').open();
    };
    $scope.goBack = function () {
        history.go(-1);
    };
    $rootScope.language = $translate.use() ? $translate.use() : "vn";
    //console.log($translate.loaderCache);
    currentLanguage = $rootScope.language;
    $rootScope.languageName = $rootScope.language == "en" ? "Tiếng Việt" : "English";
    $translate.use($rootScope.language);
    // smartsupp("language", $rootScope.language);
    $scope.langSwitch = function (tmp) {
        if (tmp == "en") {
            $rootScope.language = "en";
            $rootScope.languageName = "Tiếng Việt";
        } else if (tmp) {
            $rootScope.language = "vn";
            $rootScope.languageName = "English";
        } else {
            if ($rootScope.language == "en") {
                $rootScope.language = "vn";
                $rootScope.languageName = "English";
            } else if (tmp) {
                $rootScope.language = "en";
                $rootScope.languageName = "Tiếng Việt";
            }
        }
        currentLanguage = $rootScope.language;
        $translate.use($rootScope.language);
        smartsupp("language", $rootScope.language);
        console.log($translate.translations);
    }

}]);


ezCloud.directive('numbersOnly', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                if (text) {
                    var transformedInput = text.replace(/[^0-9]/g, '');

                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                }
                return undefined;
            }
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
});
ezCloud.directive('svgIcon', function () {
    return {
        restrict: 'E',
        replace: true,
        template: '<svg viewBox="0 0 24 24" style="pointer-events: none;"><g><g><rect fill="none" width="24" height="24"></rect><path d="M3,18h18v-2H3V18z M3,13h18v-2H3V13z M3,6v2h18V6H3z"></path></g></g></svg>'
    }
});
ezCloud.directive('validPasswordC', function () {
    return {
        require: 'ngModel',
        scope: {
            reference: '=validPasswordC'
        },
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function (viewValue, $scope) {
                var noMatch = viewValue != scope.reference
                ctrl.$setValidity('noMatch', !noMatch)
            });
            scope.$watch("reference", function (value) {;
                ctrl.$setValidity('noMatch', value === ctrl.$viewValue);
            });
        }
    }
});
ezCloud.directive('validateEmail', function () {
    var EMAIL_REGEXP = /^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;
    return {
        require: 'ngModel',
        restrict: '',
        link: function (scope, elm, attrs, ctrl) {
            // only apply the validator if ngModel is present and Angular has added the email validator
            if (ctrl && ctrl.$validators.email) {
                // this will overwrite the default Angular email validator
                ctrl.$validators.email = function (modelValue) {
                    return ctrl.$isEmpty(modelValue) || EMAIL_REGEXP.test(modelValue);
                };
            }
        }
    };
});
ezCloud.filter('startFrom', function () {
    return function (input, start) {
        if (!input || !input.length) {
            return;
        }
        start = +start; //parse to int
        return input.slice(start);
    }
});

ezCloud.filter('limitChar', function () {
    return function (content, length, tail) {
        if (isNaN(length))
            length = 50;

        if (tail === undefined)
            tail = "...";

        if (content.length <= length || content.length - tail.length <= length) {
            return content;
        } else {
            return String(content).substring(0, length - tail.length) + tail;
        }
    };
});

ezCloud.filter('noFractionCurrency', ['$filter', '$locale', function (filter, locale) {
    var currencyFilter = filter('currency');
    var formats = locale.NUMBER_FORMATS;
    var value;
    return function (amount, currencySymbol) {
        //     var currencyFilter = filter('currency');
        //currencySymbol = '';
        //var currencyFilter = filter('currency');
        //var formats = locale.NUMBER_FORMATS;
        value = currencyFilter(amount, ' ');
        //console.log(value);
        var sep = value.indexOf(formats.DECIMAL_SEP);
        if (amount >= 0) {
            return value.substring(0, sep);
        }
        return value.substring(0, sep) + ')';
    };
    //return value.replace(new RegExp('\\' + formats.DECIMAL_SEP + '\\d{2}'), '');
}]);
Date.prototype.addHours = function (h) {
    this.setHours(this.getHours() + h);
    return this;
};
ezCloud.directive('stringToNumber', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function (value) {
                return '' + value;
            });
            ngModel.$formatters.push(function (value) {
                return parseFloat(value, 10);
            });
        }
    };
});
ezCloud.filter('daysHoursMins', function () {
    return function (input) {
        var retArr = [],
            dayTimeParts = [],
            hoursMinutesSeconds = [],
            days = '0',
            time = '0',
            showSeconds = false;

        function removeLeadingZeros(str) {
            if (str[0] !== undefined) {
                if (str[0] === '-' && str[1] !== undefined && str[1] === '0') {
                    str = '-' + str.substr(2);
                } else if (str[0] === '0') {
                    str = str.substr(1);
                }
            }
            return str;
        }
        if (input !== undefined) {
            if (time !== '00:00:00') {
                hoursMinutesSeconds = time.split(':');
                if (hoursMinutesSeconds[0] !== '00') {
                    retArr.push(removeLeadingZeros(hoursMinutesSeconds[0]) + ' hours');
                }
                if (hoursMinutesSeconds[1] !== '00') {
                    retArr.push(removeLeadingZeros(hoursMinutesSeconds[1]) + ' min');
                }
                if (showSeconds && hoursMinutesSeconds[2] !== '00') {
                    retArr.push(removeLeadingZeros(hoursMinutesSeconds[2]) + ' seconds');
                }
            }
        }
        if (retArr.length === 0) {
            retArr.push('N\\A');
        }
        return retArr.join(', ');
    };
});
ezCloud.directive('format', function ($filter) {
    return {
        require: '?ngModel',
        link: function (scope, elem, attrs, ctrl) {
            if (!ctrl) return;
            ctrl.$formatters.unshift(function (a) {
                return $filter(attrs.format)(ctrl.$modelValue)
            });
            ctrl.$parsers.unshift(function (viewValue) {
                var plainNumber = viewValue.replace(/[^\d|\-+|\.+]/g, '');
                elem.val($filter(attrs.format)(plainNumber));
                return plainNumber;
            });
        }
    };
});
app.directive('isNumber', function () {
    return {
        require: 'ngModel',
        link: function (scope) {
            scope.$watch('wks.number', function (newValue, oldValue) {
                var arr = String(newValue).split("");
                if (arr.length === 0) return;
                if (isNaN(newValue)) {
                    scope.wks.number = oldValue;
                }
            });
        }
    };
});
ezCloud.filter('byproperty', function () {
    return function (movies, genres) {
        var items = {
            genres: genres,
            out: []
        };
        angular.forEach(movies, function (value, key) {
            if (this.genres[value.genre] === true) {
                this.out.push(value);
            }
        }, items);
        return items.out;
    };
});
ezCloud.directive("bindExpression", function ($parse) {
    var directive = {};
    directive.restrict = 'E';
    directive.require = 'ngModel';
    directive.link = function (scope, element, attrs, ngModel) {
        scope.$watch(attrs.expression, function (newValue) {
            ngModel.$setViewValue(newValue);
        });
        ngModel.$render = function () {
            $parse(attrs.expression).assign(ngModel.viewValue);
        }
    };
    return directive;
});

ezCloud.directive('focusMe', function ($timeout) {
    return {
        scope: {
            trigger: '=focusMe'
        },
        link: function (scope, element) {
            scope.$watch('trigger', function (value) {
                if (value === true) {
                    //console.log('trigger',value);
                    //$timeout(function() {
                    element[0].focus();
                    scope.trigger = false;
                    //});
                }
            });
        }
    };
});
ezCloud.directive('ngclipboard', function () {
    return {
        restrict: 'A',
        scope: {
            ngclipboardSuccess: '&',
            ngclipboardError: '&'
        },
        link: function (scope, element) {
            var clipboard = new Clipboard(element[0]);

            clipboard.on('success', function (e) {
                scope.$apply(function () {
                    scope.ngclipboardSuccess({
                        e: e
                    });
                });
            });

            clipboard.on('error', function (e) {
                scope.$apply(function () {
                    scope.ngclipboardError({
                        e: e
                    });
                });
            });

        }
    };
});

ezCloud.directive('fbLike', [
    '$window', '$rootScope',
    function ($window, $rootScope) {

        return {
            restrict: 'A',
            scope: {
                fbLike: '=?',
                fbName: '=',
            },
            link: function (scope, element, attrs) {
                if (!$window.FB) {
                    // Load Facebook SDK if not already loaded
                    $.getScript('//connect.facebook.net/en_US/sdk.js', function () {
                        $window.FB.init({
                            appId: '148900532147471',
                            xfbml: true,
                            version: 'v2.0'
                        });
                        renderLikeButton();
                    });
                } else {
                    renderLikeButton();
                }

                var watchAdded = false;

                function renderLikeButton() {
                    if (!!attrs.fbLike && !scope.fbLike && !watchAdded) {
                        // wait for data if it hasn't loaded yet
                        watchAdded = true;
                        var unbindWatch = scope.$watch('fbLike', function (newValue, oldValue) {
                            if (newValue) {
                                renderLikeButton();

                                // only need to run once
                                unbindWatch();
                            }

                        });
                        return;
                    } else {
                        element.html('<div class="fb-like"' + (!!scope.fbLike ? ' data-href="' + scope.fbLike + '"' : '') + ' data-layout="button_count" data-action="like" data-show-faces="true" data-share="true" data-text="' + scope.fbName + '"></div>');
                        // element.html('<div class="fb-like"' + (!!scope.fbLike ? ' data-href="' + scope.fbLike + '"' : '') + ' data-layout="button_count" data-action="like" data-show-faces="true" data-share="true" data-text="'+scope.fbName+'"></div>');
                        //  element.html('<a href="https://www.facebook.com/dialog/feed?app_id=148900532147471&display=popup&link=https://ezcloud.vn&name=Hãy chia sẻ mã giới thiệu [{{ReferralCode}}] để gia tăng thời hạn sử dụng phần mềm!&caption=&description=Quý khách hàng và khách sạn nhập mã giới thiệu sẽ nhận được 5% số tiền cho lần thanh toán đầu tiên. Hãy chắc chắn rằng khách sạn nhập mã này chưa thanh toán lần nào trên hệ thống&redirect_uri=http://www.facebook.com" class="twitter-share-button" data-text="vuong" data-url="http://ezcloudhotel.vn">Facebook share</a>');
                        $window.FB.XFBML.parse(element.parent()[0]);
                    }
                }
            }
        };
    }
]);


ezCloud.directive('tweet', [
    '$window', '$location',
    function ($window, $location) {
        return {
            restrict: 'A',
            scope: {
                tweet: '=',
                tweetUrl: '='
            },
            link: function (scope, element, attrs) {
                if (!$window.twttr) {
                    // Load Twitter SDK if not already loaded
                    $.getScript('//platform.twitter.com/widgets.js', function () {
                        renderTweetButton();
                    });
                } else {
                    renderTweetButton();
                }

                var watchAdded = false;

                function renderTweetButton() {
                    if (!scope.tweet && !watchAdded) {
                        // wait for data if it hasn't loaded yet
                        watchAdded = true;
                        var unbindWatch = scope.$watch('tweet', function (newValue, oldValue) {
                            if (newValue) {
                                renderTweetButton();
                                // only need to run once
                                unbindWatch();
                            }
                        });
                        return;
                    } else {
                        element.html('<a href="https://twitter.com/share" class="twitter-share-button" data-text="' + scope.tweet + '" data-url="' + (scope.tweetUrl || $location.absUrl()) + '">Tweet</a>');
                        $window.twttr.widgets.load(element.parent()[0]);
                    }
                }
            }
        };
    }
]);

ezCloud.directive('googlePlus', [
    '$window',
    function ($window) {
        return {
            restrict: 'A',
            scope: {
                googlePlus: '=?'
            },
            link: function (scope, element, attrs) {
                if (!$window.gapi) {
                    // Load Google SDK if not already loaded
                    $.getScript('//apis.google.com/js/platform.js', function () {
                        renderPlusButton();
                    });
                } else {
                    renderPlusButton();
                }

                var watchAdded = false;

                function renderPlusButton() {
                    if (!!attrs.googlePlus && !scope.googlePlus && !watchAdded) {
                        // wait for data if it hasn't loaded yet
                        watchAdded = true;
                        var unbindWatch = scope.$watch('googlePlus', function (newValue, oldValue) {
                            if (newValue) {
                                renderPlusButton();

                                // only need to run once
                                unbindWatch();
                            }

                        });
                        return;
                    } else {
                        element.html('<div class="g-plusone"' + (!!scope.googlePlus ? ' data-href="' + scope.googlePlus + '"' : '') + ' data-size="medium"></div>');
                        $window.gapi.plusone.go(element.parent()[0]);
                    }
                }
            }
        };
    }
]);


//Smartsupp Live support
var hash = window.location.hash;

var _smartsupp = _smartsupp || {};

//Google analytics
(function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function () {
        (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * new Date();
    a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m)
})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
ga('create', 'UA-77671507-1', 'auto');
ezCloud.controller('versionUpdateCtrl', function ($scope, $mdToast, $templateCache) {
    $scope.closeToast = function () {
        $templateCache.removeAll();
        $mdToast.hide();
        location.reload(true);
    };
});
var recapchaLoaded = false;

function vcRecaptchaApiLoaded() {
    console.log("recapcha done");
    recapchaLoaded = true;
}

var check = localStorage.getItem('ngStorage-reLoadTab');
console.log(check, "leo nguyen");
if (check == null || check) {
    localStorage.setItem('ngStorage-reLoadTab', false);
}

$(window).on('storage', message_receive);

function message_receive(ev) {
    // console.log(ev.originalEvent.key, "leo nguyen rrrrrr2");
    if (ev.originalEvent.key != 'ngStorage-reLoadTab') return;
    console.log(ev.originalEvent, "leo nguyen", ev.originalEvent.newValue);
    if (ev.originalEvent.newValue == "true") {
        location.reload();
    }

}