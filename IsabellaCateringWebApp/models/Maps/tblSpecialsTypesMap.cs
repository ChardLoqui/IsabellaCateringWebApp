using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblSpecialsTypesMap : EntityTypeConfiguration<tblSpecialsTypesModel>
    {
        public tblSpecialsTypesMap()
        {
            HasKey(i => i.specialsTypID);
            ToTable("specialstypes_tbl");
        }
    }
}