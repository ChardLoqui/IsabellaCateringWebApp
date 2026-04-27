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
        public virtual DbSet<tblActivityLogsModel> activitylogs_tbl { get; set; }
        public virtual DbSet<tblBackdropTypesModel> backdroptypes_tbl { get; set; }
        public virtual DbSet<tblBookingAdditionalsModel> bookingadditionals_tbl { get; set; }
        public virtual DbSet<tblBookingReceiptsModel> bookingreceipts_tbl { get; set; }
        public virtual DbSet<tblBookingRequestsModel> bookingrequests_tbl { get; set; }
        public virtual DbSet<tblBookingsModel> bookings_tbl { get; set; }
        public virtual DbSet<tblCenterPieceTypesModel> centerpiecetypes_tbl { get; set; }
        public virtual DbSet<tblClientRequestsModel> clientrequests_tbl { get; set; }
        public virtual DbSet<tblClientsModel> clients_tbl { get; set; }
        public virtual DbSet<tblCouchTypesModel> couchtypes_tbl { get; set; }
        public virtual DbSet<tblDebutGrpTypesModel> debutgrptypes_tbl { get; set; }
        public virtual DbSet<tblDebutTypesModel> debuttypes_tbl { get; set; }
        public virtual DbSet<tblEntertainmentGrpTypesModel> entertainmentgrptypes_tbl { get; set; }
        public virtual DbSet<tblEntertainmentTypesModel> entertainmenttypes_tbl { get; set; }
        public virtual DbSet<tblEntranceTypesModel> entrancetypes_tbl { get; set; }
        public virtual DbSet<tblEquipGrpTypesModel> equipgrptypes_tbl { get; set; }
        public virtual DbSet<tblEquipTypesModel> equiptypes_tbl { get; set; }
        public virtual DbSet<tblEventsModel> events_tbl { get; set; }
        public virtual DbSet<tblKeepsakesGrpTypesModel> keepsakesgrptypes_tbl { get; set; }
        public virtual DbSet<tblKeepsakesTypesModel> keepsakestypes_tbl { get; set; }
        public virtual DbSet<tblMainCourseTypesModel> maincoursetypes_tbl { get; set; }
        public virtual DbSet<tblPackageCategoriesModel> packagecategories_tbl { get; set; }
        public virtual DbSet<tblPackagesModel> packages_tbl { get; set; }
        public virtual DbSet<tblPackageTypesModel> packagetypes_tbl { get; set; }
        public virtual DbSet<tblPasswordTokensModel> passwordtokens_tbl { get; set; }
        public virtual DbSet<tblPaymentRemindersModel> paymentreminders_tbl { get; set; }
        public virtual DbSet<tblPaymentsModel> payments_tbl { get; set; }
        public virtual DbSet<tblPermissionsModel> permissions_tbl { get; set; }
        public virtual DbSet<tblPhotoGrpTypesModel> photogrptypes_tbl { get; set; }
        public virtual DbSet<tblPhotoTypesModel> phototypes_tbl { get; set; }
        public virtual DbSet<tblPricePaxsModel> pricepaxs_tbl { get; set; }
        public virtual DbSet<tblSeatingTypesModel> seatingtypes_tbl { get; set; }
        public virtual DbSet<tblSidesGrpTypesModel> sidesgrptypes_tbl { get; set; }
        public virtual DbSet<tblSidesTypesModel> sidestypes_tbl { get; set; }
        public virtual DbSet<tblSpecialsGrpTypesModel> specialsgrptypes_tbl { get; set; }
        public virtual DbSet<tblSpecialsTypesModel> specialstypes_tbl { get; set; }
        public virtual DbSet<tblStaffGrpTypesModel> staffgrptypes_tbl { get; set; }
        public virtual DbSet<tblStaffTypesModel> stafftypes_tbl { get; set; }
        public virtual DbSet<tblTaskHistoryModel> taskhistory_tbl { get; set; }
        public virtual DbSet<tblTasksModel> tasks_tbl { get; set; }
        public virtual DbSet<tblUsersModel> users_tbl { get; set; }
        
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Configurations.Add(new tblActivityLogsMap());
            modelBuilder.Configurations.Add(new tblBackdropTypesMap());
            modelBuilder.Configurations.Add(new tblBookingAdditionalsMap());
            modelBuilder.Configurations.Add(new tblBookingReceiptsMap());
            modelBuilder.Configurations.Add(new tblBookingRequestsMap());
            modelBuilder.Configurations.Add(new tblBookingsMap());
            modelBuilder.Configurations.Add(new tblCenterPieceTypesMap());
            modelBuilder.Configurations.Add(new tblClientRequestsMap());
            modelBuilder.Configurations.Add(new tblClientsMap());
            modelBuilder.Configurations.Add(new tblCouchTypesMap());
            modelBuilder.Configurations.Add(new tblDebutGrpTypesMap());
            modelBuilder.Configurations.Add(new tblDebutTypesMap());
            modelBuilder.Configurations.Add(new tblEntertainmentGrpTypesMap());
            modelBuilder.Configurations.Add(new tblEntertainmentTypesMap());
            modelBuilder.Configurations.Add(new tblEntranceTypesMap());
            modelBuilder.Configurations.Add(new tblEquipGrpTypesMap());
            modelBuilder.Configurations.Add(new tblEquipTypesMap());
            modelBuilder.Configurations.Add(new tblEventsMap());
            modelBuilder.Configurations.Add(new tblKeepsakesGrpTypesMap());
            modelBuilder.Configurations.Add(new tblKeepsakesTypesMap());
            modelBuilder.Configurations.Add(new tblMainCourseTypesMap());
            modelBuilder.Configurations.Add(new tblPackageCategoriesMap());
            modelBuilder.Configurations.Add(new tblPackagesMap());
            modelBuilder.Configurations.Add(new tblPackageTypesMap());
            modelBuilder.Configurations.Add(new tblPasswordTokensMap());
            modelBuilder.Configurations.Add(new tblPaymentRemindersMap());
            modelBuilder.Configurations.Add(new tblPaymentsMap());
            modelBuilder.Configurations.Add(new tblPermissionsMap());
            modelBuilder.Configurations.Add(new tblPhotoGrpTypesMap());
            modelBuilder.Configurations.Add(new tblPhotoTypesMap());
            modelBuilder.Configurations.Add(new tblPricePaxsMap());
            modelBuilder.Configurations.Add(new tblSeatingTypesMap());
            modelBuilder.Configurations.Add(new tblSidesGrpTypesMap());
            modelBuilder.Configurations.Add(new tblSidesTypesMap());
            modelBuilder.Configurations.Add(new tblSpecialsGrpTypesMap());
            modelBuilder.Configurations.Add(new tblSpecialsTypesMap());
            modelBuilder.Configurations.Add(new tblStaffGrpTypesMap());
            modelBuilder.Configurations.Add(new tblStaffTypesMap());
            modelBuilder.Configurations.Add(new tblTaskHistoryMap());
            modelBuilder.Configurations.Add(new tblTasksMap());
            modelBuilder.Configurations.Add(new tblUsersMap());
            
        }
    }
}
