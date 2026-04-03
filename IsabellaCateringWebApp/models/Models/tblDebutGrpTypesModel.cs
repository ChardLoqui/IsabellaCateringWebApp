using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Models
{
    public class tblDebutGrpTypesModel
    {
        public int debutGrpTypID { get; set; }
        public int debutGrpTyp1 { get; set; }
        public int? debutGrpTyp2 { get; set; }
        public int? debutGrpTyp3 { get; set; }
        public DateTime dateCreated { get; set; }
        public DateTime dateUpdated { get; set; }
    }
}