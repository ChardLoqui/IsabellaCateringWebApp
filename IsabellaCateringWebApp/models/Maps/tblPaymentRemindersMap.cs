using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblPaymentRemindersMap : EntityTypeConfiguration<tblPaymentRemindersModel>
    {
        public tblPaymentRemindersMap()
        {
            HasKey(i => i.reminderID);
            ToTable("paymentreminders_tbl");
        }
    }
}