ezCloud.controller('DepartedGroupController', ['$scope', '$rootScope', '$state', 'dialogService', '$localStorage', 'loginFactory', '$mdDialog', '$location', 'groupReservationFactory', 'ExcelFactory', '$filter', 'PaginationFactory', function ($scope, $rootScope, $state, dialogService, $localStorage, loginFactory, $mdDialog, $location, groupReservationFactory, ExcelFactory, $filter, PaginationFactory) {
    function InitDepartedGroup() {
        // $scope.pagination = PaginationFactory.getNew(10);
        jQuery(document).unbind('keydown');
        $scope.HostName = "http://" + location.hostname;
        $scope.DatePickerOption = {
            format: 'dd/MM/yyyy'
        };
        $scope.fromString = new Date().format('dd/mm/yyyy');
        $scope.toString = addDays(new Date(), 1).format('dd/mm/yyyy');
        $scope.search = {
            ReservationNumber: null,
            GuestName: null,
            SourceId: 0,
            RoomTypeId: 0,
            RoomId: 0,
            From: new Date(),
            To: addDays(new Date(), 1)
        };
        groupReservationFactory.getSearchInformation(function (data) {
            $scope.roomTypes = data.roomTypes;
            $scope.source = data.source;
            $scope.rooms = data.rooms;
        });
        $scope.searchResult = [];
        $scope.processSearch();

        // pagination
        $scope.page = {
            currentPage: 0,
            pageSize: 10,
            totalRecord: 0
        }
    }
    $scope.processSearch = function () {
        $scope.searchResult = [];
        groupReservationFactory.processSearchDepartedGroup($scope.search, function (data) {
            if (data.GroupDepartedList) {
                $scope.searchResult = data.GroupDepartedList;
                if (data && data.GroupDepartedList.length > 0) {
                    // $scope.pagination.CountPage(data.GroupDepartedList.length);
                    $scope.searchResult = data.GroupDepartedList;
                    $scope.page.totalRecord = $scope.searchResult.length;
                    $scope.page.currentPage = 0;
                }
            } else {
                // $scope.pagination.CountPage(0);
                $scope.page.totalRecord = $scope.searchResult.length;
                $scope.page.currentPage = 0;
            }
        });
    };
    $scope.temp = function(){
        $scope.currentPage =  $scope.currentPage +1;
        alert($scope.currentPage);
   }
    InitDepartedGroup();

    $scope.ExportExcel = function (tableId) {
        var newDate = new Date();
        var ExcelName = $filter("translate")("DEPARTED_GROUP_LIST_EXCEL") + '_' + newDate.format("ddmmyyyy");
        var exportHref = ExcelFactory.tableToExcel(tableId, ExcelName);
    }

    function addDays(date, days) {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
    $scope.menuItemClick = function (item, result) {
        if (item.url) {
            $location.path(item.url);
        }
    }
}]);