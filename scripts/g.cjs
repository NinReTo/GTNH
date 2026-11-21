const p=require('./game-lang.json').pairs;
const qs=process.argv.slice(2);
for(const q of qs){const ex=p.filter(x=>x[0]===q);const r=ex.length?ex:p.filter(x=>x[0].toLowerCase().includes(q.toLowerCase())).slice(0,4);console.log(q,'=>',JSON.stringify(r.map(x=>x[1])))}
