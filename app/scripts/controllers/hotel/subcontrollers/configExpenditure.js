'use strict';
ezCloud.controller('configExpenditureController', ['$scope', '$rootScope', '$state', '$location', '$timeout', '$mdDialog', '$mdMedia', '$filter', '$q', 'utilsFactory', '$localStorage', 'dialogService', function ($scope, $rootScope, $state, $location, $timeout, $mdDialog, $mdMedia, $filter, $q, utilsFactory, $localStorage, dialogService) {
    const SUCCESS_CODE = 0, BANK_STATUS = { 'live': 0, 'closed': 1 };

    $scope.data = {
        banks: [],
        focusCode: false,
        bank: { 'text': $filter('translate')('ADD_BANK_ACCOUNT') }
    }

    //var numAllow = 1, maxAllow = 1;
    $scope.defer = $q.defer();
    $scope.action =
        {
            dialogController: function ($scope, $mdDialog) {
                function Init(){
                    $scope.isClickBtn = false;
                }
                Init();
                $scope.cancel = function () { return $mdDialog.cancel() };
                angular.element(angular.element.find('input[name="Code"]')).focus();
                angular.element(angular.element.find('input[name="Code"]')).focus();
            },
            configDialog: function () {
                this.dialogController.$inject = ['$scope', '$mdDialog'];
                return {
                    controller: this.dialogController,
                    scope: $scope.$new(),
                    templateUrl: 'views/templates/addBankAccount.tmpl.html',
                    parent: angular.element(document.body),
                    fullscreen: $mdMedia('xs'),
                    targetEvent: event,
                    clickOutsideToClose: false,
                    // onRemoving: function (event) {
                    //     numAllow = 0;
                    // }
                }
            },
            getListBanks: function () {
                $scope.promise = utilsFactory.sendGetRequest('api/HotelBankAccount/GetAllBankAccount', {});

                if ($scope.promise) {
                    $scope.promise.success(function (res) {
                        if (res && res.Code == SUCCESS_CODE) {
                            var list = res.Data ? res.Data : [];
                            if (_.isArray(list) && _.size(list) > 0)
                                return $scope.data.banks = list;
                        }
                    })
                }
            },
            addPopup: function (flag) {
                $scope.data.focusCode = true;
                $scope.data.bank.isUpdate = flag && flag === 'update' ? true : false;
                $scope.data.bank.text = flag && flag === 'update' ? $filter('translate')('UPDATE_BANK_ACCOUNT') : $filter('translate')('ADD_BANK_ACCOUNT');

                return $mdDialog.show(this.configDialog())
                    .then(function (selected) {
                        $scope.action.clearItem();
                    }, function (selected) {
                        $scope.action.clearItem();
                    });
            },
            add: function (isFormInValid) {
                // if (++numAllow > maxAllow)
                //     return $mdDialog.cancel();
                $scope.isClickBtn = true;
                if (isFormInValid)
                    return $mdDialog.cancel();
                if (!_.isEmpty($scope.data.bank)) {
                    var isUpdate = $scope.data.bank.isUpdate;
                    var url = isUpdate === true ? 'api/HotelBankAccount/UpdateHotelBankAccount' : 'api/HotelBankAccount/AddBankAccount';
                    $scope.promise = utilsFactory.securedPostJSON(url, $scope.data.bank);
                    $scope.promise.success(function (res) {
                        $scope.defer.resolve(res);
                        if (res && res.Code === SUCCESS_CODE) {
                            
                             dialogService.toast(isUpdate ? 'UPDATE_SUCCESS' : 'ADD_SUCCESS');   
                             $scope.action.getListBanks();
                             $timeout(function () { $mdDialog.cancel() }, 500);
                          
                        }
                        else {
                            var msg = isUpdate ? 'UPDATE_ERROR' : 'ADD_ERROR';
                             dialogService.toastWarn(msg + (res.Message || ""));
                        }
                    })
                } else
                    $scope.defer.reject();

                return $scope.defer.promise;
            },
            edit: function (item) {
                $scope.data.bank = angular.copy(item);

                this.addPopup('update');
            },
            delete: function (event, item, index) {
                if (_.isEmpty(item))
                    item = $scope.data.banks[index];

                var confirm = dialogService.confirm('NOTIFICATION', 'CONFIRM_DELETE_BANK_ACCOUNT', event);

                return confirm.then(function () {
                    $scope.promise = utilsFactory.securedPostJSON('api/HotelBankAccount/DeleteBankAccount', { HotelBankAccountId: item.HotelBankAccountId });

                    $scope.promise.success(function (res) {
                        if (res && res.Code === SUCCESS_CODE) {
                            $scope.action.getListBanks();
                            return dialogService.toast('DELETE_SUCCESS');
                        }
                        else
                            return dialogService.toastWarn('DELETE_ERROR');
                    })
                });
            },
            clearItem: function () {
                $scope.data.focusCode = false;
                return $scope.data.bank = {};
            }
        }


    // danh mục thu chi .js
    
    //var numAllow = 1, maxAllow = 1;

    $scope.payments = {
        attributes: {
            disablePaymentType: true,
            list: [],
            listCatPopup: [],
            newPayment: { "PaymentGroup":1},
            selectedElement: {},
            popup: {},
            focusCode: false,
            textPopup: $filter('translate')('ADD_NEW_CATEGORY'),
            type: {
                1: $filter('translate')('IN_COME'),
                2: $filter('translate')('OUT_COME')
            },
            filterSelect: [{
                val: 1,
                des: 'IN_COME'
            }, {
                val: 2,
                des: 'OUT_COME'
            }],
            tree: {
                promise: {},
                data: [],
                control: {},
                expandingProperty: "Code",
                colDefs: [
                    { field: "Name", displayName: $filter("translate")("EXPENDITURE_CATEGORY_NAME") },
                    { field: "PaymentGroupName", displayName: $filter("translate")("EXPENDITURE_CATEGORY_TYPE_NAME") },
                    { field: "Description", displayName: $filter("translate")("DESCRIPTION_REPORT") }
                ],
                expandingLevel: 1
            }
        },
        action: {
            changeDataType: function () {
                return $scope.payments.attributes.tree.data = _.filter($scope.payments.attributes.list, function (item) {
                    var _type = $scope.payments.attributes.filterType;
                    return item.PaymentGroup == (_type !== 'all' ? _type : item.PaymentGroup);
                });
            },
            clearItem: function () {
                $scope.payments.attributes.focusCode = false;
                $scope.payments.attributes.newPayment = {};
                return;
            },
            dialogController: function ($scope, $mdDialog) {
                function Init(){
                    $scope.isClickBtn = false;
                }
                Init();
                $scope.cancel = function () { return $mdDialog.cancel() };
                angular.element(angular.element.find('input[name="Code"]')).focus();
                angular.element(angular.element.find('input[name="Code"]')).focus();
            },
            configDialog: function () {
                this.dialogController.$inject = ['$scope', '$mdDialog'];
                $scope.payments.action.isNew($scope.payments.attributes.newPayment);
                return {
                    controller: this.dialogController,
                    scope: $scope.$new(),
                    templateUrl: 'views/templates/addPaymentTypeDetail.tmpl.html',
                    parent: angular.element(document.body),
                    fullscreen: $mdMedia('xs'),
                    targetEvent: event,
                    clickOutsideToClose: false,
                    // onRemoving: function (event) {
                    //     numAllow = 0;
                    // }
                }
            },
            getList: function () {
                $scope.payments.attributes.tree.promise = utilsFactory.sendGetRequest('api/PaymentTypeDetails/PaymentTypeDetailsGetDataByType');
                return $scope.payments.attributes.tree.promise.success(function (res) {
                    if (res && res.Code === SUCCESS_CODE) {
                        $scope.payments.attributes.list = res.Data ? res.Data : [];
                        $scope.payments.attributes.tree.data = $scope.payments.attributes.list;
                        $scope.payments.action.addPaymentGroupName($scope.payments.attributes.list);
                    }
                    console.log(res);
                });
            },
            filterListByType: function () {
                var dataFilter = {};

                $scope.payments.attributes.selectedElement = {};
                if (!_.isEmpty($scope.payments.attributes.newPayment))
                    dataFilter.PaymentGroupType = $scope.payments.attributes.newPayment.PaymentGroup || 1;

                if ($scope.payments.attributes.newPayment.PaymentTypeDetailId)
                    dataFilter = angular.extend(dataFilter, { 'PaymentTypeDetailId': $scope.payments.attributes.newPayment.PaymentTypeDetailId });

                if (!dataFilter.PaymentGroupType)
                    return $scope.payments.attributes.listCatPopup = [];

                var _listCat = utilsFactory.sendGetRequest('api/PaymentTypeDetails/PaymentTypeDetailsGetDataByType', dataFilter);
                return _listCat.success(function (res) {
                    if (res && res.Code === SUCCESS_CODE)
                        $scope.payments.attributes.listCatPopup = res.Data ? res.Data : [];
                })
            },
            addPaymentGroupName: function (items) {
                var self = this;
                return _.isArray(items) ? items.filter(function (item) {
                    var name = $scope.payments.attributes.type[item.PaymentGroup];
                    item.PaymentGroupName = name || "";
                    if (item.ChildNodes && _.isArray(item.ChildNodes) && _.size(item.ChildNodes) > 0)
                        self.addPaymentGroupName(item.ChildNodes);
                }) : items;
            },
            addPopup: function (isDisableEdit) {
                $scope.payments.attributes.disablePaymentType = isDisableEdit ? isDisableEdit : false;
                $scope.payments.attributes.focusCode = true;
                this.filterListByType();
                return $mdDialog.show($scope.payments.action.configDialog())
                    .then(function (selected) {
                        $scope.payments.action.clearItem();
                    }, function (selected) {
                        $scope.payments.action.clearItem();
                    });
            },
            displayType: function (id) {
                var name = $scope.payments.attributes.type[id];
                return name ? name : "";
            },
            isNew: function (obj) {
                var isNew = _.isEmpty(obj) || !obj.PaymentTypeDetailId;
                $scope.payments.attributes.textPopup = isNew ? $filter("translate")("ADD_NEW_CATEGORY") : $filter("translate")("EDIT_CATEGORY");

                return isNew;
            },
            validateForm: function () {
                return $scope.addPaymentTypeDetail.$invalid;
            },
            add: function () {

                var newPayment = $scope.payments.attributes.newPayment;
                if (!newPayment.PaymentGroup)
                    newPayment.PaymentGroup = null;
                if ($scope.payments.attributes.selectedElement) {
                    newPayment.ParentId = $scope.payments.attributes.selectedElement.PaymentTypeDetailId;
                    newPayment.Level = $scope.payments.attributes.selectedElement.Level;
                }
                else {
                    newPayment.ParentId = null;
                    newPayment.Level = 1;
                }

                var promiseNewPaymentTypeDetail = utilsFactory.securedPostJSON('api/PaymentTypeDetails/PaymentTypeDetailsAdd', newPayment);
                $scope.promiseNewPaymentTypeDetail = promiseNewPaymentTypeDetail;
                return promiseNewPaymentTypeDetail.success(function (res) {
                    if (res && res.Code == SUCCESS_CODE) {
                        dialogService.toast('ADD_CATEGORY_SUCCESSFUL');
                        $scope.payments.action.getList();
                    }
                    else
                        dialogService.toastWarn(res && res.Message ? res.Message : "error");
                }).error(function (err) {
                    dialogService.toastWarn('error');
                });
            },
            edit: function (item) {


                $scope.payments.attributes.newPayment = item ? angular.copy(item) : {};
				/*var _selected = _.findWhere($scope.payments.attributes.listCatPopup, {PaymentTypeDetailId: item.PaymentTypeDetailId});
				if(_selected)
					$scope.payments.attributes.selectedElement = _selected;*/
                if ($scope.payments.attributes.newPayment)
                    $scope.payments.attributes.newPayment.Name = String($scope.payments.attributes.newPayment.Name).trim();

                return $scope.payments.action.addPopup((parseInt(item.ParentId) !== 0));
            },
            update: function (isFormInValid) {
                // if (++numAllow > maxAllow)
                //     return $mdDialog.cancel();
                $scope.isClickBtn = true;
                if (isFormInValid)
                    return;

                $timeout(function () { $mdDialog.cancel() }, 500);
                if ($scope.payments.action.isNew($scope.payments.attributes.newPayment))
                    return $scope.payments.action.add();

                var payment = $scope.payments.attributes.newPayment;
                $scope.payments.attributes.newPayment = {};

                if (!payment.PaymentGroup)
                    payment.PaymentGroup = null;

                if ($scope.payments.attributes.selectedElement) {
                    payment.ParentId = $scope.payments.attributes.selectedElement.PaymentTypeDetailId;
                    payment.Level = $scope.payments.attributes.selectedElement.Level;
                }

                var confirm = dialogService.confirm('NOTIFICATION', !$scope.payments.action.isNew($scope.payments.attributes.newPayment) ? 'ARE_YOU_SURE_TO_EDIT' : 'ARE_YOU_SURE_TO_ADD', event);
                if (confirm)
                    confirm.then(function () {
                        var promiseNewPaymentTypeDetail = utilsFactory.securedPostJSON('api/PaymentTypeDetails/PaymentTypeDetailsUpdate', payment);

                        promiseNewPaymentTypeDetail.success(function (res) {
                            if (res && res.Code == SUCCESS_CODE) {
                                dialogService.toast('EDIT_CATEGORY_SUCCESSFUL');
                                $scope.payments.action.getList();
                            }
                            console.log(res);
                        }).error(function (err) {
                            dialogService.toastWarn('error');
                        });
                    })
            },
            remove: function (event, payment) {
                if (!payment || !payment.PaymentTypeDetailId)
                    return dialogService.toastWarn('DELETE_CATEGORY_ERROR');

                var data = {
                    PaymentTypeDetailId: payment.PaymentTypeDetailId,
                    ParentId: payment.ParentId ? payment.ParentId : null,
                    Level: payment.Level ? payment.Level : null,
                    PrefixCharactor: payment.PrefixCharactor ? payment.PrefixCharactor : ""
                }

                var confirm = dialogService.confirm('NOTIFICATION', 'CONFIRM_DELETE_CATEGORY', event);

                return confirm.then(function () {
                    var promise = utilsFactory.securedPostJSON('api/PaymentTypeDetails/PaymentTypeDetailsDelete', data);
                    promise.success(function (res) {
                        console.log(res);
                        if (res && res.Code === 0) {
                            dialogService.toast('DELETE_CATEGORY_SUCCESSFULL');
                            $scope.payments.action.getList();
                        }
                        else
                            dialogService.toastWarn('DELETE_CATEGORY_ERROR');
                    })
                });
            },
            init: function () {
                this.dialogController.$inject = ['$scope', '$mdDialog'];
                this.getList();
            }
        }
    };


    $scope.my_tree_handler = function (branch) {
    }
}]);