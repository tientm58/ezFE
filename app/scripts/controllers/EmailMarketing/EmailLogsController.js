ezCloud.controller('EmailLogsController', ['EmailMarketingFactory','$sce','$scope', '$rootScope', '$state', 'dialogService', '$localStorage', '$http', '$sessionStorage', 'loginFactory', '$mdDialog', '$filter', '$mdSidenav', '$mdMedia', '$timeout', '$route',
function(EmailMarketingFactory,$sce,$scope, $rootScope, $state, dialogService, $localStorage, $http, $sessionStorage, loginFactory, $mdDialog, $filter, $timeout, $route) {
    
    $scope.logEmail = {};   
    $scope.listLog = [];
    $scope.listLog1 = [];
    $scope.listTask = {};
    $scope.emailSuccess = 0;
    $scope.emailFail = 0;
    $scope.emailSaveforlater = 0;
    $scope.emailAll = 0;
    $scope.listType = [];
    $scope.listTypeStatus = [];
    $scope.status = '';
    $scope.BodyEmailLog = '';
   
    // phân trang
    $scope.currentPage = 0;
    $scope.pageSize = 20;
    $scope.totalRecord = 0;

    $scope.search = {
        Task : 0,
        Room : null,
        Date: new Date(),
        Email: ''
    };

    $scope.numberOfPages=function(){
        return Math.ceil($scope.totalRecord/$scope.pageSize);                
    }
    // phân trang
    //is show paging
    $scope.isShowPaging = function(){
        return $scope.totalRecord != 0;
    }
    // 
    $scope.getAllLogEmail = function(search){
        $scope.currentPage = 0;
        if(search.Date != null){
        var date = search.Date.format("mm-dd-yyyy");        
        } 
        if(search.Email == null){
            search.Email = '';
        }
        var getAllLogEmails = loginFactory.securedGet('api/EmailMarketing/GetAllEmailLogs', 'email='+search.Email+'&date='+date+'&task='+search.Task+'&reservationRoomNumber='+search.Room)
        $rootScope.dataLoadingPromise = getAllLogEmails; 
        getAllLogEmails.success(function(data) {
            if( data.hotelEmailModule == null ){
                EmailMarketingFactory.DialogSuggest(true);
                $scope.listLog = [];
                $scope.listLog1 = [];
                $scope.totalRecord = 0;
                $scope.CountEmail([])
            }else{
                $scope.listLog = data.listFilter;
                $scope.listLog1 = data.listFilter;
                $scope.totalRecord = data.listFilter.length;
                $scope.CountEmail(data.listFilter);
            } 
        }).error(function(err) {
            dialogService.toastWarn("ERROR");
        });
    }
   
    $scope.getAllType = function(){
        var allType = loginFactory.securedGet('api/EmailMarketing/GetAllTemplateEmail','');
        $rootScope.dataLoadingPromise = allType;
        allType.success(function(data){
            $scope.listTask = data.listConfigEmail;
        }).error(function(err){
            dialogService.toastWarn("ERROR");
        });
    }

    init = function(){
        jQuery(document).unbind('keydown');
        getParameterHide();
        $scope.listType = EmailMarketingFactory.getTypes();
        $scope.listTypeStatus = EmailMarketingFactory.getTypeStatus();
        $scope.getAllLogEmail($scope.search);
        $scope.getAllType();
    }

    function getParameterHide(){
        if( localStorage.toSearchLogsEMKT != undefined ){
            if( localStorage.toSearchLogsEMKT.length > 1 ){
                var search = JSON.parse(localStorage.toSearchLogsEMKT);
                $scope.search = search;
                localStorage.removeItem('toSearchLogsEMKT'); 
            }
        }
    }

    init();
    
    $scope.CountEmail =  function(logEmail){
        $scope.emailSuccess = 0;
        $scope.emailFail = 0;
        $scope.emailSaveforlater = 0;
        $scope.emailAll = 0;
        angular.forEach(logEmail,function(element) {
            if(element.HotelEmailLog.Status == 1){
                $scope.emailSuccess ++;
            }
            else{
                if(element.HotelEmailLog.Status == -1){
                    $scope.emailFail ++;
                }
                else{
                    $scope.emailSaveforlater ++;
                }
            }
            $scope.emailAll ++;
        });
    }      
    $scope.listType = [
        { name: 'PRE_ARRIVAL', id: 1},
        { name: 'POST_DEPARTURE', id: 2},
        { name: 'IN-HOUSE', id: 3},
        { name: 'PROMOTION_OFFERS', id: 4}
    ];
    $scope.listStatus = [            
        { img: 'img/icons/ic_error_outline_24px.svg', id: -1, status:'ERROR', class:'btn_warning'},           
        { img: 'img/icons/ic_access_alarms_24px.svg', id: 0, status:'SAVE_FOR_LATER', class:'btn_default'},
        { img: 'img/icons/ic_done_24px.svg', id: 1, status:'SUCCESS', class:'btn_success'}
    ];

    $scope.showEmail = function (ev) {

        var BodyEmailLog = loginFactory.securedGet('api/EmailMarketing/GetBodyEmailLogs', 'path=' + ev.HotelEmailLog.Link)
        BodyEmailLog.success(function (data) {
            $scope.BodyEmailLog = data;
            sizew = 'height=724,width=1024';
            var myWindow = window.open('', ' ', sizew);
            myWindow.document.write(data);
            myWindow.document.close();

        }).error(function (err) {

        });      

        // $mdDialog.show({                
        //     controller:ShowEmailMarketing,
        //     templateUrl: 'views/templates/showEmailMarketing.tmpl.html',
        //     parent: angular.element(document.body),
        //     targetEvent: ev,
        //     clickOutsideToClose: true,  
        //     locals:{
        //         item : ev
        //     }             
        // }).then(function (answer) {
        // }, function () {
        // });
    };        

    function ShowEmailMarketing($scope, $mdDialog, item) {

        $scope.hide = function () {
            $mdDialog.hide();
        };        

        var keys = [
            "THIS_FILE_HAS_BEEN_DELETED"           
        ];
        var languageKeys = {};
        for (var idx in keys) {
            languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
        }

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.logEmail = item;
        
        // var string = 'E:\\EZCLOUD_COMPANY\\Source_EzCloud\\Server\\ezCloud.Api\\EmailMarketing\\TemplateEmail\\2017\\10\\16\\20171016181506569.txt';

        var BodyEmailLog = loginFactory.securedGet('api/EmailMarketing/GetBodyEmailLogs','path='+$scope.logEmail.HotelEmailLog.Link)
        BodyEmailLog.success(function(data){
           $scope.BodyEmailLog = data;
            sizew = 'height=724,width=1024'; 
           var myWindow = window.open('', ' ', sizew);
           myWindow.document.write(data);
           myWindow.document.close();

        }).error(function(err){
            
        });         

        $scope.answer = function (answer) {
            $mdDialog.hide(answer);
        };

        $scope.trustAsHtml = function (string) {
            return $sce.trustAsHtml($filter("translate")(string));
        };

        $scope.reSendEmail = function(  ){
            EmailMarketingFactory.reSendEamil(item.HotelEmailLog.HotelEmailLogId, function(){
                dialogService.toast("SUCCESS");
                $mdDialog.hide();
            });
        }
    }    

    $scope.StatusChange = function(statusId){
        $scope.currentPage = 0;
        if(statusId == 2){
            $scope.listLog1 = $scope.listLog;
        }
        else{
            $scope.listLog1 = $scope.listLog.filter(function(item){
                return item.HotelEmailLog.Status === statusId;
            });
        }        
        $scope.totalRecord = $scope.listLog1.length;
    }
   
}
]);
ezCloud.filter('startFrom', function() {
    return function(input, start) {
        start = +start;
        if(angular.isArray(input) && input.length > 0) {
             return input.slice(start);
        } 
        return input;
    }
});

