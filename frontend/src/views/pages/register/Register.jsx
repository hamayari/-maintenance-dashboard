import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CRow,
  CAlert,
  CSpinner,
  CFormSelect,
} from '@coreui/react'
import axios from 'axios'
import logoImage from '../../../assets/images/maz.tn.jpg'

const API_URL = 'http://localhost:5000/api'

const Register = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'technicien',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setLoading(false)
      return
    }

    try {
      await axios.post(`${API_URL}/auth/register`, {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      })
      
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 2000)
      
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f0f2f5' }}>
      <CContainer fluid className="p-0">
        <CRow className="g-0" style={{ minHeight: '100vh' }}>
          {/* Partie gauche - Logo MAZ en haute résolution */}
          <CCol lg={6} className="d-none d-lg-flex align-items-center justify-content-center" 
                style={{ 
                  background: '#ffffff',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
            {/* Logo MAZ centré et en haute qualité */}
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
              background: 'linear-gradient(135deg, #e0f7fa 0%, #80deea 100%)'
            }}>
              <img 
                src={logoImage} 
                alt="MAZ Logo" 
                style={{ 
                  maxWidth: '90%',
                  maxHeight: '90%',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  imageRendering: '-webkit-optimize-contrast',
                  imageRendering: 'crisp-edges',
                  filter: 'contrast(1.1) brightness(1.05)',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                  borderRadius: '20px'
                }} 
              />
            </div>
          </CCol>

          {/* Partie droite - Formulaire */}
          <CCol lg={6} className="d-flex align-items-center justify-content-center" style={{ background: 'white' }}>
            <div style={{ width: '100%', maxWidth: '480px', padding: '40px' }}>
              <div className="mb-4">
                <h2 className="fw-bold mb-2" style={{ fontSize: '2rem', color: '#333' }}>
                  Créer un compte
                </h2>
                <p className="text-muted" style={{ fontSize: '1rem' }}>
                  Remplissez le formulaire pour vous inscrire
                </p>
              </div>

              {error && (
                <CAlert color="danger" dismissible onClose={() => setError(null)} className="mb-4">
                  {error}
                </CAlert>
              )}

              {success && (
                <CAlert color="success" className="mb-4">
                  <i className="bi bi-check-circle me-2"></i>
                  Inscription réussie! Redirection...
                </CAlert>
              )}

              <CForm onSubmit={handleSubmit}>
                <CRow className="mb-3">
                  <CCol md={6}>
                    <label className="form-label fw-semibold" style={{ color: '#555', fontSize: '0.95rem' }}>
                      Nom *
                    </label>
                    <CFormInput
                      type="text"
                      name="nom"
                      placeholder="Nom"
                      value={formData.nom}
                      onChange={handleChange}
                      required
                      style={{
                        padding: '12px 16px',
                        fontSize: '1rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px'
                      }}
                    />
                  </CCol>
                  <CCol md={6}>
                    <label className="form-label fw-semibold" style={{ color: '#555', fontSize: '0.95rem' }}>
                      Prénom *
                    </label>
                    <CFormInput
                      type="text"
                      name="prenom"
                      placeholder="Prénom"
                      value={formData.prenom}
                      onChange={handleChange}
                      required
                      style={{
                        padding: '12px 16px',
                        fontSize: '1rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px'
                      }}
                    />
                  </CCol>
                </CRow>

                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ color: '#555', fontSize: '0.95rem' }}>
                    Email *
                  </label>
                  <CFormInput
                    type="email"
                    name="email"
                    placeholder="votreemail@example.tn"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{
                      padding: '12px 16px',
                      fontSize: '1rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px'
                    }}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ color: '#555', fontSize: '0.95rem' }}>
                    Rôle *
                  </label>
                  <CFormSelect
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    style={{
                      padding: '12px 16px',
                      fontSize: '1rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px'
                    }}
                  >
                    <option value="technicien">Technicien</option>
                    <option value="superviseur">Superviseur</option>
                    <option value="admin">Administrateur</option>
                  </CFormSelect>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ color: '#555', fontSize: '0.95rem' }}>
                    Mot de passe *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <CFormInput
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Minimum 6 caractères"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      style={{
                        padding: '12px 16px',
                        paddingRight: '45px',
                        fontSize: '1rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#999',
                        fontSize: '1.2rem'
                      }}
                    >
                      <i className={showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'}></i>
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold" style={{ color: '#555', fontSize: '0.95rem' }}>
                    Confirmer le mot de passe *
                  </label>
                  <CFormInput
                    type="password"
                    name="confirmPassword"
                    placeholder="Retapez votre mot de passe"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    style={{
                      padding: '12px 16px',
                      fontSize: '1rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px'
                    }}
                  />
                </div>

                <CButton
                  type="submit"
                  disabled={loading || success}
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    transition: 'transform 0.2s',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  {loading ? (
                    <>
                      <CSpinner size="sm" className="me-2" />
                      Inscription en cours...
                    </>
                  ) : (
                    'Créer mon compte'
                  )}
                </CButton>

                <div className="text-center mt-4">
                  <span style={{ color: '#666', fontSize: '0.95rem' }}>
                    Vous avez déjà un compte ?{' '}
                  </span>
                  <Link 
                    to="/login" 
                    style={{ 
                      color: '#11998e', 
                      textDecoration: 'none',
                      fontWeight: '600',
                      fontSize: '0.95rem'
                    }}
                  >
                    Se connecter
                  </Link>
                </div>
              </CForm>

              <div className="text-center mt-5">
                <p className="text-muted small mb-0">
                  © 2024 Système de Maintenance Industrielle
                </p>
              </div>
            </div>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Register
