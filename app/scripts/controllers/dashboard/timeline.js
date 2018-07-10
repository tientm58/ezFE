var lastTimelineDrag;
var currentScope;
var testView;
var dateUR;
var startDate;
var schedulerDataok;
var showItemMenu;
var GlobalEvent;
var Opscheduler;
var isViewTypeDate = true;
var listColor;
var getDataRoomRepair;
var listUnassignRoom = null;
var listRooms = null;
ezCloud.controller('timeLineController', ['$timeout',
    '$filter',
    '$scope',
    '$rootScope',
    '$mdBottomSheet',
    'roomListFactory',
    'selectedRoomFactory',
    '$location',
    '$state',
    'reservationFactory',
    'dialogService',
    'loginFactory',
    '$mdDialog',
    '$localStorage',
    '$mdMedia',
    '$http',
    'currentHotelConnectivities',
    'smartCardFactory',
    '$q',
    'walkInFactory',
    'SharedFeaturesFactory',
    'CancelService',
    'AssignRoomService',
    'AmendStayService',
    'homeFactory',
    'RoomMoveService',
    function (
        $timeout,
        $filter,
        $scope,
        $rootScope,
        $mdBottomSheet,
        roomListFactory,
        selectedRoomFactory,
        $location,
        $state,
        reservationFactory,
        dialogService,
        loginFactory,
        $mdDialog,
        $localStorage,
        $mdMedia,
        $http,
        currentHotelConnectivities,
        smartCardFactory,
        $q,
        walkInFactory,
        SharedFeaturesFactory,
        CancelService,
        AssignRoomService,
        AmendStayService,
        homeFactory,
        RoomMoveService
    ) {
        $scope.currentHotelConnectivites = currentHotelConnectivities;
        $scope.change_date = new Date();
        $scope.RoomType = {};
        $scope.filterRoomType = "0";
        $scope.statusColor = {};
        $scope.now = new Date();
        $scope.roomList = {};
        var roomById = {};
        var dataTimeline;
        var ezSchedulerData;
        function Init() {
            if (localStorage.view_date) {
                $scope.view_date = $localStorage.view_date;
            } else {
                localStorage.view_date = false;
                $scope.view_date = false;
            }
            jQuery(document).unbind('keydown');
            ezSchedule.isDraggable = true;
            ezSchedule.isTouch = true;
            ezSchedule.init();
        }
        ezSchedule.loadData = function (inputDate) {
            $scope.user = $rootScope.user;
            ezSchedule.isfindedDateNow = false;
            inputDate = (inputDate == "Invalid Date") ? new Date() : inputDate;
            $scope.parameter = ezSchedule.parameter;
            var duration = ezSchedule.parameter;
            var rooms;
            localStorage.date_default_day = inputDate;
            $scope.change_date = inputDate;
            var date = new Date(inputDate).format("yyyy-mm-dd");
            var promise = loginFactory.securedGet("api/Room/RoomTimeline", $.param({
                date: date,
                duration: duration
            }));
            // $rootScope.dataLoadingPromise = promise;
            promise.success(function (datareceived) {
                $scope.view_date = ezSchedule.view_date;
                dataTimeline = datareceived;
                prepairMenuDetail(currentHotelConnectivities, datareceived.ExtraServices);
                var data = datareceived.reservationRooms;
                listColor = datareceived.statusColors;
                datareceived.roomBookingList = {};
                var roomType = datareceived.roomTypes;
                var priceRateList = datareceived.planList;
                var roomBookingList = datareceived.roomBookingList;
                var allrooms = datareceived.rooms;
                $scope.RoomType = datareceived.roomTypes;
                var colors = datareceived.statusColors;
                $scope.statusColors = datareceived.statusColors;
                $scope.rooms = datareceived.rooms;
                $scope.roomList = datareceived.roomList;
                var tmpColor = {};

                for(var i in data){
                    if (data[i].BookingStatus == "BOOKED" && new Date(data[i].ArrivalDate) < new Date()) {
                        data[i].BookingStatus = "NOSHOW";
                    }
                }
                for (var idx in datareceived.statusColors) {
                    tmpColor[datareceived.statusColors[idx].StatusCode] = datareceived.statusColors[idx].ColorCode;
                }
                $scope.statusColors = tmpColor;

                var indexRooms = {};
                for (var idx in datareceived.rooms) {
                    indexRooms[datareceived.rooms[idx].RoomId] = idx;
                    if (datareceived.BookingList)
                        datareceived.roomBookingList[datareceived.rooms[idx].RoomId] = datareceived.BookingList.filter(function (item) {
                            return item.RoomId == datareceived.rooms[idx].RoomId;
                        });
                    else
                        datareceived.roomBookingList[datareceived.rooms[idx].Room.RoomId] = null;
                }

                for (var idx in data) {
                    var reservation = data[idx];
                    if (datareceived.RelatedPayments != null)
                        reservation.PaymentsList = datareceived.RelatedPayments.filter(function (item) {
                            return item.ReservationRoomId == reservation.ReservationRoomId
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
                    return item.RoomId == null && (item.BookingStatus == "BOOKED" || item.BookingStatus == "NOSHOW");
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
                    // var reservation = angular.copy(data[idx]);
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
                    res.title = res.Travellers.Fullname;
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
                                    newRoomMove.RoomId = arr.roomId;

                                    if (typeof (list[index + 1]) != "undefined" && ((index + 1) < (list.length - 1))) {
                                        newRoomMove.newHasTag = res.ReservationRoomId + '-' + list[index + 1].roomId;
                                        newRoomMove.newRoomId = list[index + 1].roomId;
                                    } else {
                                        newRoomMove.newHasTag = res.ReservationRoomId + '-' + res.roomId;
                                        newRoomMove.newRoomId = res.RoomId;
                                    }

                                    //set view type date
                                    var tmpArrival = new Date(arr.Start.getTime());
                                    var tmpDeparture = new Date(arr.End.getTime());
                                    if ($scope.view_date) {
                                        tmpArrival.setHours(0);
                                        tmpArrival.setMinutes(0);
                                        tmpDeparture.setHours(0);
                                        tmpDeparture.setMinutes(0);
                                    }

                                    newRoomMove.Reservations = res.Reservations;
                                    newRoomMove.ArrivalDate = arr.Start;
                                    newRoomMove.DepartureDate = arr.End;
                                    newRoomMove.roomRepairId = 0;
                                    newRoomMove.BookingStatus = "CHECKOUT";
                                    newRoomMove.color = colors['CHECKOUT'];
                                    newRoomMove.Travellers = {
                                        "Fullname": res.Travellers.Fullname
                                    };
                                    newRoomMove.title = res.Travellers.Fullname + " >>";
                                    newRoomMove.start = "/Date(" + tmpArrival.getTime() + ")/";
                                    newRoomMove.end = "/Date(" + tmpDeparture.getTime() + ")/";
                                    schedulerData.push(new kendo.data.SchedulerEvent(newRoomMove));
                                }
                            });
                            res.title = ">> " + res.title;
                            res.lastMove = true;
                            if ($scope.view_date) {
                                var tmpdate = new Date(list[list.length - 1].Start);
                                tmpdate.setHours(0);
                                tmpdate.setMinutes(0);
                                tmpArrivalDate = tmpdate;
                            } else {
                                tmpArrivalDate = new Date(list[list.length - 1].Start);
                            }

                            isMove = true;
                        }
                    };
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
                    if ($scope.view_date) {
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
                    if ($scope.view_date && !isMove) {
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
                    
                    // res.Market = datareceived.marketList[0];

                    // res.roomBookingList;
                    res.HouseStatus = null;
                    for (var idx in allrooms) {
                        allrooms[idx].transactions = [];
                        if (allrooms[idx].RoomId == res.RoomId) {
                            res.RoomName = allrooms[idx].RoomName;
                            //
                            if (allrooms[idx].HouseStatus != null && res.BookingStatus == "CHECKIN" || res.BookingStatus == "OVERDUE") {
                                res.HouseStatus = allrooms[idx].HouseStatus;
                            }
                            break;
                        }
                    }
                    res.RoomTypes = res.RoomTypes;
                    res.RoomTypeId = res.RoomTypes.RoomTypeId;
                    for (var idx in roomType) {
                        if (roomType[idx].RoomTypeId == res.RoomTypes.RoomTypeId) {
                            res.RoomPriceName = roomType[idx].RoomPriceName;
                            res.RoomTypes.RoomTypeName = roomType[idx].RoomTypeName;
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
                                //break;
                            }
                        }
                    };
                    schedulerData.push(new kendo.data.SchedulerEvent(res));
                };
                //repair room
                var allRoomRepairs = datareceived.roomList;
                $scope.allRoomRepairs = datareceived.roomList;
                if (allRoomRepairs != null && allRoomRepairs.length > 0) {
                    angular.forEach(allRoomRepairs, function (arr) {
                        if (arr.RoomRepairList && arr.RoomRepairList.length > 0) {
                            for (var index in arr.RoomRepairList) {
                                var repair = arr.RoomRepairList[index];
                                var tmpE = new Date(repair.RepairEndDate);
                                if (repair.IsDeleted == false && tmpE > $scope.change_date) {
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
                                    // roomRepair.color = $scope.statusColors['REPAIR'];

                                    //set view type date
                                    var tmpArrival = new Date(roomRepair.RepairStartDate.getTime());
                                    var tmpDeparture = new Date(roomRepair.RepairEndDate.getTime());
                                    if ($scope.view_date) {
                                        tmpArrival.setHours(0);
                                        tmpArrival.setMinutes(0);
                                        tmpDeparture.setHours(23);
                                        tmpDeparture.setMinutes(59);
                                    }


                                    roomRepair.start = "/Date(" + tmpArrival.getTime() + ")/";
                                    roomRepair.end = "/Date(" + tmpDeparture.getTime() + ")/";
                                    roomRepair.ArrivalDate = new Date(roomRepair.RepairStartDate.getTime()); //.getTime();
                                    roomRepair.DepartureDate = new Date(roomRepair.RepairEndDate.getTime()); //.getTime();
                                    //
                                    roomRepair.IsGroupMaster = false;
                                    roomRepair.IsGroup = false;
                                    roomRepair.roomMove = false;
                                    roomRepair.HouseStatus = "REPAIR";
                                    roomRepair.BookingStatus = "REPAIR";
                                    roomRepair.Travellers = {
                                        "Fullname": "REPAIR"
                                    };
                                    roomRepair.id = "repair_" + repair.RoomRepairId;
                                    roomRepair.isAllDay = false;
                                    roomRepair.RoomId = repair.RoomId;
                                    roomRepair.RoomName = arr.Room.RoomName;
                                    roomRepair.Note = repair.RepairReason;
                                    // roomRepair.BookingStatus = null;
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

                for (var x in schedulerData) {
                    if (typeof (schedulerData[x].RoomId) != "undefined") {

                        var index = indexRooms[schedulerData[x].RoomId];
                        if (typeof (index) != "undefined") {
                            if (typeof (schedulerData[x], allrooms[index].transactions) == "undefined") {
                                schedulerData[x], allrooms[index].transactions = [];
                            }
                            allrooms[index].transactions.push(schedulerData[x]);
                        }
                    }
                }

                //set Lang for ezSchedule
                datareceived.Lang = {};
                datareceived.Lang["TOTAL_CHARGES"] = $filter("translate")("TOTAL_CHARGES");
                datareceived.Lang["RES_NO"] = $filter("translate")("RES_NO");
                datareceived.Lang["DISPLAYGROUPDETAIL_ARRIVALDATE"] = $filter("translate")("DISPLAYGROUPDETAIL_ARRIVALDATE");
                datareceived.Lang["DISPLAYGROUPDETAIL_DEPARTUREDATE"] = $filter("translate")("DISPLAYGROUPDETAIL_DEPARTUREDATE");
                datareceived.Lang["REPAIR_START_DATE_REPORT"] = $filter("translate")("REPAIR_START_DATE_REPORT");
                datareceived.Lang["REPAIR_END_DATE_REPORT"] = $filter("translate")("REPAIR_END_DATE_REPORT");
                datareceived.Lang["REPAIR_REASON_REPORT"] = $filter("translate")("REPAIR_REASON_REPORT");
                datareceived.Lang["NOTE"] = $filter("translate")("NOTE");
                datareceived.Lang["NEW_ROOM"] = $filter("translate")("NEW_ROOM");
                datareceived.Lang["NIGHT_REPORT"] = $filter("translate")("NIGHT_REPORT");
                datareceived.Lang["NIGHT_REPORT"] = $filter("translate")("NIGHT_REPORT");
                datareceived.Lang["ROOM_DIRTY"] = $filter("translate")("ROOM_DIRTY");
                datareceived.Lang["CM_WEEKEND"] = $filter("translate")("CM_WEEKEND");
                datareceived.Lang["ADULT"] = $filter("translate")("ADULT");
                datareceived.Lang["CHILD"] = $filter("translate")("CHILD");

                var tmpColor = {};
                for (x in datareceived.statusColors) {
                    tmpColor[datareceived.statusColors[x].StatusCode] = datareceived.statusColors[x].ColorCode;
                }
                $scope.statusColors = tmpColor;
                for (x in datareceived.roomTypes) {
                    datareceived.roomTypes[x].RoomTypeName = $filter("translate")(datareceived.roomTypes[x].RoomTypeName);
                }

                ezSchedule.drawData({
                    'transactions': schedulerData,
                    'room_levels': datareceived.roomTypes,
                    'rooms': allrooms,
                    'inventoryByRoomTypeList': datareceived.inventoryByRoomTypeList,
                    'UnassignRoom': $scope.UnassignRoom,
                    'data': datareceived
                });
                ezSchedulerData = schedulerData;
            });
        }
        function ConvertToDateTime(date, hour) {
            if (date && hour) {
                var dateTemp = date.split('/');
                var hourTemp = hour.split(':');
                //month start at 0
                return new Date(
                    dateTemp[2],
                    parseInt(dateTemp[1]) - 1,
                    dateTemp[0],
                    hourTemp[0],
                    hourTemp[1]
                );
            }
        }
        var viewDetail = function (op) {
            if (op && op.tranid) {
                $state.go('reservation', { reservationRoomId: op.tranid });
            };
        };
        var viewGroup = function (op) {
            if (op && (op.isGroup && op.isGroup == 'true') && op.reservationId) {
                $state.go('groupReservationDetail', { reservationId: op.reservationId });
            };
        };
        var doWalkin = function (op) {
            var startDate = ConvertToDateTime(op.new_room_start_date, op.new_start_hour);
            var endDate = ConvertToDateTime(op.new_room_end_date, op.new_end_hour);
            var DateNow = new Date();

            if (startDate < DateNow) {
                startDate = DateNow;
            };
            //
            var model = buildWalkInTimelineModel(op.new_room_id, startDate, endDate); console.log(model);
            walkInFactory.setReservationTimeline(model);
            //$state.go('walkin/' + model.RoomId, { roomId: model.RoomId });
            $location.path('walkin/' + model.RoomId); console.log(model.RoomId);
            function buildWalkInTimelineModel(roomId, startDate, endDate) {
                var reservationTemp = {
                    RoomId: roomId,
                    ArrivalDate: startDate,
                    DepartureDate: endDate,
                    // BookingStatus:"AVAILABLE"
                };
                return reservationTemp;
            }
            ezSchedule.reload_data();
        }
        var doConfigRepair = function (op) {
            var roomId = op.new_room_id ? op.new_room_id : op.room_id;
            var room = _.filter(dataTimeline.roomList, function (roomTemp) {
                return (roomId == roomTemp.Room.RoomId);
            });
            var roomRepairs = _.first(room).RoomRepairList;
            var model = {
                roomRepair: null,
                roomRepairs: roomRepairs,
                currentRoom: _.first(room).Room
            }
            //
            if (op && op.isRepair && op.isRepair == true) {
                var roomRepairId = op.tranid.slice(7);
                var currentRR;
                angular.forEach(roomRepairs, function (roomRepairTemp) {
                    if (roomRepairTemp.RoomRepairId == roomRepairId) {
                        currentRR = roomRepairTemp;
                    }
                });
                model.roomRepair = currentRR;
                SharedFeaturesFactory.processEditRoomRepair(model, function () {
                    ezSchedule.reload_data();
                });

            } else {
                var newRR = buildAddRoomRepairTimelineModel(op, model.currentRoom);
                // model.roomRepair = newRR;
                model.currentRoom = newRR;
                SharedFeaturesFactory.processAddRoomRepair(model, function () {
                    ezSchedule.reload_data();
                });

            }
            //
            function buildAddRoomRepairTimelineModel(rr, currentRoom) {
                var tempModel;
                if (rr && currentRoom) {
                    var DateTimeNow = new Date();
                    var startDateTemp = ConvertToDateTime(rr.new_room_start_date, rr.new_start_hour);
                    var endDateTemp = ConvertToDateTime(rr.new_room_end_date, rr.new_end_hour);
                    if (startDateTemp.getTime() < DateTimeNow.getTime()) {
                        startDateTemp = DateTimeNow;
                    }

                    tempModel = currentRoom;
                    tempModel.RepairStartDate = startDateTemp;
                    tempModel.RepairEndDate = endDateTemp;
                }
                return tempModel;
            }
        }
        var doAmendStay = function (op) {
            var reservationRoom = _.filter(dataTimeline.reservationRooms, function (rr) {
                return rr.ReservationRoomId == op.tranid;
            })[0];
            if (reservationRoom) {                
                //var amendStayModelTemp = walkInFactory.buildAmendStayTimelineModel(reservationRoom, roomListTemp);
                //var selectedRoom = walkInFactory.buildAmendStayModel(amendStayModelTemp.room, amendStayModelTemp.roomList, amendStayModelTemp.notAssignRoomReservations);
                reservationRoom.ArrivalDate = new Date(reservationRoom.ArrivalDate);
                reservationRoom.DepartureDate = new Date(reservationRoom.DepartureDate);
                SharedFeaturesFactory.processAmendStay(reservationRoom);
            }
        }
        var doPreCheckOut = function (op) {
            var reservationRoom = _.filter(dataTimeline.reservationRooms, function (rr) {
                return rr.ReservationRoomId == op.tranid;
            })[0];
            if (reservationRoom) {
                SharedFeaturesFactory.processPreCheckOut(reservationRoom, function () {
                    ezSchedule.reload_data();
                });
            }
        }
        var doCreateCard = function (op) {
            var hourAddToCheckOut = null;
            var room = _.filter(dataTimeline.roomList, function (roomTemp) {
                return (roomTemp.Room.RoomId == op.room_id);
            })[0];
            var reservationRoom = _.filter(dataTimeline.reservationRooms, function (rr) {
                return rr.ReservationRoomId == op.tranid;
            })[0];
            var selectedRoom = buildCopyTimelineModel(reservationRoom,room);            
            console.log("ROOMID", selectedRoom);

            if(currentHotelConnectivities.IsAutomaticalAddHourCheckout == true){
                hourAddToCheckOut = currentHotelConnectivities.HourAddToCheckout;
            };
            smartCardFactory.createCard(selectedRoom,hourAddToCheckOut);

            function buildCopyTimelineModel(rr,r) {
                var tempR = angular.copy(r.Room);
                console.log("rooms",r);
                if (rr) {
                    tempR.reservationRoom = {
                        ReservationRoomId: rr.ReservationRoomId,
                        BookingStatus: rr.BookingStatus,
                        ArrivalDate: new Date(rr.ArrivalDate),
                        DepartureDate: new Date(rr.DepartureDate),
                        Price: rr.Price,
                        Adults: rr.Adults,
                        Child: rr.Child,
                        HotelId: rr.HotelId,
                        RoomId: rr.RoomId,
                        RoomPriceId: rr.RoomPriceId,
                        RoomTypeId: rr.RoomTypeId,
                        TravellerId: rr.Travellers.TravellerId,
                        Reservations: { ReservationId: rr.ReservationId, ReservationNumber: rr.Reservations.ReservationNumber },
                        ReservationNumber: rr.Reservations.ReservationNumber,
                        TravellersList: rr.TravellersList,
                        RoomExtraServiceItemsList: rr.RoomExtraServiceItemsList,
                        RoomExtraServicesList: rr.RoomExtraServicesList,
                        RoomName: rr.Rooms.RoomName,
                        RoomType: rr.RoomType,
                        Travellers: rr.Travellers,
                        PaymentsList: []
                    };
                
                };
                return tempR;
            }
        };
        var doAddExtraService = function (op) {
            var reservationRoom = _.filter(dataTimeline.reservationRooms, function (rr) {
                return rr.ReservationRoomId == op.tranid;
            })[0];
            var action = op.action.slice(7);
            if (reservationRoom && action) {   
                var item = {
                    name: action
                };
                if(!reservationRoom.reservationRoom) reservationRoom.reservationRoom = reservationRoom;
                SharedFeaturesFactory.processAddExtraService(reservationRoom, item);
            }
        };
        var doRoomMove = function (op, new_room_id) {
            var reservationRoom = _.filter(dataTimeline.reservationRooms, function (rr) {
                return rr.ReservationRoomId == op.tranid;
            })[0];
            if (reservationRoom) {
                reservationRoom.ArrivalDate = new Date(reservationRoom.ArrivalDate);
                reservationRoom.DepartureDate = new Date(reservationRoom.DepartureDate);
                if(!reservationRoom.roomType) reservationRoom.roomType = reservationRoom.RoomTypes;
                if(!reservationRoom.reservationRoom) reservationRoom.reservationRoom = reservationRoom;
                if(new_room_id != null && new_room_id != undefined) SharedFeaturesFactory.processRoomMove(reservationRoom, new_room_id);
                else SharedFeaturesFactory.processRoomMove(reservationRoom);
            };
        };
        var doUndoCheckIn = function (op) {
            var reservationRoom = _.filter(dataTimeline.reservationRooms, function (rr) {
                return rr.ReservationRoomId == op.tranid;
            })[0];
            if (reservationRoom) {
                if(!reservationRoom.reservationRoom) reservationRoom.reservationRoom = reservationRoom;
                SharedFeaturesFactory.processUndoCheckIn(reservationRoom);
            };
        }
        var doCopy = function (op) {
            var reservationRoom = _.filter(dataTimeline.reservationRooms, function (rr) {
                return rr.ReservationRoomId == op.tranid;
            })[0];
            if (reservationRoom) {
                reservationRoom.ArrivalDate = new Date(reservationRoom.ArrivalDate);
                reservationRoom.DepartureDate = new Date(reservationRoom.DepartureDate);
                if(!reservationRoom.roomType) reservationRoom.roomType = reservationRoom.RoomTypes;
                if(!reservationRoom.reservationRoom) reservationRoom.reservationRoom = reservationRoom;
                SharedFeaturesFactory.processCopyReservation(reservationRoom);
            };
        };
        var doCancel = function (op) {
            var reservationRoom = _.filter(dataTimeline.reservationRooms, function (rr) {
                return rr.ReservationRoomId == op.tranid;
            })[0];
            if (reservationRoom) {           
                if(!reservationRoom.reservationRoom) reservationRoom.reservationRoom = reservationRoom;
                SharedFeaturesFactory.processCancel(reservationRoom);
            }
        };
        var doUnAssignRoom = function (op) {
            var reservationRoom = _.filter(dataTimeline.reservationRooms, function (rr) {
                return rr.ReservationRoomId == op.tranid;
            })[0];
            if(reservationRoom){
                SharedFeaturesFactory.processUnassignRoom(reservationRoom, function(){
                    ezSchedule.reload_data();
                });
            }
        };
        var doAssignRoom = function () {
            AssignRoomService.buildAssignRoomModel(function (data) {
                var selectedRR = data;
                if (selectedRR != null) {
                    SharedFeaturesFactory.processAssignRoom(selectedRR, function(){
                        ezSchedule.reload_data();
                    });
                }
            });
            
        }
        function showUnassignRoom(dateUR, roomTypeId) {
            if (dateUR && ezSchedule.UnassignRoom.length > 0) {
                dateUR = new Date(dateUR).setHours(0, 0, 0, 0);
                var urList = [];
                angular.forEach(ezSchedule.UnassignRoom, function (urTemp) {
                    var arrivalTemp = angular.copy(urTemp.ArrivalDate);
                    var departureTemp = angular.copy(urTemp.DepartureDate);
                    arrivalTemp.setHours(0, 0, 0, 0);
                    departureTemp.setHours(0, 0, 0, 0);
                    if ((roomTypeId == urTemp.RoomTypeId || roomTypeId == null)
                        && dateUR >= arrivalTemp.getTime() 
                        && (dateUR < departureTemp.getTime() || (departureTemp.getTime() == arrivalTemp.getTime() && dateUR == arrivalTemp.getTime())) ) {
                        urList.push(urTemp);
                    }
                });
                
                if (urList.length > 0) {
                    var model = {
                        unassignRoomList: urList,
                        statusColor: ezSchedule.statusColor
                    };
                    SharedFeaturesFactory.processShowUnassignRoom(model, function () { 
                        ezSchedule.reload_data();
                    });
                }
            }
        }
        ezSchedule.showUnassignRoomEvent = showUnassignRoom;
        $scope.changeDate = function ( ) {
            ezSchedule.grid.startDate = $scope.change_date;
            ezSchedule.loadData($scope.change_date);
        }
        $scope.changeParameter = function () {
            ezSchedule.parameter = $scope.parameter;
            ezSchedule.loadData(ezSchedule.grid.startDate);
        }
        $scope.changeNowDate = function () {

            $scope.change_date = new Date();
            ezSchedule.grid.startDate = new Date();
            ezSchedule.loadData(new Date());

        }
        function showUR(date) {
            dateUR = date;
        }
        function processClean(selectedRoom) {
            SharedFeaturesFactory.processClean(selectedRoom, function () {
                ezSchedule.reload_data();
            });
        }
        ezSchedule.processClean = processClean;
        function processSetDirtyRoom(selectedRoom) {
            SharedFeaturesFactory.processSetDirtyRoom(selectedRoom, function (data) {
                ezSchedule.reload_data();
            });
        }
        ezSchedule.processSetDirtyRoom = processSetDirtyRoom;
        function prepairMenuDetail(hotelConnectivities, extraServices) {
            var menus = [{
                'name': $filter("translate")("VIEW_DETAIL"),
                'id': 'VIEW_DETAIL',
                'event': viewDetail,
                'require': {
                    'status': 'BOOKED,CHECKIN,OVERDUE,NOSHOW,CHECKOUT',
                    'roles': ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF']
                }
            }, {
                'name': $filter("translate")("EDIT_GROUP"),
                'id': 'EDIT_GROUP',
                'event': viewGroup,
                'require': {
                    'status': 'BOOKED,CHECKIN,OVERDUE,NOSHOW,CHECKOUT',
                    'roles': ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF']
                }
            }, {
                'name': $filter("translate")("CONFIG_REPAIR"),
                'id': 'CONFIG_REPAIR',
                'event': doConfigRepair,
                'require': {
                    'status': 'REPAIR',
                    'roles': ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF']
                }
            }, {
                'name': $filter("translate")("AMEND_STAY"),
                'id': 'AMEND_STAY',
                'event': doAmendStay,
                'require': {
                    'status': 'BOOKED,CHECKIN,OVERDUE,NOSHOW',
                    'roles': ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF']
                }
            }, {
                'name': $filter("translate")("ROOM_MOVE"),
                'id': 'ROOM_MOVE',
                'event': doRoomMove,
                'require': {
                    'status': 'BOOKED,CHECKIN,OVERDUE,NOSHOW',
                    'roles': ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF']
                }
            }, {
                'name': $filter("translate")("COPY"),
                'id': 'COPY',
                'event': doCopy,
                'require': {
                    'status': 'BOOKED,CHECKIN,OVERDUE,NOSHOW',
                    'roles': ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF']
                }
            }, {
                'name': $filter("translate")("CANCEL_RESERVATION"),
                'id': 'CANCEL_RESERVATION',
                'event': doCancel,
                'require': {
                    'status': 'BOOKED,NOSHOW',
                    'roles': ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF']
                }
            }, {
                'name': $filter("translate")("UNASSIGN_ROOM"),
                'id': 'UNASSIGN_ROOM',
                'event': doUnAssignRoom,
                'require': {
                    'status': 'BOOKED,NOSHOW',
                    'roles': ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF']
                }
            },
            {
                'name': $filter("translate")("PRE_CHECKOUT"),
                'id': 'PRE_CHECKOUT',
                'event': doPreCheckOut,
                'require': {
                    'status': 'CHECKOUT',
                    'roles': ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER']
                }
            }, {
                'name': $filter("translate")("PRE_CHECKIN"),
                'id': 'PRE_CHECKIN',
                'event': doUndoCheckIn,
                'require': {
                    'status': 'CHECKIN,OVERDUE',
                    'roles': ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER']
                }
            }];
            if (extraServices && extraServices.length > 0) {
                angular.forEach(extraServices, function (es) {
                    if (es.ExtraServiceTypeName == "MINIBAR" && es.ExtraServiceCategoriesList.length > 0) {
                        menus.push({
                            'name': $filter("translate")("MINIBAR"),
                            'id': 'MINIBAR',
                            'event': doAddExtraService,
                            'require': {
                                'status': 'CHECKIN,OVERDUE',
                                'roles': ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF']
                            }
                        });
                    } else if (es.ExtraServiceTypeName == "LAUNDRY" && es.ExtraServiceCategoriesList.length > 0) {
                        menus.push({
                            'name': $filter("translate")("LAUNDRY"),
                            'id': 'LAUNDRY',
                            'event': doAddExtraService,
                            'require': {
                                'status': 'CHECKIN,OVERDUE',
                                'roles': ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF']
                            }
                        });
                    } else if (es.ExtraServiceTypeName == "EXTRA_ROOM_CHARGE" && es.ExtraServiceCategoriesList.length > 0) {
                        menus.push({
                            'name': $filter("translate")("EXTRA_ROOM_CHARGE"),
                            'id': 'EXTRA_ROOM_CHARGE',
                            'event': doAddExtraService,
                            'require': {
                                'status': 'CHECKIN,OVERDUE',
                                'roles': ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF']
                            }
                        });
                    } else if (es.ExtraServiceTypeName == "COMPENSATION" && es.ExtraServiceCategoriesList.length > 0) {
                        menus.push({
                            'name': $filter("translate")("COMPENSATION"),
                            'id': 'COMPENSATION',
                            'event': doAddExtraService,
                            'require': {
                                'status': 'CHECKIN,OVERDUE',
                                'roles': ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF']
                            }
                        })
                    }
                });
                menus.push({
                    'name': $filter("translate")("EXTRA_SERVICES"),
                    'id': 'EXTRA_SERVICES',
                    'event': doAddExtraService,
                    'require': {
                        'status': 'CHECKIN,OVERDUE',
                        'roles': ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF']
                    }
                })
            };
            if (hotelConnectivities && hotelConnectivities.isUsed === true) {
                menus.push({
                    'name': $filter("translate")("CREATE_CARD"),
                    'id': 'CREATE_CARD',
                    'event': doCreateCard,
                    'require': {
                        'status': 'BOOKED,NOSHOW,CHECKIN,OVERDUE',
                        'roles': ['ROLE_HOTEL_OWNER', 'ROLE_HOTEL_MANAGER', 'ROLE_HOTEL_STAFF']
                    }
                });
            }
            ezSchedule.setMenuDetail(menus);
        }
        ezSchedule.setMenuCreate([{
            'name': $filter("translate")("WALKIN"),
            'id': 'WALKIN',
            'event': doWalkin,
        }, {
            'name': $filter("translate")("CONFIG_REPAIR"),
            'id': 'CONFIG_REPAIR',
            'event': doConfigRepair,
        }]);
        $scope.doFilterRoomType = function (roomLevelId) {

        }
        $scope.showItemmenuTimeline = function (item) {
            // selectedRoomFactory.setCurrentHotelConnectivities(currentHotelConnectivities);
            // var newItem = angular.copy(item);
            // selectedRoomFactory.setSelectedRoomTimeline(newItem);
            $mdBottomSheet.show({
                templateUrl: 'views/bottom_sheets/room_menu_timeline.html',
                controller: 'roomMenuTimelineController',
                clickOutsideToClose: true
            }).then(function () { });
        };
        $scope.changeViewType = function (viewType) {
            $localStorage.viewType = viewType;
            // $localStorage.timelineType = viewType;
            window.location.href = "#/home";
        }
        $scope.dochange = function (item) {

        }
        var topHeader = $("#gridHeader").position().top - 10;
        $scope.selectedItemChange = function (item) {

            if (typeof (item) == "undefined") {

            } else {

                var top = $("#rm_" + item.RoomId).position();
                var top2 = $('#grid').scrollTop() + top.top;
                $('#grid').animate({
                    scrollTop: top2 //$("#rm_"+item.RoomId).offset().top
                }, 1000);

                $('.sidetitle').removeClass('rowhover');

                $("#st_" + item.RoomId).addClass("rowhover");

                $('#wrap-content').animate({
                    scrollTop: topHeader
                }, 1000);
            } 
        }
        var RoomTypeIdFillter = 0;
        $scope.selectedItemChangeType = function (item) {

            if (typeof (item) == "undefined") {
                RoomTypeIdFillter = 0;
                for (var i = $scope.RoomType.length - 1; i >= 0; i--) {
                    ezSchedule.doShowRoomType($scope.RoomType[i].RoomTypeId);
                }

            } else {

                RoomTypeIdFillter = item.RoomTypeId;
                for (var i = $scope.RoomType.length - 1; i >= 0; i--) {
                    if ($scope.RoomType[i].RoomTypeId != RoomTypeIdFillter) {
                        ezSchedule.doHideRoomType($scope.RoomType[i].RoomTypeId);
                    }
                }

            }

        }
        $scope.querySearch = function (query) {

            if (RoomTypeIdFillter > 0) {
                var tmpRooms = $filter('filter')($scope.rooms, {
                    RoomTypeId: RoomTypeIdFillter
                });
            } else {
                var tmpRooms = $scope.rooms;
            }
            var results = query ? $scope.rooms.filter(createFilterFor(query)) : tmpRooms,
                deferred;
            if (self.simulateQuery) {
                deferred = $q.defer();
                $timeout(function () {
                    deferred.resolve(results);
                }, Math.random() * 1000, false);
                return deferred.promise;
            } else {
                return results;
            }

        }
        $scope.querySearchtype = function (query) {
            var results = query ? $scope.RoomType.filter(createFilterForType(query)) : $scope.RoomType,
                deferred;
            if (self.simulateQuery) {
                deferred = $q.defer();
                $timeout(function () {
                    deferred.resolve(results);
                }, Math.random() * 1000, false);
                return deferred.promise;
            } else {
                return results;
            }
        }
        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);

            return function filterFn(state) {
                var tmp = angular.lowercase(state.RoomName);
                if (RoomTypeIdFillter > 0 && RoomTypeIdFillter != state.RoomTypeId) {
                    return false;
                } else {
                    return (tmp.indexOf(lowercaseQuery) === 0);
                }
            };
        }
        function createFilterForType(query) {
            var lowercaseQuery = angular.lowercase(query);

            return function filterFn(state) {
                var tmp = angular.lowercase(state.RoomTypeName);
                return (tmp.indexOf(lowercaseQuery) === 0);
            };
        }
        $scope.tranferViewDate = function (val) {
            var isV = false;
            if (val) {
                isV = false;
            } else {
                isV = true;
            }
            ezSchedule.view_date = isV;
            localStorage.view_date = isV;
            ezSchedule.loadData($scope.change_date);
        }
        $scope.checkNow = function (val2) {
            var now = new Date();
            now.setHours(0);
            now.setMinutes(0);
            now.setSeconds(0);
            now.setMilliseconds(0);
            var val = new Date(val2);
            val.setHours(0);
            val.setMinutes(0);
            val.setSeconds(0);
            val.setMilliseconds(0);

            if (now.getTime() == val.getTime()) {
                return true;
            }
            return false;
        }
        $scope.readCard = function () {
            smartCardFactory.readCard();
        }
        Init();
    }
]);