using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblBookingRequestsMap : EntityTypeConfiguration<tblBookingRequestsModel>
    {
        public tblBookingRequestsMap()
        {
            HasKey(i => i.bookingRequestID);
            ToTable("bookingrequests_tbl");
        }
    }
}