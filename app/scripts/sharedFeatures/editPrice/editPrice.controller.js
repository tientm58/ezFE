ezCloud.controller('EditPriceController', ['$rootScope', '$mdDialog', '$filter', '$state', 'dialogService', 'loginFactory', 'EditPriceService', 'SharedFeaturesFactory',
function($rootScope, $mdDialog, $filter, $state, dialogService, loginFactory, EditPriceService, SharedFeaturesFactory) {
    var nq = this;
    //Nguyen Ngoc Quan - nq
    function Init() {
        nq.currentRoom  = SharedFeaturesFactory.getFeatureModel();
        var priceTemp   = nq.currentRoom.priceTemp;
        var totalPrice  = nq.currentRoom.totalPrice;
        var roomCharges = nq.currentRoom.roomCharges; 
        var planInfo    = nq.currentRoom.planInfo;
        var priceList   = nq.currentRoom.priceList;

        nq.isRoomChargeChanged = false;
        nq.planInfo = planInfo;
        nq.newTotalPrice = 0;
        nq.newTotalPriceTemp = 0;
        nq.priceList = priceList.actualPlanListDateRange;
        if (nq.priceList != null) {
            if (nq.priceList.planListConstantlyFormula != null && nq.priceList.planListConstantlyFormula.length > 0) {
                nq.newTotalPriceTemp = nq.priceList.planListConstantlyFormula[nq.priceList.planListConstantlyFormula.length - 1].ValueAfter;
            }
        }
        
        nq.currentTotalPrice = angular.copy(totalPrice);
        
        nq.decimal = $rootScope.decimals;
        if ((nq.planInfo.UseHourlyPrice == true || nq.planInfo.UseDayNightPrice == true)) {
            $rootScope.newPrice = priceTemp;
        } else {
            $rootScope.newPrice = 0;
        }

        $rootScope.applyChangeMethod = "0";
        $rootScope.quickChangePrice = 0;
        nq.roomCharges = roomCharges;
        nq.ReservationRoomId = nq.roomCharges[0].ReservationRoomId;

        var days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        nq.events = [];
        for (var index in nq.roomCharges) {
            var roomCharge = nq.roomCharges[index];
            if (roomCharge.StartDate) {
                roomCharge.StartDate = new Date(roomCharge.StartDate);
            }
            if (roomCharge.EndDate) {
                roomCharge.EndDate = new Date(roomCharge.EndDate);
            }
            var event = {};
            if (roomCharge.StartDate.getDay() == 0 || roomCharge.StartDate.getDay() == 6) {
                event.badgeClass = 'warning';
            } else {
                event.badgeClass = 'info';
            }
            event.title = roomCharge.StartDate;
            event.badgeContent = days[roomCharge.StartDate.getDay()];
            event.content = roomCharge.Amount;
            event.RoomCharge = roomCharge;

            if (nq.priceList != null && nq.priceList.planListConstantlyFormula != null && nq.priceList.planListConstantlyFormula.length > 0) {
                for (var index in nq.priceList.planListConstantlyFormula) {
                    var temp = nq.priceList.planListConstantlyFormula[index];
                    console.log("TEMP", temp);
                    if (temp.Range != null && temp.Range.Start) {
                        temp.Range.Start = new Date(temp.Range.Start);
                    }
                    if (temp.Range != null && temp.Range.End) {
                        temp.Range.End = new Date(temp.Range.End);
                    }
                    if (temp.Range.Start.getTime() <= roomCharge.StartDate.getTime() && roomCharge.StartDate.getTime() < temp.Range.End.getTime()) {
                        event.CalculatedInConstantly = true;
                        event.CalculatedConstantlyName = temp.Name;
                    }
                }
            }
            nq.events.push(event);
        }
        console.log("EVENTS", nq.events);
        nq.originalEvents = angular.copy(nq.events);

    }
    Init();
    nq.filterValue = function ($event) {
        if (isNaN(String.fromCharCode($event.keyCode))) {
            $event.preventDefault();
        }
    };

    nq.openMenu = function ($mdOpenMenu, ev, event) {
        $rootScope.newPrice = event.content;
        $mdOpenMenu(ev);
    };

    nq.openQuickChangePriceMenu = function ($mdOpenMenu, ev) {
        $mdOpenMenu(ev);
    };

    nq.saveQuickChangePrice = function () {
        switch ($rootScope.applyChangeMethod) {
            case "0":
                for (var index in nq.events) {

                    if (!nq.events[index].CalculatedInConstantly) {
                        nq.events[index].content = $rootScope.quickChangePrice;
                        nq.events[index].RoomCharge.Amount = $rootScope.quickChangePrice;
                    }
                }

                break;
            case "1":
                for (var index in nq.events) {
                    if (nq.events[index].title.getDay() != 0 && nq.events[index].title.getDay() != 6) {
                        if (!nq.events[index].CalculatedInConstantly) {
                            nq.events[index].content = $rootScope.quickChangePrice;
                            nq.events[index].RoomCharge.Amount = $rootScope.quickChangePrice;
                        }
                    }
                }
                break;
            case "2":
                for (var index in nq.events) {
                    if (nq.events[index].title.getDay() == 0 || nq.events[index].title.getDay() == 6) {
                        if (!nq.events[index].CalculatedInConstantly) {
                            nq.events[index].content = $rootScope.quickChangePrice;
                            nq.events[index].RoomCharge.Amount = $rootScope.quickChangePrice;
                        }
                    }
                }
                break;
        };

        var keys = ["RES_NO", "ROOM", "LIST_NOTIFICATION_WHEN_CHANGE_PRICE_FULLDAY"];
        var languageKeys = {};
        for (var idx in keys) {
            languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
        }



        var roomChargeList = [];
        nq.newTotalPrice = nq.newTotalPriceTemp;
        for (var index in nq.events) {
            if (!nq.events[index].CalculatedInConstantly) {
                nq.newTotalPrice = nq.newTotalPrice + nq.events[index].content;

            }

            var EditRoomChargeModel = {
                ReservationRoomId: nq.events[index].RoomCharge.ReservationRoomId,
                RoomChargeId: nq.events[index].RoomCharge.RoomChargeId,
                Amount: nq.events[index].RoomCharge.Amount,
                languageKeys: languageKeys
            }
            roomChargeList.push(EditRoomChargeModel);
        }

        var saveRoomChargeList = loginFactory.securedPostJSON("api/Room/SaveRoomChargeList", roomChargeList);
        $rootScope.dataLoadingPromise = saveRoomChargeList;
        saveRoomChargeList.success(function (data) {
            nq.isRoomChargeChanged = true;
            nq.originalEvents = angular.copy(nq.events);
        }).error(function (err) {
            console.log(err);
        })

    };

    nq.saveRoomCharge = function (event) {
        if (event.content !== $rootScope.newPrice) {
            if ($rootScope.newPrice == null || $rootScope.newPrice == '') {
                $rootScope.newPrice = 0;

            }
            nq.newTotalPrice = nq.newTotalPriceTemp;;
            var diffPrice = $rootScope.newPrice - event.content;
            event.RoomCharge.Amount = $rootScope.newPrice;
            event.content = $rootScope.newPrice;

            for (var index in nq.events) {
                if (!nq.events[index].CalculatedInConstantly) {
                    nq.newTotalPrice = nq.newTotalPrice + nq.events[index].content;
                }
            }

            var keys = ["RES_NO", "ROOM", "NOTIFICATION_WHEN_CHANGE_PRICE_FULLDAY"];
            var languageKeys = {};
            for (var idx in keys) {
                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
            }

            var EditRoomChargeModel = {
                ReservationRoomId: event.RoomCharge.ReservationRoomId,
                RoomChargeId: event.RoomCharge.RoomChargeId,
                Amount: event.RoomCharge.Amount,
                languageKeys: languageKeys
            }

            var saveRoomCharge = loginFactory.securedPostJSON("api/Room/SaveRoomCharge", EditRoomChargeModel);
            $rootScope.dataLoadingPromise = saveRoomCharge;
            saveRoomCharge.success(function (data) {
                nq.isRoomChargeChanged = true;
            }).error(function (err) {
                console.log(err);
            });
        }
    };

    nq.done = function () {
        if (nq.isRoomChargeChanged !== null && nq.isRoomChargeChanged === true) {
            var model = {
                ReservationRoomId: nq.ReservationRoomId,
                PriceData: nq.isRoomChargeChanged, //null or true
                Status: false
            };
            EditPriceService.setEditPriceModel(model);
            EditPriceService.processEditPrice(function(data){
                $mdDialog.hide();
                var result = data;
                if(result.status == true){
                    dialogService.toast("EDIT_PRICE_SUCCESSFUL");
                    $state.go($state.current, {}, {
                        reload: true
                    });
                }
            });
        }
    };

    nq.editPrice = function () {
        if ((nq.planInfo.UseHourlyPrice == true || nq.planInfo.UseDayNightPrice == true) && nq.isRoomChargeChanged != undefined){
            var model = {
                ReservationRoomId: nq.ReservationRoomId,
                PriceData: $rootScope.newPrice, //number or undefined
                Status: true
            };
            EditPriceService.setEditPriceModel(model);
            EditPriceService.processEditPrice(function(data){
                $mdDialog.hide();
                var result = data;
                if(result.status == true){
                    dialogService.toast("EDIT_PRICE_SUCCESSFUL");
                    $state.go($state.current, {}, {
                        reload: true
                    });
                }
                else {
                    if(result.object.message){ console.log("ERROR", result.object.message); }
                }
            });
        }
    }

    nq.cancel = function () {
        $mdDialog.hide();
    }
}]);