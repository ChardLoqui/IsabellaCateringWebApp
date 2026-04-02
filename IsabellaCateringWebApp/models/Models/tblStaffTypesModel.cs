using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Models
{
    public class tblStaffTypesModel
    {
        public int staffTypID { get; set; }
        public int packageCategoryID { get; set; }
        public string staffTypDesc { get; set; }
        public DateTime dateCreated { get; set; }
        public DateTime dateUpdated { get; set; }
    }
}