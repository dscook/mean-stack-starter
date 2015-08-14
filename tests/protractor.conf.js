exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: [
        './specs/example.spec.js'
    ],
    baseUrl: "http://localhost:8080",
    browserName: "chrome",
    // Options to be passed to Jasmine-node.
    jasmineNodeOpts: {
        showColors: true, // Use colors in the command line report.
        isVerbose: true, // Show results for each test
        includeStackTrace: true
    }
};
