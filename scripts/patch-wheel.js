const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../node_modules/react-custom-roulette/dist/bundle.js');

if (!fs.existsSync(targetFile)) {
  console.log("Could not find react-custom-roulette bundle.js to patch");
  process.exit(0);
}

let content = fs.readFileSync(targetFile, 'utf8');

const searchBlockBg = `T.beginPath(),T.arc(I,M,P,j,B,!1),T.arc(I,M,R,B,j,!0),T.stroke(),T.fill(),T.save()`;

const replaceBlockBg = `T.beginPath(),T.arc(I,M,P,j,B,!1),T.arc(I,M,R,B,j,!0),T.stroke(),T.fill();
if (t[L].image) {
    T.save();
    T.clip();
    T.translate(I, M);
    T.rotate(j + D/2 + Math.PI/2);
    var _bgH = t[L].image._imageHTML || new Image();
    var _size = P * 2.2;
    T.globalAlpha = 0.5;
    T.drawImage(_bgH, -_size/2, -P * 1.1, _size, _size);
    T.restore();
}
T.save()`;

if (content.includes(searchBlockBg)) {
  content = content.replace(searchBlockBg, replaceBlockBg);
}

// Just copy the ELSE block into the IF block at the end!
const searchBlockContent = `if(t[L].image){F+=t[L].image&&!(null===(r=t[L].image)||void 0===r?void 0:r.landscape)?Math.PI/2:0,T.rotate(F);var H=(null===(i=t[L].image)||void 0===i?void 0:i._imageHTML)||new Image;T.drawImage(H,(H.width+((null===(o=t[L].image)||void 0===o?void 0:o.offsetX)||0))/-2,-(H.height-((null===(a=t[L].image)||void 0===a?void 0:a.landscape)?0:90)+((null===(s=t[L].image)||void 0===s?void 0:s.offsetY)||0))/2,H.width,H.height)}else{`;

// Replace the IF body with the text drawing logic
const replaceBlockContent = `if(t[L].image){
    // Draw text instead of the image because we already drew the image in background
    F+=S?Math.PI/2:0;
    T.rotate(F);
    var G=t[L].option;
    T.font="".concat((null==z?void 0:z.fontStyle)||w," ").concat((null==z?void 0:z.fontWeight)||y," ").concat(2*((null==z?void 0:z.fontSize)||b),"px ").concat((null==z?void 0:z.fontFamily)||v,", Helvetica, Arial");
    T.lineWidth = 3;
    T.strokeStyle = '#000000';
    T.strokeText(G||"",-T.measureText(G||"").width/2,b/2.7);
    T.fillStyle=z&&z.textColor;
    T.fillText(G||"",-T.measureText(G||"").width/2,b/2.7);
}else{`;

if (content.includes(searchBlockContent)) {
  content = content.replace(searchBlockContent, replaceBlockContent);
  fs.writeFileSync(targetFile, content);
  console.log("Patched react-custom-roulette bundle.js successfully!");
} else {
  if (content.includes('T.strokeText(G||"')) {
    console.log("Already patched bundle.js");
  } else {
    console.log("Could not find the target code block to patch in bundle.js.");
  }
}
