using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblEventsMap : EntityTypeConfiguration<tblEventsModel>
    {
        public tblEventsMap()
        {
            HasKey(i => i.eventID);
            ToTable("events_tbl");
        }
    }
}