export interface ColumnMetadata {
  name: string;
  type: 'string' | 'number' | 'date';
  sample: any[];
  min?: number;
  max?: number;
  uniqueValues?: number;
}

export interface DatasetMetadata {
  filename: string;
  rowCount: number;
  columns: Array<{
    name: string;
    type: string;
    sample: string[];
  }>;
}

export interface DataCommand {
  sourceColumn?: string;
  xColumn?: string;
  yColumn?: string;
  bins?: number;
}

export interface Visualization {
  id: string;
  type: 'histogram' | 'scatterPlot' | 'barChart' | 'lineChart';
  dataCommand: {
    sourceColumn?: string;
    xColumn?: string;
    yColumn?: string;
    bins?: number;
  };
  title: string;
  description: string;
}

export interface Dashboard {
  dashboardTitle: string;
  visualizations: Visualization[];
} 