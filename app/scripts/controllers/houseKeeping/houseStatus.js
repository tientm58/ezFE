var lastTimelineDrag;
var currentScope;
var testView;
var dateUR;
var startDate;
var schedulerDataok;
var showItemmenuTimeline;
var showItemMenu;
var GlobalEvent;
var Opscheduler;
var isViewTypeDate = true;
var listColor;
var getDataRoomRepair;
var listUnassignRoom = null;
var listRooms = null;
var membellCheck = null;
ezCloud.controller('houseStatusController', ['SharedFeaturesFactory','frontOfficeFactory', '$filter', '$scope', '$rootScope', '$mdBottomSheet', 'roomListFactory', 'selectedRoomFactory', '$location', '$state', 'reservationFactory', 'dialogService', 'loginFactory', '$mdDialog', '$localStorage', '$mdMedia', '$http', 'currentHotelConnectivities', 'smartCardFactory', '$q', 'walkInFactory',
    function (SharedFeaturesFactory, frontOfficeFactory, $filter, $scope, $rootScope, $mdBottomSheet, roomListFactory, selectedRoomFactory, $location, $state, reservationFactory, dialogService, loginFactory, $mdDialog, $localStorage, $mdMedia, $http, currentHotelConnectivities, smartCardFactory, $q, walkInFactory) {
        window.kendo.effects.disable();
        getDataRoomRepair = null;
        listUnassignRoom = null;
        schedulerDataok = null;
        // $scope.isViewDate = false;
        if ($localStorage.isViewDate) {
            $scope.isViewDate = $localStorage.isViewDate;
        } else {
            $localStorage.isViewDate = false;
            $scope.isViewDate = false;
        }
        $scope.tranferViewDate = function () {
            if ($scope.isViewDate) {
                $scope.isViewDate = false;
            } else {
                $scope.isViewDate = true;
            }
            $localStorage.isViewDate = $scope.isViewDate;


            // console.log("membell check tranferViewDate", $scope.isViewDate);
            $scope.Init();
        }
        var currentDate;
        var currentView;
        currentScope = $scope;
        $scope.$mdMedia = $mdMedia;
        $scope.bookingStatusMapping = {
            BOOKED: "ic_event_available_24px.svg",
            CHECKIN: "ic_local_hotel_24px.svg",
            OVERDUE: "ic_restore_24px.svg",
            AVAILABLE: "ic_check_circle_24px.svg", //CANCELLED: "ic_event_busy_24px.svg"
            NOSHOW: "ic_event_busy_24px.svg"
        };

        $scope.houseStatusMapping = {
            DIRTY: "ic_report_problem_24px.svg",
            REPAIR: "ic_format_paint_24px.svg",
        }

        $rootScope.title = "HOME";
        $scope.timerRunning = true;

        $scope.page = {
            room_filter: ''
        };

        var rooms;
        var roomById = {};
        var lastEvent;
        //  if ($localStorage.viewType)
        //      $scope.viewType = $localStorage.viewType;
        //  else {
        //      $scope.viewType = "DETAIL";
        //  }
        $scope.viewType = "DETAIL";

        if ($rootScope.previousState != null && $rootScope.previousState == "hotelSelect") {
            location.reload();;

        } else {
            Init();
        }



        $scope.minRepairDate = new Date(1970, 0, 1, 12, 0, 0).toLocaleString();
        $scope.maxRepairDate = new Date(9999, 0, 1, 12, 0, 0).toLocaleString();
        $rootScope.$watchCollection("pageInit", function (oldValue, newValue) {
            if (oldValue === true) {
                //Init();
                $state.go($state.current, {}, {
                    reload: true
                });
                $rootScope.pageInit = false;
            }
        });

        $scope.changeViewType = function (status) {
            $scope.viewType = status;
            //  $localStorage.viewType = status;

            if (status == "TIMELINE") {
                initTimelineView(new Date());
            } else {
                $scope.menuItems = [{
                    name: "",
                    quantity: countByStatus(""),
                    color: null,
                    icon: "ic_view_module_24px.svg"
                }, {
                    name: "AVAILABLE",
                    quantity: countByStatus("AVAILABLE"),
                    color: $scope.statusColors['AVAILABLE'],
                    icon: "ic_check_circle_24px.svg"
                }, {
                    name: "CHECKIN",
                    quantity: countByStatus("CHECKIN"),
                    color: $scope.statusColors['CHECKIN'],
                    icon: "ic_local_hotel_24px.svg"
                }, {
                    name: "OVERDUE",
                    quantity: countByStatus("OVERDUE"),
                    color: $scope.statusColors['OVERDUE'],
                    icon: "ic_restore_24px.svg"
                }, {
                    name: "NOSHOW",
                    quantity: countByStatus("NOSHOW"),
                    color: $scope.statusColors['NOSHOW'],
                    icon: "ic_event_busy_24px.svg"
                }, {
                    name: "DIRTY",
                    quantity: countByStatus("DIRTY"),
                    color: $scope.statusColors['DIRTY'],
                    icon: "ic_report_problem_24px.svg"
                }, {
                    name: "REPAIR",
                    quantity: countByStatus("REPAIR"),
                    color: $scope.statusColors['REPAIR'],
                    icon: "ic_format_paint_24px.svg"
                }];

                $scope.Init();

            }
        };
        //Init timeline view
        var firstTimeTimelineInit = false;
        var timelineWeek = true;
        var timelineTwoWeek = false;
        var timelineMonth = false;
        var timeline = false;

        function initTimelineView(inputDate, viewType) {

            if ($localStorage.timelineType != undefined && $localStorage.timelineType != null) {
                if (viewType != null && viewType != undefined) {
                    $localStorage.timelineType = viewType;
                } else {
                    viewType = $localStorage.timelineType;
                }
                //
                if ($localStorage.timelineType == $filter("translate")("TWO_WEEK_VIEW")) {
                    timelineTwoWeek = true;
                    timelineWeek = false;
                    timelineMonth = false;
                } else if ($localStorage.timelineType == $filter("translate")("WEEK_VIEW")) {

                    timelineTwoWeek = false;
                    timelineWeek = true;
                    timelineMonth = false;
                } else if ($localStorage.timelineType == $filter("translate")("MONTH_VIEW")) {

                    timelineTwoWeek = false;
                    timelineWeek = false;
                    timelineMonth = true;
                };
            } else {
                viewType = "timelineWeek";
                $localStorage.timelineType = "timelineWeek";
                timelineTwoWeek = false;
                timelineWeek = true;
                timelineMonth = false;

            }
            lastTimelineDrag = null;
            firstTimeTimelineInit = true;
            if (!inputDate)
                inputDate = new Date();
            //calculate start date
            if (!viewType)
                viewType = "timelineWeek";
            var duration = 7; //$localStorage.timelineDuration;
            var tmpViewTypeMonth = $filter("translate")("MONTH_VIEW");
            var tmpViewTypeWeek = $filter("translate")("WEEK_VIEW");
            var tmpViewTypeTwoWeek = $filter("translate")("TWO_WEEK_VIEW");
            switch (viewType) {
                case tmpViewTypeWeek:
                    inputDate = new Date(inputDate.getTime() - inputDate.getDay() * 1000 * 3600 * 24);
                    duration = 7;
                    break;
                case tmpViewTypeTwoWeek:
                    inputDate = new Date(inputDate.getTime() - inputDate.getDay() * 1000 * 3600 * 24);
                    duration = 14;
                    break;
                case tmpViewTypeMonth:
                    inputDate = new Date(inputDate.getFullYear(), inputDate.getMonth(), 1);
                    duration = 31;
                    break;
            };
            $scope.durationTimeLine = duration;
            if ($localStorage.startDateTL != null && $localStorage.startDateTL != undefined) {
                inputDate = new Date($localStorage.startDateTL);
            } else {
                $localStorage.startDateTL = inputDate;
            }
            //
            var timelineMonthType = kendo.ui.TimelineMonthView.extend({
                options: {
                    name: "timelineMonthType",
                    title: "Month"
                },
                name: "timelineMonthType",
                nextDate: function () {
                    return kendo.date.nextDay(this.startDate());
                },
                calculateDateRange: function () {
                    //create a range of dates to be shown within the view
                    var start = this.options.date,
                        idx, length,
                        dates = [];
                    for (idx = 0, length = 31; idx < length; idx++) {
                        dates.push(start);
                        start = kendo.date.nextDay(start);
                    }
                    this._render(dates);
                },
            });
            var timelineWeekType = kendo.ui.TimelineWeekView.extend({
                options: {
                    name: "timelineweek",
                    title: "timelineweek",
                },
                nextDate: function () {
                    return kendo.date.nextDay(this.startDate());
                },
                name: "timelineweek",
                calculateDateRange: function () {
                    //create a range of dates to be shown within the view
                    var start = this.options.date,
                        idx, length,
                        dates = [];
                    for (idx = 0, length = 7; idx < length; idx++) {
                        dates.push(start);
                        start = kendo.date.nextDay(start);
                    };
                    this._render(dates);
                },
            });

            var timelineTwoWeekType = kendo.ui.TimelineWeekView.extend({
                options: {
                    name: "timelinetwoweek",
                    title: "timelinetwoweek",
                },
                nextDate: function () {
                    return kendo.date.nextDay(this.startDate());
                },
                name: "timelinetwoweek",
                calculateDateRange: function () {
                    //create a range of dates to be shown within the view
                    var start = this.options.date,
                        idx, length,
                        dates = [];
                    for (idx = 0, length = 14; idx < length; idx++) {
                        dates.push(start);
                        start = kendo.date.nextDay(start);
                    };
                    this._render(dates);
                },
            });
            //
            var date = new Date(inputDate).format("yyyy-mm-dd");
            var promise = loginFactory.securedGet("api/Room/RoomTimeline", $.param({
                date: date,
                duration: duration
            }));
            $rootScope.dataLoadingPromise = promise;
            promise.success(function (datareceived) {
                console.time('TIMELINE');
                // console.log('datareceived:', datareceived);
                $scope.theContent = kendo.template($("#template").html());
                var data = datareceived.reservationRooms;
                var ReservationTravellerExtraInformation = datareceived.ReservationTravellerExtraInformation;
                // console.log('ReservationTravellerExtraInformation:', ReservationTravellerExtraInformation);
                listColor = datareceived.statusColors;
                datareceived.roomBookingList = {};
                var roomType = datareceived.roomTypes;
                var priceRateList = datareceived.planList;
                var roomBookingList = datareceived.roomBookingList;
                var allrooms = datareceived.rooms;
                var colors = rooms.statusColors;
                $scope.rooms = datareceived.rooms;
                for (var idx in datareceived.rooms) {
                    if (datareceived.BookingList)
                        datareceived.roomBookingList[datareceived.rooms[idx].RoomId] = datareceived.BookingList.filter(function (item) {
                            return item.RoomId == datareceived.rooms[idx].RoomId;
                        });
                    else
                        datareceived.roomBookingList[datareceived.rooms[idx].Room.RoomId] = null;
                }
                for (var idx in data) {
                    var reservation = data[idx];
                    console.log('reservation:', reservation);
                    reservation.AdultsMax = 0;
                    reservation.ChildMax = 0;

                    reservation.AdultsReal = 0;
                    reservation.ChildReal = 0;
                    if (ReservationTravellerExtraInformation != null) {

                        reservation.AdultsReal = ReservationTravellerExtraInformation.filter(function (item) {
                            return (item.ReservationRoomId == reservation.ReservationRoomId && item.IsChild == false);
                        }).length;

                        reservation.AdultsMax = reservation.AdultsReal > reservation.Adults ? reservation.AdultsReal : reservation.Adults;



                        reservation.ChildReal = ReservationTravellerExtraInformation.filter(function (item) {
                            return (item.ReservationRoomId == reservation.ReservationRoomId && item.IsChild == true);
                        }).length;

                        reservation.ChildMax = reservation.ChildReal > reservation.Child ? reservation.ChildReal : reservation.Child;


                    }
                    if (datareceived.RelatedPayments != null)
                        reservation.PaymentsList = datareceived.RelatedPayments.filter(function (item) {
                            return (item.ReservationRoomId == reservation.ReservationRoomId)
                        });
                    else
                        reservation.PaymentsList = null;
                    if (datareceived.RoomMoves != null)
                        reservation.RoomMoveList = datareceived.RoomMoves.filter(function (item) {
                            return item.ReservationRoomId == reservation.ReservationRoomId
                        });
                    else
                        reservation.RoomMoveList = null;

                    if (datareceived.RoomExtraServiceItemsList != null)
                        reservation.RoomExtraServiceItemsList = datareceived.RoomExtraServiceItemsList.filter(function (item) {
                            return item.ReservationRoomId == reservation.ReservationRoomId
                        });
                    else
                        reservation.RoomExtraServiceItemsList = null;

                    if (datareceived.RoomExtraServicesList != null)
                        reservation.RoomExtraServicesList = datareceived.RoomExtraServicesList.filter(function (item) {
                            return item.ReservationRoomId == reservation.ReservationRoomId
                        });
                    else
                        reservation.RoomExtraServicesList = null;

                }
                datareceived.unassignRoom = data.filter(function (item) {
                    return item.RoomId == null && item.BookingStatus == "BOOKED";
                });
                for (var idx in datareceived.unassignRoom) {
                    var unres = datareceived.unassignRoom[idx];
                    if (unres.ArrivalDate) {
                        unres.ArrivalDate = new Date(unres.ArrivalDate)
                    }
                    if (unres.DepartureDate) {
                        unres.DepartureDate = new Date(unres.DepartureDate)
                    }
                    if (unres.CreatedDate) {
                        unres.CreatedDate = new Date(unres.CreatedDate)
                    }
                    unres.roomBookingList = null;
                }
                $scope.UnassignRoom = datareceived.unassignRoom;

                var schedulerData = new kendo.data.ObservableArray([]);
                //room move list
                var roomMoveList = [];
                for (var idx in data) {

                    var res = angular.copy(data[idx]);

                    if (res.RoomMoveList !== null && res.RoomMoveList.length > 0) {
                        var moveListTemp = [];
                        var firstElement = {
                            Start: new Date(res.ArrivalDate),
                            End: new Date(res.RoomMoveList[0].MoveDate),
                            Description: res.RoomMoveList[0].Description,
                            roomId: res.RoomMoveList[0].OldRoomId
                        };

                        moveListTemp.push(firstElement);
                        for (var i = 0; i < res.RoomMoveList.length - 1; i++) {
                            var element = {
                                Start: new Date(res.RoomMoveList[i].MoveDate),
                                End: new Date(res.RoomMoveList[i + 1].MoveDate),
                                Description: res.RoomMoveList[i + 1].Description,
                                roomId: res.RoomMoveList[i + 1].OldRoomId
                            }
                            moveListTemp.push(element);
                        }
                        if (res.RoomMoveList.length >= 1) {
                            var lastIndex = res.RoomMoveList.length - 1;
                            var lastElement = {
                                Start: new Date(res.RoomMoveList[lastIndex].MoveDate),
                                End: new Date(res.DepartureDate)
                            }
                            moveListTemp.push(lastElement);
                        }
                        roomMoveList[res.ReservationRoomId] = moveListTemp;
                    }
                    //
                    var CompanyCode = "";
                    if ((res.hasOwnProperty("Company")) && res.Company != null) {
                        if ((res.Company.CompanyCode != null)) {
                            CompanyCode = res.Company.CompanyCode + " - ";
                        }
                    }

                    res.title = CompanyCode + res.Travellers.Fullname;
                    //console.log('hello ' + res.title);
                    var tmpArrivalDate = null;
                    var isMove = false;
                    //check room move
                    if (roomMoveList[res.ReservationRoomId] != undefined) {
                        if (res.BookingStatus == "CHECKIN" || res.BookingStatus == "CHECKOUT") {
                            var list = roomMoveList[res.ReservationRoomId];
                            angular.forEach(list, function (arr, index) {
                                if (index < list.length - 1) {
                                    var newRoomMove = {};
                                    newRoomMove.IsGroupMaster = false;
                                    newRoomMove.IsGroup = false;
                                    newRoomMove.roomMove = true;
                                    newRoomMove.id = res.ReservationRoomId;
                                    newRoomMove.Note = arr.Description;
                                    newRoomMove.roomId = arr.roomId;

                                    //set view type date
                                    var tmpArrival = new Date(arr.Start.getTime());
                                    var tmpDeparture = new Date(arr.End.getTime());
                                    if ($scope.isViewDate) {
                                        tmpArrival.setHours(0);
                                        tmpArrival.setMinutes(0);
                                        tmpDeparture.setHours(0);
                                        tmpDeparture.setMinutes(0);
                                    }

                                    newRoomMove.ArrivalDate = arr.Start;
                                    newRoomMove.DepartureDate = arr.End;
                                    newRoomMove.roomRepairId = 0;
                                    newRoomMove.BookingStatus = "CHECKOUT";
                                    newRoomMove.color = colors['CHECKOUT'];
                                    newRoomMove.title = CompanyCode + res.Travellers.Fullname + " >>";
                                    newRoomMove.start = "/Date(" + tmpArrival.getTime() + ")/";
                                    newRoomMove.end = "/Date(" + tmpDeparture.getTime() + ")/";
                                    schedulerData.push(new kendo.data.SchedulerEvent(newRoomMove));
                                }
                            });
                            res.title = ">> " + res.title;
                            if ($scope.isViewDate) {
                                var tmpdate = new Date(list[list.length - 1].Start);
                                tmpdate.setHours(0);
                                tmpdate.setMinutes(0);
                                tmpArrivalDate = tmpdate;
                            } else {
                                tmpArrivalDate = new Date(list[list.length - 1].Start);
                            }

                            isMove = true;
                        }
                    }
                    res.ArrivalDate = new Date(res.ArrivalDate);
                    res.DepartureDate = new Date(res.DepartureDate);
                    if (res.DepartureDate < new Date()) {
                        if (res.BookingStatus == "CHECKIN")
                            res.BookingStatus = "OVERDUE";
                    }
                    if (res.ArrivalDate < new Date()) {
                        if (res.BookingStatus == "BOOKED") {
                            res.BookingStatus = "NOSHOW";
                        }
                    }
                    res.roomMove = false;
                    res.id = res.ReservationRoomId;
                    res.roomId = res.RoomId;
                    if (!res.Note)
                        res.Note = "";
                    res.color = colors[res.BookingStatus];
                    if (tmpArrivalDate != null) {
                        // tmpArrivalDate.setHours(0);
                        var tmpArrival = new Date(tmpArrivalDate.getTime());
                        res.ArrivalDate = tmpArrival;
                    } else {
                        // res.ArrivalDate.setHours(0);
                        var tmpArrival = new Date(res.ArrivalDate.getTime());
                    }
                    if ($scope.isViewDate) {
                        var tmpdate = new Date(res.DepartureDate.getTime());
                        tmpdate.setHours(0);
                        tmpdate.setMinutes(0);
                        var tmpEnd = tmpdate;
                    } else {
                        var tmpEnd = new Date(res.DepartureDate.getTime());
                    }


                    res.startOk = tmpArrival.getTime();
                    res.endOk = tmpEnd.getTime();

                    //set view type date
                    if ($scope.isViewDate && !isMove) {
                        tmpArrival.setHours(0);
                        tmpArrival.setMinutes(0);
                        if (tmpArrival.getDate() == tmpEnd.getDate() && tmpArrival.getMonth() == tmpEnd.getMonth() && tmpArrival.getFullYear() == tmpEnd.getFullYear()) {
                            tmpEnd.setHours(23);
                            tmpEnd.setMinutes(59);
                        } else {
                            tmpEnd.setHours(0);
                            tmpEnd.setMinutes(0);
                        }
                    }

                    res.start = "/Date(" + tmpArrival.getTime() + ")/";
                    res.end = "/Date(" + tmpEnd.getTime() + ")/";

                    res.isAllDay = false;
                    res.roomRepairId = 0;



                    res.HouseStatus = null;
                    for (var idx in allrooms) {
                        if (allrooms[idx].RoomId == res.RoomId) {
                            res.RoomName = allrooms[idx].RoomName;
                            //
                            if (allrooms[idx].HouseStatus != null && res.BookingStatus == "CHECKIN" || res.BookingStatus == "OVERDUE") {
                                res.HouseStatus = allrooms[idx].HouseStatus;
                            }
                            break;
                        }
                    }
                    res.roomType = res.RoomTypes;
                    res.RoomTypeId = res.roomType.RoomTypeId;
                    for (var idx in roomType) {
                        if (roomType[idx].RoomTypeId == res.roomType.RoomTypeId) {
                            res.RoomPriceName = roomType[idx].RoomPriceName;
                            res.roomType.RoomTypeName = roomType[idx].RoomTypeName;
                            break;
                        }
                    }
                    tmpRes = angular.copy(res);
                    res.reservationRoom = tmpRes;
                    res.roomBookingList = {
                        NextReservation: [],
                        PreviousReservation: []
                    };
                    //
                    var maxD = 0;
                    var minA = 0;
                    for (var idx2 in roomBookingList) {

                        if (idx2 == res.RoomId && roomBookingList[idx2].length > 0) {
                            for (var index in roomBookingList[idx2]) {
                                booking = roomBookingList[idx2][index];
                                if (booking.ReservationRoomId != res.ReservationRoomId) {
                                    console.log(booking);
                                    var tmpArrival = new Date(booking.ArrivalDate);
                                    var tmpDeparture = new Date(booking.DepartureDate);


                                    booking.ArrivalDate = tmpArrival;
                                    booking.DepartureDate = tmpDeparture;



                                    if (res.DepartureDate <= booking.ArrivalDate) {
                                        if (minA == 0 || minA >= booking.ArrivalDate.getTime()) {
                                            minA = booking.ArrivalDate.getTime();
                                            res.roomBookingList.NextReservation[0] = booking;
                                        }
                                    } else if (maxD < booking.DepartureDate.getTime()) {

                                        maxD = booking.DepartureDate.getTime();
                                        res.roomBookingList.PreviousReservation[0] = booking;
                                    }
                                };

                            }



                        }
                    };
                    console.log(res);
                    schedulerData.push(new kendo.data.SchedulerEvent(res));
                };
                console.log(schedulerData);
                //repair room
                var allRoomRepairs = datareceived.roomList;
                $scope.allRoomRepairs = datareceived.roomList;
                if (allRoomRepairs != null && allRoomRepairs.length > 0) {
                    angular.forEach(allRoomRepairs, function (arr) {
                        if (arr.RoomRepairList && arr.RoomRepairList.length > 0) {
                            for (var index in arr.RoomRepairList) {
                                var repair = arr.RoomRepairList[index];
                                if (repair.IsDeleted == false) {
                                    if (repair.RepairStartDate != null) {
                                        repair.RepairStartDate = new Date(repair.RepairStartDate);
                                    } else {
                                        repair.RepairStartDate = new Date();
                                    }

                                    if (repair.RepairEndDate != null) {
                                        repair.RepairEndDate = new Date(repair.RepairEndDate);
                                    } else {
                                        repair.RepairEndDate = new Date();
                                    }
                                    var roomRepair = {};
                                    roomRepair.roomRepairId = repair.RoomRepairId;
                                    roomRepair.RepairStartDate = repair.RepairStartDate;
                                    roomRepair.RepairEndDate = repair.RepairEndDate;
                                    roomRepair.RepairReason = repair.RepairReason;
                                    roomRepair.color = $scope.statusColors['REPAIR'];

                                    //set view type date
                                    var tmpArrival = new Date(roomRepair.RepairStartDate.getTime());
                                    var tmpDeparture = new Date(roomRepair.RepairEndDate.getTime());
                                    if ($scope.isViewDate) {
                                        tmpArrival.setHours(0);
                                        tmpArrival.setMinutes(0);
                                        tmpDeparture.setHours(23);
                                        tmpDeparture.setMinutes(59);
                                    }


                                    roomRepair.start = "/Date(" + tmpArrival.getTime() + ")/";
                                    roomRepair.end = "/Date(" + tmpDeparture.getTime() + ")/";
                                    //
                                    roomRepair.IsGroupMaster = false;
                                    roomRepair.IsGroup = false;
                                    roomRepair.roomMove = false;
                                    roomRepair.HouseStatus = "REPAIR";
                                    roomRepair.isAllDay = false;
                                    roomRepair.roomId = repair.RoomId;
                                    roomRepair.RoomName = arr.Room.RoomName;
                                    roomRepair.BookingStatus = null;
                                    roomRepair.title = "REPAIR";
                                    datareceived.reservationRooms.push({
                                        roomName: repair.RoomName,
                                        HouseStatus: "REPAIR",
                                        ArrivalDate: repair.RepairStartDate,
                                        DepartureDate: repair.RepairEndDate
                                    });
                                    schedulerData.push(new kendo.data.SchedulerEvent(roomRepair));
                                }
                            }
                        }
                    });
                }

                schedulerDataok = schedulerData;

                $scope.timelineData = data;
                $scope.schedulerData = schedulerData;
                var RoomInfo = [];
                for (var idx in allrooms) {
                    var room = {
                        value: allrooms[idx].RoomId,
                        text: allrooms[idx].RoomName
                    };
                    roomById[allrooms[idx].RoomId] = allrooms[idx];
                    RoomInfo.push(room);
                }
                // console.log('RoomInfo:', RoomInfo);
                listRooms = RoomInfo;
                $scope.RoomInfo = RoomInfo;
                var today = inputDate;
                today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                startDate = today;
                listUnassignRoom = null;


                setTimeout(function () {
                    jQuery("#wrap_scheduler").html('<div ng-click="autoScrollTop()" id="scheduler"></div>');
                    $("#scheduler").kendoScheduler({
                        // $scope.schedulerOptions = {
                        date: today,
                        startTime: today,
                        majorTick: 90,
                        editable: {
                            destroy: false,
                            resize: false,
                            confirmation: false,
                            create: false,
                            update: false
                        },
                        majorTimeHeaderTemplate: kendo.template("<strong>#=kendo.toString(date, 'HH:mm')#</strong>"),
                        save: scheduler_save,
                        selectable: true,
                        remove: scheduler_remove,
                        edit: scheduler_edit,
                        add: scheduler_add,
                        moveStart: scheduler_moveStart,
                        move: scheduler_move,
                        moveEnd: scheduler_moveEnd,
                        cancel: scheduler_cancel,
                        change: scheduler_change,
                        resizeStart: scheduler_resizeStart,
                        resize: scheduler_resize,
                        resizeEnd: scheduler_resizeEnd,
                        navigate: scheduler_navigate,
                        dataBinding: function (e) {
                            var view = this.view();
                            $scope.currentView = view;
                            console.log('Binding', view);
                            testView = view;
                            var now = new Date();
                            if (view.options.name != "TimelineView") {
                                var dateHeader = jQuery(view.datesHeader[0]);
                                var dtHeader = jQuery(view.timesHeader[0]);
                                var timeHeader = dateHeader.find(".k-scheduler-table tbody tr");
                                var time2Header = dtHeader.find(".k-scheduler-table tbody tr");
                                if (timeHeader[1]) {
                                    jQuery(timeHeader[1]).hide();
                                    jQuery(time2Header[1]).hide();
                                }
                                setTimeout(function () {
                                    var currentDate = now.format("dd/mm");
                                    var startDateTL = $localStorage.startDateTL;
                                    if (startDateTL != null) {
                                        currentDate = new Date(startDateTL).format("dd/mm");
                                    }
                                    var scrollToX = 0;
                                    if (view.datesHeader != null) {
                                        var $timeSlots = jQuery(view.datesHeader[0]).find("table.k-scheduler-table>tbody>tr>th:contains('" + currentDate + "')");
                                        console.log($timeSlots, currentDate, $timeSlots.position(), $timeSlots.offset());
                                        if (scrollToX = $timeSlots.position()) {
                                            scrollToX = $timeSlots.position().left;
                                            $("div.k-scheduler-content", "#scheduler").animate({
                                                scrollLeft: scrollToX - 0
                                            }, 0);
                                        }
                                    }
                                    var tmpClass = $localStorage.timelineType.split(" ");
                                    if (typeof (tmpClass[1]) == 'undefined') {
                                        jQuery(".k-view-" + tmpClass[0]).addClass("k-state-active");
                                    } else {
                                        if (tmpClass[1] == "view") {
                                            jQuery(".k-view-" + tmpClass[0].toLocaleLowerCase()).addClass("k-state-active");
                                        } else {
                                            jQuery("." + tmpClass[1]).addClass("k-state-active");
                                        }
                                    }

                                }, 200);
                            } else {
                                //scroll to current hour
                                setTimeout(function () {
                                    var currentHour = now.format("HH:00");
                                    var startDateTL = $localStorage.startDateTL;
                                    if (startDateTL != null) {
                                        currentHour = new Date(startDateTL).format("HH:00");
                                    }
                                    var scrollToX = 0;
                                    var $timeSlots = jQuery(view.datesHeader[0]).find("table.k-scheduler-table>tbody>tr>th:contains('" + currentHour + "')");

                                    if (scrollToX = $timeSlots.position()) {
                                        scrollToX = $timeSlots.position().left;
                                        $("div.k-scheduler-content", "#scheduler").animate({
                                            scrollLeft: scrollToX - 0
                                        }, 0);
                                    }
                                }, 200);
                            }

                            // Set padding cot so phong
                            var countTimelineColum = 1;
                            jQuery(".k-scheduler-table").each(function () {
                                if (countTimelineColum == 3) {
                                    jQuery(this).addClass("col-left-timeLine")
                                }
                                countTimelineColum++;
                            });

                            angular.element("#scheduler").bind("mouseup touchend", function (e) {
                                //list unassign room
                                setTimeout(function () {
                                    if (dateUR != null) {
                                        if (listUnassignRoom != null) {
                                            var tmpList = [];
                                            for (var i = listUnassignRoom.length - 1; i >= 0; i--) {
                                                if (typeof (tmpList[listUnassignRoom[i].ReservationRoomId]) == "undefined") {
                                                    tmpList[listUnassignRoom[i].ReservationRoomId] = 1;
                                                } else {
                                                    listUnassignRoom.splice(i, 1);
                                                }
                                            }
                                            if (listUnassignRoom.length > $scope.UnassignRoom.length) {
                                                $scope.UnassignRoom = listUnassignRoom;
                                            }
                                        } else {
                                            var tmpList = [];
                                            var tmpLists = []; //$scope.UnassignRoom;
                                            for (var i = $scope.UnassignRoom.length - 1; i >= 0; i--) {
                                                if (typeof (tmpList[$scope.UnassignRoom[i].ReservationRoomId]) == "undefined" && $scope.UnassignRoom[i].HouseStatus != "REPAIR") {
                                                    tmpList[$scope.UnassignRoom[i].ReservationRoomId] = 1;
                                                    tmpLists.push($scope.UnassignRoom[i]);
                                                } else {
                                                    // tmpLists.push( $scope.UnassignRoom[i] );
                                                    // tmpLists.splice(i, 1);
                                                }
                                            }
                                            $scope.UnassignRoom = tmpLists;
                                            listUnassignRoom = tmpLists;
                                        }
                                        var list_unassignRoom = [];
                                        angular.forEach($scope.UnassignRoom, function (arr) {
                                            var arrivalDate = new Date(arr.ArrivalDate);
                                            var departureDate = new Date(arr.DepartureDate);
                                            if (checkDateBetween(arr.ArrivalDate, arr.DepartureDate, dateUR)) {
                                                var date = new Date();
                                                if (date > arrivalDate) {
                                                    arr.BookingStatus = "NOSHOW";
                                                    arr.Color = $scope.statusColors['NOSHOW'];
                                                } else {
                                                    arr.Color = $scope.statusColors['BOOKED'];
                                                }
                                                //
                                                list_unassignRoom.push(arr);
                                            }
                                        });
                                        if (list_unassignRoom.length > 0) {
                                            setTimeout(function () {
                                                $scope.showUnassignRoom(list_unassignRoom, dateUR);
                                            }, 300);
                                        };
                                    }
                                    dateUR = null;

                                }, 150);
                                //process first
                                if (lastTimelineDrag && lastTimelineDrag != null && lastTimelineDrag.resources.roomId) {

                                    var dateNow = new Date();
                                    dateNow = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate());
                                    if (lastTimelineDrag.start >= dateNow && lastTimelineDrag.end >= dateNow) {
                                        var roomRepair = getDataRoomRepair(0, lastTimelineDrag.resources.roomId);
                                        if (roomRepair != null) {
                                            roomRepair.currentRoom.RepairStartDate = new Date(lastTimelineDrag.start);
                                            roomRepair.currentRoom.RepairEndDate = new Date(lastTimelineDrag.end);
                                        }
                                        var item = {
                                            roomId: lastTimelineDrag.resources.roomId,
                                            start: lastTimelineDrag.start,
                                            end: lastTimelineDrag.end,
                                            HouseStatus: lastTimelineDrag.HouseStatus,
                                            repair: roomRepair
                                        }
                                        $scope.showItemmenuTimeline(item);
                                    }
                                    lastTimelineDrag = null;
                                    var scheduler = $("#scheduler").data("kendoScheduler");
                                    scheduler._selection = null;

                                }
                            });

                            countUnassignRoom($scope.UnassignRoom, true);


                        },
                        dateHeaderTemplate: kendo.template("<strong class='day_#=kendo.toString(date, 'ddd')#' style='cursor:pointer' onclick='showUR(\"#=kendo.toString(date, 'ddMMyyyy')#\")' >#=kendo.toString(date, 'dd/MM')# <span id='#=kendo.toString(date, 'ddMMyyyy')#' style='color:red'></span></strong>"), //&nbsp;<span>#: kendo.toString(start, "dd/MM hh:mm") # - #: kendo.toString(end, "dd/MM hh:mm") #</span>
                        // eventTemplate: kendo.template('<div  class="custom-event room#:roomId #" id="#:roomId #" ng-click="showMenu(#:id #,#:roomId #,#:roomRepairId #,#:roomMove #)" style="background:#: color#" ><strong style="font-size:11px !important;">#: title #</strong># if (IsGroup) { # <img style="width:21px;height:21px !important;margin-top:-3px;float:left"  src="img/icons/ic_group_24px.svg" alt="Smiley face"> # } # # if (IsGroupMaster) {# <img style="width:21px;height:21px !important;margin-top:-3px;float:left;-webkit-filter: invert(100%);" src="img/icons/ic_flag_24px.svg" alt="Smiley face"> #} #</div>'),
                        eventTemplate: kendo.template('<div  class="custom-event room#:roomId #" id="#:roomId #" onclick="showMenu(#:id #,#:roomId #,#:roomRepairId #,#:roomMove #)" style="background:#: color#" ><strong style="font-size:11px !important;">#: title #</strong># if (IsGroup) { # <svg xmlns="http://www.w3.org/2000/svg" style="fill:#:GroupColor #;margin-top:-3px;float:left;" width="21" height="21" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg> # } # # if (IsGroupMaster) {# <img style="width:21px;height:21px !important;margin-top:-3px;float:left;-webkit-filter: invert(100%);" src="img/icons/ic_flag_24px.svg" alt="Smiley face"> #} #</div>'),
                        eventHeight: 20,
                        views: [{
                            //type: "timelineWeek"
                            type: timelineWeekType,
                            majorTick: 2880,
                            selected: timelineWeek,
                            startTime: today,

                            selectedDateFormat: "{0:dd/MM/yyyy} - {1:dd/MM/yyyy}",
                            title: $filter("translate")("WEEK_VIEW")
                            //, title: "WEEK"
                        }, {
                            type: timelineTwoWeekType,
                            //showWorkHours: false,
                            majorTick: 2880,
                            selected: timelineTwoWeek,
                            //selected: timelineWeek,
                            selectedDateFormat: "{0:dd/MM/yyyy} - {1:dd/MM/yyyy}",
                            title: $filter("translate")("TWO_WEEK_VIEW"),
                            startTime: today,
                            //   columnWidth: 30
                        }, {
                            //type: "timelineMonth",
                            type: timelineMonthType,
                            majorTick: 1440,
                            selected: timelineMonth,
                            startTime: today,

                            selectedDateFormat: "{0:dd/MM/yyyy} - {1:dd/MM/yyyy}",
                            title: $filter("translate")("MONTH_VIEW")

                        }],
                        dataSource: schedulerData,

                        group: {
                            resources: ["Rooms"],
                            orientation: "vertical"
                        },
                        resources: [{
                            name: "Rooms",
                            field: "roomId",
                            title: "Room",
                            dataSource: RoomInfo
                        }]
                    })
                }, 100);

                $scope.menuItems = [{
                    name: "",
                    quantity: countByStatus(""),
                    color: null,
                    icon: "ic_view_module_24px.svg"
                }, {
                    name: "CHECKIN",
                    quantity: countByStatus("CHECKIN"),
                    color: $scope.statusColors['CHECKIN'],
                    icon: "ic_local_hotel_24px.svg"
                }, {
                    name: "OVERDUE",
                    quantity: countByStatus("OVERDUE"),
                    color: $scope.statusColors['OVERDUE'],
                    icon: "ic_restore_24px.svg"
                }, {
                    name: "NOSHOW",
                    quantity: countByStatus("NOSHOW"),
                    color: $scope.statusColors['NOSHOW'],
                    icon: "ic_event_busy_24px.svg"
                }];


                function renderWidthTimeline() {
                    setTimeout(function () {
                        angular.forEach(RoomInfo, function (item) {
                            var list = jQuery('div.room' + item.value).parent();
                            //check length event bắt doom class id room
                            if (list.length > 0) {
                                angular.forEach(list, function (arr, idx) {
                                    var top = jQuery(arr).css('top');
                                    if (top != undefined) {
                                        if (list.length > 1) {
                                            if (idx < list.length - 1) {
                                                //kiểm tra list length>0 && < length-1 thì bắt đầu change style
                                                var nextItemTop = jQuery(list[idx + 1]).css('top');
                                                if (top != nextItemTop) {
                                                    //check cách top
                                                    var left = parseInt(jQuery(list[idx + 1]).css('left').split('px')[0]);
                                                    jQuery(list[idx + 1]).css('top', top);
                                                    jQuery(list[idx + 1]).css('left', left + 2);
                                                    if (list[idx + 2] != undefined) {
                                                        //nếu mảng có item tiếp theo thì mới change style width
                                                        var width = parseInt(jQuery(list[idx + 1]).css('width').split('px')[0]);
                                                        jQuery(list[idx + 1]).css('width', width - 2);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                })
                            }
                        });
                    }, 200)
                }
                renderWidthTimeline();
                console.timeEnd('TIMELINE');
            });
        }

        function countUnassignRoom(listUnassign, theFirst) {
            //set count = 0
            var duration = $scope.durationTimeLine;
            if (theFirst) {
                for (var idx = 0; idx < duration; idx++) {
                    var tmp = addDays(new Date(startDate), idx).format('ddmmyyyy');
                    if (document.getElementById(tmp)) {
                        angular.element('#' + tmp).text('0');
                        jQuery('#' + tmp).css("display", "none");
                    }
                }
            }
            console.log("membell check $scope.UnassignRoom ", listUnassign);
            angular.forEach(listUnassign, function (arr) {
                var arrivalDate = new Date(arr.ArrivalDate);
                arrivalDate.setHours(0, 0, 0, 0);
                var departureDate = new Date(arr.DepartureDate);
                departureDate.setHours(0, 0, 0, 0);
                var numberDate = day_between(arrivalDate, departureDate);
                if (numberDate == 0 || numberDate == 1) {
                    var tmpDate = arrivalDate.format('ddmmyyyy');
                    if (document.getElementById(tmpDate)) {
                        var tmpcout = document.getElementById(tmpDate).innerText.replace(/\(/g, '').replace(/\)/g, '');
                        var tmp = parseInt(tmpcout) + 1;
                        var strtmp = null;
                        if (tmp > 0) {
                            strtmp = '(' + tmp + ')';
                            angular.element('#' + tmpDate).text(strtmp);
                            jQuery('#' + tmpDate).show();
                        }
                    }
                } else {
                    for (var idx = 0; idx < numberDate; idx++) {
                        var tmpDate = addDays(arrivalDate, idx).format('ddmmyyyy');
                        if (document.getElementById(tmpDate)) {
                            var tmpcout = document.getElementById(tmpDate).innerText.replace(/\(/g, '').replace(/\)/g, '');
                            var tmp = parseInt(tmpcout) + 1;
                            var strtmp = null;
                            if (tmp > 0) {
                                strtmp = '(' + tmp + ')';
                                jQuery('#' + tmpDate).show();
                                angular.element('#' + tmpDate).text(strtmp);
                            }
                        }
                    };
                }
            });
        };

        function scheduler_dataBinding(e) {
            console.log("dataBinding");
        }

        function scheduler_dataBound(e) {
            console.log("dataBound");
        }

        function scheduler_save(e) {
            console.log("save");
        }

        function scheduler_remove(e) {
            console.log("remove");
        }

        function scheduler_cancel(e) {
            console.log("cancel");
        }

        function scheduler_edit(e) {
            console.log("edit", e);
            e.preventDefault();
        }

        function scheduler_add(e) {
            console.log("add", e);
            e.preventDefault();
        }

        function scheduler_moveStart(e) {
            console.log("moveStart", e);
            var events = findPositionEvent(schedulerDataok, e.event.ReservationRoomId);
            events = events.data;
            console.log("membell check moveStart", events);
            if (events.HouseStatus == "REPAIR" || events.BookingStatus == "CHECKOUT" || events.BookingStatus == "OVERDUE")
                e.preventDefault();
        }

        function scheduler_move(e) {
            console.log("move");
            //e.preventDefault();
        }

        function scheduler_moveEnd(e) {
            console.log("moveEnd", e);

            var currentRoom = e.event;
            GlobalEvent = currentRoom;
            var tmp = angular.copy(currentRoom);
            var newRoomId = e.resources.roomId;
            currentRoom.reservationRoom = tmp;
            var DateNow = new Date();
            if (currentRoom.BookingStatus != "CHECKIN") {
                if ($scope.isViewDate) {
                    e.start.setHours(currentRoom.ArrivalDate.getHours());
                    e.start.setMinutes(currentRoom.ArrivalDate.getMinutes());
                    e.end.setHours(currentRoom.DepartureDate.getHours());
                    e.end.setMinutes(currentRoom.DepartureDate.getMinutes());
                }

                currentRoom.ArrivalDate = new Date(e.start);
                currentRoom.DepartureDate = new Date(e.end);



                if (currentRoom.ArrivalDate < DateNow) {
                    currentRoom.ArrivalDate = DateNow;
                };
                if (currentRoom.DepartureDate < DateNow || currentRoom.DepartureDate < currentRoom.ArrivalDate) {
                    currentRoom.DepartureDate = addDays(DateNow, 1);
                }
            }
            if (currentRoom.RoomId == newRoomId) {
                if (currentRoom.BookingStatus == "NOSHOW" || currentRoom.BookingStatus == "BOOKED") {
                    roomMove(currentRoom, currentRoom.RoomId);
                }
            } else {
                if (currentRoom != undefined && newRoomId != undefined && currentRoom.RoomId != newRoomId) {
                    roomMove(currentRoom, newRoomId);
                }
            }
            e.preventDefault();
        }

        function scheduler_resizeStart(e) {
            console.log("resizeStart");
        }

        function scheduler_resize(e) {
            console.log("resize");
            e.preventDefault();
        }

        function scheduler_resizeEnd(e) {

            console.log("resizeEnd");
            e.preventDefault();
        }

        function scheduler_navigate(e) {
            e.preventDefault();

            if (!currentDate || (e.date.getTime() != currentDate.getTime() || e.view != currentView)) {
                currentDate = e.date;
                currentView = e.view;
                $localStorage.startDateTL = new Date(e.date);
                // console.log("Run 1");
                initTimelineView(e.date, e.view);
            }
        }

        function checkBooking(roomId) {
            var isAvailable = true;
            for (var idx in $scope.schedulerData) {
                var item = $scope.schedulerData[idx];
                if (item.RoomId == roomId && (item.BookingStatus == 'CHECKIN' || item.BookingStatus == 'OVERDUE')) {
                    if (!item.roomMove)
                        isAvailable = false;
                }
            };
            return isAvailable;
            //console.log('loinq',$scope.schedulerData);
        }

        function scheduler_change(e) {
            console.log("Change", e);
            var start = e.start; //selection start date
            var end = e.end; //selection end date
            var events = e.events;
            GlobalEvent = e.events[0];
            Opscheduler = $("#scheduler").data("kendoScheduler");
            if (events && events.length) {
                e.preventDefault();
            } else {
                if (!checkAvailability(e.start, e.end, e.event, e.resources)) {
                    lastTimelineDrag = null;
                    e.preventDefault();
                } else {
                    if (timelineMonth || timelineWeek || timelineTwoWeek) e.end = setEndDate(e.end);
                    for (var idx in $scope.rooms) {
                        if ($scope.rooms[idx].RoomId == e.resources.roomId) {
                            if ($scope.rooms[idx].HouseStatus != null && $scope.rooms[idx].HouseStatus != "REPAIR") {
                                e.HouseStatus = $scope.rooms[idx].HouseStatus;
                                break;
                            }
                        }
                    };
                    if (!e.roomMove)
                        lastTimelineDrag = e;
                }
            }
            if (e.preventDefault)
                e.preventDefault();
        }

        function setEndDate(date) {
            if (date != null) {
                var tmpDate = new Date(date);
                var hours = tmpDate.getHours();
                if (hours == 0) {
                    tmpDate.setHours(23, 30);
                    if (tmpDate.getDate() > 1) {
                        tmpDate.setDate(tmpDate.getDate() - 1);
                    }
                }
                return tmpDate;
            }
            return new Date();
        };

        function addDays(date, days) {
            var result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        }

        function day_between(firstDate, secondDate) {
            var oneDay = 24 * 60 * 60 * 1000;
            firstDate = new Date(firstDate);
            firstDate.setHours(0, 0, 0, 0);
            secondDate = new Date(secondDate);
            secondDate.setHours(0, 0, 0, 0);

            return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
        }

        function checkDateBetween(from, to, check) {
            var checktem = angular.copy(check);
            //console.log('1:from,to,checktem:',from,to,checktem);
            var dd = checktem.toString().substring(0, 2);
            var mm = checktem.toString().substring(2, 4);
            var yyyy = checktem.toString().substring(4, 8);
            to = new Date(to);
            to.setHours(0, 0, 0, 0);
            from = new Date(from);
            from.setHours(0, 0, 0, 0);
            checktodate = new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd));
            //console.log('2:from,to,checktem:',from,to,checktodate);
            var checkreturn = false;
            if (from.getTime() <= checktodate.getTime() && checktodate.getTime() <= to.getTime()) {
                checkreturn = true;
            }

            // Truong hop neu Ngay di >ngay den va ngay di=ngay check thi tra lai fall
            if (to.getTime() > from.getTime() && to.getTime() == checktodate.getTime()) {
                checkreturn = false;
            }
            return checkreturn;
        }
        $scope.showMenu = function (reservationId, roomId, roomRepairId, isRoomMove) {
            if (roomId != null) {
                for (var idx in $scope.schedulerData) {
                    if (reservationId == 0 || roomRepairId != 0) {
                        if ($scope.schedulerData[idx] != null && $scope.schedulerData[idx].roomRepairId !== undefined && $scope.schedulerData[idx].roomRepairId == roomRepairId) {
                            var roomRepair = getDataRoomRepair(roomRepairId, 0);
                            $scope.showItemmenuTimeline(roomRepair);
                            break;
                        }
                    } else {
                        if (!isRoomMove) {
                            if ($scope.schedulerData[idx].ReservationRoomId != null && $scope.schedulerData[idx].ReservationRoomId != undefined && $scope.schedulerData[idx].ReservationRoomId == reservationId) {

                                if ($scope.schedulerData[idx].roomMove == false) {

                                    $scope.showItemMenu(null, $scope.schedulerData[idx]);
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        };
        $scope.showUnassignRoom = function (list, dateUR) {
            console.log('list:', list);
            var useFullScreen = ($mdMedia('xs') || $mdMedia('sm'));
            $mdDialog.show({
                controller: ['$scope', '$mdDialog', 'frontOfficeFactory', '$location', '$mdMedia', '$filter', '$timeout', '$rootScope', 'dialogService', 'ListUnassign', 'dateUR', UnassignRoomController],
                templateUrl: 'views/templates/unassignRoomList.tmpl.html',
                resolve: {

                    ListUnassign: function () {
                        return list;
                    },
                    dateUR: function () {
                        return dateUR;
                    }
                }, // targetEvent: ev,
                parent: angular.element(document.body),
                fullscreen: useFullScreen,
                clickOutsideToClose: false
            }).then(function () {

            }, function () {

            });
        };

        getDataRoomRepair = function (roomRepairId, roomId) {
            var item;
            //edit room repair
            if (roomRepairId != 0 && roomId == 0) {
                if ($scope.allRoomRepairs != null && $scope.allRoomRepairs.length > 0) {
                    angular.forEach($scope.allRoomRepairs, function (arr) {
                        if (arr.RoomRepairList && arr.RoomRepairList.length > 0) {
                            for (var index in arr.RoomRepairList) {
                                if (arr.RoomRepairList[index].RoomRepairId == roomRepairId) {
                                    item = {
                                        roomRepair: arr.RoomRepairList[index],
                                        roomRepairs: arr.RoomRepairList,
                                        currentRoomTemp: {
                                            room: arr.Room,
                                            roomTypes: arr.RoomType
                                        }
                                    };
                                    break;
                                }
                            }
                        }
                    });
                };
            } else {
                //add room repair
                if ($scope.allRoomRepairs != null && $scope.allRoomRepairs.length > 0) {
                    angular.forEach($scope.allRoomRepairs, function (arr) {
                        if (arr.Room.RoomId == roomId) {
                            item = {
                                currentRoom: arr.Room,
                                roomRepairs: arr.RoomRepairList,
                            };
                        }
                    });
                };
            }
            return item;
        }

        $scope.isUsed = false;
        $scope.Init = Init;


        var homeInit = $rootScope.$on("HomeInit", function () {
            jQuery(document).unbind('keydown');
            console.log("EMIT TU MENU");
            $scope.Init();
        });

        $scope.$on('$destroy', function () {
            homeInit();
        });


        if (firstCallHomeJs == 1) {

            firstCallHomeJs = 92;

            // OnUpdateTimeLine = null; 
            $rootScope.$on("UpdateTimeLine", function (event, data) {
                $scope.updateTimeLine(data);
            });
            // OnUpdateTimeLine();

        }

        function getlistColorItem(status) {
            if (listColor) {
                for (var i = listColor.length - 1; i >= 0; i--) {
                    if (listColor[i].StatusCode == status) {
                        return listColor[i].ColorCode;
                    }
                }
            }
            return null;
        }

        $scope.updateTimeLine = function (data) {
            // console.log("membell check Room move", data, GlobalEvent);
            console.log('action:', data.action);
            switch (data.action) {
                case "CANCEL":
                    var event = findPositionEvent(schedulerDataok, data.data.ReservationRoomId);
                    console.log("membell check event", event, schedulerDataok, data.data.ReservationRoomId);
                    try {
                        jQuery("div[data-uid='" + event.data.uid + "']").remove();
                    } catch (e) {

                    }
                    // Opscheduler.removeEvent( GlobalEvent );
                    // Opscheduler.saveEvent();
                    // Opscheduler.refresh();

                    dialogService.toast("CANCEL_BOOKING_SUCCESSFUL");
                    // var index2 = schedulerDataok.indexOf(GlobalEvent);
                    // schedulerDataok[index2].ArrivalDate = backupArrivalDate;

                    for (var i = schedulerDataok.length - 1; i >= 0; i--) {
                        if (schedulerDataok[i].ReservationRoomId == event.data.ReservationRoomId) {
                            schedulerDataok.splice(i, 1);
                        }
                    }

                    setTimeout(function () {
                        convertBookingPosition();
                    }, 50);
                    break;
                case "CANCEL_UNASSIGN":
                    for (var i = 0; i < $scope.UnassignRoom.length; i++) {
                        if ($scope.UnassignRoom[i].ReservationRoomId == data.data.ReservationRoomId) {
                            $scope.UnassignRoom.splice(i, 1);
                        }
                    }
                    for (var i = schedulerDataok.length - 1; i >= 0; i--) {
                        if (schedulerDataok[i].ReservationRoomId == data.data.ReservationRoomId) {
                            schedulerDataok.splice(i, 1);
                        }
                    }
                    // listUnassignRoom = $scope.UnassignRoom;
                    for (var i = 0; i < listUnassignRoom.length; i++) {
                        if (listUnassignRoom[i].ReservationRoomId == data.data.ReservationRoomId) {
                            listUnassignRoom.splice(i, 1);
                        }
                    }
                    $scope.UnassignRoom = listUnassignRoom;
                    console.log("membell CANCEL_UNASSIGN", $scope.UnassignRoom, data.data.ReservationRoomId);
                    countUnassignRoom($scope.UnassignRoom, true);
                    // console.log("membell check CANCEL_UNASSIGN", data.data, $scope.UnassignRoom);
                    break;
                case "AMEND_UNSSIGN":
                    console.log("membell check AMEND", data.before, data.data);
                    var index = $scope.UnassignRoom.indexOf(data.before);
                    console.log("membell check AMEND", data.before, data.data, index);
                    $scope.UnassignRoom[index] = data.data;

                    console.log("membell check AMEND", $scope.UnassignRoom);
                    countUnassignRoom($scope.UnassignRoom, true);
                    dialogService.toast("AMEND_STAY_SAVED_SUCCESSFUL");
                    break;
                case "AMEND":
                    console.log('schedulerDataok 1:', schedulerDataok);
                    if (typeof (GlobalEvent) == "undefined") {
                        var tmpD = findPositionEvent(schedulerDataok, data.data.reservationRoomId);
                        GlobalEvent = tmpD.data;
                    }
                    var minTime = 17000000;
                    var fqTime = (3600000 * 24);
                    var widthStep = 98;
                    if (timeline) {
                        fqTime = (60 * 45000);
                        widthStep = 32;
                    } else if (timelineWeek) {
                        fqTime = (3600000 * 12);
                        minTime = 0;
                    }
                    else if (timelineTwoWeek) {
                        fqTime = (3600000 * 12);
                        minTime = 0;
                    }
                    var date = new Date();
                    var status = GlobalEvent.BookingStatus;
                    if (GlobalEvent.BookingStatus == "BOOKED" || GlobalEvent.BookingStatus == "NOSHOW") {
                        if (date > data.data.arrivalDate) {
                            status = "NOSHOW";
                        } else {
                            status = "BOOKED";
                        }
                    } else if (GlobalEvent.BookingStatus == "CHECKIN" || GlobalEvent.BookingStatus == "OVERDUE") {
                        if (data.data.departureDate.getTime() < date.getTime()) {
                            status = "OVERDUE";
                        } else {
                            status = "CHECKIN";
                        }
                    }
                    console.log("membell check status ", status, getlistColorItem(status), GlobalEvent.BookingStatus);
                    // resize Dom reservation
                    if ($scope.isViewDate) {

                        var tmpDeparture = new Date(data.data.departureDate.getTime());
                        var tmpArrival = new Date(data.data.arrivalDate.getTime());
                        tmpArrival.setHours(0);
                        tmpArrival.setMinutes(0);
                        if (tmpArrival.getFullYear() == tmpDeparture.getFullYear() && tmpArrival.getMonth() == tmpDeparture.getMonth() && tmpArrival.getDate() == tmpDeparture.getDate()) {
                            tmpDeparture.setHours(23);
                            tmpDeparture.setMinutes(59);
                        } else {
                            tmpDeparture.setHours(0);
                            tmpDeparture.setMinutes(0);
                        }

                        var tmpA = new Date(GlobalEvent.start.getTime());
                        var tmpD = new Date(GlobalEvent.end.getTime());
                        tmpA.setHours(0);
                        tmpA.setMinutes(0);
                        if (tmpA.getDate() == tmpD.getDate() && tmpD.getMonth() == tmpA.getMonth() && tmpD.getFullYear() == tmpA.getFullYear()) {
                            tmpD.setHours(23);
                            tmpD.setMinutes(59);
                        } else {
                            tmpD.setHours(0);
                            tmpD.setMinutes(0);
                        }
                        var InDate = new Date($localStorage.startDateTL);
                        InDate.setHours(0);
                        InDate.setMinutes(0);
                        if (InDate.getTime() > tmpA.getTime()) {
                            tmpA = InDate;
                        }
                        var tmpA2 = tmpArrival;

                        if (InDate.getTime() > tmpA2.getTime()) {
                            tmpA2 = InDate;
                        }

                        var LBefore = tmpD.getTime() - tmpA.getTime();


                        var LAfter = tmpDeparture.getTime() - tmpA2.getTime();
                    } else {
                        var InDate = new Date($localStorage.startDateTL);
                        InDate.setHours(0);
                        InDate.setMinutes(0);
                        var tmpA = GlobalEvent.ArrivalDate;
                        var tmpA2 = data.data.arrivalDate;
                        if (InDate.getTime() > tmpA.getTime()) {
                            tmpA = InDate;
                        }
                        if (InDate.getTime() > tmpA2.getTime()) {
                            tmpA2 = InDate;
                        }
                        var LBefore = GlobalEvent.DepartureDate.getTime() - tmpA.getTime();
                        var LAfter = data.data.departureDate.getTime() - tmpA2.getTime();
                    }



                    LBefore = (LBefore < minTime) ? minTime : LBefore;
                    LAfter = (LAfter < minTime) ? minTime : LAfter;
                    var Lpercent = (LAfter - LBefore) / LBefore;
                    var Lwidth = jQuery("div[data-uid='" + GlobalEvent.uid + "']").width();
                    Lwidth = Lwidth + Lwidth * Lpercent;
                    // jQuery("div[data-uid='" + GlobalEvent.uid + "']").width(Lwidth + Lwidth * Lpercent);
                    jQuery("div[data-uid='" + GlobalEvent.uid + "']").find(".custom-event").css("background", getlistColorItem(status));

                    var eventLeft = jQuery("div[data-uid='" + GlobalEvent.uid + "']").css('left').replace("px", "");
                    eventLeft = parseInt(eventLeft);

                    // Caculator Left new
                    var subLeft_percent = (data.data.arrivalDate.getTime() - GlobalEvent.ArrivalDate.getTime()) / fqTime;
                    eventLeft = eventLeft + subLeft_percent * widthStep;

                    jQuery("div[data-uid='" + GlobalEvent.uid + "']").css({
                        "left": eventLeft + "px",
                        "width": Lwidth + "px"
                    });



                    // update object global schedulerDataok
                    var index2 = schedulerDataok.indexOf(GlobalEvent);
                    //console.log("data,schedulerDataok:", data,schedulerDataok[index2]);
                    var Adults = 0;
                    var Child = 0;
                    if (!isNaN(parseInt(data.data.adults))) {
                        console.log('data.data.adults:', data.data.adults);
                        Adults = parseInt(data.data.adults);
                    }

                    if (!isNaN(parseInt(data.data.child))) {
                        console.log('data.data.child:', data.data.child);
                        Child = parseInt(data.data.child);
                    }
                    var AdultsMax = 0;
                    var ChildMax = 0;
                    if (schedulerDataok[index2] != null && schedulerDataok[index2].AdultsReal != null) {
                        AdultsMax = schedulerDataok[index2].AdultsReal > Adults ? schedulerDataok[index2].AdultsReal : Adults
                    }

                    if (schedulerDataok[index2] != null && schedulerDataok[index2].ChildReal != null) {
                        ChildMax = schedulerDataok[index2].ChildReal > Child ? schedulerDataok[index2].ChildReal : Child
                    }

                    schedulerDataok[index2].ArrivalDate = data.data.arrivalDate;
                    schedulerDataok[index2].DepartureDate = data.data.departureDate;
                    schedulerDataok[index2].Adults = Adults; //isNaN(parseInt(data.data.adults)) ? 0 : parseInt(data.data.adults);
                    schedulerDataok[index2].Child = Child; // isNaN(parseInt(data.data.child)) ? 0 : parseInt(data.data.child);
                    schedulerDataok[index2].AdultsMax = AdultsMax;
                    schedulerDataok[index2].ChildMax = ChildMax;
                    schedulerDataok[index2].reservationRoom.ArrivalDate = data.data.arrivalDate;
                    schedulerDataok[index2].reservationRoom.DepartureDate = data.data.departureDate;
                    schedulerDataok[index2].reservationRoom.Adults = Adults; //isNaN(parseInt(data.data.adults)) ? 0 : parseInt(data.data.adults);
                    schedulerDataok[index2].reservationRoom.Child = Child; //isNaN(parseInt(data.data.child)) ? 0 : parseInt(data.data.child);
                    schedulerDataok[index2].reservationRoom.AdultsMax = AdultsMax;
                    schedulerDataok[index2].reservationRoom.ChildMax = ChildMax;
                    schedulerDataok[index2].BookingStatus = status;

                    console.log('schedulerDataok:', schedulerDataok[index2]);


                    // update object Scheduler
                    GlobalEvent.ArrivalDate = data.data.arrivalDate;
                    GlobalEvent.start = data.data.arrivalDate;
                    GlobalEvent.DepartureDate = data.data.departureDate;
                    GlobalEvent.end = data.data.departureDate;
                    GlobalEvent.Adults = Adults; // isNaN(parseInt(data.data.adults)) ? 0 : parseInt(data.data.adults);
                    GlobalEvent.Child = Child; //isNaN(parseInt(data.data.child)) ? 0 : parseInt(data.data.child);
                    GlobalEvent.AdultsMax = AdultsMax;
                    GlobalEvent.ChildMax = ChildMax;

                    Opscheduler.saveEvent(GlobalEvent);

                    dialogService.toast("AMEND_STAY_SAVED_SUCCESSFUL");
                    Opscheduler.refresh();
                    break;
                case "UNASSIGN_ROOM":
                    if (typeof (GlobalEvent) == "undefined") {
                        var tmpD = findPositionEvent(schedulerDataok, data.data.ReservationRoomId);
                        GlobalEvent = tmpD.data;
                    }
                    try {
                        jQuery("div[data-uid='" + GlobalEvent.uid + "']").remove();
                    } catch (e) {

                    }

                    // reset information Room
                    GlobalEvent.roomId = null;
                    GlobalEvent.RoomId = null;
                    GlobalEvent.Rooms = null;
                    GlobalEvent.RoomName = null;
                    GlobalEvent.reservationRoom.roomId = null;
                    GlobalEvent.reservationRoom.RoomId = null;
                    GlobalEvent.reservationRoom.Rooms = null;
                    GlobalEvent.reservationRoom.RoomName = null;

                    $scope.UnassignRoom.push(GlobalEvent.toJSON());
                    listUnassignRoom = $scope.UnassignRoom;
                    console.log("membell check mouseup 1", $scope.UnassignRoom);
                    countUnassignRoom({
                        0: GlobalEvent
                    }, false);
                    dialogService.toast("UNASSIGN_ROOM_SUCCESSFUL");
                    break;
                case "ROOM_MOVE":
                    if (GlobalEvent.BookingStatus == "CHECKIN") {
                        $scope.Init();
                        break;
                    }

                    var date = new Date();
                    var status = GlobalEvent.BookingStatus;
                    if (GlobalEvent.BookingStatus == "BOOKED" || GlobalEvent.BookingStatus == "NOSHOW") {
                        if (date > data.data.arrivalDate) {
                            status = "NOSHOW";
                        } else {
                            status = "BOOKED";
                        }
                    }


                    // The imposible
                    console.log("membell check Room move", data, GlobalEvent);
                    if (typeof (GlobalEvent) == "undefined") {
                        var tmpD = findPositionEvent(schedulerDataok, data.data.reservationRoomId);
                        GlobalEvent = tmpD.data;
                    }

                    if (GlobalEvent != null) {
                        var fqTime = (3600000 * 24);
                        var widthStep = 98;
                        if (timeline) {
                            fqTime = (60 * 45000);
                            widthStep = 32;
                        } else if (timelineWeek || timelineTwoWeek) {
                            fqTime = (3600000 * 12);
                        }
                        var eventLeft = jQuery("div[data-uid='" + GlobalEvent.uid + "']").css('left').replace("px", "");
                        eventLeft = parseInt(eventLeft);

                        var eventTop = jQuery("div[data-uid='" + GlobalEvent.uid + "']").css('top').replace("px", "");
                        eventTop = parseInt(eventTop);

                        var eventwidth = jQuery("div[data-uid='" + GlobalEvent.uid + "']").width();


                        // backup data
                        var backupArrivalDate = new Date(data.data.ArrivalDate.getTime());
                        var backupDepartureDate = new Date(data.data.DepartureDate.getTime());
                        // Caculator Width new
                        console.log("membell check isViewDate", $scope.isViewDate);
                        if ($scope.isViewDate) {
                            data.data.ArrivalDate.setHours(0);
                            data.data.ArrivalDate.setMinutes(0);
                            var tmpA = new Date(GlobalEvent.start.getTime());
                            var tmpD = new Date(GlobalEvent.end.getTime());
                            tmpA.setHours(0);
                            tmpA.setMinutes(0);
                            if (tmpA.getDate() == tmpD.getDate() && tmpD.getMonth() == tmpA.getMonth() && tmpD.getFullYear() == tmpA.getFullYear()) {
                                tmpD.setHours(23);
                                tmpD.setMinutes(59);
                            } else {
                                tmpD.setHours(0);
                                tmpD.setMinutes(0);
                            }
                            if (data.data.ArrivalDate.getDate() == data.data.DepartureDate.getDate() && data.data.ArrivalDate.getMonth() == data.data.DepartureDate.getMonth() && data.data.ArrivalDate.getFullYear() == data.data.DepartureDate.getFullYear()) {
                                data.data.DepartureDate.setHours(23);
                                data.data.DepartureDate.setMinutes(59);
                            } else {
                                data.data.DepartureDate.setHours(0);
                                data.data.DepartureDate.setMinutes(0);
                            }

                            var LBefore = tmpD.getTime() - tmpA.getTime();
                            var LAfter = data.data.DepartureDate.getTime() - data.data.ArrivalDate.getTime();
                            var Lpercent = (LAfter - LBefore) / LBefore;
                            eventwidth = eventwidth + eventwidth * Lpercent;
                            console.log("membell check isViewDate", tmpD, tmpA, data.data.DepartureDate, data.data.ArrivalDate, Lpercent, eventwidth);
                        } else {
                            var LBefore = GlobalEvent.end.getTime() - GlobalEvent.start.getTime();
                            var LAfter = data.data.DepartureDate.getTime() - data.data.ArrivalDate.getTime();
                            var Lpercent = (LAfter - LBefore) / LBefore;
                            eventwidth = eventwidth + eventwidth * Lpercent;
                        }



                        // Caculator Left new
                        var subLeft_percent = (data.data.ArrivalDate.getTime() - GlobalEvent.start.getTime()) / fqTime;
                        eventLeft = eventLeft + subLeft_percent * widthStep;

                        var t = 1;
                        var i = 0;
                        var listR = [];
                        jQuery("table.k-scheduler-table").each(function () {
                            t++;
                            if (t == 4) {
                                jQuery(this).find("th").each(function () {
                                    listR.push(jQuery(this).text())
                                })
                            }
                        });
                        console.log("membell check RoomInfo", $scope.RoomInfo);

                        var OldRoom = findPositionRoom(listRooms, data.data.OldRoomId);
                        var OldPosRoom = OldRoom.position;
                        var NewRoom = findPositionRoom(listRooms, data.data.NewRoomId);
                        var NewPosRoom = NewRoom.position;
                        membellCheck = {};
                        membellCheck.RoomInfo = $scope.RoomInfo;
                        membellCheck.OldRoom = OldRoom;
                        membellCheck.NewRoom = NewRoom;
                        console.log("membell check RoomInfo", OldPosRoom, NewPosRoom);

                        eventTop = eventTop + (NewPosRoom - OldPosRoom) * 24;
                        console.log("membell check Room set", eventTop, eventLeft, eventwidth, NewPosRoom, OldPosRoom, NewRoom);

                        jQuery("div[data-uid='" + GlobalEvent.uid + "']").css({
                            "top": eventTop + "px",
                            "left": eventLeft + "px",
                            "width": eventwidth + "px"
                        });
                        jQuery("div[data-uid='" + GlobalEvent.uid + "']").find(".custom-event").css("background", getlistColorItem(status));

                        var index2 = schedulerDataok.indexOf(GlobalEvent);
                        schedulerDataok[index2].ArrivalDate = backupArrivalDate; //data.data.ArrivalDate;
                        schedulerDataok[index2].DepartureDate = backupDepartureDate; //data.data.DepartureDate;
                        schedulerDataok[index2].RoomId = data.data.NewRoomId;
                        schedulerDataok[index2].roomId = data.data.NewRoomId;
                        schedulerDataok[index2].RoomName = NewRoom.data.RoomName;
                        schedulerDataok[index2].Rooms = NewRoom.data;
                        schedulerDataok[index2].reservationRoom.ArrivalDate = backupArrivalDate; //data.data.ArrivalDate;
                        schedulerDataok[index2].reservationRoom.DepartureDate = backupDepartureDate; //data.data.DepartureDate;
                        schedulerDataok[index2].reservationRoom.RoomId = data.data.NewRoomId;
                        schedulerDataok[index2].reservationRoom.roomId = data.data.NewRoomId;
                        schedulerDataok[index2].reservationRoom.RoomName = NewRoom.data.RoomName;
                        schedulerDataok[index2].reservationRoom.Rooms = NewRoom.data;
                        schedulerDataok[index2].BookingStatus = status;
                        console.log("membell check status ok", schedulerDataok[index2].BookingStatus);
                        GlobalEvent.ArrivalDate = backupArrivalDate; //data.data.ArrivalDate;
                        GlobalEvent.start = data.data.ArrivalDate;
                        GlobalEvent.DepartureDate = backupDepartureDate; //data.data.DepartureDate;
                        GlobalEvent.end = data.data.DepartureDate;
                        GlobalEvent.RoomId = data.data.NewRoomId;
                        Opscheduler.saveEvent(GlobalEvent);
                        setTimeout(function () {
                            convertBookingPosition();
                        }, 50);
                    }

                    dialogService.toast("ROOM_MOVED_SUCCESSFUL");
                    break;

            }
            // $scope.theContent = kendo.template($("#template").html());
        }

        function convertBookingPosition() {
            var tmpData = schedulerDataok;
            for (var sindex = tmpData.length - 1; sindex >= 0; sindex--) {

                tmpData[sindex].roomBookingList = {
                    NextReservation: [],
                    PreviousReservation: []
                };
                var res = tmpData[sindex];
                var maxD = 0;
                var minA = 0;
                for (var tindex = tmpData.length - 1; tindex >= 0; tindex--) {
                    booking = tmpData[tindex];
                    if (booking.BookingStatus == "BOOKED" || booking.BookingStatus == "NOSHOW" || booking.BookingStatus == "CHECKIN") {

                        if (booking.ReservationRoomId != res.ReservationRoomId && res.RoomId == booking.RoomId && typeof (booking.RoomId) != "undefined") {

                            if (res.DepartureDate <= booking.ArrivalDate) {
                                if ((minA == 0 || minA >= booking.ArrivalDate.getTime())) {
                                    // booking.roomBookingList = null;
                                    minA = booking.ArrivalDate.getTime();
                                    tmpData[sindex].roomBookingList.NextReservation[0] = booking;
                                }
                            } else if (maxD <= booking.DepartureDate.getTime()) {
                                maxD = booking.DepartureDate.getTime();
                                // booking.roomBookingList = null;
                                tmpData[sindex].roomBookingList.PreviousReservation[0] = booking;
                            }

                        };

                    }

                }

            }

            tmpData.sort(function (a, b) {
                //return a.ArrivalDate - b.ArrivalDate.getTime();
            });

            schedulerDataok = tmpData;
        }

        function findPositionRoom(rooms, roomId) {
            var result = {
                position: -1,
                data: {}
            };
            for (var i = rooms.length - 1; i >= 0; i--) {
                if (rooms[i].value == roomId) {
                    return {
                        position: i,
                        data: rooms[i]
                    };
                }
            }
            return result;

        }

        function findPositionEvent(rooms, ReservationRoomId) {
            var result = {
                position: -1,
                data: {}
            };
            if (rooms) {
                for (var i = rooms.length - 1; i >= 0; i--) {
                    if (rooms[i].ReservationRoomId == ReservationRoomId) {
                        return {
                            position: i,
                            data: rooms[i]
                        };
                    }
                }
            }

            return result;
        }

        function roomMove(currentRoom, newRoomId) {
            var useFullScreen = ($mdMedia('xs') || $mdMedia('sm'));
            $mdDialog.show({
                controller: ['$scope', '$mdDialog', 'item', 'currentRoom', 'roomListFactory', 'newRoomId', '$rootScope', '$filter', 'loginFactory', 'dialogService', 'reservationFactory', RoomMoveDialogController],
                resolve: {
                    newRoomId: function () {
                        return newRoomId;
                    },
                    item: function () {
                        return null;
                    },
                    currentRoom: function () {
                        return currentRoom;
                    }
                },
                templateUrl: 'views/templates/roomMove.tmpl.html',
                parent: angular.element(document.body),
                fullscreen: useFullScreen
            }).then(function (RoomMoveModel) {
                console.log("ROOM MOVE MODEL", RoomMoveModel);
                var keys = ["ROOM_MONTHLY", "ROOM_WEEKLY", "ROOM_FULL_DAY", "ROOM_DAY_NIGHT", "ROOM_HOURLY", "MINIBAR", "LAUNDRY", "EXTRA_ROOM_CHARGE", "COMPENSATION", "EXTRA_SERVICES", "FULL_DAY_EARLY_CHECKIN", "FULL_DAY_LATE_CHECKOUT", "DAY_NIGHT_EARLY_CHECKIN", "DAY_NIGHT_LATE_CHECKOUT", "EXTRA_ADULTS", "EXTRA_CHILDREN", "ROOM_MOVE_EXTRA_SERVICES", "NOTIFICATION_CHANGE_ROOM"];
                var languageKeys = {};
                for (var idx in keys) {
                    languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
                }
                RoomMoveModel.languageKeys = languageKeys;
                if (RoomMoveModel.IsDirty === true && RoomMoveModel.BookingStatus != "BOOKED" && RoomMoveModel.BookingStatus != "NOSHOW") {
                    dialogService.confirm("ROOM_DIRTY", "DO_YOU_WANT_TO_CONTINUE" + "?").then(function () {
                        var processRoomMove = loginFactory.securedPostJSON("api/Room/ProcessRoomMove", RoomMoveModel);
                        $rootScope.dataLoadingPromise = processRoomMove;
                        processRoomMove.success(function (data) {
                            // dialogService.toast("ROOM_MOVED_SUCCESSFUL");
                            // $rootScope.pageInit = true;
                            $rootScope.$emit("UpdateTimeLine", {
                                "action": "ROOM_MOVE",
                                "data": RoomMoveModel
                            });
                        }).error(function (err) {
                            if (err.Message) {
                                dialogService.messageBox("ERROR", err.Message).then(function () { });
                            }
                        });
                    });
                } else {
                    var processRoomMove = loginFactory.securedPostJSON("api/Room/ProcessRoomMove", RoomMoveModel);
                    $rootScope.dataLoadingPromise = processRoomMove;
                    processRoomMove.success(function (data) {
                        // dialogService.toast("ROOM_MOVED_SUCCESSFUL");
                        $rootScope.$emit("UpdateTimeLine", {
                            "action": "ROOM_MOVE",
                            "data": RoomMoveModel
                        });
                        // $rootScope.pageInit = true;
                    }).error(function (err) {
                        if (err.Message) {
                            dialogService.messageBox("ERROR", err.Message).then(function () { });
                        }
                    });
                }
            }, function () {

            });
        };

        function occurrencesInRangeByResource(start, end, resourceFieldName, event, resources) {
            var scheduler = $("#scheduler").getKendoScheduler();
            var occurrences = scheduler.occurrencesInRange(start, end);
            var occurrencesOk = [];
            for (var i = occurrences.length - 1; i >= 0; i--) {
                var tmpA = new Date(occurrences[i].ArrivalDate);
                var tmpD = new Date(occurrences[i].DepartureDate);
                if (tmpD.getTime() < start.getTime()) {
                    occurrencesOk.push(occurrences[i]);
                }
            }
            occurrences = occurrencesOk;
            var idx = occurrences.indexOf(event);
            if (idx > -1) {
                occurrences.splice(idx, 1);
            }
            event = $.extend({}, event, resources);
            return filterByResource(occurrences, resourceFieldName, event[resourceFieldName]);
        }

        function filterByResource(occurrences, resourceFieldName, value) {
            var result = [];
            var occurrence;

            for (var idx = 0, length = occurrences.length; idx < length; idx++) {
                occurrence = occurrences[idx];
                if (occurrence[resourceFieldName] === value) {
                    result.push(occurrence);
                }
            }
            return result;
        }

        function attendeeIsOccupied(start, end, event, resources) {
            var occurrences = occurrencesInRangeByResource(start, end, "attendee", event, resources);
            if (occurrences.length > 0) {
                return true;
            }
            return false;
        }

        function roomIsOccupied(start, end, event, resources) {
            var occurrences = occurrencesInRangeByResource(start, end, "roomId", event, resources);
            if (occurrences.length > 0) {
                return true;
            }
            return false;
        }

        function checkAvailability(start, end, event, resources) {
            if (roomIsOccupied(start, end, event, resources)) {
                return false;
            }
            return true;
        }
        $scope.showEventMenu = function () {
            console.log("Event Menu");
            var scheduler = $("#scheduler").data("kendoScheduler");
            var selectedEvent = scheduler.select();
            scheduler_change(selectedEvent);
            //jQuery("#right_column").scrollTop(0);
        };



        function Init() {
            jQuery(document).unbind('keydown');
            $scope.currentHotelConnectivites = currentHotelConnectivities;
            //$rootScope.currentHotelConnectivities = currentHotelConnectivities;
            if ($localStorage.sortBy != null) {
                $scope.sortBy = $localStorage.sortBy;
            } else {
                $scope.sortBy = 'ROOM';
                $localStorage.sortBy = 'ROOM';
            };
            $scope.changeSortBy = function (newSortBy) {
                if ($localStorage.sortBy != null && (newSortBy != $localStorage.sortBy)) {
                    $localStorage.sortBy = newSortBy;
                    $scope.sortBy = newSortBy;
                }
            };
            $rootScope.pageInit = false;
            roomListFactory.getRoomList(new Date(), function (data) {
                console.log('data:', data);
                rooms = data;
                $scope.floorList = data.floorList;
                $scope.ExtraService = data.ExtraService;
                $scope.roomTypes = data.roomTypes;
                $scope.items = rooms;
                for (var index in $scope.items) {
                    if ($scope.items[index].RoomRepairList && $scope.items[index].RoomRepairList.length > 0) {
                        for (var index2 in $scope.items[index].RoomRepairList) {
                            var repairtTemp = $scope.items[index].RoomRepairList[index2];
                            if (repairtTemp.IsDeleted !== true && repairtTemp.RepairStartDate <= new Date() && new Date() <= repairtTemp.RepairEndDate) {
                                $scope.items[index].HouseStatus = "REPAIR";
                                $scope.items[index].RepairStartDate = repairtTemp.RepairStartDate;
                                $scope.items[index].RepairEndDate = repairtTemp.RepairEndDate;
                                break;
                            }
                        }
                    }
                }
                $scope.data = $scope.items.slice(0, 20);
                $scope.statusColors = rooms.statusColors;
                $scope.remarkEvents = $scope.items.remarkEvents;
                $scope.rateList = rooms.planList;
                if ($scope.viewType == "TIMELINE") {
                    initTimelineView(new Date());
                }
                $scope.dateTimeNow = new Date();
                $scope.menuItems = [{
                    name: "",
                    quantity: countByStatus(""),
                    color: null,
                    icon: "ic_view_module_24px.svg"
                }, {
                    name: "AVAILABLE",
                    quantity: countByStatus("AVAILABLE"),
                    color: $scope.statusColors['AVAILABLE'],
                    icon: "ic_check_circle_24px.svg"
                }, {
                    name: "CHECKIN",
                    quantity: countByStatus("CHECKIN"),
                    color: $scope.statusColors['CHECKIN'],
                    icon: "ic_local_hotel_24px.svg"
                }, {
                    name: "OVERDUE",
                    quantity: countByStatus("OVERDUE"),
                    color: $scope.statusColors['OVERDUE'],
                    icon: "ic_restore_24px.svg"
                }, {
                    name: "NOSHOW",
                    quantity: countByStatus("NOSHOW"),
                    color: $scope.statusColors['NOSHOW'],
                    icon: "ic_event_busy_24px.svg"
                }, {
                    name: "DIRTY",
                    quantity: countByStatus("DIRTY"),
                    color: $scope.statusColors['DIRTY'],
                    icon: "ic_report_problem_24px.svg"
                }, {
                    name: "REPAIR",
                    quantity: countByStatus("REPAIR"),
                    color: $scope.statusColors['REPAIR'],
                    icon: "ic_format_paint_24px.svg"
                }];
                $scope.selectedItem = $scope.menuItems[0];

            });
        }

        $scope.loadMore = function () {
            console.log("GET MORE");
            $scope.data = $scope.items.slice(0, $scope.data.length + 20);
        };

        function countByStatus(value) {
            if ($scope.viewType == "TIMELINE") {
                if ($scope.timelineData) {
                    if ($scope.currentView) {
                        var start = $scope.currentView._startDate;
                        var end = new Date($scope.currentView._endDate.getTime() + 1000 * 3600 * 24);
                        if (!value) return $scope.timelineData.filter(function (obj) {

                            return (obj.ArrivalDate <= end && obj.DepartureDate >= start);
                        }).length;
                        //
                        var items = $scope.timelineData.filter(function (obj) {
                            if (value == 'AVAILABLE' && obj.HouseStatus == 'REPAIR') return;

                            return (obj.ArrivalDate <= end && obj.DepartureDate >= start) && ((obj.BookingStatus == value || obj.HouseStatus == value) || (value == 'CHECKIN' && obj.BookingStatus == 'OVERDUE'));
                        });
                        return items.length;
                    }

                }
                return 0;
            } else {
                if (!value) {
                    if (rooms)
                        return rooms.length;
                    else
                        return 0;
                }
                if (rooms) {
                    var items =
                        rooms.filter(function (obj) {
                            if (value == 'AVAILABLE' && obj.HouseStatus == 'REPAIR')
                                return;
                            return (obj.BookingStatus == value || obj.HouseStatus == value) || (value == 'CHECKIN' && obj.BookingStatus == 'OVERDUE');
                        });

                    return items.length;
                } else return 0;
            }
        }

        $scope.countByStatus = countByStatus;

        $scope.menuItemClick = function (item) {
            $scope.status = item.name;
            if (!item.name) {
                $scope.items = rooms;

            } else {
                $scope.items = rooms.filter(function (obj) {
                    return (obj.BookingStatus == item.name || obj.HouseStatus == item.name) || (item.name == 'CHECKIN' && obj.BookingStatus == 'OVERDUE');
                });


            }


        };
        //$scope.selectedItem = item;
        $scope.changeStatus = function (value) {
            $scope.status = value;

            if ($scope.viewType !== 'TIMELINE') {
                if (!value) {
                    $scope.items = rooms;
                } else {
                    $scope.items = rooms.filter(function (obj) {
                        return (obj.BookingStatus == value || obj.HouseStatus == value) || (value == 'CHECKIN' && obj.BookingStatus == 'OVERDUE');
                    });

                }
            } else {
                var scheduler = $("#scheduler").data("kendoScheduler");
                scheduler.dataSource.filter({
                    operator: function (obj) {
                        console.log(obj);
                        return (!value) || ((obj.BookingStatus == value || obj.HouseStatus == value) || (value == 'CHECKIN' && obj.BookingStatus == 'OVERDUE'));
                    }
                });
                var now = new Date();
                var currentDate = now.format("dd/mm");
                var scrollToX = 0;
                var $timeSlots = jQuery($scope.currentView.datesHeader[0]).find("table.k-scheduler-table>tbody>tr>th:contains('" + currentDate + "')");
                console.log($timeSlots, currentDate, $timeSlots.position(), $timeSlots.offset());
                scrollToX = $timeSlots.position().left;
                $("div.k-scheduler-content", "#scheduler").animate({
                    scrollLeft: scrollToX - 0
                }, 0);


            }

        };
        $scope.showItemMenu = function ($event, item) {
            //alert('hello menu');
            selectedRoomFactory.setViewType($scope.viewType);
            selectedRoomFactory.setSelectedRoom(item);
            selectedRoomFactory.setExtraService(rebuildExtraService($scope.ExtraService));
            selectedRoomFactory.setCurrentHotelConnectivities(currentHotelConnectivities);
            if (item.reservationRoom) {

            }
            $mdBottomSheet.show({
                templateUrl: 'views/houseKeeping/houseKeeping_Menu.html',
                controller: 'houseKeeping_MenuController', // targetEvent: $event,
                clickOutsideToClose: true
            }).then(function (selectedRoom) {
                if (selectedRoom != undefined && selectedRoom != null) {
                    if (selectedRoom && selectedRoom.BookingStatus && (selectedRoom.BookingStatus === "CHECKIN" || selectedRoom.BookingStatus === "OVERDUE")) {
                        var itemTemp = angular.copy(selectedRoom);
                        $scope.dialogLiveCheckout(null, itemTemp);
                    }
                }
            });

            function rebuildExtraService(data) {
                for (var idx in data.ExtraServiceTypes) {
                    data.ExtraServiceTypes[idx].IsHide = true;
                    var countItem = data.ExtraServiceItems.filter(function (item) {
                        return data.ExtraServiceTypes[idx].ExtraServiceTypeId == item.ExtraServiceTypeId;
                    });
                    if (countItem.length > 0) {
                        data.ExtraServiceTypes[idx].IsHide = false;
                    }
                }

                return data;
            }
        };
        showItemMenu = $scope.showItemMenu;
        $scope.showItemmenuTimeline = function (item) {
            // alert('hello word time line');
            selectedRoomFactory.setCurrentHotelConnectivities(currentHotelConnectivities);
            var newItem = angular.copy(item);
            selectedRoomFactory.setSelectedRoomTimeline(newItem);
            $mdBottomSheet.show({
                templateUrl: 'views/bottom_sheets/room_menu_timeline.html',
                controller: 'roomMenuTimelineController',
                clickOutsideToClose: true
            }).then(function () { });
        };
        showItemmenuTimeline = $scope.showItemmenuTimeline;

        function processCheckIn(item) {
            var roomRemarks;
            var getRoomRemarks = loginFactory.securedGet("api/Room/GetRoomRemarks", "RRID=" + item.reservationRoom.ReservationRoomId);
            $rootScope.dataLoadingPromise = getRoomRemarks;
            getRoomRemarks.then(function (data) {
                roomRemarks = data.data;
                for (var index in roomRemarks) {
                    if (roomRemarks[index].CreatedDate) {
                        roomRemarks[index].CreatedDate = new Date(roomRemarks[index].CreatedDate);
                    }
                    for (var index2 in $scope.remarkEvents) {
                        if ($scope.remarkEvents[index2].RemarkEventId == roomRemarks[index].RemarkEventId) {
                            roomRemarks[index].RemarkEventCode = $scope.remarkEvents[index2].RemarkEventCode;
                            break;
                        }
                    }
                }
                $mdDialog.show({
                    controller: CheckInDialogController,
                    resolve: {
                        selectedRoom: function () {
                            return item;
                        },
                        currentHotelConnectivities: function () {
                            return $scope.currentHotelConnectivites;
                        },
                        roomRemarks: function () {
                            return roomRemarks;
                        }
                    },
                    templateUrl: 'views/templates/checkInDialog.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: event
                }).then(function (checkInModel) {
                    console.log("isCreateCard", checkInModel.isCreateCard);
                    if (checkInModel.isCreateCard === true) {

                        dialogService.confirm("PLEASE_BE_SURE_THE_VALID_CARD_IS_BEING_INSERTED").then(function () {
                            var writeCardModel = {
                                RoomName: item.RoomName,
                                TravellerName: item.reservationRoom.Travellers.Fullname,
                                ArrivalDate: item.reservationRoom.ArrivalDate,
                                DepartureDate: item.reservationRoom.DepartureDate,
                                OverrideOldCards: true
                            };
                            if ($scope.currentHotelConnectivites.IsAutomaticalAddHourCheckout == true) {
                                writeCardModel = smartCardFactory.addHourCheckOutCard(writeCardModel, $scope.currentHotelConnectivites.HourAddToCheckout);
                            };
                            frontOfficeFactory.preProcessNoshow(item.reservationRoom, item.reservationRoom.ReservationRoomId, function (dataNoshow) {
                                reservationFactory.changeStatus(item.reservationRoom.ReservationRoomId, "CHECKIN", function (data) {
                                    var createCard = smartCardFactory.writeCardInWalkin(writeCardModel, item.reservationRoom.ReservationRoomId, checkInModel.reason);
                                    createCard.then(function (data) {
                                        if (data.Result !== null && data.Result == 0) {
                                            frontOfficeFactory.processNoshow(item.reservationRoom, dataNoshow.roomCharges, item.reservationRoom.ReservationRoomId, function () {
                                                dialogService.toast("CHECKIN_AND_CREATE_CARD_SUCCESSFUL");
                                            });
                                        } else {
                                            dialogService.messageBox("INVALID_CARD").then(function (data) {
                                                //$rootScope.pageInit = true;
                                                frontOfficeFactory.processNoshow(item.reservationRoom, dataNoshow.roomCharges, item.reservationRoom.ReservationRoomId, function () {
                                                    Init();
                                                });
                                            });
                                        }
                                    }, function () {
                                        dialogService.messageBox("INVALID_CARD").then(function (data) {
                                            //$rootScope.pageInit = true;
                                            frontOfficeFactory.processNoshow(item.reservationRoom, dataNoshow.roomCharges, item.reservationRoom.ReservationRoomId, function () {
                                                Init();
                                            });
                                        });
                                    })
                                    item.BookingStatus = "CHECKIN";
                                    Init();
                                });
                            });
                        });
                    } else {
                        frontOfficeFactory.preProcessNoshow(item.reservationRoom, item.reservationRoom.ReservationRoomId, function (dataNoshow) {
                            reservationFactory.changeStatus(item.reservationRoom.ReservationRoomId, "CHECKIN", function (da) {
                                frontOfficeFactory.processNoshow(item.reservationRoom, dataNoshow.roomCharges, item.reservationRoom.ReservationRoomId, function () {
                                    item.BookingStatus = "CHECKIN";
                                    Init();
                                });
                            });
                        });
                    }
                }, function () {

                });

                function CheckInDialogController($scope, $mdDialog, selectedRoom, currentHotelConnectivities, roomRemarks, loginFactory) {
                    $scope.isCardExist = false;
                    $scope.isCreateCard = true;

                    function Init() {
                        $scope.currentHotelConnectivities = currentHotelConnectivities;

                        console.log(roomRemarks);

                        $scope.roomRemarks = roomRemarks;
                        var getCardInfo = loginFactory.securedGet("api/Connectivities/GetCardInfomation", "RRID=" + selectedRoom.reservationRoom.ReservationRoomId + "&roomName=" + selectedRoom.RoomName);
                        $rootScope.dataLoadingPromise = getCardInfo;
                        getCardInfo.success(function (data) {
                            if (data !== null && data.length > 0) {
                                $scope.isCreateCard = false;
                                $scope.isCardExist = true;
                                $scope.cardInfo = data;
                                for (var index in $scope.cardInfo) {
                                    if ($scope.cardInfo[index].CreatedDate) {
                                        $scope.cardInfo[index].CreatedDate = new Date($scope.cardInfo[index].CreatedDate);
                                    }
                                }
                                $scope.cardInfo.sort(function (a, b) {
                                    return a.CreatedDate - b.CreatedDate;
                                });
                            }
                        }).error(function (err) {
                            console.log(err);
                        });
                        $scope.reason = null;
                    }
                    Init();
                    $scope.hide = function () {
                        $mdDialog.hide();
                    };
                    $scope.cancel = function () {
                        $mdDialog.cancel();
                    }
                    $scope.processCheckIn = function () {
                        var checkInModel = {
                            isCreateCard: $scope.isCreateCard,
                            reason: $scope.reason
                        }
                        if ($scope.currentHotelConnectivities.isUsed === false) {
                            checkInModel.isCreateCard = false;
                        }
                        $mdDialog.hide(checkInModel);
                    }
                }
            });

        }

        function doCheckIn(item, ev) {
            if (item.HouseStatus === "DIRTY") {
                dialogService.confirm("ROOM_DIRTY", "DO_YOU_WANT_TO_CONTINUE?").then(function () {
                    processCheckIn(item);
                });
            } else {
                processCheckIn(item);
            }
        }

        $scope.amendStay = function (item) {
            console.log("ITEM", item);
            $mdDialog.show({
                controller: AmendStayDialogController,
                resolve: {
                    item: function () {
                        return item;
                    }
                },
                templateUrl: 'views/templates/amendStay.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: event,
            }).then(function (currentItem) {
                var AmendStayModel = {
                    reservationRoomId: currentItem.reservationRoom.ReservationRoomId,
                    arrivalDate: item.reservationRoom.ArrivalDate,
                    departureDate: new Date(currentItem.reservationRoom.DepartureDate.getFullYear(), currentItem.reservationRoom.DepartureDate.getMonth(), currentItem.reservationRoom.DepartureDate.getDate(), currentItem.reservationRoom.DepartureDate.getHours(), currentItem.reservationRoom.DepartureDate.getMinutes(), 0),
                    adults: currentItem.reservationRoom.Adults,
                    child: currentItem.reservationRoom.Child
                };
                var saveAmendStay = loginFactory.securedPostJSON("api/Room/SaveAmendStay", AmendStayModel);
                $rootScope.dataLoadingPromise = saveAmendStay;
                saveAmendStay.success(function (data) {


                    dialogService.toast("AMEND_STAY_SAVED_SUCCESSFUL");
                    Init();

                }).error(function (err) {
                    console.log(err);
                    if (err.Message) {
                        dialogService.messageBox("ERROR", err.Message)
                    } else {
                        conflictReservationProcess(err);
                    }

                });
            }, function () {

            });
        };
        AmendStayDialogController.$inject = ['$scope', '$mdDialog', '$document', 'item'];

        function AmendStayDialogController($scope, $mdDialog, $document, item) {
            $scope.minDate = new Date();
            $scope.currentItem = item;
            $scope.currentItem.reservationRoom.ArrivalTime = new Date(1970, 0, 1, $scope.currentItem.reservationRoom.ArrivalDate.getHours(), $scope.currentItem.reservationRoom.ArrivalDate.getMinutes(), 0);
            $scope.currentItem.reservationRoom.DepartureTime = new Date(1970, 0, 1, $scope.currentItem.reservationRoom.DepartureDate.getHours(), $scope.currentItem.reservationRoom.DepartureDate.getMinutes(), 0);
            if ($scope.currentItem.roomBookingList.length > 1) {
                $scope.currentItem.roomBookingList[1].ArrivalTime = new Date(1970, 0, 1, $scope.currentItem.roomBookingList[1].ArrivalDate.getHours(), $scope.currentItem.roomBookingList[1].ArrivalDate.getMinutes(), 0);
                $scope.currentItem.roomBookingList[1].DepartureTime = new Date(1970, 0, 1, $scope.currentItem.roomBookingList[1].DepartureDate.getHours(), $scope.currentItem.roomBookingList[1].DepartureDate.getMinutes(), 0);
            }

            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
            $scope.saveAmendStay = function () {
                $mdDialog.hide($scope.currentItem);
            }
        }

        $scope.dialogLiveCheckout = function (ev, item) {
            var itemTemp = angular.copy(item);
            $scope.checkOutDialog = $mdDialog;
            $scope.checkOutDialog.show({
                templateUrl: 'views/templates/liveCheckOut.tmpl.html',
                clickOutsideToClose: false,
                locals: {
                    local: [itemTemp, $scope.checkOutDialog, $scope]
                },
                resolve: {
                    currentHotelConnectivities: function () {
                        return currentHotelConnectivities;
                    }
                },
                controller: ['$scope', '$mdDialog', '$filter', '$rootScope', 'loginFactory', 'dialogService', '$state', 'local', 'currentHotelConnectivities', 'smartCardFactory','SharedFeaturesFactory', LiveCheckOutController]
            }).then(function (data) {
                if (data != undefined && data == true) {
                    //loinq
                    $state.go($state.current, {}, {
                        reload: true
                    });
                }
            }, function (data) {

            });
        };


        $scope.dialogQuickCheckIn = function (ev, item, start, end) {
            var useFullScreen = $mdMedia('xs');
            var itemTemp = angular.copy(item);
            if (start)
                itemTemp.start = start;
            if (end)
                itemTemp.end = end;
            $scope.quickCheckInDialog = $mdDialog;
            $scope.quickCheckInDialog.show({
                templateUrl: 'views/templates/quickCheckIn.tmpl.html',
                clickOutsideToClose: false,
                fullscreen: useFullScreen,
                locals: {
                    local: [itemTemp, $scope.quickCheckInDialog, $scope, $scope.currentHotelConnectivites]
                },
                controller: ['$scope', '$mdDialog', '$filter', '$rootScope', 'loginFactory', 'dialogService', 'local', QuickCheckInDialogController]
            }).then(function (data) {
                if (data !== null || data !== undefined) {

                }
            }, function () {

            });

            function QuickCheckInDialogController($scope, $mdDialog, $filter, $rootScope, loginFactory, dialogService, local) {
                $scope.quickCheckInModel = {};
                // $scope.minDate = new Date();
                $scope.availableRoom = [];
                $scope.disableCheckIn = false;
                $scope.validCustomer = true;
                $scope.item;
                $scope.customer = {};
                $scope.room = {};
                $scope.deposit = {};
                $scope.isCancelled = false;
                $scope.filterValue = function ($event) {
                    if (isNaN(String.fromCharCode($event.keyCode))) {
                        $event.preventDefault();
                    }
                };

                function Init() {
                    $scope.customerList = {
                        SkipRecord: 0
                    };
                    console.log("LOCAL[0]", local[0]);
                    $scope.RoomName = local[0].RoomName;
                    $scope.DateTimePickerOption = {
                        format: 'dd/MM/yyyy HH:mm'
                    };
                    $scope.DatePickerOption = {
                        format: 'dd/MM/yyyy'
                    };
                    $scope.item = local[0];
                    $scope.decimal = $rootScope.decimals;
                    $scope.confirmDialog = $mdDialog;
                    $scope.dialog = local[2].dialogQuickCheckIn;
                    /*if (local[0].customerTemp || local[0].roomTemp || local[0].depositTemp) {
                        $scope.isCancelled = true;
                    }*/

                    // var customerList = loginFactory.securedGet("api/Room/AllCustomer");
                    // customerList.success(function(data) {
                    //     $scope.customerList = data;
                    //     $scope.customers = $scope.customerList;
                    //     console.log('loinq',);
                    // }).error(function(err) {
                    //     console.log(err);
                    // });

                    roomListFactory.getRoomList(new Date(), function (data) {
                        $scope.roomList = data;
                        $scope.rateList = data.planList;
                        // var roomTypes = [];
                        // for (var idx in roomListFactory.getRoomTypes()) {
                        //     roomTypes.push(roomListFactory.getRoomTypes()[idx]);
                        // }
                        $scope.roomTypes = data.roomTypes;
                        $scope.planList = data.planList;

                        //Currencies
                        $scope.currencies = data.currencies;
                        $scope.defaultCurrency = data.defaultCurrency

                        //Payment Methods
                        $scope.paymentMethods = data.paymentMethods;

                        for (var index in $scope.paymentMethods) {
                            if ($scope.paymentMethods[index].PaymentMethodName.toLowerCase() === "cash") {
                                $scope.defaultPaymentMethod = $scope.paymentMethods[index];
                                break;
                            }
                        }
                        //Remark Events
                        $scope.remarkEvents = data.remarkEvents;

                        $scope.paymentList = [];


                        var room = {};
                        $scope.roomRemarks = [];
                        for (var index in $scope.roomList) {
                            if ($scope.roomList[index].RoomId.toString() === local[0].RoomId.toString()) {
                                room = $scope.roomList[index];
                                break;
                            }
                        }
                        var roomTemp;
                        var currentRoomTypeId;
                        for (var index in $scope.roomList) {
                            if ($scope.roomList[index].RoomId.toString() === local[0].RoomId.toString()) {
                                roomTemp = $scope.roomList[index];
                                currentRoomTypeId = roomTemp.RoomTypeId;
                                break;
                            }
                        }

                        function IsUseTimeInOutPrivate(arrivalDate, departureDate) {
                            if ($localStorage.TimeInOutPrivate != null && $localStorage.TimeInOutPrivate != undefined) {
                                if ($localStorage.TimeInOutPrivate.UseTimeInOutPrivate) {
                                    var timeIn = angular.copy($localStorage.TimeInOutPrivate.TimeInPrivate);
                                    timeIn = timeIn.split(':');
                                    var timeOut = angular.copy($localStorage.TimeInOutPrivate.TimeOutPrivate);
                                    timeOut = timeOut.split(':');
                                    //
                                    arrivalDate.setHours(timeIn[0]);
                                    arrivalDate.setMinutes(timeIn[1]);
                                    departureDate.setHours(timeOut[0]);
                                    departureDate.setMinutes(timeOut[1]);
                                    console.log('UseTimeInOutPrivate', arrivalDate, departureDate);
                                }
                            }
                            return [arrivalDate, departureDate];
                        };
                        var startTmp = new Date();
                        startTmp.setSeconds(0);
                        startTmp.setMilliseconds(0);
                        var endTmp = addDays(new Date(), 1);
                        endTmp.setSeconds(0);
                        endTmp.setMilliseconds(0);
                        var start = $scope.item.start ? $scope.item.start : startTmp;
                        var end = $scope.item.end ? $scope.item.end : endTmp;
                        var DateTmp = IsUseTimeInOutPrivate(start, end);
                        // var now = new Date();
                        // if (DateTmp[0] < now)
                        //     DateTmp[0] = now;
                        // if (DateTmp[1] <= now) {
                        //     DateTmp[1] = addDays(new Date(), 1);
                        // }
                        $scope.str = DateTmp[0].format('dd/mm/yyyy HH:MM');
                        $scope.str2 = DateTmp[1].format('dd/mm/yyyy HH:MM');
                        $scope.room = {
                            count: 1,
                            ArrivalDate: DateTmp[0],
                            DepartureDate: DateTmp[1],
                            Adults: 1,
                            Child: 0,
                            Total: 0,
                            RoomPriceId: 0,
                            RoomTypeId: currentRoomTypeId,
                            RoomId: local[0].RoomId,
                            FOC: false,
                            DiscountPercentage: 0,
                            DiscountFlat: 0,
                            // RoomTypeId: room.RoomTypeId,
                            // RoomId: room.RoomId,
                            BookingStatus: room.BookingStatus,
                            HouseStatus: room.HouseStatus,
                            Note: null,
                            Price: 0
                        };
                        $scope.minDate = angular.copy($scope.room.ArrivalDate);
                        if (local[0].roomTemp) {
                            $scope.room = local[0].roomTemp;
                        }

                        $scope.customer = {};
                        if (local[0].customerTemp) {
                            $scope.customer = local[0].customerTemp;
                        }

                        if (local[0].searchTextTemp) {
                            $scope.searchText = local[0].searchTextTemp;
                        }

                        $scope.roomRemarks = [];
                        var arrivalDateTemp = new Date($scope.room.ArrivalDate.getFullYear(), $scope.room.ArrivalDate.getMonth(), $scope.room.ArrivalDate.getDate(), $scope.room.ArrivalDate.getHours(), $scope.room.ArrivalDate.getMinutes(), 0);
                        var departureDateTemp = new Date($scope.room.DepartureDate.getFullYear(), $scope.room.DepartureDate.getMonth(), $scope.room.DepartureDate.getDate(), $scope.room.DepartureDate.getHours(), $scope.room.DepartureDate.getMinutes(), 0);
                        for (var index in $scope.roomList) {
                            var notThisRoom = false;
                            if ($scope.roomList[index].reservationRoom) {
                                if ((arrivalDateTemp <= $scope.roomList[index].reservationRoom.ArrivalDate && $scope.roomList[index].reservationRoom.ArrivalDate <= departureDateTemp) ||
                                    (arrivalDateTemp <= $scope.roomList[index].reservationRoom.DepartureDate && $scope.roomList[index].reservationRoom.DepartureDate <= departureDateTemp) ||
                                    ($scope.roomList[index].reservationRoom.ArrivalDate <= arrivalDateTemp && departureDateTemp <= $scope.roomList[index].reservationRoom.DepartureDate)
                                ) {
                                    notThisRoom = true;
                                }
                            }
                            if (notThisRoom === false) {
                                $scope.availableRoom.push($scope.roomList[index]);
                            }
                        }

                        $scope.deposit = {
                            PaymentMethodId: $scope.defaultPaymentMethod.PaymentMethodId,
                            MoneyId: $scope.defaultCurrency.MoneyId,
                            PaymentTypeName: "DEPOSIT"
                        };
                        if (local[0].depositTemp) {
                            $scope.deposit = local[0].depositTemp;
                            console.log("DEPOSIT", $scope.deposit);
                        }

                        $scope.$watchCollection('room.RoomPriceId', function (newValues, oldValues) {
                            for (var index in $scope.planList) {
                                if ($scope.planList[index].RoomPriceId && $scope.planList[index].RoomPriceId.toString() === newValues.toString()) {
                                    $scope.room.Price = $scope.planList[index].FullDayPrice;
                                }
                            }
                        });
                    });
                    // $scope.str = new Date().format('dd/mm/yyyy HH:MM');
                    // $scope.str2 = addDays(new Date(), 1).format('dd/mm/yyyy HH:MM');
                    $scope.item = item;
                    $scope.quickCheckInModel.customer = {};
                    $scope.quickCheckInModel.room = {};
                    $scope.quickCheckInModel.room.ArrivalDate = new Date();
                    $scope.quickCheckInModel.room.DepartureDate = addDays(new Date(), 1);
                    $scope.warningMissingCustomer = false;
                    $scope.warningMissingRoom = false;
                    $scope.warningMissingRoomPriceId = false;
                    $scope.warningDepartureDate = false;
                    $scope.test = {};
                    initHotKey();
                }

                initHotKey = function () {
                    jQuery(document).unbind('keydown');
                    jQuery(document).on('keydown', function (e) {

                        // Click RESERVE room
                        EVENT.run(e, "R", function () {
                            jQuery('#btn_reserve').click();
                        });

                        // Click Checkin room
                        EVENT.run(e, "I", function () {
                            jQuery('#btn_checkin').click();
                        });

                        // Click Cancel 
                        EVENT.run(e, "C", function () {
                            jQuery('#btn_cancel').click();
                        });

                    });
                }



                Init();
                $scope.$watchCollection('customer', function (newValues, oldValues) {
                    if (oldValues === null) {
                        if (newValues === undefined) {
                            $scope.validCustomer = false;
                        }
                    } else {
                        $scope.validCustomer = true;
                    }
                });
                $scope.searchCustomer = function ($mdOpenMenu, ev) {
                    if ($scope.customer.Fullname == null || $scope.customer.Fullname.length < 2) {
                        return;
                    }
                    $scope.customer.IdentityNumber = null;
                    $scope.customer.TravellerId = null;
                    var searchModel = {
                        CustomerName: $scope.customer.Fullname,
                        SkipRecord: 0
                    };
                    var searchCustomer = loginFactory.securedPostJSON("api/Room/SearchCustomer", searchModel);
                    $rootScope.dataLoadingPromise = searchCustomer;
                    searchCustomer.success(function (data) {
                        if (data) {
                            $scope.customerList = null;
                            $scope.customerList = data;
                            $mdOpenMenu(ev);
                        }
                    }).error(function (err) {
                        loginFactory.toast("SEARCH_CUSTOMER_ERROR");
                    });
                };
                $scope.selectCustomer = function (customer) {
                    if (customer) {
                        $scope.customer.TravellerId = customer.TravellerId;
                        $scope.customer.Fullname = customer.Fullname;
                        $scope.customer.IdentityNumber = customer.IdentityNumber;
                        $scope.customer.Birthday = customer.Birthday;
                        $scope.customer.CountryId = customer.CountryId;
                        $scope.customer.Email = customer.Email;
                        $scope.customer.Gender = customer.Gender
                        $scope.customer.Mobile = customer.Mobile;
                        $scope.customer.Note = customer.Note;
                        $scope.customer.Address = customer.Address;
                    }
                }
                $scope.moreCustomer = function () {
                    $scope.customerList.SkipRecord += 10;
                    var searchModel = {
                        CustomerName: $scope.customer.Fullname,
                        SkipRecord: $scope.customerList.SkipRecord
                    };
                    var searchCustomer = loginFactory.securedPostJSON("api/Room/SearchCustomer", searchModel);
                    $rootScope.dataLoadingPromise = searchCustomer;
                    searchCustomer.success(function (data) {
                        if (data && data.Travellers.length > 0) {
                            for (var idx in data.Travellers) {
                                var currentTraveller = data.Travellers[idx];
                                $scope.customerList.Travellers.push(currentTraveller);
                            };
                        }
                    }).error(function (err) {
                        loginFactory.toast("SEARCH_CUSTOMER_ERROR");
                    });
                }
                $scope.$watchCollection('room', function (newValues, oldValues) {
                    if (_.size(newValues) !== 0 && _.size(oldValues) !== 0 && !angular.equals(newValues, oldValues) && newValues.ArrivalDate && oldValues.ArrivalDate) {

                        if (oldValues.RoomTypeId != newValues.RoomTypeId) {
                            $scope.room.RoomPriceId = 0;
                            $scope.room.RoomId = 0;
                        }

                        if (newValues.ArrivalDate !== oldValues.ArrivalDate && newValues.ArrivalDate >= oldValues.DepartureDate) {
                            //loinq
                            var newDepartureDate = addDays(newValues.ArrivalDate, 1);
                            newDepartureDate.setHours(oldValues.DepartureDate.getHours());
                            newDepartureDate.setMinutes(oldValues.DepartureDate.getMinutes());
                            newDepartureDate.setSeconds(0);
                            newValues.DepartureDate = newDepartureDate;
                        }

                        //AVAILABLE ROOM
                        var availableRoom = [];
                        $scope.availableRoom = reservationFactory.getAvailableRoom($scope.roomList, newValues.ArrivalDate, newValues.DepartureDate, availableRoom);
                        if ($scope.availableRoom != null && $scope.availableRoom.length > 0) {
                            var temp = _.filter($scope.availableRoom, function (item) {
                                return item.RoomId == $scope.room.RoomId;
                            });
                            if (temp.length == 0) {
                                $scope.room.RoomId = null;
                            }
                        }

                        if ((oldValues.BookingStatus === 'BOOKED' || oldValues.BookingStatus === 'NOSHOW') && newValues.BookingStatus === 'CHECKIN') {
                            $scope.room.ArrivalDate = new Date();
                            if ($scope.room.ArrivalDate.getTime() >= oldValues.DepartureDate.getTime()) {
                                $scope.room.DepartureDate = addDays($scope.room.ArrivalDate, 1);
                            } else {
                                $scope.room.DepartureDate = oldValues.DepartureDate;
                            }
                        }

                        //AVAILABLE PLAN LIST
                        $scope.availablePlanList = _.filter($scope.planList, function (item) {
                            return (item.IsActive && item.RoomTypeId.toString() === newValues.RoomTypeId.toString());
                        }).sort(function (a, b) {
                            return parseInt(a.Priority) - parseInt(b.Priority);
                        });
                        if (newValues.RoomId !== null && oldValues.RoomId !== null && newValues.RoomId.toString() !== oldValues.RoomId.toString()) {
                            $scope.RoomName = _.filter($scope.availableRoom, function (item) {
                                return (item.RoomId.toString() === newValues.RoomId.toString());
                            })[0].RoomName;
                        }

                        if (newValues.RoomId == null) {
                            $scope.RoomName = null;
                        }
                    }

                    $scope.availablePlanList = _.filter($scope.planList, function (item) {
                        return (item.IsActive && item.RoomTypeId.toString() === newValues.RoomTypeId.toString());
                    }).sort(function (a, b) {
                        return parseInt(a.Priority) - parseInt(b.Priority);
                    });
                });

                $scope.updateRoomType = function () {
                    var roomTemp;
                    if ($scope.room.RoomId > 0) {
                        for (var index in $scope.roomList) {
                            if ($scope.roomList[index].RoomId.toString() === $scope.room.RoomId.toString()) {
                                roomTemp = $scope.roomList[index];
                                $scope.room.RoomTypeId = roomTemp.RoomTypeId;
                                break;
                            }
                        }
                    }
                }

                function addDays(date, days) {
                    var result = new Date(date);
                    result.setDate(result.getDate() + days);
                    return result;
                }


                $scope.simulateQuery = false;
                $scope.isDisabled = false;
                $scope.querySearch = querySearch;
                $scope.selectedItemChange = selectedItemChange;
                $scope.searchTextChange = searchTextChange;


                function querySearch(query) {
                    var results = query ? $scope.customers.filter(createFilterFor(query)) : $scope.customers,
                        deferred;
                    if ($scope.simulateQuery) {
                        deferred = $q.defer();
                        $timeout(function () {
                            deferred.resolve(results);
                        }, Math.random() * 1000, false);
                        return deferred.promise;
                    } else {
                        return results;
                    }
                    //                  console.log("RESULT", query, results);
                    //return results;
                }

                function searchTextChange(text) {
                    //console.log("selected text change", text);
                    //$scope.searchText = text;
                }

                function selectedItemChange(item) {
                    //console.log("selected item change", item);
                    //$scope.selectedItem = item;
                }

                function createFilterFor(query) {
                    var lowercaseQuery = angular.lowercase(query);
                    return function filterFn(customer) {
                        return (angular.lowercase(customer.Fullname).indexOf(lowercaseQuery) === 0);
                    };
                }

                $scope.processCheckIn = function () {

                    console.log('processCheckIn:');
                    if (!$scope.room.RoomId || parseInt($scope.room.RoomId) === 0) {
                        $scope.warningMissingRoom = true;
                        $scope.warningMissingCustomer = false;
                        return;
                    }

                    if (!$scope.customer || ($scope.customer.Fullname && $scope.customer.Fullname.trim() === "")) {
                        // || !$scope.searchText || ($scope.searchText && $scope.searchText.trim() === "") 
                        $scope.warningMissingCustomer = true;
                        $scope.warningMissingRoom = false;
                        return;
                    }
                    if ($scope.customer.Fullname.length > 50) {
                        $scope.warningFullnameLength = true;
                        return;
                    }

                    if ($scope.room.RoomPriceId === 0) {
                        $scope.warningMissingRoom = false;
                        $scope.warningMissingCustomer = false;
                        $scope.warningFullnameLength = false;
                        $scope.warningMissingRoomPriceId = true;
                        return;

                    } else $scope.warningMissingRoomPriceId = false;

                    if ($scope.room.ArrivalDate > $scope.room.DepartureDate) {
                        $scope.warningDepartureDate = true;
                        $scope.warningMissingCustomer = false;
                        $scope.warningMissingRoom = false;
                        return;
                    }
                    if ($scope.room.DepartureDate < new Date()) {
                        $scope.warningDepartureDate1 = true;
                        $scope.warningDateIsNull = false;
                        $scope.warningDepartureDate = false;
                        $scope.warningMissingCustomer = false;
                        $scope.warningMissingRoom = false;
                        return;
                    }
                    if ($scope.room.ArrivalDate == null || $scope.room.DepartureDate == null) {
                        $scope.warningDateIsNull = true;
                        $scope.warningDepartureDate = false;
                        $scope.warningMissingCustomer = false;
                        $scope.warningMissingRoom = false;
                        return;
                    }


                    var payment = angular.copy($scope.payment);
                    var Paykeys = ["RES_NO", "ROOM", "NOTIFICATION_NEWPAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER", "NOTIFICATION_BOOKED_CONTENT", "NOTIFICATION_BOOKED_NAN_CONTENT"];
                    var languagePayKeys = {};
                    for (var idx in Paykeys) {
                        languagePayKeys[Paykeys[idx]] = $filter("translate")(Paykeys[idx]);
                    }
                    $scope.sharerList = [];
                    if ($scope.deposit && $scope.deposit.Amount) {
                        $scope.deposit.CreatedDate = new Date();
                        $scope.paymentList.push($scope.deposit);
                        local[0].depositTemp = $scope.deposit;
                    }

                    var customer;
                    if (!$scope.selectedItem || $scope.selectedItem === undefined) {
                        customer = $scope.customer;
                        console.log("CUSTOMER 1", customer);
                    } else {
                        console.log("SELECTED ITEM", $scope.selectedItem);
                        customer = $scope.selectedItem;
                        console.log("CUSTOMER 2", customer);
                        local[0].selectedItemTemp = $scope.selectedItem;
                    }

                    if ($scope.searchText) {
                        local[0].searchTextTemp = $scope.searchText;
                    }

                    local[0].customerTemp = customer;
                    //                      local[0].customerTemp.Fullname = $scope.customer.Fullname;
                    //                      local[0].customerTemp.IdentityNumber = $scope.customer.IdentityNumber;


                    var data = {
                        customer: customer,
                        room: $scope.room,
                        sharerList: $scope.sharerList,
                        paymentList: $scope.paymentList,
                    };


                    local[0].roomTemp = $scope.room;
                    //local[0].dataTemp = angular.copy(data);

                    console.log("CURRENT HOTEL CONNECTIVITIES", local[3]);
                    var confirm;
                    if (local[3].isUsed === false) {
                        confirm = $mdDialog.confirm()
                            .title($filter("translate")("CHECK_IN"))
                            .content($filter("translate")("WOULD_YOU_LIKE_TO_CHECK_IN"))
                            .ok($filter("translate")("OK"))
                            .cancel($filter("translate")("CANCEL"))
                            .targetEvent(null);

                        $scope.confirmDialog.show(confirm).then(function () {
                            frontOfficeFactory.preProcessNoshow(data.room, data.room.ReservationRoomId, function (dataNoshow) {
                                $scope.room.BookingStatus = "CHECKIN";
                                data.room.BookingStatus = "CHECKIN";
                                data.room.ArrivalDate = new Date();
                                data.room.DepartureDate = $scope.room.DepartureDate;
                                data.languageKeys = languagePayKeys;
                                var save = loginFactory.securedPostJSON("api/Room/Save", data);
                                $rootScope.dataLoadingPromise = save;
                                save.success(function (id) {
                                    if (dataNoshow == null) {
                                        if (data.room.BookingStatus === "CHECKIN") {
                                            dialogService.toast("CHECKIN_SUCCESSFUL");
                                        } else {
                                            dialogService.toast("RESERVE_SUCCESSFUL");
                                        }
                                        local[2].Init();
                                    } else {
                                        frontOfficeFactory.processNoshow(data.room, dataNoshow.roomCharges, data.room.ReservationRoomId, function () {
                                            if (data.room.BookingStatus === "CHECKIN") {
                                                dialogService.toast("CHECKIN_SUCCESSFUL");
                                            } else {
                                                dialogService.toast("RESERVE_SUCCESSFUL");
                                            }
                                            local[2].Init();
                                        });
                                    }
                                }).error(function (err) {
                                    if (err.Message) {
                                        dialogService.messageBox("Error", err.Message).then(function () {
                                            $state.go($state.current, {}, {
                                                reload: true
                                            });
                                        });
                                    } else {
                                        data.room.BookingStatus = "BOOKED";
                                        SharedFeaturesFactory.processConflictReservation(err, data.room, "CHECKOUT");
                                        //conflictReservationProcess(err);
                                    }

                                });
                            });
                        }, function () {
                            $scope.confirmDialog.cancel();
                            $scope.dialog(null, local[0]);
                        });
                    } else {
                        console.log("GET THERE SMART CARD", $scope.room, $scope.customer);
                        var roomName = _.filter($scope.availableRoom, function (item) {
                            return item.RoomId == $scope.room.RoomId;
                        })[0].RoomName;
                        confirm = {
                            controller: ['$scope', '$mdDialog', 'selectedRoom', 'currentHotelConnectivities', 'loginFactory', 'dialogService', CheckInDialogController],
                            resolve: {
                                selectedRoom: function () {
                                    return $scope.room;;
                                },
                                currentHotelConnectivities: function () {
                                    return local[3];
                                },
                            },
                            templateUrl: 'views/templates/checkInDialog.tmpl.html',
                            parent: angular.element(document.body),
                            targetEvent: null
                        };

                        $scope.confirmDialog.show(confirm).then(function (isCreateCard) {
                            if (isCreateCard === true) {
                                dialogService.confirm("PLEASE_BE_SURE_THE_VALID_CARD_IS_BEING_INSERTED").then(function () {
                                    var writeCardModel = {
                                        RoomName: roomName,
                                        TravellerName: $scope.customer.Fullname,
                                        ArrivalDate: $scope.room.ArrivalDate,
                                        DepartureDate: $scope.room.DepartureDate,
                                        OverrideOldCards: true
                                    };

                                    if (local[3].IsAutomaticalAddHourCheckout == true) {
                                        writeCardModel = smartCardFactory.addHourCheckOutCard(writeCardModel, local[3].HourAddToCheckout);
                                    };
                                    for (var index in $scope.roomRemarks) {
                                        if ($scope.roomRemarks[index].RemarkEventCode) {
                                            delete $scope.roomRemarks[index].RemarkEventCode;
                                        }
                                    }
                                    frontOfficeFactory.preProcessNoshow(data.room, data.room.ReservationRoomId, function (dataNoshow) {
                                        data.roomRemarks = $scope.roomRemarks;
                                        data.room.BookingStatus = "CHECKIN";
                                        data.room.ArrivalDate = new Date();
                                        data.room.DepartureDate = $scope.room.DepartureDate;
                                        data.languageKeys = languagePayKeys;
                                        save = loginFactory.securedPostJSON("api/Room/Save", data);
                                        $rootScope.dataLoadingPromise = save;
                                        save.success(function (id) {

                                            var createCard = smartCardFactory.writeCardInWalkin(writeCardModel, id, null);
                                            var delay = $q.defer();
                                            var temp = $q.all(createCard);
                                            console.log("temp", temp);
                                            if (temp !== null) {
                                                console.log("CREATE CARD", createCard);
                                                createCard.then(function (dataCard) {
                                                    console.log("DATA CARD", dataCard);
                                                    if (dataCard.Result !== null && dataCard !== null && dataCard !== undefined && dataCard.Result == 0) {
                                                        if (dataNoshow == null) {
                                                            dialogService.toast("CHECKIN_AND_CREATE_CARD_SUCCESSFUL");
                                                            local[2].Init();
                                                        } else {
                                                            frontOfficeFactory.processNoshow(data.room, dataNoshow.roomCharges, data.room.ReservationRoomId, function () {
                                                                dialogService.toast("CHECKIN_AND_CREATE_CARD_SUCCESSFUL");
                                                                local[2].Init();
                                                            });
                                                        }
                                                    } else {
                                                        dialogService.messageBox("UNABLE_TO_CREATE_NEW_CARD").then(function (da) {
                                                            if (dataNoshow == null) {
                                                                local[2].Init();
                                                            } else {
                                                                frontOfficeFactory.processNoshow(data.room, dataNoshow.roomCharges, data.room.ReservationRoomId, function () {
                                                                    local[2].Init();
                                                                });
                                                            }
                                                        });
                                                    }
                                                }, function () {
                                                    dialogService.messageBox("UNABLE_TO_CREATE_NEW_CARD").then(function (da) {
                                                        if (dataNoshow == null) {
                                                            local[2].Init();
                                                        } else {
                                                            frontOfficeFactory.processNoshow(data.room, dataNoshow.roomCharges, data.room.ReservationRoomId, function () {
                                                                local[2].Init();
                                                            });
                                                        }
                                                    });
                                                });
                                            } else {
                                                console.log("GET ERR CONN ERR");
                                                dialogService.messageBox("UNABLE_TO_CREATE_NEW_CARD").then(function (da) {
                                                    if (dataNoshow == null) {
                                                        local[2].Init();
                                                    } else {
                                                        frontOfficeFactory.processNoshow(data.room, dataNoshow.roomCharges, data.room.ReservationRoomId, function () {
                                                            local[2].Init();
                                                        });
                                                    }
                                                });
                                            }

                                        }).error(function (err) {
                                            if (err.Message) {
                                                dialogService.messageBox("Error", err.Message).then(function () {
                                                    $state.go($state.current, {}, {
                                                        reload: true
                                                    });
                                                });
                                            } else {
                                                conflictReservationProcess(err);
                                            } //End Else

                                        });
                                    });



                                });


                            } else {
                                frontOfficeFactory.preProcessNoshow(data.room, data.room.ReservationRoomId, function (dataNoshow) {
                                    $scope.room.BookingStatus = "CHECKIN";
                                    data.room.BookingStatus = "CHECKIN";
                                    data.room.ArrivalDate = new Date();
                                    data.room.DepartureDate = $scope.room.DepartureDate;
                                    data.languageKeys = languagePayKeys;
                                    var save = loginFactory.securedPostJSON("api/Room/Save", data);
                                    $rootScope.dataLoadingPromise = save;
                                    save.success(function (id) {
                                        if (dataNoshow == null) {
                                            if (data.room.BookingStatus === "CHECKIN") {
                                                dialogService.toast("CHECKIN_SUCCESSFUL");
                                            } else {
                                                dialogService.toast("RESERVE_SUCCESSFUL");
                                            }
                                            local[2].Init();
                                        } else {
                                            frontOfficeFactory.processNoshow(data.room, dataNoshow.roomCharges, data.room.ReservationRoomId, function () {
                                                if (data.room.BookingStatus === "CHECKIN") {
                                                    dialogService.toast("CHECKIN_SUCCESSFUL");
                                                } else {
                                                    dialogService.toast("RESERVE_SUCCESSFUL");
                                                }
                                                local[2].Init();
                                            });
                                        }
                                    }).error(function (err) {
                                        if (err.Message) {
                                            dialogService.messageBox("Error", err.Message).then(function () {
                                                $state.go($state.current, {}, {
                                                    reload: true
                                                });
                                            });
                                        } else {
                                            conflictReservationProcess(err);
                                        }

                                    });
                                });
                            }
                        }, function () {
                            $scope.confirmDialog.cancel();
                            $scope.dialog(null, local[0]);
                        });

                        function CheckInDialogController($scope, $mdDialog, selectedRoom, currentHotelConnectivities, loginFactory, dialogService) {
                            function Init() {
                                //$scope.roomRemarks = roomRemarks;
                                //$scope.room = room;
                                //console.log("data", data);
                                console.log("GET THERE")
                                $scope.currentHotelConnectivities = currentHotelConnectivities;
                                console.log("$scope.currentHotelConnectivities", $scope.currentHotelConnectivities);
                                $scope.isCreateCard = true;
                            }
                            Init();
                            $scope.hide = function () {
                                jQuery(document).unbind('keydown');
                                $mdDialog.hide();
                            };
                            $scope.cancel = function () {
                                jQuery(document).unbind('keydown');
                                $mdDialog.cancel();
                            };

                            $scope.processCheckIn = function () {
                                jQuery(document).unbind('keydown');
                                $mdDialog.hide($scope.isCreateCard);

                            }
                        }
                    }

                    /*var confirm = $mdDialog.confirm()
                        .title($filter("translate")("CHECK_IN"))
                        .content($filter("translate")("WOULD_YOU_LIKE_TO_CHECK_IN"))
                        .ok($filter("translate")("OK"))
                        .cancel($filter("translate")("CANCEL"))
                        .targetEvent(null);*/


                }

                $scope.processReserve = function () {
                    if (!$scope.customer || ($scope.customer.Fullname && $scope.customer.Fullname.trim() === "")) {
                        // || !$scope.searchText || ($scope.searchText && $scope.searchText.trim() === "")
                        $scope.warningMissingCustomer = true;
                        //$scope.warningMissingRoom = false;
                        return;
                    }
                    if ($scope.customer.Fullname.length > 50) {
                        $scope.warningMissingCustomer = false;
                        $scope.warningFullnameLength = true;
                        return;
                    }

                    if ($scope.room.RoomPriceId === 0) {

                        $scope.warningMissingCustomer = false;
                        $scope.warningFullnameLength = false;
                        $scope.warningMissingRoomPriceId = true;
                        return;

                    } else {
                        $scope.warningMissingCustomer = false;
                        $scope.warningFullnameLength = false;
                        $scope.warningMissingRoomPriceId = false;
                    }


                    if ($scope.room.ArrivalDate > $scope.room.DepartureDate) {
                        $scope.warningDepartureDate = true;
                        $scope.warningMissingCustomer = false;
                        $scope.warningFullnameLength = false;
                        //dialogService.messageBox("INVALID_ARRIVAL/DEPARTURE_DATE", "PLEASE_SELECT_A_VALID_DATE_TO_PERFORM_RESERVE_ACTION");
                        return;
                    }

                    if ($scope.room.ArrivalDate == null || $scope.room.DepartureDate == null) {
                        $scope.warningDateIsNull = true;
                        $scope.warningDepartureDate = false;
                        $scope.warningMissingCustomer = false;
                        $scope.warningMissingRoom = false;
                        return;
                    }


                    var payment = angular.copy($scope.payment);
                    var Paykeys = ["RES_NO", "ROOM", "NOTIFICATION_NEWPAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER", "NOTIFICATION_BOOKED_CONTENT", "NOTIFICATION_BOOKED_NAN_CONTENT"];
                    var languagePayKeys = {};
                    for (var idx in Paykeys) {
                        languagePayKeys[Paykeys[idx]] = $filter("translate")(Paykeys[idx]);
                    }

                    $scope.sharerList = [];
                    if ($scope.deposit && $scope.deposit.Amount) {
                        $scope.deposit.CreatedDate = new Date();
                        $scope.paymentList.push($scope.deposit);
                    }

                    console.log('paymentList:', $scope.paymentList);
                    var customer;
                    if (!$scope.selectedItem) {
                        customer = $scope.customer;
                    } else {
                        customer = $scope.selectedItem;
                    }
                    var data = {
                        customer: customer,
                        room: $scope.room,
                        sharerList: $scope.sharerList,
                        paymentList: $scope.paymentList,
                    };
                    /* if (!$scope.room.RoomTypeId) {
                         dialogService.messageBox("MISSING_ROOM_TYPE", "PLEASE_SELECT_A_ROOM_TYPE_TO_PERFORM_RESERVE_ACTION");
                         return;
                     }
                     if (!data.customer.Fullname) {
                         $scope.warningMissingCustomer = true;
                         return;
                     }
                     if ($scope.customer.Fullname.length > 50) {
                         $scope.warningFullnameLength = true;
                         return;
                     }*/



                    if (($scope.room.Adults + $scope.room.Child) > $scope.sharerList.length) {
                        data.room.Adults = $scope.room.Adults;
                        data.room.Child = $scope.room.Child;
                    }

                    console.log("NO USE", local[3]);
                    data.room.BookingStatus = "BOOKED";
                    data.room.ArrivalDate = $scope.room.ArrivalDate;
                    data.room.DepartureDate = $scope.room.DepartureDate;
                    data.languageKeys = languagePayKeys;
                    var save = loginFactory.securedPostJSON("api/Room/Save", data);
                    $rootScope.dataLoadingPromise = save;
                    save.success(function (id) {
                        if (data.room.BookingStatus === "CHECKIN") {
                            dialogService.toast("CHECKIN_SUCCESSFUL");
                        } else {
                            dialogService.toast("RESERVE_SUCCESSFUL");
                        }
                        $mdDialog.hide();
                        local[2].Init();
                    }).error(function (err) {
                        if (err.Message) {
                            dialogService.messageBox("Error", err.Message).then(function () {
                                $state.go($state.current, {}, {
                                    reload: true
                                });
                            });
                        } else {
                            conflictReservationProcess(err);
                        }
                    });
                    //}
                }

                $scope.hide = function () {
                    jQuery(document).unbind('keydown');
                    $mdDialog.hide();
                };

                $scope.cancel = function () {
                    jQuery(document).unbind('keydown');
                    $mdDialog.cancel();
                };
            }


        } // END QUICK CHECK IN



        function conflictReservationProcess(err) {
            console.log("ERROR", err);
            if (err.ReservationRoomId) {
                //var conflictReservation = angular.copy(err.conflictReservation);
                //console.log("CONFLICT RESERVATION", conflictReservation);
                $mdDialog.show({
                    controller: ShowReservationConflictController,
                    resolve: {
                        conflictReservation: function () {
                            return err;
                        },
                    },
                    templateUrl: 'views/templates/conflictReservationDialog.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: null,
                    clickOutsideToClose: false, //fullscreen: useFullScreen
                })
                    .then(function (answer) { }, function () { });

                function ShowReservationConflictController($scope, $mdDialog, conflictReservation, loginFactory, dialogService) {
                    $scope.conflictReservationDialog = {};

                    function Init() {
                        console.log("CONFLICT RESERVATION", conflictReservation);
                        $scope.conflictReservationDialog = conflictReservation;
                        if ($scope.conflictReservationDialog.ArrivalDate) {
                            $scope.conflictReservationDialog.ArrivalDate = new Date($scope.conflictReservationDialog.ArrivalDate);
                        }
                        if ($scope.conflictReservationDialog.DepartureDate) {
                            $scope.conflictReservationDialog.DepartureDate = new Date($scope.conflictReservationDialog.DepartureDate);
                        }
                        console.log("data", $scope.conflictReservationDialog);
                    }
                    Init();
                    $scope.hide = function () {
                        $mdDialog.hide();
                    };
                    $scope.cancelDialog = function () {
                        $mdDialog.cancel();
                    };
                };
            }
        }



        $scope.buttonClick = function (ev, item, start, end) {

            if (item.BookingStatus === "AVAILABLE") {
                console.log("QUICK CHECK IN", item);
                if (item.HouseStatus === "DIRTY") {
                    dialogService.confirm("ROOM_DIRTY", "DO_YOU_WANT_TO_CONTINUE?").then(function () {
                        $scope.dialogQuickCheckIn(null, item, start, end);
                        //$scope.dialogQuickCheckIn(ev, item, start, end)
                    });
                } else {
                    $scope.dialogQuickCheckIn(null, item, start, end);
                    //$scope.dialogQuickCheckIn(ev, item, start, end)

                }
            }


            if (item.BookingStatus === "BOOKED" || item.BookingStatus === "NOSHOW") {
                console.log("RATE LIST", $scope.rateList);

                if (item.reservationRoom.DepartureDate < new Date()) {
                    dialogService.messageBox("CAN_NOT_CHECK_IN_DUE_TO_THE_DEPARTURE_DATE_WAS_IN_THE_PAST");
                    return;
                }

                if (!item.reservationRoom.RoomPriceId) {
                    var itemTemp = angular.copy(item);
                    $mdDialog.show({
                        controller: CheckInDialogController,
                        resolve: {
                            ReservationRoomId: function () {
                                return item.reservationRoom.ReservationRoomId;
                            },
                            RoomTypeId: function () {
                                return item.RoomTypeId;
                            },
                            RateList: function () {
                                return $scope.rateList;
                            }
                        },
                        templateUrl: 'views/templates/liveCheckIn.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: event,
                    }).then(function (checkInModel) {
                        var processCheckIn = loginFactory.securedPostJSON("api/Room/ProcessCheckIn?RRID=" + checkInModel.ReservationRoomId + "&roomPriceId=" + checkInModel.RoomPriceId, "");
                        $rootScope.dataLoadingPromise = processCheckIn;
                        processCheckIn.success(function (data) {
                            item.BookingStatus = "CHECKIN";
                            Init();
                            //dialogService.toast("CANCEL_BOOKING_SUCCESSFUL");
                        }).error(function (err) {
                            console.log(err);
                        })
                    }, function () {

                    });
                } else {
                    doCheckIn(item, null);
                    // doCheckIn(item, ev);
                }
            }

            //============================================== LIVE CHECKOUT ==========================================//
            if (item.BookingStatus === 'CHECKIN' || item.BookingStatus === 'OVERDUE') {
                //loinq
                $scope.dialogLiveCheckout(null, item);
                // $scope.dialogLiveCheckout(ev,item);
            }
            ev.stopPropagation();
        };

        //$scope.openMenu = function ($mdOpenMenu, ev) {
        //    originatorEv = ev;
        //    $mdOpenMenu(ev);
        //};

        $scope.getColor = function (item) {
            if (item.HouseStatus != null && item.HouseStatus != undefined) {
                return $scope.statusColors[item.HouseStatus];
            } else if (item.BookingStatus != undefined) {
                return $scope.statusColors[item.BookingStatus];
            }
        };


        $scope.securedGet = function (url, notimeout) {
            var token = !$localStorage.session ? "" : $localStorage.session.access_token;
            console.log("TOKEN", token);
            if (!$localStorage.session && !notimeout) {
                return;
            }
            var get = $http({
                url: url,
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            });
            if ($localStorage.session)
                loginFactory.refreshToken(null, null);
            get.error(
                function (data, status) {
                    console.log(data, status);
                    if (status == 401 && !notimeout) {
                        loginFactory.sessionTimeout();

                    } else if (status == 403) {
                        dialogService.messageBox("NOT_ENOUGH_PERMISSION");
                    }
                }
            );
            return get;
        }

        $scope.readCard = function () {
            smartCardFactory.readCard();
        }
    }]);

function showUR(date) {
    dateUR = date;
}

function CheckInDialogController($scope, $mdDialog, ReservationRoomId, RoomTypeId, RateList, loginFactory) {

    function Init() {
        $scope.ReservationRoomId = ReservationRoomId;
        $scope.RoomTypeId = RoomTypeId;
        $scope.rateList = RateList;
        $scope.RoomPriceId = null;
    }
    Init();

    $scope.processCheckIn = function () {
        var checkInModel = {
            ReservationRoomId: $scope.ReservationRoomId,
            RoomPriceId: $scope.RoomPriceId
        };
        $mdDialog.hide(checkInModel);
    }

    $scope.hide = function () {
        $mdDialog.hide();
    };
    $scope.cancel = function () {
        $mdDialog.cancel();
    };
}

// function LiveCheckOutController($scope, $mdDialog, $filter, $rootScope, loginFactory, dialogService, $state, local, currentHotelConnectivities, smartCardFactory,roomListFactory,SharedFeaturesFactory) {
//     $scope.localCopy = local;
//     $scope.decimal = $rootScope.decimals;
//     $scope.type = "CHECKOUT";
//     $scope.btDisabled = true;
//     $scope.listItems = [];
//     $scope.removeItem = false;
//     $scope.ExtraServiceQuantity = 1;
//     $scope.isSelectedTab = false;
//     $scope.SendEmail = false;

//     var keys = ["ROOM_MONTHLY", "ROOM_WEEKLY", "ROOM_FULL_DAY", "ROOM_DAY_NIGHT", "ROOM_HOURLY", "MINIBAR", "LAUNDRY", "EXTRA_ROOM_CHARGE", "COMPENSATION", "EXTRA_SERVICES", "FULL_DAY_EARLY_CHECKIN", "FULL_DAY_LATE_CHECKOUT", "DAY_NIGHT_EARLY_CHECKIN", "DAY_NIGHT_LATE_CHECKOUT", "EXTRA_ADULTS", "EXTRA_CHILDREN"];
//     var languageKeys = {};
//     for (var idx in keys) {
//         languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
//     }

//     function getOldES(data) {
//         for (var idx in data.ExtraServiceTypes) {
//             data.ExtraServiceTypes[idx].IsHide = true;
//             var countItem = data.ExtraServiceItems.filter(function (item) {
//                 return data.ExtraServiceTypes[idx].ExtraServiceTypeId == item.ExtraServiceTypeId;
//             });
//             if (countItem.length > 0) {
//                 data.ExtraServiceTypes[idx].IsHide = false;
//             }
//         }
//         //
//         var oldES = local[1];
//         if (oldES != undefined && oldES != null) {
//             angular.forEach(oldES.items, function (arr) {
//                 angular.forEach(data.ExtraServiceItems, function (arr1) {
//                     if (arr1.ExtraServiceItemId == arr.item.ExtraServiceItemId) {
//                         arr1.quantity = arr.item.quantity;
//                     } else if (arr.item.RoomExtraServiceName == "EXTRA_SERVICES") {
//                         $scope.ExtraServiceDescription = arr.item.RoomExtraServiceDescription;
//                         $scope.ExtraServiceAmount = arr.item.Amount;
//                     }
//                 });
//             });
//         }
//         return data;
//     }

//     function resultDataProcess(data) {
//         if (data.planListConstantlyFormula) {
//             for (var index in data.planListConstantlyFormula) {
//                 var formulaTemp = data.planListConstantlyFormula[index];

//                 formulaTemp.Range.Start = new Date(formulaTemp.Range.Start);
//                 formulaTemp.Range.End = new Date(formulaTemp.Range.End);
//                 formulaTemp.FormulaPeriodAfter = formulaTemp.FormulaPeriod;
//                 if (_.size(formulaTemp.NotAvailableDays) > 0) {
//                     formulaTemp.FormulaPeriodAfter = formulaTemp.FormulaPeriod - _.size(formulaTemp.NotAvailableDays);

//                     for (var index2 in formulaTemp.NotAvailableDays) {
//                         var dateTemp = new Date(formulaTemp.NotAvailableDays[index2]).toLocaleDateString();
//                         formulaTemp.NotAvailableDays[index2] = dateTemp;
//                     }
//                 }
//             }
//         }

//         if (data.planListFullDayFormula && data.day > 0 && data.planListFullDayFormula.length > 0) {
//             for (var index in data.planListFullDayFormula) {
//                 var formulaTemp = data.planListFullDayFormula[index];

//                 formulaTemp.range.Start = new Date(formulaTemp.range.Start);
//                 formulaTemp.range.End = new Date(formulaTemp.range.End);
//             }
//         }
//         if (data.planListHourlyFormula) {
//             if (data.planListHourlyFormula.availableHourlyFormula) {
//                 for (var index in data.planListHourlyFormula.availableHourlyFormula) {
//                     var formulaTemp = data.planListHourlyFormula.availableHourlyFormula[index];

//                     formulaTemp.Range.Start = new Date(formulaTemp.Range.Start);
//                     formulaTemp.Range.End = new Date(formulaTemp.Range.End);
//                 }
//             }
//             if (data.planListHourlyFormula.finalHourlyFormula) {
//                 data.planListHourlyFormula.finalHourlyFormula.Range.Start = new Date(data.planListHourlyFormula.finalHourlyFormula.Range.Start);
//                 data.planListHourlyFormula.finalHourlyFormula.Range.End = new Date(data.planListHourlyFormula.finalHourlyFormula.Range.End);
//             }
//         }
//         return data;
//     };
//     $scope.remainingAmount = function () {
//         var total = 0;
//         total = $scope.room.Total;
//         for (var idx in $scope.RoomExtraServices) {
//             if ($scope.RoomExtraServices[idx].willPay && !$scope.RoomExtraServices[idx].IsDeleted) {
//                 total += $scope.RoomExtraServices[idx].Amount * $scope.RoomExtraServices[idx].Quantity;
//             }
//         }
//         for (var idx in $scope.Payments) {
//             total -= $scope.Payments[idx].Amount;
//         }
//         //làm tròn số thập phân sau , theo tiền tệ
//         total = parseFloat(total.toFixed($rootScope.decimals));
//         return total;
//     };

//     function Init() {
//         //$scope.dialog = local[2].dialogLiveCheckout;
//         $scope.currentItem = local[0];
//         $scope.showInvoice = true;
//         $scope.showEmail = false;
//         var getQuickCheckOut = loginFactory.securedGet("api/Room/GetQuickCheckOut", "reservationRoomId=" + $scope.currentItem.reservationRoom.ReservationRoomId);
//         $rootScope.dataLoadingPromise = getQuickCheckOut;
//         getQuickCheckOut.success(function (data) {
//             console.log('Quick CheckOut', data);

//             if (data.hotelEmailModule != null) {
//                 $scope.showEmail = true;
//                 $scope.SendEmail = true;
//             }

//             var extraService = data.ListExtraService;
//             var reservationRoom = data.Reservation;
//             var calculateRoomPrice = data.CalculateRoomPrice;
//             var hotelFormInvoice = data.FormInvoice;
//             //Extra Service
//             for (var index in extraService.ExtraServiceItems) {
//                 if (!extraService.ExtraServiceItems[index].quantity) {
//                     extraService.ExtraServiceItems[index].quantity = 0;
//                 }
//                 for (var index2 in extraService.ExtraServiceTypes) {
//                     if (extraService.ExtraServiceTypes[index2].ExtraServiceTypeId.toString() === extraService.ExtraServiceItems[index].ExtraServiceTypeId.toString()) {
//                         extraService.ExtraServiceItems[index].ExtraServiceTypeName = extraService.ExtraServiceTypes[index2].ExtraServiceTypeName;
//                         break;
//                     }
//                 }
//             }
//             var item = {
//                 ExtraServiceTypeName: 'EXTRA_SERVICES',
//                 ExtraServiceItemName: 'ADD_NEW_ITEM'
//             };
//             extraService.ExtraServiceItems.push(item);
//             // extraService.ExtraServiceItems.sort(function(a, b) {
//             //     return a.Priority - b.Priority;
//             // });
//             $scope.extraservice = getOldES(extraService);
//             console.log("ExtraServiceItems:", $scope.extraservice.ExtraServiceItems);
//             //ReservationRoom
//             $scope.room = reservationRoom.room;
//             $scope.room.IsPreCheckOut = data.IsPreCheckOut;
//             $scope.room.RoomName = $scope.currentItem.RoomName;
//             $scope.customer = reservationRoom.customer;
//             $scope.applyPastCheckOut = reservationRoom.applyPastCheckOut;
//             //Currencies
//             $scope.currencies = reservationRoom.currencies;
//             $scope.defaultCurrency = reservationRoom.defaultCurrency;
//             //shareList
//             $scope.sharerList = reservationRoom.sharerList;
//             //Extra Service
//             $scope.ExtraServices = reservationRoom.extraServices;
//             $scope.ExtraServiceItems = reservationRoom.extraServiceItems;
//             var payments = angular.copy(reservationRoom.Payments);
//             // for (var index in payments) {
//             //     payments[index].CreatedDate = new Date(payments[index].CreatedDate);
//             // }
//             $scope.Payments = payments;


//             $scope.RoomExtraServices = reservationRoom.roomExtraServices;
//             for (var idx in $scope.RoomExtraServices) {
//                 $scope.RoomExtraServices[idx].CreatedDate = new Date($scope.RoomExtraServices[idx].CreatedDate);
//                 $scope.RoomExtraServices[idx].willPay = true;
//             }
//             if (reservationRoom.room.ArrivalDate) {
//                 reservationRoom.room.ArrivalDate = new Date(reservationRoom.room.ArrivalDate);
//             }
//             if (reservationRoom.room.DepartureDate) {
//                 reservationRoom.room.DepartureDate = new Date(reservationRoom.room.DepartureDate);
//             }

//             $scope.paymentMethods = reservationRoom.paymentMethods;
//             for (var index in $scope.paymentMethods) {
//                 if ($scope.paymentMethods[index].PaymentMethodName.toLowerCase() === "cash") {
//                     $scope.defaultPaymentMethod = $scope.paymentMethods[index];
//                     break;
//                 }
//             }
//             //CalculateRoomPrice

//             $scope.priceList = calculateRoomPrice;
//             $scope.room.Total = calculateRoomPrice.totalPrice;
//             $scope.priceList = resultDataProcess(calculateRoomPrice);
//             $scope.Amount = $scope.remainingAmount();
//             console.log('Amount:', $scope.Amount);
//             $scope.payment = {
//                 Amount: $scope.remainingAmount(),
//                 PaymentMethodId: $scope.defaultPaymentMethod.PaymentMethodId,
//                 MoneyId: $scope.defaultCurrency.MoneyId,
//                 PaymentTypeName: "NEW_PAYMENT",
//                 SendEmail: $scope.SendEmail
//             };

//             //FormInvoice
//             $scope.hotelFormRoomInvoice = hotelFormInvoice.FormType + hotelFormInvoice.Value + '.trdx';
//             setTimeout(function () {
//                 $scope.$apply()
//             }, 0);
//         })
//     }
//     Init();

//     function processIsInputCardToCheckOut(callback) {
//         console.log('Connectivities CheckOut', currentHotelConnectivities);
//         if ($scope.room && $scope.room.IsPreCheckOut) {
//             callback(true);
//             return;
//         }
//         if (currentHotelConnectivities && currentHotelConnectivities.isUsed) {
//             //use card to checkout
//             if ($rootScope.Connectivities != null && $rootScope.Connectivities.code.HotelConnectivityModuleName === "SMART_NEO_LOCK" && currentHotelConnectivities.IsInputCardToCheckout) {
//                 var writeCardModel = {
//                     RoomName: $scope.room.RoomName,
//                     RoomDescription: $scope.currentItem.RoomDescription,
//                     TravellerName: $scope.customer.Fullname,
//                     ArrivalDate: new Date(),
//                     DepartureDate: $scope.room.DepartureDate,
//                     OverrideOldCards: true
//                 };

//                 if ($rootScope.IsAutomaticalAddHourCheckout == true) {
//                     writeCardModel = smartCardFactory.addHourCheckOutCard(writeCardModel, $rootScope.HourAddToCheckout);
//                 };
//                 var cardPromise = smartCardFactory.reWriteCard(writeCardModel, $scope.room.ReservationRoomId, null);
//                 cardPromise.then(function (data) {
//                     console.log("DATA PROMISE", data.Result);
//                     if (data.passcode != null) {
//                         //dialogService.toastSuccess($filter("translate")("CREATE_CARD_SUCCESSFUL") + " " + data.passcode);
//                         callback(true);
//                     } else {
//                         dialogService.messageBox(data.message);
//                         callback(false);
//                     }
//                 });
//             }
//             else {
//                 if (currentHotelConnectivities.IsInputCardToCheckout) {
//                     dialogService.messageBox("PLEASE_BE_SURE_THE_VALID_CARD_IS_BEING_INSERTED").then(function (arr) {
//                         var readCard = smartCardFactory.readCardOnly();
//                         readCard.then(function (dataCard) {
//                             console.info('read card only', dataCard);
//                             if (dataCard == -1) {
//                                 dialogService.messageBox("INVALID_CARD");
//                                 callback(false);
//                             } else if (dataCard && dataCard.TravellerId) {
//                                 console.log('Vao day');
//                                 if (dataCard.TravellerId == $scope.room.ReservationRoomId) {
//                                     callback(true);
//                                 } else {
//                                     dialogService.messageBox("CARD_IS_NOT_CORRECT_ROOM");
//                                     callback(false);
//                                 }

//                             }
//                         });
//                     });
//                 } else
//                     callback(true);
//             }
//         } else {
//             //Not use Smart Card
//             callback(true);
//         }
//     };

//     function deleteCard() {
//         if ($scope.room && $scope.room.IsPreCheckOut) {
//             return;
//         }
//         if (currentHotelConnectivities && currentHotelConnectivities.isUsed) {
//             if (currentHotelConnectivities.IsInputCardToCheckout && ($rootScope.Connectivities != null && $rootScope.Connectivities.code.HotelConnectivityModuleName != "SMART_NEO_LOCK")) {
//                 var deleteCardModel = {
//                     ArrivalDate: $scope.room.ArrivalDate,
//                     DepartureDate: $scope.room.DepartureDate,
//                     RoomName: $scope.room.RoomName,
//                     TravellerId: $scope.room.ReservationRoomId,
//                 };
//                 smartCardFactory.deleteCard(deleteCardModel);
//             }
//         }
//     }
//     $scope.processQuickCheckOut = function () {
//         //check smart card
//         if (processIsInputCardToCheckOut(function (dataCard) {
//             //
//             if (!dataCard) return;
//             //
//             var paymentModel = null;
//             if ($scope.Amount != 0) {
//                 //Payment
//                 var Paykeys = ["RES_NO", "ROOM", "NOTIFICATION_CHECKOUT_MES", "NOTIFICATION_NEWPAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER"];
//                 var languagePayKeys = {};
//                 for (var idx in Paykeys) {
//                     languagePayKeys[Paykeys[idx]] = $filter("translate")(Paykeys[idx]);
//                 };
//                 var payment = angular.copy($scope.payment);
//                 payment.ReservationRoomId = $scope.currentItem.reservationRoom.ReservationRoomId;
//                 paymentModel = {
//                     payment: payment,
//                     languageKeys: languagePayKeys
//                 };
//                 //
//                 if ($scope.Amount < 0) {
//                     paymentModel.payment.PaymentTypeName = "REFUND";
//                 };
//             } else {
//                 var Paykeys = ["RES_NO", "ROOM", "NOTIFICATION_CHECKOUT_MES", "NOTIFICATION_NEWPAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER"];
//                 var languagePayKeys = {};
//                 for (var idx in Paykeys) {
//                     languagePayKeys[Paykeys[idx]] = $filter("translate")(Paykeys[idx]);
//                 };
//                 paymentModel = {
//                     payment: {},
//                     languageKeys: languagePayKeys
//                 };
//             }
//             //process checkout
//             var keys = ["ROOM_MONTHLY", "NOTIFICATION_CHECKOUT_MES", "ROOM_WEEKLY", "ROOM_FULL_DAY", "ROOM_DAY_NIGHT", "ROOM_HOURLY", "MINIBAR", "LAUNDRY", "EXTRA_ROOM_CHARGE", "COMPENSATION", "EXTRA_SERVICES", "FULL_DAY_EARLY_CHECKIN", "FULL_DAY_LATE_CHECKOUT", "DAY_NIGHT_EARLY_CHECKIN", "DAY_NIGHT_LATE_CHECKOUT", "EXTRA_ADULTS", "EXTRA_CHILDREN", "PAYMENT", "DISCOUNT_MONEY_OFF", "DISCOUNT_PERCENT_OFF", "FREE"];
//             var languageKeys1 = {};
//             for (var idx in keys) {
//                 languageKeys1[keys[idx]] = $filter("translate")(keys[idx]);
//             }
//             //
//             var currentRoom = angular.copy($scope.room);
//             currentRoom.BookingStatus = "CHECKOUT";
//             if (!$scope.applyPastCheckOut) {
//                 currentRoom.DepartureDate = new Date();
//             }
//             var data = {
//                 room: currentRoom,
//                 customer: $scope.customer,
//                 paymentList: undefined,
//                 languageKeys: languageKeys1,
//                 sharerList: $scope.sharerList
//             }
//             var model = {
//                 Payments: paymentModel,
//                 RoomData: data,
//                 SendEmail: $scope.SendEmail
//             }
//             var promise = loginFactory.securedPostJSON("api/Room/ProcessQuickCheckOut", model);
//             $rootScope.dataLoadingPromise = promise;
//             promise.success(function (id) {
//                 local[2].Init();

//                 deleteCard();
//                 dialogService.toast("CHECKOUT_SUCCESSFUL");
//                 $mdDialog.hide();
//                 //$rootScope.pageInit = true;
//             }).error(function (err) {
//                 dialogService.toast("ERROR:" + err.Message);
//                 if (err.Message) {
//                     dialogService.messageBox("ERROR", err.Message);
//                 } else {
//                     //conflictReservationProcess(err);
//                     data.room.BookingStatus = "CHECKIN";
//                     SharedFeaturesFactory.processConflictReservation(err,data.room, "CHECKOUT");
//                 }
//             });
//         }));
//     }

//     function conflictReservationProcess(err) {
//         console.log("ERROR", err);
//         if (err.ReservationRoomId) {
//             //var conflictReservation = angular.copy(err.conflictReservation);
//             //console.log("CONFLICT RESERVATION", conflictReservation);
//             $mdDialog.show({
//                 controller: ['$scope', '$mdDialog', 'conflictReservation', 'loginFactory', 'dialogService', ShowReservationConflictController],
//                 resolve: {
//                     conflictReservation: function () {
//                         return err;
//                     },
//                 },
//                 templateUrl: 'views/templates/conflictReservationDialog.tmpl.html',
//                 parent: angular.element(document.body),
//                 targetEvent: null,
//                 clickOutsideToClose: false, //fullscreen: useFullScreen
//             })
//                 .then(function (answer) { }, function () { });

//             function ShowReservationConflictController($scope, $mdDialog, conflictReservation, loginFactory, dialogService) {
//                 $scope.conflictReservationDialog = {};

//                 function Init() {
//                     console.log("CONFLICT RESERVATION", conflictReservation);
//                     $scope.conflictReservationDialog = conflictReservation;
//                     if ($scope.conflictReservationDialog.ArrivalDate) {
//                         $scope.conflictReservationDialog.ArrivalDate = new Date($scope.conflictReservationDialog.ArrivalDate);
//                     }
//                     if ($scope.conflictReservationDialog.DepartureDate) {
//                         $scope.conflictReservationDialog.DepartureDate = new Date($scope.conflictReservationDialog.DepartureDate);
//                     }
//                     console.log("data", $scope.conflictReservationDialog);
//                 }
//                 Init();
//                 $scope.hide = function () {
//                     $mdDialog.hide();
//                 };
//                 $scope.cancelDialog = function () {
//                     $mdDialog.cancel();
//                 };
//             };
//         }
//     }

//     $scope.hide = function () {
//         $mdDialog.hide();
//     };
//     $scope.cancel = function () {
//         $mdDialog.cancel(false);
//     };
//     $scope.addExtraService = function () {
//         var keys = ["RES_NO", "ROOM", "NOTIFICATION_POST_EXTRASERVICE", "EXTRA_SERVICE"];
//         var languageKeys1 = {};
//         for (var idx in keys) {
//             languageKeys1[keys[idx]] = $filter("translate")(keys[idx]);
//         }
//         $scope.listItem = {
//             ReservationRoomId: $scope.currentItem.reservationRoom.ReservationRoomId,
//             description: "",
//             name: "",
//             items: [],
//             languageKeys: languageKeys1
//         };

//         if ($scope.ExtraServiceDescription != null || $scope.ExtraServiceAmount != undefined) {
//             var isError = false;
//             if ($scope.ExtraServiceDescription == undefined || $scope.ExtraServiceDescription.length == 0 || $scope.ExtraServiceDescription.length > 51) {
//                 $scope.warningMissingExtraServiceDescription = true;
//                 $scope.warningMissingExtraServiceAmount = false;
//                 $scope.warningMissingExtraServiceQuantity = false;
//                 isError = true;
//             };
//             if ($scope.ExtraServiceAmount == undefined) {
//                 $scope.warningMissingExtraServiceDescription = false;
//                 $scope.warningMissingExtraServiceAmount = true;
//                 $scope.warningMissingExtraServiceQuantity = false;
//                 isError = true;
//             };
//             if ($scope.ExtraServiceQuantity == undefined || $scope.ExtraServiceQuantity <= 0) {
//                 $scope.warningMissingExtraServiceDescription = false;
//                 $scope.warningMissingExtraServiceAmount = false;
//                 $scope.warningMissingExtraServiceQuantity = true;
//                 isError = true;
//             };
//             if (isError == true) {
//                 $scope.isSelectedTab = true;
//                 return;
//             }
//             $scope.listItem.items.push({
//                 quantity: $scope.ExtraServiceQuantity,
//                 item: {
//                     Amount: $scope.ExtraServiceAmount,
//                     Quantity: $scope.ExtraServiceQuantity,
//                     ReservationRoomId: $scope.currentItem.reservationRoom.ReservationRoomId,
//                     RoomExtraServiceDescription: $scope.ExtraServiceDescription,
//                     RoomExtraServiceName: "EXTRA_SERVICES",
//                     languageKeys: languageKeys1,
//                 },
//                 ExtraServiceTypeName: "EXTRA_SERVICES"
//             });
//         }
//         angular.forEach($scope.extraservice.ExtraServiceItems, function (arr) {
//             if (arr.quantity > 0) {
//                 $scope.listItem.items.push({
//                     quantity: arr.quantity,
//                     item: arr,
//                     ExtraServiceTypeName: arr.ExtraServiceTypeName
//                 });
//             }
//         });
//         if ($scope.listItem.items.length > 0) {
//             $mdDialog.hide();
//             $mdDialog.show({
//                 //controller: AddESDialogController,
//                 templateUrl: 'views/templates/quickExtraServiceConfirm.tmpl.html',
//                 locals: {
//                     local: [$scope.listItem]
//                     //local: $scope.localCopy

//                 },
//                 controller: ['$scope', '$mdDialog', '$rootScope', 'loginFactory', 'local', AddESDialogController],
//                 parent: angular.element(document.body), //targetEvent: ev,
//             })
//                 .then(function () {

//                 }, function (isReload) {
//                     var local = [$scope.currentItem];
//                     if (isReload != undefined && !isReload) {
//                         local = [$scope.currentItem, $scope.listItem];
//                     }
//                     $scope.checkOutDialog = $mdDialog;
//                     $scope.checkOutDialog.show({
//                         templateUrl: 'views/templates/liveCheckOut.tmpl.html',
//                         clickOutsideToClose: false,
//                         locals: {
//                             local: $scope.localCopy
//                         },
//                         resolve: {
//                             currentHotelConnectivities: function () {
//                                 return currentHotelConnectivities;
//                             }
//                         },
//                         controller: ['$scope', '$mdDialog', '$filter', '$rootScope', 'loginFactory', 'dialogService', '$state', 'local', 'currentHotelConnectivities', 'smartCardFactory','SharedFeaturesFactory', LiveCheckOutController]
//                     }).then(function (data) {
//                         // if (data != undefined && data == true) {
//                         //     //loinq
//                         //     $state.go($state.current, {}, {
//                         //         reload: true
//                         //     });
//                         // }
//                     }, function (data) {

//                     });
//                 });
//         }


//     }
//     $scope.changeTab = function (action) {
//         $scope.isSelectedTab = false;
//         $scope.type = action;
//     }



//     $scope.ShowInvoice = function (ev) {
//         $mdDialog.hide();
//         var keys = ["ROOM_MONTHLY", "ROOM_WEEKLY", "ROOM_FULL_DAY", "ROOM_DAY_NIGHT", "ROOM_HOURLY", "MINIBAR", "LAUNDRY", "EXTRA_ROOM_CHARGE", "COMPENSATION", "EXTRA_SERVICES", "FULL_DAY_EARLY_CHECKIN", "FULL_DAY_LATE_CHECKOUT", "DAY_NIGHT_EARLY_CHECKIN", "DAY_NIGHT_LATE_CHECKOUT", "EXTRA_ADULTS", "EXTRA_CHILDREN", "PAYMENT", "DISCOUNT_MONEY_OFF", "DISCOUNT_PERCENT_OFF", "FREE"];
//         var languageKeys = {};
//         for (var idx in keys) {
//             languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
//         }
//         var CreateRoomInvoice = {
//             roomId: $scope.room.RoomId,
//             reservationRoomId: $scope.currentItem.reservationRoom.ReservationRoomId,
//             arrivalDate: $scope.room.ArrivalDate,
//             departureDate: new Date(),
//             adults: $scope.room.Adults,
//             children: $scope.room.Child,
//             languageKeys: languageKeys,
//             FOC: $scope.room.Foc,
//             DiscountPercentage: $scope.room.DiscountPercentage,
//             DiscountFlat: $scope.room.DiscountFlat,
//             RoomPriceId: $scope.room.RoomPriceId,
//             Price: $scope.room.Price
//         }

//         var modelRoomInvoiceFullDay = {
//             roomId: $scope.room.RoomId,
//             reservationRoomId: $scope.currentItem.reservationRoom.ReservationRoomId,
//             arrivalDate: $scope.room.ArrivalDate,
//             departureDate: $scope.room.DepartureDate,
//             adults: $scope.room.Adults,
//             children: $scope.room.Child,
//             languageKeys: languageKeys,
//             FOC: $scope.room.Foc,
//             DiscountPercentage: $scope.room.DiscountPercentage,
//             DiscountFlat: $scope.room.DiscountFlat,
//             RoomPriceId: $scope.room.RoomPriceId,
//             Price: $scope.room.Price
//         }
//         if ($scope.applyPastCheckOut) {
//             CreateRoomInvoice.departureDate = $scope.room.DepartureDate;
//         } else {

//         }
//         var CreateRoomInvoice = loginFactory.securedPostJSON("api/Room/CreateRoomInvoice", CreateRoomInvoice);
//         $rootScope.dataLoadingPromise = CreateRoomInvoice;
//         CreateRoomInvoice.success(function (data) {

//             $mdDialog.show({
//                 controller: ['$scope', '$mdDialog', 'loginFactory', 'reservationRoomId', 'hotelFormRoomInvoice', 'modelRoomInvoiceFullDay', '$rootScope', InvoiceController], //controller: InvoiceController,
//                 locals: {
//                     reservationRoomId: $scope.currentItem.reservationRoom.ReservationRoomId,
//                     hotelFormRoomInvoice: $scope.hotelFormRoomInvoice,
//                     modelRoomInvoiceFullDay: modelRoomInvoiceFullDay
//                 },
//                 templateUrl: 'views/templates/invoice.tmpl.html',
//                 parent: angular.element(document.body),
//                 targetEvent: ev,
//                 clickOutsideToClose: false
//             })
//                 .then(function () {

//                 }, function () {
//                     $scope.checkOutDialog = $mdDialog;
//                     $scope.checkOutDialog.show({
//                         templateUrl: 'views/templates/liveCheckOut.tmpl.html',
//                         clickOutsideToClose: false,
//                         locals: {
//                             //local: [$scope.currentItem]
//                             local: $scope.localCopy

//                         },
//                         resolve: {
//                             currentHotelConnectivities: function () {
//                                 return currentHotelConnectivities;
//                             }
//                         },
//                         controller: ['$scope', '$mdDialog', '$filter', '$rootScope', 'loginFactory', 'dialogService', '$state', 'local', 'currentHotelConnectivities', 'smartCardFactory','SharedFeaturesFactory', LiveCheckOutController]
//                     }).then(function (data) {
//                         /*if (data != undefined && data == true) {
//                             //loinq
//                             console.log('reload page');
//                             $state.go($state.current, {}, {
//                                 reload: true
//                             });
//                         }*/
//                     }, function (data) {

//                     });
//                 });
//         }).error(function (err) {
//             dialogService.toast("ERROR" + err.Message);
//         });
//     }

//     /*
//         function InvoiceController($scope, $mdDialog, loginFactory, reservationRoomId, hotelFormRoomInvoice, $rootScope) {

//             globalInvoiceId = reservationRoomId;

//             HotelFormRoomInvoice = hotelFormRoomInvoice;
//             _reservationId = 0;


//             //
//             $scope.showScreen = true;
//             $scope.showExtendedScreen = function() {
//                 $scope.showScreen = false;
//                 var tab = $rootScope.ExtendedScreen;
//                 if (tab != null && tab.Document != null) {
//                     tab.focus();
//                     loginFactory.securedGet("api/Test/Message", "id=" + reservationRoomId + "&cmd=showInvoice" + "&hotelInvoice=" + hotelFormRoomInvoice);
//                 } else {
//                     tab = window.open("#/extendedScreen", '_blank');
//                     $rootScope.ExtendedScreen = tab;
//                     setTimeout(function() {
//                         loginFactory.securedGet("api/Test/Message", "id=" + reservationRoomId + "&cmd=showInvoice" + "&hotelInvoice=" + hotelFormRoomInvoice);
//                     }, 7000)
//                 }
//             };
//             $scope.hideExtendedScreen = function() {
//                 $scope.showScreen = true;
//                 loginFactory.securedGet("api/Test/Message", "id=" + reservationRoomId + "&cmd=hideInvoice" + "&hotelInvoice=" + hotelFormRoomInvoice);
//             };



//             $scope.hide = function() {
//                 $mdDialog.hide();
//             };
//             $scope.cancel = function() {
//                 $mdDialog.cancel();
//             };
//         }*/
//     function InvoiceController($scope, $mdDialog, loginFactory, reservationRoomId, hotelFormRoomInvoice, modelRoomInvoiceFullDay, $rootScope) {
//         $scope.hideFullDay = false;
//         $scope.isFullDay = true;
//         var modelRoomInvoiceFullDayTemp = angular.copy(modelRoomInvoiceFullDay);
//         globalInvoiceId = reservationRoomId;

//         HotelFormRoomInvoice = hotelFormRoomInvoice;
//         _reservationId = 0;

//         $scope.showInvoiceFullDay = function (isFullDay) {
//             if (isFullDay == false) {
//                 var CreateRoomInvoice = loginFactory.securedPostJSON("api/Room/CreateRoomInvoice", modelRoomInvoiceFullDay);
//                 $rootScope.dataLoadingPromise = CreateRoomInvoice;
//                 CreateRoomInvoice.success(function (data) {
//                     showReport();
//                 });
//             } else {
//                 modelRoomInvoiceFullDayTemp.departureDate = new Date();
//                 var CreateRoomInvoice = loginFactory.securedPostJSON("api/Room/CreateRoomInvoice", modelRoomInvoiceFullDayTemp);
//                 $rootScope.dataLoadingPromise = CreateRoomInvoice;
//                 CreateRoomInvoice.success(function (data) {
//                     showReport();
//                 });
//             }
//         };
//         //
//         $scope.showScreen = true;
//         $scope.showExtendedScreen = function () {
//             $scope.showScreen = false;
//             var tab = $rootScope.ExtendedScreen;
//             if (tab != null && tab.Document != null) {
//                 tab.focus();
//                 loginFactory.securedGet("api/Test/Message", "id=" + reservationRoomId + "&cmd=showInvoice" + "&hotelInvoice=" + hotelFormRoomInvoice);
//             } else {
//                 tab = window.open("#/extendedScreen", '_blank');
//                 $rootScope.ExtendedScreen = tab;
//                 setTimeout(function () {
//                     loginFactory.securedGet("api/Test/Message", "id=" + reservationRoomId + "&cmd=showInvoice" + "&hotelInvoice=" + hotelFormRoomInvoice);
//                 }, 7000)
//             }
//         };
//         $scope.hideExtendedScreen = function () {
//             $scope.showScreen = true;
//             loginFactory.securedGet("api/Test/Message", "id=" + reservationRoomId + "&cmd=hideInvoice" + "&hotelInvoice=" + hotelFormRoomInvoice);
//         };



//         $scope.hide = function () {
//             $mdDialog.hide();
//         };
//         $scope.cancel = function () {
//             $mdDialog.cancel();
//         };
//     }

//     function AddESDialogController($scope, $mdDialog, $rootScope, loginFactory, local) {
//         console.log(local[0]);
//         $scope.items = local[0];
//         $scope.hide = function () {
//             $mdDialog.hide(false);
//         };
//         $scope.cancel = function () {
//             $mdDialog.cancel(false);
//         }
//         $scope.getTotal = function (items) {
//             var total = 0;
//             angular.forEach(items.items, function (arr) {
//                 if (arr.ExtraServiceTypeName != 'EXTRA_SERVICES') {
//                     total += arr.item.Price * arr.item.quantity;
//                 } else {
//                     total += arr.item.Amount * arr.quantity;
//                 }
//             });
//             return total;
//         };
//         $scope.addExtraService = function () {
//             if ($scope.items.items.length == 1) {
//                 if ($scope.items.items[0].item.RoomExtraServiceName == "EXTRA_SERVICES") {
//                     var saveItemsNoItem = loginFactory.securedPostJSON("api/Room/CreateExtraServiceNoItem", $scope.items.items[0].item);
//                     $rootScope.dataLoadingPromise = saveItemsNoItem;
//                     saveItemsNoItem.success(function (data) {
//                         $mdDialog.cancel(true);
//                         dialogService.toast("ADD_EXTRA_SERVICE_SUCCESSFUL");
//                     }).error(function (e) {
//                         dialogService.toast("ERROR" + e.Message);
//                     });
//                 } else {
//                     var saveItems = loginFactory.securedPostJSON("api/Room/QuickCreateExtraService", $scope.items);
//                     $rootScope.dataLoadingPromise = saveItems;
//                     saveItems.success(function (data) {
//                         $mdDialog.cancel(true);
//                         dialogService.toast("ADD_EXTRA_SERVICE_SUCCESSFUL");
//                     }).error(function (e) {
//                         dialogService.toast("ERROR" + e.Message);
//                     });
//                 }
//             } else {
//                 var saveItems = loginFactory.securedPostJSON("api/Room/QuickCreateExtraService", $scope.items);
//                 $rootScope.dataLoadingPromise = saveItems;
//                 saveItems.success(function (data) {
//                     angular.forEach($scope.items.items, function (arr) {
//                         if (arr.item.RoomExtraServiceName == "EXTRA_SERVICES") {
//                             var saveItemsNoItem = loginFactory.securedPostJSON("api/Room/CreateExtraServiceNoItem", arr.item);
//                             $rootScope.dataLoadingPromise = saveItemsNoItem;
//                             saveItemsNoItem.success(function (data) { }).error(function (e) {
//                                 dialogService.toast("ERROR" + e.Message);
//                             });
//                         }
//                     });
//                     $mdDialog.cancel(true);
//                     dialogService.toast("ADD_EXTRA_SERVICE_SUCCESSFUL");
//                 }).error(function (e) {
//                     dialogService.toast("ERROR" + e.Message);
//                 });
//             }
//         }
//     }
//     $scope.autoScrollTop = function () {
//         //jQuery("#right_column").scrollTop(0);
//     }

// }

// function RoomMoveDialogController($scope, $mdDialog, item, currentRoom, roomListFactory, newRoomId, $rootScope, $filter, loginFactory, dialogService, reservationFactory) {
//     console.log("CURRENT ROOM", currentRoom);
//     var newRoom = {
//         RoomTypeId: currentRoom.roomType.RoomTypeId,
//         RoomId: 0,
//         RoomPriceId: 0,
//         RoomMoveFee: 0
//     };
//     $scope.isSelected = false;
//     $scope.priceRateList = [];
//     $scope.usePriceRateType = 1;
//     var oldRoomId = currentRoom.RoomId;

//     function Init() {
//         $scope.DateTimePickerOption = {
//             format: 'dd/MM/yyyy HH:mm'
//         };
//         $scope.decimal = $rootScope.decimals;
//         $scope.warningMissingRoom = false;
//         $scope.currentRoom = currentRoom;
//         $scope.newRoom = newRoom;
//         $scope.isSelected = false;
//         $scope.currentRoom.reservationRoom.ArrivalDate = angular.copy(new Date($scope.currentRoom.ArrivalDate));
//         $scope.currentRoom.reservationRoom.DepartureDate = angular.copy(new Date($scope.currentRoom.DepartureDate));
//         $scope.str = $scope.currentRoom.reservationRoom.ArrivalDate.format('dd/mm/yyyy HH:MM');
//         $scope.str2 = $scope.currentRoom.reservationRoom.DepartureDate.format('dd/mm/yyyy HH:MM');
//         roomListFactory.getPriceRateList(function (data) {
//             $scope.planList = data;
//             console.log('planList', $scope.planList);
//             for (var index in $scope.planList) {
//                 if ($scope.currentRoom.reservationRoom.RoomPriceId && $scope.currentRoom.reservationRoom.RoomPriceId.toString() === $scope.planList[index].RoomPriceId.toString()) {
//                     $scope.currentRoom.RoomPriceName = $scope.planList[index].RoomPriceName;
//                     break;
//                 }
//             }
//             $scope.priceRateList = $scope.planList.sort(function (a, b) {
//                 return parseInt(a.Priority) - parseInt(b.Priority);
//             });
//         });
//         roomListFactory.getRoomList(new Date(), function (data) {
//             $scope.roomList = data;
//             $scope.roomTypes = data.roomTypes;
//             $scope.availableRoom = [];
//             // var arrivalDateTemp = $scope.currentRoom.ArrivalDate.setMilliseconds($scope.currentRoom.ArrivalDate.getMilliseconds() + 30);
//             // var departureDateTemp = $scope.currentRoom.DepartureDate;
//             var arrivalDateTemp;
//             var departureDateTemp;
//             if ($scope.currentRoom.BookingStatus != "CHECKIN") {
//                 $scope.currentRoom.ArrivalDate.setMilliseconds($scope.currentRoom.ArrivalDate.getMilliseconds() + 30);
//                 arrivalDateTemp = $scope.currentRoom.ArrivalDate;
//                 departureDateTemp = $scope.currentRoom.DepartureDate;
//             } else {
//                 $scope.currentRoom.start.setMilliseconds($scope.currentRoom.ArrivalDate.getMilliseconds() + 30);
//                 arrivalDateTemp = $scope.currentRoom.start;
//                 departureDateTemp = $scope.currentRoom.end;
//             }
//             //AVAILABLE ROOM
//             var availableRoom = [];
//             $scope.availableRoom = reservationFactory.getAvailableRoomForRoomMove($scope.roomList, arrivalDateTemp, departureDateTemp, availableRoom);
//             // AVAILABLE ROOM
//             angular.forEach($scope.availableRoom, function (arr) {
//                 if (newRoomId == arr.RoomId) {
//                     $scope.newRoom.RoomTypeId = arr.RoomTypeId;
//                     $scope.newRoom.RoomId = newRoomId;
//                 }
//             });
//             if (currentRoom.RoomId == newRoomId) {
//                 $scope.dateMove = true;
//                 for (i = 0; i < $scope.availableRoom.length; i++) {
//                     if ($scope.availableRoom[i].RoomId == newRoomId) {
//                         $scope.newRoom.RoomTypeId = $scope.availableRoom[i].RoomTypeId;
//                         $scope.newRoom.RoomId = newRoomId;
//                         break;
//                     }
//                 }
//                 oldRoomId = newRoomId;
//             };

//             if ($scope.newRoom.RoomTypeId == 0 || $scope.newRoom.RoomId == 0) {
//                 $scope.warningMissingRoom = true;
//             }
//             // $scope.minDate = new Date();
//             // console.log('loinq9',$scope.currentRoom.reservationRoom);
//         });
//     }
//     Init();
//     $scope.$watchCollection('newRoom', function (newValues, oldValues) {
//         if (_.size(newValues) !== 0 && _.size(oldValues) !== 0 && !angular.equals(newValues, oldValues)) {
//             $scope.priceRateList = _.filter($scope.planList, function (item) {
//                 return (item.IsActive && item.RoomTypeId.toString() === newValues.RoomTypeId.toString());
//             }).sort(function (a, b) {
//                 return parseInt(a.Priority) - parseInt(b.Priority);
//             });
//         }
//     });
//     $scope.update = function () {
//         $scope.newRoom.RoomId = 0;
//     }
//     $scope.$watchCollection('newRoom.RoomTypeId', function (newValues, oldValues) {
//         if (newValues.toString() !== oldValues.toString()) {
//             //$scope.newRoom.RoomId = 0;
//             //console.log('test:');
//         }
//     });
//     $scope.$watchCollection('newRoom.RoomPriceId', function (newValues, oldValues) {
//         console.log("watchCollection newRoom.RoomPriceId", newValues, oldValues);
//         if (newValues && newValues !== undefined) {
//             $scope.currentRatePrice = _.filter($scope.priceRateList, function (item) {
//                 console.log("ITEM", item);
//                 return (item.RoomPriceId.toString() === newValues.toString());
//             });
//             if ($scope.currentRatePrice[0] != null) {
//                 $scope.currentRatePrice = $scope.currentRatePrice[0].FullDayPrice;
//             }

//         }
//         console.log('currentRatePrice', $scope.currentRatePrice);
//     });

//     function addDays(date, days) {
//         var result = new Date(date);
//         result.setDate(result.getDate() + days);
//         return result;
//     }
//     $scope.filterValue = function ($event) {
//         if (isNaN(String.fromCharCode($event.keyCode))) {
//             $event.preventDefault();
//         }
//     };

//     $scope.newRoomPriceRateList = [];
//     $scope.showOverridePriceRate = true;
//     $scope.$watchCollection('currentRoom.reservationRoom', function (newValues, oldValues) {
//         if (_.size(newValues) !== 0 && _.size(oldValues) !== 0 && !angular.equals(newValues, oldValues) && newValues.ArrivalDate && oldValues.ArrivalDate) {
//             if (newValues.ArrivalDate !== oldValues.ArrivalDate && newValues.ArrivalDate >= oldValues.DepartureDate && oldValues.BookingStatus !== 'CHECKIN') {
//                 newValues.DepartureDate = addDays(newValues.ArrivalDate, 1);
//             }
//             //AVAILABLE ROOM
//             var availableRoom = [];
//             $scope.availableRoom = reservationFactory.getAvailableRoom($scope.roomList, newValues.ArrivalDate, newValues.DepartureDate, availableRoom);

//             if ((oldValues.BookingStatus === 'BOOKED' || oldValues.BookingStatus === 'NOSHOW') && newValues.BookingStatus === 'CHECKIN') {
//                 $scope.room.ArrivalDate = new Date();
//                 if ($scope.room.ArrivalDate.getTime() >= oldValues.DepartureDate.getTime()) {
//                     $scope.room.DepartureDate = addDays($scope.room.ArrivalDate, 1);
//                 } else {
//                     $scope.room.DepartureDate = oldValues.DepartureDate;
//                 }
//             }

//             //AVAILABLE PLAN LIST
//             $scope.priceRateList = _.filter($scope.planList, function (item) {
//                 return (item.IsActive && item.RoomTypeId.toString() === newValues.RoomTypeId.toString());
//             }).sort(function (a, b) {
//                 return parseInt(a.Priority) - parseInt(b.Priority);
//             });
//         }
//         $scope.priceRateList = _.filter($scope.priceRateList, function (item) {
//             return (item.IsActive && item.RoomTypeId.toString() === newValues.RoomTypeId.toString());
//         }).sort(function (a, b) {
//             return parseInt(a.Priority) - parseInt(b.Priority);
//         });
//     });

//     $scope.processRoomMove = function () {
//         console.log("NEW ROOM", $scope.newRoom, $scope.usePriceRateType);

//         if (!CheckAvailableRoom($scope.newRoom.RoomId, $scope.currentRoom.ArrivalDate, $scope.currentRoom.DepartureDate)) {
//             $scope.warning = true;
//             $scope.warningMissingReason = false;
//             $scope.warningMissingRoom = false;
//             return;
//         }
//         if ($scope.dateMove != true) {
//             if (!$scope.newRoom.RoomId || parseInt($scope.newRoom.RoomId) === 0 || $scope.newRoom.RoomId.toString() === currentRoom.RoomId.toString()) {
//                 $scope.warningMissingRoom = true;
//                 $scope.warningMissingReason = false;
//                 $scope.warning = false;
//                 return;
//             }
//         }
//         if ((currentRoom.BookingStatus == 'CHECKIN' || currentRoom.BookingStatus == 'OVERDUE') && (!$scope.newRoom.Description || $scope.newRoom.Description.trim() == '')) {
//             $scope.warningMissingRoom = false;
//             $scope.warningMissingReason = true;
//             $scope.warningDepartureDate = false;
//             $scope.warningDate = false;
//             return;
//         }
//         if ($scope.currentRoom.reservationRoom.ArrivalDate > $scope.currentRoom.reservationRoom.DepartureDate) {
//             $scope.warningDate = true;
//             $scope.warningMissingRoom = false;
//             $scope.warningMissingReason = false;
//             $scope.warningDepartureDate = false;
//             return;
//         }
//         if (($scope.currentRoom.BookingStatus === 'BOOKED' || $scope.currentRoom.BookingStatus === 'NOSHOW') && (new Date($scope.currentRoom.reservationRoom.DepartureDate) < new Date() || new Date($scope.currentRoom.reservationRoom.ArrivalDate) < new Date())) {
//             $scope.warningDepartureDate = true;
//             $scope.warningDate = false;
//             $scope.warningMissingRoom = false;
//             $scope.warningMissingReason = false;
//             return;
//         }
//         // if (currentRoom.BookingStatus == 'BOOKED' || currentRoom.BookingStatus == "NOSHOW") {
//         //     $scope.currentRoom.ArrivalDate = new Date($scope.currentRoom.ArrivalDate);
//         //     $scope.currentRoom.DepartureDate = new Date($scope.currentRoom.DepartureDate);
//         //     var DateNow = new Date();
//         //     if ($scope.currentRoom.ArrivalDate < DateNow) {
//         //         $scope.currentRoom.ArrivalDate = DateNow;
//         //     }
//         //     if ($scope.currentRoom.ArrivalDate > $scope.currentRoom.DepartureDate) {
//         //         $scope.warningStartDate = true;
//         //         $scope.warning = false;
//         //         return;
//         //     }
//         // }
//         var isDirty = false;
//         // for (var index in $scope.roomList) {
//         //     if ($scope.roomList[index].RoomId.toString() === $scope.newRoom.RoomId.toString()) {
//         //         if ($scope.roomList[index].HouseStatus === "DIRTY") {
//         //             isDirty = true;
//         //         }
//         //         break;
//         //     }
//         // }
//         if (!$scope.newRoom.RoomMoveFee || $scope.newRoom.RoomMoveFee === undefined) {
//             $scope.newRoom.RoomMoveFee = 0;
//         }

//         var RoomMoveModel = {
//             ReservationRoomId: $scope.currentRoom.reservationRoom.ReservationRoomId,
//             NewRoomTypeId: $scope.newRoom.RoomTypeId,
//             NewRoomId: $scope.newRoom.RoomId,
//             NewRoomPriceId: $scope.newRoom.RoomPriceId,
//             IsDirty: isDirty,
//             UsePriceRateType: $scope.usePriceRateType,
//             RoomMoveFee: $scope.newRoom.RoomMoveFee,
//             Description: $scope.newRoom.Description,
//             ArrivalDate: $scope.currentRoom.reservationRoom.ArrivalDate,
//             DepartureDate: $scope.currentRoom.reservationRoom.DepartureDate,
//             OldRoomId: oldRoomId,
//             BookingStatus: currentRoom.BookingStatus
//         };
//         if (!$scope.isSelected) {
//             RoomMoveModel.UsePriceRateType = 0;
//         } else {
//             RoomMoveModel.UsePriceRateType = 1;
//         }
//         $mdDialog.hide(RoomMoveModel);
//     };

//     function CheckAvailableRoom(roomId, ArrivalDate, DepartureDate) {
//         ArrivalDate = ArrivalDate.setMilliseconds(ArrivalDate.getMilliseconds() + 30);
//         for (index in $scope.roomList) {
//             if ($scope.roomList[index].RoomId == roomId) {

//                 if ($scope.roomList[index].HouseStatus === "REPAIR") {
//                     if ($scope.roomList[index].RepairStartDate) {
//                         $scope.roomList[index].RepairStartDate = new Date($scope.roomList[index].RepairStartDate);
//                     }
//                     if ($scope.roomList[index].RepairEndDate) {
//                         $scope.roomList[index].RepairEndDate = new Date($scope.roomList[index].RepairEndDate);
//                     }
//                     if ((ArrivalDate <= $scope.roomList[index].RepairStartDate && $scope.roomList[index].RepairStartDate <= DepartureDate) ||
//                         (ArrivalDate <= $scope.roomList[index].RepairEndDate && $scope.roomList[index].RepairEndDate <= DepartureDate) ||
//                         ($scope.roomList[index].RepairStartDate <= ArrivalDate && DepartureDate <= $scope.roomList[index].RepairEndDate)
//                     ) {
//                         return false;
//                     }
//                 };
//                 if ($scope.roomList[index].reservationRoom) {
//                     if ((ArrivalDate <= $scope.roomList[index].reservationRoom.ArrivalDate && $scope.roomList[index].reservationRoom.ArrivalDate <= DepartureDate) ||
//                         (ArrivalDate <= $scope.roomList[index].reservationRoom.DepartureDate && $scope.roomList[index].reservationRoom.DepartureDate <= DepartureDate) ||
//                         ($scope.roomList[index].reservationRoom.ArrivalDate <= ArrivalDate && DepartureDate <= $scope.roomList[index].reservationRoom.DepartureDate)
//                     ) {
//                         return false;
//                     }
//                 };

//             }
//         }
//         return true;
//     }
//     $scope.changeSelect = function () {
//         $scope.isSelected = !$scope.isSelected;
//     }

//     $scope.hide = function () {
//         $mdDialog.hide();
//     };
//     $scope.cancel = function (item) {
//         $mdDialog.cancel(item);
//     };
// }

// function UnassignRoomController($scope, $mdDialog, frontOfficeFactory, $location, $mdMedia, $filter, $timeout, $rootScope, dialogService, ListUnassign, dateUR) {
//     $scope.dateUR = dateUR;
//     $scope.ListUnassign = ListUnassign;
//     console.log('ListUnassignRoom:', ListUnassign);
//     /* $scope.MenuItems = [{
//          name: "VIEW_DETAIL",
//          icon: "ic_pageview_24px.svg",
//          url: "reservation/"
//      }, {
//          name: "AMEND_STAY",
//          icon: "ic_alarm_add_24px.svg",
//      }, {
//          name: "ASSIGN_ROOM",
//          icon: "ic_local_hotel_24px.svg",
//      }, {
//          name: "CANCEL_RESERVATION",
//          icon: "ic_cancel_24px.svg",
//      }];*/

//     for (var index in $scope.ListUnassign) {
//         var temp = $scope.ListUnassign[index];
//         var menus = [];
//         menus.push({
//             name: "VIEW_DETAIL",
//             icon: "ic_pageview_24px.svg",
//             url: "reservation/" + temp.ReservationRoomId
//         });

//         if (temp.Reservations !== null && temp.Reservations.IsGroup == true) {
//             console.error(temp.Reservations.ReservationId);
//             menus.push({
//                 name: "EDIT_GROUP",
//                 icon: "ic_pageview_24px.svg",
//                 url: "groupReservationDetail/" + temp.Reservations.ReservationId
//             });
//         }

//         menus.push({
//             name: "AMEND_STAY",
//             icon: "ic_alarm_add_24px.svg",
//         });
//         menus.push({
//             name: "ASSIGN_ROOM",
//             icon: "ic_local_hotel_24px.svg",
//         });

//         menus.push({
//             name: "CANCEL_RESERVATION",
//             icon: "ic_cancel_24px.svg",
//         });
//         temp.MenuItems = menus;
//     }

//     $scope.openMenu = function ($mdOpenMenu, ev) {
//         originatorEv = ev;
//         $mdOpenMenu(ev);
//     };
//     $scope.menuItemClick = function (item, result) {
//         console.log(item);
//         if (item.url) {
//             $location.path(item.url);
//         }
//         if (item.name === 'CANCEL_RESERVATION') {
//             var el = document.getElementById('search');
//             frontOfficeFactory.processCancel($scope.searchResult, result, el, $scope.ListUnassign);
//         }
//         if (item.name === 'AMEND_STAY') {
//             var el = document.getElementById('search');
//             frontOfficeFactory.processAmendStay(item, result, el, $scope.ListUnassign, $scope.dateUR);
//         }
//         if (item.name === 'ASSIGN_ROOM') {
//             var el = document.getElementById('search');
//             frontOfficeFactory.processAssignRoom(item, result, el, $scope.ListUnassign, 'timeline');
//         }
//         $mdDialog.cancel();
//     };

//     $scope.hide = function () {
//         $mdDialog.hide();
//     };
//     $scope.cancel = function (item) {
//         $mdDialog.cancel();
//     };

// }

function showMenu(reservationId, roomId, roomRepairId, isRoomMove) {

    if (roomId != null) {
        for (var idx in schedulerDataok) {
            if (reservationId == 0 || roomRepairId != 0) {
                if (schedulerDataok[idx] != null && schedulerDataok[idx].roomRepairId !== undefined && schedulerDataok[idx].roomRepairId == roomRepairId) {
                    var roomRepair = getDataRoomRepair(roomRepairId, 0);
                    showItemmenuTimeline(roomRepair);
                    break;
                }
            } else {
                if (!isRoomMove) {
                    if (schedulerDataok[idx].ReservationRoomId != null && schedulerDataok[idx].ReservationRoomId != undefined && schedulerDataok[idx].ReservationRoomId == reservationId) {
                        if (schedulerDataok[idx].roomMove == false) {
                            showItemMenu(null, schedulerDataok[idx]);
                            break;
                        }
                    }
                }
            }
        }
    }
};