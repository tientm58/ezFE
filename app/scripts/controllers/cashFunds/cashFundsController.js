
ezCloud.controller('CashFundsController', ['$scope', '$rootScope', '$state', '$location', '$mdDialog', '$filter', 'loginFactory', 'utilsFactory', '$localStorage', 'dialogService', 'commonFactory', '$mdMedia',  function($scope, $rootScope, $state, $location, $mdDialog, $filter, loginFactory, utilsFactory, $localStorage, dialogService, commonFactory, $mdMedia){

	var TO_DAY = 0, TOMMORROW = 1, THIS_WEEK = 2, NEXT_WEEK = 3, THIS_MONTH = 4, PREVIOUS_MONTH = 5, BANK_STATUS = {'cancel': 3, 'live': 1},
		THIS_QUARTER = 6, PREVIOUS_QUARTER = 7, SIX_MONTH_PREVIOUS = 8, THIS_YEAR = 9, PREVIOUS_YEAR = 10, SUCCESS_CODE = 0, INVOICE_FUND = {'cashFunds' : 1, 'depositFunds': 2}, INVOICE_GROUP = {'income': 1, 'outcome': 2}, INVOICE_TYPE = {'income': {1: $filter('translate')('OTHER_RECEIPT'), 2: $filter('translate')('DEBT_RECEIPT')}, 'outcome': {1: $filter('translate')('OTHER_PAY'), 2: $filter('translate')('PAY_SUPPLIERS')}};

	$scope.self = {
		startSearch: 10,
		maxDate: moment().toDate(),
		times: [
			{
				value: 0,
				description: $filter('translate')('TODAY')
			},
			/*{
				value: 1,
				description: $filter('translate')('TOMORROW')
			},*/
			{
				value: 2,
				description: $filter('translate')('THIS_WEEK')
			},
			/*{
				value: 3,
				description: $filter('translate')('NEXT_WEEK')
			},*/
			{
				value: 4,
				description: $filter('translate')('THIS_MONTH')
			},{
				value: 5,
				description: $filter('translate')('PREVIOUS_MONTH')
			},{
				value: 6,
				description: $filter('translate')('THIS_QUARTER')
			},{
				value: 7,
				description: $filter('translate')('PREVIOUS_QUARTER')
			},{
				value: 8,
				description: $filter('translate')('SIX_MONTH_PREVIOUS')
			},{
				value: 9,
				description: $filter('translate')('THIS_YEAR')
			},{
				value: 10,
				description: $filter('translate')('PREVIOUS_YEAR')
			}
		],
		itemsType: [
			{
				value: INVOICE_GROUP.income,
				description: $filter('translate')('EXPENDITURE_MANAGE_RECEIPT')
			},
			{
				value: INVOICE_GROUP.outcome,
				description: $filter('translate')('EXPENDITURE_MANAGE_PAYMENT')
			}
		],
		filters: {
			startDate: new Date(),
			endDate: new Date(),
			selectedTime: null,
			selectedItemType: INVOICE_GROUP.income,
			selectedAfterSearch: 1
		},
		data: [],
		bookDetails: {
			dataList: [],
			filters: {
				StartDate: new Date(),
				EndDate: new Date()
			},
			currencies: ['VND', 'USD', 'SGD'],
			totalBalance: 0,
			totalPeriodPaymentOrderBalance: 0,
			totalPeriodReceiptsBalance: 0,
			pagerBookDetail: undefined
		},
		inventory: {
			data: [],
			dataToAddAudit: [],
			currentInventory: {
				reference: []
			},
			participant:[],
			detail:
			{
				data: [],
				balance: [{'VND':1000000}, {'USD':1000}, {'Lao':500}, {'Thailand':500}]
			},
			showFormAddAudit: false,
			invTextButton: $filter('translate')('ADD_INVENTORY'),
			iconInvTextButton: 'img/icons/ic_add_48px.svg',
			colorButton: 'md-accent'
		},
		contrast: {
			dataList: [],
			banklist: [],
			filters: {
				BankAccount: 'all',
				AuditStatus: 0,
			},
			pagerContrast: undefined,
			endingBalanceOnBankAccount: 0, 
			Balance: 0, 
			IncomeInPeriod: 0,
			OutcomeInPeriod: 0,
			DiffAmount: 0,
			isSent: true
		},
		currency: []
	}

	$scope.action = {
		inventory: {
			showFormAddAudit:function()
			{
				$scope.self.inventory.showFormAddAudit = !$scope.self.inventory.showFormAddAudit;
				$scope.self.inventory.invTextButton = $scope.self.inventory.showFormAddAudit === false ? $filter('translate')('ADD_INVENTORY') : $filter('translate')('CANCEL');
				$scope.self.inventory.iconInvTextButton = $scope.self.inventory.showFormAddAudit === false ? 'img/icons/ic_add_48px.svg' : 'img/icons/ic_cancel_48px.svg';
				$scope.self.inventory.colorButton = $scope.self.inventory.showFormAddAudit === false ? 'md-accent' : 'md-warn';
			},
			getInfoToAddInvoiceAudit: function()
			{
				var infoPromise = {};
				var dataToAddAudit = $scope.self.inventory.dataToAddAudit;
				if(_.isEmpty(dataToAddAudit))
				{
					infoPromise = utilsFactory.sendGetRequest('api/InvoiceAudits/GetInfoToAddInvoiceAudit');

					infoPromise.then(function(data, status, headers, config){
						dataToAddAudit = data.data && data.data.Data ? data.data.Data : [];
					});
				}

				if(_.isEmpty($scope.self.currency) || _.isEmpty($scope.self.listCurrencies))
				{
					infoPromise = utilsFactory.sendGetRequest('api/InvoiceAudits/GetListMoneyForAudit');

					infoPromise.then(function(data, status, headers, config){
						$scope.self.currency = data.data && data.data.Data ? _.pluck(data.data.Data, 'MoneyName') : [];
						$scope.self.listCurrencies = data.data && data.data.Data ? data.data.Data : [];
						var indexC = {};
						$scope.self.listCurrencies.forEach(function (element) {
							indexC[element.MoneyName] = element;
						});
						$scope.self.indexCurrencies = indexC;
					});
				}
			},
			addCheckRealAudit: function(currency)
			{	
				if($scope.self.inventory.detail.data.hasOwnProperty(currency))
					$scope.self.inventory.detail.data[currency].push(this.getBaseDataDetail());
				else
					$scope.self.inventory.detail.data[currency] = [this.getBaseDataDetail()];
			},
			removeCheckRealAudit: function (currency, item)
			{
				if(!$scope.self.inventory.detail.data.hasOwnProperty(currency))
					return;

				var index = $scope.self.inventory.detail.data[currency].indexOf(item);
				return $scope.self.inventory.detail.data[currency].splice(index, 1);
			},
			checkAuditData: function(currency)
			{
				return $scope.self.inventory.detail.data[currency] || [];
			},
			calcAmount: function(item)
			{
				return item.amount = item.price*item.quantity;
			},
			getBalanceAmount: function(currency)
			{
				var bal = _.find($scope.self.inventory.detail.balance, function(obj, index){return obj[currency]}) || [];
				return bal[currency] || [];
			},
			getBias: function(currency)
			{
				return this.getBalanceAmount(currency) - this.getTotalAmount(currency);
			},
			getTotalAmount: function(curr)
			{
				return _.reduce(_.pluck(($scope.self.inventory.detail.data[curr] || []), 'amount'), function(val, num){ return val + num; }, 0);
			},
			getBaseDataDetail: function()
			{
				return {
					_id: 0,
					price: null,
					quantity: null,
					amount: 0,
					description: ''
				}
			},
			getBaseParticipant: function()
			{
				return {
					_id: 0,
					fullName: '',
					title: '',
					represent: ''
				}
			},
			getAuditDetail: function()
			{
				var currencies = $scope.self.listCurrencies || [];
				var detailData = $scope.self.inventory.detail.data;

				return _.flatten(_.map(_.keys(detailData), function(key){
					return _.map(detailData[key], function(item){
						return {
							'Description': item.description || "",
							'Denomination': item.price ? item.price : 0,
							'Quantity': item.quantity? item.quantity : 0,
							'Amount': item.amount ? item.amount : 0,
							'CreatedDate': new Date(),
							'MoneyName': key,
							'MoneyId': (_.find(currencies, function(item){return (item['MoneyName'] || "" ) === key}) || {}).MoneyId
						}
					})
				}));
			},
			getAuditMember: function()
			{
				return _.map(($scope.self.inventory.participant || []), function(item, key){
					return {
						'FullName': item.fullName || "",
						'Title': item.title || "",
						'Deputation': item.represent || "",
					}
				});
			},
			addParticipant: function()
			{
				return $scope.self.inventory.participant.push(this.getBaseParticipant());
			},
			process: function(event)
			{
				var currentAudit = $scope.self.inventory.currentInventory;
				var auditParams = {
					'Audit' : {
						'Purpose': currentAudit.target ? currentAudit.target : "",
						'CreatedDate' : new Date(),
						'AuditToDate': currentAudit.endDate ? currentAudit.endDate : new Date(),
						'DateAudit': currentAudit.auditDate ? currentAudit.auditDate : new Date(),
						'TimeAudit': currentAudit.auditTime ? currentAudit.auditTime : new Date(),
						'AuditNo': currentAudit.inventoryNum ? currentAudit.inventoryNum : "",
						'DifferenceBalance': parseFloat(this.getBias(_.first($scope.self.currency)) || 0)
					},
					'AuditDetail' : this.getAuditDetail() || [],
					'AuditMember' : this.getAuditMember() || []
				}

				var promiseAddAudit = loginFactory.securedPostJSON('api/InvoiceAudits/AddAudit', auditParams);
				var confirm = dialogService.confirm('NOTIFICATION', 'ADD_INVENTORY_CONFIRM', event);
				if(promiseAddAudit && confirm)
					confirm.then(function(){
						promiseAddAudit.then(function(data, config, headers){
							console.log(data);
							dialogService.toast('ADD_INVENTORY_SUCCESS');
							$scope.self.inventory.showFormAddAudit = false;
						});
					});
			}
		},
		invoices: {
			getBankName: function (item){
				var bankId = item.InvoiceGroup == INVOICE_GROUP.income ? item.BankAccReceive : item.HotelBankAccountId;

				return (_.findWhere($scope.self.contrast.banklist, {HotelBankAccountId: parseInt(bankId)}) || {}).BankName || "";
			},
			selectDate: function()
			{
				$scope.self.filters.startDate = moment($scope.self.filters.startDate).startOf('day').toDate();
				$scope.self.filters.endDate = moment($scope.self.filters.endDate).endOf('day').toDate();
			},
			getAmountDetailByCurrency: function(curr, invoiceDetail, type)
			{
				var invGroup = invoiceDetail.InvoiceGroup;

				var moneylist = invoiceDetail.Money || [];
				if(!curr || !_.isArray(moneylist) || _.isEmpty(moneylist))
					return 0;

				var obj = _.find(moneylist, function(money){
					return (money['MoneyName'] === curr) ? (money['SumAmount'] || 0 ) : 0;
				});

				return (invGroup == type || type === null) && obj ? obj : {SumAmount: 0, MoneyName: ""};
				//return invGroup == type || type === null ? (obj ? obj.SumAmount : 0) : 0;
			},
			editInvoice: function (invoice)
			{
				if(!invoice)
					return;

				var url = invoice.InvoiceGroup == INVOICE_GROUP.income ? 'addReceipt' : 'addPayment';

				return $location.path(url).search({
					invoiceId: invoice.InvoiceId,
					invoiceFund: invoice.InvoiceFund,
				});
			},
			deleteInvoice: function (event)
			{
				var invoiceIds = _.pluck($scope.selected, 'InvoiceId') || [];
				if(invoiceIds.length > 0)
				{
					if(invoiceIds.length > 1)
						return dialogService.toastWarn('DELETE_VOUCHER_RULE');

					var confirm = dialogService.confirm('NOTIFICATION', 'NOTIFICATION_VOUCHER_CONFIRM_DELETE', event);
					confirm.then(function(){
						var promise = loginFactory.securedPostJSON('api/Invoices/InvoicesDelete', {'invoiceID': _.first(invoiceIds)});
						promise.success(function(res){
							console.log(res);
							if(res && res.Code === 0)
							{
								dialogService.toast('DELETE_VOUCHER_SUCCESS');
								$scope.selected = [];
								$scope.pager.bindingData(1, 10);
							}
							else
								dialogService.toastWarn('DELETE_VOUCHER_ERROR');
						})
					});
				}
			},
			showReasonDialog : function (event) {
				var dialogController = function ($scope, $mdDialog) {
				    $scope.cancel = function(){return $mdDialog.cancel();}
				    $scope.save = function(){return $mdDialog.hide($scope.reason);}
				  }

				dialogController.$inject = ['$scope', '$mdDialog'];

			    var self = this;
			    var useFullScreen = $mdMedia('xs');
			    var dialog = $mdDialog.show({
			        controller: dialogController,
			        scope: $scope.$new(),
			        templateUrl: 'views/templates/reasonDelInvoice.tmpl.html',
			        parent: angular.element(document.body),
			        fullscreen: useFullScreen,
			        targetEvent: event,
			        clickOutsideToClose: true
			      })
			      
			    return dialog;
		  },
			deleteInvoiceId: function (invoiceId) {
				if (invoiceId > 0) {
					var reasonForm = this.showReasonDialog();
					var confirm = reasonForm.then(function (reason) {
						var promise = loginFactory.securedPostJSON('api/Invoices/InvoicesDelete', { 
							'invoiceID': invoiceId,
							'InvoiceContent': reason || ""
						});
						
						promise.success(function (res) {
							console.log(res);
							if (res && res.Code === 0) {
								dialogService.toast('DELETE_VOUCHER_SUCCESS');
								$scope.selected = [];
								$scope.pager.bindingData(1, 10);
							}
							else
								dialogService.toastWarn('DELETE_VOUCHER_ERROR');
						})
					}, function (reason) {});
				}
			},
			searchInvoice: function()
			{
				$scope.self.filters.selectedAfterSearch = $scope.self.filters.selectedItemType;
				this.selectDate();
				var startDate = new Date($scope.self.filters.startDate);
				startDate.setHours(0);
				startDate.setMinutes(0);
				startDate.setMilliseconds(0);
				startDate.setSeconds(0);
				var endDate = new Date($scope.self.filters.endDate);
				endDate.setHours(24);
				endDate.setMinutes(00);
				endDate.setMilliseconds(00);
				endDate.setSeconds(00);
				return $scope.pager.bindingData(1, 10, {
					StartDate: startDate.toUTCString(),//moment($scope.self.filters.startDate).format("YYYY-MM-DDTHH:mm:ss") + "Z",
					EndDate: endDate.toUTCString(),//moment($scope.self.filters.endDate).format("YYYY-MM-DDTHH:mm:ss") + "Z",
					InvoiceGroup : $scope.self.filters.selectedItemType,
					InvoiceFund: INVOICE_FUND.depositFunds,
					PageSize: 10,
					PageNumber: 0
				});
			}
		},
		bookDetails: {
			selectDate: function()
			{
				$scope.self.bookDetails.filters.StartDate = moment($scope.self.bookDetails.filters.StartDate).startOf('day').toDate(),
				$scope.self.bookDetails.filters.EndDate = moment($scope.self.bookDetails.filters.EndDate).endOf('day').toDate()
			},
			getList: function(act)
			{	
				this.selectDate();
				var startDate = new Date($scope.self.bookDetails.filters.StartDate);
				startDate.setHours(0);
				startDate.setMinutes(0);
				startDate.setMilliseconds(0);
				startDate.setSeconds(0);
				var endDate = new Date($scope.self.bookDetails.filters.EndDate);
				endDate.setHours(24);
				endDate.setMinutes(0);
				endDate.setMilliseconds(0);
				endDate.setSeconds(0);
				var pager = {PageNumber: 0, PageSize: 10, InvoiceFund: INVOICE_FUND.depositFunds};

				if(act && act === 'search')
					pager = angular.extend(pager, {
						'StartDate': startDate.toUTCString(),//moment($scope.self.bookDetails.filters.StartDate).format("YYYY-MM-DDTHH:mm:ss") + "Z",
						'EndDate': endDate.toUTCString(),//moment($scope.self.bookDetails.filters.EndDate).format("YYYY-MM-DDTHH:mm:ss") + "Z"
					});

				return this.initPagination().bindingData(1, 10, pager);
			},
			initPagination: function(pager)
			{
				if(!angular.isUndefined($scope.self.bookDetails.pagerBookDetail))
					return $scope.self.bookDetails.pagerBookDetail;

				/***init pagination for list invoices detail***/
				var bookPager = utilsFactory.getPaginationInstance({
					'api': 'api/Invoices/InvoicesGetAllDetails',
					'totalItems': 10,
					'dataFilter': pager || {},
					'label': {
						page: 'Trang',
						rowsPerPage: 'Số lượng mỗi trang',
						of : 'trong số'
					},
					'successCallBack': function(response)
					{
						if(response && response.Code === SUCCESS_CODE)
						{
							var _data =  response['Data'] && angular.isArray(response['Data']) ? 
											response['Data'] : _.toArray(response['Data'])
							$scope.self.bookDetails.pagerBookDetail.config.totalItems = response && response.Total ? parseInt(response.Total) : _.size(_data);
							$scope.self.bookDetails.dataList = _data || [];
							$scope.self.bookDetails.totalBalance = response.TotalBalance ? response.TotalBalance : 0;
							$scope.self.bookDetails.totalPeriodPaymentOrderBalance = response.TotalPeriodPaymentOrderBalance ? response.TotalPeriodPaymentOrderBalance :  0;
							$scope.self.bookDetails.totalPeriodReceiptsBalance = response.TotalPeriodReceiptsBalance ? response.TotalPeriodReceiptsBalance : 0;
						}
					}
				});

				$scope.self.bookDetails.pagerBookDetail = bookPager;
				return bookPager;
			},
			getAmountDetailByCurrency: function(curr, invoiceDetail, type)
			{
				var invGroup = invoiceDetail.InvoiceGroup;

				var moneylist = (invoiceDetail.ReceiptMoney ? invoiceDetail.ReceiptMoney : invoiceDetail.PaymentMoney) || [];
				if(!curr || !_.isArray(moneylist) || _.isEmpty(moneylist))
					return 0;

				var obj = _.find(moneylist, function(money){
					return (money['MoneyName'] === curr) ? (money['SumAmount'] || 0 ) : 0;
				});

				return (invGroup == type || type === null) && obj ? obj : {SumAmount: 0, MoneyName: ""};
				//return invGroup == type || type === null ? (obj ? obj.SumAmount : 0) : 0;
			},
			getTotalAmountByCurrency: function(curr)
			{

			},
			getAmountPeriod: function()
			{
				var bookDt = $scope.self.bookDetails;
				return (bookDt.totalBalance + bookDt.totalPeriodReceiptsBalance - bookDt.totalPeriodPaymentOrderBalance) || 0;
			}
		},
		contrast: 
		{
			getAccountDefault: function (invoice, bank)
			{
				return parseInt(invoice.InvoiceGroup) == INVOICE_GROUP.income ? (invoice.BankAccReceive == bank.HotelBankAccountId) : (invoice.HotelBankAccountId == bank.HotelBankAccountId);
			},
			searchAuditDeposit: function()
			{
				$scope.self.contrast.isSent = !$scope.self.contrast.isSent;
				var filter = $scope.self.contrast.filters;
				if(filter && filter.BankAccount == 'all')
					filter = {
						AuditStatus: filter.AuditStatus
					}

				return this.getListInvoiceForDepositAudit(filter);
			},
			getTotalExchangeCash: function()
			{
				return _.reduce(_.pluck(($scope.self.contrast.dataList || []), 'Amount'), function(val, num){ return val + num; }, 0);
			},
			getListInvoiceForDepositAudit: function(filter)
			{	
				var pager = {PageNumber: 0, PageSize: 10, InvoiceFund: INVOICE_FUND.depositFunds};

				if(filter)
					pager = angular.extend(pager, filter);

				this.getInfoDeposit();
				return this.initPagination().bindingData(1, 10, pager);
			},
			initPagination: function(pager)
			{
				/*if(!angular.isUndefined($scope.self.contrast.pagerContrast))
					return $scope.self.contrast.pagerContrast;*/

				/***init pagination for list invoices detail***/
				var bookPager = utilsFactory.getPaginationInstance({
					'api': 'api/InvoiceAudits/GetListInvoiceForDepositAudit',
					'totalItems': 10,
					'dataFilter': pager || {},
					'label': {
						page: 'Trang',
						rowsPerPage: 'Số lượng mỗi trang',
						of : 'trong số'
					},
					'successCallBack': function(response)
					{ 
						$scope.self.contrast.isSent = true;
						if(response && response.Code === SUCCESS_CODE)
						{
							var _data =  response['Data'] && angular.isArray(response['Data']) ? 
											response['Data'] : _.toArray(response['Data'])
							$scope.self.contrast.pagerContrast.config.totalItems = response && response.Total ? parseInt(response.Total) : _.size(_data);
							$scope.self.contrast.dataList = _.size(_data) > 0 ? _data : [];
						}
						
					}
				});

				$scope.self.contrast.pagerContrast = bookPager;
				return bookPager;
			},
			getBankSelectedName: function()
			{
				var acc = _.find($scope.self.contrast.banklist, function(item){
					return item.HotelBankAccountId == $scope.self.contrast.filters.BankAccount;
				});
				var name = angular.isObject(acc) ? (acc.BankName + " - " + acc.BankBranch) : "";
				return name;
			},
			isAcceptInvoice: function(item)
			{
				return (item.HotelBankAccountId || item.BankAccReceive) && !_.isEmpty(item.Description);
			},
			confirmInvoice: function(item)
			{
				if(!item || !this.isAcceptInvoice(item))
					return dialogService.toastWarn('COMPARE_INVALID_INVOICE_ERROR');

				if(_.isNull(item.IsCompare))
					item.IsCompare = 1;

				var bankAcc = _.find($scope.self.contrast.banklist, function(obj)
							{
								return obj.HotelBankAccountId == item.HotelBankAccountId;
							});

				if(_.isNull(item.HotelBankAccountName))
					item.HotelBankAccountName = bankAcc ? bankAcc.BankName : "";

				var promise = loginFactory.securedPostJSON('api/InvoiceAudits/CompareInvoice', item);
				promise.success(function(res){
					console.log('compare invoices' + JSON.stringify(res));
					if(res && res.Code === SUCCESS_CODE){
						dialogService.toast('COMPARE_INVOICE_SUCCESS');
						$scope.action.contrast.searchAuditDeposit();
					}
					else
						dialogService.toastWarn('COMPARE_INVOICE_ERROR');
				});
			},
			getEndingBalance: function()
			{
				var contrast = $scope.self.contrast;
				return contrast.Balance + contrast.IncomeInPeriod - contrast.OutcomeInPeriod;
			},
			getDiffAmount: function()
			{
				$scope.self.contrast.DiffAmount = $scope.action.contrast.getEndingBalance() - $scope.self.contrast.endingBalanceOnBankAccount;
				return $scope.action.contrast.getEndingBalance() - $scope.self.contrast.endingBalanceOnBankAccount;
			},
			getBankList: function()
			{
				var promise = utilsFactory.sendGetRequest('api/HotelBankAccount/GetAllBankAccount', {});
				promise.success(function(res){
					if(res && res.Code == SUCCESS_CODE)
					{
						$scope.self.contrast.banklist = res.Data && _.size(res.Data) > 0 ? res.Data : []; 
						if(!_.isEmpty($scope.self.contrast.banklist))
							$scope.self.contrast.banklist = _.where($scope.self.contrast.banklist, {'Status': BANK_STATUS.live});
					}
				});
			},
			getInfoDeposit: function()
			{
				var tmpR = ($scope.self.contrast.filters.BankAccount == "all") ? { "PageSize": 0,"PageNumber":0}:{"BankAccount": $scope.self.contrast.filters.BankAccount};

				var promise = utilsFactory.sendGetRequest('api/InvoiceAudits/GetInfoDepositAudit', tmpR);
				promise.success(function(res){
					if(res && res.Code === SUCCESS_CODE)
					{
						var data = res.Data ? res.Data : {};
						if(!_.isEmpty(data))
						{
							$scope.self.contrast.Balance = data.Balance ? data.Balance  : 0;
							$scope.self.contrast.IncomeInPeriod = data.IncomeInPeriod ? data.IncomeInPeriod: 0;
							$scope.self.contrast.OutcomeInPeriod = data.OutcomeInPeriod ? data.OutcomeInPeriod:0;
							$scope.self.contrast.DiffAmount = $scope.self.contrast.Balance + $scope.self.contrast.IncomeInPeriod - $scope.self.contrast.OutcomeInPeriod;
						}
					}
				});
			},
			initData: function()
			{
				$scope.action.contrast.getBankList();
				$scope.action.contrast.getInfoDeposit();
			},
			process: function(event)
			{
				var self = this;
				var auditObj = {auditId: 0};
				var data = {DifferenceBalance: $scope.action.contrast.getDiffAmount()};
				// data.DifferenceBalance = data.DifferenceBalance < 0 ? -data.DifferenceBalance : data.DifferenceBalance;

				var confirm = dialogService.confirm('NOTIFICATION', 'ADD_DEPOSIT_CONFIRM', event);

				confirm.then(function(){
					var promise = loginFactory.securedPostJSON('api/InvoiceAudits/AddAuditDeposit', { Audit: angular.extend(auditObj, data), BankAccount: $scope.self.contrast.filters.BankAccount });
					promise.success(function(res){
						if(res && res.Code === SUCCESS_CODE){
							dialogService.toast('ADD_SUCCESS');
							$scope.self.contrast.DiffAmount = $scope.self.contrast.endingBalanceOnBankAccount;
                            $scope.self.contrast.endingBalanceOnBankAccount = 0;
                            $scope.action.contrast.getInfoDeposit();
						}else{
							dialogService.toastWarn('ADD_ERROR');
						}
					});
				});
			}
		},
		createReceipt: function ()
		{
			return $location.path('/addReceipt').search({invoiceFund: INVOICE_FUND.depositFunds});
		},
		createPayment: function ()
		{
			return $location.path('addPayment').search({invoiceFund: INVOICE_FUND.depositFunds});
		},
		setDatePicker: function(formName)
		{	
			var time = moment().startOf('day').toDate(),endTime = moment().endOf('day').toDate();
			var currentTime = $scope.self.filters.selectedTime;
			if(currentTime == TO_DAY)
			{
				time = new Date();
			}
			else if(currentTime == TOMMORROW)
			{
				endTime = time = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
			}
			else if(currentTime == THIS_WEEK)
			{
				time = moment() ? moment().startOf('isoWeek').toDate() : new Date();
				endTime = moment() ? moment().endOf('isoWeek').toDate() : new Date();
			}else if(currentTime == NEXT_WEEK)
			{
				time = moment() ? moment().add(1, 'weeks').startOf('isoWeek').toDate() : new Date();
				endTime = moment() ? moment().add(1, 'weeks').endOf('isoWeek').toDate() : new Date();
			}else if(currentTime == THIS_MONTH)
			{
				time = moment() ? moment().startOf('month').toDate() : new Date();
				endTime = moment() ? moment().endOf('month').toDate() : new Date();
			}else if(currentTime == PREVIOUS_MONTH)
			{
				time = moment() ? moment().subtract(1, 'month').startOf('month').toDate() : new Date();
				endTime = moment() ? moment().subtract(1, 'month').endOf('month').toDate() : new Date();
			}else if(currentTime == THIS_QUARTER)
			{
				time = moment() ? moment().quarter(moment().quarter()).startOf('quarter').toDate() : new Date();
				endTime = moment() ? moment().quarter(moment().quarter()).endOf('quarter').toDate() : new Date();
			}else if(currentTime == PREVIOUS_QUARTER)
			{
				var currentQuarter = moment().quarter();
				var lastQuarter = currentQuarter === 1 ? 4 : moment().quarter() - 1;
				if(currentQuarter === 1)
				{
					time = moment() ? moment().subtract(1, "year").quarter(lastQuarter).startOf('quarter').toDate() : new Date();
					endTime = moment() ? moment().subtract(1, "year").quarter(lastQuarter).endOf('quarter').toDate() : new Date();
				}
				else
				{
					time = moment() ? moment().quarter(lastQuarter).startOf('quarter').toDate() : new Date();
					endTime = moment() ? moment().quarter(lastQuarter).endOf('quarter').toDate() : new Date();
				}
		}else if(currentTime == SIX_MONTH_PREVIOUS)
			{
				time = moment() ? moment().subtract(6, 'month').startOf('month').toDate() : new Date();
				endTime = moment() ? moment().subtract(6, 'month').endOf('month').toDate() : new Date();
			}else if(currentTime == THIS_YEAR)
			{
				time = moment() ?moment().startOf('year').toDate() : new Date();
				endTime = moment() ? moment().endOf('year').toDate() : new Date();
			}else if(currentTime == PREVIOUS_YEAR)
			{
				time = moment() ? moment().subtract(1, 'year').startOf('year').toDate() : new Date();
				endTime = moment() ? moment().subtract(1, 'year').endOf('year').toDate() : new Date();
			}

			if(formName !== 'booksDetail')
			{
				$scope.self.filters.startDate = time;
				$scope.self.filters.endDate = endTime;
			}
			else
			{
				$scope.self.bookDetails.filters.StartDate = time;
				$scope.self.bookDetails.filters.EndDate = endTime;
			}
		},
		search: function ()
		{
			var filters = $scope.self.filters;
			search = loginFactory.securedPostJSON('api/ThuChi/search', filters);

			if(search)
				search.success(function(response)
				{
					$scope.self.data = response ? response.data : void 0;
				});
		},
		getListInvoices: function ()
		{
			return $scope.promise = this.invoices.searchInvoice();
		},
		getListInventories: function()
		{
			return $scope.pagerInventories.bindingData(1, 10);
		},
		checkIfTHUCHIModuleActive: function() {
			var ezHotelModulesList = $rootScope.HotelSettings.EzHotelModulesList;
			if (ezHotelModulesList != null && ezHotelModulesList.length > 0) {
				var thuchiModule = _.filter(ezHotelModulesList, function(module) {
					return module.EzModules != null && module.EzModules.ModuleCode == "THUCHI" && module.EzModules.Status == true && module.Status == true;
				});
				console.info("thuchiModule", thuchiModule);
				if (thuchiModule == null || thuchiModule.length == 0) {
					var translated_title = $filter("translate")("LOG_MESSAGES");
					var translated_content = $filter("translate")("THUCHI_SUGGEST_MESSAGE");
					var translated_ok = $filter("translate")("OK");
					var translated_cancel = $filter("translate")("CANCEL");

					$mdDialog.show(
						$mdDialog.alert()
						.parent(angular.element(document.body))
						.clickOutsideToClose(false)
						.title(translated_title)
						.textContent(translated_content)
						//.ariaLabel('Alert Dialog POS')
						.ok(translated_ok)
						.targetEvent(null)
					).then(function() {
						$location.path("modulePaymentManagement");
					});
					return false;
				}
				return true;
			}
		},
		init: function()
		{
			if(this.checkIfTHUCHIModuleActive()){
				commonFactory.getHotelCommonInformation(function (data) {
					$scope.decimal = data.Currency.MinorUnit;
				});
				this.getListInvoices();
				this.getListInventories();
				this.inventory.getInfoToAddInvoiceAudit();
			}
		}
	}

	/***init pagination for list invoice***/
	$scope.selected = [];
	$scope.totalItems = 10;
	$scope.pager = utilsFactory.getPaginationInstance({
		'api': 'api/Invoices/InvoicesSearch',
		'dataFilter': {InvoiceFund: INVOICE_FUND.depositFunds, InvoiceGroup: INVOICE_GROUP.income},
		'label': {
			page: 'Trang',
			rowsPerPage: 'Số lượng mỗi trang',
			of : 'trong số'
		},
		'successCallBack': function(response)
		{
			if(response && response.Code === 0)
			{
				var _data =   response['Data'] && angular.isArray(response['Data']) ? 
								response['Data'] : _.toArray(response['Data'])
				$scope.pager.config.totalItems = response && response.Total ? parseInt(response.Total) : _.size(_data);
				$scope.self.data = _data;
				$scope.self.data.filter(function(item){
					item.InvoiceDate = new Date(item.InvoiceDate);//moment(String(item.InvoiceDate).replace('Z', '')).toDate();
					item.InvoiceTypeName =  item.InvoiceGroup == INVOICE_GROUP.income ? INVOICE_TYPE['income'][item.InvoiceType] : INVOICE_TYPE['outcome'][item.InvoiceType];
					return item;
				})
			}
		}
	});

	/***init pagination for list inventories***/
	$scope.pagerInventories = utilsFactory.getPaginationInstance({
		'api': 'api/InvoiceAudits/GetInvoiceAudit',
		'totalItems': 10,
		'dataFilter': {},
		'label': {
			page: 'Trang',
			rowsPerPage: 'Số lượng mỗi trang',
			of : 'trong số'
		},
		'successCallBack': function(response)
		{
			if(response && response.Code === 0)
			{
				var _data =   response['Data'] && angular.isArray(response['Data']) ? 
								response['Data'] : _.toArray(response['Data'])
				$scope.pagerInventories.config.totalItems = response && response.Total ? parseInt(response.Total) : _.size(_data);
				$scope.self.inventory.data = _data;
			}
		}
	});


	
}]);