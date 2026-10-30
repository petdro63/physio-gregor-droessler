import { spawn, execFileSync } from 'node:child_process';
import path from 'node:path';
const windows=process.platform==='win32';
const hook=path.resolve('scripts/hide-test-windows.cjs').replaceAll('\\','/');
const env={...process.env,NODE_OPTIONS:[process.env.NODE_OPTIONS,`--require=${JSON.stringify(hook)}`].filter(Boolean).join(' ')};
const test='node --test test/firebase-rules.integration.mjs';
const args=['-y','firebase-tools@latest','emulators:exec','--only','firestore','--project','demo-physio-test',windows?`"${test}"`:test];
const child=spawn('npx',args,{stdio:'inherit',shell:windows,windowsHide:true,env});
const code=await new Promise((resolve,reject)=>{child.on('error',reject);child.on('exit',resolve);});
if(windows) {
  // Only our named test project and this checkout's exact rules path qualify.
  const rules=path.resolve('firestore.rules').replaceAll("'","''");
  const command=`Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'java.exe' -and $_.CommandLine.Contains('cloud-firestore-emulator-') -and $_.CommandLine.Contains('--project_id demo-physio-test') -and $_.CommandLine.Contains('${rules}') } | ForEach-Object { Stop-Process -Id $_.ProcessId -ErrorAction SilentlyContinue }`;
  execFileSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',command],{windowsHide:true,stdio:'ignore'});
}
process.exitCode=typeof code==='number'?code:1;
