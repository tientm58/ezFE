/*
*
*  Push Notifications codelab
*  Copyright 2015 Google Inc. All rights reserved.
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      https://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License
*
*/

'use strict';
var reg;
var sub;
var registration_token;
var registration_type = "android";
var isSubscribed = false;
//var subscribeButton = document.querySelector('button');

if ('serviceWorker' in navigator) {
  console.log('Service Worker is supported');
  navigator.serviceWorker.register('/lib/sw.js').then(function(serviceWorkerRegistration) {
    reg = serviceWorkerRegistration;    
    console.log('Service Worker is ready :^)', reg);
    subscribe();
  }).catch(function(error) {
    console.log('Service Worker Error :^(', error);
  });
}

/*subscribeButton.addEventListener('click', function() {
  if (isSubscribed) {
    unsubscribe();
  } else {
    subscribe();
  }
});*/

function subscribe(callback) {
  reg.pushManager.subscribe({userVisibleOnly: true}).
  then(function(pushSubscription) {
    sub = pushSubscription;
    if (sub.endpoint) {
        var idx = sub.endpoint.lastIndexOf("/");
        registration_token = sub.endpoint.substr(idx + 1);
        console.log('Subscribed! Endpoint:', registration_token);    
        isSubscribed = true;
        if (callback) callback();
    }
  });
}

function unsubscribe() {
  sub.unsubscribe().then(function(event) {    
    console.log('Unsubscribed!', event);
    isSubscribed = false;
  }).catch(function(error) {
    console.log('Error unsubscribing', error);
    
  });
}
