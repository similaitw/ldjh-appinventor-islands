// ======================================================================
// App Inventor 模擬操作台：畫面（Blockly 積木區、模擬手機、設計師）
// ======================================================================
(function(){
'use strict';
const K = window.AI2CORE;
const {SPEC,DESIGN_ONLY,COLORS,LABS,H,Runtime,flat,clone,fmt,propSpec,evSpec,mSpec} = K;
const BL_VER = '11.2.1';
const URLS = {
  blockly:`https://unpkg.com/blockly@${BL_VER}/blockly_compressed.js`,
  msg:`https://unpkg.com/blockly@${BL_VER}/msg/zh-hant.js`,
  media:`https://unpkg.com/blockly@${BL_VER}/media/`,
  jszip:'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
};
const COL = { event:'#c88330', set:'#266643', get:'#439970', method:'#7c5385', control:'#e1a91a', logic:'#77ab41', math:'#3f71b5',
  text:'#b32d5e', lists:'#49a6d4', colors:'#7d7d7d', vars:'#d05f2d', procs:'#7c5385' };
const esc = s => String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const loaded = {};
function loadScript(src){ return loaded[src] || (loaded[src] = new Promise((ok,bad)=>{ const s=document.createElement('script'); s.src=src; s.onload=ok; s.onerror=()=>{ delete loaded[src]; bad(new Error('載入失敗：'+src)); }; document.head.appendChild(s); })); }
async function loadBlockly(){ if(!window.Blockly) await loadScript(URLS.blockly); await loadScript(URLS.msg); defineBlocks(); }

// 目前開著的練習（積木的元件下拉選單要用）
let LAB = null;   // {key, comps, ws}
const typesOf = () => { const m={Screen1:'Form'}; if(LAB) flat(LAB.comps).forEach(c=>m[c.name]=c.type); return m; };

// ---------------- 積木定義 ----------------
let defined = false;
function defineBlocks(){
  if(defined) return; defined = true;
  const B = Blockly.Blocks;
  const clear = blk => { [...blk.inputList].forEach(i=>blk.removeInput(i.name)); };
  const sw = hex => 'data:image/svg+xml;utf8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="14"><rect x="0.5" y="0.5" width="17" height="13" rx="2" fill="${hex}" stroke="#fff"/></svg>`);
  function compField(blk){
    const inst=blk.state_.inst; blk._b=true;
    const f = new Blockly.FieldDropdown(()=>{ const t=blk.state_.ctype, m=typesOf(); const o=Object.keys(m).filter(n=>m[n]===t).map(n=>[n,n]); if(!o.find(x=>x[1]===blk.state_.inst)) o.unshift([blk.state_.inst,blk.state_.inst]); return o; },
      v=>{ if(!blk._b) blk.state_.inst=v; return v; });
    blk.state_.inst=inst; f.setValue(inst); blk._b=false;
    return f;
  }
  const withState = (o) => Object.assign({ saveExtraState(){ return this.state_; }, loadExtraState(s){ this.state_=Object.assign({},s); this.build_(); } }, o);

  B.component_event = withState({ init(){ this.setColour(COL.event); this.state_={ctype:'Form',inst:'Screen1',name:'Initialize'}; this.build_(); },
    build_(){ clear(this); const s=this.state_, ev=evSpec(s.ctype,s.name)||{zh:s.name};
      const d=this.appendDummyInput('HEAD').appendField('當').appendField(compField(this),'COMPONENT_SELECTOR').appendField('.'+ev.zh);
      if(ev.params) d.appendField(new Blockly.FieldLabel('（'+ev.params.map(p=>p[1]).join('、')+'）'));
      this.appendStatementInput('DO').appendField('執行'); this.setTooltip('事件：'+ev.zh+'時，執行裡面的積木'); } });
  B.component_set_get = withState({ init(){ this.state_={ctype:'Label',inst:'Label1',prop:'Text',mode:'get'}; this.build_(); },
    build_(){ clear(this); const s=this.state_, sp=propSpec(s.ctype,s.prop); const zh=sp[1]||s.prop;
      if(s.mode==='set'){ this.setColour(COL.set); this.setOutput(false); this.setPreviousStatement(true); this.setNextStatement(true);
        this.appendValueInput('VALUE').appendField('設').appendField(compField(this),'COMPONENT_SELECTOR').appendField('.'+zh+'　為'); }
      else { this.setColour(COL.get); this.setPreviousStatement(false); this.setNextStatement(false); this.setOutput(true);
        this.appendDummyInput('HEAD').appendField(compField(this),'COMPONENT_SELECTOR').appendField('.'+zh); } } });
  B.component_method = withState({ init(){ this.setColour(COL.method); this.state_={ctype:'Notifier',inst:'Notifier1',name:'ShowAlert',ret:false}; this.build_(); },
    build_(){ clear(this); const s=this.state_, m=mSpec(s.ctype,s.name)||{zh:s.name,args:[]};
      if(s.ret){ this.setPreviousStatement(false); this.setNextStatement(false); this.setOutput(true); } else { this.setOutput(false); this.setPreviousStatement(true); this.setNextStatement(true); }
      this.appendDummyInput('HEAD').appendField('呼叫').appendField(compField(this),'COMPONENT_SELECTOR').appendField('.'+m.zh);
      m.args.forEach((a,i)=>this.appendValueInput('ARG'+i).setAlign(Blockly.inputs.Align.RIGHT).appendField(a[1]));
      this.setInputsInline(false); } });

  // 內建：文字
  B.text = { init(){ this.setColour(COL.text); this.setOutput(true); this.appendDummyInput('T').appendField('"').appendField(new Blockly.FieldTextInput(''),'TEXT').appendField('"'); } };
  B.text_join = withState({ init(){ this.setColour(COL.text); this.setOutput(true); this.state_={items:2}; this.build_(); },
    build_(){ clear(this); for(let i=0;i<this.state_.items;i++){ const inp=this.appendValueInput('ADD'+i); if(i===0) inp.appendField('合併文字'); } this.setInputsInline(false); } });
  B.text_length = { init(){ this.setColour(COL.text); this.setOutput(true); this.appendValueInput('VALUE').appendField('求文字長度'); } };
  B.text_isEmpty = { init(){ this.setColour(COL.text); this.setOutput(true); this.appendValueInput('VALUE').appendField('是否為空'); } };
  B.text_compare = { init(){ this.setColour(COL.text); this.setOutput(true); this.appendValueInput('TEXT1').appendField('文字比較');
    this.appendValueInput('TEXT2').appendField(new Blockly.FieldDropdown([['=','EQUAL'],['≠','NEQ'],['<','LT'],['>','GT']]),'OP'); this.setInputsInline(true); } };
  B.text_changeCase = { init(){ this.setColour(COL.text); this.setOutput(true); this.appendValueInput('TEXT').appendField(new Blockly.FieldDropdown([['大寫','UPCASE'],['小寫','DOWNCASE']]),'OP'); } };
  B.text_split = { init(){ this.setColour(COL.text); this.setOutput(true); this.appendValueInput('TEXT').appendField('分解　文字'); this.appendValueInput('AT').setAlign(Blockly.inputs.Align.RIGHT).appendField('分隔符號'); } };
  // 數學
  const numV = v => /^-?\d*\.?\d*$/.test(v)?v:null;
  B.math_number = { init(){ this.setColour(COL.math); this.setOutput(true); this.appendDummyInput('N').appendField(new Blockly.FieldTextInput('0',numV),'NUM'); } };
  const multi = (sym) => withState({ init(){ this.setColour(COL.math); this.setOutput(true); this.state_={items:2}; this.build_(); },
    build_(){ clear(this); for(let i=0;i<this.state_.items;i++){ const inp=this.appendValueInput('NUM'+i); if(i>0) inp.appendField(sym); } this.setInputsInline(true); } });
  B.math_add = multi('+'); B.math_multiply = multi('×');
  const bin = (sym) => ({ init(){ this.setColour(COL.math); this.setOutput(true); this.appendValueInput('A'); this.appendValueInput('B').appendField(sym); this.setInputsInline(true); } });
  B.math_subtract = bin('−'); B.math_division = bin('÷'); B.math_power = bin('^');
  B.math_compare = { init(){ this.setColour(COL.math); this.setOutput(true); this.appendValueInput('A');
    this.appendValueInput('B').appendField(new Blockly.FieldDropdown([['=','EQ'],['≠','NEQ'],['<','LT'],['≤','LTE'],['>','GT'],['≥','GTE']]),'OP'); this.setInputsInline(true); } };
  B.math_random_int = { init(){ this.setColour(COL.math); this.setOutput(true); this.appendValueInput('FROM').appendField('從'); this.appendValueInput('TO').appendField('到'); this.appendDummyInput('E').appendField('之間的隨機整數'); this.setInputsInline(true); } };
  B.math_divide = { init(){ this.setColour(COL.math); this.setOutput(true); this.appendValueInput('DIVIDEND').appendField(new Blockly.FieldDropdown([['模數','MODULO'],['餘數','REMAINDER'],['商數','QUOTIENT']]),'OP');
    this.appendValueInput('DIVISOR').appendField('÷'); this.setInputsInline(true); } };
  B.math_format_as_decimal = { init(){ this.setColour(COL.math); this.setOutput(true); this.appendValueInput('NUM').appendField('將數字'); this.appendValueInput('PLACES').appendField('設為小數形式，位數'); this.setInputsInline(true); } };
  B.math_is_a_number = { init(){ this.setColour(COL.math); this.setOutput(true); this.appendValueInput('NUM').appendField('是否為數字？'); } };
  // 邏輯
  B.logic_boolean = { init(){ this.setColour(COL.logic); this.setOutput(true); this.appendDummyInput('B').appendField(new Blockly.FieldDropdown([['真','TRUE'],['假','FALSE']]),'BOOL'); } };
  B.logic_operation = { init(){ this.setColour(COL.logic); this.setOutput(true); this.appendValueInput('A'); this.appendValueInput('B').appendField(new Blockly.FieldDropdown([['與','AND'],['或','OR']]),'OP'); this.setInputsInline(true); } };
  B.logic_negate = { init(){ this.setColour(COL.logic); this.setOutput(true); this.appendValueInput('BOOL').appendField('非'); } };
  // 顏色
  COLORS.forEach(([id,zh,hex])=>{ B['color_'+id] = { init(){ this.setColour(COL.colors); this.setOutput(true); this.appendDummyInput('C').appendField(new Blockly.FieldImage(sw(hex),18,14,zh)).appendField(zh); } }; });
  // 控制
  B.controls_if = withState({ init(){ this.setColour(COL.control); this.setPreviousStatement(true); this.setNextStatement(true); this.state_={elseif:0,else:0}; this.build_(); },
    build_(){ clear(this); const n=(this.state_.elseif||0)+1;
      for(let i=0;i<n;i++){ this.appendValueInput('IF'+i).appendField(i?'否則，如果':'如果'); this.appendStatementInput('DO'+i).appendField('則'); }
      if(this.state_.else) this.appendStatementInput('ELSE').appendField('否則'); } });
  B.controls_forRange = { init(){ this.setColour(COL.control); this.setPreviousStatement(true); this.setNextStatement(true);
    this.appendValueInput('START').appendField('對每個').appendField(new Blockly.FieldTextInput('數字'),'VAR').appendField('範圍從');
    this.appendValueInput('END').setAlign(Blockly.inputs.Align.RIGHT).appendField('到'); this.appendValueInput('STEP').setAlign(Blockly.inputs.Align.RIGHT).appendField('每次增加');
    this.appendStatementInput('DO').appendField('執行'); this.setInputsInline(false); } };
  B.controls_forEach = { init(){ this.setColour(COL.control); this.setPreviousStatement(true); this.setNextStatement(true);
    this.appendValueInput('LIST').appendField('對於任意').appendField(new Blockly.FieldTextInput('清單項目'),'VAR').appendField('清單'); this.appendStatementInput('DO').appendField('執行'); } };
  B.controls_while = { init(){ this.setColour(COL.control); this.setPreviousStatement(true); this.setNextStatement(true);
    this.appendValueInput('TEST').appendField('當').appendField('滿足條件'); this.appendStatementInput('DO').appendField('執行'); } };
  // 變數
  const nameV = v => { v=v.replace(/\s+/g,''); return v||null; };
  B.global_declaration = { init(){ this.setColour(COL.vars); this.appendValueInput('VALUE').appendField('初始化全域變數').appendField(new Blockly.FieldTextInput('變數名',nameV),'NAME').appendField('為'); } };
  class VarField extends Blockly.FieldDropdown {
    constructor(){ let self=null; super(()=>varOptions(self)); self=this; }
    doClassValidation_(v){ return v==null?null:String(v); }
  }
  Blockly.fieldRegistry.unregister && (()=>{ try{ Blockly.fieldRegistry.unregister('ai_var'); }catch(e){} })();
  B.lexical_variable_get = { init(){ this.setColour(COL.vars); this.setOutput(true); this.appendDummyInput('V').appendField('取得').appendField(new VarField(),'VAR'); } };
  B.lexical_variable_set = { init(){ this.setColour(COL.vars); this.setPreviousStatement(true); this.setNextStatement(true); this.appendValueInput('VALUE').appendField('設置').appendField(new VarField(),'VAR').appendField('為'); } };
  B.local_declaration_statement = { init(){ this.setColour(COL.vars); this.setPreviousStatement(true); this.setNextStatement(true);
    this.appendValueInput('DECL0').appendField('初始化區域變數').appendField(new Blockly.FieldTextInput('變數名',nameV),'VAR0').appendField('為'); this.appendStatementInput('STACK').appendField('作用範圍'); } };
  // 程序
  const renameCalls = (blk,oldN,newN) => { const ws=blk.workspace; if(!ws||ws.isFlyout||oldN===newN) return;
    ws.getAllBlocks(false).forEach(b=>{ if((b.type==='procedures_callnoreturn'||b.type==='procedures_callreturn')&&b.state_.name===oldN){ b.state_.name=newN; b.build_(); } }); };
  const procDef = ret => withState({ init(){ this.setColour(COL.procs); this.state_={params:[]}; this.build_(); },
    build_(){ clear(this); const self=this; let prev=null;
      const nf=new Blockly.FieldTextInput('程序名稱',function(v){ v=nameV(v); if(v==null) return null; const old=self.getFieldValue('NAME'); if(old&&old!==v) renameCalls(self,old,v); return v; });
      const d=this.appendDummyInput('HEAD').appendField('定義程序').appendField(nf,'NAME');
      (this.state_.params||[]).forEach(p=>d.appendField(new Blockly.FieldLabel(p)));
      if(ret) this.appendValueInput('RETURN').appendField('回傳'); else this.appendStatementInput('STACK').appendField('執行'); } });
  B.procedures_defnoreturn = procDef(false); B.procedures_defreturn = procDef(true);
  const procCall = ret => withState({ init(){ this.setColour(COL.procs); this.state_={name:'程序名稱',params:[]}; this.build_(); },
    build_(){ clear(this); if(ret){ this.setPreviousStatement(false); this.setNextStatement(false); this.setOutput(true); } else { this.setOutput(false); this.setPreviousStatement(true); this.setNextStatement(true); }
      this.appendDummyInput('HEAD').appendField('呼叫').appendField(new Blockly.FieldLabel(this.state_.name),'PROCNAME');
      (this.state_.params||[]).forEach((p,i)=>this.appendValueInput('ARG'+i).setAlign(Blockly.inputs.Align.RIGHT).appendField(p)); } });
  B.procedures_callnoreturn = procCall(false); B.procedures_callreturn = procCall(true);
  // 清單
  B.lists_create_with = withState({ init(){ this.setColour(COL.lists); this.setOutput(true); this.state_={items:2}; this.build_(); },
    build_(){ clear(this); if(!this.state_.items){ this.appendDummyInput('E').appendField('建立空清單'); return; }
      for(let i=0;i<this.state_.items;i++){ const inp=this.appendValueInput('ADD'+i); if(i===0) inp.appendField('建立清單'); } this.setInputsInline(false); } });
  B.lists_add_items = withState({ init(){ this.setColour(COL.lists); this.setPreviousStatement(true); this.setNextStatement(true); this.state_={items:1}; this.build_(); },
    build_(){ clear(this); this.appendValueInput('LIST').appendField('增加清單項目　清單'); for(let i=0;i<(this.state_.items||1);i++) this.appendValueInput('ITEM'+i).setAlign(Blockly.inputs.Align.RIGHT).appendField('項目'); } });
  B.lists_select_item = { init(){ this.setColour(COL.lists); this.setOutput(true); this.appendValueInput('LIST').appendField('選擇清單'); this.appendValueInput('NUM').appendField('中索引值為'); this.appendDummyInput('E').appendField('的清單項目'); this.setInputsInline(true); } };
  B.lists_length = { init(){ this.setColour(COL.lists); this.setOutput(true); this.appendValueInput('LIST').appendField('計算清單'); this.appendDummyInput('E').appendField('的長度'); this.setInputsInline(true); } };
  B.lists_remove_item = { init(){ this.setColour(COL.lists); this.setPreviousStatement(true); this.setNextStatement(true); this.appendValueInput('LIST').appendField('刪除清單'); this.appendValueInput('INDEX').appendField('中的第'); this.appendDummyInput('E').appendField('個項目'); this.setInputsInline(true); } };
  B.lists_is_in = { init(){ this.setColour(COL.lists); this.setOutput(true); this.appendValueInput('LIST').appendField('檢查清單'); this.appendValueInput('ITEM').appendField('中是否包含指定對象'); this.setInputsInline(true); } };
}
// 變數下拉選單：全域變數 + 外層的區域變數、迴圈變數、參數
const PARAM_ZH = {}; Object.values(SPEC).forEach(s=>s.events.forEach(e=>(e.params||[]).forEach(([en,zh])=>PARAM_ZH[en]=zh)));
function varOptions(field){
  const out=[], add=(label,val)=>{ if(val&&!out.find(o=>o[1]===val)) out.push([label,val]); };
  const ws = LAB && LAB.ws;
  if(ws) ws.getTopBlocks(false).forEach(b=>{ if(b.type==='global_declaration') add('global '+b.getFieldValue('NAME'),'global '+b.getFieldValue('NAME')); });
  const blk = field && field.getSourceBlock && field.getSourceBlock();
  const scopeOf = b => { const r=[]; if(!b) return r;
    if(b.type==='local_declaration_statement') r.push(b.getFieldValue('VAR0'));
    if(b.type==='controls_forRange'||b.type==='controls_forEach') r.push(b.getFieldValue('VAR'));
    if((b.type==='procedures_defnoreturn'||b.type==='procedures_defreturn')&&b.state_) r.push(...(b.state_.params||[]));
    if(b.type==='component_event'&&b.state_){ const ev=evSpec(b.state_.ctype,b.state_.name); if(ev&&ev.params) r.push(...ev.params.map(p=>p[0])); }
    return r; };
  if(blk && !blk.isInFlyout){ for(let p=blk.getSurroundParent(); p; p=p.getSurroundParent()) scopeOf(p).forEach(n=>add(PARAM_ZH[n]||n,n)); }
  else if(ws) ws.getAllBlocks(false).forEach(b=>scopeOf(b).forEach(n=>add(PARAM_ZH[n]||n,n)));
  const cur = field && field.value_;
  if(cur && !out.find(o=>o[1]===cur)) out.push([PARAM_ZH[cur]||cur,cur]);
  if(!out.length) out.push(['（先建立變數）','']);
  return out;
}

// ---------------- 積木抽屜 ----------------
const blk = (type,o={}) => Object.assign({kind:'block',type},o);
const sh = (inner) => ({block:inner});
const N = n => sh({type:'math_number',fields:{NUM:String(n)}});
const T = t => sh({type:'text',fields:{TEXT:t}});
function builtin(cats){
  const star = c => cats&&cats.includes(c)?' ★':'';
  return [
    {kind:'category',name:'控制'+star('control'),colour:COL.control,contents:[
      blk('controls_if',{extraState:{elseif:0,else:0}}), blk('controls_if',{extraState:{elseif:0,else:1}}), blk('controls_if',{extraState:{elseif:1,else:1}}),
      blk('controls_forRange',{inputs:{START:N(1),END:N(5),STEP:N(1)}}), blk('controls_forEach'), blk('controls_while')]},
    {kind:'category',name:'邏輯'+star('logic'),colour:COL.logic,contents:[blk('logic_boolean',{fields:{BOOL:'TRUE'}}),blk('logic_boolean',{fields:{BOOL:'FALSE'}}),blk('logic_negate'),blk('logic_operation',{fields:{OP:'AND'}}),blk('logic_operation',{fields:{OP:'OR'}})]},
    {kind:'category',name:'數學'+star('math'),colour:COL.math,contents:[blk('math_number'),blk('math_compare'),blk('math_add',{extraState:{items:2}}),blk('math_subtract'),blk('math_multiply',{extraState:{items:2}}),blk('math_division'),blk('math_power'),
      blk('math_random_int',{inputs:{FROM:N(1),TO:N(100)}}),blk('math_divide',{fields:{OP:'REMAINDER'}}),blk('math_format_as_decimal'),blk('math_is_a_number')]},
    {kind:'category',name:'文字'+star('text'),colour:COL.text,contents:[blk('text'),blk('text_join',{extraState:{items:2}}),blk('text_join',{extraState:{items:3}}),blk('text_length'),blk('text_isEmpty'),blk('text_compare'),blk('text_changeCase'),blk('text_split')]},
    {kind:'category',name:'清單'+star('lists'),colour:COL.lists,contents:[blk('lists_create_with',{extraState:{items:0}}),blk('lists_create_with',{extraState:{items:3}}),blk('lists_add_items',{extraState:{items:1}}),blk('lists_select_item'),blk('lists_length'),blk('lists_remove_item'),blk('lists_is_in')]},
    {kind:'category',name:'顏色'+star('colors'),colour:COL.colors,contents:COLORS.map(c=>blk('color_'+c[0]))},
    {kind:'category',name:'變數'+star('vars'),colour:COL.vars,contents:[blk('global_declaration',{fields:{NAME:'變數名'}}),blk('lexical_variable_get'),blk('lexical_variable_set'),blk('local_declaration_statement',{fields:{VAR0:'變數名'}})]},
    {kind:'category',name:'程序'+star('procs'),colour:COL.procs,custom:'AI_PROCS'},
  ];
}
function compDrawer(name,type){
  const s=SPEC[type], st={ctype:type,inst:name}, out=[];
  s.events.forEach(e=>{ out.push(blk('component_event',{extraState:{...st,name:e.n}})); (e.params||[]).forEach(p=>out.push(blk('lexical_variable_get',{fields:{VAR:p[0]}}))); });
  s.methods.forEach(m=>out.push(blk('component_method',{extraState:{...st,name:m.n,ret:!!m.ret}})));
  s.props.filter(p=>!DESIGN_ONLY[p[0]]).forEach(p=>{ out.push(blk('component_set_get',{extraState:{...st,prop:p[0],mode:'get'}})); out.push(blk('component_set_get',{extraState:{...st,prop:p[0],mode:'set'}})); });
  return out;
}
function toolbox(L,comps){
  const kids = list => list.map(c=>({kind:'category',name:c.name,colour:COL.event,contents:compDrawer(c.name,c.type).length?compDrawer(c.name,c.type):[{kind:'label',text:'（這個元件沒有積木）'}],
    ...(c.children&&c.children.length?{}:{})}));
  const compCats = flat(comps).map(c=>{ const d=compDrawer(c.name,c.type); return {kind:'category',name:'　'+c.name,colour:COL.event,contents:d.length?d:[{kind:'label',text:`${SPEC[c.type].zh}：這個元件沒有積木`}]}; });
  return {kind:'categoryToolbox',contents:[
    {kind:'category',name:'內建方塊',expanded:'true',colour:'#888',contents:builtin(L.cats)},
    {kind:'category',name:'Screen1',expanded:'true',colour:COL.event,contents:[...compDrawer('Screen1','Form'),...compCats.length?[]:[]]},
    ...compCats,
  ]};
}
function procFlyout(ws){
  const items=[blk('procedures_defnoreturn',{fields:{NAME:'程序名稱'},extraState:{params:[]}}),blk('procedures_defreturn',{fields:{NAME:'程序名稱2'},extraState:{params:[]}})];
  ws.getTopBlocks(false).forEach(b=>{ if(b.type==='procedures_defnoreturn') items.push(blk('procedures_callnoreturn',{extraState:{name:b.getFieldValue('NAME'),params:b.state_.params||[]}}));
    if(b.type==='procedures_defreturn') items.push(blk('procedures_callreturn',{extraState:{name:b.getFieldValue('NAME'),params:b.state_.params||[]}})); });
  return items;
}

// ---------------- 模擬手機 ----------------
const PIC = n => /cat/i.test(n)?'🐱':/dog/i.test(n)?'🐶':/kitty/i.test(n)?'🐱':'🖼️';
class Phone {
  constructor(root, opts={}){ this.root=root; this.opts=opts; this.els={}; }
  mount(rt, comps){
    this.rt=rt; this.els={}; const r=this.root; r.innerHTML='';
    const scr=document.createElement('div'); scr.className='ph-screen';
    scr.innerHTML=`<div class="ph-status"><span>9:41</span><span>▮▮▮ 🔋</span></div><div class="ph-title">${esc(rt?rt.p.Screen1.Title:'Screen1')}</div><div class="ph-body"></div><div class="ph-over"></div>`;
    r.appendChild(scr); this.scr=scr; this.body=scr.querySelector('.ph-body'); this.over=scr.querySelector('.ph-over');
    this.build(comps,this.body);
    const tray=document.createElement('div'); tray.className='ph-tray';
    const nv=flat(comps).filter(c=>!SPEC[c.type].visible);
    tray.innerHTML=nv.length?`<div class="ph-nvh">非可見元件</div>`+nv.map(c=>`<span class="nv" data-n="${esc(c.name)}">${SPEC[c.type].icon} ${esc(c.name)}${c.type==='AccelerometerSensor'&&!this.opts.design?' <button type="button" class="shake">📳 搖一搖</button>':''}${c.type==='TinyDB'?' <small class="dbv"></small>':''}</span>`).join(''):'';
    r.appendChild(tray); this.tray=tray;
    tray.querySelectorAll('.shake').forEach(b=>b.onclick=()=>{ scr.classList.remove('shk'); void scr.offsetWidth; scr.classList.add('shk'); if(this.rt) this.rt.fire(b.closest('.nv').dataset.n,'Shaking'); });
    if(rt){ const cv=flat(comps).find(c=>c.type==='Canvas'); if(cv&&this.els[cv.name]) rt.canvasW=this.els[cv.name].clientWidth||260; }
    this.update();
  }
  build(list,parent){
    (list||[]).forEach(c=>{
      const t=c.type; let el;
      if(t==='Button'){ el=document.createElement('button'); el.type='button'; el.className='ai-btn';
        if(!this.opts.design){ let timer=null, longed=false;
          el.addEventListener('pointerdown',()=>{ longed=false; timer=setTimeout(()=>{ longed=true; this.rt&&this.rt.fire(c.name,'LongClick'); },650); });
          ['pointerup','pointerleave','pointercancel'].forEach(e=>el.addEventListener(e,()=>clearTimeout(timer)));
          el.addEventListener('click',()=>{ if(longed) return; if(this.rt&&this.rt.p[c.name].Enabled!==false) this.rt.fire(c.name,'Click'); }); } }
      else if(t==='Label'){ el=document.createElement('div'); el.className='ai-lbl'; }
      else if(t==='TextBox'){ el=document.createElement('input'); el.className='ai-tb'; el.autocomplete='off';
        if(this.opts.design) el.readOnly=true; else { el.addEventListener('input',()=>{ if(this.rt) this.rt.p[c.name].Text=el.value; }); el.addEventListener('focus',()=>this.rt&&this.rt.fire(c.name,'GotFocus')); } }
      else if(t==='Image'){ el=document.createElement('div'); el.className='ai-img'; }
      else if(t==='HorizontalArrangement'||t==='VerticalArrangement'){ el=document.createElement('div'); el.className='ai-arr '+(t==='HorizontalArrangement'?'h':'v'); this.build(c.children,el); }
      else if(t==='Canvas'){ el=document.createElement('div'); el.className='ai-cv'; el.innerHTML='<svg class="draw" width="100%" height="100%"></svg>'; this.build(c.children,el); }
      else if(t==='Ball'){ el=document.createElement('div'); el.className='ai-ball';
        if(!this.opts.design) el.addEventListener('pointerdown',e=>{ e.preventDefault(); const p=this.rt.p[c.name]; this.rt.fire(c.name,'Touched',{x:Math.round(p.X+p.Radius),y:Math.round(p.Y+p.Radius)}); }); }
      else return;
      el.dataset.comp=c.name; if(this.opts.design) el.addEventListener('click',e=>{ e.stopPropagation(); this.opts.onPick&&this.opts.onPick(c.name); });
      this.els[c.name]={el,type:t}; el.title=c.name; parent.appendChild(el);
    });
  }
  propsOf(n){ return this.rt?this.rt.p[n]:this.opts.propsOf(n); }
  update(){
    if(!this.scr) return;
    const sP=this.propsOf('Screen1')||{}; this.scr.querySelector('.ph-body').style.background=sP.BackgroundColor||'#fff';
    Object.entries(this.els).forEach(([n,{el,type}])=>{ const p=this.propsOf(n); if(!p) return;
      el.style.display=p.Visible===false&&!this.opts.design?'none':''; if(p.Visible===false&&this.opts.design) el.style.opacity=.35;
      if('FontSize' in p) el.style.fontSize=(Number(p.FontSize)||14)+'px';
      if('BackgroundColor' in p && type!=='Canvas') el.style.background=p.BackgroundColor||'';
      if(p.Width==='fill') el.style.flex='1 1 auto', el.style.alignSelf='stretch'; else el.style.flex='', el.style.alignSelf='';
      if(type==='Button'){ el.textContent=fmt(p.Text); el.disabled=p.Enabled===false; }
      else if(type==='Label'){ el.textContent=fmt(p.Text); el.style.color=p.TextColor||''; }
      else if(type==='TextBox'){ if(document.activeElement!==el||this.opts.design){ if(el.value!==fmt(p.Text)) el.value=fmt(p.Text); } el.placeholder=p.Hint||''; el.inputMode=p.NumbersOnly?'decimal':''; }
      else if(type==='Image'){ el.innerHTML=p.Picture?`<span>${PIC(p.Picture)}</span><small>${esc(p.Picture)}</small>`:'<span>🖼️</span><small>（沒有圖片）</small>'; }
      else if(type==='Canvas'){ el.style.height=(Number(p.Height)||260)+'px'; el.style.background=p.BackgroundColor||'#fff';
        const d=this.rt?this.rt.drawings[n]||[]:[]; el.querySelector('svg.draw').innerHTML=d.map(c=>`<circle cx="${c.x}" cy="${c.y}" r="${c.r}" fill="${c.fill?'#000':'none'}" stroke="#000"/>`).join(''); }
      else if(type==='Ball'){ const r=Number(p.Radius)||10; el.style.width=el.style.height=2*r+'px'; el.style.background=p.PaintColor||'#000'; el.style.transform=`translate(${p.X}px,${p.Y}px)`; }
    });
    if(this.rt&&this.tray){ const dv=this.tray.querySelector('.dbv'); if(dv){ const e=[...this.rt.db.entries()]; dv.textContent=e.length?e.map(([k,v])=>`${k}＝${fmt(v)}`).join('，'):'（空的）'; } }
  }
  toast(msg,cls=''){ const d=document.createElement('div'); d.className='ph-toast '+cls; d.textContent=msg; this.over.appendChild(d); setTimeout(()=>d.remove(),cls==='err'?5000:2600); }
}

// ---------------- 音效、語音 ----------------
let actx=null;
function beep(){ try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); const o=actx.createOscillator(), g=actx.createGain(); o.frequency.value=660; o.frequency.linearRampToValueAtTime(960,actx.currentTime+.2); g.gain.value=.15; g.gain.linearRampToValueAtTime(0,actx.currentTime+.25); o.connect(g).connect(actx.destination); o.start(); o.stop(actx.currentTime+.26); }catch(e){} }
function say(m){ try{ if(!window.speechSynthesis) return; speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(m); u.lang='zh-TW'; speechSynthesis.speak(u); }catch(e){} }

// ---------------- 下載 .aia ----------------
async function downloadAia(proj,comps,blocks,screen){
  if(!window.JSZip) await loadScript(URLS.jszip);
  const z=new JSZip(); K.aiaFiles(proj,comps,blocks,screen).forEach(([p,c])=>z.file(p,c,{createFolders:false}));
  const blob=await z.generateAsync({type:'blob',mimeType:'application/zip'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=proj+'.aia'; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },1500);
}
function downloadSolution(key){ const s=K.solutionOf(key); return downloadAia(K.projName(key),s.comps,s.blocks,LABS[key].screen); }

// ---------------- 操作台（全螢幕） ----------------
const CSS = `
.ai2lab{position:fixed;inset:0;z-index:6000;background:#f3f5f4;color:#1f2d33;display:flex;flex-direction:column;font-family:"Noto Sans TC","PingFang TC","Microsoft JhengHei",system-ui,sans-serif;font-size:14px}
.ai2lab button{font:inherit;cursor:pointer;border-radius:8px;padding:6px 12px;border:1px solid #c9d3d0;background:#fff;color:#1f2d33;font-weight:600}
.ai2lab button.pri{background:#7cb342;border-color:#689f38;color:#fff}
.ai2lab button.run{background:#2e9e5b;border-color:#24804a;color:#fff}
.ai2lab button:disabled{opacity:.5;cursor:default}
.ai2lab .bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:8px 12px;background:#fff;border-bottom:1px solid #d7e0dd}
.ai2lab .bar h2{margin:0;font-size:16px;font-weight:800;display:flex;align-items:center;gap:8px;min-width:0}
.ai2lab .bar h2 small{font-weight:500;color:#5b6d73;font-size:12px}
.ai2lab .sp{flex:1}
.ai2lab .tabs2{display:inline-flex;border:1px solid #c9d3d0;border-radius:8px;overflow:hidden}
.ai2lab .tabs2 button{border:0;border-radius:0;padding:6px 14px}
.ai2lab .tabs2 button[aria-selected="true"]{background:#7cb342;color:#fff}
.ai2lab .goal{padding:8px 14px;background:#fffbe8;border-bottom:1px solid #eadfb0;line-height:1.6;display:flex;gap:10px;align-items:flex-start}
.ai2lab .goal b{color:#7a5a00}
.ai2lab .goal .gt{flex:1}
.ai2lab .goal .hint{margin-top:4px;color:#6b5a1f;background:#fff3c4;border-radius:8px;padding:4px 10px}
.ai2lab .res{padding:8px 14px;font-weight:700}
.ai2lab .res.ok{background:#e3f6ea;color:#1d7a43;border-bottom:1px solid #b8e3c6}
.ai2lab .res.bad{background:#fdecea;color:#b3261e;border-bottom:1px solid #f3c2bd}
.ai2lab .main2{flex:1;min-height:0;display:flex}
.ai2lab .ws{flex:1;min-width:0;position:relative}
.ai2lab .ws .bk{position:absolute;inset:0}
.ai2lab .side{width:340px;flex:none;overflow:auto;border-left:1px solid #d7e0dd;background:#eef2f1;padding:12px;display:flex;flex-direction:column;align-items:center;gap:8px}
.ai2lab .side .note{font-size:12px;color:#5b6d73;text-align:center;max-width:300px}
.ai2lab .warns{font-size:12px;color:#9c5a00;background:#fff3dc;border-radius:8px;padding:4px 8px;max-width:300px}
.ai2lab .phone{width:300px;flex:none}
.ai2lab .ph-screen{position:relative;border:10px solid #263238;border-radius:26px;background:#263238;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.2)}
.ai2lab .ph-screen.shk{animation:phshake .5s}
@keyframes phshake{20%{transform:translateX(-6px) rotate(-2deg)}40%{transform:translateX(6px) rotate(2deg)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
.ai2lab .ph-status{display:flex;justify-content:space-between;background:#303f9f;color:#fff;font-size:11px;padding:2px 8px}
.ai2lab .ph-title{background:#3f51b5;color:#fff;font-size:15px;padding:8px 10px}
.ai2lab .ph-body{background:#fff;min-height:420px;padding:6px;display:flex;flex-direction:column;align-items:flex-start;gap:4px;color:#000}
.ai2lab .ph-over{position:absolute;left:8px;right:8px;bottom:10px;display:flex;flex-direction:column;gap:6px;align-items:center;pointer-events:none}
.ai2lab .ph-toast{background:rgba(40,40,40,.92);color:#fff;border-radius:6px;padding:8px 12px;font-size:13px;max-width:100%;text-align:center}
.ai2lab .ph-toast.err{background:#c62828}
.ai2lab .ph-toast.tts{background:#5c6bc0}
.ai2lab .ai-btn{background:#e0e0e0;color:#000;border:0;border-radius:4px;box-shadow:0 1px 2px rgba(0,0,0,.35);padding:8px 14px;font-weight:500;min-width:64px}
.ai2lab .ai-btn:active{background:#bdbdbd}
.ai2lab .ai-btn:disabled{color:#9e9e9e;background:#eeeeee;box-shadow:none}
.ai2lab .ai-lbl{white-space:pre-wrap;word-break:break-word;padding:2px 0;min-height:1em}
.ai2lab .ai-tb{border:0;border-bottom:2px solid #3f51b5;padding:6px 4px;font:inherit;font-size:14px;min-width:0;width:150px;background:transparent;color:#000}
.ai2lab .ai-img{display:flex;flex-direction:column;align-items:center;font-size:48px;line-height:1}
.ai2lab .ai-img small{font-size:11px;color:#777}
.ai2lab .ai-arr{display:flex;gap:4px;align-items:center;min-height:28px;min-width:40px}
.ai2lab .ai-arr.v{flex-direction:column;align-items:flex-start}
.ai2lab .ai-cv{position:relative;width:100%;align-self:stretch;overflow:hidden;border:1px solid #ccc;touch-action:none}
.ai2lab .ai-cv svg.draw{position:absolute;inset:0}
.ai2lab .ai-ball{position:absolute;left:0;top:0;border-radius:50%;cursor:pointer}
.ai2lab .ph-tray{margin-top:8px;display:flex;flex-wrap:wrap;gap:6px;justify-content:center}
.ai2lab .ph-nvh{width:100%;text-align:center;font-size:11px;color:#5b6d73}
.ai2lab .nv{background:#fff;border:1px solid #cfd8dc;border-radius:999px;padding:3px 10px;font-size:12px;display:inline-flex;align-items:center;gap:6px}
.ai2lab .nv button{padding:2px 8px;font-size:12px;background:#5c6bc0;color:#fff;border-color:#3f51a5}
.ai2lab .nv.ping{animation:ping .6s}
@keyframes ping{50%{background:#ffe082;transform:scale(1.08)}}
.ai2lab .phactions{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}
.ai2lab .menu{position:relative}
.ai2lab .menu .dd2{position:absolute;right:0;top:calc(100% + 4px);background:#fff;border:1px solid #c9d3d0;border-radius:10px;box-shadow:0 6px 18px rgba(0,0,0,.15);padding:6px;display:flex;flex-direction:column;gap:4px;z-index:5;min-width:220px}
.ai2lab .menu .dd2 button{text-align:left;border:0}
.ai2lab .menu .dd2 button:hover{background:#f1f5f3}
.ai2lab .menu .dd2 small{display:block;color:#5b6d73;font-weight:400}
/* 設計師 */
.ai2lab .des{flex:1;min-height:0;display:flex;gap:0}
.ai2lab .pal,.ai2lab .tree{width:220px;flex:none;overflow:auto;background:#fff;border-right:1px solid #d7e0dd;padding:10px}
.ai2lab .tree{border-right:0;border-left:1px solid #d7e0dd;width:260px}
.ai2lab .pal h4,.ai2lab .tree h4{margin:4px 0 6px;font-size:13px;color:#5b6d73}
.ai2lab .pal button{display:flex;flex-wrap:wrap;align-items:baseline;width:100%;margin-bottom:4px;text-align:left;gap:2px 6px;font-weight:500}
.ai2lab .pal button small{margin-left:0!important;font-size:11px}
.ai2lab .center{flex:1;overflow:auto;display:flex;flex-direction:column;align-items:center;padding:14px;gap:8px}
.ai2lab .tree ul{list-style:none;margin:0;padding-left:14px}
.ai2lab .tree > ul{padding-left:0}
.ai2lab .tree li > span{display:inline-block;padding:2px 6px;border-radius:6px;cursor:pointer;margin:1px 0}
.ai2lab .tree li > span.sel{background:#7cb342;color:#fff}
.ai2lab .props{margin-top:10px;border-top:1px solid #e3e9e7;padding-top:8px;display:flex;flex-direction:column;gap:6px}
.ai2lab .props label{display:flex;flex-direction:column;font-size:12px;color:#5b6d73;gap:2px}
.ai2lab .props input,.ai2lab .props select{font:inherit;font-size:13px;padding:4px 6px;border:1px solid #c9d3d0;border-radius:6px;color:#1f2d33;background:#fff}
.ai2lab .props .ro{font-size:13px;color:#1f2d33}
.ai2lab [data-comp].picked{outline:2px solid #7cb342;outline-offset:1px}
@media (max-width:820px){
  .ai2lab .main2{flex-direction:column;overflow:auto}
  .ai2lab .ws{flex:none;height:58vh}
  .ai2lab .side{width:auto;border-left:0;border-top:1px solid #d7e0dd}
  .ai2lab .des{flex-direction:column;overflow:auto}
  .ai2lab .pal,.ai2lab .tree{width:auto;border:0;border-bottom:1px solid #d7e0dd}
  .ai2lab .pal{display:flex;flex-wrap:wrap;gap:4px}.ai2lab .pal h4{width:100%}.ai2lab .pal button{width:auto}
}
.blocklyDropDownDiv,.blocklyWidgetDiv,.blocklyTooltipDiv{z-index:7000!important}
.ai2lab .blocklyToolboxDiv{background:#f7f7f7}
.ai2lab .blocklyTreeRow{height:26px;line-height:26px}
.ai2lab .loading{flex:1;display:flex;align-items:center;justify-content:center;color:#5b6d73;font-size:15px}
`;
let cssOn=false;
const PALETTE=['Button','Label','TextBox','Image','HorizontalArrangement','VerticalArrangement','Notifier'];

async function open(key, cb={}){
  const L=LABS[key]; if(!L) return;
  if(!cssOn){ const s=document.createElement('style'); s.textContent=CSS; document.head.appendChild(s); cssOn=true; }
  const saveKey='ai2lab:'+key;
  let saved=null; try{ saved=JSON.parse(localStorage.getItem(saveKey)||'null'); }catch(e){}
  const st=K.startOf(key);
  const state={ comps: saved&&saved.comps?saved.comps:st.comps, blocks: saved&&saved.blocks?saved.blocks:st.blocks, db:new Map(saved&&saved.db||[]) };
  const root=document.createElement('div'); root.className='ai2lab'; root.setAttribute('role','dialog'); root.setAttribute('aria-modal','true');
  root.innerHTML=`
    <div class="bar"><h2>🛠 動手做：${esc(L.title)}<small>App Inventor 模擬操作台</small></h2><span class="sp"></span>
      <div class="tabs2" role="tablist">${L.designer?'<button type="button" data-t="des" aria-selected="true">設計師</button>':'<button type="button" data-t="des" aria-selected="false">設計師</button><button type="button" data-t="blk" aria-selected="true">程式設計</button>'}</div>
      <button type="button" class="pri" id="lCheck">✓ 檢查任務</button>
      <button type="button" id="lHint">💡 提示</button>
      <button type="button" id="lSol">📖 看解答</button>
      <div class="menu"><button type="button" id="lDl">⬇ 下載 .aia ▾</button><div class="dd2" hidden>
        <button type="button" data-dl="mine">我的作品<small>把目前的畫面和積木匯出</small></button>
        <button type="button" data-dl="sol">完成版範例<small>這一題的參考答案</small></button>
        <small style="padding:4px 8px">到 App Inventor 選「專案 › 匯入專案 (.aia)」就能打開</small></div></div>
      <button type="button" id="lClose" aria-label="關閉">✕</button></div>
    <div class="goal"><div class="gt"><b>任務：</b>${L.goal}<div class="hint" hidden>💡 ${L.hint}</div></div></div>
    <div class="res" hidden></div>
    <div class="main2" data-v="blk" ${L.designer?'hidden':''}><div class="ws"><div class="bk"></div></div>
      <div class="side"><div class="phone"></div><div class="phactions"><button type="button" class="run" id="lRun">▶ 重新執行 App</button>${L.db?'<button type="button" id="lReopen">關閉 App 再打開</button>':''}</div>
      <div class="warns" hidden></div><div class="note">改了積木，手機會自動更新，就像 AI2 Companion。</div></div></div>
    <div class="des" data-v="des" ${L.designer?'':'hidden'}>${L.designer?'<div class="pal"><h4>元件面板（點一下加入）</h4>'+PALETTE.map(t=>`<button type="button" data-add="${t}">${SPEC[t].icon} ${SPEC[t].zh}<small style="color:#889">${t}</small></button>`).join('')+'</div>':''}
      <div class="center"><div class="phone dphone"></div><div class="note">${L.designer?'點手機上的元件或右邊的元件清單，就能修改它的屬性。選取「水平配置」再加元件，新元件會放進配置裡。':'這是這一題的畫面（設計師）。這一題只要拼積木，不用改畫面。'}</div></div>
      <div class="tree"><h4>元件清單</h4><div class="tlist"></div><div class="props"></div></div></div>`;
  document.body.appendChild(root); document.body.style.overflow='hidden';
  const $=s=>root.querySelector(s), $$=s=>root.querySelectorAll(s);
  const res=$('.res');
  const show=(ok,msg)=>{ res.hidden=false; res.className='res '+(ok?'ok':'bad'); res.innerHTML=msg; };
  const persist=()=>{ try{ localStorage.setItem(saveKey,JSON.stringify({comps:state.comps,blocks:state.blocks,db:[...state.db]})); }catch(e){} };

  // ---- 程式設計（Blockly） ----
  let ws=null, rt=null, phone=null, loop=null;
  LAB={key,comps:state.comps,ws:null};
  const ui={ update:()=>phone&&phone.update(), alert:m=>phone&&phone.toast(m), error:m=>phone&&phone.toast('錯誤：'+m,'err'),
    sound:n=>{ beep(); const c=root.querySelector(`.nv[data-n="${CSS.escape?CSS.escape(n):n}"]`); if(c){ c.classList.remove('ping'); void c.offsetWidth; c.classList.add('ping'); } },
    vibrate:ms=>{ try{ navigator.vibrate&&navigator.vibrate(ms); }catch(e){} const s=root.querySelector('.ph-screen'); if(s){ s.classList.remove('shk'); void s.offsetWidth; s.classList.add('shk'); } },
    speak:m=>{ say(m); phone&&phone.toast('🗣 '+m,'tts'); }, dbChanged:()=>{ persist(); phone&&phone.update(); } };
  const blocksNow=()=>{ if(!ws) return state.blocks; const s=Blockly.serialization.workspaces.save(ws); return (s.blocks&&s.blocks.blocks)||[]; };
  function warn(){ const w=$('.warns'); if(!rt){ w.hidden=true; return; } const m=[]; if(rt.loose) m.push(`有 ${rt.loose} 塊積木沒接在事件或程序裡，不會執行。`); if(rt.dupes.length) m.push('有重複的事件積木。'); w.hidden=!m.length; w.textContent='⚠ '+m.join(' '); }
  function runApp(){
    if(L.designer) return;
    stopLoop(); state.blocks=blocksNow(); persist();
    rt=new Runtime(state.comps,state.blocks,{db:state.db,ui,screen:L.screen});
    phone=new Phone($('.main2 .phone')); rt.start(); phone.mount(rt,state.comps); warn();
    let last=performance.now();
    loop=setInterval(()=>{ const now=performance.now(); let dirty=false;
      rt.clocks().forEach(c=>{ const p=rt.p[c]; if(!p.TimerEnabled){ rt.clockAt[c]=now; return; } if(rt.clockAt[c]==null) rt.clockAt[c]=now; if(now-rt.clockAt[c]>=Math.max(10,p.TimerInterval)){ rt.clockAt[c]=now; rt.fire(c,'Timer'); dirty=true; } });
      rt.sprites().forEach(s=>{ const p=rt.p[s]; if(!(p.Speed>0)) return; if(rt.spriteAt[s]==null) rt.spriteAt[s]=now; if(now-rt.spriteAt[s]>=Math.max(10,p.Interval)){ rt.spriteAt[s]=now; rt.stepSprite(s); dirty=true; } });
      if(dirty){ rt.collide(); phone.update(); } last=now; },16);
  }
  function stopLoop(){ if(loop){ clearInterval(loop); loop=null; } }
  async function initBlocks(){
    const host=$('.ws .bk'); host.innerHTML='<div class="loading">載入積木編輯器…</div>';
    try{ await loadBlockly(); }catch(e){ host.innerHTML='<div class="loading">積木編輯器載入失敗，請檢查網路後再開一次。</div>'; return; }
    host.innerHTML='';
    ws=Blockly.inject(host,{toolbox:toolbox(L,state.comps),renderer:'geras',media:URLS.media,sounds:false,trashcan:true,
      grid:{spacing:20,length:3,colour:'#dde3e1',snap:true},zoom:{controls:true,wheel:true,startScale:.85,maxScale:2,minScale:.4},move:{scrollbars:true,drag:true,wheel:false}});
    LAB.ws=ws; ws.registerToolboxCategoryCallback('AI_PROCS',procFlyout);
    try{ Blockly.serialization.workspaces.load({blocks:{languageVersion:0,blocks:clone(state.blocks)}},ws); }catch(e){ console.warn(e); ws.clear(); }
    let t=null;
    ws.addChangeListener(e=>{ if(e.isUiEvent) return; clearTimeout(t); t=setTimeout(()=>{ state.blocks=blocksNow(); persist(); runApp(); },700); });
    runApp();
  }

  // ---- 設計師 ----
  let picked=L.designer?null:null; let dphone=null;
  const findComp=(n,list=state.comps,par=null)=>{ for(const c of list){ if(c.name===n) return {c,list,par}; if(c.children){ const r=findComp(n,c.children,c); if(r) return r; } } return null; };
  const propsOfDesign=n=>{ if(n==='Screen1'){ const o={}; SPEC.Form.props.forEach(([p,,,d])=>o[p]=d); return Object.assign(o,L.screen||{}); }
    const f=findComp(n); if(!f) return null; const o={}; SPEC[f.c.type].props.forEach(([p,,,d])=>o[p]=d); return Object.assign(o,f.c.props); };
  function renderDesigner(){
    dphone=new Phone($('.dphone'),{design:true,propsOf:propsOfDesign,onPick:n=>{ picked=n; renderDesigner(); }});
    dphone.mount(null,state.comps);
    root.querySelectorAll('.dphone [data-comp]').forEach(el=>el.classList.toggle('picked',el.dataset.comp===picked));
    const tl=$('.tlist'); const li=list=>'<ul>'+list.map(c=>`<li><span data-n="${esc(c.name)}" class="${c.name===picked?'sel':''}">${SPEC[c.type].icon} ${esc(c.name)}</span>${c.children&&c.children.length?li(c.children):''}</li>`).join('')+'</ul>';
    tl.innerHTML=`<ul><li><span data-n="Screen1" class="${picked==='Screen1'?'sel':''}">📱 Screen1</span>${state.comps.length?li(state.comps):''}</li></ul>`;
    tl.querySelectorAll('[data-n]').forEach(s=>s.onclick=()=>{ picked=s.dataset.n; renderDesigner(); });
    const pp=$('.props'); if(!picked){ pp.innerHTML='<div class="note">點選一個元件來看它的屬性。</div>'; return; }
    if(picked==='Screen1'){ pp.innerHTML=`<b>Screen1</b><div class="ro">螢幕：整個 App 的畫面</div>`; return; }
    const f=findComp(picked); if(!f){ picked=null; return renderDesigner(); }
    const c=f.c, sp=SPEC[c.type];
    const edit=!!L.designer;
    let h=`<b>${esc(c.name)}</b><span class="ro">${sp.zh}（${c.type}）</span>`;
    if(edit) h+=`<label>元件名稱<input data-k="$name" value="${esc(c.name)}"></label>`;
    sp.props.forEach(([p,zh,kind,def])=>{ const v=c.props[p]!==undefined?c.props[p]:def; if(!edit){ h+=`<label>${zh}<span class="ro">${esc(kind==='bool'?(v?'勾選':'不勾'):(v===''?'（預設）':fmt(v)))}</span></label>`; return; }
      if(kind==='bool') h+=`<label style="flex-direction:row;align-items:center;gap:6px"><input type="checkbox" data-k="${p}" ${v?'checked':''}>${zh}</label>`;
      else if(kind==='color') h+=`<label>${zh}<select data-k="${p}"><option value="">預設</option>${COLORS.map(x=>`<option value="${x[2]}" ${v===x[2]?'selected':''}>${x[1]}</option>`).join('')}</select></label>`;
      else if(kind==='width') h+=`<label>${zh}<select data-k="${p}"><option value="auto" ${v!=='fill'?'selected':''}>自動</option><option value="fill" ${v==='fill'?'selected':''}>填滿</option></select></label>`;
      else h+=`<label>${zh}<input data-k="${p}" ${kind==='num'?'type="number"':''} value="${esc(v)}"></label>`; });
    if(edit) h+=`<button type="button" id="dDel">🗑 刪除這個元件</button>`;
    pp.innerHTML=h;
    if(edit){ pp.querySelectorAll('[data-k]').forEach(inp=>inp.addEventListener('change',()=>{ const k=inp.dataset.k;
        if(k==='$name'){ const nv=inp.value.trim().replace(/\s+/g,''); if(!/^[A-Za-z_一-鿿][\w一-鿿]*$/.test(nv)){ inp.value=c.name; show(false,'元件名稱只能用英文字母、數字、底線（不能用數字開頭）。'); return; }
          if(nv!==c.name&&findComp(nv)){ inp.value=c.name; show(false,'已經有元件叫這個名字了。'); return; } c.name=nv; picked=nv; }
        else { const kind=propSpec(c.type,k)[2]; c.props[k]=kind==='bool'?inp.checked:kind==='num'?Number(inp.value):inp.value; }
        persist(); renderDesigner(); }));
      const del=pp.querySelector('#dDel'); if(del) del.onclick=()=>{ f.list.splice(f.list.indexOf(c),1); picked=null; persist(); renderDesigner(); }; }
  }
  if(L.designer){ $$('[data-add]').forEach(b=>b.onclick=()=>{ const t=b.dataset.add, all=flat(state.comps); let i=1; while(all.find(c=>c.name===t+i)) i++;
    const nc={name:t+i,type:t,props:{}}; if(SPEC[t].container) nc.children=[];
    const f=picked&&picked!=='Screen1'?findComp(picked):null;
    const host=f?(SPEC[f.c.type].container?f.c.children:f.list):state.comps;
    host.push(nc); picked=nc.name; persist(); renderDesigner(); }); }

  // ---- 分頁 ----
  function tab(t){ $$('.tabs2 button').forEach(b=>b.setAttribute('aria-selected',b.dataset.t===t)); $('.main2').hidden=t!=='blk'; $('.des').hidden=t!=='des';
    if(t==='des'){ renderDesigner(); } else if(ws){ Blockly.svgResize(ws); } }
  $$('.tabs2 button').forEach(b=>b.onclick=()=>tab(b.dataset.t));

  // ---- 按鈕 ----
  $('#lHint').onclick=()=>{ const h=$('.goal .hint'); h.hidden=!h.hidden; };
  if($('#lRun')) $('#lRun').onclick=()=>runApp();
  if($('#lReopen')) $('#lReopen').onclick=()=>{ runApp(); phone&&phone.toast('App 重新打開了（全域變數歸零，TinyDB 的資料還在）'); };
  $('#lCheck').onclick=()=>{ if(ws) state.blocks=blocksNow(); const r=K.check(key,state.comps,state.blocks);
    if(r.ok){ show(true,'🎉 任務完成！做得好。可以從「下載 .aia」把作品帶到真的 App Inventor。'); cb.onPass&&cb.onPass(); }
    else show(false,'還差一點：'+r.msg); };
  $('#lSol').onclick=()=>{ if(!confirm('要把解答載入嗎？你目前的作品會被取代。')) return; const s=K.solutionOf(key);
    if(L.designer){ state.comps.splice(0,state.comps.length,...clone(s.comps)); picked=null; persist(); renderDesigner(); }
    else { ws.clear(); Blockly.serialization.workspaces.load({blocks:{languageVersion:0,blocks:clone(s.blocks)}},ws); state.blocks=blocksNow(); persist(); runApp(); }
    show(true,'已載入解答。看懂每一塊在做什麼，再試著自己拼一次！'); };
  const dd=$('.menu .dd2'); $('#lDl').onclick=e=>{ e.stopPropagation(); dd.hidden=!dd.hidden; };
  root.addEventListener('click',()=>{ dd.hidden=true; });
  dd.querySelectorAll('[data-dl]').forEach(b=>b.onclick=async e=>{ e.stopPropagation(); dd.hidden=true;
    try{ if(b.dataset.dl==='sol') await downloadSolution(key); else { if(ws) state.blocks=blocksNow(); await downloadAia(K.projName(key)+'_mine',state.comps,state.blocks,L.screen); } }
    catch(err){ show(false,'下載失敗：'+err.message); } });
  const close=()=>{ stopLoop(); if(ws){ state.blocks=blocksNow(); persist(); ws.dispose(); } LAB=null; root.remove(); document.body.style.overflow=''; document.removeEventListener('keydown',onKey); cb.onClose&&cb.onClose(); };
  const onKey=e=>{ if(e.key==='Escape'&&!document.querySelector('.blocklyDropDownDiv[style*="display: block"]')) close(); };
  document.addEventListener('keydown',onKey);
  $('#lClose').onclick=close;
  if(L.designer){ renderDesigner(); } else { await initBlocks(); }
  return {close};
}

window.AI2LAB = { has:k=>!!LABS[k], goal:k=>LABS[k]&&LABS[k].goal, title:k=>LABS[k]&&LABS[k].title, open, downloadSolution };
})();
