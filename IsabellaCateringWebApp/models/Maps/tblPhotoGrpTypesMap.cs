using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblPhotoGrpTypesMap : EntityTypeConfiguration<tblPhotoGrpTypesModel>
    {
        public tblPhotoGrpTypesMap()
        {
            HasKey(i => i.photoGrpTypID);
            ToTable("photogrptypes_tbl");
        }
    }
}