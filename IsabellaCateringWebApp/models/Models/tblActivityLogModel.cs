using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Models
{
    public class tblActivityLogModel
    {
        public int logID { get; set; }
        public int userID { get; set; }
        public string processDesc { get; set; }
        public string activityDesc { get; set; }
        public DateTime dateCreated { get; set; } 
    }
}