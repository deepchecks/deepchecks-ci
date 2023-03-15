const YAML = require('yaml')
const axios = require('axios');

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

async function downloadFile(url) {
    return await axios.get(url);
}

module.exports = { getWatchedBranches, downloadFile };