import * as core from '@actions/core';
import fs from "fs";

interface MavenCoordinate {
    groupId: string,
    artifactId: string,
    version: string | null
}

function parsePackageId(filePath: string): MavenCoordinate | null {
    return null
}

async function parseReport(reportFile: string): Promise<any> {
    const buffer = await fs.promises.readFile(reportFile, { encoding: "utf-8" })
    const report = JSON.parse(buffer as string)
    const dependencies = report["dependencies"]
    if (!dependencies) {
        return null
    }
    for (const dependency of dependencies) {
        if (!("vulnerabilities" in dependency)) {
            continue
        }
        const vulnerabilities = dependency["vulnerabilities"] as Array<any>
        if (vulnerabilities.length == 0) {
            continue
        }
        core.info(`Found ${vulnerabilities.length} vulnerabilities in ${dependency.name}`)
    }
    return null
}

export {
    parseReport
}