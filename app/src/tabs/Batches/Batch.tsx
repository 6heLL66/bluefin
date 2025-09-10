import { Box, Button, CircularProgress, Paper, Typography } from '@mui/material'
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
  initial_total_balance?: number
  id: string
}> = ({ name, accounts, id, constant_timing, initial_total_balance }) => {
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
    authorizingLighter,
    randomRecreatingTimings,
    tradeData,
    authLighter,
    getUnitTimingOpened,
    getUnitTimingReacreate,
    getUnitTimingRange,
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

  const handleUpdateUnitTiming = (timing: number, range: number) => {
    if (updatingUnit === undefined) {
      return
    }
    setTimings(updatingUnit, timing, getUnitTimingOpened(updatingUnit), range)
    setUpdatingUnit(undefined)
  }

  const handleCreateUnit = async (form: { token_id: number; sz: number; leverage: number; timing: number; range: number }) => {
    setModalId(null)
    const promise = createUnit(form)

    toast.promise(promise, {
      pending: `${name}: Creating unit with asset ${form.token_id}`,
      success: `${name}: Unit with asset ${form.token_id} created 👌`,
      error: `${name}: Error while creating unit with asset ${form.token_id} error 🤯`,
    })
  }

  const rows = useMemo(
    () => createRows(units, closingUnits, recreatingUnits, randomRecreatingTimings, getUnitTimingOpened, getUnitTimingReacreate, handleAction),
    [units, closingUnits, recreatingUnits, unitTimings, randomRecreatingTimings, getUnitTimingOpened, getUnitTimingReacreate],
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

  const totalBalance = batchAccounts.reduce((acc, account) => acc + +balances[account.public_address]?.all, 0)
  const totalPoints = batchAccounts.reduce((acc, account) => acc + +tradeData[account.public_address]?.points, 0)
  const totalVolume = batchAccounts.reduce((acc, account) => acc + +tradeData[account.public_address]?.volume, 0)
  const totalWeeklyVolume = batchAccounts.reduce((acc, account) => acc + +tradeData[account.public_address]?.weekly_volume, 0)
  const totalDailyVolume = batchAccounts.reduce((acc, account) => acc + +tradeData[account.public_address]?.daily_volume, 0)
  const totalMonthlyVolume = batchAccounts.reduce((acc, account) => acc + +tradeData[account.public_address]?.monthly_volume, 0)

  return (
    <Paper sx={{ padding: 3 }}>
      <Button variant='contained' color='primary' onClick={authLighter}>
        {authorizingLighter ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} color='inherit' />
            <Typography variant='body2'>Authorizing...</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant='body2' fontWeight={600}>
              🔐 Auth Lighter
            </Typography>
          </Box>
        )}
      </Button>

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
          defaultRange={getUnitTimingRange(updatingUnit) / 60000}
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
            balance: <strong>{balances[account.public_address]?.all}$</strong>
            free_balance:
            <strong>{balances[account.public_address]?.free}$</strong>
            points: <strong>{tradeData[account.public_address]?.points}</strong>
            volume: <strong>{tradeData[account.public_address]?.volume.toFixed(2)}$</strong>
          </Typography>
        )
      })}

      <Box>
        <Typography sx={{ display: 'flex', gap: 3, alignItems: 'center', mt: 2 }}>
          Total balance:
          <div>
            <strong>
            {totalBalance.toFixed(2)}$ {initial_total_balance && <Typography variant='caption' fontSize={14} color='red'>({(totalBalance - initial_total_balance).toFixed(2)}$)</Typography>}
            </strong>
          </div>
        </Typography>
        <Typography sx={{ display: 'flex', gap: 3, alignItems: 'center', m: '6px 0' }}>
          Total points:
          <div>
            <strong>{totalPoints}</strong>
          </div>
        </Typography>
        <Typography sx={{ display: 'flex', gap: 3, alignItems: 'center', m: '6px 0' }}>
          Total volume:
          <div>
            <strong>{totalVolume.toFixed(2)}$</strong>
          </div>
        </Typography>
        <Typography sx={{ display: 'flex', gap: 3, alignItems: 'center', m: '6px 0' }}>
          Total weekly volume:
          <div>
            <strong>{totalWeeklyVolume.toFixed(2)}$</strong>
          </div>
        </Typography>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Table headCells={headCells} loading={initialLoading} rows={rows} pagination={false} toolbar={toolbar()} />
      </Box>
    </Paper>
  )
}
