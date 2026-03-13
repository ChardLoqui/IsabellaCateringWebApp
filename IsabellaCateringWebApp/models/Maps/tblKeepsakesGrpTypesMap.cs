using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblKeepsakesGrpTypesMap : EntityTypeConfiguration<tblKeepsakesGrpTypesModel>
    {
        public tblKeepsakesGrpTypesMap()
        {
            HasKey(i => i.keepsakesGrpTypID);
            ToTable("keepsakesgrptypes_tbl");
        }
    }
}