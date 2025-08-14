import { Box, Button, Paper, Typography } from '@mui/material'
import React, { useContext, useMemo, useState } from 'react'
import { toast } from 'react-toastify'

import { ChipWithCopy } from '../../components/ChipWithCopy'
import { CreateUnitModal } from '../../components/CreateUnitModal'
import { Table } from '../../components/Table'
import { UpdateUnitTimingModal } from '../../components/UpdateUnitTimingModal'
import { GlobalContext } from '../../context'
import { Unit } from '../../types'
import { getBatchAccount } from '../../utils'
import { headCells } from './components/cells'
import { createRows } from './components/rows'
import { useBatch } from './hooks/useBatch'

export const Batch: React.FC<{
  name: string
  accounts: string[]
  constant_timing: number
  id: string
}> = ({ name, accounts, id, constant_timing }) => {
  const [modalId, setModalId] = useState<string | null>(null)
  const { closeBatch, getAccountProxy } = useContext(GlobalContext)

  const [updatingUnit, setUpdatingUnit] = useState<number>()

  const {
    batchAccounts,
    units,
    balances,
    closingUnits,
    recreatingUnits,
    initialLoading,
    unitTimings,
    getUnitTimingOpened,
    getUnitTimingReacreate,
    setTimings,
    createUnit,
    closeUnit,
  } = useBatch({ accounts, id, name })

  const handleAction = (type: 'close_unit' | 'update_unit_timing', unit: Unit) => {
    if (type === 'close_unit') {
      closeUnit(unit)
    }

    if (type === 'update_unit_timing') {
      setUpdatingUnit(unit.base_unit_info.token_id)
    }
  }

  const handleUpdateUnitTiming = (timing: number) => {
    if (updatingUnit === undefined) {
      return
    }
    setTimings(updatingUnit, timing, getUnitTimingOpened(updatingUnit))
    setUpdatingUnit(undefined)
  }

  const handleCreateUnit = async (form: { token_id: number; sz: number; leverage: number; timing: number }) => {
    setModalId(null)
    const promise = createUnit(form)

    toast.promise(promise, {
      pending: `${name}: Creating unit with asset ${form.token_id}`,
      success: `${name}: Unit with asset ${form.token_id} created 👌`,
      error: `${name}: Error while creating unit with asset ${form.token_id} error 🤯`,
    })
  }

  const rows = useMemo(
    () => createRows(units, closingUnits, recreatingUnits, getUnitTimingOpened, getUnitTimingReacreate, handleAction),
    [units, closingUnits, recreatingUnits, unitTimings, getUnitTimingOpened, getUnitTimingReacreate],
  )

  const toolbar = () => {
    return (
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          gap: '16px',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'flex-end',
            flexGrow: 1,
          }}
        >
          {/* <Button
            variant='outlined'
            color='primary'
            disabled={initialLoading}
            onClick={() => setModalId('importUnitsModal')}
          >
            Import units
          </Button> */}
          <Button variant='contained' color='primary' disabled={initialLoading} onClick={() => setModalId('createUnitModal')}>
            Create Unit
          </Button>
        </Box>
      </Box>
    )
  }

  return (
    <Paper sx={{ padding: 3 }}>
      {modalId === 'createUnitModal' && (
        <CreateUnitModal
          handleCreateUnit={handleCreateUnit}
          account={getBatchAccount(batchAccounts[0], getAccountProxy(batchAccounts[0]))}
          accountsCount={accounts.length}
          open
          handleClose={() => setModalId(null)}
          defaultTiming={constant_timing}
        />
      )}

      {updatingUnit !== undefined && (
        <UpdateUnitTimingModal
          handleUpdate={handleUpdateUnitTiming}
          open
          handleClose={() => setUpdatingUnit(undefined)}
          defaultValue={getUnitTimingReacreate(updatingUnit) / 60000}
        />
      )}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 0,
          width: '100%',
          justifyContent: 'space-between',
        }}
      >
        <Typography fontSize={36} fontWeight={900} sx={{ m: '12px 0' }}>
          {name}
        </Typography>
        <Box>
          <Button variant='contained' color='error' onClick={() => closeBatch(id)} disabled={Boolean(initialLoading || units.length || recreatingUnits.length)}>
            Close Batch
          </Button>
        </Box>
      </Box>

      {batchAccounts.map(account => {
        return (
          <Typography key={account.id} sx={{ display: 'flex', gap: 3, alignItems: 'center', m: '6px 0' }}>
            {account.name}:
            <div>
              <strong>
                <ChipWithCopy value={account.public_address} short />
              </strong>
            </div>
            balance: <strong>{balances[account.private_key]?.all}$</strong>
            free_balance:
            <strong>{balances[account.private_key]?.free}$</strong>
          </Typography>
        )
      })}

      <Box sx={{ mt: 2 }}>
        <Table headCells={headCells} loading={initialLoading} rows={rows} pagination={false} toolbar={toolbar()} />
      </Box>
    </Paper>
  )
}
