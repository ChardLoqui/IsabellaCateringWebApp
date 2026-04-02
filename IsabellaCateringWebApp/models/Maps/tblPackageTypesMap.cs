using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblPackageTypesMap : EntityTypeConfiguration<tblPackageTypesModel>
    {
        public tblPackageTypesMap()
        {
            HasKey(i => i.packageTypID);
            ToTable("packagetypes_tbl");
        }
    }
}