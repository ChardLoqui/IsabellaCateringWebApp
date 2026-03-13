app.service("IsabellaCateringWebAppService", function ($http) {

    //call the JsonLogGetCreds action method in the Main controller, passing the userData object as the parameter, and return the response
    //context: controller.js
    this.JsonLogGetCredsService = function (userData) {
        var response = $http({
            method: "post",
            url: "/Main/JsonLogGetCreds",
            data: userData
        });
        return response;
    }
    //call the getCurrentSession action method in the Main controller and return the response
    //context: controller.js
    this.getCurrentSessionService = function () {
        return $http.get("/Main/getCurrentSession");
    }

    //bago (for add user)
    this.AddUsrCall = function (userData) {
        var response = $http({
            method: "post",
            url: "/Main/usrInfo",
            data: userData
        });
        return response;
    };

    //for getting the data
    this.getUsersDataService = function () {
        return $http.get("/Main/GetUsers");
    }

    //for Updating
    this.UpdateUsrCall = function (userInfo) {
        return $http({
            method: "POST",
            url: "/Main/UpdateUser",
            data: JSON.stringify(userInfo),
            headers: { 'Content-Type': 'application/json' }
        });
    };

    //for Deleting
    this.DeleteUsrCall = function (userID) {
        return $http({
            method: "POST",
            url: "/Main/DeleteUser",
            data: { id: userID }
        });
    };

    //test for navbar
    this.getCurrentSessionServiceNav = function () {
        return $http.get("/Main/getCurrentSessionNav");
    };

    //========================================================PASSWORD RESET START=======================================================

    this.verifyEmailCreds = function (userEmail) {
        return $http.get("/Main/ForgetVerifyEmail", {
            params: { userEmail: userEmail }
        });
    }

    this.changeForgotPasswordService = function (token, password) {
        return $http.get("/Main/changeForgotPassword", {
            params: { unhashedToken: token, newPassword: password }
        });
    }


    //========================================================PASSWORD RESET END=======================================================

    this.getBooking = function (booking) {
        console.log("getBooking called", booking.bookingID);

        var response = $http({
            method: "post",
            url: "/Main/getBooking",
            data: booking
        });
        return response;
    };

    this.bookEvent = function (eventData) {
        return $http({
            method: "POST",
            url: "/Main/addBooking",
            data: eventData
        });
    };

    //========================================================BOOKING CALENDAR START=======================================================

    this.getCalendarBookingService = function (formattedDate) {
        return $http.get("/Main/getCalendarBooking", {
            params: { formattedDate: formattedDate }
        });
    }

    this.getBookingDetailsService = function (bookingID) {
        return $http.get("/Main/getBookingDetails", {
            params: { bookingID: bookingID }
        });
    }

    this.checkCalendarAvailabilityService = function (formattedDate) {
        return $http.get("/Main/checkCalendarAvailability", {
            params: { formattedDate: formattedDate }
        });
    }

    //========================================================BOOKING CALENDAR END=======================================================

    //========================================================PAYMENT REMINDER START=======================================================

    //for getting the data for payments
    this.getPaymentDataService = function () {
        return $http.get("/Main/GetPayments");
    }

    this.AddPaymentCall = function (paymentData) {
        var response = $http({
            method: "post",
            url: "/Main/paymentInfo",
            data: paymentData
        });
        return response;
    };

    //========================================================PAYMENT REMINDER END=======================================================
});

