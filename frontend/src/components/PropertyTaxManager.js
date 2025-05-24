import React, { useState, useEffect } from 'react';
import { formatEther, formatNumber } from '../utils/helpers';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const PropertyTaxManager = ({ userAddress, properties = [] }) => {
  const [taxData, setTaxData] = useState([]);
  const [payments, setPayments] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [paying, setPaying] = useState({});

  useEffect(() => {
    loadTaxData();
  }, [userAddress]);

  const loadTaxData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Mock tax data
      const mockTaxData = [
        {
          id: '1',
          propertyId: '1',
          propertyLocation: 'Downtown Manhattan, NY',
          taxYear: 2024,
          assessedValue: 850000,
          taxRate: 0.012, // 1.2%
          annualTax: 10200,
          quarterlyTax: 2550,
          paidAmount: 7650, // 3 quarters paid
          remainingAmount: 2550,
          dueDate: new Date(Date.now() + 86400000 * 45),
          status: 'partially-paid',
          penalties: 0,
          exemptions: [],
          lastAssessment: new Date(Date.now() - 86400000 * 180)
        },
        {
          id: '2',
          propertyId: '2',
          propertyLocation: 'Beverly Hills, CA',
          taxYear: 2024,
          assessedValue: 1200000,
          taxRate: 0.0075, // 0.75%
          annualTax: 9000,
          quarterlyTax: 2250,
          paidAmount: 9000,
          remainingAmount: 0,
          dueDate: new Date(Date.now() - 86400000 * 30),
          status: 'paid',
          penalties: 0,
          exemptions: ['Homestead Exemption'],
          lastAssessment: new Date(Date.now() - 86400000 * 200)
        }
      ];

      // Mock payment history
      const mockPayments = [
        {
          id: 'pay1',
          propertyId: '1',
          propertyLocation: 'Downtown Manhattan, NY',
          amount: 2550,
          paymentDate: new Date(Date.now() - 86400000 * 90),
          quarter: 'Q1 2024',
          method: 'crypto',
          transactionHash: '0xabc123...',
          status: 'confirmed'
        },
        {
          id: 'pay2',
          propertyId: '1',
          propertyLocation: 'Downtown Manhattan, NY',
          amount: 2550,
          paymentDate: new Date(Date.now() - 86400000 * 180),
          quarter: 'Q2 2024',
          method: 'crypto',
          transactionHash: '0xdef456...',
          status: 'confirmed'
        },
        {
          id: 'pay3',
          propertyId: '2',
          propertyLocation: 'Beverly Hills, CA',
          amount: 9000,
          paymentDate: new Date(Date.now() - 86400000 * 60),
          quarter: 'Annual 2024',
          method: 'crypto',
          transactionHash: '0xghi789...',
          status: 'confirmed'
        }
      ];

      // Mock assessments
      const mockAssessments = [
        {
          id: 'assess1',
          propertyId: '1',
          propertyLocation: 'Downtown Manhattan, NY',
          assessmentYear: 2024,
          landValue: 400000,
          buildingValue: 450000,
          totalValue: 850000,
          previousValue: 820000,
          changePercent: 3.66,
          assessmentDate: new Date(Date.now() - 86400000 * 180),
          appealDeadline: new Date(Date.now() + 86400000 * 30),
          canAppeal: true
        },
        {
          id: 'assess2',
          propertyId: '2',
          propertyLocation: 'Beverly Hills, CA',
          assessmentYear: 2024,
          landValue: 800000,
          buildingValue: 400000,
          totalValue: 1200000,
          previousValue: 1150000,
          changePercent: 4.35,
          assessmentDate: new Date(Date.now() - 86400000 * 200),
          appealDeadline: new Date(Date.now() - 86400000 * 10),
          canAppeal: false
        }
      ];

      setTaxData(mockTaxData);
      setPayments(mockPayments);
      setAssessments(mockAssessments);
      
    } catch (error) {
      console.error('Error loading tax data:', error);
      setError('Failed to load tax data');
    } finally {
      setLoading(false);
    }
  };

  const handlePayTax = async (taxId, amount) => {
    try {
      setPaying(prev => ({ ...prev, [taxId]: true }));
      setError('');

      // Simulate blockchain payment
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update tax data
      setTaxData(prev => prev.map(tax => 
        tax.id === taxId 
          ? { 
              ...tax, 
              paidAmount: tax.paidAmount + amount,
              remainingAmount: tax.remainingAmount - amount,
              status: tax.remainingAmount - amount <= 0 ? 'paid' : 'partially-paid'
            }
          : tax
      ));

      // Add payment record
      const newPayment = {
        id: Date.now().toString(),
        propertyId: taxData.find(t => t.id === taxId).propertyId,
        propertyLocation: taxData.find(t => t.id === taxId).propertyLocation,
        amount: amount,
        paymentDate: new Date(),
        quarter: 'Current',
        method: 'crypto',
        transactionHash: `0x${Math.random().toString(16).substr(2, 8)}...`,
        status: 'confirmed'
      };

      setPayments(prev => [newPayment, ...prev]);

      alert('Tax payment successful!');
      
    } catch (error) {
      console.error('Error paying tax:', error);
      setError('Failed to process tax payment');
    } finally {
      setPaying(prev => ({ ...prev, [taxId]: false }));
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'paid': return 'bg-success';
      case 'partially-paid': return 'bg-warning';
      case 'overdue': return 'bg-danger';
      case 'pending': return 'bg-info';
      default: return 'bg-secondary';
    }
  };

  const TaxOverviewCard = ({ tax }) => {
    const daysUntilDue = Math.ceil((tax.dueDate - new Date()) / (1000 * 60 * 60 * 24));
    const isOverdue = daysUntilDue < 0;
    const isDueSoon = daysUntilDue <= 30 && daysUntilDue >= 0;

    return (
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">{tax.propertyLocation}</h6>
          <span className={`badge ${getStatusBadgeClass(tax.status)}`}>
            {tax.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <h5 className="text-primary">{formatEther((tax.remainingAmount / 1000).toFixed(3))}</h5>
                <small className="text-muted">Remaining Tax Due</small>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Annual Tax:</span>
                  <span>{formatEther((tax.annualTax / 1000).toFixed(3))}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Paid Amount:</span>
                  <span className="text-success">{formatEther((tax.paidAmount / 1000).toFixed(3))}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Tax Rate:</span>
                  <span>{(tax.taxRate * 100).toFixed(2)}%</span>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <div className={`text-${isOverdue ? 'danger' : isDueSoon ? 'warning' : 'muted'}`}>
                  <strong>Due Date:</strong> {tax.dueDate.toLocaleDateString()}
                  <br />
                  <small>
                    {isOverdue ? `${Math.abs(daysUntilDue)} days overdue` :
                     isDueSoon ? `Due in ${daysUntilDue} days` :
                     `Due in ${daysUntilDue} days`}
                  </small>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Assessed Value:</span>
                  <span>${formatNumber(tax.assessedValue)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Tax Year:</span>
                  <span>{tax.taxYear}</span>
                </div>
              </div>
            </div>
          </div>

          {tax.exemptions.length > 0 && (
            <div className="mb-3">
              <h6>Tax Exemptions:</h6>
              <div className="d-flex flex-wrap gap-1">
                {tax.exemptions.map(exemption => (
                  <span key={exemption} className="badge bg-info">{exemption}</span>
                ))}
              </div>
            </div>
          )}

          {tax.remainingAmount > 0 && (
            <div className="d-flex gap-2">
              <button
                className="btn btn-primary"
                onClick={() => handlePayTax(tax.id, tax.quarterlyTax)}
                disabled={paying[tax.id]}
              >
                {paying[tax.id] ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-credit-card me-2"></i>
                    Pay Quarterly ({formatEther((tax.quarterlyTax / 1000).toFixed(3))})
                  </>
                )}
              </button>
              <button
                className="btn btn-success"
                onClick={() => handlePayTax(tax.id, tax.remainingAmount)}
                disabled={paying[tax.id]}
              >
                Pay Full Amount
              </button>
            </div>
          )}

          {tax.penalties > 0 && (
            <div className="alert alert-warning mt-3">
              <i className="bi bi-exclamation-triangle me-2"></i>
              <strong>Penalties:</strong> {formatEther((tax.penalties / 1000).toFixed(3))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const PaymentHistoryRow = ({ payment }) => (
    <tr>
      <td>{payment.propertyLocation}</td>
      <td>{formatEther((payment.amount / 1000).toFixed(3))}</td>
      <td>{payment.quarter}</td>
      <td>{payment.paymentDate.toLocaleDateString()}</td>
      <td>
        <span className="badge bg-success">
          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
        </span>
      </td>
      <td>
        <small>
          <code>{payment.transactionHash}</code>
        </small>
      </td>
    </tr>
  );

  const AssessmentCard = ({ assessment }) => (
    <div className="card mb-3">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">{assessment.propertyLocation}</h6>
          <span className="badge bg-info">{assessment.assessmentYear}</span>
        </div>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <h5 className="text-primary">${formatNumber(assessment.totalValue)}</h5>
              <small className="text-muted">Total Assessed Value</small>
            </div>
            <div className="mb-3">
              <div className="d-flex justify-content-between">
                <span>Land Value:</span>
                <span>${formatNumber(assessment.landValue)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Building Value:</span>
                <span>${formatNumber(assessment.buildingValue)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Previous Value:</span>
                <span>${formatNumber(assessment.previousValue)}</span>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <div className={`text-${assessment.changePercent > 5 ? 'danger' : assessment.changePercent > 0 ? 'warning' : 'success'}`}>
                <strong>Value Change:</strong> {assessment.changePercent >= 0 ? '+' : ''}{assessment.changePercent.toFixed(2)}%
              </div>
            </div>
            <div className="mb-3">
              <div className="d-flex justify-content-between">
                <span>Assessment Date:</span>
                <span>{assessment.assessmentDate.toLocaleDateString()}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Appeal Deadline:</span>
                <span className={assessment.canAppeal ? 'text-warning' : 'text-muted'}>
                  {assessment.appealDeadline.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {assessment.canAppeal && (
          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2"></i>
            You can still appeal this assessment. Deadline: {assessment.appealDeadline.toLocaleDateString()}
          </div>
        )}

        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary btn-sm">
            <i className="bi bi-file-text me-1"></i>
            View Details
          </button>
          {assessment.canAppeal && (
            <button className="btn btn-warning btn-sm">
              <i className="bi bi-exclamation-triangle me-1"></i>
              File Appeal
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSpinner message="Loading tax data..." />;
  }

  const totalTaxDue = taxData.reduce((sum, tax) => sum + tax.remainingAmount, 0);
  const totalPaid = taxData.reduce((sum, tax) => sum + tax.paidAmount, 0);
  const overdueCount = taxData.filter(tax => tax.dueDate < new Date() && tax.remainingAmount > 0).length;

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h2>
            <i className="bi bi-receipt me-2"></i>
            Property Tax Manager
          </h2>
          <p className="text-muted">Manage property tax payments and assessments</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h4 className="text-danger">{formatEther((totalTaxDue / 1000).toFixed(3))}</h4>
              <small className="text-muted">Total Tax Due</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h4 className="text-success">{formatEther((totalPaid / 1000).toFixed(3))}</h4>
              <small className="text-muted">Total Paid This Year</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h4 className="text-warning">{overdueCount}</h4>
              <small className="text-muted">Overdue Properties</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h4 className="text-info">{taxData.length}</h4>
              <small className="text-muted">Total Properties</small>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Tax Overview
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            Payment History ({payments.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'assessments' ? 'active' : ''}`}
            onClick={() => setActiveTab('assessments')}
          >
            Assessments ({assessments.length})
          </button>
        </li>
      </ul>

      {/* Error Display */}
      {error && (
        <ErrorMessage error={error} onRetry={loadTaxData} />
      )}

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div>
            {taxData.length > 0 ? (
              taxData.map(tax => (
                <TaxOverviewCard key={tax.id} tax={tax} />
              ))
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-receipt display-1 text-muted"></i>
                <h3 className="mt-3">No Tax Data</h3>
                <p className="text-muted">No tax information available for your properties.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Payment History</h6>
            </div>
            <div className="card-body">
              {payments.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Property</th>
                        <th>Amount</th>
                        <th>Period</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Transaction</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(payment => (
                        <PaymentHistoryRow key={payment.id} payment={payment} />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-credit-card display-1 text-muted"></i>
                  <h4 className="mt-3">No Payment History</h4>
                  <p className="text-muted">No tax payments have been made yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'assessments' && (
          <div>
            {assessments.length > 0 ? (
              assessments.map(assessment => (
                <AssessmentCard key={assessment.id} assessment={assessment} />
              ))
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-clipboard-data display-1 text-muted"></i>
                <h3 className="mt-3">No Assessments</h3>
                <p className="text-muted">No property assessments available.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyTaxManager;
