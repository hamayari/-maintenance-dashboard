import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CBadge,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CFormSelect,
  CAlert,
  CSpinner,
  CButtonGroup,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTask, cilPlus, cilPencil, cilTrash, cilCheckCircle } from '@coreui/icons'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const ActionsCorrectives = () => {
  const [actions, setActions] = useState([])
  const [machines, setMachines] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  
  // Modal
  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentAction, setCurrentAction] = useState(null)
  
  // Filtres
  const [filtreStatut, setFiltreStatut] = useState('')
  const [filtrePriorite, setFiltrePriorite] = useState('')
  
  // Formulaire
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    machine_id: '',
    kpi_concerne: '',
    priorite: 'moyenne',
    assigne_a: '',
    date_echeance: '',
    commentaires: '',
  })

  useEffect(() => {
    loadData()
  }, [filtreStatut, filtrePriorite])

  const loadData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      let url = `${API_URL}/actions-correctives?`
      if (filtreStatut) url += `statut=${filtreStatut}&`
      if (filtrePriorite) url += `priorite=${filtrePriorite}&`
      
      const [actionsRes, machinesRes, statsRes] = await Promise.all([
        axios.get(url),
        axios.get(`${API_URL}/machines`),
        axios.get(`${API_URL}/actions-correctives/stats`),
      ])

      setActions(actionsRes.data)
      setMachines(machinesRes.data)
      setStats(statsRes.data)
      setError(null)
    } catch (err) {
      if (err.response?.status !== 404) {
        setError('Erreur lors du chargement des actions correctives')
      }
      setActions([])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (action = null) => {
    if (action) {
      setEditMode(true)
      setCurrentAction(action)
      setFormData({
        titre: action.titre,
        description: action.description,
        machine_id: action.machine_id || '',
        kpi_concerne: action.kpi_concerne || '',
        priorite: action.priorite,
        assigne_a: action.assigne_a || '',
        date_echeance: action.date_echeance || '',
        commentaires: action.commentaires || '',
      })
    } else {
      setEditMode(false)
      setCurrentAction(null)
      setFormData({
        titre: '',
        description: '',
        machine_id: '',
        kpi_concerne: '',
        priorite: 'moyenne',
        assigne_a: '',
        date_echeance: '',
        commentaires: '',
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditMode(false)
    setCurrentAction(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        setError('Vous devez être connecté')
        return
      }

      const payload = {
        ...formData,
        machine_id: formData.machine_id ? parseInt(formData.machine_id) : null,
      }

      if (editMode && currentAction) {
        await axios.put(`${API_URL}/actions-correctives/${currentAction.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setSuccess('Action corrective mise à jour avec succès')
      } else {
        await axios.post(`${API_URL}/actions-correctives`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setSuccess('Action corrective créée avec succès')
      }

      handleCloseModal()
      loadData()
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'enregistrement')
    }
  }

  const handleChangeStatut = async (actionId, nouveauStatut) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `${API_URL}/actions-correctives/${actionId}`,
        { statut: nouveauStatut },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSuccess('Statut mis à jour')
      loadData()
    } catch (err) {
      setError('Erreur lors de la mise à jour du statut')
    }
  }

  const handleDelete = async (actionId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette action corrective ?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API_URL}/actions-correctives/${actionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSuccess('Action corrective supprimée')
      loadData()
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la suppression')
    }
  }

  const getPrioriteColor = (priorite) => {
    switch (priorite) {
      case 'urgente': return 'danger'
      case 'haute': return 'warning'
      case 'moyenne': return 'info'
      case 'basse': return 'secondary'
      default: return 'secondary'
    }
  }

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'termine': return 'success'
      case 'en_cours': return 'primary'
      case 'planifie': return 'warning'
      case 'annule': return 'secondary'
      default: return 'secondary'
    }
  }

  const getStatutLabel = (statut) => {
    switch (statut) {
      case 'termine': return 'Terminé'
      case 'en_cours': return 'En cours'
      case 'planifie': return 'Planifié'
      case 'annule': return 'Annulé'
      default: return statut
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
        <p className="mt-3 text-muted">Chargement des actions correctives...</p>
      </div>
    )
  }

  return (
    <>
      {/* Statistiques */}
      {stats && (
        <CRow className="mb-4">
          <CCol md={2}>
            <CCard className="border-0 shadow-sm text-center">
              <CCardBody>
                <div className="fs-3 fw-bold text-primary">{stats.total}</div>
                <small className="text-muted">Total</small>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={2}>
            <CCard className="border-0 shadow-sm text-center">
              <CCardBody>
                <div className="fs-3 fw-bold text-warning">{stats.planifie}</div>
                <small className="text-muted">Planifiées</small>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={2}>
            <CCard className="border-0 shadow-sm text-center">
              <CCardBody>
                <div className="fs-3 fw-bold text-primary">{stats.en_cours}</div>
                <small className="text-muted">En cours</small>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={2}>
            <CCard className="border-0 shadow-sm text-center">
              <CCardBody>
                <div className="fs-3 fw-bold text-success">{stats.termine}</div>
                <small className="text-muted">Terminées</small>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={2}>
            <CCard className="border-0 shadow-sm text-center">
              <CCardBody>
                <div className="fs-3 fw-bold text-danger">{stats.urgente}</div>
                <small className="text-muted">Urgentes</small>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={2}>
            <CCard className="border-0 shadow-sm text-center">
              <CCardBody>
                <div className="fs-3 fw-bold text-info">{stats.taux_completion}%</div>
                <small className="text-muted">Complétées</small>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}

      {/* Messages */}
      {error && (
        <CAlert color="danger" dismissible onClose={() => setError(null)} className="mb-4">
          {error}
        </CAlert>
      )}
      {success && (
        <CAlert color="success" dismissible onClose={() => setSuccess(null)} className="mb-4">
          <CIcon icon={cilCheckCircle} className="me-2" />
          {success}
        </CAlert>
      )}

      {/* Liste des actions */}
      <CRow>
        <CCol xs={12}>
          <CCard className="border-0 shadow-sm">
            <CCardHeader className="bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="mb-0">
                    <CIcon icon={cilTask} className="me-2" />
                    Actions Correctives
                  </h4>
                </div>
                <CButton color="primary" onClick={() => handleOpenModal()}>
                  <CIcon icon={cilPlus} className="me-2" />
                  Nouvelle Action
                </CButton>
              </div>
            </CCardHeader>
            <CCardBody>
              {/* Filtres */}
              <CRow className="mb-4">
                <CCol md={4}>
                  <CFormLabel>Filtrer par statut</CFormLabel>
                  <CFormSelect
                    value={filtreStatut}
                    onChange={(e) => setFiltreStatut(e.target.value)}
                  >
                    <option value="">Tous les statuts</option>
                    <option value="planifie">Planifié</option>
                    <option value="en_cours">En cours</option>
                    <option value="termine">Terminé</option>
                    <option value="annule">Annulé</option>
                  </CFormSelect>
                </CCol>
                <CCol md={4}>
                  <CFormLabel>Filtrer par priorité</CFormLabel>
                  <CFormSelect
                    value={filtrePriorite}
                    onChange={(e) => setFiltrePriorite(e.target.value)}
                  >
                    <option value="">Toutes les priorités</option>
                    <option value="urgente">Urgente</option>
                    <option value="haute">Haute</option>
                    <option value="moyenne">Moyenne</option>
                    <option value="basse">Basse</option>
                  </CFormSelect>
                </CCol>
              </CRow>

              {/* Tableau */}
              {actions.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <CIcon icon={cilTask} size="3xl" className="mb-3 opacity-50" />
                  <h5>Aucune action corrective</h5>
                  <p>Créez votre première action corrective pour améliorer la performance</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <CTable hover>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Titre</CTableHeaderCell>
                        <CTableHeaderCell>Machine</CTableHeaderCell>
                        <CTableHeaderCell>KPI</CTableHeaderCell>
                        <CTableHeaderCell>Priorité</CTableHeaderCell>
                        <CTableHeaderCell>Statut</CTableHeaderCell>
                        <CTableHeaderCell>Assigné à</CTableHeaderCell>
                        <CTableHeaderCell>Échéance</CTableHeaderCell>
                        <CTableHeaderCell>Actions</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {actions.map((action) => (
                        <CTableRow key={action.id}>
                          <CTableDataCell>
                            <strong>{action.titre}</strong>
                            <br />
                            <small className="text-muted">{action.description.substring(0, 50)}...</small>
                          </CTableDataCell>
                          <CTableDataCell>
                            {action.machine_nom ? (
                              <CBadge color="secondary">{action.machine_nom}</CBadge>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </CTableDataCell>
                          <CTableDataCell>
                            {action.kpi_concerne ? (
                              <CBadge color="info">{action.kpi_concerne}</CBadge>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={getPrioriteColor(action.priorite)}>
                              {action.priorite}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CFormSelect
                              size="sm"
                              value={action.statut}
                              onChange={(e) => handleChangeStatut(action.id, e.target.value)}
                              style={{ width: '130px' }}
                            >
                              <option value="planifie">Planifié</option>
                              <option value="en_cours">En cours</option>
                              <option value="termine">Terminé</option>
                              <option value="annule">Annulé</option>
                            </CFormSelect>
                          </CTableDataCell>
                          <CTableDataCell>
                            {action.assigne_a || <span className="text-muted">Non assigné</span>}
                          </CTableDataCell>
                          <CTableDataCell>
                            {action.date_echeance || <span className="text-muted">-</span>}
                          </CTableDataCell>
                          <CTableDataCell>
                            <CButtonGroup size="sm">
                              <CButton
                                color="primary"
                                variant="ghost"
                                onClick={() => handleOpenModal(action)}
                              >
                                <CIcon icon={cilPencil} />
                              </CButton>
                              <CButton
                                color="danger"
                                variant="ghost"
                                onClick={() => handleDelete(action.id)}
                              >
                                <CIcon icon={cilTrash} />
                              </CButton>
                            </CButtonGroup>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Modal Créer/Modifier */}
      <CModal size="lg" visible={showModal} onClose={handleCloseModal}>
        <CModalHeader>
          <CModalTitle>
            {editMode ? 'Modifier l\'action corrective' : 'Nouvelle action corrective'}
          </CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmit}>
          <CModalBody>
            <CRow className="g-3">
              <CCol xs={12}>
                <CFormLabel>Titre *</CFormLabel>
                <CFormInput
                  name="titre"
                  value={formData.titre}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Réduire le temps de réparation"
                />
              </CCol>
              <CCol xs={12}>
                <CFormLabel>Description *</CFormLabel>
                <CFormTextarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  required
                  placeholder="Décrivez l'action corrective à mettre en place..."
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Machine concernée</CFormLabel>
                <CFormSelect name="machine_id" value={formData.machine_id} onChange={handleChange}>
                  <option value="">Aucune machine spécifique</option>
                  {machines.map((machine) => (
                    <option key={machine.id} value={machine.id}>
                      {machine.nom}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel>KPI concerné</CFormLabel>
                <CFormSelect name="kpi_concerne" value={formData.kpi_concerne} onChange={handleChange}>
                  <option value="">Sélectionner un KPI</option>
                  <option value="MTTR">MTTR</option>
                  <option value="MTBF">MTBF</option>
                  <option value="TRS">TRS</option>
                  <option value="nb_pannes">Nombre de pannes</option>
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel>Priorité *</CFormLabel>
                <CFormSelect name="priorite" value={formData.priorite} onChange={handleChange} required>
                  <option value="basse">Basse</option>
                  <option value="moyenne">Moyenne</option>
                  <option value="haute">Haute</option>
                  <option value="urgente">Urgente</option>
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel>Assigné à</CFormLabel>
                <CFormInput
                  name="assigne_a"
                  value={formData.assigne_a}
                  onChange={handleChange}
                  placeholder="Nom du technicien"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Date d'échéance</CFormLabel>
                <CFormInput
                  type="date"
                  name="date_echeance"
                  value={formData.date_echeance}
                  onChange={handleChange}
                />
              </CCol>
              <CCol xs={12}>
                <CFormLabel>Commentaires</CFormLabel>
                <CFormTextarea
                  name="commentaires"
                  value={formData.commentaires}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Commentaires additionnels..."
                />
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={handleCloseModal}>
              Annuler
            </CButton>
            <CButton color="primary" type="submit">
              {editMode ? 'Mettre à jour' : 'Créer'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </>
  )
}

export default ActionsCorrectives
