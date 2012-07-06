/*  
    NEXT: 
    
        -- remove dependency for 1 function (getMetrics()) on jquery...
                
        add memoizing of functions: textWidth, textAscent, textDescent, getBoundingBox, etc
            -- fonts and bounds
            
        add interpolating behaviors
  
     $Id: ritex-todelete.js,v 1.1 2012/06/03 21:12:57 dev Exp $
 */
    
(function(window, undefined) {
    
    var RiText_Canvas = makeClass();
    
    var DBUG = false; // tmp
    
    RiText_Canvas.prototype = {

        __init__ : function(ctx) {
            this.ctx = ctx;
        },
        
        __size : function(w, h, renderer) {
            this.ctx.canvas.width = w;
            this.ctx.canvas.height = h;
            if (renderer) 
                console.warn("Renderer arg ignored");
        },
        
        __getContext : function() {
            return this.ctx;
        },
        
        __pushState : function() {
            this.ctx.save();
            return this;
        },
        
        __popState : function() {
            this.ctx.restore();
            return this;
        },

        __textAlign : function(align) {
            if (!arguments.callee.printedError) 
            //console.warn('__textAlign not yet implemented in RiText_Canvas');
            arguments.callee.printedError = true;
        },
        
        __background : function(r,g,b,a) {
            this.__fill(r,g,b,a);
            this.ctx.fillRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
        },

        __scale : function(sx, sy) {
            if(DBUG) console.log("scale: "+sx+","+sy+","+1);
            this.ctx.scale(sx, sy, 1);
        },
        
        __translate : function(tx, ty) {
            if(DBUG)console.log("translate: "+tx+","+ty+","+0);
            this.ctx.translate(tx, ty, 0);
        },
        
        __rotate : function(zRot) {
            this.ctx.rotate(0,0,zRot);
        },
        
        __rect : function(x,y,w,h) {
            
            if(DBUG)console.log("strokeRect: ");
            if(DBUG)console.log(x,y,w,h);
            
            // hack for 1 px rect
            RiText.line(x,y,x+w,y);
            RiText.line(x,y+h,x+w,y+h);
            RiText.line(x,y,x,y+h);
            RiText.line(x+w,y,x+w,y+h);
        },
        
        // actual creation: only called from RiText.createDefaultFont();!
        __createFont : function(fontName, fontSize, fontLeading) {
            var font = {
                name:       fontName, 
                size:       fontSize || RiText.defaults.font.size, 
                leading:    fontLeading || (fontSize * RiText.defaults.leadingFactor) 
            };
            console.log("[CTX] Create font: "+font.name+"-"+font.size+"/"+font.leading);
            return font;
        },
        
        __width : function() {
            if(DBUG)console.log("width: "+this.ctx.canvas.width);
            return this.ctx.canvas.width || 200;
        },
        
        __height : function() {
            if(DBUG)console.log("height: "+this.ctx.canvas.height);
            return this.ctx.canvas.height || 200;
        },
        
        __fill : function(r,g,b,a) {
            if(DBUG)console.log("fill: "+r+","+g+","+b+","+(a/255)+")");
            this.ctx.fillStyle="rgba("+Math.round(r)+","+Math.round(g)+","+Math.round(b)+","+(a/255)+")";
        },
        
        __stroke : function(r,g,b,a) {
            if(DBUG)console.log("__stroke: "+a);
            if(DBUG)console.log(r,g,b,(a/255));
            this.ctx.strokeStyle="rgba("+Math.round(r)+","+Math.round(g)+","+Math.round(b)+","+(a/255)+")";
        },
        
        __type : function() {
            return "Canvas";
        },
        
        // only applies the font to the context!
        __textFont : function(fontObj) {
            if (getType(fontObj)!='object') 
                throw Error("__textFont expects object, but got: "+fontObj);
            this.ctx.font = "normal "+fontObj.size+"px "+fontObj.name;
            if(DBUG) console.log("__textFont: "+this.ctx.font);
        },
        
        __textAscent : function(rt) {
            return this.__getMetrics(rt).ascent;
        },
        
        __textDescent : function(rt) {
            return this.__getMetrics(rt).descent;

        },

        // operate on the RiText itself (take rt as arg?)
        
        __text : function(str, x, y) {
            if(DBUG)console.log("text: "+str+","+x+","+y);
            this.ctx.baseline = 'alphabetic';
            this.ctx.fillText(str, x, y);
            //this.ctx.strokeText(str, x, y);
        },

        __textWidth : function(fontObj, str) {
            this.ctx.save();
            this.__textFont(fontObj);
            var tw = this.ctx.measureText(str).width;
            this.ctx.restore();
            if(DBUG)console.log("measureText: "+tw);
            return tw;
        },
//        
//        __textWidth : function(rt) {
//            return this.__getBoundingBox(rt).width;
//        },
        
        __textHeight : function(rt) {
            return this.__getBoundingBox(rt).height;
        },
        
        //*  hack to deal with lack of metrics in the canvas
        __getBoundingBox : function(rt) {

            this.ctx.save();
            this.__textFont(rt._font);
            var w = this.ctx.measureText(rt.getText()).width;
            var metrics = this.__getMetrics(rt);
            //console.log('[CTX] ascent='+metrics.ascent+' descent='+metrics.descent+" h="+(metrics.ascent+metrics.descent));
            this.ctx.restore();
            return { x: 0, y: metrics.descent-1, width: w, height: metrics.ascent+metrics.descent+1 };
        },

        __getMetrics : function(rt) {// does this need font.size? no

            var fontObj = rt._font, str = rt.riString.text;
            
            //console.log('__getMetrics:'+fontObj+","+str);
            var text = $('<span style="font-size: '+fontObj.size+'; font-family: '+fontObj.name+'">'+str+'</span>');
            var block = $('<div style="display: inline-block; width: 1px; height: 0px;"></div>');

            var div = $('<div></div>');
            div.append(text, block);

            var body = $('body');
            body.append(div);

            try {
                var result = {};

                block.css({ verticalAlign: 'baseline' });
                result.ascent = block.offset().top - text.offset().top + 1;

                block.css({ verticalAlign: 'bottom' });
                var height = block.offset().top - text.offset().top;

                result.descent = (height - result.ascent);
                result.ascent -=  result.descent;

            } finally {
                div.remove();
            }

            //console.log(result);
            return result;
        },
        
        toString : function() {
            return "RiText_"+this.__type;
        }
        
    };
    
    // /////////////////////////////////////////////////////////////////////// 

    var E = "", SP = " "; // DUP
    
    // /////////////////////////////////////////////////////////////////////// 

    function makeClass() { // DUP
        
        return function(args) {
            
            if (this instanceof arguments.callee) {
                
                if (typeof this.__init__ == "function") {
                    
                    this.__init__.apply(this, args && args.callee ? args : arguments);
                }
            } 
            else {
                return new arguments.callee(arguments);
            }
        };
    }


    function replaceAll(theText, replace, withThis) { // DUP?
        if (!theText) throw Error("no text!")
        return theText.replace(new RegExp(replace, 'g'), withThis);
    }
//  function isNum(n) { // DUP
//  
//return !isNaN(parseFloat(n)) && isFinite(n);
//}
//
//
//    function joinWords(words) { // DUP?
//        
//        var newStr = words[0];
//        for ( var i = 1; i < words.length; i++) {
//            if (!RiTa.isPunctuation(words[i]))
//                newStr += SP;
//            newStr += words[i];
//        }
//        return newStr;
//    }
//    
    function startsWith(str, prefix) { // DUP
        return str.indexOf(prefix) === 0;
    }
    
    function endsWith(str, ending) { // DUP
        return (str.match(ending + "$") == ending);
    }
    
    function isNull(obj) { // DUP
        
        return (typeof obj === 'undefined' || obj === null);
    }

    function getType(obj) { // DUP

        // http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/    
        return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    };
    
    
    //////////////////////////// RiText ///////////////////////////////////
    
    handleLeading = function(fontObj, rts, startY)  
    {
      if (!rts || !rts.length) return;

      fontObj = fontObj || RiText.getDefaultFont();
      
      var nextHeight = startY;
      rts[0].font(fontObj);
      for ( var i = 0; i < rts.length; i++) {
          
        if (fontObj) rts[i].font(fontObj); // set the font
        rts[i].y = nextHeight; // adjust y-pos
        nextHeight += fontObj.leading;
      }
      
      return rts;
    };
    
    
    disposeOne = function(toDelete) {
        
        removeFromArray(RiText.instances, toDelete);
        if (toDelete && toDelete.hasOwnProperty["riString"])
            delete(toDelete.riString);
        if (toDelete)
            delete(toDelete);
    };
    

    disposeArray = function(toDelete) {
        
        for ( var i = 0; i < toDelete.length; i++) {
            
            disposeOne(toDelete[i]);
        }
    };
    
    addSpaces = function(str, num) {
        
        for ( var i = 0; i < num; i++)
            str += " ";
        return str;
    };
    
    removeFromArray = function(items, element)
    {
        while (items.indexOf(element) !== -1) {
            items.splice(items.indexOf(element), 1);
        }
    }
    
    // make a sub-case of createLinesByCharCount() ?
    createLinesByCharCountFromArray = function(txtArr, startX, startY, fontObj) {

        //console.log('createLinesByCharCountFromArray('+txtArr.length+','+startX+','+startY+','+maxCharsPerLine+','+fontObj+')');

        fontObj = fontObj || RiText.getDefaultFont();

        var rts = [];
        for ( var i = 0; i < txtArr.length; i++) {
            //console.log(i+")"+txtArr[i]);
            rts.push(new RiText(txtArr[i], startX, startY, fontObj));
        }

        if (rts.length < 1) return [];

        return handleLeading(fontObj, rts, startY);
    };
    
 
    // The RiText class  //////////////////////////////////////////////////////////// 
    
    var RiText = makeClass();

    
    // 'Static' Methods ///////////////////////////////////////////////////////////// 
    
    /**
     * Container for properties related to the animation loop 
     */
    RiText.animator = {
        loopId : -1,
        actualFPS : 0,
        targetFPS : 60,
        isLooping : false,
        frameCount : 0,
        loopStarted : false,
        framesSinceLastFPS : 0,
        callbackDisabled : false,
        timeSinceLastFPS : Date.now(),
    };
    
    /**
     * Immediately stops the current animation loop and clears 
     */
    RiText.frameCount = function() {
        return RiText.animator.frameCount;
    }
    
    /**
     * Immediately stops the current animation loop and clears 
     */
    RiText.noLoop = function() {
        var an = RiText.animator;
        an.isLooping = false;
        an.loopStarted = false;
        an.clearInterval(loopId);
    }
        
    /**
     * Starts an animation loop that calls the specified callback (usually 'draw') 
     * at the specified fps  
     * 
     * @param callback - the animation callback (optional, default=60)
     * @param number - the target framesPerSecond (optional, default='draw')
     * <pre>
     * Examples:
     *  RiText.loop();
     *  RiText.loop('draw');
     *  RiText.loop(30);
     *  RiText.loop(draw, 10);
     * </pre>
     */
    RiText.loop = function(callbackFun, fps) {
        
        var a = arguments, an = RiText.animator, callback = window['draw'];
  
        if (an.loopStarted) return;
        
        switch (a.length) {
            case 1:
                if (a[0]) {
                    var type = getType(a[0]);
                    if (type == 'function') {
                        callback = a[0];
                    }
                    else if (type == 'number') {
                        an.targetFPS = a[0];
                    }
                }
                break;
                
            case 2:
                if (a[0]) {
                    
                    var type = getType(a[0]);
                    if (type == 'function') {
                        callback = a[0];
                    }
                    
                    type = getType(a[1])
                    if (type == 'number') {
                        an.targetFPS = a[1];
                    }
                }
                break;
        }

        an.timeSinceLastFPS = Date.now(), an.framesSinceLastFPS = 0, mps =  1E3 / an.targetFPS;
        
        if (callback && !an.callbackDisabled) {
            
            an.loopId = window.setInterval(function() {
                
              try {
                
                 callback();
                 
                 var sec = (Date.now() - an.timeSinceLastFPS) / 1E3;
                 var fps = ++an.framesSinceLastFPS / sec;
                 
                 if (sec > 0.5) {
                     an.timeSinceLastFPS = Date.now();
                     an.framesSinceLastFPS = 0;
                     an.actualFPS = fps;
                 }
                 an.frameCount++;
                
              } catch(e) {
                  
                if (!an.callbackDisabled) {
                    console.warn("Unable to invoke callback: "+callback);
                    an.callbackDisabled = true;
                }
                window.clearInterval(an.loopId);
                throw e;
              }
            }, mps);
            
            an.isLooping = true;
            an.loopStarted = true;
        }

    }
    
    /**
     * Convenience method to get the height of the current drawing canvas
     */
    RiText.width = function() { return RiText.renderer.__width(); };
     
    /**
     * Convenience method to get the height of the current drawing canvas
     */
    RiText.height = function() { return RiText.renderer.__height(); };

    
    /**
     * Convenience method to draw a crisp line on the drawing surface
     */ 
    RiText.line = function(x1, y1, x2, y2, lineWidth) {
        
        var curContext = RiText.renderer, swap = undefined;
        
        x1 = Math.round(x1), x2 = Math.round(x2);
        y1 = Math.round(y1), y2 = Math.round(y2);

        lineWidth = lineWidth || 1;
        
        curContext.__pushState();
        
        if (x1 === x2) {
            if (y1 > y2) {
                swap = y1;
                y1 = y2;
                y2 = swap
            }
            y2++;
            if (lineWidth % 2 === 1) curContext.__translate(0.5, 0)
        } 
        else if (y1 === y2) {
            if (x1 > x2) {
                swap = x1;
                x1 = x2;
                x2 = swap
            }
            x2++;
            if (lineWidth % 2 === 1) curContext.__translate(0, 0.5)
        }

        curContext.__getContext().lineWidth = lineWidth;
        curContext.__getContext().beginPath();
        curContext.__getContext().moveTo(x1 || 0, y1 || 0);
        curContext.__getContext().lineTo(x2 || 0, y2 || 0);
        curContext.__getContext().stroke();

        curContext.__popState();
    };
      
    /**
     * Convenience method to set the size of the drawing surface in the current 
     * renderer context 
     */
    RiText.size = function(w,h,renderer) {
        RiText.renderer.__size(w,h,renderer);
    }
    
    /**
     * Returns the current renderer context, either a canvas-2d context or Processing 
     */
    RiText.getContext = function() {
        return RiText.renderer.__getContext();
    }
    
    /**
     * Returns a random color in which the 3 values for rgb (or rgba if 'includeAlpha' is true), 
     * are between min and max 
     */
    RiText.randomColor = function(min,max,includeAlpha) {
        min = min || 0, max = max || 256;
        var col = [RiText.random(min,max),RiText.random(min,max),RiText.random(min,max)];
        if (includeAlpha) col.push(RiText.random(min,max));
        return col;
    }
    
    /**
     * Returns a random number between 'min' (default 0) and 'max
     */
    RiText.random = function() { // TODO: move to RiTa?
        var currentRandom = Math.random();
        if (arguments.length === 0) return currentRandom;
        if (arguments.length === 1) return currentRandom * arguments[0];
        var aMin = arguments[0], aMax = arguments[1];
        return currentRandom * (aMax - aMin) + aMin;
    }
    
    /**
     * Convenience method to fill drawing surface background with specified color
     * @param r
     * @param g
     * @param b
     * @param a
     */
    RiText.background = function(r,g,b,a) {
        var br,bg,bb,ba=255,r = r || 255;
        if (arguments.length >= 3) {
            br = r;
            bg = g;
            bb = b;
        }
        if (arguments.length == 4) {
                ba = a;
        }
        if (arguments.length <= 2) {
                br = r;
                bg = r;
                bb = r;
        }
        if (arguments.length == 2) {
                ba = g;
        }
        //console.log(br,bg,bb,ba);
        RiText.renderer.__background(br,bg,bb,ba);
    }
    
    /**
     * Returns the mouseX position from a mouse event
     * in a cross-browser compatible fashion
     * @param mouseEvent
     */
    RiText.mouseX = function(e) {
        var posX = 0;
        if (!e) var e = window.event;
        if (e.pageX)     {
            posX = e.pageX;
        }
        else if (e.clientX)    {
            posX = e.clientX + document.body.scrollLeft
            + document.documentElement.scrollLeft;
        }
        return posX;
    }

    /**
     * Returns the mouseY position from a mouse event
     * in a cross-browser compatible fashion
     * @param mouseEvent
     */
    RiText.mouseY = function(e) {
        var posY = 0;
        if (!e) var e = window.event;
        if (e.pageY)     {
            posY = e.pageY;
        }
        else if (e.clientY)    {
            posY = e.clientY + document.body.scrollTop
            + document.documentElement.scrollTop;
        }
        return posY;
    }
    
    RiText.dispose = function(toDelete) {
        
        if (!toDelete) return;
        
        if (arguments.length==1) {
            if (getType(toDelete) === 'array')
                disposeArray(toDelete);
            else if (getType(toDelete) === 'object')
                disposeOne(toDelete);

            else
                throw Error("Unexpected type: "+toDelete);
        }
        //else if (arguments.length==0) { 
          //  RiText.disposeAll();
        //}
    }
    
    RiText.disposeAll = function() {
        
        for ( var i = 0; i < RiText.instances.length; i++) {
            
            if (RiText.instances[i] && RiText.instances[i].hasOwnProperty["riString"])
                delete(RiText.instances[i].riString);
            if (RiText.instances[i])
                delete(RiText.instances[i]);
        }
        RiText.instances = [];
    };
    
    // TODO: if txt is an array, maintain line breaks... ?
    RiText.createLines = function(txt, x, y, maxW, maxH, theFont) { 
   
        // remove line breaks
        txt = replaceAll(txt, "[\r\n]", SP);

        //  adds spaces around html tokens
        txt = replaceAll(txt," ?(<[^>]+>) ?", " $1 ");

        // split into array of words
        var tmp = txt.split(SP), words = [];
        for ( var i = tmp.length - 1; i >= 0; i--)
            words.push(tmp[i]);

        if (!words.length) return [];
        
        var g = RiText.renderer;
        var fn = RiText.createLines;
        
        // helper functions ////////////////////////////////////////
        
        fn.checkLineHeight = fn.checkLineHeight || function(currentH, lineH, maxH) {
            
            return currentH + lineH <= maxH;
        };
        
        fn.addLine = fn.addLine || function(arr, s) {
            if (s && s.length) {
                // strip trailing spaces (regex?)
                while (s.length > 0 && endsWith(s, " "))
                    s = s.substring(0, s.length - 1);
                arr.push(s); 
            }
        };
        
        // the guts ////////////////////////////////////////////////

        theFont = theFont || RiText.getDefaultFont();
        
        var tmp = new RiText('_',0,0,theFont), textH = tmp.textHeight();
        RiText.dispose(tmp);

        var currentH = 0, currentW = 0, newParagraph = false, forceBreak = false, strLines = [], 
            sb = RiText.defaults.indentFirstParagraph ? RiText.defaults.paragraphIndent : E;
        
        while (words.length > 0) {

            var next = words.pop();
            
            if (next.length == 0) continue;

            if (startsWith(next, '<') && endsWith(next, ">")) {
         
                if (next === RiText.NON_BREAKING_SPACE || next === "</sp>") {
                    
                    sb += SP;
                }
                else if (next === RiText.PARAGRAPH || next === "</p>") {
                    
                    if (sb.length > 0) {// case: paragraph break
                        
                        newParagraph = true;
                    }
                    else if (RiText.indentFirstParagraph) {
                    
                        sb += RiText.defaults.paragraphIndent;
                    }
                }
                else if (endsWith(next, RiText.LINE_BREAK) || next === "</br>") {
                    
                    forceBreak = true;
                }
                continue;
            }

            currentW = g.__textWidth(theFont, sb + next);

            // check line-length & add a word
            if (!newParagraph && !forceBreak && currentW < maxW) {
                
                sb += next + " "; 
            }
            else // new paragraph or line-break
            {
                // check vertical space, add line & next word
                if (fn.checkLineHeight(currentH, textH, maxH)) {
                    
                    fn.addLine(strLines, sb);
                    sb = E;

                    if (newParagraph) { // do indent

                        sb += RiText.defaults.paragraphIndent;
                        if (RiText.defaults.paragraphLeading > 0) {
                            sb += '|'; // filthy
                        }
                    }
                    newParagraph = false;
                    forceBreak = false;
                    sb += next + SP;//addWord(sb, next);

                    currentH += textH; // DCH: changed(port-to-js), 3.3.12 
                    // currentH += lineHeight; 
                }
                else {
                    
                    if (next != null) words.push(next);
                    break;
                }
            }
        }

        // check if leftover words can make a new line
        if (fn.checkLineHeight(currentH, textH, maxH)) {
            
            fn.addLine(strLines, sb);
            sb = E;
        }
        else {
            var tmp = sb.split(SP);
            for ( var i = tmp.length - 1; i >= 0; i--) {
                words.push(tmp[i]);
            }
            //fn.pushLine(words, sb.split(SP));
        }

        
        // lay out the lines
        var rts = createLinesByCharCountFromArray(strLines, x, y+textH, theFont);

        // set the paragraph spacing
        if (RiText.defaults.paragraphLeading > 0)  {
            
          var lead = 0;
          for (var i = 0; i < rts.length; i++) {
              
            var str = rts[i].getText();
            var idx = str.indexOf('|');
            if (idx > -1) {
              lead += RiText.defaults.paragraphLeading;
              rts[i].removeCharAt(idx);
            }
            rts[i].y += lead;
          }
        }
        
        // check all the lines are still in the rect
        var toKill = [];
        var check = rts[rts.length - 1];
        for (var z = 1; check.y > y + maxH; z++) {
            
            toKill.push(check);
            var idx = rts.length - 1 - z;
            if (idx < 0) break;
            check = rts[idx];
        }
        
        // remove the dead ones
        for (var z = 0; z < toKill.length; z++) {
            
            removeFromArray(rts,toKill[z]);
        }
        disposeArray(toKill);


        return rts;
    };


    // TODO: if txt is an array, maintain line breaks... ?
    RiText.createLinesByCharCount = function(txt, startX, startY, maxCharsPerLine, fontObj) {

        //console.log("RiText.createLinesByCharCount("+txt+", "+startX+","+startY+", "+maxCharsPerLine+", "+fontObj+")");

        if (!maxCharsPerLine || maxCharsPerLine<0) maxCharsPerLine = Number.MAX_VALUE;

        if (txt == null || txt.length == 0) return new Array();

        if (txt.length < maxCharsPerLine) return [ new RiText(txt, startX, startY) ];

        // remove any line breaks from the original
        txt = replaceAll(txt,"\n", " ");

        var texts = [];
        while (txt.length > maxCharsPerLine) {
            var toAdd = txt.substring(0, maxCharsPerLine);
            txt = txt.substring(maxCharsPerLine, txt.length);

            var idx = toAdd.lastIndexOf(" ");
            var end = "";
            if (idx >= 0) {
                end = toAdd.substring(idx, toAdd.length);
                if (maxCharsPerLine < Number.MAX_VALUE) end = end.trim();
                toAdd = toAdd.substring(0, idx);
            }
            texts.push(new RiText(toAdd.trim(), startX, startY));
            txt = end + txt;
        }

        if (txt.length > 0) {
            if (maxCharsPerLine < Number.MAX_VALUE) txt = txt.trim();
            texts.push(new RiText(txt, startX, startY));
        }

        return handleLeading(fontObj, texts, startY);
    };
    
    RiText.setDefaultMotionType = function(motionType) {

        RiText.defaults.motionType = motionType;
    };

    RiText.setDefaultBoundingBoxVisible = function(value) {

        RiText.defaults.boundingBoxVisible = value;
    };

    RiText.setDefaultFont = function(fontObj) {
        
        RiText.defaults.font = fontObj;
        return RiText.defaults.font;
        //if (fontObj.size)RiText.defaults.font.size = fontObj.size;
    };

    RiText.setDefaultAlignment = function(align) {

        RiText.defaults.alignment = align;
    };

    RiText.createWords = function(txt, x, y, w, h, fontObj) {

        return createRiTexts(txt, x, y, w, h, fontObj, RiText.prototype.splitWords);
    };

    RiText.createLetters = function(txt, x, y, w, h, fontObj) {

        return createRiTexts(txt, x, y, w, h, fontObj, RiText.prototype.splitLetters);
    };

    createRiTexts = function(txt, x, y, w, h, fontObj, splitFun) // private 
    {
        if (!txt || !txt.length) return [];
        fontObj = fontObj || RiText.getDefaultFont();

        var rlines = RiText.createLines(txt, x, y, w, h, fontObj);
        if (!rlines) return [];

        var result = [];
        for ( var i = 0; i < rlines.length; i++) {
            
            var rts = splitFun.call(rlines[i]);
            for ( var j = 0; j < rts.length; j++)
                result.push(rts[j].font(fontObj)); // add the words
            
            RiText.dispose(rlines[i]);
        }

        return result;
    };

    
    /**
     * A convenience method to draw all existing RiText objects (with no argument)
     * or an array of RiText objects (if supplied as an argument)
     * @param array - draws only the array if supplied (optional)
     */
    RiText.drawAll = function(array) {
        
        if (arguments.length == 1 && getType(array) === 'array') { 
            for ( var i = 0; i < RiText.instances.length; i++)
                if (RiText.instances[i]) RiText.instances[i].draw();
        }
        else {

            for ( var i = 0; i < RiText.instances.length; i++)
                if (RiText.instances[i]) RiText.instances[i].draw();
        }
        
    };//.expects([],[A]);
    
    RiText.setDefaultColor = function(r, g, b, a) {
        
        if (arguments.length >= 3) {
            if (typeof (r) === 'number') {
                RiText.defaults.color.r = r;
            }
            if (typeof (g) === 'number') {
                RiText.defaults.color.g = g;
            }
            if (typeof (b) === 'number') {
                RiText.defaults.color.b = b;
            }
        }
        if (arguments.length == 4) {
            if (typeof (a) === 'number') {
                RiText.defaults.color.a = a;
            }
        }
        if (arguments.length <= 2) {
            if (typeof (r) === 'number') {
                RiText.defaults.color.r = r;
                RiText.defaults.color.g = r;
                RiText.defaults.color.b = r;
            }
        }
        if (arguments.length == 2) {
            if (typeof (g) === 'number') {
                RiText.defaults.color.a = g;
            }
        }

    };
    
    // TODO: *** Need to test this font default across all platforms and browsers ***
    RiText.getDefaultFont = function() {
        //console.log("RiText.getDefaultFont: "+RiText.defaults.fontFamily+","+RiText.defaults.font.size);
        RiText.defaults.font = RiText.defaults.font || 
            RiText.renderer.__createFont(RiText.defaults.fontFamily, RiText.defaults.fontSize, RiText.defaults.fontLeading);
        return RiText.defaults.font;
    },

    // PUBLIC statics (TODO: clean up) ///////////////////////////////////////////
   
    RiText.NON_BREAKING_SPACE = "<sp>";
    RiText.LINE_BREAK = "<br>";
    RiText.PARAGRAPH = "<p>";
    
    RiText.instances = [];

    RiText.LEFT = 37; RiText.UP = 38; RiText.RIGHT = 39; RiText.DOWN = 40;

    // ==== RiTaEvent ============

    RiText.UNKNOWN = -1; RiText.TEXT_ENTERED = 1; RiText.BEHAVIOR_COMPLETED = 2; RiText.TIMER_TICK = 3;

    // ==== TextBehavior ============

    RiText.MOVE = 1; RiText.FADE_COLOR = 2; RiText.FADE_IN = 3; RiText.FADE_OUT = 4; RiText.FADE_TO_TEXT = 5; 
    RiText.TIMER = 6; RiText.SCALE_TO = 7; RiText.LERP = 8;

    // ==== Animation types ============

    RiText.LINEAR = 0; RiText.EASE_IN_OUT = 1; RiText.EASE_IN = 2; RiText.EASE_OUT = 3; 
    RiText.EASE_IN_OUT_CUBIC = 4; RiText.EASE_IN_CUBIC = 5; RiText.EASE_OUT_CUBIC = 6; 
    RiText.EASE_IN_OUT_QUARTIC = 7; RiText.EASE_IN_QUARTIC = 8; RiText.EASE_OUT_QUARTIC = 9; 
    RiText.EASE_IN_OUT_EXPO = 10; RiText.EASE_IN_EXPO = 11; RiText.EASE_OUT_EXPO = 12; 
    RiText.EASE_IN_OUT_SINE = 13; RiText.EASE_IN_SINE = 14; RiText.EASE_OUT_SINE = 15;
    
    RiText.defaults = { 
        
        color : { r : 0, g : 0, b : 0, a : 255 }, font: null, scaleX : 1, scaleY : 1,
        alignment : RiText.LEFT, motionType : RiText.LINEAR, boundingBoxVisible : false,
        paragraphLeading :  0, paragraphIndent: '    ', indentFirstParagraph: false,
        fontFamily: "Times New Roman", fontSize: 14, fontLeading : 16, leadingFactor : 1.2
        // , scaleZ : 1, rotateX : 0, rotateY : 0, rotateZ : 0,        
    };

    
    RiText.prototype = {

        __init__ : function(text, x, y, font) { 
            
//          console.log("RiText.init.this: "+this);
            
            text = text || E;
      
            this.color = { 
                r : RiText.defaults.color.r, 
                g : RiText.defaults.color.g, 
                b : RiText.defaults.color.b, 
                a : RiText.defaults.color.a 
            };
    
            this.boundingBoxVisible = RiText.defaults.boundingBoxVisible;
            this.motionType = RiText.defaults.motionType;
            this.alignment = RiText.defaults.alignment;
            
            this.behaviors = [];
            this.scaleX = RiText.defaults.scaleX;
            this.scaleY = RiText.defaults.scaleY;
    
            RiText.instances.push(this);
    
            if (typeof (text) == 'string') {
                this.riString = new RiString(text);
            }
            else if (typeof text == 'object' && typeof text.getText !== 'undefined') { 
                this.riString = new RiString(text.getText());
            }
            else
                throw Error("RiText expects 'string' or RiString, got: " + text);
            
            this.g = RiText.renderer;
            
            this.font(font);
 
            //console.log("pos="+x+","+y);
            
            this.x = arguments.length>1 ? x : this.g.__width() / 2 - this.textWidth() / 2.0;
            this.y = arguments.length>1 ? y : this.g.__height() / 2;

            return this;
        },
        
        draw : function() {
            
            var g = this.g;
            
            if (this.riString) {
            
                g.__pushState();
                
                //g.__rotate(this.rotateZ);  
                g.__translate(this.x, this.y);
                g.__scale(this.scaleX, this.scaleY, this.scaleZ);
        
                // Set color
                g.__fill(this.color.r, this.color.g, this.color.b, this.color.a);
      
                // Set font params
                g.__textAlign(this.alignment);
                g.__textFont(this._font);
        
                // Draw text
                g.__text(this.riString.text, 0, 0);
        
                // And the bounding box
                if (this.boundingBoxVisible) {
                    g.__fill(0, 0, 0, 0);
                    g.__stroke(this.color.r, this.color.g, this.color.b, this.color.a);
                    var bb = g.__getBoundingBox(this);//.font, this.riString.text);
                    g.__rect(bb.x, bb.y, bb.width, -bb.height);
//                    var th = this.textHeight();
//                    g.__rect(0, -th + g.__textDescent(this._font), g.__textWidth(this._font, this.riString.text), th);
                }
                
                g.__popState();
            }
    
            return this;
        },
        

        
        getText : function() {
            if (!this.riString || !this.riString.text)
                throw Error("Dead RiString!");
            return this.riString.text;
        },
        
        toString : function() {
            var s =  (this.riString && this.riString.text) || "undefined";
            return '['+Math.round(this.x)+","+Math.round(this.y)+",'"+s+"']";
        },
        
        splitWords : function() {
            
            var l = [];
            var txt = this.riString.text;
            var words = txt.split(' ');
    
            for ( var i = 0; i < words.length; i++) {
                if (words[i].length < 1) continue;
                var tmp = this.clone();
                tmp.setText(words[i]);
                var mx = this.getWordOffset(words, i);
                tmp.setPosition(mx, this.y);
                l.push(tmp);
            }
    
            return l;
        },
    
        splitLetters : function() {
    
            var l = [];
            var chars = [];
            var txt = this.getText();
            var len = txt.length;
            for (var t = 0; t < len; t++) {
                chars[t] = txt.charAt(t);
            }
    
            for ( var i = 0; i < chars.length; i++) {
                if (chars[i] == ' ') continue;
                var tmp = this.clone();
                tmp.setText(chars[i]);
                var mx = this.getCharOffset(i);
                tmp.setPosition(mx, this.y);
    
                l.push(tmp);
            }
    
            return l;
        },
        
        
        clone : function() {
    
            var c = new RiText(this.getText(), this.x, this.y);
            // need to clone all the parameters
            // DCH: TMP -> Must be a better (JS) way?
            c.setColor(this.color.r, this.color.g, this.color.b, this.color.a);
            c.font(this._font);
            c.setAlignment(this.alignment);
            //x,y,scale,rotate,translate,
            
            return c;
        },
        
        setAlignment : function(alignment) {
            this.alignment = alignment;
            return this;
        },
        
        getAlignment : function() {
            return this.alignment;
        },
        
        /**
         * USE SCALE instead
         * Changes the current size (and optionally, leading) for an already existing font
        setSize : function(size, leading) {
            
            this._font.size = size;
            this._font.leading = leading || size * RiText.defaults.leadingFactor;
            return this;
        },   */
        
        /**
         * Returns the size of the current font
         */
        getFontSize : function() {
            return this._font.size;
        },
        
        /**
         * Set/gets the font for this RiText
         * @param object - containing the font data (optional)
         * @returns this RiText (set) or the current font (get)
         */
        font : function(font) {
            if (arguments.length == 1) {

                this._font = font || RiText.getDefaultFont();
                this._font.size = this._font.size || RiText.defaults.fontSize;
                this._font.leading = this._font.leading || this._font.size * RiText.defaults.leadingFactor;
                return this;
            }
            else return this._font;
        },    
        

        /**
         * Set/gets the boundingbox visibility for this RiText
         * @param boolean - true or false (optional)
         * @returns this RiText (set) or the current boolean value (get)
         */
        showBoundingBox : function(trueOrFalse) {
           if (arguments.length == 1) {
               this.boundingBoxVisible = trueOrFalse;
               return this;
           }
           return this.boundingBoxVisible;
        },
    
        setText : function(t) {
    
            this.riString.setText(t);
            return this;
        },
    
        setMotionType : function(motionType) {
    
            this.motionType = motionType;
        },
    
        getColor : function() {
    
            return this.color;
        },
    
        setColor : function(cr, cg, cb, ca) {
    
            if (arguments.length >= 3) {
                    this.color.r = cr;
                    this.color.g = cg;
                    this.color.b = cb;
            }
            if (arguments.length == 4) {
                    this.color.a = ca;
            }
            if (arguments.length <= 2) {
                    this.color.r = cr;
                    this.color.g = cr;
                    this.color.b = cr;
            }
            if (arguments.length == 2) {
                    this.color.a = cg;
            }

            return this;
        },
    
        isVisible : function() {
    
            return this.color.a > 0;
        },
    
        setAlpha : function(a) {
    
            this.color.a = a;
            return this;
        },
    
        getPosition : function() {
    
            return [ this.x, this.y ];
        },
    
        setPosition : function(x, y) {
    
            this.x = x;
            this.y = y;
            
            return this;
        },
    
        rotate : function(rotate) {
          this.rotateZ = rotate;
          return this;
        },
    
        scale : function(scale) {
    
            this.scaleX = scale;
            this.scaleY = scale;
            return this;
        },
    
        fadeIn : function(sec) {
    
            this.fadeColor(null, null, null, 255, sec, RiText.FADE_IN);
            return this;
        },
    
        fadeOut : function(sec) {
    
            this.fadeColor(null, null, null, 0, sec, RiText.FADE_OUT);
            return this;
        },
    
        // !@# TODO: add delay attributes to the two functions below
        fadeColor : function(r, g, b, a, sec, type/* , delay */) {
    
            var fxType = type || RiText.FADE_COLOR; // ms // !@#
    
            var delay = 0; // delete this line when delay added
            anim = new ColorFader(this, [ r, g, b, a ], delay, toMs(sec), fxType);
                   
            this.behaviors.push(anim);
    
            return this;
        },
    
        moveTo : function(x, y, sec) {
    
            // console.log("moveTo("+x+ ", "+y+", "+sec+")");
    
            var delay = 0, // ms // !@# delete this when delay added
            anim = new TextMotion2D(this, x, y, delay, toMs(sec));
    
            this.behaviors.push(anim);
    
            return this; // or return the bejavior? (no, inconsistent)
        },
    
        getCharOffset : function(charIdx) {
    
            var theX = this.x;
    
            if (charIdx > 0) {
    
                var txt = this.getText();
    
                var len = txt.length;
                if (charIdx > len) // -1?
                charIdx = len;
    
                var sub = txt.substring(0, charIdx);
                theX = this.x + this.g.__textWidth(this._font, sub);
            }

            return theX;
        },
        
        /**
         * Returns the bounding box for the current text
         */
        boundingBox : function() {
          var bb = this.g.__getBoundingBox(this);
//          if (0 && transformed) { // tmp: do with matrix
//              bb.x += this.x;
//              bb.y += this.y;
//              bb.width *= this.scaleX;
//              bb.height *= this.scaleY;
//          }
//          * @param boolean (optional, default=false) 
//          *   if true, bounding box is first transformed (rotate,translate,scale) 
//          * according to the RiTexts current matrix
          return bb;
        },
        
        /**
         * Returns the current width of the text (derived from the bounding box)
         */
        //@param boolean (optional, default=false) if true, width is first scaled
        textWidth : function() { 
            
            return this.g.__textWidth(this._font,this.riString.text);
        },
        
        /**
         * Returns the current height of the text (derived from the bounding box)
         */
        // * @param boolean (optional, default=false) if true, height is first scaled
        textHeight : function() { 
            
            return this.g.__textHeight(this);
        },
        
        /**
         * Returns the ascent of the current assigned font 
         */
        textAscent : function() { 
            return this.g.__textAscent(this);
        },
        
        /**
         * Returns the descent of the current assigned font 
         */
        textDescent : function() { 
            return this.g.__textDescent(this);
        },
    
        getWordOffset : function(words, wordIdx) {
    
            //console.log("getWordOffset("+words+","+wordIdx+")");
    
            if (wordIdx < 0 || wordIdx >= words.length)
                throw new Error("Bad wordIdx=" + wordIdx + " for " + words);
            
            this.g.__pushState();
            //g.__textFont(this._font);
    
            var xPos = this.x;
    
            if (wordIdx > 0) {
                var pre = words.slice(0, wordIdx);
                var preStr = '';
                for ( var i = 0; i < pre.length; i++) {
                    preStr += pre[i] + ' ';
                }
    
                var tw = this.g.__textWidth(this._font, preStr);
    
                //console.log("x="+xPos+" pre='"+preStr+"' tw=" + tw); 
    
                switch (this.alignment) {
                    case RiText.LEFT:
                        xPos = this.x + tw;
                        break;
                    case RiText.RIGHT:
                        xPos = this.x - tw;
                        break;
                    default: // fix this
                        throw new Error("getWordOffset() only supported for "
                            + "LEFT & RIGHT alignments, found: " + this.alignment);
                }
            }
            this.g.__popState();
    
            return xPos;
        },

        /**
         * Removes the character at the specified index
         * 
         * @param number the index
         * @return this RiString
         */
        removeCharAt : function(ind) { 
            
            this.riString.removeCharAt(ind);
            return this;
            
        }
        
    }
    
    var RiText_P5 = makeClass();

    RiText_P5.prototype = {

        __init__ : function(p) {
            this.p = p;
        },
        
        __size : function() {
            return this.p.apply(this, arguments);
        },
        
        __getContext : function() {
            return this.p;
        },
        
        __pushState : function(str) {
            this.p.pushStyle();
            this.p.pushMatrix();
            return this;
        },
        
        __popState : function() {
            this.p.popStyle();
            this.p.popMatrix();
            return this;
        },

        __textAlign : function(align) {
            this.p.textAlign.apply(this,arguments);
            return this;
        },
        
        __scale : function(sx, sy) {
            this.p.scale(sx, sy, 1);
        },
        
        __translate : function(tx, ty) {
            this.p.translate(tx, ty, 0);
        },
        
        __rotate : function(zRot) {
            this.p.rotate(0,0,zRot);
        },
        
        __text : function(str, x, y) {
            this.p.text.apply(this,arguments);
        },
        
        __fill : function(r,g,b,a) {
            this.p.fill.apply(this,arguments);
        },
        
        __background : function(r,g,b,a) {
            this.p.background.apply(this,arguments);
        },
        
        __stroke : function(r,g,b,a) {
            this.p.stroke.apply(this,arguments);
        },
        
        __rect : function(x,y,w,h) {
            this.p.rect.apply(this,arguments);
        },

        __textFont : function(fontObj) {
            if (getType(fontObj)!='object') throw Error("__textFont takes object!");
            this.p.textFont(fontObj, fontObj.size);
        },
        
        __textWidth : function(fontObj, str) {
            this.p.pushStyle();
            this.__textFont(fontObj); 
            var tw = this.p.textWidth(str);
            this.p.popStyle();
            return tw;
        },
        
//        __textWidth : function(rt) {
//            return this.__getBoundingBox(rt).width;
//        },
        
        __textHeight : function(rt) {
            return this.__getBoundingBox(rt).height;
        },
        
        __textAscent : function(rt) {
            this.p.pushStyle();
            this.p.textFont(rt._font, rt._font.size);
            var asc = this.p.textAscent();
            this.p.popStyle();
            return asc;
        },
        
        __textDescent : function(rt) {
            this.p.pushStyle();
            this.p.textFont(rt._font, rt._font.size);
            var dsc = this.p.textDescent();
            this.p.popStyle();
            return dsc;
        },

        // actual creation: only called from RiText.createDefaultFont();!
        __createFont : function(fontName, fontSize, leading) { // ignores leading

            var font = this.p.createFont(fontName, fontSize);
            console.log("[P5] Create font: "+font.name+"-"+font.size+"/"+font.leading);
            return font;
        },

        __width : function() {

            return this.p.width;
        },
        
        __height : function() {

            return this.p.height;
        },
        
        // what about scale?
        __getBoundingBox : function(rt) {
            
            this.p.pushStyle();
            
            var ascent  =   Math.round(this.p.textAscent());
            var descent =   Math.round(this.p.textDescent());
            //console.log('[P5] ascent='+ascent+' descent='+descent+" h="+(ascent+descent));

            var width   =   Math.round(this.p.textWidth(rt.getText()));
            
            this.p.popStyle();
            
            return { x: 0, y: descent-1, width: width, height: (ascent+descent)+1 };
        },
        
        __type : function() {
            return "Processing";
        },
        
        toString : function() {
            return "RiText_"+this.__type;
        }
    };

    if (typeof Processing !== 'undefined') {
        
        Processing.registerLibrary("RiTaP5", {
            
            //console.log("Processing.registerLibrary()");
            p : null, 
            
            init : function(obj) {
              //console.log("Processing.registerLibrary.init: ");
            },
        
            attach : function(p5) {
                p = p5;
                //console.log("Processing.registerLibrary.attach: ");
                RiText.renderer= new RiText_P5(p5);
            },
            
            detach : function(p5) {
                console.log("Processing.registerLibrary.detach: ");
            },
            
            //exports : [] // export global function names?
               
        });
    }
    else {
        var cnv = document.getElementsByTagName("canvas")[0];
        try {
            var context2d = cnv.getContext("2d");
            RiText.renderer = new RiText_Canvas(context2d);
        }
        catch(e) {
            throw Error("[RiText] No object with id='canvas' in DOM");
        }
    }
    
    // P5 delegates
    RiText.prototype.fill     = RiText.prototype.setColor;
    RiText.prototype.textFont = RiText.prototype.font;
    RiText.prototype.textSize = RiText.prototype.setSize;
    
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = (function () {
            return window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function ( callback,element) {
                window.setTimeout(callback, 1000 / RiText.frameRate); // Fallback timeout
            };
        })();
    }

    window.RiText = RiText;
    RiText.createLinesByCharCountFromArray = createLinesByCharCountFromArray; // TODO: remove
    

})(window);