ezCloud.controller('LeftCtrl', ['$rootScope', '$state', '$translate', '$scope', '$mdSidenav', '$log', '$timeout', 'loginFactory', 'dialogService', '$window', '$location', '$mdDialog', '$localStorage', 'commonFactory', function ($rootScope, $state, $translate, $scope, $mdSidenav, $log, $timeout, loginFactory, dialogService, $window, $location, $mdDialog, $localStorage, commonFactory) {
    $scope.back = function () {
        $window.history.back();
    };
    if ($state.current.name && $state.current.name !== "test") {
        $rootScope.showMenu = true;
    } else {
        $rootScope.showMenu = false;
    }
    $scope.toggleSideNav = false;
	$scope.toggleSideNavNavigation = function(status){
        $scope.toggleSideNav = !$scope.toggleSideNav;
        localStorage.setItem("SideNavStatus", $scope.toggleSideNav);
		if( typeof(ezSchedule) != "undefined" ){
			ezSchedule.actionResize();
		}
    };
     if (localStorage.getItem("SideNavStatus") == null) {

     } else {
         if (localStorage.getItem("SideNavStatus") == "true") {
            $scope.toggleSideNav = true;
         }
     }
    $scope.doChangePassword = function () {
        $mdDialog.show({
            controller: ChangePasswordDialogController,
            templateUrl: 'views/templates/changePassword.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
        }).then(function () {

        }, function () {
            $scope.alert = 'You cancelled the dialog.';
        });
    };
    ChangePasswordDialogController.$inject = ['$scope', '$mdDialog'];

    function ChangePasswordDialogController($scope, $mdDialog) {
        $scope.minlength = 6;
        $scope.changePassword = {
            OldPassword: "",
            NewPassword: "",
            NewPasswordConfirm: ""
        };

        $scope.isError = false;

        $scope.hide = function () {
            $mdDialog.hide();
        };
        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.doChangePassword = function () {

            var changePassword = loginFactory.securedPostJSON("api/Account/ChangePassword", $scope.changePassword);
            changePassword.success(function (data) {
                dialogService.toast("CHANGE_PASSWORD_SUCCESSFUL");
                $mdDialog.hide();
            }).error(function (err) {
                $scope.isError = true;
            })
        }
    }

    $scope.toggleLeft = function () {
        $mdSidenav('left').open();
    };
    $scope.openMenu = function ($mdOpenMenu, ev) {
        originatorEv = ev;
        $mdOpenMenu(ev);
    };
    $scope.toggleRight = function () {
        $mdSidenav('right').open();
    }
    $scope.doSignout = function () {
        var dialog = dialogService.confirm('SIGNOUT', 'SIGNOUT_CONFIRM');
        dialog.then(function () {
            loginFactory.signOut(function () {
                $localStorage.reLoadTab = true;
                $localStorage.menuReport = null;
                $localStorage.displayGroup = null;
                $localStorage.TimeInOutPrivate = undefined;
                $state.transitionTo("login");
                $mdSidenav('left').close();
            });
        });
    };
    $scope.doSettings = function () {
        $mdSidenav('left').close();
        $state.transitionTo("config");
    }

    $scope.doHotelSelect = function () {
        $mdSidenav('left').close();
        $state.transitionTo("hotelSelect");
    }

    $scope.closeNav = function (menu, $mdOpenMenu, event) {
        if ($scope.toggleSideNav == false) {
            if (menu.submenus) {
                if ($rootScope.menuReport.toggle == true && menu.name != 'REPORTS') {
                    $rootScope.menuReport.toggle = false;
                }
                if (!menu.toggle)
                    menu.toggle = false;
                for (var idx in menus) {
                    var mnu = menus[idx];
                    if (mnu != menu)
                        if (mnu.toggle == true)
                            mnu.toggle = false;
                }
                $scope.menus = menus;
                menu.toggle = !menu.toggle;
                console.log(menus);
            } else {
                if (menu.name == 'RATE_CONFIGURATION') {
                    console.log('menu.name', menu.name);
                    var AdminSTAAHUrl = "https://cp.staah.net/ezcloud/";
                    window.open(AdminSTAAHUrl);
                }
                if (menu.name == 'RATE_CONFIGURATION1') {
                    console.log('menu.name', menu.name);
                    var AdminBOOKLOGICUrl = "https://ezcloudhotel.net/spl/";                                                                                                                          
                    window.open(AdminBOOKLOGICUrl);
                } 
                if (menu.name == 'RATE_CONFIGURATION2') {
                    console.log('menu.name', menu.name);
                    var AdminSITEMINDERUrl = "https://cmtpi.siteminder.com/web/login";
                    window.open(AdminSITEMINDERUrl);
                }
                if (menu.name == 'RATE_CONFIGURATION3') {
                    console.log('menu.name', menu.name);
                    var AdminSITEMINDERUrl = "http://admin.ezbooking.vn/";
                    window.open(AdminSITEMINDERUrl);
                } 
                $mdSidenav('left').close();
                $mdSidenav('right').close();
                $location.url(menu.url);
            }
        }else{
            if (menu.submenus) {
                if ($mdOpenMenu && event) {
                    $mdOpenMenu(event);
                }
            } else {
                if (menu.name == 'RATE_CONFIGURATION') {
                    console.log('menu.name', menu.name);
                    var AdminSTAAHUrl = "https://cp.staah.net/ezcloud/";
                    window.open(AdminSTAAHUrl);
                }
                if (menu.name == 'RATE_CONFIGURATION1') {
                    console.log('menu.name', menu.name);
                    var AdminBOOKLOGICUrl = "https://ezcloudhotel.net/spl/";
                    window.open(AdminBOOKLOGICUrl);
                }
                if (menu.name == 'RATE_CONFIGURATION2') {
                    console.log('menu.name', menu.name);
                    var AdminSITEMINDERUrl = "https://cmtpi.siteminder.com/web/login";
                    window.open(AdminSITEMINDERUrl);
                }
                if (menu.name == 'RATE_CONFIGURATION3') {
                    console.log('menu.name', menu.name);
                    var AdminSITEMINDERUrl = "http://admin.ezbooking.vn/";
                    window.open(AdminSITEMINDERUrl);
                }
                $mdSidenav('left').close();
                $mdSidenav('right').close();
                $location.url(menu.url);
            }
        }
    }
    $scope.closeNavRight = function () {
        $mdSidenav('left').close();
        $mdSidenav('right').close();
    }
    $scope.closeNavRight1 = function () {
        $mdSidenav('right').close();
    }
    $scope.isSelected = function (menu) {
        return menu.url == $location.url();
    };
    $scope.Settings = function () {
        $location.url('/dashboardConfig');
    }
    //
    var menus = [{
        typeCms: 'NOTVALUE',
        url: '/dashboard',
        icon: 'img/icons/ic_dashboard_24px.svg',
        name: 'DASHBOARD',
        color: '',
        isNew: true,
        roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF']
    }, {
        typeCms: 'NOTVALUE',
        url: '/home',
        icon: 'img/icons/ic_home_24px.svg',
        name: 'ROOM_VIEW',
        color: 'navy',
        roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF']
    }, {
        typeCms: 'NOTVALUE',
        url: '/walkin',
        icon: 'img/icons/ic_person_24px.svg',
        name: 'WALKIN',
        color: 'green',
        roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF']
    }, {
        typeCms: 'NOTVALUE',
        url: '',
        icon: 'img/icons/ic_group_24px.svg',
        name: 'GROUP',
        color: '',
        roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF'],
        submenus: [{
            url: '/newGroup',
            name: 'NEW_GROUP',
            icon: 'img/icons/ic_group_add_24px.svg'
        }, {
            url: '/groupReservation',
            name: 'GROUP_RESERVATION',
            icon: 'img/icons/ic_recent_actors_24px.svg'
        }, {
            url: '/inhouseGroup',
            name: 'INHOUSE_GROUP',
            icon: 'img/icons/ic_hotel_24px.svg'
        }, {
            url: '/departedGroup',
            name: 'DEPARTED_GROUP',
            icon: 'img/icons/ic_flight_24px.svg'
        }]
    }, {
        typeCms: 'NOTVALUE',
        url: '',
        icon: 'img/icons/ic_local_mall_24px.svg',
        name: 'FRONT_OFFICE',
        color: '',
        roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF'],
        submenus: [{
            url: '/reservationList',
            name: 'RESERVATION_LIST1',
            icon: 'img/icons/ic_my_library_books_24px.svg'
        }, {
            url: '/arrivalList',
            name: 'ARRIVAL_LIST1',
            icon: 'img/icons/ic_flight_land_24px.svg'
        }, {
            url: '/departureList',
            name: 'DEPARTURE_LIST1',
            icon: 'img/icons/ic_flight_takeoff_24px.svg'
        }, {
            url: '/checkoutList',
            name: 'CHECKOUT_LIST',
            icon: 'img/icons/ic_exit_to_app_24px.svg'
        }, {
            url: '/guestList',
            name: 'GUEST_LIST',
            icon: 'img/icons/ic_supervisor_account_24px.svg'
        }, {
            url: '/guestDatabase',
            name: 'GUEST_DATABASE',
            icon: 'img/icons/ic_perm_identity_24px.svg'
        }, {
            url: '/newCityLedgerPayment',
            name: 'CITY_LEDGER_MANAGER',
            icon: 'img/icons/ic_attach_money_24px.svg'
        }]
    },
        {
            typeCms: 'NOTVALUE',
            url: '',
            icon: 'img/icons/ic_payment_24px.svg',
            name: 'EXPENDITURE',
            color: '',
            isNew: true,
            roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF'],
            submenus: [{
                url: '/cashFlow',
                name: 'CASH_FLOW',
                icon: 'img/icons/ic_attach_money_24px.svg'
            }, {
                url: '/cashFunds',
                name: 'CASH_FUNDS',
                icon: 'img/icons/ic_work_24px.svg'
            }]
        }, 
    {
        typeCms: 'NOTVALUE',
        url: '',
        icon: 'img/icons/ic_shopping_cart_24px.svg',
        name: 'POS',
        color: '',
        roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF'],
        submenus: [{
            url: '/POSInvoice',
            name: 'POS_INVOICE',
            icon: 'img/icons/ic_add_shopping_cart_24px.svg'
        }, {
            url: '/POSInvoiceSearch',
            name: 'POS_INVOICE_SEARCH',
            icon: 'img/icons/ic_search_24px.svg'
        }
            // , {
            //     url: '/POSDraftSearch',
            //     name: 'POS_DRAFT_SEARCH',
            //     icon: 'img/icons/ic_work_24px.svg'
            // }
        ] 
    },
    //CMSTAAH
    {
        typeCms: 'CMSTAAH',
        url: '',
        icon: 'img/icons/ic_filter_drama_24px.svg',
        name: 'CHANNEL_MANAGER',
        color: '',
        roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF'],
        submenus: [{
            url: '/CMConfiguration',
            name: 'CONFIGURATION',
            icon: 'img/icons/ic_settings_applications_24px.svg'
        }, {
            url: '/CMRoomTypeMapping',
            name: 'CM_MAPPING',
            icon: 'img/icons/ic_flip_24px.svg'
        }, {
            url: '/CMAvailabilityMatrix',
            name: 'AVAILABILITY_MATRIX',
            icon: 'img/icons/ic_grid_on_24px.svg'
        }, {
            url: '/CMRateConfig',
            name: 'RATE_CONFIGURATION',
            icon: 'img/icons/ic_attach_money_24px.svg'
        }, {
            url: '/CMReservation',
            name: 'CM_RESERVATIONS',
            icon: 'img/icons/ic_insert_invitation_24px.svg'
        }]

    },
    //CMBOOKLOGIC
    {
        typeCms: 'CMBOOKLOGIC',
        url: '',
        icon: 'img/icons/ic_filter_drama_24px.svg',
        name: 'CHANNEL_MANAGER1',
        color: '',
        roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF'],
        submenus: [{
            url: '/CMConfiguration',
            name: 'CONFIGURATION',
            icon: 'img/icons/ic_settings_applications_24px.svg'
        }, {
            url: '/CMRoomTypeMapping',
            name: 'CM_MAPPING',
            icon: 'img/icons/ic_flip_24px.svg'
        }, {
            url: '/CMAvailabilityMatrix',
            name: 'AVAILABILITY_MATRIX',
            icon: 'img/icons/ic_grid_on_24px.svg'
        }, {
            url: '/CMRateConfig',
            name: 'RATE_CONFIGURATION1',
            icon: 'img/icons/ic_attach_money_24px.svg'
        }, {
            url: '/CMReservation',
            name: 'CM_RESERVATIONS',
            icon: 'img/icons/ic_insert_invitation_24px.svg'
        }]

    }, 
     
    // Booking engine 
    {
        typeCms: 'NOTVALUE',
        url: '',
        icon: 'img/icons/ic_web_24px.svg',
        name: 'BOOKING_ENGINE',
        color: '',
        isNew: true,
        roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF'],
        submenus: [{
            url: '/BEConfiguration',
            name: 'CONFIGURATION',
            icon: 'img/icons/ic_settings_applications_24px.svg'
        },{
            url: '/BERoomTypeMapping',
            name: 'BE_MAPPING',
            icon: 'img/icons/ic_flip_24px.svg'
        },{
            url: '/BEAvailabilityMatrix',
            name: 'AVAILABILITY_MATRIX',
            icon: 'img/icons/ic_grid_on_24px.svg'
        },{
            url: '/BERateConfig',
            name: 'RATE_CONFIGURATION3',
            icon: 'img/icons/ic_attach_money_24px.svg'
        },{
            url: '/BEReservation',
            name: 'BE_RESERVATIONS',
            icon: 'img/icons/ic_insert_invitation_24px.svg'
        }]
    },
	//CMSTIEMINDER
	{
		typeCms: 'CMSITEMINDER',
		url: '',
		icon: 'img/icons/ic_filter_drama_24px.svg',
		name: 'CHANNEL_MANAGER2',
		color: '',
		roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF'],
		submenus: [{
			url: '/CMConfiguration',
			name: 'CONFIGURATION',
			icon: 'img/icons/ic_settings_applications_24px.svg'
		}, {
			url: '/CMRoomTypeMapping',
			name: 'CM_MAPPING',
			icon: 'img/icons/ic_flip_24px.svg'
		}, {
			url: '/CMAvailabilityMatrix',
			name: 'AVAILABILITY_MATRIX',
			icon: 'img/icons/ic_grid_on_24px.svg'
		}, {
			url: '/CMRateConfig',
			name: 'RATE_CONFIGURATION2',
			icon: 'img/icons/ic_attach_money_24px.svg'
		}, {
			url: '/CMReservation',
			name: 'CM_RESERVATIONS',
			icon: 'img/icons/ic_insert_invitation_24px.svg'
		}]
	},
    {
        typeCms: 'NOTVALUE',
        url: '',
        icon: 'img/icons/ic_domain_24px.svg',
        name: 'HOUSE_KEEPING',
        color: '',
        roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF', 'ROLE_HOTEL_HOUSEKEEPER'],
        submenus: [{
            url: '/houseDailyClean',
            name: 'HOUSE_DAILYCLEAN',
            icon: 'img/icons/ic_subtitles_24px.svg'
        }, {
            url: '/houseStatus',
            name: 'HOUSE_STATUS',
            icon: 'img/icons/ic_view_compact_24px.svg'
        }, {
            url: '/houseStatusFast',
            name: 'HOUSE_STATUS_FAST',
            icon: 'img/icons/ic_view_compact_24px.svg'
        },
       
        {
            url: '/houseDailyClean_Detail',
            name: 'HOUSE_DAILYCLEAN_DETAILS',
            icon: 'img/icons/ic_my_library_books_24px.svg'
        }
        ],

    },
    {
        typeCms: 'NOTVALUE',
        url: '',
        icon: 'img/icons/ic_email_black_48px.svg',
        name: 'EMAIL_MARKETING',
        color: '',
        isNew: false,
        roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF'],
        submenus: [{
            url: '/emailTask',
            name: 'EMAIL_TASK',
            icon: 'img/icons/ic_pages_24px.svg'
        },
        {
            url: '/emailLogs',
            name: 'EMAIL_LOGS',
            icon: 'img/icons/ic_history_black_24px.svg'

        },
        {
            url: '/emailConfigList',
            name: 'EMAIL_CONFIG',
            icon: 'img/icons/ic_settings_24px.svg'
        }
        ]
    },{
        typeCms: 'NOTVALUE',
        url: '',
        icon: 'img/icons/ic_store_mall_directory_48px.svg',
        name: 'Stocks',
        color: '',
        isNew: false,
        roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF'],
        submenus: [{
            url: '/stock/list',
            name: 'Stocks List',
            icon: 'img/icons/ic_view_list_24px.svg'
        }
        ]
    },
    {
        typeCms: 'NOTVALUE',
        url: '/stats',
        icon: 'img/icons/ic_insert_chart_24px.svg',
        name: 'STATISTICS',
        color: 'blue',
        isNew: false,
        roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER']
    }
    ];

    // var refferralProgramStatus=false;

    commonFactory.getHotelCommonInformation(function (data) {
        if (data.ezReferralPrograms !== null && data.ezReferralPrograms.Status == true) {
            menus.unshift({
                typeCms: 'NOTVALUE',
                url: '/refferralProgramDef',
                icon: 'img/icons/ic_toys_24px.svg',
                name: 'REFERRAL_PROGRAM',
                color: 'navy',
                isNew: true
            })
        }

    });
    $scope.menus = menus;

    $scope.menus_right = [{
        url: '/config',
        icon: 'img/icons/ic_settings_24px.svg',
        name: 'CONFIGURATION',
        roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER'],
        color: 'red',
        submenus: [{
            url: '/config/HotelOwnerInfo',
            icon: 'img/icons/ic_assignment_ind_24px.svg',
            name: 'HOTEL_OWNER_INFORMATION',
            roles: ['ROLE_HOTEL_OWNER']
        },
        {
            url: '/config/HotelInfo',
            icon: 'img/icons/ic_info_outline_24px.svg',
            name: 'HOTEL_INFORMATION',
            roles: ['ROLE_HOTEL_OWNER']
        },
        {
            url: '/config/RoomType',
            icon: 'img/icons/ic_layers_24px.svg',
            name: 'ROOM_TYPES',
            roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER']
        },
        {
            url: '/config/RoomList',
            icon: 'img/icons/ic_view_list_24px.svg',
            name: 'ROOM_LIST',
            roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER']
        },
        {
            url: '/config/ExtraServices',
            icon: 'img/icons/ic_functions_24px.svg',
            name: 'EXTRA_SERVICES',
            roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER']
        },
        {
            url: '/config/Staff',
            icon: 'img/icons/ic_person_24px.svg',
            name: 'STAFF',
            roles: ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER']
        },
        {
            url: '/config/System',
            icon: 'img/icons/ic_build_24px.svg',
            name: 'SYSTEM_SETTINGS',
            roles: ['ROLE_HOTEL_OWNER']
        }
        ]
    }];

    $scope.Hotel_Select = {
        url: '/hotelSelect',
        icon: 'img/icons/ic_storage_24px.svg',
        name: 'HOTEL_SELECT',
        roles: ['ROLE_HOTEL_OWNER'],
        color: 'blue'
    };
    $scope.Payment_Process = {
        url: '/modulePaymentManagement',
        icon: 'img/icons/ic_attach_money_24px.svg',
        name: 'MODULE/PAYMENT_MANAGEMENT',
        roles: ['ROLE_HOTEL_OWNER'],
        color: 'blue'
    };
    $scope.isInRole = function (menu) {
        if (!$localStorage.session || !$localStorage.session.Roles) return false;
        var roles = $localStorage.session.Roles;
        if (!menu.roles) return true;
        for (var idx in menu.roles) {
            if (roles.indexOf(menu.roles[idx]) >= 0) {
                return true;
            }
        }
        return false;
    }

    $scope.doChangeTheme = function () {
        $mdDialog.show({
            controller: ChangeThemedDialogController,
            templateUrl: 'views/templates/changeTheme.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
        }).then(function () {

        }, function () {
            $scope.alert = 'You cancelled the dialog.';
        });
    };

    ChangeThemedDialogController.$inject = ['$scope', '$mdDialog'];

    function ChangeThemedDialogController($scope, $mdDialog) {
        $scope.minlength = 6;
        $scope.Themes = [{
            'code': 'ThemeNormal',
            'link': '/img/Theme/Normal.jpg',
            'name': 'Normal'
        }, {
            'code': 'ThemeWorldCup',
            'link': '/img/Theme/wc.jpg',
            'name': 'World Cup 2018'
        }, {
            'code': 'ThemeAutumn',
            'link': '/img/Theme/autumn.jpg',
            'name': 'Autumn'
        }];
        

        $scope.isError = false;

        $scope.hide = function () {
            $mdDialog.hide();
        };
        $scope.cancel = function () {
            $mdDialog.cancel();
        };
        
        $scope.doChangeThemeOk = function(){
            localStorage.setItem('UseTheme', $scope.Selected.code);
            $mdDialog.cancel();
            location.reload();
        }
        var isTheme = (localStorage.getItem('UseTheme') == null) ? 'ThemeNormal' : localStorage.getItem('UseTheme');
        $scope.Selected = $scope.Themes.find(function(item){
            return item.code == isTheme;
        }, isTheme);
        $scope.ChangeItemTheme = function(item){
            $scope.Selected = item;
        }
    }
    
}])