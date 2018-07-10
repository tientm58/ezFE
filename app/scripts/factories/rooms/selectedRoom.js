ezCloud.factory("selectedRoomFactory", ['$http', 'loginFactory', '$rootScope', function ($http, loginFactory, $rootScope) {
	var selectedRoom;
	var currentHotelConnectivities;
	var selectedRoomTL;
	var ViewType;
	var extraService;

	return {
		getSelectedRoomTimeline: function () {
			return selectedRoomTL;
		},
		setSelectedRoomTimeline: function (room) {
			selectedRoomTL = room;
		},
		getSelectedRoom: function () {
			return selectedRoom;
		},
		setSelectedRoom: function (room) {
			selectedRoom = room;
		},
		setExtraService: function (_extraService) {
			extraService = _extraService;
		},
		setCurrentHotelConnectivities : function (value) {
			currentHotelConnectivities = value;
		},
		getCurrentHotelConnectivities: function(){
			console.log("currentHotelConnectivities", currentHotelConnectivities);
			return currentHotelConnectivities;
		},
		getExtraService: function(){
			return extraService;
		},
		setViewType: function( value ){
			ViewType = value
		},
		getViewType: function(){
			return ViewType;
		}
	};

}]);