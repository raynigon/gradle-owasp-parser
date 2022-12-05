import { OwaspReport, Vulnerability, VulnerableDependency } from "./parser";
import * as core from '@actions/core';

function generateMarkdownReport(report: OwaspReport): string {
    const prefix = "The following depencies contain vulnerabilities "
    const header = "| Vulnerability | Dependency | Description |\n" +
                   "| ------------- | ---------- | ----------- |\n";
    let body = ""
    for(let dependency of report.dependencies){
        for(let vulnerability of dependency.vulnerabilities) {
            body += `| ${vulnerability.name} | ${dependency.coordinates.groupId}:${dependency.coordinates.artifactId} | ${vulnerability.description} |\n`

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