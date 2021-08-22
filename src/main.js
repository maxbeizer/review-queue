const { isAlreadyAddedError } = require("./errors");

exports.main = async (inputFunc) => {
  const { state, reader, writer } = await inputFunc();
  const { log, debug, info, setFailed, setOutput, errorMessages } = writer;
  log(`state/reader`, { state, reader });

  try {
    if (!reader.areActorAndAuthorFlaggedIn) {
      info("User has not been flagged in to the Review Queue");
      setOutput("success", true);
      state["actorNotFlaggedIn"] = true;
      return;
    }

    const { response, message } = await reader.func(state, reader, writer);

    log(`response`, response);
    log(`message`, message);
    info(message);
    setOutput("success", true);
    setOutput("messages", message);
  } catch (error) {
    log("error", error);

    // Item already exists on project so return success
    if (isAlreadyAddedError(error)) {
      debug("The item already exists in the Review Queue.");
      setOutput("success", true);
      setOutput("messages", "The item already exists in the Reivew Queue");
      state["alreadyExists"] = true;
      return;
    }

    setFailed(error.message);
    setOutput("success", false);
    if (errorMessages) setOutput("messages", errorMessages.join(". "));

    return { state, reader, writer };
  } finally {
    if (errorMessages && errorMessages.length > 0) {
      info("Error messages:");
      for (const message of errorMessages) {
        info(message);
      }
    }
    return { state, reader, writer };
  }
};
