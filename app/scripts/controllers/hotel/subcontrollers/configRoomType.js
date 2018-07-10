ezCloud.controller('configRoomTypeController', ['$scope', '$rootScope', '$state', 'dialogService', '$localStorage', '$http', '$sessionStorage', 'loginFactory', '$mdDialog', 'flowFactory', '$filter', '$log', '$mdSidenav', '$mdMedia', 'configFactory', '$q', '$location',
    function ($scope, $rootScope, $state, dialogService, $localStorage, $http, $sessionStorage, loginFactory, $mdDialog, flowFactory, $filter, $log, $mdSidenav, $mdMedia, configFactory, $q, $location) {

        $scope.roomTypes = {};
        $scope.planList = {};
        $scope.planDetailList = {};
        $scope.roomTypesLength;
        $scope.planOn = false;
        $scope.currentRoomType = {};
        $scope.roomTypesWorking = [];
        $scope.originalPlanList = [];
        $scope.planEditMode = false;
        $scope.newPlanDetail = {

        };

        function configRoomTypeInit() {
            $scope.decimal = $rootScope.decimals
            configFactory.getAllRoomTypes(function (data) {
                var temp =  data;
                $scope.arrFromRoomTypes = Object.keys(temp).map(function(key) {
                    return temp[key];
                });
                $scope.arrFromRoomTypes.sort(function(a,b){
                    return a.OrderNumber - b.OrderNumber;
                });
                $scope.originalRoomType = angular.copy($scope.arrFromRoomTypes); 
                $scope.roomTypes = data;
                $log.info("Room Types Data", $scope.roomTypes);
                $scope.roomTypesLength = _.size(data);
                for (var index in data) {
                    var dataTemp = data[index];
                    $scope.roomTypesWorking[dataTemp.roomType.RoomTypeId] = {};
                    $scope.roomTypesWorking[dataTemp.roomType.RoomTypeId] = {
                        isShow: true,
                        isHide: false,
                        planOn: false,
                        planDetailOn: false,
                        adjustmentOn: false
                    };
                }
            });
        };
        configRoomTypeInit();
        $scope.$watch('arrFromRoomTypes', function (newValues, oldValues) {
            if (_.size(newValues) !== 0 && _.size(oldValues) !== 0 && !angular.equals(newValues, oldValues)) {
                $scope.isRoomTypeChanged = true;
            }
            if (angular.equals(newValues, $scope.originalRoomType)) {
                $scope.isRoomTypeChanged = false;
            }
        },true);
        EditRoomTypeDialogController.$inject = ['$scope', '$rootScope', '$mdDialog', 'roomTypeEditing'];

        function EditRoomTypeDialogController($scope, $rootScope, $mdDialog, roomTypeEditing) {
            $scope.decimal = $rootScope.decimals;
            //var initial = angular.copy(roomTypeEditing);

            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                //angular.copy(initial, $scope.roomTypeEditing);
                $mdDialog.cancel();
            };

            /*$scope.default = function () {
	                angular.copy(initial, $scope.roomTypeEditing);
            };*/

            $scope.saveEdited = function (roomTypeEdited) {
                $mdDialog.hide(roomTypeEdited);
            };
            $scope.roomTypeEditing = roomTypeEditing;
        }

        $scope.goToRoomType = function (roomType, event) {
            var roomTypeTemp = angular.copy(roomType);
            $mdDialog.show({
                controller: EditRoomTypeDialogController,
                resolve: {
                    roomTypeEditing: function () {
                        return roomTypeTemp;
                    }
                },
                templateUrl: 'views/templates/editRoomType.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: event,
            }).then(function (roomTypeEdited) {
                configFactory.saveRoomType(roomTypeEdited, function (data) {
                    configRoomTypeInit();
                    dialogService.toast("ROOM_TYPE_EDITED");
                });

            }, function () { });
        };

        CreateRoomTypeDialogController.$inject = ['$scope', '$mdDialog'];

        function CreateRoomTypeDialogController($scope, $mdDialog) {
            $scope.decimal = $rootScope.decimals;
            $scope.newRoomType = {
                RoomTypeName: "",
                RoomTypeCode: "",
                RoomTypeDescription: "",
                Image: "",
                Price: 0,
                IsHidden: false,
                DefaultAdults: 1,
                DefaultChilds: 0,
                OrderNumber: 0
            };

            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
            $scope.saveNewRoomType = function (newRoomType) {
                $mdDialog.hide(newRoomType);
            };

        }

        $scope.createRoomType = function () {
            $mdDialog.show({
                controller: CreateRoomTypeDialogController,
                templateUrl: 'views/templates/createRoomType.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: event,
            }).then(function (newRoomType) {
                /*console.log("NEW ROOM TYPE 1", newRoomType);
                configFactory.createRoomType(newRoomType, function (data) {
                    console.log("NEW ROOM TYPE", data);
                    $scope.roomTypes[data.RoomTypeId] = {};
                    $scope.roomTypes[data.RoomTypeId].roomType = data;
                    $scope.roomTypes[data.RoomTypeId].planList = [];
                    $scope.roomTypes[data.RoomTypeId].planDetailList = {};
                    $scope.roomTypesWorking[data.RoomTypeId] = {
                        isShow: true,
                        isHide: false,
                        planOn: false,
                        planDetailOn: false,
                        adjustmentOn: false
                    };
                    $scope.roomTypesLength += 1;
                });*/

                configFactory.createRoomType(newRoomType, function (data) {
                    configRoomTypeInit();
                    dialogService.toast("CREATE_ROOM_TYPE_SUCCESSFUL");
                });

            }, function () {

            });
        };
        $scope.changeRoomTypeStatus = function (roomType) {
            var warning = false;
            // var GetAllRoomTypeReservations = loginFactory.securedGet("api/Config/RoomTypes/GetAllRoomTypeReservations", "roomTypeId=" + roomType.RoomTypeId);
            var GetAllRoomTypeReservations = loginFactory.securedGet("api/Config/RoomTypes/CheckDataRoomTypes", "roomTypeId=" + roomType.RoomTypeId);
            GetAllRoomTypeReservations.success(function (data) {
                console.log("ALREADY RR", data);
                // if (data.length > 0) {
                if (data) {
                    warning = true;
                }
                if (warning) {
                    dialogService.messageBox("ERROR", "CAN_NOT_INACTIVE_THIS_ROOM_TYPE" + "." + "PLEASE_PROCESS_ALL_RESERVATION_AND_ROOM_BELONG_TO_THIS_ROOM_TYPE");
                } else {
                    var confirm = dialogService.confirm("ENABLE/DISABLE_ROOM_TYPE_CONFIRM",
                        "WOULD_YOU_LIKE_TO_CHANGE_ROOM_TYPE_STATUS ");
                    confirm.then(function () {
                        roomType.IsHidden = (roomType.IsHidden === true) ? false : true;
                        configFactory.changeRoomTypeStatus(roomType.RoomTypeId);
                    });
                }
            }).error(function (err) {
                console.log(err);
            });




        };


        $scope.titleOn = true;

        /* ----------------------- PLAN LIST PROCESS (START) ------------------------ */


        $scope.showPlan = function (roomType) {
            $scope.titleOn = !$scope.titleOn;
            $scope.currentRoomType = $scope.roomTypes[roomType.RoomTypeId];
            $log.info("Room Types Data In Plan", $scope.currentRoomType);
            $scope.currentRoomType.planListChanged = false;
            $scope.currentRoomType.planListSaved = true;
            $scope.currentRoomType.planDetailChanged = false;
            $scope.currentRoomType.planDetailSaved = true;
            $scope.currentRoomType.originalPlanList = angular.copy($scope.roomTypes[roomType.RoomTypeId].planList);
            for (var index in $scope.roomTypesWorking) {
                $scope.roomTypesWorking[index].isShow = false;
            }

            $scope.roomTypesWorking[roomType.RoomTypeId].isShow = !$scope.roomTypesWorking[roomType.RoomTypeId].isShow;
            $scope.roomTypesWorking[roomType.RoomTypeId].planOn = !$scope.roomTypesWorking[roomType.RoomTypeId].planOn;
            if ($scope.roomTypesWorking[roomType.RoomTypeId].planOn === false) {
                for (var index in $scope.roomTypesWorking) {
                    $scope.roomTypesWorking[index].isShow = true;
                }
                $scope.roomTypesWorking[roomType.RoomTypeId].planDetailOn = false;
                $scope.roomTypesWorking[roomType.RoomTypeId].adjustmentOn = false;
            }
        };

        function planListProcess() {
            $scope.$watch('currentRoomType.planList', function (newValue) {
                var originalPlanListTemp = angular.copy($scope.currentRoomType.originalPlanList);
                var oldValueTemp = originalPlanListTemp;

                if (newValue !== undefined) {
                    if (!angular.equals(newValue, oldValueTemp)) {

                        $scope.currentRoomType.originalPlanList = oldValueTemp;
                        $scope.currentRoomType.planListChanged = true;
                        $scope.currentRoomType.planListSaved = false;
                    }
                }

                if (angular.equals(newValue, oldValueTemp)) {
                    $scope.currentRoomType.planListChanged = false;
                }

            }, true);
        }
        planListProcess();

        $scope.removePlan = function (plan, index) {

            $scope.currentRoomType.planList.splice(index, 1);

        };

        $scope.planEditModeProcess = function () {
            if ($scope.planEditMode) {
                if ($scope.currentRoomType.planListChanged) {
                    if ($scope.currentRoomType.planListSaved === false) {
                        $scope.currentRoomType.planList = $scope.currentRoomType.originalPlanList;
                    }
                }
                $scope.planEditMode = false;
            } else {

                $scope.currentRoomType.originalPlanList = angular.copy($scope.currentRoomType.planList);
                $scope.planEditMode = true;
            }
        };

        $scope.savePlanList = function () {
            var PlanListViewModel = {
                RoomType: $scope.currentRoomType.roomType,
                PlanList: $scope.currentRoomType.planList
            };
            var savePlanList = loginFactory.securedPostJSON("api/Config/RoomTypes/Plans/SavePlanList", PlanListViewModel);
            $rootScope.dataLoadingPromise = savePlanList;
            savePlanList.success(function (data) {
                $scope.currentRoomType.planListChanged = false;
                $scope.currentRoomType.planListSaved = true;
                $scope.currentRoomType.originalPlanList = angular.copy($scope.currentRoomType.planList);
                $scope.isRoomTypeChanged = false;
                dialogService.toast("SAVE_PLAN_LIST_SUCESSFUL");
            });
        };


        $scope.backToRoomType = function () {
            console.log("GOT BACK");
            $scope.roomTypesWorking[$scope.currentRoomType.roomType.RoomTypeId].planOn = false;
            $scope.roomTypesWorking[$scope.currentRoomType.roomType.RoomTypeId].planDetailOn = false;
            $scope.roomTypesWorking[$scope.currentRoomType.roomType.RoomTypeId].adjustmentOn = false;
            $scope.titleOn = true;

            //$scope.roomTypes[$scope.currentRoomType.roomType.RoomTypeId].planDetailList[$scope.currentPlan.Plan.RoomPriceId] = $scope.currentPlan.originalPlanDetail;

            for (var index in $scope.roomTypesWorking) {
                console.log(index);
                $scope.roomTypesWorking[index].isShow = true;
                console.log($scope.roomTypesWorking[index]);
            }

        };

        $scope.backToPlanList = function () {
            $scope.roomTypesWorking[$scope.currentPlan.Plan.RoomTypeId].planDetailOn = false;

        };

        $scope.backToPlanDetail = function () {
            $scope.roomTypesWorking[$scope.currentPlan.Plan.RoomTypeId].adjustmentOn = false;
        };

        $scope.addNewPlan = function () {
            var priority = $scope.currentRoomType.planList.length;
            $mdDialog.show({
                controller: AddNewPlanDialogController,
                resolve: {
                    roomTypeId: function () {
                        return $scope.currentRoomType.roomType.RoomTypeId;
                    },
                    priority: function () {
                        return priority;
                    }
                },
                templateUrl: 'views/templates/addNewPlan.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: event,
            }).then(function (newPlan) {
                $scope.currentRoomType.planList[priority] = newPlan;
                $scope.showPlanDetail(newPlan);
            }, function () {

            });
        };
        AddNewPlanDialogController.$inject = ['$scope', '$mdDialog', 'roomTypeId', 'priority'];

        function AddNewPlanDialogController($scope, $mdDialog, roomTypeId, priority) {
            $scope.newPlan = {
                RoomPriceId: null,
                RoomPriceName: null,
                RoomTypeId: roomTypeId,
                Priority: priority,
                IsActive: true
            }

            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
            $scope.saveNewPlan = function () {

                $mdDialog.hide($scope.newPlan);

            };

        }

        $scope.planUp = function (item, index) {
            if (index <= 0 || index >= $scope.currentRoomType.planList.length)
                return;
            var priorityTemp = $scope.currentRoomType.planList[index].Priority;
            $scope.currentRoomType.planList[index].Priority = $scope.currentRoomType.planList[index - 1].Priority;
            $scope.currentRoomType.planList[index - 1].Priority = priorityTemp;
            var temp = $scope.currentRoomType.planList[index];

            $scope.currentRoomType.planList[index] = $scope.currentRoomType.planList[index - 1];

            $scope.currentRoomType.planList[index - 1] = temp;


        };

        $scope.planDown = function (roomType, index) {

            if (index < 0 || index >= ($scope.currentRoomType.planList.length - 1))
                return;
            var priorityTemp = $scope.currentRoomType.planList[index].Priority;
            $scope.currentRoomType.planList[index].Priority = $scope.currentRoomType.planList[index + 1].Priority;
            $scope.currentRoomType.planList[index + 1].Priority = priorityTemp;
            var temp = $scope.currentRoomType.planList[index];
            $scope.currentRoomType.planList[index] = $scope.currentRoomType.planList[index + 1];
            $scope.currentRoomType.planList[index + 1] = temp;


        };

        /* -------------------------------------- PLAN LIST PROCESS (END) ------------------------------- */

        /* -------------------------------------- PLAN DETAIL PROCESS (START) ------------------------------- */

        $scope.currentPlan = {};
        $scope.currentPlan.testFunctionShow = false;
        $scope.currentAdjustment = {};

        $scope.showPlanDetail = function (plan) {

            $scope.currentPlan.planDetailChanged = false;
            $scope.currentPlan.planDetailSaved = true;

            $scope.roomTypesWorking[$scope.currentRoomType.roomType.RoomTypeId].adjustmentOn = false;
            if ($scope.roomTypesWorking[$scope.currentRoomType.roomType.RoomTypeId].planDetailOn === false) {
                $scope.roomTypesWorking[$scope.currentRoomType.roomType.RoomTypeId].planDetailOn = true;
            } else {
                if ($scope.currentPlan.Plan === plan && plan.RoomPriceId !== null) {
                    $scope.originalCurrentRoomType = $scope.currentRoomType;
                    $scope.roomTypesWorking[$scope.currentRoomType.roomType.RoomTypeId].planDetailOn = false;
                }

            }

            $scope.currentPlan.Plan = plan;
            if (plan.RoomPriceId !== null) {

                $scope.currentPlan.PlanDetail = $scope.roomTypes[$scope.currentRoomType.roomType.RoomTypeId].planDetailList[plan.RoomPriceId];

            } else {
                $scope.currentPlan.planDetailChanged = true;
                $scope.currentPlan.PlanDetail = {
                    PlanSchedule: {
                        name: "PLAN_SCHEDULE",
                        property: "PlanSchedule",
                        adjustment: {
                            startDate: new Date(1970, 0, 1, 12, 0, 0),
                            startTime: null,
                            endDate: new Date(9996, 0, 1, 12, 0, 0),
                            endTime: null,
                            ApplyOnMonday: true,
                            ApplyOnTuesday: true,
                            ApplyOnWednesday: true,
                            ApplyOnThursday: true,
                            ApplyOnFriday: true,
                            ApplyOnSaturday: true,
                            ApplyOnSunday: true
                        }
                    },
                    UseHourlyPrice: {
                        name: "USE_HOURLY_PRICE",
                        property: "UseHourlyPrice",
                        isUsed: false,
                        adjustment: [],
                        adjustmentCode: "HOURLY_PRICE",
                    },
                    UseFullDayPrice: {
                        name: "USE_FULL_DAY_PRICE",
                        property: "UseFullDayPrice",
                        isUsed: true,
                        price: $scope.currentRoomType.roomType.Price,
                        adjustment: [],
                        adjustmentCode: "OVERDUE_FULLDAY"
                    },
                    UseEarlyCheckinFullDay: {
                        name: "USE_EARLY_CHECKIN_FULL_DAY",
                        property: "UseEarlyCheckinFullDay",
                        isUsed: false,
                        adjustment: [],
                        adjustmentCode: "EARLY_CHECKIN_FULL_DAY"
                    },
                    UseDayNightPrice: {
                        name: "USE_DAY_NIGHT_PRICE",
                        property: "UseDayNightPrice",
                        isUsed: false,
                        price: null,
                        adjustment: [],
                        adjustmentCode: "OVERDUE_DAYNIGHT"
                    },
                    UseEarlyCheckinDayNight: {
                        name: "USE_EARLY_CHECKIN_DAY_NIGHT",
                        property: "UseEarlyCheckinDayNight",
                        isUsed: false,
                        adjustment: [],
                        adjustmentCode: "EARLY_CHECKIN_DAY_NIGHT"
                    },
                    UseMonthlyPrice: {
                        name: "USE_MONTHLY_PRICE",
                        property: "UseMonthlyPrice",
                        isUsed: false,
                        price: null,
                        adjustment: [],
                        adjustmentCode: "OVERDUE_MONTHLY"
                    },
                    UseWeeklyPrice: {
                        name: "USE_WEEKLY_PRICE",
                        property: "UseWeeklyPrice",
                        isUsed: false,
                        price: null,
                        adjustment: [],
                        adjustmentCode: "OVERDUE_WEEKLY"
                    },
                    UseExtraAdultPrice: {
                        name: "USE_EXTRA_ADULT_PRICE",
                        property: "UseExtraAdultPrice",
                        isUsed: false,
                        adjustment: {
                            defaultAdults: null,
                            extraAdultPrice: null,
                        }
                    },
                    UseExtraChildPrice: {
                        name: "USE_EXTRA_CHILD_PRICE",
                        property: "UseExtraChildPrice",
                        isUsed: false,
                        adjustment: {
                            defaultChildren: null,
                            extraChildPrice: null,
                        }
                    }
                };

            };

            $scope.currentPlan.originalPlanDetail = angular.copy($scope.currentPlan.PlanDetail);
            planDetailProcess();


        };

        function planDetailProcess() {

            $scope.$watch('currentPlan.PlanDetail', function (newValue) {
                var oldValueTemp = angular.copy($scope.currentPlan.originalPlanDetail);


                if (newValue !== undefined && oldValueTemp !== undefined) {
                    if (!angular.equals(newValue, oldValueTemp)) {

                        $scope.currentPlan.originalPlanDetail = oldValueTemp;
                        $scope.currentPlan.planDetailChanged = true;
                        $scope.currentPlan.planDetailSaved = false;
                    }
                }

                if (angular.equals(newValue, oldValueTemp)) {
                    if ($scope.currentPlan.Plan.RoomPriceId === null) {
                        $scope.currentPlan.planDetailChanged = true;
                    } else {
                        $scope.currentPlan.planDetailChanged = false;
                        $scope.currentPlan.testFunctionShow = true;
                    }

                }

            }, true);
        }




        $scope.closePlanDetail = function () {
            $scope.roomTypesWorking[$scope.currentRoomType.roomType.RoomTypeId].planDetailOn = false;
            $scope.roomTypesWorking[$scope.currentRoomType.roomType.RoomTypeId].adjustmentOn = false;
            if ($scope.currentPlan.planDetailChanged && $scope.currentPlan.Plan.RoomPriceId === null) {
                $scope.currentRoomType.planList.splice($scope.currentRoomType.planList.length - 1, 1);
                $scope.currentPlan.planDetailChanged = false;
            }
        };


        $scope.openPlanDetailDashBoard = function (ev) {
            var startDateTemp = ($scope.currentPlan.PlanDetail['PlanSchedule'].adjustment.startDate === null) ? null : $scope.currentPlan.PlanDetail['PlanSchedule'].adjustment.startDate;
            var startTimeTemp = ($scope.currentPlan.PlanDetail['PlanSchedule'].adjustment.startTime === null) ? new Date(1970, 0, 1, 12, 0, 0) : $scope.currentPlan.PlanDetail['PlanSchedule'].adjustment.startTime;
            var endDateTemp = ($scope.currentPlan.PlanDetail['PlanSchedule'].adjustment.endDate === null) ? null : $scope.currentPlan.PlanDetail['PlanSchedule'].adjustment.endDate;
            var endTimeTemp = ($scope.currentPlan.PlanDetail['PlanSchedule'].adjustment.endTime === null) ? new Date(1970, 0, 1, 12, 0, 0) : $scope.currentPlan.PlanDetail['PlanSchedule'].adjustment.endTime;
            var PlanSchedule = {
                //startDate: (startDateTemp === null) ? null : new Date(startDateTemp.getFullYear(), startDateTemp.getMonth(), startDateTemp.getDate(), startTimeTemp.getHours(), startTimeTemp.getMinutes(), 0),
                //endDate: (endDateTemp === null) ? null : new Date(endDateTemp.getFullYear(), endDateTemp.getMonth(), endDateTemp.getDate(), endTimeTemp.getHours(), endTimeTemp.getMinutes(), 0),
                startDate: new Date(1970, 0, 1, 12, 0, 0),
                endDate: new Date(9996, 0, 1, 12, 0, 0),
                ApplyOnMonday: $scope.currentPlan.PlanDetail['PlanSchedule'].adjustment.ApplyOnMonday,
                ApplyOnTuesday: $scope.currentPlan.PlanDetail['PlanSchedule'].adjustment.ApplyOnTuesday,
                ApplyOnWednesday: $scope.currentPlan.PlanDetail['PlanSchedule'].adjustment.ApplyOnWednesday,
                ApplyOnThursday: $scope.currentPlan.PlanDetail['PlanSchedule'].adjustment.ApplyOnThursday,
                ApplyOnFriday: $scope.currentPlan.PlanDetail['PlanSchedule'].adjustment.ApplyOnFriday,
                ApplyOnSaturday: $scope.currentPlan.PlanDetail['PlanSchedule'].adjustment.ApplyOnSaturday,
                ApplyOnSunday: $scope.currentPlan.PlanDetail['PlanSchedule'].adjustment.ApplyOnSunday
            };

            var UseFullDayPriceTemp = $scope.currentPlan.PlanDetail['UseFullDayPrice'];
            //UseFullDayPriceTemp.UseEarlyCheckinFullDay = $scope.currentPlan.PlanDetail['UseEarlyCheckinFullDay'];
            if (UseFullDayPriceTemp.UseEarlyCheckinFullDay !== undefined) {
                delete UseFullDayPriceTemp.UseEarlyCheckinFullDay
            }

            var UseDayNightPriceTemp = $scope.currentPlan.PlanDetail['UseDayNightPrice'];
            //UseDayNightPriceTemp.UseEarlyCheckinDayNight = $scope.currentPlan.PlanDetail['UseEarlyCheckinDayNight'];
            if (UseDayNightPriceTemp.UseEarlyCheckinDayNight !== undefined) {
                delete UseFullDayPriceTemp.UseEarlyCheckinDayNight
            }

            console.log("SAVE DETAIL CURRENT PLAN", $scope.currentPlan);

            var PlanDetailViewModel = {
                Plan: $scope.currentPlan.Plan,
                PlanSchedule: PlanSchedule,
                UseHourlyPrice: $scope.currentPlan.PlanDetail['UseHourlyPrice'],
                //UseFullDayPrice: $scope.currentPlan.PlanDetail['UseFullDayPrice'],
                //UseDayNightPrice: $scope.currentPlan.PlanDetail['UseDayNightPrice'],
                UseEarlyCheckinFullDay: $scope.currentPlan.PlanDetail['UseEarlyCheckinFullDay'],
                UseEarlyCheckinDayNight: $scope.currentPlan.PlanDetail['UseEarlyCheckinDayNight'],
                UseFullDayPrice: UseFullDayPriceTemp,
                UseDayNightPrice: UseDayNightPriceTemp,
                UseWeeklyPrice: $scope.currentPlan.PlanDetail['UseWeeklyPrice'],
                UseMonthlyPrice: $scope.currentPlan.PlanDetail['UseMonthlyPrice'],
                UseExtraAdultPrice: $scope.currentPlan.PlanDetail['UseExtraAdultPrice'],
                UseExtraChildPrice: $scope.currentPlan.PlanDetail['UseExtraChildPrice']
            }
            var useFullScreen = $mdMedia('xs');
            $mdDialog.show({
                controller: DashBoardDialogController,
                resolve: {
                    currentPlan: function () {
                        return $scope.currentPlan.Plan;
                    },
                    activedPlanDetail: function () {
                        var result = {};
                        //var currentPlanDetailTemp = $scope.currentRoomType.planDetailList[$scope.currentPlan.Plan.RoomPriceId];
                        var currentPlanDetailTemp = $scope.currentPlan.PlanDetail;
                        for (var index in currentPlanDetailTemp) {
                            if (currentPlanDetailTemp[index].isUsed === true) {
                                result[index] = currentPlanDetailTemp[index]
                            }
                        }
                        return result;
                    },
                    planSchedule: function () {
                        return PlanSchedule;
                    }
                },
                fullscreen: useFullScreen,
                templateUrl: 'views/templates/planDetailDashBoard.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false
            })
                .then(function (answer) {
                    var savePlanDetail = loginFactory.securedPostJSON("api/Config/RoomTypes/Plans/SavePlanDetail", PlanDetailViewModel);
                    $rootScope.dataLoadingPromise = savePlanDetail;
                    savePlanDetail.success(function (data) {
                        $scope.currentPlan.Plan.RoomPriceId = data;
                        //$scope.roomTypes[$scope.currentRoomType.roomType.RoomTypeId].planDetailList = [];
                        $scope.roomTypes[$scope.currentRoomType.roomType.RoomTypeId].planDetailList[$scope.currentPlan.Plan.RoomPriceId] = $scope.currentPlan.PlanDetail;
                        $scope.currentPlan.planDetailChanged = false;
                        $scope.currentPlan.planDetailSaved = true;
                        $scope.currentPlan.originalPlanDetail = angular.copy($scope.currentPlan.PlanDetail);
                        $scope.isRoomTypeChanged = false;
                        dialogService.toast("SAVE_PLAN_DETAIL_SUCESSFUL");
                    }).error(function (err) {
                        console.log(err);
                    });
                }, function () {

                });
        };
        DashBoardDialogController.$inject = ['$scope', '$mdDialog', 'currentPlan', 'activedPlanDetail', 'planSchedule'];

        function DashBoardDialogController($scope, $mdDialog, currentPlan, activedPlanDetail, planSchedule) {
            console.log(activedPlanDetail);
            //$scope.currentPlan = currentPlan;

            function init() {
                $scope.currentPlan = currentPlan;
                $scope.activedPlanDetailTemp = activedPlanDetail;
                console.log($scope.activedPlanDetailTemp);
                if ($scope.activedPlanDetailTemp["UseFullDayPrice"] !== undefined && $scope.activedPlanDetailTemp["UseFullDayPrice"].isUsed === true && $scope.activedPlanDetailTemp["UseEarlyCheckinFullDay"] !== undefined && $scope.activedPlanDetailTemp["UseEarlyCheckinFullDay"].isUsed === true) {
                    $scope.activedPlanDetailTemp["UseFullDayPrice"].earlyCheckIn = $scope.activedPlanDetailTemp["UseEarlyCheckinFullDay"];
                    delete $scope.activedPlanDetailTemp["UseEarlyCheckinFullDay"];
                }
                //console.log("TEMP", $scope.activedPlanDetailTemp["UseEarlyCheckinDayNight"]);

                if ($scope.activedPlanDetailTemp["UseDayNightPrice"] !== undefined && $scope.activedPlanDetailTemp["UseDayNightPrice"].isUsed === true && $scope.activedPlanDetailTemp["UseEarlyCheckinDayNight"] !== undefined && $scope.activedPlanDetailTemp["UseEarlyCheckinDayNight"].isUsed === true) {
                    $scope.activedPlanDetailTemp["UseDayNightPrice"].earlyCheckIn = $scope.activedPlanDetailTemp["UseEarlyCheckinDayNight"];
                    delete $scope.activedPlanDetailTemp["UseEarlyCheckinDayNight"];
                }

                $scope.activedPlanDetail = $scope.activedPlanDetailTemp;

            }
            init();



            console.log($scope.activedPlanDetail);

            //$scope.activedPlanDetail = activedPlanDetail;
            $scope.planSchedule = planSchedule;
            $scope.applyOn = [];
            if ($scope.planSchedule.ApplyOnMonday === true) $scope.applyOn.push('MONDAY');
            if ($scope.planSchedule.ApplyOnTuesday === true) $scope.applyOn.push('TUESDAY');
            if ($scope.planSchedule.ApplyOnWednesday === true) $scope.applyOn.push('WEDNESDAY');
            if ($scope.planSchedule.ApplyOnThursday === true) $scope.applyOn.push('THURSDAY');
            if ($scope.planSchedule.ApplyOnFriday === true) $scope.applyOn.push('FRIDAY');
            if ($scope.planSchedule.ApplyOnSaturday === true) $scope.applyOn.push('SATURDAY');
            if ($scope.planSchedule.ApplyOnSunday === true) $scope.applyOn.push('SUNDAY');

            if ($scope.applyOn.length === 7) {
                $scope.applyOn = [];
                $scope.applyOn.push('ALL_WEEK');
            }

            $scope.dashboardColor = {
                'UseHourlyPrice': '#3F51B5',
                'UseFullDayPrice': '#009688',
                'UseDayNightPrice': '#795548',
                'UseWeeklyPrice': '#FF5722',
                'UseMonthlyPrice': '#607D8B',
                'UseExtraAdultPrice': '#f44336',
                'UseExtraChildPrice': '#33691E',
            };

            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
            $scope.answer = function (answer) {
                $mdDialog.hide(answer);
            };
        }

        $scope.openTestFunction = function (ev) {
            var currentRoomTypeTemp = angular.copy($scope.currentRoomType);
            var currentPlanTemp = angular.copy($scope.currentPlan);
            console.log("CURRENT ROOM TYPE IN SCOPE", $scope.currentPlan);
            $mdDialog.show({
                controller: PreviewPlanCalculatePriceController,
                resolve: {
                    currentRoomTypeInPreview: function () {
                        return currentRoomTypeTemp;
                    },
                    currentPlanInPreview: function () {
                        return currentPlanTemp;
                    }
                },
                templateUrl: 'views/templates/previewPlanCalculatePrice.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false
            })
                .then(function (answer) { }, function () {

                });
        };
        PreviewPlanCalculatePriceController.$inject = ['$scope', '$mdDialog', 'currentRoomTypeInPreview', 'currentPlanInPreview'];

        function PreviewPlanCalculatePriceController($scope, $mdDialog, currentRoomTypeInPreview, currentPlanInPreview) {
            console.log("CURRENT ROOM TYPE IN PREVIEW", currentRoomTypeInPreview);
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.preview = {
                startDate: null,
                endDate: null,
                adults: 1,
                children: 0
            };
            $scope.currentRoomTypePreview = {
                roomType: null,
                planList: null,
                planDetailList: null
            };

            function PlanPreviewInit() {
                $scope.DateTimePickerOption = {
                    format: 'dd/MM/yyyy HH:mm'
                };
                $scope.DatePickerOption = {
                    format: 'dd/MM/yyyy'
                };
                $scope.currentRoomTypePreview.roomType = currentRoomTypeInPreview.roomType;
                $scope.currentPlanInPreview = currentPlanInPreview;
                $scope.currentRoomTypePreview.planList = currentRoomTypeInPreview.planList;
                $scope.resultShow = false;
                var planDetailListTemp = [];
                for (var indexPlanDetail in currentRoomTypeInPreview.planDetailList) {
                    var planDetailTemp = currentRoomTypeInPreview.planDetailList[indexPlanDetail];
                    planDetailTemp.Plan = {};
                    for (var indexPlan in currentRoomTypeInPreview.planList) {
                        if (currentRoomTypeInPreview.planList[indexPlan].RoomPriceId.toString() === indexPlanDetail.toString()) {
                            planDetailTemp.Plan = currentRoomTypeInPreview.planList[indexPlan];
                            break;
                        }
                    }
                    var startDateTemp = (planDetailTemp.PlanSchedule.adjustment.startDate === null) ? null : planDetailTemp.PlanSchedule.adjustment.startDate;
                    var startTimeTemp = (planDetailTemp.PlanSchedule.adjustment.startTime === null) ? new Date(1970, 0, 1, 12, 0, 0) : planDetailTemp.PlanSchedule.adjustment.startTime;
                    var endDateTemp = (planDetailTemp.PlanSchedule.adjustment.endDate === null) ? null : planDetailTemp.PlanSchedule.adjustment.endDate;
                    var endTimeTemp = (planDetailTemp.PlanSchedule.adjustment.endTime === null) ? new Date(1970, 0, 1, 12, 0, 0) : planDetailTemp.PlanSchedule.adjustment.endTime;

                    var PlanSchedule = {
                        startDate: (startDateTemp === null) ? null : new Date(startDateTemp.getFullYear(), startDateTemp.getMonth(), startDateTemp.getDate(), startTimeTemp.getHours(), startTimeTemp.getMinutes(), 0),
                        endDate: (endDateTemp === null) ? null : new Date(endDateTemp.getFullYear(), endDateTemp.getMonth(), endDateTemp.getDate(), endTimeTemp.getHours(), endTimeTemp.getMinutes(), 0),
                        ApplyOnMonday: planDetailTemp.PlanSchedule.adjustment.ApplyOnMonday,
                        ApplyOnTuesday: planDetailTemp.PlanSchedule.adjustment.ApplyOnTuesday,
                        ApplyOnWednesday: planDetailTemp.PlanSchedule.adjustment.ApplyOnWednesday,
                        ApplyOnThursday: planDetailTemp.PlanSchedule.adjustment.ApplyOnThursday,
                        ApplyOnFriday: planDetailTemp.PlanSchedule.adjustment.ApplyOnFriday,
                        ApplyOnSaturday: planDetailTemp.PlanSchedule.adjustment.ApplyOnSaturday,
                        ApplyOnSunday: planDetailTemp.PlanSchedule.adjustment.ApplyOnSunday
                    };


                    planDetailTemp.PlanSchedule = PlanSchedule;
                    planDetailListTemp.splice(planDetailListTemp.length, 0, planDetailTemp);
                }

                $scope.currentRoomTypePreview.planDetailList = planDetailListTemp;
            }
            PlanPreviewInit();

            function resultDataProcess(data) {
                if (data.planListConstantlyFormula) {
                    for (var index in data.planListConstantlyFormula) {
                        var formulaTemp = data.planListConstantlyFormula[index];

                        formulaTemp.Range.Start = new Date(formulaTemp.Range.Start);
                        formulaTemp.Range.End = new Date(formulaTemp.Range.End);
                        formulaTemp.FormulaPeriodAfter = formulaTemp.FormulaPeriod;
                        if (_.size(formulaTemp.NotAvailableDays) > 0) {
                            formulaTemp.FormulaPeriodAfter = formulaTemp.FormulaPeriod - _.size(formulaTemp.NotAvailableDays);

                            for (var index2 in formulaTemp.NotAvailableDays) {
                                var dateTemp = new Date(formulaTemp.NotAvailableDays[index2]).toLocaleDateString();
                                formulaTemp.NotAvailableDays[index2] = dateTemp;
                            }
                        }
                    }
                }

                if (data.planListFullDayFormula) {
                    console.log("GET HERE");
                    for (var index in data.planListFullDayFormula) {
                        var formulaTemp = data.planListFullDayFormula[index];
                        console.log("GET HERE 2", data.planListFullDayFormula[index].range.Start);
                        data.planListFullDayFormula[index].range.Start = new Date(data.planListFullDayFormula[index].range.Start);
                        console.log("GET HERE 3", data.planListFullDayFormula[index].range.Start);
                        data.planListFullDayFormula[index].range.End = new Date(data.planListFullDayFormula[index].range.End);
                    }
                }

                if (data.planListHourlyFormula) {
                    data.planListHourlyFormula.dropDayNightFormula = false;
                    if (data.planListHourlyFormula.availableHourlyFormula) {
                        for (var index in data.planListHourlyFormula.availableHourlyFormula) {
                            var formulaTemp = data.planListHourlyFormula.availableHourlyFormula[index];
                            if (data.planListHourlyFormula.availableHourlyFormula[index].Name === "DAY_NIGHT_PRICE") {
                                if (data.planListHourlyFormula.availableHourlyFormula[index].FormulaEarlyCheckIn !== null) {
                                    for (var key in data.planListHourlyFormula.availableHourlyFormula[index].FormulaEarlyCheckIn) {
                                        if (key >= 24) {
                                            data.planListHourlyFormula.dropDayNightFormula = true;
                                        }
                                    }
                                }

                                if (data.planListHourlyFormula.availableHourlyFormula[index].FormulaLateCheckOut !== null) {
                                    for (var key in data.planListHourlyFormula.availableHourlyFormula[index].FormulaLateCheckOut) {
                                        if (key >= 24) {
                                            data.planListHourlyFormula.dropDayNightFormula = true;
                                        }
                                    }
                                }
                            }
                            data.planListHourlyFormula.availableHourlyFormula[index].Range.Start = new Date(data.planListHourlyFormula.availableHourlyFormula[index].Range.Start);
                            data.planListHourlyFormula.availableHourlyFormula[index].Range.End = new Date(data.planListHourlyFormula.availableHourlyFormula[index].Range.End);
                        }
                    }

                    if (data.planListHourlyFormula.finalHourlyFormula) {
                        data.planListHourlyFormula.finalHourlyFormula.Range.Start = new Date(data.planListHourlyFormula.finalHourlyFormula.Range.Start);
                        data.planListHourlyFormula.finalHourlyFormula.Range.End = new Date(data.planListHourlyFormula.finalHourlyFormula.Range.End);

                    }
                }

                return data;
            }


            $scope.previewCalculatePlanList = function () {

                /*var startDateTemp = ($scope.preview.startDate === null) ? null : $scope.preview.startDate;
                var startTimeTemp = ($scope.preview.startTime === null) ? new Date(1970, 0, 1, 12, 0, 0) : $scope.preview.startTime;
                var startDate = new Date(startDateTemp.getFullYear(), startDateTemp.getMonth(), startDateTemp.getDate(), startTimeTemp.getHours(), startTimeTemp.getMinutes(), 0);
                var endDateTemp = ($scope.preview.endDate === null) ? null : $scope.preview.endDate;
                var endTimeTemp = ($scope.preview.endTime === null) ? new Date(1970, 0, 1, 12, 0, 0) : $scope.preview.endTime;
                var endDate = new Date(endDateTemp.getFullYear(), endDateTemp.getMonth(), endDateTemp.getDate(), endTimeTemp.getHours(), endTimeTemp.getMinutes(), 0);*/
                $scope.PlanListPreviewModel = {
                    //previewStartDate: (startDate === null) ? null : startDate,
                    //previewEndDate: (endDate === null) ? null : endDate,
                    previewStartDate: $scope.preview.startDate,
                    previewEndDate: $scope.preview.endDate,
                    adults: $scope.preview.adults,
                    children: $scope.preview.children,
                    roomPriceId: $scope.currentPlanInPreview.Plan.RoomPriceId,
                    FOC: false,
                    DiscountPercentage: 0,
                    DiscountFlat: 0,
                    currentRoomType: $scope.currentRoomTypePreview
                };

                var previewCalculatePlanList = loginFactory.securedPostJSON("api/Config/RoomTypes/Plans/PlanListPreviewCalculate", $scope.PlanListPreviewModel);
                $rootScope.dataLoadingPromise = previewCalculatePlanList;
                previewCalculatePlanList.success(function (data) {
                    $scope.resultShow = true;
                    console.log("PREVIEW DATA 1", data);
                    data = resultDataProcess(data)
                    console.log("PREVIEW DATA 2", data);
                    $scope.result = data;
                    $log.info($scope.result);

                }).error(function (err) {
                    console.log(err);
                });

            }
        }


        $scope.originalCurrentAdjustment = {};
        $scope.currentAdjustment.hasChanged = false;
        $scope.showPlanDetailAdjustment = function (name, property) {
            $log.info("Room Types Data In PlanDetailAdjustment", $scope.currentRoomType);
            if ($scope.roomTypesWorking[$scope.currentRoomType.roomType.RoomTypeId].adjustmentOn === false) {
                $scope.roomTypesWorking[$scope.currentRoomType.roomType.RoomTypeId].adjustmentOn = true;
            } else {
                if ($scope.currentAdjustment.Property === property) {
                    $scope.roomTypesWorking[$scope.currentRoomType.roomType.RoomTypeId].adjustmentOn = false;
                }
            }
            //if ($scope.currentPlan.Plan.RoomPriceId !== null){
            if (property === 'PlanSchedule') {
                $scope.currentAdjustment.Name = name;
            } else {
                $scope.currentAdjustment.Name = (name.substring(4, name.length)).substring(0, name.length - 10);
            }
            $scope.currentAdjustment.Property = property;
            $scope.currentAdjustment.Status = true;
            $scope.currentAdjustment.Adjustment = $scope.currentPlan.PlanDetail[property];
            if (property === 'UseFullDayPrice') {
                $scope.currentAdjustment.UseEarlyCheckinFullDay = $scope.currentPlan.PlanDetail["UseEarlyCheckinFullDay"];

            }
            if (property === 'UseDayNightPrice') {
                $scope.currentAdjustment.UseEarlyCheckinDayNight = $scope.currentPlan.PlanDetail["UseEarlyCheckinDayNight"];
            }

        };

        $scope.addEarlyCheckinFullDay = function () {
            var newEarlyCheckinFullDay = {
                RoomPriceId: $scope.currentPlan.Plan.RoomPriceId,
                NumberOfHour: null,
                Price: null,
                AdjustmentCode: 'EARLY_CHECK_IN_FULL_DAY'
            };
            var index = $scope.currentAdjustment.UseEarlyCheckinFullDay.adjustment.length;
            $scope.currentAdjustment.UseEarlyCheckinFullDay.adjustment[index] = newEarlyCheckinFullDay;
        };

        $scope.addEarlyCheckinDayNight = function () {
            var newEarlyCheckinDayNight = {
                RoomPriceId: $scope.currentPlan.Plan.RoomPriceId,
                NumberOfHour: null,
                Price: null,
                AdjustmentCode: 'EARLY_CHECK_IN_DAY_NIGHT'
            };
            var index = $scope.currentAdjustment.UseEarlyCheckinDayNight.adjustment.length;
            $scope.currentAdjustment.UseEarlyCheckinDayNight.adjustment[index] = newEarlyCheckinDayNight;
        };

        $scope.checkAllWeek = function () {
            $scope.currentAdjustment.Adjustment.adjustment.ApplyOnMonday = true;
            $scope.currentAdjustment.Adjustment.adjustment.ApplyOnTuesday = true;
            $scope.currentAdjustment.Adjustment.adjustment.ApplyOnWednesday = true;
            $scope.currentAdjustment.Adjustment.adjustment.ApplyOnThursday = true;
            $scope.currentAdjustment.Adjustment.adjustment.ApplyOnFriday = true;
            $scope.currentAdjustment.Adjustment.adjustment.ApplyOnSaturday = true;
            $scope.currentAdjustment.Adjustment.adjustment.ApplyOnSunday = true;
        }

        $scope.checkWeekend = function () {
            $scope.currentAdjustment.Adjustment.adjustment.ApplyOnMonday = false;
            $scope.currentAdjustment.Adjustment.adjustment.ApplyOnTuesday = false;
            $scope.currentAdjustment.Adjustment.adjustment.ApplyOnWednesday = false;
            $scope.currentAdjustment.Adjustment.adjustment.ApplyOnThursday = false;
            $scope.currentAdjustment.Adjustment.adjustment.ApplyOnFriday = false;
            $scope.currentAdjustment.Adjustment.adjustment.ApplyOnSaturday = true;
            $scope.currentAdjustment.Adjustment.adjustment.ApplyOnSunday = true;
        };

        $scope.closePlanDetailAdjustment = function () {
            $scope.roomTypesWorking[$scope.currentRoomType.roomType.RoomTypeId].adjustmentOn = false;
            if ($scope.currentAdjustment.hasChanged) {
                $scope.hasPlanDetailChanged = true;
            }
        };

        $scope.addPriceAdjustment = function (name, property) {
            var title = "ADD_" + name.substring(0, name.length - 5);
            $mdDialog.show({
                controller: AddPriceAdjustmentDialogController,
                resolve: {
                    plan: function () {
                        return $scope.currentPlan.Plan;
                    },
                    adjustmentCode: function () {
                        return $scope.currentAdjustment.Adjustment.adjustmentCode;
                    },

                    title: function () {
                        return title;
                    }
                },
                templateUrl: 'views/templates/addPriceAdjustment.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: event,
            }).then(function (newPriceAdjustment) {

                $scope.currentAdjustment.hasChanged = true;
                var index = $scope.currentAdjustment.Adjustment.adjustment.length;
                $scope.currentAdjustment.Adjustment.adjustment[index] = newPriceAdjustment;


            }, function () {

            });

        };
        AddPriceAdjustmentDialogController.$inject = ['$scope', '$mdDialog', 'plan', 'adjustmentCode', 'title'];

        function AddPriceAdjustmentDialogController($scope, $mdDialog, plan, adjustmentCode, title) {
            $scope.title = title;
            $scope.newPriceAdjustment = {
                RoomPriceId: plan.RoomPriceId,
                NumberOfHour: null,
                Price: null,
                AdjustmentCode: adjustmentCode
            };

            $scope.cancel = function () {
                $mdDialog.cancel();
            };
            $scope.saveNewPriceAdjustment = function () {
                $mdDialog.hide($scope.newPriceAdjustment);
            };
        }

        $scope.addAdjustment = function () {
            var newAdjustment = {
                RoomPriceId: $scope.currentPlan.Plan.RoomPriceId,
                NumberOfHour: null,
                Price: null,
                AdjustmentCode: $scope.currentAdjustment.adjustmentCode
            };
            var index = $scope.currentAdjustment.Adjustment.adjustment.length;
            $scope.currentAdjustment.Adjustment.adjustment[index] = newAdjustment;
        };

        $scope.removeAdjustment = function (adjustment) {
            var index = $scope.currentAdjustment.Adjustment.adjustment.indexOf(adjustment);
            $scope.currentAdjustment.Adjustment.adjustment.splice(index, 1);
        }

        $scope.removeFullDayEarlyCheckIn = function (adjustment) {
            var index = $scope.currentAdjustment.UseEarlyCheckinFullDay.adjustment.indexOf(adjustment);
            $scope.currentAdjustment.UseEarlyCheckinFullDay.adjustment.splice(index, 1);
        }

        $scope.removeDayNightEarlyCheckIn = function (adjustment) {
            var index = $scope.currentAdjustment.UseEarlyCheckinDayNight.adjustment.indexOf(adjustment);
            $scope.currentAdjustment.UseEarlyCheckinDayNight.adjustment.splice(index, 1);
        }

        $scope.previewPlanList = function (ev) {

            var currentRoomTypeTemp = angular.copy($scope.currentRoomType);
            console.log("CURRENT ROOM TYPE IN SCOPE", currentRoomTypeTemp);
            $mdDialog.show({
                controller: PlanListPreviewController,
                resolve: {
                    currentRoomTypeInPreview: function () {
                        return currentRoomTypeTemp;
                    }
                },
                templateUrl: 'views/templates/planListPreviewDashboard.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false
            })
                .then(function (answer) { }, function () {

                });
        };
        PlanListPreviewController.$inject = ['$scope', '$mdDialog', 'currentRoomTypeInPreview'];

        function PlanListPreviewController($scope, $mdDialog, currentRoomTypeInPreview) {
            console.log("CURRENT ROOM TYPE IN PREVIEW", currentRoomTypeInPreview);
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.preview = {
                startDate: null,
                startTime: null,
                endDate: null,
                endTime: null,
                adults: null,
                children: null
            };
            $scope.currentRoomTypePreview = {
                roomType: null,
                planList: null,
                planDetailList: null
            };

            function PlanListPreviewInit() {
                $scope.currentRoomTypePreview.roomType = currentRoomTypeInPreview.roomType;
                $scope.currentRoomTypePreview.planList = currentRoomTypeInPreview.planList;
                $scope.resultShow = false;
                var planDetailListTemp = [];
                for (var indexPlanDetail in currentRoomTypeInPreview.planDetailList) {
                    var planDetailTemp = currentRoomTypeInPreview.planDetailList[indexPlanDetail];
                    planDetailTemp.Plan = {};
                    for (var indexPlan in currentRoomTypeInPreview.planList) {
                        if (currentRoomTypeInPreview.planList[indexPlan].RoomPriceId.toString() === indexPlanDetail.toString()) {
                            planDetailTemp.Plan = currentRoomTypeInPreview.planList[indexPlan];
                            break;
                        }
                    }
                    var startDateTemp = (planDetailTemp.PlanSchedule.adjustment.startDate === null) ? null : planDetailTemp.PlanSchedule.adjustment.startDate;
                    var startTimeTemp = (planDetailTemp.PlanSchedule.adjustment.startTime === null) ? new Date(1970, 0, 1, 12, 0, 0) : planDetailTemp.PlanSchedule.adjustment.startTime;
                    var endDateTemp = (planDetailTemp.PlanSchedule.adjustment.endDate === null) ? null : planDetailTemp.PlanSchedule.adjustment.endDate;
                    var endTimeTemp = (planDetailTemp.PlanSchedule.adjustment.endTime === null) ? new Date(1970, 0, 1, 12, 0, 0) : planDetailTemp.PlanSchedule.adjustment.endTime;

                    var PlanSchedule = {
                        startDate: (startDateTemp === null) ? null : new Date(startDateTemp.getFullYear(), startDateTemp.getMonth(), startDateTemp.getDate(), startTimeTemp.getHours(), startTimeTemp.getMinutes(), 0),
                        endDate: (endDateTemp === null) ? null : new Date(endDateTemp.getFullYear(), endDateTemp.getMonth(), endDateTemp.getDate(), endTimeTemp.getHours(), endTimeTemp.getMinutes(), 0),
                        ApplyOnMonday: planDetailTemp.PlanSchedule.adjustment.ApplyOnMonday,
                        ApplyOnTuesday: planDetailTemp.PlanSchedule.adjustment.ApplyOnTuesday,
                        ApplyOnWednesday: planDetailTemp.PlanSchedule.adjustment.ApplyOnWednesday,
                        ApplyOnThursday: planDetailTemp.PlanSchedule.adjustment.ApplyOnThursday,
                        ApplyOnFriday: planDetailTemp.PlanSchedule.adjustment.ApplyOnFriday,
                        ApplyOnSaturday: planDetailTemp.PlanSchedule.adjustment.ApplyOnSaturday,
                        ApplyOnSunday: planDetailTemp.PlanSchedule.adjustment.ApplyOnSunday
                    };


                    planDetailTemp.PlanSchedule = PlanSchedule;
                    planDetailListTemp.splice(planDetailListTemp.length, 0, planDetailTemp);
                }
                console.log(planDetailListTemp);
                $scope.currentRoomTypePreview.planDetailList = planDetailListTemp;
            }
            PlanListPreviewInit();

            function resultDataProcess(data) {
                if (data.planListConstantlyFormula) {
                    for (var index in data.planListConstantlyFormula) {
                        var formulaTemp = data.planListConstantlyFormula[index];

                        formulaTemp.Range.Start = new Date(formulaTemp.Range.Start);
                        formulaTemp.Range.End = new Date(formulaTemp.Range.End);
                        formulaTemp.FormulaPeriodAfter = formulaTemp.FormulaPeriod;
                        if (_.size(formulaTemp.NotAvailableDays) > 0) {
                            formulaTemp.FormulaPeriodAfter = formulaTemp.FormulaPeriod - _.size(formulaTemp.NotAvailableDays);

                            for (var index2 in formulaTemp.NotAvailableDays) {
                                var dateTemp = new Date(formulaTemp.NotAvailableDays[index2]).toLocaleDateString();
                                formulaTemp.NotAvailableDays[index2] = dateTemp;
                            }
                        }
                    }
                }

                if (data.planListFullDayFormula) {
                    for (var index in data.planListFullDayFormula) {
                        var formulaTemp = data.planListFullDayFormula[index];

                        formulaTemp.range.Start = new Date(formulaTemp.range.Start);
                        formulaTemp.range.End = new Date(formulaTemp.range.End);
                    }
                }

                if (data.planListHourlyFormula) {
                    if (data.planListHourlyFormula.availableHourlyFormula) {
                        for (var index in data.planListHourlyFormula.availableHourlyFormula) {
                            var formulaTemp = data.planListHourlyFormula.availableHourlyFormula[index];

                            formulaTemp.Range.Start = new Date(formulaTemp.Range.Start);
                            formulaTemp.Range.End = new Date(formulaTemp.Range.End);
                        }
                    }

                    if (data.planListHourlyFormula.finalHourlyFormula) {
                        data.planListHourlyFormula.finalHourlyFormula.Range.Start = new Date(data.planListHourlyFormula.finalHourlyFormula.Range.Start);
                        data.planListHourlyFormula.finalHourlyFormula.Range.End = new Date(data.planListHourlyFormula.finalHourlyFormula.Range.End);

                    }
                }

                return data;
            }


            $scope.previewCalculatePlanList = function () {

                var startDateTemp = ($scope.preview.startDate === null) ? null : $scope.preview.startDate;
                var startTimeTemp = ($scope.preview.startTime === null) ? new Date(1970, 0, 1, 12, 0, 0) : $scope.preview.startTime;
                var startDate = new Date(startDateTemp.getFullYear(), startDateTemp.getMonth(), startDateTemp.getDate(), startTimeTemp.getHours(), startTimeTemp.getMinutes(), 0);
                var endDateTemp = ($scope.preview.endDate === null) ? null : $scope.preview.endDate;
                var endTimeTemp = ($scope.preview.endTime === null) ? new Date(1970, 0, 1, 12, 0, 0) : $scope.preview.endTime;
                var endDate = new Date(endDateTemp.getFullYear(), endDateTemp.getMonth(), endDateTemp.getDate(), endTimeTemp.getHours(), endTimeTemp.getMinutes(), 0);
                $scope.PlanListPreviewModel = {
                    previewStartDate: (startDate === null) ? null : startDate,
                    previewEndDate: (endDate === null) ? null : endDate,
                    adults: $scope.preview.adults,
                    children: $scope.preview.children,
                    currentRoomType: $scope.currentRoomTypePreview
                };

                var previewCalculatePlanList = loginFactory.securedPostJSON("api/Config/RoomTypes/Plans/PlanListPreviewCalculate", $scope.PlanListPreviewModel);
                $rootScope.dataLoadingPromise = previewCalculatePlanList;
                previewCalculatePlanList.success(function (data) {
                    $scope.resultShow = true;
                    data = resultDataProcess(data)
                    console.log("PREVIEW DATA", data);
                    $scope.result = data;
                    $log.info($scope.result);

                }).error(function (err) {
                    console.log(err);
                });

            };
        }
        $scope.changeOrderNumber = function(){
            if($scope.arrFromRoomTypes && $scope.arrFromRoomTypes.length == 0){
                return;
            };
            var OrderNumber = 0;
            var RoomTypes = [];
            for(var idx in $scope.arrFromRoomTypes){
                var roomTypeTemp = $scope.arrFromRoomTypes[idx].roomType;
                roomTypeTemp.OrderNumber = OrderNumber ;
                RoomTypes.push(roomTypeTemp);
                OrderNumber += 1;
            };
            configFactory.ChangeRoomTypesOrderNumber(RoomTypes, function (data) {
                $scope.isRoomTypeChanged = false;
                dialogService.toast("CHANGE_ROOM_TYPE_ORDER_NUMBER_SUCCESS");
                configRoomTypeInit();
            });
        };
    }]);