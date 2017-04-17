angular.module('main', ['n3-pie-chart', 'apojop'])
    .controller('HomeCtrl',['$scope', '$http', '$filter',function ($scope, $http, $filter) {

        $scope.apps = [];
        $scope.cred = {
            user: "",
            password: ""
        };

        var colors = d3.scale.category10();
        $scope.filteredItems = [];

        //data for chart
        $scope.data = [
            {label: "one", value: 12.2, color: colors(0)},
            {label: "two", value: 45, color: colors(1)},
            {label: "three", value: 10, color: colors(2)},
            {label: "four", value: 50, color: colors(3)}
        ];

        $scope.options = {thickness: 15};

        $scope.mySortFunction = function (item) {
            if (isNaN(item[$scope.sortExpression]))
                return item[$scope.sortExpression];
            return parseInt(item[$scope.sortExpression]);
        }

        //watch for search query
        $scope.$watch('q', function (newValue, oldValue) {
            var filteredRecord = $filter('filter')($scope.apps, $scope.q);
            var temp = [];
            for (var i = 0; i < filteredRecord.length; i++) {
                if (temp[filteredRecord[i].price])
                    temp[filteredRecord[i].price] = temp[filteredRecord[i].price] + 1;
                else
                    temp[filteredRecord[i].price] = 1;
            }
            $scope.data = []
            var index = 0;
            Object.keys(temp).forEach(function (key) {
                $scope.data.push({
                    label: key,
                    value: temp[key],
                    color: colors(index)
                });
                index++;
            });
        });

        //used to get the itunes app list
        var getItunesAppList = function(){
            $http.get('https://itunes.apple.com/us/rss/toppaidapplications/limit=100/json').
            success(function (data, status, headers, config) {
                for (var i = 0; i < data.feed.entry.length; i++) {
                    var app = data.feed.entry[i];
                    $scope.apps.push({
                        name: app.title.label,
                        price: app["im:price"].label,
                        category: app.category.attributes.label,
                        date: app["im:releaseDate"].label,
                        thumb: app['im:image'][0].label
                    });
                    $scope.q = "";
                }


                // this callback will be called asynchronously
                // when the response is available
            }).
            error(function (data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
        }

        //invoked on login button of form click
        $scope.login = function () {
            var cred = angular.copy($scope.cred);
            $http.post('/login', cred).
            success(function (data, status, headers, config) {
                if (data.token) { //user loggedin successfully
                    localStorage.token = data.token;
                    $('#login-modal').modal('hide');
                    getItunesAppList();
                } else {
                    //trigger the modal again some internal issue
                    $('#login-modal').modal();
                }
            }).
            error(function (data, status, headers, config) {
                console.log(data);
                if (!localStorage.token) { //auto trigger if missing
                    $('#login-modal').modal();
                }
            });
        };

        $scope.pricedData = [];
    }]);