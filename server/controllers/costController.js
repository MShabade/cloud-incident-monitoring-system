// Simulated cloud cost/utilization API — structured for future external API integration
// Set COST_API_URL in .env to proxy to a real billing API when available

const CURRENCY_RATES = { USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.12 };

const BASE_UTILIZATION = {
  AWS: {
    services: [
      { name: 'EC2', utilization: 72, monthlyCost: 8420 },
      { name: 'S3', utilization: 58, monthlyCost: 1240 },
      { name: 'RDS', utilization: 81, monthlyCost: 3150 },
      { name: 'Lambda', utilization: 45, monthlyCost: 680 },
      { name: 'EKS', utilization: 67, monthlyCost: 2890 }
    ],
    incidentCostMTD: 4200
  },
  Azure: {
    services: [
      { name: 'Virtual Machines', utilization: 64, monthlyCost: 7100 },
      { name: 'Blob Storage', utilization: 52, monthlyCost: 980 },
      { name: 'Azure SQL', utilization: 76, monthlyCost: 2680 },
      { name: 'AKS', utilization: 59, monthlyCost: 2340 },
      { name: 'Functions', utilization: 38, monthlyCost: 420 }
    ],
    incidentCostMTD: 1850
  },
  GCP: {
    services: [
      { name: 'Compute Engine', utilization: 69, monthlyCost: 5980 },
      { name: 'Cloud Storage', utilization: 47, monthlyCost: 870 },
      { name: 'Cloud SQL', utilization: 73, monthlyCost: 2210 },
      { name: 'GKE', utilization: 62, monthlyCost: 2560 },
      { name: 'BigQuery', utilization: 55, monthlyCost: 1340 }
    ],
    incidentCostMTD: 960
  }
};

function convert(amount, currency) {
  const rate = CURRENCY_RATES[currency] || 1;
  return Math.round(amount * rate);
}

function formatMoney(amount, currency) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

exports.getUtilization = async (req, res, next) => {
  try {
    const currency = (req.query.currency || 'USD').toUpperCase();
    const externalUrl = process.env.COST_API_URL;

    if (externalUrl && typeof fetch === 'function') {
      try {
        const response = await fetch(`${externalUrl}?currency=${currency}`, {
          headers: { Accept: 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          return res.json({ ...data, source: 'external' });
        }
      } catch (err) {
        console.warn('External cost API unavailable, falling back to simulated data:', err.message);
      }
    }

    const providers = Object.entries(BASE_UTILIZATION).map(([provider, data]) => ({
      provider,
      incidentCostMTD: convert(data.incidentCostMTD, currency),
      incidentCostFormatted: formatMoney(convert(data.incidentCostMTD, currency), currency),
      totalMonthlyCost: convert(
        data.services.reduce((sum, s) => sum + s.monthlyCost, 0),
        currency
      ),
      services: data.services.map((s) => ({
        ...s,
        monthlyCost: convert(s.monthlyCost, currency),
        monthlyCostFormatted: formatMoney(convert(s.monthlyCost, currency), currency)
      }))
    }));

    res.json({
      currency,
      source: 'simulated',
      note: externalUrl
        ? 'External API unreachable — showing simulated multi-cloud utilization metrics.'
        : 'Simulated metrics (set COST_API_URL in .env to connect a real billing API).',
      providers,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};
