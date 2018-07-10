ezCloud.controller('addReceiptController', ['$scope', '$stateParams', '$filter', '$location', '$mdMedia', '$localStorage', '$rootScope', '$state', '$mdDialog', '$q', 'loginFactory', 'dialogService', 'utilsFactory', 'commonFactory',
  function ($scope, $stateParams, $filter, $location, $mdMedia, $localStorage, $rootScope, $state, $mdDialog, $q, loginFactory, dialogService, utilsFactory, commonFactory) {
    'use strict';

    var SUCCESS_CODE = 0, INVOICE_FUND = { 'cashFunds': 1, 'depositFunds': 2 }, INVOICE_GROUP = { 'income': 1, 'outcome': 2 }, PAYMENT_METHOD = { 'cashFunds': 1, 'depositFunds': 3 }, BANK_STATUS = { 'cancel': 3, 'live': 1 };

    var invoiceFund = $stateParams.invoiceFund;
    var invoiceId = $location.search().invoiceId;
    var userName = $localStorage.session.Roles == "ROLE_HOTEL_OWNER" || $localStorage.session.Roles == "ROLE_HOTEL_MANAGER" ? $localStorage.session.userName : $localStorage.session.userName + "@"+ $localStorage.lastLogin.hotelId;

    $scope.maxDate = moment().toDate();
    var self = this;
    self.simulateQuery = false;
    /*$scope.selectedEmployee = {
      'name': '',
      'value': '',
      'Id': ''
    };*/
    $scope.selectedCustomer = {
      'payer': '',
      'address': ''
    };
    $scope.isFocusAmount = false;
    $scope.focusRequire = false;
    $scope.receiptedDate = new Date();
    $scope.receiptNum = '';
    $scope.currency = 'VND';
    $scope.items = [];
    $scope.MinorUnit = 0;

    $scope.paymentsSelected = [];
    $scope.payments = [];

    $scope.ShowSaveBtn = true;

    $scope.filterPayment = {
      amount: null,
      receiptDate: new Date(),
      company: ''
    }

    $scope.paymentDetails = [{
      id: 0,
      Amount: null,
      PaymentDescription: '',
      CreatedDate: new Date(),
      HotelId: $localStorage.lastLogin ? $localStorage.lastLogin.hotelId : null,
      PaymentMethodId: PAYMENT_METHOD.cashFunds,
      MoneyId: null,
    }]

    // commonFactory.getHotelCommonInformation(function (data) {
    //   console.log(123, data);
    //   $scope.defaultMoneyId = data && data.Hotel ? data.Hotel.DefaultMoneyId : null;
    //   $scope.decimal = data.Currency.MinorUnit;
    // });

    var getCurrentHotel = function () {
      if (!$localStorage.lastLogin || !$localStorage.lastLogin.hotelId)
        loginFactory.securedGet("api/Hotel/GetCurrentHotel").success(function (data) {
          if (data != null && data != undefined) {
            $scope.paymentDetails.map(function (payment) {
              payment.HotelId = data.HotelId;

              return payment;
            });
          }
        });
    }

    getCurrentHotel();



    var index = 0;

    $scope.addPayDetail = function ($index) {
      var paymentDetail = $scope.paymentDetails[0];
      $scope.paymentDetails.push({
        id: ++$index,
        Amount: null,
        PaymentDescription: '',
        CreatedDate: new Date(),
        PaymentMethodId: PAYMENT_METHOD.cashFunds,
        MoneyId: $scope.defaultMoneyId,
        //PaymentId: paymentDetail.PaymentId,
        //PaymentTypeName: paymentDetail.PaymentTypeName,
        HotelId: paymentDetail.HotelId
      });
    }

    $scope.removePayDetail = function (item, index) {
      if (index == 0)
        return;

      return $scope.paymentDetails.indexOf(item) != -1 ? $scope.paymentDetails.splice(index, 1) : void 0;
    }

    var getListCustomers = function () {
      return loginFactory.securedGet('api/Invoices/InvoicesGetCompanies', "");
    }

    var getListEmployees = function () {
      return loginFactory.securedGet('api/Invoices/InvoicesGetEmployeesByHotel', "");
    }

    var getPaymentTypeDetail = function () {
      return utilsFactory.sendGetRequest('api/PaymentTypeDetails/PaymentTypeDetailsGetDataByType', { 'PaymentGroupType': 1 });
    }

    self.customers = [];
    getListCustomers().then(function (res) {
      self.customers = res.data.Data || [];
      self.customers.map(function (customer) {
        customer.value = customer.CompanyName.toLowerCase();

        return customer;
      });
    })

    self.employees = [];
    getListEmployees().then(function (res) {
      self.employees = res.data.Data || [];
      self.employees.map(function (empl) {
        empl.value = empl.StaffName.toLowerCase();
        empl.name = empl.StaffName;

        return empl;
      });
    })

    $scope.categories = [];
    getPaymentTypeDetail().then(function (res) {

      res = res && res.data ? res.data : {};
      $scope.categories = res && res.Code === SUCCESS_CODE && _.isArray(res.Data) ? res.Data : [];
    })

    /**
     * Create filter function for a query string
     */
    var createFilterFor = function (query) {
      var lowercaseQuery = angular.lowercase(query);

      return function filterFn(item) {
        return (item.value.indexOf(lowercaseQuery) === 0);
      };

    }

    $scope.querySearch = function (query, type) {
      var results = query ? self.customers.filter(createFilterFor(query)) : self.customers,
        deferred;

      if (type == 'employee')
        results = query ? self.employees.filter(createFilterFor(query)) : self.employees;

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

    $scope._selectedCompany = {};
    $scope.setSelected = function (item, type) {
      item = item && angular.isObject(item) ? item : void 0;
      if (type === 'employee')
        return $scope.selectedEmployee = item
      else if (type === 'filter') {
        $scope._selectedCompany = item;
        return $scope.filterPayment.company = item;
      }

      return $scope.selectedCustomer = item;
    }

    $scope.isPaymentDetailEmpty = function () {
      var isEmpty = false;
      $scope.paymentDetails.filter(function (item) {
        if (!item.PaymentDescription || !item.Amount || !item.MoneyId) {
          isEmpty = true;
          return;
        }
      })

      return isEmpty;
    }

    var getBankList = function () {
      var promise = utilsFactory.sendGetRequest('api/HotelBankAccount/GetAllBankAccount', {});
      promise.success(function (res) {
        if (res && res.Code == SUCCESS_CODE) {
          $scope.banklist = res.Data && _.size(res.Data) > 0 ? res.Data : [];
          if (!_.isEmpty($scope.banklist))
            $scope.banklist = _.where($scope.banklist, { 'Status': BANK_STATUS.live });
        }
      });
    }

    $scope.checkDisplayInvoiceForm = function () {
      $scope.isChooseInvoice = ($scope.type == 2);
    }

    $scope.paymentSelected = [];

    $scope.save = function () {
      if ($scope._selectedCompany)
        $scope.selectedCustomer = $scope._selectedCompany;

      $mdDialog.cancel($scope.paymentSelected);
    }

    $scope.hide = function () {
      $mdDialog.hide($scope.paymentSelected);
    };

    var dialogController = function ($scope, $mdDialog) {      
      $scope.cancel = function () { return $mdDialog.cancel(); }
      $scope.isFocusAmount = true;
    }

    dialogController.$inject = ['$scope', '$mdDialog'];

    $scope.showDialog = function (event) {
      var self = this;
      var useFullScreen = $mdMedia('xs');
      $mdDialog.show({
        controller: dialogController,
        scope: $scope.$new(),
        templateUrl: 'views/templates/chooseInvoice.tmpl.html',
        parent: angular.element(document.body),
        fullscreen: useFullScreen,
        targetEvent: event,
        clickOutsideToClose: true
      })
        .then(function (selected) { }, function (selected) {
          var selected = selected || [];
          if (!_.isEmpty(selected))
            $scope.paymentsSelected = selected;
          $scope.paymentDetails = [{
            id: 0,
            Amount: null,
            PaymentDescription: '',
            CreatedDate: new Date(),
            HotelId: $localStorage.lastLogin ? $localStorage.lastLogin.hotelId : null,
            PaymentMethodId: PAYMENT_METHOD.cashFunds,
            MoneyId: null,
          }]

          var obj = _.findWhere($scope.listCurrencies, { 'MoneyId': $scope.defaultMoneyId }) || {};
          $scope.paymentDetails.filter(function (item) {
            item.Amount = $scope.calcPayAmount2();
            item.MoneyId = $scope.defaultMoneyId;

            return item;
          });
        });
    }

    $scope.calcPayAmount = function () {
      var temp = $scope.paymentsSelected;
      temp.map(function (item) {
        return getConvertedAmount(item);
      });
      return _.reduce(_.pluck((temp || []), 'payAmount'), function (val, num) {
        return val + num;
      }, 0) || 0;

    }

    $scope.calcPayAmount2 = function () {
      var temp = $scope.paymentsSelected;
      temp.map(function (item) {
        return getConvertedAmount2(item);
      });
      return _.reduce(_.pluck((temp || []), 'payAmount'), function (val, num) {
        return val + num;
      }, 0) || 0;

    }

    $scope.chooseInvoices = function () {
      if (_.isEmpty($scope.paymentSelected))
        return false;

      $scope.paymentsSelected = angular.copy($scope.paymentSelected);
      $scope.paymentsSelected.map(function (payment) {
        payment.Amount = payment.Amount || payment.payAmount;

        return payment;
      })

      return $scope.isChooseInvoice = true && $mdDialog.cancel();
    };

    self.helpers = {
      isPaymentDebt: function () {
        return $scope.type == 2;
      },
      formatMoneyVal: function () {
        return $scope.paymentDetails.map(function (payment) {
          payment.MoneyId = parseInt(payment.MoneyId);
          payment.PaymentMethodId = invoiceFund == INVOICE_FUND.cashFunds ? PAYMENT_METHOD.cashFunds : PAYMENT_METHOD.depositFunds;

          return payment;
        });
      }
    }

    $scope.getReturnAmount = function () {
      var payAmount = $scope.filterPayment.amount;
      var remain = 0;
      var size = _.size($scope.payments);
      _.each($scope.payments, function (obj, key) {
        if (payAmount == 0)
          return obj.payAmount = 0;

        if (remain > 0)
          payAmount = remain;

        if (obj.SubAmount >= payAmount) {
          obj.payAmount = payAmount;
          payAmount = 0;
        }
        else {
          remain = payAmount - obj.SubAmount;
          if (key < size)
            obj.payAmount = obj.SubAmount;
          else
            obj.payAmount = remain;
        }

      })

    }

    $scope.searchPaymentByCompany = function (company) {
      var company = company;
      if (angular.isObject(company) && company.CompanyId) {
        $scope.promiseInvoices = utilsFactory.sendGetRequest('api/Invoices/InvoicesGetPaymentByCompany', { CompanyID: company.CompanyId });
        $scope.promiseInvoices.success(function (res) {
          if (res && res.Code === SUCCESS_CODE) {
            var listPaymentsByCompany = res.Data ? res.Data : [];
            $scope.paymentSelected = [];
            return $scope.payments = listPaymentsByCompany;
          }
        })
      }

      return;
    }

    $scope.getExchangeRate = function (curr) {
      var obj = $scope.indexCurrencies ? $scope.indexCurrencies[curr] : {};
      obj = obj || {};
      return obj.ExchangeRate || 1;
    }

    $scope.setDayPaid = function () {
      return _.each($scope.payments, function (obj, key) {
        obj.CreatedDate = $scope.filterPayment.receiptDate;
      });
    }

    $scope.getTotalPayment2 = function (collection, special) {
      var temp = angular.copy(collection);
      temp.map(function (item) {
        return getConvertedAmount2(item);
      });
      var debt = _.reduce(_.pluck((temp || []), 'Amount'), function (val, num) {
        return val + num;
      }, 0) || 0;
      if (special == 'chooseInvoice')
        $scope.debtInvoice = debt;

      return debt;
    };

    $scope.getTotalPayment = function (collection, special) {
      var temp = angular.copy(collection);
      temp.map(function (item) {
        return getConvertedAmount(item);
      });
      var debt = _.reduce(_.pluck((temp || []), 'Amount'), function (val, num) {
        return val + num;
      }, 0) || 0;
      if (special == 'chooseInvoice')
        $scope.debtInvoice = debt;

      return debt;
    };

    $scope.getMinorUnitCurrency = function (curr) {
      if (curr != null && $scope.listCurrencies != undefined) {
        var obj = _.findWhere($scope.listCurrencies, { 'MoneyId': parseInt(curr) }) || {};
        return obj != null ? obj.Currencies.MinorUnit : 0;
      } else {
        return 0;
      }
    };

    $scope.addInvoices = function () {
      $scope.focusRequire = true;
      if ($scope.isPaymentDetailEmpty()) {
        return dialogService.toastWarn($filter('translate')('WARNING_ENTER_COMPLETELY_PAYMENT_DETAIL'));
      }
      var data = {
        'Invoice': {
          CompanyId: $scope.selectedCustomer.CompanyId,
          PaymentTypeDetailId: $scope.typeCate ? $scope.typeCate.PaymentTypeDetailId : null,
          InvoiceContent: $scope.content ? $scope.content : "",
          InvoiceType: $scope.type,
          InvoiceNo: $scope.receiptNum,
          InvoiceDate: ($scope.receiptedDate ? new Date($scope.receiptedDate).toISOString() : new Date().toISOString()),
          CreatedDate: new Date().toISOString(),
          Employee: $scope.selectedEmployee ? $scope.selectedEmployee.Id : "",
          //fake
          Status: 1,
          IsCompare: "",
          BankAccReceive: $scope.bankAccountReceive || "",
          HotelBankAccountId: null,
          InvoiceFund: invoiceFund,
          InvoiceGroup: INVOICE_GROUP.income,
          Description: ""
        },
        'Payments': self.helpers.isPaymentDebt() ? $scope.paymentsSelected : [],
        'Details': self.helpers.formatMoneyVal()
      }

      if (invoiceId){
        data.Invoice.InvoiceID = invoiceId; 
        data.Invoice.ModifiedDate = new Date().toISOString();      
        data.Invoice.ModifiedBy = userName;
      }

      var confirm = dialogService.confirm('NOTIFICATION', invoiceId ? 'ARE_YOU_SURE_TO_EDIT' : 'ARE_YOU_SURE_TO_ADD', event);
      if (confirm)
        confirm.then(function () {
          var addInvoice = utilsFactory.securedPostJSON((invoiceId ? 'api/Invoices/InvoicesUpdate' : 'api/Invoices/InvoicesAdd'), data);
          if (addInvoice)
            addInvoice.success(function (res) {
              if (res && res.Code === SUCCESS_CODE) {
                dialogService.toast((invoiceId ? 'EDIT_SUCCESS' : 'ADD_SUCCESS'));
                $location.path((invoiceFund != INVOICE_FUND.cashFunds ? '/cashFunds' : '/cashFlow'));
              }
              else
                dialogService.toastWarn((invoiceId ? 'EDIT_ERROR' : 'ADD_ERROR'));
            });
        })
    }

    var getAllChildren = function (source, target) {
      _.each(source, function (item) {
        target.push(item);
        if (item.ChildNodes)
          getAllChildren(item.ChildNodes, target);
      });
    }

    var findPaymentTypeDetail = function (invoice) {
      var temp = [];
      getAllChildren($scope.categories, temp);
      return _.findWhere(temp, { PaymentTypeDetailId: invoice.PaymentTypeDetailId }) || {};
    }

    var matchData = function (data) {
      var invoice = data.Invoice || {};
      var payments = data.Payments || [];
      var details = data.Details || [];

      if (invoice) {
        $scope.checkDisplayInvoiceForm();
        $scope.selectedCustomer = {
          CompanyId: invoice.CompanyId || "",
          CompanyName: invoice.CompanyName || "",
          ContactAddress: (_.findWhere(self.customers, { CompanyId: invoice.CompanyId }) || { ContactAddress: "" }).ContactAddress || ""
        };
        $scope.content = invoice.InvoiceContent || "";
        $scope.typeCate = findPaymentTypeDetail(invoice);

        $scope.receiptNum = invoice.InvoiceNo || "";
        $scope.receiptedDate = invoice.InvoiceDate ? new Date(invoice.InvoiceDate) : new Date();
        $scope.type = invoice.InvoiceType || null;
        $scope.selectedEmployee = !_.isEmpty(invoice.Employee) ? {
          Id: invoice.Employee || "",
          name: ((_.findWhere(self.employees, { 'Id': invoice.Employee }) || { name: invoice.Employee }) || {}).name || "",
          value: invoice.Employee || ""
        } : _.first(self.employees);

        $scope.bankAccountPaid = invoice.HotelBankAccountId || "";
        $scope.bankAccountReceive = invoice.BankAccReceive || "";
        $scope.ShowSaveBtn = (invoice.PostFrom != null && invoice.PostFrom == 1) || invoice.Status != 1 ? false : true;
      }

      if (details)
        $scope.paymentDetails = details;

      if (_.size(payments) > 0) {
        $scope.paymentsSelected = payments;
        $scope.isChooseInvoice = true;
      }
    }

    var getConvertedAmount = function (item) {
      var obj = _.findWhere($scope.listCurrencies, { 'MoneyId': parseInt(item.MoneyId) }) || {};
      item.Amount = item.Amount * obj.ExchangeRate || item.Amount;
      //item.Amount = item.Amount;

      return item;
    }

    var getConvertedAmount2 = function (item) {
      // var obj = _.findWhere($scope.listCurrencies, { 'MoneyId': parseInt(item.MoneyId) }) || {};
      // item.Amount = item.Amount * obj.ExchangeRate || item.Amount;
      item.Amount = item.Amount;

      return item;
    }

    $scope.init = function () {
      $scope.isView = $location.search().isView;

      var invFundFromBtn = $location.search().invoiceFund;
      if (_.isNull(invoiceFund) || _.isUndefined(invoiceFund)) {
        invoiceFund = invoiceFund || INVOICE_FUND.cashFunds;
      }
      else if (invFundFromBtn)
        invoiceFund = invFundFromBtn;

      $scope.invoiceFund = invoiceFund;
      var infoPromise = utilsFactory.sendGetRequest('api/InvoiceAudits/GetListMoneyForAudit');

      getBankList();
      infoPromise.then(function (data, status, headers, config) {
        $scope.listCurrencies = data.data && data.data.Data ? data.data.Data : [];
        var indexC = {};
        $scope.listCurrencies.forEach(function (element) {
          indexC[element.MoneyName] = element;
        });
        $scope.indexCurrencies = indexC;
      });

      if (invoiceId) {
        var invoice = utilsFactory.sendGetRequest('api/Invoices/InvoicesGetById', { InvoiceID: invoiceId });
        invoice.success(function (res) {
          if (res && res.Code == SUCCESS_CODE) {
            matchData(res.Data || {});

          }
        });
      } else {
        //get invoiceNo code
        var invoiceNo = utilsFactory.sendGetRequest('api/Invoices/InvoicesGetInvoiceNo', { 'InvoiceFund': invoiceFund, 'InvoiceGroup': INVOICE_GROUP.income });
        invoiceNo.success(function (res) {
          if (res && res.Code == SUCCESS_CODE) {
            $scope.receiptNum = res.Data;
            getListEmployees().then(function (res) {
              console.log("employees", res);
              var temp = res.data.Data;
              var employee = _.findWhere(temp, { UserName: userName });
              $scope.selectedEmployee = {
                Id: employee.Id,
                name: employee.StaffName,
                value: employee.Id,
              };
            })
            $scope.paymentDetails = [];
            commonFactory.getHotelCommonInformation(function (data) {
              console.log(123, data);
              $scope.defaultMoneyId = data && data.Hotel ? data.Hotel.DefaultMoneyId : null;
              $scope.decimal = data.Currency.MinorUnit;
              $scope.paymentDetails.push({
                id: 0,
                Amount: null,
                PaymentDescription: '',
                CreatedDate: new Date(),
                HotelId: $localStorage.lastLogin ? $localStorage.lastLogin.hotelId : null,
                PaymentMethodId: PAYMENT_METHOD.cashFunds,
                MoneyId: $scope.defaultMoneyId,
              });
            });
           
          }
        });
      }
    }


  }]);