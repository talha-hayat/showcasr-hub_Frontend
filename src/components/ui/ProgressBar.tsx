import React from 'react';

interface ProgressBarProps {
  progress: number;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="w-full bg-gray-200 rounded-md h-2">
      <div
        className="h-2 bg-blue-600 rounded-md transition-all"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}