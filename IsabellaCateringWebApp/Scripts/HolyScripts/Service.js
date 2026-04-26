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
            params: { userEmail: userEmail, entryCode: entryCode || userEmail }
        });
    }

    this.verifyToken = function (token) {
        return $http.get("/Main/VerifyForgetToken", {
            params: { token: token }
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

    this.getPackageCardDetailsService = function (packageName) {
        return $http.get("/Main/getPackageCardDetails", {
            params: { packageName: packageName }
        });
    }

    this.insertPackageService = function (clientInfo, bookingInfo, paymentInfo, bookingAdditionals, packages, sidesGrpTypes, specialsGrpTypes, staffGrpTypes, equipGrpTypes, entertainmentGrpTypes, photoGrpTypes, keepsakesGrpTypes, debutGrpTypes) {
        return $http.post("/Main/insertPackage", {
            clientInfo: clientInfo,
            bookingInfo: bookingInfo,
            paymentInfo: paymentInfo,
            bookingAdditionals: bookingAdditionals,
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

    this.updateBookingService = function (clientInfo, bookingInfo, paymentInfo, bookingAdditionals, packages, sidesGrpTypes, specialsGrpTypes, staffGrpTypes, equipGrpTypes, entertainmentGrpTypes, photoGrpTypes, keepsakesGrpTypes, debutGrpTypes) {
        return $http.post("/Main/UpdateBooking", {
            clientInfo: clientInfo,
            bookingInfo: bookingInfo,
            paymentInfo: paymentInfo,
            bookingAdditionals: bookingAdditionals,
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

    this.deleteBookingService = function (bookingID) {
        return $http.post("/Main/DeleteBooking", {
            bookingID: bookingID
        });
    }

    this.loadPackagePreOptionService = function (packageID) {
        return $http.get("/Main/loadPackagePreOption", {
            params: { packageID: packageID }
        });
    }

    this.requestCancellationService = function (bookingID, customerNote) {
        return $http.post("/Main/RequestCancellation", {
            bookingID: bookingID,
            customerNote: customerNote
        });
    }

    this.approveCancellationService = function (bookingID, adminNote) {
        return $http.post("/Main/ApproveCancellation", {
            bookingID: bookingID,
            adminNote: adminNote
        });
    }

    this.rejectCancellationService = function (bookingID, adminNote) {
        return $http.post("/Main/RejectCancellation", {
            bookingID: bookingID,
            adminNote: adminNote
        });
    }

    this.getCancellationsService = function () {
        return $http.get("/Main/GetCancellations");
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

    this.findbookingService = function (query) {
        return $http.get("/Main/findbooking", {
            params: { query: query }
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

    this.setBookingViewService = function (bookingID) {
        return $http.get("/Main/setBookingView", {
            params: { bookingID: bookingID }
        });
    }

    //========================================================BOOKING CALENDAR END=======================================================

    //========================================================REQUEST BOOKING CALENDAR START=======================================================

    this.getRequestCalendarMonthService = function (year, month) {
        return $http.get("/Main/getRequestCalendarMonth", {
            params: { year: year, month: month }
        });
    };

    this.validateRequestDateService = function (formattedDate) {
        return $http.get("/Main/validateRequestDate", {
            params: { formattedDate: formattedDate }
        });
    };

    //========================================================REQUEST BOOKING CALENDAR END=======================================================

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

    this.loadBookingPaymentBalanceService = function (bookingID) {
        return $http.get('/Main/loadBookingPaymentBalance', {
            params: { bookingID: bookingID }
        });
    }

    this.sendReminderService = function (toEmail, paymentLines, fullName, eventName, purpose) {
        return $http.get('/Main/SendReminder', {
            params: { toEmail: toEmail, paymentLines: paymentLines, fullName: fullName, eventName: eventName, purpose: purpose }
        });
    }


    //========================================================PAYMENT REMINDER END=======================================================

    this.getEventPackagesService = function () {
        return $http.get("/Main/GetEventPackages");
    }
});

