var drawPhysics = true; // toggle to show physics engine 

var canvas = document.getElementById('canvas'), PI=Math.PI, score = 0,
    goal = 600, health = 100, ctxPos = getElementPosition(canvas);

RiTaBox.enableStats(); 

var world = boxbox.createWorld(canvas, { debugDraw: drawPhysics });
world.makeGlyphs = function(i,j) {  return makeGlyphs(i,j); }
world.makeEntity = function(i,j) {  return makeEntity(i,j); }

function makeEntity() {

    var options = {};
    var args = Array.prototype.slice.call(arguments);
    args.reverse();
    for (var key in args) extend(options, args[key]);

    var entity = world.createEntity(convertOptions(options));
    var rot = options.rotation || 0;
    entity._body.SetAngle(rot);
    
    return entity;
}

function convertOptions(_options) {
    
    _options.x = _options.x || 0;
    _options.y = _options.y || 0;
    
    var pos = pixelsToWorld(_options.x, _options.y);
    _options.x = pos.x;
    _options.y = pos.y;
    
    if (_options.radius) _options.radius = scalarToWorld(_options.radius);
    if (_options.width)  _options.width  = scalarToWorld(_options.width);
    if (_options.height) _options.height = scalarToWorld(_options.height);

    return _options;
}

/**
  Options:
    text: one or more letters (required) 
    x/y:  the position (required) 
    fontSize: (default=48)
    font: (default="Times New Roman")
    rotation:  the initial rotation (default=0)
    fixedRotation: can the object rotate? (default=true) 
    type: will it move according to physics? (default='static') ['static' || 'dynamic']  
    bbType: (default=POLYS) [POLYS || RECTS || BOX]
    name: [not generally needed]
    color: (default=gray)
 */
function makeGlyphs() {

    var options = {};
    var args = Array.prototype.slice.call(arguments);
    args.reverse();
    for (var key in args) extend(options, args[key]);
    
    //dump(options);
    
    var options = convertOptions(options);
    
    if (!options.text) throw Error("toGlyph: no string");

    var detail = options.detail || 30;
    var rotation = options.rotation || 0;
    var fontSize = options.fontSize || 48;
    var font = options.font || "Times New Roman";
    var bboxType = options.boundingBoxType || POLYS;
    var isStatic = options.type === 'static' || false;
    var fixed = options.fixedRotation || false; 

    var entity = world.createEntity(options);
    
    var oldBody = entity._body;
    var id = entity._body._bbid;
    var pos = entity.canvasPosition();

    var rbody = RiTaBox.glyphs(pos.x, pos.y, options.text, font, fontSize, world._world, 
        {   static: isStatic, rotates: !fixed, bbType: bboxType, detail: detail, rotation: rotation });
    
    entity._body = rbody;
    entity._body._bbid = id;
    entity._draw = function(ctx, x, y) {
      var pos = this.canvasPosition();
      ctx.save();
      ctx.strokeStyle = 'black';
      ctx.fillStyle = this._ops.color;
      ctx.scale(world._scale/30, world._scale/30);
      RiTaBox.drawGlyphs(ctx,this._body,pos.x,pos.y);
      ctx.restore();
    };
    world._world.DestroyBody(oldBody);
    
    return entity;
}

// A minimal extend from jQuery
function extend(target, o) {
    
    if (target === undefined) {
        target = {};
    }
    if (o !== undefined) {
        for (var key in o) {
            if (o.hasOwnProperty(key) && target[key] === undefined) {
                target[key] = o[key];
            }
        }
    }
    return target;
}

function dump(o) {

    var str = "";
    if (o !== undefined) {
        for (var key in o) {
            if (o.hasOwnProperty(key)) {
                    str += key+"";
                    str += (typeof key === 'function') ? "(), " : ":"+o[key]+", ";
            }
        }
    }
    console.log(str);
}

function pixelsToWorld(pixelX, pixelY) {
    
    if (typeof ctxPos === undefined) throw Error("Null ctxPos");

    var worldX = (pixelX - ctxPos.x) / 30;
    var worldY = (pixelY - ctxPos.y) / 30;

    return {
        x : worldX,
        y : worldY
    };
}

function scalarToWorld(pixelVal) {
    
    return pixelVal / 30;
}

function getElementPosition(element) {
    
    if (typeof element === 'undefined')
         throw Error("undefined input to __getElementPosition");
     
    var elem = element, tagname="", x=0, y=0;
    
    while((typeof(elem) == "object") && (typeof(elem.tagName) != "undefined")) {
        y += elem.offsetTop;
        x += elem.offsetLeft;
        tagname = elem.tagName.toUpperCase();
 
        if(tagname == "BODY") elem=0;
 
        if(typeof(elem) == "object") {
           if(typeof(elem.offsetParent) == "object")
              elem = elem.offsetParent;
        }
     }
 
     return {x: x, y: y};
}