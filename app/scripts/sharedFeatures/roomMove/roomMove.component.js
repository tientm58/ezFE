ezCloud.component('roomMove', {
  controller: 'RoomMoveController',
  //controllerAs: 'roomMoveCtrl',
  templateUrl:'views/sharedFeatures/roomMove/roomMove.template.html',
  bindings: {
    currentRoom: "<",
    newRoomId: "<"
  }
});

