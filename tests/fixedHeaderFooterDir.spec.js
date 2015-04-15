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
    //expect(topBottomDirectiveFactory.topBottomDirective).toBeDefined();
    console.log(templateTop);
    console.log(fixedHeaderFooterGroup.getInstance('top','oneTop'));
  });
});