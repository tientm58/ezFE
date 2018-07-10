ezCloud.controller('resetPasswordController',['$scope','$rootScope','$stateParams','dialogService','$http','loginFactory','$mdDialog', '$state',  function($scope,$rootScope,$stateParams,dialogService,$http,loginFactory,$mdDialog, $state) {
    $rootScope.showMenu = false;
    $scope.resetPasswordData = {
        Email : $stateParams.email,
        UserId: $stateParams.userId,
        Password : "",
        ConfirmPassword : "",
        Code: $stateParams.code
    };
    
    $scope.doSendResetPassword = function($event){
       
        //$scope.resetPasswordEmail = $stateParams.email;
       // $scope.resetPasswordData.Code = $stateParams.code;
        console.log('scope.resetPasswordData:',$scope.resetPasswordData);
        var resetPassword = loginFactory.postJSON("api/Account/ResetPassword",$scope.resetPasswordData);
        $rootScope.dataLoadingPromise = resetPassword;
        resetPassword.success(function(data){
           
            var confirm = dialogService.confirm("RESET_PASSWORD_SUCCESSFUL","RESET_PASSWORD_SUCCESSFUL");
            confirm.then(function() {
                $state.transitionTo("login");
               
            });    
            
        }).error(function(err){
            console.log(err);
        });                                  
    };
    
}]);