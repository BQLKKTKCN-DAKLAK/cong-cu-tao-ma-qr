import { cp, mkdir, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';
const root=process.cwd();
const dist=join(root,'dist');
await rm(dist,{recursive:true,force:true});
await mkdir(dist,{recursive:true});
for(const f of ['index.html','src','assets','_headers','robots.txt']){
  await cp(join(root,f),join(dist,f),{recursive:true});
}
try{
  if((await stat(join(root,'vendor'))).isDirectory()){
    await cp(join(root,'vendor'),join(dist,'vendor'),{recursive:true});
  }
}catch(e){if(e.code!=='ENOENT')throw e;}
console.log('Build successful: dist/index.html');
