import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CAlert,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCheckCircle, cilSave, cilHistory } from '@coreui/icons'
import axios from 'axios'

const API_URL = 'http://localhost:5000/api'

const Objectifs = () => {
  const [objectifs, setObjectifs] = useState({
    mttr_cible: 5.0,
    mtbf_cible: 100.0,
    trs_cible: 85.0,
    taux_panne_cible: 10.0,
  })
  const [historique, setHistorique] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)
  const [showHistorique, setShowHistorique] = useState(false)

  useEffect(() => {
    loadObjectifs()
  }, [])

  const loadObjectifs = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      const [objRes, histRes] = await Promise.all([
        axios.get(`${API_URL}/objectifs`),
        axios.get(`${API_URL}/objectifs/historique`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      setObjectifs({
        mttr_cible: objRes.data.mttr_cible,
        mtbf_cible: objRes.data.mtbf_cible,
        trs_cible: objRes.data.trs_cible,
        taux_panne_cible: objRes.data.taux_panne_cible,
      })
      setHistorique(histRes.data)
      setError(null)
    } catch (err) {
      setError('Erreur lors du chargement des objectifs')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setObjectifs({
      ...objectifs,
      [name]: parseFloat(value) || 0,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        setError('Vous devez être connecté pour modifier les objectifs')
        setSaving(false)
        return
      }

      const response = await axios.post(`${API_URL}/objectifs`, objectifs, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      setSuccess('Objectifs mis à jour avec succès !')
      loadObjectifs() // Recharger pour mettre à jour l'historique
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Accès refusé. Seuls les administrateurs peuvent modifier les objectifs.')
      } else {
        setError(err.response?.data?.error || 'Erreur lors de la mise à jour des objectifs')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
        <p className="mt-3 text-muted">Chargement des objectifs...</p>
      </div>
    )
  }

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="border-0 shadow-sm mb-4">
            <CCardHeader className="bg-white border-bottom">
              <h4 className="mb-0">
                <CIcon icon={cilCheckCircle} className="me-2" />
                Configuration des Objectifs KPI
              </h4>
              <p className="text-muted mb-0 mt-2">
                Définissez les objectifs cibles pour chaque indicateur de performance
              </p>
            </CCardHeader>
            <CCardBody>
              {/* Messages */}
              {error && (
                <CAlert color="danger" dismissible onClose={() => setError(null)} className="mb-4">
                  <strong>Erreur :</strong> {error}
                </CAlert>
              )}

              {success && (
                <CAlert color="success" dismissible onClose={() => setSuccess(null)} className="mb-4">
                  <CIcon icon={cilCheckCircle} className="me-2" />
                  {success}
                </CAlert>
              )}

              {/* Formulaire */}
              <CForm onSubmit={handleSubmit}>
                <CRow className="g-4">
                  {/* MTTR */}
                  <CCol md={6}>
                    <CCard className="border h-100">
                      <CCardBody>
                        <div className="d-flex align-items-center mb-3">
                          <div
                            className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                            style={{ width: '50px', height: '50px' }}
                          >
                            <i className="bi bi-clock-history fs-4 text-primary"></i>
                          </div>
                          <div>
                            <h6 className="mb-0">MTTR Cible</h6>
                            <small className="text-muted">Temps Moyen de Réparation</small>
                          </div>
                        </div>
                        <CFormLabel htmlFor="mttr_cible" className="fw-semibold">
                          Objectif (heures)
                        </CFormLabel>
                        <CFormInput
                          type="number"
                          id="mttr_cible"
                          name="mttr_cible"
                          value={objectifs.mttr_cible}
                          onChange={handleChange}
                          step="0.1"
                          min="0"
                          required
                          size="lg"
                        />
                        <small className="text-muted">
                          ✓ Plus bas = meilleur (réparations rapides)
                        </small>
                      </CCardBody>
                    </CCard>
                  </CCol>

                  {/* MTBF */}
                  <CCol md={6}>
                    <CCard className="border h-100">
                      <CCardBody>
                        <div className="d-flex align-items-center mb-3">
                          <div
                            className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                            style={{ width: '50px', height: '50px' }}
                          >
                            <i className="bi bi-arrow-repeat fs-4 text-success"></i>
                          </div>
                          <div>
                            <h6 className="mb-0">MTBF Cible</h6>
                            <small className="text-muted">Temps Moyen Entre Pannes</small>
                          </div>
                        </div>
                        <CFormLabel htmlFor="mtbf_cible" className="fw-semibold">
                          Objectif (heures)
                        </CFormLabel>
                        <CFormInput
                          type="number"
                          id="mtbf_cible"
                          name="mtbf_cible"
                          value={objectifs.mtbf_cible}
                          onChange={handleChange}
                          step="0.1"
                          min="0"
                          required
                          size="lg"
                        />
                        <small className="text-muted">
                          ✓ Plus haut = meilleur (machines fiables)
                        </small>
                      </CCardBody>
                    </CCard>
                  </CCol>

                  {/* TRS */}
                  <CCol md={6}>
                    <CCard className="border h-100">
                      <CCardBody>
                        <div className="d-flex align-items-center mb-3">
                          <div
                            className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                            style={{ width: '50px', height: '50px' }}
                          >
                            <i className="bi bi-speedometer2 fs-4 text-info"></i>
                          </div>
                          <div>
                            <h6 className="mb-0">TRS Cible</h6>
                            <small className="text-muted">Taux de Rendement Synthétique</small>
                          </div>
                        </div>
                        <CFormLabel htmlFor="trs_cible" className="fw-semibold">
                          Objectif (%)
                        </CFormLabel>
                        <CFormInput
                          type="number"
                          id="trs_cible"
                          name="trs_cible"
                          value={objectifs.trs_cible}
                          onChange={handleChange}
                          step="0.1"
                          min="0"
                          max="100"
                          required
                          size="lg"
                        />
                        <small className="text-muted">
                          ✓ Plus haut = meilleur (performance optimale)
                        </small>
                      </CCardBody>
                    </CCard>
                  </CCol>

                  {/* Taux de panne */}
                  <CCol md={6}>
                    <CCard className="border h-100">
                      <CCardBody>
                        <div className="d-flex align-items-center mb-3">
                          <div
                            className="bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                            style={{ width: '50px', height: '50px' }}
                          >
                            <i className="bi bi-exclamation-triangle fs-4 text-danger"></i>
                          </div>
                          <div>
                            <h6 className="mb-0">Taux de Panne Cible</h6>
                            <small className="text-muted">Nombre Maximum de Pannes</small>
                          </div>
                        </div>
                        <CFormLabel htmlFor="taux_panne_cible" className="fw-semibold">
                          Objectif (nombre)
                        </CFormLabel>
                        <CFormInput
                          type="number"
                          id="taux_panne_cible"
                          name="taux_panne_cible"
                          value={objectifs.taux_panne_cible}
                          onChange={handleChange}
                          step="1"
                          min="0"
                          required
                          size="lg"
                        />
                        <small className="text-muted">
                          ✓ Plus bas = meilleur (moins de pannes)
                        </small>
                      </CCardBody>
                    </CCard>
                  </CCol>
                </CRow>

                {/* Boutons */}
                <CRow className="mt-4">
                  <CCol xs={12}>
                    <div className="d-flex gap-3">
                      <CButton
                        type="submit"
                        color="primary"
                        size="lg"
                        disabled={saving}
                        className="px-5"
                      >
                        {saving ? (
                          <>
                            <CSpinner size="sm" className="me-2" />
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            <CIcon icon={cilSave} className="me-2" />
                            Enregistrer les objectifs
                          </>
                        )}
                      </CButton>

                      <CButton
                        type="button"
                        color="secondary"
                        variant="outline"
                        size="lg"
                        onClick={() => setShowHistorique(!showHistorique)}
                      >
                        <CIcon icon={cilHistory} className="me-2" />
                        {showHistorique ? 'Masquer' : 'Voir'} l'historique
                      </CButton>
                    </div>
                  </CCol>
                </CRow>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Historique */}
      {showHistorique && historique.length > 0 && (
        <CRow>
          <CCol xs={12}>
            <CCard className="border-0 shadow-sm">
              <CCardHeader className="bg-white">
                <h5 className="mb-0">
                  <CIcon icon={cilHistory} className="me-2" />
                  Historique des Modifications
                </h5>
              </CCardHeader>
              <CCardBody>
                <div className="table-responsive">
                  <CTable hover>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Date</CTableHeaderCell>
                        <CTableHeaderCell>Modifié par</CTableHeaderCell>
                        <CTableHeaderCell>MTTR</CTableHeaderCell>
                        <CTableHeaderCell>MTBF</CTableHeaderCell>
                        <CTableHeaderCell>TRS</CTableHeaderCell>
                        <CTableHeaderCell>Taux Panne</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {historique.map((obj, index) => (
                        <CTableRow key={index}>
                          <CTableDataCell>
                            <small>{obj.updated_at}</small>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CBadge color="info">{obj.updated_by}</CBadge>
                          </CTableDataCell>
                          <CTableDataCell>{obj.mttr_cible}h</CTableDataCell>
                          <CTableDataCell>{obj.mtbf_cible}h</CTableDataCell>
                          <CTableDataCell>{obj.trs_cible}%</CTableDataCell>
                          <CTableDataCell>{obj.taux_panne_cible}</CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}

      {/* Info */}
      <CRow className="mt-4">
        <CCol xs={12}>
          <CAlert color="info" className="mb-0">
            <h6 className="alert-heading">
              <i className="bi bi-info-circle me-2"></i>
              À propos des objectifs
            </h6>
            <ul className="mb-0 small">
              <li>Les objectifs sont utilisés pour calculer les écarts de performance sur le dashboard</li>
              <li>Un code couleur indique si les objectifs sont atteints (vert), proches (orange) ou non atteints (rouge)</li>
              <li>Seuls les administrateurs peuvent modifier les objectifs</li>
              <li>L'historique conserve toutes les modifications pour traçabilité</li>
            </ul>
          </CAlert>
        </CCol>
      </CRow>
    </>
  )
}

export default Objectifs
