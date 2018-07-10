ezCloud.component('conflictReservation', {
    controller: 'ConflictReservationController',
    controllerAs: 'conflictReservationCtrl',
    templateUrl:'views/sharedFeatures/conflictReservation/conflictReservation.template.html',
    bindings: {
        currentRoom: "<",
        currentModel: "<"
    }
});