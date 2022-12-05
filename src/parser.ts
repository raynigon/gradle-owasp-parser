import * as core from '@actions/core';
import fs from "fs";

export interface OwaspReport {
    dependencies: VulnerableDependency[]
}

export interface VulnerableDependency {
    coordinates: MavenCoordinate
    vulnerabilities: Vulnerability[]
}

export interface MavenCoordinate {
    groupId: string,
    artifactId: string,
    version: string | null
}

export interface Vulnerability {
    source: string,
    name: string,
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
    description: string
}

function parseMavenCoordinates(filepath: string): MavenCoordinate | null {
    const parts = filepath.split("/")
    let state = 0
    let group_name = null
    let artifact_name = null
    let version = null
    for (const item of parts) {
        if (item == "") {
            state = 0
            continue
        }
        if (item == ".gradle") {
            state = 1
            continue
        } if (item == "caches" && state == 1) {
            state = 2
            continue
        } if (item == "modules-2" && state == 2) {
            state = 3
            continue
        } if (item == "files-2.1" && state == 3) {
            state = 4
            continue
        } if (state == 4) {
            group_name = item
            state = 5
            continue
        } if (state == 5) {
            artifact_name = item
            state = 6
            continue
        } if (state == 6) {
            version = item.replace(artifact_name + "-", "").replace(".jar", "")
            state = 6
            continue
        }
    }
    if (group_name == null || artifact_name == null) {
        core.warning(`Unable to parse filepath: ${filepath}`)
        return null
    }
    return {
        groupId: group_name,
        artifactId: artifact_name,
        version: version
    }
}

export async function parseReport(reportFile: string): Promise<OwaspReport> {
    const buffer = await fs.promises.readFile(reportFile, { encoding: "utf-8" })
    const report = JSON.parse(buffer as string)
    const dependencies = report["dependencies"]
    if (!dependencies) {
        return { dependencies: [] }
    }
    const result: Array<VulnerableDependency> = []
    for (const dependency of dependencies) {
        if (!("vulnerabilities" in dependency)) {
            continue
        }
        const vulnerabilities = dependency["vulnerabilities"] as Array<any>
        if (vulnerabilities.length == 0) {
            continue
        }
        const mavenCoordinates = parseMavenCoordinates(dependency["filePath"])
        if (mavenCoordinates == null) continue;
        core.info(`Found ${vulnerabilities.length} vulnerabilities in ${dependency["fileName"]}`)
        result.push({
            coordinates: mavenCoordinates as MavenCoordinate,
            vulnerabilities: vulnerabilities
        })
    }
    return { dependencies: result }
}