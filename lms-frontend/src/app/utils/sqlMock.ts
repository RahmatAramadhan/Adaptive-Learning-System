export interface SqlExecutionResult {
  success: boolean;
  rows: Record<string, any>[];
  columns: string[];
  error?: string;
  message?: string;
  rowCount: number;
  operation?: 'DDL' | 'SELECT';
  schema?: MockSchemaTable[];
}

interface MockColumn {
  name: string;
  type: string;
  constraints: string[];
}

interface MockTable {
  columns: MockColumn[];
  rows: Record<string, any>[];
  autoIncrement?: number;
}

interface MockSchemaTable {
  name: string;
  columns: MockColumn[];
  rowCount: number;
}

type MockDatabase = Record<string, MockTable>;

const initialMockDatabase: MockDatabase = {
  users: {
    columns: [
      { name: 'id', type: 'INT', constraints: ['PRIMARY KEY', 'AUTO_INCREMENT', 'NOT NULL'] },
      { name: 'name', type: 'VARCHAR(100)', constraints: ['NOT NULL'] },
      { name: 'email', type: 'VARCHAR(100)', constraints: ['UNIQUE', 'NOT NULL'] },
      { name: 'role', type: 'VARCHAR(20)', constraints: ['NOT NULL'] },
      { name: 'created_at', type: 'DATE', constraints: [] },
    ],
    rows: [
      { id: 1, name: 'Ahmad', email: 'ahmad@example.com', role: 'admin', created_at: '2024-01-15' },
      { id: 2, name: 'Budi', email: 'budi@example.com', role: 'user', created_at: '2024-02-10' },
      { id: 3, name: 'Citra', email: 'citra@example.com', role: 'user', created_at: '2024-03-05' },
      { id: 4, name: 'Dewi', email: 'dewi@example.com', role: 'admin', created_at: '2024-01-20' },
    ],
    autoIncrement: 5,
  },
  products: {
    columns: [
      { name: 'id', type: 'INT', constraints: ['PRIMARY KEY', 'AUTO_INCREMENT', 'NOT NULL'] },
      { name: 'name', type: 'VARCHAR(100)', constraints: ['NOT NULL'] },
      { name: 'price', type: 'INT', constraints: ['NOT NULL'] },
      { name: 'stock', type: 'INT', constraints: ['NOT NULL'] },
      { name: 'category', type: 'VARCHAR(50)', constraints: [] },
    ],
    rows: [
      { id: 1, name: 'Laptop Dell', price: 10000000, stock: 5, category: 'Electronics' },
      { id: 2, name: 'Mouse Logitech', price: 250000, stock: 20, category: 'Accessories' },
      { id: 3, name: 'Keyboard Mekanik', price: 500000, stock: 15, category: 'Accessories' },
      { id: 4, name: 'Monitor LG', price: 2500000, stock: 8, category: 'Electronics' },
    ],
    autoIncrement: 5,
  },
  orders: {
    columns: [
      { name: 'id', type: 'INT', constraints: ['PRIMARY KEY', 'AUTO_INCREMENT', 'NOT NULL'] },
      { name: 'user_id', type: 'INT', constraints: ['NOT NULL'] },
      { name: 'product_id', type: 'INT', constraints: ['NOT NULL'] },
      { name: 'quantity', type: 'INT', constraints: ['NOT NULL'] },
      { name: 'total', type: 'INT', constraints: ['NOT NULL'] },
      { name: 'status', type: 'VARCHAR(20)', constraints: ['NOT NULL'] },
    ],
    rows: [
      { id: 1, user_id: 1, product_id: 1, quantity: 1, total: 10000000, status: 'completed' },
      { id: 2, user_id: 2, product_id: 2, quantity: 2, total: 500000, status: 'completed' },
      { id: 3, user_id: 1, product_id: 3, quantity: 1, total: 500000, status: 'pending' },
      { id: 4, user_id: 3, product_id: 4, quantity: 1, total: 2500000, status: 'completed' },
    ],
    autoIncrement: 5,
  },
};

let mockDatabase: MockDatabase = cloneDatabase(initialMockDatabase);
let currentDatabaseName = 'training_db';

export function executeSqlMock(sql: string): SqlExecutionResult {
  try {
    const statement = normalizeStatement(sql);

    if (!statement) {
      return buildErrorResult('Tulis satu perintah SQL DDL untuk dijalankan.');
    }

    const upperSql = statement.toUpperCase();

    if (upperSql.startsWith('SELECT')) {
      return parseSelect(statement);
    }

    if (upperSql.startsWith('CREATE DATABASE')) {
      return handleCreateDatabase(statement);
    }

    if (upperSql.startsWith('USE ')) {
      return handleUseDatabase(statement);
    }

    if (upperSql.startsWith('CREATE TABLE')) {
      return handleCreateTable(statement);
    }

    if (upperSql.startsWith('ALTER TABLE')) {
      return handleAlterTable(statement);
    }

    if (upperSql.startsWith('RENAME TABLE')) {
      return handleRenameTable(statement);
    }

    if (upperSql.startsWith('DROP TABLE')) {
      return handleDropTable(statement);
    }

    if (upperSql.startsWith('DROP DATABASE')) {
      return handleDropDatabase(statement);
    }

    if (upperSql.startsWith('TRUNCATE TABLE')) {
      return handleTruncateTable(statement);
    }

    return buildErrorResult('Fokus latihan ini hanya DDL. Coba: CREATE TABLE, ALTER TABLE, RENAME TABLE, DROP TABLE, atau TRUNCATE TABLE.');
  } catch (err) {
    return {
      success: false,
      rows: [],
      columns: [],
      error: `Error: ${err instanceof Error ? err.message : String(err)}`,
      rowCount: 0,
      operation: 'DDL',
      schema: buildSchemaSnapshot(),
    };
  }
}

function handleCreateDatabase(sql: string): SqlExecutionResult {
  const match = sql.match(/^CREATE\s+DATABASE\s+`?([\w-]+)`?$/i);
  if (!match) {
    return buildErrorResult('Format CREATE DATABASE tidak valid. Contoh: CREATE DATABASE smkn5malang;');
  }

  currentDatabaseName = match[1];
  return buildSuccessResult(
    `Database ${currentDatabaseName} siap digunakan. Jalankan USE ${currentDatabaseName} sebelum membuat tabel.`,
    'DDL'
  );
}

function handleUseDatabase(sql: string): SqlExecutionResult {
  const match = sql.match(/^USE\s+`?([\w-]+)`?$/i);
  if (!match) {
    return buildErrorResult('Format USE tidak valid. Contoh: USE smkn5malang;');
  }

  currentDatabaseName = match[1];
  return buildSuccessResult(`Database aktif: ${currentDatabaseName}.`, 'DDL');
}

function handleCreateTable(sql: string): SqlExecutionResult {
  const match = sql.match(/^CREATE\s+TABLE\s+`?([\w-]+)`?\s*\((([\s\S]+))\)$/i);
  if (!match) {
    return buildErrorResult('Format CREATE TABLE tidak valid. Contoh: CREATE TABLE siswa (...);');
  }

  const tableName = match[1];
  const existingKey = findTableKey(tableName);
  if (existingKey) {
    return buildErrorResult(`Tabel '${tableName}' sudah ada.`);
  }

  const columnDefinitions = splitTopLevelDefinitions(match[2]);
  const columns = columnDefinitions
    .map((definition) => parseColumnDefinition(definition))
    .filter((column): column is MockColumn => Boolean(column));

  if (columns.length === 0) {
    return buildErrorResult('Tidak ada definisi kolom yang valid di perintah CREATE TABLE.');
  }

  mockDatabase[tableName] = {
    columns,
    rows: [],
    autoIncrement: 1,
  };

  return buildSuccessResult(`Tabel ${tableName} berhasil dibuat dengan ${columns.length} kolom.`, 'DDL');
}

function handleAlterTable(sql: string): SqlExecutionResult {
  const match = sql.match(/^ALTER\s+TABLE\s+`?([\w-]+)`?\s+(ADD|MODIFY|CHANGE|DROP)\s+(?:COLUMN\s+)?([\s\S]+)$/i);
  if (!match) {
    return buildErrorResult('Format ALTER TABLE tidak valid. Contoh: ALTER TABLE siswa ADD no_telepon VARCHAR(15);');
  }

  const tableName = match[1];
  const action = match[2].toUpperCase();
  const remainder = match[3].trim();
  const tableKey = findTableKey(tableName);

  if (!tableKey) {
    return buildErrorResult(`Tabel '${tableName}' tidak ditemukan.`);
  }

  const table = mockDatabase[tableKey];

  if (action === 'ADD') {
    const newColumn = parseColumnDefinition(remainder);
    if (!newColumn) {
      return buildErrorResult('Format ADD COLUMN tidak valid. Contoh: ALTER TABLE siswa ADD no_telepon VARCHAR(15);');
    }

    if (findColumn(table, newColumn.name)) {
      return buildErrorResult(`Kolom '${newColumn.name}' sudah ada pada tabel '${tableName}'.`);
    }

    table.columns.push(newColumn);
    table.rows = table.rows.map((row) => ({ ...row, [newColumn.name]: null }));
    return buildSuccessResult(`Kolom ${newColumn.name} berhasil ditambahkan ke tabel ${tableName}.`, 'DDL');
  }

  if (action === 'MODIFY') {
    const newColumn = parseColumnDefinition(remainder);
    if (!newColumn) {
      return buildErrorResult('Format MODIFY tidak valid. Contoh: ALTER TABLE siswa MODIFY nama_lengkap VARCHAR(150) NOT NULL;');
    }

    const existingColumn = findColumn(table, newColumn.name);
    if (!existingColumn) {
      return buildErrorResult(`Kolom '${newColumn.name}' tidak ditemukan pada tabel '${tableName}'.`);
    }

    existingColumn.type = newColumn.type;
    existingColumn.constraints = newColumn.constraints.length > 0 ? newColumn.constraints : existingColumn.constraints;
    return buildSuccessResult(`Kolom ${newColumn.name} berhasil dimodifikasi pada tabel ${tableName}.`, 'DDL');
  }

  if (action === 'CHANGE') {
    const changeMatch = remainder.match(/^`?([\w-]+)`?\s+`?([\w-]+)`?\s+([\s\S]+)$/i);
    if (!changeMatch) {
      return buildErrorResult('Format CHANGE tidak valid. Contoh: ALTER TABLE siswa CHANGE alamat alamat_domisili TEXT;');
    }

    const oldName = changeMatch[1];
    const newName = changeMatch[2];
    const columnSpec = `${newName} ${changeMatch[3].trim()}`;
    const parsedColumn = parseColumnDefinition(columnSpec);

    const existingColumn = findColumn(table, oldName);
    if (!existingColumn) {
      return buildErrorResult(`Kolom '${oldName}' tidak ditemukan pada tabel '${tableName}'.`);
    }

    if (!parsedColumn) {
      return buildErrorResult('Format CHANGE tidak valid.');
    }

    if (oldName.toLowerCase() !== newName.toLowerCase() && findColumn(table, newName)) {
      return buildErrorResult(`Kolom '${newName}' sudah ada pada tabel '${tableName}'.`);
    }

    existingColumn.name = newName;
    existingColumn.type = parsedColumn.type;
    existingColumn.constraints = parsedColumn.constraints.length > 0 ? parsedColumn.constraints : existingColumn.constraints;

    table.rows = table.rows.map((row) => {
      const updatedRow = { ...row };
      updatedRow[newName] = updatedRow[oldName];
      delete updatedRow[oldName];
      return updatedRow;
    });

    return buildSuccessResult(`Kolom ${oldName} berhasil diubah menjadi ${newName} pada tabel ${tableName}.`, 'DDL');
  }

  if (action === 'DROP') {
    const dropMatch = remainder.match(/^(?:COLUMN\s+)?`?([\w-]+)`?$/i);
    if (!dropMatch) {
      return buildErrorResult('Format DROP COLUMN tidak valid. Contoh: ALTER TABLE siswa DROP COLUMN no_telepon;');
    }

    const columnName = dropMatch[1];
    const columnIndex = table.columns.findIndex((column) => column.name.toLowerCase() === columnName.toLowerCase());
    if (columnIndex === -1) {
      return buildErrorResult(`Kolom '${columnName}' tidak ditemukan pada tabel '${tableName}'.`);
    }

    table.columns.splice(columnIndex, 1);
    table.rows = table.rows.map((row) => {
      const updatedRow = { ...row };
      delete updatedRow[columnName];
      return updatedRow;
    });

    return buildSuccessResult(`Kolom ${columnName} berhasil dihapus dari tabel ${tableName}.`, 'DDL');
  }

  return buildErrorResult('Perintah ALTER TABLE tidak dikenali.');
}

function handleRenameTable(sql: string): SqlExecutionResult {
  const match = sql.match(/^RENAME\s+TABLE\s+`?([\w-]+)`?\s+TO\s+`?([\w-]+)`?$/i);
  if (!match) {
    return buildErrorResult('Format RENAME TABLE tidak valid. Contoh: RENAME TABLE siswa TO data_siswa;');
  }

  const oldName = match[1];
  const newName = match[2];
  const oldKey = findTableKey(oldName);

  if (!oldKey) {
    return buildErrorResult(`Tabel '${oldName}' tidak ditemukan.`);
  }

  const newKey = findTableKey(newName);
  if (newKey) {
    return buildErrorResult(`Tabel '${newName}' sudah ada.`);
  }

  mockDatabase[newName] = mockDatabase[oldKey];
  delete mockDatabase[oldKey];

  return buildSuccessResult(`Tabel ${oldName} berhasil diganti nama menjadi ${newName}.`, 'DDL');
}

function handleDropTable(sql: string): SqlExecutionResult {
  const match = sql.match(/^DROP\s+TABLE\s+`?([\w-]+)`?$/i);
  if (!match) {
    return buildErrorResult('Format DROP TABLE tidak valid. Contoh: DROP TABLE data_siswa;');
  }

  const tableName = match[1];
  const tableKey = findTableKey(tableName);

  if (!tableKey) {
    return buildErrorResult(`Tabel '${tableName}' tidak ditemukan.`);
  }

  delete mockDatabase[tableKey];
  return buildSuccessResult(`Tabel ${tableName} berhasil dihapus.`, 'DDL');
}

function handleDropDatabase(sql: string): SqlExecutionResult {
  const match = sql.match(/^DROP\s+DATABASE\s+`?([\w-]+)`?$/i);
  if (!match) {
    return buildErrorResult('Format DROP DATABASE tidak valid. Contoh: DROP DATABASE smkn5malang;');
  }

  mockDatabase = {};
  currentDatabaseName = '';
  return buildSuccessResult(`Database ${match[1]} berhasil dihapus.`, 'DDL');
}

function handleTruncateTable(sql: string): SqlExecutionResult {
  const match = sql.match(/^TRUNCATE\s+TABLE\s+`?([\w-]+)`?$/i);
  if (!match) {
    return buildErrorResult('Format TRUNCATE TABLE tidak valid. Contoh: TRUNCATE TABLE data_siswa;');
  }

  const tableName = match[1];
  const tableKey = findTableKey(tableName);

  if (!tableKey) {
    return buildErrorResult(`Tabel '${tableName}' tidak ditemukan.`);
  }

  mockDatabase[tableKey].rows = [];
  mockDatabase[tableKey].autoIncrement = 1;
  return buildSuccessResult(`Seluruh data pada tabel ${tableName} berhasil dikosongkan.`, 'DDL');
}

function parseSelect(sql: string): SqlExecutionResult {
  const selectRegex =
    /SELECT\s+(.*?)\s+FROM\s+`?([\w-]+)`?(?:\s+WHERE\s+(.+))?(?:\s+ORDER\s+BY\s+(.+))?(?:\s+LIMIT\s+(\d+))?$/i;
  const match = sql.match(selectRegex);

  if (!match) {
    return buildErrorResult('Format SELECT tidak valid. Contoh: SELECT * FROM users WHERE id = 1;');
  }

  const [, selectPart, tableName, whereClause, orderByClause, limitClause] = match;
  const tableKey = findTableKey(tableName);

  if (!tableKey) {
    return buildErrorResult(`Tabel '${tableName}' tidak ditemukan. Tabel yang tersedia: ${Object.keys(mockDatabase).join(', ')}`);
  }

  const table = mockDatabase[tableKey];
  let results = [...table.rows];

  if (whereClause) {
    results = results.filter((row) => evaluateWhere(row, whereClause));
  }

  if (orderByClause) {
    const parts = orderByClause.trim().split(/\s+/);
    const [column, direction = 'ASC'] = parts;
    results.sort((a, b) => {
      const aVal = getColumnValue(a, column);
      const bVal = getColumnValue(b, column);
      if (direction.toUpperCase() === 'DESC') {
        return bVal > aVal ? 1 : -1;
      }
      return aVal > bVal ? 1 : -1;
    });
  }

  if (limitClause) {
    results = results.slice(0, parseInt(limitClause, 10));
  }

  let columns: string[] = [];
  if (selectPart.trim() === '*') {
    columns = table.columns.map((column) => column.name);
  } else {
    columns = selectPart.split(',').map((c) => c.trim().replace(/`/g, ''));
  }

  const rows = results.map((row) => {
    const obj: Record<string, any> = {};
    columns.forEach((col) => {
      const key = Object.keys(row).find((candidate) => candidate.toLowerCase() === col.toLowerCase());
      obj[col] = key ? row[key] : null;
    });
    return obj;
  });

  return {
    success: true,
    rows,
    columns,
    message: `${rows.length} baris berhasil ditampilkan.`,
    rowCount: rows.length,
    operation: 'SELECT',
  };
}

function splitTopLevelDefinitions(definitionBlock: string): string[] {
  const definitions: string[] = [];
  let current = '';
  let parenthesisDepth = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;

  for (let index = 0; index < definitionBlock.length; index += 1) {
    const character = definitionBlock[index];

    if (character === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      current += character;
      continue;
    }

    if (character === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      current += character;
      continue;
    }

    if (!inSingleQuote && !inDoubleQuote) {
      if (character === '(') parenthesisDepth += 1;
      if (character === ')') parenthesisDepth = Math.max(0, parenthesisDepth - 1);

      if (character === ',' && parenthesisDepth === 0) {
        if (current.trim()) definitions.push(current.trim());
        current = '';
        continue;
      }
    }

    current += character;
  }

  if (current.trim()) {
    definitions.push(current.trim());
  }

  return definitions;
}

function parseColumnDefinition(definition: string): MockColumn | null {
  const normalizedDefinition = definition.trim().replace(/\s+/g, ' ');
  const match = normalizedDefinition.match(/^`?([\w-]+)`?\s+([\s\S]+)$/i);

  if (!match) {
    return null;
  }

  const name = match[1];
  const spec = match[2].trim();
  const upperSpec = spec.toUpperCase();
  const constraintMarkers = ['PRIMARY KEY', 'NOT NULL', 'AUTO_INCREMENT', 'UNIQUE'];

  let typeEndIndex = spec.length;
  constraintMarkers.forEach((marker) => {
    const markerIndex = upperSpec.indexOf(marker);
    if (markerIndex >= 0 && markerIndex < typeEndIndex) {
      typeEndIndex = markerIndex;
    }
  });

  const type = spec.slice(0, typeEndIndex).trim();
  const constraintText = spec.slice(typeEndIndex).toUpperCase();
  const constraints: string[] = [];

  if (constraintText.includes('PRIMARY KEY')) constraints.push('PRIMARY KEY');
  if (constraintText.includes('AUTO_INCREMENT')) constraints.push('AUTO_INCREMENT');
  if (constraintText.includes('NOT NULL')) constraints.push('NOT NULL');
  if (constraintText.includes('UNIQUE')) constraints.push('UNIQUE');

  return {
    name,
    type,
    constraints,
  };
}

function findTableKey(tableName: string): string | null {
  const lowerName = tableName.toLowerCase();
  return Object.keys(mockDatabase).find((key) => key.toLowerCase() === lowerName) ?? null;
}

function findColumn(table: MockTable, columnName: string): MockColumn | undefined {
  return table.columns.find((column) => column.name.toLowerCase() === columnName.toLowerCase());
}

function getColumnValue(row: Record<string, any>, columnName: string): any {
  const key = Object.keys(row).find((candidate) => candidate.toLowerCase() === columnName.toLowerCase());
  return key ? row[key] : null;
}

function evaluateWhere(row: Record<string, any>, whereClause: string): boolean {
  const conditionRegex = /(\w+)\s*(=|!=|>|<|>=|<=|LIKE)\s*['"]?(.+?)['"]?$/i;
  const match = whereClause.match(conditionRegex);

  if (!match) {
    return true;
  }

  const [, column, operator, value] = match;
  const rowValue = getColumnValue(row, column);
  const compareValue = isNaN(Number(value)) ? value : Number(value);

  switch (operator.toUpperCase()) {
    case '=':
      return String(rowValue) === String(compareValue);
    case '!=':
      return String(rowValue) !== String(compareValue);
    case '>':
      return Number(rowValue) > Number(compareValue);
    case '<':
      return Number(rowValue) < Number(compareValue);
    case '>=':
      return Number(rowValue) >= Number(compareValue);
    case '<=':
      return Number(rowValue) <= Number(compareValue);
    case 'LIKE':
      return String(rowValue).toLowerCase().includes(String(compareValue).toLowerCase());
    default:
      return false;
  }
}

function cloneDatabase(source: MockDatabase): MockDatabase {
  const clone: MockDatabase = {};

  Object.entries(source).forEach(([tableName, table]) => {
    clone[tableName] = {
      columns: table.columns.map((column) => ({
        name: column.name,
        type: column.type,
        constraints: [...column.constraints],
      })),
      rows: table.rows.map((row) => ({ ...row })),
      autoIncrement: table.autoIncrement,
    };
  });

  return clone;
}

function normalizeStatement(sql: string): string {
  return sql.trim().replace(/;+\s*$/, '');
}

function buildSchemaSnapshot(): MockSchemaTable[] {
  return Object.entries(mockDatabase).map(([name, table]) => ({
    name,
    columns: table.columns.map((column) => ({
      name: column.name,
      type: column.type,
      constraints: [...column.constraints],
    })),
    rowCount: table.rows.length,
  }));
}

function buildSuccessResult(message: string, operation: 'DDL' | 'SELECT', rows: Record<string, any>[] = [], columns: string[] = []): SqlExecutionResult {
  return {
    success: true,
    rows,
    columns,
    message,
    rowCount: operation === 'DDL' ? buildSchemaSnapshot().length : rows.length,
    operation,
    schema: buildSchemaSnapshot(),
  };
}

function buildErrorResult(error: string): SqlExecutionResult {
  return {
    success: false,
    rows: [],
    columns: [],
    error,
    rowCount: 0,
    operation: 'DDL',
    schema: buildSchemaSnapshot(),
  };
}

export function getMockTables(): string[] {
  return Object.keys(mockDatabase);
}

export function getMockTableStructure(tableName: string): Record<string, any> | null {
  const tableKey = findTableKey(tableName);
  if (!tableKey) return null;

  const table = mockDatabase[tableKey];
  if (table.rows.length > 0) return table.rows[0];

  const structure: Record<string, any> = {};
  table.columns.forEach((column) => {
    structure[column.name] = column.type;
  });

  return structure;
}

export function getMockSchema(): MockSchemaTable[] {
  return buildSchemaSnapshot();
}

export function resetMockDatabase(): void {
  mockDatabase = cloneDatabase(initialMockDatabase);
  currentDatabaseName = 'training_db';
}
