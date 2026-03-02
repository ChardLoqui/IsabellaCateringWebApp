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

        public ActionResult chgPassPage()
        {
            return View();
        }

        public ActionResult ForgetPassPage()
        {
            return View();
        }
        
        public ActionResult customerView()
        {
            return View();
        }

        public ActionResult addBooking()
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


        public JsonResult addBooking(tblBookingModel bookingData)
        {
            try
            {
                using (var db = new IsabellaCateringContext())
                {
                    var newBooking = new tblBookingModel()
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
                    db.booking_tbl.Add(newBooking);
                    db.SaveChanges();
                }

                return Json(new { success = true, message = "Booking Successfully Added" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        public JsonResult getBooking(int bookingID)
        {
            try
            {
                using (var db = new IsabellaCateringContext())
                {
                    var booking = db.booking_tbl
                                    .Where(b => b.bookingID == bookingID)
                                    .Select(b => new
                                    {
                                        b.bookingID,
                                        b.clientID,
                                        b.packageID,
                                        b.dsgnTheme,
                                        b.dsgnMotif,
                                        b.venue,
                                        b.bookingDate,
                                        b.eventSetTime,
                                        b.eventTime,
                                        b.ceremTime,
                                        b.eventMealTime,
                                        b.dateCreated,
                                        b.dateUpdated,
                                        b.progressOne,
                                        b.progressTwo,
                                        b.progressThree
                                    })
                                    .FirstOrDefault();

                    if (booking == null)
                        return Json(new { message = "Booking not found", bookingID }, JsonRequestBehavior.AllowGet);

                    return Json(booking, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { message = "Error connecting to DB: " + ex.Message, bookingID }, JsonRequestBehavior.AllowGet);
            }
        }


    }
}