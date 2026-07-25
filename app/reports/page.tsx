'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

export default function ReportsPage() {
  const [reportType, setReportType] = useState<'daily' | 'period' | 'party'>('daily');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      // TODO: Fetch report from API
      setLoading(false);
    } catch (error) {
      console.error('Error generating report:', error);
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    console.log('Exporting to PDF...');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">রিপোর্ট এবং বিশ্লেষণ</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => setReportType('daily')}
            className={`p-4 rounded-lg font-semibold transition ${
              reportType === 'daily'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            দৈনিক রিপোর্ট
          </button>
          <button
            onClick={() => setReportType('period')}
            className={`p-4 rounded-lg font-semibold transition ${
              reportType === 'period'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            সময়কাল রিপোর্ট
          </button>
          <button
            onClick={() => setReportType('party')}
            className={`p-4 rounded-lg font-semibold transition ${
              reportType === 'party'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            পার্টি খাতা
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">তারিখ নির্বাচন করুন</label>
            <input type="date" className="w-full border rounded-lg p-2" />
          </div>

          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'তৈরি হচ্ছে...' : 'রিপোর্ট তৈরি করুন'}
          </button>
        </div>
      </div>

      {reportData && (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">রিপোর্ট ফলাফল</h2>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <Download size={18} />
              PDF ডাউনলোড করুন
            </button>
          </div>
          {/* Report content will be displayed here */}
        </div>
      )}
    </div>
  );
}
