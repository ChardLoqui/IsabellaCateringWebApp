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
    };

    //========================================================BOOKING CALENDAR END=======================================================

    //========================================================PAYMENT REMINDER START=======================================================

    //for getting the data for payments
    this.getPaymentDataService = function () {
        return $http.get("/Main/GetPayments");
    }

    this.getBookingsWithoutPayments = function () {
        return $http.get('/Main/GetBookingsWithoutPayments');
    };

    this.AddPaymentCall = function (paymentData) {
        var response = $http({
            method: "post",
            url: "/Main/paymentInfo",
            data: paymentData
        });
        return response;
    };

    this.addPaymentService = this.AddPaymentCall;

    this.updatePaymentService = function (paymentData) {
        return $http({
            method: 'POST',
            url: '/Main/UpdatePayment',
            data: paymentData
        });
    };

    this.getClientEmailByBooking = function (bookingID) {
        return $http.get('/Main/GetClientEmailByBooking', {
            params: { bookingID: bookingID }
        });
    };

    //========================================================PAYMENT REMINDER END=======================================================
});

