import { AccountWithPositionsDto, ORDER_SIDE } from './api'
import { Account, BatchAccount, LogEntry, Proxy, Unit } from './types'

export const stringifyProxy = (proxy?: Proxy) => {
  if (!proxy) {
    return 'No proxy'
  }

  return `${proxy.host}:${proxy.port}:${proxy.username}:${proxy.password}`
}

export const parseProxy = (proxyString: string): Proxy => {
  const [host, port, username, password] = proxyString.split(':')

  return { host, port, username, password }
}

export const connectSocket = (cb: (socket: WebSocket | null) => void) => {
  const connection = new WebSocket('wss://api.hyperliquid.xyz/ws')

  connection.onopen = () => {
    cb(connection)
    console.log('socket connected')
  }
  connection.onclose = () => {
    cb(null)
    setTimeout(connectSocket, 3000)
    connectSocket(cb)
    console.log('socket disconnected')
  }
  connection.onerror = () => {
    connection?.close()
    console.log('socket error')
  }
}

export const transformAccountStatesToUnits = (accountStates: Array<AccountWithPositionsDto>): Unit[] => {
  if (!accountStates.length) return []

  const unitsMap: { [key: string]: Unit } = {}

  accountStates.forEach(accountState => {
    accountState.positions.forEach(position => {
      const { symbol, leverage, size, side, market_id } = position
      if (!unitsMap[symbol]) {
        unitsMap[symbol] = {
          base_unit_info: {
            token_id: market_id,
            symbol: symbol,
            leverage: Number(leverage),
            size: 0,
          },
          positions: [],
        }
      }
      if (Number(size) > 0 && side === ORDER_SIDE.BUY) {
        unitsMap[symbol].base_unit_info.size += Number(size)
      }
      unitsMap[symbol].positions.push({
        info: {
          szi: size,
          side: position.side,
          leverage: Number(leverage),
        },
      })
    })
  })

  return Object.values(unitsMap)
}

export const getBatchAccount = (account: Account, proxy?: Proxy): BatchAccount => {
  return {
    account,
    proxy,
  }
}

export function convertMsToTime(milliseconds: number) {
  let seconds = Math.floor(milliseconds / 1000)
  let minutes = Math.floor(seconds / 60)
  let hours = Math.floor(minutes / 60)

  function padTo2Digits(num: number) {
    return num.toString().padStart(2, '0')
  }

  seconds = seconds % 60
  minutes = minutes % 60
  hours = hours % 24

  return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}:${padTo2Digits(seconds)}`
}

export const formatLogs = (
  logs: LogEntry[],
  user_id?: string,
): (Omit<LogEntry, 'spread' | 'details'> & {
  spread?: string
  details?: string
  user_id?: string
})[] => {
  return logs.map(log => {
    return {
      ...log,
      timestamp: new Date(log.timestamp).toISOString(),
      user_id,
      spread: log.spread ? JSON.stringify(log.spread) : '{}',
      details: log.details ? JSON.stringify(log.details) : '{}',
    }
  })
}

export const getLongPositions = (positions: Unit['positions']) => {
  return positions.filter(p => p.info.side === ORDER_SIDE.BUY)
}

export const getShortPositions = (positions: Unit['positions']) => {
  return positions.filter(p => p.info.side === ORDER_SIDE.SELL)
}

export const getPositionsSummary = (positions: Unit['positions']) => {
  return positions.reduce((acc, pos) => acc + Math.abs(Number(pos.info.szi)), 0)
}

export const withTimeout = <T>(invoke: () => Promise<T>, time = 20000) => {
  return new Promise<T>((res, rej) => {
    let timeout: NodeJS.Timeout
    invoke()
      .then(response => {
        clearTimeout(timeout)
        res(response)
      })
      .catch(e => {
        clearTimeout(timeout)
        rej(e)
      })

    timeout = setTimeout(() => {
      rej('timeout ' + time)
    }, time)
  })
}
