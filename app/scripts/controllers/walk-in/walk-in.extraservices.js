ezCloud.controller('WalkinExtraServicesCtrl', ['$scope', '$mdBottomSheet', '$rootScope', '$log', 'commonFactory', 'loginFactory', '$stateParams', 'roomListFactory', 'dialogService', '$state', '$mdDialog', '$locale', '$filter', '$localStorage', 'configFactory', '$mdMedia', 'smartCardFactory', '$timeout', '$location', 'reservationFactory', 'walkInFactory',
    function($scope, $mdBottomSheet, $rootScope, $log, commonFactory, loginFactory, $stateParams, roomListFactory, dialogService, $state, $mdDialog, $locale, $filter, $localStorage, configFactory, $mdMedia, smartCardFactory, $timeout, $location, reservationFactory, walkInFactory) {
        var vm = this;
        vm.page={
            searchES:''
        }
        function InitWalkin_ExtraService(){
            $scope.$mdMedia = $mdMedia;
            console.info("extraservices init");
            vm.hasRRIDParam = ($stateParams.reservationRoomId) ? true : false;
            vm.decimal = $rootScope.decimals;
            vm.showDetailAvailable = false;
            vm.extraServiceNoItem = {
                Quantity: 1
            };
            vm.selectedExtraServiceCategory = 0;
            walkInFactory.getReservationRoomResolved($stateParams.reservationRoomId).then(function(data){
                if (data != null){
                    if (data.reservationInfo != null){
                        vm.room = data.reservationInfo.room;
                        vm.isCheckOut = (vm.room.BookingStatus === "CHECKOUT") ? true : false;
                        vm.isCancel = (vm.room.BookingStatus === "CANCELLED") ? true : false;
                        vm.listUser = data.reservationInfo.ListUser;
                    }
                    if (data.RoomStatus.ExtraService != null){
                        resolveDefaultExtraServices(data.RoomStatus.ExtraService);
                    }
                    var extraservices = data.reservationInfo.roomExtraServices;
                    if (extraservices != null && extraservices.length > 0){
                        for (var idx in extraservices) {
                            extraservices[idx].CreatedDate = new Date(extraservices[idx].CreatedDate);
                            extraservices[idx].willPay = true;
                        }
                    }
                    vm.RoomExtraServices = extraservices;
                    if (vm.listUser && vm.listUser.length > 0) {
                        for (var index in vm.RoomExtraServices) {
                            vm.RoomExtraServices[index].isHide = false;
                            if (vm.RoomExtraServices[index].DeletedDate) {
                                vm.RoomExtraServices[index].DeletedDate = new Date(vm.RoomExtraServices[index].DeletedDate);
                                vm.RoomExtraServices[index].isHide = true;
                            }

                            for (var i = 0; i < vm.listUser.length; i++) {
                                var user = vm.listUser[i];
                                if (user.UserId == vm.RoomExtraServices[index].CreatedUserId) {
                                    if (user.Email)
                                        vm.RoomExtraServices[index].UserName = user.Email;
                                    else
                                        vm.RoomExtraServices[index].UserName = user.StaffName;
                                }
                                if (vm.RoomExtraServices[index].IsDeleted && user.UserId == vm.RoomExtraServices[index].DeletedBy) {
                                    if (user.Email)
                                        vm.RoomExtraServices[index].UserNameDeleted = user.Email;
                                    else
                                        vm.RoomExtraServices[index].UserNameDeleted = user.StaffName;
                                }
                            }
                        }
                    }

                    vm.RoomExtraServiceItems = data.reservationInfo.roomExtraServiceItems;
                    vm.ExtraServiceItems     = data.reservationInfo.extraServiceItems;

                    vm.ExtraServices = data.reservationInfo.extraServices;
                    for (var index in vm.RoomExtraServiceItems) {
                        vm.RoomExtraServiceItems[index].isHide = false;
                        for (var i = 0; i < vm.ExtraServiceItems.length; i++) {
                            if (vm.RoomExtraServiceItems[index].ExtraServiceItemId == vm.ExtraServiceItems[i].ExtraServiceItemId) {
                                vm.RoomExtraServiceItems[index].ExtraServiceItemName = vm.ExtraServiceItems[i].ExtraServiceItemName;
                                for (var index2 in vm.ExtraServices) {
                                    if (vm.ExtraServices[index2].ExtraServiceTypeId == vm.ExtraServiceItems[i].ExtraServiceTypeId) {
                                        vm.RoomExtraServiceItems[index].ExtraServiceTypeName = vm.ExtraServices[index2].ExtraServiceTypeName;
                                        break;
                                    }
                                }
                                for (var index3 in vm.RoomExtraServices)
                                    if (vm.RoomExtraServices[index3].RoomExtraServiceId == vm.RoomExtraServiceItems[index].RoomExtraServiceId) {
                                        vm.RoomExtraServiceItems[index].CreatedDate = new Date(vm.RoomExtraServices[index3].CreatedDate);
                                        break;
                                    }
                                break;
                            }
                        }

                        if (vm.RoomExtraServices && vm.RoomExtraServices.length > 0) {
                            for (var i = 0; i < vm.RoomExtraServices.length; i++) {
                                if (vm.RoomExtraServices[i].RoomExtraServiceId.toString() === vm.RoomExtraServiceItems[index].RoomExtraServiceId.toString()) {
                                    vm.RoomExtraServiceItems[index].UserName = vm.RoomExtraServices[i].UserName;
                                    break;
                                }
                            }
                        }

                        if (vm.RoomExtraServiceItems[index].IsDeleted) {
                            vm.RoomExtraServiceItems[index].DeletedDate = new Date(vm.RoomExtraServiceItems[index].DeletedDate);
                            vm.RoomExtraServiceItems[index].isHide = true;

                            if (vm.listUser && vm.listUser.length > 0) {
                                for (var i = 0; i < vm.listUser.length; i++) {
                                    var user = vm.listUser[i];
                                    if (user.UserId === vm.RoomExtraServiceItems[index].DeletedBy) {
                                        if (user.Email)
                                            vm.RoomExtraServiceItems[index].DeletedByUserName = user.Email;
                                        else
                                            vm.RoomExtraServiceItems[index].DeletedByUserName = user.StaffName;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
                walkInFactory.setRoomExtraServices(vm.RoomExtraServices);
                walkInFactory.setRoomExtraServiceItems(vm.RoomExtraServiceItems);

            });

        }

        $scope.$on('InitWalkin_ExtraService', function(e) {
            InitWalkin_ExtraService();
        });

        vm.Init = function() {
            $scope.$emit("WalkinInit");
        };

        $scope.$watchCollection('extraservice.selectedExtraServiceType', function (newValue, oldValue) {
            if (newValue != null && newValue != undefined && newValue.ExtraServiceTypeName != 'EXTRA_SERVICES' && newValue.quantity == 0) {
                vm.extraservice.selectedExtraServiceType.quantity = 1;
            }
        });

        vm.onSelectESType = function () {
            vm.extraservice.selectedExtraServiceCategory = 0;
        }

        vm.onChangeESType = function () {
            if (vm.extraservice.selectedExtraServiceType.ExtraServiceTypeName) {
                for (var idx in vm.extraservice.ExtraServiceItems) {
                    vm.extraservice.ExtraServiceItems[idx].quantity = 0;
                }
            }
        }

        vm.initESTab = function(){
            vm.selectedExtraServiceCategory = 0;
        };

        function resolveDefaultExtraServices(data) {
            for (var idx in data.ExtraServiceTypes) {
                data.ExtraServiceTypes[idx].IsHide = true;
                var countItem = data.ExtraServiceItems.filter(function(item) {
                    return data.ExtraServiceTypes[idx].ExtraServiceTypeId == item.ExtraServiceTypeId;
                });
                if (countItem.length > 0) {
                    data.ExtraServiceTypes[idx].IsHide = false;
                }
            }

            vm.extraservice = angular.copy(data);

            for (var index in vm.extraservice.ExtraServiceItems) {
                if (!vm.extraservice.ExtraServiceItems[index].quantity) {
                    vm.extraservice.ExtraServiceItems[index].quantity = 0;
                }
                for (var index2 in vm.extraservice.ExtraServiceTypes) {
                    if (vm.extraservice.ExtraServiceTypes[index2].ExtraServiceTypeId == vm.extraservice.ExtraServiceItems[index].ExtraServiceTypeId) {
                        vm.extraservice.ExtraServiceItems[index].ExtraServiceTypeName = vm.extraservice.ExtraServiceTypes[index2].ExtraServiceTypeName;
                        break;
                    }
                }
            }
            var item = {
                ExtraServiceTypeName: 'EXTRA_SERVICES',
                ExtraServiceItemName: 'ADD_NEW_ITEM'
            };
            vm.extraservice.ExtraServiceItems.push(item);
        }

        vm.showDetailAvailable = false;
        vm.addExtraService = function (ev) {
            var keys = ["RES_NO", "ROOM", "NOTIFICATION_POST_EXTRASERVICE", "EXTRA_SERVICE"];
            var languageKeys = {};
            for (var idx in keys) {
                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
            }
            var items = [];

            if (vm.extraServiceNoItem != null && (vm.extraServiceNoItem.RoomExtraServiceDescription != undefined || vm.extraServiceNoItem.Amount != undefined )) {
                if(vm.extraServiceNoItem.Amount == undefined  || vm.extraServiceNoItem.RoomExtraServiceDescription==undefined || vm.extraServiceNoItem.RoomExtraServiceDescription.length==0 ){
                    dialogService.messageBox("MISSING_EXTRA_SERVICE", "PLEASE_FILL_NAME_AND_PRICE_OF_EXTRA_SERVICES");
                    return ;
                };
                if(vm.extraServiceNoItem.Quantity == undefined || vm.extraServiceNoItem.Quantity  <= 0 ){
                    dialogService.messageBox("MISSING_EXTRA_SERVICE_QUANTITY", "PLEASE_FILL_QUANTITY_OF_EXTRA_SERVICES");
                    return ;
                };
            };
            //
            angular.forEach(vm.extraservice.ExtraServiceItems, function(arr) {
                if (arr.quantity > 0) {
                    var item = {
                        quantity: arr.quantity,
                        item: arr,
                        ExtraServiceTypeName: arr.ExtraServiceTypeName
                    };
                    items.push(item);
                };
            });

            if (items.length == 0 && vm.extraServiceNoItem.Amount == undefined ) {
                dialogService.messageBox("MISSING_ITEM", "PLEASE_SELECT_AT_LEAST_ONE_ITEM");
                return;
            }
            //$rootScope.items = items;
            AddESDialogController.$inject = ['$scope', '$mdDialog', 'extraServiceNoItem', 'items'];
            function AddESDialogController($scope, $mdDialog, extraServiceNoItem, items) {
                $scope.items = items;
                $scope.extraServiceNoItem = extraServiceNoItem;
                if (_.size($scope.extraServiceNoItem) == 0) {
                    $scope.extraServiceNoItem = null;
                }
                $scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
                $scope.ok = function () {
                    $mdDialog.hide();
                };
                $scope.getTotal = function (items,extraServiceNoItem) {
                    var total = 0;
                    if(items!=null && items.length>0){
                        for (var idx in items) {
                            total += items[idx].item.Price * items[idx].quantity;
                        }
                    }
                    if(extraServiceNoItem != null && extraServiceNoItem.Amount != null){
                        total+=( extraServiceNoItem.Amount * extraServiceNoItem.Quantity);
                    }
                    return total;
                };
            }
            $mdDialog.show({
                    controller: AddESDialogController,
                    templateUrl: 'views/reservation/subtemplates/extraserviceConfirm.html',
                    resolve: {
                        extraServiceNoItem: function () {
                            return vm.extraServiceNoItem;
                        },
                        items: function () {
                            return items;
                        }
                    },
                    parent: angular.element(document.body),
                    targetEvent: ev,
                })
                .then(function () {
                    vm.showDetailAvailable = true;
                    var postItems = {};
                    if (vm.hasRRIDParam) {
                        if (items.length != 0) {
                            var postItems = {
                                ReservationRoomId: $stateParams.reservationRoomId,
                                description: "",
                                name: "",
                                items: items,
                                languageKeys: languageKeys
                            };
                            // var saveItems = loginFactory.securedPostJSON("api/Room/CreateExtraService", postItems);
                            var saveItems = loginFactory.securedPostJSON("api/Room/QuickCreateExtraService", postItems);
                            $rootScope.dataLoadingPromise = saveItems;
                            saveItems.success(function () {
                                for (var idx in vm.extraservice.ExtraServiceItems) {
                                    vm.extraservice.ExtraServiceItems[idx].quantity = 0;
                                }
                                if(vm.extraServiceNoItem!=null && vm.extraServiceNoItem.Amount !=null){
                                    var postItems = {
                                        ReservationRoomId: $stateParams.reservationRoomId,
                                        RoomExtraServiceName: "EXTRA_SERVICES",
                                        RoomExtraServiceDescription: vm.extraServiceNoItem.RoomExtraServiceDescription,
                                        Amount: vm.extraServiceNoItem.Amount,
                                        Quantity: vm.extraServiceNoItem.Quantity,
                                        languageKeys: languageKeys
                                    };
                                    var saveExtraServiceNoItem = loginFactory.securedPostJSON("api/Room/CreateExtraServiceNoItem", postItems);
                                    $rootScope.dataLoadingPromise = saveExtraServiceNoItem;
                                    saveExtraServiceNoItem.success(function () {
                                        vm.extraServiceNoItem = {};
                                        dialogService.toast("ADD_EXTRA_SERVICE_SUCCESSFUL");
                                        vm.Init();
                                    }).error(function (e) {
                                        dialogService.messageBox("ERROR", e.Message, ev);
                                    });
                                }else{
                                    dialogService.toast("ADD_EXTRA_SERVICE_SUCCESSFUL");
                                    $localStorage.processExtraService = true;
                                }
                                vm.Init();
                            }).error(function (e) {
                                dialogService.messageBox("ERROR", e.Message, ev);
                            });
                        } else {
                            var postItems = {
                                ReservationRoomId: $stateParams.reservationRoomId,
                                RoomExtraServiceName: "EXTRA_SERVICES",
                                RoomExtraServiceDescription: vm.extraServiceNoItem.RoomExtraServiceDescription,
                                Amount: vm.extraServiceNoItem.Amount,
                                Quantity: vm.extraServiceNoItem.Quantity,
                                languageKeys: languageKeys
                            };
                            var saveExtraServiceNoItem = loginFactory.securedPostJSON("api/Room/CreateExtraServiceNoItem", postItems);
                            $rootScope.dataLoadingPromise = saveExtraServiceNoItem;
                            saveExtraServiceNoItem.success(function () {
                                vm.extraServiceNoItem = {};
                                dialogService.toast("ADD_EXTRA_SERVICE_SUCCESSFUL");
                                vm.Init();
                            }).error(function (e) {
                                dialogService.messageBox("ERROR", e.Message, ev);
                            });
                        }
                    } else {
                        var postedItems = {};
                        var postedNoItem = [];
                        if ($rootScope.postedNoItem == null) {
                            $rootScope.postedNoItem = [];

                        };
                        if (items.length !== 0) {
                            console.info("vm.extraservice", vm.extraservice);
                            postedItems = {
                                ReservationRoomId: $stateParams.reservationRoomId,
                                description: vm.extraservice.selectedExtraServiceType.ExtraServiceTypeName + ' res:#' + $stateParams.reservationRoomId + ' room:#' + vm.room.RoomId,
                                name: vm.extraservice.selectedExtraServiceType.ExtraServiceTypeName,
                                items: items,
                                languageKeys: languageKeys
                            };
                            $rootScope.postedItems = postedItems;
                        } else {
                            var noItem = {
                                ReservationRoomId: $stateParams.reservationRoomId,
                                RoomExtraServiceName: "EXTRA_SERVICES",
                                RoomExtraServiceDescription: vm.extraServiceNoItem.RoomExtraServiceDescription,
                                Amount: vm.extraServiceNoItem.Amount,
                                languageKeys: languageKeys
                            };
                            $rootScope.postedNoItem.push(noItem);
                        }
                    }
                }, function () {
                });

        }
        vm.deleteExtraServiceItem = function (ev, item) {
            console.log(item);
            var keys = ["RES_NO", "ROOM", "NOTIFICATION_DELETE_EXTRASERVICE", "EXTRA_SERVICE"];
            var languageKeys = {};
            for (var idx in keys) {
                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
            }
            var itemTemp = angular.copy(item);
            $mdDialog.show({
                controller: DeleteExtraServiceItemDialogController,
                resolve: {
                    item: function () {
                        return itemTemp;
                    },
                },
                templateUrl: 'views/templates/deleteESItem.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: event,
            }).then(function (deleteReason) {
                console.log(deleteReason);
                itemTemp.DeletedReason = deleteReason;
                var itemDelete = {
                    roomExtraServiceItems: itemTemp,
                    languageKeys: languageKeys
                }
                var promise = loginFactory.securedPostJSON("api/Room/DeleteExtraServiceItem", itemDelete);
                $rootScope.dataLoadingPromise = promise;
                promise.success(
                    function (data) {
                        dialogService.toast("DELETE_EXTRA_SERVICE_ITEM_SUCCESSFUL");
                        $localStorage.processExtraService = true;
                        vm.Init();

                    }
                ).error(
                    function (error) {
                        dialogService.messageBox(error.Message);
                    }
                );
            }, function () {

            });


        };

        vm.deleteRoomExtraService = function (ev, item) {
            console.log(item);
            var keys = ["RES_NO", "ROOM", "NOTIFICATION_DELETE_EXTRASERVICE", "EXTRA_SERVICE"];
            var languageKeys = {};
            for (var idx in keys) {
                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
            }
            var itemTemp = angular.copy(item);
            $mdDialog.show({
                controller: DeleteExtraServiceItemDialogController,
                resolve: {
                    item: function () {
                        return itemTemp;
                    },
                },
                templateUrl: 'views/templates/deleteESItem.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: event,
            }).then(function (deleteReason) {
                console.log(deleteReason);
                itemTemp.DeletedReason = deleteReason;
                var itemDelete = {
                    roomExtraServices: itemTemp,
                    languageKeys: languageKeys
                }
                var promise = loginFactory.securedPostJSON("api/Room/DeleteExtraService", itemDelete);
                $rootScope.dataLoadingPromise = promise;
                promise.success(
                    function (data) {
                        dialogService.toast("DELETE_EXTRA_SERVICE_SUCCESSFUL");
                        vm.Init();
                    }
                ).error(
                    function (error) {
                        dialogService.messageBox(error.Message);
                    }
                );
            }, function () {

            });
        };

        function DeleteExtraServiceItemDialogController($scope, $mdDialog, item, loginFactory) {
            function Init() {
                $scope.item = item;
                $scope.deleteReason = null;
            }
            Init();

            $scope.processDelete = function () {
                $mdDialog.hide($scope.deleteReason);
            }

            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
        }

        vm.increaseItemCount = function (esi) {
            if (esi.quantity)
                esi.quantity += 1;
            else
                esi.quantity = 1;
            //vm.$apply();
        }

        vm.getExtraServicePayment = function () {

            var total = 0;
            for (var idx in vm.RoomExtraServices) {
                total += vm.RoomExtraServices[idx].Amount;
            }
            for (var idx in vm.Payments) {
                total -= vm.Payments[idx].Amount;

            }
            return total;
        }
    }]);