using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Models
{
    public class tblSeatingTypesModel
    {
        public int seatingtypID { get; set; }
        public int packageCategoryID { get; set; }
        public string seatingTypDesc { get; set; }
        public DateTime dateCreated { get; set; }
        public DateTime dateUpdated { get; set; }
    }
}