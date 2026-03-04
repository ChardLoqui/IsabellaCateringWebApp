using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Models
{
    public class tblPaymentRemindersModel
    {
        public int reminderID { get; set; }
        public int bookingID { get; set; }
        public int paymentID { get; set; }
        public int sentBy { get; set; }
        public string sentAt { get; set; }
        public string note { get; set; }
        public DateTime dateCreated { get; set; }
        public DateTime dateUpdated { get; set; }
    }
}