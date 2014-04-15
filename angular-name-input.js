(function() {
  'use strict';

  var module = angular.module('tw-name-input', []);

  module.directive('twNameInput', function() {
    return {
      restrict: 'E',
      scope: {
        model: '='
      },
      require: 'ngModel',
      template: '<input ng-model="name">',
      replace: true,
      link: function(scope, el, attr, ctrl) {
        var firstNameField = attr.firstNameField || "firstName";
        var middleNameField = attr.middleNameField || "middleName";
        var lastNameField = attr.lastNameField || "lastName";

        scope.$watch(function() {
          if (!scope.model) {
            return '';
          }

          var name = '';

          if (scope.model[firstNameField]) {
            name += scope.model[firstNameField];
          }

          if (scope.model[middleNameField]) {
            name += ' ' + scope.model[middleNameField];
          }

          if (scope.model[lastNameField]) {
            name += ' ' + scope.model[lastNameField];
          }

          return name;
        }, function(newVal, oldVal) {
          console.log('setting \'%s\'', newVal);
          ctrl.$setViewValue(newVal);
        });

        var one = /^(\w+)$/;
        var two = /^(\w+)\s+(\w+)$/;
        var three = /^(\w+)\s+(\w+)\s+(\w+)$/;

        var setName = function(first, middle, last) {
          if (!scope.model) {
            scope.model = {};
          }

          if (typeof last === 'undefined') {
            last = middle;
            middle = undefined;
          }

          scope.model[firstNameField] = first;
          scope.model[middleNameField] = middle;
          scope.model[lastNameField] = last;
        };

        var parse = function(input) {
          if (!input) {
            setName();

            return;
          }

          var trimmed = input.trim();

          var m;
          if (m = one.exec(trimmed)) {
            setName(m[1]);
          } else if (m = two.exec(trimmed)) {
            setName(m[1], m[2]);
          } else if (m = three.exec(trimmed)) {
            setName(m[1], m[2], m[3]);
          }

          return input;
        };

        ctrl.$parsers.push(parse);
      }
    };
  });
})();
