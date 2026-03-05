using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblMainCourseTypesMap : EntityTypeConfiguration<tblMainCourseTypesModel>
    {
        public tblMainCourseTypesMap()
        {
            HasKey(i => i.mainCourseTypID);
            ToTable("maincoursetypes_tbl");
        }
    }
}