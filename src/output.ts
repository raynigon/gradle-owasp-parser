import { OwaspReport, Vulnerability, VulnerableDependency } from "./parser";
import * as core from '@actions/core';

function generateMarkdownReport(report: OwaspReport): string {
    const prefix = "The following dependencies contain vulnerabilities. Please check if these vulnerabilities are relevant and ignore them if necessary.\n\n"
    const header = "<thead>\n<th>Vulnerability</th>\n<th>Dependency</th>\n<th>Description</th>\n<th>IgnoreXML</th>\n</thead>\n"
    let body = "<tbody>\n"
    for(let dependency of report.dependencies){
        for(let vulnerability of dependency.vulnerabilities) {
            const description = vulnerability.description.replace("\n", "<br />")
            body += "<tr>"
            body += `<td>${vulnerability.name}</td>`
            body += `<td>${dependency.coordinates.groupId}:${dependency.coordinates.artifactId}</td>`
            body += `<td>${description}</td>`
            body += `<td><pre lang="xml">&lt;suppress&gt;&lt;cve>${vulnerability.name}&lt;/cve&gt;&lt;/suppress&gt;</pre></td>`
            body += "</tr>"
        }        
    }
    body += "</tbody>"
    return prefix + "<table>" + header + body + "</table>"
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

/*
The following dependencies contain vulnerabilities. Please check if these vulnerabilities are relevant and ignore them if necessary.
<table>
<tr>
<td>CVE-2022-41946</td>
<td>org.postgresql:postgresql</td>
<td>pgjdbc is an open source postgresql JDBC Driver. In affected versions a prepared statement using eit</td>
<td><pre lang="xml">&lt;suppress&gt;&lt;cve>CVE-2022-41946&lt;/cve&gt;&lt;/suppress&gt;</pre></td>
</tr>
</table>
<!-- Comment-ID: owasp-report-refs/pull/656/merge -->
*/