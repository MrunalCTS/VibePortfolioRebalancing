import sqlite3
import pandas as pd
import os


def create_database():
    """Create SQLite database and tables based on Excel files"""
    
    # Determine the correct path to database
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_dir = os.path.join(base_path, 'database')
    
    # Create database directory if it doesn't exist
    os.makedirs(db_dir, exist_ok=True)
    
    # Connect to SQLite database
    db_path = os.path.join(db_dir, 'portfolio_management.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Drop existing tables if they exist
    cursor.execute('DROP TABLE IF EXISTS investor_ref_data')
    cursor.execute('DROP TABLE IF EXISTS portfolios_cur_allocation')
    cursor.execute('DROP TABLE IF EXISTS product_market_data')
    cursor.execute('DROP TABLE IF EXISTS MasterAllocationModel')
    cursor.execute('DROP TABLE IF EXISTS user_holdings')
    cursor.execute('DROP TABLE IF EXISTS funds_universe')
    cursor.execute('DROP TABLE IF EXISTS rebalancing_scenarios')


    cursor.execute('''
        CREATE TABLE investor_ref_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            full_name TEXT NOT NULL,
            age INTEGER,
            city TEXT,
            risk_capacity TEXT,
            spending_score TEXT,
            annual_income REAL,
            investor_category TEXT,
            asset_allocation_model TEXT,
            equities_percent REAL,
            bonds_percent REAL,
            cash_percent REAL,
            alternatives_percent REAL,
            investment_preference_sectors TEXT,
            rebalancing_frequency TEXT,
            last_rebalancing_date DATE,
            variation_limit REAL
        )
    ''')
    
    # Create PortfoliosCurAllocation table
    cursor.execute('''
        CREATE TABLE portfolios_cur_allocation (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            full_name TEXT NOT NULL,
            total_investment_amount REAL,
            equities_percent REAL,
            bonds_percent REAL,
            cash_percent REAL,
            alternatives_percent REAL
        )
    ''')
    
    # Create ProductMarketData table
    cursor.execute('''
        CREATE TABLE product_market_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            investment_type TEXT,
            industry_sector TEXT,
            market_segment TEXT,
            investment_strategies TEXT,
            investment_product TEXT,
            symbol TEXT,
            market_price_usd REAL
        )
    ''')
    
    # Create MasterAllocationModel table
    cursor.execute('''
        CREATE TABLE MasterAllocationModel (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT,
            model_no INTEGER,
            model_type TEXT,
            model_desc TEXT,
            equities REAL,
            domestic_equities REAL,
            emerging_market REAL,
            bonds REAL,
            cash_cash_equivalents REAL,
            alternative_investments REAL
        )
    ''')
    
    # Create User Holdings table
    cursor.execute('''
        CREATE TABLE user_holdings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            fund_symbol TEXT NOT NULL,
            fund_name TEXT NOT NULL,
            asset_class TEXT NOT NULL,
            units_held REAL NOT NULL,
            current_price REAL NOT NULL,
            invested_amount REAL NOT NULL,
            current_value REAL NOT NULL,
            return_percent REAL,
            performance_rating TEXT,
            risk_rating TEXT,
            expense_ratio REAL,
            last_updated DATE DEFAULT CURRENT_DATE
        )
    ''')
    
    # Create Funds Universe table
    cursor.execute('''
        CREATE TABLE funds_universe (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fund_symbol TEXT UNIQUE NOT NULL,
            fund_name TEXT NOT NULL,
            asset_class TEXT NOT NULL,
            category TEXT,
            fund_manager TEXT,
            current_price REAL NOT NULL,
            returns_1year REAL,
            returns_3year REAL,
            returns_5year REAL,
            expense_ratio REAL,
            risk_rating TEXT,
            performance_rating TEXT,
            min_investment REAL DEFAULT 1000,
            is_recommended BOOLEAN DEFAULT 0,
            sector_focus TEXT,
            market_cap_focus TEXT
        )
    ''')
    
    # Create Rebalancing Scenarios table
    cursor.execute('''
        CREATE TABLE rebalancing_scenarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            scenario_name TEXT NOT NULL,
            asset_class TEXT NOT NULL,
            action_type TEXT NOT NULL,
            sell_fund_symbol TEXT,
            sell_amount REAL,
            buy_fund_symbol TEXT,
            buy_amount REAL,
            expected_return REAL,
            risk_score INTEGER,
            scenario_desc TEXT,
            created_date DATE DEFAULT CURRENT_DATE
        )
    ''')
    
    print("Tables created successfully!")
    
    # Load data from Excel files
    try:
        # Determine the correct path to Excel files
        base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        
        print("Loading investor reference data...")
        # Load InvestorRefData
        investor_file = os.path.join(base_path, 'InvestorRefData.xlsx')
        if os.path.exists(investor_file):
            df_investor = pd.read_excel(investor_file)
            # Map Excel columns to database columns
            df_investor.columns = [
                'user_id', 'full_name', 'age', 'city', 'risk_capacity', 'spending_score',
                'annual_income', 'investor_category', 'asset_allocation_model', 
                'equities_percent', 'bonds_percent', 'cash_percent', 'alternatives_percent',
                'investment_preference_sectors', 'rebalancing_frequency', 
                'last_rebalancing_date', 'variation_limit'
            ]
            
            # Update with target allocations that differ from current market-driven allocations
            target_allocation_data = [
                ('USR000012', 'John Anderson', 35, 'New York', 'High', 'High', 125000.0, 'Growth', 'Aggressive Growth', 60.0, 25.0, 10.0, 5.0, 'Technology,Healthcare', 'Quarterly', '2024-01-15', 5.0),
                ('USR000001', 'Sarah Williams', 42, 'San Francisco', 'Medium', 'Medium', 95000.0, 'Balanced', 'Moderate Growth', 50.0, 30.0, 15.0, 5.0, 'Technology,Finance', 'Semi-Annual', '2024-03-20', 7.0),
                ('USR000020', 'Michael Chen', 55, 'Chicago', 'Low', 'Low', 85000.0, 'Conservative', 'Income Focus', 35.0, 55.0, 10.0, 0.0, 'Utilities,Consumer Staples', 'Annual', '2023-12-01', 3.0),
                ('USR000015', 'Emma Thompson', 28, 'Austin', 'Very High', 'High', 110000.0, 'Aggressive', 'High Growth', 70.0, 20.0, 5.0, 5.0, 'Technology,Biotech', 'Monthly', '2024-04-10', 8.0),
                ('USR000025', 'David Rodriguez', 48, 'Boston', 'Medium', 'Medium', 105000.0, 'Balanced', 'Moderate', 40.0, 45.0, 12.0, 3.0, 'Diversified', 'Quarterly', '2024-02-28', 4.0),
                ('USR000003', 'Jennifer Lee', 39, 'Seattle', 'Medium', 'High', 115000.0, 'Growth', 'Moderate Growth', 55.0, 35.0, 8.0, 2.0, 'Technology,Real Estate', 'Quarterly', '2024-01-30', 6.0),
                ('USR000007', 'Robert Johnson', 52, 'Miami', 'Low', 'Medium', 78000.0, 'Conservative', 'Income Focus', 30.0, 60.0, 10.0, 0.0, 'Bonds,Utilities', 'Annual', '2023-11-15', 2.5),
                ('USR000009', 'Lisa Wang', 31, 'Los Angeles', 'High', 'High', 135000.0, 'Aggressive', 'High Growth', 75.0, 15.0, 5.0, 5.0, 'Technology,Energy', 'Monthly', '2024-04-01', 9.0),
                ('USR000011', 'Mark Thompson', 44, 'Denver', 'Medium', 'Medium', 98000.0, 'Balanced', 'Moderate', 45.0, 40.0, 12.0, 3.0, 'Healthcare,Finance', 'Semi-Annual', '2024-02-15', 5.5),
                ('USR000013', 'Amanda Davis', 36, 'Portland', 'High', 'Medium', 108000.0, 'Growth', 'Moderate Growth', 65.0, 25.0, 7.0, 3.0, 'Technology,Consumer', 'Quarterly', '2024-03-10', 7.5)
            ]
            
            # Create DataFrame from target allocation data
            df_investor_updated = pd.DataFrame(target_allocation_data, columns=[
                'user_id', 'full_name', 'age', 'city', 'risk_capacity', 'spending_score',
                'annual_income', 'investor_category', 'asset_allocation_model', 
                'equities_percent', 'bonds_percent', 'cash_percent', 'alternatives_percent',
                'investment_preference_sectors', 'rebalancing_frequency', 
                'last_rebalancing_date', 'variation_limit'
            ])
            
            df_investor_updated.to_sql('investor_ref_data', conn, if_exists='append', index=False)
            print(f"✅ Loaded {len(df_investor_updated)} records into investor_ref_data with target allocations")
        else:
            print("⚠️ InvestorRefData.xlsx not found, using sample data only")
        
        print("Loading portfolio allocation data...")
        # Load PortfoliosCurAllocation  
        portfolio_file = os.path.join(base_path, 'PortfoliosCurAllocation.xlsx')
        if os.path.exists(portfolio_file):
            # We'll use our custom data instead of Excel file
            pass
            
        # Update with realistic market-driven allocation imbalances
        market_impact_data = [
            # USR000012 - Tech heavy, bonds underweight due to market movements
            ('USR000012', 'John Anderson', 65900.0, 72.5, 18.2, 2.8, 6.5),  # Target: 60/25/10/5 → Actual: 72.5/18.2/2.8/6.5
            ('USR000001', 'Sarah Williams', 30887.5, 51.8, 33.8, 8.2, 14.2),  # Target: 50/30/15/5 → Actual: 51.8/33.8/8.2/14.2 (minor drift)
            ('USR000020', 'Michael Chen', 31287.5, 33.6, 56.8, 9.6, 0.0),    # Target: 35/55/10/0 → Actual: 33.6/56.8/9.6/0 (well balanced)
            ('USR000015', 'Emma Thompson', 22372.0, 61.4, 23.3, 0.0, 15.3),  # Target: 70/20/5/5 → Actual: 61.4/23.3/0/15.3 (needs rebalancing)
            ('USR000025', 'David Rodriguez', 45000.0, 40.2, 44.8, 12.0, 3.0), # Target: 40/45/12/3 → Actual: 40.2/44.8/12/3 (perfectly balanced)
            ('USR000003', 'Jennifer Lee', 58750.0, 58.2, 32.8, 6.5, 2.5),     # Target: 55/35/8/2 → Actual: 58.2/32.8/6.5/2.5 (slight equity overweight)
            ('USR000007', 'Robert Johnson', 39000.0, 28.5, 62.3, 9.2, 0.0),   # Target: 30/60/10/0 → Actual: 28.5/62.3/9.2/0 (conservative)
            ('USR000009', 'Lisa Wang', 67500.0, 78.8, 12.5, 3.7, 5.0),       # Target: 75/15/5/5 → Actual: 78.8/12.5/3.7/5 (aggressive growth)
            ('USR000011', 'Mark Thompson', 49000.0, 47.3, 38.2, 11.5, 3.0),   # Target: 45/40/12/3 → Actual: 47.3/38.2/11.5/3 (balanced)
            ('USR000013', 'Amanda Davis', 54000.0, 67.8, 23.5, 6.2, 2.5)      # Target: 65/25/7/3 → Actual: 67.8/23.5/6.2/2.5 (growth oriented)
        ]
        
        # Create DataFrame from market impact data
        df_portfolio_updated = pd.DataFrame(market_impact_data, columns=[
            'user_id', 'full_name', 'total_investment_amount',
            'equities_percent', 'bonds_percent', 'cash_percent', 'alternatives_percent'
        ])
        
        df_portfolio_updated.to_sql('portfolios_cur_allocation', conn, if_exists='append', index=False)
        print(f"✅ Loaded {len(df_portfolio_updated)} records into portfolios_cur_allocation with market-driven imbalances")
        
        print("Loading product market data...")
        # Load ProductMarketData
        product_file = os.path.join(base_path, 'ProductMarketData.xlsx')
        if os.path.exists(product_file):
            df_product = pd.read_excel(product_file)
            # Map Excel columns to database columns
            df_product.columns = [
                'investment_type', 'industry_sector', 'market_segment',
                'investment_strategies', 'investment_product', 'symbol', 'market_price_usd'
            ]
            df_product.to_sql('product_market_data', conn, if_exists='append', index=False)
            print(f"✅ Loaded {len(df_product)} records into product_market_data")
        else:
            print("⚠️ ProductMarketData.xlsx not found, skipping")
        
        print("Loading master allocation model...")
        # Load MasterAllocationModel
        master_file = os.path.join(base_path, 'MasterAllocationModel.xlsx')
        if os.path.exists(master_file):
            df_master = pd.read_excel(master_file)
            # Map Excel columns to database columns (convert to snake_case for consistency)
            df_master.columns = [
                'category', 'model_no', 'model_type', 'model_desc', 'equities',
                'domestic_equities', 'emerging_market', 'bonds', 'cash_cash_equivalents', 'alternative_investments'
            ]
            df_master.to_sql('MasterAllocationModel', conn, if_exists='append', index=False)
            print(f"✅ Loaded {len(df_master)} records into MasterAllocationModel")
        else:
            print("⚠️ MasterAllocationModel.xlsx not found, skipping")
        
        print("Loading funds universe...")
        # Insert sample funds universe data - Enhanced with more variety for better rebalancing scenarios
        sample_funds = [
            # High-performing recommended funds (for BUY recommendations)
            ('VFIAX', 'Vanguard 500 Index Fund', 'Equity', 'Large Cap Index', 'Vanguard', 420.50, 12.5, 14.2, 13.8, 0.04, 'Low', 'Excellent', 3000, 1, 'Diversified', 'Large Cap'),
            ('VTSMX', 'Vanguard Total Stock Market Index', 'Equity', 'Total Market Index', 'Vanguard', 115.25, 11.8, 13.5, 12.9, 0.03, 'Low', 'Excellent', 3000, 1, 'Diversified', 'All Cap'),
            ('QQQ', 'Invesco QQQ Trust ETF', 'Equity', 'Technology Index', 'Invesco', 378.25, 15.8, 18.2, 16.5, 0.20, 'Medium', 'Excellent', 1, 1, 'Technology', 'Large Cap'),
            ('VTI', 'Vanguard Total Stock Market ETF', 'Equity', 'Total Market Index', 'Vanguard', 245.80, 12.3, 14.1, 13.2, 0.03, 'Low', 'Excellent', 1, 1, 'Diversified', 'All Cap'),
            ('SPY', 'SPDR S&P 500 ETF Trust', 'Equity', 'Large Cap Index', 'State Street', 528.75, 12.8, 14.1, 13.5, 0.09, 'Low', 'Excellent', 1, 1, 'Diversified', 'Large Cap'),
            ('MSFT', 'Microsoft Corporation', 'Equity', 'Technology Stock', 'Individual Stock', 415.26, 28.5, 22.8, 18.9, 0.00, 'Medium', 'Excellent', 1, 1, 'Technology', 'Large Cap'),
            ('AAPL', 'Apple Inc.', 'Equity', 'Technology Stock', 'Individual Stock', 189.84, 22.1, 19.5, 17.2, 0.00, 'Medium', 'Excellent', 1, 1, 'Technology', 'Large Cap'),
            ('NVDA', 'NVIDIA Corporation', 'Equity', 'Technology Stock', 'Individual Stock', 875.32, 45.2, 52.8, 38.5, 0.00, 'High', 'Excellent', 1, 1, 'Technology', 'Large Cap'),
            
            # Bond funds for diversification
            ('FXNAX', 'Fidelity US Bond Index Fund', 'Bond', 'Government Bond', 'Fidelity', 11.85, 2.1, 3.2, 4.1, 0.025, 'Very Low', 'Good', 1, 1, 'Government', ''),
            ('VTEB', 'Vanguard Tax-Exempt Bond ETF', 'Bond', 'Municipal Bond', 'Vanguard', 52.15, 3.8, 4.2, 4.5, 0.05, 'Low', 'Good', 1, 1, 'Municipal', ''),
            ('BND', 'Vanguard Total Bond Market ETF', 'Bond', 'Total Bond Market', 'Vanguard', 78.45, 1.9, 2.8, 3.5, 0.03, 'Very Low', 'Good', 1, 1, 'Diversified', ''),
            
            # International exposure
            ('VTIAX', 'Vanguard Total International Stock Index', 'Equity', 'International Index', 'Vanguard', 28.75, 8.9, 9.2, 7.8, 0.11, 'Medium', 'Good', 3000, 1, 'International', 'All Cap'),
            ('VXUS', 'Vanguard Total International Stock ETF', 'Equity', 'International Index', 'Vanguard', 58.92, 9.2, 8.8, 7.5, 0.08, 'Medium', 'Good', 1, 1, 'International', 'All Cap'),
            ('EFA', 'iShares MSCI EAFE ETF', 'Equity', 'Developed Markets', 'BlackRock', 78.65, 7.8, 8.1, 6.9, 0.32, 'Medium', 'Good', 1, 0, 'International', 'Large Cap'),
            
            # Poor performing funds (for SELL recommendations)
            ('ARKK', 'ARK Innovation ETF', 'Equity', 'Innovation Growth', 'ARK Invest', 45.25, -12.5, 8.2, 15.8, 0.75, 'Very High', 'Poor', 1, 0, 'Technology', 'Growth'),
            ('ARKF', 'ARK Fintech Innovation ETF', 'Equity', 'Fintech Growth', 'ARK Invest', 18.75, -18.3, 5.1, 12.2, 0.75, 'Very High', 'Poor', 1, 0, 'Financial Technology', 'Growth'),
            ('ARKG', 'ARK Genomics Revolution ETF', 'Equity', 'Genomics Growth', 'ARK Invest', 22.85, -25.8, 2.8, 18.5, 0.75, 'Very High', 'Poor', 1, 0, 'Healthcare', 'Growth'),
            ('SPCE', 'Virgin Galactic Holdings Inc', 'Equity', 'Aerospace Stock', 'Individual Stock', 3.45, -75.2, -45.8, -82.5, 0.00, 'Very High', 'Poor', 1, 0, 'Aerospace', 'Small Cap'),
            ('PLTR', 'Palantir Technologies Inc', 'Equity', 'Data Analytics Stock', 'Individual Stock', 28.95, -15.8, 45.2, 0.0, 0.00, 'Very High', 'Below Average', 1, 0, 'Technology', 'Large Cap'),
            ('COIN', 'Coinbase Global Inc', 'Equity', 'Cryptocurrency Stock', 'Individual Stock', 195.42, -22.5, 0.0, 0.0, 0.00, 'Very High', 'Below Average', 1, 0, 'Financial Services', 'Large Cap'),
            
            # Underperforming sector ETFs
            ('VDE', 'Vanguard Energy ETF', 'Alternative', 'Energy Sector', 'Vanguard', 85.30, 15.2, 2.1, 6.8, 0.10, 'High', 'Below Average', 1, 0, 'Energy', 'All Cap'),
            ('XLE', 'Energy Select Sector SPDR Fund', 'Alternative', 'Energy Sector', 'State Street', 89.45, 12.8, 1.5, 5.2, 0.10, 'High', 'Below Average', 1, 0, 'Energy', 'All Cap'),
            ('GDX', 'VanEck Vectors Gold Miners ETF', 'Alternative', 'Gold Mining', 'VanEck', 28.65, -8.5, -5.2, 2.1, 0.52, 'Very High', 'Below Average', 1, 0, 'Precious Metals', 'All Cap'),
            ('SLV', 'iShares Silver Trust', 'Alternative', 'Silver Commodity', 'BlackRock', 22.15, -12.8, -2.5, 1.8, 0.50, 'High', 'Below Average', 1, 0, 'Precious Metals', ''),
            
            # Average performing options
            ('VMOT', 'Vanguard Short-Term Inflation-Protected Securities ETF', 'Bond', 'TIPS', 'Vanguard', 49.85, 1.5, 2.8, 3.2, 0.06, 'Very Low', 'Average', 1, 0, 'Inflation Protected', ''),
            ('VNQ', 'Vanguard Real Estate Index Fund ETF', 'Alternative', 'REIT Index', 'Vanguard', 92.40, 8.5, 7.8, 9.2, 0.12, 'Medium', 'Average', 1, 1, 'Real Estate', ''),
            ('IWM', 'iShares Russell 2000 ETF', 'Equity', 'Small Cap Index', 'BlackRock', 198.75, 3.2, 8.5, 7.8, 0.19, 'High', 'Average', 1, 0, 'Diversified', 'Small Cap'),
            
            # Cash equivalents
            ('VMMXX', 'Vanguard Federal Money Market Fund', 'Cash', 'Money Market', 'Vanguard', 1.00, 5.2, 2.1, 1.8, 0.11, 'Very Low', 'Good', 3000, 0, 'Cash Equivalent', ''),
            ('VMFXX', 'Vanguard Treasury Money Market Fund', 'Cash', 'Treasury Money Market', 'Vanguard', 1.00, 5.1, 1.9, 1.6, 0.09, 'Very Low', 'Good', 3000, 0, 'Treasury', ''),
            ('BIL', 'SPDR Bloomberg Barclays 1-3 Month T-Bill ETF', 'Cash', '1-3 Month T-Bills', 'State Street', 91.45, 5.1, 1.8, 1.5, 0.13, 'Very Low', 'Good', 1, 0, 'Treasury', '')
        ]
        
        cursor.executemany('''
            INSERT INTO funds_universe (fund_symbol, fund_name, asset_class, category, fund_manager, 
                                      current_price, returns_1year, returns_3year, returns_5year, 
                                      expense_ratio, risk_rating, performance_rating, min_investment, 
                                      is_recommended, sector_focus, market_cap_focus)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', sample_funds)
        
        print(f"✅ Loaded {len(sample_funds)} records into funds_universe")
        
        print("Loading user holdings with realistic performance data...")
        # Insert sample user holdings for demonstration - Enhanced with more variety for better rebalancing scenarios
        sample_holdings = [
            # USR000012 - Portfolio significantly out of balance due to tech growth and bond decline
            ('USR000012', 'ARKK', 'ARK Innovation ETF', 'Equity', 50.0, 45.25, 3000.0, 2262.5, -24.6, 'Poor', 'Very High', 0.75),
            ('USR000012', 'ARKF', 'ARK Fintech Innovation ETF', 'Equity', 80.0, 18.75, 2000.0, 1500.0, -25.0, 'Poor', 'Very High', 0.75),
            ('USR000012', 'SPCE', 'Virgin Galactic Holdings Inc', 'Equity', 150.0, 3.45, 1000.0, 517.5, -48.3, 'Poor', 'Very High', 0.00),
            ('USR000012', 'VDE', 'Vanguard Energy ETF', 'Alternative', 25.0, 85.30, 2500.0, 2132.5, -14.7, 'Below Average', 'High', 0.10),
            ('USR000012', 'VMOT', 'Vanguard Short-Term Inflation-Protected Securities ETF', 'Bond', 100.0, 49.85, 5200.0, 4985.0, -4.1, 'Average', 'Very Low', 0.06),
            ('USR000012', 'VFIAX', 'Vanguard 500 Index Fund', 'Equity', 40.0, 420.50, 15000.0, 16820.0, 12.1, 'Excellent', 'Low', 0.04),
            ('USR000012', 'FXNAX', 'Fidelity US Bond Index Fund', 'Bond', 2000.0, 11.85, 20000.0, 23700.0, 18.5, 'Good', 'Very Low', 0.025),
            ('USR000012', 'SPY', 'SPDR S&P 500 ETF Trust', 'Equity', 30.0, 528.75, 12000.0, 15862.5, 32.2, 'Excellent', 'Low', 0.09),
            
            # USR000001 - Moderately out of balance, needs minor rebalancing
            ('USR000001', 'VTSMX', 'Vanguard Total Stock Market Index', 'Equity', 100.0, 115.25, 10000.0, 11525.0, 15.3, 'Excellent', 'Low', 0.03),
            ('USR000001', 'VTEB', 'Vanguard Tax-Exempt Bond ETF', 'Bond', 200.0, 52.15, 9000.0, 10430.0, 15.9, 'Good', 'Low', 0.05),
            ('USR000001', 'VNQ', 'Vanguard Real Estate Index Fund ETF', 'Alternative', 50.0, 92.40, 4000.0, 4620.0, 15.5, 'Average', 'Medium', 0.12),
            ('USR000001', 'VTIAX', 'Vanguard Total International Stock Index', 'Equity', 150.0, 28.75, 5000.0, 4312.5, -13.8, 'Poor', 'Medium', 0.11),
            ('USR000001', 'GDX', 'VanEck Vectors Gold Miners ETF', 'Alternative', 70.0, 28.65, 2500.0, 2005.5, -19.8, 'Below Average', 'Very High', 0.52),
            ('USR000001', 'PLTR', 'Palantir Technologies Inc', 'Equity', 60.0, 28.95, 2000.0, 1737.0, -13.2, 'Below Average', 'Very High', 0.00),
            
            # USR000020 - Conservative portfolio with some underperformers to rebalance
            ('USR000020', 'VFIAX', 'Vanguard 500 Index Fund', 'Equity', 25.0, 420.50, 8000.0, 10512.5, 31.4, 'Excellent', 'Low', 0.04),
            ('USR000020', 'FXNAX', 'Fidelity US Bond Index Fund', 'Bond', 1500.0, 11.85, 15000.0, 17775.0, 18.5, 'Good', 'Very Low', 0.025),
            ('USR000020', 'VMMXX', 'Vanguard Federal Money Market Fund', 'Cash', 3000.0, 1.00, 3000.0, 3000.0, 0.0, 'Good', 'Very Low', 0.11),
            ('USR000020', 'XLE', 'Energy Select Sector SPDR Fund', 'Alternative', 35.0, 89.45, 3500.0, 3130.75, -10.5, 'Below Average', 'High', 0.10),
            ('USR000020', 'SLV', 'iShares Silver Trust', 'Alternative', 90.0, 22.15, 2500.0, 1993.5, -20.3, 'Below Average', 'High', 0.50),
            
            # USR000015 - High growth portfolio with major imbalances and poor performers
            ('USR000015', 'ARKK', 'ARK Innovation ETF', 'Equity', 100.0, 45.25, 8000.0, 4525.0, -43.4, 'Poor', 'Very High', 0.75),
            ('USR000015', 'ARKG', 'ARK Genomics Revolution ETF', 'Equity', 120.0, 22.85, 4000.0, 2742.0, -31.5, 'Poor', 'Very High', 0.75),
            ('USR000015', 'COIN', 'Coinbase Global Inc', 'Equity', 25.0, 195.42, 6000.0, 4885.5, -18.6, 'Below Average', 'Very High', 0.00),
            ('USR000015', 'VTSMX', 'Vanguard Total Stock Market Index', 'Equity', 80.0, 115.25, 7000.0, 9220.0, 31.7, 'Excellent', 'Low', 0.03),
            ('USR000015', 'VDE', 'Vanguard Energy ETF', 'Alternative', 40.0, 85.30, 4000.0, 3412.0, -14.7, 'Below Average', 'High', 0.10),
            ('USR000015', 'VTEB', 'Vanguard Tax-Exempt Bond ETF', 'Bond', 100.0, 52.15, 4500.0, 5215.0, 15.9, 'Good', 'Low', 0.05),
            ('USR000015', 'IWM', 'iShares Russell 2000 ETF', 'Equity', 30.0, 198.75, 6000.0, 5962.5, -0.6, 'Average', 'High', 0.19),
            
            # USR000025 - Mixed portfolio with various performers
            ('USR000025', 'MSFT', 'Microsoft Corporation', 'Equity', 15.0, 415.26, 5000.0, 6228.9, 24.6, 'Excellent', 'Medium', 0.00),
            ('USR000025', 'AAPL', 'Apple Inc.', 'Equity', 30.0, 189.84, 4500.0, 5695.2, 26.6, 'Excellent', 'Medium', 0.00),
            ('USR000025', 'QQQ', 'Invesco QQQ Trust ETF', 'Equity', 20.0, 378.25, 6000.0, 7565.0, 26.1, 'Excellent', 'Medium', 0.20),
            ('USR000025', 'BND', 'Vanguard Total Bond Market ETF', 'Bond', 100.0, 78.45, 8000.0, 7845.0, -1.9, 'Good', 'Very Low', 0.03),
            ('USR000025', 'SPCE', 'Virgin Galactic Holdings Inc', 'Equity', 200.0, 3.45, 1500.0, 690.0, -54.0, 'Poor', 'Very High', 0.00),
            ('USR000025', 'ARKF', 'ARK Fintech Innovation ETF', 'Equity', 100.0, 18.75, 2500.0, 1875.0, -25.0, 'Poor', 'Very High', 0.75),
            ('USR000025', 'EFA', 'iShares MSCI EAFE ETF', 'Equity', 40.0, 78.65, 3500.0, 3146.0, -10.1, 'Good', 'Medium', 0.32),
            
            # USR000003 - Jennifer Lee - Growth portfolio with tech focus
            ('USR000003', 'VFIAX', 'Vanguard 500 Index Fund', 'Equity', 50.0, 420.50, 18000.0, 21025.0, 16.8, 'Excellent', 'Low', 0.04),
            ('USR000003', 'VTI', 'Vanguard Total Stock Market ETF', 'Equity', 80.0, 248.35, 15000.0, 19868.0, 32.5, 'Excellent', 'Low', 0.03),
            ('USR000003', 'NVDA', 'NVIDIA Corporation', 'Equity', 25.0, 892.75, 8000.0, 22318.8, 179.0, 'Excellent', 'High', 0.00),
            ('USR000003', 'BND', 'Vanguard Total Bond Market ETF', 'Bond', 250.0, 78.45, 20000.0, 19612.5, -1.9, 'Good', 'Very Low', 0.03),
            ('USR000003', 'VNQ', 'Vanguard Real Estate Index Fund ETF', 'Alternative', 15.0, 92.40, 1500.0, 1386.0, -7.6, 'Average', 'Medium', 0.12),
            
            # USR000007 - Robert Johnson - Conservative portfolio
            ('USR000007', 'VFIAX', 'Vanguard 500 Index Fund', 'Equity', 30.0, 420.50, 10000.0, 12615.0, 26.2, 'Excellent', 'Low', 0.04),
            ('USR000007', 'FXNAX', 'Fidelity US Bond Index Fund', 'Bond', 2000.0, 11.85, 20000.0, 23700.0, 18.5, 'Good', 'Very Low', 0.025),
            ('USR000007', 'VTEB', 'Vanguard Tax-Exempt Bond ETF', 'Bond', 100.0, 52.15, 5000.0, 5215.0, 4.3, 'Good', 'Low', 0.05),
            ('USR000007', 'VMMXX', 'Vanguard Federal Money Market Fund', 'Cash', 3500.0, 1.00, 3500.0, 3500.0, 0.0, 'Good', 'Very Low', 0.11),
            
            # USR000009 - Lisa Wang - Aggressive growth portfolio
            ('USR000009', 'QQQ', 'Invesco QQQ Trust ETF', 'Equity', 40.0, 378.25, 12000.0, 15130.0, 26.1, 'Excellent', 'Medium', 0.20),
            ('USR000009', 'NVDA', 'NVIDIA Corporation', 'Equity', 35.0, 892.75, 15000.0, 31246.3, 108.3, 'Excellent', 'High', 0.00),
            ('USR000009', 'TSLA', 'Tesla Inc', 'Equity', 80.0, 238.45, 20000.0, 19076.0, -4.6, 'Good', 'Very High', 0.00),
            ('USR000009', 'ARKK', 'ARK Innovation ETF', 'Equity', 60.0, 45.25, 8000.0, 2715.0, -66.1, 'Poor', 'Very High', 0.75),
            ('USR000009', 'BND', 'Vanguard Total Bond Market ETF', 'Bond', 100.0, 78.45, 8000.0, 7845.0, -1.9, 'Good', 'Very Low', 0.03),
            ('USR000009', 'VNQ', 'Vanguard Real Estate Index Fund ETF', 'Alternative', 35.0, 92.40, 3500.0, 3234.0, -7.6, 'Average', 'Medium', 0.12),
            
            # USR000011 - Mark Thompson - Balanced portfolio with healthcare focus
            ('USR000011', 'VTI', 'Vanguard Total Stock Market ETF', 'Equity', 60.0, 248.35, 12000.0, 14901.0, 24.2, 'Excellent', 'Low', 0.03),
            ('USR000011', 'XLV', 'Health Care Select Sector SPDR Fund', 'Equity', 45.0, 142.85, 8000.0, 6428.3, -19.6, 'Good', 'Medium', 0.10),
            ('USR000011', 'JNJ', 'Johnson & Johnson', 'Equity', 90.0, 158.42, 12000.0, 14257.8, 18.8, 'Good', 'Low', 0.00),
            ('USR000011', 'BND', 'Vanguard Total Bond Market ETF', 'Bond', 200.0, 78.45, 16000.0, 15690.0, -1.9, 'Good', 'Very Low', 0.03),
            ('USR000011', 'VMMXX', 'Vanguard Federal Money Market Fund', 'Cash', 5500.0, 1.00, 5500.0, 5500.0, 0.0, 'Good', 'Very Low', 0.11),
            ('USR000011', 'VNQ', 'Vanguard Real Estate Index Fund ETF', 'Alternative', 15.0, 92.40, 1500.0, 1386.0, -7.6, 'Average', 'Medium', 0.12),
            
            # USR000013 - Amanda Davis - Growth portfolio with consumer focus
            ('USR000013', 'VTI', 'Vanguard Total Stock Market ETF', 'Equity', 70.0, 248.35, 15000.0, 17384.5, 15.9, 'Excellent', 'Low', 0.03),
            ('USR000013', 'AMZN', 'Amazon.com Inc', 'Equity', 45.0, 142.68, 8000.0, 6420.6, -19.7, 'Good', 'High', 0.00),
            ('USR000013', 'XLY', 'Consumer Discretionary Select Sector SPDR Fund', 'Equity', 40.0, 168.25, 7000.0, 6730.0, -3.9, 'Good', 'Medium', 0.10),
            ('USR000013', 'GOOGL', 'Alphabet Inc Class A', 'Equity', 50.0, 138.42, 9000.0, 6921.0, -23.1, 'Good', 'Medium', 0.00),
            ('USR000013', 'BND', 'Vanguard Total Bond Market ETF', 'Bond', 150.0, 78.45, 12000.0, 11767.5, -1.9, 'Good', 'Very Low', 0.03),
            ('USR000013', 'VNQ', 'Vanguard Real Estate Index Fund ETF', 'Alternative', 20.0, 92.40, 2000.0, 1848.0, -7.6, 'Average', 'Medium', 0.12)
        ]
        
        cursor.executemany('''
            INSERT INTO user_holdings (user_id, fund_symbol, fund_name, asset_class, units_held, 
                                     current_price, invested_amount, current_value, return_percent, 
                                     performance_rating, risk_rating, expense_ratio)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', sample_holdings)
        
        print(f"✅ Loaded {len(sample_holdings)} user holdings with realistic performance data")
        print("🎯 Database setup completed successfully with market-driven rebalancing scenarios!")
        
    except Exception as e:
        print(f"❌ Error loading data: {e}")
        import traceback
        traceback.print_exc()
    
    conn.commit()
    conn.close()


if __name__ == "__main__":
    create_database() 