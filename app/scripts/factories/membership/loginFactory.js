var currentUser;
ezCloud.factory("loginFactory", ['$http', '$state', 'dialogService', '$localStorage', '$rootScope', '$location', '$mdSidenav', function ($http, $state, dialogService, $localStorage, $rootScope, $location, $mdSidenav) {
    var url = apiUrl;

    var refreshThreshold = 60 * 60 * 24 * 59; //refresh token each 1 day
    var refreshing = false;
    //var session = {};
    var login = {
        getToken: function() {
            var token = !$localStorage.session ? "" : $localStorage.session.access_token;
            return token;
        },
        getCurrentUser: function () {
            return currentUser;
        },
        getApiUrl: function () {
            return url;
        },
        processLoginData: function (data) {
            if (data && data.access_token) {
                //session = data;
                $localStorage.session = data;

                $rootScope.loggedIn = true;
                if ($localStorage.session.Fullname) {
                    smartsupp("name", $localStorage.session.Fullname);
                }
                if ($localStorage.session.Email) {
                    smartsupp("email", $localStorage.session.Email);
                }
                return true;
            }
            return false;
        },
        /* login: function(username, hotelId, password) {
             var login = $http({url:url + "Token",method:"POST", headers: {'Content-Type':'application/x-www-form-urlencoded'},data:
                 'grant_type=password&username=' + username + '@' + hotelId + '&password=' + password
             });
             return login;
         },*/

        loginHotelOwner: function (username, password, hotelId) {
            var data = {
                    Username: username,
                    Password: password,
                    HotelId: hotelId
                };
            if (registration_token) {
                data.NotificationToken = registration_token;
                data.NotificationType = registration_type;
            }
            var login = $http({
                url: url + "api/Account/Login",
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify(data)
            });
            return login;
        },

        loginHotelStaff: function (username, hotelId, password) {
            var data = {
                    Username: username + "@" + hotelId,
                    Password: password,
                    HotelId: hotelId
                };
            if (registration_token) {
                data.NotificationToken = registration_token;
                data.NotificationType = registration_type;
            }
            var login = $http({
                url: url + "api/Account/Login",
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify(data)
            });
            return login;
        },
        refreshToken: function (callback, callbackError) {
            if (refreshing) return;
            var session = $localStorage.session;
            var expDate = (new Date(session[".expires"])).getTime() / 1000;
            var now = (new Date()).getTime() / 1000;
            if (expDate - now < refreshThreshold) {
                console.log("Expire", expDate, now);
                var oldToken = session.access_token;
                refreshing = true;
                var l = $http({
                    url: url + "api/Account/Refresh",
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + session.access_token
                    },
                    data: JSON.stringify({
                            refresh_token: session.refresh_token
                        })
                        //data: 'grant_type=refresh_token&client_id=ezCloud&client_secret=secret&refresh_token=' + session.refresh_token
                });
                //console.log("refreshToken");
                l.success(function (data) {
                    login.processLoginData(data);
                    refreshing = false;

                    if (callback) callback();

                }).error(function () {
                    refreshing = false;
                    if (callbackError) callbackError();
                });
            }
        },
        getSession: function () {
            return $localStorage.session;
        },
        signOut: function (callback) {

            var token = !$localStorage.session ? "" : $localStorage.session.access_token;
            var signout = $http({
                url: url + "api/Account/Logout",
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Bearer ' + token
                }
            });
            signout.success(function () {
                delete $localStorage.session;
                $rootScope.loggedIn = false;
                callback();
            });
            return;
        },
        securedPost: function (api, data) {
            var token = !$localStorage.session ? "" : $localStorage.session.access_token;
            if (token == "") return;
            var post = $http({
                url: url + api,
                method: "POST",
                headers: {
                    'Url': $location.url(),
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Bearer ' + token
                },
                data: data
            });
            /*if ($localStorage.session)
                login.refreshToken(null, null);*/
            post.error(
                function (data, status) {
                    console.log(data, status);
                    if (status == 401 && !notimeout) {
                        //try to refresh token
                        login.sessionTimeout();

                    } else if (status == 403) {
                        dialogService.messageBox("NOT_ENOUGH_PERMISSION");
                    }
                });
            return post;
        },
        securedPostJSON: function (api, data) {
            var token = !$localStorage.session ? "" : $localStorage.session.access_token;
            if (token == "") return;
            var post = $http({
                url: url + api,
                method: "POST",
                headers: {
                    'Url': $location.url(),
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                data: JSON.stringify(data)
            });
            console.log("Post");
            /*if ($localStorage.session)
                login.refreshToken(null, null);*/
            post.error(
                function (data, status) {
                    //console.log(data,status);
                    if (status == 401 && !notimeout) {
                        login.sessionTimeout();
                    } else if (status == 403) {
                        dialogService.messageBox("NOT_ENOUGH_PERMISSION");
                    }
                });
            return post;
        },

        postJSON: function (api, data) {
            var post = $http({
                url: url + api,
                method: "POST",
                headers: {
                    'Url': $location.url(),
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify(data)
            });

            return post;
        },
        securedGet: function (api, data, notimeout) {
            var token = !$localStorage.session ? "" : $localStorage.session.access_token;
            if (!$localStorage.session && !notimeout) {
                //this.sessionTimeout();
                return;
            }
//            console.log("Get");
            //console.log($localStorage.session);
            var get = $http({
                url: url + api + "?" + data,
                method: "GET",
                headers: {
                    'Url': $location.url(),
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            });
            /*if ($localStorage.session)
                login.refreshToken(null, null);*/
            get.error(
                function (data, status) {
                    console.log(data, status);
                    if (status == 401 && !notimeout) {
                        login.sessionTimeout();

                    } else if (status == 403) {
                        dialogService.messageBox("NOT_ENOUGH_PERMISSION");
                    }
                }
            );
            return get;
        },
        normalGet: function (api) {
            var get = $http({
                url: url + api,
                method: "GET",
                headers: {
                    'Url': $location.url(),
                    'Content-Type': 'application/json'
                }
            });
            return get;
        },
        sessionTimeout: function () {

            //console.log(d);
            //d.then(function() {

            $rootScope.loggedIn = false;
            $mdSidenav('left').close();
            $state.transitionTo("loginUrl", {
                url: $location.url()
            });
            var d = dialogService.messageBox("WARNING", "SESSION_TIMEOUT");
            delete $localStorage.session;
            //});
        },

        isAuthenticated: function (callback, errorCallback) {
            
            if ($localStorage.session) {
                
                var expDate = new Date($localStorage.session[".expires"]).getTime();
                
                if (expDate > (new Date()).getTime()) {
                    currentUser = $localStorage.session;
                    $rootScope.user = currentUser;
                    if (callback) callback();
                    return;
                }

            }
            console.log("error");
            if (errorCallback) errorCallback();
        },

        removeCache: function(data){
            var get = $http({
                url: url + "api/Account/removeCache" + "?HotelId=" + data,
                method: "GET",
                headers: {
                    'Url': $location.url(),
                    'Content-Type': 'application/json'
                }
            });
            return get;
        }

    };
    return login;
}]);