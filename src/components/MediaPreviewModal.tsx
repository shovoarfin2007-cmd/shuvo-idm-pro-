import React from 'react';
import {
  X,
  Download,
  FileCheck,
  Video,
  Music,
  FolderOpen,
  Hash,
  Clock,
  HardDrive,
  Copy,
  Check,
} from 'lucide-react';
import { DownloadItem } from '../types/idm';
import { formatBytes } from '../utils/license';

interface MediaPreviewModalProps {
  item: DownloadItem;
  onClose: () => void;
  onSaveToDisk: () => void;
  onOpenFolder: () => void;
}

export const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({
  item,
  onClose,
  onSaveToDisk,
  onOpenFolder,
}) => {
  const [copiedHash, setCopiedHash] = React.useState(false);

  const handleCopyHash = () => {
    if (item.checksum) {
      navigator.clipboard.writeText(item.checksum);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col text-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-800 px-4 py-2.5 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-100">
              Media Inspector & Preview - Shuvo IDM
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700 transition-colors"
            aria-label="Close media preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-xs">
          {/* Media Player Box */}
          <div className="bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex flex-col items-center justify-center min-h-[180px] p-4 text-center relative group">
            {item.category === 'videos' ? (
              <div className="w-full space-y-3">
                <div className="aspect-video w-full max-h-52 bg-slate-900 rounded-md overflow-hidden relative flex items-center justify-center border border-slate-800">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.name}
                      className="w-full h-full object-cover opacity-80"
                    />
                  ) : (
                    <Video className="w-12 h-12 text-slate-700" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform cursor-pointer">
                      <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 font-mono text-[10px] text-white">
                    HD Preview Ready
                  </div>
                </div>
              </div>
            ) : item.category === 'music' ? (
              <div className="w-full space-y-3 py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                  <Music className="w-8 h-8" />
                </div>
                <div className="font-semibold text-slate-200 text-sm">{item.name}</div>
                <div className="w-full max-w-sm mx-auto bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>0:00</span>
                    <span className="text-emerald-400">Audio Stream 320kbps</span>
                    <span>3:42</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-1/3" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 space-y-2">
                <HardDrive className="w-12 h-12 text-cyan-400 mx-auto" />
                <div className="font-semibold text-slate-200">{item.name}</div>
                <div className="text-slate-400 text-[11px]">
                  File verified and ready in download directory
                </div>
              </div>
            )}
          </div>

          {/* Metadata Table */}
          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 text-[10px]">File Name:</span>
                <div className="font-medium text-slate-200 truncate">{item.name}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">File Size:</span>
                <div className="font-mono text-cyan-400 font-semibold">{formatBytes(item.fileSize)}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">Destination:</span>
                <div className="font-mono text-emerald-400 text-[10px] truncate">{item.savePath}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">Status:</span>
                <div className="text-emerald-400 font-medium">✓ Completed & Checked</div>
              </div>
            </div>

            {/* Checksum */}
            {item.checksum && (
              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span className="flex items-center gap-1">
                    <Hash className="w-3 h-3 text-purple-400" />
                    SHA-256 Checksum:
                  </span>
                  <button
                    onClick={handleCopyHash}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    {copiedHash ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="font-mono text-[9px] bg-slate-900 p-1.5 rounded text-purple-300 break-all select-all">
                  {item.checksum}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-800/90 px-4 py-3 border-t border-slate-700 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={onSaveToDisk}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all shadow-md active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save File to PC</span>
            </button>

            <button
              onClick={onOpenFolder}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-700 hover:bg-emerald-600 text-white font-medium transition-all"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Open Folder</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
