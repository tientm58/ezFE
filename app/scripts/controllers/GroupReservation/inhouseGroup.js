ezCloud.controller('InhouseGroupController', ['$scope', '$rootScope', '$state', 'dialogService', '$localStorage', 'loginFactory', '$mdDialog','ExcelFactory','$filter','$location', 'groupReservationFactory','walkInFactory','PaginationFactory', function($scope, $rootScope, $state, dialogService, $localStorage, loginFactory, $mdDialog,ExcelFactory,$filter,$location, groupReservationFactory,walkInFactory,PaginationFactory) {
    function InitInhouseGroup() {
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
            GuestName: null,
            RoomTypeId: 0,
            RoomId:0,
            SourceId: 0,
        };
        groupReservationFactory.getSearchInformation(function (data) {
            $scope.roomTypes = data.roomTypes;
            $scope.source = data.source;
            $scope.rooms=data.rooms;
        });
        $scope.searchResult = [];
        groupReservationFactory.processSearchInHouseGroup($scope.search, function (data) {
            // $scope.pagination.CountPage(data.GroupInhouseList.length);
            $scope.searchResult = data.GroupInhouseList;
            $scope.page.totalRecord = $scope.searchResult.length;
            $scope.page.currentPage = 0;
        });
        // pagination
        $scope.page = {
            currentPage: 0,
            pageSize: 10,
            totalRecord: 0
        }
    }
    InitInhouseGroup();
    $scope.processSearch=function(){
        $scope.searchResult = [];
        groupReservationFactory.processSearchInHouseGroup($scope.search, function (data) {
            if(data.GroupInhouseList){
                // $scope.pagination.CountPage(data.GroupInhouseList.length);
                $scope.searchResult = data.GroupInhouseList;
                $scope.page.totalRecord = $scope.searchResult.length;
                $scope.page.currentPage = 0;
            }
            else{
                // $scope.pagination.CountPage(0);
                $scope.page.totalRecord = $scope.searchResult.length;
                $scope.page.currentPage = 0;
            }
        });
    }

    function addDays(date, days) {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    };
    $scope.MergeGroup = function (){
        $location.url("/mergeGroup");
    };
     $scope.ExportExcel=function(tableId){
        var newDate=new Date();
        var ExcelName=$filter("translate")("INHOUSE_GROUP_LIST_EXCEL")+'_'+newDate.format("ddmmyyyy");
        var exportHref=ExcelFactory.tableToExcel(tableId,ExcelName);
    }
    $scope.menuItemClick = function (item, result) {
        if (item.url) {
            $location.path(item.url);
        }
        if(item.name == 'ADD_NEW_GUEST_TO_GROUP'){
            AddNewGuest(result.ReservationId);
        }
    }
    function AddNewGuest(reservationId){
        var temp = {
            ReservationId : reservationId,
            From: 'inhouseGroup'
        }
        walkInFactory.setReservationGroup(temp);
        $location.path("walkin");
    }
}]);