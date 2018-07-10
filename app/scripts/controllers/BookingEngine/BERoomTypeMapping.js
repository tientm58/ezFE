ezCloud.controller('BERoomTypeMappingController', ['$scope', '$rootScope', '$state', 'dialogService', '$localStorage', '$http', '$sessionStorage', 'loginFactory', '$mdDialog', 'flowFactory', '$filter', '$mdSidenav', '$mdMedia', 'configFactory', '$q', '$location', '$log', 'roomListFactory', 'frontOfficeFactory', '$timeout', 'BEFactory',
    function ($scope, $rootScope, $state, dialogService, $localStorage, $http, $sessionStorage, loginFactory, $mdDialog, flowFactory, $filter, $mdSidenav, $mdMedia, configFactory, $q, $location, $log, roomListFactory, frontOfficeFactory, $timeout, BEFactory) {
        function Init() {
            jQuery(document).unbind('keydown');
            if (BEFactory.checkIfBEModuleActive()) {
                BEFactory.get_CMRoomTypeMappings_CMRoomTypes(function (data) {
                    $scope.mappedRoomTypes = data;
                    console.log("$scope.CMRoomTypeMappings_CMRoomTypes", $scope.mappedRoomTypes);
                });
            }
        }
        Init();
        $scope.mapMoreCMRoomType = function (roomType) {
            var allStr = $scope.mappedRoomTypes[$scope.mappedRoomTypes.length - 2];
            var roomTypeTemp = angular.copy(roomType);
            var allotId = 0;
            $mdDialog.show({
                controller: MapMoreCMRoomTypeDialogController,
                resolve: {
                    roomType: function () {
                        return roomTypeTemp;
                    },
                    currentAllot: function () {
                        return allotId;
                    }
                },
                templateUrl: 'views/templates/mapMoreCMRoomType.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: null,
                clickOutsideToClose: false
            }).then(function (availableRoomTypeMapping) {
                var cmRoomTypeId = availableRoomTypeMapping[0].CMRoomTypeId;
                var roomFind = _.findWhere(allStr, {
                    room_id: cmRoomTypeId
                });
                var allotId = 0;
                if (roomFind != null) {
                    if (roomFind.avais != null) {
                        allotId = roomFind.avais.length > 0 ? roomFind.avais[0].avai_id : 0;
                    }
                    availableRoomTypeMapping[0].Priority = allotId;
                }
                if (availableRoomTypeMapping != null && availableRoomTypeMapping.length > 0) {
                    var AddCMRoomTypeMapping = loginFactory.securedPostJSON("api/BookingEngine/AddCMRoomTypeMapping", availableRoomTypeMapping[0]);
                    $rootScope.dataLoadingPromise = AddCMRoomTypeMapping;
                    AddCMRoomTypeMapping.success(function (data) {
                        dialogService.toast("MAPPING_ROOM_TYPE_SUCCESSFUL");
                        Init();
                    }).error(function (error) {
                        console.log(err);
                    });
                }

            }, function () { });

            function MapMoreCMRoomTypeDialogController($scope, $mdDialog, loginFactory, dialogService, roomType, currentAllot) {
                function Init() {
                    $scope.roomType = roomType;
                    $scope.currentAllot = currentAllot;
                    /* $scope.resultCMRoomRateMapping = {
                         CMRoomRateMappingId: null,
                         RoomPriceId: null,
                         RoomTypeId: null,

                     }*/
                    // console.log("MAPPING ROOM TYPE", $scope.roomType);
                    $scope.availableRoomTypeMapping = [];
                    if ($scope.roomType.AvailableRoomTypeMapping != null) {
                        for (var index in $scope.roomType.AvailableRoomTypeMapping) {
                            var availableTemp = $scope.roomType.AvailableRoomTypeMapping[index];
                            var availableRoomTypeMapping = {
                                CMRoomTypeMappingId: 0,
                                RoomTypeId: $scope.roomType.RoomType.RoomTypeId,
                                CMRoomTypeId: parseInt(index),
                                CMRoomTypeName: availableTemp.CMRoomTypeName,
                                IsSelected: false,
                                IsCurrentRoomType: false,
                                IsDisabled: false,
                                Priority: $scope.currentAllot
                            };
                            if ($scope.roomType.MappedTo != null && $scope.roomType.MappedTo.length > 0) {
                                availableRoomTypeMapping.CMRoomTypeMappingId = $scope.roomType.MappedTo[0].CMRoomTypeMappingId;
                            }
                            if (availableTemp.RoomTypeMapped == null) {
                                availableRoomTypeMapping.RoomTypeMappedId = null;
                                availableRoomTypeMapping.RoomTypeMappedName = null;
                                availableRoomTypeMapping.IsSelected = false;
                            } else {
                                if (availableTemp.RoomTypeMapped.RoomTypeId != $scope.roomType.RoomType.RoomTypeId) {
                                    availableRoomTypeMapping.IsDisabled = true;
                                }
                                availableRoomTypeMapping.RoomTypeMappedId = availableTemp.RoomTypeMapped.RoomTypeId;
                                availableRoomTypeMapping.RoomTypeMappedName = availableTemp.RoomTypeMapped.RoomTypeName;
                                if (availableTemp.RoomTypeMapped.RoomTypeId == $scope.roomType.RoomType.RoomTypeId) {
                                    availableRoomTypeMapping.IsSelected = true;
                                    availableRoomTypeMapping.IsCurrentRoomType = true;
                                }
                            }
                            $scope.availableRoomTypeMapping.push(availableRoomTypeMapping);
                        }
                        var index = _.filter($scope.availableRoomTypeMapping, function (item) {
                            return item.IsCurrentRoomType == true;
                        });
                        if (index != null && index.length > 0) {
                            $scope.resultIndex = index[0].CMRoomTypeId;
                        };
                        //console.log("result index", $scope.resultIndex);
                    }
                    console.log("$scope.availableRoomTypeMapping", $scope.availableRoomTypeMapping);
                }
                Init();
                $scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
                $scope.saveRoomTypeMapping = function () {
                    /* var availableTemp = angular.copy($scope.availableRoomTypeMapping);
                     var availableTemp = _.filter($scope.availableRoomTypeMapping, function(item) {
                         return (item.IsDisabled == false)
                     });*/
                    var availableTemp = _.filter($scope.availableRoomTypeMapping, function (item) {
                        return item.CMRoomTypeId == $scope.resultIndex;
                    });
                    console.log("availableTemp", availableTemp);
                    $mdDialog.hide(availableTemp);
                    //$mdDialog.hide(availableTemp);
                }
            }
        }
        $scope.mapMoreCMRoomRate = function (roomPrice) {
            console.log("ROOM PRICE", angular.copy(roomPrice));
            var roomPriceTemp = angular.copy(roomPrice);
            //console.log("ROOM PRICE", roomPriceTemp);
            $mdDialog.show({
                controller: MapMoreCMRoomRateDialogController,
                resolve: {
                    roomPrice: function () {
                        return roomPriceTemp;
                    }
                },
                templateUrl: 'views/templates/mapMoreCMRoomRate.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: null,
                clickOutsideToClose: false
            }).then(function (availableRoomRateMapping) {

                if (availableRoomRateMapping != null && availableRoomRateMapping.length > 0) {
                    var AddCMRoomRateMapping = loginFactory.securedPostJSON("api/BookingEngine/AddCMRoomRateMapping", availableRoomRateMapping[0]);
                    $rootScope.dataLoadingPromise = AddCMRoomRateMapping;
                    AddCMRoomRateMapping.success(function (data) {
                        dialogService.toast("MAPPING_RATE_SUCCESSFUL");
                        Init();
                    }).error(function (error) {
                        console.log(err);
                    })
                }



            }, function () { });

            function MapMoreCMRoomRateDialogController($scope, $mdDialog, loginFactory, dialogService, roomPrice) {
                function Init() {
                    $scope.roomPrice = roomPrice;
                    $scope.data = roomPrice.CMRoomRateMapping;
                    console.log("MAPPING ROOM TYPE", $scope.roomPrice);
                    $scope.availableRoomRateMapping = [];
                    if ($scope.roomPrice.AvailableRateMapping != null) {
                        for (var index in $scope.roomPrice.AvailableRateMapping) {
                            var availableTemp = $scope.roomPrice.AvailableRateMapping[index];
                            console.log("AVAILABLE TEMP", availableTemp);
                            var availableRoomRateMapping = {
                                CMRoomRateMappingId: 0,
                                RoomPriceId: $scope.roomPrice.RoomPrice.RoomPriceId,
                                RoomTypeId: $scope.roomPrice.RoomPrice.RoomTypeId,
                                CMRoomRateId: availableTemp.rate_id,
                                CMRoomRateName: availableTemp.rate_name,
                                IsCurrentRoomPrice: false,
                                IsDisabled: false,
                                RoomPriceMappedId: availableTemp.RoomPriceMappedId,
                                RoomPriceMappedName: availableTemp.RoomPriceMappedName
                            };
                            if ($scope.roomPrice.CMRoomRateMapping != null) {
                                availableRoomRateMapping.CMRoomRateMappingId = $scope.roomPrice.CMRoomRateMapping.CMRoomRateMappingId;
                            }

                            if (availableTemp.RoomPriceMappedId == $scope.roomPrice.RoomPrice.RoomPriceId) {
                                availableRoomRateMapping.IsCurrentRoomPrice = true;
                            }
                            $scope.availableRoomRateMapping.push(availableRoomRateMapping);
                        }

                        var index = _.filter($scope.availableRoomRateMapping, function (item) {
                            return item.IsCurrentRoomPrice == true;
                        });
                        if (index != null && index.length > 0) {
                            $scope.resultIndex = index[0].CMRoomRateId;
                        };
                        console.log("result index", $scope.resultIndex);
                    }
                    console.log("$scope.availableRoomRateMapping", $scope.availableRoomRateMapping);
                }
                Init();
                $scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
                $scope.saveRoomRateMapping = function () {
                    /*var availableTemp = angular.copy($scope.availableRoomTypeMapping);
                    var availableTemp = _.filter($scope.availableRoomTypeMapping, function(item) {
                        return (item.IsDisabled == false)
                    });*/

                    var availableTemp = _.filter($scope.availableRoomRateMapping, function (item) {
                        return item.CMRoomRateId == $scope.resultIndex;
                    });
                    console.log("availableTemp", availableTemp);
                    $mdDialog.hide(availableTemp);
                }
            }
        };
        $scope.removeCMRoomType = function (roomType) {
            dialogService.confirm("WARNING", "DO_YOU_WANT_TO_REMOVE_ROOM_TYPE_AND_ROOM_RATE_CHANNEL_MANAGER" + "?").then(function () {
                var RoomTypeId = angular.copy(roomType.MappedTo[0].CMRoomTypeMappingId);
                BEFactory.removeCMRoomTypeMapping(RoomTypeId);
            });
        };
        $scope.removeCMRoomRate = function (roomPrice) {
            console.info(roomPrice);
            dialogService.confirm("WARNING", "DO_YOU_WANT_TO_REMOVE_ROOM_RATE_CHANNEL_MANAGER" + "?").then(function () {
                var CMRoomRateMappingId = angular.copy(roomPrice.CMRoomRateMapping.CMRoomRateMappingId);
                BEFactory.removeCMRoomRateMapping(CMRoomRateMappingId);
            });
        }
    }
]);