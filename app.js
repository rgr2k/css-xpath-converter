(function(global, undefined) {

    global.util = {
        toCss:function(xpath) {
            return xpath
                .replace(/\[(\d+?)\]/g, function(s, m1){
                    return '['+(m1-1)+']';
                })
                .replace(/\/{2}/g, '')
                .replace(/\/+/g, ' > ')
                .replace(/@/g, '')
                .replace(/\[(\d+)\]/g, ':eq($1)')
                .replace(/^\s+/, '');
        },
        toXPath:(function(){
            var re = [
                    // add @ for attribs
                    /\[([^\]~\$\*\^\|\!]+)(=[^\]]+)?\]/g, "[@$1$2]",
                    // multiple queries
                    /\s*,\s*/g, "|",
                    // , + ~ >
                    /\s*(\+|~|>)\s*/g, "$1",
                    //* ~ + >
                    /([a-zA-Z0-9\_\-\*])~([a-zA-Z0-9\_\-\*])/g, "$1/following-sibling::$2",
                    /([a-zA-Z0-9\_\-\*])\+([a-zA-Z0-9\_\-\*])/g, "$1/following-sibling::*[1]/self::$2",
                    /([a-zA-Z0-9\_\-\*])>([a-zA-Z0-9\_\-\*])/g, "$1/$2",
                    // all unescaped stuff escaped
                    /\[([^=]+)=([^'|"][^\]]*)\]/g, "[$1='$2']",
                    // all descendant or self to //
                    /(^|[^a-zA-Z0-9\_\-\*])(#|\.)([a-zA-Z0-9\_\-]+)/g, "$1*$2$3",
                    /([\>\+\|\~\,])([a-zA-Z\*]+)/g, '$1//$2',
                    // must protect spaces in field names
                    /(\])\s/g, '$1//',
                    // Eh, unneeded?
                    /\s+\/\//g, '//',
                    // :first-child
                    /([a-zA-Z0-9\_\-\*]+):first-child/g, "*[1]/self::$1",
                    // :last-child
                    /([a-zA-Z0-9\_\-\*]+):last-child/g, "$1[not(following-sibling::*)]",
                    // :only-child
                    /([a-zA-Z0-9\_\-\*]+):only-child/g, "*[last()=1]/self::$1",
                    // :empty
                    /([a-zA-Z0-9\_\-\*]+):empty/g, "$1[not(*) and not(normalize-space())]",
                    // :not
                    /([a-zA-Z0-9\_\-\*]+):not\(([^\)]*)\)/g, function(s, a, b){ return a.concat("[not(", toXPath(b).replace(/^[^\[]+\[([^\]]*)\].*$/g, "$1"), ")]");},
                    // :nth-child
                    /([a-zA-Z0-9\_\-\*]+):nth-child\(([^\)]*)\)/g, function(s, a, b){
                    switch(b){
                        case "n":
                            return a;
                        case "even":
                            return "*[position() mod 2=0 and position()>=0]/self::" + a;
                        case "odd":
                            return a + "[(count(preceding-sibling::*) + 1) mod 2=1]";
                        default:
                            b = (b || "0").replace(/^([0-9]*)n.*?([0-9]*)$/, "$1+$2").split("+");
                            b[1] = b[1] || "0";
                            return "*[(position()-".concat(b[1], ") mod ", b[0], "=0 and position()>=", b[1], "]/self::", a);
                        }
                    },
                    // :contains(selectors)
                    /:contains\(([^\)]*)\)/g, function(s, a){
                    /*return "[contains(css:lower-case(string(.)),'" + a.toLowerCase() + "')]"; // it does not work in firefox 3*/
                        return "[contains(string(.),'" + a + "')]";
                    },
                    // |= attrib
                    /\[([a-zA-Z0-9\_\-]+)\|=([^\]]+)\]/g, "[@$1=$2 or starts-with(@$1,concat($2,'-'))]",
                    // *= attrib
                    /\[([a-zA-Z0-9\_\-]+)\*=([^\]]+)\]/g, "[contains(@$1,$2)]",
                    // ~= attrib
                    /\[([a-zA-Z0-9\_\-]+)~=([^\]]+)\]/g, "[contains(concat(' ',normalize-space(@$1),' '),concat(' ',$2,' '))]",
                    // ^= attrib
                    /\[([a-zA-Z0-9\_\-]+)\^=([^\]]+)\]/g, "[starts-with(@$1,$2)]",
                    // $= attrib
                    /\[([a-zA-Z0-9\_\-]+)\$=([^\]]+)\]/g, function(s, a, b){return "[substring(@".concat(a, ",string-length(@", a, ")-", b.length - 3, ")=", b, "]");},
                    // != attrib
                    /\[([a-zA-Z0-9\_\-]+)\!=([^\]]+)\]/g, "[not(@$1) or @$1!=$2]",
                    // ids and classes
                    /#([a-zA-Z0-9\_\-]+)/g, "[@id='$1']",
                    /\.([a-zA-Z0-9\_\-]+)/g, "[contains(concat(' ',normalize-space(@class),' '),' $1 ')]",
                    // normalize multiple filters
                    /\]\[([^\]]+)/g, " and ($1)"
                ],
                length = re.length;
            return function toXPath(css){
                var i = 0;
                while(i < length){
                    css = css.replace(re[i++], re[i++]);
                }
                return "//" + css;
            };
        })()
    }

})(this);
