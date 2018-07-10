ezCloud.controller('guestHistoryController', ['$scope', '$rootScope', '$state', 'dialogService', '$localStorage', '$http', '$sessionStorage', 'loginFactory', '$mdDialog', 'flowFactory', '$filter', '$mdSidenav', '$mdMedia', 'configFactory', '$q', '$location', '$log','frontOfficeFactory','$timeout','ExcelFactory','commonFactory',
function ($scope, $rootScope, $state, dialogService, $localStorage, $http, $sessionStorage, loginFactory, $mdDialog, flowFactory, $filter, $mdSidenav, $mdMedia, configFactory, $q, $location, $log, frontOfficeFactory,$timeout,ExcelFactory,commonFactory) {
    $scope.travellerInfo = {};
    $scope.reservationRoomInfos = [];
    $scope.totalDiscount = 0;
    $scope.total = 0;
    $scope.totalRevenue = 0;
    $scope.totalVisit = 0;
    function init(){
        var travellerId = $rootScope.$stateParams.travellerId;
        //$scope.MoneyName = $rootScope.CurrencyMaster.AlphabeticCode;
        var guestHistory = loginFactory.securedGet("api/FrontOffice/GuestHistory","travellerId="+travellerId);
		$rootScope.dataLoadingPromise = guestHistory;
		guestHistory.success(function (data) {
			console.log(data,"leo");			
            $scope.travellerInfo = data.travellerInfo;
            $scope.reservationRoomInfos = data.reservationRoomInfo;
            $scope.totalDiscount = data.totalDiscount;
            $scope.total = data.total;
            $scope.totalRevenue = data.totalRevenue;
            $scope.totalVisit = data.totalVisit;
		}).error(function (err) {
			console.log(err);
		});
    }
    init();
    $scope.printTblGuestHistory = function(){
        var divToPrint=document.getElementById("tblGuestHistory");
        newWin= window.open("");
        newWin.document.write(divToPrint.outerHTML);
        newWin.print();
        newWin.close();
    };
}]);