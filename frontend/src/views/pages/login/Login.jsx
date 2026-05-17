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
  CFormCheck,
} from '@coreui/react'
import axios from 'axios'
import logoImage from '../../../assets/images/maz.tn.jpg'

const API_URL = 'http://localhost:5000/api'

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
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

    try {
      const response = await axios.post(`${API_URL}/auth/login`, formData)
      
      localStorage.setItem('token', response.data.access_token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      
      // Rediriger vers le dashboard
      navigate('/dashboard', { replace: true })
      
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f5f5f5' }}>
      <CContainer fluid className="p-0">
        <CRow className="g-0" style={{ minHeight: '100vh' }}>
          {/* Partie gauche - Design professionnel et informatif */}
          <CCol lg={6} className="d-none d-lg-flex align-items-center justify-content-center" 
                style={{ 
                  background: 'linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 100%)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
            
            {/* Motif de fond subtil */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
                               radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)`,
              opacity: 0.6
            }}></div>

            {/* Contenu principal */}
            <div style={{ 
              position: 'relative', 
              zIndex: 1,
              padding: '60px',
              maxWidth: '550px',
              color: '#1e293b'
            }}>
              
              {/* Logo */}
              <div className="mb-4" style={{ textAlign: 'center' }}>
                <div style={{
                  display: 'inline-block',
                  padding: '30px',
                  background: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                  width: '100%',
                  maxWidth: '400px'
                }}>
                  <img 
                    src={logoImage} 
                    alt="المزرعة Logo" 
                    style={{ 
                      width: '100%',
                      height: 'auto',
                      objectFit: 'contain',
                      imageRendering: '-webkit-optimize-contrast'
                    }} 
                  />
                </div>
              </div>

              {/* Titre principal */}
              <h1 style={{
                fontSize: '2.2rem',
                fontWeight: '700',
                marginBottom: '15px',
                lineHeight: '1.2',
                textAlign: 'center',
                color: '#1e293b'
              }}>
                Système de Gestion de Maintenance
              </h1>

              {/* Sous-titre métier */}
              <p style={{
                fontSize: '1.15rem',
                color: '#475569',
                marginBottom: '25px',
                textAlign: 'center',
                fontWeight: '400'
              }}>
                Suivi des performances des équipements industriels
              </p>

              {/* Séparateur */}
              <div style={{
                width: '60px',
                height: '3px',
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                margin: '30px auto',
                borderRadius: '2px'
              }}></div>

              {/* Description métier */}
              <p style={{
                fontSize: '1.05rem',
                lineHeight: '1.7',
                color: '#334155',
                marginBottom: '35px',
                textAlign: 'center'
              }}>
                Analysez vos pannes, optimisez vos interventions et améliorez la performance de vos machines
              </p>

              {/* Points clés avec icônes */}
              <div style={{ marginTop: '40px' }}>
                {/* Point 1 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  marginBottom: '20px',
                  padding: '15px',
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: '12px',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                }}>
                  <div style={{
                    width: '45px',
                    height: '45px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '15px',
                    flexShrink: 0,
                    color: 'white'
                  }}>
                    <i className="bi bi-graph-up-arrow" style={{ fontSize: '1.3rem' }}></i>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '5px', color: '#1e293b' }}>
                      Suivi des KPI en temps réel
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                      MTTR, MTBF, TRS et indicateurs personnalisés
                    </div>
                  </div>
                </div>

                {/* Point 2 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  marginBottom: '20px',
                  padding: '15px',
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: '12px',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                }}>
                  <div style={{
                    width: '45px',
                    height: '45px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '15px',
                    flexShrink: 0,
                    color: 'white'
                  }}>
                    <i className="bi bi-exclamation-triangle" style={{ fontSize: '1.3rem' }}></i>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '5px', color: '#1e293b' }}>
                      Détection des anomalies
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                      Alertes intelligentes et notifications proactives
                    </div>
                  </div>
                </div>

                {/* Point 3 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  padding: '15px',
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: '12px',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                }}>
                  <div style={{
                    width: '45px',
                    height: '45px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '15px',
                    flexShrink: 0,
                    color: 'white'
                  }}>
                    <i className="bi bi-lightbulb" style={{ fontSize: '1.3rem' }}></i>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '5px', color: '#1e293b' }}>
                      Aide à la décision
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                      Rapports automatisés et recommandations
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer info */}
              <div style={{
                marginTop: '40px',
                padding: '20px',
                background: 'rgba(99, 102, 241, 0.15)',
                borderRadius: '12px',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.9rem', color: '#475569', fontWeight: '500' }}>
                  <i className="bi bi-shield-check me-2"></i>
                  Plateforme sécurisée et conforme aux standards industriels
                </div>
              </div>
            </div>
          </CCol>

          {/* Partie droite - Formulaire */}
          <CCol lg={6} className="d-flex align-items-center justify-content-center" style={{ background: 'white' }}>
            <div style={{ width: '100%', maxWidth: '450px', padding: '40px' }}>
              {/* Titre du formulaire */}
              <div className="mb-5">
                <h2 className="fw-bold mb-2" style={{ fontSize: '1.8rem', color: '#333' }}>
                  S'identifier
                </h2>
                <p className="text-muted" style={{ fontSize: '0.95rem' }}>
                  Connectez-vous à votre compte Maintenance
                </p>
              </div>

              {/* Message d'erreur */}
              {error && (
                <CAlert color="danger" dismissible onClose={() => setError(null)} className="mb-4">
                  {error}
                </CAlert>
              )}

              {/* Formulaire */}
              <CForm onSubmit={handleSubmit}>
                {/* Email */}
                <div className="mb-4">
                  <label className="form-label" style={{ color: '#555', fontSize: '0.9rem', fontWeight: '500' }}>
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
                      fontSize: '0.95rem',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      background: '#f8f9fa'
                    }}
                  />
                </div>

                {/* Mot de passe */}
                <div className="mb-4">
                  <label className="form-label" style={{ color: '#555', fontSize: '0.9rem', fontWeight: '500' }}>
                    Mot de passe *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <CFormInput
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Maryem123*"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      style={{
                        padding: '12px 16px',
                        paddingRight: '45px',
                        fontSize: '0.95rem',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        background: '#f8f9fa'
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
                        fontSize: '1.1rem'
                      }}
                    >
                      <i className={showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'}></i>
                    </button>
                  </div>
                </div>

                {/* Se souvenir / Mot de passe oublié */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <CFormCheck 
                    id="rememberMe" 
                    label="Se souvenir de moi"
                    style={{ fontSize: '0.9rem', color: '#666' }}
                  />
                  <Link 
                    to="/forgot-password" 
                    style={{ 
                      color: '#6366f1', 
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>

                {/* Bouton de connexion */}
                <CButton
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '13px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    transition: 'all 0.2s',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  {loading ? (
                    <>
                      <CSpinner size="sm" className="me-2" />
                      Connexion en cours...
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </CButton>

                {/* Lien vers inscription */}
                <div className="text-center mt-4">
                  <span style={{ color: '#666', fontSize: '0.9rem' }}>
                    Vous n'avez pas de compte ?{' '}
                  </span>
                  <Link 
                    to="/register" 
                    style={{ 
                      color: '#6366f1', 
                      textDecoration: 'none',
                      fontWeight: '600',
                      fontSize: '0.9rem'
                    }}
                  >
                    Créer un compte
                  </Link>
                </div>
              </CForm>

              {/* Footer */}
              <div className="text-center mt-5">
                <p className="text-muted small mb-0" style={{ fontSize: '0.85rem' }}>
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

export default Login
