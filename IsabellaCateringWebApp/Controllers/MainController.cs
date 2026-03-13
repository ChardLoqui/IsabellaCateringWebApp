using IsabellaCateringWebApp.Models.Context;
using IsabellaCateringWebApp.Models.Models;
using Org.BouncyCastle.Bcpg;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using System.Web.Mvc;
using System.Web.Services.Description;

namespace IsabellaCateringWebApp.Controllers
{
    public class MainController : Controller
    {
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

        // get creds for login
        public JsonResult JsonLogGetCreds(tblUsersModel userInfo)
        {
            try
            {
                using (var db = new IsabellaCateringContext())
                {

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
                        verify.lockoutEnd= null;
                        db.SaveChanges();

                        var creds = new tblUsersModel()
                        {
                            userID = verify.userID,
                            permissionID = verify.permissionID
                        };
                        Session["currentLog"] = creds.userID.ToString();
                        Session["currentPerm"] = creds.permissionID.ToString();
                        return Json(new { success = true, data = creds }, JsonRequestBehavior.AllowGet);
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
                ;
            }
            catch (Exception ex)
            {
                throw new ArgumentException($"There is an ERROR while upserting in database +++{ex.Message}+++ : +++{ex.StackTrace}+++ : +++{ex.InnerException}+++");
            }
        }
        //get current session
        public JsonResult getCurrentSession()
        {
            try
            {
                var creds = new
                {
                    userID = Session["currentLog"]?.ToString() ?? string.Empty,
                    permID = Session["currentPerm"]?.ToString() ?? string.Empty
                };
                return Json(creds, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                throw new ArgumentException($"There is an ERROR while upserting in database {ex.Message}:{ex.StackTrace}:{ex.InnerException}");
            }
        }

        //for navbar (test)
        public JsonResult getCurrentSessionNav()
        {
            var uID = Session["currentLog"]?.ToString();
            var pID = Session["currentPerm"]?.ToString() ?? "";
            string uName = "Loading..";

            if (!string.IsNullOrEmpty(uID))
            {
                int id = int.Parse(uID);
                using (var db = new IsabellaCateringContext())
                {
                    var user = db.users_tbl.FirstOrDefault(x => x.userID == id);
                    if (user != null) uName = $"{user.firstName} {user.lastName}";
                }
            }

            return Json(new { userName = uName, permID = pID }, JsonRequestBehavior.AllowGet);
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

                return Json(new { success = true, message = "Saved successfully!" });
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

                return Json(new { success = false, message = realError });
            }
        }
        //fetch data (users)
        public JsonResult GetUsers()
        {
            using (var db = new IsabellaCateringContext())
            {
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
                }).ToList();

                return Json(data, JsonRequestBehavior.AllowGet);
            }
        }


        // for update
        [HttpPost]
        public JsonResult UpdateUser(tblUsersModel userInfo)
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

        public int? ForgetVerifyEmail(string userEmail)
        {
            try
            {
                using (var db = new IsabellaCateringContext())
                {
                    var now = DateTime.UtcNow;
                    string token = GenerateToken();
                    string tokenHash = HashToken(token);
                    var verify = db.users_tbl.Where(x => x.email.Equals(userEmail)).FirstOrDefault();
                    if (verify != null)
                    {
                        var expiredTokens = db.passwordtokens_tbl
                            .Where(x => x.dateExpiry < now)
                            .ToList();
                        db.passwordtokens_tbl.RemoveRange(expiredTokens);
                        db.SaveChanges();

                        var existingToken = db.passwordtokens_tbl
                            .FirstOrDefault(x => x.userID == verify.userID
                            && x.dateExpiry > now);

                        if (existingToken == null)
                        {
                            db.passwordtokens_tbl.Add(new tblPasswordTokensModel
                            {
                                userID = verify.userID,
                                hashedToken = tokenHash,
                                dateCreated = DateTime.UtcNow,
                                dateExpiry = DateTime.UtcNow.AddMinutes(10)
                            });
                            db.SaveChanges();

                            string link = "https://localhost:44323/Main/chgPassPage?token=" + token;

                            var smtp = new SmtpClient();
                            smtp.DeliveryMethod = SmtpDeliveryMethod.SpecifiedPickupDirectory;
                            smtp.PickupDirectoryLocation = @"C:\Emails";

                            var mail = new MailMessage();
                            mail.From = new MailAddress("no-reply@localhost");
                            mail.To.Add(userEmail);
                            mail.Subject = "Reset Password";
                            mail.Body = "Your Password Reset Link " + link;

                            smtp.Send(mail);
                            return verify.userID;
                        }
                        else
                        {
                            return null;
                        } 
                    }
                    else
                        return null;
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        // for delete
        [HttpPost]
        public JsonResult DeleteUser(int id)
                throw new ArgumentException($"There is an ERROR while upserting in database {ex.Message}:{ex.StackTrace}:{ex.InnerException}");
            }
        }

        public Boolean VerifyForgetToken(string token)
        {
            try
            {
                using (var db = new IsabellaCateringContext())
                {
                    string hash = HashToken(token);

                    var verify = db.passwordtokens_tbl.Where(x => x.hashedToken.Equals(hash)).FirstOrDefault();
                    if (verify == null || verify.dateExpiry < DateTime.UtcNow)
                        return false;
                    else
                        return true;
                }
            }
            catch (Exception ex)
            {
                throw new ArgumentException($"There is an ERROR while upserting in database {ex.Message}:{ex.StackTrace}:{ex.InnerException}");
            }
        }

        public Boolean changeForgotPassword(string unhashedToken, string newPassword)
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

                    string correctedToken = unhashedToken.Replace(" ", "+");
                    string hash = HashToken(correctedToken);

                    var verify = db.passwordtokens_tbl.Where(x => x.hashedToken.Equals(hash)).FirstOrDefault();
                    if (verify == null || verify.dateExpiry < DateTime.UtcNow)
                    {
                        return false;
                    }
                    else
                    {   
                        var userData = db.users_tbl.Where(x => x.userID.Equals(verify.userID)).FirstOrDefault();
                        userData.password = newPassword;
                        db.passwordtokens_tbl.Remove(verify);
                        db.SaveChanges();
                        return true;
                    }
                        
                }
            }
            catch (Exception ex)
            {
                throw new ArgumentException($"There is an ERROR while upserting in database {ex.Message}:{ex.StackTrace}:{ex.InnerException}");
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
                DateTime csharpDate = DateTime.Parse(formattedDate, null, System.Globalization.DateTimeStyles.RoundtripKind);
                using (var db = new IsabellaCateringContext())
                {
                    var bookings = db.bookings_tbl
                                        .Where(b => b.bookingDate == csharpDate)
                                        .ToList();
                    if (bookings.Count < 5)
                    {
                        Session["bookingSelectedDate"] = formattedDate;
                        return Json(new { success = true, message = "Create Request Granted!" }, JsonRequestBehavior.AllowGet);
                    }
                    else
                        return Json(new { success = false, message = "The Number of bookings for this day has reached it's limits!" }, JsonRequestBehavior.AllowGet);
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
                        return Json(new {bookingData = bookings, success = true, message = "No Bookings Found!" }, JsonRequestBehavior.AllowGet);
                    }
                }
            }
            catch (Exception ex)
            {
                return Json(new { message = "Error connecting to DB: " + ex.Message }, JsonRequestBehavior.AllowGet);
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
                        var bookingPackage = db.packages_tbl
                                    .Where(p => p.packageID == bookings.packageID)
                                    .FirstOrDefault();
                        if (bookingPackage != null)
                        {
                            var bookingClient = db.clients_tbl
                                    .Where(c => c.clientID == bookings.clientID)
                                    .FirstOrDefault();

                            if (bookingClient != null)
                            {
                                var bookingEvent = db.events_tbl
                                        .Where(e => e.eventID == bookingClient.clientID)
                                        .FirstOrDefault();

                                return Json(new { packages = bookingPackage, clients = bookingClient, events = bookingEvent, success = true, message = "Details Found!" }, JsonRequestBehavior.AllowGet);
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


        public JsonResult GetPayments()
        {
            using (var db = new IsabellaCateringContext())
            {
                var data = db.payments_tbl.Select(p => new
                {
                    paymentID = p.paymentID,
                    amountDue = p.amountDue,
                    amountPaid = p.amountPaid,
                    paymentType = p.paymentType,
                    paymentStatus = p.paymentStatus,
                    dueDate = p.dueDate,
                    dateCreated = p.dateCreated,
                    dateUpdated = p.dateUpdated
                }).ToList();

                // Use a larger MaxJsonLength to prevent silent truncation
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
                    var paymentInfo = new tblPaymentsModel()
                    {
                        paymentID = paymentData.paymentID,
                        amountDue = paymentData.amountDue,
                        amountPaid = paymentData.amountPaid,
                        paymentType = paymentData.paymentType,
                        paymentStatus = paymentData.paymentStatus,
                        dueDate = paymentData.dueDate,
                        dateCreated = DateTime.Now,
                        dateUpdated = DateTime.Now
                    };

                    db.payments_tbl.Add(paymentInfo);
                    db.SaveChanges();

                }

                return Json(new { success = true, message = "Saved successfully!" });
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

                return Json(new { success = false, message = realError });
            }
        }



    }
}