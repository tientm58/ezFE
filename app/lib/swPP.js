/*
 Copyright 2016 Google Inc. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
     http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

// Names of the two caches used in this version of the service worker.
// Change to v2, etc. when you update any of the local resources, which will
// in turn trigger the install event again.
const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';
const VERSION = "1.82";
// A list of local resources we always want to be cached.
const PRECACHE_URLS = [  
];

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', function(event) {
    event.waitUntil(self.skipWaiting()); // Activate worker immediately
});

self.addEventListener('activate', function(event) {
    event.waitUntil(self.clients.claim()); // Become available to all pages
});
// The activate handler takes care of cleaning up old caches.
// self.addEventListener('activate', event => {
//   const currentCaches = [PRECACHE, RUNTIME];
//   event.waitUntil(
//     caches.keys().then(cacheNames => {
//       return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
//     }).then(cachesToDelete => {
//       return Promise.all(cachesToDelete.map(cacheToDelete => {
//         return caches.delete(cacheToDelete);
//       }));
//     }).then(() => self.clients.claim())
//   );
// });
var testMessageCount = 0;
self.addEventListener('message', function(event){
    //console.log("SW Received Message: " + event.data);
    if (event.data) {
        switch (event.data.command) {
            case "version":
                if (event.ports.length>0)
                {
                    event.ports[0].postMessage({command:"version", data:VERSION});
                } else
                self.clients.matchAll().then(all => all.forEach(client => {                                        
                        client.postMessage({command:"version", data:VERSION});
                }));
            break;
            case "test":
                testMessageCount++;
                console.log("Received test message");
                
                event.ports[0].postMessage("SW Says 'Hello back!'" + testMessageCount);
            break;
            case "test2":
                testDownload().then(function(data){
                    event.ports[0].postMessage(data);
                });
            break;
            default:
            break;
        }
    }
});

// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
// self.addEventListener('fetch', event => {
//   // Skip cross-origin requests, like those for Google Analytics.
//   if (event.request.url.startsWith(self.location.origin)) {
//     event.respondWith(
//       caches.match(event.request).then(cachedResponse => {
//         if (cachedResponse) {
//           return cachedResponse;
//         }

//         return caches.open(RUNTIME).then(cache => {
//           return fetch(event.request).then(response => {
//             // Put a copy of the response in the runtime cache.
//             return cache.put(event.request, response.clone()).then(() => {
//               return response;
//             });
//           });
//         });
//       })
//     );
//   }
// });

function testDownload() {
    return new Promise(function(resolve, reject){
    fetch('./api/some.json')
    .then(
      function(response) {
        if (response.status !== 200) {
          reject(response);
          return;
        }
  
        // Examine the text in the response
        response.json().then(function(data) {
          resolve(data);
        });
      }
    )
    .catch(function(err) {
      //console.log('Fetch Error :-S', err);
      reject(err);
    });
 });
}