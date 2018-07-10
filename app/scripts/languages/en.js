'use strict';
var enLanguageObject = 
ezCloud.config(['$translateProvider',function ($translateProvider) {
 $translateProvider
 .translations('en', {
//Login page
     LOGIN:'Login',
     USERNAME:'Username',
     PASSWORD:'Password',
     HOTEL_ID:'Hotel ID',
     SIGNUP:'Sign Up',
     REMEMBER_PASSWORD:'Remember password',
     USERNAME_TOO_SHORT:'is too short!',
     USERNAME_TOO_LONG:'is too long!',
     SIGNOUT:'Sign Out',
     MENU:'Menu',
     HOME:'Home',
     VIEW_DETAIL:'View Details',
     ADD_MINIBAR_SERVICE:'Minibar',
     PAYMENT_METHOD:'Payment Method',   
     SEARCH:'Search',
     CUSTOMER_NAME:'Customer Name',
     CUSTOMER_IDENTITY_NUMBER:'Identity Number',
     GENDER:'Gender',
     ROOM:'Room',
     ROOMS:'Rooms',
     ROOM_TYPE:'Type',
     MALE:'Male',
     FEMALE:'Female',
     GENDER_OTHER:'Other',
     CUSTOMER:'Customer',
     PAYMENT:'Payment',
     PAYMENT_CASH:'Cash',
     PAYMENT_CREDIT:'Credit',
     PAYMENT_TRANSFER:'Bank Transfer',
     COMPANY:'Company',
     CUSTOMER_SOURCE:'Customer Source',
     ARRIVAL_DATE:'Arrival Date',
     ARRIVAL_TIME:'Arrival Time',
     DEPARTURE_DATE:'Departure Date',
     DEPARTURE_TIME:'Departure Time',
     ADUlTS:'Adults',
     CHILD:'Child',
     RESERVATION_TYPE:'Reservation Type',
     NOTE:'Note',
     OK:'Ok',
     CANCEL:'Cancel',
     SIGNOUT_CONFIRM:'Do you really want to sign out?',
     OVERDUE:'Overdue',
     AVAILABLE:'Available',
     CHECKIN:'Checkin',
     BOOKED:'Booked',
     DIRTY:'Dirty',
     REPAIR:'Repair',
     ALL_ROOMS:'All rooms',
     LOGIN_ERROR:'Your provided username/password or hotel id is not correct',
     WALKIN:'Walk-In',
     ENTER_SEARCH_QUERY:'Enter search query',
     PHONE_NUMBER:'Phone Number',
     PASSWORD_CONFIRM:'Confirm Password',
     NEED_EMAIL_CONFIRMATION:'You must verify this email before using it to login. To verify, login with your email and then click the verification link',
     SIGN_UP_SUCCESS:"Congratulations! You've successfully signed up for ezCloud. We'll send a verification link to the email address you used to create the account. If you don't verify your email, you may not be able to access to our system",
     PASSWORD_NOT_MATCH:'Password does not match',
     PASSWORD_VALIDATION_LENGTH:'Passwords must be between 8 and 20 characters. ',
     PASSWORD_VALIDATION_PATTERN:'Must contain one lower &amp; uppercase letter, and one non-alpha character (a number or a symbol)',
     TUTORIALS:'Tutorials',
     HOTLINE:'Hotline',
     HOTEL_OWNER_INFORMATION:"Hotel Owner Infomation"
 });
    var enArray = [];
    for(var idx in enLanguageObject) {
        var item = {Key: idx, Value: vnLanguageObject[idx]};
        vnArray.push(item);
    }
    $translateProvider.preferredLanguage('en');
}]);