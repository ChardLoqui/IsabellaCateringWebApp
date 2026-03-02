app.controller("IsabellaCateringWebAppController", function ($scope, IsabellaCateringWebAppService) {

    $scope.redirectToHomePage = function () {
        window.location.href = "/Main/HomePage"
    }
    $scope.redirectToForgetPassPage = function () {
        window.open("/Main/ForgetPassPage", "_blank");
    };


    //======================================================== LOGIN START =======================================================
    const emailLogCreds = document.getElementById('logEmail');
    const passwordLogCreds = document.getElementById('logPWord');

    $scope.logInService = function () {
        //alert(emailLogCreds.value);
        //alert(passwordLogCreds.value);

        if ($scope.loginForm.$invalid) {
            Swal.fire({
                title: "Login Info",
                text: "Please fill in all required fields correctly.",
                icon: "info"
            });
            return;
        }

        var userInfo = {
            email: $scope.lEmail,
            password: $scope.lPassword
        }

        var getData = IsabellaCateringWebAppService.JsonLogGetCredsService(userInfo);

        getData.then(function (returnedData) {
            if (returnedData.data.success)
                $scope.redirectToHomePage();

            else if (!returnedData.data.success && returnedData.data.message === "Invalid Credentials") {
                // pag incorrct yung credentials
                Swal.fire({
                    title: "Access Denied",
                    text: "Invalid email or password.",
                    icon: "error"
                });

                // Clear input
                $scope.lEmail = '';
                $scope.lPassword = '';

                // Reset character count
                document.getElementById('emailCount').innerText = '0 / 50';
                document.getElementById('passCount').innerText = '0 / 20';
            } else if (!returnedData.data.success && returnedData.data.message === "Account Locked") {
                // pag incorrct yung credentials
                Swal.fire({
                    title: "Access Denied",
                    text: "Account locked for 15 minutes due to too many failed attempts.",
                    icon: "error"
                });

                // Clear input
                $scope.lEmail = '';
                $scope.lPassword = '';

                // Reset character count
                document.getElementById('emailCount').innerText = '0 / 50';
                document.getElementById('passCount').innerText = '0 / 20';
            } else {
                // pag incorrct yung credentials
                Swal.fire({
                    title: "Access Denied",
                    text: returnedData.data.message,
                    icon: "error"
                });

                // Clear input
                $scope.lEmail = '';
                $scope.lPassword = '';

                // Reset character count
                document.getElementById('emailCount').innerText = '0 / 50';
                document.getElementById('passCount').innerText = '0 / 20';
            }
        });
    }

    //for testing purposes only
    const homepage = document.getElementById('showSess'); //remove

    $scope.checkGetCreds = function (verify) {
        var getData = IsabellaCateringWebAppService.getCurrentSessionService();
        getData.then(function (returnedData) {
            homepage.innerHTML = `sess ID = ${returnedData.data.userID} sess perm = ${returnedData.data.permID}` //for test (to remove)
        });
    };

    const logInPasswordToggle = document.getElementById('toggleLogInPassword') 
    const logInPassword = document.getElementById('logPWord')
    $scope.toggleShowLogInPassword = function () {
        if (logInPassword.type === "password") {
            logInPassword.type = "text";
            logInPasswordToggle.innerHTML = "visibility_on";
        } else {
            logInPassword.type = "password";
            logInPasswordToggle.innerHTML = "visibility_off";
        }
    }

    //======================================================== LOGIN END =======================================================

    //======================================================== ACCOUNT MANAGEMENT START=======================================================
    //bago, to add user 
    $scope.addUsrSubmit = function () {
        var userInfo = {
            permissionID: $scope.permissionID,
            firstName: $scope.firstName,
            lastName: $scope.lastName,
            email: $scope.email,
            password: $scope.password,
            isActive: $scope.isActive ? 1 : 0
        };

        var getData = IsabellaCateringWebAppService.AddUsrCall(userInfo);

        getData.then(function (response) {
            if (response.data.success) {
                Swal.fire({
                    title: "Success!",
                    text: "Account created successfully!",
                    icon: "success"
                });

                // Refresh the table data immediately after adding a new user!
                $scope.getUsersData();

            } else {
                Swal.fire({
                    title: "Database Error!",
                    text: response.data.message,
                    icon: "error"
                });
            }

        }, function (error) {
            Swal.fire({
                title: "Server Error!",
                text: "Failed to communicate with the server.",
                icon: "error"
            });
        });

    };

    // for getting the data
    $scope.getUsersData = function () {
        IsabellaCateringWebAppService.getUsersDataService().then(function (returnedData) {
            // Map through the data and convert the /Date()/ strings to JS Dates
            $scope.usersData = returnedData.data.map(user => {
                if (user.dateUpdated) {
                    // Extracts the numbers from the /Date(771...)/ string
                    const milli = parseInt(user.dateUpdated.replace(/\/Date\(([-+]?\d+)\)\//, '$1'));
                    user.dateUpdated = new Date(milli);
                }
                return user;
            });
        });
    };
    $scope.getUsersData();

    //======================================================== ACCOUNT MANAGEMENT END =======================================================

    //======================================================== PASSWORD RESET START =======================================================

    $scope.sendForgetRequest = function () {

        // check kung empty
        if (!$scope.fEmail) {
            Swal.fire({
                title: "Empty Input",
                text: "Please enter your email address.",
                icon: "warning"
            });
            return;
        }

        IsabellaCateringWebAppService.verifyEmailCreds($scope.fEmail).then(function (returnedData) {
            if (returnedData.data != '') {
                //success
                Swal.fire({
                    title: "Email Sent!",
                    text: "Please check your e-mail for the Reset Password Link.",
                    icon: "success"
                }).then(() => {
                    // redirect
                    window.location.href = "/Main/LoginPage";
                });
            }
            else {
                // wrong email/not found
                Swal.fire({
                    title: "User Not Found",
                    text: "The email you entered is not registered in our system.",
                    icon: "error"
                });

                // clear
                $scope.fEmail = '';
            }
        });
    };


    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    $scope.verifyToken = function () {
        IsabellaCateringWebAppService.verifyToken(token).then(function (returnedData) {
            return returnedData.data;
        });
    };

    //4gotpass
    $scope.changeForgotPassword = function () {
        if (!$scope.newPassword) {
            //check if empty
            Swal.fire({
                title: "Required",
                text: "Please enter a new password.",
                icon: "warning"
            });
            return;
        }

        IsabellaCateringWebAppService.changeForgotPasswordService(token, $scope.newPassword).then(function (returnedData) {
            if (returnedData.data == "True") {
                //success
                Swal.fire({
                    title: "Success!",
                    text: "Password Changed. Please log in again with your new password.",
                    icon: "success"
                }).then(() => {
                    window.location.href = "/Main/LoginPage";
                });
            } else {
                //not saved
                Swal.fire({
                    title: "Error",
                    text: "Password not Changed. Please request a new link and try again later.",
                    icon: "error"
                });
            }
        });
    }

    const forgetPasswordToggle = document.getElementById('toggleForgetPassword')
    const forgetPassword = document.getElementById('forgetPWord')
    $scope.toggleShowForgetPassword = function () {
        if (forgetPassword.type === "password") {
            forgetPassword.type = "text";
            forgetPasswordToggle.innerHTML = "visibility_on";
        } else {
            forgetPassword.type = "password";
            forgetPasswordToggle.innerHTML = "visibility_off";
        }
    }

    const forgetCPasswordToggle = document.getElementById('toggleCForgetPassword')
    const forgetCPassword = document.getElementById('cForgetPWord')
    $scope.toggleShowCForgetPassword = function () {
        if (forgetCPassword.type === "password") {
            forgetCPassword.type = "text";
            forgetCPasswordToggle.innerHTML = "visibility_on";
        } else {
            forgetCPassword.type = "password";
            forgetCPasswordToggle.innerHTML = "visibility_off";
        }
    }

    //======================================================== PASSWORD RESET END =======================================================

    //======================================================== CUSTOMER VIEW START =======================================================

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

    //======================================================== CUSTOMER VIEW END =======================================================
});