import OpenAI from 'openai';
import { DatasetMetadata, Dashboard } from '../types';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const generateVisualizationCommands = async (metadata: DatasetMetadata): Promise<Dashboard> => {
  const prompt = `You are a data visualization expert. Based on this dataset metadata, suggest appropriate visualizations that would best represent the data.

Dataset Information:
- Filename: ${metadata.filename}
- Number of rows: ${metadata.rowCount}
- Columns:
${metadata.columns.map(col => `  - ${col.name} (${col.type}): ${col.sample.slice(0, 3).join(', ')}...`).join('\n')}

Please provide a JSON response with the following structure:
{
  "dashboardTitle": "string",
  "visualizations": [
    {
      "id": "string",
      "type": "histogram" | "scatterPlot" | "barChart" | "lineChart",
      "dataCommand": {
        "sourceColumn"?: "string",
        "xColumn"?: "string",
        "yColumn"?: "string",
        "bins"?: number
      },
      "title": "string",
      "description": "string"
    }
  ]
}

Focus on creating meaningful visualizations that highlight interesting patterns in the data.`;

  try {
    console.log('Sending request to OpenAI with metadata:', metadata);
    
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a data visualization expert. Always respond with valid JSON." },
        { role: "user", content: prompt }
      ],
      model: "gpt-4",
      temperature: 0.7,
      max_tokens: 1000
    });

    console.log('Received response from OpenAI:', completion);

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    try {
      const parsedResponse = JSON.parse(response);
      console.log('Parsed response:', parsedResponse);
      return parsedResponse as Dashboard;
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.error('Raw response:', response);
      throw new Error('Failed to parse OpenAI response as JSON');
    }
  } catch (error) {
    console.error('Error generating visualization commands:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
}; 