angular
    .module('app.users')
    .controller('app.users.controller', ['$scope', 'users',
        // Users is resolved in the module definition
        function ($scope, users) {
            // Make the users obtained from the service layer available to the view
            $scope.users = users;
        }
    ]);
