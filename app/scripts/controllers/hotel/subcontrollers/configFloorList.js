ezCloud.controller('configFloorListController', ['$scope', '$rootScope', '$state', 'dialogService', '$localStorage', '$http', '$sessionStorage', 'loginFactory', '$mdDialog', 'flowFactory', '$filter', '$log', '$mdSidenav', '$mdMedia', 'configFactory', '$q', '$location', function ($scope, $rootScope, $state, dialogService, $localStorage, $http, $sessionStorage, loginFactory, $mdDialog, flowFactory, $filter, $log, $mdSidenav, $mdMedia, configFactory, $q, $location) {
    $scope.floors = [];
    $scope.isFloorChanged = false;
    $scope.menu = [
        {
            name:'EDIT',
            icon:'ic_edit_24px.svg'
        },{
            name:'DELETE_FLOOR',
            icon:'ic_delete_24px.svg'
        }
    ];
    function configFloorListInit() {
        configFactory.getAllFloor(function (data) {
            data.sort(function(a, b){return a.OrderNumber - b.OrderNumber});
            $scope.floors = data;
            $scope.originalFloors = angular.copy(data);
            console.log("floor data",$scope.floors.length);
		});
	};
	configFloorListInit();
    $scope.$watch('floors', function (newValues, oldValues) {
        if (_.size(newValues) !== 0 && _.size(oldValues) !== 0 && !angular.equals(newValues, oldValues)) {
            $scope.isFloorChanged = true;
        }
        if (angular.equals(newValues, $scope.originalFloors)) {
            $scope.isFloorChanged = false;
        }
    },true);

    $scope.changeFloorStatus = function (floor) {
        var messageError = "";
		if (floor.IsDeleted === false) {
            var GetAllRoomByFloor = loginFactory.securedGet("api/Config/GetAllRoomByFloor", "FloorId=" + floor.FloorId);
            GetAllRoomByFloor.success(function(data){
                if (data.length > 0) {
					dialogService.messageBox("ERROR", "CAN_NOT_INACTIVE_THIS_FLOOR" + "." + "PLEASE_PROCESS_ALL_ROOMS_BELONG_TO_THIS_FLOOR");
				}else{
                    var confirm = dialogService.confirm("CONFIRM","WOULD_YOU_LIKE_TO_CHANGE_ROOM_STATUS_TO_INACTIVE");
                    confirm.then(function () {
                        var tempDelete = angular.copy(floor.IsDeleted);
                        configFactory.changeFloorStatus(floor.FloorId,function(data){
                            dialogService.toast("CHANGE_STATUS_FLOOR_SUCCESS");
                            configFloorListInit();
                            // floor.IsDeleted = (tempDelete === true) ? false : true;
                        });
                    });
                };
            }).error(function (err) {
				console.log(err);
			});
		}else{
            var confirm = dialogService.confirm("CONFIRM","WOULD_YOU_LIKE_TO_CHANGE_ROOM_STATUS ");
            confirm.then(function () {
                var tempDelete = angular.copy(floor.IsDeleted);
                configFactory.changeFloorStatus(floor.FloorId,function(data){
                    dialogService.toast("CHANGE_STATUS_FLOOR_SUCCESS");
                    // floor.IsDeleted = (tempDelete === true) ? false : true;
                    configFloorListInit();
                });
            });
        }
        
	};
    $scope.createFloor = function () {
		$mdDialog.show({
			controller: CreateFloorDialogController,
			templateUrl: 'views/templates/createFloor.tmpl.html',
			parent: angular.element(document.body),
			targetEvent: event,
		}).then(function (newFloor) {
            if(newFloor){
                configFactory.createFloor(newFloor, function () {
                    dialogService.toast("CREATE_FLOOR_SUCCESS");
                    configFloorListInit();
                });
            }
		}, function () {});

        CreateFloorDialogController.$inject = ['$scope', '$mdDialog','loginFactory','$rootScope'];
        function CreateFloorDialogController($scope, $mdDialog, loginFactory, $rootScope) {
            function Init() {
                $scope.newFloor = {
                    FloorName: "",
                    FloorDescription: "",
                    OrderNumber: 0,
                };
            };
            Init();

            $scope.cancel = function () {
                $mdDialog.cancel();
            };
            $scope.saveNewFloor = function (newFloor) {
                $mdDialog.hide(newFloor);
            };
        }
	};
	$scope.editFloor = function(floor,event){
        var tempFloor = angular.copy(floor);
        $mdDialog.show({
			controller: EditFloorDialogController,
			templateUrl: 'views/templates/editFloor.tmpl.html',
			parent: angular.element(document.body),
            resolve: {
				floorEditing: function () {
					return tempFloor;
				}
			},
			targetEvent: event,
		}).then(function (floorEditing) {
            if(floorEditing){
                configFactory.editFloor(floorEditing, function () {
                    dialogService.toast("EDIT_FLOOR_SUCCESS");
                    configFloorListInit();
                });
            }
		}, function () {});
        //
        EditFloorDialogController.$inject = ['$scope', '$mdDialog','loginFactory','floorEditing'];
        function EditFloorDialogController($scope, $mdDialog,loginFactory, floorEditing ) {
            function Init() {
                $scope.floorEditing = floorEditing;
            };
            Init();
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
            $scope.saveEdited = function (floorEditing) {
                $mdDialog.hide(floorEditing);
            };
        }
    };
    $scope.changeOrderNumber = function(){
        if($scope.floors && $scope.floors.length == 0){
            return;
        };
        var orderNumber = 0;
        for(var idx in $scope.floors){
            $scope.floors[idx].OrderNumber = orderNumber;
            orderNumber +=1;
        };
        console.log('loinq',$scope.floors);
        configFactory.changeFloorsOrderNumber($scope.floors, function () {
            $scope.isFloorChanged = false;
            dialogService.toast("CHANGE_FLOORS_ORDER_NUMBER_SUCCESS");
            configFloorListInit();
        });
    };
    $scope.menuItemClick = function(item, result,event){
		if(item.name == "EDIT"){
			$scope.editFloor(result, event);
		}else if(item.name == "DELETE_FLOOR"){
			deleteFloor(result.FloorId);
		}
	};
	function deleteFloor(floorId){
		dialogService.confirm("DELETE_FLOOR_CONFIRM").then(function() {
			configFactory.deleteFloor(floorId,function(data){
				dialogService.toast("DELETE_FLOOR_SUCCESS");
				configFloorListInit();
			});
		});
	};

}]);