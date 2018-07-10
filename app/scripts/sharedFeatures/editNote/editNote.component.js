ezCloud.component('editNote', {
    controller: 'EditNoteController',
    controllerAs: 'editNoteCtrl',
    templateUrl:'views/sharedFeatures/editNote/editNote.template.html',
    bindings: {
        currentRoom: "<"
    }
});