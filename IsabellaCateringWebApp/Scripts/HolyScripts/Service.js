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

});