import { CosmosClient } from "@azure/cosmos";

export class CosmosDbClient {
  private client: CosmosClient;

  constructor() {
    this.client = new CosmosClient({ 
      endpoint: process.env.COSMOS_DB_ENDPOINT || '', 
      key: process.env.COSMOS_DB_KEY || '',
    });
  }

  public async getMiningPayouts(): Promise<any[]> {
    const container = await this.getMiningPayoutsContainer();
    const { resources } = await container.items.readAll().fetchAll();
    return resources;
  }

  public async getMiningPowerUsage(): Promise<any[]> {
    const container = await this.getMiningPowerUsageContainer();
    const { resources } = await container.items.readAll().fetchAll();
    return resources;
  }

  private async getCryptoDatabase() {
    const { database } = await this.client.databases.createIfNotExists({ id: "Crypto" });
    return database;
  }

  private async getMiningPowerUsageContainer() {
    const database = await this.getCryptoDatabase();
    const { container } = await database.containers.createIfNotExists({ id: "MiningPowerUsage", partitionKey: '/date' });
    return container;
  }

  private async getMiningPayoutsContainer() {
    const database = await this.getCryptoDatabase();
    const { container } = await database.containers.createIfNotExists({ id: "MiningPayouts", partitionKey: '/timestamp' });
    return container;
  }
}
