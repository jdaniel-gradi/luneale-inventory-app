const { gql } = require("graphql-request");

const adjustInventoryQuantity = gql`
    mutation adjustInventory($input: InventoryAdjustQuantityInput!) {
        inventoryAdjustQuantity(input: $input) {
            inventoryLevel {
                id
            }
            userErrors {
                field
                message
            }
        }
    }
`;

module.exports = { adjustInventoryQuantity };
