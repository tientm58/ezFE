ezCloud.controller('configExtraServicesController', ['$scope', '$rootScope', '$state', 'dialogService', '$localStorage', '$http', '$sessionStorage', 'loginFactory', '$mdDialog', 'flowFactory', '$filter', '$log', '$mdSidenav', '$mdMedia', 'configFactory', '$q', '$location', function ($scope, $rootScope, $state, dialogService, $localStorage, $http, $sessionStorage, loginFactory, $mdDialog, flowFactory, $filter, $log, $mdSidenav, $mdMedia, configFactory, $q, $location) {

    $scope.extraSericeTypes = {};
    $scope.extraServiceCategories = {};
    $scope.extraServiceItems = [];

    function configExtraServicesInit() {

        configFactory.getAllExtraServices(function (data) {

            $scope.extraSericeTypes = data.extraServiceTypes;
            console.log($scope.extraSericeTypes);
            $scope.extraServiceCategories = data.extraServiceCategories;

            $scope.extraServiceItems = data.extraServiceItems;
        });
    }

    configExtraServicesInit();


    $scope.categoryOn = false;
    $scope.itemOn = false;

    $scope.currentCategoryByType = {};
    $scope.currentItemByCategory = {};

    $scope.showCategory = function (type) {

        $scope.itemOn = false;
        if ($scope.categoryOn == false) {
            $scope.categoryOn = true;

        } else {
            if ($scope.currentCategoryByType.ExtraServiceType == type) {
                $scope.categoryOn = false;
            }

        };

        $scope.currentCategoryByType.ExtraServiceType = type;
        $scope.currentCategoryByType.ExtraServiceCategoryByType = $scope.extraServiceCategories[type.ExtraServiceTypeId];

    };
    $scope.changeCategoryStatus = function (category) {

        var confirm = dialogService.confirm("ENABLE/DISABLE_CATEGORY_CONFIRM", "WOULD_YOU_LIKE_TO_CHANGE_CATEGORY_STATUS ");
        confirm.then(function () {
            category.IsHidden = (category.IsHidden == true) ? false : true;

            configFactory.changeCategoryStatus(category.ExtraServiceCategoryId);
        });

    };

    $scope.backToType = function () {
        $scope.categoryOn = false;
    };

    $scope.addCategory = function (event) {
        $mdDialog.show({
            controller: AddNewCategoryDialogController,
            resolve: {
                currentESTypeId: function () {
                    return $scope.currentCategoryByType.ExtraServiceType.ExtraServiceTypeId;
                }
            },
            templateUrl: 'views/templates/addNewCategory.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
        }).then(function (newCategory) {

            configFactory.addCategory(newCategory, function () {
                $scope.currentCategoryByType.ExtraServiceCategoryByType[newCategory.ExtraServiceCategoryId] = newCategory;
            });

        }, function () {

        });
    };
    AddNewCategoryDialogController.$inject = ['$scope', '$mdDialog', 'currentESTypeId'];

    function AddNewCategoryDialogController($scope, $mdDialog, currentESTypeId) {
        $scope.newCategory = {
            ExtraServiceCategoryName: "",
            ExtraServiceCategoryDescription: "",
            ExtraServiceTypeId: currentESTypeId,
            ExtraServiceCategoryId: 0,
            HotelId: "",
            IsHidden: false
        };

        $scope.hide = function () {
            $mdDialog.hide();
        };
        $scope.cancel = function () {
            $mdDialog.cancel();
        };
        $scope.saveNewCategory = function (newCategory) {
            $mdDialog.hide(newCategory);
        };
    }

    $scope.deleteCategory = function (category, $event) {



        var esItemByCat = $scope.extraServiceItems[category.ExtraServiceCategoryId];

        var size = _.size(angular.copy(esItemByCat));

        var confirm = dialogService.confirm("WOULD_YOU_LIKE_TO_DELETE_THIS_CATEGORY", "ALL_ITEMS_INSIDE_THIS_CATEGORY_WILL_BE_DELETED_IMMEDIATELY");

        confirm.then(function () {


            configFactory.removeCategory(category, function () {
                delete $scope.currentCategoryByType.ExtraServiceCategoryByType[category.ExtraServiceCategoryId];
            });
        });

        $event.stopPropagation();

    };

    $scope.editCategory = function (category) {
        //var index =  $scope.currentCategoryByType.ExtraServiceCategoryByType.indexOf(category);
        var categoryTemp = angular.copy(category);
        $mdDialog.show({
            controller: EditCategoryDialogController,
            resolve: {
                categoryEditing: function () {
                    return categoryTemp;
                }
            },
            templateUrl: 'views/templates/editCategory.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
        }).then(function (categoryEdited) {
            configFactory.editCategory(categoryEdited, function (data) {
                for (var index in $scope.extraServiceCategories) {
                    for (var idx in $scope.extraServiceCategories[index]) {
                        if ($scope.extraServiceCategories[index][idx].ExtraServiceCategoryId.toString() === categoryEdited.ExtraServiceCategoryId.toString()) {
                            $scope.extraServiceCategories[index][idx] = categoryEdited;
                            break;
                        }
                    }
                }
                dialogService.toast("EDIT_CATEGORY_SUCCESSFUL");
            });
        }, function () {

        });
    };
    EditCategoryDialogController.$inject = ['$scope', '$mdDialog', 'categoryEditing'];

    function EditCategoryDialogController($scope, $mdDialog, categoryEditing) {
        $scope.hide = function () {
            $mdDialog.hide();
        };
        $scope.cancel = function () {
            $mdDialog.cancel();
        };
        $scope.saveEdited = function (categoryEdited) {
            $mdDialog.hide(categoryEdited);

        };
        $scope.categoryEditing = categoryEditing;
    }

    function sortObject(obj) {
        var arr = [];
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                arr.push({
                    'key.ExtraServiceItemId': prop,
                    'value': obj[prop]
                });
            }
        }
        arr.sort(function (a, b) {
            return a.value - b.value;
        });
        //arr.sort(function(a, b) { a.value.toLowerCase().localeCompare(b.value.toLowerCase()); }); //use this to sort as strings
        return arr; // returns array
    }

    $scope.showItem = function (category) {
        console.log("HERE HERE");
        if ($scope.itemOn == false) {
            $scope.itemOn = true;
        } else {
            if ($scope.currentItemByCategory.ExtraServiceCategory == category) {
                $scope.itemOn = false;
            }
        }

        $scope.currentItemByCategory.ExtraServiceCategory = category;
        $scope.currentItemByCategory.ExtraServiceItemByCategory = $scope.extraServiceItems[category.ExtraServiceCategoryId] || {};
        //$scope.currentItemByCategory.ExtraServiceItemByCategory = sortObject($scope.currentItemByCategory.ExtraServiceItemByCategory);
        //var i=0;
        /*for (var idx in $scope.currentItemByCategory.ExtraServiceItemByCategory) {
            $scope.currentItemByCategory.ExtraServiceItemByCategory[idx].Priority = i;
            i++;
        }*/
        var arrTemp = [];
        for (var index in $scope.currentItemByCategory.ExtraServiceItemByCategory) {
            arrTemp.push($scope.currentItemByCategory.ExtraServiceItemByCategory[index]);
        }
        arrTemp.sort(function (a, b) {
            return a.Priority - b.Priority;
        });

        $scope.currentItemByCategory.ExtraServiceItemByCategory= arrTemp;
        /*console.log("arrTemp", arrTemp);
        var rv = {};
        for (var i = 0; i < arrTemp.length; i++){
            rv[arrTemp[i].ExtraServiceItemId] = arrTemp[i];
        }
        console.log("rvTemp", rv);
        //$scope.currentItemByCategory.ExtraServiceItemByCategory = null;
        delete $scope.currentItemByCategory.ExtraServiceItemByCategory;
        $scope.currentItemByCategory.ExtraServiceItemByCategory = rv;*/



        $scope.originalItemList = angular.copy($scope.currentItemByCategory.ExtraServiceItemByCategory);
        console.log($scope.currentItemByCategory);
    };


    $scope.changeItemStatus = function (item) {

        var confirm = dialogService.confirm("ENABLE/DISABLE_ITEM_CONFIRM",
            "WOULD_YOU_LIKE_TO_CHANGE_ITEM_STATUS ");
        confirm.then(function () {
            item.IsHidden = (item.IsHidden == true) ? false : true;

            configFactory.changeItemStatus(item.ExtraServiceItemId);
        });

    };


    $scope.backToCategory = function () {
        $scope.itemOn = false;
    };

    $scope.addItem = function () {
        $mdDialog.show({
            controller: AddNewItemDialogController,
            resolve: {
                currentESTypeId: function () {
                    return $scope.currentCategoryByType.ExtraServiceType.ExtraServiceTypeId;
                },
                currentESCategoryId: function () {
                    return $scope.currentItemByCategory.ExtraServiceCategory.ExtraServiceCategoryId;
                }

            },
            templateUrl: 'views/templates/addNewItem.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
        }).then(function (newItem) {
            newItem.Priority = $scope.currentItemByCategory.ExtraServiceItemByCategory.length;
            configFactory.addItem(newItem, function () {
                $scope.currentItemByCategory.ExtraServiceItemByCategory[newItem.Priority] = newItem;
                var extraServiceCategoryId = $scope.currentItemByCategory.ExtraServiceCategory.ExtraServiceCategoryId;
                if($scope.extraServiceItems[extraServiceCategoryId]==undefined){
                    $scope.extraServiceItems[extraServiceCategoryId] = {};
                }
                $scope.extraServiceItems[extraServiceCategoryId][newItem.ExtraServiceItemId] = newItem;
                //configExtraServicesInit();
                //console.log($scope.currentItemByCategory.ExtraServiceItemByCategory[newItem.ExtraServiceItemId]);
            });

        }, function () {

        });

    };
    AddNewItemDialogController.$inject = ['$scope','$rootScope', '$mdDialog', 'currentESTypeId', 'currentESCategoryId'];

    function AddNewItemDialogController($scope, $rootScope, $mdDialog, currentESTypeId, currentESCategoryId) {
			$scope.decimal = $rootScope.decimals;
        $scope.newItem = {
            ExtraServiceItemName: "",
            ExtraServiceItemDescription: "",
            Unit: "",
            Price: "",
            ExtraServiceCategoryId: currentESCategoryId,
            ExtraServiceTypeId: currentESTypeId,
            ExtraServiceItemId: 0,
            HotelId: "",
            IsHidden: false,
            IsChangealbe: false
        };

        $scope.hide = function () {
            $mdDialog.hide();
        };
        $scope.cancel = function () {
            $mdDialog.cancel();
        };
        $scope.saveNewItem = function (newItem) {

            $mdDialog.hide(newItem);
        };
    }

    $scope.editItem = function (item) {

        $mdDialog.show({
            controller: EditItemDialogController,
            resolve: {
                itemEditing: function () {
                    return item;
                }
            },
            templateUrl: 'views/templates/editItem.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
        }).then(function (itemEdited) {

            var editItem = loginFactory.securedPostJSON("api/ExtraService/EditItem", itemEdited);
            $rootScope.dataLoadingPromise = editItem;
            editItem.success(function (data) {
                dialogService.toast("EDIT_ITEM_SUCCESSFULL");

            }).error(function (err) {
                console.log(err);
            });
        }, function () {

        });
    };
    EditItemDialogController.$inject = ['$scope', '$mdDialog', 'itemEditing'];

    function EditItemDialogController($scope, $mdDialog, itemEditing) {
				$scope.decimal = $rootScope.decimals;
        $scope.hide = function () {
            $mdDialog.hide();
        };
        $scope.cancel = function () {
            $mdDialog.cancel();
        };
        $scope.saveEdited = function (itemEdited) {
            $mdDialog.hide(itemEdited);

        };
        $scope.itemEditing = itemEditing;
    }

    $scope.deleteItem = function (item) {
        console.log("ITEM", item);
        console.log($scope.currentItemByCategory.ExtraServiceItemByCategory);
        var confirm = dialogService.confirm("WOULD_YOU_LIKE_TO_DELETE_THIS_ITEM", "BE_CAREFUL_IF_ITEM_IS_BEING_USED_BY_OTHER_PROCESS");
        var index =-1;
        for (var idx in $scope.currentItemByCategory.ExtraServiceItemByCategory) {
            if ($scope.currentItemByCategory.ExtraServiceItemByCategory[idx].ExtraServiceItemId == item.ExtraServiceItemId) {
                index = idx;
                break;
            }
        }
        confirm.then(function () {
            configFactory.removeItem(item, function () {
                $scope.currentItemByCategory.ExtraServiceItemByCategory.splice($scope.currentItemByCategory.ExtraServiceItemByCategory.indexOf(item),1);
                var extraServiceCategoryId = $scope.currentItemByCategory.ExtraServiceCategory.ExtraServiceCategoryId;
                delete $scope.extraServiceItems[extraServiceCategoryId][item.ExtraServiceItemId];
            });

        });
    };

    $scope.planUp = function (item, index) {
        var newESItems = [];
        for (var idx in $scope.currentItemByCategory.ExtraServiceItemByCategory) {
            newESItems.push($scope.currentItemByCategory.ExtraServiceItemByCategory[idx]);
        }

        if (index <= 0 || index >= newESItems.length) {
            return;
        }

        console.log("CURRNT", $scope.currentItemByCategory.ExtraServiceItemByCategory);
        var priorityTemp = $scope.currentItemByCategory.ExtraServiceItemByCategory[index].Priority;
        $scope.currentItemByCategory.ExtraServiceItemByCategory[index].Priority = $scope.currentItemByCategory.ExtraServiceItemByCategory[index-1].Priority;
        $scope.currentItemByCategory.ExtraServiceItemByCategory[index - 1].Priority = priorityTemp;

        var temp = $scope.currentItemByCategory.ExtraServiceItemByCategory[index];
        $scope.currentItemByCategory.ExtraServiceItemByCategory[index] = $scope.currentItemByCategory.ExtraServiceItemByCategory[index-1];
        $scope.currentItemByCategory.ExtraServiceItemByCategory[index-1] = temp;
    };

    $scope.planDown = function (item, index) {

        var newESItems = [];



        for (var idx in $scope.currentItemByCategory.ExtraServiceItemByCategory) {
            newESItems.push($scope.currentItemByCategory.ExtraServiceItemByCategory[idx]);
        }

        if (index < 0 || index >= newESItems.length - 1) {
            return;
        }

        var priorityTemp = $scope.currentItemByCategory.ExtraServiceItemByCategory[index].Priority;
        $scope.currentItemByCategory.ExtraServiceItemByCategory[index].Priority = $scope.currentItemByCategory.ExtraServiceItemByCategory[index+1].Priority;
        $scope.currentItemByCategory.ExtraServiceItemByCategory[index + 1].Priority = priorityTemp;

        var temp = $scope.currentItemByCategory.ExtraServiceItemByCategory[index];
        $scope.currentItemByCategory.ExtraServiceItemByCategory[index] = $scope.currentItemByCategory.ExtraServiceItemByCategory[index+1];
        $scope.currentItemByCategory.ExtraServiceItemByCategory[index+1] = temp;
    };

    $scope.isItemListChanged = false;
    $scope.$watchCollection('currentItemByCategory.ExtraServiceItemByCategory', function (newValues, oldValues) {
        console.log("New Value", newValues);
        console.log("Old Value", oldValues);
        if (newValues && oldValues && !angular.equals(newValues, oldValues)) {
            console.log("CHANGED");
            if (newValues.length !== oldValues.length){
                 $scope.isItemListChanged = false;
            }
            else{
                 $scope.isItemListChanged = true;
            }


            if (angular.equals(newValues, $scope.originalItemList)) {

                $scope.isItemListChanged = false;
            }
        }
    });

    $scope.saveESItemList = function () {
        var listItem = [];
        for (var index in $scope.currentItemByCategory.ExtraServiceItemByCategory) {
            listItem.push($scope.currentItemByCategory.ExtraServiceItemByCategory[index]);
        }
        for (var index in listItem) {
            listItem[index].Priority = parseInt(index);
        }
        var save = loginFactory.securedPostJSON("api/ExtraService/SaveItemList", listItem);
        save.success(function (data) {
            $scope.isItemListChanged = false;
            configExtraServicesInit();
        }).error(function (err) {
            console.log(err);
        })

    };




}]);