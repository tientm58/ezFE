ezCloud.controller('emailConfirmController',['$scope','$rootScope','$stateParams','loginFactory','$http',
function($scope,$rootScope,$stateParams,loginFactory,$http){
    $rootScope.showMenu = false;
    $scope.loginUrl = "/#/login";
    $scope.confirmData = {
        UserId: "",
        Code: ""
    };
    init();
    function init(){
       
            $scope.confirmData.UserId = $stateParams.userId;
            $scope.confirmData.Code = $stateParams.code;

            var emailConfirm = loginFactory.postJSON("api/Account/ConfirmEmail/",$scope.confirmData);
            $rootScope.dataLoadingPromise = emailConfirm;
            emailConfirm.success(function(data){
                console.log(data);
            }).error(function(err){
                console.log(err);
            });
     };
   
}]);