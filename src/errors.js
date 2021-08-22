const ALREADY_ADDED_ERROR_MESSAGE = "The item already exists in the project.";

const isAlreadyAddedError = (error) => {
  return (
    error.errors &&
    error.errors[0] &&
    error.errors[0].message === ALREADY_ADDED_ERROR_MESSAGE
  );
};

module.exports = exports = {
  isAlreadyAddedError,
  ALREADY_ADDED_ERROR_MESSAGE,
};
