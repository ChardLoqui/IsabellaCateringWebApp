using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Models
{
    public class tblSpecialsTypesModel
    {
        public int specialsTypID { get; set; }
        public int packageCategoryID { get; set; }
        public string specialsTypDesc { get; set; }
        public DateTime dateCreated { get; set; }
        public DateTime dateUpdated { get; set; }
    }
}