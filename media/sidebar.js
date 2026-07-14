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
    renderTreeView(snippets || [], history || []);
    renderHistoryList(history || []);
  }
});

function renderTreeView(snippets, history = []) {
  if (snippets.length === 0) {
    treeContainer.innerHTML = '<div class="no-history">Nenhum exercício carregado.</div>';
    return;
  }

  const completedIds = new Set(history.map(item => item.snippetId));

  // Constrói a árvore de diretórios com base na linguagem e no caminho relativo
  const root = { name: '.', type: 'folder', children: {}, relativePath: '' };

  snippets.forEach(s => {
    const lang = s.language;
    if (!root.children[lang]) {
      root.children[lang] = { name: lang, type: 'folder', children: {}, relativePath: lang };
    }

    const parts = s.relativePath ? s.relativePath.split('/') : [s.id.split('-').slice(1).join('-')];
    let current = root.children[lang];

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLastPart = i === parts.length - 1;

      if (!current.children[part]) {
        const childRelativePath = current.relativePath ? current.relativePath + '/' + part : part;
        current.children[part] = {
          name: part,
          type: isLastPart ? 'exercise' : 'folder',
          children: {},
          relativePath: childRelativePath
        };
        if (isLastPart) {
          current.children[part].snippet = s;
        }
      }
      current = current.children[part];
    }
  });

  let html = '<div class="tree-line"><span class="tree-folder-lang" onclick="openFolderMetadata(\'\')">.</span></div>';

  function renderNode(node, prefixes) {
    const keys = Object.keys(node.children);
    keys.forEach((key, index) => {
      const child = node.children[key];
      const isLast = index === keys.length - 1;

      const branchChar = isLast ? '└── ' : '├── ';
      const currentPrefix = prefixes.join('');

      let lineHtml = '';
      if (child.type === 'folder') {
        const isLang = prefixes.length === 0;
        const folderClass = isLang ? 'tree-folder-lang' : 'tree-folder-cat';
        const displayName = isLang ? child.name.charAt(0).toUpperCase() + child.name.slice(1) : child.name;

        lineHtml += '<div class="tree-line">';
        lineHtml += '  <span class="tree-branch">' + currentPrefix + branchChar + '</span>';
        lineHtml += '  <span class="' + folderClass + '" onclick="openFolderMetadata(\'' + child.relativePath + '\')">' + displayName + '</span>';
        lineHtml += '</div>';

        html += lineHtml;

        const nextPrefixes = [...prefixes, isLast ? '    ' : '│   '];
        renderNode(child, nextPrefixes);
      } else {
        const s = child.snippet;
        const displayName = s.name;
        const isCompleted = completedIds.has(s.id);
        const completedClass = isCompleted ? ' completed' : '';

        lineHtml += '<div class="tree-line tree-item-exercise" onclick="revisitSnippet(\'' + s.id + '\')">';
        lineHtml += '  <span class="tree-branch">' + currentPrefix + branchChar + '</span>';
        lineHtml += '  <span class="tree-item-title' + completedClass + '">' + displayName + '</span>';
        lineHtml += '</div>';

        html += lineHtml;
      }
    });
  }

  renderNode(root, []);
  treeContainer.innerHTML = html;
}

function renderHistoryList(history) {
  if (history.length === 0) {
    historyList.innerHTML = '<div class="no-history">Nenhuma prática concluída ainda.</div>';
    return;
  }

  const snippetCounts = {};
  const attemptNumbers = new Array(history.length);

  for (let i = history.length - 1; i >= 0; i--) {
    const snippetId = history[i].snippetId;
    snippetCounts[snippetId] = (snippetCounts[snippetId] || 0) + 1;
    attemptNumbers[i] = snippetCounts[snippetId];
  }

  historyList.innerHTML = history.map((item, idx) => {
    const date = new Date(item.timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    const attempt = attemptNumbers[idx];
    const langName = item.language.charAt(0).toUpperCase() + item.language.slice(1).toLowerCase();
    return '<div class="history-item" onclick="revisitSnippet(\'' + item.snippetId + '\')">' +
      '<div class="history-header">' +
      '<span class="history-lang">' + langName + '</span>' +
      '<span class="history-time">' + date + '</span>' +
      '</div>' +
      '<div class="history-body" style="align-items: flex-start;">' +
      '<div class="history-cat" style="display: flex; flex-direction: column; gap: 2px;">' +
      '<div style="font-weight: 500; color: var(--text-main);">' + item.name + '</div>' +
      '<div style="opacity: 0.5; font-size: 9px; color: var(--text-muted);">' + attempt + 'x Finished</div>' +
      '</div>' +
      '<div class="history-metrics" style="margin-top: 2px;">' +
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

function openFolderMetadata(relativePath) {
  vscode.postMessage({ type: 'openFolderMetadata', relativePath });
}
