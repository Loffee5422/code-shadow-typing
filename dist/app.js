// The practice text stays in the browser, so learners can use their own code without an account.
const $ = (selector) => document.querySelector(selector);
let target = '', round = 0, startedAt = 0, wrongCount = 0, paused = false, advancing = false;

function renderCode(typed = '') {
  $('#codeDisplay').innerHTML = [...target].map((char, index) => {
    const safe = char === ' ' ? '&nbsp;' : char === '\n' ? '<br>' : char.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    const state = index < typed.length ? (typed[index] === char ? 'typed' : 'wrong') : index === typed.length ? 'current' : '';
    return `<span class="${state}">${safe}</span>`;
  }).join('');
  $('#progressBar').style.width = `${target ? Math.min(100, Math.round((typed.length / target.length) * 100)) : 0}%`;
}

function updateStats() {
  const input = $('#typingInput').value;
  const minutes = Math.max((performance.now() - startedAt) / 60000, 1 / 60000);
  $('#accuracyStat').textContent = `${input.length ? Math.max(0, Math.round(((input.length - wrongCount) / input.length) * 100)) : 100}%`;
  $('#speedStat').textContent = Math.round((input.length / 5) / minutes);
  $('#roundStat').textContent = `ROUND ${round}`;
}

function startPractice() {
  const value = $('#sourceInput').value;
  if (!value.trim()) { $('#feedback').textContent = '先输入一段内容'; $('#sourceInput').focus(); return; }
  target = value; round = 0; $('#typingInput').value = ''; $('#typingInput').disabled = false; paused = false; advancing = false;
  $('#pauseButton').textContent = '暂停'; $('#sessionStatus').textContent = 'LIVE'; startedAt = performance.now(); wrongCount = 0; renderCode(); updateStats(); $('#typingInput').focus();
}

function handleInput() {
  if (paused || advancing || !target) return;
  const input = $('#typingInput').value;
  wrongCount = [...input].reduce((count, char, index) => count + (char !== target[index] ? 1 : 0), 0);
  renderCode(input); updateStats();
  const feedback = $('#feedback');
  if (input.length && input[input.length - 1] !== target[input.length - 1]) { feedback.textContent = '检查当前字符，再继续'; feedback.classList.add('error'); }
  else { feedback.textContent = input === target ? '完成，正在重新开始…' : '继续输入'; feedback.classList.remove('error'); }
  if (input === target) {
    advancing = true; round += 1; updateStats(); $('#typingInput').disabled = true;
    window.setTimeout(() => { $('#typingInput').value = ''; advancing = false; startedAt = performance.now(); wrongCount = 0; $('#feedback').textContent = '继续输入'; renderCode(); updateStats(); $('#typingInput').focus(); }, 700);
  }
}

$('#startButton').addEventListener('click', startPractice);
$('#typingInput').addEventListener('input', handleInput);
$('#sourceInput').addEventListener('input', () => { if (!target) renderCode($('#sourceInput').value); });
$('#resetButton').addEventListener('click', () => { $('#typingInput').value = ''; wrongCount = 0; startedAt = performance.now(); advancing = false; renderCode(); updateStats(); $('#typingInput').focus(); });
$('#pauseButton').addEventListener('click', () => { if (!target) return; paused = !paused; $('#pauseButton').textContent = paused ? '继续' : '暂停'; $('#sessionStatus').textContent = paused ? 'PAUSED' : 'LIVE'; $('#feedback').textContent = paused ? '已暂停' : '继续输入'; });
document.addEventListener('keydown', (event) => { if (event.ctrlKey && event.key === 'Enter') { event.preventDefault(); $('#typingInput').focus(); } });
$('#sourceInput').dispatchEvent(new Event('input'));
