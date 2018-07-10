
ezCloud.controller('BEReservationController', ['$rootScope', '$state', '$translate', '$scope', '$mdSidenav', '$log', '$timeout', 'loginFactory', 'dialogService', '$window', '$location', '$mdDialog', '$localStorage','$mdDialog','$mdMedia','BEFactory', '$route',
        function ($rootScope, $state, $translate, $scope, $mdSidenav, $log, $timeout, loginFactory, dialogService, $window, $location, $mdDialog, $localStorage,$mdDialog,$mdMedia,BEFactory,$route) {

    function Init(){
        jQuery(document).unbind('keydown');
        BEFactory.CheckHotelCMConfiguration();
        $scope.DatePickerOption = {
                format: 'dd/MM/yyyy'
        };
        // $scope.Status=[{
        //         StatusName:'ALL',
        //         CMConfirmed:null
        //     },
        //     {
        //         StatusName:'NOT_FIX',
        //         CMConfirmed:0
        //     },
        //     {
        //         StatusName:'FIXED',
        //         CMConfirmed:1
        // }];
        $scope.arrivalFromString = null;
        $scope.arrivalToString = null;
        $scope.bookedFromString = null;
        $scope.bookedToString = null;
        $scope.resFromString = new Date().format('dd/mm/yyyy');
        $scope.resToString = addDays(new Date(), 1).format('dd/mm/yyyy');
        $scope.search = {
            CMBookingID: null,
            CMConfirmed: null,
            ArrivalIncluded: false,
            ArrivalFrom: null,
            ArrivalTo: null,
            BookedIncluded: false,
            BookedFrom: null,
            BookedTo: null,
            ReservationFrom: new Date(),
            ReservationTo: addDays(new Date(), 1),
        };
        $scope.bookingStatusMapping = {
            BOOKED: "ic_event_available_24px.svg",
            CHECKIN: "ic_local_hotel_24px.svg",
            OVERDUE: "ic_restore_24px.svg",
            AVAILABLE: "ic_check_circle_24px.svg",
            CANCELLED: "ic_cancel_24px.svg",
            NOSHOW: "ic_event_busy_24px.svg",
            CHECKOUT: "ic_exit_to_app_24px.svg"
        };
        $scope.searchResult = [];
        BEFactory.processCMSearchReservation($scope.search, function (data) {
            $scope.searchResult = data;
        });
        function addDays(date, days) {
            var result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        };

    };
    Init();
    $scope.openMenu = function ($mdOpenMenu, ev) {
        // originatorEv = ev;
        $mdOpenMenu(ev);
    };
    $scope.processSearch = function(){
        BEFactory.processCMSearchReservation($scope.search, function (data) {
            console.log("SEARCH RESULT", data);
            $scope.searchResult = data;
        });
    };
    $scope.menuItemClick = function (item, result) {
        console.log(item);
        if (item.url) {
            $location.path(item.url);
            $route.reload();
        }
    }
    $scope.GetReservationLog=function(){
        if($scope.CMBookingID==null || $scope.CMBookingID==''){
            $scope.reservationLogData=[];
            return;
        }
        var GetReservationLogData = loginFactory.securedGet("api/ChannelManager/GetReservationLogData","CMBookingId="+$scope.CMBookingID);
        $rootScope.dataLoadingPromise = GetReservationLogData;
        GetReservationLogData.success(function(data){
            console.log("Reservation Log", data);
            if(data.length>0){
                angular.forEach(data,function(arr){
                    arr.dataString=JSON.stringify(arr.data);
                    arr.errors=JSON.stringify(arr.errors);
                    arr.date=new Date(arr.date);
                });
            }
            $scope.reservationLogData = data;
        }).error(function(err){
           console.log('err',err);

        });
    }
    $scope.showReservationDetail=function(result,event){
        var resultTemp = angular.copy(result);
            var useFullScreen = $mdMedia('xs');
            $mdDialog.show({
                controller: ShowReservationDetailDialogController,
                resolve: {
                    reservationDetail: function () {
                        return resultTemp;
                    }
                },
                templateUrl: 'views/templates/showCMReservationDetail.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: event,
                fullscreen: useFullScreen
            })
    };
    function ShowReservationDetailDialogController($scope, $mdDialog, reservationDetail) {
        $scope.cancel = function () {
            //angular.copy(initial, $scope.roomTypeEditing);
            $mdDialog.cancel();
        };
        $scope.reservationDetail = reservationDetail;
    }
}]);