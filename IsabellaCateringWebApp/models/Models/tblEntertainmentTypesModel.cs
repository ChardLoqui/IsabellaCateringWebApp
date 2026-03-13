using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Models
{
    public class tblEntertainmentTypesModel
    {
        public int entertainmentTypID { get; set; }
        public int packageCategoryID { get; set; }
        public string entertainmentTypDesc { get; set; }
        public DateTime dateCreated { get; set; }
        public DateTime dateUpdated { get; set; }
    }
}