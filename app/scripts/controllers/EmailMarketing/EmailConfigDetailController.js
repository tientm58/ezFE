ezCloud.controller('EmailConfigDetailController', ['$location', '$scope', '$rootScope', '$state', 'dialogService', '$localStorage', '$stateParams', '$sessionStorage', 'loginFactory', '$mdDialog', '$filter', '$mdSidenav', '$mdMedia', '$timeout', '$route',
    function ($location, $scope, $rootScope, $state, dialogService, $localStorage, $stateParams, $sessionStorage, loginFactory, $mdDialog, $filter, $timeout, $route) {
        $scope.email = {};
        $scope.email.HeaderHtml = '<table style="font-size: 100%; font-family: \'Avenir Next\', \'Helvetica Neue\', \'Helvetica\', Helvetica, Arial, sans-serif; line-height: 1.65; width: 100% !important; border-collapse: collapse; margin: 0; padding: 0;"><tbody><tr style="font-size: 100%; font-family: \'Avenir Next\', \'Helvetica Neue\', \'Helvetica\', Helvetica, Arial, sans-serif; line-height: 1.65; margin: 0; padding: 0;"><td align="center" bgcolor="#71bc37" class="masthead" style="font-size: 100%; font-family: \'Avenir Next\', \'Helvetica Neue\', \'Helvetica\', Helvetica, Arial, sans-serif; line-height: 1.65; color: white; background: #0089d0; margin: 0; padding: 30px 0;"><h1 style="font-size: 32px; font-family: \'Avenir Next\', \'Helvetica Neue\', \'Helvetica\', Helvetica, Arial, sans-serif; line-height: 1.25; max-width: 90%; margin: 0 auto; padding: 0;">[Hotel_Name]</h1></td> </tr> </tbody> </table>';

        $scope.ConditionPolicyOption = {
            language: ($rootScope.language == "vn") ? "vi" : $rootScope.language,
            extraPlugins: 'placeholder,lineheight,tableresize',
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
            height: 394,
            autoParagraph: false,
            autoGrow_onStartup: true,
            FullPage: false,
            ProtectedTags: 'html|head|body',
            resize_enabled: false
        };

        $scope.email.FooterHtml = '<div align="center" style="text-align:center; margin:0in 0in 8pt"> <hr align="center" size="2" style="border:0px; border-top: 1px solid #b7b7b7;" width="100%" /></div> <table border="0" cellpadding="0" cellspacing="0" style="background: #ffffff;border-width:0px;width: 100% !important;border:0px;margin:0;padding:0;"> <tbody> <tr> <td style="padding: 0px 7px 0px 0px; border-top: 0px; border-bottom: 0px; width: 190px;" valign="top"><img id="preview-image-urlb91dd2c4d4ae7089a62d3ee8b114e6c2" src="https://ezcloud.vn/img/logo/logohover/ezCloudhotel-blue.png" style="height: 94px; width: 150px; margin-left: 15px; margin-right: 15px;" /></td> <td style="padding: 0px 0px 0px 12px; width: 1350px;"> <table border="0" cellpadding="0" cellspacing="0" style="background: none; border: 0px; margin: 0px; padding: 0px; width: 407px;"> <tbody> <tr> <td colspan="2" style="padding-bottom: 5px; color: rgb(253, 184, 19); font-size: 10pt; font-family: &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif; width: 405px;"><span>*** FOR ANY FURTHER QUERY ***</span></td> </tr> <tr> <td colspan="2" style="color: rgb(51, 51, 51); font-size: 10pt; font-family: &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif; width: 405px;">Contact us by</td> </tr> <tr> <td style="vertical-align:top;width:20px;color:#fdb813;font-size:10pt;font-family: Helvetica Neue,Helvetica,Arial,sans-serif;" valign="top" width="20">P:</td> <td style="vertical-align: top; color: rgb(51, 51, 51); font-size: 10pt; font-family: &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif; width: 383px;" valign="top">[Hotel_Phone]</td> </tr> <tr> <td style="vertical-align:top;width:20px;color:#fdb813;font-size:10pt;font-family: Helvetica Neue,Helvetica,Arial,sans-serif;" valign="top" width="20">A:</td> <td style="vertical-align: top; color: rgb(51, 51, 51); font-size: 10pt; font-family: &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif; width: 383px;" valign="top">[Hotel_Address]</td> </tr> <tr> <td style="vertical-align:top;width:20px;color:#fdb813;font-size:10pt;font-family: Helvetica Neue,Helvetica,Arial,sans-serif;" valign="top" width="20">W:</td> <td style="vertical-align: top; color: rgb(51, 51, 51); font-size: 10pt; font-family: &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif; width: 383px;" valign="top"><a class="daria-goto-anchor" href="[Hotel_Website]" rel="noopener noreferrer" style="color:#1da1db;text-decoration:none;font-weight:normal;font-size:10pt;font-family: Helvetica Neue,Helvetica,Arial,sans-serif;" target="_blank">[Hotel_Website]</a>&nbsp; <span style="color:#fdb813;font-size:10pt;font-family: Helvetica Neue,Helvetica,Arial,sans-serif;">E:&nbsp;</span><a class="ns-action" data-click-action="common.go" href="[Hotel_Email]" style="color:#1da1db;text-decoration:none;font-weight:normal;font-size:10pt;font-family: Helvetica Neue,Helvetica,Arial,sans-serif;">[Hotel_Email]</a></td> </tr> <tr> <td style="vertical-align:top;width:20px;color:#fdb813;font-size:10pt;font-family: Helvetica Neue,Helvetica,Arial,sans-serif;" valign="top" width="20">&nbsp;</td> <td style="vertical-align: top; color: rgb(51, 51, 51); font-size: 14px; font-family: Arial, Helvetica, sans-serif; width: 383px;" valign="top">&nbsp;</td> </tr> </tbody> </table> </td> <td>&nbsp;</td> </tr> </tbody> </table>';

        $scope.options = {
            language: 'en',
            allowedContent: true,
            entities: true
        };

        $scope.onReady = function () {};

        $scope.configTemplate = {
            'GMAIL': {
                'ServerName': 'smtp.gmail.com',
                'Port': 587
            },
            'YAHOO': {
                'ServerName': 'smtp.mail.yahoo.com',
                'Port': 587
            },
            'YANINDEX': {
                'ServerName': 'smtp.yandex.com',
                'Port': 587
            }
        };

        $scope.changeType = function (val) {
            if ($scope.configTemplate.hasOwnProperty(val)) {
                $scope.email.ServerName = $scope.configTemplate[val].ServerName;
                $scope.email.Port = $scope.configTemplate[val].Port;
            } else {
                $scope.email.ServerName = '';
                $scope.email.Port = '';
            }
        }

        $scope.goToConfigList = function () {
            $state.go("EmailConfigList");
        }

        $scope.doSaveConfig = function () {
            var request = angular.copy($scope.email);
            request.EncryptionId = 0;
            request.Status = 1;
            var saveRoomChargeList = loginFactory.securedPostJSON("api/EmailMarketing/SaveConfigEmail", request);
            $rootScope.dataLoadingPromise = saveRoomChargeList;
            saveRoomChargeList.success(function (data) {
                dialogService.toast("SAVE_CONFIG_EMAIL_SUCCESSFUL");
                $scope.goToConfigList();
            }).error(function (err) {
                dialogService.toastWarn("ERROR");
            });
        }

        $scope.getDetailConfigEmail = function (configEmailId) {
            var getInforConfig = loginFactory.securedGet('api/EmailMarketing/GetConfigEmailById', 'configEmailId=' + configEmailId)
            getInforConfig.success(function (data) {
                $scope.email = data;
            }).error(function (err) {
                dialogService.toastWarn("ERROR");
            });
        }

        $scope.checkConfigEmail = function () {
            var request = angular.copy($scope.email);
            request.EncryptionId = 0;
            var checkconfig = loginFactory.securedPostJSON("api/EmailMarketing/CheckConfigEmail", request);
            $rootScope.dataLoadingPromise = checkconfig;
            checkconfig.success(function (data) {
                dialogService.toast("SAVE_CONFIG_EMAIL_SUCCESSFUL");
            }).error(function (err) {
                dialogService.toastWarn("ERROR");
            });
        }

        function Init() {
            jQuery(document).unbind('keydown');
            if ($stateParams.configEmailId.length == 0) {

            } else {
                $scope.getDetailConfigEmail($stateParams.configEmailId);
            }
            initHotKey();
        }

        initHotKey = function () {
            jQuery(document).unbind('keydown');
            jQuery(document).on('keydown', function (e) {
                EVENT.run(e, "B", function () {
                    jQuery("#btn_back").click();
                });
            });

            // do check config email
            // jQuery(document).on('keydown', function (e) {
            //     EVENT.run(e, "C", function () {
            //         jQuery("#btn_verify_email").click();
            //     });
            // });

            // do update form
            jQuery(document).on('keydown', function (e) {
                EVENT.run(e, "S", function () {
                    jQuery("#btn_doSaveConfig").click();
                });
            });
        }

        Init();

    }
]);