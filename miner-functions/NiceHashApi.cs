using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RestSharp;

namespace miner_functions
{
    /// <summary>
    /// Modified nice hash client from https://raw.githubusercontent.com/nicehash/rest-clients-demo/master/c%23/connect/connect/Api.cs
    /// </summary>
    class NiceHashApi
    {
        private string urlRoot;
        private string orgId;
        private string apiKey;
        private string apiSecret;

        public NiceHashApi(string urlRoot, string orgId, string apiKey, string apiSecret)
        {
            this.urlRoot = urlRoot;
            this.orgId = orgId;
            this.apiKey = apiKey;
            this.apiSecret = apiSecret;
        }

        private static string HashBySegments(string key, string apiKey, string time, string nonce, string orgId, string method, string encodedPath, string query, string bodyStr)
        {
            List<string> segments = new List<string>();
            segments.Add(apiKey);
            segments.Add(time);
            segments.Add(nonce);
            segments.Add(null);
            segments.Add(orgId);
            segments.Add(null);
            segments.Add(method);
            segments.Add(encodedPath == null ? null : encodedPath);
            segments.Add(query == null ? null : query);

            if (bodyStr != null && bodyStr.Length > 0)
            {
                segments.Add(bodyStr);
            }
            return NiceHashApi.CalcHMACSHA256Hash(NiceHashApi.JoinSegments(segments), key);
        }

        private static string getPath(string url)
        {
            var arrSplit = url.Split('?');
            return arrSplit[0];
        }

        private static string getQuery(string url)
        {
            var arrSplit = url.Split('?');

            if (arrSplit.Length == 1)
            {
                return null;
            }
            else
            {
                return arrSplit[1];
            }
        }

        private static string JoinSegments(List<string> segments)
        {
            var sb = new System.Text.StringBuilder();
            bool first = true;
            foreach (var segment in segments)
            {
                if (!first)
                {
                    sb.Append("\x00");
                }
                else
                {
                    first = false;
                }

                if (segment != null)
                {
                    sb.Append(segment);
                }
            }
            return sb.ToString();
        }

        private static string CalcHMACSHA256Hash(string plaintext, string salt)
        {
            string result = "";
            var enc = Encoding.Default;
            byte[]
            baText2BeHashed = enc.GetBytes(plaintext),
            baSalt = enc.GetBytes(salt);
            System.Security.Cryptography.HMACSHA256 hasher = new System.Security.Cryptography.HMACSHA256(baSalt);
            byte[] baHashedText = hasher.ComputeHash(baText2BeHashed);
            result = string.Join("", baHashedText.ToList().Select(b => b.ToString("x2")).ToArray());
            return result;
        }


        private Task<T> get<T>(string url)
        {
            return this.get<T>(url, false);
        }

        private async Task<T> get<T>(string url, bool auth)
        {
            var client = new RestClient(this.urlRoot);
            var request = new RestRequest(url);

            if (auth)
            {
                string serverTime = "" + (await GetTime()).serverTime;
                string nonce = Guid.NewGuid().ToString();
                string digest = NiceHashApi.HashBySegments(this.apiSecret, this.apiKey, serverTime, nonce, this.orgId, "GET", getPath(url), getQuery(url), null);

                request.AddOrUpdateHeader("X-Time", serverTime);
                request.AddOrUpdateHeader("X-Nonce", nonce);
                request.AddOrUpdateHeader("X-Auth", this.apiKey + ":" + digest);
                request.AddOrUpdateHeader("X-Organization-Id", this.orgId);
            }

            return await client.GetAsync<T>(request);
        }

        private async Task<T> post<T>(string url, string payload, bool requestId)
        {
            var client = new RestClient(this.urlRoot);
            var request = new RestRequest(url);
            request.AddOrUpdateHeader("Accept", "application/json");
            request.AddOrUpdateHeader("Content-type", "application/json");

            string serverTime = "" + (await GetTime()).serverTime;
            string nonce = Guid.NewGuid().ToString();
            string digest = NiceHashApi.HashBySegments(this.apiSecret, this.apiKey, serverTime, nonce, this.orgId, "POST", getPath(url), getQuery(url), payload);

            if (payload != null)
            {
                request.AddJsonBody(payload);
            }

            request.AddOrUpdateHeader("X-Time", serverTime);
            request.AddOrUpdateHeader("X-Nonce", nonce);
            request.AddOrUpdateHeader("X-Auth", this.apiKey + ":" + digest);
            request.AddOrUpdateHeader("X-Organization-Id", this.orgId);

            if (requestId)
            {
                request.AddOrUpdateHeader("X-Request-Id", Guid.NewGuid().ToString());
            }

            return await client.PostAsync<T>(request);
        }

        private async Task<T> delete<T>(string url, bool requestId)
        {
            var client = new RestClient(this.urlRoot);
            var request = new RestRequest(url);

            string serverTime = "" + (await GetTime()).serverTime;
            string nonce = Guid.NewGuid().ToString();
            string digest = NiceHashApi.HashBySegments(this.apiSecret, this.apiKey, serverTime, nonce, this.orgId, "DELETE", getPath(url), getQuery(url), null);

            request.AddOrUpdateHeader("X-Time", serverTime);
            request.AddOrUpdateHeader("X-Nonce", nonce);
            request.AddOrUpdateHeader("X-Auth", this.apiKey + ":" + digest);
            request.AddOrUpdateHeader("X-Organization-Id", this.orgId);

            if (requestId)
            {
                request.AddOrUpdateHeader("X-Request-Id", Guid.NewGuid().ToString());
            }

            return await client.DeleteAsync<T>(request);
        }

        public Task<ServerTime> GetTime()
        {
            return this.get<ServerTime>("/api/v2/time");
        }

        public Task<AccountInfo> GetAccountInfo()
        {
            return this.get<AccountInfo>("/main/api/v2/accounting/accounts2", true);
        }

        public Task<WalletList> GetWithdrawalAddresses()
        {
            return this.get<WalletList>("main/api/v2/accounting/withdrawalAddresses", true);
        }

        public Task<WithdrawlResponse> RequestWithdrawl(string walletId, double amount)
        {
            var body = "{\"currency\": \"BTC\", \"withdrawalAddressId\": \"" + walletId + "\", \"amount\": \"" + amount + "\"}";
            return this.post<WithdrawlResponse>("/main/api/v2/accounting/withdrawal", body, false);
        }
    }

    public class ServerTime
    {
        public double serverTime { get; set; }
    }

    public class AccountInfoTotal
    {
        public string currency { get; set; }
        public double totalBalance { get; set; }
        public double available { get; set; }
        public double debt { get; set; }
        public double pending { get; set; }
    }

    public class AccountInfo
    {
        public AccountInfoTotal total { get; set; }
    }


    public class Wallet
    {
        public string id { get; set; }
    }

    public class WalletList
    {
        public List<Wallet> list { get; set; }
    }

    public class WithdrawlResponse
    {
        public string id { get; set; } 
    }
}