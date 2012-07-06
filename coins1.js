(function() {
    
    /////////////////////////////// setup ///////////////////////////////// 

    var damageForce = 4, vertForce = 2.5, horizForce = 4, PI = Math.PI;
    var canvas = document.getElementById('canvas'), goal = 600, health = 100, score = 0;
    var ctxPos = getElementPosition(canvas);
    
    RiTaBox.enableStats();    
    var world = boxbox.createWorld(canvas, { debugDraw: 0 });
    world.makeGlyphs = function(i,j) {  return makeGlyphs(i,j); }
    world.makeEntity = function(i,j) {  return makeEntity(i,j); }
     
    /////////////////////////////// player ///////////////////////////////// 

    var player = world.makeGlyphs({
        text: 'U',
        fontSize: 50, 
        font: "Times New Roman",
        name: 'player',
        fixedRotation: true,
        friction: .3,
        restitution: 0,
        color: 'gray',
        x: 5, y: 210
    });
    
    
    /////////////////////////////  ground  //////////////////////////////// 

	var groundTemplate = {
        fixedRotation: true,
        name: 'ground',
        type: 'static',
        height: .1*30,
    };
    
    world.makeEntity(groundTemplate, { width: 18*30, x: 8*30, y:20*30 });
    
    world.makeGlyphs(groundTemplate, { x: 50, y: 270,
        text: 'WALKTHRU', fontSize: 48, boundingBoxType: BOX });
    
    world.makeGlyphs(groundTemplate, { x: 480, y:  8*30, 
        text: 'PRoToTYpE', fontSize: 48, boundingBoxType: RECTS });

    //////////////////////////// coins //////////////////////////////// 
    
    var coinTemplate = {
        
        name: 'coin', shape: 'circle', radius: 3, color: 'yellow', 

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
    
    world.makeEntity(coinTemplate, {  x: 290,  y: 360,   });
    world.makeEntity(coinTemplate, {  x: 120,  y: 120,   });
    world.makeEntity(coinTemplate, {  x: 13*30, y: 12*30,    });
    world.makeEntity(coinTemplate, {  x: 650, y: 350,     });
    world.makeEntity(coinTemplate, {  x: 17.2*30, y: 3*30 });//, type: 'static'   });
    
    /////////////////////////////  shapes  //////////////////////////////// 

    world.makeEntity({
        name: 'vbar',x: 290, y: 340, height: .8*30, width: .2*30,
    });
    
    world.makeEntity({
        name: 'vbar', x: 290, y: 380, height: .8*30, width: .2*30,
    });
    
    
    world.makeGlyphs({
        x: 600,
        y: 16.5*30,
        text: 'U',
        fontSize: 140,
        //rotation: PI/4,
        type: 'static'
    });
    
    /*world.makeEntity({
        shape: 'polygon',
        x: 100,
        y: 240
    });*/

    
    ///////////////////////////// elevator //////////////////////////////// 
    
    var platform = world.makeEntity({
        x: 400,
        y: 300,
        name: 'platform',
        fixedRotation: true,
        rotation: PI/16,
        width: 2*30,
        height: .1*30
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
    }, 1500); // switch every 2 sec
    
    

    
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
            if (p.y < 20) {
                if (p.x - 8 < c.x) { 
                    this.camera({x: player.position().x - 8});
                }
                else if (p.x - 12 > c.x) { 
                    this.camera({x: player.position().x - 12});
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
        
        //dump(_options);

        if (_options.x && _options.y) {

            var pos = pixelsToWorld(Math.max(_options.x), _options.y);
            _options.x = pos.x;
            _options.y = pos.y;
        }
        
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
})();