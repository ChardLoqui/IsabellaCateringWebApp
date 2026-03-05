using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblBackdropTypesMap : EntityTypeConfiguration<tblBackdropTypesModel>
    {
        public tblBackdropTypesMap()
        {
            HasKey(i => i.backdropTypID);
            ToTable("backdroptypes_tbl");
        }
    }
}