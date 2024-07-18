const jsPlugin = require("es-javascript/index");
const merge = require("lodash/merge");
const defaultConfig ={}
const pkg = require("./package.json");
class PluginEsNode extends jsPlugin{
    constructor(complier,options){
        super(complier, merge({},defaultConfig, options))
        this.name = pkg.name;
        this.version = pkg.version;
        this.platform = 'server';
    }
    toString(){
        return pkg.name;
    }
}

PluginEsNode.toString=function toString(){
    return pkg.name;
}

module.exports = PluginEsNode;