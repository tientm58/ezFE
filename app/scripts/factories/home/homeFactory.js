ezCloud.factory("homeFactory", ['$http', 'loginFactory', '$rootScope', '$mdDialog', 'dialogService', '$q','$filter','$mdMedia','smartCardFactory','reservationFactory', function($http, loginFactory, $rootScope, $mdDialog, dialogService, $q,$filter,$mdMedia,smartCardFactory,reservationFactory) {
    var homeData = null;
    var selectedRoom = null;
    var homeFactory = {
        getHomeData: function(){
            return homeData;
        },
        setHomeData: function(_homeData){
            homeData = _homeData;
        },
        getSelectedRoom: function(){
            return selectedRoom;
        },
        setSelectedRoom: function(_selectedRoom){
            selectedRoom = _selectedRoom;
        },
        rebuildSelectedRoom: function(_selectedRoom){
            console.info("_selectedRoom", _selectedRoom);
            var selectedRoom = null;
            if (_selectedRoom.reservationRoom != null){
                rrTemp = _selectedRoom.reservationRoom;
                selectedRoom = {
                    ReservationRoomId: rrTemp.ReservationRoomId,
                    BookingStatus: rrTemp.BookingStatus,
                    ArrivalDate: rrTemp.ArrivalDate,
                    DepartureDate: rrTemp.DepartureDate,
                    Price: rrTemp.Price,
                    Adults: rrTemp.Adults,
                    Child: rrTemp.Child,
                    HotelId: rrTemp.HotelId,
                    RoomId: rrTemp.RoomId,
                    RoomPriceId: rrTemp.RoomPriceId,
                    RoomTypeId: rrTemp.RoomTypeId,
                    TravellerId: rrTemp.TravellerId,
                    ReservationId: rrTemp.Reservations.ReservationId,
                    ReservationNumber: rrTemp.ReservationNumber,
                    ReservationTravellersList: rrTemp.TravellersList,
                    RoomExtraServiceItemsList: rrTemp.RoomExtraServiceItemsList,
                    RoomExtraServicesList: rrTemp.RoomExtraServicesList,
                    RoomName: rrTemp.RoomName,
                    RoomType: rrTemp.RoomType,
                    Travellers: rrTemp.Travellers,
                    PaymentsList: rrTemp.PaymentsList
                }
            }
            return selectedRoom;
        }
        
    };
    return homeFactory;
}]);