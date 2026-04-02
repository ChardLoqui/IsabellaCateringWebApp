using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblCouchTypesMap : EntityTypeConfiguration<tblCouchTypesModel>
    {
        public tblCouchTypesMap()
        {
            HasKey(i => i.couchTypID);
            ToTable("couchtypes_tbl");
        }
    }
}