const { gql } = require('graphql-request');

const getCustomer = gql`
  query customers($email: String!) {
    customers(first: 1, query: $email) {
      edges {
        node {
          id
          lastName
          verifiedEmail
          firstName
          lastName
          email
          phone
          tags
        }
      }
    }
  }
`;

module.exports = { getCustomer };
