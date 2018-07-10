ezCloud.controller('configHotelOwnerInfoController', ['$scope', '$rootScope', '$state', 'dialogService', '$localStorage', '$http', '$sessionStorage', 'loginFactory', '$mdDialog', 'flowFactory', '$filter', '$log', '$mdSidenav', '$mdMedia', 'configFactory', '$q', '$location', '$timeout', 'currentHotelSettings', 'commonFactory','$stateParams', function ($scope, $rootScope, $state, dialogService, $localStorage, $http, $sessionStorage, loginFactory, $mdDialog, flowFactory, $filter, $log, $mdSidenav, $mdMedia, configFactory, $q, $location, $timeout, currentHotelSettings, commonFactory,$stateParams) {
    var self = this;
    function configHotelOwnerInit() {
        configFactory.getHotelOwner($rootScope.user.Email,function (data) {
             $scope.HotelOwner=data;
            commonFactory.getHotelSizeList(function (data) {
                console.log('hotelOwner',data);
                $scope.hotelSizeList = data;
            });
        });
    };
    configHotelOwnerInit();
   

    $scope.saveHotelOwner=function(){
        var saveHotelOwner = loginFactory.securedPostJSON("api/Config/UpdateHotelOwnerInfo", $scope.HotelOwner);
            $rootScope.dataLoadingPromise = saveHotelOwner;
            saveHotelOwner.success(function (data) {
                if($localStorage.lastLogin.role=='HOTEL_OWNER'){
                    $rootScope.user.Fullname=$scope.HotelOwner.Fullname;    
                }
                //console.log("DATA", data);
                dialogService.toast("SAVE_HOTEL_OWNER_SUCCESSFUL");
            });
    };

    $scope.checkMatchEmail=function()
    {
         var compareResult;
         if ($scope.NewEmail != $scope.NewEmailConfirm) 
            compareResult=false;
         
         else 
            compareResult= true;

        console.log('compareResult:',compareResult);
        return compareResult;
          
    }

    $scope.editEmailHotelOwner = function () {
            //console.log('scope:',$scope);
            var HotelOwnerTemp = angular.copy($scope.HotelOwner);
            $mdDialog.show({
                controller: EditEmailHotelOwnerDialogController,
                resolve: {
                    OldEmail: function () {
                        return HotelOwnerTemp.Email;
                    }
                },
                templateUrl: 'views/templates/editEmailHotelOwner.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: event,
            }).then(function (EmailHotelOwnerInfo) {
               
                var saveEmailHotelOwner = loginFactory.securedPostJSON("api/Config/UpdateEmailHotelOwnerInfo", EmailHotelOwnerInfo);
                $rootScope.dataLoadingPromise = saveEmailHotelOwner;
                saveEmailHotelOwner.success(function (data) {
                    dialogService.toast("EDIT_EMAIL_HOTEL_OWNER_SUCCESSFUL");
                    loginFactory.removeCache($rootScope.HotelSettings.HotelId).success(function(){
                        loginFactory.signOut(function () {
                            $localStorage.reLoadTab = true;
                            $localStorage.menuReport = null;
                            $localStorage.displayGroup = null;
                            $localStorage.TimeInOutPrivate = undefined;
                            $state.go("login", {}, {
                                reload: true
                            });
                        });
                    });                                 
                    
                }).error(function (err) {
                    if (err.Message) {
                        dialogService.messageBox("ERROR", err.Message);
                    }
                   
                })
            }, function () {

            });

            function EditEmailHotelOwnerDialogController($scope, $mdDialog,OldEmail) {
                function Init() {
                  //console.log('OldEmail:',OldEmail);
                  $scope.OldEmail = angular.copy(OldEmail);
                  $scope.warningEmailNotMatch = false;
                  
                }
                Init();
                $scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
                $scope.processEditEmailHotelOwner = function () {

                    if ($scope.NewEmail != $scope.NewEmailConfirm) {
                        $scope.warningEmailNotMatch = true;
                        return;
                    }
                    var EmailHotelOwnerInfo = {
                        NewEmail: $scope.NewEmail,
                        OldPassword:$scope.OldPassword
                    }
                    console.log('scope.OldPassword:',EmailHotelOwnerInfo);
                    $mdDialog.hide(EmailHotelOwnerInfo);
                }

            }
        };

}]);
