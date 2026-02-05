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