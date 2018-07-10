ezCloud.factory("configHotelDisplayFactory", ['$http', 'loginFactory', '$rootScope', '$sessionStorage', '$location', 'dialogService', '$q', '$interval', '$timeout', '$filter', '$log', '$localStorage',
function ($http, loginFactory, $rootScope, $sessionStorage, $location, dialogService, $q, $interval, $timeout, $filter, $log, $localStorage) {
	function processHotelDisplay(callback){
			var HotelDisplay = loginFactory.securedGet("api/Hotel/getHotelDisplay");
				$rootScope.dataLoadingPromise = HotelDisplay;
				HotelDisplay.success(function (data) {
					angular.forEach(data.Listdisplay,function(arr){
						arr.Show=false;
						arr.allowedTypes=[arr.DisplayGroupId];
						angular.forEach(arr.List,function(arr1){
							arr1.DisplayGroupCode=arr.DisplayGroupCode;
						});
					});
					if(data.hotelDisplay.length>0){
						var listIndex=[];
						angular.forEach(data.hotelDisplay,function(arr){
							arr.allowedTypes=[arr.DisplayGroupId];
							arr.Show=false;
							angular.forEach(arr.List,function(arr1){
								arr.DisplayGroupPriority=arr1.DisplayGroupPriority;
								angular.forEach(data.displayGroupDetail,function(arr2){
									if(arr1.DisplayGroupDetailId==arr2.DisplayGroupDetailId){
										listIndex.push({DisplayGroupDetailId:arr1.DisplayGroupDetailId});
										arr1.DisplayGroupDetailCode=arr2.DisplayGroupDetailCode;
										arr1.DisplayGroupDetailDesc=arr2.DisplayGroupDetailDesc;
										arr1.PropertyColumName=arr2.PropertyColumName;

									}
								});
							})
						});
						//
						angular.forEach(listIndex,function(arr2){
							angular.forEach(data.Listdisplay,function(arr){
								angular.forEach(arr.List,function(arr1,index){
									if(arr1.DisplayGroupDetailId==arr2.DisplayGroupDetailId){
											arr.List.splice(index,1);
									}
								})
							})
						});

						data.hotelDisplay.sort(function(a,b) {
					    	return a.DisplayGroupPriority - b.DisplayGroupPriority;
						});
						$localStorage.displayGroup=data.hotelDisplay;
					}else{
						$localStorage.displayGroup=0;
						list=[];
						angular.forEach(data.Listdisplay,function(arr,index){
							var tmp={DisplayGroupCode:arr.DisplayGroupCode,DisplayGroupDesc:arr.DisplayGroupDesc,DisplayGroupId:arr.DisplayGroupId+"",List:[],allowedTypes:[arr.DisplayGroupCode],DisplayGroupPriority:index+1};
							list.push(tmp);
						});
						data.hotelDisplay=list;
					}
					callback(data);
				}).error(function (err) {
					$localStorage.displayGroup=0;
					dialogService.messageBox("ERROS", errors.toString().replace(",", "\n"));
				});
	}
	return{
		getHotelDisplay:function(callback){
				processHotelDisplay(function(data){
					if (callback){
						callback(data);		
					}		
				});
		},
		saveHotelDisplay:function(data,callback){
			var HotelDisplay = loginFactory.securedPostJSON("api/Config/saveHotelDisplay", data);
			$rootScope.dataLoadingPromise = HotelDisplay;
			HotelDisplay.success(function (data1) {
				if (callback)
					callback(data1);
			}).error(function (err) {
				dialogService.messageBox("ERROS", errors.toString().replace(",", "\n"));
			});
		}
	}
}]);