const vscode = acquireVsCodeApi();

const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const resetBtn = document.getElementById('reset-btn');
const langSelect = document.getElementById('language-select');
const diffSelect = document.getElementById('difficulty-select');

const statTotal = document.getElementById('stat-total');
const statPpm = document.getElementById('stat-ppm');
const statAccuracy = document.getElementById('stat-accuracy');
const historyList = document.getElementById('history-list');
const treeContainer = document.getElementById('tree-container');

// Recupera filtros salvos da sessão anterior se houver
const oldState = vscode.getState() || {};
if (oldState.language) langSelect.value = oldState.language;
if (oldState.difficulty) diffSelect.value = oldState.difficulty;

function saveState() {
  vscode.setState({
    language: langSelect.value,
    difficulty: diffSelect.value
  });
}

langSelect.addEventListener('change', saveState);
diffSelect.addEventListener('change', saveState);

startBtn.addEventListener('click', () => {
  vscode.postMessage({
    type: 'startPractice',
    filters: {
      language: langSelect.value,
      difficulty: diffSelect.value
    }
  });
});

stopBtn.addEventListener('click', () => {
  vscode.postMessage({ type: 'stopPractice' });
});

resetBtn.addEventListener('click', () => {
  vscode.postMessage({ type: 'resetProgress' });
});

window.addEventListener('message', event => {
  const message = event.data;
  if (message.type === 'updateState') {
    const { isPlaying, stats, history, snippets } = message;

    // Atualiza botões
    if (isPlaying) {
      startBtn.style.display = 'none';
      stopBtn.style.display = 'block';
    } else {
      startBtn.style.display = 'block';
      stopBtn.style.display = 'none';
    }

    // Atualiza estatísticas
    statTotal.textContent = stats.totalCompleted;
    statPpm.textContent = stats.avgPpm;
    statAccuracy.textContent = stats.avgAccuracy + '%';

    // Atualiza Árvore de Exercícios e Histórico
    renderTreeView(snippets || []);
    renderHistoryList(history || []);
  }
});

function renderTreeView(snippets) {
  if (snippets.length === 0) {
    treeContainer.innerHTML = '<div class="no-history">Nenhum exercício carregado.</div>';
    return;
  }

  // Agrupar snippets por linguagem e categoria
  const grouped = {};
  snippets.forEach(s => {
    const lang = s.language;
    const cat = s.category;
    if (!grouped[lang]) grouped[lang] = {};
    if (!grouped[lang][cat]) grouped[lang][cat] = [];
    grouped[lang][cat].push(s);
  });

  const languages = Object.keys(grouped);
  let html = '<div class="tree-line"><span class="tree-folder-lang">.</span></div>';

  languages.forEach((lang, langIdx) => {
    const isLastLang = langIdx === languages.length - 1;
    const langChar = isLastLang ? '└── ' : '├── ';
    const langPrefix = isLastLang ? '    ' : '│   ';
    const langDisplay = lang.charAt(0).toUpperCase() + lang.slice(1);

    html += '<div class="tree-line">';
    html += '  <span class="tree-branch">' + langChar + '</span>';
    html += '  <span class="tree-folder-lang">' + langDisplay + '</span>';
    html += '</div>';

    const categories = Object.keys(grouped[lang]);
    categories.forEach((cat, catIdx) => {
      const isLastCat = catIdx === categories.length - 1;
      const catChar = isLastCat ? '└── ' : '├── ';
      const catPrefix = langPrefix + (isLastCat ? '    ' : '│   ');

      html += '<div class="tree-line">';
      html += '  <span class="tree-branch">' + langPrefix + catChar + '</span>';
      html += '  <span class="tree-folder-cat">' + cat + '</span>';
      html += '</div>';

      const exercises = grouped[lang][cat];
      exercises.forEach((s, sIdx) => {
        const isLastEx = sIdx === exercises.length - 1;
        const exChar = isLastEx ? '└── ' : '├── ';
        const nameDisplay = s.id.split('-').slice(1).join('-').replace(/^[a-z]/, c => c.toUpperCase());

        html += '<div class="tree-line tree-item-exercise" onclick="revisitSnippet(\'' + s.id + '\')">';
        html += '  <span class="tree-branch">' + catPrefix + exChar + '</span>';
        html += '  <span class="tree-item-title">' + nameDisplay + '</span>';
        html += '</div>';
      });
    });
  });

  treeContainer.innerHTML = html;
}

function renderHistoryList(history) {
  if (history.length === 0) {
    historyList.innerHTML = '<div class="no-history">Nenhuma prática concluída ainda.</div>';
    return;
  }

  historyList.innerHTML = history.map(item => {
    const date = new Date(item.timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    return '<div class="history-item" onclick="revisitSnippet(\'' + item.snippetId + '\')">' +
      '<div class="history-header">' +
        '<span class="history-lang">' + item.language + '</span>' +
        '<span class="history-time">' + date + '</span>' +
      '</div>' +
      '<div class="history-body">' +
        '<div class="history-cat">' + item.category + '</div>' +
        '<div class="history-metrics">' +
          '<span class="val-success">' + item.ppm + ' PPM</span>' +
          '<span>' + item.accuracy + '%</span>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function revisitSnippet(snippetId) {
  vscode.postMessage({ type: 'revisitSnippet', snippetId });
}
