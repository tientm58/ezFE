ezCloud.controller('EmailTaskDetailController', ['EmailMarketingFactory', '$sce', '$stateParams', '$scope', '$rootScope', '$state', 'dialogService', '$localStorage', '$http', '$sessionStorage', 'loginFactory', '$mdDialog', '$filter', '$mdSidenav', '$mdMedia', '$timeout', '$route',
    function (EmailMarketingFactory, $sce, $stateParams, $scope, $rootScope, $state, dialogService, $localStorage, $http, $sessionStorage, loginFactory, $mdDialog, $filter, $timeout, $route) {
        //#region Properties
        $scope.avatarData = [];

        $scope.schedule = [];

        $scope.emails = {};

        $scope.ConditionPolicyOption = {
            language: ($rootScope.language == "vn") ? "vi" : $rootScope.language, 
            extraPlugins: 'placeholder,tableresize',
            toolbar: [{
                    name: 'document',
                    items: ['Print', 'Source']
                },
                {
                    name: 'clipboard',
                    items: ['Undo', 'Redo']
                },
                {
                    name: 'styles',
                    items: ['Format', 'Font', 'FontSize']
                },
                {
                    name: 'basicstyles',
                    items: ['Bold', 'Italic', 'Underline', 'Strike', 'RemoveFormat', 'CopyFormatting', 'HorizontalRule']
                },
                {
                    name: 'colors',
                    items: ['TextColor', 'BGColor']
                },
                {
                    name: 'align',
                    items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']
                },
                {
                    name: 'links',
                    items: ['Link', 'Unlink', 'Anchor']
                },
                {
                    name: 'paragraph',
                    items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote']
                },
                {
                    name: 'insert',
                    items: ['Image', 'Table']
                },
            ], 
            toolbarCanCollapse: false,
            allowedContent: true,
            entities: true,
            height: 580,
            autoParagraph: false,
            autoGrow_onStartup: true,
            FullPage: false,
            ProtectedTags: 'html|head|body',
            filebrowserUploadUrl: 'http://localhost:21326/api/File/Upload',
            resize_enabled: false
        };

        $scope.TaskMethod = [{
            id: 1,
            name: 'SCHEDULE'
        }, {
            id: 2,
            name: 'SAVE FOR LATER'
        }, {
            id: 3,
            name: 'MANUAL'
        }];
        //endregion PROPERTIES

        //#region Helper methods
        $scope.SwitchType = function (typeId) {
            var vals = $scope.avatarData[typeId - 1];
            if (vals.schedule.length > 0) {
                $scope.taskEmails.TypeStatus = vals.schedule[0].id;
            } else {
                $scope.taskEmails.TypeStatus = 0;
            }
        }

        $scope.SwitchStatus = function () {
            var vals = $scope.avatarData[$scope.taskEmails.TypeId - 1];
            if (vals.schedule.length > 0) {
                $scope.taskEmails.TypeStatus = vals.schedule[0].id;
            } else {
                $scope.taskEmails.TypeStatus = 0;
            }
        }

        $scope.goToTaskList = function () {
            $state.go("EmailTask");
        }

        initHotKey = function () {
            jQuery(document).unbind('keydown');
            jQuery(document).on('keydown', function (e) {

                // Back to list task email
                EVENT.run(e, "B", function () {
                    jQuery('#btn_back').click();
                });

                // Save form
                EVENT.run(e, "S", function () {
                    jQuery('#btn_DoSaveEmaillTask').click();
                });
            })
        }

        $scope.openMenuLogsEmail = function ($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
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
        //endregion HELPER METHODS

        //#region Services
        $scope.GetTemplateEmailById = function (templateEmailId) {
            var getInforTask = loginFactory.securedGet('api/EmailMarketing/GetTemplateEmailById', 'templateEmailId=' + templateEmailId)
            getInforTask.success(function (data) {
                $scope.taskEmails = data;
                $scope.getAllConfigEmail();
            }).error(function (err) {
                dialogService.toastWarn("ERROR");
            });
        }

        $scope.getAllConfigEmail = function () {
            var getAllConfigEmail = loginFactory.securedGet('api/EmailMarketing/GetAllConfigEmail', '')
            getAllConfigEmail.success(function (data) {
                if (data.listConfigEmail.hasOwnProperty(0)) {
                    if ($stateParams.emailTaskId.length == 0) {
                        $scope.taskEmails.HotelEmailConfigId = data.listConfigEmail[0].HotelEmailConfigId;
                    }
                    $scope.emails = data.listConfigEmail;
                }
            }).error(function (err) {
                dialogService.toastWarn("ERROR");
            });
        }

        $scope.SystemField = [];
        $scope.geAlltValueConfigTemplate = function () {
            var geAlltValueConfigTemplate = loginFactory.securedGet('api/EmailMarketing/GetAlltValueConfigTemplate', '')
            geAlltValueConfigTemplate.success(function (data) {
                $scope.SystemField = data;
                console.log($scope.SystemField);
            }).error(function (err) {
                dialogService.toastWarn("ERROR");
            });
        }

        $scope.DoSaveEmaillTask = function (taskEmails) {
            if(taskEmails.IsSendOTA == null){
                taskEmails.IsSendOTA = false;
            }
            var DoSaveEmaillTask = loginFactory.securedPostJSON("api/EmailMarketing/SaveEmailTemplate", taskEmails);
            $rootScope.dataLoadingPromise = DoSaveEmaillTask;
            DoSaveEmaillTask.success(function (data) {
                dialogService.toast("SAVE_CONFIG_EMAIL_SUCCESSFUL");
                $scope.goToTaskList();
            }).error(function (err) {
                dialogService.toastWarn("ERROR");
            });
        }
        
        //#endregion SERVICE

        function Init() {

            jQuery(document).unbind('keydown');
            if ($stateParams.emailTaskId.length == 0) {
                $scope.taskEmails = {
                    "Body": "",
                    "TypeId": 1,
                    "HotelEmailConfigId": 3,
                    "TypeStatus": 1,
                    "Status": 2,
                    "Day": 1,
                    "IsSendOTA": false
                };
                // $scope.taskEmails = {"Body":"<p style=\"text-align: center;\"><span style=\"font-size:48px;\"><strong><span style=\"color:#2980b9;\">Welcom to my hotel</span></strong></span></p>\n\n<p style=\"text-align: right;\"><span style=\"color:#2c3e50;\"><span style=\"font-size:14px;\">Membell -&nbsp;Hanoi 2017</span></span></p>\n","TypeId":1,"HotelEmailConfigId":3,"TypeStatus":1,"status":1,"Day":7,"Subject":"Confirm Information Guest"};
                $scope.getAllConfigEmail();
            } else {
                $scope.GetTemplateEmailById($stateParams.emailTaskId);
            }

            $scope.avatarData = EmailMarketingFactory.getTypes();

            $scope.schedule = EmailMarketingFactory.getSchedule();

            $scope.geAlltValueConfigTemplate();

            initHotKey();

        }

        Init();

        //#region CopyTemplate
        $scope.TasksEmail = {};
        $scope.copyTeamplate = function (ev) {
            $mdDialog.show({
                controller: CopyTemplateController,
                templateUrl: 'views/templates/copyTemplate.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                resolve: {
                    TasksEmail: function () {
                        return $scope.TasksEmail
                    }
                },
                clickOutsideToClose: true
            }).then(function (answer) {
                if (answer.val.length > 0) {
                    $scope.taskEmails.Body = answer.val;
                }

                $scope.TasksEmail = answer.TasksEmail;
            }, function () {
                //   $scope.status = 'You cancelled the dialog.';
            });
        };

        

        function CopyTemplateController($scope, $mdDialog, TasksEmail) {
            $scope.TasksEmail = TasksEmail;
            $scope.init = function () {
                if (!$scope.TasksEmail.hasOwnProperty(0)) {
                    $scope.getAllTemplate();
                } else {
                    $scope.chooceItem(0);
                }
            }

            $scope.ShowBody = "";

            $scope.getAllTemplate = function () {
                var AllEmail = loginFactory.securedGet("api/EmailMarketing/GetAllTemplateEmail");
                $rootScope.dataLoadingPromise = AllEmail;
                AllEmail.success(function (data) {
                    $scope.TasksEmail = data.listConfigEmail;
                    $scope.chooceItem(0);
                }).error(function (err) {
                    console.log(err);
                });
            }

            $scope.cancel = function () {
                $mdDialog.hide({
                    val: "",
                    TasksEmail: $scope.TasksEmail
                });
            }

            $scope.answer = function (answer) {
                $mdDialog.hide({
                    val: answer,
                    TasksEmail: $scope.TasksEmail
                });
            };

            $scope.selectId = 0;
            $scope.chooceItem = function (index) {
                if ($scope.TasksEmail.hasOwnProperty(index)) {
                    $scope.selectId = index;
                    $scope.ShowBody = $scope.TasksEmail[index].Body;
                } else {
                    $scope.selectId = index;
                    $scope.ShowBody = "Not Found content";
                }
            }

            $scope.trustAsHtml = function (string) {
                return $sce.trustAsHtml(string);
            };

            $scope.init();
        }
        //#endregion
    
        //#region action Ckeditor
        $scope.appText = function (val) {
            CKEDITOR.instances.bodyTeamplate.insertText(val);
        }

        $scope.wrapTextListRoom = function(){ 
            var selection = CKEDITOR.instances.bodyTeamplate.getSelection();
            if (selection.getType() == CKEDITOR.SELECTION_ELEMENT) {
                var selectedContent = selection.getSelectedElement().$.outerHTML;
            } else if (selection.getType() == CKEDITOR.SELECTION_TEXT) {
                if (CKEDITOR.env.ie) {
                    selection.unlock(true);
                    selectedContent = selection.getNative().createRange().text;
                } else {
                    selectedContent = selection.getNative();
                    CKEDITOR.instances.bodyTeamplate.insertText("[listroom] " + selection.getSelectedText() +" [/listroom]");
                    // console.log("The selectedContent is: " + selectedContent);
                }
            }
        }
        //#endregion
        
    }
]);

