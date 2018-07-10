ezCloud.component('copyReservation', {
  controller: 'CopyReservationController',
  controllerAs: 'copyReservationCtrl',
  templateUrl:'views/sharedFeatures/copyReservation/copyReservation.template.html',
  bindings: {
    currentRoom: "<"
  }
});