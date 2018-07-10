ezCloud.controller('advancedLoginController',['$scope','$rootScope','$state','dialogService','loginFactory','$localStorage','$http','$sessionStorage','$location','$stateParams','commonFactory', function($scope,$rootScope,$state,dialogService,loginFactory,$localStorage,$http,$sessionStorage,$location, $stateParams, commonFactory) {
    console.log('Done');
    var hotelList = [];
    Init();
    function Init() {
        jQuery(document).unbind('keydown');
        loadAllHotels();
        $scope.login = {};
    }
    
    function loadAllHotels() {
        loginFactory.normalGet("api/Hotel/GetAllHotels").success(function(hotels) {
            console.log(hotels);
            hotelList = hotels;
            $scope.items = hotelList;
        });
    }
    $scope.searchTextChange = function(searchText) {
        
    };
    $scope.selectedItemChange = function(item) {
        console.log(item);
        if (item)
        $scope.login.hotelId = item.HotelId;
    };
    $scope.querySearch = function(query) {
        var results = query ? hotelList.filter( createFilterFor(query) ) : hotelList,
          deferred;
        console.log(results);
        return results;
      
    };
    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);
      return function filterFn(hotel) {
        return (hotel.HotelName.toLowerCase().indexOf(lowercaseQuery) === 0);
      };
    }
    function loginSuccess(data) {
        
            $localStorage.reLoadTab = true;
            //console.log(data);
            commonFactory.getHotelSettings(function(settings) {
                $rootScope.HotelSettings = settings;
                setTimeout(function(){$scope.$apply();},0);

            });
            var success = loginFactory.processLoginData(data);
            if (success){
                dialogService.toast("LOGIN_SUCCESS");
                loginFactory.isAuthenticated();
                //create server session
                var hotelList = loginFactory.securedGet("api/Hotel/GetHotelList");
                $rootScope.dataLoadingPromise = hotelList;
                hotelList.success(function(data){


                    if (data.length == 0 && $scope.login.role == "HOTEL_OWNER"){
                        $state.transitionTo('hotelQuickSettings');
                    }
                    else{
                        if ($stateParams.url)
                            $location.url($stateParams.url);
                        else
                            $state.transitionTo("dashboard");

                    }
                }).error(function(err){
                    console.log(err);
                });
               
            }
            else {
                dialogService.toast("LOGIN_FAILED");
            }
        
    }
    $scope.doLogin = function() {
        commonFactory.clearCache();
        if ($scope.loginForm.$invalid) return;
        var login;
        login = loginFactory.loginHotelOwner($scope.login.username,$scope.login.password,$scope.login.hotelId);
        
        
        $rootScope.dataLoadingPromise = login;
        login.success(loginSuccess).error(function(err) {
            var errors = [];
            dialogService.messageBox("LOGIN_ERRORS", err.error_description.toString());
        });
    };
    
}]);