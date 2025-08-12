# Portfolio Management Web Portal

A professional portfolio management web portal built with Flask (Python) backend, SQLite database, and modern HTML/CSS/JavaScript frontend. This application provides real-time access to investor data, portfolio allocations, and market information through an intuitive web interface.

## 🎯 Features

- **Professional UI/UX**: Modern, responsive design with professional styling
- **Real-time Data**: Dynamic data loading from SQLite database (no hardcoded data)
- **Interactive Navigation**: Left panel navigation with right panel data display
- **Search & Filter**: Real-time search functionality across all tables
- **Data Export**: Export filtered data to CSV format
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Live Statistics**: Header displays real-time record counts

## 📊 Data Tables

The application displays three main data tables:

1. **Investor Reference Data**: Complete investor profiles including demographics, risk profiles, and investment preferences
2. **Portfolio Current Allocation**: Real-time portfolio allocations across different asset classes
3. **Product Market Data**: Current market data for various investment products and securities

## 🏗️ Architecture

```
PortfolioRebalProject/
├── backend/
│   ├── app.py                 # Flask application with API routes
│   ├── database_setup.py      # Database initialization script
│   └── src/                   # Backend source files
├── frontend/
│   └── src/
│       ├── index.html         # Main application interface
│       ├── styles/
│       │   └── main.css       # Professional styling
│       └── components/
│           └── app.js         # Frontend JavaScript logic
├── database/                  # SQLite database location
├── requirements.txt           # Python dependencies
├── setup.py                   # Automated setup script
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites

- Python 3.7 or higher
- pip (Python package manager)
- Excel files: `InvestorRefData.xlsx`, `PortfoliosCurAllocation.xlsx`, `ProductMarketData.xlsx`

### Automated Setup

Run the automated setup script:

```bash
python setup.py
```

This will:
1. Check Python version compatibility
2. Install all required dependencies
3. Create the SQLite database
4. Load data from Excel files
5. Start the web application

### Manual Setup

If you prefer manual setup:

1. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Initialize Database:**
   ```bash
   cd backend
   python database_setup.py
   ```

3. **Start Application:**
   ```bash
   python app.py
   ```

4. **Access Application:**
   Open your web browser and navigate to: `http://localhost:5000`

## 💻 Usage

1. **Homepage**: Welcome screen with feature overview and statistics
2. **Navigation**: Click on any table link in the left sidebar:
   - "Investor Reference Data"
   - "Portfolio Current Allocation" 
   - "Product Market Data"
3. **Search**: Use the search box to filter data in real-time
4. **Export**: Click the "Export" button to download filtered data as CSV
5. **Refresh**: Use the "Refresh" button to reload current data

## 🛠️ Technical Details

### Backend (Flask)
- **Framework**: Flask 3.0.0 with CORS support
- **Database**: SQLite with automated Excel data import
- **API Endpoints**:
  - `GET /api/investor-data` - Investor reference data
  - `GET /api/portfolio-allocation` - Portfolio allocation data
  - `GET /api/product-market-data` - Market data
  - `GET /api/stats` - Database statistics

### Frontend
- **Styling**: Modern CSS with professional color scheme and typography
- **JavaScript**: Vanilla JavaScript with ES6 classes
- **Features**: Dynamic table generation, real-time search, CSV export
- **Icons**: Font Awesome 6.0 integration
- **Fonts**: Inter font family for professional appearance

### Database Schema

**investor_ref_data**
- 17 columns including user demographics, risk profiles, and investment preferences

**portfolios_cur_allocation** 
- 7 columns with current portfolio allocations across asset classes

**product_market_data**
- 7 columns containing market data for investment products

## 🎨 Design Features

- **Professional Color Scheme**: Modern gradient header with clean whites and grays
- **Responsive Layout**: Adapts to different screen sizes
- **Interactive Elements**: Hover effects, smooth transitions, and visual feedback
- **Typography**: Clean, readable fonts with proper hierarchy
- **Data Formatting**: Automatic currency, percentage, and date formatting
- **Loading States**: Professional loading spinners and empty states

## 🔧 Customization

### Adding New Tables
1. Add Excel file to project root
2. Update `database_setup.py` to include new table schema
3. Add API endpoint in `app.py`
4. Update navigation in `index.html`
5. Add table name mapping in `app.js`

### Styling Modifications
- Modify `frontend/src/styles/main.css` for visual changes
- Color scheme variables are defined at the top of CSS file
- Responsive breakpoints can be adjusted in media queries

## 🚨 Troubleshooting

**Common Issues:**

1. **Port 5000 already in use**: 
   - Change port in `app.py`: `app.run(port=5001)`

2. **Excel files not found**:
   - Ensure Excel files are in the project root directory
   - Check file names match exactly

3. **Database errors**:
   - Delete `database/portfolio_management.db` and re-run setup

4. **Package installation errors**:
   - Upgrade pip: `python -m pip install --upgrade pip`
   - Use virtual environment: `python -m venv venv`

## 📄 License

This project is for portfolio management demonstration purposes. Please ensure you have appropriate licenses for any production use.

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify all Excel files are present and properly formatted
3. Ensure Python 3.7+ is installed
4. Check console output for specific error messages

---

**Built with ❤️ for professional portfolio management** 