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
  Collapse,
} from '@mui/material'
import { Add as AddIcon, Delete as DeleteIcon, Close as CloseIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material'

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

  const { connectBackpackWebsocket, connectLighterWebsocket, closeAllPositionsMarket, testLighter, authLighter, authorizingLighter, isLighterConnected, isBackpackConnected, balanceError, balances } = useSpreads();

  const [open, setOpen] = useState(false)
  const [isApiConfigCollapsed, setIsApiConfigCollapsed] = useState(true)

  const getStatusChip = (status: SpreadData['status']) => {
    if (status === 'WAITING') {
      return <Chip label={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CircularProgress size={16} color='info' /> waiting spread</div>} color="warning" size="small" />
    }

    return <Chip label={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CircularProgress size={16} color='info' /> order filling</div>} color="warning" size="small" />
  }

  const handleOpenCreateSpread = () => {
    setOpen(true)
  }

  const handleCreateSpread = async (form: Omit<SpreadData, 'id' | 'timeOpened' | 'status'>) => {
    const tokenId = lighterMarkets?.find(token => token.symbol === form.asset)?.market_id ?? 0
    const data: SpreadData = {
        ...form,
        tokenId,
        status: 'WAITING',
        timeOpened: '0',
        lighterPositions: [],
        backpackPositions: [],
        id: Date.now().toString(),
    }
    createSpread(data)

    await AccountService.accountLeverageApiAccountLeveragePost({ requestBody: { account: { private_key: lighterPrivateKey }, leverage: form.leverage, token_id: tokenId } })

    connectBackpackWebsocket();
    connectLighterWebsocket();
    setOpen(false)
  }

  const handleDeleteSpread = (id: string) => {
    deleteSpread(id)

    setTimeout(() => {
      connectBackpackWebsocket();
      connectLighterWebsocket();
    }, 300)
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
      <Card
        sx={{
          background: theme => theme.palette.background.paper,
          border: theme => `1px solid ${theme.palette.divider}`,
        }}
      >
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={3}>
            Connection & Testing
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <Button 
                variant='contained' 
                disabled={authorizingLighter} 
                onClick={authLighter}
                sx={{
                  minWidth: 140,
                  height: 48,
                  borderRadius: 2,
                  background: theme => theme.palette.primary.main,
                  boxShadow: theme => theme.shadows[2],
                  '&:hover': {
                    background: theme => theme.palette.primary.dark,
                    boxShadow: theme => theme.shadows[4],
                    transform: 'translateY(-1px)',
                  },
                  '&:active': {
                    transform: 'translateY(0px)',
                  },
                  '&:disabled': {
                    background: theme => theme.palette.action.disabledBackground,
                    boxShadow: 'none',
                    transform: 'none',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                {authorizingLighter ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} color='inherit' />
                    <Typography variant="body2">Authorizing...</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" fontWeight={600}>🔐 Auth Lighter</Typography>
                  </Box>
                )}
              </Button>
              <Typography variant="caption" color="text.secondary" textAlign="center">
                Authenticate with Lighter API
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <Button 
                variant='outlined' 
                disabled={authorizingLighter} 
                onClick={testLighter}
                sx={{
                  minWidth: 140,
                  height: 48,
                  borderRadius: 2,
                  borderWidth: 2,
                  boxShadow: theme => theme.shadows[1],
                  '&:hover': {
                    borderWidth: 2,
                    background: theme => theme.palette.action.hover,
                    boxShadow: theme => theme.shadows[3],
                    transform: 'translateY(-1px)',
                  },
                  '&:active': {
                    transform: 'translateY(0px)',
                  },
                  '&:disabled': {
                    borderColor: theme => theme.palette.action.disabled,
                    color: theme => theme.palette.action.disabled,
                    boxShadow: 'none',
                    transform: 'none',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" fontWeight={600}>🧪 Test Lighter</Typography>
                </Box>
              </Button>
              <Typography variant="caption" color="text.secondary" textAlign="center">
                Test Lighter connection
              </Typography>
            </Box>
          </Box>
          

        </CardContent>
      </Card>
      
      <Card
        sx={{
          background: theme => theme.palette.background.paper,
          border: theme => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box 
          sx={{ 
            p: 2,
            mb: 2,
            borderBottom: theme => `1px solid ${theme.palette.divider}`,
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              bgcolor: 'action.hover'
            }
          }}
          onClick={() => setIsApiConfigCollapsed(!isApiConfigCollapsed)}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" fontWeight={600}>
                  API Configuration
                </Typography>
                {(lighterPublicKey && lighterPrivateKey && backpackApiPublicKey && backpackApiSecretKey) && (
                  <Chip 
                    label="Configured" 
                    size="small" 
                    color="success" 
                    sx={{ fontSize: '0.6rem', height: 20 }}
                  />
                )}
              </Box>
              <Typography variant="caption" color="text.secondary">
                {isApiConfigCollapsed ? 'Click to expand' : 'Click to collapse'}
              </Typography>
            </Box>
            <IconButton 
              size="small"
              sx={{
                transition: 'transform 0.2s ease-in-out',
                transform: isApiConfigCollapsed ? 'rotate(0deg)' : 'rotate(180deg)'
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Box>
        </Box>
        
        <Collapse in={!isApiConfigCollapsed} timeout={300}>
          <CardContent sx={{ pt: 1 }}>
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
        </Collapse>
      </Card>

      <Card
        sx={{
          background: theme => theme.palette.background.paper,
          border: theme => `1px solid ${theme.palette.divider}`,
        }}
      >
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={3}>
            Balance Overview
          </Typography>
          
          {balanceError && (
            <Box sx={{ 
              mb: 3, 
              p: 2, 
              borderRadius: 2, 
              bgcolor: 'error.main', 
              color: 'error.contrastText',
              border: '1px solid',
              borderColor: 'error.dark'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  ⚠️ Insufficient Balance
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Your current balance is insufficient to cover all active spreads. Please add more funds or close some positions.
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
            <Box sx={{ 
              p: 2, 
              borderRadius: 2, 
              bgcolor: 'background.default',
              border: '1px solid',
              borderColor: 'divider',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                height: 4, 
                bgcolor: 'primary.main',
                opacity: 0.7
              }} />
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Lighter Balance
              </Typography>
              <Typography variant="h4" fontWeight={700} color="primary.main">
                ${parseFloat(balances?.lighterBalance || '0').toFixed(2)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Available for trading
              </Typography>
            </Box>

            <Box sx={{ 
              p: 2, 
              borderRadius: 2, 
              bgcolor: 'background.default',
              border: '1px solid',
              borderColor: 'divider',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                height: 4, 
                bgcolor: 'secondary.main',
                opacity: 0.7
              }} />
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Backpack Balance
              </Typography>
              <Typography variant="h4" fontWeight={700} color="secondary.main">
                ${parseFloat(balances?.backpackBalance || '0').toFixed(2)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Available for trading
              </Typography>
            </Box>

            <Box sx={{ 
              p: 2, 
              borderRadius: 2, 
              bgcolor: 'background.default',
              border: '1px solid',
              borderColor: 'divider',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                height: 4, 
                bgcolor: 'info.main',
                opacity: 0.7
              }} />
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Backpack Leverage
              </Typography>
              <Typography variant="h4" fontWeight={700} color="info.main">
                {balances?.backpackLeverage || 1}x
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Maximum leverage available
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" color="text.secondary" mb={2}>
              Connection Status
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Chip 
                label={`Lighter: ${isLighterConnected ? 'Connected' : 'Disconnected'}`}
                color={isLighterConnected ? 'success' : 'error'}
                size="medium"
                sx={{ 
                  fontWeight: 600,
                  transition: 'all 0.3s ease-in-out',
                  transform: isLighterConnected ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: isLighterConnected ? theme => theme.shadows[2] : 'none',
                }}
                icon={isLighterConnected ? (
                  <Box 
                    sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      backgroundColor: 'currentColor',
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%': { opacity: 1 },
                        '50%': { opacity: 0.5 },
                        '100%': { opacity: 1 },
                      }
                    }} 
                  />
                ) : undefined}
              />
              <Chip 
                label={`Backpack: ${isBackpackConnected ? 'Connected' : 'Disconnected'}`}
                color={isBackpackConnected ? 'success' : 'error'}
                size="medium"
                sx={{ 
                  fontWeight: 600,
                  transition: 'all 0.3s ease-in-out',
                  transform: isBackpackConnected ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: isBackpackConnected ? theme => theme.shadows[2] : 'none',
                }}
                icon={isBackpackConnected ? (
                  <Box 
                    sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      backgroundColor: 'currentColor',
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%': { opacity: 1 },
                        '50%': { opacity: 0.5 },
                        '100%': { opacity: 1 },
                      }
                    }} 
                  />
                ) : undefined}
              />
            </Box>
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