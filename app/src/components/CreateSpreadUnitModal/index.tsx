import LoadingButton from '@mui/lab/LoadingButton'
import { Box, FormControl, InputLabel, MenuItem, Modal, Paper, Select, TextField, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { TokenDto_Output, TokenService } from '../../api'
import { MarketsService } from '../../bp-api'
import { SpreadData } from '../../tabs/Spread/constants'

export const CreateSpreadUnitModal: React.FC<{
  open: boolean
  handleClose: () => void
  handleCreateSpread: (form: Omit<SpreadData, 'id' | 'timeOpened' | 'status'>) => void
}> = ({ open, handleClose, handleCreateSpread }) => {
  const [form, setForm] = useState({
    asset: '',
    size: 0,
    leverage: 1,
    openSpread: 0,
    closeSpread: 0,
  })

  const { data: backpackMarkets } = useQuery({
    queryKey: ['backpack-tokens'],
    queryFn: () => {
      return MarketsService.getMarkets()
    },
  })

  const [marketData, setMarketData] = useState<TokenDto_Output[]>([])

  const onConfirm = () => {
    if (form.asset && form.size && form.openSpread && form.closeSpread) {
      handleCreateSpread({
        ...form,
        tokenId: marketData.find(market => market.symbol === form.asset)?.market_id ?? 0,
        minLifetime: 10,
        lastTimeFilled: 0,
        lighterPositions: [],
        backpackPositions: [],
      })
      handleClose()
    }
  }

  const getMarketData = async () => {
    const data = await TokenService.tokenListApiTokensGet()
    setMarketData(data)
  }

  useEffect(() => {
    getMarketData()
  }, [])

  const onChange = (key: keyof typeof form, v: string | number) => {
    setForm(prev => ({ ...prev, [key]: v }))
  }

  return (
    <Modal open={open} onClose={handleClose} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper
        sx={{
          width: '600px',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 1 }}>
          <Typography variant='h5' fontWeight={600} color='primary.main'>
            Create Spread Unit
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
            Configure your spread trading parameters
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth size='small'>
            <InputLabel id='asset-label'>Select Asset</InputLabel>
            <Select labelId='asset-label' id='asset-select' value={form.asset} label='Select Asset' onChange={e => onChange('asset', e.target.value)}>
              <MenuItem value=''>
                <em>No asset</em>
              </MenuItem>
              {marketData
                .filter(
                  market =>
                    backpackMarkets?.some(bpMarket => bpMarket.symbol.split('_')[0] === market.symbol) &&
                    Number(backpackMarkets?.find(bpMarket => bpMarket.symbol.split('_')[0] === market.symbol)?.filters.quantity.stepSize) === (1 / (10 ** market.size_decimals)),
                )
                .sort((a, b) => a.symbol.localeCompare(b.symbol))
                .map(market => (
                  <MenuItem value={market.symbol} key={market.symbol}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant='body2' fontWeight={500}>
                        {market.symbol}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              size='small'
              label='Size'
              variant='outlined'
              value={form.size}
              type='number'
              onChange={e => onChange('size', Number(e.target.value))}
              inputProps={{ step: 0.01, min: 0 }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              size='small'
              label='Lighter Leverage'
              variant='outlined'
              type='number'
              value={form.leverage}
              onChange={e => onChange('leverage', Number(e.target.value))}
              inputProps={{ step: 1, min: 1 }}
            />
            <TextField
              fullWidth
              size='small'
              label='Open Spread (%)'
              variant='outlined'
              type='number'
              value={form.openSpread}
              onChange={e => onChange('openSpread', Number(e.target.value))}
              inputProps={{ step: 0.01, min: 0 }}
            />
            <TextField
              fullWidth
              size='small'
              label='Close Spread (%)'
              variant='outlined'
              type='number'
              value={form.closeSpread}
              onChange={e => onChange('closeSpread', Number(e.target.value))}
              inputProps={{ step: 0.01, min: 0 }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            p: 2,
            bgcolor: 'background.default',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant='body2' fontWeight={500} gutterBottom>
            Summary:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant='body2' color='text.secondary'>
              Asset: <strong>{form.asset || 'Not selected'}</strong>
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Size: <strong>{form.size || 0}</strong>
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Spreads: <strong>{form.openSpread}%</strong> → <strong>{form.closeSpread}%</strong>
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
          }}
        >
          <LoadingButton variant='outlined' onClick={handleClose} sx={{ minWidth: 100 }}>
            Cancel
          </LoadingButton>
          <LoadingButton
            variant='contained'
            color='primary'
            onClick={onConfirm}
            disabled={!form.asset || !form.size || !form.openSpread || !form.closeSpread}
            sx={{
              minWidth: 100,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
            }}
          >
            Create Spread
          </LoadingButton>
        </Box>
      </Paper>
    </Modal>
  )
}
