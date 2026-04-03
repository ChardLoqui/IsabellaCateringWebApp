using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Models
{
    public class tblClientsModel
    {
        public int clientID { get; set; }
        public int permissionID { get; set; }
        public int receiptID { get; set; }
        public string eventName {get; set;}
        public string cFName { get; set; }
        public string cLName { get; set; }
        public string cEmail { get; set; }
        public string cContact { get; set; }
        public string cCeleb1FName { get; set; }
        public string cCeleb1LName { get; set; }
        public string cCeleb2FName { get; set; }
        public string cCeleb2LName { get; set; }
        public string entryCode { get; set; }
        public string password { get; set; }
        public DateTime dateCreated { get; set; }
        public DateTime dateUpdated { get; set; }
        public int attempts { get; set; }
        public DateTime? lockoutEnd { get; set; }
    }
}