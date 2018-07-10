ezCloud.controller('ConflictReservationController', ['$scope', '$rootScope', '$mdDialog', '$state', '$location', 'dialogService', 'ConflictReservationService', 'SharedFeaturesFactory', '$window','ConflictFeaturesFactory' ,
    function ($scope, $rootScope, $mdDialog, $state, $location, dialogService, ConflictReservationService, SharedFeaturesFactory, $window,ConflictFeaturesFactory) {
        var nq = this;
        //Nguyen Ngoc Quan - nq
        function Init() {
            nq.conflictRoom = SharedFeaturesFactory.getFeatureModel();
            nq.currentRoom = SharedFeaturesFactory.getBaseModel();
            nq.roomStatus = SharedFeaturesFactory.getRoomStatus();
            if(ConflictFeaturesFactory.getRoomStatus()=="REPAIR" && nq.conflictRoom == null&&nq.currentRoom == null){
                nq.conflictRoom = ConflictFeaturesFactory.getFeatureModel();
                nq.currentRoom = ConflictFeaturesFactory.getBaseModel();
                nq.roomStatus = ConflictFeaturesFactory.getRoomStatus();
            }
            //convert repair room to booking to show conflict
            if(nq.conflictRoom.RepairStartDate!= undefined && nq.conflictRoom.RepairEndDate != undefined){
                nq.conflictRoom.ArrivalDate = nq.conflictRoom.RepairStartDate;
                nq.conflictRoom.DepartureDate = nq.conflictRoom.RepairEndDate;
                nq.conflictRoom.BookingStatus = "REPAIR";
                nq.conflictRoom.Travellers = {};
                nq.conflictRoom.Travellers.Fullname = nq.conflictRoom.RepairReason;
                nq.conflictRoom.RoomTypes = nq.conflictRoom.Rooms.RoomTypes;
            }
            if(nq.currentRoom.RepairStartDate!= undefined && nq.currentRoom.RepairEndDate != undefined){
                nq.currentRoom.ArrivalDate = nq.currentRoom.RepairStartDate;
                nq.currentRoom.DepartureDate = nq.currentRoom.RepairEndDate;
                nq.currentRoom.BookingStatus = "REPAIR";
                nq.currentRoom.Travellers = {};
                nq.currentRoom.Travellers.Fullname = nq.currentRoom.RepairReason;
                nq.currentRoom.RoomTypes != undefined ? nq.currentRoom.Rooms.RoomTypes : undefined;
                if(nq.currentRoom.Rooms == undefined){
                    nq.currentRoom.Rooms = {};
                    nq.currentRoom.Rooms.RoomName = "Repair room";
                }
            }
            nq.DateTimePickerOption = {
                format: 'dd/MM/yyyy HH:mm'
            };
            ConflictReservationService.setCurrentModel(nq.currentRoom);
            var conflict = {
                arrivalDate: nq.conflictRoom.ArrivalDate,
                departureDate: nq.conflictRoom.DepartureDate,
                bookingStatus: nq.conflictRoom.BookingStatus != undefined ? nq.conflictRoom.BookingStatus : ""
            };
            var current = {
                arrivalDate: nq.currentRoom.ArrivalDate,
                departureDate: nq.currentRoom.DepartureDate,
                bookingStatus: nq.currentRoom.BookingStatus != undefined ? nq.currentRoom.BookingStatus : ""
            }
            nq.IsCheckOutInPast = false;
            if (nq.conflictRoom.BookingStatus == "CHECKIN" && nq.currentRoom.BookingStatus == "CHECKIN" && nq.roomStatus == "CHECKOUT") {
                nq.IsCheckOutInPast = true;
            }
            var data = ConflictReservationService.calculateTimeConflict(conflict, current, nq.roomStatus);
            nq.isConflictCase = false;
            nq.isSaveChanges = false;
            if (data != undefined && data != null && nq.conflictRoom.BookingStatus == "BOOKED" && nq.currentRoom.BookingStatus == "CHECKIN" && nq.currentRoom.BookingStatus=="CHECKIN") {
                nq.isConflictCase = data.isConflictCase;
            }
            nq.result = data;
            //Conflict
            nq.arrivalConflict = data.Conflict.Before.from;
            nq.departureConflict = data.Conflict.Before.to;
            nq.widthConflict = data.Conflict.Before.width;
            nq.leftConflict = data.Conflict.Before.left;
            var colorConflict = GetColor(nq.conflictRoom.BookingStatus);
            if (colorConflict != "") {
                nq.colorConflict = colorConflict;
            }
            else {
                nq.colorConflict = "#ef5350";
            }
            
            //Current
            nq.arrivalCurrent = new Date(nq.currentRoom.ArrivalDate).format('dd/mm/yyyy HH:MM');
            nq.departureCurrent = new Date(nq.currentRoom.DepartureDate).format('dd/mm/yyyy HH:MM');
            nq.widthCurrent = data.Current.Before.width;
            nq.leftCurrent = data.Current.Before.left;
            var colorCurrent = GetColor(nq.currentRoom.BookingStatus);
            if (nq.colorCurrent != "") {
                nq.colorCurrent = colorCurrent;
            }
            else {
                nq.colorCurrent = "#5468ff"
            }

            if(nq.widthConflict < 1){
                nq.textColorConflict = "#000";            
                nq.widthConflict = parseFloat(nq.widthConflict) + 1;
                
            }
            else{
                nq.textColorConflict = "#fff";
            }
            if(nq.widthCurrent < 1){
                nq.textColorCurrent = "#000";
                nq.widthCurrent = parseFloat(nq.widthCurrent) + 1;
            }
            else{
                nq.textColorCurrent = "#fff";
            }
            //Position
            nq.position = data.Position;
            nq.nameConflict = "";
            nq.nameNew = "";

            if (nq.conflictRoom.Rooms != undefined && nq.conflictRoom.Rooms.RoomName != undefined) {
                nq.nameConflict += nq.conflictRoom.Rooms.RoomName +" ";
            }
            if (nq.conflictRoom.RoomTypes !=undefined && nq.conflictRoom.RoomTypes.RoomTypeCode != undefined) {
                nq.nameConflict += "(" + nq.conflictRoom.RoomTypes.RoomTypeCode + ") ";
            }
            if (nq.conflictRoom.Travellers != undefined &&nq.conflictRoom.Travellers.Fullname != undefined) {
                nq.nameConflict += "- " + nq.conflictRoom.Travellers.Fullname;
            }
            if (nq.currentRoom.Rooms != undefined && nq.currentRoom.Rooms.RoomName != undefined) {
                nq.nameNew += nq.currentRoom.Rooms.RoomName+ " ";
            }
            else {
                if (nq.currentRoom.RoomName != undefined) {
                    nq.nameNew += nq.currentRoom.RoomName + " ";
                }
            }
            if (nq.currentRoom.RoomTypes != undefined && nq.currentRoom.RoomTypes.RoomTypeCode != undefined) {
                nq.nameNew += "(" + nq.currentRoom.RoomTypes.RoomTypeCode + ") ";
            }
            else {
                if (nq.currentRoom.RoomTypeCode != undefined) {
                    nq.nameNew += "(" + nq.currentRoom.RoomTypeCode + ") ";
                }
            }
            if (nq.currentRoom.Travellers != undefined && nq.currentRoom.Travellers.Fullname != undefined) {
                nq.nameNew += "- " + nq.currentRoom.Travellers.Fullname;
            }
            //nq.nameConflict = nq.conflictRoom.Rooms.RoomName + " (" + nq.conflictRoom.RoomTypes.RoomTypeCode + ") - " + nq.conflictRoom.Travellers.Fullname;
            // if (nq.currentRoom.room)
            //     nq.nameNew = nq.currentRoom.room.Rooms.RoomName + " (" + nq.currentRoom.room.RoomTypes.RoomTypeCode + ") - " + nq.currentRoom.customer.Fullname;
            // else if (nq.currentRoom.Rooms)
            //     nq.nameNew = nq.currentRoom.Rooms.RoomName + " (" + nq.currentRoom.RoomTypes.RoomTypeCode + ") - " + nq.currentRoom.Travellers.Fullname;
            // else nq.nameNew = "";
            nq.margin = data.Current.Before.margin;
        }
        Init();
        nq.solveProblem = function () {
            nq.arrivalConflict = new Date(ToDate(nq.result.Conflict.After.from)).format('dd/mm/yyyy HH:MM');
            if (!_.isNull(nq.result.Conflict.After.width) && !_.isNull(nq.result.Conflict.After.left)) {
                nq.widthConflict = nq.result.Conflict.After.width;
                nq.leftConflict = nq.result.Conflict.After.left;
            }
            nq.margin = nq.result.Conflict.After.margin;
            nq.isSaveChanges = true;
            nq.isConflictCase = false;
        }
        nq.viewDetail = function () {
            $mdDialog.hide();
            $location.path('#/reservation/' + nq.conflictRoom.ReservationRoomId);
        }
        nq.cancelDialog = function () {
            $mdDialog.cancel();
        };
        nq.openTabDetail = function () {
            $mdDialog.cancel();
            $window.open('#/reservation/' + nq.conflictRoom.ReservationRoomId);
        };
        nq.save = function () {
            nq.result.Conflict.After.adults = nq.conflictRoom.Adults;
            nq.result.Conflict.After.child = nq.conflictRoom.Child;
            var editedConflictReservationRoom = nq.result.Conflict.After;
            editedConflictReservationRoom.from = ToDate(editedConflictReservationRoom.from)
            editedConflictReservationRoom.to = ToDate(editedConflictReservationRoom.to)
            ConflictReservationService.setConflictReservationModel(editedConflictReservationRoom);
            ConflictReservationService.setCurrentModel(nq.conflictRoom);
            ConflictReservationService.processConflictReservation(function (data) {
                $mdDialog.hide();
                var result = data;
                if (result.status == true) {
                    dialogService.toast("AMEND_STAY_SAVED_SUCCESSFUL");
                    $state.go($state.current, {}, {
                        reload: true
                    });
                }
            });
        };
        function ToDate(dateStr) {
            var day = dateStr.split(" ");
            var date = day[0].split("/");
            var time = day[1].split(":");
            var xx = new Date(date[2], date[1] - 1, date[0], time[0], time[1]);
            return xx;
        }
        function GetColor(StatusCode) {
            var listColors = $rootScope.Settings;
            for (var i in listColors) {
                if (listColors[i].StatusCode == StatusCode) {
                    return listColors[i].ColorCode;
                }
            }
            return "";
        }
    }
]);
