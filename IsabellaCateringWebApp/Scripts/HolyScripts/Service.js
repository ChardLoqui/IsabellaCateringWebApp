app.service("IsabellaCateringWebAppService", function ($http) {

    this.JsonLogGetCredsService = function (userData) {
        var response = $http({
            method: "post",
            url: "/Main/JsonLogGetCreds",
            data: userData
        });
        return response;
    }

    this.getCurrentSessionService = function () {
        return $http.get("/Main/getCurrentSession");
    }

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