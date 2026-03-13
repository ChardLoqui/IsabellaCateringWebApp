using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblPhotoTypesMap : EntityTypeConfiguration<tblPhotoTypesModel>
    {
        public tblPhotoTypesMap()
        {
            HasKey(i => i.photoTypID);
            ToTable("phototypes_tbl");
        }
    }
}