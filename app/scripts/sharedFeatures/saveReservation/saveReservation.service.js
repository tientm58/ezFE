ezCloud.factory("SaveReservationService", ['loginFactory', 'walkInFactory', 'dialogService', '$stateParams', '$rootScope', '$filter', 'CheckInService', 'BookService', 'CheckOutService', '$mdDialog', function(loginFactory, walkInFactory, dialogService, $stateParams, $rootScope, $filter, CheckInService, BookService, CheckOutService, $mdDialog) {
    var saveReservationModel = null;
    var SaveReservationService = {
        buildSaveReservationModel: function(){
            if (!$stateParams.reservationRoomId){
                var roomForSaved        = walkInFactory.getRoomForSaved();
                var customerForSaved    = walkInFactory.getCustomerForSaved();
                var paymentListForSaved = walkInFactory.getPaymentListForSaved();
                var companyForSaved     = walkInFactory.getCompanyForSaved();
                var sourceForSaved      = walkInFactory.getSourceForSaved();
                var marketForSaved      = walkInFactory.getMarketForSaved();
                var remarksForSaved     = walkInFactory.getRemarksForSaved();
                console.info("saveReservationModel", roomForSaved, customerForSaved, paymentListForSaved, companyForSaved, sourceForSaved, marketForSaved, remarksForSaved);
                var Paykeys = ["RES_NO", "ROOM", "NOTIFICATION_NEWPAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER", "NOTIFICATION_BOOKED_CONTENT", "NOTIFICATION_BOOKED_NAN_CONTENT", "NOTIFICATION_DISCOUNT_ROOM_PRICE"];
                var languagePayKeys = {};
                for (var idx in Paykeys) {
                    languagePayKeys[Paykeys[idx]] = $filter("translate")(Paykeys[idx]);
                }
                var saveReservationModel = {
                    customer: customerForSaved,
                    room: roomForSaved,
                    sharerList: [],
                    paymentList: paymentListForSaved,
                    company: companyForSaved,
                    source: sourceForSaved,
                    market: marketForSaved,
                    roomRemarks: remarksForSaved,
                    languageKeys: languagePayKeys,
                    postedItems: null,
                    postedNoItem: null
                };
                if ($rootScope.postedItems && $rootScope.postItems.items) {
                    saveReservationModel.postedItems = $rootScope.postedItems;
                    saveReservationModel.postedNoItem = null;
                } else {
                    saveReservationModel.postedItems = null;
                    saveReservationModel.postedNoItem = $rootScope.postedNoItem;
                }

                if (saveReservationModel.customer.Birthday) {
                    saveReservationModel.customer.Birthday = new Date(saveReservationModel.customer.Birthday);
                }
            }
            else{
                saveReservationModel = {
                    room: walkInFactory.getCurrentRR()
                }
            }

            return saveReservationModel;
        },
        processCheckIn: function(saveReservationModel){
            if (CheckInService.checkValidBeforeCheckIn(saveReservationModel)){
                if (saveReservationModel.room.HouseStatus == 'DIRTY') {
                    dialogService.confirm("ROOM_DIRTY", "DO_YOU_WANT_TO_CONTINUE?").then(function() {
                        CheckInService.checkInTemplate(saveReservationModel);
                    });
                } else {
                    CheckInService.checkInTemplate(saveReservationModel);
                }
            }
        },
        processBook: function(saveReservationModel){
            if (BookService.checkValidBeforeBook(saveReservationModel)) {
                BookService.processBook(saveReservationModel);
            }
        },
        processCheckOut: function(saveReservationModel){
            if (CheckOutService.checkValidBeforeCheckOut()){
                if (saveReservationModel != null){
                    if (true){
                        this.setSaveReservationModel(saveReservationModel);
                        $mdDialog.show({
                            templateUrl: 'views/sharedFeatures/saveReservation/checkOut/checkOutDialog.html',
                            targetEvent: event,
                            parent: angular.element(document.body),
                            clickOutsideToClose: true,
                            controller: ProcessCheckOutController
                        });
                    }
                    function ProcessCheckOutController($scope, $mdDialog){
                        $scope.hide = function () {
                            $mdDialog.hide();
                        };
                        $scope.cancel = function () {
                            $mdDialog.cancel();
                        };
                    }
                }
            }

        },
        getSaveReservationModel: function(){
            return saveReservationModel;
        },
        setSaveReservationModel: function(_saveReservationModel){
            saveReservationModel = _saveReservationModel;
        },
    };
    return SaveReservationService;
}]);