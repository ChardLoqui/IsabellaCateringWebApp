using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Models
{
    public class tblTasksModel
    {
        public int taskID { get; set; }
        public int bookingID { get; set; }
        public string task { get; set; }
        public string taskDesc { get; set; }
        public DateTime dueDate { get; set; }
        public string status { get; set; }
        public DateTime dateCreated { get; set; }
        public DateTime dateUpdated { get; set; }
    }
}