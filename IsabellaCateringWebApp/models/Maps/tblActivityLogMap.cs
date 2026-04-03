using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblActivityLogMap : EntityTypeConfiguration<tblActivityLogModel>
    {
        public tblActivityLogMap()
        {
            HasKey(i => i.logID);
            ToTable("activitylog_tbl");
        }
    }
}