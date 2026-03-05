using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblSidesTypesMap : EntityTypeConfiguration<tblSidesTypesModel>
    {
        public tblSidesTypesMap()
        {
            HasKey(i => i.sidesTypID);
            ToTable("sidestypes_tbl");
        }
    }
}