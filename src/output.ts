import { OwaspReport, Vulnerability, VulnerableDependency } from "./parser";
import * as core from '@actions/core';

function generateMarkdownReport(report: OwaspReport): string {
    const prefix = "The following dependencies contain vulnerabilities. Please check if these vulnerabilities are relevant and ignore them if necessary.\n\n"
    const header = "| Vulnerability | Dependency | Description | IgnoreXML |\n" +
                   "| ------------- | ---------- | ----------- | --------- |\n";
    let body = ""
    for(let dependency of report.dependencies){
        for(let vulnerability of dependency.vulnerabilities) {
            let description = vulnerability.description.replace("\n", " ")
            if (description.length > 100) {
                description = description.substring(0, 100) + "..."
            }
            body += `| ${vulnerability.name} | ${dependency.coordinates.groupId}:${dependency.coordinates.artifactId} `+
                    `| ${description} | \`<suppress><cve>${vulnerability.name}</cve></suppress>\` |\n`

        }        
    }
    return prefix + header + body
}

export async function writeOutput(report: OwaspReport) {
    const vulnerabilities = new Set(report.dependencies
        .flatMap((item: VulnerableDependency) => item.vulnerabilities)
        .map((item: any) => item["name"]))
    core.setOutput("vulnerability_count", report.dependencies.length)
    core.setOutput("vulnerable_dependencies", vulnerabilities.size)
    core.setOutput("vulnerabilities", Array.from(vulnerabilities).join(' '))
    core.setOutput("report_markdown", generateMarkdownReport(report))
}