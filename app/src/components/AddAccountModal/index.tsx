import { Button, Modal, Paper, TextField } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify'

import Box from '@mui/material/Box'

import { GlobalContext, db } from '../../context'
import { Account } from '../../types'

export const AddAccountModal: React.FC<{
  open: boolean
  accountEdit?: Account
  handleClose: () => void
  handleAddAccount: (account: Account, proxy?: string) => void
}> = ({ open, handleClose, handleAddAccount, accountEdit }) => {
  const { getAccounts } = useContext(GlobalContext)
  const [account, setAccount] = useState<Account & { proxy?: string }>({
    name: '',
    public_address: '',
    private_key: '',
    proxy: '',
  })

  useEffect(() => {
    if (accountEdit) {
      setAccount({
        ...accountEdit,
      })
    } else {
      setAccount({
        name: '',
        public_address: '',
        private_key: '',
        proxy: '',
      })
    }
  }, [accountEdit, open])

  const onConfirm = () => {
    if (account.private_key && account.public_address) {
      const { proxy, ...accountData } = account
      if (accountEdit) {
        db.editAccount(accountEdit.id!, account)
          .then(getAccounts)
          .catch(e => {
            toast.error(e)
          })
      } else {
        handleAddAccount(accountData, proxy ? account.proxy : '')
      }

      handleClose()
    }
  }

  const onChange = (key: keyof (Account & { proxy: string }), v: string) => {
    setAccount(prev => ({ ...prev, [key]: v }))
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
            <TextField
              label='Name'
              variant='outlined'
              onChange={e => onChange('name', e.target.value)}
              value={account.name}
            />
            <TextField
              label='Public address'
              variant='outlined'
              onChange={e => onChange('public_address', e.target.value)}
              value={account.public_address}
            />
            <TextField
              label='Passphrase'
              variant='outlined'
              onChange={e => onChange('private_key', e.target.value)}
              value={account.private_key}
            />
            {account.proxy !== undefined && (
              <TextField
                label='Proxy'
                variant='outlined'
                placeholder='host:port:login:password'
                onChange={e => onChange('proxy', e.target.value)}
                value={account.proxy}
              />
            )}
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
            <Button
              variant='contained'
              color='success'
              onClick={onConfirm}
              disabled={!account.private_key || !account.name}
            >
              Confirm
            </Button>
          </Box>
        </Box>
      </Paper>
    </Modal>
  )
}
