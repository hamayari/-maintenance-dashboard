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
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CFormSelect,
  CButtonGroup,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilSettings, cilWarning, cilFilter, cilX } from '@coreui/icons'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const Machines = () => {
  const [machines, setMachines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('nom')

  useEffect(() => {
    loadMachines()
  }, [])

  const loadMachines = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/machines`)
      setMachines(response.data)
      setError(null)
    } catch (err) {
      setError('Erreur lors du chargement des machines')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (statut) => {
    const badges = {
      normal: 'success',
      warning: 'warning',
      critique: 'danger',
    }
    return badges[statut] || 'secondary'
  }

  const getStatusLabel = (statut) => {
    const labels = {
      normal: 'Normal',
      warning: 'Attention',
      critique: 'Critique',
    }
    return labels[statut] || statut
  }

  // Obtenir les types uniques
  const uniqueTypes = [...new Set(machines.map(m => m.type))]

  // Filtrer et trier
  let filteredMachines = machines.filter((machine) => {
    const matchSearch = machine.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       machine.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchType = filterType === 'all' || machine.type === filterType
    const matchStatus = filterStatus === 'all' || machine.statut === filterStatus
    
    return matchSearch && matchType && matchStatus
  })

  // Trier
  filteredMachines = filteredMachines.sort((a, b) => {
    if (sortBy === 'nom') return a.nom.localeCompare(b.nom)
    if (sortBy === 'pannes') return b.nb_pannes - a.nb_pannes
    if (sortBy === 'type') return a.type.localeCompare(b.type)
    return 0
  })

  const resetFilters = () => {
    setSearchTerm('')
    setFilterType('all')
    setFilterStatus('all')
    setSortBy('nom')
  }

  const hasActiveFilters = searchTerm || filterType !== 'all' || filterStatus !== 'all' || sortBy !== 'nom'

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
              <h4 className="mb-3">Aucune machine enregistrée</h4>
              <p className="text-muted mb-4">
                Importez un fichier Excel contenant vos machines pour commencer
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
        {/* Statistiques rapides */}
        <CRow className="mb-4">
          <CCol sm={6} lg={3}>
            <CCard className="border-0 shadow-sm bg-primary text-white">
              <CCardBody>
                <div className="fs-4 fw-semibold">{machines.length}</div>
                <div className="small">Total Machines</div>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol sm={6} lg={3}>
            <CCard className="border-0 shadow-sm bg-success text-white">
              <CCardBody>
                <div className="fs-4 fw-semibold">{machines.filter(m => m.statut === 'normal').length}</div>
                <div className="small">Machines Normales</div>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol sm={6} lg={3}>
            <CCard className="border-0 shadow-sm bg-warning text-white">
              <CCardBody>
                <div className="fs-4 fw-semibold">{machines.filter(m => m.statut === 'warning').length}</div>
                <div className="small">Attention Requise</div>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol sm={6} lg={3}>
            <CCard className="border-0 shadow-sm bg-danger text-white">
              <CCardBody>
                <div className="fs-4 fw-semibold">{machines.filter(m => m.statut === 'critique').length}</div>
                <div className="small">Machines Critiques</div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

        {/* Tableau avec filtres */}
        <CCard className="border-0 shadow-sm">
          <CCardHeader className="bg-white border-bottom">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>
                  <CIcon icon={cilSettings} className="me-2" />
                  Liste des Machines
                </strong>
                <CBadge color="info" className="ms-2">
                  {filteredMachines.length} / {machines.length}
                </CBadge>
              </div>
              {hasActiveFilters && (
                <CButton color="light" size="sm" onClick={resetFilters}>
                  <CIcon icon={cilX} className="me-1" />
                  Réinitialiser filtres
                </CButton>
              )}
            </div>
          </CCardHeader>
          <CCardBody>
            {/* Filtres */}
            <CRow className="mb-4 g-3">
              <CCol md={4}>
                <label className="form-label small text-muted mb-1">
                  <CIcon icon={cilSearch} className="me-1" />
                  Rechercher
                </label>
                <CInputGroup>
                  <CInputGroupText>
                    <CIcon icon={cilSearch} />
                  </CInputGroupText>
                  <CFormInput
                    placeholder="Nom ou type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </CInputGroup>
              </CCol>
              <CCol md={3}>
                <label className="form-label small text-muted mb-1">
                  <CIcon icon={cilFilter} className="me-1" />
                  Type de machine
                </label>
                <CFormSelect
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">Tous les types</option>
                  {uniqueTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={3}>
                <label className="form-label small text-muted mb-1">
                  <CIcon icon={cilFilter} className="me-1" />
                  Statut
                </label>
                <CFormSelect
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="normal">Normal</option>
                  <option value="warning">Attention</option>
                  <option value="critique">Critique</option>
                </CFormSelect>
              </CCol>
              <CCol md={2}>
                <label className="form-label small text-muted mb-1">Trier par</label>
                <CFormSelect
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="nom">Nom</option>
                  <option value="type">Type</option>
                  <option value="pannes">Pannes</option>
                </CFormSelect>
              </CCol>
            </CRow>

            {filteredMachines.length === 0 ? (
              <div className="text-center text-muted py-5">
                <CIcon icon={cilSettings} size="3xl" className="mb-3 opacity-50" />
                <p className="mb-0">Aucune machine ne correspond aux critères</p>
              </div>
            ) : (
              <div className="table-responsive">
                <CTable hover align="middle" className="mb-0">
                  <CTableHead className="table-light">
                    <CTableRow>
                      <CTableHeaderCell>Machine</CTableHeaderCell>
                      <CTableHeaderCell>Type</CTableHeaderCell>
                      <CTableHeaderCell>Localisation</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Pannes</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Statut</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {filteredMachines.map((machine) => (
                      <CTableRow key={machine.id} style={{ transition: 'background-color 0.2s' }}>
                        <CTableDataCell>
                          <div className="d-flex align-items-center">
                            <div className={`rounded-circle bg-${getStatusBadge(machine.statut)} me-2`} 
                                 style={{ width: '8px', height: '8px' }}></div>
                            <strong>{machine.nom}</strong>
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color="secondary" className="px-2">{machine.type}</CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <small className="text-muted">{machine.localisation || 'Non spécifié'}</small>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CBadge 
                            color={machine.nb_pannes > 5 ? 'danger' : machine.nb_pannes > 3 ? 'warning' : 'info'}
                            className="px-2"
                          >
                            {machine.nb_pannes}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CBadge color={getStatusBadge(machine.statut)} className="px-2">
                            {getStatusLabel(machine.statut)}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CButton
                            color="primary"
                            size="sm"
                            href={`/#/machines/${machine.id}`}
                          >
                            Détails
                          </CButton>
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
  )
}

export default Machines
