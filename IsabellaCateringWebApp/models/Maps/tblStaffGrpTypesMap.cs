using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblStaffGrpTypesMap : EntityTypeConfiguration<tblStaffGrpTypesModel>
    {
        public tblStaffGrpTypesMap()
        {
            HasKey(i => i.staffGrpTypID);
            ToTable("staffgrptypes_tbl");
        }
    }
}