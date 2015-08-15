// The main application module that contains the next level of sub-modules for child states.
// The purpose of this state is to include global application dependencies and global configuration.
angular
    .module('app', [
            // External dependencies
            'ui.router',
            'ngResource',
            'ngSanitize',
            'ngAnimate',
            'foundation',
            // Application child module dependencies, i.e. the next level in the state tree
            // In our application this is a single state
            'app.users'
        ]
    )
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
        function ($stateProvider, $urlRouterProvider, $locationProvider) {
            // Declare this root state of all sub-modules abstract, i.e. we cannot navigate to it
            $stateProvider.state('app', {
                url: '',
                template: '<div data-ui-view class="grid-block"></div>',
                abstract: true
            });
            
            // Enable HTML5 mode
            $locationProvider.html5Mode(true).hashPrefix('!');

            // Ensure we go to the users child state when just the base url is typed
            $urlRouterProvider
                .when('', '/users')
                .when('/', '/users');
        }
    ])
    .run([function () {
            // Use fast click so there is no debounce period when users tap mobile devices
            FastClick.attach(document.body);
        }
    ]);
