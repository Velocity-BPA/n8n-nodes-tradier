# n8n-nodes-tradier

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for the Tradier brokerage API, providing complete integration with account management, equity and options trading, real-time market data, streaming capabilities, and watchlist operations.

![n8n](https://img.shields.io/badge/n8n-community%20node-orange)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)

## Features

- **Account Management**: Profile, balances, positions, order history, and gain/loss reporting
- **Equity Trading**: Full support for buy, sell, short selling, and buy-to-cover orders
- **Options Trading**: Complete options trading with buy/sell to open/close support
- **Complex Orders**: Multi-leg strategies, OTO (One-Triggers-Other), OCO (One-Cancels-Other), and OTOCO orders
- **Market Data**: Real-time quotes, historical data, option chains, and time & sales
- **Fundamentals**: Company information, financial ratios, dividends, and corporate calendars
- **Watchlists**: Full CRUD operations for managing symbol watchlists
- **Streaming**: Market data and account event streaming sessions
- **Triggers**: 8 polling-based trigger types for automated workflows

## Installation

### Community Nodes (Recommended)

1. Open your n8n instance
2. Go to **Settings** > **Community Nodes**
3. Select **Install**
4. Enter `n8n-nodes-tradier` and click **Install**

### Manual Installation

```bash
# Navigate to your n8n installation directory
cd ~/.n8n

# Install the package
npm install n8n-nodes-tradier

# Restart n8n
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-tradier.git
cd n8n-nodes-tradier

# Install dependencies
npm install

# Build the project
npm run build

# Create symlink to n8n custom nodes
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-tradier

# Restart n8n
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| Access Token | Your Tradier API access token | Yes |
| Environment | `production` or `sandbox` | Yes |
| Account ID | Your Tradier account number | Yes |

To obtain credentials:
1. Create a Tradier account at [tradier.com](https://tradier.com)
2. Go to API Management in your account settings
3. Generate an access token
4. Note your account ID from the Account Overview page

## Resources & Operations

### Account

| Operation | Description |
|-----------|-------------|
| Get Profile | Retrieve user profile information |
| Get Balances | Get account balance details |
| Get Positions | List current positions |
| Get History | Retrieve account transaction history |
| Get Orders | List account orders with status filtering |
| Get Gain/Loss | Get closed position gain/loss data |

### Trading

| Operation | Description |
|-----------|-------------|
| Place Equity Order | Submit stock orders (market, limit, stop, stop-limit) |
| Place Option Order | Submit single-leg option orders |
| Place Multileg Order | Submit multi-leg option strategies |
| Place OTO Order | One-Triggers-Other conditional orders |
| Place OCO Order | One-Cancels-Other bracket orders |
| Place OTOCO Order | Combined OTO + OCO orders |
| Get Order | Retrieve specific order details |
| Modify Order | Update pending order parameters |
| Cancel Order | Cancel an open order |
| Preview Order | Validate order without execution |

### Market Data

| Operation | Description |
|-----------|-------------|
| Get Quotes | Real-time quotes for symbols |
| Get History | Historical OHLCV data |
| Get Option Chain | Option chain with Greeks |
| Get Option Expirations | Available expiration dates |
| Get Option Strikes | Strike prices for expiration |
| Get Time & Sales | Tick-level trade data |
| Get Clock | Market clock status |
| Get Calendar | Market/options calendar |
| Lookup Symbols | Search for symbols |

### Fundamentals

| Operation | Description |
|-----------|-------------|
| Get Company Info | Company profile and details |
| Get Corporate Calendars | Earnings and events calendar |
| Get Dividends | Dividend history and forecasts |
| Get Financial Ratios | Key financial metrics |
| Get Corporate Actions | Splits, mergers, etc. |

### Watchlists

| Operation | Description |
|-----------|-------------|
| Get All | List all watchlists |
| Get | Get specific watchlist |
| Create | Create new watchlist |
| Update | Update watchlist name |
| Delete | Delete watchlist |
| Add Symbols | Add symbols to watchlist |
| Remove Symbols | Remove symbols from watchlist |

### Streaming

| Operation | Description |
|-----------|-------------|
| Create Session | Create market data streaming session |
| Create Events Session | Create account events streaming session |

### Utility

| Operation | Description |
|-----------|-------------|
| Parse OCC Symbol | Parse option symbol into components |
| Build OCC Symbol | Construct option symbol from parts |

## Trigger Node

The Tradier Trigger node provides 8 event types for automated workflows:

| Trigger Type | Description |
|--------------|-------------|
| New Order | Fires when a new order is detected |
| Order Filled | Fires when an order is filled |
| Order Canceled | Fires when an order is canceled |
| Position Change | Fires when positions change |
| Balance Change | Fires when account balance changes |
| Price Alert | Fires when price crosses threshold |
| Market Open | Fires when market opens |
| Market Close | Fires when market closes |

## Usage Examples

### Get Account Balances

```json
{
  "nodes": [
    {
      "name": "Tradier",
      "type": "n8n-nodes-tradier.Tradier",
      "parameters": {
        "resource": "account",
        "operation": "getBalances"
      }
    }
  ]
}
```

### Place a Limit Order

```json
{
  "nodes": [
    {
      "name": "Tradier",
      "type": "n8n-nodes-tradier.Tradier",
      "parameters": {
        "resource": "trading",
        "operation": "placeEquityOrder",
        "symbol": "AAPL",
        "side": "buy",
        "quantity": 10,
        "orderType": "limit",
        "price": 150.00,
        "duration": "day"
      }
    }
  ]
}
```

### Get Real-Time Quotes

```json
{
  "nodes": [
    {
      "name": "Tradier",
      "type": "n8n-nodes-tradier.Tradier",
      "parameters": {
        "resource": "marketData",
        "operation": "getQuotes",
        "symbols": "AAPL,MSFT,GOOGL"
      }
    }
  ]
}
```

## Trading Concepts

### Order Types

- **Market**: Execute immediately at current market price
- **Limit**: Execute at specified price or better
- **Stop**: Trigger market order when stop price is reached
- **Stop Limit**: Trigger limit order when stop price is reached

### Order Duration

- **Day**: Valid for current trading day only
- **GTC**: Good Till Canceled - remains active until filled or canceled
- **Pre**: Pre-market session order
- **Post**: Post-market session order

### Complex Order Types

- **OTO (One-Triggers-Other)**: Secondary order triggered when primary fills
- **OCO (One-Cancels-Other)**: Two orders where filling one cancels the other
- **OTOCO**: Combination of OTO and OCO for advanced strategies

### OCC Option Symbol Format

Option symbols follow the OCC standard format:
```
AAPL240119C00150000
│    │     │ │
│    │     │ └── Strike price × 1000 (8 digits)
│    │     └──── C = Call, P = Put
│    └────────── Expiration YYMMDD
└─────────────── Underlying symbol (1-6 chars)
```

Example: `AAPL240119C00150000` = AAPL January 19, 2024 $150 Call

## Error Handling

The node includes comprehensive error handling:

- API authentication errors with clear messages
- Rate limiting detection with retry guidance
- Market hours validation
- Order validation before submission
- Graceful handling of null/empty responses

Enable "Continue On Fail" to process multiple items even if some fail.

## Security Best Practices

1. **Never share your access token** - Store securely in n8n credentials
2. **Use sandbox environment** for testing before production
3. **Set appropriate order limits** to prevent accidental large trades
4. **Monitor workflows** with the trigger node for unexpected activity
5. **Enable 2FA** on your Tradier account

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint
npm run lint

# Fix lint issues
npm run lint:fix

# Format code
npm run format
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
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-tradier/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Velocity-BPA/n8n-nodes-tradier/discussions)
- **Tradier API Docs**: [developer.tradier.com](https://documentation.tradier.com/)

## Acknowledgments

- [Tradier](https://tradier.com) for providing the brokerage API
- [n8n](https://n8n.io) for the workflow automation platform
- The n8n community for inspiration and best practices
