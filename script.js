// SalesVision Pro - Sales Analytics Platform
// Main JavaScript Application

// Configuration - Replace with your Supabase credentials
const SUPABASE_CONFIG = {
    url: 'https://uwuztdwbjwkuoqmclcpq.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3dXp0ZHdiandrdW9xbWNsY3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NDc3MzIsImV4cCI6MjA2MzUyMzczMn0.79WzYhDz-v80SbhOWEIegtSJKO6AtBcLN5REasUz1CI'
};

// Global variables
let supabaseClient;
let currentUser = null;
let charts = {};
let realTimeSubscriptions = [];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        // Initialize Supabase client
        if (SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_URL_HERE') {
            supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
            
            // Check authentication
            const { data: { user } } = await supabaseClient.auth.getUser();
            currentUser = user;
        }

        // Initialize UI components
        initializeNavigation();
        initializeModals();
        initializeEventListeners();
        initializeCharts();
        
        // Load initial data
        await loadDashboardData();
        
        // Setup real-time subscriptions
        setupRealTimeSubscriptions();
        
        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('app').style.display = 'flex';
        }, 1500);

    } catch (error) {
        console.error('App initialization error:', error);
        showToast('Application initialization failed', 'error');
    }
}

// Navigation Management
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Show corresponding section
            const targetSection = item.dataset.section + '-section';
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(targetSection).classList.add('active');
            
            // Load section-specific data
            loadSectionData(item.dataset.section);
        });
    });
}

// Modal Management
function initializeModals() {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        // Close button
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => closeModal(modal.id));
        }
        
        // Cancel button
        const cancelBtn = modal.querySelector('.modal-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => closeModal(modal.id));
        }
        
        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
}

// Event Listeners
function initializeEventListeners() {
    // User menu toggle
    const userMenuToggle = document.getElementById('user-menu-toggle');
    const userDropdown = document.getElementById('user-dropdown');
    
    userMenuToggle.addEventListener('click', () => {
        userDropdown.classList.toggle('show');
    });
    
    // Close user menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!userMenuToggle.contains(e.target) && !userDropdown.contains(e.target)) {
            userDropdown.classList.remove('show');
        }
    });
    
    // Global search
    const globalSearch = document.getElementById('global-search');
    globalSearch.addEventListener('input', debounce(handleGlobalSearch, 300));
    
    // Refresh data button
    document.getElementById('refresh-data').addEventListener('click', refreshAllData);
    
    // Add competitor button
    document.getElementById('add-competitor').addEventListener('click', () => {
        openModal('add-competitor-modal');
    });
    
    // Add product button
    document.getElementById('add-product').addEventListener('click', () => {
        loadCompetitorsForSelect();
        openModal('add-product-modal');
    });
    
    // Form submissions
    document.getElementById('add-competitor-form').addEventListener('submit', handleAddCompetitor);
    document.getElementById('add-product-form').addEventListener('submit', handleAddProduct);
    
    // Filters
    document.getElementById('dashboard-period').addEventListener('change', loadDashboardData);
    document.getElementById('price-trend-category').addEventListener('change', updatePriceTrendsChart);
    document.getElementById('industry-filter').addEventListener('change', filterCompetitors);
    document.getElementById('size-filter').addEventListener('change', filterCompetitors);
    document.getElementById('status-filter').addEventListener('change', filterCompetitors);
    
    // Report templates
    document.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', () => {
            const template = card.dataset.template;
            generateReport(template);
        });
    });
}

// Chart Initialization
function initializeCharts() {
    // Price Trends Chart
    const priceTrendsCtx = document.getElementById('price-trends-chart').getContext('2d');
    charts.priceTrends = new Chart(priceTrendsCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
    
    // Market Share Chart
    const marketShareCtx = document.getElementById('market-share-chart').getContext('2d');
    charts.marketShare = new Chart(marketShareCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#3b82f6',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444',
                    '#8b5cf6',
                    '#06b6d4'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                }
            }
        }
    });
    
    // Trends Chart
    const trendsCtx = document.getElementById('trends-chart').getContext('2d');
    charts.trends = new Chart(trendsCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });
}

// Data Loading Functions
async function loadDashboardData() {
    try {
        const period = document.getElementById('dashboard-period').value;
        
        // Load KPI data
        await loadKPIData();
        
        // Load charts data
        await updatePriceTrendsChart();
        await updateMarketShareChart();
        
        // Load recent activity
        await loadRecentActivity();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('Failed to load dashboard data', 'error');
    }
}

async function loadKPIData() {
    try {
        if (supabaseClient) {
            // Load real data from Supabase
            const [companiesResult, productsResult, trendsResult] = await Promise.all([
                supabaseClient.from('companies').select('*'),
                supabaseClient.from('products').select('*'),
                supabaseClient.from('market_trends').select('*').eq('is_active', true)
            ]);
            
            document.getElementById('total-competitors').textContent = companiesResult.data?.length || 0;
            document.getElementById('total-products').textContent = productsResult.data?.length || 0;
            document.getElementById('market-alerts').textContent = trendsResult.data?.length || 0;
            
            // Calculate price changes
            const priceHistoryResult = await supabaseClient
                .from('price_history')
                .select('*')
                .order('recorded_at', { ascending: false })
                .limit(100);
                
            document.getElementById('price-changes').textContent = priceHistoryResult.data?.length || 0;
        } else {
            // Demo data when Supabase is not configured
            document.getElementById('total-competitors').textContent = '12';
            document.getElementById('total-products').textContent = '48';
            document.getElementById('price-changes').textContent = '23';
            document.getElementById('market-alerts').textContent = '7';
        }
    } catch (error) {
        console.error('Error loading KPI data:', error);
    }
}

async function updatePriceTrendsChart() {
    try {
        const category = document.getElementById('price-trend-category').value;
        
        if (supabaseClient) {
            // Load real price history data
            let query = supabaseClient
                .from('price_history')
                .select(`
                    *,
                    products (name, category)
                `)
                .order('recorded_at', { ascending: true });
                
            if (category !== 'all') {
                query = query.eq('products.category', category);
            }
            
            const { data: priceHistory } = await query;
            
            if (priceHistory && priceHistory.length > 0) {
                updateChartWithRealData(charts.priceTrends, priceHistory);
                return;
            }
        }
        
        // Demo data
        const demoData = generateDemoPriceTrendsData();
        charts.priceTrends.data.labels = demoData.labels;
        charts.priceTrends.data.datasets = demoData.datasets;
        charts.priceTrends.update();
        
    } catch (error) {
        console.error('Error updating price trends chart:', error);
    }
}

async function updateMarketShareChart() {
    try {
        if (supabaseClient) {
            const { data: companies } = await supabaseClient
                .from('companies')
                .select(`
                    name,
                    products (market_share)
                `);
                
            if (companies && companies.length > 0) {
                const marketShareData = calculateMarketShare(companies);
                charts.marketShare.data.labels = marketShareData.labels;
                charts.marketShare.data.datasets[0].data = marketShareData.data;
                charts.marketShare.update();
                return;
            }
        }
        
        // Demo data
        const demoData = {
            labels: ['Company A', 'Company B', 'Company C', 'Company D', 'Others'],
            data: [25, 20, 18, 15, 22]
        };
        
        charts.marketShare.data.labels = demoData.labels;
        charts.marketShare.data.datasets[0].data = demoData.data;
        charts.marketShare.update();
        
    } catch (error) {
        console.error('Error updating market share chart:', error);
    }
}

async function loadRecentActivity() {
    const activityList = document.getElementById('activity-list');
    
    try {
        if (supabaseClient) {
            // Load real activity data from various tables
            const activities = await loadRealActivityData();
            if (activities.length > 0) {
                renderActivityList(activities);
                return;
            }
        }
        
        // Demo activity data
        const demoActivities = [
            {
                icon: 'fas fa-dollar-sign',
                iconClass: 'blue',
                title: 'Price Update Detected',
                description: 'Competitor X reduced pricing by 5% on Product Y',
                time: '2 minutes ago'
            },
            {
                icon: 'fas fa-plus',
                iconClass: 'green',
                title: 'New Competitor Added',
                description: 'TechCorp Inc. has been added to monitoring',
                time: '1 hour ago'
            },
            {
                icon: 'fas fa-trending-up',
                iconClass: 'orange',
                title: 'Market Trend Alert',
                description: 'Software category showing upward pricing trend',
                time: '3 hours ago'
            },
            {
                icon: 'fas fa-exclamation-triangle',
                iconClass: 'red',
                title: 'Competitive Threat',
                description: 'Major competitor launched competing product',
                time: '1 day ago'
            }
        ];
        
        renderActivityList(demoActivities);
        
    } catch (error) {
        console.error('Error loading recent activity:', error);
    }
}

function renderActivityList(activities) {
    const activityList = document.getElementById('activity-list');
    activityList.innerHTML = '';
    
    activities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-icon ${activity.iconClass}">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-description">${activity.description}</div>
            </div>
            <div class="activity-time">${activity.time}</div>
        `;
        activityList.appendChild(activityItem);
    });
}

async function loadSectionData(section) {
    switch (section) {
        case 'competitors':
            await loadCompetitors();
            break;
        case 'pricing':
            await loadPricingData();
            break;
        case 'trends':
            await loadMarketTrends();
            break;
        case 'reports':
            await loadReports();
            break;
    }
}

async function loadCompetitors() {
    const competitorsGrid = document.getElementById('competitors-grid');
    
    try {
        if (supabaseClient) {
            const { data: companies } = await supabaseClient
                .from('companies')
                .select(`
                    *,
                    products (count)
                `);
                
            if (companies && companies.length > 0) {
                renderCompetitors(companies);
                return;
            }
        }
        
        // Demo competitors data
        const demoCompetitors = [
            {
                id: 1,
                name: 'TechCorp Inc.',
                industry: 'Software',
                size: 'Large',
                website: 'https://techcorp.com',
                logo: null,
                is_competitor: true,
                productCount: 12
            },
            {
                id: 2,
                name: 'DataSoft Solutions',
                industry: 'Software',
                size: 'Medium',
                website: 'https://datasoft.com',
                logo: null,
                is_competitor: true,
                productCount: 8
            },
            {
                id: 3,
                name: 'CloudVision Systems',
                industry: 'Services',
                size: 'Enterprise',
                website: 'https://cloudvision.com',
                logo: null,
                is_competitor: true,
                productCount: 15
            }
        ];
        
        renderCompetitors(demoCompetitors);
        
    } catch (error) {
        console.error('Error loading competitors:', error);
        showToast('Failed to load competitors', 'error');
    }
}

function renderCompetitors(competitors) {
    const competitorsGrid = document.getElementById('competitors-grid');
    competitorsGrid.innerHTML = '';
    
    competitors.forEach(competitor => {
        const competitorCard = document.createElement('div');
        competitorCard.className = 'competitor-card';
        competitorCard.innerHTML = `
            <div class="competitor-header">
                <div class="competitor-logo">
                    ${competitor.logo ? 
                        `<img src="${competitor.logo}" alt="${competitor.name}">` :
                        '<i class="fas fa-building"></i>'
                    }
                </div>
                <div class="competitor-info">
                    <h3>${competitor.name}</h3>
                    <p>${competitor.industry} • ${competitor.size}</p>
                </div>
            </div>
            <div class="competitor-stats">
                <div class="stat">
                    <div class="stat-value">${competitor.productCount || 0}</div>
                    <div class="stat-label">Products</div>
                </div>
                <div class="stat">
                    <div class="stat-value">4.2</div>
                    <div class="stat-label">Avg Rating</div>
                </div>
                <div class="stat">
                    <div class="stat-value">$${Math.floor(Math.random() * 1000)}M</div>
                    <div class="stat-label">Revenue</div>
                </div>
            </div>
            <div class="competitor-actions">
                <button class="btn btn-outline btn-sm" onclick="viewCompetitor(${competitor.id})">
                    <i class="fas fa-eye"></i>
                    View
                </button>
                <button class="btn btn-primary btn-sm" onclick="analyzeCompetitor(${competitor.id})">
                    <i class="fas fa-chart-line"></i>
                    Analyze
                </button>
            </div>
        `;
        competitorsGrid.appendChild(competitorCard);
    });
}

async function loadPricingData() {
    const pricingTableBody = document.getElementById('pricing-table-body');
    
    try {
        if (supabaseClient) {
            const { data: products } = await supabaseClient
                .from('products')
                .select(`
                    *,
                    companies (name),
                    price_history (price, recorded_at)
                `)
                .order('last_updated', { ascending: false });
                
            if (products && products.length > 0) {
                renderPricingTable(products);
                return;
            }
        }
        
        // Demo pricing data
        const demoPricing = [
            {
                id: 1,
                name: 'Enterprise CRM Software',
                category: 'Software',
                companies: { name: 'TechCorp Inc.' },
                price: '299.99',
                previous_price: '319.99',
                market_share: '15.5',
                last_updated: new Date().toISOString()
            },
            {
                id: 2,
                name: 'Cloud Analytics Platform',
                category: 'Software',
                companies: { name: 'DataSoft Solutions' },
                price: '199.99',
                previous_price: '199.99',
                market_share: '12.3',
                last_updated: new Date().toISOString()
            }
        ];
        
        renderPricingTable(demoPricing);
        
    } catch (error) {
        console.error('Error loading pricing data:', error);
        showToast('Failed to load pricing data', 'error');
    }
}

function renderPricingTable(products) {
    const pricingTableBody = document.getElementById('pricing-table-body');
    pricingTableBody.innerHTML = '';
    
    products.forEach(product => {
        const currentPrice = parseFloat(product.price);
        const previousPrice = product.previous_price ? parseFloat(product.previous_price) : currentPrice;
        const change = currentPrice - previousPrice;
        const changePercent = previousPrice > 0 ? ((change / previousPrice) * 100).toFixed(1) : 0;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.companies?.name || 'Unknown'}</td>
            <td>${product.category}</td>
            <td>$${currentPrice.toFixed(2)}</td>
            <td>$${previousPrice.toFixed(2)}</td>
            <td>
                <div class="price-change ${change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral'}">
                    <i class="fas fa-arrow-${change > 0 ? 'up' : change < 0 ? 'down' : 'right'}"></i>
                    ${changePercent}%
                </div>
            </td>
            <td>${product.market_share || '0'}%</td>
            <td>${formatDate(product.last_updated)}</td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="editProduct(${product.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-outline btn-sm" onclick="deleteProduct(${product.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        pricingTableBody.appendChild(row);
    });
}

async function loadMarketTrends() {
    const trendsGrid = document.getElementById('trends-grid');
    
    try {
        if (supabaseClient) {
            const { data: trends } = await supabaseClient
                .from('market_trends')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });
                
            if (trends && trends.length > 0) {
                renderTrends(trends);
                return;
            }
        }
        
        // Demo trends data
        const demoTrends = [
            {
                id: 1,
                title: 'Software Pricing Surge',
                description: 'Enterprise software prices have increased by an average of 8% across all major vendors in Q4.',
                category: 'Software',
                trend_type: 'price_increase',
                impact: 'high',
                created_at: new Date().toISOString()
            },
            {
                id: 2,
                title: 'Cloud Services Competition',
                description: 'New entrants in cloud services are driving prices down by 15% on average.',
                category: 'Services',
                trend_type: 'price_decrease',
                impact: 'medium',
                created_at: new Date().toISOString()
            },
            {
                id: 3,
                title: 'AI Integration Trend',
                description: 'Products with AI features command 25% premium pricing in the market.',
                category: 'Software',
                trend_type: 'new_product',
                impact: 'high',
                created_at: new Date().toISOString()
            }
        ];
        
        renderTrends(demoTrends);
        
    } catch (error) {
        console.error('Error loading market trends:', error);
        showToast('Failed to load market trends', 'error');
    }
}

function renderTrends(trends) {
    const trendsGrid = document.getElementById('trends-grid');
    trendsGrid.innerHTML = '';
    
    trends.forEach(trend => {
        const trendCard = document.createElement('div');
        trendCard.className = 'trend-card';
        trendCard.innerHTML = `
            <div class="trend-header">
                <div class="trend-type ${trend.trend_type}">${trend.trend_type.replace('_', ' ')}</div>
                <div class="trend-impact ${trend.impact}">${trend.impact}</div>
            </div>
            <h3 class="trend-title">${trend.title}</h3>
            <p class="trend-description">${trend.description}</p>
            <div class="trend-meta">
                <span>${trend.category}</span>
                <span>${formatDate(trend.created_at)}</span>
            </div>
        `;
        trendsGrid.appendChild(trendCard);
    });
}

async function loadReports() {
    const reportsList = document.getElementById('reports-list');
    
    try {
        if (supabaseClient) {
            const { data: reports } = await supabaseClient
                .from('sales_reports')
                .select('*')
                .order('created_at', { ascending: false });
                
            if (reports && reports.length > 0) {
                renderReports(reports);
                return;
            }
        }
        
        // Demo reports data
        const demoReports = [
            {
                id: 1,
                title: 'Q4 Competitor Analysis',
                type: 'competitor_analysis',
                generated_by: 'Sales Manager',
                created_at: new Date().toISOString()
            },
            {
                id: 2,
                title: 'Software Pricing Comparison',
                type: 'price_comparison',
                generated_by: 'Product Manager',
                created_at: new Date(Date.now() - 86400000).toISOString()
            }
        ];
        
        renderReports(demoReports);
        
    } catch (error) {
        console.error('Error loading reports:', error);
        showToast('Failed to load reports', 'error');
    }
}

function renderReports(reports) {
    const reportsList = document.getElementById('reports-list');
    reportsList.innerHTML = '';
    
    reports.forEach(report => {
        const reportItem = document.createElement('div');
        reportItem.className = 'report-item';
        reportItem.innerHTML = `
            <div class="report-info">
                <h4>${report.title}</h4>
                <p>Generated by ${report.generated_by} • ${formatDate(report.created_at)}</p>
            </div>
            <div class="report-actions">
                <button class="btn btn-outline btn-sm" onclick="viewReport(${report.id})">
                    <i class="fas fa-eye"></i>
                    View
                </button>
                <button class="btn btn-outline btn-sm" onclick="downloadReport(${report.id})">
                    <i class="fas fa-download"></i>
                    Download
                </button>
            </div>
        `;
        reportsList.appendChild(reportItem);
    });
}

// Form Handlers
async function handleAddCompetitor(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('company-name').value,
        website: document.getElementById('company-website').value,
        industry: document.getElementById('company-industry').value,
        size: document.getElementById('company-size').value,
        logo: document.getElementById('company-logo').value,
        is_competitor: true
    };
    
    try {
        if (supabaseClient) {
            const { data, error } = await supabaseClient
                .from('companies')
                .insert([formData]);
                
            if (error) throw error;
            
            showToast('Competitor added successfully', 'success');
            closeModal('add-competitor-modal');
            document.getElementById('add-competitor-form').reset();
            loadCompetitors();
        } else {
            // Demo mode
            showToast('Demo: Competitor would be added to database', 'info');
            closeModal('add-competitor-modal');
            document.getElementById('add-competitor-form').reset();
        }
    } catch (error) {
        console.error('Error adding competitor:', error);
        showToast('Failed to add competitor', 'error');
    }
}

async function handleAddProduct(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        category: document.getElementById('product-category').value,
        company_id: parseInt(document.getElementById('product-company').value),
        price: document.getElementById('product-price').value,
        currency: document.getElementById('product-currency').value,
        market_share: document.getElementById('product-market-share').value
    };
    
    try {
        if (supabaseClient) {
            const { data, error } = await supabaseClient
                .from('products')
                .insert([formData]);
                
            if (error) throw error;
            
            showToast('Product added successfully', 'success');
            closeModal('add-product-modal');
            document.getElementById('add-product-form').reset();
            loadPricingData();
        } else {
            // Demo mode
            showToast('Demo: Product would be added to database', 'info');
            closeModal('add-product-modal');
            document.getElementById('add-product-form').reset();
        }
    } catch (error) {
        console.error('Error adding product:', error);
        showToast('Failed to add product', 'error');
    }
}

// Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Toast Notifications
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastIcon = toast.querySelector('.toast-icon');
    const toastMessage = toast.querySelector('.toast-message');
    
    // Set content
    toastMessage.textContent = message;
    
    // Set icon based on type
    const icons = {
        success: 'fas fa-check',
        error: 'fas fa-times',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info'
    };
    
    toastIcon.className = `toast-icon ${icons[type] || icons.info}`;
    toast.className = `toast ${type}`;
    
    // Show toast
    toast.classList.add('show');
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// Demo Data Generators
function generateDemoPriceTrendsData() {
    const labels = [];
    const datasets = [
        {
            label: 'Software Category',
            data: [],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4
        },
        {
            label: 'Hardware Category',
            data: [],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4
        }
    ];
    
    // Generate 30 days of data
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString());
        
        // Generate realistic price trends
        datasets[0].data.push(250 + Math.random() * 50 + Math.sin(i * 0.1) * 20);
        datasets[1].data.push(180 + Math.random() * 30 + Math.cos(i * 0.1) * 15);
    }
    
    return { labels, datasets };
}

// Search and Filter Functions
function handleGlobalSearch(e) {
    const query = e.target.value.toLowerCase();
    
    // Implement search logic based on current section
    const activeSection = document.querySelector('.content-section.active').id;
    
    switch (activeSection) {
        case 'competitors-section':
            filterCompetitorsBySearch(query);
            break;
        case 'pricing-section':
            filterPricingBySearch(query);
            break;
        case 'trends-section':
            filterTrendsBySearch(query);
            break;
    }
}

function filterCompetitors() {
    const industry = document.getElementById('industry-filter').value;
    const size = document.getElementById('size-filter').value;
    const status = document.getElementById('status-filter').value;
    
    // Apply filters to competitor cards
    const competitorCards = document.querySelectorAll('.competitor-card');
    
    competitorCards.forEach(card => {
        const cardIndustry = card.querySelector('.competitor-info p').textContent.split(' • ')[0];
        const cardSize = card.querySelector('.competitor-info p').textContent.split(' • ')[1];
        
        let show = true;
        
        if (industry && cardIndustry !== industry) show = false;
        if (size && cardSize !== size) show = false;
        
        card.style.display = show ? 'block' : 'none';
    });
}

// Real-time Data Functions
function setupRealTimeSubscriptions() {
    if (!supabaseClient) return;
    
    try {
        // Subscribe to companies changes
        const companiesSubscription = supabaseClient
            .channel('companies_changes')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'companies' },
                handleCompaniesChange
            )
            .subscribe();
            
        // Subscribe to products changes
        const productsSubscription = supabaseClient
            .channel('products_changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'products' },
                handleProductsChange
            )
            .subscribe();
            
        // Subscribe to price history changes
        const priceHistorySubscription = supabaseClient
            .channel('price_history_changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'price_history' },
                handlePriceHistoryChange
            )
            .subscribe();
            
        realTimeSubscriptions.push(companiesSubscription, productsSubscription, priceHistorySubscription);
        
    } catch (error) {
        console.error('Error setting up real-time subscriptions:', error);
    }
}

function handleCompaniesChange(payload) {
    console.log('Companies change detected:', payload);
    loadKPIData();
    loadCompetitors();
}

function handleProductsChange(payload) {
    console.log('Products change detected:', payload);
    loadKPIData();
    loadPricingData();
    updatePriceTrendsChart();
}

function handlePriceHistoryChange(payload) {
    console.log('Price history change detected:', payload);
    updatePriceTrendsChart();
    loadRecentActivity();
}

// Action Functions
function viewCompetitor(id) {
    showToast(`Viewing competitor details for ID: ${id}`, 'info');
}

function analyzeCompetitor(id) {
    showToast(`Analyzing competitor data for ID: ${id}`, 'info');
}

function editProduct(id) {
    showToast(`Edit product functionality for ID: ${id}`, 'info');
}

function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        showToast(`Product ${id} would be deleted`, 'warning');
    }
}

function viewReport(id) {
    showToast(`Viewing report ID: ${id}`, 'info');
}

function downloadReport(id) {
    showToast(`Downloading report ID: ${id}`, 'info');
}

function generateReport(template) {
    showToast(`Generating ${template} report...`, 'info');
}

function refreshAllData() {
    showToast('Refreshing all data...', 'info');
    loadDashboardData();
    
    const activeSection = document.querySelector('.nav-item.active').dataset.section;
    loadSectionData(activeSection);
}

async function loadCompetitorsForSelect() {
    const select = document.getElementById('product-company');
    select.innerHTML = '<option value="">Select Competitor</option>';
    
    try {
        if (supabaseClient) {
            const { data: companies } = await supabaseClient
                .from('companies')
                .select('id, name')
                .eq('is_competitor', true);
                
            if (companies) {
                companies.forEach(company => {
                    const option = document.createElement('option');
                    option.value = company.id;
                    option.textContent = company.name;
                    select.appendChild(option);
                });
            }
        } else {
            // Demo options
            const demoCompanies = [
                { id: 1, name: 'TechCorp Inc.' },
                { id: 2, name: 'DataSoft Solutions' },
                { id: 3, name: 'CloudVision Systems' }
            ];
            
            demoCompanies.forEach(company => {
                const option = document.createElement('option');
                option.value = company.id;
                option.textContent = company.name;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading competitors for select:', error);
    }
}

// Cleanup function
window.addEventListener('beforeunload', () => {
    realTimeSubscriptions.forEach(subscription => {
        supabaseClient?.removeChannel(subscription);
    });
});
