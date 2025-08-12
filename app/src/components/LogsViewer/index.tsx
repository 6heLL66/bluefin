import React, { useState, useMemo } from 'react'
import { useLogStore } from '../../store/logStore'
import { LogEntry } from '../../types'
import { FixedSizeList as List } from 'react-window'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  Grid,
  IconButton,
  Collapse,
  Divider,
  Stack,
  Alert,
  Tooltip
} from '@mui/material'
import {
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'

const LogsViewer = () => {
  const { logs, clearLogs } = useLogStore()
  const [selectedCategory, setSelectedCategory] = useState<LogEntry['category'] | 'ALL'>('ALL')
  const [selectedSpread, setSelectedSpread] = useState<string>('ALL')
  const [selectedAsset, setSelectedAsset] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())

  const categories = ['ALL', 'WEBSOCKET', 'ORDER', 'POSITION', 'SPREAD', 'SYSTEM']
  
  const uniqueSpreads = useMemo(() => {
    const spreadIds = [...new Set(logs.map(log => log.spreadId).filter(Boolean))]
    return ['ALL', ...spreadIds]
  }, [logs])
  
  const uniqueAssets = useMemo(() => {
    const assets = [...new Set(logs.map(log => log.asset).filter(Boolean))]
    return ['ALL', ...assets]
  }, [logs])

  const filteredLogs = useMemo(() => {
    let filtered = logs

    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(log => log.category === selectedCategory)
    }

    if (selectedSpread !== 'ALL') {
      filtered = filtered.filter(log => log.spreadId === selectedSpread)
    }

    if (selectedAsset !== 'ALL') {
      filtered = filtered.filter(log => log.asset === selectedAsset)
    }

    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details && JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }, [logs, selectedCategory, selectedSpread, selectedAsset, searchTerm])

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'ERROR': return <ErrorIcon color="error" />
      case 'WARNING': return <WarningIcon color="warning" />
      case 'SUCCESS': return <CheckCircleIcon color="success" />
      default: return <InfoIcon color="info" />
    }
  }

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'ERROR': return 'error'
      case 'WARNING': return 'warning'
      case 'SUCCESS': return 'success'
      default: return 'info'
    }
  }

  const getCategoryColor = (category: LogEntry['category']) => {
    switch (category) {
      case 'WEBSOCKET': return 'secondary'
      case 'ORDER': return 'primary'
      case 'POSITION': return 'success'
      case 'SPREAD': return 'warning'
      case 'SYSTEM': return 'default'
      default: return 'default'
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const toggleLogExpansion = (logId: string) => {
    const newExpanded = new Set(expandedLogs)
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId)
    } else {
      newExpanded.add(logId)
    }
    setExpandedLogs(newExpanded)
  }

  const LogRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const log = filteredLogs[index]
    
    return (
      <div style={style}>
        <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden', m: 1 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Tooltip title={log.level}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getLevelIcon(log.level)}
                  </Box>
                </Tooltip>
                
                <Chip
                  label={log.level}
                  color={getLevelColor(log.level)}
                  size="small"
                  variant="outlined"
                />
                
                <Chip
                  label={log.category}
                  color={getCategoryColor(log.category)}
                  size="small"
                  variant="outlined"
                />
                
                {log.spreadId && (
                  <Chip
                    label={`Spread: ${log.spreadId}`}
                    color="secondary"
                    size="small"
                    variant="outlined"
                  />
                )}
                
                {log.asset && (
                  <Chip
                    label={log.asset}
                    color="info"
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
              
              <Typography variant="caption" color="text.secondary">
                {formatTimestamp(log.timestamp)}
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.primary" sx={{ mb: 2, lineHeight: 1.6 }}>
              {log.message}
            </Typography>
            
            {log.details && Object.keys(log.details).length > 0 && (
              <Box>
                <Button
                  size="small"
                  onClick={() => toggleLogExpansion(log.id)}
                  endIcon={expandedLogs.has(log.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  sx={{ mb: 1 }}
                >
                  Детали
                </Button>
                
                <Collapse in={expandedLogs.has(log.id)}>
                  <Paper elevation={1} sx={{ p: 2, backgroundColor: 'grey.100' }}>
                    <Typography
                      component="pre"
                      variant="caption"
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        overflow: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}
                    >
                      {JSON.stringify(log.details, null, 2)}
                    </Typography>
                  </Paper>
                </Collapse>
              </Box>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Box sx={{ p: 3, maxHeight: '100vh', overflow: 'hidden' }}>
      <Card elevation={3} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Система логирования
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                label={`Всего логов: ${logs.length}`}
                variant="outlined"
                color="primary"
                icon={<InfoIcon />}
              />
              <Button
                variant="contained"
                color="error"
                startIcon={<ClearIcon />}
                onClick={clearLogs}
                sx={{ borderRadius: 2, px: 3, py: 1.5 }}
              >
                Очистить логи
              </Button>
            </Box>
          </Box>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Категория</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Категория"
                  onChange={(e) => setSelectedCategory(e.target.value as LogEntry['category'] | 'ALL')}
                  sx={{ borderRadius: 2 }}
                >
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Spread ID</InputLabel>
                <Select
                  value={selectedSpread}
                  label="Spread ID"
                  onChange={(e) => setSelectedSpread(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  {uniqueSpreads.map(spread => (
                    <MenuItem key={spread} value={spread}>{spread}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Asset</InputLabel>
                <Select
                  value={selectedAsset}
                  label="Asset"
                  onChange={(e) => setSelectedAsset(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  {uniqueAssets.map(asset => (
                    <MenuItem key={asset} value={asset}>{asset}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Поиск"
                placeholder="Поиск по сообщениям..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
          </Grid>

          <Box sx={{ height: '60vh' }}>
            {filteredLogs.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  Логи не найдены
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Попробуйте изменить параметры фильтрации
                </Typography>
              </Box>
            ) : (
              <List
                height={600}
                itemCount={filteredLogs.length}
                itemSize={200}
                width="100%"
                itemData={filteredLogs}
              >
                {LogRow}
              </List>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default LogsViewer 