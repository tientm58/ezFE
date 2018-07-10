// (function () {
//     'use strict';

ezCloud.controller('houseDailyClean_DetailController', houseDailyClean_Detail);

houseDailyClean_Detail.$inject = ['frontOfficeFactory', '$filter', '$scope', '$rootScope', '$mdBottomSheet', 'roomListFactory', 'selectedRoomFactory', '$location', '$state', 'reservationFactory', 'dialogService', 'loginFactory', '$mdDialog', '$localStorage', '$mdMedia', '$http', 'currentHotelConnectivities', 'smartCardFactory', '$q', '$window', 'walkInFactory', 'houseKeepingFactory'];

function houseDailyClean_Detail(frontOfficeFactory, $filter, $scope, $rootScope, $mdBottomSheet, roomListFactory, selectedRoomFactory, $location, $state, reservationFactory, dialogService, loginFactory, $mdDialog, $localStorage, $mdMedia, $http, currentHotelConnectivities, smartCardFactory, $q, $window, walkInFactory, houseKeepingFactory) {
    jQuery(document).unbind('keydown');
    $scope.search = {
        ChangeDate: new Date()
    };

    //   $scope.ChangeDate = new Date().format("yyyy-mm-dd");
    $scope.DatePickerOption = {
        format: 'dd/MM/yyyy'
    };
    $scope.roomDailyCleans = [];
    $scope.footerModel = [];

    $scope.$mdMedia = $mdMedia;


    $scope.lstroomDailyCleans = [];
    $scope.timelineRooms = [];
    $scope.staffs = [];
    $scope.noteAR_DEEPerdayService = null;

    $scope.loadData = function () {
        $scope.arrivalFromString = $scope.search.ChangeDate.format('dd/mm/yyyy');
        getDailyCleanDetail($scope.search.ChangeDate);


    }
    $scope.loadData();
    //$scope.date = new Date();
    $scope.changeDate = function () {


        $scope.loadData()

    }

    $scope.totalServiceCode = [];
    $scope.sumTotalCodeService = function(data){
        var result = [];
        for (i = 0; i < listServices.length; i++) {
            var item = listServices[i];
            result.push({ total: 0, code: item});
        }
        data.forEach(function (element) {
            var ServiceCode = element.DailyClean.ServiceCode != null ? element.DailyClean.ServiceCode : "E";
            var indexF = listServices.findIndex(function(item){
                return item == ServiceCode;
            }, ServiceCode);
            result[indexF].total++;
        }); 
        return result;
    }

    function getDailyCleanDetail(ChangeDate) {
        //var date = new Date(ChangeDate);
        ChangeDate = new Date(ChangeDate.setHours(12));
        var promise = loginFactory.securedGet("api/HouseKeeping/houseDailyClean_Detail", $.param({
            ChangeDate: ChangeDate.format('yyyy/mm/dd HH:MM:ss')

        }));
        $rootScope.dataLoadingPromise = promise;
        promise.success(function (dataReceived) {
            console.log(dataReceived);
            $scope.lstroomDailyCleans = dataReceived.roomDailyCleans;
            $scope.footerModel = dataReceived.footerModel;
            $scope.timelineRooms = dataReceived.roomList;

            $scope.staffs = dataReceived.roomDailyCleans.staffList;
            $scope.currentHotel = dataReceived.currentHotel;
            $scope.printInfo = dataReceived.printInfo;
            $scope.printInfo.DatePrint = new Date();
            $scope.totalServiceCode = $scope.sumTotalCodeService(dataReceived.roomDailyCleans);
        });
    }
    var listServices = ['S', 'FS', 'AR', 'DE', 'E'];
    
    

    $scope.updateStaff = {
        UserId: null,

    };
    $scope.searchs = {
        StaffId: 0,
        HotelId: 0
    };

    $scope.roomSelectStaff = function (room) {
        //console.log(room);
        var model = { DailyClearnId: room.DailyClean.DailyClearnId, StaffId: room.DailyClean.StaffId, RoomId: room.RoomId };

        houseKeepingFactory.luuNhanVienDonPhong(model, function () {
            if (model.DailyClearnId > 0) {
                dialogService.toast("UPDATE_STAFFSDAILYCLEAN_SUCCESSFUL");
                $scope.loadData()
            } else {
                dialogService.toast("UPDATE_STAFFSDAILYCLEAN_NOTSUCCESSFUL");
                $scope.loadData()
            }

            //  $state.reload();
        });
    } 

}
// })();
