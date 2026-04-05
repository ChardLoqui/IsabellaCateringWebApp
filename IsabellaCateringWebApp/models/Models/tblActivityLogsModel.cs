using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Models
{
    public class tblActivityLogsModel
    {
        public int logID { get; set; }
        public int userID { get; set; }
        public string userEmail { get; set; }
        public string level { get; set; }
        public string processService { get; set; }
        public string processDesc { get; set; }
        public string traceID { get; set; }
        public DateTime dateCreated { get; set; }
    }
}