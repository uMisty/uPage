await figma.loadFontAsync({family:'Noto Sans SC'});
const page=await figma.getNodeByIdAsync(target.pageId);
await figma.setCurrentPageAsync(page);
const wrapper=await figma.getNodeByIdAsync(target.wrapperId);
const imported=figma.createNodeFromSvg(payload.svg);
imported.name=payload.name;
wrapper.appendChild(imported);
imported.clipsContent=!!target.asset;
if(target.asset){imported.x=target.x;imported.y=target.y;}else imported.fills=[{type:'SOLID',color:{r:245/255,g:243/255,b:237/255}}];
imported.exportSettings=[{format:'PNG',constraint:{type:'SCALE',value:2},suffix:'@2x'},{format:'SVG',svgOutlineText:false,svgIdAttribute:true}];
const texts=imported.findAllWithCriteria({types:['TEXT']});
if(texts.length!==payload.texts.length)throw new Error('Text count mismatch: '+texts.length+' / '+payload.texts.length);
const corrections=[];
for(let i=0;i<texts.length;i++){
 const text=texts[i],spec=payload.texts[i];
 if(text.characters!==spec.text)throw new Error('Text order mismatch: '+text.characters+' / '+spec.text);
 const oldWidth=text.width;
 text.fontName={family:'Noto Sans SC',variationSettings:{wght:spec.weight}};
 text.letterSpacing={unit:'PIXELS',value:spec.spacing*(text.fontSize/spec.size)};
 if(spec.anchor==='end')text.x+=oldWidth-text.width;
 if(spec.anchor==='middle')text.x+=(oldWidth-text.width)/2;
 text.name='文案 / '+spec.text;
}
const links=[];
for(const link of payload.links){
 const node=imported.findOne(n=>n.name===link.name);
 if(!node)throw new Error('Missing action group: '+link.name);
 await node.setReactionsAsync([{trigger:{type:'ON_CLICK'},actions:[{type:'URL',url:link.url,openInNewTab:true}]}]);
 node.name=(link.name.endsWith('Demo')?'体验 Demo / ':'GitHub 源码 / ')+link.name.split('-')[1];
 links.push({id:node.id,url:link.url});
}
let vectorIndex=0,groupIndex=0;
for(const node of imported.findAll(()=>true)){
 if(node.type==='VECTOR'&&node.name==='Vector')node.name='矢量 / '+String(++vectorIndex).padStart(3,'0');
 if(node.name==='Group')node.name='图形组 / '+String(++groupIndex).padStart(2,'0');
 if(/^(Illustration-|Cover-|Artwork-)/.test(node.name))node.exportSettings=[{format:'SVG',svgOutlineText:false,svgIdAttribute:true},{format:'PNG',constraint:{type:'SCALE',value:2},suffix:'@2x'}];
}
const created=[imported.id,...imported.findAll(()=>true).map(n=>n.id)];
if(target.asset){const caption=figma.createText();caption.fontName={family:'Noto Sans SC',style:'Regular'};caption.fontSize=14;caption.characters=payload.name;caption.name='素材名称 / '+payload.name;caption.fills=[{type:'SOLID',color:{r:.14,g:.16,b:.13}}];wrapper.appendChild(caption);caption.x=target.x;caption.y=target.y-34;created.push(caption.id);}
if(target.gap){const gap=figma.createFrame();gap.name='段落间距 / '+target.gap;gap.resize(payload.width,target.gap);gap.fills=[];wrapper.appendChild(gap);created.push(gap.id);}
if(target.screenshot)await imported.screenshot({scale:Math.min(1,1200/payload.width)});
return {createdNodeIds:created,mutatedNodeIds:[wrapper.id],sectionId:imported.id,name:imported.name,width:imported.width,height:imported.height,textCount:texts.length,links};
