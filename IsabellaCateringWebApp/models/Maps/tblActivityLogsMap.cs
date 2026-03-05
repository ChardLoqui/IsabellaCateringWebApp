using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblActivityLogsMap : EntityTypeConfiguration<tblActivityLogsModel>
    {
        public tblActivityLogsMap()
        {
            HasKey(i => i.logID);
            ToTable("activitylogs_tbl");
        }
    }
}