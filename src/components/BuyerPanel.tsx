'use client';

import { BuyerReaction } from '@/types/pipeline';

interface BuyerPanelProps {
  reactions: BuyerReaction[];
  isLoading: boolean;
}

const buyerInfo = {
  ceo: {
    title: 'CEO',
    subtitle: 'Strategic Lens',
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
  },
  cpo: {
    title: 'CPO',
    subtitle: 'Product Lens',
    color: 'purple',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
  },
  cro: {
    title: 'CRO',
    subtitle: 'Research Lens',
    color: 'teal',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    textColor: 'text-teal-700',
  },
  'head-cx': {
    title: 'Head of CX',
    subtitle: 'Practical Lens',
    color: 'orange',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700',
  },
};

function BuyerCard({
  reaction,
  isLoading,
}: {
  reaction?: BuyerReaction;
  isLoading: boolean;
}) {
  const buyerKey = reaction?.buyer || 'ceo';
  const info = buyerInfo[buyerKey];

  if (isLoading || !reaction) {
    return (
      <div className={`rounded-xl border ${info.borderColor} ${info.bgColor} p-4 animate-pulse`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="h-5 w-16 bg-gray-200 rounded mb-1" />
            <div className="h-3 w-24 bg-gray-200 rounded" />
          </div>
          <div className="h-8 w-8 bg-gray-200 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border ${info.borderColor} ${info.bgColor} p-4`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className={`font-medium ${info.textColor}`}>{info.title}</h4>
          <p className="text-xs text-gray-500">{info.subtitle}</p>
        </div>
        <span className="text-2xl" title={reaction.reaction}>
          {reaction.reactionEmoji}
        </span>
      </div>

      <p className="text-sm text-gray-700 mb-3">{reaction.reaction}</p>

      {reaction.stoppedAt && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-600 font-medium mb-1">Stopped reading at:</p>
          <p className="text-xs text-red-700 italic">&ldquo;{reaction.stoppedAt}&rdquo;</p>
        </div>
      )}

      {reaction.quotable && (
        <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-green-600 font-medium mb-1">Would quote to team:</p>
          <p className="text-xs text-green-700 italic">&ldquo;{reaction.quotable}&rdquo;</p>
        </div>
      )}

      {reaction.questions.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">Questions before moving forward:</p>
          <ul className="space-y-1">
            {reaction.questions.map((q, i) => (
              <li key={i} className="text-xs text-gray-600 flex gap-1">
                <span className="text-gray-400">•</span>
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function BuyerPanel({ reactions, isLoading }: BuyerPanelProps) {
  const buyers: Array<BuyerReaction['buyer']> = ['ceo', 'cpo', 'cro', 'head-cx'];

  // Count positive vs negative reactions
  const positiveEmojis = ['👍', '🎉', '✅', '💪', '🚀', '👏', '💡', '⭐'];
  const positiveCount = reactions.filter((r) =>
    positiveEmojis.some((e) => r.reactionEmoji.includes(e))
  ).length;

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">Buyer Reactions</h3>
          {reactions.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-green-600">{positiveCount} positive</span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-500">{reactions.length - positiveCount} mixed/negative</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 gap-4">
        {buyers.map((buyer) => (
          <BuyerCard
            key={buyer}
            reaction={reactions.find((r) => r.buyer === buyer)}
            isLoading={isLoading && !reactions.find((r) => r.buyer === buyer)}
          />
        ))}
      </div>
    </div>
  );
}
