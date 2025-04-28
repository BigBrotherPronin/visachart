import OpenAI from 'openai';
import { Visualization } from '../types';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const generateVisualizations = async (metadata: {
  filename: string;
  rowCount: number;
  columns: Array<{
    name: string;
    type: string;
    sample: string[];
  }>;
}): Promise<{
  dashboardTitle: string;
  visualizations: Visualization[];
}> => {
  const prompt = `You are a data visualization expert. Based on this dataset metadata, suggest appropriate visualizations that would best represent the data.

Dataset Information:
- Filename: ${metadata.filename}
- Number of rows: ${metadata.rowCount}
- Columns:
${metadata.columns.map(col => `  - ${col.name} (${col.type}): ${col.sample.slice(0, 3).join(', ')}...`).join('\n')}

For EACH visualization, carefully select:
1. The appropriate chart type for the data
2. Exactly which columns should be used for x-axis, y-axis, or as the source for a histogram
3. A meaningful title and description

For NUMERIC columns, use them appropriately in:
- Histograms (for distribution analysis)
- Scatter plots (to see relationships between two numeric columns)
- Line charts (for trend analysis, especially with time-based data)

Please provide a JSON response with the following structure:
{
  "dashboardTitle": "A descriptive title for the dashboard",
  "visualizations": [
    {
      "id": "unique-id",
      "type": "histogram",
      "dataCommand": {
        "sourceColumn": "Name of the column to analyze",
        "bins": 10
      },
      "title": "Distribution of [Column]",
      "description": "Shows the frequency distribution of [Column]"
    },
    {
      "id": "unique-id",
      "type": "scatterPlot",
      "dataCommand": {
        "xColumn": "Name of column for x-axis",
        "yColumn": "Name of column for y-axis"
      },
      "title": "[Y Column] vs [X Column]",
      "description": "Examines the relationship between [X Column] and [Y Column]"
    }
  ]
}

Only include visualizations that would be meaningful with the available data.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a data visualization expert. Your task is to analyze dataset metadata and suggest appropriate visualizations."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 1000
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Error parsing OpenAI response:', error);
    throw new Error('Invalid response format from OpenAI');
  }
}; 