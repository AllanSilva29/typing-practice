#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const LANGUAGE_EXTENSIONS = {
  go: 'go',
  javascript: 'js',
  js: 'js',
  typescript: 'ts',
  ts: 'ts',
  python: 'py',
  py: 'py',
  c: 'c',
  cpp: 'cpp',
  csharp: 'cs',
  cs: 'cs',
  java: 'java',
  rust: 'rs',
  rs: 'rs',
  ruby: 'rb',
  rb: 'rb',
  html: 'html',
  css: 'css',
  sh: 'sh',
  bash: 'sh',
  sql: 'sql'
};

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Erro: Caminhos dos arquivos Markdown não fornecidos.');
    console.log('Uso: node scripts/create-exercise.js <arquivo1.md> [arquivo2.md] ...');
    process.exit(1);
  }

  let hasErrors = false;

  for (const arg of args) {
    const filePath = path.resolve(arg);
    const basename = path.basename(filePath);

    if (!fs.existsSync(filePath)) {
      console.error(`\n[${basename}] Erro: Arquivo não encontrado em "${filePath}"`);
      hasErrors = true;
      continue;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const exercise = parseAndValidateMarkdown(content);
      writeExerciseFiles(exercise);
      console.log(`[${basename}] Sucesso! Exercício "${exercise.id}" criado em "exercises/${exercise.language}/${exercise.id}".`);
    } catch (error) {
      console.error(`[${basename}] Erro de Validação: ${error.message}`);
      hasErrors = true;
    }
  }

  if (hasErrors) {
    process.exit(1);
  }
}

function parseAndValidateMarkdown(content) {
  const normalized = content.replace(/\r\n/g, '\n');
  
  const frontmatterMatch = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!frontmatterMatch) {
    throw new Error('O arquivo Markdown deve iniciar com um bloco de metadados delimitado por "---".');
  }

  const frontmatterStr = frontmatterMatch[1];
  const bodyStr = frontmatterMatch[2];

  const metadata = parseFrontmatter(frontmatterStr);
  validateMetadata(metadata);

  const sections = parseBodySections(bodyStr);
  validateSections(sections, metadata.language);

  return {
    ...metadata,
    detailedExplanation: sections.explanation,
    expectedOutput: sections.expectedOutput,
    code: sections.code
  };
}

function parseFrontmatter(str) {
  const metadata = {};
  const lines = str.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) {
      throw new Error(`Linha inválida no cabeçalho (frontmatter): "${trimmed}". Use o formato "chave: valor".`);
    }

    const key = trimmed.slice(0, colonIndex).trim();
    let val = trimmed.slice(colonIndex + 1).trim();

    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }

    metadata[key] = val;
  }

  return metadata;
}

function validateMetadata(metadata) {
  const required = ['language', 'id', 'difficulty', 'category', 'comment', 'name'];
  for (const field of required) {
    if (!metadata[field]) {
      throw new Error(`O campo obrigatório "${field}" está ausente no cabeçalho.`);
    }
  }

  const normalizedLang = metadata.language.toLowerCase();
  if (!LANGUAGE_EXTENSIONS[normalizedLang]) {
    throw new Error(`Linguagem "${metadata.language}" não suportada. Escolha uma das linguagens válidas.`);
  }

  const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!idPattern.test(metadata.id)) {
    throw new Error(`O "id" do exercício ("${metadata.id}") está inválido. Deve ser em letras minúsculas separadas por hífen (kebab-case). Ex: "binary-search".`);
  }

  const validDifficulties = ['easy', 'medium', 'hard'];
  if (!validDifficulties.includes(metadata.difficulty)) {
    throw new Error(`A dificuldade "${metadata.difficulty}" é inválida. Escolha entre: easy, medium, hard.`);
  }
}

function parseBodySections(bodyStr) {
  const lines = bodyStr.split('\n');
  let currentSection = null;
  const sections = {
    explanation: [],
    expectedOutput: [],
    codeLines: []
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      const headerTitle = trimmed.slice(2).trim().toLowerCase();
      if (headerTitle === 'explicação detalhada') {
        currentSection = 'explanation';
        continue;
      } else if (headerTitle === 'saída esperada') {
        currentSection = 'expectedOutput';
        continue;
      } else if (headerTitle === 'código') {
        currentSection = 'code';
        continue;
      } else {
        currentSection = null;
      }
    }

    if (currentSection === 'explanation') {
      sections.explanation.push(line);
    } else if (currentSection === 'expectedOutput') {
      sections.expectedOutput.push(line);
    } else if (currentSection === 'code') {
      sections.codeLines.push(line);
    }
  }

  return {
    explanation: sections.explanation.join('\n').trim(),
    expectedOutput: sections.expectedOutput.join('\n').trim(),
    code: parseCodeBlock(sections.codeLines.join('\n'))
  };
}

function parseCodeBlock(codeSectionStr) {
  const trimmed = codeSectionStr.trim();
  if (!trimmed.startsWith('```') || !trimmed.endsWith('```')) {
    throw new Error('A seção "# Código" deve conter um único bloco de código delimitado por "```".');
  }

  const lines = trimmed.split('\n');
  const codeLines = lines.slice(1, -1);
  return codeLines.join('\n');
}

function validateSections(sections, language) {
  if (!sections.explanation) {
    throw new Error('A seção "# Explicação Detalhada" está vazia ou ausente.');
  }

  if (!sections.expectedOutput) {
    throw new Error('A seção "# Saída Esperada" está vazia ou ausente.');
  }

  if (!sections.code) {
    throw new Error('A seção "# Código" não contém um bloco de código válido.');
  }
}

function writeExerciseFiles(exercise) {
  const exercisesDir = path.resolve(__dirname, '..', 'exercises');
  const langDir = path.join(exercisesDir, exercise.language.toLowerCase());
  const targetDir = path.join(langDir, exercise.id);

  if (!fs.existsSync(langDir)) {
    fs.mkdirSync(langDir, { recursive: true });
  }
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const metadataJson = {
    name: exercise.name,
    difficulty: exercise.difficulty,
    category: exercise.category,
    comment: exercise.comment,
    detailedExplanation: exercise.detailedExplanation,
    expectedOutput: exercise.expectedOutput
  };

  const metadataPath = path.join(targetDir, 'metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadataJson, null, 2), 'utf-8');

  const ext = LANGUAGE_EXTENSIONS[exercise.language.toLowerCase()];
  const codePath = path.join(targetDir, `code.${ext}`);
  fs.writeFileSync(codePath, exercise.code, 'utf-8');
}

main();
