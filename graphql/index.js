const { GraphQLClient } = require("graphql-request");

const shopifyAPI = require("../utils/shopifyAPI.util");
const utils = new shopifyAPI();

require("dotenv").config();

const { SHOPIFY_GQL_ENDPOINT: gql_url } = process.env;

const graphQLClient = new GraphQLClient(gql_url, {
    headers: utils.getAPIHeaders()
});

module.exports = graphQLClient;
