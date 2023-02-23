import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { CosmosDbClient } from '../cosmos-db-client';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const dbClient = new CosmosDbClient();
    const records = await dbClient.getMiningPayouts();

    context.res = {
        status: 200,
        body: JSON.stringify(records),
    };
};

export default httpTrigger;