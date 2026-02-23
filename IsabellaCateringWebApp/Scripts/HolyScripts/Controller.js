app.controller("IsabellaCateringWebAppController", function ($scope, IsabellaCateringWebAppService) {

    $scope.redirectToHomePage = function () {
        window.location.href = "/Main/HomePage"
    }

    const emailLogCreds = document.getElementById('logEmail');
    const passwordLogCreds = document.getElementById('logPWord');

    $scope.logInService = function () {
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

    //for testing purposes only
    const homepage = document.getElementById('showSess'); //remove

    $scope.checkGetCreds = function (verify) {
        var getData = IsabellaCateringWebAppService.getCurrentSessionService();
        getData.then(function (returnedData) {
            homepage.innerHTML = `sess ID = ${returnedData.data.userID} sess perm = ${returnedData.data.permID}` //for test (to remove)
        });
    };

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

});