using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblPermissionsMap : EntityTypeConfiguration<tblPermissionsModel>
    {
        public tblPermissionsMap()
        {
            HasKey(i => i.permissionID);
            ToTable("permissions_tbl");
        }
    }
}