console.log('main');
angular.module('fixedHeaderFooter', ['ui.bootstrap.position'])
.service('fixedHeaderFooterGroup', function(){
  var instances = {
    'top': {},
    'bottom': {}
  };
  function getInstance(type, id){
    return (type && id) ? instances[type][id] : undefined;
  }
  function addInstance(type, scope, el, attrs){
    var args = arguments;
    angular.forEach(scope.Ids, function(id, index){
      instances[type][id] = args;
    });
  }
  return {
    getInstance: getInstance,
    addInstance: addInstance
  };
})
.directive('fixedHeaderFooterTop', ['topBottomDirectiveFactory', function(topBottomDirectiveFactory){
  return topBottomDirectiveFactory.topBottomDirective('top');
}])
.directive('fixedHeaderFooterBottom', ['topBottomDirectiveFactory', function(topBottomDirectiveFactory){
  return topBottomDirectiveFactory.topBottomDirective('bottom');
}])
.factory('topBottomDirectiveFactory', function(){
  var topBottomDirective = function(type){
    return{
      scope: {
        Ids: type === 'top' ? '=fixedHeaderFooterTop' : '=fixedHeaderFooterBottom'
      },
      controller: function($scope, $element, $attrs, fixedHeaderFooterGroup){
        fixedHeaderFooterGroup.addInstance(type, $scope, $element, $attrs);
      }
    };
  };
  return{
    topBottomDirective: topBottomDirective
  };
})
.directive('fixedHeaderFooter',['$timeout','$compile','$window', '$position', 'fixedHeaderFooterGroup', function($timeout, $compile, $window, $position, fixedHeaderFooterGroup){
  function link(scope, el, attrs){
    var cloneNode = el.clone();
    //clear the body content
    cloneNode.find('tbody').empty();
    //remove the directive name to prevent infinite re-compile direcrive
    cloneNode.removeAttr('fixed-header-footer');
    //add default css
    cloneNode.css({
      'background-color': el[0].style.backgroundColor === '' ? 'white' : el[0].style.backgroundColor,
      'z-index': scope.fixedHeaderFooterOptions.zIndex === undefined ? 1001 : scope.fixedHeaderFooterOptions.zIndex,
      'margin-bottom': 0
    });
    var cloneHeadFoot = {
      'thead': cloneNode.clone(),
      'tfoot': cloneNode.clone()
    };
    cloneHeadFoot.thead.find('tfoot').empty();
    cloneHeadFoot.tfoot.find('thead').empty();
    //cloneHeadFoot.tfoot.css({'background-color':'blue'});

    //compile the cloned header and footer with controller scope
    var elHead = $compile(cloneHeadFoot.thead)(scope.$parent, function(){});
    var elFoot = $compile(cloneHeadFoot.tfoot)(scope.$parent, function(){});

    //prepare table container
    var tablecontainer = el.parent().parent();
    tablecontainer.wrap('<div style="position: relative;clear: both;overflow:scroll"></div>');

    //append compiled header footer to table container
    tablecontainer.append(elHead);
    tablecontainer.append(elFoot);
    //el.parent().after(elHead);
    //el.parent().after(elFoot);

    //add position css to cloned element and prepare the header and footer reference
    elHead = elHead.wrap('<div style="position: absolute"></div>').parent().wrap('<div></div>');
    elFoot = elFoot.wrap('<div style="position: absolute"></div>').parent().wrap('<div></div>');

    var elHeadParent = elHead.parent();
    var elFootParent = elFoot.parent();

    /**
     * copy the width css from source to target
     * @param{array} source element array
     * @param{array} source element array
     * @return{null}
     **/
     function getSetWidth(source, target){
      var index = 0,
      newWidth = 0;
      for(index = 0 ; index < source.length ; index++){
        newWidth = source[index].getBoundingClientRect().width || angular.element(source[index]).prop('offsetWidth');
        angular.element(target[index]).css({width: newWidth+'px'});
      }
    }
    /**
     * add px prefix to styles
     * @param{object}
     * @return{object}
     **/
     function addPx(styles){
      for(style in styles){
        if(style === 'position'){
          continue;
        }
        styles[style] += 'px';
      }
      return styles;
    }

    function getStyle(styles){
      var newStyles = '';
      for(style in styles){
        newStyles += style + ':' + styles[style] + 'px;';
      }
      return newStyles;
    }

    /**
     * will update header and footer css on change of main table
     * @param{null}
     * @return{null}
     **/
     function refreshHeaderFooter(){
      var headerStyle = {
        position: 'absolute'
      },
      footerStyle = {
        position: 'absolute'
      };
      var pageYOffset = $window.pageYOffset;
      var innerHeight = $window.innerHeight;
      var tableParent = el.parent().parent().parent();
      var parnetContainer = $position.offset(tableParent);
      var elParentRelativePos = $position.position(el.parent());
      parnetContainer.height = tableParent[0].clientHeight;
      var positionHead = $position.position(el.find('thead'));
      var positionFoot = $position.position(el.find('tfoot'));
      var topContainer = fixedHeaderFooterGroup.getInstance('top', scope.fixedHeaderFooterOptions.topId);
      var topContainerHeight = topContainer ? topContainer[2][0].clientHeight : 0;
      var bottomContainer = fixedHeaderFooterGroup.getInstance('bottom', scope.fixedHeaderFooterOptions.bottomId);
      var bottomContainerHeight = bottomContainer ? bottomContainer[2][0].clientHeight : 0;
      //set height and width css
      headerStyle.height = positionHead.height;
      footerStyle.height = positionFoot.height;
      headerStyle.width = positionHead.width;
      footerStyle.width = positionFoot.width;

      //init top css value
      headerStyle.top = 0;
      footerStyle.top = 0;

      //header placement check
      //topCorr is number of pixel offset form header container.
      var topCorr = pageYOffset - parnetContainer.top + topContainerHeight;
      //console.log(topCorr +' '+ $window.pageYOffset +' '+ parnetContainer.top+' '+tableParent[0].scrollTop);
      //if topCorr is positive and less than then table container height then set header height
      //if topCorr is negative means table is in current viewport
      elHeadParent.css({'position':'','top': '','overflow':''});
      if(topCorr > 0 && parnetContainer.height >= topCorr && elParentRelativePos.top <= tableParent[0].scrollTop){
        //headerStyle.top += topCorr + tableParent[0].scrollTop;
        headerStyle.position = 'fixed';
        headerStyle.top = topContainerHeight;
        elHeadParent.css({'position':'fixed','top': headerStyle.top,'overflow':'hidden','width':tableParent[0].clientWidth});
        headerStyle.top = '';
        headerStyle.position = '';
        elHeadParent[0].scrollLeft = tableParent[0].scrollLeft;
      }else if(elParentRelativePos.top > tableParent[0].scrollTop){
        headerStyle.top = elParentRelativePos.top;
      }else{
        headerStyle.top = tableParent[0].scrollTop;
      }
      //console.log(elParentRelativePos.top+' '+tableParent[0].scrollTop);

      //footer placement check
      //bottomCorr is number of pixel offset form header container bottom.
      elFootParent.css({'position':'','top': '','overflow':'','width':''});
      var bottomCorr = (parnetContainer.top + parnetContainer.height) - (pageYOffset + innerHeight) + bottomContainerHeight;
      //console.log(bottomCorr +' '+ parnetContainer.top +' '+ parnetContainer.height +' '+ pageYOffset +' '+ $window.innerHeight+' '+tableParent[0].scrollTop);
      //if bottomCorr is positive and less than then table container height then set footer height
      //if topCorr is negative means table is in current viewport
      if(bottomCorr > 0 && parnetContainer.height >= bottomCorr){
        footerStyle.position = 'fixed';
        footerStyle.top = innerHeight - bottomContainerHeight - footerStyle.height;
        elFootParent.css({'position':'fixed','top': footerStyle.top,'overflow':'hidden','width':tableParent[0].clientWidth});
        footerStyle.top = '';
        footerStyle.position = '';
        elFootParent[0].scrollLeft = tableParent[0].scrollLeft;
        //console.log(footerStyle.top +' '+ tableParent[0].scrollTop +' '+ parnetContainer.height +' '+ bottomCorr +' '+ footerStyle.height);
      }else{
        footerStyle.top = tableParent[0].scrollTop + tableParent[0].clientHeight - footerStyle.height;
      }

      //dont change footer top css to prevent prevent infinite scroll
      //allow footer top css if no scroll
      //console.log(tableParent[0].scrollTop +' '+ parnetContainer.height +' '+ $position.position(el).height);
      if( tableParent[0].scrollTop != 0 && tableParent[0].scrollTop + parnetContainer.height >= $position.position(el).height + elParentRelativePos.top){
        //console.log(tableParent[0].scrollTop +' '+ parnetContainer.height +' '+ $position.position(el).height);
        delete footerStyle.top;
      }

      //add px prefix
      addPx(headerStyle);
      addPx(footerStyle);

      /*var headerStyles = getStyle(headerStyle);
      headerStyles = '.header-style{' + headerStyles + '}';
      var footerStyles = getStyle(footerStyle);
      footerStyles = '.footer-style{' + footerStyles + '}';
      var newStyles = headerStyles + '\n' + footerStyles;
      scope.fixedHeaderFooterOptions.styles = newStyles;*/

      //set new css style
      elHead.css(headerStyle);
      elFoot.css(footerStyle);

      //set new css width for each row
      getSetWidth(el.find('thead').find('th'), elHead.find('tr').find('th'));
      getSetWidth(el.find('tfoot').find('th'), elFoot.find('tr').find('th'));
    }

    //call for onRegisterApi function to expose refresh function out from directive.
    if(angular.isFunction(scope.fixedHeaderFooterOptions.onRegisterApi)){
      scope.fixedHeaderFooterOptions.onRegisterApi.call(this, scope.fixedHeaderFooterOptions, refreshHeaderFooter);
    }

    //delay refresh the header footer for first time to give time to directive to place evert thing right.
    $timeout(function(){
      refreshHeaderFooter();
    }, 100, false);

    //bind the element scroll event
    tablecontainer.parent('div').on('scroll', function(){
      refreshHeaderFooter();
      //scope.$apply();
    });
    //bind the window scroll and resize events.
    angular.element($window).on('resize scroll', function() {
      refreshHeaderFooter();
      //scope.$apply();
    });

    //remove all binding on detaching table form DOM.
    scope.$on('$destroy', function(){
      tablecontainer.parent('div').off('scroll');
      angular.element($window).off('scroll');
      angular.element($window).off('resize');
    });
  }
  return{
    scope: {
      fixedHeaderFooterOptions : '=fixedHeaderFooter'
    },
    link: link

  }
}]);