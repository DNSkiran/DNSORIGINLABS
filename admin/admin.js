const REPO="DNSkiran/DNSORIGINLABS";
const DATA_FILES=["data/tools.json","data/projects.json","data/tutorials.json","data/site.json"];
const SOURCE_FILES=["index.html","styles.css","src/main.js","src/page.js","src/downloads.js","src/interior.js","data/tools.json","data/projects.json","data/tutorials.json","data/site.json","pages/inner.css","pages/interior.js","pages/work.html","pages/tools.html","pages/pipeline.html","pages/learn.html","pages/about.html","pages/contact.html","docs/index.html","docs/ocio-encoder.html","docs/python-pipeline.html","docs/nuke-workflow.html","admin/index.html","admin/admin.js","admin/admin.css",".github/workflows/pages.yml","README.md"];
const $=selector=>document.querySelector(selector);
const draftKey=path=>`dns-origin-local-draft:${path}`;
const status=(node,message,type="")=>{node.textContent=message;node.className="editor-status"+(type?" "+type:"");};
const openGitHub=path=>window.open(`https://github.com/${REPO}/edit/main/${path}`,"_blank","noopener");
const download=(name,content,type="text/plain")=>{const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);};
let dataCache={};
let sourceCache={};

async function fetchRepoFile(path){
  const response=await fetch(`../${path}`,{cache:"no-store"});
  if(!response.ok)throw new Error(`Unable to fetch ${path} (${response.status})`);
  return response.text();
}
async function loadData(path,force=false){
  const key=draftKey(path);
  if(!force){const draft=localStorage.getItem(key);if(draft!==null)return draft;}
  return fetchRepoFile(path);
}
async function loadContent(force=false){
  const path=$("#content-file").value;
  const editor=$("#content-editor");
  try{
    const content=await loadData(path,force);
    editor.value=content;dataCache[path]=content;
    const local=localStorage.getItem(draftKey(path))!==null;
    status($("#content-status-message"),local?"Loaded this browser's saved draft.":"Loaded the repository file.", "success");
    renderVisualRecords();
  }catch(error){status($("#content-status-message"),error.message,"error");}
}
function validateContent(){
  const path=$("#content-file").value;
  try{
    const parsed=JSON.parse($("#content-editor").value);
    if(!parsed||typeof parsed!=="object")throw new Error("Root value must be an object.");
    const count=Array.isArray(parsed.items)?parsed.items.length:"configuration";
    status($("#content-status-message"),`Valid JSON. ${count} entries/configuration loaded. Save the draft or export it.`,"success");
    return true;
  }catch(error){status($("#content-status-message"),`JSON error: ${error.message}`,"error");return false;}
}
function saveDraft(path,content,node){
  localStorage.setItem(draftKey(path),content);
  status(node,`Local draft saved for ${path}. It has not been published.`,"success");
  updateDraftCount();
}
function escapeHTML(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;", "'":"&#39;"}[c]));}
function updateDraftCount(){
  let count=0;
  for(const path of [...DATA_FILES,...SOURCE_FILES])if(localStorage.getItem(draftKey(path))!==null)count++;
  const node=$("#stat-drafts");if(node)node.textContent=String(count);
}
function renderStatusList(tools,projects,tutorials){
  const target=$("#content-status");
  const groups=[["Tools",tools],["Projects",projects],["Tutorials",tutorials]];
  target.innerHTML=groups.map(([name,items])=>`<div class="status-row"><strong>${name}</strong><span>${items.filter(item=>item.status==="published").length} PUBLISHED / ${items.length} TOTAL</span></div>`).join("");
}
async function loadDashboard(){
  try{
    const [tools,projects,tutorials]=await Promise.all(DATA_FILES.slice(0,3).map(async path=>JSON.parse(await fetchRepoFile(path))));
    $("#stat-tools").textContent=tools.items?.length??0;
    $("#stat-projects").textContent=projects.items?.length??0;
    $("#stat-tutorials").textContent=tutorials.items?.length??0;
    renderStatusList(tools.items||[],projects.items||[],tutorials.items||[]);
  }catch(error){console.error(error);}
  updateDraftCount();
}
async function loadSource(){
  const path=$("#source-file").value;
  try{
    const content=await fetchRepoFile(path);
    sourceCache[path]=content;
    $("#source-editor").value=localStorage.getItem(draftKey(path))??content;
    status($("#source-status"),`Loaded ${path}. ${content.length.toLocaleString()} characters.`,"success");
  }catch(error){status($("#source-status"),error.message,"error");}
}
function activatePanel(name){
  document.querySelectorAll(".admin-panel").forEach(panel=>panel.classList.toggle("active",panel.id===`panel-${name}`));
  document.querySelectorAll(".admin-nav button").forEach(button=>button.classList.toggle("active",button.dataset.panel===name));
  const titles={dashboard:"Workspace overview",content:"Content manager",code:"Code editor",seo:"SEO & metadata",releases:"Release manager",assets:"Asset manager",github:"GitHub & deployment"};
  $("#panel-title").textContent=titles[name]||"Admin workspace";
  if(name==="content")loadContent();
  if(name==="code")loadSource();
  if(name==="releases")loadReleases();
  if(name==="seo")loadSEO();
}
const FIELDS={
 "data/tools.json":[["id","ID"],["name","Name"],["shortName","Short name"],["category","Category"],["tags","Tags (one per line)","array"],["description","Card description","textarea"],["longDescription","Full description","textarea"],["status","Status"],["version","Version"],["platforms","Platforms (one per line)","array"],["features","Features (one per line)","array"],["requirements","Requirements (one per line)","array"],["docs","Documentation path"],["repository","Repository URL"],["release.repo","Release repository"],["release.tag","Release tag (use latest for latest release)"],["release.assetName","Exact release asset filename"],["downloadEnabled","Enable download check","boolean"]],
 "data/projects.json":[["id","ID"],["title","Project title"],["discipline","Discipline"],["year","Year"],["status","Status (draft or published)"],["summary","Summary","textarea"],["credits","Verified credits and permissions","textarea"],["image","Image path or URL"],["showreel","Showreel URL"],["featured","Featured","boolean"]],
 "data/tutorials.json":[["id","ID"],["title","Title"],["category","Category"],["level","Level"],["status","Status (draft or published)"],["summary","Summary","textarea"],["body","Tutorial body","textarea"],["duration","Duration"],["featured","Featured","boolean"]]
};
let visualItems=[];
let visualSelected=0;
function renderVisualRecords(){
  const path=$("#content-file").value, doc=JSON.parse($("#content-editor").value||"{}");
  const select=$("#visual-record"), fields=$("#visual-record-fields");
  if(!Array.isArray(doc.items)||!FIELDS[path]){select.innerHTML="";select.disabled=true;fields.innerHTML="<p>This configuration uses the advanced JSON editor.</p>";return;}
  visualItems=doc.items;select.disabled=false;
  select.innerHTML=visualItems.map((item,index)=>`<option value="${index}">${escapeHTML(item.name||item.title||item.id||("Record "+(index+1)))}</option>`).join("");
  if(visualSelected>=visualItems.length)visualSelected=Math.max(0,visualItems.length-1);
  select.value=String(visualSelected);
  renderRecordFields();
}
function renderRecordFields(){
  const path=$("#content-file").value, item=visualItems[visualSelected]||{}, fields=$("#visual-record-fields");
  if(!FIELDS[path])return;
  fields.innerHTML=FIELDS[path].map(([key,label,type])=>{
    let value=key.startsWith("release.")?(item.release?.[key.split(".")[1]]||""):item[key];
    if(type==="boolean")return `<label class="visual-field visual-checkbox"><input type="checkbox" data-field="${key}" ${value?"checked":""}><span>${label}</span></label>`;
    if(type==="textarea"||type==="array")return `<label class="visual-field"><span>${label}</span><textarea data-field="${key}" rows="${type==="array"?3:4}" placeholder="${type==="array"?"One entry per line":""}">${escapeHTML(type==="array"?(Array.isArray(value)?value.join("\n"):""):(value??""))}</textarea></label>`;
    return `<label class="visual-field"><span>${label}</span><input data-field="${key}" type="text" value="${escapeHTML(value??"")}"></label>`;
  }).join("");
}
function createRecord(){
 const path=$("#content-file").value;
 const defaults={
  "data/tools.json":{id:"new-tool",name:"New tool",shortName:"New tool",category:"Python",tags:[],description:"Describe the tool.",longDescription:"",status:"Draft",version:"",platforms:[],features:[],requirements:[],docs:"../docs/index.html",repository:"https://github.com/DNSkiran/DNSORIGINLABS",release:null,downloadEnabled:false},
  "data/projects.json":{id:"new-project",title:"New project",discipline:"CG / Compositing",year:"",status:"draft",summary:"Add a project summary.",credits:"Add verified credits and publication permission.",image:"",showreel:"",featured:false},
  "data/tutorials.json":{id:"new-tutorial",title:"New tutorial",category:"Python",level:"Beginner",status:"draft",summary:"Add a short summary.",body:"Add tutorial content.",duration:"",featured:false}
 };
 if(!defaults[path])return;
 const parsed=JSON.parse($("#content-editor").value||"{}");
 const next={...defaults[path],id:`new-${Date.now()}`};
 parsed.items=[...(parsed.items||[]),next];
 $("#content-editor").value=JSON.stringify(parsed,null,2);
 visualSelected=parsed.items.length-1;renderVisualRecords();
 status($("#content-status-message"),"New record added. Apply visual fields and save the JSON draft when ready.","success");
}
function deleteRecord(){
 const path=$("#content-file").value, parsed=JSON.parse($("#content-editor").value||"{}");
 if(!Array.isArray(parsed.items)||!parsed.items.length)return;
 const entry=parsed.items[visualSelected];
 if(!confirm(`Delete "${entry.name||entry.title||entry.id}" from this local draft?`))return;
 parsed.items.splice(visualSelected,1);$("#content-editor").value=JSON.stringify(parsed,null,2);
 visualSelected=Math.max(0,visualSelected-1);renderVisualRecords();
 status($("#content-status-message"),"Record removed from the editor draft. Save or export to keep the change.","success");
}
function applyVisualRecord(){
 const path=$("#content-file").value,parsed=JSON.parse($("#content-editor").value||"{}");
 const item=parsed.items?.[visualSelected];if(!item)return;
 $("#visual-record-fields").querySelectorAll("[data-field]").forEach(input=>{
  const key=input.dataset.field;
  let value=input.type==="checkbox"?input.checked:input.value;
  if(input.tagName==="TEXTAREA"&&FIELDS[path].find(field=>field[0]===key)?.[2]==="array")value=value.split("\n").map(v=>v.trim()).filter(Boolean);
  if(key.startsWith("release.")){
    const sub=key.split(".")[1];item.release={...(item.release||{}),[sub]:value};
  }else item[key]=value;
 });
 if(path==="data/tools.json"&&(!item.release?.repo||!item.release?.tag))item.release=null;
 $("#content-editor").value=JSON.stringify(parsed,null,2);
 renderVisualRecords();
 status($("#content-status-message"),"Visual edits applied to the JSON editor. Validate, then save a local draft or export.","success");
}
async function loadSEO(){
 try{
  const site=JSON.parse(await loadData("data/site.json"));
  const seo=site.seo||{};
  $("#seo-url").value=seo.url||"https://dnskiran.github.io/DNSORIGINLABS/";
  $("#seo-title").value=seo.title||site.brand+" — "+site.tagline;
  $("#seo-description").value=seo.description||site.descriptor;
  $("#seo-image").value=seo.image||"./assets/og-cover.svg";
  status($("#seo-status"),"Metadata loaded. Save as a local draft before publishing.","success");
 }catch(error){status($("#seo-status"),error.message,"error");}
}
async function saveSEO(){
 try{
  const content=await loadData("data/site.json");
  const site=JSON.parse(content);
  site.seo={url:$("#seo-url").value.trim(),title:$("#seo-title").value.trim(),description:$("#seo-description").value.trim(),image:$("#seo-image").value.trim()};
  const output=JSON.stringify(site,null,2);
  saveDraft("data/site.json",output,$("#seo-status"));
  return output;
 }catch(error){status($("#seo-status"),error.message,"error");return null;}
}
async function loadReleases(){
  try{
    const tools=JSON.parse(await fetchRepoFile("data/tools.json")).items||[];
    $("#release-list").innerHTML=tools.map(tool=>`<div class="status-row"><strong>${escapeHTML(tool.name)}</strong><span>${tool.release?.repo?(`${escapeHTML(tool.release.repo)} / ${escapeHTML(tool.release.tag||"latest")}`):"NO RELEASE CONFIGURED"} · ${escapeHTML((tool.status||"").toUpperCase())}</span></div>`).join("");
  }catch(error){$("#release-list").textContent=error.message;}
}
function init(){
  document.querySelectorAll("[data-panel]").forEach(button=>button.addEventListener("click",()=>activatePanel(button.dataset.panel)));
  document.querySelectorAll("[data-goto]").forEach(button=>button.addEventListener("click",()=>activatePanel(button.dataset.goto)));
  $("#load-content").addEventListener("click",()=>loadContent(true));
  $("#visual-record").addEventListener("change",event=>{visualSelected=Number(event.target.value);renderRecordFields();});
  $("#add-record").addEventListener("click",createRecord);
  $("#delete-record").addEventListener("click",deleteRecord);
  $("#apply-record").addEventListener("click",()=>{if(validateContent())applyVisualRecord();});
  $("#validate-content").addEventListener("click",validateContent);
  $("#save-content-draft").addEventListener("click",()=>saveDraft($("#content-file").value,$("#content-editor").value,$("#content-status-message")));
  $("#export-content").addEventListener("click",()=>{if(validateContent())download($("#content-file").value.split("/").pop(),$("#content-editor").value,"application/json");});
  $("#open-content-github").addEventListener("click",()=>openGitHub($("#content-file").value));
  $("#content-file").addEventListener("change",()=>{visualSelected=0;loadContent();});
  $("#load-source").addEventListener("click",loadSource);
  $("#save-source-draft").addEventListener("click",()=>saveDraft($("#source-file").value,$("#source-editor").value,$("#source-status")));
  $("#discard-source-draft").addEventListener("click",()=>{localStorage.removeItem(draftKey($("#source-file").value));loadSource();updateDraftCount();});
  $("#export-source").addEventListener("click",()=>download($("#source-file").value.split("/").pop(),$("#source-editor").value));
  $("#open-source-github").addEventListener("click",()=>openGitHub($("#source-file").value));
  $("#source-file").addEventListener("change",loadSource);
  $("#load-seo").addEventListener("click",loadSEO);
  $("#save-seo-draft").addEventListener("click",saveSEO);
  $("#export-seo").addEventListener("click",async()=>{const output=await saveSEO();if(output)download("site.json",output,"application/json");});
  $("#open-seo-github").addEventListener("click",()=>openGitHub("data/site.json"));
  loadDashboard();
  loadContent();
}
init();