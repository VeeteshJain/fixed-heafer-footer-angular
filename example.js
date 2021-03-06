var app = angular.module('plunker', ['ui.bootstrap.position']);


angular.module('ui.bootstrap.position', [])

/**
 * A set of utility methods that can be use to retrieve position of DOM elements.
 * It is meant to be used where we need to absolute-position DOM elements in
 * relation to other, existing elements (this is the case for tooltips, popovers,
 * typeahead suggestions etc.).
*/
.factory('$position', ['$document', '$window', function ($document, $window) {

  function getStyle(el, cssprop) {
      if (el.currentStyle) { //IE
        return el.currentStyle[cssprop];
      } else if ($window.getComputedStyle) {
        return $window.getComputedStyle(el)[cssprop];
      }
      // finally try and get inline style
      return el.style[cssprop];
    }

    /**
     * Checks if a given element is statically positioned
     * @param element - raw DOM element
     */
     function isStaticPositioned(element) {
      return (getStyle(element, 'position') || 'static' ) === 'static';
    }

    /**
     * returns the closest, non-statically positioned parentOffset of a given element
     * @param element
     */
     var parentOffsetEl = function (element) {
      var docDomEl = $document[0];
      var offsetParent = element.offsetParent || docDomEl;
      while (offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent) ) {
        offsetParent = offsetParent.offsetParent;
      }
      return offsetParent || docDomEl;
    };

    return {
      /**
       * Provides read-only equivalent of jQuery's position function:
       * http://api.jquery.com/position/
       */
       position: function (element) {
        var elBCR = this.offset(element);
        var offsetParentBCR = { top: 0, left: 0 };
        var offsetParentEl = parentOffsetEl(element[0]);
        if (offsetParentEl != $document[0]) {
          offsetParentBCR = this.offset(angular.element(offsetParentEl));
          offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
          offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
        }

        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: elBCR.top - offsetParentBCR.top,
          left: elBCR.left - offsetParentBCR.left
        };
      },

      /**
       * Provides read-only equivalent of jQuery's offset function:
       * http://api.jquery.com/offset/
       */
       offset: function (element) {
        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: boundingClientRect.top + ($window.pageYOffset || $document[0].documentElement.scrollTop),
          left: boundingClientRect.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft)
        };
      },

      /**
       * Provides coordinates for the targetEl in relation to hostEl
       */
       positionElements: function (hostEl, targetEl, positionStr, appendToBody) {

        var positionStrParts = positionStr.split('-');
        var pos0 = positionStrParts[0], pos1 = positionStrParts[1] || 'center';

        var hostElPos,
        targetElWidth,
        targetElHeight,
        targetElPos;

        hostElPos = appendToBody ? this.offset(hostEl) : this.position(hostEl);

        targetElWidth = targetEl.prop('offsetWidth');
        targetElHeight = targetEl.prop('offsetHeight');

        var shiftWidth = {
          center: function () {
            return hostElPos.left + hostElPos.width / 2 - targetElWidth / 2;
          },
          left: function () {
            return hostElPos.left;
          },
          right: function () {
            return hostElPos.left + hostElPos.width;
          }
        };

        var shiftHeight = {
          center: function () {
            return hostElPos.top + hostElPos.height / 2 - targetElHeight / 2;
          },
          top: function () {
            return hostElPos.top;
          },
          bottom: function () {
            return hostElPos.top + hostElPos.height;
          }
        };

        switch (pos0) {
          case 'right':
          targetElPos = {
            top: shiftHeight[pos1](),
            left: shiftWidth[pos0]()
          };
          break;
          case 'left':
          targetElPos = {
            top: shiftHeight[pos1](),
            left: hostElPos.left - targetElWidth
          };
          break;
          case 'bottom':
          targetElPos = {
            top: shiftHeight[pos0](),
            left: shiftWidth[pos1]()
          };
          break;
          default:
          targetElPos = {
            top: hostElPos.top - targetElHeight,
            left: shiftWidth[pos1]()
          };
          break;
        }
        debugger;
        return targetElPos;
      }
    };
  }]);


app.directive('fixedHeaderFooter',['$timeout','$compile','$window', '$position', function($timeout, $compile, $window, $position){
  function link(scope, el, attrs){
    var cloneNode = el.clone();
    //clear the body content
    cloneNode.find('tbody').empty();
    //remove the directive name to prevent infinite re-compile direcrive
    cloneNode.removeAttr('fixed-header-footer');
    //add default css
    cloneNode.css({
      'background-color':'red',
      'z-index': 2,
      'margin-bottom': 0
    });
    var cloneHeadFoot = {
      'thead': cloneNode.clone(),
      'tfoot': cloneNode.clone()
    };
    cloneHeadFoot.thead.find('tfoot').empty();
    cloneHeadFoot.tfoot.find('thead').empty();
    cloneHeadFoot.tfoot.css({'background-color':'blue'});

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
function ListCtrl($scope, $timeout) {

  $scope.fixedHeaderFooter1 = {
    type: 'thead-tfoot',
    onRegisterApi: function(options, refreshCallback){
    }
  };

  $scope.fixedHeaderFooter2 = {
    type: 'thead-tfoot',
    onRegisterApi: function(options, refreshCallback){
      $scope.tableTwoRefreshCallback = refreshCallback;
    }
  };

  $scope.tableTwoHeight = 300;
  $scope.addPx = function(style){
    return style+'px';
  };
  $scope.$watch('tableTwoHeight', function(){
    $timeout(function(){
      console.log('height change');
      $scope.tableTwoRefreshCallback.call(this);
    });
  });
  $scope.addData = function(){
    var newArray = [];
    angular.forEach(angular.fromJson(angular.toJson($scope.items)), function(value, key){
      newArray.push(value);
      var newItem = angular.copy(value);
      newItem.id += 1;
      newArray.push(newItem);
    });
    debugger;
    $scope.items = newArray;
    $timeout(function(){
      console.log('height change');
      $scope.tableTwoRefreshCallback.call(this);
    });
  };
  $scope.doClick = function(msg){
    console.log(msg);
  }

  var allItems = [{"id":860,"firstName":"Superman","lastName":"Yoda"},{"id":870,"firstName":"Foo","lastName":"Whateveryournameis"},{"id":590,"firstName":"Toto","lastName":"Titi"},{"id":803,"firstName":"Luke","lastName":"Kyle"},{"id":474,"firstName":"Toto","lastName":"Bar"},{"id":476,"firstName":"Zed","lastName":"Kyle"},{"id":464,"firstName":"Cartman","lastName":"Kyle"},{"id":505,"firstName":"Superman","lastName":"Yoda"},{"id":308,"firstName":"Louis","lastName":"Kyle"},{"id":184,"firstName":"Toto","lastName":"Bar"},{"id":411,"firstName":"Luke","lastName":"Yoda"},{"id":154,"firstName":"Luke","lastName":"Moliku"},{"id":623,"firstName":"Someone First Name","lastName":"Moliku"},{"id":499,"firstName":"Luke","lastName":"Bar"},{"id":482,"firstName":"Batman","lastName":"Lara"},{"id":255,"firstName":"Louis","lastName":"Kyle"},{"id":772,"firstName":"Zed","lastName":"Whateveryournameis"},{"id":398,"firstName":"Zed","lastName":"Moliku"},{"id":840,"firstName":"Superman","lastName":"Lara"},{"id":894,"firstName":"Luke","lastName":"Bar"},{"id":591,"firstName":"Luke","lastName":"Titi"},{"id":767,"firstName":"Luke","lastName":"Moliku"},{"id":133,"firstName":"Cartman","lastName":"Moliku"},{"id":274,"firstName":"Toto","lastName":"Lara"},{"id":996,"firstName":"Superman","lastName":"Someone Last Name"},{"id":780,"firstName":"Batman","lastName":"Kyle"},{"id":931,"firstName":"Batman","lastName":"Moliku"},{"id":326,"firstName":"Louis","lastName":"Bar"},{"id":318,"firstName":"Superman","lastName":"Yoda"},{"id":434,"firstName":"Zed","lastName":"Bar"},{"id":480,"firstName":"Toto","lastName":"Kyle"},{"id":187,"firstName":"Someone First Name","lastName":"Bar"},{"id":829,"firstName":"Cartman","lastName":"Bar"},{"id":937,"firstName":"Cartman","lastName":"Lara"},{"id":355,"firstName":"Foo","lastName":"Moliku"},{"id":258,"firstName":"Someone First Name","lastName":"Moliku"},{"id":826,"firstName":"Cartman","lastName":"Yoda"},{"id":586,"firstName":"Cartman","lastName":"Lara"},{"id":32,"firstName":"Batman","lastName":"Lara"},{"id":676,"firstName":"Batman","lastName":"Kyle"},{"id":403,"firstName":"Toto","lastName":"Titi"},{"id":222,"firstName":"Foo","lastName":"Moliku"},{"id":507,"firstName":"Zed","lastName":"Someone Last Name"},{"id":135,"firstName":"Superman","lastName":"Whateveryournameis"},{"id":818,"firstName":"Zed","lastName":"Yoda"},{"id":321,"firstName":"Luke","lastName":"Kyle"},{"id":187,"firstName":"Cartman","lastName":"Someone Last Name"},{"id":327,"firstName":"Toto","lastName":"Bar"},{"id":187,"firstName":"Louis","lastName":"Lara"},{"id":417,"firstName":"Louis","lastName":"Titi"},{"id":97,"firstName":"Zed","lastName":"Bar"},{"id":710,"firstName":"Batman","lastName":"Lara"},{"id":975,"firstName":"Toto","lastName":"Yoda"},{"id":926,"firstName":"Foo","lastName":"Bar"},{"id":976,"firstName":"Toto","lastName":"Lara"},{"id":680,"firstName":"Zed","lastName":"Kyle"},{"id":275,"firstName":"Louis","lastName":"Kyle"},{"id":742,"firstName":"Foo","lastName":"Someone Last Name"},{"id":598,"firstName":"Zed","lastName":"Lara"},{"id":113,"firstName":"Foo","lastName":"Moliku"},{"id":228,"firstName":"Superman","lastName":"Someone Last Name"},{"id":820,"firstName":"Cartman","lastName":"Whateveryournameis"},{"id":700,"firstName":"Cartman","lastName":"Someone Last Name"},{"id":556,"firstName":"Toto","lastName":"Lara"},{"id":687,"firstName":"Foo","lastName":"Kyle"},{"id":794,"firstName":"Toto","lastName":"Lara"},{"id":349,"firstName":"Someone First Name","lastName":"Whateveryournameis"},{"id":283,"firstName":"Batman","lastName":"Someone Last Name"},{"id":862,"firstName":"Cartman","lastName":"Lara"},{"id":674,"firstName":"Cartman","lastName":"Bar"},{"id":954,"firstName":"Louis","lastName":"Lara"},{"id":243,"firstName":"Superman","lastName":"Someone Last Name"},{"id":578,"firstName":"Superman","lastName":"Lara"},{"id":660,"firstName":"Batman","lastName":"Bar"},{"id":653,"firstName":"Luke","lastName":"Whateveryournameis"},{"id":583,"firstName":"Toto","lastName":"Moliku"},{"id":321,"firstName":"Zed","lastName":"Yoda"},{"id":171,"firstName":"Superman","lastName":"Kyle"},{"id":41,"firstName":"Superman","lastName":"Yoda"},{"id":704,"firstName":"Louis","lastName":"Titi"},{"id":344,"firstName":"Louis","lastName":"Lara"},{"id":840,"firstName":"Toto","lastName":"Whateveryournameis"},{"id":476,"firstName":"Foo","lastName":"Kyle"},{"id":644,"firstName":"Superman","lastName":"Moliku"},{"id":359,"firstName":"Superman","lastName":"Moliku"},{"id":856,"firstName":"Luke","lastName":"Lara"},{"id":760,"firstName":"Foo","lastName":"Someone Last Name"},{"id":432,"firstName":"Zed","lastName":"Yoda"},{"id":299,"firstName":"Superman","lastName":"Kyle"},{"id":693,"firstName":"Foo","lastName":"Whateveryournameis"},{"id":11,"firstName":"Toto","lastName":"Lara"},{"id":305,"firstName":"Luke","lastName":"Yoda"},{"id":961,"firstName":"Luke","lastName":"Yoda"},{"id":54,"firstName":"Luke","lastName":"Bar"},{"id":734,"firstName":"Superman","lastName":"Yoda"},{"id":466,"firstName":"Cartman","lastName":"Titi"},{"id":439,"firstName":"Louis","lastName":"Lara"},{"id":995,"firstName":"Foo","lastName":"Moliku"},{"id":878,"firstName":"Luke","lastName":"Bar"},{"id":479,"firstName":"Luke","lastName":"Yoda"},{"id":252,"firstName":"Cartman","lastName":"Moliku"},{"id":355,"firstName":"Zed","lastName":"Moliku"},{"id":355,"firstName":"Zed","lastName":"Kyle"},{"id":694,"firstName":"Louis","lastName":"Bar"},{"id":882,"firstName":"Cartman","lastName":"Yoda"},{"id":620,"firstName":"Luke","lastName":"Lara"},{"id":390,"firstName":"Superman","lastName":"Lara"},{"id":247,"firstName":"Zed","lastName":"Kyle"},{"id":510,"firstName":"Batman","lastName":"Moliku"},{"id":510,"firstName":"Batman","lastName":"Lara"},{"id":472,"firstName":"Foo","lastName":"Moliku"},{"id":533,"firstName":"Someone First Name","lastName":"Kyle"},{"id":725,"firstName":"Superman","lastName":"Kyle"},{"id":221,"firstName":"Zed","lastName":"Lara"},{"id":302,"firstName":"Louis","lastName":"Whateveryournameis"},{"id":755,"firstName":"Louis","lastName":"Someone Last Name"},{"id":671,"firstName":"Batman","lastName":"Lara"},{"id":649,"firstName":"Louis","lastName":"Whateveryournameis"},{"id":22,"firstName":"Luke","lastName":"Yoda"},{"id":544,"firstName":"Louis","lastName":"Lara"},{"id":114,"firstName":"Someone First Name","lastName":"Titi"},{"id":674,"firstName":"Someone First Name","lastName":"Lara"},{"id":571,"firstName":"Zed","lastName":"Kyle"},{"id":554,"firstName":"Louis","lastName":"Titi"},{"id":203,"firstName":"Zed","lastName":"Kyle"},{"id":89,"firstName":"Luke","lastName":"Whateveryournameis"},{"id":299,"firstName":"Luke","lastName":"Bar"},{"id":48,"firstName":"Toto","lastName":"Bar"},{"id":726,"firstName":"Batman","lastName":"Whateveryournameis"},{"id":121,"firstName":"Toto","lastName":"Bar"},{"id":992,"firstName":"Superman","lastName":"Whateveryournameis"},{"id":551,"firstName":"Toto","lastName":"Kyle"},{"id":831,"firstName":"Louis","lastName":"Lara"},{"id":940,"firstName":"Luke","lastName":"Moliku"},{"id":974,"firstName":"Zed","lastName":"Kyle"},{"id":579,"firstName":"Luke","lastName":"Moliku"},{"id":752,"firstName":"Cartman","lastName":"Yoda"},{"id":873,"firstName":"Batman","lastName":"Someone Last Name"},{"id":939,"firstName":"Louis","lastName":"Whateveryournameis"},{"id":240,"firstName":"Luke","lastName":"Yoda"},{"id":969,"firstName":"Cartman","lastName":"Lara"},{"id":247,"firstName":"Luke","lastName":"Someone Last Name"},{"id":3,"firstName":"Cartman","lastName":"Whateveryournameis"},{"id":154,"firstName":"Batman","lastName":"Bar"},{"id":274,"firstName":"Toto","lastName":"Someone Last Name"},{"id":31,"firstName":"Luke","lastName":"Someone Last Name"},{"id":789,"firstName":"Louis","lastName":"Titi"},{"id":634,"firstName":"Zed","lastName":"Yoda"},{"id":972,"firstName":"Toto","lastName":"Kyle"},{"id":199,"firstName":"Foo","lastName":"Moliku"},{"id":562,"firstName":"Louis","lastName":"Titi"},{"id":460,"firstName":"Superman","lastName":"Yoda"},{"id":817,"firstName":"Cartman","lastName":"Someone Last Name"},{"id":307,"firstName":"Cartman","lastName":"Bar"},{"id":10,"firstName":"Cartman","lastName":"Titi"},{"id":167,"firstName":"Toto","lastName":"Someone Last Name"},{"id":107,"firstName":"Cartman","lastName":"Whateveryournameis"},{"id":432,"firstName":"Batman","lastName":"Kyle"},{"id":381,"firstName":"Luke","lastName":"Yoda"},{"id":517,"firstName":"Louis","lastName":"Lara"},{"id":575,"firstName":"Superman","lastName":"Kyle"},{"id":716,"firstName":"Cartman","lastName":"Titi"},{"id":646,"firstName":"Foo","lastName":"Whateveryournameis"},{"id":144,"firstName":"Someone First Name","lastName":"Yoda"},{"id":306,"firstName":"Luke","lastName":"Whateveryournameis"},{"id":395,"firstName":"Luke","lastName":"Bar"},{"id":777,"firstName":"Toto","lastName":"Moliku"},{"id":624,"firstName":"Louis","lastName":"Someone Last Name"},{"id":994,"firstName":"Superman","lastName":"Moliku"},{"id":653,"firstName":"Batman","lastName":"Moliku"},{"id":198,"firstName":"Foo","lastName":"Bar"},{"id":157,"firstName":"Zed","lastName":"Kyle"},{"id":955,"firstName":"Luke","lastName":"Someone Last Name"},{"id":339,"firstName":"Foo","lastName":"Bar"},{"id":552,"firstName":"Batman","lastName":"Titi"},{"id":735,"firstName":"Louis","lastName":"Bar"},{"id":294,"firstName":"Batman","lastName":"Bar"},{"id":287,"firstName":"Someone First Name","lastName":"Bar"},{"id":399,"firstName":"Cartman","lastName":"Yoda"},{"id":741,"firstName":"Foo","lastName":"Kyle"},{"id":670,"firstName":"Foo","lastName":"Bar"},{"id":260,"firstName":"Toto","lastName":"Lara"},{"id":294,"firstName":"Toto","lastName":"Titi"},{"id":294,"firstName":"Zed","lastName":"Lara"},{"id":840,"firstName":"Zed","lastName":"Titi"},{"id":448,"firstName":"Foo","lastName":"Kyle"},{"id":260,"firstName":"Luke","lastName":"Whateveryournameis"},{"id":119,"firstName":"Zed","lastName":"Someone Last Name"},{"id":702,"firstName":"Zed","lastName":"Kyle"},{"id":87,"firstName":"Zed","lastName":"Someone Last Name"},{"id":161,"firstName":"Foo","lastName":"Lara"},{"id":404,"firstName":"Zed","lastName":"Kyle"},{"id":871,"firstName":"Toto","lastName":"Lara"},{"id":908,"firstName":"Someone First Name","lastName":"Moliku"},{"id":484,"firstName":"Louis","lastName":"Bar"},{"id":966,"firstName":"Cartman","lastName":"Titi"},{"id":392,"firstName":"Someone First Name","lastName":"Lara"},{"id":738,"firstName":"Batman","lastName":"Lara"},{"id":560,"firstName":"Louis","lastName":"Kyle"},{"id":507,"firstName":"Zed","lastName":"Whateveryournameis"},{"id":660,"firstName":"Louis","lastName":"Whateveryournameis"},{"id":929,"firstName":"Superman","lastName":"Moliku"},{"id":42,"firstName":"Batman","lastName":"Moliku"},{"id":853,"firstName":"Luke","lastName":"Titi"},{"id":977,"firstName":"Louis","lastName":"Moliku"},{"id":104,"firstName":"Toto","lastName":"Kyle"},{"id":820,"firstName":"Luke","lastName":"Someone Last Name"},{"id":187,"firstName":"Batman","lastName":"Titi"},{"id":524,"firstName":"Louis","lastName":"Yoda"},{"id":830,"firstName":"Cartman","lastName":"Whateveryournameis"},{"id":156,"firstName":"Someone First Name","lastName":"Lara"},{"id":918,"firstName":"Foo","lastName":"Whateveryournameis"},{"id":286,"firstName":"Batman","lastName":"Moliku"},{"id":715,"firstName":"Louis","lastName":"Kyle"},{"id":501,"firstName":"Superman","lastName":"Whateveryournameis"},{"id":463,"firstName":"Foo","lastName":"Kyle"},{"id":419,"firstName":"Toto","lastName":"Yoda"},{"id":752,"firstName":"Foo","lastName":"Moliku"},{"id":754,"firstName":"Louis","lastName":"Titi"},{"id":497,"firstName":"Someone First Name","lastName":"Kyle"},{"id":722,"firstName":"Louis","lastName":"Moliku"},{"id":986,"firstName":"Batman","lastName":"Someone Last Name"},{"id":908,"firstName":"Someone First Name","lastName":"Titi"},{"id":559,"firstName":"Superman","lastName":"Bar"},{"id":816,"firstName":"Foo","lastName":"Bar"},{"id":517,"firstName":"Louis","lastName":"Bar"},{"id":188,"firstName":"Superman","lastName":"Bar"},{"id":762,"firstName":"Batman","lastName":"Someone Last Name"},{"id":872,"firstName":"Batman","lastName":"Titi"},{"id":107,"firstName":"Louis","lastName":"Lara"},{"id":968,"firstName":"Louis","lastName":"Moliku"},{"id":643,"firstName":"Toto","lastName":"Someone Last Name"},{"id":88,"firstName":"Toto","lastName":"Titi"},{"id":844,"firstName":"Foo","lastName":"Kyle"},{"id":334,"firstName":"Batman","lastName":"Someone Last Name"},{"id":43,"firstName":"Zed","lastName":"Lara"},{"id":600,"firstName":"Someone First Name","lastName":"Kyle"},{"id":719,"firstName":"Luke","lastName":"Lara"},{"id":698,"firstName":"Zed","lastName":"Yoda"},{"id":994,"firstName":"Zed","lastName":"Whateveryournameis"},{"id":595,"firstName":"Someone First Name","lastName":"Someone Last Name"},{"id":223,"firstName":"Toto","lastName":"Yoda"},{"id":392,"firstName":"Foo","lastName":"Moliku"},{"id":972,"firstName":"Toto","lastName":"Whateveryournameis"},{"id":155,"firstName":"Louis","lastName":"Whateveryournameis"},{"id":956,"firstName":"Louis","lastName":"Yoda"},{"id":62,"firstName":"Foo","lastName":"Kyle"},{"id":689,"firstName":"Superman","lastName":"Titi"},{"id":46,"firstName":"Foo","lastName":"Someone Last Name"},{"id":401,"firstName":"Toto","lastName":"Someone Last Name"},{"id":658,"firstName":"Louis","lastName":"Bar"},{"id":375,"firstName":"Someone First Name","lastName":"Bar"},{"id":877,"firstName":"Toto","lastName":"Someone Last Name"},{"id":923,"firstName":"Cartman","lastName":"Lara"},{"id":37,"firstName":"Zed","lastName":"Kyle"},{"id":416,"firstName":"Cartman","lastName":"Yoda"},{"id":546,"firstName":"Zed","lastName":"Yoda"},{"id":282,"firstName":"Luke","lastName":"Lara"},{"id":943,"firstName":"Superman","lastName":"Yoda"},{"id":319,"firstName":"Foo","lastName":"Whateveryournameis"},{"id":390,"firstName":"Louis","lastName":"Lara"},{"id":556,"firstName":"Luke","lastName":"Kyle"},{"id":255,"firstName":"Cartman","lastName":"Whateveryournameis"},{"id":80,"firstName":"Zed","lastName":"Kyle"},{"id":760,"firstName":"Louis","lastName":"Moliku"},{"id":291,"firstName":"Louis","lastName":"Titi"},{"id":916,"firstName":"Louis","lastName":"Bar"},{"id":212,"firstName":"Foo","lastName":"Moliku"},{"id":445,"firstName":"Luke","lastName":"Whateveryournameis"},{"id":101,"firstName":"Someone First Name","lastName":"Someone Last Name"},{"id":565,"firstName":"Superman","lastName":"Kyle"},{"id":304,"firstName":"Luke","lastName":"Someone Last Name"},{"id":557,"firstName":"Foo","lastName":"Titi"},{"id":544,"firstName":"Toto","lastName":"Kyle"},{"id":244,"firstName":"Zed","lastName":"Titi"},{"id":464,"firstName":"Someone First Name","lastName":"Bar"},{"id":225,"firstName":"Toto","lastName":"Titi"},{"id":727,"firstName":"Superman","lastName":"Someone Last Name"},{"id":735,"firstName":"Louis","lastName":"Bar"},{"id":334,"firstName":"Foo","lastName":"Lara"},{"id":982,"firstName":"Batman","lastName":"Kyle"},{"id":48,"firstName":"Batman","lastName":"Lara"},{"id":175,"firstName":"Luke","lastName":"Moliku"},{"id":885,"firstName":"Louis","lastName":"Moliku"},{"id":675,"firstName":"Toto","lastName":"Moliku"},{"id":47,"firstName":"Superman","lastName":"Someone Last Name"},{"id":105,"firstName":"Toto","lastName":"Titi"},{"id":616,"firstName":"Cartman","lastName":"Lara"},{"id":134,"firstName":"Someone First Name","lastName":"Someone Last Name"},{"id":26,"firstName":"Foo","lastName":"Moliku"},{"id":134,"firstName":"Toto","lastName":"Whateveryournameis"},{"id":680,"firstName":"Zed","lastName":"Lara"},{"id":208,"firstName":"Luke","lastName":"Someone Last Name"},{"id":233,"firstName":"Someone First Name","lastName":"Moliku"},{"id":131,"firstName":"Louis","lastName":"Moliku"},{"id":87,"firstName":"Toto","lastName":"Yoda"},{"id":356,"firstName":"Batman","lastName":"Kyle"},{"id":39,"firstName":"Louis","lastName":"Whateveryournameis"},{"id":867,"firstName":"Batman","lastName":"Lara"},{"id":382,"firstName":"Someone First Name","lastName":"Bar"}];
  $scope.items = [{"id":860,"firstName":"Superman","lastName":"Yoda"},{"id":870,"firstName":"Foo","lastName":"Whateveryournameis"},{"id":590,"firstName":"Toto","lastName":"Titi"},{"id":803,"firstName":"Luke","lastName":"Kyle"},{"id":474,"firstName":"Toto","lastName":"Bar"},{"id":476,"firstName":"Zed","lastName":"Kyle"},{"id":464,"firstName":"Cartman","lastName":"Kyle"},{"id":505,"firstName":"Superman","lastName":"Yoda"},{"id":308,"firstName":"Louis","lastName":"Kyle"}];
  var currentIndex = 8;
  var offset = 8;
  $scope.ddate = Date;
  $scope.loadMore = function() {
    /*$scope.items = $scope.items.concat(allItems.slice(currentIndex,currentIndex+offset));
    currentIndex = currentIndex + offset;*/
  };
  $scope.toggleDropdown = function(event,index,t_item){
    debugger;
  };

  $scope.tableStatus = true;
  var dialogOptions = {
    controller: 'EditCtrl',
    templateUrl: 'itemEdit.html'
  };


  $scope.status = {
    isopen: false
  };
  
  $scope.toggleDropdown = function($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.status.isopen = !$scope.status.isopen;
  };

  $scope.edit = function(item){
    /*
    var itemToEdit = item;
    
    $dialog.dialog(angular.extend(dialogOptions, {resolve: {item: angular.copy(itemToEdit)}}))
      .open()
      .then(function(result) {
        if(result) {
          angular.copy(result, itemToEdit);                
        }
        itemToEdit = undefined;
      });*/
};
}
// the dialog is injected in the specified controller
function EditCtrl($scope, item, dialog){

  $scope.item = item;
  
  $scope.save = function() {
    dialog.close($scope.item);
  };
  
  $scope.close = function(){
    dialog.close(undefined);
  };
}

