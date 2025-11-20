// script.js - minimal required logic

// questions stored client-side (id, category, difficulty, text, options, correctIndex)
const QUESTIONS = [
  {id:1, category:'math', difficulty:'easy', text:'2 + 2 = ?', options:['3','4','5'], answer:1},
  {id:2, category:'math', difficulty:'easy', text:'5 - 3 = ?', options:['1','2','3'], answer:1},
  {id:3, category:'gk', difficulty:'easy', text:'Capital of France?', options:['Berlin','Paris','Rome'], answer:1},
  {id:4, category:'science', difficulty:'medium', text:'H2O is?', options:['Element','Compound','Mixture'], answer:1}
];

const TIME = { easy:10, medium:15, hard:20 };

let state = {
  list: [], index:0, timerId:null, remaining:0,
  answers: [] // {id, selected (index|null), time}
};

// DOM
const $ = id => document.getElementById(id);
const setup = $('setup'), quiz = $('quiz'), results = $('results');
const category = $('category'), difficulty = $('difficulty');
const qnum = $('qnum'), qtext = $('qtext'), opts = $('opts'), timeEl = $('time');
const nextBtn = $('next'), prevBtn = $('prev'), startBtn = $('start'), restart = $('restart');
const scoreEl = $('score'), summary = $('summary');

startBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', next);
prevBtn.addEventListener('click', prev);
restart.addEventListener('click', ()=>location.reload());

function startQuiz(){
  const cat = category.value, diff = difficulty.value;
  state.list = QUESTIONS.filter(q => q.category===cat && q.difficulty===diff);
  if(state.list.length===0) state.list = QUESTIONS.filter(q => q.category===cat);
  if(state.list.length===0) state.list = QUESTIONS.slice();
  state.index = 0; state.answers = [];
  setup.classList.add('hidden'); results.classList.add('hidden'); quiz.classList.remove('hidden');
  loadQuestion();
}

function loadQuestion(){
  clearTimer();
  const q = state.list[state.index];
  qnum.textContent = `Q ${state.index+1} / ${state.list.length}`;
  qtext.textContent = q.text;
  opts.innerHTML = '';
  q.options.forEach((o,i)=>{
    const li = document.createElement('li'); li.textContent = o; li.dataset.i = i;
    li.onclick = ()=>select(i, li);
    opts.appendChild(li);
  });
  // mark previously selected
  const prev = state.answers.find(a=>a.id===q.id);
  if(prev && prev.selected!=null){
    const el = opts.querySelector(`li[data-i="${prev.selected}"]`);
    if(el) el.classList.add('selected');
  }
  prevBtn.classList.toggle('hidden', state.index===0);
  nextBtn.textContent = state.index===state.list.length-1 ? 'Submit' : 'Next';

  // timer
  state.remaining = TIME[difficulty.value] || 12;
  timeEl.textContent = state.remaining;
  const startTs = Date.now();
  state.timerId = setInterval(()=>{
    state.remaining--; timeEl.textContent = state.remaining;
    if(state.remaining<=0){
      // record unanswered if none
      recordAnswer(null, Math.round((Date.now()-startTs)/1000));
      // advance or end
      if(state.index < state.list.length-1){ state.index++; loadQuestion(); }
      else endQuiz();
    }
  },1000);
}

function clearTimer(){ if(state.timerId) clearInterval(state.timerId); state.timerId = null; }

function select(i, el){
  opts.querySelectorAll('li').forEach(x=>x.classList.remove('selected'));
  el.classList.add('selected');
  // store but keep allowing change until next
  const q = state.list[state.index];
  const slug = state.answers.find(a=>a.id===q.id);
  const elapsed = (TIME[difficulty.value] || 12) - state.remaining;
  if(slug) { slug.selected = i; slug.time = elapsed; } 
  else state.answers.push({id:q.id, selected:i, time:elapsed});
}

function recordAnswer(selected, timeTaken){
  const q = state.list[state.index];
  const prev = state.answers.find(a=>a.id===q.id);
  if(prev) { prev.selected = selected; prev.time = timeTaken; } 
  else state.answers.push({id:q.id, selected:selected, time:timeTaken});
}

function next(){
  // ensure there is an entry for current question
  const q = state.list[state.index];
  if(!state.answers.find(a=>a.id===q.id)){
    recordAnswer(null, (TIME[difficulty.value]||12) - state.remaining);
  }
  if(state.index < state.list.length-1){ state.index++; loadQuestion(); }
  else endQuiz();
}

function prev(){ if(state.index>0){ state.index--; loadQuestion(); } }

function endQuiz(){
  clearTimer(); quiz.classList.add('hidden'); results.classList.remove('hidden');

  // ensure all present
  state.list.forEach(q=>{
    if(!state.answers.find(a=>a.id===q.id)) state.answers.push({id:q.id, selected:null, time:TIME[difficulty.value]||0});
  });

  let correct=0; let total=state.list.length;
  const times = []; const labels = []; const correctFlags = [];
  state.list.forEach((q, idx)=>{
    const a = state.answers.find(x=>x.id===q.id);
    const sel = a ? a.selected : null;
    const t = a ? a.time : 0;
    times.push(t); labels.push('Q'+(idx+1));
    correctFlags.push(sel===q.answer?1:0);
    if(sel===q.answer) correct++;
  });

  scoreEl.textContent = `${correct} / ${total}`;
  summary.innerHTML = `Correct: ${correct} · Incorrect/Unanswered: ${total-correct} · Avg time: ${(times.reduce((s,v)=>s+v,0)/times.length).toFixed(1)}s`;

  // chart: time per question + show right ratio as title
  const ctx = document.getElementById('chart').getContext('2d');
  new Chart(ctx, {
    type:'bar',
    data:{ labels: labels, datasets:[{ label:'Time (s)', data: times }] },
    options:{ plugins:{ title:{ display:true, text:`Right: ${Math.round((correct/total)*100)}%` }}}
  });
}
