import LoadingButton from '@mui/lab/LoadingButton'
import {
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Paper,
  Select,
  TextField,
} from '@mui/material'
import { useEffect, useState } from 'react'

import Box from '@mui/material/Box'

import { TokenDto_Output, TokenService } from '../../api'
import { BatchAccount } from '../../types'

export const CreateUnitModal: React.FC<{
  open: boolean
  account: BatchAccount
  accountsCount: number
  handleClose: () => void
  handleCreateUnit: (form: {
    token_id: number
    sz: number
    leverage: number
    timing: number
  }) => void
  defaultTiming: number
}> = ({ open, handleClose, handleCreateUnit, defaultTiming }) => {
  const [form, setForm] = useState({
    token_id: 0,
    timing: defaultTiming,
    sz: 0,
    leverage: 1,
  })

  const [marketData, setMarketData] = useState<TokenDto_Output[]>([])

  const onConfirm = () => {
    if (true || (form.token_id && form.sz && form.leverage && form.timing))
      handleCreateUnit({
        ...form,
        timing: form.timing * 60000,
      })
  }

  const getMarketData = async () => {
    const data = await TokenService.tokenListApiTokensGet()

    setMarketData(data)
  }

  useEffect(() => {
    getMarketData()
  }, [])

  const onChange = (
    key: keyof typeof form,
    v: string | number,
  ) => {
    setForm(prev => ({ ...prev, [key]: v }))
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Paper
        sx={{
          width: '500px',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Box>
          <FormControl fullWidth size='small'>
            <InputLabel id='asset-label'>Select Asset</InputLabel>
            <Select
              labelId='asset-label'
              id='asset-select'
              value={form.token_id}
              label='Select Asset'
              onChange={e => onChange('token_id', Number(e.target.value))}
            >
              <MenuItem value=''>
                <em>No asset</em>
              </MenuItem>
              {marketData?.map(market => (
                <MenuItem value={market.market_id} key={market.symbol}>
                  {market.symbol}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: 'flex', width: '100%', gap: 2 }}>
          <Box sx={{ width: '100%' }}>
            <TextField
              fullWidth
              size='small'
              label='Size value (USD)'
              variant='outlined'
              value={form.sz}
              type='number'
              onChange={e => onChange('sz', Number(e.target.value))}
            />
          </Box>
          <Box sx={{ width: '100%' }}>
            <TextField
              fullWidth
              size='small'
              label='Leverage'
              variant='outlined'
              type='number'
              value={form.leverage}
              onChange={e => onChange('leverage', Number(e.target.value))}
            />
          </Box>
          <Box sx={{ width: '100%' }}>
            <TextField
              label='Re-create timing (mins)'
              type='number'
              size='small'
              placeholder={String(defaultTiming)}
              defaultValue={defaultTiming}
              variant='outlined'
              onChange={e => onChange('timing', Number(e.target.value))}
            />
          </Box>
        </Box>
        <Box>
          {/* <Typography>
            Summary:
            <strong>
              {' ' + (Number(assetPrice ?? 0) * form.sz).toFixed(2)} $
            </strong>
          </Typography> */}
          {/* <Typography sx={{ mt: 1 }}>
            Summary with leverage:
            <>
              <strong>
                {' ' +
                  (Number(assetPrice ?? 0) * form.sz * form.leverage).toFixed(
                    2,
                  )}{' '}
                $
              </strong>
              {sizingError && (
                <Alert variant='standard' color='warning' sx={{ mt: 1 }}>
                  <Typography fontSize={14}>
                    [Summary] * [Leverage] * 0.1 should be greater or equal than
                    10$
                  </Typography>
                </Alert>
              )}
            </>
          </Typography> */}
        </Box>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <LoadingButton
            variant='contained'
            color='success'
            onClick={onConfirm}
            // disabled={!form.asset || !form.sz || !form.leverage || sizingError}
          >
            Confirm
          </LoadingButton>
        </Box>
      </Paper>
    </Modal>
  )
}
