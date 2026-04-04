using IsabellaCateringWebApp.Models.Context;
using IsabellaCateringWebApp.Models.Models;
using Org.BouncyCastle.Bcpg;
using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
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
                                return Json(new { success = true, data = creds, isGuest=true }, JsonRequestBehavior.AllowGet);
                            }
                            else {
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

                                return Json(new { success = false, message = "Account Locked" }, JsonRequestBehavior.AllowGet);
                            }

                            db.SaveChanges(); // Save the incremented attempt

                            int attemptsLeft = 3 - verify.attempts;
                            return Json(new { success = false, message = $"Invalid password. {attemptsLeft} attempts remaining." }, JsonRequestBehavior.AllowGet);
                        }
                    } else {

                        var verify = db.users_tbl.Where(x => x.email.Equals(userInfo.email)).FirstOrDefault();
                        if (verify == null)
                        {
                            return Json(new { success = false, message = "Invalid Credentials" }, JsonRequestBehavior.AllowGet); ;
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
                            return Json(new { success = true, data = creds, isGuest=false }, JsonRequestBehavior.AllowGet);
                        }
                        else
                        {
                            verify.attempts += 1;

                            if (verify.attempts >= 3)
                            {
                                verify.lockoutEnd = DateTime.Now.AddMinutes(15); // Lock account for 15 minutes
                                db.SaveChanges();

                                return Json(new { success = false, message = "Account Locked" }, JsonRequestBehavior.AllowGet);
                            }

                            db.SaveChanges(); // Save the incremented attempt

                            int attemptsLeft = 3 - verify.attempts;
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
                return Json(new { success = true, message = "Session Set!" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
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
                if (isG == "True") {
                    int id = int.Parse(uID);
                    using (var db = new IsabellaCateringContext())
                    {
                        var user = db.clients_tbl.FirstOrDefault(x => x.clientID == id);
                        if (user != null) uName = $"{user.cFName} {user.cLName}";
                    }
                } else { 
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
                Session.Clear();
                Session.Abandon();
                return Json(new { success = true, message = "Logout Success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
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
                    return Json(new { success = false, message = "User not found." });
                }
            }
            catch (Exception ex)
            {
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
                    return Json(new { success = false, message = "User not found." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        public JsonResult removeBooking(int bookingID)
        {
            try
            {
                if (Session["currentBooking"].ToString() == bookingID.ToString())
                {
                    using (var db = new IsabellaCateringContext())
                    {
                        var toRemoveBooking = db.bookings_tbl
                            .Where(x => x.bookingID == bookingID)
                            .FirstOrDefault();
                        if (toRemoveBooking != null)
                        {
                            var toRemoveReceipt = db.bookingreceipts_tbl
                                .Where(x => x.bookingID == toRemoveBooking.bookingID)
                                .FirstOrDefault();
                            if (toRemoveReceipt != null)
                            {
                                var toRemoveClient = db.clients_tbl
                                    .Where(x => x.receiptID == toRemoveReceipt.receiptID)
                                    .FirstOrDefault();

                                if (toRemoveClient != null)
                                {
                                    var toRemovePayment = db.payments_tbl
                                        .Where(x => x.bookingID == toRemoveBooking.bookingID)
                                        .FirstOrDefault();
                                    if (toRemovePayment != null)
                                    {
                                        var toRemovePaymentReminder = db.paymentreminders_tbl
                                            .Where(x => x.paymentID == toRemovePayment.paymentID)
                                            .ToList();
                                        if (toRemovePaymentReminder.Any())
                                        {
                                            db.paymentreminders_tbl.RemoveRange(toRemovePaymentReminder);
                                        }
                                        db.payments_tbl.Remove(toRemovePayment);
                                        db.clients_tbl.Remove(toRemoveClient);
                                        db.bookingreceipts_tbl.Remove(toRemoveReceipt);
                                        db.bookings_tbl.Remove(toRemoveBooking);
                                        db.SaveChanges();

                                        return Json(new { success = true, message = "Booking records, along with the client, receipt, payments and reminders has been deleted!" }, JsonRequestBehavior.AllowGet);
                                    }
                                    else
                                        return Json(new { success = false, message = "Payment Not Found!" }, JsonRequestBehavior.AllowGet);
                                }
                                else
                                    return Json(new { success = false, message = "Client Not Found!" }, JsonRequestBehavior.AllowGet);
                            }
                            else
                                return Json(new { success = false, message = "Booking receipt Not Found!" }, JsonRequestBehavior.AllowGet);
                        }
                        else
                            return Json(new { success = false, message = "Booking Not Found!" }, JsonRequestBehavior.AllowGet);
                    }

                }
                else
                {
                    return Json(new { success = false, message = "Booking mismatch!" }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error connecting to DB: " + ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        public JsonResult addBooking(tblBookingsModel bookingData)
        {
            try
            {
                using (var db = new IsabellaCateringContext())
                {
                    var newBooking = new tblBookingsModel()
                    {
                        packageID = bookingData.packageID,
                        dsgnTheme = bookingData.dsgnTheme,
                        dsgnMotif = bookingData.dsgnMotif,
                        venue = bookingData.venue,
                        bookingDate = DateTime.Now,
                        eventSetTime = bookingData.eventSetTime,
                        eventTime = bookingData.eventTime,
                        ceremTime = bookingData.ceremTime,
                        eventMealTime = bookingData.eventMealTime,
                        progressOne = 1,
                        progressTwo = 1,
                        progressThree = 1,
                        dateCreated = DateTime.Now,
                        dateUpdated = DateTime.Now,
                        createdBy = 1,
                        clientID = 1001,
                        prepVenue = "yes",

                    };

                    // Add to DbSet and save
                    db.bookings_tbl.Add(newBooking);
                    db.SaveChanges();
                }

                return Json(new { success = true, message = "Booking Successfully Added" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
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
                return Json(new { message = "Error connecting to DB: " + ex.Message, bookingID = booking.bookingID }, JsonRequestBehavior.AllowGet);
            }
        }

        public JsonResult checkCalendarAvailability(string formattedDate)
        {
            try
            {
                if (formattedDate == null) {
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
                                        eventName = client.eventName,
                                        eventTime = booking.eventTime
                                    })
                                    .ToList()
                                    .Select(booking => new
                                    {
                                        booking.bookingID,
                                        dateKey = booking.bookingDate.Year + "-" + booking.bookingDate.Month + "-" + booking.bookingDate.Day,
                                        booking.eventName,
                                        booking.eventTime
                                    })
                                    .ToList();

                    return Json(new { bookingData = bookings, success = true }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
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
                                        var bookingPayment = db.payments_tbl
                                            .Where(e => e.bookingID == bookingID)
                                            .FirstOrDefault();

                                        if(bookingPayment != null)
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
                                            return Json(new { success = false, message = "No Payment Found!" }, JsonRequestBehavior.AllowGet);
                                        }
                                    }
                                    else
                                    {
                                        return Json(new { success = false, message = "No Event Found!" }, JsonRequestBehavior.AllowGet);
                                    }
                                }
                                else
                                {
                                    return Json(new { success = false, message = "No Package Found!" }, JsonRequestBehavior.AllowGet);
                                }
                            }
                            else
                            {
                                return Json(new { success = false, message = "No Client Found!" }, JsonRequestBehavior.AllowGet);
                            }
                        }
                        else
                        {
                            return Json(new { success = false, message = "No Package Found!" }, JsonRequestBehavior.AllowGet);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
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
                grpSidesID = newSides.sidesGrpTypID;
            }

            var existingSpecials = db.specialsgrptypes_tbl.FirstOrDefault(x => x.specialsGrpTyp1 == specialsGrpTypes.specialsGrpTyp1 && x.specialsGrpTyp2 == specialsGrpTypes.specialsGrpTyp2 && x.specialsGrpTyp3 == specialsGrpTypes.specialsGrpTyp3 && x.specialsGrpTyp4 == specialsGrpTypes.specialsGrpTyp4 && x.specialsGrpTyp5 == specialsGrpTypes.specialsGrpTyp5 && x.specialsGrpTyp6 == specialsGrpTypes.specialsGrpTyp6 && x.specialsGrpTyp7 == specialsGrpTypes.specialsGrpTyp7 && x.specialsGrpTyp8 == specialsGrpTypes.specialsGrpTyp8 && x.specialsGrpTyp9 == specialsGrpTypes.specialsGrpTyp9);
            var grpSpecialsID = existingSpecials != null ? existingSpecials.specialsGrpTypID : 0;
            if (existingSpecials == null)
            {
                var newSpecials = new tblSpecialsGrpTypesModel() { specialsGrpTyp1 = specialsGrpTypes.specialsGrpTyp1, specialsGrpTyp2 = specialsGrpTypes.specialsGrpTyp2, specialsGrpTyp3 = specialsGrpTypes.specialsGrpTyp3, specialsGrpTyp4 = specialsGrpTypes.specialsGrpTyp4, specialsGrpTyp5 = specialsGrpTypes.specialsGrpTyp5, specialsGrpTyp6 = specialsGrpTypes.specialsGrpTyp6, specialsGrpTyp7 = specialsGrpTypes.specialsGrpTyp7, specialsGrpTyp8 = specialsGrpTypes.specialsGrpTyp8, specialsGrpTyp9 = specialsGrpTypes.specialsGrpTyp9, dateCreated = now, dateUpdated = now };
                db.specialsgrptypes_tbl.Add(newSpecials);
                db.SaveChanges();
                grpSpecialsID = newSpecials.specialsGrpTypID;
            }

            var existingStaff = db.staffgrptypes_tbl.FirstOrDefault(x => x.staffGrpTyp1 == staffGrpTypes.staffGrpTyp1 && x.staffGrpTyp2 == staffGrpTypes.staffGrpTyp2 && x.staffGrpTyp3 == staffGrpTypes.staffGrpTyp3);
            var grpStaffID = existingStaff != null ? existingStaff.staffGrpTypID : 0;
            if (existingStaff == null)
            {
                var newStaff = new tblStaffGrpTypesModel() { staffGrpTyp1 = staffGrpTypes.staffGrpTyp1, staffGrpTyp2 = staffGrpTypes.staffGrpTyp2, staffGrpTyp3 = staffGrpTypes.staffGrpTyp3, dateCreated = now, dateUpdated = now };
                db.staffgrptypes_tbl.Add(newStaff);
                db.SaveChanges();
                grpStaffID = newStaff.staffGrpTypID;
            }

            var existingEquipment = db.equipgrptypes_tbl.FirstOrDefault(x => x.equipGrpTyp1 == equipGrpTypes.equipGrpTyp1 && x.equipGrpTyp2 == equipGrpTypes.equipGrpTyp2 && x.equipGrpTyp3 == equipGrpTypes.equipGrpTyp3 && x.equipGrpTyp4 == equipGrpTypes.equipGrpTyp4 && x.equipGrpTyp5 == equipGrpTypes.equipGrpTyp5 && x.equipGrpTyp6 == equipGrpTypes.equipGrpTyp6 && x.equipGrpTyp7 == equipGrpTypes.equipGrpTyp7);
            var grpEquipID = existingEquipment != null ? existingEquipment.equipGrpTypID : 0;
            if (existingEquipment == null)
            {
                var newEquip = new tblEquipGrpTypesModel() { equipGrpTyp1 = equipGrpTypes.equipGrpTyp1, equipGrpTyp2 = equipGrpTypes.equipGrpTyp2, equipGrpTyp3 = equipGrpTypes.equipGrpTyp3, equipGrpTyp4 = equipGrpTypes.equipGrpTyp4, equipGrpTyp5 = equipGrpTypes.equipGrpTyp5, equipGrpTyp6 = equipGrpTypes.equipGrpTyp6, equipGrpTyp7 = equipGrpTypes.equipGrpTyp7, dateCreated = now, dateUpdated = now };
                db.equipgrptypes_tbl.Add(newEquip);
                db.SaveChanges();
                grpEquipID = newEquip.equipGrpTypID;
            }

            var existingEntertainment = db.entertainmentgrptypes_tbl.FirstOrDefault(x => x.entertainmentGrpTyp1 == entertainmentGrpTypes.entertainmentGrpTyp1 && x.entertainmentGrpTyp2 == entertainmentGrpTypes.entertainmentGrpTyp2 && x.entertainmentGrpTyp3 == entertainmentGrpTypes.entertainmentGrpTyp3 && x.entertainmentGrpTyp4 == entertainmentGrpTypes.entertainmentGrpTyp4 && x.entertainmentGrpTyp5 == entertainmentGrpTypes.entertainmentGrpTyp5 && x.entertainmentGrpTyp6 == entertainmentGrpTypes.entertainmentGrpTyp6 && x.entertainmentGrpTyp7 == entertainmentGrpTypes.entertainmentGrpTyp7);
            var grpEntertainmentID = existingEntertainment != null ? existingEntertainment.entertainmentGrpTypID : 0;
            if (existingEntertainment == null)
            {
                var newEntertainment = new tblEntertainmentGrpTypesModel() { entertainmentGrpTyp1 = entertainmentGrpTypes.entertainmentGrpTyp1, entertainmentGrpTyp2 = entertainmentGrpTypes.entertainmentGrpTyp2, entertainmentGrpTyp3 = entertainmentGrpTypes.entertainmentGrpTyp3, entertainmentGrpTyp4 = entertainmentGrpTypes.entertainmentGrpTyp4, entertainmentGrpTyp5 = entertainmentGrpTypes.entertainmentGrpTyp5, entertainmentGrpTyp6 = entertainmentGrpTypes.entertainmentGrpTyp6, entertainmentGrpTyp7 = entertainmentGrpTypes.entertainmentGrpTyp7, dateCreated = now, dateUpdated = now };
                db.entertainmentgrptypes_tbl.Add(newEntertainment);
                db.SaveChanges();
                grpEntertainmentID = newEntertainment.entertainmentGrpTypID;
            }

            var existingPhoto = db.photogrptypes_tbl.FirstOrDefault(x => x.photoGrpTyp1 == photoGrpTypes.photoGrpTyp1 && x.photoGrpTyp2 == photoGrpTypes.photoGrpTyp2 && x.photoGrpTyp3 == photoGrpTypes.photoGrpTyp3 && x.photoGrpTyp4 == photoGrpTypes.photoGrpTyp4 && x.photoGrpTyp5 == photoGrpTypes.photoGrpTyp5 && x.photoGrpTyp6 == photoGrpTypes.photoGrpTyp6 && x.photoGrpTyp7 == photoGrpTypes.photoGrpTyp7);
            var grpPhotoID = existingPhoto != null ? existingPhoto.photoGrpTypID : 0;
            if (existingPhoto == null)
            {
                var newPhoto = new tblPhotoGrpTypesModel() { photoGrpTyp1 = photoGrpTypes.photoGrpTyp1, photoGrpTyp2 = photoGrpTypes.photoGrpTyp2, photoGrpTyp3 = photoGrpTypes.photoGrpTyp3, photoGrpTyp4 = photoGrpTypes.photoGrpTyp4, photoGrpTyp5 = photoGrpTypes.photoGrpTyp5, photoGrpTyp6 = photoGrpTypes.photoGrpTyp6, photoGrpTyp7 = photoGrpTypes.photoGrpTyp7, dateCreated = now, dateUpdated = now };
                db.photogrptypes_tbl.Add(newPhoto);
                db.SaveChanges();
                grpPhotoID = newPhoto.photoGrpTypID;
            }

            var existingKeepsakes = db.keepsakesgrptypes_tbl.FirstOrDefault(x => x.keepsakesGrpTyp1 == keepsakesGrpTypes.keepsakesGrpTyp1 && x.keepsakesGrpTyp2 == keepsakesGrpTypes.keepsakesGrpTyp2 && x.keepsakesGrpTyp3 == keepsakesGrpTypes.keepsakesGrpTyp3 && x.keepsakesGrpTyp4 == keepsakesGrpTypes.keepsakesGrpTyp4 && x.keepsakesGrpTyp5 == keepsakesGrpTypes.keepsakesGrpTyp5);
            var grpKeepsakesID = existingKeepsakes != null ? existingKeepsakes.keepsakesGrpTypID : 0;
            if (existingKeepsakes == null)
            {
                var newKeepsakes = new tblKeepsakesGrpTypesModel() { keepsakesGrpTyp1 = keepsakesGrpTypes.keepsakesGrpTyp1, keepsakesGrpTyp2 = keepsakesGrpTypes.keepsakesGrpTyp2, keepsakesGrpTyp3 = keepsakesGrpTypes.keepsakesGrpTyp3, keepsakesGrpTyp4 = keepsakesGrpTypes.keepsakesGrpTyp4, keepsakesGrpTyp5 = keepsakesGrpTypes.keepsakesGrpTyp5, dateCreated = now, dateUpdated = now };
                db.keepsakesgrptypes_tbl.Add(newKeepsakes);
                db.SaveChanges();
                grpKeepsakesID = newKeepsakes.keepsakesGrpTypID;
            }

            var existingDebut = db.debutgrptypes_tbl.FirstOrDefault(x => x.debutGrpTyp1 == debutGrpTypes.debutGrpTyp1 && x.debutGrpTyp2 == debutGrpTypes.debutGrpTyp2 && x.debutGrpTyp3 == debutGrpTypes.debutGrpTyp3);
            var grpDebutID = existingDebut != null ? existingDebut.debutGrpTypID : 0;
            if (existingDebut == null)
            {
                var newDebut = new tblDebutGrpTypesModel() { debutGrpTyp1 = debutGrpTypes.debutGrpTyp1, debutGrpTyp2 = debutGrpTypes.debutGrpTyp2, debutGrpTyp3 = debutGrpTypes.debutGrpTyp3, dateCreated = now, dateUpdated = now };
                db.debutgrptypes_tbl.Add(newDebut);
                db.SaveChanges();
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
                    var currPackageID = ResolvePackageId(db, packages, sidesGrpTypes, specialsGrpTypes, staffGrpTypes, equipGrpTypes, entertainmentGrpTypes, photoGrpTypes, keepsakesGrpTypes, debutGrpTypes);

                            db.sidesgrptypes_tbl.Add(newSides);
                            db.SaveChanges();

                            grpSidesID = newSides.sidesGrpTypID;
                        }

                        var existingSpecials = db.specialsgrptypes_tbl.FirstOrDefault(x =>
                            x.specialsGrpTyp1 == specialsGrpTypes.specialsGrpTyp1 &&
                            x.specialsGrpTyp2 == specialsGrpTypes.specialsGrpTyp2 &&
                            x.specialsGrpTyp3 == specialsGrpTypes.specialsGrpTyp3 &&
                            x.specialsGrpTyp4 == specialsGrpTypes.specialsGrpTyp4 &&
                            x.specialsGrpTyp5 == specialsGrpTypes.specialsGrpTyp5 &&
                            x.specialsGrpTyp6 == specialsGrpTypes.specialsGrpTyp6 &&
                            x.specialsGrpTyp7 == specialsGrpTypes.specialsGrpTyp7 &&
                            x.specialsGrpTyp8 == specialsGrpTypes.specialsGrpTyp8 &&
                            x.specialsGrpTyp9 == specialsGrpTypes.specialsGrpTyp9
                        );
                        if (existingSpecials != null)
                        {
                            grpSpecialsID = existingSpecials.specialsGrpTypID;
                        }
                        else
                        {
                            var newSpecials = new tblSpecialsGrpTypesModel()
                            {
                                specialsGrpTyp1 = specialsGrpTypes.specialsGrpTyp1,
                                specialsGrpTyp2 = specialsGrpTypes.specialsGrpTyp2,
                                specialsGrpTyp3 = specialsGrpTypes.specialsGrpTyp3,
                                specialsGrpTyp4 = specialsGrpTypes.specialsGrpTyp4,
                                specialsGrpTyp5 = specialsGrpTypes.specialsGrpTyp5,
                                specialsGrpTyp6 = specialsGrpTypes.specialsGrpTyp6,
                                specialsGrpTyp7 = specialsGrpTypes.specialsGrpTyp7,
                                specialsGrpTyp8 = specialsGrpTypes.specialsGrpTyp8,
                                specialsGrpTyp9 = specialsGrpTypes.specialsGrpTyp9,
                                dateCreated = DateTime.Now,
                                dateUpdated = DateTime.Now
                            };

                            db.specialsgrptypes_tbl.Add(newSpecials);
                            db.SaveChanges();

                            grpSpecialsID = newSpecials.specialsGrpTypID;
                        }

                        var existingStaff = db.staffgrptypes_tbl.FirstOrDefault(x =>
                            x.staffGrpTyp1 == staffGrpTypes.staffGrpTyp1 &&
                            x.staffGrpTyp2 == staffGrpTypes.staffGrpTyp2 &&
                            x.staffGrpTyp3 == staffGrpTypes.staffGrpTyp3
                        );
                        if (existingStaff != null)
                        {
                            grpStaffID = existingStaff.staffGrpTypID;
                        }
                        else
                        {
                            var newStaff = new tblStaffGrpTypesModel()
                            {
                                staffGrpTyp1 = staffGrpTypes.staffGrpTyp1,
                                staffGrpTyp2 = staffGrpTypes.staffGrpTyp2,
                                staffGrpTyp3 = staffGrpTypes.staffGrpTyp3,
                                dateCreated = DateTime.Now,
                                dateUpdated = DateTime.Now
                            };

                            db.staffgrptypes_tbl.Add(newStaff);
                            db.SaveChanges();

                            grpStaffID = newStaff.staffGrpTypID;
                        }

                        var existingEquipment = db.equipgrptypes_tbl.FirstOrDefault(x =>
                            x.equipGrpTyp1 == equipGrpTypes.equipGrpTyp1 &&
                            x.equipGrpTyp2 == equipGrpTypes.equipGrpTyp2 &&
                            x.equipGrpTyp3 == equipGrpTypes.equipGrpTyp3 &&
                            x.equipGrpTyp4 == equipGrpTypes.equipGrpTyp4 &&
                            x.equipGrpTyp5 == equipGrpTypes.equipGrpTyp5 &&
                            x.equipGrpTyp6 == equipGrpTypes.equipGrpTyp6 &&
                            x.equipGrpTyp7 == equipGrpTypes.equipGrpTyp7
                        );
                        if (existingEquipment != null)
                        {
                            grpEquipID = existingEquipment.equipGrpTypID;
                        }
                        else
                        {
                            var newEquip = new tblEquipGrpTypesModel()
                            {
                                equipGrpTyp1 = equipGrpTypes.equipGrpTyp1,
                                equipGrpTyp2 = equipGrpTypes.equipGrpTyp2,
                                equipGrpTyp3 = equipGrpTypes.equipGrpTyp3,
                                equipGrpTyp4 = equipGrpTypes.equipGrpTyp4,
                                equipGrpTyp5 = equipGrpTypes.equipGrpTyp5,
                                equipGrpTyp6 = equipGrpTypes.equipGrpTyp6,
                                equipGrpTyp7 = equipGrpTypes.equipGrpTyp7,
                                dateCreated = DateTime.Now,
                                dateUpdated = DateTime.Now
                            };

                            db.equipgrptypes_tbl.Add(newEquip);
                            db.SaveChanges();

                            grpEquipID = newEquip.equipGrpTypID;
                        }

                        var existingEntertainment = db.entertainmentgrptypes_tbl.FirstOrDefault(x =>
                            x.entertainmentGrpTyp1 == entertainmentGrpTypes.entertainmentGrpTyp1 &&
                            x.entertainmentGrpTyp2 == entertainmentGrpTypes.entertainmentGrpTyp2 &&
                            x.entertainmentGrpTyp3 == entertainmentGrpTypes.entertainmentGrpTyp3 &&
                            x.entertainmentGrpTyp4 == entertainmentGrpTypes.entertainmentGrpTyp4 &&
                            x.entertainmentGrpTyp5 == entertainmentGrpTypes.entertainmentGrpTyp5 &&
                            x.entertainmentGrpTyp6 == entertainmentGrpTypes.entertainmentGrpTyp6 &&
                            x.entertainmentGrpTyp7 == entertainmentGrpTypes.entertainmentGrpTyp7
                        );
                        if (existingEntertainment != null)
                        {
                            grpEntertainmentID = existingEntertainment.entertainmentGrpTypID;
                        }
                        else
                        {
                            var newEntertainment = new tblEntertainmentGrpTypesModel()
                            {
                                entertainmentGrpTyp1 = entertainmentGrpTypes.entertainmentGrpTyp1,
                                entertainmentGrpTyp2 = entertainmentGrpTypes.entertainmentGrpTyp2,
                                entertainmentGrpTyp3 = entertainmentGrpTypes.entertainmentGrpTyp3,
                                entertainmentGrpTyp4 = entertainmentGrpTypes.entertainmentGrpTyp4,
                                entertainmentGrpTyp5 = entertainmentGrpTypes.entertainmentGrpTyp5,
                                entertainmentGrpTyp6 = entertainmentGrpTypes.entertainmentGrpTyp6,
                                entertainmentGrpTyp7 = entertainmentGrpTypes.entertainmentGrpTyp7,
                                dateCreated = DateTime.Now,
                                dateUpdated = DateTime.Now
                            };

                            db.entertainmentgrptypes_tbl.Add(newEntertainment);
                            db.SaveChanges();

                            grpEntertainmentID = newEntertainment.entertainmentGrpTypID;
                        }

                        var existingPhoto = db.photogrptypes_tbl.FirstOrDefault(x =>
                            x.photoGrpTyp1 == photoGrpTypes.photoGrpTyp1 &&
                            x.photoGrpTyp2 == photoGrpTypes.photoGrpTyp2 &&
                            x.photoGrpTyp3 == photoGrpTypes.photoGrpTyp3 &&
                            x.photoGrpTyp4 == photoGrpTypes.photoGrpTyp4 &&
                            x.photoGrpTyp5 == photoGrpTypes.photoGrpTyp5 &&
                            x.photoGrpTyp6 == photoGrpTypes.photoGrpTyp6 &&
                            x.photoGrpTyp7 == photoGrpTypes.photoGrpTyp7
                        );
                        if (existingPhoto != null)
                        {
                            grpPhotoID = existingPhoto.photoGrpTypID;
                        }
                        else
                        {
                            var newPhoto = new tblPhotoGrpTypesModel()
                            {
                                photoGrpTyp1 = photoGrpTypes.photoGrpTyp1,
                                photoGrpTyp2 = photoGrpTypes.photoGrpTyp2,
                                photoGrpTyp3 = photoGrpTypes.photoGrpTyp3,
                                photoGrpTyp4 = photoGrpTypes.photoGrpTyp4,
                                photoGrpTyp5 = photoGrpTypes.photoGrpTyp5,
                                photoGrpTyp6 = photoGrpTypes.photoGrpTyp6,
                                photoGrpTyp7 = photoGrpTypes.photoGrpTyp7,
                                dateCreated = DateTime.Now,
                                dateUpdated = DateTime.Now
                            };

                            db.photogrptypes_tbl.Add(newPhoto);
                            db.SaveChanges();

                            grpPhotoID = newPhoto.photoGrpTypID;
                        }

                        var existingKeepsakes = db.keepsakesgrptypes_tbl.FirstOrDefault(x =>
                            x.keepsakesGrpTyp1 == keepsakesGrpTypes.keepsakesGrpTyp1 &&
                            x.keepsakesGrpTyp2 == keepsakesGrpTypes.keepsakesGrpTyp2 &&
                            x.keepsakesGrpTyp3 == keepsakesGrpTypes.keepsakesGrpTyp3 &&
                            x.keepsakesGrpTyp4 == keepsakesGrpTypes.keepsakesGrpTyp4 &&
                            x.keepsakesGrpTyp5 == keepsakesGrpTypes.keepsakesGrpTyp5
                        );
                        if (existingKeepsakes != null)
                        {
                            grpKeepsakesID = existingKeepsakes.keepsakesGrpTypID;
                        }
                        else
                        {
                            var newKeepsakes = new tblKeepsakesGrpTypesModel()
                            {
                                keepsakesGrpTyp1 = keepsakesGrpTypes.keepsakesGrpTyp1,
                                keepsakesGrpTyp2 = keepsakesGrpTypes.keepsakesGrpTyp2,
                                keepsakesGrpTyp3 = keepsakesGrpTypes.keepsakesGrpTyp3,
                                keepsakesGrpTyp4 = keepsakesGrpTypes.keepsakesGrpTyp4,
                                keepsakesGrpTyp5 = keepsakesGrpTypes.keepsakesGrpTyp5,
                                dateCreated = DateTime.Now,
                                dateUpdated = DateTime.Now
                            };

                            db.keepsakesgrptypes_tbl.Add(newKeepsakes);
                            db.SaveChanges();

                            grpKeepsakesID = newKeepsakes.keepsakesGrpTypID;
                        }

                        var existingDebut = db.debutgrptypes_tbl.FirstOrDefault(x =>
                            x.debutGrpTyp1 == debutGrpTypes.debutGrpTyp1 &&
                            x.debutGrpTyp2 == debutGrpTypes.debutGrpTyp2 &&
                            x.debutGrpTyp3 == debutGrpTypes.debutGrpTyp3
                        );
                        if (existingDebut != null)
                        {
                            grpDebutID = existingDebut.debutGrpTypID;
                        }
                        else
                        {
                            var newDebut = new tblDebutGrpTypesModel()
                            {
                                debutGrpTyp1 = debutGrpTypes.debutGrpTyp1,
                                debutGrpTyp2 = debutGrpTypes.debutGrpTyp2,
                                debutGrpTyp3 = debutGrpTypes.debutGrpTyp3,
                                dateCreated = DateTime.Now,
                                dateUpdated = DateTime.Now
                            };

                            db.debutgrptypes_tbl.Add(newDebut);
                            db.SaveChanges();

                            grpDebutID = newDebut.debutGrpTypID;
                        }

                        var existingPackage = db.packages_tbl.FirstOrDefault(x =>
                            x.mainCourseTypID == packages.mainCourseTypID &&
                            x.sidesGrpTypID == grpSidesID &&
                            x.centerPieceTypID == packages.centerPieceTypID &&
                            x.seatingTypID == packages.seatingTypID &&
                            x.specialsGrpTypID == grpSpecialsID &&
                            x.staffGrpTypID == grpStaffID &&
                            x.backdropTypID == packages.backdropTypID &&
                            x.entranceTypID == packages.entranceTypID &&
                            x.couchTypID == packages.couchTypID &&
                            x.equipGrpTypID == grpEquipID &&
                            x.entertainmentGrpTypID == grpEntertainmentID &&
                            x.photoGrpTypID == grpPhotoID &&
                            x.keepsakesGrptypID == grpKeepsakesID &&
                            x.debutGrpTypID == grpDebutID &&
                            x.incStaples == packages.incStaples &&
                            x.incBftSet == packages.incBftSet &&
                            x.incStyling == packages.incStyling &&
                            x.incTableSet == packages.incTableSet &&
                            x.incDnrWare == packages.incDnrWare
                        );
                        if (existingPackage != null)
                        {
                            currPackageID = existingPackage.packageID;
                        }
                        else
                        {
                            var newPackage = new tblPackagesModel()
                            {
                                packageTypID = packages.packageTypID,
                                pricePaxID = packages.packageTypID,
                                mainCourseTypID = packages.mainCourseTypID,
                                sidesGrpTypID = grpSidesID,
                                centerPieceTypID = packages.centerPieceTypID,
                                seatingTypID = packages.seatingTypID,
                                specialsGrpTypID = grpSpecialsID,
                                staffGrpTypID = grpStaffID,
                                backdropTypID = packages.backdropTypID,
                                entranceTypID = packages.entranceTypID,
                                couchTypID = packages.couchTypID,
                                equipGrpTypID = grpEquipID,
                                entertainmentGrpTypID = grpEntertainmentID,
                                photoGrpTypID = grpPhotoID,
                                keepsakesGrptypID = grpKeepsakesID,
                                debutGrpTypID = grpDebutID,
                                incStaples = packages.incStaples,
                                incBftSet = packages.incBftSet,
                                incStyling = packages.incStyling,
                                incTableSet = packages.incTableSet,
                                incDnrWare = packages.incDnrWare,
                                dateCreated = DateTime.Now,
                                dateUpdated = DateTime.Now
                            };

                            db.packages_tbl.Add(newPackage);
                            db.SaveChanges();

                            currPackageID = newPackage.packageID;
                        }
                        int editBookingID = Convert.ToInt32(Session["currentBooking"]);

                        var toEditBooking = db.bookings_tbl
                            .Where(x => x.bookingID == editBookingID)
                            .FirstOrDefault();
                        if (toEditBooking != null)
                        {
                            toEditBooking.packageID = currPackageID;
                            toEditBooking.eventID = bookingInfo.eventID;
                            toEditBooking.dsgnTheme = bookingInfo.dsgnTheme;
                            toEditBooking.dsgnMotif = bookingInfo.dsgnMotif;
                            toEditBooking.prepVenue = bookingInfo.prepVenue;
                            toEditBooking.bookingDate = bookingInfo.bookingDate;
                            toEditBooking.ceremTime = bookingInfo.ceremTime;
                            toEditBooking.eventTime = bookingInfo.eventTime;
                            toEditBooking.venue = bookingInfo.venue;
                            toEditBooking.eventSetTime = bookingInfo.eventSetTime;
                            toEditBooking.eventMealTime = bookingInfo.eventMealTime;
                            toEditBooking.dateUpdated = DateTime.Now;
                            toEditBooking.bookingNote = bookingInfo.bookingNote;
                            toEditBooking.progressOne = bookingInfo.progressOne;
                            toEditBooking.progressTwo = bookingInfo.progressTwo;
                            toEditBooking.progressThree = bookingInfo.progressThree;
                            toEditBooking.paxCount = bookingInfo.paxCount;
                            toEditBooking.addAdult = bookingInfo.addAdult;
                            toEditBooking.addKid = bookingInfo.addKid;

                            db.SaveChanges();

                            var toEditClient = db.clients_tbl
                                .Where(x => x.clientID == toEditBooking.clientID)
                                .FirstOrDefault();

                            if (toEditClient != null)
                            {
                                toEditClient.eventName = clientInfo.eventName;
                                toEditClient.cFName = clientInfo.cFName;
                                toEditClient.cLName = clientInfo.cLName;
                                toEditClient.cEmail = clientInfo.cEmail;
                                toEditClient.cContact = clientInfo.cContact;
                                toEditClient.cCeleb1FName = clientInfo.cCeleb1FName;
                                toEditClient.cCeleb1LName = clientInfo.cCeleb1LName;
                                toEditClient.cCeleb2FName = clientInfo.cCeleb2FName;
                                toEditClient.cCeleb2LName = clientInfo.cCeleb2LName;
                                toEditClient.dateUpdated = DateTime.Now;

                                db.SaveChanges();

                                var toEditPayment = db.payments_tbl
                                    .Where(x => x.bookingID == editBookingID)
                                    .FirstOrDefault();

                                if(toEditPayment != null)
                                {
                                    toEditPayment.amountDue = paymentInfo.amountDue;
                                    toEditPayment.dueDate = bookingInfo.bookingDate;
                                    toEditPayment.dateUpdated = DateTime.Now;

                                    db.SaveChanges();

                                    return Json(new { success = true, message = "Booking Updated Successfully!" }, JsonRequestBehavior.AllowGet);
                                }
                                else
                                {
                                    return Json(new { success = false, message = "Payment not found!" }, JsonRequestBehavior.AllowGet);
                                }
                            }
                            else
                            {
                                return Json(new { success = false, message = "Client not found!" }, JsonRequestBehavior.AllowGet);
                            }
                        }
                        else
                        {
                            return Json(new { success = false, message = "Booking not found!" }, JsonRequestBehavior.AllowGet);
                        }
                    }
                }
                else
                {
                    return Json(new { success = false, message = "Mode is not registered!" }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
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
                    existingBooking.paxCount = bookingInfo.paxCount;
                    existingBooking.addAdult = bookingInfo.addAdult;
                    existingBooking.addKid = bookingInfo.addKid;
                    existingBooking.dateUpdated = DateTime.Now;

                    UpdatePrimaryBookingPayment(db, existingBooking.bookingID, paymentInfo, bookingInfo.bookingDate);
                    db.SaveChanges();
                    transaction.Commit();

                    return Json(new { success = true, message = "Booking updated successfully!" });
                }
            }
            catch (Exception ex)
            {
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

                    var receipts = db.bookingreceipts_tbl.Where(r => r.bookingID == bookingID).ToList();
                    foreach (var receipt in receipts)
                    {
                        db.bookingreceipts_tbl.Remove(receipt);
                    }

                    var clientID = existingBooking.clientID;
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
                            return Json(new { success = false, message = "No Package Found!" }, JsonRequestBehavior.AllowGet);
                        }
                    }
                    else
                    {
                        return Json(new { success = false, message = "No Package Found!" }, JsonRequestBehavior.AllowGet);
                    }
                }         
            }
            catch (Exception ex)
            {
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
                }
                return Json(new { success = true });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        public JsonResult GetLogs()
        {
            using (var db = new IsabellaCateringContext())
            {
                var data = (from log in db.activitylogs_tbl
                            join user in db.users_tbl on log.userID equals user.userID
                            select new
                            {
                                logID = log.logID,
                                action = log.processDesc + ": " + log.activityDesc,
                                dateUpdated = log.dateCreated,
                                userName = user.firstName + " " + user.lastName
                            }).ToList();
                return Json(data, JsonRequestBehavior.AllowGet);
            }
        }


    }
}
