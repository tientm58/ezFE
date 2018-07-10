ezCloud.controller('dashboardConfigController', ['$scope', '$rootScope', '$state', 'dialogService', '$localStorage', '$http', '$sessionStorage', 'loginFactory', '$mdDialog', 'flowFactory', '$filter', '$log', '$mdSidenav', '$mdMedia', 'configFactory', '$q', '$location', 
			function ($scope, $rootScope, $state, dialogService, $localStorage, $http, $sessionStorage, loginFactory, $mdDialog, flowFactory, $filter, $log, $mdSidenav, $mdMedia, configFactory, $q, $location) {	

	$scope.items = [
		{
			img:'owner.png',
			url:'/config/HotelOwnerInfo',
			title:'HOTEL_OWNER_INFORMATION',
			detail:'DETAIL_INFOR_OWNER_DASHBOARDCONFIG'
		},
		{
			img:'elevator.png',
			url:'/config/configFloorList',
			title:'FLOOR_LIST',
			detail:'DETAIL_FLOOR_LIST_DASHBOARDCONFIG'
		},
		{
			img:'employ.png',
			url:'/config/Staff',
			title:'STAFF_LIST',
			detail:'DETAIL_STAFF_LIST_DASHBOARDCONFIG'
		},
		{
			img:'hotel.png',
			url:'/config/HotelInfo',
			title:'HOTEL_INFORMATION',
			detail:'DETAIL_INFOR_HOTEL_DASHBOARDCONFIG'
		},
		{
			img:'room.png',
			url:'/config/RoomList',
			title:'ROOM_LIST',
			detail:'DETAIL_ROOM_LIST_DASHBOARDCONFIG'
		},
		{
			img:'system.png',
			url:'/config/System',
			title:'SYSTEM',
			detail:'DETAIL_SYSTEM_DASHBOARDCONFIG'
		},
		{
			img:'room_type.png',
			url:'/config/RoomType',
			title:'ROOM_TYPE',
			detail:'DETAIL_ROOM_TYPE_DASHBOARDCONFIG'
		},
		{
			img:'extend.png',
			url:'/config/ExtraServices',
			title:'EXTRA_SERVICES',
			detail:'DETAIL_EXTRA_SERVICE_DASHBOARDCONFIG'
		},
		{
			img:'marketing.png',
			url:'/config/Business',
			title:'Marketing',
			detail:'DETAIL_MARKETING_DASHBOARDCONFIG'
		}
	]

	$scope.logTo = function(url){
		$location.url(url);
	}
	
}]);
