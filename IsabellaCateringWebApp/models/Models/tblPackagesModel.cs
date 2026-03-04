using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Models
{
    public class tblPackagesModel
    {
        public int packageID { get; set; }
        public int packageTypID { get; set; }
        public int eventID { get; set; }
        public int pricePaxID { get; set; }
        public int? mainCourseTypID { get; set; }
        public int? sidesGrpTypID { get; set; }
        public int? centerPieceTypID { get; set; }
        public int? seatingTypID { get; set; }
        public int? specialsGrpTypID { get; set; }
        public int? staffGrpTypID { get; set; }
        public int? backdropTypID { get; set; }
        public int? entranceTypID { get; set; }
        public int? couchTypID { get; set; }
        public int? equipGrpTypID { get; set; }
        public int? entertainmentGrpTypID { get; set; }
        public int? photoGrpTypID { get; set; }
        public int? keepsakesGrptypID { get; set; }
        public int? debutGrpTypID { get; set; }
        public string incStaples { get; set; }
        public string incStyling { get; set; }
        public string incTableSet { get; set; }
        public string incDnrWare { get; set; }
        public DateTime dateCreated { get; set; }
        public DateTime dateUpdated { get; set; }
    }
}