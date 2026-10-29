// ======================================================================
// App Inventor 模擬操作台：核心（元件規格、練習題、直譯器、.aia 匯出）
// 這一段不碰 DOM，可以在 node 裡測試。
// ======================================================================
(function(G){
'use strict';

// ---------- 元件規格（中文用 App Inventor 官方 zh_TW 翻譯） ----------
// props: [英文名, 中文, 型別 text|num|bool|color, 預設值, 可在積木裡讀寫]
const SPEC = {
  Form: { zh:'螢幕', icon:'📱', visible:true,
    events:[{n:'Initialize',zh:'初始化'},{n:'BackPressed',zh:'按下返回'}],
    props:[['BackgroundColor','背景顏色','color','#ffffff'],['Title','標題','text','Screen1']], methods:[] },
  Button: { zh:'按鈕', icon:'🔘', visible:true,
    events:[{n:'Click',zh:'被點選'},{n:'LongClick',zh:'被長按'}],
    props:[['Text','文字','text','按鈕'],['BackgroundColor','背景顏色','color',''],['Enabled','啟用','bool',true],['FontSize','字體大小','num',14],['Visible','可見性','bool',true],['Width','寬度','width','auto']], methods:[] },
  Label: { zh:'標籤', icon:'🏷️', visible:true, events:[],
    props:[['Text','文字','text','標籤'],['BackgroundColor','背景顏色','color',''],['FontSize','字體大小','num',14],['TextColor','文字顏色','color','#000000'],['Visible','可見性','bool',true],['Width','寬度','width','auto']], methods:[] },
  TextBox: { zh:'文字輸入盒', icon:'⌨️', visible:true,
    events:[{n:'GotFocus',zh:'取得焦點'}],
    props:[['Text','文字','text',''],['Hint','提示','text',''],['NumbersOnly','僅限數字','bool',false],['FontSize','字體大小','num',14],['Visible','可見性','bool',true],['Width','寬度','width','auto']], methods:[] },
  Image: { zh:'圖片', icon:'🖼️', visible:true, events:[],
    props:[['Picture','圖片','text',''],['Visible','可見性','bool',true]], methods:[] },
  HorizontalArrangement: { zh:'水平配置', icon:'↔️', visible:true, container:true, events:[],
    props:[['BackgroundColor','背景顏色','color',''],['Visible','可見性','bool',true],['Width','寬度','width','auto']], methods:[] },
  VerticalArrangement: { zh:'垂直配置', icon:'↕️', visible:true, container:true, events:[],
    props:[['BackgroundColor','背景顏色','color',''],['Visible','可見性','bool',true],['Width','寬度','width','auto']], methods:[] },
  Canvas: { zh:'畫布', icon:'🎨', visible:true, container:true, events:[],
    props:[['BackgroundColor','背景顏色','color','#ffffff'],['Height','高度','num',260],['Width','寬度','width','fill']],
    methods:[{n:'DrawCircle',zh:'畫圓',args:[['centerX','圓心x座標'],['centerY','圓心y座標'],['radius','半徑'],['fill','填滿']]},{n:'Clear',zh:'清除畫布',args:[]}] },
  Ball: { zh:'球形精靈', icon:'⚽', visible:true, sprite:true,
    events:[{n:'EdgeReached',zh:'到達邊界',params:[['edge','邊緣數值']]},{n:'Touched',zh:'被觸碰',params:[['x','x座標'],['y','y座標']]},{n:'CollidedWith',zh:'碰撞',params:[['other','其他精靈']]}],
    props:[['Heading','指向','num',0],['Speed','速度','num',0],['Interval','間隔','num',100],['X','X座標','num',0],['Y','Y座標','num',0],['Radius','半徑','num',10],['PaintColor','畫筆顏色','color','#000000'],['Visible','可見性','bool',true]],
    methods:[{n:'Bounce',zh:'反彈',args:[['edge','邊緣數值']]},{n:'MoveTo',zh:'移動到指定位置',args:[['x','x座標'],['y','y座標']]}] },
  Notifier: { zh:'對話框', icon:'💬', visible:false, events:[], props:[],
    methods:[{n:'ShowAlert',zh:'顯示警告訊息',args:[['notice','通知']]}] },
  Clock: { zh:'計時器', icon:'⏱️', visible:false,
    events:[{n:'Timer',zh:'計時'}],
    props:[['TimerInterval','計時間隔','num',1000],['TimerEnabled','啟用計時','bool',true]], methods:[] },
  TinyDB: { zh:'微型資料庫', icon:'🗄️', visible:false, events:[], props:[],
    methods:[{n:'StoreValue',zh:'儲存數值',args:[['tag','標籤'],['valueToStore','儲存值']]},{n:'GetValue',zh:'取得數值',ret:true,args:[['tag','標籤'],['valueIfTagNotThere','無標籤時之回傳值']]},{n:'ClearTag',zh:'清除標籤資料',args:[['tag','標籤']]},{n:'ClearAll',zh:'清除所有資料',args:[]}] },
  Sound: { zh:'音效', icon:'🔊', visible:false, events:[], props:[['Source','來源','text','']],
    methods:[{n:'Play',zh:'播放',args:[]},{n:'Vibrate',zh:'震動',args:[['millisecs','毫秒數']]}] },
  TextToSpeech: { zh:'文字語音轉換器', icon:'🗣️', visible:false, events:[], props:[],
    methods:[{n:'Speak',zh:'唸出文字',args:[['message','訊息']]}] },
  AccelerometerSensor: { zh:'加速度感測器', icon:'📳', visible:false,
    events:[{n:'Shaking',zh:'被晃動'}],
    props:[['XAccel','X分量','num',0]], methods:[] },
};
// 在 App Inventor 裡，這些是設計師可設、積木抽屜不出現的屬性
const DESIGN_ONLY = {Hint:1, NumbersOnly:1, Width:1, Height:1, Source:1, Title:0};
// 匯出 .aia 用的版本（App Inventor YaVersion 208 時代，伺服器會自動升級）
const VERS = {Form:27,Button:6,Label:5,TextBox:6,Image:4,HorizontalArrangement:3,VerticalArrangement:3,Canvas:13,Ball:6,Notifier:6,Clock:4,TinyDB:2,Sound:3,TextToSpeech:5,AccelerometerSensor:4};
const COLORS = [['black','黑色','#000000'],['white','白色','#ffffff'],['red','紅色','#ff0000'],['pink','粉紅色','#ffafaf'],['orange','橙色','#ffc800'],['yellow','黃色','#ffff00'],['green','綠色','#00ff00'],['cyan','青色','#00ffff'],['blue','藍色','#0000ff'],['magenta','洋紅色','#ff00ff'],['light_gray','淺灰色','#cccccc'],['gray','灰色','#888888'],['dark_gray','深灰色','#444444']];
const propSpec = (t,p) => (SPEC[t].props.find(x=>x[0]===p)||[]);
const evSpec = (t,e) => SPEC[t].events.find(x=>x.n===e);
const mSpec = (t,m) => SPEC[t].methods.find(x=>x.n===m);

// ---------- 元件樹工具 ----------
// 元件： {name, type, props:{}, children:[]}；Screen1 是根
const flat = (list,out=[]) => { (list||[]).forEach(c=>{ out.push(c); flat(c.children,out); }); return out; };
const clone = o => JSON.parse(JSON.stringify(o));
function screenOf(lab){ return lab.screen || {}; }

// ---------- 積木狀態 DSL（Blockly JSON 序列化格式） ----------
function H(comps){
  const types = {Screen1:'Form'}; flat(comps).forEach(c=>types[c.name]=c.type);
  const tOf = n => { if(!types[n]) throw new Error('沒有元件 '+n); return types[n]; };
  const v = b => b==null?undefined:{block:b};
  const s = arr => { arr=(arr||[]).filter(Boolean).map(x=>clone(x)); if(!arr.length) return undefined;
    for(let i=arr.length-2;i>=0;i--) arr[i].next={block:arr[i+1]}; return {block:arr[0]}; };
  const ins = o => { const r={}; Object.entries(o).forEach(([k,x])=>{ if(x) r[k]=x; }); return r; };
  const h = {
    ev:(inst,name,body)=>({type:'component_event',extraState:{ctype:tOf(inst),inst,name},inputs:ins({DO:s(body)})}),
    set:(inst,prop,x)=>({type:'component_set_get',extraState:{ctype:tOf(inst),inst,prop,mode:'set'},inputs:ins({VALUE:v(x)})}),
    get:(inst,prop)=>({type:'component_set_get',extraState:{ctype:tOf(inst),inst,prop,mode:'get'}}),
    call:(inst,name,...args)=>{ const t=tOf(inst), m=mSpec(t,name); const r={}; args.forEach((a,i)=>r['ARG'+i]=v(a));
      return {type:'component_method',extraState:{ctype:t,inst,name,ret:!!m.ret},inputs:ins(r)}; },
    txt:t=>({type:'text',fields:{TEXT:String(t)}}),
    num:n=>({type:'math_number',fields:{NUM:String(n)}}),
    bool:b=>({type:'logic_boolean',fields:{BOOL:b?'TRUE':'FALSE'}}),
    color:name=>({type:'color_'+name}),
    join:(...xs)=>{ const r={}; xs.forEach((x,i)=>r['ADD'+i]=v(x)); return {type:'text_join',extraState:{items:xs.length},inputs:ins(r)}; },
    len:x=>({type:'text_length',inputs:ins({VALUE:v(x)})}),
    empty:x=>({type:'text_isEmpty',inputs:ins({VALUE:v(x)})}),
    add:(...xs)=>{ const r={}; xs.forEach((x,i)=>r['NUM'+i]=v(x)); return {type:'math_add',extraState:{items:xs.length},inputs:ins(r)}; },
    mul:(...xs)=>{ const r={}; xs.forEach((x,i)=>r['NUM'+i]=v(x)); return {type:'math_multiply',extraState:{items:xs.length},inputs:ins(r)}; },
    sub:(a,b)=>({type:'math_subtract',inputs:ins({A:v(a),B:v(b)})}),
    div:(a,b)=>({type:'math_division',inputs:ins({A:v(a),B:v(b)})}),
    cmp:(op,a,b)=>({type:'math_compare',fields:{OP:op},inputs:ins({A:v(a),B:v(b)})}),
    rnd:(a,b)=>({type:'math_random_int',inputs:ins({FROM:v(a),TO:v(b)})}),
    dec:(n,p)=>({type:'math_format_as_decimal',inputs:ins({NUM:v(n),PLACES:v(p)})}),
    if:(c,body,els)=>{ const r={IF0:v(c),DO0:s(body)}; if(els) r.ELSE=s(els); return {type:'controls_if',extraState:{elseif:0,else:els?1:0},inputs:ins(r)}; },
    ifs:(pairs,els)=>{ const r={}; pairs.forEach(([c,b],i)=>{ r['IF'+i]=v(c); r['DO'+i]=s(b); }); if(els) r.ELSE=s(els);
      return {type:'controls_if',extraState:{elseif:pairs.length-1,else:els?1:0},inputs:ins(r)}; },
    forRange:(name,a,b,st,body)=>({type:'controls_forRange',fields:{VAR:name},inputs:ins({START:v(a),END:v(b),STEP:v(st),DO:s(body)})}),
    global:(name,x)=>({type:'global_declaration',fields:{NAME:name},inputs:ins({VALUE:v(x)})}),
    vget:name=>({type:'lexical_variable_get',fields:{VAR:name}}),
    vset:(name,x)=>({type:'lexical_variable_set',fields:{VAR:name},inputs:ins({VALUE:v(x)})}),
    local:(name,x,body)=>({type:'local_declaration_statement',fields:{VAR0:name},inputs:ins({DECL0:v(x),STACK:s(body)})}),
    list:(...xs)=>{ const r={}; xs.forEach((x,i)=>r['ADD'+i]=v(x)); return {type:'lists_create_with',extraState:{items:xs.length},inputs:ins(r)}; },
    pick:(l,i)=>({type:'lists_select_item',inputs:ins({LIST:v(l),NUM:v(i)})}),
    llen:l=>({type:'lists_length',inputs:ins({LIST:v(l)})}),
    proc:(name,body)=>({type:'procedures_defnoreturn',fields:{NAME:name},extraState:{params:[]},inputs:ins({STACK:s(body)})}),
    pcall:name=>({type:'procedures_callnoreturn',extraState:{name,params:[]}}),
  };
  h.at=(b,x,y)=>Object.assign(b,{x,y});
  h.stack=(...bs)=>{ let y=20; return bs.map(b=>{ b.x=20; b.y=y; y+=estH(b)+30; return b; }); };
  return h;
}
function estH(b){ let n=0; const walk=x=>{ if(!x) return; n++; Object.values(x.inputs||{}).forEach(i=>walk(i.block)); if(x.next) walk(x.next.block); }; walk(b); return n*30; }

// ---------- 練習題 ----------
const C = (name,type,props={},children) => ({name,type,props,...(children?{children}:{})});
const LABS = {};
function lab(key,o){ LABS[key]=o; }

lab('design:designer',{ title:'排出打招呼 App 的畫面', designer:true,
  goal:'用左邊的元件面板排出畫面：<b>標籤 lblTitle</b>（文字自己取）、一個<b>水平配置</b>，裡面放<b>文字輸入盒 txtName</b> 和<b>按鈕 btnHello</b>（按鈕文字要改，例如「打招呼」）。',
  hint:'先點「水平配置」加入，再選取它，接著加入的元件就會放進水平配置裡。元件名字在右邊屬性面板最上面改。',
  comps:[],
  solution:{comps:[C('lblTitle','Label',{Text:'打招呼 App',FontSize:24}),C('HorizontalArrangement1','HorizontalArrangement',{},[C('txtName','TextBox',{Hint:'你的名字'}),C('btnHello','Button',{Text:'打招呼'})])]},
  check(api){
    const all=api.comps(); const by=n=>all.find(c=>c.name===n);
    const lbl=by('lblTitle'); if(!lbl||lbl.type!=='Label') return '還沒有名字叫 lblTitle 的標籤。加入一個標籤，再把名字改成 lblTitle。';
    if(!String(lbl.props.Text||'').trim()||lbl.props.Text==='標籤') return 'lblTitle 的文字還是預設的，改成你自己的標題吧。';
    const ha=all.find(c=>c.type==='HorizontalArrangement'); if(!ha) return '還沒有水平配置。';
    const kids=ha.children||[]; const t=kids.find(c=>c.name==='txtName'), b=kids.find(c=>c.name==='btnHello');
    if(!t||t.type!=='TextBox') return '水平配置裡面要有名字叫 txtName 的文字輸入盒。';
    if(!b||b.type!=='Button') return '水平配置裡面要有名字叫 btnHello 的按鈕。';
    if(!String(b.props.Text||'').trim()||b.props.Text==='按鈕') return 'btnHello 的文字還是「按鈕」，改成「打招呼」之類的字。';
    return null; } });

lab('event:click',{ title:'第一個事件',
  goal:'App 一打開，<b>Label1</b> 顯示「按下按鈕開始」；按下 <b>Button1</b> 後，Label1 變成「你按了按鈕！」，並用 <b>Notifier1</b> 跳出一則提示訊息。',
  hint:'需要兩塊土黃色事件積木：Screen1.初始化、Button1.被點選。點左邊 Label1 找「設 Label1.文字 為」，再到「內建方塊 › 文字」拿文字積木。',
  comps:[C('Label1','Label',{Text:'（還沒開始）',FontSize:18}),C('Button1','Button',{Text:'按我'}),C('Notifier1','Notifier')],
  cats:['text','control'],
  solution:h=>h.stack(h.ev('Screen1','Initialize',[h.set('Label1','Text',h.txt('按下按鈕開始'))]),
    h.ev('Button1','Click',[h.set('Label1','Text',h.txt('你按了按鈕！')),h.call('Notifier1','ShowAlert',h.txt('收到！'))])),
  check(api){ api.run();
    if(api.prop('Label1','Text')!=='按下按鈕開始') return `App 打開時，Label1 應該顯示「按下按鈕開始」，現在是「${api.prop('Label1','Text')}」。`;
    api.click('Button1');
    if(norm(api.prop('Label1','Text'))!==norm('你按了按鈕！')) return `按下 Button1 後，Label1 應該是「你按了按鈕！」，現在是「${api.prop('Label1','Text')}」。`;
    if(!api.alerts.length) return '按下按鈕後還沒有跳出提示訊息，用「呼叫 Notifier1.顯示警告訊息」。';
    return null; } });

lab('prop:getset',{ title:'讀取與設定屬性',
  goal:'按下 <b>Button1</b> 時：①Label1 的文字變成 TextBox1 裡輸入的字　②Screen1 背景顏色變成<b>黃色</b>　③Button1 的「啟用」設為<b>假</b>。',
  hint:'「設 Label1.文字 為」的右邊，接上淺綠色的「TextBox1.文字」。顏色在「內建方塊 › 顏色」，真／假在「邏輯」。',
  comps:[C('TextBox1','TextBox',{Hint:'打一些字'}),C('Button1','Button',{Text:'送出'}),C('Label1','Label',{Text:'',FontSize:20})],
  cats:['logic','text','colors'],
  solution:h=>h.stack(h.ev('Button1','Click',[h.set('Label1','Text',h.get('TextBox1','Text')),h.set('Screen1','BackgroundColor',h.color('yellow')),h.set('Button1','Enabled',h.bool(false))])),
  check(api){ for(const w of ['早安','App 好好玩']){ api.restart(); api.type('TextBox1',w); api.click('Button1');
      if(api.prop('Label1','Text')!==w) return `在輸入盒打「${w}」再按按鈕，Label1 應該顯示「${w}」，現在是「${api.prop('Label1','Text')}」。`; }
    if(api.prop('Screen1','BackgroundColor')!=='#ffff00') return 'Screen1 的背景顏色還沒變成黃色。';
    if(api.prop('Button1','Enabled')!==false) return 'Button1 的「啟用」要設為假，按完就不能再按。';
    return null; } });

lab('text:string',{ title:'打招呼',
  goal:'按下 <b>btnHello</b>：如果 txtName <b>是空的</b>，lblMsg 顯示「請先輸入名字」；否則顯示「你好，<i>名字</i>！」（例如「你好，小明！」）。',
  hint:'用「如果…則…否則」（控制），條件放「是否為空 txtName.文字」（文字）；「合併文字」按齒輪可以變成 3 格。',
  comps:[C('HorizontalArrangement1','HorizontalArrangement',{},[C('txtName','TextBox',{Hint:'你的名字'}),C('btnHello','Button',{Text:'打招呼'})]),C('lblMsg','Label',{Text:'',FontSize:20})],
  cats:['control','text'],
  solution:h=>h.stack(h.ev('btnHello','Click',[h.if(h.empty(h.get('txtName','Text')),[h.set('lblMsg','Text',h.txt('請先輸入名字'))],[h.set('lblMsg','Text',h.join(h.txt('你好，'),h.get('txtName','Text'),h.txt('！')))])])),
  check(api){ api.run(); api.click('btnHello');
    if(api.prop('lblMsg','Text')!=='請先輸入名字') return `沒輸入就按，應該顯示「請先輸入名字」，現在是「${api.prop('lblMsg','Text')}」。`;
    for(const n of ['小明','Amy']){ api.type('txtName',n); api.click('btnHello');
      if(norm(api.prop('lblMsg','Text'))!==norm(`你好，${n}！`)) return `輸入「${n}」，應該顯示「你好，${n}！」，現在是「${api.prop('lblMsg','Text')}」。`; }
    return null; } });

lab('math:calc',{ title:'BMI 計算機',
  goal:'按下 <b>btnBMI</b>，計算 BMI ＝ 體重 ÷（身高公尺 × 身高公尺），身高輸入的是<b>公分</b>，結果<b>取到小數 1 位</b>顯示在 lblBMI。',
  hint:'先用「初始化區域變數 身高 為 txtHeight.文字 ÷ 100」把公分換成公尺，再用「將數字…設為小數形式，位數 1」。',
  comps:[C('txtHeight','TextBox',{Hint:'身高（公分）',NumbersOnly:true}),C('txtWeight','TextBox',{Hint:'體重（公斤）',NumbersOnly:true}),C('btnBMI','Button',{Text:'計算 BMI'}),C('lblBMI','Label',{Text:'',FontSize:24})],
  cats:['math','vars'],
  start:h=>h.stack(h.ev('btnBMI','Click',[h.set('lblBMI','Text',null)])),
  solution:h=>h.stack(h.ev('btnBMI','Click',[h.local('身高',h.div(h.get('txtHeight','Text'),h.num(100)),[h.set('lblBMI','Text',h.dec(h.div(h.get('txtWeight','Text'),h.mul(h.vget('身高'),h.vget('身高'))),h.num(1)))])])),
  check(api){ for(const [hh,w,ans] of [[160,50,'19.5'],[175,70,'22.9']]){ api.restart(); api.type('txtHeight',String(hh)); api.type('txtWeight',String(w)); api.click('btnBMI');
      const got=String(api.prop('lblBMI','Text'));
      if(api.errors.length) return '執行時出現錯誤：'+api.errors[0];
      if(got!==ans){ const n=Number(got); if(Math.abs(n-Number(ans))<0.06) return `數字對了（${got}），但要取到小數 1 位，應該顯示 ${ans}。`;
        return `身高 ${hh}、體重 ${w}，BMI 應該是 ${ans}，現在顯示「${got}」。記得公分要先除以 100。`; } }
    return null; } });

lab('vars:var',{ title:'按鈕計數器',
  goal:'每按一次 <b>Button1</b>，Label1 就顯示「按了 <i>N</i> 次」（N 是目前按的次數）。',
  hint:'在事件外面放「初始化全域變數 次數 為 0」；按鈕事件裡「設置 global 次數 為 取得 global 次數 + 1」，再用合併文字顯示。',
  comps:[C('Button1','Button',{Text:'按我'}),C('Label1','Label',{Text:'按了 0 次',FontSize:22})],
  cats:['math','text','vars'],
  solution:h=>h.stack(h.global('次數',h.num(0)),h.ev('Button1','Click',[h.vset('global 次數',h.add(h.vget('global 次數'),h.num(1))),h.set('Label1','Text',h.join(h.txt('按了 '),h.vget('global 次數'),h.txt(' 次')))])),
  check(api){ api.run(); for(let i=1;i<=3;i++){ api.click('Button1'); const t=String(api.prop('Label1','Text')).replace(/\s/g,'');
      if(t!==`按了${i}次`) return `按了 ${i} 次後，Label1 應該是「按了 ${i} 次」，現在是「${api.prop('Label1','Text')}」。`; }
    return null; } });

lab('vars:tinydb',{ title:'記住最高分',
  goal:'已經幫你做好 +1 按鈕。請完成：①按 <b>btnSave</b> 把分數存進 TinyDB1，標籤叫「最高分」　②App 一打開，<b>lblBest</b> 顯示存過的最高分（沒存過就顯示 0）。<br>做好後按手機下方的「關閉 App 再打開」，看看分數還在不在。',
  hint:'存：「呼叫 TinyDB1.儲存數值 標籤 "最高分" 儲存值 取得 global 分數」。讀：Screen1.初始化 裡「設 lblBest.文字 為 呼叫 TinyDB1.取得數值 標籤 "最高分" 無標籤時之回傳值 0」。',
  comps:[C('HorizontalArrangement1','HorizontalArrangement',{},[C('btnPlus','Button',{Text:'+1'}),C('btnSave','Button',{Text:'儲存'})]),C('lblScore','Label',{Text:'0',FontSize:28}),C('lblBest','Label',{Text:'最高分：?'}),C('TinyDB1','TinyDB')],
  cats:['text','math','vars'], db:true,
  start:h=>h.stack(h.global('分數',h.num(0)),h.ev('btnPlus','Click',[h.vset('global 分數',h.add(h.vget('global 分數'),h.num(1))),h.set('lblScore','Text',h.vget('global 分數'))])),
  solution:h=>h.stack(h.global('分數',h.num(0)),h.ev('btnPlus','Click',[h.vset('global 分數',h.add(h.vget('global 分數'),h.num(1))),h.set('lblScore','Text',h.vget('global 分數'))]),
    h.ev('btnSave','Click',[h.call('TinyDB1','StoreValue',h.txt('最高分'),h.vget('global 分數'))]),
    h.ev('Screen1','Initialize',[h.set('lblBest','Text',h.call('TinyDB1','GetValue',h.txt('最高分'),h.num(0)))])),
  check(api){ api.db.clear(); api.run();
    if(String(api.prop('lblBest','Text'))!=='0') return `第一次打開（還沒存過），lblBest 應該顯示 0，現在是「${api.prop('lblBest','Text')}」。`;
    for(let i=0;i<4;i++) api.click('btnPlus'); api.click('btnSave');
    if(!api.db.has('最高分')) return '按了儲存，但 TinyDB 裡沒有標籤「最高分」的資料。';
    api.restart();
    if(String(api.prop('lblBest','Text'))!=='4') return `存了 4 分，重新打開 App 後 lblBest 應該顯示 4，現在是「${api.prop('lblBest','Text')}」。`;
    return null; } });

lab('if:ifelse',{ title:'成績判斷',
  goal:'按下 <b>btnCheck</b>：分數 ≥ 90 顯示「優等」，≥ 60 顯示「及格」，其他顯示「加油」，結果放在 lblResult。',
  hint:'拿「如果 則 否則如果 則 否則」那一塊（控制），條件用數學的比較積木，把 = 改成 ≥。',
  comps:[C('txtScore','TextBox',{Hint:'輸入分數',NumbersOnly:true}),C('btnCheck','Button',{Text:'判斷'}),C('lblResult','Label',{Text:'',FontSize:24})],
  cats:['control','logic','math','text','vars'],
  solution:h=>h.stack(h.ev('btnCheck','Click',[h.ifs([[h.cmp('GTE',h.get('txtScore','Text'),h.num(90)),[h.set('lblResult','Text',h.txt('優等'))]],[h.cmp('GTE',h.get('txtScore','Text'),h.num(60)),[h.set('lblResult','Text',h.txt('及格'))]]],[h.set('lblResult','Text',h.txt('加油'))])])),
  check(api){ for(const [s,a] of [[95,'優等'],[90,'優等'],[75,'及格'],[60,'及格'],[59,'加油'],[0,'加油']]){ api.restart(); api.type('txtScore',String(s)); api.click('btnCheck');
      if(api.errors.length) return '執行時出現錯誤：'+api.errors[0];
      if(api.prop('lblResult','Text')!==a) return `分數 ${s} 應該顯示「${a}」，現在是「${api.prop('lblResult','Text')}」。`; }
    return null; } });

lab('list:lists',{ title:'抽籤機',
  goal:'建立一個<b>至少 3 個名字</b>的清單（全域變數），按 <b>btnDraw</b> 隨機抽一個名字顯示在 lblName。',
  hint:'「初始化全域變數 名單 為 建立清單 …」；抽籤用「選擇清單 取得 global 名單 中索引值為 從 1 到 求清單的長度 之間的隨機整數 的清單項目」。',
  comps:[C('btnDraw','Button',{Text:'抽籤！',FontSize:20}),C('lblName','Label',{Text:'？',FontSize:32})],
  cats:['math','text','lists','vars'],
  solution:h=>h.stack(h.global('名單',h.list(h.txt('小明'),h.txt('小華'),h.txt('小美'),h.txt('阿凱'))),h.ev('btnDraw','Click',[h.set('lblName','Text',h.pick(h.vget('global 名單'),h.rnd(h.num(1),h.llen(h.vget('global 名單')))))])),
  check(api){ api.run(); const seen=new Set();
    for(let i=0;i<60;i++){ api.click('btnDraw'); if(api.errors.length) return '執行時出現錯誤：'+api.errors[0];
      const t=api.prop('lblName','Text'); if(Array.isArray(t)) return 'lblName 顯示的是整個清單，要用「選擇清單項目」挑出一個。';
      if(t===''||t==='？') return '按了抽籤，lblName 沒有顯示名字。'; seen.add(String(t)); }
    if(seen.size<3) return `按了 60 次只抽到 ${seen.size} 種結果，清單要有至少 3 個名字，而且索引要用隨機整數。`;
    return null; } });

lab('list:loops',{ title:'1 加到 100',
  goal:'按下 <b>Button1</b>，用<b>迴圈</b>算出 1 + 2 + … + 100，把答案顯示在 Label1。',
  hint:'「初始化區域變數 總和 為 0」裡面放「對每個 數字 範圍從 1 到 100 每次增加 1」，迴圈裡「設置 總和 為 取得 總和 + 取得 數字」。',
  comps:[C('Button1','Button',{Text:'計算'}),C('Label1','Label',{Text:'',FontSize:28})],
  cats:['control','math','vars'],
  solution:h=>h.stack(h.ev('Button1','Click',[h.local('總和',h.num(0),[h.forRange('數字',h.num(1),h.num(100),h.num(1),[h.vset('總和',h.add(h.vget('總和'),h.vget('數字')))]),h.set('Label1','Text',h.vget('總和'))])])),
  check(api){ if(!api.has('controls_forRange')&&!api.has('controls_while')&&!api.has('controls_forEach')) return '這題要用迴圈積木（對每個數字…）來算，不能直接打答案喔。';
    api.run(); api.click('Button1'); if(api.errors.length) return '執行時出現錯誤：'+api.errors[0];
    if(String(api.prop('Label1','Text'))!=='5050') return `答案應該是 5050，現在顯示「${api.prop('Label1','Text')}」。`;
    return null; } });

lab('anim:clock',{ title:'10 秒倒數',
  goal:'lblTime 從 10 開始，<b>每秒減 1</b>；減到 0 時把 Clock1 的「啟用計時」設為假，並跳出「時間到！」。',
  hint:'全域變數 秒數 從 10 開始。Clock1.計時 裡：秒數 減 1 → 顯示 → 如果 秒數 ≤ 0 則 停止計時、顯示警告訊息。',
  comps:[C('lblTime','Label',{Text:'10',FontSize:48}),C('Clock1','Clock',{TimerInterval:1000,TimerEnabled:true}),C('Notifier1','Notifier')],
  cats:['control','logic','math','text','vars'],
  solution:h=>h.stack(h.global('秒數',h.num(10)),h.ev('Clock1','Timer',[h.vset('global 秒數',h.sub(h.vget('global 秒數'),h.num(1))),h.set('lblTime','Text',h.vget('global 秒數')),
    h.if(h.cmp('LTE',h.vget('global 秒數'),h.num(0)),[h.set('Clock1','TimerEnabled',h.bool(false)),h.call('Notifier1','ShowAlert',h.txt('時間到！'))])])),
  check(api){ api.run(); api.tick(3);
    if(String(api.prop('lblTime','Text'))!=='7') return `過了 3 秒應該顯示 7，現在是「${api.prop('lblTime','Text')}」。`;
    api.tick(7); if(String(api.prop('lblTime','Text'))!=='0') return `過了 10 秒應該顯示 0，現在是「${api.prop('lblTime','Text')}」。`;
    if(api.prop('Clock1','TimerEnabled')!==false) return '到 0 了，但 Clock1 還在計時，要把「啟用計時」設為假。';
    if(!api.alerts.length) return '到 0 時要跳出「時間到！」提示。';
    api.tick(3); if(String(api.prop('lblTime','Text'))!=='0') return '停止後秒數還在變，檢查「啟用計時」有沒有設為假。';
    return null; } });

lab('anim:sprite',{ title:'彈跳球',
  goal:'①App 打開時，Ball1 的<b>指向</b>設為 45、<b>速度</b>設為 8　②Ball1 <b>到達邊界</b>時<b>反彈</b>　③<b>點到</b>球，分數 +1 顯示在 lblScore。',
  hint:'反彈要用「呼叫 Ball1.反彈 邊緣數值」，邊緣數值用 Ball1 抽屜裡的「取得 邊緣數值」。',
  comps:[C('Canvas1','Canvas',{BackgroundColor:'#e8f4ff',Height:260},[C('Ball1','Ball',{Radius:14,PaintColor:'#ff0000',X:40,Y:40,Interval:30})]),C('lblScore','Label',{Text:'0',FontSize:24})],
  cats:['math','vars'],
  solution:h=>h.stack(h.global('分數',h.num(0)),h.ev('Screen1','Initialize',[h.set('Ball1','Heading',h.num(45)),h.set('Ball1','Speed',h.num(8))]),
    h.ev('Ball1','EdgeReached',[h.call('Ball1','Bounce',h.vget('edge'))]),
    h.ev('Ball1','Touched',[h.vset('global 分數',h.add(h.vget('global 分數'),h.num(1))),h.set('lblScore','Text',h.vget('global 分數'))])),
  check(api){ api.run();
    if(Number(api.prop('Ball1','Heading'))!==45||Number(api.prop('Ball1','Speed'))!==8) return 'App 打開時，Ball1 的指向要設成 45、速度要設成 8。';
    api.step(300); const b=api.ballBox('Ball1');
    if(api.bounces('Ball1')<2) return '球撞到邊界沒有反彈，在「當 Ball1.到達邊界」裡呼叫 Ball1.反彈。';
    if(!b.inside) return '球跑出畫布了。';
    api.touch('Ball1'); api.touch('Ball1');
    if(String(api.prop('lblScore','Text'))!=='2') return `點了球 2 次，lblScore 應該是 2，現在是「${api.prop('lblScore','Text')}」。`;
    return null; } });

lab('sensor:sense',{ title:'搖一搖骰子',
  goal:'手機<b>被晃動</b>時：隨機產生 1～6，顯示在 lblDice、<b>播放</b> Sound1，並用 TextToSpeech1 <b>唸出</b>「你擲出了 <i>N</i>」。',
  hint:'先把隨機數存進全域變數 點數，同一個數字才能又顯示又唸出來。',
  comps:[C('lblDice','Label',{Text:'🎲',FontSize:64}),C('AccelerometerSensor1','AccelerometerSensor'),C('Sound1','Sound',{Source:'dice.wav'}),C('TextToSpeech1','TextToSpeech')],
  cats:['math','text','vars'],
  solution:h=>h.stack(h.global('點數',h.num(0)),h.ev('AccelerometerSensor1','Shaking',[h.vset('global 點數',h.rnd(h.num(1),h.num(6))),h.set('lblDice','Text',h.vget('global 點數')),h.call('Sound1','Play'),h.call('TextToSpeech1','Speak',h.join(h.txt('你擲出了 '),h.vget('global 點數')))])),
  check(api){ api.run(); const seen=new Set();
    for(let i=0;i<40;i++){ api.shake(); if(api.errors.length) return '執行時出現錯誤：'+api.errors[0];
      const d=String(api.prop('lblDice','Text')); if(!/^[1-6]$/.test(d)) return `lblDice 應該是 1～6 的數字，現在是「${d}」。`; seen.add(d);
      const said=api.spoken[api.spoken.length-1]||''; if(!said.includes(d)) return `手機唸的是「${said||'（沒唸）'}」，要和畫面上的點數 ${d} 一樣。`; }
    if(seen.size<4) return '骰子點數好像不夠隨機，用「從 1 到 6 之間的隨機整數」。';
    if(api.plays<40) return '搖一搖時還沒有播放 Sound1。';
    return null; } });

lab('proc:procedure',{ title:'重新開始程序',
  goal:'+1 按鈕已經做好。請定義程序<b>「重新開始」</b>：把分數設成 0、lblScore 顯示 0。然後在 <b>Screen1.初始化</b> 和 <b>btnRestart 被點選</b>時都呼叫它。',
  hint:'「內建方塊 › 程序」拿「定義程序」，把名字改成 重新開始；定義好之後，同一個抽屜就會出現「呼叫 重新開始」。',
  comps:[C('lblScore','Label',{Text:'?',FontSize:36}),C('HorizontalArrangement1','HorizontalArrangement',{},[C('btnAdd','Button',{Text:'+1'}),C('btnRestart','Button',{Text:'重新開始'})])],
  cats:['math','vars','procs'],
  start:h=>h.stack(h.global('分數',h.num(0)),h.ev('btnAdd','Click',[h.vset('global 分數',h.add(h.vget('global 分數'),h.num(1))),h.set('lblScore','Text',h.vget('global 分數'))])),
  solution:h=>h.stack(h.global('分數',h.num(0)),h.ev('btnAdd','Click',[h.vset('global 分數',h.add(h.vget('global 分數'),h.num(1))),h.set('lblScore','Text',h.vget('global 分數'))]),
    h.proc('重新開始',[h.vset('global 分數',h.num(0)),h.set('lblScore','Text',h.num(0))]),
    h.ev('Screen1','Initialize',[h.pcall('重新開始')]),h.ev('btnRestart','Click',[h.pcall('重新開始')])),
  check(api){ if(!api.has('procedures_defnoreturn')) return '還沒有「定義程序」積木。';
    if(api.count('procedures_callnoreturn')<2) return '程序要呼叫兩次：Screen1.初始化 一次、btnRestart 被點選 一次。';
    api.run(); if(String(api.prop('lblScore','Text'))!=='0') return `App 打開時應該顯示 0，現在是「${api.prop('lblScore','Text')}」。`;
    api.click('btnAdd'); api.click('btnAdd'); api.click('btnAdd');
    if(String(api.prop('lblScore','Text'))!=='3') return '按了 3 次 +1，應該顯示 3。';
    api.click('btnRestart'); if(String(api.prop('lblScore','Text'))!=='0') return '按重新開始後應該回到 0。';
    api.click('btnAdd'); if(String(api.prop('lblScore','Text'))!=='1') return '重新開始後再按 +1 應該是 1，分數變數有歸零嗎？';
    return null; } });

function norm(s){ return String(s).replace(/,/g,'，').replace(/!/g,'！').replace(/\s+/g,''); }

// ---------- 直譯器 ----------
class RTError extends Error {}
const isList = v => Array.isArray(v);
function fmt(v){
  if(isList(v)) return '('+v.map(fmt).join(' ')+')';
  if(typeof v==='boolean') return v?'true':'false';
  if(typeof v==='number'){ if(Number.isInteger(v)) return String(v); return String(Math.round(v*1e10)/1e10); }
  if(v==null) return '';
  return String(v);
}
function toNum(v,what){
  if(typeof v==='number') return v;
  if(typeof v==='string' && v.trim()!=='' && !isNaN(Number(v.trim()))) return Number(v.trim());
  throw new RTError(`${what||'數學運算'}需要數字，但收到「${fmt(v)}」`);
}
function toBool(v){ if(typeof v==='boolean') return v; if(v==='true') return true; if(v==='false') return false; throw new RTError(`這裡需要真或假，但收到「${fmt(v)}」`); }

class Runtime {
  // lab: 練習題；comps: 元件樹；blocks: 頂層積木（JSON）；opts: {db:Map, ui}
  constructor(comps, blocks, opts={}){
    this.compsTree=clone(comps); this.blocks=blocks||[]; this.db=opts.db||new Map(); this.ui=opts.ui||null; this.screen=opts.screen||{};
    this.canvasW=opts.canvasW||280;
  }
  start(){
    this.p={}; this.type={}; this.alerts=[]; this.spoken=[]; this.plays=0; this.vibes=0; this.errors=[]; this.drawings={}; this.bounceN={}; this.steps=0;
    const init=(name,type,props)=>{ this.type[name]=type; const o={}; SPEC[type].props.forEach(([n,,,d])=>o[n]=d); Object.assign(o,clone(props||{})); this.p[name]=o; };
    init('Screen1','Form',this.screen);
    flat(this.compsTree).forEach(c=>{ init(c.name,c.type,c.props); if(c.type==='Canvas') this.drawings[c.name]=[]; });
    this.parentOf={}; const walk=(l,par)=>(l||[]).forEach(c=>{ this.parentOf[c.name]=par; walk(c.children,c.name); }); walk(this.compsTree,'Screen1');
    // 事件與程序
    this.handlers={}; this.procs={}; this.dupes=[]; this.loose=0; this.globals={};
    this.blocks.forEach(b=>{
      if(b.type==='component_event'){ const k=b.extraState.inst+'.'+b.extraState.name; if(this.handlers[k]) this.dupes.push(k); else this.handlers[k]=b; }
      else if(b.type==='procedures_defnoreturn'||b.type==='procedures_defreturn') this.procs[b.fields.NAME]=b;
      else if(b.type!=='global_declaration') this.loose++;
    });
    this.dupes.forEach(k=>this.err(`「當 ${k.replace('.',' . ')}」有兩塊一模一樣的事件積木，只會執行第一塊。`));
    this.blocks.filter(b=>b.type==='global_declaration').forEach(b=>{ this.safe(()=>{ this.globals[b.fields.NAME]=this.val(b.inputs&&b.inputs.VALUE,null); }); });
    this.clockAt={}; this.spriteAt={};
    this.fire('Screen1','Initialize');
    return this;
  }
  err(m){ this.errors.push(m); if(this.ui) this.ui.error(m); }
  safe(f){ try{ return f(); }catch(e){ if(e instanceof RTError) this.err(e.message); else { this.err('程式出錯：'+e.message); } } }
  fire(inst,ev,args={}){
    const h=this.handlers[inst+'.'+ev]; if(!h) return false;
    this.budget=200000;
    const scope={vars:Object.assign({},args),parent:null};
    this.safe(()=>this.run(h.inputs&&h.inputs.DO,scope));
    if(this.ui) this.ui.update();
    return true;
  }
  tickBudget(){ if(--this.budget<0) throw new RTError('迴圈跑太久了，App 卡住了！檢查「當 滿足條件」的條件會不會變成假。'); }
  look(scope,name){ for(let s=scope;s;s=s.parent){ if(Object.prototype.hasOwnProperty.call(s.vars,name)) return s; } return null; }
  getVar(scope,name){
    if(name.startsWith('global ')){ const g=name.slice(7); if(!(g in this.globals)) throw new RTError(`找不到全域變數「${g}」，記得先「初始化全域變數」。`); return this.globals[g]; }
    const s=this.look(scope,name); if(!s) throw new RTError(`在這裡用不到變數「${name}」。`); return s.vars[name];
  }
  setVar(scope,name,v){
    if(name.startsWith('global ')){ const g=name.slice(7); if(!(g in this.globals)) throw new RTError(`找不到全域變數「${g}」。`); this.globals[g]=v; return; }
    const s=this.look(scope,name); if(!s) throw new RTError(`在這裡用不到變數「${name}」。`); s.vars[name]=v;
  }
  run(inp,scope){ let b=inp&&inp.block; while(b){ this.tickBudget(); this.stmt(b,scope); b=b.next&&b.next.block; } }
  arg(b,name,scope){ return this.val(b.inputs&&b.inputs[name],scope); }
  stmt(b,scope){
    const es=b.extraState||{}, f=b.fields||{};
    switch(b.type){
      case 'component_set_get': if(es.mode==='set') this.setProp(es.inst,es.prop,this.arg(b,'VALUE',scope)); return;
      case 'component_method': this.method(b,scope); return;
      case 'lexical_variable_set': this.setVar(scope,f.VAR,this.arg(b,'VALUE',scope)); return;
      case 'controls_if': {
        const n=(es.elseif||0)+1;
        for(let i=0;i<n;i++){ if(toBool(this.arg(b,'IF'+i,scope))){ this.run(b.inputs['DO'+i],scope); return; } }
        if(es.else) this.run(b.inputs.ELSE,scope); return; }
      case 'controls_forRange': {
        const a=toNum(this.arg(b,'START',scope)), e=toNum(this.arg(b,'END',scope)), st=toNum(this.arg(b,'STEP',scope));
        if(st===0) throw new RTError('迴圈的「每次增加」不能是 0。');
        for(let i=a; st>0?i<=e:i>=e; i+=st){ this.tickBudget(); const sc={vars:{[f.VAR]:i},parent:scope}; this.run(b.inputs.DO,sc); } return; }
      case 'controls_forEach': {
        const l=this.arg(b,'LIST',scope); if(!isList(l)) throw new RTError('「對於任意清單項目」需要一個清單。');
        for(const x of l.slice()){ this.tickBudget(); this.run(b.inputs.DO,{vars:{[f.VAR]:x},parent:scope}); } return; }
      case 'controls_while': while(toBool(this.arg(b,'TEST',scope))){ this.tickBudget(); this.run(b.inputs.DO,scope); } return;
      case 'local_declaration_statement': { const sc={vars:{[f.VAR0]:this.arg(b,'DECL0',scope)},parent:scope}; this.run(b.inputs&&b.inputs.STACK,sc); return; }
      case 'procedures_callnoreturn': this.callProc(b,scope); return;
      case 'lists_add_items': { const l=this.arg(b,'LIST',scope); if(!isList(l)) throw new RTError('「增加清單項目」需要一個清單。'); for(let i=0;i<(es.items||1);i++) l.push(this.arg(b,'ITEM'+i,scope)); return; }
      case 'lists_remove_item': { const l=this.arg(b,'LIST',scope), i=toNum(this.arg(b,'INDEX',scope)); this.idx(l,i,'刪除清單項目'); l.splice(i-1,1); return; }
      default: return; // 數值積木不能單獨當指令
    }
  }
  idx(l,i,what){ if(!isList(l)) throw new RTError(`「${what}」需要一個清單。`); if(!Number.isInteger(i)||i<1||i>l.length) throw new RTError(`${what}：索引值 ${fmt(i)} 超出範圍（清單只有 ${l.length} 項，索引從 1 開始）。`); }
  callProc(b,scope){
    const name=b.extraState.name, d=this.procs[name]; if(!d) throw new RTError(`找不到程序「${name}」。`);
    const vars={}; (d.extraState.params||[]).forEach((p,i)=>vars[p]=this.arg(b,'ARG'+i,scope));
    const sc={vars,parent:null};
    if(d.type==='procedures_defreturn') return this.arg(d,'RETURN',sc);
    this.run(d.inputs&&d.inputs.STACK,sc);
  }
  val(inp,scope){
    const b=inp&&inp.block; if(!b) throw new RTError('有積木的插槽是空的，還沒接上東西。');
    this.tickBudget();
    const es=b.extraState||{}, f=b.fields||{}, A=n=>this.arg(b,n,scope);
    if(b.type.startsWith('color_')){ const c=COLORS.find(x=>'color_'+x[0]===b.type); return c?c[2]:'#000000'; }
    switch(b.type){
      case 'text': return f.TEXT||'';
      case 'math_number': return toNum(f.NUM,'數字積木');
      case 'logic_boolean': return f.BOOL==='TRUE';
      case 'component_set_get': return this.getProp(es.inst,es.prop);
      case 'component_method': return this.method(b,scope);
      case 'lexical_variable_get': return this.getVar(scope,f.VAR);
      case 'text_join': { let s=''; for(let i=0;i<(es.items||0);i++) s+=fmt(A('ADD'+i)); return s; }
      case 'text_length': return fmt(A('VALUE')).length;
      case 'text_isEmpty': return fmt(A('VALUE')).length===0;
      case 'text_compare': { const a=fmt(A('TEXT1')), c=fmt(A('TEXT2')); return {LT:a<c,GT:a>c,EQUAL:a===c,NEQ:a!==c}[f.OP]; }
      case 'text_changeCase': { const t=fmt(A('TEXT')); return f.OP==='DOWNCASE'?t.toLowerCase():t.toUpperCase(); }
      case 'text_split': return fmt(A('TEXT')).split(fmt(A('AT')));
      case 'math_add': { let s=0; for(let i=0;i<(es.items||0);i++) s+=toNum(A('NUM'+i),'加法'); return s; }
      case 'math_multiply': { let s=1; for(let i=0;i<(es.items||0);i++) s*=toNum(A('NUM'+i),'乘法'); return s; }
      case 'math_subtract': return toNum(A('A'),'減法')-toNum(A('B'),'減法');
      case 'math_division': { const d=toNum(A('B'),'除法'); if(d===0) throw new RTError('不能除以 0。'); return toNum(A('A'),'除法')/d; }
      case 'math_power': return Math.pow(toNum(A('A'),'次方'),toNum(A('B'),'次方'));
      case 'math_random_int': { let a=Math.ceil(toNum(A('FROM'),'隨機整數')), c=Math.floor(toNum(A('TO'),'隨機整數')); if(a>c) [a,c]=[c,a]; return a+Math.floor(Math.random()*(c-a+1)); }
      case 'math_divide': { const x=toNum(A('DIVIDEND'),'除法'), y=toNum(A('DIVISOR'),'除法'); if(y===0) throw new RTError('不能除以 0。');
        if(f.OP==='QUOTIENT') return Math.trunc(x/y); if(f.OP==='REMAINDER') return x%y; return ((x%y)+y)%y; }
      case 'math_compare': { const op=f.OP;
        if(op==='EQ'||op==='NEQ'){ const a=A('A'), c=A('B'); let eq; try{ eq=toNum(a)===toNum(c); }catch(e){ eq=fmt(a)===fmt(c); } return op==='EQ'?eq:!eq; }
        const a=toNum(A('A'),'比較'), c=toNum(A('B'),'比較'); return {LT:a<c,LTE:a<=c,GT:a>c,GTE:a>=c}[op]; }
      case 'math_format_as_decimal': { const n=toNum(A('NUM'),'設為小數形式'), p=toNum(A('PLACES'),'位數'); return n.toFixed(Math.max(0,Math.min(20,p))); }
      case 'math_is_a_number': { const v=A('NUM'); try{ toNum(v); return true; }catch(e){ return false; } }
      case 'logic_operation': { const a=toBool(A('A')); if(f.OP==='OR') return a||toBool(A('B')); return a&&toBool(A('B')); }
      case 'logic_negate': return !toBool(A('BOOL'));
      case 'lists_create_with': { const l=[]; for(let i=0;i<(es.items||0);i++) l.push(A('ADD'+i)); return l; }
      case 'lists_select_item': { const l=A('LIST'), i=toNum(A('NUM'),'索引值'); this.idx(l,i,'選擇清單項目'); return l[i-1]; }
      case 'lists_length': { const l=A('LIST'); if(!isList(l)) throw new RTError('「求清單的長度」需要一個清單。'); return l.length; }
      case 'lists_is_in': { const x=A('ITEM'), l=A('LIST'); if(!isList(l)) throw new RTError('需要一個清單。'); return l.some(y=>fmt(y)===fmt(x)); }
      case 'procedures_callreturn': return this.callProc(b,scope);
      default: throw new RTError('這塊積木不能放在這裡：'+b.type);
    }
  }
  getProp(inst,prop){ if(!this.p[inst]) throw new RTError('找不到元件 '+inst); return this.p[inst][prop]; }
  setProp(inst,prop,v){
    const t=this.type[inst]; if(!t) throw new RTError('找不到元件 '+inst);
    const sp=propSpec(t,prop); const kind=sp[2];
    if(kind==='num') v=toNum(v,`${inst}.${sp[1]}`);
    else if(kind==='bool') v=toBool(v);
    else if(kind==='color'){ if(typeof v!=='string'||!/^#[0-9a-f]{6}$/i.test(v)) throw new RTError(`${inst}.${sp[1]} 需要一個顏色積木。`); v=v.toLowerCase(); }
    else if(kind==='text') v=isList(v)?fmt(v):(typeof v==='number'?v:fmt(v));
    this.p[inst][prop]=v;
    if(t==='Ball'&&prop==='Heading') this.p[inst][prop]=((v%360)+360)%360;
  }
  method(b,scope){
    const es=b.extraState, t=es.ctype, inst=es.inst, a=i=>this.arg(b,'ARG'+i,scope);
    switch(t+'.'+es.name){
      case 'Notifier.ShowAlert': { const m=fmt(a(0)); this.alerts.push(m); if(this.ui) this.ui.alert(m); return; }
      case 'Canvas.DrawCircle': this.drawings[inst].push({x:toNum(a(0)),y:toNum(a(1)),r:toNum(a(2)),fill:toBool(a(3))}); return;
      case 'Canvas.Clear': this.drawings[inst]=[]; return;
      case 'Ball.Bounce': this.bounce(inst,toNum(a(0),'邊緣數值')); return;
      case 'Ball.MoveTo': this.p[inst].X=toNum(a(0)); this.p[inst].Y=toNum(a(1)); return;
      case 'Sound.Play': this.plays++; if(this.ui) this.ui.sound(inst); return;
      case 'Sound.Vibrate': this.vibes++; if(this.ui) this.ui.vibrate(toNum(a(0))); return;
      case 'TextToSpeech.Speak': { const m=fmt(a(0)); this.spoken.push(m); if(this.ui) this.ui.speak(m); return; }
      case 'TinyDB.StoreValue': this.db.set(fmt(a(0)),clone(a(1))); if(this.ui) this.ui.dbChanged(); return;
      case 'TinyDB.GetValue': { const k=fmt(a(0)); return this.db.has(k)?clone(this.db.get(k)):a(1); }
      case 'TinyDB.ClearTag': this.db.delete(fmt(a(0))); if(this.ui) this.ui.dbChanged(); return;
      case 'TinyDB.ClearAll': this.db.clear(); if(this.ui) this.ui.dbChanged(); return;
    }
    throw new RTError('模擬器還不支援 '+inst+'.'+es.name);
  }
  // ---- 精靈 ----
  canvasSize(inst){ const cv=this.parentOf[inst]; return {w:this.canvasW,h:Number(this.p[cv].Height)||260}; }
  bounce(inst,edge){
    const p=this.p[inst]; let h=p.Heading;
    if(edge===3||edge===-3) h=180-h; else if(edge===1||edge===-1) h=-h; else if(edge) h=h+180;
    p.Heading=((h%360)+360)%360; this.bounceN[inst]=(this.bounceN[inst]||0)+1;
  }
  stepSprite(inst){
    const p=this.p[inst]; if(!(p.Speed>0)) return;
    const {w,h}=this.canvasSize(inst), d=p.Radius*2, rad=p.Heading*Math.PI/180;
    p.X+=p.Speed*Math.cos(rad); p.Y-=p.Speed*Math.sin(rad);
    const N=p.Y<0, S=p.Y+d>h, W=p.X<0, E=p.X+d>w;
    p.X=Math.max(0,Math.min(w-d,p.X)); p.Y=Math.max(0,Math.min(h-d,p.Y));
    const edge = N&&E?2 : S&&E?4 : S&&W?-2 : N&&W?-4 : N?1 : E?3 : S?-1 : W?-3 : 0;
    if(edge) this.fire(inst,'EdgeReached',{edge});
  }
  sprites(){ return Object.keys(this.type).filter(n=>this.type[n]==='Ball'); }
  collide(){ const s=this.sprites(); for(let i=0;i<s.length;i++) for(let j=i+1;j<s.length;j++){ const a=this.p[s[i]], b=this.p[s[j]];
      const dx=(a.X+a.Radius)-(b.X+b.Radius), dy=(a.Y+a.Radius)-(b.Y+b.Radius); if(Math.hypot(dx,dy)<a.Radius+b.Radius){ this.fire(s[i],'CollidedWith',{other:s[j]}); this.fire(s[j],'CollidedWith',{other:s[i]}); } } }
  clocks(){ return Object.keys(this.type).filter(n=>this.type[n]==='Clock'); }
}

// ---------- 檢查任務用的 API（無畫面） ----------
function makeApi(labDef, comps, blocks, db){
  const rt=new Runtime(comps,blocks,{db,screen:labDef.screen});
  let started=false;
  const ensure=()=>{ if(!started){ rt.start(); started=true; } };
  const all=[]; const walk=b=>{ if(!b) return; all.push(b); Object.values(b.inputs||{}).forEach(i=>walk(i.block)); if(b.next) walk(b.next.block); }; (blocks||[]).forEach(walk);
  const api={
    run(){ rt.start(); started=true; }, restart(){ rt.start(); started=true; },
    click(n){ ensure(); if(rt.p[n].Enabled===false) return; rt.fire(n,'Click'); },
    type(n,t){ ensure(); rt.p[n].Text=t; },
    prop(n,p){ ensure(); return rt.p[n][p]; },
    tick(k=1){ ensure(); for(let i=0;i<k;i++) rt.clocks().forEach(c=>{ if(rt.p[c].TimerEnabled) rt.fire(c,'Timer'); }); },
    step(k=1){ ensure(); for(let i=0;i<k;i++){ rt.sprites().forEach(s=>rt.stepSprite(s)); rt.collide(); } },
    touch(n){ ensure(); const p=rt.p[n]; rt.fire(n,'Touched',{x:p.X+p.Radius,y:p.Y+p.Radius}); },
    shake(){ ensure(); rt.clocks(); Object.keys(rt.type).filter(x=>rt.type[x]==='AccelerometerSensor').forEach(x=>rt.fire(x,'Shaking')); },
    bounces(n){ return rt.bounceN[n]||0; },
    ballBox(n){ const p=rt.p[n], {w,h}=rt.canvasSize(n); return {inside:p.X>=0&&p.Y>=0&&p.X+2*p.Radius<=w+0.01&&p.Y+2*p.Radius<=h+0.01}; },
    has(t){ return all.some(b=>b.type===t); }, count(t){ return all.filter(b=>b.type===t).length; },
    comps(){ return flat(comps); },
    get alerts(){ return rt.alerts||[]; }, get spoken(){ return rt.spoken||[]; }, get plays(){ return rt.plays||0; }, get errors(){ return rt.errors||[]; },
    db,
  };
  return api;
}
function check(key, comps, blocks, dbInit){
  const L=LABS[key]; const db=new Map(dbInit||[]);
  try{ const api=makeApi(L,comps,blocks,db); const r=L.check(api); return r?{ok:false,msg:r}:{ok:true}; }
  catch(e){ return {ok:false,msg:(e instanceof RTError?'':'')+'程式出錯：'+e.message}; }
}
function solutionOf(key){ const L=LABS[key]; const comps=L.solution&&L.solution.comps?L.solution.comps:L.comps; const bl=typeof L.solution==='function'?L.solution(H(comps)):[]; return {comps,blocks:bl}; }
function startOf(key){ const L=LABS[key]; return {comps:clone(L.comps), blocks:L.start?L.start(H(L.comps)):[]}; }

// ---------- 匯出成 App Inventor 的 .aia ----------
const xesc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function bxml(b){
  const es=b.extraState||{}, f=b.fields||{}, I=b.inputs||{};
  const fld=(n,v)=>`<field name="${n}">${xesc(v)}</field>`;
  const val=n=>I[n]&&I[n].block?`<value name="${n}">${bxml(I[n].block)}</value>`:'';
  const stm=n=>I[n]&&I[n].block?`<statement name="${n}">${bxml(I[n].block)}</statement>`:'';
  const pos=b.x!=null?` x="${Math.round(b.x)}" y="${Math.round(b.y)}"`:'';
  let type=b.type, inner='';
  switch(b.type){
    case 'component_event': inner=`<mutation component_type="${es.ctype}" is_generic="false" instance_name="${xesc(es.inst)}" event_name="${es.name}"></mutation>${fld('COMPONENT_SELECTOR',es.inst)}${stm('DO')}`; break;
    case 'component_set_get': inner=`<mutation component_type="${es.ctype}" set_or_get="${es.mode}" property_name="${es.prop}" is_generic="false" instance_name="${xesc(es.inst)}"></mutation>${fld('COMPONENT_SELECTOR',es.inst)}${fld('PROP',es.prop)}${es.mode==='set'?val('VALUE'):''}`; break;
    case 'component_method': { const m=mSpec(es.ctype,es.name); inner=`<mutation component_type="${es.ctype}" method_name="${es.name}" is_generic="false" instance_name="${xesc(es.inst)}"></mutation>${fld('COMPONENT_SELECTOR',es.inst)}${m.args.map((_,i)=>val('ARG'+i)).join('')}`; break; }
    case 'text': inner=fld('TEXT',f.TEXT||''); break;
    case 'math_number': inner=fld('NUM',f.NUM); break;
    case 'logic_boolean': inner=fld('BOOL',f.BOOL); break;
    case 'text_join': inner=`<mutation items="${es.items}"></mutation>`+[...Array(es.items).keys()].map(i=>val('ADD'+i)).join(''); break;
    case 'math_add': case 'math_multiply': inner=`<mutation items="${es.items}"></mutation>`+[...Array(es.items).keys()].map(i=>val('NUM'+i)).join(''); break;
    case 'lists_create_with': inner=`<mutation items="${es.items}"></mutation>`+[...Array(es.items).keys()].map(i=>val('ADD'+i)).join(''); break;
    case 'lists_add_items': inner=`<mutation items="${es.items||1}"></mutation>${val('LIST')}`+[...Array(es.items||1).keys()].map(i=>val('ITEM'+i)).join(''); break;
    case 'controls_if': { const n=(es.elseif||0)+1; inner=(es.elseif||es.else?`<mutation${es.elseif?` elseif="${es.elseif}"`:''}${es.else?' else="1"':''}></mutation>`:'');
      for(let i=0;i<n;i++) inner+=val('IF'+i)+stm('DO'+i); if(es.else) inner+=stm('ELSE'); break; }
    case 'controls_forRange': inner=fld('VAR',f.VAR)+val('START')+val('END')+val('STEP')+stm('DO'); break;
    case 'controls_forEach': inner=fld('VAR',f.VAR)+val('LIST')+stm('DO'); break;
    case 'controls_while': inner=val('TEST')+stm('DO'); break;
    case 'global_declaration': inner=fld('NAME',f.NAME)+val('VALUE'); break;
    case 'lexical_variable_get': inner=fld('VAR',f.VAR); break;
    case 'lexical_variable_set': inner=fld('VAR',f.VAR)+val('VALUE'); break;
    case 'local_declaration_statement': inner=`<mutation><localname name="${xesc(f.VAR0)}"></localname></mutation>${fld('VAR0',f.VAR0)}${val('DECL0')}${stm('STACK')}`; break;
    case 'procedures_defnoreturn': case 'procedures_defreturn': { const ps=es.params||[];
      inner=`<mutation>${ps.map(p=>`<arg name="${xesc(p)}"></arg>`).join('')}</mutation>${fld('NAME',f.NAME)}${ps.map((p,i)=>fld('VAR'+i,p)).join('')}${b.type==='procedures_defreturn'?val('RETURN'):stm('STACK')}`; break; }
    case 'procedures_callnoreturn': case 'procedures_callreturn': { const ps=es.params||[];
      inner=`<mutation name="${xesc(es.name)}">${ps.map(p=>`<arg name="${xesc(p)}"></arg>`).join('')}</mutation>${fld('PROCNAME',es.name)}${ps.map((_,i)=>val('ARG'+i)).join('')}`; break; }
    case 'text_length': case 'text_isEmpty': inner=val('VALUE'); break;
    case 'text_compare': inner=fld('OP',f.OP)+val('TEXT1')+val('TEXT2'); break;
    case 'text_changeCase': inner=fld('OP',f.OP)+val('TEXT'); break;
    case 'text_split': inner=fld('OP','SPLIT')+val('TEXT')+val('AT'); break;
    case 'math_subtract': case 'math_division': case 'math_power': inner=val('A')+val('B'); break;
    case 'math_random_int': inner=val('FROM')+val('TO'); break;
    case 'math_divide': inner=fld('OP',f.OP)+val('DIVIDEND')+val('DIVISOR'); break;
    case 'math_compare': inner=fld('OP',f.OP)+val('A')+val('B'); break;
    case 'math_format_as_decimal': inner=val('NUM')+val('PLACES'); break;
    case 'math_is_a_number': inner=fld('OP','NUMBER')+val('NUM'); break;
    case 'logic_operation': inner=fld('OP',f.OP)+val('A')+val('B'); break;
    case 'logic_negate': inner=val('BOOL'); break;
    case 'lists_select_item': inner=val('LIST')+val('NUM'); break;
    case 'lists_length': inner=val('LIST'); break;
    case 'lists_remove_item': inner=val('LIST')+val('INDEX'); break;
    case 'lists_is_in': inner=val('ITEM')+val('LIST'); break;
    default:
      if(b.type.startsWith('color_')){ const c=COLORS.find(x=>'color_'+x[0]===b.type); inner=fld('COLOR',c?c[2]:'#000000'); }
  }
  const nxt=b.next&&b.next.block?`<next>${bxml(b.next.block)}</next>`:'';
  return `<block type="${type}"${pos}>${inner}${nxt}</block>`;
}
function bky(blocks){
  return `<xml xmlns="http://www.w3.org/1999/xhtml">${(blocks||[]).map(bxml).join('')}<yacodeblocks ya-version="208" language-version="33"></yacodeblocks></xml>`;
}
const aiColor = hex => '&HFF'+hex.replace('#','').toUpperCase();
function scmProps(c){
  const o={'$Name':c.name,'$Type':c.type,'$Version':String(VERS[c.type])};
  Object.entries(c.props||{}).forEach(([k,v])=>{
    const sp=propSpec(c.type,k); if(!sp.length) return; const kind=sp[2];
    if(kind==='color'){ if(v) o[k]=aiColor(v); }
    else if(kind==='bool') o[k]=v?'True':'False';
    else if(kind==='width'){ if(v==='fill') o.Width='-2'; }
    else if(k==='Height') o.Height=String(v);
    else o[k]=String(v);
  });
  o.Uuid=String(Math.floor(Math.random()*2e9)-1e9);
  if(c.children&&c.children.length) o['$Components']=c.children.map(scmProps);
  return o;
}
function scm(proj,comps,screen){
  const form={'$Name':'Screen1','$Type':'Form','$Version':'27','AppName':proj,'Title':'Screen1','Sizing':'Responsive','Uuid':'0'};
  if(screen&&screen.BackgroundColor&&screen.BackgroundColor!=='#ffffff') form.BackgroundColor=aiColor(screen.BackgroundColor);
  if(comps.length) form['$Components']=comps.map(scmProps);
  return '#|\n$JSON\n'+JSON.stringify({authURL:['ai2.appinventor.mit.edu'],YaVersion:'208',Source:'Form',Properties:form})+'\n|#';
}
function props(proj){
  return [`main=appinventor.ai_student.${proj}.Screen1`,`name=${proj}`,'assets=../assets','source=../src','build=../build','versioncode=1','versionname=1.0','useslocation=False',`aname=${proj}`,'sizing=Responsive','showlistsasjson=True','actionbar=False','theme=Classic','color.primary=&HFF3F51B5','color.primary.dark=&HFF303F9F','color.accent=&HFFFF4081'].join('\n')+'\n';
}
function beepWav(){ // 0.25 秒的短音效（給 Sound 元件用）
  const sr=8000, n=2000, buf=new Uint8Array(44+n), dv=new DataView(buf.buffer); const w=(o,s)=>{ for(let i=0;i<s.length;i++) buf[o+i]=s.charCodeAt(i); };
  w(0,'RIFF'); dv.setUint32(4,36+n,true); w(8,'WAVE'); w(12,'fmt '); dv.setUint32(16,16,true); dv.setUint16(20,1,true); dv.setUint16(22,1,true);
  dv.setUint32(24,sr,true); dv.setUint32(28,sr,true); dv.setUint16(32,1,true); dv.setUint16(34,8,true); w(36,'data'); dv.setUint32(40,n,true);
  for(let i=0;i<n;i++){ const t=i/sr, env=Math.max(0,1-i/n); buf[44+i]=128+Math.round(90*env*Math.sin(2*Math.PI*(660+300*t)*t)); }
  return buf;
}
// 回傳 [[路徑, 內容(string|Uint8Array)], ...]
function aiaFiles(proj, comps, blocks, screen){
  const dir=`src/appinventor/ai_student/${proj}/`;
  const files=[['youngandroidproject/project.properties',props(proj)],[dir+'Screen1.scm',scm(proj,comps,screen)],[dir+'Screen1.bky',bky(blocks)]];
  const srcs=new Set(); flat(comps).forEach(c=>{ if(c.type==='Sound'&&c.props&&c.props.Source) srcs.add(c.props.Source); });
  srcs.forEach(s=>files.push(['assets/'+s,beepWav()]));
  return files;
}
const projName = key => 'Island_'+key.replace(/[^A-Za-z0-9]+/g,'_');

G.AI2CORE = {SPEC,DESIGN_ONLY,COLORS,LABS,H,Runtime,RTError,makeApi,check,solutionOf,startOf,aiaFiles,bky,scm,projName,flat,clone,fmt,propSpec,evSpec,mSpec};
})(typeof window!=='undefined'?window:globalThis);
