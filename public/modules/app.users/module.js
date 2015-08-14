// The users child state
angular
    .module('app.users', [])
    .config([
        '$stateProvider',
        function ($stateProvider) {
            $stateProvider.state('app.users', {
                url: '/users',
                templateUrl: '/modules/app.users/view.html',
                controller: 'app.users.controller',
                // Resolves enable us to initialise data before the view is loaded
                resolve: {
                    // Every time this state is loaded we will create a new user by calling the service layer
                    createUser: ['$resource', function ($resource) {
                        var User = $resource('/api/users/:userId');
                        var newUser = new User({ firstname: 'Test', lastname: 'User' });
                        // Returning the promise ensures the resolve blocks until we have completed
                        // the service layer call
                        return newUser.$save().$promise;
                    }],
                    // Once the new user is created we return all users, from the service layer, to display on the page
                    users: ['$resource', function ($resource) {
                        var User = $resource('/api/users/:userId');
                        return User.query().$promise;
                    }],
                }
            });
        }
    ]);
