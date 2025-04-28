import React, { useMemo } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';
import { Visualization as VisualizationType } from '../types';

interface VisualizationProps {
  visualization: VisualizationType;
  data: any[];
}

const Visualization: React.FC<VisualizationProps> = ({ visualization, data }) => {
  const processedData = useMemo(() => {
    switch (visualization.type) {
      case 'histogram': {
        const sourceColumn = visualization.dataCommand.sourceColumn;
        if (!sourceColumn) return [];
        
        // For histogram, we need to count occurrences of each value
        const valueCounts = data.reduce((acc, row) => {
          const value = row[sourceColumn];
          acc[value] = (acc[value] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return Object.entries(valueCounts).map(([value, count]) => ({
          value: Number(value) || value,
          count
        }));
      }

      case 'scatterPlot': {
        const xColumn = visualization.dataCommand.xColumn;
        const yColumn = visualization.dataCommand.yColumn;
        if (!xColumn || !yColumn) return [];

        return data.map(row => ({
          x: Number(row[xColumn]) || row[xColumn],
          y: Number(row[yColumn]) || row[yColumn]
        }));
      }

      case 'lineChart': {
        const xColumn = visualization.dataCommand.xColumn;
        const yColumn = visualization.dataCommand.yColumn;
        if (!xColumn || !yColumn) return [];

        return data.map(row => ({
          x: Number(row[xColumn]) || row[xColumn],
          y: Number(row[yColumn]) || row[yColumn]
        }));
      }

      case 'barChart': {
        const xColumn = visualization.dataCommand.xColumn;
        const yColumn = visualization.dataCommand.yColumn;
        if (!xColumn || !yColumn) return [];

        return data.map(row => ({
          x: Number(row[xColumn]) || row[xColumn],
          y: Number(row[yColumn]) || row[yColumn]
        }));
      }

      default:
        return [];
    }
  }, [visualization, data]);

  const renderChart = () => {
    switch (visualization.type) {
      case 'histogram': {
        const sourceColumn = visualization.dataCommand.sourceColumn;
        if (!sourceColumn) return null;
        
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="value" />
              <YAxis dataKey="count" />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="count"
                fill="#8884d8"
              />
            </BarChart>
          </ResponsiveContainer>
        );
      }

      case 'scatterPlot': {
        const xColumn = visualization.dataCommand.xColumn;
        const yColumn = visualization.dataCommand.yColumn;
        if (!xColumn || !yColumn) return null;

        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" name={xColumn} />
              <YAxis dataKey="y" name={yColumn} />
              <Tooltip />
              <Legend />
              <Scatter
                data={processedData}
                fill="#8884d8"
              />
            </ScatterChart>
          </ResponsiveContainer>
        );
      }

      case 'lineChart': {
        const xColumn = visualization.dataCommand.xColumn;
        const yColumn = visualization.dataCommand.yColumn;
        if (!xColumn || !yColumn) return null;

        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" />
              <YAxis dataKey="y" />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="y"
                stroke="#8884d8"
              />
            </LineChart>
          </ResponsiveContainer>
        );
      }

      case 'barChart': {
        const xColumn = visualization.dataCommand.xColumn;
        const yColumn = visualization.dataCommand.yColumn;
        if (!xColumn || !yColumn) return null;

        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" />
              <YAxis dataKey="y" />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="y"
                fill="#8884d8"
              />
            </BarChart>
          </ResponsiveContainer>
        );
      }

      default:
        return null;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        {visualization.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {visualization.description}
      </Typography>
      <Box sx={{ mt: 2 }}>
        {renderChart()}
      </Box>
    </Paper>
  );
};

export default Visualization; 