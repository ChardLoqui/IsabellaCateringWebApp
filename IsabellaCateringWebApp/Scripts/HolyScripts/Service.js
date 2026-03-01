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

    this.getBooking = function (bookingID) {
        console.log("getBooking called", bookingID);

        return $http.get("/Main/getBooking", {
            params: { bookingID: bookingID }
        });
    };

    this.bookEvent = function (eventData) {
        return $http({
            method: "POST",
            url: "/Main/addBooking",
            data: eventData
        });
    };
});