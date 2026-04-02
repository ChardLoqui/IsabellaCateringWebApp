using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Models
{
    public class tblTaskHistoryModel
    {
        public int historyID { get; set; }
        public int taskID { get; set; }
        public int updatedBy { get; set; }
        public string oldStatus { get; set; }
        public string newStatus { get; set; }
        public DateTime timeStamp { get; set; }
        public DateTime dateCreated { get; set; }
        public DateTime dateUpdated { get; set; }
    }
}