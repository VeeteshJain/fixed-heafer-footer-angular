console.log('yes');
describe('fixedHeaderFooterGroup service tests,', function (){
  console.log('describe');
  var fixedHeaderFooterGroup;
  beforeEach(function(){
    console.log('beforeEach');
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


describe('fixedHeaderFooterGroup service tests,', function (){
  console.log('describe');
  var fixedHeaderFooterGroup;
  beforeEach(function(){
    console.log('beforeEach');
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