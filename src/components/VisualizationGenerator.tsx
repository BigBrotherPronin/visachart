import React, { useState } from 'react';
import { generateVisualizations } from '../services/openai';
import { Visualization, DatasetMetadata } from '../types';

interface VisualizationGeneratorProps {
  metadata: DatasetMetadata;
  onVisualizationsGenerated: (visualizations: Visualization[]) => void;
}

export const VisualizationGenerator: React.FC<VisualizationGeneratorProps> = ({
  metadata,
  onVisualizationsGenerated,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await generateVisualizations(metadata);
      onVisualizationsGenerated(response.visualizations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate visualizations');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="visualization-generator">
      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="generate-button"
      >
        {isLoading ? 'Generating...' : 'Generate Visualizations'}
      </button>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
}; 