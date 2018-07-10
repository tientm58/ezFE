var lastTimelineDrag;
var currentScope;
var testView;
var dateUR;
var startDate;
var schedulerDataok;
var showItemmenuTimeline;
var showItemMenu;
var GlobalEvent;
var Opscheduler;
var isViewTypeDate = true;
var listColor;
var getDataRoomRepair;
var listUnassignRoom = null;
var listRooms = null;
var membellCheck = null;
var FullnameCustomer = "";
var Gender = "";
var IdentityNumber = "";
var Birthday = "";
var CountryCode = "";
var ImageLocation = "";
var ValidUntil = "";
ezCloud.controller('dashboardsController', ['SharedFeaturesFactory', 'frontOfficeFactory', '$filter', '$scope', '$rootScope', '$mdBottomSheet', 'roomListFactory', 'selectedRoomFactory', '$location', '$state', 'reservationFactory', 'dialogService', 'loginFactory', '$mdDialog', '$localStorage', '$mdMedia', '$http', 'currentHotelConnectivities', 'smartCardFactory', '$q', 'walkInFactory', '$stateParams', '$timeout', 'commonFactory', '$mdSidenav',
    function (SharedFeaturesFactory, frontOfficeFactory, $filter, $scope, $rootScope, $mdBottomSheet, roomListFactory, selectedRoomFactory, $location, $state, reservationFactory, dialogService, loginFactory, $mdDialog, $localStorage, $mdMedia, $http, currentHotelConnectivities, smartCardFactory, $q, walkInFactory, $stateParams, $timeout, commonFactory, $mdSidenav) {
        if ($rootScope.user.Roles == "ROLE_HOTEL_HOUSEKEEPER") {
            $location.path('/houseDailyClean');
        }

        $scope.bookingStatusMapping = {
            BOOKED: "ic_event_available_24px.svg",
            CHECKIN: "ic_local_hotel_24px.svg",
            OVERDUE: "ic_restore_24px.svg",
            AVAILABLE: "ic_check_circle_24px.svg",
            CANCELLED: "ic_cancel_24px.svg",
            NOSHOW: "ic_event_busy_24px.svg"
        };

        var EzModulesActive = $rootScope.EzModulesActive;
        $scope.isUsePassport = function () {
            var PassportModule = _.find(EzModulesActive, function (item) {
                return item.ModuleCode === "PASSPORT";
            })
            return PassportModule != null ? true : false;
        }

        // var color = $rootScope.Settings;

        commonFactory.getHotelCommonInformation(function (data) {
            $scope.SettingsColor = data.StatusColors;
            var EzModulesActive = data.EzModulesActive;
            var UseCMSModule = _.filter(EzModulesActive, function (item) {
                return item.ModuleCode === "CMSTAAH" || item.ModuleCode === "CMBOOKLOGIC" || item.ModuleCode === "BE" || item.ModuleCode === "CMSITEMINDER";
            });
            $scope.UseCMS = UseCMSModule.length > 0 ? true : false;

            $scope.bookingStatusMappingColor = {
                BOOKED: _.find($scope.SettingsColor, function (item) {
                    return item.StatusCode == "BOOKED"
                }).ColorCode,
                CHECKIN: _.find($scope.SettingsColor, function (item) {
                    return item.StatusCode == "CHECKIN"
                }).ColorCode,
                OVERDUE: _.find($scope.SettingsColor, function (item) {
                    return item.StatusCode == "OVERDUE"
                }).ColorCode,
                AVAILABLE: _.find($scope.SettingsColor, function (item) {
                    return item.StatusCode == "AVAILABLE"
                }).ColorCode,
                CANCELLED: _.find($scope.SettingsColor, function (item) {
                    return item.StatusCode == "CANCELLED"
                }).ColorCode,
                NOSHOW: _.find($scope.SettingsColor, function (item) {
                    return item.StatusCode == "NOSHOW"
                }).ColorCode,
                DIRTY: _.find($scope.SettingsColor, function (item) {
                    return item.StatusCode == "DIRTY"
                }).ColorCode
            }
            Init();
        });

        $scope.params = {
            dateToday: null,
            varChangeDate: null,
            isSelectToday: true,
            tabSelect: ""
        };

        $scope.varStat = {
            roomArrival: 0,
            roomDueOut: 0,
            projectedRoomOccupied: 0,
            projectedOccupancy: 0
        }

        $scope.filters = {
            keySearch: null,
            searchType: "GUESTNAME"
        }

        $scope.homeData = [];

        $scope.countries = [];

        var rooms;

        // pagination
        $scope.page = {
            currentPage: 0,
            pageSize: 10,
            totalRecord: 0
        }

        // sort
        $scope.orderByField = 'Priority';
        $scope.reverseSort = false;

        $scope.numberOfPages = function () {
            return Math.ceil($scope.page.totalRecord / $scope.page.pageSize);
        }

        $scope.reloadListRoom = function (keyS, keyF) {
            var listRoom = angular.copy($scope.homeData);
            console.log("specialName", listRoom);
            if (keyS == null || keyS == "") {
                $scope.items = listRoom;
                $scope.page.totalRecord = listRoom.length;
                $scope.page.currentPage = 0;
            } else {
                keyS = change_alias(keyS);
                var temp = [];
                if (keyF == "GUESTNAME") {
                    temp = _.filter(listRoom, function (item) {
                        return item.specialName.guestFullName.includes(keyS);
                    });
                }
                if (keyF == "BOOKINGID") {
                    temp = _.filter(listRoom, function (item) {
                        return item.specialName.bookingId.includes(keyS);
                    });
                }
                if (keyF == "RESNO") {
                    temp = _.filter(listRoom, function (item) {
                        return item.specialName.reservationNumber.includes(keyS);
                    });
                }
                if (keyF == "ROOMNAME") {
                    temp = _.filter(listRoom, function (item) {
                        return item.specialName.roomName.includes(keyS);
                    });
                }
                console.log("specialName", temp);
                $scope.page.totalRecord = temp.length;
                $scope.page.currentPage = 0;
                $scope.items = temp;
            }
        }

        function getNameForFilter(lstRoom) {
            var listRoom = angular.copy(lstRoom);
            angular.forEach(listRoom, function (item, idx) {
                var specialNameArr = {
                    guestFullName: item.RoomId != null ? item.reservationRoom.Travellers.Fullname.split(' ') : item.Travellers.Fullname.split(' '),
                    roomName: item.RoomId != null ? item.reservationRoom.RoomName.split(' ') : "",
                    bookingId: item.RoomId != null ? item.reservationRoom.Reservations.CMChannelRef : item.Reservations.CMChannelRef,
                    reservationNumber: item.RoomId != null ? item.reservationRoom.Reservations.ReservationNumber : item.Reservations.ReservationNumber
                };
                var specialName = {
                    guestFullName: '',
                    roomName: '',
                    bookingId: '',
                    reservationNumber: ''
                };
                angular.forEach(specialNameArr.guestFullName, function (item) {
                    specialName.guestFullName += item.toLowerCase();
                });
                specialName.guestFullName = change_alias(specialName.guestFullName);
                angular.forEach(specialNameArr.roomName, function (item) {
                    specialName.roomName += item.toLowerCase();
                });
                specialName.roomName = change_alias(specialName.roomName);
                specialName.bookingId = specialNameArr.bookingId != null ? specialNameArr.bookingId.toString() : '';
                specialName.reservationNumber = specialNameArr.reservationNumber != null ? specialNameArr.reservationNumber.toString() : '';

                listRoom[idx].specialName = specialName;
            });
            return listRoom;
        }
        // convert sang chữ không dấu
        function change_alias(alias) {
            var str = alias;
            str = str.toLowerCase();
            str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
            str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
            str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
            str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
            str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
            str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
            str = str.replace(/đ/g, "d");
            str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|$|_/g, "");
            str = str.replace(/-+-/g, "");
            str = str.replace(/^\-+|\-+$/g, "");
            return str;
        }

        // end pagination

        function Init() {
            jQuery(document).unbind('keydown');
            $scope.currentHotelConnectivites = currentHotelConnectivities;
            $rootScope.currentHotelConnectivites = currentHotelConnectivities;
            jQuery(document).unbind('keydown');
            $scope.DatePickerOption = {
                format: 'MMMM d, yyyy'
            };
            $scope.page.currentPage = 0;
            $scope.params = {
                dateToday: new Date(),
                varChangeDate: new Date().format('dddd mmmm d, yyyy'),
                isSelectToday: true,
                ListGuestByType: [],
                tabSelect: "ARRIVALS"
            };
            $scope.search = {
                SearchType: $scope.params.tabSelect,
                SearchDate: new Date(),
                // SkipRecord: 0
            }
            $scope.filters = {
                keySearch: "",
                searchType: "GUESTNAME"
            }

            $scope.HideSearch = false;
            $scope.isOpenFab = false;

            roomListFactory.getRoomListDashboard($scope.search, function (data) {
                $scope.user = $rootScope.user;
                console.log('data: GetListGuestByType', data);
                rooms = data;
                console.log("rooms", rooms);
                rooms = getNameForFilter(rooms);
                $scope.hotelFormRoomInvoice = data.hotelFormRoomInvoice[0].FormType + data.hotelFormRoomInvoice[0].Value + '.trdx';
                $scope.hotelForms = data.HotelForms;
                $scope.floorList = data.floorList;
                $scope.ExtraService = data.ExtraService;
                $scope.roomTypes = data.roomTypes;
                $scope.items = rooms;
                $scope.homeData = rooms;
                console.log("items", $scope.items);
                console.log("GetListGuestByType", $scope.items);
                for (var index in $scope.items) {
                    if ($scope.items[index].RoomRepairList && $scope.items[index].RoomRepairList.length > 0) {
                        for (var index2 in $scope.items[index].RoomRepairList) {
                            var repairtTemp = $scope.items[index].RoomRepairList[index2];
                            if (repairtTemp.IsDeleted !== true && repairtTemp.RepairStartDate <= new Date() && new Date() <= repairtTemp.RepairEndDate) {
                                $scope.items[index].HouseStatus = "REPAIR";
                                $scope.items[index].RepairStartDate = repairtTemp.RepairStartDate;
                                $scope.items[index].RepairEndDate = repairtTemp.RepairEndDate;
                                break;
                            }
                        }
                    }
                }

                if(!($scope.user.Roles.indexOf('ROLE_HOTEL_OWNER') >= 0 || $scope.user.Roles.indexOf('ROLE_SYS_ADMIN') >= 0 || $scope.user.Roles.indexOf('ROLE_HOTEL_MANAGER') >=0)){
                    for (var index in $scope.items) {
                        if($scope.items[index].Menus && $scope.items[index].Menus.length > 0){
                            for (var index2 = $scope.items[index].Menus.length - 1; index2 >= 0; index2--){
                                var menusTemp = $scope.items[index].Menus[index2];
                                if(menusTemp.name == 'PRE_CHECKIN' || menusTemp.name == 'PRE_CHECKOUT'){
                                    $scope.items[index].Menus.splice(index2, 1);
                                } 
                            }
                        }
                    }
                }
                
                $scope.data = $scope.items.slice(0, 20);
                $scope.remarkEvents = $scope.items.remarkEvents;
                $scope.rateList = rooms.planList;
                $scope.dateTimeNow = new Date();
                $scope.page.totalRecord = $scope.items.length;
            });
            getInfoDashboard($scope.params.varChangeDate);
            var getTodolistList = loginFactory.securedGet("api/Dashboard/GetToDoListList", "");
            $rootScope.dataLoadingPromise = getTodolistList;
            getTodolistList.success(function (data2) {
                $scope.ToDoListList = data2;
                console.log("TodolistList", $scope.ToDoListList);
            }).error(function (err) {
                console.log(err);
            });
            if (!commonFactory.getCountryList().length) {
                var promise = commonFactory.updateCountryList();
                promise.success(function (data) {
                    $scope.countries = data;
                });
            } else {
                $scope.countries = commonFactory.getCountryList();
            }
            $scope.actionSearch();
        }

        function addDays(date, days) {
            var result = new Date(date);
            result.setDate(result.getDate() + days);
            return new Date(result.getFullYear(), result.getMonth(), result.getDate(), 12, 0, 0);
        }

        $scope.ActionCloseShift = function () {
            $location.path('addHandover');
        }

        $scope.goToRoomDetail = function (ReservationRoomId) {
            $location.path('reservation/' + ReservationRoomId);
        };

        $scope.changeTabs = function (tabName) {
            // $scope.items = [];
            $scope.params.tabSelect = tabName;
            // $scope.params.isSelectToday = true;
            $scope.page.currentPage = 0;

            $scope.search = {
                SearchType: $scope.params.tabSelect,
                SearchDate: new Date(),
                // SkipRecord: 0
            }

            roomListFactory.getRoomListDashboard($scope.search, function (data) {
                $scope.user = $rootScope.user;
                console.log('data: GetListGuestByType', data);
                rooms = data;
                console.log("rooms", rooms);
                rooms = getNameForFilter(rooms);
                $scope.hotelFormRoomInvoice = data.hotelFormRoomInvoice[0].FormType + data.hotelFormRoomInvoice[0].Value + '.trdx';
                $scope.hotelForms = data.HotelForms;
                $scope.floorList = data.floorList;
                $scope.ExtraService = data.ExtraService;
                $scope.roomTypes = data.roomTypes;
                $scope.items = rooms;
                $scope.homeData = rooms;
                console.log("items", $scope.items);
                console.log("GetListGuestByType", $scope.items);
                for (var index in $scope.items) {
                    if ($scope.items[index].RoomRepairList && $scope.items[index].RoomRepairList.length > 0) {
                        for (var index2 in $scope.items[index].RoomRepairList) {
                            var repairtTemp = $scope.items[index].RoomRepairList[index2];
                            if (repairtTemp.IsDeleted !== true && repairtTemp.RepairStartDate <= new Date() && new Date() <= repairtTemp.RepairEndDate) {
                                $scope.items[index].HouseStatus = "REPAIR";
                                $scope.items[index].RepairStartDate = repairtTemp.RepairStartDate;
                                $scope.items[index].RepairEndDate = repairtTemp.RepairEndDate;
                                break;
                            }
                        }
                    }
                }
                if(!($scope.user.Roles.indexOf('ROLE_HOTEL_OWNER') >= 0 || $scope.user.Roles.indexOf('ROLE_SYS_ADMIN') >= 0 || $scope.user.Roles.indexOf('ROLE_HOTEL_MANAGER') >=0)){
                    for (var index in $scope.items) {
                        if($scope.items[index].Menus && $scope.items[index].Menus.length > 0){
                            for (var index2 = $scope.items[index].Menus.length - 1; index2 >= 0; index2--){
                                var menusTemp = $scope.items[index].Menus[index2];
                                if(menusTemp.name == 'PRE_CHECKIN' || menusTemp.name == 'PRE_CHECKOUT'){
                                    $scope.items[index].Menus.splice(index2, 1);
                                } 
                            }
                        }
                    }
                }
                $scope.data = $scope.items.slice(0, 20);
                $scope.remarkEvents = $scope.items.remarkEvents;
                $scope.rateList = rooms.planList;
                $scope.dateTimeNow = new Date();
                $scope.page.totalRecord = $scope.items.length;
                //$scope.currentPage = 0;                
                if ($scope.HideSearch) {
                    $scope.reloadListRoom($scope.filters.keySearch, $scope.filters.searchType);
                }
            });
            console.log("currentPage", $scope.page.currentPage);
        };

        $scope.openMenu = function ($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        };

        $scope.listItemClick = function (item, selectRoom) {
            var selectedRoom = angular.copy(selectRoom);
            // homeFactory.setSelectedRoom(selectRoom);
            if (item.url) {
                $location.path(item.url);
            }
            if (item.name == 'BOOKING_LIST') {
                $mdDialog.show({
                    controller: ShowReservationListController,
                    resolve: {
                        selectedRoom: function () {
                            return selectedRoom;
                        },
                    },
                    templateUrl: 'views/templates/reservationListDashboard.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                }).then(function () {

                }, function () {

                });
            }
            //new done
            if (item.name == 'AMEND_STAY') {
                var selectedRoomTemp = selectedRoom.reservationRoom;
                if (!selectedRoomTemp.Rooms) {
                    selectedRoomTemp.Rooms = {};
                    selectedRoomTemp.Rooms.RoomName = selectedRoom.RoomName;
                }
                if (!selectedRoomTemp.RoomTypes)
                    selectedRoomTemp.RoomTypes = selectedRoom.roomType;                    
                selectedRoomTemp.IsDashboard = 1;                                
                SharedFeaturesFactory.processAmendStayFO(selectedRoomTemp,function(){
                    $scope.Init();
                });
            }
            //new done
            if (item.name == 'CANCEL_RESERVATION') {
                var _selectedRoom = angular.copy(selectedRoom);
                _selectedRoom.IsDashboard = 1;
                SharedFeaturesFactory.processCancelDB(_selectedRoom,function(){
                    $scope.Init();
                });
            }
            //new done
            if (item.name == 'CLEAN') {
                SharedFeaturesFactory.processClean(selectedRoom, function (data) {
                    // $state.go($state.current, {}, {
                    //     reload: true
                    // });
                    $scope.Init();
                });
            }
            //new done
            if (item.name == 'SET_ROOM_DIRTY') {
                SharedFeaturesFactory.processSetDirtyRoom(selectedRoom, function (data) {
                    // $state.go($state.current, {}, {
                    //     reload: true
                    // });
                    $scope.Init();
                });
            }
            //new done
            if (item.name == 'UNASSIGN_ROOM') {
                var room = selectedRoom.reservationRoom;
                SharedFeaturesFactory.processUnassignRoomDB(room,function(){
                    $scope.Init();
                });
            }
            //new
            if (item.name == 'COPY') {
                var itemTmp = angular.copy(item);
                var _selectedRoom = angular.copy(selectedRoom);
                _selectedRoom.IsDashboard = 1;
                SharedFeaturesFactory.processCopyReservation(_selectedRoom, itemTmp,function(){
                    $scope.Init();
                });
            }
            //new done
            if (item.name == 'ROOM_MOVE') {
                var _selectedRoom = angular.copy(selectedRoom);
                _selectedRoom.IsDashboard = 1;
                SharedFeaturesFactory.processRoomMoveDB(_selectedRoom,null,function(){
                    $scope.Init();
                });
            }

            if (item.name == 'CREATE_CARD') {
                var hourAddToCheckOut = null;
                console.log("ROOMID", selectedRoom.RoomName);
                if (currentHotelConnectivities.IsAutomaticalAddHourCheckout == true) {
                    hourAddToCheckOut = currentHotelConnectivities.HourAddToCheckout;
                };
                smartCardFactory.createCard(selectedRoom, hourAddToCheckOut);
            }
            //new done
            if (item.name == 'PRE_CHECKIN') {
                var _selectedRoom = angular.copy(selectedRoom);
                _selectedRoom.IsDashboard = 1;
                SharedFeaturesFactory.processUndoCheckInDB(_selectedRoom,function(){
                    $scope.Init();
                });
            }
            //new done
            if (item.name == 'ASSIGN_ROOM') {
                var _selectedRoom = angular.copy(selectedRoom);
                _selectedRoom.IsDashboard = 1;
                SharedFeaturesFactory.processAssignRoomDashBoard(_selectedRoom,function(){
                    $scope.Init();
                });
            }
            if (item.name == 'CANCEL_ROOM_UNASSIGN') {
                if (selectRoom && selectRoom.RoomExtraServiceItemsList && selectRoom.RoomExtraServiceItemsList.length > 0) {
                    var extraServiceItemTemp = _.filter(selectRoom.RoomExtraServiceItemsList, function (item) {
                        return item.IsDeleted === false;
                    });
                    console.log("ESI TEMP", extraServiceItemTemp);
                    if (extraServiceItemTemp && extraServiceItemTemp.length > 0) {
                        dialogService.messageBox("WARNING", "YOU_HAVE_TO_PROCESS_ALL_EXTRA_SERVICES_IN_THIS_ROOM_BEFORE_CANCEL");
                        return;
                    }
                }

                if (selectRoom && selectRoom.RoomExtraServicesList && selectRoom.RoomExtraServicesList.length > 0) {
                    var extraServiceTemp = _.filter(selectRoom.RoomExtraServicesList, function (item) {
                        return item.RoomExtraServiceName == "EXTRA_SERVICES" && item.IsDeleted === false;
                    });
                    console.log("ES TEMP", extraServiceTemp);
                    if (extraServiceTemp && extraServiceTemp.length > 0) {
                        dialogService.messageBox("WARNING", "YOU_HAVE_TO_PROCESS_ALL_EXTRA_SERVICES_IN_THIS_ROOM_BEFORE_CANCEL");
                        return;
                    }
                }
                var keys = ["CANCEL_FEE", "PAYMENT_FOR_CANCELLATION_OF_RESERVATION", "REFUND_ALL_DEPOSITS_OF_RESERVATION", "RES_NO", "ROOM", "NOTIFICATION_NEWPAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER", "THIS_ROOM_EXTRA_SERVICE_WAS_DELETED_AUTOMATICALLY_BY_THE_CANCEL_PROCESS", "NOTIFICATION_CANCELED_NAN_CONTENT", "NOTIFICATION_CANCELED_CONTENT"];
                var languageKeys = {};
                for (var idx in keys) {
                    languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
                }
                console.log('result', selectRoom);
                var selectedRoomTemp = angular.copy(selectRoom);
                // if (result.Rooms === null) {
                //     selectedRoomTemp.RoomName = '';
                // } else {
                //     selectedRoomTemp.RoomName = result.Rooms.RoomName;
                // }

                selectedRoomTemp.languageKeys = languageKeys;
                console.log('selectedRoomTemp', selectedRoomTemp);
                var useFullScreen = $mdMedia('xs');
                $mdDialog.show({
                    controller: CancelUnassignRRDialogController,
                    resolve: {
                        ReservationRoomId: function () {
                            return selectedRoomTemp.ReservationRoomId;
                        },
                        ReservationNumber: function () {
                            return selectedRoomTemp.Reservations.ReservationNumber;
                        },
                        selectedRoom: function () {
                            return selectedRoomTemp;
                        }
                    },
                    templateUrl: 'views/templates/cancelDialog.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                    fullscreen: useFullScreen
                }).then(function (cancelModel) {
                    console.log("CANCEL MODEL", cancelModel);
                    var processCancel = loginFactory.securedPostJSON("api/Room/ProcessCancel", cancelModel);
                    $rootScope.dataLoadingPromise = processCancel;
                    processCancel.success(function (data) {
                        dialogService.toast("CANCEL_BOOKING_SUCCESSFUL");
                        $scope.Init();
                    }).error(function (err) {
                        if (err.Message) {
                            dialogService.messageBox("ERROR", err.Message)
                        } else {
                            conflictReservationProcess(err);
                        }
                    })
                }, function () { });
            }
            if (item.name == 'AMEND_STAY_UNASSIGN') {
                var itemTemp = angular.copy(item);
                var resultTemp = angular.copy(selectRoom);
                var useFullScreen = $mdMedia('xs');
                $mdDialog.show({
                    controller: AmendStayUnassignRRDialogController,
                    resolve: {
                        item: function () {
                            return itemTemp;
                        },
                        currentRoom: function () {
                            return resultTemp;
                        }
                    },
                    templateUrl: 'views/templates/amendStay.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                    fullscreen: useFullScreen
                }).then(function (request) {
                    var saveAmendStay = loginFactory.securedPostJSON("api/Room/SaveAmendStay", request.AmendStayModel);
                    $rootScope.dataLoadingPromise = saveAmendStay;
                    saveAmendStay.success(function (data) {
                        dialogService.toast("AMEND_STAY_SAVED_SUCCESSFUL");
                        $scope.Init();
                    }).error(function (err) {
                        console.log("FRONT CHECK IN", err);
                        if (err.Message) {
                            dialogService.messageBox("ERROR", err.Message)
                        } else {
                            conflictReservationProcess(err);
                        };
                    });
                }, function () {

                });

                function AmendStayUnassignRRDialogController($scope, $mdDialog, item, currentRoom) {
                    console.log("CURRENT ROOM", currentRoom);
                    $scope.departureTime;
                    $scope.warning;
                    $scope.warningDate;
                    $scope.warningDepartureDate;
                    $scope.minDate = new Date();

                    function Init() {
                        $scope.DateTimePickerOption = {
                            format: 'dd/MM/yyyy HH:mm'
                        };
                        $scope.currentRoom = currentRoom;
                        $scope.currentRoom.ArrivalDate = new Date($scope.currentRoom.ArrivalDate);
                        $scope.currentRoom.DepartureDate = new Date($scope.currentRoom.DepartureDate);
                        $scope.str = $scope.currentRoom.ArrivalDate.format('dd/mm/yyyy HH:MM');
                        $scope.str2 = $scope.currentRoom.DepartureDate.format('dd/mm/yyyy HH:MM');
                        $scope.warning = false;
                        $scope.warningDate = false;
                        $scope.warningDepartureDate = false;
                    }
                    Init();
                    $scope.hide = function () {
                        $mdDialog.hide();
                    };
                    $scope.cancel = function () {
                        $mdDialog.cancel();
                    };
                    $scope.minDepartureDate = $scope.currentRoom.ArrivalDate;

                    $scope.$watchCollection('currentRoom', function (newValues, oldValues) {
                        if (newValues !== null && oldValues !== null && !angular.equals(newValues, oldValues)) {
                            $scope.minDepartureDate = newValues.ArrivalDate;
                        }
                    });

                    $scope.saveAmendStay = function () {
                        var validAmendment = true;
                        if ($scope.currentRoom.reservationRoom) {
                            $scope.currentRoom.ArrivalDate = $scope.currentRoom.reservationRoom.ArrivalDate;
                            $scope.currentRoom.DepartureDate = currentRoom.reservationRoom.DepartureDate;
                        }
                        if ($scope.currentRoom.ArrivalDate <= $scope.currentRoom.DepartureDate) {
                            $scope.warningDate = false;
                            $scope.currentRoom.ArrivalDate = new Date($scope.currentRoom.ArrivalDate);
                            $scope.currentRoom.DepartureDate = new Date($scope.currentRoom.DepartureDate);
                            if ($scope.currentRoom.DepartureDate < new Date()) {
                                $scope.warningDepartureDate = true;
                                return;
                            } else if ($scope.currentRoom.ArrivalDate <= new Date() && ($scope.currentRoom.BookingStatus == "BOOKED" || $scope.currentRoom.BookingStatus == "NOSHOW")) {
                                $scope.warningArrivalDate = true;
                                return;
                            } else {
                                var keys = ["NOTIFICATION_WHEN_CHANGE_DATE"];
                                var languageKeys = {};
                                for (var idx in keys) {
                                    languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
                                }
                                var arrivalDateTemp = new Date($scope.currentRoom.ArrivalDate);
                                var departureDateTemp = new Date($scope.currentRoom.DepartureDate);
                                // currentRoom.reservationRoom.ArrivalDate
                                var AmendStayModel = {
                                    reservationRoomId: $scope.currentRoom.ReservationRoomId,
                                    departureDate: $scope.currentRoom.DepartureDate,
                                    arrivalDate: $scope.currentRoom.ArrivalDate,
                                    adults: $scope.currentRoom.Adults,
                                    child: $scope.currentRoom.Child,
                                    formatArrivalDate: new Date($scope.currentRoom.ArrivalDate).format('dd-mm-yyyy'),
                                    formatDepartureDate: new Date($scope.currentRoom.DepartureDate).format('dd-mm-yyyy'),
                                    languageKeys: languageKeys
                                }
                                if ($scope.currentRoom.roomBookingList && $scope.currentRoom.roomBookingList.NextReservation && $scope.currentRoom.roomBookingList.NextReservation.length > 0) {
                                    for (var index in $scope.currentRoom.roomBookingList.NextReservation) {
                                        var bookingTemp = $scope.currentRoom.roomBookingList.NextReservation[index];
                                        if (bookingTemp.ArrivalDate) {
                                            bookingTemp.ArrivalDate = new Date(bookingTemp.ArrivalDate);
                                        }
                                        if (bookingTemp.DepartureDate) {
                                            bookingTemp.DepartureDate = new Date(bookingTemp.DepartureDate);
                                        }
                                        if (bookingTemp.ArrivalDate.getTime() <= departureDateTemp.getTime() && departureDateTemp.getTime() <= bookingTemp.DepartureDate.getTime() ||
                                            departureDateTemp.getTime() >= bookingTemp.DepartureDate.getTime()
                                        ) {
                                            validAmendment = false;
                                            break;
                                        }
                                    }
                                }
                                if ($scope.currentRoom.roomBookingList && $scope.currentRoom.roomBookingList.PreviousReservation && $scope.currentRoom.roomBookingList.PreviousReservation.length > 0) {
                                    for (var index in $scope.currentRoom.roomBookingList.PreviousReservation) {
                                        var bookingTemp = $scope.currentRoom.roomBookingList.PreviousReservation[index];
                                        if (bookingTemp.ArrivalDate) {
                                            bookingTemp.ArrivalDate = new Date(bookingTemp.ArrivalDate);
                                        }
                                        if (bookingTemp.DepartureDate) {
                                            bookingTemp.DepartureDate = new Date(bookingTemp.DepartureDate);
                                        }
                                        if (bookingTemp.ArrivalDate.getTime() <= arrivalDateTemp.getTime() && arrivalDateTemp.getTime() <= bookingTemp.DepartureDate.getTime() || arrivalDateTemp.getTime() <= bookingTemp.ArrivalDate.getTime()) {
                                            validAmendment = false;
                                            break;
                                        }
                                    }

                                }
                                if (validAmendment === true) {
                                    console.log("FRONT AMEND 2", $scope.currentRoom);
                                    var data = {};
                                    data.AmendStayModel = AmendStayModel;
                                    data.currentRoom = currentRoom;
                                    data.now = $scope.currentRoom;
                                    $mdDialog.hide(data);
                                } else {
                                    $scope.warning = true;
                                }
                            }

                        } else {
                            $scope.warningDate = true;
                        }
                    }
                }
            }
            //new
            if (item.name == "MINIBAR" || item.name == "LAUNDRY" || item.name == "EXTRA_ROOM_CHARGE" || item.name == "COMPENSATION" || item.name == "EXTRA_SERVICES") {
                var itemTmp = angular.copy(item);
                SharedFeaturesFactory.processAddExtraService(selectedRoom, itemTmp);
            }
        };

        $scope.createReservation = function (item) {
            roomListFactory.getRoomList(new Date(), function (data) {
                $scope.roomList = data;
                if (item == "walkin") {
                    $location.path('/walkin');
                    // $state.go("walkin", {
                    //     reload: true
                    // });
                } else {
                    $location.path('/newGroup');
                    // $state.go("newGroup", {
                    //     reload: true
                    // });
                }
            });           
        }

        $scope.InOutClick = function (ev, item) {
            if (item.BookingStatus == "BOOKED" || item.BookingStatus == "NOSHOW") {
                $scope.quickCheckIn(ev, item);
            } else {
                //if reservation is group -> back to groupReservationDetail 
                var isGroup = item.IsGroup;
                if(isGroup){
                    var reservationIdTemp = item.Reservations.ReservationId;
                    $mdDialog.show({
                        controller: BackToGroupDetailController,
                        resolve: {
                            reservationId: function () {
                                return reservationIdTemp;
                            }
                        },
                        templateUrl: 'views/templates/backToGroupDetail.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: null,
                        clickOutsideToClose: false
                    })
                        .then(function (reservationId) {
                            $location.path("groupReservationDetail/" + reservationId);
                        }, function () {
    
                        });
    
                    function BackToGroupDetailController($scope, $mdDialog, reservationId) {
                        function Init() {
                            $scope.ReservationId = reservationId;
                        }
                        Init();
                        $scope.hide = function () {
                            $mdDialog.hide();
                        };
                        $scope.cancel = function () {
                            $mdDialog.cancel();
                        };
                        $scope.goToGroup = function () {
                            $mdDialog.hide($scope.ReservationId);
                        };
                    }
                }
                else{
                    $scope.dialogLiveCheckout(ev, item);
                }
            }
        }

        // booking list
        function ShowReservationListController($scope, $mdDialog, selectedRoom, loginFactory) {
            function Init() {
                $scope.selectedRoom = selectedRoom;
                $scope.UpToDate = addDays(new Date(), 7);
            }
            Init();
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            function addDays(date, days) {
                var result = new Date(date);
                result.setDate(result.getDate() + days);
                return new Date(result.getFullYear(), result.getMonth(), result.getDate(), result.getHours(), result.getMinutes(), 0);
            }
        }

        // cancel controller
        function CancelUnassignRRDialogController($scope, $mdDialog, ReservationRoomId, ReservationNumber, selectedRoom, loginFactory) {
            $scope.warningCancellationFeeInvalid;
            $scope.warningMissingReason;

            function Init() {
                $scope.SendEmail = true;
                $scope.decimal = $rootScope.decimals;
                $scope.ReservationRoomId = ReservationRoomId;
                $scope.ReservationNumber = ReservationNumber;
                $scope.selectedRoom = selectedRoom;
                // if ($scope.selectedRoom.Rooms === null) {
                //     $scope.selectedRoom.RoomName = ''
                // } else {
                //     $scope.selectedRoom.RoomName = $scope.selectedRoom.Rooms.RoomName;
                // }
                delete $scope.selectedRoom.Rooms;
                $scope.selectedRoom.roomType = $scope.selectedRoom.RoomTypes;
                delete $scope.selectedRoom.RoomTypes
                $scope.selectedRoom.reservationRoom = {
                    ArrivalDate: $scope.selectedRoom.ArrivalDate,
                    DepartureDate: $scope.selectedRoom.DepartureDate,
                    Adults: $scope.selectedRoom.Adults,
                    Child: $scope.selectedRoom.Child,
                    PaymentsList: $scope.selectedRoom.PaymentsList,
                    Travellers: $scope.selectedRoom.Travellers,
                    RoomExtraServicesList: $scope.selectedRoom.RoomExtraServicesList
                }
                console.log("SELECTED ROOM 1", $scope.selectedRoom);
                $scope.selectedRoom.TotalDeposit = 0;
                if ($scope.selectedRoom.reservationRoom && $scope.selectedRoom.reservationRoom.PaymentsList && $scope.selectedRoom.reservationRoom.PaymentsList.length > 0) {
                    for (var index in $scope.selectedRoom.reservationRoom.PaymentsList) {
                        $scope.selectedRoom.TotalDeposit = $scope.selectedRoom.TotalDeposit + $scope.selectedRoom.reservationRoom.PaymentsList[index].Amount;
                    }
                }

                if ($scope.selectedRoom.reservationRoom && $scope.selectedRoom.reservationRoom.RoomExtraServicesList && $scope.selectedRoom.reservationRoom.RoomExtraServicesList.length > 0) {
                    for (var index in $scope.selectedRoom.reservationRoom.RoomExtraServicesList) {
                        if (!$scope.selectedRoom.reservationRoom.RoomExtraServicesList[index].IsDeleted) {
                            $scope.selectedRoom.TotalDeposit = $scope.selectedRoom.TotalDeposit - $scope.selectedRoom.reservationRoom.RoomExtraServicesList[index].Amount;
                        }

                    }
                }

                if ($scope.selectedRoom.reservationRoom.ArrivalDate) {
                    $scope.selectedRoom.reservationRoom.ArrivalDate = new Date($scope.selectedRoom.reservationRoom.ArrivalDate);
                }
                if ($scope.selectedRoom.reservationRoom.DepartureDate) {
                    $scope.selectedRoom.reservationRoom.DepartureDate = new Date($scope.selectedRoom.reservationRoom.DepartureDate);
                }
                console.log("SELECTED ROOM", $scope.selectedRoom);
                $scope.cancelReason = null;
                $scope.cancelFlat = 0;
                $scope.cancelPercentage = 0;
                $scope.warningCancellationFeeInvalid = false;
                $scope.warningMissingReason = false;
            }
            Init();

            $scope.processCancel = function () {

                if (!$scope.cancelReason || $scope.cancelReason.trim() === '') {
                    $scope.warningMissingReason = true;
                } else if ($scope.selectedRoom.TotalDeposit > 0 && $scope.selectedRoom.TotalDeposit * $scope.cancelPercentage / 100 + $scope.cancelFlat > $scope.selectedRoom.TotalDeposit) {
                    $scope.warningCancellationFeeInvalid = true;
                    $scope.warningMissingReason = false;
                } else
                    if ($scope.applyCancellationFees && ($scope.cancelFlat + $scope.cancelPercentage === 0)) {
                        $scope.warningMissingFees = true;
                        $scope.warningCancellationFeeInvalid = false;
                        $scope.warningMissingReason = false;
                    } else {
                        var cancelModel = {
                            ReservationRoomId: $scope.ReservationRoomId,
                            ApplyCancellationFees: $scope.applyCancellationFees,
                            CancelReason: $scope.cancelReason,
                            CancelFlat: $scope.cancelFlat,
                            CancelPercentage: $scope.cancelPercentage,
                            TotalDeposit: $scope.selectedRoom.TotalDeposit,
                            languageKeys: $scope.selectedRoom.languageKeys,
                            SendEmail: $scope.SendEmail
                        };
                        $mdDialog.hide(cancelModel);
                    }


            }

            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
        }

        // quịk checkin
        $scope.quickCheckIn = function (ev, item) {
            if (item.reservationRoom.DepartureDate < new Date()) {
                dialogService.messageBox("CAN_NOT_CHECK_IN_DUE_TO_THE_DEPARTURE_DATE_WAS_IN_THE_PAST");
                return;
            }

            if (!item.reservationRoom.RoomPriceId) {
                var itemTemp = angular.copy(item);
                $mdDialog.show({
                    controller: CheckInDialogController,
                    resolve: {
                        ReservationRoomId: function () {
                            return item.reservationRoom.ReservationRoomId;
                        },
                        RoomTypeId: function () {
                            return item.RoomTypeId;
                        },
                        RateList: function () {
                            return $scope.rateList;
                        }
                    },
                    templateUrl: 'views/templates/liveCheckIn.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                }).then(function (checkInModel) {
                    var processCheckIn = loginFactory.securedPostJSON("api/Room/ProcessCheckIn?RRID=" + checkInModel.ReservationRoomId + "&roomPriceId=" + checkInModel.RoomPriceId, "");
                    $rootScope.dataLoadingPromise = processCheckIn;
                    processCheckIn.success(function (data) {
                        //item.BookingStatus = "CHECKIN";
                        $scope.Init();
                        //dialogService.toast("CANCEL_BOOKING_SUCCESSFUL");
                    }).error(function (err) {
                        console.log(err);
                    })
                }, function () {

                });
            } else {
                doCheckIn(item, null);               
            }
        }

        function doCheckIn(item, ev) {
            if (item.HouseStatus === "DIRTY") {
                dialogService.confirm("ROOM_DIRTY", "DO_YOU_WANT_TO_CONTINUE?").then(function () {
                    processCheckIn(item);
                });
            } else {
                processCheckIn(item);
            }
        }

        function processCheckIn(item) {
            var roomRemarks;
            var getRoomRemarks = loginFactory.securedGet("api/Room/GetRoomRemarks", "RRID=" + item.reservationRoom.ReservationRoomId);
            $rootScope.dataLoadingPromise = getRoomRemarks;
            getRoomRemarks.then(function (data) {
                roomRemarks = data.data;
                for (var index in roomRemarks) {
                    if (roomRemarks[index].CreatedDate) {
                        roomRemarks[index].CreatedDate = new Date(roomRemarks[index].CreatedDate);
                    }
                    for (var index2 in $scope.remarkEvents) {
                        if ($scope.remarkEvents[index2].RemarkEventId == roomRemarks[index].RemarkEventId) {
                            roomRemarks[index].RemarkEventCode = $scope.remarkEvents[index2].RemarkEventCode;
                            break;
                        }
                    }
                }
                $mdDialog.show({
                    controller: CheckInDialogController,
                    resolve: {
                        selectedRoom: function () {
                            return item;
                        },
                        currentHotelConnectivities: function () {
                            return $scope.currentHotelConnectivites;
                        },
                        roomRemarks: function () {
                            return roomRemarks;
                        }
                    },
                    templateUrl: 'views/templates/checkInDialog.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: event
                }).then(function (checkInModel) {
                    console.log("isCreateCard", checkInModel.isCreateCard);
                    if (checkInModel.isCreateCard === true && item.UseLock) {
                        // use NeoLock
                        if ($rootScope.Connectivities != null && $rootScope.Connectivities.code.HotelConnectivityModuleName === "SMART_NEO_LOCK" ) {
                            //var reason = null;
                            var writeCardModel = {
                                RoomName: item.RoomName,
                                RoomDescription: item.RoomDescription,
                                TravellerName: item.reservationRoom.Travellers.Fullname,
                                ArrivalDate: item.reservationRoom.ArrivalDate,
                                DepartureDate: item.reservationRoom.DepartureDate,
                                OverrideOldCards: true
                            };
                            if ($scope.currentHotelConnectivites.IsAutomaticalAddHourCheckout == true) {
                                writeCardModel = smartCardFactory.addHourCheckOutCard(writeCardModel, $scope.currentHotelConnectivites.HourAddToCheckout);
                            };
                            frontOfficeFactory.preProcessNoshow(item.reservationRoom, item.reservationRoom.ReservationRoomId, function (dataNoshow) {

                                reservationFactory.changeStatus(item.reservationRoom.ReservationRoomId, "CHECKIN", function (data) {
                                    var createCard = smartCardFactory.writeCardDashboard(writeCardModel, item.reservationRoom.ReservationRoomId, checkInModel.reason);

                                    createCard.then(function (data) {
                                        if (data.passcode != null) {
                                            dialogService.toastSuccess($filter("translate")("CREATE_CARD_SUCCESSFUL") + " " + data.passcode);
                                        } else {
                                            dialogService.messageBox(data.message);
                                        }
                                    }),function(){
                                        
                                    }
                                    item.BookingStatus = "CHECKIN";
                                    $scope.Init();
                                });
                            });

                        } else {

                            dialogService.confirm("PLEASE_BE_SURE_THE_VALID_CARD_IS_BEING_INSERTED").then(function () {
                                var writeCardModel = {
                                    RoomName: item.RoomName,
                                    TravellerName: item.reservationRoom.Travellers.Fullname,
                                    ArrivalDate: item.reservationRoom.ArrivalDate,
                                    DepartureDate: item.reservationRoom.DepartureDate,
                                    OverrideOldCards: true
                                };
                                if ($scope.currentHotelConnectivites.IsAutomaticalAddHourCheckout == true) {
                                    writeCardModel = smartCardFactory.addHourCheckOutCard(writeCardModel, $scope.currentHotelConnectivites.HourAddToCheckout);
                                };
                                frontOfficeFactory.preProcessNoshow(item.reservationRoom, item.reservationRoom.ReservationRoomId, function (dataNoshow) {
                                    reservationFactory.changeStatus(item.reservationRoom.ReservationRoomId, "CHECKIN", item, SharedFeaturesFactory, function (data) {
                                        var createCard = smartCardFactory.writeCardInWalkin(writeCardModel, item.reservationRoom.ReservationRoomId, checkInModel.reason);
                                        createCard.then(function (data) {
                                            if (data.Result !== null && data.Result == 0) {
                                                frontOfficeFactory.processNoshow(item.reservationRoom, dataNoshow.roomCharges, item.reservationRoom.ReservationRoomId, function () {
                                                    dialogService.toast("CHECKIN_AND_CREATE_CARD_SUCCESSFUL");
                                                });
                                            } else {
                                                dialogService.messageBox("INVALID_CARD").then(function (data) {
                                                    //$rootScope.pageInit = true;
                                                    frontOfficeFactory.processNoshow(item.reservationRoom, dataNoshow.roomCharges, item.reservationRoom.ReservationRoomId, function () {
                                                        $scope.Init();
                                                    });
                                                });
                                            }
                                        }, function () {
                                            dialogService.messageBox("INVALID_CARD").then(function (data) {
                                                //$rootScope.pageInit = true;
                                                frontOfficeFactory.processNoshow(item.reservationRoom, dataNoshow.roomCharges, item.reservationRoom.ReservationRoomId, function () {
                                                    $scope.Init();
                                                });
                                            });
                                        })
                                        item.BookingStatus = "CHECKIN";
                                        $scope.Init();
                                    });
                                });
                            });

                        }
                    } else {
                        frontOfficeFactory.preProcessNoshow(item.reservationRoom, item.reservationRoom.ReservationRoomId, function (dataNoshow) {
                            reservationFactory.changeStatus(item.reservationRoom.ReservationRoomId, "CHECKIN", item, SharedFeaturesFactory, function (da) {
                                frontOfficeFactory.processNoshow(item.reservationRoom, dataNoshow.roomCharges, item.reservationRoom.ReservationRoomId, function () {
                                    item.BookingStatus = "CHECKIN";
                                    dialogService.toast("CHECKIN_SUCCESSFUL");
                                    $scope.Init();
                                });
                            });
                        });
                    }
                }, function () {

                });

                function CheckInDialogController($scope, $mdDialog, selectedRoom, currentHotelConnectivities, roomRemarks, loginFactory) {
                    $scope.isCardExist = false;
                    $scope.isCreateCard = true;

                    function Init() {
                        $scope.currentHotelConnectivities = currentHotelConnectivities;

                        $scope._selectedRoom = angular.copy(selectedRoom);
                        console.log(roomRemarks);

                        $scope.roomRemarks = roomRemarks;
                        var getCardInfo = loginFactory.securedGet("api/Connectivities/GetCardInfomation", "RRID=" + selectedRoom.reservationRoom.ReservationRoomId + "&roomName=" + selectedRoom.RoomName);
                        $rootScope.dataLoadingPromise = getCardInfo;
                        getCardInfo.success(function (data) {
                            if (data !== null && data.length > 0) {
                                $scope.isCreateCard = false;
                                $scope.isCardExist = true;
                                $scope.cardInfo = data;
                                for (var index in $scope.cardInfo) {
                                    if ($scope.cardInfo[index].CreatedDate) {
                                        $scope.cardInfo[index].CreatedDate = new Date($scope.cardInfo[index].CreatedDate);
                                    }
                                }
                                $scope.cardInfo.sort(function (a, b) {
                                    return a.CreatedDate - b.CreatedDate;
                                });
                            }
                        }).error(function (err) {
                            console.log(err);
                        });
                        $scope.reason = null;
                    }
                    Init();
                    $scope.hide = function () {
                        $mdDialog.hide();
                    };
                    $scope.cancel = function () {
                        $mdDialog.cancel();
                    }
                    $scope.processCheckIn = function () {
                        var checkInModel = {
                            isCreateCard: $scope.isCreateCard,
                            reason: $scope.reason
                        }
                        if ($scope.currentHotelConnectivities.isUsed === false) {
                            checkInModel.isCreateCard = false;
                        }
                        $mdDialog.hide(checkInModel);
                    }
                }
            });

        }
        // end quick checkin

        // print invoice
        $scope.showInvoice = function (ev, item) {
            var keys = ["ROOM_MONTHLY", "ROOM_WEEKLY", "ROOM_FULL_DAY", "ROOM_DAY_NIGHT", "ROOM_HOURLY", "MINIBAR", "LAUNDRY", "EXTRA_ROOM_CHARGE", "COMPENSATION", "EXTRA_SERVICES", "FULL_DAY_EARLY_CHECKIN", "FULL_DAY_LATE_CHECKOUT", "DAY_NIGHT_EARLY_CHECKIN", "DAY_NIGHT_LATE_CHECKOUT", "EXTRA_ADULTS", "EXTRA_CHILDREN", "PAYMENT", "DISCOUNT_MONEY_OFF", "DISCOUNT_PERCENT_OFF", "FREE"];
            var languageKeys = {};
            for (var idx in keys) {
                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
            }

            var selectRR = item;

            var CreateRoomInvoice = {
                roomId: selectRR.reservationRoom.RoomId,
                reservationRoomId: selectRR.reservationRoom.ReservationRoomId,
                arrivalDate: selectRR.reservationRoom.ArrivalDate,
                departureDate: new Date(),
                adults: selectRR.reservationRoom.Adults,
                children: selectRR.reservationRoom.Child,
                languageKeys: languageKeys,
                FOC: selectRR.reservationRoom.Foc,
                DiscountPercentage: selectRR.reservationRoom.DiscountPercentage,
                DiscountFlat: selectRR.reservationRoom.DiscountFlat,
                RoomPriceId: selectRR.reservationRoom.RoomPriceId,
                Price: selectRR.reservationRoom.Price
            }
            var modelRoomInvoiceFullDay = {
                roomId: selectRR.reservationRoom.RoomId,
                reservationRoomId: selectRR.reservationRoom.ReservationRoomId,
                arrivalDate: selectRR.reservationRoom.ArrivalDate,
                departureDate: selectRR.reservationRoom.DepartureDate,
                adults: selectRR.reservationRoom.Adults,
                children: selectRR.reservationRoom.Child,
                languageKeys: languageKeys,
                FOC: selectRR.reservationRoom.Foc,
                DiscountPercentage: selectRR.reservationRoom.DiscountPercentage,
                DiscountFlat: selectRR.reservationRoom.DiscountFlat,
                RoomPriceId: selectRR.reservationRoom.RoomPriceId,
                Price: selectRR.reservationRoom.Price
            }
            if ($scope.applyPastCheckOut) {
                CreateRoomInvoice.departureDate = selectRR.reservationRoom.DepartureDate;
            }
            var CreateRoomInvoice = loginFactory.securedPostJSON("api/Room/CreateRoomInvoice", CreateRoomInvoice);
            $rootScope.dataLoadingPromise = CreateRoomInvoice;
            CreateRoomInvoice.success(function (data) {
                $mdDialog.show({
                    controller: ['$scope', '$mdDialog', 'loginFactory', 'reservationRoomId', 'hotelFormRoomInvoice', 'modelRoomInvoiceFullDay', '$rootScope', InvoiceController],
                    locals: {
                        reservationRoomId: selectRR.reservationRoom.ReservationRoomId,
                        hotelFormRoomInvoice: $scope.hotelFormRoomInvoice,
                        modelRoomInvoiceFullDay: modelRoomInvoiceFullDay
                    },
                    templateUrl: 'views/templates/invoice.tmpl.html',
                    parent: angular.element(document.body),
                    // targetEvent: ev,
                    clickOutsideToClose: false
                })
                    .then(function (answer) { }, function () {

                    });
            }).error(function (err) {
                console.log(err);
            });
        };

        function InvoiceController($scope, $mdDialog, loginFactory, reservationRoomId, hotelFormRoomInvoice, modelRoomInvoiceFullDay, $rootScope) {
            //showInvoice(reservationRoomId);
            $scope.hideFullDay = false;
            $scope.isFullDay = true;
            var modelRoomInvoiceFullDayTemp = angular.copy(modelRoomInvoiceFullDay);
            globalInvoiceId = reservationRoomId;
            HotelFormRoomInvoice = hotelFormRoomInvoice;
            console.log('globalInvoiceId', globalInvoiceId, HotelFormRoomInvoice);
            _reservationId = 0;
            $scope.showInvoiceFullDay = function (isFullDay) {
                if (isFullDay == false) {
                    var CreateRoomInvoice = loginFactory.securedPostJSON("api/Room/CreateRoomInvoice", modelRoomInvoiceFullDay);
                    $rootScope.dataLoadingPromise = CreateRoomInvoice;
                    CreateRoomInvoice.success(function (data) {
                        showReport();
                    });
                } else {
                    modelRoomInvoiceFullDayTemp.departureDate = new Date();
                    var CreateRoomInvoice = loginFactory.securedPostJSON("api/Room/CreateRoomInvoice", modelRoomInvoiceFullDayTemp);
                    $rootScope.dataLoadingPromise = CreateRoomInvoice;
                    CreateRoomInvoice.success(function (data) {
                        showReport();
                    });
                }
            };

            $scope.showScreen = true;
            $scope.showExtendedScreen = function () {
                $scope.showScreen = false;
                var tab = $rootScope.ExtendedScreen;
                if (tab != null && tab.Document != null) {
                    tab.focus();
                    loginFactory.securedGet("api/Test/Message", "id=" + reservationRoomId + "&cmd=showInvoice" + "&hotelInvoice=" + hotelFormRoomInvoice);
                } else {
                    tab = window.open("#/extendedScreen", '_blank');
                    $rootScope.ExtendedScreen = tab;
                    setTimeout(function () {
                        loginFactory.securedGet("api/Test/Message", "id=" + reservationRoomId + "&cmd=showInvoice" + "&hotelInvoice=" + hotelFormRoomInvoice);
                    }, 8000)
                }
            };
            $scope.hideExtendedScreen = function () {
                $scope.showScreen = true;
                loginFactory.securedGet("api/Test/Message", "id=" + reservationRoomId + "&cmd=hideInvoice" + "&hotelInvoice=" + hotelFormRoomInvoice);
            };

            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
        }

        // quick checkout
        $scope.dialogLiveCheckout = function (ev, item) {
            var itemTemp = angular.copy(item);
            console.log('item', item);
            $scope.checkOutDialog = $mdDialog;
            $scope.checkOutDialog.show({
                templateUrl: 'views/templates/liveCheckOut.tmpl.html',
                clickOutsideToClose: false,
                locals: {
                    local: [itemTemp, $scope.checkOutDialog, $scope]
                },
                resolve: {
                    currentHotelConnectivities: function () {
                        return currentHotelConnectivities;
                    }
                },
                controller: ['$scope', '$mdDialog', '$filter', '$rootScope', 'loginFactory', 'dialogService', '$state', 'local', 'currentHotelConnectivities', 'smartCardFactory', 'SharedFeaturesFactory', LiveCheckOutController]
            }).then(function (data) {
                if (data != undefined && data == true) {
                    //loinq
                    $state.go($state.current, {}, {
                        reload: true
                    });
                }
            }, function (data) {

            });
        };

        function LiveCheckOutController($scope, $mdDialog, $filter, $rootScope, loginFactory, dialogService, $state, local, currentHotelConnectivities, smartCardFactory, SharedFeaturesFactory) {
            $scope.localCopy = local;
            $scope.decimal = $rootScope.decimals;
            $scope.type = "CHECKOUT";
            $scope.btDisabled = true;
            $scope.listItems = [];
            $scope.removeItem = false;
            $scope.ExtraServiceQuantity = 1;
            $scope.isSelectedTab = false;
            $scope.SendEmail = false;

            var keys = ["ROOM_MONTHLY", "ROOM_WEEKLY", "ROOM_FULL_DAY", "ROOM_DAY_NIGHT", "ROOM_HOURLY", "MINIBAR", "LAUNDRY", "EXTRA_ROOM_CHARGE", "COMPENSATION", "EXTRA_SERVICES", "FULL_DAY_EARLY_CHECKIN", "FULL_DAY_LATE_CHECKOUT", "DAY_NIGHT_EARLY_CHECKIN", "DAY_NIGHT_LATE_CHECKOUT", "EXTRA_ADULTS", "EXTRA_CHILDREN"];
            var languageKeys = {};
            for (var idx in keys) {
                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
            }

            function getOldES(data) {
                for (var idx in data.ExtraServiceTypes) {
                    data.ExtraServiceTypes[idx].IsHide = true;
                    var countItem = data.ExtraServiceItems.filter(function (item) {
                        return data.ExtraServiceTypes[idx].ExtraServiceTypeId == item.ExtraServiceTypeId;
                    });
                    if (countItem.length > 0) {
                        data.ExtraServiceTypes[idx].IsHide = false;
                    }
                }
                //
                var oldES = local[1];
                if (oldES != undefined && oldES != null) {
                    angular.forEach(oldES.items, function (arr) {
                        angular.forEach(data.ExtraServiceItems, function (arr1) {
                            if (arr1.ExtraServiceItemId == arr.item.ExtraServiceItemId) {
                                arr1.quantity = arr.item.quantity;
                            } else if (arr.item.RoomExtraServiceName == "EXTRA_SERVICES") {
                                $scope.ExtraServiceDescription = arr.item.RoomExtraServiceDescription;
                                $scope.ExtraServiceAmount = arr.item.Amount;
                            }
                        });
                    });
                }
                return data;
            }

            function resultDataProcess(data) {
                if (data.planListConstantlyFormula) {
                    for (var index in data.planListConstantlyFormula) {
                        var formulaTemp = data.planListConstantlyFormula[index];

                        formulaTemp.Range.Start = new Date(formulaTemp.Range.Start);
                        formulaTemp.Range.End = new Date(formulaTemp.Range.End);
                        formulaTemp.FormulaPeriodAfter = formulaTemp.FormulaPeriod;
                        if (_.size(formulaTemp.NotAvailableDays) > 0) {
                            formulaTemp.FormulaPeriodAfter = formulaTemp.FormulaPeriod - _.size(formulaTemp.NotAvailableDays);

                            for (var index2 in formulaTemp.NotAvailableDays) {
                                var dateTemp = new Date(formulaTemp.NotAvailableDays[index2]).toLocaleDateString();
                                formulaTemp.NotAvailableDays[index2] = dateTemp;
                            }
                        }
                    }
                }

                if (data.planListFullDayFormula && data.day > 0 && data.planListFullDayFormula.length > 0) {
                    for (var index in data.planListFullDayFormula) {
                        var formulaTemp = data.planListFullDayFormula[index];

                        formulaTemp.range.Start = new Date(formulaTemp.range.Start);
                        formulaTemp.range.End = new Date(formulaTemp.range.End);
                    }
                }
                if (data.planListHourlyFormula) {
                    if (data.planListHourlyFormula.availableHourlyFormula) {
                        for (var index in data.planListHourlyFormula.availableHourlyFormula) {
                            var formulaTemp = data.planListHourlyFormula.availableHourlyFormula[index];

                            formulaTemp.Range.Start = new Date(formulaTemp.Range.Start);
                            formulaTemp.Range.End = new Date(formulaTemp.Range.End);
                        }
                    }
                    if (data.planListHourlyFormula.finalHourlyFormula) {
                        data.planListHourlyFormula.finalHourlyFormula.Range.Start = new Date(data.planListHourlyFormula.finalHourlyFormula.Range.Start);
                        data.planListHourlyFormula.finalHourlyFormula.Range.End = new Date(data.planListHourlyFormula.finalHourlyFormula.Range.End);
                    }
                }
                return data;
            };
            $scope.remainingAmount = function () {
                var total = 0;
                total = $scope.room.Total;
                for (var idx in $scope.RoomExtraServices) {
                    if ($scope.RoomExtraServices[idx].willPay && !$scope.RoomExtraServices[idx].IsDeleted) {
                        total += $scope.RoomExtraServices[idx].Amount * $scope.RoomExtraServices[idx].Quantity;
                    }
                }
                for (var idx in $scope.Payments) {
                    total -= $scope.Payments[idx].Amount;
                }
                //làm tròn số thập phân sau , theo tiền tệ
                total = parseFloat(total.toFixed($rootScope.decimals));
                return total;
            };

            function Init() {
                $scope.currentItem = local[0];
                $scope.showInvoice = true;
                $scope.showEmail = false;
                var getQuickCheckOut = loginFactory.securedGet("api/Room/GetQuickCheckOut", "reservationRoomId=" + $scope.currentItem.reservationRoom.ReservationRoomId);
                $rootScope.dataLoadingPromise = getQuickCheckOut;
                getQuickCheckOut.success(function (data) {
                    console.log('Quick CheckOut', data);

                    if (data.hotelEmailModule != null) {
                        $scope.showEmail = true;
                        $scope.SendEmail = true;
                    }

                    var extraService = data.ListExtraService;
                    var reservationRoom = data.Reservation;
                    var calculateRoomPrice = data.CalculateRoomPrice;
                    var hotelFormInvoice = data.FormInvoice;
                    //Extra Service
                    for (var index in extraService.ExtraServiceItems) {
                        if (!extraService.ExtraServiceItems[index].quantity) {
                            extraService.ExtraServiceItems[index].quantity = 0;
                        }
                        for (var index2 in extraService.ExtraServiceTypes) {
                            if (extraService.ExtraServiceTypes[index2].ExtraServiceTypeId.toString() === extraService.ExtraServiceItems[index].ExtraServiceTypeId.toString()) {
                                extraService.ExtraServiceItems[index].ExtraServiceTypeName = extraService.ExtraServiceTypes[index2].ExtraServiceTypeName;
                                break;
                            }
                        }
                    }
                    var item = {
                        ExtraServiceTypeName: 'EXTRA_SERVICES',
                        ExtraServiceItemName: 'ADD_NEW_ITEM'
                    };
                    extraService.ExtraServiceItems.push(item);

                    $scope.extraservice = getOldES(extraService);
                    console.log("ExtraServiceItems:", $scope.extraservice.ExtraServiceItems);
                    //ReservationRoom
                    $scope.room = reservationRoom.room;
                    $scope.room.IsPreCheckOut = data.IsPreCheckOut;
                    $scope.room.RoomDescription = reservationRoom.roomInfo.RoomDescription;
                    $scope.room.RoomName = $scope.currentItem.RoomName;
                    $scope.customer = reservationRoom.customer;
                    $scope.applyPastCheckOut = reservationRoom.applyPastCheckOut;
                    //useLock 
                    $scope.useLockLiveCheckOut = roomListFactory.getRoomById(reservationRoom.roomInfo.RoomId);

                    //Currencies
                    $scope.currencies = reservationRoom.currencies;
                    $scope.defaultCurrency = reservationRoom.defaultCurrency;
                    //shareList
                    $scope.sharerList = reservationRoom.sharerList;
                    //Extra Service
                    $scope.ExtraServices = reservationRoom.extraServices;
                    $scope.ExtraServiceItems = reservationRoom.extraServiceItems;
                    var payments = angular.copy(reservationRoom.Payments);

                    $scope.Payments = payments;

                    $scope.RoomExtraServices = reservationRoom.roomExtraServices;
                    for (var idx in $scope.RoomExtraServices) {
                        $scope.RoomExtraServices[idx].CreatedDate = new Date($scope.RoomExtraServices[idx].CreatedDate);
                        $scope.RoomExtraServices[idx].willPay = true;
                    }
                    if (reservationRoom.room.ArrivalDate) {
                        reservationRoom.room.ArrivalDate = new Date(reservationRoom.room.ArrivalDate);
                    }
                    if (reservationRoom.room.DepartureDate) {
                        reservationRoom.room.DepartureDate = new Date(reservationRoom.room.DepartureDate);
                    }

                    $scope.paymentMethods = reservationRoom.paymentMethods;
                    for (var index in $scope.paymentMethods) {
                        if ($scope.paymentMethods[index].PaymentMethodName.toLowerCase() === "cash") {
                            $scope.defaultPaymentMethod = $scope.paymentMethods[index];
                            break;
                        }
                    }
                    //CalculateRoomPrice

                    $scope.priceList = calculateRoomPrice;
                    $scope.room.Total = calculateRoomPrice.totalPrice;
                    $scope.priceList = resultDataProcess(calculateRoomPrice);
                    $scope.Amount = $scope.remainingAmount();
                    console.log('Amount:', $scope.Amount);
                    $scope.payment = {
                        Amount: $scope.remainingAmount(),
                        PaymentMethodId: $scope.defaultPaymentMethod.PaymentMethodId,
                        MoneyId: $scope.defaultCurrency.MoneyId,
                        PaymentTypeName: "NEW_PAYMENT",
                        SendEmail: $scope.SendEmail
                    };

                    //FormInvoice
                    $scope.hotelFormRoomInvoice = hotelFormInvoice.FormType + hotelFormInvoice.Value + '.trdx';
                    setTimeout(function () {
                        $scope.$apply()
                    }, 0);
                });
            }
            Init();

            function processIsInputCardToCheckOut(callback) {
                console.log('Connectivities CheckOut', currentHotelConnectivities);
                if ($scope.room && $scope.room.IsPreCheckOut) {
                    callback(true);
                    return;
                }
                if (currentHotelConnectivities && currentHotelConnectivities.isUsed && $scope.useLockLiveCheckOut.UseLock) {
                    //use card to checkout
                    //use NeoLock
                    if ($rootScope.Connectivities != null && $rootScope.Connectivities.code.HotelConnectivityModuleName === "SMART_NEO_LOCK" && currentHotelConnectivities.IsInputCardToCheckout) {
                        var writeCardModel = {
                            RoomName: $scope.room.RoomName,
                            RoomDescription: $scope.room.RoomDescription,
                            TravellerName:  $scope.customer.Fullname,
                            ArrivalDate: new Date(),
                            DepartureDate: $scope.room.DepartureDate,
                            OverrideOldCards: true
                        };

                        if ($rootScope.currentHotelConnectivites.IsAutomaticalAddHourCheckout == true) {
                            writeCardModel = smartCardFactory.addHourCheckOutCard(writeCardModel, $rootScope.currentHotelConnectivites.HourAddToCheckout);
                        };
                        var cardPromise = smartCardFactory.reWriteCardDashboard(writeCardModel, $scope.room.ReservationRoomId, null);
                        cardPromise.then(function (data) {
                            console.log("DATA PROMISE", data.Result);
                            if (data.passcode != null) {
                                dialogService.toastSuccess($filter("translate")("CREATE_CARD_SUCCESSFUL") + " " + data.passcode);
                                callback(true);
                            } else {
                                dialogService.messageBox(data.message);
                                callback(false);
                            }
                        });
                        callback(true);
                    } else {

                        if (currentHotelConnectivities.IsInputCardToCheckout) {
                            dialogService.messageBox("PLEASE_BE_SURE_THE_VALID_CARD_IS_BEING_INSERTED").then(function (arr) {
                                var readCard = smartCardFactory.readCardOnly();
                                readCard.then(function (dataCard) {
                                    console.info('read card only', dataCard);
                                    if (dataCard == -1) {
                                        dialogService.messageBox("INVALID_CARD");
                                        callback(false);
                                    } else if (dataCard && dataCard.TravellerId) {
                                        console.log('Vao day');
                                        if (dataCard.TravellerId == $scope.room.ReservationRoomId) {
                                            callback(true);
                                        } else {
                                            dialogService.messageBox("CARD_IS_NOT_CORRECT_ROOM");
                                            callback(false);
                                        }

                                    }
                                });
                            });
                        } else
                            callback(true);
                    }
                } else {
                    //Not use Smart Card
                    callback(true);
                }
            };

            function deleteCard() {
                if ($scope.room && $scope.room.IsPreCheckOut) {
                    return;
                }
                if (currentHotelConnectivities && currentHotelConnectivities.isUsed) {
                    if (currentHotelConnectivities.IsInputCardToCheckout) {
                        var deleteCardModel = {
                            ArrivalDate: $scope.room.ArrivalDate,
                            DepartureDate: $scope.room.DepartureDate,
                            RoomName: $scope.room.RoomName,
                            TravellerId: $scope.room.ReservationRoomId,
                        };
                        smartCardFactory.deleteCard(deleteCardModel);
                    }
                }
            }
            $scope.isClick = false;
            $scope.processQuickCheckOut = function (event) {
                event.preventDefault();
                if ($scope.isClick) return;
                $scope.isClick = true;
                setTimeout(function () {
                    $scope.isClick = false;
                }, 1000);
                //check smart card
                if (processIsInputCardToCheckOut(function (dataCard) {
                    //
                    if (!dataCard) return;
                    //
                    var paymentModel = null;
                    if ($scope.Amount != 0) {
                        //Payment
                        var Paykeys = ["RES_NO", "ROOM", "NOTIFICATION_CHECKOUT_MES", "NOTIFICATION_NEWPAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER"];
                        var languagePayKeys = {};
                        for (var idx in Paykeys) {
                            languagePayKeys[Paykeys[idx]] = $filter("translate")(Paykeys[idx]);
                        };
                        var payment = angular.copy($scope.payment);
                        payment.ReservationRoomId = $scope.currentItem.reservationRoom.ReservationRoomId;
                        paymentModel = {
                            payment: payment,
                            languageKeys: languagePayKeys
                        };
                        //
                        if ($scope.Amount < 0) {
                            paymentModel.payment.PaymentTypeName = "REFUND";
                        };
                    } else {
                        var Paykeys = ["RES_NO", "ROOM", "NOTIFICATION_CHECKOUT_MES", "NOTIFICATION_NEWPAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER"];
                        var languagePayKeys = {};
                        for (var idx in Paykeys) {
                            languagePayKeys[Paykeys[idx]] = $filter("translate")(Paykeys[idx]);
                        };
                        paymentModel = {
                            payment: {},
                            languageKeys: languagePayKeys
                        };
                    }
                    //process checkout
                    var keys = ["ROOM_MONTHLY", "NOTIFICATION_CHECKOUT_MES", "ROOM_WEEKLY", "ROOM_FULL_DAY", "ROOM_DAY_NIGHT", "ROOM_HOURLY", "MINIBAR", "LAUNDRY", "EXTRA_ROOM_CHARGE", "COMPENSATION", "EXTRA_SERVICES", "FULL_DAY_EARLY_CHECKIN", "FULL_DAY_LATE_CHECKOUT", "DAY_NIGHT_EARLY_CHECKIN", "DAY_NIGHT_LATE_CHECKOUT", "EXTRA_ADULTS", "EXTRA_CHILDREN", "PAYMENT", "DISCOUNT_MONEY_OFF", "DISCOUNT_PERCENT_OFF", "FREE"];
                    var languageKeys1 = {};
                    for (var idx in keys) {
                        languageKeys1[keys[idx]] = $filter("translate")(keys[idx]);
                    }
                    //
                    var currentRoom = angular.copy($scope.room);
                    currentRoom.BookingStatus = "CHECKOUT";
                    if (!$scope.applyPastCheckOut) {
                        currentRoom.DepartureDate = new Date();
                    }
                    var data = {
                        room: currentRoom,
                        customer: $scope.customer,
                        paymentList: undefined,
                        languageKeys: languageKeys1,
                        sharerList: $scope.sharerList
                    }
                    var model = {
                        Payments: paymentModel,
                        RoomData: data,
                        SendEmail: $scope.SendEmail
                    }
                    var promise = loginFactory.securedPostJSON("api/Room/ProcessQuickCheckOut", model);
                    $rootScope.dataLoadingPromise = promise;
                    promise.success(function (id) {
                        local[2].Init();

                        deleteCard();
                        dialogService.toast("CHECKOUT_SUCCESSFUL");
                        $mdDialog.hide();
                    }).error(function (err) {
                        dialogService.toast("ERROR:" + err.Message);
                        if (err.Message) {
                            dialogService.messageBox("ERROR", err.Message);
                        } else {
                            //conflictReservationProcess(err);
                            data.room.BookingStatus = "CHECKIN";
                            SharedFeaturesFactory.processConflictReservation(err, data.room, "CHECKOUT");
                        }
                    });
                }));
            }

            function conflictReservationProcess(err) {
                console.log("ERROR", err);
                if (err.ReservationRoomId) {
                    $mdDialog.show({
                        controller: ['$scope', '$mdDialog', 'conflictReservation', 'loginFactory', 'dialogService', ShowReservationConflictController],
                        resolve: {
                            conflictReservation: function () {
                                return err;
                            },
                        },
                        templateUrl: 'views/templates/conflictReservationDialog.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: null,
                        clickOutsideToClose: false, //fullscreen: useFullScreen
                    })
                        .then(function (answer) { }, function () { });

                    function ShowReservationConflictController($scope, $mdDialog, conflictReservation, loginFactory, dialogService) {
                        $scope.conflictReservationDialog = {};

                        function Init() {
                            console.log("CONFLICT RESERVATION", conflictReservation);
                            $scope.conflictReservationDialog = conflictReservation;
                            if ($scope.conflictReservationDialog.ArrivalDate) {
                                $scope.conflictReservationDialog.ArrivalDate = new Date($scope.conflictReservationDialog.ArrivalDate);
                            }
                            if ($scope.conflictReservationDialog.DepartureDate) {
                                $scope.conflictReservationDialog.DepartureDate = new Date($scope.conflictReservationDialog.DepartureDate);
                            }
                            console.log("data", $scope.conflictReservationDialog);
                        }
                        Init();
                        $scope.hide = function () {
                            $mdDialog.hide();
                        };
                        $scope.cancelDialog = function () {
                            $mdDialog.cancel();
                        };
                    };
                }
            }

            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel(false);
            };
            $scope.addExtraService = function () {
                var keys = ["RES_NO", "ROOM", "NOTIFICATION_POST_EXTRASERVICE", "EXTRA_SERVICE"];
                var languageKeys1 = {};
                for (var idx in keys) {
                    languageKeys1[keys[idx]] = $filter("translate")(keys[idx]);
                }
                $scope.listItem = {
                    ReservationRoomId: $scope.currentItem.reservationRoom.ReservationRoomId,
                    description: "",
                    name: "",
                    items: [],
                    languageKeys: languageKeys1
                };

                if ($scope.ExtraServiceDescription != null || $scope.ExtraServiceAmount != undefined) {
                    var isError = false;
                    if ($scope.ExtraServiceDescription == undefined || $scope.ExtraServiceDescription.length == 0 || $scope.ExtraServiceDescription.length > 51) {
                        $scope.warningMissingExtraServiceDescription = true;
                        $scope.warningMissingExtraServiceAmount = false;
                        $scope.warningMissingExtraServiceQuantity = false;
                        isError = true;
                    };
                    if ($scope.ExtraServiceAmount == undefined) {
                        $scope.warningMissingExtraServiceDescription = false;
                        $scope.warningMissingExtraServiceAmount = true;
                        $scope.warningMissingExtraServiceQuantity = false;
                        isError = true;
                    };
                    if ($scope.ExtraServiceQuantity == undefined || $scope.ExtraServiceQuantity <= 0) {
                        $scope.warningMissingExtraServiceDescription = false;
                        $scope.warningMissingExtraServiceAmount = false;
                        $scope.warningMissingExtraServiceQuantity = true;
                        isError = true;
                    };
                    if (isError == true) {
                        $scope.isSelectedTab = true;
                        return;
                    }
                    $scope.listItem.items.push({
                        quantity: $scope.ExtraServiceQuantity,
                        item: {
                            Amount: $scope.ExtraServiceAmount,
                            Quantity: $scope.ExtraServiceQuantity,
                            ReservationRoomId: $scope.currentItem.reservationRoom.ReservationRoomId,
                            RoomExtraServiceDescription: $scope.ExtraServiceDescription,
                            RoomExtraServiceName: "EXTRA_SERVICES",
                            languageKeys: languageKeys1,
                        },
                        ExtraServiceTypeName: "EXTRA_SERVICES"
                    });
                }
                angular.forEach($scope.extraservice.ExtraServiceItems, function (arr) {
                    if (arr.quantity > 0) {
                        $scope.listItem.items.push({
                            quantity: arr.quantity,
                            item: arr,
                            ExtraServiceTypeName: arr.ExtraServiceTypeName
                        });
                    }
                });
                if ($scope.listItem.items.length > 0) {
                    $mdDialog.hide();
                    $mdDialog.show({
                        templateUrl: 'views/templates/quickExtraServiceConfirm.tmpl.html',
                        locals: {
                            local: [$scope.listItem]
                        },
                        controller: ['$scope', '$mdDialog', '$rootScope', 'loginFactory', 'local', AddESDialogController],
                        parent: angular.element(document.body), //targetEvent: ev,
                    })
                        .then(function () {

                        }, function (isReload) {
                            var local = [$scope.currentItem];
                            if (isReload != undefined && !isReload) {
                                local = [$scope.currentItem, $scope.listItem];
                            }
                            $scope.checkOutDialog = $mdDialog;
                            $scope.checkOutDialog.show({
                                templateUrl: 'views/templates/liveCheckOut.tmpl.html',
                                clickOutsideToClose: false,
                                locals: {
                                    local: $scope.localCopy
                                },
                                resolve: {
                                    currentHotelConnectivities: function () {
                                        return currentHotelConnectivities;
                                    }
                                },
                                controller: ['$scope', '$mdDialog', '$filter', '$rootScope', 'loginFactory', 'dialogService', '$state', 'local', 'currentHotelConnectivities', 'smartCardFactory', 'SharedFeaturesFactory', LiveCheckOutController]
                            }).then(function (data) { }, function (data) {

                            });
                        });
                }


            }
            $scope.changeTab = function (action) {
                $scope.isSelectedTab = false;
                $scope.type = action;
            }



            $scope.ShowInvoice = function (ev) {
                $mdDialog.hide();
                var keys = ["ROOM_MONTHLY", "ROOM_WEEKLY", "ROOM_FULL_DAY", "ROOM_DAY_NIGHT", "ROOM_HOURLY", "MINIBAR", "LAUNDRY", "EXTRA_ROOM_CHARGE", "COMPENSATION", "EXTRA_SERVICES", "FULL_DAY_EARLY_CHECKIN", "FULL_DAY_LATE_CHECKOUT", "DAY_NIGHT_EARLY_CHECKIN", "DAY_NIGHT_LATE_CHECKOUT", "EXTRA_ADULTS", "EXTRA_CHILDREN", "PAYMENT", "DISCOUNT_MONEY_OFF", "DISCOUNT_PERCENT_OFF", "FREE"];
                var languageKeys = {};
                for (var idx in keys) {
                    languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
                }
                var CreateRoomInvoice = {
                    roomId: $scope.room.RoomId,
                    reservationRoomId: $scope.currentItem.reservationRoom.ReservationRoomId,
                    arrivalDate: $scope.room.ArrivalDate,
                    departureDate: new Date(),
                    adults: $scope.room.Adults,
                    children: $scope.room.Child,
                    languageKeys: languageKeys,
                    FOC: $scope.room.Foc,
                    DiscountPercentage: $scope.room.DiscountPercentage,
                    DiscountFlat: $scope.room.DiscountFlat,
                    RoomPriceId: $scope.room.RoomPriceId,
                    Price: $scope.room.Price
                }

                var modelRoomInvoiceFullDay = {
                    roomId: $scope.room.RoomId,
                    reservationRoomId: $scope.currentItem.reservationRoom.ReservationRoomId,
                    arrivalDate: $scope.room.ArrivalDate,
                    departureDate: $scope.room.DepartureDate,
                    adults: $scope.room.Adults,
                    children: $scope.room.Child,
                    languageKeys: languageKeys,
                    FOC: $scope.room.Foc,
                    DiscountPercentage: $scope.room.DiscountPercentage,
                    DiscountFlat: $scope.room.DiscountFlat,
                    RoomPriceId: $scope.room.RoomPriceId,
                    Price: $scope.room.Price
                }
                if ($scope.applyPastCheckOut) {
                    CreateRoomInvoice.departureDate = $scope.room.DepartureDate;
                } else {

                }
                var CreateRoomInvoice = loginFactory.securedPostJSON("api/Room/CreateRoomInvoice", CreateRoomInvoice);
                $rootScope.dataLoadingPromise = CreateRoomInvoice;
                CreateRoomInvoice.success(function (data) {

                    $mdDialog.show({
                        controller: ['$scope', '$mdDialog', 'loginFactory', 'reservationRoomId', 'hotelFormRoomInvoice', 'modelRoomInvoiceFullDay', '$rootScope', InvoiceController], //controller: InvoiceController,
                        locals: {
                            reservationRoomId: $scope.currentItem.reservationRoom.ReservationRoomId,
                            hotelFormRoomInvoice: $scope.hotelFormRoomInvoice,
                            modelRoomInvoiceFullDay: modelRoomInvoiceFullDay
                        },
                        templateUrl: 'views/templates/invoice.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose: false
                    })
                        .then(function () {

                        }, function () {
                            $scope.checkOutDialog = $mdDialog;
                            $scope.checkOutDialog.show({
                                templateUrl: 'views/templates/liveCheckOut.tmpl.html',
                                clickOutsideToClose: false,
                                locals: {
                                    //local: [$scope.currentItem]
                                    local: $scope.localCopy

                                },
                                resolve: {
                                    currentHotelConnectivities: function () {
                                        return currentHotelConnectivities;
                                    }
                                },
                                controller: ['$scope', '$mdDialog', '$filter', '$rootScope', 'loginFactory', 'dialogService', '$state', 'local', 'currentHotelConnectivities', 'smartCardFactory', 'SharedFeaturesFactory', LiveCheckOutController]
                            }).then(function (data) {
                                /*if (data != undefined && data == true) {
                                    //loinq
                                    console.log('reload page');
                                    $state.go($state.current, {}, {
                                        reload: true
                                    });
                                }*/
                            }, function (data) {

                            });
                        });
                }).error(function (err) {
                    dialogService.toast("ERROR" + err.Message);
                });
            }

            function InvoiceController($scope, $mdDialog, loginFactory, reservationRoomId, hotelFormRoomInvoice, modelRoomInvoiceFullDay, $rootScope) {
                $scope.hideFullDay = false;
                $scope.isFullDay = true;
                var modelRoomInvoiceFullDayTemp = angular.copy(modelRoomInvoiceFullDay);
                globalInvoiceId = reservationRoomId;

                HotelFormRoomInvoice = hotelFormRoomInvoice;
                _reservationId = 0;

                $scope.showInvoiceFullDay = function (isFullDay) {
                    if (isFullDay == false) {
                        var CreateRoomInvoice = loginFactory.securedPostJSON("api/Room/CreateRoomInvoice", modelRoomInvoiceFullDay);
                        $rootScope.dataLoadingPromise = CreateRoomInvoice;
                        CreateRoomInvoice.success(function (data) {
                            showReport();
                        });
                    } else {
                        modelRoomInvoiceFullDayTemp.departureDate = new Date();
                        var CreateRoomInvoice = loginFactory.securedPostJSON("api/Room/CreateRoomInvoice", modelRoomInvoiceFullDayTemp);
                        $rootScope.dataLoadingPromise = CreateRoomInvoice;
                        CreateRoomInvoice.success(function (data) {
                            showReport();
                        });
                    }
                };
                //
                $scope.showScreen = true;
                $scope.showExtendedScreen = function () {
                    $scope.showScreen = false;
                    var tab = $rootScope.ExtendedScreen;
                    if (tab != null && tab.Document != null) {
                        tab.focus();
                        loginFactory.securedGet("api/Test/Message", "id=" + reservationRoomId + "&cmd=showInvoice" + "&hotelInvoice=" + hotelFormRoomInvoice);
                    } else {
                        tab = window.open("#/extendedScreen", '_blank');
                        $rootScope.ExtendedScreen = tab;
                        setTimeout(function () {
                            loginFactory.securedGet("api/Test/Message", "id=" + reservationRoomId + "&cmd=showInvoice" + "&hotelInvoice=" + hotelFormRoomInvoice);
                        }, 7000)
                    }
                };
                $scope.hideExtendedScreen = function () {
                    $scope.showScreen = true;
                    loginFactory.securedGet("api/Test/Message", "id=" + reservationRoomId + "&cmd=hideInvoice" + "&hotelInvoice=" + hotelFormRoomInvoice);
                };



                $scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
            }

            function AddESDialogController($scope, $mdDialog, $rootScope, loginFactory, local) {
                console.log(local[0]);
                $scope.items = local[0];
                $scope.hide = function () {
                    $mdDialog.hide(false);
                };
                $scope.cancel = function () {
                    $mdDialog.cancel(false);
                }
                $scope.getTotal = function (items) {
                    var total = 0;
                    angular.forEach(items.items, function (arr) {
                        if (arr.ExtraServiceTypeName != 'EXTRA_SERVICES') {
                            total += arr.item.Price * arr.item.quantity;
                        } else {
                            total += arr.item.Amount * arr.quantity;
                        }
                    });
                    return total;
                };
                $scope.addExtraService = function () {
                    if ($scope.items.items.length == 1) {
                        if ($scope.items.items[0].item.RoomExtraServiceName == "EXTRA_SERVICES") {
                            var saveItemsNoItem = loginFactory.securedPostJSON("api/Room/CreateExtraServiceNoItem", $scope.items.items[0].item);
                            $rootScope.dataLoadingPromise = saveItemsNoItem;
                            saveItemsNoItem.success(function (data) {
                                $mdDialog.cancel(true);
                                dialogService.toast("ADD_EXTRA_SERVICE_SUCCESSFUL");
                            }).error(function (e) {
                                dialogService.toast("ERROR" + e.Message);
                            });
                        } else {
                            var saveItems = loginFactory.securedPostJSON("api/Room/QuickCreateExtraService", $scope.items);
                            $rootScope.dataLoadingPromise = saveItems;
                            saveItems.success(function (data) {
                                $mdDialog.cancel(true);
                                dialogService.toast("ADD_EXTRA_SERVICE_SUCCESSFUL");
                            }).error(function (e) {
                                dialogService.toast("ERROR" + e.Message);
                            });
                        }
                    } else {
                        var saveItems = loginFactory.securedPostJSON("api/Room/QuickCreateExtraService", $scope.items);
                        $rootScope.dataLoadingPromise = saveItems;
                        saveItems.success(function (data) {
                            angular.forEach($scope.items.items, function (arr) {
                                if (arr.item.RoomExtraServiceName == "EXTRA_SERVICES") {
                                    var saveItemsNoItem = loginFactory.securedPostJSON("api/Room/CreateExtraServiceNoItem", arr.item);
                                    $rootScope.dataLoadingPromise = saveItemsNoItem;
                                    saveItemsNoItem.success(function (data) { }).error(function (e) {
                                        dialogService.toast("ERROR" + e.Message);
                                    });
                                }
                            });
                            $mdDialog.cancel(true);
                            dialogService.toast("ADD_EXTRA_SERVICE_SUCCESSFUL");
                        }).error(function (e) {
                            dialogService.toast("ERROR" + e.Message);
                        });
                    }
                }
            }
            $scope.autoScrollTop = function () {
                //jQuery("#right_column").scrollTop(0);
            }

        }

        function conflictReservationProcess(err) {
            console.log("ERROR", err);
            if (err.ReservationRoomId) {
                $mdDialog.show({
                    controller: ['$scope', '$mdDialog', 'conflictReservation', 'loginFactory', 'dialogService', ShowReservationConflictController],
                    resolve: {
                        conflictReservation: function () {
                            return err;
                        },
                    },
                    templateUrl: 'views/templates/conflictReservationDialog.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: null,
                    clickOutsideToClose: false, //fullscreen: useFullScreen
                })
                    .then(function (answer) { }, function () { });

                function ShowReservationConflictController($scope, $mdDialog, conflictReservation, loginFactory, dialogService) {
                    $scope.conflictReservationDialog = {};

                    function Init() {
                        console.log("CONFLICT RESERVATION", conflictReservation);
                        $scope.conflictReservationDialog = conflictReservation;
                        if ($scope.conflictReservationDialog.ArrivalDate) {
                            $scope.conflictReservationDialog.ArrivalDate = new Date($scope.conflictReservationDialog.ArrivalDate);
                        }
                        if ($scope.conflictReservationDialog.DepartureDate) {
                            $scope.conflictReservationDialog.DepartureDate = new Date($scope.conflictReservationDialog.DepartureDate);
                        }
                        console.log("data", $scope.conflictReservationDialog);
                    }
                    Init();
                    $scope.hide = function () {
                        $mdDialog.hide();
                    };
                    $scope.cancelDialog = function () {
                        $mdDialog.cancel();
                    };
                };
            }
        }

        $scope.Init = function () {
            // $scope.items = [];
            $scope.filters = {
                keySearch: "",
                searchType: "GUESTNAME"
            }

            $scope.search = {
                SearchType: $scope.params.tabSelect,
                SearchDate: new Date(),
                // SkipRecord: 0
            }

            roomListFactory.getRoomListDashboard($scope.search, function (data) {
                console.log('data: GetListGuestByType', data);
                rooms = data;
                console.log("rooms", rooms);
                rooms = getNameForFilter(rooms);
                $scope.hotelFormRoomInvoice = data.hotelFormRoomInvoice[0].FormType + data.hotelFormRoomInvoice[0].Value + '.trdx';
                $scope.hotelForms = data.HotelForms;
                $scope.floorList = data.floorList;
                $scope.ExtraService = data.ExtraService;
                $scope.roomTypes = data.roomTypes;
                $scope.items = rooms;
                $scope.homeData = rooms;
                console.log("items", $scope.items);
                console.log("GetListGuestByType", $scope.items);
                for (var index in $scope.items) {
                    if ($scope.items[index].RoomRepairList && $scope.items[index].RoomRepairList.length > 0) {
                        for (var index2 in $scope.items[index].RoomRepairList) {
                            var repairtTemp = $scope.items[index].RoomRepairList[index2];
                            if (repairtTemp.IsDeleted !== true && repairtTemp.RepairStartDate <= new Date() && new Date() <= repairtTemp.RepairEndDate) {
                                $scope.items[index].HouseStatus = "REPAIR";
                                $scope.items[index].RepairStartDate = repairtTemp.RepairStartDate;
                                $scope.items[index].RepairEndDate = repairtTemp.RepairEndDate;
                                break;
                            }
                        }
                    }
                }
                $scope.data = $scope.items.slice(0, 20);
                $scope.remarkEvents = $scope.items.remarkEvents;
                $scope.rateList = rooms.planList;
                $scope.dateTimeNow = new Date();
                $scope.page.totalRecord = $scope.items.length;
                if (($scope.page.currentPage + 1) * $scope.page.pageSize > $scope.page.totalRecord && $scope.page.currentPage > 0) {
                    $scope.page.currentPage -= 1;
                }
                if ($scope.HideSearch) {
                    $scope.reloadListRoom($scope.filters.keySearch, $scope.filters.searchType);
                }
            });

            // console.log('params when checkout', $scope.params);
            getInfoDashboard($scope.params.varChangeDate);
            var getTodolistList = loginFactory.securedGet("api/Dashboard/GetToDoListList", "");
            $rootScope.dataLoadingPromise = getTodolistList;
            getTodolistList.success(function (data2) {
                $scope.ToDoListList = data2;
            }).error(function (err) {
                console.log(err);
            });
            $scope.actionSearch();
        };

        function getInfoDashboard(date) {
            var getInfoDashboard = loginFactory.securedGet("api/Room/DashboardForApp", "from=" + date);
            $rootScope.dataLoadingPromise = getInfoDashboard;
            getInfoDashboard.success(function (data) {
                console.log('getInfoDashboard', data);
                var stat = data.Dashboard;
                $scope.varStat = {
                    roomArrival: stat.todayStats_roomArrival,
                    roomDueOut: stat.todayStats_roomDueOut,
                    projectedRoomOccupied: stat.todayStats_Projected_roomOccupied,
                    projectedOccupancy: stat.todayStats_Projected_Occupancy,
                    data: data
                };
            }).error(function (err) {

            });
        }


        $scope.ShowToDoList = function (ev, data, st) {
            // var refreshData = $scope.Init();
            var getTodolist = [];


            if (st == null) {
                getTodolist = data;
            } else {
                getTodolist.listtodoProcessing = _.filter(data.listtodoProcessing, function (item) {
                    return st.reservationRoom != undefined ? item.ReservationRoomId == st.reservationRoom.ReservationRoomId : item.ReservationRoomId == st.ReservationRoomId;
                });
                getTodolist.listtodoDoneOrDel = _.filter(data.listtodoDoneOrDel, function (item) {
                    return st.reservationRoom != undefined ? item.ReservationRoomId == st.reservationRoom.ReservationRoomId : item.ReservationRoomId == st.ReservationRoomId;
                });
            }

            $mdDialog.show({
                controller: ['$scope', '$mdDialog', 'loginFactory', 'getTodolist', 'reservationRoomId', '$localStorage', ShowToDoListController],
                locals: {
                    getTodolist: getTodolist,
                    // refreshData: refreshData,
                    reservationRoomId: st != null ? (st.reservationRoom != undefined ? st.reservationRoom.ReservationRoomId : st.ReservationRoomId) : null,
                },
                templateUrl: 'views/templates/toDoList.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false
            })
                .then(function (answer) {
                    $scope.Init();
                }, function (answer) {
                    if (answer == true) {
                        $scope.Init();
                    }
                });
        };

        function ShowToDoListController($scope, $mdDialog, loginFactory, getTodolist, reservationRoomId, $localStorage) {
            var getTodolistProcessing = angular.copy(getTodolist.listtodoProcessing);
            var getTodolistDoneOrDel = angular.copy(getTodolist.listtodoDoneOrDel);
            var getTodolist = [];
            angular.forEach(getTodolistProcessing, function (item) {
                getTodolist.push(item);
            });
            angular.forEach(getTodolistDoneOrDel, function (item) {
                getTodolist.push(item);
            });
            // var refreshData = angular.copy(refreshData);
            var ReservationRoomId = angular.copy(reservationRoomId);

            $scope.selectedRoom = null;
            $scope.queryRoomSearch = queryRoomSearch;
            $scope.selectedRoomChange = selectedRoomChange;
            $scope.searchRoomTextChange = searchRoomTextChange;
            $scope.mdItemText = mdItemText;

            function mdItemText(item) {
                return item.RoomName == null ? $filter("translate")("RES_NO_SHORT") + item.ReservationNumber + " " + item.Fullname : item.RoomName + " - " + $filter("translate")("RES_NO_SHORT") + item.ReservationNumber + " " + item.Fullname;
            }

            function queryRoomSearch(query) {
                var results = query ? $scope.roomList.listRoomTodolist.filter(createRoomFilterFor(query)) : $scope.roomList.listRoomTodolist,
                    deferred;
                if (self.simulateQuery) {
                    deferred = $q.defer();
                    $timeout(function () {
                        deferred.resolve(results);
                    }, Math.random() * 1000, false);
                    return deferred.promise;
                } else {
                    return results;
                }
            }

            function searchRoomTextChange(text) {
                $scope.searchRoomText = text;
            }


            function createRoomFilterFor(query) {
                var lowercaseQuery = change_alias(query);
                return function filterFn(item) {
                    item.RoomName = item.RoomName == null ? "" : item.RoomName;
                    return (change_alias(item.Fullname.toLowerCase()).indexOf(lowercaseQuery) >= 0 || change_alias(item.RoomName.toLowerCase()).indexOf(lowercaseQuery) >= 0 || change_alias(item.ReservationNumber.toString().toLowerCase()).indexOf(lowercaseQuery) >= 0);
                };
            }

            function selectedRoomChange(item) {
                console.log("ITEM", item);
                if (item != undefined) {
                    $scope.selectedRoom = item;
                    $scope.toDoList.roomInfo = item;
                } else {
                    $scope.selectedRoom = null;
                    $scope.toDoList.roomInfo = null;
                }

            }

            function change_alias(alias) {
                var str = alias;
                str = str.toLowerCase();
                str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ  |ặ|ẳ|ẵ/g, "a");
                str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
                str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
                str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ  |ợ|ở|ỡ/g, "o");
                str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
                str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
                str = str.replace(/đ/g, "d");
                str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'| |\"|\&|\#|\[|\]|~|$|_/g, "");
                str = str.replace(/-+-/g, "");
                str = str.replace(/^\-+|\-+$/g, "");
                return str;
            }

            function Init() {
                $scope.toDoList = {
                    isAddTodolist: false,
                    dateTodolist: new Date(),
                    note: "",
                    roomInfo: {},
                    roomList: [],
                    IsNewTodolist: 1,
                    ToDoListId: null
                }
                $scope.DisableMdAutocomplete = false;
                $scope.today = new Date();
                $scope.IsChooseDate = false;
                $scope.IsSaveDB = true;
                $scope.listtodo = [];
                var getRoomTodolist = loginFactory.securedGet("api/Dashboard/GetListRoomToDoList", "");
                $rootScope.dataLoadingPromise = getRoomTodolist;
                getRoomTodolist.success(function (data) {
                    $scope.roomList = data;
                    angular.forEach(getTodolist, function (item) {
                        angular.forEach(item.ListToDoListByRR, function (item1) {
                            var temp = {
                                ToDoListId: item1.ToDoListId,
                                Note: item1.Note,
                                ReservationRoomId: item1.ReservationRoomId,
                                RoomName: _.find($scope.roomList.listRoomTodolist, function (item2) { return item2.ReservationRoomId == item1.ReservationRoomId }).RoomName,
                                GuestName: _.find($scope.roomList.listRoomTodolist, function (item2) { return item2.ReservationRoomId == item1.ReservationRoomId }).Fullname,
                                Status: item1.Status,
                                EndDate: new Date(item1.EndDate),
                                UserCreateId: item1.UserCreateId,
                                UserUpdateId: item1.UserUpdateId,
                                UserName: $scope.roomList.inforTodolist.FullName,
                                IsNewTodolist: 2, // đã tồn tại,
                                IsDoNow: item1.IsDoNow,
                            }
                            $scope.listtodo.push(temp);
                            console.log("listtodo", $scope.listtodo);
                        });
                    });
                }).error(function (err) {
                    console.log(err);
                });

                $scope.DatePickerOption = {
                    format: 'MM/dd/yyyy HH:mm'
                };

            }

            $scope.saveTodolist = function (item) {
                if (item.IsNewTodolist == 1) {
                    if ($scope.IsSaveDB == false) {
                        var itemUpdate = _.find($scope.listtodo, function (it) {
                            return it.ToDoListId == item.ToDoListId;
                        });
                        itemUpdate.EndDate = new Date(item.dateTodolist);
                        itemUpdate.Note = item.note;
                        itemUpdate.Status = 1; // 
                        itemUpdate.IsNewTodolist = 1; // update
                        itemUpdate.ReservationRoomId = item.roomInfo.ReservationRoomId;
                        //itemUpdate.UserUpdateId = $scope.roomList.inforTodolist.UserCreateId;
                    } else {
                        var todoItem = {
                            ToDoListId: parseInt(new Date().format("yyyyddmmHHMMss")),
                            Note: item.note,
                            ReservationRoomId: item.roomInfo.ReservationRoomId,
                            RoomName: item.roomInfo.RoomName,
                            GuestName: item.roomInfo.Fullname,
                            Status: 1,
                            EndDate: new Date(item.dateTodolist),
                            UserCreateId: $scope.roomList.inforTodolist.UserCreateId,
                            UserUpdateId: '',
                            UserName: $scope.roomList.inforTodolist.FullName,
                            IsNewTodolist: item.IsNewTodolist, // tạo mới,
                            IsDoNow: false,
                        }
                        $scope.listtodo.push(todoItem);
                    }

                } else {
                    if (item.IsNewTodolist == 3) {
                        var itemUpdate = _.find($scope.listtodo, function (it) {
                            return it.ToDoListId == item.ToDoListId;
                        });
                        itemUpdate.EndDate = new Date(item.dateTodolist);
                        itemUpdate.Note = item.note;
                        itemUpdate.Status = 1; // 
                        itemUpdate.IsNewTodolist = 3; // update
                        itemUpdate.ReservationRoomId = item.roomInfo.ReservationRoomId;
                        itemUpdate.UserUpdateId = $scope.roomList.inforTodolist.UserCreateId;
                    }
                }
                $scope.toDoList.isAddTodolist = false;
                $scope.toDoList.note = "";
            }

            $scope.changeStatusTodolist = function () {
                $scope.DisableMdAutocomplete = ReservationRoomId != null ? true : false;
                $scope.toDoList.isAddTodolist = !$scope.toDoList.isAddTodolist;
                $scope.toDoList.roomInfo = ReservationRoomId != null ? _.find($scope.roomList.listRoomTodolist, function (item) { return item.ReservationRoomId == ReservationRoomId; }) : $scope.roomList.listRoomTodolist[0];
                $scope.selectedRoom = $scope.toDoList.roomInfo;
                $scope.toDoList.IsNewTodolist = 1;
            }

            $scope.updateDoneTodolist = function (item) {
                var itemUpdate = _.find($scope.listtodo, function (it) {
                    return it.ToDoListId == item.ToDoListId;
                });
                itemUpdate.Status = 2; // done
                itemUpdate.IsNewTodolist = item.IsNewTodolist == 2 ? 3 : item.IsNewTodolist; // update
                itemUpdate.UserUpdateId = $scope.roomList.inforTodolist.UserCreateId;
            }

            $scope.deleteTodolist = function (item) {
                var itemDelete = _.find($scope.listtodo, function (it) {
                    return it.ToDoListId == item.ToDoListId;
                });
                itemDelete.Status = 3; // done
                itemDelete.IsNewTodolist = item.IsNewTodolist == 2 ? 3 : item.IsNewTodolist; // update
                itemDelete.UserUpdateId = $scope.roomList.inforTodolist.UserCreateId;
            }

            $scope.reopenDoneTodolist = function (item) {
                var itemUpdate = _.find($scope.listtodo, function (it) {
                    return it.ToDoListId == item.ToDoListId;
                });
                itemUpdate.Status = 1; // 
                itemUpdate.IsNewTodolist = item.IsNewTodolist == 2 ? 3 : item.IsNewTodolist; // update
                itemUpdate.UserUpdateId = $scope.roomList.inforTodolist.UserCreateId;
            }

            $scope.editTodolist = function (item) {
                $scope.DisableMdAutocomplete = ReservationRoomId != null ? true : false;
                $scope.IsSaveDB = item.IsNewTodolist == 1 ? false : true;
                $scope.toDoList.isAddTodolist = true;
                console.log("item todolist edit", item);
                $scope.toDoList.roomInfo = _.find($scope.roomList.listRoomTodolist, function (it) { return it.ReservationRoomId == item.ReservationRoomId; }) || $scope.roomList.listRoomTodolist[0];
                $scope.selectedRoom = $scope.toDoList.roomInfo;
                $scope.toDoList.dateTodolist = new Date(item.EndDate);
                $scope.toDoList.note = item.Note;
                $scope.toDoList.IsNewTodolist = item.IsNewTodolist == 2 ? 3 : item.IsNewTodolist; // update
                $scope.toDoList.ToDoListId = item.ToDoListId;
            }

            $scope.hide = function () {
                $mdDialog.hide();
            };

            $scope.cancel = function () {

                var listTodolistInsert = _.filter($scope.listtodo, function (item) {
                    return item.IsNewTodolist != 2;
                });
                if (listTodolistInsert.length > 0) {
                    var insertTodolist = loginFactory.securedPostJSON("api/Dashboard/InsertToDoList", listTodolistInsert);
                    $rootScope.dataLoadingPromise = insertTodolist;
                    insertTodolist.success(function (data) {
                        // Init();
                        $mdDialog.cancel(true);
                        console.log("Insert todolist is ok");
                    }).error(function (err) {
                        console.log(err);
                        $mdDialog.cancel(false);
                    });
                }
                else {
                    if ($scope.IsChooseDate == true) {
                        $mdDialog.cancel(true);
                    } else {
                        $mdDialog.cancel(false);
                    }
                }
            };

            $scope.answer = function (answer) {
                $mdDialog.hide(answer);
            };

            $scope.countItems = function (items, status) {
                if (items == undefined) return 0;
                var res = items.filter(function (it) {
                    return it.Status == status
                }, status);
                return res.length;
            }

            $scope.getListTodolistDoneOrDelByDate = function () {
                var date = $scope.today.format("mm-dd-yyyy");
                var listTodolistInsert = _.filter($scope.listtodo, function (item) {
                    return item.IsNewTodolist != 2;
                });
                if (listTodolistInsert.length > 0) {
                    $scope.IsChooseDate = true;
                    var insertTodolist = loginFactory.securedPostJSON("api/Dashboard/InsertToDoList", listTodolistInsert);
                    $rootScope.dataLoadingPromise = insertTodolist;
                    insertTodolist.success(function (data) {
                        console.log("Insert todolist is ok");
                        var ListTodolistDoneOrDelByDate = loginFactory.securedGet("api/Dashboard/GetToDoListListDOneOrDelByDate", "date=" + date);
                        $rootScope.dataLoadingPromise = ListTodolistDoneOrDelByDate;
                        ListTodolistDoneOrDelByDate.success(function (data1) {
                            // getTodolistDoneOrDel = data;
                            getTodolistProcessing = angular.copy(data1.listtodoProcessing);
                            getTodolistDoneOrDel = angular.copy(data1.listtodoDoneOrDel);
                            getTodolist = [];
                            // angular.forEach(getTodolistProcessing, function (item) {
                            //     getTodolist.push(item);
                            // });
                            if (ReservationRoomId != null) {
                                angular.forEach(getTodolistProcessing, function (item) {
                                    if (item.ReservationRoomId == ReservationRoomId) {
                                        getTodolist.push(item);
                                    }
                                });
                                angular.forEach(getTodolistDoneOrDel, function (item) {
                                    if (item.ReservationRoomId == ReservationRoomId) {
                                        getTodolist.push(item);
                                    }
                                });
                            } else {
                                angular.forEach(getTodolistProcessing, function (item) {

                                    getTodolist.push(item);

                                });
                                angular.forEach(getTodolistDoneOrDel, function (item) {

                                    getTodolist.push(item);

                                });
                            }

                            $scope.listtodo = [];
                            angular.forEach(getTodolist, function (item) {
                                angular.forEach(item.ListToDoListByRR, function (item1) {
                                    var temp = {
                                        ToDoListId: item1.ToDoListId,
                                        Note: item1.Note,
                                        ReservationRoomId: item1.ReservationRoomId,
                                        RoomName: _.find($scope.roomList.listRoomTodolist, function (item2) { return item2.ReservationRoomId == item1.ReservationRoomId }).RoomName,
                                        GuestName: _.find($scope.roomList.listRoomTodolist, function (item2) { return item2.ReservationRoomId == item1.ReservationRoomId }).Fullname,
                                        Status: item1.Status,
                                        EndDate: new Date(item1.EndDate),
                                        UserCreateId: item1.UserCreateId,
                                        UserUpdateId: item1.UserUpdateId,
                                        UserName: $scope.roomList.inforTodolist.FullName,
                                        IsNewTodolist: 2, // đã tồn tại,
                                        IsDoNow: item1.IsDoNow,
                                    }
                                    $scope.listtodo.push(temp);
                                    console.log("listtodo", $scope.listtodo);
                                });
                            });
                            // $scope.countItems($scope.listtodo,1);
                            // $scope.countItems($scope.listtodo,2);
                        }).error(function (err) {
                            console.log(err);
                        });
                    }).error(function (err) {
                        console.log(err);
                    });
                }
                else {
                    var ListTodolistDoneOrDelByDate = loginFactory.securedGet("api/Dashboard/GetToDoListListDOneOrDelByDate", "date=" + date);
                    $rootScope.dataLoadingPromise = ListTodolistDoneOrDelByDate;
                    ListTodolistDoneOrDelByDate.success(function (data) {
                        // getTodolistDoneOrDel = data;
                        getTodolistProcessing = angular.copy(data.listtodoProcessing);
                        getTodolistDoneOrDel = angular.copy(data.listtodoDoneOrDel);
                        getTodolist = [];
                        // angular.forEach(getTodolistProcessing, function (item) {
                        //     getTodolist.push(item);
                        // });
                        if (ReservationRoomId != null) {
                            angular.forEach(getTodolistProcessing, function (item) {
                                if (item.ReservationRoomId == ReservationRoomId) {
                                    getTodolist.push(item);
                                }
                            });
                            angular.forEach(getTodolistDoneOrDel, function (item) {
                                if (item.ReservationRoomId == ReservationRoomId) {
                                    getTodolist.push(item);
                                }
                            });
                        } else {
                            angular.forEach(getTodolistProcessing, function (item) {

                                getTodolist.push(item);

                            });
                            angular.forEach(getTodolistDoneOrDel, function (item) {

                                getTodolist.push(item);

                            });
                        }

                        $scope.listtodo = [];
                        angular.forEach(getTodolist, function (item) {
                            angular.forEach(item.ListToDoListByRR, function (item1) {
                                var temp = {
                                    ToDoListId: item1.ToDoListId,
                                    Note: item1.Note,
                                    ReservationRoomId: item1.ReservationRoomId,
                                    RoomName: _.find($scope.roomList.listRoomTodolist, function (item2) { return item2.ReservationRoomId == item1.ReservationRoomId }).RoomName,
                                    GuestName: _.find($scope.roomList.listRoomTodolist, function (item2) { return item2.ReservationRoomId == item1.ReservationRoomId }).Fullname,
                                    Status: item1.Status,
                                    EndDate: new Date(item1.EndDate),
                                    UserCreateId: item1.UserCreateId,
                                    UserUpdateId: item1.UserUpdateId,
                                    UserName: $scope.roomList.inforTodolist.FullName,
                                    IsNewTodolist: 2, // đã tồn tại,
                                    IsDoNow: item1.IsDoNow,
                                }
                                $scope.listtodo.push(temp);
                                console.log("listtodo", $scope.listtodo);
                            });
                        });
                        // $scope.countItems($scope.listtodo,1);
                        // $scope.countItems($scope.listtodo,2);
                    }).error(function (err) {
                        console.log(err);
                    });
                }
            }

            Init();
        }


        $scope.NumberDoTodolistNow = function () {
            var getTodolist = [];
            getTodolist = $scope.ToDoListList;

            var index = 0;
            angular.forEach(getTodolist, function (item) {
                angular.forEach(item.ListToDoListByRR, function (item1) {
                    index += item1.IsDoNow == true ? 1 : 0;
                });
            });
            return index;
        }

        $scope.openRightMenu = function () {
            $mdSidenav('statistics').toggle();
        };

        $scope.openRightMenuXS = function () {
            $mdSidenav('statisticsXS').toggle();
        };

        $scope.actionSearch = function () {
            $scope.HideSearch = !$scope.HideSearch;
            $scope.filters.keySearch = "";
            $scope.isOpenFab = $scope.HideSearch == false ? true : false;
        }

        $scope.actionOperation = function () {
            if (!$scope.isOpenFab) {
                $scope.HideSearch == true
                $scope.actionSearch();
            } else {
                $scope.HideSearch = $scope.HideSearch == true ? false : false;
                $scope.filters.keySearch = "";
            }
        }

        $scope.getCountryItem = function (CountryId) {
            var result = $scope.countries.find(function (item) {
                if (item.CountryId === CountryId) {
                    return item;
                }
            }, CountryId);
            return result;
        }

        $scope.getTooltipByStatusBooking = function (StatusBooking, AssignRoom) {
            if (StatusBooking == "CHECKIN" || StatusBooking == "OVERDUE") {
                return "QUICK_CHECK_OUT";
            }
            if ((StatusBooking == "BOOKED" || StatusBooking == "NOSHOW") && AssignRoom == true) {
                return "CHECK-IN";
            }
            if ((StatusBooking == "BOOKED" || StatusBooking == "NOSHOW") && AssignRoom == false) {
                return "ASSIGN_ROOM";
            }
        }

        $scope.convertTotalEstimatedTime = function (TotalEstimatedTime) {
            var days = TotalEstimatedTime.Days < 10 ? "0" + TotalEstimatedTime.Days.toString() : TotalEstimatedTime.Days.toString();
            var hours = TotalEstimatedTime.Hours < 10 ? "0" + TotalEstimatedTime.Hours.toString() : TotalEstimatedTime.Hours.toString();
            var minutes = TotalEstimatedTime.Minutes < 10 ? "0" + TotalEstimatedTime.Minutes.toString() : TotalEstimatedTime.Minutes.toString();
            return days + " :  " + hours + " :  " + minutes;
        }

        $scope.showConfirm = function (ev, customer, reservationRoomId) {

            var keys = [
                "YOU_HAVE_NOT_HAD_THE_REPORT_FORM_PLEASE_CLICK_TO_SETUP",
                "DO_YOU_WANT_TO_DISPLAY_RATE_PER_NIGHT",
                "NOTIFICATION",
                "CLOSE",
                "YES",
                "NO",
                "MALE",
                "FEMALE"
            ];
            var languageKeys = {};
            for (var idx in keys) {
                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
            }
            var obForms = {};
            var reservationdetail = $scope.hotelForms;
            var ngonngu = $rootScope.language;
            var Len = reservationdetail.bodyRegistrationcard.length;
            // console.info(ngonngu, reservationdetail,"leo nguyen check lang")
            for (var index = 0; index < Len; index++) {
                if (reservationdetail.bodyRegistrationcard[index].LanguageCode == ngonngu) {
                    obForms = reservationdetail.bodyRegistrationcard[index];
                    index = Len;
                }
            }

            if (obForms == null || obForms.Body == null) {
                //alert('Bạn chưa có mẫu báo cáo, xin vui lòng vào cấu hình cài đặt');                
                $mdDialog.show(
                    $mdDialog.alert()
                        //.parent(angular.element(document.querySelector('#popupContainer')))
                        .clickOutsideToClose(true)
                        .title($filter("translate")("NOTIFICATION"))
                        .textContent($filter("translate")("YOU_HAVE_NOT_HAD_THE_REPORT_FORM_PLEASE_CLICK_TO_SETUP"))
                        .ariaLabel('Alert Dialog Demo')
                        .ok($filter("translate")("CLOSE"))
                    //.targetEvent(ev)
                );
            } else {
                var confirm = $mdDialog.confirm()
                    .title($filter("translate")("NOTIFICATION"))
                    .textContent($filter("translate")("DO_YOU_WANT_TO_DISPLAY_RATE_PER_NIGHT"))
                    .ariaLabel('Lucky day')
                    .targetEvent(ev)
                    .ok($filter("translate")("YES"))
                    .cancel($filter("translate")("NO"));

                $mdDialog.show(confirm).then(function () {
                    $scope.status = 'Có';

                    var getRRInfo = loginFactory.securedGet("api/Dashboard/GetReservationRoomInfo", "reservationRoomId=" + reservationRoomId);
                    getRRInfo.success(function (data) {
                        $scope.doConfirm(ev, data, customer, true, obForms);
                    }).error(function (err) {
                        console.log(err);
                    });

                }, function () {
                    $scope.status = 'Không';
                    var getRRInfo = loginFactory.securedGet("api/Dashboard/GetReservationRoomInfo", "reservationRoomId=" + reservationRoomId);
                    getRRInfo.success(function (data) {
                        $scope.doConfirm(ev, data, customer, false, obForms);
                    }).error(function (err) {
                        console.log(err);
                    });

                });
            }
        }
        $scope.doConfirm = function (ev, rrInfo, customer, status, obForms) {

            var reservationRoomInfo = angular.copy(rrInfo);

            var companyname = reservationRoomInfo.company != null ? reservationRoomInfo.company.CompanyName : "";

            var strCompanyname = '<p style="width:310px;white-space: normal; text-align: center;margin: -15px 0 -15px 0;">' + companyname + '</p>';

            var countryname = $scope.getCountryItem(customer.CountryId);

            var _totalPrice = 0;
            if (reservationRoomInfo.roomCharges.length > 0) {
                angular.forEach(reservationRoomInfo.roomCharges, function (item) {
                    _totalPrice += item.Amount;
                });
            }
            var _totalNight = 0;
            if (reservationRoomInfo.roomCharges != undefined || $scope.roomCharges != null) {
                _totalNight = reservationRoomInfo.roomCharges.length;
            }

            var totalDeposit = 0;

            if (reservationRoomInfo.paymentList != undefined || reservationRoomInfo.paymentList != null) {
                angular.forEach(reservationRoomInfo.paymentList, function (item) {
                    totalDeposit += item.PaymentTypeName == 'DEPOSIT' || item.PaymentTypeName == 'DELETED' ? item.Amount : 0;
                });
            }
            // if (reservationRoomInfo.paymentList != undefined) {
            //     angular.forEach(reservationRoomInfo.paymentList, function (item) {
            //         totalDeposit += item.PaymentTypeName == 'DELETED' ? item.Amount : 0;
            //     });
            // }


            var customerDetail = {
                c_dob: customer.Birthday != null ? (new Date(customer.Birthday)).format("dd/mm/yyyy") : "",
                c_sex: customer.Gender != null ? (customer.Gender == 0 ? $filter("translate")('MALE') : (customer.Gender == 1 ? $filter("translate")('FEMALE') : $filter("translate")('OTHER'))) : "",
                c_name: customer.Fullname != null ? customer.Fullname : "",
                c_phone: customer.Mobile != null ? customer.Mobile : "",
                c_address: customer.Address != null ? customer.Address : "",
                c_email: customer.Email != null ? customer.Email : "",
                c_identitynumber: customer.IdentityNumber != null ? customer.IdentityNumber : "",
                c_country: countryname != null && countryname.CountryName != null ? countryname.CountryName : ""
            }

            var ArrivalDate = new Date(reservationRoomInfo.reservationRoom.ArrivalDate);
            var DepartureDate = new Date(reservationRoomInfo.reservationRoom.DepartureDate);

            var roomDetail = {
                arrival: reservationRoomInfo.reservationRoom.ArrivalDate != null ? ArrivalDate.format('dd/mm/yyyy, HH:MM') : "",
                departure: reservationRoomInfo.reservationRoom.DepartureDate != null ? DepartureDate.format('dd/mm/yyyy, HH:MM') : "",
                number_adults: reservationRoomInfo.reservationRoom.Adults != null ? reservationRoomInfo.reservationRoom.Adults : "",
                number_children: reservationRoomInfo.reservationRoom.Child != null ? reservationRoomInfo.reservationRoom.Child : "",
                source: reservationRoomInfo.reservationRoom.source != null ? (reservationRoomInfo.reservationRoom.source.SourceName != null ? reservationRoomInfo.reservationRoom.source.SourceName : "") : "",
                room_name: reservationRoomInfo.Rooms != null ? reservationRoomInfo.Rooms.RoomName : "",
                room_type: reservationRoomInfo.RoomTypes != null ? reservationRoomInfo.RoomTypes.RoomTypeName : "",
                company_name: companyname,
                company_address: reservationRoomInfo.company != null ? (reservationRoomInfo.company.ContactAddress != null ? reservationRoomInfo.company.ContactAddress : "") : "",
                booking_no_of_channel: reservationRoomInfo.reservationRoom.Reservations.CMBookingId != null ? reservationRoomInfo.reservationRoom.Reservations.CMBookingId : "",
                price_room_per_night: reservationRoomInfo.roomCharges.length > 0 && status == 1 ? (reservationRoomInfo.roomCharges[0].Amount != null ? $filter('currency')(reservationRoomInfo.roomCharges[0].Amount) : strCompanyname) : strCompanyname,
                note: reservationRoomInfo.Note != null ? reservationRoomInfo.Note : "",
                booking_number: reservationRoomInfo.reservationRoom.Reservations.reservationNumber != null ? reservationRoomInfo.reservationRoom.Reservations.reservationNumber : "",
                total_price: $filter('currency')(_totalPrice),
                total_night: _totalNight,
                deposit: $filter('currency')(totalDeposit),
                passCodeLock: reservationRoomInfo.PassCodeLock != null ? reservationRoomInfo.PassCodeLock : "N/A"
            }

            var hotelFormRoomInvoice = obForms.Body;
            // console.info(hotelFormRoomInvoice,"leo nguyen check lang3")
            var BodyRegistration = {
                Body: hotelFormRoomInvoice.replace(/\[Full_name]/g, customerDetail.c_name)
                    .replace(/\[Customer_phone]/g, customerDetail.c_phone)
                    .replace(/\[Customer_address]/g, customerDetail.c_address)
                    .replace(/\[Customer_email]/g, customerDetail.c_email)
                    .replace(/\[Customer_identity_number]/g, customerDetail.c_identitynumber)
                    .replace(/\[Customer_country]/g, customerDetail.c_country)
                    .replace(/\[Customer_sex]/g, customerDetail.c_sex)
                    .replace(/\[Customer_birthday]/g, customerDetail.c_dob)
                    .replace(/\[Arrival]/g, roomDetail.arrival)
                    .replace(/\[Departure]/g, roomDetail.departure)
                    .replace(/\[Source]/g, roomDetail.source)
                    .replace(/\[Number_Adults]/g, roomDetail.number_adults)
                    .replace(/\[Number_Children]/g, roomDetail.number_children)
                    .replace(/\[Price_room_per_night]/g, roomDetail.price_room_per_night)
                    .replace(/\[Room_name]/g, roomDetail.room_name)
                    .replace(/\[Room_type]/g, roomDetail.room_type)
                    .replace(/\[Company_name]/g, roomDetail.company_name)
                    .replace(/\[Company_address]/g, roomDetail.company_address)
                    .replace(/\[Booking_no_of_channel]/g, roomDetail.booking_no_of_channel)
                    .replace(/\[Booking_number]/g, roomDetail.booking_number)
                    .replace(/\[Note]/g, roomDetail.note)
                    .replace(/\[Total_price]/g, roomDetail.total_price)
                    .replace(/\[Total_night]/g, roomDetail.total_night)
                    .replace(/\[Deposit]/g, roomDetail.deposit)
                    .replace(/\[PassCode_Lock]/g, roomDetail.passCodeLock),
                LanguageCode: obForms.LanguageCode
            }

            $mdDialog.show({
                controller: ['$sce', '$scope', '$mdDialog', 'loginFactory', 'BodyRegistration', '$rootScope', InvoiceConfirmController],
                locals: {

                    BodyRegistration: BodyRegistration,
                },
                templateUrl: 'views/reservation/subtemplates/registration_card.html',
                parent: angular.element(document.body),
                // targetEvent: ev,
                clickOutsideToClose: false
            })
                .then(function (answer) { }, function () {

                });
        };

        function InvoiceConfirmController($sce, $scope, $mdDialog, loginFactory, BodyRegistration, $rootScope) {

            // console.info(BodyRegistration, "leo nguyen check lang5")
            $scope.ConditionPolicyOption = {
                language: ($rootScope.language == "vn") ? "vi" : $rootScope.language,
                toolbar: [{
                    name: 'document',
                    items: ['Print']
                }],
                toolbarCanCollapse: false,
                allowedContent: true,
                entities: true,
                disabled: true,
                contentEditable: false,
                disableAutoInline: true,
                height: 642,
                width: 723,
                autoParagraph: false,
                autoGrow_onStartup: true,
                FullPage: false,
                resize_enabled: false,
                removePlugins: 'elementspath',
                setReadOnly: false

            };

            $scope.readyCkeditor = function () {
                setTimeout(function () {
                    jQuery(".cke_button__print").click();
                    jQuery("#cancel_btn").click();
                }, 1000);
            }


            $scope.BodyRegistration = BodyRegistration;



            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
            $scope.trustAsHtml = function (string) {
                return $sce.trustAsHtml(string);
            };

        }
        // $scope.Init();
        $scope.openEditTraveller = function (item) {
            var allRooms = [];
            var reservationId = item.Reservations.ReservationId;
            var id = item.reservationRoom.ReservationRoomId;

            angular.forEach($scope.homeData, function (value, key) {
                if (value.Reservations.ReservationId != null && value.Reservations.ReservationId != undefined && value.Reservations.ReservationId == reservationId) {
                    if (!value.Rooms) {
                        value.Rooms = {};
                        if (value.RoomName == null || value.RoomName == undefined || value.RoomName == "") {
                            value.Rooms.RoomName = "N/A";
                        } else value.Rooms.RoomName = value.RoomName;
                    }
                    if (!value.RoomTypes) {
                        value.RoomTypes = {};
                        if (value.RoomTypeCode == null || value.RoomTypeCode == undefined || value.RoomTypeCode == "") {
                            value.RoomTypes.RoomTypeCode = "N/A";
                        } else value.RoomTypes.RoomTypeCode = value.RoomTypeCode;
                    }
                    allRooms.push(value);
                }
            });

            for(var index in allRooms){
                var shareListTemp = allRooms[index].TravellersList;
                var shareListDetailsTemp = allRooms[index].ReservationTravellersList;
                for(var index2 in shareListTemp){
                    var travellerId = shareListTemp[index2].TravellerId;
                    var travellerDetail = _.find(shareListDetailsTemp, function(value){
                        return value.TravellerId == travellerId;
                    });
                    if(travellerDetail != null && travellerDetail != undefined){
                        if(!shareListTemp[index2].IsChild){
                            shareListTemp[index2].IsChild = travellerDetail.ReservationTravellerExtraInformationList[0].IsChild;
                        }
                    }
                    var country = _.find($scope.countries, function(value){
                        return value.CountryId == shareListTemp[index2].CountryId;
                    });
                    if(country != null && country != undefined){
                        if(!shareListTemp[index2].Countries)
                            shareListTemp[index2].Countries = country;
                    }
                }
            }

            var rooms = angular.copy(allRooms);
            $mdDialog.show({
                controller: EditTravellersController,
                resolve: {
                    currentRooms: function () {
                        return rooms;
                    },
                    countries: function () {
                        return $scope.countries;
                    },
                    resId: function () {
                        return id;
                    },
                    isUsePassport: function () {
                        return $scope.isUsePassport();
                    }
                },
                templateUrl: 'views/templates/editTravellersGroup.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: null,
                clickOutsideToClose: false
            }).then(function (data) {
                var roomsBefore = angular.copy(allRooms);
                var roomsAfter = data;
                var listEditTraveller = [];
                var listShareViewModel = [];

                for (var i in roomsBefore) {
                    for (var j in roomsBefore[i].TravellersList) {
                        // if (roomsBefore[i].TravellersList[j].Birthday)
                        //     roomsBefore[i].TravellersList[j].Birthday = new Date(roomsBefore[i].TravellersList[j].Birthday);                           
                        if (!angular.equals(roomsBefore[i].TravellersList[j], roomsAfter[i].TravellersList[j])) {
                            if (!roomsAfter[i].TravellersList[j].ReservationRoomId) roomsAfter[i].TravellersList[j].ReservationRoomId = roomsAfter[i].ReservationRoomId;
                            if (roomsAfter[i].TravellersList[j].IsDeleted) roomsAfter[i].TravellersList[j].HotelId = -1; //Fake hotelid for delete
                            listEditTraveller.push(roomsAfter[i].TravellersList[j]);
                        }
                    }
                }

                for (var i in roomsAfter) {
                    for (var j in roomsAfter[i].TravellersList) {
                        if (roomsAfter[i].TravellersList[j].TravellerId < 0) {
                            if (!roomsAfter[i].TravellersList[j].ReservationRoomId) roomsAfter[i].TravellersList[j].ReservationRoomId = roomsAfter[i].ReservationRoomId;
                            listEditTraveller.push(roomsAfter[i].TravellersList[j]);
                        }
                    }
                }

                angular.forEach(listEditTraveller, function (value, key) {
                    var customer = {};
                    customer.Address = value.Address;
                    customer.Birthday = value.Birthday;
                    customer.CountryId = value.CountryId;
                    customer.Email = value.Email;
                    customer.Fullname = value.Fullname;
                    customer.Gender = value.Gender;
                    customer.HotelId = value.HotelId;
                    customer.IdentityNumber = value.IdentityNumber;
                    customer.Mobile = value.Mobile;
                    customer.Note = value.Note;
                    customer.TravellerId = value.TravellerId;

                    var travellerExtraInfoTemp = {
                        isChild: value.IsChild
                    };

                    var SharerViewModel = {
                        customer: customer,
                        reservationRoomId: value.ReservationRoomId,
                        travellerExtraInfo: travellerExtraInfoTemp
                    }
                    listShareViewModel.push(SharerViewModel);
                });

                if (!_.isEmpty(listShareViewModel)) {
                    var save = loginFactory.securedPostJSON("api/Room/EditSharerListInfo", listShareViewModel);
                    $rootScope.dataLoadingPromise = save;
                    save.success(function (data2) {
                        dialogService.toast($filter('translate')('EDIT_TRAVELLER_SUCCESSFULLY'));
                        $scope.Init();
                    }).error(function (err) {
                        console.log(err);
                    });
                }
            });

            function EditTravellersController($scope, $mdDialog, currentRooms, countries, resId, isUsePassport) {
                function InitTravellers() {
                    var roomDefaultId = resId;
                    $scope.rooms = currentRooms;
                    $scope.isUsePassport = isUsePassport;
                    $scope.roomSelected = _.find($scope.rooms, function (room) {
                        return room['ReservationRoomId'] === roomDefaultId
                    });
                    $scope.travellers = $scope.roomSelected.TravellersList;

                    for (var i in $scope.travellers) {
                        var a = {};
                        if ($scope.travellers[i].TravellerId === $scope.roomSelected.Travellers.TravellerId) {
                            if (i == 0) break;
                            else {
                                a = $scope.travellers[i];
                                $scope.travellers.splice(i, 1);
                                $scope.travellers.unshift(a);
                            }
                        }
                    }

                    $scope.travellerSelected = $scope.travellers[0];

                    $scope.isActiveRoom = $scope.roomSelected.ReservationRoomId;

                    //Countries + Format birthday
                    $scope.Countries = countries;
                    $scope.selectedCountries = null;
                    $scope.DatePickerOption = {
                        format: 'dd/MM/yyyy'
                    };
                    $scope.queryCountriesSearch = queryCountriesSearch;
                    $scope.selectedCountriesChange = selectedCountriesChange;
                    $scope.searchCountriesTextChange = searchCountriesTextChange;

                    //Fakeid for add new traveller
                    $scope.travellerIDFake = 0;

                    rebuildTravellers();
                }
                InitTravellers();

                function queryCountriesSearch(query) {
                    var results = query ? $scope.Countries.filter(createCountriesFilterFor(query)) : $scope.Countries,
                        deferred;
                    if (self.simulateQuery) {
                        deferred = $q.defer();
                        $timeout(function () {
                            deferred.resolve(results);
                        }, Math.random() * 1000, false);
                        return deferred.promise;
                    } else {
                        return results;
                    }
                }

                function createCountriesFilterFor(query) {
                    var lowercaseQuery = change_alias(query);
                    return function filterFn(item) {
                        return (change_alias(item.CountryName.toLowerCase()).indexOf(lowercaseQuery) >= 0 || change_alias(item.CountryCode.toLowerCase()).indexOf(lowercaseQuery) >= 0);
                    };
                }

                function selectedCountriesChange(item, traveller) {
                    if (!_.isUndefined(item)) {
                        $scope.travellerSelected.CountryId = item.CountryId;
                        if ($scope.travellerSelected.Countries) $scope.travellerSelected.Countries = item;
                    }
                }

                function searchCountriesTextChange(text) {
                    $scope.searchCountriesText = text;
                }

                function rebuildTravellers() {
                    $scope.isActiveTraveller = $scope.travellerSelected.TravellerId;
                    if (!_.isNull($scope.travellerSelected.Birthday)) {
                        $scope.travellerSelected.Birthday = new Date($scope.travellerSelected.Birthday);
                        $scope.dateString = $scope.travellerSelected.Birthday.format('dd/mm/yyyy');
                    }
                    if (!_.isNull($scope.travellerSelected.CountryId) && !_.isUndefined($scope.travellerSelected.CountryId)) {
                        if (!_.isNull($scope.Countries) && !_.isEmpty($scope.Countries)) {
                            $scope.travellerSelected.Countries = _.find($scope.Countries, function (item) {
                                return item['CountryId'] === $scope.travellerSelected.CountryId
                            });
                        }
                    }
                }
                $scope.selectRoom = function (resId) {
                    $scope.roomSelected = _.find($scope.rooms, function (room) {
                        return room['ReservationRoomId'] === resId
                    });
                    $scope.isActiveRoom = $scope.roomSelected.ReservationRoomId;
                    $scope.travellers = $scope.roomSelected.TravellersList;

                    for (var i in $scope.travellers) {
                        var a = {};
                        if ($scope.travellers[i].TravellerId === $scope.roomSelected.Travellers.TravellerId) {
                            if (i == 0) break;
                            else {
                                a = $scope.travellers[i];
                                $scope.travellers.splice(i, 1);
                                $scope.travellers.unshift(a);
                            }
                        }
                    }

                    $scope.travellerSelected = $scope.travellers[0];
                    rebuildTravellers();
                }
                $scope.selectTraveller = function (travellerId) {
                    $scope.travellerSelected = _.find($scope.travellers, function (traveller) {
                        return traveller['TravellerId'] === travellerId
                    });
                    rebuildTravellers();
                }
                $scope.saveTraveller = function () {
                    $mdDialog.hide($scope.rooms);
                }
                $scope.addCustomer = function () {
                    $scope.travellerIDFake = $scope.travellerIDFake - 1;
                    var travellerId = $scope.travellerIDFake;
                    var newCustomer = {
                        TravellerId: travellerId,
                        Note: null,
                        Mobile: null,
                        IdentityNumber: null,
                        HotelId: null,
                        Gender: 0,
                        Fullname: 'Anonymus',
                        Email: null,
                        CountryId: 259,
                        Birthday: null,
                        Address: null,
                        IsChild: false
                    };
                    $scope.roomSelected.TravellersList.push(newCustomer);
                    $scope.travellerSelected = $scope.roomSelected.TravellersList[$scope.roomSelected.TravellersList.length - 1];
                    rebuildTravellers();
                }
                $scope.deleteCustomer = function (traveller) {
                    traveller.IsDeleted = true;
                    $scope.travellerSelected = $scope.travellers[0];
                    rebuildTravellers();
                }

                $scope.saveInfoPassport = function () {
                    $scope.travellerSelected.Fullname = FullnameCustomer;
                    $scope.travellerSelected.Gender = Gender === "M" ? 0 : 1;
                    $scope.travellerSelected.IdentityNumber = IdentityNumber;
                    if (Birthday) {
                        $scope.travellerSelected.Birthday = new Date(Birthday);
                        $scope.dateString = $scope.travellerSelected.Birthday.format('dd/mm/yyyy');
                    }

                    $scope.travellerSelected.ImageLocation = ImageLocation;
                    $scope.travellerSelected.ValidUntil = new Date(ValidUntil);

                    if ($scope.Countries !== null && $scope.travellerSelected !== null && $scope.Countries.length > 0)

                        $scope.selectedCountries = _.filter($scope.Countries, function (item) {
                            return item.CountryCode == CountryCode;
                        })[0];

                }

                $scope.hide = function () {
                    $mdDialog.hide();
                }
                $scope.cancel = function () {
                    $mdDialog.cancel();
                }
            }
        }


    }
]);
ezCloud.filter('startFrom', function () {
    return function (input, start) {
        start = +start;
        if (angular.isArray(input) && input.length > 0) {
            return input.slice(start);
        }
        return input;
    }
});