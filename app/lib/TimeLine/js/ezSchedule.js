    var ezSchedule = {
        day: null,
        floors: null,
        backup_Reservation: {},
        list_room: [],
        chclick: 0,
        justClickedOnTransaction: false,
        creatingNewRoom: false,
        parameter: 7,
        default_parameter: 7,
        tmpevent: null,
        new_start_hour: 0,
        timeNewRoom: {},
        Lang: {},
        MenuCreate: {},
        indexRooms: {},
        indexRoomsall: {},
        indexRTransitions: {},
        new_end_hour: 0,
        new_start_date: '24/07/2016',
        new_end_date: '24/07/2016',
        valInventory: {},
        statusColor: {},
        UnassignRoom: {},
        showUnassignRoomEvent:null,
        view_date: false,
        isTouch: true,
        isDraggable: true,
        isClickReservation: false,
        DateInWeek: ['Sun','Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        inputBackupDraw: {},
        isfindedDateNow: false,
        grid: {
            numberOfDay: 7,
            width: 100,
            startDate: new Date()
        },
        init: function() {
            
            this.initData();

            this.initConfig();

            this.load_data(ezSchedule.grid.startDate, ezSchedule.parameter);
            if(this.isTouch){
                this.eventMousemove();

                this.eventMousestart();

                this.eventMouseEnd();

                this.eventMenu();
            }
            this.eventChangeDate();

            this.eventResize();

            this.eventNextDate();

            this.eventPreDate();

        },
        initData: function(){
            var d = new Date(); 
            if (localStorage.date_default_day != "undefined" && localStorage.date_default_day !=  "Invalid Date"){
                d = new Date( localStorage.date_default_day );
            }
            localStorage.date_default_day = d;
            day = d.getDate();
            ezSchedule.grid.startDate = d;
            ezSchedule.view_date
            if ( localStorage.view_date != "undefined"){
                ezSchedule.view_date = (localStorage.view_date=="true")?true:false;
            }
            ezSchedule.doResize();
        },
        initConfig: function() {

            jQuery("#menuToggle").click(function() {
                this.chclick = 1;
                ezSchedule.prepairGrid();
            });
            $("#startDate").datepicker({
                dateFormat: 'dd/mm/yy'
            });
            this.grid.width = $("#room_view").width();

            var nod = localStorage.grid_default_day;
            if (!nod){
                nod = ezSchedule.default_parameter;
            }

            this.grid.numberOfDay = nod;
            this.parameter = nod;

        },
        reload_data: function() {
            this.load_data(ezSchedule.grid.startDate, ezSchedule.parameter);
        },
        reload: function(){
            
            ezSchedule.drawData(ezSchedule.inputBackupDraw);
            ezSchedule.hideJQloading("#room_view");
        },
        drawData: function(data) {
            this.inputBackupDraw = data;
            this.Lang = data.data.Lang;
            var info = data;

            var tmpColor = {};
            for (x in data.data.statusColors) {
                tmpColor[data.data.statusColors[x].StatusCode] = data.data.statusColors[x].ColorCode;
            }
            this.UnassignRoom = data.UnassignRoom;
            this.statusColor = tmpColor;
            var valInventory = {};
            for (index in info.inventoryByRoomTypeList) {

                var tmpType = valInventory[info.inventoryByRoomTypeList[index].RoomTypeCode];
                tmpType = (tmpType == null) ? {} : tmpType;
                if (typeof(info.inventoryByRoomTypeList[index].Dates) != "undefined") {
                    var date = new Date(info.inventoryByRoomTypeList[index].Dates);
                    var keyDate = date.getDate() + "/" + (date.getMonth() + 1);
                    tmpType[keyDate] = info.inventoryByRoomTypeList[index].C;
                    valInventory[info.inventoryByRoomTypeList[index].RoomTypeCode] = tmpType;
                }
            }

            function count() {
                var i = 0;
                for (key in info.room_levels) {

                    i++;

                }
                return i;
            }

            function get_id(name) {
                var result;
                for (key in info.room_levels) {

                    if (info.room_levels[key].name == name) {
                        result = info.room_levels[key].id;
                        break;
                    }
                }

                return result;
            }

            var room_info = {};
            var i = 0;
            var list_roomB = this.list_room;
            var indexRLv = {};
            for (key in info.room_levels) {
                var tmp = {};
                tmp.rooms = [];
                tmp.id = info.room_levels[key].RoomTypeId;
                tmp.name = info.room_levels[key].RoomTypeName;
                tmp.code = info.room_levels[key].RoomTypeCode;
                tmp.OrderNumber = info.room_levels[key].OrderNumber;
                if (typeof(valInventory[info.room_levels[key].RoomTypeCode]) != "undefined") {
                    tmp.aval = valInventory[info.room_levels[key].RoomTypeCode];
                } else {
                    tmp.aval = 0;
                }
                indexRLv[tmp.id] = tmp;
                this.list_room[i] = tmp;
                i++;
            }
            for (x in info.rooms) {
                this.indexRooms[info.rooms[x].RoomId] = info.rooms[x].RoomName;
                this.indexRoomsall[info.rooms[x].RoomId] = info.rooms[x];
            }
            list_roomB.sort(function (a, b) {
                return a.OrderNumber - b.OrderNumber;
            });
            for (y in list_roomB) {
                var tmpPush = [];
                for (x in info.rooms) {

                    var level_id = info.rooms[x].RoomTypeId;
                    var tmp = {};
                    if (list_roomB[y].id == level_id) {
                        var k = 't';
                        var name = info.rooms[x].room_name;
                        var status = info.rooms[x].status;
                  

                        var id = info.rooms[x].RoomId;
                        tmp.name = info.rooms[x].RoomName;
                        tmp.room_level_name = indexRLv[level_id].code;
                        tmp.id = info.rooms[x].RoomId;
                        tmp.HouseStatus = info.rooms[x].HouseStatus;
                        tmp.status = status;
                        tmp.floor = info.rooms[x].FloorId;
                        if (info.rooms[x].transactions === "undefined") {
                            tmp.transactions = [];
                        } else {
                            for (xx in info.rooms[x].transactions) {
                                var sta = new Date(info.rooms[x].transactions[xx].ArrivalDate);
                                var end = new Date(info.rooms[x].transactions[xx].DepartureDate);
                              
                                if( ezSchedule.view_date == true ){
                                    sta.setHours(0);
                                    sta.setMilliseconds(0);
                                    sta.setMinutes(0);
                                    end.setHours(0);
                                    end.setMilliseconds(0);
                                    end.setMinutes(0);
                                }
                                info.rooms[x].transactions[xx].startDate = sta;
                                info.rooms[x].transactions[xx].endDate = end;
                            }
                            tmp.transactions = info.rooms[x].transactions;
                            
                        }
                        tmpPush.push(tmp);
                       
                    }
                }
                list_roomB[y].rooms = tmpPush;
                
            }

            ezSchedule.grid.roomList = list_roomB;
       
            ezSchedule.prepairGrid();
            if(data.data && data.data.roomSalesForecast){
                ezSchedule.countRoomSalesForecast(data.data.roomSalesForecast);
            };
        },
        load_data: function (date, parameter) {
            ezSchedule.isfindedDateNow = false;
            ezSchedule.parameter = parameter;
            localStorage.date_default_day = date;
            ezSchedule.loadData(date);
        },
        ModifiyStatusPad:function( id, status ){
            ///////////
        },
        prepairGrid: function() {
            
            ezSchedule.grid.numberOfDay = ezSchedule.parameter;
            var grid = ezSchedule.grid; 
            grid.startDate = (grid.startDate == "Invalid Date") ? new Date() : grid.startDate;
            if (!grid.numberOfDay)
                grid.numberOfDay = ezSchedule.default_parameter;
            
            $("#startDate").val(grid.startDate.format("dd/mm/yyyy"));
            var gStartDate = new Date(grid.startDate.format("yyyy/mm/dd"));

            var tmpDate = new Date();
            $("#datetable").empty();
            $("#listFooter").empty();
            $("#tplLeft").empty();
            $("#conRight").empty();
            if (grid.numberOfDay > 1) {
                for (var i = 0; i < grid.numberOfDay; i++) {
                    $("#datetable").append(this.createDateItem(i, gStartDate.addDays(i)));
                }
            } else {
                for (var i = 0; i < 24; i++) {
                    $("#datetable").append(this.createDateItem2(i, gStartDate));
                    $("#listFooter").append(this.createDateItem2(i, gStartDate));
                }
            }
            var now = new Date();
            var now2 = new Date();
            now2.setHours(0);
            now2.setMinutes(0);
            now2.setMilliseconds(0);

            var subNow = now.getTime() - now2.getTime();
            var percenNow = Math.ceil(100 * (subNow / (3600000 * 24) ));
            jQuery("#isNowDate").css("left", percenNow + "%");

            var checkhover = 1;

            //Populate data
            var rooooom = {}; 

            var tmpr = [];
            for (room in rooooom) {
                tmpr.push(room);
            }
            tmpr.sort();
            
            // if( ezSchedule.backup_Reservation == {} ){
                ezSchedule.backup_Reservation = grid.roomList;
            // }

            for (var indexlv in grid.roomList) {
                roomType = grid.roomList[indexlv];

                jQuery("#tplLeft").append(this.createLeftColRoomTyle(roomType));
                this.createRightColDetailsRoomType(roomType);
                
                for (var indexRoom in roomType.rooms) {

                    rooooom = roomType.rooms[indexRoom];
               
                    ezSchedule.backup_Reservation[indexlv].rooms[indexRoom].transactions = ezSchedule.grid.roomList[indexlv].rooms[indexRoom].transactions;
                    // var id = list_room[levleIndev].rooms[x].id;
                    jQuery("#tplLeft").append(this.createLeftCol(rooooom, roomType.id));
                    jQuery("#conRight").append(this.createRightColDetails(rooooom, roomType.id, indexlv));
                    ezSchedule.eventClearnRoom(rooooom.id);
                    var r = rooooom;
                    if (r.transactions) {
                        for (t in r.transactions) { 
                            var index = r.transactions[t].uid;  
                            //Binding events to transactions
                            if (ezSchedule.isDraggable) {
                                $("#_CONFRESERV_" + index).kendoDraggable({
                                    hint: function() {
                                        if ($(this.currentTarget[0]).attr("status") != 'CHECKOUT' && $(this.currentTarget[0]).attr("status") != 'REPAIR') {
                                            return $(this.currentTarget[0]).clone();
                                        }
                                    }, 
                                    autoScroll: false,
                                    dragend: this.onDragEnd 
                                });
                            }
                            $("#_CONFRESERV_" + index).bind("touchstart", function(event) {
                                    event.preventDefault();
                                    var newroom = $("#new-room");
                                    if (newroom.length != 0) {
                                        newroom.remove();
                                    }
                                    this.justClickedOnTransaction = true;
                                    $(this).bind("touchend", function(e) {
                                        //
                                        e.preventDefault();

                                        $(this).unbind("touchend");
                                        $(this).enableContextMenu();

                                        this.justClickedOnTransaction = false;
                                        ezSchedule.veryfyMenuDetail(jQuery("#" + this.id));
                                    });
                                    if (jQuery("#" + this.id).attr("status") == 'REPAIR') {
                                        jQuery(".no_repair").hide();
                                        jQuery(".show_unrepair").show();
                                    } else {
                                        jQuery(".no_repair").show();
                                        jQuery(".show_unrepair").hide();

                                    }
                                    
                                }).tooltip().click(function() {
                                    event.preventDefault();
                                    $(this).clone();
                                    this.justClickedOnTransaction = true;
                                    ezSchedule.veryfyMenuDetail(jQuery("#" + this.id));
                                }).hover(function() {
                                    if (checkhover != this.id && checkhover != 1) {
                                        $("#myMenu").hide();
                                        checkhover = this.id;
                                    } else {
                                        checkhover = this.id;
                                    }
                                    $("#myMenu2").hide();
                                    var newroom = $("#new-room");
                                    if (newroom.length != 0) {
                                        newroom.remove();
                                    }
                                    if (jQuery("#" + this.id).attr("status") == 'REPAIR') {
                                        jQuery(".no_repair").hide();
                                        jQuery(".show_unrepair").show();
                                    } else {
                                        jQuery(".no_repair").show();
                                        jQuery(".show_unrepair").hide();
                                        if (jQuery("#" + this.id).attr("isgroup") == 1) {
                                            jQuery(".group-show").show();
                                        } else {
                                            jQuery(".group-show").hide();
                                        }
                                    } 
                                    ezSchedule.veryfyMenuDetail( jQuery("#" + this.id) );
                                }) 
                            if (ezSchedule.isTouch){
                                    $("#_CONFRESERV_" + index).contextMenu({
                                        menu: 'myMenu'
                                    }, function(action, el, pos) {
                                        for (var i = 0; i < ezSchedule.MenuDetail.length; i++) {
                                            if (("detail_" + ezSchedule.MenuDetail[i].id) == action) {
                                                var op = {
                                                    'room_id': el.attr("room_id"),
                                                    'tranid': el.attr("tranid"),
                                                    'isGroup': el.attr("isgroup"),
                                                    'reservationId': el.attr("reservationid"),
                                                    'startdate': el.attr("startdate"),
                                                    'enddate': el.attr("enddate"),
                                                    'isRepair':(el.attr("status") && el.attr("status") =='REPAIR') ? true : false,
                                                    'data': ezSchedule.grid,
                                                    'action':action
                                                };
                                                ezSchedule.MenuDetail[i].event(op);
                                            }
                                        }
                                    });
                                }
                        }
                    }
                    // this.grid = grid;
                }
            };
            this.countUnassignRoom();

            // this.calculateFreeRooms();
            $(".roomday").kendoDropTarget({
                drop: this.onDropTarget
            });
            $("#tplRight").width(this.getColumnWidth() * grid.numberOfDay);
            $("#conRight").width(this.getColumnWidth() * grid.numberOfDay);
 
            this.eventTogetherRoomType();
            jQuery("#room_view").height(jQuery("body").height() - jQuery("#toolbar").height() - 30);
            ezSchedule.countUnassignRoom1(true);
        },
        veryfyMenuDetail: function( op ){ 
            var lengthMenu = ezSchedule.MenuDetail.length;
            var isRole = JSON.parse(localStorage.getItem("ngStorage-lastLogin"));
            var status     = op.attr('status');
            var isGroup    = op.attr('isgroup');
            var isMove = op.attr('isMove');
            var isUseLock = op.attr('isUseLock');
            for (var i = lengthMenu - 1; i >= 0; i--) { 
                if ( ezSchedule.MenuDetail[i].require.status == "ALL" ) {
                    jQuery('a[href="#detail_'+ezSchedule.MenuDetail[i].id+'"]').closest("li").show();
                }else{
                    if (ezSchedule.MenuDetail[i].require.status.search(status) >= 0 && ezSchedule.MenuDetail[i].require.roles.find(function(item){
                        return (item == "ROLE_" + isRole.role);
                    }, isRole) != null) {
                        jQuery('a[href="#detail_'+ezSchedule.MenuDetail[i].id+'"]').closest("li").show();
                    }else{
                        jQuery('a[href="#detail_'+ezSchedule.MenuDetail[i].id+'"]').closest("li").hide();
                    } 
                }
                if ((!isGroup || isGroup == undefined || isGroup == null || isGroup == 'false') && ezSchedule.MenuDetail[i].id == 'EDIT_GROUP') {
                    jQuery('a[href="#detail_'+ezSchedule.MenuDetail[i].id+'"]').closest("li").hide();
                }
                if (isMove == 1) {
                    jQuery('a[href="#detail_PRE_CHECKOUT"]').closest("li").hide();
                } 
                if (isUseLock == 0) {
                    jQuery('a[href="#detail_CREATE_CARD"]').closest("li").hide();
                }
                
            } 
        }, 
        countUnassignRoom1: function( theFirst ) {
            var listUnassign = ezSchedule.UnassignRoom;
            var duration = ezSchedule.parameter;// $scope.durationTimeLine;
            if (theFirst) {
                for (var idx = 0; idx < duration; idx++) { 
                    if (startDate != undefined ){
                        var tmp = ezSchedule.addDays(new Date(startDate), idx).format('ddmmyyyy');
                        if (document.getElementById(tmp)) {
                            angular.element('#' + tmp).text('0');
                            // jQuery('#' + tmp).css("display", "none");
                        }
                    }s
                }
            }
      
            angular.forEach(listUnassign, function(arr) {
                var arrivalDate = new Date(arr.ArrivalDate);
                arrivalDate.setHours(0, 0, 0, 0);
                var departureDate = new Date(arr.DepartureDate);
                departureDate.setHours(0, 0, 0, 0);
                var numberDate = ezSchedule.day_between(arrivalDate, departureDate);
                if (numberDate == 0 || numberDate == 1) {
                    var tmpDate = arrivalDate.format('ddmmyyyy');
                    if (document.getElementById(tmpDate)) {
                        var tmpcout = document.getElementById(tmpDate).innerText.replace(/\(/g, '').replace(/\)/g, '');
                        var tmp = parseInt(tmpcout) + 1;
                        var strtmp = null;
                        if (tmp > 0) {
                            strtmp = tmp;
                            angular.element('#' + tmpDate).text("(" + strtmp + ")");
                            jQuery('#' + tmpDate).show();
                        }
                    }
                } else {
                    for (var idx = 0; idx < numberDate; idx++) {
                        var tmpDate = ezSchedule.addDays(arrivalDate, idx).format('ddmmyyyy');
                        if (document.getElementById(tmpDate)) {
                            var tmpcout = document.getElementById(tmpDate).innerText.replace(/\(/g, '').replace(/\)/g, '');
                            var tmp = parseInt(tmpcout) + 1;
                            var strtmp = null;
                            if (tmp > 0) {
                                strtmp = tmp ;
                                jQuery('#' + tmpDate).show();
                                angular.element('#' + tmpDate).text("("+strtmp+")");
                            }
                        }
                    };
                }
            });
            $('#datetable li .bdate').bind({
                click:function(event){
                  
                  var tmpD = parseInt(jQuery(this).attr("dateur"));
                  console.log(tmpD, jQuery(this).attr("dateur"), "hello ");
                  ezSchedule.showUnassignRoomEvent(tmpD, null);
                }
            });
        },
        countRoomSalesForecast: function(roomSalesForecast){
            if(roomSalesForecast && roomSalesForecast.length > 0){
                angular.forEach(roomSalesForecast,function(arr,index){
                    var dom = '#t_'+index;
                    if($(dom)){
                        var roomAvailable = arr.AvailableRooms - arr.NightSold;
                        var OCC = Math.floor(parseInt(arr.Occ)) +'%';
                        // angular.element(dom+' .bdate').text(roomAvailable);
                        angular.element(dom+' .perd').text(OCC);
                    }
                   
                });
                
                
            }
        },
        countUnassignRoom:function(){
            if(ezSchedule.UnassignRoom && ezSchedule.UnassignRoom.length > 0){
                angular.forEach(ezSchedule.UnassignRoom, function(arr) {
                    var arrivalDate = new Date(arr.ArrivalDate);
                    var departureDate = new Date(arr.DepartureDate);
                    arrivalDate.setHours(0, 0, 0, 0);
                    departureDate.setHours(0, 0, 0, 0);
                    var numberDate = ezSchedule.day_between(arrivalDate, departureDate);
                    var id = 'ur'+arr.RoomTypeId+'_';
                    if (numberDate == 0 || numberDate == 1) {
                        var tmpDate = id + arrivalDate.format('ddmmyyyy');
                        if (document.getElementById(tmpDate)) {
                            var tmpcout = document.getElementById(tmpDate).innerText;
                            // var tmpcout = document.getElementById(tmpDate).innerText.replace(/\(/g, '').replace(/\)/g, '');
                            var tmp = parseInt(tmpcout) + 1;
                            tmpcout = (tmpcout.length == 0) ? "0" : tmpcout;
                            var strtmp = null;
                            if (tmp > 0) {
                                strtmp = tmp;
                                angular.element('#' + tmpDate).text(strtmp);
                                jQuery('#' + tmpDate).show();
                            }
                        }
                    } else {
                        for (var idx = 0; idx < numberDate; idx++) {
                            var tmpDate = id + ezSchedule.addDays(arrivalDate, idx).format('ddmmyyyy');
                            if (document.getElementById(tmpDate)) {
                                // var tmpcout = document.getElementById(tmpDate).innerText.replace(/\(/g, '').replace(/\)/g, '');
                                var tmpcout = document.getElementById(tmpDate).innerText;
                                tmpcout = (tmpcout.length == 0) ? "0" : tmpcout;
                                var tmp = parseInt(tmpcout) + 1;
                                var strtmp = null;
                                if (tmp > 0) {
                                    strtmp = tmp ;
                                    jQuery('#' + tmpDate).show();
                                    angular.element('#' + tmpDate).text(strtmp);
                                }
                            }
                        };
                    }
                });
            };
        },
        addDays : function (date, days) {
            var result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        },
        day_between : function (firstDate, secondDate) {
            var oneDay = 24 * 60 * 60 * 1000;
            firstDate = new Date(firstDate);
            firstDate.setHours(0, 0, 0, 0);
            secondDate = new Date(secondDate);
            secondDate.setHours(0, 0, 0, 0);
            return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
        },
        convertStartDateRoomMove:function(newDate){
            var hourDefault = "07";
            var minutesDefault = "00";
            var newDateTemp = newDate.split('/');
            var result = new Date(newDateTemp[2],parseInt(newDateTemp[1]) - 1,newDateTemp[0],hourDefault,minutesDefault,0,0);
            
            return result;
        },
        createLeftCol: function(room, roomLevelId) {
            var isDirty = (room.HouseStatus == 'DIRTY') ? 'isDirty' : '';
            var titleDirty = (room.HouseStatus == 'DIRTY') ? ezSchedule.Lang["ROOM_DIRTY"] : '';
            // return '<span class="wrap_container floor roomlevel' + roomLevelId + '" floor="' + room.floor + ' "  ><span class="sidetitle t1" id="st_' + room.id + '"><span style="text-align: left; cursor: initial !important">&nbsp;&nbsp;&nbsp;' + room.room_level_name + "(" + room.name + ")" + '' + '</span></span></span>';
            return '<span class="wrap_container floor roomlevel' + roomLevelId + '" floor="' + room.floor + ' " title="' + titleDirty + '"  ><span class="sidetitle t1" id="st_' + room.id + '"><span class="' + isDirty + '" style="text-align: left;">&nbsp;&nbsp;&nbsp;' + room.name + '' + '</span></span></span>';
        },
        createLeftColRoomTyle: function(roomType) {
            return '<span class="wrap_container floor"><span class="rowRoomType_left sidetitle t1 roomLevelMenu" dataId="' + roomType.id + '" id="roomType_' + roomType.id + '"><span style="text-align: left">&nbsp;&nbsp;&nbsp;' + roomType.code + '</span><span id="iconArrow_' + roomType.id + '" class="icon-arrow">v</span></span>';
        },
        createRightColDetails: function (room, roomLevelId, indexlv) {
            ezSchedule.indexRTransitions[indexlv + "_" + room.id] = room.transactions;
            var subscr = (jQuery("body").width() >= 1024 && jQuery("body").width() <= 1200) ? -3 : 0;
            var sub = 5 / ezSchedule.grid.numberOfDay + subscr;
            var tmp = '<div id="rm_' + room.id + '" indexlv="' + indexlv + '" class="roomday r1 floor  roomlevel' + roomLevelId + '" floor="' + room.floor + '"><ol class="ui-selectable2">';
            for (var i = 0; i < this.grid.numberOfDay * 2; i++) {
                if (i % 2 == 0) {
                    tmp += '<li class="null ui-state-default2 _b 2014_03_18 text-right " style="width:' + (this.getColumnWidth() / 2) + 'px" id="0_' + room.id + '_b" rel="1" title=""></li>';
                } else {
                    // tmp += '<li class="null ui-state-default2 _a " style="width:' + ((this.getColumnWidth() - this.getColumnWidth() / 2) - 0.024*ezSchedule.grid.numberOfDay) + 'px;border-right: 1px solid gainsboro !important;box-sizing:border-box" id="="0_' + room.id + '_a" rel="1" title=""></li>';
                    tmp += '<li class="null ui-state-default2 _a " style="width:' + (this.getColumnWidth() / 2) + 'px;border-right: 1px solid gainsboro !important;box-sizing:border-box" id="="0_' + room.id + '_a" rel="1" title=""></li>';
                }
            }
            tmp += '</ol>';
           
            if (room.transactions) {
                
                for (var t in room.transactions) {
                    var tmpD = new Date(ezSchedule.grid.startDate);
                    tmpD.setHours(0);
                    tmpD.setMinutes(0);
                    tmpD.setMilliseconds(0);
                    var isStartD = (tmpD > room.transactions[t].startDate) ? tmpD : room.transactions[t].startDate;
                    var pos = this.dateToPosition(isStartD, room.transactions[t].endDate);
                    //if (pos.width > 0) {
                        var widthRoom = (pos.width > 10) ? pos.width: 10;
                        var isRoomMove = (typeof(room.transactions[t].roomMove) == "undefined") ? false : room.transactions[t].roomMove;
                        var islastMove = (typeof(room.transactions[t].lastMove) == "undefined") ? false : true;
                        var hastagNextRoomMove = room.transactions[t].newHasTag;
                        var newRoomName = this.indexRooms[room.transactions[t].newRoomId];

                        var isGroup = false;
                        var companyName = (room.transactions[t].Company == null) ? "" : room.transactions[t].Company.CompanyCode;
                        var travellerName = "";
                        
                        if (room.transactions[t].Reservations == null){
                            room.transactions[t].Reservations = {};
                            travellerName = "REPAIR";
                        }else{
                            isGroup = room.transactions[t].Reservations.IsGroup;
                            var tmpTraveller = ((room.transactions[t].Travellers) ? room.transactions[t].Travellers.Fullname : "");

                            if (isGroup) travellerName = room.transactions[t].Reservations.ReservationCode != null ? room.transactions[t].Reservations.ReservationCode : tmpTraveller;
                            else travellerName = ((room.transactions[t].Travellers) ? room.transactions[t].Travellers.Fullname : "");

                            travellerName = ((companyName.length == 0) ? "" : (companyName + " - ")) + travellerName;

                            if(isRoomMove == true){
                                travellerName += " >>"
                            };
                            if (isRoomMove == false && (room.transactions[t].RoomMoveList && room.transactions[t].RoomMoveList.length > 0) && (room.transactions[t].BookingStatus == "CHECKIN" || room.transactions[t].BookingStatus == "CHECKOUT")) {
                                travellerName = ">> " + travellerName;
                            };
                        } 
                        // create tooltip html
                        var arrA = room.transactions[t].ArrivalDate;
                        var arrD = room.transactions[t].DepartureDate;
                        var labelA = (room.transactions[t].BookingStatus == "REPAIR") ? this.Lang["REPAIR_START_DATE_REPORT"] : this.Lang["DISPLAYGROUPDETAIL_ARRIVALDATE"];
                        var labelD = (room.transactions[t].BookingStatus == "REPAIR") ? this.Lang["REPAIR_END_DATE_REPORT"] : this.Lang["DISPLAYGROUPDETAIL_DEPARTUREDATE"];
                        var labelNote = (room.transactions[t].BookingStatus == "REPAIR") ? this.Lang["REPAIR_REASON_REPORT"] : this.Lang["NOTE"];
                        arrA = (arrA == null) ? null : arrA.format('dd/mm/yyyy HH:MM');
                        arrD = (arrD == null) ? null : arrD.format('dd/mm/yyyy HH:MM');

                        var isUseLock = 0;
                        if (room.transactions[t].RoomId != null){
                            isUseLock = (this.indexRoomsall[room.transactions[t].RoomId].UseLock) ? 1 : 0;
                        }
                        

                        var tooltip = '<table class=\'padding0 tool-tip white-text\' >';
                        tooltip += '<tr class=\'padding0\'><td class=\'padding10 padding-bottom10\'><table class=\'white-text\'>';
                        // tooltip += '<tr><td colspan=\'2\'><strong>' + room.transactions[t].Travellers.Fullname + '</strong></td></tr>';
                        tooltip += '<tr><td colspan=\'2\' class=\'full-name\'><strong>' + this.validationCharacter(travellerName) + '</strong></td></tr>';
                        
                        if (isRoomMove)
                        tooltip += '<tr class=\'yellow-text\'><td><strong>' + this.Lang["NEW_ROOM"] + '</strong></td><td> <strong>' + newRoomName + '</strong></td></tr>';
                        
                        if (room.transactions[t].BookingStatus != "REPAIR")
                        tooltip += '<tr><td>' + this.Lang["RES_NO"] + '</td><td> ' + room.transactions[t].Reservations.ReservationNumber + '</td></tr>';
                        
                        tooltip += '<tr><td>' + labelA + '</td><td> ' + arrA + '</td></tr>';
                        tooltip += '<tr><td>' + labelD + '</td><td> ' + arrD + '</td></tr>';
                        if (room.transactions[t].BookingStatus != "REPAIR")
                        tooltip += '<tr><td colspan=\'2\'>' + this.Lang["ADULT"] + " " + room.transactions[t].Adults + " - " + this.Lang["CHILD"] + " " + room.transactions[t].Child + '</td></tr>';
                        tooltip += '</table class=\' white\'></td><tr class=\'margin0 padding0\'>';
                        var tmpValNote = this.validationCharacter(room.transactions[t].Note);
                        if (tmpValNote != null) {
                            if (tmpValNote.length > 0)
                            tooltip += '<tr layout=\'row\' class=\'margin0 padding0 white text-gr padding10\'><td colspan=\'2\'  class=\' padding10 \'><strong>*' + labelNote + ':</strong> ' + tmpValNote + '</td></tr>';
                        }
                        tooltip += '</table>';

                        // create reservation html
                        tmp += '<div data-html="true" data-toggle="tooltip" isUseLock="' + isUseLock + '" isMove="' + ((isRoomMove) ? 1 : 0) + '"  class=" tran_cells gradius ' + ((isRoomMove) ? 'roomMove' : '') + ' ' + ((islastMove) ? 'islastMove' : '') + '" ' + 'status="' + room.transactions[t].BookingStatus + '" price="' + room.transactions[t].Price + '" room_id="' + room.id + '" tranId="' + room.transactions[t].id + '" reduce_balance="' + room.transactions[t].reduce_balance + '" status="' + room.transactions[t].status + '" reduce_amount="' + room.transactions[t].reduce_amount + '" endDate="' + room.transactions[t].endDate + '" startDate="' + room.transactions[t].startDate + '" reservationId="' + room.transactions[t].Reservations.ReservationId + '" tax_rate="' + room.transactions[t].tax_rate + '" service_rate="' + room.transactions[t].service_rate + '" isgroup="' + room.transactions[t].IsGroup + '" rrid="' + room.transactions[t].reservation_room_id + '" reservation="' + room.transactions[t].reservation_id + '" id="_CONFRESERV_' + room.transactions[t].uid + '" title="' + tooltip + '" style="background-color: ' + this.getStatusColor(room.transactions[t]) + '; left: ' + pos.left + 'px; width: ' + widthRoom + 'px;z-index: 55; display: block; background-position: initial initial; background-repeat: initial initial;overflow: hidden;">' + '<div class="position-relative   fullheight">' + '<div class=" isGroup position-absolute ' + ((room.transactions[t].IsGroup) ? '' : 'hide') + '" style="background:' + room.transactions[t].GroupColor + '"></div>' + '<div class="g_name newrightmenu " id="CONFRESERV,' + room.transactions[t].id + '" style="width:' + ((pos.width - 15) > 0 ? (pos.width - 15) : 0) + 'px;text-align:left;">' + '<i class="fa fa-flag white-text ' + ((room.transactions[t].IsGroupMaster) ? '' : 'hide') + '"></i> ' + travellerName + '</div>';
                            // + '<div class="circle-10 bg-red margin-top3 not-paid"></div>' // is paid
                        tmp += '</div>' + '</div>';
                    //}
                }
            }
            tmp += '</div>';
            return tmp;

        },
        createRightColDetailsRoomType: function(roomType) {
            var subscr = (jQuery("body").width() >= 1024 && jQuery("body").width() <= 1200) ? -3 : 0;
            var sub = (5 / ezSchedule.grid.numberOfDay) + subscr;
            var tmp = '<div  class="roomday r1 floor rlv' + roomType.id + '"  ><ol class="ui-selectable2 rowRoomType">';
            
            for (var i = 0; i < this.grid.numberOfDay; i++) {
                var countUR = "";
                var gStartDate = new Date(this.grid.startDate.format("yyyy/mm/dd"));
                var newD = gStartDate.addDays(i);
                var keyD = newD.getDate() + "/" + (newD.getMonth() + 1);
                tmp += '<li id="ur'+roomType.id+'_'+newD.format('ddmmyyyy')+'" roomType="'+roomType.id+'" dateUR="'+newD+'" class="null ui-state-default2 _b text-center" style="border-right: 1px solid gainsboro !important;box-sizing:border-box;padding-top:5px;width:' + (this.getColumnWidth()) + 'px"  rel="1" title="">' + countUR + '</li>';
            }
            tmp += '</ol>';
            tmp += '</div>';
            jQuery("#conRight").append(tmp); 
        },
        createDateItem : function(i, date) {
            var dayInWeek = date.getDay();
            var tmpW = jQuery("#grid").width() - jQuery("#tplLeft").width() - 5.25; //(ezSchedule.grid.numberOfDay-1);

            var grid2 = $("#grid").width();
            var subscr = (jQuery("body").width() >= 1024 && jQuery("body").width() <= 1200) ? 2 : 0;
            subMenu = (grid2 < 800) ? (2) : (27 / 30);
            
            var idm = date.format('ddmmyyyy');
             
            var titleT = '';
            var isLastWeek = '';
            if (dayInWeek == 0 || dayInWeek == 6){
                titleT = ezSchedule.Lang["CM_WEEKEND"];
                isLastWeek = 'isLastWeek';
            }
            var isDateNow = '';
            
            if ( !ezSchedule.isfindedDateNow ){ 
                var now = new Date(); 
                now.setHours(0);
                now.setMinutes(0);
                now.setMilliseconds(0);
                now.setSeconds(0); 
                if (date.getTime() == now.getTime()) {
                    isDateNow = '<div id="isNowDate"></div>';
                    ezSchedule.isfindedDateNow = true; 
                }
            }
            var nameD = ezSchedule.DateInWeek[dayInWeek];
            var wd = this.getColumnWidth() + ((i==0)?1:0);
            // if (i % 2 == 0)this.grid.numberOfDay
            // return '<li style="width:' + (this.getColumnWidth() +subMenu-subscr) + 'px;" class="lidate padding-top5' + sunday + ' title_a t_' + i + '" id="t_' + i + '" data="' + date.format('dd/mm/yyyy') + '"><span class="bdate">' + 0 + '</span><span class="bday"><span class="hide-mobile">' + date.format("ddd") + '</span> ' + date.format("dd") + '</span><span class="perd"> 40% </span><span class="descholi" style="display:none;"></span></li>';
            // return '<li style="width:' + (tmpW / ezSchedule.grid.numberOfDay) + 'px;" class="lidate padding-top5' + sunday + ' title_a t_' + i + '" id="t_' + i + '" data="' + date.format('dd/mm/yyyy') + '"><div class="bdate" id="' + idm + '" style="cursor:initial">' + 0 + '</div><div class="bday"><span class="hide-mobile">' + date.format("dd/mm") + '</span> ' + '</div><span class="descholi" style="display:none;"></span></li>';
            return '<li style="width:' + wd + 'px;" title="' + titleT + '" class="lidate ' + isLastWeek + ' padding-top5  title_a t_' + i + '" id="t_' + i + '" data="' + date.format('dd/mm/yyyy') + '"><div class="bday  "><span>' + nameD + "<br> " + date.format("dd") + ' <span class="bdate hide" id="' + idm + '" dateUR="' + date.getTime() + '" >(' + 0 + ')</span> </span> ' + isDateNow +'</div><span class="descholi" style="display:none;"></span></li>';
            // else
            // return '<li style="width:' + this.getColumnWidth() + 'px;" class="lidate' + sunday + ' title_b" id="t_' + i + '" data="' + date.format('dd/mm/yyyy') + '"><span class="bdate">' + date.format("dd") + '</span><span class="bday">' + date.format("mm") + '</span><span class="bday">' + date.format("ddd") + '</span><span class="descholi" style="display:none;"></span></li>';

        },
        createDateItem_mirror: function(i, date) {

            var sunday = "";
            if (date.getDay() == 0)
                sunday = " sunday";
            // if (i % 2 == 0)
            return '<li style="width:' + this.getColumnWidth() + 'px;" class="lidate padding-top5' + sunday + ' title_a t_' + i + '" id="t_' + i + '" data="' + date.format('dd/mm/yyyy') + '"><span class="bday">' + date.format("ddd") + " " + date.format("dd") + '</span><span class="perd">40</span><br><span class="bdate">' + 0 + '</span><span class="descholi" style="display:none;"></span></li>';
            // else
            // return '<li style="width:' + this.getColumnWidth() + 'px;" class="lidate' + sunday + ' title_b" id="t_' + i + '" data="' + date.format('dd/mm/yyyy') + '"><span class="bdate">' + date.format("dd") + '</span><span class="bday">' + date.format("mm") + '</span><span class="bday">' + date.format("ddd") + '</span><span class="descholi" style="display:none;"></span></li>';

        },
        createDateItem2: function(i, date) {

            var sunday = "";
            var dd = i + "";
            if (dd.length == 1)
                dd = "0" + dd;
            dd += "h";
            if (i % 2 == 0)
                return '<li style="width:' + this.getColumnWidth() / 24 + 'px;" class="lidate' + sunday + ' title_a" id="t_' + i + '" data="' + date.format('dd/mm/yyyy') + '"><span class="bdate">&nbsp;</span><span class="bday">' + dd + '</span><span class="bday"></span><span class="descholi" style="display:none;"></span></li>';
            else
                return '<li style="width:' + this.getColumnWidth() / 24 + 'px;" class="lidate' + sunday + ' title_b" id="t_' + i + '" data="' + date.format('dd/mm/yyyy') + '"><span class="bdate">&nbsp;</span><span class="bday">' + dd + '</span><span class="bday"></span><span class="descholi" style="display:none;"></span></li>';

        },
        getColumnWidth: function() {

            var wr = ((jQuery('md-sidenav[ng-click="closeNavRight1()"]._md-locked-open').width() == null) ? 0 : jQuery('md-sidenav[ng-click="closeNavRight1()"]').width());
            var subMenu = ((wr == 0) ? (-19) : (9));
            var grid2 = $("#grid").width();
            subMenu = (grid2 < 800) ? (12) : subMenu;
            // var subscr = ( jQuery("body").width() >= 1024 )?20:0;
            // var gridw = $("#grid").width() - subMenu - $("#tplLeft").width();// - subscr;
            var gridw = jQuery("#grid").width() - jQuery("#tplLeft").width() - 6; // - ezSchedule.grid.numberOfDay;

            // return jQuery("#grid").width() - jQuery("#tplLeft").width() - (ezSchedule.grid.numberOfDay-1);
            return parseInt((gridw) / this.grid.numberOfDay);

        },
        calculateFreeRooms: function() {

            var grid = this.grid;
            var today = new Date();
            var todayDate = new Date(today.format("yyyy/mm/dd"));
            var gStartDate = new Date(grid.startDate.format("yyyy/mm/dd"));
            $("#olroomavailable").empty();
            $("#olusedroom").empty();
            $("#olroomusage").empty();
            for (i = 0; i < grid.numberOfDay; i++) {
                var currentDay = gStartDate.addDays(i);
                var totalAvail = 0;
                var totalRepair = 0;
                var total = 0;
                for (var rt in grid.roomList) {
                    var availableRoom = 0;
                    var repairRoom = 0;
                    for (var r in grid.roomList[rt].rooms) {
                        // grid.roomList[rt].rooms[r].transactions = [];
                        for (var t in grid.roomList[rt].rooms[r].transactions) {
                            sDate = grid.roomList[rt].rooms[r].transactions[t].startDate;
                            eDate = grid.roomList[rt].rooms[r].transactions[t].endDate;
                            if ((currentDay.addDays(1) > sDate && currentDay < eDate) && grid.roomList[rt].rooms[r].transactions[t].status == "REPAIR")
                                repairRoom++;
                        }
                        total++;
                        if (grid.roomList[rt].rooms[r].transactions != undefined && grid.roomList[rt].rooms[r].transactions.length == 0) {
                            availableRoom++;
                        } else {
                            var Ok = true;
                            for (t in grid.roomList[rt].rooms[r].transactions) {
                                sDate = grid.roomList[rt].rooms[r].transactions[t].startDate;
                                eDate = grid.roomList[rt].rooms[r].transactions[t].endDate;
                               
                                if ((currentDay.addDays(1) > sDate && currentDay.addDays(1) < eDate) && (!(todayDate.getTime() == currentDay.getTime() && grid.roomList[rt].rooms[r].transactions[t].status == "CHECKOUT")) && (grid.roomList[rt].rooms[r].transactions[t].status != "REPAIR")) {

                                    Ok = false;
                                    break;
                                }
                            }
                            if (Ok)
                                availableRoom++;
                        }
                    }
                    //console.warn(currentDay, rt, availableRoom,"rt_" + grid.roomList[rt].id + "_" + i);
                    totalAvail += availableRoom;
                    totalRepair += repairRoom;
                    $("#rt_" + grid.roomList[rt].id + "_" + i).text(availableRoom);
                }
              
                $("#olusedroom").append("<li class='mli' style='width:" + (this.getColumnWidth() - 1) + "px;border-right:1px solid #cccccc !important;'>" + (total - totalAvail) + "</li>");
                $("#olroomusage").append("<li class='mli' style='width:" + (this.getColumnWidth() - 1) + "px;border-right:1px solid #cccccc !important;'>" + Math.round(((total - totalAvail) / (total - totalRepair)) * 1000) / 10 + "</li>");
                $("#olroomavailable").append("<li class='mli' style='width:" + (this.getColumnWidth() - 1) + "px;border-right:1px solid #cccccc !important;'>" + (totalAvail - totalRepair) + "</li>");
            }
            this.grid = grid;
            // setTimeout(function(){  
            
            this.doResize();
            // }, 3000);
        },
        eventMousestart: function() {

            this.tmpevent = '';
            $("#conRight").bind("mousedown touchstart", function(event) {
                $("#myMenu2").hide();

                ezSchedule.tmpevent = event;
                ezSchedule.justClickedOnTransaction = false;
                if (ezSchedule.justClickedOnTransaction) return;
                //get corresponding date
                event.preventDefault();
                try {
                    var touch = event;
                    var isTouchSupported = 'ontouchstart' in window;
                    if (isTouchSupported)
                        touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
                    
                    var dayPos = Math.floor((touch.pageX - $("#conRight").offset().left) / ezSchedule.getColumnWidth());
                    var elemPos = ezSchedule.mousePosToElements(event);
                    var newroom = $("#new-room");
                    if (newroom.length != 0) {
                        newroom.remove();
                    }
                    var room_row_id = elemPos.roomElemId.replace("st_", "rm_");
                    var room_row = $("#" + room_row_id);
                    var date_elem = $("#t_" + dayPos);
                    new_room_start_date = date_elem.attr("data");
                    
                    ezSchedule.new_start_date = new_room_start_date;
                    if (ezSchedule.grid.numberOfDay == 1) {
                        //new_room_start_date = $("#startDate").val();
                        //ezSchedule.new_start_hour = Math.floor((touch.pageX - $("#conRight").offset().left) * 24 / ezSchedule.getColumnWidth());
                    }
                    ezSchedule.new_start_hour = Math.floor((touch.pageX - $("#conRight").offset().left) * 24 / ezSchedule.getColumnWidth());
                    new_room_id = elemPos.roomElemId.replace("st_", "");
                    
                    // var elem = '<div class="tran_cells gradius white-text text-center" id="new-room"  style="line-height: 23px;background-color: green; left: ' + (touch.pageX - room_row.offset().left - 10) + 'px; width: ' + 20 + 'px; z-index: 55; display: block; background-position: initial initial; background-repeat: initial initial;">' + '<span id="new_start_date">' + ezSchedule.formatDate(ezSchedule.new_start_date) + '</span> - <span id="new_end_date">' + ezSchedule.formatDate(ezSchedule.new_end_date) + '</span>' + '</div>';
                    var elem = '<div class="tran_cells gradius white-text text-center" id="new-room"  style="line-height: 23px;background-color: green; left: ' + (touch.pageX - room_row.offset().left - 10) + 'px; width: ' + 20 + 'px; z-index: 55; display: block; background-position: initial initial; background-repeat: initial initial;">' + '<span id="new_start_date">' + 1 + '</span><span> '+ezSchedule.Lang["NIGHT_REPORT"]+' </span>' + '</div>';
                    room_row.append(elem);

                    ezSchedule.creatingNewRoom = true;
                } catch (err) {

                }
            });

        },
        eventMousemove: function() {

            $("#conRight").bind("mousemove touchmove", function(event) {
                if (ezSchedule.justClickedOnTransaction)
                    return;
                event.preventDefault();
                var touch = event;
                var isTouchSupported = 'ontouchstart' in window;
                if (isTouchSupported)
                    touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
                //get corresponding date
                if (ezSchedule.grid.numberOfDay > 1) {
                    var dayPos = Math.floor((touch.pageX - $("#conRight").offset().left) / ezSchedule.getColumnWidth());
                    $(".lidate").removeClass("rowhover");
                    $(".t_" + dayPos).addClass("rowhover");
                } else {
                    var dayPos = Math.floor((touch.pageX - $("#conRight").offset().left) * 24 / ezSchedule.getColumnWidth());
                    $(".lidate").removeClass("rowhover");
                    $(".t_" + dayPos).addClass("rowhover");
                }

                var elemPos = ezSchedule.mousePosToElements(event);
                // var new_room_end_date = "";
                if (ezSchedule.creatingNewRoom) {
                    var new_room = $("#new-room");
                    if (new_room.length != 0) {
                        var rW = touch.pageX - new_room.offset().left;
                        if (rW > 10) {
                            var date_elem = $("#t_" + dayPos);
                            new_room_end_date = date_elem.attr("data");
                            if (ezSchedule.grid.numberOfDay == 1) {
                                new_room_end_date = new_room_start_date;
                                ezSchedule.new_end_hour = Math.floor((touch.pageX - $("#conRight").offset().left) * 24 / ezSchedule.getColumnWidth());
                            }
                            new_room.width(rW);
                        } else {
                            new_room_end_date = new_room_start_date;
                            if (ezSchedule.grid.numberOfDay == 1) {
                                ezSchedule.new_end_hour = ezSchedule.new_start_hour + 1;
                            }
                        }
                    }
                }
                if (typeof(new_room_end_date) != "undefined") {
                    jQuery("#new_end_date").html(ezSchedule.formatDate(new_room_end_date));
                    ezSchedule.new_end_date = new_room_end_date;
                    var night = ezSchedule.countNight(ezSchedule.new_start_date, ezSchedule.new_end_date);
                    jQuery("#new_start_date").html(night);
                }
            });

        },
        eventMouseEnd: function() {

            $("#conRight").bind("click", function(event) {
                ezSchedule.creatingNewRoom = false;
                var touch = event;
                var dayPos = Math.floor((touch.pageX - $("#conRight").offset().left) / ezSchedule.getColumnWidth());
                var new_room = $("#new-room");
                if (new_room == undefined) return;
                if (new_room.length != 0) {
                    var rW = touch.pageX - new_room.offset().left;
                    if (rW > 10) {
                        var date_elem = $("#t_" + dayPos);
                        new_room_end_date = date_elem.attr("data");
                        if (grid.numberOfDay == 1) {
                            new_room_end_date = new_room_start_date;
                            ezSchedule.new_end_hour = Math.floor((touch.pageX - $("#conRight").offset().left) * 24 / ezSchedule.getColumnWidth());
                        }
                        new_room.width(rW);
                    } else {
                        new_room_end_date = new_room_start_date;
                        if (grid.numberOfDay == 1) {
                            ezSchedule.new_end_hour = ezSchedule.new_start_hour + 1;
                        }
                    }
                } 
                
            });

        },
        countNight: function( startdate, endDate ){

            var t2 = startdate.split("/");
            var date1 = new Date(t2[1]+"/"+t2[0]+"/"+t2[2]);
            var t = endDate.split("/");
            var date2 = new Date(t[1]+"/"+t[0]+"/"+t[2]);
            var timeDiff = Math.abs(date2.getTime() - date1.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            diffDays = (diffDays==0)?1:diffDays;
            return diffDays; 

        },
        eventMenu: function() {
            $("#conRight")
                .contextMenu({
                    menu: 'myMenu2'
                }, function(action, el, pos) {
                    var newroom = $("#new-room");
                    if (ezSchedule.justClickedOnTransaction) {
                        ezSchedule.justClickedOnTransaction = false;
                        return;
                    }
                    // default hour
                    var new_end_hour = "23:00";
                    var new_start_hour = "12:00";
                    ezSchedule.timeNewRoom = ezSchedule.calculateStartEndTime($("#new-room"));
                    event = ezSchedule.tmpevent;
                    if (ezSchedule.creatingNewRoom) {
                        var touch = event;
                        var isTouchSupported = 'ontouchstart' in window;
                        if (isTouchSupported)
                            touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
                        //get corresponding date
                        var dayPos = Math.floor((touch.pageX - $("#conRight").offset().left) / ezSchedule.getColumnWidth());
                        if (newroom.length != 0) {
                            var rW = touch.pageX - newroom.offset().left;
                            if (rW > 10) {
                                var date_elem = $("#t_" + dayPos);
                                new_room_end_date = date_elem.attr("data");
                                if (grid.numberOfDay == 1) {
                                    new_room_end_date = new_room_start_date;
                                    new_end_hour = Math.floor((touch.pageX - $("#conRight").offset().left) * 24 / ezSchedule.getColumnWidth());
                                }
                                newroom.width(rW);
                            } else {
                                new_room_end_date = new_room_start_date;
                                if (grid.numberOfDay == 1) {
                                    new_end_hour = new_start_hour + 1;
                                }
                            }
                        }
                    }

                    if (newroom.length != 0) {
                        newroom.remove();
                    }

                    if(action == 'UnassignRoom'){
                        ezSchedule.showUnassignRoomEvent(el.dateUR,el.roomTypeId);
                        return;
                    }
                    for (var i = ezSchedule.MenuCreate.length - 1; i >= 0; i--) {
                        if (("cm_" + ezSchedule.MenuCreate[i].id) == action) { 
                            var op = {
                                'new_room_id': new_room_id,
                                'new_room_start_date': ezSchedule.timeNewRoom.startDate.format("dd/mm/yyyy"),
                                'new_room_end_date': ezSchedule.timeNewRoom.EndDate.format("dd/mm/yyyy"),
                                'new_start_hour': ezSchedule.timeNewRoom.startDate.format("HH:MM"),
                                'new_end_hour': ezSchedule.timeNewRoom.EndDate.format("HH:MM")
                            };
                            ezSchedule.MenuCreate[i].event(op);
                        }
                    }

                });

        },
        mousePosToElements: function(event) {
            var elems = new Object();
            var touch = event;
            var isTouchSupported = 'ontouchstart' in window;
            if (isTouchSupported)
                touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
            var dayPos = Math.floor((touch.pageX - $("#conRight").offset().left) / ezSchedule.getColumnWidth());
            elems.dayPos = dayPos;
            $(".sidetitle").each(function() {
                if (touch.pageY >= $(this).offset().top && touch.pageY < $(this).offset().top + $(this).height()) {
                    $(this).addClass("rowhover");
                    elems.roomElemId = this.id;
                } else {
                    $(this).removeClass("rowhover");
                }
            });
            return elems;

        },
        eventChangeDate: function() {

            $(".daychange").removeClass("activeview");
            $("#other_days").val(this.grid.numberOfDay);

            $(".daychange").each(function() {

                if ($(this).attr("title") == ezSchedule.grid.numberOfDay) {
                    $(this).addClass("activeview");
                    }

            });

            $(".daychange").click(function() {

                $(".daychange").removeClass("activeview");
                $(this).addClass("activeview");
                $("#other_days").val(this.id);
                ezSchedule.grid.numberOfDay = parseInt(this.id);
                localStorage.setItem("grid_default_day", ezSchedule.grid.numberOfDay);
                ezSchedule.showJQloading("#room_view");
                ezSchedule.parameter = parseInt(this.id); // jQuery(this).attr("id");
                localStorage.date_default_day = ezSchedule.grid.startDate;
                ezSchedule.load_data(ezSchedule.grid.startDate, ezSchedule.parameter);
                ezSchedule.hideJQloading("#room_view");

            });

        },
        eventClearnRoom: function (key) {
            $("#st_" + key).click(function () {
                var roomId = $(this).attr("id").replace("st_", "");
                if (!isNaN(roomId)) {
                    var room = {
                        RoomId: roomId
                    }
                    if ($(this).find("span").hasClass('isDirty')) {
                        ezSchedule.processClean(room);
                    } else {
                        ezSchedule.processSetDirtyRoom(room); 
                    }
                }
            });
        },
        eventTogetherRoomType: function() {

            jQuery(".roomLevelMenu").each(function() {
                jQuery(this).click(function() {
                    var roomLevelId = jQuery(this).attr("dataId");
                    ezSchedule.doToggeRoomType(roomLevelId);
                });
            });

        },
        doToggeRoomType: function(roomLevelId) {

            if (!jQuery("#roomType_" + roomLevelId).hasClass("isHide")) {
                jQuery("#roomType_" + roomLevelId).addClass("isHide");
                jQuery("#iconArrow_" + roomLevelId).text(">");
                jQuery(".roomlevel" + roomLevelId).hide();
            } else {
                jQuery("#roomType_" + roomLevelId).removeClass("isHide");
                jQuery("#iconArrow_" + roomLevelId).text("v");
                jQuery(".roomlevel" + roomLevelId).show();
            }

        },
        doHideRoomType: function(roomLevelId) {

            jQuery("#roomType_" + roomLevelId).addClass("isHide");
            jQuery(".roomlevel" + roomLevelId).hide();

        },
        doShowRoomType: function(roomLevelId) {

            jQuery("#roomType_" + roomLevelId).removeClass("isHide");
            jQuery(".roomlevel" + roomLevelId).show();

        },
        showJQloading: function(id) {

            $(id).showLoading();

        },
        hideJQloading: function(id) {

            $(id).delay(600).queue(function() {
                $(this).hideLoading();
                $(this).dequeue();
            });

        },
        dateToPosition: function(startDate, endDate) {

            var pos = new Object();
            var idx = 0.0;
            idx = startDate.getHours() / 24;
            /*if (startDate.getHours()>=6) {
                idx = 0.5;
            }*/

            var gStartDate = new Date(this.grid.startDate.format("yyyy/mm/dd"));
            var StartDate = new Date(startDate.format("yyyy/mm/dd"));

            if (daysBetween(gStartDate, endDate).days < 0) {
                return { width: 0, left: 0 };
            }
            var EndDate = new Date(endDate.format("yyyy/mm/dd"));
            var dateFromStart = daysBetween(gStartDate, startDate);

            if (dateFromStart.days >= 0) {
                idx += dateFromStart.days;
            } else {
                idx = 0;
            }

            var dateDiff = this.daysBetween(startDate, endDate);
            var getColumnWidth = this.getColumnWidth();
            if (dateFromStart.days < 0)
                dateDiff = this.daysBetween(gStartDate, EndDate);
            if (dateDiff.days == 0 && gStartDate.getDate() == endDate.getDate() && idx >= 0) {
                //pos.width = getColumnWidth()/2;
                pos.width = (endDate.getHours()) * getColumnWidth / 24 - idx * ezSchedule.getColumnWidth();
            } else {
                if (dateFromStart.days < 0) {
                    pos.width = getColumnWidth * (dateDiff.days + idx);
                } else
                    pos.width = getColumnWidth * (dateDiff.days + dateDiff.hours / 24);

            }
            if (idx < 0) idx = -.1;
            pos.left = getColumnWidth * idx;
            // if (pos.width < 30)
            // pos.width = 30;
            //console.warn(pos);
            return pos;

        },
        daysBetween: function(date1, date2) {

            //Get 1 day in milliseconds
            var ret = new Object();
            var one_day = 1000 * 60 * 60 * 24;

            // Convert both dates to milliseconds
            var date1_ms = date1.getTime();
            var date2_ms = date2.getTime();

            // Calculate the difference in milliseconds
            var difference_ms = date2_ms - date1_ms;
            //take out milliseconds
            difference_ms = difference_ms / 1000;
            ret.seconds = Math.floor(difference_ms % 60);
            difference_ms = difference_ms / 60;
            ret.minutes = Math.floor(difference_ms % 60);
            difference_ms = difference_ms / 60;
            ret.hours = Math.floor(difference_ms % 24);
            ret.days = Math.floor(difference_ms / 24);
            return ret;

        },
        getStatusColor: function(transaction) {
            var status = transaction.BookingStatus;
           
            var isColor = this.statusColor[status];
            isColor = ((isColor == null) ? "rgba(255, 255, 255, .6)" : isColor);
            return isColor;
            /*if (false) {
                return transaction.color;
            } else {
                var status = transaction.BookingStatus;
                switch (status) {
                    case 'BOOKED':
                        return '#16A087';
                    case 'CHECKIN':
                        return "#0080ff";
                    case 'REPAIR':
                        return "#373737";
                    case 'OVERDUE':
                        return "rgba(200, 0, 0, .7)";
                    case 'NOSHOW':
                        return "#FF5722";     
                    case 'CHECKOUT':
                        return "rgba(0, 0, 255, .6)";
                    default:
                        return "rgba(255, 255, 255, .6)";
                        break;
                }
            }*/

        },
        onDragEnd: function(e) {
           
        },
        onDropTarget: function(e) {
            if (ezSchedule.isDropAble(e)) {
                $("#myMenu").hide();
                e.draggable.element.detach();
                e.dropTarget.append(e.draggable.element);
            }
        },
        isDropAble: function(e) {
            var roomStatus = e.draggable.element.attr("status");
            //
            if (roomStatus != "CHECKOUT" && roomStatus != "REPAIR") {
                var rrid = e.draggable.element.attr("rrid");
                var old_room_id = e.draggable.element.attr("room_id");
                var rr_id = e.draggable.element.attr("tranid");
                var old_arrival = new Date(e.draggable.element.attr("startdate"));
                var old_departure = new Date(e.draggable.element.attr("enddate"));
                var new_startDate;
                var new_endDate;
                if(roomStatus == 'BOOKED' || roomStatus == 'NOSHOW'){
                    var dayBetween = ezSchedule.day_between(old_arrival,old_departure);
                    var event = ezSchedule.tmpevent;
                    var dayPos = Math.floor(((e.pageX - e.offsetX ) - $("#conRight").offset().left) / ezSchedule.getColumnWidth());
                    var date_elem = $("#t_" + dayPos);
                    if (date_elem.attr("data") == undefined) return false;
                    new_startDate = ezSchedule.convertStartDateRoomMove(date_elem.attr("data"));
                    new_endDate = ezSchedule.addDays(new_startDate,dayBetween);
                }else{
                    new_startDate = old_arrival;
                    new_endDate = old_departure;
                }
                //
                var grid = this.grid;
                if (typeof(e.dropTarget.attr("id")) == "undefined") return false;
                var new_room_id = e.dropTarget.attr("id").substr(3);
                var indexlv = e.dropTarget.attr("indexlv");

                var new_tranId = e.dropTarget.attr("tranid");
                if (new_room_id == old_room_id) return false;

                if (typeof(ezSchedule.indexRTransitions[indexlv + "_" + new_room_id]) != "undefined") {
                    var transactions = ezSchedule.indexRTransitions[indexlv + "_" + new_room_id]; //.transactions;    
                    if(transactions && transactions.length > 0){
                        for (var t in transactions) {
                            var trans = transactions[t];
                            if (trans.ArrivalDate <= new_endDate && trans.DepartureDate >= new_startDate) {
                                return false;
                            }
                        }
                    }
                }
                var menuRoomMove = _.filter(ezSchedule.MenuDetail, function(menu) {
                        return menu.id == "ROOM_MOVE";
                    })[0];
                    var op = {
                        'room_id': old_room_id,
                        'tranid': rr_id,
                        'isGroup': null,
                        'reservationId': null,
                        'startdate': new_startDate,
                        'enddate': new_endDate,
                        'isRepair':null,
                        'data': ezSchedule.grid
                    };
                    menuRoomMove.event(op,new_room_id);
                   
                    // e.draggable.element.attr("room_id", new_room_id);
                    // return true;
                    
               
            } else {
                return; 
                
            }
            return ;
        },
        formatDate: function(val) {

            var dev = val.split("/");
            return dev[0] + "/" + dev[1];

        },
        setMenuCreate: function(val) {
            this.MenuCreate = val;
            var domHtml = "";
           
            for (x in val) {
                domHtml += '<li><a href="#cm_' + val[x].id + '">' + val[x].name + '</a></li>';
            }
            jQuery("#myMenu2").html(domHtml);
        },
        setMenuDetail: function(val) {
            this.MenuDetail = val;
            var domHtml = "";
            for (x in val) {
                domHtml += '<li><a href="#detail_' + val[x].id + '">' + val[x].name + '</a></li>';
            }
            jQuery("#myMenu").html(domHtml);
        },
        eventResize: function() {
            $(window).bind('resize', function(e) {
                // .resize(function() {
                /*ezSchedule.grid.width = $("#room_view").width();
                ezSchedule.doResize(true);
                ezSchedule.prepairGrid();*/
                setTimeout(function(){
                    
                    ezSchedule.grid.width = $("#room_view").width();
                    $("#tplRight").width($("#room_view").width() - 144);
                    $("#conRight").width($("#room_view").width() - 144);
                    $("#boundary").height((window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) - 100);
                    ezSchedule.prepairGrid();
                    ezSchedule.doResize();

                }, 1000)
                
            });
        },
        actionResize: function(){
            ezSchedule.showJQloading("#room_view"); 
                
            setTimeout(function(){
                    
                    // ezSchedule.grid.width = $("#room_view").width();
                    $("#tplRight").width($("#room_view").width() - 144);
                    $("#conRight").width($("#room_view").width() - 144);
                    $("#boundary").height((window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) - 100);
                    ezSchedule.prepairGrid();
                    ezSchedule.doResize();
                    ezSchedule.hideJQloading("#room_view");

                }, 400)
        },
        doResize: function() {

            var wr = ((jQuery('md-sidenav[ng-click="closeNavRight1()"]._md-locked-open').width() == null) ? jQuery('md-sidenav[ng-click="closeNavRight1()"]').width() : 0);
            var subMenu = ((wr == 0) ? (0) : (-17));
            
            var gridw2 = $("#grid").width();
            subMenu = (gridw2 <= 1024) ? (0) : subMenu;
            var gridw = $("#grid").width() - subMenu;
         

            var tmpW = jQuery("#grid").width() - jQuery("#tplLeft").width() - subMenu;
            
            var tmpW2 = jQuery("#grid").width() - jQuery("#tplLeft").width() - 6; //(ezSchedule.grid.numberOfDay-1);
            // $("#tplRight").width(tmpW - 6); 
            $("#tplRight").width(tmpW2);
            $("#conRight").width(tmpW2);
            $("#boundary").height((window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) - 200);
            

        },
        eventNextDate: function() {

            $("#next").click(function() {
                var grid = ezSchedule.grid;
                ezSchedule.grid.startDate = grid.startDate.addDays(parseInt(grid.numberOfDay));
                // ezSchedule.showJQloading("#room_view");
               
                //load new data
                ezSchedule.load_data(grid.startDate, ezSchedule.parameter);
                //reload Grid
                // ezSchedule.hideJQloading("#room_view");
                // ezSchedule.prepairGrid();

            });

        },
        eventPreDate: function() {

            $("#pre").click(function() {
                var grid = ezSchedule.grid;
                ezSchedule.grid.startDate = grid.startDate.addDays(-parseInt(grid.numberOfDay));
                // ezSchedule.showJQloading("#room_view");
                //load new data
               
                //load_data(month,year);
                ezSchedule.load_data(grid.startDate, ezSchedule.parameter);
                //reload Grid
                // ezSchedule.hideJQloading("#room_view");
                // ezSchedule.prepairGrid();

            });

        },
        calculateStartEndTime: function( opNewRoom ){
            var result = {
                startDate: ezSchedule.grid.startDate,
                EndDate: ezSchedule.grid.startDate
            };
            if (opNewRoom.offset() == undefined) return result;

            var wrapW = jQuery("#tplRight");
            wrapLeft = wrapW.offset().left;
            wrapWidth = wrapW.width();

            var widthCol = wrapWidth / ezSchedule.grid.numberOfDay;
            var leftNewRoom = opNewRoom.offset().left;
            var WidthNewRoom = opNewRoom.width();
            

            result.startDate = ezSchedule.getTimeByPosition(result.startDate, leftNewRoom - wrapLeft, widthCol);
            result.EndDate = ezSchedule.getTimeByPosition(result.EndDate, leftNewRoom - wrapLeft + WidthNewRoom, widthCol);
            return result;
        },
        getTimeByPosition: function( startD, position, widthCol ) {
            var result = new Date(startD);
            var currentStartTime = ((position % widthCol) / widthCol) * 24 * 3600;
            var currentDate = Math.floor((position / widthCol));
            var currentH = Math.floor(currentStartTime / 3600);
            var currentM = Math.floor( (currentStartTime % 3600) / 60 );
            result = result.addDays(currentDate);
            result.setHours(currentH);
            result.setMinutes(currentM);
            return result;
        },
        validationCharacter: function(stringvl){
            if (typeof stringvl != "string") return "";
            return stringvl.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
        }
    }

    jQuery(document).ready(function() { 

    });
