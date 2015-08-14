exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: [
    // Insert test specs here
    ],
    baseUrl: "http://localhost:8080",
    onPrepare: function () {
        require('protractor-uisref-locator')(protractor);
    },
    browserName: "chrome",
    // Options to be passed to Jasmine-node.
    jasmineNodeOpts: {
        showColors: true, // Use colors in the command line report.
        isVerbose: true, // Show results for each test
        includeStackTrace: true
    }
};
