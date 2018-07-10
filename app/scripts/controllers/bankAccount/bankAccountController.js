'use strict';

ezCloud.controller('bankAccountController', ['$scope', '$rootScope', '$state', '$location', '$timeout', '$mdDialog', '$mdMedia', '$filter', '$q', 'utilsFactory', '$localStorage', 'dialogService', function ($scope, $rootScope, $state, $location, $timeout, $mdDialog, $mdMedia, $filter, $q, utilsFactory, $localStorage, dialogService) {
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
			dialogController: function ($scope, $mdDialog) { $scope.cancel = function () { return $mdDialog.cancel() } },
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
					// onRemoving: function(event) {
					// 	numAllow = 0;
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
				// if(++numAllow > maxAllow)
				// 	return $mdDialog.cancel();

				if (isFormInValid)
					return $mdDialog.cancel();
				if (!_.isEmpty($scope.data.bank)) {
					var isUpdate = $scope.data.bank.isUpdate;
					var url = isUpdate === true ? 'api/HotelBankAccount/UpdateHotelBankAccount' : 'api/HotelBankAccount/AddBankAccount';
					$scope.promise = utilsFactory.securedPostJSON(url, $scope.data.bank);
					$scope.promise.success(function (res) {
						$scope.defer.resolve(res);
						if (res && res.Code === SUCCESS_CODE) {
							$scope.action.getListBanks();

							return dialogService.toast(isUpdate ? 'UPDATE_SUCCESS' : 'ADD_SUCCESS');
						}
						else
						{
							var msg = isUpdate ? 'UPDATE_ERROR' : 'ADD_ERROR';
							return dialogService.toastWarn(msg + (res.Message || ""));
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

				return confirm.then(function(){
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

}]);