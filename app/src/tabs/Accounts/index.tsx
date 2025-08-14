import { Box, Button } from '@mui/material'
import React, { useContext, useMemo, useState } from 'react'

import { AddAccountModal } from '../../components/AddAccountModal'
import { ChipWithCopy } from '../../components/ChipWithCopy'
import { SetProxyModal } from '../../components/SetProxyModal'
import { Row, Table } from '../../components/Table'
import { GlobalContext } from '../../context'
import { Account, HeadCell, Proxy } from '../../types'
import { stringifyProxy } from '../../utils'

const createRows = (accounts: Account[], getAccountProxy: (account: Account) => Proxy | undefined, onEdit: (account: Account) => void): Row[] => {
  return accounts.map(account => ({
    id: account.id ?? account.public_address,
    data: [
      account.name,
      <ChipWithCopy value={account.public_address} short />,
      <ChipWithCopy value={account.private_key} short />,
      <ChipWithCopy value={stringifyProxy(getAccountProxy(account))} short={stringifyProxy(getAccountProxy(account)).length > 36} />,
      <Button
        variant='contained'
        onClick={e => {
          e.stopPropagation()
          onEdit(account)
        }}
      >
        Edit
      </Button>,
    ],
  }))
}

const headCells: HeadCell[] = [
  {
    id: 'name',
    align: 'left',
    disablePadding: true,
    label: 'Name',
  },
  {
    id: 'public_address',
    align: 'center',
    disablePadding: false,
    label: 'Public Address',
  },
  {
    id: 'private_key',
    align: 'center',
    disablePadding: false,
    label: 'Private key',
  },
  {
    id: 'proxy',
    align: 'center',
    disablePadding: false,
    label: 'Proxy',
  },
  {
    id: 'edit',
    align: 'center',
    disablePadding: false,
    label: '',
  },
]

export const Accounts = () => {
  const { accounts, addAccount, getAccountProxy, removeAccounts } = useContext(GlobalContext)

  const [editAccount, setEditAccount] = useState<Account>()

  const handleEdit = (account: Account) => {
    setEditAccount(account)
    setModalId('addAccountModal')
  }

  const rows = useMemo(() => createRows(accounts, getAccountProxy, handleEdit), [accounts])
  const [activeModalId, setModalId] = useState<string | null>(null)

  const ActionBar: React.FC<{
    selected: string[]
    onActionDone: () => void
  }> = ({ selected, onActionDone }) => {
    return (
      <>
        <SetProxyModal selected={selected} open={activeModalId === 'setProxyModal'} handleClose={() => setModalId(null)} onSubmit={() => onActionDone()} />
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            alignItems: 'center',
            width: '100%',
            justifyContent: 'flex-end',
          }}
        >
          <Button
            variant='contained'
            color='primary'
            onClick={() => {
              setModalId('setProxyModal')
            }}
          >
            Set Proxy
          </Button>
          <Button
            variant='contained'
            color='error'
            onClick={() => {
              onActionDone()
              removeAccounts(selected)
            }}
          >
            Delete selected
          </Button>
        </Box>
      </>
    )
  }

  const toolbar = () => {
    return (
      <div>
        <Button variant='contained' color='primary' onClick={() => setModalId('addAccountModal')}>
          Add Account
        </Button>
      </div>
    )
  }

  return (
    <Box sx={{ width: '100%' }}>
      <AddAccountModal
        accountEdit={editAccount}
        handleAddAccount={addAccount}
        open={activeModalId === 'addAccountModal'}
        handleClose={() => {
          setModalId(null)
          setEditAccount(undefined)
        }}
      />
      <Table headCells={headCells} rows={rows} withCheckbox ActionBar={ActionBar} toolbar={toolbar()} />
    </Box>
  )
}
