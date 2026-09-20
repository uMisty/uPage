const C = { bg:'#F5F3ED', ink:'#242822', muted:'#71766C', accent:'#2853E8', line:'#D5D8CF', dark:'#242B26', soft:'#DFE6D5' };
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const t=(x,y,s,size=20,fill=C.ink,weight=400,extra='')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${weight}" ${extra}>${esc(s)}</text>`;
const r=(x,y,w,h,rad,fill,stroke='none')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rad}" fill="${fill}" stroke="${stroke}"/>`;
const line=(x,y,end,color=C.line)=>`<path d="M${x} ${y}H${end}" fill="none" stroke="${color}"/>`;
const arrow=(x,y,size=20,color=C.ink)=>`<g transform="translate(${x},${y}) scale(${size/24})" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19 19 5M5 5h14v14"/></g>`;
const circle=(x,y,rad,fill,stroke='none')=>`<circle cx="${x}" cy="${y}" r="${rad}" fill="${fill}" stroke="${stroke}"/>`;
const star=(x,y,s,color=C.accent)=>`<g transform="translate(${x},${y})" stroke="${color}" stroke-width="${s*.13}">${[0,45,90,135].map(a=>`<path d="M${-s/2} 0H${s/2}" transform="rotate(${a})"/>`).join('')}</g>`;
const label=(x,y,s,color=C.muted)=>t(x,y,s,12,color,500,'letter-spacing="1.2"');
const wrap=(w,h,name,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc"><title id="title">uPage — ${esc(name)}</title><desc id="desc">公共个人主页模板。Alex 为虚构示例；项目、文章与联系信息均为占位内容。静态界面设计稿。</desc><g font-family="Segoe UI,Microsoft YaHei,Noto Sans CJK SC,Arial,sans-serif">${r(0,0,w,h,0,C.bg)}${body}</g></svg>\n`;
module.exports={C,t,r,line,arrow,circle,star,label,wrap};

