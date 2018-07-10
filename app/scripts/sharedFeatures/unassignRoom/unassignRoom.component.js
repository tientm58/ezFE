ezCloud.component('unassignRoom', {
  controller: 'UnassignRoomController',
  controllerAs: 'urCtrl',
  templateUrl:'views/sharedFeatures/unassignRoom/unassignRoom.template.html',
  bindings: {
    selectedRR: "<"
  }
});