using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblKeepsakesTypesMap : EntityTypeConfiguration<tblKeepsakesTypesModel>
    {
        public tblKeepsakesTypesMap()
        {
            HasKey(i => i.keepsakesTypID);
            ToTable("keepsakestypes_tbl");
        }
    }
}