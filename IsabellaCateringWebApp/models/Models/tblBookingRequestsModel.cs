using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Models
{
    public class tblBookingRequestsModel
    {
        public int bookingRequestID { get; set; }
        public int clientRequestID { get; set; }
        public int packageID { get; set; }
        public int eventID { get; set; }
        public string dsgnTheme { get; set; }
        public string dsgnMotif { get; set; }
        public string prepVenue { get; set; }
        public string churchVenue { get; set; }

        public DateTime bookingDate { get; set; }

        public TimeSpan ceremTime { get; set; }
        public TimeSpan eventTime { get; set; }
        public string venue { get; set; }

        public TimeSpan eventSetTime { get; set; }
        public TimeSpan eventMealTime { get; set; }

        public DateTime dateCreated { get; set; }
        public DateTime dateUpdated { get; set; }

        public string customerNote { get; set; }
        public int paxCount { get; set; }
        public int addAdult { get; set; }
        public int addKid { get; set; }        
    }
}