ezCloud.controller('houseDailyCleanController', houseDailyClean)
houseDailyClean.$inject = ['frontOfficeFactory', 'commonFactory', '$filter', '$scope', '$rootScope', '$mdBottomSheet', 'roomListFactory', 'selectedRoomFactory', '$location', '$state', 'reservationFactory', 'dialogService', 'loginFactory', '$mdDialog', '$localStorage', '$mdMedia', '$http', 'currentHotelConnectivities', 'smartCardFactory', '$q', '$window', 'walkInFactory', '$timeout', 'houseKeepingFactory'];

function houseDailyClean(frontOfficeFactory, commonFactory, $filter, $scope, $rootScope, $mdBottomSheet, roomListFactory, selectedRoomFactory, $location, $state, reservationFactory, dialogService, loginFactory, $mdDialog, $localStorage, $mdMedia, $http, currentHotelConnectivities, smartCardFactory, $q, $window, walkInFactory, $timeout, houseKeepingFactory) {
    $scope.$mdMedia = $mdMedia;
    $scope.DateDailyClean = "";
    $scope.Today = "";
    $scope.durationTimeLine = '14';
    $scope.minRepairDate = new Date(1970, 0, 1, 12, 0, 0).toLocaleString();
    $scope.maxRepairDate = new Date(9999, 0, 1, 12, 0, 0).toLocaleString();
    $scope.StatusColor = {};
    //$scope.StatusColorDailyClean = {};
    function Init() {
        $scope.Today = new Date();
        $scope.DateDailyClean = new Date();

        $scope.StatusColor = {
            CheckinColors: _.filter($scope.SettingsColor, function (item) {
                return item.StatusCode == "CHECKIN";
            })[0].ColorCode,
            BookColors: _.filter($scope.SettingsColor, function (item) {
                return item.StatusCode == "BOOKED";
            })[0].ColorCode,
            RepairColors: _.filter($scope.SettingsColor, function (item) {
                return item.StatusCode == "REPAIR";
            })[0].ColorCode
        };
        //loadData();
    }

    commonFactory.getHotelCommonInformation(function (data) {
        $scope.SettingsColor = data.StatusColors;
        Init();
    });

    var schedulerData = [];
    if ($rootScope.previousState != null && $rootScope.previousState == "hotelSelect") {
        location.reload();

    } else {
        loadData();
    }
    $scope.loadData = loadData;

    $scope.changeDate = function(date){
        if ($localStorage.sortBy != null) {
            $scope.sortBy = $localStorage.sortBy;
        } else {
            $scope.sortBy = 'ROOM';
            $localStorage.sortBy = 'ROOM';
        };
        initTimelineView(date);
    }

    function loadData() {
        if ($localStorage.sortBy != null) {
            $scope.sortBy = $localStorage.sortBy;
        } else {
            $scope.sortBy = 'ROOM';
            $localStorage.sortBy = 'ROOM';
        };
        var DateDailyClean = $scope.DateDailyClean;
        var durationTimeLine = $scope.durationTimeLine;
        //initTimelineView(DateDailyClean, durationTimeLine)
        initTimelineView(DateDailyClean);
    }
    $scope.changeSortBy = function (newSortBy) {
        if ($localStorage.sortBy != null && (newSortBy != $localStorage.sortBy)) {
            $localStorage.sortBy = newSortBy;
            $scope.sortBy = newSortBy;
        }
    };

    $scope.changeDurationTimeLine = function (durationTimeLine) {
        $localStorage.durationTimeLine = durationTimeLine;
        // console.log(durationTimeLine);
        //  $state.reload();
        // initTimelineView(null, $scope.durationTimeLine);
        $scope.loadData();
    }
    $scope.changeDailyClean = function (dailyClean) {
        //dailyClean.ServiceCode = code;
        var model = {
            ServiceCode: dailyClean.ServiceCode,
            DailyClearnId: dailyClean.DailyClearnId,
            Date: dailyClean.Date,
            RoomId: dailyClean.RoomId
        };
        if (dailyClean.ServiceCode) {
            houseKeepingFactory.luuLichDonPhong(model, function () {
                dialogService.toast("SAVE_DAILYCLEAN_SUCCESSFUL");
                initTimelineColums(null, $scope.durationTimeLine);
                //$scope.loadData();
            });

        } else {
            if (dailyClean.DailyClearnId == 0 && !dailyClean.ServiceCode)
                // dialogService.messageBox("ERROS", 'SAVE_DAILYCLEAN_NOT_SELECT_ERROS');
                dialogService.toast("SAVE_DAILYCLEAN_SUCCESSFUL");
            else
                houseKeepingFactory.luuLichDonPhong(model, function () {
                    dialogService.toast("SAVE_DAILYCLEAN_SUCCESSFUL");
                    initTimelineColums(null, $scope.durationTimeLine);
                    //$scope.loadData();
                });
        }
        // console.log(model.DailyClearnId + '-' + model.ServiceCode);
    }

    function initTimelineColums(inputDate) {        
        if (!inputDate) {
            tmpDD = new Date();
            tmpDD.setHours(12);
            tmpDD.setMinutes(0);
            tmpDD.setSeconds(0);
            tmpDD.setMilliseconds(0);
        } else {
            var tmpDD = new Date(inputDate).setHours(12);
        }
        var date = new Date(tmpDD).format("yyyy-mm-dd HH:MM:ss");
        if ($localStorage.durationTimeLine != undefined && $localStorage.durationTimeLine != null) {
            $scope.durationTimeLine = $localStorage.durationTimeLine;
        } else {
            $localStorage.durationTimeLine = $scope.durationTimeLine;
        }
        var promise = loginFactory.securedGet("api/HouseKeeping/GetTimelineColumns", $.param({
            date: date,
            duration: $scope.durationTimeLine
        }));
        $rootScope.dataLoadingPromise = promise;
        promise.success(function (dataReceived) {
            $scope.footerColumns = dataReceived.footerColumns;
        });
    }

    function initTimelineView(inputDate) {
        if (!inputDate){
            tmpDD = new Date();
            tmpDD.setHours(12);
            tmpDD.setMinutes(0);
            tmpDD.setSeconds(0);
            tmpDD.setMilliseconds(0);
        }else{  
            var tmpDD = new Date(inputDate).setHours(12);
        }
        var date = new Date(tmpDD).format("yyyy-mm-dd HH:MM:ss");
        if ($localStorage.durationTimeLine != undefined && $localStorage.durationTimeLine != null) {
            $scope.durationTimeLine = $localStorage.durationTimeLine;
        } else {
            $localStorage.durationTimeLine = $scope.durationTimeLine;
        }
        // var newDate = new Date($scope.durationTimeLine);
        // newDate.setHours(12);

        var promise = loginFactory.securedGet("api/HouseKeeping/RoomDailyClean", $.param({
            date: date,
            duration: $scope.durationTimeLine
        }));
        $rootScope.dataLoadingPromise = promise;
        promise.success(function (dataReceived) {

            $scope.timelineColumns = dataReceived.timelineColumns;
            $scope.timelineRooms = dataReceived.roomList;
            //$scope.footerColumns = dataReceived.footerColumns;
            $scope.floorList = dataReceived.floorList;
            $scope.roomTypeList = dataReceived.roomTypeList;
            //$scope.StatusColorDailyClean = dataReceived.statusColors;

            // var colors = rooms.statusColors;

            //console.log($scope.footerColumns);

        }).then(function(){
            initTimelineColums(inputDate);
        });
    }


    $scope.isWeekend = function (date) {
        var tmpDate = new Date(date); 
        return (tmpDate.getDay() == 0 || tmpDate.getDay() == 6);
    }
};