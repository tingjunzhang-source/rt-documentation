// Run once: node generate.js
const fs = require('fs');

const participants = [
  { file: 'chen-meihua',    char: '陈', color1: '#f43f5e', color2: '#e11d48' },
  { file: 'li-jianguo',     char: '李', color1: '#3b82f6', color2: '#2563eb' },
  { file: 'wang-shufen',    char: '王', color1: '#a855f7', color2: '#9333ea' },
  { file: 'zhang-zhiyuan',  char: '张', color1: '#14b8a6', color2: '#0d9488' },
  { file: 'liu-xiuying',    char: '刘', color1: '#f97316', color2: '#ea580c' },
  { file: 'lin-daming',     char: '林', color1: '#6366f1', color2: '#4f46e5' },
  { file: 'huang-yulan',    char: '黄', color1: '#f59e0b', color2: '#d97706' },
  { file: 'zhou-wenjing',   char: '周', color1: '#ec4899', color2: '#db2777' },
  { file: 'zhao-guoqiang',  char: '赵', color1: '#10b981', color2: '#059669' },
  { file: 'wu-guihua',      char: '吴', color1: '#06b6d4', color2: '#0891b2' },
];

for (const { file, char, color1, color2 } of participants) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}"/>
      <stop offset="100%" stop-color="${color2}"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="50" fill="url(#g)"/>
  <text x="50" y="55" text-anchor="middle" dominant-baseline="middle"
        font-size="44" font-family="'Noto Serif SC', 'SimSun', serif" fill="white"
        font-weight="500">${char}</text>
</svg>`;
  fs.writeFileSync(`${file}.svg`, svg, 'utf-8');
  console.log(`Created ${file}.svg`);
}
