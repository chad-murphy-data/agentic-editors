'use client';

import { useState } from 'react';

interface DocumentViewerProps {
  document: string;
  highlightedSections?: string[];
  onDocumentChange?: (doc: string) => void;
  editable?: boolean;
  label?: string;
}

export function DocumentViewer({
  document,
  highlightedSections = [],
  onDocumentChange,
  editable = false,
  label = 'Document',
}: DocumentViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(document);

  const handleSave = () => {
    onDocumentChange?.(editedContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedContent(document);
    setIsEditing(false);
  };

  // Highlight matching sections in the document
  const getHighlightedContent = () => {
    if (highlightedSections.length === 0) return document;

    let content = document;
    highlightedSections.forEach((section) => {
      if (section && content.includes(section)) {
        content = content.replace(
          section,
          `<mark class="bg-yellow-100 px-0.5 rounded">${section}</mark>`
        );
      }
    });
    return content;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700">{label}</h3>
        {editable && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-blue-500 hover:text-blue-600 font-medium"
          >
            Edit
          </button>
        )}
        {isEditing && (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="text-sm text-gray-500 hover:text-gray-600 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="text-sm text-blue-500 hover:text-blue-600 font-medium"
            >
              Save
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4">
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-full min-h-[400px] p-3 text-sm text-gray-700 leading-relaxed border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono"
          />
        ) : (
          <div
            className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: getHighlightedContent() }}
          />
        )}
      </div>

      {document && (
        <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400">
          {document.split(/\s+/).length} words
        </div>
      )}
    </div>
  );
}
