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
  Tooltip,
  CircularProgress,
} from '@mui/material'
import { Add as AddIcon, Delete as DeleteIcon, Close as CloseIcon } from '@mui/icons-material'

import { Table } from '../../components/Table'
import { headCells, SpreadData } from './constants'
import { useSpreadStore } from './store'
import { CreateSpreadUnitModal } from '../../components/CreateSpreadUnitModal'
import { useState } from 'react'
import { useSpreads } from './useSpreads'
import { AccountService } from '../../api'

export const Spread = () => {
  const {
    lighterMarkets,
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
    updateSpread,
  } = useSpreadStore()

  const { addBackpackSpreadSubscription, addLighterSpreadSubscription, closeAllPositionsMarket, testLighter, isLighterConnected, isBackpackConnected } = useSpreads();

  const [open, setOpen] = useState(false)

  const getStatusChip = (status: SpreadData['status']) => {
    if (status === 'WAITING') {
      return <Chip label={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CircularProgress size={16} color='info' /> waiting spread</div>} color="warning" size="small" />
    }

    return <Chip label={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CircularProgress size={16} color='info' /> order filling</div>} color="warning" size="small" />
  }

  const handleOpenCreateSpread = () => {
    setOpen(true)
  }

  const handleCreateSpread = (form: Omit<SpreadData, 'id' | 'timeOpened' | 'status'>) => {
    const data: SpreadData = {
        ...form,
        tokenId: lighterMarkets?.find(token => token.symbol === form.asset)?.market_id ?? 0,
        status: 'WAITING',
        timeOpened: '0',
        lighterPositions: [],
        backpackPositions: [],
        id: Date.now().toString(),
    }
    createSpread(data)
    addBackpackSpreadSubscription(data);
    addLighterSpreadSubscription(data);
    setOpen(false)
  }

  const handleDeleteSpread = (id: string) => {
    deleteSpread(id)
  }

  const handleCloseAll = (spread: SpreadData) => {
    closeAllPositionsMarket(spread)
  }

  const handleSpreadChange = (id: string, field: 'openSpread' | 'closeSpread', value: number) => {
    updateSpread(id, { [field]: value })
  }

  const renderLighterPositions = (positions: SpreadData['lighterPositions']) => {
    if (!positions || positions.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
          No positions
        </Typography>
      )
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {positions.map((position, index) => (
          <Box key={index} sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 0.25,
            p: 1,
            borderRadius: 1,
            bgcolor: 'background.default',
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" fontWeight={600}>
                {position.symbol}
              </Typography>
              <Chip 
                label={position.side} 
                size="small" 
                color={position.side === 'BUY' ? 'success' : 'error'}
                sx={{ fontSize: '0.6rem', height: 16 }}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">
                Size: {parseFloat(position.size).toFixed(4)}$
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Entry: ${parseFloat(position.entry_price).toFixed(2)}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Leverage: {position.leverage}x
            </Typography>
          </Box>
        ))}
      </Box>
    )
  }

  const renderBackpackPositions = (positions: SpreadData['backpackPositions']) => {
    if (!positions || positions.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
          No positions
        </Typography>
      )
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {positions.map((position, index) => {
          const isLong = parseFloat(position.netQuantity) > 0
          const pnlColor = parseFloat(position.pnlRealized) >= 0 ? 'success.main' : 'error.main'
          
          return (
            <Box key={index} sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 0.25,
              p: 1,
              borderRadius: 1,
              bgcolor: 'background.default',
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" fontWeight={600}>
                  {position.symbol}
                </Typography>
                <Chip 
                  label={isLong ? 'LONG' : 'SHORT'} 
                  size="small" 
                  color={isLong ? 'success' : 'error'}
                  sx={{ fontSize: '0.6rem', height: 16 }}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  Size: {Math.abs(parseFloat(position.netCost)).toFixed(2)}$
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Entry: ${parseFloat(position.entryPrice).toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  Mark: ${parseFloat(position.markPrice).toFixed(2)}
                </Typography>
                <Typography variant="caption" color={pnlColor} fontWeight={600}>
                  PnL: ${parseFloat(position.pnlRealized).toFixed(2)}
                </Typography>
              </Box>
            </Box>
          )
        })}
      </Box>
    )
  }

  const tableRows = spreads.map(spread => ({
    id: spread.id,
    data: [
      <Typography variant="body2" fontWeight={600}>
        {spread.asset}
      </Typography>,
      <Typography variant="body2">
        {spread.size}$
      </Typography>,
      renderLighterPositions(spread.lighterPositions),
      renderBackpackPositions(spread.backpackPositions),
      getStatusChip(spread.status),
      <TextField
        size="small"
        type="number"
        value={spread.openSpread}
        onChange={(e) => handleSpreadChange(spread.id, 'openSpread', parseFloat(e.target.value) || 0)}
        sx={{ 
          width: 80,
          '& .MuiInputBase-input': { 
            textAlign: 'center',
            fontSize: '0.875rem',
            padding: '4px 8px'
          }
        }}
        InputProps={{
          endAdornment: <Typography variant="caption" color="text.secondary">%</Typography>
        }}
      />,
      <TextField
        size="small"
        type="number"
        value={spread.closeSpread}
        onChange={(e) => handleSpreadChange(spread.id, 'closeSpread', parseFloat(e.target.value) || 0)}
        sx={{ 
          width: 80,
          '& .MuiInputBase-input': { 
            textAlign: 'center',
            fontSize: '0.875rem',
            padding: '4px 8px'
          }
        }}
        InputProps={{
          endAdornment: <Typography variant="caption" color="text.secondary">%</Typography>
        }}
      />,
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
        <Tooltip title="Close All (Market)">
          <IconButton
            size="small"
            color="warning"
            onClick={(e) => {
              e.stopPropagation()
              handleCloseAll(spread)
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete Spread">
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
        </Tooltip>
      </Box>,
    ],
  }))

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Button variant='contained' onClick={testLighter}>test</Button>
      <Button onClick={() => AccountService.accountsRefreshApiAccountsRefreshPost({ requestBody: { accounts: [{ account: { private_key: lighterPrivateKey } }], from_api_key_index: 52, to_api_key_index: 72}})}>Auth lighter</Button>
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" fontWeight={600} color="text.secondary">
              Connection Status:
            </Typography>
            <Chip 
              label={`Lighter: ${isLighterConnected ? 'Connected' : 'Disconnected'}`}
              color={isLighterConnected ? 'success' : 'error'}
              size="small"
              sx={{ fontWeight: 600 }}
            />
            <Chip 
              label={`Backpack: ${isBackpackConnected ? 'Connected' : 'Disconnected'}`}
              color={isBackpackConnected ? 'success' : 'error'}
              size="small"
              sx={{ fontWeight: 600 }}
            />
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