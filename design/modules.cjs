const {C,t,r,line,arrow,label}=require('./svg-kit.cjs');
const {projectArt}=require('./editorial-art.cjs');
const {textBlock}=require('./flow-layout.cjs');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
function httpUrl(value){
 if(!value)return null;
 try{const url=new URL(value);return ['https:','http:'].includes(url.protocol)?url.href:null;}catch{return null;}
}
function projectActions(p,x,y,mobile=false,prominent=true){
 const demo=httpUrl(p.demoUrl),source=httpUrl(p.githubUrl),h=44,gap=12;
 const items=[];
 if(demo)items.push({label:'Demo',url:demo,width:mobile?112:128});
 if(source)items.push({label:'GitHub 源码',url:source,width:mobile?154:164});
 if(!items.length)return {svg:t(x,y+25,'暂未开放链接',12,C.muted),height:32,width:0};
 let b='',cursor=x;
 items.forEach((item,i)=>{
  const primary=i===0,fill=primary?(prominent?C.accent:'#E9EDF9'):'none',stroke=primary?'none':(prominent?'#8D9B87':C.line),ink=primary?(prominent?'#FFF':C.accent):C.ink;
  const button=r(cursor,y,item.width,h,22,fill,stroke)+t(cursor+18,y+28,item.label,mobile?13:14,ink,550)+arrow(cursor+item.width-31,y+13,18,ink);
  b+='<a id="Action-'+esc(p.art)+'-'+(item.label==='Demo'?'Demo':'GitHub')+'" href="'+esc(item.url)+'" target="_blank" rel="noopener noreferrer" aria-label="'+esc(p.name+' · '+item.label)+'"><title>'+esc(p.name+' · '+item.label)+'</title>'+button+'</a>';
  cursor+=item.width+gap;
 });
 return {svg:b,height:h,width:cursor-x-gap};
}
function releaseTime(p){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(p.releasedAt||''))return 0;
 const value=Date.parse(p.releasedAt+'T00:00:00Z');
 return Number.isFinite(value)&&new Date(value).toISOString().slice(0,10)===p.releasedAt?value:0;
}
function selectFeatured(items){
 if(!items.length)return -1;
 const pinned=items.map((p,i)=>p.featured?i:-1).filter(i=>i>=0);
 const candidates=pinned.length?pinned:items.map((_,i)=>i);
 return candidates.reduce((best,i)=>releaseTime(items[i])>releaseTime(items[best])?i:best,candidates[0]);
}
function featuredProject(p,x,y,w,mobile=false){
 const inset=mobile?22:36,tx=x+inset,copyWidth=mobile?w-inset*2:Math.min(395,w*.34);
 const badge=p.releaseLabel||'主推作品';
 const badgeWidth=Math.max(86,[...badge].length*12+30);
 let b=r(tx,y+(mobile?22:33),badgeWidth,27,14,'#F6F8EF')+t(tx+15,y+(mobile?40:51),badge,12,C.accent,600);
 const nameY=y+(mobile?91:118);
 const name=textBlock(tx,nameY,p.name,copyWidth,mobile?33:45,C.ink,550,mobile?41:54);
 b+=name.svg;
 let h;
 if(mobile){
  const artY=nameY+name.height+1,artHeight=Math.round((w-28)*9/16);
  b+=projectArt(p.art,x+14,artY,w-28,artHeight);
  const descriptionY=artY+artHeight+30;
  const description=textBlock(tx,descriptionY,p.summary||p.description,copyWidth,14,C.muted,400,23);
  b+=description.svg;
  const tagsY=descriptionY+description.height+10;
  const tags=textBlock(tx,tagsY,p.tags.join(' + '),copyWidth,11,C.muted,400,18);
  b+=tags.svg;
  const actionsY=tagsY+tags.height+16,actions=projectActions(p,tx,actionsY,true);
  b+=actions.svg;
  h=actionsY-y+actions.height+25;
 }else{
  const descriptionY=nameY+name.height+7;
  const description=textBlock(tx,descriptionY,p.summary||p.description,copyWidth,17,C.muted,400,28);
  b+=description.svg;
  const tagsY=descriptionY+description.height+17;
  const tags=textBlock(tx,tagsY,p.tags.join(' + '),copyWidth,12,C.muted,400,19);
  b+=tags.svg;
  const actionsY=tagsY+tags.height+24,actions=projectActions(p,tx,actionsY);
  b+=actions.svg;
  h=Math.max(424,actionsY-y+actions.height+54);
  const artX=x+copyWidth+72,artW=w-copyWidth-88;
  b+=projectArt(p.art,artX,y+28,artW,h-56);
 }
 const meta=p.releasedAt?p.releasedAt.slice(0,7).replace('-','.')+' · 示例项目':'示例项目';
 if(!mobile)b+=t(tx,y+h-21,meta,11,'#687561');
 const palette={notes:'#DDE5D5',timer:'#D7E1F5',palette:'#E7DAD1',tasks:'#D8D7EB',journal:'#CEDACD'};
 return {svg:'<g id="Featured-'+esc(p.art)+'">'+r(x,y,w,h,16,palette[p.art]||C.soft)+b+'</g>',height:h};
}
function projectRow(p,x,y,w,mobile=false){
 const top=mobile?24:28,thumbW=mobile?88:192,thumbH=mobile?55:108,tx=mobile?x:x+thumbW+28,textW=mobile?w-thumbW-20:w-thumbW-28-336;
 let b=line(x,y,x+w)+projectArt(p.art,mobile?x+w-thumbW:x,y+top,thumbW,thumbH);
 const titleY=y+top+(mobile?20:29);
 const title=textBlock(tx,titleY,p.name,textW,mobile?21:27,C.ink,550,mobile?28:35);
 b+=title.svg;
 const descriptionY=mobile?Math.max(y+top+thumbH,titleY+title.height)+22:titleY+title.height+4;
 const description=textBlock(mobile?x:tx,descriptionY,p.description,mobile?w:textW,15,C.muted,400,24);
 b+=description.svg;
 const infoEnd=descriptionY+description.height;
 let h;
 if(mobile){
  const tagsY=infoEnd+8;
  const tags=textBlock(x,tagsY,p.tags.join(' + '),w,12,C.muted,400,19);
  b+=tags.svg;
  const actionsY=tagsY+tags.height+16,actions=projectActions(p,x,actionsY,true,false);
  b+=actions.svg;
  h=actionsY-y+actions.height+24;
 }else{
  const tags=textBlock(tx,infoEnd+8,p.tags.join(' + '),textW,12,C.muted,400,19);
  b+=tags.svg;
  h=Math.max(172,infoEnd-y+tags.height+28,top+thumbH+28);
  b+=projectActions(p,x+w-304,y+top,false,false).svg;
 }
 return {svg:'<g id="Project-'+esc(p.art)+'">'+b+'</g>',height:h};
}
function projectShowcase(items,x,y,w,mobile=false){
 const selected=selectFeatured(items);
 if(selected<0)return {svg:'',height:0};
 const featured=featuredProject(items[selected],x,y,w,mobile);
 let b=featured.svg,cursor=y+featured.height;
 const rest=items.filter((_,i)=>i!==selected);
 if(rest.length){
  cursor+=mobile?28:32;
  for(const item of rest){
   const row=projectRow(item,x,cursor,w,mobile);
   b+=row.svg;cursor+=row.height;
  }
  b+=line(x,cursor,x+w);
 }
 return {svg:b,height:cursor-y};
}
function section(x,y,kicker,title,more,right,mobile=false){
 let b=label(x,y+12,kicker)+t(x,y+(mobile?51:64),title,mobile?29:48,C.ink,500,'letter-spacing="-1"');
 if(more)b+=t(right-30,y+(mobile?50:61),more,13,C.ink,400,'text-anchor="end"')+arrow(right-19,y+(mobile?36:44),19);
 return {svg:b,height:mobile?82:104};
}
module.exports={projectShowcase,featuredProject,projectRow,projectActions,selectFeatured,section};

