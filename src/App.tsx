import React, { useState } from 'react';
import { Container, Typography, Box, Grid, CircularProgress, Alert } from '@mui/material';
import FileUpload from './components/FileUpload';
import Visualization from './components/Visualization';
import { DatasetMetadata, Dashboard } from './types';
import { generateVisualizationCommands } from './services/openai';

function App() {
  const [metadata, setMetadata] = useState<DatasetMetadata | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMetadataExtracted = async (metadata: DatasetMetadata, fileData: any[]) => {
    setMetadata(metadata);
    setData(fileData);
    setLoading(true);
    setError(null);

    try {
      const generatedDashboard = await generateVisualizationCommands(metadata);
      setDashboard(generatedDashboard);
    } catch (err) {
      setError('Failed to generate visualizations. Please try again.');
      console.error('Error generating visualizations:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Data Visualization Command Generator
        </Typography>
        
        {!metadata && (
          <FileUpload onMetadataExtracted={handleMetadataExtracted} />
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        )}

        {dashboard && !loading && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              {dashboard.dashboardTitle}
            </Typography>
            <Grid container spacing={3}>
              {dashboard.visualizations.map((visualization) => (
                <Grid key={visualization.id} sx={{ width: { xs: '100%', md: '50%' } }}>
                  <Visualization
                    visualization={visualization}
                    data={data}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default App;
