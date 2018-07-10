ezCloud.controller('extendedScreenController', ['$scope', '$rootScope', 'loginFactory', function ($scope, $rootScope, loginFactory) {
    //
    $rootScope.showMenu = false;
    $rootScope.extendedScreen = true;
    //Init SignalR here
    var connection = $.hubConnection(apiUrl + "signalr", {
        useDefaultPath: false
    });
    connection.qs = {
        "access_token": loginFactory.getToken()
    };
    var contosoESHubProxy = connection.createHubProxy('extendedScreenHub');
    contosoESHubProxy.on('sendMessage', function (data) {
        if (data && data.command) {
            switch (data.command) {
                case "showInvoice":
                    var invoiceId = data.invoiceId;
                    if (invoiceId > 0) {
                        $("#reportViewer").show();
                        showReport(data.hotelInvoice, {
                        // showReport("RoomInvoiceA4.trdx", {
                            Language: $rootScope.language,
                            ReservationRoomId: invoiceId
                        });
                    } else {
                        $("#reportViewer").hide();
                    }
                    break;
                case "showGroupInvoice":
                    var invoiceId = data.invoiceId;
                    if (invoiceId > 0) {
                        $("#reportViewer").show();
                        showReport(data.hotelInvoice, {
                            Language: $rootScope.language,
                            ReservationId: invoiceId
                        });
                    } else {
                        $("#reportViewer").hide();
                    }
                    break;
                case "hideInvoice":
                    $("#reportViewer").hide();
                    break;
                case "hideGroupInvoice":
                    $("#reportViewer").hide();
                    break;
            }
        }


    });

    function startConnection() {
        connection.start().done(function () {
            console.log('connected');

        }).fail(function () {
            //try to reconnect
            console.log('failed to connect to hub');

        });
    }
    connection.disconnected(function () {
        //try to reconnect
        console.log('disconnected');
        setTimeout(startConnection, 5000);
    })
    startConnection();




    var firstTime = true;

    function showReport(reportName, parameters) {
        var reportViewer = $("#reportViewer");
        //if (!firstTime)
        reportViewer.removeData();
        reportViewer.telerik_ReportViewer({
            // The URL of the service which will serve reports.
            // The URL corresponds to the name of the controller class (ReportsController).
            // For more information on how to configure the service please check http://www.telerik.com/help/reporting/telerik-reporting-rest-conception.html.
            serviceUrl: apiUrl + "api/reports/",

            // The URL for the report viewer template. The template can be edited -
            // new functionalities can be added and unneeded ones can be removed.
            // For more information please check http://www.telerik.com/help/reporting/html5-report-viewer-templates.html.
            templateUrl: 'ReportViewer/templates/telerikReportViewerTemplate-9.2.15.930.html',
            toolbarVisible: false,
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
            // viewMode: telerikReportViewer.ViewModes.INTERACTIVE,
            viewMode: telerikReportViewer.ViewModes.PRINT_PREVIEW,

            // Sets the scale mode of the viewer.
            // Three modes exist currently:
            // FIT_PAGE - The whole report will fit on the page (will zoom in or out), regardless of its width and height.
            // FIT_PAGE_WIDTH - The report will be zoomed in or out so that the width of the screen and the width of the report match.
            // SPECIFIC - Uses the scale to zoom in and out the report.
            scaleMode: $scope.$mdMedia("sm") ? telerikReportViewer.ScaleModes.FIT_PAGE_WIDTH : telerikReportViewer.ScaleModes.SPECIFIC,

            // Zoom in and out the report using the scale
            // 1.0 is equal to 100%, i.e. the original size of the report
            scale: 1.0,

            ready: function () {
                //this.refreshReport();
            },
            renderingEnd: function () {
                if (firstTime)
                    if ($scope.$mdMedia("sm")) {
                        $("#reportViewer").data("telerik_ReportViewer").commands.toggleParametersArea.exec();
                        firstTime = false;
                    }
            }
        });
    }

}]);