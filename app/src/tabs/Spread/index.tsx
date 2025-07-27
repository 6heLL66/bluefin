import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material'

import { Table } from '../../components/Table'
import { headCells, SpreadData } from './constants'
import { useSpreadStore } from './store'
import { CreateSpreadUnitModal } from '../../components/CreateSpreadUnitModal'
import { useState } from 'react'
import { useSpreads } from './useSpreads'

export const Spread = () => {
  const {
    lighterPublicKey,
    lighterPrivateKey,
    backpackApiPublicKey,
    backpackApiSecretKey,
    spreads,
    setLighterPublicKey,
    setLighterPrivateKey,
    setBackpackApiPublicKey,
    setBackpackApiSecretKey,
    createSpread,
    deleteSpread,
  } = useSpreadStore()

  const { addSpreadSubscription } = useSpreads();

  const [open, setOpen] = useState(false)

  const getStatusChip = (status: SpreadData['status']) => {
    const color = status === 'OPEN' ? 'success' : status === 'CLOSED' ? 'error' : 'warning'
    return <Chip label={status} color={color} size="small" />
  }

  const handleOpenCreateSpread = () => {
    setOpen(true)
  }

  const handleCreateSpread = (form: Omit<SpreadData, 'id' | 'timeOpened' | 'status'>) => {
    createSpread({
        ...form,
        status: 'PENDING',
        timeOpened: '0',
        id: Date.now().toString(),
    })
    addSpreadSubscription({
        ...form,
        status: 'PENDING',
        timeOpened: '0',
        id: Date.now().toString(),
    });
    setOpen(false)
  }

  const handleDeleteSpread = (id: string) => {
    deleteSpread(id)
  }

  const tableRows = spreads.map(spread => ({
    id: spread.id,
    data: [
      <Typography variant="body2" fontWeight={600}>
        {spread.asset}
      </Typography>,
      <Typography variant="body2">
        {spread.size}
      </Typography>,
      <Typography variant="body2" fontSize="0.875rem">
        {spread.timeOpened}
      </Typography>,
      getStatusChip(spread.status),
      <Typography variant="body2" color="success.main">
        {spread.openSpread}%
      </Typography>,
      <Typography variant="body2" color="error.main">
        {spread.closeSpread}%
      </Typography>,
      <Typography variant="body2">
        {spread.minLifetime}s
      </Typography>,
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
        <IconButton
          size="small"
          color="error"
          onClick={(e) => {
            e.stopPropagation()
            handleDeleteSpread(spread.id)
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>,
    ],
  }))

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Card
        sx={{
          background: theme => theme.palette.background.paper,
          border: theme => `1px solid ${theme.palette.divider}`,
        }}
      >
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={3}>
            API Configuration
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Lighter Public Key"
              variant="outlined"
              value={lighterPublicKey}
              onChange={(e) => setLighterPublicKey(e.target.value)}
              placeholder="Enter your Lighter public key"
            />
            <TextField
              fullWidth
              label="Lighter Private Key"
              variant="outlined"
              type="password"
              value={lighterPrivateKey}
              onChange={(e) => setLighterPrivateKey(e.target.value)}
              placeholder="Enter your Lighter private key"
            />
            <TextField
              fullWidth
              label="Backpack API Key"
              variant="outlined"
              type="text"
              value={backpackApiPublicKey}
              onChange={(e) => setBackpackApiPublicKey(e.target.value)}
              placeholder="Enter your Backpack API key"
            />
            <TextField
              fullWidth
              label="Backpack API Secret Key"
              variant="outlined"
              type="password"
              value={backpackApiSecretKey}
              onChange={(e) => setBackpackApiSecretKey(e.target.value)}
              placeholder="Enter your Backpack API secret key"
            />
          </Box>
        </CardContent>
      </Card>

      <Paper
        sx={{
          background: theme => theme.palette.background.paper,
          border: theme => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ p: 3, borderBottom: theme => `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              Spread Management
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateSpread}
              sx={{
                background: theme => theme.palette.primary.main,
                '&:hover': {
                  background: theme => theme.palette.primary.dark,
                },
              }}
            >
              Create Spread
            </Button>
          </Box>
        </Box>
        <Table
          headCells={headCells}
          rows={tableRows}
          withCheckbox={false}
          pagination={true}
          toolbar={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Total Spreads: {spreads.length}
              </Typography>
            </Box>
          }
        />
      </Paper>

      <CreateSpreadUnitModal open={open} handleClose={() => setOpen(false)} handleCreateSpread={handleCreateSpread} />
    </Box>
  )
}