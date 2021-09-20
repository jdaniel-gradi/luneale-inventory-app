const { gql } = require("graphql-request");

const getProductById = gql`
    query product($id: ID!) {
        product(id: $id) {
            id
            handle
            title
            tags
            productType
            metafields(first: 250) {
                edges {
                    node {
                        namespace
                        key
                        value
                    }
                }
            }
        }
    }
`;

const getProductByHandle = gql`
    query productByHandle($handle: String!) {
        productByHandle(handle: $handle) {
            id
            handle
            title
            description
            tags
            variants(first: 50) {
                edges {
                    node {
                        id
                        title
                        sku
                        inventoryItem {
                            id
                            inventoryLevels(first: 5) {
                                edges {
                                    node {
                                        id
                                        location {
                                            id
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`;

const getVariantBySKU = gql`
    query productVariants($sku: String!) {
        productVariants(first: 5, query: $sku) {
            edges {
                node {
                    id
                    sku
                    title
                    inventoryItem {
                        id
                        inventoryLevels {
                            edges {
                                node {
                                    id
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`;

const getProductsWithQuery = gql`
    query getProducts($query: String!) {
        products(first: 5, query: $query) {
            edges {
                node {
                    id
                    title
                    productType
                    variants(first: 10) {
                        edges {
                            node {
                                id
                                title
                                inventoryItem {
                                    id
                                    inventoryLevels(first: 5) {
                                        edges {
                                            node {
                                                id
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`;

module.exports = { getProductById, getProductByHandle, getVariantBySKU, getProductsWithQuery };
