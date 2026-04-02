using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Models
{
    public class tblKeepsakesGrpTypesModel
    {
        public int keepsakesGrpTypID { get; set; }
        public int keepsakesGrpTyp1 { get; set; }
        public int? keepsakesGrpTyp2 { get; set; }
        public int? keepsakesGrpTyp3 { get; set; }
        public int? keepsakesGrpTyp4 { get; set; }
        public int? keepsakesGrpTyp5 { get; set; }
        public DateTime dateCreated { get; set; }
        public DateTime dateUpdated { get; set; }
    }
}