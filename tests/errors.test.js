const {
  isAlreadyAddedError,
  ALREADY_ADDED_ERROR_MESSAGE,
} = require("../errors");

describe("isAlreadyAddedError", () => {
  it("when no errors key passed in, returns false", () => {
    const error = {};
    const result = isAlreadyAddedError(error);
    expect(result).toBeFalse;
  });

  it("when no errors list passed in, returns false", () => {
    const errors = [];
    const error = { errors };
    const result = isAlreadyAddedError(error);
    expect(result).toBeFalse;
  });

  it("when first error in errors list has wrong message, returns false", () => {
    const actualError = { message: "error" };
    const errors = [actualError];
    const error = { errors };
    const result = isAlreadyAddedError(error);
    expect(result).toBeFalse;
  });

  it("when first error in errors list has correct message, returns true", () => {
    const actualError = { message: ALREADY_ADDED_ERROR_MESSAGE };
    const errors = [actualError];
    const error = { errors };
    const result = isAlreadyAddedError(error);
    expect(result).toBeTrue;
  });
});
