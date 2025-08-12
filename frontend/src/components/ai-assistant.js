/**
 * AI Assistant JavaScript
 * Handles all functionality for the AI Portfolio Assistant interface
 */

class AIAssistant {
    constructor() {
        this.baseUrl = window.location.origin;
        this.currentUser = this.getCurrentUser();
        this.currentAgent = 'chat';
        this.initialize();
    }

    getCurrentUser() {
        // Get user ID from URL parameters or default
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('user') || 'USR000001';
    }

    initialize() {
        this.setupEventListeners();
        this.loadAgentStatus();
        
        // Auto-focus on chat input
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.focus();
        }
    }

    setupEventListeners() {
        // Agent switching
        document.querySelectorAll('.agent-item').forEach(item => {
            item.addEventListener('click', () => {
                const agentType = item.getAttribute('data-agent');
                this.switchAgent(agentType);
            });
        });

        // Auto-load data for non-chat panels when they become active
        this.setupPanelObservers();
        
        // Load scenarios immediately on page load
        this.loadAIScenarios();
        
        // Load customers for portfolio analysis
        this.loadCustomers();
    }

    setupPanelObservers() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    if (target.classList.contains('active')) {
                        this.loadPanelData(target.id);
                    }
                }
            });
        });

        document.querySelectorAll('.ai-panel').forEach(panel => {
            observer.observe(panel, { attributes: true });
        });
    }

    switchAgent(agentType) {
        // Update active agent item
        document.querySelectorAll('.agent-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-agent="${agentType}"]`).classList.add('active');

        // Update active panel
        document.querySelectorAll('.ai-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        const panelMap = {
            'chat': 'chatPanel',
            'analysis': 'analysisPanel',
            'risk': 'riskPanel',
            'market': 'marketPanel',
            'goals': 'goalsPanel',
            'monitoring': 'monitoringPanel'
        };
        
        const targetPanel = document.getElementById(panelMap[agentType]);
        if (targetPanel) {
            targetPanel.classList.add('active');
            this.currentAgent = agentType;
        }
    }

    async loadPanelData(panelId) {
        switch (panelId) {
            case 'analysisPanel':
                await this.loadPortfolioAnalysis();
                break;
            case 'riskPanel':
                await this.loadRiskAnalysis();
                break;
            case 'marketPanel':
                await this.loadMarketIntelligence();
                break;
            case 'goalsPanel':
                await this.loadGoalsAnalysis();
                break;
            case 'monitoringPanel':
                await this.loadMonitoringData();
                break;
        }
    }

    // Chat functionality
    handleKeyPress(event) {
        if (event.key === 'Enter') {
            this.sendMessage();
        }
    }

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;

        // Clear input and add user message
        input.value = '';
        this.addMessage('user', message);

        // Show typing indicator
        this.showTypingIndicator();

        try {
            const response = await fetch(`${this.baseUrl}/api/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: this.currentUser,
                    message: message
                })
            });

            const result = await response.json();

            // Remove typing indicator
            this.removeTypingIndicator();

            if (result.success) {
                this.addMessage('assistant', result.response);
                this.updateQuickSuggestions(result.suggestions);
            } else {
                this.addMessage('assistant', 'I\'m having trouble processing your request right now. Please try again.');
            }
        } catch (error) {
            this.removeTypingIndicator();
            this.addMessage('assistant', 'I\'m currently offline. Please check your connection and try again.');
        }
    }

    sendQuickMessage(message) {
        document.getElementById('chatInput').value = message;
        this.sendMessage();
    }

    addMessage(role, content) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;

        const avatarIcon = role === 'user' ? 'fas fa-user' : 'fas fa-robot';
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="${avatarIcon}"></i>
            </div>
            <div class="message-content">
                <div class="message-text">${this.formatMessage(content)}</div>
                <div class="message-time">${time}</div>
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    formatMessage(content) {
        // Convert markdown-style formatting to HTML
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="message-text">
                    <i class="fas fa-ellipsis-h fa-pulse"></i> Thinking...
                </div>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    removeTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    updateQuickSuggestions(suggestions) {
        const suggestionsContainer = document.getElementById('quickSuggestions');
        if (suggestions && suggestions.length > 0) {
            suggestionsContainer.innerHTML = suggestions.map(suggestion => 
                `<button class="suggestion-btn" onclick="aiAssistant.sendQuickMessage('${suggestion}')">${suggestion}</button>`
            ).join('');
        }
    }

    // Portfolio Analysis
    async loadPortfolioAnalysis() {
        const container = document.getElementById('analysisGrid');
        
        try {
            const response = await fetch(`${this.baseUrl}/api/ai/portfolio-analysis/${this.currentUser}`);
            const result = await response.json();

            if (result.success) {
                container.innerHTML = `
                    <div class="analysis-card">
                        <h3><i class="fas fa-chart-line"></i> Portfolio Overview</h3>
                        <div class="analysis-content-text">${this.formatMessage(result.portfolio_analysis)}</div>
                    </div>
                    <div class="analysis-card">
                        <h3><i class="fas fa-shield-alt"></i> Risk Analysis</h3>
                        <div class="analysis-content-text">${this.formatMessage(result.risk_analysis)}</div>
                    </div>
                    <div class="analysis-card">
                        <h3><i class="fas fa-balance-scale"></i> Rebalancing</h3>
                        <div class="analysis-content-text">${this.formatMessage(result.rebalancing_suggestions)}</div>
                    </div>
                `;
            } else {
                container.innerHTML = '<div class="analysis-loading"><p>Unable to load analysis data</p></div>';
            }
        } catch (error) {
            container.innerHTML = '<div class="analysis-loading"><p>Error loading analysis data</p></div>';
        }
    }

    // Risk Management
    async loadRiskAnalysis() {
        const container = document.getElementById('riskDashboard');
        
        try {
            const response = await fetch(`${this.baseUrl}/api/ai/risk-alerts/${this.currentUser}`);
            const result = await response.json();

            if (result.success) {
                if (result.alerts && result.alerts.length > 0) {
                    container.innerHTML = result.alerts.map(alert => `
                        <div class="risk-card ${alert.level}">
                            <h3><i class="fas fa-exclamation-triangle"></i> ${alert.type.replace('_', ' ').toUpperCase()}</h3>
                            <p><strong>Level:</strong> ${alert.level.toUpperCase()}</p>
                            <p><strong>Issue:</strong> ${alert.message}</p>
                            <div><strong>Recommendations:</strong>
                                <ul>${alert.recommendations.map(rec => `<li>${rec}</li>`).join('')}</ul>
                            </div>
                        </div>
                    `).join('');
                } else {
                    container.innerHTML = `
                        <div class="risk-card low">
                            <h3><i class="fas fa-check-circle"></i> Portfolio Risk Status</h3>
                            <p>Your portfolio appears to be within acceptable risk parameters.</p>
                            <div><strong>Recommendations:</strong>
                                <ul>
                                    <li>Continue regular monitoring</li>
                                    <li>Review allocation quarterly</li>
                                    <li>Consider diversification opportunities</li>
                                </ul>
                            </div>
                        </div>
                    `;
                }
            } else {
                container.innerHTML = '<div class="risk-loading"><p>Unable to load risk data</p></div>';
            }
        } catch (error) {
            container.innerHTML = '<div class="risk-loading"><p>Error loading risk data</p></div>';
        }
    }

    // Market Intelligence
    async loadMarketIntelligence() {
        const container = document.getElementById('marketInsights');
        
        try {
            const response = await fetch(`${this.baseUrl}/api/ai/market-intelligence`);
            const result = await response.json();

            if (result.success) {
                container.innerHTML = result.insights.map(insight => `
                    <div class="insight-card ${insight.impact}">
                        <div class="insight-header">
                            <h3 class="insight-title">${insight.title}</h3>
                            <span class="insight-type">${insight.type}</span>
                        </div>
                        <div class="insight-content">${insight.content}</div>
                        <div class="insight-meta">
                            <span>Impact: ${insight.impact}</span>
                            <span>Relevance: ${(insight.relevance_score * 100).toFixed(0)}%</span>
                        </div>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<div class="market-loading"><p>Unable to load market data</p></div>';
            }
        } catch (error) {
            container.innerHTML = '<div class="market-loading"><p>Error loading market data</p></div>';
        }
    }

    // Goal Planning
    async loadGoalsAnalysis() {
        const container = document.getElementById('goalsDashboard');
        
        try {
            const response = await fetch(`${this.baseUrl}/api/ai/goals/${this.currentUser}`);
            const result = await response.json();

            if (result.success) {
                container.innerHTML = `
                    <div class="goal-card">
                        <h3><i class="fas fa-bullseye"></i> Financial Planning Analysis</h3>
                        <div class="analysis-content-text">${this.formatMessage(result.planning_analysis)}</div>
                    </div>
                `;
            } else {
                container.innerHTML = '<div class="goals-loading"><p>Unable to load goals data</p></div>';
            }
        } catch (error) {
            container.innerHTML = '<div class="goals-loading"><p>Error loading goals data</p></div>';
        }
    }

    // Monitoring
    async loadMonitoringData() {
        const container = document.getElementById('monitoringDashboard');
        
        try {
            const response = await fetch(`${this.baseUrl}/api/ai/monitoring/alerts`);
            const result = await response.json();

            if (result.success) {
                if (result.alerts && result.alerts.length > 0) {
                    container.innerHTML = result.alerts.map(alert => `
                        <div class="monitoring-card">
                            <h3><i class="fas fa-bell"></i> ${alert.type.toUpperCase()}</h3>
                            <p><strong>User:</strong> ${alert.user_id}</p>
                            <p><strong>Priority:</strong> ${alert.priority}</p>
                            <p><strong>Message:</strong> ${alert.message}</p>
                            <div><strong>Recommendations:</strong>
                                <ul>${alert.recommendations.map(rec => `<li>${rec}</li>`).join('')}</ul>
                            </div>
                        </div>
                    `).join('');
                } else {
                    container.innerHTML = `
                        <div class="monitoring-card">
                            <h3><i class="fas fa-check-circle"></i> Monitoring Status</h3>
                            <p>All portfolios are being monitored successfully.</p>
                            <p><strong>Status:</strong> Active</p>
                            <p><strong>Last Check:</strong> ${new Date().toLocaleString()}</p>
                            <p>No alerts or actions required at this time.</p>
                        </div>
                    `;
                }
            } else {
                container.innerHTML = '<div class="monitoring-loading"><p>Unable to load monitoring data</p></div>';
            }
        } catch (error) {
            container.innerHTML = '<div class="monitoring-loading"><p>Error loading monitoring data</p></div>';
        }
    }

    // Agent Status
    async loadAgentStatus() {
        try {
            const response = await fetch(`${this.baseUrl}/api/ai/agent-status`);
            const result = await response.json();

            if (result.success) {
                const statusContainer = document.getElementById('agentStatus');
                const activeAgents = Object.keys(result.status).filter(key => 
                    ['portfolio_assistant', 'auto_rebalancing', 'market_intelligence', 'goal_planning', 'risk_management'].includes(key)
                );

                statusContainer.innerHTML = `
                    <div class="status-item">
                        <span class="status-dot active"></span>
                        <span>${activeAgents.length} agents active</span>
                    </div>
                    <div class="status-item">
                        <span class="status-dot"></span>
                        <span>${result.status.total_insights} insights</span>
                    </div>
                `;
            }
        } catch (error) {
            console.log('Agent status not available');
        }
    }
    
    // AI Scenarios
    async loadAIScenarios() {
        try {
            const response = await fetch(`${this.baseUrl}/api/ai/scenarios`);
            const result = await response.json();

            if (result.success) {
                this.displayAIScenarios(result.scenarios, result.quick_scenarios);
            }
        } catch (error) {
            console.log('AI scenarios not available');
        }
    }
    
    displayAIScenarios(scenarios, quickScenarios) {
        // Update chat suggestions with AI scenarios
        const suggestionsContainer = document.getElementById('quickSuggestions');
        if (suggestionsContainer && quickScenarios) {
            const scenarioButtons = quickScenarios.map(scenario => 
                `<button class="suggestion-btn scenario-btn" onclick="aiAssistant.explainScenario('${scenario.title}')">
                    ${scenario.title}
                </button>`
            ).join('');
            
            suggestionsContainer.innerHTML = scenarioButtons;
        }
        
        // Add scenario cards to analysis panel
        const analysisGrid = document.getElementById('analysisGrid');
        if (analysisGrid && scenarios) {
            const scenarioCards = scenarios.slice(0, 6).map(scenario => `
                <div class="analysis-card scenario-card">
                    <h3>${scenario.title}</h3>
                    <div class="scenario-meta">
                        <span class="scenario-impact ${scenario.portfolio_impact.toLowerCase()}">${scenario.portfolio_impact} Impact</span>
                        <span class="scenario-risk">${scenario.risk_level} Risk</span>
                    </div>
                    <div class="analysis-content-text">
                        <p><strong>Analysis:</strong> ${scenario.description}</p>
                        <p><strong>Recommendation:</strong> ${scenario.recommendation}</p>
                        <div class="action-items">
                            <strong>Action Items:</strong>
                            <ul>${scenario.action_items.map(item => `<li>${item}</li>`).join('')}</ul>
                        </div>
                        <p><strong>Expected Outcome:</strong> ${scenario.expected_outcome}</p>
                    </div>
                    <div class="scenario-footer">
                        <span>Timeline: ${scenario.time_horizon}</span>
                        <button class="implement-btn" onclick="aiAssistant.implementScenario('${scenario.scenario_id}')">
                            Implement
                        </button>
                    </div>
                </div>
            `).join('');
            
            analysisGrid.innerHTML = scenarioCards;
        }
    }
    
    explainScenario(title) {
        const input = document.getElementById('chatInput');
        input.value = `Tell me more about: ${title}`;
        this.sendMessage();
    }
    
    implementScenario(scenarioId) {
        const input = document.getElementById('chatInput');
        input.value = `I want to implement scenario ${scenarioId}. Show me the specific steps.`;
        this.sendMessage();
    }
    
    // Customer Management
    async loadCustomers() {
        try {
            const response = await fetch(`${this.baseUrl}/api/ai/customers`);
            const result = await response.json();

            if (result.success) {
                this.displayCustomers(result.customers);
            }
        } catch (error) {
            console.log('Customers not available');
        }
    }
    
    displayCustomers(customers) {
        const customerGrid = document.getElementById('customerGrid');
        if (!customerGrid) return;
        
        const customerCards = customers.map(customer => `
            <div class="customer-card ${customer.rebalancing_priority.toLowerCase()}-priority" 
                 onclick="aiAssistant.selectCustomer('${customer.user_id}')">
                <div class="customer-header">
                    <h4>${customer.name}</h4>
                    <div class="priority-badge ${customer.rebalancing_priority.toLowerCase()}">
                        ${customer.rebalancing_priority} Priority
                    </div>
                </div>
                <div class="customer-details">
                    <div class="customer-stat">
                        <span class="stat-label">Age:</span>
                        <span class="stat-value">${customer.age}</span>
                    </div>
                    <div class="customer-stat">
                        <span class="stat-label">Category:</span>
                        <span class="stat-value">${customer.category}</span>
                    </div>
                    <div class="customer-stat">
                        <span class="stat-label">Portfolio:</span>
                        <span class="stat-value">$${(customer.portfolio_value || 0).toLocaleString()}</span>
                    </div>
                    <div class="customer-stat">
                        <span class="stat-label">Return:</span>
                        <span class="stat-value ${customer.avg_return >= 0 ? 'positive' : 'negative'}">
                            ${customer.avg_return >= 0 ? '+' : ''}${customer.avg_return.toFixed(1)}%
                        </span>
                    </div>
                </div>
                <div class="allocation-drift">
                    <div class="drift-info">
                        <span>Allocation Drift: ${customer.equity_drift.toFixed(1)}%</span>
                        <div class="drift-bar">
                            <div class="drift-fill" style="width: ${Math.min(customer.equity_drift * 2, 100)}%"></div>
                        </div>
                    </div>
                </div>
                <div class="customer-actions">
                    <span class="holdings-count">${customer.holdings_count} holdings</span>
                    <button class="analyze-btn">Analyze Portfolio</button>
                </div>
            </div>
        `).join('');
        
        customerGrid.innerHTML = customerCards;
    }
    
    async selectCustomer(userId) {
        try {
            // Highlight selected customer
            document.querySelectorAll('.customer-card').forEach(card => {
                card.classList.remove('selected');
            });
            event.currentTarget.classList.add('selected');
            
            // Load personalized scenarios for this customer
            const response = await fetch(`${this.baseUrl}/api/ai/scenarios/${userId}`);
            const result = await response.json();
            
            if (result.success) {
                this.displayPersonalizedAnalysis(result);
            }
        } catch (error) {
            console.log('Error loading customer scenarios:', error);
        }
    }
    
    displayPersonalizedAnalysis(data) {
        const analysisContainer = document.getElementById('selectedCustomerAnalysis');
        const customerName = document.getElementById('selectedCustomerName');
        const customerProfile = document.getElementById('customerProfile');
        const scenarioCards = document.getElementById('scenarioCards');
        
        if (!analysisContainer) return;
        
        const profile = data.customer_profile;
        
        // Update customer name
        customerName.textContent = `📊 Analysis for ${profile.name}`;
        
        // Display customer profile
        customerProfile.innerHTML = `
            <div class="profile-stats">
                <div class="profile-stat">
                    <span class="stat-icon">👤</span>
                    <div class="stat-info">
                        <span class="stat-label">Age & Category</span>
                        <span class="stat-value">${profile.age} years, ${profile.category}</span>
                    </div>
                </div>
                <div class="profile-stat">
                    <span class="stat-icon">💰</span>
                    <div class="stat-info">
                        <span class="stat-label">Portfolio Value</span>
                        <span class="stat-value">$${profile.portfolio_value.toLocaleString()}</span>
                    </div>
                </div>
                <div class="profile-stat">
                    <span class="stat-icon">📈</span>
                    <div class="stat-info">
                        <span class="stat-label">Average Return</span>
                        <span class="stat-value ${profile.avg_return >= 0 ? 'positive' : 'negative'}">
                            ${profile.avg_return >= 0 ? '+' : ''}${profile.avg_return.toFixed(1)}%
                        </span>
                    </div>
                </div>
                <div class="profile-stat">
                    <span class="stat-icon">⚖️</span>
                    <div class="stat-info">
                        <span class="stat-label">Allocation Drift</span>
                        <span class="stat-value">${profile.equity_drift.toFixed(1)}%</span>
                    </div>
                </div>
            </div>
            <div class="allocation-comparison">
                <div class="allocation-section">
                    <h5>Current vs Target Allocation</h5>
                    <div class="allocation-bars">
                        <div class="allocation-bar">
                            <span class="allocation-label">Equity</span>
                            <div class="bar-container">
                                <div class="bar current" style="width: ${profile.current_allocation.equity}%"></div>
                                <div class="bar target" style="width: ${profile.target_allocation.equity}%"></div>
                            </div>
                            <span class="allocation-values">
                                ${profile.current_allocation.equity}% / ${profile.target_allocation.equity}%
                            </span>
                        </div>
                        <div class="allocation-bar">
                            <span class="allocation-label">Bonds</span>
                            <div class="bar-container">
                                <div class="bar current" style="width: ${profile.current_allocation.bonds}%"></div>
                                <div class="bar target" style="width: ${profile.target_allocation.bonds}%"></div>
                            </div>
                            <span class="allocation-values">
                                ${profile.current_allocation.bonds}% / ${profile.target_allocation.bonds}%
                            </span>
                        </div>
                    </div>
                    <div class="allocation-legend">
                        <span class="legend-item current">Current</span>
                        <span class="legend-item target">Target</span>
                    </div>
                </div>
            </div>
        `;
        
        // Display personalized scenarios
        const personalizedScenarios = data.personalized_scenarios || [];
        const generalScenarios = data.general_scenarios || [];
        
        const allScenarios = [...personalizedScenarios, ...generalScenarios];
        
        if (allScenarios.length > 0) {
            const scenarioCardsHtml = allScenarios.map((scenario, index) => `
                <div class="scenario-card personalized">
                    <div class="scenario-header">
                        <h4>${scenario.title}</h4>
                        <div class="scenario-badges">
                            ${scenario.impact_level ? `<span class="impact-badge ${scenario.impact_level.toLowerCase()}">${scenario.impact_level}</span>` : ''}
                            ${scenario.urgency ? `<span class="urgency-badge ${scenario.urgency.toLowerCase()}">${scenario.urgency}</span>` : ''}
                        </div>
                    </div>
                    <div class="scenario-content">
                        <p class="scenario-description">${scenario.description}</p>
                        <p class="scenario-recommendation"><strong>Recommendation:</strong> ${scenario.recommendation}</p>
                        ${scenario.action_items ? `
                            <div class="action-items">
                                <strong>Action Steps:</strong>
                                <ul>
                                    ${scenario.action_items.map(item => `<li>${item}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                    <div class="scenario-footer">
                        <button class="implement-scenario-btn" onclick="aiAssistant.implementPersonalizedScenario('${scenario.scenario_id}', '${profile.name}')">
                            Implement for ${profile.name}
                        </button>
                    </div>
                </div>
            `).join('');
            
            scenarioCards.innerHTML = scenarioCardsHtml;
        } else {
            scenarioCards.innerHTML = '<div class="no-scenarios">No personalized scenarios available for this customer.</div>';
        }
        
        // Show the analysis container
        analysisContainer.style.display = 'block';
        
        // Scroll to the analysis
        analysisContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    implementPersonalizedScenario(scenarioId, customerName) {
        const input = document.getElementById('chatInput');
        input.value = `I want to implement ${scenarioId} for customer ${customerName}. Show me the detailed steps and considerations.`;
        this.switchAgent('chat');
        this.sendMessage();
    }
}

// Initialize the AI Assistant when the page loads
window.addEventListener('DOMContentLoaded', () => {
    window.aiAssistant = new AIAssistant();
}); 