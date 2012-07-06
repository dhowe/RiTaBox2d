var DEBUG_DRAW = 0, DETAIL = 50, DRAW_GLYPH_POINTS=0,DRAW_GLYPH_PATHS=0,DRAW_BOUNDING_BOXES=0,SCALE=30;
var __fonts = {}, PI=Math.PI, pow = Math.pow, E = "", __b2dObjects = [], __ctxPos = __getElementPosition(document.getElementById("canvas"));

var __fixtureDef = new b2FixtureDef;
__fixtureDef.density = 1.0;
__fixtureDef.friction = 0.5;
__fixtureDef.restitution = 0.2;

var dotOvers  = 'ji:;'; // '%' ?
var dotUnders = '?!'; // '%' ?
    
var bbTypePoly = 'bbTypePoly';
var bbTypeRect = 'bbTypeRect';

function __glyphs(x, y, letters, font, size, world, options) {

    if (typeof __ctxPos === 'undefined') throw Error("no canvas-position");

    options = options || {};
    var isStatic = options.static || false;
    var fixedRotation =  !options.rotates || false;
    var bbType = options.bbType || bbTypeRect;
    
    //log("bbType="+bbType);
    
    var kerning = Math.max(Math.min(kerning || 0, 1), -1);
    
    var fontStr = font + "";
    (typeof font == 'string') && (font = __getFont(font)) && (!font) && error("no font!");
    
    var scale = (size || 16) / font.face["units-per-em"];
    
    var xshift = 0, bodies = [];
    for (var i = 0, ii = letters.length; i < ii; i++) 
    {
        var prev = i && font.glyphs[letters[i - 1]] || {};
        xshift += i ? (prev.w || font.w) + (prev.k && prev.k[letters[i]] || 0) + (font.w * kerning) : 0;

        //log(letters[i]+") "+xshift);
        
        var pathArray = __parsePathString(font.glyphs[letters[i]].d);
        if (!pathArray || !pathArray.length) error("no path");
        
        var path = __pathToAbsolute(pathArray);

        var paths = __splitPath(path);
        
        path = (dotOvers.indexOf(letters[i]) > -1) ? paths[paths.length-1]: paths[0];
        
        //log(letters[i]+" has a dotOver? "+(dotOvers.indexOf(letters[i]) > -1));
        
        var pts = __getPointsFromPath(path, DETAIL);
        var offs = __minmax(pts);
    
        var spts = __simplifyPathPts(pts);
        var vec = __getPoly2TriPoints(spts, scale);
    
        var pw = __pixelsToWorld(x+__ctxPos.x+(xshift*scale), y+__ctxPos.x); // position of poly
        var body = __createPoly(world, vec, __fixtureDef, false);
        body.SetPosition(new b2Vec2(pw.x, pw.y));

        
        body.SetFixedRotation(fixedRotation);
          
        var data = { type: 'glyph', path: path, points: pts, isStatic: isStatic, 
            chars: letters[i], fontFamily: fontStr, fontSize: size, scale: scale, 
            offset: { x:-offs.minX, y: -offs.maxY }, bounds: __getBoundingBox(body) };
        
        body.SetUserData(data);
        bodies.push(body);
        
        /////////////////////////IGNORE///////////////////////////
        // hack to add a dot over  (LATER: do it correctly with multiple paths!!!)
        if (0 && dotOvers.indexOf(letters[i])>-1) {
            
            //log("welding...");
            
            var sz = .6; // get size
            var bodyDef = new b2BodyDef;
            bodyDef.type = b2Body.b2_dynamicBody;
            __fixtureDef.shape = new b2CircleShape(sz);
            bodyDef.position.x = pw.x + 1.45;
            bodyDef.position.y = pw.y - (bbox.height/SCALE) ;
            var dot = world.CreateBody(bodyDef);
            dot.CreateFixture(__fixtureDef);
            
            // Make a weld joint  /////////////////
            var weldJointDef = new Box2D.Dynamics.Joints.b2WeldJointDef();
            weldJointDef.Initialize(body, dot, body.GetWorldCenter());
            world.CreateJoint(weldJointDef);
            
            // Need to get joint bounding box
            data.bounds.y -= bbox.height;
            data.bounds.height += 90;
        }
        /////////////////////////IGNORE///////////////////////////
    }
    
    if (bbType==bbTypePoly) {
        for ( var i = 0; i < bodies.length; i++) {
            __b2dObjects.push(bodies[i]);    
        }
    }
    else {
        var boxes = [];
        var data = bodies[0].GetUserData();
        var loc = bodies[0].GetPosition();
        loc.y -= data.bounds.height/SCALE;
        
        for ( var i = 0; i < bodies.length; i++) {
            boxes.push(bodies[i].GetUserData().bounds);
            //world.DestroyBody(bodies[i]);
            world.DestroyBody(bodies[i]);
        }
        
        var body = __multiRectFixture(world, boxes, __fixtureDef, false);
        
        data.chars = letters;
        //data.bounds = __getBoundingBox(body);
        body.SetUserData(data);

        __b2dObjects.push(body);    
        body.SetPosition(loc); 
    }
    

    //console.log(data.chars +")",body.GetPosition()," :: ",loc);
    
    return body;
};




function __drawBody(ctx, body) {
    
    var radians = body.GetAngle();
    var vel = body.GetLinearVelocity();
    var bPt = body.GetWorldCenter();
    var pos = __worldToPixels(bPt.x, bPt.y);
    var data = body.GetUserData();
    
    if (!data) error("no data for: "+body);
    
    ctx.save();
    
    ctx.fillStyle="rgba(0, 0, 0, .5)";
    ctx.strokeStyle="rgba(0, 0, 0, 1)";

    if (data.type === 'rect') {
        ctx.translate(pos.x-__ctxPos.x, pos.y-__ctxPos.y);
        ctx.rotate(radians);
        __rect(ctx, -data.width/2, -data.height/2, data.width, data.height);
    }
    else if (data.type === 'circle') {
        ctx.translate(pos.x-__ctxPos.x, pos.y-__ctxPos.y);
        ctx.rotate(radians);
        __circle(ctx, 0, 0, data.radius);
    }
//    else if (data.type === 'glyphs') {
//        var bbox = data.bounds;
//        if (frameCount < 2 || body.GetType() === b2Body.b2_dynamicBody && frameCount%10==9) 
//            log(data.chars+"] pos.x="+pos.x+" __ctxPos.x="+__ctxPos.x);
//
//        ctx.translate(pos.x-__ctxPos.x, pos.y-__ctxPos.y);
//        ctx.rotate(radians);
//        ctx.font = "normal 360px "+data.fontFamily;
//        ctx.translate(0, bbox.height);     
//        ctx.scale(data.scale, data.scale);
//        ctx.fillText(data.chars, 0, 0);
//        ctx.strokeText(data.chars, 0, 0);
//    }
    else if (data.type === 'glyph') {
             
        var bbox = data.bounds;
        
        if (typeof data.firstX === 'undefined') {
            data.firstX = pos.x; 
            data.firstY = pos.y;
        }    
    
        ctx.translate(pos.x-__ctxPos.x, pos.y-__ctxPos.y);
        ctx.rotate(radians);
        ctx.translate(-(pos.x-__ctxPos.x), -(pos.y-__ctxPos.y));

        var xPosOff = data.firstX - (pos.x);
        var yPosOff = data.firstY - (pos.y);
        
        ctx.translate(bbox.x- xPosOff-__ctxPos.x,  bbox.y -yPosOff -__ctxPos.y);

        if (DRAW_BOUNDING_BOXES)
            __rect(ctx, 0, 0, bbox.width, bbox.height);
        
        ctx.translate(0, bbox.height);          // shift to baseline
        
        ctx.scale(data.scale, data.scale);
        
        ctx.translate(data.offset.x, data.offset.y); // path min/max

        ctx.font = "normal 360px "+data.fontFamily;
        ctx.fillText(data.chars, 0, 0);
        ctx.strokeText(data.chars, 0, 0);

        if (DRAW_GLYPH_PATHS) __path(ctx, data.path);

        if (DRAW_GLYPH_POINTS) {
            ctx.fillStyle="rgba(255,0,0,1)";
            for ( var i = 0; i < data.points.length; i++)
                __point(ctx, data.points[i].x, data.points[i].y); 
        }
        
    }

    else {
        log("unexpected type: "+data.type);
    }
    
    if (data.isStatic && body.GetType() === b2Body.b2_dynamicBody) 
        body.SetType(b2Body.b2_staticBody);
    
    ctx.restore();
}

/** 
 * Create a body from multiple rectangle boounding boxes
 * (Takes absolute pixel coords)
 */
function __multiRectFixture(world, boxes, fixDef, isStatic) {

    var bodyDef = new b2BodyDef();
    bodyDef.type = b2Body.b2_dynamicBody;
    if (isStatic) {
        bodyDef.type = b2Body.b2_staticBody;
    }
    
    var ob = boxes[0];
    var opos = __pixelsToWorld(ob.x, ob.y);
    var oww = __scalarToWorld(ob.width / 2);
    var owh = __scalarToWorld(ob.height / 2);
    
    var body = world.CreateBody(bodyDef);

    var pos0;
    for ( var i = 0; i < boxes.length; i++) {
        
        var b = boxes[i];
        var pos = __pixelsToWorld(b.x, b.y);
        if (i==0) pos0 = pos;
        var ww = __scalarToWorld(b.width / 2);
        var wh = __scalarToWorld(b.height / 2);
        
        var boxDef = new b2PolygonShape();
        try {
            var px = pos.x + ww - pos0.x;
            var py = pos.y + wh - pos0.y;
            boxDef.SetAsOrientedBox(ww,wh,new b2Vec2(px, py), 0);
            //log("Added rect#" + i + ") ["+px+","+py+","+ww+","+wh+"]");
        } 
        catch (e) {
            console.error("Error adding rect #" + i + "\n" + e+"\n" + boxes);
            return;
        }
        fixDef.shape = boxDef;
        body.CreateFixture(fixDef);
     }
    
    return body;
}

function __createFloor(world) {
    var pos = __worldToPixels(-10, (ctx.canvas.height / SCALE) -.6);
    var w = 40 * SCALE, h = 4 * SCALE;
    var body = __b2rect(pos.x, pos.y, w, h, world, true, true);
    var data = { type: 'rect', width :w, height : h, fixed: true };
    body.SetUserData(data);
}

function __b2rect(x, y, w, h, world, fixedRotation, isStatic) {
    
    //log("__b2rect("+x+","+y+","+ w+","+ h+")");
    
    if (typeof __ctxPos === 'undefined') throw Error("no canvas-position");
    
    fixedRotation = fixedRotation || false;
    isStatic = isStatic || false;
    
    var body = __rectFixture(world, x+__ctxPos.x, y+__ctxPos.y, w, h, isStatic);
    __b2dObjects.push(body);

    var data = { type: 'rect', width : w, height : h };
    body.SetUserData(data);

    return body;
}

function __b2circle(x, y, rad, world, fixedRotation, isStatic) {
    
    if (typeof __ctxPos === 'undefined') throw Error("no canvas-position");

    
    fixedRotation = fixedRotation || false;
    isStatic = isStatic || false;
    
    var pos = __pixelsToWorld(x+__ctxPos.x, y+__ctxPos.y);
    var bodyDefn = new b2BodyDef;
    
    bodyDefn.type = b2Body.b2_dynamicBody;
    if (!__isNull(isStatic) && isStatic) 
        bodyDefn.type = b2Body.b2_staticBody;

    bodyDefn.position.x = pos.x;
    bodyDefn.position.y = pos.y;
    __fixtureDef.shape = new b2CircleShape(__scalarToWorld(rad));

    var body = world.CreateBody(bodyDefn);
    body.CreateFixture(__fixtureDef);
    __b2dObjects.push(body);
    
    var data = { type: 'circle', radius : rad };
    body.SetUserData(data);

    return body;
}


///////////////////////////////////// HELPERS //////////////////////////////////////////

function randomShapes(num, world) {
    for ( var i = 0; i < num; i++) {
        var rx = Math.random() * 300;
        var ry = Math.random() * 300;
        if(Math.random() > 0.5) 
            __b2rect(rx,ry,3+Math.random()*30,3+Math.random()*30,world);
        else 
            __b2circle(rx,ry,3+Math.random()*30,world);
    }
}

// split up the separate paths
function __splitPath(path) {
    
    var count = 0;
    var result = [], tmp = [];
    for ( var i = 0; i < path.length; i++) {
        //log(i+") "+path[i]);
        if (i && path[i][0] === 'M') {
            var tmpClone = tmp.slice(0);
            result.push(tmpClone);
            tmp = [];
        }
        tmp.push(path[i]); 
    }
    var tmpClone = tmp.slice(0);
    result.push(tmpClone);
    
    //log("found "+result.length+" paths");
    //for ( var i = 0; i < result.length; i++) 
      //  log(result[i]);
    return result;
}

function __drawBodies(ctx) {
    for (var i = 0; i < __b2dObjects.length; i++) {   
        __drawBody(ctx, __b2dObjects[i]);
    }
}

function __destroy(obj) {
    world.DestroyBody(g);
    return __removeFromArray(obj,__b2dObjects);
}

function __removeFromArray(obj, arr)
{
    var found = false;
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === obj) {
            arr.splice(i, 1);
            found = true;
        }
    }
    return found;
}

function __doStats() {
    
    if (!this.stats) this.stats = new Stats();
    this.stats.getDomElement().style.position = 'absolute';
    this.stats.getDomElement().style.left = '8px';
    this.stats.getDomElement().style.top = (ctx.canvas.height+9)+"px";
    document.body.appendChild( this.stats.getDomElement() );
}

function __point(ctx, x, y) {

    ctx.beginPath(); 
    ctx.arc(x, y, 1, 0, 2 * Math.PI, true);
    ctx.closePath();
    ctx.fill();
}

function __rect(ctx, x, y, w, h) {
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
}

function __circle(ctx, x, y, rad) {
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}


function __rectFixture(theWorld, x, y, w, h, isStatic) {

    // log("__rectFixture: "+x+","+y+","+w+","+h+")");

    var pos = __pixelsToWorld(x, y);
    var ww = __scalarToWorld(w / 2);
    var wh = __scalarToWorld(h / 2);

    var bodyDefn = new b2BodyDef();
    bodyDefn.type = b2Body.b2_dynamicBody;
    if (!__isNull(isStatic) && isStatic) {
        bodyDefn.type = b2Body.b2_staticBody;
    }

    bodyDefn.position.x = pos.x + ww;
    bodyDefn.position.y = pos.y + wh;

    // log("__rectFixture: " + pos.x + "," + pos.y);
    __fixtureDef.shape = new b2PolygonShape();
    __fixtureDef.shape.SetAsBox(ww, wh);

    var body = theWorld.CreateBody(bodyDefn);
    body.CreateFixture(__fixtureDef);
    
    return body;
}

function __scalarToWorld(pixelVal) {

    return pixelVal / SCALE;
}

function __scalarToPixels(worldVal) {

    return worldVal * SCALE;
}


function __pixelsToWorld(pixelX, pixelY) {

    if (__isNull(__ctxPos)) throw Error("Null canvasPosition");
    
//    if (typeof pixelY === 'undefined' && typeof pixelX === 'object') {
//        pixelX = pixelX.x; // point
//        pixelY = pixelY.y;
//    }
    
    // coordinates
    var worldX = (pixelX - __ctxPos.x) / SCALE;
    var worldY = (pixelY - __ctxPos.y) / SCALE;

    return {
        x : worldX,
        y : worldY
    };
}

function __worldToPixels(worldX, worldY) {

    if (__isNull(__ctxPos)) throw Error("Null canvasPosition");

//    if (typeof worldY === 'undefined' && !__isNum(worldX)) {
//
//        worldX = worldX.x; // point
//        worldY = worldX.y;
//    }
    var pixelX = (worldX * SCALE) + __ctxPos.x;
    var pixelY = (worldY * SCALE) + __ctxPos.y;
    return {
        x : pixelX,
        y : pixelY
    };
}

function __line(ctx, x, y, x1, y1) {
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x1,y1);
    ctx.closePath();
    ctx.stroke();
}

function __polygon(ctx, points) {

    ctx.beginPath();

    for (var idx = 0; idx < points.length; idx++) {
        if (idx == 0) {
            ctx.moveTo(points[idx].x,points[idx].y);
        }
        else {
            ctx.lineTo(points[idx].x,points[idx].y);
        }
    }

    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}


function __path(ctx, d) {
    
    ctx.beginPath();
    
    var lastCmd;
    
    for ( var i = 0; i < d.length; i++) {
        
        var p, cmd = d[i][0];
        if (cmd != 'Z') p = {x:d[i][1],y:d[i][2]};
            
        
        //console.log(cmd+ " :: "+p.x+","+p.y);

        switch (cmd) {

            case 'M':
                ctx.moveTo(p.x, p.y);
                break;
             
            case 'L':
                
                ctx.lineTo(p.x, p.y);
                break;

            case 'C':

                cp1 = {x:d[i][3],y:d[i][4]};
                cp2 = {x:d[i][5],y:d[i][6]};
                ctx.bezierCurveTo(p.x, p.y, cp1.x, cp1.y, cp2.x, cp2.y);
                
                break;

            case 'Z':
                
                ctx.closePath();
                break;
                
            default:
                throw new Error("Unexpected path-cmd:"+cmd+" ["+dump(d[i])+"]");
            
            lastCmd = cmd;
        }
    }
    
    //if (lastCmd !== 'Z') ctx.closePath();
    
    ctx.fill();
    ctx.stroke();
}

function __getPointsFromPath(outCmds, numSamples) {

    //log("__getPointsFromPath()");
    
    /*var outCmds = [];//[inCmds[0]];
    for ( var i = 0; i < inCmds.length; i++) {
        var parts = inCmds[i];
        outCmds.push(parts);
        //if (parts[0] === 'Z') break; // adjust for non-interior paths (e.g., i,j,?, etc)
    }*/

    var len = __getTotalLength(outCmds);
    var sampleLen = len / (numSamples);
    
    var pts = [];
    var minX = minY = 99999999;
    var maxX = maxY = -99999999;
    
    for ( var i = 0; i < len; i += sampleLen) {
        
        var pt = __getPointAtLength(outCmds,i); // round or no?
        pt.x = Math.round(pt.x);
        
        if (pt.x < minX) minX = pt.x;
        if (pt.x > maxX) maxX = pt.x;
        
        if (pt.y < minY) minY = pt.y;
        if (pt.y > maxY) maxY = pt.y;
        
        pt.y = Math.round(pt.y);
        
        
        pts.push(pt);
    }   
    
    
    //for ( var i = 0; i < pts.length; i++) log(i+") "+pts[i].x+","+pts[i].y);

    return pts;
}

function __getLengthFactory(istotal, subpath) 
{
    return function (path, length, onlystart) 
    {
        path = __path2curve(path);
        var x, y, p, l, sp = "", subpaths = {}, point, len = 0;

        for (var i = 0, ii = path.length; i < ii; i++) {
            p = path[i];
            if (p[0] == "M") {
                x = +p[1];
                y = +p[2];
            } 
            else {
                l = __getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
                if (len + l > length) {
                    if (subpath && !subpaths.start) {
                        point = __getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
                        sp += ["C" + point.start.x, point.start.y, point.m.x, point.m.y, point.x, point.y];
                        if (onlystart) {return sp;}
                        subpaths.start = sp;
                        sp = ["M" + point.x, point.y + "C" + point.n.x, point.n.y, point.end.x, point.end.y, p[5], p[6]].join();
                        len += l;
                        x = +p[5];
                        y = +p[6];
                        continue;
                    }
                    if (!istotal && !subpath) {
                        point = __getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
                        return {x: point.x, y: point.y, alpha: point.alpha};
                    }
                }
                len += l;
                x = +p[5];
                y = +p[6];
            }
            sp += p.shift() + p;
        }
        subpaths.end = sp;
        point = istotal ? len : subpath ? subpaths : __findDotsAtSegment(x, y, p[0], p[1], p[2], p[3], p[4], p[5], 1);
        point.alpha && (point = {x: point.x, y: point.y, alpha: point.alpha});
        return point;
    };
}

var __curveslengths = {}, __getTotalLength = __getLengthFactory(1),
__getPointAtLength = __getLengthFactory(),
__getSubpathsAtLength = __getLengthFactory(0, 1);

function __getPointAtSegmentLength(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, length) {
    var len = 0,
        precision = 100,
        name = [p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y].join(),
        cache = __curveslengths[name],
        old, dot;
    
    !cache && (__curveslengths[name] = cache = {data: []});
    
    cache.timer && clearTimeout(cache.timer);
    
    cache.timer = setTimeout(function () {delete __curveslengths[name];}, 2e3);
    
    if (length != null && !cache.precision) {
        var total = __getPointAtSegmentLength(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y);
        cache.precision = ~~total * 10;
        cache.data = [];
    }
    precision = cache.precision || precision;
    
    for (var i = 0; i < precision + 1; i++) {
        if (cache.data[i * precision]) {
            dot = cache.data[i * precision];
        } else {
            dot = __findDotsAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, i / precision);
            cache.data[i * precision] = dot;
        }
        i && (len += pow(pow(old.x - dot.x, 2) + pow(old.y - dot.y, 2), .5));
        if (length != null && len >= length) {
            return dot;
        }
        old = dot;
    }
    if (length == null) {
        return len;
    }
}

function __findDotsAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
    var t1 = 1 - t,
    t13 = pow(t1, 3),
    t12 = pow(t1, 2),
    t2 = t * t,
    t3 = t2 * t,
    x = t13 * p1x + t12 * 3 * t * c1x + t1 * 3 * t * t * c2x + t3 * p2x,
    y = t13 * p1y + t12 * 3 * t * c1y + t1 * 3 * t * t * c2y + t3 * p2y,
    mx = p1x + 2 * t * (c1x - p1x) + t2 * (c2x - 2 * c1x + p1x),
    my = p1y + 2 * t * (c1y - p1y) + t2 * (c2y - 2 * c1y + p1y),
    nx = c1x + 2 * t * (c2x - c1x) + t2 * (p2x - 2 * c2x + c1x),
    ny = c1y + 2 * t * (c2y - c1y) + t2 * (p2y - 2 * c2y + c1y),
    ax = t1 * p1x + t * c1x,
    ay = t1 * p1y + t * c1y,
    cx = t1 * c2x + t * p2x,
    cy = t1 * c2y + t * p2y,
    alpha = (90 - Math.atan2(mx - nx, my - ny) * 180 / PI);
    (mx > nx || my < ny) && (alpha += 180);
    return {
        x: x,
        y: y,
        m: {x: mx, y: my},
        n: {x: nx, y: ny},
        start: {x: ax, y: ay},
        end: {x: cx, y: cy},
        alpha: alpha
    };
}

function __path2string(pArr) {
    return pArr.join(",").replace(/,?([achlmqrstvxz]),?/gi, "$1");
}

function __pathToAbsolute(pathArray) {

    //log("pathToAbsolute:"+pathArray);

 
    var res = [],
    x = 0,
    y = 0,
    mx = 0,
    my = 0,
    start = 0;
    if (pathArray[0][0] == "M") {
        x = +pathArray[0][1];
        y = +pathArray[0][2];
        mx = x;
        my = y;
        start++;
        res[0] = ["M", x, y];
    }
    var crz = pathArray.length == 3 && pathArray[0][0] == "M" && pathArray[1][0].toUpperCase() == "R" && pathArray[2][0].toUpperCase() == "Z";
    for (var r, pa, i = start, ii = pathArray.length; i < ii; i++) {
        res.push(r = []);
        pa = pathArray[i];
        if (pa[0] != String.prototype.toUpperCase.call(pa[0])) {
            r[0] = String.prototype.toUpperCase.call(pa[0]);
            switch (r[0]) {
                case "A":
                    r[1] = pa[1];
                    r[2] = pa[2];
                    r[3] = pa[3];
                    r[4] = pa[4];
                    r[5] = pa[5];
                    r[6] = +(pa[6] + x);
                    r[7] = +(pa[7] + y);
                    break;
                case "V":
                    r[1] = +pa[1] + y;
                    break;
                case "H":
                    r[1] = +pa[1] + x;
                    break;
                case "R":
                    var dots = [x, y].concat(pa.slice(1));
                    for (var j = 2, jj = dots.length; j < jj; j++) {
                        dots[j] = +dots[j] + x;
                        dots[++j] = +dots[j] + y;
                    }
                    res.pop();
                    res = res.concat(__catmullRom2bezier(dots, crz));
                    break;
                case "M":
                    mx = +pa[1] + x;
                    my = +pa[2] + y;
                default:
                    for (j = 1, jj = pa.length; j < jj; j++) {
                        r[j] = +pa[j] + ((j % 2) ? x : y);
                    }
            }
        } else if (pa[0] == "R") {
            dots = [x, y].concat(pa.slice(1));
            res.pop();
            res = res.concat(__catmullRom2bezier(dots, crz));
            r = ["R"].concat(pa.slice(-2));
        } else {
            for (var k = 0, kk = pa.length; k < kk; k++) {
                r[k] = pa[k];
            }
        }

        switch (r[0]) {
            case "Z":
                x = mx;
                y = my;
                break;
            case "H":
                x = r[1];
                break;
            case "V":
                y = r[1];
                break;
            case "M":
                mx = r[r.length - 2];
                my = r[r.length - 1];
            default:
                x = r[r.length - 2];
            y = r[r.length - 1];
        }
    }

    return res;
}

function __path2curve(path, path2) {

    //log("__path2curve:"+path);

    var p = __pathToAbsolute(path),
    p2 = path2 && __pathToAbsolute(path2),
    attrs = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
    attrs2 = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null};

    var __processPath = function (path, d) {

        //log("processPath: "+path);

        var nx, ny;
        if (!path) {
            return ["C", d.x, d.y, d.x, d.y, d.x, d.y];
        }
        !(path[0] in {T:1, Q:1}) && (d.qx = d.qy = null);
        switch (path[0]) {
            case "M":
                d.X = path[1];
                d.Y = path[2];
                break;
            case "A":
                path = ["C"].concat(a2c.apply(0, [d.x, d.y].concat(path.slice(1))));
                break;
            case "S":
                nx = d.x + (d.x - (d.bx || d.x));
                ny = d.y + (d.y - (d.by || d.y));
                path = ["C", nx, ny].concat(path.slice(1));
                break;
            case "T":
                d.qx = d.x + (d.x - (d.qx || d.x));
                d.qy = d.y + (d.y - (d.qy || d.y));
                path = ["C"].concat(__q2c(d.x, d.y, d.qx, d.qy, path[1], path[2]));
                break;
            case "Q":
                d.qx = path[1];
                d.qy = path[2];
                path = ["C"].concat(__q2c(d.x, d.y, path[1], path[2], path[3], path[4]));
                break;
            case "L":
                path = ["C"].concat(__l2c(d.x, d.y, path[1], path[2]));
                break;
            case "H":
                path = ["C"].concat(__l2c(d.x, d.y, path[1], d.y));
                break;
            case "V":
                path = ["C"].concat(__l2c(d.x, d.y, d.x, path[1]));
                break;
            case "Z":
                path = ["C"].concat(__l2c(d.x, d.y, d.X, d.Y));
                break;
        }
        return path;
    },
    __fixArc = function (pp, i) {
        if (pp[i].length > 7) {
            pp[i].shift();
            var pi = pp[i];
            while (pi.length) {
                pp.splice(i++, 0, ["C"].concat(pi.splice(0, 6)));
            }
            pp.splice(i, 1);
            ii = Math.max(p.length, p2 && p2.length || 0);
        }
    },
    __fixM = function (path1, path2, a1, a2, i) {
        if (path1 && path2 && path1[i][0] == "M" && path2[i][0] != "M") {
            path2.splice(i, 0, ["M", a2.x, a2.y]);
            a1.bx = 0;
            a1.by = 0;
            a1.x = path1[i][1];
            a1.y = path1[i][2];
            ii = Math.max(p.length, p2 && p2.length || 0);
        }
    };
    
    for (var i = 0, ii = Math.max(p.length, p2 && p2.length || 0); i < ii; i++) {
        p[i] = __processPath(p[i], attrs);
        __fixArc(p, i);
        p2 && (p2[i] = __processPath(p2[i], attrs2));
        p2 && __fixArc(p2, i);
        __fixM(p, p2, attrs, attrs2, i);
        __fixM(p2, p, attrs2, attrs, i);
        var seg = p[i],
        seg2 = p2 && p2[i],
        seglen = seg.length,
        seg2len = p2 && seg2.length;
        attrs.x = seg[seglen - 2];
        attrs.y = seg[seglen - 1];
        attrs.bx = parseFloat(seg[seglen - 4]) || attrs.x;
        attrs.by = parseFloat(seg[seglen - 3]) || attrs.y;
        attrs2.bx = p2 && (parseFloat(seg2[seg2len - 4]) || attrs2.x);
        attrs2.by = p2 && (parseFloat(seg2[seg2len - 3]) || attrs2.y);
        attrs2.x = p2 && seg2[seg2len - 2];
        attrs2.y = p2 && seg2[seg2len - 1];
    }
    
    return p2 ? [p, p2] : p;
};

//http://schepers.cc/getting-to-the-point
function __catmullRom2bezier(crp, z) {

    //alert("called catmullRom2bezier!");

    var d = [];
    for (var i = 0, iLen = crp.length; iLen - 2 * !z > i; i += 2) {
        var p = [
                 {x: +crp[i - 2], y: +crp[i - 1]},
                 {x: +crp[i],     y: +crp[i + 1]},
                 {x: +crp[i + 2], y: +crp[i + 3]},
                 {x: +crp[i + 4], y: +crp[i + 5]}
                 ];
        if (z) {
            if (!i) {
                p[0] = {x: +crp[iLen - 2], y: +crp[iLen - 1]};
            } else if (iLen - 4 == i) {
                p[3] = {x: +crp[0], y: +crp[1]};
            } else if (iLen - 2 == i) {
                p[2] = {x: +crp[0], y: +crp[1]};
                p[3] = {x: +crp[2], y: +crp[3]};
            }
        } else {
            if (iLen - 4 == i) {
                p[3] = p[2];
            } else if (!i) {
                p[0] = {x: +crp[i], y: +crp[i + 1]};
            }
        }
        d.push(["C",
                (-p[0].x + 6 * p[1].x + p[2].x) / 6,
                (-p[0].y + 6 * p[1].y + p[2].y) / 6,
                (p[1].x + 6 * p[2].x - p[3].x) / 6,
                (p[1].y + 6*p[2].y - p[3].y) / 6,
                p[2].x,
                p[2].y
                ]);
    }

    return d;
}

function __parsePathString(pathString) {
    var pathCommand = /([achlmrqstvz])[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)/ig, pathValues = /(-?\d*\.?\d*(?:e[\-+]?\d+)?)[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*/ig, 
    paramCounts = {a: 7, c: 6, h: 1, l: 2, m: 2, r: 4, q: 4, s: 4, t: 2, v: 1, z: 0},
    data = [];

    if (!data.length) {
        String(pathString).replace(pathCommand, function (a, b, c) {
            var params = [],
            name = b.toLowerCase();
            c.replace(pathValues, function (a, b) {
                b && params.push(+b);
            });
            if (name == "m" && params.length > 2) {
                data.push([b].concat(params.splice(0, 2)));
                name = "l";
                b = b == "m" ? "l" : "L";
            }
            if (name == "r") {
                data.push([b].concat(params));
            } else 
            {
                while (params.length >= paramCounts[name]) {
                    data.push([b].concat(params.splice(0, paramCounts[name])));
                    if (!paramCounts[name]) {
                        break;
                    }
                }
            }
        });
    }
    
    return data;
}



function __getFont(family, weight, style, stretch) {

    //console.log("__getFont(" + family + ")");

    stretch = stretch || "normal";
    style = style || "normal";
    weight = +weight || {
        normal : 400,
        bold : 700,
        lighter : 300,
        bolder : 800
    }[weight] || 400;
    
    
    if (!__fonts) throw Error("no fonts");

    var font = __fonts[family];
    if (!font) {
        var name = new RegExp("(^|\\s)" + family.replace(/[^\w\d\s+!~.:_-]/g, E) + "(\\s|$)", "i");
        for ( var fontName in __fonts)
            if (__fonts.hasOwnProperty(fontName)) {
                if (name.test(fontName)) {
                    font = __fonts[fontName];
                    break;
                }
            }
    }
    var thefont;
    if (font) {
        for ( var i = 0, ii = font.length; i < ii; i++) {
            thefont = font[i];
            if (thefont.face["font-weight"] == weight
                && (thefont.face["font-style"] == style || !thefont.face["font-style"])
                && thefont.face["font-stretch"] == stretch) {
                break;
            }
        }
    }
    return thefont;
}

function registerFont(font) {

    //console.log("__registerFont(" + font + ")");

    if (!font.face) {
        return font;
    }

    var fontcopy = {
        w : font.w,
        face : {},
        glyphs : {}
    },

    family = font.face["font-family"];
    for ( var prop in font.face)
        if (font.face.hasOwnProperty(prop)) {
            fontcopy.face[prop] = font.face[prop];
        }

    if (__fonts[family]) {
        __fonts[family].push(fontcopy);
    } else {
        __fonts[family] = [ fontcopy ];
    }

    if (!font.svg) {

        fontcopy.face["units-per-em"] = parseInt(font.face["units-per-em"], 10);

        for ( var glyph in font.glyphs)
            if (font.glyphs.hasOwnProperty(glyph)) {
                var path = font.glyphs[glyph];
                fontcopy.glyphs[glyph] = {
                    w : path.w,
                    k : {},
                    d: path.d && "M" + path.d.replace(/[mlcxtrv]/g, function(command) { 
                        return { l: "L", c: "C", x: "z", t: "m", r: "l", v: "c" } [command] || "M"; }) + "z"
                     
                }
                if (path.k) {
                    for ( var k in path.k) {
                        if (path.hasOwnProperty(k)) {
                            fontcopy.glyphs[glyph].k[k] = path.k[k];
                        }
                    }
                }
            }
    }

    return font;
}

function __l2c(x1, y1, x2, y2) {
    
    return [x1, y1, x2, y2, x2, y2];
}

function __q2c(x1, y1, ax, ay, x2, y2) {
    
    var _13 = 1 / 3,
        _23 = 2 / 3;
    return [
            _13 * x1 + _23 * ax,
            _13 * y1 + _23 * ay,
            _13 * x2 + _23 * ax,
            _13 * y2 + _23 * ay,
            x2,
            y2
        ];
}

/**
 * Converts to js.poly2tri.Points in b2World coordinates
 */
function __getPoly2TriPoints(thePoints, fontScale) {

    var b2Pts = []; // omit the first point to avoid duplicates
    for ( var i = 1; i < thePoints.length; i++) 
    {
        var pt = thePoints[i]; // show-pts

        pt = __pixelsToWorld(pt.x, pt.y);

        pt.x *= fontScale;
        pt.y *= fontScale;

        var p2t = new js.poly2tri.Point(pt.x, pt.y);

        b2Pts.push(p2t);
    }

    return b2Pts;
}

function __simplifyPathPts(pts) {

    if (pts.length < 3) return pts;

    var ok = [ pts[0] ], i = 1;
    
    for (; i < pts.length - 1; i++) {

        var last = pts[i - 1];
        var curr = pts[i];
        var next = pts[i + 1];

        if (next.y == curr.y && next.y == last.y) {
            continue;
        } else if (next.x == curr.x && next.x == last.x) {
            continue;
        }
        ok.push(pts[i]);
    }
    ok.push(pts[i]);

    if (pts.length < ok.length)
        throw Error("Failed: simplifyPathPts(" + pts.length + ") -> " + ok.length);
    
    return ok;
}

/**
 * Expects world (Box2d) coordinates for 'vec'
 * 
 * @return b2body
 */
function __createPoly(world, vec, fixDef, isStatic) {

    isStatic = isStatic || false;

    var swctx = new js.poly2tri.SweepContext(vec);
    js.poly2tri.sweep.Triangulate(swctx);
    var tris = swctx.GetTriangles();
    
    var bodyDef = new b2BodyDef();
    bodyDef.type = b2Body.b2_dynamicBody;
    if (isStatic) {
        bodyDef.type = b2Body.b2_staticBody;
    }

    var body = world.CreateBody(bodyDef);

    for ( var i = 0; i < tris.length; i++) {
        var verts = [ tris[i].GetPoint(0), tris[i].GetPoint(1), tris[i].GetPoint(2) ];
        
        //for ( var i = 0; i < vec.length; i++) log(i+") "+vec[i].x+","+vec[i].y);
        
        __addShape(body, fixDef, verts, i);
    }
    
    return body;
}


function __addShape(body, fixDef, verts, id) {

    var boxDef = new b2PolygonShape();
    try {
        boxDef.SetAsVector(verts);
    } catch (e) {
        console.error("Error adding fixture #"+id+"\n"+e+"\n"+dump(verts));
        return;
    }
    fixDef.shape = boxDef;
    body.CreateFixture(fixDef);
}


function __getBoundingBox(body) { // pixel-coords
    
    var bb = __getB2dBoundingBox(body);
    
    var x = bb.lowerBound.x, y = bb.lowerBound.y,
        w = (bb.upperBound.x - bb.lowerBound.x), 
        h = (bb.upperBound.y - bb.lowerBound.y);
    
    var pos = __worldToPixels(x,y);

    return { x: pos.x, y : pos.y, width: w*SCALE, height: h*SCALE };
    //return { x: pos.x-canvasPosition.x, y : pos.y-canvasPosition.y, width: w*SCALE, height: h*SCALE }; 
}

function __getB2dBoundingBox(body) { // b2world-coords

    var aabb = new b2AABB();
    aabb.lowerBound.Set(9999999,9999999);
    aabb.upperBound.Set(-9999999,-9999999);
    var fixture = body.GetFixtureList();
    while (fixture != null)
    {
        aabb.Combine(aabb, fixture.GetAABB());
        fixture = fixture.GetNext();
    }
    return aabb;
}

function __randomShapes(paper, num, world) {
    for ( var i = 0; i < num; i++) {
        var rx = Math.random() * 300;
        var ry = Math.random() * 300;
        if(Math.random() > 0.5) 
            b2rect(paper,rx,ry,3+Math.random()*30,3+Math.random()*30,world);
        else 
            b2circle(paper,rx,ry,3+Math.random()*30,world);
    }
}

// previous working single glyph method
function __glyphX(x, y, letter, font, size, world, fixedRotation, isStatic) {

    if (typeof __ctxPos === 'undefined') throw Error("no canvas-position");

    var kerning = Math.max(Math.min(kerning || 0, 1), -1);
    fixedRotation = fixedRotation || false;
    isStatic = isStatic || false;
    
    var fontStr = font + "";
    (typeof font == 'string') && (font = __getFont(font)) && (!font) && error("no font!");
    
    var scale = (size || 16) / font.face["units-per-em"];
    var path = __pathToAbsolute(font.glyphs[letter].d);
    var pts = __getPointsFromPath(path, 100);
    
    var offset = __minmax(pts);

    var spts = __simplifyPathPts(pts);
    var vec = __getPoly2TriPoints(spts, scale);

    var pw = __pixelsToWorld(x+__ctxPos.x, y+__ctxPos.x); // position of poly
    var body = __createPoly(world, pw.x, pw.y, vec, __fixtureDef, false);
    body.SetFixedRotation(fixedRotation);

    var bbox = __getBoundingBox(body);  
    
    var data = { type: 'glyph', path: path, points: pts, isStatic: isStatic, 
        letter: letter, fontFamily: fontStr, fontSize: size, scale: scale, 
        bounds: bbox, xOffset: -offset.minX, yOffset: -offset.maxY };

    body.SetUserData(data);
    __b2dObjects.push(body);
    
    return body;
};


///////////////////////////////// general util ///////////////////////////////////////

function __minmax(arr,toPixels) {
    
    var scale = toPixels ? 30 : 1;
    var minX=99999,maxX=-99999,minY=99999,maxY=-99999;
    for ( var i = 0; i < arr.length; i++) {
        //var z = __worldToPixels(vec[i].x, vec[i].y);
        var z = arr[i];
        if (z.x < minX) minX = z.x;
        if (z.x > maxX) maxX = z.x;
        if (z.y < minY) minY = z.y;
        if (z.y > maxY) maxY = z.y;
    }
    minX *= scale;
    minY *= scale;
    maxX *= scale;
    maxY *= scale;
    
    //console.log("minX: "+minX+" minY: "+minY+"  maxX: "+maxX+"  maxY:"+ maxY);

    //for ( var i = 0; i < tmp.length; i++) log(i+") "+tmp[i].x+","+tmp[i].y);
    return {minX: minX, minY: minY, maxX: maxX, maxY: maxY};
}

function __isNull(obj) {

    return (typeof obj === 'undefined' || obj === null);
}

function __getElementPosition(element) {
    var elem=element, tagname="", x=0, y=0;
   
    while((typeof(elem) == "object") && (typeof(elem.tagName) != "undefined")) {
       y += elem.offsetTop;
       x += elem.offsetLeft;
       tagname = elem.tagName.toUpperCase();

       if(tagname == "BODY")
          elem=0;

       if(typeof(elem) == "object") {
          if(typeof(elem.offsetParent) == "object")
             elem = elem.offsetParent;
       }
    }

    return {x: x, y: y};
 }

function __getType(obj) {
    
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    
};

function __isNum(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}



function error(msg) {
    
    throw Error("[RiTaBox2d] " + msg);
}

function warn(msg) {
    
    console.warn("[RiTaBox2d] " + msg);
}

function log(msg) {
    
    console.log("[RiTaBox2d] " + msg);
}

