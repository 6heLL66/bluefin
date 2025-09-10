import { useQuery } from "@tanstack/react-query"
import { LighterSpreadsResponse } from "./types"
import { useAfkTokensStore } from "../../store/afkTokensStore"
import { 
  Box, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Typography, 
  Chip, 
  CircularProgress,
  Card,
  CardContent,
  Grid,
  IconButton,
  Alert,
  TextField,
  Tooltip,
} from '@mui/material'
import { useState, useEffect } from "react"
import { Refresh, Visibility, VisibilityOff, Warning } from "@mui/icons-material"
import { getLighterMarkets } from "../../own-api/getLighterMarkets"

export const LighterSpreadsTable = () => {
    const { afkTokens, toggleToken, isTokenAfk } = useAfkTokensStore()
    
    const [refreshInterval, setRefreshInterval] = useState(60000)
    
    const { data: lighterMarkets } = useQuery({
        queryKey: ['lighter-tokens'],
        queryFn: () => {
          return getLighterMarkets()
        },
    })

    const [lastUpdated, setLastUpdated] = useState(Date.now())
    const [relativeTime, setRelativeTime] = useState('')
    const [sortBy, setSortBy] = useState<'spread' | 'percentage'>('percentage')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

    const [isTooManyRequests, setIsTooManyRequests] = useState(false)
    
    const { data: lighterBooks, isFetching, refetch } = useQuery({
        queryKey: ['lighter-spreads'],
        queryFn: async () => {
            if (!lighterMarkets) return []
            
            const promises = await Promise.all(lighterMarkets
                .filter(market => !isTokenAfk(market.market_id))
                .map(async (market) => {
                    try {
                        setIsTooManyRequests(false)
                        const response = await fetch(`https://mainnet.zklighter.elliot.ai/api/v1/orderBookOrders?market_id=${market.market_id}&limit=4`)

                        if (response?.status === 429) {
                            setIsTooManyRequests(true)
                            return null
                        }

                        if (!response) return null
                        
                        const data = await response.json() as LighterSpreadsResponse
                        return { market, data: {...data, bids: data.bids.filter(b => +b.remaining_base_amount > 0).sort((a, b) => +b.price - +a.price), asks: data.asks.filter(a => +a.remaining_base_amount > 0).sort((a, b) => +a.price - +b.price)} }
                    } catch (error) {
                        console.error(`Error fetching data for market ${market.market_id}:`, error)
                        return null
                    }
                }))

            setLastUpdated(Date.now())
            
            return promises.reduce((acc, curr) => {
                if (!curr || curr.data.code === 23000) return acc
                return {...acc, [curr.market.market_id]: curr.data} as Record<number, LighterSpreadsResponse>
            }, {} as Record<number, LighterSpreadsResponse>)
        },
        enabled: !!lighterMarkets,
        refetchInterval: refreshInterval
    })

    const formatRelativeTime = (timestamp: number) => {
        const now = Date.now()
        const diff = now - timestamp
        
        const seconds = Math.floor(diff / 1000)
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)
        
        if (seconds < 60) {
            return `${seconds}s ago`
        } else if (minutes < 60) {
            return `${minutes}m ago`
        } else if (hours < 24) {
            return `${hours}h ago`
        } else {
            const days = Math.floor(hours / 24)
            return `${days}d ago`
        }
    }

    const formatRefreshInterval = (interval: number) => {
        if (interval < 60000) {
            return `${interval / 1000}s`
        } else if (interval < 3600000) {
            return `${interval / 60000}m`
        } else {
            return `${interval / 3600000}h`
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            setRelativeTime(formatRelativeTime(lastUpdated))
        }, 1000)
        
        return () => clearInterval(interval)
    }, [lastUpdated])

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 4,
            maximumFractionDigits: 6
        }).format(price)
    }

    const formatSpreadPercentage = (percentage: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 3
        }).format(percentage)
    }

    const getSpreadColor = (percentage: number) => {
        if (percentage < 0.1) return 'success'
        if (percentage < 0.5) return 'warning'
        return 'error'
    }

    const getAllTokensData = () => {
        if (!lighterMarkets) return []
        
        const data = lighterMarkets.map((market) => {
            const bookData = lighterBooks?.[market.market_id]
            const isAfk = isTokenAfk(market.market_id)
            
            if (!bookData && !isAfk) return null
            
            if (isAfk) {
                return { market, bookData: null, spread: 0, spreadPercentage: 0, isAfk: true }
            }
            
            const bestBid = +bookData!.bids[0].price
            const bestAsk = +bookData!.asks[0].price
            const spread = bestAsk - bestBid
            const spreadPercentage = (spread / bestBid) * 100
            
            return { market, bookData, spread, spreadPercentage, isAfk: false }
        }).filter((item): item is NonNullable<typeof item> => item !== null)
        
        return data.sort((a, b) => {
            if (a.isAfk && !b.isAfk) return 1
            if (!a.isAfk && b.isAfk) return -1
            
            if (a.isAfk && b.isAfk) {
                return a.market.symbol.localeCompare(b.market.symbol)
            }
            
            if (sortBy === 'percentage') {
                return sortOrder === 'asc' 
                    ? a.spreadPercentage - b.spreadPercentage
                    : b.spreadPercentage - a.spreadPercentage
            } else {
                return sortOrder === 'asc' 
                    ? a.spread - b.spread
                    : b.spread - a.spread
            }
        })
    }

    return (
        <Box sx={{ p: 1 }}>
            <Card sx={{ mb: 1, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <CardContent sx={{ py: 1, px: 2 }}>
                    <Typography variant="h6" component="h1" sx={{ color: 'white', fontWeight: 'bold', mb: 0.5 }}>
                        Lighter Market Spreads
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        Real-time spread analysis across all lighter markets
                    </Typography>
                </CardContent>
            </Card>

            {isTooManyRequests && (
                <Alert 
                    severity="warning" 
                    icon={<Warning />}
                    sx={{ 
                        mb: 2,
                        background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
                        border: '2px solid #ffc107',
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(255, 193, 7, 0.3)',
                        '& .MuiAlert-message': {
                            fontWeight: 'bold',
                            color: '#856404'
                        },
                        '& .MuiAlert-icon': {
                            color: '#856404'
                        }
                    }}
                >
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#856404' }}>
                        Rate limit exceeded - Too many requests
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#856404', opacity: 0.8 }}>
                        Please wait before refreshing. Data will update automatically every {formatRefreshInterval(refreshInterval)}.
                    </Typography>
                </Alert>
            )}

            <Box sx={{ mt: 1, mb: 1 }}>
                <Grid container spacing={1}>
                    <Grid item xs={6} md={3}>
                        <Card sx={{ textAlign: 'center', p: 1 }}>
                            <Typography variant="caption" color="primary">
                                Markets
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {lighterMarkets?.length}
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Card sx={{ textAlign: 'center', p: 1, position: 'relative' }}>
                            <Typography variant="caption" color="warning.main">
                                Updated
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                               {isFetching ? <CircularProgress size={16} sx={{ color: '#64b5f6' }} /> : relativeTime}
                            </Typography>

                            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', position: 'absolute', left: 4, top: 7, justifyContent: 'center', gap: 0.5 }}>
                                <TextField
                                    size="small"
                                    value={refreshInterval / 1000}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value) || 60
                                        setRefreshInterval(Math.max(1000, Math.min(3600000, value * 1000)))
                                    }}
                                    onBlur={(e) => {
                                        const value = parseInt(e.target.value) || 60
                                        setRefreshInterval(Math.max(1000, Math.min(3600000, value * 1000)))
                                    }}
                                    inputProps={{
                                        min: 1,
                                        max: 3600,
                                        step: 1,
                                        style: {
                                            fontSize: '0.7rem',
                                            textAlign: 'center',
                                            padding: '4px 8px',
                                            color: '#666',
                                            fontWeight: 'bold'
                                        }
                                    }}
                                    sx={{
                                        width: 60,
                                        '& .MuiOutlinedInput-root': {
                                            height: 28,
                                            '& fieldset': {
                                                borderColor: '#666',
                                                borderWidth: 1
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#64b5f6'
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#64b5f6'
                                            }
                                        }
                                    }}
                                />
                                <Typography variant="caption" sx={{ color: '#666', fontWeight: 'bold', fontSize: '0.7rem' }}>
                                    s
                                </Typography>
                            </Box>

                            <Tooltip title="Manual refresh" placement="top">
                                <IconButton 
                                    onClick={() => refetch()} 
                                    disabled={isFetching} 
                                    sx={{ 
                                        position: 'absolute', 
                                        right: 0, 
                                        top: 0, 
                                        color: '#64b5f6',
                                        '&:hover': {
                                            backgroundColor: 'rgba(100, 181, 246, 0.1)'
                                        }
                                    }}
                                >
                                    <Refresh fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Card>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Card sx={{ textAlign: 'center', p: 1, position: 'relative' }}>
                            <Typography variant="caption" color="info.main">
                                AFK Tokens
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {afkTokens.length}
                            </Typography>
                            {afkTokens.length > 0 && (
                                <IconButton 
                                    onClick={() => useAfkTokensStore.getState().clearAll()} 
                                    sx={{ position: 'absolute', right: 0, top: 0, color: '#64b5f6' }}
                                    size="small"
                                >
                                    <Refresh fontSize="small" />
                                </IconButton>
                            )}
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            <Paper sx={{ width: '100%', borderRadius: 1, boxShadow: 2, backgroundColor: '#1e1e1e' }}>
                <TableContainer>
                    <Table stickyHeader size="small" aria-label="lighter spreads table">
                        {isFetching && <CircularProgress size={20} sx={{ color: '#64b5f6' }} />}
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#2d3748' }}>
                                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#2d3748', py: 0.5, px: 1, borderBottom: '2px solid #64b5f6', color: '#ffffff' }}>
                                    Market
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: '#2d3748', py: 0.5, px: 1, borderBottom: '2px solid #64b5f6', color: '#ffffff' }}>
                                    Bid
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: '#2d3748', py: 0.5, px: 1, borderBottom: '2px solid #64b5f6', color: '#ffffff' }}>
                                    Ask
                                </TableCell>
                                <TableCell 
                                    align="right" 
                                    sx={{ 
                                        fontWeight: 'bold', 
                                        backgroundColor: '#2d3748', 
                                        py: 0.5, 
                                        px: 1, 
                                        borderBottom: '2px solid #64b5f6', 
                                        color: '#ffffff',
                                        cursor: 'pointer',
                                        '&:hover': { backgroundColor: '#374151' }
                                    }}
                                    onClick={() => {
                                        setSortBy('spread')
                                        setSortOrder(sortBy === 'spread' && sortOrder === 'asc' ? 'desc' : 'asc')
                                    }}
                                >
                                    Spread {sortBy === 'spread' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </TableCell>
                                <TableCell 
                                    align="right" 
                                    sx={{ 
                                        fontWeight: 'bold', 
                                        backgroundColor: '#2d3748', 
                                        py: 0.5, 
                                        px: 1, 
                                        borderBottom: '2px solid #64b5f6', 
                                        color: '#ffffff',
                                        cursor: 'pointer',
                                        '&:hover': { backgroundColor: '#374151' }
                                    }}
                                    onClick={() => {
                                        setSortBy('percentage')
                                        setSortOrder(sortBy === 'percentage' && sortOrder === 'asc' ? 'desc' : 'asc')
                                    }}
                                >
                                    % {sortBy === 'percentage' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {getAllTokensData().map((item) => {
                                const { market, bookData, spread, spreadPercentage, isAfk } = item;

                                if (isAfk) {
                                    return (
                                        <TableRow 
                                            key={market.market_id}
                                            hover
                                            onClick={() => toggleToken(market.market_id)}
                                            sx={{ 
                                                backgroundColor: '#1a1a1a',
                                                cursor: 'pointer',
                                                opacity: 0.5,
                                                '&:hover': { 
                                                    backgroundColor: '#2a2a2a',
                                                    opacity: 0.7
                                                },
                                                borderBottom: '1px solid #404040'
                                            }}
                                        >
                                            <TableCell component="th" scope="row" sx={{ py: 0.5, px: 1, borderBottom: '1px solid #404040' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <VisibilityOff sx={{ fontSize: 16, color: '#666' }} />
                                                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#666' }}>
                                                        {market.symbol}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right" sx={{ py: 0.5, px: 1, borderBottom: '1px solid #404040', color: '#666' }}>
                                                <Typography variant="caption">AFK</Typography>
                                            </TableCell>
                                            <TableCell align="right" sx={{ py: 0.5, px: 1, borderBottom: '1px solid #404040', color: '#666' }}>
                                                <Typography variant="caption">AFK</Typography>
                                            </TableCell>
                                            <TableCell align="right" sx={{ py: 0.5, px: 1, borderBottom: '1px solid #404040', color: '#666' }}>
                                                <Typography variant="caption">AFK</Typography>
                                            </TableCell>
                                            <TableCell align="right" sx={{ py: 0.5, px: 1, borderBottom: '1px solid #404040', color: '#666' }}>
                                                <Typography variant="caption">AFK</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )
                                }

                                const bestBid = +bookData!.bids[0].price;
                                const bestAsk = +bookData!.asks[0].price;

                                return (
                                    <TableRow 
                                        key={market.market_id}
                                        hover
                                        onClick={() => toggleToken(market.market_id)}
                                        sx={{ 
                                            '&:nth-of-type(odd)': { backgroundColor: '#2a2a2a' },
                                            '&:nth-of-type(even)': { backgroundColor: '#1e1e1e' },
                                            '&:hover': { backgroundColor: '#374151' },
                                            borderBottom: '1px solid #404040',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <TableCell component="th" scope="row" sx={{ py: 0.5, px: 1, borderBottom: '1px solid #404040' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Visibility sx={{ fontSize: 16, color: '#64b5f6' }} />
                                                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#64b5f6' }}>
                                                    {market.symbol}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right" sx={{ py: 0.5, px: 1, borderBottom: '1px solid #404040' }}>
                                            <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                                                {formatPrice(bestBid)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right" sx={{ py: 0.5, px: 1, borderBottom: '1px solid #404040' }}>
                                            <Typography variant="caption" sx={{ color: '#f44336', fontWeight: 'bold' }}>
                                                {formatPrice(bestAsk)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right" sx={{ py: 0.5, px: 1, borderBottom: '1px solid #404040' }}>
                                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#e0e0e0' }}>
                                                {formatPrice(spread)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right" sx={{ py: 0.5, px: 1, borderBottom: '1px solid #404040' }}>
                                            <Chip 
                                                label={`${formatSpreadPercentage(spreadPercentage)}%`}
                                                color={getSpreadColor(spreadPercentage) as 'success' | 'warning' | 'error'}
                                                size="small"
                                                sx={{ 
                                                    fontWeight: 'bold',
                                                    height: 20,
                                                    fontSize: '0.7rem',
                                                    '& .MuiChip-label': { px: 0.5 },
                                                    backgroundColor: spreadPercentage < 0.1 ? '#2e7d32' : spreadPercentage < 0.5 ? '#ed6c02' : '#d32f2f',
                                                    color: '#ffffff'
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    )
}