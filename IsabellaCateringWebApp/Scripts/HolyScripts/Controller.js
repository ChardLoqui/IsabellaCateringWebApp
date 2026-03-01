app.controller("IsabellaCateringWebAppController", function ($scope, IsabellaCateringWebAppService) {

    $scope.redirectToHomePage = function () {
        window.location.href = "/Main/HomePage"
    }
    $scope.redirectToForgetPassPage = function () {
        window.location.href = "/Main/ForgetPassPage"
    }


    //======================================================== LOGIN START =======================================================
    const emailLogCreds = document.getElementById('logEmail');
    const passwordLogCreds = document.getElementById('logPWord');

    $scope.logInService = function () {
        //alert(emailLogCreds.value);
        //alert(passwordLogCreds.value);

        var userInfo = {
            email: $scope.lEmail,
            password: $scope.lPassword
        }

        var getData = IsabellaCateringWebAppService.JsonLogGetCredsService(userInfo);

        getData.then(function (returnedData) {
            if (returnedData.data != '')
                var status = true;

            //alert(returnedData.data);

            if (status) {
                $scope.redirectToHomePage();
            } else {
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
    //this is fo the 2 pages
    $scope.sendForgetRequest = function () {
        IsabellaCateringWebAppService.verifyEmailCreds($scope.fEmail).then(function (returnedData) {
            if (returnedData.data != null) {
                alert("Please check your e-mail for the Reset Password Link");
            }
            else {
                alert("User Not Found");
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

    $scope.changeForgotPassword = function () {
        IsabellaCateringWebAppService.changeForgotPasswordService(token, $scope.newPassword).then(function (returnedData) {
            if (returnedData.data == "True") {
                alert("Password Changed \n Please log in again with the new password")
            } else
                alert("Password not Changed \n Please request a new link and try again later")
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

});