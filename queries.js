// Query to get the Relay ID of the Project vNext
exports.getProjectNextQuery = (organization, projectNextNumber) => {
  return `{
    organization(login: "${organization}") {
      projectNext(number: ${projectNextNumber}) {
        id
      }
    }
  }`;
};

// Query to get the Relay ID of the Project vNext
exports.getProjectNextItemQuery = (organization, projectNextNumber) => {
  return `{
    organization(login: "${organization}") {
      projectNext(number: ${projectNextNumber}) {
        items(first: 100) {
          edges {
            node {
              id
              content {
                ... on PullRequest {
                  databaseId
                }
              }
            }
          }
        }
      }
    }
  }`;
};

// Mutation to remove the Pull Request to the Project vNext
exports.removePullRequestFromProjectNext = (itemId, projectRelayId) => {
  return `mutation {
    deleteProjectNextItem(input: {itemId: "${itemId}", projectId: "${projectRelayId}"}) {
      deletedItemId
    }
  }`;
};

// Mutation to add the Pull Request to the Project vNext
exports.addPullRequestToProjectNext = (contentId, projectRelayId) => {
  return `mutation {
    addProjectNextItem(input: {contentId: "${contentId}", projectId: "${projectRelayId}"}) {
      projectNextItem {
        id
      }
    }
  }`;
};
