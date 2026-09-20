const {C,t,r,line,circle}=require('./svg-kit.cjs');
// Original vector workspace, using the same restrained illustration language as the interests.
function workspaceArt(x,y,w,h){
 let b='';
 // Quiet architectural backdrop and a soft ground shadow.
 b+='<path d="M73 360V216C73 105 163 61 265 68c112 8 166 66 166 170v122Z" fill="#E4E9DD"/>';
 b+='<ellipse cx="255" cy="455" rx="196" ry="13" fill="#252B24" opacity=".045"/>';
 // A small window makes the composition feel like a lived-in creative corner.
 b+=r(322,83,97,126,45,'#F8F7F0','#C4CEBB');
 b+='<path d="M326 159q24-24 51-7t38 0v8q-25 20-45 3t-44 3Z" fill="#C5D4BE"/>';
 b+='<path d="M370 86v120M326 146h89" stroke="#C4CEBB" stroke-width="2"/>';
 b+=circle(394,119,10,'#E4CE91');
 // Desk surface and sturdy, quiet legs.
 b+='<path d="M69 379h17v70q0 6-6 6h-5q-6 0-6-6ZM425 379h17v70q0 6-6 6h-5q-6 0-6-6Z" fill="#C3B397"/>';
 b+='<path d="M65 326h359l49 41H29Z" fill="#DED1B8"/>';
 b+=r(29,364,444,15,6,'#CDBB99');
 // Monitor. The screen depicts a small original design-and-code workspace.
 b+=r(135,143,259,176,13,'#A8B0A1');
 b+=r(128,138,259,176,13,'#2B332D');
 b+=r(139,149,237,142,5,'#F7F7EF');
 b+=r(139,149,237,22,5,'#E6E9DF');
 b+=r(139,165,237,6,0,'#E6E9DF');
 [150,160,170].forEach((cx,i)=>b+=circle(cx,160,2.3,['#B6C4A8','#B6C4A8','#B6C4A8'][i]));
 b+=r(208,156,117,7,3,'#D3DACB');
 b+=r(139,171,115,120,0,'#303B34');
 b+=t(151,189,'< / >',12,'#DBEABD',600);
 [
  [151,202,22,'#99B8B0'],[179,202,49,'#DCE5C2'],[159,214,29,'#C2D099'],[194,214,42,'#91ACA0'],
  [159,226,44,'#DCE5C2'],[209,226,22,'#C1CCA9'],[167,238,21,'#A6C3B8'],[194,238,43,'#DCE5C2'],
  [159,250,31,'#A6C3B8'],[197,250,26,'#C2D099'],[151,262,17,'#91ACA0']
 ].forEach(([xx,yy,ww,c])=>b+=r(xx,yy,ww,3,1.5,c));
 // Preview panel, deliberately restrained and legible as an interface at small sizes.
 b+=r(268,183,94,45,5,'#D4DFC8')+circle(339,197,8,'#EEF2E4');
 b+=t(276,203,'Hello, idea.',10,'#344030',600)+r(276,212,44,3,1.5,'#ABBBA0');
 b+=r(268,238,44,34,4,'#E8DCC3')+r(319,238,43,34,4,'#CDD9EF');
 b+=r(275,246,23,3,1.5,'#C3B28B')+r(326,246,25,3,1.5,'#9DAFD0');
 b+=r(275,254,30,2,1,'#D2C4A4')+r(326,254,20,2,1,'#B2BFD8');
 b+=circle(257,302,3,'#727F6D');
 b+='<path d="M241 314h32l4 27h-40Z" fill="#B3BAAC"/>';
 b+='<path d="M236 338h42l16 10q2 3-3 4h-67q-5-1-3-4Z" fill="#D7DACD" stroke="#AEB7A4"/>';
 // Keyboard and a subtle blue notebook tie into the site's accent.
 b+='<g transform="translate(160,355) skewX(-16)">'+r(0,0,181,25,4,'#F0F0E6','#BBC2B2');
 for(let row=0;row<3;row++)for(let col=0;col<12;col++) b+=r(7+col*14,4+row*6,10,3,1,'#CDD3C6');
 b+='</g>';
 b+='<g transform="translate(43,324) rotate(-8,44,22)">';
 b+=r(3,4,82,44,3,'#AFBDAF')+r(0,0,82,42,3,C.accent)+r(7,0,2,42,0,'#7792EF')+line(22,14,66,'#A3B6FB')+line(22,21,53,'#A3B6FB');
 b+='<path d="M61 1v42" stroke="#173AAD" stroke-width="3"/>';
 b+='</g>';
 // Mug with handle, and a small plant. No personal objects or branded hardware.
 b+='<path d="M111 302h7q11 0 11 12t-13 12h-5" fill="none" stroke="#BEA271" stroke-width="6"/>';
 b+='<path d="M83 294h31v29q0 10-15 10t-16-10Z" fill="#E2C790"/>';
 b+='<ellipse cx="98.5" cy="295" rx="15.5" ry="5" fill="#AF9160"/><ellipse cx="98.5" cy="295" rx="11" ry="3" fill="#6A5844"/>';
 b+='<path d="M437 320q-6-41-3-73m1 40q-14-12-19-21m20 37q14-22 24-27" fill="none" stroke="#607A56" stroke-width="3" stroke-linecap="round"/>';
 b+='<path d="M433 266q-25-17-13-42 24 11 13 42Z" fill="#7C966A"/><path d="M435 285q1-29 25-33 4 27-25 33Z" fill="#91A67A"/><path d="M432 304q-25-1-29-23 23-5 29 23Z" fill="#6F885E"/><path d="M440 302q6-20 26-19-1 20-26 19Z" fill="#A3B58A"/>';
 b+='<path d="M418 313h42l-6 36q-1 5-15 5t-16-5Z" fill="#D7DCCB"/>';
 b+='<ellipse cx="439" cy="313" rx="21" ry="5" fill="#B9C2AA"/><path d="M437 313v-12" stroke="#607A56" stroke-width="3"/>';
 return `<svg id="Illustration-creative-workspace" x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 500 480">${b}</svg>`;
}
function projectArt(kind,x,y,w,h){
 let b='';
 if(kind==='notes'){
  b=r(0,0,720,400,0,'#DDE5D5');
  b+=circle(678,45,176,'#D2DDC6')+circle(16,401,148,'none','#BECBB2');
  b+='<g transform="translate(91,64) rotate(-5,270,140)">';
  b+=r(6,14,542,290,10,'#BCC8AF')+r(0,0,542,290,10,'#FDFCF8');
  b+=r(0,0,128,290,10,'#ECEFE5')+t(20,36,'paper.',22,C.ink,650);
  b+=r(12,62,104,31,5,'#D5DFC7')+t(23,83,'所有笔记',12,C.ink,550)+t(23,116,'灵感收藏',12,C.muted)+t(23,149,'随手记录',12,C.muted);
  b+=t(155,49,'给灵感，一个栖息地。',24,C.ink,600)+t(155,77,'写下此刻，留给未来。',12,C.muted);
  [{x:156,c:'#F4EDDA',s:'灵感碎片',body:'从一个小想法开始'},{x:282,c:'#E6ECD9',s:'今日阅读',body:'慢慢读，也慢慢想'},{x:408,c:'#E5EAF6',s:'生活随记',body:'发现日常的好看'}].forEach(a=>{
   b+=r(a.x,107,111,137,5,a.c)+t(a.x+12,133,a.s,12,C.ink,600)+t(a.x+12,158,a.body,9,C.muted);
   b+=line(a.x+12,180,a.x+95,'#C5C9BC')+line(a.x+12,197,a.x+82,'#C5C9BC')+circle(a.x+16,226,3,'#86957D');
  });
  b+='</g>';
 }else if(kind==='palette'){
  b=r(0,0,720,400,0,'#E7DAD1');
  b+='<g transform="translate(115,65) rotate(-4,245,145)">';
  b+=r(9,10,490,272,9,'#C8B7AD')+r(0,0,490,272,9,'#FBF8F0');
  b+=t(27,47,'Palette Lab',25,C.ink,600)+t(27,76,'从日常里，找到新的颜色。',13,C.muted);
  ['#293C37','#84977D','#DDE5CD','#E7C896','#D87959'].forEach((color,i)=>{
   b+=r(27+i*89,103,80,116,4,color)+t(27+i*89,240,color,9,C.muted);
  });
  b+='</g>';
 }else if(kind==='tasks'){
  b=r(0,0,720,400,0,'#D8D7EB');
  b+='<g transform="translate(122,44) rotate(4,235,150)">'+r(8,9,470,304,10,'#BDBBD6')+r(0,0,470,304,10,'#F8F7F1');
  b+=t(28,47,'Little Tasks',26,C.ink,600)+t(28,77,'让一天，从一件小事开始。',13,C.muted);
  ['记录一个新想法','完成今天的小作品','出门走走，看看天空'].forEach((s,i)=>{
   b+=r(26,104+i*57,418,44,6,i===0?'#E0E8D6':'#EEEDE6')+r(41,118+i*57,15,15,4,i===0?'#6A845C':'none','#A4B298')+t(72,130+i*57,s,15,C.ink);
  });
  b+='</g>';
 }else if(kind==='journal'){
  b=r(0,0,720,400,0,'#CEDACD');
  b+='<g transform="translate(109,38) rotate(-5,250,158)">'+r(8,10,502,316,7,'#A4B49E')+r(0,0,502,316,7,'#F8F6EC');
  b+=t(25,42,'Photo Journal',23,C.ink,600)+r(25,64,452,199,3,'#BCCCBD');
  b+=circle(390,104,23,'#EBE8C7')+'<path d="M25 205 140 102 274 210 381 154 477 208v55H25Z" fill="#87A08C"/><path d="M25 248 148 178 306 243 477 187v76H25Z" fill="#547862"/>';
  b+=t(25,289,'走慢一点，留意日常的光。',13,C.muted)+'</g>';
 }else{
  b=r(0,0,720,400,0,'#BACDF4');
  b+='<path d="M0 346Q210 159 720 222V400H0Z" fill="#ABC1EC"/>';
  b+='<g transform="translate(148,25) rotate(7,210,180)">';
  b+=r(9,12,414,353,26,'#849BC5')+r(0,0,414,353,26,'#232D39');
  b+=t(28,38,'Focus Timer',15,'#E8EDF7',500)+circle(378,32,4,'#B3D986');
  b+=circle(207,167,93,'none','#4B5C6B');
  b+='<path d="M207 74A93 93 0 1 1 130 219" fill="none" stroke="#DDEEB5" stroke-width="5" stroke-linecap="round"/>';
  b+=t(207,181,'25:00',56,'#F8FAF1',400,'text-anchor="middle" letter-spacing="-2"')+t(207,211,'留一点时间，专注当下。',11,'#A9B7C5',400,'text-anchor="middle"');
  b+=r(131,286,152,38,19,'#DFEDBE')+t(207,311,'开始专注',13,'#283329',550,'text-anchor="middle"');
  b+='</g>';
 }
 return `<svg id="Cover-${kind}" x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 720 400" preserveAspectRatio="xMidYMid slice">${b}</svg>`;
}
function interestArt(kind,x,y,w,h){
 let b='';
 if(kind==='camera'){
  b=r(0,0,400,200,0,'#C7D3C6')+circle(306,49,24,'#EEF0D7');
  b+='<path d="M0 121 89 72 203 133 304 68 400 127V200H0Z" fill="#819A87"/><path d="M0 171 124 112 259 177 400 112V200H0Z" fill="#526D5D"/>';
  b+='<g transform="translate(114,63) rotate(-8,86,50)">'+r(0,0,170,107,10,'#F0F0E9')+r(5,24,160,64,6,'#29372F')+circle(87,55,39,'#17251C','#8D9A8C')+circle(87,55,26,'#647564')+circle(87,55,19,'#263B35')+circle(82,48,7,'#8B9F92')+r(19,-8,28,9,2,'#314039')+r(133,8,20,8,1,'#D2DACC')+'</g>';
 }else if(kind==='book'){
  b=r(0,0,400,200,0,'#E8DDC7');
  b+='<g transform="translate(160,45) rotate(17,60,68)">'+r(6,8,107,140,3,'#B7AA92')+r(0,0,107,140,3,'#EDEBDC')+r(0,0,8,140,2,'#D3CDBA')+'</g>';
  b+='<g transform="translate(116,29) rotate(-12,60,68)">'+r(0,0,107,140,3,'#DC5A39')+t(15,42,'SLOW',22,'#F9E9C8',750)+t(15,67,'LITTLE',20,'#F9E9C8',750)+t(15,92,'DAYS',22,'#F9E9C8',750)+line(15,107,89,'#F6CBAD')+t(15,124,'示例书封',7,'#F9E9C8')+'</g>';
 }else if(kind==='music'){
  b=r(0,0,400,200,0,'#D9C9C0');
  b+=circle(242,104,78,'#343B37')+circle(242,104,61,'none','#59625A')+circle(242,104,49,'none','#59625A')+circle(242,104,27,'#D9C995')+circle(242,104,5,'#343B37');
  b+='<g transform="translate(91,28) rotate(-9,67,72)">'+r(0,0,132,145,3,'#718973')+circle(66,66,39,'#C9D5B8')+t(66,124,'SLOW SOUNDS',11,'#F7F4E8',550,'text-anchor="middle"')+'</g>';
 }else if(kind==='walk'){
  b=r(0,0,400,200,0,'#CBDCE0')+circle(304,48,26,'#F3E3B7');
  b+='<path d="M0 120 99 54 203 142 305 79 400 124v76H0Z" fill="#93ACA1"/><path d="M0 166 124 108 275 172 400 130v70H0Z" fill="#688C77"/><path d="M250 200c-58-29-82-27-77-49 3-14 31-20 32-28-27 11-51 16-56 34-5 23 12 34 38 43Z" fill="#DFD6B8"/>';
 }else{
  b=r(0,0,400,200,0,'#CDCBE4');
  b+=circle(282,38,44,'none','#AFABC9')+circle(75,164,61,'none','#B2AFCC');
  b+='<g transform="translate(114,40) rotate(9,88,60)" fill="#EEEFF2" stroke="#A7A5BB" stroke-width="2"><path d="M46 14h84c26 0 39 20 42 44l8 45c4 29-16 34-34 15l-24-24H51l-24 24C9 137-11 132-7 103l8-45C4 34 20 14 46 14Z"/><path d="M33 43v31m-15-16h31" stroke="#545270" stroke-width="9" stroke-linecap="round"/><circle cx="135" cy="43" r="6" fill="#E79663" stroke="none"/><circle cx="149" cy="57" r="6" fill="#8D8ACD" stroke="none"/><circle cx="135" cy="72" r="6" fill="#88A188" stroke="none"/><circle cx="120" cy="57" r="6" fill="#DB8F98" stroke="none"/><circle cx="72" cy="80" r="12" fill="#636479"/><circle cx="104" cy="80" r="12" fill="#636479"/></g>';
 }
 return `<svg id="Artwork-${kind}" x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">${b}</svg>`;
}
module.exports={workspaceArt,projectArt,interestArt};

