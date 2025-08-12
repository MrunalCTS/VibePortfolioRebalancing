"""
Pre-built AI Scenarios for Portfolio Management
Provides 10+ realistic AI-generated scenarios for immediate display
"""

import datetime
from dataclasses import dataclass
from typing import List, Dict, Any

@dataclass
class AIScenario:
    scenario_id: str
    title: str
    description: str
    user_type: str  # 'Conservative', 'Balanced', 'Aggressive'
    portfolio_impact: str  # 'Low', 'Medium', 'High'
    recommendation: str
    action_items: List[str]
    expected_outcome: str
    risk_level: str
    time_horizon: str
    created_at: datetime.datetime

class AIScenarioGenerator:
    def __init__(self):
        self.scenarios = self.generate_predefined_scenarios()
    
    def generate_predefined_scenarios(self) -> List[AIScenario]:
        """Generate 10 realistic AI scenarios for different portfolio situations"""
        scenarios = [
            AIScenario(
                scenario_id="AI_001",
                title="🤖 Tech Stock Rebalancing Alert",
                description="AI analysis detected portfolio overexposure to technology stocks (72.5% vs 60% target). NVIDIA gains (+179%) and Microsoft performance creating allocation drift.",
                user_type="Growth",
                portfolio_impact="High",
                recommendation="Trim tech winners and rebalance to target allocation",
                action_items=[
                    "Sell $8,000 in NVIDIA (NVDA) to lock in gains",
                    "Reduce Microsoft (MSFT) position by $3,000",
                    "Increase bond allocation with BND or VTEB",
                    "Consider defensive sectors like utilities"
                ],
                expected_outcome="Reduced portfolio volatility while maintaining growth potential",
                risk_level="Medium",
                time_horizon="1-3 months",
                created_at=datetime.datetime.now()
            ),
            
            AIScenario(
                scenario_id="AI_002", 
                title="🔴 Growth Stock Correction Strategy",
                description="AI detected significant losses in ARK funds (ARKK -66%, ARKG -31%). Machine learning models predict continued volatility in speculative growth sector.",
                user_type="Aggressive",
                portfolio_impact="High",
                recommendation="Exit underperforming growth positions and reallocate to quality",
                action_items=[
                    "Liquidate remaining ARK Innovation (ARKK) holdings",
                    "Sell Virgin Galactic (SPCE) position (-54% loss)",
                    "Reinvest in Vanguard Total Market (VTI) for stability",
                    "Add defensive dividend stocks like Johnson & Johnson"
                ],
                expected_outcome="Stop further losses and rebuild with quality foundations",
                risk_level="High",
                time_horizon="Immediate",
                created_at=datetime.datetime.now()
            ),
            
            AIScenario(
                scenario_id="AI_003",
                title="💰 Value Opportunity in Healthcare",
                description="AI sentiment analysis shows healthcare sector oversold. XLV down 19.6% despite strong fundamentals. Pattern recognition suggests reversal opportunity.",
                user_type="Balanced",
                portfolio_impact="Medium",
                recommendation="Accumulate healthcare positions during weakness",
                action_items=[
                    "Increase Johnson & Johnson (JNJ) allocation",
                    "Add Healthcare Select Sector SPDR (XLV)",
                    "Consider biotech exposure with moderate allocation",
                    "Set stop-loss levels for risk management"
                ],
                expected_outcome="Position for healthcare sector recovery with 15-20% upside",
                risk_level="Medium",
                time_horizon="6-12 months",
                created_at=datetime.datetime.now()
            ),
            
            AIScenario(
                scenario_id="AI_004",
                title="📈 Bond Market Positioning",
                description="AI analysis of Fed policy indicates interest rate environment favorable for bonds. BND and VTEB showing relative strength with 4.3% yields.",
                user_type="Conservative",
                portfolio_impact="Low",
                recommendation="Increase fixed income allocation ahead of rate cuts",
                action_items=[
                    "Add Vanguard Total Bond Market (BND)",
                    "Increase tax-exempt bonds (VTEB) for tax efficiency",
                    "Reduce cash position earning 0% returns",
                    "Ladder bond maturities for flexibility"
                ],
                expected_outcome="Enhanced income generation with capital preservation",
                risk_level="Low",
                time_horizon="3-6 months",
                created_at=datetime.datetime.now()
            ),
            
            AIScenario(
                scenario_id="AI_005",
                title="🌍 International Diversification Alert",
                description="AI geographic analysis shows 85% US concentration. International markets (EFA, VTIAX) underperforming but offering diversification benefits.",
                user_type="Balanced",
                portfolio_impact="Medium",
                recommendation="Gradually increase international exposure for diversification",
                action_items=[
                    "Add iShares MSCI EAFE (EFA) for developed markets",
                    "Consider emerging markets with small allocation",
                    "Monitor currency hedging opportunities",
                    "Rebalance quarterly to maintain target allocation"
                ],
                expected_outcome="Improved portfolio diversification and reduced US market risk",
                risk_level="Medium",
                time_horizon="12+ months",
                created_at=datetime.datetime.now()
            ),
            
            AIScenario(
                scenario_id="AI_006",
                title="⚡ Energy Transition Opportunity",
                description="AI trend analysis identifies energy sector rotation from traditional to renewable. VDE down 14.7% while clean energy gaining momentum.",
                user_type="Growth",
                portfolio_impact="Medium",
                recommendation="Rotate from traditional energy to clean energy themes",
                action_items=[
                    "Reduce Vanguard Energy ETF (VDE) exposure",
                    "Add clean energy ETF positions",
                    "Consider Tesla (TSLA) for EV exposure",
                    "Monitor ESG-focused fund opportunities"
                ],
                expected_outcome="Position for long-term energy transition with growth potential",
                risk_level="High",
                time_horizon="2-5 years",
                created_at=datetime.datetime.now()
            ),
            
            AIScenario(
                scenario_id="AI_007",
                title="🏠 Real Estate Rebalancing",
                description="AI analysis shows real estate (VNQ) down 7.6% but historically strong inflation hedge. REITs offering 4-5% dividend yields.",
                user_type="Balanced",
                portfolio_impact="Low",
                recommendation="Maintain real estate allocation for inflation protection",
                action_items=[
                    "Hold Vanguard Real Estate ETF (VNQ) position",
                    "Consider additional REIT exposure if underweight",
                    "Focus on dividend-paying real estate funds",
                    "Monitor interest rate sensitivity"
                ],
                expected_outcome="Maintain inflation hedge with steady dividend income",
                risk_level="Medium",
                time_horizon="1-3 years",
                created_at=datetime.datetime.now()
            ),
            
            AIScenario(
                scenario_id="AI_008",
                title="💎 Precious Metals Strategy",
                description="AI sentiment analysis shows gold miners (GDX) oversold at -19.8%. Historical patterns suggest potential reversal during market uncertainty.",
                user_type="Conservative",
                portfolio_impact="Low",
                recommendation="Small allocation to precious metals for portfolio insurance",
                action_items=[
                    "Limit gold exposure to 5% maximum",
                    "Consider physical gold ETFs over mining stocks",
                    "Use as hedge against inflation and currency risk",
                    "Monitor correlation with other assets"
                ],
                expected_outcome="Portfolio insurance against market volatility and inflation",
                risk_level="Medium",
                time_horizon="Long-term",
                created_at=datetime.datetime.now()
            ),
            
            AIScenario(
                scenario_id="AI_009",
                title="🚀 Quality Growth Strategy",
                description="AI stock screening identifies quality companies (MSFT +24.6%, AAPL +26.6%) with strong fundamentals outperforming market consistently.",
                user_type="Growth",
                portfolio_impact="High",
                recommendation="Focus on quality growth stocks with proven track records",
                action_items=[
                    "Increase allocation to Microsoft (MSFT)",
                    "Add Apple (AAPL) for technology exposure",
                    "Include Alphabet (GOOGL) despite recent weakness",
                    "Avoid speculative high-risk positions"
                ],
                expected_outcome="Sustainable growth with lower volatility than speculative stocks",
                risk_level="Medium",
                time_horizon="3-5 years",
                created_at=datetime.datetime.now()
            ),
            
            AIScenario(
                scenario_id="AI_010",
                title="🎯 Target-Date Optimization",
                description="AI lifecycle analysis suggests age-appropriate allocation adjustment. Current 78% equity exposure may be too aggressive for risk tolerance.",
                user_type="Balanced",
                portfolio_impact="Medium",
                recommendation="Adjust allocation based on investment timeline and age",
                action_items=[
                    "Reduce equity exposure to age-appropriate level",
                    "Increase bond allocation gradually over time",
                    "Consider target-date funds for automatic rebalancing",
                    "Review allocation annually"
                ],
                expected_outcome="Risk-appropriate portfolio aligned with investment timeline",
                risk_level="Low",
                time_horizon="Ongoing",
                created_at=datetime.datetime.now()
            )
        ]
        
        return scenarios
    
    def get_scenarios_for_user(self, user_id: str = None, user_type: str = None, limit: int = 5) -> List[Dict[str, Any]]:
        """Get AI scenarios formatted for API response"""
        if user_type:
            filtered_scenarios = [s for s in self.scenarios if s.user_type == user_type or s.user_type in ['Balanced', 'Growth']]
        else:
            filtered_scenarios = self.scenarios
        
        # Return top scenarios based on relevance
        selected_scenarios = filtered_scenarios[:limit]
        
        return [
            {
                'scenario_id': s.scenario_id,
                'title': s.title,
                'description': s.description,
                'user_type': s.user_type,
                'portfolio_impact': s.portfolio_impact,
                'recommendation': s.recommendation,
                'action_items': s.action_items,
                'expected_outcome': s.expected_outcome,
                'risk_level': s.risk_level,
                'time_horizon': s.time_horizon,
                'created_at': s.created_at.isoformat()
            }
            for s in selected_scenarios
        ]
    
    def get_personalized_scenarios(self, customer_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate personalized scenarios based on customer profile"""
        scenarios = []
        
        # Extract customer info
        category = customer_profile.get('category', 'Balanced')
        equity_drift = customer_profile.get('equity_drift', 0)
        current_equity = customer_profile.get('current_allocation', {}).get('equity', 0)
        target_equity = customer_profile.get('target_allocation', {}).get('equity', 50)
        portfolio_value = customer_profile.get('portfolio_value', 0)
        avg_return = customer_profile.get('avg_return', 0)
        age = customer_profile.get('age', 40)
        
        # Scenario 1: Allocation Drift Analysis
        if equity_drift > 10:
            scenarios.append({
                'scenario_id': f"PERS_{customer_profile['user_id']}_001",
                'title': f"🎯 Critical Allocation Rebalancing for {customer_profile['name']}",
                'description': f"Portfolio shows {equity_drift:.1f}% equity drift from target. Current equity allocation at {current_equity:.1f}% vs {target_equity}% target.",
                'recommendation': "Immediate rebalancing required to align with investment objectives",
                'action_items': self._get_rebalancing_actions(current_equity, target_equity, portfolio_value),
                'impact_level': 'High',
                'urgency': 'Immediate'
            })
        elif equity_drift > 5:
            scenarios.append({
                'scenario_id': f"PERS_{customer_profile['user_id']}_001",
                'title': f"⚖️ Moderate Rebalancing for {customer_profile['name']}",
                'description': f"Portfolio showing {equity_drift:.1f}% allocation drift. Gradual rebalancing recommended.",
                'recommendation': "Schedule rebalancing within next quarter",
                'action_items': self._get_rebalancing_actions(current_equity, target_equity, portfolio_value),
                'impact_level': 'Medium',
                'urgency': 'Medium'
            })
        
        # Scenario 2: Performance Analysis
        if avg_return < 0:
            scenarios.append({
                'scenario_id': f"PERS_{customer_profile['user_id']}_002",
                'title': f"📉 Performance Recovery Plan for {customer_profile['name']}",
                'description': f"Portfolio showing {avg_return:.1f}% average return. Underperforming holdings need attention.",
                'recommendation': "Review and replace underperforming assets",
                'action_items': [
                    "Identify worst performing funds (bottom 20%)",
                    "Research replacement options with better track records",
                    "Gradually exit poor performers to avoid tax impact",
                    "Reinvest in quality index funds or sector leaders"
                ],
                'impact_level': 'High',
                'urgency': 'High'
            })
        elif avg_return > 15:
            scenarios.append({
                'scenario_id': f"PERS_{customer_profile['user_id']}_002",
                'title': f"🏆 Profit Taking Strategy for {customer_profile['name']}",
                'description': f"Excellent portfolio performance at {avg_return:.1f}% return. Consider profit-taking opportunities.",
                'recommendation': "Lock in gains from top performers while maintaining growth exposure",
                'action_items': [
                    "Identify top 20% performers for partial profit-taking",
                    "Rebalance gains into underweight sectors",
                    "Consider tax-loss harvesting opportunities",
                    "Maintain core growth positions"
                ],
                'impact_level': 'Medium',
                'urgency': 'Low'
            })
        
        # Scenario 3: Age-based recommendations
        if age >= 50:
            scenarios.append({
                'scenario_id': f"PERS_{customer_profile['user_id']}_003",
                'title': f"🛡️ Pre-Retirement Strategy for {customer_profile['name']}",
                'description': f"At age {age}, consider shifting to more conservative allocation for capital preservation.",
                'recommendation': "Gradually reduce equity exposure and increase bond allocation",
                'action_items': [
                    f"Target equity allocation of {100-age}% (current: {current_equity:.1f}%)",
                    "Increase bond allocation by 5-10%",
                    "Add inflation-protected securities (TIPS)",
                    "Consider dividend-focused equity funds"
                ],
                'impact_level': 'Medium',
                'urgency': 'Low'
            })
        elif age <= 35:
            scenarios.append({
                'scenario_id': f"PERS_{customer_profile['user_id']}_003",
                'title': f"🚀 Growth Acceleration for {customer_profile['name']}",
                'description': f"At age {age}, you can afford higher risk for potentially higher returns.",
                'recommendation': "Consider increasing growth allocation for long-term wealth building",
                'action_items': [
                    "Increase equity allocation to 80-90%",
                    "Add emerging market exposure for diversification",
                    "Consider small-cap and growth funds",
                    "Minimize bond allocation to 10-15%"
                ],
                'impact_level': 'Medium',
                'urgency': 'Low'
            })
        
        # Scenario 4: Category-specific recommendations
        if category == 'Conservative' and current_equity > 40:
            scenarios.append({
                'scenario_id': f"PERS_{customer_profile['user_id']}_004",
                'title': f"🔒 Conservative Alignment for {customer_profile['name']}",
                'description': f"Conservative investor with {current_equity:.1f}% equity exposure may be taking too much risk.",
                'recommendation': "Align portfolio with conservative risk tolerance",
                'action_items': [
                    "Reduce equity allocation to 30-35%",
                    "Increase high-grade bond allocation",
                    "Add cash equivalents for stability",
                    "Focus on dividend-paying blue-chip stocks"
                ],
                'impact_level': 'Medium',
                'urgency': 'Medium'
            })
        elif category == 'Aggressive' and current_equity < 70:
            scenarios.append({
                'scenario_id': f"PERS_{customer_profile['user_id']}_004",
                'title': f"⚡ Aggressive Growth Boost for {customer_profile['name']}",
                'description': f"Aggressive investor with only {current_equity:.1f}% equity allocation missing growth opportunities.",
                'recommendation': "Increase equity exposure to match aggressive risk profile",
                'action_items': [
                    "Target 75-85% equity allocation",
                    "Add growth and small-cap exposure",
                    "Consider sector-specific ETFs",
                    "Reduce bond allocation to minimum"
                ],
                'impact_level': 'High',
                'urgency': 'Medium'
            })
        
        return scenarios[:3]  # Return top 3 personalized scenarios
    
    def _get_rebalancing_actions(self, current_equity, target_equity, portfolio_value):
        """Generate specific rebalancing action items"""
        if current_equity > target_equity:
            excess = current_equity - target_equity
            amount_to_rebalance = (excess / 100) * portfolio_value
            return [
                f"Sell approximately ${amount_to_rebalance:,.0f} from equity positions",
                "Target overweight funds with highest gains for tax efficiency",
                "Reinvest proceeds in bond funds to reach target allocation",
                "Consider tax-loss harvesting opportunities"
            ]
        else:
            shortfall = target_equity - current_equity
            amount_to_add = (shortfall / 100) * portfolio_value
            return [
                f"Add approximately ${amount_to_add:,.0f} to equity positions",
                "Source funds from bond positions or new contributions",
                "Focus on underweight sectors or index funds",
                "Dollar-cost average over 30-60 days"
            ]
    
    def get_quick_scenarios(self) -> List[Dict[str, Any]]:
        """Get 5 quick AI scenarios for immediate display"""
        quick_scenarios = [
            {
                'title': '🤖 AI Tech Rebalancing',
                'description': 'Portfolio overexposed to tech (72.5% vs 60% target)',
                'action': 'Trim NVIDIA, add bonds',
                'impact': 'High',
                'urgency': 'Medium'
            },
            {
                'title': '🔴 Growth Stock Alert',
                'description': 'ARK funds down 66%, need immediate attention',
                'action': 'Exit ARKK, buy VTI',
                'impact': 'High', 
                'urgency': 'Immediate'
            },
            {
                'title': '💰 Healthcare Opportunity',
                'description': 'XLV oversold, strong fundamentals',
                'action': 'Add JNJ, buy XLV',
                'impact': 'Medium',
                'urgency': 'Low'
            },
            {
                'title': '📈 Bond Positioning',
                'description': 'Fed policy favors fixed income',
                'action': 'Increase BND allocation',
                'impact': 'Low',
                'urgency': 'Medium'
            },
            {
                'title': '🎯 Risk Adjustment',
                'description': 'Portfolio too aggressive for age',
                'action': 'Reduce equity to 65%',
                'impact': 'Medium',
                'urgency': 'Low'
            }
        ]
        
        return quick_scenarios 