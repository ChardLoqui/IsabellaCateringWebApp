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

});