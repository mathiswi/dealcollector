import * as cdk from '@aws-cdk/core';
// import * as iam from '@aws-cdk/aws-iam';
import * as events from '@aws-cdk/aws-events';
import * as targets from '@aws-cdk/aws-events-targets';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as lambda from '@aws-cdk/aws-lambda';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { Duration } from '@aws-cdk/core';

export class DealcollectorStack extends cdk.Stack {
  constructor(app: cdk.App, id: string) {
    super(app, id);

    const axiosLayer = lambda.LayerVersion.fromLayerVersionArn(this, 'axios-lambda-layer', 'arn:aws:lambda:eu-central-1:161489297905:layer:axios-lambda-layer:2');
    const uuidLayer = lambda.LayerVersion.fromLayerVersionArn(this, 'uuid-lambda-layer', 'arn:aws:lambda:eu-central-1:161489297905:layer:uuid-lambda-layer:2');
    const jsdomLayer = lambda.LayerVersion.fromLayerVersionArn(this, 'jsdom-lambda-layer', 'arn:aws:lambda:eu-central-1:161489297905:layer:jsdom-lambda-layer:4');
    const playwrightLayer = lambda.LayerVersion.fromLayerVersionArn(this, 'playwright-lambda-layer', 'arn:aws:lambda:eu-central-1:161489297905:layer:playwright-lambda-layer:2');

    const dealTable = new dynamodb.Table(this, 'Deals', {
      partitionKey: {
        name: 'dealId',
        type: dynamodb.AttributeType.STRING,
      },
      tableName: 'currentDeals',
      removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production code
      timeToLiveAttribute: 'expirationTime',
    });

    const familaLambda = new lambda.Function(this, 'famila', {
      code: lambda.Code.fromAsset('packages/famila', { exclude: ['*.ts', 'local.js'] }),
      handler: 'famila.handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      timeout: Duration.seconds(20),
      memorySize: 256,
      layers: [axiosLayer, uuidLayer],
    });

    const combiLambda = new lambda.Function(this, 'combi', {
      code: lambda.Code.fromAsset('packages/combi', { exclude: ['*.ts', 'local.js'] }),
      handler: 'combi.handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      timeout: Duration.seconds(20),
      memorySize: 256,
      layers: [axiosLayer, uuidLayer],
    });

    const edekaLambda = new lambda.Function(this, 'edeka', {
      code: lambda.Code.fromAsset('packages/edeka', { exclude: ['*.ts', 'local.js'] }),
      handler: 'edeka.handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      timeout: Duration.seconds(20),
      memorySize: 256,
      layers: [axiosLayer, uuidLayer],
    });

    const lidlLambda = new lambda.Function(this, 'lidl', {
      code: lambda.Code.fromAsset('packages/lidl', { exclude: ['*.ts', 'local.js'] }),
      handler: 'lidl.handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      timeout: Duration.seconds(45),
      memorySize: 256,
      layers: [uuidLayer, jsdomLayer, playwrightLayer],
    });

    const aldiLambda = new lambda.Function(this, 'aldi', {
      code: lambda.Code.fromAsset('packages/aldi', { exclude: ['*.ts', 'local.js'] }),
      handler: 'aldi.handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      timeout: Duration.minutes(1),
      memorySize: 1024,
      layers: [uuidLayer, jsdomLayer, playwrightLayer],
    });

    const getAllLambda = new lambda.Function(this, 'getAll-lambda', {
      code: lambda.Code.fromAsset('packages/api', { exclude: ['*.ts', 'local.js'] }),
      handler: 'getAll.handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      timeout: Duration.seconds(10),
      memorySize: 256,
    });

    const getShopLambda = new lambda.Function(this, 'getShop-lambda', {
      code: lambda.Code.fromAsset('packages/api', { exclude: ['*.ts', 'local.js'] }),
      handler: 'getShop.handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      timeout: Duration.seconds(10),
      memorySize: 256,
    });

    /*
    const backupLambda = new lambda.Function(this, 'backup-deals', {
      code: lambda.Code.fromAsset('packages/backup-deals', { exclude: ['*.ts', 'local.js'] }),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      timeout: Duration.seconds(30),
      memorySize: 256,
    });

    const createBackupTableLambda = new lambda.Function(this, 'createBackupTable', {
      code: lambda.Code.fromAsset('packages/create-backup-table', {
        exclude: ['*.ts', 'local.js'] }),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      timeout: Duration.seconds(5),
      memorySize: 256,
    });
    */

    const deployRequestLambda = new lambda.Function(this, 'deployRequest', {
      code: lambda.Code.fromAsset('packages/deploy-request', { exclude: ['*.ts', 'local.js'] }),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      timeout: Duration.seconds(10),
      memorySize: 256,
      environment: {
        DEPLOY_HOOK: process.env.DEPLOY_HOOK as string,
      },
    });

    dealTable.grantReadWriteData(lidlLambda);
    dealTable.grantReadWriteData(edekaLambda);
    dealTable.grantReadWriteData(familaLambda);
    dealTable.grantReadWriteData(combiLambda);
    dealTable.grantReadWriteData(aldiLambda);

    dealTable.grantReadWriteData(getAllLambda);
    dealTable.grantReadWriteData(getShopLambda);

    /*
    dealTable.grantReadWriteData(backupLambda);

    createBackupTableLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: ['*'],
      actions: ['dynamodb:*'],
    }));

    backupLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: ['*'],
      actions: ['dynamodb:*'],
    }));

    */

    const collectRuleLidl = new events.Rule(this, 'Lidl-cron', {
      schedule: events.Schedule.expression('cron(4 5 ? * SUN *)'),
    });
    const collectRuleAldi = new events.Rule(this, 'Aldi-cron', {
      schedule: events.Schedule.expression('cron(4 5 ? * SUN *)'),
    });
    const collectRuleEdeka = new events.Rule(this, 'Edeka-cron', {
      schedule: events.Schedule.expression('cron(4 5 ? * SUN *)'),
    });
    const collectRuleFamila = new events.Rule(this, 'Famila-cron', {
      schedule: events.Schedule.expression('cron(4 5 ? * SUN *)'),
    });

    const collectRuleCombi = new events.Rule(this, 'Combi-cron', {
      schedule: events.Schedule.expression('cron(4 5 ? * SUN *)'),
    });

    const deployRequestRule = new events.Rule(this, 'deployRequest-cron', {
      schedule: events.Schedule.expression('cron(10 5 ? * SUN *)'),
    });
    /*
    const backupRule = new events.Rule(this, 'Backup-cron', {
      schedule: events.Schedule.expression('cron(2 5 ? * SUN *)'),
    });

    const backupTableRule = new events.Rule(this, 'createBackupTable-cron', {
      schedule: events.Schedule.expression('cron(0 5 ? * SUN *)'),
    });
    backupRule.addTarget(new targets.LambdaFunction(backupLambda));
    backupTableRule.addTarget(new targets.LambdaFunction(createBackupTableLambda));
    */

    collectRuleEdeka.addTarget(new targets.LambdaFunction(edekaLambda));
    collectRuleFamila.addTarget(new targets.LambdaFunction(familaLambda));
    collectRuleCombi.addTarget(new targets.LambdaFunction(combiLambda));
    collectRuleLidl.addTarget(new targets.LambdaFunction(lidlLambda));
    collectRuleAldi.addTarget(new targets.LambdaFunction(aldiLambda));

    deployRequestRule.addTarget(new targets.LambdaFunction(deployRequestLambda));

    const api = new apigateway.RestApi(this, 'dealApi', {
      restApiName: 'Deal Api',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
      },
    });

    const getAllIntegration = new apigateway.LambdaIntegration(getAllLambda);
    api.root.addMethod('GET', getAllIntegration);

    const shops = api.root.addResource('{shop}');
    const getShopIntegration = new apigateway.LambdaIntegration(getShopLambda);
    shops.addMethod('GET', getShopIntegration);
  }
}

const app = new cdk.App();
// eslint-disable-next-line no-new
new DealcollectorStack(app, 'DealcollectorStack');
app.synth();
