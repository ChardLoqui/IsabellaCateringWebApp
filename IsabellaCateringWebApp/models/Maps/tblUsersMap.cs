using IsabellaCateringWebApp.Models.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Maps
{
    public class tblUsersMap : EntityTypeConfiguration<tblUsersModel>
    {
        public tblUsersMap()
        {
            HasKey(i => i.userID);
            ToTable("users_tbl");
        }
    }
}