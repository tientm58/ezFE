ezCloud.controller('forgotPasswordController',['$scope','$rootScope','$state','dialogService','$http','loginFactory','$mdDialog', function($scope,$rootScope,$state,dialogService,$http,loginFactory,$mdDialog) {
    $rootScope.showMenu = false;
    
    $scope.forgotPasswordData = {
        Email: "",
        HotelId: "",
        Role: "ROLE_HOTEL_OWNER"
    };
    
    $scope.postForgotPasswordEmailToServer = function($event){
        //var forgotPassword = loginFactory.postJSON();
       /* var forgotPassword = $http({
            method: "POST",
            url: loginFactory.getApiUrl() + "api/Account/ForgotPassword?email="+$scope.forgotPasswordEmail
        });*/
        var forgotPassword = loginFactory.postJSON("api/Account/ForgotPassword",$scope.forgotPasswordData);
        $rootScope.dataLoadingPromise = forgotPassword;
        forgotPassword.success(function(data){
            var confirm = dialogService.confirm("FORGOT_PASSWORD_INFORMATION_SENT",
                                                 "RESET_PASSWORD_INFORMATION_HAS_BEEN_SENT_TO_YOUR_EMAIL_ADDRESS");
            confirm.then(function() {
               $state.transitionTo('login');
            });

            }).error(function(err){
                 var errors = [];
                    errors.push(err.Message);
                    for (var key in err.ModelState) {
                        for (var i = 0; i < err.ModelState[key].length; i++) {
                            errors.push(err.ModelState[key][i]);
                        }
                    }

                    dialogService.messageBox("ERROS", errors.toString().replace(",","\n"));
            });
        
       
        
       
    }
    
}]);