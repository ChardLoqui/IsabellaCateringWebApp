using IsabellaCateringWebApp.Models.Context;
using IsabellaCateringWebApp.Models.Models;
using Microsoft.Ajax.Utilities;
using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Bcpg;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Diagnostics.Contracts;
using System.EnterpriseServices;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Transactions;
using System.Web;
using System.Web.Helpers;
using System.Web.Mvc;
using System.Web.Services.Description;
using System.Xml.Linq;
using static System.Runtime.CompilerServices.RuntimeHelpers;

namespace IsabellaCateringWebApp.Controllers
{
    public class MainController : Controller
    {
        private class PasswordResetRequestResult
        {
            public bool Success { get; set; }
            public bool HasActiveToken { get; set; }
            public int? OwnerId { get; set; }
            public string Message { get; set; }
        }

        private class CalendarSearchBookingRow
        {
            public int BookingID { get; set; }
            public DateTime BookingDate { get; set; }
            public string BookingVenue { get; set; }
            public TimeSpan EventTime { get; set; }
            public string EventName { get; set; }
            public string BookingNote { get; set; }
            public string DesignTheme { get; set; }
            public string DesignMotif { get; set; }
            public string PrepVenue { get; set; }
            public string ClientFirstName { get; set; }
            public string ClientLastName { get; set; }
            public string ClientEmail { get; set; }
            public string ClientContact { get; set; }
            public string CelebrantOneFirstName { get; set; }
            public string CelebrantOneLastName { get; set; }
            public string CelebrantTwoFirstName { get; set; }
            public string CelebrantTwoLastName { get; set; }
            public int PaxCount { get; set; }
            public int AddAdult { get; set; }
            public int AddKid { get; set; }
        }

        private static string NormalizeCalendarSearchValue(string value)
        {
            return string.IsNullOrWhiteSpace(value)
                ? string.Empty
                : value.Trim().ToLowerInvariant();
        }

        private static bool ContainsCalendarSearchValue(string value, string query)
        {
            return NormalizeCalendarSearchValue(value).Contains(query);
        }

        private static string CombineCalendarSearchValues(params string[] values)
        {
            return string.Join(" ", values.Where(value => !string.IsNullOrWhiteSpace(value)));
        }

        private static string FormatCalendarSearchTime(TimeSpan value)
        {
            return DateTime.Today.Add(value).ToString("h:mm tt", CultureInfo.InvariantCulture);
        }

        private static int GetCalendarSearchScore(CalendarSearchBookingRow booking, string query)
        {
            if (booking == null || string.IsNullOrWhiteSpace(query))
            {
                return 0;
            }

            var bookingId = booking.BookingID.ToString(CultureInfo.InvariantCulture);
            var displayDate = booking.BookingDate.ToString("MMMM d, yyyy", CultureInfo.InvariantCulture);
            var compactDate = booking.BookingDate.ToString("MM/dd/yyyy", CultureInfo.InvariantCulture);
            var dateKey = booking.BookingDate.ToString("yyyy-M-d", CultureInfo.InvariantCulture);
            var eventTime = FormatCalendarSearchTime(booking.EventTime);
            var clientName = CombineCalendarSearchValues(booking.ClientFirstName, booking.ClientLastName);
            var celebrantOne = CombineCalendarSearchValues(booking.CelebrantOneFirstName, booking.CelebrantOneLastName);
            var celebrantTwo = CombineCalendarSearchValues(booking.CelebrantTwoFirstName, booking.CelebrantTwoLastName);

            var score = 0;

            if (ContainsCalendarSearchValue(booking.EventName, query))
            {
                score += NormalizeCalendarSearchValue(booking.EventName).StartsWith(query) ? 140 : 110;
            }

            if (ContainsCalendarSearchValue(booking.BookingVenue, query))
            {
                score += NormalizeCalendarSearchValue(booking.BookingVenue).StartsWith(query) ? 120 : 90;
            }

            if (ContainsCalendarSearchValue(bookingId, query))
            {
                score += bookingId == query ? 150 : 120;
            }

            if (ContainsCalendarSearchValue(displayDate, query) ||
                ContainsCalendarSearchValue(compactDate, query) ||
                ContainsCalendarSearchValue(dateKey, query))
            {
                score += 100;
            }

            if (ContainsCalendarSearchValue(eventTime, query))
            {
                score += 80;
            }

            if (ContainsCalendarSearchValue(clientName, query))
            {
                score += 70;
            }

            if (ContainsCalendarSearchValue(booking.ClientEmail, query) ||
                ContainsCalendarSearchValue(booking.ClientContact, query))
            {
                score += 65;
            }

            if (ContainsCalendarSearchValue(celebrantOne, query) ||
                ContainsCalendarSearchValue(celebrantTwo, query))
            {
                score += 60;
            }

            if (ContainsCalendarSearchValue(booking.BookingNote, query) ||
                ContainsCalendarSearchValue(booking.DesignTheme, query) ||
                ContainsCalendarSearchValue(booking.DesignMotif, query) ||
                ContainsCalendarSearchValue(booking.PrepVenue, query))
            {
                score += 45;
            }

            if (ContainsCalendarSearchValue(booking.PaxCount.ToString(CultureInfo.InvariantCulture), query) ||
                ContainsCalendarSearchValue(booking.AddAdult.ToString(CultureInfo.InvariantCulture), query) ||
                ContainsCalendarSearchValue(booking.AddKid.ToString(CultureInfo.InvariantCulture), query))
            {
                score += 25;
            }

            if (score > 0)
            {
                return score;
            }

            var haystack = NormalizeCalendarSearchValue(CombineCalendarSearchValues(
                booking.EventName,
                booking.BookingVenue,
                booking.BookingNote,
                booking.DesignTheme,
                booking.DesignMotif,
                booking.PrepVenue,
                booking.ClientFirstName,
                booking.ClientLastName,
                booking.ClientEmail,
                booking.ClientContact,
                booking.CelebrantOneFirstName,
                booking.CelebrantOneLastName,
                booking.CelebrantTwoFirstName,
                booking.CelebrantTwoLastName,
                bookingId,
                displayDate,
                compactDate,
                dateKey,
                eventTime,
                booking.PaxCount.ToString(CultureInfo.InvariantCulture),
                booking.AddAdult.ToString(CultureInfo.InvariantCulture),
                booking.AddKid.ToString(CultureInfo.InvariantCulture)));

            return haystack.Contains(query) ? 10 : 0;
        }

        // GET: Main
        public ActionResult HomePage()
        {
            return View();
        }
        public ActionResult LoginPage()
        {
            return View();
        }
        public ActionResult AccountsPage()
        {
            return View();
        }
        public ActionResult LogsPage()
        {
            return View();
        }

        public ActionResult ChangePassPage()
        {
            return View();
        }

        public ActionResult ForgetPassPage()
        {
            return View();
        }

        public ActionResult CustomerViewPage()
        {
            return View();
        }

        public ActionResult AddBookingPage()
        {
            return View();
        }
        public ActionResult BookingCalendarPage()
        {
            return View();
        }

        public ActionResult PaymentReminderPage()
        {
            return View();
        }
        public ActionResult AdminViewPage()
        {
            return View();
        }
        public JsonResult Logs(string level, string processService, string processDesc)
        {
            try
            {
                string traceId = Guid.NewGuid().ToString();
                string email = "";
                if (Session["currentLog"]?.ToString() != "" && Session["currentLog"]?.ToString() != null)
                {
                    int uID = int.Parse(Session["currentLog"].ToString());
                    int pID = int.Parse(Session["currentPerm"].ToString());
                    using (var db = new IsabellaCateringContext())
                    {
                        
                        var permission = db.permissions_tbl.Where(x => x.permissionID == pID).FirstOrDefault();
                        if (Session["currentPerm"].ToString() == "3")
                        {
                            var client = db.clients_tbl.Where(x => x.clientID == uID).FirstOrDefault();
                            if (client != null)
                            {
                                email = client.cEmail;

                                return Json(new { succes = setLog(uID, permission.permissionDesc, email, level, processService, processDesc, traceId), message = "Logs has been added!" }, JsonRequestBehavior.AllowGet);
                            }
                            else
                            {
                                uID = 0;
                                email = "blank";
                                level = "WARN";
                                processDesc = "Accessed without credentials!";

                                return Json(new { succes = setLog(uID, permission.permissionDesc, email, level, processService, processDesc, traceId), message = "No login!" }, JsonRequestBehavior.AllowGet);
                            }
                        }
                        else
                        {
                            var user = db.users_tbl.Where(x => x.userID == uID).FirstOrDefault();
                            if (user != null)
                            {
                                email = user.email;

                                return Json(new { succes = !setLog(uID, permission.permissionDesc, email, level, processService, processDesc, traceId), message = "Logs has been added!" }, JsonRequestBehavior.AllowGet);
                            }
                            else
                            {
                                uID = 0;
                                email = "blank";
                                level = "WARN";
                                processDesc = "Accessed without credentials!";

                                return Json(new { succes = !setLog(uID, permission.permissionDesc, email, level, processService, processDesc, traceId), message = "No login!" }, JsonRequestBehavior.AllowGet);
                            }
                        }
                    }
                }
                else
                {
                    int uID = 0;
                    string permission = "NULL";
                    email = "blank";
                    level = "WARN";
                    processDesc = "Accessed without credentials!" + processDesc;

                    return Json(new { succes = !setLog(uID, permission, email, level, processService, processDesc, traceId), message = "No login!" }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {

                return Json(new { succes = false, message = "Logs failed!"+ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        public Boolean setLog(int uID, string permission, string uEmail, string level, string procServ, string procDesc, string trace)
        {
            try
            {
                using (var db = new IsabellaCateringContext())
                {


                    var newLog = new tblActivityLogsModel()
                    {
                        userID = uID,
                        permission = permission,
                        userEmail = uEmail,
                        level = level,
                        processService = procServ,
                        processDesc = procDesc,
                        traceID = trace,
                        dateCreated = DateTime.UtcNow
                    };

                    db.activitylogs_tbl.Add(newLog);
                    db.SaveChanges();
                }
                return true;
            }
            catch
            {
                return false;
            }
        }

        // get creds for login
        public JsonResult JsonLogGetCreds(tblUsersModel userInfo, tblClientsModel clientInfo, string isGuest)
        {
            try
            {
                using (var db = new IsabellaCateringContext())
                {
                    if (isGuest == "True")
                    {


                        var verify = db.clients_tbl.Where(x => x.entryCode.Equals(clientInfo.entryCode)).FirstOrDefault();
                        if (verify == null)
                        {
                            return Json(new { success = false, message = "Invalid Credentials" }, JsonRequestBehavior.AllowGet);
                        }

                        if (verify.password == "0")
                        {
                            var resetResult = CreatePasswordResetRequest(db, 0, verify.clientID, verify.cEmail);
                            var detailMessage = resetResult.Success
                                ? "Check your email for a password reset link!"
                                : resetResult.HasActiveToken
                                    ? "A reset link is already active. Please check your email."
                                    : resetResult.Message ?? "We could not send a reset link. Please contact us.";

                            return Json(new
                            {
                                success = false,
                                requiresPasswordChange = true,
                                message = "Please change your password first!",
                                detail = detailMessage
                            }, JsonRequestBehavior.AllowGet);
                        }

                        if (verify.lockoutEnd.HasValue && verify.lockoutEnd.Value > DateTime.Now)
                        {
                            var waitTime = (verify.lockoutEnd.Value - DateTime.Now).Minutes;

                            waitTime = waitTime == 0 ? 1 : waitTime;

                            return Json(new { success = false, message = $"Account locked. Try again in {waitTime} minutes." }, JsonRequestBehavior.AllowGet);
                        }
                        else if (verify.password == clientInfo.password)
                        {
                            verify.attempts = 0;
                            verify.lockoutEnd = null;
                            db.SaveChanges();

                            var creds = new tblClientsModel()
                            {
                                clientID = verify.clientID,
                                permissionID = verify.permissionID,
                                receiptID = verify.receiptID
                            };

                            var receipt = db.bookingreceipts_tbl.Where(x => x.receiptID.Equals(creds.receiptID)).FirstOrDefault();
                            if (receipt != null)
                            {
                                Session["currentLog"] = creds.clientID.ToString();
                                Session["currentPerm"] = creds.permissionID.ToString();
                                Session["isGuest"] = "True";
                                Session["currentBooking"] = receipt.bookingID.ToString();

                                Logs(
                                "INFO",
                                "ICMS Login:",
                                "Account Logged In");
                                return Json(new { success = true, data = creds, isGuest = true }, JsonRequestBehavior.AllowGet);
                            }
                            else
                            {
                                return Json(new { success = false, message = "Receipt not found! Please contact us!" }, JsonRequestBehavior.AllowGet);
                            }
                        }
                        else
                        {
                            verify.attempts += 1;

                            if (verify.attempts >= 3)
                            {
                                verify.lockoutEnd = DateTime.Now.AddMinutes(15); // Lock account for 15 minutes
                                db.SaveChanges();

                                Logs(
                                "WARN",
                                "ICMS Login:",
                                "Attempted to Login with multiple incorrect attempts. \"Account Locked\"");
                                return Json(new { success = false, message = "Account Locked" }, JsonRequestBehavior.AllowGet);
                            }

                            db.SaveChanges();
                            
                            int attemptsLeft = 3 - verify.attempts;
                            Logs(
                                "WARN",
                                "ICMS Login:",
                                $"Attempted to Login with incorrect attempts. Invalid password. {attemptsLeft} attempts remaining.");
                            return Json(new { success = false, message = $"Invalid password. {attemptsLeft} attempts remaining." }, JsonRequestBehavior.AllowGet);
                        }
                    }
                    else
                    {

                        var verify = db.users_tbl.Where(x => x.email.Equals(userInfo.email)).FirstOrDefault();

                        if (verify.isActive != 1)
                        {
                            return Json(new { success = false, message = "Account Disabled! Please contact the administrators for account activation" }, JsonRequestBehavior.AllowGet);
                        }

                        if (verify == null)
                        {
                            return Json(new { success = false, message = "Invalid Credentials" }, JsonRequestBehavior.AllowGet);
                        }

                        if (verify.lockoutEnd.HasValue && verify.lockoutEnd.Value > DateTime.Now)
                        {
                            var waitTime = (verify.lockoutEnd.Value - DateTime.Now).Minutes;

                            waitTime = waitTime == 0 ? 1 : waitTime;

                            return Json(new { success = false, message = $"Account locked. Try again in {waitTime} minutes." }, JsonRequestBehavior.AllowGet);
                        }
                        else if (verify.password == userInfo.password)
                        {
                            verify.attempts = 0;
                            verify.lockoutEnd = null;
                            db.SaveChanges();

                            var creds = new tblUsersModel()
                            {
                                userID = verify.userID,
                                permissionID = verify.permissionID
                            };
                            Session["currentLog"] = creds.userID.ToString();
                            Session["currentPerm"] = creds.permissionID.ToString();
                            Session["isGuest"] = "False";

                            Logs(
                                "INFO",
                                "ICMS Login:",
                                "Account Logged In");
                            return Json(new { success = true, data = creds, isGuest = false }, JsonRequestBehavior.AllowGet);
                        }
                        else
                        {
                            verify.attempts += 1;

                            if (verify.attempts >= 3)
                            {
                                verify.lockoutEnd = DateTime.Now.AddMinutes(15); // Lock account for 15 minutes
                                db.SaveChanges();
                                Logs(
                                "WARN",
                                "ICMS Login:",
                                "Attempted to Login with multiple incorrect attempts. \"Account Locked\"");
                                return Json(new { success = false, message = "Account Locked" }, JsonRequestBehavior.AllowGet);
                            }

                            db.SaveChanges();

                            int attemptsLeft = 3 - verify.attempts;
                            Logs(
                                "WARN",
                                "ICMS Login:",
                                $"Attempted to Login with incorrect attempts. Invalid password. {attemptsLeft} attempts remaining.");
                            return Json(new { success = false, message = $"Invalid password. {attemptsLeft} attempts remaining." }, JsonRequestBehavior.AllowGet);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw new ArgumentException($"There is an ERROR while upserting in database +++{ex.Message}+++ : +++{ex.StackTrace}+++ : +++{ex.InnerException}+++");
            }
        }
        //get current session

        public JsonResult setBookingView(int bookingID)
        {
            try
            {
                Session["currentBooking"] = bookingID.ToString();
                Logs(
                    "INFO",
                    "Booking View:",
                    "Request set booking view.");
                return Json(new { success = true, message = "Session Set!" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                Logs(
                "LETHAL",
                "Booking View:",
                "Attempted to request set booking view. " + ex.Message + "" + ex.InnerException);
                throw new ArgumentException($"There is an ERROR while accessing database {ex.Message}:{ex.StackTrace}:{ex.InnerException}");
            }

        }
        public JsonResult getCurrentSession()
        {
            try
            {
                var creds = new
                {
                    userID = Session["currentLog"]?.ToString() ?? string.Empty,
                    permID = Session["currentPerm"]?.ToString() ?? string.Empty,
                    selectedDate = Session["bookingSelectedDate"]?.ToString() ?? string.Empty,
                    isGuest = Session["isGuest"]?.ToString() ?? string.Empty,
                    bookingID = Session["currentBooking"]?.ToString() ?? string.Empty
                };
                return Json(creds, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                Logs(
                "LETHAL",
                "ICMS:",
                "Attempted to get session. " + ex.Message + "" + ex.InnerException);
                throw new ArgumentException($"There is an ERROR while accessing database {ex.Message}:{ex.StackTrace}:{ex.InnerException}");
            }
        }

        //for navbar (test)
        public JsonResult getCurrentSessionNav()
        {
            var uID = Session["currentLog"]?.ToString();
            var pID = Session["currentPerm"]?.ToString() ?? "";
            var isG = Session["isGuest"]?.ToString();
            string uName = "Loading..";

            if (!string.IsNullOrEmpty(uID))
            {
                if (isG == "True")
                {
                    int id = int.Parse(uID);
                    using (var db = new IsabellaCateringContext())
                    {
                        var user = db.clients_tbl.FirstOrDefault(x => x.clientID == id);
                        if (user != null) uName = $"{user.cFName} {user.cLName}";
                    }
                }
                else
                {
                    int id = int.Parse(uID);
                    using (var db = new IsabellaCateringContext())
                    {
                        var user = db.users_tbl.FirstOrDefault(x => x.userID == id);
                        if (user != null) uName = $"{user.firstName} {user.lastName}";
                    }
                }

            }
            return Json(new
            {
                userID = uID,
                userName = uName,
                permID = pID,
                isGuest = isG
            }, JsonRequestBehavior.AllowGet);
        }

        //bago, to add user
        [HttpPost]
        public JsonResult usrInfo(tblUsersModel userData)
        {
            try
            {
                using (var db = new IsabellaCateringContext())
                {
                    var userInfo = new tblUsersModel()
                    {
                        permissionID = userData.permissionID,
                        firstName = userData.firstName,
                        lastName = userData.lastName,
                        email = userData.email,
                        password = userData.password,
                        isActive = userData.isActive,
                        dateCreated = DateTime.Now,
                        dateUpdated = DateTime.Now
                    };

                    db.users_tbl.Add(userInfo);
                    db.SaveChanges();
                    Logs(
                    "INFO",
                    "Account Management:",
                    $"New account has been registered with userID: {userInfo.userID}");
                }

                return Json(new { success = true, message = "Saved successfully!" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                string realError = ex.Message;
                if (ex.InnerException != null)
                {
                    realError = ex.InnerException.Message;
                    if (ex.InnerException.InnerException != null)
                    {
                        realError = ex.InnerException.InnerException.Message;
                    }
                }

                return Json(new { success = false, message = realError }, JsonRequestBehavior.AllowGet);
            }
        }

        public JsonResult GetUsers()
        {
            using (var db = new IsabellaCateringContext())
            {
                // Project into an anonymous object first
                var data = db.users_tbl.Select(u => new
                {
                    userID = u.userID,
                    permissionID = u.permissionID,
                    firstName = u.firstName,
                    lastName = u.lastName,
                    email = u.email,
                    isActive = u.isActive,
                    dateCreated = u.dateCreated,
                    dateUpdated = u.dateUpdated
                }).ToList(); // Execution happens here

                return Json(data, JsonRequestBehavior.AllowGet);
            }
        }

        public JsonResult logOut()
        {
            try
            {
                Logs(
                    "INFO",
                    "ICMS:",
                    "Account Logged Out.");

                Session.Clear();
                Session.Abandon();
                return Json(new { success = true, message = "Logout Success" }, JsonRequestBehavior.AllowGet);

            }
            catch (Exception ex)
            {
                Logs(
                    "LETHAL",
                    "ICMS:",
                    "Attempted to log out. "+ex.Message+" "+ex.InnerException);
                throw new ArgumentException($"There is an ERROR while upserting in database {ex.Message}:{ex.StackTrace}:{ex.InnerException}");
            }
        }

        //token generation
        public string GenerateToken()
        {
            byte[] bytes = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(bytes);
            }
            return Convert.ToBase64String(bytes);
        }

        public string HashToken(string token)
        {
            using (var sha = SHA256.Create())
            {
                byte[] bytes = Encoding.UTF8.GetBytes(token);
                byte[] hash = sha.ComputeHash(bytes);
                return Convert.ToBase64String(hash);
            }
        }

        private string NormalizePasswordResetToken(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                return null;
            }

            return token.Trim().Replace(" ", "+");
        }

        private void RemoveExpiredPasswordResetTokens(IsabellaCateringContext db, DateTime now)
        {
            var expiredTokens = db.passwordtokens_tbl
                .Where(x => x.dateExpiry < now)
                .ToList();

            if (expiredTokens.Any())
            {
                db.passwordtokens_tbl.RemoveRange(expiredTokens);
                db.SaveChanges();
            }
        }

        private string BuildPasswordResetLink(string token)
        {
            if (Request != null && Request.Url != null)
            {
                return Url.Action("ChangePassPage", "Main", new { token }, Request.Url.Scheme);
            }

            return "https://localhost:44323/Main/ChangePassPage?token=" + HttpUtility.UrlEncode(token);
        }

        private void SendPasswordResetEmail(string recipientEmail, string token)
        {
            if (string.IsNullOrWhiteSpace(recipientEmail))
            {
                throw new InvalidOperationException("No email address is available for password reset.");
            }

            var pickupDirectory = @"C:\Emails";
            Directory.CreateDirectory(pickupDirectory);

            using (var smtp = new SmtpClient())
            using (var mail = new MailMessage())
            {
                smtp.DeliveryMethod = SmtpDeliveryMethod.SpecifiedPickupDirectory;
                smtp.PickupDirectoryLocation = pickupDirectory;

                mail.From = new MailAddress("no-reply@localhost");
                mail.To.Add(recipientEmail);
                mail.Subject = "Reset Password";
                mail.Body = "Your Password Reset Link " + BuildPasswordResetLink(token);

                smtp.Send(mail);
            }
            Logs(
                "INFO",
                "Password Reset:",
                "Request password token created.");
            Logs(
                "INFO",
                "Password Reset:",
                $"Request password link created and sent to email. Email Address: {recipientEmail}");
        }

        private PasswordResetRequestResult CreatePasswordResetRequest(IsabellaCateringContext db, int userId, int clientId, string recipientEmail)
        {
            if (userId <= 0 && clientId <= 0)
            {
                return new PasswordResetRequestResult
                {
                    Success = false,
                    Message = "No account was found for password reset."
                };
            }
            

            if (string.IsNullOrWhiteSpace(recipientEmail))
            {
                return new PasswordResetRequestResult
                {
                    Success = false,
                    OwnerId = userId > 0 ? userId : clientId,
                    Message = "The account does not have a valid email address."
                };
            }

            var now = DateTime.UtcNow;
            RemoveExpiredPasswordResetTokens(db, now);

            var hasActiveToken = userId > 0
                ? db.passwordtokens_tbl.Any(x => x.userID == userId && x.dateExpiry > now)
                : db.passwordtokens_tbl.Any(x => x.clientID == clientId && x.dateExpiry > now);

            Logs(
                "WARN",
                "Password Reset:",
                "Expired password reset token has been removed.");

            if (hasActiveToken)
            {
                return new PasswordResetRequestResult
                {
                    Success = false,
                    HasActiveToken = true,
                    OwnerId = userId > 0 ? userId : clientId,
                    Message = "A reset link is already active. Please check your email."
                };
            }

            var token = GenerateToken();
            var tokenHash = HashToken(token);

            var passwordToken = new tblPasswordTokensModel
            {
                userID = userId,
                clientID = clientId,
                hashedToken = tokenHash,
                dateCreated = now,
                dateExpiry = now.AddMinutes(10)
            };

            db.passwordtokens_tbl.Add(passwordToken);
            db.SaveChanges();

            try
            {
                SendPasswordResetEmail(recipientEmail, token);
            }
            catch
            {
                db.passwordtokens_tbl.Remove(passwordToken);
                db.SaveChanges();
                throw;
            }

            return new PasswordResetRequestResult
            {
                Success = true,
                OwnerId = userId > 0 ? userId : clientId,
                Message = "Password reset link sent."
            };
        }

        private bool IsPasswordResetTokenValid(IsabellaCateringContext db, string token)
        {
            var normalizedToken = NormalizePasswordResetToken(token);
            if (string.IsNullOrWhiteSpace(normalizedToken))
            {
                return false;
            }

            var hash = HashToken(normalizedToken);
            var verify = db.passwordtokens_tbl.FirstOrDefault(x => x.hashedToken.Equals(hash));

            return verify != null && verify.dateExpiry >= DateTime.UtcNow;
        }

        public JsonResult ForgetVerifyEmail(string userEmail)
        {
            try
            {
                using (var db = new IsabellaCateringContext())
                {
                    var normalizedEmail = (userEmail ?? string.Empty).Trim();
                    var verify = db.users_tbl.FirstOrDefault(x => x.email.Equals(normalizedEmail));
                    if (verify == null)
                    {
                        return Json(new
                        {
                            success = false,
                            hasActiveToken = false,
                            ownerId = (int?)null,
                            message = "The email you entered is not registered in our system."
                        }, JsonRequestBehavior.AllowGet);
                    }

                    var result = CreatePasswordResetRequest(db, verify.userID, 0, verify.email);
                    return Json(new
                    {
                        success = result.Success,
                        hasActiveToken = result.HasActiveToken,
                        ownerId = result.OwnerId,
                        message = result.Message
                    }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                Logs(
                    "LETHAL",
                    "Password Reset:",
                    "Attempted to request password reset link. " + ex.Message + " " + ex.InnerException);
                    
                throw new ArgumentException($"There is an ERROR while upserting in database {ex.Message}:{ex.StackTrace}:{ex.InnerException}");
            }
        }

        public JsonResult ForgetVerifyEmailClient(string userEmail, string entryCode)
        {
            try
            {
                using (var db = new IsabellaCateringContext())
                {
                    var normalizedEntryCode = (entryCode ?? string.Empty).Trim();
                    var verify = db.clients_tbl.FirstOrDefault(x => x.entryCode.Equals(normalizedEntryCode));
                    if (verify == null)
                    {
                        return Json(new
                        {
                            success = false,
                            hasActiveToken = false,
                            ownerId = (int?)null,
                            message = "The entry code you entered is not registered in our system."
                        }, JsonRequestBehavior.AllowGet);
                    }

                    var result = CreatePasswordResetRequest(db, 0, verify.clientID, verify.cEmail);
                    return Json(new
                    {
                        success = result.Success,
                        hasActiveToken = result.HasActiveToken,
                        ownerId = result.OwnerId,
                        message = result.Message
                    }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                Logs(
                    "LETHAL",
                    "Password Reset:",
                    "Attempted to request password reset link. " + ex.Message + " " + ex.InnerException);
                throw new ArgumentException($"There is an ERROR while upserting in database {ex.Message}:{ex.StackTrace}:{ex.InnerException}");
            }
        }

        public JsonResult VerifyForgetToken(string token)
        {
            try
            {
                using (var db = new IsabellaCateringContext())
                {
                    return Json(new
                    {
                        valid = IsPasswordResetTokenValid(db, token)
                    }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                Logs(
                    "LETHAL",
                    "Password Reset:",
                    "Attempted to verify password reset token. " + ex.Message + " " + ex.InnerException);
                throw new ArgumentException($"There is an ERROR while upserting in database {ex.Message}:{ex.StackTrace}:{ex.InnerException}");
            }
        }

        public JsonResult changeForgotPassword(string unhashedToken, string newPassword)
        {
            try
            {
                using (var db = new IsabellaCateringContext())
                {
                    var correctedToken = NormalizePasswordResetToken(unhashedToken);
                    if (string.IsNullOrWhiteSpace(correctedToken) || string.IsNullOrWhiteSpace(newPassword))
                    {
                        return Json(new { success = false }, JsonRequestBehavior.AllowGet);
                    }

                    string hash = HashToken(correctedToken);

                    var verify = db.passwordtokens_tbl.FirstOrDefault(x => x.hashedToken.Equals(hash));
                    if (verify == null || verify.dateExpiry < DateTime.UtcNow)
                    {
                        return Json(new { success = false }, JsonRequestBehavior.AllowGet);
                    }

                    if (verify.clientID == 0)
                    {
                        var userData = db.users_tbl.FirstOrDefault(x => x.userID.Equals(verify.userID));
                        if (userData == null)
                        {
                            return Json(new { success = false }, JsonRequestBehavior.AllowGet);
                        }

                        userData.password = newPassword;
                        userData.attempts = 0;
                        userData.lockoutEnd = null;
                        userData.dateUpdated = DateTime.Now;
                    }
                    else if (verify.userID == 0)
                    {
                        var clientData = db.clients_tbl.FirstOrDefault(x => x.clientID.Equals(verify.clientID));
                        if (clientData == null)
                        {
                            return Json(new { success = false }, JsonRequestBehavior.AllowGet);
                        }

                        clientData.password = newPassword;
                        clientData.attempts = 0;
                        clientData.lockoutEnd = null;
                        clientData.dateUpdated = DateTime.Now;

                        Logs(
                        "WARN",
                        "Password Reset:",
                        $"Password has been changed for customer account. clientID: {clientData.clientID}");
                        Logs(
                        "WARN",
                        "Password Reset:",
                        $"Password token deleted for customer account. clientID: {clientData.clientID}");
                    }
                    else
                    {
                        return Json(new { success = false }, JsonRequestBehavior.AllowGet);
                    }

                    db.passwordtokens_tbl.Remove(verify);
                    db.SaveChanges();
                    
                    return Json(new { success = true }, JsonRequestBehavior.AllowGet);

                }
            }
            catch (Exception ex)
            {
                Logs(
                    "LETHAL",
                    "Password Reset:",
                    "Attempted to log out. " + ex.Message + " " + ex.InnerException);
                throw new ArgumentException($"There is an ERROR while upserting in database {ex.Message}:{ex.StackTrace}:{ex.InnerException}");
            }
        }

        // for delete
        [HttpPost]
        public JsonResult DeleteUser(int id)
        {
            try
            {
                using (var db = new IsabellaCateringContext())
                {
                    var user = db.users_tbl.Find(id);
                    if (user != null)
                    {
                        db.users_tbl.Remove(user);
                        db.SaveChanges();

                        return Json(new { success = true });
                    }
                    Logs(
                    "WARN",
                    "Account Management:",
                    "Attempted to delete user details. Message : \"User not found.\"");
                    return Json(new { success = false, message = "User not found." });
                }
            }
            catch (Exception ex)
            {
                Logs(
                "LETHAL",
                "Account Management:",
                "Attempted to delete user details. " + ex.Message + "" + ex.InnerException);
                return Json(new { success = false, message = ex.Message });
            }
        }

        // for update
        [HttpPost]
        public JsonResult UpdateUser(tblUsersModel userInfo)
        {
            try
            {
                using (var db = new IsabellaCateringContext())
                {
                    var user = db.users_tbl.Find(userInfo.userID);
                    if (user != null)
                    {
                        user.permissionID = userInfo.permissionID;
                        user.firstName = userInfo.firstName;
                        user.lastName = userInfo.lastName;
                        user.isActive = userInfo.isActive;
                        user.dateUpdated = DateTime.Now;

                        db.SaveChanges();
                        return Json(new { success = true });
                    }
                    Logs(
                    "WARN",
                    "Account Management:",
                    "Attempted to update user details. Message : \"User not found.\"");
                    return Json(new { success = false, message = "User not found." });
                }
            }
            catch (Exception ex)
            {
                Logs(
                "LETHAL",
                "Account Management:",
                "Attempted to update user details. " + ex.Message + "" + ex.InnerException);
                return Json(new { success = false, message = ex.Message });
            }
        }
        
        public JsonResult getBooking(tblBookingsModel booking)
        {
            try
            {
                using (var db = new IsabellaCateringContext())
                {
                    var bookingUpdate = db.bookings_tbl
                                    .Where(b => b.bookingID == booking.bookingID)
                                    .FirstOrDefault();

                    if (bookingUpdate == null)
                    {
                        return Json(new { message = "Booking not found", bookingID = booking.bookingID }, JsonRequestBehavior.AllowGet);
                    }
                    else
                    {
                        return Json(bookingUpdate, JsonRequestBehavior.AllowGet);
                    }
                }
            }
            catch (Exception ex)
            {
                Logs(
                "LETHAL",
                "Booking View:",
                "Attempted to get booking details. " + ex.Message + "" + ex.InnerException);
                return Json(new { message = "Error connecting to DB: " + ex.Message, bookingID = booking.bookingID }, JsonRequestBehavior.AllowGet);
            }
        }

        public JsonResult checkCalendarAvailability(string formattedDate)
        {
            try
            {
                if (formattedDate == null)
                {
                    Session["bookingSelectedDate"] = formattedDate;
                    return Json(new { success = false, selectedDate = Session["bookingSelectedDate"], message = "Please select a date first!" }, JsonRequestBehavior.AllowGet);
                }


                DateTime csharpDate = DateTime.Parse(formattedDate, null, System.Globalization.DateTimeStyles.RoundtripKind);
                using (var db = new IsabellaCateringContext())
                {
                    var bookings = db.bookings_tbl
                                        .Where(b => b.bookingDate == csharpDate)
                                        .ToList();
                    if (bookings.Count < 5)
                    {
                        Session["bookingSelectedDate"] = formattedDate;
                        return Json(new { success = true, selectedDate = Session["bookingSelectedDate"], message = "Create Request Granted!" }, JsonRequestBehavior.AllowGet);
                    }
                    else
                        return Json(new { success = false, selectedDate = Session["bookingSelectedDate"], message = "The Number of bookings for this day has reached it's limits!" }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                Logs(
                "LETHAL",
                "Booking Calendar:",
                "Attempted to get booking availability. " + ex.Message + "" + ex.InnerException);
                return Json(new { message = "Error connecting to DB: " + ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult getCalendarBooking(string formattedDate)
        {
            try
            {
                DateTime csharpDate = DateTime.Parse(formattedDate, null, System.Globalization.DateTimeStyles.RoundtripKind);
                using (var db = new IsabellaCateringContext())
                {
                    var bookings = db.bookings_tbl
                                    .Where(b => b.bookingDate == csharpDate)
                                    .ToList();

                    if (bookings == null)
                    {
                        return Json(new { success = false, message = "No Bookings Found!" }, JsonRequestBehavior.AllowGet);
                    }
                    else
                    {
                        return Json(new { bookingData = bookings, success = true, message = "No Bookings Found!" }, JsonRequestBehavior.AllowGet);
                    }
                }
            }
            catch (Exception ex)
            {
                Logs(
                "LETHAL",
                "Booking Calendar:",
                "Attempted to get booking details. " + ex.Message + "" + ex.InnerException);
                return Json(new { message = "Error connecting to DB: " + ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        public JsonResult getCalendarMonth(int year, int month)
        {
            try
            {
                Session.Remove("currentBooking");
                Session.Remove("bookingSelectedDate");
                if (month < 1 || month > 12)
                {
                    return Json(new { success = false, message = "Invalid month." }, JsonRequestBehavior.AllowGet);
                }

                var monthStart = new DateTime(year, month, 1);
                var monthEnd = monthStart.AddMonths(1);

                using (var db = new IsabellaCateringContext())
                {
                    var bookings = (from booking in db.bookings_tbl
                                    join client in db.clients_tbl on booking.clientID equals client.clientID
                                    where booking.bookingDate >= monthStart && booking.bookingDate < monthEnd
                                    select new
                                    {
                                        bookingID = booking.bookingID,
                                        bookingDate = booking.bookingDate,
                                        bookingVenue = booking.venue,
                                        eventName = client.eventName,
                                        eventTime = booking.eventTime
                                    })
                                    .ToList()
                                    .Select(booking => new
                                    {
                                        booking.bookingID,
                                        dateKey = booking.bookingDate.Year + "-" + booking.bookingDate.Month + "-" + booking.bookingDate.Day,
                                        booking.bookingVenue,
                                        booking.eventName,
                                        booking.eventTime
                                    })
                                    .ToList();

                    return Json(new { bookingData = bookings, success = true }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                Logs(
                "LETHAL",
                "Booking Calendar:",
                "Attempted to get booking details. " + ex.Message + "" + ex.InnerException);
                return Json(new { success = false, message = "Error connecting to DB: " + ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        public JsonResult findbooking(string query)
        {
            try
            {
                var normalizedQuery = NormalizeCalendarSearchValue(query);
                if (string.IsNullOrWhiteSpace(normalizedQuery))
                {
                    return Json(new { success = true, bookingData = new object[0] }, JsonRequestBehavior.AllowGet);
                }

                using (var db = new IsabellaCateringContext())
                {
                    var bookings = (from booking in db.bookings_tbl
                                    join clientEntry in db.clients_tbl on booking.clientID equals clientEntry.clientID into bookingClients
                                    from client in bookingClients.DefaultIfEmpty()
                                    select new CalendarSearchBookingRow
                                    {
                                        BookingID = booking.bookingID,
                                        BookingDate = booking.bookingDate,
                                        BookingVenue = booking.venue,
                                        EventTime = booking.eventTime,
                                        EventName = client != null ? client.eventName : string.Empty,
                                        BookingNote = booking.bookingNote,
                                        DesignTheme = booking.dsgnTheme,
                                        DesignMotif = booking.dsgnMotif,
                                        PrepVenue = booking.prepVenue,
                                        ClientFirstName = client != null ? client.cFName : string.Empty,
                                        ClientLastName = client != null ? client.cLName : string.Empty,
                                        ClientEmail = client != null ? client.cEmail : string.Empty,
                                        ClientContact = client != null ? client.cContact : string.Empty,
                                        CelebrantOneFirstName = client != null ? client.cCeleb1FName : string.Empty,
                                        CelebrantOneLastName = client != null ? client.cCeleb1LName : string.Empty,
                                        CelebrantTwoFirstName = client != null ? client.cCeleb2FName : string.Empty,
                                        CelebrantTwoLastName = client != null ? client.cCeleb2LName : string.Empty,
                                        PaxCount = booking.paxCount,
                                        AddAdult = booking.addAdult,
                                        AddKid = booking.addKid
                                    })
                                    .ToList();

                    var results = bookings
                        .Select(booking => new
                        {
                            booking.BookingID,
                            booking.BookingDate,
                            booking.BookingVenue,
                            booking.EventName,
                            booking.EventTime,
                            Score = GetCalendarSearchScore(booking, normalizedQuery)
                        })
                        .Where(booking => booking.Score > 0)
                        .OrderByDescending(booking => booking.Score)
                        .ThenBy(booking => Math.Abs((booking.BookingDate.Date - DateTime.Today).Days))
                        .ThenBy(booking => booking.BookingDate)
                        .ThenBy(booking => booking.BookingID)
                        .Take(8)
                        .Select(booking => new
                        {
                            bookingID = booking.BookingID,
                            bookingDate = booking.BookingDate,
                            dateKey = booking.BookingDate.Year + "-" + booking.BookingDate.Month + "-" + booking.BookingDate.Day,
                            bookingVenue = booking.BookingVenue,
                            eventName = booking.EventName,
                            eventTime = booking.EventTime
                        })
                        .ToList();

                    return Json(new { success = true, bookingData = results }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                Logs(
                "LETHAL",
                "Booking Calendar:",
                "Attempted to search booking calendar. " + ex.Message + "" + ex.InnerException);
                return Json(new { success = false, message = "Error connecting to DB: " + ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        public JsonResult getBookingDetails(int bookingID)
        {
            try
            {
                using (var db = new IsabellaCateringContext())
                {
                    var bookings = db.bookings_tbl
                                    .Where(b => b.bookingID == bookingID)
                                    .FirstOrDefault();

                    if (bookings == null)
                    {
                        return Json(new { success = false, message = "No Bookings Found!" }, JsonRequestBehavior.AllowGet);
                    }
                    else
                    {
                        Session["bookingSelectedDate"] = bookings.bookingDate.ToString("yyyy-M-d");
                        var bookingPackage = db.packages_tbl
                                    .Where(p => p.packageID == bookings.packageID)
                                    .FirstOrDefault();

                        if (bookingPackage != null)
                        {
                            var preMainCourse = db.maincoursetypes_tbl.Where(p => p.mainCourseTypID == bookingPackage.mainCourseTypID).FirstOrDefault();
                            var preSides = db.sidesgrptypes_tbl.Where(p => p.sidesGrpTypID == bookingPackage.sidesGrpTypID).FirstOrDefault();
                            var preCenterPiece = db.centerpiecetypes_tbl.Where(p => p.centerPieceTypID == bookingPackage.centerPieceTypID).FirstOrDefault();
                            var preSeating = db.seatingtypes_tbl.Where(p => p.seatingTypID == bookingPackage.seatingTypID).FirstOrDefault();
                            var preSpecials = db.specialsgrptypes_tbl.Where(p => p.specialsGrpTypID == bookingPackage.specialsGrpTypID).FirstOrDefault();
                            var preStaff = db.staffgrptypes_tbl.Where(p => p.staffGrpTypID == bookingPackage.staffGrpTypID).FirstOrDefault();
                            var preBackdrop = db.backdroptypes_tbl.Where(p => p.backdropTypID == bookingPackage.backdropTypID).FirstOrDefault();
                            var preEntrance = db.entrancetypes_tbl.Where(p => p.entranceTypID == bookingPackage.entranceTypID).FirstOrDefault();
                            var preCouch = db.couchtypes_tbl.Where(p => p.couchTypID == bookingPackage.couchTypID).FirstOrDefault();
                            var preEquip = db.equipgrptypes_tbl.Where(p => p.equipGrpTypID == bookingPackage.equipGrpTypID).FirstOrDefault();
                            var preEntertainment = db.entertainmentgrptypes_tbl.Where(p => p.entertainmentGrpTypID == bookingPackage.entertainmentGrpTypID).FirstOrDefault();
                            var prePhoto = db.photogrptypes_tbl.Where(p => p.photoGrpTypID == bookingPackage.photoGrpTypID).FirstOrDefault();
                            var preKeepsakes = db.keepsakesgrptypes_tbl.Where(p => p.keepsakesGrpTypID == bookingPackage.keepsakesGrptypID).FirstOrDefault();
                            var preDebut = db.debutgrptypes_tbl.Where(p => p.debutGrpTypID == bookingPackage.debutGrpTypID).FirstOrDefault();
                            var packageType = db.packagetypes_tbl.Where(p => p.packageTypID == bookingPackage.packageTypID).FirstOrDefault();

                            if (preMainCourse != null &&
                                preSides != null &&
                                preCenterPiece != null &&
                                preSeating != null &&
                                preSpecials != null &&
                                preStaff != null &&
                                preBackdrop != null &&
                                preEntrance != null &&
                                preCouch != null &&
                                preEquip != null &&
                                preEntertainment != null &&
                                prePhoto != null &&
                                preKeepsakes != null &&
                                preDebut != null)
                            {
                                var preSides1 = db.sidestypes_tbl.Where(p => p.sidesTypID == preSides.sidesGrpTyp1).FirstOrDefault();
                                var preSides2 = db.sidestypes_tbl.Where(p => p.sidesTypID == preSides.sidesGrpTyp2).FirstOrDefault();
                                var preSides3 = db.sidestypes_tbl.Where(p => p.sidesTypID == preSides.sidesGrpTyp3).FirstOrDefault();
                                var preSides4 = db.sidestypes_tbl.Where(p => p.sidesTypID == preSides.sidesGrpTyp4).FirstOrDefault();

                                var preSpecials1 = db.specialstypes_tbl.Where(p => p.specialsTypID == preSpecials.specialsGrpTyp1).FirstOrDefault();
                                var preSpecials2 = db.specialstypes_tbl.Where(p => p.specialsTypID == preSpecials.specialsGrpTyp2).FirstOrDefault();
                                var preSpecials3 = db.specialstypes_tbl.Where(p => p.specialsTypID == preSpecials.specialsGrpTyp3).FirstOrDefault();
                                var preSpecials4 = db.specialstypes_tbl.Where(p => p.specialsTypID == preSpecials.specialsGrpTyp4).FirstOrDefault();
                                var preSpecials5 = db.specialstypes_tbl.Where(p => p.specialsTypID == preSpecials.specialsGrpTyp5).FirstOrDefault();
                                var preSpecials6 = db.specialstypes_tbl.Where(p => p.specialsTypID == preSpecials.specialsGrpTyp6).FirstOrDefault();
                                var preSpecials7 = db.specialstypes_tbl.Where(p => p.specialsTypID == preSpecials.specialsGrpTyp7).FirstOrDefault();
                                var preSpecials8 = db.specialstypes_tbl.Where(p => p.specialsTypID == preSpecials.specialsGrpTyp8).FirstOrDefault();
                                var preSpecials9 = db.specialstypes_tbl.Where(p => p.specialsTypID == preSpecials.specialsGrpTyp9).FirstOrDefault();

                                var preStaff1 = db.stafftypes_tbl.Where(p => p.staffTypID == preStaff.staffGrpTyp1).FirstOrDefault();
                                var preStaff2 = db.stafftypes_tbl.Where(p => p.staffTypID == preStaff.staffGrpTyp2).FirstOrDefault();
                                var preStaff3 = db.stafftypes_tbl.Where(p => p.staffTypID == preStaff.staffGrpTyp3).FirstOrDefault();

                                var preEquip1 = db.equiptypes_tbl.Where(p => p.equipTypID == preEquip.equipGrpTyp1).FirstOrDefault();
                                var preEquip2 = db.equiptypes_tbl.Where(p => p.equipTypID == preEquip.equipGrpTyp2).FirstOrDefault();
                                var preEquip3 = db.equiptypes_tbl.Where(p => p.equipTypID == preEquip.equipGrpTyp3).FirstOrDefault();
                                var preEquip4 = db.equiptypes_tbl.Where(p => p.equipTypID == preEquip.equipGrpTyp4).FirstOrDefault();
                                var preEquip5 = db.equiptypes_tbl.Where(p => p.equipTypID == preEquip.equipGrpTyp5).FirstOrDefault();
                                var preEquip6 = db.equiptypes_tbl.Where(p => p.equipTypID == preEquip.equipGrpTyp6).FirstOrDefault();
                                var preEquip7 = db.equiptypes_tbl.Where(p => p.equipTypID == preEquip.equipGrpTyp7).FirstOrDefault();

                                var preEntertainment1 = db.entertainmenttypes_tbl.Where(p => p.entertainmentTypID == preEntertainment.entertainmentGrpTyp1).FirstOrDefault();
                                var preEntertainment2 = db.entertainmenttypes_tbl.Where(p => p.entertainmentTypID == preEntertainment.entertainmentGrpTyp2).FirstOrDefault();
                                var preEntertainment3 = db.entertainmenttypes_tbl.Where(p => p.entertainmentTypID == preEntertainment.entertainmentGrpTyp3).FirstOrDefault();
                                var preEntertainment4 = db.entertainmenttypes_tbl.Where(p => p.entertainmentTypID == preEntertainment.entertainmentGrpTyp4).FirstOrDefault();
                                var preEntertainment5 = db.entertainmenttypes_tbl.Where(p => p.entertainmentTypID == preEntertainment.entertainmentGrpTyp5).FirstOrDefault();
                                var preEntertainment6 = db.entertainmenttypes_tbl.Where(p => p.entertainmentTypID == preEntertainment.entertainmentGrpTyp6).FirstOrDefault();
                                var preEntertainment7 = db.entertainmenttypes_tbl.Where(p => p.entertainmentTypID == preEntertainment.entertainmentGrpTyp7).FirstOrDefault();

                                var prePhoto1 = db.phototypes_tbl.Where(p => p.photoTypID == prePhoto.photoGrpTyp1).FirstOrDefault();
                                var prePhoto2 = db.phototypes_tbl.Where(p => p.photoTypID == prePhoto.photoGrpTyp2).FirstOrDefault();
                                var prePhoto3 = db.phototypes_tbl.Where(p => p.photoTypID == prePhoto.photoGrpTyp3).FirstOrDefault();
                                var prePhoto4 = db.phototypes_tbl.Where(p => p.photoTypID == prePhoto.photoGrpTyp4).FirstOrDefault();
                                var prePhoto5 = db.phototypes_tbl.Where(p => p.photoTypID == prePhoto.photoGrpTyp5).FirstOrDefault();
                                var prePhoto6 = db.phototypes_tbl.Where(p => p.photoTypID == prePhoto.photoGrpTyp6).FirstOrDefault();
                                var prePhoto7 = db.phototypes_tbl.Where(p => p.photoTypID == prePhoto.photoGrpTyp7).FirstOrDefault();

                                var preKeepsakes1 = db.keepsakestypes_tbl.Where(p => p.keepsakesTypID == preKeepsakes.keepsakesGrpTyp1).FirstOrDefault();
                                var preKeepsakes2 = db.keepsakestypes_tbl.Where(p => p.keepsakesTypID == preKeepsakes.keepsakesGrpTyp2).FirstOrDefault();
                                var preKeepsakes3 = db.keepsakestypes_tbl.Where(p => p.keepsakesTypID == preKeepsakes.keepsakesGrpTyp3).FirstOrDefault();
                                var preKeepsakes4 = db.keepsakestypes_tbl.Where(p => p.keepsakesTypID == preKeepsakes.keepsakesGrpTyp4).FirstOrDefault();
                                var preKeepsakes5 = db.keepsakestypes_tbl.Where(p => p.keepsakesTypID == preKeepsakes.keepsakesGrpTyp5).FirstOrDefault();

                                var preDebut1 = db.debuttypes_tbl.Where(p => p.debutTypID == preDebut.debutGrpTyp1).FirstOrDefault();
                                var preDebut2 = db.debuttypes_tbl.Where(p => p.debutTypID == preDebut.debutGrpTyp2).FirstOrDefault();
                                var preDebut3 = db.debuttypes_tbl.Where(p => p.debutTypID == preDebut.debutGrpTyp3).FirstOrDefault();

                                var bookingClient = db.clients_tbl
                                    .Where(c => c.clientID == bookings.clientID)
                                    .FirstOrDefault();

                                if (bookingClient != null)
                                {
                                    var bookingEvent = db.events_tbl
                                            .Where(e => e.eventID == bookings.eventID)
                                            .FirstOrDefault();

                                    if (bookingEvent != null)
                                    {
                                        var bookingPayment = db.payments_tbl.Where(e => e.bookingID == bookingID && e.paymentType == "Initial").FirstOrDefault();
                                        var transactions = db.payments_tbl.Where(e => e.bookingID == bookingID).OrderByDescending(x => x.transactionNum).ToList();
                                        if (bookingPayment != null)
                                        {
                                            return Json(new
                                            {
                                                packages = bookingPackage,
                                                clients = bookingClient,
                                                events = bookingEvent,
                                                packageType = packageType,
                                                payment = bookingPayment,

                                                preMainCourse = preMainCourse,

                                                preSides1 = preSides1,
                                                preSides2 = preSides2,
                                                preSides3 = preSides3,
                                                preSides4 = preSides4,

                                                preCenterPiece = preCenterPiece,

                                                preSeating = preSeating,

                                                preSpecials1 = preSpecials1,
                                                preSpecials2 = preSpecials2,
                                                preSpecials3 = preSpecials3,
                                                preSpecials4 = preSpecials4,
                                                preSpecials5 = preSpecials5,
                                                preSpecials6 = preSpecials6,
                                                preSpecials7 = preSpecials7,
                                                preSpecials8 = preSpecials8,
                                                preSpecials9 = preSpecials9,

                                                preStaff1 = preStaff1,
                                                preStaff2 = preStaff2,
                                                preStaff3 = preStaff3,

                                                preBackdrop = preBackdrop,

                                                preEntrance = preEntrance,

                                                preCouch = preCouch,

                                                preEquip1 = preEquip1,
                                                preEquip2 = preEquip2,
                                                preEquip3 = preEquip3,
                                                preEquip4 = preEquip4,
                                                preEquip5 = preEquip5,
                                                preEquip6 = preEquip6,
                                                preEquip7 = preEquip7,

                                                preEntertainment1 = preEntertainment1,
                                                preEntertainment2 = preEntertainment2,
                                                preEntertainment3 = preEntertainment3,
                                                preEntertainment4 = preEntertainment4,
                                                preEntertainment5 = preEntertainment5,
                                                preEntertainment6 = preEntertainment6,
                                                preEntertainment7 = preEntertainment7,

                                                prePhoto1 = prePhoto1,
                                                prePhoto2 = prePhoto2,
                                                prePhoto3 = prePhoto3,
                                                prePhoto4 = prePhoto4,
                                                prePhoto5 = prePhoto5,
                                                prePhoto6 = prePhoto6,
                                                prePhoto7 = prePhoto7,

                                                preKeepsakes1 = preKeepsakes1,
                                                preKeepsakes2 = preKeepsakes2,
                                                preKeepsakes3 = preKeepsakes3,
                                                preKeepsakes4 = preKeepsakes4,
                                                preKeepsakes5 = preKeepsakes5,

                                                preDebut1 = preDebut1,
                                                preDebut2 = preDebut2,
                                                preDebut3 = preDebut3,

                                                success = true,
                                                message = "Package Fetched Successfully!"
                                            }, JsonRequestBehavior.AllowGet);
                                        }
                                        else
                                        {
                                            Logs(
                                                "WARN",
                                                "Booking Management:",
                                                "Attempted to get booking details. Message : \"No Event Payment!\"");
                                            return Json(new { success = false, message = "No Event Payment!" }, JsonRequestBehavior.AllowGet);
                                        }
                                    }
                                    else
                                    {
                                        Logs(
                                        "WARN",
                                        "Booking Management:",
                                        "Attempted to get booking details. Message : \"No Event Found!\"");
                                        return Json(new { success = false, message = "No Event Found!" }, JsonRequestBehavior.AllowGet);
                                    }
                                }
                                else
                                {
                                    Logs(
                                        "WARN",
                                        "Booking Management:",
                                        "Attempted to get booking details. Message : \"No Package Found!\"");
                                    return Json(new { success = false, message = "No Package Found!" }, JsonRequestBehavior.AllowGet);
                                }
                            }
                            else
                            {
                                Logs(
                                    "WARN",
                                    "Booking Management:",
                                    "Attempted to get booking details. Message : \"No Client Found!\"");
                                return Json(new { success = false, message = "No Client Found!" }, JsonRequestBehavior.AllowGet);
                            }
                        }
                        else
                        {
                            Logs(
                                "WARN",
                                "Booking Management:",
                                "Attempted to get booking details. Message : \"No Package Found!\"");
                            return Json(new { success = false, message = "No Package Found!" }, JsonRequestBehavior.AllowGet);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Logs(
                    "LETHAL",
                    "Booking View:",
                    "Attempted to get booking details. " + ex.Message + "" + ex.InnerException);
                return Json(new { message = "Error connecting to DB: " + ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        public JsonResult getPackageBookingOptions()
        {
            try
            {
                using (var db = new IsabellaCateringContext())
                {
                    var backdroptypes = db.backdroptypes_tbl.Select(x => x).ToList();
                    var centerPiecetypes = db.centerpiecetypes_tbl.Select(x => x).ToList();
                    var couchtypes = db.couchtypes_tbl.Select(x => x).ToList();
                    var debuttypes = db.debuttypes_tbl.Select(x => x).ToList();
                    var entertainmenttypes = db.entertainmenttypes_tbl.Select(x => x).ToList();
                    var entrancetypes = db.entrancetypes_tbl.Select(x => x).ToList();
                    var equiptypes = db.equiptypes_tbl.Select(x => x).ToList();
                    var keepsakestypes = db.keepsakestypes_tbl.Select(x => x).ToList();
                    var maincoursetypes = db.maincoursetypes_tbl.Select(x => x).ToList();
                    var phototypes = db.phototypes_tbl.Select(x => x).ToList();
                    var seatingtypes = db.seatingtypes_tbl.Select(x => x).ToList();
                    var sidestypes = db.sidestypes_tbl.Select(x => x).ToList();
                    var specialstypes = db.specialstypes_tbl.Select(x => x).ToList();
                    var stafftypes = db.stafftypes_tbl.Select(x => x).ToList();

                    var eventtypes = db.events_tbl.Select(x => x).ToList();
                    var packagetypes = db.packagetypes_tbl.Select(x => x).ToList();

                    return Json(new
                    {
                        backdropTypes = backdroptypes,
                        centerPieceTypes = centerPiecetypes,
                        couchTypes = couchtypes,
                        debutTypes = debuttypes,
                        entertainmentTypes = entertainmenttypes,
                        entranceTypes = entrancetypes,
                        equipTypes = equiptypes,
                        keepsakesTypes = keepsakestypes,
                        maincourseTypes = maincoursetypes,
                        photoTypes = phototypes,
                        seatingTypes = seatingtypes,
                        sidesTypes = sidestypes,
                        specialsTypes = specialstypes,
                        staffTypes = stafftypes,
                        eventTypes = eventtypes,
                        packageTypes = packagetypes,
                        success = true,
                        message = "Options Found!"
                    }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                Logs(
                "LETHAL",
                "Booking Management:",
                "Attempted to get package option. " + ex.Message + "" + ex.InnerException);
                return Json(new { message = "Error connecting to DB: " + ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        private int ResolvePackageId(IsabellaCateringContext db, tblPackagesModel packages, tblSidesGrpTypesModel sidesGrpTypes, tblSpecialsGrpTypesModel specialsGrpTypes, tblStaffGrpTypesModel staffGrpTypes, tblEquipGrpTypesModel equipGrpTypes, tblEntertainmentGrpTypesModel entertainmentGrpTypes, tblPhotoGrpTypesModel photoGrpTypes, tblKeepsakesGrpTypesModel keepsakesGrpTypes, tblDebutGrpTypesModel debutGrpTypes)
        {
            var now = DateTime.Now;
            var existingSides = db.sidesgrptypes_tbl.FirstOrDefault(x => x.sidesGrpTyp1 == sidesGrpTypes.sidesGrpTyp1 && x.sidesGrpTyp2 == sidesGrpTypes.sidesGrpTyp2 && x.sidesGrpTyp3 == sidesGrpTypes.sidesGrpTyp3 && x.sidesGrpTyp4 == sidesGrpTypes.sidesGrpTyp4);
            var grpSidesID = existingSides != null ? existingSides.sidesGrpTypID : 0;
            if (existingSides == null)
            {
                var newSides = new tblSidesGrpTypesModel() { sidesGrpTyp1 = sidesGrpTypes.sidesGrpTyp1, sidesGrpTyp2 = sidesGrpTypes.sidesGrpTyp2, sidesGrpTyp3 = sidesGrpTypes.sidesGrpTyp3, sidesGrpTyp4 = sidesGrpTypes.sidesGrpTyp4, dateCreated = now, dateUpdated = now };
                db.sidesgrptypes_tbl.Add(newSides);
                db.SaveChanges();

                Logs(
                    "INFO",
                    "Booking Management:",
                    $"New group data has been created. sidesGrpTypID: {newSides.sidesGrpTypID}");
                grpSidesID = newSides.sidesGrpTypID;
            }

            var existingSpecials = db.specialsgrptypes_tbl.FirstOrDefault(x => x.specialsGrpTyp1 == specialsGrpTypes.specialsGrpTyp1 && x.specialsGrpTyp2 == specialsGrpTypes.specialsGrpTyp2 && x.specialsGrpTyp3 == specialsGrpTypes.specialsGrpTyp3 && x.specialsGrpTyp4 == specialsGrpTypes.specialsGrpTyp4 && x.specialsGrpTyp5 == specialsGrpTypes.specialsGrpTyp5 && x.specialsGrpTyp6 == specialsGrpTypes.specialsGrpTyp6 && x.specialsGrpTyp7 == specialsGrpTypes.specialsGrpTyp7 && x.specialsGrpTyp8 == specialsGrpTypes.specialsGrpTyp8 && x.specialsGrpTyp9 == specialsGrpTypes.specialsGrpTyp9);
            var grpSpecialsID = existingSpecials != null ? existingSpecials.specialsGrpTypID : 0;
            if (existingSpecials == null)
            {
                var newSpecials = new tblSpecialsGrpTypesModel() { specialsGrpTyp1 = specialsGrpTypes.specialsGrpTyp1, specialsGrpTyp2 = specialsGrpTypes.specialsGrpTyp2, specialsGrpTyp3 = specialsGrpTypes.specialsGrpTyp3, specialsGrpTyp4 = specialsGrpTypes.specialsGrpTyp4, specialsGrpTyp5 = specialsGrpTypes.specialsGrpTyp5, specialsGrpTyp6 = specialsGrpTypes.specialsGrpTyp6, specialsGrpTyp7 = specialsGrpTypes.specialsGrpTyp7, specialsGrpTyp8 = specialsGrpTypes.specialsGrpTyp8, specialsGrpTyp9 = specialsGrpTypes.specialsGrpTyp9, dateCreated = now, dateUpdated = now };
                db.specialsgrptypes_tbl.Add(newSpecials);
                db.SaveChanges();

                Logs(
                    "INFO",
                    "Booking Management:",
                    $"New group data has been created. specialsGrpTypID: {newSpecials.specialsGrpTypID}");
                grpSpecialsID = newSpecials.specialsGrpTypID;
            }

            var existingStaff = db.staffgrptypes_tbl.FirstOrDefault(x => x.staffGrpTyp1 == staffGrpTypes.staffGrpTyp1 && x.staffGrpTyp2 == staffGrpTypes.staffGrpTyp2 && x.staffGrpTyp3 == staffGrpTypes.staffGrpTyp3);
            var grpStaffID = existingStaff != null ? existingStaff.staffGrpTypID : 0;
            if (existingStaff == null)
            {
                var newStaff = new tblStaffGrpTypesModel() { staffGrpTyp1 = staffGrpTypes.staffGrpTyp1, staffGrpTyp2 = staffGrpTypes.staffGrpTyp2, staffGrpTyp3 = staffGrpTypes.staffGrpTyp3, dateCreated = now, dateUpdated = now };
                db.staffgrptypes_tbl.Add(newStaff);
                db.SaveChanges();

                Logs(
                   "INFO",
                   "Booking Management:",
                   $"New group data has been created. staffGrpTypID: {newStaff.staffGrpTypID}");
                grpStaffID = newStaff.staffGrpTypID;
            }

            var existingEquipment = db.equipgrptypes_tbl.FirstOrDefault(x => x.equipGrpTyp1 == equipGrpTypes.equipGrpTyp1 && x.equipGrpTyp2 == equipGrpTypes.equipGrpTyp2 && x.equipGrpTyp3 == equipGrpTypes.equipGrpTyp3 && x.equipGrpTyp4 == equipGrpTypes.equipGrpTyp4 && x.equipGrpTyp5 == equipGrpTypes.equipGrpTyp5 && x.equipGrpTyp6 == equipGrpTypes.equipGrpTyp6 && x.equipGrpTyp7 == equipGrpTypes.equipGrpTyp7);
            var grpEquipID = existingEquipment != null ? existingEquipment.equipGrpTypID : 0;
            if (existingEquipment == null)
            {
                var newEquip = new tblEquipGrpTypesModel() { equipGrpTyp1 = equipGrpTypes.equipGrpTyp1, equipGrpTyp2 = equipGrpTypes.equipGrpTyp2, equipGrpTyp3 = equipGrpTypes.equipGrpTyp3, equipGrpTyp4 = equipGrpTypes.equipGrpTyp4, equipGrpTyp5 = equipGrpTypes.equipGrpTyp5, equipGrpTyp6 = equipGrpTypes.equipGrpTyp6, equipGrpTyp7 = equipGrpTypes.equipGrpTyp7, dateCreated = now, dateUpdated = now };
                db.equipgrptypes_tbl.Add(newEquip);
                db.SaveChanges();

                Logs(
                   "INFO",
                   "Booking Management:",
                   $"New group data has been created. equipGrpTypID: {newEquip.equipGrpTypID}");
                grpEquipID = newEquip.equipGrpTypID;
            }

            var existingEntertainment = db.entertainmentgrptypes_tbl.FirstOrDefault(x => x.entertainmentGrpTyp1 == entertainmentGrpTypes.entertainmentGrpTyp1 && x.entertainmentGrpTyp2 == entertainmentGrpTypes.entertainmentGrpTyp2 && x.entertainmentGrpTyp3 == entertainmentGrpTypes.entertainmentGrpTyp3 && x.entertainmentGrpTyp4 == entertainmentGrpTypes.entertainmentGrpTyp4 && x.entertainmentGrpTyp5 == entertainmentGrpTypes.entertainmentGrpTyp5 && x.entertainmentGrpTyp6 == entertainmentGrpTypes.entertainmentGrpTyp6 && x.entertainmentGrpTyp7 == entertainmentGrpTypes.entertainmentGrpTyp7);
            var grpEntertainmentID = existingEntertainment != null ? existingEntertainment.entertainmentGrpTypID : 0;
            if (existingEntertainment == null)
            {
                var newEntertainment = new tblEntertainmentGrpTypesModel() { entertainmentGrpTyp1 = entertainmentGrpTypes.entertainmentGrpTyp1, entertainmentGrpTyp2 = entertainmentGrpTypes.entertainmentGrpTyp2, entertainmentGrpTyp3 = entertainmentGrpTypes.entertainmentGrpTyp3, entertainmentGrpTyp4 = entertainmentGrpTypes.entertainmentGrpTyp4, entertainmentGrpTyp5 = entertainmentGrpTypes.entertainmentGrpTyp5, entertainmentGrpTyp6 = entertainmentGrpTypes.entertainmentGrpTyp6, entertainmentGrpTyp7 = entertainmentGrpTypes.entertainmentGrpTyp7, dateCreated = now, dateUpdated = now };
                db.entertainmentgrptypes_tbl.Add(newEntertainment);
                db.SaveChanges();

                Logs(
                   "INFO",
                   "Booking Management:",
                   $"New group data has been created. entertainmentGrpTypID: {newEntertainment.entertainmentGrpTypID}");
                grpEntertainmentID = newEntertainment.entertainmentGrpTypID;
            }

            var existingPhoto = db.photogrptypes_tbl.FirstOrDefault(x => x.photoGrpTyp1 == photoGrpTypes.photoGrpTyp1 && x.photoGrpTyp2 == photoGrpTypes.photoGrpTyp2 && x.photoGrpTyp3 == photoGrpTypes.photoGrpTyp3 && x.photoGrpTyp4 == photoGrpTypes.photoGrpTyp4 && x.photoGrpTyp5 == photoGrpTypes.photoGrpTyp5 && x.photoGrpTyp6 == photoGrpTypes.photoGrpTyp6 && x.photoGrpTyp7 == photoGrpTypes.photoGrpTyp7);
            var grpPhotoID = existingPhoto != null ? existingPhoto.photoGrpTypID : 0;
            if (existingPhoto == null)
            {
                var newPhoto = new tblPhotoGrpTypesModel() { photoGrpTyp1 = photoGrpTypes.photoGrpTyp1, photoGrpTyp2 = photoGrpTypes.photoGrpTyp2, photoGrpTyp3 = photoGrpTypes.photoGrpTyp3, photoGrpTyp4 = photoGrpTypes.photoGrpTyp4, photoGrpTyp5 = photoGrpTypes.photoGrpTyp5, photoGrpTyp6 = photoGrpTypes.photoGrpTyp6, photoGrpTyp7 = photoGrpTypes.photoGrpTyp7, dateCreated = now, dateUpdated = now };
                db.photogrptypes_tbl.Add(newPhoto);
                db.SaveChanges();

                Logs(
                   "INFO",
                   "Booking Management:",
                   $"New group data has been created. photoGrpTypID: {newPhoto.photoGrpTypID}");
                grpPhotoID = newPhoto.photoGrpTypID;
            }

            var existingKeepsakes = db.keepsakesgrptypes_tbl.FirstOrDefault(x => x.keepsakesGrpTyp1 == keepsakesGrpTypes.keepsakesGrpTyp1 && x.keepsakesGrpTyp2 == keepsakesGrpTypes.keepsakesGrpTyp2 && x.keepsakesGrpTyp3 == keepsakesGrpTypes.keepsakesGrpTyp3 && x.keepsakesGrpTyp4 == keepsakesGrpTypes.keepsakesGrpTyp4 && x.keepsakesGrpTyp5 == keepsakesGrpTypes.keepsakesGrpTyp5);
            var grpKeepsakesID = existingKeepsakes != null ? existingKeepsakes.keepsakesGrpTypID : 0;
            if (existingKeepsakes == null)
            {
                var newKeepsakes = new tblKeepsakesGrpTypesModel() { keepsakesGrpTyp1 = keepsakesGrpTypes.keepsakesGrpTyp1, keepsakesGrpTyp2 = keepsakesGrpTypes.keepsakesGrpTyp2, keepsakesGrpTyp3 = keepsakesGrpTypes.keepsakesGrpTyp3, keepsakesGrpTyp4 = keepsakesGrpTypes.keepsakesGrpTyp4, keepsakesGrpTyp5 = keepsakesGrpTypes.keepsakesGrpTyp5, dateCreated = now, dateUpdated = now };
                db.keepsakesgrptypes_tbl.Add(newKeepsakes);
                db.SaveChanges();

                Logs(
                   "INFO",
                   "Booking Management:",
                   $"New group data has been created. keepsakesGrpTypID: {newKeepsakes.keepsakesGrpTypID}");
                grpKeepsakesID = newKeepsakes.keepsakesGrpTypID;
            }

            var existingDebut = db.debutgrptypes_tbl.FirstOrDefault(x => x.debutGrpTyp1 == debutGrpTypes.debutGrpTyp1 && x.debutGrpTyp2 == debutGrpTypes.debutGrpTyp2 && x.debutGrpTyp3 == debutGrpTypes.debutGrpTyp3);
            var grpDebutID = existingDebut != null ? existingDebut.debutGrpTypID : 0;
            if (existingDebut == null)
            {
                var newDebut = new tblDebutGrpTypesModel() { debutGrpTyp1 = debutGrpTypes.debutGrpTyp1, debutGrpTyp2 = debutGrpTypes.debutGrpTyp2, debutGrpTyp3 = debutGrpTypes.debutGrpTyp3, dateCreated = now, dateUpdated = now };
                db.debutgrptypes_tbl.Add(newDebut);
                db.SaveChanges();

                Logs(
                   "INFO",
                   "Booking Management:",
                   $"New group data has been created. debutGrpTypID: {newDebut.debutGrpTypID}");
                grpDebutID = newDebut.debutGrpTypID;
            }

            var existingPackage = db.packages_tbl.FirstOrDefault(x => x.packageTypID == packages.packageTypID && x.pricePaxID == packages.pricePaxID && x.mainCourseTypID == packages.mainCourseTypID && x.sidesGrpTypID == grpSidesID && x.centerPieceTypID == packages.centerPieceTypID && x.seatingTypID == packages.seatingTypID && x.specialsGrpTypID == grpSpecialsID && x.staffGrpTypID == grpStaffID && x.backdropTypID == packages.backdropTypID && x.entranceTypID == packages.entranceTypID && x.couchTypID == packages.couchTypID && x.equipGrpTypID == grpEquipID && x.entertainmentGrpTypID == grpEntertainmentID && x.photoGrpTypID == grpPhotoID && x.keepsakesGrptypID == grpKeepsakesID && x.debutGrpTypID == grpDebutID && x.incStaples == packages.incStaples && x.incBftSet == packages.incBftSet && x.incStyling == packages.incStyling && x.incTableSet == packages.incTableSet && x.incDnrWare == packages.incDnrWare);
            if (existingPackage != null)
            {
                return existingPackage.packageID;
            }

            var newPackage = new tblPackagesModel() { packageTypID = packages.packageTypID, pricePaxID = packages.pricePaxID, mainCourseTypID = packages.mainCourseTypID, sidesGrpTypID = grpSidesID, centerPieceTypID = packages.centerPieceTypID, seatingTypID = packages.seatingTypID, specialsGrpTypID = grpSpecialsID, staffGrpTypID = grpStaffID, backdropTypID = packages.backdropTypID, entranceTypID = packages.entranceTypID, couchTypID = packages.couchTypID, equipGrpTypID = grpEquipID, entertainmentGrpTypID = grpEntertainmentID, photoGrpTypID = grpPhotoID, keepsakesGrptypID = grpKeepsakesID, debutGrpTypID = grpDebutID, incStaples = packages.incStaples, incBftSet = packages.incBftSet, incStyling = packages.incStyling, incTableSet = packages.incTableSet, incDnrWare = packages.incDnrWare, dateCreated = now, dateUpdated = now };
            db.packages_tbl.Add(newPackage);
            db.SaveChanges();

            Logs(
                   "INFO",
                   "Booking Management:",
                   $"New booking package has been created. packageID: {newPackage.packageID}");
            return newPackage.packageID;
        }

        private void UpdatePrimaryBookingPayment(IsabellaCateringContext db, int bookingID, tblPaymentsModel paymentInfo, DateTime bookingDate)
        {
            if (paymentInfo == null)
            {
                return;
            }

            var existingPayment = db.payments_tbl.Where(p => p.bookingID == bookingID).OrderBy(p => p.paymentType == "-" || p.paymentType == null || p.paymentType == "" ? 0 : 1).ThenBy(p => p.paymentID).FirstOrDefault();
            if (existingPayment == null)
            {
                return;
            }

            existingPayment.amountDue = paymentInfo.amountDue;
            existingPayment.dueDate = bookingDate;
            existingPayment.dateUpdated = DateTime.Now;
        }

        [HttpPost]
        public JsonResult insertPackage(tblClientsModel clientInfo, tblBookingsModel bookingInfo, tblPaymentsModel paymentInfo, tblPackagesModel packages, tblSidesGrpTypesModel sidesGrpTypes, tblSpecialsGrpTypesModel specialsGrpTypes, tblStaffGrpTypesModel staffGrpTypes, tblEquipGrpTypesModel equipGrpTypes, tblEntertainmentGrpTypesModel entertainmentGrpTypes, tblPhotoGrpTypesModel photoGrpTypes, tblKeepsakesGrpTypesModel keepsakesGrpTypes, tblDebutGrpTypesModel debutGrpTypes)
        {
            try
            {
                using (var db = new IsabellaCateringContext())
                {
                    if(bookingInfo.paxCount == 0)
                    {
                        return Json(new { success = false, message = "Please choose Guest Count!" }, JsonRequestBehavior.AllowGet);
                    }
                    var existingBooking = db.bookings_tbl
                        .Where(x =>
                        x.eventID == bookingInfo.eventID &&
                        x.dsgnTheme == bookingInfo.dsgnTheme &&
                        x.dsgnMotif == bookingInfo.dsgnMotif &&
                        x.prepVenue == bookingInfo.prepVenue &&
                        x.ceremTime == bookingInfo.ceremTime &&
                        x.eventTime == bookingInfo.eventTime &&
                        x.venue == bookingInfo.venue &&
                        x.eventSetTime == bookingInfo.eventSetTime &&
                        x.eventMealTime == bookingInfo.eventMealTime &&
                        x.bookingNote == bookingInfo.bookingNote &&
                        x.paxCount == bookingInfo.paxCount &&
                        x.addAdult == bookingInfo.addAdult &&
                        x.addKid == bookingInfo.addKid
                        ).FirstOrDefault();

                    if (existingBooking != null)
                    {
                        var existingClient = db.clients_tbl
                            .Where(x =>
                            x.eventName == clientInfo.eventName &&
                            x.cFName == clientInfo.cFName &&
                            x.cLName == clientInfo.cLName &&
                            x.cEmail == clientInfo.cEmail &&
                            x.cContact == clientInfo.cContact &&
                            x.cCeleb1FName == clientInfo.cCeleb1FName &&
                            x.cCeleb1LName == clientInfo.cCeleb1LName &&
                            x.cCeleb2FName == clientInfo.cCeleb2FName &&
                            x.cCeleb2LName == clientInfo.cCeleb2LName
                            ).FirstOrDefault();

                        if(existingClient != null)
                        {
                            Logs(
                               "WARN",
                               "Booking Management:",
                               $"Attempted to create duplicate booking data. bookingID: {existingBooking.bookingID}");
                            return Json(new { success = false, message = "Booking is already registered" }, JsonRequestBehavior.AllowGet);
                        }
                    }

                    var currPackageID = ResolvePackageId(db, packages, sidesGrpTypes, specialsGrpTypes, staffGrpTypes, equipGrpTypes, entertainmentGrpTypes, photoGrpTypes, keepsakesGrpTypes, debutGrpTypes);

                    string datePart = DateTime.Now.ToString("yyMMdd");
                    string randomPart = Guid.NewGuid().ToString().Substring(0, 4).ToUpper();
                    string receiptCode = $"BK-{datePart}-{randomPart}";

                    var existingReceipt = db.bookingreceipts_tbl.Where(p => p.receiptNum == receiptCode).FirstOrDefault();
                    while (existingReceipt != null)
                    {
                        randomPart = Guid.NewGuid().ToString().Substring(0, 4).ToUpper();
                        receiptCode = $"BK-{datePart}-{randomPart}";
                        existingReceipt = db.bookingreceipts_tbl.Where(p => p.receiptNum == receiptCode).FirstOrDefault();
                    }

                    var newClient = new tblClientsModel()
                    {
                        permissionID = 3,
                        receiptID = 0,
                        eventName = clientInfo.eventName,
                        cFName = clientInfo.cFName,
                        cLName = clientInfo.cLName,
                        cEmail = clientInfo.cEmail,
                        cContact = clientInfo.cContact,
                        cCeleb1FName = clientInfo.cCeleb1FName,
                        cCeleb1LName = clientInfo.cCeleb1LName,
                        cCeleb2FName = clientInfo.cCeleb2FName,
                        cCeleb2LName = clientInfo.cCeleb2LName,
                        entryCode = "0",
                        password = "0",
                        dateCreated = DateTime.Now,
                        dateUpdated = DateTime.Now
                    };
                    db.clients_tbl.Add(newClient);
                    db.SaveChanges();

                    Logs(
                       "INFO",
                       "Booking Management:",
                       $"New Client Data has been created. clientID: {newClient.clientID}");

                    int id = Convert.ToInt32(Session["currentLog"] ?? 0);

                    var newBooking = new tblBookingsModel()
                    {
                        createdBy = id,
                        clientID = newClient.clientID,
                        packageID = currPackageID,
                        eventID = bookingInfo.eventID,
                        dsgnTheme = bookingInfo.dsgnTheme,
                        dsgnMotif = bookingInfo.dsgnMotif,
                        prepVenue = bookingInfo.prepVenue,
                        bookingDate = bookingInfo.bookingDate,
                        ceremTime = bookingInfo.ceremTime,
                        eventTime = bookingInfo.eventTime,
                        venue = bookingInfo.venue,
                        eventSetTime = bookingInfo.eventSetTime,
                        eventMealTime = bookingInfo.eventMealTime,
                        dateCreated = DateTime.Now,
                        dateUpdated = DateTime.Now,
                        bookingNote = bookingInfo.bookingNote,
                        progressOne = 0,
                        progressTwo = 0,
                        progressThree = 0,
                        paxCount = bookingInfo.paxCount,
                        addAdult = bookingInfo.addAdult,
                        addKid = bookingInfo.addKid,
                    };
                    db.bookings_tbl.Add(newBooking);
                    db.SaveChanges();

                    Logs(
                       "INFO",
                       "Booking Management:",
                       $"New Booking Data has been created. bookingID: {newBooking.bookingID}");

                    var newReceipt = new tblBookingReceiptsModel()
                    {
                        bookingID = newBooking.bookingID,
                        receiptNum = receiptCode,
                        dateCreated = DateTime.Now,
                        dateUpdated = DateTime.Now
                    };
                    db.bookingreceipts_tbl.Add(newReceipt);
                    db.SaveChanges();

                    newClient.receiptID = newReceipt.receiptID;
                    newClient.entryCode = receiptCode;
                    db.SaveChanges();

                    Logs(
                       "INFO",
                       "Booking Management:",
                       $"New Receipt Data has been created. receiptID: {newReceipt.receiptID}");

                    var newPayment = new tblPaymentsModel()
                    {
                        bookingID = newBooking.bookingID,
                        amountDue = paymentInfo.amountDue,
                        amountPaid = 0,
                        paymentType = "Initial",
                        remainingBalance = paymentInfo.amountDue,
                        transactionNum = 0,
                        paymentStatus = "incomplete",
                        dueDate = bookingInfo.bookingDate.AddDays(10),
                        dateCreated = DateTime.Now,
                        dateUpdated = DateTime.Now
                    };

                    db.payments_tbl.Add(newPayment);
                    db.SaveChanges();

                    Logs(
                       "INFO",
                       "Booking Management:",
                       $"New Payment Data has been created. paymentID: {newPayment.paymentID}");
                }

                Logs(
                    "INFO",
                    "Booking Management:",
                    $"New Booking Set Data has been created.");
                return Json(new { success = true, message = "Booking Completed Successfully!" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                Logs(
                "LETHAL",
                "Booking Management:",
                "Attempted to create bookings. " + ex.Message + "" + ex.InnerException);
                return Json(new { success = false, message = "Error connecting to DB: " + ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public JsonResult UpdateBooking(tblClientsModel clientInfo, tblBookingsModel bookingInfo, tblPaymentsModel paymentInfo, tblPackagesModel packages, tblSidesGrpTypesModel sidesGrpTypes, tblSpecialsGrpTypesModel specialsGrpTypes, tblStaffGrpTypesModel staffGrpTypes, tblEquipGrpTypesModel equipGrpTypes, tblEntertainmentGrpTypesModel entertainmentGrpTypes, tblPhotoGrpTypesModel photoGrpTypes, tblKeepsakesGrpTypesModel keepsakesGrpTypes, tblDebutGrpTypesModel debutGrpTypes)
        {
            try
            {
                using (var db = new IsabellaCateringContext())
                using (var transaction = db.Database.BeginTransaction())
                {
                    var existingBooking = db.bookings_tbl.FirstOrDefault(b => b.bookingID == bookingInfo.bookingID);
                    if (existingBooking == null)
                    {
                        return Json(new { success = false, message = "Booking not found." });
                    }

                    var existingClient = db.clients_tbl.FirstOrDefault(c => c.clientID == existingBooking.clientID);
                    if (existingClient == null)
                    {
                        return Json(new { success = false, message = "Client not found for this booking." });
                    }

                    var resolvedPackageID = ResolvePackageId(db, packages, sidesGrpTypes, specialsGrpTypes, staffGrpTypes, equipGrpTypes, entertainmentGrpTypes, photoGrpTypes, keepsakesGrpTypes, debutGrpTypes);

                    existingClient.eventName = clientInfo.eventName;
                    existingClient.cFName = clientInfo.cFName;
                    existingClient.cLName = clientInfo.cLName;
                    existingClient.cEmail = clientInfo.cEmail;
                    existingClient.cContact = clientInfo.cContact;
                    existingClient.cCeleb1FName = clientInfo.cCeleb1FName;
                    existingClient.cCeleb1LName = clientInfo.cCeleb1LName;
                    existingClient.cCeleb2FName = clientInfo.cCeleb2FName;
                    existingClient.cCeleb2LName = clientInfo.cCeleb2LName;
                    existingClient.dateUpdated = DateTime.Now;

                    existingBooking.packageID = resolvedPackageID;
                    existingBooking.eventID = bookingInfo.eventID;
                    existingBooking.dsgnTheme = bookingInfo.dsgnTheme;
                    existingBooking.dsgnMotif = bookingInfo.dsgnMotif;
                    existingBooking.prepVenue = bookingInfo.prepVenue;
                    existingBooking.bookingDate = bookingInfo.bookingDate;
                    existingBooking.ceremTime = bookingInfo.ceremTime;
                    existingBooking.eventTime = bookingInfo.eventTime;
                    existingBooking.venue = bookingInfo.venue;
                    existingBooking.eventSetTime = bookingInfo.eventSetTime;
                    existingBooking.eventMealTime = bookingInfo.eventMealTime;
                    existingBooking.bookingNote = bookingInfo.bookingNote;
                    existingBooking.progressOne = bookingInfo.progressOne;
                    existingBooking.progressTwo = bookingInfo.progressTwo;
                    existingBooking.progressThree = bookingInfo.progressThree;
                    existingBooking.paxCount = bookingInfo.paxCount;
                    existingBooking.addAdult = bookingInfo.addAdult;
                    existingBooking.addKid = bookingInfo.addKid;
                    existingBooking.dateUpdated = DateTime.Now;

                    UpdatePrimaryBookingPayment(db, existingBooking.bookingID, paymentInfo, bookingInfo.bookingDate);
                    db.SaveChanges();

                    Logs(
                        "INFO",
                        "Booking Management:",
                        $"Booking Data Set has been updated. bookingID: {existingBooking.bookingID}" );
                    transaction.Commit();

                    return Json(new { success = true, message = "Booking updated successfully!" });
                }
            }
            catch (Exception ex)
            {
                Logs(
                "LETHAL",
                "Booking Management:",
                "Attempted to update bookings. " + ex.Message + "" + ex.InnerException);
                return Json(new { success = false, message = "Error connecting to DB: " + ex.Message });
            }
        }

        [HttpPost]
        public JsonResult DeleteBooking(int bookingID)
        {
            try
            {
                using (var db = new IsabellaCateringContext())
                using (var transaction = db.Database.BeginTransaction())
                {
                    var existingBooking = db.bookings_tbl.FirstOrDefault(b => b.bookingID == bookingID);
                    if (existingBooking == null)
                    {
                        return Json(new { success = false, message = "Booking not found." });
                    }

                    Logs(
                        "INFO",
                        "Booking Management:",
                        $"Booking Data Set has been deleted. bookingID: {existingBooking.bookingID}");

                    var paymentIds = db.payments_tbl.Where(p => p.bookingID == bookingID).Select(p => p.paymentID).ToList();
                    if (paymentIds.Any())
                    {
                        var reminders = db.paymentreminders_tbl.Where(r => paymentIds.Contains(r.paymentID)).ToList();
                        foreach (var reminder in reminders)
                        {
                            db.paymentreminders_tbl.Remove(reminder);
                        }

                        var payments = db.payments_tbl.Where(p => p.bookingID == bookingID).ToList();
                        foreach (var payment in payments)
                        {
                            db.payments_tbl.Remove(payment);
                        }
                    }
                    Logs(
                        "INFO",
                        "Booking Management:",
                        $"Booking Payment Set has been deleted. bookingID: {existingBooking.bookingID}");

                    var tasks = db.tasks_tbl.Where(t => t.bookingID == bookingID).ToList();
                    if (tasks.Any())
                    {
                        var taskIds = tasks.Select(t => t.taskID).ToList();
                        var taskHistory = db.taskhistory_tbl.Where(h => taskIds.Contains(h.taskID)).ToList();
                        foreach (var history in taskHistory)
                        {
                            db.taskhistory_tbl.Remove(history);
                        }

                        foreach (var task in tasks)
                        {
                            db.tasks_tbl.Remove(task);
                        }
                    }

                    Logs(
                        "INFO",
                        "Booking Management:",
                        $"Booking Task Set has been deleted. bookingID: {existingBooking.bookingID}");

                    var receipts = db.bookingreceipts_tbl.Where(r => r.bookingID == bookingID).ToList();
                    foreach (var receipt in receipts)
                    {
                        db.bookingreceipts_tbl.Remove(receipt);
                    }

                    var clientID = existingBooking.clientID;
                    Logs(
                        "INFO",
                        "Booking Management:",
                        $"Booking Client Data has been deleted. bookingID: {existingBooking.bookingID}");
                    db.bookings_tbl.Remove(existingBooking);
                    db.SaveChanges();

                    if (!db.bookings_tbl.Any(b => b.clientID == clientID))
                    {
                        var existingClient = db.clients_tbl.FirstOrDefault(c => c.clientID == clientID);
                        if (existingClient != null)
                        {
                            db.clients_tbl.Remove(existingClient);
                        }
                    }

                    

                    db.SaveChanges();
                    transaction.Commit();

                    if ((Session["currentBooking"]?.ToString() ?? string.Empty) == bookingID.ToString())
                    {
                        Session.Remove("currentBooking");
                    }

                    return Json(new { success = true, message = "Booking deleted successfully." });
                }
            }
            catch (Exception ex)
            {
                Logs(
                "LETHAL",
                "Bookings Management:",
                "Attempted to delete bookings. " + ex.Message + "" + ex.InnerException);
                return Json(new { success = false, message = "Error connecting to DB: " + ex.Message });
            }
        }

        public JsonResult loadPackagePreOption(int packageID)
        {
            try
            {
                using (var db = new IsabellaCateringContext())
                {
                    var prePackage = db.packages_tbl
                                    .Where(p => p.packageID == packageID)
                                    .FirstOrDefault();
                    if (prePackage != null)
                    {
                        var preMainCourse = db.maincoursetypes_tbl.Where(p => p.mainCourseTypID == prePackage.mainCourseTypID).FirstOrDefault();
                        var preSides = db.sidesgrptypes_tbl.Where(p => p.sidesGrpTypID == prePackage.sidesGrpTypID).FirstOrDefault();
                        var preCenterPiece = db.centerpiecetypes_tbl.Where(p => p.centerPieceTypID == prePackage.centerPieceTypID).FirstOrDefault();
                        var preSeating = db.seatingtypes_tbl.Where(p => p.seatingTypID == prePackage.seatingTypID).FirstOrDefault();
                        var preSpecials = db.specialsgrptypes_tbl.Where(p => p.specialsGrpTypID == prePackage.specialsGrpTypID).FirstOrDefault();
                        var preStaff = db.staffgrptypes_tbl.Where(p => p.staffGrpTypID == prePackage.staffGrpTypID).FirstOrDefault();
                        var preBackdrop = db.backdroptypes_tbl.Where(p => p.backdropTypID == prePackage.backdropTypID).FirstOrDefault();
                        var preEntrance = db.entrancetypes_tbl.Where(p => p.entranceTypID == prePackage.entranceTypID).FirstOrDefault();
                        var preCouch = db.couchtypes_tbl.Where(p => p.couchTypID == prePackage.couchTypID).FirstOrDefault();
                        var preEquip = db.equipgrptypes_tbl.Where(p => p.equipGrpTypID == prePackage.equipGrpTypID).FirstOrDefault();
                        var preEntertainment = db.entertainmentgrptypes_tbl.Where(p => p.entertainmentGrpTypID == prePackage.entertainmentGrpTypID).FirstOrDefault();
                        var prePhoto = db.photogrptypes_tbl.Where(p => p.photoGrpTypID == prePackage.photoGrpTypID).FirstOrDefault();
                        var preKeepsakes = db.keepsakesgrptypes_tbl.Where(p => p.keepsakesGrpTypID == prePackage.keepsakesGrptypID).FirstOrDefault();
                        var preDebut = db.debutgrptypes_tbl.Where(p => p.debutGrpTypID == prePackage.debutGrpTypID).FirstOrDefault();

                        if (preMainCourse != null &&
                            preSides != null &&
                            preCenterPiece != null &&
                            preSeating != null &&
                            preSpecials != null &&
                            preStaff != null &&
                            preBackdrop != null &&
                            preEntrance != null &&
                            preCouch != null &&
                            preEquip != null &&
                            preEntertainment != null &&
                            prePhoto != null &&
                            preKeepsakes != null &&
                            preDebut != null)
                        {
                            var preSides1 = db.sidestypes_tbl.Where(p => p.sidesTypID == preSides.sidesGrpTyp1).FirstOrDefault();
                            var preSides2 = db.sidestypes_tbl.Where(p => p.sidesTypID == preSides.sidesGrpTyp2).FirstOrDefault();
                            var preSides3 = db.sidestypes_tbl.Where(p => p.sidesTypID == preSides.sidesGrpTyp3).FirstOrDefault();
                            var preSides4 = db.sidestypes_tbl.Where(p => p.sidesTypID == preSides.sidesGrpTyp4).FirstOrDefault();

                            var preSpecials1 = db.specialstypes_tbl.Where(p => p.specialsTypID == preSpecials.specialsGrpTyp1).FirstOrDefault();
                            var preSpecials2 = db.specialstypes_tbl.Where(p => p.specialsTypID == preSpecials.specialsGrpTyp2).FirstOrDefault();
                            var preSpecials3 = db.specialstypes_tbl.Where(p => p.specialsTypID == preSpecials.specialsGrpTyp3).FirstOrDefault();
                            var preSpecials4 = db.specialstypes_tbl.Where(p => p.specialsTypID == preSpecials.specialsGrpTyp4).FirstOrDefault();
                            var preSpecials5 = db.specialstypes_tbl.Where(p => p.specialsTypID == preSpecials.specialsGrpTyp5).FirstOrDefault();
                            var preSpecials6 = db.specialstypes_tbl.Where(p => p.specialsTypID == preSpecials.specialsGrpTyp6).FirstOrDefault();
                            var preSpecials7 = db.specialstypes_tbl.Where(p => p.specialsTypID == preSpecials.specialsGrpTyp7).FirstOrDefault();
                            var preSpecials8 = db.specialstypes_tbl.Where(p => p.specialsTypID == preSpecials.specialsGrpTyp8).FirstOrDefault();
                            var preSpecials9 = db.specialstypes_tbl.Where(p => p.specialsTypID == preSpecials.specialsGrpTyp9).FirstOrDefault();

                            var preStaff1 = db.stafftypes_tbl.Where(p => p.staffTypID == preStaff.staffGrpTyp1).FirstOrDefault();
                            var preStaff2 = db.stafftypes_tbl.Where(p => p.staffTypID == preStaff.staffGrpTyp2).FirstOrDefault();
                            var preStaff3 = db.stafftypes_tbl.Where(p => p.staffTypID == preStaff.staffGrpTyp3).FirstOrDefault();

                            var preEquip1 = db.equiptypes_tbl.Where(p => p.equipTypID == preEquip.equipGrpTyp1).FirstOrDefault();
                            var preEquip2 = db.equiptypes_tbl.Where(p => p.equipTypID == preEquip.equipGrpTyp2).FirstOrDefault();
                            var preEquip3 = db.equiptypes_tbl.Where(p => p.equipTypID == preEquip.equipGrpTyp3).FirstOrDefault();
                            var preEquip4 = db.equiptypes_tbl.Where(p => p.equipTypID == preEquip.equipGrpTyp4).FirstOrDefault();
                            var preEquip5 = db.equiptypes_tbl.Where(p => p.equipTypID == preEquip.equipGrpTyp5).FirstOrDefault();
                            var preEquip6 = db.equiptypes_tbl.Where(p => p.equipTypID == preEquip.equipGrpTyp6).FirstOrDefault();
                            var preEquip7 = db.equiptypes_tbl.Where(p => p.equipTypID == preEquip.equipGrpTyp7).FirstOrDefault();

                            var preEntertainment1 = db.entertainmenttypes_tbl.Where(p => p.entertainmentTypID == preEntertainment.entertainmentGrpTyp1).FirstOrDefault();
                            var preEntertainment2 = db.entertainmenttypes_tbl.Where(p => p.entertainmentTypID == preEntertainment.entertainmentGrpTyp2).FirstOrDefault();
                            var preEntertainment3 = db.entertainmenttypes_tbl.Where(p => p.entertainmentTypID == preEntertainment.entertainmentGrpTyp3).FirstOrDefault();
                            var preEntertainment4 = db.entertainmenttypes_tbl.Where(p => p.entertainmentTypID == preEntertainment.entertainmentGrpTyp4).FirstOrDefault();
                            var preEntertainment5 = db.entertainmenttypes_tbl.Where(p => p.entertainmentTypID == preEntertainment.entertainmentGrpTyp5).FirstOrDefault();
                            var preEntertainment6 = db.entertainmenttypes_tbl.Where(p => p.entertainmentTypID == preEntertainment.entertainmentGrpTyp6).FirstOrDefault();
                            var preEntertainment7 = db.entertainmenttypes_tbl.Where(p => p.entertainmentTypID == preEntertainment.entertainmentGrpTyp7).FirstOrDefault();

                            var prePhoto1 = db.phototypes_tbl.Where(p => p.photoTypID == prePhoto.photoGrpTyp1).FirstOrDefault();
                            var prePhoto2 = db.phototypes_tbl.Where(p => p.photoTypID == prePhoto.photoGrpTyp2).FirstOrDefault();
                            var prePhoto3 = db.phototypes_tbl.Where(p => p.photoTypID == prePhoto.photoGrpTyp3).FirstOrDefault();
                            var prePhoto4 = db.phototypes_tbl.Where(p => p.photoTypID == prePhoto.photoGrpTyp4).FirstOrDefault();
                            var prePhoto5 = db.phototypes_tbl.Where(p => p.photoTypID == prePhoto.photoGrpTyp5).FirstOrDefault();
                            var prePhoto6 = db.phototypes_tbl.Where(p => p.photoTypID == prePhoto.photoGrpTyp6).FirstOrDefault();
                            var prePhoto7 = db.phototypes_tbl.Where(p => p.photoTypID == prePhoto.photoGrpTyp7).FirstOrDefault();

                            var preKeepsakes1 = db.keepsakestypes_tbl.Where(p => p.keepsakesTypID == preKeepsakes.keepsakesGrpTyp1).FirstOrDefault();
                            var preKeepsakes2 = db.keepsakestypes_tbl.Where(p => p.keepsakesTypID == preKeepsakes.keepsakesGrpTyp2).FirstOrDefault();
                            var preKeepsakes3 = db.keepsakestypes_tbl.Where(p => p.keepsakesTypID == preKeepsakes.keepsakesGrpTyp3).FirstOrDefault();
                            var preKeepsakes4 = db.keepsakestypes_tbl.Where(p => p.keepsakesTypID == preKeepsakes.keepsakesGrpTyp4).FirstOrDefault();
                            var preKeepsakes5 = db.keepsakestypes_tbl.Where(p => p.keepsakesTypID == preKeepsakes.keepsakesGrpTyp5).FirstOrDefault();

                            var preDebut1 = db.debuttypes_tbl.Where(p => p.debutTypID == preDebut.debutGrpTyp1).FirstOrDefault();
                            var preDebut2 = db.debuttypes_tbl.Where(p => p.debutTypID == preDebut.debutGrpTyp2).FirstOrDefault();
                            var preDebut3 = db.debuttypes_tbl.Where(p => p.debutTypID == preDebut.debutGrpTyp3).FirstOrDefault();

                            var pricePax = db.pricepaxs_tbl.Where(p => p.pricePaxID == prePackage.pricePaxID).FirstOrDefault();

                            return Json(new
                            {
                                pricePax = pricePax,
                                prePackage = prePackage,

                                preMainCourse = preMainCourse,

                                preSides1 = preSides1,
                                preSides2 = preSides2,
                                preSides3 = preSides3,
                                preSides4 = preSides4,

                                preCenterPiece = preCenterPiece,

                                preSeating = preSeating,

                                preSpecials1 = preSpecials1,
                                preSpecials2 = preSpecials2,
                                preSpecials3 = preSpecials3,
                                preSpecials4 = preSpecials4,
                                preSpecials5 = preSpecials5,
                                preSpecials6 = preSpecials6,
                                preSpecials7 = preSpecials7,
                                preSpecials8 = preSpecials8,
                                preSpecials9 = preSpecials9,

                                preStaff1 = preStaff1,
                                preStaff2 = preStaff2,
                                preStaff3 = preStaff3,

                                preBackdrop = preBackdrop,

                                preEntrance = preEntrance,

                                preCouch = preCouch,

                                preEquip1 = preEquip1,
                                preEquip2 = preEquip2,
                                preEquip3 = preEquip3,
                                preEquip4 = preEquip4,
                                preEquip5 = preEquip5,
                                preEquip6 = preEquip6,
                                preEquip7 = preEquip7,

                                preEntertainment1 = preEntertainment1,
                                preEntertainment2 = preEntertainment2,
                                preEntertainment3 = preEntertainment3,
                                preEntertainment4 = preEntertainment4,
                                preEntertainment5 = preEntertainment5,
                                preEntertainment6 = preEntertainment6,
                                preEntertainment7 = preEntertainment7,

                                prePhoto1 = prePhoto1,
                                prePhoto2 = prePhoto2,
                                prePhoto3 = prePhoto3,
                                prePhoto4 = prePhoto4,
                                prePhoto5 = prePhoto5,
                                prePhoto6 = prePhoto6,
                                prePhoto7 = prePhoto7,

                                preKeepsakes1 = preKeepsakes1,
                                preKeepsakes2 = preKeepsakes2,
                                preKeepsakes3 = preKeepsakes3,
                                preKeepsakes4 = preKeepsakes4,
                                preKeepsakes5 = preKeepsakes5,

                                preDebut1 = preDebut1,
                                preDebut2 = preDebut2,
                                preDebut3 = preDebut3,

                                success = true,
                                message = "Package Fetched Successfully!"
                            }, JsonRequestBehavior.AllowGet);
                        }
                        else
                        {
                            Logs(
                                "WARN",
                                "Booking Management:",
                                "Attempted to get booking details. Message : \"No Package Found!\"");
                            return Json(new { success = false, message = "No Package Found!" }, JsonRequestBehavior.AllowGet);
                        }
                    }
                    else
                    {
                        Logs(
                            "WARN",
                            "Booking Management:",
                            "Attempted to get booking details. Message : \"No Package Found!\"");
                        return Json(new { success = false, message = "No Package Found!" }, JsonRequestBehavior.AllowGet);
                    }
                }
            }
            catch (Exception ex)
            {
                Logs(
                "LETHAL",
                "Booking Management:",
                "Attempted to get packages. " + ex.Message + "" + ex.InnerException);
                return Json(new { message = "Error connecting to DB: " + ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }


        //start for payments
        public JsonResult GetPayments()
        {
            using (var db = new IsabellaCateringContext())
            {
                var data = db.payments_tbl.Select(p => new
                {
                    paymentID = p.paymentID,
                    bookingID = p.bookingID,
                    amountDue = p.amountDue,
                    amountPaid = p.amountPaid,
                    paymentType = p.paymentType,
                    paymentStatus = p.paymentStatus,
                    dueDate = p.dueDate,
                    dateCreated = p.dateCreated,
                    dateUpdated = p.dateUpdated
                }).ToList();

                var jsonResult = Json(data, JsonRequestBehavior.AllowGet);
                jsonResult.MaxJsonLength = int.MaxValue;
                return jsonResult;
            }
        }
        [HttpPost]
        public JsonResult paymentInfo(tblPaymentsModel paymentData)
        {
            try
            {
                using (var db = new IsabellaCateringContext())
                {
                    var existingPayment = db.payments_tbl.FirstOrDefault(p => p.paymentID == paymentData.paymentID);

                    if (existingPayment != null)
                    {
                        existingPayment.amountDue = paymentData.amountDue;
                        existingPayment.amountPaid = paymentData.amountPaid;
                        existingPayment.paymentType = paymentData.paymentType;
                        existingPayment.paymentStatus = paymentData.paymentStatus;
                        existingPayment.dueDate = paymentData.dueDate;
                        existingPayment.dateUpdated = DateTime.Now;
                    }
                    else
                    {
                        var newPayment = new tblPaymentsModel()
                        {
                            bookingID = paymentData.bookingID,
                            amountDue = paymentData.amountDue,
                            amountPaid = paymentData.amountPaid,
                            paymentType = paymentData.paymentType,
                            paymentStatus = paymentData.paymentStatus,
                            dueDate = paymentData.dueDate,
                            dateCreated = DateTime.Now,
                            dateUpdated = DateTime.Now
                        };
                        db.payments_tbl.Add(newPayment);
                    }

                    db.SaveChanges();
                    return Json(new { success = true, message = "Saved successfully!" });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public JsonResult UpdatePayment(tblPaymentsModel paymentData)
        {
            try
            {
                using (var db = new IsabellaCateringContext())
                {
                    var existing = db.payments_tbl
                                     .FirstOrDefault(p => p.paymentID == paymentData.paymentID);

                    if (existing == null)
                        return Json(new { success = false, message = "Payment not found." });

                    existing.bookingID = paymentData.bookingID;
                    existing.paymentType = paymentData.paymentType;
                    existing.amountDue = paymentData.amountDue;
                    existing.amountPaid = paymentData.amountPaid;
                    existing.paymentStatus = paymentData.paymentStatus;
                    existing.dueDate = paymentData.dueDate;
                    existing.dateUpdated = DateTime.Now;

                    db.SaveChanges();
                }
                return Json(new { success = true, message = "Updated successfully!" });
            }
            catch (Exception ex)
            {
                string realError = ex.Message;
                if (ex.InnerException != null)
                {
                    realError = ex.InnerException.Message;
                    if (ex.InnerException.InnerException != null)
                        realError = ex.InnerException.InnerException.Message;
                }
                return Json(new { success = false, message = realError });
            }
        }

        [HttpPost]
        public JsonResult DeletePayment(int id)
        {
            try
            {
                using (var db = new IsabellaCateringContext())
                {
                    var record = db.payments_tbl.Find(id);
                    if (record != null)
                    {
                        db.payments_tbl.Remove(record);
                        db.SaveChanges();
                        return Json(new { success = true });
                    }
                    return Json(new { success = false });
                }
            }
            catch (Exception ex) { return Json(new { success = false, message = ex.Message }); }
        }

        public JsonResult GetBookingsWithoutPayments()
        {
            try
            {
                using (var db = new IsabellaCateringContext())
                {
                    var bookingIDsWithPayments = db.payments_tbl
                                                   .Select(p => p.bookingID)
                                                   .Distinct()
                                                   .ToList();

                    var bookings = db.bookings_tbl
                                     .Where(b => !bookingIDsWithPayments.Contains(b.bookingID))
                                     .Select(b => new
                                     {
                                         bookingID = b.bookingID
                                     })
                                     .ToList();

                    return Json(bookings, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        public JsonResult GetClientEmailByBooking(int bookingID)
        {
            try
            {
                using (var db = new IsabellaCateringContext())
                {
                    var booking = db.bookings_tbl
                                    .FirstOrDefault(b => b.bookingID == bookingID);
                    if (booking == null)
                        return Json(new { success = false, message = "Booking not found. BookingID: " + bookingID },
                                    JsonRequestBehavior.AllowGet);

                    var client = db.clients_tbl
                                   .FirstOrDefault(c => c.clientID == booking.clientID);
                    if (client == null)
                        return Json(new
                        {
                            success = false,
                            message = "Client not found. BookingID: " + bookingID + " | ClientID from booking: " + booking.clientID
                        }, JsonRequestBehavior.AllowGet);

                    return Json(new
                    {
                        success = true,
                        email = client.cEmail,
                        firstName = client.cFName,
                        lastName = client.cLName,
                        bookingID = bookingID
                    }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                var innerMsg = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return Json(new { success = false, message = innerMsg }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public JsonResult LogPaymentReminder(tblPaymentRemindersModel model)
        {
            try
            {
                using (var db = new IsabellaCateringContext())
                {
                    var now = DateTime.Now;
                    var reminder = new tblPaymentRemindersModel
                    {
                        paymentID = model.paymentID,
                        sentBy = model.sentBy,
                        sentAt = model.sentAt,
                        note = model.note,
                        dateCreated = now,
                        dateUpdated = now
                    };
                    db.paymentreminders_tbl.Add(reminder);
                    db.SaveChanges();

                    Logs(
                        "INFO",
                        "Payment Management:",
                        $"Booking Payment Reminder Data has been created. paymentID: {reminder.paymentID}");
                }
                return Json(new { success = true });
            }
            catch (Exception ex)
            {
                Logs(
                "LETHAL",
                "Payment Management:",
                "Attempted to get payment reminders. " + ex.Message + "" + ex.InnerException);
                return Json(new { success = false, message = ex.Message });
            }
        }

        public JsonResult GetLogs()
        {
            using (var db = new IsabellaCateringContext())
            {
                var data = (from log in db.activitylogs_tbl
                            select new
                            {
                                logID = log.logID + ": " + log.userID + " [" + log.permission + "]",
                                action = " [" + log.level + "] "+" {" + log.processService + ": " + log.processDesc+"} "+log.traceID,
                                dateUpdated = log.dateCreated,
                                userName = log.userEmail,
                            }).ToList();
                return Json(data, JsonRequestBehavior.AllowGet);
            }
        }
    }
}
