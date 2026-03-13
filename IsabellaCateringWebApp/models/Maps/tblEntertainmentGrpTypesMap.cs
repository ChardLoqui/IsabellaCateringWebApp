using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblEntertainmentGrpTypesMap : EntityTypeConfiguration<tblEntertainmentGrpTypesModel>
    {
        public tblEntertainmentGrpTypesMap()
        {
            HasKey(i => i.entertainmentGrpTypID);
            ToTable("entertainmentgrptypes_tbl");
        }
    }
}