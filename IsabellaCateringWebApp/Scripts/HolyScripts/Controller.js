app.controller("IsabellaCateringWebAppController", function ($scope, IsabellaCateringWebAppService) {

    
    $scope.redirectToHomePage = function () {
        window.location.href = "/Main/HomePage";
    }
    $scope.redirectToForgetPassPage = function () {
        window.open("/Main/ForgetPassPage", "_blank");
    };
    $scope.redirectToAddBookingPage = function () {
        window.location.href = "/Main/AddBookingPage";
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

    //======================================================== NAVBAR START =======================================================
    //test for navbar
    $scope.sessionInfo = { name: 'Loading..', permission: '' };

    $scope.loadUserSession = function () {
        IsabellaCateringWebAppService.getCurrentSessionServiceNav().then(function (returnedData) {
            // Validate that we have data
            if (returnedData.data && returnedData.data.userName) {
                $scope.sessionInfo.name = returnedData.data.userName;
                $scope.sessionInfo.permission = returnedData.data.permID;

                const roles = { "1": "Admin", "2": "Staff", "3": "User" };
                $scope.sessionInfo.role = roles[returnedData.data.permID] || "";

            }
        }).catch(function (error) {
            console.error("Session fetch failed:", error);
        });
    };

    // loads navbar
    $scope.loadUserSession();


    //======================================================== NAVBAR END =======================================================

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

        //const bookingID = 1;
        var booking = {
            bookingID: 1
        }
        IsabellaCateringWebAppService.getBooking(booking)
            .then(function (res) {

                /* ===== DIRECT PASS-THROUGH ===== */
                $scope.order = {
                    bookingID: res.data.bookingID,
                    clientID: res.data.clientID,
                    packageID: res.data.packageID,

                    bookingDate: convertDate(res.data.bookingDate),
                    venue: res.data.venue,
                    eventSetTime: convertTime(res.data.eventSetTime),
                    eventTime: convertTime(res.data.eventTime),
                    ceremTime: convertTime(res.data.ceremTime),
                    eventMealTime: convertTime(res.data.eventMealTime),

                    dateCreated: convertDate(res.data.dateCreated),
                    dateUpdated: convertDate(res.data.dateUpdated),

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

    //================================================== DATE & TIME CONVERSION START ==================================================

    function convertTime(timeObj) {
        if (!timeObj || timeObj.Hours === undefined) return "";

        let hours = timeObj.Hours;
        let minutes = timeObj.Minutes;

        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        hours = hours ? hours : 12;

        const paddedMinutes = minutes < 10 ? '0' + minutes : minutes;

        return `${hours}:${paddedMinutes} ${ampm}`;
    }

    function convertDate(dateObj) {
        if (!dateObj) return "";

        const milliseconds = parseInt(dateObj.replace(/[^0-9-]/g, ''), 10);

        const date = new Date(milliseconds);

        return date.toLocaleString();
    }

    //=================================================== DATE & TIME CONVERSION END ===================================================

    //===================================================== BOOKING CALENDAR START =====================================================
    const datepickerContainer = document.getElementById('datepicker-container');
    const daysContainer = document.getElementById('days-container');
    const currentMonthElement = document.getElementById('currentMonth');

    let currentDate = new Date();
    let selectedDate = null;
    // Month navigation
    $scope.togglePrevMonth = function () {
        currentDate.setMonth(currentDate.getMonth() - 1);
        $scope.renderCalendar();
    }


    $scope.toggleNextMonth = function () {
        currentDate.setMonth(currentDate.getMonth() + 1);
        $scope.renderCalendar();
    }

    $scope.renderCalendar = function () {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        currentMonthElement.textContent = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        daysContainer.innerHTML = '';
        // Get the first day of the month (0 = Sunday, 1 = Monday, etc.)
        let firstDayOfMonth = new Date(year, month, 1).getDay();
        // Adjust for Monday as first day (0 = Sunday, 6 = Monday)
        firstDayOfMonth = firstDayOfMonth === 6 ? 0 : firstDayOfMonth;

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        // Add empty cells for days before the first day of the month
        for (let i = (daysInPrevMonth - firstDayOfMonth + 1); i <= daysInPrevMonth; i++) {
            daysContainer.innerHTML += `<div class="toPrev border-gray-400 border"><div class="text-gray-400 flex h-[38px] w-[38px] items-center justify-center rounded-[7px] border-2 border-transparent hover:border-gray-400 hover:border-2">${i}</div></div>`;
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const isCurrentDay = new Date().getDate() === i &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

            const isSelectedDay = selectedDate &&
                selectedDate.split('-')[1] === i.toString() &&
                parseInt(selectedDate.split('-')[0]) === month + 1 &&
                parseInt(selectedDate.split('-')[2]) === year;

            const dayClass = isSelectedDay
                ? "flex h-[38px] w-[38px] items-center justify-center rounded-[7px] border-2 border-[#D6418B] hover:bg-[#EC4899] hover:border-2 hover:border-[#D6418B] hover:text-white bg-[#EC4899] text-white"
                : "flex h-[38px] w-[38px] items-center justify-center rounded-[7px] border-2 border-transparent hover:border-[#D6418B] hover:border-2 ";

            const dayString = `${year}-${month + 1}-${i}`;
            daysContainer.innerHTML += `<div class="current border-gray-400 border" data-date="${dayString}"><div class="date-block ${dayClass}" data-date="${dayString}">${i}</div></div>`;
        }

        for (let i = 1; i <= (42 - daysInMonth - firstDayOfMonth); i++) {
            daysContainer.innerHTML += `<div class="toNext border-gray-400 border"><div class="text-gray-400 flex h-[38px] w-[38px] items-center justify-center rounded-[7px] border-2 border-transparent hover:border-gray-400 hover:border-2">${i}</div></div>`;
        }

        document.querySelectorAll('.toPrev').forEach(day => {
            day.addEventListener('click', function () {
                $scope.togglePrevMonth();
            });
        });

        document.querySelectorAll('.toNext').forEach(day => {
            day.addEventListener('click', function () {
                $scope.toggleNextMonth();
            });
        });

        document.querySelectorAll('.current').forEach(day => {
            IsabellaCateringWebAppService.getCalendarBookingService(day.dataset.date).then(function (bookingResponse) {
                bookingResponse.data.bookingData.forEach(item => {
                    if (bookingResponse.data.success) {
                        IsabellaCateringWebAppService.getBookingDetailsService(item.bookingID).then(function (detailsResponse) {
                            if (detailsResponse.data.success) {
                                const eventCard = document.createElement("div");
                                eventCard.className = "mx-2 flex cursor-pointer items-center justify-center bg-[#EC4899] hover:bg-[#D6418B] text-white py-2 px-4 border-b-4 border-[#D6418B] hover:border-[#EC4899] rounded-xl w-100 h-15 placeholder-white text-xs";

                                if (detailsResponse.data.clients.cCeleb2FName != null)
                                    eventCard.innerText = `${detailsResponse.data.clients.cCeleb1FName} & ${detailsResponse.data.clients.cCeleb2FName}'s ${detailsResponse.data.events.eventDesc}, ${convertTime(item.eventTime)}`;
                                else
                                    eventCard.innerText = `${detailsResponse.data.clients.cCeleb1FName}'s ${detailsResponse.data.events.eventDesc}, ${convertTime(item.eventTime)}`;

                                eventCard.dataset.date = day.dataset.date;

                                eventCard.addEventListener("click", function () {
                                    alert(`Trial ${this.dataset.date} clicked!`);
                                });
                                day.appendChild(eventCard);
                            } else {
                                Swal.fire({
                                    title: "Error",
                                    text: detailsResponse.data.message,
                                    icon: "error"
                                });
                            }
                        });
                    }
                    else {
                        return;
                    }
                });
                
            });
        });

        document.querySelectorAll('#days-container div .date-block').forEach(day => {
            if (day.dataset && day.dataset.date) { // Only add event listeners to cells with day numbers
                day.addEventListener('click', function () {
                    selectedDate = this.dataset.date;
                    document.querySelectorAll('#days-container div').forEach(d => d.classList.remove('bg-[#EC4899]', 'text-white', 'selected'));
                    this.classList.add('bg-[#EC4899]', 'text-white', 'selected');
                });
            }
        });
    }

    $scope.addBooking = function () {
        alert(selectedDate); 
        IsabellaCateringWebAppService.checkCalendarAvailabilityService(selectedDate).then(function (response) {
            if (response.data.success) {
                $scope.redirectToAddBookingPage();
            }
            else {
                Swal.fire({
                    title: "Error",
                    text: response.data.message,
                    icon: "error"
                });
            }
        });
    }
    //====================================================== BOOKING CALENDAR END ======================================================

    //====================================================== PAYMENT REMINDER START ======================================================

    $scope.getPaymentData = function () {
        IsabellaCateringWebAppService.getPaymentDataService().then(function (returnedData) {
            $scope.paymentData = returnedData.data.map(payment => {
                // Helper function to convert /Date(ms)/ to actual JS Date objects
                const parseDate = (dateStr) => {
                    if (!dateStr) return null;
                    const milli = parseInt(dateStr.replace(/\/Date\(([-+]?\d+)\)\//, '$1'));
                    return new Date(milli);
                };

                payment.dateCreated = parseDate(payment.dateCreated);
                payment.dateUpdated = parseDate(payment.dateUpdated);
                payment.dueDate = parseDate(payment.dueDate);

                return payment;
            });
        });
    };
    $scope.getPaymentData();

    $scope.isUpcomingDue = function (payment) {
        if (payment.paymentStatus !== 'Unpaid') {
            return false;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        const dueDate = new Date(payment.dueDate);

        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays <= 7;
    };

    //====================================================== PAYMENT REMINDER END ======================================================
});
