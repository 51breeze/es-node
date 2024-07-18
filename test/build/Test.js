const TestImport = require("./TestImport.js");
const Class = require("./core/Class.js");
const path = require("node:path");
const assert = require("node:assert");
const {AsyncResource} = require("node:async_hooks");
const posix = require("node:path/posix");
const {Certificate} = require("node:crypto");
const async_hooks = require("node:async_hooks");
const buffer = require("node:buffer");
const child_process = require("node:child_process");
const util = require("node:util");
const fs = require("node:fs");
const net = require("node:net");
const crypto = require("node:crypto");
const http = require("node:http");
function Test(){}
const methods = {
    main:{
        m:3,
        d:3,
        value:function main(){
            describe('Test',()=>{
                (new Test()).start();
            });
            describe('TestImport',()=>{
                new TestImport().start();
            });
        }
    }
}
const members = {
    start:{
        m:3,
        d:3,
        value:function start(){
            this.testAssert();
            this.testAsyncHooks();
            this.testBuffer();
            this.testChildProcess();
            this.testPath();
            this.testFs();
            this.testNet();
            this.testCrypto();
            this.testHttp();
        }
    },
    testAssert:{
        m:3,
        d:3,
        value:function testAssert(){
            it(`assert`,()=>{
                try{
                    assert(0,new assert.AssertionError({
                        message:"is false"
                    }));
                    expect('throw error').toBe(false);
                }catch(e){
                    expect('is false').toBe(e.message);
                }
                assert.equal(1,1,'is equal');
            });
        }
    },
    testAsyncHooks:{
        m:3,
        d:3,
        value:function testAsyncHooks(){
            it(`testAsyncHooks`,()=>{
                const asyncHook = async_hooks.createHook({});
                asyncHook.enable();
                let index = 0;
                function fn(){
                    index++;
                }
                const asyncResource = new AsyncResource('demo');
                asyncResource.runInAsyncScope(fn);
                asyncResource.emitDestroy();
                expect(1).toEqual(index);
            });
        }
    },
    testBuffer:{
        m:3,
        d:3,
        value:function testBuffer(){
            it(`testBuffer`,()=>{
                const buf1 = Buffer.alloc(10);
                const buf2 = Buffer.alloc(10,1);
                const buf3 = Buffer.from('tést','latin1');
                expect('0000000000').toEqual(buf1.join(''));
                expect('1111111111').toEqual(buf2.join(''));
                expect('116-233-115-116').toEqual(buf3.join('-'));
                expect(4294967296).toEqual(buffer.constants.MAX_LENGTH);
            });
        }
    },
    testChildProcess:{
        m:3,
        d:3,
        value:function testChildProcess(){
            it(`testChildProcess`,async ()=>{
                const execFile = util.promisify(child_process.execFile);
                async function getVersion(){
                    const {stdout} = await execFile('node',['--version']);
                    return stdout;
                }
                const version = await getVersion();
                expect(version).toContain('v');
            });
        }
    },
    testPath:{
        m:3,
        d:3,
        value:function testPath(){
            it(`testPath`,()=>{
                expect('bb').toEqual(path.basename('aa/bb.cc','.cc'));
                expect('bb').toEqual(path.posix.basename('aa/bb.cc','.cc'));
                expect('bb').toEqual(posix.basename('aa/bb.cc','.cc'));
            });
        }
    },
    testFs:{
        m:3,
        d:3,
        value:function testFs(){
            it(`testFs`,()=>{
                expect(fs.existsSync(path.join(__dirname,'Test.js'))).toBeTrue();
                expect(4).toEqual(fs.constants.R_OK);
            });
        }
    },
    testNet:{
        m:3,
        d:3,
        value:function testNet(){
            it(`testNet`,()=>{
                const blockList = new net.BlockList();
                blockList.addAddress('123.123.123.123');
                blockList.addRange('10.0.0.1','10.0.0.10');
                blockList.addSubnet('8592:757c:efae:4e45::',64,'ipv6');
                expect(blockList.check('123.123.123.123')).toBeTrue();
                expect(blockList.check('::ffff:7b7b:7b7b','ipv6')).toBeTrue();
            });
        }
    },
    testCrypto:{
        m:3,
        d:3,
        value:function testCrypto(){
            it(`testCrypto`,()=>{
                const cert = Certificate();
                const cert2 = new crypto.Certificate();
                const secret = 'abcdefg';
                const hash = crypto.createHmac('sha256',secret).update('I love cupcakes').digest('hex');
                expect(hash).toEqual('c0fa1bc00531bd78ef38c628449c5102aeabd49b5dc3a2a516ea6ea959d6658e');
                const alice = crypto.createECDH('secp521r1');
                const aliceKey = alice.generateKeys();
                const bob = crypto.createECDH('secp521r1');
                const bobKey = bob.generateKeys();
                const aliceSecret = alice.computeSecret(bobKey);
                const bobSecret = bob.computeSecret(aliceKey);
                expect(aliceSecret.toString('hex')).toEqual(bobSecret.toString('hex'));
            });
        }
    },
    testHttp:{
        m:3,
        d:3,
        value:function testHttp(){
            it(`testHttp`,()=>{
                const proxy = http.createServer((req,res)=>{
                    res.writeHead(200,{
                        'Content-Type':'text/plain'
                    });
                    res.end('okay');
                });
                proxy.on('connect',(req,clientSocket,head)=>{
                    const {port,hostname} = new URL(`http://${req.url}`);
                    const serverSocket = net.connect((port) || 80,hostname,()=>{
                        clientSocket.write('HTTP/1.1 200 Connection Established\r\n' + 'Proxy-agent: Node.js-Proxy\r\n' + '\r\n');
                        serverSocket.write(head);
                        serverSocket.pipe(clientSocket);
                        clientSocket.pipe(serverSocket);
                    });
                });
                proxy.listen(1337,'127.0.0.1',()=>{
                    const options = {
                        port:1337,
                        host:'127.0.0.1',
                        method:'CONNECT',
                        path:'www.google.com:80'
                    }
                    const req = http.request(options);
                    req.end();
                    req.on('connect',(res,socket,head)=>{
                        console.log('got connected!');
                        socket.write('GET / HTTP/1.1\r\n' + 'Host: www.google.com:80\r\n' + 'Connection: close\r\n' + '\r\n');
                        socket.on('data',(chunk)=>{
                            console.log(chunk.toString());
                        });
                        socket.on('end',()=>{
                            proxy.close();
                        });
                    });
                });
            });
        }
    }
}
Class.creator(1,Test,{
    id:1,
    name:"Test",
    methods:methods,
    members:members
});
module.exports=Test;
Test.main();