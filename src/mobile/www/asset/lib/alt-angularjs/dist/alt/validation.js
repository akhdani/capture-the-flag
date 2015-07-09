alt.modules.validation=angular.module("alt-validation",[]).factory("$valid",["$log",function(e){return{required:function(e){return 0!==e&&(e=(e||"")+""),""!==e&&"undefined"!=typeof e},regex:function(e,n){return e=(e||"")+"",n.test(e)},email:function(e){return this.regex(e,/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i)},username:function(e){return e+="",e.toLowerCase().replace(/[^a-z0-9._-]/,"")},number:function(e){return this.regex(e,/^[0-9]+\.?[0-9]*?$/i)},integer:function(e){return this.regex(e,/^[0-9]*$/i)},equals:function(e,n){return e===n},notequals:function(e,n){return e!==n},lessthan:function(e,n){return n>e},lessequalthan:function(e,n){return n>=e},greaterthan:function(e,n){return e>n},greaterequalthan:function(e,n){return n>=e},between:function(e,n,t){return e>=n&&t>=e},date:function(e){return e+="",8==e.length&&moment(e,"YYYYMMDD").isValid()},month:function(e){return e+="",6==e.length&&moment(e,"YYYYMM").isValid()},year:function(e){return e+="",4==e.length&&moment(e,"YYYY").isValid()},time:function(e){return e+="",4==e.length&&moment(e,"HHmm").isValid()}}}]).factory("$validate",["$valid","$log","$injector",function(e,n,t){var r=function(){return{rules:[],messages:[],rule:function(e,n){return this.rules.push(e),this.messages.push(n),this},validate:function(){for(var e=!0,n=[],t=0;t<this.rules.length;t++)this.rules[t]||(e=!1,n.push(this.messages[t]));return{res:e,message:n}},check:function(){var e=this.validate(),n=t.get("$alert");return!e.res&&n&&n.add(e.message.join("<br/>"),n.danger),e.res}}};for(var u in e)e.hasOwnProperty(u)&&(r[u]=e[u]);return r}]);