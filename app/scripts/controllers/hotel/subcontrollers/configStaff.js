ezCloud.controller('configStaffController', ['$scope', '$rootScope', '$state', 'dialogService', '$localStorage', '$http', '$sessionStorage', 'loginFactory', '$mdDialog', 'flowFactory', '$filter', '$log', '$mdSidenav', '$mdMedia', 'configFactory', '$q', '$location', function ($scope, $rootScope, $state, dialogService, $localStorage, $http, $sessionStorage, loginFactory, $mdDialog, flowFactory, $filter, $log, $mdSidenav, $mdMedia, configFactory, $q, $location) {

	$scope.staffData = {};
	$scope.staffRole = [];
	$scope.staffLength;

	function configStaffInit() {
		configFactory.getAllStaffs(function (data) {
			angular.forEach(data, function (arr) {
				if (arr.staff.StaffName == $localStorage.lastLogin.username) {
					console.log();
				};
			});

			$scope.staffData = data;

			$scope.staffLength = _.size(data);
			for (var staffDataIndex in $scope.staffData) {
				var staffDataTemp = $scope.staffData[staffDataIndex];
				if (staffDataTemp.staffRoleId == "3") {
					$scope.staffRole[staffDataTemp.staff.StaffId] = "ROLE_HOTEL_MANAGER";
				} else {
					if (staffDataTemp.staffRoleId == "4") {
						$scope.staffRole[staffDataTemp.staff.StaffId] = "ROLE_HOTEL_STAFF";
					} else{
						$scope.staffRole[staffDataTemp.staff.StaffId] = "ROLE_HOTEL_HOUSEKEEPER";
					}
				}
			}		
		});


	}
	// function Init(){
	// 	var roles = loginFactory.securedGet("api/Config/Staff/getUserRoles");
	// 	//$rootScope.dataLoadingPromise = roles;
	// 	roles.success(function (data) {
	// 		$scope.Roles = data;
	// 	}).error(function (err) {
	// 		console.log(err);
	// 	});

	// }

	configStaffInit();
	// Init();

	$scope.changeStaffStatus = function (staff) {
		var confirm = dialogService.confirm("ACTIVE/DEACTIVE_STAFF_CONFIRM",
			"WOULD_YOU_LIKE_TO_CHANGE_STAFF_STATUS ");
		confirm.then(function () {
			staff.staff.IsActive = (staff.staff.IsActive === true) ? false : true;
			configFactory.changeStaffStatus(staff.staff.StaffId);
		});
	};


	$scope.goToStaff = function (staff, event) {
		//var staffTemp = staff;
		//console.log("STAFF TEMP", staff);
		var useFullScreen = $mdMedia('xs');
		var staffTemp = angular.copy(staff);
		$mdDialog.show({
			controller: EditStaffDialogController,
			resolve: {
				staffEditing: function () {
					return staffTemp;
				}
			},
			templateUrl: 'views/templates/editStaff.tmpl.html',
			fullscreen: useFullScreen,
			parent: angular.element(document.body),
			targetEvent: event,
		}).then(function (staffEdited) {
			var saveStaffPromise = loginFactory.securedPostJSON("api/Config/Staff/SaveStaff", staffEdited);
			$rootScope.dataLoadingPromise = saveStaffPromise;
			saveStaffPromise.success(function (data) {
				if (staffEdited.staffUser.UserName == $localStorage.lastLogin.username) {
					$localStorage.session.Fullname = staffEdited.staff.StaffName;
					$rootScope.user.Fullname = staffEdited.staff.StaffName;
				}
				console.log("STAFF", staff);


				//staff.staff = staffEdited;
				/*for (var index in $scope.staffData) {

					if ($scope.staffData[index].staff.StaffId.toString() === staffEdited.staff.StaffId.toString()) {
						$scope.staffData[index].staff = staffEdited.staff;
						break;
					}
				}*/
				dialogService.toast("EDIT_STAFF_SUCCESSFUL");
				configStaffInit();

			}).error(function (err) {
				angular.copy(initial, $scope.staffEditing);
				var errors = [];
				errors.push(err.Message);
				for (var key in err.ModelState) {
					for (var i = 0; i < err.ModelState[key].length; i++) {
						errors.push(err.ModelState[key][i]);
					}
				}
				dialogService.messageBox("ERRORS", errors.toString().replace(",", "\n"));
			});
			//$scope.staffRole[staffEdited.staff.StaffId] = (staffEdited.staffRoleId == "3") ? "ROLE_HOTEL_MANAGER" : "ROLE_HOTEL_STAFF";
		}, function () { });
	};
	EditStaffDialogController.$inject = ['$scope', '$mdDialog', 'staffEditing'];

	function EditStaffDialogController($scope, $mdDialog, staffEditing) {
		$scope.currentRole = $rootScope.user.Roles;

		var initial = angular.copy(staffEditing);
		$scope.staffEditing = staffEditing;
		$scope.staffEditingRole = "";
		$scope.staffEditingRole = (staffEditing.staffRoleId === "3") ? "ROLE_HOTEL_MANAGER" : "ROLE_HOTEL_STAFF";

		$scope.Roles = [];

		var roles = loginFactory.securedGet("api/Config/Staff/getUserRoles");
		//$rootScope.dataLoadingPromise = roles;
		roles.success(function (data) {
			$scope.Roles = data;
		}).error(function (err) {
			console.log(err);
		});

		$scope.hide = function () {
			$mdDialog.hide();
		};
		$scope.cancel = function () {
			$mdDialog.cancel();
		};
		$scope.saveStaff = function (staffEdited) {

			$mdDialog.hide(staffEdited);
		};





	}

	$scope.createStaff = function () {
		$mdDialog.show({
			controller: CreateStaffDialogController,
			templateUrl: 'views/templates/createStaff.tmpl.html',
			parent: angular.element(document.body),
			targetEvent: event,
		}).then(function (newStaff) {


			configFactory.createStaff(newStaff, function (data) {
				/*$scope.staffRole[data.staff.StaffId] = newStaff.StaffRole;
				$scope.staffData[data.staff.StaffId] = data;
				var fullStaffUserName = data.staffUser.UserName;
				var index = fullStaffUserName.indexOf('@');
				var subString = fullStaffUserName.slice(0, index);
				$scope.staffData[data.staff.StaffId].staffUser.UserName = subString;*/
				configStaffInit();

			});

		}, function () {

		});
	};
	CreateStaffDialogController.$inject = ['$scope', '$mdDialog'];

	function CreateStaffDialogController($scope, $mdDialog) {
		$scope.newStaff = {
			UserName: "",
			Email: "",
			Password: "",
			ConfirmPassword: "",
			StaffName: "",
			StaffMobile: "",
			Description: "",
			StaffRole: "ROLE_HOTEL_STAFF",
			IsActive: true
		};
		$scope.Roles = [];

		var roles = loginFactory.securedGet("api/Config/Staff/getUserRoles");
		//$rootScope.dataLoadingPromise = roles;
		roles.success(function (data) {
			$scope.Roles = data;
		}).error(function (err) {
			console.log(err);
		});

		$scope.hide = function () {
			$mdDialog.hide();
		};
		$scope.cancel = function () {
			$mdDialog.cancel();
		};
		$scope.saveNewStaff = function (newStaff) {

			$mdDialog.hide(newStaff);
		};

	}


}]);