import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Trash2, ChevronLeft, ChevronRight, Eye, PlusCircle, X } from 'lucide-react';
import { usePrediction } from '../hooks/usePrediction';
import { useToast } from '../hooks/useToast';
import { PageWrapper, FadeUpItem } from '../components/ui/AnimationWrappers';
import { formatCurrency, formatDate, getRiskColor } from '../utils/helpers';
import { fetchSampleDataset } from '../services/predictionApi';

function debounce(fn, ms) {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

export default function History() {
  const { history, deleteFromHistory } = usePrediction();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [sampleData, setSampleData] = useState(null);
  const [loadingSample, setLoadingSample] = useState(false);
  const [showSample, setShowSample] = useState(false);

  const LIMIT = 10;

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch sample dataset
  useEffect(() => {
    if (!showSample) return;
    setLoadingSample(true);
    fetchSampleDataset({ page, limit: LIMIT, search: debouncedSearch, risk: riskFilter })
      .then(setSampleData)
      .catch(() => toast({ type: 'error', title: 'Failed to load dataset' }))
      .finally(() => setLoadingSample(false));
  }, [showSample, page, debouncedSearch, riskFilter]);

  // Filter local history
  const filtered = history.filter(h => {
    const matchSearch = !debouncedSearch ||
      h.id?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      String(h.inputs?.CreditScore).includes(debouncedSearch);
    const matchRisk = riskFilter === 'all' ||
      h.risk_category?.toLowerCase().replace(' ', '').includes(riskFilter.toLowerCase().replace(' ', ''));
    return matchSearch && matchRisk;
  });

  const handleDelete = (id) => {
    deleteFromHistory(id);
    toast({ type: 'success', title: 'Deleted', message: 'Assessment removed from history.' });
  };

  const renderTable = (rows, isLocal) => (
    <div style={{ overflowX: 'auto' }}>
      {/* Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isLocal ? '140px 1fr 110px 100px 90px 90px 80px' : '140px 1fr 110px 100px 90px 90px',
        padding: '8px 14px', marginBottom: 4,
        fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
        letterSpacing: '0.06em', textTransform: 'uppercase', gap: 8,
      }}>
        <span>ID</span><span>Date</span>
        <span>Loan Amt</span><span>Credit</span>
        <span>Risk Score</span><span>Level</span>
        {isLocal && <span>Actions</span>}
      </div>
      {rows.map((row, i) => {
        const rc = getRiskColor(row.risk_category || row.riskLevel);
        return (
          <motion.div
            key={row.id || i}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            style={{
              display: 'grid',
              gridTemplateColumns: isLocal ? '140px 1fr 110px 100px 90px 90px 80px' : '140px 1fr 110px 100px 90px 90px',
              padding: '12px 14px', borderRadius: 10, marginBottom: 4,
              cursor: 'pointer', gap: 8, alignItems: 'center',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {row.id}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {isLocal ? formatDate(row.date) : formatDate(row.date) || 'Sample data'}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              {formatCurrency(isLocal ? row.inputs?.LoanAmount : row.loanAmount)}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {isLocal ? row.inputs?.CreditScore : row.creditScore}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: rc.text }}>
              {isLocal ? `${row.default_risk_score?.toFixed(1)}%` : (row.riskScore ? `${row.riskScore}%` : '—')}
            </span>
            <span>
              <span className="badge" style={{ background: rc.bg, color: rc.text, border: `1px solid ${rc.border}`, fontSize: 10 }}>
                {(row.risk_category || row.riskLevel || '').replace(' Risk', '')}
              </span>
            </span>
            {isLocal && (
              <span>
                <button className="btn btn-danger btn-icon btn-sm"
                  onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}
                  aria-label="Delete">
                  <Trash2 size={13} />
                </button>
              </span>
            )}
          </motion.div>
        );
      })}
    </div>
  );

  const sampleRows = sampleData?.data || [];
  const totalPages = sampleData?.total_pages || 1;

  return (
    <PageWrapper>
      {/* Header */}
      <FadeUpItem delay={0}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
              Prediction History
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              {history.length} session assessments · {sampleData?.total_records || 0} dataset records
            </p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/predict')}>
            <PlusCircle size={14} /> New Assessment
          </button>
        </div>
      </FadeUpItem>

      {/* Filters */}
      <FadeUpItem delay={0.05}>
        <div className="card" style={{ padding: '14px 18px', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="form-input"
                style={{ paddingLeft: 36 }}
                placeholder="Search by ID, credit score..."
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={14} />
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['all', 'lowrisk', 'moderaterisk', 'highrisk'].map(r => (
                <button key={r}
                  className="btn btn-sm"
                  onClick={() => { setRiskFilter(r); setPage(1); }}
                  style={{
                    background: riskFilter === r ? 'rgba(99,102,241,0.15)' : 'var(--bg-elevated)',
                    border: `1px solid ${riskFilter === r ? 'rgba(99,102,241,0.4)' : 'var(--border-strong)'}`,
                    color: riskFilter === r ? '#6366F1' : 'var(--text-secondary)',
                  }}>
                  {r === 'all' ? 'All' : r === 'lowrisk' ? '🟢 Low' : r === 'moderaterisk' ? '🟡 Moderate' : '🔴 High'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </FadeUpItem>

      {/* Session history */}
      <FadeUpItem delay={0.1}>
        <div className="card" style={{ padding: '22px 20px', marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
            This Session ({filtered.length})
          </div>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                {history.length === 0 ? 'No predictions yet' : 'No results match your filter'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                {history.length === 0
                  ? 'Run your first AI risk assessment to see results here.'
                  : 'Try adjusting your search or filter.'}
              </div>
              {history.length === 0 && (
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/predict')}>
                  <PlusCircle size={14} /> Create Prediction
                </button>
              )}
            </div>
          ) : renderTable(filtered, true)}
        </div>
      </FadeUpItem>

      {/* Sample dataset */}
      <FadeUpItem delay={0.15}>
        <div className="card" style={{ padding: '22px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Sample Dataset</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                Loan_default.csv — first 200 records from training data
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowSample(s => !s)}>
              {showSample ? 'Hide Dataset' : 'View Dataset'}
            </button>
          </div>

          {showSample && (
            <>
              {loadingSample ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: 48, borderRadius: 10 }} />
                  ))}
                </div>
              ) : sampleRows.length > 0 ? (
                <>
                  {renderTable(sampleRows, false)}
                  {/* Pagination */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, flexWrap: 'wrap', gap: 10 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      Page {page} of {totalPages} · {sampleData?.total_records} total
                    </span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                        <ChevronLeft size={14} />
                      </button>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                        <button key={p} className="btn btn-sm"
                          onClick={() => setPage(p)}
                          style={{
                            background: p === page ? 'rgba(99,102,241,0.15)' : 'var(--bg-elevated)',
                            border: `1px solid ${p === page ? 'rgba(99,102,241,0.4)' : 'var(--border-strong)'}`,
                            color: p === page ? '#6366F1' : 'var(--text-secondary)',
                            minWidth: 36,
                          }}>
                          {p}
                        </button>
                      ))}
                      <button className="btn btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)', fontSize: 14 }}>
                  No data available. Make sure the Flask backend is running.
                </div>
              )}
            </>
          )}
        </div>
      </FadeUpItem>
    </PageWrapper>
  );
}
