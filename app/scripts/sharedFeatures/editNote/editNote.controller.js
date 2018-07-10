ezCloud.controller('EditNoteController', ['$rootScope', '$mdDialog', '$filter', '$state', 'dialogService', 'loginFactory', 'EditNoteService', 'SharedFeaturesFactory',
function($rootScope, $mdDialog, $filter, $state, dialogService, loginFactory, EditNoteService, SharedFeaturesFactory) {
    var nq = this;
    //Nguyen Ngoc Quan - nq
    function Init() {
        nq.currentRoom  = SharedFeaturesFactory.getFeatureModel();
        nq.newNote = angular.copy(nq.currentRoom.Note);
    }
    Init();
    
    nq.cancel = function () {
        $mdDialog.hide();
    }

    nq.processEditNote = function () {
        var EditNoteModel = {
            ReservationRoomId: nq.currentRoom.ReservationRoomId,
            NewNote: nq.newNote
        };
        EditNoteService.setEditNoteModel(EditNoteModel);
        EditNoteService.processEditNote(function(data){
            $mdDialog.hide();
            var result = data;
            if(result.status == true){
                dialogService.toast("EDIT_NOTE_SUCCESSFUL");
                $state.go($state.current, {}, {
                    reload: true
                });
            }
            else {
                if(result.object.message){ console.log("ERROR", result.object); }
            }
        });
    }

}]);