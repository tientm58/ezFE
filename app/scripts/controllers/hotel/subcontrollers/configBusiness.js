ezCloud.controller('configBusinessController', ['$scope', '$rootScope', '$state', 'dialogService', '$localStorage', '$http', '$sessionStorage', 'loginFactory', '$mdDialog', 'flowFactory', '$filter', '$log', '$mdSidenav', '$mdMedia', 'configFactory', '$q', '$location', function ($scope, $rootScope, $state, dialogService, $localStorage, $http, $sessionStorage, loginFactory, $mdDialog, flowFactory, $filter, $log, $mdSidenav, $mdMedia, configFactory, $q, $location) {
	$scope.sourceList = [];
	$scope.models = {
		selected: null,
		lists: []
	};

	$scope.isSourceListChanged = false;
	$scope.isMarketListChanged = false;
	$rootScope.companyOn = true;
	$rootScope.sourceOn = false;
	$rootScope.marketOn = false;

	function Init() {
		/*$rootScope.companyOn = true;
		$scope.companyOn = angular.copy($rootScope.companyOn);
		if ($rootScope.sourceOn === true) {
			$scope.sourceOn = angular.copy($rootScope.sourceOn);
			$rootScope.sourceOn = false;
			$rootScope.marketOn = false;
			$rootScope.companyOn = false;
		}
		if ($rootScope.marketOn === true) {
			$scope.marketOn = angular.copy($rootScope.marketOn);
			$rootScope.companyOn = false;
			$rootScope.sourceOn = false;
			$rootScope.companyOn = false;
		}*/

		$scope.companyOn = true;
		$scope.sourceOn = false;
		$scope.marketOn = false;

		console.log("ROOT", $rootScope.companyOn, $rootScope.sourceOn, $rootScope.marketOn);
		if ($rootScope.sourceOn === true) {
			$scope.sourceOn = true;
			$scope.companyOn = false;
			$scope.marketOn = false;
			//$rootScope.sourceOn = true;
			$rootScope.companyOn = false;
			$rootScope.marketOn = false;
		}
		if ($rootScope.marketOn === true) {
			$scope.sourceOn = false;
			$scope.companyOn = false;
			$scope.marketOn = true;
			$rootScope.sourceOn = false;
			$rootScope.companyOn = false;
			//$rootScope.marketOn = true;
		}


		$scope.marketOn = $rootScope.marketOn;
		var getAllBusinessData = loginFactory.securedGet("api/Business/GetAllBusinessData", "");
		$rootScope.dataLoadingPromise = getAllBusinessData;
		getAllBusinessData.success(function (data) {
			$scope.sourceList = data.sourceList.sort(function (a, b) {
				return a.Priority - b.Priority;
			});
			$scope.companyList = data.companyList;
			$scope.marketList = data.marketList.sort(function (a, b) {
				return a.Priority - b.Priority;
			});
		}).error(function (err) {
			console.log(err);
		})
	}
	Init();

	// START SOURCE PART

	$scope.addNewSource = function () {
		$mdDialog.show({
			controller: AddNewSourceDialogController,
			resolve: {
				sourceList: function () {
					return $scope.sourceList;
				}
			},
			templateUrl: 'views/templates/addNewSource.tmpl.html',
			parent: angular.element(document.body),
			targetEvent: null,
		}).then(function (newSource) {
			if (newSource !== null) {
				newSource.Priority = $scope.sourceList.length;
				var addNewSource = loginFactory.securedPostJSON("api/Business/AddNewSource", newSource);
				$rootScope.dataLoadingPromise = addNewSource;
				addNewSource.success(function (data) {
					dialogService.toast("ADD_NEW_SOURCE_SUCCESSFUL");
					$rootScope.sourceOn = true;
					Init();
				}).error(function (err) {
					dialogService.messageBox("ERROR", err.Message);
				})
			}
		}, function () {});

		function AddNewSourceDialogController($scope, $mdDialog, sourceList) {
			$scope.newSource = {};
			$scope.sourceList = sourceList;
			$scope.verifySourceName = false;
			$scope.verifySourceCode = false;
			$scope.hide = function () {
				$mdDialog.hide();
			};
			$scope.cancel = function () {
				$mdDialog.cancel();
			};

			$scope.addNewSource = function () {
				$mdDialog.hide($scope.newSource);
			}
			$scope.verifyDuplicate = function (type) {
				if (type == 'SOURCE_NAME') {
					if ($scope.sourceList !== null && $scope.sourceList.length > 0) {
						var temp = _.filter($scope.sourceList, function (item) {
							// return (item.SourceName.indexOf($scope.newSource.SourceName) >= 0);
							return (item.SourceName==$scope.newSource.SourceName) ;
						});
						if (temp.length > 0) {
							$scope.verifySourceName = true;
						} else {
							$scope.verifySourceName = false;
						}
					}
				}
				if (type == 'SOURCE_CODE') {
					if ($scope.sourceList !== null && $scope.sourceList.length > 0) {
						var temp = _.filter($scope.sourceList, function (item) {
							return (item.ShortCode.toLowerCase()==$scope.newSource.ShortCode.toLowerCase());
							// return (item.ShortCode.toLowerCase().indexOf($scope.newSource.ShortCode.toLowerCase()) >= 0);
						});
						console.log("TEMP", temp);
						if (temp.length > 0) {
							$scope.verifySourceCode = true;
						} else {
							$scope.verifySourceCode = false;
						}
					}
				}



			};
		}
	};

	$scope.removeMarket = function (market) {
		dialogService.confirm("DO_YOU_WANT_TO_REMOVE_THIS_MARKET?").then(function (data) {
			var removeMarket = loginFactory.securedPostJSON("api/Business/RemoveBusiness", market);
			$rootScope.dataLoadingPromise = removeMarket;
			removeMarket.success(function () {
				dialogService.toast("REMOVE_MARKET_SUCCESSFUL");
				Init();
			}).error(function (err) {
				if (err.Message) {
					dialogService.messageBox(err.Message);
				}
			})
		}, function () {});
	};

	$scope.editSource = function (source) {
		var sourceTemp = angular.copy(source);
		$mdDialog.show({
			controller: EditSourceDialogController,
			resolve: {
				source: function () {
					return sourceTemp;
				},
				sourceList: function () {
					return $scope.sourceList;
				}
			},
			templateUrl: 'views/templates/editSource.tmpl.html',
			parent: angular.element(document.body),
			targetEvent: null,
		}).then(function (source) {
			if (source !== null) {

				var editSource = loginFactory.securedPostJSON("api/Business/EditSource", source);
				$rootScope.dataLoadingPromise = editSource;
				editSource.success(function (data) {
					dialogService.toast("EDIT_SOURCE_SUCCESSFUL");
					Init();
				}).error(function (err) {
					dialogService.messageBox("ERROR", err.Message);
				})
			}
		}, function () {});

		function EditSourceDialogController($scope, $mdDialog, source, sourceList) {
			$scope.source = source;
			$scope.sourceList = sourceList;
			$scope.hide = function () {
				$mdDialog.hide();
			};
			$scope.cancel = function () {
				$mdDialog.cancel();
			};

			$scope.editSource = function () {
				$mdDialog.hide($scope.source);
			}

			$scope.verifyDuplicate = function (type) {
				if (type == 'SOURCE_NAME') {
					if ($scope.sourceList !== null && $scope.sourceList.length > 0) {
						var temp = _.filter($scope.sourceList, function (item) {
							// return (item.SourceName.indexOf($scope.source.SourceName) >= 0);
							return (item.SourceName==$scope.source.SourceName);
						});
						if (temp.length > 0) {
							$scope.verifySourceName = true;
						} else {
							$scope.verifySourceName = false;
						}
					}
				}
				if (type == 'SOURCE_CODE') {
					if ($scope.sourceList !== null && $scope.sourceList.length > 0) {
						var temp = _.filter($scope.sourceList, function (item) {
							return (item.ShortCode.toLowerCase()==$scope.source.ShortCode.toLowerCase());
							// return (item.ShortCode.toLowerCase().indexOf($scope.source.ShortCode.toLowerCase()) >= 0);
						});
						console.log("TEMP", temp);
						if (temp.length > 0) {
							$scope.verifySourceCode = true;
						} else {
							$scope.verifySourceCode = false;
						}
					}
				}
			}
		}
	}

	$scope.changeSourceStatus = function (source, event) {
		var confirmString = "";
		if (source !== null && source.IsAvailable) {
			confirmString = "DO_YOU_WANT_TO_SET_THIS_SOURCE_STATUS_TO_INACTIVE"
		}
		if (source !== null && !source.IsAvailable) {
			confirmString = "DO_YOU_WANT_TO_SET_THIS_SOURCE_STATUS_TO_ACTIVE"
		}
		dialogService.confirm(confirmString).then(function () {
			var changeSourceStatus = loginFactory.securedPostJSON("api/Business/ChangeSourceStatus?sourceId=" + source.SourceId, "");
			$rootScope.dataLoadingPromise = changeSourceStatus;
			changeSourceStatus.success(function (data) {
				dialogService.toast("CHANGE_SOURCE_STATUS_SUCCESSFUL");
				Init();
			}).error(function (err) {
				dialogService.messageBox(err.Message);
			})
		});
	};

	$scope.listMove = function (index) {
		$scope.sourceList.splice(index, 1);
		$scope.isSourceListChanged = true;
	};

	$scope.saveSourceList = function () {
		var sourceListTemp = angular.copy($scope.sourceList);
		for (var index in sourceListTemp) {
			sourceListTemp[index].Priority = index;
		}
		var changeSourceListPriority = loginFactory.securedPostJSON("api/Business/ChangeSourceListPriority", sourceListTemp);
		$rootScope.dataLoadingPromise = changeSourceListPriority;
		changeSourceListPriority.success(function () {
			dialogService.toast("CHANGE_SOURCE_PRIORITY_SUCCESSFUL");
			$scope.isSourceListChanged = false;
			Init();
		}).error(function (err) {
			dialogService.messageBox(err.Message);
		});
	};

	// END SOURCE PART

	// START COMPANY PART

	$scope.addNewCompany = function () {
		$mdDialog.show({
			controller: AddNewCompanyDialogController,
			resolve: {
				sourceList: function () {
					if ($scope.sourceList && $scope.sourceList.length > 0) {
						return _.filter($scope.sourceList, function (item) {
							return item.IsAvailable == true;
						});
					} else {
						return null;
					}
				},
				companyList: function () {
					return $scope.companyList;
				}
			},
			templateUrl: 'views/templates/addNewCompany.tmpl.html',
			parent: angular.element(document.body),
			targetEvent: null,
		}).then(function (newCompany) {
			if (newCompany !== null) {
				var addNewCompany = loginFactory.securedPostJSON("api/Business/AddNewCompany", newCompany);
				$rootScope.dataLoadingPromise = addNewCompany;
				addNewCompany.success(function (data) {
					dialogService.toast("ADD_NEW_COMPANY_SUCCESSFUL");
					Init();
				}).error(function (err) {
					dialogService.messageBox("ERROR", err.Message);
				})
			}
		}, function () {});

		function AddNewCompanyDialogController($scope, $mdDialog, sourceList, companyList) {
			$scope.newCompany = {};
			$scope.sourceList = sourceList;
			$scope.companyList = companyList;
			console.log("COMPANY LIST", $scope.companyList);
			$scope.verifyCompanyName = false;
			$scope.verifyCompanyCode = false;

			function Init() {
				$scope.verifyCompanyName = false;
				$scope.verifyCompanyCode = false;
			}
			Init();
			$scope.hide = function () {
				$mdDialog.hide();
			};
			$scope.cancel = function () {
				$mdDialog.cancel();
			};

			$scope.verifyDuplicate = function (type) {
				console.log("CHANGE HERE", type, $scope.verifyCompanyName);
				if (type == 'COMPANY_NAME') {
					if ($scope.companyList !== null && $scope.companyList.length > 0) {
						var temp = _.filter($scope.companyList, function (item) {
							console.log("ITEM", item.CompanyName.indexOf($scope.newCompany.CompanyName))
							// return (item.CompanyName.indexOf($scope.newCompany.CompanyName) >= 0);
							return (item.CompanyName==$scope.newCompany.CompanyName);
						});
						console.log("TEMP", temp);
						if (temp.length > 0) {
							$scope.verifyCompanyName = true;
						} else {
							$scope.verifyCompanyName = false;
						}
					}
				}
				if (type == 'COMPANY_CODE') {
					if ($scope.companyList !== null && $scope.companyList.length > 0) {
						var temp = _.filter($scope.companyList, function (item) {

							// return (item.CompanyCode.toLowerCase().indexOf($scope.newCompany.CompanyCode.toLowerCase()) >= 0);
							return (item.CompanyCode.toLowerCase()==$scope.newCompany.CompanyCode.toLowerCase());
						});
						console.log("TEMP", temp);
						if (temp.length > 0) {
							$scope.verifyCompanyCode = true;
						} else {
							$scope.verifyCompanyCode = false;
						}
					}
				}



			};


			$scope.addNewCompany = function () {
				$mdDialog.hide($scope.newCompany);
			}
		}
	};

	$scope.removeSource = function (source) {
		dialogService.confirm("DO_YOU_WANT_TO_REMOVE_THIS_SOURCE")
	}

	$scope.editCompany = function (company) {
		var companyTemp = angular.copy(company);
		$mdDialog.show({
			controller: EditCompanyDialogController,
			resolve: {
				company: function () {
					return companyTemp;
				},
				sourceList: function () {
					return $scope.sourceList;
				},
				companyList: function () {
					return $scope.companyList;
				}
			},
			templateUrl: 'views/templates/editCompany.tmpl.html',
			parent: angular.element(document.body),
			targetEvent: null,
		}).then(function (company) {
			console.log("EDITED COMPANY", company);
			if (company !== null) {

				var editCompany = loginFactory.securedPostJSON("api/Business/EditCompany", company);
				$rootScope.dataLoadingPromise = editCompany;
				editCompany.success(function (data) {
					dialogService.toast("EDIT_COMPANY_SUCCESSFUL");
					Init();
				}).error(function (err) {
					dialogService.messageBox("ERROR", err.Message);
				})
			}
		}, function () {});

		function EditCompanyDialogController($scope, $mdDialog, company, sourceList, companyList) {
			$scope.company = company;
			$scope.companyList = companyList;
			$scope.sourceList = sourceList;
			$scope.verifyCompanyName = false;
			$scope.verifyCompanyCode = false;
			$scope.hide = function () {
				$mdDialog.hide();
			};
			$scope.cancel = function () {
				$mdDialog.cancel();
			};

			$scope.editCompany = function () {
				$mdDialog.hide($scope.company);
			}

			$scope.verifyDuplicate = function (type) {
				console.log("CHANGE HERE", type, $scope.verifyCompanyName);
				if (type == 'COMPANY_NAME') {
					if ($scope.companyList !== null && $scope.companyList.length > 0) {
						var temp = _.filter($scope.companyList, function (item) {
							console.log("ITEM", item.CompanyName.indexOf($scope.company.CompanyName))
							return (item.CompanyId != $scope.company.CompanyId && item.CompanyName.indexOf($scope.company.CompanyName) >= 0);
						});
						console.log("TEMP", temp);
						if (temp.length > 0) {
							$scope.verifyCompanyName = true;
						} else {
							$scope.verifyCompanyName = false;
						}
					}
				}
				if (type == 'COMPANY_CODE') {
					if ($scope.companyList !== null && $scope.companyList.length > 0) {
						var temp = _.filter($scope.companyList, function (item) {

							return (item.CompanyCode.toLowerCase().indexOf($scope.newCompany.CompanyCode.toLowerCase()) >= 0);
						});
						console.log("TEMP", temp);
						if (temp.length > 0) {
							$scope.verifyCompanyCode = true;
						} else {
							$scope.verifyCompanyCode = false;
						}
					}
				}



			};
		}
	}

	$scope.removeCompany = function (company) {
		dialogService.confirm("DO_YOU_WANT_TO_REMOVE_THIS_COMPANY?").then(function (data) {
			var removeBusiness = loginFactory.securedPostJSON("api/Business/RemoveBusiness", company);
			$rootScope.dataLoadingPromise = removeBusiness;
			removeBusiness.success(function () {
				dialogService.toast("REMOVE_COMPANY_SUCCESSFUL");
				Init();
			}).error(function (err) {
				if (err.Message) {
					dialogService.messageBox(err.Message);
				}
			})
		}, function () {});
	};

	$scope.changeCompanyStatus = function (company, event) {
		var confirmString = "";
		if (company !== null && company.IsAvailable) {
			confirmString = "DO_YOU_WANT_TO_SET_THIS_COMPANY_STATUS_TO_INACTIVE"
		}
		if (company !== null && !company.IsAvailable) {
			confirmString = "DO_YOU_WANT_TO_SET_THIS_COMPANY_STATUS_TO_ACTIVE"
		}
		dialogService.confirm(confirmString).then(function () {
			var changeCompanyStatus = loginFactory.securedPostJSON("api/Business/ChangeCompanyStatus?companyId=" + company.CompanyId, "");
			$rootScope.dataLoadingPromise = changeCompanyStatus;
			changeCompanyStatus.success(function (data) {
				dialogService.toast("CHANGE_COMPANY_STATUS_SUCCESSFUL");
				Init();
			}).error(function (err) {
				dialogService.messageBox(err.Message);
			})
		});
	};



	// END COMPANY PART

	// START MARKET PART

	$scope.addNewMarket = function () {
		$mdDialog.show({
			controller: AddNewMarketDialogController,
			resolve: {
				marketList: function () {
					return $scope.marketList;
				}
			},
			templateUrl: 'views/templates/addNewMarket.tmpl.html',
			parent: angular.element(document.body),
			targetEvent: null,
		}).then(function (newMarket) {
			if (newMarket !== null) {
				newMarket.Priority = $scope.marketList.length;
				var addNewMarket = loginFactory.securedPostJSON("api/Business/AddNewMarket", newMarket);
				$rootScope.dataLoadingPromise = addNewMarket;
				addNewMarket.success(function (data) {
					dialogService.toast("ADD_NEW_MARKET_SUCCESSFUL");
					Init();
				}).error(function (err) {
					dialogService.messageBox("ERROR", err.Message);
				})
			}
		}, function () {});

		function AddNewMarketDialogController($scope, $mdDialog, marketList) {
			$scope.newMarket = {};
			$scope.marketList = marketList;
			$scope.hide = function () {
				$mdDialog.hide();
			};
			$scope.cancel = function () {
				$mdDialog.cancel();
			};

			$scope.addNewMarket = function () {
				$mdDialog.hide($scope.newMarket);
			}
			$scope.verifyDuplicate = function (type) {
				console.log("CHANGE HERE", type, $scope.verifyCompanyName);
				if (type == 'MARKET_NAME') {
					if ($scope.marketList !== null && $scope.marketList.length > 0) {
						var temp = _.filter($scope.marketList, function (item) {
							// return (item.MarketName.indexOf($scope.newMarket.MarketName) >= 0);
							return (item.MarketName==$scope.newMarket.MarketName);
						});
						console.log("TEMP", temp);
						if (temp.length > 0) {
							$scope.verifyMarketName = true;
						} else {
							$scope.verifyMarketName = false;
						}
					}
				}
				if (type == 'MARKET_CODE') {
					if ($scope.marketList !== null && $scope.marketList.length > 0) {
						var temp = _.filter($scope.marketList, function (item) {
							// return (item.MarketCode.toLowerCase().indexOf($scope.newMarket.MarketCode.toLowerCase()) >= 0);
							return (item.MarketCode.toLowerCase()==$scope.newMarket.MarketCode.toLowerCase());
						});
						console.log("TEMP", temp);
						if (temp.length > 0) {
							$scope.verifyMarketCode = true;
						} else {
							$scope.verifyMarketCode = false;
						}
					}
				}



			};
		}
	};

	$scope.removeSource = function (source) {
		dialogService.confirm("DO_YOU_WANT_TO_REMOVE_THIS_SOURCE?").then(function (data) {
			var removeSource = loginFactory.securedPostJSON("api/Business/RemoveBusiness", source);
			$rootScope.dataLoadingPromise = removeSource;
			removeSource.success(function () {
				dialogService.toast("REMOVE_SOURCE_SUCCESSFUL");
				Init();
			}).error(function (err) {
				if (err.Message) {
					dialogService.messageBox(err.Message);
				}
			})
		}, function () {});
	};
	
	

	$scope.editMarket = function (market) {
		var marketTemp = angular.copy(market);
		$mdDialog.show({
			controller: EditMarketDialogController,
			resolve: {
				market: function () {
					return marketTemp;
				},
				marketList: function () {
					return $scope.marketList;
				}
			},
			templateUrl: 'views/templates/editMarket.tmpl.html',
			parent: angular.element(document.body),
			targetEvent: null,
		}).then(function (market) {
			if (market !== null) {

				var editMarket = loginFactory.securedPostJSON("api/Business/EditMarket", market);
				$rootScope.dataLoadingPromise = editMarket;
				editMarket.success(function (data) {
					dialogService.toast("EDIT_MARKET_SUCCESSFUL");
					Init();
				}).error(function (err) {
					dialogService.messageBox("ERROR", err.Message);
				})
			}
		}, function () {});

		function EditMarketDialogController($scope, $mdDialog, market, marketList) {
			$scope.market = market;
			$scope.marketList = marketList;
			$scope.verifyMarketCode = false;
			$scope.verifyMarketName = false;
			$scope.hide = function () {
				$mdDialog.hide();
			};
			$scope.cancel = function () {
				$mdDialog.cancel();
			};

			$scope.editMarket = function () {
				$mdDialog.hide($scope.market);
			}

			$scope.verifyDuplicate = function (type) {
				if (type == 'MARKET_NAME') {
					if ($scope.marketList !== null && $scope.marketList.length > 0) {
						var temp = _.filter($scope.marketList, function (item) {
							return (item.MarketName.indexOf($scope.market.MarketName) >= 0);
						});
						console.log("TEMP", temp);
						if (temp.length > 0) {
							$scope.verifyMarketName = true;
						} else {
							$scope.verifyMarketName = false;
						}
					}
				}
				if (type == 'MARKET_CODE') {
					if ($scope.marketList !== null && $scope.marketList.length > 0) {
						var temp = _.filter($scope.marketList, function (item) {
							return (item.MarketCode.toLowerCase().indexOf($scope.market.MarketCode.toLowerCase()) >= 0);
						});
						console.log("TEMP", temp);
						if (temp.length > 0) {
							$scope.verifyMarketCode = true;
						} else {
							$scope.verifyMarketCode = false;
						}
					}
				}
			}


		}
	}

	$scope.changeMarketStatus = function (market, event) {
		var confirmString = "";
		if (market !== null && market.IsAvailable) {
			confirmString = "DO_YOU_WANT_TO_SET_THIS_MARKET_STATUS_TO_INACTIVE"
		}
		if (market !== null && !market.IsAvailable) {
			confirmString = "DO_YOU_WANT_TO_SET_THIS_MARKET_STATUS_TO_ACTIVE"
		}
		dialogService.confirm(confirmString).then(function () {
			var changeMarketStatus = loginFactory.securedPostJSON("api/Business/ChangeMarketStatus?marketId=" + market.MarketId, "");
			$rootScope.dataLoadingPromise = changeMarketStatus;
			changeMarketStatus.success(function (data) {
				dialogService.toast("CHANGE_MARKET_STATUS_SUCCESSFUL");
				Init();
			}).error(function (err) {
				dialogService.messageBox(err.Message);
			})
		});
	};

	$scope.marketListMove = function (index) {
		$scope.marketList.splice(index, 1);
		$scope.isMarketListChanged = true;
	};

	$scope.saveMarketList = function () {
		var marketListTemp = angular.copy($scope.marketList);
		for (var index in marketListTemp) {
			marketListTemp[index].Priority = index;
		}
		var changeMarketListPriority = loginFactory.securedPostJSON("api/Business/ChangeMarketListPriority", marketListTemp);
		$rootScope.dataLoadingPromise = changeMarketListPriority;
		changeMarketListPriority.success(function () {
			dialogService.toast("CHANGE_MARKET_PRIORITY_SUCCESSFUL");
			$scope.isMarketListChanged = false;
			Init();
		}).error(function (err) {
			dialogService.messageBox(err.Message);
		});
	};

	// END SOURCE PART


}]);