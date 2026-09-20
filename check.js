
const DATA_VERSION="0.15";
const DEFAULT={version:DATA_VERSION,configured:true,startingSavings:34000,annualPay:32000,target:75000,years:2,showEssentialsOutcome:true,flexible:288,recurring:[
      {name:"Gas",amount:40,frequency:"monthly"},
      {name:"Xiaomi",amount:3.50,frequency:"monthly"},
      {name:"F1",amount:50,frequency:"yearly"},
      {name:"iCloud",amount:12,frequency:"monthly"},
      {name:"ChatGPT",amount:8,frequency:"monthly"},
      {name:"Netflix",amount:20,frequency:"monthly"},
      {name:"Gamepass",amount:20,frequency:"monthly"},
      {name:"YouTube",amount:0.80,frequency:"monthly"},
      {name:"Mobile",amount:17.15,frequency:"monthly"},
      {name:"iRacing",amount:8,frequency:"monthly"},
      {name:"Hair",amount:28,frequency:"monthly"},
      {name:"Cloudigo",amount:3.40,frequency:"monthly"},
      {name:"Gym",amount:180,frequency:"yearly"},
      {name:"Car insurance",amount:400,frequency:"yearly"},
      {name:"Car license",amount:300,frequency:"yearly"}
    ],gifts:[
  {person:"Girlfriend",occasion:"Birthday",amount:200},
  {person:"Girlfriend",occasion:"Christmas",amount:200},
  {person:"Girlfriend",occasion:"Valentines",amount:100},
  {person:"Girlfriend",occasion:"Anniversary",amount:100},
  {person:"Mum",occasion:"Birthday",amount:100},
  {person:"Mum",occasion:"Christmas",amount:100},
  {person:"Dad",occasion:"Birthday",amount:100},
  {person:"Dad",occasion:"Christmas",amount:100},
  {person:"Sister",occasion:"Birthday",amount:50},
  {person:"Sister",occasion:"Christmas",amount:50},
  {person:"Sister's husband",occasion:"Birthday",amount:50},
  {person:"Sister's husband",occasion:"Christmas",amount:50},
  {person:"Child 1",occasion:"Birthday",amount:50},
  {person:"Child 1",occasion:"Christmas",amount:50},
  {person:"Child 2",occasion:"Birthday",amount:50},
  {person:"Child 2",occasion:"Christmas",amount:50}
],weekendFood:173.33,general:100,transactions:[],carry:0,carryHistory:[],stashHistory:[],monthlyActions:{},dark:false,theme:"iconic",openMonths:{},customSections:[]};
let state;
try{
  const saved=JSON.parse(localStorage.getItem("moneywise")||"null");
  if(saved && ["0.11","0.12","0.13","0.14","0.15"].includes(String(saved.version))){
    state={...structuredClone(DEFAULT),...saved,version:DATA_VERSION};
  }else{
    state=structuredClone(DEFAULT);
  }
}catch(e){
  state=structuredClone(DEFAULT);
}
Object.keys(DEFAULT).forEach(k=>{if(state[k]===undefined)state[k]=structuredClone(DEFAULT[k])});if(!state.budgetOpen)state.budgetOpen={recurring:false,gifts:false,other:false};if(!state.customSections)state.customSections=[];
if(!state.stashHistory)state.stashHistory=[];if(!state.monthlyActions)state.monthlyActions={};if(!state.theme)state.theme=state.dark?"dark":"iconic";
function save(){localStorage.setItem("moneywise",JSON.stringify(state))}
function euro(n){return new Intl.NumberFormat("en-IE",{style:"currency",currency:"EUR",maximumFractionDigits:2}).format(n)}
function monthKey(d=new Date()){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")}
function monthLabel(k){let [y,m]=k.split("-");return new Date(+y,+m-1,1).toLocaleString(undefined,{month:"long",year:"numeric"})}
function giftMonthly(){
  if(Array.isArray(state.gifts)){
    return state.gifts.reduce((sum,g)=>sum+(Number(g.amount)||0),0)/12;
  }
  return Number(state.gifts)||0;
}
function recurring(){
  return state.recurring.reduce((a,x)=>{
    const amount=Number(x.amount)||0;
    return a+(x.frequency==="yearly"?amount/12:amount);
  },0);
}
function planned(){return recurring()+giftMonthly()+state.weekendFood+state.general+customSectionsMonthly()}
function months(){let keys=[...new Set(state.transactions.map(x=>x.month))],now=monthKey();if(!keys.includes(now))keys.push(now);return keys.sort().reverse()}
function txs(k=monthKey()){return state.transactions.filter(x=>x.month===k)}
function spent(k=monthKey()){return txs(k).reduce((a,x)=>a+x.amount,0)}
function available(){return state.flexible+state.carry}
function remaining(){return available()-spent()}
function monthsInPlan(){return Math.max(1,Math.round(state.years*12))}
function theoreticalMax(){return state.startingSavings+state.annualPay*state.years}
function stashedTotal(){return (state.stashHistory||[]).reduce((a,x)=>a+(Number(x.amount)||0),0)}
function projected(){let m=monthsInPlan();return state.startingSavings+(state.annualPay/12-planned()-state.flexible)*m+stashedTotal()}
function essentialsOutcome(){let m=monthsInPlan();return state.startingSavings+(state.annualPay/12-planned())*m}
function render(tab="home"){
 document.body.classList.toggle("dark",state.theme==="dark");
 document.body.classList.toggle("iconic",state.theme==="iconic");
 let app=document.getElementById("app");app.innerHTML=tab==="home"?home():tab==="spend"?spend():tab==="budget"?budget():plan();
 document.querySelectorAll(".nav button").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab))
}
function home(){
 let a=available(),r=remaining(),pct=a?Math.max(0,Math.min(100,spent()/a*100)):0;
 return `<div class="top"><div style="display:flex;align-items:center;gap:10px"><img src="icon-192.png" style="width:36px;height:36px;border-radius:10px"><h1>MoneyWise</h1></div><div class="muted" style="margin-top:4px">${new Date().toLocaleString(undefined,{month:"long",year:"numeric"})}</div></div>
 <div class="card hero"><div class="muted">Available this month</div><div class="big">${euro(r)}</div><div class="progress"><div style="width:${pct}%"></div></div><div class="row small"><span>Spent ${euro(spent())}</span><span>Available ${euro(a)}</span></div><button onclick="openAdd()">＋ Add spending</button></div>
 <div class="grid"><div class="metric"><span class="muted">Base allowance</span><b>${euro(state.flexible)}</b></div><div class="metric"><span class="muted">Carried in</span><b>${euro(state.carry)}</b></div><div class="metric"><span class="muted">Target</span><b>${euro(state.target)}</b></div><div class="metric"><span class="muted">Projected</span><b>${euro(projected())}</b></div></div>
 <div class="card">
  <div class="row"><b>Unused allowance</b></div>
  <div class="muted" style="margin-bottom:10px">Choose what to do with money left at the end of the month.</div>
  ${state.monthlyActions?.[monthKey()]?`<div class="monthly-action-note">This month has been logged: <b>${esc(state.monthlyActions[monthKey()].label)}</b></div>`:""}
  <div class="carry-actions">
    <button class="secondary" onclick="carry()">Carry unused</button>
    <button class="secondary" onclick="stashUnused()">Stash / save</button>
    <button class="secondary" onclick="carryPortionAndStash()">Carry portion + stash rest</button>
  </div>
  ${state.carryHistory.length?`<div class="subhead">Carried</div>${state.carryHistory.slice().reverse().map((x,i)=>{let idx=state.carryHistory.length-1-i;return `<div class="item"><div class="row"><span>${monthLabel(x.from)} → ${monthLabel(x.to)}</span><b>${euro(x.amount)}</b></div><div style="text-align:right"><button class="icon" onclick="editCarry(${idx})" aria-label="Edit">✎</button><button class="icon delete" onclick="deleteCarry(${idx})" aria-label="Delete">⌫</button></div></div>`}).join("")}`:""}
  ${state.stashHistory.length?`<div class="subhead">Stashed / saved → projected pool</div>${state.stashHistory.slice().reverse().map((x,i)=>{let idx=state.stashHistory.length-1-i;return `<div class="item"><div class="row"><span>${monthLabel(x.month)}</span><b>${euro(x.amount)}</b></div><div style="text-align:right"><button class="icon" onclick="editStash(${idx})" aria-label="Edit">✎</button><button class="icon delete" onclick="deleteStash(${idx})" aria-label="Delete">⌫</button></div></div>`}).join("")}`:""}
  ${!state.carryHistory.length&&!state.stashHistory.length?'<div class="empty">No carry or stash records yet.</div>':''}
 </div>`;
}
function spend(){
 return `<div class="top"><h1>Spending</h1><div class="muted">Monthly breakdown</div></div>
 <div class="card hero"><div class="muted">Available this month</div><div class="big">${euro(available()-spent())}</div><div class="row small"><span>Base ${euro(state.flexible)}</span><span>Carried ${euro(state.carry)}</span><span>Spent ${euro(spent())}</span></div></div>
 <div class="card"><div class="row"><b>Planned Essentials</b><b>${euro(planned())}</b></div><div class="row small"><span>Recurring subscriptions & fixed costs</span><span>${euro(recurring())}</span></div><div class="row small"><span>Gifts</span><span>${euro(giftMonthly())}</span></div><div class="row small"><span>Food</span><span>${euro(state.weekendFood)}</span></div><div class="row small"><span>General</span><span>${euro(state.general)}</span></div><button class="secondary" onclick="editPlanned()">Edit additional allowance</button><button onclick="openAdd()">＋ Add spending</button></div>
 <div class="card">${months().map(k=>{let open=state.openMonths[k],total=spent(k),limit=state.flexible+(k===monthKey()?state.carry:0),diff=limit-total,cls=diff>=0?"under":"over",label=diff>=0?"Under limit":"Over limit";return `<div class="month-head ${cls}" onclick="toggleMonth('${k}')"><div class="row"><span><b>${monthLabel(k)}</b> <span class="status">${label}</span></span><span><b>${euro(total)}</b> ${open?"▲":"▼"}</span></div><div class="row small"><span>Available ${euro(limit)}</span><span>${diff>=0?euro(diff)+" left":euro(Math.abs(diff))+" over"}</span></div></div>${open?`<div>${txs(k).length?txs(k).map(x=>`<div class="item"><div class="row"><span>${esc(x.desc)} <span class="pill">${esc(x.cat)}</span></span><span>${euro(x.amount)}</span></div><div style="text-align:right"><button class="icon delete" onclick="delTx('${x.id}')">⌫</button></div></div>`).join(""):'<div class="empty">No spending recorded.</div>'}</div>`:""}`}).join("")}</div>`;
}
function budget(){
 const sections=[
  {key:"recurring",title:"Subscriptions / Recurring",subtitle:"Subscriptions & fixed recurring costs",content:budgetRecurring(),total:euro(recurring())+"/mo"},
  {key:"gifts",title:"Gifts & occasions",subtitle:"Birthdays, Christmas and other occasions",content:budgetGifts(),total:euro(giftMonthly())+"/mo"},
  {key:"other",title:"Monthly Spending Budget / Fun Money",subtitle:"Weekend food and general monthly spending",content:budgetOther(),total:euro(state.weekendFood+state.general)+"/mo"}
 ];
 const custom=(state.customSections||[]).map((s,i)=>({key:"custom-"+i,title:s.name,subtitle:"Custom section",content:budgetCustom(i),total:euro(customSectionMonthly(s))+"/mo"}));
 return `<div class="top"><h1>Budget</h1><div class="muted">Essentials & planned costs</div></div>
 <div class="card budget-overview">
  <div class="row"><b>Total Essentials</b><b>${euro(planned())}/mo</b></div>
  <div class="muted" style="margin-bottom:10px">This is the monthly amount planned across everything listed in the Budget below. The sections add up to this total.</div>
  <div class="budget-rundown">
    <div class="row small"><span>Subscriptions / Recurring</span><b>${euro(recurring())}</b></div>
    <div class="row small"><span>Gifts & occasions</span><b>${euro(giftMonthly())}</b></div>
    <div class="row small"><span>Monthly Spending Budget / Fun Money</span><b>${euro(state.weekendFood+state.general)}</b></div>
    ${(state.customSections||[]).map((s,i)=>`<div class="row small"><span>${esc(s.name)}</span><b>${euro(customSectionMonthly(s))}</b></div>`).join("")}
    <div class="budget-rundown-total row"><b>Total</b><b>${euro(planned())}</b></div>
  </div>
</div>
 ${sections.concat(custom).map(s=>`<div class="card budget-section">
   <button class="section-toggle" onclick="toggleBudgetSection('${esc(s.key)}')" aria-expanded="${state.budgetOpen?.[s.key]?'true':'false'}">
     <span><b>${esc(s.title)}</b><small>${esc(s.subtitle)}</small></span>
     <span class="section-right"><b>${s.total}</b><span class="chevron">${state.budgetOpen?.[s.key]?'⌃':'⌄'}</span></span>
   </button>
   ${state.budgetOpen?.[s.key]?`<div class="section-body">${s.content}</div>`:''}
 </div>`).join("")}
 <button onclick="addCustomSection()">＋ Add section</button>`;
}
function budgetRecurring(){
 return `${state.recurring.length?state.recurring.map((x,i)=>`<div class="item"><div class="row"><span>${esc(x.name)}</span><span>${euro(x.frequency==="yearly"?Number(x.amount)/12:Number(x.amount))}/mo <button class="icon" onclick="editRecurring(${i})" aria-label="Edit">✎</button><button class="icon delete" onclick="deleteRecurring(${i})" aria-label="Delete">⌫</button></span></div></div>`).join(""):'<div class="empty">Add your recurring essentials.</div>'}<button onclick="addRecurring()">＋ Add recurring</button>`;
}
function budgetGifts(){
 return `${Array.isArray(state.gifts)&&state.gifts.length?state.gifts.map((g,i)=>`<div class="item"><div class="row"><span>${esc(g.person)}<br><span class="muted">${esc(g.occasion)}</span></span><span style="display:flex;align-items:center;gap:6px"><span>${euro(g.amount)}</span><button class="icon" onclick="editGift(${i})" aria-label="Edit gift">✎</button><button class="icon delete" onclick="removeGiftDirect(${i})" aria-label="Delete gift">⌫</button></span></div></div>`).join(""):'<div class="empty">Add your gift occasions.</div>'}<button onclick="addGiftDirect()">＋ Add gift</button><button class="secondary" onclick="editGifts()">✎ Edit all gifts</button>`;
}
function budgetOther(){
 return `<div class="row small"><span>Weekend food</span><span>${euro(state.weekendFood)}</span></div><div class="row small"><span>General</span><span>${euro(state.general)}</span></div><button class="secondary" onclick="editOther()">✎ Edit</button>`;
}
function budgetCustom(i){
 const s=state.customSections[i];
 return `${(s.items||[]).length?s.items.map((x,j)=>`<div class="item"><div class="row"><span>${esc(x.name)}</span><span>${euro(x.amount)}/mo <button class="icon" onclick="editCustomItem(${i},${j})" aria-label="Edit">✎</button><button class="icon delete" onclick="deleteCustomItem(${i},${j})" aria-label="Delete">⌫</button></span></div></div>`).join(""):'<div class="empty">No items yet.</div>'}
 <button onclick="addCustomItem(${i})">＋ Add item</button><button class="secondary" onclick="editCustomSection(${i})">✎ Rename</button><button class="icon delete" onclick="deleteCustomSection(${i})" aria-label="Delete section">⌫</button>`;
}
function customSectionMonthly(s){return (s.items||[]).reduce((a,x)=>a+(Number(x.amount)||0),0)}
function customSectionsMonthly(){return (state.customSections||[]).reduce((a,s)=>a+customSectionMonthly(s),0)}
function plan(){
 let m=monthsInPlan(),p=projected(),ess=essentialsOutcome();
 return `<div class="top"><h1>Plan</h1><div class="muted">${state.years} year${state.years==1?"":"s"} • ${m} months</div></div>
 <div class="grid"><div class="metric"><span class="muted">Starting savings</span><b>${euro(state.startingSavings)}</b></div><div class="metric"><span class="muted">Annual income</span><b>${euro(state.annualPay)}</b></div><div class="metric"><span class="muted">Theoretical max</span><b>${euro(theoreticalMax())}</b></div><div class="metric"><span class="muted">Target</span><b>${euro(state.target)}</b></div></div>
 <div class="card"><div class="muted">Projected finish</div><div class="big">${euro(p)}</div><div class="row"><span>Buffer above target</span><b>${euro(p-state.target)}</b></div><div class="muted">Includes Essentials and your additional monthly allowance.</div></div>
 <div class="card"><div class="toggle"><div><b>Essentials-only outcome</b><div class="muted">Assumes nothing extra is spent from the Spend section.</div></div><div class="switch ${state.showEssentialsOutcome?"on":""}" onclick="toggleEssentials()"><i></i></div></div>${state.showEssentialsOutcome?`<div style="margin-top:18px"><div class="muted">Projected outcome</div><div class="big">${euro(ess)}</div><div class="row"><span>Buffer above target</span><b>${euro(ess-state.target)}</b></div></div>`:""}</div>
 <div class="card"><b>Plan assumptions</b><div class="row small"><span>Timeframe</span><span>${state.years} years</span></div><div class="row small"><span>Starting savings</span><span>${euro(state.startingSavings)}</span></div><div class="row small"><span>Annual income</span><span>${euro(state.annualPay)}</span></div><div class="row small"><span>Target</span><span>${euro(state.target)}</span></div><div class="row small"><span>Additional monthly allowance</span><span>${euro(state.flexible)}</span></div><button class="secondary" onclick="settings()">✎ Edit plan</button></div>
 <div class="card"><b>Appearance</b><div class="muted">Choose your MoneyWise look.</div><div class="theme-grid"><div class="theme-choice ${state.theme==="light"?"active":""}" onclick="setTheme('light')"><span class="theme-icon">☀️</span>Light</div><div class="theme-choice ${state.theme==="dark"?"active":""}" onclick="setTheme('dark')"><span class="theme-icon">🌙</span>Dark</div><div class="theme-choice ${state.theme==="iconic"?"active":""}" onclick="setTheme('iconic')"><span class="theme-icon">◈</span>Iconic</div></div></div>`;
}
function showSetup(){
 document.getElementById("sheet").innerHTML=`<h2>Welcome to MoneyWise</h2><p class="muted">Enter your private planning assumptions. They are stored only on this device.</p>${field("Timeframe (years)","sy",2,".5")}${field("Starting savings (€)","ss","",".01")}${field("Annual income (€)","si",""," .01")}${field("Target savings (€)","st",""," .01")}${field("Additional monthly allowance (€)","sf",""," .01")}<button onclick="finishSetup()">Save private plan</button>`;
 document.getElementById("modal").classList.add("open")
}
function finishSetup(){state.years=Math.max(.5,parseFloat(document.getElementById("sy").value)||2);state.startingSavings=Math.max(0,parseFloat(document.getElementById("ss").value)||0);state.annualPay=Math.max(0,parseFloat(document.getElementById("si").value)||0);state.target=Math.max(0,parseFloat(document.getElementById("st").value)||0);state.flexible=Math.max(0,parseFloat(document.getElementById("sf").value)||0);state.configured=true;save();closeModal();render("home")}
function openAdd(){document.getElementById("sheet").innerHTML=`<h2>Add spending</h2><label>Description</label><input id="desc" placeholder="e.g. Dinner"><label>Amount (€)</label><input id="amount" type="number" step=".01"><label>Category</label><select id="cat"><option>General</option><option>Food</option><option>Entertainment</option><option>Clothes</option><option>Transport</option><option>Gifts</option><option>Holiday</option><option>Other</option></select><button onclick="addTx()">Add</button> <button class="secondary" onclick="closeModal()">Cancel</button>`;document.getElementById("modal").classList.add("open")}
function addTx(){let desc=document.getElementById("desc").value.trim()||"Spending",amount=parseFloat(document.getElementById("amount").value);if(!amount||amount<=0)return alert("Enter a valid amount.");state.transactions.push({id:Date.now().toString(),month:monthKey(),desc,amount,cat:document.getElementById("cat").value});save();closeModal();render("spend")}
function delTx(id){state.transactions=state.transactions.filter(x=>x.id!==id);save();render("spend")}
function monthlyActionLogged(kind,month=monthKey()){
  return state.monthlyActions?.[month]?.kind===kind;
}
function confirmMonthlyAction(kind,label){
  const month=monthKey(),existing=state.monthlyActions?.[month];
  if(existing){
    return confirm(`${monthLabel(month)} has already been logged as "${existing.label}". Are you sure you want to do this again? This will add another ${label.toLowerCase()} record.`);
  }
  return true;
}
function logMonthlyAction(kind,label){
  state.monthlyActions=state.monthlyActions||{};
  state.monthlyActions[monthKey()]={kind,label};
}
function carry(){
  let r=Math.max(0,remaining());
  if(!r)return alert("There is no unused allowance to carry.");
  if(!confirmMonthlyAction("carry","Carry unused"))return;
  let from=monthKey(),d=new Date();d.setMonth(d.getMonth()+1);let to=monthKey(d);
  state.carryHistory.push({from,to,amount:r});state.carry=r;logMonthlyAction("carry","Carry unused");save();render("home")
}
function editCarry(i){let x=state.carryHistory[i];document.getElementById("sheet").innerHTML=`<h2>Edit carried allowance</h2><div class="muted">${monthLabel(x.from)} → ${monthLabel(x.to)}</div><label>Amount (€)</label><input id="ca" type="number" step=".01" value="${x.amount}"><button onclick="saveCarry(${i})">Save</button> <button class="secondary" onclick="closeModal()">Cancel</button>`;document.getElementById("modal").classList.add("open")}
function saveCarry(i){let a=parseFloat(document.getElementById("ca").value);if(isNaN(a)||a<0)return alert("Enter a valid amount.");state.carryHistory[i].amount=a;state.carry=a;save();closeModal();render("home")}
function deleteCarry(i){if(confirm("Delete this carried allowance?")){state.carryHistory.splice(i,1);state.carry=state.carryHistory.length?state.carryHistory[state.carryHistory.length-1].amount:0;save();render("home")}}
function stashUnused(){
  let r=Math.max(0,remaining());
  if(!r)return alert("There is no unused allowance to stash.");
  if(!confirmMonthlyAction("stash","Stash / save"))return;
  let month=monthKey();
  state.stashHistory.push({month,amount:r});
  state.carry=0;
  logMonthlyAction("stash","Stash / save");save();render("home");
}
function carryPortionAndStash(){
  let r=Math.max(0,remaining());
  if(!r)return alert("There is no unused allowance to split.");
  if(!confirmMonthlyAction("split","Carry portion + stash rest"))return;
  document.getElementById("sheet").innerHTML=`<h2>Carry portion + stash rest</h2><div class="muted">Unused allowance: ${euro(r)}. Enter how much you want to carry into next month. The rest will be stashed into the projected pool.</div>${field("Amount to carry (€)","cpa",r,".01")}<button onclick="saveCarryPortion()">Save split</button> <button class="secondary" onclick="closeModal()">Cancel</button>`;
  document.getElementById("modal").classList.add("open");
}
function saveCarryPortion(){
  let total=Math.max(0,remaining()),carryAmount=parseFloat(document.getElementById("cpa").value);
  if(isNaN(carryAmount)||carryAmount<0||carryAmount>total)return alert("Enter a carry amount between €0 and the unused allowance.");
  let stashAmount=total-carryAmount,from=monthKey(),d=new Date();d.setMonth(d.getMonth()+1);let to=monthKey(d);
  if(carryAmount>0){
    state.carryHistory.push({from,to,amount:carryAmount});
    state.carry=carryAmount;
  }else state.carry=0;
  if(stashAmount>0)state.stashHistory.push({month:from,amount:stashAmount});
  logMonthlyAction("split","Carry portion + stash rest");
  save();closeModal();render("home");
}
function editStash(i){
  let x=state.stashHistory[i];
  document.getElementById("sheet").innerHTML=`<h2>Edit stashed amount</h2><div class="muted">${monthLabel(x.month)} → added to projected pool</div>${field("Amount (€)","sa",x.amount,".01")}<button onclick="saveStash(${i})">Save</button> <button class="secondary" onclick="closeModal()">Cancel</button>`;
  document.getElementById("modal").classList.add("open");
}
function saveStash(i){
  let a=parseFloat(document.getElementById("sa").value);
  if(isNaN(a)||a<0)return alert("Enter a valid amount.");
  state.stashHistory[i].amount=a;save();closeModal();render("home");
}
function deleteStash(i){
  if(confirm("Delete this stashed amount?")){
    state.stashHistory.splice(i,1);save();render("home");
  }
}
function toggleMonth(k){state.openMonths[k]=!state.openMonths[k];save();render("spend")}
function editPlanned(){document.getElementById("sheet").innerHTML=`<h2>Additional allowance</h2><div class="muted">This is money available for spending from the Spend section.</div>${field("Monthly allowance (€)","fa",state.flexible,".01")}<button onclick="saveFlex()">Save</button> <button class="secondary" onclick="closeModal()">Cancel</button>`;document.getElementById("modal").classList.add("open")}
function saveFlex(){state.flexible=Math.max(0,parseFloat(document.getElementById("fa").value)||0);save();closeModal();render("spend")}
function addRecurring(){editRecurring(-1)}
function editRecurring(i){
  let x=i>=0?state.recurring[i]:{name:"",amount:0,frequency:"monthly"};
  document.getElementById("sheet").innerHTML=`<h2>${i>=0?"Edit":"Add"} recurring expense</h2>
  ${field("Name","rn",x.name,"","text")}
  ${field("Amount (€)","ra",x.amount,".01")}
  <label>Frequency</label><select id="rf"><option value="monthly" ${x.frequency==="monthly"?"selected":""}>Monthly</option><option value="yearly" ${x.frequency==="yearly"?"selected":""}>Yearly</option></select>
  <button onclick="saveRecurring(${i})">Save</button> <button class="secondary" onclick="closeModal()">Cancel</button>`;
  document.getElementById("modal").classList.add("open")
}
function saveRecurring(i){
  let n=document.getElementById("rn").value.trim(),a=parseFloat(document.getElementById("ra").value)||0,f=document.getElementById("rf").value;
  if(!n)return;
  let item={name:n,amount:a,frequency:f};
  if(i>=0)state.recurring[i]=item;else state.recurring.push(item);
  save();closeModal();render("budget")
}
function deleteRecurring(i){if(confirm("Delete this recurring expense?")){state.recurring.splice(i,1);save();render("budget")}}

function toggleBudgetSection(key){
  if(!state.budgetOpen)state.budgetOpen={};
  state.budgetOpen[key]=!state.budgetOpen[key];
  save();render("budget");
}
function addCustomSection(){
  state.customSections=state.customSections||[];
  state.customSections.push({name:"New section",items:[]});
  const i=state.customSections.length-1;
  save();editCustomSection(i);
}
function editCustomSection(i){
  const s=state.customSections[i];
  document.getElementById("sheet").innerHTML=`<h2>Edit section</h2>${field("Section name","csn",s.name,"","text")}<button onclick="saveCustomSection(${i})">Save</button> <button class="secondary" onclick="closeModal()">Cancel</button>`;
  document.getElementById("modal").classList.add("open");
}
function saveCustomSection(i){
  const n=document.getElementById("csn").value.trim();
  if(!n)return;
  state.customSections[i].name=n;save();closeModal();render("budget");
}
function deleteCustomSection(i){
  if(confirm("Delete this section and all its items?")){
    state.customSections.splice(i,1);save();render("budget");
  }
}
function addCustomItem(i){editCustomItem(i,-1)}
function editCustomItem(i,j){
  const x=j>=0?state.customSections[i].items[j]:{name:"",amount:0};
  document.getElementById("sheet").innerHTML=`<h2>${j>=0?"Edit":"Add"} item</h2>${field("Name","cin",x.name,"","text")}${field("Monthly amount (€)","cia",x.amount,".01")}<button onclick="saveCustomItem(${i},${j})">Save</button> <button class="secondary" onclick="closeModal()">Cancel</button>`;
  document.getElementById("modal").classList.add("open");
}
function saveCustomItem(i,j){
  const n=document.getElementById("cin").value.trim(),a=Math.max(0,parseFloat(document.getElementById("cia").value)||0);
  if(!n)return;
  const item={name:n,amount:a};
  if(j>=0)state.customSections[i].items[j]=item;else state.customSections[i].items.push(item);
  save();closeModal();render("budget");
}
function deleteCustomItem(i,j){
  if(confirm("Delete this item?")){state.customSections[i].items.splice(j,1);save();render("budget")}
}
function editGift(i){
  const g=state.gifts[i];
  document.getElementById("sheet").innerHTML=`<h2>Edit gift</h2>${field("Person","sgp",g.person,"","text")}${field("Occasion","sgo",g.occasion,"","text")}${field("Amount (€)","sgm",g.amount,".01")}<button onclick="saveGift(${i})">Save</button> <button class="secondary" onclick="closeModal()">Cancel</button>`;
  document.getElementById("modal").classList.add("open");
}
function saveGift(i){
  state.gifts[i].person=document.getElementById("sgp").value.trim()||"Gift";
  state.gifts[i].occasion=document.getElementById("sgo").value.trim()||"Occasion";
  state.gifts[i].amount=Math.max(0,parseFloat(document.getElementById("sgm").value)||0);
  save();closeModal();render("budget");
}
function removeGiftDirect(i){
  if(confirm("Delete this gift occasion?")){
    state.gifts.splice(i,1);save();render("budget");
  }
}
function addGiftDirect(){
  state.gifts.push({person:"",occasion:"",amount:0});
  editGifts();
}
function editGifts(){
  const rows=Array.isArray(state.gifts)?state.gifts:[];
  document.getElementById("sheet").innerHTML=`<h2>Gifts & occasions</h2>
    <div class="muted">€${giftMonthly().toFixed(2)}/month average • ${rows.length} occasions</div>
    <div id="giftEditorList" style="margin-top:14px">
      ${rows.map((g,i)=>giftEditorRow(g,i)).join("")}
    </div>
    <button class="secondary" onclick="addGift()">＋ Add gift</button>
    <button onclick="saveGifts()">Save changes</button>
    <button class="secondary" onclick="closeModal()">Cancel</button>`;
  document.getElementById("modal").classList.add("open")
}
function giftEditorRow(g,i){
  return `<div class="item gift-editor-row" id="gift-row-${i}">
    <div class="grid2">
      <div><label>Person</label><input id="gp-${i}" type="text" value="${esc(g.person)}"></div>
      <div><label>Occasion</label><input id="go-${i}" type="text" value="${esc(g.occasion)}"></div>
    </div>
    <div class="row" style="margin-top:8px">
      <label style="margin:0">Amount (€)</label>
      <span style="display:flex;gap:8px;align-items:center"><input id="gm-${i}" type="number" min="0" step=".01" value="${Number(g.amount)||0}" style="max-width:120px"><button class="icon delete" onclick="removeGift(${i})" aria-label="Delete gift">⌫</button></span>
    </div>
  </div>`
}
function addGift(){
  state.gifts.push({person:"",occasion:"",amount:0});
  editGifts();
}
function removeGift(i){
  if(confirm("Delete this gift occasion?")){
    state.gifts.splice(i,1);
    editGifts();
  }
}
function saveGifts(){
  const rows=Array.isArray(state.gifts)?state.gifts:[];
  rows.forEach((g,i)=>{
    g.person=document.getElementById("gp-"+i)?.value.trim()||"Gift";
    g.occasion=document.getElementById("go-"+i)?.value.trim()||"Occasion";
    g.amount=Math.max(0,parseFloat(document.getElementById("gm-"+i)?.value)||0);
  });
  state.gifts=rows;
  save();closeModal();render("budget")
}
function editOther(){document.getElementById("sheet").innerHTML=`<h2>Monthly Spending Budget / Fun Money</h2>${field("Weekend food (€ / month)","wf",state.weekendFood,".01")}${field("General (€ / month)","ge",state.general,".01")}<button onclick="saveOther()">Save</button> <button class="secondary" onclick="closeModal()">Cancel</button>`;document.getElementById("modal").classList.add("open")}
function saveOther(){state.weekendFood=Math.max(0,parseFloat(document.getElementById("wf").value)||0);state.general=Math.max(0,parseFloat(document.getElementById("ge").value)||0);save();closeModal();render("budget")}
function settings(){document.getElementById("sheet").innerHTML=`<h2>Edit plan</h2><p class="muted">These values are stored locally on this device.</p>${field("Timeframe (years)","py",state.years,".5")}${field("Starting savings (€)","ps",state.startingSavings,".01")}${field("Annual income (€)","pi",state.annualPay,".01")}${field("Target savings (€)","pt",state.target,".01")}${field("Additional monthly allowance (€)","pf",state.flexible,".01")}<button onclick="saveSettings()">Save</button> <button class="secondary" onclick="closeModal()">Cancel</button>`;document.getElementById("modal").classList.add("open")}
function saveSettings(){state.years=Math.max(.5,parseFloat(document.getElementById("py").value)||2);state.startingSavings=Math.max(0,parseFloat(document.getElementById("ps").value)||0);state.annualPay=Math.max(0,parseFloat(document.getElementById("pi").value)||0);state.target=Math.max(0,parseFloat(document.getElementById("pt").value)||0);state.flexible=Math.max(0,parseFloat(document.getElementById("pf").value)||0);save();closeModal();render("plan")}
function field(label,id,val,step=".01",type="number"){return `<label>${label}</label><input id="${id}" type="${type}" ${type==="number"?"min=\"0\" step=\""+step+"\"":""} value="${val===undefined?"":esc(val)}">`}
function setTheme(t){state.theme=t;state.dark=t==="dark";save();render("plan")}
function toggleEssentials(){state.showEssentialsOutcome=!state.showEssentialsOutcome;save();render("plan")}
function closeModal(){document.getElementById("modal").classList.remove("open")}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
document.querySelectorAll(".nav button").forEach(b=>b.addEventListener("click",()=>render(b.dataset.tab)));
render("home");/* Baseline loads directly; setup remains optional through editing. */
