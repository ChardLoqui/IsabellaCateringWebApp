app.service("IsabellaCateringWebAppService", function ($http) {

    this.JsonLogGetCredsService = function (userData) {
        var response = $http({
            method: "post",
            url: "/Main/JsonLogGetCreds",
            data: userData
        });
        return response;
    }

    this.getCurrentSessionService = function () {
        return $http.get("/Main/getCurrentSession");
    }

});