import { LoadingButton } from '@mui/lab'
import { Box, FormControl, Modal, Paper, TextField } from '@mui/material'
import { useState } from 'react'

export const UpdateUnitTimingModal = ({
  defaultValue,
  defaultRange,
  open,
  handleClose,
  handleUpdate,
}: {
  defaultValue: number
  defaultRange: number
  handleClose: () => void
  handleUpdate: (timing: number, range: number) => void
  open: boolean
}) => {
  const [timing, setTiming] = useState(defaultValue)
  const [range, setRange] = useState(defaultRange)

  const onConfirm = () => {
    if (timing && range) handleUpdate(timing * 60000, range * 60000)
  }

  return (
    <Modal open={open} onClose={handleClose} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
          <FormControl fullWidth>
            <TextField
              fullWidth
              size='medium'
              label='Recreate timing'
              variant='outlined'
              type='number'
              value={timing}
              onChange={e => setTiming(Number(e.target.value))}
            />
          </FormControl>
        </Box>
        <Box>
          <FormControl fullWidth>
            <TextField
              fullWidth
              size='medium'
              label='Random range'
              variant='outlined'
              type='number'
              value={range}
              onChange={e => setRange(Number(e.target.value))}
            />
          </FormControl>
        </Box>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <LoadingButton variant='contained' color='success' onClick={onConfirm} disabled={!timing}>
            Update
          </LoadingButton>
        </Box>
      </Paper>
    </Modal>
  )
}
