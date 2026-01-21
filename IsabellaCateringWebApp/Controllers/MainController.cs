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
    }
}