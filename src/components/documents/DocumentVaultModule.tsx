import React, { useState, useMemo } from 'react';
import {
  FileText,
  UploadCloud,
  Download,
  Trash2,
  Search,
  Lock,
  Eye,
  FileSpreadsheet,
  FileCheck,
  ShieldCheck,
  FolderLock,
  ExternalLink,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { DocumentRecord } from '../../types';
import { SUPABASE_DOCUMENTS_BUCKET } from '../../lib/supabase';

interface DocumentVaultModuleProps {
  onOpenUploadModal: () => void;
}

const CATEGORIES: ('All' | DocumentRecord['category'])[] = [
  'All',
  'Expense Receipt',
  'Salary Slip',
  'Tax Document',
  'Bank Statement',
  'Invoice',
  'Other',
];

export const DocumentVaultModule: React.FC<DocumentVaultModuleProps> = ({ onOpenUploadModal }) => {
  const { documents, downloadDocument, deleteDocument } = useFinance();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | DocumentRecord['category']>('All');
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        doc.file_name.toLowerCase().includes(search.toLowerCase()) ||
        doc.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [documents, search, selectedCategory]);

  const totalStorageBytes = useMemo(() => {
    return documents.reduce((acc, curr) => acc + Number(curr.file_size || 0), 0);
  }, [documents]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleDownload = async (doc: DocumentRecord) => {
    setDownloadingId(doc.id);
    try {
      await downloadDocument(doc);
    } catch (err: any) {
      alert(`Download error: ${err.message}`);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (doc: DocumentRecord) => {
    if (confirm(`Permanently remove "${doc.file_name}" from Supabase Storage bucket "${SUPABASE_DOCUMENTS_BUCKET}"?`)) {
      setDeletingId(doc.id);
      try {
        await deleteDocument(doc);
      } catch (err: any) {
        alert(`Deletion error: ${err.message}`);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Storage stats */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Encrypted Storage</span>
            <FolderLock className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mt-1">{formatFileSize(totalStorageBytes)}</h3>
          <p className="text-xs text-slate-400 mt-1">Across {documents.length} uploaded files</p>
        </div>

        {/* Bucket Status */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Cloud Storage Bucket</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Private
            </span>
          </div>
          <h3 className="text-lg font-bold font-mono text-blue-400 mt-1 truncate">
            {SUPABASE_DOCUMENTS_BUCKET}
          </h3>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Isolated path: <code className="text-slate-300 font-mono text-[11px]">{`{auth.uid()}/...`}</code>
          </p>
        </div>

        {/* Action Button */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Document Vault</span>
            <h3 className="text-base font-bold text-white mt-1">Secure Upload</h3>
            <p className="text-xs text-slate-400">Bills, Tax & Receipts</p>
          </div>
          <button
            onClick={onOpenUploadModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload File</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search uploaded documents by name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Document Categories' : c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Document Grid / Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg overflow-hidden">
        {filteredDocs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30 text-blue-400" />
            <h4 className="text-base font-semibold text-slate-300">No documents found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Upload financial receipts, tax filings, or bank statements directly to private Supabase Cloud Storage.
            </p>
            <button
              onClick={onOpenUploadModal}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
            >
              Upload Document Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Document Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Storage Path</th>
                  <th className="py-3.5 px-4">Size</th>
                  <th className="py-3.5 px-4">Uploaded</th>
                  <th className="py-3.5 px-4 sm:px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-white truncate max-w-xs">{doc.file_name}</div>
                          <div className="text-[11px] text-slate-400">{doc.file_type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {doc.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 truncate max-w-[200px]">
                      {doc.file_path}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {formatFileSize(doc.file_size)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {doc.upload_date.slice(0, 10)}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleDownload(doc)}
                          disabled={downloadingId === doc.id}
                          title="Download securely from Supabase Storage"
                          className="p-1.5 rounded-lg text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/10 transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc)}
                          disabled={deletingId === doc.id}
                          title="Delete from Supabase Storage"
                          className="p-1.5 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
