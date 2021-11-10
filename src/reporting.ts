import * as core from '@actions/core';
import fs from "fs";
import { OwaspReport, VulnerableDependency } from "./parser";


async function findDependencyDefinitions(buildGradle: string, dependencies: VulnerableDependency[]): Promise<Map<string, core.AnnotationProperties>> {
    const buffer = await fs.promises.readFile(buildGradle, { encoding: "utf-8" })
    const lines = buffer.split("\n")
    const result = new Map<string, core.AnnotationProperties>()
    for (const dependency of dependencies) {
        const coordinates_small = `"${dependency.coordinates.groupId}:${dependency.coordinates.artifactId}"`
        const coordinates_full = `"${dependency.coordinates.groupId}:${dependency.coordinates.artifactId}:${dependency.coordinates.version}"`
        let index = 1
        lines: for (const line of lines) {
            let searchString = null
            if (line.includes(coordinates_full)) {
                searchString = coordinates_full
            } else if (line.includes(coordinates_small)) {
                searchString = coordinates_small
            } else {
                continue lines;
            }
            const startColumn = line.indexOf(searchString)
            const endColumn = startColumn + searchString.length
            result.set(coordinates_full, {
                file: buildGradle,
                startLine: index,
                endLine: index,
                startColumn: startColumn,
                endColumn: endColumn
            })
            break lines;
        }

    }
    return result
}

export async function reportToGitHub(report: OwaspReport, buildGradle: string) {
    const annotations = await findDependencyDefinitions(buildGradle, report.dependencies)
    for (const dependency of report.dependencies) {
        const coordinates_full = `"${dependency.coordinates.groupId}:${dependency.coordinates.artifactId}:${dependency.coordinates.version}"`
        const annotation = annotations.get(coordinates_full)
        if (!annotation) {
            core.error(`Annotation not found for ${coordinates_full} in ${JSON.stringify(annotations)}`)
            continue
        }
        for (const vulnerability of dependency.vulnerabilities) {
            core.warning("Found vulnerability", { ...annotation, title: (vulnerability as any).name })
        }
    }
    core.info(`Report: ${JSON.stringify(report)}`)
}