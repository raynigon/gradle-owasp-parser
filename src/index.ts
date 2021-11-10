import * as core from '@actions/core';


async function main() {
    // Input
    const reportFile = core.getInput('path_report');
    const buildGradleFile = core.getInput('path_build_gradle');
    core.info(`Parse ${reportFile} and validate for ${buildGradleFile}`)
}
main().catch((error) => {
    core.setFailed(error.message);
})