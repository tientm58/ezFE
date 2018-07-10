ezCloud.controller('ShowBreakController', ['loginFactory', '$mdDialog', '$filter', '$mdMedia', '$location', 'ShowBreakService', 'SharedFeaturesFactory', 'CancelService', 'AssignRoomService', 'homeFactory', 'AmendStayService', 'AssignRoomService', 'walkInFactory',
function (loginFactory, $mdDialog, $filter, $mdMedia, $location, ShowBreakService, SharedFeaturesFactory, CancelService, AssignRoomService, homeFactory, AmendStayService, AssignRoomService, walkInFactory) {
    var vm = this;       
    var ezSchedulerData;
    function Init(){
        vm.change_date = new Date();
        vm.urListTemp = ShowBreakService.getBreakModel();
        LengthDate = vm.urListTemp.Nights;//ShowBreakService.diffDate(vm.urListTemp.ArrivalDate, vm.urListTemp.DepartureDate);
        localStorage.date_default_day = vm.urListTemp.ArrivalDate;
        ezSchedule.grid.startDate = vm.urListTemp.ArrivalDate;
        ezSchedule.isDraggable = false;
        ezSchedule.isTouch = false;
        ezSchedule.init(); 
        
    };
    
    //my blue was here
    ezSchedule.loadData = function (inputDate) {
        inputDate = (inputDate == "Invalid Date") ? new Date() : inputDate;
        vm.parameter = (LengthDate < 7) ? 7 : 30;
        var duration = ezSchedule.parameter;
        var rooms;
        localStorage.date_default_day = inputDate;
        vm.change_date = inputDate;
        var date = new Date(inputDate).format("yyyy-mm-dd");
        var promise = loginFactory.securedGet("api/Room/RoomTimeline", $.param({
            date: date,
            duration: duration
        }));
        // $rootScope.dataLoadingPromise = promise;
        promise.success(function (datareceived) {
            vm.view_date = ezSchedule.view_date;
            dataTimeline = datareceived;
            vm.prepairMenuDetail();
            var data = datareceived.reservationRooms;
            listColor = datareceived.statusColors;
            datareceived.roomBookingList = {};
            var roomType = datareceived.roomTypes;
            var priceRateList = datareceived.planList;
            var roomBookingList = datareceived.roomBookingList;
            var allrooms = datareceived.rooms;
            vm.RoomType = datareceived.roomTypes;
            var colors = datareceived.statusColors;
            vm.statusColors = datareceived.statusColors;
            vm.rooms = datareceived.rooms;
            vm.roomList = datareceived.roomList;
            var tmpColor = {};

            for (var i in data) {
                if (data[i].BookingStatus == "BOOKED" && new Date(data[i].ArrivalDate) < new Date()) {
                    data[i].BookingStatus = "NOSHOW";
                }
            }
            for (var idx in datareceived.statusColors) {
                tmpColor[datareceived.statusColors[idx].StatusCode] = datareceived.statusColors[idx].ColorCode;
            }
            vm.statusColors = tmpColor;

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

            vm.UnassignRoom = datareceived.unassignRoom;

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
                    if (res.BookingStatus == "CHECKIN") {
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
                                if (vm.view_date) {
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
                        if (vm.view_date) {
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
                if (vm.view_date) {
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
                if (vm.view_date && !isMove) {
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
            vm.allRoomRepairs = datareceived.roomList;
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
                                // roomRepair.color = vm.statusColors['REPAIR'];

                                //set view type date
                                var tmpArrival = new Date(roomRepair.RepairStartDate.getTime());
                                var tmpDeparture = new Date(roomRepair.RepairEndDate.getTime());
                                if (vm.view_date) {
                                    tmpArrival.setHours(0);
                                    tmpArrival.setMinutes(0);
                                    tmpDeparture.setHours(23);
                                    tmpDeparture.setMinutes(59);
                                }


                                roomRepair.start = "/Date(" + tmpArrival.getTime() + ")/";
                                roomRepair.end = "/Date(" + tmpDeparture.getTime() + ")/";
                                roomRepair.ArrivalDate = tmpArrival; //.getTime();
                                roomRepair.DepartureDate = tmpDeparture; //.getTime();
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

            var tmpColor = {};
            for (x in datareceived.statusColors) {
                tmpColor[datareceived.statusColors[x].StatusCode] = datareceived.statusColors[x].ColorCode;
            }
            vm.statusColors = tmpColor;
            for (x in datareceived.roomTypes) {
                datareceived.roomTypes[x].RoomTypeName = $filter("translate")(datareceived.roomTypes[x].RoomTypeName);
            }

            ezSchedule.drawData({
                'transactions': schedulerData,
                'room_levels': datareceived.roomTypes,
                'rooms': allrooms,
                'inventoryByRoomTypeList': datareceived.inventoryByRoomTypeList,
                'UnassignRoom': vm.UnassignRoom,
                'data': datareceived
            });
            ezSchedulerData = schedulerData;

            for (var i = roomType.length - 1; i >= 0; i--) {
                if (roomType[i].RoomTypeId != vm.urListTemp.RoomTypeId) {
                    ezSchedule.doHideRoomType(roomType[i].RoomTypeId);
                }
            }
        });
    }
    vm.prepairMenuDetail = function() {
        var menus = [];
        ezSchedule.setMenuDetail(menus);
    }
    vm.hide = function () {
        $mdDialog.hide();
    };
    vm.cancel = function () {
        $mdDialog.cancel();
    };
    Init();
}]);