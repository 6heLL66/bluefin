import { Box, Button, FormControl, InputLabel, MenuItem, Modal, Paper, Select } from '@mui/material'
import { useContext, useState } from 'react'

import { GlobalContext } from '../../context'
import { stringifyProxy } from '../../utils'

export const SetProxyModal: React.FC<{
  open: boolean
  handleClose: () => void
  onSubmit: () => void
  selected: string[]
}> = ({ open, handleClose, selected, onSubmit }) => {
  const { proxies, linkAccountsProxy } = useContext(GlobalContext)
  const [proxyId, setProxyId] = useState('')

  const onConfirm = () => {
    console.log(selected)
    linkAccountsProxy(selected, proxyId)
    handleClose()
    onSubmit()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Paper sx={{ width: '500px', p: 2 }}>
        <Box sx={{ gap: 5, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id='proxy-label'>Proxy</InputLabel>
              <Select labelId='proxy-label' id='proxy-select' value={proxyId} label='Proxy' onChange={e => setProxyId(e.target.value)}>
                <MenuItem value=''>
                  <em>No proxy</em>
                </MenuItem>
                {proxies.map(p => (
                  <MenuItem value={p.id}>{stringifyProxy(p)}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <Button variant='contained' color='error' onClick={handleClose}>
              Cancel
            </Button>
            <Button variant='contained' color='success' onClick={onConfirm}>
              Confirm
            </Button>
          </Box>
        </Box>
      </Paper>
    </Modal>
  )
}
