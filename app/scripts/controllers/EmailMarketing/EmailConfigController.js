ezCloud.controller('EmailConfigController', ['EmailMarketingFactory', '$location', '$scope', 'dialogService', 'loginFactory', '$mdDialog', '$filter', '$state',
    function (EmailMarketingFactory, $location, $scope, dialogService, loginFactory, $mdDialog, $filter, $state) {

        $scope.listTaskEmail = [];

        $scope.getDetailConfigEmail = function (configEmailId) {
            $state.go("emailConfigListDetail", {
                configEmailId: configEmailId
            });
        }

        $scope.createConfigEmail = function () {
            $state.go("emailConfigListDetail", {
                configEmailId: null
            });
        }

        $scope.getAllConfigEmail = function () {
            var getAllConfigEmail = loginFactory.securedGet('api/EmailMarketing/GetAllConfigEmail', '')
            getAllConfigEmail.success(function (data) {
                $scope.listTaskEmail = data;
                if (data.hotelEmailModule == null) {
                    EmailMarketingFactory.DialogSuggest(true);
                    $scope.emails = {};
                } else {
                    $scope.emails = data.listConfigEmail;
                }
            }).error(function (err) {
                dialogService.toastWarn("ERROR");
            });
        }

        function Init() {
            $scope.getAllConfigEmail();
            initHotKey();
        }

        initHotKey = function () {
            jQuery(document).unbind('keydown');
            jQuery(document).on('keydown', function (e) {
                EVENT.run(e, "A", function () {
                    jQuery("#btn_CreateConfig").click();
                });
            })
        }

        Init();

        $scope.filterStatus = function (item) {
            return item.Status === 1;
        };

        $scope.checkDelConfig = function (ev) {
            var checkDeleteConfig = loginFactory.securedGet('api/EmailMarketing/CheckDelConfigEmailById', 'configEmailId=' + ev)
            checkDeleteConfig.success(function (data) {                
                if (data.length == 0) {
                    showConfirm(ev);
                }
                else {
                    $mdDialog.show({
                        controller: ['$scope','$mdDialog','listTaskEmail',DialogController],
                        locals: {
                            listTaskEmail : data
                        },
                        templateUrl: 'views/templates/showEmailTaskRelativeConfigID.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose:false,
                        //fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                      })
                      .then(function(answer) {
                       
                      }, function() {
                        
                      });
                }
            }).error(function (err) {
                dialogService.toastWarn("ERROR");
            });
        };

        function showConfirm(ev) {
            var keys = [
                "DO_YOU_WANT_TO_DELETE_THIS_CONFIG",
                "WARNING",
                "YES",
                "NO"
            ];
            var languageKeys = {};
            for (var idx in keys) {
                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
            }

            var confirm = $mdDialog.confirm()
                .title($filter("translate")("WARNING") + '!')
                .textContent($filter("translate")("DO_YOU_WANT_TO_DELETE_THIS_CONFIG") + '?')
                .ariaLabel('Lucky day')
                .targetEvent(ev)
                .ok($filter("translate")("YES"))
                .cancel($filter("translate")("NO"));

            $mdDialog.show(confirm).then(function () {
                var deleteConfig = loginFactory.securedGet('api/EmailMarketing/DeleteConfigEmailById', 'configEmailId=' + ev)
                deleteConfig.success(function (data) {
                    dialogService.toast("SUCCESS");
                    $scope.getAllConfigEmail();
                }).error(function (err) {
                    dialogService.toastWarn("ERROR");
                });
            }, function () {
            });
        }
        
        function DialogController($scope, $mdDialog,listTaskEmail) {
            $scope.listTaskEmail = listTaskEmail;
            $scope.hide = function() {
              $mdDialog.hide();
            };
        
            $scope.cancel = function() {
              $mdDialog.cancel();
            };        

            $scope.goToTask = function(task){
                window.open('/#/emailTask/' + task.HotelEmailTaskId);
            }
          }

    }
]);
