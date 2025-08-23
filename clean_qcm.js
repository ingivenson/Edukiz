// Script pou netwaye tout QCM yo nan fichye JSON ou a pou retire etikèt (let/chif romen) epi asire reponsKorek se endis sèlman
// Sove fichye sa kòm clean_qcm.js epi kouri ak: node clean_qcm.js

const fs = require('fs');

const file = './src/questions_biologie.json'; // Modifye chemen si sa nesesè

const data = JSON.parse(fs.readFileSync(file, 'utf8'));

data.forEach(q => {
  if (q.type === 'qcm' && Array.isArray(q.choix)) {
    // Retire etikèt (let/chif romen) nan chwa yo
    q.choix = q.choix.map(ch =>
      ch.replace(/^[a-z]\)\s*|^[ivxlc]+\)\s*/i, '').trim()
    );
    // Asire reponsKorek se endis sèlman
    if (typeof q.reponsKorek === 'string') {
      q.reponsKorek = q.reponsKorek
        .split(',')
        .map(rep => rep.trim())
        .map(rep => {
          // Si rep se let, konvètil an endis
          const idx = 'abcdefghijklmnopqrstuvwxyz'.indexOf(rep.toLowerCase());
          return idx >= 0 ? String(idx) : rep;
        })
        .join(',');
    }
  }
});

fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
console.log('QCM yo netwaye ak sove!');
