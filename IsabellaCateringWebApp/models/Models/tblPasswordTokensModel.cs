using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IsabellaCateringWebApp.Models.Models
{
    public class tblPasswordTokensModel
    {
        public int tokenID { get; set; }
        public int userID { get; set; }
        public int clientID { get; set; }
        public string hashedToken { get; set; }
        public DateTime dateCreated { get; set; }
        public DateTime dateExpiry { get; set; }
    }
}