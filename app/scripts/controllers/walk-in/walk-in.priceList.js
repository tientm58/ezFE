ezCloud.controller('WalkinPriceListCtrl', ['$scope', '$mdBottomSheet', '$rootScope', '$log', 'commonFactory', 'loginFactory', '$stateParams', 'roomListFactory', 'dialogService', '$state', '$mdDialog', '$locale', '$filter', '$localStorage', 'configFactory', '$mdMedia', 'smartCardFactory', '$timeout', '$location', 'reservationFactory', 'walkInFactory',
    function($scope, $mdBottomSheet, $rootScope, $log, commonFactory, loginFactory, $stateParams, roomListFactory, dialogService, $state, $mdDialog, $locale, $filter, $localStorage, configFactory, $mdMedia, smartCardFactory, $timeout, $location, reservationFactory, walkInFactory) {
        var vm = this;
        vm.viewType = "detailGroup";
        function InitWalkin_PriceList(){
            walkInFactory.getReservationRoomResolved($stateParams.reservationRoomId).then(function(data){
               // $timeout(function(){
                    if ($stateParams.reservationRoomId){
                        vm.room                  = data.reservationInfo.room;
                        vm.RoomExtraServices     = walkInFactory.getRoomExtraServices();
                        vm.RoomExtraServiceItems = walkInFactory.getRoomExtraServiceItems();
                        // Calculate Room Price
                        if (vm.room.BookingStatus == "CHECKIN" || vm.room.BookingStatus == "OVERDUE" || vm.room.BookingStatus == "BOOKED" || vm.room.BookingStatus == "NOSHOW") {
                            vm.priceList = data.CalculateRoomPrice;
                            vm.priceList.totalPriceFullDay = 0;
                            vm.priceList = resultDataProcess(data.CalculateRoomPrice);
                            if (vm.priceList.planListConstantlyFormula.length > 0) {
                                for (var index in vm.priceList.planListConstantlyFormula) {
                                    var priceTemp = vm.priceList.planListConstantlyFormula[index];
                                    priceTemp.ConstantlyExtraServices = [];
                                    for (var index2 in vm.RoomExtraServices) {
                                        if (priceTemp.Range.Start.getTime() <= vm.RoomExtraServices[index2].CreatedDate.getTime() && vm.RoomExtraServices[index2].CreatedDate.getTime() <= priceTemp.Range.End.getTime() + 60000) {
                                            priceTemp.ConstantlyExtraServices.push(vm.RoomExtraServices[index2]);
                                        }
                                    }
                                    priceTemp.ConstantlyExtraServiceItems = []
                                    for (var index2 in vm.RoomExtraServiceItems) {
                                        if (priceTemp.Range.Start.getTime() <= vm.RoomExtraServiceItems[index2].CreatedDate.getTime() && vm.RoomExtraServiceItems[index2].CreatedDate.getTime() <= priceTemp.Range.End.getTime() + 60000) {
                                            priceTemp.ConstantlyExtraServiceItems.push(vm.RoomExtraServiceItems[index2]);
                                        }
                                    }
                                }
                                //trường hợp khi thêm dịch vụ ngày 15, past Check Out Departure 14 ->Thanh toán (hiện thị theo ngày)
                                if (vm.RoomExtraServices.length > 0) {
                                    angular.forEach(vm.RoomExtraServices, function(arr) {
                                        var lastIndex = vm.priceList.planListConstantlyFormula.length - 1;
                                        var lastPriceTemp = vm.priceList.planListConstantlyFormula[lastIndex];
                                        var lastDate = new Date(lastPriceTemp.Range.End.getFullYear(), lastPriceTemp.Range.End.getMonth(), lastPriceTemp.Range.End.getDate());
                                        var DateES = new Date(arr.CreatedDate.getFullYear(), arr.CreatedDate.getMonth(), arr.CreatedDate.getDate());
                                        if (lastDate > DateES) {
                                            var newPlanListFullDayFormula = {
                                                Range: {
                                                    Start: angular.copy(arr.CreatedDate),
                                                    End: angular.copy(arr.CreatedDate),
                                                },
                                                ConstantlyExtraServices: [arr]
                                            };
                                            vm.priceList.planListConstantlyFormula.push(newPlanListFullDayFormula);
                                        }
                                    })
                                }

                                if (vm.RoomExtraServiceItems.length > 0) {
                                    angular.forEach(vm.RoomExtraServiceItems, function(arr) {
                                        var lastIndex = vm.priceList.planListConstantlyFormula.length - 1;
                                        var lastPriceTemp = vm.priceList.planListConstantlyFormula[lastIndex];
                                        var lastDate = new Date(lastPriceTemp.Range.End.getFullYear(), lastPriceTemp.Range.End.getMonth(), lastPriceTemp.Range.End.getDate());
                                        var DateES = new Date(arr.CreatedDate.getFullYear(), arr.CreatedDate.getMonth(), arr.CreatedDate.getDate());
                                        if (DateES > lastDate) {
                                            var newPlanListConstantlyFormula = {
                                                Range: {
                                                    Start: angular.copy(arr.CreatedDate),
                                                    End: angular.copy(arr.CreatedDate),
                                                },
                                                ConstantlyExtraServiceItems: [arr]
                                            };
                                            vm.priceList.planListConstantlyFormula.push(newPlanListConstantlyFormula);
                                        }
                                    })
                                }
                            }
                            if (vm.priceList.planListFullDayFormula.length > 0) {
                                for (var index in vm.priceList.planListFullDayFormula) {
                                    var priceTemp = vm.priceList.planListFullDayFormula[index];
                                    if (vm.priceList.planListFullDayFormula[index].formula && vm.priceList.planListFullDayFormula[index].formula.Range) {
                                        vm.priceList.planListFullDayFormula[index].formula.Range.Start = new Date(vm.priceList.planListFullDayFormula[index].formula.Range.Start);
                                        vm.priceList.planListFullDayFormula[index].formula.Range.End = new Date(vm.priceList.planListFullDayFormula[index].formula.Range.End);
                                    }
                                    priceTemp.FullDayExtraServices = [];
                                    for (var index2 in vm.RoomExtraServices) {
                                        if (priceTemp.range.Start.getTime() <= vm.RoomExtraServices[index2].CreatedDate.getTime() && vm.RoomExtraServices[index2].CreatedDate.getTime() <= priceTemp.range.End.getTime() + 60000) {
                                            priceTemp.FullDayExtraServices.push(vm.RoomExtraServices[index2]);
                                        }
                                    }

                                    priceTemp.FullDayExtraServiceItems = []
                                    for (var index2 in vm.RoomExtraServiceItems) {
                                        if (priceTemp.range.Start.getTime() <= vm.RoomExtraServiceItems[index2].CreatedDate.getTime() && vm.RoomExtraServiceItems[index2].CreatedDate.getTime() <= priceTemp.range.End.getTime() + 60000) {
                                            priceTemp.FullDayExtraServiceItems.push(vm.RoomExtraServiceItems[index2]);
                                        }
                                    }
                                    // calcula for totalPriceFullDay
                                    if (vm.priceList.planListFullDayFormula[index].formula && vm.priceList.planListFullDayFormula[index].formula.FormulaValue)
                                        vm.priceList.totalPriceFullDay = vm.priceList.totalPriceFullDay + vm.priceList.planListFullDayFormula[index].formula.FormulaValue;
                                };
                                //trường hợp khi thêm dịch vụ ngày 15, past Check Out Departure 14 ->Thanh toán (hiện thị theo ngày)
                                if (vm.RoomExtraServices.length > 0) {
                                    angular.forEach(vm.RoomExtraServices, function(arr) {
                                        var lastIndex = vm.priceList.planListFullDayFormula.length - 1;
                                        var lastPriceTemp = vm.priceList.planListFullDayFormula[lastIndex];
                                        if (arr.CreatedDate.getTime() > lastPriceTemp.range.End.getTime() + 60000) {
                                            var lastDate = lastPriceTemp.range.End.format("dd-mm-yyyy");
                                            var DateES = arr.CreatedDate.format("dd-mm-yyyy");
                                            if (lastDate == DateES) {
                                                if (lastPriceTemp.FullDayExtraServices)
                                                    lastPriceTemp.FullDayExtraServices.push(arr);
                                                else {
                                                    lastPriceTemp.FullDayExtraService = [];
                                                    lastPriceTemp.FullDayExtraServices.push(arr);
                                                }
                                            } else {

                                                var newPlanListFullDayFormula = {
                                                    range: {
                                                        Start: angular.copy(arr.CreatedDate),
                                                        End: angular.copy(arr.CreatedDate),
                                                    },
                                                    FullDayExtraServices: [arr]
                                                };
                                                vm.priceList.planListFullDayFormula.push(newPlanListFullDayFormula);
                                            }
                                        }
                                    })
                                }

                                if (vm.RoomExtraServiceItems.length > 0) {
                                    angular.forEach(vm.RoomExtraServiceItems, function(arr) {
                                        var lastIndex = vm.priceList.planListFullDayFormula.length - 1;
                                        var lastPriceTemp = vm.priceList.planListFullDayFormula[lastIndex];
                                        if (arr.CreatedDate.getTime() > lastPriceTemp.range.End.getTime() + 60000) {
                                            var lastDate = lastPriceTemp.range.End.format("dd-mm-yyyy");
                                            var DateES = arr.CreatedDate.format("dd-mm-yyyy");
                                            if (lastDate == DateES) {
                                                if (lastPriceTemp.FullDayExtraServiceItems)
                                                    lastPriceTemp.FullDayExtraServiceItems.push(arr);
                                                else {
                                                    lastPriceTemp.FullDayExtraServiceItems = [];
                                                    lastPriceTemp.FullDayExtraServiceItems.push(arr);
                                                }
                                            } else {
                                                var newPlanListFullDayFormula = {
                                                    range: {
                                                        Start: angular.copy(arr.CreatedDate),
                                                        End: angular.copy(arr.CreatedDate),
                                                    },
                                                    FullDayExtraServiceItems: [arr]
                                                };
                                                vm.priceList.planListFullDayFormula.push(newPlanListFullDayFormula);
                                            }
                                        }
                                    })
                                }
                            }
                            vm.priceList.planListHourlyFormula.FullDayExtraServices = [];
                            vm.priceList.planListHourlyFormula.FullDayExtraServiceItems = [];
                            if (vm.priceList.planListHourlyFormula && vm.priceList.planListHourlyFormula.finalHourlyFormula) {
                                for (var index in vm.RoomExtraServices) {
                                    if (vm.priceList.planListHourlyFormula.finalHourlyFormula.Range) {
                                        if (vm.priceList.planListHourlyFormula.finalHourlyFormula.Range.Start.getTime() < vm.RoomExtraServices[index].CreatedDate.getTime() && vm.RoomExtraServices[index].CreatedDate.getTime() <= vm.priceList.planListHourlyFormula.finalHourlyFormula.Range.End.getTime() + 60000) {

                                            vm.priceList.planListHourlyFormula.FullDayExtraServices.push(vm.RoomExtraServices[index]);
                                        }
                                    }
                                }
                            }
                            if (vm.priceList.planListHourlyFormula && vm.priceList.planListHourlyFormula.finalHourlyFormula) {
                                for (var index in vm.RoomExtraServiceItems) {
                                    if (vm.priceList.planListHourlyFormula.finalHourlyFormula.Range) {
                                        if (vm.priceList.planListHourlyFormula.finalHourlyFormula.Range.Start.getTime() < vm.RoomExtraServiceItems[index].CreatedDate.getTime() && vm.RoomExtraServiceItems[index].CreatedDate.getTime() <= vm.priceList.planListHourlyFormula.finalHourlyFormula.Range.End.getTime() + 60000) {

                                            vm.priceList.planListHourlyFormula.FullDayExtraServiceItems.push(vm.RoomExtraServiceItems[index]);
                                        }
                                    }
                                }
                            }
                            walkInFactory.setPriceList(vm.priceList);
                        }
                    }
                //}, 0);


            });
        }
        $scope.$on('InitWalkin_PriceList', function(e) {
            InitWalkin_PriceList();
        });

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

            if (data.planListFullDayFormula && data.day > 0 && data.planListFullDayFormula.length > 0) {
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
    }]);