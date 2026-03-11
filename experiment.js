const exportedRows = [];

const jsPsych = initJsPsych({
  on_finish: function () {

    const participantRow = jsPsych.data.get().filter({task:"participant"}).values()[0];
    let participant = "";

    if (participantRow && participantRow.response) {
      if (typeof participantRow.response === "string") {
        participant = JSON.parse(participantRow.response).Q0 || "";
      } else {
        participant = participantRow.response.Q0 || "";
      }
    }

    const versionRow = jsPsych.data.get().filter({task:"version"}).values()[0];
    const V = versionRow ? versionRow.version : "";

    const now = new Date();
    const timestamp =
      now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0") +
      String(now.getHours()).padStart(2, "0") +
      String(now.getMinutes()).padStart(2, "0");

    let csv =
      "Version,Block,TrialType,ShownWord,ToucheBonneReponse,Reponse,RT_FirstPress,RT_Final,Participant,TrialIndex\n";

    exportedRows.forEach((r, i) => {
      csv += [
        V,
        r.Block,
        r.TrialType,
        r.ShownWord,
        r.ToucheBonneReponse,
        r.Reponse,
        r.RT_FirstPress,
        r.RT_Final,
        participant,
        i + 1
      ].join(",") + "\n";
    });

    const filename = `${participant}_${timestamp}_results.csv`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);


    /* ---------- LOCAL DOWNLOAD (ESA backup) ---------- */

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();


    /* ---------- PCLOUD AUTO UPLOAD ---------- */

    console.log("Starting pCloud upload...");

    const uploadCode = "0UC7ZFmYMKNWnOyB3dxOYVJ6RBuUOMcxy";

    const formData = new FormData();
    formData.append("code", uploadCode);
    formData.append("files", blob, filename);

    fetch("https://api.pcloud.com/uploadtolink", {
      method: "POST",
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      console.log("pCloud upload response:", data);
    })
    .catch(error => {
      console.error("pCloud upload failed:", error);
    });

  }
});

let timeline = [];

/* ---------- FULLSCREEN ---------- */

timeline.push({
  type: jsPsychFullscreen,
  fullscreen_mode: true
});

/* ---------- PARTICIPANT ---------- */

timeline.push({
  type: jsPsychSurveyText,
  questions:[{prompt:"Enter Crew Member Code:", required:true}],
  data:{task:"participant"}
});

/* ---------- VERSION ---------- */

const V = Math.floor(Math.random()*16)+1;

timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  stimulus:"",
  choices:"NO_KEYS",
  trial_duration:1,
  data:{task:"version",version:V}
});

/* ---------- INSTRUCTION IMAGES ---------- */

const InstBloc1 = (V<9) ? "bloc1a.jpg" : "bloc1b.jpg";

const InstBloc2 = ((V<=4)||(V>=9 && V<=12))
? "bloc2a.jpg"
: "bloc2b.jpg";

const InstBloc3 = (
(V<=2)||(V>=5 && V<=6)||(V>=9 && V<=10)||(V>=13 && V<=14)
) ? "bloc3a.jpg" : "bloc3b.jpg";

const Break3 = (
(V<=2)||(V>=5 && V<=6)||(V>=9 && V<=10)||(V>=13 && V<=14)
) ? "bloc3aa.jpg" : "bloc3bb.jpg";

const InstBloc4 = (V<9) ? "bloc4a.jpg" : "bloc4b.jpg";

const InstBloc5 = (
(V<=2)||(V>=5 && V<=6)||(V>=9 && V<=10)||(V>=13 && V<=14)
) ? "bloc5a.jpg" : "bloc5b.jpg";

const Break5 = (
(V<=2)||(V>=5 && V<=6)||(V>=9 && V<=10)||(V>=13 && V<=14)
) ? "bloc5aa.jpg" : "bloc5bb.jpg";

/* ---------- STIMULI ---------- */

const ee_images=[
"ee1expressif.jpg","ee2emotionnel.jpg","ee3reveler.jpg","ee4montrer.jpg","ee5exprimer.jpg"];

const er_images=[
"er1controler.jpg","er2calme.jpg","er3controle.jpg","er4contenir.jpg","er5inhiber.jpg"];

const neg_images=[
"neg1desagreable.jpg","neg2mauvais.jpg","neg3sombre.jpg","neg4grossier.jpg","neg5pourri.jpg"];

const pos_images=[
"pos1agreable.jpg","pos2bon.jpg","pos3bien.jpg","pos4honneur.jpg","pos5chanceux.jpg"];

/* ---------- HELPERS ---------- */

function shuffle(a){
let arr=a.slice();
for(let i=arr.length-1;i>0;i--){
const j=Math.floor(Math.random()*(i+1));
[arr[i],arr[j]]=[arr[j],arr[i]];
}
return arr;
}

function buildTrials(images,keys,passes,block){
let trials=[];
for(let p=0;p<passes;p++){
const order=shuffle([...Array(images.length).keys()]);
order.forEach(i=>{
trials.push({Block:block,image:images[i],correct:keys[i]});
});
}
return trials;
}

function makeBlockInstruction(imageFile){
return {
type:jsPsychImageKeyboardResponse,
stimulus:imageFile,
choices:["a","l"]
};
}

/* ---------- BLOCK MAPPINGS ---------- */

const bloc1_images=[...ee_images,...er_images];
const bloc1_keys=(V<9)?
["l","l","l","l","l","a","a","a","a","a"]:
["a","a","a","a","a","l","l","l","l","l"];

const bloc2_images=[...neg_images,...pos_images];
const bloc2_keys=((V<5)||(V>=9&&V<=12))?
["l","l","l","l","l","a","a","a","a","a"]:
["a","a","a","a","a","l","l","l","l","l"];

const bloc3_images=[...ee_images,...er_images,...neg_images,...pos_images];

const bloc3_keys=((V<=2)||(V>=5&&V<=6)||(V>=9&&V<=10)||(V>=13&&V<=14))?
["l","l","l","l","l","a","a","a","a","a","l","l","l","l","l","a","a","a","a","a"]:
["a","a","a","a","a","l","l","l","l","l","a","a","a","a","a","l","l","l","l","l"];

const bloc4_images=[...ee_images,...er_images];
const bloc4_keys=(V<9)?
["a","a","a","a","a","l","l","l","l","l"]:
["l","l","l","l","l","a","a","a","a","a"];

const bloc5_images=[...ee_images,...er_images,...neg_images,...pos_images];

const bloc5_keys=((V<=2)||(V>=5&&V<=6)||(V>=9&&V<=10)||(V>=13&&V<=14))?
["a","a","a","a","a","l","l","l","l","l","l","l","l","l","l","a","a","a","a","a"]:
["l","l","l","l","l","a","a","a","a","a","a","a","a","a","a","l","l","l","l","l"];

/* ---------- BUILD TRIAL LISTS ---------- */

const block1=buildTrials(bloc1_images,bloc1_keys,2,1);
const block2=buildTrials(bloc2_images,bloc2_keys,2,2);

const block3_all=buildTrials(bloc3_images,bloc3_keys,3,3);
const block3_training=block3_all.slice(0,20);
const block3_test=block3_all.slice(20);

const block4=buildTrials(bloc4_images,bloc4_keys,2,4);

const block5_all=buildTrials(bloc5_images,bloc5_keys,3,5);
const block5_training=block5_all.slice(0,20);
const block5_test=block5_all.slice(20);

/* ---------- PRELOAD ---------- */

timeline.push({
type:jsPsychPreload,
images:[
"start.jpg","end.jpg",
"bloc1a.jpg","bloc1b.jpg",
"bloc2a.jpg","bloc2b.jpg",
"bloc3a.jpg","bloc3b.jpg",
"bloc3aa.jpg","bloc3bb.jpg",
"bloc4a.jpg","bloc4b.jpg",
"bloc5a.jpg","bloc5b.jpg",
"bloc5aa.jpg","bloc5bb.jpg",
...ee_images,...er_images,...neg_images,...pos_images]
});

/* ---------- PERSISTENT TRIAL ---------- */

function makePersistentTrial(stimulus,key,block,type){

return{
type:jsPsychHtmlKeyboardResponse,
stimulus:`<img src="${stimulus}" style="max-height:80vh;max-width:90vw;">`,
choices:"NO_KEYS",
trial_duration:null,

on_load:function(){

const startTime=performance.now();

let firstRT=null;
let hadError=false;

setTimeout(()=>{

const handler=function(event){

const pressed=event.key.toLowerCase();

if(pressed!=="a" && pressed!=="l") return;

const rt=Math.round(performance.now()-startTime);

if(firstRT===null) firstRT=rt;

if(pressed!==key){
hadError=true;
return;
}

document.removeEventListener("keydown",handler);

exportedRows.push({
Block:block,
TrialType:type,
ShownWord:stimulus,
ToucheBonneReponse:key,
Reponse:hadError?"Faute":"",
RT_FirstPress:firstRT,
RT_Final:rt
});

jsPsych.finishTrial();
};

document.addEventListener("keydown",handler);

},100);   // prevent carry-over

}
};

}

function runBlock(list,block,type){
list.forEach(t=>{
timeline.push(makePersistentTrial(t.image,t.correct,block,type));
});
}

/* ---------- START ---------- */

timeline.push({
type:jsPsychImageKeyboardResponse,
stimulus:"start.jpg",
choices:"ALL_KEYS"
});

/* ---------- BLOCKS ---------- */

timeline.push(makeBlockInstruction(InstBloc1));
runBlock(block1,1,"test");

timeline.push(makeBlockInstruction(InstBloc2));
runBlock(block2,2,"test");

timeline.push(makeBlockInstruction(InstBloc3));
runBlock(block3_training,3,"training");

timeline.push({
type:jsPsychImageKeyboardResponse,
stimulus:Break3,
choices:["a","l"]
});

runBlock(block3_test,3,"test");

timeline.push(makeBlockInstruction(InstBloc4));
runBlock(block4,4,"test");

timeline.push(makeBlockInstruction(InstBloc5));
runBlock(block5_training,5,"training");

timeline.push({
type:jsPsychImageKeyboardResponse,
stimulus:Break5,
choices:["a","l"]
});

runBlock(block5_test,5,"test");

/* ---------- END ---------- */

timeline.push({
type:jsPsychImageKeyboardResponse,
stimulus:"end.jpg",
choices:["a","l"," "]
});

timeline.push({
type:jsPsychFullscreen,
fullscreen_mode:false
});


jsPsych.run(timeline);





