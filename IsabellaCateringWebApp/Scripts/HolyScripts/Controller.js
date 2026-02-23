app.controller("IsabellaCateringWebAppController", function ($scope, IsabellaCateringWebAppService) {

    $scope.redirectToHomePage = function () {
        window.location.href = "/Main/HomePage"
    }

    const emailLogCreds = document.getElementById('logEmail');
    const passwordLogCreds = document.getElementById('logPWord');
    $scope.logInService = function() {
        alert(emailLogCreds.value);
        alert(passwordLogCreds.value);

        var userInfo = {
            email: $scope.lEmail,
            password: $scope.lPassword
        }
        var status = true;
        var getData = IsabellaCateringWebAppService.JsonLogGetCredsService(userInfo);
        getData.then(function (returnedData) {
            if (returnedData.data == null)
                status = false;
            alert(returnedData.data);
            if (status) {
                $scope.redirectToHomePage();
            } else {
                emailLogCreds.value = '';
                passwordLogCreds.value = '';
            }
        });
    }

    const homepage = document.getElementById('showSess'); //remove
    $scope.checkGetCreds = function (verify) {
        var getData = IsabellaCateringWebAppService.getCurrentSessionService();
        getData.then(function (returnedData) {
            //$scope.checkCredsHomaPage(returnedData.data.userID, returnedData.data.permID, verify);

            homepage.innerHTML = `sess ID = ${returnedData.data.userID} sess perm = ${returnedData.data.permID}` //for test (to remove)
        });
    }

    $scope.getOrderInfo = function () {

        const bookingID = 1;

        IsabellaCateringWebAppService.getBooking(bookingID)
            .then(function (res) {

                /* ===== DIRECT PASS-THROUGH ===== */
                $scope.order = {
                    bookingID: res.data.bookingID,
                    clientID: res.data.clientID,
                    packageID: res.data.packageID,

                    bookingDate: res.data.bookingDate,
                    venue: res.data.venue,
                    eventSetTime: res.data.eventSetTime,
                    eventTime: res.data.eventTime,
                    ceremTime: res.data.ceremTime,
                    eventMealTime: res.data.eventMealTime,

                    dateCreated: res.data.dateCreated,
                    dateUpdated: res.data.dateUpdated,

                    progressOne: res.data.progressOne,
                    progressTwo: res.data.progressTwo,
                    progressThree: res.data.progressThree
                };

                /* ===== PROGRESS BAR ===== */
                $scope.steps = [
                    { label: 'Planning', icon: '1', completed: $scope.order.progressOne == 1 },
                    { label: 'Preparation', icon: '2', completed: $scope.order.progressTwo == 1 },
                    { label: 'Event Day', icon: '3', completed: $scope.order.progressThree == 1 }
                ];
            })
            .catch(function (err) {
                console.error('Error loading booking', err);
            });
    };


    //future Dates
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    $scope.mindate = tomorrow.toISOString().split('T')[0];

    $scope.bookEvent = function () {

        if ($scope.eventForm.$invalid) {
            alert("Please complete required fields.");
            return;
        }

        var eventData = {
            eventName: $scope.eventName,
            packageId: $scope.packageId,
            venue: $scope.venue,
            dsgnMotif: $scope.motif,
            dsgnTheme: $scope.theme,
            dateOfEvent: $scope.dateOfEvent,
            ceremTime: $scope.ceremTime,
            eventTime: $scope.eventTime,
            eventMealTime: $scope.eventMealTime,
            eventSetTime: $scope.eventSetTime
        };

        IsabellaCateringWebAppService.bookEvent(eventData)
            .then(function (response) {
                alert(response.data.message);
            })
            .catch(function (error) {
                alert("Booking Failed");
            });
    };
});

