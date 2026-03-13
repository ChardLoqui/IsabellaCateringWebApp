using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Models
{
    public class tblMainCourseTypesModel
    {
        public int mainCourseTypID { get; set; }
        public int packageCategoryID { get; set; }
        public string mainCourseTypDesc { get; set; }
        public DateTime dateCreated { get; set; }
        public DateTime dateUpdated { get; set; }
    }
}