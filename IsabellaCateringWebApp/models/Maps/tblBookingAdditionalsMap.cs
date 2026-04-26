using IsabellaCateringWebApp.Models.Models;
using System.Data.Entity.ModelConfiguration;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblBookingAdditionalsMap : EntityTypeConfiguration<tblBookingAdditionalsModel>
    {
        public tblBookingAdditionalsMap()
        {
            HasKey(i => i.bookingAdditionalID);
            ToTable("bookingadditionals_tbl");
        }
    }
}
