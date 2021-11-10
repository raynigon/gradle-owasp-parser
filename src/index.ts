import * as core from '@actions/core';
import { parseReport } from './parser';


async function main() {
    // Input
    const reportFile = core.getInput('path_report');
    const buildGradleFile = core.getInput('path_build_gradle');
    core.info(`Parse ${reportFile} and validate for ${buildGradleFile}`)

    // Logic
    const report = await parseReport(reportFile)
    core.info(`Report: ${JSON.stringify(report)}`)
}
main()
    .then(() => {
        core.info("Finished parsing")
    }).catch((error) => {
        core.setFailed(error.message);
    })