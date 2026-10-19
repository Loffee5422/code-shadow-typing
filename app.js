// CodeLoop keeps the lesson data local so the practice loop works without an account or server.
const lessons = [
  { title: '01 / VARIABLES', language: 'JAVASCRIPT', heading: '把数据放进一个名字里。', description: '变量让代码可以记住一个值。先写出结构，再观察值如何流动。', code: `const learner = "you";\nconst loops = 0;\n\nconsole.log(learner);`, annotations: ['const 创建一个不会被重新赋值的变量。', '字符串是被引号包住的文本值。', 'console.log 把值写到开发者控制台。'] },
  { title: '02 / FUNCTIONS', language: 'JAVASCRIPT', heading: '把重复动作变成一个工具。', description: '函数把步骤收进一个可复用的名字里。输入进入，结果出来。', code: `function greet(name) {\n  return \`Hello, \${name}!\`;\n}\n\ngreet("Ada");`, annotations: ['function 声明一个可重复调用的动作。', '参数 name 是函数接收的输入。', 'return 把结果交还给调用它的地方。'] },
  { title: '03 / ARRAYS', language: 'JAVASCRIPT', heading: '把一组值放在一起。', description: '数组按顺序保存多个值。你可以遍历它，再逐个处理内容。', code: `const topics = ["HTML", "CSS", "JS"];\n\nfor (const topic of topics) {\n  console.log(topic);\n}`, annotations: ['方括号创建一个数组。', 'for...of 依次取出数组里的每个值。', '大括号包住循环每次要执行的代码。'] },
  { title: '04 / CONDITIONS', language: 'JAVASCRIPT', heading: '让代码根据情况做决定。', description: '条件语句把一个问题变成分岔路。程序会选择符合条件的路径。', code: `const score = 92;\n\nif (score >= 90) {\n  console.log("Keep going!");\n}`, annotations: ['比较运算符 >= 检查左边是否不小于右边。', 'if 只在条件为 true 时运行代码块。', '缩进让代码的层级关系更容易阅读。'] }
];

const $ = (selector) => document.querySelector(selector);
let lessonIndex = 0, completedLoops = 0, roundStartedAt = 0, paused = false, wrongCount = 0, advancing = false;

function loadLesson(index) {
  const lesson = lessons[index];
  $('#lessonTitle').textContent = lesson.title;
  $('#languageLabel').textContent = lesson.language;
  $('#lessonHeading').textContent = lesson.heading;
  $('#lessonDescription').textContent = lesson.description;
  $('#lineCount').textContent = `01—${String(lesson.code.split('\n').length).padStart(2, '0')}`;
  $('#annotationList').innerHTML = lesson.annotations.map((item, i) => `<div class="annotation"><span class="annotation-number">0${i + 1}</span><p>${item}</p></div>`).join('');
  $('#typingInput').value = '';
  $('#typingInput').disabled = false;
  $('#typingInput').focus();
  roundStartedAt = performance.now(); wrongCount = 0; paused = false; advancing = false;
  $('#pauseButton').textContent = 'Ⅱ PAUSE';
  renderCode(''); updateStats();
}

function renderCode(typed) {
  const code = lessons[lessonIndex].code;
  $('#codeDisplay').innerHTML = [...code].map((char, index) => {
    const safe = char === ' ' ? '&nbsp;' : char === '\n' ? '<br>' : char.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    const state = index < typed.length ? (typed[index] === char ? 'typed' : 'wrong') : index === typed.length ? 'current' : '';
    return `<span class="${state}">${safe}</span>`;
  }).join('');
  const percent = Math.min(100, Math.round((typed.length / code.length) * 100));
  $('#progressBar').style.width = `${percent}%`;
}

function updateStats() {
  const input = $('#typingInput').value;
  const accuracy = input.length ? Math.max(0, Math.round(((input.length - wrongCount) / input.length) * 100)) : 100;
  const minutes = Math.max((performance.now() - roundStartedAt) / 60000, 1 / 60000);
  const wpm = Math.round((input.length / 5) / minutes);
  $('#accuracyStat').textContent = `${accuracy}%`;
  $('#speedStat').innerHTML = `${wpm} <small>WPM</small>`;
  $('#streakStat').innerHTML = `${completedLoops} <small>ROUNDS</small>`;
  $('#loopCount').textContent = String(completedLoops + 1).padStart(2, '0');
}

function handleInput() {
  if (paused || advancing) return;
  const input = $('#typingInput').value;
  const code = lessons[lessonIndex].code;
  wrongCount = [...input].reduce((count, char, index) => count + (char !== code[index] ? 1 : 0), 0);
  renderCode(input); updateStats();
  const feedback = $('#feedback');
  if (input.length && input[input.length - 1] !== code[input.length - 1]) { feedback.textContent = '检查这个字符，再继续'; feedback.style.color = 'var(--red)'; }
  else { feedback.textContent = input.length === code.length ? '完成，正在加载下一段…' : '节奏很好，继续输入'; feedback.style.color = 'var(--lime)'; }
  if (input === code) completeLesson();
}

function completeLesson() {
  advancing = true; completedLoops += 1; updateStats(); $('#typingInput').disabled = true;
  window.setTimeout(() => { lessonIndex = (lessonIndex + 1) % lessons.length; loadLesson(lessonIndex); }, 750);
}

$('#typingInput').addEventListener('input', handleInput);
$('#resetButton').addEventListener('click', () => loadLesson(lessonIndex));
$('#pauseButton').addEventListener('click', () => { paused = !paused; $('#pauseButton').textContent = paused ? '▶ RESUME' : 'Ⅱ PAUSE'; $('#sessionStatus').textContent = paused ? 'SESSION PAUSED' : 'SESSION LIVE'; $('#feedback').textContent = paused ? '已暂停，准备好后继续' : '继续你的节奏'; });
document.addEventListener('keydown', (event) => { if (event.ctrlKey && event.key === 'Enter') { event.preventDefault(); $('#typingInput').focus(); } });
loadLesson(0);
