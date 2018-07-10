ezCloud.component('editCheckInTime', {
    controller: 'EditCheckInTimeController',
    controllerAs: 'editCheckInTimeCtrl',
    templateUrl:'views/sharedFeatures/editCheckInTime/editCheckInTime.template.html',
    bindings: {
        currentRoom: "<"
    }
});