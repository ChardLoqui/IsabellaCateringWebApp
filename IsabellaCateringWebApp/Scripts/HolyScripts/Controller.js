app.controller("IsabellaCateringWebAppController", function ($scope, IsabellaCateringWebAppService) {


    $scope.redirectToHomePage = function () {
        window.location.href = "/Main/HomePage";
    }
    $scope.redirectToChangePassPage = function () {
        window.open("/Main/ChangePassPage", "_blank");
    };
    $scope.redirectToAddBookingPage = function () {
        window.location.href = "/Main/AddBookingPage";
    };
    $scope.redirectToBookingCalendarPage = function () {
        window.location.href = "/Main/BookingCalendarPage";
    }


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
            ceremTime: $scope.eventCeremTime,
            eventTime: $scope.eventEventTime,
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
            daysContainer.innerHTML += `<div class="border-gray-400 border" data-date="${dayString}"><div class="date-block ${dayClass}" data-date="${dayString}">${i}</div><div class="current w-full h-[60%] overflow-y-auto [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-white rounded-lg border shadow-inner" data-date="${dayString}"></div></div>`;
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
                                eventCard.className = "mb-1 mx-1 flex cursor-pointer items-center justify-left bg-[#EC4899] hover:bg-[#D6418B] text-white py-2 px-4 border-b-4 border-[#D6418B] hover:border-[#EC4899] rounded-xl w-100 h-15 placeholder-white text-xs";

                                eventCard.innerText = `${detailsResponse.data.clients.eventName}, 
                                                        ${convertTime(item.eventTime)}`;

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
                    document.querySelectorAll('#days-container div .date-block').forEach(d => d.classList.remove('bg-[#EC4899]', 'text-white', 'selected'));
                    this.classList.add('bg-[#EC4899]', 'text-white', 'selected');
                });
            }
        });
    }

    $scope.addBooking = function () {
        IsabellaCateringWebAppService.checkCalendarAvailabilityService(selectedDate).then(function (response) {
            if (response.data.success) {
                $scope.redirectToAddBookingPage();
            }
            else {
                Swal.fire({
                    title: "Error",
                    text: response.data.message,
                    icon: "error",
                    confirmButtonColor: "#EC4899"
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

    //====================================================== CREATE BOOKING START ======================================================

    $scope.loadPackageOptions = function () {
        IsabellaCateringWebAppService.getPackageBookingOptionsService().then(function (returnedData) {
            if (returnedData.data.success) {
                $scope.backdropTypesOpt = returnedData.data.backdropTypes;
                $scope.centerPieceTypesOpt = returnedData.data.centerPieceTypes;
                $scope.couchTypesOpt = returnedData.data.couchTypes;
                $scope.debutTypesOpt = returnedData.data.debutTypes;
                $scope.entertainmentTypesOpt = returnedData.data.entertainmentTypes;
                $scope.entranceTypesOpt = returnedData.data.entranceTypes;
                $scope.equipTypesOpt = returnedData.data.equipTypes;
                $scope.keepsakesTypesOpt = returnedData.data.keepsakesTypes;
                $scope.maincourseTypesOpt = returnedData.data.maincourseTypes;
                $scope.photoTypesOpt = returnedData.data.photoTypes;
                $scope.seatingTypesOpt = returnedData.data.seatingTypes;
                $scope.sidesTypesOpt = returnedData.data.sidesTypes;
                $scope.specialsTypesOpt = returnedData.data.specialsTypes;
                $scope.staffTypesOpt = returnedData.data.staffTypes;

                $scope.eventsOpt = returnedData.data.eventTypes
                $scope.packageTypesOpt = returnedData.data.packageTypes;
            }
            var getData = IsabellaCateringWebAppService.getCurrentSessionService();
            getData.then(function (returnedData) {

                if (returnedData.data.selectedDate) {
                    var dateParts = returnedData.data.selectedDate.split("-");
                    $scope.dateOfEvent = new Date(dateParts[0], (dateParts[1] - 1), dateParts[2]);
                    $scope.changeSummaryDateOutput();
                } else {
                    $scope.redirectToBookingCalendarPage();
                }
                
            });
        });
    }

    $scope.createBooking = function () {
        var clientInfo = {
            eventName: $scope.eventName,
            cFName: $scope.cFirstName,
            cLName: $scope.cLastName,
            cEmail: $scope.cEmail,
            cContact: $scope.cContactNum,
            cCeleb1FName: $scope.cCeleb1FirstName,
            cCeleb1LName: $scope.cCeleb1LastName,
            cCeleb2FName: $scope.cCeleb2FirstName ?? null,
            cCeleb2LName: $scope.cCeleb2LastName ?? null
        }

        var bookingInfo = {
            eventID: $scope.eventTypeID,
            dsgnTheme: $scope.eventTheme,
            dsgnMotif: $scope.eventMotif,
            prepVenue: $scope.eventPrepVenue,
            bookingDate: $scope.dateOfEvent,
            ceremTime: $scope.eventCeremTime,
            eventTime: $scope.eventEventTime,
            venue: $scope.eventVenue,
            eventSetTime: $scope.eventSetTime,
            eventMealTime: $scope.eventMealTime,
            bookingNote: $scope.bookingNote ?? null
        }
           

        const cleanAmount = ($scope.bookingFinalPrice || "0").toString().replace(/[^0-9]/g, '');
        const amountDue = parseFloat(cleanAmount)
        var paymentInfo = {
            amountDue: amountDue
        }

        var packages = {
            mainCourseTypID: $scope.mainCourseTypeID ?? null,
            incStaples: $scope.staplesType ?? null,
            incBftSet: $scope.buffetType ?? null,
            incStyling: $scope.stylingType ?? null,
            incTableSet: $scope.tableType ?? null,
            centerPieceTypID: $scope.centerPieceTypeID ?? null,
            seatingTypID: $scope.seatingTypeID ?? null,
            incDnrWare: $scope.dinerwareType ?? null,
            backdropTypID: $scope.backdropTypeID ?? null,
            entranceTypID: $scope.entranceTypeID ?? null,
            couchTypID: $scope.couchTypeID ?? null
        };
        var sidesGrpTypes = {
            sidesGrpTyp1: $scope.selectedSidesTypesID[0] ?? null,
            sidesGrpTyp2: $scope.selectedSidesTypesID[1] ?? null,
            sidesGrpTyp3: $scope.selectedSidesTypesID[2] ?? null,
            sidesGrpTyp4: $scope.selectedSidesTypesID[3] ?? null
        };
        var specialsGrpTypes = {
            specialsGrpTyp1: $scope.selectedSpecialsTypesID[0] ?? null,
            specialsGrpTyp2: $scope.selectedSpecialsTypesID[1] ?? null,
            specialsGrpTyp3: $scope.selectedSpecialsTypesID[2] ?? null,
            specialsGrpTyp4: $scope.selectedSpecialsTypesID[3] ?? null,
            specialsGrpTyp5: $scope.selectedSpecialsTypesID[4] ?? null,
            specialsGrpTyp6: $scope.selectedSpecialsTypesID[5] ?? null,
            specialsGrpTyp7: $scope.selectedSpecialsTypesID[6] ?? null,
            specialsGrpTyp8: $scope.selectedSpecialsTypesID[7] ?? null,
            specialsGrpTyp9: $scope.selectedSpecialsTypesID[8] ?? null
        };
        var staffGrpTypes = {
            staffGrpTyp1: $scope.selectedStaffTypesID[0] ?? null,
            staffGrpTyp2: $scope.selectedStaffTypesID[1] ?? null,
            staffGrpTyp3: $scope.selectedStaffTypesID[2] ?? null
        };
        var equipGrpTypes = {
            equipGrpTyp1: $scope.selectedEquipTypesID[0] ?? null,
            equipGrpTyp2: $scope.selectedEquipTypesID[1] ?? null,
            equipGrpTyp3: $scope.selectedEquipTypesID[2] ?? null,
            equipGrpTyp4: $scope.selectedEquipTypesID[3] ?? null,
            equipGrpTyp5: $scope.selectedEquipTypesID[4] ?? null,
            equipGrpTyp6: $scope.selectedEquipTypesID[5] ?? null,
            equipGrpTyp7: $scope.selectedEquipTypesID[6] ?? null
        };
        var entertainmentGrpTypes = {
            entertainmentGrpTyp1: $scope.selectedEntertainmentTypesID[0] ?? null,
            entertainmentGrpTyp2: $scope.selectedEntertainmentTypesID[1] ?? null,
            entertainmentGrpTyp3: $scope.selectedEntertainmentTypesID[2] ?? null,
            entertainmentGrpTyp4: $scope.selectedEntertainmentTypesID[3] ?? null,
            entertainmentGrpTyp5: $scope.selectedEntertainmentTypesID[4] ?? null,
            entertainmentGrpTyp6: $scope.selectedEntertainmentTypesID[5] ?? null,
            entertainmentGrpTyp7: $scope.selectedEntertainmentTypesID[6] ?? null
        };
        var photoGrpTypes = {
            photoGrpTyp1: $scope.selectedPhotoTypesID[0] ?? null,
            photoGrpTyp2: $scope.selectedPhotoTypesID[1] ?? null,
            photoGrpTyp3: $scope.selectedPhotoTypesID[2] ?? null,
            photoGrpTyp4: $scope.selectedPhotoTypesID[3] ?? null,
            photoGrpTyp5: $scope.selectedPhotoTypesID[4] ?? null,
            photoGrpTyp6: $scope.selectedPhotoTypesID[5] ?? null,
            photoGrpTyp7: $scope.selectedPhotoTypesID[6] ?? null
        };
        var keepsakesGrpTypes = {
            keepsakesGrpTyp1: $scope.selectedKeepsakesTypesID[0] ?? null,
            keepsakesGrpTyp2: $scope.selectedKeepsakesTypesID[1] ?? null,
            keepsakesGrpTyp3: $scope.selectedKeepsakesTypesID[2] ?? null,
            keepsakesGrpTyp4: $scope.selectedKeepsakesTypesID[3] ?? null,
            keepsakesGrpTyp5: $scope.selectedKeepsakesTypesID[4] ?? null
        };
        var debutGrpTypes = {
            debutGrpTyp1: $scope.selectedDebutTypesID[0] ?? null,
            debutGrpTyp2: $scope.selectedDebutTypesID[1] ?? null,
            debutGrpTyp3: $scope.selectedDebutTypesID[2] ?? null
        };

        if (clientInfo.eventName != null && 
            clientInfo.cFName != null &&
            clientInfo.cLName != null &&
            clientInfo.cEmail != null &&
            clientInfo.cContact != null &&
            clientInfo.cCeleb1FName != null &&
            clientInfo.cCeleb1LName != null &&
            bookingInfo.eventID != null &&
            bookingInfo.dsgnTheme != null &&
            bookingInfo.dsgnMotif != null &&
            bookingInfo.prepVenue != null &&
            bookingInfo.bookingDate != null &&
            bookingInfo.ceremTime != null &&
            bookingInfo.eventTime != null &&
            bookingInfo.venue != null &&
            bookingInfo.eventSetTime != null &&
            bookingInfo.eventMealTime != null &&
            paymentInfo.amountDue != null &&
            $scope.packageTypeID != null
        ) {
            IsabellaCateringWebAppService.checkCalendarAvailabilityService($scope.dateOfEvent).then(function (response) {
                if (response.data.success) {
                    IsabellaCateringWebAppService.insertPackageService(clientInfo, bookingInfo, paymentInfo, packages, sidesGrpTypes, specialsGrpTypes, staffGrpTypes, equipGrpTypes, entertainmentGrpTypes, photoGrpTypes, keepsakesGrpTypes, debutGrpTypes).then(function (returnedData) {
                        if (returnedData.data.success) {
                            Swal.fire({
                                title: 'Success!',
                                text: returnedData.data.message,
                                icon: 'success',
                                confirmButtonColor: '#ec4899',
                            });
                        } else {
                            Swal.fire({
                                title: 'Error!',
                                text: returnedData.data.message,
                                icon: 'success',
                                confirmButtonColor: '#ec4899',
                            });
                        }
                    });
                }
                else {
                    Swal.fire({
                        title: "Error",
                        text: response.data.message,
                        icon: "error",
                        confirmButtonColor: "#EC4899"
                    });
                }
            });
        } else {
            Swal.fire({
                title: "Error",
                text: "Please check for required entries to be filled up!",
                icon: "error",
                confirmButtonColor: "#EC4899"
            });
        }
    }
    function disableBookingInput() {
        if ($scope.packageTypeID < 3 || $scope.packageTypeID > 4) 
            $scope.addKdInput = true;
        else
            $scope.addKdInput = false;

        if ($scope.packageTypeID < 5 || $scope.packageTypeID > 7) 
            $scope.addDebutInput = true;
        else
            $scope.addDebutInput = false;
        
    }

    $scope.changeSummaryDateOutput = function () {
        var base = $scope.dateOfEvent.toString().substring(0, 15);
        var parts = base.split(" ");
        $scope.formattedDateOfEvent = `${parts[0]} ${parts[1]} ${parts[2]}, ${parts[3]}`;
    }

    $scope.selectPackageTypes = function (type, id) {
        $scope.packageType = type;
        $scope.packageTypeID = id;
        $scope.activeDropdown = null;

        IsabellaCateringWebAppService.loadPackagePreOptionService($scope.packageTypeID).then(function (returnedData) {
            $scope.staplesType = returnedData.data.prePackage.incStaples;
            $scope.buffetType = returnedData.data.prePackage.incBftSet;
            $scope.stylingType = returnedData.data.prePackage.incStyling;
            $scope.tableType = returnedData.data.prePackage.incTableSet;
            $scope.dinerwareType = returnedData.data.prePackage.incDnrWare;

            $scope.mainCourseTypeID = returnedData.data.preMainCourse.mainCourseTypID;
            $scope.mainCourseType = returnedData.data.preMainCourse.mainCourseTypDesc;
            $scope.centerPieceTypeID = returnedData.data.preCenterPiece.centerPieceTypID;
            $scope.centerPieceType = returnedData.data.preCenterPiece.centerPieceTypDesc;
            $scope.seatingTypeID = returnedData.data.preSeating.seatingTypID;
            $scope.seatingType = returnedData.data.preSeating.seatingTypDesc;
            $scope.backdropTypeID = returnedData.data.preBackdrop.backdropTypID;
            $scope.backdropType = returnedData.data.preBackdrop.backdropTypDesc;
            $scope.entranceTypeID = returnedData.data.preEntrance.entranceTypID;
            $scope.entranceType = returnedData.data.preEntrance.entranceTypDesc;
            $scope.couchTypeID = returnedData.data.preCouch.couchTypID;
            $scope.couchType = returnedData.data.preCouch.couchTypDesc;

            for (var x = 0; x < 4; x++) {
                var propertyName = "preSides" + (x + 1);
                var sideData = returnedData.data[propertyName];
                $scope.selectedSidesTypesID[x] = sideData?.sidesTypID ?? null;
                $scope.selectedSidesTypes[x] = sideData?.sidesTypDesc ?? null;
            }

            for (var x = 0; x < 9; x++) {
                var propertyName = "preSpecials" + (x + 1);
                var sideData = returnedData.data[propertyName];
                $scope.selectedSpecialsTypesID[x] = sideData?.specialsTypID ?? null;
                $scope.selectedSpecialsTypes[x] = sideData?.specialsTypDesc ?? null;
            }

            for (var x = 0; x < 3; x++) {
                var propertyName = "preStaff" + (x + 1);
                var sideData = returnedData.data[propertyName];
                $scope.selectedStaffTypesID[x] = sideData?.staffTypID ?? null;
                $scope.selectedStaffTypes[x] = sideData?.staffTypDesc ?? null;
            }

            for (var x = 0; x < 7; x++) {
                var propertyName = "preEquip" + (x + 1);
                var sideData = returnedData.data[propertyName];
                $scope.selectedEquipTypesID[x] = sideData?.equipTypID ?? null;
                $scope.selectedEquipTypes[x] = sideData?.equipTypDesc ?? null;
            }

            for (var x = 0; x < 7; x++) {
                var propertyName = "preEntertainment" + (x + 1);
                var sideData = returnedData.data[propertyName];
                $scope.selectedEntertainmentTypesID[x] = sideData?.entertainmentTypID ?? null;
                $scope.selectedEntertainmentTypes[x] = sideData?.entertainmentTypDesc ?? null;
            }

            for (var x = 0; x < 6; x++) {
                var propertyName = "prePhoto" + (x + 1);
                var sideData = returnedData.data[propertyName];
                $scope.selectedPhotoTypesID[x] = sideData?.photoTypID ?? null;
                $scope.selectedPhotoTypes[x] = sideData?.photoTypDesc ?? null;
            }

            for (var x = 0; x < 5; x++) {
                var propertyName = "preKeepsakes" + (x + 1);
                var sideData = returnedData.data[propertyName];
                $scope.selectedKeepsakesTypesID[x] = sideData?.keepsakesTypID ?? null;
                $scope.selectedKeepsakesTypes[x] = sideData?.keepsakesTypDesc ?? null;
            }

            for (var x = 0; x < 3; x++) {
                var propertyName = "preDebut" + (x + 1);
                var sideData = returnedData.data[propertyName];
                $scope.selectedDebutTypesID[x] = sideData?.debutTypID ?? null;
                $scope.selectedDebutTypes[x] = sideData?.debutTypDesc ?? null;
            }

            $scope.pricePaxOpt = [
                {
                    pricePaxID: 1,
                    pricePaxDesc: returnedData.data.pricePax.pax1Desc,
                    pricePaxPrice: returnedData.data.pricePax.pricePax1
                },
                {
                    pricePaxID: 2,
                    pricePaxDesc: returnedData.data.pricePax.pax2Desc,
                    pricePaxPrice: returnedData.data.pricePax.pricePax2
                },
                {
                    pricePaxID: 3,
                    pricePaxDesc: returnedData.data.pricePax.pax3Desc,
                    pricePaxPrice: returnedData.data.pricePax.pricePax3
                },]

            $scope.pricePaxAdMulti = returnedData.data.pricePax.pricePaxAd;
            $scope.pricePaxKdMulti = returnedData.data.pricePax.pricePaxKd;

            $scope.addAdult = '';
            $scope.addKid = '';
        });

        disableBookingInput();
    };

    $scope.selectPricePaxType = function (id, type, price) {
        $scope.priceType = type;
        $scope.priceTypeID = id;
        $scope.bookingBasePrice = `Php ${price}`;
        $scope.activeDropdown = null;
    };

    $scope.getPricePaxDisplayText = function () {
        return $scope.priceType == null ? "Pax" : $scope.priceType;
    };

    $scope.getPackageDisplayText = function () {
        return $scope.packageType == null ? 'Packages' : $scope.packageType;
    };

    $scope.selectEventTypes = function (type, id) {
        $scope.eventType = type;
        $scope.eventTypeID = id;
        $scope.activeDropdown = null;
    };

    $scope.getEventDisplayText = function () {
        return $scope.eventType == null ? 'Event Type' : $scope.eventType;
    };

    $scope.hours = [
        "01", "02", "03", "04", "05", "06",
        "07", "08", "09", "10", "11", "12"
    ];

    $scope.minutes = [
        "00", "05", "10", "15", "20", "25",
        "30", "35", "40", "45", "50", "55"
    ];

    $scope.periods = ["AM", "PM"];

    $scope.selectSetHour = function (h) {
        $scope.setHour = h;
        $scope.updateSetTime();
        $scope.activeDropdown = null;
    };

    $scope.selectSetMinute = function (m) {
        $scope.setMinute = m;
        $scope.updateSetTime();
        $scope.activeDropdown = null;
    };

    $scope.selectSetPeriod = function (p) {
        $scope.setPeriod = p;
        $scope.updateSetTime();
        $scope.activeDropdown = null;
    };

    $scope.selectMealHour = function (h) {
        $scope.mealHour = h;
        $scope.updateMealTime();
        $scope.activeDropdown = null;
    };

    $scope.selectMealMinute = function (m) {
        $scope.mealMinute = m;
        $scope.updateMealTime();
        $scope.activeDropdown = null;
    };

    $scope.selectMealPeriod = function (p) {
        $scope.mealPeriod = p;
        $scope.updateMealTime();
        $scope.activeDropdown = null;
    };

    $scope.selectEventHour = function (h) {
        $scope.eventHour = h;
        $scope.updateEventTime();
        $scope.activeDropdown = null;
    };

    $scope.selectEventMinute = function (m) {
        $scope.eventMinute = m;
        $scope.updateEventTime();
        $scope.activeDropdown = null;
    };

    $scope.selectEventPeriod = function (p) {
        $scope.eventPeriod = p;
        $scope.updateEventTime();
        $scope.activeDropdown = null;
    };

    $scope.selectCeremHour = function (h) {
        $scope.ceremHour = h;
        $scope.updateCeremTime();
        $scope.activeDropdown = null;
    };

    $scope.selectCeremMinute = function (m) {
        $scope.ceremMinute = m;
        $scope.updateCeremTime();
        $scope.activeDropdown = null;
    };

    $scope.selectCeremPeriod = function (p) {
        $scope.ceremPeriod = p;
        $scope.updateCeremTime();
        $scope.activeDropdown = null;
    };


    $scope.selectMainCourseType = function (type, id) {
        $scope.mainCourseType = type;
        $scope.mainCourseTypeID = id;
        $scope.activeDropdown = null;
    };

    $scope.getMainCourseDisplayText = function () {
        return $scope.mainCourseType == null ? 'Main Course' : $scope.mainCourseType;
    };


    $scope.selectedSidesTypes = [];
    $scope.selectedSidesTypesID = [];

    $scope.toggleSidesType = function (type, id) {

        var index = $scope.selectedSidesTypes.indexOf(type);

        if (id == 1) {
            $scope.selectedSidesTypes = [];
            $scope.selectedSidesTypesID = [];
            $scope.selectedSidesTypes[id - 1] = type;
            $scope.selectedSidesTypesID[id - 1] = id;
            $scope.activeDropdown = null;
        } else {
            if (index === -1) {
                $scope.selectedSidesTypes[id - 2] = type;
                $scope.selectedSidesTypesID[id - 2] = id;
                if ($scope.selectedSidesTypesID[0] == 1) {
                    $scope.selectedSidesTypes[0] = null;
                    $scope.selectedSidesTypesID[0] = null;
                }
            } else {
                $scope.selectedSidesTypes[id - 2] = null;
                $scope.selectedSidesTypesID[id - 2] = null;
            }
        }
    };

    $scope.isSidesSelected = function (type) {
        return $scope.selectedSidesTypes.indexOf(type) !== -1;
    };


    $scope.getSidesDisplayText = function () {
        if (!$scope.selectedSidesTypes || $scope.selectedSidesTypes.length === 0) {
            return 'Sides Type';
        }
        var filtered = $scope.selectedSidesTypes.filter(function (val) {
            return val !== null && val !== undefined && val !== '';
        });
        $scope.sidesType = filtered.join(', ');
        return filtered.length > 0 ? filtered.join(', ') : 'Sides & Dessert';
    };


    $scope.staplesOpt = ['None', 'Unlimited Rice and Drinks']
    $scope.selectStaplesType = function (type, id) {
        $scope.staplesType = type;
        $scope.activeDropdown = null;
    };

    $scope.getStaplesDisplayText = function () {
        return $scope.staplesType == null ? 'Staples & Drinks' : $scope.staplesType;
    };


    $scope.buffetOpt = ['None', 'Elegant Buffet Set - up and Buffet Centerpiece']
    $scope.selectBuffetType = function (type, id) {
        $scope.buffetType = type;
        $scope.activeDropdown = null;
    };

    $scope.getBuffetDisplayText = function () {
        return $scope.buffetType == null ? 'Buffet Setup' : $scope.buffetType;
    };


    $scope.stylingOpt = ['None', 'Your Choice of Motif']
    $scope.selectStylingType = function (type, id) {
        $scope.stylingType = type;
        $scope.activeDropdown = null;
    };

    $scope.getStylingDisplayText = function () {
        return $scope.stylingType == null ? 'Styling' : $scope.stylingType;
    };


    $scope.tableOpt = ['None', 'Round Table w/ Floor Length Cover & Table Napkin']
    $scope.selectTableType = function (type, id) {
        $scope.tableType = type;
        $scope.activeDropdown = null;
    };

    $scope.getTableDisplayText = function () {
        return $scope.tableType == null ? 'Table Setup' : $scope.tableType;
    };


    $scope.selectCenterPieceType = function (type, id) {
        $scope.centerPieceType = type;
        $scope.centerPieceTypeID = id;
        $scope.activeDropdown = null;
    };

    $scope.getCenterPieceDisplayText = function () {
        return $scope.centerPieceType == null ? 'Table Centerpiece' : $scope.centerPieceType;
    };


    $scope.selectSeatingType = function (type, id) {
        $scope.seatingType = type;
        $scope.seatingTypeID = id;
        $scope.activeDropdown = null;
    };

    $scope.getSeatingDisplayText = function () {
        return $scope.seatingType == null ? 'Seating' : $scope.seatingType;
    };


    $scope.selectedSpecialsTypes = [];
    $scope.selectedSpecialsTypesID = [];

    $scope.toggleSpecialsType = function (type, id) {

        var index = $scope.selectedSpecialsTypes.indexOf(type);

        if (id == 1) {
            $scope.selectedSpecialsTypes = [];
            $scope.selectedSpecialsTypesID = [];
            $scope.selectedSpecialsTypes[id - 1] = type;
            $scope.selectedSpecialsTypesID[id - 1] = id;
            $scope.activeDropdown = null;
        } else {
            if (index === -1) {
                $scope.selectedSpecialsTypes[id - 2] = type;
                $scope.selectedSpecialsTypesID[id - 2] = id;
                if ($scope.selectedSpecialsTypesID[0] == 1) {
                    $scope.selectedSpecialsTypes[0] = null;
                    $scope.selectedSpecialsTypesID[0] = null;
                }
            } else {
                $scope.selectedSpecialsTypes[id - 2] = null;
                $scope.selectedSpecialsTypesID[id - 2] = null;
            }
        }
    };

    $scope.isSpecialsSelected = function (type) {
        return $scope.selectedSpecialsTypes.indexOf(type) !== -1;
    };

    $scope.getSpecialsDisplayText = function () {
        if (!$scope.selectedSpecialsTypes || $scope.selectedSpecialsTypes.length === 0) {
            return 'Special Tables';
        }
        var filtered = $scope.selectedSpecialsTypes.filter(function (val) {
            return val !== null && val !== undefined && val !== '';
        });
        $scope.specialsType = filtered.join(', ');
        return filtered.length > 0 ? filtered.join(', ') : 'Special Tables';
    };


    $scope.selectedStaffTypes = [];
    $scope.selectedStaffTypesID = [];

    $scope.toggleStaffType = function (type, id) {

        var index = $scope.selectedStaffTypes.indexOf(type);

        if (id == 1) {
            $scope.selectedStaffTypes = [];
            $scope.selectedStaffTypesID = [];
            $scope.selectedStaffTypes[id - 1] = type;
            $scope.selectedStaffTypesID[id - 1] = id;
            $scope.activeDropdown = null;
        } else {
            if (index === -1) {
                $scope.selectedStaffTypes[id - 2] = type;
                $scope.selectedStaffTypesID[id - 2] = id;
                if ($scope.selectedStaffTypesID[0] == 1) {
                    $scope.selectedStaffTypes[0] = null;
                    $scope.selectedStaffTypesID[0] = null;
                }
            } else {
                $scope.selectedStaffTypes[id - 2] = null;
                $scope.selectedStaffTypesID[id - 2] = null;
            }
        }
    };

    $scope.isStaffSelected = function (type) {
        return $scope.selectedStaffTypes.indexOf(type) !== -1;
    };

    $scope.getStaffDisplayText = function () {
        if (!$scope.selectedStaffTypes || $scope.selectedStaffTypes.length === 0) {
            return 'Staff';
        }
        var filtered = $scope.selectedStaffTypes.filter(function (val) {
            return val !== null && val !== undefined && val !== '';
        });
        $scope.staffType = filtered.join(', ');
        return filtered.length > 0 ? filtered.join(', ') : 'Staff';
    };


    $scope.dinerwareOpt = ['None', 'Complete Set of Dinnerwares & Glasswares']
    $scope.selectDinerwareType = function (type, id) {
        $scope.dinerwareType = type;
        $scope.activeDropdown = null;
    };

    $scope.getDinerwareDisplayText = function () {
        return $scope.dinerwareType == null ? 'Dinerware' : $scope.dinerwareType;
    };


    $scope.selectBackdropType = function (type, id) {
        $scope.backdropType = type;
        $scope.backdropTypeID = id;
        $scope.activeDropdown = null;
    };

    $scope.getBackdropDisplayText = function () {
        return $scope.backdropType == null ? 'Backdrop' : $scope.backdropType;
    };


    $scope.selectEntranceType = function (type, id) {
        $scope.entranceType = type;
        $scope.entranceTypeID = id;
        $scope.activeDropdown = null;
    };

    $scope.getEntranceDisplayText = function () {
        return $scope.entranceType == null ? 'Entrance Arch' : $scope.entranceType;
    };


    $scope.selectCouchType = function (type, id) {
        $scope.couchType = type;
        $scope.couchTypeID = id;
        $scope.activeDropdown = null;
    };

    $scope.getCouchDisplayText = function () {
        return $scope.couchType == null ? "Celebrant's Couch" : $scope.couchType;
    };


    $scope.selectedEquipTypes = [];
    $scope.selectedEquipTypesID = [];

    $scope.toggleEquipType = function (type, id) {

        var index = $scope.selectedEquipTypes.indexOf(type);

        if (id == 1) {
            $scope.selectedEquipTypes = [];
            $scope.selectedEquipTypesID = [];
            $scope.selectedEquipTypes[id - 1] = type;
            $scope.selectedEquipTypesID[id - 1] = id;
            $scope.activeDropdown = null;
        } else {
            if (index === -1) {
                $scope.selectedEquipTypes[id - 2] = type;
                $scope.selectedEquipTypesID[id - 2] = id;
                if ($scope.selectedEquipTypesID[0] == 1) {
                    $scope.selectedEquipTypes[0] = null;
                    $scope.selectedEquipTypesID[0] = null;
                }
            } else {
                $scope.selectedEquipTypes[id - 2] = null;
                $scope.selectedEquipTypesID[id - 2] = null;
            }
        }
    };

    $scope.isEquipSelected = function (type) {
        return $scope.selectedEquipTypes.indexOf(type) !== -1;
    };


    $scope.getEquipDisplayText = function () {
        if (!$scope.selectedEquipTypes || $scope.selectedEquipTypes.length === 0) {
            return 'Equipments & Decor';
        }
        var filtered = $scope.selectedEquipTypes.filter(function (val) {
            return val !== null && val !== undefined && val !== '';
        });
        $scope.equipType = filtered.join(', ');
        return filtered.length > 0 ? filtered.join(', ') : 'Equipments & Decor';
    };


    $scope.selectedEntertainmentTypes = [];
    $scope.selectedEntertainmentTypesID = [];

    $scope.toggleEntertainmentType = function (type, id) {

        var index = $scope.selectedEntertainmentTypes.indexOf(type);

        if (id == 1) {
            $scope.selectedEntertainmentTypes = [];
            $scope.selectedEntertainmentTypesID = [];
            $scope.selectedEntertainmentTypes[id - 1] = type;
            $scope.selectedEntertainmentTypesID[id - 1] = id;
            $scope.activeDropdown = null;
        } else {
            if (index === -1) {
                $scope.selectedEntertainmentTypes[id - 2] = type;
                $scope.selectedEntertainmentTypesID[id - 2] = id;
                if ($scope.selectedEntertainmentTypesID[0] == 1) {
                    $scope.selectedEntertainmentTypes[0] = null;
                    $scope.selectedEntertainmentTypesID[0] = null;
                }
            } else {
                $scope.selectedEntertainmentTypes[id - 2] = null;
                $scope.selectedEntertainmentTypesID[id - 2] = null;
            }
        }
    };

    $scope.isEntertainmentSelected = function (type) {
        return $scope.selectedEntertainmentTypes.indexOf(type) !== -1;
    };


    $scope.getEntertainmentDisplayText = function () {
        if (!$scope.selectedEntertainmentTypes || $scope.selectedEntertainmentTypes.length === 0) {
            return 'Entertainment';
        }
        var filtered = $scope.selectedEntertainmentTypes.filter(function (val) {
            return val !== null && val !== undefined && val !== '';
        });
        $scope.entertainmentType = filtered.join(', ');
        return filtered.length > 0 ? filtered.join(', ') : 'Entertainment';
    };


    $scope.selectedPhotoTypes = [];
    $scope.selectedPhotoTypesID = [];

    $scope.togglePhotoType = function (type, id) {

        var index = $scope.selectedPhotoTypes.indexOf(type);

        if (id == 1) {
            $scope.selectedPhotoTypes = [];
            $scope.selectedPhotoTypesID = [];
            $scope.selectedPhotoTypes[id - 1] = type;
            $scope.selectedPhotoTypesID[id - 1] = id;
            $scope.activeDropdown = null;
        } else {
            if (index === -1) {
                $scope.selectedPhotoTypes[id - 2] = type;
                $scope.selectedPhotoTypesID[id - 2] = id;
                if ($scope.selectedPhotoTypesID[0] == 1) {
                    $scope.selectedPhotoTypes[0] = null;
                    $scope.selectedPhotoTypesID[0] = null;
                }
            } else {
                $scope.selectedPhotoTypes[id - 2] = null;
                $scope.selectedPhotoTypesID[id - 2] = null;
            }
        }
    };

    $scope.isPhotoSelected = function (type) {
        return $scope.selectedPhotoTypes.indexOf(type) !== -1;
    };


    $scope.getPhotoDisplayText = function () {
        if (!$scope.selectedPhotoTypes || $scope.selectedPhotoTypes.length === 0) {
            return 'Photo Operations';
        }
        var filtered = $scope.selectedPhotoTypes.filter(function (val) {
            return val !== null && val !== undefined && val !== '';
        });
        $scope.photoType = filtered.join(', ');
        return filtered.length > 0 ? filtered.join(', ') : 'Photo Operations';
    };


    $scope.selectedKeepsakesTypes = [];
    $scope.selectedKeepsakesTypesID = [];

    $scope.toggleKeepsakesType = function (type, id) {

        var index = $scope.selectedKeepsakesTypes.indexOf(type);

        if (id == 1) {
            $scope.selectedKeepsakesTypes = [];
            $scope.selectedKeepsakesTypesID = [];
            $scope.selectedKeepsakesTypes[id - 1] = type;
            $scope.selectedKeepsakesTypesID[id - 1] = id;
            $scope.activeDropdown = null;
        } else {
            if (index === -1) {
                $scope.selectedKeepsakesTypes[id - 2] = type;
                $scope.selectedKeepsakesTypesID[id - 2] = id;
                if ($scope.selectedKeepsakesTypesID[0] == 1) {
                    $scope.selectedKeepsakesTypes[0] = null;
                    $scope.selectedKeepsakesTypesID[0] = null;
                }
            } else {
                $scope.selectedKeepsakesTypes[id - 2] = null;
                $scope.selectedKeepsakesTypesID[id - 2] = null;
            }
        }
    };

    $scope.isKeepsakesSelected = function (type) {
        return $scope.selectedKeepsakesTypes.indexOf(type) !== -1;
    };

    $scope.getKeepsakesDisplayText = function () {
        if (!$scope.selectedKeepsakesTypes || $scope.selectedKeepsakesTypes.length === 0) {
            return 'Keepsakes';
        }
        var filtered = $scope.selectedKeepsakesTypes.filter(function (val) {
            return val !== null && val !== undefined && val !== '';
        });
        $scope.keepsakesType = filtered.join(', ');
        return filtered.length > 0 ? filtered.join(', ') : 'Keepsakes';
    };


    $scope.selectedDebutTypes = [];
    $scope.selectedDebutTypesID = [];

    $scope.toggleDebutType = function (type, id) {

        var index = $scope.selectedDebutTypes.indexOf(type);

        if (id == 1) {
            $scope.selectedDebutTypes = [];
            $scope.selectedDebutTypesID = [];
            $scope.selectedDebutTypes[id - 1] = type;
            $scope.selectedDebutTypesID[id - 1] = id;
            $scope.activeDropdown = null;
        } else {
            if (index === -1) {
                $scope.selectedDebutTypes[id - 2] = type;
                $scope.selectedDebutTypesID[id - 2] = id;
                if ($scope.selectedDebutTypesID[0] == 1) {
                    $scope.selectedDebutTypes[0] = null;
                    $scope.selectedDebutTypesID[0] = null;
                }
            } else {
                $scope.selectedDebutTypes[id - 2] = null;
                $scope.selectedDebutTypesID[id - 2] = null;
            }
        }
    };

    $scope.isDebutSelected = function (type) {
        return $scope.selectedDebutTypes.indexOf(type) !== -1;
    };

    $scope.getDebutDisplayText = function () {
        if (!$scope.selectedDebutTypes || $scope.selectedDebutTypes.length === 0) {
            return 'Debut Additionals';
        }
        var filtered = $scope.selectedDebutTypes.filter(function (val) {
            return val !== null && val !== undefined && val !== '';
        });
        $scope.debutType = filtered.join(', ');
        return filtered.length > 0 ? filtered.join(', ') : 'Debut Additionals';
    };

    $scope.activeDropdown = null;
    $scope.toggleDropdown = function (name, $event) {
        $event.stopPropagation();

        $scope.activeDropdown =
            ($scope.activeDropdown === name) ? null : name;
    };

    /* CONVERT FINAl TIME */

    $scope.updateSetTime = function () {
        if (!$scope.setHour || !$scope.setMinute || !$scope.setPeriod)
            return;
        let hour = parseInt($scope.setHour);
        if ($scope.setPeriod === "PM" && hour !== 12)
            hour += 12;
        if ($scope.setPeriod === "AM" && hour === 12)
            hour = 0;
        let hour24 = hour.toString().padStart(2, "0");
        $scope.eventSetTime = hour24 + ":" + $scope.setMinute;
    };

    $scope.updateMealTime = function () {
        if (!$scope.mealHour || !$scope.mealMinute || !$scope.mealPeriod)
            return;
        let hour = parseInt($scope.mealHour);
        if ($scope.mealPeriod === "PM" && hour !== 12)
            hour += 12;
        if ($scope.mealPeriod === "AM" && hour === 12)
            hour = 0;
        let hour24 = hour.toString().padStart(2, "0");
        $scope.eventMealTime = hour24 + ":" + $scope.mealMinute;
    };

    $scope.updateEventTime = function () {
        if (!$scope.eventHour || !$scope.eventMinute || !$scope.eventPeriod)
            return;
        let hour = parseInt($scope.eventHour);
        if ($scope.eventPeriod === "PM" && hour !== 12)
            hour += 12;
        if ($scope.eventPeriod === "AM" && hour === 12)
            hour = 0;
        let hour24 = hour.toString().padStart(2, "0");
        $scope.eventEventTime = hour24 + ":" + $scope.eventMinute;
    };

    $scope.updateCeremTime = function () {
        if (!$scope.ceremHour || !$scope.ceremMinute || !$scope.ceremPeriod)
            return;
        let hour = parseInt($scope.ceremHour);
        if ($scope.ceremPeriod === "PM" && hour !== 12)
            hour += 12;
        if ($scope.ceremPeriod === "AM" && hour === 12)
            hour = 0;
        let hour24 = hour.toString().padStart(2, "0");
        $scope.eventCeremTime = hour24 + ":" + $scope.ceremMinute;
    };

    //====================================================== CREATE BOOKING END ======================================================

    //====================================================== CLICK OUTSIDE DIRECTIVE START ======================================================

    document.addEventListener('click', function (event) {
        const isInside = event.target.closest('.dropdown-container');

        if (!isInside) {
            const scope = angular.element(document.body).scope();

            scope.$applyAsync(() => {
                scope.activeDropdown = null;
            });
        }
        $scope.computeFinalPrice();
    });

    $scope.computeFinalPrice = function () {
        var adultTotal = ($scope.addAdult || 0) * ($scope.pricePaxAdMulti || 0);
        var kidTotal = ($scope.addKid || 0) * ($scope.pricePaxKdMulti || 0);
        var basePrice = ($scope.bookingBasePrice || "0").toString().replace(/[^0-9]/g, '');
        var total = adultTotal + kidTotal + parseInt(basePrice);
        $scope.bookingFinalPrice = `Php ${total.toLocaleString()}`;
    };
    

    //====================================================== CLICK OUTSIDE DIRECTIVE END ======================================================


});
