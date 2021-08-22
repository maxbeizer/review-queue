const { ALREADY_ADDED_ERROR_MESSAGE } = require("../src/errors");
const { main } = require("../src/main");

const noop = () => {};
let savedLog = [];
const doLog = (...args) => savedLog.push(args);
class AlreadyExistsError extends Error {
  constructor(...params) {
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AlreadyExistsError);
    }

    this.errors = [{ message: ALREADY_ADDED_ERROR_MESSAGE }];
  }
}

beforeEach(() => {
  savedLog = [];
});

const writer = {
  info: (msg) => doLog(msg),
  setOutput: (msg, success) => doLog(msg, success),
  log: noop,
  debug: (msg) => doLog(msg),
  setFailed: (msg) => doLog(msg),
};

const state = {};
const reader = {};

const inputBase = { state, writer, reader };

describe("main", () => {
  it("when actor is not flagged in, it logs and returns early", async () => {
    const inputFunc = async () => {
      return {
        ...inputBase,
        reader: {
          areActorAndAuthorFlaggedIn: false,
        },
      };
    };

    const { state, writer } = await main(inputFunc);
    const [first, second] = savedLog;
    expect(first).toEqual(["User has not been flagged in to the Review Queue"]);
    expect(second).toEqual(["success", true]);
    expect(state.actorNotFlaggedIn).toEqual(true);
  });

  it("when adding already existing item to project, it logs error and sets success true", async () => {
    const inputFunc = async () => {
      return {
        ...inputBase,
        reader: {
          areActorAndAuthorFlaggedIn: true,
          func: async (_state = {}, _reader = {}) => {
            throw new AlreadyExistsError();
          },
        },
      };
    };

    const { state } = await main(inputFunc);
    const [first, second] = savedLog;
    expect(first).toEqual(["The item already exists in the Review Queue."]);
    expect(second).toEqual(["success", true]);
    expect(state.alreadyExists).toEqual(true);
  });

  it("when some other error, it logs error and sets success false", async () => {
    const inputFunc = async () => {
      return {
        ...inputBase,
        reader: {
          areActorAndAuthorFlaggedIn: true,
          func: async (_state = {}, _reader = {}) => {
            throw new Error("wat");
          },
        },
      };
    };

    await main(inputFunc);
    const [first, second] = savedLog;
    expect(first).toEqual(["wat"]);
    expect(second).toEqual(["success", false]);
  });

  it("when sucessful, logs success and message from func", async () => {
    const inputFunc = async () => {
      return {
        ...inputBase,
        reader: {
          areActorAndAuthorFlaggedIn: true,
          func: async (_state = {}, _reader = {}) => {
            return { response: {}, message: "yay" };
          },
        },
      };
    };

    await main(inputFunc);
    const [first, second] = savedLog;
    expect(first).toEqual(["yay"]);
    expect(second).toEqual(["success", true]);
  });
});
