import * as core from '@actions/core';
import { writeOutput } from './output';
import { parseReport } from './parser';
import { reportToGitHub } from './reporting';


async function main() {
    // Input
    const failOnVulnerability = core.getInput('fail_on_vulnerabilities').toLowerCase().trim() == "true"
    const reportFile = core.getInput('path_report');
    const buildGradleFile = core.getInput('path_build_gradle');
    core.info(`Parse ${reportFile} and validate for ${buildGradleFile}`)

    // Logic
    const report = await parseReport(reportFile)
    await reportToGitHub(report, buildGradleFile)
    await writeOutput(report)
    if (report.dependencies.length > 0 && failOnVulnerability) {
        core.setFailed(`Vulnerabilities were found in ${report.dependencies.length} dependencies`)
    }
}
main()
    .then(() => {
        core.info("Finished parsing")
    }).catch((error) => {
        core.setFailed(error.message);
    })