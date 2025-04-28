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
  columns: ColumnMetadata[];
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
  dataCommand: DataCommand;
  title: string;
  description: string;
}

export interface Dashboard {
  dashboardTitle: string;
  visualizations: Visualization[];
} 