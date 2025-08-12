// Portfolio Management Portal - Main JavaScript Application

class PortfolioApp {
    constructor() {
        this.baseUrl = window.location.origin;
        this.currentTable = null;
        this.currentData = [];
        this.filteredData = [];
        this.currentUser = null;
        this.charts = {};
        this.selectedScenario = null;
        this.currentAssetClass = null;
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadStats();
        
        // Check for URL parameters to auto-load user dashboard
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('user');
        const view = urlParams.get('view');
        
        if (userId && view === 'dashboard') {
            // Auto-load user dashboard for new tab
            this.openUserDashboard(userId);
        } else {
            this.showWelcomeScreen();
        }
    }

    setupEventListeners() {
        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const table = e.currentTarget.dataset.table;
                
                // Force complete reset and reload
                this.resetAllStates();
                
                // Load the selected table
                this.loadTable(table);
                this.setActiveNavLink(e.currentTarget);
            });
        });

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterData(e.target.value);
            });
        }

        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.forceRefreshCurrentView();
        });

        // Export button
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }

        // Back to table button
        document.getElementById('backToTable').addEventListener('click', () => {
            this.backToTable();
        });

        // Back to dashboard button
        document.getElementById('backToDashboard').addEventListener('click', () => {
            this.backToDashboard();
        });

        // Behavioral Finance Coach buttons
        const lifeEventRebalanceBtn = document.getElementById('lifeEventRebalance');
        if (lifeEventRebalanceBtn) {
            lifeEventRebalanceBtn.addEventListener('click', () => {
                this.openBehavioralCoach();
            });
        }

        const behavioralCoachBtn = document.getElementById('behavioralCoach');
        if (behavioralCoachBtn) {
            behavioralCoachBtn.addEventListener('click', () => {
                this.openBehavioralCoach();
            });
        }

        // Back to dashboard from coach
        const backToDashboardFromCoach = document.getElementById('backToDashboardFromCoach');
        if (backToDashboardFromCoach) {
            backToDashboardFromCoach.addEventListener('click', () => {
                this.backToDashboard();
            });
        }

        // Coach form actions
        const resetCoachForm = document.getElementById('resetCoachForm');
        if (resetCoachForm) {
            resetCoachForm.addEventListener('click', () => {
                this.resetCoachForm();
            });
        }

        const analyzeAndRebalance = document.getElementById('analyzeAndRebalance');
        if (analyzeAndRebalance) {
            analyzeAndRebalance.addEventListener('click', () => {
                this.analyzeLifeEventAndBehavior();
            });
        }

        const saveRecommendations = document.getElementById('saveRecommendations');
        if (saveRecommendations) {
            saveRecommendations.addEventListener('click', () => {
                this.saveRecommendations();
            });
        }

        const implementRebalancing = document.getElementById('implementRebalancing');
        if (implementRebalancing) {
            implementRebalancing.addEventListener('click', () => {
                this.implementBehavioralRebalancing();
            });
        }

        // AI Coach integration in rebalancing page
        const enableAICoach = document.getElementById('enableAICoach');
        if (enableAICoach) {
            enableAICoach.addEventListener('click', () => {
                this.toggleAICoachInRebalancing(true);
            });
        }

        const useTraditionalRebalancing = document.getElementById('useTraditionalRebalancing');
        if (useTraditionalRebalancing) {
            useTraditionalRebalancing.addEventListener('click', () => {
                this.toggleAICoachInRebalancing(false);
            });
        }

        const getAIRecommendations = document.getElementById('getAIRecommendations');
        if (getAIRecommendations) {
            getAIRecommendations.addEventListener('click', () => {
                this.getAIRecommendationsForRebalancing();
            });
        }

        const clearAIForm = document.getElementById('clearAIForm');
        if (clearAIForm) {
            clearAIForm.addEventListener('click', () => {
                this.clearAIRebalancingForm();
            });
        }

        const modifyAIInputs = document.getElementById('modifyAIInputs');
        if (modifyAIInputs) {
            modifyAIInputs.addEventListener('click', () => {
                this.modifyAIInputs();
            });
        }

        const proceedWithAI = document.getElementById('proceedWithAI');
        if (proceedWithAI) {
            proceedWithAI.addEventListener('click', () => {
                this.proceedWithAIStrategy();
            });
        }

        // Rebalancing actions
        const cancelRebalance = document.getElementById('cancelRebalance');
        if (cancelRebalance) {
            cancelRebalance.addEventListener('click', () => {
                this.backToDashboard();
            });
        }

        const executeRebalance = document.getElementById('executeRebalance');
        if (executeRebalance) {
            executeRebalance.addEventListener('click', () => {
                this.executeRebalancing();
            });
        }

        const executeCustomRebalance = document.getElementById('executeCustomRebalance');
        if (executeCustomRebalance) {
            executeCustomRebalance.addEventListener('click', () => {
                this.executeCustomRebalancing();
            });
        }

        const viewUpdatedPortfolio = document.getElementById('viewUpdatedPortfolio');
        if (viewUpdatedPortfolio) {
            viewUpdatedPortfolio.addEventListener('click', () => {
                this.backToDashboard();
                setTimeout(() => {
                    this.loadUserDashboard(this.currentUser);
                }, 500);
            });
        }
    }

    resetAllStates() {
        // Clear all states
        this.currentUser = null;
        this.selectedScenario = null;
        this.currentAssetClass = null;
        this.currentUserData = null;
        
        // Clear data arrays
        this.currentData = [];
        this.filteredData = [];
        
        // Destroy any existing charts
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
        
        // Clear search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Hide export button initially
        document.getElementById('exportBtn').style.display = 'none';
        
        // Clear any cached DOM elements
        this.clearPreviousViews();
    }

    clearPreviousViews() {
        // Hide all main sections
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('dataContainer').style.display = 'none';
        document.getElementById('userDashboard').style.display = 'none';
        document.getElementById('rebalancingPage').style.display = 'none';
        
        // Remove view classes
        const dataContainer = document.getElementById('dataContainer');
        dataContainer.classList.remove('portfolio-view', 'market-data-view', 'allocation-models-view', 'investor-data-view');
        
        // Clear table wrapper content
        const tableWrapper = document.querySelector('.table-wrapper');
        if (tableWrapper) {
            tableWrapper.innerHTML = `
                <table id="dataTable" class="data-table">
                    <thead id="tableHeader">
                        <!-- Dynamic header will be inserted here -->
                    </thead>
                    <tbody id="tableBody">
                        <!-- Dynamic data will be inserted here -->
                    </tbody>
                </table>
            `;
        }
        
        // Reset loading states
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('dataTable').style.display = 'table';
    }

    forceRefreshCurrentView() {
        if (this.currentUser) {
            // Refresh user dashboard
            this.resetAllStates();
            this.loadUserDashboard(this.currentUser);
        } else if (this.currentTable) {
            // Refresh current table
            this.resetAllStates();
            this.loadTable(this.currentTable);
        } else {
            // Refresh welcome screen and stats
            this.resetAllStates();
            this.showWelcomeScreen();
            this.loadStats();
        }
    }

    setActiveNavLink(activeLink) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }

    showWelcomeScreen() {
        // Reset everything before showing welcome screen
        this.resetAllStates();
        
        document.getElementById('welcomeScreen').style.display = 'block';
        document.getElementById('dataContainer').style.display = 'none';
        document.getElementById('userDashboard').style.display = 'none';
        document.getElementById('rebalancingPage').style.display = 'none';
        document.getElementById('contentTitle').textContent = 'Welcome to Portfolio Management Portal';
        
        // Remove active states from all navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
    }

    async loadStats() {
        try {
            const response = await fetch(`${this.baseUrl}/api/stats`);
            const result = await response.json();
            
            if (result.success) {
                document.getElementById('investorCount').textContent = result.stats.investor_records;
                document.getElementById('portfolioCount').textContent = result.stats.portfolio_records;
                document.getElementById('productCount').textContent = result.stats.product_records;
                document.getElementById('masterCount').textContent = result.stats.master_allocation_records;
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async loadTable(tableName) {
        // Force complete reset before loading new table
        this.resetAllStates();
        
        this.currentTable = tableName;
        this.showLoadingSpinner();
        
        try {
            // Add cache-busting parameter to ensure fresh data
            const cacheBuster = Date.now();
            const response = await fetch(`${this.baseUrl}/api/${tableName}?_cb=${cacheBuster}`);
            const result = await response.json();
            
            if (result.success) {
                // Store fresh data
                this.currentData = result.data;
                this.filteredData = [...this.currentData];
                
                // Display the table with fresh data
                this.displayTable(tableName, this.filteredData);
                this.updateTitle(tableName);
                this.hideLoadingSpinner();
                document.getElementById('exportBtn').style.display = 'inline-flex';
                
                // Update record count
                this.updateRecordCount(this.filteredData.length);
                
            } else {
                this.showError(`Error loading data: ${result.error}`);
            }
        } catch (error) {
            console.error('Error loading table:', error);
            this.showError('Failed to load data. Please try again.');
        }
    }

    displayTable(tableName, data) {
        // Ensure clean state before display
        this.clearPreviousViews();
        
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('userDashboard').style.display = 'none';
        document.getElementById('rebalancingPage').style.display = 'none';
        document.getElementById('dataContainer').style.display = 'block';
        
        if (data.length === 0) {
            this.showEmptyState();
            return;
        }

        // Special handling for different table types
        if (tableName === 'investor-data') {
            this.displayInvestorDataProfessional(data);
        } else if (tableName === 'portfolio-allocation') {
            this.displayPortfolioAllocationProfessional(data);
        } else if (tableName === 'product-market-data') {
            this.displayProductMarketDataProfessional(data);
        } else if (tableName === 'master-allocation-model') {
            this.displayMasterAllocationModelProfessional(data);
        } else if (tableName === 'ai-rebalancing') {
            this.displayAIRebalancingProfessional(data);
        } else {
            // Show regular table for other data types
            document.getElementById('dataTable').style.display = 'table';
            const headers = Object.keys(data[0]);
            this.createTableHeaders(headers);
            this.createTableBody(data, tableName);
        }
        
        this.updateRecordCount(data.length);
    }

    displayInvestorDataProfessional(data) {
        // Hide the traditional table structure
        document.getElementById('dataTable').style.display = 'none';
        
        // Add investor data view class for special styling
        const dataContainer = document.getElementById('dataContainer');
        dataContainer.classList.add('investor-data-view');
        
        // Process data for professional display
        const investorOverview = this.processInvestorData(data);
        
        // Create professional investor data layout
        const tableWrapper = document.querySelector('.table-wrapper');
        tableWrapper.innerHTML = `
            <div class="investor-data-container">
                <!-- Client Overview Dashboard -->
                <div class="client-overview-section">
                    <h2 class="section-title">
                        <i class="fas fa-users"></i>
                        Client Portfolio Overview
                    </h2>
                    <div class="overview-intro">
                        <p>Comprehensive client database with ${data.length} active investors. Monitor portfolio performance, risk profiles, and investment preferences across your entire client base.</p>
                    </div>
                    <div class="client-stats-grid">
                        ${this.createInvestorOverviewCards(investorOverview)}
                    </div>
                </div>
                
                <!-- Client Categories -->
                <div class="client-categories-section">
                    <div class="section-header">
                        <h2 class="section-title">
                            <i class="fas fa-chart-pie"></i>
                            Client Profiles
                        </h2>
                        <div class="client-filters">
                            <button class="client-filter-btn active" data-filter="all">All Clients</button>
                            <button class="client-filter-btn" data-filter="conservative">Conservative</button>
                            <button class="client-filter-btn" data-filter="moderate">Moderate</button>
                            <button class="client-filter-btn" data-filter="aggressive">Aggressive</button>
                            <button class="client-filter-btn" data-filter="high-net-worth">High Net Worth</button>
                        </div>
                    </div>
                    <div class="client-cards-grid" id="clientCardsGrid">
                        ${this.createInvestorCards(data)}
                    </div>
                </div>
                
                <!-- Portfolio Analytics -->
                <div class="portfolio-analytics-section">
                    <h2 class="section-title">
                        <i class="fas fa-analytics"></i>
                        Portfolio Analytics
                    </h2>
                    <div class="analytics-grid">
                        ${this.createPortfolioAnalytics(data)}
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners for filters
        this.attachInvestorDataListeners();
    }

    processInvestorData(data) {
        const totalClients = data.length;
        const totalAUM = data.reduce((sum, client) => sum + (parseFloat(client.total_portfolio_value) || 0), 0);
        const avgPortfolioValue = totalClients > 0 ? totalAUM / totalClients : 0;
        
        // Risk profile distribution
        const riskProfiles = {};
        data.forEach(client => {
            const risk = client.risk_capacity || 'Unknown';
            riskProfiles[risk] = (riskProfiles[risk] || 0) + 1;
        });
        
        // Age distribution
        const ageGroups = { 'Under 30': 0, '30-45': 0, '46-60': 0, 'Over 60': 0 };
        data.forEach(client => {
            const age = parseInt(client.age) || 0;
            if (age < 30) ageGroups['Under 30']++;
            else if (age <= 45) ageGroups['30-45']++;
            else if (age <= 60) ageGroups['46-60']++;
            else ageGroups['Over 60']++;
        });
        
        // Top performers by portfolio value
        const topPerformers = data
            .sort((a, b) => (parseFloat(b.total_portfolio_value) || 0) - (parseFloat(a.total_portfolio_value) || 0))
            .slice(0, 5);
        
        return {
            totalClients,
            totalAUM,
            avgPortfolioValue,
            riskProfiles,
            ageGroups,
            topPerformers
        };
    }

    createInvestorOverviewCards(overview) {
        return `
            <div class="overview-stat-card primary">
                <div class="stat-icon">
                    <i class="fas fa-users"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-value">${overview.totalClients}</div>
                    <div class="stat-label">Total Clients</div>
                    <div class="stat-description">Active investor accounts</div>
                </div>
            </div>
            
            <div class="overview-stat-card success">
                <div class="stat-icon">
                    <i class="fas fa-dollar-sign"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-value">$${(overview.totalAUM / 1000000).toFixed(1)}M</div>
                    <div class="stat-label">Assets Under Management</div>
                    <div class="stat-description">Total portfolio value</div>
                </div>
            </div>
            
            <div class="overview-stat-card info">
                <div class="stat-icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-value">$${(overview.avgPortfolioValue / 1000).toFixed(0)}K</div>
                    <div class="stat-label">Average Portfolio</div>
                    <div class="stat-description">Per client average</div>
                </div>
            </div>
            
            <div class="overview-stat-card warning">
                <div class="stat-icon">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-value">${Object.keys(overview.riskProfiles).length}</div>
                    <div class="stat-label">Risk Categories</div>
                    <div class="stat-description">Investment profiles</div>
                </div>
            </div>
        `;
    }

    createInvestorCards(data) {
        return data.map(investor => {
            const portfolioValue = parseFloat(investor.total_portfolio_value) || 0;
            const riskLevel = this.getInvestorRiskLevel(investor.risk_capacity);
            const clientStatus = this.getClientStatus(portfolioValue);
            
            return `
                <div class="investor-card" data-risk="${investor.risk_capacity?.toLowerCase() || 'unknown'}" data-client-id="${investor.user_id}">
                    <div class="investor-card-header">
                        <div class="investor-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="investor-info">
                            <div class="investor-name">${investor.full_name || 'N/A'}</div>
                            <div class="investor-id">ID: ${investor.user_id}</div>
                            <div class="client-status ${clientStatus.class}">${clientStatus.label}</div>
                        </div>
                    </div>
                    
                    <div class="investor-details">
                        <div class="detail-grid">
                            <div class="detail-item">
                                <span class="detail-label">Portfolio Value</span>
                                <span class="detail-value">$${portfolioValue.toLocaleString()}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Age</span>
                                <span class="detail-value">${investor.age} years</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Risk Profile</span>
                                <span class="detail-value risk-badge ${riskLevel.class}">${investor.risk_capacity || 'N/A'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Location</span>
                                <span class="detail-value">${investor.city || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="investor-metrics">
                        <div class="metric-row">
                            <div class="metric-item">
                                <div class="metric-icon equity">
                                    <i class="fas fa-chart-line"></i>
                                </div>
                                <div class="metric-content">
                                    <div class="metric-value">${investor.current_equities_percent || investor.equities_percent || 0}%</div>
                                    <div class="metric-label">Equities</div>
                                </div>
                            </div>
                            <div class="metric-item">
                                <div class="metric-icon bonds">
                                    <i class="fas fa-certificate"></i>
                                </div>
                                <div class="metric-content">
                                    <div class="metric-value">${investor.current_bonds_percent || investor.bonds_percent || 0}%</div>
                                    <div class="metric-label">Bonds</div>
                                </div>
                            </div>
                            <div class="metric-item">
                                <div class="metric-icon cash">
                                    <i class="fas fa-money-bill"></i>
                                </div>
                                <div class="metric-content">
                                    <div class="metric-value">${investor.current_cash_percent || investor.cash_percent || 0}%</div>
                                    <div class="metric-label">Cash</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="investor-actions">
                        <button class="action-btn primary" onclick="app.openUserDashboard('${investor.user_id}')">
                            <i class="fas fa-chart-pie"></i>
                            View Portfolio
                        </button>
                        <button class="action-btn secondary" onclick="app.openRebalancing('alternatives')">
                            <i class="fas fa-balance-scale"></i>
                            Rebalance
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    createPortfolioAnalytics(data) {
        const riskDistribution = {};
        data.forEach(client => {
            const risk = client.risk_capacity || 'Unknown';
            riskDistribution[risk] = (riskDistribution[risk] || 0) + 1;
        });
        
        return `
            <div class="analytics-card">
                <div class="analytics-header">
                    <h3 class="analytics-title">Risk Distribution</h3>
                    <p class="analytics-subtitle">Client risk profile breakdown</p>
                </div>
                <div class="risk-distribution">
                    ${Object.entries(riskDistribution).map(([risk, count]) => `
                        <div class="risk-item">
                            <div class="risk-label">${risk}</div>
                            <div class="risk-bar">
                                <div class="risk-fill ${this.getInvestorRiskLevel(risk).class}" style="width: ${(count / data.length) * 100}%"></div>
                            </div>
                            <div class="risk-count">${count}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="analytics-card">
                <div class="analytics-header">
                    <h3 class="analytics-title">Portfolio Summary</h3>
                    <p class="analytics-subtitle">Key performance indicators</p>
                </div>
                <div class="summary-metrics">
                    <div class="summary-item">
                        <div class="summary-icon">
                            <i class="fas fa-arrow-up text-success"></i>
                        </div>
                        <div class="summary-content">
                            <div class="summary-value">78%</div>
                            <div class="summary-label">Positive Returns</div>
                        </div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-icon">
                            <i class="fas fa-shield-alt text-info"></i>
                        </div>
                        <div class="summary-content">
                            <div class="summary-value">92%</div>
                            <div class="summary-label">Risk Aligned</div>
                        </div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-icon">
                            <i class="fas fa-star text-warning"></i>
                        </div>
                        <div class="summary-content">
                            <div class="summary-value">4.2</div>
                            <div class="summary-label">Avg Rating</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getInvestorRiskLevel(riskCategory) {
        const risk = (riskCategory || '').toLowerCase();
        if (risk.includes('conservative')) return { class: 'conservative', color: '#10b981' };
        if (risk.includes('moderate')) return { class: 'moderate', color: '#f59e0b' };
        if (risk.includes('aggressive')) return { class: 'aggressive', color: '#ef4444' };
        return { class: 'unknown', color: '#6b7280' };
    }

    getClientStatus(portfolioValue) {
        if (portfolioValue >= 1000000) return { class: 'premium', label: 'Premium Client' };
        if (portfolioValue >= 500000) return { class: 'gold', label: 'Gold Client' };
        if (portfolioValue >= 100000) return { class: 'silver', label: 'Silver Client' };
        return { class: 'standard', label: 'Standard Client' };
    }

    attachInvestorDataListeners() {
        // Client filter buttons
        document.querySelectorAll('.client-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all buttons
                document.querySelectorAll('.client-filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const filter = e.target.dataset.filter;
                this.filterInvestorCards(filter);
            });
        });
    }

    filterInvestorCards(filter) {
        const cards = document.querySelectorAll('.investor-card');
        
        cards.forEach(card => {
            if (filter === 'all') {
                card.style.display = 'block';
            } else if (filter === 'high-net-worth') {
                const portfolioText = card.querySelector('.detail-value').textContent;
                const portfolioValue = parseFloat(portfolioText.replace(/[$,]/g, ''));
                card.style.display = portfolioValue >= 500000 ? 'block' : 'none';
            } else {
                const riskCategory = card.dataset.risk;
                card.style.display = riskCategory === filter ? 'block' : 'none';
            }
        });
    }

    displayPortfolioAllocationProfessional(data) {
        // Hide the traditional table structure
        document.getElementById('dataTable').style.display = 'none';
        
        // Add portfolio view class for special styling
        const dataContainer = document.getElementById('dataContainer');
        dataContainer.classList.add('portfolio-view');
        
        // Create professional portfolio cards
        const tableWrapper = document.querySelector('.table-wrapper');
        tableWrapper.innerHTML = `
            <div class="portfolio-cards-grid" id="portfolioCardsGrid">
                ${data.map(portfolio => this.createPortfolioCard(portfolio)).join('')}
            </div>
        `;
        
        // Add event delegation for portfolio card clicks
        this.attachPortfolioCardListeners();
    }

    createPortfolioCard(portfolio) {
        const totalAmount = portfolio.total_investment_amount || 0;
        const equitiesAmount = totalAmount * (portfolio.equities_percent / 100);
        const bondsAmount = totalAmount * (portfolio.bonds_percent / 100);
        const cashAmount = totalAmount * (portfolio.cash_percent / 100);
        const altAmount = totalAmount * (portfolio.alternatives_percent / 100);
        
        // Calculate risk level based on equity allocation
        let riskLevel = 'Low';
        let riskColor = '#38a169';
        if (portfolio.equities_percent > 70) {
            riskLevel = 'High';
            riskColor = '#e53e3e';
        } else if (portfolio.equities_percent > 50) {
            riskLevel = 'Medium';
            riskColor = '#d69e2e';
        }
        
        return `
            <div class="portfolio-card" data-user-id="${portfolio.user_id}" style="cursor: pointer;">
                <div class="portfolio-card-header">
                    <div class="client-info">
                        <div class="client-id">${portfolio.user_id}</div>
                        <div class="client-name">${portfolio.full_name}</div>
                    </div>
                    <div class="portfolio-value">
                        <div class="value-amount">${new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0
                        }).format(totalAmount)}</div>
                        <div class="risk-badge" style="background-color: ${riskColor}20; color: ${riskColor};">
                            ${riskLevel} Risk
                        </div>
                    </div>
                </div>
                
                <div class="allocation-visual">
                    <div class="allocation-chart-mini">
                        <div class="chart-segment equities" style="width: ${portfolio.equities_percent}%;" title="Equities ${portfolio.equities_percent}%"></div>
                        <div class="chart-segment bonds" style="width: ${portfolio.bonds_percent}%;" title="Bonds ${portfolio.bonds_percent}%"></div>
                        <div class="chart-segment cash" style="width: ${portfolio.cash_percent}%;" title="Cash ${portfolio.cash_percent}%"></div>
                        <div class="chart-segment alternatives" style="width: ${portfolio.alternatives_percent}%;" title="Alternatives ${portfolio.alternatives_percent}%"></div>
                    </div>
                </div>
                
                <div class="allocation-breakdown">
                    <div class="allocation-row">
                        <div class="allocation-item">
                            <div class="allocation-color equities-color"></div>
                            <span class="allocation-label">Equities</span>
                            <span class="allocation-percent">${portfolio.equities_percent.toFixed(1)}%</span>
                            <span class="allocation-amount">${new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                minimumFractionDigits: 0
                            }).format(equitiesAmount)}</span>
                        </div>
                        <div class="allocation-item">
                            <div class="allocation-color bonds-color"></div>
                            <span class="allocation-label">Bonds</span>
                            <span class="allocation-percent">${portfolio.bonds_percent.toFixed(1)}%</span>
                            <span class="allocation-amount">${new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                minimumFractionDigits: 0
                            }).format(bondsAmount)}</span>
                        </div>
                    </div>
                    <div class="allocation-row">
                        <div class="allocation-item">
                            <div class="allocation-color cash-color"></div>
                            <span class="allocation-label">Cash</span>
                            <span class="allocation-percent">${portfolio.cash_percent.toFixed(1)}%</span>
                            <span class="allocation-amount">${new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                minimumFractionDigits: 0
                            }).format(cashAmount)}</span>
                        </div>
                        <div class="allocation-item">
                            <div class="allocation-color alternatives-color"></div>
                            <span class="allocation-label">Alternatives</span>
                            <span class="allocation-percent">${portfolio.alternatives_percent.toFixed(1)}%</span>
                            <span class="allocation-amount">${new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                minimumFractionDigits: 0
                            }).format(altAmount)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="portfolio-card-footer">
                    <div class="view-details">
                        <i class="fas fa-chart-line"></i>
                        <span>View Portfolio Details</span>
                    </div>
                </div>
            </div>
        `;
    }

    attachPortfolioCardListeners() {
        const portfolioCards = document.querySelectorAll('.portfolio-card');
        
        portfolioCards.forEach((card) => {
            const userId = card.dataset.userId;
            
            // Remove any existing listeners
            card.onclick = null;
            
            // Add direct click handler to open in new tab
            card.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (userId) {
                    // Open user dashboard in a new tab
                    const newTabUrl = `${window.location.origin}?user=${userId}&view=dashboard`;
                    window.open(newTabUrl, '_blank');
                }
                
                return false;
            };
        });
    }

    createTableHeaders(headers) {
        const headerRow = document.getElementById('tableHeader');
        headerRow.innerHTML = '<tr>' + 
            headers.map(header => `<th>${this.formatHeader(header)}</th>`).join('') +
            '</tr>';
    }

    createTableBody(data, tableName) {
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = data.map(row => {
            const cells = Object.values(row).map(value => {
                return `<td>${this.formatCellValue(value)}</td>`;
            }).join('');
            
            // Make portfolio allocation rows clickable
            const clickHandler = tableName === 'portfolio-allocation' ? 
                `onclick="window.portfolioApp.openUserDashboard('${row.user_id}')" style="cursor: pointer;"` : '';
            
            return `<tr ${clickHandler}>${cells}</tr>`;
        }).join('');
    }

    async openUserDashboard(userId) {
        this.currentUser = userId;
        this.showLoadingSpinner();
        await this.loadUserDashboard(userId);
    }

    async loadUserDashboard(userId) {
        try {
            const response = await fetch(`${this.baseUrl}/api/user/${userId}`);
            const result = await response.json();
            
            if (result.success) {
                this.hideLoadingSpinner();
                this.displayUserDashboard(result.user_data);
            } else {
                this.showError(`Error loading user data: ${result.error}`);
            }
        } catch (error) {
            console.error('Error loading user dashboard:', error);
            this.showError('Failed to load user data. Please try again.');
        }
    }

    displayUserDashboard(userData) {
        // Store user data for current session
        this.currentUserData = userData;
        
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('dataContainer').style.display = 'none';
        document.getElementById('userDashboard').style.display = 'block';
        document.getElementById('rebalancingPage').style.display = 'none';
        document.getElementById('exportBtn').style.display = 'none';
        
        // Update content title with rebalancing alert if needed
        const needsRebalancing = this.checkIfRebalancingNeeded(userData);
        const titleSuffix = needsRebalancing ? ' ⚠️ REBALANCING NEEDED' : '';
        document.getElementById('contentTitle').textContent = `Portfolio Dashboard - ${userData.portfolio.full_name}${titleSuffix}`;
        
        // Add rebalancing alert banner if needed
        this.showRebalancingAlert(userData, needsRebalancing);
        
        // Update user profile
        this.updateUserProfile(userData);
        
        // Update portfolio value
        this.updatePortfolioValue(userData);
        
        // Update risk profile
        this.updateRiskProfile(userData);
        
        // Update allocation breakdown
        this.updateAllocationBreakdown(userData);
        
        // Update recommendations with emphasis on rebalancing
        this.updateRecommendations(userData);
        
        // Create enhanced charts
        this.createAllocationChart(userData);
        this.createComparisonChart(userData);
        this.createTrendChart(userData);
    }

    checkIfRebalancingNeeded(userData) {
        const { allocation_breakdown } = userData;
        let needsRebalancing = false;
        
        Object.entries(allocation_breakdown).forEach(([asset, data]) => {
            const diff = Math.abs(data.current_percent - data.target_percent);
            if (diff > 5) {
                needsRebalancing = true;
            }
        });
        
        return needsRebalancing;
    }

    showRebalancingAlert(userData, needsRebalancing) {
        // Remove existing alert
        const existingAlert = document.querySelector('.rebalancing-alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        if (needsRebalancing) {
            const alertBanner = document.createElement('div');
            alertBanner.className = 'rebalancing-alert';
            alertBanner.style.cssText = `
                background: linear-gradient(90deg, #fed7d7, #feb2b2);
                border: 2px solid #fc8181;
                border-radius: 12px;
                padding: 1rem 1.5rem;
                margin: 1rem 0;
                display: flex;
                align-items: center;
                justify-content: space-between;
                animation: pulse 2s infinite;
            `;
            
            alertBanner.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <i class="fas fa-exclamation-triangle" style="color: #c53030; font-size: 1.5rem;"></i>
                    <div>
                        <div style="font-weight: 600; color: #c53030; font-size: 1.1rem;">Portfolio Rebalancing Required</div>
                        <div style="color: #822727; font-size: 0.875rem;">Your allocation has drifted from target percentages</div>
                    </div>
                </div>
                <button onclick="window.portfolioApp.showQuickRebalancingOptions()" 
                        style="background: #c53030; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 600; cursor: pointer;">
                    REBALANCE NOW
                </button>
            `;
            
            const dashboard = document.getElementById('userDashboard');
            dashboard.insertBefore(alertBanner, dashboard.firstChild);
        }
    }

    showQuickRebalancingOptions() {
        const { allocation_breakdown } = this.getCurrentUserData();
        const options = [];
        
        Object.entries(allocation_breakdown).forEach(([asset, data]) => {
            const diff = Math.abs(data.current_percent - data.target_percent);
            if (diff > 5) {
                options.push({
                    asset: asset,
                    current: data.current_percent,
                    target: data.target_percent,
                    action: data.current_percent > data.target_percent ? 'reduce' : 'increase'
                });
            }
        });
        
        if (options.length > 0) {
            this.openRebalancing(options[0].asset);
        }
    }

    getCurrentUserData() {
        // Return stored user data for current session
        return this.currentUserData || {};
    }

    updateUserProfile(userData) {
        const { portfolio, investor_profile } = userData;
        
        // User avatar with initials
        const initials = portfolio.full_name.split(' ')
            .map(name => name.charAt(0))
            .join('').toUpperCase();
        document.getElementById('userAvatar').textContent = initials;
        
        // User name
        document.getElementById('userName').textContent = portfolio.full_name;
        
        // Profile metadata
        document.getElementById('userCategory').textContent = investor_profile.investor_category || 'Standard';
        document.getElementById('userRisk').textContent = investor_profile.risk_capacity || 'Moderate';
        document.getElementById('userLocation').textContent = investor_profile.city || 'Not specified';
    }

    updatePortfolioValue(userData) {
        const totalValue = userData.total_investment || 0;
        document.getElementById('portfolioValue').textContent = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(totalValue);
    }

    updateRiskProfile(userData) {
        const { investor_profile } = userData;
        
        document.getElementById('riskCapacity').textContent = investor_profile.risk_capacity || 'Moderate';
        document.getElementById('rebalanceFreq').textContent = investor_profile.rebalancing_frequency || 'Quarterly';
        
        // Update risk indicator
        const riskLevel = investor_profile.risk_capacity?.toLowerCase() || 'moderate';
        const riskIndicator = document.getElementById('riskIndicator');
        const fill = riskIndicator.querySelector('.fill');
        
        riskIndicator.className = 'risk-indicator';
        if (riskLevel.includes('low')) {
            riskIndicator.classList.add('risk-low');
            fill.style.width = '33%';
        } else if (riskLevel.includes('high')) {
            riskIndicator.classList.add('risk-high');
            fill.style.width = '100%';
        } else {
            riskIndicator.classList.add('risk-medium');
            fill.style.width = '66%';
        }
    }

    updateAllocationBreakdown(userData) {
        const { allocation_breakdown } = userData;
        const colors = {
            equities: '#667eea',
            bonds: '#f093fb',
            cash: '#4facfe',
            alternatives: '#43e97b'
        };
        
        const allocationList = document.getElementById('allocationList');
        allocationList.innerHTML = Object.entries(allocation_breakdown).map(([asset, data]) => {
            const assetName = asset.charAt(0).toUpperCase() + asset.slice(1);
            return `
                <div class="allocation-item">
                    <div class="allocation-color" style="background-color: ${colors[asset]}"></div>
                    <div class="allocation-info">
                        <div class="allocation-name">${assetName}</div>
                        <div class="allocation-amount">${new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0
                        }).format(data.current_amount)}</div>
                    </div>
                    <div class="allocation-percent">${data.current_percent.toFixed(1)}%</div>
                </div>
            `;
        }).join('');
    }

    updateRecommendations(userData) {
        const { allocation_breakdown } = userData;
        const recommendations = [];
        
        // Generate recommendations based on current vs target allocation
        Object.entries(allocation_breakdown).forEach(([asset, data]) => {
            const diff = Math.abs(data.current_percent - data.target_percent);
            if (diff > 5) {
                const action = data.current_percent > data.target_percent ? 'reduce' : 'increase';
                const assetName = asset.charAt(0).toUpperCase() + asset.slice(1);
                recommendations.push({
                    title: `Rebalance ${assetName}`,
                    desc: `Consider ${action === 'reduce' ? 'reducing' : 'increasing'} your ${asset} allocation by ${diff.toFixed(1)}% to match your target allocation.`,
                    asset_class: asset,
                    clickable: true
                });
            }
        });
        
        // Add default recommendations if no rebalancing needed
        if (recommendations.length === 0) {
            recommendations.push(
                {
                    title: 'Portfolio Well Balanced',
                    desc: 'Your current allocation aligns well with your target allocation. Continue monitoring market conditions.',
                    clickable: false
                },
                {
                    title: 'Regular Review',
                    desc: 'Schedule a quarterly review to assess performance and adjust allocations based on market changes.',
                    clickable: false
                }
            );
        }
        
        const recommendationsList = document.getElementById('recommendationsList');
        recommendationsList.innerHTML = recommendations.map((rec, index) => `
            <div class="recommendation-item ${rec.clickable ? 'clickable-recommendation' : ''}" 
                 ${rec.clickable ? `onclick="window.portfolioApp.openRebalancing('${rec.asset_class}')"` : ''}>
                <div class="recommendation-icon">
                    <i class="fas fa-${rec.clickable ? 'chart-line' : (index === 0 ? 'chart-line' : 'calendar-alt')}"></i>
                </div>
                <div class="recommendation-content">
                    <div class="recommendation-title">${rec.title}</div>
                    <div class="recommendation-desc">${rec.desc}</div>
                    ${rec.clickable ? '<div class="click-hint">Click to rebalance →</div>' : ''}
                </div>
            </div>
        `).join('');
    }

    async openRebalancing(assetClass) {
        this.currentAssetClass = assetClass;
        this.showRebalancingPage();
        
        try {
            // Load holdings and scenarios in parallel for better performance
            await Promise.all([
                this.loadHoldings(),
                this.loadRebalancingScenarios(assetClass)
            ]);
        } catch (error) {
            console.error('Error loading rebalancing data:', error);
            this.showRebalancingError('Failed to load rebalancing data. Please try again.');
        }
    }

    showRebalancingPage() {
        // Hide other pages
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('dataContainer').style.display = 'none';
        document.getElementById('userDashboard').style.display = 'none';
        
        // Show rebalancing page
        const rebalancingPage = document.getElementById('rebalancingPage');
        rebalancingPage.style.display = 'block';
        
        // Reset all rebalancing page states
        document.getElementById('rebalancingLoading').style.display = 'flex';
        const holdingsSection = document.querySelector('.holdings-section');
        const scenariosSection = document.getElementById('scenariosSection');
        const successSection = document.getElementById('rebalancingSuccess');
        
        if (holdingsSection) holdingsSection.style.display = 'none';
        if (scenariosSection) scenariosSection.style.display = 'none';
        if (successSection) successSection.style.display = 'none';
        
        // Update title
        const assetClassFormatted = this.currentAssetClass ? 
            this.currentAssetClass.charAt(0).toUpperCase() + this.currentAssetClass.slice(1) : 'Portfolio';
        document.getElementById('contentTitle').textContent = `Rebalance ${assetClassFormatted} Portfolio`;
        
        const assetClassElement = document.getElementById('assetClassType');
        if (assetClassElement) {
            assetClassElement.textContent = this.currentAssetClass || 'portfolio';
        }
        
        // Reset selection
        this.selectedScenario = null;
        const executeBtn = document.getElementById('executeRebalance');
        if (executeBtn) executeBtn.style.display = 'none';
        
        // Clear previous holdings and scenarios
        const holdingsGrid = document.getElementById('holdingsGrid');
        const scenariosGrid = document.getElementById('scenariosGrid');
        if (holdingsGrid) holdingsGrid.innerHTML = '';
        if (scenariosGrid) scenariosGrid.innerHTML = '';
    }

    async loadHoldings() {
        try {
            const response = await fetch(`${this.baseUrl}/api/user/${this.currentUser}/holdings`);
            const result = await response.json();
            
            if (result.success) {
                this.displayHoldings(result.holdings);
            } else {
                console.error('Error loading holdings:', result.error);
                this.showRebalancingError(`Error loading holdings: ${result.error}`);
            }
        } catch (error) {
            console.error('Error loading holdings:', error);
            this.showRebalancingError('Failed to load holdings data.');
        }
    }

    displayHoldings(holdings) {
        const holdingsGrid = document.getElementById('holdingsGrid');
        const holdingsSection = document.querySelector('.holdings-section');
        
        // Ensure holdings section is visible
        if (holdingsSection) {
            holdingsSection.style.display = 'block';
        }
        
        // Filter holdings for current asset class if specified
        const relevantHoldings = this.currentAssetClass ? 
            holdings.filter(h => h.asset_class && h.asset_class.toLowerCase() === this.currentAssetClass.toLowerCase()) : 
            holdings;
        
        if (!holdingsGrid) {
            console.error('Holdings grid element not found');
            return;
        }
        
        if (relevantHoldings.length === 0) {
            holdingsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #718096;">
                    <i class="fas fa-info-circle" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                    <div style="font-size: 1.125rem; font-weight: 500;">No holdings found</div>
                    <div style="font-size: 0.875rem; margin-top: 0.5rem;">
                        ${this.currentAssetClass ? 
                            `No ${this.currentAssetClass} holdings available for rebalancing.` : 
                            'No holdings available for rebalancing.'}
                    </div>
                </div>
            `;
        } else {
            holdingsGrid.innerHTML = relevantHoldings.map(holding => {
                const performanceClass = holding.performance_category || 'average';
                const returnPercent = holding.return_percent || 0;
                const isPositive = returnPercent >= 0;
                
                return `
                    <div class="holding-card ${performanceClass}">
                        <div class="holding-header">
                            <div class="holding-info">
                                <h3>${holding.fund_name || 'Unknown Fund'}</h3>
                                <p>${holding.fund_symbol || ''} • ${holding.category || holding.asset_class || 'N/A'}</p>
                            </div>
                            <div class="holding-badge ${performanceClass}">
                                ${holding.performance_rating || performanceClass}
                            </div>
                        </div>
                        
                        <div class="holding-metrics">
                            <div class="metric-item">
                                <div class="metric-label">Current Value</div>
                                <div class="metric-value">${new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                    minimumFractionDigits: 0
                                }).format(holding.current_value || 0)}</div>
                            </div>
                            <div class="metric-item">
                                <div class="metric-label">Return</div>
                                <div class="metric-value ${isPositive ? 'positive' : 'negative'}">
                                    ${isPositive ? '+' : ''}${returnPercent.toFixed(2)}%
                                </div>
                            </div>
                        </div>
                        
                        <div class="holding-progress">
                            <div class="progress-label">
                                <span>Units Held</span>
                                <span>${(holding.units_held || 0).toFixed(2)}</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${Math.min(100, (holding.current_value / Math.max(...relevantHoldings.map(h => h.current_value || 0), 1)) * 100)}%"></div>
                            </div>
                        </div>
                        
                        <div class="holding-details">
                            <div style="display: flex; justify-content: space-between; font-size: 0.875rem; color: #718096; margin-top: 1rem;">
                                <span>Expense Ratio: ${((holding.expense_ratio || 0) * 100).toFixed(2)}%</span>
                                <span>Risk: ${holding.risk_rating || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        // Hide loading and show holdings
        const loadingElement = document.getElementById('rebalancingLoading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }

    async loadRebalancingScenarios(assetClass) {
        try {
            const response = await fetch(`${this.baseUrl}/api/rebalance/${this.currentUser}/${assetClass}`);
            const result = await response.json();
            
            if (result.success) {
                this.displayScenarios(result.scenarios);
            } else {
                console.error('Error loading scenarios:', result.error);
                this.displayScenarios([]); // Show no scenarios available
            }
        } catch (error) {
            console.error('Error loading scenarios:', error);
            this.displayScenarios([]); // Show no scenarios available
        }
    }

    displayScenarios(scenarios) {
        const scenariosGrid = document.getElementById('scenariosGrid');
        
        if (!scenarios || scenarios.length === 0) {
            scenariosGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #718096;">
                    <i class="fas fa-chart-line" style="font-size: 3rem; margin-bottom: 1rem; display: block; color: #667eea;"></i>
                    <div style="font-size: 1.125rem; font-weight: 500;">No Rebalancing Needed</div>
                    <div style="font-size: 0.875rem; margin-top: 0.5rem;">Your ${this.currentAssetClass} allocation is already well-optimized.</div>
                </div>
            `;
            document.getElementById('scenariosSection').style.display = 'block';
            return;
        }
        
        scenariosGrid.innerHTML = scenarios.map((scenario, index) => {
            const riskColors = {
                'Low': '#38a169',
                'Medium': '#d69e2e', 
                'High': '#e53e3e'
            };
            const riskColor = riskColors[scenario.risk_level] || '#667eea';
            
            // Separate buy and sell actions
            const sellActions = scenario.actions.filter(action => action.type === 'sell');
            const buyActions = scenario.actions.filter(action => action.type === 'buy');
            
            return `
                <div class="scenario-card enhanced" data-scenario-id="${scenario.id}" onclick="window.portfolioApp.selectScenario(${scenario.id})">
                    <div class="scenario-header">
                        <div class="scenario-info">
                            <h3>${scenario.name}</h3>
                            <p>${scenario.description}</p>
                        </div>
                        <div class="risk-indicator" style="background-color: ${riskColor}20; color: ${riskColor};">
                            ${scenario.risk_level} Risk
                        </div>
                    </div>
                    
                    <div class="scenario-metrics">
                        <div class="scenario-metric">
                            <div class="scenario-metric-label">Expected Return</div>
                            <div class="scenario-metric-value positive">${scenario.expected_return}</div>
                        </div>
                        <div class="scenario-metric">
                            <div class="scenario-metric-label">Time Frame</div>
                            <div class="scenario-metric-value">${scenario.timeframe}</div>
                        </div>
                        <div class="scenario-metric">
                            <div class="scenario-metric-label">Rebalancing Cost</div>
                            <div class="scenario-metric-value">${scenario.cost}</div>
                        </div>
                    </div>
                    
                    ${scenario.allocation_change ? `
                    <div class="allocation-changes">
                        <h4>📊 Portfolio Allocation Changes</h4>
                        <div class="allocation-change-grid">
                            ${scenario.allocation_change.equity_change !== 0 ? `
                                <div class="change-item equities">
                                    <span class="asset-name">Equities</span>
                                    <span class="change-value ${scenario.allocation_change.equity_change > 0 ? 'positive' : 'negative'}">
                                        ${scenario.allocation_change.equity_change > 0 ? '+' : ''}${scenario.allocation_change.equity_change}%
                                    </span>
                                </div>
                            ` : ''}
                            ${scenario.allocation_change.bond_change !== 0 ? `
                                <div class="change-item bonds">
                                    <span class="asset-name">Bonds</span>
                                    <span class="change-value ${scenario.allocation_change.bond_change > 0 ? 'positive' : 'negative'}">
                                        ${scenario.allocation_change.bond_change > 0 ? '+' : ''}${scenario.allocation_change.bond_change}%
                                    </span>
                                </div>
                            ` : ''}
                            ${scenario.allocation_change.cash_change !== 0 ? `
                                <div class="change-item cash">
                                    <span class="asset-name">Cash</span>
                                    <span class="change-value ${scenario.allocation_change.cash_change > 0 ? 'positive' : 'negative'}">
                                        ${scenario.allocation_change.cash_change > 0 ? '+' : ''}${scenario.allocation_change.cash_change}%
                                    </span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="scenario-actions-wrapper">
                        <div class="actions-header">
                            <h4>📈 Rebalancing Actions</h4>
                            <p>Buy stocks to boost allocation and sell underperformers</p>
                        </div>
                        <div class="actions-columns">
                            <div class="actions-column sell-column">
                                <div class="column-header sell-header">
                                    <h5><i class="fas fa-arrow-down"></i> SELL - Remove Underperformers</h5>
                                    <span class="actions-count">${sellActions.length} actions</span>
                                </div>
                                ${sellActions.length > 0 ? sellActions.map(action => `
                                    <div class="action-item sell">
                                        <div class="action-icon sell">
                                            <i class="fas fa-arrow-down"></i>
                                        </div>
                                        <div class="action-details">
                                            <div class="action-text">
                                                <strong>${action.fund_name}</strong>
                                            </div>
                                            <div class="action-reason">${action.reason}</div>
                                            <div class="action-performance">
                                                Current Return: <span class="negative">${action.current_performance.toFixed(2)}%</span>
                                            </div>
                                        </div>
                                        <div class="action-amount sell-amount">
                                            ${new Intl.NumberFormat('en-US', {
                                                style: 'currency',
                                                currency: 'USD',
                                                minimumFractionDigits: 0
                                            }).format(action.amount)}
                                        </div>
                                    </div>
                                `).join('') : '<div class="no-actions">No sell actions required</div>'}
                            </div>
                            
                            <div class="actions-column buy-column">
                                <div class="column-header buy-header">
                                    <h5><i class="fas fa-arrow-up"></i> BUY - Boost Allocation</h5>
                                    <span class="actions-count">${buyActions.length} actions</span>
                                </div>
                                ${buyActions.length > 0 ? buyActions.map(action => `
                                    <div class="action-item buy">
                                        <div class="action-icon buy">
                                            <i class="fas fa-arrow-up"></i>
                                        </div>
                                        <div class="action-details">
                                            <div class="action-text">
                                                <strong>${action.fund_name}</strong>
                                            </div>
                                            <div class="action-reason">${action.reason}</div>
                                            <div class="action-performance">
                                                1-Year Return: <span class="positive">+${action.current_performance.toFixed(2)}%</span>
                                            </div>
                                        </div>
                                        <div class="action-amount buy-amount">
                                            ${new Intl.NumberFormat('en-US', {
                                                style: 'currency',
                                                currency: 'USD',
                                                minimumFractionDigits: 0
                                            }).format(action.amount)}
                                        </div>
                                    </div>
                                `).join('') : '<div class="no-actions">No buy actions required</div>'}
                            </div>
                        </div>
                    </div>
                    
                    <div class="scenario-footer">
                        <div class="scenario-impact">
                            <span class="impact-label">Portfolio Impact:</span>
                            <span class="impact-value">Target allocation achieved, optimized performance</span>
                        </div>
                        <div class="selection-indicator">
                            <span>Click to select this rebalancing strategy</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Show scenarios section
        document.getElementById('scenariosSection').style.display = 'block';
        
        // Store scenarios for later use
        this.rebalancingScenarios = scenarios;
    }

    selectScenario(scenarioId) {
        // Remove previous selection
        document.querySelectorAll('.scenario-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Select new scenario
        const selectedCard = document.querySelector(`[data-scenario-id="${scenarioId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
            this.selectedScenario = this.rebalancingScenarios.find(s => s.id === scenarioId);
            document.getElementById('executeRebalance').style.display = 'inline-flex';
        }
    }

    async executeRebalancing() {
        if (!this.selectedScenario) {
            alert('Please select a rebalancing scenario first.');
            return;
        }
        
        try {
            // Show loading
            document.getElementById('scenariosSection').style.display = 'none';
            document.getElementById('rebalancingLoading').style.display = 'flex';
            document.querySelector('.rebalancing-loading span').textContent = 'Executing rebalancing...';
            
            const response = await fetch(`${this.baseUrl}/api/rebalance/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: this.currentUser,
                    scenario_id: this.selectedScenario.id,
                    asset_class: this.currentAssetClass,
                    actions: this.selectedScenario.actions
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Show success message with allocation changes
                this.showRebalancingSuccess();
            } else {
                alert(`Error executing rebalancing: ${result.error}`);
                document.getElementById('rebalancingLoading').style.display = 'none';
                document.getElementById('scenariosSection').style.display = 'block';
            }
            
        } catch (error) {
            console.error('Error executing rebalancing:', error);
            alert('Failed to execute rebalancing. Please try again.');
            document.getElementById('rebalancingLoading').style.display = 'none';
            document.getElementById('scenariosSection').style.display = 'block';
        }
    }

    showRebalancingSuccess() {
        document.getElementById('rebalancingLoading').style.display = 'none';
        const successSection = document.getElementById('rebalancingSuccess');
        
        // Create detailed success message with allocation changes
        const selectedScenario = this.selectedScenario;
        const assetClass = this.currentAssetClass;
        
        successSection.innerHTML = `
            <div class="rebalancing-success-content">
                <div class="success-header">
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h2>Portfolio Successfully Rebalanced!</h2>
                    <p>Your ${selectedScenario.name} strategy has been executed successfully.</p>
                </div>
                
                <div class="rebalancing-summary">
                    <div class="summary-card">
                        <h3>📊 Allocation Changes Applied</h3>
                        <div class="allocation-changes-summary">
                            ${selectedScenario.allocation_change.equity_change !== 0 ? `
                                <div class="change-summary-item">
                                    <span class="asset-type">Equities:</span>
                                    <span class="change-value ${selectedScenario.allocation_change.equity_change > 0 ? 'positive' : 'negative'}">
                                        ${selectedScenario.allocation_change.equity_change > 0 ? '+' : ''}${selectedScenario.allocation_change.equity_change}%
                                    </span>
                                    <span class="status">✓ Optimized</span>
                                </div>
                            ` : ''}
                            ${selectedScenario.allocation_change.bond_change !== 0 ? `
                                <div class="change-summary-item">
                                    <span class="asset-type">Bonds:</span>
                                    <span class="change-value ${selectedScenario.allocation_change.bond_change > 0 ? 'positive' : 'negative'}">
                                        ${selectedScenario.allocation_change.bond_change > 0 ? '+' : ''}${selectedScenario.allocation_change.bond_change}%
                                    </span>
                                    <span class="status">✓ Optimized</span>
                                </div>
                            ` : ''}
                            ${selectedScenario.allocation_change.cash_change !== 0 ? `
                                <div class="change-summary-item">
                                    <span class="asset-type">Cash:</span>
                                    <span class="change-value ${selectedScenario.allocation_change.cash_change > 0 ? 'positive' : 'negative'}">
                                        ${selectedScenario.allocation_change.cash_change > 0 ? '+' : ''}${selectedScenario.allocation_change.cash_change}%
                                    </span>
                                    <span class="status">✓ Optimized</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="summary-card">
                        <h3>💰 Transactions Completed</h3>
                        <div class="transactions-summary">
                            <div class="transaction-stats">
                                <div class="stat-item">
                                    <span class="stat-label">Total Sells:</span>
                                    <span class="stat-value">${selectedScenario.actions.filter(a => a.type === 'sell').length}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Total Buys:</span>
                                    <span class="stat-value">${selectedScenario.actions.filter(a => a.type === 'buy').length}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Expected Return:</span>
                                    <span class="stat-value positive">${selectedScenario.expected_return}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="summary-card balanced-status">
                        <h3>🎯 Portfolio Status</h3>
                        <div class="status-message">
                            <div class="status-icon balanced">
                                <i class="fas fa-balance-scale"></i>
                            </div>
                            <div class="status-text">
                                <div class="status-title">Portfolio is Now Balanced!</div>
                                <div class="status-description">
                                    Your ${assetClass} allocation has been optimized according to your risk profile
                                    and target allocation percentages.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="success-actions">
                    <button class="btn btn-primary" onclick="window.portfolioApp.backToDashboard()">
                        <i class="fas fa-chart-line"></i>
                        View Updated Dashboard
                    </button>
                    <button class="btn btn-secondary" onclick="window.portfolioApp.downloadRebalancingReport()">
                        <i class="fas fa-download"></i>
                        Download Report
                    </button>
                </div>
            </div>
        `;
        
        successSection.style.display = 'flex';
    }

    downloadRebalancingReport() {
        // Generate a simple report
        const scenario = this.selectedScenario;
        const reportContent = `
PORTFOLIO REBALANCING REPORT
============================

Strategy: ${scenario.name}
Date: ${new Date().toLocaleDateString()}
Expected Return: ${scenario.expected_return}
Risk Level: ${scenario.risk_level}

ACTIONS EXECUTED:
${scenario.actions.map(action => 
    `- ${action.type.toUpperCase()} ${action.fund_name}: ${new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(action.amount)}`
).join('\n')}

ALLOCATION CHANGES:
${scenario.allocation_change.equity_change !== 0 ? `- Equities: ${scenario.allocation_change.equity_change > 0 ? '+' : ''}${scenario.allocation_change.equity_change}%` : ''}
${scenario.allocation_change.bond_change !== 0 ? `- Bonds: ${scenario.allocation_change.bond_change > 0 ? '+' : ''}${scenario.allocation_change.bond_change}%` : ''}
${scenario.allocation_change.cash_change !== 0 ? `- Cash: ${scenario.allocation_change.cash_change > 0 ? '+' : ''}${scenario.allocation_change.cash_change}%` : ''}

Status: Portfolio Successfully Rebalanced
        `;
        
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rebalancing-report-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

    backToDashboard() {
        // Hide rebalancing page
        document.getElementById('rebalancingPage').style.display = 'none';
        
        // Show user dashboard
        document.getElementById('userDashboard').style.display = 'block';
        
        // Update title
        if (this.currentUser) {
            document.getElementById('contentTitle').textContent = `Portfolio Dashboard`;
        }
        
        // Reset rebalancing state
        this.selectedScenario = null;
        this.currentAssetClass = null;
    }

    createAllocationChart(userData) {
        const { allocation_breakdown } = userData;
        const ctx = document.getElementById('allocationChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.allocation) {
            this.charts.allocation.destroy();
        }
        
        const data = {
            labels: Object.keys(allocation_breakdown).map(key => 
                key.charAt(0).toUpperCase() + key.slice(1)
            ),
            datasets: [{
                data: Object.values(allocation_breakdown).map(item => item.current_percent),
                backgroundColor: ['#667eea', '#f093fb', '#4facfe', '#43e97b'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        };
        
        this.charts.allocation = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                family: 'Inter',
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed}%`;
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }

    createComparisonChart(userData) {
        const { allocation_breakdown } = userData;
        const ctx = document.getElementById('comparisonChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.comparison) {
            this.charts.comparison.destroy();
        }
        
        const labels = Object.keys(allocation_breakdown).map(key => 
            key.charAt(0).toUpperCase() + key.slice(1)
        );
        
        const currentData = Object.values(allocation_breakdown).map(item => item.current_percent);
        const targetData = Object.values(allocation_breakdown).map(item => item.target_percent);
        
        this.charts.comparison = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Current',
                    data: currentData,
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: '#667eea',
                    borderWidth: 1
                }, {
                    label: 'Target',
                    data: targetData,
                    backgroundColor: 'rgba(56, 161, 105, 0.8)',
                    borderColor: '#38a169',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            padding: 20,
                            font: {
                                family: 'Inter',
                                size: 12
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    createTrendChart(userData) {
        const { allocation_breakdown } = userData;
        const ctx = document.getElementById('trendChart').getContext('2d');

        // Destroy existing chart if it exists
        if (this.charts.trend) {
            this.charts.trend.destroy();
        }

        const labels = Object.keys(allocation_breakdown).map(key => 
            key.charAt(0).toUpperCase() + key.slice(1)
        );

        const currentData = Object.values(allocation_breakdown).map(item => item.current_percent);
        const targetData = Object.values(allocation_breakdown).map(item => item.target_percent);

        this.charts.trend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Current',
                    data: currentData,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Target',
                    data: targetData,
                    borderColor: '#38a169',
                    backgroundColor: 'rgba(56, 161, 105, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            padding: 20,
                            font: {
                                family: 'Inter',
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed}%`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    backToTable() {
        if (this.currentTable) {
            this.displayTable(this.currentTable, this.filteredData);
            document.getElementById('exportBtn').style.display = 'inline-flex';
        } else {
            this.showWelcomeScreen();
        }
        this.currentUser = null;
        
        // Destroy charts
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
    }

    formatHeader(header) {
        return header.replace(/_/g, ' ')
                    .replace(/\b\w/g, l => l.toUpperCase())
                    .replace(/Id/g, 'ID')
                    .replace(/Usd/g, 'USD');
    }

    formatCellValue(value) {
        if (value === null || value === undefined) {
            return '<span class="text-muted">-</span>';
        }
        
        if (typeof value === 'number') {
            // Format currency values
            if (value > 1000 && (value % 1 !== 0 || value > 100000)) {
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 2
                }).format(value);
            }
            // Format percentages
            if (value < 100 && value > 0 && value % 1 !== 0) {
                return `${value.toFixed(2)}%`;
            }
            // Format regular numbers
            return new Intl.NumberFormat('en-US').format(value);
        }
        
        // Format dates
        if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
            const date = new Date(value);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
        
        return value;
    }

    filterData(searchTerm) {
        if (!searchTerm.trim()) {
            this.filteredData = [...this.currentData];
        } else {
            const term = searchTerm.toLowerCase();
            this.filteredData = this.currentData.filter(row => {
                return Object.values(row).some(value => 
                    value && value.toString().toLowerCase().includes(term)
                );
            });
        }
        
        this.createTableBody(this.filteredData, this.currentTable);
        this.updateRecordCount(this.filteredData.length);
    }

    updateTitle(tableName) {
        const titles = {
            'investor-data': 'Investor Reference Data - Client Profiles & Preferences',
            'portfolio-allocation': 'Portfolio Current Allocation - Asset Distribution Overview',
            'product-market-data': 'Product Market Data - Investment Products & Pricing',
            'master-allocation-model': 'Master Allocation Model - Strategic Asset Models'
        };
        
        const title = titles[tableName] || tableName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        document.getElementById('contentTitle').textContent = title;
    }

    updateRecordCount(count) {
        const recordCount = document.getElementById('recordCount');
        if (recordCount) {
            recordCount.textContent = `${count} record${count !== 1 ? 's' : ''}`;
        }
    }

    showLoadingSpinner() {
        document.getElementById('loadingSpinner').style.display = 'flex';
        document.getElementById('dataTable').style.display = 'none';
    }

    hideLoadingSpinner() {
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('dataTable').style.display = 'table';
    }

    showEmptyState() {
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="100%" style="text-align: center; padding: 3rem; color: #718096;">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                    <div style="font-size: 1.125rem; font-weight: 500;">No data available</div>
                    <div style="font-size: 0.875rem; margin-top: 0.5rem;">There are no records to display for this table.</div>
                </td>
            </tr>
        `;
        this.updateRecordCount(0);
    }

    showError(message) {
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('userDashboard').style.display = 'none';
        document.getElementById('dataContainer').style.display = 'block';
        document.getElementById('loadingSpinner').style.display = 'none';
        
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="100%" style="text-align: center; padding: 3rem; color: #e53e3e;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                    <div style="font-size: 1.125rem; font-weight: 500;">Error Loading Data</div>
                    <div style="font-size: 0.875rem; margin-top: 0.5rem;">${message}</div>
                    <button class="btn btn-primary" style="margin-top: 1rem;" onclick="location.reload()">
                        <i class="fas fa-refresh"></i> Reload Page
                    </button>
                </td>
            </tr>
        `;
    }

    exportData() {
        if (!this.filteredData.length) {
            alert('No data to export');
            return;
        }

        const csvContent = this.convertToCSV(this.filteredData);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${this.currentTable}-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    convertToCSV(data) {
        if (!data.length) return '';
        
        const headers = Object.keys(data[0]);
        const csvHeaders = headers.map(header => `"${this.formatHeader(header)}"`).join(',');
        
        const csvRows = data.map(row => {
            return headers.map(header => {
                const value = row[header];
                return `"${value !== null && value !== undefined ? value : ''}"`;
            }).join(',');
        });
        
        return [csvHeaders, ...csvRows].join('\n');
    }

    showRebalancingError(message) {
        document.getElementById('rebalancingLoading').style.display = 'none';
        document.querySelector('.holdings-section').style.display = 'block';
        document.getElementById('holdingsGrid').innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #e53e3e;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                <div style="font-size: 1.125rem; font-weight: 500;">Error Loading Data</div>
                <div style="font-size: 0.875rem; margin-top: 0.5rem;">${message}</div>
                <button class="btn btn-primary" style="margin-top: 1rem;" onclick="window.portfolioApp.openRebalancing('${this.currentAssetClass}')">
                    <i class="fas fa-refresh"></i> Try Again
                </button>
            </div>
        `;
    }

    displayProductMarketDataProfessional(data) {
        // Hide the traditional table structure
        document.getElementById('dataTable').style.display = 'none';
        
        // Add market data view class for special styling
        const dataContainer = document.getElementById('dataContainer');
        dataContainer.classList.add('market-data-view');
        
        // Process data for professional display
        const marketOverview = this.processMarketData(data);
        
        // Create professional market data layout
        const tableWrapper = document.querySelector('.table-wrapper');
        tableWrapper.innerHTML = `
            <div class="market-data-container">
                <!-- Market Overview Cards -->
                <div class="market-overview-section">
                    <h2 class="section-title">
                        <i class="fas fa-chart-line"></i>
                        Market Overview
                    </h2>
                    <div class="market-stats-grid">
                        ${this.createMarketOverviewCards(marketOverview)}
                    </div>
                </div>
                
                <!-- Investment Categories -->
                <div class="investment-categories-section">
                    <div class="section-header">
                        <h2 class="section-title">
                            <i class="fas fa-layer-group"></i>
                            Investment Categories
                        </h2>
                        <div class="market-filters">
                            <button class="filter-btn active" data-filter="all">All</button>
                            <button class="filter-btn" data-filter="equity">Equity</button>
                            <button class="filter-btn" data-filter="fixed-income">Fixed Income</button>
                            <button class="filter-btn" data-filter="alternatives">Alternatives</button>
                        </div>
                    </div>
                    <div class="investment-grid" id="investmentGrid">
                        ${this.createInvestmentCards(data)}
                    </div>
                </div>
                
                <!-- Sector Analysis -->
                <div class="sector-analysis-section">
                    <h2 class="section-title">
                        <i class="fas fa-pie-chart"></i>
                        Sector Analysis
                    </h2>
                    <div class="sector-breakdown-grid">
                        ${this.createSectorBreakdown(data)}
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners for filters
        this.attachMarketDataListeners();
    }

    processMarketData(data) {
        const overview = {
            totalProducts: data.length,
            averagePrice: 0,
            sectors: new Set(),
            investmentTypes: {},
            priceRanges: { low: Infinity, high: 0 }
        };
        
        let totalPrice = 0;
        
        data.forEach(item => {
            // Track investment types
            if (!overview.investmentTypes[item.investment_type]) {
                overview.investmentTypes[item.investment_type] = {
                    count: 0,
                    totalValue: 0,
                    sectors: new Set()
                };
            }
            overview.investmentTypes[item.investment_type].count++;
            overview.investmentTypes[item.investment_type].totalValue += item.market_price_usd || 0;
            overview.investmentTypes[item.investment_type].sectors.add(item.industry_sector);
            
            // Track sectors
            overview.sectors.add(item.industry_sector);
            
            // Track prices
            const price = item.market_price_usd || 0;
            totalPrice += price;
            overview.priceRanges.low = Math.min(overview.priceRanges.low, price);
            overview.priceRanges.high = Math.max(overview.priceRanges.high, price);
        });
        
        overview.averagePrice = totalPrice / data.length;
        overview.sectorsCount = overview.sectors.size;
        
        return overview;
    }

    createMarketOverviewCards(overview) {
        return `
            <div class="market-stat-card primary">
                <div class="stat-icon">
                    <i class="fas fa-chart-bar"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-value">${overview.totalProducts}</div>
                    <div class="stat-label">Total Products</div>
                    <div class="stat-change positive">+12.5% YoY</div>
                </div>
            </div>
            
            <div class="market-stat-card success">
                <div class="stat-icon">
                    <i class="fas fa-dollar-sign"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-value">${new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0
                    }).format(overview.averagePrice)}</div>
                    <div class="stat-label">Avg. Price</div>
                    <div class="stat-change positive">+5.2% this month</div>
                </div>
            </div>
            
            <div class="market-stat-card info">
                <div class="stat-icon">
                    <i class="fas fa-industry"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-value">${overview.sectorsCount}</div>
                    <div class="stat-label">Market Sectors</div>
                    <div class="stat-change neutral">Diversified</div>
                </div>
            </div>
            
            <div class="market-stat-card warning">
                <div class="stat-icon">
                    <i class="fas fa-trending-up"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-value">${Object.keys(overview.investmentTypes).length}</div>
                    <div class="stat-label">Asset Classes</div>
                    <div class="stat-change positive">+8.7% performance</div>
                </div>
            </div>
        `;
    }

    createInvestmentCards(data) {
        return data.map(product => {
            const priceChange = (Math.random() * 10 - 5); // Simulate price change
            const isPositive = priceChange >= 0;
            const performance = Math.random() * 20 + 80; // Simulate performance score
            
            return `
                <div class="investment-card" data-type="${product.investment_type.toLowerCase().replace(/\s+/g, '-')}">
                    <div class="investment-card-header">
                        <div class="investment-icon">
                            ${this.getInvestmentIcon(product.investment_type)}
                        </div>
                        <div class="investment-info">
                            <h3 class="investment-name">${product.investment_product}</h3>
                            <p class="investment-symbol">${product.symbol}</p>
                        </div>
                        <div class="investment-price">
                            <div class="current-price">${new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD'
                            }).format(product.market_price_usd || 0)}</div>
                            <div class="price-change ${isPositive ? 'positive' : 'negative'}">
                                ${isPositive ? '+' : ''}${priceChange.toFixed(2)}%
                            </div>
                        </div>
                    </div>
                    
                    <div class="investment-details">
                        <div class="detail-row">
                            <span class="detail-label">Sector:</span>
                            <span class="detail-value">${product.industry_sector}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Segment:</span>
                            <span class="detail-value">${product.market_segment}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Strategy:</span>
                            <span class="detail-value">${product.investment_strategies}</span>
                        </div>
                    </div>
                    
                    <div class="investment-performance">
                        <div class="performance-header">
                            <span>Performance Score</span>
                            <span class="performance-score ${performance > 85 ? 'excellent' : performance > 70 ? 'good' : 'average'}">
                                ${performance.toFixed(0)}/100
                            </span>
                        </div>
                        <div class="performance-bar">
                            <div class="performance-fill" style="width: ${performance}%"></div>
                        </div>
                    </div>
                    
                    <div class="investment-actions">
                        <button class="action-btn primary">
                            <i class="fas fa-chart-line"></i>
                            View Details
                        </button>
                        <button class="action-btn secondary">
                            <i class="fas fa-star"></i>
                            Watchlist
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    createSectorBreakdown(data) {
        const sectorStats = {};
        
        data.forEach(item => {
            if (!sectorStats[item.industry_sector]) {
                sectorStats[item.industry_sector] = {
                    count: 0,
                    totalValue: 0,
                    products: []
                };
            }
            sectorStats[item.industry_sector].count++;
            sectorStats[item.industry_sector].totalValue += item.market_price_usd || 0;
            sectorStats[item.industry_sector].products.push(item);
        });
        
        return Object.entries(sectorStats).map(([sector, stats]) => {
            const avgValue = stats.totalValue / stats.count;
            const marketShare = (stats.count / data.length) * 100;
            
            return `
                <div class="sector-card">
                    <div class="sector-header">
                        <div class="sector-icon">
                            ${this.getSectorIcon(sector)}
                        </div>
                        <div class="sector-info">
                            <h3 class="sector-name">${sector}</h3>
                            <p class="sector-subtitle">${stats.count} products</p>
                        </div>
                        <div class="sector-metrics">
                            <div class="metric-value">${marketShare.toFixed(1)}%</div>
                            <div class="metric-label">Market Share</div>
                        </div>
                    </div>
                    
                    <div class="sector-stats">
                        <div class="stat-item">
                            <span class="stat-label">Avg. Price</span>
                            <span class="stat-value">${new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                minimumFractionDigits: 0
                            }).format(avgValue)}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Total Value</span>
                            <span class="stat-value">${new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                minimumFractionDigits: 0
                            }).format(stats.totalValue)}</span>
                        </div>
                    </div>
                    
                    <div class="sector-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${marketShare}%"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    getInvestmentIcon(type) {
        const icons = {
            'Equity': '<i class="fas fa-chart-line"></i>',
            'Fixed Income': '<i class="fas fa-shield-alt"></i>',
            'Alternatives': '<i class="fas fa-coins"></i>',
            'Cash': '<i class="fas fa-university"></i>',
            'Real Estate': '<i class="fas fa-building"></i>'
        };
        return icons[type] || '<i class="fas fa-certificate"></i>';
    }

    getSectorIcon(sector) {
        const icons = {
            'Technology': '<i class="fas fa-microchip"></i>',
            'Healthcare': '<i class="fas fa-heartbeat"></i>',
            'Finance': '<i class="fas fa-chart-pie"></i>',
            'Energy': '<i class="fas fa-bolt"></i>',
            'Consumer': '<i class="fas fa-shopping-cart"></i>',
            'Industrial': '<i class="fas fa-industry"></i>',
            'Utilities': '<i class="fas fa-plug"></i>',
            'Materials': '<i class="fas fa-cube"></i>'
        };
        return icons[sector] || '<i class="fas fa-briefcase"></i>';
    }

    attachMarketDataListeners() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all buttons
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const filter = e.target.dataset.filter;
                this.filterInvestmentCards(filter);
            });
        });
    }

    filterInvestmentCards(filter) {
        const cards = document.querySelectorAll('.investment-card');
        
        cards.forEach(card => {
            if (filter === 'all') {
                card.style.display = 'block';
            } else {
                const cardType = card.dataset.type;
                if (cardType.includes(filter)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            }
        });
    }

    displayMasterAllocationModelProfessional(data) {
        // Hide the traditional table structure
        document.getElementById('dataTable').style.display = 'none';
        
        // Add allocation models view class for special styling
        const dataContainer = document.getElementById('dataContainer');
        dataContainer.classList.add('allocation-models-view');
        
        // Process data for professional display
        const categorizedModels = this.processMasterAllocationData(data);
        
        // Create professional allocation models layout
        const tableWrapper = document.querySelector('.table-wrapper');
        tableWrapper.innerHTML = `
            <div class="allocation-models-container">
                <!-- Investment Strategy Overview -->
                <div class="strategy-overview-section">
                    <h2 class="section-title">
                        <i class="fas fa-chart-pie"></i>
                        Strategic Asset Allocation Models
                    </h2>
                    <div class="strategy-intro">
                        <p>Institutional-grade allocation models designed for different investor profiles and risk appetites. Each model is carefully crafted to optimize returns while managing risk according to your investment goals.</p>
                    </div>
                    <div class="model-stats-overview">
                        ${this.createModelStatsOverview(categorizedModels)}
                    </div>
                </div>
                
                <!-- Risk Profile Categories -->
                <div class="risk-categories-section">
                    <div class="section-header">
                        <h2 class="section-title">
                            <i class="fas fa-users"></i>
                            Investor Risk Profiles
                        </h2>
                        <div class="risk-filters">
                            <button class="risk-filter-btn active" data-category="all">All Profiles</button>
                            ${Object.keys(categorizedModels).map(category => 
                                `<button class="risk-filter-btn" data-category="${category.toLowerCase()}">${category}</button>`
                            ).join('')}
                        </div>
                    </div>
                    <div class="risk-profiles-grid" id="riskProfilesGrid">
                        ${this.createRiskProfileCards(categorizedModels)}
                    </div>
                </div>
                
                <!-- Model Comparison -->
                <div class="model-comparison-section">
                    <h2 class="section-title">
                        <i class="fas fa-balance-scale"></i>
                        Model Comparison Matrix
                    </h2>
                    <div class="comparison-grid">
                        ${this.createModelComparisonMatrix(data)}
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners for filters and create charts
        this.attachAllocationModelListeners();
    }

    processMasterAllocationData(data) {
        const categorized = {};
        
        data.forEach(model => {
            const category = model.category || 'General';
            if (!categorized[category]) {
                categorized[category] = [];
            }
            categorized[category].push(model);
        });
        
        return categorized;
    }

    createModelStatsOverview(categorizedModels) {
        const totalCategories = Object.keys(categorizedModels).length;
        const totalModels = Object.values(categorizedModels).reduce((sum, models) => sum + models.length, 0);
        const avgEquityAllocation = Object.values(categorizedModels)
            .flat()
            .reduce((sum, model) => sum + (model.equities || 0), 0) / totalModels;
        const avgBondAllocation = Object.values(categorizedModels)
            .flat()
            .reduce((sum, model) => sum + (model.bonds || 0), 0) / totalModels;

        return `
            <div class="overview-stats-grid">
                <div class="overview-stat-card primary">
                    <div class="stat-icon">
                        <i class="fas fa-layer-group"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${totalCategories}</div>
                        <div class="stat-label">Risk Categories</div>
                        <div class="stat-description">Conservative to Aggressive</div>
                    </div>
                </div>
                
                <div class="overview-stat-card success">
                    <div class="stat-icon">
                        <i class="fas fa-chart-area"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${totalModels}</div>
                        <div class="stat-label">Total Models</div>
                        <div class="stat-description">Diversified Strategies</div>
                    </div>
                </div>
                
                <div class="overview-stat-card info">
                    <div class="stat-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${avgEquityAllocation.toFixed(0)}%</div>
                        <div class="stat-label">Avg. Equity</div>
                        <div class="stat-description">Across All Models</div>
                    </div>
                </div>
                
                <div class="overview-stat-card warning">
                    <div class="stat-icon">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${avgBondAllocation.toFixed(0)}%</div>
                        <div class="stat-label">Avg. Bonds</div>
                        <div class="stat-description">Risk Mitigation</div>
                    </div>
                </div>
            </div>
        `;
    }

    createRiskProfileCards(categorizedModels) {
        return Object.entries(categorizedModels).map(([category, models], index) => {
            const categoryRiskLevel = this.getCategoryRiskLevel(category);
            const mainModel = models[0]; // Use first model as representative
            const chartId = `allocationChart_${category.toLowerCase().replace(/\s+/g, '_')}_${index}`;
            
            return `
                <div class="risk-profile-card" data-category="${category.toLowerCase()}">
                    <div class="profile-header">
                        <div class="profile-icon ${categoryRiskLevel.class}">
                            ${categoryRiskLevel.icon}
                        </div>
                        <div class="profile-info">
                            <h3 class="profile-name">${category}</h3>
                            <p class="profile-subtitle">${models.length} Model${models.length > 1 ? 's' : ''} Available</p>
                            <div class="risk-badge ${categoryRiskLevel.class}">
                                ${categoryRiskLevel.label}
                            </div>
                        </div>
                    </div>
                    
                    <div class="allocation-visualization">
                        <div class="allocation-chart-container">
                            <div class="allocation-chart-wrapper">
                                <canvas id="${chartId}" class="allocation-donut-chart"></canvas>
                                <div class="chart-center-label">
                                    <div class="center-title">Asset</div>
                                    <div class="center-subtitle">Allocation</div>
                                </div>
                            </div>
                        </div>
                        <div class="allocation-chart">
                            <div class="allocation-segment equities" 
                                 style="width: ${mainModel.equities || 0}%"
                                 title="Equities: ${mainModel.equities || 0}%"></div>
                            <div class="allocation-segment bonds" 
                                 style="width: ${mainModel.bonds || 0}%" 
                                 title="Bonds: ${mainModel.bonds || 0}%"></div>
                            <div class="allocation-segment cash" 
                                 style="width: ${mainModel.cash_cash_equivalents || 0}%" 
                                 title="Cash: ${mainModel.cash_cash_equivalents || 0}%"></div>
                            <div class="allocation-segment alternatives" 
                                 style="width: ${mainModel.alternative_investments || 0}%" 
                                 title="Alternatives: ${mainModel.alternative_investments || 0}%"></div>
                        </div>
                    </div>
                    
                    <div class="allocation-breakdown">
                        <div class="breakdown-item">
                            <div class="allocation-color equities-color"></div>
                            <span class="allocation-label">Equities</span>
                            <span class="allocation-percent">${(mainModel.equities || 0).toFixed(1)}%</span>
                        </div>
                        <div class="breakdown-item">
                            <div class="allocation-color bonds-color"></div>
                            <span class="allocation-label">Bonds</span>
                            <span class="allocation-percent">${(mainModel.bonds || 0).toFixed(1)}%</span>
                        </div>
                        <div class="breakdown-item">
                            <div class="allocation-color cash-color"></div>
                            <span class="allocation-label">Cash</span>
                            <span class="allocation-percent">${(mainModel.cash_cash_equivalents || 0).toFixed(1)}%</span>
                        </div>
                        <div class="breakdown-item">
                            <div class="allocation-color alternatives-color"></div>
                            <span class="allocation-label">Alternatives</span>
                            <span class="allocation-percent">${(mainModel.alternative_investments || 0).toFixed(1)}%</span>
                        </div>
                    </div>
                    
                    <div class="model-details">
                        ${models.map(model => `
                            <div class="model-item">
                                <div class="model-header">
                                    <span class="model-number">Model ${model.model_no}</span>
                                    <span class="model-type">${model.model_type || 'Standard'}</span>
                                </div>
                                <div class="model-description">${model.model_desc || 'Balanced allocation strategy'}</div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="profile-actions">
                        <button class="profile-btn primary">
                            <i class="fas fa-eye"></i>
                            View Details
                        </button>
                        <button class="profile-btn secondary">
                            <i class="fas fa-download"></i>
                            Download
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    createModelComparisonMatrix(data) {
        // Create a comparison table of all models
        return `
            <div class="comparison-table-wrapper">
                <table class="comparison-table">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Model</th>
                            <th>Type</th>
                            <th>Equities</th>
                            <th>Bonds</th>
                            <th>Cash</th>
                            <th>Alternatives</th>
                            <th>Risk Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(model => {
                            const riskLevel = this.getCategoryRiskLevel(model.category);
                            return `
                                <tr class="comparison-row">
                                    <td class="category-cell">
                                        <div class="category-badge ${riskLevel.class}">
                                            ${model.category}
                                        </div>
                                    </td>
                                    <td class="model-cell">
                                        <div class="model-info">
                                            <span class="model-number">Model ${model.model_no}</span>
                                        </div>
                                    </td>
                                    <td class="type-cell">${model.model_type || 'Standard'}</td>
                                    <td class="allocation-cell equities">
                                        <div class="allocation-bar">
                                            <div class="bar-fill equities" style="width: ${model.equities}%"></div>
                                            <span class="bar-text">${(model.equities || 0).toFixed(1)}%</span>
                                        </div>
                                    </td>
                                    <td class="allocation-cell bonds">
                                        <div class="allocation-bar">
                                            <div class="bar-fill bonds" style="width: ${model.bonds}%"></div>
                                            <span class="bar-text">${(model.bonds || 0).toFixed(1)}%</span>
                                        </div>
                                    </td>
                                    <td class="allocation-cell cash">
                                        <div class="allocation-bar">
                                            <div class="bar-fill cash" style="width: ${model.cash_cash_equivalents}%"></div>
                                            <span class="bar-text">${(model.cash_cash_equivalents || 0).toFixed(1)}%</span>
                                        </div>
                                    </td>
                                    <td class="allocation-cell alternatives">
                                        <div class="allocation-bar">
                                            <div class="bar-fill alternatives" style="width: ${model.alternative_investments}%"></div>
                                            <span class="bar-text">${(model.alternative_investments || 0).toFixed(1)}%</span>
                                        </div>
                                    </td>
                                    <td class="risk-cell">
                                        <span class="risk-indicator ${riskLevel.class}">
                                            ${riskLevel.icon} ${riskLevel.label}
                                        </span>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    getCategoryRiskLevel(category) {
        const riskMapping = {
            'Conservative': { 
                class: 'low-risk', 
                label: 'Low Risk', 
                icon: '<i class="fas fa-shield-alt"></i>' 
            },
            'Moderate': { 
                class: 'medium-risk', 
                label: 'Medium Risk', 
                icon: '<i class="fas fa-balance-scale"></i>' 
            },
            'Growth': { 
                class: 'medium-high-risk', 
                label: 'Medium-High Risk', 
                icon: '<i class="fas fa-chart-line"></i>' 
            },
            'Aggressive': { 
                class: 'high-risk', 
                label: 'High Risk', 
                icon: '<i class="fas fa-rocket"></i>' 
            }
        };
        
        return riskMapping[category] || { 
            class: 'medium-risk', 
            label: 'Medium Risk', 
            icon: '<i class="fas fa-chart-bar"></i>' 
        };
    }

    attachAllocationModelListeners() {
        // Attach event listeners for allocation model filtering
        const categoryFilters = document.querySelectorAll('.category-filter');
        categoryFilters.forEach(filter => {
            filter.addEventListener('change', (e) => {
                this.filterRiskProfileCards(e.target.value);
            });
        });

        // Attach chart button listeners
        const chartBtns = document.querySelectorAll('.chart-btn');
        chartBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.createAllocationCharts();
            });
        });
    }

    filterRiskProfileCards(category) {
        const cards = document.querySelectorAll('.risk-profile-card');
        cards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    createAllocationCharts() {
        // Implementation for creating allocation charts
        console.log('Creating allocation charts...');
    }

    // ===== AI BEHAVIORAL FINANCE COACH METHODS =====
    
    openBehavioralCoach() {
        // Hide other pages
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('dataContainer').style.display = 'none';
        document.getElementById('userDashboard').style.display = 'none';
        document.getElementById('rebalancingPage').style.display = 'none';
        
        // Show behavioral coach page
        document.getElementById('behavioralCoachPage').style.display = 'block';
        
        // Update title
        document.getElementById('contentTitle').textContent = 'AI Behavioral Finance Coach';
        
        // Hide export button
        document.getElementById('exportBtn').style.display = 'none';
        
        // Reset form if coming fresh
        this.resetCoachForm();
    }

    resetCoachForm() {
        // Reset all form inputs with null checks
        const formElements = [
            'primaryLifeEvent', 'eventTimeline', 'financialImpact', 'riskChange', 
            'eventDetails', 'currentEmotion', 'marketOutlook', 'decisionStyle', 'recentBehavior'
        ];
        
        formElements.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
                element.value = '';
            }
        });
        
        // Hide results
        const coachResults = document.getElementById('coachResults');
        if (coachResults) {
            coachResults.style.display = 'none';
        }
    }

    async analyzeLifeEventAndBehavior() {
        // Get form data
        const lifeEventData = this.collectLifeEventData();
        const behavioralData = this.collectBehavioralData();
        
        // Validate required fields
        if (!this.validateCoachForm(lifeEventData, behavioralData)) {
            this.showError('Please fill in all required fields to get personalized recommendations.');
            return;
        }
        
        // Show loading
        const coachLoading = document.getElementById('coachLoading');
        const coachResults = document.getElementById('coachResults');
        
        if (coachLoading) coachLoading.style.display = 'block';
        if (coachResults) coachResults.style.display = 'none';
        
        try {
            // Call real backend API for behavioral analysis
            const response = await fetch(`${this.baseUrl}/api/behavioral-coach/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: this.currentUser,
                    life_event_data: lifeEventData,
                    behavioral_data: behavioralData
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Store current recommendations for later use
                this.currentRecommendations = result.recommendations;
                
                // Display results
                this.displayCoachResults(result.insights, result.recommendations);
            } else {
                throw new Error(result.error || 'Failed to analyze behavioral profile');
            }
            
        } catch (error) {
            console.error('Error analyzing life event and behavior:', error);
            this.showError('Failed to analyze your profile. Please try again.');
        } finally {
            const coachLoading = document.getElementById('coachLoading');
            if (coachLoading) coachLoading.style.display = 'none';
        }
    }

    collectLifeEventData() {
        const getValue = (id) => {
            const element = document.getElementById(id);
            return element ? element.value : '';
        };
        
        return {
            primaryLifeEvent: getValue('primaryLifeEvent'),
            eventTimeline: getValue('eventTimeline'),
            financialImpact: getValue('financialImpact'),
            riskChange: getValue('riskChange'),
            eventDetails: getValue('eventDetails')
        };
    }

    collectBehavioralData() {
        const getValue = (id) => {
            const element = document.getElementById(id);
            return element ? element.value : '';
        };
        
        return {
            currentEmotion: getValue('currentEmotion'),
            marketOutlook: getValue('marketOutlook'),
            decisionStyle: getValue('decisionStyle'),
            recentBehavior: getValue('recentBehavior')
        };
    }

    validateCoachForm(lifeEventData, behavioralData) {
        // Check required fields
        const requiredLifeEvent = ['primaryLifeEvent', 'eventTimeline', 'financialImpact'];
        const requiredBehavioral = ['currentEmotion', 'marketOutlook', 'decisionStyle'];
        
        for (let field of requiredLifeEvent) {
            if (!lifeEventData[field]) return false;
        }
        
        for (let field of requiredBehavioral) {
            if (!behavioralData[field]) return false;
        }
        
        return true;
    }

    async simulateAIAnalysis(lifeEventData, behavioralData) {
        // Simulate AI processing time
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    generateBehavioralInsights(lifeEventData, behavioralData) {
        const insights = {
            emotionalState: this.analyzeEmotionalState(behavioralData),
            decisionPattern: this.analyzeDecisionPattern(behavioralData),
            riskTolerance: this.analyzeRiskTolerance(lifeEventData, behavioralData),
            biasWarnings: this.identifyPotentialBiases(behavioralData)
        };
        
        return insights;
    }

    analyzeEmotionalState(behavioralData) {
        const emotion = behavioralData.currentEmotion;
        const outlook = behavioralData.marketOutlook;
        const recentBehavior = behavioralData.recentBehavior;
        
        let analysis = {
            level: 'neutral',
            description: '',
            recommendations: []
        };
        
        if (emotion === 'very_anxious' || emotion === 'overwhelmed') {
            analysis.level = 'high_stress';
            analysis.description = 'You\'re experiencing high investment anxiety. This is normal during life transitions.';
            analysis.recommendations = [
                'Consider implementing a "cooling-off" period before major portfolio changes',
                'Focus on defensive assets until your situation stabilizes',
                'Set up automatic investing to reduce emotional decision-making'
            ];
        } else if (emotion === 'very_confident' && outlook === 'very_optimistic') {
            analysis.level = 'overconfident';
            analysis.description = 'High confidence can lead to taking excessive risks. Stay balanced.';
            analysis.recommendations = [
                'Review your risk tolerance objectively',
                'Consider taking some profits if positions have grown too large',
                'Maintain diversification even when feeling optimistic'
            ];
        } else if (emotion === 'confident' || emotion === 'neutral') {
            analysis.level = 'balanced';
            analysis.description = 'You\'re in a good emotional state for making investment decisions.';
            analysis.recommendations = [
                'This is an ideal time for portfolio rebalancing',
                'Consider systematic investment strategies',
                'Take advantage of your clear thinking to set long-term goals'
            ];
        }
        
        return analysis;
    }

    analyzeDecisionPattern(behavioralData) {
        const style = behavioralData.decisionStyle;
        const recentBehavior = behavioralData.recentBehavior;
        
        let pattern = {
            type: style,
            strengths: [],
            weaknesses: [],
            recommendations: []
        };
        
        switch (style) {
            case 'analytical':
                pattern.strengths = ['Thorough research', 'Data-driven decisions', 'Long-term thinking'];
                pattern.weaknesses = ['Analysis paralysis', 'Overthinking market timing'];
                pattern.recommendations = ['Set decision deadlines', 'Use systematic rebalancing'];
                break;
            case 'intuitive':
                pattern.strengths = ['Quick decisions', 'Adaptability', 'Pattern recognition'];
                pattern.weaknesses = ['Emotional bias', 'Inconsistent strategy'];
                pattern.recommendations = ['Implement systematic checks', 'Document decision rationale'];
                break;
            case 'delegating':
                pattern.strengths = ['Professional guidance', 'Reduced emotional burden'];
                pattern.weaknesses = ['Less control', 'Potential misalignment'];
                pattern.recommendations = ['Regular advisor reviews', 'Stay informed about strategy'];
                break;
            case 'social':
                pattern.strengths = ['Learning from others', 'Diverse perspectives'];
                pattern.weaknesses = ['Herd mentality', 'Following trends'];
                pattern.recommendations = ['Verify advice independently', 'Focus on your specific goals'];
                break;
            case 'conservative':
                pattern.strengths = ['Risk awareness', 'Capital preservation'];
                pattern.weaknesses = ['Missing growth opportunities', 'Inflation risk'];
                pattern.recommendations = ['Gradual risk adjustment', 'Inflation-protected assets'];
                break;
        }
        
        return pattern;
    }

    analyzeRiskTolerance(lifeEventData, behavioralData) {
        const lifeEvent = lifeEventData.primaryLifeEvent;
        const riskChange = lifeEventData.riskChange;
        const timeline = lifeEventData.eventTimeline;
        const emotion = behavioralData.currentEmotion;
        
        let riskAnalysis = {
            currentLevel: 'moderate',
            suggestedLevel: 'moderate',
            reasoning: '',
            adjustments: []
        };
        
        // Life event impact on risk tolerance
        const conservativeEvents = ['job_loss', 'health_expenses', 'divorce', 'new_baby'];
        const aggressiveEvents = ['inheritance', 'job_change', 'debt_payoff'];
        
        if (conservativeEvents.includes(lifeEvent)) {
            riskAnalysis.suggestedLevel = 'conservative';
            riskAnalysis.reasoning = 'Your life event suggests increased need for stability and liquidity.';
        } else if (aggressiveEvents.includes(lifeEvent)) {
            riskAnalysis.suggestedLevel = 'aggressive';
            riskAnalysis.reasoning = 'Your improved financial situation allows for potentially higher returns.';
        }
        
        // Timeline considerations
        if (timeline === 'happening_now' || timeline === 'next_6_months') {
            riskAnalysis.adjustments.push('Increase cash reserves for immediate needs');
            riskAnalysis.adjustments.push('Consider more liquid investments');
        } else if (timeline === '5_plus_years') {
            riskAnalysis.adjustments.push('Focus on long-term growth assets');
            riskAnalysis.adjustments.push('Can tolerate higher volatility');
        }
        
        return riskAnalysis;
    }

    identifyPotentialBiases(behavioralData) {
        const biases = [];
        
        if (behavioralData.recentBehavior === 'panic_selling') {
            biases.push({
                type: 'Loss Aversion',
                description: 'Tendency to feel losses more than equivalent gains',
                warning: 'Avoid selling during market downturns out of fear',
                mitigation: 'Set automatic rebalancing rules to reduce emotional decisions'
            });
        }
        
        if (behavioralData.recentBehavior === 'fomo_buying') {
            biases.push({
                type: 'Herd Mentality',
                description: 'Following the crowd in investment decisions',
                warning: 'Buying high due to market euphoria can be costly',
                mitigation: 'Stick to your long-term allocation strategy'
            });
        }
        
        if (behavioralData.currentEmotion === 'very_confident' && behavioralData.marketOutlook === 'very_optimistic') {
            biases.push({
                type: 'Overconfidence Bias',
                description: 'Overestimating your ability to predict market movements',
                warning: 'Excessive confidence can lead to poor diversification',
                mitigation: 'Regular portfolio reviews and systematic rebalancing'
            });
        }
        
        if (behavioralData.recentBehavior === 'increased_monitoring') {
            biases.push({
                type: 'Myopic Loss Aversion',
                description: 'Checking portfolio too frequently can increase anxiety',
                warning: 'Daily monitoring can lead to impulsive decisions',
                mitigation: 'Set specific review periods (monthly/quarterly)'
            });
        }
        
        return biases;
    }

    generatePortfolioRecommendations(lifeEventData, behavioralData) {
        const lifeEvent = lifeEventData.primaryLifeEvent;
        const financialImpact = lifeEventData.financialImpact;
        const timeline = lifeEventData.eventTimeline;
        const riskChange = lifeEventData.riskChange;
        
        let recommendations = {
            immediateActions: [],
            allocationChanges: {},
            timelineStrategy: {},
            emergencyFund: 0
        };
        
        // Life event specific recommendations
        switch (lifeEvent) {
            case 'marriage':
                recommendations.immediateActions = [
                    'Combine and review joint financial goals',
                    'Update beneficiaries on all accounts',
                    'Consider joint investment accounts'
                ];
                recommendations.allocationChanges = {
                    cash: 5, // Increase cash for wedding expenses
                    bonds: 25, // Stable income focus
                    stocks: 65, // Growth for long-term goals
                    alternatives: 5
                };
                break;
                
            case 'new_baby':
                recommendations.immediateActions = [
                    'Start education savings plan (529)',
                    'Increase life insurance coverage',
                    'Build larger emergency fund'
                ];
                recommendations.allocationChanges = {
                    cash: 10, // Higher emergency fund
                    bonds: 35, // Income stability
                    stocks: 50, // Long-term growth
                    alternatives: 5
                };
                recommendations.emergencyFund = 6; // months of expenses
                break;
                
            case 'home_purchase':
                recommendations.immediateActions = [
                    'Increase down payment savings',
                    'Reduce portfolio risk temporarily',
                    'Consider real estate exposure reduction'
                ];
                recommendations.allocationChanges = {
                    cash: 15, // Down payment fund
                    bonds: 40, // Capital preservation
                    stocks: 40, // Moderate growth
                    alternatives: 5
                };
                break;
                
            case 'retirement_planning':
                recommendations.immediateActions = [
                    'Maximize retirement account contributions',
                    'Consider tax-advantaged investments',
                    'Review withdrawal strategies'
                ];
                recommendations.allocationChanges = {
                    cash: 5,
                    bonds: 40, // Income focus
                    stocks: 50, // Growth for longevity
                    alternatives: 5
                };
                break;
                
            case 'job_loss':
                recommendations.immediateActions = [
                    'Preserve capital and increase liquidity',
                    'Reduce unnecessary expenses',
                    'Avoid major portfolio changes'
                ];
                recommendations.allocationChanges = {
                    cash: 20, // Large emergency buffer
                    bonds: 50, // Capital preservation
                    stocks: 25, // Reduced risk
                    alternatives: 5
                };
                recommendations.emergencyFund = 12; // months of expenses
                break;
                
            default:
                recommendations.allocationChanges = {
                    cash: 5,
                    bonds: 30,
                    stocks: 60,
                    alternatives: 5
                };
        }
        
        // Timeline adjustments
        if (timeline === 'happening_now' || timeline === 'next_6_months') {
            recommendations.timelineStrategy.priority = 'liquidity';
            recommendations.timelineStrategy.actions = [
                'Increase cash allocation',
                'Reduce volatility exposure',
                'Consider short-term bond funds'
            ];
        } else if (timeline === '5_plus_years') {
            recommendations.timelineStrategy.priority = 'growth';
            recommendations.timelineStrategy.actions = [
                'Focus on equity investments',
                'Consider emerging markets',
                'Utilize tax-advantaged accounts'
            ];
        }
        
        return recommendations;
    }

    displayCoachResults(insights, recommendations) {
        // Show results section
        const coachResults = document.getElementById('coachResults');
        if (coachResults) coachResults.style.display = 'block';
        
        // Display behavioral insights
        this.displayBehavioralInsights(insights);
        
        // Display life event impact
        this.displayLifeEventImpact(recommendations);
        
        // Display portfolio recommendations
        this.displayPortfolioRecommendations(recommendations);
        
        // Generate rebalancing options
        this.generateRebalancingOptions(recommendations);
    }

    displayBehavioralInsights(insights) {
        const container = document.getElementById('behavioralInsights');
        if (!container || !insights) return;
        
        let html = `
            <div class="insight-section">
                <h4><i class="fas fa-heart"></i> Emotional State Analysis</h4>
                <div class="insight-item ${insights.emotional_state?.level || 'balanced'}">
                    <span class="insight-label">Current State:</span>
                    <span class="insight-value">${insights.emotional_state?.description || 'Balanced emotional state'}</span>
                </div>
                <ul class="recommendation-list">
                    ${(insights.emotional_state?.recommendations || []).map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
            
            <div class="insight-section">
                <h4><i class="fas fa-cog"></i> Decision Pattern Analysis</h4>
                <div class="insight-item">
                    <span class="insight-label">Decision Style:</span>
                    <span class="insight-value">${insights.decision_pattern?.type || 'Balanced'}</span>
                </div>
                <div class="strengths-weaknesses">
                    <div class="strengths">
                        <strong>Your Strengths:</strong>
                        <ul>${(insights.decision_pattern?.strengths || []).map(s => `<li>${s}</li>`).join('')}</ul>
                    </div>
                    <div class="weaknesses">
                        <strong>Areas to Watch:</strong>
                        <ul>${(insights.decision_pattern?.weaknesses || []).map(w => `<li>${w}</li>`).join('')}</ul>
                    </div>
                </div>
                <div class="decision-recommendations">
                    <strong>Recommended Approach:</strong>
                    <ul>${(insights.decision_pattern?.recommendations || []).map(r => `<li>${r}</li>`).join('')}</ul>
                </div>
            </div>
            
            <div class="insight-section">
                <h4><i class="fas fa-shield-alt"></i> Risk Tolerance Assessment</h4>
                <div class="insight-item">
                    <span class="insight-label">Suggested Level:</span>
                    <span class="insight-value risk-${(insights.risk_tolerance?.suggested_level || 'moderate').toLowerCase()}">${insights.risk_tolerance?.suggested_level || 'Moderate'}</span>
                </div>
                <div class="risk-reasoning">
                    <p><strong>Analysis:</strong> ${insights.risk_tolerance?.reasoning || 'Maintain balanced approach based on current situation'}</p>
                </div>
                <div class="risk-adjustments">
                    <strong>Recommended Adjustments:</strong>
                    <ul>${(insights.risk_tolerance?.adjustments || []).map(adj => `<li>${adj}</li>`).join('')}</ul>
                </div>
            </div>
        `;
        
        if (insights.bias_warnings && insights.bias_warnings.length > 0) {
            html += `
                <div class="insight-section bias-warnings">
                    <h4><i class="fas fa-exclamation-triangle"></i> Behavioral Bias Alerts</h4>
                    ${insights.bias_warnings.map(bias => `
                        <div class="bias-warning">
                            <strong>${bias.type}:</strong> ${bias.warning}
                            <div class="bias-mitigation">
                                <strong>Mitigation Strategy:</strong> ${bias.mitigation}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        container.innerHTML = html;
    }

    displayLifeEventImpact(recommendations) {
        const container = document.getElementById('lifeEventImpact');
        if (!container || !recommendations) return;
        
        const lifeEventElement = document.getElementById('primaryLifeEvent') || document.getElementById('rebalanceLifeEvent');
        const timelineElement = document.getElementById('eventTimeline') || document.getElementById('rebalanceEventTimeline');
        const financialImpactElement = document.getElementById('financialImpact') || document.getElementById('rebalanceFinancialImpact');
        
        const lifeEvent = lifeEventElement ? lifeEventElement.value : '';
        const timeline = timelineElement ? timelineElement.value : '';
        const financialImpact = financialImpactElement ? financialImpactElement.value : '';
        
        const eventNames = {
            'marriage': 'Getting Married/Partnership',
            'new_baby': 'New Baby Arrival',
            'home_purchase': 'Home Purchase',
            'job_change': 'Job Change/Promotion',
            'job_loss': 'Job Loss/Transition',
            'inheritance': 'Inheritance Received',
            'retirement_planning': 'Retirement Planning',
            'health_expenses': 'Health-Related Expenses',
            'debt_payoff': 'Debt Payoff',
            'education_planning': 'Education Planning',
            'divorce': 'Divorce/Separation',
            'other': 'Other Life Change'
        };
        
        const timelineNames = {
            'happening_now': 'Currently Happening',
            'next_6_months': 'Next 6 Months',
            '6_months_to_2_years': '6 Months to 2 Years',
            '2_to_5_years': '2 to 5 Years',
            '5_plus_years': '5+ Years'
        };
        
        const impactNames = {
            'major_increase': 'Major Income/Asset Increase',
            'moderate_increase': 'Moderate Financial Improvement',
            'no_change': 'No Significant Financial Change',
            'moderate_decrease': 'Moderate Financial Impact',
            'major_decrease': 'Significant Financial Challenge'
        };
        
        let html = `
            <div class="impact-section">
                <h4><i class="fas fa-calendar-alt"></i> Life Event: ${eventNames[lifeEvent] || 'Personal Life Change'}</h4>
                
                <div class="event-details">
                    <div class="detail-row">
                        <span class="detail-label"><i class="fas fa-clock"></i> Timeline:</span>
                        <span class="detail-value">${timelineNames[timeline] || 'Not specified'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label"><i class="fas fa-dollar-sign"></i> Financial Impact:</span>
                        <span class="detail-value impact-${financialImpact}">${impactNames[financialImpact] || 'Assessment needed'}</span>
                    </div>
                </div>
                
                <div class="immediate-actions">
                    <h5><i class="fas fa-tasks"></i> Immediate Actions Recommended:</h5>
                    <ul>
                        ${(recommendations.immediate_actions || []).map(action => `<li>${action}</li>`).join('')}
                    </ul>
                </div>
        `;
        
        if (recommendations.emergency_fund && recommendations.emergency_fund > 0) {
            html += `
                <div class="emergency-fund">
                    <h5><i class="fas fa-shield-alt"></i> Emergency Fund Recommendation:</h5>
                    <p><strong>${recommendations.emergency_fund} months</strong> of expenses in easily accessible accounts</p>
                    <small>This is particularly important given your current life situation</small>
                </div>
            `;
        }
        
        if (recommendations.timeline_strategy && recommendations.timeline_strategy.priority) {
            html += `
                <div class="timeline-strategy">
                    <h5><i class="fas fa-chart-line"></i> Strategy Focus: ${recommendations.timeline_strategy.priority}</h5>
                    <ul>
                        ${(recommendations.timeline_strategy.actions || []).map(action => `<li>${action}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        html += '</div>';
        container.innerHTML = html;
    }

    displayPortfolioRecommendations(recommendations) {
        const container = document.getElementById('portfolioRecommendations');
        if (!container || !recommendations) return;
        
        const allocation = recommendations.allocation_changes || {};
        
        // Get current user allocation for comparison - handle different data sources
        let currentAllocation = {};
        if (this.currentUserData?.allocation_breakdown) {
            // When called from user dashboard
            currentAllocation = this.currentUserData.allocation_breakdown;
        } else if (this.currentUser) {
            // When called from AI coach, fetch current user data
            this.loadCurrentUserAllocation();
        } else {
            // Fallback to default values
            currentAllocation = {
                cash: { current_percent: 5 },
                bonds: { current_percent: 30 },
                equities: { current_percent: 60 },
                alternatives: { current_percent: 5 }
            };
        }
        
        // Check if we have valid allocation data from AI recommendations
        const hasValidAllocation = allocation.cash || allocation.bonds || allocation.stocks || allocation.alternatives;
        
        if (!hasValidAllocation) {
            container.innerHTML = `
                <div class="recommendation-section">
                    <h4><i class="fas fa-chart-pie"></i> AI-Recommended Asset Allocation</h4>
                    <div class="no-data-message">
                        <div class="no-data-icon">
                            <i class="fas fa-exclamation-circle"></i>
                        </div>
                        <div class="no-data-content">
                            <h5>Complete Your Assessment</h5>
                            <p>Please fill out the life event assessment form above to receive personalized allocation recommendations.</p>
                        </div>
                    </div>
                </div>
            `;
            return;
        }
        
        let html = `
            <div class="recommendation-section">
                <h4><i class="fas fa-chart-pie"></i> AI-Recommended Asset Allocation</h4>
                
                <div class="allocation-comparison">
                    <div class="current-vs-recommended">
                        <div class="allocation-column current">
                            <h5><i class="fas fa-chart-bar"></i> Current Allocation</h5>
                            <div class="allocation-breakdown">
                                <div class="allocation-item">
                                    <span class="allocation-label">Cash</span>
                                    <div class="allocation-bar">
                                        <div class="fill current" style="width: ${currentAllocation.cash?.current_percent || 0}%"></div>
                                    </div>
                                    <span class="allocation-percent">${(currentAllocation.cash?.current_percent || 0).toFixed(1)}%</span>
                                </div>
                                <div class="allocation-item">
                                    <span class="allocation-label">Bonds</span>
                                    <div class="allocation-bar">
                                        <div class="fill current" style="width: ${currentAllocation.bonds?.current_percent || 0}%"></div>
                                    </div>
                                    <span class="allocation-percent">${(currentAllocation.bonds?.current_percent || 0).toFixed(1)}%</span>
                                </div>
                                <div class="allocation-item">
                                    <span class="allocation-label">Stocks</span>
                                    <div class="allocation-bar">
                                        <div class="fill current" style="width: ${currentAllocation.equities?.current_percent || 0}%"></div>
                                    </div>
                                    <span class="allocation-percent">${(currentAllocation.equities?.current_percent || 0).toFixed(1)}%</span>
                                </div>
                                <div class="allocation-item">
                                    <span class="allocation-label">Alternatives</span>
                                    <div class="allocation-bar">
                                        <div class="fill current" style="width: ${currentAllocation.alternatives?.current_percent || 0}%"></div>
                                    </div>
                                    <span class="allocation-percent">${(currentAllocation.alternatives?.current_percent || 0).toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="allocation-column recommended">
                            <h5><i class="fas fa-brain"></i> AI Recommended</h5>
                            <div class="allocation-breakdown">
                                <div class="allocation-item">
                                    <span class="allocation-label">Cash</span>
                                    <div class="allocation-bar">
                                        <div class="fill recommended" style="width: ${allocation.cash || 0}%"></div>
                                    </div>
                                    <span class="allocation-percent">${(allocation.cash || 0)}%</span>
                                    ${this.getAllocationChange(currentAllocation.cash?.current_percent || 0, allocation.cash || 0)}
                                </div>
                                <div class="allocation-item">
                                    <span class="allocation-label">Bonds</span>
                                    <div class="allocation-bar">
                                        <div class="fill recommended" style="width: ${allocation.bonds || 0}%"></div>
                                    </div>
                                    <span class="allocation-percent">${(allocation.bonds || 0)}%</span>
                                    ${this.getAllocationChange(currentAllocation.bonds?.current_percent || 0, allocation.bonds || 0)}
                                </div>
                                <div class="allocation-item">
                                    <span class="allocation-label">Stocks</span>
                                    <div class="allocation-bar">
                                        <div class="fill recommended" style="width: ${allocation.stocks || 0}%"></div>
                                    </div>
                                    <span class="allocation-percent">${(allocation.stocks || 0)}%</span>
                                    ${this.getAllocationChange(currentAllocation.equities?.current_percent || 0, allocation.stocks || 0)}
                                </div>
                                <div class="allocation-item">
                                    <span class="allocation-label">Alternatives</span>
                                    <div class="allocation-bar">
                                        <div class="fill recommended" style="width: ${allocation.alternatives || 0}%"></div>
                                    </div>
                                    <span class="allocation-percent">${(allocation.alternatives || 0)}%</span>
                                    ${this.getAllocationChange(currentAllocation.alternatives?.current_percent || 0, allocation.alternatives || 0)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="recommendation-rationale">
                    <h5><i class="fas fa-lightbulb"></i> Why This Allocation?</h5>
                    <div class="rationale-content">
                        <p><strong>Life Event Context:</strong> This allocation is specifically tailored to your current life situation and behavioral profile.</p>
                        
                        <div class="allocation-reasoning">
                            ${allocation.cash > 15 ? `
                                <div class="reasoning-item">
                                    <i class="fas fa-shield-alt"></i>
                                    <span><strong>Increased Cash:</strong> Higher liquidity recommended for upcoming life changes and emergency preparedness.</span>
                                </div>
                            ` : ''}
                            
                            ${allocation.bonds > 30 ? `
                                <div class="reasoning-item">
                                    <i class="fas fa-university"></i>
                                    <span><strong>Conservative Approach:</strong> More bonds for stability during your transition period.</span>
                                </div>
                            ` : ''}
                            
                            ${allocation.stocks > 60 ? `
                                <div class="reasoning-item">
                                    <i class="fas fa-chart-line"></i>
                                    <span><strong>Growth Focus:</strong> Favorable life event allows for increased equity exposure.</span>
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="key-benefits">
                            <h6>Key Benefits of This Strategy:</h6>
                            <ul>
                                ${(recommendations.immediate_actions || []).slice(0, 3).map(action => `<li>${action}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div class="implementation-timeline">
                    <h5><i class="fas fa-calendar-check"></i> Implementation Recommendations</h5>
                    <div class="timeline-items">
                        <div class="timeline-item immediate">
                            <div class="timeline-marker"></div>
                            <div class="timeline-content">
                                <strong>Immediate (Next 30 days):</strong>
                                <p>Review and adjust emergency fund, rebalance most off-target allocations</p>
                            </div>
                        </div>
                        <div class="timeline-item short-term">
                            <div class="timeline-marker"></div>
                            <div class="timeline-content">
                                <strong>Short-term (1-3 months):</strong>
                                <p>Gradual transition to target allocation through systematic investing</p>
                            </div>
                        </div>
                        <div class="timeline-item long-term">
                            <div class="timeline-marker"></div>
                            <div class="timeline-content">
                                <strong>Long-term (3+ months):</strong>
                                <p>Monitor and maintain allocation, adjust based on life event progress</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }
    
    getAllocationChange(current, recommended) {
        const change = recommended - current;
        if (Math.abs(change) < 1) return '';
        
        const changeClass = change > 0 ? 'increase' : 'decrease';
        const changeIcon = change > 0 ? 'fa-arrow-up' : 'fa-arrow-down';
        const changeSymbol = change > 0 ? '+' : '';
        
        return `<span class="allocation-change ${changeClass}">
            <i class="fas ${changeIcon}"></i> ${changeSymbol}${change.toFixed(1)}%
        </span>`;
    }

    generateRebalancingOptions(recommendations) {
        const container = document.getElementById('rebalancingOptions');
        const currentAllocation = this.currentUserData?.allocation_breakdown || {};
        
        let html = `
            <div class="rebalancing-section">
                <div class="section-header">
                    <h3><i class="fas fa-exchange-alt"></i> Rebalancing Implementation Options</h3>
                    <p>Choose how you'd like to implement these recommendations</p>
                </div>
                
                <div class="rebalancing-scenarios">
                    <div class="scenario-card recommended" data-scenario="gradual">
                        <div class="scenario-header">
                            <h4><i class="fas fa-clock"></i> Gradual Transition (Recommended)</h4>
                            <span class="scenario-badge">BEHAVIORAL-FRIENDLY</span>
                        </div>
                        <div class="scenario-content">
                            <p>Implement changes over 3-6 months to reduce emotional impact</p>
                            <ul>
                                <li>Monthly automatic rebalancing</li>
                                <li>Dollar-cost averaging for new positions</li>
                                <li>Reduced transaction costs</li>
                                <li>Lower psychological stress</li>
                            </ul>
                            <div class="scenario-impact">
                                <span class="impact-label">Emotional Impact:</span>
                                <span class="impact-level low">Low</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="scenario-card" data-scenario="immediate">
                        <div class="scenario-header">
                            <h4><i class="fas fa-bolt"></i> Immediate Implementation</h4>
                            <span class="scenario-badge">FAST</span>
                        </div>
                        <div class="scenario-content">
                            <p>Implement all changes within 1-2 weeks</p>
                            <ul>
                                <li>Quick alignment with target allocation</li>
                                <li>Immediate risk adjustment</li>
                                <li>Higher transaction costs</li>
                                <li>Potential for regret if market moves</li>
                            </ul>
                            <div class="scenario-impact">
                                <span class="impact-label">Emotional Impact:</span>
                                <span class="impact-level medium">Medium</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="scenario-card" data-scenario="selective">
                        <div class="scenario-header">
                            <h4><i class="fas fa-crosshairs"></i> Selective Rebalancing</h4>
                            <span class="scenario-badge">TARGETED</span>
                        </div>
                        <div class="scenario-content">
                            <p>Focus only on the most critical allocation changes</p>
                            <ul>
                                <li>Address only major deviations (>10%)</li>
                                <li>Preserve positions you're comfortable with</li>
                                <li>Minimal portfolio disruption</li>
                                <li>Gradual improvement over time</li>
                            </ul>
                            <div class="scenario-impact">
                                <span class="impact-label">Emotional Impact:</span>
                                <span class="impact-level low">Very Low</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        if (container) container.innerHTML = html;
        
        // Add scenario selection listeners
        this.attachScenarioListeners();
    }

    attachScenarioListeners() {
        const scenarioCards = document.querySelectorAll('.scenario-card');
        scenarioCards.forEach(card => {
            card.addEventListener('click', () => {
                // Remove previous selections
                scenarioCards.forEach(c => c.classList.remove('selected'));
                // Select current card
                card.classList.add('selected');
                
                // Store selected scenario
                this.selectedRebalancingScenario = card.dataset.scenario;
                
                // Show implement button
                const implementBtn = document.getElementById('implementRebalancing');
                if (implementBtn) implementBtn.style.display = 'block';
            });
        });
    }

    saveRecommendations() {
        // Save recommendations to user's profile or session
        const recommendations = {
            timestamp: new Date().toISOString(),
            lifeEvent: document.getElementById('primaryLifeEvent').value,
            behavioralProfile: this.collectBehavioralData(),
            recommendedAllocation: this.currentRecommendations?.allocationChanges,
            selectedScenario: this.selectedRebalancingScenario
        };
        
        // Store in localStorage for now (would be saved to backend in real app)
        localStorage.setItem(`recommendations_${this.currentUser}`, JSON.stringify(recommendations));
        
        // Show confirmation
        this.showSuccess('Recommendations saved successfully! You can implement them anytime.');
    }

    async implementBehavioralRebalancing() {
        if (!this.selectedRebalancingScenario) {
            this.showError('Please select a rebalancing scenario first.');
            return;
        }
        
        // Show loading
        const coachLoading = document.getElementById('coachLoading');
        if (coachLoading) coachLoading.style.display = 'block';
        
        try {
            // Call real backend API for rebalancing execution
            const response = await fetch(`${this.baseUrl}/api/behavioral-coach/rebalance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: this.currentUser,
                    scenario: this.selectedRebalancingScenario,
                    recommendations: this.currentRecommendations
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Show success message with real execution details
                this.showRebalancingSuccess(result);
            } else {
                throw new Error(result.error || 'Failed to execute rebalancing');
            }
            
        } catch (error) {
            console.error('Error implementing rebalancing:', error);
            this.showError('Failed to implement rebalancing. Please try again.');
        } finally {
            const coachLoading = document.getElementById('coachLoading');
            if (coachLoading) coachLoading.style.display = 'none';
        }
    }

    async simulateRebalancingImplementation() {
        // Simulate implementation process
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Store implementation record
        const implementation = {
            timestamp: new Date().toISOString(),
            scenario: this.selectedRebalancingScenario,
            status: 'completed',
            userId: this.currentUser
        };
        
        localStorage.setItem(`rebalancing_${Date.now()}`, JSON.stringify(implementation));
    }

    showRebalancingSuccess(result = null) {
        const allocation = result?.new_allocation || {};
        const successHtml = `
            <div class="success-message">
                <div class="success-content">
                    <i class="fas fa-check-circle"></i>
                    <h3>Rebalancing Completed Successfully!</h3>
                    <p>Your portfolio has been rebalanced according to your behavioral profile and life event analysis.</p>
                    
                    <div class="success-details">
                        <div class="detail-item">
                            <span class="detail-label">Scenario:</span>
                            <span class="detail-value">${this.selectedRebalancingScenario}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Completed:</span>
                            <span class="detail-value">${new Date().toLocaleDateString()}</span>
                        </div>
                        ${result ? `
                        <div class="detail-item">
                            <span class="detail-label">Execution ID:</span>
                            <span class="detail-value">#${result.execution_id}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    ${allocation && Object.keys(allocation).length > 0 ? `
                    <div class="new-allocation">
                        <h4>Updated Portfolio Allocation:</h4>
                        <div class="allocation-summary">
                            <div class="allocation-item"><span>Stocks:</span> <span>${allocation.stocks || 0}%</span></div>
                            <div class="allocation-item"><span>Bonds:</span> <span>${allocation.bonds || 0}%</span></div>
                            <div class="allocation-item"><span>Cash:</span> <span>${allocation.cash || 0}%</span></div>
                            <div class="allocation-item"><span>Alternatives:</span> <span>${allocation.alternatives || 0}%</span></div>
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="next-steps">
                        <h4>Next Steps:</h4>
                        <ul>
                            <li>Review your updated portfolio in the dashboard</li>
                            <li>Set up automatic rebalancing for the future</li>
                            <li>Schedule a follow-up assessment in 6 months</li>
                        </ul>
                    </div>
                    
                    <div class="success-actions">
                        <button class="btn btn-primary" onclick="app.backToDashboard()">
                            <i class="fas fa-chart-line"></i>
                            View Updated Portfolio
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        const coachResults = document.getElementById('coachResults');
        if (coachResults) coachResults.innerHTML = successHtml;
    }

    showSuccess(message) {
        // Simple success notification (you can enhance this)
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }

    // ===== AI COACH INTEGRATION IN REBALANCING PAGE =====
    
    toggleAICoachInRebalancing(enableAI) {
        const aiCoachForm = document.getElementById('aiCoachForm');
        const enableBtn = document.getElementById('enableAICoach');
        const traditionalBtn = document.getElementById('useTraditionalRebalancing');
        const scenariosSection = document.getElementById('scenariosSection');
        const aiRecommendations = document.getElementById('aiRecommendations');
        
        if (enableAI) {
            // Show AI coach form
            aiCoachForm.style.display = 'block';
            enableBtn.style.display = 'none';
            traditionalBtn.style.display = 'inline-block';
            scenariosSection.style.display = 'none';
            aiRecommendations.style.display = 'none';
            
            // Clear any previous AI data
            this.clearAIRebalancingForm();
        } else {
            // Show traditional rebalancing
            aiCoachForm.style.display = 'none';
            enableBtn.style.display = 'inline-block';
            traditionalBtn.style.display = 'none';
            aiRecommendations.style.display = 'none';
            
            // Load traditional scenarios
            this.loadRebalancingScenarios(this.currentUser, this.currentAssetClass);
        }
    }
    
    clearAIRebalancingForm() {
        const formElements = [
            'rebalanceLifeEvent', 'rebalanceEventTimeline', 
            'rebalanceFinancialImpact', 'rebalanceCurrentEmotion'
        ];
        
        formElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        });
        
        // Hide recommendations
        document.getElementById('aiRecommendations').style.display = 'none';
    }
    
    async getAIRecommendationsForRebalancing() {
        if (!this.currentUser) {
            this.showError('Please select a user first');
            return;
        }
        
        // Collect form data
        const lifeEventData = {
            primaryLifeEvent: document.getElementById('rebalanceLifeEvent').value,
            eventTimeline: document.getElementById('rebalanceEventTimeline').value,
            financialImpact: document.getElementById('rebalanceFinancialImpact').value,
            eventDetails: `Rebalancing ${this.currentAssetClass} portfolio`,
            riskChange: this.mapFinancialImpactToRisk(document.getElementById('rebalanceFinancialImpact').value)
        };
        
        const behavioralData = {
            currentEmotion: document.getElementById('rebalanceCurrentEmotion').value,
            marketOutlook: 'neutral',
            decisionStyle: 'analytical',
            recentBehavior: 'steady_investing'
        };
        
        // Validate required fields
        if (!lifeEventData.primaryLifeEvent || !lifeEventData.eventTimeline || 
            !lifeEventData.financialImpact || !behavioralData.currentEmotion) {
            this.showError('Please fill in all required fields');
            return;
        }
        
        try {
            // Show loading state
            const aiRecommendations = document.getElementById('aiRecommendations');
            aiRecommendations.style.display = 'block';
            const content = document.getElementById('aiRecommendationsContent');
            content.innerHTML = `
                <div class="loading-state">
                    <i class="fas fa-brain fa-spin"></i>
                    <p>AI is analyzing your life event and current portfolio...</p>
                </div>
            `;
            
            // Call AI analysis API
            const response = await fetch(`${this.baseUrl}/api/behavioral-coach/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: this.currentUser,
                    life_event_data: lifeEventData,
                    behavioral_data: behavioralData
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.displayAIRecommendationsInRebalancing(result.insights, result.recommendations);
            } else {
                throw new Error(result.error || 'Failed to get AI recommendations');
            }
            
        } catch (error) {
            console.error('Error getting AI recommendations:', error);
            this.showError(`Error getting AI recommendations: ${error.message}`);
            document.getElementById('aiRecommendations').style.display = 'none';
        }
    }
    
    displayAIRecommendationsInRebalancing(insights, recommendations) {
        const content = document.getElementById('aiRecommendationsContent');
        
        let emotionalStateClass = 'neutral';
        if (insights.emotional_state.level === 'high_stress') emotionalStateClass = 'stress';
        else if (insights.emotional_state.level === 'overconfident') emotionalStateClass = 'confident';
        
        content.innerHTML = `
            <div class="ai-analysis-grid">
                <div class="analysis-card emotional-state ${emotionalStateClass}">
                    <div class="card-header">
                        <i class="fas fa-heart"></i>
                        <h4>Emotional Analysis</h4>
                    </div>
                    <div class="card-content">
                        <p class="analysis-level">${insights.emotional_state.description}</p>
                        <ul class="recommendations-list">
                            ${insights.emotional_state.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                
                <div class="analysis-card risk-assessment">
                    <div class="card-header">
                        <i class="fas fa-shield-alt"></i>
                        <h4>Risk Tolerance</h4>
                    </div>
                    <div class="card-content">
                        <p class="risk-level">Suggested Level: <strong>${insights.risk_tolerance.suggested_level}</strong></p>
                        <p class="risk-reasoning">${insights.risk_tolerance.reasoning}</p>
                        <ul class="adjustments-list">
                            ${insights.risk_tolerance.adjustments.map(adj => `<li>${adj}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                
                <div class="analysis-card portfolio-advice">
                    <div class="card-header">
                        <i class="fas fa-chart-pie"></i>
                        <h4>Portfolio Strategy</h4>
                    </div>
                    <div class="card-content">
                        <div class="allocation-targets">
                            <h5>Recommended Allocation:</h5>
                            <div class="allocation-bars">
                                <div class="allocation-bar">
                                    <span class="asset-label">Stocks</span>
                                    <div class="bar-container">
                                        <div class="bar-fill" style="width: ${recommendations.allocation_changes.stocks || 0}%"></div>
                                        <span class="percentage">${recommendations.allocation_changes.stocks || 0}%</span>
                                    </div>
                                </div>
                                <div class="allocation-bar">
                                    <span class="asset-label">Bonds</span>
                                    <div class="bar-container">
                                        <div class="bar-fill" style="width: ${recommendations.allocation_changes.bonds || 0}%"></div>
                                        <span class="percentage">${recommendations.allocation_changes.bonds || 0}%</span>
                                    </div>
                                </div>
                                <div class="allocation-bar">
                                    <span class="asset-label">Cash</span>
                                    <div class="bar-container">
                                        <div class="bar-fill" style="width: ${recommendations.allocation_changes.cash || 0}%"></div>
                                        <span class="percentage">${recommendations.allocation_changes.cash || 0}%</span>
                                    </div>
                                </div>
                                <div class="allocation-bar">
                                    <span class="asset-label">Alternatives</span>
                                    <div class="bar-container">
                                        <div class="bar-fill" style="width: ${recommendations.allocation_changes.alternatives || 0}%"></div>
                                        <span class="percentage">${recommendations.allocation_changes.alternatives || 0}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="immediate-actions">
                            <h5>Immediate Actions:</h5>
                            <ul>
                                ${recommendations.immediate_actions.map(action => `<li>${action}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="emergency-fund">
                            <p><strong>Emergency Fund:</strong> ${recommendations.emergency_fund} months of expenses</p>
                        </div>
                    </div>
                </div>
            </div>
            
            ${insights.bias_warnings && insights.bias_warnings.length > 0 ? `
                <div class="bias-warnings">
                    <h4><i class="fas fa-exclamation-triangle"></i> Behavioral Bias Alerts</h4>
                    ${insights.bias_warnings.map(bias => `
                        <div class="bias-alert">
                            <strong>${bias.type}:</strong> ${bias.warning}
                            <br><em>Mitigation: ${bias.mitigation}</em>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;
        
        // Store recommendations for later use
        this.currentAIRecommendations = {
            insights: insights,
            recommendations: recommendations
        };
    }
    
    modifyAIInputs() {
        // Hide recommendations and show form again
        document.getElementById('aiRecommendations').style.display = 'none';
        document.getElementById('aiCoachForm').style.display = 'block';
    }
    
    async proceedWithAIStrategy() {
        if (!this.currentAIRecommendations) {
            this.showError('No AI recommendations available');
            return;
        }
        
        // Generate AI-based rebalancing scenarios
        await this.generateAIBasedScenarios();
    }
    
    async generateAIBasedScenarios() {
        try {
            const recommendations = this.currentAIRecommendations.recommendations;
            
            // Create three scenarios based on AI recommendations
            const scenarios = [
                {
                    id: 'ai_gradual',
                    name: 'AI Gradual Transition',
                    description: 'Gradual implementation of AI recommendations with minimal emotional impact',
                    risk_level: 'Low',
                    expected_return: '+3.2% annually',
                    timeframe: '6-12 months',
                    cost: '$30-50',
                    actions: this.generateGradualActions(recommendations),
                    ai_based: true,
                    emotional_impact: 'Very Low'
                },
                {
                    id: 'ai_balanced',
                    name: 'AI Balanced Strategy',
                    description: 'Balanced implementation following AI life event analysis',
                    risk_level: 'Medium',
                    expected_return: '+4.8% annually',
                    timeframe: '3-6 months',
                    cost: '$50-80',
                    actions: this.generateBalancedActions(recommendations),
                    ai_based: true,
                    emotional_impact: 'Low'
                },
                {
                    id: 'ai_optimal',
                    name: 'AI Optimal Allocation',
                    description: 'Full implementation of AI-optimized allocation for your life event',
                    risk_level: 'Medium-High',
                    expected_return: '+6.5% annually',
                    timeframe: '1-3 months',
                    cost: '$80-120',
                    actions: this.generateOptimalActions(recommendations),
                    ai_based: true,
                    emotional_impact: 'Medium'
                }
            ];
            
            this.displayAIScenarios(scenarios);
            
        } catch (error) {
            console.error('Error generating AI scenarios:', error);
            this.showError('Error generating AI-based scenarios');
        }
    }
    
    generateGradualActions(recommendations) {
        const actions = [];
        const allocation = recommendations.allocation_changes;
        
        actions.push({
            type: 'rebalance',
            description: `Gradually adjust ${this.currentAssetClass} allocation by 1/3 toward target`,
            target_percentage: allocation[this.currentAssetClass] || 0,
            implementation: 'gradual'
        });
        
        recommendations.immediate_actions.slice(0, 2).forEach(action => {
            actions.push({
                type: 'action',
                description: action,
                priority: 'high'
            });
        });
        
        return actions;
    }
    
    generateBalancedActions(recommendations) {
        const actions = [];
        const allocation = recommendations.allocation_changes;
        
        actions.push({
            type: 'rebalance',
            description: `Adjust ${this.currentAssetClass} allocation by 2/3 toward AI target`,
            target_percentage: allocation[this.currentAssetClass] || 0,
            implementation: 'balanced'
        });
        
        recommendations.immediate_actions.forEach(action => {
            actions.push({
                type: 'action',
                description: action,
                priority: 'medium'
            });
        });
        
        return actions;
    }
    
    generateOptimalActions(recommendations) {
        const actions = [];
        const allocation = recommendations.allocation_changes;
        
        actions.push({
            type: 'rebalance',
            description: `Fully implement AI-recommended ${this.currentAssetClass} allocation`,
            target_percentage: allocation[this.currentAssetClass] || 0,
            implementation: 'immediate'
        });
        
        recommendations.immediate_actions.forEach(action => {
            actions.push({
                type: 'action',
                description: action,
                priority: 'high'
            });
        });
        
        return actions;
    }
    
    displayAIScenarios(scenarios) {
        // Hide AI form and show scenarios
        document.getElementById('aiCoachForm').style.display = 'none';
        document.getElementById('aiRecommendations').style.display = 'none';
        document.getElementById('scenariosSection').style.display = 'block';
        
        const scenariosGrid = document.getElementById('scenariosGrid');
        scenariosGrid.innerHTML = scenarios.map(scenario => `
            <div class="scenario-card ai-scenario ${scenario.id === this.selectedScenario ? 'selected' : ''}" 
                 data-scenario="${scenario.id}">
                <div class="scenario-header">
                    <div class="scenario-icon ai-powered">
                        <i class="fas fa-brain"></i>
                    </div>
                    <div class="scenario-info">
                        <h3>${scenario.name}</h3>
                        <p class="scenario-description">${scenario.description}</p>
                    </div>
                    <div class="ai-badge">
                        <i class="fas fa-robot"></i>
                        AI Powered
                    </div>
                </div>
                
                <div class="scenario-details">
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Risk Level</span>
                            <span class="detail-value risk-${scenario.risk_level.toLowerCase().replace(' ', '-')}">${scenario.risk_level}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Expected Return</span>
                            <span class="detail-value return-positive">${scenario.expected_return}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Timeframe</span>
                            <span class="detail-value">${scenario.timeframe}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Emotional Impact</span>
                            <span class="detail-value">${scenario.emotional_impact}</span>
                        </div>
                    </div>
                    
                    <div class="scenario-actions">
                        <h4>AI Recommended Actions:</h4>
                        <ul class="actions-list">
                            ${scenario.actions.map(action => `
                                <li class="action-item ${action.type}">
                                    <i class="fas fa-${action.type === 'rebalance' ? 'balance-scale' : 'tasks'}"></i>
                                    ${action.description}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add click handlers for scenario selection
        document.querySelectorAll('.scenario-card').forEach(card => {
            card.addEventListener('click', () => {
                this.selectScenario(card.dataset.scenario);
            });
        });
    }
    
    mapFinancialImpactToRisk(impact) {
        const mapping = {
            'major_increase': 'moderate_increase',
            'moderate_increase': 'slight_increase', 
            'no_change': 'no_change',
            'moderate_decrease': 'moderate_decrease',
            'major_decrease': 'significant_decrease'
        };
                 return mapping[impact] || 'no_change';
    }
    
    async loadCurrentUserAllocation() {
        if (!this.currentUser) return;
        
        try {
            const response = await fetch(`${this.baseUrl}/api/user/${this.currentUser}`);
            const result = await response.json();
            
            if (result.success && result.user_data) {
                // Store just the allocation breakdown for AI coach use
                this.currentUserData = result.user_data;
            }
        } catch (error) {
            console.error('Error loading current user allocation:', error);
        }
    }

    showAIScenarios() {
        // Toggle button states
        document.getElementById('aiScenariosBtn').classList.add('active');
        document.getElementById('customOptionsBtn').classList.remove('active');
        
        // Show AI scenarios, hide custom options
        document.getElementById('scenariosGrid').style.display = 'grid';
        document.getElementById('customRebalancing').style.display = 'none';
        document.getElementById('executeRebalance').style.display = this.selectedScenario ? 'inline-flex' : 'none';
        document.getElementById('executeCustomRebalance').style.display = 'none';
    }

    showCustomOptions() {
        // Toggle button states
        document.getElementById('aiScenariosBtn').classList.remove('active');
        document.getElementById('customOptionsBtn').classList.add('active');
        
        // Hide AI scenarios, show custom options
        document.getElementById('scenariosGrid').style.display = 'none';
        document.getElementById('customRebalancing').style.display = 'block';
        document.getElementById('executeRebalance').style.display = 'none';
        document.getElementById('executeCustomRebalance').style.display = 'none';
        
        // Load custom options
        this.loadCustomRebalancingOptions();
    }

    async loadCustomRebalancingOptions() {
        try {
            const response = await fetch(`${this.baseUrl}/api/rebalance-options/${this.currentUser}/${this.currentAssetClass}`);
            const result = await response.json();
            
            if (result.success) {
                this.customSellOptions = result.sell_options;
                this.customBuyOptions = result.buy_options;
                this.selectedSells = [];
                this.selectedBuys = [];
                
                this.displayCustomSellOptions(result.sell_options);
                this.displayCustomBuyOptions(result.buy_options);
                this.updateCustomSummary();
            } else {
                console.error('Error loading custom options:', result.error);
            }
        } catch (error) {
            console.error('Error loading custom options:', error);
        }
    }

    displayCustomSellOptions(sellOptions) {
        const container = document.getElementById('customSellOptions');
        
        if (!sellOptions || sellOptions.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #718096;">
                    <i class="fas fa-info-circle" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                    <div>No sell options available</div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = sellOptions.map(option => `
            <div class="custom-option-item sell-option" data-option-id="${option.id}" onclick="window.portfolioApp.toggleSellOption('${option.id}')">
                <div class="option-header">
                    <div class="option-info">
                        <h5>${option.fund_name}</h5>
                        <div class="fund-symbol">${option.fund_symbol}</div>
                    </div>
                    <div class="option-amount">
                        ${new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0
                        }).format(option.suggested_sell_amount)}
                    </div>
                </div>
                <div class="option-details">${option.reason}</div>
                <div class="option-performance">
                    <span class="performance-indicator ${option.return_percent >= 0 ? 'positive' : 'negative'}">
                        ${option.return_percent >= 0 ? '+' : ''}${option.return_percent.toFixed(1)}% return
                    </span>
                    <span class="performance-rating ${option.performance_rating.toLowerCase().replace(' ', '-')}">
                        ${option.performance_rating}
                    </span>
                </div>
                <input type="number" class="amount-input" id="sell-amount-${option.id}" 
                       value="${option.suggested_sell_amount.toFixed(0)}" 
                       max="${option.current_value.toFixed(0)}"
                       min="100"
                       step="100"
                       placeholder="Amount to sell"
                       onclick="event.stopPropagation()"
                       onchange="window.portfolioApp.updateSellAmount('${option.id}', this.value)"
                       style="display: none;">
            </div>
        `).join('');
    }

    displayCustomBuyOptions(buyOptions) {
        const container = document.getElementById('customBuyOptions');
        
        if (!buyOptions || buyOptions.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #718096;">
                    <i class="fas fa-info-circle" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                    <div>No buy options available</div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = buyOptions.map(option => `
            <div class="custom-option-item buy-option" data-option-id="${option.id}" onclick="window.portfolioApp.toggleBuyOption('${option.id}')">
                <div class="option-header">
                    <div class="option-info">
                        <h5>${option.fund_name}</h5>
                        <div class="fund-symbol">${option.fund_symbol}</div>
                    </div>
                    <div class="option-amount">
                        ${new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0
                        }).format(option.suggested_buy_amount)}
                    </div>
                </div>
                <div class="option-details">${option.reason}</div>
                <div class="option-performance">
                    <span class="performance-indicator positive">
                        +${option.returns_1year.toFixed(1)}% annual return
                    </span>
                    <span class="performance-rating ${option.performance_rating.toLowerCase().replace(' ', '-')}">
                        ${option.performance_rating}
                    </span>
                </div>
                <input type="number" class="amount-input" id="buy-amount-${option.id}" 
                       value="${option.suggested_buy_amount.toFixed(0)}" 
                       min="100"
                       step="100"
                       placeholder="Amount to buy"
                       onclick="event.stopPropagation()"
                       onchange="window.portfolioApp.updateBuyAmount('${option.id}', this.value)"
                       style="display: none;">
            </div>
        `).join('');
    }

    toggleSellOption(optionId) {
        const optionElement = document.querySelector(`[data-option-id="${optionId}"]`);
        const amountInput = document.getElementById(`sell-amount-${optionId}`);
        
        if (optionElement.classList.contains('selected')) {
            // Deselect
            optionElement.classList.remove('selected');
            amountInput.style.display = 'none';
            this.selectedSells = this.selectedSells.filter(s => s.id !== optionId);
        } else {
            // Select
            optionElement.classList.add('selected');
            amountInput.style.display = 'block';
            
            const sellOption = this.customSellOptions.find(o => o.id === optionId);
            if (sellOption) {
                this.selectedSells.push({
                    id: optionId,
                    fund_symbol: sellOption.fund_symbol,
                    fund_name: sellOption.fund_name,
                    amount: parseFloat(amountInput.value) || sellOption.suggested_sell_amount
                });
            }
        }
        
        this.updateCustomSummary();
    }

    toggleBuyOption(optionId) {
        const optionElement = document.querySelector(`[data-option-id="${optionId}"]`);
        const amountInput = document.getElementById(`buy-amount-${optionId}`);
        
        if (optionElement.classList.contains('selected')) {
            // Deselect
            optionElement.classList.remove('selected');
            amountInput.style.display = 'none';
            this.selectedBuys = this.selectedBuys.filter(b => b.id !== optionId);
        } else {
            // Select
            optionElement.classList.add('selected');
            amountInput.style.display = 'block';
            
            const buyOption = this.customBuyOptions.find(o => o.id === optionId);
            if (buyOption) {
                this.selectedBuys.push({
                    id: optionId,
                    fund_symbol: buyOption.fund_symbol,
                    fund_name: buyOption.fund_name,
                    amount: parseFloat(amountInput.value) || buyOption.suggested_buy_amount
                });
            }
        }
        
        this.updateCustomSummary();
    }

    updateSellAmount(optionId, newAmount) {
        const sellIndex = this.selectedSells.findIndex(s => s.id === optionId);
        if (sellIndex !== -1) {
            this.selectedSells[sellIndex].amount = parseFloat(newAmount) || 0;
            this.updateCustomSummary();
        }
    }

    updateBuyAmount(optionId, newAmount) {
        const buyIndex = this.selectedBuys.findIndex(b => b.id === optionId);
        if (buyIndex !== -1) {
            this.selectedBuys[buyIndex].amount = parseFloat(newAmount) || 0;
            this.updateCustomSummary();
        }
    }

    updateCustomSummary() {
        const sellCounter = document.getElementById('sellCounter');
        const buyCounter = document.getElementById('buyCounter');
        const customSummary = document.getElementById('customSummary');
        const executeCustomBtn = document.getElementById('executeCustomRebalance');
        
        // Update counters
        sellCounter.textContent = `${this.selectedSells.length} selected`;
        buyCounter.textContent = `${this.selectedBuys.length} selected`;
        
        // Calculate totals
        const totalSellAmount = this.selectedSells.reduce((sum, sell) => sum + sell.amount, 0);
        const totalBuyAmount = this.selectedBuys.reduce((sum, buy) => sum + buy.amount, 0);
        const netChange = totalBuyAmount - totalSellAmount;
        
        // Show/hide summary
        if (this.selectedSells.length > 0 || this.selectedBuys.length > 0) {
            customSummary.style.display = 'block';
            executeCustomBtn.style.display = 'inline-flex';
            
            // Update summary values
            document.getElementById('totalSellAmount').textContent = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0
            }).format(totalSellAmount);
            
            document.getElementById('totalBuyAmount').textContent = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0
            }).format(totalBuyAmount);
            
            document.getElementById('netChange').textContent = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0
            }).format(Math.abs(netChange));
            
            // Color the net change based on positive/negative
            const netChangeElement = document.getElementById('netChange');
            netChangeElement.style.color = netChange >= 0 ? '#38a169' : '#e53e3e';
        } else {
            customSummary.style.display = 'none';
            executeCustomBtn.style.display = 'none';
        }
    }

    async executeCustomRebalancing() {
        if (this.selectedSells.length === 0 && this.selectedBuys.length === 0) {
            alert('Please select at least one buy or sell option.');
            return;
        }
        
        try {
            // Show loading
            document.getElementById('scenariosSection').style.display = 'none';
            document.getElementById('rebalancingLoading').style.display = 'flex';
            document.querySelector('.rebalancing-loading span').textContent = 'Executing custom rebalancing...';
            
            const response = await fetch(`${this.baseUrl}/api/execute-custom-rebalance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: this.currentUser,
                    selected_sells: this.selectedSells,
                    selected_buys: this.selectedBuys
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showCustomRebalancingSuccess(result.summary);
            } else {
                alert(`Error executing custom rebalancing: ${result.error}`);
                document.getElementById('rebalancingLoading').style.display = 'none';
                document.getElementById('scenariosSection').style.display = 'block';
            }
            
        } catch (error) {
            console.error('Error executing custom rebalancing:', error);
            alert('Failed to execute custom rebalancing. Please try again.');
            document.getElementById('rebalancingLoading').style.display = 'none';
            document.getElementById('scenariosSection').style.display = 'block';
        }
    }

    showCustomRebalancingSuccess(summary) {
        document.getElementById('rebalancingLoading').style.display = 'none';
        const successSection = document.getElementById('rebalancingSuccess');
        
        successSection.innerHTML = `
            <div class="rebalancing-success-content">
                <div class="success-header">
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h2>Custom Rebalancing Completed!</h2>
                    <p>Your personalized rebalancing strategy has been executed successfully.</p>
                </div>
                
                <div class="rebalancing-summary">
                    <div class="summary-card">
                        <h3>📊 Transaction Summary</h3>
                        <div class="custom-transaction-summary">
                            <div class="transaction-row">
                                <span class="transaction-label">Total Sells:</span>
                                <span class="transaction-value sell-value">${new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                    minimumFractionDigits: 0
                                }).format(summary.total_sell_amount)}</span>
                                <span class="transaction-count">(${summary.num_sells} transactions)</span>
                            </div>
                            <div class="transaction-row">
                                <span class="transaction-label">Total Buys:</span>
                                <span class="transaction-value buy-value">${new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                    minimumFractionDigits: 0
                                }).format(summary.total_buy_amount)}</span>
                                <span class="transaction-count">(${summary.num_buys} transactions)</span>
                            </div>
                            <div class="transaction-row net-change-row">
                                <span class="transaction-label">Net Investment Change:</span>
                                <span class="transaction-value ${summary.net_change >= 0 ? 'positive' : 'negative'}">
                                    ${summary.net_change >= 0 ? '+' : ''}${new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: 'USD',
                                        minimumFractionDigits: 0
                                    }).format(summary.net_change)}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="summary-card balanced-status">
                        <h3>🎯 Portfolio Status</h3>
                        <div class="status-message">
                            <div class="status-icon balanced">
                                <i class="fas fa-user-check"></i>
                            </div>
                            <div class="status-text">
                                <div class="status-title">Custom Strategy Executed!</div>
                                <div class="status-description">
                                    Your personalized buy and sell selections have been implemented to optimize your portfolio according to your preferences.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="success-actions">
                    <button class="btn btn-primary" onclick="window.portfolioApp.backToDashboard()">
                        <i class="fas fa-chart-line"></i>
                        View Updated Dashboard
                    </button>
                    <button class="btn btn-secondary" onclick="window.portfolioApp.downloadCustomRebalancingReport()">
                        <i class="fas fa-download"></i>
                        Download Report
                    </button>
                </div>
            </div>
        `;
        
        successSection.style.display = 'flex';
    }

    downloadCustomRebalancingReport() {
        // Generate a custom rebalancing report
        const reportData = [
            ['Transaction Type', 'Fund Name', 'Fund Symbol', 'Amount'],
            ...this.selectedSells.map(sell => ['SELL', sell.fund_name, sell.fund_symbol, `$${sell.amount.toFixed(2)}`]),
            ...this.selectedBuys.map(buy => ['BUY', buy.fund_name, buy.fund_symbol, `$${buy.amount.toFixed(2)}`])
        ];
        
        const csvContent = reportData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `custom_rebalancing_report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    displayAIRebalancingProfessional(data) {
        // Hide the traditional table structure
        document.getElementById('dataTable').style.display = 'none';
        
        // Create AI Rebalancing interface
        const container = document.querySelector('.table-wrapper');
        container.innerHTML = `
            <div class="ai-rebalancing-interface">
                <div class="ai-header">
                    <div class="ai-title">
                        <h2>🤖 AI Assisted Portfolio Rebalancing</h2>
                        <p>Personalized rebalancing recommendations for ${data.length} customers</p>
                    </div>
                    <div class="ai-stats">
                        <div class="stat-card">
                            <span class="stat-number">${data.filter(c => c.rebalancing_priority === 'High').length}</span>
                            <span class="stat-label">High Priority</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-number">${data.filter(c => c.rebalancing_priority === 'Medium').length}</span>
                            <span class="stat-label">Medium Priority</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-number">${data.filter(c => c.rebalancing_priority === 'Low').length}</span>
                            <span class="stat-label">Low Priority</span>
                        </div>
                    </div>
                </div>
                
                <div class="customers-grid">
                    ${data.map(customer => `
                        <div class="customer-rebalance-card ${customer.rebalancing_priority.toLowerCase()}-priority" 
                             onclick="portfolioApp.openCustomerAIAnalysis('${customer.user_id}')">
                            <div class="customer-card-header">
                                <div class="customer-info">
                                    <h3>${customer.full_name}</h3>
                                    <div class="customer-meta">
                                        <span class="age">${customer.age} years</span>
                                        <span class="category">${customer.investor_category}</span>
                                    </div>
                                </div>
                                <div class="priority-indicator ${customer.rebalancing_priority.toLowerCase()}">
                                    ${customer.rebalancing_priority}
                                </div>
                            </div>
                            
                            <div class="customer-metrics">
                                <div class="metric">
                                    <span class="metric-label">Portfolio Value</span>
                                    <span class="metric-value">$${customer.portfolio_value.toLocaleString()}</span>
                                </div>
                                <div class="metric">
                                    <span class="metric-label">Avg Return</span>
                                    <span class="metric-value ${customer.avg_return >= 0 ? 'positive' : 'negative'}">
                                        ${customer.avg_return >= 0 ? '+' : ''}${customer.avg_return.toFixed(1)}%
                                    </span>
                                </div>
                                <div class="metric">
                                    <span class="metric-label">Allocation Drift</span>
                                    <span class="metric-value drift-value">${customer.equity_drift.toFixed(1)}%</span>
                                </div>
                            </div>
                            
                            <div class="allocation-visual">
                                <div class="allocation-bar">
                                    <div class="current-bar" style="width: ${customer.current_equity}%"></div>
                                    <div class="target-line" style="left: ${customer.target_equity}%"></div>
                                </div>
                                <div class="allocation-labels">
                                    <span>Current: ${customer.current_equity.toFixed(1)}%</span>
                                    <span>Target: ${customer.target_equity}%</span>
                                </div>
                            </div>
                            
                            <div class="ai-actions">
                                <button class="ai-analysis-btn" onclick="event.stopPropagation(); portfolioApp.openCustomerAIAnalysis('${customer.user_id}')">
                                    <i class="fas fa-robot"></i>
                                    AI Analysis
                                </button>
                                <span class="holdings-count">${customer.holdings_count} holdings</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Add AI Rebalancing specific styles if not already added
        if (!document.getElementById('ai-rebalancing-styles')) {
            const styles = document.createElement('style');
            styles.id = 'ai-rebalancing-styles';
            styles.textContent = `
                .ai-rebalancing-interface {
                    padding: 2rem;
                    max-width: 1400px;
                    margin: 0 auto;
                }
                
                .ai-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 2px solid #e2e8f0;
                }
                
                .ai-title h2 {
                    margin: 0 0 0.5rem 0;
                    color: #1e293b;
                    font-size: 1.8rem;
                    font-weight: 700;
                }
                
                .ai-title p {
                    margin: 0;
                    color: #64748b;
                    font-size: 1rem;
                }
                
                .ai-stats {
                    display: flex;
                    gap: 1rem;
                }
                
                .stat-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 1rem;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border-radius: 8px;
                    min-width: 80px;
                }
                
                .stat-number {
                    font-size: 1.8rem;
                    font-weight: 700;
                    margin-bottom: 0.25rem;
                }
                
                .stat-label {
                    font-size: 0.875rem;
                    opacity: 0.9;
                }
                
                .customers-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    gap: 1.5rem;
                }
                
                .customer-rebalance-card {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    border: 2px solid #e5e7eb;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                }
                
                .customer-rebalance-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                }
                
                .customer-rebalance-card.high-priority {
                    border-left: 4px solid #dc2626;
                }
                
                .customer-rebalance-card.medium-priority {
                    border-left: 4px solid #f59e0b;
                }
                
                .customer-rebalance-card.low-priority {
                    border-left: 4px solid #16a34a;
                }
                
                .customer-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1rem;
                }
                
                .customer-info h3 {
                    margin: 0 0 0.25rem 0;
                    color: #1e293b;
                    font-size: 1.25rem;
                    font-weight: 600;
                }
                
                .customer-meta {
                    display: flex;
                    gap: 0.75rem;
                    font-size: 0.875rem;
                    color: #64748b;
                }
                
                .priority-indicator {
                    padding: 0.375rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                
                .priority-indicator.high {
                    background: #fee2e2;
                    color: #dc2626;
                }
                
                .priority-indicator.medium {
                    background: #fef3c7;
                    color: #d97706;
                }
                
                .priority-indicator.low {
                    background: #dcfce7;
                    color: #16a34a;
                }
                
                .customer-metrics {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1rem;
                    margin-bottom: 1rem;
                    padding: 1rem;
                    background: #f8fafc;
                    border-radius: 8px;
                }
                
                .metric {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                }
                
                .metric-label {
                    font-size: 0.75rem;
                    color: #64748b;
                    margin-bottom: 0.25rem;
                    text-transform: uppercase;
                    font-weight: 500;
                }
                
                .metric-value {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #1e293b;
                }
                
                .metric-value.positive {
                    color: #059669;
                }
                
                .metric-value.negative {
                    color: #dc2626;
                }
                
                .allocation-visual {
                    margin-bottom: 1rem;
                }
                
                .allocation-bar {
                    position: relative;
                    height: 8px;
                    background: #e5e7eb;
                    border-radius: 4px;
                    margin-bottom: 0.5rem;
                }
                
                .current-bar {
                    height: 100%;
                    background: linear-gradient(90deg, #667eea, #764ba2);
                    border-radius: 4px;
                    transition: width 0.3s ease;
                }
                
                .target-line {
                    position: absolute;
                    top: -2px;
                    height: 12px;
                    width: 2px;
                    background: #dc2626;
                    transform: translateX(-1px);
                }
                
                .allocation-labels {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.75rem;
                    color: #64748b;
                }
                
                .ai-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .ai-analysis-btn {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .ai-analysis-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                }
                
                .holdings-count {
                    font-size: 0.875rem;
                    color: #64748b;
                }
                
                @media (max-width: 768px) {
                    .ai-header {
                        flex-direction: column;
                        gap: 1rem;
                        text-align: center;
                    }
                    
                    .customers-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .customer-metrics {
                        grid-template-columns: 1fr;
                        gap: 0.5rem;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
    }

    async openCustomerAIAnalysis(userId) {
        try {
            // Load personalized AI scenarios for this customer
            const response = await fetch(`${this.baseUrl}/api/ai/scenarios/${userId}`);
            const result = await response.json();
            
            if (result.success) {
                // Open the dedicated AI assistant page with this customer's data
                const aiWindow = window.open('/ai-assistant.html', '_blank');
                
                // Store the customer data for the AI assistant page
                sessionStorage.setItem('selectedCustomer', JSON.stringify(result));
                
                // Show success message
                this.showNotification(`Opening AI analysis for ${result.customer_profile.name}...`, 'success');
            } else {
                this.showNotification('Failed to load customer AI analysis', 'error');
            }
        } catch (error) {
            console.error('Error opening AI analysis:', error);
            this.showNotification('Failed to open AI analysis', 'error');
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioApp = new PortfolioApp();
}); 