ezCloud.controller('MergeGroupController', ['$scope', '$rootScope', '$state', 'dialogService', '$localStorage', 'loginFactory', '$mdDialog', 'groupReservationFactory','ExcelFactory','$filter','$location','$mdMedia', function($scope, $rootScope, $state, dialogService, $localStorage, loginFactory, $mdDialog, groupReservationFactory,ExcelFactory,$filter,$location,$mdMedia) {
     $scope.logItem = function (item) {
        console.log('was selected',$scope.selectedRoom);
      };
	 function InitMergeGroup() {
        $scope.$mdMedia = $mdMedia;
        jQuery(document).unbind('keydown');
        $scope.selectedRoom = [];
	 	$scope.DatePickerOption = {
            format: 'dd/MM/yyyy'
        };
         $scope.query = {
	        order: 'ReservationNumber',
	        limit: 1000,
	        page: 1
	    };
	 	$scope.arrivalFromString = new Date().format('dd/mm/yyyy');
        $scope.arrivalToString   = addDays(new Date(), 1).format('dd/mm/yyyy');
        $scope.resFromString     = null;
        $scope.resToString       = null;
	 	$scope.search  = {
            ReservationNumber: null,
            GroupName:null,
            RoomTypeId: 0,
            SourceId: 0,
            Type: 0,
            ArrivalIncluded: true,
            ArrivalFrom: new Date(),
            ArrivalTo: addDays(new Date(), 1),	
            CreateDateFrom: null,
            CreateDateTo: null,
        };
        $scope.searchResult = [];
        groupReservationFactory.getSearchInformation(function (data) {
            $scope.roomTypes = data.roomTypes;
            $scope.source = data.source;
        });
        $scope.searchResult = [];
        groupReservationFactory.SearchMergeGroupProcess($scope.search, function (data) {
            $scope.searchResult = data.GroupReservationList;
        });
	 };
	 InitMergeGroup();
	 function addDays(date, days) {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
    $scope.processSearch = function (){
        $scope.selectedRoom = [];
		$scope.searchResult = [];
        groupReservationFactory.SearchMergeGroupProcess($scope.search, function (data) {
            $scope.searchResult = data.GroupReservationList;
        });
    };
    $scope.processMergeGroup = function(){
        if($scope.selectedRoom.length <= 1)
            return;
        var list = [];
        angular.forEach($scope.selectedRoom,function(arr){
            list.push(arr.CustomerLeader);
        });
        $mdDialog.show({
            templateUrl: 'views/templates/mergeGroupConfirm.tmpl.html',
            clickOutsideToClose: false,
            resolve: {
                listLeader: function() {
                    return list;
                },
            },
            controller: ['$scope', '$mdDialog', '$filter', '$rootScope', 'loginFactory', 'dialogService','$state','listLeader', MergeGroupDialogController]
        }).then(function(model) {
            if(model){
                var processMegerGroup = groupReservationFactory.processMegerGroup(model);
                processMegerGroup.then(function (data) {
                    if (data == 1) {
                        dialogService.toast("MERGE_GROUP_SUCCESSFULL");
                        $scope.processSearch();
                    }else{
                        dialogService.toast("ERROR_MERGE_GROUP");
                    }
                });
            }
        }, function() {});
        function MergeGroupDialogController($scope, $mdDialog, $filter, $rootScope, loginFactory, dialogService,$state,listLeader) {
            function InitMerge(){
                $scope.ReservationIdLeader = 0;
                $scope.listLeader = listLeader;
            };
            InitMerge();
            $scope.hide = function() {
                $mdDialog.hide();
            };
            $scope.cancel = function() {
                $mdDialog.cancel();
            };
            $scope.MergeGroup = function(){
                if($scope.ReservationIdLeader == 0) return; 
                var ListMergeReservationId = [];

                angular.forEach($scope.listLeader,function(arr){
                    if($scope.ReservationIdLeader != arr.ReservationId)
                    ListMergeReservationId.push(arr.ReservationId);
                });
                var model = {
                    NewReservationId: parseInt($scope.ReservationIdLeader),
                    ListReservationId: ListMergeReservationId
                };
                console.log('Merge Group',model);
                $mdDialog.hide(model);
               
            }
        };
    }
}]);