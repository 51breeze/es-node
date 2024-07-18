const Compiler = require("easescript/lib/core/Compiler");
const Diagnostic = require("easescript/lib/core/Diagnostic");
const Compilation = require("easescript/lib/core/Compilation");
const path =require("path");
const plugin = require("../index");
class Creator {
    constructor(options){
        const compiler = new Compiler(Object.assign({
            debug:false,
            diagnose:true,
            autoLoadDescribeFile:true,
            output:path.join(__dirname,"./build"),
            workspace:path.join(__dirname,"./src"),
            parser:{
                locations:true
            }
        },options || {}));
        this._compiler = compiler;
        this.plugin = compiler.applyPlugin({plugin, options:{
            emitFile:true,
            metadata:{
                env:{NODE_ENV:'development'},
            },
            module:"cjs",
            env:{NODE_ENV:'development'}
        }});
    }

    get compiler(){
        return this._compiler;
    }

    factor(file,source){
        return new Promise( async(resolved,reject)=>{
            const compiler = this.compiler;
            await compiler.initialize();
            await compiler.loadTypes([
                'types/index.d.es'
            ], {scope:'es-node', "inherits": ["es-javascript"]});
            let compilation = null;
            try{
                compilation=file ? await compiler.createCompilation(file) : new Compilation( compiler );
                await compilation.parserAsync(source);
                if(compilation.stack){
                    resolved(compilation);
                }else{
                    reject({compilation,errors:compiler.errors});
                }
            }catch(error){
                console.log( error )
                reject({compilation,errors:[error]});
            }
        });
    }

    startBySource(source){
        return this.factor(null, source);
    }

    startByFile(file){
        return this.factor(file);
    }

    expression( stack ){
        return this.plugin.make( stack );
    }

    build( compilation ){
        return this.plugin.start( compilation, (e)=>{
               if( e ){
                   console.log(e);
               }else{
                   console.log("build done!!")
               }
        });
    }
}

exports.Diagnostic = Diagnostic;
exports.Creator=Creator;