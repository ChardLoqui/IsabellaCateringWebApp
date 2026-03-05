using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblDebutTypesMap : EntityTypeConfiguration<tblDebutTypesModel>
    {
        public tblDebutTypesMap()
        {
            HasKey(i => i.debutTypID);
            ToTable("debuttypes_tbl");
        }
    }
}