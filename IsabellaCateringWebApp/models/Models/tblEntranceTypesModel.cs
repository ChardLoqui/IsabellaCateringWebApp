using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Models
{
    public class tblEntranceTypesModel
    {
        public int entranceTypID { get; set; }
        public int packageCategoryID { get; set; }
        public string entranceTypDesc { get; set; }
        public DateTime dateCreated { get; set; }
        public DateTime dateUpdated { get; set; }
    }
}