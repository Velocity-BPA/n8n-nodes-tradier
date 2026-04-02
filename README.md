# n8n-nodes-tradier

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

This n8n community node integrates with Tradier's trading and market data platform, providing access to 5 core resources including account management, order execution, market data retrieval, options trading, and watchlist management. The node enables automated trading workflows, portfolio monitoring, and comprehensive market analysis through Tradier's robust financial services API.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Trading](https://img.shields.io/badge/Trading-API-green)
![Market Data](https://img.shields.io/badge/Market%20Data-Real%20Time-orange)
![Options](https://img.shields.io/badge/Options-Trading-purple)

## Features

- **Account Management** - Access account details, positions, balances, and trading history
- **Order Execution** - Place, modify, and cancel equity and options orders with full lifecycle management
- **Real-Time Market Data** - Retrieve quotes, historical data, and market statistics for stocks and ETFs
- **Options Trading** - Complete options chain data, expiration dates, and strike price analysis
- **Watchlist Management** - Create, update, and monitor custom stock watchlists
- **Portfolio Tracking** - Monitor positions, gains/losses, and account performance metrics
- **Risk Management** - Built-in validation for order parameters and account limits
- **Comprehensive Error Handling** - Detailed error messages for trading and API-related issues

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-tradier`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-tradier
```

### Development Installation

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-tradier.git
cd n8n-nodes-tradier
npm install
npm run build
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-tradier
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| API Key | Your Tradier API access token | Yes |
| Environment | Select Sandbox or Production environment | Yes |
| Account ID | Your Tradier account identifier | Yes |

## Resources & Operations

### 1. Account

| Operation | Description |
|-----------|-------------|
| Get Profile | Retrieve user profile information and account details |
| Get Balances | Get account balances including buying power and cash |
| Get Positions | List all current positions in the account |
| Get Orders | Retrieve order history and status |
| Get Gainloss | Get realized and unrealized gains/losses |
| Get History | Access account transaction history |

### 2. Order

| Operation | Description |
|-----------|-------------|
| Place Order | Submit new equity or options orders |
| Preview Order | Preview order details before execution |
| Modify Order | Update existing pending orders |
| Cancel Order | Cancel pending orders |
| Get Order | Retrieve specific order details by ID |
| List Orders | Get all orders with filtering options |

### 3. MarketData

| Operation | Description |
|-----------|-------------|
| Get Quotes | Real-time and delayed quotes for stocks and ETFs |
| Get Historical | Historical price data with various timeframes |
| Get TimeSales | Intraday time and sales data |
| Get Clock | Market hours and trading calendar information |
| Get Calendar | Corporate events and earnings calendar |
| Search | Search for securities by symbol or company name |

### 4. Options

| Operation | Description |
|-----------|-------------|
| Get Chains | Complete options chains for underlying securities |
| Get Strikes | Available strike prices for options |
| Get Expirations | Options expiration dates |
| Get Lookup | Look up specific options contracts |
| Get Quotes | Real-time options quotes and Greeks |
| Get Historical | Historical options pricing data |

### 5. Watchlist

| Operation | Description |
|-----------|-------------|
| Get Watchlists | Retrieve all user watchlists |
| Get Watchlist | Get specific watchlist by ID |
| Create Watchlist | Create new watchlist |
| Update Watchlist | Modify existing watchlist |
| Delete Watchlist | Remove watchlist |
| Add Symbols | Add symbols to existing watchlist |
| Remove Symbols | Remove symbols from watchlist |

## Usage Examples

```javascript
// Get account balance and positions
{
  "resource": "account",
  "operation": "getBalances"
}

// Place a market order for 100 shares of AAPL
{
  "resource": "order",
  "operation": "placeOrder",
  "symbol": "AAPL",
  "side": "buy",
  "quantity": 100,
  "type": "market",
  "duration": "day"
}

// Get real-time quote for multiple symbols
{
  "resource": "marketData",
  "operation": "getQuotes",
  "symbols": "AAPL,MSFT,GOOGL",
  "greeks": false
}

// Retrieve options chain for SPY
{
  "resource": "options",
  "operation": "getChains",
  "symbol": "SPY",
  "expiration": "2024-01-19",
  "greeks": true
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Invalid API Key | Authentication failed with provided credentials | Verify API key and account permissions |
| Insufficient Funds | Order exceeds available buying power | Check account balance before placing orders |
| Invalid Symbol | Security symbol not found or invalid | Verify symbol format and market availability |
| Market Closed | Attempted operation during non-trading hours | Check market hours before trading operations |
| Order Rejected | Order parameters violate broker rules | Review order type, quantity, and price limits |
| Rate Limit Exceeded | Too many API requests in short timeframe | Implement request throttling and retry logic |

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Documentation is updated for new features
5. Commit messages are descriptive

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-tradier/issues)
- **Tradier API Documentation**: [Tradier Developer Docs](https://documentation.tradier.com/)
- **Tradier Community**: [Tradier Developer Forum](https://tradier.com/community)