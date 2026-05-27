using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Models
{
    public class tblPaymentsModel
    {
        public int paymentID { get; set; }
        public int bookingID { get; set; }
        public double amountDue { get; set; }
        public double amount { get; set; }
        public double remainingBalance {  get; set; }
        public int transactionNum { get; set; }
        public string paymentType { get; set; }
        public string paymentStatus { get; set; }
        public DateTime? dueDate { get; set; }
        public DateTime dateCreated { get; set; }
        public DateTime dateUpdated { get; set; }
    }
}