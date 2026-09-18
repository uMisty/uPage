const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'figma-package'),manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
const decode=s=>s.replace(/&(?:amp|lt|gt|quot|apos);/g,m=>({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'"}[m]));
const attrs=s=>Object.fromEntries([...s.matchAll(/([\w:-]+)="([^"]*)"/g)].map(m=>[m[1],decode(m[2])]));
function payload(svg){
 const texts=[...svg.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)].map(m=>{const a=attrs(m[1]);return{text:decode(m[2]),size:Number(a['font-size']||20),weight:Number(a['font-weight']||400),spacing:Number(a['letter-spacing']||0),anchor:a['text-anchor']||'start'};});
 const links=[...svg.matchAll(/<a\b([^>]*)>/g)].map(m=>attrs(m[1])).map(a=>({name:a.id,url:a.href}));
 // Explicit groups preserve whole-button hit targets across SVG importers.
 svg=svg.replace(/<a\b([^>]*)>/g,(_,s)=>{const a=attrs(s);return `<g id="${a.id}">`;}).replace(/<\/a>/g,'</g>');
 svg=svg.replaceAll('Segoe UI,Microsoft YaHei,Noto Sans CJK SC,Arial,sans-serif','Noto Sans SC');
 return{svg,texts,links};
}
fs.mkdirSync(path.join(root,'payloads'),{recursive:true});
for(const s of manifest.screens){
 for(const item of s.sections){
  if(item.svg)fs.writeFileSync(path.join(root,'payloads',item.key+'.json'),JSON.stringify({...item,...payload(item.svg)}));
 }
}
for(const a of manifest.assets)fs.writeFileSync(path.join(root,'payloads',a.name+'.json'),JSON.stringify({...a,...payload(a.svg)}));
fs.writeFileSync(path.join(root,'screen-index.json'),JSON.stringify(manifest.screens.map(({sections,...s})=>({...s,sections:sections.map(({svg,...b})=>b)})),null,2));
console.log(JSON.stringify({screens:manifest.screens.length,assets:manifest.assets.length}));
