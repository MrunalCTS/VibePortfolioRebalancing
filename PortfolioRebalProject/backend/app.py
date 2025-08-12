from flask import Flask, jsonify, render_template, send_from_directory, request
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__, static_folder='../frontend/public', template_folder='../frontend/src')
CORS(app)  # Enable CORS for all routes

# Register AI agents blueprint
try:
    from ai_routes import ai_bp
    app.register_blueprint(ai_bp)
    print("✅ AI Agents system loaded successfully!")
except ImportError as e:
    print(f"⚠️ AI Agents system not available: {e}")
    # Continue without AI features

def get_db_connection():
    """Get database connection"""
    # Determine the correct path to database
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_path = os.path.join(base_path, 'database', 'portfolio_management.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row  # Return rows as dictionaries
    return conn

@app.route('/')
def index():
    """Serve the main HTML page"""
    return send_from_directory('../frontend/src', 'index.html')

@app.route('/ai-assistant.html')
def ai_assistant():
    """Serve the AI Assistant page"""
    return send_from_directory('../frontend/src', 'ai-assistant.html')

@app.route('/styles/<path:filename>')
def styles(filename):
    """Serve CSS files with cache busting"""
    response = send_from_directory('../frontend/src/styles', filename)
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route('/api/ai-rebalancing')
def get_ai_rebalancing_data():
    """Get AI rebalancing data for the main portal tab"""
    try:
        # Get customers with their rebalancing priorities
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT DISTINCT 
                ir.user_id,
                ir.full_name,
                ir.age,
                ir.city,
                ir.investor_category,
                ir.annual_income,
                ir.risk_capacity,
                ir.equities_percent as target_equity,
                ir.bonds_percent as target_bonds,
                COUNT(uh.fund_symbol) as total_holdings,
                SUM(uh.current_value) as total_portfolio_value,
                AVG(uh.return_percent) as avg_return
            FROM investor_ref_data ir
            LEFT JOIN user_holdings uh ON ir.user_id = uh.user_id
            GROUP BY ir.user_id
            ORDER BY ir.full_name
        ''')
        
        customers = []
        for row in cursor.fetchall():
            # Calculate current allocation
            cursor.execute('''
                SELECT 
                    SUM(CASE WHEN uh.asset_class = 'Equity' THEN uh.current_value ELSE 0 END) as equity_value,
                    SUM(CASE WHEN uh.asset_class = 'Bond' THEN uh.current_value ELSE 0 END) as bond_value,
                    SUM(uh.current_value) as total_value
                FROM user_holdings uh
                WHERE uh.user_id = ?
            ''', (row[0],))
            
            allocation = cursor.fetchone()
            if allocation and allocation[2]:
                current_equity = (allocation[0] or 0) / allocation[2] * 100
                equity_drift = abs(current_equity - (row[7] or 0))
            else:
                current_equity = 0
                equity_drift = 0
            
            rebalancing_priority = 'High' if equity_drift > 10 else 'Medium' if equity_drift > 5 else 'Low'
            
            customers.append({
                'user_id': row[0],
                'full_name': row[1],
                'age': row[2],
                'city': row[3],
                'investor_category': row[4],
                'annual_income': row[5],
                'risk_capacity': row[6],
                'portfolio_value': row[10] or 0,
                'holdings_count': row[9] or 0,
                'avg_return': row[11] or 0,
                'equity_drift': round(equity_drift, 1),
                'rebalancing_priority': rebalancing_priority,
                'current_equity': round(current_equity, 1),
                'target_equity': row[7]
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'data': customers,
            'columns': [
                {'key': 'full_name', 'label': 'Customer Name'},
                {'key': 'age', 'label': 'Age'},
                {'key': 'investor_category', 'label': 'Category'},
                {'key': 'portfolio_value', 'label': 'Portfolio Value', 'format': 'currency'},
                {'key': 'avg_return', 'label': 'Avg Return (%)', 'format': 'percentage'},
                {'key': 'equity_drift', 'label': 'Allocation Drift (%)', 'format': 'percentage'},
                {'key': 'rebalancing_priority', 'label': 'Priority'},
                {'key': 'actions', 'label': 'AI Analysis'}
            ],
            'total': len(customers)
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/components/<path:filename>')
def components(filename):
    """Serve JavaScript files with cache busting"""
    try:
        response = send_from_directory('../frontend/src/components', filename)
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        return response
    except FileNotFoundError:
        # Try serving from src directory for AI assistant files
        try:
            response = send_from_directory('../frontend/src', filename)
            response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response.headers['Pragma'] = 'no-cache'
            response.headers['Expires'] = '0'
            return response
        except FileNotFoundError:
            return "File not found", 404

@app.route('/api/investor-data')
def get_investor_data():
    """Get all investor reference data with portfolio values"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # Join investor_ref_data with portfolios_cur_allocation to get complete data
        cursor.execute('''
            SELECT 
                i.user_id, i.full_name, i.age, i.city, i.risk_capacity, i.spending_score,
                i.annual_income, i.investor_category, i.asset_allocation_model,
                i.equities_percent, i.bonds_percent, i.cash_percent, i.alternatives_percent,
                i.investment_preference_sectors, i.rebalancing_frequency, 
                i.last_rebalancing_date, i.variation_limit,
                COALESCE(p.total_investment_amount, 0) as total_portfolio_value,
                COALESCE(p.equities_percent, i.equities_percent) as current_equities_percent,
                COALESCE(p.bonds_percent, i.bonds_percent) as current_bonds_percent,
                COALESCE(p.cash_percent, i.cash_percent) as current_cash_percent,
                COALESCE(p.alternatives_percent, i.alternatives_percent) as current_alternatives_percent
            FROM investor_ref_data i
            LEFT JOIN portfolios_cur_allocation p ON i.user_id = p.user_id
            ORDER BY i.user_id
        ''')
        rows = cursor.fetchall()
        conn.close()
        
        # Convert rows to list of dictionaries
        data = []
        for row in rows:
            data.append(dict(row))
        
        return jsonify({
            'success': True,
            'data': data,
            'count': len(data)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/portfolio-allocation')
def get_portfolio_allocation():
    """Get all portfolio allocation data"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM portfolios_cur_allocation ORDER BY user_id')
        rows = cursor.fetchall()
        conn.close()
        
        # Convert rows to list of dictionaries
        data = []
        for row in rows:
            data.append(dict(row))
        
        return jsonify({
            'success': True,
            'data': data,
            'count': len(data)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/product-market-data')
def get_product_market_data():
    """Get all product market data"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT investment_type,industry_sector,market_segment,investment_strategies,investment_product,symbol,market_price_usd FROM product_market_data ORDER BY investment_type')
        rows = cursor.fetchall()
        conn.close()
        
        # Convert rows to list of dictionaries
        data = []
        for row in rows:
            data.append(dict(row))
        
        return jsonify({
            'success': True,
            'data': data,
            'count': len(data)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/master-allocation-model')
def get_master_allocation_model():
    """Get all master allocation model data"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM MasterAllocationModel ORDER BY category, model_no')
        rows = cursor.fetchall()
        conn.close()
        
        # Convert rows to list of dictionaries
        data = []
        for row in rows:
            data.append(dict(row))
        
        return jsonify({
            'success': True,
            'data': data,
            'count': len(data)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/stats')
def get_stats():
    """Get database statistics"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get record counts for each table
        cursor.execute('SELECT COUNT(*) as count FROM investor_ref_data')
        investor_count = cursor.fetchone()['count']
        
        cursor.execute('SELECT COUNT(*) as count FROM portfolios_cur_allocation')
        portfolio_count = cursor.fetchone()['count']
        
        cursor.execute('SELECT COUNT(*) as count FROM product_market_data')
        product_count = cursor.fetchone()['count']
        
        cursor.execute('SELECT COUNT(*) as count FROM MasterAllocationModel')
        master_count = cursor.fetchone()['count']
        
        conn.close()
        
        return jsonify({
            'success': True,
            'stats': {
                'investor_records': investor_count,
                'portfolio_records': portfolio_count,
                'product_records': product_count,
                'master_allocation_records': master_count
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/user/<user_id>')
def get_user_details(user_id):
    """Get detailed user data for dashboard"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get user portfolio data
        cursor.execute('SELECT * FROM portfolios_cur_allocation WHERE user_id = ?', (user_id,))
        portfolio_data = cursor.fetchone()
        
        if not portfolio_data:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
            
        portfolio_dict = dict(portfolio_data)
        
        # Get user reference data
        cursor.execute('SELECT * FROM investor_ref_data WHERE user_id = ?', (user_id,))
        investor_data = cursor.fetchone()
        investor_dict = dict(investor_data) if investor_data else {}
        
        # Get target allocation model if available
        if investor_dict.get('asset_allocation_model'):
            cursor.execute('SELECT * FROM MasterAllocationModel WHERE model_type = ?', 
                         (investor_dict['asset_allocation_model'],))
            target_allocation = cursor.fetchone()
            target_dict = dict(target_allocation) if target_allocation else {}
        else:
            target_dict = {}
        
        # Calculate additional metrics
        total_amount = portfolio_dict.get('total_investment_amount', 0)
        
        allocation_breakdown = {
            'equities': {
                'current_percent': portfolio_dict.get('equities_percent', 0),
                'current_amount': total_amount * (portfolio_dict.get('equities_percent', 0) / 100),
                'target_percent': target_dict.get('equities', 0) if target_dict else investor_dict.get('equities_percent', 0)
            },
            'bonds': {
                'current_percent': portfolio_dict.get('bonds_percent', 0),
                'current_amount': total_amount * (portfolio_dict.get('bonds_percent', 0) / 100),
                'target_percent': target_dict.get('bonds', 0) if target_dict else investor_dict.get('bonds_percent', 0)
            },
            'cash': {
                'current_percent': portfolio_dict.get('cash_percent', 0),
                'current_amount': total_amount * (portfolio_dict.get('cash_percent', 0) / 100),
                'target_percent': target_dict.get('cash_cash_equivalents', 0) if target_dict else investor_dict.get('cash_percent', 0)
            },
            'alternatives': {
                'current_percent': portfolio_dict.get('alternatives_percent', 0),
                'current_amount': total_amount * (portfolio_dict.get('alternatives_percent', 0) / 100),
                'target_percent': target_dict.get('alternative_investments', 0) if target_dict else investor_dict.get('alternatives_percent', 0)
            }
        }
        
        conn.close()
        
        return jsonify({
            'success': True,
            'user_data': {
                'portfolio': portfolio_dict,
                'investor_profile': investor_dict,
                'target_allocation': target_dict,
                'allocation_breakdown': allocation_breakdown,
                'total_investment': total_amount
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/user/<user_id>/holdings')
def get_user_holdings(user_id):
    """Get user's current holdings"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT h.*, f.returns_1year, f.returns_3year, f.category, f.fund_manager
            FROM user_holdings h 
            LEFT JOIN funds_universe f ON h.fund_symbol = f.fund_symbol
            WHERE h.user_id = ? 
            ORDER BY h.current_value DESC
        ''', (user_id,))
        
        holdings = cursor.fetchall()
        conn.close()
        
        # Convert to list of dictionaries and categorize performance
        holdings_data = []
        for holding in holdings:
            holding_dict = dict(holding)
            # Categorize performance
            return_percent = holding_dict.get('return_percent', 0)
            if return_percent < -10:
                holding_dict['performance_category'] = 'poor'
            elif return_percent < 0:
                holding_dict['performance_category'] = 'below_average'
            elif return_percent < 10:
                holding_dict['performance_category'] = 'average'
            else:
                holding_dict['performance_category'] = 'excellent'
                
            holdings_data.append(holding_dict)
        
        return jsonify({
            'success': True,
            'holdings': holdings_data
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/rebalance-options/<user_id>/<asset_class>')
def get_rebalancing_options(user_id, asset_class):
    """Generate individual buy and sell options for user selection"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get user's current holdings for the asset class
        cursor.execute('''
            SELECT uh.*, fu.* FROM user_holdings uh
            JOIN funds_universe fu ON uh.fund_symbol = fu.fund_symbol
            WHERE uh.user_id = ? AND fu.asset_class = ?
        ''', (user_id, asset_class))
        current_holdings = cursor.fetchall()
        
        # Get all available funds for buying
        cursor.execute('''
            SELECT * FROM funds_universe 
            WHERE asset_class = ? AND performance_rating IN ('Excellent', 'Good') 
            ORDER BY returns_1year DESC, performance_rating DESC
            LIMIT 10
        ''', (asset_class,))
        buy_options = cursor.fetchall()
        
        conn.close()
        
        # Generate sell options from current holdings
        sell_options = []
        for holding in current_holdings:
            if holding['current_value'] > 500:  # Only show holdings worth selling
                sell_options.append({
                    'id': f"sell_{holding['fund_symbol']}",
                    'fund_symbol': holding['fund_symbol'],
                    'fund_name': holding['fund_name'],
                    'current_value': holding['current_value'],
                    'units_held': holding['units_held'],
                    'return_percent': holding['return_percent'],
                    'performance_rating': holding['performance_rating'],
                    'risk_rating': holding['risk_rating'],
                    'suggested_sell_amount': min(holding['current_value'] * 0.5, 5000),
                    'reason': get_sell_reason(holding),
                    'priority': get_sell_priority(holding)
                })
        
        # Sort sell options by priority (worst performers first)
        sell_options.sort(key=lambda x: x['priority'], reverse=True)
        
        # Generate buy options
        buy_option_list = []
        for fund in buy_options:
            buy_option_list.append({
                'id': f"buy_{fund['fund_symbol']}",
                'fund_symbol': fund['fund_symbol'],
                'fund_name': fund['fund_name'],
                'current_price': fund['current_price'],
                'returns_1year': fund['returns_1year'],
                'returns_3year': fund['returns_3year'],
                'performance_rating': fund['performance_rating'],
                'risk_rating': fund['risk_rating'],
                'expense_ratio': fund['expense_ratio'],
                'suggested_buy_amount': 2000,  # Default suggestion
                'reason': get_buy_reason(fund),
                'priority': get_buy_priority(fund)
            })
        
        # Sort buy options by priority (best performers first)
        buy_option_list.sort(key=lambda x: x['priority'], reverse=True)
        
        return jsonify({
            'success': True,
            'sell_options': sell_options[:8],  # Top 8 sell candidates
            'buy_options': buy_option_list[:8],  # Top 8 buy candidates
            'asset_class': asset_class,
            'total_portfolio_value': sum(h['current_value'] for h in current_holdings)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Error generating rebalancing options: {str(e)}'
        }), 500

def get_sell_reason(holding):
    """Generate reason for selling based on performance"""
    performance = holding['return_percent']
    rating = holding['performance_rating']
    
    if rating == 'Poor':
        return f"Poor performance: {performance:.1f}% return, dragging portfolio down"
    elif rating == 'Below Average':
        return f"Underperforming: {performance:.1f}% return, better alternatives available"
    elif rating == 'Average':
        return f"Average performance: {performance:.1f}% return, room for optimization"
    else:
        return f"Rebalancing opportunity: {performance:.1f}% return, consider taking profits"

def get_sell_priority(holding):
    """Calculate sell priority (higher = should sell first)"""
    rating_scores = {'Poor': 10, 'Below Average': 8, 'Average': 5, 'Good': 3, 'Excellent': 1}
    rating_score = rating_scores.get(holding['performance_rating'], 5)
    
    # Consider negative returns more severely
    return_penalty = max(0, -holding['return_percent']) * 0.5
    
    return rating_score + return_penalty

def get_buy_reason(fund):
    """Generate reason for buying based on performance"""
    returns = fund['returns_1year']
    rating = fund['performance_rating']
    
    if rating == 'Excellent':
        return f"Top performer: {returns:.1f}% annual return, excellent track record"
    elif rating == 'Good':
        return f"Strong performer: {returns:.1f}% annual return, solid growth potential"
    else:
        return f"Growth opportunity: {returns:.1f}% annual return, good diversification"

def get_buy_priority(fund):
    """Calculate buy priority (higher = should buy first)"""
    rating_scores = {'Excellent': 10, 'Good': 8, 'Average': 5, 'Below Average': 3, 'Poor': 1}
    rating_score = rating_scores.get(fund['performance_rating'], 5)
    
    # Boost score for high returns
    return_boost = fund['returns_1year'] * 0.2
    
    return rating_score + return_boost

@app.route('/api/execute-custom-rebalance', methods=['POST'])
def execute_custom_rebalancing():
    """Execute custom rebalancing based on user-selected buy/sell options"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        selected_sells = data.get('selected_sells', [])
        selected_buys = data.get('selected_buys', [])
        
        if not user_id:
            return jsonify({'success': False, 'error': 'User ID is required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        total_sell_amount = 0
        total_buy_amount = 0
        
        # Execute sell orders
        for sell_order in selected_sells:
            fund_symbol = sell_order['fund_symbol']
            sell_amount = sell_order['amount']
            
            # Update user holdings
            cursor.execute('''
                SELECT * FROM user_holdings 
                WHERE user_id = ? AND fund_symbol = ?
            ''', (user_id, fund_symbol))
            
            holding = cursor.fetchone()
            if holding:
                new_value = max(0, holding['current_value'] - sell_amount)
                new_units = new_value / holding['current_price'] if holding['current_price'] > 0 else 0
                new_invested = holding['invested_amount'] * (new_value / holding['current_value']) if holding['current_value'] > 0 else 0
                
                if new_value > 0:
                    cursor.execute('''
                        UPDATE user_holdings 
                        SET current_value = ?, units_held = ?, invested_amount = ?
                        WHERE user_id = ? AND fund_symbol = ?
                    ''', (new_value, new_units, new_invested, user_id, fund_symbol))
                else:
                    cursor.execute('''
                        DELETE FROM user_holdings 
                        WHERE user_id = ? AND fund_symbol = ?
                    ''', (user_id, fund_symbol))
                
                total_sell_amount += sell_amount
        
        # Execute buy orders
        for buy_order in selected_buys:
            fund_symbol = buy_order['fund_symbol']
            buy_amount = buy_order['amount']
            
            # Check if user already has this fund
            cursor.execute('''
                SELECT * FROM user_holdings 
                WHERE user_id = ? AND fund_symbol = ?
            ''', (user_id, fund_symbol))
            
            existing = cursor.fetchone()
            
            # Get fund info
            cursor.execute('''
                SELECT * FROM funds_universe WHERE fund_symbol = ?
            ''', (fund_symbol,))
            fund_info = cursor.fetchone()
            
            if fund_info:
                new_units = buy_amount / fund_info['current_price']
                
                if existing:
                    # Update existing holding
                    new_total_value = existing['current_value'] + buy_amount
                    new_total_units = existing['units_held'] + new_units
                    new_invested = existing['invested_amount'] + buy_amount
                    
                    cursor.execute('''
                        UPDATE user_holdings 
                        SET current_value = ?, units_held = ?, invested_amount = ?
                        WHERE user_id = ? AND fund_symbol = ?
                    ''', (new_total_value, new_total_units, new_invested, user_id, fund_symbol))
                else:
                    # Create new holding
                    cursor.execute('''
                        INSERT INTO user_holdings 
                        (user_id, fund_symbol, fund_name, asset_class, units_held, current_price, 
                         invested_amount, current_value, return_percent, performance_rating, risk_rating, expense_ratio)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
                    ''', (user_id, fund_symbol, fund_info['fund_name'], fund_info['asset_class'], 
                         new_units, fund_info['current_price'], buy_amount, buy_amount,
                         fund_info['performance_rating'], fund_info['risk_rating'], fund_info['expense_ratio']))
                
                total_buy_amount += buy_amount
        
        # Log the custom rebalancing action
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS custom_rebalancing_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                execution_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                total_sell_amount REAL,
                total_buy_amount REAL,
                num_sells INTEGER,
                num_buys INTEGER,
                status TEXT DEFAULT 'completed'
            )
        ''')
        
        cursor.execute('''
            INSERT INTO custom_rebalancing_log 
            (user_id, total_sell_amount, total_buy_amount, num_sells, num_buys)
            VALUES (?, ?, ?, ?, ?)
        ''', (user_id, total_sell_amount, total_buy_amount, len(selected_sells), len(selected_buys)))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Custom rebalancing executed successfully',
            'summary': {
                'total_sell_amount': total_sell_amount,
                'total_buy_amount': total_buy_amount,
                'net_change': total_buy_amount - total_sell_amount,
                'num_sells': len(selected_sells),
                'num_buys': len(selected_buys)
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Error executing custom rebalancing: {str(e)}'
        }), 500

@app.route('/api/rebalance/<user_id>/<asset_class>')
def get_rebalancing_scenarios(user_id, asset_class):
    """Generate rebalancing scenarios for a specific user and asset class"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get user's current allocation and target allocation
        cursor.execute('''
            SELECT ia.*, pa.* FROM investor_ref_data ia
            JOIN portfolios_cur_allocation pa ON ia.user_id = pa.user_id
            WHERE ia.user_id = ?
        ''', (user_id,))
        user_data = cursor.fetchone()
        
        if not user_data:
            return jsonify({'success': False, 'error': 'User not found'})
        
        # Get user's current holdings for the asset class
        cursor.execute('''
            SELECT uh.*, fu.* FROM user_holdings uh
            JOIN funds_universe fu ON uh.fund_symbol = fu.fund_symbol
            WHERE uh.user_id = ? AND fu.asset_class = ?
        ''', (user_id, asset_class))
        current_holdings = cursor.fetchall()
        
        # Get recommended funds for buying (top performers in the asset class)
        cursor.execute('''
            SELECT * FROM funds_universe 
            WHERE asset_class = ? AND performance_rating IN ('Excellent', 'Good') 
            ORDER BY returns_1year DESC, performance_rating DESC
            LIMIT 8
        ''', (asset_class,))
        recommended_funds = cursor.fetchall()
        
        conn.close()
        
        # Generate 3 detailed rebalancing scenarios
        scenarios = []
        
        # Scenario 1: Conservative Rebalancing
        conservative_actions = []
        # Sell underperforming holdings
        for holding in current_holdings:
            if holding['performance_rating'] in ['Poor', 'Below Average'] and holding['current_value'] > 1000:
                conservative_actions.append({
                    'type': 'sell',
                    'fund_name': holding['fund_name'],
                    'fund_symbol': holding['fund_symbol'],
                    'amount': min(holding['current_value'] * 0.3, 3000),  # Sell 30% or max $3000
                    'reason': f'Underperforming with {holding["return_percent"]:.1f}% return',
                    'current_performance': holding['return_percent'],
                    'units': holding['units_held'] * 0.3
                })
        
        # Ensure minimum sell actions by including average performers if needed
        if len(conservative_actions) < 2:
            for holding in current_holdings:
                if holding['performance_rating'] == 'Average' and holding['current_value'] > 1500:
                    conservative_actions.append({
                        'type': 'sell',
                        'fund_name': holding['fund_name'],
                        'fund_symbol': holding['fund_symbol'],
                        'amount': min(holding['current_value'] * 0.2, 2000),
                        'reason': f'Rebalancing average performer ({holding["return_percent"]:.1f}% return)',
                        'current_performance': holding['return_percent'],
                        'units': holding['units_held'] * 0.2
                    })
                    if len(conservative_actions) >= 3:
                        break
        
        # Buy recommended funds
        if recommended_funds:
            total_sell_amount = sum(action['amount'] for action in conservative_actions if action['type'] == 'sell')
            if total_sell_amount < 1000:  # Ensure minimum buying power
                total_sell_amount = 2000
                
            for i, fund in enumerate(recommended_funds[:3]):  # Buy top 3 recommended
                buy_amount = total_sell_amount / 3 if i < 3 else 0
                if buy_amount > 300:  # Lower minimum buy amount
                    conservative_actions.append({
                        'type': 'buy',
                        'fund_name': fund['fund_name'],
                        'fund_symbol': fund['fund_symbol'],
                        'amount': buy_amount,
                        'reason': f'Strong performer: {fund["returns_1year"]:.1f}% annual return',
                        'current_performance': fund['returns_1year'],
                        'expected_units': buy_amount / fund['current_price']
                    })
        
        scenarios.append({
            'id': 1,
            'name': 'Conservative Rebalancing',
            'description': 'Gradual rebalancing with minimal risk, focusing on reducing underperforming assets',
            'risk_level': 'Low',
            'expected_return': '+2.5% annually',
            'timeframe': '6-12 months',
            'cost': '$25-40',
            'actions': conservative_actions,
            'allocation_change': {
                'equity_change': 0 if asset_class != 'equities' else 2,
                'bond_change': 0 if asset_class != 'bonds' else 1,
                'cash_change': 0 if asset_class != 'cash' else -3
            }
        })
        
        # Scenario 2: Moderate Rebalancing
        moderate_actions = []
        # More aggressive selling of poor performers
        for holding in current_holdings:
            if holding['performance_rating'] in ['Poor', 'Below Average'] and holding['current_value'] > 800:
                moderate_actions.append({
                    'type': 'sell',
                    'fund_name': holding['fund_name'],
                    'fund_symbol': holding['fund_symbol'],
                    'amount': min(holding['current_value'] * 0.6, 5000),  # Sell 60% or max $5000
                    'reason': f'Poor performance ({holding["return_percent"]:.1f}%), better opportunities available',
                    'current_performance': holding['return_percent'],
                    'units': holding['units_held'] * 0.6
                })
        
        # Include some average performers for more comprehensive rebalancing
        for holding in current_holdings:
            if holding['performance_rating'] == 'Average' and holding['current_value'] > 2000 and len(moderate_actions) < 5:
                moderate_actions.append({
                    'type': 'sell',
                    'fund_name': holding['fund_name'],
                    'fund_symbol': holding['fund_symbol'],
                    'amount': min(holding['current_value'] * 0.4, 3000),
                    'reason': f'Reallocating from average performer to optimize returns',
                    'current_performance': holding['return_percent'],
                    'units': holding['units_held'] * 0.4
                })
        
        # Buy more recommended funds
        if recommended_funds:
            total_sell_amount = sum(action['amount'] for action in moderate_actions if action['type'] == 'sell')
            if total_sell_amount < 1500:  # Ensure minimum buying power
                total_sell_amount = 3000
                
            for i, fund in enumerate(recommended_funds[:4]):  # Buy top 4 recommended
                buy_amount = total_sell_amount / 4 if i < 4 else 0
                if buy_amount > 400:
                    moderate_actions.append({
                        'type': 'buy',
                        'fund_name': fund['fund_name'],
                        'fund_symbol': fund['fund_symbol'],
                        'amount': buy_amount,
                        'reason': f'Excellent growth potential: {fund["returns_1year"]:.1f}% return, {fund["performance_rating"]} rated',
                        'current_performance': fund['returns_1year'],
                        'expected_units': buy_amount / fund['current_price']
                    })
        
        scenarios.append({
            'id': 2,
            'name': 'Moderate Rebalancing',
            'description': 'Balanced approach with strategic reallocation to optimize performance',
            'risk_level': 'Medium',
            'expected_return': '+4.2% annually',
            'timeframe': '3-6 months',
            'cost': '$40-65',
            'actions': moderate_actions,
            'allocation_change': {
                'equity_change': 0 if asset_class != 'equities' else 3,
                'bond_change': 0 if asset_class != 'bonds' else 2,
                'cash_change': 0 if asset_class != 'cash' else -5
            }
        })
        
        # Scenario 3: Aggressive Rebalancing
        aggressive_actions = []
        # Sell most underperforming and average holdings
        for holding in current_holdings:
            if holding['performance_rating'] in ['Poor', 'Below Average', 'Average'] and holding['current_value'] > 500:
                sell_percentage = 0.8 if holding['performance_rating'] in ['Poor', 'Below Average'] else 0.5
                aggressive_actions.append({
                    'type': 'sell',
                    'fund_name': holding['fund_name'],
                    'fund_symbol': holding['fund_symbol'],
                    'amount': min(holding['current_value'] * sell_percentage, 8000),  # Sell 50-80% or max $8000
                    'reason': f'Maximizing portfolio optimization ({holding["return_percent"]:.1f}% → targeting 15%+ returns)',
                    'current_performance': holding['return_percent'],
                    'units': holding['units_held'] * sell_percentage
                })
        
        # Buy top recommended funds
        if recommended_funds:
            total_sell_amount = sum(action['amount'] for action in aggressive_actions if action['type'] == 'sell')
            if total_sell_amount < 2000:  # Ensure substantial buying power for aggressive strategy
                total_sell_amount = 5000
                
            for i, fund in enumerate(recommended_funds[:5]):  # Buy top 5 recommended
                buy_amount = total_sell_amount / 5 if i < 5 else 0
                if buy_amount > 500:  # Reasonable minimum for aggressive strategy
                    aggressive_actions.append({
                        'type': 'buy',
                        'fund_name': fund['fund_name'],
                        'fund_symbol': fund['fund_symbol'],
                        'amount': buy_amount,
                        'reason': f'Top-tier opportunity: {fund["returns_1year"]:.1f}% annual returns, {fund["performance_rating"]} rating',
                        'current_performance': fund['returns_1year'],
                        'expected_units': buy_amount / fund['current_price']
                    })
        
        scenarios.append({
            'id': 3,
            'name': 'Aggressive Rebalancing',
            'description': 'Maximum optimization for growth, substantial portfolio restructuring',
            'risk_level': 'High',
            'expected_return': '+6.8% annually',
            'timeframe': '1-3 months',
            'cost': '$65-100',
            'actions': aggressive_actions,
            'allocation_change': {
                'equity_change': 0 if asset_class != 'equities' else 5,
                'bond_change': 0 if asset_class != 'bonds' else 3,
                'cash_change': 0 if asset_class != 'cash' else -8
            }
        })
        
        return jsonify({
            'success': True,
            'scenarios': scenarios,
            'current_allocation': {
                'equities': user_data['equities_percent'],
                'bonds': user_data['bonds_percent'],
                'cash': user_data['cash_percent'],
                'alternatives': user_data['alternatives_percent']
            },
            'target_allocation': {
                'equities': user_data['equities_percent'],  # Using current as target for now
                'bonds': user_data['bonds_percent'],
                'cash': user_data['cash_percent'],
                'alternatives': user_data['alternatives_percent']
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/rebalance/execute', methods=['POST'])
def execute_rebalancing():
    """Execute selected rebalancing scenario"""
    try:
        from flask import request
        data = request.get_json()
        
        user_id = data.get('user_id')
        scenario_id = data.get('scenario_id')
        actions = data.get('actions', [])
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Process each action
        for action in actions:
            if action['type'] == 'sell':
                # Remove or reduce holding
                cursor.execute('''
                    DELETE FROM user_holdings 
                    WHERE user_id = ? AND fund_symbol = ?
                ''', (user_id, action['fund_symbol']))
                
            elif action['type'] == 'buy':
                # Add new holding or increase existing
                cursor.execute('''
                    SELECT * FROM user_holdings 
                    WHERE user_id = ? AND fund_symbol = ?
                ''', (user_id, action['fund_symbol']))
                
                existing = cursor.fetchone()
                
                if existing:
                    # Update existing holding
                    new_units = existing['units_held'] + action['units']
                    new_invested = existing['invested_amount'] + action['amount']
                    new_current_value = new_units * action.get('current_price', existing['current_price'])
                    
                    cursor.execute('''
                        UPDATE user_holdings 
                        SET units_held = ?, invested_amount = ?, current_value = ?
                        WHERE user_id = ? AND fund_symbol = ?
                    ''', (new_units, new_invested, new_current_value, user_id, action['fund_symbol']))
                else:
                    # Insert new holding
                    cursor.execute('''
                        INSERT INTO user_holdings 
                        (user_id, fund_symbol, fund_name, asset_class, units_held, current_price, 
                         invested_amount, current_value, return_percent, performance_rating, risk_rating, expense_ratio)
                        SELECT ?, f.fund_symbol, f.fund_name, f.asset_class, ?, f.current_price, 
                               ?, ?, 0, f.performance_rating, f.risk_rating, f.expense_ratio
                        FROM funds_universe f 
                        WHERE f.fund_symbol = ?
                    ''', (user_id, action['units'], action['amount'], action['amount'], action['fund_symbol']))
        
        # Log the rebalancing action
        cursor.execute('''
            INSERT INTO rebalancing_scenarios 
            (user_id, scenario_name, asset_class, action_type, scenario_desc)
            VALUES (?, ?, ?, ?, ?)
        ''', (user_id, f'Executed Scenario {scenario_id}', data.get('asset_class', ''), 'executed', 
              f'User executed rebalancing scenario {scenario_id}'))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Rebalancing executed successfully'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ===== AI BEHAVIORAL FINANCE COACH API ENDPOINTS =====

@app.route('/api/behavioral-coach/analyze', methods=['POST'])
def analyze_behavioral_profile():
    """Analyze user's life event and behavioral data to provide personalized recommendations"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        life_event_data = data.get('life_event_data', {})
        behavioral_data = data.get('behavioral_data', {})
        
        if not user_id:
            return jsonify({'success': False, 'error': 'User ID is required'}), 400
        
        # Generate behavioral insights
        insights = generate_behavioral_insights(life_event_data, behavioral_data)
        
        # Generate portfolio recommendations based on life events
        recommendations = generate_portfolio_recommendations(user_id, life_event_data, behavioral_data)
        
        # Save analysis to database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Create behavioral_coaching table if it doesn't exist
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS behavioral_coaching (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                analysis_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                life_event TEXT,
                timeline TEXT,
                financial_impact TEXT,
                risk_change TEXT,
                current_emotion TEXT,
                market_outlook TEXT,
                decision_style TEXT,
                recent_behavior TEXT,
                event_details TEXT,
                insights_json TEXT,
                recommendations_json TEXT
            )
        ''')
        
        # Insert analysis record
        cursor.execute('''
            INSERT INTO behavioral_coaching 
            (user_id, life_event, timeline, financial_impact, risk_change, 
             current_emotion, market_outlook, decision_style, recent_behavior, 
             event_details, insights_json, recommendations_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id,
            life_event_data.get('primaryLifeEvent', ''),
            life_event_data.get('eventTimeline', ''),
            life_event_data.get('financialImpact', ''),
            life_event_data.get('riskChange', ''),
            behavioral_data.get('currentEmotion', ''),
            behavioral_data.get('marketOutlook', ''),
            behavioral_data.get('decisionStyle', ''),
            behavioral_data.get('recentBehavior', ''),
            life_event_data.get('eventDetails', ''),
            str(insights),
            str(recommendations)
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'insights': insights,
            'recommendations': recommendations,
            'analysis_id': cursor.lastrowid
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/behavioral-coach/rebalance', methods=['POST'])
def execute_behavioral_rebalancing():
    """Execute portfolio rebalancing based on behavioral analysis and life events"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        scenario = data.get('scenario')  # gradual, immediate, selective
        recommendations = data.get('recommendations', {})
        
        if not user_id or not scenario:
            return jsonify({'success': False, 'error': 'User ID and scenario are required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get current user portfolio
        cursor.execute('''
            SELECT * FROM portfolios_cur_allocation WHERE user_id = ?
        ''', (user_id,))
        current_portfolio = cursor.fetchone()
        
        if not current_portfolio:
            return jsonify({'success': False, 'error': 'User portfolio not found'}), 404
        
        # Apply rebalancing based on scenario and life event recommendations
        new_allocation = calculate_life_event_rebalancing(
            current_portfolio, recommendations.get('allocationChanges', {}), scenario
        )
        
        # Create rebalancing_executions table if it doesn't exist
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS rebalancing_executions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                execution_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                scenario_type TEXT,
                life_event TEXT,
                old_allocation_json TEXT,
                new_allocation_json TEXT,
                emotional_impact TEXT,
                status TEXT DEFAULT 'completed'
            )
        ''')
        
        # Update user's portfolio allocation
        cursor.execute('''
            UPDATE portfolios_cur_allocation 
            SET equities_percent = ?, bonds_percent = ?, alternatives_percent = ?, 
                cash_percent = ?, last_rebalance_date = CURRENT_TIMESTAMP
            WHERE user_id = ?
        ''', (
            new_allocation.get('stocks', current_portfolio['equities_percent']),
            new_allocation.get('bonds', current_portfolio['bonds_percent']),
            new_allocation.get('alternatives', current_portfolio['alternatives_percent']),
            new_allocation.get('cash', current_portfolio['cash_percent']),
            user_id
        ))
        
        # Log the rebalancing execution
        cursor.execute('''
            INSERT INTO rebalancing_executions 
            (user_id, scenario_type, life_event, old_allocation_json, new_allocation_json, emotional_impact)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            user_id,
            scenario,
            recommendations.get('lifeEvent', ''),
            str({
                'equities': current_portfolio['equities_percent'],
                'bonds': current_portfolio['bonds_percent'],
                'alternatives': current_portfolio['alternatives_percent'],
                'cash': current_portfolio['cash_percent']
            }),
            str(new_allocation),
            get_scenario_emotional_impact(scenario)
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': f'Portfolio rebalanced using {scenario} strategy',
            'new_allocation': new_allocation,
            'execution_id': cursor.lastrowid
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/behavioral-coach/recommendations/<user_id>')
def get_behavioral_recommendations(user_id):
    """Get saved behavioral recommendations for a user"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get latest behavioral analysis
        cursor.execute('''
            SELECT * FROM behavioral_coaching 
            WHERE user_id = ? 
            ORDER BY analysis_date DESC 
            LIMIT 5
        ''', (user_id,))
        
        analyses = []
        for row in cursor.fetchall():
            analyses.append({
                'id': row['id'],
                'analysis_date': row['analysis_date'],
                'life_event': row['life_event'],
                'timeline': row['timeline'],
                'financial_impact': row['financial_impact'],
                'current_emotion': row['current_emotion'],
                'market_outlook': row['market_outlook'],
                'decision_style': row['decision_style']
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'recommendations': analyses
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ===== HELPER FUNCTIONS FOR BEHAVIORAL FINANCE COACH =====

def generate_behavioral_insights(life_event_data, behavioral_data):
    """Generate behavioral insights based on user's psychological profile"""
    
    insights = {
        'emotional_state': analyze_emotional_state(behavioral_data),
        'decision_pattern': analyze_decision_pattern(behavioral_data),
        'risk_tolerance': analyze_risk_tolerance(life_event_data, behavioral_data),
        'bias_warnings': identify_potential_biases(behavioral_data)
    }
    
    return insights

def analyze_emotional_state(behavioral_data):
    """Analyze user's current emotional state regarding investments"""
    emotion = behavioral_data.get('currentEmotion', '')
    outlook = behavioral_data.get('marketOutlook', '')
    recent_behavior = behavioral_data.get('recentBehavior', '')
    
    if emotion in ['very_anxious', 'overwhelmed']:
        return {
            'level': 'high_stress',
            'description': 'High investment anxiety detected - proceed with caution',
            'recommendations': [
                'Implement gradual changes to reduce emotional impact',
                'Focus on capital preservation during this period',
                'Consider automatic investing to reduce decision fatigue'
            ]
        }
    elif emotion == 'very_confident' and outlook == 'very_optimistic':
        return {
            'level': 'overconfident',
            'description': 'Potential overconfidence bias - maintain balanced approach',
            'recommendations': [
                'Review risk tolerance objectively',
                'Maintain diversification principles',
                'Avoid concentration in high-risk assets'
            ]
        }
    else:
        return {
            'level': 'balanced',
            'description': 'Healthy emotional state for investment decisions',
            'recommendations': [
                'Good time for strategic portfolio adjustments',
                'Consider long-term investment goals',
                'Implement systematic rebalancing approach'
            ]
        }

def analyze_decision_pattern(behavioral_data):
    """Analyze user's decision-making patterns"""
    style = behavioral_data.get('decisionStyle', '')
    
    patterns = {
        'analytical': {
            'strengths': ['Thorough research', 'Data-driven decisions'],
            'weaknesses': ['Analysis paralysis', 'Overthinking timing'],
            'recommendations': ['Set decision deadlines', 'Use systematic approaches']
        },
        'intuitive': {
            'strengths': ['Quick adaptation', 'Pattern recognition'],
            'weaknesses': ['Emotional bias', 'Inconsistent strategy'],
            'recommendations': ['Validate decisions with data', 'Document rationale']
        },
        'conservative': {
            'strengths': ['Risk awareness', 'Capital preservation'],
            'weaknesses': ['Missing opportunities', 'Inflation risk'],
            'recommendations': ['Gradual risk adjustment', 'Inflation protection']
        }
    }
    
    return patterns.get(style, patterns['conservative'])

def analyze_risk_tolerance(life_event_data, behavioral_data):
    """Analyze how life events should adjust risk tolerance"""
    life_event = life_event_data.get('primaryLifeEvent', '')
    timeline = life_event_data.get('eventTimeline', '')
    
    # Events that typically require more conservative approach
    conservative_events = ['job_loss', 'health_expenses', 'divorce', 'new_baby']
    
    # Events that might allow for more aggressive approach  
    aggressive_events = ['inheritance', 'job_change', 'debt_payoff']
    
    if life_event in conservative_events:
        return {
            'suggested_level': 'conservative',
            'reasoning': 'Life event suggests need for stability and liquidity',
            'adjustments': ['Increase emergency fund', 'Reduce volatility exposure']
        }
    elif life_event in aggressive_events:
        return {
            'suggested_level': 'moderate_aggressive',
            'reasoning': 'Improved financial situation allows for growth focus',
            'adjustments': ['Consider growth investments', 'Utilize tax-advantaged accounts']
        }
    else:
        return {
            'suggested_level': 'moderate',
            'reasoning': 'Maintain balanced approach',
            'adjustments': ['Regular rebalancing', 'Diversified allocation']
        }

def identify_potential_biases(behavioral_data):
    """Identify potential behavioral biases"""
    biases = []
    recent_behavior = behavioral_data.get('recentBehavior', '')
    
    if recent_behavior == 'panic_selling':
        biases.append({
            'type': 'Loss Aversion',
            'warning': 'Tendency to sell during downturns',
            'mitigation': 'Implement automatic rebalancing rules'
        })
    
    if recent_behavior == 'fomo_buying':
        biases.append({
            'type': 'Herd Mentality', 
            'warning': 'Following market trends without analysis',
            'mitigation': 'Stick to long-term allocation strategy'
        })
    
    return biases

def generate_portfolio_recommendations(user_id, life_event_data, behavioral_data):
    """Generate specific portfolio recommendations based on life events"""
    life_event = life_event_data.get('primaryLifeEvent', '')
    timeline = life_event_data.get('eventTimeline', '')
    financial_impact = life_event_data.get('financialImpact', '')
    
    # Get current user data for context
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM portfolios_cur_allocation WHERE user_id = ?', (user_id,))
    current_portfolio = cursor.fetchone()
    conn.close()
    
    recommendations = {
        'immediate_actions': [],
        'allocation_changes': {},
        'timeline_strategy': {},
        'emergency_fund': 3  # default months
    }
    
    # Life event specific recommendations
    event_strategies = {
        'marriage': {
            'actions': ['Review joint financial goals', 'Update beneficiaries', 'Consider joint accounts'],
            'allocation': {'cash': 5, 'bonds': 25, 'stocks': 65, 'alternatives': 5},
            'emergency_fund': 3
        },
        'new_baby': {
            'actions': ['Start education savings', 'Increase life insurance', 'Build emergency fund'],
            'allocation': {'cash': 10, 'bonds': 35, 'stocks': 50, 'alternatives': 5},
            'emergency_fund': 6
        },
        'home_purchase': {
            'actions': ['Save for down payment', 'Reduce portfolio risk', 'Consider real estate exposure'],
            'allocation': {'cash': 15, 'bonds': 40, 'stocks': 40, 'alternatives': 5},
            'emergency_fund': 4
        },
        'job_loss': {
            'actions': ['Preserve capital', 'Increase liquidity', 'Avoid major changes'],
            'allocation': {'cash': 20, 'bonds': 50, 'stocks': 25, 'alternatives': 5},
            'emergency_fund': 12
        },
        'retirement_planning': {
            'actions': ['Maximize retirement contributions', 'Tax-advantaged investments', 'Review withdrawal strategies'],
            'allocation': {'cash': 5, 'bonds': 40, 'stocks': 50, 'alternatives': 5},
            'emergency_fund': 6
        }
    }
    
    strategy = event_strategies.get(life_event, {
        'actions': ['Review current allocation', 'Maintain diversification'],
        'allocation': {'cash': 5, 'bonds': 30, 'stocks': 60, 'alternatives': 5},
        'emergency_fund': 3
    })
    
    recommendations['immediate_actions'] = strategy['actions']
    recommendations['allocation_changes'] = strategy['allocation']
    recommendations['emergency_fund'] = strategy['emergency_fund']
    
    # Timeline-based adjustments
    if timeline in ['happening_now', 'next_6_months']:
        recommendations['timeline_strategy'] = {
            'priority': 'liquidity',
            'actions': ['Increase cash reserves', 'Reduce volatility', 'Short-term focus']
        }
        # Increase cash allocation for immediate needs
        recommendations['allocation_changes']['cash'] += 5
        recommendations['allocation_changes']['stocks'] -= 5
    elif timeline in ['5_plus_years']:
        recommendations['timeline_strategy'] = {
            'priority': 'growth',
            'actions': ['Focus on equity growth', 'Long-term perspective', 'Tax efficiency']
        }
    
    return recommendations

def calculate_life_event_rebalancing(current_portfolio, target_allocation, scenario):
    """Calculate new portfolio allocation based on life event recommendations and scenario"""
    
    current = {
        'stocks': current_portfolio['equities_percent'],
        'bonds': current_portfolio['bonds_percent'],
        'alternatives': current_portfolio['alternatives_percent'],
        'cash': current_portfolio['cash_percent']
    }
    
    # Scenario-based implementation
    if scenario == 'immediate':
        # Full immediate transition to target
        return target_allocation
    
    elif scenario == 'gradual':
        # Move 1/3 of the way toward target (simulating gradual transition)
        new_allocation = {}
        for asset in ['stocks', 'bonds', 'alternatives', 'cash']:
            current_value = current.get(asset, 0)
            target_value = target_allocation.get(asset, current_value)
            change = (target_value - current_value) * 0.33  # 1/3 of total change
            new_allocation[asset] = round(current_value + change, 1)
        return new_allocation
    
    elif scenario == 'selective':
        # Only change allocations that are significantly off target (>10% difference)
        new_allocation = current.copy()
        for asset in ['stocks', 'bonds', 'alternatives', 'cash']:
            current_value = current.get(asset, 0)
            target_value = target_allocation.get(asset, current_value)
            if abs(target_value - current_value) > 10:
                new_allocation[asset] = target_value
        return new_allocation
    
    else:
        return current

def get_scenario_emotional_impact(scenario):
    """Get emotional impact level for different rebalancing scenarios"""
    impacts = {
        'immediate': 'Medium - Quick changes may cause anxiety',
        'gradual': 'Low - Gradual changes reduce emotional stress',
        'selective': 'Very Low - Minimal disruption to existing positions'
    }
    return impacts.get(scenario, 'Unknown')

if __name__ == '__main__':
    print("Starting Portfolio Management Web Portal...")
    print("Access the application at: http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)