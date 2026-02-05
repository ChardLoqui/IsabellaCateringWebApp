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
            Swal.fire({
                title: "Success!",
                text: "Account created successfully!",
                icon: "success"
            });

            if (!$scope.multiArray) $scope.multiArray = [];
            $scope.multiArray.push(userInfo);

        }, function (error) {
            Swal.fire({
                title: "Error!",
                text: "Failed to create account.",
                icon: "error"
            });
        });
    };
});