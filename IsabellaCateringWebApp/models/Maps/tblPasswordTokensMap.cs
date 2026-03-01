using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblPasswordTokensMap : EntityTypeConfiguration<tblPasswordTokensModel>
    {
        public tblPasswordTokensMap()
        {
            HasKey(i => i.tokenID);
            ToTable("passwordtokens_tbl");
        }
    }
}