const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const {C,t,r,line,arrow,label,wrap}=require('./svg-kit.cjs');
const {workspaceArt}=require('./editorial-art.cjs');
const {projectShowcase,section}=require('./modules.cjs');
const {toolCard}=require('./toolkit.cjs');
const {articleList,nowCard,interests,contact}=require('./panels.cjs');
const data=require('./demo-content.json');
const expanded=require('./demo-expanded-content.json');
function hero(content,mobile=false){
 let b='';
 if(mobile){
  b+=label(24,48,'你好，我是 / 开发者')+t(18,166,content.profile.name+'.',118,C.ink,600,'letter-spacing="-8"');
  b+=t(24,219,content.profile.headlineLines[0],28,C.ink,500)+t(24,254,content.profile.headlineLines[1],28,C.ink,500);
  b+=t(24,290,content.profile.bio[0],14,C.muted)+t(24,315,content.profile.bio[1],14,C.muted);
  b+=r(24,339,152,47,24,C.accent)+t(46,369,'阅读博客',15,'#FFF',500)+arrow(137,351,23,'#FFF');
  b+=t(202,369,'查看我的作品',14,C.ink)+arrow(305,351,22);
  b+=workspaceArt(29,386,332,309)+label(24,699,content.profile.motto.join(''))+line(24,730,366);
 }else{
  b+=label(88,80,'你好，我是 / 开发者')+t(72,298,content.profile.name+'.',228,C.ink,600,'letter-spacing="-16"');
  b+=t(88,369,content.profile.intro,37,C.ink,500,'letter-spacing="-1"');
  b+=t(88,416,content.profile.bio[0],17,C.muted)+t(88,445,content.profile.bio[1],17,C.muted);
  b+=r(88,481,176,54,27,C.accent)+t(115,516,'阅读博客',16,'#FFF',500)+arrow(223,496,23,'#FFF');
  b+=t(300,516,'查看我的作品',16,C.ink)+arrow(412,496,24);
  b+=workspaceArt(802,43,520,488)+label(859,559,content.profile.motto.join(''))+line(88,592,1352);
 }
 return {svg:b,height:mobile?730:592};
}
function works(content,x,y,w,mobile=false){
 if(!content.projects.length)return {svg:'',height:0};
 const heading=section(x,y,'精选项目','把想法，做成作品。','全部项目',x+w,mobile);
 // The long mobile heading gets its link below the project gallery.
 const head=mobile?section(x,y,'精选项目','把想法，做成作品。',null,x+w,true):heading;
 const items=projectShowcase(content.projects,x,y+head.height,w,mobile);
 let b=head.svg+items.svg,h=head.height+items.height;
 if(mobile){b+=t(x,y+h+17,'全部项目',13,C.ink)+arrow(x+68,y+h+2,18);h+=40;}
 return {svg:b,height:h};
}
function writing(content,x,y,w,mobile=false){
 const h=section(x,y,'文字与近况','随手写下。','全部文章',mobile?x+w:x+832,mobile);
 const articles=articleList(content.articles,x,y+h.height,mobile?w:832,mobile);
 let b=h.svg+articles.svg;
 if(mobile){
  const card=nowCard(content,x,y+h.height+articles.height+34,w,true);
  return {svg:b+card.svg,height:h.height+articles.height+34+card.height};
 }
 const card=nowCard(content,x+w-376,y+18,376);
 b+='<g transform="rotate(-2,'+(x+w-188)+','+(y+218)+')">'+card.svg+'</g>';
 return {svg:b,height:Math.max(h.height+articles.height,card.height+36)};
}
function life(content,x,y,w,mobile=false){
 if(!content.interests.length)return {svg:'',height:0};
 const head=section(x,y,'代码之外','生活，也有灵感。',null,x+w,mobile);
 const items=interests(content.interests,x,y+head.height,w,mobile);
 let b=head.svg+items.svg;
 if(!mobile)b+=t(x+w,y+62,'离开屏幕，收集一点新的视角。',14,C.muted,400,'text-anchor="end"');
 return {svg:b,height:head.height+items.height};
}
function lower(content,x,y,w,mobile=false){
 let b='',cursor=y;
 for(const build of [
  ()=>writing(content,x,cursor,w,mobile),
  ()=>toolCard(x,cursor,w,content.toolGroups,mobile),
  ()=>life(content,x,cursor,w,mobile),
  ()=>contact(content.profile,x,cursor,w,mobile)
 ]){
  const block=build();
  if(!block.height)continue;
  b+=block.svg;cursor+=block.height+(mobile?48:72);
 }
 const footerY=cursor-(mobile?20:30);
 b+=line(x,footerY,x+w)+t(x,footerY+29,'© 2026 '+content.profile.name+' · 公共示例',mobile?10:11,C.muted)+t(x+w,footerY+29,'example.com',mobile?10:11,C.muted,400,'text-anchor="end"');
 return {svg:b,height:footerY-y+60};
}
function full(content,mobile=false){
 const w=mobile?390:1440,x=mobile?24:88,cw=w-x*2,gap=mobile?44:64;
 const top=hero(content,mobile);
 let b=top.svg,cursor=top.height+gap;
 const projects=works(content,x,cursor,cw,mobile);
 if(projects.height){b+=projects.svg;cursor+=projects.height+(mobile?48:72);}
 const tail=lower(content,x,cursor,cw,mobile);
 return {svg:wrap(w,cursor+tail.height,'自然流式布局 · '+(mobile?'移动端':'桌面端'),b+tail.svg),height:cursor+tail.height,width:w};
}
function expansion(mobile=false){
 const w=mobile?390:1440,x=mobile?24:88,cw=w-x*2;
 let b=label(x,40,'多内容排版示例 · 全部为虚构内容'),cursor=mobile?86:104;
 for(const build of [
  ()=>works(expanded,x,cursor,cw,mobile),
  ()=>toolCard(x,cursor,cw,expanded.toolGroups,mobile),
  ()=>life(expanded,x,cursor,cw,mobile)
 ]){
  const block=build();b+=block.svg;cursor+=block.height+(mobile?50:76);
 }
 return {svg:wrap(w,cursor,'多内容自然排列 · '+(mobile?'移动端':'桌面端'),b),width:w,height:cursor};
}
async function main(){
 const projectDesktop=works(expanded,88,32,1264),projectMobile=works(expanded,24,24,342,true);
 const desktop=full(data),mobile=full(data,true),toolsDesktop=toolCard(24,24,1264,data.toolGroups),toolsMobile=toolCard(24,24,342,data.toolGroups,true),tail=lower(data,88,32,1264);
 const outputs=[
  ['profile-desktop-demo',desktop.svg],['profile-mobile-demo',mobile.svg],
  ['profile-hero-desktop',wrap(1440,624,'首屏构图',hero(data).svg)],
  ['profile-hero-mobile',wrap(390,762,'移动首屏构图',hero(data,true).svg)],
  ['tech-tools-desktop',wrap(1312,toolsDesktop.height+48,'创作工具 · 桌面端',toolsDesktop.svg)],
  ['tech-tools-mobile',wrap(390,toolsMobile.height+48,'创作工具 · 移动端',toolsMobile.svg)],
  ['profile-lower-desktop',wrap(1440,tail.height+32,'内容与生活 · 桌面端',tail.svg)],
  ['layout-expansion-desktop',expansion().svg],['layout-expansion-mobile',expansion(true).svg],
  ['projects-desktop',wrap(1440,projectDesktop.height+64,'项目模块 · 多项目示例',projectDesktop.svg)],
  ['projects-mobile',wrap(390,projectMobile.height+48,'项目模块 · 移动端多项目示例',projectMobile.svg)]
 ];
 for(const [name,svg] of outputs){
  fs.writeFileSync(path.join(__dirname,name+'.svg'),svg,'utf8');
  await sharp(Buffer.from(svg),{density:144}).png().toFile(path.join(__dirname,name+'.png'));
  console.log(name+': SVG and 2x PNG generated');
 }
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1});
module.exports={main,hero,works,writing,life,full,expansion,lower};

