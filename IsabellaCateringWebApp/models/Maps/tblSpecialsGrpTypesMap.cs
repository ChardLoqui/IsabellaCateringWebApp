using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblSpecialsGrpTypesMap : EntityTypeConfiguration<tblSpecialsGrpTypesModel>
    {
        public tblSpecialsGrpTypesMap()
        {
            HasKey(i => i.specialsGrpTypID);
            ToTable("specialsgrptypes_tbl");
        }
    }
}