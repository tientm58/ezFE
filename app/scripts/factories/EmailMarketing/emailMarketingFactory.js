ezCloud.factory("EmailMarketingFactory", ['$state', '$http', 'loginFactory', '$rootScope', '$sessionStorage', '$location', 'dialogService', '$q', '$interval', '$timeout', '$filter', '$log', '$mdDialog',
    function ($state, $http, loginFactory, $rootScope, $sessionStorage, $location, dialogService, $q, $interval, $timeout, $filter, $log, $mdDialog) {
        //#region Properties
        var isUseEmailMarketing = true;
        var Types = [{
            id: "/img/arrivals.svg",
            title: 'PRE_ARRIVAL',
            typeId: 1,
            value: 'avatar-1',
            schedule: [{
                id: 1,
                name: 'BEFORE_ARRIVAL_DATE'
            }, {
                id: 2,
                name: 'AFTER_RESERVATION_DATE'
            }]
        }, {
            id: "/img/arrivals.svg",
            title: 'POST_DEPARTURE',
            typeId: 2,
            value: 'avatar-2',
            schedule: [{
                id: 3,
                name: 'DAYS_OF_DEPARTURE'
            }]
        }, {
            id: "/img/hotels.svg",
            title: 'IN-HOUSE',
            typeId: 3,
            value: 'avatar-3',
            schedule: [{
                id: 4,
                name: 'DAYS_OF_ARRIVAL'
            }]
        }, {
            id: "/img/icons/ic_cake_48px.svg",
            title: 'BIRTHDAY',
            typeId: 4,
            value: 'avatar-4',
            schedule: [{
                id: 5,
                name: 'BIRTHDAY'
            }]
        }/* , {
            id: "/img/promotion.svg",
            title: 'PROMOTION_OFFERS',
            typeId: 5,
            value: 'avatar-5',
            schedule: null
        } */];

        var TypeStatus = [{
                id: 0,
                name: ''
            },
            {
                id: 1,
                name: 'BEFORE_ARRIVAL_DATE'
            },
            {
                id: 2,
                name: 'AFTER_RESERVATION_DATE'
            },
            {
                id: 3,
                name: 'DAYS_OF_DEPARTURE'
            },
            {
                id: 4,
                name: 'DAYS_OF_ARRIVAL'
            },
            {
                id: 5,
                name: 'BIRTHDAY'
            },
        ];

        var Schedule = [{
            id: "/img/icons/ic_schedule_48px.svg",
            title: 'SCHEDULE',
            typeId: 1,
            value: 'avatar-1',
        }, {
            id: "/img/icons/ic_archive_48px.svg",
            title: 'SAVE_FOR_LATER',
            typeId: 2,
            value: 'avatar-2'
        }];
        //#endregion

        return {
            getTypes: function () {
                return Types;
            },
            getTypeStatus: function () {
                return TypeStatus;
            },
            getSchedule: function () {
                return Schedule;
            },
            getLogsEmail: function (ReservationId, callback, callback2) {
                if (!isUseEmailMarketing ){
                    if (callback2) {
                        callback2();
                        return 0;
                    }
                }
                var searchPromise = loginFactory.securedGet("api/EmailMarketing/GetEmailLogsByReservationId", "ReservationId=" + ReservationId);
                $rootScope.dataLoadingPromise = searchPromise;
                searchPromise.success(function (data) {
                    if (data.hotelEmailModule != null) {
                        var result = [];
                        var failEmail = 0;
                        if (data.listLogEmail != null) {
                            data.listLogEmail.forEach(function (val, key) {
                                var lastItem = val[val.length - 1];
                                lastItem.count = val.length;
                                failEmail += (lastItem.Status == -1) ? 1 : 0;
                                result.push(lastItem);
                            }, this);
                        }

                        if (callback) callback({
                            failEmail: failEmail,
                            result: result
                        });
                    } else {
                        isUseEmailMarketing = false;
                        if (callback2) {
                            callback2();
                        }
                    }
                }).error(function (err) {
                    console.info(err);
                })
            },

            getLogsEmailByRR: function (ReservationRoomId, callback, callback2) {
                if (!isUseEmailMarketing) {
                    if (callback2) {
                        callback2();
                        return 0;
                    }
                }
                var searchPromise = loginFactory.securedGet("api/EmailMarketing/GetEmailLogsByReservationRoomId", "ReservationRoomId=" + ReservationRoomId);
                $rootScope.dataLoadingPromise = searchPromise;
                searchPromise.success(function (data) {
                    if (data.hotelEmailModule != null) {
                        var result = [];
                        var failEmail = 0;
                        if (data.listLogEmail != null) {
                            data.listLogEmail.forEach(function (val, key) {
                                var lastItem = val[val.length - 1];
                                lastItem.count = val.length;
                                failEmail += (lastItem.Status == -1) ? 1 : 0;
                                result.push(lastItem);
                            }, this);
                        }

                        if (callback) callback({
                            failEmail: failEmail,
                            result: result
                        });
                    } else {console.log("callllllllllllllllllllllllllllllllll o")
                        isUseEmailMarketing = false;
                        if (callback2) {
                            callback2();
                        }
                    }
                }).error(function (err) {
                    console.info(err);
                })
            },
            DialogSuggest: function (isBackToPayment) {
                $mdDialog.show({
                    controller: DialogController,
                    templateUrl: 'views/templates/EMSuggest.tmpl.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: false
                }).then(function () {
                    //   if (isBackToPayment == true){ 
                    $state.transitionTo("modulePaymentManagement");
                    //   }
                });

                function DialogController($scope, $mdDialog) {
                    $scope.cancel = function () {
                        $mdDialog.hide();
                    };
                }
            },
            doDetailLogsByTask: function (request) {
                var data = JSON.stringify(request);
                console.log(data, "leo nguyen ahihi")
                localStorage.toSearchLogsEMKT = data;
                window.open("/#/emailLogs");
            },
            getContentEmailPreview: function (request, type, callback){
                var getAvailableRoomsPromise = loginFactory.securedPostJSON("api/EmailMarketing/GetContentEmail", request);
                $rootScope.dataLoadingPromise = getAvailableRoomsPromise;
                getAvailableRoomsPromise.success(function (data) {
                    if ( callback ){
                        callback(data, type);
                    }
                }).error(function (err) {
                    if (callback) {
                        callback("");
                    }
                });
            },
            reSendEamil: function (HotelLogId, callback) {
                var searchPromise = loginFactory.securedGet("api/EmailMarketing/reSendEmail", "logId=" + HotelLogId);
                $rootScope.dataLoadingPromise = searchPromise;
                searchPromise.success(function (data) {
                    if (callback) {
                        callback();
                    }
                }).error(function (err) {
                    dialogService.toastWarn("ERROR");
                })
            }
        }

    }
]);