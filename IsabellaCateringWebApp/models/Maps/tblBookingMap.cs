using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblBookingMap : EntityTypeConfiguration<tblBookingModel>
    {
        public tblBookingMap()
        {
            HasKey(i => i.bookingID);
            ToTable("booking_tbl");
        }
    }
}