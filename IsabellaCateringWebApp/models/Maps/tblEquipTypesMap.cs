using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblEquipTypesMap : EntityTypeConfiguration<tblEquipTypesModel>
    {
        public tblEquipTypesMap()
        {
            HasKey(i => i.equipTypID);
            ToTable("equiptypes_tbl");
        }
    }
}