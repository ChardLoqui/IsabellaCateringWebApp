app.controller("IsabellaCateringWebAppController", function ($scope, IsabellaCateringWebAppService) {

    $scope.redirectToHomePage = function () {
        window.location.href = "/Main/HomePage"
    }

    const emailLogCreds = document.getElementById('logEmail');
    const passwordLogCreds = document.getElementById('logPWord');

    $scope.logInService = function () {
        // validation
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
            // para icheck creds
            if (returnedData.data && returnedData.data.userID) {
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
    const homepage = document.getElementById('showSess');

    $scope.checkGetCreds = function (verify) {
        var getData = IsabellaCateringWebAppService.getCurrentSessionService();
        getData.then(function (returnedData) {
            if (homepage) {
                homepage.innerHTML = `sess ID = ${returnedData.data.userID} sess perm = ${returnedData.data.permID}`;
            }
        });
    };

    //pword vis toggle
    window.togglePassVisibility = function (id, icon) {
        const input = document.getElementById(id);
        if (input.type === "password") {
            input.type = "text";
            icon.innerText = "visibility";
        } else {
            input.type = "password";
            icon.innerText = "visibility_off";
        }
    };

    // email dupe checker
    $scope.isEmailDuplicate = function () {
        if (!$scope.email || !$scope.usersData) return false;
        return $scope.usersData.some(function (u) {
            return u.email.toLowerCase() === $scope.email.toLowerCase();
        });
    };

    //bago, to add user 
    $scope.addUsrSubmit = function () {
        // check inputs
        if ($scope.addUserForm.$invalid) {
            Swal.fire({
                title: "Invalid Input",
                text: "Please check your email format and ensure all fields are filled.",
                icon: "info"
            });
            return;
        }
        // check dupe
        if ($scope.isEmailDuplicate()) {
            Swal.fire({
                title: "Duplicate Email",
                text: "This email address is already in use.",
                icon: "warning"
            });
            return;
        }
        // pword check
        if ($scope.password !== $scope.confirmPassword) {
            Swal.fire({
                title: "Password Mismatch",
                text: "The passwords you entered do not match.",
                icon: "error"
            });
            return;
        }
        // preps data if it's valid
        var userInfo = {
            permissionID: $scope.permissionID,
            firstName: $scope.firstName,
            lastName: $scope.lastName,
            email: $scope.email,
            password: $scope.password,
            isActive: $scope.isActive ? 1 : 0
        };
        IsabellaCateringWebAppService.AddUsrCall(userInfo).then(function (response) {
            if (response.data.success) {
                Swal.fire({ title: "Success!", text: "Account created!", icon: "success" });
                // reset after passing
                $scope.firstName = ''; $scope.lastName = ''; $scope.email = '';
                $scope.password = ''; $scope.confirmPassword = ''; $scope.permissionID = '';
                $scope.addUserForm.$setPristine();
                document.getElementById('emailAddCount').innerText = '0 / 50';
                document.getElementById('passAddCount').innerText = '0 / 20';
                $scope.getUsersData(); //refresh table 
            } else {
                Swal.fire({ title: "Error", text: response.data.message, icon: "error" });
            }
        });
    };

    // for getting the data
    $scope.getUsersData = function () {
        IsabellaCateringWebAppService.getUsersDataService().then(function (returnedData) {
            $scope.usersData = returnedData.data.map(user => {
                if (user.dateUpdated) {
                    const milli = parseInt(user.dateUpdated.replace(/\/Date\(([-+]?\d+)\)\//, '$1'));
                    user.dateUpdated = new Date(milli);
                }
                return user;
            });
        });
    };
    $scope.getUsersData();

    // MODAL STARTTTT
    // select user to update 
    $scope.selectUserForUpdate = function (user) {
        $scope.selectedUser = angular.copy(user);
        //change active to inactive n vice versa 
        $scope.selectedUser.isActive = user.isActive === 1;
        document.getElementById('updateModal').classList.remove('hidden');
    };

    // save changes 
    $scope.updateUsrSubmit = function () {
        if (!$scope.selectedUser.firstName || !$scope.selectedUser.lastName || !$scope.selectedUser.permissionID) {
            Swal.fire({ title: "Blank Fields", text: "Please fill in all required fields.", icon: "warning" });
            return;
        }
        //fetch data from modal inputs and prepare for update
        var updateData = {
            userID: $scope.selectedUser.userID,
            permissionID: $scope.selectedUser.permissionID,
            firstName: $scope.selectedUser.firstName,
            lastName: $scope.selectedUser.lastName,
            isActive: $scope.selectedUser.isActive ? 1 : 0
        };
        // Call service to update
        IsabellaCateringWebAppService.UpdateUsrCall(updateData).then(function (response) {
            if (response.data.success) {
                Swal.fire({ title: "Updated!", text: "Account has been updated successfully.", icon: "success" });
                $scope.getUsersData(); // refresh table 
                $scope.closeUpdateModal();
            } else {
                Swal.fire({ title: "Update Failed", text: response.data.message || "An error occurred.", icon: "error" });
            }
        }, function (error) {
            Swal.fire({ title: "Error", text: "Server connection failed.", icon: "error" });
        });
    };

    //delete acc function
    $scope.deleteAccount = function () {
        Swal.fire({
            title: "Are you sure?",
            text: "This will permanently delete " + $scope.selectedUser.firstName + "'s account from the database.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ec4899",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                IsabellaCateringWebAppService.DeleteUsrCall($scope.selectedUser.userID).then(function (response) {
                    if (response.data.success) {
                        Swal.fire("Deleted!", "Account has been removed.", "success");
                        $scope.getUsersData();
                        $scope.closeUpdateModal();
                    } else {
                        Swal.fire("Error", "Could not delete account.", "error");
                    }
                });
            }
        });
    };
    //MODAL ENDDDD

    $scope.closeUpdateModal = function () {
        document.getElementById('updateModal').classList.add('hidden');
    };

    $scope.searchText = "";
    $scope.appliedSearch = ""; 
    $scope.currentPage = 1;
    $scope.pageSize = 8; // rows for table

    // search button
    $scope.searchUser = function () {
        $scope.appliedSearch = $scope.searchText;
        $scope.currentPage = 1; reset
    };

    // pagination
    $scope.numberOfPages = function () {
        if (!$scope.usersData) return 1;
        const filtered = $scope.$eval("usersData | filter:searchText");
        return Math.ceil(filtered.length / $scope.pageSize);
    };

    $scope.setPage = function (page) {
        if (page >= 1 && page <= $scope.numberOfPages()) {
            $scope.currentPage = page;
        }
    };

    // double arrow para sa last page
    $scope.lastPage = function () {
        $scope.currentPage = $scope.numberOfPages();
    };


});




