ezCloud.controller('newCityLedgerPaymentController', ['$scope', '$rootScope', '$state', 'dialogService', '$localStorage', 'loginFactory', '$mdDialog', '$mdStepper', 'cityLedgerFactory', '$timeout', '$filter', '$mdMedia',

	function ($scope, $rootScope, $state, dialogService, $localStorage, loginFactory, $mdDialog, $mdStepper, cityLedgerFactory, $timeout, $filter, $mdMedia) {


		function addDays(date, days) {
			var result = new Date(date);
			result.setDate(result.getDate() + days);
			return result;
		}

		function change_alias(alias) {
			var str = alias;
			str = str.toLowerCase();
			str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ  |ặ|ẳ|ẵ/g, "a");
			str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
			str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
			str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ  |ợ|ở|ỡ/g, "o");
			str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
			str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
			str = str.replace(/đ/g, "d");
			str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'| |\"|\&|\#|\[|\]|~|$|_/g, "");
			str = str.replace(/-+-/g, "");
			str = str.replace(/^\-+|\-+$/g, "");
			return str;
		}

		function Init() {
			$scope.DatePickerOption = {
				format: 'dd/MM/yyyy'
			};
			$scope.fromString = new Date().format('dd/mm/yyyy');
			$scope.toString = addDays(new Date(), 1).format('dd/mm/yyyy');
			$scope.createdDate = new Date();//.format('dd/mm/yyyy');

			$scope.search = {
				CompanyId: null,
				From: new Date(),
				To: addDays(new Date(), 1)
			}


			$scope.alternative = $mdMedia('xs');
			$scope.payment = {
				PaymentMethodId: 1,
				PaymentTypeName: 'NEW_PAYMENT',
				Amount: 0,

			};

			$scope.isUseTHUCHI = null;
			var ezHotelModulesList = $rootScope.HotelSettings.EzHotelModulesList;
			if (ezHotelModulesList != null && ezHotelModulesList.length > 0) {
				var thuchiModule = _.filter(ezHotelModulesList, function (module) {
					return module.EzModules != null && module.EzModules.ModuleCode == "THUCHI" && module.EzModules.Status == true && module.Status == true;
				});
				$scope.isUseTHUCHI = thuchiModule == null || thuchiModule.length == 0 ? false : true;
			}

			$scope.selectedCompany = null;
			$scope.queryCompanySearch = queryCompanySearch;
			$scope.selectedCompanyChange = selectedCompanyChange;
			$scope.searchCompanyTextChange = searchCompanyTextChange;


			cityLedgerFactory.getDataInit(function (data) {
				$scope.CityLedgerData = data;
				$scope.companyList = data.Companys;
				$scope.payment.MoneyId = data.GeneralInfo.DefaultHotelMoneyId;

				//Currencies
				//$scope.payment.MoneyId=null;
				$scope.currencies = data.GeneralInfo.currencies;
				$scope.currenciesISO = data.GeneralInfo.currenciesISO;
				$scope.defaultCurrency = data.GeneralInfo.defaultCurrency;
				$scope.decimal = $rootScope.decimals;
			});

		};

		$scope.$watchCollection("payment.MoneyId", function (newValues, oldValues) {

			console.log('change payment.moneyid:', $scope.watchCollectionMoneyId);

			if ($scope.watchCollectionMoneyId != null && $scope.watchCollectionMoneyId === false) {
				$scope.watchCollectionMoneyId = true;
				return;
			}

			if (newValues && oldValues) {
				var amountTemp = angular.copy($scope.payment.Amount);
				var oldMoney = _.filter($scope.currencies, function (item) {
					return item.MoneyId == oldValues;
				})[0];
				var currentMoney = _.filter($scope.currencies, function (item) {
					return item.MoneyId == newValues;
				})[0];
				var currentCurrency = _.filter($scope.currenciesISO, function (item) {
					return item.CurrencyId == currentMoney.CurrencyId;
				})[0];
				$scope.decimal = currentCurrency.MinorUnit;
				$timeout(function () {
					$scope.payment.Amount = amountTemp * oldMoney.ExchangeRate / currentMoney.ExchangeRate;
				}, 0);
			}
		});



		Init();

		function queryCompanySearch(query) {
			var results = query ? $scope.companyList.filter(createCompanyFilterFor(query)) : $scope.companyList,
				deferred;
			if (self.simulateQuery) {
				deferred = $q.defer();
				$timeout(function () {
					deferred.resolve(results);
				}, Math.random() * 1000, false);
				return deferred.promise;
			} else {
				return results;
			}
		}

		function selectedCompanyChange(item) {
			console.log("ITEM", item);
			if (item !== undefined) {
				$scope.selectedCompany = item;
				var selectedSourceTemp = _.filter($scope.sourceList, function (item) {
					return item.SourceId && item.SourceId == $scope.selectedCompany.SourceId;
				});
				if (selectedSourceTemp.length > 0)
					$scope.selectedSource = selectedSourceTemp[0];
				console.log("SOURCE LIST", item, $scope.selectedSource, $scope.sourceList);
			} else {
				$scope.selectedCompany = null;
			}

		}

		function searchCompanyTextChange(text) {
			$scope.searchCompanyText = text;
			/*console.log("TEXT", text);
			if (!text || text.trim() ===''){
				console.log("TEXT", text);
				$scope.selectedCompany = null;
			}*/
		}

		function createCompanyFilterFor(query) {
			var lowercaseQuery = change_alias(query);
			return function filterFn(item) {
				return (change_alias(item.CompanyName.toLowerCase()).indexOf(lowercaseQuery) >= 0 || change_alias(item.CompanyCode.toLowerCase()).indexOf(lowercaseQuery) >= 0);
			};
		}

		$scope.processSearch = function () {

			if ($scope.selectedCompany == null || $scope.selectedCompany.CompanyId == null) {
				dialogService.messageBox("WARNING", "PLEASE_SELECT_A_COMPANY_TO_PERFORM_SEARCH_ACTION");
				return;
			}

			if ($scope.search.From && $scope.search.To && $scope.search.From > $scope.search.To) {
				dialogService.messageBox("INVALID_FROM/TO_DATE", "PLEASE_SELECT_A_VALID_DATE_TO_PERFORM_SEARCH_ACTION");
				return;
			}

			if (($scope.search.From === null && $scope.fromString !== '') || ($scope.search.To === null && $scope.toString !== '')) {
				dialogService.messageBox("INVALID_FROM/TO_DATE", "PLEASE_SELECT_A_VALID_DATE_TO_PERFORM_SEARCH_ACTION");
				return;
			}

			//$scope.watchCollectionMoneyId=false;


			var fromDate = new Date($scope.search.From);
			var fromDateTemp = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate(), 0, 0, 0);
			$scope.search.From = fromDateTemp;

			var toDate = new Date($scope.search.To);
			var toDateTemp = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate(), 0, 0, 0);
			$scope.search.To = toDateTemp;


			$scope.search.CompanyId = $scope.selectedCompany.CompanyId;

			cityLedgerFactory.processSearch($scope.search, function (data) {
				console.log("SEARCH RESULT", data);


				$scope.searchResult = data.payments;
				$scope.totalBalanceBefore = data.totalBalanceBefore;
				$scope.paymentsCityLedger = data.paymentsCityLedger;
				$scope.currencies = data.currencies;
				$scope.currenciesISO = data.currenciesISO;
				$scope.totalCityLedger = data.totalCityLedger;
				$scope.totalRemaining = data.totalRemaining;

				//$scope.decimal = $rootScope.decimals;

				$scope.payment.MoneyId = data.GeneralInfo.DefaultHotelMoneyId;
				$scope.payment.Amount = data.totalRemaining;


				var Receipt = data.hotelFormRoomReceipt;
				$scope.hotelFormRoomReceipt = Receipt.FormType + Receipt.Value + 'CityLedger.trdx';




				//Currencies
				//$scope.payment.MoneyId=null;
				//$scope.payment.MoneyId=data.GeneralInfo.DefaultHotelMoneyId;
				//$scope.defaultCurrency = data.GeneralInfo.defaultCurrency;



			});

		};




		$scope.processAddPayment = function () {
			if ($scope.selectedCompany == null || $scope.selectedCompany.CompanyId == null) {
				dialogService.messageBox("WARNING", "PLEASE_SELECT_A_COMPANY_TO_PERFORM_SEARCH_ACTION");
				return;
			}
			if (($scope.createdDate === null && $scope.fromString !== '')) {
				dialogService.messageBox("INVALID_FROM/TO_DATE", "PLEASE_SELECT_A_VALID_DATE_TO_ADD_NEWPAYMENT_ACTION");
				return;
			}
			var payment = angular.copy($scope.payment);
			if (!payment.Amount) {
				dialogService.messageBox("INVALID_AMOUNT", "PAYMENT_AMOUNT_CAN_NOT_BE_NULL");
				return;
			}
			if (payment.Amount <= 0) {
				dialogService.messageBox("INVALID_AMOUNT", "PAYMENT_AMOUNT_CAN_NOT_LESS_THAN_OR_EQUAL_TO_0");
				return;
			}

			//console.log('Company:',$scope.selectedCompany.CompanyId);


			var confirm;
			if (payment.MoneyId != $scope.defaultCurrency.MoneyId) {
				for (var index in $scope.currencies) {
					if ($scope.currencies[index].MoneyId == payment.MoneyId) {
						var decimal = _.filter($scope.currenciesISO, function (item) {
							return item.CurrencyId == $scope.currencies[index].CurrencyId;
						})[0].MinorUnit;
						//var paymentTemp = angular.copy(payment);
						payment.AmountInSpecificMoney = payment.Amount;
						payment.Amount = payment.Amount * $scope.currencies[index].ExchangeRate;
						confirm = dialogService.confirm("NEW_PAYMENT_CONFIRM", $filter("currency")(payment.Amount) + "(" + $scope.currencies[index].MoneyName + " " + +payment.AmountInSpecificMoney.toFixed(decimal) + ")");
						break;
					}
				}
			} else {
				confirm = dialogService.confirm("NEW_PAYMENT_CONFIRM", $filter("currency")(payment.Amount));
			}

			confirm.then(function () {

				payment.CompanyId = $scope.selectedCompany.CompanyId;

				var createdDateToDate = new Date($scope.createdDate);

				var currDateTemp = new Date();
				var createDateTemp = new Date(createdDateToDate.getFullYear(), createdDateToDate.getMonth(), createdDateToDate.getDate(), currDateTemp.getHours(), currDateTemp.getMinutes(), 0);

				payment.createdDate = createDateTemp;
				console.log('payment:', payment);

				var el = document.getElementById('search');

				$scope.watchCollectionMoneyId = false;

				cityLedgerFactory.processPayment(payment, el);

				//Init();


			});


		};



		$scope.isPaymentDelete = false;
		$scope.deletePayment = function (event, payment) {

			var paymentTemp = angular.copy(payment);
			paymentTemp.RefPaymentId = paymentTemp.PaymentId;
			console.log('delete paymentid:', paymentTemp.RefPaymentId);
			paymentTemp.PaymentTypeName = "DELETED";
			$mdDialog.show({
				controller: DeletePaymentDialogController,
				resolve: {
					payment: function () {
						return paymentTemp;
					},
				},
				templateUrl: 'views/templates/deletePayment.tmpl.html',
				parent: angular.element(document.body),
				targetEvent: event,
			}).then(function (deleteReason) {
				console.log(deleteReason);
				paymentTemp.PaymentDescription = deleteReason;
				var el = document.getElementById('search');
				cityLedgerFactory.processDeletePayment(paymentTemp, el);
			}, function () {

			});
		};

		function DeletePaymentDialogController($scope, $mdDialog, payment, loginFactory) {

			function Init() {
				$scope.payment = payment;
				$scope.deleteReason = null;
			}
			Init();

			$scope.processDelete = function () {
				console.log($scope.deleteReason);
				$mdDialog.hide($scope.deleteReason);
			}

			$scope.hide = function () {
				$mdDialog.hide();
			};
			$scope.cancel = function () {
				$mdDialog.cancel();
			};
		};

		$scope.showPayment = function (ev, payment) {
			$mdDialog.show({
				controller: PaymentController,
				locals: {
					paymentId: payment.PaymentId,
					hotelFormRoomReceipt: $scope.hotelFormRoomReceipt
				},
				templateUrl: 'views/templates/invoicePaymentCityLedger.tmpl.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose: false
			})
				.then(function (answer) { }, function () {

				});
		};

		function PaymentController($scope, $mdDialog, paymentId, hotelFormRoomReceipt) {

			//showInvoice(reservationRoomId);
			console.log('stateParams.reservationRoomId', hotelFormRoomReceipt);
			PaymentId = paymentId;
			HotelFormRoomReceipt = hotelFormRoomReceipt;
			$scope.hide = function () {
				$mdDialog.hide();
			};
			$scope.cancel = function () {
				$mdDialog.cancel();
			};
		}


	}]);