ezCloud.controller('UndoCheckInController', ['$scope', '$mdDialog', '$rootScope', '$filter', '$state', 'dialogService', 'UndoCheckInService', 'SharedFeaturesFactory', 'ConflictReservationService','SharedFeaturesFactory',
    function ($scope, $mdDialog, $rootScope, $filter, $state, dialogService, UndoCheckInService, SharedFeaturesFactory, ConflictReservationService, SharedFeaturesFactory) {
        var nq = this;
        //Nguyen Ngoc Quan - nq
        function Init() {
            nq.currentRoom = SharedFeaturesFactory.getFeatureModel();
            nq.reservationRoomId = nq.currentRoom.ReservationRoomId;
            if (nq.reservationRoomId == null || nq.reservationRoomId == undefined) {
                nq.reservationRoomId = nq.currentRoom.reservationRoom.ReservationRoomId;
            }
            nq.reason = null;
            nq.action = "PRE_CHECKIN";
            nq.IsDashboard = nq.currentRoom.IsDashboard || 0;
            nq.isDisabled = false;
        }
        Init();
        nq.cancel = function () {
            $mdDialog.cancel();
        };
        nq.processUndoCheckIn = function () {
            nq.isDisabled = true;
            var keys = ["THIS_ROOM_EXTRA_SERVICE_WAS_DELETED_AUTOMATICALLY_BY_THE_PRE_CHECKIN_PROCESS", "THIS_ROOM_EXTRA_SERVICE_ITEM_WAS_DELETED_AUTOMATICALLY_BY_THE_PRE_CHECKIN_PROCESS", "THIS_PAYMENT_WAS_DELETED_AUTOMATICALLY_BY_THE_PRE_CHECKIN_PROCESS", "NOTIFICATION_PRE_CHẸCKIN"];
            var languageKeys = {};
            for (var idx in keys) {
                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
            }
            var model = {
                RRID: nq.reservationRoomId,
                Reason: nq.reason,
                ActionCode: "PRE_CHECKIN",
                languageKeys: languageKeys
            }
            UndoCheckInService.setUndoCheckInModel(model);
            UndoCheckInService.processUndoCheckIn(function (data) {
                $mdDialog.hide();
                var result = data;
                if (result.status == true) {
                    dialogService.toast("PRE_CHECKIN_SUCCESSFUL");
                    $rootScope.$emit("HomeInit", {});
                    $state.go($state.current, {}, {
                        reload: true
                    });
                } else {
                    //ConflictReservationService.processConflictReservation(result.object);
                    SharedFeaturesFactory.processConflictReservation(nq.currentRoom, result.object, "PRE_CHECKIN");
                }
            });
        };
        nq.processUndoCheckInDB = function () {
            nq.isDisabled = true;
            var keys = ["THIS_ROOM_EXTRA_SERVICE_WAS_DELETED_AUTOMATICALLY_BY_THE_PRE_CHECKIN_PROCESS", "THIS_ROOM_EXTRA_SERVICE_ITEM_WAS_DELETED_AUTOMATICALLY_BY_THE_PRE_CHECKIN_PROCESS", "THIS_PAYMENT_WAS_DELETED_AUTOMATICALLY_BY_THE_PRE_CHECKIN_PROCESS", "NOTIFICATION_PRE_CHẸCKIN"];
            var languageKeys = {};
            for (var idx in keys) {
                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
            }
            var model = {
                RRID: nq.reservationRoomId,
                Reason: nq.reason,
                ActionCode: "PRE_CHECKIN",
                languageKeys: languageKeys
            }
            UndoCheckInService.setUndoCheckInModel(model);
            UndoCheckInService.processUndoCheckInDB(function (data) {
                $mdDialog.hide();
                var result = data;
                if (result.status == true) {
                    dialogService.toast("PRE_CHECKIN_SUCCESSFUL");
                    $rootScope.$emit("HomeInit", {});
                    // $state.go($state.current, {}, {
                    //     reload: true
                    // });
                } else {
                    //ConflictReservationService.processConflictReservation(result.object);
                    SharedFeaturesFactory.processConflictReservation(nq.currentRoom, result.object, "PRE_CHECKIN");
                }
            });
        };
    }
]);