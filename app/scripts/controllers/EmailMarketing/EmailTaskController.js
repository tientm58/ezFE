ezCloud.controller('EmailTaskController', ['EmailMarketingFactory', '$mdMedia', '$location', '$scope', '$rootScope', '$state', 'dialogService', '$localStorage', '$http', '$sessionStorage', 'loginFactory', '$mdDialog', '$filter', '$mdSidenav', '$mdMedia', '$timeout', '$route',
    function (EmailMarketingFactory, $mdMedia, $location, $scope, $rootScope, $state, dialogService, $localStorage, $http, $sessionStorage, loginFactory, $mdDialog, $filter, $timeout, $route) {
        //#region Properties
        $scope.taskEmails = [];
        $scope.listType = [];
        $scope.listTypeStatus = [];
        //#endregion
        
        //#region Helper methods
        $scope.filterStatus = function (item) {
            return item.Status === 1;
        };

        $scope.viewDevice = function (type, task) {
            var request = {
                Body: task.Body,
                HotelEmailConfigId: task.HotelEmailConfigId
            }
            EmailMarketingFactory.getContentEmailPreview(request, type, function (body, type) {
                var sizew;
                switch (type) {
                    case 'Deskstop':
                        sizew = 'height=724,width=1024';
                        break;
                    case 'Tablet':
                        sizew = 'height=724,width=768';
                        break;
                    case 'Mobile':
                        sizew = 'height=432,width=320';
                        break;
                    default:
                        sizew = 'height=1024,width=1024';
                        break;
                }
                var myWindow = window.open('', task.Subject + ' ' + type, sizew);
                myWindow.document.write(body);
                myWindow.document.close();
            });

        };
 
        $scope.AddTemplate = function (templateEmailId) {
            $location.path('/emailTask/' + templateEmailId);
        }

        $scope.DoTail = function (templateEmailId) {
            $location.path('/emailTask/' + templateEmailId);
        }

        //endregion

        //#region Services
        $scope.getAllTaskEmail = function () {
            var getAllTaskEmails = loginFactory.securedGet('api/EmailMarketing/GetAllTemplateEmail', '')
            getAllTaskEmails.success(function (data) {
                if( data.hotelEmailModule == null ){
                    EmailMarketingFactory.DialogSuggest(true);
                    $scope.taskEmails = [];
                }else{
                    $scope.taskEmails = data.listConfigEmail;
                }
                
            }).error(function (err) {
                dialogService.toastWarn("ERROR");
            });
        }
        
        $scope.deleteEmailTask = function (ev, status) {
            var confirm = $mdDialog.confirm()
                .title($filter("translate")("WARNING") + '!')
                .textContent($filter("translate")("DO_YOU_WANT_TO_DELETE_THIS_ITEM") + '?')
                .ariaLabel('Lucky day')
                .targetEvent(ev)
                .ok($filter("translate")("YES"))
                .cancel($filter("translate")("NO"));

            $mdDialog.show(confirm).then(function () {
                var deleteTask = loginFactory.securedGet('api/EmailMarketing/DeleteTemplateEmailById', 'templateEmailId=' + ev + '&status=' + status)
                deleteTask.success(function (data) {
                    dialogService.toast("SUCCESS");
                    $scope.getAllTaskEmail();
                }).error(function (err) {
                    dialogService.toastWarn("ERROR");
                });
            }, function () { });
        };
        //#endregion
        
        initHotKey = function () {
            jQuery(document).unbind('keydown');
            jQuery(document).on('keydown', function (e) {
                EVENT.run(e, "A", function () {
                    jQuery("#btn_AddTemplate").click();
                });
            })
        }
        
        init = function () {
            $scope.listType = EmailMarketingFactory.getTypes();
            $scope.listTypeStatus = EmailMarketingFactory.getTypeStatus();
            $scope.getAllTaskEmail();
            initHotKey();
        }

        init();

    }
]);