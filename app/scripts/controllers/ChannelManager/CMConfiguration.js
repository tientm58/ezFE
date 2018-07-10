ezCloud.controller('CMConfigurationController', ['$scope', '$rootScope', '$state', 'dialogService', '$localStorage', '$http', '$sessionStorage', 'loginFactory', '$mdDialog', 'flowFactory', '$filter', '$mdSidenav', '$mdMedia', 'configFactory', '$q', '$location', '$log', 'roomListFactory', 'frontOfficeFactory', '$timeout', 'CMFactory',
    function($scope, $rootScope, $state, dialogService, $localStorage, $http, $sessionStorage, loginFactory, $mdDialog, flowFactory, $filter, $mdSidenav, $mdMedia, configFactory, $q, $location, $log, roomListFactory, frontOfficeFactory, $timeout, CMFactory) {
        function Init() {
            jQuery(document).unbind('keydown');
            $scope.selectedSource = null;
            var getCMConfiguration = CMFactory.getCMConfiguration();
            $rootScope.dataLoadingPromise = getCMConfiguration;
            getCMConfiguration.success(function(data) {
                CMFactory.CheckHotelCMConfiguration();
                $scope.CMConfiguration = data.CMConfiguration;
                $scope.currentCMConfiguration=angular.copy(data.CMConfiguration);
                $scope.sourceList = data.SourceList.sort(function (a, b) {
                    return a.Priority - b.Priority;
                });
                if($scope.CMConfiguration!=null){
                    $scope.selectedSource=$scope.CMConfiguration.Source;
                }
            }).error(function(err) {
                console.log(err);
            });
             //Source
            $scope.searchSourceTextChange=function(text){}
            $scope.selectedSourceChange=function(item) {
                $scope.selectedSource = item;
            }
            $scope.querySourceSearch=function(query) {
                var results = query ? $scope.sourceList.filter(createSourceFilterFor(query)) : $scope.sourceList,
                    deferred;
                if (self.simulateQuery) {
                    deferred = $q.defer();
                    $timeout(function () {
                        deferred.resolve(results);
                    }, Math.random() * 1000, false);
                    return deferred.promise;
                } else {
                    return results;
                }
            }
            CMFactory.get_CMRoomTypeMappings_CMRoomTypes(function (data) {
                if(data) {
                    $scope.channels = data[data.length - 1];
                    console.log('List channels: ',$scope.channels);
                }
            });
            $scope.dataChannels = [];
        }
        Init();
        $scope.savetoDB = function() {
            var data = angular.copy($scope.dataChannels);
            var updateOTA = loginFactory.securedPostJSON("api/ChannelManager/UpdateChannelFromOTA",data);
            updateOTA.success(function (data) {
                dialogService.toast("UPDATE_SUCCESSFUL");
                $state.go($state.current, {}, {
                    reload: true
                });
            }).error(function (err) {
                dialogService.messageBox("ERROR", err);
            })
        }
        $scope.openListChannel = function() {
            $mdDialog.show({
                controller: CMGetChannelList,
                templateUrl: 'views/templates/CMListChannel.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: null,
                clickOutsideToClose: false,
                resolve:{
                     channelList: function() {
                         return $scope.channels;
                     }
                }
            }).then(function(data) {
                $scope.dataChannels = data;
                $scope.savetoDB();
            });
            function CMGetChannelList($scope, $mdDialog, channelList) {
                function Init() {
                   $scope.listFinal = channelList;
                }
                Init();
                $scope.save = function() {
                    $mdDialog.hide($scope.listFinal);
                }
                $scope.hide = function() {
                    $mdDialog.hide();
                };
                $scope.cancel = function() {
                    $mdDialog.cancel();
                };
            }  
        };
        $scope.CMRegister = function() {
            var typeCms = angular.copy($rootScope.dataCMS);
        	$mdDialog.show({
                controller: CMRegisterDialogController,
                templateUrl: 'views/templates/CMRegister.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: null,
                clickOutsideToClose: false,
                resolve:{
                     SourceList: function() {
                        return $scope.sourceList;
                     },
                     CMConfiguration:function(){
                        return angular.copy($scope.CMConfiguration);
                     },
                     TypeCMS: function(){
                         return typeCms;
                     }
                }
            }).then(function(register) {
            	CMFactory.CMRegister(register);
            }, function() {});

            function CMRegisterDialogController($scope, $mdDialog, loginFactory, dialogService,SourceList,CMConfiguration,TypeCMS) {
                function Init() {
                    $scope.selectedSource = null;
                    $scope.sourceList=SourceList;
                    $scope.register={};
                    $scope.register.IsLastRoomAvailable=true;
                    $scope.typeCMS = TypeCMS;
                    if(CMConfiguration!=null){
                        $scope.register=CMConfiguration;  
                        $scope.selectedSource=CMConfiguration.Source;
                    }
                }
                Init();
                $scope.hide = function() {
                    $mdDialog.hide();
                };
                $scope.cancel = function() {
                    $mdDialog.cancel();
                };
                $scope.openMenu = function($mdOpenMenu, ev){
                    $mdOpenMenu(ev);
                };
                $scope.CMRegister = function() {
                    // $scope.register.SourceId=null;
                    // if($scope.selectedSource){
                    //     $scope.register.SourceId=$scope.selectedSource.SourceId;    
                    // }
                    $mdDialog.hide($scope.register);
                }
                
            }
        };
        $scope.CMUpdate=function(){
        };
        $scope.CMDeregister=function(){
            dialogService.confirm("WARNING", "DO_YOU_WANT_TO_DEREGISTER_HOTEL_TO_CHANNEL_MANAGER" + "?").then(function() {
                CMFactory.CMDeregister($scope.CMConfiguration);    
            });
        }
        $scope.UpdateCMRegister=function(){
            dialogService.confirm("CONFIRM", "DO_YOU_WANT_TO_CHANGE_ALLOTMENT_TYPE_AND_SOURCE" + "?").then(function() {
                var tmpCMconfig=angular.copy($scope.CMConfiguration);
                tmpCMconfig.SourceId=null;    
                tmpCMconfig.Source=null;
                if($scope.selectedSource!=null){
                    tmpCMconfig.SourceId=$scope.selectedSource.SourceId;    
                }
                CMFactory.UpdateCMRegister(tmpCMconfig);
            });
        }
        
    }
]);