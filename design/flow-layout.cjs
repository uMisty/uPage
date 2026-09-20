const {t}=require('./svg-kit.cjs');
// Conservative text measurements keep configurable copy inside each SVG column.
function widthOf(text,size){
 return [...String(text)].reduce((sum,ch)=>sum+(/\s/u.test(ch)?.34:/[\u2e80-\u9fff\uff00-\uffef]/u.test(ch)?1.02:/[ilI.,'!|]/.test(ch)?.29:/[MW@]/.test(ch)?.88:.62)*size,0);
}
function wrapLines(text,width,size){
 const lines=[];
 for(const paragraph of String(text).split('\n')){
  let current='';
  const tokens=paragraph.match(/[\u2e80-\u9fff\uff00-\uffef]|\s+|[^\s\u2e80-\u9fff\uff00-\uffef]+/gu)||[''];
  for(const token of tokens){
   if(current&&widthOf(current+token,size)>width){lines.push(current.trimEnd());current='';}
   if(widthOf(token,size)>width){
    for(const ch of token){
     if(current&&widthOf(current+ch,size)>width){lines.push(current);current='';}
     current+=ch;
    }
   }else current+=(current?token:token.trimStart());
  }
  if(current||!paragraph)lines.push(current.trimEnd());
 }
 return lines;
}
function textBlock(x,y,text,width,size,fill,weight=400,lineHeight=Math.round(size*1.5)){
 const lines=wrapLines(text,width,size);
 return {svg:lines.map((s,i)=>t(x,y+i*lineHeight,s,size,fill,weight)).join(''),height:lines.length*lineHeight,lines};
}
// Rows take the height of their tallest item; incomplete rows stay left aligned.
function grid(items,{x,y,width,columns,columnGap=24,rowGap=32},render){
 if(!items.length)return {svg:'',height:0,rows:0};
 const cellWidth=(width-columnGap*(columns-1))/columns;
 let cursor=y,svg='';
 for(let start=0;start<items.length;start+=columns){
  const row=items.slice(start,start+columns).map((item,i)=>render(item,x+i*(cellWidth+columnGap),cursor,cellWidth,start+i));
  for(const result of row){
   if(!Number.isFinite(result.height)||result.height<0)throw new Error('Invalid flow height');
   svg+=result.svg;
  }
  cursor+=Math.max(...row.map(a=>a.height));
  if(start+columns<items.length)cursor+=rowGap;
 }
 return {svg,height:cursor-y,rows:Math.ceil(items.length/columns)};
}
module.exports={grid,textBlock,wrapLines};

