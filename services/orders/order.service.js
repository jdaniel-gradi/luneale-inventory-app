require("dotenv").config();

const {
    beginOrderEdit,
    addVariantToOrder,
    addFullDiscountToVariant,
    endOrderEdit
} = require("../../graphql/orders/mutations/order.mutation");

const graphQLClient = require("../../graphql");

const { SHOPIFY_GQL_ENDPOINT: gql_url, SHOPIFY_GQL_BASEID: gql_baseId } = process.env;

class OrderService {
    constructor() {
        this.baseUrl = gql_url;
        this.baseGQLId = gql_baseId;
    }

    async beginOrderEdit(orderId) {
        const response = await graphQLClient.request(beginOrderEdit, {
            id: `${this.baseGQLId}/Order/${orderId}`
        });

        return response;
    }

    async addVariantOrderEdit(orderEditId, variantId, quantity) {
        if (!orderEditId.includes("gid://"))
            orderEditId = `${this.baseGQLId}/CalculatedOrder/${orderEditId}`;
        if (!String(variantId).includes("gid://"))
            variantId = `${this.baseGQLId}/ProductVariant/${variantId}`;
        const response = await graphQLClient.request(addVariantToOrder, {
            orderEditId,
            variantId,
            quantity
        });

        return response;
    }

    async addFullDiscountOrderEditLineItem(orderEditId, lineItemId) {
        if (!orderEditId.includes("gid://"))
            orderEditId = `${this.baseGQLId}/CalculatedOrder/${orderEditId}`;
        if (!lineItemId.includes("gid://"))
            lineItemId = `${this.baseGQLId}/CalculatedLineItem/${lineItemId}`;

        const response = await graphQLClient.request(addFullDiscountToVariant, {
            orderEditId,
            lineItemId
        });

        return response;
    }

    async endOrderEdit(orderEditId) {
        if (!orderEditId.includes("gid://"))
            orderEditId = `${this.baseGQLId}/CalculatedOrder/${orderEditId}`;

        const response = await graphQLClient.request(endOrderEdit, {
            orderEditId
        });

        return response;
    }
}

module.exports = { OrderService };
