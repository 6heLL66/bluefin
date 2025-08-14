# Система логирования Bluefin

## Обзор

Система логирования собирает детальную информацию о всех операциях в приложении, включая:

- WebSocket подключения и сообщения
- Создание и закрытие ордеров
- Обновления позиций
- Анализ спредов
- Системные события

## Компоненты

### 1. LogStore (store/logStore.ts)

Zustand стор для хранения и управления логами:

- Автоматическое ограничение до 1000 последних логов
- Уникальные ID для каждого лога
- Временные метки

### 2. useLogger Hook (hooks/useLogger.ts)

Удобный хук для логирования с предустановленными категориями:

- `logger.info()` - общая информация
- `logger.warning()` - предупреждения
- `logger.error()` - ошибки
- `logger.success()` - успешные операции
- `logger.websocket()` - WebSocket события
- `logger.order()` - операции с ордерами
- `logger.position()` - операции с позициями
- `logger.spread()` - анализ спредов
- `logger.custom()` - кастомные логи

### 3. LogsViewer (components/LogsViewer/index.tsx)

Компонент для отображения логов с возможностями:

- Фильтрация по категориям
- Фильтрация по Spread ID
- Фильтрация по Asset
- Поиск по тексту
- Красивое отображение с цветовой кодировкой
- Детальная информация в раскрывающихся блоках

## Категории логов

### WEBSOCKET

- Подключения/отключения
- Подписки на спреды
- Получение данных (bookTicker, orderUpdate)
- Ошибки подключения

### ORDER

- Создание ордеров
- Отмена ордеров
- Заполнение ордеров
- Расчеты цен и объемов

### POSITION

- Получение позиций
- Обновление позиций
- Анализ размеров позиций

### SPREAD

- Анализ спредов
- Расчеты для открытия/закрытия
- Условия создания ордеров
- Изменения состояния спредов

### SYSTEM

- Инициализация системы
- Очистка ресурсов
- Общие системные события

## Уровни логирования

- **INFO** - общая информация (синий)
- **WARNING** - предупреждения (желтый)
- **ERROR** - ошибки (красный)
- **SUCCESS** - успешные операции (зеленый)

## Использование

### В компонентах

```tsx
import { useLogger } from '../hooks/useLogger'

const MyComponent = () => {
  const logger = useLogger()

  const handleAction = () => {
    logger.info('Действие выполнено', {
      details: 'Дополнительная информация',
    })
  }

  return <div>...</div>
}
```

### В хуках

```tsx
import { useLogger } from '../hooks/useLogger'

export const useMyHook = () => {
  const logger = useLogger()

  const someFunction = async () => {
    try {
      logger.info('Начало операции')
      // ... логика
      logger.success('Операция завершена')
    } catch (error) {
      logger.error('Ошибка операции', { error: String(error) })
    }
  }

  return { someFunction }
}
```

## Фильтрация и поиск

В компоненте LogsViewer доступны следующие фильтры:

1. **Категория** - фильтр по типу события
2. **Spread ID** - фильтр по конкретному спреду
3. **Asset** - фильтр по торговому активу
4. **Поиск** - текстовый поиск по сообщениям и деталям

## Структура лога

```typescript
interface LogEntry {
  id: string // Уникальный ID
  timestamp: Date // Временная метка
  level: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS'
  category: 'WEBSOCKET' | 'ORDER' | 'POSITION' | 'SPREAD' | 'SYSTEM'
  message: string // Основное сообщение
  details?: Record<string, unknown> // Дополнительные данные
  spreadId?: string // ID спреда (если применимо)
  asset?: string // Торговый актив (если применимо)
}
```

## Примеры логов

### WebSocket подключение

```json
{
  "level": "INFO",
  "category": "WEBSOCKET",
  "message": "WebSocket подключен к Backpack Exchange",
  "details": {
    "url": "wss://ws.backpack.exchange"
  }
}
```

### Создание ордера

```json
{
  "level": "INFO",
  "category": "ORDER",
  "message": "Открытие ордера Backpack",
  "details": {
    "spreadId": "spread_123",
    "asset": "BTC",
    "price": 50000,
    "quantity": 0.1,
    "side": "BID"
  },
  "spreadId": "spread_123",
  "asset": "BTC"
}
```

### Анализ спреда

```json
{
  "level": "INFO",
  "category": "SPREAD",
  "message": "Анализ спреда для открытия позиции",
  "details": {
    "spreadId": "spread_123",
    "asset": "BTC",
    "actualSpread": 2.5,
    "openSpreadThreshold": 2.0,
    "canOpen": true
  },
  "spreadId": "spread_123",
  "asset": "BTC"
}
```

## Производительность

- Логи хранятся в памяти (не в localStorage)
- Автоматическое ограничение до 1000 логов
- Фильтрация происходит на клиенте для быстрого отклика
- Компонент LogsViewer оптимизирован для больших объемов данных

## Расширение

Для добавления новых категорий логов:

1. Обновите типы в `types.ts`
2. Добавьте новые методы в `useLogger` хук
3. Обновите компонент `LogsViewer` для поддержки новых категорий
4. Добавьте цветовую схему для новых категорий
