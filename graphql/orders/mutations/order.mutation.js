const { gql } = require("graphql-request");

const beginOrderEdit = gql`
    mutation orderEditBegin($id: ID!) {
        orderEditBegin(id: $id) {
            calculatedOrder {
                id
            }
            userErrors {
                field
                message
            }
        }
    }
`;

const addVariantToOrder = gql`
    mutation addVariantToOrder($orderEditId: ID!, $variantId: ID!, $quantity: Int!) {
        orderEditAddVariant(id: $orderEditId, variantId: $variantId, quantity: $quantity) {
            calculatedOrder {
                id
                addedLineItems(first: 5) {
                    edges {
                        node {
                            id
                            title
                            quantity
                        }
                    }
                }
            }
        }
    }
`;

const addFullDiscountToVariant = gql`
    mutation addDiscount($orderEditId: ID!, $lineItemId: ID!) {
        orderEditAddLineItemDiscount(
            id: $orderEditId
            lineItemId: $lineItemId
            discount: { percentValue: 100, description: "Bundle subproduct" }
        ) {
            calculatedOrder {
                id
                addedLineItems(first: 5) {
                    edges {
                        node {
                            id
                            title
                            quantity
                        }
                    }
                }
            }
            userErrors {
                field
                message
            }
        }
    }
`;

const endOrderEdit = gql`
    mutation commitEdit($orderEditId: ID!) {
        orderEditCommit(
            id: $orderEditId
            notifyCustomer: false
            staffNote: "Edited by backend inventory app"
        ) {
            order {
                id
            }
            userErrors {
                field
                message
            }
        }
    }
`;

module.exports = { beginOrderEdit, addVariantToOrder, addFullDiscountToVariant, endOrderEdit };
