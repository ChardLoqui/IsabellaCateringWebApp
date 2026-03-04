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
        public float pricePax1 { get; set; }
        public string pax2Desc { get; set; }
        public float pricePax2 { get; set; }
        public string pax3Desc { get; set; }
        public float pricePax3 { get; set; }
        public string paxAdDesc { get; set; }
        public float pricePaxAd { get; set; }
        public string paxKdDesc { get; set; }
        public float pricePaxKd { get; set; }
        public DateTime dateCreated { get; set; }
        public DateTime dateUpdated { get; set; }
    }
}