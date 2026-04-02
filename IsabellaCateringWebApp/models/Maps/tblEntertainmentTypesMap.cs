using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblEntertainmentTypesMap : EntityTypeConfiguration<tblEntertainmentTypesModel>
    {
        public tblEntertainmentTypesMap()
        {
            HasKey(i => i.entertainmentTypID);
            ToTable("entertainmenttypes_tbl");
        }
    }
}