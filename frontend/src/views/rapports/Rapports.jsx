import React, { useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilFile, cilCloudDownload } from '@coreui/icons'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const Rapports = () => {
  const [loading, setLoading] = useState({ pdf: false, excel: false })
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  const downloadPDF = async () => {
    try {
      setLoading({ ...loading, pdf: true })
      setError(null)
      setSuccess(null)

      const response = await axios.get(`${API_URL}/reports/pdf`, {
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `rapport_maintenance_${new Date().getTime()}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      setSuccess('Rapport PDF téléchargé avec succès')
    } catch (err) {
      setError('Erreur lors de la génération du rapport PDF. Assurez-vous d\'avoir importé des données.')
    } finally {
      setLoading({ ...loading, pdf: false })
    }
  }

  const downloadExcel = async () => {
    try {
      setLoading({ ...loading, excel: true })
      setError(null)
      setSuccess(null)

      const response = await axios.get(`${API_URL}/reports/excel`, {
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `rapport_maintenance_${new Date().getTime()}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      setSuccess('Rapport Excel téléchargé avec succès')
    } catch (err) {
      setError('Erreur lors de la génération du rapport Excel. Assurez-vous d\'avoir importé des données.')
    } finally {
      setLoading({ ...loading, excel: false })
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="border-0 shadow-sm">
          <CCardHeader className="bg-white">
            <h4 className="mb-0">
              <CIcon icon={cilFile} className="me-2" />
              Génération de Rapports
            </h4>
          </CCardHeader>
          <CCardBody>
            <p className="text-muted mb-4">
              Exportez vos données de maintenance sous forme de rapports PDF ou Excel pour analyse et archivage
            </p>

            {/* Messages */}
            {error && (
              <CAlert color="danger" dismissible onClose={() => setError(null)}>
                {error}
              </CAlert>
            )}

            {success && (
              <CAlert color="success" dismissible onClose={() => setSuccess(null)}>
                <i className="bi bi-check-circle me-2"></i>
                {success}
              </CAlert>
            )}

            {/* Options de rapport */}
            <CRow className="g-4">
              {/* Rapport PDF */}
              <CCol md={6}>
                <CCard className="border h-100">
                  <CCardBody className="text-center p-4">
                    <div
                      className="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ width: '80px', height: '80px' }}
                    >
                      <i className="bi bi-file-pdf fs-1 text-danger"></i>
                    </div>
                    <h5 className="mb-3">Rapport PDF</h5>
                    <p className="text-muted mb-4">
                      Rapport complet avec KPI, liste des machines et statistiques au format PDF
                    </p>
                    <ul className="text-start text-muted small mb-4">
                      <li>Indicateurs clés de performance</li>
                      <li>Liste détaillée des machines</li>
                      <li>Statistiques de pannes</li>
                      <li>Mise en page professionnelle</li>
                    </ul>
                    <CButton
                      color="danger"
                      size="lg"
                      className="w-100"
                      onClick={downloadPDF}
                      disabled={loading.pdf}
                    >
                      {loading.pdf ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Génération en cours...
                        </>
                      ) : (
                        <>
                          <CIcon icon={cilCloudDownload} className="me-2" />
                          Télécharger PDF
                        </>
                      )}
                    </CButton>
                  </CCardBody>
                </CCard>
              </CCol>

              {/* Rapport Excel */}
              <CCol md={6}>
                <CCard className="border h-100">
                  <CCardBody className="text-center p-4">
                    <div
                      className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ width: '80px', height: '80px' }}
                    >
                      <i className="bi bi-file-earmark-excel fs-1 text-success"></i>
                    </div>
                    <h5 className="mb-3">Rapport Excel</h5>
                    <p className="text-muted mb-4">
                      Données brutes exportées dans un fichier Excel pour analyse approfondie
                    </p>
                    <ul className="text-start text-muted small mb-4">
                      <li>Feuille KPI avec tous les indicateurs</li>
                      <li>Feuille Machines complète</li>
                      <li>Feuille Pannes détaillée</li>
                      <li>Feuille Statistiques par machine</li>
                    </ul>
                    <CButton
                      color="success"
                      size="lg"
                      className="w-100"
                      onClick={downloadExcel}
                      disabled={loading.excel}
                    >
                      {loading.excel ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Génération en cours...
                        </>
                      ) : (
                        <>
                          <CIcon icon={cilCloudDownload} className="me-2" />
                          Télécharger Excel
                        </>
                      )}
                    </CButton>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>

            {/* Info supplémentaire */}
            <CAlert color="info" className="mt-4 mb-0">
              <h6 className="alert-heading">
                <i className="bi bi-info-circle me-2"></i>
                Informations
              </h6>
              <ul className="mb-0 small">
                <li>Les rapports sont générés à partir des données actuellement importées</li>
                <li>Le nom du fichier inclut la date et l'heure de génération</li>
                <li>Les rapports peuvent être utilisés pour archivage ou présentation</li>
              </ul>
            </CAlert>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Rapports
