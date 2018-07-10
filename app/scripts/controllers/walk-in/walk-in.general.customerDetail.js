ezCloud.controller('WalkinGeneralCustomerCtrl', ['$scope', '$mdBottomSheet', '$rootScope', '$log', 'commonFactory', 'loginFactory', '$stateParams', 'roomListFactory', 'dialogService', '$state', '$mdDialog', '$locale', '$filter', '$localStorage', 'configFactory', '$mdMedia', 'smartCardFactory', '$timeout', '$location', 'reservationFactory', 'walkInFactory',
    function($scope, $mdBottomSheet, $rootScope, $log, commonFactory, loginFactory, $stateParams, roomListFactory, dialogService, $state, $mdDialog, $locale, $filter, $localStorage, configFactory, $mdMedia, smartCardFactory, $timeout, $location, reservationFactory, walkInFactory) {
        var vm = this;
        function InitWalkin_CustomerDetail(){
            walkInFactory.getReservationRoomResolved($stateParams.reservationRoomId).then(function(data) {
                vm.isCheckOut = false;
                vm.isCancel = false;
                vm.calculateAdults = 0;
                vm.calculateChildren = 0;
                if (data != null){
                    if (data.reservationInfo != null){
                        //Sharer List
                        vm.sharerList = data.reservationInfo.sharerList;
                        for (var index in vm.sharerList) {
                            if (vm.sharerList[index].customer.Birthday != null) {
                                vm.sharerList[index].customer.Birthday = new Date(vm.sharerList[index].customer.Birthday);
                            }
                        }
                        for (var index in vm.sharerList) {
                            if (vm.sharerList[index].customer.TravellerId.toString() == data.reservationInfo.customer.TravellerId.toString()) {
                                vm.sharerList[index].isMainCustomer = true;
                                break;
                            }
                        }
                        //Customer
                        vm.customer = data.reservationInfo.customer;
                        if (vm.customer != null && vm.customer.Birthday != null) {
                            vm.customer.Birthday = new Date(vm.customer.Birthday);
                        }
                        vm.room = data.reservationInfo.room;
                        if (vm.room != null){
                            vm.isCheckOut = (vm.room.BookingStatus == "CHECKOUT") ? true : false;
                            vm.isCancel = (vm.room.BookingStatus == "CANCELLED") ? true : false;
                            if (vm.room.Adults + vm.room.Child >= vm.sharerList.length) {
                                vm.calculateAdults   = vm.room.Adults;
                                vm.calculateChildren = vm.room.Child;
                            } else {
                                var children = 0;
                                var adults = 0;
                                for (var index in vm.sharerList) {
                                    if (vm.sharerList[index] && vm.sharerList[index].travellerExtraInfo.IsChild) {
                                        children = children + 1;
                                    } else {
                                        adults = adults + 1;
                                    }
                                }
                                vm.calculateAdults = adults;
                                vm.calculateChildren = children;
                            }
                            if (vm.calculateAdults != 0){
                                var currentRR = walkInFactory.getCurrentRR();
                                if (currentRR != null){
                                    currentRR.Adults = vm.calculateAdults;
                                    currentRR.Child = vm.calculateChildren;
                                    walkInFactory.setCurrentRR(currentRR);
                                }
                            }
                        }
                    }
                    if (data.RoomStatus != null){
                        vm.countries = data.RoomStatus.countries;
                    }
                }
            });
            $timeout(function() {
                walkInFactory.setCurrentCustomer(vm.customer);
            },0);
        };

        $scope.$on('InitWalkin_CustomerDetail', function(e) {
            InitWalkin_CustomerDetail();
        });

        vm.Init = function() {
            $scope.$emit("WalkinInit");
        };

    vm.addSharer = function (ev) {
        var currentCustomer = angular.copy(vm.customer);
        $mdDialog.show({
            controller: AddSharerController,
            resolve: {
                reservationRoomId: function () {
                    return $stateParams.reservationRoomId;
                },
                countries: function () {
                    return vm.countries;
                }
            },
            templateUrl: 'views/templates/addSharer.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
        }).then(function (SharerModel) {
            if (!$stateParams.reservationRoomId) {
                if (vm.sharerList.length > 0) {
                    if (_.size(_.filter(vm.sharerList, function (item) {
                            return (item.customer.TravellerId == SharerModel.customer.TravellerId)
                        })) > 0) {
                        dialogService.messageBox("SHARER_IS_ALREADY_EXISTS");
                    } else {
                        vm.sharerList.push(SharerModel);
                    }
                } else {
                    vm.sharerList.push(SharerModel);
                }
            } else {
                if (SharerModel.customer.TravellerId && _.size(_.filter(vm.sharerList, function (item) {
                        if (item.customer.TravellerId) {
                            return (item.customer.TravellerId == SharerModel.customer.TravellerId);
                        }

                    })) > 0) {
                    dialogService.messageBox("SHARER_IS_ALREADY_EXISTS");
                } else {
                    if ($stateParams.reservationRoomId) {
                        var saveSharerInfor = loginFactory.securedPostJSON("api/Room/AddSharer", SharerModel);
                        $rootScope.dataLoadingPromise = saveSharerInfor;
                        saveSharerInfor.success(function (data) {
                            dialogService.toast("SHARER_ADDED_SUCCESSFUL");
                            vm.Init();
                        }).error(function (err) {
                            console.log(err);
                        });
                    } else {
                        vm.sharerList.push(SharerModel);
                    }
                }
            }
        }, function () {});
        function AddSharerController($scope, $mdDialog, reservationRoomId, countries) {
            $scope.sharer = {};

            function Init() {
                $scope.DateTimePickerOption = {
                    format: 'dd/MM/yyyy HH:mm'
                };
                $scope.DatePickerOption = {
                    format: 'dd/MM/yyyy'
                };
                $scope.Countries = countries;
                $scope.isChild = false;
                var customerList = loginFactory.securedGet("api/Room/AllCustomer");
                customerList.success(function (data) {
                    $scope.customerList = data;
                }).error(function (err) {
                    console.log(err);
                });
            }
            Init();

            $scope.sharerContainsSearchText = function (customer) {
                $scope.found = false;
                var fullNameQuery = (customer.Fullname != null) ? customer.Fullname.indexOf($scope.sharer.Fullname) >= 0 : null;
                var identityNumberQuery = (customer.IdentityNumber != null) ? customer.IdentityNumber.indexOf($scope.sharer.IdentityNumber) >= 0 : null;
                var mobileQuery = (customer.Mobile != null) ? customer.Mobile.indexOf($scope.sharer.Mobile) >= 0 : null;
                var emailQuery = (customer.Email != null) ? customer.Email.indexOf($scope.sharer.Email) >= 0 : null;
                var result = fullNameQuery || identityNumberQuery || mobileQuery || emailQuery;
                return result;
            };

            $scope.bindingSelectedSharer = function (cus) {
                var customerBinding = {};
                $scope.sharer.TravellerId = cus.TravellerId;
                $scope.sharer.Fullname = cus.Fullname;
                $scope.sharer.Gender = cus.Gender;
                $scope.sharer.Birthday = cus.Birthday;
                $scope.sharer.IdentityNumber = cus.IdentityNumber;
                $scope.sharer.Mobile = cus.Mobile;
                $scope.sharer.Email = cus.Email;
                $scope.sharer.Address = cus.Address;
            };

            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.lookUpSharer = function () {

            };

            $scope.addSharerInformation = function () {
                var travellerExtraInfo = {
                    IsChild: $scope.isChild
                }
                var SharerModel = {
                    customer: $scope.sharer,
                    reservationRoomId: $stateParams.reservationRoomId,
                    travellerExtraInfo: travellerExtraInfo
                }
                $mdDialog.hide(SharerModel);
            }

            $scope.selectedItemChange = function (item) {
                $scope.sharer = item;
            }
        }
    }



    vm.editCustomer = function (ev) {
        var customerTemp = angular.copy(vm.customer);
        var customerTemp2 = angular.copy(vm.customer);
        var index;

        $mdDialog.show({
            controller: EditCustomerController,
            resolve: {
                currentCustomer: function () {
                    return customerTemp;
                },
                countries: function () {
                    return vm.countries;
                }
            },
            templateUrl: 'views/templates/editCustomer.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
        }).then(function (SharerViewModel) {
            var save = loginFactory.securedPostJSON("api/Room/EditSharerInfo", SharerViewModel);
            $rootScope.dataLoadingPromise = save;
            save.success(function (data2) {
                dialogService.toast("CUSTOMER_EDITED_SUCCESSFUL");
                vm.Init();
            }).error(function (err) {
                console.log(err);
            });

        }, function () {});
        function EditCustomerController($scope, $mdDialog, currentCustomer, countries) {
            function Init() {
                $scope.DatePickerOption = {
                    format: 'dd/MM/yyyy'
                };
                $scope.customer = currentCustomer;
                $scope.Countries = countries;
                if ($scope.customer.Birthday) {
                    $scope.customer.Birthday = new Date($scope.customer.Birthday);
                    $scope.dateString = $scope.customer.Birthday.format('dd/mm/yyyy');
                }
            }

            Init();

            $scope.saveCustomer = function () {
                var SharerViewModel = {
                    customer: $scope.customer,
                    reservationRoomId: $stateParams.reservationRoomId,
                    travellerExtraInfo: null
                }
                $mdDialog.hide(SharerViewModel);
            }

            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
        }
    };



    vm.deleteSharer = function (sharer) {
        dialogService.confirm("DELETE_CONFIRM", "DO_YOU_WANT_TO_REMOVE_THIS_SHARER").then(function () {
            var removeSharer = loginFactory.securedPostJSON("api/Room/RemoveSharer?sharerId=" + sharer.customer.TravellerId + "&reservationRoomId=" + $stateParams.reservationRoomId, "");
            $rootScope.dataLoadingPromise = removeSharer;
            removeSharer.success(function (data) {
                dialogService.toast("SHARER_REMOVED_SUCCESSFUL");
                vm.Init();
            }).error(function (err) {
                console.log(err);
            })
        });
    };

    vm.setMainCustomer = function (sharer) {
        var customerTemp = angular.copy(vm.customer);
        dialogService.confirm("CONFIRM", "DO_YOU_WANT_TO_SET_THIS_SHARER_TO_MAIN_CUSTOMER" + "?").then(function () {
            var setMainCustomer = loginFactory.securedPostJSON("api/Room/SetMainCustomer?sharerId=" + sharer.customer.TravellerId + "&reservationRoomId=" + $stateParams.reservationRoomId, "");
            $rootScope.dataLoadingPromise = setMainCustomer;
            setMainCustomer.success(function (data) {
                vm.customer = sharer.customer;
                dialogService.toast("MAIN_CUSTOMER_CHANGED_SUCCESSFUL");
                vm.Init();
            }).error(function (err) {
                console.log(err);
            })
        });
    };


    vm.editSharer = function (ev, sharer) {
        var index = vm.sharerList.indexOf(sharer);
        var sharerTemp = angular.copy(vm.sharerList[index]);
        $mdDialog.show({
            controller: EditSharerController,
            resolve: {
                currentSharer: function () {
                    return sharerTemp;
                },
                countries: function () {
                    return vm.countries;
                }
            },
            templateUrl: 'views/templates/editSharer.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
        }).then(function (SharerModel) {
            var SharerViewModel = {
                customer: SharerModel.sharer,
                reservationRoomId: $stateParams.reservationRoomId,
                travellerExtraInfo: SharerModel.travellerExtraInfo
            }
            var saveSharerInfor = loginFactory.securedPostJSON("api/Room/EditSharerInfo", SharerViewModel);
            $rootScope.dataLoadingPromise = saveSharerInfor;
            saveSharerInfor.success(function (data) {
                dialogService.toast("SHARER_EDITED_SUCCESSFUL");
                vm.Init();
            }).error(function (err) {

            });

        }, function () {});

        function EditSharerController($scope, $rootScope, $mdDialog, currentSharer, countries) {
            function Init() {
                $scope.DatePickerOption = {
                    format: 'dd/MM/yyyy'
                };
                $scope.sharer = currentSharer;
                $scope.isChild = currentSharer.travellerExtraInfo.IsChild;
                $scope.Countries = countries;
                if ($scope.sharer.Birthday) {
                    $scope.sharer.Birthday = new Date($scope.sharer.Birthday);
                    $scope.dateString = $scope.sharer.Birthday.format('dd/mm/yyyy');
                }
            }
            Init();

            $scope.saveSharer = function () {
                var travellerExtraInfo = {
                    isChild: $scope.isChild
                };
                var SharerModel = {
                    sharer: $scope.sharer.customer,
                    travellerExtraInfo: travellerExtraInfo
                };
                $mdDialog.hide(SharerModel);
            }

            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
        }
    }


}]);