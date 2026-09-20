const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const {C,t,line,arrow,label,wrap}=require('./svg-kit.cjs');
const {hero,works,writing,life}=require('./render-layouts.cjs');
const {toolCard}=require('./toolkit.cjs');
const {contact}=require('./panels.cjs');
const {workspaceArt,projectArt,interestArt}=require('./editorial-art.cjs');
const basic=require('./demo-content.json'),expanded=require('./demo-expanded-content.json');
const root=path.join(__dirname,'figma-package');
const screens=[],assets=[];
const plain=(w,h,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" overflow="visible"><g font-family="Segoe UI,Microsoft YaHei,Noto Sans CJK SC,Arial,sans-serif">${body}</g></svg>`;
function addAsset(name,w,h,body){assets.push({name,width:w,height:h,svg:plain(w,h,body)});}
function makeScreen(base,name,mobile,mode){
 const width=mobile?390:1440,x=mobile?24:88,cw=width-x*2;
 const data=mode==='expanded'||mode==='projects'?expanded:basic;
 const sections=[];
 const add=(name,block,gap=0)=>{sections.push({name,width,height:block.height,svg:plain(width,block.height,block.svg)});if(gap)sections.push({name:'Spacing / '+gap,width,height:gap,spacer:true});};
 const tail=()=>{
  const gap=mobile?48:72;
  add('文字与近况',writing(data,x,0,cw,mobile),gap);
  add('创作工具',toolCard(x,0,cw,data.toolGroups,mobile),gap);
  add('代码之外',life(data,x,0,cw,mobile),gap);
  add('联系',contact(data.profile,x,0,cw,mobile),mobile?28:42);
  add('页脚',{height:60,svg:line(x,0,x+cw)+t(x,29,'© 2026 '+data.profile.name+' · 公共示例',mobile?10:11,C.muted)+t(x+cw,29,'example.com',mobile?10:11,C.muted,400,'text-anchor="end"')});
 };
 if(mode==='full'){add('自我介绍',hero(data,mobile),mobile?44:64);add('精选项目',works(data,x,0,cw,mobile),mobile?48:72);tail();}
 else if(mode==='hero'){add('自我介绍',hero(data,mobile),32);}
 else if(mode==='lower'){add('顶部留白',{height:32,svg:''});tail();}
 else if(mode==='projects'){add('顶部留白',{height:mobile?24:32,svg:''});add('精选项目',works(data,x,0,cw,mobile),mobile?24:32);}
 else if(mode==='expanded'){
  add('扩展示例说明',{height:mobile?86:104,svg:label(x,40,'多内容排版示例 · 全部为虚构内容')});
  add('精选项目',works(data,x,0,cw,mobile),mobile?50:76);
  add('创作工具',toolCard(x,0,cw,data.toolGroups,mobile),mobile?50:76);
  add('代码之外',life(data,x,0,cw,mobile),mobile?50:76);
 }
 screens.push({base,name,width,height:sections.reduce((s,v)=>s+v.height,0),sections});
}
async function main(){
 fs.mkdirSync(path.join(root,'assets'),{recursive:true});fs.mkdirSync(path.join(root,'sections'),{recursive:true});
 makeScreen('profile-desktop-demo','完整页面 / 桌面 1440',false,'full');
 makeScreen('profile-mobile-demo','完整页面 / 移动 390',true,'full');
 makeScreen('layout-expansion-desktop','多内容排列 / 桌面 1440',false,'expanded');
 makeScreen('layout-expansion-mobile','多内容排列 / 移动 390',true,'expanded');
 makeScreen('profile-hero-desktop','首屏 / 桌面 1440',false,'hero');
 makeScreen('profile-hero-mobile','首屏 / 移动 390',true,'hero');
 makeScreen('profile-lower-desktop','内容与生活 / 桌面 1440',false,'lower');
 makeScreen('projects-desktop','项目模块 / 桌面 1440',false,'projects');
 makeScreen('projects-mobile','项目模块 / 移动 390',true,'projects');
 for(const mobile of [false,true]){
  const width=mobile?390:1312,block=toolCard(24,24, mobile?342:1264,basic.toolGroups,mobile);
  screens.push({base:'tech-tools-'+(mobile?'mobile':'desktop'),name:'创作工具 / '+(mobile?'移动 390':'桌面 1312'),width,height:block.height+48,sections:[{name:'创作工具',width,height:block.height+48,svg:plain(width,block.height+48,block.svg)}]});
 }
 addAsset('hero-creative-workspace',500,480,workspaceArt(0,0,500,480));
 for(const kind of ['notes','timer','palette','tasks','journal'])addAsset('project-'+kind,720,400,projectArt(kind,0,0,720,400));
 for(const kind of ['camera','book','game','music','walk'])addAsset('interest-'+kind,400,200,interestArt(kind,0,0,400,200));
 for(const name of ['react','vuedotjs','typescript','nodedotjs','figma','git']){
  const s=fs.readFileSync(path.join(__dirname,'assets','icons',name+'.svg'),'utf8');
  addAsset('icon-'+name,24,24,'<g fill="#DDEABE">'+s.match(/<path\b[^>]*\/>/g).join('')+'</g>');
 }
 addAsset('icon-arrow-up-right-ink',24,24,arrow(0,0,24,C.ink));
 addAsset('icon-arrow-up-right-white',24,24,arrow(0,0,24,'#FFFFFF'));
 for(const s of screens){let y=0,b='';for(let i=0;i<s.sections.length;i++){
  const item=s.sections[i];item.key=s.base+'-'+String(i).padStart(2,'0');item.y=y;
  if(item.svg){fs.writeFileSync(path.join(root,'sections',item.key+'.svg'),item.svg);b+=`<g transform="translate(0 ${y})">${item.svg}</g>`;}y+=item.height;
 }fs.writeFileSync(path.join(root,s.base+'.svg'),wrap(s.width,s.height,s.name,b));}
 for(const a of assets){fs.writeFileSync(path.join(root,'assets',a.name+'.svg'),a.svg);await sharp(Buffer.from(a.svg),{density:144}).png().toFile(path.join(root,'assets',a.name+'@2x.png'));}
 const manifest={version:1,privacy:'All profile and project content is fictional. Links use example.com placeholders.',fonts:['Segoe UI','Microsoft YaHei','Noto Sans CJK SC'],colors:C,screens,assets};
 fs.writeFileSync(path.join(root,'manifest.json'),JSON.stringify(manifest,null,2));
 console.log(JSON.stringify({screens:screens.map(s=>({name:s.name,width:s.width,height:s.height,sections:s.sections.filter(v=>v.svg).length})),assets:assets.length}));
}
main().catch(e=>{console.error(e);process.exitCode=1});
