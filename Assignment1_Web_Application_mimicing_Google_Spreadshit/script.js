document.addEventListener("DOMContentLoaded", () => {
  const sheetTable = document.getElementById('sheetTable');
  const formulaBar = document.getElementById('formulaBar');

  let rows = 20;
  let cols = 10;

  // Generate column headers
  const headerRow = sheetTable.querySelector('thead tr');
  for (let c = 1; c <= cols; c++) {
    const th = document.createElement('th');
    th.innerText = String.fromCharCode(64 + c);
    headerRow.appendChild(th);
  }

  // Generate rows and columns
  function generateTable() {
    sheetTable.querySelector('tbody').innerHTML = '';
    for (let r = 1; r <= rows; r++) {
      const tr = document.createElement('tr');
      const th = document.createElement('th');
      th.innerText = r;
      tr.appendChild(th);
      for (let c = 1; c <= cols; c++) {
        const td = document.createElement('td');
        td.contentEditable = true;
        td.dataset.row = r;
        td.dataset.col = c;
        tr.appendChild(td);
      }
      sheetTable.querySelector('tbody').appendChild(tr);
    }
  }
  generateTable();

  // Cell selection handling
  sheetTable.addEventListener('click', (e) => {
    if (e.target.tagName === 'TD') {
      document.querySelectorAll('td').forEach(td => td.classList.remove('selected'));
      e.target.classList.add('selected');
      formulaBar.value = e.target.innerText;
    }
  });

  // Toolbar functions
  function applyBold() {
    document.execCommand('bold');
  }

  function applyItalic() {
    document.execCommand('italic');
  }

  function changeTextColor() {
    const color = document.getElementById('colorPicker').value;
    document.execCommand('foreColor', false, color);
  }

  function addRow() {
    rows++;
    generateTable();
  }

  function addColumn() {
    cols++;
    const headerRow = sheetTable.querySelector('thead tr');
    const th = document.createElement('th');
    th.innerText = String.fromCharCode(64 + cols);
    headerRow.appendChild(th);
    generateTable();
  }

  // Mathematical and Data Quality Functions
  formulaBar.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const selectedCell = document.querySelector('td.selected');
      if (selectedCell) {
        applyFormula(formulaBar.value, selectedCell);
      }
    }
  });

  function applyFormula(formula, targetCell) {
    const match = formula.match(/(SUM|AVERAGE|MAX|MIN|COUNT|TRIM|UPPER|LOWER|REMOVE_DUPLICATES|FIND_AND_REPLACE)\(([^)]+)\)/i);
    if (!match) return;

    const func = match[1].toUpperCase();
    const args = match[2].split(',').map(arg => arg.trim());

    let result;
    switch (func) {
      case 'SUM':
        result = getRangeValues(args[0]).reduce((acc, val) => acc + val, 0);
        break;
      case 'AVERAGE':
        const sum = getRangeValues(args[0]).reduce((acc, val) => acc + val, 0);
        result = sum / getRangeValues(args[0]).length;
        break;
      case 'MAX':
        result = Math.max(...getRangeValues(args[0]));
        break;
      case 'MIN':
        result = Math.min(...getRangeValues(args[0]));
        break;
      case 'COUNT':
        result = getRangeValues(args[0]).filter(val => !isNaN(val)).length;
        break;
      case 'TRIM':
        result = args[0].trim();
        break;
      case 'UPPER':
        result = args[0].toUpperCase();
        break;
      case 'LOWER':
        result = args[0].toLowerCase();
        break;
      case 'REMOVE_DUPLICATES':
        removeDuplicates(args[0]);
        return;
      case 'FIND_AND_REPLACE':
        findAndReplace(args[0], args[1], args[2]);
        return;
    }

    if (result !== undefined) {
      targetCell.innerText = result;
    }
  }

  function removeDuplicates(range) {
    const rangeCoords = getRangeCoordinates(range);
    const uniqueValues = new Set();
    for (let r = rangeCoords.startRow; r <= rangeCoords.endRow; r++) {
      const rowCells = [];
      for (let c = rangeCoords.startCol; c <= rangeCoords.endCol; c++) {
        const cell = getCell(r, c);
        rowCells.push(cell.innerText);
      }
      const rowStr = rowCells.join(',');
      if (uniqueValues.has(rowStr)) {
        removeRow(r);
        r--;
        rangeCoords.endRow--;
      } else {
        uniqueValues.add(rowStr);
      }
    }
  }

  function findAndReplace(range, findText, replaceText) {
    const rangeCoords = getRangeCoordinates(range);
    for (let r = rangeCoords.startRow; r <= rangeCoords.endRow; r++) {
      for (let c = rangeCoords.startCol; c <= rangeCoords.endCol; c++) {
        const cell = getCell(r, c);
        cell.innerText = cell.innerText.replace(new RegExp(findText, 'g'), replaceText);
      }
    }
  }

  function getRangeValues(range) {
    const rangeCoords = getRangeCoordinates(range);
    const values = [];
    for (let r = rangeCoords.startRow; r <= rangeCoords.endRow; r++) {
      for (let c = rangeCoords.startCol; c <= rangeCoords.endCol; c++) {
        const cell = getCell(r, c);
        values.push(getCellValue(cell));
      }
    }
    return values;
  }

  function getRangeCoordinates(range) {
    const [start, end] = range.split(':');
    const startCoords = getCellCoordinates(start);
    const endCoords = getCellCoordinates(end);
    return { startRow: startCoords.row, startCol: startCoords.col, endRow: endCoords.row, endCol: endCoords.col };
  }

  function getCellCoordinates(cell) {
    const col = cell.charCodeAt(0) - 65 + 1;
    const row = parseInt(cell.substring(1), 10);
    return { row, col };
  }

  function getCell(row, col) {
    return sheetTable.querySelector(`td[data-row="${row}"][data-col="${col}"]`);
  }

  function getCellValue(cell) {
    return parseFloat(cell.innerText.trim()) || 0;
  }

  function removeRow(row) {
    const tr = sheetTable.querySelector(`tr:nth-child(${row + 1})`);
    tr.parentElement.removeChild(tr);
  }
});
