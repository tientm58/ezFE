var globalInvoiceId = 0;
var hotelFormPOSInvoiceReportFile="POSInvoiceA4.trdx";
ezCloud.controller('POSInvoiceDetailController', ['$scope', '$mdBottomSheet', '$rootScope', '$log', 'commonFactory', 'loginFactory', '$stateParams', 'roomListFactory', 'dialogService', '$state', '$mdDialog', '$locale', '$filter', '$localStorage', 'configFactory', '$mdMedia', 'smartCardFactory', '$timeout', '$location', 'reservationFactory', 'walkInFactory', 'POSFactory',
    function($scope, $mdBottomSheet, $rootScope, $log, commonFactory, loginFactory, $stateParams, roomListFactory, dialogService, $state, $mdDialog, $locale, $filter, $localStorage, configFactory, $mdMedia, smartCardFactory, $timeout, $location, reservationFactory, walkInFactory, POSFactory) {

        $scope.hotelFormPOSInvoiceReport = [];
        function Init(){
            jQuery(document).unbind('keydown');
            if (POSFactory.checkIfPOSModuleActive()) {
                if (!$stateParams.invoiceId){
                    return;
                }

                $scope.ContactInformation = {};
                $scope.Charges = [];
                $scope.Payments = [];
                var getPOSInvoiceDetail = loginFactory.securedGet("api/POS/GetPOSInvoiceDetail", "invoiceId=" + $stateParams.invoiceId);
                $rootScope.dataLoadingPromise = getPOSInvoiceDetail;
                getPOSInvoiceDetail.success(function(dataPOS){

                    // POS Config
                    if (dataPOS != null && dataPOS.posConfig != null){
                        $scope.posConfig = dataPOS.posConfig;
                        $scope.hotelFormPOSInvoiceReport      ="POSInvoice"+dataPOS.posConfig.InvoiceType+".trdx"; //Invoice.FormType + Invoice.Value + '.trdx';
                    }
                    if (dataPOS!=null && dataPOS.listUser!=null)
                    {
                        $scope.listUser=dataPOS.listUser;
                    }
                    if (dataPOS != null && dataPOS.currentInvoice != null){
                        var data = dataPOS.currentInvoice;
                        var createdUser='';
                        if($scope.listUser && $scope.listUser.length>0){
                            for(var idx in $scope.listUser) {
                                var user=$scope.listUser[idx];
                                if(user.UserId==data.CreatedUserId){
                                    if (user.Email)
                                        createdUser=user.Email;
                                    else
                                        createdUser=user.StaffName;
                                }

                            }
                        }

                        // Invoice Details
                        $scope.InvoiceDetails = {
                            POSPaymentTravellerId:data.POSPaymentTravellerId,
                            POSPaymentNumber: data.POSPaymentNumber,
                            CreatedDate: new Date(data.CreatedDate),
                            CreatedUser: createdUser,//data.CreatedUserAspNetUsers.Email,
                            DiscountFlat: data.DiscountFlat,
                            DiscountPercentage: data.DiscountPercentage,
                            DiscountAmount: data.DiscountAmount,
                            DiscountReason: data.DiscountReason
                        };



                        // Contact Information
                        $scope.ContactInformation = {
                            Fullname: data.Travellers.Fullname != null ? data.Travellers.Fullname : "N/A",
                            Birthday: data.Travellers.Birthday != null ? new Date(data.Travellers.Birthday) : "N/A",
                            IdentityNumber: data.Travellers.IdentityNumber != null ? data.Travellers.IdentityNumber : "N/A",
                            Mobile: data.Travellers.Mobile != null ? data.Travellers.Mobile : "N/A",
                            Email: data.Travellers.Email != null ? data.Travellers.Email : "N/A",
                            Note: data.Travellers.Note != null ? data.Travellers.Note : "N/A",
                        };

                        // Charges
                        for(var index in data.RoomExtraServicesList){
                            var roomES = data.RoomExtraServicesList[index];
                            var roomESItems = _.filter(data.RoomExtraServiceItemsList, function(item){
                                return item.RoomExtraServiceId == roomES.RoomExtraServiceId;
                            });
                            if (roomESItems != null && roomESItems.length > 0){
                                for(var itemIdx in roomESItems){
                                    var charge = {
                                        chargeName: roomESItems[itemIdx].ExtraServiceItems.ExtraServiceItemName,
                                        chargeQuantity: roomESItems[itemIdx].Quantity,
                                        chargeUnitPrice: roomESItems[itemIdx].ExtraServiceItems.Price,
                                        chargeTotal: roomESItems[itemIdx].Price,
                                        chargeCreatedDate: new Date(roomES.CreatedDate),
                                        chargeCreatedUser: createdUser //roomES.CreatedUserAspNetUsers.Email
                                    };
                                    $scope.Charges.push(charge);
                                }
                            }
                            else{
                                var charge = {
                                    chargeName: roomES.RoomExtraServiceDescription,
                                    chargeQuantity: roomES.Quantity,
                                    chargeUnitPrice: roomES.Amount/roomES.Quantity,
                                    chargeTotal: roomES.Amount,
                                    chargeCreatedDate: new Date(roomES.CreatedDate),
                                    chargeCreatedUser: createdUser//roomES.CreatedUserAspNetUsers.Email
                                }
                                $scope.Charges.push(charge);
                            }
                        } 
                        $log.log(111111111111, "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
                        // Payments
                        if (data.POSPaymentTravellerPaymentsList != null && data.POSPaymentTravellerPaymentsList.length > 0){
                            for (var index in data.POSPaymentTravellerPaymentsList){
                                var ptp = data.POSPaymentTravellerPaymentsList[index];
                                //for (var paymentIdx in ptp.Payments){
                                    var payment = ptp.Payments;
                                    console.info("payment", payment);
                                    var paymentAmount = "";
                                    var paymentMothodName="";
                                    if (payment.AmountInSpecificMoney != null && payment.MoneyId != $rootScope.HotelSettings.DefaultMoneyId){
                                        paymentAmount = $rootScope.CurrencyMaster.AlphabeticCode + " " + $filter('currency')(payment.Amount, "", $rootScope.decimals) + "(" + $filter('currency')(payment.AmountInSpecificMoney, "",parseInt(payment.Money.Currencies.MinorUnit)) + payment.Money.Currencies.AlphabeticCode + ")";
                                        //paymentMothodName=payment.PaymentMethods.PaymentMethodName;
                                    }
                                    else{
                                        paymentAmount = $rootScope.CurrencyMaster.AlphabeticCode + " " +$filter('currency')(payment.Amount, "", $rootScope.decimals);
                                        
                                } 
                                    paymentMothodName=payment.PaymentMethods.PaymentMethodName;
                                    
                                    var paymentTemp = {
                                        PaymentMethodName:paymentMothodName,
                                        paymentAmount: paymentAmount,
                                        paymentCreatedDate: new Date(payment.CreatedDate),
                                        paymentCreatedUser: createdUser//payment.CreatedUserAspNetUsers.Email
                                    }
                                    $scope.Payments.push(paymentTemp);
                                //}
                            }
                        }

                        console.info("$scope.Payments", $scope.Payments);

                    }
                }).error(function(err){
                    console.log(err);
                });
            }



        }

        $timeout(function () {
            Init();
        }, 500);

        $scope.showInvoice = function (ev, POSPaymentTravellerId) {
            $mdDialog.show({
                    controller: POSPaymentTravellerController,
                    locals: {
                        reservationRoomId: POSPaymentTravellerId,
                        hotelFormPOSInvoiceReport:$scope.hotelFormPOSInvoiceReport
                    },
                    templateUrl: 'views/templates/invoicePOSPayment.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: false
                })
                .then(function (answer) {}, function () {

                });
        };

        function POSPaymentTravellerController($scope, $mdDialog, reservationRoomId, hotelFormPOSInvoiceReport) {

            //showInvoice(reservationRoomId);
            console.log('stateParams.reservationRoomId', reservationRoomId, hotelFormPOSInvoiceReport);
            globalInvoiceId = reservationRoomId;
            hotelFormPOSInvoiceReportFile=hotelFormPOSInvoiceReport;
            // _PaymentNumber = 0;
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
        }

        $scope.goToCrateInvoice = function(){
            $location.url('/POSInvoice');
        }
        
    }]);