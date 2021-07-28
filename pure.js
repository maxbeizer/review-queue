const {inspect} = require('util')

/**
* Ok not technically pure since it does log, this function take in the list of
* the flagged in uers and check them against the actor and the PR author. If
* there is no flagged in list or both users are flagged in, it returns true.
* Othwerwise it returns false.

* It also updates the writer object by populating the errorMessages array if a
* user was not flagged in.
*/
const areActorAndAuthorFlaggedInFunc = ({actor, flaggedInList, pull_request}, {log, errorMessages}) => {
  if (!flaggedInList || flaggedInList === '') {
    log('Action is not gated for any users')
    return true
  }

  log('flagged in list', inspect(flaggedInList))
  const flaggedInUsers = flaggedInList.split(',')
  flaggedInUsers.forEach(u => log(`flagged in ${u.split('').reverse().join('')}`))
  const {user: author} = pull_request
  log('pull_request', pull_request)

  const nonFlaggedInUsers = [actor, author.login].reduce((acc, login) => {
    if (!flaggedInUsers.includes(login)) {
      errorMessages.push(`${login} is not flagged into the Review Queue`)
      acc.push(login)
    }
    return acc
  }, [])
  return nonFlaggedInUsers.length === 0
}

/**
 * Gather the state of the PR from inputs and determine if it should be added to
 * the queue or removed.
 */
const shouldQueueFunc = ({action, pull_request, review}) => {
  const reviewState = review && review.state

  if (
    action === 'closed' ||
    action === 'converted_to_draft' ||
    (action === 'opened' && pull_request.draft) ||
    reviewState === 'approved'
  ) {
    return false
  }

  return true
}

module.exports = exports = {
  areActorAndAuthorFlaggedInFunc,
  shouldQueueFunc
}
