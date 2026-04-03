app.service("IsabellaCateringWebAppService", function ($http) {

    //call the JsonLogGetCreds action method in the Main controller, passing the userData object as the parameter, and return the response
    //context: controller.js
    this.JsonLogGetCredsService = function (userInfo, clientInfo, isGuest) {
        return $http.post("/Main/JsonLogGetCreds", {
            clientInfo: clientInfo,
            userInfo: userInfo,
            isGuest: isGuest
        });
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
    //for logs
    this.getLogsDataService = function () {
        return $http.get("/Main/GetLogs");
    };

    //test for navbar
    this.getCurrentSessionServiceNav = function () {
        return $http.get("/Main/getCurrentSessionNav");
    };

    this.logOutService = function () {
        return $http.get("/Main/logOut");
    }

    //========================================================PASSWORD RESET START=======================================================

    this.verifyEmailCreds = function (userEmail) {
        return $http.get("/Main/ForgetVerifyEmail", {
            params: { userEmail: userEmail }
        });
    }

    this.verifyClientCreds = function (userEmail, entryCode) {
        return $http.get("/Main/ForgetVerifyEmailClient", {
            params: { userEmail: userEmail, entryCode: entryCode }
        });
    }

    this.changeForgotPasswordService = function (token, password) {
        return $http.get("/Main/changeForgotPassword", {
            params: { unhashedToken: token, newPassword: password }
        });
    }


    //========================================================PASSWORD RESET END=======================================================

    

    this.getBooking = function (booking) {
        var response = $http({
            method: "post",
            url: "/Main/getBooking",
            data: booking
        });
        return response;
    };

    //========================================================CREATE BOOKING START=======================================================
    this.bookEvent = function (eventData) {
        return $http({
            method: "POST",
            url: "/Main/addBooking",
            data: eventData
        });
    };

    this.getPackageBookingOptionsService = function () {
        return $http.get("/Main/getPackageBookingOptions");
    }

    this.insertPackageService = function (clientInfo, bookingInfo, paymentInfo, packages, sidesGrpTypes, specialsGrpTypes, staffGrpTypes, equipGrpTypes, entertainmentGrpTypes, photoGrpTypes, keepsakesGrpTypes, debutGrpTypes) {
        return $http.post("/Main/insertPackage", {
            clientInfo: clientInfo,
            bookingInfo: bookingInfo,
            paymentInfo: paymentInfo,
            packages: packages,
            sidesGrpTypes: sidesGrpTypes,
            specialsGrpTypes: specialsGrpTypes,
            staffGrpTypes: staffGrpTypes,
            equipGrpTypes: equipGrpTypes,
            entertainmentGrpTypes: entertainmentGrpTypes,
            photoGrpTypes: photoGrpTypes,
            keepsakesGrpTypes: keepsakesGrpTypes,
            debutGrpTypes: debutGrpTypes
        });
    }

    this.loadPackagePreOptionService = function (packageID) {
        return $http.get("/Main/loadPackagePreOption", {
            params: { packageID: packageID }
        });
    }


    //========================================================CREATE BOOKING END=======================================================

    //========================================================BOOKING CALENDAR START=======================================================

    this.getCalendarBookingService = function (formattedDate) {
        return $http.get("/Main/getCalendarBooking", {
            params: { formattedDate: formattedDate }
        });
    };

    this.getCalendarMonthService = function (year, month) {
        return $http.get("/Main/getCalendarMonth", {
            params: { year: year, month: month }
        });
    };

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
    this.logPaymentReminder = function (data) {
        return $http.post('/Main/LogPaymentReminder', data);
    };


    //========================================================PAYMENT REMINDER END=======================================================
});

