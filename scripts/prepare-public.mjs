import fs from 'node:fs';
import path from 'node:path';
const target=path.resolve('output/node-public');
fs.mkdirSync(target,{recursive:true});
for(const name of fs.readdirSync('public')) {
  if(name==='demo-assets'||name.startsWith('.'))continue;
  fs.cpSync(path.join('public',name),path.join(target,name),{recursive:true});
}
