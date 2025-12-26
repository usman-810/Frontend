import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerAPI } from '../../api/customers';
import { cardAPI } from '../../api/cards';
import { transactionAPI } from '../../api/transactions';
import {
  Container, Box, Paper, Typography, Button, Grid, Card, CardContent,
  CircularProgress, Alert, TextField, MenuItem, Divider, Avatar
} from '@mui/material';
import {
  ArrowBack, Assessment, PictureAsPdf, TableChart, TrendingUp, TrendingDown,
  People, CreditCard, Receipt, AccountBalance, AttachMoney, ShoppingCart, Payment
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Reports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportType, setReportType] = useState('overview');
  const [dateRange, setDateRange] = useState('this_month');

  const [reportData, setReportData] = useState({
    customers: {
      total: 0,
      active: 0,
      inactive: 0,
      blocked: 0
    },
    cards: {
      total: 0,
      active: 0,
      inactive: 0,
      blocked: 0,
      byType: {
        SILVER: 0,
        GOLD: 0,
        PLATINUM: 0
      }
    },
    transactions: {
      total: 0,
      approved: 0,
      pending: 0,
      declined: 0,
      totalAmount: 0,
      byType: {
        PURCHASE: 0,
        PAYMENT: 0,
        REFUND: 0
      }
    },
    revenue: {
      totalRevenue: 0,
      thisMonth: 0,
      lastMonth: 0,
      growth: 0
    }
  });

  const [rawData, setRawData] = useState({
    customers: [],
    cards: [],
    transactions: []
  });

  useEffect(() => {
    loadReportData();
  }, [reportType, dateRange]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      setError('');

      const [customersRes, cardsRes, transactionsRes] = await Promise.all([
        customerAPI.getAll(0, 10000),
        cardAPI.getAll(0, 10000),
        transactionAPI.getAll(0, 10000)
      ]);

      const customers = customersRes?.data?.data?.content || customersRes?.data?.content || customersRes?.data?.data || [];
      const cards = cardsRes?.data?.data?.content || cardsRes?.data?.content || cardsRes?.data?.data || [];
      const transactions = transactionsRes?.data?.data?.content || transactionsRes?.data?.content || transactionsRes?.data?.data || [];

      setRawData({
        customers: Array.isArray(customers) ? customers : [],
        cards: Array.isArray(cards) ? cards : [],
        transactions: Array.isArray(transactions) ? transactions : []
      });

      const customerStats = {
        total: customers.length,
        active: customers.filter(c => c.status === 'ACTIVE').length,
        inactive: customers.filter(c => c.status === 'INACTIVE').length,
        blocked: customers.filter(c => c.status === 'BLOCKED').length
      };

      const cardStats = {
        total: cards.length,
        active: cards.filter(c => c.status === 'ACTIVE').length,
        inactive: cards.filter(c => c.status === 'INACTIVE').length,
        blocked: cards.filter(c => c.status === 'BLOCKED').length,
        byType: {
          SILVER: cards.filter(c => c.cardType === 'SILVER').length,
          GOLD: cards.filter(c => c.cardType === 'GOLD').length,
          PLATINUM: cards.filter(c => c.cardType === 'PLATINUM').length
        }
      };

      const getType = (txn) => txn.type || txn.transactionType;
      const isSuccess = (txn) => txn.status === 'SUCCESS' || txn.status === 'APPROVED';

      const approvedTxns = transactions.filter(t => t.status === 'APPROVED' || t.status === 'SUCCESS');
      const txnStats = {
        total: transactions.length,
        approved: approvedTxns.length,
        pending: transactions.filter(t => t.status === 'PENDING').length,
        declined: transactions.filter(t => t.status === 'DECLINED' || t.status === 'FAILED').length,
        totalAmount: approvedTxns
          .filter(t => getType(t) === 'PURCHASE')
          .reduce((sum, t) => sum + (t.amount || 0), 0),
        byType: {
          PURCHASE: transactions.filter(t => getType(t) === 'PURCHASE').length,
          PAYMENT: transactions.filter(t => getType(t) === 'PAYMENT').length,
          REFUND: transactions.filter(t => getType(t) === 'REFUND').length
        }
      };

      const purchases = transactions.filter(t => getType(t) === 'PURCHASE' && isSuccess(t));
      const totalRevenue = purchases.reduce((sum, t) => sum + (t.amount || 0), 0);

      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

      const thisMonthRevenue = purchases
        .filter(t => new Date(t.transactionDate) >= thisMonthStart)
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const lastMonthRevenue = purchases
        .filter(t => {
          const txnDate = new Date(t.transactionDate);
          return txnDate >= lastMonthStart && txnDate <= lastMonthEnd;
        })
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const growth = lastMonthRevenue > 0 
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100)
        : thisMonthRevenue > 0 ? 100 : 0;

      setReportData({
        customers: customerStats,
        cards: cardStats,
        transactions: txnStats,
        revenue: {
          totalRevenue,
          thisMonth: thisMonthRevenue,
          lastMonth: lastMonthRevenue,
          growth: growth
        }
      });

      console.log('📊 Report data loaded successfully');
      toast.success('Report data loaded successfully');

    } catch (err) {
      console.error('Error loading report data:', err);
      setError('Failed to load report data');
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFillColor(102, 126, 234);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.text('CardHub Financial Report', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 30, { align: 'center' });

      let yPos = 50;

      // Revenue Summary
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('Revenue Summary', 14, yPos);

      const revenueData = [
        ['Metric', 'Amount', 'Details'],
        ['Total Revenue', `$${reportData.revenue.totalRevenue.toFixed(2)}`, 'All time earnings'],
        ['This Month', `$${reportData.revenue.thisMonth.toFixed(2)}`, 'Current month'],
        ['Last Month', `$${reportData.revenue.lastMonth.toFixed(2)}`, 'Previous month'],
        ['Growth', `${reportData.revenue.growth >= 0 ? '+' : ''}${reportData.revenue.growth.toFixed(2)}%`, 'Month over month']
      ];

      autoTable(doc, {
        startY: yPos + 5,
        head: [revenueData[0]],
        body: revenueData.slice(1),
        theme: 'grid',
        headStyles: { 
          fillColor: [102, 126, 234], 
          fontSize: 11, 
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: { fontSize: 10 },
        margin: { left: 14, right: 14 }
      });

      // Transaction Summary
      yPos = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('Transaction Summary', 14, yPos);

      const transactionData = [
        ['Metric', 'Count', 'Amount'],
        ['Total Transactions', reportData.transactions.total.toString(), `$${reportData.transactions.totalAmount.toFixed(2)}`],
        ['Approved', reportData.transactions.approved.toString(), '-'],
        ['Pending', reportData.transactions.pending.toString(), '-'],
        ['Declined', reportData.transactions.declined.toString(), '-'],
        ['Purchases', reportData.transactions.byType.PURCHASE.toString(), '-'],
        ['Payments', reportData.transactions.byType.PAYMENT.toString(), '-'],
        ['Refunds', reportData.transactions.byType.REFUND.toString(), '-']
      ];

      autoTable(doc, {
        startY: yPos + 5,
        head: [transactionData[0]],
        body: transactionData.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [67, 233, 123], fontSize: 11, fontStyle: 'bold' },
        bodyStyles: { fontSize: 10 },
        margin: { left: 14, right: 14 }
      });

      // Customer & Card Summary
      yPos = doc.lastAutoTable.finalY + 15;
      
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('Customer & Card Summary', 14, yPos);

      const customerCardData = [
        ['Category', 'Metric', 'Count'],
        ['Customers', 'Total', reportData.customers.total.toString()],
        ['Customers', 'Active', reportData.customers.active.toString()],
        ['Customers', 'Inactive', reportData.customers.inactive.toString()],
        ['Customers', 'Blocked', reportData.customers.blocked.toString()],
        ['Cards', 'Total', reportData.cards.total.toString()],
        ['Cards', 'Active', reportData.cards.active.toString()],
        ['Cards', 'Inactive', reportData.cards.inactive.toString()],
        ['Cards', 'Blocked', reportData.cards.blocked.toString()],
        ['Card Types', 'Silver', reportData.cards.byType.SILVER.toString()],
        ['Card Types', 'Gold', reportData.cards.byType.GOLD.toString()],
        ['Card Types', 'Platinum', reportData.cards.byType.PLATINUM.toString()]
      ];

      autoTable(doc, {
        startY: yPos + 5,
        head: [customerCardData[0]],
        body: customerCardData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [74, 172, 254], fontSize: 11, fontStyle: 'bold' },
        bodyStyles: { fontSize: 10 },
        margin: { left: 14, right: 14 }
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `CardHub Report - Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      const fileName = `CardHub_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      toast.success('PDF exported successfully! 📄');
    } catch (err) {
      console.error('PDF export error:', err);
      toast.error('Failed to export PDF: ' + err.message);
    }
  };

  const handleExportExcel = () => {
    try {
      const summarySheet = XLSX.utils.aoa_to_sheet([
        ['CardHub Financial Report'],
        [`Generated: ${new Date().toLocaleString()}`],
        [],
        ['REVENUE SUMMARY'],
        ['Metric', 'Amount', 'Details'],
        ['Total Revenue', `$${reportData.revenue.totalRevenue.toFixed(2)}`, 'All time earnings'],
        ['This Month Revenue', `$${reportData.revenue.thisMonth.toFixed(2)}`, 'Current month'],
        ['Last Month Revenue', `$${reportData.revenue.lastMonth.toFixed(2)}`, 'Previous month'],
        ['Growth Rate', `${reportData.revenue.growth >= 0 ? '+' : ''}${reportData.revenue.growth.toFixed(2)}%`, 'Month over month'],
        [],
        ['TRANSACTION SUMMARY'],
        ['Metric', 'Count', 'Amount'],
        ['Total Transactions', reportData.transactions.total, `$${reportData.transactions.totalAmount.toFixed(2)}`],
        ['Approved', reportData.transactions.approved, '-'],
        ['Pending', reportData.transactions.pending, '-'],
        ['Declined', reportData.transactions.declined, '-'],
        ['Purchases', reportData.transactions.byType.PURCHASE, '-'],
        ['Payments', reportData.transactions.byType.PAYMENT, '-'],
        ['Refunds', reportData.transactions.byType.REFUND, '-'],
        [],
        ['CUSTOMER SUMMARY'],
        ['Status', 'Count'],
        ['Total Customers', reportData.customers.total],
        ['Active', reportData.customers.active],
        ['Inactive', reportData.customers.inactive],
        ['Blocked', reportData.customers.blocked],
        [],
        ['CARD SUMMARY'],
        ['Status/Type', 'Count'],
        ['Total Cards', reportData.cards.total],
        ['Active', reportData.cards.active],
        ['Inactive', reportData.cards.inactive],
        ['Blocked', reportData.cards.blocked],
        ['Silver Cards', reportData.cards.byType.SILVER],
        ['Gold Cards', reportData.cards.byType.GOLD],
        ['Platinum Cards', reportData.cards.byType.PLATINUM]
      ]);

      const transactionsData = rawData.transactions.map(txn => ({
        'Transaction ID': txn.id,
        'Date': new Date(txn.transactionDate).toLocaleString(),
        'Reference': txn.transactionReference || '-',
        'Type': txn.type || txn.transactionType,
        'Amount': `$${(txn.amount || 0).toFixed(2)}`,
        'Status': txn.status,
        'Customer ID': txn.customerId || '-',
        'Card ID': txn.cardId || '-',
        'Description': txn.description || '-',
        'Merchant': txn.merchantName || '-'
      }));
      const transactionsSheet = XLSX.utils.json_to_sheet(transactionsData);

      const customersData = rawData.customers.map(cust => ({
        'Customer ID': cust.id,
        'First Name': cust.firstName,
        'Last Name': cust.lastName,
        'Email': cust.email,
        'Phone': cust.phone || '-',
        'Status': cust.status || 'ACTIVE',
        'Address': cust.address || '-',
        'City': cust.city || '-',
        'State': cust.state || '-',
        'Zip Code': cust.zipCode || '-',
        'Date of Birth': cust.dateOfBirth || '-',
        'Created At': new Date(cust.createdAt || Date.now()).toLocaleDateString()
      }));
      const customersSheet = XLSX.utils.json_to_sheet(customersData);

      const cardsData = rawData.cards.map(card => ({
        'Card ID': card.id,
        'Card Type': card.cardType,
        'Card Number': `****${card.cardNumber?.slice(-4) || '****'}`,
        'Status': card.status,
        'Credit Limit': `$${(card.creditLimit || 0).toFixed(2)}`,
        'Available Credit': `$${(card.availableCredit || 0).toFixed(2)}`,
        'Customer ID': card.customerId,
        'Expiry Date': card.expiryDate || '-',
        'Issue Date': card.issueDate || '-'
      }));
      const cardsSheet = XLSX.utils.json_to_sheet(cardsData);

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary Report');
      XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'Transactions');
      XLSX.utils.book_append_sheet(workbook, customersSheet, 'Customers');
      XLSX.utils.book_append_sheet(workbook, cardsSheet, 'Cards');

      const fileName = `CardHub_Detailed_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      toast.success('Excel exported successfully! 📊');
    } catch (err) {
      console.error('Excel export error:', err);
      toast.error('Failed to export Excel: ' + err.message);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2, color: 'primary.main' }}>
          Loading report data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 4 }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/admin/dashboard')}
            variant="outlined"
          >
            Back to Dashboard
          </Button>
        </Box>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper elevation={3} sx={{ p: 4, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 70, height: 70, bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <Assessment sx={{ fontSize: 40 }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    Reports & Analytics
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Generate and download comprehensive reports
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<PictureAsPdf />}
                  onClick={handleExportPDF}
                  sx={{ bgcolor: '#f44336', '&:hover': { bgcolor: '#d32f2f' } }}
                >
                  Export PDF
                </Button>
                <Button
                  variant="contained"
                  startIcon={<TableChart />}
                  onClick={handleExportExcel}
                  sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}
                >
                  Export Excel
                </Button>
              </Box>
            </Box>
          </Paper>
        </motion.div>

        {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Report Type"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <MenuItem value="overview">Overview Report</MenuItem>
                <MenuItem value="customers">Customer Report</MenuItem>
                <MenuItem value="cards">Card Report</MenuItem>
                <MenuItem value="transactions">Transaction Report</MenuItem>
                <MenuItem value="revenue">Revenue Report</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Date Range"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="this_week">This Week</MenuItem>
                <MenuItem value="this_month">This Month</MenuItem>
                <MenuItem value="last_month">Last Month</MenuItem>
                <MenuItem value="this_year">This Year</MenuItem>
                <MenuItem value="all_time">All Time</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Paper>

        {reportType === 'overview' && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  💰 Revenue Summary
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Card sx={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      height: '100%'
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                              Total Revenue
                            </Typography>
                            <Typography variant="h4" fontWeight="bold">
                              ${reportData.revenue.totalRevenue.toFixed(2)}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                              All time earnings
                            </Typography>
                          </Box>
                          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                            <AttachMoney sx={{ fontSize: 30 }} />
                          </Avatar>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card sx={{ 
                      background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                      color: 'white',
                      height: '100%'
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                              This Month
                            </Typography>
                            <Typography variant="h4" fontWeight="bold">
                              ${reportData.revenue.thisMonth.toFixed(2)}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                              Current month
                            </Typography>
                          </Box>
                          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                            <TrendingUp sx={{ fontSize: 30 }} />
                          </Avatar>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card sx={{ 
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      color: 'white',
                      height: '100%'
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                              Last Month
                            </Typography>
                            <Typography variant="h4" fontWeight="bold">
                              ${reportData.revenue.lastMonth.toFixed(2)}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                              Previous month
                            </Typography>
                          </Box>
                          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                            <TrendingDown sx={{ fontSize: 30 }} />
                          </Avatar>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card sx={{ 
                      background: reportData.revenue.growth >= 0
                        ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                        : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                      color: 'white',
                      height: '100%'
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                              Growth
                            </Typography>
                            <Typography variant="h4" fontWeight="bold">
                              {reportData.revenue.growth >= 0 ? '+' : ''}{reportData.revenue.growth.toFixed(2)}%
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                              {reportData.revenue.growth >= 0 ? 'Increasing ↗' : 'Decreasing ↘'}
                            </Typography>
                          </Box>
                          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                            {reportData.revenue.growth >= 0 ? 
                              <TrendingUp sx={{ fontSize: 30 }} /> : 
                              <TrendingDown sx={{ fontSize: 30 }} />
                            }
                          </Avatar>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Paper>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <People sx={{ fontSize: 30, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight="bold">
                    Customer Statistics
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                      <Typography variant="h3" fontWeight="bold" color="primary">
                        {reportData.customers.total}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">Total Customers</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                      <Typography variant="h3" fontWeight="bold" color="success.dark">
                        {reportData.customers.active}
                      </Typography>
                      <Typography variant="body2" color="success.dark">Active</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
                      <Typography variant="h3" fontWeight="bold" color="warning.dark">
                        {reportData.customers.inactive}
                      </Typography>
                      <Typography variant="body2" color="warning.dark">Inactive</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'error.light', borderRadius: 2 }}>
                      <Typography variant="h3" fontWeight="bold" color="error.dark">
                        {reportData.customers.blocked}
                      </Typography>
                      <Typography variant="body2" color="error.dark">Blocked</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <CreditCard sx={{ fontSize: 30, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight="bold">
                    Card Statistics
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight="bold">
                      By Status
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 2, textAlign: 'center' }}>
                          <Typography variant="h4" fontWeight="bold">{reportData.cards.total}</Typography>
                          <Typography variant="body2">Total Cards</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 2, textAlign: 'center' }}>
                          <Typography variant="h4" fontWeight="bold" color="success.dark">
                            {reportData.cards.active}
                          </Typography>
                          <Typography variant="body2" color="success.dark">Active</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 2, textAlign: 'center' }}>
                          <Typography variant="h4" fontWeight="bold" color="warning.dark">
                            {reportData.cards.inactive}
                          </Typography>
                          <Typography variant="body2" color="warning.dark">Inactive</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ p: 2, bgcolor: 'error.light', borderRadius: 2, textAlign: 'center' }}>
                          <Typography variant="h4" fontWeight="bold" color="error.dark">
                            {reportData.cards.blocked}
                          </Typography>
                          <Typography variant="body2" color="error.dark">Blocked</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight="bold">
                      By Type
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Box sx={{ p: 2, bgcolor: '#C0C0C0', borderRadius: 2, textAlign: 'center' }}>
                          <Typography variant="h4" fontWeight="bold">
                            {reportData.cards.byType.SILVER}
                          </Typography>
                          <Typography variant="body2">Silver</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ p: 2, bgcolor: '#FFD700', borderRadius: 2, textAlign: 'center' }}>
                          <Typography variant="h4" fontWeight="bold">
                            {reportData.cards.byType.GOLD}
                          </Typography>
                          <Typography variant="body2">Gold</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ p: 2, bgcolor: '#E5E4E2', borderRadius: 2, textAlign: 'center' }}>
                          <Typography variant="h4" fontWeight="bold">
                            {reportData.cards.byType.PLATINUM}
                          </Typography>
                          <Typography variant="body2">Platinum</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Paper>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Paper elevation={3} sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Receipt sx={{ fontSize: 30, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight="bold">
                    Transaction Statistics
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight="bold">
                      By Status
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 2, textAlign: 'center' }}>
                          <Typography variant="h4" fontWeight="bold">
                            {reportData.transactions.total}
                          </Typography>
                          <Typography variant="body2">Total</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 2, textAlign: 'center' }}>
                          <Typography variant="h4" fontWeight="bold" color="success.dark">
                            {reportData.transactions.approved}
                          </Typography>
                          <Typography variant="body2" color="success.dark">Approved</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 2, textAlign: 'center' }}>
                          <Typography variant="h4" fontWeight="bold" color="warning.dark">
                            {reportData.transactions.pending}
                          </Typography>
                          <Typography variant="body2" color="warning.dark">Pending</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ p: 2, bgcolor: 'error.light', borderRadius: 2, textAlign: 'center' }}>
                          <Typography variant="h4" fontWeight="bold" color="error.dark">
                            {reportData.transactions.declined}
                          </Typography>
                          <Typography variant="body2" color="error.dark">Declined</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight="bold">
                      By Type
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Box sx={{ p: 2, bgcolor: 'error.light', borderRadius: 2, textAlign: 'center' }}>
                          <ShoppingCart sx={{ fontSize: 30, color: 'error.dark', mb: 1 }} />
                          <Typography variant="h4" fontWeight="bold" color="error.dark">
                            {reportData.transactions.byType.PURCHASE}
                          </Typography>
                          <Typography variant="body2" color="error.dark">Purchase</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 2, textAlign: 'center' }}>
                          <Payment sx={{ fontSize: 30, color: 'success.dark', mb: 1 }} />
                          <Typography variant="h4" fontWeight="bold" color="success.dark">
                            {reportData.transactions.byType.PAYMENT}
                          </Typography>
                          <Typography variant="body2" color="success.dark">Payment</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 2, textAlign: 'center' }}>
                          <Receipt sx={{ fontSize: 30, color: 'info.dark', mb: 1 }} />
                          <Typography variant="h4" fontWeight="bold" color="info.dark">
                            {reportData.transactions.byType.REFUND}
                          </Typography>
                          <Typography variant="body2" color="info.dark">Refund</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 2, textAlign: 'center', mt: 2 }}>
                      <Typography variant="body2" color="primary.dark" fontWeight="bold">Total Transaction Amount</Typography>
                      <Typography variant="h4" fontWeight="bold" color="primary.dark">
                        ${reportData.transactions.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </motion.div>
          </>
        )}

        {reportType !== 'overview' && (
          <Paper elevation={3} sx={{ p: 5, textAlign: 'center' }}>
            <Assessment sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Detailed {reportType} report with filtered data
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<PictureAsPdf />}
                onClick={handleExportPDF}
                sx={{ bgcolor: '#f44336' }}
              >
                Export PDF
              </Button>
              <Button
                variant="contained"
                startIcon={<TableChart />}
                onClick={handleExportExcel}
                sx={{ bgcolor: '#4caf50' }}
              >
                Export Excel
              </Button>
            </Box>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default Reports;