import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CAlert,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilEnvelopeClosed } from '@coreui/icons'
import axios from 'axios'
import logoImage from '../../../assets/images/maz.tn.jpg'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'envoi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-light min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol lg={10} xl={8}>
            <CCard className="border-0 shadow-lg" style={{ overflow: 'hidden' }}>
              <CRow className="g-0">
                {/* Partie gauche - Image */}
                <CCol md={6} className="d-none d-md-block position-relative">
                  <div
                    style={{
                      backgroundImage: `url(${logoImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      height: '100%',
                      minHeight: '500px',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.9) 0%, rgba(255, 152, 0, 0.8) 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '40px',
                        color: 'white',
                      }}
                    >
                      <div className="text-center">
                        <div className="mb-4">
                          <i className="bi bi-key fs-1"></i>
                        </div>
                        <h2 className="fw-bold mb-3">Mot de passe oublié?</h2>
                        <p className="lead mb-4">
                          Pas de problème! Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                        </p>
                        <div className="text-start">
                          <p className="mb-2">
                            <i className="bi bi-check2 me-2"></i>
                            Processus sécurisé
                          </p>
                          <p className="mb-2">
                            <i className="bi bi-check2 me-2"></i>
                            Lien valide 24h
                          </p>
                          <p className="mb-0">
                            <i className="bi bi-check2 me-2"></i>
                            Support disponible
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CCol>

                {/* Partie droite - Formulaire */}
                <CCol md={6}>
                  <CCardBody className="p-5">
                    <div className="text-center mb-4">
                      <div className="mb-3">
                        <i className="bi bi-lock-fill text-warning" style={{ fontSize: '3rem' }}></i>
                      </div>
                      <h2 className="fw-bold text-warning mb-2">Réinitialisation</h2>
                      <p className="text-muted">Récupérez l'accès à votre compte</p>
                    </div>

                    {error && (
                      <CAlert color="danger" dismissible onClose={() => setError(null)}>
                        {error}
                      </CAlert>
                    )}

                    {success ? (
                      <div>
                        <CAlert color="success">
                          <div className="d-flex align-items-center mb-3">
                            <i className="bi bi-check-circle fs-3 me-3"></i>
                            <div>
                              <h5 className="mb-1">Email envoyé!</h5>
                              <p className="mb-0">
                                Vérifiez votre boîte de réception et suivez les instructions pour réinitialiser votre mot de passe.
                              </p>
                            </div>
                          </div>
                        </CAlert>

                        <div className="text-center mt-4">
                          <p className="text-muted small mb-3">
                            Vous n'avez pas reçu l'email?
                          </p>
                          <CButton
                            color="light"
                            className="me-2"
                            onClick={() => setSuccess(false)}
                          >
                            Renvoyer
                          </CButton>
                          <Link to="/login">
                            <CButton color="primary">
                              Retour à la connexion
                            </CButton>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <CForm onSubmit={handleSubmit}>
                        <div className="mb-4">
                          <label className="form-label text-muted small mb-2">
                            Adresse email
                          </label>
                          <CInputGroup>
                            <CInputGroupText className="bg-light border-end-0">
                              <CIcon icon={cilEnvelopeClosed} />
                            </CInputGroupText>
                            <CFormInput
                              type="email"
                              placeholder="votre@email.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              className="border-start-0 ps-0"
                            />
                          </CInputGroup>
                          <small className="text-muted">
                            Entrez l'email associé à votre compte
                          </small>
                        </div>

                        <CButton
                          color="warning"
                          className="w-100 py-2 mb-3 text-white"
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <CSpinner size="sm" className="me-2" />
                              Envoi en cours...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-envelope me-2"></i>
                              Envoyer le lien de réinitialisation
                            </>
                          )}
                        </CButton>

                        <div className="text-center">
                          <Link to="/login" className="text-decoration-none">
                            <i className="bi bi-arrow-left me-2"></i>
                            Retour à la connexion
                          </Link>
                        </div>
                      </CForm>
                    )}

                    <hr className="my-4" />

                    <div className="text-center">
                      <p className="text-muted small mb-2">Besoin d'aide?</p>
                      <p className="text-muted small mb-0">
                        Contactez le support: support@maintenance.com
                      </p>
                    </div>
                  </CCardBody>
                </CCol>
              </CRow>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default ForgotPassword
