using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblPricePaxsMap : EntityTypeConfiguration<tblPricePaxsModel>
    {
        public tblPricePaxsMap()
        {
            HasKey(i => i.pricePaxID);
            ToTable("pricepaxs_tbl");
        }
    }
}