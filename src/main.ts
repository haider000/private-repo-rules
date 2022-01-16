import * as core from '@actions/core'
import * as github from '@actions/github'

async function run(): Promise<void> {
  try {
    const github_token = core.getInput('GITHUB_TOKEN')
    const ocktoKit = github.getOctokit(github_token)
    const context = github.context
    const sha = context.sha
    console.log(context.payload.pull_request)
    console.log(context.payload.pull_request?.base)
    console.log(context.payload.pull_request?.head)
    console.log(context.repo.owner, context.repo.repo, sha)
    const result =
      await ocktoKit.rest.repos.listPullRequestsAssociatedWithCommit({
        owner: context.repo.owner,
        repo: context.repo.repo,
        commit_sha: sha
      })

    console.log(result.data)
    const pullRequests = result.data.filter(
      pullRequest => pullRequest.state === 'open'
    )

    console.log(pullRequests)

    const pr = pullRequests.length > 0 && pullRequests[0]

    if (!pr) return

    const prFromBranch = pr.base.ref
    const prToBranch = pr.head.ref

    console.log(JSON.stringify({prFromBranch, prToBranch}))

    const rulesInput = core.getInput('rules')
    const rules = JSON.parse(rulesInput) as string[]

    // convert to an array
    const conditions = rules.map(str => {
      const arr = str.split(' ') // [ 'allow', 'if', 'from', 'dev', 'to', 'master' ]
      const allow = arr[0] === 'allow'
      const fromBranch = arr[3]
      const toBranch = arr[5]
      return {allow, fromBranch, toBranch, rule: str}
    })

    console.log(JSON.stringify(conditions))

    let matchedRule = ''
    // it will pass or fail based on the first condition that matches
    for (const condition of conditions) {
      const fromMatch = new RegExp(condition.fromBranch).test(prFromBranch)
      const toMatch = new RegExp(condition.toBranch).test(prToBranch)
      if (fromMatch && toMatch) {
        if (condition.allow) {
          // if a rule matches skip and pass the test
          core.debug(`Passed: Rule matched "${condition.rule}"`)
          matchedRule = condition.rule
          break
        } else {
          // otherwise fail the action
          core.setFailed(`Failed: Rule not matched "${condition.rule}"`)
        }
      }
    }

    if (!matchedRule) {
      core.debug('Passed: No rules matched')
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
