const { gql } = require('graphql-request');

const sendEmailMutation = gql`
  mutation customerGenerateAccountActivationUrl($customerId: ID!) {
    customerGenerateAccountActivationUrl(customerId: $customerId) {
      accountActivationUrl
      userErrors {
        field
        message
      }
    }
  }
`;

module.exports = { sendEmailMutation };
