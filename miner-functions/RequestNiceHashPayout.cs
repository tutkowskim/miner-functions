using System;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;

// In order to debug on mac use https://github.com/azure/azurite

namespace miner_functions
{
    public static class RequestNiceHashPayout
    {
        [FunctionName("RequestNiceHashPayout")]
        public static void Run([TimerTrigger("0 0 8 * * *")] TimerInfo myTimer, ILogger log)
        {
            var niceHashUrl = "https://api2.nicehash.com";
            var orgId = Environment.GetEnvironmentVariable("NICE_HASH_ORG_ID");
            var apiKey = Environment.GetEnvironmentVariable("NICE_HASH_API_KEY");
            var apiSecret = Environment.GetEnvironmentVariable("NICE_HASH_API_SECRET");
            NiceHashApi api = new NiceHashApi(niceHashUrl, orgId,apiKey, apiSecret);

            Task task = new Task(async () => {
                var time = await api.GetTime();
                var accountInfo = await api.GetAccountInfo();
                log.LogInformation("Server time: " + time.serverTime);
                log.LogInformation("Account Total: " + accountInfo.total.available);
            });

            task.Start();
            task.Wait();
        }
    }
}
