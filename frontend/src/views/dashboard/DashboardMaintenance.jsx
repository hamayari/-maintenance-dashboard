import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CBadge,
  CButton,
  CProgress,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSettings, cilWarning, cilCheckCircle, cilChart } from '@coreui/icons'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import axios from 'axios'

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const API_URL = 'http://localhost:5000/api'

const DashboardMaintenance = () => {
  const [kpi, setKpi] = useState(null)
  const [criticalMachines, setCriticalMachines] = useState([])
  const [pannesParType, setPannesParType] = useState({})
  const [pannesParMachine, setPannesParMachine] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [kpiRes, criticalRes, typeRes, machineRes] = await Promise.all([
        axios.get(`${API_URL}/kpi`),
        axios.get(`${API_URL}/analytics/critical`),
        axios.get(`${API_URL}/stats/pannes-par-type`),
        axios.get(`${API_URL}/stats/pannes-par-machine`),
      ])

      setKpi(kpiRes.data)
      setCriticalMachines(criticalRes.data)
      setPannesParType(typeRes.data)
      setPannesParMachine(machineRes.data)
      setError(null)
    } catch (err) {
      setError('Aucune donnée disponible')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <CRow>
        <CCol xs={12}>
          <CCard className="text-center border-0 shadow-sm">
            <CCardBody className="py-5">
              <CIcon icon={cilWarning} size="3xl" className="text-warning mb-3" />
              <h4 className="mb-3">Aucune donnée disponible</h4>
              <p className="text-muted mb-4">
                Importez un fichier Excel pour commencer à visualiser vos KPI de maintenance
              </p>
              <CButton color="primary" href="/#/import">
                Importer des données
              </CButton>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    )
  }

  const kpiCards = [
    { 
      title: 'MTTR', 
      value: kpi.mttr, 
      unit: 'h', 
      color: kpi.statuts?.mttr === 'success' ? 'success' : kpi.statuts?.mttr === 'warning' ? 'warning' : 'danger',
      icon: cilSettings, 
      description: 'Temps Moyen de Réparation',
      cible: kpi.objectifs?.mttr_cible,
      ecart: kpi.ecarts?.mttr,
      statut: kpi.statuts?.mttr
    },
    { 
      title: 'MTBF', 
      value: kpi.mtbf, 
      unit: 'h', 
      color: kpi.statuts?.mtbf === 'success' ? 'success' : kpi.statuts?.mtbf === 'warning' ? 'warning' : 'danger',
      icon: cilCheckCircle, 
      description: 'Temps Moyen Entre Pannes',
      cible: kpi.objectifs?.mtbf_cible,
      ecart: kpi.ecarts?.mtbf,
      statut: kpi.statuts?.mtbf
    },
    { 
      title: 'TRS', 
      value: kpi.trs, 
      unit: '%', 
      color: kpi.statuts?.trs === 'success' ? 'success' : kpi.statuts?.trs === 'warning' ? 'warning' : 'danger',
      icon: cilChart, 
      description: 'Taux de Rendement Synthétique',
      cible: kpi.objectifs?.trs_cible,
      ecart: kpi.ecarts?.trs,
      statut: kpi.statuts?.trs
    },
    { 
      title: 'Pannes', 
      value: kpi.nb_pannes, 
      unit: '', 
      color: kpi.statuts?.nb_pannes === 'success' ? 'success' : kpi.statuts?.nb_pannes === 'warning' ? 'warning' : 'danger',
      icon: cilWarning, 
      description: 'Nombre Total de Pannes',
      cible: kpi.objectifs?.taux_panne_cible,
      ecart: kpi.ecarts?.nb_pannes,
      statut: kpi.statuts?.nb_pannes
    },
  ]

  // Graphique Doughnut amélioré
  const pannesTypeChartData = {
    labels: Object.keys(pannesParType),
    datasets: [{
      data: Object.values(pannesParType),
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)'
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
      ],
      borderWidth: 2,
    }],
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        }
      }
    }
  }

  // Graphique Bar amélioré
  const pannesMachineChartData = {
    labels: Object.keys(pannesParMachine),
    datasets: [{
      label: 'Nombre de pannes',
      data: Object.values(pannesParMachine),
      backgroundColor: Object.values(pannesParMachine).map(val => 
        val > 5 ? 'rgba(220, 53, 69, 0.8)' : val > 3 ? 'rgba(255, 193, 7, 0.8)' : 'rgba(25, 135, 84, 0.8)'
      ),
      borderColor: Object.values(pannesParMachine).map(val => 
        val > 5 ? 'rgba(220, 53, 69, 1)' : val > 3 ? 'rgba(255, 193, 7, 1)' : 'rgba(25, 135, 84, 1)'
      ),
      borderWidth: 2,
      borderRadius: 8,
    }],
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  }

  // Graphique Line pour tendance
  const trendData = {
    labels: Object.keys(pannesParMachine),
    datasets: [{
      label: 'Tendance des pannes',
      data: Object.values(pannesParMachine),
      fill: true,
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 3,
      tension: 0.4,
      pointRadius: 5,
      pointBackgroundColor: 'rgba(54, 162, 235, 1)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointHoverRadius: 7,
    }],
  }

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  }

  return (
    <>
      {/* KPI Cards avec animation et comparaison objectifs */}
      <CRow className="mb-4">
        {kpiCards.map((card, index) => (
          <CCol sm={6} lg={3} key={index}>
            <CCard className={`text-white bg-${card.color} border-0 shadow-sm h-100`} style={{ transition: 'transform 0.2s' }}>
              <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <div className="fs-4 fw-semibold">
                    {card.value}<span className="fs-6 ms-1">{card.unit}</span>
                  </div>
                  <div className="fw-semibold">{card.title}</div>
                  <div className="text-white-50 small">{card.description}</div>
                  
                  {/* Affichage objectif et écart */}
                  {card.cible && (
                    <div className="mt-2 pt-2 border-top border-white border-opacity-25">
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-white-75">
                          Objectif: {card.cible}{card.unit}
                        </small>
                        <CBadge 
                          color="light" 
                          className="text-dark"
                          style={{ fontSize: '0.7rem' }}
                        >
                          {card.ecart > 0 ? '+' : ''}{card.ecart}%
                        </CBadge>
                      </div>
                      <small className="text-white-75">
                        {card.statut === 'success' && '✓ Objectif atteint'}
                        {card.statut === 'warning' && '⚠ Proche objectif'}
                        {card.statut === 'danger' && '✗ Hors objectif'}
                      </small>
                    </div>
                  )}
                </div>
                <CIcon icon={card.icon} size="xl" />
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>

      {/* Actions Urgentes */}
      {criticalMachines.length > 0 && (
        <CRow className="mb-4">
          <CCol xs={12}>
            <CCard className="border-0 shadow-sm border-start border-danger border-4">
              <CCardHeader className="bg-white">
                <h5 className="mb-0 text-danger">
                  <CIcon icon={cilWarning} className="me-2" />
                  Actions urgentes requises
                </h5>
              </CCardHeader>
              <CCardBody>
                <CRow className="g-3">
                  {criticalMachines.slice(0, 3).map((item, index) => (
                    <CCol md={4} key={index}>
                      <div className="border rounded p-3 h-100 bg-light">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="mb-0">{item.machine.nom}</h6>
                          <CBadge color="danger">{item.nb_pannes} pannes</CBadge>
                        </div>
                        <p className="text-muted small mb-2"><strong>Problème :</strong> Pannes fréquentes ({item.mttr}h MTTR)</p>
                        <p className="text-success small mb-3"><strong>Action :</strong> {item.recommandation}</p>
                        <CButton color="danger" size="sm" className="w-100" href={`/#/machines/${item.machine.id}`}>
                          Planifier maintenance
                        </CButton>
                      </div>
                    </CCol>
                  ))}
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}

      {/* Indicateurs Performance */}
      <CRow className="mb-4">
        <CCol md={4}>
          <CCard className="border-0 shadow-sm h-100">
            <CCardBody>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Disponibilité Globale</h6>
                <CBadge color={kpi.trs > 85 ? 'success' : kpi.trs > 70 ? 'warning' : 'danger'}>
                  {kpi.trs > 85 ? 'Excellent' : kpi.trs > 70 ? 'Acceptable' : 'Critique'}
                </CBadge>
              </div>
              <div className="fs-3 fw-bold text-primary mb-2">{kpi.trs}%</div>
              <CProgress color={kpi.trs > 85 ? 'success' : kpi.trs > 70 ? 'warning' : 'danger'} value={kpi.trs} className="mb-2" height={8} />
              <small className="text-muted">
                {kpi.trs > 85 ? '✓ Performance optimale' : kpi.trs > 70 ? '⚠ Amélioration possible' : '✗ Action immédiate requise'}
              </small>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={4}>
          <CCard className="border-0 shadow-sm h-100">
            <CCardBody>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Efficacité Réparations</h6>
                <CBadge color={kpi.mttr < 3 ? 'success' : kpi.mttr < 5 ? 'warning' : 'danger'}>
                  {kpi.mttr < 3 ? 'Rapide' : kpi.mttr < 5 ? 'Moyen' : 'Lent'}
                </CBadge>
              </div>
              <div className="fs-3 fw-bold text-info mb-2">{kpi.mttr}h</div>
              <small className="text-muted">
                {kpi.mttr < 3 ? '✓ Équipe réactive' : kpi.mttr < 5 ? '⚠ Former les techniciens' : '✗ Revoir processus maintenance'}
              </small>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={4}>
          <CCard className="border-0 shadow-sm h-100">
            <CCardBody>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Fiabilité Équipements</h6>
                <CBadge color={kpi.mtbf > 100 ? 'success' : kpi.mtbf > 50 ? 'warning' : 'danger'}>
                  {kpi.mtbf > 100 ? 'Fiable' : kpi.mtbf > 50 ? 'Moyen' : 'Instable'}
                </CBadge>
              </div>
              <div className="fs-3 fw-bold text-success mb-2">{kpi.mtbf}h</div>
              <small className="text-muted">
                {kpi.mtbf > 100 ? '✓ Maintenance préventive efficace' : kpi.mtbf > 50 ? '⚠ Augmenter fréquence maintenance' : '✗ Remplacer équipements critiques'}
              </small>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Graphiques améliorés */}
      <CRow className="mb-4">
        <CCol lg={4}>
          <CCard className="border-0 shadow-sm h-100">
            <CCardHeader className="bg-white border-bottom">
              <h6 className="mb-0">
                <CIcon icon={cilChart} className="me-2" />
                Répartition par Type
              </h6>
            </CCardHeader>
            <CCardBody>
              <div style={{ height: '280px' }}>
                <Doughnut data={pannesTypeChartData} options={doughnutOptions} />
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol lg={4}>
          <CCard className="border-0 shadow-sm h-100">
            <CCardHeader className="bg-white border-bottom">
              <h6 className="mb-0">
                <CIcon icon={cilChart} className="me-2" />
                Pannes par Machine
              </h6>
            </CCardHeader>
            <CCardBody>
              <div style={{ height: '280px' }}>
                <Bar data={pannesMachineChartData} options={barOptions} />
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol lg={4}>
          <CCard className="border-0 shadow-sm h-100">
            <CCardHeader className="bg-white border-bottom">
              <h6 className="mb-0">
                <CIcon icon={cilChart} className="me-2" />
                Tendance des Pannes
              </h6>
            </CCardHeader>
            <CCardBody>
              <div style={{ height: '280px' }}>
                <Line data={trendData} options={lineOptions} />
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Machines Critiques */}
      <CRow>
        <CCol xs={12}>
          <CCard className="border-0 shadow-sm">
            <CCardHeader className="bg-white border-bottom">
              <h6 className="mb-0">
                <CIcon icon={cilWarning} className="me-2 text-warning" />
                Surveillance des Machines
                <CBadge color="danger" className="ms-2">{criticalMachines.length} critiques</CBadge>
              </h6>
            </CCardHeader>
            <CCardBody>
              {criticalMachines.length === 0 ? (
                <div className="text-center text-success py-4">
                  <CIcon icon={cilCheckCircle} size="3xl" className="mb-3" />
                  <h6>Toutes les machines fonctionnent normalement</h6>
                  <p className="text-muted mb-0">Aucune intervention urgente requise</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Machine</th>
                        <th>Type</th>
                        <th>Pannes</th>
                        <th>MTTR</th>
                        <th>Temps Arrêt</th>
                        <th>Priorité</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {criticalMachines.map((item, index) => (
                        <tr key={index}>
                          <td><strong>{item.machine.nom}</strong></td>
                          <td><CBadge color="secondary">{item.machine.type}</CBadge></td>
                          <td><CBadge color="danger">{item.nb_pannes}</CBadge></td>
                          <td>{item.mttr}h</td>
                          <td><CBadge color="warning">{item.temps_arret_total}h</CBadge></td>
                          <td><CBadge color={item.nb_pannes > 8 ? 'danger' : 'warning'}>{item.nb_pannes > 8 ? 'URGENT' : 'Élevée'}</CBadge></td>
                          <td><CButton color="primary" size="sm" href={`/#/machines/${item.machine.id}`}>Intervenir</CButton></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default DashboardMaintenance
