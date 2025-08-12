"""
AI Agents System for Portfolio Management
Multi-agent system providing intelligent portfolio analysis and recommendations
"""

import sqlite3
import json
import datetime
from dataclasses import dataclass
from typing import List, Dict, Any, Optional
import random
import re

@dataclass
class ChatMessage:
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: datetime.datetime
    agent_type: str = 'general'

@dataclass
class MarketInsight:
    type: str  # 'news', 'trend', 'alert'
    title: str
    content: str
    impact: str  # 'positive', 'negative', 'neutral'
    relevance_score: float
    timestamp: datetime.datetime

@dataclass
class RiskAlert:
    level: str  # 'low', 'medium', 'high', 'critical'
    type: str
    message: str
    recommendations: List[str]
    affected_holdings: List[str]
    timestamp: datetime.datetime

class AIAgentSystem:
    def __init__(self, db_path='database/portfolio_management.db'):
        self.db_path = db_path
        self.chat_history = []
        self.initialize_agents()
    
    def initialize_agents(self):
        """Initialize all AI agents"""
        self.portfolio_assistant = PortfolioAssistantAgent(self.db_path)
        self.rebalancing_agent = AutoRebalancingAgent(self.db_path)
        self.market_intelligence = MarketIntelligenceAgent(self.db_path)
        self.goal_planning_agent = GoalPlanningAgent(self.db_path)
        self.risk_management = RiskManagementAgent(self.db_path)
    
    def get_db_connection(self):
        """Get database connection"""
        import os
        # Use the same path logic as the main app
        base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        db_path = os.path.join(base_path, 'database', 'portfolio_management.db')
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def process_chat_message(self, user_id: str, message: str) -> Dict[str, Any]:
        """Process incoming chat message and route to appropriate agent"""
        message_lower = message.lower()
        
        # Determine which agent should handle the message
        if any(word in message_lower for word in ['rebalance', 'buy', 'sell', 'allocation']):
            response = self.portfolio_assistant.handle_rebalancing_query(user_id, message)
            agent_type = 'rebalancing'
        elif any(word in message_lower for word in ['risk', 'safe', 'protect', 'lose']):
            response = self.risk_management.analyze_risk_query(user_id, message)
            agent_type = 'risk'
        elif any(word in message_lower for word in ['goal', 'retire', 'plan', 'future']):
            response = self.goal_planning_agent.handle_planning_query(user_id, message)
            agent_type = 'planning'
        elif any(word in message_lower for word in ['market', 'news', 'trend', 'economy']):
            response = self.market_intelligence.handle_market_query(user_id, message)
            agent_type = 'market'
        else:
            response = self.portfolio_assistant.handle_general_query(user_id, message)
            agent_type = 'general'
        
        # Store chat history
        self.chat_history.append(ChatMessage('user', message, datetime.datetime.now(), agent_type))
        self.chat_history.append(ChatMessage('assistant', response, datetime.datetime.now(), agent_type))
        
        return {
            'response': response,
            'agent_type': agent_type,
            'suggestions': self.get_follow_up_suggestions(agent_type),
            'timestamp': datetime.datetime.now().isoformat()
        }
    
    def get_follow_up_suggestions(self, agent_type: str) -> List[str]:
        """Get follow-up question suggestions based on agent type"""
        suggestions = {
            'general': [
                "How is my portfolio performing?",
                "What should I do with my investments?",
                "Show me my risk analysis"
            ],
            'rebalancing': [
                "Should I rebalance my portfolio now?",
                "What stocks should I sell?",
                "Show me top performing funds to buy"
            ],
            'risk': [
                "What are my biggest risks?",
                "How can I protect my portfolio?",
                "Run a stress test on my holdings"
            ],
            'planning': [
                "Help me plan for retirement",
                "Set up investment goals",
                "How much should I save monthly?"
            ],
            'market': [
                "What's happening in the market today?",
                "How do market trends affect my portfolio?",
                "Any alerts for my holdings?"
            ]
        }
        return suggestions.get(agent_type, suggestions['general'])

class PortfolioAssistantAgent:
    """AI agent for portfolio analysis and recommendations"""
    
    def __init__(self, db_path):
        self.db_path = db_path
    
    def get_db_connection(self):
        import os
        base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        db_path = os.path.join(base_path, 'database', 'portfolio_management.db')
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def handle_general_query(self, user_id: str, message: str) -> str:
        """Handle general portfolio queries"""
        try:
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            # Get user portfolio summary
            cursor.execute('''
                SELECT uh.current_value, uh.return_percent, uh.fund_name, fu.performance_rating
                FROM user_holdings uh
                JOIN funds_universe fu ON uh.fund_symbol = fu.fund_symbol
                WHERE uh.user_id = ?
            ''', (user_id,))
            holdings = cursor.fetchall()
            
            if not holdings:
                return "I don't see any holdings for your portfolio yet. Would you like help getting started with investing?"
            
            total_value = sum(h['current_value'] for h in holdings)
            total_return = sum(h['return_percent'] for h in holdings if h['return_percent'])
            avg_return = total_return / len(holdings) if holdings else 0
            
            top_performer = max(holdings, key=lambda x: x['return_percent'] if x['return_percent'] else -100)
            worst_performer = min(holdings, key=lambda x: x['return_percent'] if x['return_percent'] else 100)
            
            conn.close()
            
            return f"""📊 **Portfolio Overview**
            
**Portfolio Value:** ${total_value:,.2f}
**Average Return:** {avg_return:.1f}%
**Total Holdings:** {len(holdings)} funds

**Top Performer:** {top_performer['fund_name']} ({top_performer['return_percent']:.1f}%)
**Needs Attention:** {worst_performer['fund_name']} ({worst_performer['return_percent']:.1f}%)

💡 **Quick Insights:**
• Your portfolio has {len([h for h in holdings if h['return_percent'] and h['return_percent'] > 0])} profitable positions
• Consider rebalancing if you haven't done so in the last quarter
• I can help you analyze specific holdings or suggest improvements

What would you like to explore further?"""
            
        except Exception as e:
            return f"I'm having trouble accessing your portfolio data right now. Please try again in a moment."
    
    def handle_rebalancing_query(self, user_id: str, message: str) -> str:
        """Handle rebalancing-related queries"""
        try:
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            # Get underperforming holdings
            cursor.execute('''
                SELECT uh.fund_name, uh.return_percent, uh.current_value, uh.performance_rating
                FROM user_holdings uh
                WHERE uh.user_id = ? AND uh.performance_rating IN ('Poor', 'Below Average')
                ORDER BY uh.return_percent ASC
                LIMIT 3
            ''', (user_id,))
            sell_candidates = cursor.fetchall()
            
            # Get top performing available funds
            cursor.execute('''
                SELECT fund_name, returns_1year, performance_rating
                FROM funds_universe 
                WHERE performance_rating = 'Excellent'
                ORDER BY returns_1year DESC
                LIMIT 3
            ''', ())
            buy_candidates = cursor.fetchall()
            
            conn.close()
            
            if sell_candidates:
                sell_text = "\n".join([f"• **{fund['fund_name']}** ({fund['return_percent']:.1f}% return) - {fund['performance_rating']}" for fund in sell_candidates])
            else:
                sell_text = "• Your holdings are performing well!"
            
            if buy_candidates:
                buy_text = "\n".join([f"• **{fund['fund_name']}** ({fund['returns_1year']:.1f}% annual return)" for fund in buy_candidates])
            else:
                buy_text = "• I'll need to analyze more options for you"
            
            return f"""🔄 **Rebalancing Analysis**

**📉 Consider Selling:**
{sell_text}

**📈 Consider Buying:**
{buy_text}

💡 **AI Recommendation:**
Based on your current holdings, I suggest a gradual rebalancing approach. You can use the 'Custom Selection' feature on the rebalancing page to implement these suggestions.

Would you like me to explain why these changes would benefit your portfolio?"""
            
        except Exception as e:
            return "I'm having trouble analyzing your rebalancing options right now. Please check the Rebalancing page for detailed scenarios."

class AutoRebalancingAgent:
    """Agent for autonomous portfolio monitoring and rebalancing suggestions"""
    
    def __init__(self, db_path):
        self.db_path = db_path
    
    def monitor_portfolios(self) -> List[Dict[str, Any]]:
        """Monitor all portfolios and generate alerts"""
        alerts = []
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Get all users
            cursor.execute('SELECT DISTINCT user_id FROM user_holdings')
            users = cursor.fetchall()
            
            for user in users:
                user_id = user[0]
                alert = self.check_user_portfolio(cursor, user_id)
                if alert:
                    alerts.append(alert)
            
            conn.close()
            
        except Exception as e:
            print(f"Error monitoring portfolios: {e}")
        
        return alerts
    
    def check_user_portfolio(self, cursor, user_id: str) -> Optional[Dict[str, Any]]:
        """Check individual portfolio for rebalancing needs"""
        cursor.execute('''
            SELECT COUNT(*) as poor_count, AVG(return_percent) as avg_return
            FROM user_holdings 
            WHERE user_id = ? AND performance_rating IN ('Poor', 'Below Average')
        ''', (user_id,))
        
        result = cursor.fetchone()
        poor_count = result[0]
        avg_return = result[1] or 0
        
        if poor_count >= 2 or avg_return < -10:
            return {
                'user_id': user_id,
                'type': 'rebalancing_needed',
                'priority': 'high' if avg_return < -15 else 'medium',
                'message': f'Portfolio has {poor_count} underperforming holdings with {avg_return:.1f}% average return',
                'recommendations': [
                    'Consider selling underperforming assets',
                    'Reallocate to top-performing funds',
                    'Review risk tolerance'
                ]
            }
        return None

class MarketIntelligenceAgent:
    """Agent for market analysis and insights"""
    
    def __init__(self, db_path):
        self.db_path = db_path
        self.market_insights = self.generate_market_insights()
    
    def generate_market_insights(self) -> List[MarketInsight]:
        """Generate simulated market insights"""
        insights = [
            MarketInsight(
                type='trend',
                title='AI Revolution Driving Tech Giants',
                content='NVIDIA, Microsoft, and Google leading the AI transformation. Portfolio exposure to AI stocks showing exceptional returns with NVDA up 179% YTD. Recommend maintaining tech allocation.',
                impact='positive',
                relevance_score=0.95,
                timestamp=datetime.datetime.now()
            ),
            MarketInsight(
                type='alert',
                title='Growth Stock Correction in ARK Funds',
                content='ARK Innovation (ARKK) and ARK Genomics (ARKG) down 66% and 31% respectively. High-risk growth portfolios need immediate rebalancing to limit further losses.',
                impact='negative',
                relevance_score=0.90,
                timestamp=datetime.datetime.now()
            ),
            MarketInsight(
                type='news',
                title='Federal Reserve Interest Rate Policy',
                content='Fed maintaining current rates but signals potential cuts in 2024. Bond funds like BND and VTEB positioned well for rate environment. Consider increasing bond allocation.',
                impact='neutral',
                relevance_score=0.85,
                timestamp=datetime.datetime.now()
            ),
            MarketInsight(
                type='opportunity',
                title='Value Opportunity in Healthcare',
                content='Healthcare sector undervalued with XLV down 19.6%. Johnson & Johnson and healthcare ETFs showing strong fundamentals despite recent selloff. Consider accumulating positions.',
                impact='positive',
                relevance_score=0.80,
                timestamp=datetime.datetime.now()
            ),
            MarketInsight(
                type='warning',
                title='Speculative Stock Risk Alert',
                content='Meme stocks like Virgin Galactic (SPCE) down 54% and Coinbase (COIN) showing high volatility. Recommend reducing speculative positions to protect capital.',
                impact='negative',
                relevance_score=0.85,
                timestamp=datetime.datetime.now()
            ),
            MarketInsight(
                type='trend',
                title='Total Market Index Strength',
                content='Vanguard Total Stock Market (VTI) and S&P 500 funds (VFIAX, SPY) showing consistent 15-32% gains. Core equity positions performing well across all risk profiles.',
                impact='positive',
                relevance_score=0.88,
                timestamp=datetime.datetime.now()
            ),
            MarketInsight(
                type='strategy',
                title='Rebalancing Opportunity Window',
                content='Current market conditions present optimal rebalancing opportunities. High performers can be trimmed while quality stocks are available at discounts.',
                impact='neutral',
                relevance_score=0.92,
                timestamp=datetime.datetime.now()
            ),
            MarketInsight(
                type='outlook',
                title='International Markets Lagging',
                content='International funds (VTIAX, EFA) underperforming US markets by 10-15%. Consider reducing international exposure until global economic uncertainty resolves.',
                impact='negative',
                relevance_score=0.75,
                timestamp=datetime.datetime.now()
            )
        ]
        return insights
    
    def handle_market_query(self, user_id: str, message: str) -> str:
        """Handle market-related queries"""
        relevant_insights = [insight for insight in self.market_insights if insight.relevance_score > 0.7]
        
        insights_text = ""
        for insight in relevant_insights[:3]:
            emoji = "📈" if insight.impact == 'positive' else "📉" if insight.impact == 'negative' else "📊"
            insights_text += f"\n{emoji} **{insight.title}**\n{insight.content}\n"
        
        return f"""🌍 **Market Intelligence Update**

{insights_text}

💡 **Personalized Impact:**
Based on your portfolio, the technology momentum could benefit your MSFT and QQQ holdings, while energy volatility may affect any VDE positions you hold.

Would you like me to analyze how these trends specifically affect your holdings?"""

class GoalPlanningAgent:
    """Agent for goal-based financial planning"""
    
    def __init__(self, db_path):
        self.db_path = db_path
    
    def handle_planning_query(self, user_id: str, message: str) -> str:
        """Handle financial planning queries"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Get user info
            cursor.execute('SELECT * FROM investor_ref_data WHERE user_id = ?', (user_id,))
            user_data = cursor.fetchone()
            
            if not user_data:
                return "I need access to your investor profile to provide personalized planning advice."
            
            age = user_data[2]  # age column
            risk_capacity = user_data[4]  # risk_capacity column
            annual_income = user_data[6]  # annual_income column
            
            # Calculate retirement planning
            retirement_age = 65
            years_to_retirement = max(0, retirement_age - age)
            
            # Get current portfolio value
            cursor.execute('''
                SELECT SUM(current_value) as total_value
                FROM user_holdings WHERE user_id = ?
            ''', (user_id,))
            
            result = cursor.fetchone()
            current_portfolio = result[0] if result[0] else 0
            
            conn.close()
            
            # Simple retirement calculation
            target_retirement_fund = annual_income * 10  # 10x annual income rule
            monthly_savings_needed = max(0, (target_retirement_fund - current_portfolio) / (years_to_retirement * 12)) if years_to_retirement > 0 else 0
            
            return f"""🎯 **Financial Planning Analysis**

**Your Profile:**
• Age: {age} years
• Risk Capacity: {risk_capacity}
• Years to Retirement: {years_to_retirement}

**Current Status:**
• Portfolio Value: ${current_portfolio:,.2f}
• Target Retirement Fund: ${target_retirement_fund:,.2f}

**Recommendations:**
• Monthly Savings Goal: ${monthly_savings_needed:,.2f}
• Asset Allocation: {70-age}% stocks, {age-10}% bonds (age-based rule)
• Emergency Fund: {3 if risk_capacity == 'Low' else 6} months of expenses

💡 **Next Steps:**
1. Set up automatic monthly investments
2. Review and adjust allocation annually
3. Consider tax-advantaged accounts

Would you like me to help you set specific investment goals?"""
            
        except Exception as e:
            return "I'm having trouble accessing your planning data. Please ensure your profile is complete."

class RiskManagementAgent:
    """Agent for portfolio risk analysis and management"""
    
    def __init__(self, db_path):
        self.db_path = db_path
    
    def analyze_risk_query(self, user_id: str, message: str) -> str:
        """Analyze portfolio risk and provide recommendations"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Get holdings with risk ratings
            cursor.execute('''
                SELECT uh.fund_name, uh.current_value, uh.risk_rating, uh.return_percent
                FROM user_holdings uh
                WHERE uh.user_id = ?
            ''', (user_id,))
            holdings = cursor.fetchall()
            
            if not holdings:
                return "I need your portfolio data to perform a risk analysis."
            
            total_value = sum(h[1] for h in holdings)
            
            # Calculate risk distribution
            risk_distribution = {}
            for holding in holdings:
                risk_level = holding[2]
                value = holding[1]
                percentage = (value / total_value) * 100
                
                if risk_level in risk_distribution:
                    risk_distribution[risk_level] += percentage
                else:
                    risk_distribution[risk_level] = percentage
            
            # Identify high-risk holdings
            high_risk_holdings = [h for h in holdings if h[2] in ['High', 'Very High']]
            volatile_holdings = [h for h in holdings if h[3] and h[3] < -15]
            
            conn.close()
            
            # Generate risk score (0-100)
            risk_score = 0
            risk_score += risk_distribution.get('Very High', 0) * 2
            risk_score += risk_distribution.get('High', 0) * 1.5
            risk_score += risk_distribution.get('Medium', 0) * 1
            risk_score += len(volatile_holdings) * 5
            
            risk_level = 'Low' if risk_score < 30 else 'Medium' if risk_score < 60 else 'High'
            
            risk_text = "\n".join([f"• {level}: {percentage:.1f}%" for level, percentage in risk_distribution.items()])
            
            recommendations = []
            if risk_score > 70:
                recommendations.append("Consider reducing exposure to high-risk assets")
            if len(volatile_holdings) > 2:
                recommendations.append("Review holdings with significant losses")
            if risk_distribution.get('Very Low', 0) < 20:
                recommendations.append("Add some stable, low-risk holdings for balance")
            
            recommendations_text = "\n".join([f"• {rec}" for rec in recommendations]) if recommendations else "• Your risk levels appear well-balanced"
            
            return f"""⚠️ **Risk Analysis Report**

**Overall Risk Level:** {risk_level} ({risk_score:.0f}/100)

**Risk Distribution:**
{risk_text}

**Recommendations:**
{recommendations_text}

**Stress Test Results:**
• In a 20% market downturn, your portfolio could lose approximately ${total_value * 0.15:,.0f}
• High-risk holdings ({len(high_risk_holdings)}) may see 30-40% volatility

💡 **Risk Management Tips:**
• Diversify across asset classes
• Regular rebalancing reduces risk
• Consider your investment timeline

Would you like specific suggestions to optimize your risk profile?"""
            
        except Exception as e:
            return "I'm having trouble analyzing your portfolio risk. Please try again later."
    
    def generate_risk_alerts(self, user_id: str) -> List[RiskAlert]:
        """Generate risk alerts for a user's portfolio"""
        alerts = []
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Check for concentrated risk
            cursor.execute('''
                SELECT fund_name, current_value, 
                       (current_value * 100.0 / (SELECT SUM(current_value) FROM user_holdings WHERE user_id = ?)) as percentage
                FROM user_holdings 
                WHERE user_id = ? AND 
                      (current_value * 100.0 / (SELECT SUM(current_value) FROM user_holdings WHERE user_id = ?)) > 30
            ''', (user_id, user_id, user_id))
            
            concentrated_holdings = cursor.fetchall()
            
            if concentrated_holdings:
                for holding in concentrated_holdings:
                    alerts.append(RiskAlert(
                        level='medium',
                        type='concentration_risk',
                        message=f'{holding[0]} represents {holding[2]:.1f}% of your portfolio',
                        recommendations=['Consider reducing position size', 'Diversify into other assets'],
                        affected_holdings=[holding[0]],
                        timestamp=datetime.datetime.now()
                    ))
            
            conn.close()
            
        except Exception as e:
            print(f"Error generating risk alerts: {e}")
        
        return alerts 