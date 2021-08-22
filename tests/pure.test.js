const { areActorAndAuthorFlaggedInFunc, shouldQueueFunc } = require("../pure");

const noop = () => {};
const log = noop;
const actor = "actor";
const author = "author";
let pull_request = { user: { login: author } };
const action = "closed";
let reviewState = "anything but approved";
let review = { state: reviewState };
let errorMessages = [];

beforeEach(() => {
  errorMessages = [];
});

describe("areActorAndAuthorFlaggedInFunc", () => {
  it("when neither actor nor author is not flagged in, it returns false and adds to errorMessages", () => {
    const flaggedInList = "foobar";
    const result = areActorAndAuthorFlaggedInFunc(
      { actor, flaggedInList, pull_request },
      { log, errorMessages }
    );
    expect(result).toBe(false);
    expect(errorMessages).toContain(
      `${author} is not flagged into the Review Queue`
    );
    expect(errorMessages).toContain(
      `${actor} is not flagged into the Review Queue`
    );
  });

  it("when actor is not flagged in, it returns false and adds to errorMessages", () => {
    const flaggedInList = author;
    const result = areActorAndAuthorFlaggedInFunc(
      { actor, flaggedInList, pull_request },
      { log, errorMessages }
    );
    expect(result).toBe(false);
    expect(errorMessages).not.toContain(
      `${author} is not flagged into the Review Queue`
    );
    expect(errorMessages).toContain(
      `${actor} is not flagged into the Review Queue`
    );
  });

  it("when author is not flagged in, it returns false and adds to errorMessages", () => {
    const flaggedInList = actor;
    const result = areActorAndAuthorFlaggedInFunc(
      { actor, flaggedInList, pull_request },
      { log, errorMessages }
    );
    expect(result).toBe(false);
    expect(errorMessages).toContain(
      `${author} is not flagged into the Review Queue`
    );
    expect(errorMessages).not.toContain(
      `${actor} is not flagged into the Review Queue`
    );
  });

  it("when actor and author are flagged in, it returns true and adds not to errorMessages", () => {
    const flaggedInList = [actor, author].join(",");
    const result = areActorAndAuthorFlaggedInFunc(
      { actor, flaggedInList, pull_request },
      { log, errorMessages }
    );
    expect(result).toBe(true);
    expect(errorMessages.length).toBe(0);
  });
});

describe("shouldQueueFunc", () => {
  it('when the action is "closed" it returns false', () => {
    const result = shouldQueueFunc({ action, pull_request, review });
    expect(result).toBe(false);
  });

  it('when the action is "converted_to_draft" it returns false', () => {
    const result = shouldQueueFunc({
      action: "converted_to_draft",
      pull_request,
      review,
    });
    expect(result).toBe(false);
  });

  it('when the action is "open" and PR is draft it returns false', () => {
    const result = shouldQueueFunc({
      action: "converted_to_draft",
      pull_request: { ...pull_request, draft: true },
      review,
    });
    expect(result).toBe(false);
  });

  it('when the reviewState is "approved" it returns false', () => {
    const result = shouldQueueFunc({
      action,
      pull_request,
      review: { state: "approved" },
    });
    expect(result).toBe(false);
  });

  it("when PR is draft it returns false", () => {
    const result = shouldQueueFunc({
      action: "someotheraction",
      pull_request: { ...pull_request, draft: true },
      review,
    });
    expect(result).toBe(false);
  });
});
