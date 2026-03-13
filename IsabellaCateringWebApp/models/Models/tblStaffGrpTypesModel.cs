using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Models
{
    public class tblStaffGrpTypesModel
    {
        public int staffGrpTypID { get; set; }
        public int staffGrpTyp1 { get; set; }
        public int? staffGrpTyp2 { get; set; }
        public int? staffGrpTyp3 { get; set; }
        public DateTime dateCreated { get; set; }
        public DateTime dateUpdated { get; set; }
    }
}