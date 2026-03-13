using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblPaymentsMap : EntityTypeConfiguration<tblPaymentsModel>
    {
        public tblPaymentsMap()
        {
            HasKey(i => i.paymentID);
            ToTable("payments_tbl");
        }
    }
}