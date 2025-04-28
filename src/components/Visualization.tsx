import React, { useMemo, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  LineChart,
  Line,
} from 'recharts';
import { Card, CardContent, Typography } from '@mui/material';
import { Visualization as VisualizationType } from '../types';

interface VisualizationProps {
  visualization: VisualizationType;
  data: any[];
}

const Visualization: React.FC<VisualizationProps> = ({ visualization, data }) => {
  // Debug logging for input data
  useEffect(() => {
    console.log('Input data:', data);
    console.log('Visualization type:', visualization.type);
    console.log('Data command:', visualization.dataCommand);
  }, [data, visualization]);

  const processedData = useMemo(() => {
    if (!data || data.length === 0) {
      console.log('No data available for processing');
      return [];
    }

    // Skip the header row (first row)
    const dataRows = data.slice(1).filter(row => {
      // Filter out rows where all values are null
      return Object.values(row).some(val => val !== null);
    });

    if (dataRows.length === 0) {
      console.log('No valid data rows after filtering');
      return [];
    }

    // Map column names to their numeric keys
    const headerRow = data[0];
    const columnMap = Object.entries(headerRow).reduce((acc, [key, value]) => {
      if (typeof value === 'string') {
        acc[value] = key;
      }
      return acc;
    }, {} as Record<string, string>);

    console.log('Column mapping:', columnMap);

    switch (visualization.type) {
      case 'histogram': {
        const sourceColumn = visualization.dataCommand.sourceColumn;
        if (!sourceColumn) {
          console.log('No source column specified for histogram');
          return [];
        }

        const columnKey = columnMap[sourceColumn];
        if (!columnKey) {
          console.log(`Column ${sourceColumn} not found in data`);
          return [];
        }
        
        // Extract numeric values
        const values = dataRows
          .map(row => {
            const value = Number(row[columnKey]);
            console.log(`Processing row: ${sourceColumn}=${row[columnKey]}, numeric value=${value}`);
            return value;
          })
          .filter(val => !isNaN(val));
        
        if (values.length === 0) {
          console.log('No valid numeric values found for histogram');
          return [];
        }
        
        // Calculate bin range
        const min = Math.min(...values);
        const max = Math.max(...values);
        const bins = visualization.dataCommand.bins || 10;
        const binWidth = (max - min) / bins;
        
        // Create bins
        const binsArray = Array(bins).fill(0).map((_, index) => {
          const binStart = min + index * binWidth;
          const binEnd = min + (index + 1) * binWidth;
          return {
            binName: `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`,
            start: binStart,
            end: binEnd,
            count: 0
          };
        });
        
        // Count values in each bin
        values.forEach(value => {
          const binIndex = Math.min(
            Math.floor((value - min) / binWidth),
            bins - 1
          );
          binsArray[binIndex].count++;
        });
        
        return binsArray;
      }

      case 'barChart': {
        const xColumn = visualization.dataCommand.xColumn;
        const yColumn = visualization.dataCommand.yColumn;
        if (!xColumn || !yColumn) {
          console.log('Missing x or y column for bar chart');
          return [];
        }

        const xColumnKey = columnMap[xColumn];
        const yColumnKey = columnMap[yColumn];
        if (!xColumnKey || !yColumnKey) {
          console.log(`Columns ${xColumn} or ${yColumn} not found in data`);
          return [];
        }
        
        // For categorical data, aggregate values
        if (typeof dataRows[0][xColumnKey] === 'string') {
          const aggregated = dataRows.reduce((acc, row) => {
            const key = row[xColumnKey];
            if (!acc[key]) acc[key] = { name: key, value: 0 };
            acc[key].value += Number(row[yColumnKey]) || 0;
            return acc;
          }, {});
          
          return Object.values(aggregated);
        }
        
        // For numerical data, just map directly
        return dataRows.map(row => {
          const value = {
            name: String(row[xColumnKey]),
            value: Number(row[yColumnKey]) || 0
          };
          console.log(`Processing bar chart row: ${JSON.stringify(value)}`);
          return value;
        });
      }

      case 'scatterPlot': {
        const xColumn = visualization.dataCommand.xColumn;
        const yColumn = visualization.dataCommand.yColumn;
        if (!xColumn || !yColumn) {
          console.log('Missing x or y column for scatter plot');
          return [];
        }

        const xColumnKey = columnMap[xColumn];
        const yColumnKey = columnMap[yColumn];
        if (!xColumnKey || !yColumnKey) {
          console.log(`Columns ${xColumn} or ${yColumn} not found in data`);
          return [];
        }
        
        return dataRows.map(row => {
          const value = {
            x: Number(row[xColumnKey]) || 0,
            y: Number(row[yColumnKey]) || 0,
            name: String(row[xColumnKey])
          };
          console.log(`Processing scatter plot row: ${JSON.stringify(value)}`);
          return value;
        }).filter(item => !isNaN(item.x) && !isNaN(item.y));
      }

      case 'lineChart': {
        const xColumn = visualization.dataCommand.xColumn;
        const yColumn = visualization.dataCommand.yColumn;
        if (!xColumn || !yColumn) {
          console.log('Missing x or y column for line chart');
          return [];
        }

        const xColumnKey = columnMap[xColumn];
        const yColumnKey = columnMap[yColumn];
        if (!xColumnKey || !yColumnKey) {
          console.log(`Columns ${xColumn} or ${yColumn} not found in data`);
          return [];
        }
        
        // Sort data by x value for proper line rendering
        return dataRows
          .map(row => {
            const value = {
              name: String(row[xColumnKey]),
              value: Number(row[yColumnKey]) || 0
            };
            console.log(`Processing line chart row: ${JSON.stringify(value)}`);
            return value;
          })
          .sort((a, b) => {
            // Sort numerically if possible
            const aNum = Number(a.name);
            const bNum = Number(b.name);
            if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
            // Otherwise sort alphabetically
            return String(a.name).localeCompare(String(b.name));
          });
      }

      default:
        console.log('Unknown visualization type:', visualization.type);
        return [];
    }
  }, [visualization, data]);

  // Debug logging for processed data
  useEffect(() => {
    console.log('Processed data:', processedData);
  }, [processedData]);

  const renderChart = () => {
    switch (visualization.type) {
      case 'histogram': {
        const sourceColumn = visualization.dataCommand.sourceColumn;
        if (!sourceColumn) return null;
        
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="binName" 
                label={{ value: sourceColumn, position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip formatter={(value, name) => [`Count: ${value}`, '']} />
              <Legend />
              <Bar
                dataKey="count"
                fill="#8884d8"
                name={`${sourceColumn} Distribution`}
              />
            </BarChart>
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
              <XAxis 
                dataKey="name" 
                label={{ value: xColumn, position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                label={{ value: yColumn, angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="value"
                fill="#8884d8"
                name={yColumn}
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
              <XAxis 
                dataKey="x" 
                name={xColumn}
                label={{ value: xColumn, position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                dataKey="y" 
                name={yColumn}
                label={{ value: yColumn, angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter
                data={processedData}
                fill="#8884d8"
                name={`${xColumn} vs ${yColumn}`}
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
              <XAxis 
                dataKey="name"
                label={{ value: xColumn, position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                label={{ value: yColumn, angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                name={yColumn}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      }

      default:
        return null;
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom>
          {visualization.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {visualization.description}
        </Typography>
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default Visualization; 