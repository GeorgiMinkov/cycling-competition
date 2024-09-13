import React, { useState, useEffect } from 'react';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Button,
  TextField,
  Grid,
  Typography,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { Delete, Refresh, Save, Assignment } from '@mui/icons-material';

const ParticipantTable = () => {
  const [participants, setParticipants] = useState(() => {
    // Initialize from localStorage and rehydrate dates
    const savedParticipants = localStorage.getItem('participants');
    if (savedParticipants) {
      return JSON.parse(savedParticipants).map((p) => ({
        ...p,
        startTime: p.startTime ? new Date(p.startTime) : null,
        stopTime: p.stopTime ? new Date(p.stopTime) : null,
      }));
    }
    return [];
  });

  const [numParticipants, setNumParticipants] = useState(0);
  const [tableCreated, setTableCreated] = useState(participants.length > 0);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [nextParticipantNumber, setNextParticipantNumber] = useState(() => {
    const savedNumber = localStorage.getItem('nextParticipantNumber');
    return savedNumber ? parseInt(savedNumber, 10) : 1;
  });

  const [startInput, setStartInput] = useState('');
  const [stopInput, setStopInput] = useState('');

  // Save participants and next participant number to localStorage on update
  useEffect(() => {
    localStorage.setItem('participants', JSON.stringify(participants));
    localStorage.setItem('nextParticipantNumber', nextParticipantNumber.toString());
  }, [participants, nextParticipantNumber]);

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setShowSnackbar(false);
  };

  // Function to handle the number of participants input
  const handleParticipantChange = (e) => {
    const inputValue = parseInt(e.target.value);
    if (!isNaN(inputValue) && inputValue > 0) {
      setNumParticipants(inputValue);
    } else {
      setNumParticipants(0);
    }
  };

  // Function to create the table after clicking "Create"
  const handleCreateTable = () => {
    if (numParticipants <= 0) {
      alert('Моля въведете валиден брой участници.');
      return;
    }

    const newParticipants = Array.from({ length: numParticipants }, (_, index) => ({
      id: nextParticipantNumber + index,
      name: '',
      startTime: null,
      stopTime: null,
      elapsedTime: null,
      timerRunning: false,
      participantNumber: nextParticipantNumber + index,
    }));

    setNextParticipantNumber(nextParticipantNumber + numParticipants);
    setParticipants([...participants, ...newParticipants]);
    setTableCreated(true);
    setShowSnackbar(true);
  };

  // Function to update the name for a specific participant
  const handleNameChange = (id, name) => {
    const updatedParticipants = participants.map((participant) =>
      participant.id === id ? { ...participant, name } : participant
    );
    setParticipants(updatedParticipants);
  };

  // Function to start the timer for a specific participant
  const handleStart = (participantNumber) => {
    const participant = participants.find((p) => p.participantNumber === parseInt(participantNumber));

    if (!participant) {
      alert(`Няма участник с номер ${participantNumber}`);
      return;
    }
    if (!participant.name) {
      alert('Моля въведете име на участника преди да започнете хронометъра.');
      return;
    }

    const startTime = new Date();
    const updatedParticipants = participants.map((p) =>
      p.participantNumber === parseInt(participantNumber)
        ? { ...p, startTime, timerRunning: true }
        : p
    );
    setParticipants(updatedParticipants);
  };

  // Function to stop the timer for a specific participant
  const handleStop = (participantNumber) => {
    const participant = participants.find((p) => p.participantNumber === parseInt(participantNumber));

    if (!participant) {
      alert(`Няма участник с номер ${participantNumber}`);
      return;
    }

    const stopTime = new Date();
    const updatedParticipants = participants.map((p) =>
      p.participantNumber === parseInt(participantNumber)
        ? {
            ...p,
            stopTime,
            elapsedTime: (stopTime - p.startTime) / 1000,
            timerRunning: false,
          }
        : p
    );
    setParticipants(updatedParticipants);
  };

  // Handle pressing "Enter" for starting
  const handleStartInputEnter = (event) => {
    if (event.key === 'Enter') {
      handleStart(startInput);
      setStartInput('');
    }
  };

  // Handle pressing "Enter" for stopping
  const handleStopInputEnter = (event) => {
    if (event.key === 'Enter') {
      handleStop(stopInput);
      setStopInput('');
    }
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (id) => {
    setDeleteIndex(id);
    setDialogOpen(true);
  };

  // Handle participant deletion
  const handleDeleteRow = () => {
    const updatedParticipants = participants.filter((participant) => participant.id !== deleteIndex);
    setParticipants(updatedParticipants);
    setDialogOpen(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Хронометър на участниците
      </Typography>

      {/* Two rows for Start and Stop inputs */}
      <Grid container spacing={2} style={{ marginBottom: '20px' }}>
        {/* Start row */}
        <Grid item xs={2}>
          <Typography variant="h6">Старт:</Typography>
        </Grid>
        <Grid item xs={10}>
          <TextField
            label="Въведете номер на участник"
            value={startInput}
            onChange={(e) => setStartInput(e.target.value)}
            onKeyPress={handleStartInputEnter}
            variant="outlined"
            fullWidth
          />
        </Grid>

        {/* Stop row */}
        <Grid item xs={2}>
          <Typography variant="h6">Спри:</Typography>
        </Grid>
        <Grid item xs={10}>
          <TextField
            label="Въведете номер на участник"
            value={stopInput}
            onChange={(e) => setStopInput(e.target.value)}
            onKeyPress={handleStopInputEnter}
            variant="outlined"
            fullWidth
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <TextField
            type="number"
            label="Брой участници"
            value={numParticipants}
            onChange={handleParticipantChange}
            variant="outlined"
            helperText={numParticipants <= 0 ? 'Моля въведете валидно число' : ''}
            error={numParticipants <= 0}
          />
        </Grid>
        <Grid item>
          <Button variant="contained" color="primary" onClick={handleCreateTable}>
            Създаване на таблица
          </Button>
        </Grid>
      </Grid>

      {tableCreated && (
        <>
          <TableContainer component={Paper} style={{ marginTop: '20px' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Номер на участник</TableCell>
                  <TableCell>Име</TableCell>
                  <TableCell>Начално време</TableCell>
                  <TableCell>Изминало време</TableCell>
                  <TableCell>Сертификат</TableCell>
                  <TableCell>Изтриване</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {participants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell>{participant.participantNumber}</TableCell>
                    <TableCell>
                      <TextField
                        value={participant.name}
                        onChange={(e) => handleNameChange(participant.id, e.target.value)}
                        placeholder="Въведете име"
                        variant="outlined"
                        size="small"
                        error={!participant.name}
                        helperText={!participant.name ? 'Името е задължително' : ''}
                      />
                    </TableCell>
                    <TableCell>
                      {participant.startTime
                        ? participant.startTime.toLocaleTimeString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {participant.elapsedTime
                        ? `${participant.elapsedTime} секунди`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {participant.stopTime ? (
                        <Button
                          variant="contained"
                          color="info"
                          startIcon={<Assignment />}
                          onClick={() => alert(`Сертификат за ${participant.name}`)}
                        >
                          Сертификат
                        </Button>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleOpenDeleteDialog(participant.id)}
                      >
                        Изтрий
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Потвърдете изтриването</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Сигурни ли сте, че искате да изтриете този участник?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">
            Отказ
          </Button>
          <Button onClick={handleDeleteRow} color="secondary">
            Изтрий
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ParticipantTable;
