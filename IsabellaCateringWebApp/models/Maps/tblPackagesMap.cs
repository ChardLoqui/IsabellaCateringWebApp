using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblPackagesMap : EntityTypeConfiguration<tblPackagesModel>
    {
        public tblPackagesMap()
        {
            HasKey(i => i.packageID);
            ToTable("packages_tbl");
        }
    }
}