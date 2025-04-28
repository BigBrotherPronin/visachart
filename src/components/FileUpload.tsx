import React, { useCallback } from 'react';
import { Box, Button, Typography } from '@mui/material';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { DatasetMetadata, ColumnMetadata } from '../types';

interface FileUploadProps {
  onMetadataExtracted: (metadata: DatasetMetadata, data: any[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onMetadataExtracted }) => {
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    let data: any[] = [];

    try {
      if (fileExtension === 'csv') {
        const result = await new Promise<any[]>((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
              if (results.errors.length > 0) {
                reject(results.errors[0]);
              } else {
                resolve(results.data);
              }
            },
            error: (error) => reject(error),
          });
        });
        data = result;
      } else if (['xlsx', 'xls'].includes(fileExtension || '')) {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        data = XLSX.utils.sheet_to_json(firstSheet);
      }

      if (data.length === 0) {
        throw new Error('No data found in file');
      }

      // Extract metadata
      const columns: ColumnMetadata[] = Object.keys(data[0]).map(key => {
        const values = data.slice(0, 30).map(row => row[key]);
        const numericValues = values.filter(v => !isNaN(Number(v))).map(Number);
        
        return {
          name: key,
          type: numericValues.length > 0 ? 'number' : 'string',
          sample: values.slice(0, 5),
          min: numericValues.length > 0 ? Math.min(...numericValues) : undefined,
          max: numericValues.length > 0 ? Math.max(...numericValues) : undefined,
          uniqueValues: new Set(values).size
        };
      });

      const metadata: DatasetMetadata = {
        filename: file.name,
        rowCount: data.length,
        columns
      };

      onMetadataExtracted(metadata, data);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try again.');
    }
  }, [onMetadataExtracted]);

  return (
    <Box sx={{ p: 3, border: '2px dashed #ccc', borderRadius: 2, textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom>
        Upload your data file
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Supported formats: CSV, XLSX, XLS
      </Typography>
      <Button
        variant="contained"
        component="label"
        sx={{ mt: 2 }}
      >
        Choose File
        <input
          type="file"
          hidden
          accept=".csv,.xlsx,.xls"
          onChange={handleFileUpload}
        />
      </Button>
    </Box>
  );
};

export default FileUpload; 