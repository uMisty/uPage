const fs=require('node:fs'),path=require('node:path');
const {C,t,r,line,label}=require('./svg-kit.cjs');
const {grid,textBlock}=require('./flow-layout.cjs');
const logoPaths=new Map();
function brandMark(tool,x,y,size){
 let mark='';
 if(tool.icon){
  if(!logoPaths.has(tool.icon)){
   const source=fs.readFileSync(path.join(__dirname,'assets','icons',tool.icon+'.svg'),'utf8');
   const parts=source.match(/<path\b[^>]*\/>/g);
   if(!parts)throw new Error('Icon has no path: '+tool.icon);
   logoPaths.set(tool.icon,parts.join(''));
  }
  mark=`<g transform="translate(${x+size*.21},${y+size*.21}) scale(${size*.58/24})" fill="#DDEABE">${logoPaths.get(tool.icon)}</g>`;
 }else mark=t(x+size/2,y+size*.63,tool.mark||tool.name.slice(0,2),size*.27,'#DDEABE',650,'text-anchor="middle"');
 return r(x,y,size,size,10,'#354039')+mark;
}
function toolItem(tool,x,y,w,mobile){
 const size=mobile?33:40,tx=x+size+10,available=w-size-10;
 const title=textBlock(tx,y+(mobile?13:16),tool.name,available,mobile?13:15,'#F1F4E9',600,mobile?18:20);
 const purpose=textBlock(tx,y+title.height+14,tool.purpose,available,mobile?11:12,'#B0BCAF',400,17);
 return {svg:'<g id="Tool-'+tool.name.replace(/[^a-z0-9]/gi,'-')+'">'+brandMark(tool,x,y,size)+title.svg+purpose.svg+'</g>',height:Math.max(size,title.height+purpose.height+10)};
}
function toolCard(x,y,w,groups,mobile=false){
 const active=groups.filter(g=>g.items.length);
 if(!active.length)return {svg:'',height:0};
 const inset=mobile?22:40,top=mobile?137:181;
 const content=grid(active,{x:x+inset,y:y+top,width:w-inset*2,columns:mobile?1:3,columnGap:28,rowGap:mobile?30:40},(group,gx,gy,gw)=>{
  const heading=textBlock(gx,gy+13,group.name,gw,13,'#B6C4AF',500,19);
  const items=grid(group.items,{x:gx,y:gy+heading.height+16,width:gw,columns:2,columnGap:mobile?14:16,rowGap:22},(tool,tx,ty,tw)=>toolItem(tool,tx,ty,tw,mobile));
  return {svg:heading.svg+items.svg,height:heading.height+16+items.height};
 });
 const height=top+content.height+(mobile?28:38);
 let b=r(x,y,w,height,mobile?12:16,C.dark)+label(x+inset,y+(mobile?34:44),'创作工具','#BAC7B3');
 b+=t(x+inset,y+(mobile?76:99),'我的工作台。',mobile?28:38,'#F2F3E9',500,'letter-spacing="-1"');
 b+=t(x+inset,y+(mobile?105:137),'用顺手的工具，把灵感变成日常。',mobile?12:15,'#B0BCAF');
 if(!mobile)b+=line(x+inset,y+157,x+w-inset,'#465146');
 return {svg:b+content.svg,height};
}
module.exports={toolCard};

