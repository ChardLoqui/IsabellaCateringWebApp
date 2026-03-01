using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Models
{
    public class tblBookingModel
    {
        public int bookingID { get; set; }
        public int createdBy { get; set; }
        public int clientID { get; set; }
        public int packageID { get; set; }

        public string dsgnTheme { get; set; }
        public string dsgnMotif { get; set; }
        public string prepVenue { get; set; }

        public DateTime? bookingDate { get; set; }

        public DateTime? ceremTime { get; set; }
        public DateTime? eventTime { get; set; }
        public string venue { get; set; }

        public DateTime? eventSetTime { get; set; }
        public DateTime? eventMealTime { get; set; }

        public DateTime? dateCreated { get; set; }
        public DateTime? dateUpdated { get; set; }

        public int progressOne { get; set; }
        public int progressTwo { get; set; }
        public int progressThree { get; set; }
    }
}
