using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Models
{
    public class tblPaymentsModel
    {
        public int paymentID { get; set; }
        public float amountDue { get; set; }
        public float amountPaid { get; set; }
        public string paymentType { get; set; }
        public string paymentStatus { get; set; }
        public DateTime dueDate { get; set; }
        public DateTime dateCreated { get; set; }
        public DateTime dateUpdated { get; set; }
    }
}