using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblEntranceTypesMap : EntityTypeConfiguration<tblEntranceTypesModel>
    {
        public tblEntranceTypesMap()
        {
            HasKey(i => i.entranceTypID);
            ToTable("entrancetypes_tbl");
        }
    }
}