ezCloud.factory("walkInService", ['$http', 'loginFactory', '$rootScope', '$sessionStorage', '$location', 'dialogService', '$q', '$interval', '$timeout', '$filter', '$log',
function ($http, loginFactory, $rootScope, $sessionStorage, $location, dialogService, $q, $interval, $timeout, $filter, $log) {
    var reservationTimeline;
    var reservationGroup;
    //var startDateTimeline






    return {
        getReservationTimeline: function () {
            return reservationTimeline;
        },
        setReservationTimeline: function (reservation) {
            reservationTimeline = reservation;
        },
        getReservationGroup: function () {
            return reservationGroup;
        },
        setReservationGroup: function (reservation) {
            reservationGroup = reservation;
        },
    };
}]);