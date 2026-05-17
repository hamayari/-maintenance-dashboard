import React, { useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CForm,
  CFormInput,
  CAlert,
  CProgress,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCloudUpload, cilCheckCircle, cilWarning, cilCloudDownload } from '@coreui/icons'
import axios from 'axios'

const API_URL = 'http://localhost:5000/api'

const ImportExcel = () => {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (
        selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        selectedFile.type === 'application/vnd.ms-excel'
      ) {
        setFile(selectedFile)
        setError(null)
      } else {
        setError('Format non supporté. Utilisez un fichier Excel (.xlsx)')
        setFile(null)
      }
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Sélectionnez un fichier avant d\'importer')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploading(true)
      setError(null)
      setSuccess(null)
      setUploadProgress(0)

      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percentCompleted)
        },
      })

      setSuccess(response.data)
      setFile(null)
      document.getElementById('fileInput').value = ''
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Erreur lors de l\'importation'
      setError(errorMsg)
    } finally {
      setUploading(false)
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="bg-white border-bottom-0 pb-0">
            <h4 className="mb-2">
              <CIcon icon={cilCloudUpload} className="me-2" />
              Import des données de maintenance
            </h4>
            <p className="text-muted mb-3">
              Importez votre fichier pour analyser les performances des machines et détecter les pannes
            </p>
          </CCardHeader>
          <CCardBody>
            {/* Étapes visuelles */}
            <CRow className="mb-4 text-center">
              <CCol xs={6} md={3}>
                <div className="p-3">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '60px', height: '60px' }}>
                    <CIcon icon={cilCloudDownload} size="xl" className="text-primary" />
                  </div>
                  <div className="fw-semibold">1. Télécharger</div>
                  <small className="text-muted">Fichier modèle</small>
                </div>
              </CCol>
              <CCol xs={6} md={3}>
                <div className="p-3">
                  <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '60px', height: '60px' }}>
                    <i className="bi bi-pencil-square fs-4 text-info"></i>
                  </div>
                  <div className="fw-semibold">2. Remplir</div>
                  <small className="text-muted">Vos données</small>
                </div>
              </CCol>
              <CCol xs={6} md={3}>
                <div className="p-3">
                  <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '60px', height: '60px' }}>
                    <CIcon icon={cilCloudUpload} size="xl" className="text-warning" />
                  </div>
                  <div className="fw-semibold">3. Importer</div>
                  <small className="text-muted">Le fichier</small>
                </div>
              </CCol>
              <CCol xs={6} md={3}>
                <div className="p-3">
                  <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '60px', height: '60px' }}>
                    <i className="bi bi-graph-up fs-4 text-success"></i>
                  </div>
                  <div className="fw-semibold">4. Analyser</div>
                  <small className="text-muted">Les résultats</small>
                </div>
              </CCol>
            </CRow>

            <hr className="my-4" />

            {/* Télécharger modèle */}
            <div className="mb-4">
              <h5 className="mb-3">Fichier modèle</h5>
              <p className="text-muted mb-3">
                Téléchargez le fichier modèle pré-formaté pour faciliter l'import de vos données
              </p>
              <CButton color="primary" variant="outline" href="/exemple_maintenance.xlsx" download>
                <CIcon icon={cilCloudDownload} className="me-2" />
                Télécharger le modèle Excel
              </CButton>
            </div>

            <hr className="my-4" />

            {/* Upload fichier */}
            <div className="mb-4">
              <h5 className="mb-3">Importer vos données</h5>
              <CForm>
                <CRow className="align-items-end">
                  <CCol md={8}>
                    <CFormInput
                      type="file"
                      id="fileInput"
                      accept=".xlsx,.xls"
                      onChange={handleFileChange}
                      disabled={uploading}
                      size="lg"
                    />
                    {file && (
                      <div className="mt-2">
                        <CBadge color="success" className="me-2">
                          <CIcon icon={cilCheckCircle} className="me-1" />
                          Fichier prêt
                        </CBadge>
                        <span className="text-muted">{file.name} ({(file.size / 1024).toFixed(0)} KB)</span>
                      </div>
                    )}
                  </CCol>
                  <CCol md={4}>
                    <CButton
                      color="success"
                      size="lg"
                      className="w-100"
                      onClick={handleUpload}
                      disabled={!file || uploading}
                    >
                      <CIcon icon={cilCloudUpload} className="me-2" />
                      {uploading ? 'Import en cours...' : 'Lancer l\'analyse'}
                    </CButton>
                  </CCol>
                </CRow>

                {uploading && (
                  <CRow className="mt-3">
                    <CCol md={12}>
                      <CProgress value={uploadProgress} className="mb-2" height={20}>
                        <span className="fw-semibold">{uploadProgress}%</span>
                      </CProgress>
                    </CCol>
                  </CRow>
                )}
              </CForm>
            </div>

            {/* Messages feedback */}
            {error && (
              <CAlert color="danger" className="d-flex align-items-center">
                <CIcon icon={cilWarning} size="xl" className="me-3" />
                <div>
                  <strong>Erreur d'importation</strong>
                  <div className="mt-1">{error}</div>
                </div>
              </CAlert>
            )}

            {success && (
              <CAlert color="success" className="border-0 shadow-sm">
                <div className="d-flex align-items-center mb-3">
                  <CIcon icon={cilCheckCircle} size="xl" className="text-success me-3" />
                  <div>
                    <h5 className="mb-0">Import réussi !</h5>
                    <p className="mb-0 text-muted">{success.message}</p>
                  </div>
                </div>

                <CRow className="g-3 mb-3">
                  <CCol xs={6} md={2}>
                    <div className="text-center p-3 bg-white rounded">
                      <div className="fs-3 fw-bold text-primary">{success.nb_machines}</div>
                      <div className="text-muted small">Machines</div>
                    </div>
                  </CCol>
                  <CCol xs={6} md={2}>
                    <div className="text-center p-3 bg-white rounded">
                      <div className="fs-3 fw-bold text-danger">{success.nb_pannes}</div>
                      <div className="text-muted small">Pannes</div>
                    </div>
                  </CCol>
                  <CCol xs={4} md={2}>
                    <div className="text-center p-3 bg-white rounded">
                      <div className="fs-3 fw-bold text-info">{success.kpi.mttr}h</div>
                      <div className="text-muted small">MTTR</div>
                    </div>
                  </CCol>
                  <CCol xs={4} md={2}>
                    <div className="text-center p-3 bg-white rounded">
                      <div className="fs-3 fw-bold text-success">{success.kpi.mtbf}h</div>
                      <div className="text-muted small">MTBF</div>
                    </div>
                  </CCol>
                  <CCol xs={4} md={2}>
                    <div className="text-center p-3 bg-white rounded">
                      <div className="fs-3 fw-bold text-warning">{success.kpi.trs}%</div>
                      <div className="text-muted small">TRS</div>
                    </div>
                  </CCol>
                </CRow>

                <CButton color="success" size="lg" href="/#/dashboard">
                  <i className="bi bi-speedometer2 me-2"></i>
                  Voir le tableau de bord
                </CButton>
              </CAlert>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default ImportExcel
