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
  CFormSelect,
  CAlert,
  CSpinner,
  CButtonGroup,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPeople, cilPlus, cilPencil, cilTrash, cilCheckCircle, cilSearch } from '@coreui/icons'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const Users = () => {
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  
  // Modal
  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  
  // Filtres
  const [filtreRole, setFiltreRole] = useState('')
  const [search, setSearch] = useState('')
  
  // Formulaire
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    role: 'technicien',
  })

  useEffect(() => {
    loadData()
  }, [filtreRole, search])

  const loadData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      if (!token) {
        setError('Vous devez être connecté')
        setLoading(false)
        return
      }

      let url = `${API_URL}/users?`
      if (filtreRole) url += `role=${filtreRole}&`
      if (search) url += `search=${search}&`
      
      const [usersRes, statsRes] = await Promise.all([
        axios.get(url, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/users/stats`, { headers: { Authorization: `Bearer ${token}` } }),
      ])

      setUsers(usersRes.data)
      setStats(statsRes.data)
      setError(null)
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Accès refusé. Cette page est réservée aux administrateurs.')
      } else {
        setError('Erreur lors du chargement des utilisateurs')
      }
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditMode(true)
      setCurrentUser(user)
      setFormData({
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        password: '',
        role: user.role,
      })
    } else {
      setEditMode(false)
      setCurrentUser(null)
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        password: '',
        role: 'technicien',
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditMode(false)
    setCurrentUser(null)
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

      if (editMode && currentUser) {
        // Mise à jour
        const payload = { ...formData }
        if (!payload.password) {
          delete payload.password // Ne pas envoyer le mot de passe s'il est vide
        }
        
        await axios.put(`${API_URL}/users/${currentUser.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setSuccess('Utilisateur mis à jour avec succès')
      } else {
        // Création
        await axios.post(`${API_URL}/users`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setSuccess('Utilisateur créé avec succès')
      }

      handleCloseModal()
      loadData()
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'enregistrement')
    }
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSuccess('Utilisateur supprimé avec succès')
      loadData()
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la suppression')
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'danger'
      case 'superviseur': return 'warning'
      case 'technicien': return 'info'
      default: return 'secondary'
    }
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Administrateur'
      case 'superviseur': return 'Superviseur'
      case 'technicien': return 'Technicien'
      default: return role
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
        <p className="mt-3 text-muted">Chargement des utilisateurs...</p>
      </div>
    )
  }

  if (error && !stats) {
    return (
      <CRow>
        <CCol xs={12}>
          <CAlert color="danger">
            <h5 className="alert-heading">Accès refusé</h5>
            <p>{error}</p>
          </CAlert>
        </CCol>
      </CRow>
    )
  }

  return (
    <>
      {/* Statistiques */}
      {stats && (
        <CRow className="mb-4">
          <CCol md={3}>
            <CCard className="border-0 shadow-sm text-center">
              <CCardBody>
                <div className="fs-3 fw-bold text-primary">{stats.total}</div>
                <small className="text-muted">Total Utilisateurs</small>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={3}>
            <CCard className="border-0 shadow-sm text-center">
              <CCardBody>
                <div className="fs-3 fw-bold text-danger">{stats.admins}</div>
                <small className="text-muted">Administrateurs</small>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={3}>
            <CCard className="border-0 shadow-sm text-center">
              <CCardBody>
                <div className="fs-3 fw-bold text-warning">{stats.superviseurs}</div>
                <small className="text-muted">Superviseurs</small>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={3}>
            <CCard className="border-0 shadow-sm text-center">
              <CCardBody>
                <div className="fs-3 fw-bold text-info">{stats.techniciens}</div>
                <small className="text-muted">Techniciens</small>
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

      {/* Liste des utilisateurs */}
      <CRow>
        <CCol xs={12}>
          <CCard className="border-0 shadow-sm">
            <CCardHeader className="bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="mb-0">
                    <CIcon icon={cilPeople} className="me-2" />
                    Gestion des Utilisateurs
                  </h4>
                </div>
                <CButton color="primary" onClick={() => handleOpenModal()}>
                  <CIcon icon={cilPlus} className="me-2" />
                  Nouvel Utilisateur
                </CButton>
              </div>
            </CCardHeader>
            <CCardBody>
              {/* Filtres */}
              <CRow className="mb-4">
                <CCol md={6}>
                  <CFormLabel>Rechercher</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilSearch} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Nom, prénom ou email..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </CInputGroup>
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Filtrer par rôle</CFormLabel>
                  <CFormSelect
                    value={filtreRole}
                    onChange={(e) => setFiltreRole(e.target.value)}
                  >
                    <option value="">Tous les rôles</option>
                    <option value="admin">Administrateur</option>
                    <option value="superviseur">Superviseur</option>
                    <option value="technicien">Technicien</option>
                  </CFormSelect>
                </CCol>
              </CRow>

              {/* Tableau */}
              {users.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <CIcon icon={cilPeople} size="3xl" className="mb-3 opacity-50" />
                  <h5>Aucun utilisateur trouvé</h5>
                </div>
              ) : (
                <div className="table-responsive">
                  <CTable hover>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Nom Complet</CTableHeaderCell>
                        <CTableHeaderCell>Email</CTableHeaderCell>
                        <CTableHeaderCell>Rôle</CTableHeaderCell>
                        <CTableHeaderCell>Date Création</CTableHeaderCell>
                        <CTableHeaderCell>Actions</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {users.map((user) => (
                        <CTableRow key={user.id}>
                          <CTableDataCell>
                            <strong>{user.prenom} {user.nom}</strong>
                          </CTableDataCell>
                          <CTableDataCell>{user.email}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={getRoleColor(user.role)}>
                              {getRoleLabel(user.role)}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            <small className="text-muted">{user.created_at}</small>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CButtonGroup size="sm">
                              <CButton
                                color="primary"
                                variant="ghost"
                                onClick={() => handleOpenModal(user)}
                              >
                                <CIcon icon={cilPencil} />
                              </CButton>
                              <CButton
                                color="danger"
                                variant="ghost"
                                onClick={() => handleDelete(user.id)}
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
            {editMode ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
          </CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmit}>
          <CModalBody>
            <CRow className="g-3">
              <CCol md={6}>
                <CFormLabel>Prénom *</CFormLabel>
                <CFormInput
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Mohamed"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Nom *</CFormLabel>
                <CFormInput
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Ben Ali"
                />
              </CCol>
              <CCol xs={12}>
                <CFormLabel>Email *</CFormLabel>
                <CFormInput
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="exemple@email.com"
                />
              </CCol>
              <CCol xs={12}>
                <CFormLabel>
                  Mot de passe {editMode && '(laisser vide pour ne pas changer)'}
                </CFormLabel>
                <CFormInput
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!editMode}
                  placeholder={editMode ? 'Nouveau mot de passe' : 'Mot de passe'}
                />
              </CCol>
              <CCol xs={12}>
                <CFormLabel>Rôle *</CFormLabel>
                <CFormSelect name="role" value={formData.role} onChange={handleChange} required>
                  <option value="technicien">Technicien</option>
                  <option value="superviseur">Superviseur</option>
                  <option value="admin">Administrateur</option>
                </CFormSelect>
                <small className="text-muted">
                  <strong>Technicien:</strong> Lecture seule | 
                  <strong> Superviseur:</strong> Lecture + Rapports | 
                  <strong> Admin:</strong> Accès complet
                </small>
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

export default Users
