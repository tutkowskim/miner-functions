using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Microsoft.Azure.Cosmos;
using System.Collections.Generic;
using Microsoft.WindowsAzure.Storage.Table;
using Azure;

namespace functions
{
    public static class PostPowerUsage
    {
        [FunctionName("PostPowerUsage")]
        public static async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Function, "post", Route = null)] HttpRequest req, ILogger log)
        {

            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            dynamic data = JsonConvert.DeserializeObject(requestBody);

            var connectionString = Environment.GetEnvironmentVariable("COSMOS_DB_CONNECTION_STRING");
            CosmosClient cosmosClient = new CosmosClient(connectionString);
            Database database = await cosmosClient.CreateDatabaseIfNotExistsAsync(id: "Crypto");
            Container container = await database.CreateContainerIfNotExistsAsync(id: "MiningPowerUsage", partitionKeyPath: "/date");

            MiningPowerUsageItem item = new MiningPowerUsageItem()
            {
                ID = Guid.NewGuid().ToString(),
                Date = data.date,
                Rig = data.rig,
                PowerUsageKw = data.power_usage_kw,
                UsdPerKw = CostPerKw(),
            };
            await container.CreateItemAsync<MiningPowerUsageItem>(item);

            return new OkObjectResult("record created");
        }

        private static double CostPerKw()
        {
            // TODO: Scrap from we-energies
            return 0.16580;
        }
    }

    public class MiningPowerUsageItem
    {
        [JsonProperty("id")]
        public string ID { get; set; }
        [JsonProperty("date")]
        public string Date { get; set; }
        [JsonProperty("rig")]
        public string Rig { get; set; }
        [JsonProperty("power_usage_kw")]
        public double PowerUsageKw { get; set; }
        [JsonProperty("usd_per_kw")]
        public double UsdPerKw { get; init; } = default!;
    }
}
