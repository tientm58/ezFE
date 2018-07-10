
ezCloud.controller('GroupReservationController', ['$scope', '$rootScope', '$state', 'dialogService', '$localStorage', 'loginFactory', '$mdDialog', 'groupReservationFactory','ExcelFactory','$filter','$location','walkInFactory','PaginationFactory', function($scope, $rootScope, $state, dialogService, $localStorage, loginFactory, $mdDialog, groupReservationFactory,ExcelFactory,$filter,$location,walkInFactory,PaginationFactory) {
    function InitGroupReservation() {
        // $scope.pagination = PaginationFactory.getNew(10);
        jQuery(document).unbind('keydown');
        $scope.HostName="http://"+location.hostname;
        $scope.DatePickerOption = {
            format: 'dd/MM/yyyy'
        };
        $scope.arrivalFromString = new Date().format('dd/mm/yyyy');
        $scope.arrivalToString   = addDays(new Date(), 1).format('dd/mm/yyyy');
        $scope.resFromString     = null;
        $scope.resToString       = null;
        $scope.search            = {
            ReservationNumber: null,
            ReservationCode: null,
            GroupName:null,
            RoomTypeId: 0,
            SourceId: 0,
            Type: 1,
            ArrivalIncluded: true,
            ArrivalFrom: new Date(),
            ArrivalTo: addDays(new Date(), 1),
            CreateDateFrom: null,
            CreateDateTo: null,
        };
        groupReservationFactory.getSearchInformation(function (data) {
            $scope.roomTypes = data.roomTypes;
            $scope.source = data.source;
        });
        $scope.processSearch();

        // pagination
        $scope.page = {
            currentPage: 0,
            pageSize: 10,
            totalRecord: 0
        }
    };
    $scope.processSearch=function(){
        $scope.searchResult = [];
        groupReservationFactory.processSearchGroupReservation($scope.search, function (data) {
            if(data.GroupReservationList){
                $scope.searchResult = data.GroupReservationList;
                if(data && data.GroupReservationList.length > 0){
                    // $scope.pagination.CountPage(data.GroupReservationList.length);
                    $scope.searchResult = data.GroupReservationList;
                    $scope.page.totalRecord = $scope.searchResult.length;
                    $scope.page.currentPage = 0;
                }
            }
            else{
                // $scope.pagination.CountPage(0);
                $scope.page.totalRecord = $scope.searchResult.length;
                $scope.page.currentPage = 0;
            }
        });
    }
    $scope.temp = function(){
         $scope.currentPage =  $scope.currentPage +1;
         alert($scope.currentPage);
    }
    InitGroupReservation();
    $scope.ExportExcel=function(tableId){
        var newDate=new Date();
        var ExcelName=$filter("translate")("GROUP_RESERVATION_LIST_EXCEL")+'_'+newDate.format("ddmmyyyy");
        var exportHref=ExcelFactory.tableToExcel(tableId,ExcelName);
    };
    function addDays(date, days) {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    };
    $scope.MergeGroup = function (){
        $location.url("/mergeGroup");
    };
    $scope.openMenu = function($mdOpenMenu, ev){
        $mdOpenMenu(ev);
    };
    $scope.menuItemClick = function (item, result) {
        if (item.url) {
            $location.path(item.url);
        }
        if (item.name === 'GROUP_CANCEL') {
            GroupCancel(result.ReservationId);
        }
        if (item.name == 'PRINT_CONFIRMATION') {
            GroupConfirm(result.ReservationId);
        }
        if(item.name == 'ADD_NEW_GUEST_TO_GROUP'){
            AddNewGuest(result.ReservationId);
        }
    }
    function GroupConfirm(reservationId){
        var keys = ["ROOM_MONTHLY", "ROOM_WEEKLY", "ROOM_FULL_DAY", "ROOM_DAY_NIGHT", "ROOM_HOURLY", "MINIBAR", "LAUNDRY", "EXTRA_ROOM_CHARGE", "COMPENSATION", "EXTRA_SERVICES", "FULL_DAY_EARLY_CHECKIN", "FULL_DAY_LATE_CHECKOUT", "DAY_NIGHT_EARLY_CHECKIN", "DAY_NIGHT_LATE_CHECKOUT", "EXTRA_ADULTS", "EXTRA_CHILDREN", "PAYMENT", "DISCOUNT_MONEY_OFF", "DISCOUNT_PERCENT_OFF", "FREE"];
        var languageKeys = {};
        for (var idx in keys) {
            languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
        }
        //
        var CreateGroupInvoiceModel = {
            ReservationId: reservationId,
            languageKeys: languageKeys
        }
        //
        var GroupConfirmInvoice = "GroupConfirmA4.trdx";
        var CreateGroupInvoice = loginFactory.securedPostJSON("api/GroupReservation/CreateGroupInvoice", CreateGroupInvoiceModel);
        $rootScope.dataLoadingPromise = CreateGroupInvoice;
        CreateGroupInvoice.success(function (data) {
            $mdDialog.show({
                controller: InvoiceController
                , locals: {
                    reservationId:reservationId
                    , GroupConfirmInvoice: GroupConfirmInvoice
                }
                , templateUrl: 'views/templates/invoice.tmpl.html'
                , parent: angular.element(document.body)
                // , targetEvent: ev
                , clickOutsideToClose: false
            })
            .then(function (answer) {}, function () {
            });
        }).error(function (err) {
            console.log(err);
        });
         
        function InvoiceController($scope, $mdDialog, reservationId, GroupConfirmInvoice) {
            //showInvoice(reservationRoomId);
            globalInvoiceId = 0;
            _reservationId = reservationId;
            HotelFormRoomInvoice = GroupConfirmInvoice;
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
        }
    }
    function AddNewGuest(reservationId){
        var temp = {
            ReservationId : reservationId,
            From: 'groupReservation'
        };
        walkInFactory.setReservationGroup(temp);
        $location.path("walkin");
    }
    function GroupCancel(reservationId){
        $mdDialog.show({
            controller: CancelDialogController,
            templateUrl: 'views/templates/groupCancel.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
        }).then(function(res) {
            var cancelReason = res.cancelReason
            if(cancelReason){
                var keys = ["NOTIFICATION_CANCELED_GROUP_CONTENT"];
                var languageKeys = {};
                for (var idx in keys) {
                    languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
                }
                var GroupCancelModel = {
                    ReservationId: reservationId,
                    CancelReason:cancelReason,
                    languageKeys:languageKeys,
                    SendEmail: res.SendEmail
                };
                groupReservationFactory.ProcessGroupCancel(GroupCancelModel,function(data){
                    if(data == "SUCCESSFUL"){
                        dialogService.toast("GROUP_CANCEL_SUCCESSFUL");
                        $scope.processSearch();
                    }else{
                        dialogService.messageBox("ERROR", data);
                    }
                });
            }

            // var processCancelGroupReservation = loginFactory.securedPostJSON("api/GroupReservation/ProcessCancelGroupReservation", CancelGroupReservationModel);
            // $rootScope.dataLoadingPromise = processCancelGroupReservation;
            // processCancelGroupReservation.success(function(data) {
            //     $rootScope.groupReservationShowResult = data;
            //     InitGroupReservationDetail();
            // }).error(function(err) {
            //     console.log(err);
            // });
        }, function() {

        });
        function CancelDialogController($scope, $mdDialog) {
            $scope.SendEmail = true;

            $scope.hide = function() {
                $mdDialog.hide();
            };
            $scope.cancel = function() {
                $mdDialog.cancel();
            };
            $scope.processCancel = function() {
                $mdDialog.hide({ cancelReason: $scope.cancelReason, SendEmail: $scope.SendEmail});
            };
        }
        
    }
}]);