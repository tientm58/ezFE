ezCloud.controller('EditCheckInTimeController', ['$scope', '$mdDialog', '$filter', '$state', 'dialogService', 'EditCheckInTimeService', 'SharedFeaturesFactory',
    function ($scope, $mdDialog, $filter, $state, dialogService, EditCheckInTimeService, SharedFeaturesFactory) {
        var nq = this;
        //Nguyen Ngoc Quan - nq
        function Init() {
            nq.currentRoom = SharedFeaturesFactory.getFeatureModel();
            nq.DateTimePickerOption = {
                format: 'dd/MM/yyyy HH:mm'
            };
            nq.DatePickerOption = {
                format: 'dd/MM/yyyy'
            };

            nq.arrivalDate = angular.copy(nq.currentRoom.ArrivalDate);
            nq.departureDate = angular.copy(nq.currentRoom.DepartureDate);
            nq.today = new Date();
            nq.isMaxDeparture = nq.departureDate.getTime() > nq.today.getTime() ? false : true;
            nq.newArrivalDate = nq.arrivalDate;
            nq.str = nq.arrivalDate.format('dd/mm/yyyy HH:MM');
            nq.warningInvaliArrivalDate = false;
        }
        Init();
        nq.cancel = function () {
            $mdDialog.cancel();
        };
        nq.processEditArrivalDate = function () {
            if (!nq.newArrivalDate || nq.newArrivalDate.getTime() > nq.today.getTime()) {
                nq.warningInvaliArrivalDate = true;
                return;
            }
            var keys = ["AMEND_STAY_LESS_ARRIVAL"];
            var languageKeys = {};
            for (var idx in keys) {
                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
            }
            var editCheckInTimeModelTmp = {
                ReservationRoomId: nq.currentRoom.ReservationRoomId,
                NewArrivalDate: nq.newArrivalDate,
                languageKeys: languageKeys
            }

            EditCheckInTimeService.setEditCheckInTimeModel(editCheckInTimeModelTmp);
            EditCheckInTimeService.processEditArrivalDate(function (data) {
                $mdDialog.hide();
                var result = data;
                if (result.status == true) {
                    dialogService.toast("EDIT_CHECKIN_TIME_SUCCESSFUL");
                    $state.go($state.current, {}, {
                        reload: true
                    });
                } else {
                    if (result.object.Message) {
                        dialogService.messageBox("ERROR", result.object.Message);
                    }
                    // else conflictReservationProcess(result.object);
                    else {
                        SharedFeaturesFactory.processConflictReservation(result.object,nq.currentRoom);
                    }
                }
            });
        };

    }
]);