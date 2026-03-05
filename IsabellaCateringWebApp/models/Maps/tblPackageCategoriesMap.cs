using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblPackageCategoriesMap : EntityTypeConfiguration<tblPackageCategoriesModel>
    {
        public tblPackageCategoriesMap()
        {
            HasKey(i => i.packageCategoryID);
            ToTable("packagecategories_tbl");
        }
    }
}