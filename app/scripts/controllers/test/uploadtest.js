ezCloud.controller('testController',['$scope','$state','roomListFactory','dialogService','loginFactory','$q','$mdDialog', function($scope,$state,roomListFactory,dialogService,loginFactory,$q,$mdDialog) {
  $scope.getType = function(x) {
              return typeof x;
          };
          $scope.isDate = function(x) {
              return x instanceof Date;
          };
	
	$scope.productsDataSource = {
              type: "odata",
              serverFiltering: true,
              transport: {
                  read: {
                      url: "//demos.telerik.com/kendo-ui/service/Northwind.svc/Products",
                  }
              }
          };
	}]);


                                         