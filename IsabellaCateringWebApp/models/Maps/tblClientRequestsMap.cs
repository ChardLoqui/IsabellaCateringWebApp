using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblClientRequestsMap : EntityTypeConfiguration<tblClientRequestsModel>
    {
        public tblClientRequestsMap()
        {
            HasKey(i => i.clientRequestID);
            ToTable("clientrequests_tbl");
        }
    }
}