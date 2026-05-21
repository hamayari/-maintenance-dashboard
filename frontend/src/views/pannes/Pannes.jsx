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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilWarning, cilSearch, cilFilter, cilX, cilClock } from '@coreui/icons'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const Pannes = () => {
  const [pannes, setPannes] = useState([])
  const [machines, setMachines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterMachine, setFilterMachine] = useState('all')
  const [filterDuration, setFilterDuration] = useState('all')
  const [sortBy, setSortBy] = useState('date')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [pannesRes, machinesRes] = await Promise.all([
        axios.get(`${API_URL}/pannes`),
        axios.get(`${API_URL}/machines`)
      ])
      setPannes(pannesRes.data)
      setMachines(machinesRes.data)
      setError(null)
    } catch (err) {
      setError('Erreur lors du chargement des pannes')
    } finally {
      setLoading(false)
    }
  }

  const getTypeBadge = (type) => {
    const badges = {
      Électrique: 'warning',
      Mécanique: 'danger',
      Hydraulique: 'info',
      Pneumatique: 'primary',
    }
    return badges[type] || 'secondary'
  }

  const getDurationBadge = (duration) => {
    if (duration < 2) return 'success'
    if (duration < 4) return 'warning'
    return 'danger'
  }

  const getMachineName = (machineId) => {
    const machine = machines.find(m => m.id === machineId)
    return machine ? machine.nom : `Machine ${machineId}`
  }

  // Obtenir les types uniques
  const uniqueTypes = [...new Set(pannes.map(p => p.type_panne))]

  // Filtrer
  let filteredPannes = pannes.filter((panne) => {
    const machineName = getMachineName(panne.machine_id)
    const matchSearch = machineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       panne.type_panne.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (panne.description && panne.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchType = filterType === 'all' || panne.type_panne === filterType
    const matchMachine = filterMachine === 'all' || panne.machine_id === parseInt(filterMachine)
    
    let matchDuration = true
    if (filterDuration === 'short') matchDuration = panne.duree_reparation < 2
    else if (filterDuration === 'medium') matchDuration = panne.duree_reparation >= 2 && panne.duree_reparation < 4
    else if (filterDuration === 'long') matchDuration = panne.duree_reparation >= 4
    
    return matchSearch && matchType && matchMachine && matchDuration
  })

  // Trier
  filteredPannes = filteredPannes.sort((a, b) => {
    if (sortBy === 'date') return new Date(b.date_panne) - new Date(a.date_panne)
    if (sortBy === 'duration') return b.duree_reparation - a.duree_reparation
    if (sortBy === 'machine') return a.machine_id - b.machine_id
    return 0
  })

  const resetFilters = () => {
    setSearchTerm('')
    setFilterType('all')
    setFilterMachine('all')
    setFilterDuration('all')
    setSortBy('date')
  }

  const hasActiveFilters = searchTerm || filterType !== 'all' || filterMachine !== 'all' || filterDuration !== 'all' || sortBy !== 'date'

  // Statistiques
  const totalDuration = pannes.reduce((sum, p) => sum + p.duree_reparation, 0)
  const avgDuration = pannes.length > 0 ? (totalDuration / pannes.length).toFixed(2) : 0
  const criticalPannes = pannes.filter(p => p.duree_reparation >= 4).length

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
              <h4 className="mb-3">Aucune panne enregistrée</h4>
              <p className="text-muted mb-4">
                Importez un fichier Excel contenant l'historique des pannes
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
            <CCard className="border-0 shadow-sm bg-danger text-white">
              <CCardBody>
                <div className="fs-4 fw-semibold">{pannes.length}</div>
                <div className="small">Total Pannes</div>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol sm={6} lg={3}>
            <CCard className="border-0 shadow-sm bg-warning text-white">
              <CCardBody>
                <div className="fs-4 fw-semibold">{avgDuration}h</div>
                <div className="small">Durée Moyenne</div>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol sm={6} lg={3}>
            <CCard className="border-0 shadow-sm bg-info text-white">
              <CCardBody>
                <div className="fs-4 fw-semibold">{totalDuration}h</div>
                <div className="small">Temps Arrêt Total</div>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol sm={6} lg={3}>
            <CCard className="border-0 shadow-sm bg-dark text-white">
              <CCardBody>
                <div className="fs-4 fw-semibold">{criticalPannes}</div>
                <div className="small">Pannes Critiques (≥4h)</div>
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
                  <CIcon icon={cilWarning} className="me-2" />
                  Historique des Pannes
                </strong>
                <CBadge color="danger" className="ms-2">
                  {filteredPannes.length} / {pannes.length}
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
              <CCol md={3}>
                <label className="form-label small text-muted mb-1">
                  <CIcon icon={cilSearch} className="me-1" />
                  Rechercher
                </label>
                <CInputGroup>
                  <CInputGroupText>
                    <CIcon icon={cilSearch} />
                  </CInputGroupText>
                  <CFormInput
                    placeholder="Machine, type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </CInputGroup>
              </CCol>
              <CCol md={2}>
                <label className="form-label small text-muted mb-1">
                  <CIcon icon={cilFilter} className="me-1" />
                  Type de panne
                </label>
                <CFormSelect
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">Tous</option>
                  {uniqueTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={2}>
                <label className="form-label small text-muted mb-1">
                  <CIcon icon={cilFilter} className="me-1" />
                  Machine
                </label>
                <CFormSelect
                  value={filterMachine}
                  onChange={(e) => setFilterMachine(e.target.value)}
                >
                  <option value="all">Toutes</option>
                  {machines.map(machine => (
                    <option key={machine.id} value={machine.id}>{machine.nom}</option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={2}>
                <label className="form-label small text-muted mb-1">
                  <CIcon icon={cilClock} className="me-1" />
                  Durée
                </label>
                <CFormSelect
                  value={filterDuration}
                  onChange={(e) => setFilterDuration(e.target.value)}
                >
                  <option value="all">Toutes</option>
                  <option value="short">Courte (&lt;2h)</option>
                  <option value="medium">Moyenne (2-4h)</option>
                  <option value="long">Longue (≥4h)</option>
                </CFormSelect>
              </CCol>
              <CCol md={3}>
                <label className="form-label small text-muted mb-1">Trier par</label>
                <CFormSelect
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date">Date (récent)</option>
                  <option value="duration">Durée</option>
                  <option value="machine">Machine</option>
                </CFormSelect>
              </CCol>
            </CRow>

            {filteredPannes.length === 0 ? (
              <div className="text-center text-muted py-5">
                <CIcon icon={cilWarning} size="3xl" className="mb-3 opacity-50" />
                <p className="mb-0">Aucune panne ne correspond aux critères</p>
              </div>
            ) : (
              <div className="table-responsive">
                <CTable hover align="middle" className="mb-0">
                  <CTableHead className="table-light">
                    <CTableRow>
                      <CTableHeaderCell>Machine</CTableHeaderCell>
                      <CTableHeaderCell>Date</CTableHeaderCell>
                      <CTableHeaderCell>Type de Panne</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Durée</CTableHeaderCell>
                      <CTableHeaderCell>Technicien</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">Coût</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {filteredPannes.map((panne, index) => (
                      <CTableRow key={index} style={{ transition: 'background-color 0.2s' }}>
                        <CTableDataCell>
                          <div className="d-flex align-items-center">
                            <div className={`rounded-circle bg-${getDurationBadge(panne.duree_reparation)} me-2`} 
                                 style={{ width: '8px', height: '8px' }}></div>
                            <strong>{getMachineName(panne.machine_id)}</strong>
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <small className="text-muted">{panne.date_panne}</small>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={getTypeBadge(panne.type_panne)} className="px-2">
                            {panne.type_panne}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CBadge color={getDurationBadge(panne.duree_reparation)} className="px-2">
                            {panne.duree_reparation}h
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <small>{panne.technicien || 'Non assigné'}</small>
                        </CTableDataCell>
                        <CTableDataCell className="text-end">
                          <strong>{panne.cout_reparation ? `${panne.cout_reparation} DT` : '-'}</strong>
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

export default Pannes
