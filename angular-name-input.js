(function() {
  'use strict';

  var module = angular.module('tw-name-input', []);

  module.directive('twNameInput', function() {
    var one = /^(\w+)$/;
    var two = /^(\w+)\s+(\w+)$/;
    var three = /^(\w+)\s+(\w+)\s+(\w+)$/;

    return {
      require: 'ngModel',
      link: function(scope, el, attr, ctrl) {
        var firstNameField = attr.firstNameField || 'firstName';
        var middleNameField = attr.middleNameField || 'middleName';
        var lastNameField = attr.lastNameField || 'lastName';

        var required = {};
        angular.forEach(['first', 'middle', 'last'], function(partName) {
          var attrName = partName + 'Required';

          if (attr[attrName] === '') {
            required[partName] = true;
          } else if (typeof attr[attrName] !== 'undefined') {
            scope.$watch(attr[attrName], function(newVal, oldVal) {
              required[partName] = !!newVal;

              var model = ctrl.$modelValue || {};

              validate({
                first: model[firstNameField],
                middle: model[middleNameField],
                last: model[lastNameField]
              });
            });
          }
        });

        var validate = function(parts) {
          angular.forEach(parts, function(part, partName) {
            if (typeof required[partName] === 'undefined') {
              return;
            }

            var valid;
            if (required[partName]) {
              valid = !!part;
            } else {
              valid = true;
            }

            ctrl.$setValidity(partName + 'Required', valid);
          });
        };

        ctrl.$parsers.push(function(input) {
          input = (input || '').trim();

          // Attempt to parse a full name into name parts
          var m, first, middle, last;
          if (m = one.exec(input)) {
            first = m[1];
          } else if (m = two.exec(input)) {
            first = m[1];
            last = m[2];
          } else if (m = three.exec(input)) {
            first = m[1];
            middle = m[2];
            last = m[3];
          }

          var nameParts = {};
          nameParts[firstNameField] = first;
          nameParts[middleNameField] = middle;
          nameParts[lastNameField] = last;

          validate({
            first: first,
            middle: middle,
            last: last
          });

          return angular.extend({}, ctrl.$modelValue, nameParts);
        });

        var format = function(model) {
          var value = '';

          if (model[firstNameField]) {
            value = model[firstNameField];
          }

          if (model[middleNameField]) {
            value += ' ' + model[middleNameField];
          }

          if (model[lastNameField]) {
            value += ' ' + model[lastNameField];
          }

          return value;
        };

        ctrl.$formatters.push(function(model) {
          return model ? format(model) : '';
        });
      }
    };
  });
})();
