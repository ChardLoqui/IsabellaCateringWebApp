using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblSeatingTypesMap : EntityTypeConfiguration<tblSeatingTypesModel>
    {
        public tblSeatingTypesMap()
        {
            HasKey(i => i.seatingTypID);
            ToTable("seatingtypes_tbl");
        }
    }
}