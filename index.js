// Checks API example
// See: https://developer.github.com/v3/checks/ to learn more
/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */
module.exports = (app) => {
  const utils = require('./utils');
  const YAML = require('yaml');
  const axios = require('axios');

  app.on(["check_suite.requested", "check_run.rerequested"], check);
  app.on(["create", "delete"], branch_or_tag_event);
  app.on(["installation", "installation_repositories"], install_change);
  app.on(["pull_request.opened"], pull_request_opened);

  async function pull_request_opened(context) {
    console.log(context.payload);

    try {
      await context.octokit.repos.getContent(
        context.repo({path: '.deepchecks', ref: context.payload.pull_request.head.ref})
      );

      await context.octokit.issues.createComment(
        context.repo({
          issue_number: context.payload.pull_request.number,
          body: '🚀 `.deepchecks` configurations found. I will process and run the required checks accordingly. 🥳'
        })
      )
    }
    catch (error) {

    }
  };
  
  async function install_change(context) {

  };

  async function branch_or_tag_event(context) {

  };

  async function check(context) {
    app.log.info({ event: context.name, payload: context.payload });

    try {
      const content = await context.octokit.repos.getContent(
        context.repo({path: '.deepchecks', ref: context.payload.check_suite.head_branch})
      );

      const yamlFile = await utils.downloadFile(content.data[0].download_url);
      const branches = utils.getWatchedBranches(yamlFile.data);

      console.log(branches);

      let branchMatch = false;
      // First checking if it's a push to a tracked branch
      const tracked_direct_branches = branches['push'];
      
      branchMatch = tracked_direct_branches.includes(context.payload.check_suite.head_branch);

      const tracked_pr_branches = branches['pull_request']
      for (pr of context.payload.check_suite.pull_requests){
        if (tracked_pr_branches.includes(pr.base.ref)) {
          branchMatch = true;
          break;
        }
      }

      console.log(branchMatch);
      if (branchMatch) {

        // Do stuff
        const { head_branch: headBranch, head_sha: headSha } = context.payload.check_suite;
        // Probot API note: context.repo() => {username: 'hiimbex', repo: 'testing-things'}
    
        
        const resp = await context.octokit.checks.create(
          context.repo({
            name: "Deepchecks Tests",
            head_branch: headBranch,
            head_sha: headSha,
            status: "queued",
            details_url: `${process.env.APP_URL}?repo_name=${context.repo().repo}&commit_sha=${headSha}`
          })
        );
        
        console.log(resp);
        
        axios.post(`${process.env.SERVER_URL}/v1/input/trigger`, 
          { 
            runConfiguration: YAML.parse(yamlFile),
            checkId: resp.data.id,
            checkSuite: resp.data.check_suite.id,
            installation: context.payload.installation,
            repo: context.repo()
          }
        );
      }
    }
    catch(err) {
      app.log.info(err);
    }
  }

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
