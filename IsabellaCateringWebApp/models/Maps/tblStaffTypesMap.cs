using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblStaffTypesMap : EntityTypeConfiguration<tblStaffTypesModel>
    {
        public tblStaffTypesMap()
        {
            HasKey(i => i.staffTypID);
            ToTable("stafftypes_tbl");
        }
    }
}