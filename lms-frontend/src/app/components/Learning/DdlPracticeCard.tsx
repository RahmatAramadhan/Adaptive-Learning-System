import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Code2, Play } from 'lucide-react';
import { executeSqlMock, SqlExecutionResult } from '@/app/utils/sqlMock';

interface DdlSchemaColumn {
  name: string;
  type: string;
  constraints: string[];
}

interface DdlSchemaTable {
  name: string;
  columns: DdlSchemaColumn[];
  rowCount: number;
}

interface Props {
  title?: string;
  subtitle?: string;
  accentClassName?: string;
  accentTextClassName?: string;
}

export function DdlPracticeCard({
  title = 'DDL Practice',
  subtitle = 'Latihan struktur database: create, alter, rename, drop, truncate',
  accentClassName = 'from-blue-600 to-indigo-600',
  accentTextClassName = 'text-blue-100',
}: Props) {
  const [sqlQuery, setSqlQuery] = useState('');
  const [result, setResult] = useState<SqlExecutionResult | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const ddlExamples = [
    {
      label: 'CREATE DATABASE',
      sql: 'CREATE DATABASE smkn5malang;',
    },
    {
      label: 'USE DATABASE',
      sql: 'USE smkn5malang;',
    },
    {
      label: 'CREATE TABLE',
      sql: `CREATE TABLE siswa (
  id_siswa INT AUTO_INCREMENT PRIMARY KEY,
  nis VARCHAR(10) UNIQUE NOT NULL,
  nama_lengkap VARCHAR(100) NOT NULL,
  jenis_kelamin ENUM('L', 'P'),
  tanggal_lahir DATE,
  alamat TEXT
);`,
    },
    {
      label: 'ADD COLUMN',
      sql: 'ALTER TABLE siswa ADD no_telepon VARCHAR(15);',
    },
    {
      label: 'MODIFY COLUMN',
      sql: 'ALTER TABLE siswa MODIFY nama_lengkap VARCHAR(150) NOT NULL;',
    },
    {
      label: 'CHANGE COLUMN',
      sql: 'ALTER TABLE siswa CHANGE alamat alamat_domisili TEXT;',
    },
    {
      label: 'RENAME TABLE',
      sql: 'RENAME TABLE siswa TO data_siswa;',
    },
    {
      label: 'TRUNCATE TABLE',
      sql: 'TRUNCATE TABLE data_siswa;',
    },
    {
      label: 'DROP TABLE',
      sql: 'DROP TABLE data_siswa;',
    },
  ];

  const handleExecute = () => {
    setResult(executeSqlMock(sqlQuery));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-2xl shadow-sm border border-blue-200 overflow-hidden ring-4 ring-blue-500/10"
    >
      <div className={`bg-gradient-to-r ${accentClassName} p-8 text-white flex items-center gap-4`}>
        <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
          <Code2 className="w-7 h-7 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold">{title}</h3>
          <p className={`text-sm ${accentTextClassName}`}>{subtitle}</p>
        </div>
      </div>

      <div className="p-8 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="block text-sm font-semibold text-slate-900">DDL Query</label>
              <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                {showHelp ? 'Sembunyikan Help' : 'Tampilkan Help'}
              </button>
            </div>
            <textarea
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              placeholder="ketikkan perintah SQL disini"
              className="w-full p-3 border border-slate-300 rounded-lg font-mono text-sm min-h-40 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            />

            {showHelp && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-900 space-y-3">
                <div>
                  <p className="font-semibold">Fokus latihan: DDL</p>
                  <p>Gunakan contoh ini sebagai bantuan cepat, lalu sembunyikan lagi jika ingin latihan mandiri.</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">Contoh cepat:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {ddlExamples.map((example) => (
                      <button
                        key={example.label}
                        type="button"
                        onClick={() => setSqlQuery(example.sql)}
                        className="text-left px-3 py-2 bg-white border border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-100 transition-colors"
                      >
                        <span className="font-semibold">{example.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleExecute}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" /> Jalankan DDL
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">Hasil / Visualisasi Struktur</label>
            <div className="border border-slate-300 rounded-lg p-4 min-h-40 bg-slate-50 overflow-auto">
              {result ? (
                result.success ? (
                  <div className="space-y-4">
                    {result.message && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-900">
                        {result.message}
                      </div>
                    )}

                    {result.schema && result.schema.length > 0 ? (
                      <div className="space-y-4">
                        {result.schema.map((table: DdlSchemaTable) => (
                          <div key={table.name} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <div className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-100 border-b border-slate-200">
                              <div>
                                <p className="font-bold text-slate-900">{table.name}</p>
                                <p className="text-xs text-slate-500">{table.rowCount} data row</p>
                              </div>
                              <div className="text-xs font-semibold text-slate-600 bg-white px-2 py-1 rounded-full border border-slate-200">
                                {table.columns.length} kolom
                              </div>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs border-collapse">
                                <thead>
                                  <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="text-left px-3 py-2 font-semibold text-slate-700">Kolom</th>
                                    <th className="text-left px-3 py-2 font-semibold text-slate-700">Tipe</th>
                                    <th className="text-left px-3 py-2 font-semibold text-slate-700">Constraint</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {table.columns.map((column: DdlSchemaColumn) => (
                                    <tr key={`${table.name}-${column.name}`} className="border-b border-slate-100">
                                      <td className="px-3 py-2 font-medium text-slate-800">{column.name}</td>
                                      <td className="px-3 py-2 text-slate-600">{column.type}</td>
                                      <td className="px-3 py-2 text-slate-600">
                                        {column.constraints.length > 0 ? column.constraints.join(', ') : '-'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-sm">Jalankan perintah DDL untuk melihat perubahan struktur tabel...</p>
                    )}
                  </div>
                ) : (
                  <div className="text-red-600 text-sm">
                    <p className="font-semibold mb-1">❌ Error:</p>
                    <p>{result.error}</p>
                  </div>
                )
              ) : (
                <p className="text-slate-400 text-sm">Jalankan perintah DDL untuk melihat perubahan struktur tabel...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}