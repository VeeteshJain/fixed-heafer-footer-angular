var fixedHeaderFooter = angular.module('fixedHeaderFooter', ['ui.bootstrap']);
fixedHeaderFooter.directive('fixedHeaderFooter',['$timeout','$compile','$window', '$position', function($timeout, $compile, $window, $position){
  function link(scope, el, attrs){
    var cloneNode = el.clone();
    //clear the body content
    cloneNode.find('tbody').empty();
    //remove the directive name to prevent infinite re-compile direcrive
    cloneNode.removeAttr('fixed-header-footer');
    //add default css
    cloneNode.css({
      'background-color': el[0].style.backgroundColor === '' ? 'white' : el[0].style.backgroundColor,
      'z-index': scope.fixedHeaderFooterOptions.zIndex === undefined ? 2 : scope.fixedHeaderFooterOptions.zIndex,
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

    //add position css to cloned element and prepare the header and footer reference
    elHead = elHead.wrap('<div style="position: absolute"></div>').parent();
    elFoot = elFoot.wrap('<div style="position: absolute"></div>').parent();

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
        styles[style] += 'px';
      }
      return styles;
    }

    /**
     * will update header and footer css on change of main table
     * @param{null}
     * @return{null}
     **/
     function refreshHeaderFooter(){
      var headerStyle = {},
      footerStyle = {};
      var pageYOffset = $window.pageYOffset;
      var innerHeight = $window.innerHeight;
      var tableParent = el.parent().parent().parent();
      var parnetContainer = $position.offset(tableParent);
      parnetContainer.height = tableParent[0].clientHeight;
      var positionHead = $position.position(el.find('thead'));
      var positionFoot = $position.position(el.find('tfoot'));

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
      var topCorr = pageYOffset - parnetContainer.top;
      //console.log(topCorr +' '+ $window.pageYOffset +' '+ parnetContainer.top+' '+tableParent[0].scrollTop);
      //if topCorr is positive and less than then table container height then set header height
      //if topCorr is negative means table is in current viewport
      if(topCorr > 0 && parnetContainer.height >= topCorr){
        headerStyle.top += topCorr + tableParent[0].scrollTop;
      }else{
        headerStyle.top = tableParent[0].scrollTop;
      }

      //footer placement check
      //bottomCorr is number of pixel offset form header container bottom.
      var bottomCorr = (parnetContainer.top + parnetContainer.height) - (pageYOffset + innerHeight);
      //console.log(bottomCorr +' '+ parnetContainer.top +' '+ parnetContainer.height +' '+ pageYOffset +' '+ $window.innerHeight+' '+tableParent[0].scrollTop);
      //if bottomCorr is positive and less than then table container height then set footer height
      //if topCorr is negative means table is in current viewport
      if(bottomCorr > 0 && parnetContainer.height >= bottomCorr){
        footerStyle.top = tableParent[0].scrollTop + parnetContainer.height - bottomCorr - footerStyle.height;
        //console.log(footerStyle.top +' '+ tableParent[0].scrollTop +' '+ parnetContainer.height +' '+ bottomCorr +' '+ footerStyle.height);
      }else{
        footerStyle.top = tableParent[0].scrollTop + tableParent[0].clientHeight - footerStyle.height;
        //console.log(footerStyle.top +' '+ tableParent[0].scrollTop +' '+ parnetContainer.height +' '+ footerStyle.height);
      }

      //dont change footer top css to prevent prevent infinite scroll
      //allow footer top css if no scroll
      if( tableParent[0].scrollTop != 0 && tableParent[0].scrollTop + parnetContainer.height >= $position.position(el).height){
        console.log(tableParent[0].scrollTop +' '+ parnetContainer.height +' '+ $position.position(el).height);
        delete footerStyle.top;
      }

      //add px prefix
      addPx(headerStyle);
      addPx(footerStyle);

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
    });
    //bind the window scroll and resize events.
    angular.element($window).on('resize scroll', function() {
      refreshHeaderFooter();
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