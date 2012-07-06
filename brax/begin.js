(function() {
    
    /////////////////////////////// setup ///////////////////////////////// 

    var damageForce = 3, vertForce = 2.5, horizForce = 4, mouseX = 0, mouseY = 0, mX = 0, mY = 0;

    /////////////////////////////// player ///////////////////////////////// 

    var player = world.makeGlyphs({
        text: 'U',
        fontSize: 40, 
        font: "Times New Roman",
        name: 'player',
        fixedRotation: true,
        friction: .3,
        restitution: 0,
        color: 'gray',
        x: 500, y: 200
    });
    
    
    /////////////////////////////  ground  //////////////////////////////// 

    var groundTemplate = {
        fixedRotation: true,
        name: 'ground',
        type: 'static',
        height: 3,
    };

    world.makeEntity(groundTemplate, { width: 600, x: 0, y: 300, type: 'static'});

    //world.makeEntity(groundTemplate, { width: 600, x: 0, y: 1500, type: 'static'});
    
  /*  world.makeGlyphs(groundTemplate, { x: 1, y:  600,
        text: 'WALKTHRUWALKTHRUWALKTHRUWALKTHRUWALKTHRUWALKTHRU', boundingBoxType: RECTS });
    
    world.makeGlyphs(groundTemplate, { x: 260, y:  240, 
        text: 'PRoToTYpE', fontSize: 52, boundingBoxType: RECTS });
    
    world.makeGlyphs(groundTemplate, { x: 660, y:  240, 
        text: 'TyPiNg', fontSize: 52, boundingBoxType: RECTS });

    world.makeGlyphs(groundTemplate, { x: 880, y:  340, 
       text: 'ROTATION', fontSize: 52, boundingBoxType: RECTS, rotation: -PI/8 });

    world.makeGlyphs(groundTemplate, { x: 1000, y:  440, 
        text: 'ResTiTuTion', fontSize: 52, boundingBoxType: RECTS, rotation: PI/8 });*/

    
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
    
    
/*    world.makeEntity(coinTemplate, {  x: 360,  y: 120,   });
    world.makeEntity(coinTemplate, {  x: 390,  y: 320,   });
    world.makeEntity(coinTemplate, {  x: 240,  y: 360,   });
    world.makeEntity(coinTemplate, {  x: 740,  y: 360,   });*/

    /////////////////////////////  shapes  ////////////////////////////////     
   
   
   
/*var eRotate4 = world.makeGlyphs({
        x: 400,
        y: 200,
        text: 'E',
        fontSize: 300,
        //type: 'static'
    });
eRotate4.setVelocity('up', .25, 0);*/

world.makeGlyphs({
    x: 650,
    y: 320,
    text: 'ONCE_UPON_A_TIME_THERE_WAS_UONCE_UPON_A_TIME_THERE_WAS_UONCE_UPON_A_TIME_THERE_WAS_UONCE_UPON_A_TIME_THERE_WAS_UONCE_UPON_A_TIME_THERE_WAS_UONCE_UPON_A_TIME_THERE_WAS_U',
    fontSize: 50,
    boundingBoxType: RECTS,
    rotation: PI/6,
    type: 'static'
});
 
var ball = {
        //fixedRotation: false,
        name: 'ball',
        text: 'O',
        fontSize: 100,
        //fixedRotation: true,
       //boundingBoxType: RECTS,
    };

//var balls = new array();

/*for (i=0;i<balls.length;i++)
{
balls[i] = makeGlyphs;
}
*/
window.setInterval(function() {
    
   world.makeGlyphs(ball, { x: 700, y: 0 } );
   
}, 6000); // switch every 2 sec

/*var i=0;
var xLoc=700;
var yLoc=-300;
while (i<=5)
 {
  world.makeGlyphs({
    x: xLoc,
    y: yLoc,
    text: 'o',
    fontSize: 120
   });
 yLoc = yLoc - 1350;
 xLoc = xLoc;
 i++;
} */

    ///////////////////////////// elevator //////////////////////////////// 
    
    /*var platform = world.makeEntity({
        x: 590,
        y: 300,
        name: 'platform',
        fixedRotation: true,
        rotation: -PI/32,
        width: 60,
        height: 3
    });*/

/*var platform = world.makeGlyphs({
    x: 100,
    y: 50,
    name: 'platform',
    text: 'T',
    fixedRotation: true,
    //rotation: -PI/32,
    fontSize: 200,
});

    platform.setVelocity('up1', 1, 0);
    var platformMovingUp = true;
    
    window.setInterval(function() {
        
        platformMovingUp = !platformMovingUp;
        if (platformMovingUp) {
            platform.setVelocity('moving platform', 5, 0);
        }
        else {
            platform.setVelocity('moving platform', 5, 180);
        }
    }, 4000); // switch every 2 sec
*/    
    

     
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
                //console.log("=" + standingOn);
                break;
            }
        }
        
        //if (standingOn) console.log("on");
        
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
//            player.destroy();
//            alert('game over');
        }
        document.getElementById('health').innerHTML = health;
    }
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

})();