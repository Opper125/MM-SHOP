# SalesVision Pro - Sales Analytics & Competitor Intelligence Platform

A comprehensive business intelligence platform designed for sales teams to analyze competitor pricing, track market trends, and generate detailed analytics reports with real-time data synchronization.

## 🚀 Features

### Core Analytics
- **Competitor Tracking**: Monitor competitors, their products, and pricing strategies
- **Price History & Trends**: Track price changes over time with visual analytics
- **Market Intelligence**: Identify market trends and opportunities
- **Custom Reporting**: Generate detailed reports with customizable dashboards
- **Real-time Updates**: Live data synchronization with Supabase

### Dashboard Capabilities
- Interactive charts and visualizations (Chart.js)
- KPI monitoring and alerts
- Filtering and search functionality
- Export capabilities for reports and data
- Mobile-responsive design

### Admin Panel
- User management and role-based access
- Database monitoring and optimization
- System health metrics
- Backup and restore functionality
- Configuration management

## 📁 Project Structure

```
SalesVision-Pro/
├── index.html              # Main application interface
├── server.html             # Admin dashboard
├── styles.css              # Comprehensive styling
├── script.js               # Frontend application logic
├── supabase_schema.sql     # Database schema and sample data
├── shared/schema.ts        # TypeScript schema definitions
├── server/                 # Backend API (existing structure)
├── client/                 # React frontend (existing structure)
└── README.md              # Documentation
```

## 🛠️ Setup Instructions

### 1. Supabase Database Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Execute Database Schema**
   - Open your Supabase project dashboard
   - Go to SQL Editor
   - Copy and paste the entire contents of `supabase_schema.sql`
   - Execute the script to create all tables, sample data, and configurations

3. **Enable Real-time Features**
   - In Supabase dashboard, go to Database → Replication
   - Enable real-time for these tables:
     - `companies`
     - `products`
     - `price_history`
     - `market_trends`
     - `sales_reports`
     - `users`

### 2. Application Configuration

1. **Update Configuration**
   - Open `script.js` (line 8-11)
   - Replace the Supabase configuration:
   ```javascript
   const SUPABASE_CONFIG = {
       url: 'YOUR_SUPABASE_PROJECT_URL',
       anonKey: 'YOUR_SUPABASE_ANON_KEY'
   };
   ```

2. **Update Admin Dashboard**
   - Open `server.html` and update the same configuration section

### 3. Deployment Options

#### Option A: Simple Static Hosting
1. Upload all files to any web server
2. Ensure `index.html` is the default page
3. Access the application via your domain

#### Option B: Replit Deployment
1. The application is already configured for Replit
2. Simply deploy using Replit's deployment feature
3. Environment variables will be handled automatically

#### Option C: Custom Server
1. Use the existing Node.js backend in the `server/` directory
2. The static files can be served alongside the API

## 📊 Database Schema Overview

### Core Tables

1. **companies** - Competitor information
   - Company details, industry, size
   - Competitor status and metadata

2. **products** - Product catalog with pricing
   - Product information, pricing, market share
   - Links to companies, features array

3. **price_history** - Historical pricing data
   - Price tracking over time
   - Source tracking (API, manual, scraping)

4. **market_trends** - Market intelligence
   - Trend analysis and insights
   - Impact assessment and categorization

5. **users** - User management
   - Role-based access control
   - Department and activity tracking

6. **sales_reports** - Generated reports
   - Custom analytics reports
   - Scheduled reporting capabilities

7. **dashboards** - User dashboard configs
   - Personalized dashboard layouts
   - Widget configurations

### Key Features

- **Row Level Security (RLS)** enabled for data protection
- **Real-time subscriptions** for live updates
- **Analytics views** for complex queries
- **Custom functions** for business logic
- **Comprehensive indexing** for performance

## 🎯 Usage Guide

### Main Application (index.html)

1. **Dashboard**: Overview of key metrics and trends
2. **Competitors**: Manage and analyze competitor data
3. **Pricing**: Track and compare product pricing
4. **Market Trends**: Monitor market intelligence
5. **Reports**: Generate and export analytics reports

### Admin Panel (server.html)

1. **Overview**: System health and admin metrics
2. **Users**: User management and permissions
3. **Database**: Database monitoring and maintenance
4. **System**: Server monitoring and services
5. **Settings**: Configuration and Supabase setup
6. **Logs**: System logs and troubleshooting

### Navigation

- **Search**: Global search across products and competitors
- **Filters**: Category, price range, and date filtering
- **Real-time Updates**: Automatic data refresh
- **Export**: Download reports and data
- **Responsive**: Works on desktop, tablet, and mobile

## 🔧 Configuration Options

### Application Settings (Admin Panel)

- **Supabase Connection**: URL and API key configuration
- **Refresh Intervals**: Data update frequency
- **User Limits**: Maximum competitors and products
- **Notifications**: Real-time alert settings
- **Security**: Session timeout and password policies

### Customization

- **Branding**: Update logo and colors in CSS
- **Features**: Enable/disable specific functionality
- **Dashboards**: Create custom dashboard layouts
- **Reports**: Configure automated report generation

## 🔐 Security Features

- **Row Level Security**: Database-level access control
- **Role-based Access**: Admin, Manager, User roles
- **Session Management**: Configurable timeouts
- **Audit Logging**: Track user activities
- **Data Encryption**: Secure data transmission

## 📈 Analytics Features

### Charts and Visualizations
- Price trend analysis
- Market share distribution
- Competitor comparison
- Performance metrics

### Reporting
- Competitor analysis reports
- Price comparison studies
- Market overview summaries
- Custom analytics reports

### Real-time Features
- Live price monitoring
- Market alert notifications
- Activity tracking
- Data synchronization

## 🛡️ Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify Supabase URL and API key
   - Check network connectivity
   - Ensure RLS policies are configured

2. **Real-time Updates Not Working**
   - Enable real-time on required tables
   - Check browser console for errors
   - Verify Supabase subscription limits

3. **Charts Not Loading**
   - Ensure Chart.js is loaded
   - Check browser compatibility
   - Verify data format and structure

### Debug Mode

1. Open browser developer tools
2. Check console for error messages
3. Monitor network requests
4. Use Supabase dashboard for database queries

## 🎨 Customization

### Styling
- Modify CSS variables in `styles.css`
- Update color scheme and branding
- Responsive design breakpoints

### Functionality
- Add new chart types in `script.js`
- Create custom dashboard widgets
- Implement additional filters

### Database
- Extend schema with new tables
- Add custom functions and views
- Implement additional RLS policies

## 📱 Browser Compatibility

- **Modern Browsers**: Chrome 70+, Firefox 65+, Safari 12+, Edge 79+
- **Mobile**: iOS Safari 12+, Chrome Mobile 70+
- **Features**: ES6+, Fetch API, CSS Grid, Flexbox

## 🤝 Support

### Documentation
- Supabase documentation: [docs.supabase.com](https://docs.supabase.com)
- Chart.js documentation: [chartjs.org](https://www.chartjs.org)

### Sample Data
The database schema includes comprehensive sample data:
- 10 competitor companies
- 20 products with pricing
- Historical price data
- Market trends and insights
- User accounts and reports

## 🔄 Updates and Maintenance

### Regular Tasks
- Monitor database performance
- Update competitor information
- Review market trends
- Generate periodic reports
- Backup database regularly

### Scaling Considerations
- Supabase plan limits
- Real-time subscription quotas
- Database storage optimization
- Performance monitoring

## 📊 Sample Credentials

For testing purposes, the following users are pre-configured:

- **Admin**: admin@salesvision.com / admin123
- **Manager**: manager@salesvision.com / manager123
- **Analyst**: analyst@salesvision.com / analyst123

*Note: Change these credentials in production*

## 🚀 Getting Started Checklist

- [ ] Create Supabase project
- [ ] Execute `supabase_schema.sql`
- [ ] Update configuration in both HTML files
- [ ] Enable real-time on required tables
- [ ] Test database connection
- [ ] Deploy application
- [ ] Configure user accounts
- [ ] Customize branding and settings

Your comprehensive sales analytics platform is now ready for deployment and use!
