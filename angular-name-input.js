(function() {
  'use strict';

  var module = angular.module('tw-name-input', []);

  module.directive('twNameInput', function($parse, $timeout) {
    var one = /^(\w+)$/;
    var two = /^(\w+)\s+(\w+)$/;
    var three = /^(\w+)\s+(\w+)\s+(\w+)$/;

    return {
      require: 'ngModel',
      link: function(scope, el, attr, ctrl) {
        if (!attr.twNameInput) {
          return;
        }

        var getter = $parse(attr.twNameInput);
        var setter = getter.assign;

        var firstNameField = attr.firstNameField || 'firstName';
        var middleNameField = attr.middleNameField || 'middleName';
        var lastNameField = attr.lastNameField || 'lastName';

        var fixCap, fixCapAttr = attr.fixCap;
        if (typeof fixCapAttr === 'undefined') {
          fixCap = false;
        } else if (fixCapAttr.length) {
          fixCap = !!(scope.$eval(attr.fixCap));
        } else {
          fixCap = true;
        }

        var required = {};
        angular.forEach(['first', 'middle', 'last'], function(partName) {
          var attrName = partName + 'Required';

          if (attr[attrName] === '') {
            required[partName] = true;
          } else if (typeof attr[attrName] !== 'undefined') {
            scope.$watch(attr[attrName], function(newVal, oldVal) {
              required[partName] = !!newVal;

              var model = getter(scope);

              validate({
                first: model[firstNameField],
                middle: model[middleNameField],
                last: model[lastNameField]
              });
            });
          }
        });

        var lower = /^[a-z]+$/;
        var upper = /^[A-Z]{2,}$/;
        var maybeFixCapitalization = function(name) {
          if (!fixCap) {
            return name;
          }

          // If the name is all lower or all upper case
          if (name && lower.test(name) || upper.test(name)) {
            var fixed = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

            return fixed;
          }

          return name;
        };

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

        var interpret = function(input) {
          var value = (input || '');

          // Attempt to parse a full name into name parts
          var m, first, middle, last;
          if (m = one.exec(value)) {
            first = maybeFixCapitalization(m[1]);
          } else if (m = two.exec(value)) {
            first = maybeFixCapitalization(m[1]);
            last = maybeFixCapitalization(m[2]);
          } else if (m = three.exec(value)) {
            first = maybeFixCapitalization(m[1]);
            middle = maybeFixCapitalization(m[2]);
            last = maybeFixCapitalization(m[3]);
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

          setter(scope, angular.extend(getter(scope) || {}, nameParts));
        };

        var format = function(model) {
          if (!model) {
            return '';
          }

          var value = '';

          if (model[firstNameField]) {
            value += model[firstNameField];
          }

          if (model[middleNameField]) {
            value += ' ' + model[middleNameField];
          }

          if (model[lastNameField]) {
            value += ' ' + model[lastNameField];
          }

          return value;
        };

        var parsed;
        ctrl.$parsers.push(function(input) {
          interpret(input);
          parsed = true;

          return input;
        });

        ctrl.$formatters.push(function(input) {
          interpret(input);

          return input;
        });

        var nameModelGetter = $parse(attr.ngModel);
        var nameModelSetter = nameModelGetter.assign;

        var simpleUpdate = function(newVal) {
          // Manually update viewValue, modelValue, model, and run $render (no need to go through parsers)
          ctrl.$viewValue = newVal;
          ctrl.$modelValue = newVal;
          nameModelSetter(scope, newVal);
        };

        // Watch for changes to the model
        scope.$watch(attr.twNameInput, function(newVal, oldVal) {
          // Initially, newVal === oldVal
          if (newVal !== oldVal && !parsed) {
            var formatted = format(newVal);
            simpleUpdate(formatted);

            ctrl.$render();

            validate({
              first: newVal[firstNameField],
              middle: newVal[middleNameField],
              last: newVal[lastNameField]
            });
          }

          parsed = false;
        });

        // Jumpstart with whatever is initially in the model
        var initialModel = getter(scope);
        if (typeof initialModel !== 'undefined') {
          simpleUpdate(format(initialModel));

          validate({
            first: initialModel[firstNameField],
            middle: initialModel[middleNameField],
            last: initialModel[lastNameField]
          });

          // This needs to timeout to be sure it runs after the ngModel directive has been applied (and we have the appropriate $render() function, not noop)
          $timeout(function() {
            ctrl.$render();
          });
        }
      }
    };
  });
})();
