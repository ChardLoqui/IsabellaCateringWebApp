using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblClientsMap : EntityTypeConfiguration<tblClientsModel>
    {
        public tblClientsMap()
        {
            HasKey(i => i.clientID);
            ToTable("clients_tbl");
        }
    }
}