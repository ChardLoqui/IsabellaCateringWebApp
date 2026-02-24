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

        // get creds for login
        public JsonResult JsonLogGetCreds(tblUsersModel userInfo)
        {
            try
            {
                using (var db = new IsabellaCateringContext())
                {

                    var verify = db.users_tbl.Where(x => x.email.Equals(userInfo.email)).FirstOrDefault();
                    if (verify.password == userInfo.password)
                    {
                        var creds = new tblUsersModel()
                        {
                            userID = verify.userID,
                            permissionID = verify.permissionID
                        };
                        Session["currentLog"] = creds.userID.ToString();
                        Session["currentPerm"] = creds.permissionID.ToString();
                        return Json(creds, JsonRequestBehavior.AllowGet);
                    }
                    else
                    {
                        return null;
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
                    string token = GenerateToken();
                    string tokenHash = HashToken(token);
                    var verify = db.users_tbl.Where(x => x.email.Equals(userEmail)).FirstOrDefault();
                    if (verify != null)
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
                        return verify.userID;
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


    }
}