/*
 * TODO:
 * -- finish API tests for current objects (kenny)
 * -- add rest of objects
 * -- re-add renderer and graphical tests
 
 * QUESTIONS:
 * -- Integrating with Processing
 * -- Integrating with Canvas ?
 * -- Subclassing RiTa objects ? (Is this possible?) It should be...
  
 *  RiTa:
        splitSentences(): Can't use the lib from java for sentence parsing.
            Implemented a simple regex. What's a better alternative?

    RiText: Re-add as conditional include
    
        Fix behaviors (or redo from raphael): Problem with jump after first interpolate()!
        
        Add: fadeToText(string, sec)
        Add: scaleTo(scale, sec)
        Add: rotateTo(radians, sec)  [ignore rotate stuff for now]
        
    TextBehavior: Re-add
        timerName: Where is this (where should this be) set by user? [id or name, not both]

    RiLexicon:
        Need to better deal with words not found in dictionary (getStresses, getPhonemes, getSyllables)
        Finish: Get-random-word-by-part-of-speech

    Conjugator:
        Why are irregulars not accurate? Sleep is returning "sleeped" not "slept"
            Why is it apparently only reaching two types of rules?

    Add: RiMarkov

    Add: RiHTMLParser / Google Search / MsNgramClient
        fetch()
        fetchImage()
        Google search good to go, with API key. Should take this as argument
        
        $Id: rita-todelete.js,v 1.1 2012/06/03 21:12:57 dev Exp $

 */
(function(window, undefined) {

    /* Joins array of word, similar to words.join(" "), but preserves punctuation position */
    function joinWords(words) {
        
        var newStr = words[0];
        for ( var i = 1; i < words.length; i++) {
            if (!RiTa.isPunctuation(words[i]))
                newStr += SP;
            newStr += words[i];
        }
        return newStr;
    }
    
    function startsWith(text, substr) {
        
        return text.indexOf(substr) == 0;
    };
    
    function isNum(n) {
        
      return !isNaN(parseFloat(n)) && isFinite(n);
    }

    // Array Remove - from John Resig (MIT Licensed)
    function remove(array, from, to) {
        
      var rest = array.slice((to || from) + 1 || array.length);
      array.length = from < 0 ? array.length + from : from;
      return array.push.apply(array, rest);
    }
    
    // Array Insert 
    function insert(array, item, idx) {
        
      array.slice(idx,0,item);
      return array;
    }
    
    // from: http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
    
    function getType(obj) {
        
        return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    };

    // private object
    var RegexRule = function(regex, offset, suffix) {
        
        this.regex = new RegExp(regex);
        this.offset = offset;
        this.suffix = suffix;
    };

    RegexRule.prototype = {
        
        applies : function(word) {

            return this.regex.test(trim(word));
        },
        
        fire : function(word) {

            return this.truncate(trim(word)) + this.suffix;
        },
        
        analyze : function(word) {
            
            return ((this.suffix != "") && endsWith(word, this.suffix)) ? true : false;
        },
        
        truncate : function(word) {

            return (this.offset == 0) ? word : word.substr(0, word.length - this.offset);
        }
    };

    /*
     * Type-checking framework (expects/returns)
     * 
     * TODO: more diagnostic error messages 
     * 
     * adapted from: http://blog.jcoglan.com/2008/01/22/bringing-static-type-checking-to-javascript
     */
   // (function() {

        Function.prototype.returns = function() {
            
            if (arguments.length != 1) throw Error
                ('returns() expects 1 arg, found '+arguments.length);
            
            var method = this, expected = arguments[0];
            
            return function() {
                
                var result = method.apply(this, arguments);
                
                if (!checkSig([expected],[result])) {
                    
                    throwError('Invalid return type: ' + result + 
                        ' (' + (getType(result))+ '), expected: ' + expected+"\n");
                }
                return result;
            };
        };
    
        Function.prototype.expects = function() {
            
            var method = this, expected = []; //arguments;
            
            for ( var i = 0; i < arguments.length; i++) {
                expected[i] = arguments[i];
            }
    
            if (expected.length === 0) expected = [ [] ];
    
            // check for old-style args (not in array), e.g., expects(B,S);
            if (expected.length > 0) {
                for ( var i = 0; i < expected.length; i++) {
                    if (typeof expected[i] === 'string' && expected[i] !== 'array') {
                        throwError("Failed expects(): expected array, found string "
                            + "(perhaps an old-style arguments list?): \n" + method);
                    }
                }
            }
    
            return function() {
    
                var args = [], given = [];
                for ( var i = 0; i < expected.length; i++)
                    args.push(expected[i]);
                for ( var i = 0; i < arguments.length; i++) 
                    given.push(arguments[i]);
    
                args.push(given); // [[expected1],[expected2],...,[arguments]]
    
                if (!sigsMatch.apply(this, args)) {
                    throwError('Invalid arg types: expecting ' + 
                        asList(expected) + ' but found: '+asList(given));
                }
    
                return method.apply(this, arguments);
            };
        };
        
        var throwError = function(msg) {
            var e = TypeError(msg);
            //console.log(e);
            console.trace(this);
            //if (typeof printStackTrace !== 'undefined') printStackTrace(e);
            throw e;
        };
    
        var sigsMatch = function() {
    
            switch (arguments.length) {
    
                case 0:
                case 1:
                    throw Error("Too few args: " + arguments.length);
                    break;
    
                case 2:
                    return checkSig(arguments[0], arguments[1]);
    
                default:
    
                    var theActual = arguments[arguments.length - 1];
    
                    for ( var i = 0; i < arguments.length - 1; i++) {
                        var ok = checkSig(arguments[i], theActual);
                        if (ok) return true;
                    }
                    return false;
            }
        };
    
        var checkSig = function(expected, actual) {
            
            // log( "checkSig: expected="+expected+" actual:"+actual);
            
            if (arguments.length == 2 && expected === 'array' && actual instanceof Array)
                return true; 
            
            if (actual.length != expected.length) return false;
            
            var n = expected.length, valid, a, b;
            
            for ( var i = 0; i < n; i++) {
                a = actual[i];
                b = expected[i];
                valid = true;
    
                switch (true) {
                        
                    case b instanceof Function:
                        valid = a ? (a.isA ? a.isA(b) : (a instanceof b)) : false;
                        break;
    
                    case typeof b == 'string' || b instanceof String:
                        
                        // allow numbers for booleans (?)
                        valid = ((typeof a == b) || 
                            (b === 'boolean' && typeof a === 'number') ||
                            (b === 'array' && a instanceof Array));
    
                        break;
                }
    
                if (!valid) return false;
            }
    
            return true;
        };
    
   // })();

    // TODO: clean this up...
    var QUESTION_STARTS = ["Was", "What", "When", "Where", "How", "Which", "If", "Who", "Is", "Could", "Might", "Will", "Does", "Why"];    
    
    var W_QUESTION_STARTS = ["Was", "What", "When", "Where", "How", "Which", "Why", "Who", "Will"];
    
    var PUNCTUATION_CLASS = /[-[\]{}()*+!?%&.,\\^$|#@<>|+=;:]/g, ONLY_PUNCT = /^[^0-9A-Za-z\s]*$/;
    
    var ALL_PUNCT = /^[-[\]{}()*+!?%&.,\\^$|#@<>|+=;:]+$/g, DeLiM = ':DeLiM:', RiTextCallbacksDisabled = false;
    
    var SP = " ", N = 'number', S = 'string', O = 'object', A='array', B = 'boolean', E = "";
    
    var DEFAULT_PLURAL_RULE = new RegexRule("^((\\w+)(-\\w+)*)(\\s((\\w+)(-\\w+)*))*$", 0, "s");
    
    var PLURAL_RULES = [
                    new RegexRule("^(piano|photo|solo|ego|tobacco|cargo|golf|grief)$", 0, "s"),
                    new RegexRule("^(wildlife)$", 0, "s"),
                    new RegexRule("[bcdfghjklmnpqrstvwxyz]o$", 0, "es"),
                    new RegexRule("[bcdfghjklmnpqrstvwxyz]y$", 1, "ies"),
                    new RegexRule("([zsx]|ch|sh)$", 0, "es"),
                    new RegexRule("[lraeiou]fe$", 2, "ves"),
                    new RegexRule("[lraeiou]f$", 1, "ves"),
                    new RegexRule("(eu|eau)$", 0, "x"),
                    new RegexRule("(man|woman)$", 2, "en"),
                    new RegexRule("money$", 2, "ies"),
                    new RegexRule("person$", 4, "ople"),
                    new RegexRule("motif$", 0, "s"),
                    new RegexRule("^meninx|phalanx$", 1, "ges"),
                    new RegexRule("(xis|sis)$", 2, "es"),
                    new RegexRule("schema$", 0, "ta"),
                    new RegexRule("^bus$", 0, "ses"),
                    new RegexRule("child$", 0, "ren"),
                    new RegexRule("^(curi|formul|vertebr|larv|uln|alumn|signor|alg)a$", 0, "e"),
                    new RegexRule("^corpus$", 2, "ora"),
                    new RegexRule("^(maharaj|raj|myn|mull)a$", 0, "hs"),
                    new RegexRule("^aide-de-camp$", 8, "s-de-camp"),
                    new RegexRule("^apex|cortex$", 2, "ices"),
                    new RegexRule("^weltanschauung$", 0, "en"),
                    new RegexRule("^lied$", 0, "er"),
                    new RegexRule("^tooth$", 4, "eeth"),
                    new RegexRule("^[lm]ouse$", 4, "ice"),
                    new RegexRule("^foot$", 3, "eet"),
                    new RegexRule("femur", 2, "ora"),
                    new RegexRule("goose", 4, "eese"),
                    new RegexRule("(human|german|roman)$", 0, "s"),
                    new RegexRule("(crisis)$", 2, "es"),
                    new RegexRule("^(monarch|loch|stomach)$", 0, "s"),
                    new RegexRule("^(taxi|chief|proof|ref|relief|roof|belief)$", 0, "s"),
                    new RegexRule("^(co|no)$", 0, "'s"),
                    new RegexRule("^(memorandum|bacterium|curriculum|minimum|"
                            + "maximum|referendum|spectrum|phenomenon|criterion)$", 2, "a"),
                    new RegexRule("^(appendix|index|matrix)", 2, "ices"),
                    new RegexRule("^(stimulus|alumnus)$", 2, "i"),
                    new RegexRule(
                            "^(Bantu|Bengalese|Bengali|Beninese|Boche|bonsai|"
                                    + "Burmese|Chinese|Congolese|Gabonese|Guyanese|Japanese|Javanese|"
                                    + "Lebanese|Maltese|Olympics|Portuguese|Senegalese|Siamese|Singhalese|"
                                    + "Sinhalese|Sioux|Sudanese|Swiss|Taiwanese|Togolese|Vietnamese|aircraft|"
                                    + "anopheles|apparatus|asparagus|barracks|bellows|bison|bluefish|bob|bourgeois|"
                                    + "bream|brill|butterfingers|carp|catfish|chassis|clothes|chub|cod|codfish|"
                                    + "coley|contretemps|corps|crawfish|crayfish|crossroads|cuttlefish|dace|dice|"
                                    + "dogfish|doings|dory|downstairs|eldest|earnings|economics|electronics|finnan|"
                                    + "firstborn|fish|flatfish|flounder|fowl|fry|fries|works|globefish|goldfish|"
                                    + "grand|gudgeon|gulden|haddock|hake|halibut|headquarters|herring|hertz|horsepower|"
                                    + "goods|hovercraft|hundredweight|ironworks|jackanapes|kilohertz|kurus|kwacha|ling|lungfish|"
                                    + "mackerel|means|megahertz|moorfowl|moorgame|mullet|nepalese|offspring|pampas|parr|(pants$)|"
                                    + "patois|pekinese|penn'orth|perch|pickerel|pike|pince-nez|plaice|precis|quid|rand|"
                                    + "rendezvous|revers|roach|roux|salmon|samurai|series|seychelles|seychellois|shad|"
                                    + "sheep|shellfish|smelt|spacecraft|species|starfish|stockfish|sunfish|superficies|"
                                    + "sweepstakes|swordfish|tench|tennis|tope|triceps|trout|tuna|tunafish|tunny|turbot|trousers|"
                                    + "undersigned|veg|waterfowl|waterworks|waxworks|whiting|wildfowl|woodworm|"
                                    + "yen|aries|pisces|forceps|lieder|jeans|physics|mathematics|news|odds|politics|remains|"
                                    + "surroundings|thanks|statistics|goods|aids)$", 0, "", 0) ],
            ANY_STEM = "^((\\w+)(-\\w+)*)(\\s((\\w+)(-\\w+)*))*$",
            CONS = "[bcdfghjklmnpqrstvwxyz]",
            VERBAL_PREFIX = "((be|with|pre|un|over|re|mis|under|out|up|fore|for|counter|co|sub)(-?))",

            AUXILIARIES = [ "do", "have", "be" ],
            MODALS = [ "shall", "would", "may", "might", "ought", "should" ],
            // also
            // used by pluralizer
            SYMBOLS = [ "!", "?", "$", "%", "*", "+", "-", "=" ],

            ING_FORM_RULES = [ new RegexRule(CONS + "ie$", 2, "ying", 1),
                    new RegexRule("[^ie]e$", 1, "ing", 1),
                    new RegexRule("^bog-down$", 5, "ging-down", 0),
                    new RegexRule("^chivy$", 1, "vying", 0),
                    new RegexRule("^gen-up$", 3, "ning-up", 0),
                    new RegexRule("^trek$", 1, "cking", 0), new RegexRule("^ko$", 0, "'ing", 0),
                    new RegexRule("^(age|be)$", 0, "ing", 0), new RegexRule("(ibe)$", 1, "ing", 0) ],

            PAST_PARTICIPLE_RULES = [
                    new RegexRule("e$", 0, "d", 1),
                    new RegexRule(CONS + "y$", 1, "ied", 1),
                    new RegexRule("^" + VERBAL_PREFIX + "?(bring)$", 3, "ought", 0),
                    new RegexRule(
                            "^"
                                    + VERBAL_PREFIX
                                    + "?(take|rise|strew|blow|draw|drive|know|give|"
                                    + "arise|gnaw|grave|grow|hew|know|mow|see|sew|throw|prove|saw|quartersaw|"
                                    + "partake|sake|shake|shew|show|shrive|sightsee|strew|strive)$",
                            0, "n", 0),
                    new RegexRule("^" + VERBAL_PREFIX + "?[gd]o$", 0, "ne", 1),
                    new RegexRule("^(beat|eat|be|fall)$", 0, "en", 0),
                    new RegexRule("^(have)$", 2, "d", 0),
                    new RegexRule("^" + VERBAL_PREFIX + "?bid$", 0, "den", 0),
                    new RegexRule("^" + VERBAL_PREFIX + "?[lps]ay$", 1, "id", 1),
                    new RegexRule("^behave$", 0, "d", 0),
                    new RegexRule("^" + VERBAL_PREFIX + "?have$", 2, "d", 1),
                    new RegexRule("(sink|slink|drink)$", 3, "unk", 0),
                    new RegexRule("(([sfc][twlp]?r?|w?r)ing|hang)$", 3, "ung", 0),
                    new RegexRule("^" + VERBAL_PREFIX + "?(shear|swear|bear|wear|tear)$", 3, "orn",
                            0),
                    new RegexRule("^" + VERBAL_PREFIX + "?(bend|spend|send|lend)$", 1, "t", 0),
                    new RegexRule("^" + VERBAL_PREFIX + "?(weep|sleep|sweep|creep|keep$)$", 2,
                            "pt", 0),
                    new RegexRule("^" + VERBAL_PREFIX + "?(sell|tell)$", 3, "old", 0),
                    new RegexRule("^(outfight|beseech)$", 4, "ought", 0),
                    new RegexRule("^bethink$", 3, "ought", 0),
                    new RegexRule("^buy$", 2, "ought", 0),
                    new RegexRule("^aby$", 1, "ought", 0),
                    new RegexRule("^tarmac", 0, "ked", 0),
                    new RegexRule("^abide$", 3, "ode", 0),
                    new RegexRule("^" + VERBAL_PREFIX + "?(speak|(a?)wake|break)$", 3, "oken", 0),
                    new RegexRule("^backbite$", 1, "ten", 0),
                    new RegexRule("^backslide$", 1, "den", 0),
                    new RegexRule("^become$", 3, "ame", 0),
                    new RegexRule("^begird$", 3, "irt", 0),
                    new RegexRule("^outlie$", 2, "ay", 0),
                    new RegexRule("^rebind$", 3, "ound", 0),
                    new RegexRule("^relay$", 2, "aid", 0),
                    new RegexRule("^shit$", 3, "hat", 0),
                    new RegexRule("^bereave$", 4, "eft", 0),
                    new RegexRule("^foreswear$", 3, "ore", 0),
                    new RegexRule("^overfly$", 1, "own", 0),
                    new RegexRule("^beget$", 2, "otten", 0),
                    new RegexRule("^begin$", 3, "gun", 0),
                    new RegexRule("^bestride$", 1, "den", 0),
                    new RegexRule("^bite$", 1, "ten", 0),
                    new RegexRule("^bleed$", 4, "led", 0),
                    new RegexRule("^bog-down$", 5, "ged-down", 0),
                    new RegexRule("^bind$", 3, "ound", 0),
                    new RegexRule("^(.*)feed$", 4, "fed", 0),
                    new RegexRule("^breed$", 4, "red", 0),
                    new RegexRule("^brei", 0, "d", 0),
                    new RegexRule("^bring$", 3, "ought", 0),
                    new RegexRule("^build$", 1, "t", 0),
                    new RegexRule("^come", 0, "", 0),
                    new RegexRule("^catch$", 3, "ught", 0),
                    new RegexRule("^chivy$", 1, "vied", 0),
                    new RegexRule("^choose$", 3, "sen", 0),
                    new RegexRule("^cleave$", 4, "oven", 0),
                    new RegexRule("^crossbreed$", 4, "red", 0),
                    new RegexRule("^deal", 0, "t", 0),
                    new RegexRule("^dow$", 1, "ught", 0),
                    new RegexRule("^dream", 0, "t", 0),
                    new RegexRule("^dig$", 3, "dug", 0),
                    new RegexRule("^dwell$", 2, "lt", 0),
                    new RegexRule("^enwind$", 3, "ound", 0),
                    new RegexRule("^feel$", 3, "elt", 0),
                    new RegexRule("^flee$", 2, "ed", 0),
                    new RegexRule("^floodlight$", 5, "lit", 0),
                    new RegexRule("^fly$", 1, "own", 0),
                    new RegexRule("^forbear$", 3, "orne", 0),
                    new RegexRule("^forerun$", 3, "ran", 0),
                    new RegexRule("^forget$", 2, "otten", 0),
                    new RegexRule("^fight$", 4, "ought", 0),
                    new RegexRule("^find$", 3, "ound", 0),
                    new RegexRule("^freeze$", 4, "ozen", 0),
                    new RegexRule("^gainsay$", 2, "aid", 0),
                    new RegexRule("^gin$", 3, "gan", 0),
                    new RegexRule("^gen-up$", 3, "ned-up", 0),
                    new RegexRule("^ghostwrite$", 1, "ten", 0),
                    new RegexRule("^get$", 2, "otten", 0),
                    new RegexRule("^grind$", 3, "ound", 0),
                    new RegexRule("^hacksaw", 0, "n", 0),
                    new RegexRule("^hear", 0, "d", 0),
                    new RegexRule("^hold$", 3, "eld", 0),
                    new RegexRule("^hide$", 1, "den", 0),
                    new RegexRule("^honey$", 2, "ied", 0),
                    new RegexRule("^inbreed$", 4, "red", 0),
                    new RegexRule("^indwell$", 3, "elt", 0),
                    new RegexRule("^interbreed$", 4, "red", 0),
                    new RegexRule("^interweave$", 4, "oven", 0),
                    new RegexRule("^inweave$", 4, "oven", 0),
                    new RegexRule("^ken$", 2, "ent", 0),
                    new RegexRule("^kneel$", 3, "elt", 0),
                    new RegexRule("^lie$", 2, "ain", 0),
                    new RegexRule("^leap$", 0, "t", 0),
                    new RegexRule("^learn$", 0, "t", 0),
                    new RegexRule("^lead$", 4, "led", 0),
                    new RegexRule("^leave$", 4, "eft", 0),
                    new RegexRule("^light$", 5, "lit", 0),
                    new RegexRule("^lose$", 3, "ost", 0),
                    new RegexRule("^make$", 3, "ade", 0),
                    new RegexRule("^mean", 0, "t", 0),
                    new RegexRule("^meet$", 4, "met", 0),
                    new RegexRule("^misbecome$", 3, "ame", 0),
                    new RegexRule("^misdeal$", 2, "alt", 0),
                    new RegexRule("^mishear$", 1, "d", 0),
                    new RegexRule("^mislead$", 4, "led", 0),
                    new RegexRule("^misunderstand$", 3, "ood", 0),
                    new RegexRule("^outbreed$", 4, "red", 0),
                    new RegexRule("^outrun$", 3, "ran", 0),
                    new RegexRule("^outride$", 1, "den", 0),
                    new RegexRule("^outshine$", 3, "one", 0),
                    new RegexRule("^outshoot$", 4, "hot", 0),
                    new RegexRule("^outstand$", 3, "ood", 0),
                    new RegexRule("^outthink$", 3, "ought", 0),
                    new RegexRule("^outgo$", 2, "went", 0),
                    new RegexRule("^overbear$", 3, "orne", 0),
                    new RegexRule("^overbuild$", 3, "ilt", 0),
                    new RegexRule("^overcome$", 3, "ame", 0),
                    new RegexRule("^overfly$", 2, "lew", 0),
                    new RegexRule("^overhear$", 2, "ard", 0),
                    new RegexRule("^overlie$", 2, "ain", 0),
                    new RegexRule("^overrun$", 3, "ran", 0),
                    new RegexRule("^override$", 1, "den", 0),
                    new RegexRule("^overshoot$", 4, "hot", 0),
                    new RegexRule("^overwind$", 3, "ound", 0),
                    new RegexRule("^overwrite$", 1, "ten", 0),

                    new RegexRule("^run$", 3, "ran", 0),

                    new RegexRule("^rebuild$", 3, "ilt", 0),
                    new RegexRule("^red$", 3, "red", 0),
                    new RegexRule("^redo$", 1, "one", 0),
                    new RegexRule("^remake$", 3, "ade", 0),
                    new RegexRule("^rerun$", 3, "ran", 0),
                    new RegexRule("^resit$", 3, "sat", 0),
                    new RegexRule("^rethink$", 3, "ought", 0),
                    new RegexRule("^rewind$", 3, "ound", 0),
                    new RegexRule("^rewrite$", 1, "ten", 0),
                    new RegexRule("^ride$", 1, "den", 0),
                    new RegexRule("^reeve$", 4, "ove", 0),
                    new RegexRule("^sit$", 3, "sat", 0),
                    new RegexRule("^shoe$", 3, "hod", 0),
                    new RegexRule("^shine$", 3, "one", 0),
                    new RegexRule("^shoot$", 4, "hot", 0),
                    new RegexRule("^ski$", 1, "i'd", 0),
                    new RegexRule("^slide$", 1, "den", 0),
                    new RegexRule("^smite$", 1, "ten", 0),
                    new RegexRule("^seek$", 3, "ought", 0),
                    new RegexRule("^spit$", 3, "pat", 0),
                    new RegexRule("^speed$", 4, "ped", 0),
                    new RegexRule("^spellbind$", 3, "ound", 0),
                    new RegexRule("^spoil$", 2, "ilt", 0),
                    new RegexRule("^spotlight$", 5, "lit", 0),
                    new RegexRule("^spin$", 3, "pun", 0),
                    new RegexRule("^steal$", 3, "olen", 0),
                    new RegexRule("^stand$", 3, "ood", 0),
                    new RegexRule("^stave$", 3, "ove", 0),
                    new RegexRule("^stride$", 1, "den", 0),
                    new RegexRule("^strike$", 3, "uck", 0),
                    new RegexRule("^stick$", 3, "uck", 0),
                    new RegexRule("^swell$", 3, "ollen", 0),
                    new RegexRule("^swim$", 3, "wum", 0),
                    new RegexRule("^teach$", 4, "aught", 0),
                    new RegexRule("^think$", 3, "ought", 0),
                    new RegexRule("^tread$", 3, "odden", 0),
                    new RegexRule("^typewrite$", 1, "ten", 0),
                    new RegexRule("^unbind$", 3, "ound", 0),
                    new RegexRule("^underbuy$", 2, "ought", 0),
                    new RegexRule("^undergird$", 3, "irt", 0),
                    new RegexRule("^undergo$", 1, "one", 0),
                    new RegexRule("^underlie$", 2, "ain", 0),
                    new RegexRule("^undershoot$", 4, "hot", 0),
                    new RegexRule("^understand$", 3, "ood", 0),
                    new RegexRule("^unfreeze$", 4, "ozen", 0),
                    new RegexRule("^unlearn", 0, "t", 0),
                    new RegexRule("^unmake$", 3, "ade", 0),
                    new RegexRule("^unreeve$", 4, "ove", 0),
                    new RegexRule("^unstick$", 3, "uck", 0),
                    new RegexRule("^unteach$", 4, "aught", 0),
                    new RegexRule("^unthink$", 3, "ought", 0),
                    new RegexRule("^untread$", 3, "odden", 0),
                    new RegexRule("^unwind$", 3, "ound", 0),
                    new RegexRule("^upbuild$", 1, "t", 0),
                    new RegexRule("^uphold$", 3, "eld", 0),
                    new RegexRule("^upheave$", 4, "ove", 0),
                    new RegexRule("^waylay$", 2, "ain", 0),
                    new RegexRule("^whipsaw$", 2, "awn", 0),
                    new RegexRule("^withhold$", 3, "eld", 0),
                    new RegexRule("^withstand$", 3, "ood", 0),
                    new RegexRule("^win$", 3, "won", 0),
                    new RegexRule("^wind$", 3, "ound", 0),
                    new RegexRule("^weave$", 4, "oven", 0),
                    new RegexRule("^write$", 1, "ten", 0),
                    new RegexRule("^trek$", 1, "cked", 0),
                    new RegexRule("^ko$", 1, "o'd", 0),
                    new RegexRule("^win$", 2, "on", 0),

                    // Null past forms
                    new RegexRule(
                            "^"
                                    + VERBAL_PREFIX
                                    + "?(cast|thrust|typeset|cut|bid|upset|wet|bet|cut|hit|hurt|inset|let|cost|burst|beat|beset|set|upset|hit|offset|put|quit|"
                                    + "wed|typeset|wed|spread|split|slit|read|run|shut|shed)$", 0,
                            "", 0) ],

            PAST_TENSE_RULES = [
                    new RegexRule("^(reduce)$", 0, "d", 0),
                    new RegexRule("e$", 0, "d", 1),
                    new RegexRule("^" + VERBAL_PREFIX + "?[pls]ay$", 1, "id", 1),
                    new RegexRule(CONS + "y$", 1, "ied", 1),
                    new RegexRule("^(fling|cling|hang)$", 3, "ung", 0),
                    new RegexRule("(([sfc][twlp]?r?|w?r)ing)$", 3, "ang", 1),
                    new RegexRule("^" + VERBAL_PREFIX + "?(bend|spend|send|lend|spend)$", 1, "t", 0),
                    new RegexRule("^" + VERBAL_PREFIX + "?lie$", 2, "ay", 0),
                    new RegexRule("^" + VERBAL_PREFIX + "?(weep|sleep|sweep|creep|keep)$", 2, "pt",
                            0),
                    new RegexRule("^" + VERBAL_PREFIX + "?(sell|tell)$", 3, "old", 0),
                    new RegexRule("^" + VERBAL_PREFIX + "?do$", 1, "id", 0),
                    new RegexRule("^" + VERBAL_PREFIX + "?dig$", 2, "ug", 0),
                    new RegexRule("^behave$", 0, "d", 0),
                    new RegexRule("^(have)$", 2, "d", 0),
                    new RegexRule("(sink|drink)$", 3, "ank", 0),
                    new RegexRule("^swing$", 3, "ung", 0),
                    new RegexRule("^be$", 2, "was", 0),
                    new RegexRule("^outfight$", 4, "ought", 0),
                    new RegexRule("^tarmac", 0, "ked", 0),
                    new RegexRule("^abide$", 3, "ode", 0),
                    new RegexRule("^aby$", 1, "ought", 0),
                    new RegexRule("^become$", 3, "ame", 0),
                    new RegexRule("^begird$", 3, "irt", 0),
                    new RegexRule("^outlie$", 2, "ay", 0),
                    new RegexRule("^rebind$", 3, "ound", 0),
                    new RegexRule("^shit$", 3, "hat", 0),
                    new RegexRule("^bereave$", 4, "eft", 0),
                    new RegexRule("^foreswear$", 3, "ore", 0),
                    new RegexRule("^bename$", 3, "empt", 0),
                    new RegexRule("^beseech$", 4, "ought", 0),
                    new RegexRule("^bethink$", 3, "ought", 0),
                    new RegexRule("^bleed$", 4, "led", 0),
                    new RegexRule("^bog-down$", 5, "ged-down", 0),
                    new RegexRule("^buy$", 2, "ought", 0),
                    new RegexRule("^bind$", 3, "ound", 0),
                    new RegexRule("^(.*)feed$", 4, "fed", 0),
                    new RegexRule("^breed$", 4, "red", 0),
                    new RegexRule("^brei$", 2, "eid", 0),
                    new RegexRule("^bring$", 3, "ought", 0),
                    new RegexRule("^build$", 3, "ilt", 0),
                    new RegexRule("^come$", 3, "ame", 0),
                    new RegexRule("^catch$", 3, "ught", 0),
                    new RegexRule("^clothe$", 5, "lad", 0),
                    new RegexRule("^crossbreed$", 4, "red", 0),
                    new RegexRule("^deal$", 2, "alt", 0),
                    new RegexRule("^dow$", 1, "ught", 0),
                    new RegexRule("^dream$", 2, "amt", 0),
                    new RegexRule("^dwell$", 3, "elt", 0),
                    new RegexRule("^enwind$", 3, "ound", 0),
                    new RegexRule("^feel$", 3, "elt", 0),
                    new RegexRule("^flee$", 3, "led", 0),
                    new RegexRule("^floodlight$", 5, "lit", 0),
                    new RegexRule("^arise$", 3, "ose", 0),
                    new RegexRule("^eat$", 3, "ate", 0),
                    new RegexRule("^awake$", 3, "oke", 0),
                    new RegexRule("^backbite$", 4, "bit", 0),
                    new RegexRule("^backslide$", 4, "lid", 0),
                    new RegexRule("^befall$", 3, "ell", 0),
                    new RegexRule("^begin$", 3, "gan", 0),
                    new RegexRule("^beget$", 3, "got", 0),
                    new RegexRule("^behold$", 3, "eld", 0),
                    new RegexRule("^bespeak$", 3, "oke", 0),
                    new RegexRule("^bestride$", 3, "ode", 0),
                    new RegexRule("^betake$", 3, "ook", 0),
                    new RegexRule("^bite$", 4, "bit", 0),
                    new RegexRule("^blow$", 3, "lew", 0),
                    new RegexRule("^bear$", 3, "ore", 0),
                    new RegexRule("^break$", 3, "oke", 0),
                    new RegexRule("^choose$", 4, "ose", 0),
                    new RegexRule("^cleave$", 4, "ove", 0),
                    new RegexRule("^countersink$", 3, "ank", 0),
                    new RegexRule("^drink$", 3, "ank", 0),
                    new RegexRule("^draw$", 3, "rew", 0),
                    new RegexRule("^drive$", 3, "ove", 0),
                    new RegexRule("^fall$", 3, "ell", 0),
                    new RegexRule("^fly$", 2, "lew", 0),
                    new RegexRule("^flyblow$", 3, "lew", 0),
                    new RegexRule("^forbid$", 2, "ade", 0),
                    new RegexRule("^forbear$", 3, "ore", 0),
                    new RegexRule("^foreknow$", 3, "new", 0),
                    new RegexRule("^foresee$", 3, "saw", 0),
                    new RegexRule("^forespeak$", 3, "oke", 0),
                    new RegexRule("^forego$", 2, "went", 0),
                    new RegexRule("^forgive$", 3, "ave", 0),
                    new RegexRule("^forget$", 3, "got", 0),
                    new RegexRule("^forsake$", 3, "ook", 0),
                    new RegexRule("^forspeak$", 3, "oke", 0),
                    new RegexRule("^forswear$", 3, "ore", 0),
                    new RegexRule("^forgo$", 2, "went", 0),
                    new RegexRule("^fight$", 4, "ought", 0),
                    new RegexRule("^find$", 3, "ound", 0),
                    new RegexRule("^freeze$", 4, "oze", 0),
                    new RegexRule("^give$", 3, "ave", 0),
                    new RegexRule("^geld$", 3, "elt", 0),
                    new RegexRule("^gen-up$", 3, "ned-up", 0),
                    new RegexRule("^ghostwrite$", 3, "ote", 0),
                    new RegexRule("^get$", 3, "got", 0),
                    new RegexRule("^grow$", 3, "rew", 0),
                    new RegexRule("^grind$", 3, "ound", 0),
                    new RegexRule("^hear$", 2, "ard", 0),
                    new RegexRule("^hold$", 3, "eld", 0),
                    new RegexRule("^hide$", 4, "hid", 0),
                    new RegexRule("^honey$", 2, "ied", 0),
                    new RegexRule("^inbreed$", 4, "red", 0),
                    new RegexRule("^indwell$", 3, "elt", 0),
                    new RegexRule("^interbreed$", 4, "red", 0),
                    new RegexRule("^interweave$", 4, "ove", 0),
                    new RegexRule("^inweave$", 4, "ove", 0),
                    new RegexRule("^ken$", 2, "ent", 0),
                    new RegexRule("^kneel$", 3, "elt", 0),
                    new RegexRule("^^know$$", 3, "new", 0),
                    new RegexRule("^leap$", 2, "apt", 0),
                    new RegexRule("^learn$", 2, "rnt", 0),
                    new RegexRule("^lead$", 4, "led", 0),
                    new RegexRule("^leave$", 4, "eft", 0),
                    new RegexRule("^light$", 5, "lit", 0),
                    new RegexRule("^lose$", 3, "ost", 0),
                    new RegexRule("^make$", 3, "ade", 0),
                    new RegexRule("^mean$", 2, "ant", 0),
                    new RegexRule("^meet$", 4, "met", 0),
                    new RegexRule("^misbecome$", 3, "ame", 0),
                    new RegexRule("^misdeal$", 2, "alt", 0),
                    new RegexRule("^misgive$", 3, "ave", 0),
                    new RegexRule("^mishear$", 2, "ard", 0),
                    new RegexRule("^mislead$", 4, "led", 0),
                    new RegexRule("^mistake$", 3, "ook", 0),
                    new RegexRule("^misunderstand$", 3, "ood", 0),
                    new RegexRule("^outbreed$", 4, "red", 0),
                    new RegexRule("^outgrow$", 3, "rew", 0),
                    new RegexRule("^outride$", 3, "ode", 0),
                    new RegexRule("^outshine$", 3, "one", 0),
                    new RegexRule("^outshoot$", 4, "hot", 0),
                    new RegexRule("^outstand$", 3, "ood", 0),
                    new RegexRule("^outthink$", 3, "ought", 0),
                    new RegexRule("^outgo$", 2, "went", 0),
                    new RegexRule("^outwear$", 3, "ore", 0),
                    new RegexRule("^overblow$", 3, "lew", 0),
                    new RegexRule("^overbear$", 3, "ore", 0),
                    new RegexRule("^overbuild$", 3, "ilt", 0),
                    new RegexRule("^overcome$", 3, "ame", 0),
                    new RegexRule("^overdraw$", 3, "rew", 0),
                    new RegexRule("^overdrive$", 3, "ove", 0),
                    new RegexRule("^overfly$", 2, "lew", 0),
                    new RegexRule("^overgrow$", 3, "rew", 0),
                    new RegexRule("^overhear$", 2, "ard", 0),
                    new RegexRule("^overpass$", 3, "ast", 0),
                    new RegexRule("^override$", 3, "ode", 0),
                    new RegexRule("^oversee$", 3, "saw", 0),
                    new RegexRule("^overshoot$", 4, "hot", 0),
                    new RegexRule("^overthrow$", 3, "rew", 0),
                    new RegexRule("^overtake$", 3, "ook", 0),
                    new RegexRule("^overwind$", 3, "ound", 0),
                    new RegexRule("^overwrite$", 3, "ote", 0),
                    new RegexRule("^partake$", 3, "ook", 0),
                    new RegexRule("^" + VERBAL_PREFIX + "?run$", 2, "an", 0),
                    new RegexRule("^ring$", 3, "ang", 0),
                    new RegexRule("^rebuild$", 3, "ilt", 0),
                    new RegexRule("^red", 0, "", 0),
                    new RegexRule("^reave$", 4, "eft", 0),
                    new RegexRule("^remake$", 3, "ade", 0),
                    new RegexRule("^resit$", 3, "sat", 0),
                    new RegexRule("^rethink$", 3, "ought", 0),
                    new RegexRule("^retake$", 3, "ook", 0),
                    new RegexRule("^rewind$", 3, "ound", 0),
                    new RegexRule("^rewrite$", 3, "ote", 0),
                    new RegexRule("^ride$", 3, "ode", 0),
                    new RegexRule("^rise$", 3, "ose", 0),
                    new RegexRule("^reeve$", 4, "ove", 0),
                    new RegexRule("^sing$", 3, "ang", 0),
                    new RegexRule("^sink$", 3, "ank", 0),
                    new RegexRule("^sit$", 3, "sat", 0),
                    new RegexRule("^see$", 3, "saw", 0),
                    new RegexRule("^shoe$", 3, "hod", 0),
                    new RegexRule("^shine$", 3, "one", 0),
                    new RegexRule("^shake$", 3, "ook", 0),
                    new RegexRule("^shoot$", 4, "hot", 0),
                    new RegexRule("^shrink$", 3, "ank", 0),
                    new RegexRule("^shrive$", 3, "ove", 0),
                    new RegexRule("^sightsee$", 3, "saw", 0),
                    new RegexRule("^ski$", 1, "i'd", 0),
                    new RegexRule("^skydive$", 3, "ove", 0),
                    new RegexRule("^slay$", 3, "lew", 0),
                    new RegexRule("^slide$", 4, "lid", 0),
                    new RegexRule("^slink$", 3, "unk", 0),
                    new RegexRule("^smite$", 4, "mit", 0),
                    new RegexRule("^seek$", 3, "ought", 0),
                    new RegexRule("^spit$", 3, "pat", 0),
                    new RegexRule("^speed$", 4, "ped", 0),
                    new RegexRule("^spellbind$", 3, "ound", 0),
                    new RegexRule("^spoil$", 2, "ilt", 0),
                    new RegexRule("^speak$", 3, "oke", 0),
                    new RegexRule("^spotlight$", 5, "lit", 0),
                    new RegexRule("^spring$", 3, "ang", 0),
                    new RegexRule("^spin$", 3, "pun", 0),
                    new RegexRule("^stink$", 3, "ank", 0),
                    new RegexRule("^steal$", 3, "ole", 0),
                    new RegexRule("^stand$", 3, "ood", 0),
                    new RegexRule("^stave$", 3, "ove", 0),
                    new RegexRule("^stride$", 3, "ode", 0),
                    new RegexRule("^strive$", 3, "ove", 0),
                    new RegexRule("^strike$", 3, "uck", 0),
                    new RegexRule("^stick$", 3, "uck", 0),
                    new RegexRule("^swim$", 3, "wam", 0),
                    new RegexRule("^swear$", 3, "ore", 0),
                    new RegexRule("^teach$", 4, "aught", 0),
                    new RegexRule("^think$", 3, "ought", 0),
                    new RegexRule("^throw$", 3, "rew", 0),
                    new RegexRule("^take$", 3, "ook", 0),
                    new RegexRule("^tear$", 3, "ore", 0),
                    new RegexRule("^transship$", 4, "hip", 0),
                    new RegexRule("^tread$", 4, "rod", 0),
                    new RegexRule("^typewrite$", 3, "ote", 0),
                    new RegexRule("^unbind$", 3, "ound", 0),
                    new RegexRule("^unclothe$", 5, "lad", 0),
                    new RegexRule("^underbuy$", 2, "ought", 0),
                    new RegexRule("^undergird$", 3, "irt", 0),
                    new RegexRule("^undershoot$", 4, "hot", 0),
                    new RegexRule("^understand$", 3, "ood", 0),
                    new RegexRule("^undertake$", 3, "ook", 0),
                    new RegexRule("^undergo$", 2, "went", 0),
                    new RegexRule("^underwrite$", 3, "ote", 0),
                    new RegexRule("^unfreeze$", 4, "oze", 0),
                    new RegexRule("^unlearn$", 2, "rnt", 0),
                    new RegexRule("^unmake$", 3, "ade", 0),
                    new RegexRule("^unreeve$", 4, "ove", 0),
                    new RegexRule("^unspeak$", 3, "oke", 0),
                    new RegexRule("^unstick$", 3, "uck", 0),
                    new RegexRule("^unswear$", 3, "ore", 0),
                    new RegexRule("^unteach$", 4, "aught", 0),
                    new RegexRule("^unthink$", 3, "ought", 0),
                    new RegexRule("^untread$", 4, "rod", 0),
                    new RegexRule("^unwind$", 3, "ound", 0),
                    new RegexRule("^upbuild$", 3, "ilt", 0),
                    new RegexRule("^uphold$", 3, "eld", 0),
                    new RegexRule("^upheave$", 4, "ove", 0),
                    new RegexRule("^uprise$", 3, "ose", 0),
                    new RegexRule("^upspring$", 3, "ang", 0),
                    new RegexRule("^go$", 2, "went", 0),
                    new RegexRule("^wiredraw$", 3, "rew", 0),
                    new RegexRule("^withdraw$", 3, "rew", 0),
                    new RegexRule("^withhold$", 3, "eld", 0),
                    new RegexRule("^withstand$", 3, "ood", 0),
                    new RegexRule("^wake$", 3, "oke", 0),
                    new RegexRule("^win$", 3, "won", 0),
                    new RegexRule("^wear$", 3, "ore", 0),
                    new RegexRule("^wind$", 3, "ound", 0),
                    new RegexRule("^weave$", 4, "ove", 0),
                    new RegexRule("^write$", 3, "ote", 0),
                    new RegexRule("^trek$", 1, "cked", 0),
                    new RegexRule("^ko$", 1, "o'd", 0),
                    new RegexRule("^bid", 2, "ade", 0),
                    new RegexRule("^win$", 2, "on", 0),
                    new RegexRule("^swim", 2, "am", 0),
                    // Null past forms
                    new RegexRule("^" + VERBAL_PREFIX
                            + "?(cast|thrust|typeset|cut|bid|upset|wet|bet|cut|hit|hurt|inset|"
                            + "let|cost|burst|beat|beset|set|upset|offset|put|quit|wed|typeset|"
                            + "wed|spread|split|slit|read|run|shut|shed|lay)$", 0, "", 0) ],

            PRESENT_TENSE_RULES = [ new RegexRule("^aby$", 0, "es", 0),
                    new RegexRule("^bog-down$", 5, "s-down", 0),
                    new RegexRule("^chivy$", 1, "vies", 0),
                    new RegexRule("^gen-up$", 3, "s-up", 0),
                    new RegexRule("^prologue$", 3, "gs", 0),
                    new RegexRule("^picknic$", 0, "ks", 0), new RegexRule("^ko$", 0, "'s", 0),
                    new RegexRule("[osz]$", 0, "es", 1), new RegexRule("^have$", 2, "s", 0),
                    new RegexRule(CONS + "y$", 1, "ies", 1), new RegexRule("^be$", 2, "is"),
                    new RegexRule("([zsx]|ch|sh)$", 0, "es", 1) ],

            VERB_CONS_DOUBLING = [ "abat", "abet", "abhor", "abut", "accur", "acquit", "adlib",
                    "admit", "aerobat", "aerosol", "agendaset", "allot", "alot", "anagram",
                    "annul", "appal", "apparel", "armbar", "aver", "babysit", "airdrop", "appal",
                    "blackleg", "bobsled", "bur", "chum", "confab", "counterplot", "curet", "dib",
                    "backdrop", "backfil", "backflip", "backlog", "backpedal", "backslap",
                    "backstab", "bag", "balfun", "ballot", "ban", "bar", "barbel", "bareleg",
                    "barrel", "bat", "bayonet", "becom", "bed", "bedevil", "bedwet", "beenhop",
                    "befit", "befog", "beg", "beget", "begin", "bejewel", "bemedal", "benefit",
                    "benum", "beset", "besot", "bestir", "bet", "betassel", "bevel", "bewig",
                    "bib", "bid", "billet", "bin", "bip", "bit", "bitmap", "blab", "blag", "blam",
                    "blan", "blat", "bles", "blim", "blip", "blob", "bloodlet", "blot", "blub",
                    "blur", "bob", "bodypop", "bog", "booby-trap", "boobytrap", "booksel",
                    "bootleg", "bop", "bot", "bowel", "bracket", "brag", "brig", "brim", "bud",
                    "buffet", "bug", "bullshit", "bum", "bun", "bus", "but", "cab", "cabal", "cam",
                    "can", "cancel", "cap", "caracol", "caravan", "carburet", "carnap", "carol",
                    "carpetbag", "castanet", "cat", "catcal", "catnap", "cavil", "chan", "chanel",
                    "channel", "chap", "char", "chargecap", "chat", "chin", "chip", "chir",
                    "chirrup", "chisel", "chop", "chug", "chur", "clam", "clap", "clearcut",
                    "clip", "clodhop", "clog", "clop", "closet", "clot", "club", "co-occur",
                    "co-program", "co-refer", "co-run", "co-star", "cob", "cobweb", "cod", "coif",
                    "com", "combat", "comit", "commit", "compel", "con", "concur", "confer",
                    "confiscat", "control", "cop", "coquet", "coral", "corbel", "corral", "cosset",
                    "cotransmit", "councel", "council", "counsel", "court-martial", "crab", "cram",
                    "crap", "crib", "crop", "crossleg", "cub", "cudgel", "cum", "cun", "cup",
                    "cut", "dab", "dag", "dam", "dan", "dap", "daysit", "de-control", "de-gazet",
                    "de-hul", "de-instal", "de-mob", "de-program", "de-rig", "de-skil", "deadpan",
                    "debag", "debar", "log", "decommit", "decontrol", "defer", "defog", "deg",
                    "degas", "deinstal", "demit", "demob", "demur", "den", "denet", "depig",
                    "depip", "depit", "der", "deskil", "deter", "devil", "diagram", "dial", "dig",
                    "dim", "din", "dip", "disbar", "disbud", "discomfit", "disembed", "disembowel",
                    "dishevel", "disinter", "dispel", "disprefer", "distil", "dog", "dognap",
                    "don", "doorstep", "dot", "dowel", "drag", "drat", "driftnet", "distil",
                    "egotrip", "enrol", "enthral", "extol", "fulfil", "gaffe", "golliwog", "idyl",
                    "inspan", "drip", "drivel", "drop", "drub", "drug", "drum", "dub", "duel",
                    "dun", "dybbuk", "earwig", "eavesdrop", "ecolabel", "eitherspigot",
                    "electroblot", "embed", "emit", "empanel", "enamel", "endlabel", "endtrim",
                    "enrol", "enthral", "entrammel", "entrap", "enwrap", "equal", "equip", "estop",
                    "exaggerat", "excel", "expel", "extol", "fag", "fan", "farewel", "fat",
                    "featherbed", "feget", "fet", "fib", "fig", "fin", "fingerspel", "fingertip",
                    "fit", "flab", "flag", "flap", "flip", "flit", "flog", "flop", "fob", "focus",
                    "fog", "footbal", "footslog", "fop", "forbid", "forget", "format",
                    "fortunetel", "fot", "foxtrot", "frag", "freefal", "fret", "frig", "frip",
                    "frog", "frug", "fuel", "fufil", "fulfil", "fullyfit", "fun", "funnel", "fur",
                    "furpul", "gab", "gad", "gag", "gam", "gambol", "gap", "garot", "garrot",
                    "gas", "gat", "gel", "gen", "get", "giftwrap", "gig", "gimbal", "gin", "glam",
                    "glenden", "glendin", "globetrot", "glug", "glut", "gob", "goldpan", "goostep",
                    "gossip", "grab", "gravel", "grid", "grin", "grip", "grit", "groundhop",
                    "grovel", "grub", "gum", "gun", "gunrun", "gut", "gyp", "haircut", "ham",
                    "han", "handbag", "handicap", "handknit", "handset", "hap", "hareleg", "hat",
                    "headbut", "hedgehop", "hem", "hen", "hiccup", "highwal", "hip", "hit",
                    "hobnob", "hog", "hop", "horsewhip", "hostel", "hot", "hotdog", "hovel", "hug",
                    "hum", "humbug", "hup", "hushkit", "hut", "illfit", "imbed", "immunblot",
                    "immunoblot", "impannel", "impel", "imperil", "incur", "infer", "infil",
                    "inflam", "initial", "input", "inset", "instil", "inter", "interbed",
                    "intercrop", "intercut", "interfer", "instal", "instil", "intermit", "japan",
                    "jug", "kris", "manumit", "mishit", "mousse", "mud", "interwar", "jab", "jag",
                    "jam", "jar", "jawdrop", "jet", "jetlag", "jewel", "jib", "jig", "jitterbug",
                    "job", "jog", "jog-trot", "jot", "jut", "ken", "kennel", "kid", "kidnap",
                    "kip", "kissogram", "kit", "knap", "kneecap", "knit", "knob", "knot", "kor",
                    "label", "lag", "lam", "lap", "lavel", "leafcut", "leapfrog", "leg", "lem",
                    "lep", "let", "level", "libel", "lid", "lig", "lip", "lob", "log", "lok",
                    "lollop", "longleg", "lop", "lowbal", "lug", "mackerel", "mahom", "man", "map",
                    "mar", "marshal", "marvel", "mat", "matchwin", "metal", "micro-program",
                    "microplan", "microprogram", "milksop", "mis-cal", "mis-club", "mis-spel",
                    "miscal", "mishit", "mislabel", "mit", "mob", "mod", "model", "mohmam",
                    "monogram", "mop", "mothbal", "mug", "multilevel", "mum", "nab", "nag", "nan",
                    "nap", "net", "nightclub", "nightsit", "nip", "nod", "nonplus", "norkop",
                    "nostril", "not", "nut", "nutmeg", "occur", "ocur", "offput", "offset", "omit",
                    "ommit", "onlap", "out-general", "out-gun", "out-jab", "out-plan", "out-pol",
                    "out-pul", "out-put", "out-run", "out-sel", "outbid", "outcrop", "outfit",
                    "outgas", "outgun", "outhit", "outjab", "outpol", "output", "outrun",
                    "outship", "outshop", "outsin", "outstrip", "outswel", "outspan", "overcrop",
                    "pettifog", "photostat", "pouf", "preset", "prim", "pug", "ret", "rosin",
                    "outwit", "over-commit", "over-control", "over-fil", "over-fit", "over-lap",
                    "over-model", "over-pedal", "over-pet", "over-run", "over-sel", "over-step",
                    "over-tip", "over-top", "overbid", "overcal", "overcommit", "overcontrol",
                    "overcrap", "overdub", "overfil", "overhat", "overhit", "overlap", "overman",
                    "overplot", "overrun", "overshop", "overstep", "overtip", "overtop", "overwet",
                    "overwil", "pad", "paintbal", "pan", "panel", "paperclip", "par", "parallel",
                    "parcel", "partiescal", "pat", "patrol", "pedal", "peewit", "peg", "pen",
                    "pencil", "pep", "permit", "pet", "petal", "photoset", "phototypeset", "phut",
                    "picket", "pig", "pilot", "pin", "pinbal", "pip", "pipefit", "pipet", "pit",
                    "plan", "plit", "plod", "plop", "plot", "plug", "plumet", "plummet", "pod",
                    "policyset", "polyfil", "ponytrek", "pop", "pot", "pram", "prebag",
                    "predistil", "predril", "prefer", "prefil", "preinstal", "prep", "preplan",
                    "preprogram", "prizewin", "prod", "profer", "prog", "program", "prop",
                    "propel", "pub", "pummel", "pun", "pup", "pushfit", "put", "quarel", "quarrel",
                    "quickskim", "quickstep", "quickwit", "quip", "quit", "quivertip", "quiz",
                    "rabbit", "rabit", "radiolabel", "rag", "ram", "ramrod", "rap", "rat",
                    "ratecap", "ravel", "re-admit", "re-cal", "re-cap", "re-channel", "re-dig",
                    "re-dril", "re-emit", "re-fil", "re-fit", "re-flag", "re-format", "re-fret",
                    "re-hab", "re-instal", "re-inter", "re-lap", "re-let", "re-map", "re-metal",
                    "re-model", "re-pastel", "re-plan", "re-plot", "re-plug", "re-pot",
                    "re-program", "re-refer", "re-rig", "re-rol", "re-run", "re-sel", "re-set",
                    "re-skin", "re-stal", "re-submit", "re-tel", "re-top", "re-transmit",
                    "re-trim", "re-wrap", "readmit", "reallot", "rebel", "rebid", "rebin", "rebut",
                    "recap", "rechannel", "recommit", "recrop", "recur", "recut", "red", "redril",
                    "refer", "refit", "reformat", "refret", "refuel", "reget", "regret", "reinter",
                    "rejig", "rekit", "reknot", "relabel", "relet", "rem", "remap", "remetal",
                    "remit", "remodel", "reoccur", "rep", "repel", "repin", "replan", "replot",
                    "repol", "repot", "reprogram", "rerun", "reset", "resignal", "resit", "reskil",
                    "resubmit", "retransfer", "retransmit", "retro-fit", "retrofit", "rev",
                    "revel", "revet", "rewrap", "rib", "richochet", "ricochet", "rid", "rig",
                    "rim", "ringlet", "rip", "rit", "rival", "rivet", "roadrun", "rob", "rocket",
                    "rod", "roset", "rot", "rowel", "rub", "run", "runnel", "rut", "sab", "sad",
                    "sag", "sandbag", "sap", "scab", "scalpel", "scam", "scan", "scar", "scat",
                    "schlep", "scrag", "scram", "shall", "sled", "smut", "stet", "sulfuret",
                    "trepan", "unrip", "unstop", "whir", "whop", "wig", "scrap", "scrat", "scrub",
                    "scrum", "scud", "scum", "scur", "semi-control", "semi-skil", "semi-skim",
                    "semiskil", "sentinel", "set", "shag", "sham", "shed", "shim", "shin", "ship",
                    "shir", "shit", "shlap", "shop", "shopfit", "shortfal", "shot", "shovel",
                    "shred", "shrinkwrap", "shrivel", "shrug", "shun", "shut", "side-step",
                    "sideslip", "sidestep", "signal", "sin", "sinbin", "sip", "sit", "skid",
                    "skim", "skin", "skip", "skir", "skrag", "slab", "slag", "slam", "slap",
                    "slim", "slip", "slit", "slob", "slog", "slop", "slot", "slowclap", "slug",
                    "slum", "slur", "smit", "snag", "snap", "snip", "snivel", "snog", "snorkel",
                    "snowcem", "snub", "snug", "sob", "sod", "softpedal", "son", "sop", "spam",
                    "span", "spar", "spat", "spiderweb", "spin", "spiral", "spit", "splat",
                    "split", "spot", "sprag", "spraygun", "sprig", "springtip", "spud", "spur",
                    "squat", "squirrel", "stab", "stag", "star", "stem", "sten", "stencil", "step",
                    "stir", "stop", "storytel", "strap", "strim", "strip", "strop", "strug",
                    "strum", "strut", "stub", "stud", "stun", "sub", "subcrop", "sublet", "submit",
                    "subset", "suedetrim", "sum", "summit", "sun", "suntan", "sup", "super-chil",
                    "superad", "swab", "swag", "swan", "swap", "swat", "swig", "swim", "swivel",
                    "swot", "tab", "tag", "tan", "tansfer", "tap", "tar", "tassel", "tat", "tefer",
                    "teleshop", "tendril", "terschel", "th'strip", "thermal", "thermostat", "thin",
                    "throb", "thrum", "thud", "thug", "tightlip", "tin", "tinsel", "tip", "tittup",
                    "toecap", "tog", "tom", "tomorrow", "top", "tot", "total", "towel", "traget",
                    "trainspot", "tram", "trammel", "transfer", "tranship", "transit", "transmit",
                    "transship", "trap", "travel", "trek", "trendset", "trim", "trip", "tripod",
                    "trod", "trog", "trot", "trousseaushop", "trowel", "trup", "tub", "tug",
                    "tunnel", "tup", "tut", "twat", "twig", "twin", "twit", "typeset", "tyset",
                    "un-man", "unban", "unbar", "unbob", "uncap", "unclip", "uncompel", "undam",
                    "under-bil", "under-cut", "under-fit", "under-pin", "under-skil", "underbid",
                    "undercut", "underlet", "underman", "underpin", "unfit", "unfulfil", "unknot",
                    "unlip", "unlywil", "unman", "unpad", "unpeg", "unpin", "unplug", "unravel",
                    "unrol", "unscrol", "unsnap", "unstal", "unstep", "unstir", "untap", "unwrap",
                    "unzip", "up", "upset", "upskil", "upwel", "ven", "verbal", "vet", "victual",
                    "vignet", "wad", "wag", "wainscot", "wan", "war", "water-log", "waterfal",
                    "waterfil", "waterlog", "weasel", "web", "wed", "wet", "wham", "whet", "whip",
                    "whir", "whiteskin", "whiz", "whup", "wildcat", "win", "windmil", "wit",
                    "woodchop", "woodcut", "wor", "worship", "wrap", "wiretap", "yen", "yak",
                    "yap", "yarnspin", "yip", "yodel", "zag", "zap", "zig", "zig-zag", "zigzag",
                    "zip", "ztrip", "hand-bag", "hocus", "hocus-pocus" ],

            PAST_PARTICIPLE_RULESET = {
                name : "PAST_PARTICIPLE",
                defaultRule : new RegexRule(ANY_STEM, 0, "ed", 2),
                rules : PAST_PARTICIPLE_RULES,
                doubling : false
            },

            PRESENT_PARTICIPLE_RULESET = {
                name : "ING_FORM",
                defaultRule : new RegexRule(ANY_STEM, 0, "ing", 2),
                rules : ING_FORM_RULES,
                doubling : false
            },

            PAST_TENSE_RULESET = {
                name : "PAST_TENSE",
                defaultRule : new RegexRule(ANY_STEM, 0, "ed", 2),
                rules : PAST_TENSE_RULES,
                doubling : false
            },

            PRESENT_TENSE_RULESET = {
                name : "PRESENT_TENSE",
                defaultRule : new RegexRule(ANY_STEM, 0, "s", 2),
                rules : PRESENT_TENSE_RULES,
                doubling : true
            };

    // PRIVATE FUNCTIONS
    // ----------------------------------------------------------

    function dump(obj) {

        var properties = "";
        for ( var propertyName in obj) {

            properties += propertyName + ": ";

            // Check if its NOT a function
            if (!(obj[propertyName] instanceof Function)) {
                properties += obj.propertyName;
            } else {
                properties += "function()";
            }
            properties += ", ";
        }
        return properties;
    }
    
//    function asList(array) {  OLD (non-recursive) VERSION
//        
//        var s="[";
//        for ( var i = 0; i < array.length; i++) {
//            s += array[i];
//            if (i < array.length-1) s += ", ";
//        }
//        return s+"]";
//    }
    
    function asList(array) {
        
        var s="[";
        for ( var i = 0; i < array.length; i++) {
            var el = array[i];
            if (array[i] instanceof Array)
                el = asList(array[i]);
            s += el;
            if (i < array.length-1) s += ", ";
        }
        return s+"]";
    }

    function isNull(obj) {
        
        return (typeof obj === 'undefined' || obj === null);
    }

    function error(msg) {
        
        (!RiTa.SILENT) && console.trace(this);
        throw Error("[RiTa] " + msg);
    }
    
    function warn() {
        
        if (RiTa.SILENT) return;
        console.warn("[RiTa] ");
        for ( var i = 0; i < arguments.length; i++) {
            console.warn(arguments[i]);
        }
    }
 
    function log(msg) {
        
        if (RiTa.SILENT) return;
        console.log("[RiTa] ");
        for ( var i = 0; i < arguments.length; i++) {
            console.log(arguments[i]);
        }
    }

    function strOk(str) {
        
        return (typeof str === 'string' && str.length > 0);
    }

    function trim(str) {
        // faster version from: http://blog.stevenlevithan.com/archives/faster-trim-javascript
        return str.replace(/^\s\s*/, '').replace(/\s\s*$/, ''); 
        //return str.replace(/^\s*(\S*(?:\s+\S+)*)\s*$/, "$1");
    }

    function inArray(array, val) {
        
        var i = array.length;
        while (i--) {
            if (array[i] == val) {
                return true;
            }
        }
        return false;
    }

    function replaceAll(theText, replace, withThis) {

        return theText.replace(new RegExp(replace, 'g'), withThis);
    }

    function endsWith(str, ending) { // test this!!!
        
        return (str.match(ending + "$") == ending);
    }
    
    function startsWith(str, prefix) {
        
        return (str.match("^" + prefix)==prefix);
    }
    
    function equalsIgnoreCase(str1, str2) {

        return (str1.toLowerCase() == str2.toLowerCase());
    }

    // makeClass - By John Resig (MIT Licensed)

    function makeClass() {

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
    

    // ////////////////////////////////////////////////////////////
    // RiLexicon
    // ////////////////////////////////////////////////////////////
    
    var RiLexicon = makeClass();

    RiLexicon.FEATURE_DELIM = ':';
    
    RiLexicon.STRESSED = '1'; 
    
    RiLexicon.UNSTRESSED = '0';
    
    RiLexicon.PHONEME_BOUNDARY = '-'; 
    
    RiLexicon.WORD_BOUNDARY = " "; 
    
    RiLexicon.SYLLABLE_BOUNDARY = "/"; 
    
    RiLexicon.SENTENCE_BOUNDARY = "|";
    
    RiLexicon.prototype = {

        DATA_DELIM : '|', VOWELS : "aeiou",

        __init__ : function() { /* do nothing */ }.expects(),
     
        /**
         * Adds a word to the current lexicon (not permanent)
         * 
         * Example:  lexicon.addWord('abandon','ax-b ae1-n-d ax-n','vb nn vbp');
         * 
         * @param string - word
         * @param string - pronunciation data
         * @param string - pos data
         * 
         * @return object - this RiLexicon  
         */
        addWord : function(word, pronunciationData, posData) {
            
            error("Implement me!");
            
        }.expects([S,S,S]).returns(O),
        
        /**
         * Removes a word from the current lexicon (not permanent)
         * 
         * Example:  removeWord('abandon');
         * 
         * @param string - word
         * @return object - this RiLexicon  
         */
        removeWord : function(word) {
            
            error("Implement me!");
            
        }.expects([S]).returns(O),
        
        /**
         * Compares the characters of the input string 
         * (using a version of the min-edit distance algorithm)
         * to each word in the lexicon, returning the set of closest matches.        
         * 
         * @param string - word
         * @param int - minimum edit distance for matches (optional)
         * @param boolean - whether to return only words that match the length of the input word (optional)
         * @return array - matching words 
         */
        similarByLetter : function(word, minEditDist, preserveLength) { // take options arg instead?
            
            error("Implement me!");
            
        }.expects([S],[S,N],[S,N,B]).returns(A),
        
        /**
         * Compares the phonemes of the input string 
         * (using a version of the min-edit distance algorithm)
         * to each word in the lexicon, returning the set of closest matches.        
         * 
         * @param string - word
         * @param int - minimum edit distance for matches (optional)
         * @return array - matching words 
         */
        similarBySound: function(word, minEditDist) { // take options arg instead?
            
            error("Implement me!");
            
        }.expects([S],[S,N]).returns(A),
        
        /**
         * Returns all valid substrings of the input word in the lexicon 
         *
         * @param string - word
         * @return array - matching words 
         */
        substrings: function(word) { 
            
            error("Implement me!");
            
        }.expects([S]).returns(A),
        
        /**
         * Returns all valid superstrings of the input word in the lexicon 
         *
         * @param string - word
         * @return array - matching words 
         */
        superstrings: function(word) { 
            
            error("Implement me!");
            
        }.expects([S]).returns(A),
        
        /**
         * First calls similarBySound(), then filters the result set by the algorithm 
         * used in similarByLetter(); (useful when similarBySound() returns too large a result set)
         * @param string - word
         * @param int - minimum edit distance for both matches (optional)
         * @return array - matching words 
         */
        similarBySoundAndLetter: function(word, minEditDist) { // take options arg instead?
            
            error("Implement me!");
            
        }.expects([S],[S,N]).returns(A),
        
        /**
         * Returns an array of all words in the lexicon
         * @param boolean - first randomizes the order (default=true)
         * @return array - words in the RiLexicon  
         */
        getWords : function(inRandomOrder) {
            
            error("Implement me!");
            
        }.expects([],[S]).returns(A),
        
        isVowel : function(p) {

            if (!strOk(p)) return false; // what about 'y'?
            return RiLexicon.VOWELS.indexOf(p.substring(0, 1)) != -1;
            
        }.expects([S]).returns(B),

        isConsonant : function(p) {

            if (!strOk(p)) return false;
            return !this.isVowel(p);
            
        }.expects([S]).returns(B),

        // was called 'contains'
        containsWord : function(word) {

            if (!strOk(word)) return false;
            return (!isNull(RiTa_DICTIONARY[word]));
            
        }.expects([S]).returns(B),

        isRhyme : function(word1, word2) {

            if (!strOk(word1) || !strOk(word2)|| equalsIgnoreCase(word1, word2))
                return false;
            
            var p1 = this.lastStressedPhoneToEnd(word1);
            var p2 = this.lastStressedPhoneToEnd(word2);
            
            return (strOk(p1) && strOk(p2) && p1 === p2);
            
        }.expects([S,S]).returns(B),

        getRhymes : function(word) {

            this.__buildWordlist__();

            if (this.containsWord(word)) {

                var p = this.lastStressedPhoneToEnd(word);
                var entry, entryPhones, results = [];

                for (entry in RiTa_DICTIONARY) {
                    if (entry === word)
                        continue;
                    entryPhones = this.getRawPhones(entry);

                    if (strOk(entryPhones) && endsWith(entryPhones, p)) {
                        results.push(entry);
                    }
                }
                return (results.length > 0) ? results : []; // return null?
            }
            
            return []; // return null?
            
        }.expects([S]).returns(A),

        getAlliterations : function(word) {

            if (this.containsWord(word)) {

                var c2, entry, results = [];
                var c1 = this.firstConsonant(this.firstStressedSyllable(word));

                for (entry in RiTa_DICTIONARY) {
                    c2 = this.firstConsonant(this.firstStressedSyllable(entry));
                    if (c2 !== null && (c1 === c2)) {
                        results.push(entry);
                    }
                }
                return (results.length > 0) ? results : []; // return null?
            }
            return []; // return null?
        }.expects([S]).returns(A),

        isAlliteration : function(word1, word2) {

            if (!strOk(word1) || !strOk(word2))
                return false;

            if (equalsIgnoreCase(word1, word2))
                return true;

            var c1 = this.firstConsonant(this.firstStressedSyllable(word1));
            var c2 = this.firstConsonant(this.firstStressedSyllable(word2));

            return (strOk(c1) && strOk(c2) && c1 === c2);
            
        }.expects([S,S]).returns(B),

        firstStressedSyllable : function(word) {

            var raw = this.getRawPhones(word);
            var idx = -1, c, firstToEnd, result;

            if (!strOk(raw)) return E; // return null?
            idx = raw.indexOf(RiLexicon.STRESSED);

            if (idx < 0) return E; // no stresses... return null?
            
            c = raw.charAt(--idx);

            while (c != ' ') {
                if (--idx < 0) {
                    // single-stressed syllable
                    idx = 0;
                    break;
                }
                c = raw.charAt(idx);
            }
            firstToEnd = idx === 0 ? raw : trim(raw.substring(idx));
            idx = firstToEnd.indexOf(' ');

            return idx < 0 ? firstToEnd : firstToEnd.substring(0, idx);
            
        }.expects([S]).returns(S),

        getSyllables : function(word) {

            if (!strOk(word))
                return E; // return null?
            
        	var wordArr = RiTa.tokenize(trim(word));
            var phones, i;
            var raw = [];
            for (i=0; i< wordArr.length; i++){
            	raw[i] = this.getRawPhones(wordArr[i]);
            	raw[i] = raw[i].replace(/ /g, "/");
        	}
        	var joinedRaw = joinWords(raw);
        	
            joinedRaw = joinedRaw.replace(/1/g, "");
            phones = joinedRaw.split(" ");
            return trim(joinedRaw);
            //return phones.join(this.FEATURE_DELIM);
            
        }.expects([S]).returns(S),

        getPhonemes : function(word) {

          /*  var phones, i;
            var raw = this.getRawPhones(word);

            if (!strOk(raw))
                return null; // return null?
            raw = raw.replace(/-/g, " ").replace(/1/g, "");
            phones = raw.split(" ");

            return phones.join(this.FEATURE_DELIM);
          */
        	
        	if (!strOk(word))
                return E; // return null?
        	   
        	var wordArr = RiTa.tokenize(trim(word));
            var raw = [];
            
            for (var i=0; i< wordArr.length; i++){
            	if (RiTa.isPunctuation(wordArr[i])) continue; 
            		// raw[i] = wordArr[i].length
            	raw[i] = this.getRawPhones(wordArr[i]);
            	if (!raw[i].length)
            		throw Error("Unable to lookup (need LTSEngine): "+wordArr[i]);
            	raw[i] = raw[i].replace(/ /g, "-");
        	}
            
        	var joinedRaw = trim(joinWords(raw));
            joinedRaw = joinedRaw.replace(/1/g, "");
            return joinedRaw;  
            
        }.expects([S]).returns(S),

        getStresses : function(word) {
        	
            if (!strOk(word))
                return E; // return null?
        	
        	var wordArr = RiTa.tokenize(trim(word));
        	
            var stresses = [], phones, i;
            
            var raw = [];
            for (i=0; i< wordArr.length; i++){
            	if (RiTa.isPunctuation(wordArr[i])) continue; 
            	raw[i] = this.getRawPhones(wordArr[i]);
        	}

            for (i = 0; i < raw.length; i++) {
      
        		if (raw[i]){ // ignore undefined array items (eg Punctuation)
            	var phones = raw[i].split(SP);
            	for (j = 0; j < phones.length; j++) {

            		var isStress = (phones[j].indexOf(RiLexicon.STRESSED) > -1) ? RiLexicon.STRESSED : RiLexicon.UNSTRESSED;
					if (j > 0) isStress = "/" + isStress;

            		stresses.push(isStress);          	
            	}
        		}
            }
            var sr = stresses.join(" ");
            return  sr.replace(/ \//g, "/");//stresses.join(this.FEATURE_DELIM);

        }.expects([S]).returns(S),
        
        /**
         * Returns the raw dictionary data used to create the default lexicon
         * @return object - dictionary mapping words to their pronunciation/pos data
         */
        getLexicalData : function() {
            
            return RiTa_DICTIONARY;
            
        }.expects().returns(O),
        
        /**
         * Allows one to set the raw dictionary data used to create the default lexicon.
         * See RiLexicon.addWord() for data format
         * @param object - dictionary mapping words to their pronunciation/pos data
         * @return object - this RiLexicon
         */
        setLexicalData : function(dictionaryDataObject) {
            
            RiTa_DICTIONARY = dictionaryDataObject;
            return this;
            
        }.expects([O]).returns(O),
        
        /**
         * Returns the raw dictionary entry for the given word (isn't necessary in typical usage) 
         * @param string the word
         * @return    a 2-element array of strings, the first is the stress and syllable data, the 2nd is the pos data
         * or [] if not found
         */
        lookupRaw : function(word) { // PRIVATE???

            //if (!strOk(word)) return undefined;
            
            word = word.toLowerCase();

            this.__buildWordlist__();

            if (!isNull(RiTa_DICTIONARY[word])) {
                return RiTa_DICTIONARY[word];
            }
            else {
                warn("No lexicon entry for '" + word + "'");
                return []; // return null?
            }
            
        }.expects([S]).returns(A),

        getRawPhones : function(word) {
            
            var data = this.lookupRaw(word);
            return (data && data.length==2) ? data[0] : E; // TODO: verify 
            
        }.expects([S]).returns(S),

        getPosData : function(word) {
            
            var data = this.lookupRaw(word);
            return (data && data.length==2) ? data[1] : E; // TODO: verify
            
        }.expects([S]).returns(S),

        getPosArr : function(word) { // SHOULD BE PRIVATE
            
            var pl = this.getPosData(word);
            
            if (!strOk(pl)) return []; // TODO: verify 
            
            return pl.split(SP);
            
        }.expects([S]).returns(A),

        firstConsonant : function(rawPhones) {

            if (!strOk(rawPhones)) return E; // return null?
            
            var phones = rawPhones.split(RiLexicon.PHONEME_BOUNDARY);
            // var phones = rawPhones.split(PHONEME_BOUNDARY);
            if (!isNull(phones)) {
                for (j = 0; j < phones.length; j++) {
                    if (this.isConsonant(phones[j]))
                        return phones[j];
                }
            }
            return E; // return null?
            
        }.expects([S]).returns(S),

        lastStressedPhoneToEnd : function(word) {

            if (!strOk(word)) return E; // return null?
            
            var idx, c, result;
            var raw = this.getRawPhones(word);

            if (!strOk(raw)) return E; // return null?
            
            idx = raw.lastIndexOf(RiLexicon.STRESSED);
            
            if (idx < 0) return E; // return null?
            
            c = raw.charAt(--idx);
            while (c != '-' && c != ' ') {
                if (--idx < 0) {
                    return raw; // single-stressed syllable
                }
                c = raw.charAt(idx);
            }
            result = raw.substring(idx + 1);
            
            return result;
            
        }.expects([S]).returns(S),

        // TODO: Re-implement
        getRandomWord : function(pos, syllableCount) {  // should take pos, syllableCount, neither, or both 
            /*
             * var word, found = false, t; if(pos) { pos = trim(pos.toLowerCase()); for(t in
             * RiLexicon.TAGS){ if (t[0].toLowerCase === pos) { found = true; } } if(!found) { throw
             * "RiTa RiLexicon.getRandomWord: POS '" + pos + "' not valid!"; } } if(pos)
             */
            this.__buildWordlist__();
            return RiLexicon.wordlist[Math.floor(Math.random() * RiLexicon.wordlist.length)];
            
        }.expects([S],[],[N],[S,N]).returns(S),
 
        // TODO: this should be to be automatic?
        __buildWordlist__ : function() {

            if (!RiLexicon.wordlist) {

                if (!isNull(RiTa_DICTIONARY)) 
                {
                    var msElapsed = Date.now();
                    RiLexicon.wordlist = [];
                    for ( var w in RiTa_DICTIONARY)
                        RiLexicon.wordlist.push(w);
                    log("Loaded lexicon(#" + RiLexicon.wordlist.length + ") in "
                            + (Date.now() - msElapsed) + " ms");
                } 
                else {

                    error("RiTa dictionary not found! Make sure to add it to your .html file"
                            + ", e.g.,\n    <script type=\"text/javascript\" src=\"rita_dict.js\"></script>");

                }
            }

        }
    };
    
    // ////////////////////////////////////////////////////////////
    // Analyzer  (private)
    // ////////////////////////////////////////////////////////////    
        
    var Analyzer = makeClass();
    
    Analyzer.prototype = {

        __init__ : function(id) {
            this.id = id;
        },

        analyze : function(input) {
            error("implement me!");
        }
    };
    
    // ////////////////////////////////////////////////////////////
    // Conjugator  (private)
    // ////////////////////////////////////////////////////////////
    
    
    var Conjugator = makeClass();
    
    Conjugator.prototype = {

        __init__ : function() {
            
            // TODO: get rid of these and make static method ?
            
            this.perfect = this.progressive = this.passive = this.interrogative = false;
            this.tense = RiTa.PRESENT_TENSE;
            this.person = RiTa.FIRST_PERSON;
            this.number = RiTa.SINGULAR;
            this.form = RiTa.NORMAL;
            this.head = "";

        },

        // Conjugates the verb based on the current state of the conjugator.
        // !@# Removed (did not translate) incomplete/non-working java
        // implementation of modals handling.
        // !@# TODO: add handling of past tense modals.
        conjugate : function(verb, args) {

            if (!strOk(verb))
                return E;

            var actualModal = null,
            // Compute modal -- this affects tense
            conjs = [], frontVG = verb, verbForm;

            // ------------------ handle arguments ------------------
            if (args.number) {
                this.number = args.number;
            }
            if (args.person) {
                this.person = args.person;
            }
            if (args.tense) {
                this.tense = args.tense;
            }
            if (args.form) {
                this.form = args.form;
            }
            if (args.passive) {
                this.person = args.passive;
            }
            if (args.progressive) {
                this.progressive = args.progressive;
            }
            if (args.perfect) {
                this.perfect = args.perfect;
            }

            // ----------------------- start ---------------------------
            if (this.form == RiTa.INFINITIVE) {
                actualModal = "to";
            }

            if (this.tense == RiTa.FUTURE_TENSE) {
                actualModal = "will";
            }

            if (this.passive) {
                this.conjs.push(this.getPastParticiple(this.frontVG));
                this.frontVG = "be"; // Conjugate this ?
            }

            if (this.progressive) {
                conjs.push(this.getPresentParticiple(frontVG));
                frontVG = "be"; // Conjugate this ?
            }

            if (this.perfect) {
                conjs.push(this.getPastParticiple(frontVG));
                frontVG = "have";
            }

            if (actualModal) {
                // log("push: "+frontVG);
                conjs.push(frontVG);
                frontVG = null;
            }

            // Now inflect frontVG (if it exists) and push it on restVG
            if (frontVG) {

                if (this.form === RiTa.GERUND) { // gerund - use ING form
                    var pp = this.getPresentParticiple(frontVG);

                    // !@# not yet implemented! ??? WHAT?
                    conjs.push(pp);
                } else if (this.interrogative && !(verb == "be") && conjs.length < 1) {

                    conjs.push(frontVG);
                } else {

                    verbForm = this.getVerbForm(frontVG, this.tense, this.person, this.number);
                    conjs.push(verbForm);
                }
            }

            // add modal, and we're done
            if (actualModal) {
                // log("push: "+actualModal);
                conjs.push(actualModal);
            }

            var s = E;
            for ( var i = 0; i < conjs.length; i++) {
                s = conjs[i] + " " + s;
            }

            // !@# test this
            if (endsWith(s, "peted"))
                error("Unexpected output: " + this.toString());

            return trim(s);
        },

        checkRules : function(ruleSet, verb) {

            if (isNull(ruleSet))
                error("no ruleset");

            var name = ruleSet.name;
            var rules = ruleSet.rules;
            var defaultRule = ruleSet.defaultRule || null;

            if (inArray(MODALS, verb)) {

                // log("checkRules1("+name+").returns: "+got);
                return verb;
            }

            for ( var i = 0; i < rules.length; i++) {

                // log("checkRules2("+name+").fire("+i+")="+rules[i].regex);
                if (rules[i].applies(verb)) {

                    var got = rules[i].fire(verb);

                    // log("HIT("+name+").fire("+i+")="+rules[i].regex+"
                    // _returns: "+got);
                    return got;
                }
            }

            if (ruleSet.doubling || inArray(VERB_CONS_DOUBLING, verb)) {
                verb = this.doubleFinalConsonant(verb);
            }

            var res = defaultRule.fire(verb);

            // log("checkRules3("+name+").returns: "+res);
            return res;
        },

        doubleFinalConsonant : function(word) {
            var letter = word.charAt(word.length - 1);
            return word + letter;
        },

        getPast : function(verb, pers, numb) {

            if (verb.toLowerCase() == "be") {

                switch (numb) {

                case RiTa.SINGULAR:

                    switch (pers) {

                    case RiTa.FIRST_PERSON:
                        break;

                    case RiTa.THIRD_PERSON:
                        return "was";

                    case RiTa.SECOND_PERSON:
                        return "were";

                    }
                    break;

                case RiTa.PLURAL:

                    return "were";
                }
            }

            var got = this.checkRules(PAST_TENSE_RULESET, verb);

            //log("getPast(" + verb + ").returns: " + got);

            return got;
        },

        getPresent : function(verb, person, number) {

            // Defaults if unset
            person = (isNull(person)) ? this.person : person;
            number = (isNull(number)) ? this.number : number;

            if ((person == RiTa.THIRD_PERSON) && (number == RiTa.SINGULAR)) {

                return this.checkRules(PRESENT_TENSE_RULESET, verb);
            } else if (verb == "be") {

                if (number == RiTa.SINGULAR) {

                    switch (person) {

                    case RiTa.FIRST_PERSON:
                        return "am";

                    case RiTa.SECOND_PERSON:
                        return "are";

                    case RiTa.THIRD_PERSON:
                        return "is";

                        // default: ???
                    }

                } else {
                    return "are";
                }
            }
            return verb;
        },

        getPresentParticiple : function(verb) {
            var ppr = PRESENT_PARTICIPLE_RULESET;
            return this.checkRules(ppr, verb);
        },

        getPastParticiple : function(verb) {
            return this.checkRules(PAST_PARTICIPLE_RULESET, verb);
        },

        getVerbForm : function(verb, tense, person, number) {

            switch (tense) {

            case RiTa.PRESENT_TENSE:
                return this.getPresent(verb, person, number);

            case RiTa.PAST_TENSE:
                return this.getPast(verb, person, number);

            default:
                return verb;
            }
        },

        // Returns a String representing the current person from one of
        // (first, second, third)
        getPerson : function() {
            return CONJUGATION_NAMES[this.person];
        },

        // Returns a String representing the current number from one of
        // (singular, plural)
        getNumber : function() {
            return CONJUGATION_NAMES[this.number];
        },

        // Returns a String representing the current tense from one of
        // (past, present, future)
        getTense : function() {
            return CONJUGATION_NAMES[this.tense];
        },

        // Returns the current verb
        getVerb : function() {
            return this.head;
        },

        // Returns whether the conjugation will use passive tense
        isPassive : function() {
            return this.passive;
        },
        // Returns whether the conjugation will use perfect tense
        isPerfect : function() {
            return this.perfect;
        },
        // Returns whether the conjugation will use progressive tense
        isProgressive : function() {
            return this.progressive;
        },

        // Sets the person for the conjugation, from one of the
        // constants: [RiTa.FIRST_PERSON, RiTa.SECOND_PERSON, RiTa.THIRD_PERSON]
        setPerson : function(personConstant) {
            this.person = personConstant;
        },

        // Sets the number for the conjugation, from one of the
        // constants: [RiTa.SINGULAR, RiTa.PLURAL]
        setNumber : function(numberConstant) {
            this.number = numberConstant;
        },

        // Sets the tense for the conjugation, from one of the
        // constants: [RiTa.PAST_TENSE, RiTa.PRESENT_TENSE, RiTa.FUTURE_TENSE]
        setTense : function(tenseConstant) {
            this.tense = tenseConstant;
        },

        // Sets the verb to be conjugated
        setVerb : function(verb) {
            var v = this.head = verb.toLowerCase();
            if (v === "am" || v === "are" || v === "is" || v === "was" || v === "were") {
                this.head = "be";
            }
        },

        // Sets whether the conjugation should use passive tense
        setPassive : function(bool) {
            this.passive = bool;
        },

        // Sets whether the conjugation should use perfect tense
        setPerfect : function(bool) {
            this.perfect = bool;
        },

        // Sets whether the conjugation should use progressive tense
        setProgressive : function(bool) {
            this.progressive = bool;
        },

        // A human-readable representation of state for logging
        toString : function() {
            return "  ---------------------\n" + "  Passive = " + this.isPassive() + "\n"
                    + "  Perfect = " + this.isPerfect() + "\n" + "  Progressive = "
                    + this.isProgressive() + "\n" + "  ---------------------\n" + "  Number = "
                    + this.getNumber() + "\n" + "  Person = " + this.getPerson() + "\n"
                    + "  Tense = " + this.getTense() + "\n" + "  ---------------------\n";
        },

        // Returns all possible conjugations of the specified verb
        // (contains duplicates) (TODO: remove? not sure about this one)
        conjugateAll : function(verb) {

            var results = [], i, j, k, l, m, n;

            this.setVerb(verb);

            for (i = 0; i < TENSES.length; i++) {
                this.setTense(TENSES[i]);
                for (j = 0; j < NUMBERS.length; j++) {
                    this.setNumber(NUMBERS[j]);
                    for (k = 0; k < PERSONS.length; k++) {
                        this.setPerson(PERSONS[k]);
                        for (l = 0; l < 2; l++) {
                            this.setPassive(l == 0 ? true : false);
                            for (m = 0; m < 2; m++) {
                                this.setProgressive(m == 0 ? true : false);
                                for (n = 0; n < 2; n++) {
                                    this.setPerfect(n == 0 ? true : false);
                                    results.push(this.conjugate(verb));
                                }
                            }
                        }
                    }
                }
            }
            // log("all="+results.length);
            return results;
        }
    };

    // ////////////////////////////////////////////////////////////
    // PosTagger  (singleton)
    // ////////////////////////////////////////////////////////////
    
    var PosTagger = {

        // Penn Pos types ------------------------------
        UNKNOWN : [ "???", "UNKNOWN" ],
        N : [ "N", "NOUN_KEY" ],
        V : [ "V", "VERB_KEY" ],
        R : [ "R", "ADVERB_KEY" ],
        A : [ "A", "ADJECTIVE_KEY" ],
        CC : [ "CC", "Coordinating conjunction" ],
        CD : [ "CD", "Cardinal number" ],
        DT : [ "DT", "Determiner" ],
        EX : [ "EX", "Existential there" ],
        FW : [ "FW", "Foreign word" ],
        IN : [ "IN", "Preposition or subordinating conjunction" ],
        JJ : [ "JJ", "Adjective" ],
        JJR : [ "JJR", "Adjective, comparative" ],
        JJS : [ "JJS", "Adjective, superlative" ],
        LS : [ "LS", "List item marker" ],
        MD : [ "MD", "Modal" ],
        NN : [ "NN", "Noun, singular or mass" ],
        NNS : [ "NNS", "Noun, plural" ],
        NNP : [ "NNP", "Proper noun, singular" ],
        NNPS : [ "NNPS", "Proper noun, plural" ],
        PDT : [ "PDT", "Predeterminer" ],
        POS : [ "POS", "Possessive ending" ],
        PRP : [ "PRP", "Personal pronoun" ],
        PRP$ : [ "PRP$", "Possessive pronoun (prolog version PRP-S)" ],
        RB : [ "RB", "Adverb" ],
        RBR : [ "RBR", "Adverb, comparative" ],
        RBS : [ "RBS", "Adverb, superlative" ],
        RP : [ "RP", "Particle" ],
        SYM : [ "SYM", "Symbol" ],
        TO : [ "TO", "to" ],
        UH : [ "UH", "Interjection" ],
        VB : [ "VB", "Verb, base form" ],
        VBD : [ "VBD", "Verb, past tense" ],
        VBG : [ "VBG", "Verb, gerund or present participle" ],
        VBN : [ "VBN", "Verb, past participle" ],
        VBP : [ "VBP", "Verb, non-3rd person singular present" ],
        VBZ : [ "VBZ", "Verb, 3rd person singular present" ],
        WDT : [ "WDT", "Wh-determiner" ],
        WP : [ "WP", "Wh-pronoun" ],
        WP$ : [ "WP$", "Possessive wh-pronoun (prolog version WP-S)" ],
        WRB : [ "WRB", "Wh-adverb" ],

        TAGS : [ this.CC, this.CD, this.DT, this.EX, this.FW, this.IN, this.JJ, this.JJR, this.JJS,
                this.LS, this.MD, this.NN, this.NNS, this.NNP, this.NNPS, this.PDT, this.POS,
                this.PRP, this.PRP$, this.RB, this.RBR, this.RBS, this.RP, this.SYM, this.TO,
                this.UH, this.VB, this.VBD, this.VBG, this.VBN, this.VBP, this.VBZ, this.WDT,
                this.WP, this.WP$, this.WRB, this.UNKNOWN ],
        NOUNS : [ "NN", "NNS", "NNP", "NNPS" ],
        VERBS : [ "VB", "VBD", "VBG", "VBN", "VBP", "VBZ" ],
        ADJ : [ "JJ", "JJR", "JJS" ],
        ADV : [ "RB", "RBR", "RBS", "RP" ],
        //NOUNS : [ this.NN, this.NNS, this.NNP, this.NNPS ],
        //VERBS : [ this.VB, this.VBD, this.VBG, this.VBN, this.VBP, this.VBZ ],
        //ADJ : [ this.JJ, this.JJR, this.JJS ],
        //ADV : [ this.RB, this.RBR, this.RBS, this.RP ],
        
        isVerb : function(tag) {
            //return inArray(this.VERBS, tag);
            return inArray(this.VERBS, tag.toUpperCase());
        },

        isNoun : function(tag) {
            //return inArray(this.NOUNS, tag);
            return inArray(this.NOUNS, tag.toUpperCase());
        },

        isAdverb : function(tag) {
            //return inArray(this.ADV, tag);
            return inArray(this.ADV, tag.toUpperCase());
        },

        isAdj : function(tag) {
            //return inArray(this.ADJ, tag);
            return inArray(this.ADJ, tag.toUpperCase());
        },

        isTag : function(tag) {
            return inArray(this.TAGS, tag);
        },

        hasTag : function(choices, tag) {
            var choiceStr = choices.join();
            return (choiceStr.indexOf(tag) > -1);
        },

        // TODO: MOVE TO RiLexicon.getInstance();
        __getLexicon__ : function() {

            var lexicon;
            
            try {
                lexicon = new RiLexicon();
            }
            catch(e) {
                error("No RiTa lexicon found! Have you included 'rita_dict.js'?");
            }
            
            this.__getLexicon__ = function() {
                return lexicon;
            };
            return lexicon;
        },
        
        /**
         * Returns an array of parts-of-speech from the Penn tagset, 
         * each corresponding to one word of input
         */
        tag : function(words) {

            var result = [], choices = [];

            if (!(words instanceof Array)) { // << !@# test this
                words = [ words ];
                //log("RiPosTagger: NOT ARRAY");
            }
            
            //log("PosTagger.tag("+words+")");

            var lex = this.__getLexicon__();
            //log("PosTagger.lex="+lex+")");

            for (var i = 0, l = words.length; i < l; i++) {
                
                var word = words[i];
                
                var data = lex.getPosArr(word);

                if (isNull(data) || data.length == 0) {
                    
                    if (word.length == 1) {
                        result[i] = isNum(word.charAt(0)) ? "cd" : word;
                    } else {
                        result[i] = "nn";
                    }
                    choices[i] = null;  // TODO: OK?
                } 
                else {
                    result[i] = data[0];
                    choices[i] = data;
                }
            }

            // Adjust pos according to transformation rules
            return this.__applyContext__(words, result, choices);
            
        }.expects([A],[S]).returns(A),

        
        // Applies a customized subset of the Brill transformations
        __applyContext__ : function(words, result, choices) {
            
            //log("__applyContext__("+words+","+result+","+choices+")");

            // Shortcuts for brevity/readability
            var sW = startsWith, eW = endsWith, PRINT_CUSTOM_TAGS = true, PRINT = PRINT_CUSTOM_TAGS;

            // Apply transformations
            for (var i = 0, l = words.length; i < l; i++) {

                var firstLetter = words[i].charAt(0);

                // transform 1: DT, {VBD | VBP | VB} --> DT, NN
                if (i > 0 && (result[i - 1] == "dt")) {
                    if (sW(result[i], "vb")) {
                        if (PRINT) {
                            log("BrillPosTagger: changing verb to noun: " + words[i]);
                        }
                        result[i] = "nn";
                    }

                    // transform 1: DT, {RB | RBR | RBS} --> DT, {JJ |
                    // JJR | JJS}
                    else if (sW(result[i], "rb")) {
                        if (PRINT) {
                            log("BrillPosTagger:  custom tagged '" + words[i] + "', "
                                    + result[i]);
                        }
                        result[i] = (result[i].length > 2) ? "jj" + result[i].charAt(2) : "jj";
                        if (PRINT) {
                            log(" -> " + result[i]);
                        }
                    }
                }

                // transform 2: convert a noun to a number (cd) if it is
                // all digits and/or a decimal "."
                if (sW(result[i], "n") && choices[i] == null) {
                    if (isNum(words[i])) {
                        result[i] = "cd";
                    } // mods: dch (add choice check above) <---- ? >
                }

                // transform 3: convert a noun to a past participle if
                // words[i] ends with "ed"
                if (sW(result[i], "n") && eW(words[i], "ed")) {
                    result[i] = "vbn";
                }

                // transform 4: convert any type to adverb if it ends in
                // "ly";
                if (eW(words[i], "ly")) {
                    result[i] = "rb";
                }

                // transform 5: convert a common noun (NN or NNS) to a
                // adjective if it ends with "al"
                if (sW(result[i], "nn") && eW(words[i], "al")) {
                    result[i] = "jj";
                }

                // transform 6: convert a noun to a verb if the
                // preceeding word is "would"
                if (i > 0 && sW(result[i], "nn") && equalsIgnoreCase(words[i - 1], "would")) {
                    result[i] = "vb";
                }

                // transform 7: if a word has been categorized as a
                // common noun and it ends
                // with "s", then set its type to plural common noun
                // (NNS)
                if ((result[i] == "nn") && eW(words[i], "s")) {
                    result[i] = "nns";
                }

                // transform 8: convert a common noun to a present
                // participle verb (i.e., a gerund)
                if (sW(result[i], "nn") && eW(words[i], "ing")) {
                    // fix here -- add check on choices for any verb: eg
                    // 'morning'
                    if (this.hasTag(choices[i], "vb")) {
                        result[i] = "vbg";
                    } else if (PRINT) {
                        log("[INFO] BrillPosTagger tagged '" + words[i] + "' as " + result[i]);
                    }
                }

                // transform 9(dch): convert common nouns to proper
                // nouns when they start w' a capital and are not a
                // sentence start
                if (i > 0 && sW(result[i], "nn") && words[i].length > 1
                        && (firstLetter == firstLetter.toUpperCase())) {
                    result[i] = eW(result[i], "s") ? "nnps" : "nnp";
                }

                // transform 10(dch): convert plural nouns (which are
                // also 3sg-verbs) to 3sg-verbs when followed by adverb
                // (jumps, dances)
                if (i < result.length - 1 && result[i] == "nns" && sW(result[i + 1], "rb")
                        && this.hasTag(choices[i], "vbz")) {
                    result[i] = "vbz";
                }
            }
         
            return result;
            
        }.returns(A)

    };// end PosTagger
    
   
    // ////////////////////////////////////////////////////////////
    // RiString
    // ////////////////////////////////////////////////////////////
    
    var RiString = makeClass();

    RiString.prototype = {
            
        /**
         * The RiString constructor function
         * 
         * @param string the text it will contain
         */
        __init__ : function(text) {
            
            this.text = text;
            
        }.expects([S]),

        /**
         * Tests if this string ends with the specified suffix.
         * 
         * @param string the suffix.
         * @return boolean true if the character sequence represented by the argument is a suffix of
         *         the character sequence represented by this object; false otherwise. Note that the
         *         result will be true if the argument is the empty string or is equal to this
         *         RiString object as determined by the equals(Object) method.
         * 
         */
        endsWith : function(substr) {
            
            return endsWith(this.text, substr);
            
        }.expects([S]).returns(B),
             
        /**
         * Compares this RiString to the specified object. The result is true if and only if the
         * argument is not null and is a RiString object that represents the same sequence of
         * characters as this object.
         * 
         * @param RiString object to compare this RiString against.
         * @return boolean true if the RiString are equal; false otherwise.
         */
        equals : function(riString) {
            
            return riString.text === this.text;
            
        }.expects([O]).returns(B),

        /**
         * Compares this RiString to another RiString, ignoring case considerations.
         * 
         * @param string or RiString object to compare this RiString against
         * @return boolean true if the argument is not null and the Strings are equal, ignoring
         *         case; false otherwise.
         */
        equalsIgnoreCase : function(str) {
            
            if (typeof str === 'string'){
                return str.toLowerCase() === this.text.toLowerCase();
            } 
            else
            { 
                return str.getText().toLowerCase() === this.text.toLowerCase();
            }
        }.expects([S],[O]).returns(B),

        /**
         * Sets the text contained by this object
         * 
         * @param string the text
         * @return this RiString
         */
        setText : function(text) {
            
            this.text = text;
            return this;
            
        }.expects([S]).returns(O),

        /**
         * Returns an array of part-of-speech tags, one per word, using RiTa.tokenize() and RiTa.posTag().
         *
         * @return array of (pos) strings, one per word
         */
        getPos : function() {
                   
            var words = RiTa.tokenize(trim(this.text)); // was getPlaintext()
            var tags = PosTagger.tag(words); 
  
            for ( var i = 0, l = tags.length; i < l; i++) {
                if (!strOk(tags[i])) 
                    error("RiString: can't parse pos for:" + words[i]);
            }
        
            return tags;
            
        }.expects().returns(A),

        /**
         * Returns the part-of-speech tag for the word at 'index', using RiTa.tokenize() and RiTa.posTag().
         * 
         * @param int the word index
         * @return string the pos
         */
        getPosAt : function(index) {
            
            var tags = this.getPos();

            if (isNull(tags) || tags.length == 0 || index < 0 || index >= tags.length)
                return E;
            
            return tags[index];
            
        }.expects([N]).returns(S),

        /**
         * Returns the string contained by this RiString
         * 
         * @return string the text
         */
        getText : function() {
            
            return this.text;
            
        }.expects().returns(S),

        /**
         * Returns the word at 'index', according to RiTa.tokenize()
         * 
         * @param int the word index
         * @return string the word
         */
        getWordAt : function(index) {
            
            var words = RiTa.tokenize(trim(this.text));
            if (index < 0 || index >= words.length)
                return E;
            return words[index];
            
        }.expects([N]).returns(S),

        /**
         * Returns the number of words in the object, according to RiTa.tokenize().
         * 
         * @return int number of words
         */
        getWordCount : function() {
            
            return this.getWords().length;
            
        }.expects().returns(N),

        /**
         * Returns the array of words in the object, via a call to RiTa.tokenize().
         * 
         * @return array of strings, one per word
         */
        getWords : function() {
            
            return RiTa.tokenize(this.text);
            
        }.expects().returns(A),

        /**
         * Returns the index within this string of the first occurrence of the specified character.
         * 
         * @param string (Required) or character to search for
         * @param int (Optional) The start position in the string to start the search. If omitted,
         *        the search starts from position 0
         * @return int the first index of the matching pattern or -1 if none are found
         */
        indexOf : function(searchstring, start) {
            
            return this.text.indexOf(searchstring, start);
            
        }.expects([S],[S,N]).returns(N),

        /**
         * Inserts 'newWord' at 'wordIdx' and shifts each subsequent word accordingly.
         *
         * @return this RiString
         */
        insertWordAt : function(newWord, wordIdx) {
                    
            var words = this.getWords();
            if (newWord && newWord.length && wordIdx >= 0 && wordIdx < words.length) {
             
                // filthy hack to preserve punctuation in 'newWord'
                words.splice(wordIdx,0, DeLiM+newWord+DeLiM);
                
                this.setText(joinWords(words)).replaceAll(DeLiM,E);
            }

            return this;
            
        }.expects([S,N]).returns(O),

        /**
         * Returns the index within this string of the last occurrence of the specified character.
         * 
         * @param string (Required) The string to search for
         * @param int (Optional) The start position in the string to start the search. If omitted,
         *        the search starts from position 0
         * @return int the last index of the matching pattern or -1 if none are found
         */
        lastIndexOf : function(searchstring, start) {
            
            return this.text.lastIndexOf(searchstring, start);
            
        }.expects([S],[S,N]).returns(N),

        /**
         * Returns the length of this string.
         * 
         * @return int the length
         */
        length : function() {
            
            return this.text.length;
            
        }.expects().returns(N),

        /**
         * Searches for a match between a substring (or regular expression) and the contained
         * string, and _returns the matches
         * 
         * @param String regex
         * @return array of string matches or empty array if none are found
         */
        match : function(substr) {
            
            return this.text.match(substr);
            
        }.expects([S]).returns(A),
        
        /**
         * Extracts a part of a string from this RiString
         * 
         * @param int (Required) The index where to begin the extraction. First character is at
         *        index 0
         * @param int (Optional) Where to end the extraction. If omitted, slice() selects all
         *        characters from the begin position to the end of the string
         * @return this RiString
         */
        slice : function(begin, end) {
            
            return this.setText(this.text.slice(begin, end));
             
        }.expects([N],[N,N]).returns(O),

        /**
         * Replaces each substring of this string that matches the given regular expression with the
         * given replacement.
         * 
         * @param string or RegExp object, the pattern to be matched
         * @param string the replacement sequence of char values
         * @return this RiString
         */
        replaceAll : function(pattern, replacement) {
            
            if (pattern && (replacement || replacement==='')) {
                this.text = replaceAll(this.text, pattern, replacement);
            }
            return this;
            
        }.expects([O,S],[S,S]).returns(O),

        /**
         * Replaces the character at 'idx' with 'replaceWith'. If the specified 'idx' is less than
         * xero, or beyond the length of the current text, there will be no effect.
         * 
         * @param int the character index
         * @param string the replacement
         * @return this RiString
         */
        replaceCharAt : function(idx, replaceWith) {
            
            if (idx < 0 || idx >= this.length()) 
                return this;
                
            var s = this.getText();
            var beg = s.substring(0, idx);
            var end = s.substring(idx + 1);
            var s2 = null;
            
            if (replaceWith)
                s2 = beg + replaceWith + end;
            else
                s2 = beg + end;

            return this.setText(s2);
            
        }.expects([N,S]).returns(O),

        /**
         * Replaces the first instance of 'regex' with 'replaceWith'
         * 
         * @param string or regex the pattern
         * @param string the replacement
         * 
         * @return this RiString
         */
        replaceFirst : function(regex, replaceWith) {
            
            if (!isNull(replaceWith)) 
                this.text = this.text.replace(regex,replaceWith);
            return this;
            
        }.expects([S,S]).returns(O),

        /**
         * Replaces the word at 'wordIdx' with 'newWord'.
         * 
         * @param int the index
         * @param string the word replacement
         * @return this RiString
         */
        replaceWordAt : function(wordIdx, newWord) {
            
            var words = this.getWords();
            
            if (/*newWord && */wordIdx >= 0 && wordIdx < words.length) {
                
                words[wordIdx] = newWord;
                
                this.setText(joinWords(words));
            }
            
            return this;
            
        }.expects([N,S]).returns(O),

        /**
         * Split a RiString into an array of sub-RiString and return the new array.
         * 
         * If an empty string ("") is used as the separator, the string is split between each character.
         * 
         * @param string (Optional) Specifies the character to use for splitting the string. If
         *        omitted, the entire string will be returned. If an empty string ("") is used as the separator, 
         *        the string is split between each character.
         *        
         * @param int (Optional) An integer that specifies the number of splits
         * 
         * @return array of RiStrings
         */
        split : function(separator, limit) {
            
            var parts = this.text.split(separator, limit);
            var rs = [];
            for ( var i = 0; i < parts.length; i++) {
                if (!isNull(parts[i]))
                    rs.push(new RiString(parts[i]));
            }
            return rs;
            
        }.expects([S],[S,N],[]).returns(A),

        /**
         * Tests if this string starts with the specified prefix.
         * 
         * @param (Required) string the prefix
         * @return boolean true if the character sequence represented by the argument is a prefix of
         *         the character sequence represented by this string; false otherwise. Note also
         *         that true will be returned if the argument is an empty string or is equal to this
         *         RiString object as determined by the equals() method.
         */
        startsWith : function(substr) {
            
            return this.indexOf(substr) == 0;
            
        }.expects([S]).returns(B),

        /**
         * Extracts the characters from this objects contained string, beginning at 'start' and
         * continuing through the specified number of characters, and sets the current text to be
         * that string. (from Javascript String)
         * 
         * @param int (required) The index where to start the extraction. First character is at
         *        index 0
         * @param int (optional) The index where to stop the extraction. If omitted, it extracts the
         *        rest of the string
         * @return this RiString
         */
        substr : function(start, length) {
            
            return this.setText(this.text.substr(start, length));
            
        }.expects([N],[N,N]).returns(O),

        /**
         * Extracts the characters from a string, between two specified indices, and sets the
         * current text to be that string. (from Java String)
         * 
         * @param int (required) The index where to start the extraction. First character is at
         *        index 0
         * @param int (optional) The index where to stop the extraction. If omitted, it extracts the
         *        rest of the string
         * @return this RiString
         */
        substring : function(from, to) {

            return this.setText(this.text.substring(from, to));
            
        }.expects([N],[N,N]).returns(O),

        /**
         * Converts this object to an array of RiString objects, one per character
         * 
         * @return an array of RiStrings with each letter as its own RiString element
         */
        toCharArray : function() {
            var parts = this.text.split(E);
            var rs = [];
            for ( var i = 0; i < parts.length; i++) {
                if (!isNull(parts[i]))
                    rs.push(parts[i]);
            }
            return rs;
        }.expects().returns(A),

        /**
         * Converts all of the characters in this RiString to lower case
         * 
         * @return this RiString
         */
        toLowerCase : function() {
            
            return this.setText(this.text.toLowerCase());
            
         }.expects().returns(O),

        /**
         * Returns the contained string object
         * 
         * @return string
         */
        toString : function() {
            
            return "RiString["+this.text+"]";
            
        }.expects().returns(S),

        /**
         * Returns true if and only if this string contains the specified sequence of char values.
         * 
         * @param string text to be checked
         * @return boolean
         */
        contains : function(string) {
            
            return this.indexOf(string) > -1;
            
        }.expects([S]).returns(B),

        /**
         * Converts all of the characters in this RiString to upper case
         * 
         * @return this RiString
         */
        toUpperCase : function() {
            
            return this.setText(this.text.toUpperCase());
            
        }.expects().returns(O),

        /**
         * Returns a copy of the string, with leading and trailing whitespace omitted.
         * 
         * @return this RiString
         */
        trim : function() {
            
            return this.setText(trim(this.text));
            
        }.expects().returns(O),

        /**
         * Returns the character at the given 'index', or empty string if none is found
         * 
         * @param int index of the character
         * @return string the character
         */
        charAt : function(index) {
         
            if (index<0 || index>this.text.length-1) return E;

            // should this return a RiString instead?
            return this.text.charAt(index);
            
        }.expects([N]).returns(S),

        /**
         * Concatenates the text from another RiString at the end of this one
         * 
         * @return this RiString
         */
        concat : function(riString) {
            
            return setText(this.text.concat(riString.getText()));
            
        }.expects([O]).returns(O),
               
        /**
         * Removes the character at the specified index
         * 
         * @param number the index
         * @return this RiString
         */
        removeCharAt : function(idx) { 
            
            return this.setText(this.text.substring(0, idx).concat(this.text.substring(idx + 1)));
            
        }.expects([N]).returns(O)

    };
    
    
    // ////////////////////////////////////////////////////////////
    // RiGrammar
    // ////////////////////////////////////////////////////////////

    var RiGrammar = makeClass();
    
    RiGrammar.START_RULE = "<start>";
    RiGrammar.OPEN_RULE_CHAR = "<";
    RiGrammar.CLOSE_RULE_CHAR = ">";
    
    RiGrammar.prototype = {

         // private consts 
        PROB_PATTERN : /(.*[^\s])\s*\[([0-9.]+)\](.*)/,
        OR_PATTERN : /\s*\|\s*/,
                
        __init__ : function(grammar) {
            
            if (isNull(grammar)) 
                this.rules = {}; 
            else
                this.setGrammar(grammar);
            
        }.expects([S],[O],[]),
    
        /**
         * Loads a JSON grammar via AJAX call to 'url', replacing any existing grammar. 
         * @param  string url of JSON file containing the grammar rules
         * @return this RiGrammar object
         */
        load : function(url) {
            
            this.reset();
            
            error("Implement me!");
            
            return this;
            
        }.expects([S]).returns(O),
    
        /**
         * Initializes a grammar from an object or JSON string containing the rules (rather than a file),
         * replacing any existing grammar. 
         * @param  string or object containing the grammar rules
         * @return this RiGrammar object
         */
        setGrammar : function(grammar) {
            
            this.reset();
            
            if (typeof grammar === 'string') {
                grammar = JSON.parse(grammar);
            }
            for (var rule in grammar) {
                this.addRule(rule, grammar[rule]);
            }
            return this;
            
        }.expects([S],[O],[]).returns(O),
        
        /**
         * Returns the current set of rules as an associative array,{names -> definitions}
         * @return object 
         */ 
        getRules : function()  {
            
            return this.rules;
            
        }.expects().returns(O),
        
        addRule : function(name, ruleStr, weight) 
        {
            var dbug = false;
    
            weight = (isNull(weight) ? 1.0 : weight); // default

            name = this.__normalizeRuleName__(name);

            if (dbug) log("addRule: "+name+ " -> "+ruleStr+" ["+weight+"]");
            
            var ruleset = ruleStr.split(this.OR_PATTERN);
            //ruleset = "<noun-phrase> <verb-phrase>";
    
            for ( var i = 0; i < ruleset.length; i++) {
                var rule = ruleset[i];
                var prob = weight;
                var m = this.PROB_PATTERN.exec(rule);
    
                if (m != null) // found weighting
                {
                    if (dbug) {
                        log("Found weight! for " + rule);
                        for (i = 0; i < m.length; i++)
                            log("  " + i + ") '" + m[i] + "'");
                    }
                    rule = m[1] + m[3];
                    prob = m[2];
                    if (dbug) log("weight=" + prob + " rule='" + rule + "'");
                }
    
                if (this.hasRule(name)) {
                    // log("rule exists");
                    var temp = this.rules[name];
                    temp[rule] = prob;
                } 
                else {
                    
                    // log("new rule");
                    temp2 = {};
                    temp2[rule] = prob;
                    this.rules[name] = temp2;
                    if (dbug)log("added rule: "+name);
                }
            }
            return this;
            
        }.expects([S,S],[S,S,N]).returns(O),
      
        /**
         * Clears all rules in the current grammar
         * @return this RiGrammar
         */
        reset : function() {
            
           this.rules = {};
           return this;
           
        }.expects().returns(O),
              
        /**
         * ??
         * @param string name
         */
        getRule : function(pre) {
            
            pre = this.__normalizeRuleName__(pre);
       
            // log("getRule("+pre+")");
            var tmp = this.rules[pre];
            var name, cnt = 0;
            
            for (name in tmp) cnt++; // count the matching rules
            
            if (cnt == 1) {
                //log("1returning: "+name+" / "+typeof name);
                return name;
            } else if (cnt > 1) {
                var sr = this.__getStochasticRule__(tmp);
                //log("2returning: "+sr+" / "+typeof sr);
                return sr;
            }
            else {
                error("No rule found for: "+pre);
            }
            
        }.expects([S]).returns(S),
        
        /**
         * Dumps the grammar rules to the console in human-readable format (for debugging) 
         */
        print : function() {
            
            log("Grammar----------------");
            for ( var name in this.rules) {
                var prob = this.rules[name];
                log("  '" + name + "' -> ");
                for ( var x in prob) {
                    log("    '" + x + "' [" + prob[x] + "]");
                }
            }
            log("-----------------------");
            
            return this;
            
        }.expects().returns(O),
        
        hasRule : function(name) {
            //log("hasRule("+name+")");
            name = this.__normalizeRuleName__(name);
            return (typeof this.rules[name] !== 'undefined');
            
        }.expects([S]).returns(B),
        
        expand : function() {
            
            return this.expandFrom(RiGrammar.START_RULE);
            
        }.expects().returns(S),
        
        expandWith : function(rule, value) {
            
            throw new Error("Not yet implemented");
            
        }.expects([S,S]).returns(S),
        
        expandFrom : function(rule) {
   
            if (!this.hasRule(rule)) {
                warn("Rule not found: " + rule + "\nRules: ");
                (!RiTa.SILENT) && this.print();
            }
    
            var iterations = 0;
            var maxIterations = 100;
            while (++iterations < maxIterations) {
                var next = this.__expandRule__(rule);
                if (isNull(next)) break;
                rule = next;
            }
    
            if (iterations >= maxIterations)
                warn("max number of iterations reached: " + maxIterations);
    
            // console.log("# Iterations="+iterations);

            return rule;
            
        }.expects([S]).returns(S),
            
        // Privates (can we hide these?) ----------------

        __expandRule__ : function(prod) { //private
            
            var dbug = false;
            if (dbug) log("__expandRule__(" + prod + ")");
            
            for ( var name in this.rules) {
                var entry = this.rules[name];
                if (dbug) log("  name=" + name+"  entry=" + entry+"  prod=" + prod+"  idx=" + idx);
                var idx = prod.indexOf(name);
                if (idx >= 0) {
                    var pre = prod.substring(0, idx);
                    var expanded = this.getRule(name);
                    var post = prod.substring(idx + name.length);
                    if (dbug) log("  pre=" + pre+"  expanded=" + expanded+"  post=" + post+"  result=" + pre + expanded + post);
                    return (pre + expanded + post);
                }
            }
            // what happens if we get here?
        },
        
        __normalizeRuleName__ : function(pre) {
            
            if (!strOk(pre)) return pre;
            
            if (!startsWith(pre,RiGrammar.OPEN_RULE_CHAR))
                pre = RiGrammar.OPEN_RULE_CHAR + pre;
            
            if (!endsWith(pre,RiGrammar.CLOSE_RULE_CHAR))
                pre += RiGrammar.CLOSE_RULE_CHAR;
            
            return pre;
            
        },
        
        // private?? (add structure test case)
        __getStochasticRule__ : function(temp)    { // map
     
            var dbug = false;
            
            if (dbug) log("__getStochasticRule__(" + temp + ")");
            
            var p = Math.random();
            var result, total = 0;
            for ( var name in temp) {
                total += parseFloat(temp[name]);
            }
            
            if (dbug) log("total=" + total+"p=" + p);
            
             for ( var name in temp) {
                if (dbug) log("  name=" + name);
                var amt = temp[name] / total;
                
                if (dbug) log("amt=" + amt);
                
                if (p < amt) {
                    result = name;
                    if (dbug)log("hit!=" + name);
                    break;
                } else {
                    p -= amt;
                }
            }
            return result;
        }
        
    
    }; // end RiGrammar
    

    // ////////////////////////////////////////////////////////////
    // RiTa object (singleton)
    // ////////////////////////////////////////////////////////////

    var RiTa = {
        
        // RiTa constants =================================
        
        /** The current version of the RiTa tools */

        VERSION : 11,

        // For Conjugator =================================
        
        //TODO: add comments
        
        FIRST_PERSON : 0,

        SECOND_PERSON : 1,

        THIRD_PERSON : 2,

        PAST_TENSE : 3,

        PRESENT_TENSE : 4,

        FUTURE_TENSE : 5,

        SINGULAR : 6,

        PLURAL : 7,

        NORMAL : 0,

        /** The infinitive verb form  - 'to eat an apple' */
        INFINITIVE : 1,

        /** Gerund form of a verb  - 'eating an apple' */
        GERUND : 2,

        /** The imperative verb form - 'eat an apple!' */
        IMPERATIVE : 3,

        /** Bare infinitive verb form - 'eat an apple' */
        BARE_INFINITIVE : 4,

        /** The subjunctive verb form */

        SUBJUNCTIVE : 5,
        
        ABBREVIATIONS : [   "Adm." ,"Capt." ,"Cmdr." ,"Col." ,"Dr." ,"Gen." ,"Gov." ,"Lt." ,"Maj." ,"Messrs." ,"Mr.","Mrs." ,"Ms." ,"Prof." ,"Rep." ,"Reps." ,"Rev." ,"Sen." ,"Sens." ,"Sgt." ,"Sr." ,"St.","a.k.a." ,"c.f." ,"i.e." ,"e.g." ,"vs." ,"v.", "Jan." ,"Feb." ,"Mar." ,"Apr." ,"Mar." ,"Jun." ,"Jul." ,"Aug." ,"Sept." ,"Oct." ,"Nov." ,"Dec." ],
            
        /** Set to true to disable all console output */
        SILENT : false,
        
        // Start Methods =================================
        
        /**  
         * Returns true  for 'word' is any variant of a verb in the PENN part-of-speech tag set (e.g. vb, vbg, vbd, vbp, vbz));
         * @param string the PENN part-of-speech tag
         * @returns boolean true if the tag is any variant of a verb 
         */
        isVerb: function(word) {

            if (word && word.indexOf(" ") != -1) error("Only accepts a single word"); // TODO: add test
            
            //return RiTa.tagForWordNet(word) === 'v' ;

             var pos = RiTa.getPosTags(word);
             return PosTagger.isVerb(pos.toString());

        }.expects([S]).returns(B),
        
        /**
         * Returns true if the tag for 'word' is any variant of a noun in the PENN part-of-speech tag set (e.g. nn, nns, nnp, nnps)
         * @param string the PENN part-of-speech tag
         * @returns boolean true if the tag is any variant of a noun 
         */
        isNoun : function(word) {

            if (word && word.indexOf(" ") != -1) error("Only accepts a single word"); // TODO: add test
          
            //return RiTa.tagForWordNet(word) === 'n' ;
            
            var pos = RiTa.getPosTags(word);
            return PosTagger.isNoun(pos.toString());

        }.expects([S]).returns(B),
        
        /**
         * Returns true if the tag for 'word' is any variant of a adverb in the PENN part-of-speech tag set (e.g. rb, rbr, rbs)
         * @param string the PENN part-of-speech tag
         * @returns boolean true if the tag is any variant of a adverb 
         */
        isAdverb : function(word) {
           
            if (word && word.indexOf(" ") != -1) error("Only accepts a single word"); // TODO: add test
          
            //return RiTa.tagForWordNet(word) === 'r' ;
            
            var pos = RiTa.getPosTags(word);
            return PosTagger.isAdverb(pos.toString());

        }.expects([S]).returns(B),
        
        /**
         * Returns true if the tag for 'word' is any variant of an adjective in the PENN part-of-speech tag set (e.g. jj, jjr, jjs)
         * @param string the PENN part-of-speech tag
         * @returns boolean true if the tag is any variant of a adjective 
         */
        isAdjective : function(word) {
        	
            if (word && word.indexOf(" ") != -1) error("Only accepts a single word"); // TODO: add test
            
            //return RiTa.tagForWordNet(word) === 'a' ; 
            
            var pos = RiTa.getPosTags(word);
            return PosTagger.isAdj(pos.toString());
            
        }.expects([S]).returns(B),
        
        /**
         * Returns true if 'tag' is a valid PENN part-of-speech tag (e.g. cd, fw, jj, ls, nn, sym, vbg, wp)
         * @param string the PENN part-of-speech tag
         * @returns boolean true if the tag a valid PENN part-of-speech tag
         */
        isPosTag : function(tag) {
            return PosTagger.isTag(tag);
            
        }.expects([S]).returns(B),
             
        /**
         * Tags the word (as usual) with a part-of-speech from the Penn tagset, 
         * then returns the corresponding part-of-speech for WordNet from the
         * set { 'n', 'v', 'a', 'r' } as a string. 
         * 
         * @param string or array, the text to be tagged
         * @returns string or array the corresponding part-of-speech for WordNet
         * 
         * TODO: example
         */
        tagForWordNet  : function(words) {
            
            var posArr = RiTa.getPosTags(words);
            //var posArr = posTag(words);
            if (!isNull(words) && posArr.length) {
                for ( var i = 0; i < posArr.length; i++) {
                    var pos = posArr[i];
                    if (PosTagger.isNoun(pos))      posArr[i] =  "n";
                    if (PosTagger.isVerb(pos))      posArr[i] =  "v";
                    if (PosTagger.isAdverb(pos))    posArr[i] =  "r";
                    if (PosTagger.isAdj(pos)) 	   posArr[i] =  "a";
                }
                return posArr;  
            }
            return []; 
            
        }.expects([A],[S]).returns(A),
              
        /**
         * Uses the default PosTagger to tag the input with a tag from the PENN tag set
         * @param string or array, the text to be tagged
         * @retuns string or array
         * TODO: example
         */
        getPosTags : function(words) {    
        	
        	var wordArr = RiTa.tokenize(trim(words));

            return PosTagger.tag(wordArr);
            
        }.expects([A],[S]).returns(A),
        
        /**
         * Uses the default PosTagger to tag the input with a tag from the PENN tag set
         * in 'inline' form
         * @param string the text to tag
         * @returns string
         * TODO: example
         */
        getPosTagsInline : function(wordswords) { 
            
            return PosTagger.tagInline(words);
            
        }.expects([A],[S]).returns(S),
        
        /**
         * Converts a PENN part-of-speech tag to the simplified WordNet scheme (e.g. nn -> n, nns -> n, vbz -> v, rb -> r)
         * { "n" (noun), "v"(verb), "a"(adj), "r"(adverb), "-"(other) } as a String.
         * @param string pos tag to convert
         * @returns string simplified WordNet tag
         * TODO: example
         */
        posToWordNet  : function(tag) {
            var pos = tag;
            var hasTag = false;

            if (!isNull(tag)) {
                    if (PosTagger.isNoun(pos)){
                    	pos =  "n";
                    	hasTag = true;
                    	}
                    if (PosTagger.isVerb(pos)){
                    	pos =  "v";
                    	hasTag = true;
                    	}
                    if (PosTagger.isAdverb(pos)){
                    	pos =  "r";
                    	hasTag = true;
                    	}
                    if (PosTagger.isAdj(pos)){
                    	pos =  "a";
                    	hasTag = true;
                    	}
                    if (!hasTag){
                    	pos =  "-";
                    	}
                return pos;  
            }
            return E; 
            
        }.expects([S]).returns(S),
        
        /**
         *  Returns the present participle form of the stemmed or non-stemmed 'verb'. 
         *  @param string the verb
         *  @returns string the present participle form of the verb
         */
        getPresentParticiple : function(verb) { 
            
            // TODO: need to call stem() and try again if first try fails
            return Conjugator().getPresentParticiple(verb);
            
        }.expects([S]).returns(S),

        /**
         *  Returns the past participle form of the stemmed or non-stemmed 'verb'. 
         *  @param string the verb
         *  @returns string the past participle form of the verb
         */
        getPastParticiple : function(verb) { 
            // TODO: need to call stem() and try again if first try fails
            return Conjugator().getPastParticiple(verb);
            
        }.expects([S]).returns(S),

        /**
         *  Conjugates the 'verb' according to the specified options
         *  @param string the verb stem
         *  @param object containing the relevant options for the conjugator
         *  @return string the conjugated verb
         *   
         *  TODO: 2 examples
         */
        conjugate : function(verb, args) {

            return Conjugator().conjugate(verb, args);
            
        }.expects([S,O]).returns(S),

        /** 
         * Pluralizes a word according to pluralization rules (see regexs in constants)
         * Returns the regular or irregular plural form of noun. Note: this method requires a pre-stemmed noun (see RiStemmer) for proper function.
         * 
         * @param string the noun
         * @returns string the plural form of noun
         * TODO: 2 examples (regular & irregular)
         */
        pluralize : function(word) {

            if (isNull(word) || !word.length)
                return [];

            var i, rule, result, rules = PLURAL_RULES;

            if (inArray(MODALS, word.toLowerCase())) {
                return word;
            }

            i = rules.length;
            while (i--) {
                rule = rules[i];
                if (rule.applies(word.toLowerCase())) {
                    return rule.fire(word);
                }
            }

            return DEFAULT_PLURAL_RULE.fire(word);
            
        }.expects([S]).returns(S),

        /**
         *  Removes blank space from either side of a string
         *  Trims null entries off the end of an array. Returns a new array consisting of the elements from 0 to the last non-null element.
         *  
         *  @param string input
         *  @returns string 
         */
        trim : function(str) {
            
            return trim(str); // delegate to private
            
        }.expects([S]).returns(S),

        /**
         *  Tokenizes the string according to Penn Treebank conventions
         *  See: http://www.cis.upenn.edu/~treebank/tokenization.html
         *  
         *  @param string a sentence
         *  @param (optional) string or Regex - the pattern to be used for tozenization
         *  
         *  @return array - of strings, each element is a single token (or word)
         *    
         *  TODO: 2 examples, one with 1 arg, one with a regex that splits on spaces
         */
        tokenize : function(words, regex) {
            
            if (isNull(words) || !words.length) return [];
            
            if (!isNull(regex)) return words.split(regex);

            words = words.replace(/``/g, "`` ");
            words = words.replace(/''/g, "  ''");
            words = words.replace(/([\\?!\"\\.,;:@#$%&])/g, " $1 ");
            words = words.replace(/\\.\\.\\./g, " ... ");
            words = words.replace(/\\s+/g, SP);
            words = words.replace(/,([^0-9])/g, " , $1");
            words = words.replace(/([^.])([.])([\])}>\"']*)\\s*$/g, "$1 $2$3 ");
            words = words.replace(/([\[\](){}<>])/g, " $1 ");
            words = words.replace(/--/g, " -- ");
            words = words.replace(/$/g, SP);
            words = words.replace(/^/g, SP);
            words = words.replace(/([^'])' /g, "$1 ' ");
            words = words.replace(/'([SMD]) /g, " '$1 ");

            
            if (false/*SPLIT_CONTRACTIONS*/) { // TMP
                words = words.replace(/'ll /g, " 'll "); 
                words = words.replace(/'re /g, " 're "); 
                words = words.replace(/'ve /g, " 've ");
                words = words.replace(/n't /g, " n't "); 
                words = words.replace(/'LL /g, " 'LL "); 
                words = words.replace(/'RE /g, " 'RE "); 
                words = words.replace(/'VE /g, " 'VE "); 
                words = words.replace(/N'T /g, " N'T "); 
            }

            words = words.replace(/ ([Cc])annot /g, " $1an not ");
            words = words.replace(/ ([Dd])'ye /g, " $1' ye ");
            words = words.replace(/ ([Gg])imme /g, " $1im me ");
            words = words.replace(/ ([Gg])onna /g, " $1on na ");
            words = words.replace(/ ([Gg])otta /g, " $1ot ta ");
            words = words.replace(/ ([Ll])emme /g, " $1em me ");
            words = words.replace(/ ([Mm])ore'n /g, " $1ore 'n ");
            words = words.replace(/ '([Tt])is /g, " $1 is ");
            words = words.replace(/ '([Tt])was /g, " $1 was ");
            words = words.replace(/ ([Ww])anna /g, " $1an na ");

            // "Nicole I. Kidman" gets tokenized as "Nicole I . Kidman"
            words = words.replace(/ ([A-Z]) \\./g, " $1. ");
            words = words.replace(/\\s+/g, SP);
            words = words.replace(/^\\s+/g, E);
            
            return trim(words).split(/\s+/); // DCH: fixed bug here
            
        }.expects([S],[S,O],[S,S]).returns(A),

        /**
         *  Splits the 'text' into sentences (according to PENN Treebank conventions)
         *  
         *  @param string - the text to be split
         *  @param (optional) string or Regex - the pattern to be used for tozenization
         *  
         */
        // TODO: test and (probably) re-implement from RiTa (RiSplitter.java)
        splitSentences : function(text, regex) {

            if (isNull(text) || !text.length)
                return [];

            var arr = text.match(/(\S.+?[.!?])(?=\s+|$)/g);

            if (isNull(arr) || arr.length == 0)
                return [ text ];

            return arr;
            
        }.expects([S],[S,O],[S,S]).returns(A),

        /**
         * Returns true if and only if the string matches 'pattern'
         * 
         * @param string to test
         * @param string or RegExp object containing regular expression
         * @return boolean true if matched, else false
         */
        regexMatch : function(string, pattern) {
            
            if (isNull(string) || isNull(pattern))
                return false;
            
            if (typeof pattern === 'string')
                pattern = new RegExp(pattern);
            
            return pattern.test(string);
            
        }.expects([S,O],[S,S]).returns(B),

        /**
         * Replaces all matches of 'pattern' in the 'string' with 'replacement'
         * 
         * @param string to test
         * @param string or RegExp object containing regular expression
         * @param string the replacement
         * @return the string with replacements or thestring on error
         */
        regexReplace : function(string, pattern, replacement) {
            
            if (isNull(string) || isNull(pattern))
                return E;
            if (typeof pattern === 'string')
                pattern = new RegExp(pattern); // TODO: is this necessary?
            return string.replace(pattern, replacement);
            
        }.expects([S,O,S],[S,S,S]).returns(S),
             
        /**
         * Returns true if 'input' is an abbreviation
         * 
         * @param string input
         * @return boolean true if 'input' is an abbreviation
         */
        isAbbreviation : function(input) {
        	
        	return inArray(this.ABBREVIATIONS,input);
        	
        }.expects([S]).returns(B),
        
        /**
         * Returns true if sentence starts with a question sword.
         * 
         * @param string sentence
         * @return boolean true if 'sentence' starts with a question sword.
         */
        isQuestion : function(sentence) {
        	var sentenceArr = RiTa.tokenize(trim(sentence));
        	//if(!isNull(sentenceArr[0])){
        	for (var i = 0; i < QUESTION_STARTS.length; i++)
        	      if (equalsIgnoreCase(sentenceArr[0], QUESTION_STARTS[i]))
        	        return true;
        	//}
        	    return false;
            
        }.expects([S]).returns(B),

        /**
         * Returns true if 'currentWord' is the final word of a sentence.
         * This is a simplified version of the OAK/JET sentence splitter method.
         * 
         * @param string currentWord
         * @param string nextWord
         * @return boolean true if 'currentWord' is the final word of a sentence.
         */
        isSentenceEnd : function(currentWord, nextWord) {

           
    if (isNull(currentWord)) return false;
    
    var cWL = currentWord.length;
    
    // token is a mid-sentence abbreviation (mainly, titles) --> middle of sent
    if (RiTa.isAbbreviation(currentWord))
      return false;
    
    var cw = currentWord.charAt(0);
    
    if (cWL > 1 && cw.indexOf("`'\"([{<") != -1 && RiTa.isAbbreviation(currentWord.substring(1)))
      return false;

    if (cWL > 2 && ((currentWord.charAt(0) == '\'' 
      && currentWord.charAt(1) == '\'') || (currentWord.charAt(0) == '`' 
      && currentWord.charAt(1) == '`')) && RiTa.isAbbreviation(currentWord.substring(2)))
    {
      return false;
    }
    
    var currentToken0 = currentWord.charAt(cWL - 1);
    var currentToken1 = (cWL > 1) ? currentWord.charAt(cWL - 2) : ' ';
    var currentToken2 = (cWL > 2) ? currentWord.charAt(cWL - 3) : ' ';
    
    var nTL = nextWord.length;
    var nextToken0 = nextWord.charAt(0);
    var nextToken1 = (nTL > 1) ? nextWord.charAt(1) : ' ';
    var nextToken2 = (nTL > 2) ? nextWord.charAt(2) : ' ';

    // nextToken does not begin with an upper case,
    // [`'"([{<] + upper case, `` + upper case, or < -> middle of sent.
    if (!  (nextToken0 == nextToken0.toUpperCase()
        || (nextToken1 == nextToken1.toUpperCase() && nextToken0.indexOf("`'\"([{<") != -1)
        || (nextToken2 == nextToken2.toUpperCase() && ((nextToken0 == '`' && nextToken1 == '`') 
        || (nextToken0 == '\'' && nextToken1 == '\'')))
        ||  nextWord == "_" || nextToken0 == '<'))
      return false;

    // ends with ?, !, [!?.]["'}>)], or [?!.]'' -> end of sentence
    if (currentToken0 == '?'
        || currentToken0 == '!'
        || (currentToken1.indexOf("?!.") != -1 && currentToken0.indexOf("\"'}>)") != -1)
        || (currentToken2.indexOf("?!.") != -1 && currentToken1 == '\'' && currentToken0 == '\''))
      return true;
      
    // last char not "." -> middle of sentence
    if (currentToken0 != '.') return false;

    // Note: wont handle Q. / A. at start of sentence, as in a news wire
    //if (startOfSentence && (currentWord.equalsIgnoreCase("Q.") 
      //|| currentWord.equalsIgnoreCase("A.")))return true; 
    
    // single upper-case alpha + "." -> middle of sentence
    if (cWL == 2 && currentToken1 == currentToken1.toUpperCase())
      return false;

    // double initial (X.Y.) -> middle of sentence << added for ACE
    if (cWL == 4 && currentToken2 == '.'
        && (currentToken1 == currentToken1.toUpperCase() && currentWord.charAt(0) == currentWord.charAt(0).toUpperCase() ))
      return false;

    // U.S. or U.N. -> middle of sentence
    //if (currentToken.equals("U.S.") || currentToken.equals("U.N."))
      //return false; // dch
      
    //f (Util.isAbbreviation(currentToken)) return false;
    
    // (for XML-marked text) next char is < -> end of sentence
    if (nextToken0 == '<')
      return true;
    
    return true;

        
            
        }.expects([S,S]).returns(B),
        
        /**
         * Returns true if sentence starts with a w-question word, eg (who,what,why,where,when,etc.)
         * 
         * @param string sentence
         * @return boolean true if sentence starts with a w-question word, eg (who,what,why,where,when,etc.)
         */
        isW_Question : function(sentence) {    
        	var sentenceArr = RiTa.tokenize(trim(sentence));
        	for (var i = 0; i < W_QUESTION_STARTS.length; i++)
        	    if (equalsIgnoreCase(sentenceArr[0], W_QUESTION_STARTS[i]))
        	      return true;
        	return false;
            
        }.expects([S]).returns(B),

        /**
         * wait on this one...
      
        loadString : function() {    
            
            error("implement me");
            
        }.expects([S]).returns(B),   */

        /**
         * Returns a randomly ordered array of unique integers from 0 to numElements. 
         * The size of the array will be numElements.
         * 
         * @param int numElements
         * @returns array of unique integers from 0 to numElements. 
         */
        randomOrdering : function(numElements) {    
            
            var o = [];
            for ( var i = 0; i < numElements.length; i++) {
                o.push(i);
            }
            
            // Array shuffle, from Jonas Raoni Soares Silva (http://jsfromhell.com/array/shuffle)
            for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);

            return o;
            
        }.expects([N]).returns(A),

        /**
         * Removes and returns a random element from an array, returning
         * it and leaving the array 1 element shorter.
         * 
         * @param array
         * @returns array
         */
        removeRandom : function(arr) { 
            
            var i = Math.floor((Math.random()*arr.length));
            console.log(arr);
            console.log("i="+i);
            remove(arr,i,i);
            console.log(arr);
            return arr;
            
        }.expects([A]).returns(A),
            
        //PUNCTUATION : "рсут`'""\",;:!?)([].#\"\\!@$%&}<>|+=-_\\/*{^",
            
        /**
         * Strips all punctuation from the given string
         * @param string
         * @param array of char (Optional) chars To Ignore
         * @returns the string result
         */
        // PUNCTUATION : "рсут`'""\",;:!?)([].#\"\\!@$%&}<>|+=-_\\/*{^",
        stripPunctuation : function(text) {    

            return text.replace(PUNCTUATION_CLASS,E); // TODO: cache this
            
        }.expects([S]).returns(S),
        
        /**
         * Trims punctuation from each side of the token (does not trim whitespace or internal punctuation).
         * 
         * @param string
         * @returns the string result
         */
        // PUNCTUATION : "рсут`'""\",;:!?)([].#\"\\!@$%&}<>|+=-_\\/*{^",
        trimPunctuation : function(text) {
            
            // TODO: replace all this with 1 regex
            
            // from the front
            while (text.length > 0) {
               var c = text.charAt(0);
               if (!RiTa.isPunctuation(c)) 
                   break;
               text = text.substr(1);
            }
            
            // from the back
            while (text.length > 0) {
                var c = text.charAt(text.length-1);
                if (!RiTa.isPunctuation(c)) 
                    break;
                text = text.substring(0, text.length-1);
             }
            return text;

            
        }.expects([S]).returns(S),
              
        /**
         * Returns true if every character of 'text' is a punctuation character
         * 
         * @param string input
         * @returns boolean true
         */
        // TEST: PUNCTUATION : "рсут`'""\",;:!?)([].#\"\\!@$%&}<>|+=-_\\/*{^",
        isPunctuation : function(text) { 
            
            if (!text || !text.length) return false;
  
            return ONLY_PUNCT.test(text); 
            
        }.expects([S]).returns(B),

        /**
         * Analyzes the given string, Returns a String containing all phonemes for the input text, delimited by semi-colons.
         * 
         * @param string or array, words to analyze
         * @returns string e.g., "dh:ax:d:ao:g:r:ae:n:f:ae:s:t", or null if no text has been input.
         */
        getPhonemes : function(words) {

        	var lex = new RiLexicon();
        	return lex.getPhonemes(words);

        }.expects([S],[A]).returns(S),

        /**
         * Analyzes the given string, Returns a String containing the stresses for each syllable of the input text, delimited by semi-colons, 
         * 
         * @param string or array, words to analyze
         * @returns string e.g., "0:1:0:1", with 1's meaning 'stressed', and 0's meaning 'unstressed', or null if no text has been input.
         */
        getStresses : function(words) {
            
        	var lex = new RiLexicon();
        	return lex.getStresses(words);

        }.expects([S],[A]).returns(S),

        /**
         * Analyzes the given string, Returns a String containing the phonemes for each syllable of each word of the input text, 
         * delimited by dashes (phonemes) and semi-colons (words), 
         * 
         * @param string or array, words to analyze
         * @returns e.g., "dh-ax:d-ao-g:r-ae-n:f-ae-s-t" for the 4 syllables of the phrase 'The dog ran fast', or null if no text has been input.
         */
        getSyllables : function(words) {
            
        	var lex = new RiLexicon();
        	return lex.getSyllables(words);

        }.expects([S],[A]).returns(S),
        
        /**
         * Returns the # of words in the object according to the default WordTokenizer.
         * 
         * @param the string to analyze
         * @returns int
         */
        getWordCount : function(words) {
            
        	return RiTa.tokenize(words).length;

        }.expects([S]).returns(N),
        
        /**
         * Returns 
         * Extracts base roots from a word by lower-casing it, then removing prefixes and suffixes. 
         * For example, the words 'run', 'runs', 'ran', and 'running' all have "run" as their stem.
         * 
         * @param string the verb to analyze
         * @returns string the stemmed from of 'verb' according to the RiTa stemming rules.
         */
        stem : function(verb) {

            error("implement RiStemmerIF");

        }.expects([S]).returns(N),

    }; // end RiTa object
    
    // Expose core RiTa objects to global namespace
    window.RiTa = RiTa;
    window.RiString = RiString;
    window.RiLexicon = RiLexicon;
    window.RiGrammar = RiGrammar;

})(window);
