/*var version = "1.82";
if ('serviceWorker' in navigator) {    
    navigator.serviceWorker.register('sw.js?version='+version).then(function(registration) {                
        navigator.serviceWorker.addEventListener('message', event => {
            // use `event.data`                        
        });
      return navigator.serviceWorker.ready;
    }).then(function(reg) {
      
        // TODO
    }).catch(function(error) {
      
    });
  }
  function send_message_to_sw(cmd,msg){
    return new Promise(function(resolve, reject){
        // Create a Message Channel
        var msg_chan = new MessageChannel();

        // Handler for recieving message reply from service worker
        msg_chan.port1.onmessage = function(event){
            if(event.data.error){
                reject(event.data.error);
            }else{
                resolve(event.data);
            }
        };

        // Send message to service worker along with port for reply
        navigator.serviceWorker.controller.postMessage({"command":cmd,"data":msg},[msg_chan.port2]);
    });
}*/


var scannerOn = false;
function ScriptLoader() {
}

ScriptLoader.prototype = {

    timer: function (times, // number of times to try
        delay, // delay per try
        delayMore, // extra delay per try (additional to delay)
        test, // called each try, timer stops if this returns true
        failure, // called on failure
        result // used internally, shouldn't be passed
    ) {
        var me = this;
        if (times == -1 || times > 0) {
            setTimeout(function () {
                result = (test()) ? 1 : 0;
                me.timer((result) ? 0 : (times > 0) ? --times : times, delay + ((delayMore) ? delayMore : 0), delayMore, test, failure, result);
            }, (result || delay < 0) ? 0.1 : delay);
        } else if (typeof failure == 'function') {
            setTimeout(failure, 1);
        }
    },

    addEvent: function (el, eventName, eventFunc) {
        if (typeof el != 'object') {
            return false;
        }

        if (el.addEventListener) {
            el.addEventListener(eventName, eventFunc, false);
            return true;
        }

        if (el.attachEvent) {
            el.attachEvent("on" + eventName, eventFunc);
            return true;
        }

        return false;
    },

    // add script to dom
    require: function (url, args) {
        var me = this;
        args = args || {};

        var scriptTag = document.createElement('script');
        var headTag = document.getElementsByTagName('head')[0];
        if (!headTag) {
            return false;
        }

        setTimeout(function () {
            var f = (typeof args.success == 'function') ? args.success : function () {
            };
            args.failure = (typeof args.failure == 'function') ? args.failure : function () {
            };
            var fail = function () {
                if (!scriptTag.__es) {
                    scriptTag.__es = true;
                    scriptTag.id = 'failed';
                    args.failure(scriptTag);
                }
            };
            scriptTag.onload = function () {
                scriptTag.id = 'loaded';
                f(scriptTag);
            };
            scriptTag.type = 'text/javascript';
            scriptTag.async = (typeof args.async == 'boolean') ? args.async : false;
            scriptTag.charset = 'utf-8';
            me.__es = false;
            me.addEvent(scriptTag, 'error', fail); // when supported
            // when error event is not supported fall back to timer
            me.timer(15, 1000, 0, function () {
                return (scriptTag.id == 'loaded');
            }, function () {
                if (scriptTag.id != 'loaded') {
                    fail();
                }
            });
            scriptTag.src = url;
            setTimeout(function () {
                try {
                    headTag.appendChild(scriptTag);
                } catch (e) {
                    fail();
                }
            }, 1);
        }, (typeof args.delay == 'number') ? args.delay : 1);
        return true;
    }
};

var passports;
document.addEventListener("DOMContentLoaded", function (event) {
    //do work        
    var scannerUI = document.createElement("scanner-ui");
    scannerUI.id = "su";
    document.body.appendChild(scannerUI);
    /*setTimeout(function(){su.open(function(data) {
        console.log("My passport",data);
    });},1000);*/
});
var process;
function removeItem(item) {
    process.server.removeItem(item.Id);
}
$(function () {
    function ScannerLoader() {
        var loader = new ScriptLoader();
        loader.require('http://localhost:50001/signalr/hubs', {
            async: true, success: function () {


                $.connection.hub.url = "http://localhost:50001/signalr";
                process = $.connection.myHub;
                process.client.addMessage = function (name, message) {
                    console.log(name, message);
                };
                process.client.sendPassports = function (p) {
                    passports = p.reverse();
                    for (var i = 0; i < passports.length; i++) {
                        passports[i].CreatedDate = new Date(passports[i].CreatedDate);
                        if (passports[i].DateOfBirth) {
                            passports[i].DateOfBirth = new Date(passports[i].DateOfBirth);
                            passports[i].DateOfBirth2 = moment(passports[i].DateOfBirth).format("DD/MM/YYYY");
                        }
                        if (passports[i].ValidUntil) {
                            passports[i].ValidUntil = new Date(passports[i].ValidUntil);
                            passports[i].ValidUntil2 = moment(passports[i].ValidUntil).format("DD/MM/YYYY");
                        }
                        // getDataUri(passports[i].ImageLocation,i,function(img, idx) {
                        //     passports[idx].ImageLocation = img;
                        // });

                    }
                    try {
                        su.set("data", passports);
                        if (!su.selectedItemValue && passports.length > 0) {
                            su.bindInputValue(passports[0]);
                        }
                    } catch (ex) {

                    }
                    console.log(p);
                };

                $.connection.hub.reconnecting(function () {
                    scannerOn = false;
                });
                $.connection.hub.reconnected(function () {
                    process.server.getAllPassports();
                    scannerOn = true;
                });
                $.connection.hub.disconnected(function () {
                    scannerOn = false;
                    console.log("Retrying to connect on disconnected");
                    connectionStart();
                });
                function connectionStart() {
                    $.connection.hub.start().done(function () {
                        //chat.server.send("test", "testmessage");
                        process.server.getAllPassports();
                        scannerOn = true;
                    });
                }
                connectionStart();
            }, failure: function () {
                console.warn("Scanner service is off.");
                setTimeout(ScannerLoader, 5000);
            }
        });

    }

    function Run() {
        if (!IsActivePassPortModule){
            setTimeout(Run, 5000);
        }
        else{
            ScannerLoader();
        }                    
    }
    Run();
});
function getDataUri(url, i, callback) {
    var image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = function () {
        var canvas = document.createElement('canvas');
        canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
        canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size

        canvas.getContext('2d').drawImage(this, 0, 0);

        // Get raw image data
        //callback(canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, ''));

        // ... or get as Data URI
        callback(canvas.toDataURL('image/png'), i);
    };

    image.src = url;
}