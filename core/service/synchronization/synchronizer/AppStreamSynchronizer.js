const appStreamRepository = require('../../../repository/appstream/AppStreamRepository');
const applicationRepository = require('../../../repository/application/ApplicationRepository');

const { map, toArray, mergeMap } = require('rxjs/operators');

const Application = require('../../../model/Application');
const ApplicationStore = require('../../../model/ApplicationStores');
const PackageType = require('../../../model/PackageType');

function parseDescription(descriptionArray) {
    return [...new Set(descriptionArray)];
}

function parseIcon(iconArray) {
    return iconArray.find((icon) => icon.startsWith('http'));
}

function parseScreenshots(screenshorArray) {}

function mapToAppOutletApplication(appStreamApplication) {
    const app = appStreamApplication.component;
    const appOutletApp = new Application(
        app.id,
        app.name,
        app.summary,
        parseDescription(app.description.p),
        null,
        app.project_license,
        null,
        null,
        null,
        parseIcon(app.icon),
        null,
        null,
        null,
        null,
        app.categories.category,
        parseScreenshots(app.screenshots.screenshot.image),
    );
    appOutletApp.store = ApplicationStore.APPSTREAM;
    appOutletApp.packageType = PackageType.DISTRO_NATIVE;
    return appOutletApp;
}

function startSynchronization() {
    return appStreamRepository.findAllApps().pipe(
        map((appstreamApp) => mapToAppOutletApplication(appstreamApp)),
        toArray(),
        mergeMap(applicationRepository.save),
    );
}

module.exports = {
    startSynchronization,
};
