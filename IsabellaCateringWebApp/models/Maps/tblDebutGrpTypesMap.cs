using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblDebutGrpTypesMap : EntityTypeConfiguration<tblDebutGrpTypesModel>
    {
        public tblDebutGrpTypesMap()
        {
            HasKey(i => i.debutGrpTypID);
            ToTable("debutgrptypes_tbl");
        }
    }
}