ezCloud.controller('reportController', ['$scope', '$rootScope', '$mdBottomSheet','$location', '$state', 'dialogService', 'loginFactory', '$mdDialog','$stateParams', function ($scope, $rootScope, $mdBottomSheet, $location, $state, dialogService, loginFactory, $mdDialog,$stateParams) {
    var firstTime = true;
    showReport($stateParams.name + ".trdx",{Language: $rootScope.language});
    function showReport(reportName , parameters) {
        console.log('DUNGNN: ',$stateParams.name);

        $("#reportViewer")
    .telerik_ReportViewer({
    // The URL of the service which will serve reports.
    // The URL corresponds to the name of the controller class (ReportsController).
    // For more information on how to configure the service please check http://www.telerik.com/help/reporting/telerik-reporting-rest-conception.html.
    serviceUrl: apiUrl + "api/reports/",

    // The URL for the report viewer template. The template can be edited -
    // new functionalities can be added and unneeded ones can be removed.
    // For more information please check http://www.telerik.com/help/reporting/html5-report-viewer-templates.html.
    templateUrl: 'ReportViewer/templates/telerikReportViewerTemplate-9.2.15.930.html',

    //ReportSource - report description
    reportSource: {

    // The report can be set to a report file name (trdx report definition)
    // or CLR type name (report class definition).
        report: reportName,

    // Parameters name value dictionary
        parameters: parameters
    },

    // Specifies whether the viewer is in interactive or print preview mode.
    // PRINT_PREVIEW - Displays the paginated report as if it is printed on paper. Interactivity is not enabled.
    // INTERACTIVE - Displays the report in its original width and height without paging. Additionally interactivity is enabled.
    viewMode: telerikReportViewer.ViewModes.PRINT_PREVIEW,

    // Sets the scale mode of the viewer.
    // Three modes exist currently:
    // FIT_PAGE - The whole report will fit on the page (will zoom in or out), regardless of its width and height.
    // FIT_PAGE_WIDTH - The report will be zoomed in or out so that the width of the screen and the width of the report match.
    // SPECIFIC - Uses the scale to zoom in and out the report.
    scaleMode: $scope.$mdMedia("sm")? telerikReportViewer.ScaleModes.FIT_PAGE_WIDTH: telerikReportViewer.ScaleModes.SPECIFIC,

    // Zoom in and out the report using the scale
    // 1.0 is equal to 100%, i.e. the original size of the report
    scale: 1.0,

    ready: function () {
    //this.refreshReport();
        
        
    },
    renderingEnd: function() {
        if (firstTime)
        if ($scope.$mdMedia("sm")) {
            $("#reportViewer").data("telerik_ReportViewer").commands.toggleParametersArea.exec();
            firstTime = false;
        }
    },

    

    // Uncomment the code below to see the custom parameter editors in action
    //parameterEditors: [
    //{
    //    "match": customMatch,
    //    "createEditor": createCustomEditor
    //},
    //{
    //    "match": telerikReportViewer.parameterEditorsMatch.SingleSelect,
    //    "createEditor": createSingleSelectEditor
    //}]
    parameterEditors: [
                  {
                      match: function (parameter) {
                          return parameter.type === "System.DateTime";
                      },
 
                      createEditor: function (placeholder, options) {
                          $(placeholder).html('<input type="datetime"/>');
                          var dateTimePicker = $(placeholder),
                                               parameter,
                                               valueChangedCallback = options.parameterChanged,
                                               dropDownList;
 
 
                          function onChange() {
                              var dtv = this.value();
                              if (null !== dtv) {
                                  dtv = myadjustTimezone(dtv);
                              }
                              valueChangedCallback(parameter, dtv);
                          }
 
                          return {
                              beginEdit: function (param) {
                                  parameter = param;
 
                                  var dt = null;
                                  try {
                                      if (param.value) {
                                          dt = myunadjustTimezone(param.value);
                                      }
                                  } catch (e) {
                                      dt = null;
                                  }

                                  switch ($stateParams.name) {
                                     /* case 'RoomSalesForecast':
                                           $(dateTimePicker).find("input").kendoDatePicker({
                                               start: "year",
                                               depth: "year",
                                              format: "MM/yyyy",
                                              parseFormats: ["MM/yyyy"],
                                              change: onChange,
                                              value: dt
                                          });  
                                          break;*/ 
                                      case 'InvoiceListReport':
                                      case 'DailyReceipt':
                                      case 'DailyExtraCharge':
                                      case 'VoidReports':
                                      case 'InHouseGuestForPA18List':
                                      //case 'InventoryByRoomType':
                                     // case 'RoomSalesForecast':
                                          $(dateTimePicker).find("input").kendoDateTimePicker({
                                              format: "dd/MM/yyyy HH:mm",
                                              parseFormats: ["dd/MM/yyyy HH:mm"],
                                              change: onChange,
                                              value: dt
                                          });
                                          break; 
                                      default: 
                                          $(dateTimePicker).find("input").kendoDateTimePicker({
                                              format: "dd/MM/yyyy",
                                              parseFormats: ["dd/MM/yyyy"],
                                              change: onChange,
                                              value: dt
                                          });
                                  }

                                 
                                 /* $(dateTimePicker).find("input").kendoDateTimePicker({
                                      format: "MM/yyyy",
                                      parseFormats: ["MM/yyyy"],
                                      change: onChange,
                                      value: dt
                                  });*/
                                    
                                
 
 
                                  dropDownList = $(dateTimePicker).find("input").data("kendoDateTimePicker");
 
                              }
 
                          }
                      }
                  },{
                      match: function (parameter) {
                              return Boolean(parameter.availableValues) && !parameter.multivalue;
                          },

                          createEditor: function (placeholder, options) {
                              $(placeholder).css('width', '100%');
                              var dropDownElement = $(placeholder).html('<div style="width:100%"></div>'),
                                  parameter,
                                  valueChangedCallback = options.parameterChanged,
                                  dropDownList;

                              function onChange() {
                                  var val = dropDownList.value();
                                  valueChangedCallback(parameter, val);
                              }

                              return {
                                  beginEdit: function (param) {

                                      parameter = param;

                                      $(dropDownElement).kendoDropDownList({
                                          dataTextField: "name",
                                          dataValueField: "value",
                                          value: parameter.value,
                                          dataSource: parameter.availableValues,
                                          change: onChange
                                      });

                                      dropDownList = $(dropDownElement).data("kendoDropDownList");
                                  }
                              };
                          }
                  }]
             
    });

       function myadjustTimezone(date) {
           return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()));
       };
       function myunadjustTimezone(date) {
           return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
       };
  
    }
    //Dashboard
    //
   
}]);

ezCloud.controller('reportConfigController', ['$scope', '$rootScope', '$mdBottomSheet','$location', '$state', 'dialogService', 'loginFactory', '$mdDialog','$stateParams','$localStorage','reportFactory', function ($scope, $rootScope, $mdBottomSheet, $location, $state, dialogService, loginFactory, $mdDialog,$stateParams,$localStorage,reportFactory) {
    var tmp;var userId=0;
   $scope.showReport=function(url){
        $location.url(url);
   }
   $scope.isInRole = function (menu) {
        if (!$localStorage.session || !$localStorage.session.Roles) return false;
         if (!menu.roles) return true;
        var roles = $localStorage.session.Roles;
        for (var idx in menu.roles) {
            if (roles.indexOf(menu.roles[idx]) >= 0) {
                return true;
            }
        }
        return false;
    }
    $scope.init=function(){
        if($rootScope.menuReport.submenus!=null){
            $scope.report=$rootScope.menuReport.submenus;
            reportFactory.getReport(function (data) {
            if(data.List.length>0){
                var tmp=$rootScope.menuReport.submenus;
                angular.forEach($scope.report,function(arr){
                    angular.forEach(arr.submenus,function(arr1){
                        arr.isCheck=false;
                        angular.forEach(data.List,function(temp){
                            if(tmp.ReportCode==arr.code)arr.isCheck=true;
                        })
                    });
                });
                $scope.report=tmp;
            }else{
                $scope.report=$rootScope.menuReport.submenus;
            }
           });
        }
    }
   $scope.UpdateReport=function(model){
        var flag=false;
        var data={ReportCode:model.code}
        reportFactory.UpdateReport(data,function (data) {
            dialogService.toast("SAVE_CONFIG_REPORT_SUCCESSFUL");
            angular.forEach($scope.report,function(arr){
                angular.forEach(arr.submenus,function(arr1){
                    if(arr1.isCheck==true){
                        flag=true;
                    }
                })
            })
            $rootScope.menuReport.submenus=$scope.report;
            if(flag==true){
                $rootScope.menuReport.isFirst=false;
            }else{
                $rootScope.menuReport.isFirst=true;
            }
        });
   }
}]);
