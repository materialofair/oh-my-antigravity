function isTomlSectionHeader(line) {
  return /^\s*\[([^[\]]+)\]\s*(#.*)?$/.test(line);
}

function isTomlArrayHeader(line) {
  return /^\s*\[\[[^\]]+\]\]/.test(line);
}

function getTomlSectionName(line) {
  const match = String(line || '').match(/^\s*\[([^[\]]+)\]\s*(#.*)?$/);
  return match ? match[1].trim() : null;
}

function parseTomlSections(content) {
  const lines = String(content || '').split(/\r?\n/);
  const sections = [];

  for (let i = 0; i < lines.length; i += 1) {
    const name = getTomlSectionName(lines[i]);
    if (!name) continue;

    let end = lines.length;
    for (let j = i + 1; j < lines.length; j += 1) {
      if (isTomlSectionHeader(lines[j]) || isTomlArrayHeader(lines[j])) {
        end = j;
        break;
      }
    }

    sections.push({
      name,
      start: i,
      end,
      lines: lines.slice(i, end),
    });
    i = end - 1;
  }

  return { lines, sections };
}

function hasTomlSection(content, sectionName) {
  return parseTomlSections(content).sections.some((section) => section.name === sectionName);
}

function extractTomlSections(content, sectionNames = []) {
  if (!content || sectionNames.length === 0) return '';

  const requested = new Set(sectionNames);
  return parseTomlSections(content).sections
    .filter((section) => requested.has(section.name))
    .map((section) => section.lines.join('\n').trimEnd())
    .join('\n\n');
}

function removeTomlSections(content, sectionNames = []) {
  if (!content || sectionNames.length === 0) return content || '';

  const requested = new Set(sectionNames);
  const { lines, sections } = parseTomlSections(content);
  if (sections.length === 0) return content;

  const removeLine = new Set();
  for (const section of sections) {
    if (!requested.has(section.name)) continue;
    for (let i = section.start; i < section.end; i += 1) {
      removeLine.add(i);
    }
  }

  if (removeLine.size === 0) return content;

  return lines
    .filter((_, index) => !removeLine.has(index))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

module.exports = {
  extractTomlSections,
  hasTomlSection,
  parseTomlSections,
  removeTomlSections,
};
