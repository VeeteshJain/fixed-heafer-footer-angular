describe('fixedHeaderFooterGroup service tests,', function (){
  var fixedHeaderFooterGroup;
  beforeEach(function(){
    angular.mock.module('ui.bootstrap.position');
    angular.mock.module('fixedHeaderFooter');
    inject(function(_fixedHeaderFooterGroup_){
      fixedHeaderFooterGroup = _fixedHeaderFooterGroup_;
    });
  });
  it('should have an getInstance function', function () {
    expect(fixedHeaderFooterGroup.getInstance).toBeDefined();
  });
  it('should have an addInstance function', function () {
    expect(fixedHeaderFooterGroup.addInstance).toBeDefined();
  });
  it('should have an addInstance function', function () {
    expect(fixedHeaderFooterGroup.addInstance).toBeDefined();
    var parameters = ['top', {
      'Ids': ['tableOne']
    }, {
      'el': 'test'
    }, {
      'attrs': 'test'
    }];
    fixedHeaderFooterGroup.addInstance.apply(this, parameters);
    expect(fixedHeaderFooterGroup.getInstance('top', 'tableOne')).toEqual(parameters);
  });
  it('getInstance function should return undefined if parameters are not passed', function () {
    expect(fixedHeaderFooterGroup.getInstance()).toEqual(undefined);
    expect(fixedHeaderFooterGroup.getInstance('top')).toEqual(undefined);
  });
});

describe('topBottomDirective Factory tests,', function (){
  console.log('describe');
  var topBottomDirectiveFactory;
  beforeEach(function(){
    console.log('beforeEach');
    angular.mock.module('ui.bootstrap.position');
    angular.mock.module('fixedHeaderFooter');
    inject(function(_topBottomDirectiveFactory_){
      topBottomDirectiveFactory = _topBottomDirectiveFactory_;
    });
  });
  it('should have an topBottomDirective function', function () {
    expect(topBottomDirectiveFactory.topBottomDirective).toBeDefined();
  });
  it('generate top directive.', function () {
    var topDirective = topBottomDirectiveFactory.topBottomDirective('top');
    expect(topDirective.scope).toBeDefined();
    expect(topDirective.controller).toBeDefined();
    expect(topDirective.scope.Ids).toEqual('=fixedHeaderFooterTop');
  });
  it('generate bottom directive.', function () {
    var bottomDirective = topBottomDirectiveFactory.topBottomDirective('bottom');
    expect(bottomDirective.scope).toBeDefined();
    expect(bottomDirective.controller).toBeDefined();
    expect(bottomDirective.scope.Ids).toEqual('=fixedHeaderFooterBottom');
  });
});

describe('fixedHeaderFooterTop Directive tests,', function (){
  console.log('describe');
  var fixedHeaderFooterGroup,
  topBottomDirectiveFactory,
  scope,
  elementTop,
  elementBottom,
  templateTop,
  templateBottom,
  controllerTop,
  controllerBottom;
  beforeEach(function(){
    console.log('beforeEach');
    angular.mock.module('ui.bootstrap.position');
    angular.mock.module('fixedHeaderFooter');
    inject(function($rootScope, $compile, _fixedHeaderFooterGroup_, _topBottomDirectiveFactory_){
      fixedHeaderFooterGroup = _fixedHeaderFooterGroup_;
      topBottomDirectiveFactory = _topBottomDirectiveFactory_;
      scope = $rootScope.$new();
      scope.fixedHeaderFooterTopIds = ['oneTop'];
      scope.fixedHeaderFooterBottomIds = ['oneBottom'];
      elementTop = angular.element('<div fixed-header-footer-top="fixedHeaderFooterTopIds" style="width:200px;height:60px"></div>');
      elementBottom = angular.element('<div fixed-header-footer-bottom="fixedHeaderFooterBottomIds" style="width:1024px;height:40px"></div>');
      templateTop = $compile(elementTop)(scope);
      templateBottom = $compile(elementBottom)(scope);
      scope.$digest();
      controllerTop = elementTop.controller;
      controllerBottom = elementBottom.controller;
    });
  });
it('should fixedHeaderFooterTop', function () {
  var topInstance = fixedHeaderFooterGroup.getInstance('top','oneTop');
  var bottomInstance = fixedHeaderFooterGroup.getInstance('bottom','oneBottom');
  expect(topInstance[1].Ids).toBeDefined();
  expect(topInstance[1].Ids).toEqual(['oneTop']);
  expect(bottomInstance[1].Ids).toBeDefined();
  expect(bottomInstance[1].Ids).toEqual(['oneBottom']);
});
});

describe('fixedHeaderFooter Directive tests,', function (){
  console.log('describe');
  var fixedHeaderFooterGroup,
  topBottomDirectiveFactory,
  scope,
  element,
  template,
  optionsRef,
  refreshCallbackRef,
  timeout,
  $window;
  beforeEach(function(){
    console.log('beforeEach');
    angular.mock.module('ui.bootstrap.position');
    angular.mock.module('fixedHeaderFooter');
    inject(function($rootScope, $compile, $timeout, _$window_, _fixedHeaderFooterGroup_, _topBottomDirectiveFactory_){
      timeout = $timeout;
      $window = _$window_;
      fixedHeaderFooterGroup = _fixedHeaderFooterGroup_;
      topBottomDirectiveFactory = _topBottomDirectiveFactory_;
      scope = $rootScope.$new();
      scope.fixedHeaderFooterOne = {
        topId: 'oneTop',
        bottomId: 'oneBottom',
        type: 'thead-tfoot',
        onRegisterApi: function(options, refreshCallback){
          optionsRef = options;
          refreshCallbackRef = refreshCallback;
        }
      };
      scope.tableOne = {
        'height': 300,
        'width': 300
      };
      spyOn(scope.fixedHeaderFooterOne, 'onRegisterApi').andCallThrough();
      element = angular.element('<tablecontainer><div ng-style="{\'height\':tableOne.height+\'px\',\'width\':tableOne.width+\'px\'}"><table fixed-header-footer="fixedHeaderFooterOne"> <thead> <tr> <th>Month</th> <th>Savings</th> </tr></thead> <tbody> <tr> <td>January</td><td>$100</td></tr><tr> <td>February</td><td>$80</td></tr></tbody><tfoot> <tr> <td>Sum</td><td>$180</td></tr></tfoot></table></div></tablecontainer>');
      template = $compile(element)(scope);
      scope.$digest();
    });
});
it('should compile.', function () {
  expect(scope.fixedHeaderFooterOne.onRegisterApi).toHaveBeenCalled();
  expect(scope.fixedHeaderFooterOne.onRegisterApi).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(Function));
  refreshCallbackRef();
});
it('should exposes refreshCallback function.', function () {
  refreshCallbackRef();
});
it('should unbind the events on scope destroy.', function () {
  scope.$destroy();
});
it('should trigger refreshCallback after 100 clock unit.', function () {
  timeout.flush();
});
it('should trigger refreshCallback on window resize.', function () {
  $window.scroll();
});
});