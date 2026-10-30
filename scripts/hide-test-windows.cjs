// Firebase's Java child would otherwise open a separate Windows console.
if(process.platform==='win32') {
  const childProcess=require('node:child_process');
  const spawn=childProcess.spawn;
  childProcess.spawn=function(command,args,options) {
    if(!Array.isArray(args)){options=args;args=[];}
    return spawn.call(this,command,args,{...options,windowsHide:true});
  };
  require('node:module').syncBuiltinESMExports();
}
