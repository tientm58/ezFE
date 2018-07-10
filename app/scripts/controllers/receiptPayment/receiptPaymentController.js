'use strict';

ezCloud.controller('receiptPaymentController', ['$scope', '$rootScope', '$state', '$location', '$mdDialog', '$timeout', '$filter', 'loginFactory', '$localStorage', 'dialogService', '$mdpTimePicker', 'utilsFactory', 'commonFactory', '$anchorScroll', '$mdMedia',
	function ($scope, $rootScope, $state, $location, $mdDialog, $timeout, $filter, loginFactory, $localStorage, dialogService, $mdpTimePicker, utilsFactory, commonFactory, $anchorScroll, $mdMedia) {
		console.log('leo nguyen');
		var TO_DAY = 0, TOMMORROW = 1, THIS_WEEK = 2, NEXT_WEEK = 3, THIS_MONTH = 4, PREVIOUS_MONTH = 5,
			THIS_QUARTER = 6, PREVIOUS_QUARTER = 7, SIX_MONTH_PREVIOUS = 8, THIS_YEAR = 9, PREVIOUS_YEAR = 10, SUCCESS_CODE = 0, INVOICE_FUND = { 'cashFunds': 1, 'depositFunds': 2 }, INVOICE_GROUP = { 'income': 1, 'outcome': 2 }, INVOICE_TYPE = { 'income': { 1: $filter('translate')('OTHER_RECEIPT'), 2: $filter('translate')('DEBT_RECEIPT') }, 'outcome': { 1: $filter('translate')('OTHER_PAY'), 2: $filter('translate')('PAY_SUPPLIERS') } };

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
				},	*/
				{
					value: 2,
					description: $filter('translate')('THIS_WEEK')
				},
			/*{
				value: 3,
				description: $filter('translate')('NEXT_WEEK')
			},*/{
					value: 4,
					description: $filter('translate')('THIS_MONTH')
				}, {
					value: 5,
					description: $filter('translate')('PREVIOUS_MONTH')
				}, {
					value: 6,
					description: $filter('translate')('THIS_QUARTER')
				}, {
					value: 7,
					description: $filter('translate')('PREVIOUS_QUARTER')
				}, {
					value: 8,
					description: $filter('translate')('SIX_MONTH_PREVIOUS')
				}, {
					value: 9,
					description: $filter('translate')('THIS_YEAR')
				}, {
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
				selectedItemType: INVOICE_GROUP.income
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
				invoiceReference: {},
				participant: [
					{
						'_id': 0,
						'fullName': $localStorage.lastLogin.username,
						'title': $localStorage.lastLogin.role,
						'represent': null,
					}
				],
				detail:
					{
						data: [],
						balance: [{ 'VND': 1000000 }, { 'USD': 1000 }, { 'Lao': 500 }, { 'Thailand': 500 }]
					},
				showProcess: true,
				showFormAddAudit: false,
				invTextButton: $filter('translate')('ADD_INVENTORY'),
				iconInvTextButton: 'img/icons/ic_add_48px.svg',
				colorButton: 'md-primary',
				isProcess: false,
				isViewInventory: true
			},
			currency: []
		}

		$scope.action = {
			export:
				{
					excel: function (gridId) {
						// var exportHref = exportBuilder.tableToExcel(gridId,'test excel');
						// $timeout(function(){location.href=exportHref;},100);
					},
					pdf: function (gridId) {
						// return exportBuilder.toPdf(gridId);
					}
				},
			inventory: {
				filterData: function (item) {
					if (_.isEmpty($scope.self.inventory.dataToAddAudit))
						return true;

					return item.Balance != 0;
				},
				deleteInventory: function (event, inv) {
					if (!inv || _.isUndefined(inv.AuditId))
						return;

					var confirm = dialogService.confirm('NOTIFICATION', 'NOTIFICATION_INVENTORY_CONFIRM_DELETE', event);
					confirm.then(function () {
						var promise = loginFactory.securedPostJSON('api/InvoiceAudits/DeleteInvoiceAudit', { 'AuditId': inv.AuditId });
						promise.success(function (res) {
							if (res && res.Code === 0) {
								dialogService.toast('DELETE_INVENTORY_SUCCESS');
								$scope.action.getListInventories();
							}
							else
								dialogService.toastWarn('DELETE_INVENTORY_ERROR');
						})
					});
				},
				seeInvReference: function () {
					var inv = $scope.self.inventory.invoiceReference;
					var url = inv.InvoiceGroup == INVOICE_GROUP.income ? '/addReceipt' : '/addPayment';

					return $location.path(url).search({
						invoiceId: inv.InvoiceId,
						invoiceFund: inv.InvoiceFund
						//isView: true
					});
				},
				viewInventoryDetail: function (event, inv) {
					var self = this;
					if (!inv || _.isUndefined(inv.AuditId))
						return;

					var infoPromise = utilsFactory.sendGetRequest('api/InvoiceAudits/GetInvoiceAuditById', { AuditId: inv.AuditId });

					infoPromise.then(function (data, status, headers, config) {
						var audit = data.data && data.data.Data ? data.data.Data : [];
						if (audit) {
							if (_.isArray(audit))
								audit = _.first(audit);

							var tempAudit = String(audit.AuditDate).replace('Z', '');
							tempAudit = moment(tempAudit).format('YYYY-MM-DD') + "T" + String(audit.AuditTime);

							$scope.self.inventory.currentInventory = {
								auditDate: moment(String(audit.AuditDate).replace('Z', '')).toDate() || new Date(),
								auditTime: moment(String(tempAudit)).toDate() || new Date(),
								endDate: moment(String(audit.AuditToDate).replace('Z', '')).toDate() || new Date(),
								inventoryNum: audit.AuditNo || "",
								target: audit.Purpose || "",
								reference: audit.InvoiceId || ""
							};

							if (audit.InvoiceId) {
								var invoice = utilsFactory.sendGetRequest('api/Invoices/InvoicesGetById', { InvoiceID: audit.InvoiceId });
								invoice.success(function (res) {
									if (res && res.Code == SUCCESS_CODE) {
										$scope.self.inventory.invoiceReference = res.Data ? res.Data.Invoice : { InvoiceId: 1233 };
									}
								});
							}

							var _data = [];
							$scope.self.inventory.detail.data = [];
							(audit.AuditDetailsList || []).filter(function (item, index) {
								var temp = _.findWhere($scope.self.listCurrencies, { 'MoneyId': item.MoneyId });
								self.addCheckRealAudit(temp.MoneyName, {
									'_id': (index + 1),
									'amount': item.Amount,
									'quantity': item.Quantity || 1,
									'price': item.Amount / item.Quantity,
									'description': item.Description,
								});
								/*self.addCheckRealAudit(temp.MoneyName, {
									'_id': index,
									'Balance': item.Amount,
									'amount': 0,
									'quantity': 0,
									'price': 0,
									'description': ''
								});*/
								if (_.isEmpty(_data)) {
									_data.push({ MoneyName: temp.MoneyName, MoneyId: temp.MoneyId, Balance: item.Amount });
								}
								else {
									var _obj = _.findWhere(_data, { MoneyId: item.MoneyId });
									if (_.isUndefined(_obj))
										_data.push({ MoneyName: temp.MoneyName, MoneyId: temp.MoneyId, Balance: item.Amount });
									else {
										var _index = _data.indexOf(_obj);
										_obj.Balance += item.Amount;
										_data.splice(_index, 1);
										_data.push(_obj);
									}
								}

								/*item.Balance = item.Amount;
								item.MoneyName = temp.MoneyName;*/

								return item;
							});

							$scope.self.inventory.participant = [
								{
									'_id': 0,
									'fullName': $localStorage.lastLogin.username,
									'title': $filter("translate")($localStorage.lastLogin.role),
									'represent': null,
								}
							];
							(audit.AuditMembersList || []).filter(function (item, index) {
								self.addParticipant({
									'_id': index + 1,
									'fullName': item.Fullname,
									'title': item.Title,
									'represent': item.Depuation,
								});
								return item;
							});

							$scope.self.inventory.dataToAddAudit = _data || [];
							$scope.action.inventory.showFormAddAudit('see');
							self.goBottom();
						}
					});
				},
				getMinorUnitCurrency: function (curr) {
					if (curr != null) {
						var obj = _.findWhere($scope.self.listCurrencies, { 'MoneyName': curr }) || {};
						return obj != null ? obj.Currencies.MinorUnit : 0;
					} else {
						return 0;
					}
				},
				goBottom: function () {
					// $location.hash('addInv');
					// $anchorScroll();
				},
				clearForm: function () {
					$scope.self.inventory.currentInventory = {
						auditDate: new Date(),
						auditTime: null,
						endDate: new Date(),
						inventoryNum: "",
						target: "",
						reference: ""
					};
					$scope.self.inventory.invoiceReference = {};
					$scope.self.inventory.detail.data = [];
					$scope.self.inventory.dataToAddAudit = [];
					$scope.self.inventory.participant = [{
						'_id': 0,
						'fullName': $localStorage.lastLogin.username,
						'title': $filter("translate")($localStorage.lastLogin.role),
						'represent': null,
					}];
				},
				hiddenForm: function () {
					this.clearForm();
					$scope.self.inventory.showFormAddAudit = false
				},
				showFormAddAudit: function (view) {
					//self.triggerProcess();

					$scope.self.inventory.showFormAddAudit = true;
					$scope.self.inventory.showProcess = true;
					if (!view) {
						this.clearForm();
						this.getInfoToAddInvoiceAudit();
					}
					else {
						$scope.self.inventory.showProcess = false;
						$scope.self.inventory.participant = [{
							'_id': 0,
							'fullName': $localStorage.lastLogin.username,
							'title': $filter("translate")($localStorage.lastLogin.role),
							'represent': null,
						}];
					}
				},
				getInfoToAddInvoiceAudit: function () {
					var self = this;
					var infoPromise = {};
					var dataToAddAudit = $scope.self.inventory.dataToAddAudit;

					infoPromise = utilsFactory.sendGetRequest('api/InvoiceAudits/GetInfoToAddInvoiceAudit');

					infoPromise.then(function (data, status, headers, config) {
						var data = data.data && data.data.Data;
						$scope.self.inventory.currentInventory.inventoryNum = data.Audit.AuditNo || "";
						$scope.self.inventory.dataToAddAudit = data && data.Audit ? data.Audit.listDetail.filter(function (item) {
							return item.Balance != 0;
						}) : [];
						self.goBottom();
						//self.triggerProcess();
					});

					if (_.isEmpty($scope.self.currency) || _.isEmpty($scope.self.listCurrencies)) {
						infoPromise = utilsFactory.sendGetRequest('api/InvoiceAudits/GetListMoneyForAudit');

						infoPromise.then(function (data, status, headers, config) {
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
				addCheckRealAudit: function (currency, data) {
					if ($scope.self.inventory.detail.data.hasOwnProperty(currency))
						$scope.self.inventory.detail.data[currency].push((data ? data : this.getBaseDataDetail()));
					else
						$scope.self.inventory.detail.data[currency] = [(data ? data : this.getBaseDataDetail())];
				},
				removeCheckRealAudit: function (currency, item) {
					if (!$scope.self.inventory.detail.data.hasOwnProperty(currency))
						return;

					var index = $scope.self.inventory.detail.data[currency].indexOf(item);
					return $scope.self.inventory.detail.data[currency].splice(index, 1);
				},
				checkAuditData: function (currency) {
					return $scope.self.inventory.detail.data[currency] || [];
				},
				calcAmount: function (item) {
					return item.amount = item.price * item.quantity;
				},
				getExchangeRate: function (curr) {
					var obj = $scope.self.indexCurrencies ? $scope.self.indexCurrencies[curr] : {};
					obj = obj || {};
					return obj.ExchangeRate || 1;
				},
				getInfoToAdd: function (data) {

				},
				getBalanceAmount: function (currency, isOriginal) {
					var self = this;
					var bal = _.findWhere($scope.self.inventory.dataToAddAudit, { MoneyName: currency }) || [];

					return (isOriginal ? bal['Balance'] : bal['Balance'] * self.getExchangeRate(currency)) || 0;
				},
				getBias: function (obj, isOriginal) {
					return this.getBalanceAmount(obj.MoneyName, isOriginal) - this.getTotalAmount(obj.MoneyName, isOriginal);
				},
				getTotalDiff: function () {
					var self = this;
					var total = 0;
					var moneyDiff = [];
					/*$scope.self.currency.map(function(index, val){
						var obj = {MoneyName: index};
						total += self.getBias(obj);
					})*/
					if (!_.isEmpty($scope.self.listCurrencies)) {
						$scope.self.listCurrencies.map(function (item, index) {
							var sumAmount = self.getBias({ MoneyName: item.MoneyName }, true);
							moneyDiff.push({
								ExchangeRate: item.ExchangeRate,
								MoneyId: item.MoneyId,
								MoneyName: item.MoneyName,
								SumAmount: sumAmount
							});

							total += self.getBias({ MoneyName: item.MoneyName }, false);
						});

						$scope.self.inventory.currentInventory = angular.extend($scope.self.inventory.currentInventory, { MoneyDiff: moneyDiff });
					}

					return total;
				},
				getTotalAmount: function (curr, isOriginal) {
					var self = this;
					return _.reduce(_.pluck(($scope.self.inventory.detail.data[curr] || []), 'amount'), function (memo, num, idx) { return memo + (isOriginal ? num : num * self.getExchangeRate(curr)); }, 0);
				},
				getBaseDataDetail: function () {
					return {
						_id: 0,
						price: null,
						quantity: null,
						amount: 0,
						description: ''
					}
				},
				getBaseParticipant: function () {
					return {
						'_id': 0,
						'fullName': '',
						'title': '',
						'represent': null,
					}
				},
				getAuditDetail: function () {
					var currencies = $scope.self.listCurrencies || [];
					var detailData = $scope.self.inventory.detail.data;

					if(_.isEmpty(detailData))
					{
						$scope.self.inventory.dataToAddAudit.map(function(item){
							detailData.push({
								'Description': item.Description || "",
								'Denomination': item.price ? item.price : 0,
								'Quantity': item.Quantity ? item.Quantity : 0,
								'Amount': item.Balance ? item.Balance : 0,
								'CreatedDate': new Date(),
								'MoneyName': item.MoneyName,
								'MoneyId': item.MoneyId
							})
						})

						return detailData;
					}

					return _.flatten(_.map(_.keys(detailData), function (key) {
						return _.map(detailData[key], function (item) {
							return {
								'Description': item.description || "",
								'Denomination': item.price ? item.price : 0,
								'Quantity': item.quantity ? item.quantity : 0,
								'Amount': item.amount ? item.amount : 0,
								'CreatedDate': new Date(),
								'MoneyName': key,
								'MoneyId': (_.find(currencies, function (item) { return (item['MoneyName'] || "") === key }) || {}).MoneyId
							}
						})
					}));
				},
				getAuditMember: function () {
					return _.map(($scope.self.inventory.participant || []), function (item, key) {
						return {
							'FullName': item.fullName || "",
							'Title': item.title || "",
							'Deputation': item.represent || "",
						}
					});
				},
				addParticipant: function (data) {
					return $scope.self.inventory.participant.push(data ? data : this.getBaseParticipant());
				},
				removeParticipant: function (item, index) {
					return $scope.self.inventory.participant.indexOf(item) != -1 ? $scope.self.inventory.participant.splice(index, 1) : void 0;
				},
				triggerProcess: function () {
					return $scope.self.inventory.isProcess = !$scope.self.inventory.isProcess;
				},
				process: function (event) {
					var currentAudit = $scope.self.inventory.currentInventory;
					var auditParams = {
						'Audit': {
							'Purpose': currentAudit.target ? currentAudit.target : "",
							'CreatedDate': moment(new Date()).format("YYYY-MM-DDTHH:mm:ss") + "Z",
							//'AuditToDate': moment(currentAudit.endDate ? currentAudit.endDate : new Date()).format("YYYY-MM-DDTHH:mm:ss") + "Z",
							'AuditToDate': currentAudit.endDate ? currentAudit.endDate : new Date(),
							'DateAudit': moment(currentAudit.auditDate ? currentAudit.auditDate : new Date()).format("YYYY-MM-DDTHH:mm:ss") + "Z",
							'TimeAudit': moment(currentAudit.auditTime ? currentAudit.auditTime : new Date()).format('HH:mm:ss'),
							'AuditNo': currentAudit.inventoryNum ? currentAudit.inventoryNum : "",
							'DifferenceBalance': parseFloat(this.getTotalDiff() || 0)
						},
						'AuditDetail': this.getAuditDetail() || [],
						'AuditMember': this.getAuditMember() || [],
						'MoneyDiff': currentAudit.MoneyDiff || []
					}

					var self = this;
					var confirm = dialogService.confirm('NOTIFICATION', 'ADD_INVENTORY_CONFIRM', event);
					if (confirm)
						confirm.then(function () {
							self.triggerProcess();
							var promiseAddAudit = loginFactory.securedPostJSON('api/InvoiceAudits/AddAudit', auditParams);
							promiseAddAudit.success(function (res) {
								dialogService.toast('ADD_INVENTORY_SUCCESS');
								if (res && res.Code === SUCCESS_CODE) {
									dialogService.toast('ADD_INVENTORY_SUCCESS');
									$scope.self.inventory.showFormAddAudit = false;
									$scope.action.getListInventories();
								}
								else
									dialogService.toast('ADD_ERROR');

								$timeout(function () {
									self.triggerProcess();
								}, 500);
							});
						});
				}
			},
			invoices: {
				selectDate: function () {
					$scope.self.filters.startDate = moment($scope.self.filters.startDate).startOf('day').toDate();
					$scope.self.filters.endDate = moment($scope.self.filters.endDate).endOf('day').toDate();
				},
				getAmountDetailByCurrency: function (curr, invoiceDetail, type) {
					var invGroup = invoiceDetail.InvoiceGroup;

					var moneylist = invoiceDetail.Money || [];
					if (!curr || !_.isArray(moneylist) || _.isEmpty(moneylist))
						return 0;

					var obj = _.find(moneylist, function (money) {
						return (money['MoneyName'] === curr) ? (money['SumAmount'] || 0) : 0;
					});

					return (invGroup == type || type === null) && obj ? obj : { SumAmount: 0, MoneyName: "" };
					//return invGroup == type || type === null ? (obj ? obj.SumAmount : 0) : 0;
				},
				editInvoice: function (invoice) {
					if (!invoice)
						return;

					var url = invoice.InvoiceGroup == INVOICE_GROUP.income ? 'addReceipt' : 'addPayment';

					return $location.path(url).search({
						invoiceId: invoice.InvoiceId,
						invoiceFund: invoice.InvoiceFund,
					});
				},
				deleteInvoice: function (event) {
					var reasonForm = this.showReasonDialog();
					var invoiceIds = _.pluck($scope.selected, 'InvoiceId') || [];
					if (invoiceIds.length > 0) {
						if (invoiceIds.length > 1)
							return dialogService.toastWarn('DELETE_VOUCHER_RULE');

						var confirm = reasonForm.then(function (reason) { }, function (reason) {
							console.log(reason);
						});

						/*var confirm = dialogService.confirm('NOTIFICATION', 'NOTIFICATION_VOUCHER_CONFIRM_DELETE', event);
						confirm.then(function(){
							var promise = loginFactory.securedPostJSON('api/Invoices/InvoicesDelete', {'invoiceID': _.first(invoiceIds)});
							promise.success(function(res){
								if(res && res.Code === 0)
								{
									dialogService.toast('DELETE_VOUCHER_SUCCESS');
									$scope.selected = [];
									$scope.pager.bindingData(1, 10);
								}
								else
									dialogService.toastWarn('DELETE_VOUCHER_ERROR');
							})
						});*/
					}
				},
				showReasonDialog: function (event) {
					var dialogController = function ($scope, $mdDialog) {
						$scope.cancel = function () { return $mdDialog.cancel(); }
						$scope.save = function () { return $mdDialog.hide($scope.reason); }
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
								if (res && res.Code === 0) {
									dialogService.toast('DELETE_VOUCHER_SUCCESS');
									$scope.selected = [];
									$scope.pager.bindingData(1, 10);
								}
								else
									dialogService.toastWarn('DELETE_VOUCHER_ERROR');
							})
						}, function (reason) { });
					}
				},
				searchInvoice: function () {
					var startD = new Date($scope.self.filters.startDate);
					startD.setHours(0);
					startD.setMinutes(0);
					startD.setMilliseconds(0);
					startD.setSeconds(0);
					var EndD = new Date($scope.self.filters.endDate);
					EndD.setHours(23);
					EndD.setMinutes(59);
					EndD.setMilliseconds(0);
					EndD.setSeconds(0);
					this.selectDate();
					return $scope.pager.bindingData(1, 10, {
						StartDate: startD.toUTCString(),//moment($scope.self.filters.startDate).format("YYYY-MM-DDTHH:mm:ss") + "Z",
						EndDate: EndD.toUTCString(),//moment($scope.self.filters.endDate).format("YYYY-MM-DDTHH:mm:ss") + "Z",
						InvoiceGroup: $scope.self.filters.selectedItemType,
						InvoiceFund: INVOICE_FUND.cashFunds,
						PageSize: 10,
						PageNumber: 0
					});
				}
			},
			bookDetails: {
				selectDate: function () {
					$scope.self.bookDetails.filters.StartDate = moment($scope.self.bookDetails.filters.StartDate).startOf('day').toDate(),
						$scope.self.bookDetails.filters.EndDate = moment($scope.self.bookDetails.filters.EndDate).endOf('day').toDate()
				},
				getList: function (act) {
					this.selectDate();
					var pager = { PageNumber: 0, PageSize: 10, InvoiceFund: INVOICE_FUND.cashFunds };
					var startDate = new Date($scope.self.bookDetails.filters.StartDate);
					startDate.setHours(0);
					startDate.setMinutes(0);
					startDate.setMilliseconds(0);
					startDate.setSeconds(0);
					var endDate = new Date($scope.self.bookDetails.filters.EndDate);
					endDate.setHours(23);
					endDate.setMinutes(59);
					endDate.setMilliseconds(59);
					endDate.setSeconds(59);
					if (act && act === 'search')
						pager = angular.extend(pager, {
							'StartDate': startDate.toUTCString(),//moment($scope.self.bookDetails.filters.StartDate).format("YYYY-MM-DDTHH:mm:ss") + "Z",
							'EndDate': endDate.toUTCString(),//moment($scope.self.bookDetails.filters.EndDate).format("YYYY-MM-DDTHH:mm:ss") + "Z"
						});

					$scope.promiseBookDetails = this.initPagination().bindingData(1, 10, pager);
				},
				initPagination: function (pager) {
					if (!angular.isUndefined($scope.self.bookDetails.pagerBookDetail))
						return $scope.self.bookDetails.pagerBookDetail;

					/***init pagination for list invoices detail***/
					var bookPager = utilsFactory.getPaginationInstance({
						'api': 'api/Invoices/InvoicesGetAllDetails',
						'totalItems': 10,
						'dataFilter': pager || {},
						'label': {
							page: $filter('translate')('PAGE'),
							rowsPerPage: $filter('translate')('ROW_PER_PAGE'),
							of: $filter('translate')('IN')
						},
						'successCallBack': function (response) {
							if (response && response.Code === SUCCESS_CODE) {
								var _data = response['Data'] && angular.isArray(response['Data']) ?
									response['Data'] : _.toArray(response['Data'])
								$scope.self.bookDetails.pagerBookDetail.config.totalItems = response && response.Total ? parseInt(response.Total) : _.size(_data);
								$scope.self.bookDetails.dataList = _data || [];
								$scope.self.bookDetails.totalBalance = response.TotalBalance ? response.TotalBalance : 0;
								$scope.self.bookDetails.totalPeriodPaymentOrderBalance = response.TotalPeriodPaymentOrderBalance ? response.TotalPeriodPaymentOrderBalance : 0;
								$scope.self.bookDetails.totalPeriodReceiptsBalance = response.TotalPeriodReceiptsBalance ? response.TotalPeriodReceiptsBalance : 0;
							}
							console.log(response);
						}
					});

					$scope.self.bookDetails.pagerBookDetail = bookPager;
					return bookPager;
				},
				getAmountDetailByCurrency: function (curr, invoiceDetail, type) {
					var invGroup = invoiceDetail.InvoiceGroup;

					var moneylist = (invoiceDetail.ReceiptMoney ? invoiceDetail.ReceiptMoney : invoiceDetail.PaymentMoney) || [];
					if (!curr || !_.isArray(moneylist) || _.isEmpty(moneylist))
						return 0;

					var obj = _.find(moneylist, function (money) {
						return (money['MoneyName'] === curr) ? (money['SumAmount'] || 0) : 0;
					});

					return (invGroup == type || type === null) && obj ? obj : { SumAmount: 0, MoneyName: "" };
					// return invGroup == type || type === null ? (obj ? obj.SumAmount : 0) : 0;
				},
				getTotalAmountByCurrency: function (curr) {

				},
				getAmountPeriod: function () {
					var bookDt = $scope.self.bookDetails;
					return (bookDt.totalBalance + bookDt.totalPeriodReceiptsBalance - bookDt.totalPeriodPaymentOrderBalance) || 0;
				}
			},
			createReceipt: function () {
				return $location.path('/addReceipt').search({ invoiceFund: INVOICE_FUND.cashFunds });
			},
			createPayment: function () {
				return $location.path('/addPayment').search({ invoiceFund: INVOICE_FUND.cashFunds });
			},
			setDatePicker: function (formName) {
				var time = moment().startOf('day').toDate(), endTime = moment().endOf('day').toDate();
				var currentTime = $scope.self.filters.selectedTime;

				if (currentTime == TO_DAY) {
					time = moment().startOf('day').toDate();
					endTime = moment().endOf('day').toDate();
				}
				else if (currentTime == TOMMORROW) {
					time = moment().add(1, 'day').startOf('day').toDate();
					endTime = moment().add(1, 'day').endOf('day').toDate();
				}
				else if (currentTime == THIS_WEEK) {
					time = moment() ? moment().startOf('isoWeek').toDate() : new Date();
					endTime = moment() ? moment().endOf('isoWeek').toDate() : new Date();
				} else if (currentTime == NEXT_WEEK) {
					time = moment() ? moment().add(1, 'weeks').startOf('isoWeek').toDate() : new Date();
					endTime = moment() ? moment().add(1, 'weeks').endOf('isoWeek').toDate() : new Date();
				} else if (currentTime == THIS_MONTH) {
					time = moment() ? moment().startOf('month').toDate() : new Date();
					endTime = moment() ? moment().endOf('month').toDate() : new Date();
				} else if (currentTime == PREVIOUS_MONTH) {
					time = moment() ? moment().subtract(1, 'month').startOf('month').toDate() : new Date();
					endTime = moment() ? moment().subtract(1, 'month').endOf('month').toDate() : new Date();
				} else if (currentTime == THIS_QUARTER) {
					time = moment() ? moment().quarter(moment().quarter()).startOf('quarter').toDate() : new Date();
					endTime = moment() ? moment().quarter(moment().quarter()).endOf('quarter').toDate() : new Date();
				} else if (currentTime == PREVIOUS_QUARTER) {
					var currentQuarter = moment().quarter();
					var lastQuarter = currentQuarter === 1 ? 4 : moment().quarter() - 1;
					if (currentQuarter === 1) {
						time = moment() ? moment().subtract(1, "year").quarter(lastQuarter).startOf('quarter').toDate() : new Date();
						endTime = moment() ? moment().subtract(1, "year").quarter(lastQuarter).endOf('quarter').toDate() : new Date();
					}
					else {
						time = moment() ? moment().quarter(lastQuarter).startOf('quarter').toDate() : new Date();
						endTime = moment() ? moment().quarter(lastQuarter).endOf('quarter').toDate() : new Date();
					}
				} else if (currentTime == SIX_MONTH_PREVIOUS) {
					time = moment() ? moment().subtract(6, 'month').startOf('month').toDate() : new Date();
					endTime = moment() ? moment().subtract(6, 'month').endOf('month').toDate() : new Date();
				} else if (currentTime == THIS_YEAR) {
					time = moment() ? moment().startOf('year').toDate() : new Date();
					endTime = moment() ? moment().endOf('year').toDate() : new Date();
				} else if (currentTime == PREVIOUS_YEAR) {
					time = moment() ? moment().subtract(1, 'year').startOf('year').toDate() : new Date();
					endTime = moment() ? moment().subtract(1, 'year').endOf('year').toDate() : new Date();
				}

				// if(formName !== 'booksDetail')
				// {
				$scope.self.filters.startDate = time;
				$scope.self.filters.endDate = endTime;
				// }
				// else
				// {
				$scope.self.bookDetails.filters.StartDate = time;
				$scope.self.bookDetails.filters.EndDate = endTime;
				// }
			},
			search: function () {
				var filters = $scope.self.filters;
				search = loginFactory.securedPostJSON('api/ThuChi/search', filters);

				if (search)
					search.success(function (response) {
						$scope.self.data = response ? response.data : void 0;
					});
			},
			getListInvoices: function () {
				return $scope.promise = this.invoices.searchInvoice();
			},
			getListInventories: function () {
				return $scope.promiseInventories = $scope.pagerInventories.bindingData(1, 10);
			},
			checkIfTHUCHIModuleActive: function () {
				var ezHotelModulesList = $rootScope.HotelSettings.EzHotelModulesList;
				if (ezHotelModulesList != null && ezHotelModulesList.length > 0) {
					var thuchiModule = _.filter(ezHotelModulesList, function (module) {
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
						).then(function () {
							$location.path("modulePaymentManagement");
						});
						return false;
					}
					return true;
				}
			},
			init: function () {
				if (this.checkIfTHUCHIModuleActive()) {
					commonFactory.getHotelCommonInformation(function (data) {
						$scope.decimal = data.Currency.MinorUnit;
					});
					this.getListInvoices();
					this.getListInventories();
					this.inventory.getInfoToAddInvoiceAudit();
				}
			},
			convertDateUTC: function (dt) {
				return new Date(dt).format("dd/mm/yyyy");
			}
		}
		/***init pagination for list invoice***/
		$scope.selected = [];
		$scope.totalItems = 10;
		$scope.pager = utilsFactory.getPaginationInstance({
			'api': 'api/Invoices/InvoicesSearch',
			'dataFilter': { InvoiceFund: INVOICE_FUND.cashFunds, InvoiceGroup: INVOICE_GROUP.income },
			'label': {
				page: $filter('translate')('PAGE'),
				rowsPerPage: $filter('translate')('ROW_PER_PAGE'),
				of: $filter('translate')('IN')
			},
			'successCallBack': function (response) {
				if (response && response.Code === 0) {
					var _data = response['Data'] && angular.isArray(response['Data']) ?
						response['Data'] : _.toArray(response['Data'])
					$scope.pager.config.totalItems = response && response.Total ? parseInt(response.Total) : _.size(_data);
					$scope.self.data = _data;
					$scope.self.data.filter(function (item) {
						item.InvoiceDate = new Date(item.InvoiceDate);//moment(String(item.InvoiceDate).replace('Z', '')).toDate();
						item.InvoiceTypeName = item.InvoiceGroup == INVOICE_GROUP.income ? INVOICE_TYPE['income'][item.InvoiceType] : INVOICE_TYPE['outcome'][item.InvoiceType];
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
				page: $filter('translate')('PAGE'),
				rowsPerPage: $filter('translate')('ROW_PER_PAGE'),
				of: $filter('translate')('IN')
			},
			'successCallBack': function (response) {
				if (response && response.Code === 0) {
					var _data = response['Data'] && angular.isArray(response['Data']) ?
						response['Data'] : _.toArray(response['Data'])
					$scope.pagerInventories.config.totalItems = response && response.Total ? parseInt(response.Total) : _.size(_data);
					$scope.self.inventory.data = _data && _.isArray(_data) ? _data.filter(function (item) {
						item.AuditToDate = item.AuditToDate ? moment(String(item.AuditToDate).replace('Z', '')).toDate() : new Date();
						return item;
					}) : [];
				}
			}
		});


		$scope.showTimePicker = function (ev) {
			$mdpTimePicker($scope.self.inventory.currentInventory.auditTime, {
				targetEvent: ev
			}).then(function (selectedDate) {
				$scope.self.inventory.currentInventory.auditTime = selectedDate;
			});;
		}


	}]);