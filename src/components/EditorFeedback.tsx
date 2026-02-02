'use client';

import { useState } from 'react';
import { EditorFeedback as EditorFeedbackType } from '@/types/pipeline';

interface EditorFeedbackProps {
  feedback: EditorFeedbackType[];
  onFeedbackUpdate: (feedback: EditorFeedbackType[]) => void;
  onAcceptAll: () => void;
  onContinue: () => void;
  isProcessing: boolean;
  onHighlight: (locations: string[]) => void;
}

const editorColors = {
  skeptic: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100' },
  besci: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100' },
  clarity: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', badge: 'bg-teal-100' },
};

const severityColors = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-600',
};

export function EditorFeedbackPanel({
  feedback,
  onFeedbackUpdate,
  onAcceptAll,
  onContinue,
  isProcessing,
  onHighlight,
}: EditorFeedbackProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [responseText, setResponseText] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);

  const handleAccept = (id: string) => {
    onFeedbackUpdate(
      feedback.map((f) => (f.id === id ? { ...f, status: 'accepted' } : f))
    );
  };

  const handleReject = (id: string) => {
    onFeedbackUpdate(
      feedback.map((f) => (f.id === id ? { ...f, status: 'rejected' } : f))
    );
  };

  const handleEdit = (id: string, currentSuggestion?: string) => {
    setEditingId(id);
    setRespondingId(null);
    setEditText(currentSuggestion || '');
  };

  const handleRespond = (id: string, currentResponse?: string) => {
    setRespondingId(id);
    setEditingId(null);
    setResponseText(currentResponse || '');
  };

  const handleSaveEdit = (id: string) => {
    onFeedbackUpdate(
      feedback.map((f) =>
        f.id === id ? { ...f, status: 'edited', userEdit: editText } : f
      )
    );
    setEditingId(null);
    setEditText('');
  };

  const handleSaveResponse = (id: string) => {
    onFeedbackUpdate(
      feedback.map((f) =>
        f.id === id ? { ...f, status: 'responded', userResponse: responseText } : f
      )
    );
    setRespondingId(null);
    setResponseText('');
  };

  const pendingCount = feedback.filter((f) => f.status === 'pending').length;
  const acceptedCount = feedback.filter(
    (f) => f.status === 'accepted' || f.status === 'edited' || f.status === 'responded'
  ).length;

  const groupedFeedback = {
    skeptic: feedback.filter((f) => f.editor === 'skeptic'),
    besci: feedback.filter((f) => f.editor === 'besci'),
    clarity: feedback.filter((f) => f.editor === 'clarity'),
  };

  const getStatusBadge = (status: EditorFeedbackType['status']) => {
    switch (status) {
      case 'rejected':
        return 'bg-red-100 text-red-600';
      case 'responded':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-green-100 text-green-600';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700">Editor Feedback</h3>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500">{pendingCount} pending</span>
            <span className="text-green-600">{acceptedCount} actionable</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onAcceptAll}
            disabled={pendingCount === 0}
            className="flex-1 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Accept All & Continue
          </button>
          <button
            onClick={() => setShowNotesInput(!showNotesInput)}
            className="px-3 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
          >
            + Notes
          </button>
        </div>

        {showNotesInput && (
          <div className="mt-3">
            <textarea
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="Add guidance for the revision step..."
              className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
            />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {(['skeptic', 'besci', 'clarity'] as const).map((editor) => {
          const items = groupedFeedback[editor];
          if (items.length === 0) return null;

          const colors = editorColors[editor];

          return (
            <div key={editor}>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded ${colors.badge} ${colors.text}`}
                >
                  {editor.charAt(0).toUpperCase() + editor.slice(1)}
                </span>
                <span className="text-xs text-gray-400">{items.length} items</span>
              </div>

              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`
                      p-3 rounded-lg border transition-all
                      ${item.status === 'rejected' ? 'opacity-50' : ''}
                      ${item.status === 'accepted' || item.status === 'edited' ? 'border-green-300 bg-green-50' : ''}
                      ${item.status === 'responded' ? 'border-blue-300 bg-blue-50' : ''}
                      ${item.status === 'pending' ? `${colors.bg} ${colors.border}` : ''}
                    `}
                    onMouseEnter={() => onHighlight([item.location])}
                    onMouseLeave={() => onHighlight([])}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span
                        className={`px-1.5 py-0.5 text-xs rounded ${severityColors[item.severity]}`}
                      >
                        {item.severity}
                      </span>
                      {item.status === 'pending' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleAccept(item.id)}
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                            title="Accept"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleReject(item.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                            title="Reject"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEdit(item.id, item.suggestion)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                            title="Edit suggestion"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleRespond(item.id, item.userResponse)}
                            className="p-1 text-purple-600 hover:bg-purple-100 rounded"
                            title="Respond with context"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </button>
                        </div>
                      )}
                      {item.status !== 'pending' && (
                        <span className={`text-xs px-2 py-0.5 rounded ${getStatusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 mb-1 font-mono truncate">
                      &ldquo;{item.location}&rdquo;
                    </p>
                    <p className="text-sm text-gray-700 mb-2">{item.issue}</p>

                    {/* Edit mode */}
                    {editingId === item.id && (
                      <div className="mt-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full p-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          rows={2}
                          placeholder="Your edit or note..."
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Save & Accept
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Respond mode */}
                    {respondingId === item.id && (
                      <div className="mt-2">
                        <p className="text-xs text-purple-600 mb-1 font-medium">
                          Provide context or push back - this will be passed to the revision agent:
                        </p>
                        <textarea
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          className="w-full p-2 text-sm border border-purple-200 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none bg-purple-50"
                          rows={3}
                          placeholder="e.g., 'This is intentional because...' or 'The context here is...' or 'I disagree because...'"
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleSaveResponse(item.id)}
                            className="px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
                          >
                            Save Response
                          </button>
                          <button
                            onClick={() => setRespondingId(null)}
                            className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Show saved response */}
                    {item.userResponse && respondingId !== item.id && (
                      <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded">
                        <p className="text-xs text-purple-600 font-medium mb-1">Your response:</p>
                        <p className="text-sm text-purple-800 italic">{item.userResponse}</p>
                      </div>
                    )}

                    {/* Show suggestion or edit (when not editing) */}
                    {editingId !== item.id && respondingId !== item.id && item.suggestion && !item.userResponse && (
                      <p className="text-sm text-gray-500 italic">
                        Suggestion: {item.userEdit || item.suggestion}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-4 py-3 border-t border-gray-200">
        <button
          onClick={onContinue}
          disabled={isProcessing || acceptedCount === 0}
          className="w-full px-4 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </span>
          ) : (
            `Continue with ${acceptedCount} actionable items`
          )}
        </button>
      </div>
    </div>
  );
}
