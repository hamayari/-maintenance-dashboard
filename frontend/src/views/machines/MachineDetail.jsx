import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CBadge,
  CButton,
  CAlert,
  CProgress,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilSettings, cilWarning, cilCheckCircle, cilClock } from '@coreui/icons'
import { CChartLine, CChartBar } from '@coreui/react-chartjs'
import axios from 'axios'

const API_URL = 'http://localhost:5000/api'

const MachineDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadMachineDetail()
  }, [id])

  const loadMachineDetail = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/machines/${id}`)
      setData(response.data)
      setError(null)
    } catch (err) {
      setError('Machine non trouvée')
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

  if (error || !data) {
    return (
      <CRow>
        <CCol xs={12}>
          <CCard className="text-center">
            <CCardBody className="py-5">
              <CIcon icon={cilWarning} size="3xl" className="text-warning mb-3" />
              <h4 className="mb-3">Machine non trouvée</h4>
              <CButton color="primary" onClick={() => navigate('/machines')}>
                Retour à la liste
              </CButton>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    )
  }

  const { machine, kpi, pannes } = data

  // Déterminer le statut de santé
  const getHealthStatus = () => {
    if (kpi.nb_pannes > 5) return { label: 'Critique', color: 'danger', icon: cilWarning }
    if (kpi.nb_pannes > 3) return { label: 'Attention', color: 'warning', icon: cilWarning }
    return { label: 'Bon état', color: 'success', icon: cilCheckCircle }
  }

  const healthStatus = getHealthStatus()

  // Données pour graphique évolution pannes
  const pannesParMois = pannes.reduce((acc, panne) => {
    const mois = panne.date.substring(0, 7) // Format YYYY-MM
    acc[mois] = (acc[mois] || 0) + 1
    return acc
  }, {})

  const evolutionData = {
    labels: Object.keys(pannesParMois),
    datasets: [
      {
        label: 'Nombre de pannes',
        backgroundColor: 'rgba(220, 53, 69, 0.2)',
        borderColor: 'rgba(220, 53, 69, 1)',
        data: Object.values(pannesParMois),
        fill: true,
      },
    ],
  }

  // Données pour graphique durée réparations
  const dureeData = {
    labels: pannes.map((p, i) => `Panne ${i + 1}`),
    datasets: [
      {
        label: 'Durée (heures)',
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        data: pannes.map((p) => p.duree_reparation),
      },
    ],
  }

  // Recommandations intelligentes
  const getRecommendations = () => {
    const recommendations = []
    if (kpi.nb_pannes > 5) {
      recommendations.push({
        type: 'urgent',
        message: 'Planifier une maintenance préventive immédiate',
        action: 'Contacter équipe maintenance',
      })
    }
    if (kpi.mttr > 4) {
      recommendations.push({
        type: 'warning',
        message: 'Temps de réparation élevé - Former les techniciens',
        action: 'Organiser formation',
      })
    }
    if (kpi.nb_pannes === 0) {
      recommendations.push({
        type: 'success',
        message: 'Machine performante - Continuer maintenance préventive',
        action: 'Maintenir le rythme',
      })
    }
    return recommendations
  }

  const recommendations = getRecommendations()

  return (
    <>
      {/* Header avec retour */}
      <CRow className="mb-3">
        <CCol>
          <CButton color="light" onClick={() => navigate('/machines')} className="mb-3">
            <CIcon icon={cilArrowLeft} className="me-2" />
            Retour aux machines
          </CButton>
        </CCol>
      </CRow>

      {/* En-tête machine */}
      <CRow className="mb-4">
        <CCol xs={12}>
          <CCard className="border-0 shadow-sm">
            <CCardBody>
              <CRow className="align-items-center">
                <CCol md={6}>
                  <div className="d-flex align-items-center">
                    <div
                      className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{ width: '60px', height: '60px' }}
                    >
                      <CIcon icon={cilSettings} size="xl" className="text-primary" />
                    </div>
                    <div>
                      <h3 className="mb-1">{machine.nom}</h3>
                      <CBadge color="secondary" className="me-2">
                        {machine.type}
                      </CBadge>
                      <CBadge color={healthStatus.color}>
                        <CIcon icon={healthStatus.icon} className="me-1" />
                        {healthStatus.label}
                      </CBadge>
                    </div>
                  </div>
                </CCol>
                <CCol md={6} className="text-md-end mt-3 mt-md-0">
                  <div className="text-muted small mb-1">Dernière mise à jour</div>
                  <div className="fw-semibold">Aujourd'hui</div>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* KPI Cards */}
      <CRow className="mb-4">
        <CCol sm={6} lg={3}>
          <CCard className="text-center border-0 shadow-sm">
            <CCardBody>
              <div className="text-muted small mb-1">Temps Moyen Réparation</div>
              <div className="fs-2 fw-bold text-primary">{kpi.mttr}h</div>
              <div className="text-muted small">MTTR</div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6} lg={3}>
          <CCard className="text-center border-0 shadow-sm">
            <CCardBody>
              <div className="text-muted small mb-1">Temps Entre Pannes</div>
              <div className="fs-2 fw-bold text-success">{kpi.mtbf}h</div>
              <div className="text-muted small">MTBF</div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6} lg={3}>
          <CCard className="text-center border-0 shadow-sm">
            <CCardBody>
              <div className="text-muted small mb-1">Nombre de Pannes</div>
              <div className="fs-2 fw-bold text-danger">{kpi.nb_pannes}</div>
              <div className="text-muted small">Total</div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6} lg={3}>
          <CCard className="text-center border-0 shadow-sm">
            <CCardBody>
              <div className="text-muted small mb-1">Temps d'Arrêt Total</div>
              <div className="fs-2 fw-bold text-warning">{kpi.temps_arret_total}h</div>
              <div className="text-muted small">Cumulé</div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Recommandations */}
      {recommendations.length > 0 && (
        <CRow className="mb-4">
          <CCol xs={12}>
            <CCard className="border-0 shadow-sm">
              <CCardHeader className="bg-white">
                <h5 className="mb-0">
                  <i className="bi bi-lightbulb me-2"></i>
                  Actions recommandées
                </h5>
              </CCardHeader>
              <CCardBody>
                {recommendations.map((rec, index) => (
                  <CAlert
                    key={index}
                    color={rec.type === 'urgent' ? 'danger' : rec.type === 'warning' ? 'warning' : 'success'}
                    className="d-flex justify-content-between align-items-center mb-2"
                  >
                    <div>
                      <strong>{rec.message}</strong>
                      <div className="small mt-1">{rec.action}</div>
                    </div>
                    <CButton
                      color={rec.type === 'urgent' ? 'danger' : rec.type === 'warning' ? 'warning' : 'success'}
                      size="sm"
                    >
                      Planifier
                    </CButton>
                  </CAlert>
                ))}
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}

      {/* Graphiques */}
      <CRow className="mb-4">
        <CCol md={6}>
          <CCard className="border-0 shadow-sm">
            <CCardHeader className="bg-white">
              <strong>Évolution des pannes</strong>
            </CCardHeader>
            <CCardBody>
              <CChartLine data={evolutionData} />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={6}>
          <CCard className="border-0 shadow-sm">
            <CCardHeader className="bg-white">
              <strong>Durée des réparations</strong>
            </CCardHeader>
            <CCardBody>
              <CChartBar data={dureeData} />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Historique des pannes */}
      <CRow>
        <CCol xs={12}>
          <CCard className="border-0 shadow-sm">
            <CCardHeader className="bg-white">
              <h5 className="mb-0">
                <CIcon icon={cilClock} className="me-2" />
                Historique des pannes ({pannes.length})
              </h5>
            </CCardHeader>
            <CCardBody>
              {pannes.length === 0 ? (
                <div className="text-center text-success py-4">
                  <CIcon icon={cilCheckCircle} size="3xl" className="mb-3" />
                  <p className="mb-0">Aucune panne enregistrée - Machine en excellent état</p>
                </div>
              ) : (
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Date</CTableHeaderCell>
                      <CTableHeaderCell>Type de panne</CTableHeaderCell>
                      <CTableHeaderCell>Durée réparation</CTableHeaderCell>
                      <CTableHeaderCell>Impact</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {pannes.map((panne, index) => (
                      <CTableRow key={index}>
                        <CTableDataCell>{panne.date}</CTableDataCell>
                        <CTableDataCell>
                          <CBadge
                            color={
                              panne.type_panne === 'Électrique'
                                ? 'warning'
                                : panne.type_panne === 'Mécanique'
                                ? 'danger'
                                : 'info'
                            }
                          >
                            {panne.type_panne}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <strong>{panne.duree_reparation}h</strong>
                        </CTableDataCell>
                        <CTableDataCell>
                          {panne.duree_reparation > 4 ? (
                            <CBadge color="danger">Élevé</CBadge>
                          ) : panne.duree_reparation > 2 ? (
                            <CBadge color="warning">Moyen</CBadge>
                          ) : (
                            <CBadge color="success">Faible</CBadge>
                          )}
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default MachineDetail
