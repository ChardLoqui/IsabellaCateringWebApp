app.controller("IsabellaCateringWebAppController", function ($scope, $http, IsabellaCateringWebAppService) {

    $scope.displayNavOptions = null;
    $scope.navStateResolved = false;

    $scope.redirectToHomePage = function () {
        window.location.href = "/Main/HomePage";
    }
    $scope.redirectToChangePassPage = function () {
        window.location.href = "/Main/ChangePassPage";
    };
    $scope.redirectToAddBookingPage = function () {
        window.location.href = "/Main/AddBookingPage";
    };
    $scope.redirectToAddBookingPageEditMode = function (id) {
        window.location.href = `/Main/AddBookingPage?mode=edit&id=${id}`;
    };
    $scope.redirectToBookingCalendarPage = function () {
        window.location.href = "/Main/BookingCalendarPage";
    }
    $scope.redirectToLoginPage = function () {
        window.location.href = "/Main/LoginPage";
    }
    $scope.redirectToForgetPassPage = function () {
        window.location.href = "/Main/ForgetPassPage";
    }
    $scope.redirectToCustomerViewPage = function () {
        window.location.href = "/Main/CustomerViewPage";
    }
    $scope.redirectToAdminViewPage = function () {
        window.location.href = "/Main/AdminViewPage";
    }

    const currentPath = (window.location.pathname || '').toLowerCase();
    function isCurrentPage(pageName) {
        return currentPath.indexOf(("/main/" + pageName).toLowerCase()) !== -1;
    }

    var isAccountsPage = isCurrentPage("AccountsPage");
    var isLogsPage = isCurrentPage("LogsPage");
    var isPaymentReminderPage = isCurrentPage("PaymentReminderPage");

    $scope.accountsLoading = isAccountsPage;
    $scope.logsLoading = isLogsPage;
    $scope.paymentLoading = isPaymentReminderPage;
    $scope.orderLoading = false;
    $scope.calendarLoading = false;

    $scope.authenticateLoginCredentials = function () {
        $scope.navStateResolved = false;
        IsabellaCateringWebAppService.getCurrentSessionService().then(function (returnedData) {
            if (returnedData.data.userID == '' && returnedData.data.permID == '') {

                Swal.fire({
                    title: "Access Denied",
                    text: "Please log in first!",
                    icon: "error",
                    confirmButtonColor: "#EC4899"
                });
                $scope.redirectToLoginPage();
            } else {
                if (returnedData.data.permID < 3) {
                    $scope.displayNavOptions = true;
                    $scope.navStateResolved = true;
                } else {
                    $scope.displayNavOptions = false;
                    $scope.navStateResolved = true;
                    if (!isCurrentPage("CustomerViewPage")) {
                        $scope.redirectToCustomerViewPage();
                    }
                }
            }
        });
    }
    $scope.authenticateLoginLoginCredentials = function () {
        IsabellaCateringWebAppService.getCurrentSessionService().then(function (returnedData) {
            if (returnedData.data.userID != '' && returnedData.data.permID != '') {

                Swal.fire({
                    title: "Access Denied",
                    text: "Please log out first!",
                    icon: "error",
                    confirmButtonColor: "#EC4899"
                });
                if (returnedData.data.permID == "3")
                    $scope.redirectToCustomerViewPage();
                else
                    $scope.redirectToBookingCalendarPage();
            }
        });
    }
    //======================================================== LOGIN START =======================================================
    const authAlert = Swal.mixin({
        buttonsStyling: false,
        customClass: {
            popup: 'login-alert-popup',
            title: 'login-alert-title',
            htmlContainer: 'login-alert-text',
            confirmButton: 'login-alert-confirm',
            cancelButton: 'login-alert-cancel'
        }
    });

    function fireAuthAlert(options) {
        const iconColors = {
            success: '#db2777',
            error: '#be123c',
            warning: '#d97706',
            info: '#db2777'
        };

        return authAlert.fire(Object.assign({
            confirmButtonText: 'Continue',
            iconColor: iconColors[options.icon] || '#db2777'
        }, options));
    }

    function setCounterText(id, text) {
        const counter = document.getElementById(id);
        if (counter) {
            counter.innerText = text;
        }
    }

    function resetAngularForm(form) {
        if (!form) {
            return;
        }

        form.$setPristine();
        form.$setUntouched();
        form.$submitted = false;
    }

    function resetAuthFields(form, fieldMap, counterMap) {
        Object.keys(fieldMap || {}).forEach(function (key) {
            $scope[key] = fieldMap[key];
        });

        Object.keys(counterMap || {}).forEach(function (counterId) {
            setCounterText(counterId, counterMap[counterId]);
        });

        resetAngularForm(form);
    }

    $scope.emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    $scope.guestCodePattern = /^\S{1,50}$/;
    $scope.emailPlaceholder = "Use Email";
    $scope.isGuest = false;
    $scope.resetTokenState = { checked: false, valid: false };
    $scope.bookingValidationAttempted = false;
    $scope.bookingTouchedFields = {};

    const bookingRequiredFields = [
        { key: 'eventName', label: 'Event Name' },
        { key: 'packageTypeID', label: 'Package' },
        { key: 'eventTypeID', label: 'Event Type' },
        { key: 'cFirstName', label: "Client's Firstname" },
        { key: 'cLastName', label: "Client's Lastname" },
        { key: 'cEmail', label: 'Email' },
        { key: 'cContactNum', label: 'Contact Number' },
        { key: 'cCeleb1FirstName', label: "Celebrant's Firstname" },
        { key: 'cCeleb1LastName', label: "Celebrant's Lastname" },
        { key: 'eventVenue', label: 'Venue' },
        { key: 'eventPrepVenue', label: 'Preparation Venue' },
        { key: 'eventMotif', label: 'Motif' },
        { key: 'eventTheme', label: 'Theme' },
        { key: 'dateOfEvent', label: 'Date of Event' },
        { key: 'eventCeremTime', label: 'Ceremony Time' },
        { key: 'eventEventTime', label: 'Event Time' },
        { key: 'eventMealTime', label: 'Meal Time' },
        { key: 'eventSetTime', label: 'Set Time' }
    ];

    $scope.shouldShowFieldError = function (form, fieldName, errorKey) {
        if (!form || !form[fieldName]) {
            return false;
        }

        const field = form[fieldName];
        const shouldShow = form.$submitted || field.$touched;

        if (!shouldShow) {
            return false;
        }

        if (!errorKey) {
            return field.$invalid;
        }

        return !!field.$error[errorKey];
    };

    $scope.isPasswordMismatch = function (form) {
        if (!form || !form.confirmPasswordField) {
            return false;
        }

        const field = form.confirmPasswordField;
        const shouldShow = form.$submitted || field.$touched;

        return !!(shouldShow &&
            $scope.newPassword &&
            $scope.cNewPassword &&
            $scope.newPassword !== $scope.cNewPassword);
    };

    $scope.markBookingFieldTouched = function (fieldKey) {
        if (!fieldKey) {
            return;
        }

        $scope.bookingTouchedFields[fieldKey] = true;
    };

    $scope.shouldShowBookingFieldError = function (fieldKey) {
        if (!$scope.bookingValidationAttempted && !$scope.bookingTouchedFields[fieldKey]) {
            return false;
        }


        var isMissing = getMissingBookingFields().some(function (field) {
            return field.key === fieldKey;
        });


        if (fieldKey === 'guestCount') {

            return !$scope.priceType;
        }

        if (fieldKey === 'cEmail') {
            var emailValue = $scope.cEmail;
            var isInvalidEmail = emailValue && emailValue.indexOf('@') === -1;
            return isInvalidEmail;
        }

        return isMissing;
    };

    $scope.getBookingFieldErrorMessage = function (fieldKey) {
        if (fieldKey === 'guestCount') {
            return 'Please select the number of guests.';
        }

        var fieldConfig = bookingRequiredFields.find(function (field) {
            return field.key === fieldKey;
        });

        var label = fieldConfig ? fieldConfig.label : 'This field';

        if (fieldKey === 'cEmail') {
            var emailValue = $scope.cEmail;
            if (emailValue && emailValue.indexOf('@') === -1) {
                return label + ' must contain an @ symbol.';
            }
        }

        return label + ' is required.';
    };

    function getMissingBookingFields() {
        return bookingRequiredFields.filter(function (field) {
            return !hasBookingValue($scope[field.key]);
        });
    }

    function fireBookingValidationAlert(missingFields) {
        var alertHtml =
            '<p>Please fill in these required fields before continuing:</p>' +
            '<ul style="margin:0.75rem 0 0; padding-left:1.25rem; text-align:left;">' +
            missingFields.map(function (field) {
                return '<li>' + field.label + '</li>';
            }).join('') +
            '</ul>';

        return fireAuthAlert({
            title: 'Incomplete Details',
            html: alertHtml,
            icon: 'error'
        });
    }

    $scope.logInService = function () {
        if ($scope.loginForm.$invalid) {
            fireAuthAlert({
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

        var clientInfo = {
            entryCode: $scope.lEmail,
            password: $scope.lPassword
        }

        IsabellaCateringWebAppService.JsonLogGetCredsService(userInfo, clientInfo, $scope.isGuest).then(function (returnedData) {
            if (returnedData.data.success) {
                if (returnedData.data.isGuest)
                    $scope.redirectToCustomerViewPage();
                else
                    $scope.redirectToBookingCalendarPage();
            }
            else if (!returnedData.data.success && returnedData.data.requiresPasswordChange) {
                fireAuthAlert({
                    title: "New Account Detected",
                    text: returnedData.data.detail || "Please change your password first.",
                    icon: "warning"
                });
            }
            else if (!returnedData.data.success && returnedData.data.message === "Invalid Credentials") {
                fireAuthAlert({
                    title: "Access Denied",
                    text: $scope.isGuest ? "Invalid entry code or password." : "Invalid email or password.",
                    icon: "error"
                });

                resetAuthFields($scope.loginForm, {
                    lEmail: '',
                    lPassword: ''
                }, {
                    emailCount: '0 / 50',
                    passCount: '0 / 20'
                });
            } else if (!returnedData.data.success && returnedData.data.message === "Account Locked") {
                fireAuthAlert({
                    title: "Access Denied",
                    text: "Account locked for 15 minutes due to too many failed attempts.",
                    icon: "error",
                    confirmButtonColor: "#EC4899"
                });

                resetAuthFields($scope.loginForm, {
                    lEmail: '',
                    lPassword: ''
                }, {
                    emailCount: '0 / 50',
                    passCount: '0 / 20'
                });
            } else {
                fireAuthAlert({
                    title: "Access Denied",
                    text: returnedData.data.message,
                    icon: "error",
                    confirmButtonColor: "#EC4899"
                });

                resetAuthFields($scope.loginForm, {
                    lEmail: '',
                    lPassword: ''
                }, {
                    emailCount: '0 / 50',
                    passCount: '0 / 20'
                });
            }
        });
    }

    $scope.changeCredPlaceholder = function () {
        if ($scope.isGuest)
            $scope.emailPlaceholder = "Use Entry Code";
        else
            $scope.emailPlaceholder = "Use Email";

        if ($scope.loginForm && $scope.loginForm.loginIdentifier) {
            $scope.loginForm.loginIdentifier.$validate();
        }
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

    const logInPasswordToggle = document.getElementById('toggleLogInPassword')
    const logInPassword = document.getElementById('logPWord')
    $scope.toggleShowLogInPassword = function () {
        if (logInPassword.type === "password") {
            logInPassword.type = "text";
            logInPasswordToggle.innerHTML = "visibility";
        } else {
            logInPassword.type = "password";
            logInPasswordToggle.innerHTML = "visibility_off";
        }
    }



    //======================================================== LOGIN END =======================================================

    //======================================================== LOGOUT START =======================================================
    $scope.logOut = function (){
        IsabellaCateringWebAppService.logOutService().then(function (returnedData) {
            Swal.fire({
                title: "Acount Logged Out!",
                text: returnedData.data.message,
                icon: "success",
                confirmButtonColor: "#EC4899"
            });
        });
    }

    //======================================================== LOGOUT END =======================================================

    //======================================================== NAVBAR START =======================================================
    //test for navbar
    $scope.sessionInfo = { name: 'Loading..', permission: '' };

    $scope.loadUserSession = function () {
        IsabellaCateringWebAppService.getCurrentSessionServiceNav().then(function (returnedData) {
            if (returnedData.data) {
                $scope.currentUserID = returnedData.data.userID;

                $scope.sessionInfo.name = returnedData.data.userName;
                $scope.sessionInfo.permission = returnedData.data.permID;

                const roles = { "1": "Admin", "2": "Staff", "3": "Customer" };
                $scope.sessionInfo.role = roles[returnedData.data.permID] || "";

                console.log("Logged in as User ID:", $scope.currentUserID);
            }
        }).catch(function (error) {
            console.error("Session fetch failed:", error);
        });
    };

    // loads navbar
    $scope.loadUserSession();


    //======================================================== NAVBAR END =======================================================

    //======================================================== ACCOUNT MANAGEMENT START=======================================================
    $scope.showAddAccountModal = false;
    $scope.showUpdateAccountModal = false;
    $scope.searchState = {
        account: "",
        log: "",
        due: "",
        payments: "",
        calendar: ""
    };
    $scope.filteredAccountsData = [];
    $scope.filteredLogsData = [];

    function normalizeSearchValue(value) {
        return String(value == null ? '' : value).toLowerCase().trim();
    }

    function resolveSearchDate(value) {
        if (!value) {
            return null;
        }

        if (value instanceof Date) {
            return isNaN(value.getTime()) ? null : value;
        }

        if (typeof value === 'string') {
            var jsonDateMatch = value.match(/\/Date\(([-+]?\d+)\)\//);
            if (jsonDateMatch) {
                var jsonDate = new Date(parseInt(jsonDateMatch[1], 10));
                return isNaN(jsonDate.getTime()) ? null : jsonDate;
            }

            var localDateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (localDateMatch) {
                var localDate = new Date(
                    Number(localDateMatch[1]),
                    Number(localDateMatch[2]) - 1,
                    Number(localDateMatch[3])
                );
                return isNaN(localDate.getTime()) ? null : localDate;
            }
        }

        var parsedDate = new Date(value);
        return isNaN(parsedDate.getTime()) ? null : parsedDate;
    }

    function formatSearchDate(value) {
        var date = resolveSearchDate(value);
        if (!date) {
            return '';
        }

        var month = String(date.getMonth() + 1).padStart(2, '0');
        var day = String(date.getDate()).padStart(2, '0');
        var year = date.getFullYear();

        return month + '/' + day + '/' + year;
    }

    function getStartOfCalendarDay(value) {
        var date = resolveSearchDate(value);
        if (!date) {
            return null;
        }

        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    function getCalendarToday() {
        var today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), today.getDate());
    }

    function isPastCalendarDate(value) {
        var date = getStartOfCalendarDay(value);
        if (!date) {
            return false;
        }

        return date.getTime() < getCalendarToday().getTime();
    }

    function formatCurrencySearch(value) {
        if (value == null || value === '') {
            return '';
        }

        var amount = Number(value);
        if (isNaN(amount)) {
            return String(value);
        }

        var localizedAmount = amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        return ['₱' + localizedAmount, localizedAmount, String(amount)].join(' ');
    }

    function matchesSearchValues(query, values) {
        if (!query) {
            return true;
        }

        return (values || []).some(function (value) {
            return normalizeSearchValue(value).indexOf(query) !== -1;
        });
    }

    function getDuePaymentSearchStatus(payment) {
        var paid = Number(payment.amountPaid) || 0;
        var due = Number(payment.amountDue) || 0;
        return paid <= 0 ? 'Unpaid' : paid < due ? 'Partially Paid' : 'Paid';
    }

    function applyAccountsSearch() {
        if (!$scope.usersData) {
            $scope.filteredAccountsData = [];
            return;
        }

        var query = normalizeSearchValue($scope.searchState.account);

        $scope.filteredAccountsData = $scope.usersData.filter(function (user) {
            var role = user.permissionID == 1 ? 'admin' : user.permissionID == 2 ? 'staff' : 'customer';
            var status = user.isActive == 1 || user.isActive === true ? 'active' : 'inactive';

            return matchesSearchValues(query, [
                user.userID,
                role,
                user.firstName,
                user.lastName,
                user.email,
                formatSearchDate(user.dateUpdated),
                status
            ]);
        });
    }

    function applyLogsSearch() {
        if (!$scope.logsData) {
            $scope.filteredLogsData = [];
            return;
        }

        var query = normalizeSearchValue($scope.searchState.log);

        $scope.filteredLogsData = $scope.logsData.filter(function (log) {
            return matchesSearchValues(query, [
                log.logID,
                log.action,
                formatSearchDate(log.dateUpdated),
                log.userName
            ]);
        });
    }

    function resetAddAccountForm() {
        $scope.firstName = '';
        $scope.lastName = '';
        $scope.email = '';
        $scope.password = '';
        $scope.confirmPassword = '';
        $scope.permissionID = '';
        $scope.isActive = false;

        if ($scope.addUserForm) {
            $scope.addUserForm.$setPristine();
            $scope.addUserForm.$setUntouched();
        }

        [
            ['firstNameAddCount', '0 / 30'],
            ['lastNameAddCount', '0 / 30'],
            ['emailAddCount', '0 / 50'],
            ['passAddCount', '0 / 20']
        ].forEach(function (entry) {
            var el = document.getElementById(entry[0]);
            if (el) el.innerText = entry[1];
        });
    }

    $scope.openAddAccountModal = function () {
        resetAddAccountForm();
        $scope.showAddAccountModal = true;
    };

    $scope.closeAddAccountModal = function () {
        $scope.showAddAccountModal = false;
    };

    //bago, to add user 
    $scope.addUsrSubmit = function () {

        if ($scope.addUserForm.$invalid) {
            Swal.fire({
                title: "Invalid Input",
                text: "Please check your email format and ensure all fields are filled.",
                icon: "info",
                confirmButtonColor: "#EC4899"
            });
            return;
        }

        if ($scope.isEmailDuplicate()) {
            Swal.fire({
                title: "Duplicate Email",
                text: "This email address is already in use.",
                icon: "warning",
                confirmButtonColor: "#EC4899"
            });
            return;
        }

        if ($scope.password !== $scope.confirmPassword) {
            Swal.fire({
                title: "Password Mismatch",
                text: "The passwords you entered do not match.",
                icon: "error",
                confirmButtonColor: "#EC4899"
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
                Swal.fire({
                    title: "Success!", text: "Account created!", icon: "success",
                    confirmButtonColor: "#EC4899" });
                resetAddAccountForm();
                $scope.closeAddAccountModal();
                $scope.getUsersData();  
            } else {
                Swal.fire({
                    title: "Error", text: response.data.message, icon: "error",
                    confirmButtonColor: "#EC4899" });
            }
        });
    };


    $scope.getUsersData = function () {
        $scope.accountsLoading = true;

        IsabellaCateringWebAppService.getUsersDataService()
            .then(function (returnedData) {
                $scope.usersData = returnedData.data.map(user => {
                    if (user.dateUpdated) {
                        const milli = parseInt(user.dateUpdated.replace(/\/Date\(([-+]?\d+)\)\//, '$1'));
                        user.dateUpdated = new Date(milli);
                    }
                    return user;
                });
                applyAccountsSearch();
            })
            .catch(function (error) {
                console.error('Error loading accounts', error);
                $scope.usersData = [];
                applyAccountsSearch();
            })
            .finally(function () {
                $scope.accountsLoading = false;
            });
    };
    if (isAccountsPage) {
        $scope.authenticateLoginCredentials();
        $scope.getUsersData();
    }

    // MODAL STARTTTT

    $scope.selectUserForUpdate = function (user) {
        $scope.selectedUser = angular.copy(user);
        $scope.selectedUser.isActive = user.isActive === 1;
        $scope.showUpdateAccountModal = true;
    };

    $scope.updateUsrSubmit = function () {
        if (!$scope.selectedUser.firstName || !$scope.selectedUser.lastName || !$scope.selectedUser.permissionID) {
            Swal.fire({
                title: "Blank Fields", text: "Please fill in all required fields.", icon: "warning",
                confirmButtonColor: "#EC4899" });
            return;
        }

        var updateData = {
            userID: $scope.selectedUser.userID,
            permissionID: $scope.selectedUser.permissionID,
            firstName: $scope.selectedUser.firstName,
            lastName: $scope.selectedUser.lastName,
            isActive: $scope.selectedUser.isActive ? 1 : 0
        };

        IsabellaCateringWebAppService.UpdateUsrCall(updateData).then(function (response) {
            if (response.data.success) {
                Swal.fire({
                    title: "Updated!", text: "Account has been updated successfully.", icon: "success",
                    confirmButtonColor: "#EC4899" });
                $scope.getUsersData(); 
                $scope.closeUpdateModal();
            } else {
                Swal.fire({
                    title: "Update Failed", text: response.data.message || "An error occurred.", icon: "error",
                    confirmButtonColor: "#EC4899" });
            }
        }, function (error) {
            Swal.fire({
                title: "Error", text: "Server connection failed.", icon: "error",
                confirmButtonColor: "#EC4899" });
        });
    };


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
                        Swal.fire({
                            title: "Deleted!", text: "Account has been removed.", icon: "success",
                            confirmButtonColor: "#EC4899"
                        });
                        $scope.getUsersData();
                        $scope.closeUpdateModal();
                    } else {
                        Swal.fire({
                            title: "Error", text: "Could not delete account.", icon: "error",
                            confirmButtonColor: "#EC4899"
                        });
                    }
                });
            }
        });
    };
    //MODAL ENDDDD

    $scope.closeUpdateModal = function () {
        $scope.showUpdateAccountModal = false;
    };

    var accountsPag = makePagination({ defaultSort: 'userID', defaultSize: 10 });
    $scope.accountsTable = accountsPag.state;

    // search button
    $scope.searchUser = function () {
        accountsPag.resetPage();
        $scope.accountsPageDropOpen = false;
        $scope.accountsSizeDropOpen = false;
        applyAccountsSearch();
    };

    $scope.getAccountsFiltered = function () {
        return $scope.filteredAccountsData || [];
    };

    $scope.getAccountsPage = function () {
        return accountsPag.getPage($scope.getAccountsFiltered());
    };
    $scope.getAccountsTotalPages = function () {
        return accountsPag.getTotalPages($scope.getAccountsFiltered());
    };
    $scope.getAccountsPageNumbers = function () {
        return accountsPag.getPageNumbers($scope.getAccountsFiltered());
    };
    $scope.accountsSortBy = function (field) {
        accountsPag.sortBy(field);
    };
    $scope.accountsGoToPage = function (page) {
        accountsPag.goToPage(page, $scope.getAccountsFiltered());
    };
    $scope.accountsPrevPage = function () {
        $scope.accountsGoToPage($scope.accountsTable.currentPage - 1);
    };
    $scope.accountsNextPage = function () {
        $scope.accountsGoToPage($scope.accountsTable.currentPage + 1);
    };
    $scope.setAccountsPageSize = function (size) {
        accountsPag.setPageSize(size);
    };

    $scope.$watch('searchState.account', function () {
        applyAccountsSearch();
        accountsPag.resetPage();
    });

    $scope.$watchCollection('usersData', function () {
        applyAccountsSearch();
    });

    $scope.logsData = [];
    var logsPag = makePagination({ defaultSort: 'logID', defaultSize: 10 });
    $scope.logsTable = logsPag.state;

    // search
    $scope.searchLogs = function () {
        logsPag.resetPage();
        $scope.logsPageDropOpen = false;
        $scope.logsSizeDropOpen = false;
        applyLogsSearch();
    };

    $scope.getLogsFiltered = function () {
        return $scope.filteredLogsData || [];
    };

    $scope.getLogsPage = function () {
        return logsPag.getPage($scope.getLogsFiltered());
    };
    $scope.getLogsTotalPages = function () {
        return logsPag.getTotalPages($scope.getLogsFiltered());
    };
    $scope.getLogsPageNumbers = function () {
        return logsPag.getPageNumbers($scope.getLogsFiltered());
    };
    $scope.logsSortBy = function (field) {
        logsPag.sortBy(field);
    };
    $scope.logsGoToPage = function (page) {
        logsPag.goToPage(page, $scope.getLogsFiltered());
    };
    $scope.logsPrevPage = function () {
        $scope.logsGoToPage($scope.logsTable.currentPage - 1);
    };
    $scope.logsNextPage = function () {
        $scope.logsGoToPage($scope.logsTable.currentPage + 1);
    };
    $scope.setLogsPageSize = function (size) {
        logsPag.setPageSize(size);
    };

    $scope.$watch('searchState.log', function () {
        applyLogsSearch();
        logsPag.resetPage();
    });

    $scope.$watchCollection('logsData', function () {
        applyLogsSearch();
    });


    $scope.getLogsData = function () {
        $scope.logsLoading = true;

        IsabellaCateringWebAppService.getLogsDataService()
            .then(function (returnedData) {
                $scope.logsData = returnedData.data.map(log => {
                    if (log.dateUpdated) {
                        const milli = parseInt(log.dateUpdated.replace(/\/Date\(([-+]?\d+)\)\//, '$1'));
                        log.dateUpdated = new Date(milli);
                    }
                    return log;
                });
                applyLogsSearch();
            })
            .catch(function (error) {
                console.error('Error loading logs', error);
                $scope.logsData = [];
                applyLogsSearch();
            })
            .finally(function () {
                $scope.logsLoading = false;
            });
    };
    if (isLogsPage) {
        $scope.authenticateLoginCredentials();
        $scope.getLogsData();
    }

    if (isCurrentPage("CustomerViewPage")) {
        $scope.authenticateLoginCredentials();
    }


    //======================================================== ACCOUNT MANAGEMENT END =======================================================

    //======================================================== PASSWORD RESET START =======================================================

    $scope.sendForgetRequest = function () {
        if (!$scope.fEmail || !$scope.fEmail.trim()) {
            Swal.fire({
                title: "Empty Input",
                text: "Please enter your email address or customer entry code.",
                icon: "warning",
                confirmButtonColor: "#EC4899"
            });
            return;
        }

        $scope.fEmail = $scope.fEmail.trim();
        var isEmailLookup = $scope.fEmail.includes('@');
        var request = isEmailLookup
            ? IsabellaCateringWebAppService.verifyEmailCreds($scope.fEmail)
            : IsabellaCateringWebAppService.verifyClientCreds(null, $scope.fEmail);

        request.then(function (returnedData) {
            var result = returnedData.data || {};

            if (result.success) {
                Swal.fire({
                    title: "Email Sent!",
                    text: "Please check your e-mail for the Reset Password Link.",
                    icon: "success",
                    confirmButtonColor: "#EC4899"
                }).then(() => {
                    window.location.href = "/Main/LoginPage";
                });
            }
            else {
                Swal.fire({
                    title: result.hasActiveToken ? "Reset Link Already Sent" : "User Not Found",
                    text: result.message || (isEmailLookup
                        ? "The email you entered is not registered in our system."
                        : "The entry code you entered is not registered in our system."),
                    icon: result.hasActiveToken ? "info" : "error",
                    confirmButtonColor: "#EC4899"
                });

                resetAuthFields($scope.forgetPasswordForm, {
                    fEmail: ''
                }, {
                    forgetEmailCount: '0 / 50'
                });
            }
        });
    };


    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    function redirectToForgetPasswordWithAlert(message) {
        $scope.resetTokenState = { checked: true, valid: false };

        fireAuthAlert({
            title: "Reset Link Invalid",
            text: message,
            icon: "error",
            confirmButtonText: "Back to forgot password"
        }).then(() => {
            window.location.href = "/Main/ForgetPassPage";
        });
    }

    $scope.initializeChangePasswordPage = function () {
        $scope.resetTokenState = { checked: false, valid: false };

        if (!token) {
            redirectToForgetPasswordWithAlert("The reset link is incomplete. Please request a new one.");
            return;
        }

        IsabellaCateringWebAppService.verifyToken(token).then(function (returnedData) {
            if (returnedData.data && returnedData.data.valid) {
                $scope.resetTokenState = { checked: true, valid: true };
                return;
            }

            redirectToForgetPasswordWithAlert("This reset link is invalid or has expired. Please request a new one.");
        }).catch(function () {
            redirectToForgetPasswordWithAlert("We could not verify the reset link. Please request a new one.");
        });
    };

    //4gotpass
    $scope.changeForgotPassword = function () {
        if ($scope.changePasswordForm.$invalid || $scope.isPasswordMismatch($scope.changePasswordForm)) {
            return;
        }

        if (!$scope.resetTokenState.valid) {
            redirectToForgetPasswordWithAlert("This reset link is invalid or has expired. Please request a new one.");
            return;
        }

        IsabellaCateringWebAppService.changeForgotPasswordService(token, $scope.newPassword).then(function (returnedData) {
            if (returnedData.data && returnedData.data.success) {
                fireAuthAlert({
                    title: "Success!",
                    text: "Password Changed. Please log in again with your new password.",
                    icon: "success",
                    confirmButtonText: "Back to login"
                }).then(() => {
                    window.location.href = "/Main/LoginPage";
                });
            } else {
                fireAuthAlert({
                    title: "Error",
                    text: "Password not Changed. Please request a new link and try again later.",
                    icon: "error",
                    confirmButtonColor: "#EC4899"
                });
            }
        });
    }

    if (isCurrentPage("ChangePassPage")) {
        $scope.initializeChangePasswordPage();
    }

    const forgetPasswordToggle = document.getElementById('toggleForgetPassword')
    const forgetPassword = document.getElementById('forgetPWord')
    $scope.toggleShowForgetPassword = function () {
        if (!forgetPassword || !forgetPasswordToggle) {
            return;
        }

        if (forgetPassword.type === "password") {
            forgetPassword.type = "text";
            forgetPasswordToggle.innerHTML = "visibility";
        } else {
            forgetPassword.type = "password";
            forgetPasswordToggle.innerHTML = "visibility_off";
        }
    }

    const forgetCPasswordToggle = document.getElementById('toggleCForgetPassword')
    const forgetCPassword = document.getElementById('cForgetPWord')
    $scope.toggleShowCForgetPassword = function () {
        if (!forgetCPassword || !forgetCPasswordToggle) {
            return;
        }

        if (forgetCPassword.type === "password") {
            forgetCPassword.type = "text";
            forgetCPasswordToggle.innerHTML = "visibility";
        } else {
            forgetCPassword.type = "password";
            forgetCPasswordToggle.innerHTML = "visibility_off";
        }
    }

    //======================================================== PASSWORD RESET END =======================================================

    //======================================================== CUSTOMER VIEW START =======================================================

    $scope.getOrderInfo = function () {
        $scope.orderLoading = true;

        IsabellaCateringWebAppService.getCurrentSessionService()
            .then(function (returnedData) {
                if (returnedData.data.userID == '' && returnedData.data.permID == '') {

                    Swal.fire({
                        title: "Access Denied",
                        text: "Please log in first!",
                        icon: "error",
                        confirmButtonColor: "#EC4899"
                    });
                    $scope.redirectToLoginPage();
                    return;
                }

                if (returnedData.data.bookingID == '') {
                    Swal.fire({
                        title: "Access Denied",
                        text: "Select a booking First!",
                        icon: "error",
                        confirmButtonColor: "#EC4899"
                    });
                    $scope.redirectToBookingCalendarPage();
                    return;
                }

                var bookingID = parseInt(returnedData.data.bookingID, 10);
                if (!bookingID) {
                    throw new Error('No booking ID found in the current session.');
                }

                $scope.editBookingID = bookingID;
                return IsabellaCateringWebAppService.getBooking({ bookingID: bookingID })
                    .then(function (res) {
                        $scope.order = {
                            bookingID: res.data.bookingID,
                            clientID: res.data.clientID,
                            packageID: res.data.packageID,
                            bookingDate: convertDate(res.data.bookingDate),
                            prepVenue: res.data.prepVenue,
                            venue: res.data.venue,
                            eventSetTime: convertTime(res.data.eventSetTime),
                            eventTime: convertTime(res.data.eventTime),
                            ceremTime: convertTime(res.data.ceremTime),
                            eventMealTime: convertTime(res.data.eventMealTime),
                            dsgnTheme: res.data.dsgnTheme,
                            dsgnMotif: res.data.dsgnMotif,
                            dateCreated: convertDate(res.data.dateCreated),
                            dateUpdated: convertDate(res.data.dateUpdated),
                            progressOne: res.data.progressOne,
                            progressTwo: res.data.progressTwo,
                            progressThree: res.data.progressThree,
                            paxCount: res.data.paxCount,
                            addAdult: res.data.addAdult,
                            addKid: res.data.addKid,
                            requestCancel: res.data.requestCancel,
                            bookingCancelled: res.data.bookingCancelled,
                            cancelNote: res.data.cancelNote,
                            acceptedCancelNote: res.data.acceptedCancelNote,
                            customerNote: res.data.customerNote,
                            dateDeletion: convertDate(res.data.dateDeletion),
                            dateCancelled: convertDate(res.data.dateCancelled)
                        };

                        $scope.steps = [
                            { label: 'Planning', icon: '1', completed: $scope.order.progressOne == 1 },
                            { label: 'Preparation', icon: '2', completed: $scope.order.progressTwo == 1 },
                            { label: 'Event Day', icon: '3', completed: $scope.order.progressThree == 1 }
                        ];

                        return IsabellaCateringWebAppService.getBookingDetailsService(bookingID);
                    });
            })
            .then(function (detailsRes) {
                if (!detailsRes || !detailsRes.data || !detailsRes.data.success) {
                    $scope.client = null;
                    $scope.package = null;
                    return;
                }

                for (var x = 0; x < 4; x++) {
                    var propertyName = "preSides" + (x + 1);
                    var sideData = detailsRes.data[propertyName];
                    $scope.selectedSidesTypesID[x] = sideData?.sidesTypID ?? null;
                    $scope.selectedSidesTypes[x] = sideData?.sidesTypDesc ?? null;

                    var filtered = $scope.selectedSidesTypes.filter(function (val) {
                        return val !== null && val !== undefined && val !== '';
                    });
                    $scope.sidesType = filtered.join(', ');
                }

                for (var x = 0; x < 9; x++) {
                    var propertyName = "preSpecials" + (x + 1);
                    var sideData = detailsRes.data[propertyName];
                    $scope.selectedSpecialsTypesID[x] = sideData?.specialsTypID ?? null;
                    $scope.selectedSpecialsTypes[x] = sideData?.specialsTypDesc ?? null;

                    var filtered = $scope.selectedSpecialsTypes.filter(function (val) {
                        return val !== null && val !== undefined && val !== '';
                    });
                    $scope.specialsType = filtered.join(', ');
                }

                for (var x = 0; x < 3; x++) {
                    var propertyName = "preStaff" + (x + 1);
                    var sideData = detailsRes.data[propertyName];
                    $scope.selectedStaffTypesID[x] = sideData?.staffTypID ?? null;
                    $scope.selectedStaffTypes[x] = sideData?.staffTypDesc ?? null;

                    var filtered = $scope.selectedStaffTypes.filter(function (val) {
                        return val !== null && val !== undefined && val !== '';
                    });
                    $scope.staffType = filtered.join(', ');
                }

                for (var x = 0; x < 7; x++) {
                    var propertyName = "preEquip" + (x + 1);
                    var sideData = detailsRes.data[propertyName];
                    $scope.selectedEquipTypesID[x] = sideData?.equipTypID ?? null;
                    $scope.selectedEquipTypes[x] = sideData?.equipTypDesc ?? null;

                    var filtered = $scope.selectedEquipTypes.filter(function (val) {
                        return val !== null && val !== undefined && val !== '';
                    });
                    $scope.equipType = filtered.join(', ');
                }

                for (var x = 0; x < 7; x++) {
                    var propertyName = "preEntertainment" + (x + 1);
                    var sideData = detailsRes.data[propertyName];
                    $scope.selectedEntertainmentTypesID[x] = sideData?.entertainmentTypID ?? null;
                    $scope.selectedEntertainmentTypes[x] = sideData?.entertainmentTypDesc ?? null;

                    var filtered = $scope.selectedEntertainmentTypes.filter(function (val) {
                        return val !== null && val !== undefined && val !== '';
                    });
                    $scope.entertainmentType = filtered.join(', ');
                }

                for (var x = 0; x < 6; x++) {
                    var propertyName = "prePhoto" + (x + 1);
                    var sideData = detailsRes.data[propertyName];
                    $scope.selectedPhotoTypesID[x] = sideData?.photoTypID ?? null;
                    $scope.selectedPhotoTypes[x] = sideData?.photoTypDesc ?? null;

                    var filtered = $scope.selectedPhotoTypes.filter(function (val) {
                        return val !== null && val !== undefined && val !== '';
                    });
                    $scope.photoType = filtered.join(', ');
                }

                for (var x = 0; x < 5; x++) {
                    var propertyName = "preKeepsakes" + (x + 1);
                    var sideData = detailsRes.data[propertyName];
                    $scope.selectedKeepsakesTypesID[x] = sideData?.keepsakesTypID ?? null;
                    $scope.selectedKeepsakesTypes[x] = sideData?.keepsakesTypDesc ?? null;

                    var filtered = $scope.selectedKeepsakesTypes.filter(function (val) {
                        return val !== null && val !== undefined && val !== '';
                    });
                    $scope.keepsakesType = filtered.join(', ');
                }

                for (var x = 0; x < 3; x++) {
                    var propertyName = "preDebut" + (x + 1);
                    var sideData = detailsRes.data[propertyName];
                    $scope.selectedDebutTypesID[x] = sideData?.debutTypID ?? null;
                    $scope.selectedDebutTypes[x] = sideData?.debutTypDesc ?? null;

                    var filtered = $scope.selectedDebutTypes.filter(function (val) {
                        return val !== null && val !== undefined && val !== '';
                    });
                    $scope.debutType = filtered.join(', ');
                }

                var client = detailsRes.data.clients || {};
                var packageInfo = detailsRes.data.packages || {};
                var initial = detailsRes.data.payment || {};

                $scope.packageView = {
                    mainCourse: detailsRes.data.preMainCourse.mainCourseTypDesc,
                    sides: $scope.sidesType,
                    staples: packageInfo.incStaples,
                    buffet: packageInfo.incBftSet,
                    styling: packageInfo.incStyling,
                    tableSetup: packageInfo.incTableSet,
                    tableCenterpiece: detailsRes.data.preCenterPiece.centerPieceTypDesc,
                    seating: detailsRes.data.preSeating.seatingTypDesc,
                    specialTables: $scope.specialsType,
                    staff: $scope.staffType,
                    dinerware: packageInfo.incDnrWare,
                    backdrop: detailsRes.data.preBackdrop.backdropTypDesc,
                    entranceArch: detailsRes.data.preEntrance.entranceTypDesc,
                    couch:  detailsRes.data.preCouch.couchTypDesc,
                    equipments: $scope.equipType,
                    entertainment: $scope.entertainmentType,
                    photoOperations: $scope.photoType,
                    keepsakes: $scope.keepsakesType,
                    debutAdditionals: $scope.debutType
                }

                var packageItems = [
                    `Main Courses: ${$scope.packageView.mainCourse}`,
                    `Sides & Dessert: ${$scope.packageView.sides}`,
                    `Staples & Drinks: ${$scope.packageView.staples}`,
                    `Buffet Setup: ${$scope.packageView.buffet}`,
                    `Styling: ${$scope.packageView.styling}`,
                    `Table Setup: ${$scope.packageView.tableSetup}`,
                    `Table Centerpiece: ${$scope.packageView.tableCenterpiece}`,
                    `Seating: ${$scope.packageView.staff}`,
                    `Special Tables: ${$scope.packageView.specialTables}`,
                    `Staff: ${$scope.packageView.staff}`,
                    `Dinerware: ${$scope.packageView.dinerware}`,
                    `Backdrop: ${$scope.packageView.backdrop}`,
                    `Entrance Arch: ${$scope.packageView.entranceArch}`,
                    `Celebrant's Couch: ${$scope.packageView.couch}`,
                    `Equipments & Decor: ${$scope.packageView.equipments}`,
                    `Entertainment: ${$scope.packageView.entertainment}`,
                    `Photo Operations: ${$scope.packageView.photoOperations}`,
                    `Keepsakes: ${$scope.packageView.keepsakes}`,
                    `Debut Additionals: ${$scope.packageView.debutAdditionals}`
                ].filter(function (item) {
                    return item && item.toString().trim() !== '';
                });
                $scope.packageTypeInfo = detailsRes.data.packageType.packageTypDesc

                const formattedPrice = new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }).format(initial.amountDue);

                $scope.payment = {
                    paymentInitial: formattedPrice
                };

                $scope.client = {
                    eventName: client.eventName || 'Not set',
                    fullName: [client.cFName, client.cLName].filter(Boolean).join(' ') || 'Not set',
                    email: client.cEmail || 'Not set',
                    contact: client.cContact || 'Not set',
                    celebrantOne: [client.cCeleb1FName, client.cCeleb1LName].filter(Boolean).join(' ') || 'Not set',
                    celebrantTwo: [client.cCeleb2FName, client.cCeleb2LName].filter(Boolean).join(' ') || 'Not set'
                };

                $scope.package = {
                    title: packageInfo.packageID ? ('Package ' + packageInfo.packageID) : '',
                    items: packageItems
                };
            })
            .catch(function (err) {
                console.error('Error loading booking', err);
                $scope.order = null;
                $scope.client = null;
                $scope.package = null;
            }).finally(function () {
                $scope.orderLoading = false;
            });
            };

    $scope.requestCancellation = function () {
        if (!$scope.editBookingID) {
            Swal.fire({
                title: 'Error',
                text: 'No booking ID found.',
                icon: 'error',
                confirmButtonColor: '#EC4899'
            });
            return;
        }

        Swal.fire({
            title: 'Request Cancellation?',
            text: "Please provide a reason for your cancellation request:",
            input: 'textarea',
            inputPlaceholder: 'Enter your reason here...',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ec4899',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Submit Request',
            cancelButtonText: 'Cancel', width: '500px',
            padding: '2em',

            inputAttributes: {
                style: 'width:100%; max-width:100%; margin:0 auto; display:block; box-sizing:border-box;'
            }
        }).then(function (result) {
            if (result.isConfirmed) {
                IsabellaCateringWebAppService.requestCancellationService($scope.editBookingID, result.value).then(function (response) {
                    if (response.data.success) {
                        Swal.fire({
                            title: 'Requested!',
                            text: response.data.message || 'Cancellation request sent successfully.',
                            icon: 'success',
                            confirmButtonColor: '#ec4899'
                        }).then(function () {
                            $scope.getOrderInfo();
                        });
                    } else {
                        Swal.fire({
                            title: 'Error!',
                            text: response.data.message || 'Failed to send cancellation request.',
                            icon: 'error',
                            confirmButtonColor: '#ec4899'
                        });
                    }
                }).catch(function (error) {
                    Swal.fire({
                        title: 'Error!',
                        text: 'An error occurred while sending the request.',
                        icon: 'error',
                        confirmButtonColor: '#ec4899'
                    });
                });
            }
        });
    };

    $scope.approveCancellation = function () {
        Swal.fire({
            title: 'Approve Cancellation?',
            text: "Are you sure you want to approve this cancellation? This will mark the booking as cancelled.",
            input: 'textarea',
            inputPlaceholder: 'Enter admin note (optional)...',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, Approve',
            cancelButtonText: 'Close'
        }).then(function (result) {
            if (result.isConfirmed) {
                IsabellaCateringWebAppService.approveCancellationService($scope.editBookingID, result.value).then(function (response) {
                    if (response.data.success) {
                        Swal.fire('Approved!', response.data.message, 'success').then(function () {
                            $scope.getOrderInfo();
                        });
                    } else {
                        Swal.fire('Error!', response.data.message, 'error');
                    }
                });
            }
        });
    };

    $scope.rejectCancellation = function () {
        Swal.fire({
            title: 'Reject Cancellation?',
            text: "Please provide a reason for rejecting the cancellation request:",
            input: 'textarea',
            inputPlaceholder: 'Enter reason for rejection...',
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#4b5563',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Reject Request',
            cancelButtonText: 'Close'
        }).then(function (result) {
            if (result.isConfirmed) {
                IsabellaCateringWebAppService.rejectCancellationService($scope.editBookingID, result.value).then(function (response) {
                    if (response.data.success) {
                        Swal.fire('Rejected!', response.data.message, 'success').then(function () {
                            $scope.getOrderInfo();
                        });
                    } else {
                        Swal.fire('Error!', response.data.message, 'error');
                    }
                });
            }
        });
    };

            //future Dates
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    $scope.mindate = tomorrow.toISOString().split('T')[0];

    //======================================================== CUSTOMER VIEW END =======================================================

    //======================================================== ADMIN VIEW END =======================================================

    $scope.printBookingPDF = function () {
        var year = new Date().getFullYear(); 
        

        var dd = {
            pageSize: 'A4',
            pageMargins: [40, 50, 40, 50],

            content: [
                // --- HEADER ---

                COMPANY_LOGO
                    ? {
                        image: COMPANY_LOGO,
                        width: 150,
                        alignment: 'center',
                        margin: [0, 0, 0, 0]
                    }
                    : { text: '', width: 150 },
                
                {
                    text: COMPANY_NAME,
                    style: 'contact',
                    alignment: 'center'
                },
                {
                    text: COMPANY_ADDRESS,
                    style: 'contact',
                    alignment: 'center'
                },
                {
                    text: COMPANY_CONTACT,
                    style: 'contact',
                    alignment: 'center',
                    margin: [0, 0, 0, 15]
                },

                // --- ATTENTION ---
                {
                    text: [
                        { text: 'Attention: ', bold: true },
                        $scope.client.fullName || '______________________________'
                    ],
                    margin: [0, 10, 0, 2]
                },
                {
                    text: $scope.client.email || '____________________________________________',
                    margin: [0, 0, 0, 15]
                },

                // --- AGREEMENT ---
                {
                    text: 'THIS AGREEMENT (the “Agreement”) is made and entered into this ____ day of ________, ' +
                        (year || '______') +
                        ', by and between Isabella Events Management and Catering(“Caterer”) and ' +
                        ($scope.client.fullName || '______________________') +
                        ' (“Client”).',
                    style: 'paragraph'
                },

                {
                    text: 'WHEREAS, Customer desires to contract for an experienced caterer for an upcoming event. Details as follows:',
                    style: 'paragraph',
                    margin: [0, 10, 0, 10]
                },

                // --- EVENT DETAILS ---
                {
                    text: [
                        { text: 'Event: ', bold: true }, ($scope.client.eventName || '__________________') + '\n',
                        { text: '1st Celebrant: ', bold: true }, ($scope.client.celebrantOne || '__________________') + '\n',
                        { text: '2nd Celebrant: ', bold: true }, ($scope.client.celebrantTwo || '__________________') + '\n',
                        { text: 'Theme: ', bold: true }, ($scope.order.dsgnTheme || 'TBA') + '\n',
                        { text: 'Motif: ', bold: true }, ($scope.order.dsgnMotif || 'TBA') + '\n',
                        { text: 'Venue Preparation: ', bold: true }, ($scope.order.prepVenue || '__________________') + '\n',
                        { text: 'Event Date: ', bold: true }, ($scope.order.bookingDate || '__________________') + '\n',
                        { text: 'Event Time: ', bold: true }, ($scope.order.eventTime || '__________________') + '\n',
                        { text: 'Venue: ', bold: true }, ($scope.order.venue || '__________________') + '\n',
                        { text: 'Ceremony Time: ', bold: true }, ($scope.order.ceremTime || 'TBA') + '\n',
                        { text: 'Venue: ', bold: true }, ($scope.order.venue || '__________________') + '\n',
                        { text: 'Set-up Time: ', bold: true }, ($scope.order.eventSetTime || '__________________') + '\n',
                        { text: 'Meal Time: ', bold: true }, ($scope.order.eventMealTime || 'TBD') + '\n',
                        { text: 'Package Avail: ', bold: true },
                        ($scope.packageTypeInfo || 'High Class Platinum Wedding Package') +
                        ' (' + ($scope.order.paxCount || '100') + ' pax - Adult)\n'
                    ],
                    style: 'details'
                },

                // --- REMOVALS ---
                {
                    text: [
                        { text: 'Note: ', italics: true },
                        $scope.order.bookingNote
                    ],
                    style: 'small',
                    margin: [0, 5, 0, 10]
                },

                // --- TOTAL ---
                {
                    text: 'Package Deal: PHP ' + ($scope.payment.paymentInitial),
                    style: 'total'
                },

                // --- INCLUSIONS ---
                {
                    text: '\nPackage Inclusions:',
                    style: 'section'
                },
                {
                    text: [
                        `   Main Courses: ${$scope.packageView.mainCourse}\n`,
                        `   Sides & Dessert: ${$scope.packageView.sides}\n`,
                        `   Staples & Drinks: ${$scope.packageView.staples}\n`,
                        `   Buffet Setup: ${$scope.packageView.buffet}\n`,
                        `   Styling: ${$scope.packageView.styling}\n`,
                        `   Table Setup: ${$scope.packageView.tableSetup}\n`,
                        `   Table Centerpiece: ${$scope.packageView.tableCenterpiece}\n`,
                        `   Seating: ${$scope.packageView.staff}\n`,
                        `   Special Tables: ${$scope.packageView.specialTables}\n`,
                        `   Staff: ${$scope.packageView.staff}\n`,
                        `   Dinerware: ${$scope.packageView.dinerware}\n`,
                        `   Backdrop: ${$scope.packageView.backdrop}\n`,
                        `   Entrance Arch: ${$scope.packageView.entranceArch}\n`,
                        `   Celebrant's Couch: ${$scope.packageView.couch}\n`,
                        `   Equipments & Decor: ${$scope.packageView.equipments}\n`,
                        `   Entertainment: ${$scope.packageView.entertainment}\n`,
                        `   Photo Operations: ${$scope.packageView.photoOperations}\n`,
                        `   Keepsakes: ${$scope.packageView.keepsakes}\n`,
                        `   Debut Additionals: ${$scope.packageView.debutAdditionals}\n`
                    ],
                    style: 'details'
                },

                // --- SIGNATURES ---
                {
                    margin: [0, 40, 0, 0],
                    columns: [
                        {
                            stack: [
                                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1 }] },
                                { text: 'Client Signature', margin: [0, 5, 0, 0] }
                            ]
                        },
                        {
                            stack: [
                                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1 }] },
                                { text: 'Caterer Representative', margin: [0, 5, 0, 0] }
                            ],
                            alignment: 'right'
                        }
                    ]
                }
            ],

            styles: {
                logo: { fontSize: 22, bold: true, color: '#ec4899' },
                subLogo: { fontSize: 12, italics: true },
                verse: { fontSize: 9, italics: true },

                contact: { fontSize: 9 },

                paragraph: { fontSize: 10, lineHeight: 1.4 },
                details: { fontSize: 10, lineHeight: 1.3 },

                section: { fontSize: 12, bold: true },
                total: { fontSize: 12, bold: true },

                small: { fontSize: 9, italics: true }
            }
        };

        pdfMake.createPdf(dd).download('file.pdf');
    }

    

    //======================================================== ADMIN VIEW END =======================================================



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

        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    }

    //=================================================== DATE & TIME CONVERSION END ===================================================

    //===================================================== BOOKING CALENDAR START =====================================================
    const datepickerContainer = document.getElementById('datepicker-container');
    const daysContainer = document.getElementById('days-container');
    const currentMonthElement = document.getElementById('currentMonth');

    let currentDate = new Date();
    let selectedDate = null;
    let hasResolvedInitialCalendarSelection = false;
    let activeCalendarRequestId = 0;
    let activeCalendarSearchRequestId = 0;
    let highlightedBookingId = null;
    let pendingCalendarSelection = null;
    let calendarSearchDebounceId = null;
    let calendarSearchCloseTimer = null;
    let calendarSearchPreviewOrigin = null;
    let livePreviewDateKey = null;
    let livePreviewBookingId = null;
    let calendarSearchDropdownUpdateToken = null;

    $scope.calendarSearchResults = [];
    $scope.calendarSearchOpen = false;
    $scope.calendarSearchLoading = false;
    $scope.livePreviewBookingId = null;

    function getCalendarDateKey(value) {
        const date = resolveSearchDate(value);
        if (!date) {
            return "";
        }

        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    }

    function clearCalendarDaySelection() {
        document.querySelectorAll('#days-container .calendar-day').forEach(function (day) {
            day.classList.remove('selected-day');
        });

        document.querySelectorAll('#days-container .calendar-day .date-block').forEach(function (dateBlock) {
            dateBlock.classList.remove('bg-[#EC4899]', 'text-white', 'selected');
        });

        document.querySelectorAll('#days-container .calendar-event-card').forEach(function (eventCard) {
            eventCard.classList.remove('calendar-event-card--active');
        });

        document.querySelectorAll('#days-container .calendar-day').forEach(function (day) {
            day.classList.remove('is-search-preview');
        });
    }

    function applyCalendarSelection(dateKey, bookingId, shouldScroll, isPreview) {
        if (!dateKey) {
            return false;
        }

        selectedDate = dateKey;
        highlightedBookingId = bookingId == null ? null : String(bookingId);
        clearCalendarDaySelection();

        let matchedDay = null;
        document.querySelectorAll('#days-container .calendar-day').forEach(function (day) {
            if (day.dataset && day.dataset.date === dateKey) {
                matchedDay = day;
            }
        });

        if (!matchedDay) {
            return false;
        }

        if (isPreview) {
            matchedDay.classList.add('is-search-preview');
        }

        matchedDay.classList.add('selected-day');
        const dateBlock = matchedDay.querySelector('.date-block');
        if (dateBlock) {
            dateBlock.classList.add('bg-[#EC4899]', 'text-white', 'selected');
        }

        if (highlightedBookingId) {
            matchedDay.querySelectorAll('.calendar-event-card').forEach(function (eventCard) {
                if (eventCard.dataset && eventCard.dataset.bookingId === highlightedBookingId) {
                    eventCard.classList.add('calendar-event-card--active');
                }
            });
        }

        if (shouldScroll) {
            matchedDay.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        return true;
    }

    function cloneCurrentCalendarDate() {
        return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    }

    function beginCalendarSearchPreview() {
        if (calendarSearchPreviewOrigin) {
            return;
        }

        calendarSearchPreviewOrigin = {
            currentDate: cloneCurrentCalendarDate(),
            selectedDate: selectedDate,
            highlightedBookingId: highlightedBookingId
        };
    }

    function resetCalendarSearchPreviewState() {
        calendarSearchPreviewOrigin = null;
        livePreviewDateKey = null;
        livePreviewBookingId = null;
        $scope.livePreviewBookingId = null;
    }

    function restoreCalendarSearchPreviewOrigin() {
        if (!calendarSearchPreviewOrigin) {
            livePreviewDateKey = null;
            livePreviewBookingId = null;
            return;
        }

        const origin = calendarSearchPreviewOrigin;
        currentDate = new Date(origin.currentDate.getFullYear(), origin.currentDate.getMonth(), 1);
        selectedDate = origin.selectedDate;
        highlightedBookingId = origin.highlightedBookingId;
        livePreviewDateKey = null;
        livePreviewBookingId = null;
        resetCalendarSearchPreviewState();
        queueCalendarSelection(selectedDate ? {
            bookingID: highlightedBookingId,
            dateKey: selectedDate
        } : null);
        $scope.renderCalendar();
    }

    function commitCalendarSelectionState() {
        resetCalendarSearchPreviewState();
    }

    function queueCalendarSelection(selection) {
        pendingCalendarSelection = selection && selection.dateKey ? {
            bookingID: selection.bookingID,
            dateKey: selection.dateKey
        } : null;
    }

    function applyPendingCalendarSelection(shouldScroll) {
        if (!pendingCalendarSelection) {
            return;
        }

        const isPreviewSelection = pendingCalendarSelection.dateKey === livePreviewDateKey &&
            String(pendingCalendarSelection.bookingID == null ? '' : pendingCalendarSelection.bookingID) === String(livePreviewBookingId == null ? '' : livePreviewBookingId);

        if (applyCalendarSelection(pendingCalendarSelection.dateKey, pendingCalendarSelection.bookingID, shouldScroll, isPreviewSelection)) {
            pendingCalendarSelection = null;
        }
    }

    function setCurrentCalendarMonth(value) {
        const date = resolveSearchDate(value);
        if (!date) {
            return false;
        }

        currentDate = new Date(date.getFullYear(), date.getMonth(), 1);
        return true;
    }

    function resolveInitialCalendarSelection() {
        if (hasResolvedInitialCalendarSelection) {
            return;
        }

        hasResolvedInitialCalendarSelection = true;

        if (selectedDate || pendingCalendarSelection || calendarSearchPreviewOrigin || livePreviewDateKey || livePreviewBookingId) {
            return;
        }

        const today = getCalendarToday();
        if (currentDate.getFullYear() !== today.getFullYear() || currentDate.getMonth() !== today.getMonth()) {
            return;
        }

        const todayDateKey = getCalendarDateKey(today);
        if (!todayDateKey || isPastCalendarDate(todayDateKey)) {
            return;
        }

        selectedDate = todayDateKey;
        highlightedBookingId = null;
    }

    function formatCalendarSearchResultLabel(result) {
        if (!result) {
            return "";
        }

        const parts = [];
        const title = result.eventName || `Booking #${result.bookingID || ''}`;

        parts.push(title);

        if (result.bookingVenue) {
            parts.push(result.bookingVenue);
        }

        const dateLabel = $scope.formatCalendarSearchResultDate(result.bookingDate);
        if (dateLabel) {
            parts.push(dateLabel);
        }

        const timeLabel = $scope.formatCalendarSearchResultTime(result.eventTime);
        if (timeLabel) {
            parts.push(timeLabel);
        }

        if (result.bookingID != null) {
            parts.push(`#${result.bookingID}`);
        }

        return parts.join(' | ');
    }

    function previewCalendarSearchResult(result) {
        if (!result) {
            restoreCalendarSearchPreviewOrigin();
            return;
        }

        const previewDateKey = result.dateKey || getCalendarDateKey(result.bookingDate);
        const previewBookingId = result.bookingID == null ? null : String(result.bookingID);

        if (!previewDateKey) {
            return;
        }

        beginCalendarSearchPreview();

        if (livePreviewDateKey === previewDateKey && livePreviewBookingId === previewBookingId) {
            return;
        }

        livePreviewDateKey = previewDateKey;
        livePreviewBookingId = previewBookingId;
        $scope.livePreviewBookingId = previewBookingId;

        queueCalendarSelection({
            bookingID: result.bookingID,
            dateKey: previewDateKey
        });

        if (setCurrentCalendarMonth(result.bookingDate || previewDateKey)) {
            $scope.renderCalendar();
            return;
        }

        applyPendingCalendarSelection(false);
    }

    function requestCalendarSearch(query) {
        if (IsabellaCateringWebAppService && typeof IsabellaCateringWebAppService.findbookingService === 'function') {
            return IsabellaCateringWebAppService.findbookingService(query);
        }

        return $http.get("/Main/findbooking", {
            params: { query: query }
        });
    }

    $scope.formatCalendarSearchResultDate = function (value) {
        return convertDate(value);
    };

    $scope.formatCalendarSearchResultTime = function (value) {
        return convertTime(value);
    };

    $scope.isCalendarSelectionUnavailable = function () {
        return !selectedDate || isPastCalendarDate(selectedDate);
    };

    function updateCalendarSearchDropdownPosition() {
        if (calendarSearchDropdownUpdateToken) {
            window.cancelAnimationFrame(calendarSearchDropdownUpdateToken);
        }

        calendarSearchDropdownUpdateToken = window.requestAnimationFrame(function () {
            calendarSearchDropdownUpdateToken = null;
            const searchInput = document.getElementById('searchCalendar');
            const searchDropdown = document.getElementById('bookingCalendarSearchDropdown');

            if (!searchInput || !searchDropdown || !$scope.calendarSearchOpen) {
                return;
            }

            const rect = searchInput.getBoundingClientRect();
            const viewportWidth = window.innerWidth || document.documentElement.clientWidth || rect.width;
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
            const gutter = 12;
            const gap = 8;
            const width = Math.max(220, Math.min(Math.round(rect.width), viewportWidth - (gutter * 2)));
            let left = Math.round(rect.left);

            if (left + width > viewportWidth - gutter) {
                left = viewportWidth - gutter - width;
            }

            if (left < gutter) {
                left = gutter;
            }

            const availableHeight = viewportHeight > 0
                ? Math.max(160, viewportHeight - Math.round(rect.bottom) - gap - gutter)
                : 288;

            searchDropdown.style.top = `${Math.round(rect.bottom + gap)}px`;
            searchDropdown.style.left = `${left}px`;
            searchDropdown.style.width = `${width}px`;
            searchDropdown.style.maxHeight = `${Math.min(320, availableHeight)}px`;
        });
    }

    window.addEventListener('resize', updateCalendarSearchDropdownPosition);
    window.addEventListener('scroll', updateCalendarSearchDropdownPosition, true);

    $scope.openCalendarSearchDropdown = function () {
        if (calendarSearchCloseTimer) {
            clearTimeout(calendarSearchCloseTimer);
        }

        if ($scope.searchState.calendar && ($scope.calendarSearchLoading || $scope.calendarSearchResults.length > 0)) {
            $scope.calendarSearchOpen = true;
            updateCalendarSearchDropdownPosition();
        }
    };

    $scope.scheduleCalendarSearchClose = function () {
        if (calendarSearchCloseTimer) {
            clearTimeout(calendarSearchCloseTimer);
        }

        calendarSearchCloseTimer = setTimeout(function () {
            $scope.$applyAsync(function () {
                $scope.calendarSearchOpen = false;
            });
        }, 150);
    };

    $scope.findbooking = function () {
        if (calendarSearchCloseTimer) {
            clearTimeout(calendarSearchCloseTimer);
        }

        if (calendarSearchDebounceId) {
            clearTimeout(calendarSearchDebounceId);
        }

        const query = normalizeSearchValue($scope.searchState.calendar);
        if (!query) {
            activeCalendarSearchRequestId++;
            $scope.calendarSearchLoading = false;
            $scope.calendarSearchOpen = false;
            $scope.calendarSearchResults = [];
            restoreCalendarSearchPreviewOrigin();
            return;
        }

        $scope.calendarSearchLoading = true;
        $scope.calendarSearchOpen = true;
        updateCalendarSearchDropdownPosition();

        const requestQuery = $scope.searchState.calendar;
        const requestId = ++activeCalendarSearchRequestId;
        calendarSearchDebounceId = setTimeout(function () {
            requestCalendarSearch(requestQuery).then(function (response) {
                if (requestId !== activeCalendarSearchRequestId ||
                    normalizeSearchValue($scope.searchState.calendar) !== normalizeSearchValue(requestQuery)) {
                    return;
                }

                const results = response.data && response.data.success
                    ? (response.data.bookingData || [])
                    : [];

                results.forEach(function (result) {
                    result.searchLabel = formatCalendarSearchResultLabel(result);
                });

                $scope.$applyAsync(function () {
                    $scope.calendarSearchResults = results;
                    $scope.calendarSearchLoading = false;
                    $scope.calendarSearchOpen = true;
                });
                updateCalendarSearchDropdownPosition();

                if (results.length > 0) {
                    previewCalendarSearchResult(results[0]);
                } else {
                    restoreCalendarSearchPreviewOrigin();
                }
            }).catch(function () {
                if (requestId !== activeCalendarSearchRequestId ||
                    normalizeSearchValue($scope.searchState.calendar) !== normalizeSearchValue(requestQuery)) {
                    return;
                }

                $scope.$applyAsync(function () {
                    $scope.calendarSearchResults = [];
                    $scope.calendarSearchLoading = false;
                    $scope.calendarSearchOpen = true;
                });
                updateCalendarSearchDropdownPosition();

                restoreCalendarSearchPreviewOrigin();
            });
        }, 250);
    };

    $scope.selectCalendarSearchResult = function (result, $event) {
        if ($event) {
            $event.preventDefault();
            $event.stopPropagation();
        }

        if (!result) {
            return;
        }

        if (calendarSearchCloseTimer) {
            clearTimeout(calendarSearchCloseTimer);
        }

        const dateKey = result.dateKey || getCalendarDateKey(result.bookingDate);
        queueCalendarSelection({
            bookingID: result.bookingID,
            dateKey: dateKey
        });

        highlightedBookingId = result.bookingID == null ? null : String(result.bookingID);
        $scope.livePreviewBookingId = highlightedBookingId;
        $scope.searchState.calendar = result.searchLabel || formatCalendarSearchResultLabel(result);
        $scope.calendarSearchOpen = false;
        $scope.calendarSearchResults = [];
        commitCalendarSelectionState();

        if (setCurrentCalendarMonth(result.bookingDate || dateKey)) {
            $scope.renderCalendar();
            return;
        }

        applyPendingCalendarSelection(true);
    };

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
        if (!daysContainer || !currentMonthElement) {
            return;
        }

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const requestId = ++activeCalendarRequestId;
        $scope.calendarLoading = true;
        resolveInitialCalendarSelection();

        currentMonthElement.textContent = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        daysContainer.innerHTML = '';
        updateCalendarSearchDropdownPosition();
        // Get the first day of the month (0 = Sunday, 1 = Monday, etc.)
        let firstDayOfMonth = new Date(year, month, 1).getDay();
        // Adjust for Monday as first day (0 = Sunday, 6 = Monday)
        //firstDayOfMonth = firstDayOfMonth === 6 ? 0 : firstDayOfMonth;

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        // Add empty cells for days before the first day of the month
        for (let i = (daysInPrevMonth - firstDayOfMonth + 1); i <= daysInPrevMonth; i++) {
            daysContainer.innerHTML += `<div class="toPrev border-gray-400 border"><div class="text-gray-400 flex h-[38px] w-[38px] items-center justify-center rounded-md border-2 border-transparent hover:border-gray-400 hover:border-2">${i}</div></div>`;
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayString = `${year}-${month + 1}-${i}`;
            const isSelectedDay = selectedDate === dayString;
            const isPastDay = isPastCalendarDate(new Date(year, month, i));

            const dayClass = isPastDay
                ? "flex h-[38px] w-[38px] items-center justify-center rounded-md border-2 border-transparent bg-transparent text-gray-400"
                : isSelectedDay
                ? "flex h-[38px] w-[38px] items-center justify-center rounded-md border-2 border-[#D6418B] hover:bg-[#EC4899] hover:border-2 hover:border-[#D6418B] hover:text-white bg-[#EC4899] text-white"
                : "flex h-[38px] w-[38px] items-center justify-center rounded-md border-2 border-transparent hover:border-[#D6418B] hover:border-2 ";

            const selectedDayClass = isSelectedDay && !isPastDay ? "selected-day" : "";
            const pastDayClass = isPastDay ? "is-past-day" : "";
            daysContainer.innerHTML += `<div class="calendar-day border-gray-400 border ${selectedDayClass} ${pastDayClass}" data-date="${dayString}"><div class="date-block ${dayClass}" data-date="${dayString}">${i}</div><div class="current w-full bg-white rounded-md border shadow-inner" data-date="${dayString}"></div></div>`;
        }

        for (let i = 1; i <= (42 - daysInMonth - firstDayOfMonth); i++) {
            daysContainer.innerHTML += `<div class="toNext border-gray-400 border"><div class="text-gray-400 flex h-[38px] w-[38px] items-center justify-center rounded-md border-2 border-transparent hover:border-gray-400 hover:border-2">${i}</div></div>`;
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

        IsabellaCateringWebAppService.getCalendarMonthService(year, month + 1).then(function (bookingResponse) {
            if (requestId !== activeCalendarRequestId) {
                return;
            }

            if (!bookingResponse.data.success) {
                $scope.calendarLoading = false;
                Swal.fire({
                    title: "Error",
                    text: bookingResponse.data.message || "Could not load calendar bookings.",
                    icon: "error"
                });
                return;
            }

            const bookingsByDate = {};
            (bookingResponse.data.bookingData || []).forEach(function (item) {
                if (!bookingsByDate[item.dateKey]) {
                    bookingsByDate[item.dateKey] = [];
                }

                bookingsByDate[item.dateKey].push(item);
            });

            document.querySelectorAll('.current').forEach(function (day) {
                const bookings = bookingsByDate[day.dataset.date] || [];

                bookings.forEach(function (item) {
                    const eventCard = document.createElement("div");
                    eventCard.className = "calendar-event-card mb-1 mx-1 flex cursor-pointer items-center justify-left bg-[#EC4899] hover:bg-[#D6418B] text-white py-2 px-4 border-b-4 border-[#D6418B] hover:border-[#EC4899] rounded-md w-100 placeholder-white text-xs";
                    eventCard.innerText = `${item.eventName || 'Untitled Event'}, (${item.bookingVenue || 'No Venue'}), ${convertTime(item.eventTime)}`;
                    eventCard.dataset.date = day.dataset.date;
                    eventCard.dataset.bookingId = item.bookingID;

                    eventCard.addEventListener("click", function () {
                        IsabellaCateringWebAppService.setBookingViewService(item.bookingID).then(function (returnedData) {
                            if (returnedData.data.success) {
                                $scope.redirectToAdminViewPage();
                            } else {
                                Swal.fire({
                                    title: "Error",
                                    text: "Could not load calendar bookings.",
                                    icon: "error",
                                    confirmButtonColor: "#EC4899"
                                });
                            }
                        });
                    });

                    day.appendChild(eventCard);
                });
            });

            if (pendingCalendarSelection) {
                applyPendingCalendarSelection(Boolean(livePreviewDateKey === null));
            } else if (selectedDate && !isPastCalendarDate(selectedDate)) {
                applyCalendarSelection(selectedDate, highlightedBookingId, false, selectedDate === livePreviewDateKey);
            } else if (selectedDate && isPastCalendarDate(selectedDate)) {
                selectedDate = null;
                highlightedBookingId = null;
            }

            $scope.calendarLoading = false;
            updateCalendarSearchDropdownPosition();
        }).catch(function () {
            if (requestId !== activeCalendarRequestId) {
                return;
            }

            $scope.calendarLoading = false;
            Swal.fire({
                title: "Error",
                text: "Could not load calendar bookings.",
                icon: "error",
                confirmButtonColor: "#EC4899"
            });
        });

        document.querySelectorAll('#days-container .calendar-day').forEach(day => {
            if (day.dataset && day.dataset.date) {
                day.addEventListener('click', function () {
                    if (isPastCalendarDate(this.dataset.date)) {
                        return;
                    }

                    commitCalendarSelectionState();
                    applyCalendarSelection(this.dataset.date, null, false, false);
                });
            }
        });
    }

    $scope.addBooking = function () {
        if (!selectedDate) {
            Swal.fire({
                title: "Select a Date",
                text: "Please choose an available calendar date first.",
                icon: "warning",
                confirmButtonColor: "#EC4899"
            });
            return;
        }

        if (isPastCalendarDate(selectedDate)) {
            Swal.fire({
                title: "Date Unavailable",
                text: "Past dates can no longer be used for new bookings.",
                icon: "warning",
                confirmButtonColor: "#EC4899"
            });
            return;
        }

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
    $scope.showIfAdd = true;
    $scope.showAdd = function () {
        if ($scope.newPayment.paymentType == "Additional")
            $scope.showIfAdd = false;
        else
            $scope.showIfAdd = true;
    }
    $scope.showAddEdit = function () {
        if ($scope.editData.paymentType == "Additional")
            $scope.showIfAdd = false;
        else
            $scope.showIfAdd = true;
    }

    $scope.filteredDuePayments = [];
    $scope.filteredPaymentGroups = [];

    //date formatting
    function parseDate(dateStr) {
        if (!dateStr) return null;
        if (dateStr instanceof Date) return dateStr;
        if (typeof dateStr !== 'string') return null;
        var milli = parseInt(dateStr.replace(/\/Date\(([-+]?\d+)\)\//, '$1'));
        return isNaN(milli) ? null : new Date(milli);
    }

    function toDateString(raw) {
        if (!raw) return null;
        var milli = parseInt(String(raw).replace(/\/Date\(([-+]?\d+)\)\//, '$1'));
        if (isNaN(milli)) return null;
        var d = new Date(milli);
        var yyyy = d.getFullYear();
        var mm = String(d.getMonth() + 1).padStart(2, '0');
        var dd = String(d.getDate()).padStart(2, '0');
        return yyyy + '-' + mm + '-' + dd;
    }

    function parseDateLocal(str) {
        if (!str || typeof str !== 'string') return null;
        var parts = str.split('-');
        if (parts.length !== 3) return null;
        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }

    function diffDaysFromToday(dateStr) {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var d = parseDateLocal(dateStr);
        if (!d) return null;
        return Math.ceil((d - today) / (1000 * 60 * 60 * 24));
    }

    function computeStatus(amountDue, amountPaid) {
        var due = Number(amountDue) || 0;
        var paid = Number(amountPaid) || 0;
        if (paid <= 0) return 'Unpaid';
        if (paid < due) return 'Partially Paid';
        return 'Paid';
    }

    function validatePaymentForm(data, isDueDate) {
        //var due = Number(data.amountDue) || 0;
        //var paid = Number(data.amount) || 0;
        //if (!data.paymentType) return 'Please select a Payment Type.';
        //if (due <= 0) return 'Please enter an Amount Due greater than 0.';
        //if (!isDueDate) return 'Please select a Due Date.';
        //if (paid > due) return 'Amount Paid cannot exceed Amount Due.';
        return null;
    }

    //when amountPaid > amountDue, it forces amount === amountDue
    $scope.clampAmountPaid = function (source) {
        if ($scope.newPayment && $scope.newPayment.paymentType == "Payment") {
            if (!source) return;
            var due = Number(source.amountDue) || 0;
            var paid = Number(source.amount);
            if (!isNaN(paid) && paid > due) {
                source.amount = due;
            }
        }
        if ($scope.editData && $scope.editData.paymentType == "Payment") {
            if (!source) return;
            var due = Number(source.amountDue) || 0;
            var paid = Number(source.amount);
            if (!isNaN(paid) && paid > due) {
                source.amount = due;
            }
        }
    };

    //for dropdown
    function buildGroupedPayments(payments) {
        if (!payments || !Array.isArray(payments)) return [];
        var map = {};
        payments.forEach(function (p) {
            var bID = p.bookingID;
            if (!map[bID]) {
                map[bID] = {
                    bookingID: bID,
                    payments: [],
                    expanded: false,
                    totalDue: 0,
                    totalPaid: 0,
                    totalRemBalance: 0,
                    unpaidCount: 0,
                    partialCount: 0,
                    hasUnpaid: false,
                    overallStatus: '',
                    nextDueDate: null,
                    dateCreated: p.dateCreated,
                    dateUpdated: p.dateUpdated,
                };
            }
            var g = map[bID];
            g.payments.push(p);
            var maxTransactionNum = 0
            var due = Number(p.amountDue) || 0;
            var amount = Number(p.amount) || 0;
            g.totalRemBalance = p.remainingBalance
            if (p.transactionNum > maxTransactionNum) {
                maxTransactionNum = p.transactionNum
                g.totalRemBalance = p.remainingBalance
            }
            if (p.paymentType == 'Initial') {
                g.totalDue += due
            } else if (p.paymentType == 'Additional') {
                g.totalDue += amount
            } else if (p.paymentType == 'Payment') {
                g.totalPaid += amount
            }
            //g.totalDue += p.amountDue != null ? Number(p.amountDue) : 0;
            
            if (g.totalRemBalance == 0) {
                g.overallStatus = 'Fully Paid'
            } else if (g.totalDue == g.totalRemBalance) {
                g.overallStatus = 'Unpaid'
                g.hasUnpaid = true
            } else if(g.totalRemBalance < 0){
                g.overallStatus = 'With Excess'
            }else{
                g.overallStatus = 'Partially Paid'
                g.hasUnpaid = true
            }
            g.totalPaid = g.totalDue - g.totalRemBalance;
            if (p.dateUpdated && (!g.dateUpdated || new Date(p.dateUpdated) > new Date(g.dateUpdated))) {
                g.dateUpdated = p.dateUpdated;
            }
            
        });

        return Object.values(map).map(function (g) {
            g.unpaidCount = g.payments.filter(function (p) { return p.paymentStatus === 'Unpaid'; }).length;
            g.partialCount = g.payments.filter(function (p) { return p.paymentStatus === 'Partially Paid'; }).length;
            var paidCount = g.payments.filter(function (p) { return p.paymentStatus === 'Paid'; }).length;
            var total = g.payments.length;

            if (g.unpaidCount === total) {
                //g.overallStatus = 'Unpaid';
                g.hasUnpaid = true;
            } else if (paidCount === total) {
                //g.overallStatus = 'Fully Paid';
                g.hasUnpaid = false;
                g.unpaidCount = 0;
                g.partialCount = 0;
            } else {
                //g.overallStatus = 'Partially Paid';
                g.hasUnpaid = g.unpaidCount > 0 || g.partialCount > 0;
            }

            //var typeOrder = { 'Initial': 1, 'Full Payment': 2, 'Additional': 3 };
            //g.payments.sort(function (a, b) {
            //    return (typeOrder[a.paymentType] || 99) - (typeOrder[b.paymentType] || 99);
            //});

            var pending = g.payments.filter(function (p) { return p.paymentStatus !== 'Paid'; });
            if (pending.length > 0) {
                pending.sort(function (a, b) { return new Date(a.dueDate) - new Date(b.dueDate); });
                g.nextDueDate = pending[0].dueDate;
            } else {
                g.nextDueDate = null;
            }

            return g;
        });
    }

    //for due payments summary
    $scope.getSummary = function () {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var counts = { unpaid: 0, partial: 0, overdue: 0, excess:0, 'Initial': 0, 'Payment': 0, 'Additional': 0 };

        $scope.getDuePaymentsFiltered().forEach(function (p) {
            if (p.paymentStatus == 'Complete') {
                return counts;
            }
            var paid = Number(p.amount) || 0;
            var due = Number(p.amountDue) || 0;
            var remBal = Number(p.remainingBalance) || 0;
            var dueDate = new Date(p.dueDate);
            dueDate.setHours(0, 0, 0, 0);

            if (dueDate < today) counts.overdue++;
            if (due == remBal) counts.unpaid++;
            if (paid > 0 && paid < due) counts.partial++;
            if (remBal < 0) counts.excess++;

            var type = (p.paymentType || '').trim();
            if (counts[type] !== undefined) counts[type]++;
        });
        return counts;
    };

    $scope.getPaymentData = function () {
        $scope.paymentLoading = true;

        IsabellaCateringWebAppService.getPaymentDataService()
            .then(function (returnedData) {
                $scope.paymentData = returnedData.data.map(function (payment) {
                    var rawDue = payment.dueDate != null ? payment.dueDate : payment.DueDate;
                    return {
                        paymentID: payment.paymentID != null ? payment.paymentID : payment.PaymentID,
                        bookingID: payment.bookingID != null ? payment.bookingID : payment.BookingID,
                        amountDue: payment.amountDue != null ? payment.amountDue : payment.AmountDue,
                        amount: payment.amount != null ? payment.amount : payment.AmountPaid,
                        remainingBalance: payment.remainingBalance != null ? payment.remainingBalance : payment.remainingBalance,
                        transactionNum: payment.transactionNum != null ? payment.transactionNum : payment.transactionNum,
                        paymentType: payment.paymentType != null ? payment.paymentType : payment.PaymentType,
                        paymentStatus: payment.paymentStatus != null ? payment.paymentStatus : payment.PaymentStatus,
                        dueDate: toDateString(rawDue),
                        dateCreated: parseDate(payment.dateCreated != null ? payment.dateCreated : payment.DateCreated),
                        dateUpdated: parseDate(payment.dateUpdated != null ? payment.dateUpdated : payment.DateUpdated),
                    };
                });
                $scope.groupedPayments = buildGroupedPayments($scope.paymentData);
                $scope.getSummary();
                applyDuePaymentsSearch();
                applyPaymentsSearch();
            })
            .catch(function (error) {
                console.error('Error loading payments', error);
                $scope.paymentData = [];
                $scope.groupedPayments = [];
                applyDuePaymentsSearch();
                applyPaymentsSearch();
            })
            .finally(function () {
                $scope.paymentLoading = false;
            });
    };
    $scope.showEditPaymentModal = false;
    $scope.editData = {};
    if (isPaymentReminderPage) {
        $scope.getPaymentData();
    }

    //validations for due date
    $scope.isUpcomingDue = function (payment) {
        if (!payment || payment.paymentStatus == 'Complete') return false;
        var paid = Number(payment.amount) || 0;
        var due = Number(payment.amountDue) || 0;
        if (paid >= due) return false;
        var diff = diffDaysFromToday(payment.dueDate);
        return diff !== null && diff <= 7;
    };

    $scope.isOverdue = function (payment) {
        if (!payment || payment.paymentStatus == 'Complete') return false;
        var diff = diffDaysFromToday(payment.dueDate);
        return diff !== null && diff < 0;
    };

    $scope.isDueSoon = function (payment) {
        if (!payment || payment.paymentStatus == 'Complete') return false;
        var diff = diffDaysFromToday(payment.dueDate);
        return diff !== null && diff >= 0 && diff <= 7;
    };

    $scope.groupNextDueDateIsOverdue = function (group) {
        if (!group || group.overallStatus == 'Fully Paid') return false;
        if (!group || !group.nextDueDate) return false;
        var diff = diffDaysFromToday(group.nextDueDate);
        return diff !== null && diff < 0;
    };

    $scope.groupNextDueDateIsSoon = function (group) {
        if (!group || group.overallStatus == 'Fully Paid') return false;
        if (!group || !group.nextDueDate) return false;
        var diff = diffDaysFromToday(group.nextDueDate);
        return diff !== null && diff >= 0 && diff <= 7;
    };

    $scope.toggleGroup = function (group) {
        if (!group) return;
        group.expanded = !group.expanded;
    };

    //create modal start
    //$scope.openCreatePaymentModal = function () {
    //    $scope.createPayment = {
    //        bookingID: '',
    //        paymentType: 'Down Payment',
    //        amountDue: null,
    //        amount: null,
    //        dueDate: '',
    //    };
    //    $scope.createRestrictions = {
    //        hasDownPayment: false,
    //        hasFullPayment: false
    //    };
    //    $scope.createPaymentLoading = false;
    //    $scope.availableBookings = [];

    //    IsabellaCateringWebAppService.getBookingsWithoutPayments()
    //        .then(function (res) {
    //            $scope.availableBookings = res.data;
    //        })
    //        .catch(function () {
    //            Swal.fire({
    //                title: 'Error',
    //                text: 'Could not load bookings.',
    //                icon: 'error',
    //                confirmButtonColor: "#EC4899"
    //            });
    //        });

    //    $scope.showCreatePaymentModal = true;
    //};

    $scope.onCreateBookingChanged = function () {
        var bID = Number($scope.createPayment.bookingID);

        if (!bID) {
            $scope.createRestrictions = { hasDownPayment: false, hasFullPayment: false };
            return;
        }

        var group = $scope.groupedPayments.find(function (g) {
            return g.bookingID === bID;
        });

        var existingTypes = group
            ? group.payments.map(function (p) { return p.paymentType; })
            : [];

        var hasDown = existingTypes.indexOf('Down Payment') !== -1;
        var hasFull = existingTypes.indexOf('Full Payment') !== -1;

        $scope.createRestrictions = {
            hasDownPayment: hasDown,
            hasFullPayment: hasFull
        };

        $scope.createPayment.paymentType = !hasDown ? 'Down Payment'
            : !hasFull ? 'Full Payment'
                : 'Additional';
    };

    $scope.computedCreatePaymentStatus = function () {
        if (!$scope.createPayment) return 'Unpaid';
        return computeStatus($scope.createPayment.amountDue, $scope.createPayment.amount);
    };

    $scope.closeCreatePaymentModal = function () {
        $scope.showCreatePaymentModal = false;
        $scope.createPaymentLoading = false;
        $scope.createPayment = {};
        $scope.createRestrictions = {};
    };

    $scope.submitCreatePayment = function () {
        var bID = Number($scope.createPayment.bookingID);

        if (!bID) {
            Swal.fire({
                title: 'Missing Field', text: 'Please select a Booking.', icon: 'warning',
                confirmButtonColor: "#EC4899"
            });
            return;
        }

        var err = validatePaymentForm($scope.createPayment, !!$scope.createPayment.dueDate);
        if (err) {
            Swal.fire({
                title: 'Validation Error', text: err, icon: 'warning',
                confirmButtonColor: "#EC4899"
            }); return;
        }

        var group = $scope.groupedPayments.find(function (g) { return g.bookingID === bID; });
        if (group) {
            var types = group.payments.map(function (p) { return p.paymentType; });
            if ($scope.createPayment.paymentType === 'Down Payment' && types.indexOf('Down Payment') !== -1) {
                Swal.fire({
                    title: 'Already Exists', text: 'A Down Payment already exists for this booking.', icon: 'warning',
                    confirmButtonColor: "#EC4899"
                });
                return;
            }
            if ($scope.createPayment.paymentType === 'Full Payment' && types.indexOf('Full Payment') !== -1) {
                Swal.fire({
                    title: 'Already Exists', text: 'A Full Payment already exists for this booking.', icon: 'warning',
                    confirmButtonColor: "#EC4899"
                });
                return;
            }
        }

        $scope.createPaymentLoading = true;

        IsabellaCateringWebAppService.addPaymentService({
            bookingID: bID,
            paymentType: $scope.createPayment.paymentType,
            amountDue: Number($scope.createPayment.amountDue),
            amount: Number($scope.createPayment.amount) || 0,
            paymentStatus: $scope.computedCreatePaymentStatus(),
            dueDate: $scope.createPayment.dueDate
        }).then(function (res) {
            if (res.data.success) {
                Swal.fire({
                    title: 'Created!', text: 'Payment created successfully.', icon: 'success',
                    confirmButtonColor: "#EC4899"
                });
                $scope.closeCreatePaymentModal();
                $scope.getPaymentData();
            } else {
                Swal.fire({ title: 'Error', text: res.data.message, icon: 'error' });
                $scope.createPaymentLoading = false;
            }
        }).catch(function () {
            Swal.fire({
                title: 'Server Error', text: 'Could not connect to the server.', icon: 'error',
                confirmButtonColor: "#EC4899"
            });
            $scope.createPaymentLoading = false;
        });
    };

    //add payment start
    $scope.openAddPaymentModal = function (bookingID) {
        var group = $scope.groupedPayments.find(function (g) { return g.bookingID === bookingID; });
        var existingTypes = group ? group.payments.map(function (p) { return p.paymentType; }) : [];
        var hasDown = existingTypes.indexOf('Down Payment') !== -1;
        var hasFull = existingTypes.indexOf('Full Payment') !== -1;
        var defaultType = !hasDown ? 'Down Payment' : !hasFull ? 'Full Payment' : 'Additional';

        IsabellaCateringWebAppService.loadBookingPaymentBalanceService(bookingID).then(function (res) {
            $scope.newPayment = {
                bookingID: bookingID,
                paymentType: "Payment",
                amountDue: Number(res.data.remainingBalance),
                amount: null,
                paymentStatus: false,
                dueDate: '',
            };
            $scope.addPaymentRestrictions = { hasDownPayment: hasDown, hasFullPayment: hasFull };
            $scope.showAddPaymentModal = true;
        });
    };

    $scope.closeAddPaymentModal = function () {
        $scope.showAddPaymentModal = false;
        $scope.addPaymentLoading = false;
        $scope.newPayment = {};
    };

    $scope.computedPaymentStatus = function () {
        if (!$scope.newPayment) return 'Unpaid';
        return computeStatus($scope.newPayment.amountDue, $scope.newPayment.amount);
    };

    $scope.submitAddPayment = function () {
        var err = validatePaymentForm($scope.newPayment, !!$scope.newPayment.dueDate);
        if (err) {
            Swal.fire({
                title: 'Validation Error', text: err, icon: 'warning',
                confirmButtonColor: "#EC4899"
            }); return;
        }

        //var group = $scope.groupedPayments.find(function (g) { return g.bookingID === $scope.newPayment.bookingID; });
        //if (group) {
        //    var types = group.payments.map(function (p) { return p.paymentType; });
        //    if ($scope.newPayment.paymentType === 'Down Payment' && types.indexOf('Down Payment') !== -1) {
        //        Swal.fire({
        //            title: 'Already Exists', text: 'A Down Payment already exists.', icon: 'warning',
        //            confirmButtonColor: "#EC4899"
        //        }); return;
        //    }
        //    if ($scope.newPayment.paymentType === 'Full Payment' && types.indexOf('Full Payment') !== -1) {
        //        Swal.fire({
        //            title: 'Already Exists', text: 'A Full Payment already exists.', icon: 'warning',
        //            confirmButtonColor: "#EC4899"
        //        }); return;
        //    }
        //}

        $scope.addPaymentLoading = true;
        IsabellaCateringWebAppService.addPaymentService({
            bookingID: $scope.newPayment.bookingID,
            paymentType: $scope.newPayment.paymentType,
            amount: Number($scope.newPayment.amount) || 0,
            paymentStatus: ($scope.newPayment.paymentStatus ? "Complete" : "Incomplete"),
            dueDate: $scope.newPayment.dueDate
        }).then(function (res) {
            if (res.data.success) {
                Swal.fire({
                    title: 'Saved!', text: 'Payment added successfully.', icon: 'success',
                    confirmButtonColor: "#EC4899"
                });
                $scope.closeAddPaymentModal();
                $scope.getPaymentData();
            } else {
                Swal.fire({
                    title: 'Error', text: res.data.message, icon: 'error',
                    confirmButtonColor: "#EC4899"
                });
                $scope.addPaymentLoading = false;
            }
        }).catch(function () {
            Swal.fire({
                title: 'Server Error', text: 'Could not connect to the server.', icon: 'error',
                confirmButtonColor: "#EC4899"
            });
            $scope.addPaymentLoading = false;
        });
    };

    //edit payment start
    $scope.editPayment = function (payment) {
        var copy = angular.copy(payment);
        
        if (copy.dueDate && typeof copy.dueDate === 'string') {
            var p = copy.dueDate.split('-');
            copy.dueDate = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
        }
        $scope.editData = copy;
        if (copy.paymentStatus == 'Complete') 
            $scope.editData.paymentStatus = true;
        else 
            $scope.editData.paymentStatus = false;
        $scope.clampAmountPaid($scope.editData);
        $scope.showEditPaymentModal = true;
        $scope.showAddEdit();
    };

    $scope.closeEditPaymentModal = function () {
        $scope.showEditPaymentModal = false;
        $scope.editPaymentLoading = false;
        $scope.editData = {};
    };

    $scope.computedEditPaymentStatus = function () {
        if (!$scope.editData) return 'Unpaid';
        return computeStatus($scope.editData.amountDue, $scope.editData.amount);
    };
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    $scope.submitEditPayment = function () {
        var err = validatePaymentForm($scope.editData, !!$scope.editData.dueDate);
        if (err) {
            Swal.fire({
                title: 'Validation Error', text: err, icon: 'warning',
                confirmButtonColor: "#EC4899"
            }); return;
        }

        $scope.editPaymentLoading = true;
        var d = $scope.editData.dueDate;
        var str = d.getFullYear() + '-'
            + String(d.getMonth() + 1).padStart(2, '0') + '-'
            + String(d.getDate()).padStart(2, '0');

        IsabellaCateringWebAppService.updatePaymentService({
            paymentID: $scope.editData.paymentID,
            bookingID: $scope.editData.bookingID,
            paymentType: $scope.editData.paymentType,
            amountDue: Number($scope.editData.amountDue),
            amount: Number($scope.editData.amount) || 0,
            paymentStatus: ($scope.editData.paymentStatus ? "Complete" : "Incomplete"),
            dueDate: str
        }).then(function (res) {
            if (res.data.success) {
                Swal.fire({
                    title: 'Updated!', text: res.data.message, icon: 'success',
                    confirmButtonColor: "#EC4899"
                });
                $scope.closeEditPaymentModal();
                $scope.getPaymentData();
            } else {
                Swal.fire({ title: 'Error', text: res.data.message, icon: 'error' });
                $scope.editPaymentLoading = false;
            }
        }).catch(function () {
            Swal.fire({
                title: 'Server Error', text: 'Could not connect to the server.', icon: 'error',
                confirmButtonColor: "#EC4899"
            });
            $scope.editPaymentLoading = false;
        });
    };

    $scope.refreshGroups = function () {
        $scope.groupedPayments = buildGroupedPayments($scope.paymentData);
        applyPaymentsSearch();
    };

    //delete payment
    $scope.deletePayment = function (payment) {
        Swal.fire({
            title: 'Delete Payment?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: "#EC4899",
            confirmButtonText: 'Yes, delete it'
        }).then(function (result) {
            if (!result.isConfirmed) return;
            $http.post('/Main/DeletePayment', { id: payment.paymentID })
                .then(function (res) {
                    if (res.data.success) {
                        Swal.fire({
                            title: 'Deleted!', text: res.data.message, icon: 'success',
                            confirmButtonColor: "#EC4899"
                        });
                        $scope.closeEditPaymentModal();
                        $scope.getPaymentData();
                    } else {
                        Swal.fire({
                            title: 'Error', text: res.data.message, icon: 'error',
                            confirmButtonColor: "#EC4899"
                        });
                    }
                }).catch(function () {
                    Swal.fire({
                        title: 'Server Error', text: 'Could not connect.', icon: 'error',
                        confirmButtonColor: "#EC4899"
                    });
                });
        });
    };

    //pagination & sorting
    function makePagination(cfg) {
        var state = {
            currentPage: 1,
            pageSize: cfg.defaultSize || 5,
            sortField: cfg.defaultSort || 'id',
            sortReverse: false,
            pageSizeOptions: [5, 10, 20]
        };

        function sort(list) {
            return list.slice().sort(function (a, b) {
                var av = a[state.sortField], bv = b[state.sortField];
                if (av == null) return 1;
                if (bv == null) return -1;
                if (typeof av === 'string') av = av.toLowerCase();
                if (typeof bv === 'string') bv = bv.toLowerCase();
                if (av < bv) return state.sortReverse ? 1 : -1;
                if (av > bv) return state.sortReverse ? -1 : 1;
                return 0;
            });
        }

        return {
            state: state,

            sortBy: function (field) {
                state.sortField = (state.sortField === field) ? state.sortField : field;
                state.sortReverse = (state.sortField === field) ? !state.sortReverse : false;
                state.sortField = field;
                state.currentPage = 1;
            },

            getPage: function (filtered) {
                var total = this.getTotalPages(filtered);
                if (state.currentPage > total) state.currentPage = total;
                if (state.currentPage < 1) state.currentPage = 1;
                var sorted = sort(filtered);
                var start = (state.currentPage - 1) * state.pageSize;
                return sorted.slice(start, start + state.pageSize);
            },

            getTotalPages: function (filtered) {
                return Math.max(1, Math.ceil(filtered.length / state.pageSize));
            },

            getPageNumbers: function (filtered) {
                var pages = [], total = this.getTotalPages(filtered);
                for (var i = 1; i <= total; i++) pages.push(i);
                return pages;
            },

            goToPage: function (page, filtered) {
                var total = this.getTotalPages(filtered);
                if (page >= 1 && page <= total) state.currentPage = page;
            },

            setPageSize: function (size) {
                state.pageSize = size;
                state.currentPage = 1;
            },

            resetPage: function () { state.currentPage = 1; }
        };
    }

    //for due payments pagination
    var duePag = makePagination({ defaultSort: 'paymentID', defaultSize: 5 });
    $scope.duePayments = duePag.state;

    function applyDuePaymentsSearch() {
        if (!$scope.paymentData) {
            $scope.filteredDuePayments = [];
            return;
        }

        var query = normalizeSearchValue($scope.searchState.due);

        $scope.filteredDuePayments = $scope.paymentData.filter($scope.isUpcomingDue).filter(function (p) {
            var statusText = getDuePaymentSearchStatus(p);
            return matchesSearchValues(query, [
                p.paymentID,
                p.paymentType,
                formatCurrencySearch(p.amountDue),
                p.amountDue,
                formatCurrencySearch(p.amount),
                p.amount,
                statusText,
                $scope.isOverdue(p) ? 'Overdue' : '',
                formatSearchDate(p.dueDate),
                formatSearchDate(p.dateCreated),
                formatSearchDate(p.dateUpdated)
            ]);
        });
    }

    $scope.searchDuePayments = function () {
        duePag.resetPage();
        $scope.duePageDropOpen = false;
        $scope.dueSizeDropOpen = false;
        applyDuePaymentsSearch();
    };

    $scope.getDuePaymentsFiltered = function () {
        return $scope.filteredDuePayments || [];
    };

    $scope.dueSortBy = function (f) {
        duePag.sortBy(f);
    };
    $scope.getDuePaymentsPage = function () {
        return duePag.getPage($scope.getDuePaymentsFiltered());
    };
    $scope.getDueTotalPages = function () {
        return duePag.getTotalPages($scope.getDuePaymentsFiltered());
    };
    $scope.getDuePageNumbers = function () {
        return duePag.getPageNumbers($scope.getDuePaymentsFiltered());
    };
    $scope.dueGoToPage = function (p) {
        duePag.goToPage(p, $scope.getDuePaymentsFiltered());
    };
    $scope.duePrevPage = function () {
        $scope.dueGoToPage($scope.duePayments.currentPage - 1);
    };
    $scope.dueNextPage = function () {
        $scope.dueGoToPage($scope.duePayments.currentPage + 1);
    };
    $scope.setDuePageSize = function (s) {
        duePag.setPageSize(s);
    };

    $scope.$watch('searchState.due', function () {
        applyDuePaymentsSearch();
        duePag.resetPage();
    });

    $scope.$watchCollection('paymentData', function () {
        applyDuePaymentsSearch();
    });

    // for payments table pagination
    var groupsPag = makePagination({ defaultSort: 'bookingID', defaultSize: 10 });
    $scope.paymentsTable = groupsPag.state;

    function getPaymentSearchValues(payment) {
        return [
            payment.paymentID,
            '#' + payment.paymentID,
            payment.paymentType,
            payment.paymentStatus,
            formatCurrencySearch(payment.amountDue),
            payment.amountDue,
            formatCurrencySearch(payment.amount),
            payment.amount,
            payment.dueDate,
            formatSearchDate(payment.dueDate),
            payment.dateCreated,
            formatSearchDate(payment.dateCreated),
            payment.dateUpdated,
            formatSearchDate(payment.dateUpdated),
            $scope.isOverdue(payment) && payment.paymentStatus !== 'Paid' ? 'Overdue' : ''
        ];
    }

    function applyPaymentsSearch() {
        if (!$scope.groupedPayments) {
            $scope.filteredPaymentGroups = [];
            return;
        }

        var query = normalizeSearchValue($scope.searchState.payments);

        $scope.filteredPaymentGroups = $scope.groupedPayments.filter(function (g) {
            var matchingPayments = [];

            (g.payments || []).forEach(function (payment) {
                if (matchesSearchValues(query, getPaymentSearchValues(payment))) {
                    matchingPayments.push(payment);
                }
            });

            var groupMatches = matchesSearchValues(query, [
                g.bookingID,
                '#' + g.bookingID,
                formatCurrencySearch(g.totalDue),
                g.totalDue,
                formatCurrencySearch(g.totalPaid),
                g.totalPaid,
                g.overallStatus,
                g.nextDueDate,
                formatSearchDate(g.nextDueDate),
                g.dateCreated,
                formatSearchDate(g.dateCreated),
                g.dateUpdated,
                formatSearchDate(g.dateUpdated),
                g.unpaidCount > 0 ? g.unpaidCount + ' unpaid' : '',
                g.partialCount > 0 ? g.partialCount + ' partial' : ''
            ]);

            g.filteredPayments = !query || groupMatches ? (g.payments || []) : matchingPayments;

            if (query && !groupMatches && matchingPayments.length > 0) {
                g.expanded = true;
            }

            return !query || groupMatches || matchingPayments.length > 0;
        });
    }

    $scope.searchPayments = function () {
        groupsPag.resetPage();
        $scope.groupsPageDropOpen = false;
        $scope.groupsSizeDropOpen = false;
        applyPaymentsSearch();
    };

    $scope.getGroupsFiltered = function () {
        return $scope.filteredPaymentGroups || [];
    };

    $scope.getVisibleGroupPayments = function (group) {
        if (!group) {
            return [];
        }

        return group.filteredPayments || group.payments || [];
    };

    $scope.paymentsSortBy = function (f) {
        groupsPag.sortBy(f);
    };
    $scope.getGroupsPage = function () {
        return groupsPag.getPage($scope.getGroupsFiltered());
    };
    $scope.getGroupsTotalPages = function () {
        return groupsPag.getTotalPages($scope.getGroupsFiltered());
    };
    $scope.getGroupsPageNumbers = function () {
        return groupsPag.getPageNumbers($scope.getGroupsFiltered());
    };
    $scope.groupsGoToPage = function (p) {
        groupsPag.goToPage(p, $scope.getGroupsFiltered());
    };
    $scope.groupsPrevPage = function () {
        $scope.groupsGoToPage($scope.paymentsTable.currentPage - 1);
    };
    $scope.groupsNextPage = function () {
        $scope.groupsGoToPage($scope.paymentsTable.currentPage + 1);
    };
    $scope.setGroupsPageSize = function (s) {
        groupsPag.setPageSize(s);
    };

    $scope.$watch('searchState.payments', function () {
        applyPaymentsSearch();
        groupsPag.resetPage();
    });

    $scope.$watchCollection('groupedPayments', function () {
        applyPaymentsSearch();
    });

    //payment reminder in PAYMENTS table
    $scope.sendPaymentReminder = function (group) {
        if (!group) {
            console.warn("sendPaymentReminder called with no group data.");
            return;
        }
        IsabellaCateringWebAppService.getClientEmailByBooking(group.bookingID)
            .then(function (res) {
                if (!res.data.success) {
                    Swal.fire({
                        title: 'Error',
                        text: res.data.message,
                        icon: 'error',
                        confirmButtonColor: "#EC4899"
                    });
                    return;
                }

                var email = res.data.email;
                var fullName = res.data.firstName + " " + res.data.lastName;
                var eventName = res.data.eventName;

                var pendingPayments = group.payments.filter(function (p) {
                    return p.paymentStatus !== 'Paid';
                });

                var paymentLines = pendingPayments.map(function (p) {
                    var due = Number(p.amountDue) || 0;
                    var paid = Number(p.amount) || 0;
                    var balance = Math.max(0, due - paid);
                    var date = p.dueDate
                        ? new Date(p.dueDate).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'long', day: 'numeric'
                        })
                        : 'N/A';
                    return p.paymentType
                        + ' — Balance: ₱' + balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })
                        + ' | Due: ' + date;
                }).join('\n');

                IsabellaCateringWebAppService.sendReminderService(email, paymentLines, fullName, eventName, "reminder")
                    .then(function (res) {

                        if (res.data.success === true) {
                            Swal.fire({
                                title: 'Process Complete',
                                text: 'Reminder for Booking ' + eventName + ' has been processed.',
                                icon: 'success',
                                confirmButtonColor: '#ec4899'
                            }).then(function () {

                                var sentAt = new Date().toISOString();
                                var noteText = 'Payment reminder sent via Gmail | Booking #' + group.bookingID +
                                    ' (' + pendingPayments.length + ' payments)';

                                pendingPayments.forEach(function (p) {
                                    IsabellaCateringWebAppService.logPaymentReminder({
                                        paymentID: p.paymentID,
                                        sentBy: $scope.currentUserID,
                                        sentAt: sentAt,
                                        note: noteText,
                                        dateCreated: sentAt,
                                        dateUpdated: sentAt
                                    }).catch(function () {
                                        console.warn('Could not log reminder for paymentID ' + p.paymentID);
                                    });
                                });
                                Swal.fire({
                                    title: 'Action Logged',
                                    text: 'The reminder attempt for Booking ' + eventName + ' has been recorded.',
                                    icon: 'success',
                                    confirmButtonColor: '#ec4899'
                                });

                            });

                        } else {
                            Swal.fire({
                                title: 'Process Incomplete',
                                text: 'Reminder for Booking ' + eventName + ' has not been processed.',
                                icon: 'error',
                                confirmButtonColor: '#ec4899'
                            });
                        }
                    });
            });
    };

    //payment reminder in DUE payments table
    $scope.sendDuePaymentReminder = function (payment) {
        IsabellaCateringWebAppService.getClientEmailByBooking(payment.bookingID)
            .then(function (res) {
                if (!res.data.success) {
                    Swal.fire({
                        title: 'Error', text: 'Client email not found.', icon: 'error',
                        confirmButtonColor: "#EC4899"
                    });
                    return;
                }

                var email = res.data.email;
                var fullName = res.data.firstName + " " + res.data.lastName;
                var eventName = res.data.eventName;
                var paymentLines = '  Type    : ' + payment.paymentType + '\n' +
                    '  Due Date: ' + payment.dueDate + '\n' +
                    '  Balance : ₱' + payment.remainingBalance ;

                IsabellaCateringWebAppService.sendReminderService(email, paymentLines, fullName, eventName, "reminder_due")
                    .then(function (res) {

                        if (res.data.success === true) {
                            Swal.fire({
                                title: 'Process Complete',
                                text: 'Reminder for Booking ' + eventName + ' has been processed.',
                                icon: 'success',
                                confirmButtonColor: '#ec4899'
                            }).then(function () {
                                var sentAt = new Date().toISOString();
                                var noteText = 'Payment reminder sent via Gmail | Booking #' + payment.bookingID;

                                IsabellaCateringWebAppService.logPaymentReminder({
                                    paymentID: payment.paymentID,
                                    sentBy: $scope.currentUserID,
                                    sentAt: sentAt,
                                    note: noteText,
                                    dateCreated: sentAt,
                                    dateUpdated: sentAt
                                }).then(function (res) {
                                    if (res.data.success == true) {
                                        Swal.fire({
                                            title: 'Action Logged',
                                            text: 'The reminder attempt for Booking ' + eventName + ' has been recorded.',
                                            icon: 'success',
                                            confirmButtonColor: '#ec4899'
                                        });
                                    } else {
                                        Swal.fire({
                                            title: 'Failed to Log Action',
                                            text: 'The reminder attempt for Booking ' + eventName + ' has not been recorded.',
                                            icon: 'error',
                                            confirmButtonColor: '#ec4899'
                                        });
                                    }
                                }).catch(function () {
                                    console.warn('Could not log reminder for paymentID ' + payment.paymentID);
                                });
                            });
                        } else {
                            Swal.fire({
                                title: 'Process Incomplete',
                                text: 'Reminder for Booking ' + eventName + ' has not been processed.',
                                icon: 'error',
                                confirmButtonColor: '#ec4899'
                            });
                        }
                    });
            });
    };


    //Download of receipts
    var COMPANY_LOGO = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAAH0CAYAAADL1t+KAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAEqGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpBdHRyaWI9J2h0dHA6Ly9ucy5hdHRyaWJ1dGlvbi5jb20vYWRzLzEuMC8nPgogIDxBdHRyaWI6QWRzPgogICA8cmRmOlNlcT4KICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPgogICAgIDxBdHRyaWI6Q3JlYXRlZD4yMDI1LTEyLTE2PC9BdHRyaWI6Q3JlYXRlZD4KICAgICA8QXR0cmliOkV4dElkPjFhOTdmYjBhLTlhZjAtNDhlOS1iMzZkLTBlYjViYmM0ZDY5NjwvQXR0cmliOkV4dElkPgogICAgIDxBdHRyaWI6RmJJZD41MjUyNjU5MTQxNzk1ODA8L0F0dHJpYjpGYklkPgogICAgIDxBdHRyaWI6VG91Y2hUeXBlPjI8L0F0dHJpYjpUb3VjaFR5cGU+CiAgICA8L3JkZjpsaT4KICAgPC9yZGY6U2VxPgogIDwvQXR0cmliOkFkcz4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6ZGM9J2h0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvJz4KICA8ZGM6dGl0bGU+CiAgIDxyZGY6QWx0PgogICAgPHJkZjpsaSB4bWw6bGFuZz0neC1kZWZhdWx0Jz5cIC0gMjg8L3JkZjpsaT4KICAgPC9yZGY6QWx0PgogIDwvZGM6dGl0bGU+CiA8L3JkZjpEZXNjcmlwdGlvbj4KCiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0n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';
    var COMPANY_NAME = 'Isabella Catering and Events';
    var COMPANY_ADDRESS = 'Ph 9A, Blk 48, L35 & 37, Savinhill St., Governor’s Hills Subdivision, General Trias, Cavite, Philippines';
    var COMPANY_CONTACT = 'isabellacateringandevent@gmail.com / Tel: (046) 482-3087 / Mob: 0917-711-1401 / 0926-006-9234';

    function formatPHP(amount) {
        return '₱' + Number(amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 });
    }
    function formatDate(date) {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    }
    function buildPdfHeader(logoBase64) {
        return {
            columns: [
                logoBase64
                    ? { image: logoBase64, width: 70, margin: [0, 0, 0, 0] }
                    : { text: '', width: 70 },
                {
                    stack: [
                        { text: COMPANY_NAME, style: 'companyName' },
                        { text: COMPANY_ADDRESS, style: 'companyInfo' },
                        { text: COMPANY_CONTACT, style: 'companyInfo' },
                    ],
                    alignment: 'right'
                }
            ],
            margin: [0, 0, 0, 10]
        };
    }
    function buildClientBlock(res, bookingID) {
        return {
            margin: [0, 10, 0, 10],
            columns: [
                {
                    stack: [
                        { text: 'BILLED TO', style: 'sectionLabel' },
                        { text: res.firstName + ' ' + res.lastName, style: 'clientName' },
                        { text: res.email, style: 'clientInfo' },
                    ]
                },
                {
                    stack: [
                        { text: 'RECEIPT INFO', style: 'sectionLabel' },
                        { text: 'Booking #: ' + bookingID, style: 'clientInfo' },
                        { text: 'Date Issued: ' + formatDate(new Date()), style: 'clientInfo' },
                    ],
                    alignment: 'right'
                }
            ]
        };
    }
    function buildSignatureBlock() {
        return {
            margin: [0, 30, 0, 0],
            columns: [
                {
                    stack: [
                        { text: '________________________________', margin: [0, 20, 0, 0] },
                        { text: 'Client Signature', style: 'signatureLabel' },
                    ]
                },
                {
                    stack: [
                        { text: '________________________________', margin: [0, 20, 0, 0] },
                        { text: 'Authorized Signatory', style: 'signatureLabel' },
                    ],
                    alignment: 'right'
                }
            ]
        };
    }

    var PDF_STYLES = {
        companyName: { fontSize: 14, bold: true, color: '#ec4899' },
        companyInfo: { fontSize: 9, color: '#6b7280' },
        sectionLabel: { fontSize: 8, bold: true, color: '#9ca3af', margin: [0, 0, 0, 4] },
        clientName: { fontSize: 12, bold: true, color: '#111827' },
        clientInfo: { fontSize: 9, color: '#6b7280' },
        receiptTitle: { fontSize: 20, bold: true, color: '#ec4899', margin: [0, 0, 0, 4] },
        tableHeader: { fontSize: 9, bold: true, color: '#ffffff', fillColor: '#ec4899' },
        tableRow: { fontSize: 9, color: '#374151' },
        tableRowAlt: { fontSize: 9, color: '#374151', fillColor: '#fdf2f8' },
        totalLabel: { fontSize: 10, bold: true, color: '#111827' },
        totalValue: { fontSize: 10, bold: true, color: '#ec4899' },
        signatureLabel: { fontSize: 8, color: '#9ca3af', margin: [0, 4, 0, 0] },
        footer: { fontSize: 8, color: '#9ca3af', italics: true },
        statusUnpaid: { fontSize: 8, bold: true, color: '#ffffff', fillColor: '#dc2626' },
        statusPartial: { fontSize: 8, bold: true, color: '#92400e', fillColor: '#fef3c7' },
        statusPaid: { fontSize: 8, bold: true, color: '#065f46', fillColor: '#d1fae5' },
    };

    function statusStyle(status) {
        if (status === 'Paid') return 'statusPaid';
        if (status === 'Partially Paid') return 'statusPartial';
        return 'statusUnpaid';
    }

    //per payment
    $scope.downloadReceipt = function (payment) {
        IsabellaCateringWebAppService.getClientEmailByBooking(payment.bookingID)
            .then(function (res) {
                if (!res.data.success) {
                    Swal.fire({
                        title: 'Error', text: res.data.message, icon: 'error',
                        confirmButtonColor: "#EC4899"
                    });
                    return;
                }

                var due = Number(payment.amountDue) || 0;
                var paid = Number(payment.amount) || 0;
                var balance = Math.max(0, due - paid);

                var docDefinition = {
                    pageSize: 'A4',
                    pageMargins: [40, 40, 40, 60],
                    content: [
                        buildPdfHeader(COMPANY_LOGO),
                        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#ec4899' }] },
                        {
                            margin: [0, 16, 0, 0],
                            columns: [
                                {
                                    stack: [
                                        { text: 'PAYMENT RECEIPT', style: 'receiptTitle' },
                                        { text: 'Payment #' + payment.paymentID, fontSize: 9, color: '#6b7280' },
                                    ]
                                }
                            ]
                        },
                        buildClientBlock(res.data, payment.bookingID),
                        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#e5e7eb' }] },

                        {
                            margin: [0, 16, 0, 0],
                            table: {
                                widths: ['*', '*', '*', '*', '*'],
                                headerRows: 1,
                                body: [
                                    [
                                        { text: 'TYPE', style: 'tableHeader', alignment: 'center' },
                                        { text: 'AMOUNT DUE', style: 'tableHeader', alignment: 'center' },
                                        { text: 'AMOUNT PAID', style: 'tableHeader', alignment: 'center' },
                                        { text: 'BALANCE', style: 'tableHeader', alignment: 'center' },
                                        { text: 'STATUS', style: 'tableHeader', alignment: 'center' },
                                    ],
                                    [
                                        { text: payment.paymentType, style: 'tableRow', alignment: 'center' },
                                        { text: formatPHP(due), style: 'tableRow', alignment: 'center' },
                                        { text: formatPHP(paid), style: 'tableRow', alignment: 'center' },
                                        { text: formatPHP(balance), style: 'tableRow', alignment: 'center' },
                                        { text: payment.paymentStatus, style: statusStyle(payment.paymentStatus), alignment: 'center' },
                                    ]
                                ]
                            },
                            layout: {
                                fillColor: function (rowIndex) { return rowIndex === 0 ? '#ec4899' : null; },
                                hLineColor: function () { return '#e5e7eb'; },
                                vLineColor: function () { return '#e5e7eb'; },
                            }
                        },

                        {
                            margin: [0, 16, 0, 0],
                            columns: [
                                { text: '' },
                                {
                                    width: 200,
                                    table: {
                                        widths: ['*', '*'],
                                        body: [
                                            [{ text: 'Amount Due:', style: 'totalLabel' }, { text: formatPHP(due), style: 'tableRow', alignment: 'right' }],
                                            [{ text: 'Amount Paid:', style: 'totalLabel' }, { text: formatPHP(paid), style: 'tableRow', alignment: 'right' }],
                                            [{ text: 'Balance:', style: 'totalLabel' }, { text: formatPHP(balance), style: 'totalValue', alignment: 'right' }],
                                        ]
                                    },
                                    layout: 'noBorders'
                                }
                            ]
                        },

                        {
                            margin: [0, 12, 0, 0],
                            text: 'Due Date: ' + formatDate(payment.dueDate),
                            fontSize: 9, color: '#6b7280'
                        },

                        buildSignatureBlock(),

                        {
                            margin: [0, 20, 0, 0],
                            text: 'Thank you for choosing ' + COMPANY_NAME + '. This is an official payment receipt.',
                            style: 'footer',
                            alignment: 'center'
                        }
                    ],
                    styles: PDF_STYLES,
                    footer: function (currentPage, pageCount) {
                        return {
                            text: COMPANY_NAME + '  |  Page ' + currentPage + ' of ' + pageCount,
                            alignment: 'center',
                            style: 'footer',
                            margin: [0, 10, 0, 0]
                        };
                    }
                };

                var fileName = 'Receipt_Booking' + payment.bookingID + '_Payment' + payment.paymentID + '.pdf';
                pdfMake.createPdf(docDefinition).download(fileName);
            })
            .catch(function () {
                Swal.fire({
                    title: 'Error', text: 'Could not generate receipt.', icon: 'error',
                    confirmButtonColor: "#EC4899"
                });
            });
    };

    //full payment receipt
    $scope.downloadSummaryReceipt = function (group) {
        IsabellaCateringWebAppService.getClientEmailByBooking(group.bookingID)
            .then(function (res) {
                if (!res.data.success) {
                    Swal.fire({
                        title: 'Error', text: res.data.message, icon: 'error',
                        confirmButtonColor: "#EC4899"
                    });
                    return;
                }

                var tableBody = [
                    [
                        { text: 'TYPE', style: 'tableHeader', alignment: 'center' },
                        { text: 'AMOUNT DUE', style: 'tableHeader', alignment: 'center' },
                        { text: 'AMOUNT PAID', style: 'tableHeader', alignment: 'center' },
                        { text: 'BALANCE', style: 'tableHeader', alignment: 'center' },
                        { text: 'DUE DATE', style: 'tableHeader', alignment: 'center' },
                        { text: 'STATUS', style: 'tableHeader', alignment: 'center' },
                    ]
                ];

                var totalDue = 0, totalPaid = 0, totalRemBalance = 0;
                var maxTransactionNum = 0

                group.payments.forEach(function (p, i) {
                    
                    var due = Number(p.amountDue) || 0;
                    var amount = Number(p.amount) || 0;

                    if (p.transactionNum > maxTransactionNum) {
                        maxTransactionNum = p.transactionNum
                        totalRemBalance = p.remainingBalance
                    }
                    if (p.paymentType == 'Initial') {
                        totalDue += due
                    } else if (p.paymentType == 'Additional') {
                        totalDue += amount
                    } else if (p.paymentType == 'Payment') {
                        totalPaid += amount
                    }

                    var rowStyle = i % 2 === 0 ? 'tableRow' : 'tableRowAlt';
                    tableBody.push([
                        { text: p.paymentType, style: rowStyle, alignment: 'center' },
                        { text: formatPHP(due), style: rowStyle, alignment: 'center' },
                        { text: formatPHP(amount), style: rowStyle, alignment: 'center' },
                        { text: formatPHP(totalRemBalance), style: rowStyle, alignment: 'center' },
                        { text: formatDate(p.dueDate), style: rowStyle, alignment: 'center' },
                        { text: p.paymentStatus, style: statusStyle(p.paymentStatus), alignment: 'center' },
                    ]);
                });


                var docDefinition = {
                    pageSize: 'A4',
                    pageMargins: [40, 40, 40, 60],
                    content: [
                        buildPdfHeader(COMPANY_LOGO),
                        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#ec4899' }] },
                        {
                            margin: [0, 16, 0, 0],
                            stack: [
                                { text: 'PAYMENT SUMMARY', style: 'receiptTitle' },
                                { text: 'Booking #' + group.bookingID, fontSize: 9, color: '#6b7280' },
                            ]
                        },
                        buildClientBlock(res.data, group.bookingID),
                        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#e5e7eb' }] },

                        {
                            margin: [0, 16, 0, 0],
                            table: {
                                widths: ['*', '*', '*', '*', '*', '*'],
                                headerRows: 1,
                                body: tableBody
                            },
                            layout: {
                                fillColor: function (rowIndex, node, columnIndex) {
                                    if (rowIndex === 0) return '#ec4899';
                                    return rowIndex % 2 === 0 ? null : '#fdf2f8';
                                },
                                hLineColor: function () { return '#e5e7eb'; },
                                vLineColor: function () { return '#e5e7eb'; },
                            }
                        },

                        {
                            margin: [0, 16, 0, 0],
                            columns: [
                                { text: '' },
                                {
                                    width: 220,
                                    table: {
                                        widths: ['*', '*'],
                                        body: [
                                            [{ text: 'Total Due:', style: 'totalLabel' }, { text: formatPHP(totalDue), style: 'tableRow', alignment: 'right' }],
                                            [{ text: 'Total Paid:', style: 'totalLabel' }, { text: formatPHP(totalPaid), style: 'tableRow', alignment: 'right' }],
                                            [{ text: 'Total Balance:', style: 'totalLabel' }, { text: formatPHP(totalRemBalance), style: 'totalValue', alignment: 'right' }],
                                        ]
                                    },
                                    layout: 'noBorders'
                                }
                            ]
                        },

                        buildSignatureBlock(),

                        {
                            margin: [0, 20, 0, 0],
                            text: 'Thank you for choosing ' + COMPANY_NAME + '. This is an official payment summary.',
                            style: 'footer',
                            alignment: 'center'
                        }
                    ],
                    styles: PDF_STYLES,
                    footer: function (currentPage, pageCount) {
                        return {
                            text: COMPANY_NAME + '  |  Page ' + currentPage + ' of ' + pageCount,
                            alignment: 'center',
                            style: 'footer',
                            margin: [0, 10, 0, 0]
                        };
                    }
                };

                var fileName = 'Summary_Booking' + group.bookingID + '.pdf';
                pdfMake.createPdf(docDefinition).download(fileName);
            })
            .catch(function () {
                Swal.fire({
                    title: 'Error', text: 'Could not generate summary receipt.', icon: 'error',
                    confirmButtonColor: "#EC4899"
                });
            });
    };

    //====================================================== PAYMENT REMINDER END ======================================================


    //====================================================== CREATE BOOKING START ======================================================
    $scope.progressOne = 0;
    $scope.progressTwo = 0;
    $scope.progressThree = 0;
    $scope.setStep = function (step) {
        if (step === 1) {
            if ($scope.order.progressOne === 1 && $scope.order.progressTwo === 0) {
                $scope.order.progressOne = 0;
                $scope.order.progressTwo = 0;
                $scope.order.progressThree = 0;
                $scope.progressOne = 0;
                $scope.progressTwo = 0;
                $scope.progressThree = 0;
            } else {
                $scope.order.progressOne = 1;
                $scope.order.progressTwo = 0;
                $scope.order.progressThree = 0;
                $scope.progressOne = 1;
                $scope.progressTwo = 0;
                $scope.progressThree = 0;
            }
        }
        else if (step === 2) {
            if ($scope.order.progressTwo === 1 && $scope.order.progressThree === 0) {
                $scope.order.progressOne = 1;
                $scope.order.progressTwo = 0;
                $scope.order.progressThree = 0;
                $scope.progressOne = 1;
                $scope.progressTwo = 0;
                $scope.progressThree = 0;
            } else {
                $scope.order.progressOne = 1;
                $scope.order.progressTwo = 1;
                $scope.order.progressThree = 0;
                $scope.progressOne = 1;
                $scope.progressTwo = 1;
                $scope.progressThree = 0;
            }
        }
        else if (step === 3) {
            if ($scope.order.progressThree === 1) {
                $scope.order.progressOne = 1;
                $scope.order.progressTwo = 1;
                $scope.order.progressThree = 0;
                $scope.progressOne = 1;
                $scope.progressTwo = 1;
                $scope.progressThree = 0;
            } else {
                $scope.order.progressOne = 1;
                $scope.order.progressTwo = 1;
                $scope.order.progressThree = 1;
                $scope.progressOne = 1;
                $scope.progressTwo = 1;
                $scope.progressThree = 1;
            }
        }
    };
    $scope.initializeBookingFlow = function () {
        if ($scope.bookingFlowSteps && $scope.bookingFlowSteps.length) {
            return;
        }

        $scope.bookingEditLoading = false;
        $scope.bookingFlowSteps = [
            { id: 1, label: 'Event Details', description: 'Client, schedule, and package setup' },
            { id: 2, label: 'Package Summary', description: 'Review the booking before pricing' },
            { id: 3, label: 'Pricing & Confirm', description: 'Finalize guest count and submit' }
        ];
        $scope.bookingStep = 1;
    };

    $scope.getBookingProgressWidth = function () {
        var totalSteps = ($scope.bookingFlowSteps || []).length;

        if (totalSteps <= 1) {
            return '0%';
        }

        var progress = (($scope.bookingStep || 1) - 1) / (totalSteps - 1);
        return (progress * 100) + '%';
    };

    function hasBookingValue(value) {
        if (value === null || value === undefined) {
            return false;
        }

        if (typeof value === 'string') {
            return value.trim() !== '';
        }

        return true;
    }

    $scope.validateBookingDetailsStep = function (showAlert, redirectToDetailsStep) {
        var missingFields = getMissingBookingFields();
        var isValid = missingFields.length === 0;

        $scope.bookingValidationAttempted = true;

        if (!isValid && redirectToDetailsStep) {
            $scope.goToBookingStep(1);
        }

        if (!isValid && showAlert) {
            fireBookingValidationAlert(missingFields);
        }

        return isValid;
    };

    $scope.goToBookingStep = function (step) {
        if (!$scope.bookingFlowSteps || step < 1 || step > $scope.bookingFlowSteps.length) {
            return;
        }

        $scope.bookingStep = step;
        $scope.activeDropdown = null;
    };

    $scope.goToNextBookingStep = function () {
        if (!$scope.cEmail || $scope.cEmail.indexOf('@') === -1) {
            Swal.fire({
                title: 'Invalid Email',
                text: 'Your email must contain an @ symbol.',
                icon: 'error',
                confirmButtonColor: '#EC4899'
            });
            return;
        }

        if ($scope.bookingStep === 1 && !$scope.validateBookingDetailsStep(true, false)) {
            return;
        }

        $scope.goToBookingStep(Math.min(($scope.bookingStep || 1) + 1, ($scope.bookingFlowSteps || []).length || 1));
    };

    $scope.goToPreviousBookingStep = function () {
        $scope.goToBookingStep(Math.max(($scope.bookingStep || 1) - 1, 1));
    };

    function getEditBookingId() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('mode') !== 'edit') {
            return null;
        }

        var bookingID = parseInt(urlParams.get('id'), 10);
        return bookingID > 0 ? bookingID : null;
    }

    function parseDotNetDate(dateObj) {
        if (!dateObj) {
            return null;
        }

        var milliseconds = parseInt(String(dateObj).replace(/[^0-9-]/g, ''), 10);
        if (isNaN(milliseconds)) {
            return null;
        }

        var date = new Date(milliseconds);
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    function formatServerTime(timeObj) {
        if (!timeObj || timeObj.Hours === undefined) {
            return '';
        }

        return String(timeObj.Hours).padStart(2, '0') + ':' + String(timeObj.Minutes || 0).padStart(2, '0');
    }

    function applyTimeSelection(timeValue, selectHour, selectMinute, selectPeriod) {
        if (!timeValue) {
            return;
        }

        var parts = timeValue.split(':');
        var hour24 = parseInt(parts[0], 10);
        var minute = parseInt(parts[1], 10) || 0;
        var period = hour24 >= 12 ? 'PM' : 'AM';
        var hour12 = hour24 % 12;
        hour12 = hour12 ? hour12 : 12;

        selectHour(String(hour12).padStart(2, '0'));
        selectMinute(String(minute).padStart(2, '0'));
        selectPeriod(period);
    }

    function summarizeSelectedValues(values) {
        return (values || []).filter(function (val) {
            return val !== null && val !== undefined && val !== '';
        }).join(', ');
    }

    function applyMultiSelection(details, prefix, count, idTarget, textTarget, summaryTarget) {
        $scope[idTarget] = [];
        $scope[textTarget] = [];

        for (var x = 0; x < count; x++) {
            var item = details[prefix + (x + 1)];
            if (!item) {
                $scope[idTarget][x] = null;
                $scope[textTarget][x] = null;
                continue;
            }

            var idKey = Object.keys(item).find(function (key) { return /TypID$/.test(key); });
            var descKey = Object.keys(item).find(function (key) { return /TypDesc$/.test(key); });

            $scope[idTarget][x] = idKey ? item[idKey] : null;
            $scope[textTarget][x] = descKey ? item[descKey] : null;
        }

        $scope[summaryTarget] = summarizeSelectedValues($scope[textTarget]);
    }

    function extractPaxCount(value) {
        var match = String(value || '').match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
    }

    function findMatchingPriceOption(paxCount) {
        return ($scope.pricePaxOpt || []).find(function (option) {
            return extractPaxCount(option.pricePaxDesc) === Number(paxCount);
        });
    }

    function applyEditBookingData(bookingData, detailsData) {
        var client = detailsData.clients || {};
        var packageInfo = detailsData.packages || {};
        var packageType = detailsData.packageType || {};
        var eventInfo = detailsData.events || {};

        $scope.isEditMode = true;
        $scope.editBookingID = bookingData.bookingID;
        $scope.order = {
            bookingID: bookingData.bookingID,
            clientID: bookingData.clientID,
            packageID: bookingData.packageID,
            bookingDate: convertDate(bookingData.bookingDate),
            prepVenue: bookingData.prepVenue,
            venue: bookingData.venue,
            eventSetTime: convertTime(bookingData.eventSetTime),
            eventTime: convertTime(bookingData.eventTime),
            ceremTime: convertTime(bookingData.ceremTime),
            eventMealTime: convertTime(bookingData.eventMealTime),
            dsgnTheme: bookingData.dsgnTheme,
            dsgnMotif: bookingData.dsgnMotif,
            dateCreated: convertDate(bookingData.dateCreated),
            dateUpdated: convertDate(bookingData.dateUpdated),
            progressOne: bookingData.progressOne,
            progressTwo: bookingData.progressTwo,
            progressThree: bookingData.progressThree,
            paxCount: bookingData.paxCount,
            addAdult: bookingData.addAdult,
            addKid: bookingData.addKid,
            bookingNote: bookingData.bookingNote
        };

        $scope.eventName = client.eventName || '';
        $scope.cFirstName = client.cFName || '';
        $scope.cLastName = client.cLName || '';
        $scope.cEmail = client.cEmail || '';
        $scope.cContactNum = client.cContact || '';
        $scope.cCeleb1FirstName = client.cCeleb1FName || '';
        $scope.cCeleb1LastName = client.cCeleb1LName || '';
        $scope.cCeleb2FirstName = client.cCeleb2FName || '';
        $scope.cCeleb2LastName = client.cCeleb2LName || '';
        $scope.eventTheme = bookingData.dsgnTheme || '';
        $scope.eventMotif = bookingData.dsgnMotif || '';
        $scope.eventPrepVenue = bookingData.prepVenue || '';
        $scope.eventVenue = bookingData.venue || '';
        $scope.bookingNote = bookingData.bookingNote || '';

        var bookingDate = parseDotNetDate(bookingData.bookingDate);
        if (bookingDate) {
            $scope.dateOfEvent = bookingDate;
            $scope.changeSummaryDateOutput();
        }

        var packageTypeID = packageType.packageTypID || packageInfo.packageTypID || null;
        var packageTypeDesc = packageType.packageTypDesc || null;
        var packagePromise = Promise.resolve();

        if (packageTypeID) {
            packagePromise = $scope.selectPackageTypes(packageTypeDesc, packageTypeID);
        } else {
            $scope.packageType = packageTypeDesc;
            $scope.packageTypeID = packageTypeID;
        }

        return packagePromise.then(function () {
            $scope.eventType = eventInfo.eventDesc || null;
            $scope.eventTypeID = eventInfo.eventID || null;

            $scope.staplesType = packageInfo.incStaples || null;
            $scope.buffetType = packageInfo.incBftSet || null;
            $scope.stylingType = packageInfo.incStyling || null;
            $scope.tableType = packageInfo.incTableSet || null;
            $scope.dinerwareType = packageInfo.incDnrWare || null;

            if (detailsData.preMainCourse) {
                $scope.mainCourseTypeID = detailsData.preMainCourse.mainCourseTypID;
                $scope.mainCourseType = detailsData.preMainCourse.mainCourseTypDesc;
            }
            if (detailsData.preCenterPiece) {
                $scope.centerPieceTypeID = detailsData.preCenterPiece.centerPieceTypID;
                $scope.centerPieceType = detailsData.preCenterPiece.centerPieceTypDesc;
            }
            if (detailsData.preSeating) {
                $scope.seatingTypeID = detailsData.preSeating.seatingTypID;
                $scope.seatingType = detailsData.preSeating.seatingTypDesc;
            }
            if (detailsData.preBackdrop) {
                $scope.backdropTypeID = detailsData.preBackdrop.backdropTypID;
                $scope.backdropType = detailsData.preBackdrop.backdropTypDesc;
            }
            if (detailsData.preEntrance) {
                $scope.entranceTypeID = detailsData.preEntrance.entranceTypID;
                $scope.entranceType = detailsData.preEntrance.entranceTypDesc;
            }
            if (detailsData.preCouch) {
                $scope.couchTypeID = detailsData.preCouch.couchTypID;
                $scope.couchType = detailsData.preCouch.couchTypDesc;
            }

            applyMultiSelection(detailsData, 'preSides', 4, 'selectedSidesTypesID', 'selectedSidesTypes', 'sidesType');
            applyMultiSelection(detailsData, 'preSpecials', 9, 'selectedSpecialsTypesID', 'selectedSpecialsTypes', 'specialsType');
            applyMultiSelection(detailsData, 'preStaff', 3, 'selectedStaffTypesID', 'selectedStaffTypes', 'staffType');
            applyMultiSelection(detailsData, 'preEquip', 7, 'selectedEquipTypesID', 'selectedEquipTypes', 'equipType');
            applyMultiSelection(detailsData, 'preEntertainment', 7, 'selectedEntertainmentTypesID', 'selectedEntertainmentTypes', 'entertainmentType');
            applyMultiSelection(detailsData, 'prePhoto', 7, 'selectedPhotoTypesID', 'selectedPhotoTypes', 'photoType');
            applyMultiSelection(detailsData, 'preKeepsakes', 5, 'selectedKeepsakesTypesID', 'selectedKeepsakesTypes', 'keepsakesType');
            applyMultiSelection(detailsData, 'preDebut', 3, 'selectedDebutTypesID', 'selectedDebutTypes', 'debutType');

            $scope.eventCeremTime = formatServerTime(bookingData.ceremTime);
            $scope.eventEventTime = formatServerTime(bookingData.eventTime);
            $scope.eventSetTime = formatServerTime(bookingData.eventSetTime);
            $scope.eventMealTime = formatServerTime(bookingData.eventMealTime);

            applyTimeSelection($scope.eventCeremTime, $scope.selectCeremHour, $scope.selectCeremMinute, $scope.selectCeremPeriod);
            applyTimeSelection($scope.eventEventTime, $scope.selectEventHour, $scope.selectEventMinute, $scope.selectEventPeriod);
            applyTimeSelection($scope.eventSetTime, $scope.selectSetHour, $scope.selectSetMinute, $scope.selectSetPeriod);
            applyTimeSelection($scope.eventMealTime, $scope.selectMealHour, $scope.selectMealMinute, $scope.selectMealPeriod);

            var matchingPrice = findMatchingPriceOption(bookingData.paxCount);
            if (matchingPrice) {
                $scope.selectPricePaxType(matchingPrice.pricePaxID, matchingPrice.pricePaxDesc, matchingPrice.pricePaxPrice);
            }

            $scope.addAdult = bookingData.addAdult ? bookingData.addAdult.toString() : '';
            $scope.addKid = bookingData.addKid ? bookingData.addKid.toString() : '';
            $scope.computeFinalPrice();
            disableBookingInput();
        });
    }

    function loadBookingForEdit(bookingID) {
        if (!bookingID) {
            Swal.fire({
                title: 'Invalid Booking',
                text: 'No booking was selected for editing.',
                icon: 'error',
                confirmButtonColor: '#EC4899'
            }).then(function () {
                $scope.redirectToBookingCalendarPage();
            });
            return;
        }

        $scope.isEditMode = true;
        $scope.editBookingID = bookingID;
        $scope.bookingEditLoading = true;

        return IsabellaCateringWebAppService.getBooking({ bookingID: bookingID }).then(function (bookingRes) {
            if (!bookingRes.data || !bookingRes.data.bookingID) {
                throw new Error('Booking not found.');
            }

            return IsabellaCateringWebAppService.getBookingDetailsService(bookingID).then(function (detailsRes) {
                if (!detailsRes.data || !detailsRes.data.success) {
                    throw new Error(detailsRes.data && detailsRes.data.message ? detailsRes.data.message : 'Booking details not found.');
                }

                return applyEditBookingData(bookingRes.data, detailsRes.data);
            });
        }).catch(function (error) {
            Swal.fire({
                title: 'Error',
                text: error && error.message ? error.message : 'Could not load the selected booking.',
                icon: 'error',
                confirmButtonColor: '#EC4899'
            }).then(function () {
                $scope.redirectToBookingCalendarPage();
            });
        }).finally(function () {
            $scope.bookingEditLoading = false;
        });
    }

    function buildBookingSubmission() {
        var cleanAmount = ($scope.bookingFinalPrice || '0').toString().replace(/[^0-9]/g, '');

        return {
            clientInfo: {
                eventName: $scope.eventName,
                cFName: $scope.cFirstName,
                cLName: $scope.cLastName,
                cEmail: $scope.cEmail,
                cContact: $scope.cContactNum,
                cCeleb1FName: $scope.cCeleb1FirstName,
                cCeleb1LName: $scope.cCeleb1LastName,
                cCeleb2FName: $scope.cCeleb2FirstName ?? null,
                cCeleb2LName: $scope.cCeleb2LastName ?? null
            },
            bookingInfo: {
                bookingID: $scope.editBookingID || 0,
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
                bookingNote: $scope.bookingNote ?? null,
                progressOne: $scope.progressOne ?? null,
                progressTwo: $scope.progressTwo ?? null,
                progressThree: $scope.progressThree ?? null,
                paxCount: extractPaxCount($scope.priceType),
                addAdult: parseInt($scope.addAdult, 10) || 0,
                addKid: parseInt($scope.addKid, 10) || 0
            },
            paymentInfo: {
                amountDue: parseFloat(cleanAmount) || 0
            },
            packages: {
                packageTypID: $scope.packageTypeID || 0,
                pricePaxID: $scope.priceTypeID || 0,
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
            },
            sidesGrpTypes: {
                sidesGrpTyp1: $scope.selectedSidesTypesID[0] ?? null,
                sidesGrpTyp2: $scope.selectedSidesTypesID[1] ?? null,
                sidesGrpTyp3: $scope.selectedSidesTypesID[2] ?? null,
                sidesGrpTyp4: $scope.selectedSidesTypesID[3] ?? null
            },
            specialsGrpTypes: {
                specialsGrpTyp1: $scope.selectedSpecialsTypesID[0] ?? null,
                specialsGrpTyp2: $scope.selectedSpecialsTypesID[1] ?? null,
                specialsGrpTyp3: $scope.selectedSpecialsTypesID[2] ?? null,
                specialsGrpTyp4: $scope.selectedSpecialsTypesID[3] ?? null,
                specialsGrpTyp5: $scope.selectedSpecialsTypesID[4] ?? null,
                specialsGrpTyp6: $scope.selectedSpecialsTypesID[5] ?? null,
                specialsGrpTyp7: $scope.selectedSpecialsTypesID[6] ?? null,
                specialsGrpTyp8: $scope.selectedSpecialsTypesID[7] ?? null,
                specialsGrpTyp9: $scope.selectedSpecialsTypesID[8] ?? null
            },
            staffGrpTypes: {
                staffGrpTyp1: $scope.selectedStaffTypesID[0] ?? null,
                staffGrpTyp2: $scope.selectedStaffTypesID[1] ?? null,
                staffGrpTyp3: $scope.selectedStaffTypesID[2] ?? null
            },
            equipGrpTypes: {
                equipGrpTyp1: $scope.selectedEquipTypesID[0] ?? null,
                equipGrpTyp2: $scope.selectedEquipTypesID[1] ?? null,
                equipGrpTyp3: $scope.selectedEquipTypesID[2] ?? null,
                equipGrpTyp4: $scope.selectedEquipTypesID[3] ?? null,
                equipGrpTyp5: $scope.selectedEquipTypesID[4] ?? null,
                equipGrpTyp6: $scope.selectedEquipTypesID[5] ?? null,
                equipGrpTyp7: $scope.selectedEquipTypesID[6] ?? null
            },
            entertainmentGrpTypes: {
                entertainmentGrpTyp1: $scope.selectedEntertainmentTypesID[0] ?? null,
                entertainmentGrpTyp2: $scope.selectedEntertainmentTypesID[1] ?? null,
                entertainmentGrpTyp3: $scope.selectedEntertainmentTypesID[2] ?? null,
                entertainmentGrpTyp4: $scope.selectedEntertainmentTypesID[3] ?? null,
                entertainmentGrpTyp5: $scope.selectedEntertainmentTypesID[4] ?? null,
                entertainmentGrpTyp6: $scope.selectedEntertainmentTypesID[5] ?? null,
                entertainmentGrpTyp7: $scope.selectedEntertainmentTypesID[6] ?? null
            },
            photoGrpTypes: {
                photoGrpTyp1: $scope.selectedPhotoTypesID[0] ?? null,
                photoGrpTyp2: $scope.selectedPhotoTypesID[1] ?? null,
                photoGrpTyp3: $scope.selectedPhotoTypesID[2] ?? null,
                photoGrpTyp4: $scope.selectedPhotoTypesID[3] ?? null,
                photoGrpTyp5: $scope.selectedPhotoTypesID[4] ?? null,
                photoGrpTyp6: $scope.selectedPhotoTypesID[5] ?? null,
                photoGrpTyp7: $scope.selectedPhotoTypesID[6] ?? null
            },
            keepsakesGrpTypes: {
                keepsakesGrpTyp1: $scope.selectedKeepsakesTypesID[0] ?? null,
                keepsakesGrpTyp2: $scope.selectedKeepsakesTypesID[1] ?? null,
                keepsakesGrpTyp3: $scope.selectedKeepsakesTypesID[2] ?? null,
                keepsakesGrpTyp4: $scope.selectedKeepsakesTypesID[3] ?? null,
                keepsakesGrpTyp5: $scope.selectedKeepsakesTypesID[4] ?? null
            },
            debutGrpTypes: {
                debutGrpTyp1: $scope.selectedDebutTypesID[0] ?? null,
                debutGrpTyp2: $scope.selectedDebutTypesID[1] ?? null,
                debutGrpTyp3: $scope.selectedDebutTypesID[2] ?? null
            }
        };
    }

    $scope.loadPackageOptions = function () {
        var editBookingID = getEditBookingId();
        $scope.isEditMode = !!editBookingID;
        $scope.bookingEditLoading = !!editBookingID;

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

                $scope.eventsOpt = returnedData.data.eventTypes;
                $scope.packageTypesOpt = returnedData.data.packageTypes;
            }
            IsabellaCateringWebAppService.getCurrentSessionService().then(function (sessionData) {

                if (sessionData.data.selectedDate) {
                    var dateParts = sessionData.data.selectedDate.split("-");
                    $scope.dateOfEvent = new Date(dateParts[0], (dateParts[1] - 1), dateParts[2]);
                    $scope.changeSummaryDateOutput();
                } else if (!$scope.isEditMode) {
                    $scope.redirectToBookingCalendarPage();
                }

                if (editBookingID) {
                    return loadBookingForEdit(editBookingID);
                }
            });
        }).catch(function () {
            $scope.bookingEditLoading = false;
        });
    };

    $scope.createBooking = function () {
        if (!$scope.validateBookingDetailsStep(true, true)) {
            return;
        }

        var payload = buildBookingSubmission();

        Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to save this booking for Isabella Events?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ec4899',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                IsabellaCateringWebAppService.checkCalendarAvailabilityService($scope.dateOfEvent).then(function (response) {
                    if (response.data.success) {
                        IsabellaCateringWebAppService.insertPackageService(payload.clientInfo, payload.bookingInfo, payload.paymentInfo, payload.packages, payload.sidesGrpTypes, payload.specialsGrpTypes, payload.staffGrpTypes, payload.equipGrpTypes, payload.entertainmentGrpTypes, payload.photoGrpTypes, payload.keepsakesGrpTypes, payload.debutGrpTypes).then(function (returnedData) {
                            if (returnedData.data.success) {
                                Swal.fire({
                                    title: 'Success!',
                                    text: returnedData.data.message,
                                    icon: 'success',
                                    confirmButtonColor: '#ec4899',
                                }).then(function () {
                                    $scope.redirectToBookingCalendarPage();
                                });
                            } else {
                                Swal.fire({
                                    title: 'Error!',
                                    text: returnedData.data.message,
                                    icon: 'error',
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
            }
        });
    };

    $scope.editBooking = function () {
        if (!$scope.validateBookingDetailsStep(true, true)) {
            return;
        }

        var payload = buildBookingSubmission();
        if (!payload.bookingInfo.bookingID) {
            Swal.fire({
                title: 'Missing Booking',
                text: 'No booking is loaded for editing.',
                icon: 'error',
                confirmButtonColor: '#EC4899'
            });
            return;
        }

        Swal.fire({
            title: 'Save changes?',
            text: 'This will update the existing booking.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ec4899',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, update it',
            cancelButtonText: 'No, cancel'
        }).then(function (result) {
            if (!result.isConfirmed) {
                return;
            }

            IsabellaCateringWebAppService.updateBookingService(payload.clientInfo, payload.bookingInfo, payload.paymentInfo, payload.packages, payload.sidesGrpTypes, payload.specialsGrpTypes, payload.staffGrpTypes, payload.equipGrpTypes, payload.entertainmentGrpTypes, payload.photoGrpTypes, payload.keepsakesGrpTypes, payload.debutGrpTypes).then(function (returnedData) {
                if (returnedData.data.success) {
                    Swal.fire({
                        title: 'Updated!',
                        text: returnedData.data.message,
                        icon: 'success',
                        confirmButtonColor: '#ec4899'
                    }).then(function () {
                        $scope.redirectToAdminViewPage();
                    });
                } else {
                    Swal.fire({
                        title: 'Error!',
                        text: returnedData.data.message,
                        icon: 'error',
                        confirmButtonColor: '#ec4899'
                    });
                }
            }).catch(function () {
                Swal.fire({
                    title: 'Server Error',
                    text: 'Could not update the booking.',
                    icon: 'error',
                    confirmButtonColor: '#ec4899'
                });
            });
        });
    };

    $scope.deleteBooking = function () {
        if (!$scope.editBookingID) {
            Swal.fire({
                title: 'Missing Booking',
                text: 'No booking is loaded for deletion.',
                icon: 'error',
                confirmButtonColor: '#EC4899'
            });
            return;
        }

        Swal.fire({
            title: 'Delete booking?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ec4899',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it',
            cancelButtonText: 'No, cancel'
        }).then(function (result) {
            if (!result.isConfirmed) {
                return;
            }

            IsabellaCateringWebAppService.deleteBookingService($scope.editBookingID).then(function (returnedData) {
                if (returnedData.data.success) {
                    Swal.fire({
                        title: 'Deleted!',
                        text: returnedData.data.message,
                        icon: 'success',
                        confirmButtonColor: '#ec4899'
                    }).then(function () {
                        $scope.redirectToBookingCalendarPage();
                    });
                } else {
                    Swal.fire({
                        title: 'Error!',
                        text: returnedData.data.message,
                        icon: 'error',
                        confirmButtonColor: '#ec4899'
                    });
                }
            }).catch(function () {
                Swal.fire({
                    title: 'Server Error',
                    text: 'Could not delete the booking.',
                    icon: 'error',
                    confirmButtonColor: '#ec4899'
                });
            });
        });
    };
    function disableBookingInput() {
        var pkg = ($scope.packageType || "").toLowerCase();
        var evt = ($scope.eventType || "").toLowerCase();

        var isKiddie = pkg.indexOf("kid") !== -1 || evt.indexOf("kid") !== -1;
        var isDebut = pkg.indexOf("debut") !== -1 || evt.indexOf("debut") !== -1;

        $scope.addKdInput = !isKiddie;
        $scope.addDebutInput = !isDebut;
    }

    $scope.changeSummaryDateOutput = function () {
        if (!$scope.dateOfEvent) {
            $scope.formattedDateOfEvent = '';
            return;
        }

        var base = $scope.dateOfEvent.toString().substring(0, 15);
        var parts = base.split(" ");
        $scope.formattedDateOfEvent = `${parts[0]} ${parts[1]} ${parts[2]}, ${parts[3]}`;
    }

    $scope.selectPackageTypes = function (type, id) {
        $scope.packageType = type;
        $scope.packageTypeID = id;
        $scope.activeDropdown = null;

        var request = IsabellaCateringWebAppService.loadPackagePreOptionService($scope.packageTypeID).then(function (returnedData) {
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
            $scope.computeFinalPrice();
        });

        disableBookingInput();
        return request;
    };

    $scope.selectPricePaxType = function (id, type, price) {
        $scope.priceType = type;
        $scope.priceTypeID = id;
        $scope.bookingBasePrice = `Php ${price}`;
        $scope.activeDropdown = null;

        if ($scope.markBookingFieldTouched) {
            $scope.markBookingFieldTouched('guestCount');
        } else {
            $scope.bookingTouchedFields['guestCount'] = true;
        }

        $scope.computeFinalPrice();
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
        disableBookingInput();
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


    $scope.buffetOpt = ['None', 'f Buffet Set - up and Buffet Centerpiece']
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

    $scope.handleDocumentClick = function (event) {
        if (!event.target.closest('.dropdown-container')) {
            $scope.activeDropdown = null;
        }
        $scope.computeFinalPrice();
    };

    $scope.computeFinalPrice = function () {
        var adultTotal = ($scope.addAdult || 0) * ($scope.pricePaxAdMulti || 0);
        var kidTotal = ($scope.addKid || 0) * ($scope.pricePaxKdMulti || 0);
        var basePrice = ($scope.bookingBasePrice || "0").toString().replace(/[^0-9]/g, '');
        var total = adultTotal + kidTotal + parseInt(basePrice);
        $scope.bookingFinalPrice = `Php ${total.toLocaleString()}`;
    };
    

    //====================================================== CLICK OUTSIDE DIRECTIVE END ======================================================

    //====================================================== PACKAGE CARD START ======================================================

    $scope.showPackageCardModal = false;
    $scope.selectedPackageDetails = null;
    $scope.packageCardLoading = false;

    $scope.openPackageCard = function (packageName) {
        $scope.packageCardLoading = true;
        $scope.showPackageCardModal = true;
        $scope.selectedPackageDetails = { packageName: packageName };

        IsabellaCateringWebAppService.getPackageCardDetailsService(packageName).then(function (returnedData) {
            if (returnedData.data.success) {
                $scope.selectedPackageDetails = returnedData.data;
            } else {
                Swal.fire({
                    title: "Error",
                    text: returnedData.data.message || "Failed to load package details.",
                    icon: "error",
                    confirmButtonColor: "#EC4899"
                });
                $scope.closePackageCardModal();
            }
            $scope.packageCardLoading = false;
        }, function () {
            Swal.fire({
                title: "Error",
                text: "An unexpected error occurred.",
                icon: "error",
                confirmButtonColor: "#EC4899"
            });
            $scope.packageCardLoading = false;
            $scope.closePackageCardModal();
        });
    };

    $scope.closePackageCardModal = function () {
        $scope.showPackageCardModal = false;
        $scope.selectedPackageDetails = null;
    };

    //====================================================== PACKAGE CARD END ======================================================

    //======================================================== LANDING PAGE START ========================================================

    $scope.eventPackages = [];
    $scope.regularPackages = [];
    $scope.kiddiePackages = [];
    $scope.weddingPackages = [];
    $scope.debutPackages = [];

    $scope.initLandingPage = function () {
        IsabellaCateringWebAppService.getEventPackagesService().then(function (response) {
            $scope.eventPackages = response.data;
            $scope.regularPackages = $scope.eventPackages.filter(p => p.Category === 'regular');
            $scope.kiddiePackages = $scope.eventPackages.filter(p => p.Category === 'kiddie');
            $scope.weddingPackages = $scope.eventPackages.filter(p => p.Category === 'wedding');
            $scope.debutPackages = $scope.eventPackages.filter(p => p.Category === 'debut');
        }, function (error) {
            console.error("Error loading packages:", error);
        });
    };

    $scope.scrollPackages = function (id, direction) {
        const slider = document.getElementById(id);
        if (slider) {
            const card = slider.querySelector('div');
            if (card) {
                const cardWidth = card.offsetWidth + 24; // Width + spacing
                slider.scrollLeft += direction * cardWidth;
            }
        }
    };

    $scope.selectedPackage = null;
    $scope.isModalOpen = false;

    $scope.openPackageModal = function (pkg) {
        $scope.selectedPackage = pkg;
        $scope.isModalOpen = true;
        document.body.style.overflow = 'hidden';
    };

    $scope.closePackageModal = function () {
        $scope.isModalOpen = false;
        $scope.selectedPackage = null;
        document.body.style.overflow = 'auto';
    };

    $scope.handleModalBackgroundClick = function (event) {
        if (event.target.id === 'packageModal') {
            $scope.closePackageModal();
        }
    };

    //======================================================== LANDING PAGE END ========================================================


});
