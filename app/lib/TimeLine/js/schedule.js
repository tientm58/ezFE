 


var downloadedData;
var startInspect = new Date().getTime();
var d = new Date();
var floors;
var day = d.getDate();
var list_room = {};

function reload_data() {
    var parameter = 15;
    var d = new Date();
    var year = d.getFullYear();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    load_data(day, month, year, parameter);
    hide_popup();
    message('success', 'success', jQuery("#cuc-error"));

}

function auto_hide(tmp) {
    tmp.delay(3000).addClass('flipOutX').removeClass('flipInX').fadeOut('5000', function() {
        jQuery("#cuc-error").css('display', 'none');
    });;
}

// Name:        message
// Author:      Membell
// Time:        12:49 23/04/2014
// Parameter:   event (loai message), messagei(message muon truyen ra)
// Description: Ham thong bao cho nguoi dung
function message(event, messagei, thism) {
    jQuery("#cuc-error").show();
    var check_t = 0;
    switch (event) {
        case 'error':
            var mmessage = '<div class="alert  alert-error flipInX">' + '<a class="close" data-dismiss="alert"></a>' + '<strong>Error:</strong>' + ' ' + messagei + '</div>';
            // localStorage.stmessage = 0;            
            break;
        case 'success':
            var mmessage = '<div  class="alert  alert-success flipInX">' + '<a class="close" data-dismiss="alert"></a>' + '<strong>Success:</strong>' + ' ' + messagei + '</div>';
            auto_hide(jQuery(".alert"));
            // localStorage.stmessage = 0;            
            break;
        case 'warning':
            var mmessage = '<div class="alert  alert-info flipInX">' + '<a class="close" data-dismiss="alert"></a>' + '<strong>Warning:</strong>' + ' ' + messagei + '</div>';
            // localStorage.stmessage = 0;            
            break;
        case 'terror':
            check_t = 1;
            localStorage.message = messagei;
            localStorage.stmessage = 'error';
            break;
        case 'tsuccess':
            check_t = 1;
            localStorage.message = messagei;
            localStorage.stmessage = 'success';
            break;
        case 'twarning':
            check_t = 1;
            localStorage.message = messagei;
            localStorage.stmessage = 'warning';
            break;
    }
    if (check_t == 0) {
        if (!thism.find("div.alert").hasClass("flipInX")) {
            thism.append(mmessage);
        }
        jQuery("a.close").click(function() {
            jQuery(this).parent().addClass('flipOutX').removeClass('flipInX').fadeOut('5000', function() {
                jQuery("#cuc-error").css('display', 'none');
            });
        });
    }

}

function datechange() {
    var from = $("#startDate").val().split("/");
    var newDate = new Date(from[2], from[1] - 1, from[0]);
    console.warn(newDate);
    grid.startDate = newDate;
    load_data(from[0], parseInt(from[1]), from[2], parameter);
}

// Name:  View Bill      
// Author:      DungICT
// Time:        28/04/2014
// Parameter:  month(thang) year(nam)
// Description: Load da ta
// Editor : MEMBELL 17:33 04/05/2014 them cac truong can thiet, bo sung mont, year   
var mdata;

function load_data(day, month, year, parameter) {
    var url = '';
    if (month == '') {
        var d = new Date();
        year = d.getFullYear();
        month = d.getMonth() + 1;
        day = d.getDate();
        parameter = $.cookie("grid_default_day");
        if (!parameter)
            parameter = 15;
        if (!parameter)
            parameter = 15;

        url = "?page=monthly_room_report&json=1&old=1&month=" + month + "&year=" + year + "&day=" + day + "&parameter=" + parameter + "#" + Math.random();
    } else {
        parameter = $.cookie("grid_default_day");
        if (!parameter)
            parameter = 15;
        if (!parameter)
            parameter = 15;
        url = "?page=monthly_room_report&json=1&old=1&month=" + month + "&year=" + year + "&day=" + day + "&parameter=" + parameter + "#" + Math.random();
    }
    /*jQuery.post(
        url,
        function(data) {*/
    data = { "year": "2016", "month": "11", "day": "26", "duration": "15", "current_day": 26, "days_in_month": 30, "disabled_cell_color": "#EFEFEF", "rooms": [{ "id": "G01", "room_name": "G01", "room_id": "1", "floor": "T1", "reservation_id": "", "color": "", "room_level_id": "5", "room_level_name": "TWGV", "room_level_color": null, "transactions": [] }, { "id": "G02", "room_name": "G02", "room_id": "2", "floor": "T1", "reservation_id": "", "color": "", "room_level_id": "5", "room_level_name": "TWGV", "room_level_color": null, "transactions": [] }, { "id": "G03", "room_name": "G03", "room_id": "3", "floor": "T1", "reservation_id": "", "color": "", "room_level_id": "2", "room_level_name": "DBGV", "room_level_color": null, "transactions": [] }, { "id": "G04", "room_name": "G04", "room_id": "4", "floor": "T1", "reservation_id": "", "color": "", "room_level_id": "2", "room_level_name": "DBGV", "room_level_color": null, "transactions": [] }, { "id": "G05", "room_name": "G05", "room_id": "5", "floor": "T1", "reservation_id": "", "color": "", "room_level_id": "3", "room_level_name": "DBMV", "room_level_color": null, "transactions": [] }, { "id": "G06", "room_name": "G06", "room_id": "6", "floor": "T1", "reservation_id": "", "color": "", "room_level_id": "3", "room_level_name": "DBMV", "room_level_color": null, "transactions": [] }, { "id": "G07", "room_name": "G07", "room_id": "7", "floor": "T1", "reservation_id": "", "color": "", "room_level_id": "4", "room_level_name": "TWMV", "room_level_color": null, "transactions": [] }, { "id": "G08", "room_name": "G08", "room_id": "8", "floor": "T1", "reservation_id": "", "color": "", "room_level_id": "5", "room_level_name": "TWGV", "room_level_color": null, "transactions": [] }, { "id": "G09", "room_name": "G09", "room_id": "9", "floor": "T1", "reservation_id": "", "color": "", "room_level_id": "5", "room_level_name": "TWGV", "room_level_color": null, "transactions": [] }, { "id": "G10", "room_name": "G10", "room_id": "10", "floor": "T1", "reservation_id": "", "color": "", "room_level_id": "2", "room_level_name": "DBGV", "room_level_color": null, "transactions": [] }, { "id": "G11", "room_name": "G11", "room_id": "11", "floor": "T1", "reservation_id": "", "color": "", "room_level_id": "2", "room_level_name": "DBGV", "room_level_color": null, "transactions": [] }, { "id": "G12", "room_name": "G12", "room_id": "12", "floor": "T1", "reservation_id": "", "color": "", "room_level_id": "2", "room_level_name": "DBGV", "room_level_color": null, "transactions": [] }, { "id": "G14", "room_name": "G14", "room_id": "13", "floor": "T1", "reservation_id": "", "color": "", "room_level_id": "2", "room_level_name": "DBGV", "room_level_color": null, "transactions": [] }, { "id": "G15", "room_name": "G15", "room_id": "14", "floor": "T1", "reservation_id": "", "color": "", "room_level_id": "2", "room_level_name": "DBGV", "room_level_color": null, "transactions": [] }, { "id": "G16", "room_name": "G16", "room_id": "15", "floor": "T1", "reservation_id": "", "color": "", "room_level_id": "2", "room_level_name": "DBGV", "room_level_color": null, "transactions": [] }, { "id": "G17", "room_name": "G17", "room_id": "16", "floor": "T1", "reservation_id": "", "color": "", "room_level_id": "2", "room_level_name": "DBGV", "room_level_color": null, "transactions": [] }, { "id": "G20", "room_name": "G20", "room_id": "17", "floor": "T1", "reservation_id": "", "color": "", "room_level_id": "4", "room_level_name": "TWMV", "room_level_color": null, "transactions": [] }, { "id": "G21", "room_name": "G21", "room_id": "18", "floor": "T1", "reservation_id": "", "color": "", "room_level_id": "3", "room_level_name": "DBMV", "room_level_color": null, "transactions": [] }, { "id": "G22", "room_name": "G22", "room_id": "19", "floor": "T1", "reservation_id": "", "color": "", "room_level_id": "3", "room_level_name": "DBMV", "room_level_color": null, "transactions": [] }, { "id": "G23", "room_name": "G23", "room_id": "20", "floor": "T1", "reservation_id": "", "color": "", "room_level_id": "3", "room_level_name": "DBMV", "room_level_color": null, "transactions": [] }, { "id": "G24", "room_name": "G24", "room_id": "21", "floor": "T1", "reservation_id": "", "color": "", "room_level_id": "3", "room_level_name": "DBMV", "room_level_color": null, "transactions": [] }], "room_levels": [{ "id": "2", "name": "Deluxe Double Golf View" }, { "id": "5", "name": "Deluxe Twin Golf View" }, { "id": "4", "name": "Deluxe Twin Mountain View" }, { "id": "3", "name": "Deluxe Double Mountain View" }], "floors": { "T1": 1 }, "thongbao": "" };
    var info = data; //jQuery.parseJSON(data);
    downloadedData = info;
    floors = info.floors;
    /*if (!$("#floors").data("kendoMultiSelect")) {
        $("#floors").html('');
        for (var idx in floors) {

            $('#floors')
                .append($('<option>', { value: idx, selected: "" })
                    .text(idx));

        }
        $("#floors").kendoMultiSelect({
            autoClose: false,
            change: function() {
                //console.log($("#floors").data("kendoMultiSelect").value());
                var values = $("#floors").data("kendoMultiSelect").value();
                for (var idx in floors) {
                    if (values.indexOf(idx) >= 0) {
                        jQuery(".floor[floor*='" + idx + "']").show();
                    } else {
                        jQuery(".floor[floor*='" + idx + "']").hide();
                    }
                }
            }
        });
    } else {
        var values = [];
        for (var idx in floors) {


            values.push(idx);
        }
        $("#floors").data("kendoMultiSelect").value(values);
    }*/
    //jQuery.each(data,function(key,value){
    //    console.log(value); 
    //});  

    if (info.thongbao != '') {
        jQuery("#thongbaohethan").html(info.thongbao);
    } else {
        jQuery("#div_thongbao").css("display", "none");
    }



    function count() {
        var i = 0;
        for (key in info.room_levels) {
            //  console.log(info.room_levels[key].id) ;
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
    // console.log(count())                              

    var room_info = {};

    var i = 0;

    for (key in info.room_levels) {

        var tmp = {};
        tmp.rooms = [];
        //tmp.rooms.name="dungict" ;
        tmp.id = info.room_levels[key].id;
        tmp.name = info.room_levels[key].name;

        list_room[i] = tmp;
        i++;

    }
    for (y in list_room) {
        //console.log(list_room[y].id);

        for (x in info.rooms) {


            var level_id = info.rooms[x].room_level_id;
            var tmp = {};
            if (list_room[y].id == level_id) {
                var k = 't';
                var name = info.rooms[x].room_name;
                var status = info.rooms[x].status;
                //console.log(name) ;

                var id = info.rooms[x].room_id;
                tmp.name = info.rooms[x].room_name;
                tmp.room_level_name = info.rooms[x].room_level_name;
                tmp.id = info.rooms[x].room_id;
                tmp.status = status;
                tmp.floor = info.rooms[x].floor;
                if (info.rooms[x].transactions === "undefined")
                    tmp.transactions = {};
                else {
                    for (xx in info.rooms[x].transactions) {
                        info.rooms[x].transactions[xx].startDate = new Date(info.rooms[x].transactions[xx].startDate);
                        info.rooms[x].transactions[xx].endDate = new Date(info.rooms[x].transactions[xx].endDate);
                    }
                    tmp.transactions = info.rooms[x].transactions;
                }
                list_room[y].rooms.push(tmp);
            }
        }
        //console.log(list_room) ;
    }

    // }).done(function() {


    var justClickedOnTransaction = false;
    var creatingNewRoom = false;
    var new_room_id = -1;
    var new_room_start_date = "";
    var new_room_end_data = "";
    var grid = {
        numberOfDay: 15,
        width: $("#room_view").width(),
        startDate: new Date(),

    };
    grid.roomList = list_room;
    $("#tplRight").width($("#room_view").width() - 144);
    $("#conRight").width($("#room_view").width() - 144);
    $("#boundary").height((window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) - 100);
    prepairGrid();
    // });
}

var justClickedOnTransaction = false;
var creatingNewRoom = false;
var new_room_id = -1;
var new_room_start_date = "";
var new_start_hour = 0;
var new_end_hour = 0;
var new_room_end_data = "";
var grid = {
    numberOfDay: 15,
    width: 983,
    startDate: new Date(), 
};
grid.roomList = list_room;
//console.log(new Date().getTime() - startInspect);
function getColumnWidth() {
    return parseInt(($("#room_view").width() - 144) / grid.numberOfDay);
}

function getStatusColor(transaction) {
    if (show_color) {
        return transaction.color;
    } else {
        var status = transaction.status;
        switch (status) {
            case 'BOOKED':
                //booked
                return "rgba(0, 255, 0, .6)";
            case 'CHECKIN':
                //checkin
                return "#0080ff";
            case 'REPAIR':
                //checkin
                return "#373737";
            case 3:
                //Due out
                return "rgba(200, 0, 0, .7)";
            case 'CHECKOUT':
                //check out
                return "rgba(0, 0, 255, .6)";
            default:
                return "rgba(255, 255, 255, .6)";
                break;
        }
    }
}

function calculateFreeRooms() {
    //var ret = {};
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
        for (rt in grid.roomList) {
            var availableRoom = 0;
            var repairRoom = 0;
            for (r in grid.roomList[rt].rooms) {
                for (t in grid.roomList[rt].rooms[r].transactions) {
                    sDate = grid.roomList[rt].rooms[r].transactions[t].startDate;
                    eDate = grid.roomList[rt].rooms[r].transactions[t].endDate;
                    if ((currentDay.addDays(1) > sDate && currentDay < eDate) && grid.roomList[rt].rooms[r].transactions[t].status == "REPAIR")
                        repairRoom++;
                }
                total++;
                if (grid.roomList[rt].rooms[r].transactions.length == 0) {
                    availableRoom++;
                } else {
                    var Ok = true;
                    for (t in grid.roomList[rt].rooms[r].transactions) {
                        sDate = grid.roomList[rt].rooms[r].transactions[t].startDate;
                        eDate = grid.roomList[rt].rooms[r].transactions[t].endDate;
                        //console.log("test",(currentDay.addDays(1)>sDate && currentDay.addDays(1)<eDate ),currentDay,grid.roomList[rt].rooms[r].transactions[t]);
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
        //console.log("----->",i,total,totalAvail,totalRepair);
        $("#olusedroom").append("<li class='mli' style='width:" + (getColumnWidth() - 1) + "px;border-right:1px solid #cccccc !important;'>" + (total - totalAvail) + "</li>");
        $("#olroomusage").append("<li class='mli' style='width:" + (getColumnWidth() - 1) + "px;border-right:1px solid #cccccc !important;'>" + Math.round(((total - totalAvail) / (total - totalRepair)) * 1000) / 10 + "</li>");
        $("#olroomavailable").append("<li class='mli' style='width:" + (getColumnWidth() - 1) + "px;border-right:1px solid #cccccc !important;'>" + (totalAvail - totalRepair) + "</li>");
    }
}

function isDropAble(e) {
    //console.log(e.draggable.element.attr("rrid"));
    var rrid = e.draggable.element.attr("rrid");
    var old_room_id = e.draggable.element.attr("room_id");
    var startDate = new Date(e.draggable.element.attr("startdate"));
    var endDate = new Date(e.draggable.element.attr("enddate"));
    var new_room_id = e.dropTarget.attr("id").substr(3);
    //console.log("new",new_room_id);
    if (new_room_id == old_room_id) return false;
    for (var idx in grid.roomList) {
        for (var idx2 in grid.roomList[idx].rooms) {
            if (grid.roomList[idx].rooms[idx2].id == new_room_id) {
                for (var t in grid.roomList[idx].rooms[idx2].transactions) {
                    var trans = grid.roomList[idx].rooms[idx2].transactions[t];
                    //console.log(trans, startDate, endDate);
                    if (trans.startDate <= endDate && trans.endDate >= startDate) {
                        //console.log(trans);
                        return false;
                    }
                    //if (trans.id != rrid && )
                }
                //
                if (e.draggable.element.attr("status") == "BOOKED") {
                    if (confirm("do_you_really_want_to_move_this_reservation")) {

                        for (var idx3 in grid.roomList) {
                            for (var idx4 in grid.roomList[idx3].rooms) {

                                if (grid.roomList[idx3].rooms[idx4].id == old_room_id) {
                                    for (var t in grid.roomList[idx3].rooms[idx4].transactions) {
                                        if (grid.roomList[idx3].rooms[idx4].transactions[t].id == rrid) {

                                            var new_trans = jQuery.extend({}, grid.roomList[idx3].rooms[idx4].transactions[t]);
                                            delete grid.roomList[idx3].rooms[idx4].transactions[t];
                                            grid.roomList[idx].rooms[idx2].transactions[t] = new_trans;
                                            //update room_id
                                            e.draggable.element.attr("room_id", new_room_id);
                                            jQuery.getJSON("/reservation_group.php?move_room=1&rrid=" + rrid + "&new_room_id=" + new_room_id

                                            );
                                            //console.log(e.draggable.element);
                                            return true;
                                        }
                                    }
                                }

                            }
                        }
                    } else {

                        return false;
                    }
                } else {
                    //go to change room
                    //window.location.href="?page=change_room&oldid=" + rrid + "&newid=" + new_room_id;
                    jQuery("#r_r_id").val(rrid);
                    jQuery("#new_id").val(new_room_id);
                    jQuery("#out").bPopup();
                }

            }
        }
    }
    return true;
}

function onDragEnd(e) {
    //console.log(e);
    //jQuery(e.currentTarget[0]).hide();
}

function onDropTarget(e) {
    //console.log("Dropped",e);
    if (isDropAble(e)) {
        e.draggable.element.detach();
        e.dropTarget.append(e.draggable.element);
    }
    /*e.draggable.destroy(); //detach events
    e.draggable.element.css("opacity", 0.3); //change opacity*/
}

function prepairGrid() {
    //set startDate
    if (!grid.numberOfDay)
        grid.numberOfDay = 15;
    $("#startDate").val(grid.startDate.format("dd/mm/yyyy"));
    //Populate date
    var gStartDate = new Date(grid.startDate.format("yyyy/mm/dd"));

    var tmpDate = new Date();
    $("#datetable").empty();
    $("#tplLeft").empty();
    $("#conRight").empty();
    if (grid.numberOfDay > 1) {
        for (var i = 0; i < grid.numberOfDay; i++) {
            $("#datetable").append(createDateItem(i, gStartDate.addDays(i)));

        }
    } else {
        for (var i = 0; i < 24; i++) {
            $("#datetable").append(createDateItem2(i, gStartDate));

        }
    }
    var checkhover = 1;
    //Populate data
    var rooooom = {};
    for (roomType in grid.roomList) {
        for (room in grid.roomList[roomType].rooms) {
            var r = grid.roomList[roomType].rooms[room];
            rooooom[r.name] = grid.roomList[roomType].rooms[room];
        }
    }

    //rooooom.sort();
    //for(roomType in grid.roomList) {
    //
    //$("#tplLeft").append(createLeftColHeader(grid.roomList[roomType].name));
    //$("#conRight").append(createRightColHeader(grid.roomList[roomType]));
    //for(room in grid.roomList[roomType].rooms) {
    var tmpr = [];
    for (room in rooooom) {
        tmpr.push(room);
    }
    tmpr.sort();

    for (ii = 0; ii < tmpr.length; ii++) {

        //$("#tplLeft").append(createLeftCol(grid.roomList[roomType].rooms[room]));
        //$("#conRight").append(createRightColDetails(grid.roomList[roomType].rooms[room]));
        $("#tplLeft").append(createLeftCol(rooooom[tmpr[ii]]));
        $("#conRight").append(createRightColDetails(rooooom[tmpr[ii]]));
        //var r = grid.roomList[roomType].rooms[room];
        var r = rooooom[tmpr[ii]];
        if (r.transactions) {
            //console.log(r);
            for (t in r.transactions) {
                //Binding events to transactions
                $("#_CONFRESERV_" + t).kendoDraggable({
                    hint: function() {
                        //console.log(this);
                        //console.log($(this.currentTarget[0]).attr("status"));
                        if ($(this.currentTarget[0]).attr("status") != 'CHECKOUT' && $(this.currentTarget[0]).attr("status") != 'REPAIR') {
                            return $(this.currentTarget[0]).clone();
                        }
                    },
                    dragend: onDragEnd
                });
                $("#_CONFRESERV_" + t).bind("touchstart", function(event) {
                        event.preventDefault();
                        var newroom = $("#new-room");
                        if (newroom.length != 0) {
                            newroom.remove();
                        }
                        justClickedOnTransaction = true;
                        $(this).bind("touchend", function(e) {
                            //
                            e.preventDefault();

                            $(this).unbind("touchend");
                            $(this).enableContextMenu();

                            justClickedOnTransaction = false;
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
                        justClickedOnTransaction = true;
                    }).hover(function() {
                        // alert(checkhover+"---"+this.id);
                        if (checkhover != this.id && checkhover != 1) {
                            $("#myMenu").hide();
                            checkhover = this.id;
                        } else {
                            checkhover = this.id;
                        }
                        $("#myMenu2").hide();
                        // console.warn("Hover", this.id);
                        // console.log(jQuery("#"+this.id).attr("status"));
                        // remove new room
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
                        //show transaction information here
                    })
                    .contextMenu({
                        menu: 'myMenu'
                    }, function(action, el, pos) {

                        // alert(el.attr("status"));
                        switch (action) {
                            case 'edit':
                                if (el.attr("rrid") != 'undefined') {
                                    //window.open("?page=reservation&cmd=edit&id="+el.attr("reservation")+"&r_r_id="+el.attr("rrid")+"");
                                    popup_room("?page=reservation&group=1&room_status=1&cmd=edit&id=" + el.attr("reservation") + "&r_r_id=" + el.attr("rrid") + "");
                                } else {

                                    window.open("?page=reservation&cmd=edit&id=" + el.attr("reservation") + "");
                                }

                                break;
                            case 'edit_group':
                                if (el.attr("isgroup") == '1') {
                                    if (el.attr("rrid") != 'undefined') {
                                        //window.open("?page=reservation&cmd=edit&id="+el.attr("reservation")+"&r_r_id="+el.attr("rrid")+"");
                                        popup_room("?page=reservation&group=1&room_status=1&cmd=edit_group&id=" + el.attr("reservation") + "&r_r_id=" + el.attr("rrid") + "");
                                    }
                                } else {

                                    window.open("?page=reservation&cmd=edit&id=" + el.attr("reservation") + "");
                                }

                                break;
                            case 'view_invoice':
                                if (el.attr("rrid") != 'undefined') {
                                    //window.open("?page=reservation&cmd=edit&id="+el.attr("reservation")+"&r_r_id="+el.attr("rrid")+"");
                                    window.open("?page=reservation&&room_invoice=1&hk_invoice=1&bar_invoice=1&other_invoice=1&phone_invoice=1&extra_service_invoice=1&massage_invoice=1&included_related_total=1&total_amount=&price=" + el.attr("price") + "&included_deposit=on&reduce_balance=" + el.attr("reduce_balance") + "&reduce_amount=" + el.attr("reduce_amount") + "&tax_rate=" + el.attr("tax_rate") + "&service_rate=" + el.attr("service_rate") + "&id=" + el.attr("rrid") + "&cmd=invoice" + "");
                                } else {

                                    window.open("?page=reservation&cmd=edit&id=" + el.attr("reservation") + "");
                                }

                                break;
                            case 'view_invoice_group':
                                if (el.attr("isgroup") == '1') {
                                    if (el.attr("rrid") != 'undefined') {
                                        //window.open("?page=reservation&cmd=edit&id="+el.attr("reservation")+"&r_r_id="+el.attr("rrid")+"");
                                        window.open("?page=reservation&cmd=group_invoice&id=" + el.attr("reservation") + "&f7531e2d0ea27233ce00b5f01c5bf335=cfcd208495d565ef66e7dff9f98764da&room_invoice=1&included_deposit=1");
                                    }
                                } else {
                                    alert(el.attr("isgroup"))
                                        //window.open("?page=reservation&cmd=edit&id="+el.attr("reservation")+"");
                                }

                                break;
                            case 'cut':
                                window.open("?page=reservation&cmd=add&reservation_type_id=2&time_in=12:00&time_out=12:00&rooms=" + new_room_id + ",04/05/2014,04/05/2014&start=" + new_room_start_date + "&end=" + new_room_end_date + '&status=CHECKIN');
                                break;
                            case 'unRepair':
                                // alert(el.attr("startDate").getDate());
                                popup_room("?page=repair_create&hide=1&room_id=" + el.attr("room_id") + "&start_date=" + convertdate(el.attr("startDate")) + "&end_date=" + convertdate(el.attr("endDate")) + "&status=UNREPAIR");
                                break;
                            case 'editRepair':
                                // alert(el.attr("startDate").getDate());
                                popup_room("?page=repair_create&hide=1&room_id=" + el.attr("room_id") + "&start_date=" + convertdate(el.attr("startDate")) + "&end_date=" + convertdate(el.attr("endDate")) + "&status=REPAIR&edit=1");
                                break;
                        }
                    });
            }
        }
    }
    //}
    //console.log(rooooom);
    calculateFreeRooms();
    // $(".roomday").kendoDropTarget({
    //     drop: onDropTarget
    // });
    $("#tplRight").width($("#room_view").width() - 144);
    $("#conRight").width($("#room_view").width() - 144);

    var heightch = jQuery("#ribbon").css("height");
    if (heightch == "120px") {
        heightch = "25px";
        //jQuery.cookie("hide_menu",1);
    } else {
        heightch = "120px";
        //jQuery.cookie("hide_menu",0);
    }
    if (heightch == '25px') {
        $("#boundary").height((window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) - 50);
    } else if (heightch == "120px") {
        $("#boundary").height((window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) - 120);
    }
    if (chclick == 0) {
        $("#boundary").height((window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) - 120);
    }
}

function convertdate(str) {
    var date = new Date(str),
        mnth = ("0" + (date.getMonth() + 1)).slice(-2),
        day = ("0" + date.getDate()).slice(-2);
    return [day, mnth, date.getFullYear()].join("/");
}

function joinTransactions() {
    for (roomType in grid.roomList) {
        //
        for (room in grid.roomList[roomType].rooms) {
            var r = grid.roomList[roomType].rooms[room];
            if (r.transactions) {
                for (t in r.transactions) {
                    //console.log(t);
                    if (t.lastIndexOf("_") > 1) {
                        //has a child
                        var pos_value = t.substr(t.lastIndexOf("_") + 1);
                        var next_value = parseInt(pos_value) + 1;
                        var child_name = "#_CONFRESERV_t_" + r.transactions[t].id;
                        if ($("#_CONFRESERV_t_" + r.transactions[t].id + "_" + next_value).length) {
                            child_name = "#_CONFRESERV_t_" + r.transactions[t].id + "_" + next_value;
                        }
                        //draw line;
                        var source = $("#_CONFRESERV_" + t).offset();
                        source.left += $("#_CONFRESERV_" + t).width();

                        var dest = $(child_name).offset();
                        if (source.top > dest.top) {
                            var tmp = source;
                            source = dest;
                            dest = tmp;
                        }
                        //var top = $("#tplRight").position().top;
                        str = "<div style='z-index:1000;background-color:black;position:absolute;top:" + source.top + "px;left:" + source.left + "px;width:2px;height:" + (dest.top - source.top) + "px'></div>";
                        $("#tplRight").append(str);


                    }
                }
            }
        }
    }


}

function showJQloading(id) {
    $(id).showLoading();
}

function hideJQloading(id) {
    $(id).delay(600).queue(function() {
        $(this).hideLoading();
        $(this).dequeue();
    });
}
var parameter = 15;
var d = new Date();
var year = d.getFullYear();
var month = d.getMonth() + 1;
var day = d.getDate();


//$(function() {
var show_color;
var chclick = 0;
$(document).ready(function() {
    jQuery("#menuToggle").click(function() {
        chclick = 1;
        prepairGrid();
    });
    //console.log(new Date().getTime());
    // var floorctl = $("#floors").kendoMultiSelect().data("kendoMultiSelect");
    $("#close").button({
        text: false,
        icons: {
            primary: "ui-icon-close"
        }
    });
    load_data(day, month, year, parameter);
    show_color = $.cookie("show_reservation_color");
    if (show_color) {
        $("#show_reservation_color").prop('checked', true);
    }
    $("#show_reservation_color").click(function() {
        if ($(this).is(":checked")) {
            show_color = true;
            $.cookie("show_reservation_color", 1);
        } else {
            show_color = null;
            $.removeCookie("show_reservation_color");
        }

        prepairGrid();
    });
    $("#startDate").datepicker({
        dateFormat: 'dd/mm/yy'
    });
    grid.width = $("#room_view").width();
    $(window).resize(function() {
        grid.width = $("#room_view").width();
        $("#tplRight").width($("#room_view").width() - 144);
        $("#conRight").width($("#room_view").width() - 144);
        $("#boundary").height((window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) - 100);
        prepairGrid();
    });
    $("#tplRight").width($("#room_view").width() - 144);
    $("#conRight").width($("#room_view").width() - 144);
    $("#boundary").height((window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) - 100);
    var nod = $.cookie("grid_default_day");
    if (!nod)
        nod = 15;
    if (!nod)
        nod = 15;
    grid.numberOfDay = nod;
    $(".daychange").removeClass("activeview");
    $("#other_days").val(grid.numberOfDay);
    $(".daychange").each(function() {
        if ($(this).attr("title") == grid.numberOfDay) {
            $(this).addClass("activeview");
        }
    });
    prepairGrid();
    //onready
    //binding other events
    $("#conRight").bind("mousemove touchmove", function(event) {
        if (justClickedOnTransaction)
            return;
        event.preventDefault();
        var touch = event;
        var isTouchSupported = 'ontouchstart' in window;
        if (isTouchSupported)
            touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];

        //get corresponding date
        if (grid.numberOfDay > 1) {
            var dayPos = Math.floor((touch.pageX - $("#conRight").offset().left) / getColumnWidth());

            $(".lidate").removeClass("rowhover");
            $("#t_" + dayPos).addClass("rowhover");
        } else {
            var dayPos = Math.floor((touch.pageX - $("#conRight").offset().left) * 24 / getColumnWidth());
            $(".lidate").removeClass("rowhover");
            $("#t_" + dayPos).addClass("rowhover");
        }
        var elemPos = mousePosToElements(event);
        if (creatingNewRoom) {
            var new_room = $("#new-room");
            if (new_room.length != 0) {
                var rW = touch.pageX - new_room.offset().left;
                if (rW > 10) {
                    var date_elem = $("#t_" + dayPos);
                    new_room_end_date = date_elem.attr("data");
                    if (grid.numberOfDay == 1) {
                        new_room_end_date = new_room_start_date;
                        new_end_hour = Math.floor((touch.pageX - $("#conRight").offset().left) * 24 / getColumnWidth());
                    }
                    new_room.width(rW);
                } else {
                    new_room_end_date = new_room_start_date;
                    if (grid.numberOfDay == 1) {
                        new_end_hour = new_start_hour + 1;
                    }
                }
            }
        }

    });
    var tmpevent = '';
    $("#conRight").bind("mousedown touchstart", function(event) {
        tmpevent = event;
        justClickedOnTransaction = false;
        if (justClickedOnTransaction) return;
        //get corresponding date
        event.preventDefault();
        try {
            var touch = event;
            var isTouchSupported = 'ontouchstart' in window;
            if (isTouchSupported)
                touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
            var dayPos = Math.floor((touch.pageX - $("#conRight").offset().left) / getColumnWidth());
            var elemPos = mousePosToElements(event);

            console.warn(dayPos, elemPos);
            var newroom = $("#new-room");
            if (newroom.length != 0) {
                newroom.remove();
            }
            var room_row_id = elemPos.roomElemId.replace("st_", "rm_");
            var room_row = $("#" + room_row_id);

            var date_elem = $("#t_" + dayPos);
            new_room_start_date = date_elem.attr("data");
            if (grid.numberOfDay == 1) {
                new_room_start_date = $("#startDate").val();
                new_start_hour = Math.floor((touch.pageX - $("#conRight").offset().left) * 24 / getColumnWidth());
            }
            new_room_id = elemPos.roomElemId.replace("st_", "");

            var elem = '<div class="tran_cells gradius" id="new-room"  style="background-color: green; left: ' + (touch.pageX - room_row.offset().left - 10) + 'px; width: ' + 20 + 'px; z-index: 55; display: block; background-position: initial initial; background-repeat: initial initial;"></div>';
            room_row.append(elem);
            creatingNewRoom = true;
            console.warn($("#" + room_row_id));
        } catch (err) {

        }
    });
    // event mouseup create new reservation
    $("#conRight")

    .contextMenu({
        // if( event.which == 3 ){
        // justClickedOnTransaction = true;
        // event.preventDefault();
        // $(this).unbind("touchend");
        // $(this).enableContextMenu();
        // $("#conRight").contextMenu({   
        menu: 'myMenu2'
    }, function(action, el, pos) {
        // jQuery(this).bind("mouseup touchend",function(event) {

        var newroom = $("#new-room");
        if (newroom.length != 0) {
            newroom.remove();
        }
        if (justClickedOnTransaction) {
            // console.log("unbind");
            justClickedOnTransaction = false;
            return;
        }
        // tmpevent.preventDefault(); 
        event = tmpevent;
        if (creatingNewRoom) {
            var touch = event;
            var isTouchSupported = 'ontouchstart' in window;
            if (isTouchSupported)
                touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];

            //get corresponding date
            var dayPos = Math.floor((touch.pageX - $("#conRight").offset().left) / getColumnWidth());
            var new_room = $("#new-room");
            if (new_room.length != 0) {
                var rW = touch.pageX - new_room.offset().left;
                if (rW > 10) {
                    var date_elem = $("#t_" + dayPos);
                    new_room_end_date = date_elem.attr("data");
                    if (grid.numberOfDay == 1) {
                        new_room_end_date = new_room_start_date;
                        new_end_hour = Math.floor((touch.pageX - $("#conRight").offset().left) * 24 / getColumnWidth());
                    }
                    new_room.width(rW);
                } else {
                    new_room_end_date = new_room_start_date;
                    if (grid.numberOfDay == 1) {
                        new_end_hour = new_start_hour + 1;
                    }
                }
            }
        }
        switch (action) {
            case 'REPAIR_ROOM':
                popup_room("?page=repair_create&hide=1&room_id=" + new_room_id + "&start_date=" + new_room_start_date + "&end_date=" + new_room_end_date + "&status=REPAIR");
                break;
            case 'create_booking':

                // }else{



                //get corresponding date
                creatingNewRoom = false;
                //Calculate current date
                //alert("creating new room from " + new_room_start_date + " to " + new_room_end_date + " for room id: " + new_room_id);
                //new_room_start_date=new_room_start_date.replace('-','/');
                //rooms=32,04/05/2014,04/05/2014
                // alert(new_room_id);
                $("#myMenu").hide();
                if (grid.numberOfDay > 1)
                    popup_room("?page=reservation&cmd=add&room_status=1&group=1&reservation_type_id=2&time_in=12:00&time_out=12:00&rooms=" + new_room_id + ",04/05/2014,04/05/2014&start=" + new_room_start_date + "&end=" + new_room_end_date + '&status=CHECKIN#' + Math.random());
                else {
                    var str_start_hour = "" + new_start_hour;
                    var str_end_hour = "" + new_end_hour;
                    if (str_start_hour.length < 2)
                        str_start_hour = "0" + str_start_hour;
                    if (str_end_hour.length < 2)
                        str_end_hour = "0" + str_end_hour;

                    popup_room("?page=reservation&cmd=add&room_status=1&group=1&reservation_type_id=2&time_in=" + str_start_hour + ":00&time_out=" + str_end_hour + ":00&rooms=" + new_room_id + ",04/05/2014,04/05/2014&start=" + new_room_start_date + "&end=" + new_room_end_date + '&status=CHECKIN#' + Math.random());
                }
                //window.open("?page=reservation&cmd=add&reservation_type_id=2&time_in=12:00&time_out=12:00&rooms=" + new_room_id + ",04/05/2014,04/05/2014&start=" + new_room_start_date + "&end=" + new_room_end_date+'&status=CHECKIN');
                $("#new-room").remove();

                break;
        }
        // });
    });
    // });

    $("#pre").click(function() {
        grid.startDate = grid.startDate.addDays(-parseInt(grid.numberOfDay));
        showJQloading("#room_view");
        //load new data
        //console.log(grid.startDate);
        //load_data(month,year);
        load_data(grid.startDate.getUTCDate(), grid.startDate.getUTCMonth() + 1, grid.startDate.getFullYear(), parameter);
        //reload Grid
        hideJQloading("#room_view");
        prepairGrid();

    });
    $("#next").click(function() {
        grid.startDate = grid.startDate.addDays(parseInt(grid.numberOfDay));
        showJQloading("#room_view");
        //load new data
        load_data(grid.startDate.getUTCDate(), grid.startDate.getUTCMonth() + 1, grid.startDate.getFullYear(), parameter);
        //reload Grid
        hideJQloading("#room_view");
        prepairGrid();

    });
    $(".daychange").click(function() {
        $(".daychange").removeClass("activeview");
        $(this).addClass("activeview");
        $("#other_days").val(this.id);
        grid.numberOfDay = parseInt(this.id);
        $.cookie("grid_default_day", grid.numberOfDay);
        showJQloading("#room_view");
        //load new data
        //reload Grid
        parameter = jQuery(this).attr("id");
        load_data(grid.startDate.getUTCDate(), grid.startDate.getUTCMonth() + 1, grid.startDate.getFullYear(), parameter);
        hideJQloading("#room_view");
        // prepairGrid();
    });
    $("#other_days").keypress(function(e) {
        if (e.which == 13) {
            $(".daychange").removeClass("activeview");
            grid.numberOfDay = parseInt($(this).val());
            $.cookie("grid_default_day", grid.numberOfDay);
            showJQloading("#room_view");
            //load new data
            //reload Grid
            parameter = jQuery(this).attr("id");
            load_data(grid.startDate.getUTCDate(), grid.startDate.getUTCMonth() + 1, grid.startDate.getFullYear(), parameter);
            hideJQloading("#room_view");
            prepairGrid();
        }
    });
    /*$("#startDated").change(function() {
        var data = jQuery(this).val();
        data = data.split('-');
        grid.startDate = grid.startDate.addDays(data[2]);
        //grid.startDate = grid.startDate.addDays(grid.numberOfDay);
        showJQloading("#room_view");
        //load new data
        
         
        load_data(data[2],data[1],data[0],parameter);
        //load_data(data[2],data[1],data[0],parameter);
        //reload Grid
        hideJQloading("#room_view");
        prepairGrid();
    });*/
});







function mousePosToElements(event) {
    var elems = new Object();
    var touch = event;
    var isTouchSupported = 'ontouchstart' in window;
    if (isTouchSupported)
        touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
    var dayPos = Math.floor((touch.pageX - $("#conRight").offset().left) / getColumnWidth());
    elems.dayPos = dayPos;
    $(".sidetitle").each(function() {
        if (touch.pageY >= $(this).offset().top && touch.pageY < $(this).offset().top + $(this).height()) {
            //
            $(this).addClass("rowhover");
            elems.roomElemId = this.id;

        } else {
            $(this).removeClass("rowhover");
        }
    });
    return elems;
}

function dateToPosition(startDate, endDate) {
    var pos = new Object();
    var idx = 0.0;
    idx = startDate.getHours() / 24;
    /*if (startDate.getHours()>=6) {
        idx = 0.5;
    }*/

    var gStartDate = new Date(grid.startDate.format("yyyy/mm/dd"));
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

    var dateDiff = daysBetween(startDate, endDate);
    if (dateFromStart.days < 0)
        dateDiff = daysBetween(gStartDate, EndDate);
    if (dateDiff.days == 0 && gStartDate.getDate() == endDate.getDate() && idx >= 0) {
        //pos.width = getColumnWidth()/2;
        pos.width = (endDate.getHours()) * getColumnWidth() / 24 - idx * getColumnWidth();
    } else {
        if (dateFromStart.days < 0) {
            pos.width = getColumnWidth() * (dateDiff.days + idx);
        } else
            pos.width = getColumnWidth() * (dateDiff.days + dateDiff.hours / 24);

    }
    if (idx < 0) idx = -.1;
    pos.left = getColumnWidth() * idx;
    if (pos.width < 30)
        pos.width = 30;
    //console.warn(pos);
    return pos;
}

function createRightColHeader(roomType) {
    var tmp = '<ol class="roomtype_unc" id="rt_' + roomType.id + '">';
    for (var i = 0; i < grid.numberOfDay; i++) {
        if (i % 2 == 0)
            tmp += '<li rel="0" id="rt_' + roomType.id + '_' + i + '" class="totalbooking_a" style="width:' + getColumnWidth() + 'px">0</li>';
        else
            tmp += '<li rel="0" id="rt_' + roomType.id + '_' + i + '" class="totalbooking_b" style="width:' + getColumnWidth() + 'px">0</li>';
    }
    tmp += '</ol>';
    return tmp;
}

function createRightColDetails(room) {
    var tmp = '<div id="rm_' + room.id + '" class="roomday r1 floor" floor="' + room.floor + '"><ol class="ui-selectable2">';
    for (var i = 0; i < grid.numberOfDay * 2; i++) {
        if (i % 2 == 0) {
            tmp += '<li class="null ui-state-default2 _b 2014_03_18" style="width:' + getColumnWidth() / 2 + 'px" id="0_' + room.id + '_b" rel="1" title=""></li>';
        } else {
            tmp += '<li class="null ui-state-default2  _a" style="width:' + ((getColumnWidth() - getColumnWidth() / 2) - 1) + 'px;border-right: 1px solid gainsboro !important;" id="="0_' + room.id + '_a" rel="1" title=""></li>';
        }
    }
    tmp += '</ol>';
    if (room.transactions) {
        for (var t in room.transactions) {
            var pos = dateToPosition(room.transactions[t].startDate, room.transactions[t].endDate);
            if (pos.width > 0) {
                var transaction_note = "";
                if (room.transactions[t].reservation_note)
                    transaction_note = room.transactions[t].reservation_note.replace(/\n/g, "<br/>") + "<br/><hr />";
                if (room.transactions[t].reservation_room_note)
                    transaction_note += room.transactions[t].reservation_room_note.replace(/\n/g, "<br/>") + "<br/>";
                tmp += '<div data-html="true" data-toggle="tooltip" class="tran_cells gradius" status="' + room.transactions[t].status + '" price="' + room.transactions[t].price + '" room_id="' + room.id + '" reduce_balance="' + room.transactions[t].reduce_balance + '" status="' + room.transactions[t].status + '" reduce_amount="' + room.transactions[t].reduce_amount + '" endDate="' + room.transactions[t].endDate + '" startDate="' + room.transactions[t].startDate + '" tax_rate="' + room.transactions[t].tax_rate + '" service_rate="' + room.transactions[t].service_rate + '" isgroup="' + room.transactions[t].isgroup + '" rrid="' + room.transactions[t].reservation_room_id + '" reservation="' + room.transactions[t].reservation_id + '" id="_CONFRESERV_' + t + '" title="' + room.transactions[t].name + ' ' + transaction_note + '" style="background-color: ' + getStatusColor(room.transactions[t]) + '; left: ' + pos.left + 'px; width: ' + pos.width + 'px; z-index: 55; display: block; background-position: initial initial; background-repeat: initial initial;"><div class="g_name newrightmenu" id="CONFRESERV,' + room.transactions[t].id + '" style="width:' + ((pos.width - 15) > 0 ? (pos.width - 15) : 0) + 'px;">' + room.transactions[t].name + '</div><span class="pttp" title="More Information"><span class="ttp"></span></span></div>';

            }
        }
    }
    tmp += '</div>';
    return tmp;
}

function createLeftColHeader(roomType) {
    return "<span class='roomtype'>" + roomType + "</span>";
}

function createLeftCol(room) {
    return '<span class="wrap_container floor" floor="' + room.floor + '"><span class="sidetitle t1" id="st_' + room.id + '"><span style="text-align: left">&nbsp;&nbsp;&nbsp;' + room.name + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ' + room.room_level_name + '' + '</span></span></span>';
}

function createDateItem(i, date) {
    var sunday = "";
    if (date.getDay() == 0)
        sunday = " sunday";
    if (i % 2 == 0)
        return '<li style="width:' + getColumnWidth() + 'px;" class="lidate' + sunday + ' title_a" id="t_' + i + '" data="' + date.format('dd/mm/yyyy') + '"><span class="bdate">' + date.format("dd") + '</span><span class="bday">' + date.format("mm") + '</span><span class="bday">' + date.format("ddd") + '</span><span class="descholi" style="display:none;"></span></li>';
    else
        return '<li style="width:' + getColumnWidth() + 'px;" class="lidate' + sunday + ' title_b" id="t_' + i + '" data="' + date.format('dd/mm/yyyy') + '"><span class="bdate">' + date.format("dd") + '</span><span class="bday">' + date.format("mm") + '</span><span class="bday">' + date.format("ddd") + '</span><span class="descholi" style="display:none;"></span></li>';

}

function createDateItem2(i, date) {
    var sunday = "";
    var dd = i + "";
    if (dd.length == 1)
        dd = "0" + dd;
    dd += "h";
    if (i % 2 == 0)
        return '<li style="width:' + getColumnWidth() / 24 + 'px;" class="lidate' + sunday + ' title_a" id="t_' + i + '" data="' + date.format('dd/mm/yyyy') + '"><span class="bdate">&nbsp;</span><span class="bday">' + dd + '</span><span class="bday"></span><span class="descholi" style="display:none;"></span></li>';
    else
        return '<li style="width:' + getColumnWidth() / 24 + 'px;" class="lidate' + sunday + ' title_b" id="t_' + i + '" data="' + date.format('dd/mm/yyyy') + '"><span class="bdate">&nbsp;</span><span class="bday">' + dd + '</span><span class="bday"></span><span class="descholi" style="display:none;"></span></li>';

}


function popup_room(url) {
    addTab(url);
    jQuery('#popup_room').bPopup({
        fadeSpeed: 'slow', //can be a string ('slow'/'fast') or int
        followSpeed: 1500, //can be a string ('slow'/'fast') or int
        modalClose: false,
        modalColor: '#000000',
        opacity: 0.7
    });
    jQuery('button#close').bind('click', function() {
        jQuery('#popup_room').bPopup().close();
    });
}

function hide_popup() {
    jQuery('#popup_room').bPopup().close();
}


function addTab(url) {
    tabContentHtml = "<iframe style='width: 100%;height: 100%;' src='" + url + "'></iframe>";
    tabs = jQuery("#popup_room");
    tabs.html('');
    tabs.append(tabContentHtml)
}
