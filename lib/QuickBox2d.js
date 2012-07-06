// from http://www.flipcode.com/archives/Efficient_Polygon_Triangulation.shtml
// + makeClass by John Resig (MIT Licensed)

var Triangulator = __makeClass();

Triangulator.prototype = {

    init : function()
    {
        this.EPSILON=0.0000000001;
    },
    
	area : function(contour)
	{
	
	  var n = contour.length;
	
	  var A=0;
	
	  for(var p=n-1,q=0; q<n; p=q++)
	  {
	    A += contour[p].getX() * contour[q].getY() - contour[q].getX() * contour[p].getY();
	  }
	  
	  return A*0.5;
	},


   /*
     InsideTriangle decides if a point P is Inside of the triangle
     defined by A, B, C.
   */
	insideTriangle : function(Ax, Ay, Bx, By, Cx, Cy, Px, Py)
	{
	  var ax, ay, bx, by, cx, cy, apx, apy, bpx, bpy, cpx, cpy;
	  var cCROSSap, bCROSScp, aCROSSbp;
	
	  ax = Cx - Bx;  ay = Cy - By;
	  bx = Ax - Cx;  by = Ay - Cy;
	  cx = Bx - Ax;  cy = By - Ay;
	  apx= Px - Ax;  apy= Py - Ay;
	  bpx= Px - Bx;  bpy= Py - By;
	  cpx= Px - Cx;  cpy= Py - Cy;
	
	  aCROSSbp = ax*bpy - ay*bpx;
	  cCROSSap = cx*apy - cy*apx;
	  bCROSScp = bx*cpy - by*cpx;
	
	  return ((aCROSSbp >= 0) && (bCROSScp >= 0) && (cCROSSap >= 0));
	},

	snip : function(contour,u,v,w,n,V)
	{
	  var p;
	  var Ax, Ay, Bx, By, Cx, Cy, Px, Py;
	
	  Ax = contour[V[u]].getX();
	  Ay = contour[V[u]].getY();
	
	  Bx = contour[V[v]].getX();
	  By = contour[V[v]].getY();
	
	  Cx = contour[V[w]].getX();
	  Cy = contour[V[w]].getY();
	
	  if ( this.EPSILON > (((Bx-Ax)*(Cy-Ay)) - ((By-Ay)*(Cx-Ax))) ) return false;
	
	  for (p=0;p<n;p++)
	  {
	    if( (p == u) || (p == v) || (p == w) ) continue;
	    Px = contour[V[p]].getX();
	    Py = contour[V[p]].getY();
	    if (this.insideTriangle(Ax,Ay,Bx,By,Cx,Cy,Px,Py)) return false;
	  }
	
	  return true;
	},


	process : function(contour) {

	   var result = [];
	   
	  /* allocate and initialize list of Vertices in polygon */
	
	  var n = contour.length;
	  
	  if ( n < 3 ) return false;
	
	  var V = [];
	
	  /* we want a counter-clockwise polygon in V */
	
	  if ( 0 < this.area(contour) )
	    for (var v=0; v<n; v++) V[v] = v;
	  else
	    for(var v=0; v<n; v++) V[v] = (n-1)-v;
	
	  var nv = n;
	
	  /*  remove nv-2 Vertices, creating 1 triangle every time */
	  var count = 2*nv;   /* error detection */
	
	  for(var m=0, v=nv-1; nv>2; )
	  {
	    /* if we loop, it is probably a non-simple polygon */
	    if (0 >= (count--))
	    {
	      throw error("Triangulate: ERROR - probable bad polygon!");
	    }
	
	    /* three consecutive vertices in current polygon, <u,v,w> */
	    var u = v  ; 
	    if (nv <= u) u = 0;     /* previous */
	    v = u+1; 
	    if (nv <= v) v = 0;    	/* new v    */
	    var w = v+1; 
	    if (nv <= w) w = 0;     /* next     */
	
	    if ( this.snip(contour,u,v,w,nv,V) )
	    {
	      var a,b,c,s,t;
	
	      /* true names of the vertices */
	      a = V[u]; b = V[v]; c = V[w];
	
	      /* output Triangle */
	      /*result.push( contour[a] );
	      result.push( contour[b] );
	      result.push( contour[c] );*/
	      
	      result.push(new Tri2d(contour[a],contour[b],contour[c]));
	
	      m++;
	
	      /* remove v from remaining polygon */
	      for(s=v,t=v+1;t<nv;s++,t++) 
	          V[s] = V[t]; 
	      
	      nv--;
	
	      /* resest error detection counter */
	      count = 2*nv;
	    }
	  }

	  return result;
	}
};


///////////////////////////////////////////////////////////////////////////////////

var Vec2d =  __makeClass();

Vec2d.prototype = {
    init : function(x,y)  {
        this.x =  x;
        this.y =  y;
    },
    getX : function()  {
        return this.x;
    },
    getY : function()  {
        return this.y;
    }
};

///////////////////////////////////////////////////////////////////////////////////

var Tri2d =  __makeClass();

Tri2d.prototype = {
    init : function(x,y,z)  {
        this.p1 = x;
        this.p2 = y;
        this.p3 = z;
    },
    toString : function() {
        return "Tri[("+this.p1.getX()+','+this.p1.getY()+'),('+this.p2.getX()
            +','+this.p2.getY()+'),('+this.p3.getX()+','+this.p3.getY()+")]";
    }
}


function __makeClass() {

    return function(args) {
        
        if (this instanceof arguments.callee) {
            
            if (typeof this.init == "function") {
                
                this.init.apply(this, args && args.callee ? args : arguments);
            }
        } 
        else {
            return new arguments.callee(arguments);
        }
    };
}
    
function test()
{
  // a complicated test contour 

  var a = [];

  a.push( Vec2d(0,6));
  a.push( Vec2d(0,0));
  a.push( Vec2d(3,0));
  a.push( Vec2d(4,1));
  a.push( Vec2d(6,1));
  a.push( Vec2d(8,0));
  a.push( Vec2d(12,0));
  a.push( Vec2d(13,2));
  a.push( Vec2d(8,2));
  a.push( Vec2d(8,4));
  a.push( Vec2d(11,4));
  a.push( Vec2d(11,6));
  a.push( Vec2d(6,6));
  a.push( Vec2d(4,3));
  a.push( Vec2d(2,6));

  var result = Triangulator().process(a);
  
  for (var i=0; i<result.length; i++)
      console.log("Triangle "+(i+1)+" => "+result[i]);
}

