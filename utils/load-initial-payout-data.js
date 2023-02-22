const fs = require('fs');
const { CosmosClient } = require("@azure/cosmos");


const main = async () => {
  const payoutsData = fs.readFileSync('payouts.csv').toString().split('\n').flatMap(line => {
    const [timestamp, pool, broker, wallet_id, asset_acquired, quantity_acquired, conversion_rate, income] = line.trim().split(',');
    const obj = { timestamp, pool, broker, wallet_id, asset_acquired, quantity_acquired: Number(quantity_acquired), conversion_rate: Number(conversion_rate), income: Number(income) };
    obj.timestamp = new Date(Date.parse(obj.timestamp)).toISOString();
    return obj;
  });
  
  const endpoint = process.env.COSMOS_DB_ENDPOINT;
  const key = process.env.COSMOS_DB_KEY;
  const client = new CosmosClient({ endpoint, key });
  const { database } = await client.databases.createIfNotExists({ id: "Crypto" });
  const { container } = await database.containers.createIfNotExists({ id: "MiningPayouts", partitionKey: '/timestamp' });
  const createPromises = payoutsData.map(payoutData => container.items.create(payoutData));
  await Promise.all(createPromises);
};

main();