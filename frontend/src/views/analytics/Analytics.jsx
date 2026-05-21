import React, { useState, useEffect } from 'react'
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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilChartLine, cilWarning, cilCheckCircle } from '@coreui/icons'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const Analytics = () => {
  const [criticalMachines, setCriticalMachines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/analytics/critical`)
      setCriticalMachines(response.data)
      setError(null)
    } catch (err) {
      setError('Erreur lors du chargement des analytics')
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
          <CCard className="text-center">
            <CCardBody className="py-5">
              <CIcon icon={cilChartLine} size="3xl" className="text-info mb-3" />
              <h4 className="mb-3">Analyse non disponible</h4>
              <p className="text-muted mb-4">
                Importez des données pour générer l'analyse des machines critiques
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

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>
              <CIcon icon={cilChartLine} className="me-2" />
              Analyse des Machines Critiques
            </strong>
            <CBadge color="danger" className="ms-2">
              {criticalMachines.length}
            </CBadge>
          </CCardHeader>
          <CCardBody>
            {criticalMachines.length === 0 ? (
              <div className="text-center text-success py-5">
                <CIcon icon={cilCheckCircle} size="3xl" className="mb-3" />
                <h5>Aucune machine critique détectée</h5>
                <p className="text-muted">Toutes les machines fonctionnent normalement</p>
              </div>
            ) : (
              <>
                <CAlert color="warning" className="mb-4">
                  <CIcon icon={cilWarning} className="me-2" />
                  <strong>{criticalMachines.length} machine(s)</strong> nécessitent une attention
                  immédiate
                </CAlert>

                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Machine</CTableHeaderCell>
                      <CTableHeaderCell>Type</CTableHeaderCell>
                      <CTableHeaderCell>Nb Pannes</CTableHeaderCell>
                      <CTableHeaderCell>MTTR (h)</CTableHeaderCell>
                      <CTableHeaderCell>Temps Arrêt Total (h)</CTableHeaderCell>
                      <CTableHeaderCell>Recommandation</CTableHeaderCell>
                      <CTableHeaderCell>Action</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {criticalMachines.map((item, index) => (
                      <CTableRow key={index}>
                        <CTableDataCell>
                          <strong>{item.machine.nom}</strong>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color="secondary">{item.machine.type}</CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color="danger">{item.nb_pannes}</CBadge>
                        </CTableDataCell>
                        <CTableDataCell>{item.mttr}</CTableDataCell>
                        <CTableDataCell>
                          <CBadge color="warning">{item.temps_arret_total}</CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <small className="text-warning">
                            <CIcon icon={cilWarning} className="me-1" />
                            {item.recommandation}
                          </small>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            color="primary"
                            size="sm"
                            href={`/#/machines/${item.machine.id}`}
                          >
                            Détails
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Analytics
