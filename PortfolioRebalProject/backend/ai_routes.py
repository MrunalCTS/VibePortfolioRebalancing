"""
AI Agents API Routes
Flask routes for the multi-agent AI system
"""

from flask import Blueprint, jsonify, request
from ai_agents import AIAgentSystem
from ai_scenarios import AIScenarioGenerator
import datetime
import json

# Create a blueprint for AI routes
ai_bp = Blueprint('ai', __name__, url_prefix='/api/ai')

# Initialize the AI agent system
ai_system = AIAgentSystem()
scenario_generator = AIScenarioGenerator()

@ai_bp.route('/chat', methods=['POST'])
def chat_with_ai():
    """Handle chat messages from users"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        message = data.get('message')
        
        if not user_id or not message:
            return jsonify({'success': False, 'error': 'User ID and message are required'}), 400
        
        response = ai_system.process_chat_message(user_id, message)
        
        return jsonify({
            'success': True,
            'response': response['response'],
            'agent_type': response['agent_type'],
            'suggestions': response['suggestions'],
            'timestamp': response['timestamp']
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@ai_bp.route('/chat/history/<user_id>')
def get_chat_history(user_id):
    """Get chat history for a user"""
    try:
        # Filter chat history for this user (simplified for demo)
        history = [
            {
                'role': msg.role,
                'content': msg.content,
                'timestamp': msg.timestamp.isoformat(),
                'agent_type': msg.agent_type
            }
            for msg in ai_system.chat_history[-20:]  # Last 20 messages
        ]
        
        return jsonify({
            'success': True,
            'history': history
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@ai_bp.route('/portfolio-analysis/<user_id>')
def get_portfolio_analysis(user_id):
    """Get comprehensive portfolio analysis"""
    try:
        # Use portfolio assistant for analysis
        analysis = ai_system.portfolio_assistant.handle_general_query(user_id, "Give me a comprehensive portfolio analysis")
        
        # Get risk analysis
        risk_analysis = ai_system.risk_management.analyze_risk_query(user_id, "Analyze my portfolio risk")
        
        # Get rebalancing suggestions
        rebalancing_suggestions = ai_system.portfolio_assistant.handle_rebalancing_query(user_id, "Should I rebalance?")
        
        return jsonify({
            'success': True,
            'portfolio_analysis': analysis,
            'risk_analysis': risk_analysis,
            'rebalancing_suggestions': rebalancing_suggestions,
            'timestamp': datetime.datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@ai_bp.route('/market-intelligence')
def get_market_intelligence():
    """Get current market intelligence and insights"""
    try:
        insights = ai_system.market_intelligence.market_insights
        
        formatted_insights = [
            {
                'type': insight.type,
                'title': insight.title,
                'content': insight.content,
                'impact': insight.impact,
                'relevance_score': insight.relevance_score,
                'timestamp': insight.timestamp.isoformat()
            }
            for insight in insights
        ]
        
        return jsonify({
            'success': True,
            'insights': formatted_insights,
            'last_updated': datetime.datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@ai_bp.route('/risk-alerts/<user_id>')
def get_risk_alerts(user_id):
    """Get risk alerts for a specific user"""
    try:
        alerts = ai_system.risk_management.generate_risk_alerts(user_id)
        
        formatted_alerts = [
            {
                'level': alert.level,
                'type': alert.type,
                'message': alert.message,
                'recommendations': alert.recommendations,
                'affected_holdings': alert.affected_holdings,
                'timestamp': alert.timestamp.isoformat()
            }
            for alert in alerts
        ]
        
        return jsonify({
            'success': True,
            'alerts': formatted_alerts
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@ai_bp.route('/goals/<user_id>')
def get_financial_goals(user_id):
    """Get financial planning and goals analysis"""
    try:
        planning_analysis = ai_system.goal_planning_agent.handle_planning_query(
            user_id, "Help me with financial planning"
        )
        
        return jsonify({
            'success': True,
            'planning_analysis': planning_analysis,
            'timestamp': datetime.datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@ai_bp.route('/monitoring/alerts')
def get_monitoring_alerts():
    """Get autonomous monitoring alerts for all users"""
    try:
        alerts = ai_system.rebalancing_agent.monitor_portfolios()
        
        return jsonify({
            'success': True,
            'alerts': alerts,
            'timestamp': datetime.datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@ai_bp.route('/quick-insights/<user_id>')
def get_quick_insights(user_id):
    """Get quick AI insights for dashboard widget"""
    try:
        # Get a condensed insight from portfolio assistant
        insight = ai_system.portfolio_assistant.handle_general_query(user_id, "Quick portfolio insight")
        
        # Extract key metrics (simplified for demo)
        insights = {
            'summary': insight[:200] + "..." if len(insight) > 200 else insight,
            'recommendation': "Consider reviewing your portfolio allocation",
            'risk_level': "Medium",
            'next_action': "Check rebalancing opportunities"
        }
        
        return jsonify({
            'success': True,
            'insights': insights
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@ai_bp.route('/agent-status')
def get_agent_status():
    """Get status of all AI agents"""
    try:
        status = {
            'portfolio_assistant': 'active',
            'auto_rebalancing': 'monitoring',
            'market_intelligence': 'active',
            'goal_planning': 'active',
            'risk_management': 'active',
            'last_update': datetime.datetime.now().isoformat(),
            'total_insights': len(ai_system.market_intelligence.market_insights),
            'chat_sessions': len(ai_system.chat_history)
        }
        
        return jsonify({
            'success': True,
            'status': status
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@ai_bp.route('/scenarios')
def get_ai_scenarios():
    """Get AI-generated scenarios for display"""
    try:
        scenarios = scenario_generator.get_scenarios_for_user(limit=10)
        quick_scenarios = scenario_generator.get_quick_scenarios()
        
        return jsonify({
            'success': True,
            'scenarios': scenarios,
            'quick_scenarios': quick_scenarios,
            'total_count': len(scenarios),
            'timestamp': datetime.datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@ai_bp.route('/scenarios/<user_id>')
def get_user_scenarios(user_id):
    """Get personalized AI scenarios for a specific user"""
    try:
        # Get customer profile from database
        conn = ai_system.get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT 
                ir.user_id, ir.full_name as name, ir.age, ir.investor_category as category,
                ir.equities_percent as target_equity, ir.bonds_percent as target_bonds,
                SUM(uh.current_value) as portfolio_value,
                AVG(uh.return_percent) as avg_return,
                SUM(CASE WHEN uh.asset_class = 'Equity' THEN uh.current_value ELSE 0 END) as equity_value,
                SUM(CASE WHEN uh.asset_class = 'Bond' THEN uh.current_value ELSE 0 END) as bond_value
            FROM investor_ref_data ir
            LEFT JOIN user_holdings uh ON ir.user_id = uh.user_id
            WHERE ir.user_id = ?
            GROUP BY ir.user_id
        ''', (user_id,))
        
        user_data = cursor.fetchone()
        conn.close()
        
        if not user_data:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        # Calculate current allocation
        total_value = user_data['portfolio_value'] or 0
        if total_value > 0:
            current_equity = (user_data['equity_value'] or 0) / total_value * 100
            current_bonds = (user_data['bond_value'] or 0) / total_value * 100
        else:
            current_equity = current_bonds = 0
        
        equity_drift = abs(current_equity - (user_data['target_equity'] or 0))
        
        # Create customer profile
        customer_profile = {
            'user_id': user_data['user_id'],
            'name': user_data['name'],
            'age': user_data['age'],
            'category': user_data['category'],
            'portfolio_value': total_value,
            'avg_return': user_data['avg_return'] or 0,
            'equity_drift': equity_drift,
            'current_allocation': {
                'equity': round(current_equity, 1),
                'bonds': round(current_bonds, 1)
            },
            'target_allocation': {
                'equity': user_data['target_equity'],
                'bonds': user_data['target_bonds']
            }
        }
        
        # Get personalized scenarios
        personalized_scenarios = scenario_generator.get_personalized_scenarios(customer_profile)
        
        # Also get some general scenarios based on user type
        general_scenarios = scenario_generator.get_scenarios_for_user(
            user_id=user_id, 
            user_type=user_data['category'], 
            limit=2
        )
        
        return jsonify({
            'success': True,
            'user_id': user_id,
            'customer_profile': customer_profile,
            'personalized_scenarios': personalized_scenarios,
            'general_scenarios': general_scenarios,
            'total_scenarios': len(personalized_scenarios) + len(general_scenarios)
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500 

@ai_bp.route('/customers')
def get_customers():
    """Get all customers with their portfolio profiles"""
    try:
        conn = ai_system.get_db_connection()
        cursor = conn.cursor()
        
        # Get customer data with portfolio summary
        cursor.execute('''
            SELECT DISTINCT 
                ir.user_id,
                ir.full_name,
                ir.age,
                ir.city,
                ir.investor_category,
                ir.asset_allocation_model,
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
                    SUM(CASE WHEN uh.asset_class = 'Alternative' THEN uh.current_value ELSE 0 END) as alt_value,
                    SUM(uh.current_value) as total_value
                FROM user_holdings uh
                WHERE uh.user_id = ?
            ''', (row['user_id'],))
            
            allocation = cursor.fetchone()
            if allocation and allocation['total_value']:
                current_equity = (allocation['equity_value'] or 0) / allocation['total_value'] * 100
                current_bonds = (allocation['bond_value'] or 0) / allocation['total_value'] * 100
                current_alt = (allocation['alt_value'] or 0) / allocation['total_value'] * 100
            else:
                current_equity = current_bonds = current_alt = 0
            
            # Calculate rebalancing need
            equity_drift = abs(current_equity - (row['target_equity'] or 0))
            rebalancing_priority = 'High' if equity_drift > 10 else 'Medium' if equity_drift > 5 else 'Low'
            
            customers.append({
                'user_id': row['user_id'],
                'name': row['full_name'],
                'age': row['age'],
                'city': row['city'],
                'category': row['investor_category'],
                'model': row['asset_allocation_model'],
                'income': row['annual_income'],
                'risk_capacity': row['risk_capacity'],
                'portfolio_value': row['total_portfolio_value'] or 0,
                'holdings_count': row['total_holdings'] or 0,
                'avg_return': row['avg_return'] or 0,
                'target_allocation': {
                    'equity': row['target_equity'],
                    'bonds': row['target_bonds']
                },
                'current_allocation': {
                    'equity': round(current_equity, 1),
                    'bonds': round(current_bonds, 1),
                    'alternatives': round(current_alt, 1)
                },
                'rebalancing_priority': rebalancing_priority,
                'equity_drift': round(equity_drift, 1)
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'customers': customers,
            'total_customers': len(customers)
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500 