import sqlite3
import os

print("=== DATABASE TEST ===")

# Check if database file exists
db_path = 'database/portfolio_management.db'
if os.path.exists(db_path):
    print(f"✅ Database file exists: {db_path}")
    print(f"   File size: {os.path.getsize(db_path)} bytes")
else:
    print(f"❌ Database file missing: {db_path}")
    exit(1)

try:
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print(f"✅ Tables found: {[table[0] for table in tables]}")
    
    # Check data counts
    cursor.execute('SELECT COUNT(*) FROM investor_ref_data')
    inv_count = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM portfolios_cur_allocation')
    port_count = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM product_market_data')
    prod_count = cursor.fetchone()[0]
    
    print(f"✅ Data loaded:")
    print(f"   - Investor records: {inv_count}")
    print(f"   - Portfolio records: {port_count}")
    print(f"   - Product records: {prod_count}")
    
    # Test a sample query
    cursor.execute('SELECT user_id, full_name FROM investor_ref_data LIMIT 1')
    sample = cursor.fetchone()
    if sample:
        print(f"✅ Sample data: {sample[0]} - {sample[1]}")
    
    conn.close()
    print("✅ Database test completed successfully!")
    
except Exception as e:
    print(f"❌ Database error: {e}")
    exit(1) 