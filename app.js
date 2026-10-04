/**
 *  macOS Earnings Studio & Timeline Engine
 * Dynamic analytics, SVG rendering, interactive filter engine, and photo evolution lookbook.
 */

document.addEventListener('DOMContentLoaded', () => {
  const data = window.PORTFOLIO_DATA;
  if (!data) {
    console.error('Portfolio data not found.');
    return;
  }

  // State Management
  const state = {
    selectedCategory: 'all',
    selectedMonth: null,
    searchQuery: '',
    sortBy: 'date-desc',
    currentPage: 1,
    pageSize: 20,
    chartMetric: 'all', // Default to 'all' so Full Breakdown (Earned + Losses + Net line) is always shown
    activeCardId: null
  };

  // Milestone metadata for Visual Journey lookbook (Correct Chronological Arc)
  const milestones = [
    {
      id: 'm-jun-2025',
      month: 'June 2025',
      title: 'The Starting Spark',
      earned: '₹90.00',
      caption: 'Initial review work bounty of ₹90. The humble starting point where the online earning journey began.',
      photoKey: 'photo_jun_2025'
    },
    {
      id: 'm-jul-2025',
      month: 'July 2025',
      title: 'High Stakes & Testing',
      earned: '-₹4,475.35',
      caption: 'Initial experimentation phase with high transaction volume. Valuable lessons in risk and discipline.',
      photoKey: 'photo_jul_2025'
    },
    {
      id: 'm-aug-2025',
      month: 'August 2025',
      title: 'The Casino Turnaround',
      earned: '+₹500.35',
      caption: 'Net positive month with successful ₹1,000.35 bank withdrawal against ₹500 deposit.',
      photoKey: 'photo_aug_2025'
    },
    {
      id: 'm-oct-2025',
      month: 'October 2025',
      title: 'The Mindset Pivot',
      earned: '-₹1,500.00',
      caption: 'Final trial deposits (-₹1.5k) leading to the complete decision to focus 100% on real skills and freelancing.',
      photoKey: 'photo_oct_2025'
    },
    {
      id: 'm-jan-2026',
      month: 'January 2026',
      title: 'College Freelance & Digital Launch',
      earned: '₹4,517.81',
      caption: 'Dual revenue streams activated: student assignments (₹2,250) + digital product store launches (₹2,267.81).',
      photoKey: 'photo_jan_2026'
    },
    {
      id: 'm-feb-2026',
      month: 'February 2026',
      title: 'Record Freelance Surge',
      earned: '₹6,662.80',
      caption: 'Peak freelance output: 9 student project payouts (₹4,969) + 12 digital product sales (₹1,693.80).',
      photoKey: 'photo_feb_2026'
    },
    {
      id: 'm-mar-2026',
      month: 'March 2026',
      title: 'Digital & Freelance Momentum',
      earned: '₹4,151.68',
      caption: 'Consistent ₹4.1k month. College projects yielded ₹3,700 alongside steady passive digital purchases.',
      photoKey: 'photo_mar_2026'
    },
    {
      id: 'm-spring-2026',
      month: 'Apr – May 2026',
      title: 'Payment Gateway Integration',
      earned: '₹459.56',
      caption: 'Automated Razorpay checkout integration tested across live micro-transactions.',
      photoKey: 'photo_spring_2026'
    },
    {
      id: 'm-jun-2026',
      month: 'June 2026',
      title: 'The Agency Breakthrough',
      earned: '₹610.00',
      caption: 'First trial payout from agency freelance contract (₹500) + Razorpay sales (₹110). The turning point.',
      photoKey: 'photo_jun_2026'
    },
    {
      id: 'm-jul-2026',
      month: 'July 2026',
      title: 'First Full Agency Salary',
      earned: '₹5,000.00',
      caption: 'Promoted to full agency retainer at ₹5,000/month. Steady predictable recurring income unlocked.',
      photoKey: 'photo_jul_2026'
    },
    {
      id: 'm-aug-2026',
      month: 'August 2026',
      title: 'Scaling into 5-Figures',
      earned: '₹12,500.00',
      caption: 'Massive scale to ₹12,500 monthly agency compensation. Execution quality recognized.',
      photoKey: 'photo_aug_2026'
    },
    {
      id: 'm-sep-2026',
      month: 'September 2026',
      title: 'Peak All-Time High',
      earned: '₹14,000.00',
      caption: 'Record agency salary payout of ₹14,000 as of last month. Highest earning milestone to date.',
      photoKey: 'photo_sep_2026'
    }
  ];

  // 1. Clock in menubar
  function initClock() {
    const clockEl = document.getElementById('macClock');
    function update() {
      const now = new Date();
      const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      clockEl.textContent = now.toLocaleDateString('en-US', options).replace(/,/g, '');
    }
    update();
    setInterval(update, 1000);
  }

  // 2. Format Currency
  function formatINR(val) {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  }

  // 3. Render SVG Chart
  function renderChart() {
    const wrapper = document.getElementById('svgChartWrapper');
    const timeline = data.monthly_timeline;
    if (!wrapper || !timeline || !timeline.length) return;

    const isMobile = window.innerWidth < 768;
    const width = wrapper.clientWidth || (isMobile ? window.innerWidth - 40 : 1000);
    const height = isMobile ? 290 : 310;
    const padding = { 
      top: 25, 
      right: isMobile ? 18 : 28, 
      bottom: isMobile ? 46 : 52, 
      left: isMobile ? 48 : 58 
    };

    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Determine scale bounds with comfortable headroom
    const maxVal = Math.max(...timeline.map(d => Math.max(d.earned, d.net_balance, 1000))) * 1.15;
    const minVal = -5000; // Guaranteed headroom for -4475.35 loss bar

    function getY(val) {
      const range = maxVal - minVal;
      const normalized = (val - minVal) / range;
      return padding.top + chartH - (normalized * chartH);
    }

    const stepX = chartW / timeline.length;

    // Grid lines
    let gridLinesSvg = '';
    const ticks = 4;
    for (let i = 0; i <= ticks; i++) {
      const val = minVal + ((maxVal - minVal) / ticks) * i;
      const y = getY(val);
      gridLinesSvg += `
        <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" class="chart-grid-line" />
        <text x="${padding.left - 8}" y="${y + 4}" class="chart-axis-text" text-anchor="end">₹${Math.round(val / 1000)}k</text>
      `;
    }

    // Zero Line
    const zeroY = getY(0);
    const zeroLineSvg = `<line x1="${padding.left}" y1="${zeroY}" x2="${width - padding.right}" y2="${zeroY}" stroke="rgba(255,255,255,0.22)" stroke-width="1.5" />`;

    // Bars & Points
    let barsSvg = '';
    let linePoints = [];
    let labelsSvg = '';

    timeline.forEach((item, idx) => {
      const xCenter = padding.left + (idx + 0.5) * stepX;
      const barWidth = Math.min(24, stepX * 0.55);
      const barX = xCenter - barWidth / 2;

      // Earned Bar (Positive, pointing up from zero line)
      if (state.chartMetric === 'earned' || state.chartMetric === 'all') {
        if (item.earned > 0) {
          const barHeight = Math.max(3, zeroY - getY(item.earned));
          const barY = getY(item.earned);
          barsSvg += `
            <rect x="${barX}" y="${barY}" width="${barWidth}" height="${barHeight}" rx="4" class="chart-bar-earned" data-month="${item.label}">
              <title>${item.label}: Earned ₹${formatINR(item.earned)}</title>
            </rect>
          `;
        } else {
          // Zero earned indicator
          barsSvg += `
            <rect x="${barX}" y="${zeroY - 1}" width="${barWidth}" height="2" rx="1" fill="rgba(255,255,255,0.25)" data-month="${item.label}">
              <title>${item.label}: ₹0.00 Earned</title>
            </rect>
          `;
        }
      }

      // Gambling Loss Bar (Negative, pointing down below zero line)
      if ((state.chartMetric === 'all' || state.chartMetric === 'net') && item.gambling_net < 0) {
        const lossHeight = Math.max(3, getY(item.gambling_net) - zeroY);
        const lossY = zeroY;
        barsSvg += `
          <rect x="${barX}" y="${lossY}" width="${barWidth}" height="${lossHeight}" rx="4" class="chart-bar-loss" data-month="${item.label}">
            <title>${item.label}: Gambling Loss -₹${formatINR(Math.abs(item.gambling_net))}</title>
          </rect>
        `;
      }

      // Net Line point
      if (state.chartMetric === 'net' || state.chartMetric === 'all') {
        const netY = getY(item.net_balance);
        linePoints.push(`${xCenter},${netY}`);
      }

      // Month Label on X-axis (with ample bottom clearance)
      labelsSvg += `
        <text x="${xCenter}" y="${height - 14}" class="chart-axis-text" text-anchor="middle" cursor="pointer" data-month="${item.label}">
          ${item.short_label}
        </text>
      `;
    });

    // Net line path
    let lineSvg = '';
    if (linePoints.length && (state.chartMetric === 'net' || state.chartMetric === 'all')) {
      const pathD = `M ${linePoints.join(' L ')}`;
      lineSvg = `
        <path d="${pathD}" class="chart-line-net" />
        ${timeline.map((item, idx) => {
          const xCenter = padding.left + (idx + 0.5) * stepX;
          const netY = getY(item.net_balance);
          return `<circle cx="${xCenter}" cy="${netY}" r="4" class="chart-point-net" data-month="${item.label}">
            <title>${item.label} Net: ₹${formatINR(item.net_balance)}</title>
          </circle>`;
        }).join('')}
      `;
    }

    wrapper.innerHTML = `
      <svg class="chart-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
        ${gridLinesSvg}
        ${zeroLineSvg}
        ${barsSvg}
        ${lineSvg}
        ${labelsSvg}
      </svg>
    `;

    // Click handler on chart elements
    wrapper.querySelectorAll('[data-month]').forEach(elem => {
      elem.addEventListener('click', () => {
        const m = elem.getAttribute('data-month');
        filterByMonth(m);
      });
    });
  }

  // 4. Render Timeline Milestone Cards
  function renderTimelineCards() {
    const track = document.getElementById('timelineCardsTrack');
    if (!track) return;

    track.innerHTML = data.monthly_timeline.map(item => {
      const isSelected = state.selectedMonth === item.label;
      const isNegative = item.net_balance < 0;
      const streams = item.categories_present.length ? item.categories_present.join(' • ') : 'Inactive';
      return `
        <div class="month-milestone-card ${isSelected ? 'selected' : ''}" data-month="${item.label}">
          <span class="card-month-badge">${item.label}</span>
          <span class="card-month-net ${isNegative ? 'text-danger' : ''}">₹${formatINR(item.net_balance)}</span>
          <span class="card-month-streams">${streams} (${item.tx_count} txns)</span>
        </div>
      `;
    }).join('');

    track.querySelectorAll('.month-milestone-card').forEach(card => {
      card.addEventListener('click', () => {
        const m = card.getAttribute('data-month');
        if (state.selectedMonth === m) {
          filterByMonth(null);
        } else {
          filterByMonth(m);
        }
      });
    });
  }

  // 5. Render Visual Journey Evolution Cards
  function renderEvolutionGrid() {
    const grid = document.getElementById('evolutionGrid');
    if (!grid) return;

    grid.innerHTML = milestones.map(m => {
      const savedImg = localStorage.getItem(m.photoKey);
      const hasImage = !!savedImg;

      return `
        <div class="evolution-card" id="${m.id}">
          <div class="photo-frame" data-key="${m.photoKey}" data-title="${m.month} — ${m.title}">
            ${hasImage ? `
              <img src="${savedImg}" alt="${m.title}" class="uploaded-image" />
            ` : `
              <div class="photo-placeholder-content">
                <div class="photo-cam-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                </div>
                <span class="photo-slot-label">Milestone Photo Slot</span>
                <span class="photo-slot-hint">Click or drop image here</span>
              </div>
            `}
            <div class="photo-hover-overlay">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span>${hasImage ? 'Replace Photo' : 'Upload Milestone Photo'}</span>
            </div>
          </div>
          <div class="evolution-content">
            <div class="evo-top-meta">
              <span class="evo-month-tag">${m.month}</span>
              <span class="evo-earning-tag">${m.earned}</span>
            </div>
            <h3 class="evo-title">${m.title}</h3>
            <p class="evo-caption">${m.caption}</p>
          </div>
        </div>
      `;
    }).join('');

    // Attach Photo upload click handlers
    grid.querySelectorAll('.photo-frame').forEach(frame => {
      frame.addEventListener('click', () => {
        const key = frame.getAttribute('data-key');
        const title = frame.getAttribute('data-title');
        openPhotoModal(key, title);
      });
    });
  }

  // 6. Photo Upload Modal Logic
  let currentTargetKey = null;
  const photoModal = document.getElementById('photoModal');
  const modalTitle = document.getElementById('photoModalTitle');
  const modalFileInput = document.getElementById('modalFileInput');
  const uploadDropzone = document.getElementById('uploadDropzone');
  const modalCaptionInput = document.getElementById('modalCaptionInput');
  const closePhotoModalBtn = document.getElementById('closePhotoModalBtn');
  const cancelPhotoModalBtn = document.getElementById('cancelPhotoModalBtn');

  function openPhotoModal(key, title) {
    currentTargetKey = key;
    modalTitle.textContent = `Milestone: ${title}`;
    modalCaptionInput.value = '';
    modalFileInput.value = '';
    photoModal.classList.add('open');
  }

  function closePhotoModal() {
    photoModal.classList.remove('open');
    currentTargetKey = null;
  }

  if (closePhotoModalBtn) closePhotoModalBtn.addEventListener('click', closePhotoModal);
  if (cancelPhotoModalBtn) cancelPhotoModalBtn.addEventListener('click', closePhotoModal);

  if (uploadDropzone) {
    uploadDropzone.addEventListener('click', () => modalFileInput.click());
    uploadDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadDropzone.style.borderColor = 'var(--accent-primary)';
    });
    uploadDropzone.addEventListener('dragleave', () => {
      uploadDropzone.style.borderColor = '';
    });
    uploadDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadDropzone.style.borderColor = '';
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleImageFile(e.dataTransfer.files[0]);
      }
    });
  }

  if (modalFileInput) {
    modalFileInput.addEventListener('change', () => {
      if (modalFileInput.files && modalFileInput.files[0]) {
        handleImageFile(modalFileInput.files[0]);
      }
    });
  }

  function handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      if (currentTargetKey) {
        localStorage.setItem(currentTargetKey, dataUrl);
        renderEvolutionGrid();
        closePhotoModal();
      }
    };
    reader.readAsDataURL(file);
  }

  // 7. Filter & Render Transactions Table
  function getFilteredTransactions() {
    return data.transactions.filter(item => {
      if (state.selectedCategory !== 'all' && item.category_id !== state.selectedCategory) {
        return false;
      }
      if (state.selectedMonth) {
        const itemMonthKey = `${item.month} ${item.year}`;
        if (itemMonthKey !== state.selectedMonth) {
          return false;
        }
      }
      if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        const match =
          (item.source && item.source.toLowerCase().includes(q)) ||
          (item.details && item.details.toLowerCase().includes(q)) ||
          (item.date && item.date.toLowerCase().includes(q)) ||
          (item.status && item.status.toLowerCase().includes(q)) ||
          item.amount.toString().includes(q);
        if (!match) return false;
      }
      return true;
    }).sort((a, b) => {
      if (state.sortBy === 'date-desc') return new Date(b.iso_date) - new Date(a.iso_date);
      if (state.sortBy === 'date-asc') return new Date(a.iso_date) - new Date(b.iso_date);
      if (state.sortBy === 'amount-desc') return b.amount - a.amount;
      if (state.sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });
  }

  function renderTable() {
    const tbody = document.getElementById('transactionsTableBody');
    const showingCount = document.getElementById('showingCountText');
    const paginationInfo = document.getElementById('paginationInfo');
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const heading = document.getElementById('txSectionHeading');

    if (!tbody) return;

    const filtered = getFilteredTransactions();
    const totalCount = filtered.length;
    const grandTotal = data.transactions.length;
    const totalPages = Math.ceil(totalCount / state.pageSize) || 1;

    if (state.currentPage > totalPages) state.currentPage = totalPages;
    if (state.currentPage < 1) state.currentPage = 1;

    const startIndex = (state.currentPage - 1) * state.pageSize;
    const pageItems = filtered.slice(startIndex, startIndex + state.pageSize);

    // Update section heading dynamically
    if (heading) {
      if (state.selectedMonth) {
        heading.textContent = `${state.selectedMonth} Transactions (${totalCount} Records)`;
      } else if (state.selectedCategory !== 'all') {
        const catObj = data.categories.find(c => c.id === state.selectedCategory);
        heading.textContent = `${catObj ? catObj.name : state.selectedCategory} (${totalCount} Records)`;
      } else if (state.searchQuery) {
        heading.textContent = `Search Results (${totalCount} Records)`;
      } else {
        heading.textContent = `All ${grandTotal} Transaction Records`;
      }
    }

    // Informative meta bar with interactive clear chip
    if (state.selectedMonth) {
      showingCount.innerHTML = `Showing <strong>${pageItems.length}</strong> of <strong>${totalCount}</strong> for <strong>${state.selectedMonth}</strong> <span style="color:var(--text-muted); font-size:11px;">(Filtered from ${grandTotal} total)</span> <button class="filter-clear-chip" id="clearMonthChip" title="Click to view all 154 transactions">✕ Clear Month Filter</button>`;
      setTimeout(() => {
        const clearBtn = document.getElementById('clearMonthChip');
        if (clearBtn) clearBtn.onclick = () => filterByMonth(null);
      }, 0);
    } else if (state.selectedCategory !== 'all' || state.searchQuery) {
      showingCount.innerHTML = `Showing <strong>${pageItems.length}</strong> of <strong>${totalCount}</strong> transactions <span style="color:var(--text-muted); font-size:11px;">(Filtered from ${grandTotal} total)</span> <button class="filter-clear-chip" id="clearAllFiltersChip">✕ Reset</button>`;
      setTimeout(() => {
        const clearAllBtn = document.getElementById('clearAllFiltersChip');
        if (clearAllBtn) clearAllBtn.onclick = () => document.getElementById('resetFiltersBtn').click();
      }, 0);
    } else {
      showingCount.innerHTML = `Showing <strong>${pageItems.length}</strong> of <strong>${grandTotal}</strong> total transactions`;
    }

    paginationInfo.textContent = `Page ${state.currentPage} of ${totalPages}`;

    prevBtn.disabled = state.currentPage <= 1;
    nextBtn.disabled = state.currentPage >= totalPages;

    if (!pageItems.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
            No transactions found matching the current filters.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = pageItems.map(tx => {
      const isDebit = tx.amount < 0 || (tx.category_id === 'gambling' && tx.type === 'Deposit');
      const amountClass = isDebit ? 'amount-debit' : 'amount-credit';
      const statusClass = tx.status === 'Completed' ? 'status-completed' : 'status-cancelled';

      return `
        <tr>
          <td>
            <span class="category-tag cat-tag-${tx.category_id}">
              ${tx.source}
            </span>
          </td>
          <td>
            <div style="font-weight: 600; color: #fff;">${tx.date}</div>
            <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">${tx.time || ''}</div>
          </td>
          <td style="max-width: 320px;">
            <div style="color: var(--text-secondary);">${tx.details}</div>
          </td>
          <td>
            <span style="font-size: 12px; font-weight: 500; color: var(--text-muted);">${tx.type}</span>
          </td>
          <td>
            <span class="status-badge ${statusClass}">${tx.status}</span>
          </td>
          <td class="text-right">
            <span class="amount-cell ${amountClass}">
              ${tx.amount < 0 ? '-' : '+'}₹${formatINR(Math.abs(tx.amount))}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 8. Event Listeners & Filter Handlers
  function filterByMonth(monthLabel) {
    state.selectedMonth = monthLabel;
    state.currentPage = 1;
    renderTimelineCards();
    renderTable();

    if (monthLabel) {
      const txSection = document.getElementById('transactions');
      if (txSection) txSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  const searchInput = document.getElementById('txSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      state.currentPage = 1;
      renderTable();
    });
  }

  const catFilter = document.getElementById('txCategoryFilter');
  if (catFilter) {
    catFilter.addEventListener('change', (e) => {
      state.selectedCategory = e.target.value;
      state.currentPage = 1;
      renderTable();
    });
  }

  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.getAttribute('data-category');
      state.selectedCategory = cat;
      if (catFilter) catFilter.value = cat;
      state.currentPage = 1;
      renderTable();
      const txSection = document.getElementById('transactions');
      if (txSection) txSection.scrollIntoView({ behavior: 'smooth' });
    });
  });

  const sortSelect = document.getElementById('txSortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      renderTable();
    });
  }

  const resetBtn = document.getElementById('resetFiltersBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      state.selectedCategory = 'all';
      state.selectedMonth = null;
      state.searchQuery = '';
      state.sortBy = 'date-desc';
      state.currentPage = 1;
      if (searchInput) searchInput.value = '';
      if (catFilter) catFilter.value = 'all';
      if (sortSelect) sortSelect.value = 'date-desc';
      renderTimelineCards();
      renderTable();
    });
  }

  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (state.currentPage > 1) {
        state.currentPage--;
        renderTable();
      }
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      state.currentPage++;
      renderTable();
    });
  }

  const chartControls = document.getElementById('chartViewControl');
  if (chartControls) {
    chartControls.querySelectorAll('.seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        chartControls.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.chartMetric = btn.getAttribute('data-metric');
        renderChart();
      });
    });
  }

  const sliderPrev = document.getElementById('sliderPrev');
  const sliderNext = document.getElementById('sliderNext');
  const track = document.getElementById('timelineCardsTrack');
  if (sliderPrev && track) {
    sliderPrev.addEventListener('click', () => {
      track.scrollBy({ left: -260, behavior: 'smooth' });
    });
  }
  if (sliderNext && track) {
    sliderNext.addEventListener('click', () => {
      track.scrollBy({ left: 260, behavior: 'smooth' });
    });
  }

  const exportBtn = document.getElementById('exportDataBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', 'master_financial_summary.json');
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    });
  }

  window.addEventListener('resize', () => {
    renderChart();
  });

  // Initialize
  initClock();
  renderChart();
  renderTimelineCards();
  renderEvolutionGrid();
  renderTable();
});
