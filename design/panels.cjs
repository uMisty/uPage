const {C,t,r,line,arrow,circle,label}=require('./svg-kit.cjs');
const {interestArt}=require('./editorial-art.cjs');
const {grid,textBlock}=require('./flow-layout.cjs');
function articleList(items,x,y,w,mobile=false){
 let b='',cursor=y;
 for(const a of items){
  b+='<g id="Article-'+a.date.replace('.','-')+'">';
  const tx=x+(mobile?0:80),yy=cursor;
  b+=line(x,yy,x+w);
  if(!mobile)b+=label(x,yy+41,a.date);
  const title=textBlock(tx,yy+(mobile?33:43),a.title,w-(mobile?38:120),mobile?19:25,C.ink,500,mobile?27:34);
  b+=title.svg+arrow(x+w-24,yy+(mobile?17:24),23);
  const metaY=yy+(mobile?33:43)+title.height;
  b+=t(tx,metaY,a.category+' / '+a.duration+(mobile?' / '+a.date:''),11,C.muted);
  cursor=metaY+31;
  b+='</g>';
 }
 return {svg:b+line(x,cursor,x+w),height:cursor-y};
}
function nowCard(data,x,y,w,mobile=false){
 const h=mobile?332:401;
 let b=r(x,y,w,h,8,C.accent)+label(x+27,y+34,'此刻 / NOW','#E0E6FF');
 b+=t(x+27,y+86,data.profile.motto[0],mobile?29:33,'#FFF',500)+t(x+27,y+129,data.profile.motto[1],mobile?29:33,'#FFF',500);
 data.now.forEach((item,i)=>{
  const yy=y+181+i*(mobile?39:52);
  b+=t(x+27,yy,item.label,11,'#D4DFFF')+t(x+77,yy,item.text,mobile?13:15,'#FFF',450);
 });
 b+=line(x+27,y+h-41,x+w-27,'#6A8BFF')+t(x+27,y+h-19,'2026.09 / 示例动态',10,'#DAE3FF');
 return {svg:b,height:h};
}
function interests(items,x,y,w,mobile=false){
 return grid(items,{x,y,width:w,columns:mobile?2:3,columnGap:mobile?16:24,rowGap:mobile?28:38},(a,xx,yy,cw)=>{
  const imageHeight=Math.round(cw*(mobile?.68:.50));
  let b=interestArt(a.icon,xx,yy,cw,imageHeight);
  const title=textBlock(xx,yy+imageHeight+(mobile?28:37),a.name,cw,mobile?18:22,C.ink,550,mobile?25:30);
  const descriptionY=yy+imageHeight+(mobile?28:37)+title.height;
  const description=textBlock(xx,descriptionY,a.description,cw,mobile?12:14,C.muted,400,mobile?19:22);
  b+=title.svg+description.svg;
  return {svg:'<g id="Interest-'+a.icon+'">'+b+'</g>',height:descriptionY-yy+description.height};
 });
}
function contact(profile,x,y,w,mobile=false){
 let b=line(x,y,x+w)+label(x,y+36,'打个招呼');
 b+=t(x,y+(mobile?90:119),mobile?'有个新想法？':'聊聊你的下个想法。',mobile?38:64,C.ink,500,'letter-spacing="-2"');
 b+=t(x,y+(mobile?126:161),mobile?'一起做点有趣的事。':'关于作品、技术，或只是打个招呼。',mobile?18:17,C.muted);
 b+=t(x,y+(mobile?183:214),profile.email,mobile?21:26,C.accent,500,'letter-spacing="-.4"');
 if(mobile)b+=arrow(x+w-31,y+162,29,C.accent);
 else b+=circle(x+w-65,y+123,62,C.accent)+arrow(x+w-92,y+96,54,'#FFF');
 return {svg:b,height:mobile?216:243};
}
module.exports={articleList,nowCard,interests,contact};

