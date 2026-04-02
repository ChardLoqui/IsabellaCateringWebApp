using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Models
{
    public class tblSidesGrpTypesModel
    {
        public int sidesGrpTypID { get; set; }
        public int sidesGrpTyp1 { get; set; }
        public int? sidesGrpTyp2 { get; set; }
        public int? sidesGrpTyp3 { get; set; }
        public int? sidesGrpTyp4 { get; set; }
        public DateTime dateCreated { get; set; }
        public DateTime dateUpdated { get; set; }
    }
}