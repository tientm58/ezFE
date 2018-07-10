ezCloud.factory("houseKeepingFactory", ['$http', 'loginFactory', '$rootScope', '$mdDialog', 'dialogService', 'reservationFactory', '$timeout', function ($http, loginFactory, $rootScope, $mdDialog, dialogService, reservationFactory, $timeout) {
    var roomList = [];
    var roomTypes = {};
    var rates = [];
    var houseKeepingFactory = {
        getHouseStatus: function(callback){
            var houseStatus = loginFactory.securedGet("api/HouseKeeping/HouseStatus");
            $rootScope.dataLoadingPromise = houseStatus;
            houseStatus.success(function (data) {
                console.log("data", data);
                if (callback) callback(data);
            }).error(function (err) {
                console.log(err);
            });
        },
        luuLichDonPhong: function (dailyClean,callback) {
            var saveDailyCleanChanges = loginFactory.securedPostJSON("api/HouseKeeping/LuuLichDonPhong", dailyClean);
            $rootScope.dataLoadingPromise = saveDailyCleanChanges;
            saveDailyCleanChanges.success(function (data) {
                if (callback) callback();
                dialogService.toast("SAVE_DAILYCLEAN_SUCCESSFUL");

            }).error(function (err) {
                var errors = [];
                errors.push(err.Message);
                for (var key in err.ModelState) {
                    for (var i = 0; i < err.ModelState[key].length; i++) {
                        errors.push(err.ModelState[key][i]);
                    }
                }

                dialogService.messageBox("ERROS", errors.toString().replace(",", "\n"));
            });
        },
        houseDailyClean_Detail: function (dailyClean,callback) {
            var saveDailyCleanDetail = loginFactory.securedGet("api/HouseKeeping/houseDailyClean_Detail", dailyClean);
            $rootScope.dataLoadingPromise = saveDailyCleanDetail;
            saveDailyCleanChanges.success(function (data) {
                if (callback) callback();
                dialogService.toast("SAVE_DAILYCLEAN_SUCCESSFUL");

            }).error(function (err) {
                var errors = [];
                errors.push(err.Message);
                for (var key in err.ModelState) {
                    for (var i = 0; i < err.ModelState[key].length; i++) {
                        errors.push(err.ModelState[key][i]);
                    }
                }

                dialogService.messageBox("ERROS", errors.toString().replace(",", "\n"));
            });
        },
        luuNhanVienDonPhong: function (dailyClean, callback) {
            var luuNhanVienDonPhong = loginFactory.securedPostJSON("api/HouseKeeping/LuuNhanVienDonPhong", dailyClean);
            $rootScope.dataLoadingPromise = luuNhanVienDonPhong;
            luuNhanVienDonPhong.success(function (data) {
                if (callback) callback();
                dialogService.toast("UPDATE_STAFFSDAILYCLEAN_SUCCESSFUL");

            }).error(function (err) {
                var errors = [];
                errors.push(err.Message);
                for (var key in err.ModelState) {
                    for (var i = 0; i < err.ModelState[key].length; i++) {
                        errors.push(err.ModelState[key][i]);
                    }
                }

                dialogService.messageBox("ERROS", errors.toString().replace(",", "\n"));
            });
        },

    };


    
    return houseKeepingFactory;
}]);