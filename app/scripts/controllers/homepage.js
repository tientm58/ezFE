ezCloud.controller('homepageController',['$scope','$rootScope','$state','dialogService','loginFactory','$localStorage','$http','$sessionStorage', function($scope,$rootScope,$state,dialogService,loginFactory,$localStorage,$http,$sessionStorage) {
   
    loginFactory.isAuthenticated(function(){
        $state.transitionTo("dashboard");
    },function(){
        $state.transitionTo("login");
    });
}]);