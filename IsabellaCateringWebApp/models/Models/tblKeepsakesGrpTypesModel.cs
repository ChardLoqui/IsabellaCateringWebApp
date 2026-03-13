using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Models
{
    public class tblKeepsakesGrpTypesModel
    {
        public int keepsakesGrpTypID { get; set; }
        public int keepsakesGrpType1 { get; set; }
        public int? keepsakesGrpType2 { get; set; }
        public int? keepsakesGrpType3 { get; set; }
        public int? keepsakesGrpType4 { get; set; }
        public int? keepsakesGrpType5 { get; set; }
        public DateTime dateCreated { get; set; }
        public DateTime dateUpdated { get; set; }
    }
}