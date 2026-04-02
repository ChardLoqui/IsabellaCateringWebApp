using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblCenterPieceTypesMap : EntityTypeConfiguration<tblCenterPieceTypesModel>
    {
        public tblCenterPieceTypesMap()
        {
            HasKey(i => i.centerPieceTypID);
            ToTable("centerpiecetypes_tbl");
        }
    }
}