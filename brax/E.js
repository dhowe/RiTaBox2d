
/*
 * TODO:  
 *      RECT bb mode for single rect (flat surface)
 *      Toggle for debugDraw
 */
(function() {
    
    /////////////////////////////// setup ///////////////////////////////// 

    var damageForce = 4.5, vertForce = 2.5, horizForce = 4, PI = Math.PI, mouseX = 0, mouseY = 0, mX = 0, mY = 0;
    var canvas = document.getElementById('canvas'), goal = 600, health = 1000, score = 0;
    
    RiTaBox.enableStats();    
    var world = boxbox.createWorld(canvas, { debugDraw: 0 });
    world.createGlyphs = function(i,j) {  return createGlyphs(i,j); }
     

    /////////////////////////////// player ///////////////////////////////// 

    var player = world.createGlyphs({
        text: 'U',
        fontSize: 40, 
        font: "Times New Roman",
        name: 'player',
        fixedRotation: true,
        friction: .3,
        restitution: 0,
        color: 'gray',
        x: 60, y: 0
        //x: 10, y: 20
        //x: 15, y: 45
    });
    
    
    /////////////////////////////  ground  //////////////////////////////// 


    var groundTemplate = {
        name: 'ground',
        type: 'static',
        height: .1,
    };
    
    world.createEntity(groundTemplate, { width: 10, x: 65, y: 10, type: 'static'});

	//groundOne.setVelocity(2.5, 0);

    world.createEntity(groundTemplate, { width: 20, x: 0, y: 50, type: 'static'});

    
    /* world.createGlyphs(groundTemplate, { x: 2, y: 11, 
        text: 'O', fontSize: 40, type: 'static', boundingBoxType: RECTS }); 
    
    world.createGlyphs(groundTemplate, { x: 12, y:  4, 
        text: 'PRoToTYpE', fontSize: 40, type: 'static', boundingBoxType: RECTS }); */
    
/////////////////////////////   mouse ///////////////////////////
    
    function getMousePos(canvas, evt){
        
        // get canvas position
        var obj = canvas;
        var top = 0;
        var left = 0;
        while (obj && obj.tagName != 'BODY') {
            top += obj.offsetTop;
            left += obj.offsetLeft;
            obj = obj.offsetParent;
        }
     
        // return relative mouse position
        var mouseX = evt.clientX - left + window.pageXOffset;
        var mouseY = evt.clientY - top + window.pageYOffset;
        return {
            x: mouseX,
            y: mouseY
        };
    }
     
    window.onload = function(){
        var canvas = document.getElementById('canvas');
        var context = canvas.getContext('2d');
        canvas.addEventListener('mousemove', function(evt){
            var mousePos = getMousePos(canvas, evt);
            mouseX = mousePos.x;
            mouseY = mousePos.y;
            document.getElementById('mpos').innerHTML = '' + mouseX + "," + mouseY;
            document.getElementById('xypos').innerHTML = '' + Math.round((mouseX + mX), 0) + "," + Math.round((mouseY + mY), 0);
        }, false);
    };
    
    
    //////////////////////////// coins //////////////////////////////// 
    
    var coinTemplate = {
        
        name: 'coin', shape: 'circle', radius: .1, color: 'yellow', 
        //text: 'o', fontSize: 24, boundingBoxType: RECTS, type: 'static'
        
        // handle grabbing da monies
        onStartContact: function(other) {
            
            if (other.name() === 'player') {
                if (!this._destroyed) {// lock
                    addScore(100);
                    if (score >= goal) {
                      alert('you win!');
                    }
                }
                this.destroy();
            }
        }
    };
    
  /*  world.createEntity(coinTemplate, {  x: 3.5,  y: 4   });
    world.createEntity(coinTemplate, {  x: 4,  y: 12    });
    world.createEntity(coinTemplate, {  x: 13, y: 12    });
    world.createEntity(coinTemplate, {  x: 10, y: 10    });
    world.createEntity(coinTemplate, {  x: 17, y: 7     });
    world.createEntity(coinTemplate, {  x: 17.2, y: 3, type: 'static'   }); */
    
    /////////////////////////////  shapes  //////////////////////////////// 

   /* world.createEntity({
        name: 'vbar',x: 13, y: 8, height: .8, width: .2,
    });
    
    world.createEntity({
        name: 'vbar', x: 13, y: 6, height: .8, width: .2,
    }); */

 /*   var i=0;
    var xLoc=3;
    var yLoc=-120;
    while (i<=5)
     {
      world.createGlyphs({
        x: xLoc,
        y: yLoc,
        text: 'o',
        fontSize: 120
       });
     yLoc = yLoc + 5;
     xLoc = xLoc;
     i++;
    } 

var i=0;
    var xLoc=5;
    var yLoc=-120;
    while (i<=5)
     {
      world.createGlyphs({
        x: xLoc,
        y: yLoc,
        text: 'v',
        fontSize: 120
       });
     yLoc = yLoc + 5;
     xLoc = xLoc;
     i++;
    } 

var i=0;
    var xLoc=7;
    var yLoc=-120;
    while (i<=5)
     {
      world.createGlyphs({
        x: xLoc,
        y: yLoc,
        text: 'e',
        fontSize: 120
       });
     yLoc = yLoc + 5;
     xLoc = xLoc;
     i++;
    }  */

    world.createGlyphs({
        x: 7,
        y: 50,
        text: 'E',
        fontSize: 320,
	  //rotation: PI/4
        //type: 'static'
    });
    
    world.createGlyphs({
        x: 9,
        y: 48,
        text: 'VERYONE',
        fontSize: 14,
        boundingBoxType: RECTS, 
	  //rotation: PI/4
        //type: 'static'
    });

world.createGlyphs({
        x: 9,
        y: 45,
        text: 'VENTUALLY',
        fontSize: 14,
        boundingBoxType: RECTS, 
	  //rotation: PI/4
        //type: 'static'
    });

    world.createGlyphs({
        x: 6.5,
        y: 43,
        text: 'E',
        fontSize: 320,
        //type: 'static'
    });

    world.createGlyphs({
        x: 9,
        y: 40,
        text: 'SCAPES',
        fontSize: 14,
        boundingBoxType: RECTS, 
	  //rotation: PI/4
        //type: 'static'
    });

    world.createGlyphs({
        x: 9,
        y: 37,
        text: 'ARTH',
        fontSize: 14,
        boundingBoxType: RECTS, 
	  //rotation: PI/4
        //type: 'static'
    });

    world.createGlyphs({
        x: 6,
        y: 32,
        text: 'E',
        fontSize: 320,
        //type: 'static'
    });

    world.createGlyphs({
        x: 8,
        y: 30,
        text: 'XTENDING',
        fontSize: 14,
        boundingBoxType: RECTS, 
	  //rotation: PI/4
        //type: 'static'
    });

world.createGlyphs({
        x: 8,
        y: 27,
        text: 'VERYTHING',
        fontSize: 14,
        boundingBoxType: RECTS, 
	  //rotation: PI/4
        //type: 'static'
    });



   var eRotate = world.createGlyphs({
        x: 15,
        y: 27,
        text: 'E',
        fontSize: 320,
        //type: 'static'
    });
eRotate.setVelocity(4, 0);

world.createGlyphs({
        x: 17,
        y: 25,
        text: 'ENLESS',
        fontSize: 14,
        boundingBoxType: RECTS, 
	  //rotation: PI/4
        //type: 'static'
    });

world.createGlyphs({
        x: 17,
        y: 22,
        text: 'EMPTINESS',
        fontSize: 14,
        boundingBoxType: RECTS, 
	  //rotation: PI/4
        //type: 'static'
    });

var eRotate2 = world.createGlyphs({
        x: 24,
        y: 20,
        text: 'E',
        fontSize: 150,
        //type: 'static'
    });
eRotate2.setVelocity(4, 0);

var eRotate3 = world.createGlyphs({
        x: 31,
        y: 15,
        text: 'E',
        fontSize: 100,
        //type: 'static'
    });
eRotate3.setVelocity(4, 0);

var eRotate4 = world.createGlyphs({
        x: 38,
        y: 10,
        text: 'E',
        fontSize: 100,
        //type: 'static'
    });
eRotate4.setVelocity(4, 0);

var eRotate5 = world.createGlyphs({
        x: 45,
        y: 10,
        text: 'effervescent',
        fontSize: 20,
        boundingBoxType: RECTS 
        //type: 'static'
    });
eRotate5.setVelocity(4, 0);

world.createGlyphs({
        x: 60,
        y: 10,
        text: 'EVENTUALLY',
        fontSize: 120,
        boundingBoxType: RECTS, 
	  //rotation: PI/4
        type: 'static'
    });

world.createGlyphs({
        x: 63,
        y: 2,
        text: 'EVERYWHERE',
        fontSize: 80,
        boundingBoxType: RECTS, 
	  //rotation: PI/4
        type: 'static'
    });

world.createGlyphs({
        x: 65,
        y: -6,
        text: 'EXTENDING',
        fontSize: 40,
        boundingBoxType: RECTS, 
	  //rotation: PI/4
        type: 'static'
    });

 /*   world.createGlyphs({
        x: 15,
        y: 20,
        text: 'E',
        fontSize: 320,
        //type: 'static'
    });

 world.createGlyphs({
        x: 10,
        y: 6,
        text: 'E',
        fontSize: 320,
        //type: 'static'
    });

    world.createGlyphs({
        x: 40,
        y: 19,
        text: 'b',
        fontSize: 140,
        //type: 'static'
    });
    
    world.createGlyphs({
        x: 45,
        y: 20,
        text: 'a',
        fontSize: 240,
        //type: 'static'
    });

    world.createEntity({
        shape: 'polygon',
        x: 5,
        y: 8
    }); */

    
    ///////////////////////////// elevator //////////////////////////////// 
    
/*	var platform = world.createGlyphs({
	  name: 'platform',
	  fixedRotation: true,
        text: 'L',
        fontSize: 40,
	//type: 'static'
    }); */

    var platformMovingRight = true;
    
    window.setInterval(function() {
        
        platformMovingRight = !platformMovingRight;
        if (platformMovingRight) {
            platform.setVelocity('moving platform', 10, 89);
        }
        else {
            platform.setVelocity('moving platform', 10, -89);
        }
    }, 1500);

    /*var platform = world.createEntity({
        name: 'platform',
        fixedRotation: true,
        height: .1
    });

    var platformMovingUp = true;
    
    window.setInterval(function() {
        
        platformMovingUp = !platformMovingUp;
        if (platformMovingUp) {
            platform.setVelocity('moving platform', 5, 0);
        }
        else {
            platform.setVelocity('moving platform', 5, 180);
        }
    }, 1500); */

// switch every 2 sec 
    
    

    
    /////////////////////////////  mechanics  //////////////////////////////// 

    
    /////////////////////////////  key events //////////////////////////////// 

    
    player.onKeydown(function(e) {
        
        if (this._destroyed) return;
        
        var force = horizForce;
        
        // determine what you're standing on
        var standingOn = false;
        var pos = this.position();
        var allUnderMe = world.find(pos.x - .08, pos.y + .1, pos.x + .09, pos.y + .105);
        for (var i = 0; i < allUnderMe.length; i++) {
            var obj = allUnderMe[i];
            if (obj !== this) {
                standingOn = obj;
                break;
            }
        }
        
        // jump
        if (e.keyCode === 32 && standingOn) {
            this.applyImpulse(vertForce);
            return false;
        }

        // when airborn movement is restricted
        if (!standingOn)  force = force / 2;

        // move left
        if (e.keyCode === 37) {
            this.setForce('movement', force, 270);
            this.friction(.1);
            return false;
        }

        // move right
        if (e.keyCode === 39) {
            this.setForce('movement', force, 90);
            this.friction(.1);
            return false;
        }
        
    });
    
    player.onKeyup(function(e) {
        
        if (this._destroyed) {
            return;
        }
        
        // clear movement force on arrow keyup
        if (e.keyCode === 37 || e.keyCode === 39) {
            this.clearForce('movement');
            this.friction(3);
            return false;
        }
        
    });
    
    ///////////////////////////// collisions //////////////////////////////// 

    function addScore(pts) {
        score += Math.round(pts);
        document.getElementById('score').innerHTML = '' + score;
    }
    player.onImpact(function(other, power, tangentPower) {
        
        if (power > damageForce) {
            damage(power - Math.floor(damageForce));
            this.setColor('red');
        }
    });
    
    player.onFinishContact(function(other, power, tangentPower) {
        this.setColor('gray');
    });
    
    player.setColor = function(col) {
        this._ops.color = col;
    }
        
    function damage(x) {
        if (player._destroyed) return;
        
        health -= Math.round(x);
        if (health < 1) {
            health = 0;
            //player.destroy();
            //alert('game over');
        }
        document.getElementById('health').innerHTML = health;
    }
    
    /////////////////////////////  draw loop  //////////////////////////////// 
    
    world.onRender(function(ctx) {
        
        if (player._destroyed) return;
        
        // update camera position every draw
        var p = player.position();
        var c = this.camera();
        
        if (1) {
            // translate the camera with U
            if (p.y < 60) {
                if (p.x - 8 < c.x) { 
                    this.camera({x: player.position().x - 8});
                    mX = c.x*30;
                }
                else if (p.x - 12 > c.x) { 
                    this.camera({x: player.position().x - 12});
                    mX = c.x*30;
                }

		    if (p.y - 8 < c.y) { 
                    this.camera({y: player.position().y - 8});
                    mY = c.y*30;
                }
                else if (p.y - 12 > c.y) { 
                    this.camera({y: player.position().y - 12});
                    mY = c.y*30;
                }
            }
        
            // If U fall off the world, zoom out
            else {
                var scale = 30;
                scale -= (p.y - 14);
                if (scale <= 1) {
                    player.destroy();
                    alert('game over');
                }
                scale = scale < 1 ? 1 : scale;
                
                this.scale(scale);
                
                var newCameraX = c.x;
                if (newCameraX > -9 || newCameraX < -11) {
                    if (newCameraX > -10) {
                        newCameraX = newCameraX - .3;
                    }
                    if (newCameraX < -10) {
                        newCameraX = newCameraX + .3;
                    }
                    this.camera({x: newCameraX});
                }
            }
        }
        
        if (typeof stats !== 'undefined') RiTaBox.stats.update();
    });
    
    /////////////////////// helpers functions //////////////////////////// 
    

    function createGlyphs() {

        var options = {};
        var args = Array.prototype.slice.call(arguments);
        
        args.reverse();
        for (var key in args) {
            extend(options, args[key]);
        }
        
        //dump(options);
        
        if (!options.text) throw Error("toGlyph: no string");
    
        var detail = options.detail || 60;
        var rotation = options.rotation || 0;
        var fontSize = options.fontSize || 48;
        var font = options.font || "Times New Roman";
        var bboxType = options.boundingBoxType || POLYS;
        var isStatic = options.type === 'static' || false;
        var fixed = options.fixedRotation || false; 

        var player = world.createEntity(options);
        
        var oldBody =  player._body;
        var id = player._body._bbid;
        var pos = player.canvasPosition();

        var rbody = RiTaBox.glyphs(pos.x, pos.y, options.text, font, fontSize, world._world, 
            {   isStatic: isStatic, rotates: !fixed, bbType: bboxType, detail: detail, rotation: rotation });
        
        player._body = rbody;
        player._body._bbid = id;
        player._draw = function(ctx, x, y) {
          var pos = this.canvasPosition();
          ctx.save();
          ctx.strokeStyle = 'black';
          ctx.fillStyle = this._ops.color;
          ctx.scale(world._scale/30, world._scale/30);
          RiTaBox.drawGlyphs(ctx,this._body,pos.x,pos.y);
          ctx.restore();
        };
        world._world.DestroyBody(oldBody);
        
        return player;
    }
    
    // A minimal extend inspired by jQuery
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
    

})();