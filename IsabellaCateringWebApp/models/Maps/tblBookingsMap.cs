using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblBookingsMap : EntityTypeConfiguration<tblBookingsModel>
    {
        public tblBookingsMap()
        {
            HasKey(i => i.bookingID);
            ToTable("booking_tbl");
        }
    }
}