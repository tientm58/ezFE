ezCloud.controller('createStaffController',['$scope','$rootScope','$state','dialogService','$http','$localStorage','loginFactory', function($scope,$rootScope,$state,dialogService,$http,$localStorage,loginFactory) {
        $scope.isCreated = false;
        $scope.staffData = {
            UserName: "",
            Email: "",
            Password: "",
            ConfirmPassword: "",
            Description:"",
            StaffRole: "ROLE_HOTEL_STAFF"
        };
        $scope.doCreateStaff = function($event){
            var createStaff = loginFactory.securedPostJSON("api/Account/CreateStaff",$scope.staffData);
            $rootScope.dataLoadingPromise = createStaff;
            createStaff.success(function(data){
                dialogService.toast("Create Staff Data Sent");
                $scope.isCreated = true;
            }).error(function(err){
                console.log(err);
            });
        };
    
    
}]);