# Review Queue

Do you ever wish you had just one place to look for Pull Requests that need review? This action adds reviewable Pull Requests to a specified Project board and removes non-reviewable Pull Requests. So when you are ready, you just have one Project board full of Pull Requests that need review.

What constitutes a reviewable Pull Request? A Pull Request that is neither closed nor merged nor in a draft state. This action runs on various Pull Request and Pull Request Review events to determine if the related Pull Request should be added or removed from the designated Project.

## Inputs

## `project-owner`

**Required** The name of the organization that owns the project. Default `"github"`.

## `project-number`

**Required** The number of the review queue project, e.g. `42`.

## `flagged-in-users`

A comma separated string of user handles who are opted into this action, e.g. `"nat,defunkt"`

## `debug`

A boolean representing whether you want to log lots of debugging information into the action output.

## Example usage

```yml
uses: github/review-queue@v0.1.2
with:
  project-owner: "github"
  project-number: 12345
  flagged-in-users: "maxbeizer,stephenotalora,mattcosta7"
  debug: false
```

## Developing

- `script/bootstrap` to get the dependencies
- `script/test` to run the tests

## Releases

Releases will follow [semver](https://semver.org/). Once a release candidate is finalized, `npm version patch` etc will run the tests, build the dist, commit the bump, and push the code and tags.
