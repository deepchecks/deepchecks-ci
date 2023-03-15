const YAML = require('yaml')
var downloadFileSync = require('download-file-sync');


function getWatchedBranches(yamlStr) {
    try {
        const parsedYaml = YAML.parse(yamlStr);
        const branches = parsedYaml['on']
        return branches;
    }
    catch (error) {
        throw error;
    }
}

function downloadFile(url) {
    return downloadFileSync(url);
}

module.exports = { getWatchedBranches, downloadFile };