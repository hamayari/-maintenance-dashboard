import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CAlert,
  CBadge,
  CButton,
  CListGroup,
  CListGroupItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBell, cilWarning, cilCheckCircle, cilClock } from '@coreui/icons'
import axios from 'axios'

const API_URL = 'http://localhost:5000/api'

const Alertes = () => {
  const [kpi, setKpi] = useState(null)
  const [criticalMachines, setCriticalMachines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    try {
      setLoading(true)
      const [kpiRes, criticalRes] = await Promise.all([
        axios.get(`${API_URL}/kpi`),
        axios.get(`${API_URL}/analytics/critical`),
      ])

      setKpi(kpiRes.data)
      setCriticalMachines(criticalRes.data)
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
              <CIcon icon={cilBell} size="3xl" className="text-muted mb-3" />
              <h4 className="mb-3">Aucune alerte disponible</h4>
              <p className="text-muted mb-4">
                Importez des données pour commencer à recevoir des alertes
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

  // Générer les alertes basées sur les KPI
  const generateAlerts = () => {
    const alerts = []

    // Alertes critiques (machines)
    criticalMachines.forEach((machine) => {
      if (machine.nb_pannes > 8) {
        alerts.push({
          type: 'danger',
          priority: 'URGENT',
          icon: cilWarning,
          title: `${machine.machine.nom} - État critique`,
          message: `${machine.nb_pannes} pannes enregistrées. Intervention immédiate requise.`,
          action: 'Planifier maintenance d\'urgence',
          link: `/machines/${machine.machine.id}`,
          time: 'Maintenant',
        })
      } else if (machine.nb_pannes > 5) {
        alerts.push({
          type: 'warning',
          priority: 'Élevée',
          icon: cilWarning,
          title: `${machine.machine.nom} - Attention requise`,
          message: `${machine.nb_pannes} pannes détectées. Maintenance préventive recommandée.`,
          action: 'Planifier maintenance',
          link: `/machines/${machine.machine.id}`,
          time: 'Aujourd\'hui',
        })
      }
    })

    // Alertes KPI
    if (kpi.mttr > 5) {
      alerts.push({
        type: 'warning',
        priority: 'Moyenne',
        icon: cilClock,
        title: 'MTTR élevé détecté',
        message: `Temps moyen de réparation: ${kpi.mttr}h. Former les techniciens recommandé.`,
        action: 'Voir détails',
        link: '/dashboard',
        time: 'Il y a 1h',
      })
    }

    if (kpi.mtbf < 50) {
      alerts.push({
        type: 'danger',
        priority: 'URGENT',
        icon: cilWarning,
        title: 'Fiabilité critique',
        message: `MTBF très bas: ${kpi.mtbf}h. Équipements instables.`,
        action: 'Analyser',
        link: '/analytics',
        time: 'Il y a 30min',
      })
    }

    if (kpi.trs < 70) {
      alerts.push({
        type: 'warning',
        priority: 'Élevée',
        icon: cilWarning,
        title: 'TRS sous le seuil',
        message: `Taux de rendement: ${kpi.trs}%. Performance à améliorer.`,
        action: 'Voir dashboard',
        link: '/dashboard',
        time: 'Il y a 2h',
      })
    }

    // Si aucune alerte critique
    if (alerts.length === 0) {
      alerts.push({
        type: 'success',
        priority: 'Info',
        icon: cilCheckCircle,
        title: 'Système opérationnel',
        message: 'Toutes les machines fonctionnent normalement. Aucune intervention requise.',
        action: 'Voir dashboard',
        link: '/dashboard',
        time: 'Maintenant',
      })
    }

    return alerts.sort((a, b) => {
      const priorityOrder = { URGENT: 0, Élevée: 1, Moyenne: 2, Info: 3 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }

  const alerts = generateAlerts()
  const urgentCount = alerts.filter((a) => a.priority === 'URGENT').length
  const warningCount = alerts.filter((a) => a.priority === 'Élevée').length

  return (
    <>
      {/* Résumé des alertes */}
      <CRow className="mb-4">
        <CCol md={4}>
          <CCard className="border-0 shadow-sm border-start border-danger border-4">
            <CCardBody className="text-center">
              <div className="fs-2 fw-bold text-danger">{urgentCount}</div>
              <div className="text-muted">Alertes urgentes</div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={4}>
          <CCard className="border-0 shadow-sm border-start border-warning border-4">
            <CCardBody className="text-center">
              <div className="fs-2 fw-bold text-warning">{warningCount}</div>
              <div className="text-muted">Alertes importantes</div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={4}>
          <CCard className="border-0 shadow-sm border-start border-success border-4">
            <CCardBody className="text-center">
              <div className="fs-2 fw-bold text-success">{alerts.length}</div>
              <div className="text-muted">Total alertes</div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Liste des alertes */}
      <CRow>
        <CCol xs={12}>
          <CCard className="border-0 shadow-sm">
            <CCardHeader className="bg-white">
              <h5 className="mb-0">
                <CIcon icon={cilBell} className="me-2" />
                Alertes et Notifications
                {urgentCount > 0 && (
                  <CBadge color="danger" className="ms-2">
                    {urgentCount} urgentes
                  </CBadge>
                )}
              </h5>
            </CCardHeader>
            <CCardBody className="p-0">
              <CListGroup flush>
                {alerts.map((alert, index) => (
                  <CListGroupItem key={index} className="border-0 border-bottom">
                    <div className="d-flex align-items-start">
                      <div
                        className={`bg-${alert.type} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0`}
                        style={{ width: '50px', height: '50px' }}
                      >
                        <CIcon icon={alert.icon} size="lg" className={`text-${alert.type}`} />
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h6 className="mb-1">
                              {alert.title}
                              <CBadge
                                color={
                                  alert.priority === 'URGENT'
                                    ? 'danger'
                                    : alert.priority === 'Élevée'
                                    ? 'warning'
                                    : alert.priority === 'Moyenne'
                                    ? 'info'
                                    : 'success'
                                }
                                className="ms-2"
                              >
                                {alert.priority}
                              </CBadge>
                            </h6>
                            <p className="text-muted mb-2">{alert.message}</p>
                          </div>
                          <small className="text-muted">{alert.time}</small>
                        </div>
                        <CButton
                          color={alert.type}
                          size="sm"
                          variant="outline"
                          href={`/#${alert.link}`}
                        >
                          {alert.action}
                        </CButton>
                      </div>
                    </div>
                  </CListGroupItem>
                ))}
              </CListGroup>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Paramètres d'alertes */}
      <CRow className="mt-4">
        <CCol xs={12}>
          <CCard className="border-0 shadow-sm">
            <CCardHeader className="bg-white">
              <h6 className="mb-0">
                <i className="bi bi-gear me-2"></i>
                Paramètres des alertes
              </h6>
            </CCardHeader>
            <CCardBody>
              <CAlert color="info" className="mb-0">
                <h6 className="alert-heading">Seuils d'alerte configurés</h6>
                <ul className="mb-0 small">
                  <li>
                    <strong>Machines critiques :</strong> Plus de 5 pannes
                  </li>
                  <li>
                    <strong>MTTR élevé :</strong> Supérieur à 5 heures
                  </li>
                  <li>
                    <strong>MTBF faible :</strong> Inférieur à 50 heures
                  </li>
                  <li>
                    <strong>TRS critique :</strong> Inférieur à 70%
                  </li>
                </ul>
              </CAlert>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Alertes
