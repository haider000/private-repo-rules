<p align="center">
  <a href="https://github.com/actions/typescript-action/actions"><img alt="typescript-action status" src="https://github.com/actions/typescript-action/workflows/build-test/badge.svg"></a>
</p>

# Create a Pull Request action For a private repo


## To use this action :
  1. make a  ```yml``` file in  ```.github/workflows``` and copy paste this code
  
```yml
name: Pull Requests Rules

on:
  pull_request:
    types: [opened, synchronize, edited, reopened]

jobs:
  rules-check:
    runs-on: ubuntu-latest
    steps:
      - uses: haider000/private-repo-rules@v3
        with:
          rules: '["allow if from brachName to branchName","disallow if from brachName to branchName"]'
```
   
   2. Now change the rule according to your rule for the Pull Request.
     
      ```
      a.  Rules -  this is the input parameter to define the pull request rule
      b.  Rules takes an array of strings in string format as input
      c.  Each value of array is a seprate rule 
      d.  Replace branchName with your respective branch names.
      e.  branchName also could be replace with Regex.
      f.  Each rule starts with "allow" or "disallow"
      g.  Following with a if from then a branchName and then to and again a branch name
      h.  Eg: -->  '["allow if from dev to master", "disallow if from master to dev", "disallow if from (.*) to master"]'
      ```
