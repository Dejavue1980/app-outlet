const childProcess = require('child_process');
const yaml = require('js-yaml');
const { XMLParser } = require('fast-xml-parser');
const { from } = require('rxjs');
const { map, mergeMap, filter } = require('rxjs/operators');

const xml = new XMLParser();

function runCommand(command) {
    return new Promise((resolve, reject) => {
        childProcess.exec(command, (error, stdout, stderr) => {
            if (error || stderr) {
                reject(error || stderr);
            } else {
                resolve(stdout);
            }
        });
    });
}

function findAllApps() {
    const commandPromise = runCommand("appstreamcli search '*'");

    return from(commandPromise).pipe(
        map((result) => result.split('---')),
        mergeMap((resultArray) => resultArray),
        map((appString) => {
            try {
                return yaml.load(appString);
            } catch (e) {
                return null;
            }
        }),
        filter((app) => app != null),
        map((appSearchResult) => {
            appSearchResult.Identifier =
                appSearchResult.Identifier.split(' ')[0];

            return appSearchResult;
        }),
        mergeMap((appSearchResult) =>
            runCommand(`appstreamcli dump ${appSearchResult.Identifier}`),
        ),
        map((appXml) => xml.parse(appXml)),
    );
}

module.exports = {
    findAllApps,
};
