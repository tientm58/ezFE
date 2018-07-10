ezCloud.component('editPastCheckOutTime', {
    controller: 'EditPastCheckOutTimeController',
    controllerAs: 'editPastCheckOutTimeCtrl',
    templateUrl:'views/sharedFeatures/editPastCheckOutTime/editPastCheckOutTime.template.html',
    bindings: {
        currentRoom: "<",
        PastCheckOutReason: "<",
        ApplyPastCheckOut: "<"
    }
});