using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Models
{
    public class tblPricePaxsModel
    {
        public int pricePaxID { get; set; }
        public string pax1Desc { get; set; }
        public double? pricePax1 { get; set; }

        public string pax2Desc { get; set; }
        public double? pricePax2 { get; set; }

        public string pax3Desc { get; set; }
        public double? pricePax3 { get; set; }

        public string paxAdDesc { get; set; }
        public double? pricePaxAd { get; set; }

        public string paxKdDesc { get; set; }
        public double? pricePaxKd { get; set; }

        public DateTime dateCreated { get; set; }
        public DateTime dateUpdated { get; set; }
    }
}