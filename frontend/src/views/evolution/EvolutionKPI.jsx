import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CAlert,
  CSpinner,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilChart, cilArrowTop, cilArrowBottom } from '@coreui/icons'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import axios from 'axios'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const API_URL = 'http://localhost:5000/api'

const EvolutionKPI = () => {
  const [evolution, setEvolution] = useState([])
  const [comparaison, setComparaison] = useState(null)
  const [tendances, setTendances] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [evolutionRes, comparaisonRes, tendancesRes] = await Promise.all([
        axios.get(`${API_URL}/stats/evolution-kpi`),
        axios.get(`${API_URL}/stats/comparaison-periodes`),
        axios.get(`${API_URL}/stats/tendances`),
      ])

      setEvolution(evolutionRes.data)
      setComparaison(comparaisonRes.data)
      setTendances(tendancesRes.data)
      setError(null)
    } catch (err) {
      setError('Aucune donnée disponible pour l\'analyse temporelle')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
        <p className="mt-3 text-muted">Chargement de l'évolution des KPI...</p>
      </div>
    )
  }

  if (error) {
    return (
      <CRow>
        <CCol xs={12}>
          <CCard className="text-center border-0 shadow-sm">
            <CCardBody className="py-5">
              <CIcon icon={cilChart} size="3xl" className="text-muted mb-3" />
              <h4 className="mb-3">Analyse temporelle non disponible</h4>
              <p className="text-muted mb-0">{error}</p>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    )
  }

  // Graphique d'évolution MTTR
  const mttrData = {
    labels: evolution.map((e) => e.periode),
    datasets: [
      {
        label: 'MTTR (heures)',
        data: evolution.map((e) => e.mttr),
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  }

  // Graphique d'évolution MTBF
  const mtbfData = {
    labels: evolution.map((e) => e.periode),
    datasets: [
      {
        label: 'MTBF (heures)',
        data: evolution.map((e) => e.mtbf),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  }

  // Graphique nombre de pannes
  const pannesData = {
    labels: evolution.map((e) => e.periode),
    datasets: [
      {
        label: 'Nombre de pannes',
        data: evolution.map((e) => e.nb_pannes),
        backgroundColor: evolution.map((e) =>
          e.nb_pannes > 5 ? 'rgba(220, 53, 69, 0.8)' : 'rgba(25, 135, 84, 0.8)'
        ),
        borderColor: evolution.map((e) =>
          e.nb_pannes > 5 ? 'rgba(220, 53, 69, 1)' : 'rgba(25, 135, 84, 1)'
        ),
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  // Graphique TRS
  const trsData = {
    labels: evolution.map((e) => e.periode),
    datasets: [
      {
        label: 'TRS (%)',
        data: evolution.map((e) => e.trs),
        borderColor: 'rgba(255, 159, 64, 1)',
        backgroundColor: 'rgba(255, 159, 64, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: 'rgba(255, 159, 64, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  }

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  }

  return (
    <>
      {/* Tendances globales */}
      {tendances && (
        <CRow className="mb-4">
          <CCol xs={12}>
            <CCard className="border-0 shadow-sm">
              <CCardHeader className="bg-white">
                <h5 className="mb-0">
                  <CIcon icon={cilChart} className="me-2" />
                  Analyse des Tendances
                </h5>
              </CCardHeader>
              <CCardBody>
                <CRow>
                  <CCol md={6}>
                    <div className="border rounded p-4 h-100">
                      <div className="d-flex align-items-center mb-3">
                        <div
                          className={`bg-${tendances.mttr.tendance === 'amelioration' ? 'success' : tendances.mttr.tendance === 'degradation' ? 'danger' : 'secondary'} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3`}
                          style={{ width: '50px', height: '50px' }}
                        >
                          <CIcon
                            icon={tendances.mttr.tendance === 'amelioration' ? cilArrowBottom : cilArrowTop}
                            size="xl"
                            className={`text-${tendances.mttr.tendance === 'amelioration' ? 'success' : tendances.mttr.tendance === 'degradation' ? 'danger' : 'secondary'}`}
                          />
                        </div>
                        <div>
                          <h6 className="mb-0">MTTR</h6>
                          <small className="text-muted">Temps Moyen de Réparation</small>
                        </div>
                      </div>
                      <div className="mb-2">
                        <CBadge
                          color={
                            tendances.mttr.tendance === 'amelioration'
                              ? 'success'
                              : tendances.mttr.tendance === 'degradation'
                              ? 'danger'
                              : 'secondary'
                          }
                          className="mb-2"
                        >
                          {tendances.mttr.tendance === 'amelioration' && '✓ Amélioration'}
                          {tendances.mttr.tendance === 'degradation' && '✗ Dégradation'}
                          {tendances.mttr.tendance === 'stable' && '= Stable'}
                        </CBadge>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Début:</span>
                        <strong>{tendances.mttr.debut}h</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Fin:</span>
                        <strong>{tendances.mttr.fin}h</strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Variation:</span>
                        <strong
                          className={
                            tendances.mttr.variation < 0 ? 'text-success' : 'text-danger'
                          }
                        >
                          {tendances.mttr.variation > 0 ? '+' : ''}
                          {tendances.mttr.variation}%
                        </strong>
                      </div>
                    </div>
                  </CCol>
                  <CCol md={6}>
                    <div className="border rounded p-4 h-100">
                      <div className="d-flex align-items-center mb-3">
                        <div
                          className={`bg-${tendances.nb_pannes.tendance === 'amelioration' ? 'success' : tendances.nb_pannes.tendance === 'degradation' ? 'danger' : 'secondary'} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3`}
                          style={{ width: '50px', height: '50px' }}
                        >
                          <CIcon
                            icon={tendances.nb_pannes.tendance === 'amelioration' ? cilArrowBottom : cilArrowTop}
                            size="xl"
                            className={`text-${tendances.nb_pannes.tendance === 'amelioration' ? 'success' : tendances.nb_pannes.tendance === 'degradation' ? 'danger' : 'secondary'}`}
                          />
                        </div>
                        <div>
                          <h6 className="mb-0">Nombre de Pannes</h6>
                          <small className="text-muted">Fréquence des défaillances</small>
                        </div>
                      </div>
                      <div className="mb-2">
                        <CBadge
                          color={
                            tendances.nb_pannes.tendance === 'amelioration'
                              ? 'success'
                              : tendances.nb_pannes.tendance === 'degradation'
                              ? 'danger'
                              : 'secondary'
                          }
                          className="mb-2"
                        >
                          {tendances.nb_pannes.tendance === 'amelioration' && '✓ Amélioration'}
                          {tendances.nb_pannes.tendance === 'degradation' && '✗ Dégradation'}
                          {tendances.nb_pannes.tendance === 'stable' && '= Stable'}
                        </CBadge>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Début:</span>
                        <strong>{tendances.nb_pannes.debut}</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Fin:</span>
                        <strong>{tendances.nb_pannes.fin}</strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Variation:</span>
                        <strong
                          className={
                            tendances.nb_pannes.variation < 0 ? 'text-success' : 'text-danger'
                          }
                        >
                          {tendances.nb_pannes.variation > 0 ? '+' : ''}
                          {tendances.nb_pannes.variation}%
                        </strong>
                      </div>
                    </div>
                  </CCol>
                </CRow>
                <CAlert color="info" className="mt-3 mb-0">
                  <small>
                    <strong>Période analysée:</strong> {tendances.periode.debut} à{' '}
                    {tendances.periode.fin} ({tendances.periode.nb_mois} mois)
                  </small>
                </CAlert>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}

      {/* Comparaison périodes */}
      {comparaison && (
        <CRow className="mb-4">
          <CCol xs={12}>
            <CCard className="border-0 shadow-sm">
              <CCardHeader className="bg-white">
                <h5 className="mb-0">Comparaison Première vs Deuxième Période</h5>
              </CCardHeader>
              <CCardBody>
                <CRow className="g-3">
                  {['mttr', 'mtbf', 'trs', 'nb_pannes'].map((kpi) => (
                    <CCol md={3} key={kpi}>
                      <div className="border rounded p-3 text-center">
                        <div className="text-uppercase small text-muted mb-2">
                          {kpi === 'nb_pannes' ? 'Pannes' : kpi.toUpperCase()}
                        </div>
                        <div className="d-flex justify-content-around align-items-center mb-2">
                          <div>
                            <div className="fs-5 fw-bold">{comparaison.periode1[kpi]}</div>
                            <small className="text-muted">P1</small>
                          </div>
                          <div>
                            <CIcon
                              icon={
                                comparaison.amelioration[kpi] ? cilArrowBottom : cilArrowTop
                              }
                              className={`text-${comparaison.amelioration[kpi] ? 'success' : 'danger'}`}
                            />
                          </div>
                          <div>
                            <div className="fs-5 fw-bold">{comparaison.periode2[kpi]}</div>
                            <small className="text-muted">P2</small>
                          </div>
                        </div>
                        <CBadge
                          color={comparaison.amelioration[kpi] ? 'success' : 'danger'}
                          className="w-100"
                        >
                          {comparaison.variations[kpi] > 0 ? '+' : ''}
                          {comparaison.variations[kpi]}%
                        </CBadge>
                      </div>
                    </CCol>
                  ))}
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}

      {/* Graphiques d'évolution */}
      <CRow className="mb-4">
        <CCol lg={6}>
          <CCard className="border-0 shadow-sm h-100">
            <CCardHeader className="bg-white">
              <h6 className="mb-0">Évolution MTTR</h6>
            </CCardHeader>
            <CCardBody>
              <div style={{ height: '300px' }}>
                <Line data={mttrData} options={lineOptions} />
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol lg={6}>
          <CCard className="border-0 shadow-sm h-100">
            <CCardHeader className="bg-white">
              <h6 className="mb-0">Évolution MTBF</h6>
            </CCardHeader>
            <CCardBody>
              <div style={{ height: '300px' }}>
                <Line data={mtbfData} options={lineOptions} />
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow>
        <CCol lg={6}>
          <CCard className="border-0 shadow-sm h-100">
            <CCardHeader className="bg-white">
              <h6 className="mb-0">Évolution Nombre de Pannes</h6>
            </CCardHeader>
            <CCardBody>
              <div style={{ height: '300px' }}>
                <Bar data={pannesData} options={barOptions} />
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol lg={6}>
          <CCard className="border-0 shadow-sm h-100">
            <CCardHeader className="bg-white">
              <h6 className="mb-0">Évolution TRS</h6>
            </CCardHeader>
            <CCardBody>
              <div style={{ height: '300px' }}>
                <Line data={trsData} options={lineOptions} />
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default EvolutionKPI
