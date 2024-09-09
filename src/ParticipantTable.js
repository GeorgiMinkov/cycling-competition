import React, { useState } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
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
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { Add, Delete, PlayArrow, Stop, Refresh, Save, Assignment } from '@mui/icons-material';

const ParticipantTable = () => {
  const [participants, setParticipants] = useState([]);
  const [numParticipants, setNumParticipants] = useState(0);
  const [tableCreated, setTableCreated] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [nextParticipantNumber, setNextParticipantNumber] = useState(1); // Initialize to 1

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

    // Correctly increment nextParticipantNumber inside the loop
    const newParticipants = Array.from({ length: numParticipants }, (_, index) => {
      const participant = {
        id: uuidv4(),
        name: '',
        startTime: null,
        stopTime: null,
        elapsedTime: null,
        timerRunning: false,
        participantNumber: nextParticipantNumber + index, // Correct sequential assignment
      };
      return participant;
    });

    setNextParticipantNumber(nextParticipantNumber + numParticipants); // Increment the next available number
    setParticipants(newParticipants);
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
  const handleStart = (id) => {
    const participant = participants.find((p) => p.id === id);
    if (!participant.name) {
      alert('Моля въведете име на участника преди да започнете хронометъра.');
      return;
    }

    const startTime = new Date();
    const updatedParticipants = participants.map((participant) =>
      participant.id === id
        ? { ...participant, startTime, timerRunning: true }
        : participant
    );
    setParticipants(updatedParticipants);

    axios
      .post('/api/start', { participantId: id, startTime })
      .then((response) => console.log('Start time saved:', response))
      .catch((error) => console.error('Error saving start time:', error));
  };

  // Function to stop the timer for a specific participant
  const handleStop = (id) => {
    const stopTime = new Date();
    const updatedParticipants = participants.map((participant) =>
      participant.id === id
        ? {
            ...participant,
            stopTime,
            elapsedTime: (stopTime - participant.startTime) / 1000,
            timerRunning: false,
          }
        : participant
    );
    setParticipants(updatedParticipants);

    axios
      .post('/api/stop', { participantId: id, stopTime })
      .then((response) => console.log('Stop time saved:', response))
      .catch((error) => console.error('Error saving stop time:', error));
  };

  // Function to reset the timer and clear fields for a specific participant
  const handleReset = (id) => {
    const updatedParticipants = participants.map((participant) =>
      participant.id === id
        ? { ...participant, startTime: null, stopTime: null, elapsedTime: null, timerRunning: false }
        : participant
    );
    setParticipants(updatedParticipants);
  };

  // Function to add a new row
  const handleAddRow = () => {
    const newParticipant = {
      id: uuidv4(),
      name: '',
      startTime: null,
      stopTime: null,
      elapsedTime: null,
      timerRunning: false,
      participantNumber: nextParticipantNumber,
    };

    setNextParticipantNumber(nextParticipantNumber + 1); // Increment participant number for next addition
    setParticipants([...participants, newParticipant]);
  };

  // Function to handle open of dialog to confirm deletion
  const handleOpenDeleteDialog = (id) => {
    setDeleteIndex(id);
    setDialogOpen(true);
  };

  // Function to delete a row
  const handleDeleteRow = () => {
    const updatedParticipants = participants.filter((participant) => participant.id !== deleteIndex);
    setParticipants(updatedParticipants);
    setDialogOpen(false);
  };

  // Function to save all participants data
  const handleSaveAll = () => {
    if (participants.length === 0) {
      alert('Няма участници за запазване.');
      return;
    }

    axios
      .post('/api/save-all', { participants })
      .then((response) => {
        console.log('All participants saved:', response);
        setShowSnackbar(true);
      })
      .catch((error) => console.error('Error saving participants:', error));
  };

  // Function to generate a certificate for a participant
  const handleGenerateCertificate = (participant) => {
    console.log(`Generating certificate for ${participant.name} with stop time ${participant.stopTime}`);
    alert(`Сертификатът за ${participant.name} е генериран успешно!`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Хронометър на участниците
      </Typography>

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
                  <TableCell>Хронометър</TableCell>
                  <TableCell>Действия</TableCell>
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
                      {participant.timerRunning ? 'Работи...' : 'Спряно'}
                    </TableCell>
                    <TableCell>
                      {!participant.timerRunning ? (
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<PlayArrow />}
                          onClick={() => handleStart(participant.id)}
                        >
                          Старт
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="contained"
                            color="error"
                            startIcon={<Stop />}
                            onClick={() => handleStop(participant.id)}
                            style={{ marginRight: '10px' }}
                          >
                            Спри
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<Refresh />}
                            onClick={() => handleReset(participant.id)}
                          >
                            Нулиране
                          </Button>
                        </>
                      )}
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
                          onClick={() => handleGenerateCertificate(participant)}
                        >
                          Сертификат
                        </Button>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="secondary"
                        onClick={() => handleOpenDeleteDialog(participant.id)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleAddRow}
            style={{ marginTop: '20px' }}
          >
            Добавяне на ред
          </Button>

          <Button
            variant="contained"
            color="success"
            startIcon={<Save />}
            onClick={handleSaveAll}
            style={{ marginLeft: '20px' }}
          >
            Запазване на всички участници
          </Button>

          <Snackbar
            open={showSnackbar}
            autoHideDuration={3000}
            onClose={handleSnackbarClose}
            message="Всички участници са успешно запазени!"
          />
          
          {/* Delete confirmation dialog */}
          <Dialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
          >
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
        </>
      )}
    </div>
  );
};

export default ParticipantTable;
