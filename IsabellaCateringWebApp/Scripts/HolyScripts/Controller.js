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
});