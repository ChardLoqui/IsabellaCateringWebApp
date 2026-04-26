using System;

namespace IsabellaCateringWebApp.Models.Models
{
    public class tblBookingAdditionalsModel
    {
        public int bookingAdditionalID { get; set; }
        public int bookingID { get; set; }
        public string description { get; set; }
        public decimal amount { get; set; }
        public DateTime dateCreated { get; set; }
        public DateTime dateUpdated { get; set; }
    }
}
