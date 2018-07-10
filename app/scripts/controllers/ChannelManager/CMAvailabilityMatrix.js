ezCloud.controller('CMAvailabilityMatrixController', ['$scope', '$rootScope', '$state', 'dialogService', '$localStorage', '$http', '$sessionStorage', 'loginFactory', '$mdDialog', 'flowFactory', '$filter', '$mdSidenav', '$mdMedia', 'configFactory', '$q', '$location', '$log', 'roomListFactory', 'frontOfficeFactory', '$timeout', 'CMFactory',
    function ($scope, $rootScope, $state, dialogService, $localStorage, $http, $sessionStorage, loginFactory, $mdDialog, flowFactory, $filter, $mdSidenav, $mdMedia, configFactory, $q, $location, $log, roomListFactory, frontOfficeFactory, $timeout, CMFactory) {
        $scope.selectedIndex = 0;
        $scope.CMSChannel = "";
        $scope.IsViewStopSellChannel = "";
        Date.prototype.addDays = function (days) {
            var dat = new Date(this.valueOf())
            dat.setDate(dat.getDate() + days);
            return dat;
        }

        function getDates(startDate, stopDate) {
            var dateArray = new Array();
            var currentDate = startDate;
            while (currentDate <= stopDate) {
                dateArray.push(new Date(currentDate))
                currentDate = currentDate.addDays(1);
            }
            return dateArray;
        }

        $scope.matrixFilter = {};
        $scope.daysToShowList = [7, 15, 30];

        function addDays(date, days) {
            var result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        }

        /* $rootScope.startDate = null;
         $rootScope.daysToShow = null;*/
        function InitAvMatrix() {
            jQuery(document).unbind('keydown');
            $scope.DateTimePickerOption = {
                format: 'dd/MM/yyyy HH:mm'
            };
            $scope.DatePickerOption = {
                format: 'dd/MM/yyyy'
            };
            $scope.inventoryFormString = new Date().format('dd/mm/yyyy');
            $scope.inventoryToString = addDays(new Date(), 1).format('dd/mm/yyyy');
            $scope.createFromString = null;
            $scope.createToString = null;
            $scope.search = {
                RoomTypeId: 0,
                InventoryIncluded: true,
                InventoryDateForm: new Date(),
                InventoryDateTo: addDays(new Date(), 1),
                CreateDateForm: null,
                CreateDateTo: null,
            };
            if ($rootScope.startDate == null) {
                $scope.str = new Date().format('dd/mm/yyyy');
                $scope.matrixFilter.startDate = new Date();
            } else {
                // $scope.str = $rootScope.startDate.format('dd/mm/yyyy');
                // $scope.matrixFilter.startDate = $rootScope.startDate;
                $scope.str = new Date().format('dd/mm/yyyy');
                $scope.matrixFilter.startDate = new Date();
            }

            if ($rootScope.EndDate == null) {
                $scope.str = new Date().format('dd/mm/yyyy');
                $scope.matrixFilter.EndDate = new Date();
            } else {
                $scope.str = $rootScope.EndDate.format('dd/mm/yyyy');
                $scope.matrixFilter.EndDate = $rootScope.EndDate;
            }

            $scope.matrixFilter.daysToShow = $rootScope.daysToShow == null ? 7 : $rootScope.daysToShow;
            
             
            CMFactory.getAvailabilityMatrixData($scope.matrixFilter.startDate, $scope.matrixFilter.startDate.addDays($scope.matrixFilter.daysToShow - 1), function (data) {
                $scope.avMatrixData = data;
                if ($scope.avMatrixData.Channels.length > 0) {
                    $scope.IsViewStopSellChannel = $scope.avMatrixData.Channels[0].Name;
                    $scope.switchStopSellChannel($scope.avMatrixData.Channels[0].Name);
                }

                if ($scope.avMatrixData != null && $scope.avMatrixData.CMConfiguration) {
                    $scope.CMConfiguration = $scope.avMatrixData.CMConfiguration;
                    $scope.CMSChannel = $scope.avMatrixData.CMConfiguration.TypeCms;
                }
                $scope.isShowKeepRanking = $scope.avMatrixData.IsShowKeepRanking;
                $scope.isKeepRanking = false;
                if ($scope.avMatrixData.IsShowKeepRanking == true) {
                    $scope.isKeepRanking = $scope.avMatrixData.IsKeepRanking;
                }
                console.log("avMatrixData", $scope.avMatrixData);
                CMFactory.CheckHotelCMConfiguration();
                CMFactory.getAllRoomTypeIsMapped(function (allRoomTypeIsMapped){
                    $scope.allRoomTypeIsMapped = allRoomTypeIsMapped.allCountRoomTypeIdIsMapped;
                    $scope.BEIsActived = allRoomTypeIsMapped.BEIsActived;
                CMFactory.getAvailabilityMatrixDataBE($scope.matrixFilter.startDate, $scope.matrixFilter.startDate.addDays($scope.matrixFilter.daysToShow - 1), function (dataBE) {
                    $scope.avMatrixDataBE = dataBE;    
                    console.log("avMatrixDataBE", $scope.avMatrixDataBE);
                    for(var i in data.days){
                        for(var j in $scope.avMatrixDataBE.days){
                            if(data.days[i].dayOfMonth == $scope.avMatrixDataBE.days[j].dayOfMonth){
                                for(var x in data.days[i].RoomTypes){
                                    if(!CheckRoomTypeIdIsMappedBE(data.days[i].RoomTypes[x].RoomTypeId||$scope.BEIsActived == false)){
                                        continue;
                                    }
                                    for(var y in $scope.avMatrixDataBE.days[j].RoomTypes){
                                        if(data.days[i].RoomTypes[x].RoomTypeId == $scope.avMatrixDataBE.days[j].RoomTypes[y].RoomTypeId){
                                            data.days[i].RoomTypes[x].CanBeSoldBE = $scope.avMatrixDataBE.days[j].RoomTypes[y].CanBeSold;
                                        }                          
                                    }
                                    if(data.days[i].RoomTypes[x].CanBeSoldBE == undefined || data.days[i].RoomTypes[x].CanBeSoldBE == null){
                                        data.days[i].RoomTypes[x].CanBeSoldBE = 'N/A';
                                    }
                                }
                            }
                        }
                    }
                });
            });
            });
        }
        $scope.processSearch = function () {
            $scope.inventoryLogData = [];
            var GetInventoryLogData = loginFactory.securedPostJSON("api/ChannelManager/GetInventoryLogData", $scope.search);
            $rootScope.dataLoadingPromise = GetInventoryLogData;
            GetInventoryLogData.success(function (data) {
                console.log("INVENTORY", data);
                if (data.length > 0) {
                    for (var idx in data) {
                        data[idx].CreatedDate = new Date(data[idx].CreatedDate);
                        data[idx].ActionUpdatedDate = new Date(data[idx].ActionUpdatedDate);
                        data[idx].EndDate = new Date(data[idx].EndDate);
                        data[idx].StartDate = new Date(data[idx].StartDate);
                    }
                    $scope.inventoryLogData = data;
                }

            }).error(function (err) {
                console.log('err', err);
            });
        }

        function InitInventoryLog() {
            var getRoomType = loginFactory.securedGet("api/ChannelManager/GetRoomType", "");
            $rootScope.dataLoadingPromise = getRoomType;
            getRoomType.success(function (data) {
                console.log("ROOM TYPE", data);
                $scope.roomTypes = data;
            }).error(function (err) {
                console.log('err', err);
            });
        }

        function Init() {

            $scope.$watchCollection('selectedIndex', function (newValues, oldValues) {
                if (newValues == null) {
                    InitAvMatrix();
                } else {
                    if (newValues == 0) {
                        InitAvMatrix();
                    } else {
                        InitInventoryLog();
                    }
                }
            });
        }
        Init();

        $scope.updateAvMatrix = function (startDate, daysToShow) {

            var dateParts = startDate.split("/");
            var date = new Date(dateParts[2], (dateParts[1] - 1), dateParts[0]);
            var startDayTemp = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var currentDateTemp = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
            if (startDayTemp < currentDateTemp) {
                dialogService.messageBox("WARNING", "FROM_DATE_CAN_NOT_BE_LESS_THAN_CURRENT_DATE");
                $scope.str = new Date().format('dd/mm/yyyy');
                return;
            }
            $rootScope.startDate = startDayTemp;
            $rootScope.daysToShow = daysToShow;
            CMFactory.getAvailabilityMatrixData(startDayTemp, startDayTemp.addDays(daysToShow - 1), function (data) {
                CMFactory.getAllRoomTypeIsMapped(function (allRoomTypeIsMapped){
                    $scope.allRoomTypeIsMapped = allRoomTypeIsMapped.allCountRoomTypeIdIsMapped;
                    $scope.BEIsActived = allRoomTypeIsMapped.BEIsActived;
                CMFactory.getAvailabilityMatrixDataBE($scope.matrixFilter.startDate, $scope.matrixFilter.startDate.addDays($scope.matrixFilter.daysToShow - 1), function (dataBE) {
                    $scope.avMatrixDataBE = dataBE;
                    console.log("avMatrixDataBE", $scope.avMatrixDataBE);
                    CMFactory.CheckHotelCMConfiguration();
                    for(var i in data.days){
                        for(var j in $scope.avMatrixDataBE.days){
                            if(data.days[i].dayOfMonth == $scope.avMatrixDataBE.days[j].dayOfMonth){
                                for(var x in data.days[i].RoomTypes){
                                    if(!CheckRoomTypeIdIsMappedBE(data.days[i].RoomTypes[x].RoomTypeId||$scope.BEIsActived == false)){
                                        continue;
                                    }
                                    for(var y in $scope.avMatrixDataBE.days[j].RoomTypes){
                                        if(data.days[i].RoomTypes[x].RoomTypeId == $scope.avMatrixDataBE.days[j].RoomTypes[y].RoomTypeId){
                                            data.days[i].RoomTypes[x].CanBeSoldBE = $scope.avMatrixDataBE.days[j].RoomTypes[y].CanBeSold;
                                        }                          
                                    }
                                    if(data.days[i].RoomTypes[x].CanBeSoldBE == undefined || data.days[i].RoomTypes[x].CanBeSoldBE == null){
                                        data.days[i].RoomTypes[x].CanBeSoldBE = 'N/A';
                                    }
                                }
                            }
                        }
                    }
                    $scope.avMatrixData = data;
                    $scope.switchStopSellChannel($scope.IsViewStopSellChannel);
                });
            });
            });
        };

        $scope.updateAllowOverBooking = function (status) {
            console.log("STATUS", status);
            switch (status) {
                case true:
                    dialogService.confirm("WARNING", "YOU_HAVE_SELECTED_TO_ENABLE_OVERBOOKING._THIS_IS_VERY_RISKY_STRATEGY_THAT_ALLOWS_YOU_TO_SELL_MORE_ROOMS_THAN_YOU_HAVE_AVAILABLE_TO_SELL.")
                        .then(function () {
                            var UpdateAllowOverBooking = loginFactory.securedPostJSON("api/ChannelManager/UpdateAllowOverBooking", $scope.CMConfiguration);
                            $rootScope.dataLoadingPromise = UpdateAllowOverBooking;
                            UpdateAllowOverBooking.success(function (data) {
                                dialogService.toast("UPDATE_ALLOW_OVER_BOOKING_SUCCESSFUL");
                            }).error(function (err) {
                                console.log(err);
                            });
                        });
                    break;
                case false:
                    dialogService.confirm("WARNING", "YOU_HAVE_SELECTED_TO_DISABLE_OVERBOOKING._DOING_SO_WILL_UPDATE_'CAN_BE_SOLD'_TO_EQUAL_THE_QUANTITY_AVAILABLE_ONLY_ON_THE_DATES_WHERE_CAN_BE_SOLD_WAS_PREVIOUSLY_SET_TO_BE_HIGHER_THAN_AVAILABILITY.")
                        .then(function () {
                            var UpdateAllowOverBooking = loginFactory.securedPostJSON("api/ChannelManager/UpdateAllowOverBooking", $scope.CMConfiguration);
                            $rootScope.dataLoadingPromise = UpdateAllowOverBooking;
                            UpdateAllowOverBooking.success(function (data) {
                                dialogService.toast("UPDATE_ALLOW_OVER_BOOKING_SUCCESSFUL");
                            }).error(function (err) {
                                console.log(err);
                            });
                        });
                    break;
                default:
                    break;
            }


        };

        $scope.openEditCanBeSoldMenu = function ($mdOpenMenu, ev, roomType) {
            $rootScope.newCanBeSold = roomType.CanBeSold;
            $mdOpenMenu(ev);
            $timeout(function () {
                angular.element(".CanBeSold").select();
            }, 100);
        };
        $scope.openNumberPrioritizeMenu = function ($mdOpenMenu, ev, NumberPrioritize) {
            $scope.NumberPrioritize = NumberPrioritize;
            $mdOpenMenu(ev);
            $timeout(function () {
                angular.element(".CanBeSold").select();
            }, 100);
        };
        
        $scope.UpdateStopSellLimit = function() {
            var listCMRoomTypeMappingId = [];
            for(var i in $scope.avMatrixData.roomTypes){       
                listCMRoomTypeMappingId.push($scope.avMatrixData.roomTypes[i].CMRoomTypeMappingId);
            }
            //console.log($scope.listCMConfigurations);
            var updateOTA = loginFactory.securedPostJSON("api/ChannelManager/UpdateStopSellLimit", listCMRoomTypeMappingId);
            var translated_title = $filter("translate")("LOG_MESSAGES");
            var translated_content = $filter("translate")("STOPSELL_MESSAGE");
            var translated_ok = $filter("translate")("OK");
            var translated_cancel = $filter("translate")("CANCEL");

            $mdDialog.show(
                $mdDialog.alert()
                    //.parent(angular.element(document.body))
                    .clickOutsideToClose(false)
                    .title(translated_title)
                    .textContent(translated_content)
                    //.ariaLabel('Alert Dialog POS')
                    .ok(translated_ok)
                    //.targetEvent(null)
            )
            $scope.btnShow = false;
            updateOTA.success(function (data) {
                $mdDialog.hide();    
                $state.go($state.current, {}, {
                    reload: true
                });
                dialogService.toast("UPDATE_SUCCESSFUL");
                $scope.btnShow = true;
            }).error(function (err) {
                    dialogService.messageBox("ERROR", err);
            })
        };

        $scope.saveAvailabilityMatrixData = function (roomType, day, action) {
            if (action == "CAN_BE_SOLD") {
                console.log("CAN_BE_SOLD", day);

                if (isNaN($rootScope.newCanBeSold)) {
                    $rootScope.newCanBeSold = 0;
                }

                var CMAvailabilityMatrix = {
                    CMAvailabilityMatrixId: roomType.CMAvailabilityMatrixId,
                    CMRoomTypeMappingId: roomType.CMRoomTypeMappingId,
                    MatrixDate: day.day,
                    CanBeSold: $rootScope.newCanBeSold,
                    Rate: 0,
                    MinLOS: 0,
                    MaxLOS: 0,
                    Cta: false,
                    Ctd: false,
                    StopSell: null
                };
                var CMAvailabilityMatrixModel = {
                    CMAvailabilityMatrixs: CMAvailabilityMatrix,
                    ActionName: "AVAILABILITY"
                }
                var saveAvailabilityMatrixData = loginFactory.securedPostJSON("api/ChannelManager/ProcessSaveAvailabilityMatrixData", CMAvailabilityMatrixModel);
                $rootScope.dataLoadingPromise = saveAvailabilityMatrixData;
                saveAvailabilityMatrixData.success(function (data) {
                    dialogService.toast("UPDATE_SUCCESSFULLY");
                    Init();
                }).error(function (err) {
                    dialogService.messageBox('ERROR', err.Message);
                })
            }


        };

        $scope.testSynchronization = function () {
            var testSynchronization = loginFactory.securedPostJSON("api/ChannelManager/TestSynchronization", "");
            testSynchronization.success(function (data) {

            }).error(function (err) {
                console.log(err);
            });

        };
        
        $scope.saveNumberPrioritize = function(NumberPrioritize,CMRoomTypeMappingId) {
            if(NumberPrioritize == null || NumberPrioritize<1){
                NumberPrioritize = 0;
            }
            for(var i in $scope.avMatrixData.roomTypes){
                if($scope.avMatrixData.roomTypes[i].CMRoomTypeMappingId == CMRoomTypeMappingId){
                    $scope.avMatrixData.roomTypes[i].NumberPrioritize = NumberPrioritize;
                    break;
                }
            }
            var json = {
                CMRoomTypeMappingId:CMRoomTypeMappingId,
                NumberPrioritize:NumberPrioritize
            };
            console.log("NumberPrioritize: "+NumberPrioritize + "CMRoomTypeMappingId: "+CMRoomTypeMappingId );
            var updateOTA = loginFactory.securedPostJSON("api/BookingEngine/SaveNumberPrioritize", json);
            updateOTA.success(function (data) {
                dialogService.toast("UPDATE_SUCCESSFUL");
                $state.go($state.current, {}, {
                    reload: false
                });
            }).error(function (err) {
                    dialogService.messageBox("ERROR", err);
            })
        };

        $scope.avBulkUpdate = function () {
            $mdDialog.show({
                controller: CMAVBulkUpdateDialogController,
                templateUrl: 'views/templates/CMAVBulkUpdate.tmpl.html',
                resolve: {
                    roomTypes: function () {
                        return $scope.avMatrixData.roomTypes;
                    },
                    avMatrixData: function () {
                        return $scope.avMatrixData;
                    }
                },
                parent: angular.element(document.body),
                targetEvent: null,
                clickOutsideToClose: false
            }).then(function (bulkUpdateModel) {
                if (bulkUpdateModel != null) {
                    var processSaveBulkUpdate = loginFactory.securedPostJSON("api/ChannelManager/ProcessSaveBulkUpdate", bulkUpdateModel);
                    $rootScope.dataLoadingPromise = processSaveBulkUpdate;
                    processSaveBulkUpdate.success(function (data) {
                        console.log(data);
                        dialogService.toast("BULK_UPDATE_SUCCESS");
                        Init();
                    }).error(function (err) {
                        //console.log(err);
                        dialogService.messageBox('ERROR', err.Message);
                    });
                }
            }, function () {});

            function CMAVBulkUpdateDialogController($scope, $mdDialog, loginFactory, dialogService, roomTypes, avMatrixData) {
                function Init() {
                    $scope.minFromDate = new Date();
                    $scope.minToDate = new Date();
                    $scope.Channels = avMatrixData.Channels;
                    $scope.selectedChannels = [];
                    var dateRange = {
                        from: null,
                        to: null,
                        valid: false,
                        conflict: false
                    }

                    $scope.toggleAll = function () {
                        if ($scope.selectedChannels.length === $scope.Channels.length) {
                            $scope.selectedChannels = [];
                        } else if ($scope.selectedChannels.length === 0 || $scope.selectedChannels.length > 0) {
                            var tmps = [];
                            $scope.Channels.forEach(function (val) {
                                tmps.push(val.Name);
                            })
                            $scope.selectedChannels = tmps;
                        }
                        console.log($scope.selectedChannels);
                    }

                    $scope.toggle = function (item, list) {
                        var idx = list.indexOf(item.Name);
                        if (idx > -1) {
                            list.splice(idx, 1);
                        } else {
                            list.push(item.Name);
                        }
                    };

                    $scope.exists = function (item, list) {
                        return list.indexOf(item.Name) > -1;
                    };

                    $scope.isChecked = function () {
                        return $scope.selectedChannels.length === $scope.Channels.length;
                    };

                    if (avMatrixData.CMConfiguration.TypeCms == "BOOKLOGIC") {
                        $scope.updateTypes = [{
                            value: 1,
                            label: "AVAILABILITY"
                        }, {
                            value: 2,
                            label: "STOPSELL"
                        }, {
                            value: 3,
                            label: "UNSTOPSELL"
                        }];
                    } else if (avMatrixData.CMConfiguration.TypeCms == "STAAH") {
                        $scope.updateTypes = [{
                            value: 1,
                            label: "AVAILABILITY"
                        }];
                    } else if (avMatrixData.CMConfiguration.TypeCms == "SITEMINDER") {
                        $scope.updateTypes = [{
                            value: 1,
                            label: "AVAILABILITY"
                        }, {
                            value: 2,
                            label: "STOPSELL"
                        }, {
                            value: 3,
                            label: "UNSTOPSELL"
                        }];
                    }
                    $scope.roomTypes = roomTypes;
                    if ($scope.roomTypes != null && $scope.roomTypes.length > 0) {
                        for (var index in $scope.roomTypes) {
                            $scope.roomTypes[index].selected = false;
                        }
                    }
                    $scope.DateTimePickerOption = {
                        format: 'dd/MM/yyyy HH:mm'
                    };
                    $scope.DatePickerOption = {
                        format: 'dd/MM/yyyy'
                    };
                    $scope.str = null;
                    $scope.str2 = null;

                    $scope.bulkUpdate = {
                        updateType: 1,
                        updateValue: null,
                        dateRanges: [{
                            from: null,
                            to: null,
                            valid: false,
                            conflict: false
                        }],
                        roomTypes: null
                    };
                    $scope.warning = false;
                    $scope.warningDate = false;
                    $scope.warningUpdateValue = false;
                    $scope.warningUpdateRoomType = false;
                    $scope.warningDateRange = false;
                    $scope.warningUpdateValueIsNaN = false;
                }
                Init();

                function CheckTimeRangeConflict(start_1, end_1, start_2, end_2) {
                    return (start_1 < end_2 && start_2 <= end_1);
                }

                $scope.updateMinToDate = function (date) {
                    var dateTemp = new Date(date);
                    $scope.minToDate = new Date(dateTemp.getFullYear(), dateTemp.getMonth(), dateTemp.getDate());
                };


                $scope.removeDateRange = function (index) {
                    $scope.bulkUpdate.dateRanges.splice(index, 1);
                };

                $scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
                $scope.addDateRange = function () {
                    var dateRange = {
                        from: null,
                        to: null,
                        valid: false,
                        conflict: false
                    }
                    $scope.bulkUpdate.dateRanges.push(dateRange);
                };

                $scope.bulkUpdateRoomTypes = [];
                $scope.addBulkUpdateRoomType = function (roomType) {
                    roomType.selected = !roomType.selected;
                    if (roomType.selected == true) {
                        $scope.bulkUpdateRoomTypes.push(roomType.CMRoomTypeMappingId);
                    } else {
                        var index = $scope.bulkUpdateRoomTypes.indexOf(roomType.CMRoomTypeMappingId);
                        if (index != -1) {
                            $scope.bulkUpdateRoomTypes.splice(index, 1);
                        }
                    }
                };
                $scope.$watch('bulkUpdate.dateRanges', function (newValue, oldValue) {
                    if (!angular.equals(newValue, oldValue)) {
                        if (newValue.length > 0) {
                            for (var i = 0; i < newValue.length; i++) {
                                var temp = newValue[i];
                                temp.valid = false;
                                temp.conflict = false;
                                if (temp.from != null && temp.to != null && temp.from.getTime() <= (temp.to.getTime() + 10000)) {
                                    temp.valid = true;
                                } else {
                                    temp.valid = false;
                                }
                            }

                            for (var i = 0; i < newValue.length - 1; i++) {
                                var temp = newValue[i];
                                for (var j = i + 1; j < newValue.length; j++) {
                                    if (newValue[j].conflict == false) {
                                        if (CheckTimeRangeConflict(temp.from, temp.to, newValue[j].from, newValue[j].to)) {
                                            temp.conflict = true;
                                            newValue[j].conflict = true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }, true);

                $scope.$watchCollection('bulkUpdate.updateValue', function (newValue, oldValue) {
                    if (newValue != null && newValue.trim() != '') {
                        $scope.warningUpdateValue = false;
                    }
                    if (newValue != null && !isNaN(newValue)) {
                        $scope.warningUpdateValueIsNaN = false;
                    }

                });

                $scope.saveBulkUpdate = function (updateType) {
                    if (updateType == 1) {
                        if ($scope.bulkUpdate.updateValue == null) {
                            $scope.warningUpdateValue = true;
                            $scope.warningUpdateRoomType = false;
                            $scope.warningDateRange = false;
                            $scope.warningUpdateValueIsNaN = false;
                            return;
                        }

                        if (isNaN($scope.bulkUpdate.updateValue)) {
                            $scope.warningUpdateValue = false;
                            $scope.warningUpdateRoomType = false;
                            $scope.warningDateRange = false;
                            $scope.warningUpdateValueIsNaN = true;
                            return;
                        }
                    }
                    var dateRangeTemp = _.filter($scope.bulkUpdate.dateRanges, function (item) {
                        return item.valid == false;
                    });
                    if (dateRangeTemp != null && dateRangeTemp.length > 0) {
                        $scope.warningUpdateRoomType = false;
                        $scope.warningUpdateValue = false;
                        $scope.warningDateRange = false;
                        $scope.warningUpdateValueIsNaN = false;
                        return;
                    }
                    if ($scope.bulkUpdate.dateRanges.length == 0) {
                        $scope.warningUpdateRoomType = false;
                        $scope.warningUpdateValue = false;
                        $scope.warningDateRange = true;
                        $scope.warningUpdateValueIsNaN = false;
                        return;
                    }

                    if ($scope.bulkUpdateRoomTypes.length == 0) {
                        $scope.warningUpdateRoomType = true;
                        $scope.warningUpdateValue = false;
                        $scope.warningDateRange = false;
                        $scope.warningUpdateValueIsNaN = false;
                        return;
                    }

                    var conflictTemp = _.filter($scope.bulkUpdate.dateRanges, function (item) {
                        return item.conflict == true;
                    });
                    if (conflictTemp != null && conflictTemp.length > 0) {
                        $scope.warningUpdateRoomType = false;
                        $scope.warningUpdateValue = false;
                        $scope.warningDateRange = false;
                        $scope.warningUpdateValueIsNaN = false;
                        return;
                    }

                    $scope.bulkUpdate.roomTypes = $scope.bulkUpdateRoomTypes;
                    for (var index in $scope.bulkUpdate.dateRanges) {
                        $scope.bulkUpdate.dateRanges[index].from = new Date($scope.bulkUpdate.dateRanges[index].from.getFullYear(), $scope.bulkUpdate.dateRanges[index].from.getMonth(), $scope.bulkUpdate.dateRanges[index].from.getDate());
                        $scope.bulkUpdate.dateRanges[index].to = new Date($scope.bulkUpdate.dateRanges[index].to.getFullYear(), $scope.bulkUpdate.dateRanges[index].to.getMonth(), $scope.bulkUpdate.dateRanges[index].to.getDate());
                    }
                    $scope.bulkUpdate.Channels = $scope.selectedChannels.join(",");
                    $mdDialog.hide($scope.bulkUpdate);

                };
            }
        }

        $scope.switchStopSellChannel = function (valCh) {
            $scope.IsViewStopSellChannel = valCh;
            var tmp = angular.copy($scope.avMatrixData.days);
            tmp.forEach(function (val, index) {
                val.RoomTypes.forEach(function (va, ind) {
                    if (va.Channels[valCh] == undefined || $scope.Channels.length == 0) {
                        tmp[index].RoomTypes[ind].isStopSell = false;
                    } else {
                        tmp[index].RoomTypes[ind].isStopSell = true;
                    }
                });
            });
            $scope.avMatrixData.days = tmp;
            console.log(valCh);
        }
        $scope.UpdateNumberPrioritize = function() {
            var listUpdateNumberPrioritizeObj = [];
            for(var i in $scope.avMatrixData.roomTypes){
                if($scope.avMatrixData.roomTypes[i].NumberPrioritize==null||$scope.avMatrixData.roomTypes[i].NumberPrioritize<0){
                    $scope.avMatrixData.roomTypes[i].NumberPrioritize = 0;
                }     
                var rt = {
                    CMRoomTypeMappingId:$scope.avMatrixData.roomTypes[i].CMRoomTypeMappingId,
                    NumberPrioritize:$scope.avMatrixData.roomTypes[i].NumberPrioritize
                }
                listUpdateNumberPrioritizeObj.push(rt);
            }
            console.log($scope.listCMConfigurations);
            var updateOTA = loginFactory.securedPostJSON("api/ChannelManager/UpdateCMRoomTypeNumberPrioritize", listUpdateNumberPrioritizeObj);
            updateOTA.success(function (data) {
                dialogService.toast("UPDATE_SUCCESSFUL");
                $state.go($state.current, {}, {
                    reload: false
                });
            }).error(function (err) {
                    dialogService.messageBox("ERROR", err);
            })
        }
        function CheckRoomTypeIdIsMappedBE(roomTypeId) {
            if($scope.allRoomTypeIsMapped == undefined || $scope.allRoomTypeIsMapped==null){
                return false;
            }
            for(var i in $scope.allRoomTypeIsMapped){
                if($scope.allRoomTypeIsMapped[i].roomTypeId==roomTypeId){
                    var roomTypeIsMapped = $scope.allRoomTypeIsMapped[i];
                    break;
                }
            }
            if(roomTypeIsMapped == undefined||roomTypeIsMapped==null){
               return false;
            }
            else{
                if(roomTypeIsMapped.coutRoomTypeMapped<=1){
                    return false;
                }
                else{
                    return true;
                }
            }
        }

        $scope.checkRoomTypeIdIsMappedBE = function (roomTypeId) {
            if($scope.allRoomTypeIsMapped == undefined || $scope.allRoomTypeIsMapped==null){
                return false;
            }
            for(var i in $scope.allRoomTypeIsMapped){
                if($scope.allRoomTypeIsMapped[i].roomTypeId==roomTypeId){
                    var roomTypeIsMapped = $scope.allRoomTypeIsMapped[i];
                    break;
                }
            }
            if(roomTypeIsMapped == undefined || roomTypeIsMapped==null){
               return false;
            }
            else{
                if(roomTypeIsMapped.coutRoomTypeMapped<=1){
                    return false;
                }
                else{
                    return true;
                }
            }
        }
    }
]);