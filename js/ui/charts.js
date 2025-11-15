/**
 * Charts Module
 *
 * PURPOSE: Create and manage Chart.js visualizations for the dashboard
 * FEATURES:
 * - Progress line charts
 * - Quarter bar charts
 * - Standards radar charts
 * - Activity heatmaps
 * - Study time charts
 */

const Charts = {
  // Chart instances cache
  _charts: {},

  // Default chart colors
  colors: {
    primary: '#667eea',
    secondary: '#764ba2',
    success: '#48bb78',
    warning: '#f6ad55',
    danger: '#f56565',
    info: '#4299e1',
    gradient: ['#667eea', '#764ba2', '#f6ad55', '#48bb78'],
    text: '#2d3748',
    grid: '#e2e8f0'
  },

  /**
   * Create progress over time line chart
   * @param {string} canvasId - Canvas element ID
   * @param {Array} data - Array of {date, lessonsCompleted}
   * @returns {Chart} Chart instance
   */
  createProgressChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    // Destroy existing chart
    if (this._charts[canvasId]) {
      this._charts[canvasId].destroy();
    }

    const ctx = canvas.getContext('2d');

    // Prepare data
    const labels = data.map(d => this._formatDate(d.date));
    const values = data.map(d => d.lessonsCompleted);

    this._charts[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Lessons Completed',
          data: values,
          borderColor: this.colors.primary,
          backgroundColor: this._createGradient(ctx, this.colors.primary),
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleColor: '#fff',
            bodyColor: '#fff',
            callbacks: {
              label: (context) => `Completed: ${context.parsed.y} lessons`
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: this.colors.text,
              maxRotation: 45,
              minRotation: 0
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: this.colors.grid
            },
            ticks: {
              color: this.colors.text,
              stepSize: 1
            }
          }
        }
      }
    });

    return this._charts[canvasId];
  },

  /**
   * Create quarter comparison bar chart
   * @param {string} canvasId - Canvas element ID
   * @param {Object} data - {Q1: 50, Q2: 30, Q3: 10, Q4: 0}
   * @returns {Chart} Chart instance
   */
  createQuarterChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    if (this._charts[canvasId]) {
      this._charts[canvasId].destroy();
    }

    const ctx = canvas.getContext('2d');

    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const values = quarters.map(q => data[q] || 0);

    this._charts[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4'],
        datasets: [{
          label: 'Completion %',
          data: values,
          backgroundColor: this.colors.gradient,
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            callbacks: {
              label: (context) => `Completion: ${context.parsed.y}%`
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: this.colors.text
            }
          },
          y: {
            beginAtZero: true,
            max: 100,
            grid: {
              color: this.colors.grid
            },
            ticks: {
              color: this.colors.text,
              callback: (value) => value + '%'
            }
          }
        }
      }
    });

    return this._charts[canvasId];
  },

  /**
   * Create standards mastery radar/bar chart
   * @param {string} canvasId - Canvas element ID
   * @param {Array} data - Array of {standard, avgScore}
   * @returns {Chart} Chart instance
   */
  createStandardsChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    if (this._charts[canvasId]) {
      this._charts[canvasId].destroy();
    }

    const ctx = canvas.getContext('2d');

    // Prepare data
    const labels = data.map(d => d.standard);
    const values = data.map(d => d.avgScore);

    // Color bars based on score (red < 60, yellow 60-80, green > 80)
    const backgroundColors = values.map(score => {
      if (score < 60) return this.colors.danger;
      if (score < 80) return this.colors.warning;
      return this.colors.success;
    });

    this._charts[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Average Score',
          data: values,
          backgroundColor: backgroundColors,
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        indexAxis: 'y', // Horizontal bars
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            callbacks: {
              label: (context) => `Average: ${context.parsed.x}%`
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 100,
            grid: {
              color: this.colors.grid
            },
            ticks: {
              color: this.colors.text,
              callback: (value) => value + '%'
            }
          },
          y: {
            grid: {
              display: false
            },
            ticks: {
              color: this.colors.text,
              font: {
                size: 11
              }
            }
          }
        }
      }
    });

    return this._charts[canvasId];
  },

  /**
   * Create study time chart (hours per week)
   * @param {string} canvasId - Canvas element ID
   * @param {Array} data - Array of {week, hours}
   * @returns {Chart} Chart instance
   */
  createStudyTimeChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    if (this._charts[canvasId]) {
      this._charts[canvasId].destroy();
    }

    const ctx = canvas.getContext('2d');

    const labels = data.map(d => d.week);
    const values = data.map(d => d.hours);

    this._charts[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Study Hours',
          data: values,
          backgroundColor: this._createGradient(ctx, this.colors.info),
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            callbacks: {
              label: (context) => `${context.parsed.y} hours`
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: this.colors.text
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: this.colors.grid
            },
            ticks: {
              color: this.colors.text,
              callback: (value) => value + 'h'
            }
          }
        }
      }
    });

    return this._charts[canvasId];
  },

  /**
   * Create class progress comparison chart (teacher view)
   * @param {string} canvasId - Canvas element ID
   * @param {Array} data - Array of {date, completedLessons, avgScore}
   * @returns {Chart} Chart instance
   */
  createClassProgressChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    if (this._charts[canvasId]) {
      this._charts[canvasId].destroy();
    }

    const ctx = canvas.getContext('2d');

    const labels = data.map(d => this._formatDate(d.date));
    const completedValues = data.map(d => d.completedLessons);
    const scoreValues = data.map(d => d.avgScore);

    this._charts[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Lessons Completed',
            data: completedValues,
            borderColor: this.colors.primary,
            backgroundColor: this._createGradient(ctx, this.colors.primary),
            yAxisID: 'y',
            fill: true,
            tension: 0.4,
            pointRadius: 3
          },
          {
            label: 'Average Score',
            data: scoreValues,
            borderColor: this.colors.success,
            backgroundColor: 'transparent',
            yAxisID: 'y1',
            fill: false,
            tension: 0.4,
            pointRadius: 3,
            borderDash: [5, 5]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: this.colors.text,
              usePointStyle: true,
              padding: 15
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: this.colors.text,
              maxRotation: 45,
              minRotation: 0
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            beginAtZero: true,
            grid: {
              color: this.colors.grid
            },
            ticks: {
              color: this.colors.text
            },
            title: {
              display: true,
              text: 'Lessons Completed',
              color: this.colors.text
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            beginAtZero: true,
            max: 100,
            grid: {
              drawOnChartArea: false
            },
            ticks: {
              color: this.colors.text,
              callback: (value) => value + '%'
            },
            title: {
              display: true,
              text: 'Average Score %',
              color: this.colors.text
            }
          }
        }
      }
    });

    return this._charts[canvasId];
  },

  /**
   * Update existing chart with new data
   * @param {string} canvasId - Canvas element ID
   * @param {Array} newData - New data array
   */
  updateChart(canvasId, newData) {
    const chart = this._charts[canvasId];
    if (!chart) return;

    // Update based on chart type
    if (chart.config.type === 'line') {
      chart.data.labels = newData.map(d => this._formatDate(d.date));
      chart.data.datasets[0].data = newData.map(d => d.value || d.lessonsCompleted);
    } else if (chart.config.type === 'bar') {
      chart.data.datasets[0].data = newData;
    }

    chart.update();
  },

  /**
   * Destroy chart instance
   * @param {string} canvasId - Canvas element ID
   */
  destroyChart(canvasId) {
    if (this._charts[canvasId]) {
      this._charts[canvasId].destroy();
      delete this._charts[canvasId];
    }
  },

  /**
   * Destroy all charts
   */
  destroyAllCharts() {
    Object.keys(this._charts).forEach(canvasId => {
      this.destroyChart(canvasId);
    });
  },

  /**
   * Create gradient for chart background
   * @private
   */
  _createGradient(ctx, color) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, color + '80'); // 50% opacity
    gradient.addColorStop(1, color + '00'); // 0% opacity
    return gradient;
  },

  /**
   * Format date for chart labels
   * @private
   */
  _formatDate(dateStr) {
    const date = new Date(dateStr);
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  },

  /**
   * Get chart instance by ID
   * @param {string} canvasId - Canvas element ID
   * @returns {Chart|null} Chart instance
   */
  getChart(canvasId) {
    return this._charts[canvasId] || null;
  },

  /**
   * Resize all charts (useful for responsive layouts)
   */
  resizeAllCharts() {
    Object.values(this._charts).forEach(chart => {
      if (chart) {
        chart.resize();
      }
    });
  }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.Charts = Charts;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Charts;
}

// Auto-resize charts on window resize
if (typeof window !== 'undefined') {
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      Charts.resizeAllCharts();
    }, 250);
  });
}
