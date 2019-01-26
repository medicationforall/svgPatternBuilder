//DATA
var sWidth = 800;
var sHeight = 800;
var x=0;
var y=0;
var boxW = 80;
var boxH = 80;
var rectangles=[];
var slant=0;
var baseColorType='flat';
var baseColor='#00ff00';
var baseColor2='#000000';
var baseGradient='l(0,0,0,1)#fff-#000"';
var baseGradientCompiled=undefined;
var baseShadow=undefined;
var strokeColor='#800080';
var strokeWidth=1;
var vSlant=0;
var hSlant=0;
var hMargin=0;
var vMargin=0;
var rowOffset=0;
var columnOffset=0;

var gradientDirection='0,0,0,1';
var GRADIENT_TOP_LEFT='0,0,1,1';
var GRADIENT_TOP='0,0,0,1';
var GRADIENT_TOP_RIGHT='1,0,0,1';
var GRADIENT_RIGHT='1,1,0,1';
var GRADIENT_LEFT='0,1,1,1';
var GRADIENT_BOTTOM_RIGHT='1,1,0,0';
var GRADIENT_BOTTOM='1,1,1,0';
var GRADIENT_BOTTOM_LEFT='0,1,1,0';
var gradientType='l';

filterType='none';


//METHODS
/**
 *
 */
function createRectangle(s,ro,co){
  var ox=x+slant;
  var width=x+boxW;
  var height=y+boxH;
  var rOffset=0;
  var cOffset=0;

  if(ro!==undefined){
    rOffset = ro;
  }

  if(co!==undefined){
    cOffset=co;
  }

  //console.log('make a rectangle',width,height,offset);
  var p = s.polygon(
    rOffset+x+slant+hSlant, cOffset+y,
    rOffset+width+slant, cOffset+y+vSlant,
    rOffset+width+hSlant, cOffset+height,
    rOffset+x, cOffset+height+vSlant
  ).addClass('block').attr({
    'fill':resolveColor(s),
    'stroke':strokeColor,
    'strokeWidth':strokeWidth,
    'filter':resolveFilter(s)
  });
  return p;
}


/**
 *
 */
function createRectangles(s){
  var n = Math.floor((sWidth/(boxW+hMargin))*(sHeight/(boxH+vMargin)));
  var rowCount = 0;
  var colCount = 0;
  //console.log('create rectangles',n,x,y,boxW,sWidth);

  for(var i=0;i<n;i++){
    //console.log('modulus',i%4,n);
    var applyRowOffset=false;
    var applyColOffset=false;

    if(i!==0){
      x+=boxW+hMargin;
    }

    if(i!==0 && i%Math.floor(sWidth/(boxW+hMargin))===0){
      x=0;
      rowCount++;
      colCount=0;
      y+=boxH+vMargin;
    }

    //find even rows
    if(rowCount%2!==0){
      applyRowOffset=true;
    }

    //find even columns
    if(colCount%2!==0){
      applyColOffset=true;
    }

    if(applyRowOffset && applyColOffset){
      rectangles.push(createRectangle(s,rowOffset,columnOffset));
    }else if(applyColOffset){
      rectangles.push(createRectangle(s,undefined,columnOffset));
    } else if(applyRowOffset){
      rectangles.push(createRectangle(s,rowOffset));
    } else {
      rectangles.push(createRectangle(s));
    }

    colCount++;
  }
}


/**
 *
 */
function removeRectangles(s){
  //console.log('remove triangles');
  for(var i=0,r;r=rectangles[i];i++){
    r.remove();
  }

  x=0;
  y=0;
  rectangles=[];
}


/**
 *
 */
function removeGradients(s){
  //console.log('remove gradients');
  s.selectAll('linearGradient').forEach(function(node,index){
    node.remove();
  });
  baseGradientCompiled=undefined;
}


/**
 *
 */
function repaint(s){
  removeRectangles(s);
  removeGradients(s);
  createRectangles(s);
}


/**
 *
 */
function sizeSVG(s){
  //gather width
  //console.log($('body').width());
  sWidth = $('body').width()-130;
  sHeight= $('body').height();
  $('#stage').attr({'width':sWidth,'height':sHeight}).css({'width':sWidth,'height':sHeight});

  if(s){
    repaint(s);
  }
}


/**
 *
 */
function saveAsFile(t,f,m) {
	try {
    t='<?xml version="1.0" standalone="no"?>\n<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" \n"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n'+t;
		var b = new Blob([t],{type:m});
		saveAs(b, f);
	} catch (e) {
		window.open("data:"+m+"," + encodeURIComponent(t), '_blank','');
	}
}

/**
 *
 */
function resolveColor(s){
  if(baseColorType==='flat'){
    return baseColor;
  }else{
    if(baseGradientCompiled===undefined){
      generateBaseGradient(s)
    }

    gid='url(\'#'+'baseGradient'+'\')';
    return gid;
  }
}


/**
 *
 */
function resolveFilter(s){
  returner='';
  if(filterType==='none'){

  }else if(filterType==='shadow'){
    if(baseShadow==undefined){
      baseShadow = s.filter(Snap.filter.shadow(3, 3, 3));
    }
  }
  return returner;
}


/**
 *
 */
function generateBaseGradient(s){
  //var baseGradient='l(0,0, 0, 1)#fff-#000"';
  baseGradientCompiled = s.gradient(gradientType+'('+gradientDirection+')'+baseColor+'-'+baseColor2).attr('id','baseGradient');
  return baseGradientCompiled;
}

//MAIN
$(document).ready(function(){
  //console.log('main');

  sizeSVG();

  //create block
  var s = Snap("#stage");
  createRectangles(s);

  $( window ).resize($.proxy(function(s) {
    sizeSVG(s);
  },undefined,s));

  $('#clearButton').click(function(event){
    event.preventDefault();
    removeRectangles(s);
  });

  $('input[name="backgroundColor"]').on('input',$.proxy(function(s,event){
    $('body').css('background',$(this).val());
  },undefined,s));


  $('input[name="slant"]').on('input',$.proxy(function(s,event){
    slant = parseInt($(this).val());
    repaint(s);
  },undefined,s));


  $('input[name="width"]').on('input',$.proxy(function(s,event){
    boxW = parseInt($(this).val());
    repaint(s);
  },undefined,s));


  $('input[name="height"]').on('input',$.proxy(function(s,event){
    boxH = parseInt($(this).val());
    repaint(s);
  },undefined,s));


  $('select[name="baseColorType"]').on('change',$.proxy(function(event){
    //console.log('changed base color type',$(this).val());
    baseColorType = $(this).val();

    if(baseColorType==='gradient'){
      $('.controls .gradient').css('display','inline');
    }else{
      $('.controls .gradient').css('display','');
    }

    repaint(s);
  },undefined,s));


  $('select[name=gradientType]').on('change',$.proxy(function(event){
    gradientType=$(this).val();

    repaint(s);
    //console.log('change gradient type',$(this).val());
  },undefined,s))


  $('input[name="baseColor"]').on('input',$.proxy(function(s,event){
    baseColor = $(this).val();
    s.selectAll('.block').forEach(function(node,index){
      node.attr({
        'fill':resolveColor(s),
        'stroke':strokeColor,
        'strokeWidth':strokeWidth,
        'filter':resolveFilter(s)
      });
    },this);
    repaint(s);
  },undefined,s));


  $('input[name="baseColor2"]').on('input',$.proxy(function(s,event){
    baseColor2 = $(this).val();
    console.log('change secondary color',baseColor2);
    s.selectAll('.block').forEach(function(node,index){
      node.attr({
        'fill':resolveColor(s),
        'stroke':strokeColor,
        'strokeWidth':strokeWidth,
        'filter':resolveFilter(s)
      });
    },this);
    repaint(s);
  },undefined,s));


  $('select[name="gradientDirection"]').on('change',$.proxy(function(event){
    direction = $(this).val();
    //this works because the value are registered as variables in the global namespace.
    gradientDirection= window[direction];
    repaint(s);
    console.log('change gradient direction',direction,window[direction]);
  },undefined,s))


  $('input[name="strokeColor"]').on('input',$.proxy(function(s,event){
    strokeColor = $(this).val();
    s.selectAll('.block').forEach(function(node,index){
      node.attr({
        'fill':resolveColor(s),
        'stroke':strokeColor,
        'strokeWidth':strokeWidth,
        'filter':resolveFilter(s)
      });
    },this);
  },undefined,s));


  $('input[name="strokeWidth"]').on('input',$.proxy(function(s,event){
    strokeWidth = parseInt($(this).val());
    repaint(s);
  },undefined,s));


  $('input[name="vSlant"]').on('input',$.proxy(function(s,event){
    //console.log('change vSlant');
    vSlant = parseInt($(this).val());
    repaint(s);
  },undefined,s));


  $('input[name="hSlant"]').on('input',$.proxy(function(s,event){
    //console.log('change hSlant');
    hSlant = parseInt($(this).val());
    repaint(s);
  },undefined,s));


  $('input[name="hMargin"]').on('input',$.proxy(function(s,event){
    //console.log('change hMargin');
    hMargin = parseInt($(this).val());
    repaint(s);
  },undefined,s));


  $('input[name="vMargin"]').on('input',$.proxy(function(s,event){
    //console.log('change vMargin');
    vMargin = parseInt($(this).val());
    repaint(s);
  },undefined,s));


  $('input[name="rowOffset"]').on('input',$.proxy(function(s,event){
    //console.log('change row offset');
    rowOffset = parseInt($(this).val());
    repaint(s);
  },undefined,s));


  $('input[name="columnOffset"]').on('input',$.proxy(function(s,event){
    console.log('change column offset');
    columnOffset = parseInt($(this).val());
    repaint(s);
  },undefined,s));


  $('#saveButton').click(function(event){
    event.preventDefault();
    //console.log('clicked save');
    saveAsFile($("#stage")[0].outerHTML,'test.svg','image/svg+xml;charset=utf-8')
  });

});
