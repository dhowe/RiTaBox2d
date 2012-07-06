    function b2DemoInit() {
        
        var theCtx = document.getElementsByTagName("canvas")[0].getContext("2d");
        var canvasPosition = getElementPosition(theCtx.canvas);
        
        var   b2Vec2 = Box2D.Common.Math.b2Vec2
            ,  b2AABB = Box2D.Collision.b2AABB
         	,	b2BodyDef = Box2D.Dynamics.b2BodyDef
         	,	b2Body = Box2D.Dynamics.b2Body
         	,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
         	,	b2Fixture = Box2D.Dynamics.b2Fixture
         	,	b2World = Box2D.Dynamics.b2World
         	,	b2MassData = Box2D.Collision.Shapes.b2MassData
         	,	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
         	,	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
         	,	b2DebugDraw = Box2D.Dynamics.b2DebugDraw
            ,   b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef
            ,   b2WeldJointDef =  Box2D.Dynamics.Joints.b2WeldJointDef
            ;
         
         var world = new b2World(
               new b2Vec2(0, 10)    //gravity
            ,  true                 //allow sleep
         );
         
         if (DEBUG_DRAW) {
            var debugDraw = new b2DebugDraw();
            debugDraw.SetSprite(theCtx);
            debugDraw.SetDrawScale(30.0);
            debugDraw.SetFillAlpha(0.5);
            debugDraw.SetLineThickness(1.0);
            debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
            world.SetDebugDraw(debugDraw);
         }
         
         window.requestAnimFrame = (function(){
             return  window.requestAnimationFrame   || 
             window.webkitRequestAnimationFrame     || 
             window.mozRequestAnimationFrame        || 
             window.oRequestAnimationFrame          || 
             window.msRequestAnimationFrame         || 
             function( callback ){
                 window.setTimeout(callback, 1000 / 60);
             };
         })();
         
         //window.setInterval(update, 1000 / 60);
         requestAnimFrame(update); // replaced above
         
         //mouse
         var mouseX, mouseY, mousePVec, isMouseDown, selectedBody, mouseJoint;

         document.addEventListener("mousedown", function(e) {
            isMouseDown = true;
            handleMouseMove(e);
            document.addEventListener("mousemove", handleMouseMove, true);
         }, true);
         
         document.addEventListener("mouseup", function() {
            document.removeEventListener("mousemove", handleMouseMove, true);
            isMouseDown = false;
            mouseX = undefined;
            mouseY = undefined;
         }, true);
         
         function handleMouseMove(e) {
            mouseX = (e.clientX - canvasPosition.x) / 30;
            mouseY = (e.clientY - canvasPosition.y) / 30;
         };
         
         function getBodyAtMouse() {
            mousePVec = new b2Vec2(mouseX, mouseY);
            var aabb = new b2AABB();
            aabb.lowerBound.Set(mouseX - 0.001, mouseY - 0.001);
            aabb.upperBound.Set(mouseX + 0.001, mouseY + 0.001);
            
            // Query the world for overlapping shapes.

            selectedBody = null;
            world.QueryAABB(getBodyCB, aabb);
            return selectedBody;
         }

         function getBodyCB(fixture) {
            if(fixture.GetBody().GetType() != b2Body.b2_staticBody) {
               if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)) {
                  selectedBody = fixture.GetBody();
                  return false;
               }
            }
            return true;
         }
         
         //update
         
         function update() {
             
             if(isMouseDown && (!mouseJoint)) {
                var body = getBodyAtMouse();
                if(body) {
                   var md = new b2MouseJointDef();
                   md.bodyA = world.GetGroundBody();
                   md.bodyB = body;
                   md.target.Set(mouseX, mouseY);
                   md.collideConnected = true;
                   md.maxForce = 300.0 * body.GetMass();
                   mouseJoint = world.CreateJoint(md);
                   body.SetAwake(true);
                }
             }
             
             if(mouseJoint) {
                if(isMouseDown) {
                   mouseJoint.SetTarget(new b2Vec2(mouseX, mouseY));
                } else {
                   world.DestroyJoint(mouseJoint);
                   mouseJoint = null;
                }
             }
          
             // DCH: Add code from here for more accurate stepping?
             //
             // http://stackoverflow.com/questions/5466432/how-do-i-implement-better-time-step-fixed-or-semi-fixed-in-box2d/5466542#5466542
             // and http://www.unagames.com/blog/daniele/2010/06/fixed-time-step-implementation-box2d
             // and http://blog.allanbishop.com/category/physics/
             //
             world.Step(1 / 60, 10, 10);
             world.DrawDebugData();
             world.ClearForces();
             
             drawRiTaBox2d(theCtx);
             
             requestAnimFrame(update);

         };
          
         
         //helpers
         
         //http://js-tut.aardon.de/js-tut/tutorial/position.html
         function getElementPosition(element) {
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
         

         return world; // return from b2DemoInit()
      };
      
