
/*
 * TODO:  
 *      RECT bb mode for single rect (flat surface)
 *      Toggle for debugDraw
 */
(function() {
    
    /////////////////////////////// setup ///////////////////////////////// 

    var damageForce = 4.5, vertForce = 2.5, horizForce = 4, PI = Math.PI;
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
        x: 2, y: 5
    });
    
    
    /////////////////////////////  ground  //////////////////////////////// 


    var groundTemplate = {
        name: 'ground',
        type: 'static',
        //fixedRotation: false;
        height: .1,
    };
    
    world.createEntity(groundTemplate, { width: 20, x: 0, y: 20, rotation: 45.0 });

    world.createEntity(groundTemplate, { width: 20, x: 20, y: 50, rotation: 45.0 });

    
    /* world.createGlyphs(groundTemplate, { x: 2, y: 11, 
        text: 'O', fontSize: 40, type: 'static', boundingBoxType: RECTS }); 
    
    world.createGlyphs(groundTemplate, { x: 12, y:  4, 
        text: 'PRoToTYpE', fontSize: 40, type: 'static', boundingBoxType: RECTS }); */
    
    
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

    var i=0;
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
    } 

    world.createGlyphs({
        x: -5,
        y: 5,
        text: 'M',
        fontSize: 220,
	  //rotation: PI/4
        //type: 'static'
    });
    
    world.createGlyphs({
        x: 3,
        y: 0,
        text: 'o',
        fontSize: 120,
        //type: 'static'
    });


    world.createGlyphs({
        x: 5,
        y: 0,
        text: 'v',
        fontSize: 120,
        //type: 'static'
    });
    
    world.createGlyphs({
        x: 7,
        y: 0,
        text: 'e',
        fontSize: 120,
        //type: 'static'
    });


  /*  world.createGlyphs({
        x: 40,
        y: 20,
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
            player.destroy();
            alert('game over');
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
                }
                else if (p.x - 12 > c.x) { 
                    this.camera({x: player.position().x - 12});
                }

		    if (p.y - 8 < c.y) { 
                    this.camera({y: player.position().y - 8});
                }
                else if (p.y - 12 > c.y) { 
                    this.camera({y: player.position().y - 12});
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
    
        var detail = options.detail || 30;
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