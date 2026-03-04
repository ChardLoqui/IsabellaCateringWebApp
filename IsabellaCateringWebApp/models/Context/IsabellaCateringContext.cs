using IsabellaCateringWebApp.Models.Maps;
using IsabellaCateringWebApp.Models.Models;
using MySql.Data.EntityFramework;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Context
{
    [DbConfigurationType(typeof(MySqlEFConfiguration))]
    public class IsabellaCateringContext : DbContext
    {
        static IsabellaCateringContext()
        {
            Database.SetInitializer<IsabellaCateringContext>(null); 
        }
        public IsabellaCateringContext() : base("Name=isabellacms_db") { }

        public virtual DbSet<tblPasswordTokensModel> passwordtokens_tbl { get; set; }
        public virtual DbSet<tblUsersModel> users_tbl { get; set; }
        public virtual DbSet<tblBookingsModel> bookings_tbl { get; set; }
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Configurations.Add(new tblPasswordTokensMap());
            modelBuilder.Configurations.Add(new tblUsersMap());
            modelBuilder.Configurations.Add(new tblBookingsMap());
        }
    }
}