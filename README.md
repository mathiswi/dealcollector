# dealcollector

WIP

Personal project which queries an API (or scrapes the website if no api is available) of my local supermarkets, saves it to a database (dynamoDB) and exposes them via a simple api. All components (database, functions, api) live on aws and are deployed them via aws-cdk.
Scraping functions run every sunday morning, after I backed up the old data, to collect the new deals for the upcoming week.


The API for the current week is accessible on https://r017129kll.execute-api.eu-central-1.amazonaws.com/prod or for a specific store https://r017129kll.execute-api.eu-central-1.amazonaws.com/prod/{store}. 

(See https://github.com/mathiswi/dealcollector-frontend for the matching frontend)

## Install

If for some reason you want to run it yourself, follow these instructions (to deploy a configured aws-cli and aws-cdk is required):

```
# Install dependencies
npm install

# Bootstrap lerna packages
npm run bootstrap

# Deploy to aws (details see below)
npm run deploy

# Run single function locally
npm run dev:{storeName}
```
If you run it locally it'll try to save the deals to a database in your aws account called currentDeals. If you deployed the cdk stack it should be fine, but you can always just create it yourself or change it to a completely different database.

I use axios, jsdom and uuid as a lambda layer to keep the deployment packages small. If you want to add them yourself, check out https://github.com/mathiswi/nodejs-aws-lambda-layers. If not, change them in the packages from a devDependency to a normal one.


