using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblTasksMap : EntityTypeConfiguration<tblTasksModel>
    {
        public tblTasksMap()
        {
            HasKey(i => i.taskID);
            ToTable("tasks_tbl");
        }
    }
}