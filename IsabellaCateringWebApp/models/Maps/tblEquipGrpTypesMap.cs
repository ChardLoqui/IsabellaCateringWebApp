using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblEquipGrpTypesMap : EntityTypeConfiguration<tblEquipGrpTypesModel>
    {
        public tblEquipGrpTypesMap()
        {
            HasKey(i => i.equipGrpTypID);
            ToTable("equipgrptypes_tbl");
        }
    }
}