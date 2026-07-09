import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  XCircle, 
  User, 
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import type { MatchSuggestion } from '@/lib/family-matcher-api';
import { getParentPrefix } from '@/lib/text-helpers';

interface Props {
  suggestion: MatchSuggestion;
  onApprove: () => void;
  onReject: () => void;
  isApproving: boolean;
  isRejecting: boolean;
  readOnly?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 0.9) return 'text-green-600 bg-green-50 border-green-200';
  if (score >= 0.7) return 'text-blue-600 bg-blue-50 border-blue-200';
  return 'text-yellow-600 bg-yellow-50 border-yellow-200';
}

function getScoreLabel(score: number): string {
  if (score >= 0.9) return 'High Confidence';
  if (score >= 0.7) return 'Medium Confidence';
  return 'Low Confidence';
}

function formatLabel(label: string): string {
  return label
    .split('_')[0]
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('-');
}

export function SuggestionCard({ 
  suggestion, 
  onApprove, 
  onReject, 
  isApproving, 
  isRejecting,
  readOnly = false
}: Props) {
  const [showDetails, setShowDetails] = useState(false);
  
  const scoreColor = getScoreColor(suggestion.match_score);
  const scoreLabel = getScoreLabel(suggestion.match_score);
  const scorePercent = Math.round(suggestion.match_score * 100);
  
  const initialsA = `${suggestion.member_a_first_name?.[0] || ''}${suggestion.member_a_surname?.[0] || ''}`;
  const initialsB = `${suggestion.member_b_first_name?.[0] || ''}${suggestion.member_b_surname?.[0] || ''}`;
  
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header with score badge */}
      <div className="p-4 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[#A32328]" />
          <span className="text-xs font-medium text-gray-600">AI Suggestion</span>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${scoreColor}`}>
          {scorePercent}% • {scoreLabel}
        </div>
      </div>
      
      {/* Main content - Two members */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          {/* Member A */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#A3232815] text-[#A32328] flex items-center justify-center font-bold text-lg mb-2">
                {suggestion.member_a_photo ? (
                  <img 
                    src={suggestion.member_a_photo} 
                    alt={suggestion.member_a_first_name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  initialsA || <User size={20} />
                )}
              </div>
              <p className="font-semibold text-gray-900 text-sm">
                {suggestion.member_a_first_name} {suggestion.member_a_surname}
              </p>
              {suggestion.member_a_father_name && (
                <p className="text-xs text-gray-500">
                  {getParentPrefix(suggestion.member_a_gender)} {suggestion.member_a_father_name}
                </p>
              )}
              <p className="text-xs text-gray-400">
                {suggestion.member_a_gender}
              </p>
            </div>
          </div>
          
          {/* Relationship Arrow */}
          <div className="flex flex-col items-center px-2">
            <ArrowRight className="text-[#A32328]" size={20} />
            <div className="mt-1 px-2 py-1 rounded-full bg-[#A3232815] text-[#A32328] text-xs font-semibold capitalize">
              {formatLabel(suggestion.suggested_label)}
            </div>
          </div>
          
          {/* Member B */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg mb-2">
                {suggestion.member_b_photo ? (
                  <img 
                    src={suggestion.member_b_photo} 
                    alt={suggestion.member_b_first_name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  initialsB || <User size={20} />
                )}
              </div>
              <p className="font-semibold text-gray-900 text-sm">
                {suggestion.member_b_first_name} {suggestion.member_b_surname}
              </p>
              {suggestion.member_b_father_name && (
                <p className="text-xs text-gray-500">
                  {getParentPrefix(suggestion.member_b_gender)} {suggestion.member_b_father_name}
                </p>
              )}
              <p className="text-xs text-gray-400">
                {suggestion.member_b_gender}
              </p>
            </div>
          </div>
        </div>
        
        {/* Explanation */}
        <div className="mt-3 text-xs text-gray-600 text-center italic">
          "{suggestion.member_b_first_name} might be {suggestion.member_a_first_name}'s{' '}
          <span className="font-semibold capitalize">{formatLabel(suggestion.suggested_label)}</span>"
        </div>
      </div>
      
      {/* Reason toggle */}
      <div className="px-4 pb-2">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 mx-auto"
        >
          <Info size={12} />
          {showDetails ? 'Hide' : 'Why this suggestion?'}
          {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>
      
      {/* Reason detail */}
      {showDetails && (
        <div className="px-4 pb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-700 leading-relaxed">
              {suggestion.match_reason}
            </p>
          </div>
        </div>
      )}
      
      {/* Actions */}
      {!readOnly && (
        <div className="p-4 pt-2 flex gap-2 border-t border-gray-50">
          <Button
            onClick={onReject}
            disabled={isApproving || isRejecting}
            variant="outline"
            className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            size="sm"
          >
            <XCircle size={14} className="mr-1" />
            Reject
          </Button>
          <Button
            onClick={onApprove}
            disabled={isApproving || isRejecting}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            <CheckCircle2 size={14} className="mr-1" />
            {isApproving ? 'Approving...' : 'Approve'}
          </Button>
        </div>
      )}
      
      {/* Read-only status */}
      {readOnly && (
        <div className={`p-3 text-xs text-center border-t ${
          suggestion.status === 'confirmed' 
            ? 'bg-green-50 text-green-700 border-green-100' 
            : 'bg-red-50 text-red-700 border-red-100'
        }`}>
          {suggestion.status === 'confirmed' ? '✓ Approved' : '✗ Rejected'}
        </div>
      )}
    </div>
  );
}
