using IsabellaCateringWebApp.Models.Context;
using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Linq;
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

        public ActionResult addBooking()
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

        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
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
        public JsonResult JsonLogGetCreds(tblUsersModel userInfo)
        {
            try
            {
                if (userInfo == null || string.IsNullOrEmpty(userInfo.email))
                {
                    return Json(new { success = false, message = "Invalid request" },
                                JsonRequestBehavior.AllowGet);
                }

                using (var db = new IsabellaCateringContext())
                {
                    var verify = db.users_tbl
                                   .FirstOrDefault(x => x.email == userInfo.email);

                    if (verify == null)
                    {
                        return Json(new { success = false, message = "User not found" },
                                    JsonRequestBehavior.AllowGet);
                    }

                    if (verify.password != userInfo.password)
                    {
                        return Json(new { success = false, message = "Wrong password" },
                                    JsonRequestBehavior.AllowGet);
                    }

                    var creds = new tblUsersModel
                    {
                        userID = verify.userID,
                        permissionID = verify.permissionID
                    };

                    Session["currentLog"] = verify.userID.ToString();
                    Session["currentPerm"] = verify.permissionID.ToString();

                    return Json(new { success = true, data = creds },
                                JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                throw;
            }
        }



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

    }
}