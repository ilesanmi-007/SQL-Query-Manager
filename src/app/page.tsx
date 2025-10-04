'use client';

import { useState, useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-sql';
import 'prismjs/themes/prism.css';

interface Query {
  id: number;
  sql: string;
  description: string;
  result: string;
  date: string;
  timestamp: string;
}

export default function Home() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [sql, setSql] = useState('');
  const [description, setDescription] = useState('');
  const [result, setResult] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('sqlQueries');
    if (saved) setQueries(JSON.parse(saved));
  }, []);

  useEffect(() => {
    Prism.highlightAll();
  }, [queries]);

  const saveQuery = (e: React.FormEvent) => {
    e.preventDefault();
    const newQuery: Query = {
      id: Date.now(),
      sql,
      description,
      result,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toLocaleString()
    };
    const updated = [newQuery, ...queries];
    setQueries(updated);
    localStorage.setItem('sqlQueries', JSON.stringify(updated));
    setSql('');
    setDescription('');
    setResult('');
  };

  const deleteQuery = (id: number) => {
    if (confirm('Delete this query?')) {
      const updated = queries.filter(q => q.id !== id);
      setQueries(updated);
      localStorage.setItem('sqlQueries', JSON.stringify(updated));
    }
  };

  const filteredQueries = queries.filter(query => {
    const matchesSearch = !searchTerm || 
      query.sql.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || query.date === dateFilter;
    return matchesSearch && matchesDate;
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold mb-6">SQL Query Manager</h1>
        <form onSubmit={saveQuery} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">SQL Query:</label>
            <textarea
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              className="w-full p-3 border rounded-md font-mono h-32"
              placeholder="Enter your SQL query here..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border rounded-md h-20"
              placeholder="Explain what this query does..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Sample Result:</label>
            <textarea
              value={result}
              onChange={(e) => setResult(e.target.value)}
              className="w-full p-3 border rounded-md font-mono h-24"
              placeholder="Paste sample output here..."
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Save Query
          </button>
        </form>
      </div>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-3 border rounded-md"
          placeholder="Search queries by keywords..."
        />
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="p-3 border rounded-md"
        />
        <button
          onClick={() => { setSearchTerm(''); setDateFilter(''); }}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Clear
        </button>
      </div>

      <div className="space-y-4">
        {filteredQueries.length === 0 ? (
          <div className="text-center text-gray-500 py-12">No queries found</div>
        ) : (
          filteredQueries.map(query => (
            <div key={query.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                <span className="font-medium">Query #{query.id}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">{query.timestamp}</span>
                  <button
                    onClick={() => deleteQuery(query.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="font-medium mb-2">SQL Query:</h3>
                  <pre className="bg-gray-50 p-3 rounded overflow-x-auto">
                    <code className="language-sql">{query.sql}</code>
                  </pre>
                </div>
                {query.description && (
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Description:</h3>
                    <div className="bg-blue-50 p-3 rounded">{query.description}</div>
                  </div>
                )}
                {query.result && (
                  <div>
                    <h3 className="font-medium mb-2">Sample Result:</h3>
                    <pre className="bg-green-50 p-3 rounded overflow-x-auto font-mono text-sm whitespace-pre-wrap">
                      {query.result}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
