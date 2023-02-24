import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { CosmosDbClient } from '../cosmos-db-client';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const dbClient = new CosmosDbClient();
    const stats = await dbClient.getMonthlyStatistics();

    context.res = {
        status: 200,
        body: JSON.stringify(stats),
    };
};

export default httpTrigger;