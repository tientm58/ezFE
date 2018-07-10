ezCloud.controller('AddExtraServicesController', ['$scope', '$mdBottomSheet', 'AddExtraServices', '$rootScope', 'loginFactory', '$stateParams', 'dialogService', '$state', '$mdDialog', '$filter', 'SharedFeaturesFactory',
    function($scope, $mdBottomSheet, AddExtraServices, $rootScope, loginFactory, $stateParams, dialogService, $state, $mdDialog, $filter, SharedFeaturesFactory) {
        var nq = this;
        //Nguyen Ngoc Quan - nq
        nq.extraServices = {};
        nq.selectedExtraServiceCategory = null;
        nq.itemsInCategory = [];
        nq.roomItemsInRoomExtraService = [];
        nq.extraServiceNoItem = {};
        function Init(){
            nq.model = SharedFeaturesFactory.getFeatureModel();
            nq.currentRoom = nq.model.currentRoom;
            nq.item = nq.model.currentItem;
            nq.warningNoItems = false;
            nq.decimal = $rootScope.decimals;
			var keys = ["RES_NO", "ROOM", "NOTIFICATION_WHEN_POST_EXTRASERVICE", "EXTRA_SERVICE"];
			var languageKeys = {};
			for (var idx in keys) {
				languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
			}
			nq.extraServiceNoItem = {
				Quantity:1
			}
			var extraServiceByName = {
				name: nq.item.name,
				reservationRoomId: nq.currentRoom.reservationRoom.ReservationRoomId
			};
			loginFactory.securedGet("api/Room/ExtraServiceListByName", "name=" + nq.item.name + "&reservationRoomId=" + nq.currentRoom.reservationRoom.ReservationRoomId).success(function (data) {
				console.log("EXTRA SERVICE DATA", data);
				nq.extraServices = data;
				console.log(nq.extraServices);
				if (nq.extraServices.ExtraServiceItems.length > 0) {

				}
				for (var index in nq.extraServices.ExtraServiceCategories) {
					for (var index2 in nq.extraServices.ExtraServiceItems) {
						if (nq.extraServices.ExtraServiceItems[index2].ExtraServiceCategoryId.toString() === nq.extraServices.ExtraServiceCategories[index].ExtraServiceCategoryId.toString()) {
							if (!nq.itemsInCategory[nq.extraServices.ExtraServiceCategories[index].ExtraServiceCategoryId]) {
								nq.itemsInCategory[nq.extraServices.ExtraServiceCategories[index].ExtraServiceCategoryId] = [];
							}
							nq.itemsInCategory[nq.extraServices.ExtraServiceCategories[index].ExtraServiceCategoryId].push(nq.extraServices.ExtraServiceItems[index2]);
						}
					}
				}
				for (var index in nq.itemsInCategory) {
					for (var index2 in nq.itemsInCategory[index]) {
						nq.itemsInCategory[index][index2].quantity = 0;
					}
				}

				nq.extraServices.ExtraServiceItems.sort(function (a, b) {
					return a.Priority - b.Priority;
				});
			});
        }
        Init();
        nq.addExtraService = function(){
            var keys = ["RES_NO", "ROOM", "NOTIFICATION_POST_EXTRASERVICE", "EXTRA_SERVICE"];
			var languageKeys = {};
			for (var idx in keys) {
				languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
			}
			var items = [];
			for (var index in nq.itemsInCategory) {
				for (var index2 in nq.itemsInCategory[index]) {
					if (nq.itemsInCategory[index][index2].quantity > 0) {
						var item = {
							quantity: nq.itemsInCategory[index][index2].quantity,
							item: nq.itemsInCategory[index][index2]
						};
						items.push(item);
					}
				}
			}

			if (items.length == 0) {
                nq.warningNoItems = true;
				return;
			}
			var postItems = {
				ReservationRoomId: nq.currentRoom.reservationRoom.ReservationRoomId,
				description: nq.extraServices.ExtraServiceTypes.ExtraServiceTypeName + ' res:#' + nq.currentRoom.reservationRoom.ReservationRoomId + ' room:#' + nq.currentRoom.RoomId,
				name: nq.extraServices.ExtraServiceTypes.ExtraServiceTypeName,
				items: items,
				languageKeys: languageKeys
            };
            var extraServiceNoItemTmp;
            var itemsTmp;
            if (postItems && postItems.items) {
                itemsTmp = postItems.items;
            } else {
                extraServiceNoItemTmp = postItems;
            }
            $mdDialog.show({
                controller: AddESDialogController,
                templateUrl: 'views/sharedFeatures/addExtraServices/addExtraServicesConfirm.html',
                resolve: {
                    extraServiceNoItem: function () {
                        return extraServiceNoItemTmp;
                    },
                    items: function () {
                        return postItems.items;
                    }
                },
                parent: angular.element(document.body),
                targetEvent: null,
            }).then(function () {
                $mdBottomSheet.hide();
                console.log("POST ITEM", postItems);
                AddExtraServices.setAddExtraServicesModel(postItems);
                AddExtraServices.processAddExtraServices(function(data){
                    $mdDialog.hide();
                    var result = data;
                    if(result.status == true){
                        dialogService.toast("ADD_EXTRA_SERVICE_SUCCESSFUL");
                    }
                    else
                        dialogService.messageBox("ERROR", result.object.message);
                    }
                );
            }, function () {});
            function AddESDialogController($scope, $mdDialog, extraServiceNoItem, items) {
                $scope.decimal = $rootScope.decimals;
                console.log("DECIMAL", $scope.decimal);
                $scope.items = items;
                $scope.extraServiceNoItem = extraServiceNoItem;
                console.log("ES NO ITEM", $scope.extraServiceNoItem);
                console.log("ES ITEM", $scope.items);
                $scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
                $scope.ok = function () {
                    $mdDialog.hide();
                };
                $scope.getTotal = function (items,extraServiceNoItem) {
                    var total = 0;
                    for (var idx in items) {
                        total += items[idx].item.Price * items[idx].quantity;
                    }
                    if(extraServiceNoItem!=null)
                    {
                        total += extraServiceNoItem.Amount * extraServiceNoItem.Quantity ;
                    }
                    return total;
                };
            }
        }

        nq.addExtraServiceNoItem = function () {
			var keys = ["RES_NO", "ROOM", "NOTIFICATION_POST_EXTRASERVICE", "EXTRA_SERVICE"];
			var languageKeys = {};
			for (var idx in keys) {
				languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
			}
			if(nq.extraServiceNoItem.RoomExtraServiceDescription == undefined || nq.extraServiceNoItem.RoomExtraServiceDescription.length == 0 || nq.extraServiceNoItem.RoomExtraServiceDescription.length > 51){
				dialogService.messageBox("MISSING_EXTRA_SERVICE", "PLEASE_FILL_NAME_AND_PRICE_OF_EXTRA_SERVICES");
				return;
			}
			if(nq.extraServiceNoItem.Amount == undefined  ){
				dialogService.messageBox("MISSING_EXTRA_SERVICE", "PLEASE_FILL_NAME_AND_PRICE_OF_EXTRA_SERVICES");
				return ;
			};
			if(nq.extraServiceNoItem.Quantity == null || nq.extraServiceNoItem.Quantity  < 0 ){
				dialogService.messageBox("MISSING_EXTRA_SERVICE_QUANTITY", "PLEASE_FILL_QUANTITY_OF_EXTRA_SERVICES");
				return ;
			};
			var postItems = {
				ReservationRoomId: nq.currentRoom.reservationRoom.ReservationRoomId,
				RoomExtraServiceName: "EXTRA_SERVICES",
				RoomExtraServiceDescription: nq.extraServiceNoItem.RoomExtraServiceDescription,
				Amount: nq.extraServiceNoItem.Amount,
				Quantity:nq.extraServiceNoItem.Quantity,
				languageKeys: languageKeys
			}
			var extraServiceNoItemTmp;
            var itemsTmp;
            if (postItems && postItems.items) {
                itemsTmp = postItems.items;
            } else {
                extraServiceNoItemTmp = postItems;
            }
            $mdDialog.show({
                controller: AddESDialogController,
                templateUrl: 'views/sharedFeatures/addExtraServices/addExtraServicesConfirm.html',
                resolve: {
                    extraServiceNoItem: function () {
                        return extraServiceNoItemTmp;
                    },
                    items: function () {
                        return postItems.items;
                    }
                },
                parent: angular.element(document.body),
                targetEvent: null,
            }).then(function () {
                $mdBottomSheet.hide();
                console.log("POST ITEM", postItems);
                AddExtraServices.setAddExtraServicesModel(postItems);
                AddExtraServices.processAddExtraServices(function(data){
                    $mdDialog.hide();
                    var result = data;
                    if(result.status == true){
                        dialogService.toast("ADD_EXTRA_SERVICE_SUCCESSFUL");
                    }
                    else
                        dialogService.messageBox("ERROR", result.object.message);
                    }
                );
            }, function () {});
            function AddESDialogController($scope, $mdDialog, extraServiceNoItem, items) {
                $scope.decimal = $rootScope.decimals;
                console.log("DECIMAL", $scope.decimal);
                $scope.items = items;
                $scope.extraServiceNoItem = extraServiceNoItem;
                console.log("ES NO ITEM", $scope.extraServiceNoItem);
                console.log("ES ITEM", $scope.items);
                $scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
                $scope.ok = function () {
                    $mdDialog.hide();
                };
                $scope.getTotal = function (items,extraServiceNoItem) {
                    var total = 0;
                    for (var idx in items) {
                        total += items[idx].item.Price * items[idx].quantity;
                    }
                    if(extraServiceNoItem!=null)
                    {
                        total += extraServiceNoItem.Amount * extraServiceNoItem.Quantity ;
                    }
                    return total;
                };
            }
		};

        nq.cancel = function(){
            $mdDialog.hide();
        }
}]);