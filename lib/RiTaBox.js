
// From Paul Irish: http://paulirish.com/2011/requestanimationframe-for-smart-animating/
if (!window.requestAnimFrame) {
    window.requestAnimFrame = (function(){
        return window.requestAnimationFrame || 
               window.webkitRequestAnimationFrame || 
               window.mozRequestAnimationFrame || 
               window.oRequestAnimationFrame || 
               window.msRequestAnimationFrame || 
               function (callback){
                   window.setTimeout(callback, 1000 / 60);
               };
    })();
}

window.RiTaBox = (function() {
    
    /*
     * Poly2Tri Copyright (c) 2009-2010, Poly2Tri Contributors
     * http://code.google.com/p/poly2tri/
     *
     * All rights reserved.
     *
     * Redistribution and use in source and binary forms, with or without modification,
     * are permitted provided that the following conditions are met:
     *
     * * Redistributions of source code must retain the above copyright notice,
     *   this list of conditions and the following disclaimer.
     * * Redistributions in binary form must reproduce the above copyright notice,
     *   this list of conditions and the following disclaimer in the documentation
     *   and/or other materials provided with the distribution.
     * * Neither the name of Poly2Tri nor the names of its contributors may be
     *   used to endorse or promote products derived from this software without specific
     *   prior written permission.
     *
     * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
     * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
     * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
     * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
     * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
     * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
     * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
     * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
     * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
     * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
     * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
     */
    // ------------------------------------------------------------------------Point
    Point = function() {
        this.x = null;
        this.y = null;
        
        if (arguments.length == 0) {
            this.x = 0.0;
            this.y = 0.0;
        } else if (arguments.length == 2) {
            this.x = arguments[0];
            this.y = arguments[1];
        } else {
            alert('Invalid Point constructor call!');
        }

        // The edges this point constitutes an upper ending point
        this.edge_list = [];

    }

    Point.clone = function(p) {
        return new Point(p.x,p.y);
    }
    
    /**
     * Set this Point instance to the origo. <code>(0; 0)</code>
     */
    Point.prototype.set_zero = function() {
        this.x = 0.0;
        this.y = 0.0;
    }

    /**
     * Set the coordinates of this instance.
     * @param   x   number.
     * @param   y   number;
     */
    Point.prototype.set = function(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Negate this Point instance. (component-wise)
     */
    Point.prototype.negate = function() {
        this.x = -this.x;
        this.y = -this.y;
    }

    /**
     * Add another Point object to this instance. (component-wise)
     * @param   n   Point object.
     */
    Point.prototype.add = function(n) {
        this.x += n.x;
        this.y += n.y;
    }

    /**
     * Subtract this Point instance with another point given. (component-wise)
     * @param   n   Point object.
     */
    Point.prototype.sub = function(n) {
        this.x -= n.x;
        this.y -= n.y;
    }

    /**
     * Multiply this Point instance by a scalar. (component-wise)
     * @param   s   scalar.
     */
    Point.prototype.mul = function(s) {
        this.x *= s;
        this.y *= s;
    }

    /**
     * Return the distance of this Point instance from the origo.
     */
    Point.prototype.length = function() {
        return Math.sqrt(this.x*this.x + this.y*this.y);
    }

    /**
     * Normalize this Point instance (as a vector).
     * @return The original distance of this instance from the origo.
     */
    Point.prototype.normalize = function() {
        var len = this.length();
        this.x /= len;
        this.y /= len;
        return len;
    }

    /**
     * Test this Point object with another for equality.
     * @param   p   Point object.
     * @return <code>True</code> if <code>this == p</code>, <code>false</code> otherwise.
     */
    Point.prototype.equals = function(p) {
        return equals(this, p);
    }

    /**
     * Negate a point component-wise and return the result as a new Point object.
     * @param   p   Point object.
     * @return the resulting Point object.
     */
    negate = function(p) {
        return new Point(-p.x, -p.y);
    }

    /**
     * Compare two points component-wise.
     * @param   a   Point object.
     * @param   b   Point object.
     * @return <code>-1</code> if <code>a &lt; b</code>, <code>1</code> if
     *         <code>a &gt; b</code>, <code>0</code> otherwise.
     */
    cmp = function(a, b) {
        if (a.y == b.y) {
            return a.x - b.x;
        } else {
            return a.y - b.y;
        }
    }

    /**
     * Add two points component-wise and return the result as a new Point object.
     * @param   a   Point object.
     * @param   b   Point object.
     * @return the resulting Point object.
     */
    add = function(a, b) {
        return new Point(a.x+b.x, a.y+b.y);
    }

    /**
     * Subtract two points component-wise and return the result as a new Point object.
     * @param   a   Point object.
     * @param   b   Point object.
     * @return the resulting Point object.
     */
    sub = function(a, b) {
        return new Point(a.x-b.x, a.y-b.y);
    }

    /**
     * Multiply a point by a scalar and return the result as a new Point object.
     * @param   s   the scalar (a number).
     * @param   p   Point object.
     * @return the resulting Point object.
     */
    mul = function(s, p) {
        return new Point(s*p.x, s*p.y);
    }

    /**
     * Test two Point objects for equality.
     * @param   a   Point object.
     * @param   b   Point object.
     * @return <code>True</code> if <code>a == b</code>, <code>false</code> otherwise.
     */
    equals = function(a, b) {
        return a.x == b.x && a.y == b.y;
    }

    /**
     * Peform the dot product on two vectors.
     * @param   a   Point object.
     * @param   b   Point object.
     * @return The dot product (as a number).
     */
    dot = function(a, b) {
        return a.x*b.x + a.y*b.y;
    }

    /**
     * Perform the cross product on either two points (this produces a scalar)
     * or a point and a scalar (this produces a point).
     * This function requires two parameters, either may be a Point object or a
     * number.
     * @return a Point object or a number, depending on the parameters.
     */
    cross = function() {
        var a0_p = false;
        var a1_p = false;
        if (arguments.length == 2) {
            if (typeof(arguments[0]) == 'number') {
                a0_p = true;
            }
            if (typeof(arguments[1] == 'number')) {
                a1_p = true;
            }

            if (a0_p) {
                if (a1_p) return arguments[0].x*arguments[1].y - arguments[0].y*arguments[1].x;
                else return new Point(arguments[1]*arguments[0].y, -arguments[1]*arguments[0].x);
            } else {
                if (a1_p) return new Point(-arguments[0]*arguments[1].y, arguments[0]*arguments[1].x);
                else return arguments[0]*arguments[1];
            }
        } else {
            alert('Invalid cross call!');
            return undefined;
        }
    }


    // -------------------------------------------------------------------------Edge
    Edge = function() {

        //console.log("Edge("+arguments.length+") : "+arguments[0]+","+arguments[1]+");");

        this.p = null;
        this.q = null;
        
        if (arguments.length == 2) {
            if (arguments[0].y > arguments[1].y) {
                this.q = arguments[0];
                this.p = arguments[1];
            } else if (arguments[0].y == arguments[1].y) {
                if (arguments[0].x > arguments[1].x) {
                    this.q = arguments[0];
                    this.p = arguments[1];
                } else if (arguments[0].x == arguments[1].x) {
                    alert('Invalid edge constructor call: repeated points!');
                } else {
                    this.p = arguments[0];
                    this.q = arguments[1];
                }
            } else {
                this.p = arguments[0];
                this.q = arguments[1];
            }
        } else {
            alert('Invalid Edge constructor call!');
        }

        this.q.edge_list.push(this);
    }

    // ---------------------------------------------------------------------Triangle
    /**
     * Triangle class.<br>
     * Triangle-based data structures are known to have better performance than
     * quad-edge structures.
     * See: J. Shewchuk, "Triangle: Engineering a 2D Quality Mesh Generator and
     * Delaunay Triangulator", "Triangulations in CGAL"
     * 
     * @param   p1  Point object.
     * @param   p2  Point object.
     * @param   p3  Point object.
     */
    Triangle = function(p1, p2, p3) {
        // Triangle points
        this.points_ = [ null, null, null ];
        // Neighbor list
        this.neighbors_ = [ null, null, null ];
        // Has this triangle been marked as an interior triangle?
        this.interior_ = false;
        // Flags to determine if an edge is a Constrained edge
        this.constrained_edge = [ false, false, false ];
        // Flags to determine if an edge is a Delauney edge
        this.delaunay_edge = [ false, false, false ];

        if (arguments.length == 3) {
            this.points_[0] = p1;
            this.points_[1] = p2;
            this.points_[2] = p3;
        }
    }

    Triangle.prototype.toString = function(scaleToPixels) {
        var sc = scaleToPixels ? 30 : 1;
        var p1 = this.points_[0];
        var p2 = this.points_[1];
        var p3 = this.points_[2];
        return "polytri[("+p1.x*sc+","+p1.y*sc+") ("+p2.x*sc+","+p2.y*sc+") ("+p3.x*sc+","+p3.y*sc+")]";
    }

    Triangle.prototype.GetPoint = function(index) {
        return this.points_[index];
    }

    Triangle.prototype.GetNeighbor = function(index) {
        return this.neighbors_[index];
    }

    /**
     * Test if this Triangle contains the Point objects given as parameters as its
     * vertices.
     * @return <code>True</code> if the Point objects are of the Triangle's vertices,
     *         <code>false</code> otherwise.
     */
    Triangle.prototype.ContainsP = function() {
        var back = true;
        for (var aidx=0; aidx < arguments.length; ++aidx) {
            back = back && (arguments[aidx].equals(this.points_[0]) ||
                            arguments[aidx].equals(this.points_[1]) ||
                            arguments[aidx].equals(this.points_[2])
            );
        }
        return back;
    }

    /**
     * Test if this Triangle contains the Edge objects given as parameters as its
     * bounding edges.
     * @return <code>True</code> if the Edge objects are of the Triangle's bounding
     *         edges, <code>false</code> otherwise.
     */
    Triangle.prototype.ContainsE = function() {
        var back = true;
        for (var aidx=0; aidx < arguments.length; ++aidx) {
            back = back && this.ContainsP(arguments[aidx].p, arguments[aidx].q);
        }
        return back;
    }

    Triangle.prototype.IsInterior = function() {
        if (arguments.length == 0) {
            return this.interior_;
        } else {
            this.interior_ = arguments[0];
            return this.interior_;
        }
    }

    /**
     * Update neighbor pointers.<br>
     * This method takes either 3 parameters (<code>p1</code>, <code>p2</code> and
     * <code>t</code>) or 1 parameter (<code>t</code>).
     * @param   p1  Point object.
     * @param   p2  Point object.
     * @param   t   Triangle object.
     */
    Triangle.prototype.MarkNeighbor = function() {
        var t;
        if (arguments.length == 3) {
            var p1 = arguments[0];
            var p2 = arguments[1];
            t = arguments[2];

            if ((p1.equals(this.points_[2]) && p2.equals(this.points_[1])) || (p1.equals(this.points_[1]) && p2.equals(this.points_[2]))) this.neighbors_[0] = t;
            else if ((p1.equals(this.points_[0]) && p2.equals(this.points_[2])) || (p1.equals(this.points_[2]) && p2.equals(this.points_[0]))) this.neighbors_[1] = t;
            else if ((p1.equals(this.points_[0]) && p2.equals(this.points_[1])) || (p1.equals(this.points_[1]) && p2.equals(this.points_[0]))) this.neighbors_[2] = t;
            else alert('Invalid Triangle.MarkNeighbor call (1)!');
        } else if (arguments.length == 1) {
            // exhaustive search to update neighbor pointers
            t = arguments[0];
            if (t.ContainsP(this.points_[1], this.points_[2])) {
                this.neighbors_[0] = t;
                t.MarkNeighbor(this.points_[1], this.points_[2], this);
            } else if (t.ContainsP(this.points_[0], this.points_[2])) {
                this.neighbors_[1] = t;
                t.MarkNeighbor(this.points_[0], this.points_[2], this);
            } else if (t.ContainsP(this.points_[0], this.points_[1])) {
                this.neighbors_[2] = t;
                t.MarkNeighbor(this.points_[0], this.points_[1], this);
            }
        } else {
            alert('Invalid Triangle.MarkNeighbor call! (2)');
        }
    }

    Triangle.prototype.ClearNeigbors = function() {
        this.neighbors_[0] = null;
        this.neighbors_[1] = null;
        this.neighbors_[2] = null;
    }

    Triangle.prototype.ClearDelunayEdges = function() {
        this.delaunay_edge[0] = false;
        this.delaunay_edge[1] = false;
        this.delaunay_edge[2] = false;
    }

    /**
     * Return the point clockwise to the given point.
     */
    Triangle.prototype.PointCW = function(p) {
        if (p.equals(this.points_[0])) {
            return this.points_[2];
        } else if (p.equals(this.points_[1])) {
            return this.points_[0];
        } else if (p.equals(this.points_[2])) {
            return this.points_[1];
        } else {
            return null;
        }
    }

    /**
     * Return the point counter-clockwise to the given point.
     */
    Triangle.prototype.PointCCW = function(p) {
        if (p.equals(this.points_[0])) {
            return this.points_[1];
        } else if (p.equals(this.points_[1])) {
            return this.points_[2];
        } else if (p.equals(this.points_[2])) {
            return this.points_[0];
        } else {
            return null;
        }
    }

    /**
     * Return the neighbor clockwise to given point.
     */
    Triangle.prototype.NeighborCW = function(p) {
        if (p.equals(this.points_[0])) {
            return this.neighbors_[1];
        } else if (p.equals(this.points_[1])) {
            return this.neighbors_[2];
        } else {
            return this.neighbors_[0];
        }
    }

    /**
     * Return the neighbor counter-clockwise to given point.
     */
    Triangle.prototype.NeighborCCW = function(p) {
        if (p.equals(this.points_[0])) {
            return this.neighbors_[2];
        } else if (p.equals(this.points_[1])) {
            return this.neighbors_[0];
        } else {
            return this.neighbors_[1];
        }
    }

    Triangle.prototype.GetConstrainedEdgeCW = function(p) {
        if (p.equals(this.points_[0])) {
            return this.constrained_edge[1];
        } else if (p.equals(this.points_[1])) {
            return this.constrained_edge[2];
        } else {
            return this.constrained_edge[0];
        }
    }

    Triangle.prototype.GetConstrainedEdgeCCW = function(p) {
        if (p.equals(this.points_[0])) {
            return this.constrained_edge[2];
        } else if (p.equals(this.points_[1])) {
            return this.constrained_edge[0];
        } else {
            return this.constrained_edge[1];
        }
    }

    Triangle.prototype.SetConstrainedEdgeCW = function(p, ce) {
        if (p.equals(this.points_[0])) {
            this.constrained_edge[1] = ce;
        } else if (p.equals(this.points_[1])) {
            this.constrained_edge[2] = ce;
        } else {
            this.constrained_edge[0] = ce;
        }
    }

    Triangle.prototype.SetConstrainedEdgeCCW = function(p, ce) {
        if (p.equals(this.points_[0])) {
            this.constrained_edge[2] = ce;
        } else if (p.equals(this.points_[1])) {
            this.constrained_edge[0] = ce;
        } else {
            this.constrained_edge[1] = ce;
        }
    }

    Triangle.prototype.GetDelaunayEdgeCW = function(p) {
        if (p.equals(this.points_[0])) {
            return this.delaunay_edge[1];
        } else if (p.equals(this.points_[1])) {
            return this.delaunay_edge[2];
        } else {
            return this.delaunay_edge[0];
        }
    }

    Triangle.prototype.GetDelaunayEdgeCCW = function(p) {
        if (p.equals(this.points_[0])) {
            return this.delaunay_edge[2];
        } else if (p.equals(this.points_[1])) {
            return this.delaunay_edge[0];
        } else {
            return this.delaunay_edge[1];
        }
    }

    Triangle.prototype.SetDelaunayEdgeCW = function(p, e) {
        if (p.equals(this.points_[0])) {
            this.delaunay_edge[1] = e;
        } else if (p.equals(this.points_[1])) {
            this.delaunay_edge[2] = e;
        } else {
            this.delaunay_edge[0] = e;
        }
    }

    Triangle.prototype.SetDelaunayEdgeCCW = function(p, e) {
        if (p.equals(this.points_[0])) {
            this.delaunay_edge[2] = e;
        } else if (p.equals(this.points_[1])) {
            this.delaunay_edge[0] = e;
        } else {
            this.delaunay_edge[1] = e;
        }
    }

    /**
     * The neighbor across to given point.
     */
    Triangle.prototype.NeighborAcross = function(p) {
        if (p.equals(this.points_[0])) {
            return this.neighbors_[0];
        } else if (p.equals(this.points_[1])) {
            return this.neighbors_[1];
        } else {
            return this.neighbors_[2];
        }
    }

    Triangle.prototype.OppositePoint = function(t, p) {
        var cw = t.PointCW(p);
        return this.PointCW(cw);
    }

    /**
     * Legalize triangle by rotating clockwise.<br>
     * This method takes either 1 parameter (then the triangle is rotated around
     * points(0)) or 2 parameters (then the triangle is rotated around the first
     * parameter).
     */
    Triangle.prototype.Legalize = function() {
        if (arguments.length == 1) {
            this.Legalize(this.points_[0], arguments[0]);
        } else if (arguments.length == 2) {
            var opoint = arguments[0];
            var npoint = arguments[1];

            if (opoint.equals(this.points_[0])) {
                this.points_[1] = this.points_[0];
                this.points_[0] = this.points_[2];
                this.points_[2] = npoint;
            } else if (opoint.equals(this.points_[1])) {
                this.points_[2] = this.points_[1];
                this.points_[1] = this.points_[0];
                this.points_[0] = npoint;
            } else if (opoint.equals(this.points_[2])) {
                this.points_[0] = this.points_[2];
                this.points_[2] = this.points_[1];
                this.points_[1] = npoint;
            } else {
                alert('Invalid Triangle.Legalize call!');
            }
        } else {
            alert('Invalid Triangle.Legalize call!');
        }
    }

    Triangle.prototype.Index = function(p) {
        if (p.equals(this.points_[0])) return 0;
        else if (p.equals(this.points_[1])) return 1;
        else if (p.equals(this.points_[2])) return 2;
        else return -1;
    }

    Triangle.prototype.EdgeIndex = function(p1, p2) {
        if (p1.equals(this.points_[0])) {
            if (p2.equals(this.points_[1])) {
                return 2;
            } else if (p2.equals(this.points_[2])) {
                return 1;
            }
        } else if (p1.equals(this.points_[1])) {
            if (p2.equals(this.points_[2])) {
                return 0;
            } else if (p2.equals(this.points_[0])) {
                return 2;
            }
        } else if (p1.equals(this.points_[2])) {
            if (p2.equals(this.points_[0])) {
                return 1;
            } else if (p2.equals(this.points_[1])) {
                return 0;
            }
        }
        return -1;
    }

    /**
     * Mark an edge of this triangle as constrained.<br>
     * This method takes either 1 parameter (an edge index or an Edge instance) or
     * 2 parameters (two Point instances defining the edge of the triangle).
     */
    Triangle.prototype.MarkConstrainedEdge = function() {
        if (arguments.length == 1) {
            if (typeof(arguments[0]) == 'number') {
                this.constrained_edge[arguments[0]] = true;
            } else {
                this.MarkConstrainedEdge(arguments[0].p, arguments[0].q);
            }
        } else if (arguments.length == 2) {
            var p = arguments[0];
            var q = arguments[1];
            if ((q.equals(this.points_[0]) && p.equals(this.points_[1])) || (q.equals(this.points_[1]) && p.equals(this.points_[0]))) {
                this.constrained_edge[2] = true;
            } else if ((q.equals(this.points_[0]) && p.equals(this.points_[2])) || (q.equals(this.points_[2]) && p.equals(this.points_[0]))) {
                this.constrained_edge[1] = true;
            } else if ((q.equals(this.points_[1]) && p.equals(this.points_[2])) || (q.equals(this.points_[2]) && p.equals(this.points_[1]))) {
                this.constrained_edge[0] = true;
            }
        } else {
            alert('Invalid Triangle.MarkConstrainedEdge call!');
        }
    }

    // -------------------------------- Poly2Tri Utils---------------------------------
    
    PI_3div4 = 3 * Math.PI / 4;
    PI_2 = Math.PI / 2;
    EPSILON = 1e-12;

    /* 
     * Inital triangle factor, seed triangle will extend 30% of
     * PointSet width to both left and right.
     */
    kAlpha = 0.3;

    Orientation = {
        "CW"        : 1,
        "CCW"       : -1,
        "COLLINEAR" : 0
    };

    /**
     * Forumla to calculate signed area<br>
     * Positive if CCW<br>
     * Negative if CW<br>
     * 0 if collinear<br>
     * <pre>
     * A[P1,P2,P3]  =  (x1*y2 - y1*x2) + (x2*y3 - y2*x3) + (x3*y1 - y3*x1)
     *              =  (x1-x3)*(y2-y3) - (y1-y3)*(x2-x3)
     * </pre>
     */
    Orient2d = function(pa, pb, pc) {
        var detleft = (pa.x - pc.x) * (pb.y - pc.y);
        var detright = (pa.y - pc.y) * (pb.x - pc.x);
        var val = detleft - detright;
        if (val > -(EPSILON) && val < (EPSILON)) {
            return Orientation.COLLINEAR;
        } else if (val > 0) {
            return Orientation.CCW;
        } else {
            return Orientation.CW;
        }
    }

    InScanArea = function(pa, pb, pc, pd) {
        var pdx = pd.x;
        var pdy = pd.y;
        var adx = pa.x - pdx;
        var ady = pa.y - pdy;
        var bdx = pb.x - pdx;
        var bdy = pb.y - pdy;

        var adxbdy = adx * bdy;
        var bdxady = bdx * ady;
        var oabd = adxbdy - bdxady;

        if (oabd <= (EPSILON)) {
            return false;
        }

        var cdx = pc.x - pdx;
        var cdy = pc.y - pdy;

        var cdxady = cdx * ady;
        var adxcdy = adx * cdy;
        var ocad = cdxady - adxcdy;

        if (ocad <= (EPSILON)) {
            return false;
        }

        return true;
    }

    // ---------------------------------------------------------------AdvancingFront
    Node = function() {
        this.point = null; // Point
        this.triangle = null; // Triangle

        this.next = null; // Node
        this.prev = null; // Node

        this.value = 0.0; // double

        if (arguments.length == 1) {
            this.point = arguments[0];
            this.value = this.point.x;
        } else if (arguments.length == 2) {
            this.point = arguments[0];
            this.triangle = arguments[1];
            this.value = this.point.x;
        } else {
            alert('Invalid Node constructor call!');
        }
    }

    AdvancingFront = function(head, tail) {
        this.head_ = head; // Node
        this.tail_ = tail; // Node
        this.search_node_ = head; // Node
    }

    AdvancingFront.prototype.head = function() {
        return this.head_;
    }

    AdvancingFront.prototype.set_head = function(node) {
        this.head_ = node;
    }

    AdvancingFront.prototype.tail = function() {
        return this.tail_;
    }

    AdvancingFront.prototype.set_tail = function(node) {
        this.tail_ = node;
    }

    AdvancingFront.prototype.search = function() {
        return this.search_node_;
    }

    AdvancingFront.prototype.set_search = function(node) {
        this.search_node_ = node;
    }

    AdvancingFront.prototype.FindSearchNode = function(x) {
        return this.search_node_;
    }

    AdvancingFront.prototype.LocateNode = function(x) {
        var node = this.search_node_;

        if (x < node.value) {
            while ((node = node.prev) != null) {
                if (x >= node.value) {
                    this.search_node_ = node;
                    return node;
                }
            }
        } else {
            while ((node = node.next) != null) {
                if (x < node.value) {
                    this.search_node_ = node.prev;
                    return node.prev;
                }
            }
        }
        return null;
    }

    AdvancingFront.prototype.LocatePoint = function(point) {

        var px = point.x;
        var node = this.FindSearchNode(px);
        var nx = node.point.x;

        if (px == nx) {
            // We might have two nodes with same x value for a short time
            if (node.prev && point.equals(node.prev.point)) {
                node = node.prev;
            } else if (point.equals(node.next.point)) {
                node = node.next;
            } else if (point.equals(node.point)) {
                // do nothing
            } else {
                alert('Invalid AdvancingFront.LocatePoint call!');
                return null;
            }
        } else if (px < nx) {
            while ((node = node.prev) != null) {
                if (point.equals(node.point)) break;
            }
        } else {
            while ((node = node.next) != null) {
                if (point.equals(node.point)) break;
            }
        }

        if (node != null) this.search_node_ = node;
        return node;
    }

    // ------------------------------------------------------------------------Basin
    Basin = function() {
        this.left_node = null; // Node
        this.bottom_node = null; // Node
        this.right_node = null; // Node
        this.width = 0.0; // number
        this.left_highest = false;
    }

    Basin.prototype.Clear = function() {
        this.left_node = null;
        this.bottom_node = null;
        this.right_node = null;
        this.width = 0.0;
        this.left_highest = false;
    }

    // --------------------------------------------------------------------EdgeEvent
    EdgeEvent = function() {
        this.constrained_edge = null; // Edge
        this.right = false;
    }

    // -----------------------------------------------------------------SweepContext
    SweepContext = function(polyline) {
        this.triangles_ = [];
        this.map_ = [];
        this.points_ = polyline;
        this.edge_list = [];

        // Advancing front
        this.front_ = null; // AdvancingFront
        // head point used with advancing front
        this.head_ = null; // Point
        // tail point used with advancing front
        this.tail_ = null; // Point

        this.af_head_ = null; // Node
        this.af_middle_ = null; // Node
        this.af_tail_ = null; // Node

        this.basin = new Basin();
        this.edge_event = new EdgeEvent();

        this.InitEdges(this.points_);
    }

    SweepContext.prototype.AddHole = function(polyline) {
        this.InitEdges(polyline);
        for (var i in polyline) {
            this.points_.push(polyline[i]);
        }
    }

    SweepContext.prototype.front = function() {
        return this.front_;
    }

    SweepContext.prototype.point_count = function() {
        return this.points_.length;
    }

    SweepContext.prototype.head = function() {
        return this.head_;
    }

    SweepContext.prototype.set_head = function(p1) {
        this.head_ = p1;
    }

    SweepContext.prototype.tail = function() {
        return this.tail_;
    }

    SweepContext.prototype.set_tail = function(p1) {
        this.tail_ = p1;
    }

    SweepContext.prototype.GetTriangles = function() {
        return this.triangles_;
    }

    SweepContext.prototype.GetMap = function() {
        return this.map_;
    }

    SweepContext.prototype.InitTriangulation = function() {
        var xmax = this.points_[0].x;
        var xmin = this.points_[0].x;
        var ymax = this.points_[0].y;
        var ymin = this.points_[0].y;

        // Calculate bounds
        for (var i in this.points_) {
            var p = this.points_[i];
            if (p.x > xmax) xmax = p.x;
            if (p.x < xmin) xmin = p.x;
            if (p.y > ymax) ymax = p.y;
            if (p.y < ymin) ymin = p.y;
        }

        var dx = kAlpha * (xmax - xmin);
        var dy = kAlpha * (ymax - ymin);
        this.head_ = new Point(xmax + dx, ymin - dy);
        this.tail_ = new Point(xmin - dy, ymin - dy);

        // Sort points along y-axis
        this.points_.sort(cmp);
    }

    SweepContext.prototype.InitEdges = function(polyline) {
        for (var i=0; i < polyline.length; ++i) {
            this.edge_list.push(new Edge(polyline[i], polyline[(i+1) % polyline.length]));
        }
    }

    SweepContext.prototype.GetPoint = function(index) {
        return this.points_[index];
    }

    SweepContext.prototype.AddToMap = function(triangle) {
        this.map_.push(triangle);
    }

    SweepContext.prototype.LocateNode = function(point) {
        return this.front_.LocateNode(point.x);
    }

    SweepContext.prototype.CreateAdvancingFront = function() {
        var head;
        var middle;
        var tail;
        // Initial triangle
        var triangle = new Triangle(this.points_[0], this.tail_, this.head_);

        this.map_.push(triangle);

        head = new Node(triangle.GetPoint(1), triangle);
        middle = new Node(triangle.GetPoint(0), triangle);
        tail = new Node(triangle.GetPoint(2));

        this.front_ = new AdvancingFront(head, tail);

        head.next = middle;
        middle.next = tail;
        middle.prev = head;
        tail.prev = middle;
    }

    SweepContext.prototype.RemoveNode = function(node) {
        // do nothing
    }

    SweepContext.prototype.MapTriangleToNodes = function(t) {
        for (var i=0; i<3; ++i) {
            if (t.GetNeighbor(i) == null) {
                var n = this.front_.LocatePoint(t.PointCW(t.GetPoint(i)));
                if (n != null) {
                    n.triangle = t;
                }
            }
        }
    }

    SweepContext.prototype.RemoveFromMap = function(triangle) {
        for (var i in this.map_) {
            if (this.map_[i] == triangle) {
                delete this.map_[i];
                break;
            }
        }
    }

    SweepContext.prototype.MeshClean = function(triangle) {
        if (triangle != null && !triangle.IsInterior()) {
            triangle.IsInterior(true);
            this.triangles_.push(triangle);
            for (var i=0; i<3; ++i) {
                if (!triangle.constrained_edge[i]) {
                    this.MeshClean(triangle.GetNeighbor(i));
                }
            }
        }
    }

    // ------------------------------------------------------------------------Sweep

    var sweep = {};
    /**
     * Triangulate simple polygon with holes.
     * @param   tcx SweepContext object.
     */
    sweep.Triangulate = function(tcx) {
        tcx.InitTriangulation();
        tcx.CreateAdvancingFront();
        // Sweep points; build mesh
        sweep.SweepPoints(tcx);
        // Clean up
        sweep.FinalizationPolygon(tcx);
    }

    sweep.SweepPoints = function(tcx) {
        for (var i=1; i < tcx.point_count(); ++i) {
            var point = tcx.GetPoint(i);
            var node = sweep.PointEvent(tcx, point);
            for (var j=0; j < point.edge_list.length; ++j) {
                sweep.EdgeEvent(tcx, point.edge_list[j], node);
            }
        }
    }

    sweep.FinalizationPolygon = function(tcx) {
        // Get an Internal triangle to start with
        var t = tcx.front().head().next.triangle;
        var p = tcx.front().head().next.point;
        while (!t.GetConstrainedEdgeCW(p)) {
            t = t.NeighborCCW(p);
        }

        // Collect interior triangles constrained by edges
        tcx.MeshClean(t);
    }

    /**
     * Find closes node to the left of the new point and
     * create a new triangle. If needed new holes and basins
     * will be filled to.
     */
    sweep.PointEvent = function(tcx, point) {
        var node = tcx.LocateNode(point);
        var new_node = sweep.NewFrontTriangle(tcx, point, node);

        // Only need to check +epsilon since point never have smaller
        // x value than node due to how we fetch nodes from the front
        if (point.x <= node.point.x + (EPSILON)) {
            sweep.Fill(tcx, node);
        }

        //tcx.AddNode(new_node);

        sweep.FillAdvancingFront(tcx, new_node);
        return new_node;
    }

    sweep.EdgeEvent = function() {
        var tcx;
        if (arguments.length == 3) {
            tcx = arguments[0];
            var edge = arguments[1];
            var node = arguments[2];

            tcx.edge_event.constrained_edge = edge;
            tcx.edge_event.right = (edge.p.x > edge.q.x);

            if (sweep.IsEdgeSideOfTriangle(node.triangle, edge.p, edge.q)) {
                return;
            }

            // For now we will do all needed filling
            // todo: integrate with flip process might give some better performance
            //       but for now this avoid the issue with cases that needs both flips and fills
            sweep.FillEdgeEvent(tcx, edge, node);
            sweep.EdgeEvent(tcx, edge.p, edge.q, node.triangle, edge.q);
        } else if (arguments.length == 5) {
            tcx = arguments[0];
            var ep = arguments[1];
            var eq = arguments[2];
            var triangle = arguments[3];
            var point = arguments[4];

            if (sweep.IsEdgeSideOfTriangle(triangle, ep, eq)) {
                return;
            }

            var p1 = triangle.PointCCW(point);
            var o1 = Orient2d(eq, p1, ep);
            if (o1 == Orientation.COLLINEAR) {
                alert('sweep.EdgeEvent: Collinear not supported!');
                return;
            }

            var p2 = triangle.PointCW(point);
            var o2 = Orient2d(eq, p2, ep);
            if (o2 == Orientation.COLLINEAR) {
                alert('sweep.EdgeEvent: Collinear not supported!');
                return;
            }

            if (o1 == o2) {
                // Need to decide if we are rotating CW or CCW to get to a triangle
                // that will cross edge
                if (o1 == Orientation.CW) {
                    triangle = triangle.NeighborCCW(point);
                } else {
                    triangle = triangle.NeighborCW(point);
                }
                sweep.EdgeEvent(tcx, ep, eq, triangle, point);
            } else {
                // This triangle crosses constraint so lets flippin start!
                sweep.FlipEdgeEvent(tcx, ep, eq, triangle, point);
            }
        } else {
            alert('Invalid sweep.EdgeEvent call!');
        }
    }

    sweep.IsEdgeSideOfTriangle = function(triangle, ep, eq) {
        var index = triangle.EdgeIndex(ep, eq);
        if (index != -1) {
            triangle.MarkConstrainedEdge(index);
            var t = triangle.GetNeighbor(index);
            if (t != null) {
                t.MarkConstrainedEdge(ep, eq);
            }
            return true;
        }
        return false;    
    }

    sweep.NewFrontTriangle = function(tcx, point, node) {
        var triangle = new Triangle(point, node.point, node.next.point);

        triangle.MarkNeighbor(node.triangle);
        tcx.AddToMap(triangle);

        var new_node = new Node(point);
        new_node.next = node.next;
        new_node.prev = node;
        node.next.prev = new_node;
        node.next = new_node;

        if (!sweep.Legalize(tcx, triangle)) {
            tcx.MapTriangleToNodes(triangle);
        }

        return new_node;
    }

    /**
     * Adds a triangle to the advancing front to fill a hole.
     * @param tcx
     * @param node - middle node, that is the bottom of the hole
     */
    sweep.Fill = function(tcx, node) {
        var triangle = new Triangle(node.prev.point, node.point, node.next.point);

        // todo: should copy the constrained_edge value from neighbor triangles
        //       for now constrained_edge values are copied during the legalize
        triangle.MarkNeighbor(node.prev.triangle);
        triangle.MarkNeighbor(node.triangle);

        tcx.AddToMap(triangle);

        // Update the advancing front
        node.prev.next = node.next;
        node.next.prev = node.prev;


        // If it was legalized the triangle has already been mapped
        if (!sweep.Legalize(tcx, triangle)) {
            tcx.MapTriangleToNodes(triangle);
        }

        //tcx.RemoveNode(node);
    }

    /**
     * Fills holes in the Advancing Front
     */
    sweep.FillAdvancingFront = function(tcx, n) {
        // Fill right holes
        var node = n.next;
        var angle;

        while (node.next != null) {
            angle = sweep.HoleAngle(node);
            if (angle > PI_2 || angle < -(PI_2)) break;
            sweep.Fill(tcx, node);
            node = node.next;
        }

        // Fill left holes
        node = n.prev;

        while (node.prev != null) {
            angle = sweep.HoleAngle(node);
            if (angle > PI_2 || angle < -(PI_2)) break;
            sweep.Fill(tcx, node);
            node = node.prev;
        }

        // Fill right basins
        if (n.next != null && n.next.next != null) {
            angle = sweep.BasinAngle(n);
            if (angle < PI_3div4) {
                sweep.FillBasin(tcx, n);
            }
        }
    }

    sweep.BasinAngle = function(node) {
        var ax = node.point.x - node.next.next.point.x;
        var ay = node.point.y - node.next.next.point.y;
        return Math.atan2(ay, ax);
    }

    /**
     *
     * @param node - middle node
     * @return the angle between 3 front nodes
     */
    sweep.HoleAngle = function(node) {
      /* Complex plane
       * ab = cosA +i*sinA
       * ab = (ax + ay*i)(bx + by*i) = (ax*bx + ay*by) + i(ax*by-ay*bx)
       * atan2(y,x) computes the principal value of the argument function
       * applied to the complex number x+iy
       * Where x = ax*bx + ay*by
       *       y = ax*by - ay*bx
       */
      var ax = node.next.point.x - node.point.x;
      var ay = node.next.point.y - node.point.y;
      var bx = node.prev.point.x - node.point.x;
      var by = node.prev.point.y - node.point.y;
      return Math.atan2(ax * by - ay * bx, ax * bx + ay * by);
    }

    /**
     * Returns true if triangle was legalized
     */
    sweep.Legalize = function(tcx, t) {
        // To legalize a triangle we start by finding if any of the three edges
        // violate the Delaunay condition
        for (var i=0; i < 3; ++i) {
            if (t.delaunay_edge[i]) continue;

            var ot = t.GetNeighbor(i);
            if (ot != null) {
                var p = t.GetPoint(i);
                var op = ot.OppositePoint(t, p);
                var oi = ot.Index(op);

                // If this is a Constrained Edge or a Delaunay Edge(only during recursive legalization)
                // then we should not try to legalize
                if (ot.constrained_edge[oi] || ot.delaunay_edge[oi]) {
                    t.constrained_edge[i] = ot.constrained_edge[oi];
                    continue;
                }

                var inside = sweep.Incircle(p, t.PointCCW(p), t.PointCW(p), op);
                if (inside) {
                    // Lets mark this shared edge as Delaunay
                    t.delaunay_edge[i] = true;
                    ot.delaunay_edge[oi] = true;

                    // Lets rotate shared edge one vertex CW to legalize it
                    sweep.RotateTrianglePair(t, p, ot, op);

                    // We now got one valid Delaunay Edge shared by two triangles
                    // This gives us 4 new edges to check for Delaunay

                    // Make sure that triangle to node mapping is done only one time for a specific triangle
                    var not_legalized = !sweep.Legalize(tcx, t);
                    if (not_legalized) {
                        tcx.MapTriangleToNodes(t);
                    }

                    not_legalized = !sweep.Legalize(tcx, ot);
                    if (not_legalized) tcx.MapTriangleToNodes(ot);

                    // Reset the Delaunay edges, since they only are valid Delaunay edges
                    // until we add a new triangle or point.
                    // todo: need to think about this. Can these edges be tried after we
                    //      return to previous recursive level?
                    t.delaunay_edge[i] = false;
                    ot.delaunay_edge[oi] = false;

                    // If triangle have been legalized no need to check the other edges since
                    // the recursive legalization will handles those so we can end here.
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * <b>Requirement</b>:<br>
     * 1. a,b and c form a triangle.<br>
     * 2. a and d is know to be on opposite side of bc<br>
     * <pre>
     *                a
     *                +
     *               / \
     *              /   \
     *            b/     \c
     *            +-------+
     *           /    d    \
     *          /           \
     * </pre>
     * <b>Fact</b>: d has to be in area B to have a chance to be inside the circle formed by
     *  a,b and c<br>
     *  d is outside B if orient2d(a,b,d) or orient2d(c,a,d) is CW<br>
     *  This preknowledge gives us a way to optimize the incircle test
     * @param pa - triangle point, opposite d
     * @param pb - triangle point
     * @param pc - triangle point
     * @param pd - point opposite a
     * @return true if d is inside circle, false if on circle edge
     */
    sweep.Incircle = function(pa, pb, pc, pd) {
        var adx = pa.x - pd.x;
        var ady = pa.y - pd.y;
        var bdx = pb.x - pd.x;
        var bdy = pb.y - pd.y;

        var adxbdy = adx * bdy;
        var bdxady = bdx * ady;
        var oabd = adxbdy - bdxady;

        if (oabd <= 0) return false;

        var cdx = pc.x - pd.x;
        var cdy = pc.y - pd.y;

        var cdxady = cdx * ady;
        var adxcdy = adx * cdy;
        var ocad = cdxady - adxcdy;

        if (ocad <= 0) return false;

        var bdxcdy = bdx * cdy;
        var cdxbdy = cdx * bdy;

        var alift = adx * adx + ady * ady;
        var blift = bdx * bdx + bdy * bdy;
        var clift = cdx * cdx + cdy * cdy;

        var det = alift * (bdxcdy - cdxbdy) + blift * ocad + clift * oabd;
        return det > 0;
    }

    /**
     * Rotates a triangle pair one vertex CW
     *<pre>
     *       n2                    n2
     *  P +-----+             P +-----+
     *    | t  /|               |\  t |
     *    |   / |               | \   |
     *  n1|  /  |n3           n1|  \  |n3
     *    | /   |    after CW   |   \ |
     *    |/ oT |               | oT \|
     *    +-----+ oP            +-----+
     *       n4                    n4
     * </pre>
     */
    sweep.RotateTrianglePair = function(t, p, ot, op) {
        var n1; var n2; var n3; var n4;
        n1 = t.NeighborCCW(p);
        n2 = t.NeighborCW(p);
        n3 = ot.NeighborCCW(op);
        n4 = ot.NeighborCW(op);

        var ce1; var ce2; var ce3; var ce4;
        ce1 = t.GetConstrainedEdgeCCW(p);
        ce2 = t.GetConstrainedEdgeCW(p);
        ce3 = ot.GetConstrainedEdgeCCW(op);
        ce4 = ot.GetConstrainedEdgeCW(op);

        var de1; var de2; var de3; var de4;
        de1 = t.GetDelaunayEdgeCCW(p);
        de2 = t.GetDelaunayEdgeCW(p);
        de3 = ot.GetDelaunayEdgeCCW(op);
        de4 = ot.GetDelaunayEdgeCW(op);

        t.Legalize(p, op);
        ot.Legalize(op, p);

        // Remap delaunay_edge
        ot.SetDelaunayEdgeCCW(p, de1);
        t.SetDelaunayEdgeCW(p, de2);
        t.SetDelaunayEdgeCCW(op, de3);
        ot.SetDelaunayEdgeCW(op, de4);

        // Remap constrained_edge
        ot.SetConstrainedEdgeCCW(p, ce1);
        t.SetConstrainedEdgeCW(p, ce2);
        t.SetConstrainedEdgeCCW(op, ce3);
        ot.SetConstrainedEdgeCW(op, ce4);

        // Remap neighbors
        // todo: might optimize the markNeighbor by keeping track of
        //      what side should be assigned to what neighbor after the
        //      rotation. Now mark neighbor does lots of testing to find
        //      the right side.
        t.ClearNeigbors();
        ot.ClearNeigbors();
        if (n1) ot.MarkNeighbor(n1);
        if (n2) t.MarkNeighbor(n2);
        if (n3) t.MarkNeighbor(n3);
        if (n4) ot.MarkNeighbor(n4);
        t.MarkNeighbor(ot);
    }

    /**
     * Fills a basin that has formed on the Advancing Front to the right
     * of given node.<br>
     * First we decide a left,bottom and right node that forms the
     * boundaries of the basin. Then we do a reqursive fill.
     *
     * @param tcx
     * @param node - starting node, this or next node will be left node
     */
    sweep.FillBasin = function(tcx, node) {
        if (Orient2d(node.point, node.next.point, node.next.next.point) == Orientation.CCW) {
            tcx.basin.left_node = node.next.next;
        } else {
            tcx.basin.left_node = node.next;
        }

        // Find the bottom and right node
        tcx.basin.bottom_node = tcx.basin.left_node;
        while (tcx.basin.bottom_node.next != null && tcx.basin.bottom_node.point.y >= tcx.basin.bottom_node.next.point.y) {
            tcx.basin.bottom_node = tcx.basin.bottom_node.next;
        }
        if (tcx.basin.bottom_node == tcx.basin.left_node) {
            // No valid basin
            return;
        }

        tcx.basin.right_node = tcx.basin.bottom_node;
        while (tcx.basin.right_node.next != null && tcx.basin.right_node.point.y < tcx.basin.right_node.next.point.y) {
            tcx.basin.right_node = tcx.basin.right_node.next;
        }
        if (tcx.basin.right_node == tcx.basin.bottom_node) {
            // No valid basins
            return;
        }

        tcx.basin.width = tcx.basin.right_node.point.x - tcx.basin.left_node.point.x;
        tcx.basin.left_highest = tcx.basin.left_node.point.y > tcx.basin.right_node.point.y;

        sweep.FillBasinReq(tcx, tcx.basin.bottom_node);
    }

    /**
     * Recursive algorithm to fill a Basin with triangles
     *
     * @param tcx
     * @param node - bottom_node
     */
    sweep.FillBasinReq = function(tcx, node) {
        // if shallow stop filling
        if (sweep.IsShallow(tcx, node)) {
            return;
        }

        sweep.Fill(tcx, node);

        var o;
        if (node.prev == tcx.basin.left_node && node.next == tcx.basin.right_node) {
            return;
        } else if (node.prev == tcx.basin.left_node) {
            o = Orient2d(node.point, node.next.point, node.next.next.point);
            if (o == Orientation.CW) {
                return;
            }
            node = node.next;
        } else if (node.next == tcx.basin.right_node) {
            o = Orient2d(node.point, node.prev.point, node.prev.prev.point);
            if (o == Orientation.CCW) {
                return;
            }
            node = node.prev;
        } else {
            // Continue with the neighbor node with lowest Y value
            if (node.prev.point.y < node.next.point.y) {
                node = node.prev;
            } else {
                node = node.next;
            }
        }

        sweep.FillBasinReq(tcx, node);
    }

    sweep.IsShallow = function(tcx, node) {
        var height;
        if (tcx.basin.left_highest) {
            height = tcx.basin.left_node.point.y - node.point.y;
        } else {
            height = tcx.basin.right_node.point.y - node.point.y;
        }

        // if shallow stop filling
        if (tcx.basin.width > height) {
            return true;
        }
        return false;
    }

    sweep.FillEdgeEvent = function(tcx, edge, node) {
        if (tcx.edge_event.right) {
            sweep.FillRightAboveEdgeEvent(tcx, edge, node);
        } else {
            sweep.FillLeftAboveEdgeEvent(tcx, edge, node);
        }
    }

    sweep.FillRightAboveEdgeEvent = function(tcx, edge, node) {
        while (node.next.point.x < edge.p.x) {
            // Check if next node is below the edge
            if (Orient2d(edge.q, node.next.point, edge.p) == Orientation.CCW) {
                sweep.FillRightBelowEdgeEvent(tcx, edge, node);
            } else {
                node = node.next;
            }
        }
    }

    sweep.FillRightBelowEdgeEvent = function(tcx, edge, node) {
        if (node.point.x < edge.p.x) {
            if (Orient2d(node.point, node.next.point, node.next.next.point) == Orientation.CCW) {
                // Concave
                sweep.FillRightConcaveEdgeEvent(tcx, edge, node);
            } else{
                // Convex
                sweep.FillRightConvexEdgeEvent(tcx, edge, node);
                // Retry this one
                sweep.FillRightBelowEdgeEvent(tcx, edge, node);
            }
        }
    }

    sweep.FillRightConcaveEdgeEvent = function(tcx, edge, node) {
        sweep.Fill(tcx, node.next);
        if (node.next.point != edge.p) {
            // Next above or below edge?
            if (Orient2d(edge.q, node.next.point, edge.p) == Orientation.CCW) {
                // Below
                if (Orient2d(node.point, node.next.point, node.next.next.point) == Orientation.CCW) {
                    // Next is concave
                    sweep.FillRightConcaveEdgeEvent(tcx, edge, node);
                } else {
                // Next is convex
                }
            }
        }
    }

    sweep.FillRightConvexEdgeEvent = function(tcx, edge, node) {
        // Next concave or convex?
        if (Orient2d(node.next.point, node.next.next.point, node.next.next.next.point) == Orientation.CCW) {
            // Concave
            sweep.FillRightConcaveEdgeEvent(tcx, edge, node.next);
        } else {
            // Convex
            // Next above or below edge?
            if (Orient2d(edge.q, node.next.next.point, edge.p) == Orientation.CCW) {
                // Below
                sweep.FillRightConvexEdgeEvent(tcx, edge, node.next);
            } else {
                // Above
            }
        }
    }

    sweep.FillLeftAboveEdgeEvent = function(tcx, edge, node) {
        while (node.prev.point.x > edge.p.x) {
            // Check if next node is below the edge
            if (Orient2d(edge.q, node.prev.point, edge.p) == Orientation.CW) {
                sweep.FillLeftBelowEdgeEvent(tcx, edge, node);
            } else {
                node = node.prev;
            }
        }
    }

    sweep.FillLeftBelowEdgeEvent = function(tcx, edge, node) {
        if (node.point.x > edge.p.x) {
            if (Orient2d(node.point, node.prev.point, node.prev.prev.point) == Orientation.CW) {
                // Concave
                sweep.FillLeftConcaveEdgeEvent(tcx, edge, node);
            } else {
                // Convex
                sweep.FillLeftConvexEdgeEvent(tcx, edge, node);
                // Retry this one
                sweep.FillLeftBelowEdgeEvent(tcx, edge, node);
            }
        }
    }

    sweep.FillLeftConvexEdgeEvent = function(tcx, edge, node) {
        // Next concave or convex?
        if (Orient2d(node.prev.point, node.prev.prev.point, node.prev.prev.prev.point) == Orientation.CW) {
            // Concave
            sweep.FillLeftConcaveEdgeEvent(tcx, edge, node.prev);
        } else {
            // Convex
            // Next above or below edge?
            if (Orient2d(edge.q, node.prev.prev.point, edge.p) == Orientation.CW) {
                // Below
                sweep.FillLeftConvexEdgeEvent(tcx, edge, node.prev);
            } else {
                // Above
            }
        }
    }

    sweep.FillLeftConcaveEdgeEvent = function(tcx, edge, node) {
        sweep.Fill(tcx, node.prev);
        if (node.prev.point != edge.p) {
            // Next above or below edge?
            if (Orient2d(edge.q, node.prev.point, edge.p) == Orientation.CW) {
                // Below
                if (Orient2d(node.point, node.prev.point, node.prev.prev.point) == Orientation.CW) {
                    // Next is concave
                    sweep.FillLeftConcaveEdgeEvent(tcx, edge, node);
                } else {
                    // Next is convex
                }
            }
        }
    }

    sweep.FlipEdgeEvent = function(tcx, ep, eq, t, p) {
        var ot = t.NeighborAcross(p);
        if (ot == null) {
            // If we want to integrate the fillEdgeEvent do it here
            // With current implementation we should never get here
            alert('[BUG:FIXME] FLIP failed due to missing triangle!');
            return;
        }
        var op = ot.OppositePoint(t, p);

        if (InScanArea(p, t.PointCCW(p), t.PointCW(p), op)) {
            // Lets rotate shared edge one vertex CW
            sweep.RotateTrianglePair(t, p, ot, op);
            tcx.MapTriangleToNodes(t);
            tcx.MapTriangleToNodes(ot);

            if (p == eq && op == ep) {
                if (eq == tcx.edge_event.constrained_edge.q && ep == tcx.edge_event.constrained_edge.p) {
                    t.MarkConstrainedEdge(ep, eq);
                    ot.MarkConstrainedEdge(ep, eq);
                    sweep.Legalize(tcx, t);
                    sweep.Legalize(tcx, ot);
                } else {
                    // todo: I think one of the triangles should be legalized here?
                }
            } else {
                var o = Orient2d(eq, op, ep);
                t = sweep.NextFlipTriangle(tcx, o, t, ot, p, op);
                sweep.FlipEdgeEvent(tcx, ep, eq, t, p);
            }
        } else {
            var newP = sweep.NextFlipPoint(ep, eq, ot, op);
            sweep.FlipScanEdgeEvent(tcx, ep, eq, t, ot, newP);
            sweep.EdgeEvent(tcx, ep, eq, t, p);
        }
    }

    sweep.NextFlipTriangle = function(tcx, o, t, ot, p, op) {
        var edge_index;
        if (o == Orientation.CCW) {
            // ot is not crossing edge after flip
            edge_index = ot.EdgeIndex(p, op);
            ot.delaunay_edge[edge_index] = true;
            sweep.Legalize(tcx, ot);
            ot.ClearDelunayEdges();
            return t;
        }

        // t is not crossing edge after flip
        edge_index = t.EdgeIndex(p, op);

        t.delaunay_edge[edge_index] = true;
        sweep.Legalize(tcx, t);
        t.ClearDelunayEdges();
        return ot;
    }

    sweep.NextFlipPoint = function(ep, eq, ot, op) {
        var o2d = Orient2d(eq, op, ep);
        if (o2d == Orientation.CW) {
            // Right
            return ot.PointCCW(op);
        } else if (o2d == Orientation.CCW) {
            // Left
            return ot.PointCW(op);
        } else {
            alert("[Unsupported] sweep.NextFlipPoint: opposing point on constrained edge!");
            return undefined;
        }
    }

    sweep.FlipScanEdgeEvent = function(tcx, ep, eq, flip_triangle, t, p) {
        var ot = t.NeighborAcross(p);

        if (ot == null) {
            // If we want to integrate the fillEdgeEvent do it here
            // With current implementation we should never get here
            alert('[BUG:FIXME] FLIP failed due to missing triangle');
            return;
        }
        var op = ot.OppositePoint(t, p);

        if (InScanArea(eq, flip_triangle.PointCCW(eq), flip_triangle.PointCW(eq), op)) {
            // flip with new edge op.eq
            sweep.FlipEdgeEvent(tcx, eq, op, ot, op);
            // todo: Actually I just figured out that it should be possible to
            //       improve this by getting the next ot and op before the the above
            //       flip and continue the flipScanEdgeEvent here
            // set new ot and op here and loop back to inScanArea test
            // also need to set a new flip_triangle first
            // Turns out at first glance that this is somewhat complicated
            // so it will have to wait.
        } else {
            var newP = sweep.NextFlipPoint(ep, eq, ot, op);
            sweep.FlipScanEdgeEvent(tcx, ep, eq, flip_triangle, ot, newP);
        }
    }

    // -----------------------------------------------------------------------------
    
    ///////////////////////////// Start RiTaBox ////////////////////////////////////
  
    // Box2D imports
    var b2Vec2 = Box2D.Common.Math.b2Vec2;
    var b2Math = Box2D.Common.Math.b2Math;
    var b2BodyDef = Box2D.Dynamics.b2BodyDef;
    var b2Body = Box2D.Dynamics.b2Body;
    var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
    var b2Fixture = Box2D.Dynamics.b2Fixture;
    var b2World = Box2D.Dynamics.b2World;
    var b2MassData = Box2D.Collision.Shapes.b2MassData;
    var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
    var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
    var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
    var b2AABB = Box2D.Collision.b2AABB;
    
    var __world, __fonts = {}, PI = Math.PI, pow = Math.pow, E = "";
    var dotOvers  = 'ji:;', dotUnders = '?!', multiPaths = '",%=', descenders = "gjpqy";
    var glyphCache = [];
    
    var __fixtureDef = new b2FixtureDef();
    __fixtureDef.density = 1.0;
    __fixtureDef.friction = 0.5;
    __fixtureDef.restitution = 0.2;
        
    this.POLYS = 'POLYS';
    this.RECTS = 'RECTS';
    this.BOX = 'BOX';
    
    // Make sure Box2D exists
    if (Box2D === undefined) {
        console.error('RiTaBox requires Box2d!');
        return;
    }
    
    // from Crockford: http://javascript.crockford.com/prototypal.html
    function create(o) {
        function F() {}
        F.prototype = o;
        return new F();
    }
    
    // from jQuery
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

    function position(body) {
        var wc = body.GetWorldCenter();
        var bb = __getB2BoundingBox(body);
        return __worldToPixels(wc.x-bb.width/2, wc.y-bb.height/2);
    };
        
    var DRAW_FUNCTION=drawRiTaBox, DISABLE_AUTODRAW=0, DEBUG_DRAW=0, DETAIL=30, 
      DRAW_GLYPH_POINTS=0, DRAW_GLYPH_PATHS=0, DRAW_NATIVE_GLYPHS=1, 
      DRAW_BOUNDING_BOXES=0, GRAVITY=10, SCALE=30;
    
    var DEFAULT_OPTIONS = {
        drawFunction : DRAW_FUNCTION,
        gravity : GRAVITY, scale : SCALE,
        drawBoundingBoxes : DRAW_BOUNDING_BOXES,
        drawNativeGlyphs : DRAW_NATIVE_GLYPHS,
        drawGlyphPaths : DRAW_GLYPH_PATHS,
        drawGlyphPoints : DRAW_GLYPH_POINTS,
        disableAutodraw : DISABLE_AUTODRAW,
        glyphDetail : DETAIL,
        debugDraw : DEBUG_DRAW,
        stats : 0
    };
    
    var __ctx =  document.getElementsByTagName("canvas")[0].getContext("2d");
    var __ctxPos = __getElementPosition(__ctx.canvas);

    this.createWorld = function(ctx, options) {

        __ctx = ctx;
        __ctxPos = __getElementPosition(ctx.canvas);
        
        var opts = extend(options, DEFAULT_OPTIONS);

        DRAW_NATIVE_GLYPHS = opts.drawNativeGlyphs;
        DRAW_GLYPH_POINTS = opts.drawGlyphPoints;
        DRAW_GLYPH_PATHS = opts.drawGlyphPaths;
        DRAW_BOUNDING_BOXES = opts.drawBoundingBoxes;
        DISABLE_AUTODRAW = opts.disableAutodraw;
        DRAW_FUNCTION =  opts.drawFunction;
        DEBUG_DRAW =  opts.debugDraw;
        DETAIL = opts.glyphDetail;
        GRAVITY = opts.gravity;
        SCALE = opts.scale;

        __world = new b2World(new b2Vec2(0, GRAVITY),   true);                 
        
        if (DEBUG_DRAW) {
           var debugDraw = new b2DebugDraw();
           debugDraw.SetSprite(__ctx);
           debugDraw.SetDrawScale(SCALE);
           debugDraw.SetFillAlpha(0.5);
           debugDraw.SetLineThickness(1.0);
           debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
           __world.SetDebugDraw(debugDraw);
        }

        //window.setInterval(update, 1000 / 60);
        if (!DISABLE_AUTODRAW) requestAnimFrame(update); // replaced above
        
        if (opts.stats) enableStats();
      
        return __world;
    };
    
   function update() {
     
        // DCH: Add code from here for more accurate stepping?
        // http://stackoverflow.com/questions/5466432/how-do-i-implement-better-time-step-fixed-or-semi-fixed-in-box2d/5466542#5466542
        // and http://www.unagames.com/blog/daniele/2010/06/fixed-time-step-implementation-box2d
        // and http://blog.allanbishop.com/category/physics/
        //
       __world.Step(1 / 60, 10, 10);
       __world.DrawDebugData();
       __world.ClearForces();

       DRAW_FUNCTION(__ctx);

       requestAnimFrame(update);
    }
    

    function drawRiTaBox(ctx) {

        //if (this.frameCount%10==9) log("drB");
        
        ctx.fillStyle="rgba(255, 255, 255, 0)";
        
        if (!DEBUG_DRAW)
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        this.frameCount = (__isNull(this.frameCount)) ? 1 : frameCount+1;

        ctx.fillStyle="rgba(55, 55, 255, 1)";
        ctx.strokeStyle="rgba(155, 55, 55, 1)";
        __line(ctx,0,y, ctx.canvas.width,y);
        __line(ctx,x,0,x, ctx.canvas.height);

        __drawBodies(ctx);

        if (typeof stats !== 'undefined') stats.update();
    }
    
    this.glyphs = function(x, y, letters, font, size, world, options) {
    
        if (typeof __ctx === 'undefined') error("no canvas-context");
        if (typeof __ctxPos === 'undefined') error("no canvas-position");
    
        options = options || {};
        
        var bbType = options.bbType || BOX;
        var detail = options.detail || DETAIL;
        var isStatic = options.static || false;
        var rotation = options.rotation || rotation;
        var fixedRotation =  !options.rotates || false;
        var kerning = Math.max(Math.min(kerning || 0, 1), -1);
        
        var fontStr = font + "";
        (typeof font == 'string') && (font = __getFont(font)); 
        if (!font) error("no font!");
        
        var scale = (size || 16) / font.face["units-per-em"];
        var xshift = 0, bodies = [];
        var bb = font.face.bbox.split(' ');
        var glyphHeight = (+bb[0] - (+bb[1] + bb[3] - bb[1] + (+font.face.descent))) / scale;
        
        
        for (var i = 0, ii = letters.length; i < ii; i++) 
        {
            
            var prev = i && font.glyphs[letters[i - 1]] || {};
            xshift += i ? (prev.w || font.w) + (prev.k && prev.k[letters[i]] || 0) + (font.w * kerning) : 0;
    
            //log(letters[i]+") "+xshift);
            
            var pts = glyphCache[letters[i]];
            if (!pts) {
                
                console.log("Parsed glyph: "+letters[i]);
                
                var pathArray = __parsePathString(font.glyphs[letters[i]].d);
                if (!pathArray || !pathArray.length) error("no path");
                
                var path = __pathToAbsolute(pathArray);
        
                var paths = __splitPath(path);
                
                path = (dotOvers.indexOf(letters[i]) > -1) ? paths[paths.length-1]: paths[0]; //?
                
                //log(letters[i]+" has a dotOver? "+(dotOvers.indexOf(letters[i]) > -1));
         
                pts = __getPointsFromPath(path, detail);
   
                glyphCache[letters[i]] = clonePoints(pts);
            }
            // else console.log(letters[i]+") Fetched glyph from cache");
            
            
            var offs = __minmax(pts);
            var spts = __simplifyPathPts(pts);
            vec = __getPoly2TriPoints(spts, scale);
            var body = __createPoly(world, vec, __fixtureDef, false);
            
            var pw = __pixelsToWorld(x+__ctxPos.x+(xshift*scale), y+__ctxPos.x); // position of poly
            body.SetPosition(new b2Vec2(pw.x, pw.y));
               
            var data = { type: 'glyph', path: path, points: pts, isStatic: isStatic, 
                descent: font.face.descent, glyphHeight: glyphHeight, bbType: bbType,
                chars: letters[i], fontFamily: fontStr, fontSize: size, scale: scale, 
                offset: { x:-offs.minX, y: -offs.maxY }, bounds: __getBoundingBox(body) };
            
            body.SetUserData(data);
            body.SetAngle(rotation);
            body.SetFixedRotation(fixedRotation);
            bodies.push(body);
        }
    
        // handle the bounding box and add to b2dObjects
        if (bbType==POLYS) {
            
            for ( var i = 0; i < bodies.length; i++) {
                RiTaBox.__b2dObjects.push(bodies[i]);    
            }
        }
        else {
            
            var data = bodies[0].GetUserData();
            data.chars = letters;

            var loc = bodies[0].GetPosition();

            var bodyDef = new b2BodyDef();
            bodyDef.type = b2Body.b2_dynamicBody;
            if (isStatic) {
                bodyDef.type = b2Body.b2_staticBody;
            }
            
            body = world.CreateBody(bodyDef);
            var startPos = __getB2BoundingBox(bodies[0]);
            for ( var i = 0; i < bodies.length; i++) {
                
                var rectShape = new b2PolygonShape();
                var bx = __getB2BoundingBox(bodies[i]);
                var ox = -(data.offset.x+__ctxPos.x)/(SCALE/scale);
                var px =  ox + bx.x - startPos.x + bx.width/2;
                var py =  -bx.height/2;
                if (isDescender(data.chars[i]))  // hack
                    py -= data.descent/(SCALE / scale);
                //log(bx.x+","+bx.y+","+bx.width/2+","+ bx.height/2);
                rectShape.SetAsOrientedBox(bx.width/2, bx.height/2, new b2Vec2(px, py), 0);

                __fixtureDef.shape = rectShape; 
                body.CreateFixture(__fixtureDef);
                world.DestroyBody(bodies[i]);
            }
                    
            if (bbType == BOX) 
                body = __convertToRect(world, body, __fixtureDef, false);  
            
            bodyDef.type = b2Body.b2_dynamicBody;
            if (isStatic) {
                bodyDef.type = b2Body.b2_staticBody;
            }
            body.SetPosition(loc);
            body.SetUserData(data);
            RiTaBox.__b2dObjects.push(body);    
            body.SetAngle(rotation);
            body.SetFixedRotation(fixedRotation);
        }
        
//        else {
//            
//            var boxes = [];
//            var data = bodies[0].GetUserData();
//            console.log(data.chars +") "+data.offset.x);
//            //var loc = __pixelsToWorld(x+__ctxPos.x, y-data.bounds.height+__ctxPos.y); // whaaa?
//            var loc = __pixelsToWorld(x+__ctxPos.x, y+__ctxPos.x);
//            
//            for ( var i = 0; i < bodies.length; i++) {
//                boxes.push(__getB2BoundingBox(bodies[i]));
//                //boxes.push(bodies[i].GetUserData().bounds);
//                world.DestroyBody(bodies[i]);
//            }
//            
//            data.chars = letters;
//            
//            var body = __multiRectFixture(world, boxes, __fixtureDef, false);
//            if (bbType == BOX) body = __convertToRect(world, body, __fixtureDef, false);        
//
//            body.SetUserData(data);
//            RiTaBox.__b2dObjects.push(body);    
//            
//            //var loc = bodies[0].GetWorldCenter()
//            body.SetPosition(loc); 
//            body.SetAngle(rotation);
//            body.SetFixedRotation(fixedRotation);
//        }
        
    
        //console.log(data.chars +") "+data.bbType);
        
        return body;
    };
    
    function clonePoints(pts) {
        var res =  [];
        for ( var i = 0; i < pts.length; i++)
            res[i] = Point.clone(pts[i]);
        return res;
    };
    
    function __xrect(theWorld, b2x, b2y, ww, wh) {
            
        var bodyDefn = new b2BodyDef();
        bodyDefn.type = b2Body.b2_staticBody;
        
        bodyDefn.position.x = b2x + ww;
        bodyDefn.position.y = b2y + wh;
    
        // log("__rectFixture: " + pos.x + "," + pos.y);
        __fixtureDef.shape = new b2PolygonShape();
        __fixtureDef.shape.SetAsBox(ww, wh);
    
        var body = theWorld.CreateBody(bodyDefn);
        body.CreateFixture(__fixtureDef);
        
        return body;
    }
    /////////////////////////IGNORE///////////////////////////
    // hack to add a dot over  (LATER: do it correctly with multiple paths!!!)
    /*if (0 && dotOvers.indexOf(letters[i])>-1) {
        
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
    }*/
    /////////////////////////IGNORE///////////////////////////
    
    
    function __drawBody(ctx, body) {

      var data = body.GetUserData();
      var bPt = body.GetWorldCenter();
      var pos = __worldToPixels(bPt.x, bPt.y);
      pos.x -= __ctxPos.x;
      pos.y -= __ctxPos.y;
      
      ctx.save();
      
      ctx.fillStyle="rgba(0, 0, 0, .5)";
      ctx.strokeStyle="rgba(0, 0, 0, 1)";
      
      if (!data) error("no data for: "+body);

      if (data.type === 'rect') {
         drawRect(ctx,body,pos.x,pos.y);
      }
      else if (data.type === 'circle') {
         drawCircle(ctx,body,pos.x,pos.y);
      }

      else if (data.type === 'glyph') {
           drawGlyphs(ctx,body,pos.x,pos.y);
      }
//      else if (data.type === 'glyphRects') {
//          drawGlyphRects(ctx,body,pos.x,pos.y);
//     }
      else {
          log("unexpected type: "+data.type);
      }
      
      ctx.restore(); 
  }
  
  function drawRect(ctx, body, x, y) {
        
        var data = body.GetUserData();
        ctx.save();
        
        ctx.fillStyle="rgba(0, 0, 0, .5)";
        ctx.strokeStyle="rgba(0, 0, 0, 1)";
    
        //ctx.translate(pos.x-__ctxPos.x, pos.y-__ctxPos.y);
        ctx.translate(x,y);
        ctx.rotate(body.GetAngle());
        __rect(ctx, -data.width/2, -data.height/2, data.width, data.height);

        ctx.restore();
    }
    
    function drawCircle(ctx, body, x, y) {
        
        var data = body.GetUserData();
        ctx.save(); 
        
        ctx.translate(x,y);
        ctx.rotate(body.GetAngle());
        __circle(ctx, 0, 0, data.radius);

        ctx.restore();
    }
   
    this.drawGlyphs = function(ctx, body, x, y) {

        var data = body.GetUserData();
        var fn = this.drawGlyphs;
        
        //if (frameCount%10==9)log("drawGlyphs("+data.chars+") :: "+x+','+y);
        
        ctx.save();
        
        var bbox = data.bounds;
        
        if (typeof data.firstX === 'undefined') {
            
            //if (!fn.NOPRINT) log("drawGlyphs("+data.chars+") :: "+x+','+y+" bb: "
              //  +bbox.x+","+bbox.y+","+bbox.width+","+bbox.height);
            
            data.firstX = x; 
            data.firstY = y;
        }    
        var xPosOff = data.firstX - x;
        var yPosOff = data.firstY - y;
        
        //if (!fn.NOPRINT) log('xPosOff='+xPosOff+" yPosOff="+yPosOff);
       
        // do the rotation, then reset
        var trX = x, trY = y;
        ctx.translate(trX,trY);
        
        //ctx.fillStyle="rgba(255,0,0,1)";
        //__point(ctx, 0, 0, 4);
        
        ctx.rotate(body.GetAngle());
        ctx.translate(-trX,-trY);
 
        ctx.translate(bbox.x- xPosOff-__ctxPos.x,  bbox.y -yPosOff -__ctxPos.y);

        if (DRAW_BOUNDING_BOXES) {
            ctx.fillStyle="rgba(0,0,0,0)";
            __rect(ctx, 0, 0, bbox.width, bbox.height);
            ctx.strokeStyle="rgba(1,1,1,1)";
            __point(ctx, bbox.width/2, bbox.height/2);
        }
            
        ctx.translate(0, bbox.height);          // shift to baseline
        
        ctx.scale(data.scale, data.scale);
        
        ctx.translate(data.offset.x, data.offset.y); // path min/max

        ctx.font = "normal 360px "+data.fontFamily;
        
        if (DRAW_NATIVE_GLYPHS) {
            ctx.fillText(data.chars, 0, 0);
            ctx.strokeText(data.chars, 0, 0);
        }

        if (DRAW_GLYPH_PATHS) {
             ctx.strokeStyle="rgba(0,0,0,1)";
             ctx.fillStyle="rgba(0,0,0,.3)";
            __path(ctx, data.path);
        }

        if (DRAW_GLYPH_POINTS) {
            ctx.strokeStyle="rgba(255,0,0,1)";
            for ( var i = 0; i < data.points.length; i++) {
                __point(ctx, data.points[i].x, data.points[i].y);
            }
        }
        
        ctx.restore();

        if (data.isStatic && body.GetType() === b2Body.b2_dynamicBody) {
            makeStatic(body);
        }
        
        fn.NOPRINT = true;
    };
    
    function makeStatic(body) {
        
        //log("makeStatic");
        body.m_type = b2Body.b2_staticBody;
        body.m_mass = 0.0;
        body.m_invMass = 0.0;
        body.m_angle = 0;  // TODO: make this an arg...
        body.m_linearVelocity.SetZero();
        body.m_angularVelocity = 0.0;
    }
    
    /** 
     * Create a body from multiple rectangle boounding boxes
     * with one fixture per box
     * (Takes absolute pixel coords)
     */
    function __convertToRect(world, body, fixDef, isStatic ) { //, isStatic

        var data = body.GetUserData();
        var bb = __getB2BoundingBox(body);
        world.DestroyBody(body);
        
        var bodyDef = new b2BodyDef();
        bodyDef.type = b2Body.b2_dynamicBody;
        if (isStatic) {
            bodyDef.type = b2Body.b2_staticBody;
        }
        
        body = world.CreateBody(bodyDef);
        body.SetUserData(data);
        
        var rectShape = new b2PolygonShape();   
        rectShape.SetAsOrientedBox
            (bb.width/2,bb.height/2,new b2Vec2(bb.x+bb.width/2, bb.y+bb.height/2), 0);
        
        fixDef.shape = rectShape;
        body.CreateFixture(fixDef);  
        
        return body;
    }
    
    /** 
     * Create a body from multiple rectangle boounding boxes
     * with one fixture per box (Takes pixel coords)
     */
    function __multiRectFixtureX(world, boxes, fixDef, isStatic, data) {
    
        var bodyDef = new b2BodyDef();
        bodyDef.type = b2Body.b2_dynamicBody;
        if (isStatic) {
            bodyDef.type = b2Body.b2_staticBody;
        }

        var body = world.CreateBody(bodyDef);
    
        var pos0, maxH = -99999;
        for ( var i = 0; i < boxes.length; i++) {
            if (boxes[i].height > maxH)
                maxH = boxes[i].height;
        }
        
        for ( var i = 0; i < boxes.length; i++) {
            var b = boxes[i];
            var pos = new  b2Vec2(b.x, b.y);
            
            if (i==0) pos0 = pos; // save first box-pos
            
            var halfWidth = (b.width / 2);
            var halfHeight = (b.height / 2);
            
            var rectShape = new b2PolygonShape();
            try {
                var px = (pos.x + halfWidth) - pos0.x;
                var py = maxH - halfHeight;
                
                //log(maxH +" ?= "+data.offset.y/SCALE);
                
                //if (i==0)//data.letters[i] == 'p') 
                    //py -= data.descent/(SCALE*9);
                
                rectShape.SetAsOrientedBox(halfWidth, halfHeight, new b2Vec2(px, py), 0);
                //log("Added rect#" + i + ") ["+px+","+py+","+halfWidth+","+halfHeight+"]");
            } 
            catch (e) {
                console.error("Error adding rect #" + i + "\n" + e+"\n" + boxes);
                return;
            }
            fixDef.shape = rectShape;
            body.CreateFixture(fixDef);
         }
        
        return body;
    }
    
    function isDescender(letter) {
        return descenders.indexOf(letter) > -1;
    }
    
    function __multiRectFixture(world, boxes, fixDef, isStatic) {
        
        var bodyDef = new b2BodyDef();
        bodyDef.type = b2Body.b2_dynamicBody;
        if (isStatic) {
            bodyDef.type = b2Body.b2_staticBody;
        }
        
        var body = world.CreateBody(bodyDef);
        for ( var i = 0; i < boxes.length; i++) {
            
            var b = boxes[i];
            var pos = {x:b.x, y:b.y};
            
            if (i==0) pos0 = pos; // save first box-pos
            
            var halfWidth = b.width / 2;
            var halfHeight = b.height / 2;
            
            var rectShape = new b2PolygonShape();
            
            try {
                //var xxx = b.x - boxes[0].x;
                var px = halfWidth + (pos.x - pos0.x);
                var py = 0;//(pos.x + halfWidth) - pos0.x;

                rectShape.SetAsOrientedBox(halfWidth, halfHeight, new b2Vec2(px, py), 0);
                log("Added rect#" + i + ") ["+px+","+py+","+halfWidth+","+halfHeight+"]");
            } 
            catch (e) {
                
                console.error("Error adding rect #" + i + "\n" + e+"\n" + boxes);
                return;
            }
            
            fixDef.shape = rectShape;
            body.CreateFixture(fixDef);
         }
        
        return body;
    }
    
    /** 
     * Create a body from multiple rectangle boounding boxes
     * with one ficture per box (Takes pixel coords)
     */
    function __multiRectFixtureX(world, boxes, fixDef, isStatic) {
    
        var bodyDef = new b2BodyDef();
        bodyDef.type = b2Body.b2_dynamicBody;
        if (isStatic) {
            bodyDef.type = b2Body.b2_staticBody;
        }
        
        var body = world.CreateBody(bodyDef);
    
        var pos0, maxH = -99999;
        for ( var i = 0; i < boxes.length; i++) {
            //log(data.chars[i]+": "+boxes[i].height);
            if (boxes[i].height > maxH)
                maxH = boxes[i].height;
        }
        maxH = __scalarToWorld(maxH);
        
        for ( var i = 0; i < boxes.length; i++) {
            
            var b = boxes[i];
            var pos = __pixelsToWorld(b.x, b.y);
            
            if (i==0) pos0 = pos; // save first box-pos
            
            var halfWidth = __scalarToWorld(b.width / 2);
            var halfHeight = __scalarToWorld(b.height / 2);
            
            var rectShape = new b2PolygonShape();
            
            try {
                
                var px = (pos.x + halfWidth) - pos0.x;
                //var py = 0;
                var py = -(maxH - halfHeight);
                py = 0;
//                if (isDescender(data.chars[i])) { // hack
//                    py -= data.descent/(SCALE / data.scale);
//                }
                rectShape.SetAsOrientedBox(halfWidth, halfHeight, new b2Vec2(px, py), 0);
                
                //log("Added rect#" + i + ") ["+px+","+py+","+halfWidth+","+halfHeight+"]");
            } 
            catch (e) {
                
                console.error("Error adding rect #" + i + "\n" + e+"\n" + boxes);
                return;
            }
            
            fixDef.shape = rectShape;
            body.CreateFixture(fixDef);
         }
        
        return body;
    }
    
    this.createFloor = function(world) {
        var pos = __worldToPixels(-10, (__ctx.canvas.height / SCALE) -.6);
        var w = 40 * SCALE, h = 4 * SCALE;
        var body = b2rect(pos.x, pos.y, w, h, world, true, true);
        var data = { type: 'rect', width :w, height : h, fixed: true };
        body.SetUserData(data);
    }
    
   this.b2rect = function(x, y, w, h, world, fixedRotation, isStatic) {
        
        //log("__b2rect("+x+","+y+","+ w+","+ h+")");
        
        if (typeof __ctxPos === 'undefined') throw Error("no canvas-position");
        
        //fixedRotation = fixedRotation || false;
        isStatic = isStatic || false;
        
        var body = __rectFixture(world, x+__ctxPos.x, y+__ctxPos.y, w, h, isStatic);
        RiTaBox.__b2dObjects.push(body);
    
        var data = { type: 'rect', width : w, height : h };
        body.SetUserData(data);
    
        return body;
    }
    
    this.b2circle = function(x, y, rad, world, fixedRotation, isStatic) {
        
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
        RiTaBox.__b2dObjects.push(body);
        
        var data = { type: 'circle', radius : rad };
        body.SetUserData(data);
    
        return body;
    }
    
    
    ///////////////////////////////////// HELPERS //////////////////////////////////////////
    
    this.randomShapes = function(num, world) {
        for ( var i = 0; i < num; i++) {
            var rx = 50+(Math.random() * __ctx.canvas.width-100);
            var ry = Math.random() * 100;
            if(Math.random() > 0.5) 
                b2rect(rx,ry,3+Math.random()*30,3+Math.random()*30,world);
            else 
                b2circle(rx,ry,3+Math.random()*15,world);
        }
    };
    
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
        for (var i = 0; i < RiTaBox.__b2dObjects.length; i++) {   
            __drawBody(ctx, RiTaBox.__b2dObjects[i]);
        }
    }
    
    function __destroy(obj) {
        world.DestroyBody(g);
        return __removeFromArray(obj,RiTaBox.__b2dObjects);
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
    
    this.enableStats = function() {
        
        if (typeof Stats === 'undefined') {
            log("Can't find Stats.js");
            return; 
        }
        if (!this.stats) this.stats = new Stats();
        this.stats.getDomElement().style.position = 'absolute';
        this.stats.getDomElement().style.left = '8px';
        this.stats.getDomElement().style.top = (__ctx.canvas.height+9)+"px";
        document.body.appendChild( this.stats.getDomElement() );
    };
    
    function __point(ctx, x, y, sz) {
    
        sz = sz || 1;
        ctx.beginPath(); 
        //ctx.arc(x, y, 1, 0, 2 * Math.PI, true);
        ctx.arc(x, y, sz, 0, 2 * Math.PI, true);
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
                
            }
        }

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
    
    this.registerFont = function(font) {
    
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
     * Converts to Points in b2World coordinates
     */
    function __getPoly2TriPoints(thePoints, fontScale) {
    
        var b2Pts = []; // omit the first point to avoid duplicates
        for ( var i = 1; i < thePoints.length; i++) 
        {
            var pt = thePoints[i]; // show-pts
    
            pt = __pixelsToWorld(pt.x, pt.y);
    
            pt.x *= fontScale;
            pt.y *= fontScale;
    
            var p2t = new Point(pt.x, pt.y);
    
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
        
        var sweepContext = new SweepContext(vec);
        sweep.Triangulate(sweepContext);
        var tris = sweepContext.GetTriangles();
        
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
        
        var bb = __getAABB(body);
        
        var x = bb.lowerBound.x, y = bb.lowerBound.y,
            w = (bb.upperBound.x - bb.lowerBound.x), 
            h = (bb.upperBound.y - bb.lowerBound.y);
        
        var pos = __worldToPixels(x,y);
    
        return { x: pos.x, y : pos.y, width: w*SCALE, height: h*SCALE };
        //return { x: pos.x-canvasPosition.x, y : pos.y-canvasPosition.y, width: w*SCALE, height: h*SCALE }; 
    }
    
    function __getB2BoundingBox(body) { // b2world-coords
        
      var bb = __getAABB(body);
        
        var x = bb.lowerBound.x, y = bb.lowerBound.y,
            w = (bb.upperBound.x - bb.lowerBound.x), 
            h = (bb.upperBound.y - bb.lowerBound.y);
        
        return { x: x, y : y, width: w, height: h };
    }    
    
    function __getAABB(body) { 
    
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
        
       if (typeof element === 'undefined')
            throw Error("undefined input to __getElementPosition");
        
       var elem = element, tagname="", x=0, y=0;
       
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
        
        //console.log("[RiTaBox2d] " + msg);
        console.log(msg);
    }
    
    return this;
    
})();

window.RiTaBox.__b2dObjects = [];
