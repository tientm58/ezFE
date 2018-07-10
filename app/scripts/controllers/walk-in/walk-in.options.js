ezCloud.controller('WalkinOptionsCtrl', ['$scope', '$mdBottomSheet', '$rootScope', '$log', 'commonFactory', 'loginFactory', '$stateParams', 'roomListFactory', 'dialogService', '$state', '$mdDialog', '$locale', '$filter', '$localStorage', 'configFactory', '$mdMedia', 'smartCardFactory', '$timeout', '$location', 'reservationFactory', 'walkInFactory',
    function($scope, $mdBottomSheet, $rootScope, $log, commonFactory, loginFactory, $stateParams, roomListFactory, dialogService, $state, $mdDialog, $locale, $filter, $localStorage, configFactory, $mdMedia, smartCardFactory, $timeout, $location, reservationFactory, walkInFactory) {
        var vm = this;

        function InitWalkin_Option() {
            $scope.$mdMedia = $mdMedia;
            vm.hasRRIDParam = ($stateParams.reservationRoomId) ? true : false;
            vm.isCheckout = false;
            vm.isEditMarketing=false;
            vm.isAddMarketing=true;
            vm.isBusinessChanged = false;
            vm.roomRemarks = [];
            vm.selectedCompany = null;
            walkInFactory.getReservationRoomResolved($stateParams.reservationRoomId).then(function(data) {
                if (data != null){
                    if (data.RoomStatus != null){
                        // Business
                        vm.sourceList = data.RoomStatus.sourceList.sort(function(a, b) {
                            return a.Priority - b.Priority;
                        });
                        vm.companyList = data.RoomStatus.companyList.sort(function(a, b) {
                            return a.Priority - b.Priority;
                        });
                        vm.marketList = data.RoomStatus.marketList.sort(function(a, b) {
                            return a.Priority - b.Priority;
                        });
                        vm.remarkEvents = data.RoomStatus.remarkEvents;
                    }
                    if (data.reservationInfo != null){
                        if (vm.hasRRIDParam) {
                            vm.isCheckOut      = (data.reservationInfo.room.BookingStatus == "CHECKOUT") ? true : false;
                            vm.isCancel        = (data.reservationInfo.room.BookingStatus == "CANCELLED") ? true : false;
                            vm.isAddMarketing  = (data.reservationInfo.room.BookingStatus === "CHECKOUT" || (data.reservationInfo.room.BookingStatus === "CANCELLED")) ? false : true;
                            vm.isEditMarketing = (data.reservationInfo.room.BookingStatus === "CHECKOUT" || (data.reservationInfo.room.BookingStatus === "CANCELLED")) ? false : true;
                            // Business
                            if (vm.companyList != null && data.reservationInfo.company != null && vm.companyList.length > 0)
                                vm.selectedCompany = _.filter(vm.companyList, function(item) {
                                    return item.CompanyId == data.reservationInfo.company.CompanyId;
                                })[0];
                            if (vm.sourceList != null && data.reservationInfo.source != null && vm.sourceList.length > 0)
                                vm.selectedSource = _.filter(vm.sourceList, function(item) {
                                    return item.SourceId == data.reservationInfo.source.SourceId;
                                })[0];

                            if (vm.marketList != null && data.reservationInfo.market != null && vm.marketList.length > 0)
                                vm.selectedMarket = _.filter(vm.marketList, function(item) {
                                    return item.MarketId == data.reservationInfo.market.MarketId;
                                })[0];

                            // For CityLedger
                            walkInFactory.setSelectedCompanyCityLedger(vm.selectedCompany);

                            //Remark
                            vm.roomRemarks = data.reservationInfo.roomRemarks;
                            for (var index in vm.roomRemarks) {
                                if (vm.roomRemarks[index].CreatedDate) {
                                    vm.roomRemarks[index].CreatedDate = new Date(vm.roomRemarks[index].CreatedDate);
                                }
                                for (var index2 in vm.remarkEvents) {
                                    if (vm.remarkEvents[index2].RemarkEventId == vm.roomRemarks[index].RemarkEventId) {
                                        vm.roomRemarks[index].RemarkEventCode = vm.remarkEvents[index2].RemarkEventCode;
                                        break;
                                    }
                                }
                            }


                            vm.roomBreakfast = data.reservationInfo.roomBreakfast;
                            for (var index in vm.roomBreakfast) {
                                if (vm.roomBreakfast[index].UsedDate) {
                                    vm.roomBreakfast[index].UsedDate = new Date(vm.roomBreakfast[index].UsedDate);
                                }
                                if (walkInFactory.addDays(vm.roomBreakfast[index].UsedDate, 1) < new Date()) {
                                    vm.roomBreakfast[index].IsDisabled = true;
                                } else {
                                    vm.roomBreakfast[index].IsDisabled = false;
                                }
                            }
                        }
                    }
                }
            });

        }

        $scope.$on('InitWalkin_Option', function(e) {
            InitWalkin_Option();
        });

        vm.Init = function() {
            $scope.$emit("WalkinInit");
        };

        $scope.$watchCollection('[optionCtrl.selectedCompany, optionCtrl.selectedSource, optionCtrl.selectedMarket]', function(newValues, oldValues){
            if (!vm.hasRRIDParam){
                walkInFactory.setCompanyForSaved(vm.selectedCompany);
                walkInFactory.setSourceForSaved(vm.selectedSource);
                walkInFactory.setMarketForSaved(vm.selectedMarket);
                walkInFactory.setRemarksForSaved(vm.roomRemarks);
            }
            if (oldValues != null && !angular.equals(newValues, oldValues) && vm.hasRRIDParam) {
                vm.isBusinessChanged = true;
            }
        });

        vm.simulateQuery = false;

        /*$scope.$watchCollection('[optionCtrl.selectedCompany, optionCtrl.selectedSource, optionCtrl.selectedMarket]', function(newValues, oldValues) {
            if (oldValues != null && !angular.equals(newValues, oldValues) && vm.hasRRIDParam) {
                vm.isBusinessChanged = true;
            }
        });*/

        vm.saveBusiness = function() {
            if (vm.selectedCompany == undefined) {
                vm.selectedCompany = null;
            }
            var businessModel = {
                RRID: $stateParams.reservationRoomId,
                Company: vm.selectedCompany,
                Source: vm.selectedSource,
                Market: vm.selectedMarket,
            };
            var saveBusiness = loginFactory.securedPostJSON("api/Room/SaveBusiness", businessModel);
            $rootScope.dataLoadingPromise = saveBusiness;
            saveBusiness.success(function(data) {
                dialogService.toast("BUSINESS_SAVED_SUCCESSFUL");
                vm.Init();
            }).error(function(err) {
                dialogService.messageBox(err.Message);
            })
        };

        var accentMap = {
            'á': 'a',
            'é': 'e',
            'í': 'i',
            'ó': 'o',
            'ú': 'u'
        };

        function accent_fold(s) {
            if (!s) {
                return '';
            }
            var ret = '';
            for (var i = 0; i < s.length; i++) {
                ret += accentMap[s.charAt(i)] || s.charAt(i);
            }
            return ret;
        };

        function change_alias(alias) {
            var str = alias;
            str = str.toLowerCase();
            str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ  |ặ|ẳ|ẵ/g, "a");
            str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
            str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
            str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ  |ợ|ở|ỡ/g, "o");
            str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
            str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
            str = str.replace(/đ/g, "d");
            str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'| |\"|\&|\#|\[|\]|~|$|_/g, "");
            str = str.replace(/-+-/g, "");
            str = str.replace(/^\-+|\-+$/g, "");
            return str;
        }

        vm.selectedCompanyCityLedger = null;
        vm.queryCompanySearchCityLedger = queryCompanySearchCityLedger;
        vm.selectedCompanyChangeCityLedger = selectedCompanyChangeCityLedger;
        vm.searchCompanyTextChangeCityLedger = searchCompanyTextChangeCityLedger;

        vm.selectedCompany = null;
        vm.queryCompanySearch = queryCompanySearch;
        vm.selectedCompanyChange = selectedCompanyChange;
        vm.searchCompanyTextChange = searchCompanyTextChange;

        vm.selectedSource = null;
        vm.querySourceSearch = querySourceSearch;
        vm.selectedSourceChange = selectedSourceChange;
        vm.searchSourceTextChange = searchSourceTextChange;

        vm.selectedMarket = null;
        vm.queryMarketSearch = queryMarketSearch;
        vm.selectedMarketChange = selectedMarketChange;
        vm.searchMarketTextChange = searchMarketTextChange;

        function querySourceSearch(query) {
            var results = query ? vm.sourceList.filter(createSourceFilterFor(query)) : vm.sourceList,
                deferred;
            if (self.simulateQuery) {
                deferred = $q.defer();
                $timeout(function() {
                    deferred.resolve(results);
                }, Math.random() * 1000, false);
                return deferred.promise;
            } else {
                return results;
            }
        }

        function queryCompanySearch(query) {
            var results = query ? vm.companyList.filter(createCompanyFilterFor(query)) : vm.companyList,
                deferred;
            if (self.simulateQuery) {
                deferred = $q.defer();
                $timeout(function() {
                    deferred.resolve(results);
                }, Math.random() * 1000, false);
                return deferred.promise;
            } else {
                return results;
            }
        }

        function queryCompanySearchCityLedger(query) {
            var results = query ? vm.companyList.filter(createCompanyFilterFor(query)) : vm.companyList,
                deferred;
            if (self.simulateQuery) {
                deferred = $q.defer();
                $timeout(function() {
                    deferred.resolve(results);
                }, Math.random() * 1000, false);
                return deferred.promise;
            } else {
                return results;
            }
        }

        function queryMarketSearch(query) {
            var results = query ? vm.marketList.filter(createMarketFilterFor(query)) : vm.marketList,
                deferred;
            if (self.simulateQuery) {
                deferred = $q.defer();
                $timeout(function() {
                    deferred.resolve(results);
                }, Math.random() * 1000, false);
                return deferred.promise;
            } else {
                return results;
            }
        }

        function searchCompanyTextChange(text) {
            vm.searchCompanyText = text;
        }

        function searchCompanyTextChangeCityLedger(text) {
            vm.searchCompanyTextCityLedger = text;
        }

        function selectedCompanyChange(item) {
            if (item != undefined) {
                vm.selectedCompany = item;
                var selectedSourceTemp = _.filter(vm.sourceList, function(item) {
                    return item.SourceId && item.SourceId == vm.selectedCompany.SourceId;
                });
                if (selectedSourceTemp.length > 0)
                    vm.selectedSource = selectedSourceTemp[0];
            } else {
                vm.selectedCompany = null;
            }
        }

        function selectedCompanyChangeCityLedger(item) {
            if (item != undefined) {
                vm.selectedCompanyCityLedger = item;

            } else {
                vm.selectedCompanyCityLedger = null;
            }

        }

        function searchSourceTextChange(text) {}

        function selectedSourceChange(item) {
            vm.selectedSource = item;
        }

        function searchMarketTextChange(text) {}

        function selectedMarketChange(item) {
            vm.selectedMarket = item;
        }

        function createCompanyFilterFor(query) {
            var lowercaseQuery = change_alias(query);
            return function filterFn(item) {
                return (change_alias(item.CompanyName.toLowerCase()).indexOf(lowercaseQuery) >= 0 || change_alias(item.CompanyCode.toLowerCase()).indexOf(lowercaseQuery) >= 0);
            };
        }

        function createSourceFilterFor(query) {
            var lowercaseQuery = change_alias(query);
            return function filterFn(item) {
                return (change_alias(item.SourceName).indexOf(lowercaseQuery) >= 0 || change_alias(item.ShortCode.toLowerCase()).indexOf(lowercaseQuery) >= 0);
            };
        }

        function createMarketFilterFor(query) {
            var lowercaseQuery = change_alias(query);
            return function filterFn(item) {
                return (change_alias(item.MarketName).indexOf(lowercaseQuery) >= 0 || change_alias(item.MarketCode.toLowerCase()).indexOf(lowercaseQuery) >= 0);
            };
        }

        vm.editBusiness = function(item) {
            if (item != null) {
                //Edit Company
                if (item.CompanyCode) {
                    var companyTemp = angular.copy(item);
                    $mdDialog.show({
                        controller: EditCompanyDialogController,
                        resolve: {
                            company: function() {
                                return companyTemp;
                            },
                            sourceList: function() {
                                return vm.sourceList;
                            }

                        },
                        templateUrl: 'views/templates/editCompany.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: null,
                    }).then(function(company) {
                        if (company !== null) {
                            var editCompany = loginFactory.securedPostJSON("api/Business/EditCompany", company);
                            $rootScope.dataLoadingPromise = editCompany;
                            editCompany.success(function(data) {
                                dialogService.toast("EDIT_COMPANY_SUCCESSFUL");
                                console.info("EDIT COMPANY");
                                vm.Init();

                            }).error(function(err) {
                                dialogService.messageBox("ERROR", err.Message);
                            })
                        }
                    }, function() {});

                    function EditCompanyDialogController($scope, $mdDialog, company, sourceList) {
                        $scope.company = company;
                        $scope.sourceList = sourceList;
                        $scope.hide = function() {
                            $mdDialog.hide();
                        };
                        $scope.cancel = function() {
                            $mdDialog.cancel();
                        };

                        $scope.editCompany = function() {
                            $mdDialog.hide($scope.company);
                        }
                    }
                }

                if (item.ShortCode) {
                    var sourceTemp = angular.copy(item);
                    $mdDialog.show({
                        controller: EditSourceDialogController,
                        resolve: {
                            source: function() {
                                return sourceTemp;
                            }

                        },
                        templateUrl: 'views/templates/editSource.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: null,
                    }).then(function(source) {
                        if (source != null) {
                            var editSource = loginFactory.securedPostJSON("api/Business/EditSource", source);
                            $rootScope.dataLoadingPromise = editSource;
                            editSource.success(function(data) {
                                dialogService.toast("EDIT_SOURCE_SUCCESSFUL");
                                vm.Init();
                            }).error(function(err) {
                                dialogService.messageBox("ERROR", err.Message);
                            })
                        }
                    }, function() {});

                    function EditSourceDialogController($scope, $mdDialog, source) {
                        $scope.source = source;
                        $scope.hide = function() {
                            $mdDialog.hide();
                        };
                        $scope.cancel = function() {
                            $mdDialog.cancel();
                        };

                        $scope.editSource = function() {
                            $mdDialog.hide($scope.source);
                        }
                    }
                }

                if (item.MarketCode) {
                    var marketTemp = angular.copy(item);
                    $mdDialog.show({
                        controller: EditMarketDialogController,
                        resolve: {
                            market: function() {
                                return marketTemp;
                            }

                        },
                        templateUrl: 'views/templates/editMarket.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: null,
                    }).then(function(market) {
                        if (market !== null) {


                            var editMarket = loginFactory.securedPostJSON("api/Business/EditMarket", market);
                            $rootScope.dataLoadingPromise = editMarket;
                            editMarket.success(function(data) {
                                dialogService.toast("EDIT_MARKET_SUCCESSFUL");
                                vm.Init();
                            }).error(function(err) {
                                dialogService.messageBox("ERROR", err.Message);
                            })
                        }
                    }, function() {});

                    function EditMarketDialogController($scope, $mdDialog, market) {
                        $scope.market = market;
                        $scope.hide = function() {
                            $mdDialog.hide();
                        };
                        $scope.cancel = function() {
                            $mdDialog.cancel();
                        };

                        $scope.editMarket = function() {
                            $mdDialog.hide(vm.market);
                        }
                    }
                }
            }

        };

        vm.addNewCompany = function() {
            $mdDialog.show({
                controller: AddNewCompanyDialogController,
                resolve: {
                    sourceList: function() {
                        return vm.sourceList;
                    }
                },
                templateUrl: 'views/templates/addNewCompany.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: null,
            }).then(function(newCompany) {
                if (newCompany != null) {
                    if (vm.hasRRIDParam) {
                        var ReservationCompany = {
                            Company: newCompany,
                            RRID: $stateParams.reservationRoomId
                        };
                        var addNewCompany = loginFactory.securedPostJSON("api/Room/AddNewCompanyToReservation", ReservationCompany);
                        $rootScope.dataLoadingPromise = addNewCompany;
                        addNewCompany.success(function(data) {
                            vm.Init();
                        }).error(function(err) {
                            dialogService.messageBox("ERROR", err.Message);
                        });
                    } else {
                        vm.selectedCompany = newCompany;
                        if (newCompany.SourceId != null && vm.sourceList.length > 0) {
                            var sourceTemp = _.filter(vm.sourceList, function(item) {
                                return (item.SourceId == newCompany.SourceId);
                            })[0];
                            vm.selectedSource = sourceTemp;
                        }
                    }

                }
            }, function() {});

            function AddNewCompanyDialogController($scope, $mdDialog, sourceList) {
                $scope.newCompany = {};
                $scope.sourceList = sourceList;
                $scope.hide = function() {
                    $mdDialog.hide();
                };
                $scope.cancel = function() {
                    $mdDialog.cancel();
                };
                $scope.addNewCompany = function() {
                    $mdDialog.hide($scope.newCompany);
                }
            }
        };

        vm.addNewSource = function() {
            $mdDialog.show({
                controller: AddNewSourceDialogController,
                templateUrl: 'views/templates/addNewSource.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: null,
            }).then(function(newSource) {
                if (newSource !== null) {
                    if (vm.hasRRIDParam) {
                        var ReservationSource = {
                            Source: newSource,
                            RRID: $stateParams.reservationRoomId
                        };
                        newSource.Priority = vm.sourceList.length;
                        var addNewSource = loginFactory.securedPostJSON("api/Room/AddNewSourceToReservation", ReservationSource);
                        $rootScope.dataLoadingPromise = addNewSource;
                        addNewSource.success(function(data) {
                            dialogService.toast("ADD_NEW_SOURCE_SUCCESSFUL");
                            vm.Init();
                        }).error(function(err) {
                            dialogService.messageBox("ERROR", err.Message);
                        });
                    } else {
                        // if ($stateParams.roomId != undefined) {
                        vm.selectedSource = newSource;
                    }
                }
            }, function() {});

            function AddNewSourceDialogController($scope, $mdDialog) {
                $scope.newSource = {};
                $scope.hide = function() {
                    $mdDialog.hide();
                };
                $scope.cancel = function() {
                    $mdDialog.cancel();
                };

                $scope.addNewSource = function() {
                    $mdDialog.hide($scope.newSource);
                }
            }
        };

        vm.addNewMarket = function() {
            $mdDialog.show({

                controller: AddNewMarketDialogController,
                templateUrl: 'views/templates/addNewMarket.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: null,
            }).then(function(newMarket) {
                if (newMarket !== null) {
                    if (vm.hasRRIDParam) {
                        var ReservationMarket = {
                            Market: newMarket,
                            RRID: $stateParams.reservationRoomId
                        };
                        newMarket.Priority = vm.marketList.length;
                        var addNewMarket = loginFactory.securedPostJSON("api/Room/AddNewMarketToReservation", ReservationMarket);
                        $rootScope.dataLoadingPromise = addNewMarket;
                        addNewMarket.success(function(data) {
                            dialogService.toast("ADD_NEW_MARKET_SUCCESSFUL");
                            vm.Init();
                        }).error(function(err) {
                            dialogService.messageBox("ERROR", err.Message);
                        })
                    } else {
                        // if ($stateParams.roomId != undefined) {
                        vm.selectedMarket = newMarket;
                    }

                }
            }, function() {});

            function AddNewMarketDialogController($scope, $mdDialog) {
                $scope.newMarket = {};
                $scope.hide = function() {
                    $mdDialog.hide();
                };
                $scope.cancel = function() {
                    $mdDialog.cancel();
                };

                $scope.addNewMarket = function() {
                    $mdDialog.hide($scope.newMarket);
                }
            }
        };

        // REMARK - START
        vm.addRemark = function() {
            var roomTypeTemp = angular.copy(vm.roomTypeInfo);
            var resultTemp = angular.copy(vm.room);
            $mdDialog.show({
                controller: AddRemarkDialogController,
                resolve: {
                    remarkEvents: function() {
                        return vm.remarkEvents;
                    }

                },
                templateUrl: 'views/templates/addRemark.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: event,
            }).then(function(RemarkModel) {
                if ($stateParams.reservationRoomId) {
                    var RoomRemarkModel = {
                        ReservationRoomId: $stateParams.reservationRoomId,
                        RemarkEventId: RemarkModel.RemarkEventId,
                        Description: RemarkModel.Description
                    }
                    var processAddRemark = loginFactory.securedPostJSON("api/Room/AddRoomRemark", RoomRemarkModel);
                    $rootScope.dataLoadingPromise = processAddRemark;
                    processAddRemark.success(function(data) {
                        dialogService.toast("ADD_REMARK_SUCCESSFUL");
                        vm.Init();
                    }).error(function(err) {
                        console.log(err);
                    });
                } else {
                    var RoomRemarkModel = {
                        // ReservationRoomId: $stateParams.reservationRoomId,
                        RemarkEventId: RemarkModel.RemarkEventId,
                        Description: RemarkModel.Description,
                        IsCompleted: false,
                        IsDeleted: false,
                        CreatedDate: new Date()
                    }
                    for (var index in vm.remarkEvents) {
                        if (vm.remarkEvents[index].RemarkEventId == RoomRemarkModel.RemarkEventId) {
                            RoomRemarkModel.RemarkEventCode = vm.remarkEvents[index].RemarkEventCode;
                            break;
                        }
                    }
                    vm.roomRemarks.push(RoomRemarkModel);
                }

            }, function() {

            });

            function AddRemarkDialogController($scope, $mdDialog, remarkEvents, loginFactory) {
                $scope.roomRemark = {};

                function Init() {
                    console.info("remarkEvents", remarkEvents);
                    $scope.remarkEvents = remarkEvents;
                    $scope.reservationRoomId = $stateParams.reservationRoomId;
                    $scope.hasRRIDParam = ($stateParams.reservationRoomId) ? true : false;
                }
                Init();
                $scope.hide = function() {
                    $mdDialog.hide();
                };
                $scope.cancel = function() {
                    $mdDialog.cancel();
                };
                $scope.processAddRemark = function() {
                    var RemarkModel = {
                        RemarkEventId: $scope.roomRemark.RemarkEventId,
                        Description: $scope.roomRemark.Description,
                        ReservationRoomId: $stateParams.reservationRoomId

                    };
                    $mdDialog.hide(RemarkModel);

                };

            }
        };



        vm.editRemark = function(remark, ev) {
            var remarkTemp = angular.copy(remark);
            $mdDialog.show({
                controller: EditRemarkDialogController,
                resolve: {
                    remarkEvents: function() {
                        return vm.remarkEvents;
                    },
                    remark: function() {
                        return remarkTemp;
                    }
                },
                templateUrl: 'views/templates/editRemark.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: event,
            }).then(function(RemarkModel) {
                var RoomRemarkModel = {
                    ReservationRoomId: $stateParams.reservationRoomId,
                    RemarkEventId: RemarkModel.RemarkEventId,
                    Description: RemarkModel.Description,
                    RoomRemarkId: RemarkModel.RoomRemarkId
                }
                if ($stateParams.reservationRoomId) {
                    var processEditRemark = loginFactory.securedPostJSON("api/Room/EditRoomRemark", RoomRemarkModel);
                    $rootScope.dataLoadingPromise = processEditRemark;
                    processEditRemark.success(function(data) {
                        dialogService.toast("EDIT_REMARK_SUCCESSFUL");
                        vm.Init();
                    }).error(function(err) {
                        console.log(err);
                    });
                } else {
                    var index = vm.roomRemarks.indexOf(RoomRemarkModel);
                    vm.roomRemarks[index] = RoomRemarkModel;
                }

            }, function() {

            });

            function EditRemarkDialogController($scope, $mdDialog, remarkEvents, remark, loginFactory) {
                function Init() {
                    $scope.remark = remark;
                    $scope.remarkEvents = remarkEvents;
                }
                Init();
                $scope.hide = function() {
                    $mdDialog.hide();
                };
                $scope.cancel = function() {
                    $mdDialog.cancel();
                };

                $scope.processSaveRemark = function() {
                    var RemarkModel = {
                        RemarkEventId: $scope.remark.RemarkEventId,
                        Description: $scope.remark.Description,
                        RoomRemarkId: $scope.remark.RoomRemarkId
                    };
                    $mdDialog.hide(RemarkModel);

                };

            }
        }



        vm.removeRemark = function(remark) {
            var remarkTemp = angular.copy(remark);
            var RoomRemarkModel = {
                ReservationRoomId: $stateParams.reservationRoomId,
                RemarkEventId: remarkTemp.RemarkEventId,
                Description: remarkTemp.Description,
                RoomRemarkId: remarkTemp.RoomRemarkId
            }
            if ($stateParams.reservationRoomId) {
                dialogService.confirm("DELETE_REMARK", "WOULD_YOU_LIKE_TO_DELETE_THIS_REMARK").then(function() {
                    var processDeleteRemark = loginFactory.securedPostJSON("api/Room/RemoveRoomRemark", RoomRemarkModel);
                    $rootScope.dataLoadingPromise = processDeleteRemark;
                    processDeleteRemark.success(function(data) {
                        dialogService.toast("DELETE_REMARK_SUCCESSFUL");
                        vm.Init();
                    });
                });
            } else {
                vm.roomRemarks.splice(vm.roomRemarks.indexOf(RoomRemarkModel, 1));
            }
        }
        vm.changeRemarkStatus = function(remark) {
            var remarkTemp = angular.copy(remark);
            var RoomRemarkModel = {
                RoomRemarkId: remarkTemp.RoomRemarkId,
                IsCompleted: !remark.IsCompleted
            }
            dialogService.confirm("CHANGE_REMARK_STATUS", "WOULD_YOU_LIKE_TO_CHANGE_THIS_REMARK_STATUS").then(function() {
                var processChangeRemarkStatus = loginFactory.securedPostJSON("api/Room/ChangeRoomRemarkStatus", RoomRemarkModel);
                $rootScope.dataLoadingPromise = processChangeRemarkStatus;
                processChangeRemarkStatus.success(function(data) {
                    dialogService.toast("CHANGE_REMARK_STATUS_SUCCESSFUL");
                    vm.Init();
                })
            });
        }
            // REMARK - END

            vm.updateBreakfast = function (breakfast) {
                var updateBreakfastModel = {
                    RoomBreakfastId: breakfast.RoomBreakfastId,
                    IsBreakfast: breakfast.IsBreakfast
                };
                var updateBreakfast = loginFactory.securedPostJSON("api/Room/UpdateBreakfast", updateBreakfastModel);
                $rootScope.dataLoadingPromise = updateBreakfast;
                updateBreakfast.success(function (data) {
                    dialogService.toast("UPDATE_BREAKFAST_SUCCESSFUL");
                }).error(function (err) {
                    console.log("ERROR", err);
                })
            };
    }
]);
