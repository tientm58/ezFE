ezCloud.factory("cityLedgerFactory", ['$http', 'loginFactory', '$rootScope', '$mdDialog', 'dialogService', '$q','$filter','$timeout', function($http, loginFactory, $rootScope, $mdDialog, dialogService, $q,$filter,$timeout) {

    var cityLedgerFactory = {

        getDataInit: function(callback) {
            var getDataInit = loginFactory.securedGet("api/CityLedger/GetDataInit");
            $rootScope.dataLoadingPromise = getDataInit;
            getDataInit.success(function(data) {
                if (callback) callback(data);
            }).error(function(err) {
                console.log("ERRORRRRR", err);
            });
        },

        processSearch: function(search, callback) {
            //var dataTemp = angular.copy(search);
            //var From=dataTemp.From.format("yyyy-mm-dd");
            //var To=dataTemp.To.format("yyyy-mm-dd");
            //search.From=From;
            //search.To=To;

            var processSearch = loginFactory.securedPostJSON("api/CityLedger/processSearch", search);
            $rootScope.dataLoadingPromise = processSearch;
            processSearch.success(function(data) {
                var result=resolveProcessSearch(data);
                console.log("result", result);
                if (callback) callback(result);
            }).error(function(err) {
                console.log("ERRORRRRR", err);
            });
        },

        processPayment: function(payment,el) {

            var keys = ["RES_NO", "ROOM","NOTIFICATION_CITY_LEDGER_NEWPAYMENT", "NOTIFICATION_NEWPAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER", "NOTIFICATION_BOOKED_CONTENT", "NOTIFICATION_BOOKED_NAN_CONTENT"];
            var languageKeys = {};
            for (var idx in keys) {
                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
            }
            //payment.ReservationRoomId = $stateParams.reservationRoomId;
            var paymentModel = {
                payment: payment,
                languageKeys: languageKeys
            };

            console.log('PaymentModel',paymentModel) ;   
            var promise = loginFactory.securedPostJSON("api/CityLedger/AddPayment", paymentModel);
            $rootScope.dataLoadingPromise = promise;
            promise.success(function (id) {
              
                $timeout(function () {
                    angular.element(el).triggerHandler('click');
                }, 0);
                dialogService.toast("ADD_PAYMENT_SUCCESSFUL");
            }).error(function (err) {
                if (err.Message) {
                    dialogService.messageBox("ERROR", err.Message);
                }
            });
        },
        processDeletePayment: function (payment,el)
        {
            var keys = ["RES_NO", "ROOM","NOTIFICATION_DELETED_CITY_LEDGER_PAYMENT","NOTIFICATION_WHEN_DELETE_PAYMENT", "NOTIFICATION_REFUND", "NOTIFICATION_DEPOSIT", "CASH", "CREDIT", "BANK_TRANSFER", "CITY_LEDGER", "NOTIFICATION_DELETED_PAYMENT"];
            var languageKeys = {};
            for (var idx in keys) {
                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
            }
            var paymentModel = {
                payment: payment,
                languageKeys: languageKeys
            };

            console.log('PaymentModel',paymentModel) ;   
            var promise = loginFactory.securedPostJSON("api/CityLedger/DeletePayment", paymentModel);
            $rootScope.dataLoadingPromise = promise;
            promise.success(function (id) {
                $timeout(function () {
                    angular.element(el).triggerHandler('click');
                }, 0);
                dialogService.toast("DELETE_PAYMENT_SUCCESSFUL");
             
            }).error(function (err) {
                if (err.Message) {
                    dialogService.messageBox("ERROR", err.Message);
                }
            });

        },


    } ;


    function resolveProcessSearch(data) {

        var dataTemp = angular.copy(data);
        var GeneralInfo = dataTemp.GeneralInfo;
        var payments = dataTemp.paymentList;
        var currencies=dataTemp.GeneralInfo.Money;
        var currenciesISO=dataTemp.GeneralInfo.CurrenciesISO;
        var hotelFormRoomReceipt=dataTemp.hotelFormRoomReceipt;
        var listUser=dataTemp.listUser;
        var totalRemaining=0;
        var totalCityLedger=0;
        var totalBalanceBefore=0;
        var result= new Array();
       

        totalRemaining=dataTemp.totalBalanceBefore;
        for (var index in payments) {
            payments[index].Credit=payments[index].PaymentMethodName!='CITY_LEDGER'?payments[index].Amount*-1:"-"
            payments[index].Debit=payments[index].PaymentMethodName=='CITY_LEDGER'?payments[index].Amount:"-"
            if (payments[index].RefPaymentId==null)
            {
                totalRemaining +=payments[index].PaymentMethodName=='CITY_LEDGER'?payments[index].Amount:payments[index].Amount*-1;
                totalCityLedger +=payments[index].PaymentMethodName!='CITY_LEDGER'?payments[index].Amount:0;
            }
            payments[index].Balance=totalRemaining
            var temp = new Date(payments[index].CreatedDate);
            payments[index].CreatedDate = new Date(payments[index].CreatedDate);
            if(listUser && listUser.length>0){
                for(var idx in listUser) {
                    var user=listUser[idx];
                    if(user.UserId==payments[index].CreatedUserId){
                        if (user.Email)
                            payments[index].UserName=user.Email;
                        else
                            payments[index].UserName=user.StaffName;
                    }

                }
            }
        };

        
        if (payments.length > 0) {
            
            for (var i = 0; i < payments.length - 1; i++) {
                if (payments[i] != null) {
                    for (var j = i + 1; j < payments.length; j++) {
                        if (payments[j] != null && payments[j].RefPaymentId != null && payments[j].RefPaymentId == payments[i].PaymentId) {
                            payments[i].DeletedUserName = payments[j].UserName;
                            payments[i].DeletedDate = new Date(payments[j].CreatedDate);
                            payments[i].DeletedDescription = payments[j].PaymentDescription;
                            payments[i].isDeleted = true;
                            payments[j] = null;
                        }

                    }
                }
            }
        };

        var newPayments = new Array();
        var paymentsCityLedger  = new Array();
        //console.log('currencies,currenciesISO:',currencies,currenciesISO);
        for (var index in payments) {
        
            if (payments[index]) {
                
                
                if (payments[index].PaymentMethodName!='CITY_LEDGER' && (payments[index].RefPaymentId===null || payments[index].isDeleted===true) )
                {
                    paymentsCityLedger.push(payments[index])
                }

                if (payments[index].AmountInSpecificMoney) {
                    payments[index].MoneyName = null;
                    for (var idx in currencies) {
                        //console.log('CurrMoneyId, MoneyId:',currencies[idx].MoneyId,payments[index].MoneyId);
                        if (currencies[idx].MoneyId == payments[index].MoneyId) {
                            payments[index].MoneyName = currencies[idx].MoneyName;
                            //console.log('MoneyName:',payments[index].MoneyName);
                            angular.forEach(currenciesISO,function(arr){
                                if(currencies[idx].CurrencyId==arr.CurrencyId){
                                    payments[index].MinorUnitInSpecificMoney=arr.MinorUnit;
                                }
                            })
                        }
                    }
                }

                if (payments[index].RefPaymentId==null)
                {
                    newPayments.push(payments[index]);
                }
            }

            
        };

        Payments = newPayments;
        result.GeneralInfo=GeneralInfo;
        result.payments=Payments;
        result.currencies=currencies;
        result.currenciesISO=currenciesISO;
        result.totalRemaining=totalRemaining
        result.paymentsCityLedger=paymentsCityLedger;
        result.hotelFormRoomReceipt=hotelFormRoomReceipt;
        result.totalCityLedger=totalCityLedger;
        result.totalBalanceBefore=dataTemp.totalBalanceBefore;
        console.log('Payments convert:',result)
        return result;


    }    
	
    return cityLedgerFactory;

}]);