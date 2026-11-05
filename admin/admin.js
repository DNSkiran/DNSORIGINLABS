const REPO="DNSkiran/DNSORIGINLABS";
const DATA_FILES=["data/tools.json","data/projects.json","data/tutorials.json","data/site.json"];
const SOURCE_FILES=["index.html","styles.css","src/main.js","src/page.js","src/downloads.js","src/interior.js","data/tools.json","data/projects.json","data/tutorials.json","data/site.json","pages/inner.css","pages/work.html","pages/tools.html","pages/pipeline.html","pages/learn.html","pages/about.html","pages/contact.html","admin/admin.js","admin/admin.css",".github/workflows/pages.yml","README.md"];
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
async function loadContent(){
  const path=$("#content-file").value;
  const editor=$("#content-editor");
  try{const content=await loadData(path,true);editor.value=content;dataCache[path]=content;status($("#content-status-message"),`Loaded ${path} from the repository.`,"success");}
  catch(error){status($("#content-status-message"),error.message,"error");}
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
  const titles={dashboard:"Workspace overview",content:"Content manager",code:"Code editor",releases:"Release manager",assets:"Asset manager",github:"GitHub & deployment"};
  $("#panel-title").textContent=titles[name]||"Admin workspace";
  if(name==="content")loadContent();
  if(name==="code")loadSource();
  if(name==="releases")loadReleases();
}
async function loadReleases(){
  try{
    const tools=JSON.parse(await fetchRepoFile("data/tools.json")).items||[];
    $("#release-list").innerHTML=tools.map(tool=>`<div class="status-row"><strong>${tool.name}</strong><span>${tool.release?.repo?(`${tool.release.repo} / ${tool.release.tag||"latest"}`):"NO RELEASE CONFIGURED"} · ${tool.status.toUpperCase()}</span></div>`).join("");
  }catch(error){$("#release-list").textContent=error.message;}
}
function init(){
  document.querySelectorAll("[data-panel]").forEach(button=>button.addEventListener("click",()=>activatePanel(button.dataset.panel)));
  document.querySelectorAll("[data-goto]").forEach(button=>button.addEventListener("click",()=>activatePanel(button.dataset.goto)));
  $("#load-content").addEventListener("click",loadContent);
  $("#validate-content").addEventListener("click",validateContent);
  $("#save-content-draft").addEventListener("click",()=>saveDraft($("#content-file").value,$("#content-editor").value,$("#content-status-message")));
  $("#export-content").addEventListener("click",()=>{if(validateContent())download($("#content-file").value.split("/").pop(),$("#content-editor").value,"application/json");});
  $("#open-content-github").addEventListener("click",()=>openGitHub($("#content-file").value));
  $("#content-file").addEventListener("change",loadContent);
  $("#load-source").addEventListener("click",loadSource);
  $("#save-source-draft").addEventListener("click",()=>saveDraft($("#source-file").value,$("#source-editor").value,$("#source-status")));
  $("#discard-source-draft").addEventListener("click",()=>{localStorage.removeItem(draftKey($("#source-file").value));loadSource();updateDraftCount();});
  $("#export-source").addEventListener("click",()=>download($("#source-file").value.split("/").pop(),$("#source-editor").value));
  $("#open-source-github").addEventListener("click",()=>openGitHub($("#source-file").value));
  $("#source-file").addEventListener("change",loadSource);
  loadDashboard();
  loadContent();
}
init();