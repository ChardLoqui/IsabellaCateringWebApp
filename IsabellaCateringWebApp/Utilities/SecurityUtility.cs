using System;
using System.Security.Cryptography;
using System.Text;

namespace IsabellaCateringWebApp.Utilities
{
    public static class SecurityUtility
    {
        public static string GenerateToken()
        {
            byte[] bytes = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(bytes);
            }
            return Convert.ToBase64String(bytes);
        }

        public static string HashData(string data)
        {
            if (string.IsNullOrEmpty(data))
                return data;

            using (var sha = SHA256.Create())
            {
                byte[] bytes = Encoding.UTF8.GetBytes(data);
                byte[] hash = sha.ComputeHash(bytes);
                return Convert.ToBase64String(hash);
            }
        }
    }
}