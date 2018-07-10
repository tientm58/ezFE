ezCloud.controller('EditPastCheckOutTimeController', ['$scope', '$mdDialog', '$state', '$filter', 'dialogService', 'EditPastCheckOutTimeService', 'SharedFeaturesFactory',
    function ($scope, $mdDialog, $state, $filter, dialogService, EditPastCheckOutTimeService, SharedFeaturesFactory) {
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
            nq.PastCheckOutReason = "";
            if (nq.currentRoom.PastCheckOutReason)
                nq.PastCheckOutReason = nq.currentRoom.PastCheckOutReason;
            if (nq.currentRoom.ApplyPastCheckOut)
                nq.ApplyPastCheckOut = nq.currentRoom.ApplyPastCheckOut;

            nq.str = nq.currentRoom.DepartureDate.format('dd/mm/yyyy HH:MM');
            nq.CurrentArrivalDate = nq.currentRoom.ArrivalDate;
            nq.newDepartureDate = nq.currentRoom.DepartureDate;
            nq.reservationRoomId = nq.currentRoom.ReservationRoomId;
            nq.maxDate = new Date();
            nq.warningMissingReason = false;
            nq.warningInvalidDepartureDate = false;
        }
        Init();
        nq.cancel = function () {
            $mdDialog.cancel();
        };
        // nq.PastCheckOutChange = function () {
        //     if(nq.ApplyPastCheckOut == false){
        //         nq.currentRoom.DepartureDate = new Date();
        //         nq.str = nq.currentRoom.DepartureDate.format('dd/mm/yyyy HH:MM');
        //         nq.newDepartureDate = nq.currentRoom.DepartureDate;
        //         nq.maxDate = new Date();
        //     }
        // };
        nq.processEditDepartureDate = function () {
            if (!nq.PastCheckOutReason) {
                nq.warningMissingReason = true;
                return;
            }
            if (!nq.newDepartureDate || nq.newDepartureDate.getTime() <= nq.CurrentArrivalDate.getTime() || nq.newDepartureDate.getTime() > nq.maxDate.getTime()) {
                nq.warningInvalidDepartureDate = true;
                nq.warningMissingReason = false;
                return;
            }
            var keys = ["ALREADY_APPLY_PAST_CHECKOUT"];
            var languageKeys = {};
            for (var idx in keys) {
                languageKeys[keys[idx]] = $filter("translate")(keys[idx]);
            }
            nq.languageKeys = languageKeys;
            var checkOutInThePastModel = {
                ReservationRoomId: nq.reservationRoomId,
                ApplyCheckOutInThePast: nq.ApplyPastCheckOut,
                NewDepartureDate: nq.newDepartureDate,
                PastCheckOutReason: nq.PastCheckOutReason,
                languageKeys: nq.languageKeys
            }

            EditPastCheckOutTimeService.setEditPastCheckOutTimeModel(checkOutInThePastModel);
            EditPastCheckOutTimeService.processEditPastCheckOutTime(function (data) {
                $mdDialog.hide();
                var result = data;
                if (result.status == true) {
                    dialogService.toast("EDIT_CHECKOUT_TIME_SUCCESSFULL");
                    $state.go($state.current, {}, {
                        reload: true
                    });
                } else {
                    if (result.object.Message == 'EDIT_CHECKOUT_TIME_FAILED') dialogService.messageBox("ERROR", result.object.Message);
                    else
                        SharedFeaturesFactory.processConflictReservation(result.object,nq.currentRoom);
                }
            })
        };

    }
]);