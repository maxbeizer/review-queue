const core = require("@actions/core");
const github = require("@actions/github");
const { graphql } = require("@octokit/graphql");
const { main } = require("./main");
const { log } = require("./logger");
const {
  getProjectNextQuery,
  getProjectNextItemQuery,
  removePullRequestFromProjectNext,
  addPullRequestToProjectNext,
} = require("./queries");
const { areActorAndAuthorFlaggedInFunc, shouldQueueFunc } = require("./pure");

const UNABLE_TO_ADD_MESSAGE = `Unable to add Pull Request to the Review Queue Project`;
const PR_NOT_FOUND_MESSAGE = "Pull Request not found in Review Queue Project";
const UNABLE_TO_REMOVE_MESSAGE =
  "Unable to remove Pull Request from Review Queue Project";

const fetchProjectNextRelayId = async (
  { organization, projectNextNumber, graphqlExecutor },
  { log }
) => {
  try {
    const projectData = await graphqlExecutor(
      getProjectNextQuery(organization, projectNextNumber)
    );
    const { projectNext } = projectData.organization;
    if (!projectNext)
      throw new Error(
        `Unable to find Project ${organization}:${projectNextNumber}`
      );
    log("projectData", projectData);
    return projectNext.id;
  } catch (error) {
    log(`Unable to fetch review project ${organization}:${projectNextNumber}`);
    return null;
  }
};

const queueForReview = async (
  { graphqlExecutor, pull_request },
  { projectNextRelayId },
  { errorMessages }
) => {
  try {
    const pullRequestRelayId = pull_request.node_id;
    const response = await graphqlExecutor(
      addPullRequestToProjectNext(pullRequestRelayId, projectNextRelayId)
    );
    return {
      response,
      message: "Pull Request was added to the Review Queue successfully",
    };
  } catch (error) {
    log(UNABLE_TO_ADD_MESSAGE);
    errorMessages.push(UNABLE_TO_ADD_MESSAGE);
    errorMessages.push(error.message);
    return { error, message: error.message };
  }
};

const dequeueForReview = async (
  { graphqlExecutor, organization, projectNextNumber, pull_request },
  { projectNextRelayId },
  { errorMessages }
) => {
  try {
    const projectItemData = await graphqlExecutor(
      getProjectNextItemQuery(organization, projectNextNumber)
    );
    const { items } = projectItemData.organization.projectNext;
    if (!items || items.length === 0)
      throw new Error(
        `Unable to find Project Item ${organization}:${projectNextNumber}${pull_request.id}: no items`
      );
    const { edges } = items;
    if (!edges || edges.length === 0)
      throw new Error(
        `Unable to find Project Item ${organization}:${projectNextNumber}${pull_request.id}: no edges`
      );

    const edge = edges.find((edge) => {
      const { content } = edge.node;
      if (!content) return false;
      return content.databaseId === pull_request.id;
    });

    // swallow no matching edge
    if (!edge || !edge.node) {
      errorMessages.push(PR_NOT_FOUND_MESSAGE);
      return { response: {}, message: PR_NOT_FOUND_MESSAGE };
    }

    const {
      node: { id: projectNextItemRelayId },
    } = edge;

    // swallow not found here
    if (!projectNextItemRelayId) {
      errorMessages.push(PR_NOT_FOUND_MESSAGE);
      return { response: {}, message: PR_NOT_FOUND_MESSAGE };
    }

    const response = await graphqlExecutor(
      removePullRequestFromProjectNext(
        projectNextItemRelayId,
        projectNextRelayId
      )
    );
    return {
      response,
      message: "Pull Request was removed from the Review Queue successfully",
    };
  } catch (error) {
    log(UNABLE_TO_REMOVE_MESSAGE);
    errorMessages.push(UNABLE_TO_REMOVE_MESSAGE);
    errorMessages.push(error.message);
    return { error, message: error.message };
  }
};

const gatherInputs = async () => {
  const { payload, review, actor } = github.context;
  const { pull_request, action } = payload;
  const state = {
    payload,
    review,
    actor,
    action,
    pull_request,
    organization: core.getInput("project-owner", { required: true }),
    projectNextNumber: core.getInput("project-number", { required: true }),
    flaggedInList: core.getInput("flagged-in-users", { required: false }),
    graphqlExecutor: graphql.defaults({
      baseUrl: process.env.GRAPHQL_API_BASE || "https://api.github.com",
      headers: {
        "GraphQL-Features": "projects_next_graphql",
        Authorization: `Bearer ${
          process.env.PAT_TOKEN || process.env.GITHUB_TOKEN
        }`,
      },
    }),
  };

  const writer = {
    setOutput: core.setOutput,
    setFailed: core.setFailed,
    debug: core.debug,
    info: core.info,
    log,
    errorMessages: [],
  };

  const areActorAndAuthorFlaggedIn = areActorAndAuthorFlaggedInFunc(
    state,
    writer
  );
  const shouldQueue = shouldQueueFunc(state);
  const projectNextRelayId = await fetchProjectNextRelayId(state, writer).catch(
    (error) => {
      writer.errorMessages.push("Unable to fetch Review Queue Project");
      writer.errorMessages.push(error);
      return null;
    }
  );

  const reader = {
    shouldQueue,
    areActorAndAuthorFlaggedIn,
    projectNextRelayId,
    func: shouldQueue ? queueForReview : dequeueForReview,
  };

  return { state, reader, writer };
};

main(gatherInputs);
