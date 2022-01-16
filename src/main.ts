import * as core from '@actions/core'
import * as github from '@actions/github'

async function run(): Promise<void> {
  try {
    const context = github.context

    if (!context.payload.pull_request) {
      core.setFailed('No PR Found, only run when pull request happens')
      return
    }

    const prFromBranch = context.payload.pull_request.base.ref as string
    const prToBranch = context.payload.pull_request.head.ref as string

    console.log({prFromBranch, prToBranch})

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

    console.log('conditions', conditions)

    let matchedRule = ''
    // it will pass or fail based on the first condition that matches
    for (const condition of conditions) {
      const fromMatch = new RegExp(condition.fromBranch).test(prFromBranch)
      const toMatch = new RegExp(condition.toBranch).test(prToBranch)
      if (fromMatch && toMatch) {
        if (condition.allow) {
          // if a rule matches skip and pass the test
          core.info(`Passed: Rule matched "${condition.rule}"`)
          matchedRule = condition.rule
          break
        } else {
          // otherwise fail the action
          core.setFailed(`Failed: Rule not matched "${condition.rule}"`)
        }
      }
    }

    if (!matchedRule) {
      core.info('Passed: No rules matched')
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
