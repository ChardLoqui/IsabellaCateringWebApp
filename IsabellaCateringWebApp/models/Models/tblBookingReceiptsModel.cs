using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Models
{
    public class tblBookingReceiptsModel
    {
        public int receiptID { get; set; }
        public int bookingID { get; set; }
        public string receiptNum { get; set; }
        public DateTime dateCreated { get; set; }
        public DateTime dateUpdated { get; set; }

    }
}