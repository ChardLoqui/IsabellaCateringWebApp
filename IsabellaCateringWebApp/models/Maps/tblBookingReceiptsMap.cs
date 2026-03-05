using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblBookingReceiptsMap : EntityTypeConfiguration<tblBookingReceiptsModel>
    {
        public tblBookingReceiptsMap()
        {
            HasKey(i => i.receiptID);
            ToTable("bookingreceipts_tbl");
        }
    }
}